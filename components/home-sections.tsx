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

type Section = { key: HomeSectionKey; label: string; description: string };

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
      <section className="relative left-1/2 flex min-h-[calc(100vh-var(--header-height))] w-screen -translate-x-1/2 flex-col justify-center overflow-hidden">
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
          className="relative left-1/2 flex min-h-[calc(100vh-var(--header-height))] w-screen -translate-x-1/2 scroll-mt-20 flex-col justify-center border-t border-border/60"
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
  const slotCount = sections.length + 1;
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  return (
    <div
      ref={containerRef}
      className="relative left-1/2 w-screen -translate-x-1/2"
      style={{ height: `${slotCount * 100}dvh` }}
    >
      {/* Zero-height anchor targets for #about/#life/#contact nav links.
          Hero occupies slot 0, so real sections start at slot 1. Positioned
          so a fragment jump lands exactly where that section has already
          reached full opacity (see PinnedLayer's progress math). */}
      {sections.map((section, index) => (
        <div
          key={section.key}
          id={section.key}
          aria-hidden
          className="absolute inset-x-0 h-0"
          style={{ top: `${(index + 1) * 100}dvh` }}
        />
      ))}

      <div className="sticky top-[var(--header-height)] h-[calc(100dvh-var(--header-height))] overflow-hidden">
        <PinnedLayer
          slotIndex={0}
          slotCount={slotCount}
          scrollYProgress={scrollYProgress}
        >
          {hero}
        </PinnedLayer>
        {sections.map((section, index) => (
          <PinnedLayer
            key={section.key}
            slotIndex={index + 1}
            slotCount={slotCount}
            scrollYProgress={scrollYProgress}
          >
            <SectionContent
              section={section}
              index={index}
              count={sections.length}
              comingSoonText={comingSoonText}
            />
          </PinnedLayer>
        ))}
      </div>
    </div>
  );
}

function PinnedLayer({
  slotIndex,
  slotCount,
  scrollYProgress,
  children,
}: {
  slotIndex: number;
  slotCount: number;
  scrollYProgress: MotionValue<number>;
  children: ReactNode;
}) {
  const unit = slotCount > 1 ? 1 / (slotCount - 1) : 1;
  const rampWidth = unit * 0.35;

  // Transition entirely before each boundary (not centered on it) — a
  // centered ramp at the very last boundary (progress === 1) would have no
  // scroll room to finish and would get stuck at 50% opacity. The first
  // slot (hero) starts fully opaque and the last slot (contact) stays fully
  // opaque through progress === 1, so the pinned frame is never blank at
  // either end.
  const points: number[] = [];
  const values: number[] = [];
  if (slotIndex === 0) {
    points.push(0);
    values.push(1);
  } else {
    points.push(slotIndex * unit - rampWidth, slotIndex * unit);
    values.push(0, 1);
  }
  if (slotIndex === slotCount - 1) {
    points.push(1);
    values.push(1);
  } else {
    points.push((slotIndex + 1) * unit - rampWidth, (slotIndex + 1) * unit);
    values.push(1, 0);
  }

  // Callback form, not the (points, values) array form: multiple sibling
  // useTransform calls reading the same scrollYProgress with the array form
  // hit Motion's native scroll-timeline acceleration path, which only wires
  // up correctly for the first caller and corrupts the others' keyframes.
  const opacity = useTransform(scrollYProgress, (v) =>
    interpolateClamped(v, points, values),
  );
  const drift = useTransform(opacity, (v) => (v === 1 ? 0 : 16));

  return (
    <motion.div
      style={{ opacity, y: drift }}
      className="absolute inset-0 flex flex-col justify-center"
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
}: {
  section: Section;
  index: number;
  count: number;
  comingSoonText: string;
}) {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4">
      <span className="font-mono text-sm text-muted-foreground">
        {String(index + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
      </span>
      <h2 className="text-4xl font-bold tracking-tight sm:text-6xl">
        {section.label}
      </h2>
      <p className="max-w-md text-lg text-muted-foreground">
        {section.description}
      </p>
      <p className="text-sm text-muted-foreground">{comingSoonText}</p>
    </div>
  );
}
