"use client";

import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { cn } from "@/lib/utils";

// 숫자 버튼과 화살표가 같은 크기·모양을 쓴다. 한 줄에 섞여 있으니 눌리는
// 면적이 어긋나면 바로 눈에 띈다.
const BUTTON =
  "inline-flex size-7 shrink-0 items-center justify-center rounded-full transition-colors";

const QUIET = "text-muted-foreground hover:text-foreground";

/**
 * `‹ 1 2 3 ›` 페이저. 글 목록(post-pager)과 사이드바 태그 목록이 함께 쓴다.
 *
 * 양 끝에서 화살표는 disabled다 — 눌러도 아무 일이 없는 버튼을 살려 두면
 * 마지막 페이지인지 아닌지가 눌러 봐야 알 수 있다.
 */
export type PaginationLabels = {
  prevPage: string;
  nextPage: string;
  /** "{n}"이 페이지 번호로 치환되는 템플릿. */
  pageLabel: string;
};

function formatPageLabel(template: string, n: number): string {
  return template.replace("{n}", String(n));
}

export function Pagination({
  page,
  pageCount,
  onChange,
  labels,
  className,
}: {
  page: number;
  pageCount: number;
  onChange: (page: number) => void;
  labels: PaginationLabels;
  className?: string;
}) {
  if (pageCount <= 1) return null;

  return (
    // 사이드바(12.5rem)에서는 페이지가 늘면 한 줄에 안 들어간다. 넘치면
    // 잘려 나가는 대신 다음 줄로 접히게 둔다.
    <div
      className={cn("flex flex-wrap items-center gap-1 font-mono text-xs", className)}
    >
      <button
        type="button"
        onClick={() => onChange(Math.max(0, page - 1))}
        disabled={page === 0}
        aria-label={labels.prevPage}
        className={cn(
          BUTTON,
          QUIET,
          "disabled:pointer-events-none disabled:text-foreground/20",
        )}
      >
        <ChevronLeftIcon className="size-4" />
      </button>

      {Array.from({ length: pageCount }, (_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i)}
          aria-current={i === page ? "page" : undefined}
          aria-label={formatPageLabel(labels.pageLabel, i + 1)}
          className={cn(
            BUTTON,
            i === page
              ? "bg-foreground/5 font-medium text-foreground"
              : QUIET,
          )}
        >
          {i + 1}
        </button>
      ))}

      <button
        type="button"
        onClick={() => onChange(Math.min(pageCount - 1, page + 1))}
        disabled={page === pageCount - 1}
        aria-label={labels.nextPage}
        className={cn(
          BUTTON,
          QUIET,
          "disabled:pointer-events-none disabled:text-foreground/20",
        )}
      >
        <ChevronRightIcon className="size-4" />
      </button>
    </div>
  );
}

/** 끝에서는 링크 대신 비활성 자리표시자를 그린다 — `disabled` button과 같은 역할. */
function PagerEdge({
  disabled,
  href,
  label,
  children,
}: {
  disabled: boolean;
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  if (disabled) {
    return (
      <span
        aria-disabled="true"
        aria-label={label}
        className={cn(BUTTON, QUIET, "pointer-events-none text-foreground/20")}
      >
        {children}
      </span>
    );
  }
  return (
    <Link href={href} aria-label={label} className={cn(BUTTON, QUIET)}>
      {children}
    </Link>
  );
}

/**
 * `‹ 1 2 3 ›` 페이저. 위 `Pagination`과 생김새는 같지만 페이지마다 실제
 * 라우트(href)로 이동한다 — 정적 export라 블로그 메인 목록의 각 페이지는
 * 북마크·새로고침에도 같은 내용을 보여줘야 하는 진짜 라우트이고,
 * `onChange`로 클라이언트 상태만 바꾸는 위 버전은 URL이 안 바뀐다.
 */
export function LinkPagination({
  page,
  pageCount,
  basePath,
  labels,
  className,
}: {
  /** 1부터 시작. */
  page: number;
  pageCount: number;
  /** 로케일 접두사까지 포함한 목록 루트(예: "/blog", "/en/blog"). 1페이지는
   * 이 경로 자신이고, 그 뒤부터 `${basePath}/page/<n>`이 된다 — 서버
   * 컴포넌트에서 함수를 prop으로 못 넘기니(RSC 직렬화 제약) 문자열만 받아
   * 여기서 조립한다. */
  basePath: string;
  labels: PaginationLabels;
  className?: string;
}) {
  if (pageCount <= 1) return null;
  const hrefFor = (n: number) => (n <= 1 ? basePath : `${basePath}/page/${n}`);

  return (
    <div
      className={cn("flex flex-wrap items-center gap-1 font-mono text-xs", className)}
    >
      <PagerEdge disabled={page === 1} href={hrefFor(page - 1)} label={labels.prevPage}>
        <ChevronLeftIcon className="size-4" />
      </PagerEdge>

      {Array.from({ length: pageCount }, (_, i) => {
        const n = i + 1;
        return (
          <Link
            key={n}
            href={hrefFor(n)}
            aria-current={n === page ? "page" : undefined}
            aria-label={formatPageLabel(labels.pageLabel, n)}
            className={cn(
              BUTTON,
              n === page ? "bg-foreground/5 font-medium text-foreground" : QUIET,
            )}
          >
            {n}
          </Link>
        );
      })}

      <PagerEdge
        disabled={page === pageCount}
        href={hrefFor(page + 1)}
        label={labels.nextPage}
      >
        <ChevronRightIcon className="size-4" />
      </PagerEdge>
    </div>
  );
}
