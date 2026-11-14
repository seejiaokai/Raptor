## Fresh, blind Opus read of D2005 (commit 30b99f027 against 30370bd29)

I worked blind. I opened no other reader's report, no walk, no scenario list, no evidence sheet and no handoff block. Nothing in the repo was changed. Each proof test was copied into `raptor-port/src` as `zz-opusread-*`, run as a single file, and deleted straight after; `git status` is clean. The proof files are kept in `C:/Users/User/AppData/Local/Temp/claude/f4202d016722bdbc/cb4f03b3-b05a-4aac-84e8-eaf47858fa25/scratchpad/opus-read/`:
- `zz-opusread-d2005.test.ts` (F1, F1 mirror, F2, the first F3 attempt, F4)
- `zz-opusread-d2005b.test.ts` (F3 a/b/c)
- `zz-opusread-neigh.test.ts` (F5; it goes in `src/state/`)

Their test setup is copied from `published-day-logic.test.ts` and `kept-rules-neighbour.test.ts`. **Every proof test below ran red.**

---

### F1 (highest). A published day's crew rest changes when "Assumed length" or "Assumed sim length" changes. The same fault, mirrored, stops a draft day from taking the change.

**What goes wrong**
- Setup: Monday is a draft with Ranger on a 20:00 lecture and no end time, so it is assumed to end at 21:00. Tuesday is published: VL, take-off 12:00, B 09:40. His rest clears at 09:00, so Tuesday is clean.
- Action: the admin changes "Assumed length, no end time" from 60 to 120.
- Result: Tuesday's published face (View-only Sched) **and** its untouched working copy both turn red for crew rest. No amendment was made.
- The same happens with Monday's sim with no end time and "Assumed sim length" 90 → 180.
- The mirror: Monday published with the lecture, Tuesday a draft, the setting raised to 120. The draft Tuesday stays clean when it should turn red at once. This breaks "every unpublished day at once".
- Rulings: D2005 and its reading that "the day being judged decides".

**Cause**
- In `validate.ts` `crewRestDay`, a flight from the day before ends at `flyLd + VCONF.debrief`, which uses the judged day's setting.
- Every other kind of event ends at `e.e`. That end was worked out when the source day's events were built (`events.ts collectEvents`, wrapped in `withDayRules` of the source day), using `win()` / `VCONF.openEnd` and `st + VCONF.simLen`.
- So an assumed end follows the day before's settings, not the judged day's. The rule is decided by the day being judged for the debrief, but not for these two.

**Fix**
1. In `events.ts`, wherever an event's end is assumed rather than written, tag the event:
   - a sim seat or sim row with no end (lines ~428/436/454): `e.assumed = 'sim'`;
   - ground, duty and all-hands rows with no end (`push` → `win(st, en)`): `e.assumed = 'open'`.
2. In `validate.ts` `crewRestDay`, compute
   `rawEnd = e.kind === 'fly' ? flyLd + VCONF.debrief : e.assumed === 'sim' ? e.s + VCONF.simLen : e.assumed === 'open' ? e.s + VCONF.openEnd : e.e`.
   Roll it past midnight the way `win()` does. Inside the day loop this reads the judged day's overlay, just as the debrief already does.
   - Alternative: rebuild the source days under `withDayRules(judgedDay, …)`. That is heavier.
3. `REST[di]` and the picker's probe share this one function body, so they follow automatically.
4. Pin it with the three tests below.

