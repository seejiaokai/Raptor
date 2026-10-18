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

The host alone, `scripts/handpass/three1018-walk.mjs` v4, on the built app frozen at `46a19182a` (served on 4208, its bundle
name checked against the build's). **58 / 58 PASS**, no console error, page error or 4xx/5xx. Pictures
`docs/img/handpass/2026-10-18-three-small-jobs/` (29), every one cited below opened by the host.

| Step | Result | Seen |
|---|---|---|
| L admin 390, 430 | PASS | "⇅" and "◷ OIL"; the head one line with − and + (button middles within 1px); grid padding 10px (01, 02) |
| L admin 431, 440, 600, 700 | PASS | the short words; one line; the grid's padding 20px — the wider screens', unchanged (03–06); at 440, 22 rows of names on screen |
| L admin 701, 1440 | PASS | "⇅ Rearrange", "◷ OIL tracker" — and still one line with − and + (07, 08) |
| L member 440, 701 | PASS | Manning · ◷ OIL · − · + at 440; "◷ OIL tracker" at 701; one line (09, 10) |
| E0–E1 | PASS | "Every Thursday" → From → the calendar; the title opens the month and year lists (11) |
| E2 | PASS | the first Escape shuts only the lists; the calendar and the window stay; the keyboard on the title (12) |
| E3 | PASS | the second Escape closes the calendar; the keyboard back on the From box; the window stays (13) |
| E4 | PASS | the third closes "Every Thursday"; the Calendar window behind stays (14) |
| E5 | PASS | lists shut by the title first: one Escape then closes the calendar |
| U0 | PASS | Warden: ATT C Mon 19 – Fri 23 Oct filed, the upchit Wed 21 cuts it to Mon–Tue (15) |
| U1 | PASS | the window's Delete puts up the upchit sheet: "DELETING THIS UPCHIT WILL — ATT C Oct 19 – Oct 20 → now ends Oct 23, its days given back", no fit line, a red "Delete upchit"; nothing changed while it asks; Cancel leaves both and the window open (16, 17) |
| U2 | PASS | "Delete upchit": the upchit gone, ATT C Mon–Fri, the window and the sheet gone (18) |
| U3 | PASS | Undo once: the upchit back, the ATT C cut again; Redo: deleted again (19, 20) |
| U4 | PASS | the Delete key on the upchit's line in the opened day: the same sheet, no one-line question; deleted, the day stays open (21, 22) |
| U5 | PASS | Piston's ATT C shortened by hand (it forgets its first end): the upchit's Delete goes at once, no sheet (D792); a downchit's Delete key still asks its one-line question (23, 24) |
| U6 | PASS | the phone 390 by touch: the sheet at x 22–368, y 318–526, its words whole, a finger on "Delete upchit" meets it; deleted by a tap (25, 26) |
| U7 | PASS | after a reload Warden still reads ATT C Mon–Fri; Saturday 18 Jul published through the board's own sign-offs and Publish (ORIG); Saber (nothing on file that week) ATT C Thu 16 – Sat 18, the upchit Fri 17 cuts it to Thu: the published Saturday's heading reads nothing waiting ("… ORIG … 7 changes i Unpublish"); the delete's sheet says "ATT C Jul 16 → now ends Jul 18"; after it the heading reads "ORIG Not yet signed … 1 pending … Publish AL1" (27–29) — D178, D103 |

**The script's own mistakes, met and fixed before the final run** (walk-scripts §7): v1 judged "one line" by the buttons'
tops (a pixel apart between buttons a hair apart in height — 11 false FAILs) and read the sheet's heading in mixed case (it
is drawn in capitals — 2); v2 took Grit for the published-day step, who has the demo's own ATT C 13–17 Jul, so the second
ATT C was refused as an overlap and the step measured the demo's row (the give-back rightly stopped at that row's own first
end, 17 Jul); v3 read the waiting change from a store probe that does not count input changes — the heading on screen does.
None was a fault of the app.

**Orders walked:** delete then Undo then Redo; Cancel then delete; a reload after; publish, then file, then delete
(the after-publish order); the window door and the Delete-key door; a mouse and a finger.

## Errors seen

None on any page of the walk.

## What was NOT walked, and why

- The other date boxes' floating calendars (Admin → Data, a new person's Post in, the upchit's date, the Leave War's
  posting dates, the Tracker's eight) — one component draws them all (`DateBox`); its test `datebox.test.tsx` pins the
  order with and without a window behind; walked on "Every Thursday".
- Escape on a phone — a phone has no Escape key.
- The give-back's limits other than the first end (an OML or another upchit in the gap, another man's upchit) — the same
  route on screen as U1/U2, carried by `medwrite.test.ts` "D1022" (the real writer, read back from the store).
- A locked (quarantined) week — no control makes one; carried by `medwrite.test.ts` "a give-back that would reach a locked
  week is refused whole" (the real `removeInput`).

## Break tests

`scripts/handpass/breaks/three1018.json` — **10 of 10 caught** (the floating calendar's Escape; the give-back not applied,
past a medical in the gap, past the first end, onto a locked week; the window's ask; the Delete key's ask; the sheet's
words and fit line; the day sheet's Save). Break 4 was first written as a line that decides nothing (a huge limit in place
of none) and stayed green — re-aimed at the first-end limit, caught. And in the real browser: the card's rule put back to
430, `e2e/leavewar.spec.ts` "the top of the Leave War on a phone…" went red at 440, then the rule restored.

## The gates

The whole set under the PC lock, one run at `46f84f8c1`: build clean · tfin 728 / 0 · unit 11748 / 11748 (660 files) ·
smoke 453 / 0 · rulecheck OK · docsize OK. **The browser tests of that run do not count:** a preview left running on 4173 by
an older chat (`trk-chart-fps-8028f8`) was reused by the test runner, so they measured that chat's old build (7 failed —
the same 7 on `main`'s copy); a re-run on 4191 met another old preview there (29 failed, an old build again). Filed as
[GATELOCK-STALE-PORT]. **On a port checked free first (4207):** 852 passed, 1 failed, 59 skipped — the failure this job's own
new assertion (the card's buttons "on one line" judged by their tops, a pixel apart); judged by their middles, that file
1 / 1. Added after the run: one unit test (`medwrite.test.ts`, a locked week — the file 53 / 53).

## The fresh, blind Opus read

## Findings and dispositions
