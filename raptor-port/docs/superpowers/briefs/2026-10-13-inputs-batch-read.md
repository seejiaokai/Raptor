# The read of the Inputs / schedule batch's finished code — the readers' brief (13 Oct 26)

You are a fresh reader. You did not write this code, and you read it BLIND: do not open
`raptor-port/docs/handpass/2026-10-13-inputs-batch.md` (the builder's own check), anything under
`raptor-port/docs/handpass/parts/ib/` but your own report, or another reader's report. Read the code at the commit you
are given; change no file of the app; write ONE file, your report (below — its name is given to you).

## The promise

Open the full rows first, in the shell from the repository root:
`grep -h '^| D793 |\|^| D783 |\|^| D781 |\|^| D762 |\|^| D755 |\|^| D103 |' .claude/decisions-full/*.md`

1. **D793 (owner, 13 Oct 26 — "Yes it should wait on it")** — an input put BACK on the programme after its day became a
   holiday waits on its OIL question as a swap does: the question comes first, and it is put back only on an answer.
   **OIL is earned leave — time off banked, never pay (D25).** D783's rule at one more door: a change that raises the OIL
   question "is NOT MADE until the question is answered — nothing moves; not answered … a bar stays until tapped".
   *The builder's readings (rule each: supported / contradicted / the owner's to decide):* (a) the door is the scheduler's
   "Accept" on the input's card or line (`[data-acc="g"]`, routed in `ui/interactions.ts`); "→ Unavail" (an input of kind
   Other filed under Unavailable) asks nothing — it is not "on the programme"; (b) the take-off ("Undo") asks nothing;
   (c) the app's Undo of a take-off puts the input back and asks nothing — an Undo never asks; its "OIL?" tag, the one
   list and the bell go on saying it needs an answer; (d) the put-back is TRIED and thrown away before the question, so a
   put-back the save would refuse is refused in its own words and nobody is asked; (e) answered, the answer is written
   first and the put-back second, inside ONE input batch — one command, one Undo; (f) the new kind's words: "Don't put
   back" / "Put back" / "Not put back — OIL not answered", and "That input has changed — not put back" when the bar's
   "Answer OIL" finds it already back or gone.
2. **`[HIST-DOT-INPUT-ROW]`** — with History on, the puck of a man put on an input's row of the Ground Programme wears the
   gold dot and its bubble tells the line that put him in (the line is the INPUT's, filed by its id with his id in `sub`
   and the mark `one` — `state/changelines.ts`). The rule the dots keep: a dot and a bubble never disagree
   (`ui/histbubble.ts` — `storyOf` is the one answer both share).
3. **`[ONE-RULE-LEFTOVERS]` (2)** — `PendItem.mates` (`engine/publish.ts`), set by nothing since the one-rule build, and
   its three readers in `ui/pendlist.ts` are removed. Nothing a person sees may change: the published day's "to go out"
   list reads exactly as before.
4. **A test-run fix** — the Inputs calendar's drag leaves a 350ms timer that retires its click guard
   (`ui/caldrag.ts installClickEater`); it now does nothing where the page is already gone (a test file that ended first).

## What to read

The change is `git diff origin/main...HEAD -- raptor-port/src raptor-port/e2e` (from the repository root; the branch
also carries documents — not your subject). Read the surroundings, not only the changed lines: `ui/interactions.ts`
(the whole Accept handler and what else `routeClick` does before and after it), `engine/slots.ts` (`acceptInput`,
`unacceptInput`, `acceptedDay`), `ui/oilwait.ts` and `ui/OilWaitSheet.tsx` (whole), `state/view.ts` (`OilWait`, the
resets that end a waiting question), `ui/inputedit.tsx` (`oilGate`, `dryRun`, `saveBatchX`, `commitInputEdit`,
`oilFirst`, `askOilIfPending`, `draftOf`), `state/store.ts` (`writeInputsBatch`, `tryInputsBatch`, the working-out after
every command — `state/holderbase.ts` — and "a request a scheduler took off stays off"), `ui/reqdoor.ts` (`gated` — the
pattern this door follows), `engine/publish.ts` (`dayPendingItemsIn`), `ui/pendlist.ts`, `ui/histbubble.ts` (whole),
`state/changelines.ts` (the lines of a person put in or taken out). The rules that govern the areas:
`.claude/rules/decisions/oil.md`, `scheduler.md`, `raptor-port/CLAUDE.md` §Architecture rules (the mutation funnel, the
persistence funnel — "a change to a week or a request is saved only by the command it runs in"),
`raptor-port/docs/ui-contracts.md` §The OIL question comes before the change, `raptor-port/docs/undo-contract.md`.