**Proof test (red: "published face: expected true to be false"; the mirror: "expected false to be true")**
```ts
it('published Tuesday; Monday (a draft) ends with a 20:00 lecture with no end time; "Assumed length, no end time" 60 → 120: Tuesday must stay clean', () => {
  day(MON).ground.push({ prog: 'LECT', str: '20:00', end: '', who: 'bane' })
  day(TUE).waves.push(wave([form({ br: '09:40' })]))
  publish(TUE)
  expect(has(officialWarn(), TUE, 'CREW_REST', 'bane'), 'premise: clean').toBe(false)
  VCONF.openEnd = 120; validate()
  expect(has(officialWarn(), TUE, 'CREW_REST', 'bane'), 'published face (View-only Sched)').toBe(false)
  expect(has(workingWarn(), TUE, 'CREW_REST', 'bane'), 'working copy, nothing changed on it').toBe(false)
})
// same shape: day(MON).sims.oft.push({label:'BFM-9',str:'19:30',end:'',p:'bane',w:'',rmks:''}); VCONF.simLen = 180 → red
// mirror: publish(MON) instead; VCONF.openEnd = 120; expect(has(workingWarn(), TUE, 'CREW_REST','bane')).toBe(true) → red (false)
```

---

### F2. With a change waiting that the new check misses, Edit Schedule does not preview the amendment. Publishing then turns the face red with no warning beforehand.

**What goes wrong**
- Setup: his case. Tuesday is published under a 12-hour crew rest and the setting is raised to 13. Tuesday stays clean, which is correct.
- Action: the scheduler hides an unrelated tight-turn advisory on Tuesday. That is one change waiting (D471), and the day reads pending.
- Edit Schedule still judges Tuesday by the kept 12 hours, so it shows no crew-rest flag.
- He signs and publishes the amendment. The new version keeps today's 13 hours, and its face is now red for Ranger.
- The working copy never showed what the amendment would do. The agent's reading of D2005 says a day with a change waiting "previews its next amendment … today's settings".

**Cause**
- `validate.ts` `untouchedKept` decides whether the day counts as untouched using only these checks: the content (`canonicalDiff`), the filing, the inputs, the people on the day (`pa`) and the printed brief.
- It misses three ways a day can have a change waiting:
  - the hide comparison (`hideDelta`);
  - the OIL decisions (`oilDelta` — the OIL block is not part of `canonicalDiff`);
  - the OIL Logic-values entry (`oilrv:`).

**Fix**
1. In `untouchedKept`, replace the hand-picked content, filing and input checks with `if (dayDeltaCore(di).length > 0) return`. That covers the content, the filing, the inputs and both OIL entries in one call; it does not read warnings, so it is safe before the working pass.
2. Keep the `pa` and brief-lead checks.
3. Add a hide check: take the working hides for this day (the keys in `HOOKS.hiddenKeys()` that start with `${di}|`) and compare them with `new Set(snap.w?.wo || [])`. Any difference means not untouched.
   - Do not call `hidePending` here: it reads the previous pass's tables.
4. Put the same predicate into F5's fix.

**Proof test (red: expected [false, true] to equal [true, true])**
```ts
day(MON).waves.push(wave([form({ cs: 'LATE', to: '18:00', ld: '19:00' })]))
day(TUE).waves.push(wave([form({ br: '09:40' }), form({ cs: 'T1', to: '14:00', ld: '15:00', aircraft: [ac('stiff')] }), form({ cs: 'T2', to: '16:00', ld: '17:00', aircraft: [ac('stiff')] })]))
VCONF.tightTurn = 120
publish(TUE)
const turn = ws(officialWarn(), TUE).find((w: any) => w.code === 'TURN')
VCONF.crewRest = 13 * 60; validate()
const k = hideKey(turn); HOOKS.hiddenKeys = () => new Set([k]); validate()
expect(dayDelta(TUE).length).toBeGreaterThan(0)
const workingRed = has(workingWarn(), TUE, 'CREW_REST', 'bane')
sign(TUE); publishALDay(TUE); validate()
const faceRed = has(officialWarn(), TUE, 'CREW_REST', 'bane')
expect([workingRed, faceRed]).toEqual([faceRed, faceRed])   // got [false, true]
```

---

### F3. The crew picker's two cross-day questions, and the dotted run mark's words, still read today's settings. The validator now reads the judged day's.

**What goes wrong**

