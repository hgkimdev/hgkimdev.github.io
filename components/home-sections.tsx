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
import type { LifeCategory } from "@/content/life";
import type { ProjectGroup } from "@/content/projects";
import { LifeSection } from "@/components/life/life-section";
import { ProjectsEntrance } from "@/components/projects/projects-entrance";

type Section = {
  key: HomeSectionKey;
  label: string;
  description: string;
  body?: string[][];
  // Life only: the categories its entrance opens into. Present only where the
  // content exists (ko), the same way `body` is — every other locale falls
  // through to the placeholder below.
  life?: { categories: LifeCategory[] };
  // Projects only: same locale gating as `life`. Unlike Life there is no
  // dialog/open-state to hold here — each row is a real link to
  // /projects/[slug], so the entrance renders directly with no section
  // wrapper component.
  projects?: { groups: ProjectGroup[] };
  // Contact only: built server-side in home-content.tsx and handed down as a
  // finished ReactNode, the same way `hero` is — this file is "use client",
  // so importing the icon components directly here would ship them to the
  // Intro bundle for nothing.
  content?: ReactNode;
};

function interpolateClamped(
  v: number,
  input: number[],
  output: number[],
): number {
  if (v <= input[0]) return output[0];
  const last = input.length - 1;
  if (v >= input[last]) return output[last];
  for (let i = 0; i < last; i++) {
    if (v <= input[i + 1]) {
      const t = (v - input[i]) / (input[i + 1] - input[i]);
      return output[i] + t * (output[i + 1] - output[i]);
    }
  }
  return output[last];
}

// Every motion constant here is measured in *viewports of scroll* — the only
// unit that stays meaningful once slots have different weights. `viewportUnit`
// converts one viewport of scrolling into scrollYProgress.
const RAMP_VIEWPORTS = 0.35; // layer crossfade length
const DRIFT_PX = 16;
const REVEAL_LEAD_VIEWPORTS = 0.5; // beat after arrival before para 2 starts
const REVEAL_DUR_VIEWPORTS = 0.4; // one paragraph's fade-up
const REVEAL_DWELL_VIEWPORTS = 0.65; // all-revealed hold before the out-ramp

type Slot = {
  start: number; // progress at which this slot is fully opaque
  end: number; // progress at which the next slot takes over (=== next.start)
  weight: number; // viewports of scroll runway
  isFirst: boolean;
  isLast: boolean;
};

// Content-derived: one viewport of runway per paragraph. Sections with no body
// (en/fr/ja About, Life, Contact) stay at one viewport, so those locales'
// geometry is numerically identical to the old uniform-slot version. Life keeps
// weight 1 on purpose: it is a one-screen map, and the exploring happens in a
// dialog outside this scroll engine, not by scrolling through it.
function sectionWeight(section: Section): number {
  return Math.max(1, section.body?.length ?? 1);
}

function buildSlots(weights: number[]) {
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  // A `totalWeight`-viewport container only scrolls `totalWeight - 1` viewports
  // past the sticky frame, so one viewport of scroll is 1/(totalWeight - 1) of
  // progress. (In the uniform case this is the old `unit`, 1/(slotCount - 1).)
  const viewportUnit = totalWeight > 1 ? 1 / (totalWeight - 1) : 1;
  const offsets = [0];
  for (const w of weights) offsets.push(offsets[offsets.length - 1] + w);
  const slots: Slot[] = weights.map((weight, i) => ({
    weight,
    start: offsets[i] * viewportUnit,
    end: offsets[i + 1] * viewportUnit,
    isFirst: i === 0,
    isLast: i === weights.length - 1,
  }));
  // `ramp` is a constant 0.35 viewports of scroll, NOT 0.35 of a slot: a slot
  // with weight 3 must not get a 1.05-viewport crossfade that eats a third of
  // its reveal runway. In the uniform case this equals the old `unit * 0.35`.
  return {
    slots,
    offsets,
    totalWeight,
    viewportUnit,
    ramp: RAMP_VIEWPORTS * viewportUnit,
  };
}

