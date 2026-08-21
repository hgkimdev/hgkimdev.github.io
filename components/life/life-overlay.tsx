"use client";

import { useRef, useState } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { AnimatePresence, motion } from "motion/react";
import { Volume2Icon, VolumeXIcon, XIcon } from "lucide-react";

import type { LifeCategory, LifeCategoryKey } from "@/content/life";
import {
  LifeCoverPlate,
  LifeMediaBackground,
} from "@/components/life/life-media";

// 본문 대비 한 단계 작은 조판. break-keep은 한글에서 필수다 — 기본 줄바꿈
// 규칙은 음절 사이 아무 데서나 끊어서 "있습니" / "다." 같은 조각을 만든다.
const WHY_TEXT =
  "text-sm leading-relaxed break-keep text-pretty text-foreground " +
  "sm:text-base md:text-lg";

// 항목 태그(tags)와 여행 버킷리스트(wish)가 같이 쓰는 칩. 성격은 다르지만
// 둘 다 "본문 옆에 붙는 짧은 조각"이라 생김새가 갈리면 화면만 시끄러워진다.
const CHIP = "rounded-full bg-foreground/5 px-2 py-0.5 text-foreground/70";

// 이 오버레이에는 backdrop-filter가 하나도 없다. 재생 중인 영상 위에 반투명
// 컨트롤을 띄우는 흔한 조합인데, 아래가 매 프레임 바뀌므로 블러도 매 프레임
// 다시 계산된다. Firefox 실측(실제 창, 프로세스별 CPU): 오버레이를 열어둔
// 상태가 코어의 38%였고 backdrop-filter만 전부 걷으면 28%로 떨어졌다.
// 합성을 맡는 parent 프로세스만 보면 30% -> 13%다. Chrome에서는 같은 차이가
// 노이즈에 묻혀 보이지 않는다 — 브라우저 하나만 보고 판단하면 놓친다.
//
// 하나씩 꺼서는 소용이 없다는 게 함정이었다. 백드롭만, 또는 캡슐만 꺼서는
// 3포인트뿐이고 전부 걷어내야 9포인트가 빠진다. 하나라도 남으면 Firefox는
// 비싼 경로를 유지한다.
//
// 잃는 것은 거의 없다. 배경이 bg-muted/85처럼 85% 불투명하면 그 뒤의 블러는
// 원래 보이지 않았다(끄기 전후 스크린샷이 구분되지 않는다). 70%였던 닫기
// 버튼만 영상 질감이 살짝 비쳐서 85%로 올려 맞췄다.

/**
 * 전체화면 탐색 오버레이.
 *
 * 스크롤 엔진 바깥에 있다는 게 핵심이다. Home의 핀 고정 레이어 안에서
 * 인터랙션을 하면 방문자가 노는 동안 스크롤이 조금만 움직여도 섹션이
 * 흐려지는데, Dialog로 빼면 그 충돌이 아예 없어진다. 포커스 트랩·Escape·
 * 본문 스크롤 잠금은 Base UI Dialog가 처리한다.
 */
