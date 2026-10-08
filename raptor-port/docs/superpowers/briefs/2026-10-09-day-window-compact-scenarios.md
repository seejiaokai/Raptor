# Brief — scenario design for the day window's two jobs (Astra; read-only)

**You are the scenario designer of a FULL bug check** (`raptor-port/docs/bug-check-order.md` §4, §5). You did not write
this code (Opus 5.5 did, the night of 9 Oct 26). **Change no file.** Do not review the code for style, and do not tell
us whether it is "right": tell us **what a walk of the running app must try that we have not thought of**, and
**which screen, state or record nobody wired up**. A claim counts only with a concrete case: the exact steps on
screen, what a person would see go wrong, and why you think so (D489).

## What was built (branch `claude/day-window-compact`, commits `ff513461`, `f4bc538b`, `3387b915`; compare with `claude/inputs-sans-calendar`)

1. **A shorter input card in an opened day** (owner D696, D699, D701): on the Inputs calendar's day and the SANS
   calendar's day, an input's remark and its "who placed it" small print share one wrapping line; the small print is
   a short form ("Grit · 12 Jul, 14:42") made from the full line, the full line its `title`. Files:
   `raptor-port/src/ui/placedline.ts` (`placedShort`), `src/ui/InputsCal.tsx`, `src/ui/SansDay.tsx`,
   `src/ui/scheduler/24-sans-calendar.css` (`.sd-row`, `.sd-foot`).
2. **A note that carries its own pucks** (owner D684, D688, D689, D692, D694, D695): in a day opened on the Inputs
   calendar there is ONE kind of section now — a note with words, people, or both. The separate "+ Pucks" button and
   the pucks row are gone. Files: `src/state/plan.ts` (the saved record and its mutators), `src/state/person-delete.ts`
   (a deleted man leaves a note's people), `src/ui/InputsCal.tsx` (the day window's notes, the people picker, the
   month's cell), `src/ui/caldrag.ts`, `src/undo/describe.ts`, `src/engine/schema.ts`,
   `src/ui/scheduler/25-inputs-calendar.css` (`.inputsday .ic-note`).

## Read these first (nothing loads by itself for you)

- The rulings, one line each: `.claude/rules/decisions/scheduler.md` — D684, D688, D689, D690, D692, D694, D695, D696,
  D699, D701, and the older ones this touches: D629 (every input shows who placed it and when), D648, D683 (the day
  window), D655–D660 (a shared input and its people). Full rows: `grep -h '^| D684 |' .claude/decisions-full/*.md`.
  `.claude/rules/decisions/people-accounts.md` — D287, D297, D299 (a deleted man), D337 (a delete lists what it took).
  `.claude/rules/decisions/how-we-work.md` — D56, D148 (Undo is the signed-in person's own), D350.
- The design of record: `raptor-port/docs/mock/note-with-pucks.html`, `raptor-port/docs/mock/day-inputs-compact.html`;
  the backlog items `[CAL-NOTE-WITH-PUCKS]`, `[CAL-DAY-LINES-COMPACT]` in `OUTSTANDING.md`.
- The contracts written for it: `raptor-port/docs/ui-contracts.md` (search "D684" and "D701"),
  `raptor-port/docs/data-schema.md` (search "PLANPUCKS"), `raptor-port/docs/data-model.md` (search "PlanningPuck").
- What the host already walked: `raptor-port/scripts/handpass/note-pucks-walk.mjs` (41 steps: a phone, a desktop, a
  member) and the tests `src/state/plan.test.ts`, `src/ui/inputsday.test.tsx` (the describe "a note carries its own
  pucks"), `e2e/inputs-calendar.spec.ts` (the two tests naming D701 and D684).
- How the planning calendar is SAVED and UNDONE: `src/state/sched-commit.ts` (search "plan"), `src/state/persist.ts`
  (search "PLANPUCKS"), `raptor-port/docs/undo-contract.md` §0.

## NOT a finding (owner D56)

A problem that lives only in data already stored — the demo's saved notes and pucks rows — is not a finding: the whole
store is demo data, cleared before the database step. It IS a finding if a record made from now on would be hurt, or
if an old-shape record breaks a load. "It was already like that" is not this rule.

## What we want back, in this order

1. **The roll-call's gaps.** Every place the app draws, counts, searches, exports, prints, moves, saves, restores or
   announces (a) a planning note or its people, and (b) the "placed by" small print or an opened day's input card.
   For each: does our change reach it — YES / NO-because / MISSING. Name files and what a person would see. Think of:
   the Medical tab's calendar and any other calendar that shows planning notes; the List; the changes window and the
   change history; Undo and Redo labels; a saved week or a version loaded; the Leave War; the search; a print or an
   export; the bell; a guest; what happens on a second browser.
2. **Scenarios to walk** that the host's 41 steps do not cover — at most fifteen, the most likely to find a fault
   first. For each: the role (admin / member / guest), phone or desktop, the exact steps, and what would be WRONG.
   Think of the orders of things: add people then words, words then people; edit while the picker is open; the
   picker opened for one note while another is being typed; a note dragged to another day with its people; a section
   reordered; a puck dragged while the window is scrolled; a person archived, deleted, posted out or renamed while on
   a note; the same person added twice; Undo across each of these; a note with a gap in its people then edited;
   a very long line of words; thirty people on one note; a member's view of each; the SANS day's cards with a "not
   counted" reason and a LATE note; a shared input's card (its pucks and its small print).
3. **The saved record.** Any way a note with neither words nor people can come to be stored; any way two browsers,
   an Undo, a redo, a delete of a person or a load of an older saved shape leaves one; any reader that still asks a
   section its `kind`.
4. **Anything that contradicts a ruling** named above — say which ruling and quote its line.

Write plainly. Number every item. No praise, no summary of what the code does.