// Absolute-progress reveal windows, one per paragraph. `null` means no window:
// paragraph 0 arrives with the layer's own crossfade (a fragment jump to
// /#about lands exactly at slot.start, so staging the first paragraph would
// drop the reader on a bare heading), and every paragraph degrades to `null`
// when the slot is too short to stage them — which is automatically the case at
// weight 1, so this doubles as the en/fr/ja safety net.
function revealWindows(count: number, slot: Slot, viewportUnit: number) {
  const revealEnd = slot.weight - RAMP_VIEWPORTS - REVEAL_DWELL_VIEWPORTS;
  const lastStart = revealEnd - REVEAL_DUR_VIEWPORTS;
  const step =
    count > 2 ? (lastStart - REVEAL_LEAD_VIEWPORTS) / (count - 2) : 0;
  const roomy = lastStart >= REVEAL_LEAD_VIEWPORTS;
  return Array.from({ length: count }, (_, i) => {
    if (i === 0 || !roomy) return null;
    const offset = REVEAL_LEAD_VIEWPORTS + (i - 1) * step;
    return {
      from: slot.start + offset * viewportUnit,
      to: slot.start + (offset + REVEAL_DUR_VIEWPORTS) * viewportUnit,
    };
  });
}

// break-keep is load-bearing for Korean: the default line-break rules let a
// browser split between any two Hangul syllables, which strands fragments like
// "...입니" / "다." across a line boundary. keep-all restricts breaks to spaces,
// i.e. to word boundaries, the way the text actually reads. text-pretty then
// cleans up the resulting rag and avoids one-word last lines.
const ESSAY_TEXT =
  "text-base leading-relaxed break-keep text-pretty text-foreground " +
  "sm:text-lg md:text-xl " +
  "[@media(max-height:620px)]:text-base [@media(max-height:620px)]:leading-snug";

type Reveal = {
  scrollYProgress: MotionValue<number>;
  slot: Slot;
  viewportUnit: number;
};

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
// ever reads scroll position.
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

  return (
    <div
      ref={containerRef}
      className="relative left-1/2 w-screen -translate-x-1/2"
      style={{ height: `${totalWeight * 100}dvh` }}
    >
      {/* Zero-height anchor targets for #about/#life/#contact nav links.
          Hero occupies slot 0, so real sections start at slot 1. `offsets` is
          cumulative viewports, so a fragment jump lands at progress ===
          slots[index + 1].start — exactly where that section reaches full
          opacity, whatever its weight. */}
      {sections.map((section, index) => (
        <div
          key={section.key}
          id={section.key}
          aria-hidden
          className="absolute inset-x-0 h-0"
          style={{ top: `${offsets[index + 1] * 100}dvh` }}
        />
      ))}

      <div className="sticky top-[var(--header-height)] h-[calc(100dvh-var(--header-height))] overflow-hidden">
        <PinnedLayer
          slot={slots[0]}
          ramp={ramp}
          scrollYProgress={scrollYProgress}
        >
          {hero}
        </PinnedLayer>
        {sections.map((section, index) => (
          <PinnedLayer
            key={section.key}
            slot={slots[index + 1]}
            ramp={ramp}
            scrollYProgress={scrollYProgress}
          >
            <SectionContent
              section={section}
              index={index}
              count={sections.length}
              comingSoonText={comingSoonText}
              reveal={{
                scrollYProgress,
                slot: slots[index + 1],
                viewportUnit,
              }}
            />
          </PinnedLayer>
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
      {children}
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
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 [@media(max-height:620px)]:gap-3">
      <span className="font-mono text-sm text-muted-foreground">
        {String(index + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
      </span>
      <h2 className="text-4xl font-bold tracking-tight sm:text-6xl [@media(max-height:620px)]:text-3xl">
        {section.label}
      </h2>
      {section.content ? (
        section.content
      ) : section.life ? (
        <LifeSection
          categories={section.life.categories}
          // `reveal`이 있다 === 핀 고정 스크롤 안이다. 거기서는 레이어
          // 크로스페이드가 등장을 맡으므로 액자가 따로 나타나지 않는다.
          animateIn={!reveal}
        />
      ) : section.projects ? (
        <ProjectsEntrance
          groups={section.projects.groups}
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
function ParagraphLines({ lines }: { lines: string[] }) {
  return (
    <>
      {lines.map((line, i) => (
        <span key={i} className="block">
          {line}
        </span>
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
      <ParagraphLines lines={lines} />
    </motion.p>
  );
}
