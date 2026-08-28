"use client";

import { useRouter as useNextRouter } from "next/navigation";

import { resetScrollBeforeNavigatingTo } from "@/lib/scroll";

/**
 * Wraps next/navigation의 useRouter — router.push/replace를 부르기 전에
 * 스크롤을 리셋한다(lib/scroll.ts 참고: 깊이 스크롤한 페이지에서 더 짧은
 * 페이지로 넘어가면 ZoneSwitcher의 layoutId 필이 튄다). `<a>` 클릭은
 * components/scroll-reset-on-nav.tsx가 같은 이유로 이미 처리하지만, Base UI
 * Select의 onValueChange처럼 진짜 앵커 클릭 없이 router.push를 직접 부르는
 * 트리거는 그 문서 단위 클릭 리스너에 잡히지 않는다 — 이쪽이 그 빈틈을
 * 메운다.
 *
 * next/navigation의 useRouter를 직접 쓰지 말고 이 훅을 쓸 것 —
 * eslint.config.mjs가 이 파일 밖에서 원본 import를 막아서, 새 네비게이션
 * 트리거가 이 처리를 빠뜨릴 수 없다.
 */
export function useAppRouter() {
  const router = useNextRouter();

  return {
    ...router,
    push: (href: string, options?: Parameters<typeof router.push>[1]) => {
      resetScrollBeforeNavigatingTo(href);
      router.push(href, options);
    },
    replace: (href: string, options?: Parameters<typeof router.replace>[1]) => {
      resetScrollBeforeNavigatingTo(href);
      router.replace(href, options);
    },
  };
}
