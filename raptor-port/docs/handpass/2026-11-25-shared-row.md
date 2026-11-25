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
| **The buttons on one man's row** — the type label (the door to the input's window, its Type and Delete), Reject (an overseas duty, a commitment moved to Unavailable), the LATE chip (Board), his puck tapped to arm (chat 178, from the Fable design) | YES — each names its man beside the input's id (`data-iuw`, `html.ts iuWhoAtt`) | YES — the press asks `rowInputOf` (`interactions.ts`; `slots.ts armTargetExists`): his own input once cut out, the whole input while he is still in it (D748) | the window that opens; the note a Reject says; the arm strip | `src/ui/sharedrow-buttons.test.tsx` (S1, S2, S11 red on chat 177's code; S7 red at the schedule's own check; its roll-call test fails on any new control that names the input and no man); WALK owed (A7, B5) |
| The ONE line under Personal Inputs of a shared overseas duty sent back there (D1393) | NO, because that line is the input's, for everyone (D661, D737, D739) | YES since chat 178 — a time typed re-times it for everyone; before, it cut the first man drawn out alone (`saveFromRow` asked the kind, not the list) | — | `sharedrow-buttons.test.tsx` "rejected out of Unavailable" (red before); WALK owed (A12) |
| The history dot and the changes window's jump from his held row (`data-inprow`, read by the held address) | to be RECORDED by the walk (B9, Fable S14) — a reader, nothing saved | NO, because it only reads | — | WALK owed |

## The five sizing lines (§7.0) — written by chat 178 (the host, on Fable; the walkers Opus, D2256)

