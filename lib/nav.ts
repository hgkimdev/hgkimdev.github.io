export const navKeys = [
  "about",
  "now",
  "projects",
  "life",
  "blog",
  "timeline",
  "contact",
] as const;

export type NavKey = (typeof navKeys)[number];
