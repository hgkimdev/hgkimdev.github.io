import { localizeAnchor, localizeHref, type Locale } from "@/lib/i18n/config";

export const homeSectionKeys = [
  "about",
  "projects",
  "life",
  "contact",
] as const;

export type HomeSectionKey = (typeof homeSectionKeys)[number];
export type PageNavKey = "blog";

type NavItem =
  | { key: HomeSectionKey; type: "anchor" }
  | { key: PageNavKey; type: "page"; path: string };

export type NavKey = NavItem["key"];

// Intro zone: the single-scroll Home page. Every item scrolls to a
// section on that page.
export const introNavItems: NavItem[] = homeSectionKeys.map((key) => ({
  key,
  type: "anchor",
}));

// Blog zone: no header nav at all.
//
// Projects moved to the Intro scroll, which left Blog as the only item — and a
// one-item nav pointing at the page you are already on is noise. The brand
// already reads "hgkim /blog" in this zone, and the ZoneSwitcher is how you
// leave it, so the list has nothing left to do. Kept as an empty array rather
// than deleted so the zone still has an answer to "which nav items?" and can
// grow one back (tags, an archive index) without re-plumbing SiteHeader.
export const blogNavItems: NavItem[] = [];

export function navItemHref(item: NavItem, locale: Locale): string {
  return item.type === "anchor"
    ? localizeAnchor(item.key, locale)
    : localizeHref(item.path, locale);
}

export type Zone = "intro" | "blog";

// Which zone's header to render. Only /blog and its detail routes are the
// "blog" zone; everything else (currently just Home) is the "intro" zone.
export function getZone(pathname: string, locale: Locale): Zone {
  const blogRoot = localizeHref("/blog", locale);
  const isBlogZone =
    pathname === blogRoot || pathname.startsWith(`${blogRoot}/`);
  return isBlogZone ? "blog" : "intro";
}
