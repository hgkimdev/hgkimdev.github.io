import { LocaleHtmlLang } from "@/components/locale-html-lang";
import { PageTransition } from "@/components/page-transition";
import { SiteHeader } from "@/components/site-header";
import { getDictionary, getNavLabels } from "@/lib/i18n/dictionaries";

export default function KoLayout({
  children,
  footer,
}: Readonly<{
  children: React.ReactNode;
  footer: React.ReactNode;
}>) {
  const dict = getDictionary("ko");

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <LocaleHtmlLang locale="ko" />
      <SiteHeader
        locale="ko"
        brand={dict.brand}
        navLabels={getNavLabels("ko")}
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
