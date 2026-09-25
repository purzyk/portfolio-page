---
title: Building an AI CV tailor that lets the model write as little as possible
subtitle: 'An application tracker with Claude-tailored CVs and cover letters. The first generated CV was unusable, and the fix was taking most of the writing away from the model.'
company: Personal project
role: Design and full-stack development
period: 2026
date: 2026-09-24
featured: false
draft: false
tags:
  - Next.js
  - TypeScript
  - Claude API
  - Postgres
  - Prisma
  - Docker
  - Google Cloud Run
---

## The one-line version

I built Recast to write my CVs for me: paste a job posting, get back a CV and a cover
letter tailored to it. The first CV it produced was unusable. It came back as three loose
blocks, in the posting's language, in the third person, with two employers merged into
one list. More prompting wasn't going to fix that. A CV is mostly fixed content, so the
version that works lets the model choose, order and condense, and never lets it write
from nothing.

It is also an application tracker, and that half came first.

![The board. Eleven applications across five statuses; the card at the top left already has a tailored CV and cover letter.](/work/recast-board.png)

---

## Context

The problem it started from had nothing to do with AI. When you apply widely, the same
role turns up on several job boards, and it's easy to apply twice without realising. A
number of the postings I was answering also asked for Docker and CI/CD, so the tool was
going to be deployed the way those teams deploy.

That set the order. The tracker (board, application records, status history, notes,
companies) needed no API key and cost nothing to run, so it shipped first. Tailoring
was deliberately left for last, because it is the only part that costs money every time
it runs.

---

## The duplicate guard

The guard checks as you type rather than when you submit. If you only find out you've
already applied after pasting a two-page job description, you've found out too late. It
matches company and role case-insensitively and includes archived applications, since a
forgotten application is exactly what it exists to catch.

![Typing a company and role that are already on the board. The warning appears before the form is finished and offers the existing record.](/work/recast-duplicate-guard.mp4)

It warns and doesn't block. A company reposting a role you still want has to stay
addable, so the database has an index on company and role but no unique constraint. The
warning makes opening the existing record the easy option and "Add anyway" the deliberate
one.

---

## The first CV, and the rebuild

The first version of tailoring gave the model the experience library and the posting and
asked it for a CV. What came back read like a summary of me, not a CV I could send.

The rebuild starts from the master CV I'd already written by hand. Code renders
everything that doesn't change between applications: name, contact details, employers,
dates, links, education, references. The model fills only what does change: the headline,
the summary, which skill rows appear and in what order, which bullets each job and project
gets, and which standalone projects make the cut. The output is always English, whatever
language the posting is in, and follows the hand-written CV's style: no pronouns, past
tense for roles that have ended.

![Generating a CV for a posting, sped up. The progress steps follow the API stream rather than a timer, and the review opens with the posting's requirements underlined where the library evidences them.](/work/recast-tailoring.mp4)

The result prints in the master CV's own stylesheet. The PDF comes from the browser's print
dialog on a standalone page, which is how the hand-made CVs are produced too, and it means
the Cloud Run container doesn't need a headless Chrome.

![The generated CV in the master template, ready to save as PDF.](/work/recast-cv-print.png)

---

## Every line says where it came from

The model returns structured output in which every block cites the library entries it
drew on. Those ids are checked on the server, and any the library doesn't contain are
dropped rather than trusted. The review screen prints the citation under each block, so
editing a draft means checking claims against sources, not rereading it for anything
suspicious.

![Reviewing a CV. The posting on the left with evidenced requirements underlined; each block on the right lists the entries it was drawn from.](/work/recast-cv-review.png)

Two rules make that useful rather than decorative. Requirements are quoted word for word
from the posting, so they can be found and underlined in the original text. And evidence
has to be the requirement itself: a neighbouring skill doesn't count. On one posting the
review reported "10 of 12 requirements matched to an experience entry. 2 unmatched: React Query, React Hook
Form". The library says RTK Query, which is close but isn't what was asked for. An
unmatched requirement tells me something before an interview, and a vague claim to cover
it would have hidden that from me.

The same honesty shows up when a block cites nothing. The CV headline is a role title plus
a few technologies, so no single entry supports it, and the review says so: "no entries
cited — check this block by hand".

Every generation is a new version and never overwrites the last one, so when a recruiter
calls I can read exactly what I sent them. Each version also records the model and its
token counts.

![A cover letter for the same posting: opening, two evidence paragraphs, close, each with its sources.](/work/recast-letter-review.png)

---

## Importing a CV without inventing links

Typing the experience library in by hand was the slowest part of setting the tool up, so
it can now be imported. You paste a CV or upload a PDF, and one call restructures it into
jobs, projects nested under the jobs they belong to, skill rows, links and quotes, keeping
the CV's own wording. Nothing is saved until the preview is accepted.

The first test run filled in URLs. The PDF showed the words "case study" next to a
project, and the model supplied an address for it. It was plausible and it was a guess. Now
a link is recorded only when the URL is written out in the source. A missing link gets
fixed in the library once; a wrong one would go out on a CV.

![The experience library. Twenty-one entries by kind, each with a count of the documents that used it.](/work/recast-experience.png)

---

## Deployment

The app is a Docker image built by GitHub Actions and deployed to Google Cloud Run on every
push to `main`. There's no service account key stored in GitHub: the pipeline
authenticates through Workload Identity Federation, restricted to this repository.
Migrations run in the pipeline rather than at container start, because Cloud Run can start
several instances at once and they would race to apply the same migration.

Postgres is on Neon, because Cloud Run scales to zero and can't host a database, and
Google's managed Postgres bills continuously. The running app uses the pooled connection
string and migrations use the direct one. Neon's pooler runs in transaction mode, which
can't hold the session-level locks Prisma's migrations take.

Two details only came out through testing. Warsaw, the nearest region, rejects custom
domain mappings outright, so the service moved to Belgium. And the sign-in boundary looked
finished before it was: wrapping the proxy in Auth.js attaches a session but lets every
request through until an `authorized` callback is added. `/` returned 200 without signing
in until I checked it route by route.

![The same review in the dark theme. Both themes shipped from the start.](/work/recast-review-dark.png)
