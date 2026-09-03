import type { MetadataRoute } from "next";

import { projectGroups } from "@/content/projects";
import { getAllPosts, getCategoryCounts, getTagCounts } from "@/lib/content/blog";
import {
  locales,
  localizedPaths,
  localizeHref,
  type Locale,
  type LocalizedPath,
} from "@/lib/i18n/config";
import { absoluteUrl, localizedAlternates } from "@/lib/seo";

// output: 'export' requires metadata routes to opt into static generation
// explicitly in this Next.js version, or the build fails collecting page data.
export const dynamic = "force-static";

// Which paths exist in every locale now lives in lib/i18n/config.ts, because
// the browser-language redirect in app/layout.tsx has to agree with it: both
// answer "does this path have a counterpart in the other locale?". Here that
// answer decides hreflang alternates; there it decides whether it is safe to
// send the visitor across. Everything past these — post/category/tag/project
// detail — only has a translated counterpart when that post is translated
// (see SPEC.md), so no alternates there.
const PATH_META: Record<
  LocalizedPath,
  {
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
    priority: number;
  }
> = {
  "/": { changeFrequency: "monthly", priority: 1 },
  "/blog": { changeFrequency: "weekly", priority: 0.8 },
};

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();
  const categories = getCategoryCounts(posts, "ko");
  const tags = getTagCounts(posts);

  const entries: MetadataRoute.Sitemap = [];

  for (const path of localizedPaths) {
    const { changeFrequency, priority } = PATH_META[path];
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
