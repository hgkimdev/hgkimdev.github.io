import { projectGroups } from "@/content/projects";
import {
  blogCategories,
  getAllPosts,
  getTagCounts,
  postPageCount,
} from "@/lib/content/blog";
import { localizedPaths, type Locale } from "@/lib/i18n/config";

/**
 * 그 로케일에 실제로 페이지가 있는 경로 전부. 로케일 접두사는 뗀 형태다
 * (`/blog/foo`이지 `/en/blog/foo`가 아니다).
 *
 * 언어 스위처가 "지금 보는 페이지의 대응판이 저쪽에 있나"를 이 목록으로
 * 판단한다. 그래서 여기 규칙은 각 라우트의 generateStaticParams와 같아야
 * 한다 — 어긋나면 없는 주소로 보내게 되고, output: 'export'와
 * dynamicParams = false 조합이 그걸 에러로 만든다.
 *
 * 서버 전용이다(파일시스템을 읽는다). 레이아웃에서 불러 스위처에 내려준다.
 */
export function pathsInLocale(locale: Locale): string[] {
  const posts = getAllPosts(locale);
  const paths: string[] = [...localizedPaths];

  // 글 상세는 그 로케일에 파일이 있는 글만 — 번역이 없으면 라우트가 없다.
  for (const post of posts) paths.push(`/blog/${post.slug}`);

  // 카테고리는 글이 한 편도 없어도 라우트가 나온다(blogCategories를 통째로
  // 내보낸다). 그래서 언제나 대응판이 있다.
  for (const key of blogCategories) paths.push(`/blog/category/${key}`);

  // 태그는 반대로 그 로케일 글에 실제로 붙은 것만 생긴다.
  for (const tag of getTagCounts(posts)) paths.push(`/blog/tag/${tag.key}`);

  // 페이지네이션은 2쪽부터다 — 1쪽은 /blog 자신이라 따로 라우트가 없다.
  for (let page = 2; page <= postPageCount(posts); page += 1) {
    paths.push(`/blog/page/${page}`);
  }

  // 프로젝트 상세의 slug는 언어를 타지 않아서 모든 로케일에 다 있다.
  for (const group of projectGroups) paths.push(`/projects/${group.key}`);

  return paths;
}
