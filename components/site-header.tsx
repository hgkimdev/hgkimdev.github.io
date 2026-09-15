"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import { useActiveSection } from "@/components/home-fx/active-section";
import { HomeAnchorLink } from "@/components/home-anchor-link";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { ZoneSwitcher } from "@/components/zone-switcher";
import type { Locale } from "@/lib/i18n/config";
import { localizeHref } from "@/lib/i18n/config";
import {
  blogNavItems,
  getZone,
  introNavItems,
  navItemHref,
  type NavItem,
  type NavKey,
  type Zone,
} from "@/lib/nav";

export function SiteHeader({
  locale,
  brand,
  navLabels,
  zoneLabels,
  themeToggleLabel,
}: {
  locale: Locale;
  brand: string;
  navLabels: Record<NavKey, string>;
  zoneLabels: Record<Zone, string>;
  themeToggleLabel: string;
}) {
  const pathname = usePathname();
  const zone = getZone(pathname, locale);
  const navItems = zone === "intro" ? introNavItems : blogNavItems;
  const activeSection = useActiveSection();
  // The blog zone has no nav items, so it gets no <nav> element either — an
  // empty one is just noise in the accessibility tree.
  //
  // Intro의 섹션 목록은 두 자리에 나온다 — 헤더 첫 줄 오른쪽(sm 이상)과 그 아래
  // 둘째 줄(sm 미만). 전에는 sm 미만에서 목록이 아예 없었는데, 390px에서 첫 줄에
  // 남는 자리가 81px뿐이라(브랜드가 x=67에서 끝나고 존 스위처가 x=148에서 시작)
  // 항목 네 개가 들어갈 수 없었기 때문이다. 자리를 만드는 대신 줄을 하나 더
  // 내준다. Blog 존은 목록이 비어 있어 둘째 줄도 생기지 않는다.
  const hasNav = navItems.length > 0;

  return (
    <header className="site-header sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-4">
        {/* 브랜드는 "지금 존의 첫 화면"으로 간다. Blog 존에서 Intro로
            튕기면 이름 옆에 붙은 /blog와 어긋나고, 존을 나가는 일은 어차피
            ZoneSwitcher가 맡는다. */}
        <Link
          href={localizeHref(zone === "blog" ? "/blog" : "/", locale)}
          className="flex items-baseline gap-1 text-lg font-semibold tracking-tight"
        >
          {brand}
          {zone === "blog" && (
            <span className="hidden text-sm font-normal text-muted-foreground sm:inline">
              /blog
            </span>
          )}
        </Link>

        {hasNav && (
          <SectionNav
            navItems={navItems}
            navLabels={navLabels}
            locale={locale}
            activeSection={activeSection}
            className="hidden flex-1 items-center justify-end gap-x-5 sm:flex"
          />
        )}

        <div className="flex items-center gap-2 sm:gap-3">
          <ZoneSwitcher locale={locale} labels={zoneLabels} />
          <LanguageSwitcher />
          <ThemeToggle label={themeToggleLabel} />
        </div>
      </div>

      {/* 둘째 줄. sm 미만에서만 나오고, `.site-section-bar`는 globals.css가
          `--header-height`를 이 줄 높이만큼 키우는 표적이다 — 핀 고정 프레임과
          코드 배경, 읽기 진행바가 전부 그 변수를 읽으므로 줄이 늘면 값도 같이
          늘어야 한다. */}
      {hasNav && (
        <div className="site-section-bar border-t border-border/60 sm:hidden">
          <div className="mx-auto flex h-11 max-w-4xl items-center px-4">
            <SectionNav
              navItems={navItems}
              navLabels={navLabels}
              locale={locale}
              activeSection={activeSection}
              // 항목 네 개가 390px에 들어가지만(실측 248px + 좌우 여백 32px),
              // 라벨이 길어지는 로케일까지 버티도록 넘치면 가로로 스크롤한다.
              // 스크롤바는 life-overlay의 카테고리 줄과 같은 방식으로 숨긴다.
              className="h-full items-center gap-x-5 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              // 밑줄을 nav 바닥에서 고정 오프셋으로 붙이고, nav는 줄 높이를 다
              // 쓴다(h-full) — 글자는 그 안에서 수직 중앙이다. 밑줄이 레이아웃에
              // 자리를 만들게 두면(pb-1.5) 밑줄이 없는 히어로에서 글자 아래만
              // 여백이 남아 글자가 떠 보인다(실측 위 9px / 아래 15px). 이렇게
              // 하면 밑줄이 없을 때 위아래가 12px로 대칭이고, 있을 때 글자와의
              // 간격은 데스크톱과 같은 4.5px이다.
              //
              // 상자 밖(-bottom-1.5)에 두지 않는 것은 overflow-x:auto가 세로까지
              // 잘라내 밑줄이 통째로 사라지기 때문이다.
              inkClassName="bottom-1.5"
            />
          </div>
        </div>
      )}
    </header>
  );
}

