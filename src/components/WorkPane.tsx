import Link from 'next/link'
import { Screen } from '@/components/Screen'
import type { WorkItem } from '@/lib/work'

/**
 * The right pane: one project's header, description, stack, and screenshot.
 *
 * The screenshot takes `flex-1` on desktop so it absorbs whatever height is left —
 * that's what lets the window be a fixed 840px with nothing scrolling. Below 1100px
 * the window unpins and the frame switches to an explicit aspect ratio instead.
 */

export function WorkPane({ item }: { item: WorkItem }) {
  return (
    <article className='flex min-w-0 flex-col'>
      <header className='flex flex-wrap items-start justify-between gap-4 border-b border-border px-7 pb-5 pt-6'>
        <div className='min-w-0'>
          <h2 className='text-title-pane font-medium text-ink'>{item.title}</h2>
          <p className='mt-1 font-mono text-meta text-ink-muted'>
            {[item.company ?? item.group, item.period ?? item.year, item.kind]
              .filter(Boolean)
              .join(' · ')}
          </p>
        </div>

        {/* Exactly one filled button per page. A second call to action anywhere else
            is text-only with a bottom border. */}
        {item.link === 'case-study' && item.caseStudy && (
          <Link
            href={`/work/${item.caseStudy}`}
            className='flex-none whitespace-nowrap bg-accent px-3.5 py-2 font-mono text-ui text-accent-on no-underline transition-colors duration-row hover:bg-accent-hover active:bg-accent-active'
          >
            Read the case study →
          </Link>
        )}

        {item.link === 'external' && item.href && (
          <a
            href={item.href}
            target='_blank'
            rel='noreferrer'
            className='flex-none whitespace-nowrap bg-accent px-3.5 py-2 font-mono text-ui text-accent-on no-underline transition-colors duration-row hover:bg-accent-hover active:bg-accent-active'
          >
            Visit the site ↗
          </a>
        )}

        {item.link === 'internal' && (
          <p className='flex-none font-mono text-label-sm uppercase text-ink-muted'>
            ⓘ internal — no public link
          </p>
        )}
      </header>

      {/* The secondary action. Text with a bottom border, never a second fill — one
          filled button per page. Sits below the header so it reads as an aside to the
          primary action rather than competing with it. */}
      {item.demo && (
        <p className='border-b border-border px-7 py-2.5 font-mono text-meta text-ink-muted'>
          Try it:{' '}
          <a
            href={item.demo.href}
            target='_blank'
            rel='noreferrer'
            className='border-b border-border text-ink transition-colors duration-row hover:border-accent hover:text-accent'
          >
            {item.demo.href.replace(/^https?:\/\//, '').replace(/\/$/, '')}
          </a>{' '}
          <span className='text-ink-muted'>↗ {item.demo.note}</span>
        </p>
      )}

      <div className='grid gap-7 px-7 pb-4.5 pt-5.5 md:grid-cols-pane'>
        <p className='text-body text-ink-body'>{item.blurb}</p>

        {/* Inventory, not emphasis — so a plain list, and below the description once
            there isn't room for a second column. */}
        <ul className='flex flex-wrap gap-x-4 gap-y-1 font-mono text-meta text-ink-muted md:block md:border-l md:border-border md:pl-4'>
          {item.stack.map((entry) => (
            <li key={entry}>{entry}</li>
          ))}
        </ul>
      </div>

      <Screen
        src={item.image.src}
        alt={item.image.alt}
        width={item.image.width}
        height={item.image.height}
        mode='fill'
        priority
        className='mx-7 mb-7'
      />
    </article>
  )
}
