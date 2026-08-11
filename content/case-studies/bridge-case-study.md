---
title: Four years on a browser softphone
subtitle: 'Sole front-end developer on a phone that runs in a browser tab. Calls, call history, a modernisation carried out without downtime, and the tests I introduced.'
company: Compass Bridge
role: Sole front-end developer
period: 2022–2026
date: 2026-04-10
featured: true
draft: false
tags:
  - TypeScript
  - React
  - Redux
  - RxJS
  - WebRTC
  - XMPP
  - Cypress
---

## What it is

Compass Bridge is a softphone that runs in a browser tab. Real phone calls from a web
page — place them, receive them, transfer them, join and leave queues, see who's free
before you transfer. It sits on a cloud PBX and consumes a live stream of call events
over XMPP. Deployed across seven reseller brands.

I was the sole front-end developer on it for four years — around 520 commits, second only
to the engineer who started it, out of twelve-plus contributors. Four parts of that are
worth writing down.

## 1. Calls

Before 2022, Bridge showed you your calls but couldn't make them — you needed a desk
phone next to it. The work was to turn the browser tab itself into a phone, so a Bridge
user needed nothing but a computer.

The backend was built by the platform team. Mine was the client: SIP registration over
WebRTC, audio device enumeration and selection, the microphone permission flow, and
multi-call state — because a phone that can only hold one call isn't a phone. Hold,
consult, transfer, and a second incoming call while you're already talking all have to
be representable at once.

That state machine ended up as the single densest thing I owned in the app, and the
reason is unglamorous: **a phone has more states than it looks like it has, and users
notice all of them.** A button that says "transfer" has to know whether the other side
has answered yet, because attended and unattended transfer are different operations
with different failure modes.

Some of the hardest bugs were not in the call logic at all. Notifications and ringtones
failed to fire if the user had the Settings page open when a call arrived — reported from
production, medium impact, and exactly the kind of defect that only shows up in a real
workday. Others were platform-specific: notifications behaving differently on Windows 11,
a `console.log` that broke under Electron, code-signing on macOS.

![Placing a call from a browser tab — dialling, ringing, answered, hung up. No plugin, no desktop app.](/work/bridge-webrtc-call.mp4)

Worth noting where that ended: the desktop builds were eventually retired, because
around 99% of users chose the browser version. Some of the fiddliest work in this
project was maintenance on something the product later dropped.

## 2. Call history

Bridge showed your _current_ calls. It had no history — step away from your desk, come
back, and you had no idea who had tried to reach you.

Add call history to a softphone. Sounds like a list view. It took two architectural
rewrites and about twenty-five distinct call scenarios, because **"did I miss this call?"
turns out not to be a question the telephony platform answers directly.**

![What shipped. Missed, incoming and outgoing, grouped by day — the part that looked like the whole job.](/work/bridge-call-history-list-view.png)

### "Missed call" is not a boolean

The requirement was two sentences: _"a missed call is a call that you missed. Cancelling
an incoming call is not a missed call."_ Then QA and one of the maintainers started
asking questions, and a decision tree appeared underneath it.

A queue re-offers a waiting call to its agents every 15–25 seconds, so one caller waiting
two minutes naively produces five missed calls per agent — they have to collapse into one.
Except with the "call available phones alternatively" strategy, each round genuinely _is_
a separate miss. If four agents' phones ring and one answers, the other three missed it —
but that needs its own end reason, not the same one as a caller who hung up. An agent in
wrap-up is never offered the call, so no miss; an agent with call waiting who is already
talking gets a genuine second call, so yes.

We settled the forwarding question empirically rather than by opinion: I tested what
physical desk phones do. On busy, no-answer and unavailable, both Snom and Yealink
register a missed call — so Bridge does. On _always_, neither handset registers anything,
so Bridge doesn't either. That principle — **match the physical phone, because users have
one on their desk** — resolved several later arguments.

One case we couldn't fix. Snom and Yealink handle semi-attended transfer differently at
the PBX level, so the events Bridge receives genuinely differ by vendor. After several
attempts we documented it as a known issue rather than shipping a fragile guess.

### Listening instead of inferring

The design settled on listening for the platform's own end reason rather than
reconstructing it after the fact. The PBX emits an end reason with every call-end event,
and the middleware surfaces it as it arrives:

```ts
// compassDataMiddleware.ts — surface the end reason as it arrives.
callEndEvents$: Subject<CallEndEvent> = new Subject()
```

