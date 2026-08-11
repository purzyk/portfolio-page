---
title: Replacing the login on two live products without anyone noticing
subtitle: An ISO certification needed multi-factor auth, which meant moving two products onto a central identity provider. I designed it and built it — to a brief where success meant users noticing nothing but a changed address bar.
company: Compass Janus
role: Design and front-end development
period: 2025-2026
date: 2026-02-01
featured: false
draft: true
tags:
  - TypeScript
  - Next.js
  - OAuth 2.0
  - OIDC
  - Ory Kratos
  - Ory Hydra
  - UI design
---

## The one-line version

The company was going for ISO certification, and the gap was authentication: no
multi-factor, and two products each holding their own login. The fix was a single identity
provider both products delegate to — which sounds like new-feature work but is mostly the
opposite. The first release had to change nothing a user could perceive except the domain
in the address bar. Everything interesting about it is a constraint rather than a feature:
ship an identity provider that nobody notices, then add MFA on top of it once it's load-bearing.

I designed the screens and built the front end.

![The sign-in page. One deployment, one set of components, themed per reseller domain.](/work/janus-login-studio.png)

---

## Context

Compass is a cloud phone platform sold through resellers. Studio and Bridge, its two front
ends, each authenticated on their own — meaning MFA would need to be built twice, kept
consistent twice, and would still leave no single sign-on.

Janus is the third application: a standalone Next.js app that owns sign-in for both. It
runs OAuth2 and OIDC flows through Ory Hydra and authenticates against Ory Kratos, so
credentials and second factors live in one place with one implementation. Studio and Bridge
become OAuth clients that redirect to it.

Single sign-on and federated login were explicitly out of scope for this release, but OIDC
was chosen specifically so they become possible later without another migration.

Janus is the newest of the three and the only one I built from an empty repository.

---

## Designing it first

Before any application code, I produced mockups for every screen: sign-in, MFA challenge,
MFA setup, error, logout confirmation, the post-logout landing page, and three Studio-side
screens for administering MFA on a user's account.

They were static HTML rather than a design tool, and that was the useful decision. The
shared stylesheet behind them is a direct extraction of Studio's own component layer —
the same buttons, inputs and cards, with the per-brand palette lifted into CSS custom
properties so switching a class on `<body>` previews another reseller. The mockups weren't
an approximation someone would have to interpret; they were production's components, in a
browser, at a URL anyone could open. Porting them into the real app later was mostly moving
the file.

Each screen stacked all of its states vertically on one page — empty, filled, every error —
so a reviewer could scan the whole surface in one scroll.

I put that in front of stakeholders across engineering, product and account management, and
folded their feedback back into the design:

- **The error page verb.** "Try again" was consistent but didn't say what the button does —
  restart the sign-in flow. It became "Sign in again", and "Sign in" replaced "Log on"
  across the product.
- **The logout screen** listed every application you were signed into, to show that
  signing out was global. That's more detail than a user needs, and it became one sentence.
- **Localisation.** I'd scaffolded i18n and populated English only; 80–90% of end users are
  Dutch speakers, so that became its own piece of work.
- **The expired-session page** auto-redirected after a five-second countdown — cut, because
  a user who walks away from an expiring session shouldn't come back to one that's silently
  expired a second time.

![Inline validation on the sign-in form. Failures that a user can immediately correct stay on the page.](/work/janus-login-validation.png)

The error model that came out of this review is a rule rather than a set of cases: if the
user can fix it right now — wrong password, wrong TOTP code — it renders inline and the
flow survives. If the flow itself is gone, that's a terminal page with a route back to the
application they started from. What an error is allowed to reveal is deliberately thin: a
failed sign-in doesn't say which half you got wrong.

![The terminal failure page. Reached when the flow itself has expired, with a route back into the application that started it.](/work/janus-signin-failed.png)

---

## Theming from one deployment

One deployment serves every reseller. The brand is resolved per request from the hostname,
matched against a table of domains, longest match winning. Everything downstream —
palette, logo, its dimensions — follows from that one lookup, set by a theme class on
`<body>`.

![The same page on a different reseller domain. One deployment, one component set, resolved from the hostname.](/work/janus-login-everwhite.png)

QA needs to preview a brand on a host that doesn't resolve to it, so there's a `?theme=`
override — but sign-in leaves the application and comes back through Kratos, and a query
parameter doesn't survive that round trip. The override is written to a cookie on first
sight and re-read on the way back, so it persists across the redirect chain. Resolution
order: explicit override, then cookie, then hostname.

---

## MFA

The challenge and its setup flow live inside Kratos's own model rather than as routes of
their own: the TOTP challenge is a login flow requesting a higher assurance level, and
setup is a settings flow. The implementation branches on what the flow asks for, not on
where the user is in it.

![The second factor. Six cells with paste and arrow-key traversal, and Verify disabled until the code is complete.](/work/janus-totp-challenge.png)

A wrong code follows the same rule as a wrong password — fixable right now, so it stays on
the page and the flow survives — with a message that says only that the code didn't match.

The harder problem: **Kratos has no way to force a user to set up MFA.** You can require a
second factor at sign-in, but not that one exists. So the gate sits at the consent step —
the moment an OAuth session would be issued — and refuses to issue one while enrolment is
outstanding, diverting the user into setup and resuming the original flow afterwards.

![The enrolment gate. A user whose account requires a second factor but hasn't set one up is diverted here instead of receiving a token.](/work/janus-mfa-setup.png)

It defers rather than traps: "Cancel and set up later" exists because a user locked out at
sign-in with no way past is a support call. The pending challenge crosses the detour in a
short-lived HttpOnly cookie, since Kratos hands control back with only a flow ID — but that
cookie only ever selects which challenge to resume. Whether enrolment is actually complete
is re-checked against Kratos every time: a cookie deciding whether you get a token is a
vulnerability, not a convenience.

---

## What it demonstrates

- **Designing and building the same product** — mockups, stakeholder review, then the
  implementation, with the design decisions traceable into the code
- **Identity as a domain**: OAuth 2.0 and OIDC flows, Ory Kratos and Hydra, consent and
  logout challenges, assurance levels, TOTP enrolment
- **Security reasoning that survives contact with an attacker** — knowing which pieces of
  state are conveniences and which are boundaries, and re-checking the ones that matter
- **Multi-tenancy from a single deployment** — per-request brand resolution, tokenised
  palettes, and a preview mechanism that survives a redirect chain through a third party
- **Working to a compliance deadline** with a scope drawn deliberately tight, and an
  architecture chosen so the things left out stay possible
