# Brief — `[LEAVE-LATE-PUBLISHED]`: design the scenarios (25 Sep 26, overnight, D181)

You are an independent reviewer. You did not write this plan and you will not write the code. **Do not edit any file.**
Read the LIVE files by path. They are the source of truth, and a ruling made while you read reaches you through them.

## The promise (his rulings, newest first — all in `.claude/rules/decisions/scheduler.md`)
- **D179** ("freeze everything for now", provisional): NOTHING stays live on a published day. Medical downchits and a
  lapsed qualification freeze too. They show as pending for the admin, like everything else. Left alone: only a reader's own
  view choices (the "Working draft" view on View-only Sched, one's own hidden LATE mark) and the Leave War's reminders
  that a leave period is missing. A rule-setting change's effect on a published day waits for a re-issue (as D48
  already holds the day's OIL, `.claude/rules/decisions/oil.md`).
- **D178**: EVERY member input change after a day is published (filed, edited, deleted or moved) is a PENDING change for
  the admin. The published face keeps what it was issued with. The admin publishes an AL, or (if it affects no one)
  Unpublishes and publishes the day again.
- **D177**: the first form of this (a late leave): the day reads "1 pending", the four sign-offs fall, and the published face
  keeps what it was issued with until the next AL.
- Their neighbours: **D44/D45** (the freeze-and-pending half: nothing on a published schedule changes without the
  scheduler acknowledging it), **D103** (any pending change wipes the sign-offs), **D98** (a day back to what was
  published shows nothing pending — AM20), **D174/D176** (a request filed since publishing then taken off, or taken
  off before publishing then deleted, reads 0), **D109/D113/D114** (the pending count's unit — one act, one change).
- The register every amendment rule lives in: `raptor-port/docs/superpowers/specs/2026-09-24-amendment-behaviour-register.md`
  (AM1, AM11, AM20, AM23 matter most).

## The scope already swept (read it — it is the map, not the answer)
`raptor-port/docs/superpowers/specs/2026-09-25-published-face-live-inputs.md` — every reader of live inputs on a
published day found so far (A0–A7 leak, B1–B6 live on purpose, now all frozen except B3, B4, B6), plus Astra's
earlier read of D176 (`raptor-port/docs/handpass/2026-09-25-d176-astra-read.md`, findings 1 and 2), which already gave
fix steps for part of it.

## The code (under `raptor-port/src/`)
`engine/publish.ts` (the pending comparison `dayPendingItemsIn`/`filingDelta`/`filingSame`/`filingKey`, the signature
`dayFilingFingerprint`, publishing and the issued snapshot), `engine/weekctx.ts` (`filingDiffers`), `engine/validate.ts`
(`officialDiverges`, `withIssuedWeek`, the official pass), `engine/world.ts` (`fileAcc`), `engine/events.ts` (`inpShow`,
the medical exception, `shiftHardGround`), `engine/inputs.ts`, `engine/avail.ts` (`dayAway`, `sansGate`),
`engine/slots.ts` (`autoAcceptInput`, `acceptInput`), `engine/drafts.ts` (load / plan switch), `ui/html.ts`
(`dayHTMLBody` and its Unavailable block, `dayInfoHTML`, `plRow`, `lateTagOf`, `dayStatHTML`, `withDaySnap`,
`dayIssuedHTML`), `ui/board.ts` and `ui/board-html.ts` (the Personal Inputs / Unavailable / SANS panels, `sbInpRow`),
`ui/pendlist.ts` (the pending list), `ui/inputedit.tsx` (`reassignInput`), the Inputs page and the Leave War's approval
path (`src/leavewar/…`, `sync.ts`). Also the medical and quals paths (the Quals page, a medical input's upchit).

## Your job — design the test scenarios

Do not merely review the changed code. Starting from the user promise and the applicable rulings, enumerate every
qualifying object, renderer, visible door, writer, reader, downstream consumer, role, overlay and meaningful order of
actions. **Assume every existing line may be correct and the defect may be a MISSING call site.** For each item, state
where the visible sign and the working gesture should exist in the production app. Then rank concrete failure
scenarios with setup, action, expected result, and the observation that would disprove correctness. Start with the
least-shared or most specialised surface.

Especially:
- **Every WRITER of an input** that can run after a day is published: the Inputs page (file, edit, delete, re-date,
  retype, all-day ↔ timed), the drag of an input to another person on the Unavailable row, the Leave War (approval,
  a remarks edit, a move or delete of an approved leave), a medical input (a downchit, an upchit that trims it), a SANS
  availability, an Other / activity request filed "→ Unavail", the Quals page (a lapsed or added qualification), a
  rule setting on the Logic page. What does each one do to the four readers: the count, the sign-offs, the pending list's words,
  the published face?
- **Every READER of the published face**: View-only Sched (desktop and phone), the scheduler board showing an issued
  version, the edit week's preview of an issued AL, the ⓘ panel, the warning list, the ALL AVAIL window's reasons,
  print, CSV, the next-week preview. Which must show the ISSUED inputs, and which the working copy?
- **Every way back to nothing pending** (D98): undo, the member deleting what he filed, the admin publishing an AL,
  Unpublish-and-publish, "Discard N edits", loading the published version onto the working copy. Does each clear the
  count AND bring the face and the working copy back in step?
- **Neighbour days** (B5): an input on an unpublished day beside (or the week before) a published one, whose midnight
  tail, crew rest or seven-day run touches the published day.
- **Plans / drafts, Unpublish, the AL's stored diff**: what goes out in the next AL when the only change is an input.
  What the AL records. What the AL's own view then shows.
- **Roles**: a member files (he cannot publish); the admin sees it. A member's own view of his own late leave.
- **Counts and words**: one input change is ONE pending change (D109/D114's unit), and the pending list names it in the
  app's words.

**What is NOT a finding (owner, D56):** This app is pre-promulgation and its entire stored world is DEMO DATA that
will be CLEARED before the database step. **Do not report a problem whose harm exists only in data already stored
when the code is already correct going forward** — no migration, no back-compat, no "an existing record would read
wrongly". If the app would do it again to NEW data, report it: that is a real finding and this exclusion does not
touch it.

## What to hand back
- Scenarios: ranked, each with setup / action / expected / the observation that would disprove it; the surface it runs
  on (edit week, board, View-only Sched, Inputs, Leave War; desktop, phone).
- The design questions the rulings leave open (where two readings would build two different apps). Give each one your
  recommended answer and your reason.
- **Explicit negatives:** what you checked and found needs nothing, by name.
- Plain English; keep it tight.
