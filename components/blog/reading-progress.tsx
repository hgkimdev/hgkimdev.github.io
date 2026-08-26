"use client";

import { useEffect, useState } from "react";

import type { BlogPost } from "@/lib/content/blog";

/**
 * 글 상단의 읽기 진행바. 헤더 바로 아래에 1.5px로 붙는다.
 *
 * fixed로 두는 이유는 두 가지다 — 본문은 max-w 안에 갇혀 있는데 진행바는
 * 화면 끝에서 끝까지 가야 하고, 레이아웃에 자리를 차지하면 글 시작 위치가
 * 밀린다. 헤더가 z-50이라 그 아래(z-40)에 깔린다.
 *
 * transform이나 애니메이션을 쓰지 않는다. 스크롤 위치를 그대로 폭으로
 * 옮기는 것이라 보간이 끼면 오히려 손가락보다 늦게 따라온다.
 */
export function ReadingProgress({
  category,
}: {
  category: BlogPost["category"];
}) {
  const [ratio, setRatio] = useState(0);

  useEffect(() => {
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setRatio(max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div
      aria-hidden
      className="fixed inset-x-0 top-[var(--header-height)] z-40 h-[1.5px]"
    >
      <div
        className="h-full"
        style={{
          width: `${ratio * 100}%`,
          background: `var(--cat-${category})`,
        }}
      />
    </div>
  );
}
