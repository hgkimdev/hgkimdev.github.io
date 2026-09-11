"use client";

import { useRef, type ReactNode } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";

import type { HomeSectionKey } from "@/lib/nav";
import type { Locale } from "@/lib/i18n/config";
import type { LifeCategory } from "@/content/life";
import type { ProjectGroup } from "@/content/projects";
import { LifeSection } from "@/components/life/life-section";
import { LIFE_WALL_SLOT_ID } from "@/components/life/life-entrance";
import { ProjectsEntrance } from "@/components/projects/projects-entrance";
import {
  DRIFT_PX,
  buildSlots,
  interpolateClamped,
  revealWindows,
  type Reveal,
  type Slot,
} from "@/components/home-fx/geometry";
import {
  ParagraphRevealProvider,
  SlotFxProvider,
  useSlotFx,
} from "@/components/home-fx/effects";

type Section = {
  key: HomeSectionKey;
  label: string;
  description: string;
  // Life/Projects need this to localize the UI strings and links their
  // render components own directly (Home's other content is either plain
  // data or, like `content` below, already resolved to a locale before it
  // gets here).
  locale: Locale;
  body?: string[][];
  // Life only: the categories its entrance opens into.
  life?: { categories: LifeCategory[] };
  // Projects only: unlike Life there is no dialog/open-state to hold here —
  // each row is a real link to /projects/[slug], so the entrance renders
  // directly with no section wrapper component.
  projects?: { groups: ProjectGroup[] };
  // Contact only: built server-side in home-content.tsx and handed down as a
  // finished ReactNode, the same way `hero` is — this file is "use client",
  // so importing the icon components directly here would ship them to the
  // Intro bundle for nothing.
  content?: ReactNode;
};

// break-keep is load-bearing for Korean: the default line-break rules let a
// browser split between any two Hangul syllables, which strands fragments like
// "...입니" / "다." across a line boundary. keep-all restricts breaks to spaces,
// i.e. to word boundaries, the way the text actually reads. text-pretty then
// cleans up the resulting rag and avoids one-word last lines.
const ESSAY_TEXT =
  "text-base leading-relaxed break-keep text-pretty text-foreground " +
  "sm:text-lg md:text-xl " +
  "[@media(max-height:620px)]:text-base [@media(max-height:620px)]:leading-snug";

// 제목과 본문 래퍼의 클래스는 상수로 뺀다 — 연출이 붙든 안 붙든(스택 경로) 타이포와
// 간격은 똑같아야 하고, 효과 컴포넌트는 그 위에 transform만 얹는다.
const HEADING_CLASS =
  "text-4xl font-bold tracking-tight sm:text-6xl [@media(max-height:620px)]:text-3xl";
// 본문은 항상 이 래퍼 한 겹을 쓴다(효과가 없을 때도). DOM 깊이가 경로마다 같아야
// placeholder처럼 자식이 둘인 분기의 간격이 흔들리지 않는다.
const CONTENT_CLASS = "flex flex-col gap-6 [@media(max-height:620px)]:gap-3";

// Content-derived: one viewport of runway per paragraph. Life keeps weight 1
// on purpose: it is a one-screen map, and the exploring happens in a dialog
// outside this scroll engine, not by scrolling through it.
//
// Everything else with no body text (Projects, Contact) got only ~0.3
// viewport of settled dwell once the crossfade ramps ate their share of a
// bare 1-viewport slot — sessions were passing through in a single scroll
// tick. NO_BODY_WEIGHT gives them more
// runway (~0.7 viewport of dwell) without touching Life.
const NO_BODY_WEIGHT = 1.4;

function sectionWeight(section: Section): number {
  if (section.body?.length) return section.body.length;
  if (section.life) return 1;
  return NO_BODY_WEIGHT;
}

// Intentionally never given a view-transition-name and never wrapped in a
// <ViewTransition> boundary, so it stays outside both the route crossfade
// (.page-vt) and the theme toggle's data-transition-kind="theme" wipe.
export function HomeSections({
  hero,
  sections,
  comingSoonText,
}: {
  hero: ReactNode;
  sections: Section[];
  comingSoonText: string;
}) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return (
      <StackedSections
        hero={hero}
        sections={sections}
        comingSoonText={comingSoonText}
      />
    );
  }
  return (
    <PinnedSections
      hero={hero}
      sections={sections}
      comingSoonText={comingSoonText}
    />
  );
}

