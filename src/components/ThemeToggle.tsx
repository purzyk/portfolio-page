'use client'

import { useEffect, useState } from 'react'

const KEY = 'theme'

/**
 * The layout's inline `themeScript` sets `.dark` on `<html>` before first paint, from
 * localStorage or `prefers-color-scheme`. This button just flips that class and
 * persists the explicit choice, so it overrides the system preference from here on.
 *
 * Renders nothing on the server: the correct icon depends on the class the inline
 * script set, which doesn't exist yet during SSR. Guessing light and letting a
 * `useEffect` correct it after mount would work too, but would mean shipping a
 * `dark:` variant to cover the pre-correction frame — the one thing tailwind.config.ts
 * says this codebase deliberately has none of, tokens carrying theme instead. Mounting
 * empty for a frame keeps that true.
 */
export function ThemeToggle() {
  const [dark, setDark] = useState<boolean | null>(null)

  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'))
  }, [])

  if (dark === null) {
    return <span aria-hidden className='inline-block h-touch w-5 flex-none sm:h-[27px]' />
  }

  function toggle() {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
    try {
      localStorage.setItem(KEY, next ? 'dark' : 'light')
    } catch {
      // Private browsing can throw on write — the toggle still works for the tab.
    }
  }

  return (
    <button
      type='button'
      onClick={toggle}
      aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
      className='flex min-h-touch flex-none items-center justify-center p-1 text-ink-muted transition-colors duration-row hover:text-ink sm:min-h-0'
    >
      {dark ? (
        <svg width='12' height='12' viewBox='0 0 12 12' fill='none' aria-hidden>
          <circle cx='6' cy='6' r='2.5' stroke='currentColor' strokeWidth='1.3' />
          <path
            stroke='currentColor'
            strokeWidth='1.3'
            strokeLinecap='round'
            d='M6 0.5v1.4M6 10.1v1.4M11.5 6h-1.4M1.9 6H0.5M9.9 2.1l-1 1M3.1 8.9l-1 1M9.9 9.9l-1-1M3.1 3.1l-1-1'
          />
        </svg>
      ) : (
        <svg width='12' height='12' viewBox='0 0 12 12' fill='none' aria-hidden>
          <path
            stroke='currentColor'
            strokeWidth='1.3'
            strokeLinejoin='round'
            d='M10.5 7.4A4.6 4.6 0 0 1 4.6 1.5 4.6 4.6 0 1 0 10.5 7.4Z'
          />
        </svg>
      )}
    </button>
  )
}
