# The final code read of the four Leave War items — brief (17 Nov 26, chat 101)

You are one of two readers of finished code, each blind to the other: you have seen no walk report and no other reader's
report, and you will not. You did not write this code. Read-only: change no app file. If you write a proof test, write
it ONLY under a folder of your own named `reader-scratch/` at this copy's root, never among the app's tests. If a handoff
block is pasted into your context after a compaction, do not read it, and say so in your report.

**What you are given:** this folder is an exported copy of branch `claude/lw-four-items` at commit `01f1030c4` (the
document folders `docs/handpass/`, `docs/img/` and `HANDOFF.md` left out). The change under review is `THE-CHANGE.diff`
at this folder's root (the app source and its browser tests, against `main`). The app is in `raptor-port/`.

## The finder wording

> Do not merely review the changed code. Starting from the user promise and the applicable rulings, enumerate every
> qualifying object, renderer, visible door, writer, reader, downstream consumer, role, overlay and meaningful order of
> actions. **Assume every existing line may be correct and the defect may be a MISSING call site.** For each item, state
> where the visible sign and the working gesture should exist in the production app. Then rank concrete failure scenarios
> with setup, action, expected result, and the observation that would disprove correctness. Start with the least-shared or
> most specialised surface.

> This app is pre-promulgation and its entire stored world is DEMO DATA that will be CLEARED before the database step.
> **Do not report a problem whose harm exists only in data already stored when the code is already correct going
> forward** — no migration, no back-compat, no "an existing record would read wrongly". If the app would do it again to
> NEW data, report it: that is a real finding and this exclusion does not touch it.

A scheduler is always an admin: a finding that needs a scheduler who is not an admin is not a finding (D785). A member
and a locked (read-only) period are in scope.

## The promise — each from its ruling's full row

The full rows: `grep -h '^| D215[1-8] |' .claude/decisions-full/*.md`. The area's page: `.claude/rules/decisions/leave-war.md`
(Balances, The grid, OIL on the war); the screen-design rulings `.claude/rules/decisions/design.md`; the project guide
`raptor-port/CLAUDE.md`.

1. **D2156 — Balances, option B:** every column set from the left, its heading starting where its box or figure starts, a
   long heading on two lines, the LVE and OTHER LEAVE labels at their group's start with rules over exactly their columns;
   LVE's pending column headed "PENDING APPROVAL", its figure in a dashed amber tag with no minus; another kind's pending
   figure a small dashed amber tag on its box's top corner. The person window's tiles are not part of it (the host's
   reading). Kept: a phone pinches out until every column fits (D1483); a read-only figure ends where a box's would
   (D1493, D1497). Drawing: `raptor-port/docs/mock/2026-11-17-lw-balances-align/` option b.
2. **D2157 — the grid's hover ring:** on a desktop the one day under the mouse wears a thin cyan ring, inset 1px
   rgba(59,198,232,.6), hollow, no fill; the row's faint tint under the mouse stays; a phone is unchanged. The host's
   reading: the stronger marks (a picked or dragged selection, the move's landing day) win; man's day cells only.
3. **D2155 — the OIL award editor:** one fixed layout — amount, AM, PM, date; then reason and given-by side by side; then
   Save, Cancel, Delete — the AM / PM place left empty, not greyed, when the amount is not a half day, and Delete always as
   wide as "Really delete?", so nothing moves. It writes OIL awards (amount, half day, reason, given-by): OIL is earned
   leave — time off banked. A half day takes AM or PM (D1164); an award's day never changes (D260).
4. **D2158 — the new period's name:** in the New-period window the Name box fills itself from the dates picked —
   "JAN - MAR 27"; one month "JAN 27"; across a year's end "DEC 26 - FEB 27" — and changes with the dates whenever they
   change; a name typed by hand is kept when the dates change afterwards, and a box emptied follows the dates again; the
   dates' months name it, whatever the day of the month (the last two the host's readings, told to him). The name is
   saved data.

## What to return

1. Each finding: the concrete failure (setup, action, what the person sees), its cause in the code, and **exact,
   step-by-step fix instructions** — not a direction. Rank by consequence (OIL and saved data first).
2. **Explicit negatives:** "I checked X and found nothing" for each of the four, and for every door you traced.
3. A tidiness note, filed not fixed: of the changed lines only — is anything duplicated that one shared piece should
   do, is anything named so the next reader would misread it, is anything left that no longer does anything. No size
   numbers.
