# Family 2 — standby lines (SC, AVALON, BB) and standby lines that fly (W14–W26)

Rules-first review, [ENGINE-RULES-REVIEW], D1983, 11 Nov 26. Test file: `raptor-port/src/engine/rulesfirst-2-standby.test.ts`
— 15 tests, 15 passed, 0 `it.fails`; `npx tsc -b` clean. Full rows read with the shell for D1042, D1043, D1044, D1045,
D1046, D1060, D1061, D1062, D1064, D1066, D1067, D1009, D516, D1120, D605, D1041, D24, D606.

## Table

| W-id | D-numbers | verdict | where implemented (file, function) | the test | one line |
|---|---|---|---|---|---|
| W14 | D1042, D1043, D1044, D1045 (D1060 beside) | MATCHES, with one UNCLEAR part (below) | `engine/waves.ts` saTyped / saFlies / saExempt / dayCount; `events.ts` buildDay, seatIntime; `reporting.ts` scReport; `oil.ts` dayOilWork; `insights.ts` computeInsights | new: "W14 — … an SC AM SPARE on local leave: clean while it stands by; R typed, it is a flown seat …" and "W14, as built — a flying standby row is graded as an SC MAIN shift …" | R or B typed flies every row, SPARE included, on START/END, counted, earning by default, no standby carve-out; but a flying row is graded as an SC MAIN shift, not as an ordinary sortie |
| W15 | D1045, D1044, D1061 | MATCHES | `validate.ts` crew-rest collection (a shift ends at `e.e`, no debrief); `waves.ts` saFlies (`a.fly` lights its own row); `ui/interactions.ts` Flies chip toggle | new: "W15 — SC PM 13:00–19:00 flying … 07:00 report is clear …, 06:59 is a breach" and "nothing typed: a hand tick flies its own row …" | Rest runs from END exactly (equal-time edge passes, one minute in fails); a hand tick lights one row, untick returns it. The lead (amber in-time advisory on a flying SC SPARE) — verdict below: MATCHES |
| W16 | D1046 | MATCHES | `waves.ts` saFlies (`a.cx` never flies); `events.ts` (cx row skipped); `oil.ts`; `dayCount`; `ui/html.ts` saFliesHTML (no button on a typed shift) | new: "W16 — SC AM R typed, both SPAREs seated, one CX …" | CX takes his rest, OIL and count; the other SPARE still flies; clearing `fly` on a typed line changes nothing (no untick) |
| W17 | D1062, D1009 | MATCHES | `waves.ts` saSeated, dayCount; `insights.ts` (standby rows filtered by saSeated, ordinary lines not) | new: "W17 — Insights: an empty ordinary line is a sortie …"; existing `standbyflies.test.ts` "his case: R typed, both SPARE rows empty — 2 jets, not 4 (D1062)" | Empty ordinary line still one sortie and one formation (first test to name D1009); empty flying standby row nothing; a row with only its rear seat filled counts (the agent's "neither seat" reading) |
| W18 | D1067 | MATCHES | `ui/html.ts` saFliesHTML; `validate.ts` SA_FLY_NO_TIME anchored `ff:di.gi.li.to` | new: "W18 — the week draws the lit chip on an empty SPARE row of a typed shift …" | First test to name D1067. Chip size is look only, not tested |
| W19 | D1060, D1064 (D1063, D1066 beside) | MATCHES | `ui/html.ts` saFliesHTML (dashed button only when `board && ed`); desks never drawn by it | new: "W19 — off the board: nothing on a standing-by row, a read-only lit chip …"; existing `ui/standbyflies.test.tsx` SF7 "Edit Schedule's week and View-only Sched: no Flies chip at all" and SF2/SF7/SF10 | Duty desks: saFliesHTML is only reached for standalone-wave rows, so a desk can never carry it (read, not tested further) |
| W20 | D516 (narrowed by D1042) | MATCHES | `insights.ts` computeInsights (sorties only for flying standby rows); `validate.ts` workSpan via `events.ts` (SC MAIN is a `shift` event) | new: "W20 — SC AM standing by: no sortie, the MAIN's hours count, the SPARE's none; R typed …" | Standing SC MAIN 6 h of work, no sortie; SC SPARE and AVALON MAIN standing by no hours; R typed both are sorties with hours from the R |
| W21 | D1120 | MATCHES | `engine/avail.ts` standbyRow, dayStandby, dayEngaged(d, standbyFree); `ui/palette-html.ts` | new: "W21 — SC SPARE, an AVALON / BB row that does not fly and the AVALON desk read free …" | Crew list free for SC SPARE, non-flying AVALON/BB rows and the AVALON desk; the day's figures still count AVALON, BB and the desk; flying or a sim makes him tasked; SC desk tasked (reading 2) |
| W22 | none (settled Aug 26) | MATCHES | `ui/interactions.ts` the badge flip (a.spare, a.role, markEdit `fr:`, afterSchedMutate); `engine/restore.ts` dayKeys `fr:` composite; `waves.ts` saExempt | new: "W22 — an SC AM row on local leave: MAIN flags hard, flipped to SPARE it is clean — and the day's fr: key changes" | Engine reads the flip; the amendment fingerprint moves |
| W23 | none (settled 10 Aug 26); D605 beside | MATCHES | `validate.ts` the SC spare loop (`f.spareCrew`, canSpare, `noWin ? whole : day.input`); `inputs.ts` canSpare | new: "W23 — an SC SPARE with its shift times cleared: …"; existing `scrole-rules.test.ts` "local leave (LL) leaves a SPARE clean …", "overseas leave bars even the SPARE", "medically down (ATT C) bars the SPARE too" | The D605 edge (blank times): whole-day OL and ATT C flag, whole-day LL silent, part-day OL silent. A flying SPARE is "not a spare here" (covered in W14) |
| W24 | none (settled 11 Aug / 7 Sep 26); D605, D1042 beside | MATCHES | `events.ts` buildDay noconf branch (sacrew / blank); `validate.ts` the sacrew loop, the `day.blank` loop | new: "W24 — a BB SPARE with blank times: whole-day OL flags …; AVALON tonight and an 06:00 report tomorrow raises no crew rest — until the line flies"; existing `avalon-rules.test.ts`, `blankabsence.test.ts` | Pair 14: the old "blank times check nothing" holds now only for part-day absences, as D605 ruled. Standing-by AVALON → no crew rest next morning; flying → crew rest (D1042 over 7 Sep 26) |
| W25 | none (settled 13 Aug 26) | UNCLEAR | `engine/dutytpl.ts` blockFromTpl (`sa`, `noconf`); `oil.ts` dayOilWork (exemptDuty → off by default); `events.ts` standaloneHits (SC desk is an SC seat) | new, "as built": "W25 — … the AVALON desk stays exempt and off by default when its wave flies; the SC desk is an SC seat for the spare rule" | "Exempt as its wave is" was written when a standby wave never flew; today the desk stays exempt whatever its wave does |
| W26 | none (settled Aug–Sep 26) | MATCHES | `engine/wavetpl.ts` waveFromTpl (kind flags only; lines grouped into the built-in shape) | new: "W26 — an AVALON template with MAIN + SPARE lines: standalone, noconf, checked as the built-in is …"; existing `wavetpl.test.ts` "a standby template mints a standalone wave …", "a hand-built SC-shaped template reproduces the built-in structure exactly" | A template-made AVALON wave flies by an R typed exactly as the built-in |

Counts: MATCHES 12 (W14's main part counted here), UNCLEAR 2 (the W14 part, W25), STALE 0, OVERREACH 0, MISSING 0, DRIFT 0.

## The lead from family 1 — the amber in-time advisory on an SC SPARE with B typed (under W15)

**Verdict: MATCHES** (medium-high confidence). What the app does: an SC shift with its B (or R) typed flies whole
(D1044, D1045), so its SPARE row becomes a `shift` event with a report before START, and `validate.ts`'s in-time
window loop (SC_INTIME) advises on anything cutting into B→START for him as for a MAIN. The 24 Aug 26 rule ("both on a
MAIN only … AVALON and BB untouched") was written when a SPARE never flew; D1042 (19 Oct 26: "every warning an ordinary
flying line gets") and D1045 ("every row is a jet that flies — SPARE rows included — in the day's flying count and
Insights as well as crew rest and OIL") are newer and win (D90). D1044's "for a SPARE, what counting as a flight changes
is its crew rest and its OIL" is his stated purpose of the tick (his words: "the only reason why I feel spare indicates
that they are activated to fly is because of crew rest and oil earned"), not a limit — D1045 the same day widened it to
count and Insights explicitly. And the advisory cannot be dropped for flying rows as a class: a flying SC MAIN is the very
row the 24 Aug rule was made for. It was changed on purpose and is pinned: `scintime.test.ts` "no B, and the window does
not exist; a B typed opens it for a SPARE row too" (comment there: "CHANGED 19 Oct 26 ([STANDBY-FLIES], D1045)").
What is stale is TEXT, not the app: the scheduler page's settled line (§Board behaviour, "on an SC line the B box … both
on a MAIN only; … AVALON and BB untouched") and these code comments, each still true of a row that only stands by but
not of one that flies — `validate.ts` workSpan ("spares never reach the event stream at all"), the in-time window block
("a spare has no event at all"), the clash block ("SC SPARE never reaches here at all"), the two-SC-seats block ("A spare
is deliberately absent from EVD"), the front-seat block ("Spare rows never reach f.acs"); `events.ts` scSeatHit's
header ("A spare seat never becomes an event"); and `waves.ts`'s header ("Crew on any of them still count as tasked" —
also no longer true of the crew list since D1120). Suggested fix: add "(a row that only stands by)" to each.

## UNCLEAR 1 — W14: a flying standby row is graded as an SC MAIN shift, not as an ordinary flying line

- **His words:** D1042 — *"Flying count, Insights, OIL by default, Full warnings"*; the row: "with every warning an
  ordinary flying line gets". Against it: the 26 Aug 26 rule for an SC MAIN shift (`validate.ts` clash block — "you can
  still give academics to the man who is on SC": a shift against a ground or programme item is amber, not red), and
  D1044 — *"take this as a schedule that's planned"*, START and END as the line's times, not airborne times.
- **Where:** `waves.ts` saExempt (false) → `events.ts` buildDay makes the row an event of kind `shift`
  (engine-rules.md §A standby row that flies: "it is checked as an SC MAIN is"); `validate.ts` the clash loop's
  shift branch (SHIFT_SOFT) and the turn checks (`byP` skips `e.shift`).
- **The exact case:** Tuesday, SC AM 07:00–13:00, rally 06:30 typed, Split on its SPARE row (so the line flies). Split
  is also on the Ground Programme for a LECTURE 09:00–10:00. The app shows an amber "Split is on SC AM (07:00–13:00) and
  also down for LECTURE" (SHIFT_SOFT). Put Split instead on an ordinary sortie VL BFM 08:00–12:00 with the same lecture:
  red "VL BFM & LECTURE clash" (DOUBLE_BOOK). Second case: the same flying shift, then an ordinary sortie taking off
  13:30 — no tight-turn advisory (an ordinary line landing 13:00 into a 13:30 take-off would get one, 90 min needed).
- **What a scheduler sees:** a standby man who is down to fly 07:00–13:00 shows only amber for a lecture inside those
  hours, and nothing for a 30-minute turn into a sortie — where his rule's words "every warning an ordinary flying line
  gets" read as red and amber respectively.
- **Why UNCLEAR, not DRIFT:** two of his rulings meet. The flying shift is a window of being on call to fly, not
  airborne time (he declined "a take-off and landing of its own" in D1044 and accepted "no debrief added" in D1045);
  the 26 Aug "academics on SC" grading predates D1042 but was never revisited; and the build's choice ("checked as an SC
  MAIN is") was told to him only in part — D1060's three agent's calls name no brief/debrief window, not the clash
  grading or the turns. Confidence that it needs his word: medium. Settled by one question: *"A standby line that flies
  — should a lecture or a sortie inside or right after its START–END read red and tight-turn as on a flying line, or
  stay amber as an SC shift does today?"* Recommended: keep as built (a shift is not a sortie), and add the sentence to
  the page so the next reader does not take "every warning" literally.
- **Test (as built, passes):** "W14, as built — a flying standby row is graded as an SC MAIN shift … — as built: a
  lecture inside a flying SC AM shift is the amber SHIFT_SOFT, where the same lecture inside an ordinary sortie is the
  red clash; and no tight turn into a sortie after END".
- **Suggested fix if he wants the ordinary grading (not built):** in the clash loop, treat a `shift` event whose row
  `saFlies` as `fly` for grading, and let `byP` take flying standby rows into the turn checks.

## UNCLEAR 2 — W25: a desk minted from an AVALON or BB template when its wave flies

- **The rule (settled 13 Aug 26, no number):** "a template naming SC, AVALON or BB mints its desk as that wave's —
  exempt as its wave is, earning OIL as the OIL page's defaults say". Written when a standby wave never flew. Beside it:
  D1060 "duty desks never carry [the Flies chip]"; D1120's reading (2) "a duty desk minted from an AVALON or BB template
  is that standby's desk"; D1042 speaks of a *line* that flies, never of a desk.
- **Where:** `dutytpl.ts` blockFromTpl stamps `sa` + `noconf` once; `events.ts` collects an `sa:'avalon'`/`'bb'` desk
  into the standby collection whatever its wave does; `oil.ts` `dflt=!exemptDuty`.
- **The exact case:** Tuesday, AVALON NIGHT 19:00–07:00 with rally 18:30 typed (it flies), Split on its MAIN; Bane on
  the AVALON desk (SXO 19:00–07:00, from the AVALON template) and also on an ordinary sortie 20:00–21:00. The app raises
  nothing for Bane's desk-vs-sortie clash and the desk earns him no OIL by default — exactly as when AVALON stands by.
  Read literally, "exempt as its wave is" would make the desk fully checked and earning by default once the wave flies.
- **What a scheduler would see or lose:** nothing changes today; only if he reads the rule literally would a flying
  AVALON night's desk start clashing and earning. AVALON and BB fly "almost rarely to never" (his D1042 words).
- **Confidence:** low that he wants a change; the question is only whether the sentence still reads true. Recommended:
  keep as built (a desk is not a line that flies) and reword the page to "exempt as its standby is". Test (as built,
  passes): "W25 — … as built: the AVALON desk stays exempt and off by default when its wave flies; the SC desk is an SC
  seat for the spare rule".

## Pairs and later-changed entries naming my items — checked

- Pair 7 (24 Aug SC B rule, D606, D1041, D1044/D1045): the B/R on any standby line flies the shift; SC MAIN in-time
  semantics kept through scReport — the lead above; consistent.
- Pair 8 (D1041 → D1044/D1045): a rally on SC SPARE, AVALON or BB now flies the line (`seatIntime` on every standby
  kind) — MATCHES; D1041's "shown only" no longer survives anywhere in the code.
- Pair 9 (D516, D24, D1042): standing by — not flying load, OIL off by default (SPARE/AVALON/BB), SC MAIN work hours;
  flying — load and OIL on by default. W14, W20 tests. MATCHES.
- Pair 10 (D1042 vs D1045/D1060): "no debrief added" and "no brief or debrief window" are as ruled / told; the wider
  grading question is UNCLEAR 1.
- Pair 11 (D1062, D1009): W17 test. MATCHES.
- Pair 12 (D1043/D1061, D1046): a hand tick comes off with a second tap (W15), a typed line only by CX (W16). MATCHES.
- Pair 14 (D605 vs "blank times check nothing"): W24 test — the standby crew list's own disagreement was filed by D605
  as `[BLANK-STANDBY-STRIKE]`, outside this family.
- Pair 35/36 (D24 and D1042 — two doors to credit an activated standby seat): both work — OIL Earn's switch still
  offered on a standing-by row (D24), the Flies tick turns its default on (D1042); belongs to the OIL families.
- Later changed: D24 (by D1042), D516 (by D1042), D1041 (by D1044, D1045), D1043 (by D1044), D1060 (by D1064, D1066) —
  each change is what the code does; no earlier reading survives in the code (only in the comments and the page line
  named above).

## Outside my family — noticed, not reviewed (one line each)

- D33 (placeholders refused on flying lines only): whether a standby row that FLIES is a "flying line" for the ALL /
  ALL AVAIL refusal is not stated; `saSeated` counts a placeholder as seated (D1062's agent's reading).
- `ui/interactions.ts` the MAIN/SPARE flip writes `a.spare` / `a.role` straight on the row, then `markEdit` +
  `afterSchedMutate` — not through the command layer the project guide says every week change must run in to be saved
  ("Since 30 Sep 26 a change to a WEEK … is saved only by the command it runs in"); worth one check that a flip survives
  a reload (the Flies chip handler may share the shape).
- `waves.ts` dayCount: when a typed shift's MAIN rows are empty they leave both the flying term and the standby figure
  after the slash — an SC AM with R typed and nobody seated reads as if the shift did not exist; not ruled either way.
- The scheduler page's settled B-box line ("both on a MAIN only … AVALON and BB untouched") is stale beside D1044/D1045
  — a document fix, filed for the page's owner.
