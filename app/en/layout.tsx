import type { Metadata } from "next";

import { LocaleHtmlLang } from "@/components/locale-html-lang";
import { PageTransition } from "@/components/page-transition";
import { SiteHeader } from "@/components/site-header";
import { getDictionary, getNavLabels } from "@/lib/i18n/dictionaries";

export const metadata: Metadata = {
  title: "hgkim",
  description: "A space introducing who I am",
};

export default function EnLayout({
  children,
  footer,
}: Readonly<{
  children: React.ReactNode;
  footer: React.ReactNode;
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
      />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4">
        <PageTransition>{children}</PageTransition>
      </main>
      {/* @footer 병렬 슬롯. blog 존에서만 내용이 있다. */}
      {footer}
    </div>
  );
}
