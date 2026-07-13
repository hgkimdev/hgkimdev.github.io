"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";

import { cn } from "@/lib/utils";
import { localizeHref, type Locale } from "@/lib/i18n/config";
import { getZone, type Zone } from "@/lib/nav";

const zones: Zone[] = ["intro", "blog"];

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
    <div className="relative inline-flex items-center rounded-full border border-border bg-muted/50 p-0.5 text-xs font-medium">
      {zones.map((zone) => {
        const isActive = zone === currentZone;

        return (
          <Link
            key={zone}
            href={hrefs[zone]}
            aria-current={isActive}
            onClick={() => {
              // Force scroll-to-top synchronously, before Next.js processes
              // the navigation. Without this, if you switch zones while
              // scrolled deep into a long page, the sticky header can
              // momentarily "unstick" during the DOM swap (old tall page
              // gone, new short page in, scrollY still at the old depth) —
              // Framer Motion's layoutId measurement picks up that
              // transient rect and springs the pill in from there,
              // making it look like it flies up from the bottom of the
              // page instead of sliding sideways.
              if (!isActive) {
                // `behavior: "instant"` matters here — <html> has
                // scroll-smooth (see app/layout.tsx), so a plain
                // window.scrollTo(0, 0) would itself animate, drifting
                // through the transition window instead of resetting
                // before Motion measures anything.
                window.scrollTo({ top: 0, left: 0, behavior: "instant" });
              }
            }}
            className={cn(
              "relative z-10 rounded-full px-2.5 py-1 transition-colors",
              isActive
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {isActive && (
              <motion.span
                layoutId="zone-switcher-active"
                transition={{ type: "spring", stiffness: 500, damping: 22 }}
                className="absolute inset-0 -z-10 rounded-full bg-background shadow-sm"
              />
            )}
            {labels[zone]}
          </Link>
        );
      })}
    </div>
  );
}
