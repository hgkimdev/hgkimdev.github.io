"use client";

import {
  createContext,
  useContext,
  useMemo,
  type ComponentType,
  type ReactNode,
} from "react";
import {
  motion,
  motionValue,
  useTransform,
  type HTMLMotionProps,
  type MotionValue,
} from "motion/react";

import type { HomeSectionKey } from "@/lib/nav";
import {
  easeOutCubic,
  interpolateClamped,
  type Reveal,
} from "@/components/home-fx/geometry";

/**
 * Home 핀 고정 스크롤의 섹션별 등장/퇴장 연출.
 *
 * 언어는 하나다 — **깊이 + 캐스케이드**. 나가는 슬롯은 뒤로 물러나며 흐려지고 들어오는
 * 슬롯은 앞으로 나온다(레이어 돌리). 그 위에서 제목은 글자 단위로, About 본문은 줄
 * 단위로, 목록은 행 단위로 순차 도착한다. 여섯 가지 시안을 브라우저에서 비교한 뒤
 * 고른 것이고, 나머지 다섯(절제/마스크/조명/속도/시차)은 버렸다.
 *
 * 지켜야 하는 규칙 (home-sections.tsx의 주석에 이유가 있다):
 *
 * 1. 레이어 `opacity`는 절대 건드리지 않는다. 크로스페이드 쌍은 합이 정확히 1이라
 *    경계에서 밝기가 안 꺼지는 건데, 거기 손대면 매 경계마다 딥이 생긴다. 여기 효과는
 *    transform / filter, 그리고 레이어 *내부* 요소의 opacity만 쓴다.
 * 2. `scrollYProgress`를 읽는 useTransform은 전부 콜백 형태. 배열(키프레임) 형태는
 *    네이티브 스크롤 타임라인 경로를 타면서 두 번째 이후 호출자를 망가뜨린다.
 * 3. 레이아웃을 움직이는 속성은 금지. 레이어가 justify-center라 리플로우 = 점프다.
 * 4. 다섯 레이어가 항상 마운트돼 있으므로, 안 보이는 동안 `filter`는 "none"이어야
 *    한다(rampBlur 참고). 안 그러면 보이지도 않는 레이어 넷을 브라우저가 매 프레임
 *    래스터화해서 블러를 돌린다.
 * 5. 효과는 슬롯이 있을 때만 붙는다. reduced-motion 스택 경로에는 SlotFxProvider가
 *    아예 없어서 useSlotFx가 passthrough를 돌려주고, DOM은 효과 이전과 같아진다.
 */

// ---------------------------------------------------------------- slot context

// 지금 렌더 중인 슬롯이 누구고 그 슬롯의 스크롤 창이 어디인지. 효과 컴포넌트들이
// 프롭 드릴링 없이(ProjectsEntrance/ContactSection은 몇 겹 아래에 있다) 집어간다.
type SlotFx = { sectionKey: HomeSectionKey; reveal: Reveal };

const SlotContext = createContext<SlotFx | null>(null);

export function SlotFxProvider({
  sectionKey,
  reveal,
  children,
}: {
  sectionKey: HomeSectionKey;
  reveal: Reveal;
  children: ReactNode;
}) {
  const value = useMemo(
    () => ({ sectionKey, reveal }),
    // reveal.slot은 매 렌더 새 객체지만 그 안의 값은 스크롤과 무관하게 고정이라,
    // 실제로 바뀌는 필드만 의존성으로 잡는다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      sectionKey,
      reveal.scrollYProgress,
      reveal.viewportUnit,
      reveal.ramp,
      reveal.slot.start,
      reveal.slot.end,
      reveal.slot.isFirst,
      reveal.slot.isLast,
      reveal.slot.weight,
    ],
  );
  return <SlotContext.Provider value={value}>{children}</SlotContext.Provider>;
}

// ---------------------------------------------------------------- primitives

// 슬롯이 없는 곳(reduced-motion 스택 경로)에서는 애초에 아래 효과들이 선택되지 않지만,
// 실수로 렌더돼도 크래시하지 않도록 "이미 다 도착한" 정적 값으로 떨어뜨린다.
const IDLE_PROGRESS = motionValue(1);
const IDLE_REVEAL: Reveal = {
  scrollYProgress: IDLE_PROGRESS,
  slot: { start: 0, end: 1, weight: 1, isFirst: true, isLast: true },
  viewportUnit: 1,
  ramp: 1,
};

function useSlotReveal(): Reveal {
  return useContext(SlotContext)?.reveal ?? IDLE_REVEAL;
}

/**
 * 레이어 크로스페이드와 **같은 창**에서 도는 0..1 한 쌍.
 * `enter`는 [slot.start - ramp, slot.start], `exit`는 [slot.end - ramp, slot.end].
 * 둘 다 선형 원값이다 — 이징은 쓰는 쪽에서 고른다(크로스페이드처럼 합이 1이어야 하는
 * 제약이 없으므로 자유롭다).
 */
