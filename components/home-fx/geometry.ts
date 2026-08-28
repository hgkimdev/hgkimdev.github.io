import type { MotionValue } from "motion/react";

// Pinned-scroll geometry, lifted out of components/home-sections.tsx so the
// per-section effects in ./effects.tsx can key themselves to exactly the same
// windows the layer crossfade uses. Pure math over scroll progress — no React,
// no DOM. home-sections.tsx and effects.tsx both import from here; nothing here
// imports back, so there is no cycle.

export function interpolateClamped(
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

// The scroll wheel is the clock in this file, so every ease is a shaping
// function over a 0..1 window, never a duration.
export function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}

// Every motion constant here is measured in *viewports of scroll* — the only
// unit that stays meaningful once slots have different weights. `viewportUnit`
// converts one viewport of scrolling into scrollYProgress.
export const RAMP_VIEWPORTS = 0.35; // layer crossfade length
export const DRIFT_PX = 16;
export const REVEAL_LEAD_VIEWPORTS = 0.5; // beat after arrival before para 2 starts
export const REVEAL_DUR_VIEWPORTS = 0.4; // one paragraph's fade-up
export const REVEAL_DWELL_VIEWPORTS = 0.65; // all-revealed hold before the out-ramp

export type Slot = {
  start: number; // progress at which this slot is fully opaque
  end: number; // progress at which the next slot takes over (=== next.start)
  weight: number; // viewports of scroll runway
  isFirst: boolean;
  isLast: boolean;
};

export type Reveal = {
  scrollYProgress: MotionValue<number>;
  slot: Slot;
  viewportUnit: number;
  // The crossfade ramp length in progress units. Effects need it to line their
  // own entrance/exit up with the layer crossfade instead of drifting.
  ramp: number;
};

export function buildSlots(weights: number[]) {
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
  //
  // 주의: **마지막 슬롯의 `end`는 1을 넘는다.** offsets는 뷰포트 누적치인데
  // viewportUnit이 1/(totalWeight - 1)이라, 마지막 offset(=totalWeight)을 곱하면
  // 1보다 커진다(예: 7.8 / 6.8 = 1.147). 스크롤은 progress 1에서 멈추므로 그 구간은
  // 도달할 수 없다. 크로스페이드는 `isLast` 분기에서 `slot.end`를 아예 쓰지 않아
  // 무사하지만, 마지막 슬롯의 `end`를 그대로 창의 끝으로 삼는 연출은 끝까지 진행되지
  // 못한다 — 그런 값을 만들 때는 `Math.min(slot.end, 1)`로 잘라 쓸 것.
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
// weight 1, so this doubles as the en safety net.
export function revealWindows(
  count: number,
  slot: Slot,
  viewportUnit: number,
) {
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
