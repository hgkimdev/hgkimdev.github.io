"use client";

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
