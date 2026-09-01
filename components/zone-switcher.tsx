"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";

import { cn } from "@/lib/utils";
import { localizeHref, type Locale } from "@/lib/i18n/config";
import { getZone, type Zone } from "@/lib/nav";

const zones: Zone[] = ["intro", "blog"];

// 존마다 고유 강조색을 준다(Intro=코랄, Blog=시안). 트랙 배경은 두 색을
// --card와 옅게 섞은 그라디언트로, 활성 탭은 카드색 배경 + 해당 색 테두리로
// "지금 어디 있는지"를 즉시 읽히게 한다.
const zoneAccent: Record<Zone, string> = {
  intro: "var(--zone-intro)",
  blog: "var(--zone-blog)",
};

export function ZoneSwitcher({
  locale,
  labels,
}: {
  locale: Locale;
  labels: Record<Zone, string>;
}) {
  const pathname = usePathname();
  const currentZone = getZone(pathname, locale);

  const hrefs: Record<Zone, string> = {
    intro: localizeHref("/", locale),
    blog: localizeHref("/blog", locale),
  };

  return (
    <div
      className="relative inline-flex items-center rounded-full border border-border p-0.5 text-xs font-medium"
      style={{
        background: `linear-gradient(90deg, color-mix(in srgb, ${zoneAccent.intro} var(--zone-switcher-tint), var(--card)), color-mix(in srgb, ${zoneAccent.blog} var(--zone-switcher-tint), var(--card)))`,
      }}
    >
      {zones.map((zone) => {
        const isActive = zone === currentZone;

        return (
          <Link
            key={zone}
            href={hrefs[zone]}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "relative z-10 rounded-full px-2.5 py-1 transition-colors",
              !isActive && "text-muted-foreground hover:text-foreground"
            )}
            style={isActive ? { color: zoneAccent[zone] } : undefined}
          >
            {isActive && (
              <motion.span
                layoutId="zone-switcher-active"
                transition={{ type: "spring", stiffness: 500, damping: 22 }}
                className="absolute inset-0 -z-10 rounded-full bg-card"
                style={{ boxShadow: `0 0 0 1.5px ${zoneAccent[zone]}` }}
              />
            )}
            {labels[zone]}
          </Link>
        );
      })}
    </div>
  );
}
