import { defaultLocale, locales, localizeHref, type Locale } from "@/lib/i18n/config";

export const siteUrl = "https://hgkimdev.github.io";
export const siteName = "hgkim";

// next.config.ts sets trailingSlash: true, so every route except the root
// is served with a trailing slash. Canonical/hreflang/sitemap URLs need to
// match the served URL exactly, or crawlers see a redirect instead of the
// indexed page.
export function absoluteUrl(path: string): string {
  const withSlash = path === "/" ? "/" : `${path.replace(/\/$/, "")}/`;
  return `${siteUrl}${withSlash}`;
}

/**
 * hreflang alternates for a path that has a real counterpart in every
 * locale. Only "/" and "/blog" qualify today (see SPEC.md) — everything
 * else under Blog is Korean-only with no translated page to point to, so
 * don't call this for those routes.
 */
export function localizedAlternates(path: string): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const locale of locales) {
    languages[locale] = absoluteUrl(localizeHref(path, locale));
  }
  languages["x-default"] = absoluteUrl(localizeHref(path, defaultLocale));
  return languages;
}

/** Canonical + hreflang + 피드 링크. 모든 로케일에 대응판이 있는 경로용. */
export function pageAlternates(path: string, locale: Locale) {
  return {
    canonical: absoluteUrl(localizeHref(path, locale)),
    languages: localizedAlternates(path),
    types: feedTypes(locale),
  };
}

const ogLocales: Record<Locale, string> = {
  ko: "ko_KR",
  en: "en_US",
};

/**
 * Shared Open Graph fields. Next.js metadata merging is shallow per
 * top-level key — a layout/page that sets its own `openGraph` object
 * replaces the parent's wholesale instead of merging into it — so every
 * locale layout needs the full object, not just the `locale` field.
 */
export function openGraphFor(locale: Locale) {
  return {
    siteName,
    type: "website" as const,
    locale: ogLocales[locale],
  };
}

/**
 * 피드 주소.
 *
 * absoluteUrl을 거치지 않는 유일한 URL이다 — trailingSlash: true는 확장자가
 * 붙은 경로를 예외로 두므로(trailingSlash 문서의 예외 목록: `/file.txt` 등)
 * 실제로 서빙되는 주소는 `/feed.xml`이다. absoluteUrl에 넣으면 `/feed.xml/`이
 * 되어 존재하지 않는 주소를 가리키게 된다.
 */
export function feedUrl(locale: Locale): string {
  return `${siteUrl}${localizeHref("/feed.xml", locale)}`;
}

/**
 * `<link rel="alternate" type="application/rss+xml">`로 나가는 부분.
 *
 * Next의 메타데이터 병합은 `alternates`에도 얕게 걸린다(openGraph와 같은
 * 규칙). 루트 레이아웃에 한 번 적어 두면 자기 canonical을 선언하는
 * 페이지에서 통째로 지워지므로, 여기처럼 alternates 객체를 만드는 쪽에
 * 넣어서 모든 페이지가 같이 들고 가게 한다.
 */
function feedTypes(locale: Locale): Record<string, string> {
  return { "application/rss+xml": feedUrl(locale) };
}

/**
 * Blog 존 하위 경로(글 상세·카테고리·태그·페이지네이션)의 canonical + 피드 링크.
 * `path`는 로케일이 붙지 않은 경로(`/blog/foo`)를 받는다.
 */
export function blogAlternates(path: string, locale: Locale) {
  return {
    canonical: absoluteUrl(localizeHref(path, locale)),
    types: feedTypes(locale),
  };
}
