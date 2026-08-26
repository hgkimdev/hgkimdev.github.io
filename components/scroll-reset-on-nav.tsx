"use client";

import { useEffect } from "react";

import { isPlainLeftClick, resetScrollForNavigation } from "@/lib/scroll";

/**
 * 내부 링크로 페이지를 옮기기 직전에 스크롤을 맨 위로 돌린다.
 *
 * 왜 필요한지는 lib/scroll.ts의 주석에 적혀 있다 — 깊게 스크롤한 긴 페이지에서
 * 짧은 페이지로 넘어가면, DOM이 바뀐 직후와 브라우저가 scrollY를 새 문서
 * 높이에 맞춰 자르기 전 사이에 sticky 헤더가 잠깐 문서 아래쪽에 있는 것처럼
 * 측정된다. 그 순간을 Motion의 layoutId(ZoneSwitcher의 활성 필)가 재면 그
 * 차이만큼 튄다. 실측: 상세 글 하단(scrollY 1655)에서 목록으로 이동하자 필에
 * translateY(1628px)가 걸리고 스프링으로 800ms에 걸쳐 되돌아왔다.
 *
 * 원래는 ZoneSwitcher의 링크에만 걸려 있었는데, 헤더 브랜드·목록 행·사이드바
 * 처럼 같은 조건을 만드는 링크가 계속 늘었다. 링크마다 핸들러를 다는 대신
 * document에서 한 번 잡는다 — 새로 추가되는 링크가 이 처리를 빠뜨릴 수 없다.
 *
 * (Motion의 layoutRoot도 시도했지만 효과가 없었다. Motion은 레이아웃을 페이지
 * 좌표로 재기 때문에 sticky 요소의 스크롤 오프셋을 알지 못한다.)
 */
export function ScrollResetOnNav() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (!isPlainLeftClick(event as unknown as React.MouseEvent)) return;

      const anchor = (event.target as Element | null)?.closest?.("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (anchor.hasAttribute("download")) return;
      if (anchor.target && anchor.target !== "_self") return;

      const url = new URL(anchor.href, window.location.href);
      // 바깥 사이트는 이 페이지를 떠나므로 스크롤을 건드릴 이유가 없다.
      if (url.origin !== window.location.origin) return;
      // 같은 문서 안의 앵커 이동(#section)은 스크롤 그 자체가 목적이다.
      if (
        url.pathname === window.location.pathname &&
        url.search === window.location.search
      ) {
        return;
      }
      if (window.scrollY === 0) return;

      resetScrollForNavigation();
    };

    // capture 단계라야 Next의 Link 핸들러(루트에 위임된 React 이벤트)보다 먼저
    // 돌아 네비게이션이 시작되기 전에 스크롤이 정리된다.
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return null;
}
