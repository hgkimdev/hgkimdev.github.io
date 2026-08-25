import Link from "next/link";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import { SiGithub } from "@icons-pack/react-simple-icons";

import type { Project, ProjectGroup } from "@/content/projects";
import { ProjectsBackLink } from "@/components/projects/projects-back-link";

// 본문 조판. home-sections.tsx의 ESSAY_TEXT와 같은 규칙(break-keep·text-pretty)을
// 쓰지만, 그 상수를 이 파일에서 import하지는 않는다 — 다른 파일의 로컬 상수를
// 끌어오는 결합보다는 같은 값을 여기 다시 선언하는 편이 낫다.
const WHY_TEXT =
  "flex flex-col gap-4 text-base leading-relaxed break-keep text-pretty text-foreground sm:text-lg";

// life-overlay.tsx의 CHIP과 같은 생김새(스택·상태 칩에 공통으로 쓰는 조각).
const CHIP = "rounded-full bg-foreground/5 px-2 py-0.5 text-foreground/70";

const LINK_BUTTON =
  "flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm text-foreground/80 transition-colors hover:border-foreground/40 hover:text-foreground";

/**
 * `/projects/[slug]` 페이지 본문. Life의 전체화면 다이얼로그 대신 진짜
 * 페이지로 케이스 스터디를 펼친다 — 뒤로가기가 되고, 헤더·푸터가 정상
 * 노출되고, 이전/다음 프로젝트로 순환 이동한다.
 */
export function ProjectDetail({
  groups,
  group,
}: {
  groups: ProjectGroup[];
  group: ProjectGroup;
}) {
  const index = groups.findIndex((g) => g.key === group.key);
  const total = groups.length;
  const prev = groups[(index - 1 + total) % total];
  const next = groups[(index + 1) % total];
  // 항목이 하나뿐인 그룹(Claudocs·Langport)은 그룹 제목이 곧 그 프로젝트
  // 이름이라 프로젝트 이름을 다시 적으면 중복이다. 항목이 여럿인 그룹
  // (Claude 관련 도구)만 각 항목에 자기 제목을 붙인다.
  const solo = group.items.length === 1;

  return (
    <div className="flex flex-col gap-10 py-10 sm:py-16">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <ProjectsBackLink />
          <span className="font-mono text-sm text-muted-foreground">
            {String(index + 1).padStart(2, "0")} /{" "}
            {String(total).padStart(2, "0")}
          </span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight break-keep sm:text-6xl">
          {group.label}
        </h1>
        <p className="max-w-xl break-keep text-muted-foreground">
          {group.teaser}
        </p>
      </div>

      {solo ? (
        <ProjectBody project={group.items[0]} showTitle={false} />
      ) : (
        <div className="flex flex-col divide-y divide-border/60">
          {group.items.map((project) => (
            <div key={project.id} className="py-10 first:pt-0 last:pb-0">
              <ProjectBody project={project} showTitle />
            </div>
          ))}
        </div>
      )}

      <nav className="flex items-center justify-between border-t border-border/60 pt-8 font-mono text-sm">
        <Link
          href={`/projects/${prev.key}`}
          className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeftIcon className="size-4" />
          {prev.label}
        </Link>
        <Link
          href={`/projects/${next.key}`}
          className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
        >
          {next.label}
          <ArrowRightIcon className="size-4" />
        </Link>
      </nav>
    </div>
  );
}

function ProjectBody({
  project,
  showTitle,
}: {
  project: Project;
  showTitle: boolean;
}) {
  return (
    <div className="flex flex-col gap-4">
      {showTitle ? (
        <h2 className="text-2xl font-bold tracking-tight break-keep">
          {project.title}
        </h2>
      ) : null}
      <p className="font-mono text-xs text-muted-foreground sm:text-sm">
        {project.meta}
      </p>
      {/* 유튜브 데모가 있는 항목(지금은 Claudocs)만. 배경으로 자동재생하는
          Life의 미디어 레이어와 달리, 본문 흐름 안의 보통 임베드라
          방문자가 직접 눌러야 재생된다 — 케이스 스터디 페이지에 어울리는
          절제. */}
      {project.media.kind === "youtube" ? (
        <div className="aspect-video w-full overflow-hidden rounded-xl border border-border">
          <iframe
            src={`https://www.youtube.com/embed/${project.media.id}`}
            title={`${project.title} 데모 영상`}
            allow="encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            className="h-full w-full"
          />
        </div>
      ) : null}

      <div className={WHY_TEXT}>
        {project.why.map((line, i) => (
          <span key={i} className="block">
            {line}
          </span>
        ))}
      </div>

      {project.links.github || project.links.demo ? (
        <div className="mt-2 flex flex-wrap items-center gap-4">
          {project.links.github ? (
            <a
              href={project.links.github}
              target="_blank"
              rel="noreferrer"
              className={LINK_BUTTON}
            >
              <SiGithub size={16} color="currentColor" />
              GitHub
            </a>
          ) : null}
          {project.links.demo ? (
            <a
              href={project.links.demo}
              target="_blank"
              rel="noreferrer"
              className="font-mono text-sm text-blue-600 underline underline-offset-2 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              {project.links.demo.replace(/^https?:\/\//, "").replace(/\/$/, "")}
            </a>
          ) : null}
        </div>
      ) : null}

      {project.stack?.length || project.tags?.length ? (
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          {project.stack?.map((tech) => (
            <span key={tech} className={CHIP}>
              {tech}
            </span>
          ))}
          {project.tags?.map((tag) => (
            <span key={tag} className={CHIP}>
              {tag}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
