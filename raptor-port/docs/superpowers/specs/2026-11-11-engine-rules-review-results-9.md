# Family 9 — OIL: which seats and which people earn (W88–W96) — results

Rules-first review ([ENGINE-RULES-REVIEW], D1983), 11 Nov 26. OIL is leave earned for working an off day — time off banked,
never pay. Test file: `raptor-port/src/engine/rulesfirst-9-oil-earners.test.ts` — 9 passed, 2 `it.fails` (11). `npx tsc -b`
clean. Every full row read (D28, D31, D49, D43, D755, D776, D15, D24, D35, D1042–D1046, D1061, D32, D470, D52, D804, D1,
D1783, D26, D54; D18, D46, D299, D327 beside them).

| W-id | D-numbers | verdict | where implemented | the test | one line |
|---|---|---|---|---|---|
| W88 | D28, D31, D49 (D43, D755, D776) | MATCHES (+ UNCLEAR 9.U1) | `engine/oil.ts` dayOilWork (`w2`, `reach`, the `cx`/`info` skips), oilCapableItems, dayOilBlind; `engine/oilev.ts` earnsFrom; `ui/oilmode.ts` oilItemCellHTML, inertWhy, inertSays, toggleOilItem/Person | new: "a Saturday with all four kinds of "nothing to measure" beside an ordinary desk…"; and "as built (9.U1): an SC AM shift flying on its R 06:00, START and END both typed 08:00…". D49's flying-line case: `rulesfirst-8-oil-hours.test.ts` W81 | No times, zero length, cancelled and ⓘ offer no switch and each man's tap says why (D1783's words); every measured seat switchable both ways. |
| W89 | D15, D24, D43 (+10 beside) | MATCHES | `engine/oil.ts` dayOilWork (`dflt`, `exemptDuty = saExemptKind(dw.sa)`), `engine/waves.ts` SAWAVE (`bb.all = true`) | new: "one man on each of the eleven…" | All eleven "on" seats credit with no decision written; ⓘ and a BB desk do not; a man on two earning rows is one day, once (Leave War one FO). |
| W90 | D24, D35 (+7 beside) | MATCHES | `engine/oil.ts` dayOilWork (`exemptWave`, `f.spare/ac.spare`, `exemptDuty`); `engine/dutytpl.ts` blockFromTpl (stamps `sa`); `ui/oilmode.ts` toggleOilItem (unset→1 on an off/mixed item) | new: "each of the five off by default with its switch…" (also `oilexempt.test.ts` §D35) | SC SPARE, AVALON line, BB line, minted and hand-built AVALON desk all off with the switch; switched on each credits; on a published day the switch reads one pending change and pays only once the amendment goes out. |
| W91 | D1042, D1044, D1045, D1046, D1061 | MATCHES | `engine/waves.ts` saFlies/saAnyFlies; `engine/oil.ts` dayOilWork (`flies`, `seatWin`, `ac.cx`) | new: "a BB shift 08:00–15:00 with its B typed 07:00…"; also `oilscintime.test.ts` (SC, cancelled row), `standbyflies.test.ts` SF6, `rulesfirst-8` W80 | Every row incl. SPARE from B to END, no debrief; a CX'd row nothing; a hand tick lights one row only. |
| W92 | D32, D43 (+ D24, D755, D776…) | MATCHES | `engine/oil.ts` putAny/putWho (crowd inherits the seat's `dflt`), flying-branch bare `put`; `engine/oilev.ts` oilEvidenceNow (`sent`) | new: "ALL AVAIL on a Standard desk…"; cockpit refusal: `oilseat-refusal.test.ts`, `rulesfirst-5` W54; input rows: `oilplaceholderclaim.test.ts` | Crowd on by default where a named man is, off on an AVALON desk until switched; desk, sim passenger, Common Programme extras and ground row each offer the switch. ("until the line actually flies" for an AVALON desk — already an open question, not re-raised.) |
| W93 | D470 (D755, D776) | MATCHES | `engine/oilev.ts` oilEarnedWork (claimPeople, earnsFrom), legacyEarned/landedExtras for frozen days | existing, `engine/oilnamebox.test.ts`: "the first to join stands in the box…", "A MAN OFF THE ROW IS OUT OF THE INPUT…", "the man in the box can be taken off alone…", "…and switched ON alone over the input's No", "a request that never asks (Personal) earns nobody anything, whoever is in its box" | Replaced or joined, follows the one answer, either tapped off, Personal earns nobody — all pinned. |
| W94 | D52 | MATCHES | `engine/oil.ts` dayOilWork (a named man of any kind via `put`); `leavewar/sync.ts` availableFor via HOOKS.oilSentinel (aircrew only); `ui/peoplepick-model.ts` pickRoster | new: "Ratchet (ground crew) named on Saturday's SDO desk earns a full day…" (first test naming D52's OIL half) | Named ground crewman earns FO; ALL AVAIL's crowd has no ground crew; crowd earns until the desk is switched off. |
| W95 | D804 (D803) | MATCHES | `engine/inputs.ts` restsInput/oilAsks; `engine/oilev.ts` landedStanding (`acc 'u'` → 'unlanded', answered on its own Yes) | new: "the OIL question is asked of exactly those nine kinds…"; Unavailable: existing `oilev.test.ts` "D760 — a CANCELLED request filed under Unavailable earns nothing; the same request not cancelled earns on its answer" | Exactly Training, CSE, Meeting, Attach, Appointment, Duty, Event, OD, Other ask; filed under Unavailable it earns on its Yes. (The page still says "Fly with" — renamed Attach, D1373; a rulings-page word, not the app.) |
| W96 | D1, D1783 (D26) | MATCHES | `ui/oilmode.ts` oilFigureFor (withholds the figure unless an earned span carries the item), inertSays | new: "Ranger on a Saturday desk, an ⓘ ground row and an AVALON line left off…"; also `ui/oilmode.test.tsx` | The figure shows on the desk only; the ⓘ row's tap reads "Nothing changed for Ranger. This row gives him no working hours to count OIL from." The ALL AVAIL count chip was not re-tested. |

Findings beside the items (words on screen that carry these rules, D932):

| id | items | kind | where | the test |
|---|---|---|---|---|
| 9.1 | W88, W93 | DRIFT | `ui/logic-html.ts` the OIL check's "How it works", 4th line | `it.fails` "Ranger files an all-day Training for Saturday…" |
| 9.2 | W90 (D24, D35) | DRIFT | `ui/DutyTplModal.tsx` WAVE_NOTE.avalon and .bb | `it.fails` "the AVALON template's note does not say the desk "earns no OIL"…" |

## Finding 9.1 — DRIFT: the Logic page says a row with no times earns nothing; a request's row with no times earns

- **The rule's words:** D31 — the boundary is "a seat with nothing to measure — no times…"; D470/D755 — a man on a request's
  row "follows its OIL answer"; D932 — every Logic line is correct for whatever the settings are, of a real case.
- **Where:** the Logic page, check "Weekend and holiday work earns OIL", How it works: *"A row with no times, or no end time,
  earns nothing."* (`ui/logic-html.ts`, the `oil` item).
- **The exact case:** Ranger files a Training for Saturday 18 Jul, All day ticked, and answers Yes to the OIL question. A
  scheduler accepts it; it lands on the Ground Programme as a row whose start and end boxes are blank (an all-day request's
  row carries no times). The day is published. Ranger is credited a full day (FO) — the request's own window counts
  (`oilnamebox.test.ts` pins this as intended). The Logic page tells a reader that this very row "earns nothing".
- **What a person meets:** a scheduler or member reading Logic to check whether an all-day Training on a weekend earns would
  conclude it does not, or would type times into the row "to make it earn" — which changes the request itself for everyone
  on it (D739). The next line ("A Duty & commitments input earns once its OIL question is answered yes") contradicts it for
  the same row.
- **Confidence:** medium — the line is true of duty desks, sims, the Common Programme, flying lines and an ALL AVAIL row with
  no end; it is untrue only of an accepted request's row. Settled by him saying whether the line is meant to cover request
  rows.
- **Red line seen:** `"says": true` where `false` was asserted, with `earns: "FO"` and the row's times `["", ""]`.
- **Suggested fix (not built):** narrow the line — "A row the scheduler adds with no times, or no end time, earns nothing; a
  request answered yes earns over its own times." — or move the request case into the next line.

## Finding 9.2 — DRIFT: the duty-template sheet says an AVALON (or BB) desk "earns no OIL"

- **The rule's words:** D24 — "SC SPARE, AVALON flying lines, AVALON duty desks and BB flying lines must OFFER the OIL switch in
  the mode, defaulting to OFF, so that when one of them is actually activated the admin can credit it"; D35 — "the SWITCH
  reaches the template-minted block too … the same seat, two answers" is what it prevents. A BB desk is the same (off by
  default — D15 — and switchable as built).
- **Where:** `ui/DutyTplModal.tsx` WAVE_NOTE — shown under "For wave" in the duty-template sheet (+ Block's gear): AVALON *"The
  AVALON desk — checked only for overseas or medically down (ATT B may still man it), and earns no OIL on a weekend or
  holiday."*; BB the same.
- **The exact case:** Saturday 18 Jul. A scheduler places a block from the AVALON template, puts Drifter on its SXO row
  19:00–07:00, and the AVALON is activated that night. In OIL Earn the admin taps the desk on; Drifter is credited a full day
  (FO) — as D24/D35 rule. The sheet the block was made from says that desk "earns no OIL on a weekend or holiday".
- **What a person meets:** an admin who reads the template note believes an activated AVALON or BB desk can never be
  credited, so never looks for the switch — the man's OIL is quietly lost (D24's whole reason was that "the admin can just
  easily click credit OIL").
- **Confidence:** high on the words; the note is a template-picker line, not the Logic page, but it states the OIL rule itself.
  Settled by him confirming D24/D35 still stand (nothing later narrows them for a desk).
- **Red line seen:** `"saysNever": true` where `false` was asserted, with `earns: "FO"`.
- **Suggested fix (not built):** "…and earns no OIL by default on a weekend or holiday — switch it on in OIL Earn when it was
  worked." (D928: a kind's note has one source — change it there.)

## UNCLEAR 9.U1 — a flying standby shift typed with START = END

- **The rulings:** D49 (22 Sep 26) — "a flying line whose written take-off and landing are the same still earns. The man
  reported and debriefed"; D1042 (19 Oct 26) — a standby line that flies "counts as a real flight … with every warning an
  ordinary flying line gets"; D1044 — it flies "using the line's planned START and END"; D1045 — no debrief. The code
  (`oil.ts` dayOilBlind, comment of 22 Sep 26) decided D49 "never reached" a shift — written before D1042.
- **The case, as built (pinned "as built" test):** an SC AM shift, Ranger on MAIN, START and END both typed 08:00, R typed
  06:00 (so the shift flies). Ranger earns nothing; the day shows the red "the SC shift has no usable times — nobody on it
  earns OIL". A flying line typed 08:00–08:00 would earn half a day and get only an amber "times look wrong".
- **His question:** is a flying standby shift with START = END "a flying line with the same take-off and landing" (earns, from
  its R or B), or "zero length" (earns nothing until fixed)? A man who reported at 06:00 and flew would lose his day until
  someone corrects the times.

## Doubts (tried, not findings)

- W88's row line: an item that cannot earn reads "Nothing on this row can earn OIL, so there is nothing to switch off" — it does
  not name which of the four reasons. Each man's puck does (D1783's ruled sentence), and the behaviour register files D31 as
  held; an empty cancelled or ⓘ row is the only place the reason is not said. Not raised.
- The Logic line "A Duty & commitments input earns once its OIL question is answered yes" — the "Duty & other commitments" group
  holds Personal and SANS availability, which are never asked; the sentence is conditional, so not untrue. Not raised.
- D54 (an issued weekend with a placeholder on a desk, sim or extras line reads pending once [OIL-SEATS-CAN-EARN] shipped) is
  stored-data only (D56) — not a finding.

## Noticed outside the family (not reviewed)

- An archived man's own OIL on a published day after his archive (People & accounts, D299/D321/D327) was not tested here.
- The ALL AVAIL count chip's agreement with the green bar (D1, O-3) is held by `ui/oilmode.test.tsx`; not re-tested.
