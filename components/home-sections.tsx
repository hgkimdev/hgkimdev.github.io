"use client";

import { motion } from "motion/react";

import type { HomeSectionKey } from "@/lib/nav";

type Section = { key: HomeSectionKey; label: string; description: string };

export function HomeSections({
  sections,
  comingSoonText,
}: {
  sections: Section[];
  comingSoonText: string;
}) {
  return (
    <div>
      {sections.map((section, index) => (
        <motion.section
          key={section.key}
          id={section.key}
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative left-1/2 flex min-h-[calc(100vh-var(--header-height))] w-screen -translate-x-1/2 scroll-mt-20 flex-col justify-center border-t border-border/60"
        >
          <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4">
            <span className="font-mono text-sm text-muted-foreground">
              {String(index + 1).padStart(2, "0")} /{" "}
              {String(sections.length).padStart(2, "0")}
            </span>
            <h2 className="text-4xl font-bold tracking-tight sm:text-6xl">
              {section.label}
            </h2>
            <p className="max-w-md text-lg text-muted-foreground">
              {section.description}
            </p>
            <p className="text-sm text-muted-foreground">{comingSoonText}</p>
          </div>
        </motion.section>
      ))}
    </div>
  );
}
