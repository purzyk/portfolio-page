---
title: A drag-and-drop editor for the logic behind a phone number
subtitle: Admins were filing tickets to change an opening hour. The goal was to make that a thing they did themselves, without being able to break the call flow.
company: Compass Studio
role: Sole front-end developer
period: 2022-2026
date: 2026-03-01
featured: false
draft: false
tags:
  - TypeScript
  - React
  - Next.js
  - Redux Toolkit Query
  - Tailwind
---

This is the logic behind a phone number, and this is an office manager editing it.

![Building a call flow: dropping in an IVR menu, configuring it through a wizard, and dragging nodes into the tree. The inspector on the right reflects whatever node is selected.](/work/studio-dialplan-editor.mp4)

Compass Studio is the admin side of a cloud phone platform: the place where you decide what
actually happens when someone dials your number. That decision is a tree — greet the caller,
check whether you're open, offer a menu, route to a queue, fall back to voicemail — nested
arbitrarily deep and saved as one document.

It looks like a form builder. The hard part isn't building the tree, it's that the tree is
live: every node in it corresponds to a phone number that customers are calling right now,
and the person editing it is an office manager, not an engineer. Most of the work went into
making a wrong edit hard to make.

---

## Context

A dial plan is the logic behind a phone number. A caller dials, and the platform walks a
tree of steps: play a prompt, check the time of day, present a keypad menu, look at the
caller's number, put them in a queue, hang up. Studio is where that tree gets built.

The node types are the vocabulary of the product: IVR menu, DTMF input, time-based routing,
number-based routing, call flow switch, queue, voicemail, busy signal, call end, label.
Some branch — an IVR menu on which key the caller pressed, a time switch on whether you're
open, a queue on why the caller left it.

Before this existed, changing any of it meant filing a ticket: someone's opening hours
changed, so support edited the call flow for them — a slow way to change a number that puts
a support engineer in the path of every routine edit.

I was the sole front-end developer on Studio for four years — around 920 commits, the most
of any of its twelve-plus contributors. The dial plan editor is roughly 10.6k lines of it.
The queues, prompts and voicemails domains were mine end to end, along with the shared table
and form components the rest of the app is built from, and the two locale files the product
ships in.

---

## How the editor works

Three panes. A palette of node types on the left, over a searchable list of the things you
can drop in — the queues, prompts, voicemails and users that already exist in the account.
The tree itself in the middle, with drop targets between every pair of nodes. An inspector
on the right that shows the selected node's configuration.

Dragging is how anything gets added. Every gap in the tree is a drop target, including the
gaps inside a branch, so a node can land at any depth rather than only at the end of a list.

![Dragging a voicemail out of the sidebar and into the call flow. Every gap in the tree is a drop target, including the ones nested inside a branch.](/work/studio-dialplan-drag.mp4)

The inspector is what made the tree tractable. Each node type has genuinely different
settings — an IVR menu has a voice prompt, key options, a repeat count and a timeout; a
queue has agent and caller handling. Putting those inline would have made the tree
unreadable at exactly the depth where legibility matters most. Selecting a node opens its
panel; the tree keeps its shape.

The queue inspector is the extreme case: periodic announcements, estimated hold time, how
often to announce it, music on hold, agent handling — roughly thirty settings, edited beside
the tree without losing your place in it.

![The queue inspector. Announcement behaviour, hold-time estimates and music on hold — edited in place, with the tree still visible alongside.](/work/studio-queue-inspector.mp4)

Adding a node that doesn't exist yet is a wizard rather than a form — name, then prompt,
then options, then finish. Same reasoning as the inspector: an IVR menu has too many
decisions to present at once to someone who doesn't think about telephony for a living.

---

## The problem with a tree

Three things made this harder than a nested form.

**The nesting is unbounded and the shape is irregular.** A branching node holds a list of
*named branches*, each holding its own list of steps, each of which may branch again. The
saved document is one tree, so the state has to be one tree too, and every edit is a write
to some arbitrary path inside it. This lives in a Redux slice; RTK Query owns the server
data, the slice owns the in-progress edit.

**Depth is legibility's enemy.** Four levels of nesting is normal for a real call flow, and
a naive rendering of that is unreadable. The editor indents, draws the branch structure, and
lets any subtree collapse — plus a global collapse, because the fastest way to understand a
big plan is to see its shape with the detail folded away.

**A bad edit takes a phone number off the air.** There is no staging environment for a phone
number: the call flow you're editing is the one answering calls. So the editor does not save
as you type. You build up changes on a canvas and commit them deliberately with **Save
changes** — one explicit moment, one write of the whole tree, so a half-finished edit never
reaches the platform.

---

## Guardrails

This is the section that made self-service possible, and the most interesting engineering
in the piece.

The obvious guardrail is the one at the moment of saving: nothing reaches the platform
until you press the button, and you get an explicit confirmation when it lands. That's
necessary but shallow — it protects against a half-finished edit, not a confident wrong one.

The one worth writing about is deletion. A prompt — a recorded message — can be referenced
from dial plans, queues, voicemails, IVR menus, DTMF inputs. Deleting one that's in use is
the easiest way for an admin to break a live number without doing anything that feels
dangerous. So prompts carry a usage count in the overview, and deletion is not one rule but
two, because the consequences genuinely differ by reference type.

![Deleting a prompt that is in use. The list carries a usage count; the dialog states which references degrade safely and which ones block the delete outright.](/work/studio-prompt-delete-guard.mp4)

If a prompt is used by a **voicemail or a queue**, deleting it is allowed — those fall back
to the platform default, degraded but not broken. If it's used by an **IVR menu or a DTMF
input**, deletion is blocked entirely: a menu whose prompt has vanished announces nothing
and waits for a keypress the caller doesn't know to make. The call dead-ends.

That distinction is enforced, not advised — the delete button disables itself when the
selection contains an IVR or DTMF reference, and the dialog explains what to unassign first,
composed from which reference types are actually present.

The same instinct runs through the creation forms. Submit stays disabled until the form is
valid and something has actually changed, so the failure mode is a button that won't light
up rather than an error after the fact.

![Creating a voicemail. The submit button stays disabled until every required field is valid.](/work/studio-voicemail-create.mp4)

---

## What it demonstrates

- Modelling and editing **recursive, irregularly-shaped state** — a tree of branching nodes,
  held in Redux, saved as one document
- **Complex interactive UI** — drag-and-drop across nesting levels, collapsible subtrees,
  type-dependent inspectors, multi-step wizards
- **Designing for non-technical users** on high-stakes software, where the guardrails are
  the feature and the interesting decisions are about what to forbid
- Reading a **domain** properly — the IVR/DTMF versus queue/voicemail distinction is a
  telephony fact before it's a UI rule, and getting it wrong in either direction is either
  unsafe or needlessly restrictive
- Owning a **product surface end to end** for four years — queues, prompts, voicemails, the
  shared table and form components, and the localisation both languages ran on
