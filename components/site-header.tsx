"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { ZoneSwitcher } from "@/components/zone-switcher";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";
import { localizeHref } from "@/lib/i18n/config";
import { blogNavItems, getZone, introNavItems, navItemHref } from "@/lib/nav";

export function SiteHeader({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const pathname = usePathname();
  const zone = getZone(pathname, locale);
  const navItems = zone === "intro" ? introNavItems : blogNavItems;

  return (
    <header className="site-header sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-4">
        <Link
          href={localizeHref("/", locale)}
          className="flex items-baseline gap-1 text-lg font-semibold tracking-tight"
        >
          {dict.brand}
          {zone === "blog" && (
            <span className="hidden text-sm font-normal text-muted-foreground sm:inline">
              /blog
            </span>
          )}
        </Link>

        <nav className="hidden flex-1 items-center justify-end gap-x-5 text-sm text-muted-foreground sm:flex">
          {navItems.map((item) => (
            <Link
              key={item.key}
              href={navItemHref(item, locale)}
              className="transition-colors hover:text-foreground"
            >
              {dict.nav[item.key].label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <ZoneSwitcher locale={locale} labels={dict.zoneLabels} />
          <LanguageSwitcher />
          <ThemeToggle label={dict.themeToggleLabel} />

          <Sheet>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={dict.menuLabel}
                  className="sm:hidden"
                />
              }
            >
              <Menu className="size-4" />
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>{dict.brand}</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 px-2">
                {navItems.map((item) => (
                  <SheetClose
                    key={item.key}
                    nativeButton={false}
                    render={<Link href={navItemHref(item, locale)} />}
                    className="rounded-md px-2 py-2 text-sm text-foreground transition-colors hover:bg-muted"
                  >
                    {dict.nav[item.key].label}
                  </SheetClose>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
