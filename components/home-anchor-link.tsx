import Link from "next/link";
import type { ReactNode } from "react";

import { localizeAnchor, type Locale } from "@/lib/i18n/config";

/** Home의 섹션(About/Projects/Life/Contact)으로 가는 링크. */
export function HomeAnchorLink({
  anchor,
  locale,
  className,
  children,
}: {
  anchor: string;
  locale: Locale;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link href={localizeAnchor(anchor, locale)} className={className}>
      {children}
    </Link>
  );
}
