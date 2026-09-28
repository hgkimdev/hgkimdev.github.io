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
import {
  defaultLocale,
  locales,
  localizeHref,
  type Locale,
} from "@/lib/i18n/config";

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

// next.config.ts의 trailingSlash: true 때문에 usePathname이 끝 슬래시를 달고
// 오는 경우가 있다. counterpartPaths와 글자 그대로 비교하므로 먼저 떼어 낸다.
function stripTrailingSlash(path: string): string {
  return path.length > 1 ? path.replace(/\/$/, "") : path;
}

// 대응판이 없을 때 대신 갈 곳. 둘 다 localizedPaths라 모든 로케일에 있다.
function fallbackPath(path: string): string {
  return path === "/blog" || path.startsWith("/blog/") ? "/blog" : "/";
}

export function LanguageSwitcher({
  counterpartPaths,
}: {
  /**
   * 다른 로케일에 실제로 존재하는 경로들(로케일 접두사를 뗀 형태).
   * 레이아웃이 lib/i18n/counterparts.ts의 pathsInLocale로 만들어 내려준다.
   * 로케일이 둘뿐이라 배열 하나로 충분하다 — 셋째가 생기면 로케일별로
   * 갈라야 한다.
   */
  counterpartPaths: string[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = getCurrentLocale(pathname);
  const basePath = stripTrailingSlash(
    currentLocale === defaultLocale
      ? pathname
      : pathname.replace(new RegExp(`^/${currentLocale}`), "") || "/",
  );

  function handleValueChange(locale: Locale | null) {
    if (!locale || locale === currentLocale) return;
    // 직접 고른 언어는 기억해 둔다. app/layout.tsx의 브라우저 언어
    // 리다이렉트가 이 값을 먼저 보고, 있으면 감지를 건너뛴다 — 영어
    // 브라우저에서 한국어를 골랐는데 새로고침마다 /en으로 되튕기면
    // 스위처가 사실상 동작하지 않는 것과 같다.
    try {
      localStorage.setItem("locale", locale);
    } catch {
      // Safari 프라이빗 모드 등 저장이 막힌 환경. 이동은 그대로 진행한다.
    }
    // 지금 글이 저쪽 로케일에 없을 수 있다 — 번역이 있는 글만 그쪽
    // 라우트가 생기기 때문이다(SPEC §Blog 다국어). 없는데도 주소만 바꿔
    // 밀어넣으면 정적 export에서는 404고, dev에서는 generateStaticParams에
    // 없는 param이라며 터진다. 그래서 있는 것만 따라가고, 없으면 같은
    // 존의 목록으로 보낸다.
    const target = counterpartPaths.includes(basePath)
      ? basePath
      : fallbackPath(basePath);
    router.push(localizeHref(target, locale));
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
