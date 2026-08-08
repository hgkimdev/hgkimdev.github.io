import type { Metadata } from "next";

import { LocaleHtmlLang } from "@/components/locale-html-lang";
import { PageTransition } from "@/components/page-transition";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getDictionary, getNavLabels } from "@/lib/i18n/dictionaries";

export const metadata: Metadata = {
  title: "hgkim",
  description: "Un espace pour me présenter",
};

export default function FrLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const dict = getDictionary("fr");

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <LocaleHtmlLang locale="fr" />
      <SiteHeader
        locale="fr"
        brand={dict.brand}
        navLabels={getNavLabels("fr")}
        zoneLabels={dict.zoneLabels}
        themeToggleLabel={dict.themeToggleLabel}
        menuLabel={dict.menuLabel}
      />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4">
        <PageTransition>{children}</PageTransition>
      </main>
      <SiteFooter locale="fr" footerText={dict.footer(new Date().getFullYear())} />
    </div>
  );
}
