import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import matter from 'gray-matter'

/**
 * Content source: Markdown files on disk.
 *
 * Deliberately isolated behind this module. Phase 0b swaps the file reads for
 * database queries, and nothing downstream — the renderer, the page components —
 * needs to change. That separation is the reason the database can come second.
 */

const CONTENT_DIR = path.join(process.cwd(), 'content', 'case-studies')

export interface CaseStudyMeta {
  slug: string
  title: string
  /** The standfirst — one or two sentences under the title. */
  subtitle: string
  company?: string
  role?: string
  /** Free text rather than dates: "2025–2026" reads better than a range. */
  period?: string
  tags: string[]
  /** Sort key, and shown as "Jan 2026" style if present. */
  date?: string
  featured?: boolean
  draft?: boolean
}

export interface CaseStudy extends CaseStudyMeta {
  /** Raw Markdown. Rendering happens in markdown.ts. */
  body: string
}

function parse(slug: string, raw: string): CaseStudy {
  const { data, content } = matter(raw)

  if (typeof data.title !== 'string' || typeof data.subtitle !== 'string') {
    throw new Error(`content/case-studies/${slug}.md is missing "title" or "subtitle"`)
  }

  return {
    slug,
    title: data.title,
    subtitle: data.subtitle,
    company: typeof data.company === 'string' ? data.company : undefined,
    role: typeof data.role === 'string' ? data.role : undefined,
    period: typeof data.period === 'string' ? data.period : undefined,
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    date: typeof data.date === 'string' ? data.date : undefined,
    featured: data.featured === true,
    draft: data.draft === true,
    body: content,
  }
}

export async function getCaseStudy(slug: string): Promise<CaseStudy | null> {
  try {
    const raw = await readFile(path.join(CONTENT_DIR, `${slug}.md`), 'utf8')
    return parse(slug, raw)
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null
    throw error
  }
}

/**
 * Case studies, newest first.
 *
 * Drafts are listed in development so you can see work in progress, and hidden in
 * production. `SHOW_DRAFTS=1` overrides that — useful for previewing a build.
 */
export async function getCaseStudies(): Promise<CaseStudy[]> {
  // Deliberately not swallowing errors: a missing content directory is a
  // misconfiguration, and an empty list would hide it behind a working page.
  const files = await readdir(CONTENT_DIR)

  const studies = await Promise.all(
    files
      .filter((file) => file.endsWith('.md'))
      .map(async (file) => {
        const slug = file.replace(/\.md$/, '')
        const raw = await readFile(path.join(CONTENT_DIR, file), 'utf8')
        return parse(slug, raw)
      }),
  )

  const showDrafts = process.env.NODE_ENV !== 'production' || process.env.SHOW_DRAFTS === '1'

  return studies
    .filter((study) => showDrafts || !study.draft)
    .sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''))
}
