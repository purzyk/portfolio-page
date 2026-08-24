'use client'

import { GoogleAnalytics } from '@next/third-parties/google'
import { useEffect, useState } from 'react'
import { readConsent, writeConsent, type Consent } from '@/lib/consent'

/**
 * RODO/PKE: analytics only loads after an explicit choice, never on a legitimate-
 * interest default. `GoogleAnalytics` — and the network request it makes — only
 * mounts once state says 'granted'; before that this renders nothing but the banner.
 *
 * The same binary accept/denied model as the grid.net.pl banner, since GA is the only
 * non-essential cookie either site sets. Ported as a plain conditional render rather
 * than that banner's vanilla-JS `__gridGa4Boot` bootstrap: that existed to work around
 * WP Super Cache serving one frozen HTML file to every visitor, which doesn't apply
 * here — this is a client component that can just re-render on its own state.
 *
 * `null` consent means "no choice yet" and also doubles as "reopen the banner" — see
 * the `[data-cookie-settings]` handler below, which is how the footer link (RODO
 * requires withdrawing consent to be as easy as giving it) brings the banner back.
 */

export function CookieConsent({ gaId }: { gaId: string }) {
  const [consent, setConsent] = useState<Consent | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setConsent(readConsent())
    setReady(true)

    function onClick(event: MouseEvent) {
      const target = event.target as HTMLElement | null
      if (target?.closest('[data-cookie-settings]')) setConsent(null)
    }

    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  function choose(value: Consent) {
    writeConsent(value)
    setConsent(value)
  }

  return (
    <>
      {consent === 'granted' && <GoogleAnalytics gaId={gaId} />}

      {ready && consent === null && (
        <div className='fixed inset-x-0 bottom-0 z-50 border-t border-border bg-page'>
          <div className='mx-auto flex max-w-window flex-col items-start gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-7'>
            <p className='max-w-measure text-meta text-ink-muted'>
              This site uses Google Analytics to see which pages get read. Accept or decline —
              change your mind any time from the footer.{' '}
              <a
                href='/privacy'
                className='border-b border-border text-ink-body no-underline transition-colors duration-row hover:border-accent hover:text-accent'
              >
                Privacy &amp; cookie policy
              </a>
              .
            </p>

            <div className='flex flex-none gap-4'>
              <button
                type='button'
                onClick={() => choose('denied')}
                className='font-mono text-ui text-ink-muted transition-colors duration-row hover:text-ink'
              >
                Decline
              </button>
              <button
                type='button'
                onClick={() => choose('granted')}
                className='flex-none whitespace-nowrap bg-accent px-3.5 py-2 font-mono text-ui text-accent-on no-underline transition-colors duration-row hover:bg-accent-hover active:bg-accent-active'
              >
                Accept
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