That keeps correctness tied to the platform's own signal rather than to inference, and
it's simpler: no bookkeeping to reconstruct which queue re-offer cycles belong to the same
logical call, because the platform already says so.

![A call arriving and ending while the history view is open — the entry is written from the platform's own end-of-call event, with no refresh.](/work/bridge-call-history-live.mp4)

The remaining piece is `CallMetadata`: per-call state accumulated _while_ the call is
live, because a history entry depends on things only observable during it — was it ever
offered to me, which queue did it arrive through, is this the consultation leg of a
transfer, how long did it ring. Ring time isn't in any event — it's the interval between
"presented" and "answered or ended", so tracking starts when the call appears and stops
the moment it's answered.

![The detail panel for one call. Ring time, call state and end reason are all assembled from events observed while the call was still live.](/work/bridge-call-history-details-queue-customer.png)

History is stored per user in `localStorage`, following the app's existing convention.
The product decision was to accept the consequences and be honest in the UI rather than
build a backend — only the logged-in user sees their own history, and a tooltip says
plainly where the data lives. It doesn't follow you between devices. The entry cap moved
from 100 to 2000, which raised the question of how the browser renders that many rows —
it doesn't, not naively, so I added virtualisation, reusing the implementation already
proven on the contacts list.

![Rather than hide the limitation, the UI states it: calls are collected and stored in your local browser storage.](/work/bridge-call-history-storage-tooltip.png)

## 3. Refactoring

The codebase predated most of what it now uses: class components with Redux `connect`,
SASS, TSLint, Webpack, Node 12 in CI. The modernisation plan arrived as a nine-item list
from one of the platform's architects in December 2022 — upgrade dependencies, convert to
functional components, Redux Toolkit and RTK Query, Tailwind, fix the Mac CI build, drop
the dead API v2 path. **My job was to execute it.**

There was never a version where the app stopped. Bridge isn't a dashboard — it's what's on
someone's screen while a customer is on the line, so a regression means a missed call.
Everything had to land incrementally, in an app still shipping features, in diffs a
reviewer could actually read.

Where it ended up: **React 19, Vite, ESLint 9, typed Redux, Prettier enforced in CI.**

A few decisions carried through the whole migration rather than being one-off fixes.
Converting `connect` class components to hooks meant moving selectors to `useSelector`
throughout, memoised with `createSelector` so the derived objects stay referentially
stable — worth being deliberate about in an app that re-renders on a continuous XMPP
event stream, where call state, presence, queue membership and chat are all arriving
and dispatching constantly. Icon imports stayed scoped to what a component actually
uses rather than pulled from a barrel file, since importing the whole set defeats
tree-shaking and inflates the bundle. And landing the migration itself meant keeping
each merge request to one concern — a Redux/RTK Query pass in one MR, a build-tool
change in another, a new feature in its own — so a reviewer is looking at one kind of
change at a time rather than several at once.

### A comment I pushed back on

Part of taking review seriously is knowing which comments are wrong. Asked why a `timeout`
was declared with `let` and assigned later, the answer was that `timeout` and `unsubscribe`
reference each other — the `setTimeout` callback calls `unsubscribe()`, the subscribe
callback calls `clearTimeout(timeout)`. One has to be declared before it can be assigned.
The `eslint-disable` was load-bearing, and the code stayed.

## 4. Cypress tests

Bridge had no visual regression testing before I added it. I built the **Cypress e2e
suites** for the critical paths and introduced **visual regression testing** with image
snapshots, plus a CI job for regenerating them so a legitimate UI change doesn't require a
developer to run the suite locally and commit binaries by hand.

That last part matters more than it sounds. Snapshot testing that's painful to update
gets deleted.

Tests shipped alongside the call-history feature rather than as a follow-up ticket,
because a deferred test ticket tends to lose priority, and the feature went through
enough subsequent refactoring that the tests paid for themselves within a week.

Fixtures use absolute timestamps rather than values relative to `now`, with time frozen
via `cy.clock`, so a result doesn't depend on the date the suite happens to run.

## What it demonstrates

- Building on a **real-time event stream**, reconstructing state from fragments across
  multiple call legs
- **WebRTC in production** — SIP registration, device handling, multi-call state
- **Incremental migration of a live application** — no big-bang rewrite, no feature freeze,
  on software where a regression means a missed call
- **Introducing testing** to a codebase that had none, including deterministic tests for
  time-dependent UI
- **Taking review seriously** — knowing which comments to act on and which to push back on
- Participating in **product decisions**, not just implementing them
