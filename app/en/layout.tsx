import type { Metadata } from "next";

import { LocaleHtmlLang } from "@/components/locale-html-lang";
import { PageTransition } from "@/components/page-transition";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getDictionary, getNavLabels } from "@/lib/i18n/dictionaries";

export const metadata: Metadata = {
  title: "hgkim",
  description: "A space introducing who I am",
};

export default function EnLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const dict = getDictionary("en");

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <LocaleHtmlLang locale="en" />
      <SiteHeader
        locale="en"
        brand={dict.brand}
        navLabels={getNavLabels("en")}
        zoneLabels={dict.zoneLabels}
        themeToggleLabel={dict.themeToggleLabel}
        menuLabel={dict.menuLabel}
      />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4">
        <PageTransition>{children}</PageTransition>
      </main>
      <SiteFooter locale="en" footerText={dict.footer(new Date().getFullYear())} />
    </div>
  );
}
