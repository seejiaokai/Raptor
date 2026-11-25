# Evidence sheet — one man's row of a shared absence follows him to his own input (25 Nov 26)

Branch `claude/shared-leave-row-177`, pull request 845 (draft). Built by chat 177 (Opus 5.5, high); the check is split
across two chats (the checklist's step 3): chat 177 — the tier, this sheet, the roll-call, the tests, the scenario
designs; the next chat — the sizing step, the walk, the two code reads, the fixes, the re-walk, the gates, the close.

**The fault** (chat 170's night walk, W3, reproduced by that host on `main`'s build — `scripts/handpass/r4wf-w2-w3.mjs` on
`claude/r4-walk-faults-170`): Ranger and Hex share one leave, 08:00–10:00. On the Scheduler Board's Unavailable list,
in Ranger's row: start 0900, Tab — Ranger rightly got a leave of his own; end 1100, Tab, and a remark, Tab — both were
saved onto HEX's leave. Cause: the row under the caret is not repainted while the caret is in its section, so its boxes
kept the SHARED leave's id with Ranger's name after it; the shared leave no longer held him, so the one-man path did not
fire and the change went to the shared leave whole. The same address is kept by Edit Schedule's week cells and by the
Leave War's remark box (`LeaveWords`), whose window keeps the leave it was opened on — both proved by tests below.

**The fix:** `src/ui/inputedit.tsx rowInputOf` — the input one man's row stands for now: the one it addresses while he
is still in it, else the one cut out for him (`ownPartSave` remembers each cut-out), followed as far as it was cut
again, else none, and then nothing is saved. Asked by `setInpField`, `setLeaveRemarks`, `src/ui/board.ts`,
`src/ui/textedit.ts`, `src/leavewar/ui/ReqWords.tsx`. Adds nothing he will see (no mock-up owed, D1625): his row simply
keeps what he typed, and the others' does not change.

## The eight answers and the tier

1. Money — YES: what a man is counted as (a leave's hours decide who is away; the Leave War's manning reads it) — and
   an OIL question can follow an input change. 2. The published record — YES: a change on a published day reads pending
   (D45). 3. Saved data — YES: which input record a change is saved onto. 4. A shared drawer — NO: no drawing routine
   changed. 5. A new gesture or mode — NO. 6. A new surface — NO. 7. Roles — NO, because the gate (`perms.ts`) is asked
   unchanged of the input the change lands on; but the input it lands on changes, so the walk includes a member.
8. The warning list — NO, because no rule's reading changed (the warnings read the records as saved).
**Tier: FULL.** The server question: no rule of who may do what moved (`perms.test.ts`, `perms-scan.test.ts` unchanged).

## The rulings that apply (each to be checked on the running build — the walk's chat)

D737 (on the Unavailable list an input for several stays one row a man), D759 reading 4 and D735 (one man's time or
remark on his row is his part alone: he is given an input of his own), D739 (a time or remark typed on a shared row
elsewhere changes the input for everyone — Personal Inputs and the Ground Programme, unchanged by this fix), D661, D755,
D45 (a change on a published day reads pending, the four sign-offs fall), D1354 / D1307 (the Leave War's remark box,
saved as it changes). Full rows: `grep -h '^| D737 |' .claude/decisions-full/*.md`.

## The roll-call — the thing: an ADDRESS of one man's part of a shared input, held across more than one save

| Place the app holds it | SHOW (what the row/box reads after each save) | USABLE (each later save reaches his own input) | What else is painted / holds it | Proved by |
|---|---|---|---|---|
| Scheduler Board, Unavailable row, desktop layout (`board-html.ts` `data-ifld` → `board.ts`) | YES — the box keeps what he typed; a refused box heals to HIS time (`rowInputOf` in `board.ts`) | YES | the other man's row (held, unchanged); the section is repainted when the caret leaves | `src/ui/sharedrow-board.test.tsx` (red on main's code); WALK owed |
| Scheduler Board on a phone (the same builder, phone layout) | owed — the walk | owed — the walk | the keys up; the row moving with them | WALK owed (phone 402) |
| Edit Schedule's week, Unavailable cells (`html.ts` `data-inp` → `textedit.ts`) | YES — "left as it was" and a refusal's heal read his own input | YES | the other man's cell | `src/ui/sharedrow-board.test.tsx` (red on main's code: Hex became 09:00–11:00); WALK owed |
| Leave War remark box on one man's cell (`ReqWords.tsx LeaveWords` — in BidPicker's one-day window, DayList, RemarksSheet) | YES — the box reads his own leave after the first save (red without: the box went blank) | YES | the till tick, the documents | `src/leavewar/ui/nightwalk.test.tsx` "follows him"; `sharedrow-follows.test.ts` (setLeaveRemarks); WALK owed |
| Leave War drag window (`SelectSheet.tsx`) | NO, because it writes only a war-approved leave, and a war-approved leave holds one person (`LW_OWN`) — no split can happen there | NO, the same | — | WALK owed (confirm a shared Inputs-page leave is left alone, W4) |
| Personal Inputs row / Ground Programme row of a shared input (no man named in the address) | NO, because there the box changes the input for everyone (D739) — `who` is null, `rowInputOf` hands back the input as it was | NO, the same | — | existing `groupwrite.test.ts` (D739); WALK owed (one change there still reaches everyone) |
| A puck dropped on or dragged off one man's Unavailable row (`reassignInput`, `iu:<iid>~<person>`) | MISSING until walked — the row repaints after a drop (no caret held), so the address is drawn fresh; not changed by this fix | MISSING until walked | — | WALK owed: a split by a typed box, then a puck dropped on his row before the section repaints |
| The input's own window opened from his row (D748 — the whole input) | NO, because the window changes the whole input for everyone, never one man's part | NO, the same | — | WALK owed (opened after his split: it shows HIS own input) |
| The Inputs page list's in-place cells (`reqrow.ts`, no man named) | NO, because a shared input there is one line for everyone | NO | — | — |
| Undo / Redo between his changes | YES | YES | the Undo list | `sharedrow-follows.test.ts` (undo then type; undo, redo then type) |
| Taken out of the shared input by another door while his row is held | YES — nothing saved | YES — nothing saved, never the others' input | — | `sharedrow-follows.test.ts` |
| Published day: each change on his row | owed — pending marks, four sign-offs fall (D45) | owed | the waiting mark on his Unavailable name (D1784) | WALK owed |
| The bell: who is told of his second change | YES — Hex is told nothing of Ranger's own leave | — | — | `sharedrow-follows.test.ts` |
| The address kept for the page's life (`OWN_OF`, memory only) | — a reload repaints every row with its own address; never saved | — | — | by reading; no storage writer added |

