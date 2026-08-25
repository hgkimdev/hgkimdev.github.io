"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRightIcon } from "lucide-react";

import type { ProjectGroup } from "@/content/projects";
import { isPlainLeftClick, resetScrollForNavigation } from "@/lib/scroll";

/**
 * Projects 슬롯의 본문 — 사진 벤토 그리드였던 초안을 텍스트/링크 중심의 행
 * 목록으로 바꿨다. Life(사진 액자를 여는 은유)와 Contact(배경 마퀴)가 이미
 * 이 자리 앞뒤에서 각자의 시각 언어를 쓰고 있어서, Projects까지 같은 종류의
 * 카드 그리드였다면 Home을 한 번에 훑는 방문자에게 반복으로 읽힌다. 여기는
 * 절제된 텍스트 행으로 남겨 세 섹션이 서로 다른 언어를 갖게 한다.
 *
 * 각 행은 진짜 링크다 — `/projects/{group.key}`로 이동하는 페이지 전환이지,
 * Life처럼 같은 화면 위에 여는 오버레이가 아니다.
 */
export function ProjectsEntrance({
  groups,
  animateIn = false,
}: {
  groups: ProjectGroup[];
  /** 행이 스스로 등장 애니메이션을 재생할지. Life Poster의 같은 이름 prop과
   * 같은 이유 — 핀 고정 스크롤 안에서는 레이어 크로스페이드가 등장을 이미
   * 맡으므로 reduced-motion 스택 경로에서만 켠다. */
  animateIn?: boolean;
}) {
  return (
    <ul className="flex flex-col border-t border-border/60">
      {groups.map((group, index) => (
        <ProjectRow
          key={group.key}
          group={group}
          index={index}
          animateIn={animateIn}
        />
      ))}
    </ul>
  );
}

function ProjectRow({
  group,
  index,
  animateIn,
}: {
  group: ProjectGroup;
  index: number;
  animateIn: boolean;
}) {
  const number = String(index + 1).padStart(2, "0");

  const entrance = animateIn
    ? ({
        initial: { opacity: 0, y: 14 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, amount: 0.4 },
        transition: { duration: 0.4, delay: index * 0.06, ease: "easeOut" },
      } as const)
    : undefined;

  return (
    <motion.li {...entrance}>
      {/* hover 연출은 딱 세 가지로 절제한다: 이 행의 아래쪽 구분선 색,
          왼쪽 여백, 화살표 이동. Contact의 배경 마퀴 텍스트나 Life의
          그레이스케일→컬러 사진 전환처럼 눈에 띄는 장치는 일부러 쓰지
          않는다 — 이 섹션의 톤은 담백해야 한다. */}
      <Link
        href={`/projects/${group.key}`}
        // 스크롤을 깊게 내린 채로 이 행을 눌러 훨씬 짧은 상세 페이지로
        // 넘어가면, 헤더 ZoneSwitcher의 layoutId 필이 잘못된 위치에서
        // 튀는 문제가 있다 — lib/scroll.ts 참고.
        onClick={(event) => {
          if (isPlainLeftClick(event)) {
            resetScrollForNavigation();
          }
        }}
        className="group flex items-center gap-4 border-b border-border/60 py-5 pl-0 transition-[padding-left,border-color] duration-200 hover:border-foreground/40 hover:pl-2 focus-visible:border-foreground/40 focus-visible:pl-2 focus-visible:outline-none [@media(max-height:620px)]:py-3"
      >
        <span className="font-mono text-sm text-muted-foreground">
          {number}
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-3">
          <span className="text-lg font-semibold tracking-tight break-keep">
            {group.label}
          </span>
          <span className="truncate text-sm break-keep text-muted-foreground">
            {group.teaser}
          </span>
        </span>
        <ArrowRightIcon className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:translate-x-1 group-focus-visible:translate-x-1" />
      </Link>
    </motion.li>
  );
}
