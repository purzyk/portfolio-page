'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

/**
 * The window's title bar: wordmark on the left, nav on the right.
 *
 * Client component because the current nav item is derived from the pathname, and
 * "current" is a border-and-text colour change rather than a fill — the fill is
 * reserved for the single primary button on each page.
 *
 * Sticky, because a case study runs to several thousand words and the way back to the
 * work list should never require scrolling to the top to find it. It's 46px and opaque,
 * so the cost is small and nothing shows through behind it.
 */

const NAV = [
  { href: '/', label: 'work' },
  { href: '/about', label: 'about' },
] as const

function isCurrent(pathname: string, href: string) {
  // `/` owns the work list and every /work/[slug] detail page beneath it.
  if (href === '/') return pathname === '/' || pathname.startsWith('/work')
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function WindowBar() {
  const pathname = usePathname()

  return (
    <div className='sticky top-0 z-30 flex h-bar flex-none items-center justify-between border-b border-border bg-page px-4.5 sm:px-4.5'>
      <Link
        href='/'
        className='flex items-center gap-2 font-mono text-ui no-underline'
        aria-label='Piotr Purzycki — home'
      >
        <span className='h-[9px] w-[9px] flex-none rounded-full bg-accent' aria-hidden />
        {/* nowrap: the bar is a fixed 46px and two lines would burst it. */}
        <span className='whitespace-nowrap text-ink-heading'>piotr purzycki</span>
        {/* Dropped below 720px — the bar has room for the wordmark and nav only. */}
        <span className='hidden text-ink-muted sm:inline'>front-end developer · wrocław</span>
      </Link>

      <nav className='flex items-center gap-2'>
        {NAV.map((item) => {
          const current = isCurrent(pathname, item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={current ? 'page' : undefined}
              className={[
                'border px-2.5 py-1 font-mono text-label-sm no-underline transition-colors duration-row',
                'flex min-h-touch items-center sm:min-h-0',
                current
                  ? 'border-accent text-accent'
                  : 'border-border text-ink-muted hover:border-ink hover:text-ink',
              ].join(' ')}
            >
              {item.label}
            </Link>
          )
        })}

        {/* Never "current" — it leaves the site. */}
        <a
          href='/work/Piotr-Purzycki-CV-Frontend-Engineer.pdf'
          download
          className='flex min-h-touch items-center border border-border px-2.5 py-1 font-mono text-label-sm text-ink-muted no-underline transition-colors duration-row hover:border-ink hover:text-ink sm:min-h-0'
        >
          cv.pdf
        </a>
      </nav>
    </div>
  )
}
