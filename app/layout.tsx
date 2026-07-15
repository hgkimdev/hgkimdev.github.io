import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { defaultLocale, locales } from "@/lib/i18n/config";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "hgkim",
  description: "나라는 사람을 소개하는 공간",
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
      </head>
      <body className="flex min-h-full flex-col overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
