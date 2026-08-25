import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { projectGroups } from "@/content/projects";
import { ProjectDetail } from "@/components/projects/project-detail";

// 정적 export(`output: 'export'`)라 빌드 시점에 모든 slug가 정해져 있어야
// 한다 — 이 저장소의 첫 `[slug]` 동적 라우트라 node_modules/next/dist/docs를
// 확인해서 맞춘 규칙: generateStaticParams가 필수고, 목록에 없는 slug는
// dynamicParams = false로 막아 빌드에도 없고 요청 시점에도 새로 만들지
// 않는다.
export async function generateStaticParams() {
  return projectGroups.map((group) => ({ slug: group.key }));
}

export const dynamicParams = false;

type ProjectPageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const group = projectGroups.find((g) => g.key === slug);
  return { title: group ? `${group.label} · Projects` : "Projects" };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const group = projectGroups.find((g) => g.key === slug);
  if (!group) notFound();

  return <ProjectDetail groups={projectGroups} group={group} />;
}
