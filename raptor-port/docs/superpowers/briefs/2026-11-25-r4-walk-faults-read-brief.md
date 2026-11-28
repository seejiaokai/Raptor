# Code read — two older faults fixed: the passing note's box and the Scheduler Board's held sections (25 Nov 26)

You are a blind reader of FINISHED code: you did not write it, and you have seen no walk report, no scenario list and no
other reader's report. **Change no file** (a proof test you write goes in a scratch folder outside the checkout, never
under `src/`). The same brief goes to each reader. State each finding in your output the moment it is confirmed, so a
stopped run keeps it. If a handoff block is pasted into your context after a compaction, do not read it, and name that
it happened in your report. You are reading an exported copy of one commit: its handoff block, this job's evidence
sheet, its briefs and its scenario lists were taken out on purpose.

**Where it lives.** The change is `FIX-DIFF.patch` at the export's root (everything since `main`, the documents left
out). Read the whole files it touches and what they call, not the diff alone: `raptor-port/src/ui/toast.ts` (the note's
box, `placeToast`, the blocked face and `ui/scheduler/28-blocked.css`), `raptor-port/src/ui/dayswap.ts`
(`swapKidsAround`, `kidsOfHTML`, `blockId`, `OWED`, beside the week's `swapDayAround` and `holdingPlace`),
`raptor-port/src/ui/SchedBoard.tsx` (the paint effect, `put`, `set`, `panelPrev`, `panelKids`, `pendingPaint`, the
`resume` listener), `raptor-port/src/ui/board.ts` (`boardHTMLBody` — what the day panel's top-level children are, in
each state: editable, OIL Earn, a read-only or frozen board; `boardChange`, `boardTab`, the section grip and sorts),
`raptor-port/src/ui/oilmode.ts` (`dayBarHTML`), `raptor-port/src/ui/textedit.ts` (`editingText`, `textCaret`,
`CARET_GONE`), `raptor-port/src/ui/schedule-tab.ts` (the Tab route's own catch-up), `raptor-port/src/ui/EditWeek.tsx`
(the week's twin of the hold). The contract: `raptor-port/docs/ui-contracts.md` (search "While the caret is in a text
box" and "Undo and Redo never run under a caret"). The rulings pages: `.claude/rules/decisions/scheduler.md`,
`inputs.md`, `design.md`; a ruling's full row: `grep -h '^| D828 |' .claude/decisions-full/*.md`.

**The promise.**
1. The passing note's box (`#toastEl`, the one element every note in the app is drawn in) breaks a word too long for
   it: sixty letters with no space, typed into a time box and named in "<typed> is not a time. Try 0900 or 09:00.",
   stay inside the note's border on a phone and a desktop. No ordinary note's look moves — width, lines, place (a
   phone's foot and top, D731 (1); above the "OIL not answered" bar; a desktop's centred foot), colours, the grey
   "Blocked:" face (D1668), a phone's full width less a margin (D828).
2. While a caret is in a box of the Scheduler Board, every section of the day's panel except the one holding the caret
   shows what is saved at once (it used to hold the whole panel, so an input's start typed under Personal Inputs left
   the Board's own Ground Programme row one change behind). The section holding the caret is never redrawn under him;
   the box never moves on screen, never loses a half-typed value, the caret or the Tab route; it is written whole once
   the caret leaves; Undo / Redo with the caret in a box still put the screen right (an owed block is rewritten even
   when Undo puts back what it last showed). A change that does not line up section for section — a section added or
   removed, another order, another day, OIL Earn's unwrapped sections — writes nothing while the caret is on the Board,
   as before.

Do not merely review the changed code. Starting from the promise and the rulings, enumerate every qualifying object,
renderer, visible door, writer, reader, downstream consumer, role, overlay and meaningful order of actions. **Assume
every existing line may be correct and the defect may be a MISSING call site.**

## What to look for — what is MISSING or WRONG, each with a concrete failure
1. **Every state of the Board's panel and every way a change reaches it** while a caret is in it: a save from a box,
   Undo / Redo, a section dragged, sorted, folded or unfolded, a row added or removed by a button in another section,
   OIL Earn on and off, a day or week change, a plans-selector look at a version, the desktop layout on a phone, a
   window over the Board. For each: is anything written that should wait, or held that should be written? Can a
   section be drawn twice, lost, or drawn from another day?
2. **What the changed path no longer runs** (the order's rule for a branch that skips a call): `put`'s old caret branch
   wrote nothing and dropped the panel's record; the new one writes children. What else ran on a whole write, or relied
   on the panel never changing under the caret — listeners on a replaced section, an open popup or menu hanging inside
   it, a bubble re-anchored, a Blue/Red question, the pinch zoom, a scroll inside a section, a drag in progress, focus
   or selection in a box of a REPLACED section that is not the caret's?
3. **The record of what each section shows** (`panelKids`, `panelPrev`, `OWED`): every path that writes, clears or reads
   them — the board closed, the day changed, a frozen look, a whole write — and whether any path leaves them saying
   something other than what is on screen, so a later paint wrongly skips or wrongly writes.
4. **The comparison itself**: a child's canonical markup parsed from a string against one parsed again later; a child
   whose identity (`blockId`) is the same but whose role changed; whitespace or text between children; the cost of
   parsing the whole panel on each held paint on a slow phone.
5. **The note's box**: every face and place; a word broken that should not be (an ordinary note near a wrapping edge,
   a time like "09:00", a callsign); the desktop's shrink-to-fit width; WebKit.

## What is not a finding
- A problem whose harm lives only in data already stored, when the code is already correct going forward (the whole
  store is demo data, cleared before the database step). If NEW data would be hurt, it IS a finding.
- A scheduler who is not an admin — a scheduler is always an admin.
- A wording question: this change adds no words.

## How to report
For each finding: what fails, in a person's words; the exact steps; the cause in the code (file and function); the
fix you would make, step by step; and a test that fails today and would pass after the fix (write it in a scratch
folder and run it if you can — say if you did). Then a list of what you checked and found sound, and why. Then a
tidiness note on the changed lines only — three questions: is anything there that does not need to be, is anything
said twice, is anything hard to follow — filed, not fixed. Keep it under about 2,500 words.

Write your whole report to: REPORT_PATH
