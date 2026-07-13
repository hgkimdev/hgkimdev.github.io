import type { Metadata } from "next";

import { LocaleHtmlLang } from "@/components/locale-html-lang";
import { PageTransition } from "@/components/page-transition";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "hgkim",
  description: "Un espace pour me présenter",
};

export default function FrLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <LocaleHtmlLang locale="fr" />
      <SiteHeader locale="fr" />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4">
        <PageTransition>{children}</PageTransition>
      </main>
      <SiteFooter locale="fr" />
    </div>
  );
}
