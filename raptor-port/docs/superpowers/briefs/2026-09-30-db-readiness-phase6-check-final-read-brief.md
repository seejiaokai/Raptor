# Final code read — `[DB-READINESS]` group A phase 6, built steps (a), (b), (d) (30 Sep 26)

You are an independent reviewer of code you did not write (Opus 5.5 wrote it). Two reviewers read this, separately and
blind to each other (the owner's D353: the final reads on saved data, earned leave and the published record — BOTH).
**Read-only: do not edit any file except your own report; do not run git commands that change anything; do not run the
app.** You MAY run a single unit test file (`cd raptor-port && npx vitest run <file>`) to confirm a finding — never the whole
suite, the browser tests or a build.

Repository `C:\Users\User\projects\Raptor`, app in `raptor-port/`, branch `claude/db-readiness-table-shaping-4094f6`.
**The change under review:** `git diff 0d1a5e18..HEAD -- raptor-port/src` plus the working tree's one uncommitted comment fix in
`raptor-port/src/state/person-delete.ts` (`git diff -- raptor-port/src`). Ignore `src/state/p6c-requestonread.test.ts` —
step (c), not built, its tests committed skipped.

## What was built — read these first

- **The plan:** `raptor-port/docs/superpowers/plans/2026-09-30-db-readiness-phase6-plan.md` — §0–§3 (a), (b), (d), §9 the build log.
- **The round-1 dispositions:** `raptor-port/docs/superpowers/briefs/2026-09-30-db-readiness-phase6-dispositions-r1.md`.
- **The design of record:** `raptor-port/docs/data-model.md` §9 rule 9 and §11; `raptor-port/docs/undo-contract.md` §0.
- **THE EVIDENCE SHEET — the walk already done, with its roll-call:** `raptor-port/docs/handpass/2026-09-30-dbr-phase6-check.md`.
  Four scripted walks of the production build, each run on this branch AND on the build before phase 6, the screen compared
  step by step. Read its roll-call and ask what it MISSED.
- The scenario designer's report (context): `raptor-port/docs/superpowers/briefs/2026-09-30-db-readiness-phase6-check-scenarios-astra.md`.

In one paragraph: in the database a day may be written only by the scheduler holding it (the day lock, D450). (a) Handing a
request to another man no longer clears the old holder's OIL refusal off every day — the request counts its holdings
(`Input.hand`, `Input.leftAt`), each per-man OIL decision about a request records its holding (`oild.pa`), and the one OIL door
(`engine/oilev.ts pruneHandedOverDecisions`) ignores a decision about a man the request has left since. (b) Filing a request
under Unavailable no longer writes an `inp:` pending mark on every day it covers; the filing itself is counted
(`publish.ts filingDelta`). (d) A delete writes the man's records only (`Person.deletedFrom`); a read-time overlay
(`engine/overlay.ts overlayDeletedWeek`) takes him off every working day from his cutoff wherever a week's days come into
memory, and on the week on screen after the delete's command (a deferred effect, baseline moved on). Nothing on screen was
meant to change (plan §8 names two exceptions; the evidence sheet's F1 and F2 name two more it found).

## Your job

> Do not merely review the changed code. Starting from the user promise and the applicable rulings, enumerate every
> qualifying object, renderer, visible door, writer, reader, downstream consumer, role, overlay and meaningful order of
> actions. **Assume every existing line may be correct and the defect may be a MISSING call site.** For each item, state
> where the visible sign and the working gesture should exist in the production app. Then rank concrete failure
> scenarios with setup, action, expected result, and the observation that would disprove correctness. Start with the
> least-shared or most specialised surface.

Weigh especially: a place a week's days reach memory, or a day is written, that skips the overlay (the sheet's roll-call (i));
an OIL reader that reads a raw decision (ii); anything that still depended on an `inp:` mark (iii); earned leave decided from
the live copy instead of the issued one, or an issued version overlaid; the delete run INSIDE another command (the posting
pass, `leavewar/sync.ts runPoOutcomes`) — its deferred effect, its baseline, its undo; Undo / Redo of the hand-over (`hand`,
`leftAt` restored with the person); a reload agreeing with "right after"; the performance of the overlay inside `stashDays` /
`bundle`, which run on every keystroke's validation.

## The rulings

Nothing under `.claude/rules/` loads by itself for Codex — open them. Each area file holds one line per ruling; open a ruling's
full row before relying on its detail (`grep -h '^| D297 |' .claude/decisions-full/*.md` in a shell).
`.claude/rules/decisions/how-we-work.md` (D467, D465, D466, D453, D353, D148, D350, D56, D54), `scheduler.md` (D450, D44, D45,
D103, D177, D178, D179, D189, D174, D176, D114, D98, D363, D175, D337), `oil.md` (D25, D2, D142, D18, D43, D48, D400),
`people-accounts.md` (D287, D290, D297, D299, D304, D321, D327, D229), `leave-war.md` §Architecture;
`.claude/rules/raptor-executor.md` (never bypass the independent reviewer).

**What is NOT a finding (owner, D56):** this app is pre-promulgation and its entire stored world is DEMO DATA that will be
CLEARED before the database step. **Do not report a problem whose harm exists only in data already stored when the code is
already correct going forward** — no migration, no back-compat, no "an existing record would read wrongly". If the app would do
it again to NEW data, report it: that is a real finding and this exclusion does not touch it. **Also out of scope:** step (c) —
a request's row on its day worked out on read; the hand-over's relink, `removeInput`'s row drop and `commitNewInput`'s landing
still write a day BY DESIGN until (c) is built — do not report them; group B (the lock, the 30-second check); phase 7.

## How to report

Write your report to the file named in your instructions. For each finding: **severity** (high / medium / low), **the file and
function**, **the concrete scenario** (setup, gestures in the app's words, what the screen or the money shows, what it should
show), **whether the build before phase 6 (`0d1a5e18`) had it too** (new / pre-existing / made reachable by phase 6), and
**exact, step-by-step fix instructions** — not a direction. Then **explicit negatives**: what you checked and found nothing in,
area by area (a confident all-clear on an area the other reviewer finds a defect in is the cheapest pointer to a real bug). Then
any **question only the owner can answer**, with your recommendation.
