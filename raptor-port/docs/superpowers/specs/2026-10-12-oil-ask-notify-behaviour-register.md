# `[OIL-ASK-NOTIFY]` — behaviour register (D780, D781, D782, D783, D784; 12 Oct 26)

One plain line per behaviour, each named by a test (`scripts/rulecheck.mjs`, ON1–ON16). The rulings' full rows:
`grep -h '^| D78[0-4] |' .claude/decisions-full/*.md`. The plan, with Fable's read of it (§5a):
`../plans/2026-10-12-oil-ask-notify-plan.md`; the approved pictures `../../mock/oil-notify.html`,
`../../mock/2026-10-12-oil-notify/` (D783 — the design of record). The screens as written:
`../../ui-contracts.md` §The OIL question comes before the change; what each part touches: `../../feature-impact.md`.
The check: `../../handpass/2026-10-13-oil-ask-notify.md`.

| ID | The behaviour | Ruling | Named proof |
|---|---|---|---|
| ON1 | A swap on an input's row that raises the OIL question — a man dragged from a seat onto its only person's puck, or put there from the crew list — is NOT MADE until the question is answered: the inputs, the day, the change history, the bell and Undo are all as they were, and no window of the input opens | D783 (1), D781 | `ui/oilwait.test.tsx` |
| ON2 | Answered, the change and the answer are ONE command: one Undo puts back the people and the answer that stood before; the new holder's answer is the one just given, never the first man's | D783 (1), D762 | `ui/oilwait.test.tsx`, `ui/reqdoor.test.tsx` |
| ON3 | A person ADDED to an input that has no OIL answer yet waits the same way ("Adding … to …"); added where the input is answered — Yes or No — he is put in at once, and a No says he is not counted | D783 (3), D755 (1) | `ui/oilwait.test.tsx`, `ui/reqdoor.test.tsx` |
| ON4 | A MOVE from one input's row onto another's waits on the second input's question; answered, he is out of the first and in the second in one step | D783 (reading) | `ui/oilwait.test.tsx` |
| ON5 | Every way of putting a person on the row reaches the same wait — the drop, the armed tap (the place stays armed), the store's own writer — and a working day, or a kind that never earns, asks nothing: the change is made as it always was | D783, D754 | `ui/oilwait.test.tsx` |
| ON6 | NOT ANSWERED — nothing is made and nobody is told; a bar stays until tapped: "Not swapped — OIL not answered" / "Not added — …" / "Not moved — …", with Answer OIL (the question comes back) and OK (it only closes) | D783 (2), (4) | `ui/oilwait.test.tsx` |
| ON7 | "Answer OIL" asks the door afresh: a row that has changed since says so and puts no stale question; the waiting question and the bar end with the week, the page and the sign-in | D783 (2); Fable A5 | `ui/oilwait.test.tsx` |
| ON8 | On a PUBLISHED day nothing waits to go out and no sign-off falls until the answer is given | D103, D783 | `ui/oilwait.test.tsx`, `state/inputcount.test.ts` |
| ON9 | The same rule at the two sibling doors: a man dragged onto another's row under Unavailable ("Not swapped"), and an input dragged on the Inputs calendar onto a day that asks the question ("Not moved") — the question first, the change only on an answer | D780 ("holds at every door"), D783 (reading R1) | `ui/oilconfirm.test.tsx`, `ui/caldrag.test.tsx` |
| ON10 | THE ONE LIST holds every input on the programme with a day in the run that asks the OIL question and has no answer — one line an input however many people it holds, its own amount (FO / HO); an answered one, one taken off the programme and a kind that never asks are not on it; read live | D782 | `leavewar/holnotice.test.tsx` |
| ON11 | The list's Save writes the picked answers in ONE command (one Undo): Yes the input's own amount, No a 0, on its unanswered days of the run only — its other days untouched; only a scheduler saves from it; Later writes nothing | D782, D783 | `leavewar/holnotice.test.tsx` |
| ON12 | A working day made a public holiday with inputs on it that now need an answer tells EVERY scheduler with one notice, made inside the holiday's own command — the one who made it too; a member gets none; the list opens by itself, saying the day is now a holiday | D780, D781, D783 (5) | `leavewar/holnotice.test.tsx` |
| ON13 | Every door that makes a working day a holiday tells the same way — the Holidays list (add, and a change onto new dates), a word typed on the Leave War's Event row, a band, an event TYPE re-tagged as a holiday; a holiday with nothing to answer, an Off day and a holiday on a Saturday tell nobody | D780; Fable A1; D21 | `leavewar/holnotice.test.tsx` |
| ON14 | The holiday's Undo takes its notices with it; its Redo brings them back, unread again | D780; `undo-contract.md` | `leavewar/holnotice.test.tsx` |
| ON15 | The bell's line counts what is LEFT, read live ("4 inputs need an OIL answer" / "1 input needs…"): answered in the list it falls for every scheduler and tells nobody; nothing left, the line is gone and lights no bell; a holiday made twice is ONE line | D781, D783 (6); Fable A6, A7 | `leavewar/holnotice.test.tsx` |
| ON16 | A tap on the line opens the ONE list (without "is now a public holiday"), closes the bell's list and reads the line; a scheduler whose own unanswered input the line covers is taken to the bell's list, not to that one input's question; a member's bell is as it was | D782, D783 (6), D769 | `leavewar/holnotice.test.tsx` |

## What changed in earlier registers

- `2026-10-11-group-input-one-row-behaviour-register.md` **GI7** (as it reads since D762: "a person added follows the
  input's ONE answer; where there is none the question opens at once for whoever added him"): the question now comes
  BEFORE the add, and unanswered he is not added (ON3). The rest of GI7 stands.
- The OIL ask-flow's "the question follows a save that left a day unanswered" (22 Sep 26 — `ui/inputedit.tsx
  askOilIfPending`, Codex ranks 5 and 6; Fable M2): for the row's door, the Unavailable row's drag and the calendar's
  drag the question now PRECEDES the save (ON1, ON9). `askOilIfPending` stays as the backstop of those doors (a change
  made although its try was refused — never silent) and of a hand-made call by someone who may not edit the schedule.
