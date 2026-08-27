import Link from "next/link";

import { CategoryMark } from "@/components/blog/blog-list";
import { GiscusComments } from "@/components/blog/giscus-comments";
import { PostPager } from "@/components/blog/post-pager";
import { ReadingProgress } from "@/components/blog/reading-progress";
import { formatDate, tagSlug, type BlogPost } from "@/lib/content/blog";
import { localizeHref, type Locale } from "@/lib/i18n/config";

const CHIP =
  "rounded-full bg-foreground/5 px-2 py-0.5 text-foreground/70 transition-colors hover:bg-foreground/10";

/**
 * `/blog/[slug]` 본문. project-detail.tsx의 골격을 물려받되, 글을 읽는
 * 화면이라 상단의 읽기 진행바, 다른 글로 건너뛰는 목록, 아래쪽 댓글이 붙는다.
 *
 * Projects와 달리 "← Blog" 백링크는 없다. 헤더의 `hgkim /blog`가 이미 Blog
 * 첫 화면으로 가는 링크라 같은 일을 하는 것이 한 화면에 둘이었다.
 *
 * 다음 글로 넘어가는 길은 상단 목록 하나로 모았다. Projects의 이전/다음
 * 링크는 항목이 셋으로 고정된 순환이라 뜻이 통하지만, 계속 쌓이는 블로그에서
 * "이전 글"은 그냥 하루 먼저 쓴 글이라 이어서 읽을 이유가 없다.
 *
 * 사이드바는 없다. 목록은 훑는 화면이라 분류가 상시 보여야 하지만, 여기는
 * 한 편을 처음부터 끝까지 읽는 화면이라 본문 폭을 좁히는 편이 낫다.
 */
export function BlogPostView({
  post,
  html,
  allPosts,
  locale,
}: {
  post: BlogPost;
  html: string;
  allPosts: BlogPost[];
  locale: Locale;
}) {
  return (
    <div className="flex flex-col gap-10 py-10 sm:py-16">
      <ReadingProgress category={post.category} />

      <PostPager
        // 클라이언트로 넘어가는 값이라 목록에 필요한 두 필드만 추린다.
        posts={allPosts.map((p) => ({ slug: p.slug, title: p.title }))}
        currentSlug={post.slug}
        locale={locale}
      />

      <div className="flex flex-col gap-4">
        <h1 className="text-4xl font-bold tracking-tight break-keep sm:text-6xl">
          {post.title}
        </h1>

        <div className="flex flex-wrap items-center gap-2 font-mono text-sm text-muted-foreground">
          <Link
            href={localizeHref(`/blog/category/${post.category}`, locale)}
            className="font-medium"
          >
            <CategoryMark category={post.category} locale={locale} />
          </Link>
          <span className="text-foreground/25">·</span>
          {formatDate(post.date)}
          {post.tags.length > 0 ? (
            <>
              <span className="text-foreground/25">·</span>
              <span className="flex flex-wrap items-center gap-1.5 text-xs">
                {post.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={localizeHref(`/blog/tag/${tagSlug(tag)}`, locale)}
                    className={CHIP}
                  >
                    {tag}
                  </Link>
                ))}
              </span>
            </>
          ) : null}
        </div>
      </div>

      {/* 빌드 타임에 remark/rehype가 구운 HTML. 원본은 전부 이 저장소 안의
          로컬 마크다운이고 raw HTML은 파이프라인에서 통과시키지 않는다. */}
      <div
        className="blog-prose"
        dangerouslySetInnerHTML={{ __html: html }}
      />

      <GiscusComments locale={locale} />
    </div>
  );
}
