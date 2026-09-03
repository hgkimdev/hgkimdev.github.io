export const locales = ["ko", "en"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "ko";

// 모든 로케일에 반드시 대응판이 존재하는 경로. 글 상세·카테고리·태그는
// 번역이 있는 글만 en 라우트가 생기므로(SPEC §Blog 다국어) 여기 들어올 수
// 없다 — 없는 글로 보내면 정적 호스팅에서 그냥 404다. hreflang(sitemap)과
// 브라우저 언어 리다이렉트(app/layout.tsx)가 같은 목록을 봐야 해서 여기
// 하나로 둔다.
export const localizedPaths = ["/", "/blog"] as const;

export type LocalizedPath = (typeof localizedPaths)[number];

export function localizeHref(path: string, locale: Locale): string {
  if (locale === defaultLocale) return path;
  return path === "/" ? `/${locale}` : `/${locale}${path}`;
}

export function localizeAnchor(id: string, locale: Locale): string {
  return `${localizeHref("/", locale)}#${id}`;
}
