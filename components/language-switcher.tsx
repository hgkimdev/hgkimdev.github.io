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
};

const localeNativeLabels: Record<Locale, string> = {
  ko: "한국어",
  en: "English",
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
    // 직접 고른 언어는 기억해 둔다. app/layout.tsx의 브라우저 언어
    // 리다이렉트가 이 값을 먼저 보고, 있으면 감지를 건너뛴다 — 영어
    // 브라우저에서 한국어를 골랐는데 새로고침마다 /en으로 되튕기면
    // 스위처가 사실상 동작하지 않는 것과 같다.
    try {
      localStorage.setItem("locale", locale);
    } catch {
      // Safari 프라이빗 모드 등 저장이 막힌 환경. 이동은 그대로 진행한다.
    }
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
