import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy & cookies',
  description: 'What this site collects, what it stores in your browser, and why.',
}

/**
 * Structured the way the grid.net.pl policy is — definitions, personal data, cookies,
 * other technologies, server logs — but the substance is this site's own: no forms, no
 * ad pixels, one analytics cookie that only gets set after the banner is accepted.
 */

const SECTIONS = [
  {
    heading: 'Personal data',
    body: [
      'This site has no forms and collects nothing through them — there is nowhere on it that submits a name, email address or message to a server. The one contact point, the email link in the footer, opens your own email client; the address never passes through this site.',
      'The only personal data this site can end up processing is whatever your browser sends automatically (see “Server logs” below) and, if you accept analytics, the aggregate, non-identifying statistics Google Analytics produces from your visit. GoatCounter (see below) counts page views without storing your IP address.',
    ],
  },
  {
    heading: 'Cookies and local storage',
    body: [
      'One cookie is strictly necessary: pp_consent, which remembers your accept/decline choice for 180 days so the banner doesn’t reappear on every visit. It is set regardless of what you choose, because the choice itself has to be remembered.',
      'One value is kept in local storage, not a cookie: theme, which remembers whether you’d switched to dark or light mode. It never leaves your browser and isn’t read by this site’s server — there isn’t one; this is a static site.',
      'If you accept analytics, Google sets its own cookies (typically _ga and _ga_*) to distinguish sessions and visitors. These are not set, and Analytics does not load at all, until you accept — declining or closing the banner without choosing means they never load for that visit.',
    ],
  },
  {
    heading: 'Google Analytics',
    body: [
      'When accepted, this site uses Google Analytics (GA4) to see which pages get read and roughly how — nothing more granular than that. No advertising, remarketing or cross-site tracking product is enabled alongside it, and no other tracker (Facebook Pixel, Google Ads, Tag Manager) is present on this site besides the cookieless counter below.',
      'You can withdraw acceptance at any time from “Cookie settings” in the footer, which reopens this choice. Withdrawing doesn’t retroactively delete data Google has already recorded — see Google’s own privacy policy for that.',
    ],
  },
  {
    heading: 'GoatCounter',
    body: [
      'Separately from Google Analytics, this site counts page views with GoatCounter, a privacy-friendly analytics service. It sets no cookies, stores nothing in your browser and does not store your IP address — only the page visited, the referring site and coarse browser, screen-size and country information, aggregated into totals.',
      'Because it neither stores nor reads anything on your device and identifies no one, it runs without asking for consent. See GoatCounter’s own privacy policy at goatcounter.com for details.',
    ],
  },
  {
    heading: 'Server logs',
    body: [
      'Loading any page on this site sends a request to whichever server is hosting it, which — like essentially every web server — keeps a standard access log of that request: IP address, timestamp, user agent, and the path requested.',
      'These logs exist for operating and securing the hosting, are not cross-referenced against visitor identities, and are not shared with anyone beyond whoever administers that hosting.',
    ],
  },
  {
    heading: 'Your rights',
    list: [
      'Access, correction, deletion or restriction of any personal data held about you.',
      'Objection to processing.',
      'Data portability, where technically applicable.',
      'Withdrawal of consent at any time, without affecting processing that already happened under it.',
      'Lodging a complaint with a supervisory authority — in Poland, the Prezes Urzędu Ochrony Danych Osobowych (UODO).',
    ],
  },
  {
    heading: 'Contact',
    body: [
      'The data controller for this site is Piotr Purzycki. Reach out at piotr@purzycki.pl with any question about this policy or a request under the rights above.',
    ],
  },
] as const

export default function PrivacyPage() {
  return (
    <article className='mx-auto max-w-about px-4 pb-16 pt-9 sm:px-7 lg:px-13 lg:pt-10'>
      <h1 className='text-title-page font-medium text-ink'>Privacy &amp; cookies</h1>

      <p className='mt-5 max-w-role text-prose text-ink-body'>
        This policy covers purzycki.pl in full — a portfolio site with no accounts, no
        checkout and no forms. There isn’t much to disclose, but what there is sits below.
      </p>

      {SECTIONS.map((section) => (
        <section key={section.heading} className='mt-9'>
          <h2 className='font-mono text-label uppercase text-accent'>{section.heading}</h2>

          {'body' in section && (
            <div className='mt-3.5 max-w-role space-y-3.5 text-body-sm text-ink-body'>
              {section.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          )}

          {'list' in section && (
            <ul className='mt-3.5 max-w-role list-disc space-y-1.5 pl-5 text-body-sm text-ink-body'>
              {section.list.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </article>
  )
}