function useRamp(reveal: Reveal) {
  const { scrollYProgress, slot, ramp } = reveal;
  const enter = useTransform(scrollYProgress, (v) =>
    slot.isFirst
      ? 1
      : interpolateClamped(v, [slot.start - ramp, slot.start], [0, 1]),
  );
  const exit = useTransform(scrollYProgress, (v) =>
    slot.isLast
      ? 0
      : interpolateClamped(v, [slot.end - ramp, slot.end], [0, 1]),
  );
  return { enter, exit };
}

/** 목록 안 i번째 항목의 진행도. 전체 창을 겹치는 조각으로 나눠 순차 도착시킨다. */
function itemProgress(e: number, index: number, count: number, span = 0.6) {
  const gap = count > 1 ? (1 - span) / (count - 1) : 0;
  const from = index * gap;
  return easeOutCubic(interpolateClamped(e, [from, from + span], [0, 1]));
}

// 크로스페이드 램프상 enter === 0 (아직 안 왔다) 또는 exit === 1 (이미 갔다)이면 그
// 레이어의 opacity는 정확히 0이다. 그 구간에서 blur를 남겨두면 안 보이는 레이어 서넛을
// 브라우저가 매 프레임 래스터화해서 블러를 돌린다 — 다섯 레이어가 전부 마운트된 채로
// 있는 구조라 그 비용이 상시로 깔린다. 그래서 보이지 않는 동안은 무조건 "none".
function rampBlur(enter: number, exit: number, px: number) {
  if (enter <= 0 || exit >= 1) return "none";
  return px < 0.05 ? "none" : `blur(${px.toFixed(2)}px)`;
}

// 문단 자신의 리빌 진행도. 줄 단위 캐스케이드가 문단 리빌 창을 다시 잘게 쪼개 쓰기
// 위해 필요하다. 문단 0처럼 창이 없는 경우엔 프로바이더가 없고, 그때는 슬롯의 enter
// 램프로 떨어진다.
const ParagraphRevealContext = createContext<MotionValue<number> | null>(null);

export function ParagraphRevealProvider({
  value,
  children,
}: {
  value: MotionValue<number>;
  children: ReactNode;
}) {
  return (
    <ParagraphRevealContext.Provider value={value}>
      {children}
    </ParagraphRevealContext.Provider>
  );
}

// ---------------------------------------------------------------- fx types

export type LayerFxProps = { children: ReactNode };
export type HeadingFxProps = { label: string; className: string };
export type ContentFxProps = { className: string; children: ReactNode };
export type ItemFxProps = HTMLMotionProps<"li"> & {
  index: number;
  count: number;
};
export type LineFxProps = { index: number; count: number; children: ReactNode };

type SectionFx = {
  Heading: ComponentType<HeadingFxProps>;
  Content: ComponentType<ContentFxProps>;
  Item: ComponentType<ItemFxProps>;
  Line: ComponentType<LineFxProps>;
};

// ---------------------------------------------------------------- passthrough

function PlainLayer({ children }: LayerFxProps) {
  return <>{children}</>;
}

function PlainHeading({ label, className }: HeadingFxProps) {
  return <h2 className={className}>{label}</h2>;
}

function PlainContent({ className, children }: ContentFxProps) {
  return <div className={className}>{children}</div>;
}

function PlainItem({ index, count, ...rest }: ItemFxProps) {
  void index;
  void count;
  return <motion.li {...rest} />;
}

function PlainLine({ children }: LineFxProps) {
  return <span className="block">{children}</span>;
}

const PLAIN_SECTION: SectionFx = {
  Heading: PlainHeading,
  Content: PlainContent,
  Item: PlainItem,
  Line: PlainLine,
};

// ---------------------------------------------------------------- 깊이

// 나가는 슬롯은 뒤로 물러나며 흐려지고, 들어오는 슬롯은 앞으로 나온다. opacity는 여전히
// 레이어가 독점하므로 크로스페이드 합=1은 그대로다.
function DollyLayer({ children }: LayerFxProps) {
  const { enter, exit } = useRamp(useSlotReveal());
  const scale = useTransform(
    [enter, exit],
    ([e, x]: number[]) =>
      1 + (1 - easeOutCubic(e)) * 0.06 - easeOutCubic(x) * 0.06,
  );
  const filter = useTransform([enter, exit], ([e, x]: number[]) =>
    rampBlur(e, x, (1 - e) * 6 + x * 6),
  );
  return (
    <motion.div style={{ scale, filter }} className="w-full">
      {children}
    </motion.div>
  );
}

// ---------------------------------------------------------------- 캐스케이드

function CascadeHeading({ label, className }: HeadingFxProps) {
  const chars = Array.from(label);
  return (
    // 글자를 span으로 쪼개면 스크린 리더가 한 글자씩 읽는다. 접근 가능한 이름은
    // aria-label로 통째로 주고 쪼갠 조각은 숨긴다.
    <h2 className={className} aria-label={label}>
      <span aria-hidden="true">
        {chars.map((char, i) => (
          <CascadeChar key={i} char={char} index={i} count={chars.length} />
        ))}
      </span>
    </h2>
  );
}

