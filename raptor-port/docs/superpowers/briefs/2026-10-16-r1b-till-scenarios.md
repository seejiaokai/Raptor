# Round 1b + the till date — the scenario designer's report (16–17 Oct 26, the night run)

A fresh Opus helper that did not write the change, read-only, asked what is MISSING in the running app (bug-check order
§4, §8.5; D790, D903 — no Fable). Saved whole the moment it arrived; what was done about each point is in the evidence
sheet `raptor-port/docs/handpass/2026-10-17-r1b-till.md`.

## (1) Roll-call (as reported)
- Week Personal Inputs / Unavailable rows (`ui/html.ts inpRmkCell`): has it — box typed words, grey date after; read-only prints remark + till; a guest's medical row stays blank (hideMed).
- Board Personal Inputs / Unavailable (`ui/board-html.ts sbiRmk` + the sbInpRow box; `board.ts` back/Tab): has it.
- Ground Programme row made from an input (`engine/overlay.ts requestRowFields` → `ui/reqrow.ts`): has it.
- Input window, all doors (`inputedit.tsx` draftOf, the inped-till tag, commitInputEdit, setInpField): has it.
- Desktop Inputs list (`InputsPage.tsx`): has it, but see C.
- Input card (calendar day, phone list — `inputcard-model`): typed only (D728). Has it.
- Medical page cards, document viewer: typed only. Has it.
- Amendments panel / ⓘ (`pendlist`), published compare (`inpDetailKey`): has it.
- History (`changelines`), bell (`notices`): compare typed words. Has it.
- Leave War: DayList, RemarksSheet, sync on approve/extend/cut: has it.
- SANS cards (`html.ts`, `palette-html`, `SansDay`): untouched, must not change. Correct.
- MISSED (raw remark, no date): warning-list reasons (`engine/validate.ts` 866, 922, 932, 964, 1288 via `events.ts`); the
  unavailable reason in the crew picker (`engine/inputs.ts offWord` → `avail.ts`, `palette-html.ts`); Inputs page search
  (`inputscal-model.ts:123`) and Remarks sort (`InputsPage.tsx:137`). Intended, or route through remarksShown.
- The button (`html.ts accCtl`), the phone line-up (board `accup`; week CSS), the Ground Programme line (week `html.ts`
  when `ed`; board `board-html.ts` when `!ro`), the wave header (`board.ts`, `html.ts refreshWaveReports`).

## (2) Scenarios to drive
1. Inputs calendar: pick 14 Jul, new input — grey "till 14 Jul" before any tap; pick 14–17 → "till 17 Jul"; type "Las Vegas", save; List "Las Vegas till 17 Jul"; the day's card "Las Vegas", date only in its corner.
2. A leave with remark "Wedding on 12 Aug" (10–14 Aug); another "Instructing on 2 BFM" / "Course on 1 day" — typed words must survive (fault A predicted).
3. SANS availability with remark "Avail till 20 Jul only": save, reopen, change a letter, save — remark survives whole (fault B).
4. A new input with no typed remark → desktop List: "till 17 Jul" with a gap before "By <name>" (fault C).
5. Board Ground Programme with an accepted input: line shows, Reject below. Publish, then delete the input or the person — the kept row stays; does the line promise a Reject that is not there? (fault D)
6. Published Mon–Fri leave; stretch to Sat — each published day "1 pending", Amendments "till Fri → till Sat"; top-bar Undo clears it.
7. Same leave, move only its START earlier — covered published days NOT pending.
8. Leave War: approve a 3-day leave with a note → "note till <last>"; approve the adjoining day (extend) → one record, date moves; a medical in the middle → two pieces, each its own till, published days pending.
9. Ground Programme row box (week and board): words added before "till" save to the input; typing over the date → no change, box back to the real date; Tab through unchanged → no history line.
10. Personal Inputs remark box: type, Escape → typed words only, grey date intact.
11. Board "+ Add" under Unavailable, 13–15: "till 15 Jul" at once; save; row box + grey date; re-pick 13–16 → date follows, words kept.
12. One-day input "till <that day>" everywhere; a 1-hour Meeting via the board's "+ Inputs" reads "Flight safety brief till 23 Jul" on the Ground Programme — confirm he wants that there.
13. A shared input of 3: one remark, one date, one row; sick leave cuts one man out — published counts as before.
14. Upchit trims a downchit — the downchit prints its new till; the upchit card its words as typed.
15. Member vs admin (and a guest for medical rows): the line and Reject only where the person can edit; View-only Sched "remark till date" frozen at publish.
16. Phone 360/375/390/430 and the iPhone font: board one-puck Reject on the puck's line; two-puck rows and "Reject · Tue" their own line; week under the name; desktop unchanged.
17. Reject (both forms) takes the row off; Accept comes back; top-bar Undo puts it back; hover says what it does.
18. Wave header, board and week, phone and desktop: no "In-time / Rally", no gap or overflow, controls work.
19. An input whose Ground Programme row is on another week (Sun–Mon): week 2 still says where; the line right on both weeks.
20. Edit a remark, change the dates, Undo twice — history reads typed words, the date line said once.

## (3) Where it looks wrong or incomplete
- **A.** `remarksTyped`'s pattern matches "till|on + number + any 3 letters" anywhere and runs on every save and print: "on 12 Aug", "on 2 BFM", "on 1 day", "till 6 ACs" erased. Fix: a real month name only; be narrow about "on".
- **B.** `remarksTyped` ignores the type while remarksShown/tillOf exempt SANS and upchit: a SANS/upchit remark with "till 20 Jul" loses the words in the window and boxes, and on the next save. Fix: type-aware.
- **C.** `InputsPage.tsx:840` decides "By …" spacing from the raw remark: with nothing typed, "till 17 Jul" and "By Viper" run together. Fix: remarksShown.
- **D.** The Ground Programme line tests `x.src` (board-html.ts, html.ts): a dead kept row, or a row whose input is gone or protected, still carries its source and the line points to a Reject that is not there. Fix: a standing row (`requestOfBox(d,x)`).
- **E.** Warning reasons and offWord no longer show how long the leave runs — a decision or a fix, not silent drift.
