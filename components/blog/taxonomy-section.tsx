"use client";

import Link from "next/link";
import { useState } from "react";

import { Pagination } from "@/components/blog/pagination";
import { cn } from "@/lib/utils";

export type TaxonomyItem = {
  key: string;
  label: string;
  count: number;
  href: string;
};

const ITEM = cn(
  "flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-[0.8125rem] whitespace-nowrap",
  "text-muted-foreground transition-colors hover:text-foreground",
  "min-[900px]:justify-between min-[900px]:gap-2 min-[900px]:rounded-none min-[900px]:border-0 min-[900px]:px-0 min-[900px]:py-0 min-[900px]:text-sm",
);

// 모바일 칩 줄은 줄바꿈하지 않고 가로로 스크롤한다. velog가 쓰는 방식이고,
// 이유는 높이가 항목 수와 무관해지기 때문이다 — flex-wrap으로 접으면 태그가
// 늘어날수록 칩 벽이 세로로 자라 글 목록을 아래로 밀어낸다.
//
// 오른쪽 끝은 컨테이너 패딩 밖으로 흘려보내고(-mr-4/pr-4) 페이드 마스크를
// 씌운다. 잘린 자리가 화면 가장자리에 딱 맞아떨어지면 더 있는지 없는지
// 구분이 안 된다. life-entrance.tsx의 모바일 포스터 스트립과 같은 이디엄.
// 라벨. 데스크톱에서는 밑줄 달린 헤딩이지만, 모바일에서는 스크롤 줄 왼쪽에
// 붙박이로 선다 — 헤딩을 따로 한 줄 차지하게 두면 두 축이 네 줄이 된다.
const HEADING = cn(
  "shrink-0 font-mono text-xs tracking-[0.06em] text-muted-foreground",
  "min-[900px]:border-b min-[900px]:border-border/60 min-[900px]:pb-2",
);

const SCROLLER = cn(
  "-mr-4 flex min-w-0 flex-1 snap-x scroll-pr-4 gap-1.5 overflow-x-auto pr-4",
  "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
  "[mask-image:linear-gradient(to_right,#000_calc(100%-2rem),transparent_100%)]",
  "min-[900px]:mr-0 min-[900px]:flex-col min-[900px]:gap-2.5 min-[900px]:overflow-visible",
  "min-[900px]:pr-0 min-[900px]:[mask-image:none]",
);

/**
 * 사이드바의 분류 축 하나(카테고리 또는 태그).
 *
 * 항목이 pageSize를 넘으면 그만큼만 보여주고 `‹ 1 2 ›`로 넘긴다 — 태그는
 * 글이 쌓일수록 끝없이 늘어나 사이드바가 페이지보다 길어지기 때문이다.
 * 접었다 펴는 기능은 두지 않는다: V3을 고른 이유가 "분류를 화면에 상시
 * 고정한다"인데, 접을 수 있게 하면 그 결정과 어긋난다.
 *
 * 모바일에서는 페이징을 걸지 않는다. 가로 스크롤 한 줄이라 항목이 늘어도
 * 높이가 그대로고, 거기서 또 페이지를 나누면 스크롤과 페이징이 같은 일을
 * 두 번 하게 된다. 그래서 항목은 전부 렌더하고 **현재 페이지 밖의 것만
 * 데스크톱에서 숨긴다** — 뷰포트를 JS로 재지 않아도 되고 하이드레이션
 * 불일치도 생기지 않는다.
 */
export function TaxonomySection({
  heading,
  items,
  activeKey,
  pageSize,
}: {
  heading: string;
  items: TaxonomyItem[];
  activeKey?: string;
  /** 없으면 페이징하지 않는다(카테고리처럼 개수가 고정된 축). */
  pageSize?: number;
}) {
  const pageCount = pageSize ? Math.ceil(items.length / pageSize) : 1;
  const [page, setPage] = useState(() => {
    if (!pageSize) return 0;
    // 지금 보고 있는 태그가 든 쪽부터 편다.
    const index = items.findIndex((item) => item.key === activeKey);
    return index < 0 ? 0 : Math.floor(index / pageSize);
  });
  if (items.length === 0) return null;

  const from = pageSize ? page * pageSize : 0;
  const to = pageSize ? from + pageSize : items.length;

  return (
    <div className="flex min-w-0 items-center gap-2.5 min-[900px]:flex-col min-[900px]:items-stretch min-[900px]:gap-3.5">
      <div className={HEADING}>{heading}</div>

      <ul className={SCROLLER}>
        {items.map((item, index) => (
          <li
            key={item.key}
            className={cn(
              "shrink-0 snap-start",
              // 현재 페이지 밖: 모바일에서는 스크롤로 닿을 수 있게 두고
              // 데스크톱에서만 숨긴다.
              (index < from || index >= to) && "min-[900px]:hidden",
            )}
          >
            <Link
              href={item.href}
              aria-current={item.key === activeKey ? "page" : undefined}
              className={cn(
                ITEM,
                item.key === activeKey && "font-medium text-foreground",
              )}
            >
              {item.label}
              <span className="font-mono text-[0.7rem] text-foreground/25">
                {item.count}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <Pagination
        page={page}
        pageCount={pageCount}
        onChange={setPage}
        className="hidden min-[900px]:flex"
      />
    </div>
  );
}
