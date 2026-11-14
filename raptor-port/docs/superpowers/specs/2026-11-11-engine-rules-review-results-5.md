# Family 5 — Seats, crew pairing, qualifications and placeholders (W54–W61)

Rules-first review, 11 Nov 26 ([ENGINE-RULES-REVIEW], D1983). Test file:
`raptor-port/src/engine/rulesfirst-5-seats-quals.test.ts` — 14 passed, 2 `it.fails` (both seen red as plain `it`
first). `npx tsc -b` clean. Full rows read for D33, D47, D43, D755, D776, D271, D276, D278, D1099, D1100, D1101, D519,
D185, D188, D52, D36, D479; engine-rules §The CAT ladder (751), §AAR (830), §A standby row that flies (888), §Personnel
(1226), §Double bookings (1676).

| W-id | D-numbers | verdict | where implemented (file, function) | the test (new title, or existing file and title) | one line |
|---|---|---|---|---|---|
| W54 | D33, D47 (beside: D43, D755, D776) | MATCHES | `engine/slots.ts sentinelSeatOK` (by key grammar: no prefix = flying seat), belts in `setSlotVal` / `fillSlot`; `engine/avail.ts slotBarNow` (SENTINEL_JET_BAR); doors `ui/drag.ts applyDrop`, `state/view.ts placeArmed`; OIL belt `engine/oil.ts` flying branch | new: "every standby kind — SC MAIN and SPARE, AVALON, BB — refuses ALL and ALL AVAIL in both seats, a row that FLIES too…" and "lands on a ground row and its extras, the Common Programme, a sim's own seats…"; existing: `engine/oilseat-refusal.test.ts`, `ui/oilseat-refusal.test.tsx` (the armed and drag doors, the swap refused whole) | Refused on both seats of every flying line whatever the wave, a standby row that flies included (the standby family's open note: yes, covered — the test is by key grammar, so a row's flying state cannot slip past); lands and stays silent everywhere else. |
| W55 | D276, D271 (D278) | MATCHES | `engine/avail.ts rowTwice` (a flying key lists no row places), `engine/slots.ts fillSlot` belt; DOUBLE_BOOK in `engine/validate.ts` | new: "both seats of one jet: every engine door lets him in, and the list raises the red DOUBLE_BOOK; the same man twice on a ground row is refused"; existing: `engine/audit-c-clash.test.ts` "FCP and RCP of the SAME jet — hard…", `ui/rowtwice-refusal.test.tsx` | Both seats of one jet (and of an SC SPARE row) plant and raise the red "two events at once"; a ground row refuses a second copy; ALL AVAIL may stand twice. |
| W56 | D1099 (D1100, D1101) | MISSING (expected — not built, filed [SINGLE-SEAT]; no `it.fails`, see below) | nowhere; the back-seat readers are listed in `docs/superpowers/specs/2026-10-21-single-seat-check.md` | new, "as built": "the front seat alone is checked as a two-seat jet with an empty back seat…" | A front-seat-only line gets every per-person check; what changes for a single-seat jet is his to design, so there is no ruled behaviour to assert yet. |
| W57 | D519 | MATCHES | nowhere draws it: the week and board builders (`ui/html.ts`, `ui/board-html.ts`) never read a role answer; only `engine/insights.ts` and the question (`ui/mission-role-offer.ts`, `ui/board.ts` access) do | new: "a formation answered RED draws byte-for-byte as it did unanswered — the role lives in Insights only" | No red mark on a line. |
| W58 | none (5 Aug, 7 Sep 26); D185, D188 | MATCHES | `engine/validate.ts` (the matrix, the personnel lines, QUAL, OCU_NO_IP, NO_IR — `f.acs` loop), `LIVE_ON_FACE`; `engine/avail.ts slotBarNow` | new: "the matrix as the table says, an instructor in either seat clears it…" and "the published face: QUAL, SC_QUAL, AAR_QUAL, AAR_INSTR live; the crew-pairing codes frozen"; existing: `ruleflex.test.ts`, `validate.test.ts`, `official-flags.test.ts` | Every pairing cell, the instructor clearance, the rear-seat freedom and the live/frozen split behave as stated; the Logic lines for these codes are true. |
| W59 | none (10 Aug 26); D185, D188 | MATCHES for the rules; DRIFT on one Logic line (finding 5.1) | `engine/people.ts aarNeed / aarOK / aarInstrOK / scShiftKind / scQualOK`; `engine/validate.ts` AAR block in `f.acs`, SC_QUAL by formation (`f.sc`) and the `sacrew` loop; `ui/logic-html.ts` 'aarinstr' | new: "not current: an IP behind holding I clears it…", "SC currency is asked on every seat of an SC shift, MAIN and SPARE, and on a flying AVALON row; a quals edit after seating shows at once"; `it.fails` "D932: the AAR_INSTR Logic line is true for an instructor WSO behind…"; existing: `aar.test.ts`, `aarinstr.test.ts`, `ruleflex.test.ts`, `scrole-rules.test.ts` | Rules right; the Logic line's "an instructor without the mark is flagged instead" is untrue for an IW behind. SC currency on a standby row that flies IS asked (the worklist's open note). |
| W60 | none (11 Aug 26); beside D271, D276, D278 | MATCHES | `engine/validate.ts` DOUBLE_BOOK (airborne window `to..ld`), TURN suppressed on a negative gap | new: "airborne overlap by a minute is the red DOUBLE_BOOK with no tight turn; landing at the other's take-off is a turn…" and "the edges: a flying AVALON row against a sortie… as built, two lines with no times…"; existing: `engine/audit-c-clash.test.ts` "same wave, two formations airborne at once…", "back-to-back legs… stay a turn" | Overlap by one minute is red, touching is a turn; a flying AVALON row against a sortie is red. As built: two lines with no times raise only the two-sorties note. |
| W61 | none (Aug 26); D52 | MATCHES for the behaviour; DRIFT on the Logic line (finding 5.2), with a question for him | `engine/validate.ts` (front-seat QUAL on jets, SC/AVALON spares, sims; PAX_CREW; `p.pers` gates on crew rest, turns, briefs); `engine/avail.ts slotBarNow`; D52: `leavewar/sync.ts availableFor` (skips `p.pers`); `ui/logic-html.ts` 'paxcrew' | new: "a front seat, flying or sim, is the hard QUAL…", "the three that apply…", "as built: an absence still reads against him…"; `it.fails` "D932: the Personnel Logic line is true…"; D52 held by `engine/rulesfirst-4-availability.test.ts` "W42: … ground crew out …" | Ground crew are barred from front seats and checked as stated, but they also get the absence checks, which the Logic line (and engine-rules' "only these three") deny. |

Counts by item: MATCHES 5 (W54, W55, W57, W58, W60); DRIFT 2 (W59, W61 — the rule itself as ruled, a Logic line
untrue of a real case); MISSING 1 (W56, expected and filed); no STALE, no OVERREACH. Finding 5.2 carries one question
for him (should a ground crewman's absence flag him — recommended yes, as built).

## Findings

### 5.1 — DRIFT: the Logic page's AAR instructor line is untrue for an instructor WSO behind (W59; D932)

- **His words (D932):** every line on the Logic page "is correct for whatever the settings are". The line (id
  `aarinstr`): "A pilot not current may fly AAR as training only with an instructor in the back seat marked I for it on
  Quals … That clears the front seat's currency warning; an instructor without the mark is flagged instead."
- **Kind:** DRIFT (the words, not the rule). **Where:** `ui/logic-html.ts` line 156 against `engine/validate.ts` AAR
  block — the teacher is `w.seat==='FCP' && isInstrPilot(w.q)`, an instructor PILOT only (engine-rules §AAR says
  "instructor pilot"; the rule itself is right).
- **The case:** Tuesday, VL BFM 12:00–13:00, remarks "AAR"; front seat Diesel (CAT D pilot, no DAAR tick); back seat
  Echo (CAT IW — which the same Logic page, under "OCU without IP", calls an instructor). The app raises "Diesel is not
  DAAR current" (AAR_QUAL) on Diesel and nothing on Echo. The line says an instructor without the mark is flagged
  instead — Echo is not, and the front seat's warning stays.
- **What a scheduler sees:** told an instructor behind is the one flagged, he sees the front-seater flagged with an
  IWSO behind him and may think the app missed the instructor. No wrong warning, only a wrong explanation.
- **Confidence:** high that the line is untrue for this case; low weight. Settled by rewording to "an instructor pilot
  (IP, IR or FI)" — or by his saying an IWSO can supervise AAR (unlikely: a WSO cannot supervise a refuel from the back
  of the pilot's seat; the 10 Aug rule says "instructor pilot").
- **The red line seen:** `AssertionError: expected false to be true` at the test's last line (neither the IW flagged
  instead nor the words narrowed).
- **Suggested fix:** the Logic line names "an instructor pilot (IP, IR or FI) in the back seat"; no engine change.

### 5.2 — DRIFT (and a question): the Personnel Logic line says ground crew get only three checks; they get more (W61; D932)

- **The words:** Logic line `paxcrew`: "Ground crew in a rear seat. The ride needs approval. Ground crew are checked
  only for clashes, the long day and days in a row." engine-rules §Personnel (owner, Aug 26): "The rules that apply —
  and only these three: the conflict, the long working day and the 7-day run."
- **Kind:** DRIFT on the Logic line (D932); the code is the likely-right side, so it is also a question for him.
  **Where:** `ui/logic-html.ts` line 153; `engine/validate.ts` — the absence checks (LEAVE_FLY / DNIF_FLY / INPUT_FLY)
  carry no `p.pers` gate, and the front-seat QUAL is raised for ground crew on jets, SC/AVALON spares and sims.
- **The case:** Ratchet (ground crew) files LL for Tuesday, all day; the scheduler puts him on a Tuesday 09:00–10:00
  BRIEFING ground row. The app raises "On leave + flying" (LEAVE_FLY, red) on him — a sensible warning, but one of a
  check the Logic page says he never gets. Likewise Ratchet dropped into a jet's front seat by data that bypassed the
  crew list raises the red QUAL.
- **What a person sees:** a scheduler reading the Logic page to learn why Ratchet is red is told ground crew are only
  checked for three things — none of which is what he sees.
- **Confidence:** high that the line is untrue; what should happen is his call. **To settle:** ask him "should a ground
  crewman on leave or medically down, put on a duty or ground row, be flagged as an aircrewman is?" — recommended yes
  (as built), then the line becomes "Ground crew are checked for clashes, the long day, days in a row and their own
  absences; never a front seat; none of the flying rules (crew rest, turns, pairing, AAR, SC currency, briefs)".
- **The red line seen:** `AssertionError: expected true to be false` — the line claims "only" and LEAVE_FLY fired.
- **Suggested fix:** reword the Logic line and engine-rules' "only these three" to name the absence checks and the
  front-seat bar; no engine change unless he answers no.

### W56 — MISSING, expected (not a surprise)

- D1099: "A flying line with only its front seat (FCP) filled works as fully as a two-seat line, its checks, marks,
  counts and pages included … the rules a single-seat jet needs are new rules, designed with him later" (confirmed
  21 Oct 26). Nothing tells a single-seat jet from a two-seat jet whose back seat is still empty; the 21 Oct check
  lists every back-seat reader. No `it.fails`: there is no ruled behaviour to assert until he designs it. The "as built"
  test pins what a front-seat-only line gets today: an OCU pilot alone on an AAR line, not DAAR current, raises
  AAR_QUAL ("nobody behind can supervise") and OCU_NO_IP; no pairing check runs.

