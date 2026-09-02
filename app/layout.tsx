import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { ScrollRestoration } from "@/components/scroll-restoration";
import { defaultLocale, locales } from "@/lib/i18n/config";
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
