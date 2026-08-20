"use client";

import { useRef, useState } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { AnimatePresence, motion } from "motion/react";
import { XIcon } from "lucide-react";

import type { LifeCategory, LifeCategoryKey } from "@/content/life";
import { LifeMediaBackground } from "@/components/life/life-media";

// 본문 대비 한 단계 작은 조판. break-keep은 한글에서 필수다 — 기본 줄바꿈
// 규칙은 음절 사이 아무 데서나 끊어서 "있습니" / "다." 같은 조각을 만든다.
const WHY_TEXT =
  "text-sm leading-relaxed break-keep text-pretty text-foreground " +
  "sm:text-base md:text-lg";

// 항목 태그(tags)와 여행 버킷리스트(wish)가 같이 쓰는 칩. 성격은 다르지만
// 둘 다 "본문 옆에 붙는 짧은 조각"이라 생김새가 갈리면 화면만 시끄러워진다.
const CHIP = "rounded-full bg-foreground/5 px-2 py-0.5 text-foreground/70";

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

  const item =
    (selected?.key === openKey
      ? category?.items.find((i) => i.id === selected.id)
      : undefined) ??
    category?.items[0] ??
    null;

  return (
    <Dialog.Root
      open={openKey !== null}
      onOpenChange={(open) => {
        if (!open) onOpenKeyChange(null);
      }}
    >
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0" />
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
          {item ? <LifeMediaBackground media={item.media} /> : null}

          <div className="relative flex h-full flex-col">
            <header className="flex shrink-0 items-center justify-between gap-4 px-5 py-5 sm:px-10">
              <Dialog.Title className="flex items-baseline gap-3 font-mono text-sm text-muted-foreground">
                <span>Life</span>
                <span aria-hidden>/</span>
                <span className="text-foreground">{category?.label}</span>
              </Dialog.Title>
              <Dialog.Close className="flex size-9 items-center justify-center rounded-full border border-border bg-card/70 text-muted-foreground backdrop-blur transition-colors hover:text-foreground">
                <XIcon className="size-4" />
                <span className="sr-only">닫기</span>
              </Dialog.Close>
            </header>

            {category && item ? (
              <div className="flex min-h-0 flex-1 flex-col px-5 pb-32 sm:px-10 md:grid md:grid-cols-[minmax(11rem,15rem)_1fr] md:gap-12 md:pb-28">
                <ItemList
                  category={category}
                  activeId={item.id}
                  onSelect={(id) =>
                    openKey && setSelected({ key: openKey, id })
                  }
                />

                <div className="flex min-h-0 flex-1 flex-col justify-center overflow-y-auto">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.28, ease: "easeOut" }}
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
            ) : null}

            {/* 탐색 컨트롤은 전부 아래 한곳에 모은다. 폰에서 화면 위쪽은
                엄지가 닿지 않는 자리라, 목록을 상단에 가로로 뉘어두면 잘리는
                것도 문제지만 누르기도 불편했다. */}
            <div className="pointer-events-none absolute inset-x-0 bottom-6 z-10 flex flex-col items-center gap-3 sm:bottom-10">
              {category && item ? (
                <ItemStrip
                  category={category}
                  activeId={item.id}
                  onSelect={(id) =>
                    openKey && setSelected({ key: openKey, id })
                  }
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
  const startPointerX = useRef(0);
  const startPillX = useRef(0);
  const trackLeft = useRef(0);
  const cellPx = useRef(0);

  const [dragX, setDragX] = useState(0);
  const [dragIndex, setDragIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [hasDragged, setHasDragged] = useState(false);

  const count = categories.length;
  const activeIndex = Math.max(
    0,
    categories.findIndex((c) => c.key === openKey),
  );

  // 쉴 때 위치는 %로 잡는다. px로 잡으면 폭을 재야 하고, 재는 사이 한 프레임
  // 동안 필이 0번 자리에 있다가 미끄러져 들어오는 게 보인다. 한 칸이 곧 필
  // 자신의 너비라 index * 100%가 정확히 그 자리다.
  const transform = isDragging
    ? `translateX(${dragX}px)`
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
    setDragX(startPillX.current);
    setDragIndex(activeIndex);
    setIsDragging(true);
    setHasDragged(false);
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!isDragging) return;
    const deltaX = e.clientX - startPointerX.current;
    if (Math.abs(deltaX) > DRAG_THRESHOLD) setHasDragged(true);
    const maxX = (count - 1) * cellPx.current;
    const next = Math.max(
      -ELASTIC_RANGE,
      Math.min(maxX + ELASTIC_RANGE, startPillX.current + deltaX),
    );
    setDragX(next);
    setDragIndex(nearestIndex(next / cellPx.current, count));
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
    const index = hasDragged
      ? dragIndex
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
        if (hasDragged) {
          e.preventDefault();
          e.stopPropagation();
        }
      }}
      className={`pointer-events-auto relative touch-none rounded-full border border-border bg-muted/85 p-1 shadow-lg backdrop-blur select-none ${
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
                  : "border-transparent bg-muted/85 text-muted-foreground backdrop-blur"
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
