import type { MetadataRoute } from "next";

import { siteUrl } from "@/lib/seo";

// output: 'export' requires metadata routes to opt into static generation
// explicitly in this Next.js version, or the build fails collecting page data.
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
