import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { projectGroups } from "@/content/projects";
import { getProjectGroups } from "@/lib/content/projects";
import { ProjectDetail } from "@/components/projects/project-detail";
import { localizeHref } from "@/lib/i18n/config";
import { absoluteUrl } from "@/lib/seo";

// /projects/[slug]와 같은 규칙 — 정적 export라 빌드 시점에 모든 slug가
// 정해져 있어야 하고, 목록에 없는 slug는 새로 만들지 않는다. 슬러그는
// 언어 무관(ProjectGroupKey)이라 ko와 같은 목록을 쓴다.
export async function generateStaticParams() {
  return projectGroups.map((group) => ({ slug: group.key }));
}

export const dynamicParams = false;

type ProjectPageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const group = getProjectGroups("en").find((g) => g.key === slug);
  return {
    title: group ? `${group.label} · Projects` : "Projects",
    alternates: group
      ? { canonical: absoluteUrl(localizeHref(`/projects/${slug}`, "en")) }
      : undefined,
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const groups = getProjectGroups("en");
  const group = groups.find((g) => g.key === slug);
  if (!group) notFound();

  return <ProjectDetail groups={groups} group={group} locale="en" />;
}
