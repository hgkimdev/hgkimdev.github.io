import Link from "next/link";
import { Menu } from "lucide-react";

import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
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
import { localizeAnchor, localizeHref } from "@/lib/i18n/config";
import { navKeys } from "@/lib/nav";

export function SiteHeader({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-4">
        <Link
          href={localizeHref("/", locale)}
          className="text-lg font-semibold tracking-tight"
        >
          {dict.brand}
        </Link>

        <nav className="hidden flex-1 items-center justify-end gap-x-5 text-sm text-muted-foreground sm:flex">
          {navKeys.map((key) => (
            <Link
              key={key}
              href={localizeAnchor(key, locale)}
              className="transition-colors hover:text-foreground"
            >
              {dict.nav[key].label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
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
                {navKeys.map((key) => (
                  <SheetClose
                    key={key}
                    nativeButton={false}
                    render={<Link href={localizeAnchor(key, locale)} />}
                    className="rounded-md px-2 py-2 text-sm text-foreground transition-colors hover:bg-muted"
                  >
                    {dict.nav[key].label}
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
