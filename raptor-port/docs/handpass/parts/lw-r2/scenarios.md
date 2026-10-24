# Round 2's check — the independent scenario designer's report (24 Oct 26)

A fresh Opus helper that did not build round 2, read-only, asked what is MISSING (the order's §4, §8). Its list as handed
back, condensed only in wording; each gap was found by reading code, none checked in the app. Dispositions: the sheet.

## The gaps it suspects most

1. **A day outside a man's time in the squadron is not skipped** — the design note's reading 1 says "skipped and said";
   `fileStraight` checks only that a war holds the date and `canEditRow`, `doorFile` only the locked week; nothing asks
   `inSquadron`. *(Host: the store's own leave rule `leaveDateOk` lets leave be dated there too — owner answer C, 20 Sep 26;
   reading 1 to be corrected to match, or the skip built.)*
2. **`doorFile` checks nothing already on the day:** a second OD on a day holding one; UNA over approved leave or a medical
   (the leave still charged, no "!" — `forbiddenPair` has no away-duty pair); and it never joins the same kind on the next
   day as `doorApprove` does (Monday then Tuesday = two inputs).
3. **No OIL question when filed from the war** — `askOilIfPending` / OilConfirm never called; D804 "asked … wherever it is
   filed", D660 the filer answers at the save. A weekend OD or UNA goes to the man's bell and the "OIL?" tag instead.
4. **The till tick saved unlike the window showed** — the window shows the leave's default (ticked); a one-day OD / CSE /
   UNA defaults to unticked (`tillDefault`, the duty group and one day); `wordsOf` sends only `till:false`, so a tick left
   on is saved off.
5. **The tap path and the drag path differ:** the three buttons are absent from the day's list (two entries), a member's
   remarks window on his approved leave, the Inputs-page entry's window and his award window — yet a drag over that same
   one day opens the drag window, which has them.
6. **The free-half window files a whole day** — it offers PM only (AM held by an Inputs-page leave), yet a tap files a
   whole-day OD over the morning.
7. **On the Inputs page a member may file UNA, OD or CSE for another man** (and for several) while the members' switch is
   on (`memberFilesForOthers`) — on the war D1318 holds him to his own row.
8. **The Logic page never names UNA** — `logic-html.ts` hand-writes three lines: INPUT_FLY names "overseas duty", SC SPARE
   "(OL, OD)", LATE "Downchits never do".
9. **Filing gives no manning warning** — no bubble, no Manning rows opened, though it lowers manning as a bid does
   (D1272, D1274 name bids only).
10. **Readings to show him, not defects:** UNA asks the OIL question on a weekend (OIL Earn mode on the board's Unavailable
    row too); UNA bears crew rest when it has hours (`restsInput`); a new UNA on the Inputs page starts with hours, not All
    day (`defaultAllday`); the Undo words call it "an absence" where everything else says "Unavailable".

## Its scenarios (demo world, today Sat 24 Oct 26; admin `ad`, member `us` = Ranger; 402 × 874 by touch, 1440 × 900)

- **S1** admin, desktop: Drifter 2–6 Nov, Remarks, till unticked, a PDF, a range, OD → five slate boxes with the edge; one
  OD on the Inputs list with the remark, no till, the PDF; one slate bar; the schedule's Unavailable and the palette's
  reason; Available P down on each weekday; the changes window's line; Drifter's bell.
- **S2** phone: a one-day CSE with the till left ticked → saved ticked (gap 4).
- **S3** member, phone: "Family emergency" typed, keyboard up, UNA tapped once → filed with the words, the cyan tap mark
  gone (D1289), a picture after the tap; the day then opens the Inputs-page window (no way to the Inputs page there).
- **S4** member, phone: 23 Oct and 22 Oct (before his today) → both filed through the closed window; CSE wears LATE, UNA
  not; the Inputs page lets him do the same; on a published week a pending change.
- **S5** member, desktop: a closed day with his pending LL; words typed into the bid's Remarks; OD → the words stay on the
  bid; LL and OD side by side (D1167); the day's list keeps Delete on the bid; manning counts him once.
- **S6** admin: a drag of 3 men × Mon–Fri over an approved leave, an Inputs-page OD and a pending bid; UNA → his call
  (gap 2); one Undo takes all.
- **S7** admin: OD on Tue, then a drag Mon–Wed and OD again → one OD a day, ideally one input (gap 2); a fast double tap
  on OD files once.
- **S8** admin: Slipway posted out from 9 Nov; a drag 5–12 Nov, OD → 9–12 Nov skipped and said (gap 1); the posted-out
  window's "place leave or OIL here instead".
- **S9** admin: a drag Fri 6 – Mon 9 Nov, OD (then UNA on a holiday, an Off day) → the OIL question at once for the
  weekend; an Off day asks nothing (D21) (gap 3).
- **S10** admin: a free half (LL AM from the Inputs page), OD → a PM OD, or a refusal naming the morning (gap 6).
- **S11** phone: Duration AM, then CSE → whole day, as reading 2 says; a picture for him.
- **S12** the tap path versus the drag path on one day of each kind (gap 5) — pictures.
- **S13** admin: UNA on Ranger 2 Dec; the grid scrolled to February; Undo, Redo — from the Leave War and from the Inputs
  page's top bar; the bell line goes with the Undo; the Undo words name the kind.
- **S14** member: Undo and Redo of his own past-day OD.
- **S15** admin: a published day, a man seated on a flying line; UNA then OD from the war → red puck, the warning names
  UNA, under Unavailable, pending count up; View-only unchanged until the AL; LATE on the OD only.
- **S16** the board: Unavailable "+ Add" offers UNA; UNA man on SC SPARE warns; ALL AVAIL's crowd leaves him out; OIL Earn
  mode on his UNA row; "unavailable (UNA)" under the "Unavailable" heading.
- **S17** a day where Available P = Required P; UNA on a pilot → red, "n red ›" up, the day panel's Away line in teal, the
  SANS calendar's need up; the next bid window's day line (gap 9).
- **S18** member, phone: the Inputs page's "+ Input" lists UNA after OD; its start (hours, not All day); 3 days All day →
  teal on the war; retype to Other and back; the family filter; the bar's words readable.
- **S19** member: UNA for Pike on the Inputs page, and for himself and Pike (gap 7) — his call.
- **S20** phone: the colours side by side, on his own row's cyan lines, in the drag wash, under the tap mark, in the green
  outline, at zoom 0.4, the edge on teal, the Legend line at 402.
- **S21** member, phone: a day near the foot of the screen — the window one row taller still leaves the day in view
  (D1290); a hold-and-drag then UNA, a picture after the tap.
- **S22** admin: approving a bid on a day that holds an OD — `doorApprove` lets leave and an OD stand together; his call.
- **S23** member: My leave, the person window, Balances and Approvals unchanged by an OD or UNA — never charged.

## Roll-call additions it names

The three buttons absent from the day's list, the remarks window, the Inputs-page window and the award window (gap 5);
that window has no way to the Inputs page and shows no remarks; the Logic page (gap 8); the board's Unavailable "+ Add"
now offers UNA; the OIL question not wired from the war (gap 3); the notifications register has no line on whether an
admin filing for a member tells him (D1151); the Inputs calendar's legend still reads "absence red / duty amber" (older,
not round 2's); the Undo words.
