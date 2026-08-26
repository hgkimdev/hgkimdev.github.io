import Link from "next/link";

import { categoryLabel, formatDate, type BlogPost } from "@/lib/content/blog";

// life-overlay.tsx·project-detail.tsx의 CHIP과 같은 생김새. 같은 값을 여기
// 다시 선언하는 편이 다른 파일의 로컬 상수를 끌어오는 결합보다 낫다.
const CHIP =
  "rounded-full bg-foreground/5 px-2 py-0.5 text-foreground/70 transition-colors hover:bg-foreground/10";

/** 메타 줄 맨 앞의 카테고리 표시. 점 색이 스크롤 중에도 축을 잡아준다. */
export function CategoryMark({
  category,
  className,
}: {
  category: BlogPost["category"];
  className?: string;
}) {
  return (
    <span className={className} style={{ color: `var(--cat-${category})` }}>
      <span className="mr-1.5 inline-block size-1.5 rounded-full bg-current align-middle" />
      {categoryLabel(category)}
    </span>
  );
}

/**
 * 목록 한 줄. 제목만 있는 행이 아니라 요약까지 보여주는 이유는 글 수가 적을
 * 때 화면 밀도를 채우고, 클릭 전에 내용을 판단할 수 있게 하기 위해서다.
 *
 * hover 연출은 Projects 목록과 같은 절제 — 왼쪽 여백과 제목 밑줄뿐이다.
 *
 * 글에 이미지가 있으면 왼쪽에 썸네일이 붙는다. 없는 글은 자리를 비워 두지
 * 않고 텍스트가 왼쪽 끝에서 시작한다 — 빈 회색 판을 채워 넣으면 이미지가
 * 있는 글보다 오히려 눈에 띈다.
 */
function BlogListItem({ post }: { post: BlogPost }) {
  return (
    <li className="border-t border-border/60 last:border-b">
      <Link
        href={`/blog/${post.slug}`}
        className="group flex gap-4 py-7 pl-0 transition-[padding-left] duration-200 hover:pl-2 focus-visible:pl-2 focus-visible:outline-none"
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
            // 상자는 4:3으로 고정하고 파일도 빌드 때 그 비율로 굽는다. 폭은
            // 옆 텍스트 블록 높이(약 140px)와 얼추 맞아떨어지게 잡았다 —
            // 16:9에 144px 폭이면 81px밖에 안 돼 아래가 59px 비었다.
            //
            // 세로 정렬을 self-center로 두는 이유는 모바일이다. 좁은 화면에서는
            // 제목이 두 줄로 접혀 텍스트 블록이 167px까지 자라는데, 4:3을
            // 유지하면서 거기까지 키우면 썸네일이 화면 폭의 절반을 넘는다.
            // 남는 자리를 위아래로 나누면 "아래가 비었다"로 읽히지 않는다.
            // (self-* 없이 두면 플렉스 자식이 stretch로 늘어나 aspect가 무시된다.)
            className="aspect-[4/3] w-28 shrink-0 self-center rounded-lg border border-border/60 object-cover sm:w-44"
          />
        ) : null}

        <span className="flex min-w-0 flex-1 flex-col gap-2">
          <span className="flex flex-wrap items-center gap-2 font-mono text-xs text-muted-foreground">
            <CategoryMark category={post.category} className="font-medium" />
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

export function BlogList({ posts }: { posts: BlogPost[] }) {
  if (posts.length === 0) {
    return (
      <p className="py-10 text-sm text-muted-foreground">
        아직 여기 쌓인 글이 없습니다.
      </p>
    );
  }

  return (
    <ul className="flex flex-col">
      {posts.map((post) => (
        <BlogListItem key={post.slug} post={post} />
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
