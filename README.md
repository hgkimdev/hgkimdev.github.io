# hgkimdev.github.io

Personal site built with Next.js (App Router), statically exported to GitHub Pages.

- **Intro zone** (`/`): a single pinned-scroll page (About / Projects / Life / Contact)
- **Blog zone** (`/blog`): a Markdown-backed blog with categories, tags, and comments (giscus)
- **Locales**: `/` (Korean, default), `/en` — see `lib/i18n/`

See [`SPEC.md`](./SPEC.md) for the reasoning behind the site's structure and design decisions, and [`docs/bug-audit-2026-07-15.md`](./docs/bug-audit-2026-07-15.md) for a point-in-time audit of the codebase.

## Getting started

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

- `npm run dev` / `npm run build` — `predev`/`prebuild` runs `scripts/build-blog-images.mjs` first, which bakes blog images into the sizes the list/detail views expect (see SPEC.md's image section)
- `npm run lint` — ESLint (`next lint`'s config, run directly)

## Stack

Next.js · React · TypeScript · Tailwind CSS · shadcn/ui (Base UI primitives) · Motion

`next.config.ts` sets `output: 'export'` — the site is a fully static export, deployed to GitHub Pages via `.github/workflows/deploy.yml` on every push to `main`.

## Content

Blog posts live in `content/blog/*.md` (frontmatter: `title`, `date`, `category`, `tags`, `summary`, optional `cover`, `draft`). Files starting with `_` are excluded from the list; `_template.md` is the starting point for a new post.