## The five sizing lines (§7.0) — for the walk's chat

## The scenarios — Astra and a fresh, blind Opus in Fable's seat (Fable at 99% of its week: the design goes on the reads-owed list)

Each designer was blind to the other, read a picture-free copy of commit `e901f9b06` (`D:/c177/scn`) and wrote its
report whole: `docs/superpowers/briefs/2026-11-25-shared-row-scenarios-astra.md` (S01–S21) and
`…-scenarios-opus.md` (S1–S15, with its table of missing call sites M1–M6). The brief:
`docs/superpowers/briefs/2026-11-25-shared-row-scenario-brief.md`.

**What the designs found before any walk — each reproduced as a failing test by the host before it was believed, then
fixed (commit after `00f0c61c3`):**

| Finding | Reproduced | Disposition |
|---|---|---|
| M2 / Astra S03 — the week: Escape in his held cell put back the SHARED leave's (Hex's) time, and the blur then saved it onto Ranger's own (a fault the first fix made reachable) | `sharedrow-board.test.tsx` "the week: Escape…" — red on the first fix | FIXED: `textedit.ts` Escape reads `rowInputOf` |
| M3 / S03 — the Board: Escape put Hex's time into Ranger's box | "the Board: Escape…" — red on `main` and the first fix | FIXED: `textedit.ts` (the Board's Escape) |
| M4 — the Board: the day stepped with the caret in his untouched held box compared it with Hex's time and fired a change nobody typed (on `main`: saved onto Hex) | "the day stepped…" — red without its line | FIXED: `board.ts boardTab` reads `rowInputOf` |
| M5 — a man dropped on Ranger's puck of his held row swapped HEX out (the drop fell back to the shared leave's lead man); and with Ranger taken out meanwhile, still swapped Hex | `sharedrow-follows.test.ts` M5, two cases — red | FIXED: `reassignInput` reads `rowInputOf`; nothing changed, with its existing words, where his part is gone |
| Astra S04 (the designers' M1, judged harmless alone) — Tab's destination refresh looked one man's row up by its whole address and found nothing, so the box Tab landed in kept a stale time: his end cleared (all day), Shift+Tab back to a start still reading 09:00, which a later save could re-time him by | "the week: his end cleared… (S04)" — red | FIXED: `textedit.ts refreshTextDestination` parses the address and reads `rowInputOf` (it now refreshes every one-man row — before, none) |
| M6 / S01 — the Leave War remark box read the shared leave after its first save | `nightwalk.test.tsx` "follows him" — red (fixed in `00f0c61c3`, after the designers' copy) | FIXED |

**Left for the walk (the combined list, ranked — walk the union, each designer's id kept):** S02 (remark, document and
till tick on one window, member, both sizes — the document viewer's identity), S01/O-S6 (the member's own window,
phone), S05/O-S8 (the W3 orders on every door, phone and desktop, Chromium and WebKit — chat 170's `r4wf-w2-w3.mjs`),
S06/O-S3/O-S11 (two or three men's rows typed in turn), S07/O-S9 (a refusal then a valid change), S08/O-S12 (Undo / Redo
with an editor open), S09/O-S7 (a puck dropped or planted on his held row, desktop drag and phone tap-arm-plant), S10/S21
(his part taken away by another door — the medical cut, a posting trim, another scheduler), S11–S12 (the Leave War's
one-day, day-list, closed-day and drag windows), S13/O-S10 (every kind that lands under Unavailable for several), S14
(halves; runs across a week), S15 (leave the section, return, reload), S16/O-S13 (a published day: pending marks, the
four sign-offs, D45, D1784), S17–S18 (who counts as away, the OIL question), S19/O-S14 (the whole-input controls; a
member), S20 (history lines, the bell, the read-only copies), O-S4/O-S5 (the Board's Shift+Tab and day step on a phone),
O-S15 (a member on the Board). Explicit negatives: each report's last section.

## The orders walked — what the screen said, what was saved

## The cases carried by a test, each with what it proves

- `src/leavewar/sharedrow-follows.test.ts` — through the one save every door uses (`setInpField`, `setLeaveRemarks`):
  three changes in turn on Ranger's row; of three people; one Undo step a change, Hex told nothing; the split undone
  then typed again (gives him his own afresh); undone and redone; taken out by another door — nothing saved; the Leave
  War's remark saved twice. Red on main's code: 6 of 7 (the "undone then typed" case passed there too, rightly).
- `src/ui/sharedrow-board.test.tsx` — the Board's boxes and the week's cells driven as the app drives them, the caret
  held: red on main's code (both doors saved the second change onto Hex's leave), green with the fix; a refused time
  heals to Ranger's own 11:00.
- `src/leavewar/ui/nightwalk.test.tsx` "follows him" — the Leave War's remark box rendered and typed twice: red without
  the box's half of the fix (it read '' after "Dental" was saved), green with it.

## The pictures

## The break tests

## Errors seen

## What was NOT walked, and why

## The gate counts

## What the walk found, and each disposition

## The code reads (Astra and a fresh, blind Opus — the walk's chat)

## Walk line