## Checked against the brief's edges (no further finding)

- An empty seat: the matrix needs both seats (`p&&w`), AAR reads the empty back as "no supervisor"; nothing flags the
  empty seat itself (D91: a seat simply reads empty).
- A seat holding a placeholder: refused on every flying seat (W54); silent on a sim front seat, a desk, a ground row —
  no QUAL, no pairing, never named in OCU_NO_IP / NO_IR (D33 accepted that a desk's manning then reads a crowd). A
  typed word that is no callsign cannot reach a cockpit seat (seats hold ids; `realP` returns null for anything else,
  so an id-less value from old data would be silent — D56 territory).
- A man seated twice: both seats of a jet or of an SC SPARE row is red DOUBLE_BOOK (D276); twice on a ground row refused
  (D271).
- A man whose quals row is missing or edited after seating: `aarOK` / `scQualOK` read "current" when `quals` is absent,
  but every person gets `quals` from `deriveQuals` (boot, Admin → Users add); only bad stored data could lack it (D56).
  An edit after seating shows at once (tested for SC currency).
- A qual expiring on the day itself: not applicable — currencies are ticks with no dates.
- A seat on a standby line that flies: placeholder refused; SC currency asked (AVALON NIGHT tested); the pairing matrix
  and AAR run (`f.acs`).
- A wave with no times: pairing and seat checks do not depend on times; SC currency asks nothing on a shift with its
  times cleared ([SC-BLANK-SHIFT-QUAL]); two sorties with no times raise only DT_SUM.
- Pair 37 (D271, D276, D33/D47): consistent — two hard refusals (a placeholder in a cockpit, one man twice on a row),
  one case left a warning (both seats of a jet).

## Noticed outside the family (not reviewed)

- Stale code comments, behaviour correct: `engine/people.ts` above `aarNeed` still says a bare AAR is night "or the
  sortie runs past 19:00", and `engine/events.ts` (~line 381) "or the sortie itself runs past 19:00" — the clock was
  removed 21 Aug 26; the code reads the wave's night flag only.
- An SC MAIN row that only stands by (not flying) is in `f.acs`, so the pairing matrix, OCU_NO_IP and AAR run on a
  standby crew that will not fly; from the original, no ruling found either way.
- `engine/validate.ts` ~1247–1248 (`ocus`, `hasIP`) are computed and never read (the single-seat check's item 5).
