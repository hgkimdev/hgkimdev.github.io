import type { Metadata } from "next";

import { HomeContent } from "@/components/home-content";
import { pageAlternates } from "@/lib/seo";

export const metadata: Metadata = {
  alternates: pageAlternates("/", "en"),
};

export default function Home() {
  return <HomeContent locale="en" />;
}
