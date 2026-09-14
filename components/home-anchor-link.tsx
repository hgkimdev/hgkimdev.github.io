import Link from "next/link";
import type { ReactNode } from "react";

import { localizeAnchor, type Locale } from "@/lib/i18n/config";

/**
 * Home의 섹션(About/Projects/Life/Contact)으로 가는 링크.
 *
 * `active`는 "스크롤이 지금 이 섹션에 있다"는 뜻이다. 값은 `"page"`가 아니라
 * `"true"`를 쓴다 — `page`는 여러 **페이지** 중 현재 페이지를 가리키는 값인데
 * 여기는 한 페이지 안의 위치라 뜻이 어긋난다. life-overlay.tsx의 카테고리
 * 표시도 같은 이유로 `"true"`다.
 *
 * 헤더의 밑줄은 이 속성을 그대로 표적으로 삼아 위치를 잰다(site-header.tsx).
 * 표시용 클래스를 따로 두지 않은 것은, 눈에 보이는 상태와 접근성 트리가
 * 갈라질 여지를 아예 없애기 위해서다.
 */
export function HomeAnchorLink({
  anchor,
  locale,
  className,
  active,
  children,
}: {
  anchor: string;
  locale: Locale;
  className?: string;
  active?: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      href={localizeAnchor(anchor, locale)}
      className={className}
      aria-current={active ? "true" : undefined}
    >
      {children}
    </Link>
  );
}
