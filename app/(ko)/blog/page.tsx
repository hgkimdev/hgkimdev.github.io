import type { Metadata } from "next";

import { BlogList, BlogShell } from "@/components/blog/blog-list";
import { BlogSidebar } from "@/components/blog/blog-sidebar";
import { getAllPosts } from "@/lib/content/blog";

export const metadata: Metadata = { title: "Blog" };

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <BlogShell
      title="Blog"
      sidebar={<BlogSidebar allPosts={posts} active={{ type: "all" }} />}
    >
      <BlogList posts={posts} />
    </BlogShell>
  );
}
