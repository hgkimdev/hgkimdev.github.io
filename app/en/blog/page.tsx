import type { Metadata } from "next";

import { BlogList, BlogShell } from "@/components/blog/blog-list";
import { BlogSidebar } from "@/components/blog/blog-sidebar";
import { LinkPagination } from "@/components/blog/pagination";
import { getAllPosts, paginatePosts, postPageCount } from "@/lib/content/blog";
import { localizeHref } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { pageAlternates } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Blog",
  alternates: pageAlternates("/blog", "en"),
};

export default function BlogPage() {
  const allPosts = getAllPosts("en");
  const pageCount = postPageCount(allPosts);
  const dict = getDictionary("en");

  return (
    <BlogShell
      title="Blog"
      sidebar={
        <BlogSidebar locale="en" allPosts={allPosts} active={{ type: "all" }} />
      }
    >
      <BlogList locale="en" posts={paginatePosts(allPosts, 1)} />
      <LinkPagination
        page={1}
        pageCount={pageCount}
        basePath={localizeHref("/blog", "en")}
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
