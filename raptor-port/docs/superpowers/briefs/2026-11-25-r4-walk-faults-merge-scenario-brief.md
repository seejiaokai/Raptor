# Scenario design — where two changes meet: the Board's sections written around the caret, and one man's row of a shared leave

You are designing the WALK's test scenarios for a branch that has just had `main` brought into it. You are one of two
designers; each works blind to the other. Do not read any other designer's report, and if a handoff block is pasted into
your context after a compaction, do not read it — name that it happened in your report.

The code (read-only for you): an exported copy of the branch `claude/r4-walk-faults-170` at its merge commit
`0ff30dbdf` (the branch with `main` at `1993bed86` brought in), in `D:/rw4/r183/copy-m` (the app lives in
`raptor-port/`; the rulings in `.claude/`). No source file clashed in the merge and no line was written by hand for it.
Do not edit, commit or create any file in the copy. Write your whole report to the file named at the end.

## The two changes

**A. This branch's change** (`D:/rw4/r183/copy-m/CHANGE-843-this-branch.diff`; pull request 843, not yet live).
The Scheduler Board draws its whole day as ONE panel, and while the caret was in any box of it the panel was not written
at all. Now (`raptor-port/src/ui/SchedBoard.tsx` `put`, `raptor-port/src/ui/dayswap.ts` `swapKidsAround`, `owesBeside`)
every SECTION of the Board's day is written at once except the one holding the caret, which is remembered as owed and
written whole when the caret leaves the Board's boxes — or at once when the caret moves into a box of ANOTHER section.
**Promise** (the contract: `raptor-port/docs/ui-contracts.md`, search "While the caret is in a text box"): while he
types on the Board every other section shows what is saved, at once; the box he is typing in is never redrawn under
him, never moves on screen, never loses a half-typed value, the caret or the Tab route (D551–D555, D597); once the
caret leaves, everything is as stored. (The same branch also lets the passing note break a long word —
`raptor-port/src/ui/toast.ts`; `main` changed that file too and the two merged by themselves.)

**B. `main`'s change it now meets** (`D:/rw4/r183/copy-m/CHANGE-845-shared-row.diff`; pull request 845, live).
On the Board's Unavailable list — and the week's — an input that holds several people is drawn a row a man (D737). A
change typed on one man's row gives him an input of his own, a NEW record, cut out of the shared one. His row, in the
section holding the caret, is held back from repainting and so still carries the SHARED input's address
(`iu:<iid>~<person>`); before the fix his next changes were saved onto the OTHERS' input. Now every door on that row
asks which input the row stands for NOW (`raptor-port/src/engine/rowinput.ts` `rowInputOf`, `rowKeyNow`,
`unavailFaces`; its callers in `ui/board.ts`, `ui/textedit.ts`, `ui/inputedit.tsx`, `ui/interactions.ts`, `ui/html.ts`,
`ui/highlights.ts`, `ui/drag.ts`). **Promise** (`raptor-port/docs/ui-contracts.md`, the own-part contract; D737, D739,
D748): every change, button and drag on one man's row reaches HIS input and never the others'; a refused box heals to
HIS time; the row keeps its place in the list; the row's other time box says what was saved.

**Where they meet.** B was built and walked on a Board that held its WHOLE day while the caret was in it. With A, only
the caret's own section is held; every other section is rewritten under the caret, and a section the caret has just
left is rewritten the moment the caret lands in another. Both changes were walked, each alone
(`raptor-port/docs/handpass/2026-11-25-r4-walk-faults.md`, `raptor-port/docs/handpass/2026-11-25-shared-row.md`, and
their scenario lists under `raptor-port/docs/superpowers/briefs/2026-11-25-r4-walk-faults-scenarios-*.md` and
`…-shared-row-scenarios-*.md`). The scenarios already on those lists will be re-run on the merged build as they are —
**do not repeat them.** Your job is what NEITHER list holds because neither build had the other's change.

## Your job

Do not merely review the changed code. Starting from the two promises and the rulings, enumerate every qualifying
object, renderer, visible door, writer, reader, downstream consumer, role, overlay and meaningful order of actions
**where the two changes meet**. **Assume every existing line may be correct and the defect may be a MISSING call site**
— ask what is MISSING now that they run together: a row or a control of B's that now lives in a section A rewrites
under the caret (or no longer holds); an address, a remembered pointer, a mark, a ring or an open window that B's fix
assumed stayed on screen until the caret left the Board; a section A treats as "another section" that draws the same
input or the same man (Available crew, the Ground Programme, Personal Inputs, the Common Programme, the warning list);
the caret moving between sections mid-change; Undo and Redo; the Tab route crossing a section's edge; the phone's
layout; WebKit (his iPhone). For each, state where the visible sign should be in the production app. Then rank concrete
failure scenarios with setup, action, expected result, and the observation that would disprove correctness. Start with
the least-shared or most specialised surface.

The governing rulings: `.claude/rules/decisions/scheduler.md` and `.claude/rules/decisions/inputs.md` (a ruling's full
row: `grep -h '^| D737 |' .claude/decisions-full/*.md`, run inside the copy).

This app is pre-promulgation and its entire stored world is DEMO DATA that will be CLEARED before the database step.
**Do not report a problem whose harm exists only in data already stored when the code is already correct going
forward.** If the app would do it again to NEW data, report it. A scheduler is always an admin: no scenario for a
scheduler who is not one.

For each scenario give: an id; the surface and device (phone 402×874 with touch / desktop 1440×900; say if WebKit
matters); the role (scheduler = admin `ad`/`a`, member `us`/`us`); setup, made through the app's own controls; the exact
presses; EXPECTED, each with its source (a ruling, a contract line, "as on main today", or two places of the app that
must agree) — where you cannot source one, write "RECORD exactly what it shows"; and what would disprove it. Rank by
likely failure. At most about twelve scenarios. Then a list of explicit negatives: places where the two meet that you
checked and expect no fault in, and why.

You may read code and docs, and run read-only commands. Do not run the app, its tests or its build. Keep the report
under about 2,000 words. State each scenario in your output the moment you settle it, so a stopped run keeps it.

Write your whole report to: REPORT_PATH
