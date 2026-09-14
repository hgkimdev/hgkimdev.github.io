import type { Metadata } from "next";

import { ActiveSectionProvider } from "@/components/home-fx/active-section";
import { LocaleHtmlLang } from "@/components/locale-html-lang";
import { PageTransition } from "@/components/page-transition";
import { SiteHeader } from "@/components/site-header";
import { getDictionary, getNavLabels } from "@/lib/i18n/dictionaries";
import { openGraphFor } from "@/lib/seo";

export const metadata: Metadata = {
  description: "A space introducing who I am",
  openGraph: openGraphFor("en"),
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
    // 헤더 nav의 현재 섹션 밑줄이 Home 스크롤의 위치를 읽는다. 헤더와
    // 페이지가 레이아웃 트리에서 형제라 props로 이을 수 없어 여기서 함께
    // 감싼다. children은 prop으로 통과하므로, 섹션이 바뀔 때 다시 그려지는
    // 것은 컨텍스트를 실제로 읽는 헤더뿐이고 페이지 본문은 건드리지 않는다.
    <ActiveSectionProvider>
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
    </ActiveSectionProvider>
  );
}
