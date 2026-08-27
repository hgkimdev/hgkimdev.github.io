import type { Metadata } from "next";

import { BlogList, BlogShell } from "@/components/blog/blog-list";
import { BlogSidebar } from "@/components/blog/blog-sidebar";
import { getAllPosts } from "@/lib/content/blog";
import { pageAlternates } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Blog",
  alternates: pageAlternates("/blog", "ko"),
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <BlogShell
      title="Blog"
      sidebar={
        <BlogSidebar locale="ko" allPosts={posts} active={{ type: "all" }} />
      }
    >
      <BlogList locale="ko" posts={posts} />
    </BlogShell>
  );
}
