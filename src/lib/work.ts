/**
 * The six work items.
 *
 * Structured data rather than Markdown: this is a fixed list rendered as UI, and the
 * pane needs typed fields (stack list, link kind, image dimensions) rather than a body
 * of prose. The one long-form piece — the Bridge case study — stays in Markdown, under
 * content/case-studies/, and is reached from here by slug.
 *
 * Copy and images are placeholders in the sense that they'll be revised section by
 * section; the shape is what matters for now.
 */

export interface WorkImage {
  src: string
  alt: string
  width: number
  height: number
}

export interface WorkClip {
  src: string
  poster: string
  /** Read by screen readers and shown if the file fails to load. */
  caption: string
}

export interface WorkItem {
  slug: string
  title: string
  /** The one-line descriptor under the title in the rail: "browser softphone". */
  kind: string
  company?: string
  period?: string
  /** Freelance rows are compact and show these instead. */
  group: 'talksome' | 'freelance'
  year?: string
  stackShort?: string
  /** 25-58 words. A hook, not a description — the screenshot explains. */
  blurb: string
  stack: string[]
  /** Drives the row marker and the pane's primary call to action. */
  link: 'internal' | 'external' | 'case-study'
  href?: string
  /** Slug of the Markdown case study, when link is 'case-study'. */
  caseStudy?: string
  /**
   * A publicly reachable demo, where one exists. Separate from `href` because an item
   * can have both a case study and a demo — Bridge does — and because a demo needs
   * explaining ("no login") in a way an ordinary external link doesn't.
   */
  demo?: {
    href: string
    /** Shown after the URL, e.g. 'Show me around — no login'. */
    note: string
  }
  image: WorkImage
  /**
   * A short looping recording, used in place of `image` where one exists — the pane
   * should show the product moving rather than a single frame of it. Falls back to
   * `image` when absent, which is every item without a recording yet.
   */
  clip?: WorkClip
}

