"use client";

import { useEffect, useRef, useState } from "react";

import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

// giscus 설정. 전부 공개돼도 되는 값이라 env가 아니라 여기 둔다 — 어차피
// 브라우저가 받는 스크립트 속성으로 그대로 나간다.
//
// repoId·categoryId는 GitHub GraphQL로 조회한 값이다:
//   gh api graphql -f query='{ repository(owner:"hgkimdev", name:"hgkimdev.github.io"){
//     id discussionCategories(first:20){ nodes { id name } } } }'
//
// 카테고리를 Announcements로 잡은 이유: 이 카테고리는 메인테이너만 새 토론을
// 열 수 있어서, 글마다 필요한 토론은 giscus가 첫 댓글이 달릴 때 만들고
// 아무나 빈 토론을 양산할 수는 없다.
const GISCUS = {
  repo: "hgkimdev/hgkimdev.github.io",
  repoId: "R_kgDOTUo_OQ",
  category: "Announcements",
  categoryId: "DIC_kwDOTUo_Oc4DEPBy",
  // 글 URL 하나가 토론 하나에 대응한다. slug를 바꾸면 그 글의 댓글과 연결이
  // 끊기므로, 공개한 뒤에는 파일 이름을 바꾸지 않는다.
  mapping: "pathname",
} as const;

// giscus가 지원하는 위젯 UI 언어 코드. 사이트 로케일과 1:1로 대응한다.
const GISCUS_LANG: Record<Locale, string> = {
  ko: "ko",
  en: "en",
};

// 사이트 테마는 <html>의 .dark 클래스로 갈린다(prefers-color-scheme가 아니다).
// giscus에 preferred_color_scheme을 주면 토글과 어긋나므로 클래스를 직접 보고
// 정해서 넘긴다. dark 대신 dark_dimmed를 쓰는 건 giscus의 dark(#0d1117)가
// 이 사이트의 다크 배경보다 훨씬 검어서 댓글창만 구멍처럼 파이기 때문이다.
function giscusTheme(isDark: boolean): string {
  return isDark ? "dark_dimmed" : "light";
}

/**
 * 글 하단 댓글. GitHub Discussions를 저장소로 쓰는 giscus 임베드라 정적
 * 사이트에서도 동작한다 — 서버가 필요한 쪽은 전부 GitHub에 있다.
 *
 * 스크립트는 마운트 후에만 붙는다. 정적 export된 HTML에는 iframe이 없고,
 * data-loading="lazy"라 화면에 들어올 때 실제 로드가 시작된다.
 */
export function GiscusComments({ locale }: { locale: Locale }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDark, setIsDark] = useState(false);

  // 테마 감시. ThemeToggle이 <html>의 클래스를 갈아끼우므로 그 변화만 본다.
  useEffect(() => {
    const root = document.documentElement;
    const read = () => setIsDark(root.classList.contains("dark"));
    read();
    const observer = new MutationObserver(read);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  // 스크립트 주입. 한 번만 붙이고, 이후 테마 변경은 아래 effect가
  // postMessage로 처리한다 — 다시 붙이면 댓글창이 통째로 깜빡인다. locale은
  // 라우트가 바뀌면 컴포넌트째로 새로 마운트되므로 의존성에 넣지 않는다.
  useEffect(() => {
    const container = containerRef.current;
    if (!container || container.firstChild) return;

    const script = document.createElement("script");
    script.src = "https://giscus.app/client.js";
    script.async = true;
    script.crossOrigin = "anonymous";
    script.setAttribute("data-repo", GISCUS.repo);
    script.setAttribute("data-repo-id", GISCUS.repoId);
    script.setAttribute("data-category", GISCUS.category);
    script.setAttribute("data-category-id", GISCUS.categoryId);
    script.setAttribute("data-mapping", GISCUS.mapping);
    script.setAttribute("data-strict", "1");
    script.setAttribute("data-reactions-enabled", "1");
    script.setAttribute("data-emit-metadata", "0");
    script.setAttribute("data-input-position", "top");
    script.setAttribute("data-lang", GISCUS_LANG[locale]);
    script.setAttribute("data-loading", "lazy");
    script.setAttribute(
      "data-theme",
      giscusTheme(document.documentElement.classList.contains("dark")),
    );
    container.appendChild(script);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const frame = document.querySelector<HTMLIFrameElement>(
      "iframe.giscus-frame",
    );
    frame?.contentWindow?.postMessage(
      { giscus: { setConfig: { theme: giscusTheme(isDark) } } },
      "https://giscus.app",
    );
  }, [isDark]);

  return (
    <section className="flex flex-col gap-4 border-t border-border/60 pt-8">
      <h2 className="font-mono text-sm text-muted-foreground">
        {getDictionary(locale).blog.comments}
      </h2>
      <div ref={containerRef} />
    </section>
  );
}
