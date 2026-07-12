"use client";

import { motion } from "motion/react";

import { getDictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/config";
import { navKeys } from "@/lib/nav";

export function HomeSections({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);

  return (
    <div>
      {navKeys.map((key, index) => (
        <motion.section
          key={key}
          id={key}
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex min-h-[80vh] scroll-mt-20 flex-col justify-center gap-4 border-t border-border/60"
        >
          <span className="font-mono text-sm text-muted-foreground">
            {String(index + 1).padStart(2, "0")} /{" "}
            {String(navKeys.length).padStart(2, "0")}
          </span>
          <h2 className="text-4xl font-bold tracking-tight sm:text-6xl">
            {dict.nav[key].label}
          </h2>
          <p className="max-w-md text-lg text-muted-foreground">
            {dict.nav[key].description}
          </p>
          <p className="text-sm text-muted-foreground">{dict.comingSoon}</p>
        </motion.section>
      ))}
    </div>
  );
}
