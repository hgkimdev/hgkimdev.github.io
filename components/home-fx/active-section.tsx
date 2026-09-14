"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import {
  useMotionValueEvent,
  useTransform,
  type MotionValue,
} from "motion/react";

import type { Slot } from "@/components/home-fx/geometry";
import type { HomeSectionKey } from "@/lib/nav";

/**
 * Home 스크롤이 지금 어느 섹션에 있는지를 헤더로 흘리는 통로.
 *
 * 읽는 쪽(SiteHeader의 밑줄)과 쓰는 쪽(HomeSections)이 레이아웃 트리에서
 * 형제라 props로는 못 잇는다. 그래서 layout에서 둘을 함께 감싼다.
 *
 * **컨텍스트를 둘로 나눈 것이 핵심이다.** 값과 setter를 한 객체에 담으면
 * 섹션이 바뀔 때마다 객체 정체성이 변해서 setter만 쓰는 HomeSections까지
 * 다시 그려진다 — 핀 고정 스크롤 엔진 전체가 스크롤 도중 4번 리렌더된다는
 * 뜻이다. useState의 setter는 정체성이 고정이므로 따로 두면 그쪽 구독자는
 * 영영 리렌더되지 않는다.
 */
const ActiveSectionContext = createContext<HomeSectionKey | null>(null);

const SetActiveSectionContext = createContext<
  Dispatch<SetStateAction<HomeSectionKey | null>>
>(() => {});

/**
 * children을 prop으로 받는다 — 이 컴포넌트가 상태 때문에 다시 그려져도
 * children 엘리먼트의 정체성은 그대로라 React가 그 서브트리를 건너뛴다.
 * layout에서 서버 컴포넌트 트리를 그대로 통과시키는 것도 같은 이유다.
 */
export function ActiveSectionProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState<HomeSectionKey | null>(null);

  return (
    <SetActiveSectionContext.Provider value={setActive}>
      <ActiveSectionContext.Provider value={active}>
        {children}
      </ActiveSectionContext.Provider>
    </SetActiveSectionContext.Provider>
  );
}

/**
 * 현재 섹션. Home 히어로 위에 있거나 Home이 아닌 페이지에서는 `null`이다.
 * 헤더 밑줄은 이 `null`을 "그리지 않음"으로 쓴다 — 지금 어느 경로에 있는지
 * 따로 판별할 필요가 없다.
 */
export function useActiveSection(): HomeSectionKey | null {
  return useContext(ActiveSectionContext);
}

/** 값은 읽지 않고 쓰기만 하는 쪽(HomeSections)이 쓴다. 정체성이 고정이다. */
export function useSetActiveSection() {
  return useContext(SetActiveSectionContext);
}

/**
 * `keys`는 매 렌더 새로 만들어지는 배열이라 effect 의존성에 그대로 넣으면
 * effect가 렌더마다 다시 돈다(= cleanup의 setActive(null)이 매번 끼어든다).
 * 최신 값만 필요하므로 ref로 흘린다. 이 effect가 먼저 선언돼 있어야 아래
 * 구독 effect가 마운트 시점에 채워진 ref를 읽는다.
 */
function useLatestKeys(keys: HomeSectionKey[]) {
  const ref = useRef(keys);
  useEffect(() => {
    ref.current = keys;
  });
  return ref;
}

/**
 * 핀 고정 경로(PinnedSections)의 보고자. scrollYProgress에서 현재 슬롯을 뽑는다.
 *
 * **인덱스까지 MotionValue로 만든 뒤에 상태로 올린다.** 진행도를 직접 구독해
 * 매 프레임 setState하면 스크롤 중에 Home 전체가 초당 수십 번 리렌더된다.
 * useTransform으로 정수 인덱스를 만들면 실제로 값이 바뀌는 건 섹션 경계를
 * 넘는 순간뿐이라, 한 번 훑는 동안 상태 변경이 4번으로 끝난다.
 *
 * useTransform은 반드시 콜백 형태로 쓴다 — home-sections.tsx의 PinnedLayer
 * 주석에 적힌 이유(배열 형태는 같은 MotionValue를 읽는 형제들끼리 네이티브
 * 스크롤 타임라인 경로에서 서로의 키프레임을 깨뜨린다)가 여기에도 그대로
 * 적용된다.
 */
