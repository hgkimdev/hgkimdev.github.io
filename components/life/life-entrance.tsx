"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";

import type { LifeCategory, LifeCategoryKey, LifeMedia } from "@/content/life";

/**
 * Life 슬롯의 본문 — 한 화면짜리 "입구".
 *
 * 다섯 카테고리를 스크롤로 하나씩 훑게 하지 않는다. 그냥 지나가는 사람은
 * 한 화면에서 전체 지도를 보고 넘어가고, 궁금한 사람만 눌러 전체화면 탐색으로
 * 들어간다. 그래서 이 섹션의 슬롯 무게는 1이면 된다.
 *
 * 문은 안이 비쳐야 문으로 보인다. 같은 크기 카드 다섯 장을 늘어놓으면 어디를
 * 눌러야 할 이유가 없어서, 안에 든 그림을 그대로 창에 걸었다. 쉴 때는 흑백,
 * 다가가면 색이 돌아오고 무엇이 들었는지 올라온다.
 *
 * 넓은 화면에서는 다섯 칸을 더는 균등하게 두지 않는다. "책"을 큰 칸으로
 * 세워 대표 얼굴로 삼고, 나머지 넷은 그 옆에 작게 둘러싼다 — 어디부터 볼지가
 * 분명해야 문 앞에서 머뭇거리지 않는다. 좁은 화면은 다섯 칸이 다 같은 크기가
 * 아니면 가로 스크롤 순서가 뒤죽박죽으로 읽혀서, 기존의 균등한 가로 스냅
 * 스크롤을 그대로 둔다.
 */
