'use client'

import { useEffect, useState } from 'react'

const USER = 'piotr'
const DOMAIN = 'purzycki.pl'

/**
 * Keeps the address out of the static HTML entirely, rather than relying on an
 * "[at]" substitution — harvesting bots specifically unwind that pattern, and most
 * just regex raw markup for mailto:/email-shaped text, which this never contains.
 * Assembled and revealed only after mount, when something is actually running JS.
 */
export function EmailLink({ className }: { className?: string }) {
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    setRevealed(true)
  }, [])

  if (!revealed) {
    return <span className={className}>email</span>
  }

  const address = `${USER}@${DOMAIN}`
  return (
    <a href={`mailto:${address}`} className={className}>
      {address}
    </a>
  )
}
