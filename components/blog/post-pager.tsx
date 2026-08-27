"use client";

import Link from "next/link";
import { ChevronDownIcon } from "lucide-react";
import { useId, useState } from "react";

import { Pagination } from "@/components/blog/pagination";
import { localizeHref, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 5;

export type PagerPost = { slug: string; title: string };

/**
 * 글 상단의 목록. 제목만 다섯 개씩 보여주고 숫자로 넘긴다.
 *
 * 기본값은 접힌 상태다. 글을 읽으러 들어온 사람에게 제목 다섯 줄을 먼저
 * 들이밀 이유가 없다 — 다른 글을 찾을 때만 펴면 된다.
 *
 * 페이지 넘김은 라우트가 아니라 클라이언트 상태다 — 읽던 글을 벗어나지 않고
 * 다른 글을 훑어보라고 있는 물건이라, 넘길 때마다 페이지가 갈리면 목적과
 * 어긋난다. 정적 export에서 페이지 수만큼 라우트를 만들지 않아도 되는 건 덤.
 *
 * 펼쳤을 때는 지금 보고 있는 글이 들어 있는 쪽부터 보여준다. 자기 위치가
 * 먼저 보여야 앞뒤로 몇 편이 더 있는지 감이 잡힌다.
 */
export function PostPager({
  posts,
  currentSlug,
  locale,
}: {
  posts: PagerPost[];
  currentSlug: string;
  locale: Locale;
}) {
  const dict = getDictionary(locale);
  const pageCount = Math.ceil(posts.length / PAGE_SIZE);
  const [page, setPage] = useState(() => {
    const index = posts.findIndex((p) => p.slug === currentSlug);
    return index < 0 ? 0 : Math.floor(index / PAGE_SIZE);
  });
  const [open, setOpen] = useState(false);
  const listId = useId();

  if (posts.length <= 1) return null;

  const shown = posts.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  return (
    <nav aria-label={dict.blog.postList} className="flex flex-col gap-2">
      {/* 접이식 UI의 표준형 — 행 전체가 클릭 영역이라 눌러야 하는 물건임이
          모양만으로 전달된다. 펼쳤을 때는 아래 목록이 자기 위 테두리를
          그리므로 이 행의 아래 테두리를 지운다(가로선 두 줄이 나란히 서면
          조용한 읽기 화면에서 유독 무겁다). */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={listId}
        className={cn(
          "flex w-full items-center justify-between gap-4 border-y border-border/60 py-3",
          "font-mono text-[0.8125rem] tracking-[0.04em] text-foreground/70",
          "transition-colors hover:border-foreground/40 hover:text-foreground",
          // hover에서 border-color를 다시 칠하므로 아래 테두리는 양쪽 다 꺼야 한다.
          open && "border-b-transparent hover:border-b-transparent",
        )}
      >
        <span>{dict.blog.postList}</span>
        <ChevronDownIcon
          className={cn(
            "size-3.5 transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>

      {/* 접혀 있을 때는 아예 그리지 않는다. 숨겨만 두면 링크 다섯 개가
          접근성 트리와 탭 순서에 그대로 남는다. */}
      {open ? (
        <>
          <ul
            id={listId}
            className="flex flex-col divide-y divide-border/60 border-y border-border/60"
          >
            {shown.map((post) => {
              const isCurrent = post.slug === currentSlug;
              return (
                <li key={post.slug}>
                  {isCurrent ? (
                    <span
                      aria-current="page"
                      className="block truncate py-2.5 text-sm font-medium text-foreground"
                    >
                      {post.title}
                    </span>
                  ) : (
                    <Link
                      href={localizeHref(`/blog/${post.slug}`, locale)}
                      className="block truncate py-2.5 pl-0 text-sm text-muted-foreground transition-[padding-left,color] duration-200 hover:pl-2 hover:text-foreground focus-visible:pl-2 focus-visible:text-foreground focus-visible:outline-none"
                    >
                      {post.title}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>

          <Pagination
            page={page}
            pageCount={pageCount}
            onChange={setPage}
            labels={{
              prevPage: dict.blog.prevPage,
              nextPage: dict.blog.nextPage,
              pageLabel: dict.blog.pageLabel,
            }}
          />
        </>
      ) : null}
    </nav>
  );
}