(a) **The dotted run mark is worded differently from the warning it points at.**
- Saturday is published under a limit of 5, then the limit is raised to 6, and a sixth day makes Saturday break.
- Saturday's warning says "6 days in a row — **5** is the limit".
- The dotted marks on Monday to Friday say "**6** is the limit".
- The project's own marks-guard (`testing/marks-guard.ts`) throws on this: "next-day mark on day 4 for bane points at a DAYS_RUN warning on day 5 that is not there, word for word".
- On a run that crosses into next week, the mark is matched to its warning by the warning's words (`hideKey`). So a hidden DAYS_RUN warning on next week's Monday does not take its Sunday marks away when the limits differ.

(b) **The picker misses a run breach.**
- Saturday is published under a limit of 5, then the limit is raised to 6. Ranger is on Monday, Tuesday, Thursday, Friday and Saturday.
- The picker's line for putting Ranger on Wednesday is empty.
- After the drop, Saturday — published and untouched, so still judged by its kept 5 — shows a hard DAYS_RUN.

(c) **The picker misses a crew-rest breach.**
- Tuesday is published under 13 hours, then the setting is put back to 12.
- The picker says nothing when Ranger is placed on Monday's LATE.
- After the drop, Tuesday's working copy and its published face both show CREW_REST, because Tuesday is judged by its kept 13 hours.

