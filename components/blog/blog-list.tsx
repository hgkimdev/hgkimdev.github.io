import Link from "next/link";

import { categoryLabel, formatDate, type BlogPost } from "@/lib/content/blog";
import { localizeHref, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

// life-overlay.tsx·project-detail.tsx의 CHIP과 같은 생김새. 같은 값을 여기
// 다시 선언하는 편이 다른 파일의 로컬 상수를 끌어오는 결합보다 낫다.
const CHIP =
  "rounded-full bg-foreground/5 px-2 py-0.5 text-foreground/70 transition-colors hover:bg-foreground/10";

/** 메타 줄 맨 앞의 카테고리 표시. 점 색이 스크롤 중에도 축을 잡아준다. */
export function CategoryMark({
  category,
  locale,
  className,
}: {
  category: BlogPost["category"];
  locale: Locale;
  className?: string;
}) {
  return (
    <span className={className} style={{ color: `var(--cat-${category})` }}>
      <span className="mr-1.5 inline-block size-1.5 rounded-full bg-current align-middle" />
      {categoryLabel(category, locale)}
    </span>
  );
}

/**
 * 목록 한 줄. 제목만 있는 행이 아니라 요약까지 보여주는 이유는 글 수가 적을
 * 때 화면 밀도를 채우고, 클릭 전에 내용을 판단할 수 있게 하기 위해서다.
 *
 * hover 연출은 Projects 목록과 같은 절제 — 왼쪽 여백과 제목 밑줄뿐이다.
 *
 * 글에 이미지가 있으면 썸네일이 붙는다. 없는 글은 자리를 비워 두지 않고
 * 텍스트가 왼쪽 끝에서 시작한다 — 빈 회색 판을 채워 넣으면 이미지가 있는
 * 글보다 오히려 눈에 띈다.
 *
 * 모바일에서는 썸네일이 글 위에, sm 이상에서는 왼쪽에 붙는다. 좁은 화면에서
 * 옆으로 나란히 두면 텍스트 폭이 썸네일만큼 줄어드는데, 제목·요약이 두세
 * 줄로 접히는 모바일에서는 그 폭이 더 아쉽다.
 */
function BlogListItem({ post, locale }: { post: BlogPost; locale: Locale }) {
  return (
    <li className="border-t border-border/60 last:border-b">
      <Link
        href={localizeHref(`/blog/${post.slug}`, locale)}
        className="group flex flex-col gap-4 py-7 pl-0 transition-[padding-left] duration-200 hover:pl-2 focus-visible:pl-2 focus-visible:outline-none sm:flex-row"
      >
        {post.cover ? (
          // 정적 export라 이미지 최적화가 없다(images.unoptimized). next/image를
          // 써도 원본이 그대로 나가므로 life-entrance.tsx처럼 평범한 img를 쓴다.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.cover}
            alt=""
            aria-hidden
            loading="lazy"
            // 모바일은 글 위에 얹히는 배너라 폭 전체(w-full)에 16:9. sm부터는
            // 왼쪽 썸네일로 돌아가 4:3 고정 폭이 되고, 두 줄로 접힌 제목 옆에서
            // 위아래로 뜨지 않도록 self-center로 세로 중앙에 놓는다.
            className="aspect-video w-full rounded-lg border border-border/60 object-cover sm:aspect-[4/3] sm:w-44 sm:shrink-0 sm:self-center"
          />
        ) : null}

        <span className="flex min-w-0 flex-1 flex-col gap-2">
          <span className="flex flex-wrap items-center gap-2 font-mono text-xs text-muted-foreground">
            <CategoryMark
              category={post.category}
              locale={locale}
              className="font-medium"
            />
            <span className="text-foreground/25">·</span>
            {formatDate(post.date)}
          </span>

          <span className="text-xl leading-snug font-bold tracking-tight break-keep underline-offset-[3px] decoration-foreground/25 group-hover:underline group-focus-visible:underline">
            {post.title}
          </span>

          {post.summary ? (
            <p className="line-clamp-2 max-w-2xl leading-relaxed break-keep text-pretty text-muted-foreground">
              {post.summary}
            </p>
          ) : null}

          {post.tags.length > 0 ? (
            <span className="flex flex-wrap items-center gap-1.5 font-mono text-xs">
              {post.tags.map((tag) => (
                <span key={tag} className={CHIP}>
                  {tag}
                </span>
              ))}
            </span>
          ) : null}
        </span>
      </Link>
    </li>
  );
}

export function BlogList({
  posts,
  locale,
}: {
  posts: BlogPost[];
  locale: Locale;
}) {
  if (posts.length === 0) {
    return (
      <p className="py-10 text-sm text-muted-foreground">
        {getDictionary(locale).blog.empty}
      </p>
    );
  }

  return (
    <ul className="flex flex-col">
      {posts.map((post) => (
        <BlogListItem key={post.slug} post={post} locale={locale} />
      ))}
    </ul>
  );
}

/** 목록 페이지 껍데기. 제목 + 설명 아래에 사이드바와 본문을 나란히 놓는다. */
export function BlogShell({
  title,
  sidebar,
  children,
}: {
  title: React.ReactNode;
  sidebar: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    // data-zone-wide: 사이드바가 붙는 페이지라 <main>의 폭을 넓혀 달라는
    // 표시. globals.css의 main:has(...) 규칙이 읽는다.
    <div data-zone-wide className="flex flex-col gap-10 py-10 sm:py-16">
      <header>
        <h1 className="text-3xl font-bold tracking-tight break-keep sm:text-4xl">
          {title}
        </h1>
      </header>

      <div className="grid items-start gap-10 min-[900px]:grid-cols-[12.5rem_minmax(0,1fr)]">
        {sidebar}
        <div>{children}</div>
      </div>
    </div>
  );
}