/**
 * 섹션 목록과 그 아래 미끄러지는 밑줄.
 *
 * 인스턴스가 둘인 것(데스크톱 첫 줄 / 모바일 둘째 줄)은 밑줄이 **실제로 그려진
 * 항목을 재서** 위치를 잡기 때문이다. 하나를 반응형으로 옮겨 쓰면 숨겨진 쪽의
 * 폭 0이 측정에 섞인다 — 아래 measure의 offsetWidth 가드가 그 사고를 막으려고
 * 있는 것이고, 인스턴스를 나누면 각자 자기가 보일 때만 값을 갖는다.
 */
function SectionNav({
  navItems,
  navLabels,
  locale,
  activeSection,
  className,
  inkClassName = "-bottom-1.5",
}: {
  navItems: NavItem[];
  navLabels: Record<NavKey, string>;
  locale: Locale;
  activeSection: NavKey | null;
  className?: string;
  inkClassName?: string;
}) {
  const navRef = useRef<HTMLElement>(null);
  // 밑줄의 위치·폭. 항목 글자 폭은 언어와 폰트에 따라 달라서 CSS만으로는 구할 수
  // 없다 — 실제로 그려진 항목을 재는 수밖에 없다.
  const [ink, setInk] = useState<{ x: number; w: number } | null>(null);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    let cancelled = false;

    const measure = () => {
      if (cancelled) return;
      // 표적은 클래스가 아니라 aria-current다. 보이는 상태와 접근성 트리가
      // 갈라질 수 없게 하나의 출처에서 둘 다 나온다.
      const el = nav.querySelector<HTMLElement>('[aria-current="true"]');
      // 지금 숨어 있는 쪽 인스턴스(sm 경계 반대편)는 폭이 0으로 잡힌다. 그 0을
      // 그대로 쓰면 창 폭이 바뀌는 순간 밑줄이 왼쪽 끝에서 미끄러져 나온다.
      if (!el || el.offsetWidth === 0) {
        setInk(null);
        return;
      }
      setInk({ x: el.offsetLeft, w: el.offsetWidth });
    };

    measure();
    window.addEventListener("resize", measure);
    // 폰트가 늦게 붙으면 글자 폭이 바뀌는데, 그때 다시 재지 않으면 밑줄만
    // 옛 폭으로 남는다.
    document.fonts?.ready.then(measure);

    return () => {
      cancelled = true;
      window.removeEventListener("resize", measure);
    };
    // locale이 바뀌면 라벨이 통째로 바뀌므로 다시 재야 한다.
  }, [activeSection, locale]);

  return (
    <nav
      ref={navRef}
      className={cn("relative flex text-sm text-muted-foreground", className)}
    >
      {/* 미끄러지는 밑줄. 측정되기 전에는 아예 그리지 않는다 — 폭 0에서
          시작하게 두면 /#contact처럼 깊은 앵커로 들어왔을 때 첫 화면에서
          왼쪽 끝부터 훑고 지나간다. 새로 마운트되면 이미 제 자리라
          transition이 걸릴 이전 상태가 없어서 조용히 나타난다. */}
      {ink && (
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute left-0 h-[1.5px] bg-foreground transition-[transform,width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
            inkClassName,
          )}
          style={{
            width: `${ink.w}px`,
            transform: `translateX(${ink.x}px)`,
          }}
        />
      )}
      {navItems.map((item) =>
        item.type === "anchor" ? (
          <HomeAnchorLink
            key={item.key}
            anchor={item.key}
            locale={locale}
            active={item.key === activeSection}
            className={cn(
              "shrink-0 transition-colors hover:text-foreground",
              item.key === activeSection && "text-foreground",
            )}
          >
            {navLabels[item.key]}
          </HomeAnchorLink>
        ) : (
          <Link
            key={item.key}
            href={navItemHref(item, locale)}
            className="shrink-0 transition-colors hover:text-foreground"
          >
            {navLabels[item.key]}
          </Link>
        ),
      )}
    </nav>
  );
}