1. **The type of change:** G (which saved record a change lands on) and A (one lookup, `rowInputOf`, asked by many
   doors — each door can still be unwired), with D's shape (the same address drawn on several controls of a row) and
   a touch of H (a member's own Leave War window writes through it).
2. **What only a walk could find here:** whether each door really holds its row on the real build (the hold depends on
   where the caret is, which only a browser decides — and on an iPhone a tapped button leaves the caret in the box);
   what the row SHOWS after each save against what is saved; the phone's layout and keyboard order; the Leave War's
   windows, which keep the leave they were opened on; a published day's marks and counts; WebKit. The tests cover the
   save itself and each door driven by hand-made events in jsdom — they cannot say a real Tab, tap or drop arrives so.
3. **What the ledger says:** saved-data changes (G) — 4 walks of 7 found a real fault, mostly on the job that changed
   how everything saves; a rule in one shared calculation (A) — 5 of 9 found something but only 2 faults were in the
   change itself, the readers of the answer being where a walk pays; several-places changes (D) — 10 of 10. This job
   has already had the D shape proved three times over by the designers (5 doors, then 5 more).
4. **The walk chosen:** the host's short walk first (the fault's own reproduction, `scripts/handpass/shr-w3.mjs`,
   desktop 1440 and phone 402, Chromium and WebKit — PASS on `f3cbe7b40` and again on the fixed build); then THREE
   Opus walkers side by side on the frozen build `6c7f3aac7` (`.tmp/build-6c7f3aac7`, bundle `index-BiU7Aj55.js`),
   each in its own browser contexts: A the Board's Unavailable rows (13 scenarios), B Edit Schedule's week, the
   published day and the readers (12), C the Leave War's windows (8) — the union of the three designs, each
   designer's id kept (`docs/superpowers/briefs/2026-11-25-shared-row-walk-shares.md`; the walkers' brief beside it).
   Sizes: phone 402×874 by touch and desktop 1440×900, the designers' own (no layout changed, so no further widths);
   WebKit for the phone's core scenarios. Carried by a test, not walked: his part gone by ANOTHER person's change
   arriving (`sharedrow-follows.test.ts` "taken out by another door" — through the one save every door uses; the app
   has no live sync between two windows, so no screen route exists). No approved drawing applies (nothing new is
   drawn), so no drawing check.
   **The lessons of §7.11:** 1 (state × reading) — the row in each state (shared, cut out, part gone) in A1–A6, C5;
   3 (what tells him it happened) — every save's box and the notes recorded, A/B/C; 4 (the page behind a window) — not
   a new window; 12 (every page a window opens from) — C7; 14 (boxes found by searching the code) — the three boxes of
   a row are `data-ifld` / `data-inp` str, end, rmks and the Leave War's one remark box, each tapped on the phone
   (A1–A7, C1); 16 (after a refusal: away, afresh, the figure shown) — A5, B3; 19 (a window over a window closed each
   way) — C2 (the document viewer), A13, B12 (the input's window); 23 (what the rulings say a tap opens) — A7 (a):
   D748, the whole input while he is in it, his own once cut out; 25 (made where a person can put it) — A10's kinds
   and A12 through the app's own doors; 28 and 30 (the phone: proved on screen, a picture right after the tap) — in
   the walkers' brief; 2, 20, 26 (a drag as a hand makes it) — A7 (e), one drag, the landing read by what changed;
   21 (a test browser's touch is not his phone's) — the brief has each walker say whether a tapped button leaves the
   caret in the box; where the test browser moves it, that step goes on his look card for his iPhone; 32 (a builder's
   reading of a ruled word) — none new: "his row stands for his own input once cut out" is the promise's own words,
   and the label's window on a row not yet cut is D748's whole input, walked as the control. Not applying: 5–11, 13,
   15, 17, 18, 22, 24, 27, 29, 31 (no layout, drawing, print, scroll, zoom or clock is touched) and 23b (the screens
   pictured are checked by the walkers' pictures, which the host opens).
5. **After the walk:** its row goes into `docs/walk-ledger.md` before the closing report.

## The scenarios — Astra, a fresh, blind Opus (in Fable's seat while Fable was at 99% of its week) and, after the reset, the fresh, blind Fable itself (chat 178)

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

**The Fable design (chat 178, 25 Nov 26 — the read chat 177 listed as owed, run after the weekly reset; no longer
owed).** A fresh, blind Fable helper, the same brief word for word, on an exported copy of the branch as chat 177 left
it joined with `main` — the other two designs, this sheet and chat 177's handoff block taken out — so it read the fix
WITH the five doors above already closed (the host's choice, to spend it on what was still missing). Its report whole:
`docs/superpowers/briefs/2026-11-25-shared-row-scenarios-fable.md` (S1–S14). **It found the family the other two
missed: every text box on his held row followed him, every BUTTON on the same row still named the shared input** —
and on an iPhone a tapped button leaves the caret in the box, so the row stays held. Each reproduced by the host as a
failing test before it was believed, then fixed (commit `6c7f3aac7`):

| Finding | Reproduced | Disposition |
|---|---|---|
| Fable S1 — the type label on Ranger's held row opened HEX's leave (its Delete would have deleted it) | `sharedrow-buttons.test.tsx` S1, Board and week — red on chat 177's code | FIXED: the label names its man (`data-iuw`), the press asks `rowInputOf`; older than this branch (on `main` too) |
| Fable S2 — Reject on his held row of a shared overseas duty sent HEX's duty back | S2, Board and week — red | FIXED the same way; older |
| Fable S11 — the LATE chip on his held row hid HEX's mark | S11 — red | FIXED the same way; older |
| Fable S7 — his puck tapped on the held row armed, then was dropped at the schedule's next check with no words | S7 — red at `armTargetExists` | FIXED: `engine/slots.ts armTargetExists` follows him (the lookup moved to `engine/rowinput.ts`); the name tapped next takes his place on his own input |
| Fable S5 — the same time typed again ("0800" over 08:00) cut him out for nothing: two leaves with the same hours, a history line | S5, Board and week — red | FIXED: `saveFromRow` cuts nothing where nothing changed; older |
| The host's own, reading the save for S5 — a shared overseas duty sent back to Personal Inputs is ONE line for everyone (D661, D737, D739, D1393), but a time typed on it cut the first man drawn out alone | "rejected out of Unavailable" — red, through the real Reject and the line's own box | FIXED: one man's part only where the row is listed under Unavailable (`listedUnavail`, the drawing's own test); older |
| Fable S3 (the Leave War's admin window: a remark, then Delete / Refuse / Move without closing), S6 (a published day's counts), S14 (the history dot and the changes jump), S12 (two windows) | not reproduced by reading — walk questions | the walk: C3, B6, B9; S12 set aside (no live sync between two windows) |

**Left for the walk (the combined list, ranked — walk the union, each designer's id kept; the three shares:
`docs/superpowers/briefs/2026-11-25-shared-row-walk-shares.md`):** S02 (remark, document and
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

- `src/ui/sharedrow-buttons.test.tsx` (chat 178) — the Board's and the week's real markup with the caret held, each
  button pressed by a click event: the label, Reject, the LATE chip, the armed puck and the name tapped after it; the
  same time typed again; the roll-call as a test (every control on one man's row that names the input by its bare id
  names its man); the sent-back overseas duty's one line. 16 cases. Hand-made events in jsdom — they prove the press's
  route once it arrives, not that a real tap arrives so: the walk's A7, A9, A12, B5.

## The pictures

- The host's short walk (the fault's own reproduction): `docs/img/handpass/2026-11-25-shared-row/host/` — `w3-<size>-<engine>/`
  on `f3cbe7b40` (desktop and phone, Chromium and WebKit; the host opened the desktop Chromium and the phone WebKit
  pictures: Hex 08:00–10:00 with no remark, Ranger 09:00–11:00 "own hours"), `w3b-desk-chromium/` on the fixed build.

## The break tests

## Errors seen

## What was NOT walked, and why

## The gate counts

## What the walk found, and each disposition

## The code reads (Astra and a fresh, blind Opus — the walk's chat)

## Walk line