export function LifeEntrance({
  categories,
  onOpen,
  animateIn = false,
}: {
  categories: LifeCategory[];
  onOpen: (key: LifeCategoryKey) => void;
  /** 액자가 스스로 등장 애니메이션을 재생할지. Poster의 주석 참고. */
  animateIn?: boolean;
}) {
  const byKey = (key: LifeCategoryKey) => {
    const found = categories.find((category) => category.key === key);
    if (!found) throw new Error(`life category "${key}" missing`);
    return found;
  };
  // 정의 순서(travel·books·movies·games·languages)가 곧 "01".."05" 번호다.
  // 벤토에서 자리를 옮겨도 번호는 그 순서를 따라야 오버레이 쪽 번호와 어긋나지
  // 않는다.
  const order: LifeCategoryKey[] = [
    "travel",
    "books",
    "movies",
    "games",
    "languages",
  ];
  const indexOf = (key: LifeCategoryKey) => order.indexOf(key);

  return (
    <>
      {/* 좁은 화면에서는 다섯 장이 세 줄로 접혀 한 화면을 넘긴다. 가로로
          눕히고 스냅 스크롤을 준다 — 오버레이 항목 스트립과 같은 방식.
          -mx-4/px-4는 섹션 좌우 여백을 뚫고 나가 화면 끝까지 스크롤되게
          하면서 첫 장은 본문과 같은 선에서 시작하게 한다. */}
      <div className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pt-1 pb-2 [-ms-overflow-style:none] [mask-image:linear-gradient(to_right,transparent_0,#000_1rem,#000_calc(100%-1.5rem),transparent_100%)] [scrollbar-width:none] md:hidden [&::-webkit-scrollbar]:hidden">
        {categories.map((category) => (
          <Poster
            key={category.key}
            category={category}
            index={indexOf(category.key)}
            animateIn={animateIn}
            onOpen={() => onOpen(category.key)}
          />
        ))}
      </div>

      {/* 넓은 화면: 벤토 그리드. 6칸 중 "책"이 절반(3칸×2행)을 차지하고
          영화·게임이 그 옆 2칸씩, 여행·언어가 맨 끝 1칸씩을 채운다. */}
      <div className="hidden md:grid md:grid-cols-6 md:[grid-auto-rows:13rem] md:gap-3">
        <BentoTile
          category={byKey("books")}
          index={indexOf("books")}
          animateIn={animateIn}
          onOpen={() => onOpen("books")}
          large
          className="md:col-span-3 md:row-span-2"
        />
        <BentoTile
          category={byKey("movies")}
          index={indexOf("movies")}
          animateIn={animateIn}
          onOpen={() => onOpen("movies")}
          className="md:col-start-4 md:col-span-2"
        />
        <BentoTile
          category={byKey("games")}
          index={indexOf("games")}
          animateIn={animateIn}
          onOpen={() => onOpen("games")}
          className="md:col-start-4 md:col-span-2 md:row-start-2"
        />
        <BentoTile
          category={byKey("travel")}
          index={indexOf("travel")}
          animateIn={animateIn}
          onOpen={() => onOpen("travel")}
          className="md:col-start-6"
        />
        <BentoTile
          category={byKey("languages")}
          index={indexOf("languages")}
          animateIn={animateIn}
          onOpen={() => onOpen("languages")}
          className="md:col-start-6 md:row-start-2"
        />
      </div>

      {/* CC BY-SA 4.0 요건: "책" 타일 배경(서점 실사진)의 출처 표시. 값을
          치장이 아니라 이 사진을 계속 쓰기 위한 최소 조건으로 둔다. */}
      <p className="text-right text-[0.65rem] text-muted-foreground">
        책장 사진: Shakespeare and Company, Paris ·{" "}
        <a
          href="https://commons.wikimedia.org/wiki/File:SCO_Front_Lib_Be_Not.jpg"
          target="_blank"
          rel="noreferrer"
          className="underline decoration-border underline-offset-2 hover:text-foreground"
        >
          Wikimedia Commons
        </a>{" "}
        (CC BY-SA 4.0)
      </p>
    </>
  );
}

// 오버레이 배경과 같은 그림을 쓴다. 입구에서 본 장면이 그대로 안에서 움직여야
// "그 문이 맞다"는 감각이 생긴다.
function stillOf(media: LifeMedia): string | null {
  if (media.kind === "youtube")
    return `https://i.ytimg.com/vi/${media.id}/maxresdefault.jpg`;
  // 표지도 액자에서는 그림이다. 3:4 액자에 세로 표지는 살짝만 잘린다.
  if (media.kind === "image" || media.kind === "cover") return media.src;
  // 사진첩은 cover가 있으면 그걸, 없으면 첫 장을 대표 그림으로 쓴다.
  if (media.kind === "gallery")
    return media.cover ?? media.photos[0]?.src ?? null;
  return null;
}

/**
 * "책" 문에만 있는 예외. 첫 항목(1984)의 표지를 배경으로 그대로 걸면 책이
 * 아니라 "1984라는 책 한 권"의 문처럼 읽힌다. 카테고리 전체를 대표하려면
 * 책이 쌓인 장면이 낫다고 판단해 서점 실사진(셰익스피어 앤드 컴퍼니, 파리)을
 * 배경으로 쓰고, 두 번째 항목(명상록)의 표지를 그 위에 한 장 세워 둔다.
 * 라이선스: CC BY-SA 4.0 — LifeEntrance 하단 출처 문구와 짝이다.
 */
const BOOKS_HERO_SRC = "/life/sco-library.jpg";

function Poster({
  category,
  index,
  animateIn,
  onOpen,
}: {
  category: LifeCategory;
  index: number;
  animateIn: boolean;
  onOpen: () => void;
}) {
  const prefersReducedMotion = useReducedMotion();
  const isBooks = category.key === "books";
  // 대표 그림은 첫 항목의 것을 쓴다 — 오버레이를 열었을 때 기본으로 선택되는
  // 항목이 바로 그것이라, 문을 열면 방금 본 장면이 그대로 이어진다. "책"만
  // 예외로 서점 사진을 쓴다(위 BOOKS_HERO_SRC 주석 참고).
  const [still, setStill] = useState(() =>
    isBooks ? BOOKS_HERO_SRC : stillOf(category.items[0]?.media ?? { kind: "none" }),
  );
  const number = String(index + 1).padStart(2, "0");

  // 핀 고정 스크롤 안에서는 등장 애니메이션을 끈다.
  //
  // 그 안에서는 모든 레이어가 `absolute inset-0`이라, 페이지가 열리는 순간부터
  // 다섯 장 전부 기하학적으로 뷰포트 안이다. IntersectionObserver는 조상의
  // opacity를 보지 않으므로 whileInView가 로드 시점에 곧바로 발동하고,
  // `once: true`라 거기서 끝난다 — 방문자가 Life까지 스크롤해 왔을 때는 이미
  // 소진된 애니메이션이었다. 스태거도 아무도 못 봤다.
  //
  // 등장은 레이어 자신의 크로스페이드가 이미 맡고 있으니 여기서 겹칠 이유가
  // 없다. 스크롤 엔진 밖(reduced-motion의 평범한 세로 배치)에서만 켠다.
  //
  // transition을 같이 떼는 게 중요하다. Motion의 `transition`은 whileHover에도
  // 걸려서, 저 delay가 남아 있으면 다섯 번째 액자는 마우스를 올리고 0.24초
  // 뒤에야 떠올랐다.
  const entrance = animateIn
    ? ({
        initial: { opacity: 0, y: 14 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, amount: 0.4 },
        transition: { duration: 0.4, delay: index * 0.06, ease: "easeOut" },
      } as const)
    : undefined;

  return (
    <motion.button
      type="button"
      onClick={onOpen}
      {...entrance}
      whileHover={prefersReducedMotion ? undefined : { y: -6 }}
      className={`group relative flex aspect-[3/4] w-36 shrink-0 snap-start flex-col justify-end overflow-hidden rounded-xl border border-border text-left transition-colors hover:border-foreground/25 [@media(max-height:820px)]:aspect-[4/5] [@media(max-height:700px)]:aspect-[4/3] ${still ? "bg-card" : "bg-muted/50"}`}
    >
      {still ? (
        // next/image를 쓰지 않는다: 정적 export(images.unoptimized)라 최적화가
        // 없고, 외부 호스트라 remotePatterns 설정만 늘어난다. 배경 레이어도
        // 같은 이유로 그냥 img를 쓴다.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={still}
          alt=""
          aria-hidden
          // 일부 영상은 maxres 썸네일이 없다. 깨진 이미지 대신 hq로 내려간다.
          onError={() =>
            setStill((src) =>
              src?.includes("maxresdefault")
                ? src.replace("maxresdefault", "hqdefault")
                : null,
            )
          }
          // scale-105는 장식이 아니라 필요해서 있다. 16:9 썸네일을 세로 액자에
          // object-cover로 넣으면 좌우만 잘리고 영화 썸네일에 구워진 위아래
          // 레터박스 검은 띠는 그대로 남는다. 조금 키워야 띠가 밖으로 나간다.
          className="absolute inset-0 h-full w-full scale-105 object-cover grayscale transition duration-500 group-hover:scale-[1.14] group-hover:grayscale-0 motion-reduce:transition-none motion-reduce:scale-105 motion-reduce:group-hover:scale-105"
        />
      ) : (
        // 그림이 없는 카테고리는 빈칸으로 두지 않고 활자로 채운다. 비어 보이는
        // 것과 비워둔 것은 다르게 읽힌다.
        <span
          aria-hidden
          className="absolute inset-x-0 top-[14%] text-center font-mono text-[5.5rem] leading-none font-bold text-foreground/[0.13] transition-colors duration-500 group-hover:text-foreground/20"
        >
          {number}
        </span>
      )}

      {/* 글이 놓이는 아래쪽만 덮는다. 위쪽은 그림이 그대로 보여야 한다. */}
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-card via-card/94 to-transparent" />

      <div className="relative flex flex-col gap-1 p-3">
        <span className="flex items-baseline justify-between font-mono text-[0.7rem] text-muted-foreground">
          <span>{number}</span>
          <span>{category.items.length}</span>
        </span>
        <span className="text-lg font-semibold tracking-tight">
          {category.label}
        </span>
        {/* 두 줄 자리를 늘 잡아둔다. 액자는 아래 정렬이라 한 줄짜리 티저와
            두 줄짜리가 섞이면 카테고리 이름의 높이가 액자마다 어긋난다. */}
        <span className="line-clamp-2 min-h-8 text-xs break-keep text-muted-foreground">
          {category.teaser}
        </span>

        {/* 안에 뭐가 들었는지 미리 보여준다. grid-rows 0fr→1fr은 내용 높이를
            몰라도 되는 유일한 펼침 방식이다 — max-height를 어림잡지 않아도
            된다. 닫힌 동안에는 접근성 트리에서도 빠지도록 hidden 대신 높이만
            0으로 두고 overflow로 자른다. */}
        <div className="mt-0.5 grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 ease-out group-hover:grid-rows-[1fr] group-focus-visible:grid-rows-[1fr] motion-reduce:transition-none">
          <div className="overflow-hidden">
            <ul className="flex flex-col gap-0.5 border-t border-border/70 pt-1.5 text-[0.7rem] text-muted-foreground">
              {category.items.map((item) => (
                <li key={item.id} className="truncate">
                  {item.title}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </motion.button>
  );
}

/**
 * 넓은 화면 전용 타일. Poster와 그림·스크림·번호·펼침 목록의 얼개는
 * 같지만 두 가지가 다르다 — 커서를 따라 살짝 기우는 3D 틸트, 그리고 유리
 * 질감 배지. `whileHover`로 y를 옮기지 않는 건 그 값도 여기서는 매 프레임
 * 계산하는 tilt transform 문자열 안에 같이 담기 때문이다 — 두 쪽이 각자
 * `transform`을 쓰면 나중에 쓴 쪽이 이긴다.
 *
 * pointermove마다 DOM에 직접 쓰는 것도 같은 이유다: React state로 두면
 * 마우스가 움직일 때마다 리렌더가 걸린다. ref 없이 이벤트의 currentTarget에
 * 바로 스타일을 쓰면 리렌더 없이 CSS transition만으로 부드럽게 따라온다.
 */
function BentoTile({
  category,
  index,
  animateIn,
  onOpen,
  large = false,
  className = "",
}: {
  category: LifeCategory;
  index: number;
  animateIn: boolean;
  onOpen: () => void;
  large?: boolean;
  className?: string;
}) {
  const prefersReducedMotion = useReducedMotion();
  const isBooks = category.key === "books";
  const [still, setStill] = useState(() =>
    isBooks ? BOOKS_HERO_SRC : stillOf(category.items[0]?.media ?? { kind: "none" }),
  );
  // 책 타일에만 뜨는 두 번째 표지. content/life.ts의 books 카테고리는
  // [1984, 명상록] 순으로 고정돼 있어 items[1]이 곧 명상록이다.
  const floatCover =
    isBooks && category.items[1]?.media.kind === "cover"
      ? category.items[1].media
      : null;
  const number = String(index + 1).padStart(2, "0");

  const entrance = animateIn
    ? ({
        initial: { opacity: 0, y: 14 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, amount: 0.4 },
        transition: { duration: 0.4, delay: index * 0.06, ease: "easeOut" },
      } as const)
    : undefined;

  function onPointerMove(e: React.PointerEvent<HTMLButtonElement>) {
    if (prefersReducedMotion) return;
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    const rx = (py - 0.5) * -10;
    const ry = (px - 0.5) * 10;
    el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
    el.style.setProperty("--mx", `${px * 100}%`);
    el.style.setProperty("--my", `${py * 100}%`);
  }
  function onPointerLeave(e: React.PointerEvent<HTMLButtonElement>) {
    e.currentTarget.style.transform = "";
  }

  return (
    <motion.button
      type="button"
      onClick={onOpen}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      {...entrance}
      className={`group relative flex flex-col justify-end overflow-hidden rounded-xl border border-border text-left hover:border-foreground/25 hover:shadow-[0_24px_48px_-20px_rgba(0,0,0,0.35)] motion-reduce:transform-none ${still ? "bg-card" : "bg-muted/50"} ${className}`}
      // transform은 pointermove마다 새 목표값을 받는다 — border-color/box-shadow와
      // 같은 300ms를 쓰면 커서를 늘 뒤늦게 쫓아가는 것처럼 느껴진다(각 프레임이
      // 이전 트랜지션이 끝나기 전에 새로 시작돼 계속 밀린다). 틸트만 120ms로
      // 짧게 끊어야 손 밑에 붙어 도는 느낌이 난다.
      style={{
        transition:
          "transform 120ms ease-out, border-color 300ms ease, box-shadow 300ms ease",
      }}
    >
      {/* 커서를 따라오는 하이라이트. 틸트와 짝이라 유리처럼 빛이 스치는
          느낌을 준다 — mix-blend-overlay라 배경이 밝든 어둡든 자연스럽다. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[3] opacity-0 transition-opacity duration-300 group-hover:opacity-100 motion-reduce:hidden"
        style={{
          background:
            "radial-gradient(220px circle at var(--mx, 50%) var(--my, 50%), rgba(255,255,255,.5), transparent 60%)",
          mixBlendMode: "overlay",
        }}
      />

      {still ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={still}
          alt=""
          aria-hidden
          onError={() =>
            setStill((src) =>
              src?.includes("maxresdefault")
                ? src.replace("maxresdefault", "hqdefault")
                : null,
            )
          }
          className="absolute inset-0 h-full w-full scale-105 object-cover grayscale transition duration-500 group-hover:scale-[1.14] group-hover:grayscale-0 motion-reduce:transition-none motion-reduce:scale-105 motion-reduce:group-hover:scale-105"
        />
      ) : (
        <span
          aria-hidden
          className="absolute inset-x-0 top-[16%] text-center font-mono text-5xl leading-none font-bold text-foreground/[0.13] transition-colors duration-500 group-hover:text-foreground/20"
        >
          {number}
        </span>
      )}

      {floatCover && (
        <div className="absolute top-4 right-4 z-[2] aspect-[2/3] w-[34%] overflow-hidden rounded-md border border-white/50 shadow-[0_18px_34px_-10px_rgba(0,0,0,0.4)] transition-transform duration-400 [transform:rotate(6deg)] group-hover:[transform:rotate(2deg)_translateY(-6px)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={floatCover.src} alt="" aria-hidden className="h-full w-full object-cover" />
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 z-[1] h-2/3 bg-gradient-to-t from-card via-card/94 to-transparent" />

      <div className="relative z-[2] flex flex-col gap-1 p-3.5">
        <span
          className={`font-semibold tracking-tight ${large ? "text-2xl" : "text-base"}`}
        >
          {category.label}
        </span>
        {large && (
          <span className="line-clamp-2 min-h-8 text-xs break-keep text-muted-foreground">
            {category.teaser}
          </span>
        )}

        <div className="mt-0.5 grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 ease-out group-hover:grid-rows-[1fr] group-focus-visible:grid-rows-[1fr] motion-reduce:transition-none">
          <div className="overflow-hidden">
            <ul className="flex flex-col gap-0.5 border-t border-border/70 pt-1.5 text-[0.7rem] text-muted-foreground">
              {category.items.map((item) => (
                <li key={item.id} className="truncate">
                  {item.title}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </motion.button>
  );
}
