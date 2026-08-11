import type { Config } from 'tailwindcss'

/**
 * Tailwind references the CSS custom properties in src/app/tokens.css rather than
 * duplicating their values. Two consequences worth knowing:
 *
 *  - Retuning the design system means editing one CSS file, not this config.
 *  - Because both themes define the same token names, `bg-panel text-muted` is
 *    correct in light AND dark. There are no `dark:` variants in this codebase.
 *
 * The type scale below is unusual: the design uses half-pixel sizes (16.5, 13.5,
 * 11.5, 10.5) and per-size tracking, because the mono/sans split carries the
 * hierarchy instead of weight. Both facts are deliberate — see the spec.
 */
export default {
  darkMode: 'class', // matches the `.dark` selector the tokens use
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    // Replacing rather than extending: the design has a fixed palette, and leaving
    // Tailwind's defaults in place invites `bg-slate-50` creeping in.
    colors: {
      transparent: 'transparent',
      current: 'currentColor',

      page: 'var(--color-surface-page)',
      panel: 'var(--color-surface-panel)',
      hover: 'var(--color-surface-hover)',
      code: {
        DEFAULT: 'var(--color-surface-code)',
        inline: 'var(--color-surface-code-inline)',
      },

      ink: {
        DEFAULT: 'var(--color-text-primary)',
        heading: 'var(--color-text-heading)',
        body: 'var(--color-text-body)',
        secondary: 'var(--color-text-secondary)',
        muted: 'var(--color-text-muted)',
      },

      accent: {
        DEFAULT: 'var(--color-accent)',
        on: 'var(--color-accent-on)',
        hover: 'var(--color-accent-hover)',
        active: 'var(--color-accent-active)',
        code: 'var(--color-accent-code)',
      },

      border: {
        DEFAULT: 'var(--color-border)',
        soft: 'var(--color-border-soft)',
      },

      screen: {
        matte: 'var(--color-screen-matte)',
        frame: 'var(--color-screen-frame)',
      },

      focus: 'var(--color-focus-ring)',
    },

    fontFamily: {
      sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
    },

    // Every distinct size in the design, named by role rather than by t-shirt size —
    // `text-row-title` says where it belongs; `text-lg` doesn't. Tracking is baked in
    // because it's tied to the size: display sans is negative, mono labels positive.
    fontSize: {
      // Mono — labels and metadata
      'label-sm': ['10px', { lineHeight: '1', letterSpacing: '0.18em' }],
      label: ['11px', { lineHeight: '1', letterSpacing: '0.18em' }],
      meta: ['10.5px', { lineHeight: '1.9', letterSpacing: '0.06em' }],
      chip: ['11px', { lineHeight: '1.9', letterSpacing: '0.06em' }],
      ui: ['11.5px', { lineHeight: '1.95', letterSpacing: '0.07em' }],
      badge: ['9.5px', { lineHeight: '1', letterSpacing: '0.14em' }],
      codeblock: ['13.5px', { lineHeight: '1.8' }],

      // Sans — prose
      'body-sm': ['15.5px', { lineHeight: '1.6' }],
      body: ['16.5px', { lineHeight: '1.65' }],
      prose: ['17px', { lineHeight: '1.65' }],
      'row-title': ['19px', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
      lede: ['21px', { lineHeight: '1.55' }],

      // Sans — display. Tighter as it grows.
      // `title-section` is the case-study h2: it has to outrank `row-title` (the h3)
      // and the body, without competing with the h1 at the top of the page.
      'title-section': ['26px', { lineHeight: '1.25', letterSpacing: '-0.025em' }],
      'title-pane': ['34px', { lineHeight: '1.15', letterSpacing: '-0.03em' }],
      'title-page': ['38px', { lineHeight: '1.1', letterSpacing: '-0.03em' }],
      'title-study': ['46px', { lineHeight: '1.05', letterSpacing: '-0.035em' }],
    },

    // A 2px-grid subset rather than a ratio. Grouped by role: 6-12 inside a
    // component, 14-22 between components, 26-34 section rhythm, 40-64 page.
    spacing: {
      0: '0',
      px: '1px',
      0.5: '2px',
      1: '4px',
      1.5: '6px',
      2: '8px',
      2.5: '10px',
      3: '12px',
      3.5: '14px',
      4: '16px',
      4.5: '18px',
      5: '20px',
      5.5: '22px',
      6: '26px',
      7: '30px',
      8: '34px',
      9: '40px',
      10: '44px',
      11: '46px',
      12: '48px',
      13: '52px',
      14: '56px',
      16: '64px',
      20: '80px',
      touch: '44px', // minimum tap target on mobile
    },

    // Radius 0 everywhere. The status dot is the only exception, and it's `full`.
    borderRadius: {
      none: '0',
      DEFAULT: '0',
      full: '9999px',
    },

    // No shadows in either theme. Depth is the 1px frame plus the surface step.
    // A lifted element later (dropdown, toast) uses panel + border, not a shadow.
    boxShadow: {
      none: 'none',
    },

    extend: {
      borderWidth: {
        // 2px means "this is the current thing" — selected row, code block edge.
        current: '2px',
      },
      maxWidth: {
        window: '1240px',
        about: '820px',
        measure: '66ch', // case-study prose
        lede: '60ch',
        role: '70ch',
      },
      gridTemplateColumns: {
        work: '400px 1fr',
        'work-md': '320px 1fr',
        study: '260px 1fr',
        pane: '1fr 240px',
        history: '120px 1fr',
        skills: '150px 1fr',
      },
      height: {
        bar: '46px',
        window: '840px',
      },
      // `top-bar` positions sticky content directly under the sticky window bar. Same
      // value as `h-bar` by definition — if the bar's height changes, both follow.
      inset: {
        bar: '46px',
      },
      transitionTimingFunction: {
        pane: 'cubic-bezier(0.2, 0, 0, 1)',
      },
      transitionDuration: {
        pane: '120ms',
        row: '90ms',
      },
    },
  },
  plugins: [],
} satisfies Config
