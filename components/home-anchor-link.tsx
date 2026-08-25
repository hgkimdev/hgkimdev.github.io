"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";

import { localizeAnchor, localizeHref, type Locale } from "@/lib/i18n/config";
import { isPlainLeftClick } from "@/lib/scroll";

/**
 * Home의 섹션(About/Projects/Life/Contact)으로 가는 링크. 이미 Home 위에
 * 있으면 그냥 페이지 내 앵커 스크롤이라 Next의 기본 Link 동작으로 충분하다.
 *
 * 문제는 Home이 아닌 페이지(예: /projects/[slug])에서 이 링크를 누를 때다.
 * `href="/#projects"` 그대로 두면 라우트 전환과 같은 프레임에서 Next가
 * scrollY를 훌쩍 점프시키고, 그 사이 헤더 ZoneSwitcher의 layoutId 필이 튄
 * 위치를 측정해버려 눈에 보이게 흔들린다(lib/scroll.ts의 반대 방향 문제와
 * 같은 근본 원인 — Motion의 layout 측정과 스크롤 점프가 같은 프레임에서
 * 충돌한다). 그래서 Home이 아닐 때는 라우팅과 앵커 스크롤을 분리한다: 먼저
 * Home으로 이동시켜 Motion이 안정된 위치를 측정하게 하고, 두 번의
 * requestAnimationFrame 뒤에야 직접 해당 섹션으로 스크롤한다.
 */
export function HomeAnchorLink({
  anchor,
  locale,
  className,
  children,
}: {
  anchor: string;
  locale: Locale;
  className?: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === localizeHref("/", locale);

  return (
    <Link
      href={localizeAnchor(anchor, locale)}
      className={className}
      onClick={(event) => {
        if (isHome || !isPlainLeftClick(event)) return;
        event.preventDefault();
        router.push(localizeHref("/", locale));
        // Home's RSC payload can take more than a couple of frames to land
        // and commit, so poll for the target section instead of assuming a
        // fixed number of rAFs — bailing out after ~2s if it never shows up.
        let attempts = 0;
        const scrollWhenReady = () => {
          const el = document.getElementById(anchor);
          if (el) {
            el.scrollIntoView({ behavior: "instant" });
            return;
          }
          attempts += 1;
          if (attempts < 120) requestAnimationFrame(scrollWhenReady);
        };
        requestAnimationFrame(scrollWhenReady);
      }}
    >
      {children}
    </Link>
  );
}
