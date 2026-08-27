import type { MetadataRoute } from "next";

import { projectGroups } from "@/content/projects";
import { getAllPosts, getCategoryCounts, getTagCounts } from "@/lib/content/blog";
import { locales, localizeHref, type Locale } from "@/lib/i18n/config";
import { absoluteUrl, localizedAlternates } from "@/lib/seo";

// output: 'export' requires metadata routes to opt into static generation
// explicitly in this Next.js version, or the build fails collecting page data.
export const dynamic = "force-static";

// "/" and "/blog" exist in every locale (the other three are placeholders
// today, but they're real routes), so they carry hreflang alternates.
// Everything past that — post/category/tag/project detail — is Korean-only
// with no translated counterpart (see SPEC.md), so no alternates there.
const LOCALIZED_PATHS: {
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}[] = [
  { path: "/", changeFrequency: "monthly", priority: 1 },
  { path: "/blog", changeFrequency: "weekly", priority: 0.8 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();
  const categories = getCategoryCounts(posts);
  const tags = getTagCounts(posts);

  const entries: MetadataRoute.Sitemap = [];

  for (const { path, changeFrequency, priority } of LOCALIZED_PATHS) {
    for (const locale of locales as readonly Locale[]) {
      entries.push({
        url: absoluteUrl(localizeHref(path, locale)),
        changeFrequency,
        priority: locale === "ko" ? priority : Math.round(priority * 0.7 * 10) / 10,
        alternates: { languages: localizedAlternates(path) },
      });
    }
  }

  for (const post of posts) {
    entries.push({
      url: absoluteUrl(`/blog/${post.slug}`),
      lastModified: post.date,
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }

  for (const category of categories) {
    entries.push({
      url: absoluteUrl(`/blog/category/${category.key}`),
      changeFrequency: "weekly",
      priority: 0.4,
    });
  }

  for (const tag of tags) {
    entries.push({
      url: absoluteUrl(`/blog/tag/${tag.key}`),
      changeFrequency: "weekly",
      priority: 0.3,
    });
  }

  for (const group of projectGroups) {
    entries.push({
      url: absoluteUrl(`/projects/${group.key}`),
      changeFrequency: "yearly",
      priority: 0.5,
    });
  }

  return entries;
}
