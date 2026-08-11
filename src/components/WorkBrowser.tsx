'use client'

import { useEffect, useState } from 'react'
import { WorkPane } from '@/components/WorkPane'
import { WorkRow } from '@/components/WorkRow'
import { WORK } from '@/lib/work'

/**
 * The two-pane browser: a persistent list beside one project's detail.
 *
 * Selecting a row swaps the pane and rewrites the URL to that item's own address, so
 * the link you copy is the page a stranger gets on a cold load. What it deliberately
 * does NOT do is route: React state drives the pane, and the URL is updated alongside
 * it with the History API. Routing would remount the tree and make the shared chrome
 * flash on every click, which is the continuity this layout exists to provide.
 *
 * The rows are still real links to /work/[slug]. Client-side selection is layered on
 * top of working hrefs rather than replacing them, so deep links, middle-click,
 * cmd-click and no-JS all keep working — see WorkRow's onSelect.
 *
 * Below the collapse point this component isn't what renders: the pane is hidden and
 * rows navigate to their own page, because two columns don't fit on a phone.
 */

export function WorkBrowser({ initialSlug }: { initialSlug?: string }) {
  // Bridge leads unless the URL named someone else — the strongest piece, and the one
  // whose case study is written. Reordering WORK is what changes the landing pane.
  const [selectedSlug, setSelectedSlug] = useState(initialSlug ?? WORK[0]!.slug)

  // Falls back rather than throwing: a slug that no longer exists should degrade to
  // the first item, not blank the page.
  const selected = WORK.find((item) => item.slug === selectedSlug) ?? WORK[0]!

  /**
   * Back and forward move between selections, because each one put an entry in the
   * history stack. Without this the URL would change but the pane wouldn't follow it.
   *
   * The home route has no slug, so an empty path means "whatever leads the list" —
   * that's what restores Bridge when you press back to `/`.
   */
  useEffect(() => {
    function syncFromUrl() {
      const slug = window.location.pathname.match(/^\/work\/([^/]+)$/)?.[1]
      setSelectedSlug(slug && WORK.some((i) => i.slug === slug) ? slug : WORK[0]!.slug)
    }

    window.addEventListener('popstate', syncFromUrl)
    return () => window.removeEventListener('popstate', syncFromUrl)
  }, [])

  function select(slug: string) {
    setSelectedSlug(slug)

    // The lead item is what `/` already shows, so it addresses as `/` rather than
    // minting a second URL for a view the home page owns. /work/bridge still resolves
    // for anyone holding that link — it just isn't what this produces, and it declares
    // `/` as its canonical.
    const path = slug === WORK[0]!.slug ? '/' : `/work/${slug}`

    // pushState, not replaceState: the URL changed, so back should undo it. Swallowing
    // these would strand anyone who clicked three projects and expected back to work.
    // Guarded because re-clicking the selected row shouldn't stack duplicate entries.
    if (window.location.pathname !== path) {
      window.history.pushState(null, '', path)
    }
  }

  return (
    <div className='grid min-h-0 lg:h-window lg:grid-cols-work-md xl:grid-cols-work'>
      {/* ---- rail ---- */}
      <div className='flex min-w-0 flex-col border-border lg:border-r'>
        <div className='border-b border-border px-5.5 py-6'>
          <p className='max-w-[42ch] text-body text-ink-body'>
            Eleven years building for the web. The last four as the sole front-end developer on a
            hosted telephony platform: a browser softphone and an admin console, deployed across
            seven reseller brands.
          </p>

          <p className='mt-4 font-mono text-ui text-accent'>Currently looking for my next role.</p>
          <p className='mt-1 font-mono text-ui text-ink-muted'>React · TypeScript · Next.js</p>
        </div>

        <h2 className='px-5.5 py-4 font-mono text-label-sm uppercase text-ink-muted'>
          Selected work · {WORK.length}
        </h2>

        {/* The list scrolls independently of the pane once the window is height-pinned,
            so a long list can't push the footer down or make the pane scroll with it. */}
        <ul className='min-w-0 lg:min-h-0 lg:flex-1 lg:overflow-y-auto'>
          {WORK.map((item, index) => (
            <WorkRow
              key={item.slug}
              item={item}
              selected={item.slug === selected.slug}
              href={`/work/${item.slug}`}
              onSelect={() => select(item.slug)}
              // A blank row's worth of space separates Talksome from freelance, so the
              // split is legible without a heading.
              startsGroup={item.group === 'freelance' && WORK[index - 1]?.group === 'talksome'}
            />
          ))}
        </ul>
      </div>

      {/* ---- pane ---- */}
      {/* Hidden below the collapse point: down there the list IS the page, and a row
          tap navigates rather than swapping this pane's contents. */}
      <div className='hidden min-w-0 lg:flex lg:flex-col lg:overflow-y-auto'>
        <WorkPane item={selected} />
      </div>
    </div>
  )
}
