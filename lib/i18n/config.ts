export const locales = ["ko", "en"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "ko";

export function localizeHref(path: string, locale: Locale): string {
  if (locale === defaultLocale) return path;
  return path === "/" ? `/${locale}` : `/${locale}${path}`;
}

export function localizeAnchor(id: string, locale: Locale): string {
  return `${localizeHref("/", locale)}#${id}`;
}
