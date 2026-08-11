import Link from 'next/link'
import type { WorkItem } from '@/lib/work'

/**
 * A row in the persistent work list.
 *
 * The left border is 2px and transparent at rest so selecting a row shifts nothing.
 * A selected row also drops its bottom border, which is what makes it read as
 * attached to the pane beside it.
 *
 * Freelance rows are a reduced variant: one line, no description, and a right-aligned
 * arrow. That difference — not a heading — is what separates the Talksome work from
 * the client sites.
 */

interface WorkRowProps {
  item: WorkItem
  selected: boolean
  /** Below the collapse point rows navigate; above, they fill the pane. */
  href: string
  /**
   * Fills the pane instead of navigating. Only a plain left-click is intercepted —
   * cmd/ctrl/shift/middle-click fall through to the href so "open in new tab" still
   * works, and without JS the link navigates normally.
   */
  onSelect?: () => void
  /** First row of the freelance group — takes the space that separates the two. */
  startsGroup?: boolean
}

export function WorkRow({ item, selected, href, onSelect, startsGroup = false }: WorkRowProps) {
  const compact = item.group === 'freelance'

  return (
    // The group break is space on the row rather than a wrapper element: a <ul> may
    // only contain <li>, and a spacer div here would also orphan a border.
    <li className={startsGroup ? 'mt-6' : undefined}>
      <Link
        href={href}
        aria-current={selected ? 'true' : undefined}
        onClick={
          onSelect &&
          ((event) => {
            // Let the browser handle anything that means "somewhere else": new tab,
            // new window, download. Only the plain click becomes a pane swap.
            if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
            event.preventDefault()
            onSelect()
          })
        }
        className={[
          'group flex min-h-touch items-center gap-3 px-5 no-underline transition-colors duration-row sm:min-h-0',
          compact ? 'py-3.5' : 'py-4',
          // The 2px left edge is always present, transparent at rest, so selecting a
          // row shifts nothing. Written as separate border-l-* utilities because a
          // bare `border-transparent` would also blank the separator below.
          'border-l-current',
          // Hover uses its own fill, one step short of the panel. Selection persists
          // while you browse, so a hovered row and the selected row are on screen
          // together — sharing a fill made two rows look selected at once.
          selected ? 'border-l-accent bg-panel' : 'border-l-transparent hover:bg-hover',
          // A selected row drops its separator, which is what makes it read as
          // attached to the pane beside it.
          selected ? '' : 'border-b border-b-border-soft',
        ].join(' ')}
        // Inside the row, so the ring can't collide with the accent edge or the
        // neighbouring row's separator.
        style={{ outlineOffset: '-2px' }}
      >
        <div className='min-w-0 flex-1'>
          <div className='flex items-baseline gap-2.5'>
            <h3
              className={[
                'truncate text-row-title font-medium transition-colors duration-row',
                selected ? 'text-ink' : 'text-ink-body',
              ].join(' ')}
            >
              {item.title}
            </h3>

            {item.caseStudy && (
              <span className='flex-none bg-accent px-[7px] py-[3px] font-mono text-badge uppercase text-accent-on'>
                case study
              </span>
            )}
          </div>

          {/* Company is deliberately omitted: it's identical on every Talksome row and
              the pane header states it anyway. Dropping it stops the line truncating
              at the 320px rail width. */}
          <p className='mt-1 truncate font-mono text-meta text-ink-muted'>
            {compact
              ? [item.group, item.year, item.stackShort].filter(Boolean).join(' · ')
              : [item.kind, item.period].filter(Boolean).join(' · ')}
          </p>
        </div>

        {/* An honest absence rather than a badge — deliberately quiet. */}
        {item.link === 'internal' && (
          <span className='flex-none font-mono text-label-sm text-ink-muted'>internal</span>
        )}

        {/* No ↗ on external rows any more: the row fills the pane like every other one,
            and the arrow would promise a new tab it no longer opens. The pane's "Visit
            the site" button is where that promise is kept. */}
      </Link>
    </li>
  )
}
