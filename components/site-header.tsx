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
  // There is no mobile menu in either zone. The nav is `sm:` and up only: below
  // that, Intro's section links are shortcuts into a page you reach by
  // scrolling anyway, and Blog has nothing to list. The zone switcher, language
  // and theme controls are always visible at every width.
  const hasNav = navItems.length > 0;

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
      // sm 미만에서 nav는 display:none이라 폭이 0으로 잡힌다. 그 0을 그대로
      // 쓰면 창을 넓히는 순간 밑줄이 왼쪽 끝에서 미끄러져 나온다.
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
  }, [activeSection, locale, hasNav]);

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
          <nav
            ref={navRef}
            className="relative hidden flex-1 items-center justify-end gap-x-5 text-sm text-muted-foreground sm:flex"
          >
            {/* 미끄러지는 밑줄. 측정되기 전에는 아예 그리지 않는다 — 폭 0에서
                시작하게 두면 /#contact처럼 깊은 앵커로 들어왔을 때 첫 화면에서
                왼쪽 끝부터 훑고 지나간다. 새로 마운트되면 이미 제 자리라
                transition이 걸릴 이전 상태가 없어서 조용히 나타난다. */}
            {ink && (
              <span
                aria-hidden
                className="pointer-events-none absolute -bottom-1.5 left-0 h-[1.5px] bg-foreground transition-[transform,width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
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
                    "transition-colors hover:text-foreground",
                    item.key === activeSection && "text-foreground",
                  )}
                >
                  {navLabels[item.key]}
                </HomeAnchorLink>
              ) : (
                <Link
                  key={item.key}
                  href={navItemHref(item, locale)}
                  className="transition-colors hover:text-foreground"
                >
                  {navLabels[item.key]}
                </Link>
              )
            )}
          </nav>
        )}

        <div className="flex items-center gap-2 sm:gap-3">
          <ZoneSwitcher locale={locale} labels={zoneLabels} />
          <LanguageSwitcher />
          <ThemeToggle label={themeToggleLabel} />
        </div>
      </div>
    </header>
  );
}
