# Brief — the code read of the day window's two jobs (one reader each; read-only; blind)

**You are one of two independent readers of a FULL bug check** (`raptor-port/docs/bug-check-order.md` §4, §4a, §5).
Opus 5.5 wrote this code the night of 9 Oct 26. **Change no file. Do not read the other reader's report.** The app
has been WALKED already — the evidence sheet says what was driven and what it found; your job is what a walk cannot
see and what the sheet's own lists leave out.

**A claim is a finding only with all three** (D489): a concrete failure (the exact steps or inputs, and what goes
wrong for a person or in a stored record), its cause in the code (file and function), and its exact fix (what to
change, step by step — the builder will apply your words, so be precise; a direction is not a fix). No style notes.
**Not a finding** (D56): a problem that lives only in data already stored — the demo's saved notes and rows of pucks —
when records made from now on are right. An old-shape record that BREAKS a load, or a new record that is hurt, is one.

## What to read

- The diff: `git diff claude/inputs-sans-calendar...claude/day-window-compact -- raptor-port/src raptor-port/e2e`
  (the branch's own commits: `ff513461`, `f4bc538b`, `3387b915`, `aa805808`, and the merge of the calendar branch).
- **The evidence sheet first:** `raptor-port/docs/handpass/2026-10-09-day-window-compact-check.md` — the rulings swept,
  the roll-call, what the two walks drove, the seven faults already found and fixed. Check its roll-call for a place
  it does not name.
- The rulings (one line each; full rows by `grep -h '^| D684 |' .claude/decisions-full/*.md`):
  `.claude/rules/decisions/scheduler.md` — D684, D688, D689, D692, D694, D695, D696, D699, D701, D629, D648, D672,
  D683; `.claude/rules/decisions/people-accounts.md` — D287, D297, D299, D337; `.claude/rules/decisions/how-we-work.md`
  — D56, D148, D350, D489.
- The contracts: `raptor-port/docs/ui-contracts.md` (search "D684", "D701"), `raptor-port/docs/data-schema.md`
  ("PLANPUCKS"), `raptor-port/docs/data-model.md` ("PlanningPuck"), `raptor-port/docs/undo-contract.md` §0.
- The code: `raptor-port/src/state/plan.ts`, `src/state/person-delete.ts` (search "PLANPUCKS"), `src/state/undo-wire.ts`
  (search "plan"), `src/ui/InputsCal.tsx` (the notes — search "THE NOTES"; the picker — "THE PICKER'S THREE ENDS",
  "renderPicker"; the month's cell — "a note: its words as a chip"), `src/ui/placedline.ts` (`placedShort`),
  `src/ui/SansDay.tsx`, `src/ui/caldrag.ts`, `src/undo/describe.ts`, `src/engine/schema.ts` (`PlanNote`), and the
  styles `src/ui/scheduler/24-sans-calendar.css` (`.sd-row`, `.sd-foot`), `25-inputs-calendar.css` (`.inputsday .ic-note`).
- How a note is SAVED, restored and undone: `src/state/sched-commit.ts` (search "plan"), `src/state/persist.ts`
  (search "PLANPUCKS"), `src/state/history.ts`.

## What we most want checked

1. **The saved record.** Can any path — a writer in `plan.ts`, the delete of a person, Undo or Redo, a restore, the
   picker, a drag — leave a note with neither words nor people stored, lose a note's people or words, double a man
   on a note, or shift the men after a gap? Is a note removed by `person-delete.ts` (the last man off a note with no
   words) actually removed from what is SAVED — is that deletion carried by the command's recorded changes, or only
   spliced out of memory and back after a reload?
2. **Old shapes.** A record `{ kind:'pucks', ids:[…] }` and a record `{ text:'…' }` with no `ids`: does every reader and
   writer treat them as notes? Does anything still ask a section its `kind`?
3. **The picker and the new note.** `pickWords`, `pickingNew`, `cancelPick`, `confirmPick`, the `leave` handler of the
   new note's box and button: any order of presses, keys, blurs or a closed window that makes two notes, no note
   where one was meant, a note with another note's words, or a write after the day window has closed?
4. **Undo's landing** (`undo-wire.ts`): the month it turns to for a note made, removed, moved between months, and for
   a day title; a change holding both a note and an input.
5. **The short small print** (`placedShort`): any full line it mangles — a callsign holding a date-like or "Placed by"
   text, a moment in another year, the "for N people" and "changed by" forms, a record with no stamp.
6. **The card's layout** (`.sd-foot`, the first line `minmax(0,1fr) auto auto`): a state the browser tests do not
   cover that prints words over words or pushes the page sideways — the LATE tag and its note, a "not counted" reason
   on the SANS day, a shared input's pucks, the delete question.
7. **Anything that contradicts a ruling named above** — quote its line.

Number every finding; give each a severity (would a person or a record be hurt? how often?). If you find nothing in an
area, say "nothing found in …" in one line. End with the line `Rulings: none this session`.
