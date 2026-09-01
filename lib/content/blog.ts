import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { cache } from "react";

import rehypeShiki from "@shikijs/rehype";
import type { ThemeRegistration } from "shiki";

// shiki 번들에는 tokyo-night(다크)만 있고 라이트 짝이 없어서 원본 VS Code
// 테마에서 직접 가져왔다. 출처·라이선스·가져오며 손본 곳은
// lib/content/themes/README.md 참고.
import tokyoNightLight from "@/lib/content/themes/tokyo-night-light.json";
import matter from "gray-matter";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";

import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

// 카테고리는 큰 축(한 글에 하나), 태그는 세부 축(한 글에 여럿)이다. 이
// 구분이 흐려지면 사이드바가 태그 수십 개짜리 목록으로 무너진다 — velog가
// 카테고리를 두지 않아서 실제로 겪는 문제다. 그래서 카테고리는 여기 상수로
// 고정하고, 태그만 글에서 자유롭게 늘어나게 둔다.
//
// key가 곧 URL(`/blog/category/study`)이라 한번 정하면 바꿀 때 링크가 깨진다.
// 라벨은 로케일마다 달라서 여기 두지 않고 dictionaries.ts의 blog.categories가
// 갖는다 — key만 이 파일의 몫이다.
export const blogCategories = [
  "language",
  "dev",
  "reading",
  "daily",
  "think",
] as const;

export type BlogCategory = (typeof blogCategories)[number];

const categoryKeys = blogCategories as readonly string[];

export function categoryLabel(key: BlogCategory, locale: Locale): string {
  return getDictionary(locale).blog.categories[key];
}

export type BlogPost = {
  slug: string;
  title: string;
  /** ISO 날짜 문자열(YYYY-MM-DD). 정렬과 표시 양쪽에 쓴다. */
  date: string;
  category: BlogCategory;
  tags: string[];
  summary: string;
  /** 목록 썸네일. frontmatter의 cover가 없으면 본문 첫 이미지를 쓴다. */
  cover?: string;
  draft: boolean;
};

const BLOG_DIR = path.join(process.cwd(), "content/blog");

// 초고는 저장소에 두되 배포에는 내보내지 않는다. dev에서는 보이고 `next
// build`에서만 빠지므로, 쓰는 중인 글을 미리보는 것과 공개 시점을
// frontmatter 한 줄(draft)로 가른다.
const includeDrafts = process.env.NODE_ENV !== "production";

// 표시할 상자 크기(2배 폭). scripts/build-blog-images.mjs의 VARIANTS와 같은
// 값이어야 한다 — 두 곳에 적혀 있지만, 어긋나면 아래 existsSync가 걸러서 원본을
// 그대로 쓰게 되므로 이미지가 깨지지는 않는다.
const IMAGE_VARIANTS = { thumb: 480, body: 1280 } as const;

/**
 * 빌드 때 구워 둔 16:9 파생 이미지 경로. 없으면 원본을 그대로 돌려준다.
 *
 * 정적 export라 next/image의 최적화가 없어서, 표시 크기와 무관하게 원본이
 * 통째로 나간다. 그래서 파일 자체를 상자에 맞춰 미리 굽고 여기서 그쪽을
 * 가리킨다(자세한 배경은 scripts/build-blog-images.mjs).
 */
