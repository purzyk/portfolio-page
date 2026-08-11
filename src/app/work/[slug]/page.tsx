import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Screen } from '@/components/Screen'
import { WorkBrowser } from '@/components/WorkBrowser'
import { getCaseStudies, getCaseStudy } from '@/lib/content'
import { renderMarkdown } from '@/lib/markdown'
import { WORK, getWorkItem } from '@/lib/work'

/**
 * One route, two kinds of page.
 *
 * A work slug (`/work/bridge`) is that item selected. On desktop it renders the same
 * two-pane browser as the home page with the item already in the pane, so a shared link
 * opens what the sender saw. Below the collapse point there is no pane, so it renders as
 * a page of its own instead.
 *
 * A case-study slug (`/work/bridge-call-history`) is the long-form Markdown piece.
 *
 * Work items are checked first. The two namespaces don't currently collide, and if one
 * ever did, the work item is the more important page.
 */

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const studies = await getCaseStudies()
  return [...WORK.map((item) => ({ slug: item.slug })), ...studies.map((s) => ({ slug: s.slug }))]
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params

  const item = getWorkItem(slug)
  if (item) {
    return {
      title: item.title,
      description: item.blurb,
      alternates: {
        // The lead item's page is the same view the home page serves, so `/` is the
        // canonical of the pair. Every other item is canonical at its own address.
        canonical: item.slug === WORK[0]!.slug ? '/' : `/work/${item.slug}`,
      },
    }
  }

  const study = await getCaseStudy(slug)
  if (!study) return {}

  return {
    title: study.title,
    description: study.subtitle,
    openGraph: {
      title: study.title,
      description: study.subtitle,
      type: 'article',
    },
  }
}

export default async function WorkDetailPage({ params }: Props) {
  const { slug } = await params

  const item = getWorkItem(slug)
  if (item) {
    return (
      <>
        {/* Desktop: the same two-pane browser as the home page, with this item already
            in the pane — so a link someone shares opens what the sender was looking at,
            list and all, rather than a dead-end page. */}
        <div className='hidden lg:block'>
          <WorkBrowser initialSlug={item.slug} />
        </div>

        {/* Below the collapse point the pane doesn't exist, so this item gets a page of
            its own. Rendered as a sibling and toggled by CSS rather than by measuring
            the viewport in JS: both are static HTML, and there's no flash on load. */}
        <article className='px-4 pb-9 pt-5 sm:px-7 lg:hidden'>
          <Link
            href='/'
            className='font-mono text-ui text-ink-muted no-underline transition-colors duration-row hover:text-ink'
          >
            ← work
          </Link>

          <header className='mt-6'>
            <h1 className='text-title-pane font-medium text-ink'>{item.title}</h1>
            <p className='mt-1.5 font-mono text-meta text-ink-muted'>
              {[item.company ?? item.group, item.period ?? item.year, item.kind]
                .filter(Boolean)
                .join(' · ')}
            </p>
          </header>

          <p className='mt-5 max-w-measure text-body text-ink-body'>{item.blurb}</p>

          <ul className='mt-5 flex flex-wrap gap-1.5'>
            {item.stack.map((entry) => (
              <li
                key={entry}
                className='border border-border px-2 py-1 font-mono text-chip text-ink-body'
              >
                {entry}
              </li>
            ))}
          </ul>

          {item.link === 'case-study' && item.caseStudy && (
            <Link
              href={`/work/${item.caseStudy}`}
              className='mt-6 inline-block bg-accent px-3.5 py-2 font-mono text-ui text-accent-on no-underline transition-colors duration-row hover:bg-accent-hover active:bg-accent-active'
            >
              Read the case study →
            </Link>
          )}

          {item.link === 'external' && item.href && (
            <a
              href={item.href}
              target='_blank'
              rel='noreferrer'
              className='mt-6 inline-block bg-accent px-3.5 py-2 font-mono text-ui text-accent-on no-underline transition-colors duration-row hover:bg-accent-hover active:bg-accent-active'
            >
              Visit the site ↗
            </a>
          )}

          {/* Secondary action — text with a border, so the filled button stays unique. */}
          {item.demo && (
            <p className='mt-5 font-mono text-meta text-ink-muted'>
              Try it:{' '}
              <a
                href={item.demo.href}
                target='_blank'
                rel='noreferrer'
                className='border-b border-border text-ink transition-colors duration-row hover:border-accent hover:text-accent'
              >
                {item.demo.href.replace(/^https?:\/\//, '').replace(/\/$/, '')}
              </a>{' '}
              ↗ {item.demo.note}
            </p>
          )}

          <Screen
            src={item.image.src}
            alt={item.image.alt}
            width={item.image.width}
            height={item.image.height}
            mode='ratio'
            priority
            className='mt-7'
          />
        </article>
      </>
    )
  }

  const study = await getCaseStudy(slug)
  if (!study) notFound()

  const html = await renderMarkdown(study.body)
  const meta = [study.company, study.period, study.role].filter(Boolean)

  return (
    <div className='grid lg:grid-cols-study'>
      {/* Sticky metadata rail. Above the h1 as a stacked block once it collapses.
          The whole rail sticks — including "← work" — so the way out of a long piece is
          always on screen. `top` clears the sticky window bar rather than the viewport. */}
      <aside className='border-border px-4 pt-9 sm:px-7 lg:sticky lg:top-bar lg:self-start lg:border-r lg:px-6'>
        <Link
          href='/'
          className='font-mono text-ui text-ink-muted no-underline transition-colors duration-row hover:text-ink'
        >
          ← work
        </Link>

        <dl className='mt-6 space-y-3.5 font-mono text-meta text-ink-muted'>
          {meta.map((entry) => (
            <div key={entry}>
              <dd>{entry}</dd>
            </div>
          ))}
          {study.tags.length > 0 && (
            <div className='flex flex-wrap gap-1.5 pt-2'>
              {study.tags.map((tag) => (
                <span key={tag} className='border border-border px-2 py-1 text-chip text-ink-body'>
                  {tag}
                </span>
              ))}
            </div>
          )}
        </dl>
      </aside>

      <article className='min-w-0 px-4 pb-16 pt-9 sm:px-7 lg:px-13 lg:pt-10'>
        <h1 className='max-w-lede text-title-study font-medium text-ink'>{study.title}</h1>

        {/* Rendered server-side; the HTML is ours, from our own content files. */}
        <div className='prose mt-7' dangerouslySetInnerHTML={{ __html: html }} />
      </article>
    </div>
  )
}
