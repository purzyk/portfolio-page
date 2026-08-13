import { GoogleAnalytics } from '@next/third-parties/google'
import type { Metadata } from 'next'
import { DM_Mono, DM_Sans } from 'next/font/google'
import type { ReactNode } from 'react'
import { EmailLink } from '@/components/EmailLink'
import { WindowBar } from '@/components/WindowBar'
import { SITE_URL } from '@/lib/site'
import './globals.css'

// Unset in local dev on purpose, so browsing localhost doesn't pollute production analytics.
const GA_ID = process.env.NEXT_PUBLIC_GA_ID

// Self-hosted at build time by next/font — no third-party request, no layout shift.
// Two weights of the sans and one of the mono is the whole set: the mono/sans split
// carries the hierarchy, so no bold is needed anywhere.
const sans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-sans',
  display: 'swap',
})

const mono = DM_Mono({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  // Canonical URLs and OG tags need an absolute base.
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Piotr Purzycki — front-end developer',
    template: '%s — Piotr Purzycki',
  },
  description:
    'Front-end developer in Wrocław. Eleven years building for the web, the last four on browser-based telephony.',
}

// Email lives in EmailLink, not here — kept out of the static HTML entirely
// rather than just out of this list. See that component for why.
const SOCIAL = [
  { href: 'https://www.linkedin.com/in/piotr-purzycki/', label: 'linkedin.com/in/piotr-purzycki' },
  { href: 'https://github.com/purzyk', label: 'github.com/purzyk' },
] as const

/**
 * Person schema — lets a crawler (or a recruiter's tooling) read name, role and
 * location as data rather than having to parse it out of the rendered page.
 */
const personJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Piotr Purzycki',
  jobTitle: 'Front-end developer',
  url: SITE_URL,
  image: `${SITE_URL}/work/Piotr-Purzycki.jpg`,
  address: { '@type': 'PostalAddress', addressLocality: 'Wrocław', addressCountry: 'PL' },
  sameAs: SOCIAL.map((link) => link.href),
}

/**
 * Applied before first paint so the correct theme is present in the initial HTML.
 * Doing this in an effect would render light, then flip — visible as a flash.
 */
const themeScript = `
(function () {
  try {
    var stored = localStorage.getItem('theme');
    var dark = stored === 'dark' ||
      (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (dark) document.documentElement.classList.add('dark');
  } catch (e) {}
})();
`

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang='en' className={`${sans.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
      </head>
      <body className='bg-page font-sans text-ink-body antialiased'>
        {/* Visually hidden until focused — the sticky WindowBar nav means keyboard and
            screen-reader users otherwise have to tab through it on every page. */}
        <a
          href='#main-content'
          className='sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-50 focus:border focus:border-border focus:bg-page focus:px-2.5 focus:py-1 focus:font-mono focus:text-label-sm focus:text-ink'
        >
          Skip to content
        </a>

        {/*
          The window is the layout. Its 1px frame is the page margin on desktop, which
          is why there's no outer padding until it collapses. Below 720px the side
          borders come off and the window becomes the page.
        */}
        <div className='mx-auto flex max-w-window flex-col border-border max-sm:border-x-0 sm:border-x'>
          <WindowBar />
          <main id='main-content'>{children}</main>
        </div>

        {/* Outside the window, deliberately — it's chrome, not content. */}
        <footer className='mx-auto max-w-window px-4 pb-16 pt-5.5 font-mono text-ui text-ink-muted sm:px-0'>
          <div className='flex flex-col items-start gap-3.5 sm:flex-row sm:items-center sm:justify-between'>
            <span>Piotr Purzycki · front-end developer · Wrocław</span>
            <div className='flex flex-wrap gap-4'>
              <EmailLink className='border-b border-border pb-0.5 no-underline transition-colors duration-row hover:border-ink hover:text-ink' />
              {SOCIAL.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  // An underline that clears the descenders, rather than text-decoration.
                  className='border-b border-border pb-0.5 no-underline transition-colors duration-row hover:border-ink hover:text-ink'
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </footer>

        {GA_ID && <GoogleAnalytics gaId={GA_ID} />}
      </body>
    </html>
  )
}
