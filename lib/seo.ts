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

/** Canonical + hreflang for a page that exists in every locale. */
export function pageAlternates(path: string, locale: Locale) {
  return {
    canonical: absoluteUrl(localizeHref(path, locale)),
    languages: localizedAlternates(path),
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
