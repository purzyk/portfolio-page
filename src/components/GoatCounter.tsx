'use client'

import { usePathname } from 'next/navigation'
import Script from 'next/script'
import { useEffect } from 'react'

declare global {
  interface Window {
    goatcounter?: { count: (vars?: { path?: string }) => void }
  }
}

/**
 * Cookieless, so it runs regardless of the consent banner — no cookies, no stored IP.
 * `no_onload` turns off count.js's own load-time pageview: client-side navigation
 * never reloads the page, so every view (the first included) is counted from here.
 * count.js reads `?ref=` from the URL itself, which is how CV links show up as a source.
 */
export function GoatCounter({ endpoint }: { endpoint: string }) {
  const pathname = usePathname()

  useEffect(() => {
    window.goatcounter?.count({ path: window.location.pathname })
  }, [pathname])

  return (
    <Script
      src='https://gc.zgo.at/count.js'
      data-goatcounter={endpoint}
      data-goatcounter-settings='{"no_onload": true}'
      strategy='afterInteractive'
      onLoad={() => window.goatcounter?.count({ path: window.location.pathname })}
    />
  )
}
