/**
 * RODO/PKE analytics consent, stored in a cookie rather than localStorage so it reads
 * the same way the grid.net.pl banner does — see CookieConsent for why the check has
 * to run in the browser rather than at request time.
 */

const COOKIE = 'pp_consent'
const DAYS = 180

export type Consent = 'granted' | 'denied'

export function readConsent(): Consent | null {
  const match = document.cookie.match(/(?:^|; )pp_consent=(granted|denied)(?:;|$)/)
  return (match?.[1] as Consent) ?? null
}

export function writeConsent(value: Consent) {
  const maxAge = DAYS * 24 * 60 * 60
  const secure = window.location.protocol === 'https:' ? '; Secure' : ''
  document.cookie = `${COOKIE}=${value}; path=/; max-age=${maxAge}; SameSite=Lax${secure}`
}
