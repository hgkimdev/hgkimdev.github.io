"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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
  // The blog zone has no nav items, so it gets no <nav> element either — an
  // empty one is just noise in the accessibility tree.
  //
  // There is no mobile menu in either zone. The nav is `sm:` and up only: below
  // that, Intro's section links are shortcuts into a page you reach by
  // scrolling anyway, and Blog has nothing to list. The zone switcher, language
  // and theme controls are always visible at every width.
  const hasNav = navItems.length > 0;

  return (
    <header className="site-header sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-4">
        <Link
          href={localizeHref("/", locale)}
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
          <nav className="hidden flex-1 items-center justify-end gap-x-5 text-sm text-muted-foreground sm:flex">
            {navItems.map((item) =>
              item.type === "anchor" ? (
                <HomeAnchorLink
                  key={item.key}
                  anchor={item.key}
                  locale={locale}
                  className="transition-colors hover:text-foreground"
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
