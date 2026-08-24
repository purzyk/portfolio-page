---
title: Rebuilding an architecture studio's site without losing eight years of SEO
subtitle: 'The old site had no written project descriptions and a stock theme. Redesigned in Claude, rebuilt as WordPress blocks, migrated from the old database, and translated into English — while keeping the URLs Google already knew.'
company: Grid Architekci
role: Design and full-stack development
period: 2026
date: 2026-08-24
featured: false
draft: false
tags:
  - WordPress
  - Tailwind CSS
  - Gutenberg
  - WPML
  - PHP
---

## What it is

Grid Architekci is a Wrocław architecture studio, twenty years in, with roughly 200
projects behind it. Their site had been live since 2017 — a stock WordPress theme, the
project list built as WPBakery shortcode markup, and, once I actually opened the
database, not one written description on any of the 48 published projects. Photos,
titles, nothing else. Whatever the page said about the work, someone had to write it
for the first time.

I designed the new site, built it as a WordPress block theme, migrated what could
honestly be migrated from the old database, and set it up bilingually through WPML.

## Designing it in Claude

The approved design lives as a set of static HTML mockups — one per page, built in
Claude, iterated with the client until the layout, copy and photography direction were
signed off. That set became the actual spec: every block's markup was built by copying
the mockup's own Tailwind classes, not by re-deriving them.

That wasn't the first plan. The original approach was to translate the mockups into
`theme.json` design tokens and hand-written SCSS — the "correct" way to wire a design
system into WordPress. It produced a string of small visual mismatches, the kind where
a component looks right until you put it next to the mock and the spacing is off by a
few pixels. Copying the literal classes instead — Tailwind, compiled at build time from
the same config the mockups used — removed the translation step, and with it the place
those mismatches were coming from.

![The Claude-built mockup for the homepage — the source of truth the blocks were built to match, class for class.](/work/grid-mockup.jpg)

## Building it as blocks

Nothing in the new site is a fixed template where the client would need a developer to
change a word. Everything editable is a custom Gutenberg block — eleven of them, split
between static ones (hero, stat bar, highlight plates, process steps, team grid,
manifesto text) and ones that read live data (project grid with category filtering,
awards table, publications grid, featured awards). The dynamic ones are backed by three
custom post types — a project, an award, a publication — each with its own fields, not
generic post content.

The project grid's filtering and "show more" run on WordPress's Interactivity API
against a real `WP_Query`, not the client-side array the mockup used to fake the
behaviour during design review. The mockup's filter logic was a good enough spec to
build against; it was never meant to ship.

![The project grid — filterable by category, loading more from a real query rather than a hardcoded list.](/work/grid-walkthrough.mp4)

## Migrating without starting over

The old database went into its own disposable WordPress install, never merged with the
new one — a script read from it and wrote clean records into the real site, so a bad
extraction never had a chance to corrupt anything live. 48 published projects, 4 team
members, and roughly 950 gallery photos worth of attachments came across.

The one taxonomy the old site had flattened category and status into a single field,
which had to be split back into two: `zrealizowane` and `konkursy` mapped cleanly onto
the new status field, but `komercyjne` didn't correspond to anything specific enough to
trust automatically, so every project it touched — 32 of them — got flagged for the
client to actually check rather than silently guessed at.

The migration also caught something the old site had been carrying for over twenty
years without anyone noticing: its flagship award project, entered in a 2003
competition, had a malformed date that displayed as the year "203". Migrated faithfully
rather than silently fixed, and flagged to the client — not something a script should
decide to correct on its own.

## Two languages, the hard way

The site ships as separate `/pl/` and `/en/` URLs through WPML, for the SEO reasons a
client-side language toggle doesn't give you. Two things about it were harder than
expected.

First: WPML assumes every string it scans is written in English, so a Polish string
wrapped the normal way came back asking to be translated *from* an English original
that didn't exist — backwards from what should happen. The fix is a one-time setting
per text domain, reassigning the source language to Polish before entering a single
translation, not something obvious from the UI.

Second, and much stranger: a block's default label — the kind set once in
`block.json`, not typed into a specific post — shows up in WPML's translation screen
looking exactly like any other translatable string, but a translation entered against
it is silently never applied at render time. It's registered as a different internal
string type than a normal `gettext` call produces, and both of WPML's two obvious fixes
— editing the block's own database row directly, or registering the string manually —
turned out to route through paths WPML doesn't actually read from at render time. The
fix that worked: detecting the raw default in the block's own `render.php` and running
it through the same live-lookup filter a normal translated string uses, keyed the way
WPML's own default `gettext` handling keys it. Once that was in place, translations
entered through the ordinary UI started working immediately.

## Where it landed

PageSpeed Insights on the finished site: 94 performance / 90 accessibility / 100 best
practices / 92 SEO on mobile, 100 / 90 / 100 / 92 on desktop. The 90 isn't an
oversight — the studio's accent orange fails automated contrast checks at body-text
size by design, so small text uses a darkened variant of it and the full colour is
reserved for large type and chrome, matching what the mock specified rather than what
the checker wants.

![PageSpeed Insights, mobile — 94 performance, 90 accessibility, 100 best practices, 92 SEO.](/work/grid-pagespeed-mobile.jpg)

![PageSpeed Insights, desktop — 100 performance, 90 accessibility, 100 best practices, 92 SEO.](/work/grid-pagespeed-desktop.jpg)

Every project URL the old site had indexed since 2017 still resolves. The client edits
projects, team members, awards and publications through the same WordPress editor they
already knew, in both languages, without touching a template.
