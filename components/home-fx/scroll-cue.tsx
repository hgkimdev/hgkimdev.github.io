"use client";

import { motion, useTransform, type MotionValue } from "motion/react";

import { interpolateClamped, type Slot } from "@/components/home-fx/geometry";

/**
 * 히어로 하단의 스크롤 신호.
 *
 * 핀 고정 덱은 첫 화면에서 "아래가 더 있다"는 표가 없으면 끝난 페이지처럼 보인다.
 * 나머지 네 섹션은 전부 `01 / 04` 번호를 달고 나오는데 히어로만 그게 없다.
 *
 * 셰브론 셋이 순서대로 밝아지며 내려가는 형태다. 여덟 가지 시안(선 긋기 / 레일 위 점 /
 * 마우스 휠 / 셰브론 / 활자 드리프트 / 링+화살표 / 정적 선 / 가로 막대)을 브라우저에
 * 나란히 놓고 고른 것이다.
 *
 * 움직임은 전부 globals.css가 맡는다 — 컴포넌트에서 useReducedMotion으로 갈라 그리면
 * 서버(항상 false)와 클라이언트가 달라져 하이드레이션이 깨진다. `.life-wall-track`이
 * 같은 이유로 그렇게 돼 있다.
 */

// `pointer-events-none`은 장식이 아니라 필수다. 핀 고정 레이어는 전부
// `absolute inset-0`이라 흐려진 레이어도 프레임 전체를 덮는데, 그 위에 신호를 한 겹 더
// 얹으면서 클릭을 먹으면 Life 입구나 Projects 행이 눌리지 않는다 — PinnedLayer의
// pointerEvents 주석에 같은 사고가 적혀 있다.
//
// bottom 50px: 시안 페이지에서 40~220px을 밀어보고 고른 값이다. 세로가 짧은 화면에서는
// 본문과 붙어버려서 한 단계 줄인다.
const CUE_CLASS =
  "pointer-events-none absolute bottom-[50px] left-1/2 -translate-x-1/2 " +
  "text-muted-foreground [@media(max-height:620px)]:bottom-6";

function Chevrons() {
  return (
    <span className="hero-cue" aria-hidden>
      {[0, 1, 2].map((i) => (
        <svg
          key={i}
          viewBox="0 0 16 9"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.4}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M1 1l7 7 7-7" />
        </svg>
      ))}
    </span>
  );
}

/** reduced-motion 스택 경로용. 히어로 `<section>`이 relative라 그 바닥에 붙는다. */
export function HeroScrollCue() {
  return (
    <div className={CUE_CLASS}>
      <Chevrons />
    </div>
  );
}

/**
 * 핀 고정 경로용. 히어로 슬롯이 물러나는 것과 **같은 창**에서 같이 사라진다 —
 * 신호는 히어로의 것이므로, 다음 판이 올라오는데 남아 있으면 안 된다.
 *
 * useTransform은 콜백 형태여야 한다. 배열(키프레임) 형태는 네이티브 스크롤 타임라인
 * 경로를 타면서 같은 scrollYProgress를 읽는 다른 호출자들을 망가뜨린다 —
 * home-sections.tsx 맨 위 주석 참고.
 */
export function PinnedHeroScrollCue({
  scrollYProgress,
  slot,
  ramp,
}: {
  scrollYProgress: MotionValue<number>;
  slot: Slot;
  ramp: number;
}) {
  const opacity = useTransform(scrollYProgress, (v) =>
    interpolateClamped(v, [slot.end - ramp, slot.end], [1, 0]),
  );
  return (
    <motion.div style={{ opacity }} className={CUE_CLASS}>
      <Chevrons />
    </motion.div>
  );
}