export function useReportActiveSlot({
  scrollYProgress,
  slots,
  ramp,
  keys,
}: {
  scrollYProgress: MotionValue<number>;
  slots: Slot[];
  ramp: number;
  keys: HomeSectionKey[];
}) {
  const setActive = useSetActiveSection();
  const keysRef = useLatestKeys(keys);

  // slots[0]은 히어로라 섹션이 아니다. 섹션은 slots[1..]이고 여기서 -1은 "아직
  // 히어로"를 뜻한다.
  //
  // 경계를 slot.start가 아니라 slot.start - ramp/2로 잡는 이유: start는 새
  // 레이어가 **완전히** 불투명해지는 지점이라, 거기서 표시를 바꾸면 화면이 이미
  // 다 바뀐 뒤에 밑줄이 뒤늦게 따라온다. 크로스페이드 한가운데(두 레이어의
  // 불투명도가 같은 지점)에서 넘겨야 눈과 표시가 같이 움직인다.
  const index = useTransform(scrollYProgress, (v) => {
    let found = -1;
    for (let i = 1; i < slots.length; i++) {
      if (v >= slots[i].start - ramp / 2) found = i - 1;
    }
    return found;
  });

  useMotionValueEvent(index, "change", (i) => {
    setActive(i >= 0 ? (keysRef.current[i] ?? null) : null);
  });

  // 마운트 동기화. "change"는 값이 **바뀔 때만** 울리므로, 뒤로가기로 이미
  // 스크롤된 위치에 복원돼 들어온 경우(components/scroll-restoration.tsx)
  // 초기값이 그대로 맞아떨어지면 한 번도 울리지 않는다. 그러면 스크롤을 다시
  // 건드리기 전까지 표시가 비어 있다.
  useEffect(() => {
    const i = index.get();
    setActive(i >= 0 ? (keysRef.current[i] ?? null) : null);
    // Home을 떠날 때 표시를 지운다 — 이 null이 헤더 밑줄의 "그리지 않음"
    // 조건이다.
    return () => setActive(null);
  }, [index, keysRef, setActive]);
}

/**
 * reduced-motion 경로(StackedSections)의 보고자. 저쪽은 스크롤 진행도를 읽는
 * 것이 하나도 없는 평범한 문서 흐름이라(그게 그 경로의 존재 이유다) 같은 계산을
 * 쓸 수 없다. 대신 섹션 엘리먼트를 직접 관찰한다.
 */
export function useReportVisibleSection(keys: HomeSectionKey[]) {
  const setActive = useSetActiveSection();
  const keysRef = useLatestKeys(keys);

  useEffect(() => {
    const list = keysRef.current;
    // StackedSections가 섹션마다 id={section.key}를 달아 둔다(앵커 링크의
    // 목적지이기도 하다). 그래서 ref를 새로 심지 않고 그대로 집어온다.
    const els = list
      .map((key) => document.getElementById(key))
      .filter((el): el is HTMLElement => el !== null);
    if (els.length === 0) return;

    const visible = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        }
        // 문서 순서로 첫 번째를 고른다. 경계에서 둘이 동시에 걸리는 순간에도
        // 결과가 흔들리지 않게 하려는 것.
        setActive(list.find((key) => visible.has(key)) ?? null);
      },
      // 뷰포트 높이 35% 지점에 1%짜리 가로 띠를 만든다. 섹션이 전부 한 화면
      // 높이라 이 띠에는 많아야 하나가 걸린다. 히어로가 띠를 덮고 있는 동안은
      // 아무것도 안 걸려서 null이 되고, 그게 곧 "아직 섹션에 안 들어왔다"다.
      { rootMargin: "-35% 0px -64% 0px" },
    );
    els.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
      setActive(null);
    };
  }, [keysRef, setActive]);
}
