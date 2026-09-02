"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { localizeHref, type Locale } from "@/lib/i18n/config";
import { getZone, type Zone } from "@/lib/nav";

const zones: Zone[] = ["intro", "blog"];

// 존마다 고유 강조색을 준다(Intro=코랄, Blog=시안). 활성 탭만 카드색 배경 +
// 해당 색 테두리·글자로 "지금 어디 있는지"를 즉시 읽히게 한다.
//
// 트랙 자체는 색을 갖지 않는다. 알약이 움직이지 않게 된 뒤로는 상태를
// 말하는 게 오직 정지된 대비뿐인데, 트랙까지 색을 띠면 트랙 색 / 카드 면 /
// 액센트 링 세 겹이 비슷한 밝기로 겹쳐 어느 것도 도드라지지 않았다. 트랙은
// 밝기만 한 톤 낮춰(--zone-switcher-track) 알약이 뜨는 바닥 역할만 한다.
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
    <div className="relative inline-flex items-center rounded-full border border-border bg-[var(--zone-switcher-track)] p-0.5 text-xs font-medium">
      {zones.map((zone) => {
        const isActive = zone === currentZone;

        return (
          <Link
            key={zone}
            href={hrefs[zone]}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "relative z-10 rounded-full px-2.5 py-1 transition-colors",
              isActive
                ? "bg-card"
                : "text-muted-foreground hover:text-foreground"
            )}
            style={
              isActive
                ? {
                    color: zoneAccent[zone],
                    boxShadow: `0 0 0 1.5px ${zoneAccent[zone]}`,
                  }
                : undefined
            }
          >
            {labels[zone]}
          </Link>
        );
      })}
    </div>
  );
}
