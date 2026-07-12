"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";

import { cn } from "@/lib/utils";

export function LanguageSwitcher() {
  const pathname = usePathname();
  const isEn = pathname === "/en" || pathname.startsWith("/en/");
  const basePath = isEn ? pathname.replace(/^\/en/, "") || "/" : pathname;
  const koHref = basePath;
  const enHref = basePath === "/" ? "/en" : `/en${basePath}`;

  return (
    <div className="relative inline-flex items-center rounded-full border border-border bg-muted/50 p-0.5 text-xs font-medium">
      <Link
        href={koHref}
        aria-current={!isEn}
        className={cn(
          "relative z-10 rounded-full px-2.5 py-1 transition-[color,transform] hover:scale-105 active:scale-95",
          !isEn ? "text-foreground" : "text-muted-foreground hover:text-foreground"
        )}
      >
        {!isEn && (
          <motion.span
            layout
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 22 }}
            className="absolute inset-0 -z-10 rounded-full bg-background shadow-sm"
          />
        )}
        KO
      </Link>
      <Link
        href={enHref}
        aria-current={isEn}
        className={cn(
          "relative z-10 rounded-full px-2.5 py-1 transition-[color,transform] hover:scale-105 active:scale-95",
          isEn ? "text-foreground" : "text-muted-foreground hover:text-foreground"
        )}
      >
        {isEn && (
          <motion.span
            layout
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 22 }}
            className="absolute inset-0 -z-10 rounded-full bg-background shadow-sm"
          />
        )}
        EN
      </Link>
    </div>
  );
}
