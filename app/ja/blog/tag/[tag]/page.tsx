import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BlogList, BlogShell } from "@/components/blog/blog-list";
import { BlogSidebar } from "@/components/blog/blog-sidebar";
import {
  EMPTY_ROUTE_PARAM,
  getAllPosts,
  getTagCounts,
  tagSlug,
} from "@/lib/content/blog";
import { localizeHref } from "@/lib/i18n/config";
import { absoluteUrl } from "@/lib/seo";

// 카테고리와 달리 태그는 글에서 자라난다 — 실제로 쓰인 태그만 페이지가
// 생긴다. 태그를 지우면 그 페이지도 다음 빌드에서 사라진다.
export async function generateStaticParams() {
  const tags = getTagCounts(getAllPosts("ja"));
  if (tags.length === 0) return [{ tag: EMPTY_ROUTE_PARAM }];
  return tags.map((tag) => ({ tag: tag.key }));
}

export const dynamicParams = false;

type TagPageProps = { params: Promise<{ tag: string }> };

function findTagLabel(slug: string): string | undefined {
  return getTagCounts(getAllPosts("ja")).find((t) => t.key === slug)?.label;
}

export async function generateMetadata({
  params,
}: TagPageProps): Promise<Metadata> {
  const { tag } = await params;
  const slug = decodeURIComponent(tag);
  const label = findTagLabel(slug);
  return {
    title: label ? `${label} · Blog` : "Blog",
    alternates: label
      ? { canonical: absoluteUrl(localizeHref(`/blog/tag/${slug}`, "ja")) }
      : undefined,
  };
}

export default async function BlogTagPage({ params }: TagPageProps) {
  const { tag } = await params;
  const slug = decodeURIComponent(tag);
  const label = findTagLabel(slug);
  if (!label) notFound();

  const allPosts = getAllPosts("ja");
  const posts = allPosts.filter((p) => p.tags.some((t) => tagSlug(t) === slug));

  return (
    <BlogShell
      title={label}
      sidebar={
        <BlogSidebar
          locale="ja"
          allPosts={allPosts}
          active={{ type: "tag", key: slug }}
        />
      }
    >
      <BlogList locale="ja" posts={posts} />
    </BlogShell>
  );
}
