import type { Metadata } from "next";

import { LocaleHtmlLang } from "@/components/locale-html-lang";
import { PageTransition } from "@/components/page-transition";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getDictionary, getNavLabels } from "@/lib/i18n/dictionaries";

export const metadata: Metadata = {
  title: "hgkim",
  description: "私を紹介する空間",
};

export default function JaLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const dict = getDictionary("ja");

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <LocaleHtmlLang locale="ja" />
      <SiteHeader
        locale="ja"
        brand={dict.brand}
        navLabels={getNavLabels("ja")}
        zoneLabels={dict.zoneLabels}
        themeToggleLabel={dict.themeToggleLabel}
        menuLabel={dict.menuLabel}
      />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4">
        <PageTransition>{children}</PageTransition>
      </main>
      <SiteFooter locale="ja" footerText={dict.footer(new Date().getFullYear())} />
    </div>
  );
}
