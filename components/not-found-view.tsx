"use client";

import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { useSyncExternalStore } from "react";

import { defaultLocale, locales, localizeHref } from "@/lib/i18n/config";
import type { Locale } from "@/lib/i18n/config";

/**
 * 404 화면.
 *
 * **문구는 로케일과 무관하게 영어 하나다.** 이 화면만은 자기 로케일을 빌드
 * 타임에 알 수 없다 — `output: "export"`는 404를 문서 하나(`out/404.html`)로
 * 굽고 GitHub Pages는 매칭되지 않는 주소 전부에 그 파일을 내주므로
 * `/en/blog/오타`도 같은 문서다. 그래서 번역을 붙이는 대신 영어로 통일하고,
 * 주소에서 읽어낸 로케일은 **돌아가는 링크에만** 쓴다(`/` vs `/en`).
 * 본문이 영어니 `<main lang="en">`으로 이 구역만 언어를 덮는다 — 루트
 * 레이아웃의 `langInitScript`가 잡는 `<html lang>`은 주소를 따라 ko일 수 있다.
 *
 * 주소를 `usePathname()`이 아니라 `useSyncExternalStore`로 읽는 이유: 구워진
 * HTML에는 주소가 없어서 클라이언트 첫 렌더가 바로 반영하면 하이드레이션
 * 문자열이 어긋나는데, 이 훅은 하이드레이션 동안 서버 스냅샷(null)을 쓰고 그
 * 뒤에 실제 값으로 갈아탄다(effect + setState는 같은 일을 하면서 렌더를 한 번
 * 더 태우고, react-hooks/set-state-in-effect에도 걸린다).
 */
export function NotFoundView() {
  const path = useSyncExternalStore(
    subscribeToNothing,
    () => window.location.pathname,
    () => null,
  );
  const segment = path?.split("/")[1];
  const locale: Locale =
    locales.find((candidate) => candidate === segment) ?? defaultLocale;

  return (
    <main lang="en" className="mx-auto w-full max-w-4xl flex-1 px-4">
      {/* 헤더도 푸터도 없는 화면이라(루트 not-found는 로케일 레이아웃 아래에
          닿지 않는다) 세로 가운데는 뷰포트 기준이다. 70svh로 잡았더니 아래가
          통째로 비어 글이 위쪽으로 쏠렸다. */}
      <section className="flex min-h-svh flex-col justify-center gap-6">
        {/* 사이트 아이콘의 `>_`, About 배경의 코드, 히어로의 커서와 같은
            어휘. 찾던 주소는 하이드레이션 후에야 알 수 있어서 처음에는
            `404`만 서 있다. */}
        <p className="font-mono text-sm text-muted-foreground">
          404
          {path && <span className="break-all"> · {path}</span>}
          <span
            aria-hidden="true"
            className="ml-1 inline-block animate-caret-blink"
          >
            ▍
          </span>
        </p>

        <div className="flex flex-col gap-3">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Nothing lives at this address
          </h1>
          <p className="max-w-xl text-muted-foreground">
            The page may have moved, or it may never have existed.
          </p>
        </div>

        <nav className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <NotFoundLink href={localizeHref("/", locale)}>Home</NotFoundLink>
          <NotFoundLink href={localizeHref("/blog", locale)}>Blog</NotFoundLink>
        </nav>
      </section>
    </main>
  );
}

// 주소는 이 문서가 살아 있는 동안 바뀌지 않는다(바뀌면 라우터가 이 화면을
// 통째로 다른 페이지로 갈아 끼운다). 구독할 것이 없으므로 해지 함수만 돌려준다.
const subscribeToNothing = () => () => {};

function NotFoundLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 font-mono text-sm text-muted-foreground transition-colors hover:text-foreground"
    >
      {children}
      <ArrowRightIcon className="size-4" />
    </Link>
  );
}
