import { localizeAnchor, localizeHref, type Locale } from "@/lib/i18n/config";

export const homeSectionKeys = ["about", "life", "contact"] as const;

export type HomeSectionKey = (typeof homeSectionKeys)[number];
export type PageNavKey = "blog" | "projects";

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

// Blog zone: Blog/Projects have their own header entirely, separate from
// the intro nav above. Every item here loads a page within this zone.
// Contact isn't listed here — it lives in the footer instead, since it's
// really an Intro-zone anchor and didn't belong pretending to be a
// same-zone link.
export const blogNavItems: NavItem[] = [
  { key: "blog", type: "page", path: "/blog" },
  { key: "projects", type: "page", path: "/projects" },
];

export function navItemHref(item: NavItem, locale: Locale): string {
  return item.type === "anchor"
    ? localizeAnchor(item.key, locale)
    : localizeHref(item.path, locale);
}

export type Zone = "intro" | "blog";

// Which zone's header to render. Blog and Projects share the "blog" zone;
// everything else (currently just Home) is the "intro" zone.
export function getZone(pathname: string, locale: Locale): Zone {
  const blogRoot = localizeHref("/blog", locale);
  const projectsRoot = localizeHref("/projects", locale);
  const isBlogZone =
    pathname === blogRoot ||
    pathname.startsWith(`${blogRoot}/`) ||
    pathname === projectsRoot ||
    pathname.startsWith(`${projectsRoot}/`);
  return isBlogZone ? "blog" : "intro";
}
