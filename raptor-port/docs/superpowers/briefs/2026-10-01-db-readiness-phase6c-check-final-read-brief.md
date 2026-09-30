# Final code read — `[DB-READINESS]` group A phase 6 step (c) v3, the holder base (1 Oct 26)

You are an independent reviewer of code you did not write (Opus 5.5 wrote it). Two reviewers read this, separately and
blind to each other (the owner's D353: the final reads on saved data, earned leave and the published record — BOTH).
**Read-only: do not edit any file except your own report; do not run git commands that change anything; do not run the
app.** You MAY run a single unit test file (`cd raptor-port && npx vitest run <file>`) to confirm a finding — never the whole
suite, the browser tests or a build.

Repository `C:\Users\User\projects\Raptor`, app in `raptor-port/`, branch `claude/db-readiness-p6c-holder-base`.
**The change under review:** `git diff 9191910b..HEAD -- raptor-port/src` (`9191910b` = phase 6 (a), (b), (d), built and
FULL-checked; everything after it in `src` is step (c) and the fixes this check made).

## What was built — read these first

- **The plan:** `raptor-port/docs/superpowers/plans/2026-09-30-db-readiness-phase6-plan.md` — §3 (c) v3 whole, §8 items 5–16
  (what the owner will see change), §9 the build log.
- **The round-3 dispositions:** `raptor-port/docs/superpowers/briefs/2026-10-01-db-readiness-phase6c-dispositions-r3.md`.
- **The design of record:** `raptor-port/docs/data-model.md` §9 rule 9 and §11; `raptor-port/docs/undo-contract.md` (a derived
  change is made after its command, never inside it).
- **THE EVIDENCE SHEET — the walk already done, with its roll-call and findings:**
  `raptor-port/docs/handpass/2026-10-01-dbr-phase6c-check.md`. Seven scripted walks of the production build, each on this
  branch AND the build before (c), the screen compared step by step; five defects found and fixed red first. Read its
  roll-call and ask what it MISSED.
- The scenario designer's report, with its roll-call of "the request's row" (60 places): `raptor-port/docs/superpowers/
  briefs/2026-10-01-db-readiness-phase6c-check-scenarios-astra.md`.

In one paragraph: in the database a day may be written only by the scheduler holding it (the day lock, D450). A member's
filing, any edit of a request (dates, times, words, type, person), a delete and their Undo / Redo now write the REQUEST
alone; its row on the Ground Programme is WORKED OUT ON READ by one body (`engine/overlay.ts viewOfWeek`) at every door
where a week comes into memory. For the week on screen the view is always worked out from the HOLDER BASE
(`state/holderbase.ts`) — each day as its holder last committed it — so undoing a request's delete brings back exactly the
row its holder had. One standing-row predicate (`standsOn`) is asked by every lookup that acts on "the request's row" — never
a dead `kept` row (a version's row left on a day the request no longer covers, D363). §11: a member's command may carry no
schedule record at all.

## Your job

> Do not merely review the changed code. Starting from the user promise and the applicable rulings, enumerate every
> qualifying object, renderer, visible door, writer, reader, downstream consumer, role, overlay and meaningful order of
> actions. **Assume every existing line may be correct and the defect may be a MISSING call site.** For each item, state
> where the visible sign and the working gesture should exist in the production app. Then rank concrete failure
> scenarios with setup, action, expected result, and the observation that would disprove correctness. Start with the
> least-shared or most specialised surface.

Weigh especially: the holder base — when it moves and when it must not (a request's command, its Undo / Redo, a refused
command, a change made outside every command, a week left and returned, a load, the boot), and whether what the row writer
stores is always the base; the marks on a published day (a target state: A → B → A, edit → Undo → Redo, delete → Undo each
back to the base's marks exactly; a request's new row marked as its Accept marks it); a lookup that still finds "the
request's row" by its id alone and could land on a dead kept row; money — the OIL evidence of a request's row, live and
issued (D2, D142: the issued document is read as it went out); the landing on a published day (the issued version placed it,
took it off, or never saw it); a reload agreeing with "right after"; the cost of `viewOfWeek` inside `stashDays` / `bundle` /
the peek, which run on every keystroke's validation.

## The rulings

Nothing under `.claude/rules/` loads by itself for Codex — open them. Each area file holds one line per ruling; open a ruling's
full row before relying on its detail (`grep -h '^| D363 |' .claude/decisions-full/*.md` in a shell).
`.claude/rules/decisions/how-we-work.md` (D467, D465, D466, D353, D148, D350, D56, D54), `scheduler.md` (D450, D44, D45, D103,
D177, D178, D179, D174, D176, D114, D98, D363, D175, D271, D170, D172, D91, D338), `oil.md` (D25, D2, D18, D142, D400),
`people-accounts.md` (D297, D299, D149, D166); the 16 Sep 26 live-filing rule (`raptor-port/docs/engine-rules.md`);
`.claude/rules/raptor-executor.md` (never bypass the independent reviewer).

**What is NOT a finding (owner, D56):** this app is pre-promulgation and its entire stored world is DEMO DATA that will be
CLEARED before the database step. **Do not report a problem whose harm exists only in data already stored when the code is
already correct going forward** — no migration, no back-compat, no "an existing record would read wrongly". If the app would do
it again to NEW data, report it: that is a real finding and this exclusion does not touch it. **Also out of scope:** group B
(the lock's screens, the 30-second check), phase 7, and a difference the plan's §8 lists as intended (items 5–16) — though you
may argue an item is wrong.

## How to report

Your final message is your whole report. For each finding: **severity** (high / medium / low), **the file and function**,
**the concrete scenario** (setup, gestures in the app's words, what the screen or the money shows, what it should show),
**whether the build before (c) (`9191910b`) had it too** (new / pre-existing / made reachable by (c)), and **exact,
step-by-step fix instructions** — not a direction. Then **explicit negatives**: what you checked and found nothing in, area by
area (a confident all-clear on an area the other reviewer finds a defect in is the cheapest pointer to a real bug). Then any
**question only the owner can answer**, with your recommendation.
