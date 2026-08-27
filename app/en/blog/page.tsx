import type { Metadata } from "next";

import { BlogList, BlogShell } from "@/components/blog/blog-list";
import { BlogSidebar } from "@/components/blog/blog-sidebar";
import { getAllPosts } from "@/lib/content/blog";
import { pageAlternates } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Blog",
  alternates: pageAlternates("/blog", "en"),
};

export default function BlogPage() {
  const posts = getAllPosts("en");

  return (
    <BlogShell
      title="Blog"
      sidebar={
        <BlogSidebar locale="en" allPosts={posts} active={{ type: "all" }} />
      }
    >
      <BlogList locale="en" posts={posts} />
    </BlogShell>
  );
}
