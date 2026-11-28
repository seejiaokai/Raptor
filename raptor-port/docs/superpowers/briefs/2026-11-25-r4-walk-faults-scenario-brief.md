# Scenario design — two older faults fixed: the passing note's box and the Scheduler Board's held sections

You are designing the WALK's test scenarios for a change already built. You are one of two designers; each works blind
to the other. Do not read any other designer's report, and if a handoff block is pasted into your context after a
compaction, do not read it — name that it happened in your report.

The code (read-only for you): an exported copy of the branch `claude/r4-walk-faults-170` at commit `5b524f1ab`, in
`D:/rw4/night3/copy-b` (the app lives in `raptor-port/`; the rulings in `.claude/`). The change itself, as a diff:
`D:/rw4/night3/copy-b/CHANGE.diff` (the builder's evidence sheet and brief are left out of it and blanked in the copy —
they are the builder's; do not look for them elsewhere). Do not edit, commit or create any file in the copy. Write your
whole report to the file named at the end.

## What changed, and the promise

1. **The passing note's box** (`raptor-port/src/ui/toast.ts` — the one element `#toastEl` every passing note in the app is
   drawn in, from every `HOOKS.toast`, the Leave War's included). Found by a walk: sixty letters with no space typed into
   a time box raise "<typed> is not a time. Try 0900 or 09:00.", and the words ran about 10px past the note's border on
   a phone (Chromium and WebKit). The fix adds `overflow-wrap:anywhere` to the box. **Promise:** such a word stays
   inside the border at every phone width and on a desktop; **no ordinary note's look moves** — its width, its lines,
   its place (foot / top on a phone with a window up — D731 (1); above the "OIL not answered" bar; a desktop's centred
   foot), its colours (amber, red), the grey "Blocked:" face with its sign (D1668), the phone's full width less a margin
   (D828).
2. **The Scheduler Board kept its whole day unwritten while the caret was in any box of it** (`raptor-port/src/ui/SchedBoard.tsx`
   `put`, `raptor-port/src/ui/dayswap.ts swapKidsAround`). Found by a walk: with the Board open, an accepted input's
   start changed in its in-place box under Personal Inputs (0900, Tab — the caret goes on to the End box) saved — the
   input, the week and that row read 09:00 — but the Board's own Ground Programme row for it still read 08:00, and
   after a second change read the first; closing the Board or a reload cleared it. Cause: the Board draws the day as ONE
   panel and held all of it while a caret was inside (the week has written every block but the caret's since W15,
   `ui-contracts.md` "While the caret is in a text box"). The fix writes every SECTION of the Board's day (the day bar
   and each `.sb-sec`, in the day's own order) except the one holding the caret, which is remembered as owed and
   written whole once the caret leaves. **Promise:** while he types on the Board, every other section shows what is
   saved, at once; the box he is typing in is never redrawn under him, never moves on screen, never loses a half-typed
   value, the caret or the Tab route; once the caret leaves, everything is as stored; Undo / Redo with the caret in a
   box still put the screen right (the D994 lesson: an owed block is rewritten even if Undo puts back what it showed).

The rulings that govern these surfaces: `.claude/rules/decisions/scheduler.md` (the Board, the Tab route D551–D555,
D597, the time boxes D1047 / D1080, the note's width D828, D731), `.claude/rules/decisions/inputs.md` (an input's
in-place boxes, D739 — a time typed on a shared input's row changes the input for everyone), `.claude/rules/decisions/design.md`.
A ruling's full row: `grep -h '^| D828 |' C:/Users/User/projects/Raptor-words/.claude/decisions-full/*.md`. The contract:
`raptor-port/docs/ui-contracts.md` (search "While the caret is in a text box").

## Your job

Do not merely review the changed code. Starting from the promise and the rulings, enumerate every qualifying object,
renderer, visible door, writer, reader, downstream consumer, role, overlay and meaningful order of actions. **Assume
every existing line may be correct and the defect may be a MISSING call site** — and ask what is MISSING from this
change: a section of the Board, a kind of box, a state of the Board (desktop layout on a phone, a folded section, a
section dragged to a new order, OIL Earn, a frozen look at a published version, a read-only Board), a browser (his
iPhone is WebKit), a note's face or place. For each, state where the visible sign should be in the production app.
Then rank concrete failure scenarios with setup, action, expected result, and the observation that would disprove
correctness. Start with the least-shared or most specialised surface. Include a plain-user round of the Board's
ground rows: an input filed, its times changed on the Board's Personal Inputs row, its Ground Programme row and the
week's own rows, the Board closed and reopened, every other place that shows the result looked at (the week, the
Inputs page, the bell).

This app is pre-promulgation and its entire stored world is DEMO DATA that will be CLEARED before the database step.
**Do not report a problem whose harm exists only in data already stored when the code is already correct going
forward.** A scheduler is always an admin: no scenario for a scheduler who is not one.

For each scenario give: an id; the surface and device (phone 402×874 with touch / desktop 1440×900; say if WebKit
matters); the role (scheduler = admin `ad`/`a`, member `us`/`us`); setup; the exact presses; EXPECTED, each with its
source (the ruling, a contract line, or "as on main today") — where you cannot source one, write "RECORD exactly what
it shows"; and what would disprove it. Rank by likely failure. Then a list of explicit negatives: areas you checked and
expect no fault in, and why.

You may read code and docs, and run read-only commands. Do not run the app, its tests or its build. Keep the report
under about 3,000 words.

Write your whole report to: REPORT_PATH