export function blogImage(
  src: string | undefined,
  variant: keyof typeof IMAGE_VARIANTS,
): string | undefined {
  if (!src || !src.startsWith("/") || src.startsWith("/_blog/")) return src;
  const key = src.replace(/^\//, "").replace(/\.[^.]+$/, "").replace(/\//g, "__");
  const candidate = `/_blog/${key}-${IMAGE_VARIANTS[variant]}.webp`;
  return existsSync(path.join(process.cwd(), "public", candidate))
    ? candidate
    : src;
}

// 목록 썸네일로 쓸 이미지를 고른다. frontmatter에 cover를 적으면 그것을 쓰고,
// 없으면 본문의 첫 이미지를 가져온다 — "글에 이미지가 있으면 목록에도 보인다"가
// 기본 동작이고, 다른 그림을 내세우고 싶을 때만 cover를 적는다.
//
// raw HTML은 파이프라인에서 통과시키지 않으므로 마크다운 문법만 본다.
function findCover(data: Record<string, unknown>, body: string): string | undefined {
  if (typeof data.cover === "string" && data.cover.trim()) return data.cover.trim();
  return body.match(/!\[[^\]]*\]\(\s*(\S+?)\s*(?:"[^"]*")?\s*\)/)?.[1];
}

// 태그는 자유 문자열이라 그대로 URL에 넣을 수 없다. 공백·슬래시는 물론
// 점도 하이픈으로 바꾼다 — "Next.js"를 그대로 두면 next.js가 되고, Next가
// 확장자 있는 파일 경로로 보고 trailingSlash 설정을 무시한 채 리다이렉트한다
// (실제로 /blog/tag/next.js/ 가 308로 튕겼다).
export function tagSlug(tag: string): string {
  return tag.trim().toLowerCase().replace(/[\s/.]+/g, "-");
}

// frontmatter는 YAML이라 따옴표 없는 값 안의 ": "가 키/값 구분으로 읽힌다
// (summary에 "output: export"를 그냥 적었다가 실제로 여기서 터졌다). 그대로
// 두면 파서가 뱉는 줄/열 번호만 남아 어느 파일인지조차 안 나오므로, 파일
// 이름과 흔한 원인을 붙여서 다시 던진다.
function readFrontmatter(fileName: string) {
  const raw = readFileSync(path.join(BLOG_DIR, fileName), "utf8");
  try {
    return matter(raw);
  } catch (error) {
    throw new Error(
      `content/blog/${fileName}: frontmatter를 읽을 수 없습니다. 값에 콜론이나 #이 들어가면 따옴표로 감싸야 합니다.\n${(error as Error).message}`,
    );
  }
}

// ko 원문은 `<slug>.md`, 번역은 `<slug>.<locale>.md`로 나란히 둔다. 번역이 없는
// 글은 그 로케일의 목록에 그냥 나타나지 않는다 — 한국어 조각과 번역 조각이
// 섞여 보이는 것보다, 아직 없는 편이 낫다.
function fileNameForSlug(slug: string, locale: Locale): string {
  return locale === "ko" ? `${slug}.md` : `${slug}.${locale}.md`;
}

function matchesLocale(fileName: string, locale: Locale): boolean {
  return locale === "ko"
    ? /\.md$/.test(fileName) && !/\.en\.md$/.test(fileName)
    : fileName.endsWith(`.${locale}.md`);
}

function slugFromFileName(fileName: string, locale: Locale): string {
  return locale === "ko"
    ? fileName.replace(/\.md$/, "")
    : fileName.replace(`.${locale}.md`, "");
}

function parsePost(fileName: string, locale: Locale): BlogPost | null {
  const { data, content } = readFrontmatter(fileName);
  const slug = slugFromFileName(fileName, locale);

  // `/blog/category/...`, `/blog/tag/...`와 같은 자리를 두고 다투는 이름은
  // 미리 막는다. 정적 세그먼트가 이기므로 이런 글은 조용히 접근 불가가 된다.
  if (slug === "category" || slug === "tag") {
    throw new Error(
      `content/blog/${fileName}: '${slug}'는 분류 라우트가 쓰는 이름이라 파일 이름으로 쓸 수 없습니다`,
    );
  }

  const category = String(data.category ?? "");
  if (!categoryKeys.includes(category)) {
    throw new Error(
      `content/blog/${fileName}: category가 ${categoryKeys.join(" | ")} 중 하나여야 합니다 (받은 값: ${category || "없음"})`,
    );
  }
  if (!data.title || !data.date) {
    throw new Error(`content/blog/${fileName}: title과 date는 필수입니다`);
  }

  return {
    slug,
    title: String(data.title),
    // gray-matter가 YAML 날짜를 Date로 파싱해 주므로 문자열로 되돌린다.
    date:
      data.date instanceof Date
        ? data.date.toISOString().slice(0, 10)
        : String(data.date),
    category: category as BlogCategory,
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    summary: String(data.summary ?? ""),
    cover: blogImage(findCover(data, content), "thumb"),
    draft: data.draft === true,
  };
}

/**
 * 모든 글의 메타데이터를 최신순으로. 본문 HTML은 여기서 굽지 않는다 —
 * 목록 페이지는 frontmatter만 있으면 되고, 마크다운 변환은 상세 페이지가
 * 자기 글 하나에 대해서만 하면 된다.
 */
// cache()로 감싸는 이유: 같은 빌드 패스 안에서 generateStaticParams·
// generateMetadata·페이지 컴포넌트가 각자 이 함수를 부른다. cache가 없으면
// 호출마다 디렉터리를 다시 읽고 글 전체를 다시 파싱한다.
export const getAllPosts = cache((locale: Locale = "ko"): BlogPost[] => {
  let fileNames: string[];
  try {
    fileNames = readdirSync(BLOG_DIR);
  } catch {
    // 아직 글이 하나도 없는 상태. 디렉터리가 없다고 빌드가 죽으면 안 된다.
    return [];
  }

  return fileNames
    .filter((name) => !name.startsWith("_") && matchesLocale(name, locale))
    .map((name) => parsePost(name, locale))
    .filter((post): post is BlogPost => post !== null)
    .filter((post) => includeDrafts || !post.draft)
    .sort((a, b) => b.date.localeCompare(a.date));
});

/** 상세 페이지용 본문 HTML. 빌드 타임에만 돌아서 클라이언트 번들과 무관하다. */
export async function getPostHtml(
  slug: string,
  locale: Locale = "ko",
): Promise<string> {
  const { content } = readFrontmatter(fileNameForSlug(slug, locale));
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    // 본문에 raw HTML을 허용하지 않는다. 글은 전부 내가 쓴 로컬 파일이지만,
    // 허용해 두면 마크다운으로 표현할 수 없는 조판이 슬금슬금 들어와
    // 파이프라인 밖에서 스타일이 갈라진다.
    .use(remarkRehype)
    // 코드 하이라이팅은 빌드 타임에 끝난다 — shiki가 토큰마다 색을 인라인
    // style로 박아 두므로 클라이언트에 하이라이터도, 테마 CSS도 안 실린다.
    //
    // 라이트/다크 두 벌을 함께 굽는다. shiki는 기본 테마 색을 style에 직접
    // 넣고 나머지 테마 색은 --shiki-dark 변수로 함께 실어 보내므로, 어느
    // 쪽을 쓸지는 CSS가 고른다(globals.css의 .dark .shiki 규칙). 테마
    // 토글이 클래스로 갈리는 이 사이트에서는 이 방식이라야 전환이 즉시
    // 반영된다 — prefers-color-scheme에 맡기면 토글과 어긋난다.
    //
    // 두 테마 모두 Tokyo Night 계열이라 라이트/다크를 오갈 때 색 이름이
    // 그대로 이어진다(키워드는 보라, 문자열은 초록 …).
    .use(rehypeBlogImages)
    .use(rehypeShiki, {
      themes: {
        // JSON import는 type을 string으로 추론한다. shiki는 "light" | "dark"만
        // 받으므로 좁혀 준다 — 값 자체는 그대로다.
        light: tokyoNightLight as ThemeRegistration,
        dark: "tokyo-night",
      },
      defaultColor: "light",
    })
    .use(rehypeSlug)
    .use(rehypeStringify)
    .process(content);
  return String(file);
}

/**
 * 공개된 글이 하나도 없을 때 generateStaticParams가 대신 내보내는 자리표시자.
 *
 * `output: 'export'`는 동적 라우트가 최소 한 개의 경로를 만들어 내기를
 * 요구한다 — 빈 배열을 돌려주면 "generateStaticParams가 없다"고 보고 빌드가
 * 멈춘다(next/dist/build/index.js의 prerenderedRoutes.length > 0 검사).
 * 그렇다고 초안을 공개해 버리면 자리표시자 글이 사이트에 나가므로, 대신
 * 아무 글도 가리키지 않는 slug 하나를 만들고 그 페이지에서 notFound()를
 * 부른다. 첫 글이 공개되는 순간 이 경로는 저절로 사라진다.
 */
export const EMPTY_ROUTE_PARAM = "__no-posts";

// 본문 이미지도 구워 둔 파생물을 가리키게 바꾼다. unist-util-visit을 새로
// 들이는 대신 직접 훑는다 — 찾는 노드가 img 하나뿐이라 그럴 값어치가 없다.
function rehypeBlogImages() {
  return (tree: unknown) => {
    const walk = (node: unknown): void => {
      if (!node || typeof node !== "object") return;
      const el = node as {
        type?: string;
        tagName?: string;
        properties?: { src?: unknown };
        children?: unknown[];
      };
      if (el.type === "element" && el.tagName === "img" && el.properties?.src) {
        el.properties.src = blogImage(String(el.properties.src), "body");
      }
      el.children?.forEach(walk);
    };
    walk(tree);
  };
}

export type TaxonomyCount = { key: string; label: string; count: number };

export function getCategoryCounts(
  posts: BlogPost[],
  locale: Locale,
): TaxonomyCount[] {
  return blogCategories
    .map((key) => ({
      key,
      label: categoryLabel(key, locale),
      count: posts.filter((p) => p.category === key).length,
    }))
    .filter((c) => c.count > 0);
}

/** 태그를 많이 쓴 순으로. 같은 개수면 이름순 — 목록 순서가 빌드마다 흔들리지 않게. */
export function getTagCounts(posts: BlogPost[]): TaxonomyCount[] {
  const counts = new Map<string, number>();
  for (const post of posts) {
    for (const tag of post.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([label, count]) => ({ key: tagSlug(label), label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

/** 목록·상세에 함께 쓰는 표시용 날짜. 2026.08.12 */
export function formatDate(date: string): string {
  return date.replaceAll("-", ".");
}
