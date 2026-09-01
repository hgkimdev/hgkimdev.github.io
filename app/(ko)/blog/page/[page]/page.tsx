import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BlogList, BlogShell } from "@/components/blog/blog-list";
import { BlogSidebar } from "@/components/blog/blog-sidebar";
import { LinkPagination } from "@/components/blog/pagination";
import {
  EMPTY_ROUTE_PARAM,
  getAllPosts,
  paginatePosts,
  postPageCount,
} from "@/lib/content/blog";
import { localizeHref } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { absoluteUrl } from "@/lib/seo";

// 페이지 1은 /blog 자신이 맡으므로 여기서는 2쪽부터만 만든다. 글이
// POSTS_PAGE_SIZE개 이하라 둘째 쪽이 없으면 EMPTY_ROUTE_PARAM 자리표시자를
// 대신 내보낸다 — output: export는 동적 라우트가 최소 한 경로는 갖기를
// 요구한다(EMPTY_ROUTE_PARAM 주석 참고).
export async function generateStaticParams() {
  const pageCount = postPageCount(getAllPosts());
  if (pageCount < 2) return [{ page: EMPTY_ROUTE_PARAM }];
  return Array.from({ length: pageCount - 1 }, (_, i) => ({
    page: String(i + 2),
  }));
}

export const dynamicParams = false;

type BlogPagePageProps = { params: Promise<{ page: string }> };

function parsePageParam(raw: string, pageCount: number): number | null {
  const page = Number(raw);
  return Number.isInteger(page) && page >= 2 && page <= pageCount ? page : null;
}

export async function generateMetadata({
  params,
}: BlogPagePageProps): Promise<Metadata> {
  const { page: pageParam } = await params;
  const pageCount = postPageCount(getAllPosts());
  const page = parsePageParam(pageParam, pageCount);
  return {
    title: page ? `Blog · ${page}` : "Blog",
    alternates: page
      ? { canonical: absoluteUrl(`/blog/page/${page}`) }
      : undefined,
  };
}

export default async function BlogPagePage({ params }: BlogPagePageProps) {
  const { page: pageParam } = await params;
  const allPosts = getAllPosts();
  const pageCount = postPageCount(allPosts);
  const page = parsePageParam(pageParam, pageCount);
  if (!page) notFound();

  const dict = getDictionary("ko");

  return (
    <BlogShell
      title="Blog"
      sidebar={
        <BlogSidebar locale="ko" allPosts={allPosts} active={{ type: "all" }} />
      }
    >
      <BlogList locale="ko" posts={paginatePosts(allPosts, page)} />
      <LinkPagination
        page={page}
        pageCount={pageCount}
        basePath={localizeHref("/blog", "ko")}
        labels={{
          prevPage: dict.blog.prevPage,
          nextPage: dict.blog.nextPage,
          pageLabel: dict.blog.pageLabel,
        }}
        className="justify-center pt-2"
      />
    </BlogShell>
  );
}