## How to read — use this wording as your method

> Do not merely review the changed code. Starting from the user promise and the applicable rulings, enumerate every
> qualifying object, renderer, visible door, writer, reader, downstream consumer, role, overlay and meaningful order of
> actions. **Assume every existing line may be correct and the defect may be a MISSING call site.** For each item, state
> where the visible sign and the working gesture should exist in the production app. Then rank concrete failure scenarios
> with setup, action, expected result, and the observation that would disprove correctness. Start with the least-shared
> or most specialised surface.

> This app is pre-promulgation and its entire stored world is DEMO DATA that will be CLEARED before the database step.
> **Do not report a problem whose harm exists only in data already stored when the code is already correct going
> forward** — no migration, no back-compat, no "an existing record would read wrongly". If the app would do it again to
> NEW data, report it: that is a real finding and this exclusion does not touch it.

**Every door that puts an input on the programme.** D793 names the Accept. List EVERY way an input that is off the
programme and needs an answer can come to stand on it (the card's and the line's Accept on the board and on the week;
"→ Ground"; the board's Ground "+ Inputs"; an edit of the input in its own window; a move of its date; a load, a plan
switch, a week change; Undo and Redo; the working-out after every command; a publish or an unpublish) and say, for each,
whether the question is put, whether it should be by the rulings, and what the screen says if it is not.

**The state table.** For each STATE (no question; the question up; the bar up) × each EVENT that can arrive in it (the
answer Yes / No / some days; "Don't put back", ✕, Escape, a press outside; "Answer OIL"; "OK"; the input edited,
deleted, answered, put back or taken off by another door meanwhile; a second Accept on another input; the day published
or unpublished; the day's holiday removed; the week, the page or the sign-in changed; Undo and Redo, once and twice; a
shared input; an input covering several days whose row stands on another day; an input whose row "was already there"
(the adopt); a locked week) — say what the code does, and whether that is right.

**Look hardest at:** whether the answer and the put-back are truly ONE command with ONE Undo, and what Redo then does;
what is written to the change history and to whom the bell speaks (D781: what the scheduler answers there notifies
nobody); a published day (D103: any pending change wipes the sign-offs — and nothing may wait to go out while the
question is unanswered); what `dryRun` leaves behind (it runs the rules on the tried world and again after — is any
module state left from the tried put-back?); the stale-record trap (a tried save puts every record back as a NEW
object — is any reference kept across it?); the armed place (the handler puts it down when a row moves under it); the
toast said twice or not at all; `who`/`lead` words for one person, several, ALL AVAIL; the flash (`places`) finding a
card that has been redrawn; for the gold dot — a dot without a bubble or a bubble without a dot on any surface (the
board, the edit week, a version look, View-only Sched), the cost of the dots' pass with a long change history, a seat
whose row came from an input that has since been deleted, an `.x` place, ALL AVAIL on the row; for the removed field —
any reader left, any line of the "to go out" list that reads differently.

## What a finding is

A claim is a finding only with **a concrete failure** (setup, action, what happens, what should), **its cause** (file and
line), and **its exact fix, step by step** — not a direction. Give your confidence, and say whether it is new in this
change or older code the change has made reachable (compare with `origin/main` before saying "new"). You may run a single
existing unit-test file (`cd raptor-port && npx vitest run <file>`); you may NOT build, run the browser tests, start a
server, or edit any file under `raptor-port/src`, `raptor-port/e2e` or `raptor-port/scripts`. Where you could not run
something, name the exact input you would run — the host runs every such case before it is believed.

**Give explicit negatives too:** for each thing in "Look hardest at", if you checked it and found nothing, say so and
say what you checked.

## Your report

The findings ranked, each as above; then the builder's readings each ruled; then the list of doors; then the state
table's cells that are wrong or unproved; then the explicit negatives; then what you did not read. Reply to the host
with at most six lines: how many findings by severity, and the two to look at first.
