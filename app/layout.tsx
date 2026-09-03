import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { ScrollRestoration } from "@/components/scroll-restoration";
import { defaultLocale, locales, localizedPaths } from "@/lib/i18n/config";
import { openGraphFor, siteName, siteUrl } from "@/lib/seo";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: siteName, template: `%s · ${siteName}` },
  description: "나라는 사람을 소개하는 공간",
  openGraph: openGraphFor(defaultLocale),
  twitter: { card: "summary_large_image" },
};

// 브라우저 언어가 한국어가 아니면 영어판으로 보낸다.
//
// output: "export"라 Proxy(구 미들웨어)도 redirects도 못 쓴다(static-exports
// 문서의 Unsupported Features). 서버에서 Accept-Language를 볼 지점이 없으니
// 판단은 클라이언트 몫이고, 페인트 전에 끝내야 한국어 화면이 한 프레임
// 스치지 않는다 — 그래서 컴포넌트 이펙트가 아니라 <head> 인라인 스크립트다.
//
// 지키는 선 네 가지:
//  - localizedPaths(/, /blog)에서만 동작한다. 글 상세는 번역이 있는 글만 en
//    라우트가 있어서 통째로 매핑하면 404로 보낼 수 있다.
//  - 사용자가 LanguageSwitcher로 직접 고른 적이 있으면(localStorage.locale)
//    그 선택이 브라우저 설정을 이긴다. 저장이 없을 때만 감지가 개입한다.
//  - replace라 히스토리에 남지 않는다. push였다면 뒤로가기가 한국어 페이지로
//    돌아왔다가 다시 튕겨나가는 루프가 된다.
//  - 크롤러는 건드리지 않는다. Googlebot은 en-US로 렌더링해서 한국어 "/"를
//    /en/으로의 리다이렉트로 볼 수 있다. 패턴에 yeti·daum이 따로 있는 건
//    네이버·다음 크롤러 UA에 bot/crawl/spider가 하나도 안 들어가기 때문이고
//    (실측), "-user/"는 ChatGPT-User·Claude-User·Perplexity-User처럼
//    사람이 시켜서 페이지를 읽는 AI 에이전트들의 공통 접미사다.
const localeRedirectScript = `
(function () {
  try {
    if (/bot|crawl|spider|slurp|yeti|daum|naver|bingpreview|headlesschrome|-user\\//i.test(navigator.userAgent)) return;

    var paths = ${JSON.stringify(localizedPaths)};
    // 정규식으로 끝 슬래시를 떼지 않는다: 이 스크립트는 템플릿 리터럴 안에
    // 있어서 \\/ 가 / 로 접히고, /\\/+$/ 는 //+$/ 라는 깨진 리터럴이 되어
    // 스크립트 전체가 파싱 단계에서 죽는다(실제로 겪음).
    var path = location.pathname;
    if (path.length > 1 && path.charAt(path.length - 1) === "/") {
      path = path.slice(0, -1);
    }
    if (!path) path = "/";
    if (paths.indexOf(path) === -1) return;

    var stored = null;
    try { stored = localStorage.getItem("locale"); } catch (e) {}
    if (stored === ${JSON.stringify(defaultLocale)}) return;

    if (stored === null) {
      var langs = navigator.languages && navigator.languages.length
        ? navigator.languages
        : [navigator.language || ""];
      var picked = "";
      for (var i = 0; i < langs.length; i++) {
        var base = String(langs[i]).toLowerCase().split("-")[0];
        if (base === "ko" || base === "en") { picked = base; break; }
      }
      // 지원 언어가 하나도 없으면(예: fr) 영어가 한국어보다 나은 기본값이다.
      if (picked === ${JSON.stringify(defaultLocale)}) return;
    }

    location.replace("/en" + (path === "/" ? "" : path) + "/" + location.search + location.hash);
  } catch (e) {}
})();
`;

const themeInitScript = `
(function () {
  var stored = null;
  try {
    stored = localStorage.getItem("theme");
  } catch (e) {}
  var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  if (stored ? stored === "dark" : prefersDark) {
    document.documentElement.classList.add("dark");
  }
})();
`;

// Home is ~780svh of pinned scroll and a project detail page is ~1.5
// viewports, so the browser's native back/forward restore — which runs while
// the short outgoing page is still in the DOM — clamps the saved position
// down to that short page's maximum scroll and drops the reader near the top
// of the intro. components/scroll-restoration.tsx restores the position
// itself instead, once the document is actually tall enough. This has to run
// before the browser gets a chance to restore, hence an inline script rather
// than an effect.
// It also rescues the position for a back navigation that crosses a full
// document load (the detail page was reloaded first, so `back` is a real page
// load rather than a popstate): Next's router replaces `history.state` with
// its own during startup, dropping our key, so read it here — before Next's
// bundle runs — and park it on `window` for the component to pick up.
const scrollRestorationInitScript = `
(function () {
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  try {
    var saved = history.state && history.state.__scrollY;
    if (typeof saved === "number") window.__initialScrollY = saved;
  } catch (e) {}
})();
`;

// Static export serves every locale's HTML with the root layout's lang="ko".
// Correct it from the URL before paint so screen readers and the browser's
// translation prompt see the right language without waiting for hydration
// (LocaleHtmlLang still handles client-side navigations after that).
const langInitScript = `
(function () {
  var nonDefault = ${JSON.stringify(locales.filter((l) => l !== defaultLocale))};
  var seg = location.pathname.split("/")[1];
  if (nonDefault.indexOf(seg) !== -1) {
    document.documentElement.lang = seg;
  }
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full scroll-smooth antialiased`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        {/* 이 페이지를 떠날 수도 있으므로 다른 초기화보다 먼저 판단한다. */}
        <script dangerouslySetInnerHTML={{ __html: localeRedirectScript }} />
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <script dangerouslySetInnerHTML={{ __html: langInitScript }} />
        <script
          dangerouslySetInnerHTML={{ __html: scrollRestorationInitScript }}
        />
      </head>
      <body className="flex min-h-full flex-col overflow-x-hidden">
        <ScrollRestoration />
        {children}
      </body>
    </html>
  );
}
