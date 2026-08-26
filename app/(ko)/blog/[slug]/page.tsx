import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BlogPostView } from "@/components/blog/blog-post";
import {
  EMPTY_ROUTE_PARAM,
  getAllPosts,
  getPostHtml,
} from "@/lib/content/blog";

// /projects/[slug]와 같은 규칙 — 정적 export라 빌드 시점에 모든 slug가
// 정해져 있어야 하고, 목록에 없는 slug는 새로 만들지 않는다.
export async function generateStaticParams() {
  const posts = getAllPosts();
  // 공개된 글이 0편이어도 경로를 하나는 내보내야 한다 — 이유는
  // EMPTY_ROUTE_PARAM 주석에 적어뒀다. 아래 페이지에서 notFound()로 걸린다.
  if (posts.length === 0) return [{ slug: EMPTY_ROUTE_PARAM }];
  return posts.map((post) => ({ slug: post.slug }));
}

export const dynamicParams = false;

type BlogPostPageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getAllPosts().find((p) => p.slug === slug);
  return {
    title: post ? `${post.title} · Blog` : "Blog",
    description: post?.summary || undefined,
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const posts = getAllPosts();
  const post = posts.find((p) => p.slug === slug);
  if (!post) notFound();

  const html = await getPostHtml(slug);

  return <BlogPostView post={post} html={html} allPosts={posts} />;
}
