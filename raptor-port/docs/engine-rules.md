# Engine rules, as shipped

Detail split out of `CLAUDE.md` (which keeps the index and the
always-needed architecture rules). Read this when working on validation,
the rule thresholds, publishing/amendments or auth.

## Validation

`collectEvents()` builds per-day events from DAYS + INPUTS; `validate()`
produces `WARN {all, byDay, sev, chip}` and publishes `REST`/`EVD` (all three
are REASSIGNED per validate — read them fresh). Severities: `hard`, `adv`,
`note`. `overlap()` is **half-open** — abutting windows do not clash.

- A sortie occupies step (T/O − VCONF.step) to dekit (land + VCONF.dekit).
- **The brief is the time INDICATED on the line** (owner, 6 Aug 26): `f.br`,
  key `ff:di.gi.li.br`, editable on the edit week and the board. Blank means
  not indicated, and the line then briefs at `T/O − VCONF.briefLead` — the
  same value the board offers above the box as a click-to-accept suggestion,
  so a blank line is still checked but nothing is silently "decided". That
  setting is a convenience for working out the suggestion, NOT a rule: what
  every brief-driven check follows is the indicated B. A standalone wave is a
  shift and briefs nothing, so a value typed on one stays inert. Brief window
  = brief → T/O. A published in-time still moves report time and crew rest,
  never the brief.
- **Typed pre-flight clocks follow a small-hours T/O across midnight.** When
  the configured brief lead already puts the default brief on the previous
  evening, an indicated B later on the clock than T/O is shifted back one day;
  the published in-time does the same when `reportLead` crosses midnight.
  Thus a 00:30 T/O can carry B 22:10 and an in-time of 21:30 as negative
  minutes on the previous evening, exactly like its blank-B default. The roll
  is deliberately limited to that small-hours boundary: a later clock typed
  against an ordinary daytime sortie remains visible as typed rather than
  silently becoming a nearly 24-hour lead.
- Crew rest (VCONF.crewRest) runs off the last REST-BEARING commitment
  (sortie or shift), and anchors on the earlier of the published in-time and
  the leg's own brief. Breach = hard CR; nominal-inside-rest = adv TT.
  Exactly `crewRest` is legal — the breach is strictly less (owner, 6 Aug 26).
- **A turn chips but never rings (owner, 7 Aug 26).** All three turn rules —
  `TURN` and `DT_SUM` on the day, `CREW_TIGHT` overnight — mark the puck with
  a chip alone. `CREW_TIGHT` used to ring amber as well, so the same `TT`
  glyph meant a ringed problem on one puck and an unringed note on another. A
  turn is a note, not something to go and fix. The warning is untouched: still
  filed, still counted in the banner, still clickable. This is a deliberate
  divergence from `reference/`, patched into the in-memory copy by
  `refwin.ts:rering()` so parity stays byte-exact; it fires nowhere on the seed
  week, so `engine/turnring.test.ts` builds the case rather than finding it.
- **A late show changes the RING, not the rule** (owner, 6 Aug 26). `late
  show` / `show at brief` / `show @ brief` in an AIRCRAFT's remarks
  (`events.ts:lateShowOf`, parsed like `briefLeadOf` and `aarNeed`) never
  moves the anchor and never removes the warning: it stays a hard red CR,
  counted with the rest. While the man still clears rest by the **latest
  show** (`VCONF.showLead`, 60 min before T/O, editable) his puck rings
  **dashed** — sanctioned, and he makes the jet. Past that line it rings
  **solid**: he cannot walk, kit up and start engines, so he is unable to
  make the flight. Published per person as `WARN.dash[di][id]` (`dashOf`),
  because a chip carries no stroke of its own.
- **Every CR warning names the leave-by time** and the day it is measured
  from (`leaveBy`, `prevDi` on the warning).
- **The breach is also filed against the day that CAUSED it** (owner, 6 Aug
  26). A crew-rest warning is raised where the man is told to report, but the
  only day a scheduler can still change is the one before, so `validate()`
  publishes each breach a second time under its **previous** day:
  `WARN.trace[prevDi][id] = {di, dow, leaveBy, dashed, msg, fromKey}` — the day
  of the breach, the leave-by, and the message, so no surface re-derives a word
  of it. **`fromKey` names the leg on the CAUSING day that ran late** (owner,
  from the deployed site, 7 Aug 26): the slot-key of the rest-bearing event
  that set `prevFlyEnd`, i.e. the very sortie or shift the rule measured from.
  Rest is worked out from a minute count, so the event itself used to be thrown
  away — but the cross-day row is the one affordance a scheduler can act on,
  and it has to be able to point at the sortie to MOVE. It rides on the trace
  and deliberately **not** on the warning: `parity.test.ts` compares every field
  of `WARN.byDay` against the reference, while `WARN.trace` is port-only, so
  this stays clear of the reference entirely and needs no `refwin.ts` patch.
  Accessors: `traceOf(di,id)`; `traceLeads(di,id)`, which is `traceOf`
  narrowed to the case where the man carries no LOUDER chip of his own that
  day (the one test both the printed flag and the click routing use, so they
  cannot disagree); `traceIx(t,id)`, the breach's index in the next day's own
  warning list; and `tracesOn(di)` for the whole day. It is model state, not
  focus state — nothing has to be clicked for it to exist. What the UI draws
  from it (a dotted ring, a CR label, a cross-day row) is in
  `ui-contracts.md`.
- Tight turn needs `max(VCONF.tightTurn, dekit + step)`.
- Double turn: two+ sorties in a day → ONE DT_SUM line naming everyone;
  **adv, not hard** (owner, 4 Aug 26 — double turning is routine and planned),
  matching the amber pucks. No span test.
- **NO_BRIEF and SIM_BRIEF are adv, not hard** (owner, 4 Aug 26): the clash
  itself already carries the red; the eaten brief window is advice on top of
  it. DEBRIEF/SIM_DEBRIEF were already adv. The parity tests stay byte-exact
  via `refwin.ts:retier()`, which re-tiers the three call sites in the
  in-memory copy of the reference before boot.
- **An OFT remark can name its own brief lead** (owner, 5 Aug 26): an EP
  profile briefs `VCONF.epBrief` (15) before the box **unless its remarks say
  otherwise** — "BRIEF 30 PRIOR", "brief 30", "brief 30 mins", "30 prior",
  "30 mins prior" all read as 30, for that line only.
  `events.ts:briefLeadOf` does the parse (`\b` keeps DEBRIEF out; a value
  outside the Logic tab's 0–240 bound is a typo and falls back to the
  default). The AMT is untouched — its own BRIEF row is already the hard
  line. The seed EP-4s carry "BRIEF 30 PRIOR" on both builds, so
  `refwin.ts:relead()` patches the identical parse into the in-memory
  reference for parity.
- There are no OFFERS any more (owner decision, Aug 26). `Office`,
  `Available fly` and `Available duty` were removed as types and `isOffer` is
  gone with them. `Fly` gets no exemption: filed under Unavailable it raises
  `INPUT_FLY` and eats brief/debrief windows exactly as a `Meeting` does,
  using only its stated times — no brief/debrief padding is added to any
  input (padding is sortie-side: step→dekit).
- **The validator gate** (owner, Aug 26): `collectEvents` filters `day.input`
  through `inputFlags` = `isUnavail(type) || acc==='u'`, the single point all
  input passes inherit from. An UN-ACTIONED personal input is a request, not
  a commitment — invisible to `validate()`. Accepted to `'g'` it is
  represented by the ground row `acceptInput` created (in `day.events`), so a
  clash surfaces exactly once, as `DOUBLE_BOOK`/`SHIFT_SOFT`/brief-window
  codes on the ROW — keeping the input in `day.input` too would print every
  clash twice. (Accepted rows raising advisory `SHIFT_SOFT` vs SC shifts
  where the raw input raised nothing is intended — do not "fix" it.) Accepted
  to `'u'` the input itself clashes, as an `OD` does. Known edge, by
  design: an all-day input accepted to `'g'` makes a time-less ground row →
  no event → no flag, same as any time-less scheduler-typed row. Found on an
  all-day `Fly` (owner report, 4 Aug 26) and GENERALISED on 10 Aug 26:
  `inputFlags` now defers to the promoted row only where that row carries
  real times, so every all-day promotion keeps its voice on the input and the
  clash prints exactly once either way. **And the deferral is per-DAY, not
  per-input** (audit, 12 Aug 26): the promoted row lives on ONE day of a
  multi-day span, so `events.ts`'s `inpShow` defers only on that day
  (`acceptedDay`) — every other covered day keeps the input's own voice,
  where before the accept switched off real `INPUT_FLY`/`NO_BRIEF` warnings
  on days that had no row to carry the clash. A deferred input whose row
  cannot be found at all stays visible rather than silently absent. `acceptInput` still refuses
  Unavailable-typed inputs outright — leave does not belong on the Ground
  Programme, and promoting one would make its row clash with its own source
  input.
