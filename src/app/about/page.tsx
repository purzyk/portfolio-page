import type { Metadata } from 'next'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'About',
  description:
    'Eleven years building for the web, most of it as the only front-end person in the room.',
}

/**
 * About — same rail width as the work page so the window frame doesn't shift between
 * pages. Availability sits at the top of the rail because it's what a recruiter is
 * actually scanning for.
 *
 * Copy here is from the design and the content pass hasn't reached it yet.
 */

const HISTORY = [
  {
    period: '2022 — 2026',
    role: 'Sole front-end developer',
    org: 'Talksome',
    body: 'Bridge (browser softphone), Studio (call-flow editor) and Janus (centralised sign-in across reseller brands). Top contributor to Studio, and the whole of Janus — which I designed as well as built, taking the screens through review with stakeholders. Owned the front end end to end: design, architecture, build, tests, releases.',
  },
  {
    period: '2015 — 2022',
    role: 'Front-end developer',
    org: 'Freelance',
    body: 'WordPress themes built to the pixel from Photoshop and XD layouts. Explain Everything, the Greyhound Board of Great Britain and Port Praski are all still live.',
  },
] as const

const SKILLS = [
  { label: 'Every day', items: ['TypeScript', 'React 19', 'Next.js', 'Tailwind', 'CSS', 'HTML'] },
  {
    label: 'Shipped with',
    items: [
      'Redux Toolkit Query',
      'RxJS',
      'SCSS',
      'WebRTC',
      'XMPP',
      'OAuth 2.0 · OIDC',
      'Ory Kratos · Hydra',
      'Vite',
      'WordPress · PHP',
    ],
  },
  { label: 'Testing', items: ['Cypress', 'Visual regression', 'Vitest'] },
  {
    label: 'Design',
    items: ['UX / UI design', 'Figma', 'Design systems', 'Design tokens', 'Storybook'],
  },
  { label: 'Optimisation', items: ['SEO', 'SEM', 'WCAG accessibility', 'Performance'] },
  { label: 'Alongside', items: ['Git', 'CI pipelines', 'Docker'] },
] as const

const PRINCIPLES = [
  'Give me a problem and leave me alone — I will flag the decisions worth making, not ask permission on the rest.',
  'If I say it will be done, it is done. No chasing.',
  'New tools get learned on the job, not before it.',
] as const

export default function AboutPage() {
  return (
    <div className='grid lg:grid-cols-work-md xl:grid-cols-work'>
      {/* ---- rail ---- */}
      <div className='border-border px-5.5 py-6 lg:border-r'>
        <div className='relative aspect-square w-full max-w-[200px] border border-border lg:max-w-none'>
          <Image
            src='/work/Piotr-Purzycki.jpg'
            alt='Piotr Purzycki'
            width={960}
            height={960}
            priority
            className='h-full w-full object-cover'
          />
        </div>

        <p className='mt-5 font-mono text-ui text-accent'>Available now</p>
        <dl className='mt-1 space-y-1 font-mono text-ui text-ink-muted'>
          <dd>Wrocław · UTC+2</dd>
          <dd>On site, hybrid or remote</dd>
        </dl>
      </div>

      {/* ---- main ---- */}
      <article className='min-w-0 max-w-about px-4 pb-14 pt-9 sm:px-7 lg:px-13'>
        <h1 className='text-title-page font-medium text-ink'>
          Eleven years building for the web, most of it as the only front-end person in the room.
        </h1>

        <div className='mt-6 max-w-role space-y-4 text-prose text-ink-body'>
          <p>
            The last four at Talksome, as the sole front-end developer on a hosted telephony
            platform: a browser softphone and an admin console, deployed across seven reseller
            brands. Before that, seven years of freelance WordPress work, building themes from
            Photoshop and XD layouts for agencies and direct clients.
          </p>
        </div>

        {/* ---- history ---- */}
        <h2 className='mt-9 font-mono text-label uppercase text-accent'>Where I have worked</h2>

        <div className='mt-5'>
          {HISTORY.map((entry) => (
            <div
              key={entry.period}
              className='grid gap-2 border-t border-border-soft py-5 sm:grid-cols-history sm:gap-5'
            >
              <p className='font-mono text-chip text-ink-muted'>{entry.period}</p>
              <div className='min-w-0'>
                <h3 className='text-row-title font-medium text-ink'>
                  {entry.role}
                  <span className='text-ink-muted'> · {entry.org}</span>
                </h3>
                <p className='mt-1.5 max-w-role text-body-sm text-ink-body'>{entry.body}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ---- skills ---- */}
        <h2 className='mt-9 font-mono text-label uppercase text-accent'>What I work with</h2>

        <div className='mt-5 space-y-4.5'>
          {SKILLS.map((row) => (
            <div key={row.label} className='grid gap-2 sm:grid-cols-skills sm:gap-4.5'>
              <p className='font-mono text-chip text-ink-muted'>{row.label}</p>
              <ul className='flex flex-wrap gap-1.5'>
                {row.items.map((item) => (
                  <li
                    key={item}
                    className='border border-border px-2 py-1 font-mono text-chip text-ink-body'
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ---- principles ---- */}
        <h2 className='mt-9 font-mono text-label uppercase text-accent'>How I work</h2>

        <div className='mt-5 max-w-role space-y-4 text-prose text-ink-body'>
          {PRINCIPLES.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      </article>
    </div>
  )
}