export function LifeOverlay({
  categories,
  openKey,
  onOpenKeyChange,
}: {
  categories: LifeCategory[];
  openKey: LifeCategoryKey | null;
  onOpenKeyChange: (key: LifeCategoryKey | null) => void;
}) {
  const category = categories.find((c) => c.key === openKey) ?? null;
  // 선택을 카테고리와 묶어서 들고 있는다. 항목 id만 저장하면 카테고리가 바뀔 때
  // effect로 초기화해줘야 하는데(= 렌더 연쇄), 어느 카테고리의 선택인지까지
  // 같이 기억하면 다른 카테고리에서는 자연히 첫 항목으로 떨어진다.
  const [selected, setSelected] = useState<{
    key: LifeCategoryKey;
    id: string;
  } | null>(null);
  // 소리는 늘 꺼진 상태로 시작한다. 닫을 때 되돌리는 것도 같은 이유다 —
  // 다시 열었을 때 예고편 소리가 곧바로 터지는 것만큼 놀라는 일이 없다.
  const [muted, setMuted] = useState(true);

  const item =
    (selected?.key === openKey
      ? category?.items.find((i) => i.id === selected.id)
      : undefined) ??
    category?.items[0] ??
    null;

  // 방금 넘어온 방향. 0이면 탭으로 고른 것이다.
  //
  // 본문이 위아래로 뜨고 지는 기존 전환은 "골랐다"에는 맞지만 "밀었다"에는
  // 맞지 않는다 — 왼쪽으로 민 글이 위로 사라지면 손끝과 화면이 따로 논다.
  // 방향을 기억해 두면 민 쪽으로 빠지고 반대쪽에서 들어온다.
  const [swipeDir, setSwipeDir] = useState<-1 | 0 | 1>(0);

  function selectItem(id: string, direction: -1 | 0 | 1 = 0) {
    if (!openKey) return;
    setSwipeDir(direction);
    setSelected({ key: openKey, id });
  }

  const { layerRef: swipeLayerRef, handlers: swipeHandlers } = useItemSwipe(
    category?.items ?? [],
    item?.id ?? "",
    selectItem,
  );

  return (
    <Dialog.Root
      open={openKey !== null}
      onOpenChange={(open) => {
        if (!open) {
          onOpenKeyChange(null);
          setMuted(true);
        }
      }}
    >
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-background/70 transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0" />
        {/* `dark`는 테마 토글이 아니라 이 서브트리의 토큰 스코프다. globals.css의
            `.dark`가 --background/--foreground/--muted를 재정의하므로, 이 한 줄로
            오버레이 안의 모든 것(스크림, 목록, 하단 캡슐)이 라이트 테마에서도
            어두운 값으로 그려진다.

            전체화면 미디어 뷰어를 어두운 방으로 두는 건 취향이 아니라 색의
            문제다. 배경을 어둡게 덮으면 영상의 색 관계가 그대로 남지만, 밝게
            덮으면 채도가 흰색으로 빨려 들어가 우유를 부은 것처럼 뜬다. 밝은
            바탕 위에 어두운 글자를 유지하려면 그 흰 덮개가 반드시 진해야 하고,
            그래서 라이트 모드에서는 "덜 진하게"와 "읽히게"가 동시에 성립하지
            않았다. 방향을 뒤집으면 둘 다 성립한다. */}
        <Dialog.Popup className="dark fixed inset-0 z-50 overflow-hidden bg-background text-foreground transition duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0">
          {item ? (
            <LifeMediaBackground media={item.media} muted={muted} />
          ) : null}

          <div className="relative flex h-full flex-col">
            <header className="flex shrink-0 items-center justify-between gap-4 px-5 py-5 sm:px-10">
              <Dialog.Title className="flex items-baseline gap-3 font-mono text-sm text-muted-foreground">
                <span>Life</span>
                <span aria-hidden>/</span>
                <span className="text-foreground">{category?.label}</span>
              </Dialog.Title>
              <Dialog.Close className="flex size-9 items-center justify-center rounded-full border border-border bg-card/85 text-muted-foreground transition-colors hover:text-foreground">
                <XIcon className="size-4" />
                <span className="sr-only">닫기</span>
              </Dialog.Close>
            </header>

            {category && item ? (
              // 표지가 있으면 칸을 하나 더 연다. 배경 레이어에 절대 위치로
              // 띄우지 않는 건, 본문이 max-w-2xl이라 화면이 좁아질수록 오른쪽
              // 여백이 먼저 사라져서 어떤 % 값을 잡아도 md 언저리에서 글자
              // 위로 책이 올라타기 때문이다. 칸으로 두면 겹칠 수가 없다.
              <div
                className={`flex min-h-0 flex-1 flex-col px-5 pb-32 sm:px-10 md:grid md:grid-cols-[minmax(11rem,15rem)_1fr] md:gap-12 md:pb-28 ${
                  item.media.kind === "cover"
                    ? "lg:grid-cols-[minmax(11rem,15rem)_minmax(0,42rem)_1fr]"
                    : ""
                }`}
              >
                <ItemList
                  category={category}
                  activeId={item.id}
                  onSelect={selectItem}
                />

                <div
                  {...swipeHandlers}
                  // 세로는 브라우저에게, 가로는 이쪽으로. pinch-zoom을 같이
                  // 적어두지 않으면 이 영역에서만 확대가 막힌다.
                  style={{ touchAction: "pan-y pinch-zoom" }}
                  // overflow-x를 명시하는 게 핵심이다. overflow-y만 auto로 두면
                  // 나머지 축의 visible이 auto로 계산되는데(CSS 규칙), 그러면
                  // 이 칸이 가로로도 스크롤 컨테이너가 된다. 아래에서 본문을
                  // translateX로 밀 때 오른쪽으로 나간 만큼이 스크롤 가능
                  // 영역으로 잡혀서(실측: +70px 밀면 scrollWidth가 70px 늘고,
                  // -70px는 0 — LTR에서 왼쪽 넘침은 스크롤 대상이 아니다)
                  // 칩 목록 바로 위에 가로 스크롤바가 떴다.
                  //
                  // hidden은 스크롤바를 그리지 않는다. 가로로 잘리는 건 화면
                  // 끝에서 px-5만큼 안쪽이라 어차피 보이지 않던 자리다.
                  className="flex min-h-0 flex-1 flex-col justify-center overflow-x-hidden overflow-y-auto"
                >
                  {/* 손끝을 따라 움직이는 겹. AnimatePresence가 쥔 transform과
                      겹치지 않게 한 겹 밖에 둔다 — 같은 요소에 얹으면 넘어가는
                      순간 둘이 같은 transform을 두고 다툰다. */}
                  <div
                    ref={swipeLayerRef}
                    style={{
                      transform: "translateX(var(--swipe-x, 0px))",
                      transition:
                        "transform var(--swipe-dur, 0ms) cubic-bezier(0.22, 1, 0.36, 1)",
                    }}
                  >
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={item.id}
                        initial={
                          swipeDir
                            ? { opacity: 0, x: swipeDir * 44 }
                            : { opacity: 0, y: 12 }
                        }
                        animate={{ opacity: 1, x: 0, y: 0 }}
                        exit={
                          swipeDir
                            ? { opacity: 0, x: swipeDir * -32 }
                            : { opacity: 0, y: -8 }
                        }
                        transition={{
                          duration: swipeDir ? 0.2 : 0.28,
                          ease: "easeOut",
                        }}
                        className="flex max-w-2xl flex-col gap-4 pb-6"
                      >
                        <h3 className="text-3xl font-bold tracking-tight break-keep sm:text-5xl">
                          {item.title}
                        </h3>
                        <p className="font-mono text-xs text-muted-foreground sm:text-sm">
                          {item.meta}
                        </p>
                        <div className={`flex flex-col pt-2 ${WHY_TEXT}`}>
                          {item.why.map((line, i) => (
                            <span key={i} className="block">
                              {line}
                            </span>
                          ))}
                        </div>
                        {/* 태그는 why에 딸린 것이므로 구분선 없이 바로 붙인다.
                          아래 wish는 항목이 아니라 카테고리 전체의 것이라
                          선을 그어 떼어놓는다 — 같은 칩이지만 소속이 다르다. */}
                        {item.tags?.length ? (
                          <div className="mt-1 flex flex-wrap items-center gap-2 font-mono text-xs">
                            {item.tags.map((tag) => (
                              <span key={tag} className={CHIP}>
                                {tag}
                              </span>
                            ))}
                          </div>
                        ) : null}
                        {category.wish ? (
                          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border/70 pt-4 font-mono text-xs text-muted-foreground">
                            <span>{category.wish.label}</span>
                            {category.wish.entries.map((entry) => (
                              <span key={entry} className={CHIP}>
                                {entry}
                              </span>
                            ))}
                          </div>
                        ) : null}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>

                {/* 셋째 칸은 lg부터. 그보다 좁으면 본문이 이미 남는 폭을 다
                    쓰고 있어서, 책을 넣을 자리가 진짜로 없다.

                    가운데가 아니라 왼쪽에 붙인다. 이 칸은 1fr이라 화면이 넓어질수록
                    혼자 늘어나는데, 가운데 정렬이면 책이 본문에서 점점 멀어져
                    1920px에서는 사이가 350px까지 벌어진다. 왼쪽에 붙여두면 폭과
                    무관하게 본문에서 같은 거리에 선다 — 사이를 벌리는 건 그리드
                    gap 하나로 충분하다.

                    좁은 폭(1024·1280)에서는 칸이 책 폭까지 줄어 여유가 0이므로
                    이 정렬은 아무것도 바꾸지 않는다. */}
                {item.media.kind === "cover" ? (
                  <div className="hidden items-center justify-start lg:flex">
                    <LifeCoverPlate media={item.media} title={item.title} />
                  </div>
                ) : null}
              </div>
            ) : null}

            {/* 소리 토글은 영상이 있을 때만. 여행·책·언어는 정지 이미지라
                끄고 켤 소리가 없다.

                하단 묶음 바깥에 따로 두는 건, 그 묶음이 "어디를 볼지"를 고르는
                탐색 컨트롤이고 이건 "지금 이걸 어떻게 볼지"라 성격이 다르기
                때문이다.

                높이는 폭에 따라 갈린다. sm 이상에서는 CategoryDock과 같은
                줄이다 — 도크가 가운데 정렬이라 오른쪽 끝이 비어 있고, 640px
                에서도 도크와 98px 떨어진다. 그보다 좁아지면 그 여백이 사라져
                (실측: 360px에서 7px, 344px에서 -1px, 320px에서 -13px) 도크를
                파고들므로, ItemStrip 위로 올린다. 스트립은 w-full이라 옆으로
                피할 수 없고 위로만 피할 수 있다. */}
            {item?.media.kind === "youtube" ? (
              <button
                type="button"
                onClick={() => setMuted((m) => !m)}
                aria-pressed={!muted}
                className="absolute right-5 bottom-32 z-10 flex size-9 items-center justify-center rounded-full border border-border bg-card/85 text-muted-foreground transition-colors hover:text-foreground sm:right-10 sm:bottom-11"
              >
                {muted ? (
                  <VolumeXIcon className="size-4" />
                ) : (
                  <Volume2Icon className="size-4" />
                )}
                <span className="sr-only">
                  {muted ? "소리 켜기" : "소리 끄기"}
                </span>
              </button>
            ) : null}

            {/* 탐색 컨트롤은 전부 아래 한곳에 모은다. 폰에서 화면 위쪽은
                엄지가 닿지 않는 자리라, 목록을 상단에 가로로 뉘어두면 잘리는
                것도 문제지만 누르기도 불편했다. */}
            <div className="pointer-events-none absolute inset-x-0 bottom-6 z-10 flex flex-col items-center gap-3 sm:bottom-10">
              {category && item ? (
                <ItemStrip
                  category={category}
                  activeId={item.id}
                  onSelect={selectItem}
                />
              ) : null}
              <CategoryDock
                categories={categories}
                openKey={openKey}
                onOpenKeyChange={onOpenKeyChange}
              />
            </div>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/**
 * 카테고리 전환 캡슐 — 화면 아래 가운데에 떠 있다.
 *
 * 선택 표시가 그냥 켜지고 꺼지는 게 아니라 하나의 필로 미끄러진다. 필은
 * 직접 끌 수도 있다(shadcn Drawer의 스와이프 핸들과 같은 cursor-grab 감각).
 * 색은 shadcn 토큰만 쓴다 — 트랙은 bg-muted, 필은 bg-background + 그림자.
 * TabsList/TabsTrigger가 쓰는 것과 같은 조합이라 사이트의 나머지와 겉돌지
 * 않는다.
 */

/**
 * 본문을 옆으로 밀어 다음/이전 항목으로 넘기는 제스처 (터치 전용).
 *
 * 마우스는 일부러 받지 않는다. 포인터 종류를 안 가리면 데스크톱에서 글을
 * 드래그해 선택하는 순간 항목이 넘어가버린다. 넘길 방법은 폰에도 이미
 * 있으므로(ItemStrip) 이건 그 위에 얹는 지름길이지 유일한 길이 아니다.
 *
 * 세로 스크롤과 같은 표면을 쓰는 게 이 제스처의 전부다. 그래서 두 가지가
 * 필요하다. `touch-action: pan-y`로 세로는 브라우저에 넘기고 가로만 받아오고,
 * 처음 몇 px에서 어느 축인지 한 번 정한 뒤로는 그 판정을 바꾸지 않는다
 * (축 고정). 매 이벤트마다 다시 판단하면 비스듬히 긋는 손가락에 본문이
 * 좌우로 떨린다.
 */
// 축을 정하기 전에 지켜보는 거리. 짧으면 세로 스크롤이 가로로 오인되고,
// 길면 넘기기 시작이 굼뜨게 느껴진다.
const SWIPE_AXIS_LOCK = 10;
// 천천히 끌어서 넘길 때 필요한 거리.
const SWIPE_COMMIT_PX = 64;
// 짧고 빠르게 튕겼을 때. 거리는 모자라도 의도는 분명하다.
const SWIPE_FLICK_MS = 250;
const SWIPE_FLICK_PX = 24;
// 첫/마지막 항목에서 더 밀 때 손끝을 따라오는 비율. 벽에 딱 막히면 고장난
// 것처럼 보이고, 그대로 따라오면 넘어갈 것처럼 보인다.
const SWIPE_EDGE_RESIST = 4;

function useItemSwipe(
  items: LifeCategory["items"],
  activeId: string,
  onSelect: (id: string, direction: -1 | 1) => void,
) {
  const layerRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const startY = useRef(0);
  const startAt = useRef(0);
  // 제스처가 시작된 시점의 자리. 렌더 중에 다시 계산하지 않는다 — 넘기는
  // 도중에 인덱스가 바뀌면 고무줄 판정의 기준이 손 안에서 달라진다.
  const startIndex = useRef(0);
  const axis = useRef<"none" | "x" | "y">("none");
  const tracking = useRef(false);

  // 도크와 같은 이유로 커스텀 속성에 쓴다 — React가 쥔 style 문자열이 제스처
  // 내내 변하지 않아야 재렌더가 위치를 시작점으로 되돌리지 않는다.
  function paint(x: number, settleMs: number) {
    const el = layerRef.current;
    if (!el) return;
    el.style.setProperty("--swipe-x", `${x}px`);
    el.style.setProperty("--swipe-dur", `${settleMs}ms`);
  }

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (e.pointerType !== "touch") return;
    tracking.current = true;
    axis.current = "none";
    startX.current = e.clientX;
    startY.current = e.clientY;
    startAt.current = performance.now();
    startIndex.current = items.findIndex((i) => i.id === activeId);
    paint(0, 0);
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!tracking.current) return;
    const dx = e.clientX - startX.current;
    const dy = e.clientY - startY.current;

    if (axis.current === "none") {
      if (Math.abs(dx) < SWIPE_AXIS_LOCK && Math.abs(dy) < SWIPE_AXIS_LOCK) {
        return;
      }
      if (Math.abs(dy) >= Math.abs(dx)) {
        // 세로다. 이 제스처는 스크롤이므로 손을 뗀다.
        axis.current = "y";
        tracking.current = false;
        return;
      }
      axis.current = "x";
      // 본문 밖으로 손가락이 나가도 이벤트가 계속 오게 한다.
      e.currentTarget.setPointerCapture(e.pointerId);
    }

    const i = startIndex.current;
    const atEdge = (dx > 0 && i <= 0) || (dx < 0 && i >= items.length - 1);
    paint(atEdge ? dx / SWIPE_EDGE_RESIST : dx, 0);
  }

  function onPointerUp(e: React.PointerEvent<HTMLDivElement>) {
    if (!tracking.current) {
      paint(0, 260);
      return;
    }
    tracking.current = false;
    if (axis.current !== "x") return;

    const dx = e.clientX - startX.current;
    const held = performance.now() - startAt.current;
    const decided =
      Math.abs(dx) > SWIPE_COMMIT_PX ||
      (held < SWIPE_FLICK_MS && Math.abs(dx) > SWIPE_FLICK_PX);
    // 왼쪽으로 밀면 다음 항목이 따라 들어온다 — 종이를 넘기는 방향.
    const direction: -1 | 1 = dx < 0 ? 1 : -1;
    const next = startIndex.current + direction;

    if (decided && next >= 0 && next < items.length) {
      onSelect(items[next].id, direction);
      // 새 본문은 제 자리에서 시작해야 한다. 되돌아오는 애니메이션을 남겨두면
      // 들어오는 글이 옆에서 밀려들어오다 한 번 더 미끄러진다.
      paint(0, 0);
    } else {
      paint(0, 260);
    }
  }

  return {
    layerRef,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel: onPointerUp,
    },
  };
}

