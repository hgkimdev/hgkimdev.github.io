import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/page-placeholder";
import { pageAlternates } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Blog",
  alternates: pageAlternates("/blog", "fr"),
};

export default function BlogPage() {
  return <PagePlaceholder locale="fr" navKey="blog" />;
}
