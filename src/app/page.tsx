import type { Metadata } from 'next'
import { WorkBrowser } from '@/components/WorkBrowser'

/**
 * The work page — the two-pane window, and the page that matters.
 *
 * Desktop: a 400px rail holding the bio and all six items, beside a pane showing one.
 * The list stays visible while you read about a project, so promotion is a state
 * (pinned, filled, already open) rather than a bigger card.
 *
 * Below 1024px the list stops being persistent: rows navigate to /work/[slug] instead
 * of filling a pane. Two cramped columns on a phone would leave the screenshots
 * unreadable, which is the whole point of them.
 *
 * The interaction lives in WorkBrowser because selecting a row is client state. This
 * stays a server component so the page shell, metadata and fonts are still static.
 */

// This view is also reachable at /work/[lead-slug], which points its canonical here.
export const metadata: Metadata = {
  alternates: { canonical: '/' },
}

export default function WorkPage() {
  return <WorkBrowser />
}