// Reduced-motion fallback: plain stacked layout. Scroll-hijacking style
// pinning is a common vestibular-disorder trigger, so this disables the pin
// entirely rather than just shortening a transition duration. The hero gets
// no entrance animation (matches its un-animated appearance today); About/
// Life/Contact keep their whileInView fade-up.
//
// SectionContent is deliberately called without a `reveal` prop here, so the
// per-paragraph scroll staging is off by omission — nothing in this subtree
// ever reads scroll position. 같은 이유로 SlotFxProvider도 없다: 섹션 연출은 전부
// "슬롯이 있을 때만" 붙으므로 이 경로에는 하나도 걸리지 않는다.
function StackedSections({
  hero,
  sections,
  comingSoonText,
}: {
  hero: ReactNode;
  sections: Section[];
  comingSoonText: string;
}) {
  return (
    <div>
      <section className="relative left-1/2 flex min-h-[calc(100vh-var(--header-height))] w-screen -translate-x-1/2 flex-col justify-center overflow-hidden pb-[var(--header-height)]">
        {hero}
      </section>

      {sections.map((section, index) => (
        <motion.section
          key={section.key}
          id={section.key}
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative left-1/2 flex min-h-[calc(100vh-var(--header-height))] w-screen -translate-x-1/2 scroll-mt-20 flex-col justify-center border-t border-border/60 pb-[var(--header-height)]"
        >
          <SectionContent
            section={section}
            index={index}
            count={sections.length}
            comingSoonText={comingSoonText}
          />
        </motion.section>
      ))}
    </div>
  );
}

