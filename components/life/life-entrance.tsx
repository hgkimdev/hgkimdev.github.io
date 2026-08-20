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
 */
export function LifeEntrance({
  categories,
  intro,
  onOpen,
}: {
  categories: LifeCategory[];
  intro: string;
  onOpen: (key: LifeCategoryKey) => void;
}) {
  return (
    <>
      <p className="max-w-md text-base break-keep text-pretty text-muted-foreground sm:text-lg">
        {intro}
      </p>

      {/* 좁은 화면에서는 다섯 장이 세 줄로 접혀 한 화면을 넘긴다. 가로로
          눕히고 스냅 스크롤을 준다 — 오버레이 항목 스트립과 같은 방식.
          -mx-4/px-4는 섹션 좌우 여백을 뚫고 나가 화면 끝까지 스크롤되게
          하면서 첫 장은 본문과 같은 선에서 시작하게 한다. */}
      <div className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pt-1 pb-2 [-ms-overflow-style:none] [mask-image:linear-gradient(to_right,transparent_0,#000_1rem,#000_calc(100%-1.5rem),transparent_100%)] [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-5 md:overflow-visible md:px-0 md:[mask-image:none] [&::-webkit-scrollbar]:hidden">
        {categories.map((category, i) => (
          <Poster
            key={category.key}
            category={category}
            index={i}
            onOpen={() => onOpen(category.key)}
          />
        ))}
      </div>
    </>
  );
}

// 오버레이 배경과 같은 그림을 쓴다. 입구에서 본 장면이 그대로 안에서 움직여야
// "그 문이 맞다"는 감각이 생긴다.
function stillOf(media: LifeMedia): string | null {
  if (media.kind === "youtube")
    return `https://i.ytimg.com/vi/${media.id}/maxresdefault.jpg`;
  if (media.kind === "image") return media.src;
  return null;
}

function Poster({
  category,
  index,
  onOpen,
}: {
  category: LifeCategory;
  index: number;
  onOpen: () => void;
}) {
  const prefersReducedMotion = useReducedMotion();
  // 대표 그림은 첫 항목의 것을 쓴다 — 오버레이를 열었을 때 기본으로 선택되는
  // 항목이 바로 그것이라, 문을 열면 방금 본 장면이 그대로 이어진다.
  const [still, setStill] = useState(() =>
    stillOf(category.items[0]?.media ?? { kind: "none" }),
  );
  const number = String(index + 1).padStart(2, "0");

  return (
    <motion.button
      type="button"
      onClick={onOpen}
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: "easeOut" }}
      whileHover={prefersReducedMotion ? undefined : { y: -6 }}
      className={`group relative flex aspect-[3/4] w-36 shrink-0 snap-start flex-col justify-end overflow-hidden rounded-xl border border-border text-left transition-colors hover:border-foreground/25 md:w-auto [@media(max-height:820px)]:aspect-[4/5] [@media(max-height:700px)]:aspect-[4/3] ${still ? "bg-card" : "bg-muted/50"}`}
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
