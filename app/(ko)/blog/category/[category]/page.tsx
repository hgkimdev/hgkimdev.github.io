import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BlogList, BlogShell } from "@/components/blog/blog-list";
import { BlogSidebar } from "@/components/blog/blog-sidebar";
import {
  blogCategories,
  categoryLabel,
  getAllPosts,
  type BlogCategory,
} from "@/lib/content/blog";
import { absoluteUrl } from "@/lib/seo";

// 카테고리는 개수가 고정(공부·일상·생각)이라 글이 없는 카테고리까지 미리
// 만들어 둔다. 사이드바에서는 0인 카테고리가 숨겨지지만, 예전에 공유된
// 링크가 404가 되지 않도록 페이지 자체는 존재한다.
export async function generateStaticParams() {
  return blogCategories.map((c) => ({ category: c.key }));
}

export const dynamicParams = false;

type CategoryPageProps = { params: Promise<{ category: string }> };

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { category } = await params;
  const known = blogCategories.find((c) => c.key === category);
  return {
    title: known ? `${known.label} · Blog` : "Blog",
    alternates: known
      ? { canonical: absoluteUrl(`/blog/category/${category}`) }
      : undefined,
  };
}

export default async function BlogCategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;
  if (!blogCategories.some((c) => c.key === category)) notFound();

  const allPosts = getAllPosts();
  const posts = allPosts.filter((p) => p.category === category);

  return (
    <BlogShell
      title={categoryLabel(category as BlogCategory)}
      sidebar={
        <BlogSidebar
          allPosts={allPosts}
          active={{ type: "category", key: category }}
        />
      }
    >
      <BlogList posts={posts} />
    </BlogShell>
  );
}