**Cause**
- `validate.ts` `runIfPlaced` uses `VCONF.maxRun`, and `crossDayIfPlaced`'s wording uses it too.
- `restIfPlaced` runs `CREWREST_BODY` at screen time with no overlay.
- `runSays` inside `traceRun` (line ~424) and in the next-Monday trace (~440) runs outside the day overlay.
- Not proven, same root: `REST[di]` (the SC picker's clearance) is built under an untouched published day's kept settings, but a drop on that day flips it to today's.

**Fix**
1. Run-mark words: in the trace block, compute the words with `withDayRules(DAYS[i], () => runSays(id, n))` for the day that breaks, and pass them into `traceRun`. For next Monday use `withDayRules(nextMondayDay(CURWEEK), () => runSays(id, n + 1))`.
2. `runIfPlaced`: compare each day k against its own limit. Use today's `VCONF.maxRun` for the target day `di`, since the drop edits it. Use `withDayRules(DAYS[k], () => VCONF.maxRun)` for k ≠ di, and `nextLimit` for next Monday. Return that limit and put it in `crossDayIfPlaced`'s text.
3. `restIfPlaced`:
   - the backward probe judges `di`, which the drop edits, so leave it with no overlay;
   - in the forward loop, wrap each probe in `withDayRules(index < 7 ? DAYS[index] : next.src, () => CREWREST_BODY(...))`;
   - `datedRestSeed` already carries `src`.
4. SC picker: keep a today's-settings clearance map for each day (or compute it on demand under no overlay), because placing a man edits the day.

**Proof tests (all red)**
```ts
// a  (HOOKS.validated = null to get past the guard)
VCONF.maxRun = 5
for (const di of [0,1,2,3,4,5]) day(di).waves.push(wave([form()]))
day(1).waves[0].formations[0].aircraft[0].p = ''
publish(5)
VCONF.maxRun = 6; validate()
day(1).waves[0].formations[0].aircraft[0].p = 'bane'; validate()
const satW = ws(workingWarn(), 5).find((w: any) => w.code === 'DAYS_RUN')
const tr = (workingWarn().traces || []).filter((t: any) => t.w && t.w.code === 'DAYS_RUN' && t.w.di === 5)
expect(tr.map((t: any) => t.w.msg)).toEqual(tr.map(() => satW.msg))   // "6 is the limit" ×5 vs "5 is the limit"
// b
VCONF.maxRun = 5
for (const di of [0,1,3,4,5]) day(di).waves.push(wave([form()]))
day(WED).waves.push(wave([form({ aircraft: [ac('')] })]))
publish(5); VCONF.maxRun = 6; validate()
const said = crossDayIfPlaced('bane', `${WED}.0.0.0.p`)
setSlotVal(`${WED}.0.0.0.p`, 'bane'); validate()
// flagged: true (Saturday DAYS_RUN), pickerSays: ''
// c
VCONF.crewRest = 13 * 60
day(MON).waves.push(wave([form({ cs: 'LATE', to: '18:00', ld: '19:00', aircraft: [ac('')] })]))
day(TUE).waves.push(wave([form({ br: '09:40' })]))
publish(TUE); VCONF.crewRest = 12 * 60; validate()
const said2 = crossDayIfPlaced('bane', `${MON}.0.0.0.p`)
setSlotVal(`${MON}.0.0.0.p`, 'bane'); validate()
// flagged: true, onFace: true, pickerSays: ''
```

---

### F4. A Logic change still makes a published day pending and drops its four sign-offs, through the "same take-off and landing" advisory's words.

**What goes wrong**
- Setup: Tuesday is published with a sortie typed 12:00–12:00 and its rally box at 12:00. The advisory (FLT_NO_LEN) says "the day still earns from the report and debrief". Nothing is pending and the four sign-offs stand.
- Action: "Flight debrief after land" is changed from 120 to 0.
- Result: `dayDelta` holds one "warnings changed" item and `daySigned` is false. The day reads 1 pending and its four sign-offs fall.
- Rulings: D2005 and D186 (only the printed brief reads pending).

**Cause**
- FLT_NO_LEN is a frozen-class warning, so it is compared; it is not in `LIVE_ON_FACE`.
- Its words come from `oil.ts` `fltMeasuresNothing`, which this build switched to `ruleNow('reportLead')` / `ruleNow('debrief')` — always today's, even inside the day's own checks.
- The official pass therefore rewords the published day's warning, and `warnDelta` sees a change.
- Same root: `dayOilBlind`'s `zeroShift` uses `ruleNow('reportLead')`, so the live OIL_NO_TIMES advisory can appear or disappear on a published face after a setting change.
- `fltNoLenSays` mixes the two sources: `saZeroSpanWin(wv, f, VCONF.reportLead)` reads the kept value inside the overlay, while `fltMeasuresNothing` reads today's.
- This was already true before D2005, when everything read today's, but it breaks the new promise.

**Fix**
1. Give `fltMeasuresNothing(wv, f, lead?, deb?)` optional values. Have `validate.ts` (the FLT_NO_LEN loop and `fltNoLenSays`) and `dayOilBlind` pass `VCONF.reportLead` / `VCONF.debrief`, which inside the day loop are the day's kept values.
2. Leave the OIL credit (`dayOilWork` with `opts.rv`) unchanged.
3. This also brings the words in line with a published day's own OIL credit, which uses the OIL block's kept values captured at the same publish.
4. If the host reads this advisory as "OIL" and therefore outside D2005, the alternative is to add FLT_NO_LEN to `LIVE_ON_FACE`. Either way, put it to him.

**Proof test (red: expected [['warn'], false] to equal [[], true])**
```ts
day(TUE).waves.push(wave([form({ to: '12:00', ld: '12:00', rl: '12:00' })]))
publish(TUE)
expect(has(officialWarn(), TUE, 'FLT_NO_LEN')).toBe(true)
expect([dayDelta(TUE), daySigned(TUE)]).toEqual([[], true])
VCONF.debrief = 0; validate()
expect([dayDelta(TUE).map((e: any) => e.kind), daySigned(TUE)]).toEqual([[], true])
```

---

### F5. Across the week's edge, Edit Schedule judges next week's published Monday by its kept settings while Monday's own working copy uses today's.

**What goes wrong**
- Setup: next week's Monday is published with a blank B (brief printed at 09:40). This week's Sunday has a duty ending 21:30.
- Action: the admin sets crew rest to 13 hours and moves the brief lead by one minute (141). Monday now reads 1 pending for the printed brief (D186).
- On next week, Monday's working copy uses today's settings and shows a CREW_REST breach.
- On this week, Sunday's Edit Schedule draws no "Breaks Monday".
- The two working passes disagree, which is the mismatch `kept-rules-neighbour.test.ts` exists to prevent. The same happens when a man on Monday has his CAT, seat or similar changed (the people on the day).

**Cause**
- `weekctx.ts` `keepUntouchedRules` checks only the content, the filing and the inputs.
- It lacks the people (`pa`) check and the printed-brief check that `untouchedKept` has, and, after F2, the OIL and hide checks.

**Fix**
1. Write one shared predicate (in `weekctx.ts` or `faceattrs.ts`), for example `untouchedAgainst(snap, day, dt, di)`. It returns false on any of:
   - `canonicalDiff(snap.d, day, di)`;
   - the filing;
   - `frozenInputDiffs`;
   - `snap.pa` against `peopleAttrsNow(snap.pa)`;
   - `faceRuleValsCompared(snap.d) && +snap.rv.briefLead !== +VCONF.briefLead`;
   - the OIL block key, compared as in `oilDelta`;
   - the hide set against `snap.w.wo`.
2. Use it in both `untouchedKept` and `keepUntouchedRules`.
3. Do not reuse `dayDeltaIn` for the stashed week: it compares against the loaded `DAYS[di]`.

**Proof test (`src/state/`, setup from `kept-rules-neighbour`; red: { sunMark: false, monWork: true })**
```ts
loadWeek(W2)  // Monday: VL 12:00–13:00, br '' (blank), bane; publish(MON)
loadWeek(W1)  // Sunday: duty 1300–2130 for bane
validate(); expect(traceOf(SUN, 'bane')).toBeFalsy()
;(VCONF as any).crewRest = 780; (VCONF as any).briefLead = 141; validate()
const sunMark = !!traceOf(SUN, 'bane')
loadWeek(W2); validate()
const monWork = crWork(MON, 'bane').length > 0   // working pass CREW_REST on Monday
expect({ sunMark, monWork }).toEqual({ sunMark: monWork, monWork })
```

---

### F6 (low; not run). Warning headings and chip tooltips quote today's threshold on a day judged by its kept one.

- `validate.ts` `wlbl` fills `{crewRest}`, `{longDay}` and similar from VCONF at screen time. It is used by `html.ts` (lines 538/553/1201/1221/2606), `board.ts` 515 and Insights.
- Example: Tuesday is re-published under 13 hours, then the setting is put back to 12. The face keeps the breach for 12h40 of rest, but its heading reads "Crew rest (<12h)", and the breach's own words, built inside the overlay, say 13h.
- Fix:
  1. In `faceattrs.ts`, add `ruleShown(k)`, which returns `FA.rv[k]` (falling back to `VCONF[k]`).
  2. Let `wlbl(s, di?)` take the day: inside a face render use `ruleShown`; on the working pass use a per-day map of the untouched days' kept values that `validate()` exposes.

### F7 (low; not proven). The window of neighbour days the official pass reads is sized by today's limit.

- `windowFiling`, `windowInputs` and `windowDiverges(CURWEEK, VCONF.maxRun)` use today's limit.
- `seedRunIn` now walks back as far as the largest kept limit.
- When a published day keeps a larger "Max days worked in a row" than today's, the days beyond today's limit are read with the live filing and inputs instead of the signed ones.
- Fix: pass the same largest limit to all three.

---

### Notes for the host (not findings)

- **OIL still makes a published day pending, by D592's design.** On a published weekend or holiday day, changing the default rally, the debrief or "Full day of OIL" in a way that moves a man's OIL reads 1 pending and drops the four sign-offs. This is a Q5 route left in place by the reading that OIL is not covered. With F2's fix, such a day would also switch its working copy to today's settings.
- **Any edit flips the whole day.** Once a published day is edited, all of its checks switch to today's settings. Adding a WSO to another line makes Ranger's untouched seat go red. The new test file pins this, and the reading was not checked with him; worth telling him with a picture.
- **OIL helpers read kept values inside the overlay.** `reporting.ts` (`scIntime` default, `resolveReporting`'s `instant`, `reportingSortKeys`) and `time.ts win()` read VCONF directly. OIL helpers called inside a day's overlay — validate's OIL advisories — therefore take kept values for the midnight roll-over and assumed ends. The OIL credit itself is computed outside any overlay, so no money moves.

### Explicit negatives, per question

- **Q1:** Every check in the day loop, `collectEvents`, the run limits, the phantom next Monday, the neighbour seeds and the issued week all run inside `withDayRules` / `withKeptRules`. That covers View-only Sched, the issued face, print and CSV (export reads `fi.rv.briefLead`), and the Board, which reads the working WARN. Readers outside the overlay that matter are F3 (picker probes, run-mark words), F4 (`fltMeasuresNothing`, `dayOilBlind`) and F6 (`wlbl`). The edit-mode R and B suggestions (`html.ts` 1971, `board.ts` 270) are today's by design, as an edit preview.
- **Q2:** `KEPT_RULE_KEYS` covers every VCONF key a check reads. Not kept, correctly:
  - `oilFullMin` (OIL);
  - the inputs and SANS cut-offs (`inputLead` / `*Cut*`, read only in `inputs.ts` and `state/cutoff.ts`, never by validate);
  - `reportText` (text);
  - `dur` and `minTurn` (unused);
  - input-type `shiftHard`, which is a fixed table and not a setting.
  Nothing is kept that grades OIL credit or inputs.
- **Q3:** The defects are F1, F1 mirror, F3a and F5. Otherwise "the day being judged decides" holds: crew rest's debrief and crew rest, the dotted crew-rest mark (written under the judged day), and the run limit and next-Monday limit.
- **Q4:** The defects are F2 and F5.
  - Load onto working copy, Unpublish, undo/redo, a saved plan (a plain edit) and a week change are all decided by `canonicalDiff` and the current version, and I found nothing wrong in them.
  - A reload keeps `rv`: the schema spec and `state/weekrows.ts` carry it.
  - An input change and a filing change are covered.
- **Q5:** F4 is a route; the D592 OIL route is noted above. `warnDelta`'s narrowing to `{briefLead}` loses no real change, because before this build `rv` held only the brief lead. Publishing does not create a pending change: the new version has no `rv` while `issuedWarn`'s validate runs, so its stored warnings and its `rv` are both today's.
- **Q6:** `withRuleVals` restores in a `finally`, including on a throw. In nested calls, inner and outer each restore their own values. `RULE_LIVE` is the outermost snapshot of today's values, so `ruleNow` is right in nested calls, including when the outer call returned early. I found no re-entrant `validate()` inside an overlay: `HOOKS.oilNoPeriod` / `oilEarningDay` only read, `issuedWarn`'s `validate()` runs outside, and `dayRuleVals()` runs after `issuedWarn` returns.
- **Q7:** The OIL credit is unchanged: `oil.ts` reads `ruleNow`, which equals VCONF outside overlays, and a published day uses the oilev `rv`. Insights' hours come from `issuedWorld` → `ISS_EVD = hoursEvd()`, rebuilt with no overlay, and `workSpan` reads VCONF at call time. They move at once for the default rally, the debrief, "Assumed length" and "Assumed sim length". Nothing found.
- **Q8:** The Original (line 519) and an amendment (line 1393) both go through `freezeWarn` → `dayRuleVals()` (today's values plus the SC MAIN clash table). I found no other path that creates a version; there is no separate EOD writer. A version with only `briefLead`, or no `rv`, reads today's for the rest; this is the D56 demo-data case.
- **Q9:** The missing call sites are F3 (the picker, run and crew rest; the SC picker's REST map by reasoning) and F6 (labels).