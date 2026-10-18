# His three follow-ups of 18 Oct 26 — the bug check (branch `claude/three-small-jobs-1018`)

His words (after the night's look): "Looks good. As recommended. Merge live" — recorded D1019, D1020, D1022 (and D1021,
nothing to build). Filed as [LW-CARD-SHORT-WORDS-700], [DATEBOX-ESC-LISTS], [UPCHIT-DELETE-REGROW], one small job together.

| Job | What changed | Where |
|---|---|---|
| D1019 | the Leave War grid card's "Rearrange" and "OIL tracker" read "⇅" and "◷ OIL" up to 700 wide, so "−" and "+" stay on the head's one line; the grid's padding still 430 | `leavewar/ui/chrome.css` (the `.card-hd .rtlbl` rule moved to its own `max-width: 700px` block) |
| D1020 | the calendar floating over a date box: with its month and year lists open, Escape shuts only the lists (the keyboard on the title); the next closes the calendar, the next the form | `ui/DateBox.tsx` (the layer's Escape leaves the lists to the calendar's own listener, D1012's) |
| D1022 | a deleted upchit gives the downchit it cut its days back — to the end it was filed with, stopping before another medical of his — in the delete's one command; the window's Delete and the opened day's Delete key ask first on the upchit sheet ("Deleting this upchit will …", red "Delete upchit"); a delete with nothing to give back still goes at once (D792) | `engine/medical.ts` (`giveBack`, one body with D999's move; `upchitDeletePlan`), `ui/inputedit.tsx` (`removeInput`, `upchitDeleteAsk`, the window's `del`), `ui/UpchitConfirm.tsx` (`deleting`), `ui/MedMoveConfirm.tsx` (kind `updel`), `ui/InputsCal.tsx` (the Delete key) |

## The eight questions and the tier

1. Money / OIL — no: a downchit's days decide who reads fit, never OIL (leave and medical never earn — D804).
2. The published record — YES: a downchit grown back over a published day reads a change waiting (D178), as D999's does.
3. Saved data — YES: the delete now also rewrites the downchit's end and drops its kept first end.
4. A shared drawer — yes for the upchit sheet (one sheet, now three doors: save, move, delete).
5. A new gesture or mode — yes: Escape's order over a date box; Delete on an upchit now asks.
6. A new surface — no new screen; the sheet's delete words are a state of the existing sheet.
7. Roles — no change: `removeInput`'s rules run before any give-back (a member deletes only his own; an upchit names one
   man, so the give-back is always his).
8. The warning list — no: the medical warnings read the rows as they always do.

**Tier: FULL** (2 and 3), the batch checked once at the highest of its three (D485): D1019 alone is a WALK (layout at many
widths), D1020 a LOOK plus its tests.

## The rulings swept

D1019 (narrows D1016's "the grid card unchanged" for its buttons; D1000's "the grid unchanged" — its columns and padding
stay); D1020 (widens D1012); D1022 (D999's rule for a delete; D792 "Delete deletes at once and asks nothing" — narrowed
by D1022 where the delete gives days back: D1022 is the later ruling, D90); D178 (a published day's input change reads
pending); D621 (the calendar's Delete key asks first — the upchit sheet is that question where it gives back); D159/D487
(no button size changes — none made). No clash beyond the D792 narrowing, which D1022's full row states ("the save sheet
says so before anything changes").

## The roll-call

| Thing | Place it is drawn or done | Has it / must not, because… / MISSING |
|---|---|---|
| The card's short words | the Leave War grid card's head, admin (Manning · ⚙ · ⇅ · OIL · − · +) | HAS — walked at 390, 430, 431, 440, 600, 700, 701, 1440 |
| | the same head, a member (Manning · OIL · − · +) | HAS — walked at 440 and 701 |
| | the OIL tracker sheet's own head and the settings sheet's buttons (`.rtbtn` reused) | MUST NOT — they carry no `.rtlbl`; nothing of theirs changes |
| | the Leave War's top (the two lines above the card) | MUST NOT — D1000/D1016's own rules, untouched; the browser test of the top holds |
| Escape over a date box | every floating calendar (`DateBox`): "Every <weekday>" From / Until, Admin → Data, a new person's Post in, the upchit's date, the Leave War's posting dates, the Tracker's eight boxes | HAS — one layer drawn by one component for all; walked on "Every Thursday" From; the unit test pins it with and without a window behind |
| | a calendar inside a form (the OIL question's days, an input's own window) | HAS already (D1012) — untouched |
| | the Inputs list's dates calendar (its own pop-up, not `DateCal`'s lists) | MUST NOT — it has no month and year lists |
| The give-back on delete | the input's own window → Delete (from the calendar's bar, the day's line, the Inputs list, the Medical tab, the schedule) | HAS — one window, one `del`; walked from the bar |
| | the Delete key on the line of a day opened on the Inputs calendar | HAS — walked |
| | "Delete for everyone" of a shared input | MUST NOT — an upchit is one man's own (medical is never filed for others, D655) |
| | Admin → Data's clearing of old records (`clearHistoryBefore`) | MUST NOT — it clears history by date, downchits of that time with it; not a delete of an upchit as an act |
| | a posting out's delete of a man (`person-delete.ts`) | MUST NOT — his own records go with him |
| | Undo / Redo of the delete | HAS — one command: walked |
| | the Medical tab's cards and the Tracker's down days (readers of the downchit) | HAS — they read the rows; D999's walk proved the Medical tab reads a grown downchit |
| | a published day the grown downchit covers again | HAS — walked (reads a change waiting) |

## The walk's size (`docs/walk-ledger.md` — D607)

1. **Type:** E (D1019 layout at many widths), C (D1020's Escape order; D1022's Delete now asking), G (D1022: saved data,
   undo, a reload, a published day).
2. **What only a walk could find:** that the card's head really holds one line at each width between 431 and 700 with the
   real fonts (jsdom has no layout); that the sheet appears over the window and over the opened day, and fits a phone;
   that the delete's Undo puts both back on screen; that the published day reads pending; that Escape's order holds in
   the real browser over a window. The unit tests already carry the give-back's arithmetic (eight cases) and both doors'
   Save / Cancel in jsdom.
3. **The ledger:** E walks by the host at several widths found layout faults about one time in three; D999's own walk
   (C, G — 34 checks, 21 pictures, the host's script) found nothing in the change after its reads.
4. **Chosen:** the host alone, one scripted walk (`scripts/handpass/three1018-walk.mjs`): L at eight widths for an admin and
   two for a member; E five steps (desktop — a keyboard); U seven scenarios (desktop, the phone 390 by touch, a reload, a
   published day). Carried by tests: the give-back's limits (the OML and the other upchit in the gap, another man's
   upchit, a downchit never cut) — `ui/medwrite.test.ts` "D1022" (the real writer, read back from the store); the sheet's
   Cancel and Save in both doors — `ui/upchitdelete.test.tsx` (the real buttons and keys in jsdom); the floating calendar
   with a window behind — `ui/datebox.test.tsx`.
5. **The ledger row:** added after the walk.

## The walk

*(filled in from the run)*

## Errors seen

## What was NOT walked, and why

## The gates

## The fresh, blind Opus read

## Findings and dispositions