- **Every input the validator can see clashes with every kind of tasking**
  (owner, 4 Aug 26). The "but tasked" loop used to cover leave and downchits
  only, so an overseas duty or an actioned-to-`'u'` personal input warned
  against a sortie but let a sim seat, a duty post or a ground row through
  silently.
  Now all of `day.input` clashes with all of `day.events`, with one carve-out:
  ordinary personal types stay quiet against `kind==='shift'` (the accepted
  row's `SHIFT_SOFT` is the designed voice there); leave, downchits and
  detachments still hard-flag a shift.
- **An actioned `Fly` is AWAY** (owner, Aug 26: a Fly means flying with
  another squadron). `isAway(inp)` = `isOffType(type) || (isFly(type) &&
  acc)` — it feeds `dayOff` (the Available-crew strip and the palette fade),
  `slotBar` (reason: "flying with another squadron") and the palette's
  `offReason`. Whole-day, either destination. An actioned Fly is local, so
  since 10 Aug 26 it does NOT bar a standalone spare — `canSpare` decides
  that now, not leave-ness.
- **`INPUT_META` is the single source for every input type** (owner,
  10 Aug 26). It holds the twenty types the squadron actually books, and
  `INPUT_TYPES` is derived from its keys — the list, the rules, the Inputs
  page's type legend and the Logic page's matrix all read the same object, so
  none of them can describe a rule the engine does not apply. Fields: `name`,
  `grp` (`leave|med|duty|act`), `work`, `local`, `ground`, `half`.
  Every predicate is a lookup: `isLeave`/`isLocalLeave` off `grp`/`local`,
  `isDownchit` = `grp==='med'`, `isUnavail` = `grp!=='act'`, `isPersonal` =
  `grp==='act'`. Lookups are trimmed and case-insensitive, because the regexes
  they replaced were `/i`.
  `Downchit` and `Detachment` were REMOVED: OML / ATT B / ATT C carry the
  medical meaning, OD the overseas one, and the seed was retyped to match
  (a `refwin` patch, `redn`, teaches the reference the medical words).
- **`canWork` — the one place "cannot fly" and "cannot work" come apart.**
  Only `ATT B`: grounded but at his desk, so a duty post, a sim seat, a ground
  row or a programme item is proper work for him and raises nothing. The
  FLYING loop is untouched, so a jet still hard-flags. `validate.ts`'s
  non-flying tasking loop skips him; `slotBar` bars only a flying key (the one
  with no prefix).
- **`canSpare` is DERIVED, not stored**: `local && grp!=='med'`. That is the
  owner's rule in his words — local yes, overseas no — with medical the single
  carve-out, because HL/OML/ATT B/ATT C keep the man on the island but not fit
  to walk. Written against "a standalone spare" so the **AVALON rule the owner
  reserved** (10 Aug 26 — do NOT infer it) drops in without re-cutting.
- `isAway` = `isUnavail` + an actioned `Fly`. Widened from `isOffType` on
  10 Aug 26: `Detachment` sat in `isUnavail` but never in `isAway`, so a
  detached man was neither hidden from the palette nor barred — he only raised
  a warning once you had already planted him. OD may not be planned for
  anything, an SC spare included, so it has to be here.
- The input types still split two ways, but the split is **presentational
  only** since 10 Aug 26 — it decides which block a row is drawn in and
  nothing else. `isUnavail` = leave + medical + OD; `isPersonal` = the
  activity types (Training, CSE, Meeting, Fly, Personal, Appointment, Other),
  which are also exactly the types a scheduler may lift onto the Ground
  Programme (`ground` in the table). Together they partition `INPUT_TYPES` —
  a test pins that nothing falls between them, and a second pins that
  `isPersonal` and `ground` name the same set.
- **Every input counts from the moment it is typed** (owner, 10 Aug 26 —
  "all will automatically go in"). `inputFlags` used to be
  `isUnavail(type) || acc==='u' || …`, so a personal input was a request the
  validator ignored until a scheduler actioned it. One carve-out survives, and
  it is about double-printing rather than admission: an input promoted to a
  ground row that can carry the clash defers to that row. An ALL-DAY promotion
  makes a TIME-LESS row, which never becomes an event and so can carry
  nothing — that one stays visible on the input itself.
- **Half-days** (owner, 10 Aug 26). Leave and medical types (`half` in the
  table) can be booked AM (00:00–12:00), PM (12:01–23:59) or all day. Stored
  as the `s`/`e` minutes the record already had, plus a `half:'am'|'pm'`
  LABEL — the engine reads only `s`/`e`. A half-day closes its own half only;
  see §Availability is time-aware below.
- **The CAT ladder is `OCU → D → C → B → A → IW → IP → IR → FI`** (owner,
  Aug 5 '26). The generic `I` tier and the standalone `ip` flag (and its
  derived `quals.instr`) are gone — instructor-ness lives solely in CAT.
  `isInstr(q)` = any of the four; `isInstrPilot(q)` = IP/IR/FI (the rear-seat
  privilege). Seat matrix:
  - `IW` (instructor WSO): WSO-only category, RCP only. A hand-edited record
    with `q:'IW'` + `seat:'FCP'` planted forward raises hard `QUAL` (the CAT
    dropdowns are seat-filtered, so the UI can't create it).
  - `IP` (instructor pilot) and `IR` (instrument rating examiner — pilot
    only): may fly FCP or RCP. IR replaced the old "instr rating exmr"
    meaning; holders kept the letters.
  - `FI` (fighter wing instructor): pilot or WSO. Seated by the person's own
    seat — a pilot FI follows the IP rules, a WSO FI the IW rules (the seat
    checks test pilots with `isInstrPilot` and WSOs by seat, so this falls
    out for free).
  `OCU_NO_IP` counts any of the four as supervision, as `p.ip||isInstr` did.
  Parity stays byte-exact via `refwin.ts:remap()` (retier's sibling), which
  migrates the in-memory reference's ladder tables, `isInstr`, puck builder,
  PEOPLE literals and legend to this world before boot.
- **The combination matrix (F-15SG Table 1.5-2, owner Aug 5 '26)** grades a
  crewed aircraft — the jet only, not the sim box — whenever the front seat
  is a CAT A–D or OCU pilot AND the back seat is a CAT A–D or OCU WSO. An
  instructor in either seat clears the matrix outright (an instructor pilot
  IP/IR/FI flies with anyone; an instructor WSO with any front seat — the
  table's "OCU pilot needs a valid IR" footnote is deliberately disregarded,
  owner), and a mis-seated body belongs to the seat rules (`QUAL`), not here.
  The gradings, each carrying the **crew-pairing chip** (owner, 5 Aug 26 —
  they used to be ring-only, which left them the one family with nothing on
  the puck to click):
  - `ILLEGAL_CREW`, hard: OCU pilot + CAT A–D WSO, or CAT A–D pilot + OCU
    WSO — "not an authorised combination". This code SUPERSEDES the old
    two-OCU hard rule; the two-OCU pairing is now the advisory below.
  - `CREW_SOLO`, adv: OCU pilot + OCU WSO — a crew solo, only allowed for
    sorties designated under the F-15SG Basic Course Syllabus.
  - `CO_APPROVAL`, adv: D+C, C+D and D+D (pilot+WSO) — CO approval required.
  Unlike `NO_IR`, the matrix DOES fire on the seed week (Mon bapster+nick is
  the crew-solo advisory, Wed krait+wrangler and pike+badger want CO
  approval, Thu bapster+badger is unauthorised), so `refwin.ts:rematrix()`
  patches the identical rule and WCODE labels into the in-memory reference
  before boot, at the exact call site the two-OCU line occupied — and, since
  the chip landed, the reference's `RANK`, `CHIP_TEXT` and `CHIP_LABEL` too.
  Miss any of those three and the failure is not in the rule but in the
  markup: an unranked code freezes on its first write, and the reference's
  puck builder falls back to the raw code for both glyph and tooltip.
- **The crew-pairing chip, `CP` (owner, 5 Aug 26; renamed from `CC`, owner ask
  5 Aug 26).** Every pairing rule above plus `OCU_NO_IP` and `NO_IR` marks it.
  It is **two internal codes** because a chip carries no severity of its own —
  `CP` where the pairing needs approval (amber), `CPH` where it is not
  authorised at all (red) — and BOTH print `CP`, so the squadron reads one
  flag. `CHIP_TEXT` maps them; the colours are `.l-cp` / `.l-cph` in
  `scheduler.css`. In `RANK` they are inserted, not reshuffled: `CP` leads the
  advisories, `CPH` sits under `C`, because a man booked in two places at once
  is a harder stop than a pairing wanting a signature. So a crew member
  already carrying a conflict keeps the `C` flag — the pairing is still
  reachable from the day's issue list.
- **`NO_IR`, hard: an IRT needs an IR examiner in the crew** (owner,
  Aug 5 '26). `IRT` (word-bounded, case-insensitive) in a formation's msn →
  an IR anywhere in that formation's crew; in one aircraft's remarks → the
  IR in THAT aircraft. Rings hard and chips `CPH` — it is a crew-pairing
  rule like the matrix. Fires nowhere on the seed week, which is what lets it
  stay out of `refwin` entirely while the parity suite stays byte-exact. The
  crew list behind both this and `OCU_NO_IP` excludes the ALL AVAIL sentinel
  (owner scenario run, 5 Aug 26) — a special PEOPLE record filling an unfilled
  seat is never named, ringed or chipped, the same exclusion `collectEvents`
  already applies to `allCrew`.
- **AAR, and who may TEACH it** (owner, 10 Aug 26). Currency is read off the
  remarks and has been since day one — `aarNeed` (`people.ts`) returns
  `DAAR` / `NAAR` / `null`, ignores a `B:` segment (a WSO holds no AAR
  currency) and already strips `NO AAR` / `NO DAAR` / `NO NAAR`. **It is
  byte-identical to `reference/scheduler.html` and pinned by `tfin.js` group
  V — do not touch it.** What is new sits on top of its answer.
  One quirk of that segmenter, found by the owner asking and pinned in
  `aar.test.ts`: it splits on an optional digit + `A`/`B` + colon, and that
  pattern turns up inside ordinary words. `AREA: … AAR` is harmless (an `A:`
  tag means the front seat, which is the default anyway), but a word ending in
  **B** before a colon — `SUB: AAR` — reads as a REAR-seat tag and the whole
  segment is dropped, so the AAR goes unseen. Inherent to a parser frozen by
  reference parity; recorded, not fixed. `text, AAR` is fine.
  Instructing AAR **from the rear cockpit is a separate sign-off**: an
  IP / IR / FI is not automatically cleared to teach it. The Quals page
  records the clearance by promoting the man's DAAR / NAAR tick to `'I'`
  (`aarInstrOK`); the state is a **truthy string on purpose**, so `aarOK` and
  every other "does he hold this?" reader keeps the right answer — a man
  cleared to teach AAR is by definition current on it.
  When the remarks call for AAR and the FRONT seat is not current, three
  outcomes, all in `validate.ts` inside `f.acs.forEach`:
  - back seat holds an instructor pilot **with** the matching mark → **nothing**.
    A supervised training sortie is legal, and flagging it was the defect.
  - back seat holds an instructor pilot **without** it → hard `AAR_INSTR`,
    anchored `ac.key+'.w'` and named on him, because he is the man to change.
    **Both crew ring and chip `Q`** — the matrix precedent; the jet is
    illegal, not one seat, and ringing him alone would leave the pilot
    actually flying the AAR reading clean.
  - back seat empty, a WSO, a non-instructor pilot, or the ALL AVAIL sentinel
    → hard `AAR_QUAL` on `.p`, exactly as before: nobody aboard can supervise.
  The suppression is **per aircraft, not per formation** — "sitting behind"
  was the ask, so an instructor in another jet of the same four-ship does not
  clear it. **The sim box is out of scope** and structurally so: `simcrew`
  records carry no remarks field, so there is no AAR need there to react to.
  Neither code fires on the seed week (its only AAR string is `1A: NO AAR`),
  which is what keeps `refwin.ts` unpatched and the parity suite byte-exact —
  `engine/aarinstr.test.ts` pins that as a rot guard so it fails there first.
  Two ladders, demoting to **different rungs**: `naar && !daar → false` (he
  loses night currency), but `naar==='I' && daar!=='I' → true` (he keeps
  night currency, loses only the clearance to teach it). Enforced at boot, on
  every tick, and in `deriveQuals` — which is also the CAT-change handler, so
  a man demoted out of the instructor ranks has his marks demoted with him.
  Without that last one the privilege would survive invisibly: the page only
  offers the third state to instructor pilots, so a stale `'I'` renders as an
  ordinary tick while still clearing a red warning.
- Leave and the rest of the absence vocabulary: see `INPUT_META` above.
  A standalone SPARE is barred by `!canSpare(type)` — overseas (OL, OD) and
  every medical code — raising a hard DNIF_FLY/LEAVE_FLY even though spares
  are otherwise `saExempt`, and the message says which of the two it is. SC
  SPARE carries no crew rest either way. SC currency is checked for MAIN and
  SPARE. SC NIGHT ⊂ SC DAY.
- Standalone waves: SC (spares uncrosschecked), AVALON/BB (`noconf`).
- **AVALON's one check (owner, 11 Aug 26).** AVALON and its desk keep
  `noconf` — nothing on them is cross-checked against tasks, rest or
  qualifications — but every man on the wave now gets ONE look, the SC-spare
  shape widened. A JET seat (MAIN and SPARE alike) raises a hard
  DNIF_FLY/LEAVE_FLY for any input failing `canSpare` — overseas (OL, OD)
  and the whole medical group, **ATT B included**: these are jet seats, and
  ATT B means no flying. A DUTY role (SXO, OPS O, RUNNER, LOG CELL) mans a
  desk, so ATT B is carved out by `canWork`; overseas, HL, OML and ATT C
  still flag. Local leave, OIL, childcare, a course, an appointment — nothing
  raised, on either kind of seat. It warns, never blocks: the palette's fold
  is matched to exactly this rule (`slotRules().avJet/avDuty` widening
  `slotBar`'s spare exemption), so local leave no longer folds a man away
  from an AVALON seat the engine has no complaint about. **And an exempt
  line's puck follows ITS OWN rules and nothing else** (owner, 11 Aug 26,
  in two passes — first live use showed the engine flagging his AVALON man
  while the puck stayed clean; his second word was "the rings should also
  follow" the line's own red rules). `html.ts` reads the day's warning list
  for entries ANCHORED to the exempt line and naming the man: the
  availability check (DNIF_FLY/LEAVE_FLY → red C) and, on an SC spare, SC
  currency (SC_QUAL → red Q). A warning the man earned ELSEWHERE never
  bleeds onto an exempt copy — a spare routinely flies elsewhere the same
  day, which is why the old all-or-nothing gate existed. These lines ring
  red or not at all; the owner confirmed no amber rule lives on them. BB
  can anchor nothing and never rings. The badge and the add-toast say it
  per wave: AVALON "availability check only", SC's spare "availability and
  SC currency only", BB "not cross-checked". The 19:00–23:59
  half is judged against today's inputs and the 00:00–07:00 half against
  tomorrow's (the midnight tail below). Collected as `day.sacrew` in
  `events.ts`, checked in one loop in `validate.ts`. **BB is deliberately
  untouched** — the owner specified AVALON only; extending the bar to BB
  needs his word first.
- **The midnight tail (owner, 11 Aug 26 — "check in the same modality for
  all applicable rules based on timing").** A window that runs past midnight
  — a night sortie's landing and debrief tail, an overnight duty row, an
  AVALON shift — lives past minute 1440 of its day, where `win()` and the
  `ld<to` roll already put it. `collectEvents` appends TOMORROW's inputs to
  each `day.input` shifted +1440 (marked `nx`), so every consumer — the fly
  clash, the tasked clash, the brief/debrief windows, the SC-spare and
  AVALON checks, and any rule added later — judges the tail against the next
  day's inputs with no per-rule code. Today's events all end at or before
  1440, so they can never reach a shifted entry; a shifted all-day input
  still spans 1439 minutes, so `timedInput`'s all-day filter treats both
  copies alike; an input covering both days yields identical messages from
  both copies and the warning dedup collapses them to one. `slotBar` runs
  the same filter chain over the next day's inputs for any slot whose window
  passes 1440 (reason suffixed "(tomorrow)"), so the picker and the warning
  list move together. The loaded week's LAST day has no next day, so its
  tail is unchecked until the app carries more than one week. The parity
  gate excises the `nx` entries and `sacrew` exactly as it excises `key`
  (port-only); `overnight.test.ts` pins them positively.
- **AND THE TAIL RUNS BOTH WAYS (11 Aug 26).** The half above covers a window
  running PAST minute 1440; the mirror is a window opening BEFORE minute 0,
  and a small-hours take-off produces one with no overnight row involved —
  `briefLead` (140), `step` (60) and `reportLead` (180) are all subtracted
  from the T/O, so a 00:30 launch briefs 22:10 the previous evening and its
  occupied window opens 23:30 the night before. `collectEvents` therefore also
  appends YESTERDAY's inputs shifted −1440 (marked `pv`), by the same rules:
  a record with no usable window stays uncheckable, a shifted all-day copy
  still spans 1439 minutes so `timedInput` treats every copy alike, and an
  ordinary daytime sortie can never match one because its window never goes
  negative. `slotBar` carries the matching backward block (reason suffixed
  "(yesterday)"), because the picker and the warning list are required not to
  drift apart. Day 0 has no yesterday, exactly as the last day has no
  tomorrow. Found by measuring both directions against the same shape: the
  forward case flagged, the backward case was silent.
- **A duty block is filled from the WAVE it serves** (`waveDutyBlock`, owner
  10 Aug 26). `+ Block` on the scheduler board asks which wave the block is
  for and fills it in: the title is `<wave name> duties`, and the roles are
  the wave's own desk —

  | wave | roles | times |
  |---|---|---|
  | ordinary (1st, 2nd, …) and BB | SDO, SXO, OPS O | blank |
  | SC | SXO AM, OPS O AM, SXO PM, OPS O PM | blank |
  | AVALON | SXO, OPS O, RUNNER, LOG CELL | 1900–0700 |

  SC is the exception the owner named by hand: it hands over at 13:00, so ONE
  block carries both shifts with the shift in the role name, rather than two
  blocks or one desk pretending to cover 07:00–19:00. Times are stamped only
  where the wave has fixed hours to give; everything else is a blank cell to
  type into. The vocabulary is the owner's — `OPS O` and `LOG CELL`, spaced —
  and `DUTY_ORDER` ranks those spellings identically to `OPS-O`/`LOGCELL`, so
  nothing downstream can tell them apart. The free-block pick-list is
  `DUTY_PICK`, which IS `DUTY_ORDER`'s keys, so what a scheduler can pick and
  what Auto sort understands cannot drift.
  A block's `noconf` mirrors its WAVE's exemption: AVALON and BB sit outside
  the conflict engine whole, so their desks do too, while an SC or ordinary
  desk is checked like any other duty row. Since 11 Aug 26 an AVALON desk,
  though `noconf`, still carries the wave's one check — see AVALON's one
  check above.
- **AVALON is the only wave that brings its desk up automatically**
  (`SAWAVE.avalon.autoDuty`). SC did too for one morning on 10 Aug 26 and the
  owner moved it to `+ Block` the same day: an SC desk is a choice, an AVALON
  one is not, because nothing else about an overnight wave says a runner and a
  log cell are needed.
- Chip ranking `RANK` (highest wins): LD<DT<TT<A<SD<SB<DB<NB<CR<RUN<C<Q.
  Glyphs shorten: CR→R, RUN→7, NB/SB→B, DB/SD→D, LD→L. `A` = on shift AND down for
  a ground event/programme.
- **A break day is due after `VCONF.maxRun` (6) consecutive days** (owner,
  Aug 26). `DAYS_RUN`, hard, chip `RUN` (glyph `7`), ranked just above crew
  rest — both are rest breaches and this is the graver one. The run is counted
  once per `validate()` over the whole loaded week, in day order, off
  `day.events`, which is every kind of tasking there is: a flight, a duty
  post, a sim, a ground item, a programme row. Leave and downchits are NOT
  tasking, so a clear day resets the count, which is exactly what a break day
  is. The flag lands on the day that BREAKS the limit — the day the scheduler
  has to clear — not on the whole run. Because a run is a property of the week
  rather than of a day, it is precomputed before the per-day loop.
  NB the label carries no `{maxRun}` token: `wlbl()` renders every token
  through `lgT()`, which would print a day count as minutes.
- Warning labels embed `{crewRest}`-style tokens; `wlbl()` interpolates the
  LIVE VCONF value.

Where flags reach the screen: `ui/html.ts` builders read `WARN`/`chipOf`;
`ui/highlights.ts` decorates pucks after every render; the board's
live-checks panel is `boardWarnHTML` in `ui/board.ts`; warning-box
interaction is `ui/interactions.ts` + `state/view.ts` (`DWOPEN`, `WFOCUS`,
`focusWarn`).

## Availability is time-aware (owner, 10 Aug 26)

The validator has judged inputs by their hours since day one — `collectEvents`
carries `s`/`e` into `day.input` and every clash rule uses `overlap()`. The
AVAILABILITY layer did not, which is why a half-day would otherwise have
flagged correctly and still swept the man out of the crew palette.

- **`awayAllDay(inp)`** — true when `allday` is set, **or when either of
  `s`/`e` is missing**. A `{person, type}` record with no times is a real
  shape, and reading it as a zero-length absence would free a man who is off
  for a week. Both ends are required, so a half-day with a blank end cannot
  shrink to an hour through `win()`'s open-ended default. **Thin records fail
  closed.**
- **`slotRules` reports the slot's own window**, `slotStart`/`slotEnd`, for
  every key in the grammar. Each is read off the same row `collectEvents`
  reads and padded the same way, so the picker and the warning list cannot
  disagree: a sortie is `[to − VCONF.step, ld + VCONF.dekit]`, a standalone
  line is unpadded (it is a shift), a sim defaults to 90 minutes and
  everything else to `VCONF.openEnd`. `.+` and `.xN` strip to their row and
  inherit its hours.
  **`null` means UNKNOWN, never FREE.** A BB shift is written `['SHIFT','','']`
  and a ground row may carry no times; treating either as "clashes with
  nothing" would silently drop a real absence, so the consumer falls back to
  the whole-day answer.
- **`slotBar`'s filter chain, in order**: skip on a spare post if `canSpare`;
  skip a non-flying key if `canWork`; then the overlap. **The order of the
  last one is load-bearing** — an all-day absence, or one `awayAllDay` cannot
  place, must short-circuit BEFORE the overlap test. Reversed, every all-day
  absence starts being judged against a window it does not have. A test in
  `slotrules.test.ts` fails if it is ever reversed.
- **`dayOff` stays narrow — off for the WHOLE day.** It also feeds the
  day-info "off" tally and the palette's struck-through rank, and a man on AM
  leave is not off for the day. **Known, deliberate consequence: a half-day
  absentee is no longer counted in that tally.**
  `dayAway(d)` builds `{all, tw}` in one pass (whole-day set, timed windows by
  person); `dayOff` is `.all`. One pass because the palette asks about sixty
  people.
- **Timed absences join `availByWave`'s existing per-wave overlap**, the same
  one it runs for tasking — one overlap rule, not two that can drift. Two
  holes in that path are closed and pinned: the untasked fast path (a man
  whose only commitment is a timed absence would read free in every wave), and
  its inverse on a **non-flying day**, where with no bands to bucket into he
  must stay in `anyWave` or vanish from the strip.
- `palette-html.ts`'s `offReason` takes the same `awayAllDay` filter, or a man
  carrying both an all-day and a half-day absence can have the half-day named
  as the reason his whole day is gone.

**A morning absence does not free a sortie that starts walking before noon.**
The flying window is padded to the step because that is what the validator
judges against: Monday's first VL takes off 12:40 and steps at 11:40, so AM
leave to 12:00 still bars it. Correct, and worth knowing before it is reported
as a bug. The levers if it ever needs changing are the AM boundary or the step
padding — never a picker rule that disagrees with the warning list.

**The overnight tail is checked on both sides (owner, 11 Aug 26).** An
overnight window's part past midnight is judged against TOMORROW's inputs —
in the validator through `day.input`'s shifted append (see §Validation, the
midnight tail) and in `slotBar` through the same filter chain run over the
next day's inputs, so neither gate is stricter than the other. The bar
reason carries "(tomorrow)" so a scheduler can see which day the absence
lives on, "(yesterday)" for the backward half — a slot whose window opens
before minute 0, which is what a small-hours take-off does — and
"(overnight)" for an absence typed ACROSS midnight yesterday, whose second
half lands on today's early minutes without today's slot ever going
negative. That last one is checked WITHOUT the all-day shortcut the other two
use: an ordinary all-day absence yesterday says nothing about today.

**An absence may cross midnight** (owner, 11 Aug 26). 22:00–02:00 is a real
thing to be down for, and a duty row, a sim box and a night sortie have all
rolled that way since the port. Personal inputs were the one row type left
out: both entry paths refused an end before the start, and `mapInp` was the
one event build that did not roll its window, so such a record matched
nothing even if it arrived another way. `inpWin` is now the single place an
absence's window is read — `events.ts` and `slotBar` both go through it — and
only a ZERO-LENGTH window is refused on entry. The cost of the roll is that a
transposed 09:00–08:00 becomes a 23-hour absence rather than an error, which
is the same trade every other row type already makes.

**Two sorties at once are a CONFLICT, not a turn** (owner, 11 Aug 26).
Sortie-vs-sortie is excluded from the double-booking loop because two
back-to-back legs overlap the moment the step and dekit pads are added, and
would otherwise ring on every legitimate tight turn. That exclusion also
swallowed the case where a man is genuinely airborne twice at once: it
surfaced only as the amber tight-turn advisory, carrying a NEGATIVE minute
count. The line between the two is the AIRBORNE window (`to..ld`), never the
padded one — an overlap there falls through to a hard `DOUBLE_BOOK`, and the
tight-turn advisory is suppressed when the gap is negative. Two seats on one
line share a label, so that message names the man and the line instead of
reading "VL BFM & VL BFM clash".

**The picker asks "is he busy at THIS hour"** (owner, 11 Aug 26). `slotBar`
checks the day's events against the slot's own window for every key, not only
a standalone SC shift, excluding the seat being planned into (`slot`/`key` on
each event, normalised by `selfKey`) so a swap is silent. Every kind of event
counts, because every non-shift overlap the validator finds is a hard
`DOUBLE_BOOK`; a standby spare is exempt, being deliberately free. It is
ADVISORY, like every other bar here — `barDrop` toasts and the drop still
goes through.

**A second accept that would mint a duplicate content key is refused.**
`inpKey` is `person|date|type|start` and content keys are not unique;
`acceptedDay` and `unacceptInput` both resolve a row by the first match, so a
second row carrying an existing key would make the link ambiguous. The caller
reports which refusal it was — the type is never accepted, or the key is
taken — because saying the wrong one is its own bug.

## Accepting a personal input

A personal input is aircrew-submitted and is NOT part of the issued programme
until a scheduler accepts it. `acceptInput(di, inp, dest)` in the mutation
funnel:

- `dest='g'` pushes a real row onto `DAYS[di].ground` built from the input
  (the TYPE as the title, the remarks in the row's `rmks` cell, the CALLSIGN
  in `who` like every other ground write, `hhmm(s)`/`hhmm(e)`, blank for
  all-day) and calls `noteChange()` on its key, so it is pending and reaches
  the next AL. The row carries `src` — a content key back to the input.
- `dest='u'` only sets `acc='u'`, moving it into the Unavailable block; no row
  is created. Because there is no live row key to tint, it marks one inert
  `inp:di.input-id` amendment key for every loaded day the input covers.
- `unacceptInput` reverses either, finding the created row by `src` (not by
  index, which would rot when rows above it move). Removing a Ground row uses
  an inert `del:di.seq.ground` key; unfiling from Unavailable reuses the same
  stable `inp:di.input-id` key on every covered loaded day, so filing and
  unfiling before issue do not become two contradictory AL items.

Accepting twice is a no-op; undo first. The input is never removed — it stays in
Personal Inputs, faded, so the scheduler can see what they have dealt with.

## The late-input mark (owner, 9 Aug 26)

A member's input is due **`VCONF.inputLead` days before the week's Monday**
(standard **14** — owner, 9 Aug 26, raised from an initial 7),
and one last changed after that deadline is marked `LATE` wherever it is
drawn. `engine/inputs.ts` owns the whole thing — `inputDueISO`,
`inputStampISO`, `isLateInput`, `lateNote`.

- **The deadline is relative, not a date.** Week Monday − `inputLead`. At the
  standard 14, an input for the week of Mon 17 Aug is due by Mon 3 Aug. The
  arithmetic runs through a real date, so it steps back over month and year
  boundaries rather than off the end of a day number.
- **The deadline day itself is ON TIME.** Late is strictly `stamp > due` —
  "no later than a fortnight prior" makes the 3rd fine and the 4th late. Pinned
  in `engine/lateinput.test.ts`, and it is the assertion most likely to be
  broken by a "tidy-up" of the comparison.
- **What is measured is the LAST CHANGE, not the first submission** (owner's
  call when asked). The field is `mod`, the stamp the Inputs page prints as
  "Last modified", so an input raised early and then amended after the
  deadline reads late. The deadline exists so the week can be planned against
  something that has stopped moving. `'now'` — what the Inputs page writes on
  every add and edit — resolves to today rather than reading as unstamped.
- **No stamp, no accusation.** An empty, missing or unparseable `mod` is
  never late. An unknown date is not evidence, and every test in the suite
  that builds an input writes `mod:''`.
- **It is a MARK and nothing else** (owner chose this over an entry in the
  checks list). It raises no warning, closes no slot, changes no availability
  and is invisible to `validate()` — tightening the rule until every input is
  late must not move the warning count by one, which is pinned. It therefore
  needs no `refwin.ts` patch: the reference never sees it.
- **DOWNCHITS ARE EXEMPT** (owner, 9 Aug 26). A deadline asks a man to decide
  in advance; going DNIF is not a decision he makes, and a downchit raised the
  morning of the flight is the system working. Marking it would scold him for
  being ill and — worse for the scheduler — put a badge on the one input type
  that is ALWAYS last-minute, which is how a mark stops meaning anything. The
  test that pins this uses the seed's two downchits, which carry the LATEST
  stamps in the file and are still clean. **Leave and detachments are not
  exempt**: those are applied for, and applying late is the thing this is
  about.
- **There is no off switch.** `inputLead` is a day count (0–60); 0 means "due
  by the Monday itself", which is the most permissive setting. A squadron that
  does not run this policy has no way to silence the mark short of a rule
  change.

The seed week's `mod` stamps are deliberately spread either side of its
deadline (Mon 29 Jun for the demo week) so every case is visible — early,
exactly on the deadline (bane), one day late (nasty), plainly late (salsa,
shrek, yeti), and exempt-though-latest-of-all (the two downchits). Before
that they all sat inside their own week, which marked every input and made
the mark useless.

## Editable rules (Logic tab)

`VCONF` (19 numbers) + `SHIFT_HARD` (6 gradings), admin-only.
`RULE_STD` frozen standard; `RULE_SPEC[k]={t,u,lo,hi}`. `ruleParse` accepts
"12h", "2h20", "90", "0700". Storage keeps ONLY the diff in
`localStorage['sqn142_rules']`; `rulesLoad` (called by `initStore` at boot —
do not remove) treats storage as untrusted: number, finite, in bounds.

## Stores configuration (`engine/stores.ts`, owner, 7 Aug 26)

The squadron's stores list — **TPOD, 2 TKS, NAV, N/C, 3 TKS, CL** by
default (the owner's order, 8 Aug 26 — set on the deployed site and asked
for as the default; the keys never moved, so no saved jet config or saved
list was affected) — used to be a fixed `const` in `ui/html.ts`. It is persisted state
now, the same shape `rules` has: `STORE_CFG: [key,label][]`, editable through
`addStore`/`delStore`/`renameStore`/`moveStore`, saved through `storesSave`,
loaded through `storesLoad`, and reset through `storesReset`. Rendering and
the pen's interaction rules are `docs/ui-contracts.md` §Stores configuration;
this is the storage side.

**A separate storage key, `localStorage['sqn142_stores']`, deliberately not
folded into `rules`.** `rulesReset()` does `store.set('rules', null)` — it
nulls the ENTIRE key, and `logic.test.tsx`/`rules.test.ts` both pin "reset
restores the standard exactly" against that behaviour. If the stores list
shared the `rules` key, resetting the rulebook back to standard would
silently wipe a squadron's customised stores list as a side effect of a
completely unrelated action — a scheduler resetting `VCONF.crewRest` back to
12h should never touch what stores a jet can carry. Two keys keep the two
resets independent.

**Whole-list-on-deviation, no per-entry diff.** `rulesSave` only ever writes
the entries that differ from `RULE_STD`, because a rule is an independent
number — `crewRest` changing does not imply `briefLead` changed too. A
stores list is not that: it is one ordered, renameable sequence, and its
order and its labels ARE the data, so there is no meaningful smaller unit to
diff against. `storesSave()` therefore writes nothing at all when the list
still equals `STORE_STD` (`storesAreStandard()`), and the full array,
whole, the moment it deviates in any way — one rename is enough to write
every entry, including the five untouched ones.

**Load validation treats storage as hostile input**, the same posture
`rulesLoad`'s scar comment documents for `rules` (a plain string once
poisoned the crew-rest maths because `isFinite("840")` is true). `storesLoad`
walks the raw JSON and drops anything that does not survive, in order:

- the top-level value must be an array; anything else is ignored outright
  and the standard six stand;
- each entry must be a 2-element array of two strings — a `[key, label]`
  pair, nothing else;
- the key must match `^[a-z0-9]+$` (same charset `storeKey` produces —
  non-alphanumerics stripped, not replaced) and must not repeat one already
  accepted;
- the label must be non-empty after trimming and at most `MAX_LABEL` (16)
  characters;
- at most `MAX_STORES` (24) entries are kept — later ones in the array are
  simply not read once the cap is hit.

If nothing in the raw array survives all of that — including when the
top-level value was never an array to begin with — `STORE_CFG` is set to
the standard six explicitly, not merely left at whatever it happened to
hold already, so a squadron never lands on an empty list because of a
corrupted or hand-edited storage blob.

## Key renumbering

`shiftKeys(head,pos,ix)` renumbers keys when a row is deleted, over
`SCHED.pending`, `SCHED.changes` and every AL's live `keys`.
`shiftAircraft`/`shiftFormation`/`shiftWave` compose it. Deleting a
standalone wave also removes its duty block(s) (`d:`/`dr:`/`dl:` keys):
`saDutyIx` returns every index the wave owns, HIGHEST FIRST, because each
splice renumbers what follows it. It matches on the block's `sa` marker
rather than its label, so a RENAMED block is still removed with its wave.

## Reordering a board list

Every list on the board — flying lines, jets inside a formation, Duties,
Sims, Ground Programme, the overall programme, overall notes — can be
dragged or nudged into a new position through `applyMove(fromAddr, toAddr)`
in `engine/reorder.ts`. Addresses are `mv:<kind>.<container…>.<index>` (`ac`
aircraft, `d` duty, `s` sim, `g` ground, `p` programme, `n` note). For every
kind but `ac`, two rows may exchange places IFF their addresses agree on
everything but the last component — one test that enforces every
containment rule at once (a duty row cannot change block, an AMT row cannot
become an OFT row) with no per-kind special casing. **A row moves only
within its own list**; a move that would cross lists is refused, and moving
a row *between* lists (a line to another Go, AMT ↔ OFT) is out of scope by
owner decision — delete-and-retype stays the path there.

**A flying row's address means two different things, and the drop decides
which.** The grip on a flying row carries the full aircraft address
`mv:ac.di.gi.li.ai`, because a flying row *is* one jet — but the owner asked
for both a formation that travels as a block and jets that resequence
inside it, and there is only one grip. `applyMove` resolves it off the drop
target: land on a sibling jet (same `di.gi.li`) and `moveAircraft` swaps the
two jets; land on another formation in the same wave (same `di.gi`,
different `li`) and `moveFormation` carries the whole formation, jets in
order; land in a different wave and the move is refused outright. That is
the only reading consistent with "a jet may never leave its formation" — a
drag ending outside the formation cannot mean "move this jet there", so it
can only mean "move this formation there".

**`permuteKeys`/`moveKeys` (`engine/keys.ts`) are the bijective sibling of
`shiftKeys`'s splice.** `shiftKeys` handles a delete: marks on the cut row
are dropped, marks after it slide down one. A reorder is the opposite
shape — every row survives, it only changes address — so the remap has to
be a bijection: `permuteKeys(head, pos, oldOf)` takes `oldOf[newIndex] =
oldIndex` and rewrites `SCHED.pending`, `SCHED.changes` and every issued
AL's `keys` through it. An index outside the permutation is left alone (a
stale key from a longer list is inert), never dropped or collided — drop
one and an issued AL silently forgets an amendment; collide two and one
amendment permanently re-labels itself as being about a different sortie.
Neither failure shows on screen, which is why it is tested on its own
before any mover calls it. `moveKeys(head, pos, from, to, len)` is the
one-move wrapper — the splice-out/splice-in permutation of a list of length
`len` — and `from === to`, an out-of-range index, or a missing `head` is a
no-op.

**A move marks the row at its NEW address, against the rule that a DELETE
marks nothing.** `markEdit()` with no key is how a delete avoids re-marking
the address it just vacated; a move's row still exists and its position is
what changed, so it marks its own new address — `ff:di.gi.to.cs`,
`dr:di.wi.to.role`, `gr:di.to.prog`, `ap:di.to.prog`, `sr:di.kind.to.label`,
`dn:di.to`, `fr:di.gi.li.to`. That is the same idiom every add already
uses, it is what puts the day into the next AL (mechanically, what "a move
counts as an amendment" has to mean), and it tints the row that actually
moved. Re-marking a row that already carried a pending mark is idempotent.

**Ground Programme's manual flag.** Ground renders in start-time order
(`groundOrder`, `engine/order.ts`) on both the week and the board, so a move
expressed in plain model indices would be undone by the very next redraw —
and the first move in particular would read as doing nothing at all: drag
the 1000 line above the 0800 line and a naive model move lands it at model
index 1, where the sort still prints it last. `moveGroundRow` freezes the
order on screen into the model before it moves anything: on a day with
`d.gman` unset, it runs `groundOrder` itself, permutes the ground array and
its keys into that rendered order (`permuteKeys` — the same primitive a
plain move uses), sets `d.gman = true`, translates the caller's model
indices into the frozen order, and only then does the ordinary splice. From
that point the day's Ground list renders in model order and a new row lands
at the bottom, same as every other list. The way back is Undo:
`histSnap()` serialises the whole of `DAYS`, so `gman` rolls back together
with the order and no dedicated control is needed.

**Duties now print in the order they are stored, on both the week and the
board** — dropping the week's fixed `dutySort` (SDO → SXO → OPS-O → …) so a
reorder sticks where it is made instead of being overridden the moment the
week renders. The port's seed data was re-laid to already match
`dutySort`'s output, so nothing looks different on day one. What that costs
is in `src/testing/refwin.ts`'s `reduty()`, which pushes the port's re-laid
`dutywaves` rows into the in-memory reference for parity: it makes the two
structural comparisons in `parity.test.ts` that read `dutywaves.rows` in raw
stored order — the deep-equal of `DAYS` against the reference's own, and the
walk of `collectEvents` — **tautological for duty-row content and order**.
By the time either runs, the reference's rows *are* the port's rows, so a
corrupted duty row (a wrong name, a dropped role, a mistyped time) would
show up identically on both sides and compare equal rather than being
caught. Nothing outside `reduty()` narrows that gap. What still has
teeth: every other field of `DAYS` and `collectEvents` — flying waves,
sims, ground, notes — is still a real comparison against the untouched
reference; wave labels are never touched by the push (only `.rows` is
overwritten), so a wrong or renamed label still fails for real; and a
wave-count mismatch between the two builds throws, from the out-of-bounds
`dutywaves[j]` write, rather than silently comparing nothing.

## Sorting a board section

Where a manual move above is the scheduler's own judgement, sorting is the
opposite move: throw the section's own reading order back at it. Every
section but overall notes gets a sorter in `engine/reorder.ts` —
`sortWave` (flying, by take-off — `parseHM(f.to)` — the jets INSIDE a
formation are a position in the formation, never a time, so `sortWave`
touches `w.formations` and nothing inside one), `sortDutyBlock` (by START
TIME since 10 Aug 26, one call per duty BLOCK — `dw.rows` — never the
whole day at once; it used to be role rank off `order.ts`'s `DUTY_ORDER`,
which shuffled an SC PM desk above an AM one), `sortSims` (by start time,
called once per `kind` so AMT and OFT sort independently of each other),
`sortGround` and `sortProg` (both by start time). **Overall notes have no
sorter at all** — prose in a chosen order has no natural key, and inventing
one (alphabetical? first-typed?) would silently reorder someone's argument,
so `sortDay` (below) walks waves, duty blocks, sims, ground and the
programme and stops there.

**Two of the sorters act on the LISTS OF BLOCKS rather than the rows
inside one** (owner, 11 Aug 26). `sortWaves(di)` orders `d.waves` and
`sortDutyBlocks(di)` orders `d.dutywaves`, each by the EARLIEST parseable
time anywhere in the block — take-off for a wave, start for a duty block.
Before this, building AVALON (19:00) and then SC (07:00) left the night
wave printed above the morning one permanently, since a wave could only be
moved by deleting and retyping it.

- **The key is a MINIMUM, not the first row.** That is what makes the
  inner and outer sorts independent, and it is the owner's own worked
  example: a first wave of 0700/0900 and a second of 1000/0800 must come
  out 0700/0900 then 0800/1000 — ranking on the first line typed would
  read 1000 for the second wave and leave the pair as built.
- **The shift hours are DEFAULTS, and the sort reads the CELLS** (owner,
  11 Aug 26 — "these are default times, don't hardcode it … apply the same
  logic based on what u see"). `SAWAVE` stamps 07:00 on a new SC and 19:00
  on a new AVALON, and both are ordinary editable cells from that moment
  on, as is every duty desk `waveDutyBlock` timestamps. So the key is read
  live off `f.to` / `r.str` on every run and **no wave KIND carries an
  assumed hour anywhere in `reorder.ts`** — retype an AVALON to 05:00 and
  it sorts above a 09:00 SC. Pinned by two tests that invert the defaults;
  a `kind`-aware shortcut here would pass every default-timed case and fail
  the first squadron that flies its own hours.
- **A block with no parseable time sinks to the bottom in model order** —
  a BB wave (hours are the scheduler's to set), a wave whose last line was
  just deleted, a duty block nobody has timed yet. Same fallback every
  other sorter here uses for a time-less row.
- **Standalone waves are sorted flat with the rest, not held to the end.**
  SC, AVALON and BB sit outside the day's flying COUNT (`dayCount`), but
  they are read down the day like anything else, so a 07:00 SC comes to
  rest above an 08:00 ordinary wave.
- **Labels are never renumbered.** `WAVE 1` is free text a scheduler may
  have replaced entirely, so a day sorted into 07:00-then-08:00 can read
  `WAVE 2` above `WAVE 1`. Rewriting them to match would clobber every
  hand-chosen name to fix a cosmetic mismatch; the owner was told.
- **Neither has a per-section Auto sort button.** They are day-level
  operations with no one section to hang a `⇅` on, so `⇅ Sort all` is the
  only thing that calls them.
- **A duty block's `sa` marker is a string, not an index into `d.waves`**
  (`saDutyIx`, `engine/waves.ts`), so a wave and the desk it brought can be
  reordered independently without either losing the other — which is why
  these are two separate sorters rather than one paired walk.

**Every sorter is a stable sort of the row's own INDEX range**, never the
rows themselves — `keySort(n, keyFn)` sorts `[0..n)` by `keyFn(i)`, and its
comparator falls back to `a-b` (the original index) whenever the keys tie
or are both unparseable, so equal keys — two formations off at the same
minute, two ground rows with no time at all — keep the order they already
had. Unparseable keys (`parseHM` returning null) sink to the bottom in
model order, the same fallback `groundOrder` already uses for a time-less
row.

**Every sorter is a no-op on an already-sorted section, and the identity
check runs BEFORE anything else** — `isIdentity(oldOf)` (every index maps
to itself) short-circuits with no model write, no key remap and no
`markEdit`, so pressing "Auto sort" on a tidy section changes nothing and
creates no amendment. This has to run first rather than after the fact,
because the alternative — sort, then compare, then undo the write if it
matched — would still have to invent a key ordering to compare against,
which is exactly the risk overall notes exists to avoid.

**A sorter remaps the amendment key space through the exact same
primitive a manual move uses** — `permuteKeys(head, pos, oldOf)`, the
bijective sibling `shiftKeys` gained for reordering (see above) — over the
identical key-space heads the matching mover in this file already touches
(`sortWave` over `ff:`/`fr:`/`st:`/`ar:`/`at:` plus the bare address,
`sortDutyBlock` over `d:`/`dr:`, `sortSims` over `s:`/`sr:`, `sortGround`
and `sortProg` over their own pair). The two block-level sorters take the
widest heads of all, and both borrow their list verbatim from the matching
DELETE path so the two can never drift: `sortWaves` uses `shiftWave`'s nine
(`wl:`/`ff:`/`fr:`/`st:`/`ar:`/`at:`/`it:`/`tr:` plus the bare seat
address, all at position 0 — the wave index), and `sortDutyBlocks` uses the
`d:`/`dr:`/`dl:` trio the board's block delete renumbers. A sorter that
skipped this would move
a row on screen while its amendment stayed addressed at the OLD index —
silently re-labelling an old amendment onto whatever sortie now sits
there. Like a move, a sorter marks the row now sitting at index 0 of the
section it touched (the same "mark the NEW address" idiom, not the old
one) — that single mark is what puts the day into the next AL.

**Ground's Auto sort (`sortGround`) also owns the day's manual flag, and
reports honestly when the flag is the only thing that moved.** Every
`sortGround` call clears `d.gman` unconditionally — Auto sort IS the way
back to the self-sorting render Ground normally has — even on the one path
where nothing in the row array needs to move: a day frozen in manual mode
whose rows already happen to read in time order. `wasMan` is read before
the clear, so the caller (`board.ts`'s `boardMbtn`) can tell that case
apart from a genuine no-op: `sortGround` still returns `true` and marks the
row (the flag flipping IS a change, even though the row array is the same
object, not a rebuilt copy), and the UI reports "Ground programme back to
time order" rather than the generic "Already in order" toast — clearing
the flag without moving a row is still something that happened, and saying
nothing would hide it.

**`sortDay(di)` is the primitive `⇅ Sort all` composes over**: every wave,
then the waves themselves, every duty block, then the blocks themselves,
every sim kind, Ground, then the programme, in that order, returning
whether ANY of them changed. **Inside before outside is load-bearing** —
each inner sorter permutes key heads pinned to a FIXED wave or block index
(`ff:0.2.`, `dr:0.1.`), so it must run while those indices still name the
block it was handed; sorting the outer lists first would leave every inner
call remapping the key space of whatever had moved into that slot. The
order on screen would come out the same either way (an outer key is a
minimum over the whole block, which reordering inside it cannot change),
so this is about amendment records staying attached to the right sortie.
`⇅ Sort all` itself
(`board.ts`'s `sortAllCommit`) wraps one call to `sortDay` in
`HIST.lock = true` for the duration — `histPush` (`state/history.ts`)
bails outright while the lock is held, so however many of the day's
sections `sortDay` touches, none of their individual `markEdit`s reaches
the undo stack; only the ordinary `afterSchedMutate()` call AFTER the lock
lifts pushes a snapshot, so Undo takes the whole day back in one step, not
one per section. An already-tidy day never needs the lock's protection at
all: `sortDay` returns `false`, nothing inside it ever called `markEdit`,
and the caller shows "Already in order" instead of pushing a no-op step.

**NOTHING SORTS ITSELF** (owner, 10 Aug 26 — "prevent a situation when the
scheduler types and the line jumps"). Typing a role into a blank duty cell
used to call `sortDutyBlock` from `boardChange` (`board.ts`) and reposition
the whole block under the typist; that call is gone, and no board list has
another like it. `⇅ Auto sort` and `⇅ Sort all` are the only things that
reorder anything here. The one exception predates the rule and stays: the
Ground Programme renders in time order every draw (`order.ts`'s
`groundOrder`), which was a separate owner request and avoids the problem
anyway, since a time-less row sinks to where the model appended it.

## Who a row stores: ID vs CALLSIGN

Two different things live in the model and mixing them up breaks rows silently:

- **Person IDs** — flying seats (`a.p`/`a.w`), duty rows (`r.id`), sim
  `p`/`w`/`pax[]`, the `more[]` overflow on every row, and `INPUTS[].person`.
- **Callsign STRINGS** — `ground[].who`, `allhands[].who` (a string or an
  array of them) and sim `.who`, all resolved through
  `nameToId` → `ID_BY_CS`, case-insensitively. `setSlotVal` writes
  `PEOPLE[id].cs` into them; a row may also hold free text that is nobody
  (`'149'`, `'ALL PILOTS'`), which simply fails to resolve and renders as
  plain text.

`rowCrew`/`slotVal` read the callsign rows back as IDs, so snapshots, AL diffs
and published days are all ID-based.

**Renaming a callsign** (`renameCallsign(id, cs)`, owner Aug 26) therefore has
to rewrite all three string fields as well as remapping `ID_BY_CS` — changing
`PEOPLE[id].cs` alone leaves those rows pointing at a name nobody answers to,
and the puck collapses to free text. It refuses a blank, a no-op and a
duplicate (`ID_BY_CS` can only point one way). It deliberately marks **nothing
pending**: the person in the seat has not changed, only the spelling, and
`rowCrew` diffs identically — an AL full of spelling would be noise. Published
day snapshots keep the spelling they were issued with, which is correct for a
historical document.

## Publishing / amendments

`SCHED = {al, pending, changes, als, dayOK, sign, orig, cur}`. Four sign-offs per day
(`SIGN_ROLES`) → "Publish day" clears that day's pending and spends its
signatures. Later edits become pending; "Publish AL n" stamps `{n, keys,
sign, days, n0}` — `days`/`n0` are stamped at issue time and NEVER
recalculated. `unpublishAL(n)` returns changes to pending. Publishing is
per-day; there is deliberately no "publish all days".

Edits only become AL changes on a day that is already published — edits to
a draft day are folded in when the day is first published, with no AL mark.

**Structural removals are real AL items even though their cells are gone.** A
delete first renumbers the surviving address space, then marks an inert
`del:di.seq.kind` tombstone. Reusing the removed row's old key would attach the
amendment tint to whatever shifted into that address; the tombstone instead
keeps the day index parseable while pointing at no live cell. Its sequence is
derived from pending, issued and historical AL keys, so no separate counter can
drift across undo. Tombstones travel unchanged through publish, unpublish,
history and version snapshots; the AL panel counts them as removals, while the
schedule CSV naturally contains only the rows that still exist.
Draft structural additions carry an identity key that is remapped with the row
through drag, nudge and Sort. Issue clears that identity; unpublish restores it.
Therefore a row added after issue, reordered, and deleted again before its AL is
a net no-op: its pending add key is removed and no false removal is published.
The issued snapshot is the legacy fallback; accepted Ground inputs also carry
their stable source token. The fallback's positional lookup is index-based
and a reorder makes live and snapshot indices diverge, so it carries one
extra rule (audit, 12 Aug 26): a row that is NOT an outstanding draft add,
whose index runs past the issued section's tail while the live section is
longer than the issued one, IS issued — the surplus is exactly the draft
adds, so an issued row a sort pushed past the snapshot's row count still
publishes its removal instead of silently vanishing from the AL. A later AL keeps ownership if an older one is
unpublished even when it changed a different field on the row: AL snapshots
carry the live structural-add identities separately from field keys. Restoring
a frozen day clears draft identities along with the
draft rows it discards, so reused addresses cannot suppress a real removal.

## Version snapshots / restore

`daySnap(di)` = `{d: deep clone of DAYS[di], c: that day's slice of
SCHED.changes}` — the day "as issued, wearing its marks". Stamped at the
two issue moments: `setDayApproved(di, true)` → `SCHED.orig[di]`
(**first publish wins**; a re-publish after reopen is a later state, not a
new Original) and `alIssue` → `rec.snap[di]` per covered day. Snapshots
live on the AL record / `SCHED.orig`, so they ride `histSnap` (`a` / `o`)
and `unpublishAL` with the state they belong to. `daySnapOf(di, ver)`
(`'orig'` | AL number) and `dayVersions(di)` derive options from live
records — orphan-safe by construction. Session-only, like the AL list.

**The current version.** `SCHED.cur = {di: 'orig'|n}` — which version each
day is showing. Stamped only by `alIssue` (cur = n for covered days) and
`restoreDayVersion` (cur = the restored version). Read through
`dayCurVer(di)`: the stamp counts only while its snapshot still exists,
else it falls back to the newest **issue** with a snap for the day (array
order — `publishAL` can issue a lower number after a higher was freed),
then `'orig'`, then `null`. That derivation is the orphan guard — a stale
`cur` after `unpublishAL` or an undo is inert, no cleanup pass exists.
The day-head shows ONE chip from it (grey ORIG when rolled back to the
Original while ALs exist; no chip on a published day no AL ever touched);
the ⓘ panel keeps the full historical AL list.

`restoreDayVersion(di, ver)` (engine/restore.ts — its own module because
slots.ts already imports publish.ts) is a **ROLLBACK**, owner decision
Aug 26: the version becomes the live document immediately. It replaces
`DAYS[di]` with a clone of the snapshot (live `today` flag kept), wipes
the day's `changes` slice and installs the snapshot's own (`snap.c`) so
the day wears exactly its issued marks, **discards** the day's pending
edits, and stamps `SCHED.cur[di]`. Nothing pends; no sign-off is needed
or spent; `dayOK`/`orig`/`als` are untouched, so later ALs keep their
dropdown entries and `nextAL()` keeps counting up. Returns false for a
missing version, else the number of pending edits discarded (0 is the
common case, and the toast reports the count). It pushes NO history and
calls NO reflow — the UI caller's `afterSchedMutate()` is the single undo
step. New edits after a rollback are ordinary pending and publish as
`nextAL()`. Corner case: unpublishing the AL a day was rolled back TO
orphans its snapshot — `dayCurVer` falls back and that AL's keys on the
day return to pending (self-describing on screen: fallback chip plus a
pending count, one undo away). Unpublishing a LATER AL does not re-pend a
rolled-back day: the rollback already overwrote its `changes` slice.

The `dayKeys` walker stays although the rollback no longer diffs — it is
the executable documentation of the slot-key grammar and probe-bridge
exports it.

## Auth / roles

`a/a` = admin, `user/user` = member. `canEditSched()` = session AND admin.
Logout closes the scheduler board (a sibling of the shell) and resets LGEDIT.
The login is a prototype gate, not security — the deployed app is public.

**What a member may do (owner, 5 Aug 26).** The line is *their own record vs
the squadron's programme*, not read vs write:

| | member | admin |
|---|---|---|
| Inputs — add / edit / delete | **yes** | yes |
| Quals — `Enable editing`: tick a qualification, edit initials / flight / CAT | **yes** | yes |
| Quals — `Edit quals` (which columns the LoX carries) | no | yes |
| Quals — `Add person` (put someone on the roster) | no | yes |
| Accepting an input into the issued programme | no | yes |
| The Edit Schedule page at all (`canEditSched()`) | no | yes |
| Logic — editing VCONF / SHIFT_HARD | no | yes |

Inputs opened because they are the crews' OWN leave, downchits and
detachments — the reference's `View only — ask a scheduler` gate made the
people they belong to ask someone else to type them. Accepting one into the
programme did NOT open with it: entering an input is the crew's, issuing it
is the scheduler's (`interactions.ts`, `canEditSched()`).

## History

`histSnap()` serialises `{DAYS, INPUTS, changes, pending, als, al, dayOK,
sign, orig, cur}` (`o`/`cv` fields); undo/redo restores wholesale.
Publishing is its own undo step, and so is a rollback. Undo is refused
while focus is in an editable field.

## The edit log (`engine/editlog.ts`, owner, 11 Aug 26)

Who changed which detail, when, and what it was before. Distinct from
§History above: that is the undo stack (whole-state snapshots, no
attribution); this is a per-key record with a name and a clock on it.

`ELOG = {rows, cap:400}`, each row
`{t, who, di, key, lbl, from, to}` — a ring buffer, oldest dropped. 400
rather than HIST's 60 because a row is a handful of short strings where a
history snapshot is a whole serialised schedule.

**The rows' keys move with the key space** (audit, 12 Aug 26). A delete or
reorder renumbers every index-addressed key; `keys.ts` already rewrote
pending/changes/ALs and now calls `elogRemap(move)` with the same remap, so
a logged edit keeps naming the ROW it happened on, not the address it
happened at — before this, the changes list jumped to whatever row had slid
into the old address and pinned one man's history onto another. A key whose
own row was deleted is dropped (the entry stays, as a plain unjumpable row —
the deletion's own "what it held" sentence sits beside it).

**Written at the two funnel choke points, and only when both values are
handed over.** `noteChange(key, was, now)` (`slots.ts`) and
`markEdit(key, was, now)` (`publish.ts`) each end in `logEdit`, which
returns immediately unless it has a key AND both values AND they differ.
That single rule is what keeps the log clean of the two calls that would
otherwise flood it: `afterSchedMutate()`'s bare `markEdit()` epilogue fires
after every mutation and carries nothing, and the board's structural marks
after an add carry a key with no "before".

**The two orderings are not the same and the code depends on it.**
`setSlotVal` calls `noteChange` BEFORE it assigns, so it reads the old
value itself; `txtSet` calls it AFTER, so it captures the old string into a
local first and passes it. Reversing either silently logs `X → X`, which
renders as no row at all. Pinned by the first two tests in
`editlog.test.ts`.

**Structural changes carry a sentence, not a pair of values.** A line, wave,
row or note added or removed reaches `markEdit()` with no key on purpose, so
`logAction(di, text)` names it instead — routed through `act()` in `board.ts`
so the toast and the log say the same words. Sort all logs one line, not six:
the sorters mark keys whose values never move, so `logEdit` is silent through
all of it by construction. Undo and redo log themselves.

**A deletion's sentence names what it deleted, an addition's does not.**
`board.ts`'s `desc()` reads the row the moment before its splice and appends
what it held — a formation's callsign and crew, a note's own words, a duty
row's role and man — so `Note removed` reads `Note removed — "EP OF THE
WEEK"` and the changes list stops asking the reader to remember. Free text is
clipped to ~60 chars because `act()` hands the same sentence to the toast, and
the toast stays one line. An addition says only "Line added": the row is
still empty the moment it is logged, so there is nothing yet to describe.

**A removed personal input logs its own line too** (`inputedit.tsx`'s
`removeInput`), naming the man, the type and the date — the input surfaces
are the one thing §Accepting/undoing above still leaves silent, and a deleted
input is otherwise a row that vanishes with no trace in either list.

**Three more ACTIONS carry a sentence for the same reason** (added 11 Aug 26,
after a review found the list silently missing them). Each changes the
schedule and reaches `markEdit` with no key, or with a key whose values it
cannot diff, so each says its own toast to the log through `logAction`:

| action | where | why it has no value pair |
|---|---|---|
| Accepting an input to the ground programme (and undoing it) | `interactions.ts`, the `[data-acc]` branch | the row did not exist a moment ago, so there is no "before" |
| Cancelling with a reason, and restoring | `cxCommit`, `board.ts` | `cx`/`cxr` are not addressed by any slot key |
| Rolling a day back to a published version | `interactions.ts`, the `[data-restore]` branch | `restoreDayVersion` swaps the whole day object — not one key passes through the funnel |

Accepting through `inputedit.tsx`'s relink (an accepted input edited onto
another person or date) is deliberately NOT logged: it is one user action that
internally unaccepts and re-accepts, and logging the engine call would put two
contradictory lines against one edit. The gap is the input surfaces, which the
changes list has never covered — it is a record of the SCHEDULE.

**The fields that write their own model must pass their values by hand.**
Stores chips, the bombs box, area, area time, in-times and traffic live
outside the txt-key grammar: they assign to the model directly and call
`markEdit(key)` themselves rather than going through `txtSet`. The board's
wave-title `<select>` (`[data-wsel]`) is the same shape and was the last
one found (audit, 12 Aug 26): it books under the week's `wl:` key, valued
by the TITLES the control shows, so a retitle from the board logs and marks
the amendment exactly as the week's cell does. Every one of
them passed a key alone until 11 Aug 26, so changing a jet's stores or an
airspace booking marked the cell as edited and then had nothing to say when
History was asked what changed — while the cell still wore the `cursor:help`
that promises an answer. They now pass `was`/`now`, read BEFORE the assignment
in each case. Two of them need care and the reason is written beside each:

- **`st:` is per-AIRCRAFT, and the chips and the bombs box share it**, because
  the amendment mark does. Both log `storesText(a.opts)` (`stores.ts`) — the
  whole load either side, not the one control that was touched — or two rows
  would carry the same label and contradict each other.
- **Traffic cannot read its own "before" at commit time.** All three handlers
  in `AirPop` write `traffic` in place before `airEdit()` runs (the typing one
  has to; a React-controlled list repaints under the caret), so the list is
  snapshotted when the popup opens and refreshed on every commit. The
  snapshot effect is keyed on `AIRKEY`, not on every render — the render
  effect below it deliberately has no dependency list, and re-snapshotting on
  an unrelated repaint would adopt the half-typed value as the "before".

Pinned by `ui/editlog-writers.test.tsx`, which drives the real gestures: the
bug was never in the log, it was in what the callers handed it, so a test
calling `markEdit` with two values by hand would have passed throughout.

**Three queries, and the ORDER of each is part of the contract.** `elogRows`
is newest-first — a feed answering "what just happened". `elogAllFor(key)` is
OLDEST-first — the story of one detail, so the last line is what it says now;
it is what the expanded bubble and an unfolded group show. `elogGroups(di)` is
one row per detail, newest-TOUCHED first, each carrying its own rows
oldest-first. A structural entry has no key and cannot group with anything —
a line removed and a wave added are different events that happen to share an
empty address — so each is its own group of one, keyed by its position in the
log so two identical sentences never fold together. A group takes its NAME
from its newest row: `keyLabel` is frozen per row, so a line renamed between
two edits would otherwise head its own group with a name it has stopped
having.

**`who` arrives through `HOOKS.whoami()`**, wired in `wireStore()` from
`SESSION`/`ACCOUNTS`. Accounts are hard-coded, so today it only ever reads
`Admin` or `Squadron member`. That hook is the one seam a real server has to
fill; nothing else changes when it does.

**Session-scoped, and cleared by `resetSession`.** Not persisted — the
schedule it describes is not either. Deliberately NOT in `histSnap()`: an
undo restores the schedule and leaves the record standing, because a log you
can rewrite by pressing undo is not a log.

`keyLabel(key)` turns a slot key into plain words ("MONSOON 1 · FCP", "Duty ·
SOF") and is **frozen onto the row at log time** — the row it names can be
deleted a minute later, and re-deriving then would print the wrong row's name
once the indices below it shift up. **The four per-AIRCRAFT keys name their
jet where the line flies more than one** (`· #2 FCP`, `· #2 stores`, added
11 Aug 26): the aircraft index used to be dropped from a flying seat, from
`fr:` and from `st:`, so on the demo Monday — two `VL BFM` lines of two jets
each — one label named four different details. `ff:`/`ar:`/`at:` address the
FORMATION and take no number. It appears only where there is something to tell
apart, so a single-ship reads as it always did, and the bubble was never
affected: it matches on the key, not on the words. `state/view.ts`'s `slotTitle()` answers a
similar question for the arm picker and is deliberately separate: it emits
HTML, covers only the crew keys, and lives where the engine cannot reach it.
