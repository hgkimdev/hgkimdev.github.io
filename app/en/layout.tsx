import type { Metadata } from "next";

import { LocaleHtmlLang } from "@/components/locale-html-lang";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "hgkim",
  description: "A space introducing who I am",
};

export default function EnLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <LocaleHtmlLang locale="en" />
      <SiteHeader locale="en" />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4">{children}</main>
      <SiteFooter locale="en" />
    </div>
  );
}