// 목표를 살짝 지나쳤다 돌아오는 커브.
const SPRING = "cubic-bezier(0.34, 1.56, 0.64, 1)";
// 양 끝에서 더 끌 때 늘어나는 여유. 벽에 딱 막히면 고무줄 느낌이 안 난다.
const ELASTIC_RANGE = 8;
// 이만큼 안 움직였으면 드래그가 아니라 탭으로 본다.
const DRAG_THRESHOLD = 4;

// 스트립 양 끝이 흐려지며 사라진다 — 칩이 딱 잘리면 거기서 끝난 것처럼 보인다.
const EDGE_FADE =
  "linear-gradient(to right, transparent 0, #000 1.25rem, #000 calc(100% - 1.25rem), transparent 100%)";

function nearestIndex(pos: number, count: number) {
  return Math.max(0, Math.min(count - 1, Math.round(pos)));
}

function CategoryDock({
  categories,
  openKey,
  onOpenKeyChange,
}: {
  categories: LifeCategory[];
  openKey: LifeCategoryKey | null;
  onOpenKeyChange: (key: LifeCategoryKey | null) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLDivElement>(null);
  const startPointerX = useRef(0);
  const startPillX = useRef(0);
  const trackLeft = useRef(0);
  const cellPx = useRef(0);
  const dragXRef = useRef(0);
  // 이 두 값은 state가 아니라 ref다. 재렌더를 아끼려는 게 아니라 —
  // 그 차이는 실측으로 잡히지도 않았다 — handlePointerUp이 이 값들을 읽기
  // 때문이다.
  //
  // state로 두면 pointerup 핸들러의 클로저에 잡히는 건 "마지막으로 커밋된"
  // 값이다. 메인 스레드가 밀려서 마지막 pointermove의 setState가 커밋되기
  // 전에 pointerup이 오면, 거기서는 hasDragged가 아직 false다 — 끌었는데도
  // 탭으로 처리돼 처음 누른 칸이 선택된다. 그리고 메인 스레드가 밀리는
  // 상황이란 게 이 오버레이의 기본 상태다. 밑에서 영상이 돌고 있다.
  //
  // ref는 이벤트 순서 그대로 읽히므로 그 창이 아예 없다.
  const hasDragged = useRef(false);

  const [dragIndex, setDragIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const count = categories.length;
  const activeIndex = Math.max(
    0,
    categories.findIndex((c) => c.key === openKey),
  );

  // dragXRef가 state가 아니게 된 대가로, 필의 위치는 React가 그려줄 수 없다.
  // 여기서 DOM에 직접 쓴다.
  //
  // transform을 통째로 쓰지 않고 커스텀 속성만 쓰는 게 중요하다. 드래그
  // 중에도 dragIndex 때문에 렌더가 몇 번 일어나는데, transform을 직접 써
  // 넣었다면 그 렌더가 React의 style 값으로 덮어써서 필이 시작점으로 튄다.
  // var()를 사이에 끼우면 React가 쥐고 있는 문자열은 드래그 내내 한 글자도
  // 변하지 않으므로 덮어쓸 것이 없다.
  //
  // 참고로 재렌더가 매 이벤트가 아니라 칸 경계에서만 일어나게 되는 건 이
  // 구조의 부수 효과일 뿐이다. 실제로 재봤지만(프로덕션 빌드, 드래그당
  // pointermove 250회/1500회) 차이가 이벤트 수에 비례해 커지지 않았다 —
  // 노이즈다. 성능을 이유로 이 구조를 지킬 필요는 없다.
  function setPillX(x: number) {
    dragXRef.current = x;
    pillRef.current?.style.setProperty("--pill-x", `${x}px`);
  }

  // 쉴 때 위치는 %로 잡는다. px로 잡으면 폭을 재야 하고, 재는 사이 한 프레임
  // 동안 필이 0번 자리에 있다가 미끄러져 들어오는 게 보인다. 한 칸이 곧 필
  // 자신의 너비라 index * 100%가 정확히 그 자리다.
  const transform = isDragging
    ? "translateX(var(--pill-x))"
    : `translateX(${activeIndex * 100}%)`;

  // 글자 색은 필이 지나가는 즉시 따라온다. 손 뗄 때까지 기다리면 필만 혼자
  // 움직이고 라벨은 뒤늦게 켜져서 반응이 없는 것처럼 느껴진다.
  const highlightIndex = isDragging ? dragIndex : activeIndex;

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    const track = trackRef.current;
    if (!track) return;
    // 포인터 캡처를 쓰면 window 리스너를 붙였다 떼는 수고가 없다. 캡슐 밖으로
    // 끌고 나가도, 밖에서 손을 떼도 이벤트가 계속 이 요소로 온다.
    e.currentTarget.setPointerCapture(e.pointerId);
    cellPx.current = track.offsetWidth / count;
    trackLeft.current = track.getBoundingClientRect().left;
    startPointerX.current = e.clientX;
    startPillX.current = activeIndex * cellPx.current;
    // setIsDragging보다 먼저 써야 한다. transform이 var(--pill-x)로 바뀌는
    // 첫 렌더 시점에 값이 이미 들어 있어야 필이 0px에서 한 프레임 깜빡이지
    // 않는다.
    setPillX(startPillX.current);
    hasDragged.current = false;
    setDragIndex(activeIndex);
    setIsDragging(true);
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!isDragging) return;
    const deltaX = e.clientX - startPointerX.current;
    if (Math.abs(deltaX) > DRAG_THRESHOLD) hasDragged.current = true;
    const maxX = (count - 1) * cellPx.current;
    const next = Math.max(
      -ELASTIC_RANGE,
      Math.min(maxX + ELASTIC_RANGE, startPillX.current + deltaX),
    );
    setPillX(next);
    // 이 값은 칸 경계를 넘을 때만 바뀌므로 state로 둬도 된다 — 끝에서 끝까지
    // 끌어도 많아야 네 번이다. 라벨 색이 필을 따라와야 하니 렌더가 필요하다.
    const index = nearestIndex(next / cellPx.current, count);
    if (index !== dragIndex) setDragIndex(index);
  }

  function handlePointerUp() {
    if (!isDragging) return;
    setIsDragging(false);
    // 끌었으면 놓은 자리에서 가장 가까운 칸, 탭이면 누른 자리의 칸.
    //
    // 탭을 button의 onClick에 맡길 수 없다는 게 함정이었다. setPointerCapture를
    // 걸면 뒤따르는 click까지 캡처한 요소로 재조준돼서 버튼에는 영영 닿지
    // 않는다(포인터로 누른 경우만 — 키보드 Enter는 그대로 버튼으로 간다).
    // 그래서 포인터 좌표에서 직접 칸을 계산한다.
    const index = hasDragged.current
      ? nearestIndex(dragXRef.current / cellPx.current, count)
      : nearestIndex(
          Math.floor(
            (startPointerX.current - trackLeft.current) / cellPx.current,
          ),
          count,
        );
    onOpenKeyChange(categories[index].key);
  }

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      // 끌고 나서 손을 떼면 click이 뒤따라 온다. 그대로 두면 지나쳐 온
      // 카테고리가 선택돼버리므로 캡처 단계에서 막는다.
      onClickCapture={(e) => {
        if (hasDragged.current) {
          e.preventDefault();
          e.stopPropagation();
        }
      }}
      className={`pointer-events-auto relative touch-none rounded-full border border-border bg-muted/85 p-1 shadow-lg select-none ${
        isDragging ? "cursor-grabbing" : "cursor-grab"
      }`}
    >
      <div
        ref={trackRef}
        className="relative grid"
        style={{ gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))` }}
      >
        {/* 선택 필. 버튼보다 아래에 깔아서 글자가 그 위에 그대로 남는다 —
            필 안에 글자를 넣으면 드래그 중에 밑의 글자와 겹쳐 보인다. */}
        <div
          ref={pillRef}
          aria-hidden
          className="absolute inset-y-0 left-0 z-0 rounded-full border border-border bg-background shadow-sm"
          style={{
            width: `${100 / count}%`,
            transform,
            transition: isDragging ? "none" : `transform 0.45s ${SPRING}`,
            willChange: isDragging ? "transform" : undefined,
          }}
        />

        {categories.map((c, i) => (
          <button
            key={c.key}
            type="button"
            onClick={() => onOpenKeyChange(c.key)}
            aria-current={c.key === openKey ? "true" : undefined}
            className={`relative z-10 rounded-full px-3 py-2 font-mono text-xs transition-colors sm:px-4 sm:text-sm ${
              i === highlightIndex
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * 모바일 전용 항목 목록 — 카테고리 캡슐 바로 위에 눕는 가로 스트립.
 *
 * 폭이 모자라면 잘리는 게 아니라 스크롤된다는 걸 보여주는 게 전부다. 세 가지가
 * 같이 있어야 그렇게 읽힌다: 스냅(한 칸씩 딱딱 걸림), 양쪽 여백(다음 칩이
 * 반쯤 걸쳐 보임), 가장자리 페이드(잘린 게 아니라 이어진다는 신호).
 *
 * md 이상에서는 왼쪽 세로 목록(ItemList)이 대신 나오므로 여기서는 숨는다.
 * 같은 목록을 두 벌 그리는 셈이지만 display:none 쪽은 접근성 트리에서도
 * 통째로 빠지므로, 한 번에 하나만 존재하는 것과 같다.
 */
function ItemStrip({
  category,
  activeId,
  onSelect,
}: {
  category: LifeCategory;
  activeId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <nav
      aria-label={`${category.label} 목록`}
      className="pointer-events-auto w-full md:hidden"
      style={{ maskImage: EDGE_FADE, WebkitMaskImage: EDGE_FADE }}
    >
      {/* scroll-px가 없으면 snap-start가 좌우 여백을 먹고 첫 칩을 가장자리에
          딱 붙여버린다 — 페이드 구간에 걸려서 잘린 것처럼 보였다. */}
      <div className="flex snap-x snap-mandatory scroll-px-6 gap-2 overflow-x-auto px-6 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {category.items.map((item) => {
          const active = item.id === activeId;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item.id)}
              aria-current={active ? "true" : undefined}
              className={`shrink-0 snap-start rounded-full border px-3 py-1.5 text-xs font-medium whitespace-nowrap shadow-sm transition-colors ${
                active
                  ? "border-border bg-background text-foreground"
                  : "border-transparent bg-muted/85 text-muted-foreground"
              }`}
            >
              {item.title}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function ItemList({
  category,
  activeId,
  onSelect,
}: {
  category: LifeCategory;
  activeId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <nav className="hidden shrink-0 flex-col gap-2 overflow-y-auto md:flex">
      {category.items.map((item) => {
        const active = item.id === activeId;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            aria-current={active ? "true" : undefined}
            className={`group relative rounded-lg px-3 py-2.5 text-left transition-colors ${
              active
                ? "bg-foreground/5 text-foreground"
                : "text-muted-foreground hover:bg-foreground/[0.03] hover:text-foreground"
            }`}
          >
            {/* 활성 항목 표시는 가로(모바일)에서는 아래쪽, 세로에서는 왼쪽. */}
            <span
              className={`absolute transition-opacity ${
                active ? "opacity-100" : "opacity-0"
              } inset-y-2 left-0 w-px bg-foreground`}
            />
            <span className="block text-sm font-medium break-keep">
              {item.title}
            </span>
            <span className="mt-0.5 block font-mono text-[0.7rem] text-muted-foreground">
              {item.meta}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