export const WORK: WorkItem[] = [
  {
    slug: 'bridge',
    title: 'Bridge',
    kind: 'agent console · softphone',
    company: 'talksome',
    period: '2022–2026',
    group: 'talksome',
    blurb:
      'Where agents work: live queues, live calls across the organisation, and a softphone that runs in a browser tab. Place and receive calls over WebRTC, see who’s free before you transfer, join and leave queues.',
    stack: ['React 19', 'TypeScript', 'Vite', 'WebRTC · XMPP', 'RxJS'],
    link: 'case-study',
    // Not 'bridge': a case-study slug equal to a work slug collides in /work/[slug],
    // where the work item wins and the study becomes unreachable.
    caseStudy: 'bridge-case-study',
    demo: {
      href: 'https://bridge.hostedcompass.com/',
      note: '“Show me around” — no login',
    },
    image: {
      src: '/work/bridge-call-history-details.png',
      alt: 'Bridge call history with a call expanded, showing the queue it arrived through and notes taken during it',
      width: 1400,
      height: 900,
    },
    clip: {
      src: '/work/bridge-webrtc-call.mp4',
      poster: '/work/bridge-webrtc-call-poster.jpg',
      caption:
        'Placing a call from a browser tab — dialling, ringing, answered, hung up. No plugin, no desktop app.',
    },
  },
  {
    slug: 'studio',
    title: 'Studio',
    kind: 'call-flow editor',
    company: 'talksome',
    period: '2022–2026',
    group: 'talksome',
    blurb:
      'Drag-and-drop editor for the logic behind a phone number. Menus, schedules, queues, caller-ID matching — nested arbitrarily deep, saved as one tree. Admins who had been filing tickets to change an opening hour started doing it themselves.',
    stack: ['Next.js 16', 'React 19', 'Redux Toolkit Query', 'Tailwind'],
    link: 'case-study',
    caseStudy: 'studio-dialplan-editor',
    image: {
      src: '/work/studio-dialplan-editor.jpg',
      alt: 'Studio dial-plan editor showing four levels of nested call routing on a dark canvas',
      width: 1440,
      height: 900,
    },
    clip: {
      src: '/work/studio-dialplan-editor.mp4',
      poster: '/work/studio-dialplan-editor.jpg',
      caption:
        'Building a call flow: dropping in an IVR menu, configuring it through a wizard, and dragging nodes into the tree.',
    },
  },
  {
    slug: 'janus',
    title: 'Janus',
    kind: 'sign-in for seven brands',
    company: 'talksome',
    period: '2025–2026',
    group: 'talksome',
    blurb:
      'One sign-in service, seven reseller brands. Each gets its own domain, logo and palette from the same deployment. Underneath: an OAuth 2.0 flow where the access token stays server-side and never reaches the browser.',
    stack: ['Next.js', 'Ory Kratos · Hydra', 'OAuth 2.0 · OIDC'],
    link: 'case-study',
    caseStudy: 'janus-multi-brand-auth',
    image: {
      src: '/work/janus-login-studio.png',
      alt: 'Janus sign-in screen in the Studio brand — blue accent on a navy ground',
      width: 1440,
      height: 900,
    },
    clip: {
      src: '/work/janus-totp-setup.mp4',
      poster: '/work/janus-totp-setup-poster.jpg',
      caption:
        'Signing in, correcting a wrong password, and setting up two-step verification — including a rejected code before the right one lands.',
    },
  },
  {
    slug: 'grid',
    title: 'Grid Architekci',
    kind: 'architecture studio site',
    group: 'freelance',
    year: '2026',
    stackShort: 'wordpress',
    blurb:
      'A twenty-year-old architecture studio, an eight-year-old site with no written project descriptions and a Google score to match. Redesigned in Claude, rebuilt as WordPress blocks, migrated automatically from the old database, and translated into English — without losing a URL Google already knew.',
    stack: ['WordPress', 'Gutenberg blocks', 'Tailwind CSS', 'WPML', 'PHP'],
    link: 'case-study',
    caseStudy: 'grid-architekci-rebuild',
    demo: {
      href: 'https://grid.net.pl/en/',
      note: 'Live site',
    },
    image: {
      src: '/work/grid.jpg',
      alt: 'The Grid Architekci homepage, showing the project grid with category filters',
      width: 1440,
      height: 811,
    },
    clip: {
      src: '/work/grid-walkthrough.mp4',
      poster: '/work/grid-walkthrough-poster.jpg',
      caption: 'From the project grid into a house in Krzyki, Wrocław.',
    },
  },
  {
    slug: 'explain-everything',
    title: 'Explain Everything',
    kind: 'marketing site',
    group: 'freelance',
    year: '2018',
    stackShort: 'wordpress',
    blurb:
      'Marketing site for a whiteboard app used in classrooms worldwide. Built the theme from Photoshop layouts to the pixel. Still live, still recognisably the same site eight years on.',
    stack: ['WordPress', 'Custom theme', 'SCSS', 'JavaScript'],
    link: 'external',
    href: 'https://explaineverything.com/',
    image: {
      src: '/work/explain-everything.jpg',
      alt: 'The Explain Everything homepage',
      width: 1440,
      height: 900,
    },
    clip: {
      src: '/work/explain-everything-walkthrough.mp4',
      poster: '/work/explain-everything-walkthrough-poster.jpg',
      caption:
        'Scrolling the homepage, then following the "For school" link into its own page and down to the footer.',
    },
  },
  {
    slug: 'gbgb',
    title: 'Greyhound Board of Great Britain',
    kind: 'governing body site',
    group: 'freelance',
    year: '2017',
    stackShort: 'wordpress',
    blurb:
      'The governing body for British greyhound racing — race results, track directories, welfare records. A lot of tabular data to make readable on a phone.',
    stack: ['WordPress', 'Custom theme', 'SCSS', 'jQuery', 'Vue.js'],
    link: 'external',
    href: 'https://www.gbgb.org.uk/',
    image: {
      src: '/work/gbgb.jpg',
      alt: 'The Greyhound Board of Great Britain homepage',
      width: 1440,
      height: 900,
    },
    clip: {
      src: '/work/gbgb-walkthrough.mp4',
      poster: '/work/gbgb-walkthrough-poster.jpg',
      caption:
        'From the results table into a greyhound’s race history, then through Welfare & Care into the Greyhound Retirement page.',
    },
  },
]

export function getWorkItem(slug: string): WorkItem | undefined {
  return WORK.find((item) => item.slug === slug)
}
