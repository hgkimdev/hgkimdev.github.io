"use client";

import { usePathname, useRouter } from "next/navigation";
import { Languages } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { defaultLocale, locales, type Locale } from "@/lib/i18n/config";

const localeShortLabels: Record<Locale, string> = {
  ko: "KO",
  en: "EN",
  fr: "FR",
  ja: "JA",
};

const localeNativeLabels: Record<Locale, string> = {
  ko: "한국어",
  en: "English",
  fr: "Français",
  ja: "日本語",
};

function getCurrentLocale(pathname: string): Locale {
  return (
    locales.find(
      (locale) =>
        locale !== defaultLocale &&
        (pathname === `/${locale}` || pathname.startsWith(`/${locale}/`))
    ) ?? defaultLocale
  );
}

export function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = getCurrentLocale(pathname);
  const basePath =
    currentLocale === defaultLocale
      ? pathname
      : pathname.replace(new RegExp(`^/${currentLocale}`), "") || "/";

  function handleValueChange(locale: Locale | null) {
    if (!locale) return;
    const href =
      locale === defaultLocale
        ? basePath
        : basePath === "/"
          ? `/${locale}`
          : `/${locale}${basePath}`;
    router.push(href);
  }

  return (
    <Select
      items={localeShortLabels}
      value={currentLocale}
      onValueChange={handleValueChange}
    >
      <SelectTrigger aria-label="Change language">
        <Languages className="size-4" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="end">
        {locales.map((locale) => (
          <SelectItem key={locale} value={locale}>
            {localeNativeLabels[locale]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
