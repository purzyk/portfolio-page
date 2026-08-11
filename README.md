# Piotr Purzycki — portfolio

Personal portfolio site: work history, case studies, and a downloadable CV.
Built with Next.js (App Router), TypeScript and Tailwind.

Live at [purzycki.pl](https://purzycki.pl).

## Stack

- **Next.js 15** / React 19, TypeScript
- **Tailwind CSS** — design tokens in `src/app/tokens.css`, referenced by
  `tailwind.config.ts` rather than duplicated
- **Markdown case studies** — parsed with `gray-matter`, rendered through a
  `unified`/`remark`/`rehype` pipeline, code blocks highlighted with `shiki`
- **Cypress** (in the app repo this content is drawn from, not here) — the
  Bridge screenshots in `public/work/` are visual-regression snapshots, not
  hand-taken captures

## Getting started

Requires Node 22+.

```bash
npm install
npm run dev
```

Open [localhost:3000](http://localhost:3000).

## Scripts

| Command                | What it does                              |
| ----------------------- | ------------------------------------------ |
| `npm run dev`           | Dev server with hot reload                |
| `npm run build`         | Production build                          |
| `npm run start`         | Serve the production build                |
| `npm run lint`          | ESLint over `src`                         |
| `npm run typecheck`     | `tsc --noEmit`                            |
| `npm run format`        | Prettier, writes                          |
| `npm run format:check`  | Prettier, check only                      |

## Environment

| Variable               | Purpose                                                        | Default (dev)           |
| ------------------------ | ---------------------------------------------------------------- | -------------------------- |
| `NEXT_PUBLIC_SITE_URL`  | Absolute base for canonical URLs, sitemap, robots.txt, OG tags, JSON-LD | `http://localhost:3000` |

Set this in `.env.local` for local overrides (gitignored), and in your
hosting platform's environment settings for production — it does not travel
with the repo.

## Content

Work items (the six cards on the home page) are structured data in
`src/lib/work.ts`. Long-form case studies are Markdown files in
`content/case-studies/`, with frontmatter (`title`, `subtitle`, `tags`,
`draft`, …) parsed by `src/lib/content.ts`.

A case study's `slug` (its filename, minus `.md`) must not collide with a
work item's `slug` in `work.ts` — `/work/[slug]` checks work items first, so
a matching case-study slug would become unreachable.

Draft case studies (`draft: true`) render in development and are hidden in
production, unless `SHOW_DRAFTS=1` is set.

## Structure

```
src/app/            routes (App Router) — home, /about, /work/[slug],
                     plus file-convention SEO routes: sitemap.ts, robots.ts,
                     icon.svg, opengraph-image.tsx
src/components/      UI components
src/lib/             content loading (content.ts), markdown rendering
                     (markdown.ts), work data (work.ts), site config (site.ts)
content/case-studies/  Markdown case studies
public/work/         screenshots, clips, CV PDF, portrait
```