function CascadeChar({
  char,
  index,
  count,
}: {
  char: string;
  index: number;
  count: number;
}) {
  const { enter, exit } = useRamp(useSlotReveal());
  const y = useTransform(
    [enter, exit],
    ([e, x]: number[]) =>
      (1 - itemProgress(e, index, count, 0.45)) * 24 + easeOutCubic(x) * 18,
  );
  const opacity = useTransform(enter, (e) =>
    itemProgress(e, index, count, 0.45),
  );
  const filter = useTransform([enter, exit], ([e, x]: number[]) =>
    rampBlur(e, x, (1 - itemProgress(e, index, count, 0.45)) * 6),
  );
  return (
    <motion.span
      style={{ y, opacity, filter }}
      className="inline-block whitespace-pre"
    >
      {char}
    </motion.span>
  );
}

function CascadeLine({ index, count, children }: LineFxProps) {
  const paragraph = useContext(ParagraphRevealContext);
  const { enter, exit } = useRamp(useSlotReveal());
  // 문단이 자기 리빌 창을 갖고 있으면 그 창을 줄 수만큼 다시 쪼개고, 없으면
  // (문단 0, 또는 슬롯이 짧아 창이 사라진 로케일) 슬롯 도착 램프로 떨어진다.
  const source = paragraph ?? enter;
  const y = useTransform(
    source,
    (v) => (1 - itemProgress(v, index, count, 0.7)) * 14,
  );
  const filter = useTransform([source, enter, exit], ([v, e, x]: number[]) =>
    rampBlur(e, x, (1 - itemProgress(v, index, count, 0.7)) * 4),
  );
  return (
    <motion.span style={{ y, filter }} className="block">
      {children}
    </motion.span>
  );
}

// Projects는 왼쪽에서 카드처럼 밀려 들어오고, Contact는 오른쪽에서 온다. 두 목록이
// 연달아 나오는 자리라 같은 방향이면 한 번 본 연출을 두 번 보는 셈이 된다.
function SlideRow({ index, count, ...rest }: ItemFxProps) {
  const { enter, exit } = useRamp(useSlotReveal());
  const x = useTransform(
    [enter, exit],
    ([e, ex]: number[]) =>
      (1 - itemProgress(e, index, count, 0.5)) * -40 + easeOutCubic(ex) * 30,
  );
  const opacity = useTransform(enter, (e) =>
    itemProgress(e, index, count, 0.5),
  );
  return <motion.li {...rest} style={{ x, opacity }} />;
}

function RiseRow({ index, count, ...rest }: ItemFxProps) {
  const { enter, exit } = useRamp(useSlotReveal());
  const x = useTransform(
    [enter, exit],
    ([e, ex]: number[]) =>
      (1 - itemProgress(e, index, count, 0.5)) * 36 - easeOutCubic(ex) * 24,
  );
  const opacity = useTransform(enter, (e) =>
    itemProgress(e, index, count, 0.5),
  );
  return <motion.li {...rest} style={{ x, opacity }} />;
}

// Life는 사진 액자 격자라 행 단위로 쪼갤 자리가 없다(그리드 배치가 타일 자신의
// className에 있어서 래퍼를 끼우면 배치가 깨진다). 섹션 통째로 눕혔다 세운다.
function TiltContent({ className, children }: ContentFxProps) {
  const { enter } = useRamp(useSlotReveal());
  const rotateX = useTransform(enter, (e) => (1 - easeOutCubic(e)) * 8);
  const y = useTransform(enter, (e) => (1 - easeOutCubic(e)) * 18);
  return (
    <motion.div
      style={{ rotateX, y, transformPerspective: 900 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ---------------------------------------------------------------- resolver

function section(overrides: Partial<SectionFx>): SectionFx {
  return { ...PLAIN_SECTION, ...overrides };
}

const SECTION_FX: Record<HomeSectionKey, SectionFx> = {
  about: section({ Heading: CascadeHeading, Line: CascadeLine }),
  projects: section({ Heading: CascadeHeading, Item: SlideRow }),
  life: section({ Heading: CascadeHeading, Content: TiltContent }),
  contact: section({ Heading: CascadeHeading, Item: RiseRow }),
};

const PLAIN_RESOLVED = { Layer: PlainLayer, ...PLAIN_SECTION };

/**
 * 이 슬롯에 붙일 효과 컴포넌트들. 슬롯이 없으면(reduced-motion 스택 경로) 전부
 * passthrough라 DOM이 연출 도입 이전과 같아진다.
 *
 * 컴포넌트를 훅에서 "골라" 받는 형태다 — 렌더 중에 만드는 게 아니라 모듈 최상위에 이미
 * 있는 것들 중 하나를 가리킬 뿐이다. 섹션마다 훅 개수가 다르므로, 가리키는 대상이
 * 바뀌면 언마운트/재마운트되는 것이 오히려 필요하다.
 */
export function useSlotFx(): SectionFx & { Layer: ComponentType<LayerFxProps> } {
  const slot = useContext(SlotContext);
  if (!slot) return PLAIN_RESOLVED;
  return { Layer: DollyLayer, ...SECTION_FX[slot.sectionKey] };
}
