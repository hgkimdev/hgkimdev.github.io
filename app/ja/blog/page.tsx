import type { Metadata } from "next";

import { BlogList, BlogShell } from "@/components/blog/blog-list";
import { BlogSidebar } from "@/components/blog/blog-sidebar";
import { getAllPosts } from "@/lib/content/blog";
import { pageAlternates } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Blog",
  alternates: pageAlternates("/blog", "ja"),
};

export default function BlogPage() {
  const posts = getAllPosts("ja");

  return (
    <BlogShell
      title="Blog"
      sidebar={
        <BlogSidebar locale="ja" allPosts={posts} active={{ type: "all" }} />
      }
    >
      <BlogList locale="ja" posts={posts} />
    </BlogShell>
  );
}
