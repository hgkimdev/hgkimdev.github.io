import { readFileSync } from "node:fs";
import path from "node:path";

import type { Locale } from "@/lib/i18n/config";

/** A paragraph, already split into the lines it should render as. */
export type AboutParagraph = string[];
export type AboutContent = { title: string; paragraphs: AboutParagraph[] };

// Lines, not sentences, are the typographic unit — though paragraphs stay the
// animation unit. Exactly one mechanism decides where a line ends: a newline in
// the source. A blank line separates paragraphs, a single newline separates
// lines within one. There is deliberately no automatic sentence splitting to
// compete with it — where a line breaks is an editorial call, so it belongs in
// content/about.md where it is visible, not in a regex here. Split at build
// time, so it costs nothing at runtime.
function splitLines(paragraph: string): string[] {
  return paragraph
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

// ko 원문은 about.md, 번역은 about.<locale>.md — content/blog의 규칙과 같다.
export function getAboutContent(locale: Locale = "ko"): AboutContent {
  const fileName = locale === "ko" ? "about.md" : `about.${locale}.md`;
  const raw = readFileSync(path.join(process.cwd(), "content", fileName), "utf8");
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  const frontmatter = match?.[1] ?? "";
  const body = match?.[2] ?? raw;
  const title = frontmatter.match(/title:\s*(.+)/)?.[1]?.trim() ?? "About";
  const paragraphs = body
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map(splitLines);
  return { title, paragraphs };
}
