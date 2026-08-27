import type { Metadata } from "next";

import { LocaleHtmlLang } from "@/components/locale-html-lang";
import { ScrollResetOnNav } from "@/components/scroll-reset-on-nav";
import { PageTransition } from "@/components/page-transition";
import { SiteHeader } from "@/components/site-header";
import { getDictionary, getNavLabels } from "@/lib/i18n/dictionaries";
import { openGraphFor } from "@/lib/seo";

export const metadata: Metadata = {
  description: "Un espace pour me présenter",
  openGraph: openGraphFor("fr"),
};

export default function FrLayout({
  children,
  footer,
}: Readonly<{
  children: React.ReactNode;
  footer: React.ReactNode;
}>) {
  const dict = getDictionary("fr");

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <LocaleHtmlLang locale="fr" />
      <ScrollResetOnNav />
      <SiteHeader
        locale="fr"
        brand={dict.brand}
        navLabels={getNavLabels("fr")}
        zoneLabels={dict.zoneLabels}
        themeToggleLabel={dict.themeToggleLabel}
      />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4">
        <PageTransition>{children}</PageTransition>
      </main>
      {/* @footer 병렬 슬롯. blog 존에서만 내용이 있다. */}
      {footer}
    </div>
  );
}