function PinnedSections({
  hero,
  sections,
  comingSoonText,
}: {
  hero: ReactNode;
  sections: Section[];
  comingSoonText: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  // Slot geometry lives here, not in PinnedLayer: a layer can't derive its own
  // boundaries without knowing every other slot's weight, and the container
  // height and anchor offsets need the cumulative weights anyway. No useMemo —
  // `sections` is a fresh array every render so a memo would never hit.
  const { slots, offsets, totalWeight, viewportUnit, ramp } = buildSlots([
    1, // hero
    ...sections.map(sectionWeight),
  ]);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const revealFor = (slot: Slot): Reveal => ({
    scrollYProgress,
    slot,
    viewportUnit,
    ramp,
  });

  return (
    <div
      ref={containerRef}
      className="relative left-1/2 w-screen -translate-x-1/2"
      // `svh`, not `dvh` — this height defines the *total scroll distance*,
      // and on mobile `dvh` shrinks/grows as the address bar shows and hides
      // mid-scroll. Sizing the scroll-distance container with a unit that
      // moves under the user's thumb desyncs it from useScroll's progress
      // math, and the tail end (Contact) could fall in the gap and never
      // become reachable. `svh` is pinned to the smallest (chrome-visible)
      // viewport, so the scroll target never shifts mid-gesture.
      style={{ height: `${totalWeight * 100}svh` }}
    >
      {/* Zero-height anchor targets for #about/#life/#contact nav links.
          Hero occupies slot 0, so real sections start at slot 1. `offsets` is
          cumulative viewports, so a fragment jump lands at progress ===
          slots[index + 1].start — exactly where that section reaches full
          opacity, whatever its weight. Same `svh` as the container above —
          these tops are coordinates within that container's own height, so
          they have to share its unit. */}
      {sections.map((section, index) => (
        <div
          key={section.key}
          id={section.key}
          aria-hidden
          className="absolute inset-x-0 h-0"
          style={{ top: `${offsets[index + 1] * 100}svh` }}
        />
      ))}

      <div className="sticky top-[var(--header-height)] h-[calc(100dvh-var(--header-height))] overflow-hidden">
        {/* 히어로는 자기 제목/본문이 없고(TextType이 등장을 맡는다) 맞닿는 경계도
            About 하나뿐이라, About의 슬롯 키를 빌려 레이어 연출만 받는다. 두 레이어가
            같은 언어를 써야 그 경계가 어긋나 보이지 않는다. */}
        <SlotFxProvider
          sectionKey={sections[0]?.key ?? "about"}
          reveal={revealFor(slots[0])}
        >
          <PinnedLayer
            slot={slots[0]}
            ramp={ramp}
            scrollYProgress={scrollYProgress}
          >
            {hero}
          </PinnedLayer>
        </SlotFxProvider>
        {sections.map((section, index) => (
          <SlotFxProvider
            key={section.key}
            sectionKey={section.key}
            reveal={revealFor(slots[index + 1])}
          >
            <PinnedLayer
              slot={slots[index + 1]}
              ramp={ramp}
              scrollYProgress={scrollYProgress}
            >
              <SectionContent
                section={section}
                index={index}
                count={sections.length}
                comingSoonText={comingSoonText}
                reveal={revealFor(slots[index + 1])}
              />
            </PinnedLayer>
          </SlotFxProvider>
        ))}
      </div>
    </div>
  );
}

function PinnedLayer({
  slot,
  ramp,
  scrollYProgress,
  children,
}: {
  slot: Slot;
  ramp: number;
  scrollYProgress: MotionValue<number>;
  children: ReactNode;
}) {
  // Transition entirely before each boundary (not centered on it) — a
  // centered ramp at the very last boundary (progress === 1) would have no
  // scroll room to finish and would get stuck at 50% opacity. The first
  // slot (hero) starts fully opaque and the last slot (contact) stays fully
  // opaque through progress === 1, so the pinned frame is never blank at
  // either end.
  const points: number[] = [];
  const values: number[] = [];
  if (slot.isFirst) {
    points.push(0);
    values.push(1);
  } else {
    points.push(slot.start - ramp, slot.start);
    values.push(0, 1);
  }
  if (slot.isLast) {
    points.push(1);
    values.push(1);
  } else {
    // slot.end === slots[i + 1].start by construction, so this out-ramp and
    // the next layer's in-ramp share one window and the two opacities sum to
    // exactly 1 throughout — no luminance dip mid-crossfade.
    points.push(slot.end - ramp, slot.end);
    values.push(1, 0);
  }

  // Callback form, not the (points, values) array form: multiple sibling
  // useTransform calls reading the same scrollYProgress with the array form
  // hit Motion's native scroll-timeline acceleration path, which only wires
  // up correctly for the first caller and corrupts the others' keyframes.
  // Every value in this file that reads scrollYProgress must use the callback
  // form — including the per-paragraph reveals below.
  const opacity = useTransform(scrollYProgress, (v) =>
    interpolateClamped(v, points, values),
  );
  // Interpolated, not stepped: interpolateClamped returns exactly 1 at a ramp
  // end, so `v === 1 ? 0 : DRIFT_PX` made an already-fully-opaque layer jump
  // 16px in a single frame at every boundary.
  const drift = useTransform(opacity, (v) => (1 - v) * DRIFT_PX);
  // Every layer is `absolute inset-0`, so a faded-out one still covers the
  // whole frame and swallows clicks meant for the visible layer — Contact sits
  // last in the DOM, so it was eating every press on Life's entrance. Opacity
  // is the single source of truth for "is this the layer on screen", and a
  // crossfading pair sums to exactly 1, so >0.5 picks out exactly one layer.
  const pointerEvents = useTransform(opacity, (v) =>
    v > 0.5 ? "auto" : "none",
  );

  // 레이어 차원의 연출(깊이 돌리)은 여기 안쪽 한 겹에 얹는다. 바깥 motion.div의
  // opacity는 크로스페이드 전용이라 건드리면 안 되기 때문.
  const { Layer } = useSlotFx();

  // The pb offsets the header: the sticky frame starts below it, so content
  // centred in the frame sits half a header-height *below* the viewport's
  // optical centre. Padding the bottom by one header-height re-centres it on
  // the viewport, which also lands in the usual 3-5% upward optical bias for a
  // text block. Applied to the shared layer so every slot stays aligned
  // through the crossfade.
  return (
    <motion.div
      style={{ opacity, y: drift, pointerEvents }}
      className="absolute inset-0 flex flex-col justify-center pb-[var(--header-height)]"
    >
      <Layer>{children}</Layer>
    </motion.div>
  );
}

function SectionContent({
  section,
  index,
  count,
  comingSoonText,
  reveal,
}: {
  section: Section;
  index: number;
  count: number;
  comingSoonText: string;
  reveal?: Reveal;
}) {
  // 슬롯이 없으면(스택 경로) 전부 passthrough라 지금과 같은 DOM이 나온다.
  const { Heading, Content } = useSlotFx();

  return (
    <div
      className={`relative mx-auto flex w-full flex-col gap-6 px-4 [@media(max-height:620px)]:gap-3 ${
        // Projects만 칸이 넓다. 본문이 "목록 + 그림 상자" 두 칸으로 갈라지는
        // 유일한 섹션이라, 다른 섹션과 같은 max-w-4xl(896px) 안에 넣으면 둘
        // 다 425/400px로 쪼그라든다.
        //
        // 제목까지 같이 넓어지는 게 핵심이다. 본문만 오른쪽으로 넓혀 봤더니
        // 블록 전체가 오른쪽으로 쏠렸다(1440px에서 왼쪽 여백 288 / 오른쪽 96).
        // 칸째로 넓히면 제목과 본문이 같은 상자를 쓰면서 가운데 정렬이 유지된다.
        //
        // 대신 이 섹션의 제목은 다른 섹션보다 96px 왼쪽에서 시작한다. 핀 고정
        // 레이어끼리는 크로스페이드로 겹치므로 경계에서 두 제목의 x가 다르다 —
        // 폭 차이를 이보다 키우면 그 어긋남이 눈에 띈다.
        section.projects ? "max-w-[68rem]" : "max-w-4xl"
      }`}
    >
      {/* Life 입구가 배경 벽을 포털로 꽂는 자리.
          제목보다 **앞에** 있어야 한다 — 벽을 Content 안에 두면 제목을 덮어
          버린다. Content는 슬롯 연출(transform/filter) 탓에 자기만의 쌓임
          맥락이라, 그 안에서 음수 z-index를 줘도 맥락 밖의 제목보다 아래로
          내려가지 못한다. 여기 두면 제목·번호와 형제가 되어 그 아래에 깔린다.
          components/life/life-entrance.tsx 참고. */}
      {section.life ? (
        <div
          id={LIFE_WALL_SLOT_ID}
          className="pointer-events-none absolute inset-0 -z-10"
        />
      ) : null}
      <span className="font-mono text-sm text-muted-foreground">
        {String(index + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
      </span>
      <Heading label={section.label} className={HEADING_CLASS} />
      <Content className={CONTENT_CLASS}>
        {section.content ? (
          section.content
        ) : section.life ? (
          <LifeSection
            categories={section.life.categories}
            locale={section.locale}
            // `reveal`이 있다 === 핀 고정 스크롤 안이다. 거기서는 레이어
            // 크로스페이드가 등장을 맡으므로 액자가 따로 나타나지 않는다.
            animateIn={!reveal}
          />
        ) : section.projects ? (
          <ProjectsEntrance
            groups={section.projects.groups}
            locale={section.locale}
            animateIn={!reveal}
          />
        ) : section.body ? (
          <SectionBody paragraphs={section.body} reveal={reveal} />
        ) : (
          <>
            <p className="max-w-md text-lg text-muted-foreground">
              {section.description}
            </p>
            <p className="text-sm text-muted-foreground">{comingSoonText}</p>
          </>
        )}
      </Content>
    </div>
  );
}

// Every paragraph stays mounted and only opacity/transform change, so the
// wrapper's height is constant and the layer's justify-center never reflows as
// paragraphs appear. The heading does not move.
function SectionBody({
  paragraphs,
  reveal,
}: {
  paragraphs: string[][];
  reveal?: Reveal;
}) {
  const windows = reveal
    ? revealWindows(paragraphs.length, reveal.slot, reveal.viewportUnit)
    : null;
  return (
    <div
      className={`flex flex-col gap-4 ${ESSAY_TEXT} [@media(max-height:620px)]:gap-2`}
    >
      {paragraphs.map((paragraph, i) => {
        const revealWindow = windows?.[i];
        // RevealParagraph is its own component, so branching here never
        // changes hook order.
        return revealWindow && reveal ? (
          <RevealParagraph
            key={i}
            lines={paragraph}
            scrollYProgress={reveal.scrollYProgress}
            from={revealWindow.from}
            to={revealWindow.to}
          />
        ) : (
          <p key={i}>
            <ParagraphLines lines={paragraph} />
          </p>
        );
      })}
    </div>
  );
}

// A span per line, made block-level so each one starts fresh and wraps within
// itself. Valid inside <p>: a span is phrasing content whatever its display is.
// Lines within a paragraph sit one line-height apart while paragraphs keep their
// gap-4, which is what groups them visually.
//
// 줄 자체도 연출이 잡는 자리다(줄 단위 캐스케이드). 기본값은 예전과 똑같은
// `<span className="block">`이라 효과가 없을 때 DOM이 변하지 않는다.
function ParagraphLines({ lines }: { lines: string[] }) {
  const { Line } = useSlotFx();
  return (
    <>
      {lines.map((line, i) => (
        <Line key={i} index={i} count={lines.length}>
          {line}
        </Line>
      ))}
    </>
  );
}

function RevealParagraph({
  lines,
  scrollYProgress,
  from,
  to,
}: {
  lines: string[];
  scrollYProgress: MotionValue<number>;
  from: number;
  to: number;
}) {
  const reveal = useTransform(scrollYProgress, (v) => {
    const t = interpolateClamped(v, [from, to], [0, 1]);
    // Ease-out, so the paragraph becomes readable in the first half of its
    // window. The scroll wheel is the clock here, so the tunable is distance
    // (REVEAL_DUR_VIEWPORTS), not a duration. Layer crossfades above stay
    // linear because a crossfade pair has to sum to 1; these ramps are
    // unpaired, so easing them is safe.
    return 1 - (1 - t) ** 3;
  });
  const drift = useTransform(reveal, (v) => (1 - v) * DRIFT_PX);
  return (
    <motion.p style={{ opacity: reveal, y: drift }}>
      {/* 이 문단의 진행도를 줄 단위 효과가 다시 잘게 쪼개 쓸 수 있게 넘긴다. */}
      <ParagraphRevealProvider value={reveal}>
        <ParagraphLines lines={lines} />
      </ParagraphRevealProvider>
    </motion.p>
  );
}
