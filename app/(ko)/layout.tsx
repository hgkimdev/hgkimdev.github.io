import { LocaleHtmlLang } from "@/components/locale-html-lang";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function KoLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <LocaleHtmlLang locale="ko" />
      <SiteHeader locale="ko" />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4">{children}</main>
      <SiteFooter locale="ko" />
    </div>
  );
}
