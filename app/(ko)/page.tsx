import type { Metadata } from "next";

import { HomeContent } from "@/components/home-content";
import { pageAlternates } from "@/lib/seo";

export const metadata: Metadata = {
  alternates: pageAlternates("/", "ko"),
};

export default function Home() {
  return <HomeContent locale="ko" />;
}
