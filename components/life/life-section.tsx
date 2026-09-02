"use client";

import { useRef, useSyncExternalStore } from "react";

import type { LifeCategory, LifeCategoryKey } from "@/content/life";
import type { Locale } from "@/lib/i18n/config";
import { LifeEntrance } from "@/components/life/life-entrance";
import { LifeOverlay } from "@/components/life/life-overlay";

/** The open category lives in the URL as `?life=<key>` — see the note below. */
const PARAM = "life";
/** Our own history writes don't fire popstate, so we announce them. */
const URL_CHANGE_EVENT = "life:url-change";

function subscribe(onChange: () => void) {
  window.addEventListener("popstate", onChange);
  window.addEventListener(URL_CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("popstate", onChange);
    window.removeEventListener(URL_CHANGE_EVENT, onChange);
  };
}

function getSnapshot() {
  return new URLSearchParams(window.location.search).get(PARAM);
}

function getServerSnapshot(): string | null {
  return null;
}

/**
 * Life 섹션 전체 — 입구(스크롤 안)와 탐색 오버레이(스크롤 밖)를 잇는다.
 *
 * 오버레이는 Dialog라 포털로 body에 붙으므로, 이 컴포넌트가 핀 고정 레이어
 * 안에 있어도(= 스크롤에 따라 opacity가 깎여도) 영향을 받지 않는다.
 *
 * 어느 카테고리가 열렸는지는 state가 아니라 **URL**(`?life=travel`)이 들고
 * 있고, 여기서는 그 URL을 외부 저장소처럼 구독만 한다. 원래는 useState로만
 * 열려 히스토리에 흔적이 없었고, 그래서 오버레이를 열어둔 채 뒤로가기를
 * 누르면 오버레이가 닫히는 대신 Home 이전 항목으로 진짜 이동해버렸다(헤더
 * ZoneSwitcher로 Intro↔Blog를 왕복한 뒤라면 /blog로 빠진다). 특히 모바일은
 * 뒤로가기가 오버레이를 닫는 기본 제스처라 더 어긋난다. URL에 실으면 그
 * 항목이 생겨 뒤로가기가 곧 닫기가 되고, 링크 공유와 새로고침도 살아난다.
 *
 * Next의 라우터가 아니라 History API를 직접 쓴다 — router.push는 라우트
 * 전환이라 Home의 핀 고정 스크롤을 다시 그리고 맨 위로 보내버린다. Next는
 * pushState/replaceState를 패치해 자기 내부 상태(__NA·트리)를 복사해 넣고
 * usePathname/useSearchParams도 갱신하므로, 직접 호출해도 라우터와 어긋나지
 * 않는다.
 */
export function LifeSection({
  categories,
  locale,
  animateIn,
}: {
  categories: LifeCategory[];
  locale: Locale;
  animateIn?: boolean;
}) {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const openKey = categories.some((c) => c.key === raw)
    ? (raw as LifeCategoryKey)
    : null;

  // Did *we* push the history entry the overlay is sitting on? If the page was
  // opened straight at `?life=…` there is no entry of ours to pop, so closing
  // has to rewrite the URL instead of stepping back out of the site.
  const pushedEntry = useRef(false);

  const urlFor = (key: LifeCategoryKey | null) =>
    key
      ? `${window.location.pathname}?${PARAM}=${key}`
      : window.location.pathname;

  const changeOpen = (next: LifeCategoryKey | null) => {
    if (next === openKey) return;

    if (next !== null) {
      if (openKey === null) {
        // Opening: a real history entry, so back closes it.
        window.history.pushState({}, "", urlFor(next));
        pushedEntry.current = true;
      } else {
        // Switching category while already open (dock, swipe) — replace, so
        // back still lands on Home instead of walking back through every
        // category the reader flipped past.
        window.history.replaceState({}, "", urlFor(next));
      }
    } else if (pushedEntry.current) {
      // Closing via X / Escape / backdrop: pop our own entry, so the stack
      // unwinds exactly the way the back button would have unwound it.
      pushedEntry.current = false;
      window.history.back();
      // `back()` fires popstate on its own; announcing here too would read the
      // not-yet-updated URL.
      return;
    } else {
      window.history.replaceState({}, "", urlFor(null));
    }

    window.dispatchEvent(new Event(URL_CHANGE_EVENT));
  };

  return (
    <>
      <LifeEntrance
        categories={categories}
        locale={locale}
        animateIn={animateIn}
        onOpen={changeOpen}
      />
      <LifeOverlay
        categories={categories}
        locale={locale}
        openKey={openKey}
        onOpenKeyChange={changeOpen}
      />
    </>
  );
}
