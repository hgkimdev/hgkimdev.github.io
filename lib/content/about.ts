import { readFileSync } from "node:fs";
import path from "node:path";

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

export function getAboutContent(): AboutContent {
  const raw = readFileSync(
    path.join(process.cwd(), "content/about.md"),
    "utf8",
  );
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
