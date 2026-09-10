"use client";

import { useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { motion } from "motion/react";

import type { LifeCategory, LifeCategoryKey } from "@/content/life";
import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

/**
 * Life 슬롯의 본문 — 한 화면짜리 "입구".
 *
 * 다섯 카테고리를 스크롤로 하나씩 훑게 하지 않는다. 그냥 지나가는 사람은
 * 한 화면에서 전체 지도를 보고 넘어가고, 궁금한 사람만 눌러 전체화면 탐색으로
 * 들어간다. 그래서 이 섹션의 슬롯 무게는 1이면 된다.
 *
 * 구성은 **활자 목차 + 배경 벽** 둘이다. 왼쪽에 다섯 줄짜리 목차가 판 위에
 * 서고, 그 뒤로 모든 항목의 그림이 화면을 가득 채운 채 천천히 아래로 흐른다.
 * 목차 줄에 손이 닿으면 그 카테고리의 그림만 벽에서 살아난다.
 *
 * 이 구조를 고른 이유는 카테고리마다 그림의 사정이 너무 다르기 때문이다.
 * 여행은 사진이 23장, 언어는 세 항목 중 표지가 하나뿐이다. 칸을 나눠 한 장씩
 * 담으면 빈 칸이 생기고(그림 없는 항목), 표지는 잘리고, 사진 23장은 숫자로만
 * 남는다. 벽은 다섯 카테고리가 함께 쓰므로 그 셋이 한꺼번에 사라진다 —
 * 대표는 목차 줄이고 그림은 공용 배경이다.
 */

/**
 * 배경 벽이 꽂히는 자리의 id.
 *
 * home-sections.tsx의 SectionContent가 섹션 제목보다 **앞에** 빈 div로
 * 심어두고, 벽은 거기로 포털된다. 왜 포털이어야 하는지는 FlowingWall 주석 참고.
 */
export const LIFE_WALL_SLOT_ID = "life-wall-slot";

/** 정의 순서(travel·books·movies·games·languages)가 곧 "01".."05" 번호다. */
const ORDER: LifeCategoryKey[] = [
  "travel",
  "books",
  "movies",
  "games",
  "languages",
];

/**
 * "책"에만 있는 예외. 표지 한 장을 대표로 걸면 "책"이 아니라 "그 책 한 권"의
 * 문처럼 읽혀서, 책이 쌓인 장면(셰익스피어 앤드 컴퍼니, 파리)을 같이 낸다.
 * 라이선스: CC BY-SA 4.0 — PhotoCredit이 그 짝이다.
 */
const BOOKS_HERO_SRC = "/life/sco-library.jpg";

/**
 * 썸네일이 없을 때 i.ytimg.com이 대신 주는 회색 판의 가로 폭.
 * life-media.tsx의 같은 상수와 같은 이유다 — 없는 썸네일은 404가 아니라
 * "성공한 회색 판"으로 도착하므로 onError가 아니라 크기로 걸러야 한다.
 */
const YT_PLACEHOLDER_WIDTH = 120;

/**
 * 예고편 썸네일에 구워진 레터박스 띠의 비율(위/아래).
 *
 * maxresdefault.jpg를 받아 검은 행을 세서 잰 값이다. 16:9 상자에 그대로
 * 그리면 이 띠가 그림의 일부인 것처럼 보이므로, 잘라낸 뒤의 비율로 상자를
 * 잡고 그만큼 확대해 밀어낸다. 여기 없는 id는 띠가 없다는 뜻이다.
 */
const YT_BARS: Record<string, { top: number; bottom: number }> = {
  "ZZY-Ytrw2co": { top: 0.133, bottom: 0.133 }, // 위플래쉬
  RvAOuhyunhY: { top: 0, bottom: 0.089 }, // 다크 워터스
};

/**
 * 벽에 쓸 작은 파생본 경로. scripts/build-blog-images.mjs가 구워 둔다.
 *
 * 벽 한 열은 240px쯤인데 원본은 1500~2000px다 — 폭으로 8배, 넓이로 69배짜리
 * 그림을 매 래스터화마다 축소해 그리게 된다(원본 스무 장 합계 10MB). 계속
 * 흐르는 벽에서는 그 비용이 이따금 프레임을 잡아먹는다.
 *
 * 파일이 없으면(스크립트를 아직 안 돌렸으면) onError가 원본으로 되돌린다.
 */
function wallVariant(src: string) {
  const key = src
    .replace(/^\//, "")
    .replace(/\.[^.]+$/, "")
    .replace(/\//g, "__");
  return `/_blog/${key}-wall480.webp`;
}

/** 벽에 한 칸으로 놓이는 그림 하나. */
type Shot = {
  key: string;
  cat: LifeCategoryKey;
  alt: string;
} & (
  /**
   * `ratio`는 원본 비율을 아는 경우에만 있다(갤러리 사진은 content/life.ts에
   * 실측 px가 박혀 있다). 표지처럼 모르는 그림은 비율을 정해 주지 않고
   * 브라우저가 그린 대로 흐르게 둔다 — 여기서 2:3 같은 값을 넘겨짚으면
   * 판형이 제각각인 표지(1984는 1200x2056, EGU는 475x640)가 잘린다.
   */
  | { kind: "img"; src: string; ratio?: number }
  | { kind: "yt"; id: string; ratio: number; scale: number; shift: number }
);

function ytShot(id: string, base: Omit<Shot, "kind">): Shot {
  const bars = YT_BARS[id] ?? { top: 0, bottom: 0 };
  const keep = 1 - bars.top - bars.bottom;
  return {
    ...base,
    kind: "yt",
    id,
    ratio: 16 / 9 / keep,
    scale: 1 / keep,
    // scale() 다음의 translateY는 이미 확대된 좌표계에서 먹으므로 s로 나누지
    // 않는다. 위아래 띠가 같으면 0이다.
    shift: (0.5 - (bars.top + (1 - bars.bottom)) / 2) * 100,
  };
}

/**
 * 카테고리가 가진 그림을 벽에 놓을 순서대로 편다.
 *
 * `limit`은 카테고리별 상한이다 — 여행은 사진이 23장이라 상한이 없으면
 * 벽을 통째로 먹는다.
 */
function shotsOf(category: LifeCategory, limit: number): Shot[] {
  const out: Shot[] = [];
  const push = (shot: Shot) => {
    if (out.length < limit) out.push(shot);
  };

  if (category.key === "books") {
    push({
      kind: "img",
      key: `${category.key}-hero`,
      cat: category.key,
      alt: "",
      src: BOOKS_HERO_SRC,
      ratio: 1240 / 1500,
    });
  }

  for (const item of category.items) {
    const base = { key: `${category.key}-${item.id}`, cat: category.key, alt: "" };
    const media = item.media;
    if (media.kind === "youtube") {
      push(ytShot(media.id, base));
    } else if (media.kind === "cover" || media.kind === "image") {
      push({ ...base, kind: "img", src: media.src, alt: media.alt });
    } else if (media.kind === "gallery") {
      for (const photo of media.photos) {
        push({
          ...base,
          key: `${category.key}-${photo.src}`,
          kind: "img",
          src: photo.src,
          ratio: photo.width / photo.height,
          alt: photo.alt,
        });
      }
    }
    // kind: "none"은 그림이 없다. 벽에 자리를 만들지 않고, 대신 목차 줄의
    // 개수에 그대로 남는다.
  }
  return out;
}

/** 카테고리를 라운드로빈으로 섞는다 — 안 섞으면 벽에 구획이 생긴다. */
function interleave(lists: Shot[][]): Shot[] {
  const out: Shot[] = [];
  for (let row = 0; ; row += 1) {
    let any = false;
    for (const list of lists) {
      if (list[row]) {
        out.push(list[row]);
        any = true;
      }
    }
    if (!any) return out;
  }
}

/**
 * 그림을 열에 나눈다.
 *
 * 단순 라운드로빈은 여기서 안 된다. 카테고리가 다섯인데 열이 여섯이라 한
 * 바퀴마다 한 칸씩 왼쪽으로 밀리고, 그림이 적은 카테고리(영화 3장)는 세 장
 * 모두 왼쪽 끝 두 열에 몰린다 — 하필 목차 판이 얹히는 자리다. 영화에 손을
 * 올려도 밝아지는 게 하나도 없었다.
 *
 * 그래서 가려지는 왼쪽 열에는 **여행 사진만** 깐다. 사진은 제목을 읽을 것이
 * 없어 질감으로만 있어도 손해가 없고, 표지·예고편처럼 "무엇인지"가 중요한
 * 그림은 전부 드러나는 자리로 간다.
 */
function spreadWall(shots: Shot[], columns: number, veiled: number): Shot[][] {
  const cols: Shot[][] = Array.from({ length: columns }, () => []);
  if (veiled <= 0) {
    shots.forEach((shot, i) => cols[i % columns].push(shot));
    return cols;
  }

  const photos = shots.filter((s) => s.cat === "travel");
  const rest = shots.filter((s) => s.cat !== "travel");

  const perVeiled = Math.max(1, Math.ceil(photos.length / columns) + 1);
  let taken = 0;
  for (let c = 0; c < veiled; c += 1) {
    for (let k = 0; k < perVeiled && taken < photos.length; k += 1) {
      cols[c].push(photos[taken]);
      taken += 1;
    }
  }

  // 남은 자리는 나머지 카테고리와 남은 여행 사진을 번갈아 — 표지끼리 뭉치면
  // 벽이 아니라 상품 목록처럼 읽힌다.
  const leftover = photos.slice(taken);
  const mixed: Shot[] = [];
  for (let i = 0; i < Math.max(rest.length, leftover.length); i += 1) {
    if (rest[i]) mixed.push(rest[i]);
    if (leftover[i]) mixed.push(leftover[i]);
  }
  mixed.forEach((shot, i) => cols[veiled + (i % (columns - veiled))].push(shot));
  return cols;
}

/**
 * 벽의 그림 한 장.
 *
 * **버튼이 아니라 장식이다.** 이유가 둘 있다.
 *
 * 하나, 핀 고정 레이어는 `opacity > 0.5`일 때만 포인터를 받도록 이미 게이트를
 * 두는데(home-sections.tsx의 PinnedLayer), 벽에 `pointer-events: auto`를 걸면
 * 그 게이트를 뚫는다 — 자손의 auto가 조상의 none을 되살리기 때문이다. 그래서
 * Projects에서 Life로 내려오는 도중, 아직 흐릿하게 떠오르는 그림 위에서
 * 호버가 먹었다.
 *
 * 둘, 한 열을 세 벌 쌓으므로 그림이 75장이다. 배경 질감에 불과한 것이 탭
 * 순서를 75칸 늘리는 건 그 자체로 손해다.
 *
 * 잃는 건 "그림을 눌러 그 카테고리를 여는" 길인데, 그건 원래 목차가 하는
 * 일이다. 벽은 목차에 손이 닿을 때 반응하기만 하면 된다.
 *
 * 다크에서 쉴 때만 밝기를 낮추는 것도 여기서 한다. 처음에는 벽 위에 배경색
 * 한 장을 덮었는데, 그러면 고른 카테고리만 되살릴 방법이 없다 — 흐르는
 * 트랙은 transform 애니메이션 때문에 자기 쌓임 맥락이라, 그 안의 그림에
 * z-index를 아무리 올려도 트랙 밖의 덮개 위로 나오지 못한다(실측: 호버
 * 전후 밝기가 31.4로 같았다). 그림마다 자기 불투명도로 누르면 그 문제가
 * 없다 — 어두운 배경 위에서 불투명도를 낮추는 건 곧 밝기를 낮추는 것이고,
 * filter와 달리 합성만으로 끝난다.
 */
function WallShot({
  shot,
  hover,
}: {
  shot: Shot;
  hover: LifeCategoryKey | null;
}) {
  const [src, setSrc] = useState(() =>
    shot.kind === "yt"
      ? // mqdefault(320x180)면 충분하다. maxres(1280x720)는 240px 상자에 네 배다.
        `https://i.ytimg.com/vi/${shot.id}/mqdefault.jpg`
      : wallVariant(shot.src),
  );

  function downgrade() {
    // 파생본이 아직 안 구워졌으면 원본으로. 원본은 항상 있다.
    // mqdefault는 어느 영상에나 있으므로 여기까지 오면 그릴 것이 없다.
    setSrc(shot.kind === "img" ? shot.src : "");
  }

  if (!src) return null;

  const dimmed = hover !== null && hover !== shot.cat;
  const lit = hover === shot.cat;

  return (
    <div aria-hidden>
      <span
        className={`relative block overflow-hidden rounded-sm bg-muted transition-[opacity,filter] duration-300 dark:opacity-55 ${
          dimmed ? "grayscale" : ""
        }`}
        // 인라인이 클래스를 이긴다 — 눌린 상태(dimmed)와 고른 상태(lit)는
        // 여기서 확정하고, 아무것도 고르지 않은 쉴 때만 위의 dark: 클래스에
        // 맡긴다.
        style={{
          aspectRatio: shot.ratio,
          opacity: dimmed ? 0.15 : lit ? 1 : undefined,
        }}
      >
        {/* next/image를 쓰지 않는 이유는 life-media.tsx의 같은 주석 참고 —
            정적 export(images.unoptimized)라 최적화가 없다. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={shot.alt}
          // 벽은 계속 흐르므로 화면 밖의 그림도 미리 받아둔다 — lazy로 두면
          // 흘러 들어오는 순간 디코드가 걸려 툭툭 끊긴다. 파생본이라 가볍다.
          loading="eager"
          decoding="async"
          onError={downgrade}
          onLoad={
            shot.kind === "yt"
              ? (e) => {
                  if (e.currentTarget.naturalWidth <= YT_PLACEHOLDER_WIDTH)
                    downgrade();
                }
              : undefined
          }
          className={shot.ratio ? "h-full w-full object-cover" : "w-full"}
          style={
            shot.kind === "yt"
              ? { transform: `scale(${shot.scale}) translateY(${shot.shift}%)` }
              : undefined
          }
        />
      </span>
    </div>
  );
}

/**
 * 포털 대상 노드. DOM 조회지 상태가 아니라서 useState+useEffect로 담으면
 * "효과 안에서 동기 setState"가 되고 한 프레임 늦게 그려지기도 한다. 같은
 * 노드를 계속 돌려주므로 스냅샷이 안정적이고, 바뀔 일이 없으니 구독은 빈
 * 함수다. 서버에서는 null이라 아무것도 그리지 않는다.
 */
const noopSubscribe = () => () => {};

function useWallSlot() {
  return useSyncExternalStore(
    noopSubscribe,
    () => document.getElementById(LIFE_WALL_SLOT_ID),
    () => null,
  );
}

/**
 * 넓은 화면인지. 좁으면 벽은 배경이 아니라 목차 아래 띠가 된다.
 *
 * matchMedia를 useSyncExternalStore로 구독한다 — 정적 export라 서버에서는
 * 화면 폭을 모르므로 넓은 쪽으로 그리고, 마운트 뒤 좁으면 바뀐다.
 * useState + useEffect로 하면 그 사이 하이드레이션 불일치가 난다.
 */
const WIDE_QUERY = "(min-width: 48rem)";

function subscribeWide(onChange: () => void) {
  const mql = window.matchMedia(WIDE_QUERY);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
}

function useWide() {
  return useSyncExternalStore(
    subscribeWide,
    () => window.matchMedia(WIDE_QUERY).matches,
    () => true,
  );
}

/**
 * 화면 전체를 쓰며 아래로 계속 흐르는 배경 벽.
 *
 * **왜 흐르나.** 멈춰 있는 벽은 아무리 채워도 "잘린 사진 몇 장"으로 읽힌다.
 * 천천히 흐르면 화면 밖에 계속 더 있다는 뜻이 되고, 위아래를 배경색으로
 * 흘려두면 어디서 시작하고 끝나는지가 사라진다.
 *
 * **이음매.** contact 섹션의 가로 마퀴와 같은 원리다 — 한 열에 같은 내용을
 * 세 벌 쌓고 한 벌 높이만큼만 움직인다. 끝나는 순간의 화면이 시작 순간과
 * 픽셀 단위로 같아 되감기가 보이지 않는다. 트랙에 `gap`을 쓰면 안 되는
 * 이유까지 globals.css의 life-wall-flow 주석에 적어 두었다.
 *
 * **열마다 주기가 다른 이유**는 시차 때문이다. 같은 속도로 흐르면 여섯 열이
 * 한 덩어리로 미끄러져 벽이 아니라 슬라이드 한 장처럼 보인다.
 *
 * **왜 포털인가.** 벽을 이 컴포넌트가 있는 자리에 그리면 음수 z-index를 줘도
 * 섹션 제목 위에 얹혀 제목을 가려버린다. 슬롯 본문(Content)은 슬롯 연출의
 * transform/filter 때문에 자기만의 쌓임 맥락이고, 음수 z-index는 그 맥락
 * 안에서만 내려가기 때문이다. 그래서 제목과 형제인 자리로 옮겨 꽂는다.
 * 포털이라도 React 트리는 그대로라 hover 상태는 목차와 공유된다.
 *
 * **좌표는 전부 그 포털 자리 기준이다.** 그 자리는 본문 칸(max-w-4xl)과
 * 정확히 같은 상자라, 여기서의 `-left-8`이 곧 "목차 왼쪽"이다. 화면 폭 기준
 * 퍼센트로 잡았을 때는 폭이 바뀔 때마다 판과 글이 어긋났다. 화면 끝까지
 * 넓히는 건 `calc(50% - 50vw)` — 이 상자의 50%가 곧 그 절반이라 정확히
 * 뷰포트 가장자리에 닿는다.
 */
function FlowingWall({
  shots,
  hover,
}: {
  shots: Shot[];
  hover: LifeCategoryKey | null;
}) {
  const wide = useWide();
  const slot = useWallSlot();

  const columnCount = wide ? 6 : 3;
  // 왼쪽 두 열은 목차 판이 얹히는 자리다 — spreadWall 주석 참고.
  const columns = spreadWall(shots, columnCount, wide ? 2 : 0);
  // 소수로 어긋나게 둬서 여섯 열이 다시 맞아떨어지는 순간이 오지 않게 한다.
  const periods = [68, 83, 59, 91, 74, 63];

  const body = (
    <div
      className={
        wide
          ? "absolute top-1/2 left-[calc(50%-50vw)] right-[calc(50%-50vw)] h-[118dvh] -translate-y-1/2"
          : "relative mt-2"
      }
    >
      <div
        className={`grid gap-1.5 overflow-hidden ${
          wide ? "h-full grid-cols-6" : "h-44 grid-cols-3"
        }`}
      >
        {columns.map((column, i) => (
          <div key={i} className="relative h-full overflow-hidden">
            {/* gap이 아니라 각 장의 아래 여백으로 띄운다 — gap을 쓰면 벌
                사이에도 간격이 하나 더 끼어 한 바퀴마다 gap/3만큼 어긋난다
                (실측 1.7~2.4px). globals.css의 life-wall-flow 주석 참고. */}
            <div
              className="life-wall-track grid [&>*]:mb-1.5"
              // prefers-reduced-motion은 globals.css에서 끈다 — 여기서 갈라
              // 그리면 하이드레이션이 깨진다(그 주석 참고).
              style={{
                animation: `life-wall-flow ${periods[i % periods.length]}s linear infinite`,
              }}
            >
              {[0, 1, 2].map((copy) =>
                column.map((shot) => (
                  <WallShot key={`${shot.key}-${copy}`} shot={shot} hover={hover} />
                )),
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 위아래 페이드. mask-image로 하면 흐르는 트랙이 그 마스크 표면 안에
          매 프레임 다시 칠해지므로, 배경색 그라디언트 두 장으로 대신한다 —
          벽 뒤가 늘 단색 배경이라 결과는 같다. */}
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-x-0 top-0 bg-gradient-to-b from-background to-transparent ${wide ? "h-24" : "h-6"}`}
      />
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-background to-transparent ${wide ? "h-40" : "h-14"}`}
      />
    </div>
  );

  if (!wide) return body;
  if (!slot) return null;

  return createPortal(
    <>
      {body}
      {/* 목차가 앉는 판.
          처음에는 글 자리에 배경색을 반투명하게 얹었는데, 그림이 지워지지도
          보이지도 않는 중간 상태가 넓게 생겨 지저분했다. 반투명 겹은 어떻게
          조절해도 "흐릿한 그림"을 만들 뿐이다 — 알파를 낮추면 글이 안 읽히고
          올리면 그림이 유령이 된다. 판은 가장자리가 분명해 그 중간 지대가
          아예 없다. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-8 -bottom-8 -left-8 z-20 w-[28rem] rounded-2xl bg-background shadow-[0_24px_60px_-24px_rgba(0,0,0,0.45)] ring-1 ring-border"
      />
    </>,
    slot,
  );
}

/** 사진 출처 표시. CC BY-SA 4.0 요건이라 판 안에 같이 둔다. */
function PhotoCredit({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  return (
    <p className="text-[0.65rem] text-muted-foreground">
      {dict.life.bookshelfPhotoLabel}: Shakespeare and Company, Paris ·{" "}
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
  );
}

/**
 * 목차 한 줄 — 번호·이름·티저·개수, 그리고 손이 닿으면 펼쳐지는 항목 목록.
 * Projects 슬롯의 목록과 같은 리듬이라 두 섹션이 한 페이지에서 어긋나지 않는다.
 *
 * 개수는 다섯 카테고리 모두 **항목 수**다. 여행만 사진 장수(23)를 보여준 적이
 * 있는데, 다른 줄이 전부 "몇 권·몇 편·몇 개"인 자리에 혼자 다른 단위가 앉으면
 * 같은 척도로 읽힌다.
 */
function IndexRow({
  category,
  index,
  onOpen,
  onHover,
}: {
  category: LifeCategory;
  index: number;
  onOpen: () => void;
  onHover: (key: LifeCategoryKey | null) => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      onPointerEnter={() => onHover(category.key)}
      onPointerLeave={() => onHover(null)}
      onFocus={() => onHover(category.key)}
      onBlur={() => onHover(null)}
      className="group grid grid-cols-[auto_1fr_auto] items-baseline gap-3 rounded-md border-t border-border px-1.5 py-2.5 text-left transition-[padding,background-color] duration-200 last:border-b hover:bg-muted/60 hover:pl-3 focus-visible:bg-muted/60 motion-reduce:transition-none"
    >
      <span className="font-mono text-[0.66rem] text-muted-foreground">
        {String(index + 1).padStart(2, "0")}
      </span>
      <span className="text-lg font-semibold tracking-tight sm:text-xl">
        {category.label}
        <span className="block text-xs font-normal break-keep text-muted-foreground">
          {category.teaser}
        </span>
        {/* 닫힌 동안에는 높이만 0이라 접근성 트리에도 남는다 — hidden으로
            지우면 스크린리더에서 목록이 통째로 사라진다. grid-rows 0fr→1fr은
            내용 높이를 몰라도 되는 유일한 펼침 방식이다. */}
        <span className="mt-0.5 grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 ease-out group-hover:grid-rows-[1fr] group-focus-visible:grid-rows-[1fr] motion-reduce:transition-none">
          <span className="overflow-hidden">
            <span className="mt-1.5 flex flex-col gap-0.5 border-t border-border/70 pt-1.5 text-[0.7rem] font-normal text-muted-foreground">
              {category.items.map((item) => (
                <span key={item.id} className="truncate">
                  {item.title}
                </span>
              ))}
            </span>
          </span>
        </span>
      </span>
      <span className="font-mono text-[0.66rem] text-muted-foreground">
        {category.items.length}
      </span>
    </button>
  );
}

export function LifeEntrance({
  categories,
  locale,
  onOpen,
  animateIn = false,
}: {
  categories: LifeCategory[];
  locale: Locale;
  onOpen: (key: LifeCategoryKey) => void;
  /** 입구가 스스로 등장 애니메이션을 재생할지. 핀 고정 스크롤 안에서는
   * 레이어 크로스페이드가 등장을 맡으므로 꺼진다. */
  animateIn?: boolean;
}) {
  const [hover, setHover] = useState<LifeCategoryKey | null>(null);

  const byKey = (key: LifeCategoryKey) => {
    const found = categories.find((category) => category.key === key);
    if (!found) throw new Error(`life category "${key}" missing`);
    return found;
  };
  const ordered = ORDER.map(byKey);
  // 벽이 계속 흐르므로 같은 그림이 금방 다시 돌아온다 — 여행 사진을 16장까지
  // 내서 한 바퀴가 길어지게 한다. 나머지는 넷이 합쳐 아홉 장이다.
  const shots = interleave(
    ordered.map((c) => shotsOf(c, c.key === "travel" ? 16 : 4)),
  );

  const entrance = animateIn
    ? ({
        initial: { opacity: 0, y: 14 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, amount: 0.3 },
        transition: { duration: 0.45, ease: "easeOut" },
      } as const)
    : undefined;

  return (
    <motion.div {...entrance} className="relative flex flex-col gap-3">
      <div className="grid content-start md:max-w-[22rem]">
        {ordered.map((category, index) => (
          <IndexRow
            key={category.key}
            category={category}
            index={index}
            onOpen={() => onOpen(category.key)}
            onHover={setHover}
          />
        ))}
      </div>

      <FlowingWall shots={shots} hover={hover} />
      <PhotoCredit locale={locale} />
    </motion.div>
  );
}
