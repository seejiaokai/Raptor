# The full review (D2235), area C — the fresh Opus reader's report (blind; copy at `424a4310c`)

Reader: a fresh Opus reader, a background helper of chat 123, blind to the other five readers and to the builder's
report; brief `2026-11-20-multi-sqn-b1-full-review-brief.md` with area C (the engine and the screens); its own exported
copy of `424a4310c` with `AREA.patch`; finished whole. Not yet reproduced by the host. The report as returned:

---

AREA C REVIEW: the engine and the screens (fresh Opus reader, blind). Copy at 424a4310c.

Method: I read the whole of AREA.patch. I followed each reader and writer into the code it calls: roster, units-model, the commit gate's inputUnitViolation, store.ts switchUnit and sessionUnit, avail.ts, the week stash's callers, and the person filter on the Inputs page. I proved the faults with a scratch test, src/engine/zz-proof-c.test.ts. I ran it on its own with `npx vitest run`, then deleted it. The test sets the clock to Tue 14 Jul 26 and installs a home resolver: man X is 142's until 15 Jul and 149's from Thu 16 Jul (a move made today counts from a later day, D2119). The real move command, units.ts setHome, writes exactly that kind of row.

## Findings, ranked by consequence

### F1: after a move, the day panel's "free all day" counts people by today's squadron, not the day's. The same count is frozen into every published day. (Medium-high)
**Failing input (red):**
- Take 142's Fri 17 Jul (DAYS[4]). X is 'dj', taken from availByWave(d).anyWave before the move.
- `rosterOf('u142','2026-07-17')` correctly leaves dj out. This is the list the crew palette (palette-html.ts rosOn) and the SANS count (html.ts availHTML) read.
- But `availByWave(DAYS[4]).anyWave` still contains 'dj'. RED: "expected [ 'dj', 'glass', … ] to not include 'dj'".
- `rosterIds()` also contains him. That is the roster publish.ts:764 freezes as `snap.ros`.
- The mirror image: with 149 in view, `rosterIds()` returns []. RED: "expected [] to include 'dj'".

**Effect:**
- 142's scheduler sees dj "free all day" on days after his move, but cannot find him in the crew list beside it to drag. 149's panel never counts him.
- On publish, the wrong roster goes into the issued version (`snap.ros`). The published day's free list and Insights' "who is not flying" (validate.ts issuedRoster) keep the error for good.
- It cuts against the per-day reading in his rulings: stints (D327), and an archived man not counted from his date (D323).

**Cause:** faceattrs.ts `rosterIds()` calls `rosterOf(UNIT)` with no date, so it reads today. avail.ts availByWave reads it through `rosterShown()`.

**Fix:**
1. Give rosterIds a required date: `rosterIds(iso: string)` → `rosterOf(UNIT, iso)`.
2. Have `rosterShown(iso)` pass it through. In avail.ts availByWave, compute the iso from `d.dt` (inputAtIso(d.dt), or dayIso(CURWEEK, di) at the call site).
3. In publish.ts:764, freeze `snap.ros = rosterIds(dayIso(String(CURWEEK), di))`.
4. In validate.ts issuedRoster, read `rosterIds(dayIso(CURWEEK, di))` for each unpublished day instead of sharing one `now` list.
5. The same today-reading sits in three other places, each to be dated the same way:
   - interactions.ts:1343, the reassign pool: `rosterOptions()`.
   - publish.ts signPeople, the sign-off boxes: `rosterOf(UNIT)`.
   - PeoplePick when no unit is passed.
   Each schedule caller should pass the day it acts on.
6. A test pins `availByWave(day after move)` against `rosterOf(UNIT, thatDay)`.

### F2: a man's own input dated after his move disappears from his own Inputs page and calendar. The squadron's lists also judge "whose input" differently from its days and from the commit gate. (Medium)
**Failing input (red):**
- bane (142's today, 149's from 16 Jul) files his own leave for 20–21 Jul. The gate allows this: inputUnitViolation's "a man's own input… is his whatever its squadron… a 142 admin moved to 149 from tomorrow could… file his own leave for next week".
- The Inputs page, its month, its Deleted group and the person filter all read `inputsFor(myUnit())`, which for him today is `inputsFor('u142')`. It does not contain the leave. RED: "expected false to be true".
- The leave is pinned once on save (INPREVEAL). After he leaves the page, it is gone until midnight.

**Effect:** he cannot see, edit or delete what he just filed. If he files again, his own leave clash rule refuses him over a leave he cannot see.

**Control (green, shows the second half):**
- A leave of bane's for 14–17 Jul, started before the move.
- `inputsFor('u149')` leaves it out, so 149's Inputs page never lists it.
- With 149 in view, `inputsOn('Jul 17')` includes it: 149's Friday shows him away on a leave 149's admins cannot find.
- The gate (perms.ts unitsOf/daysOf) treats the same input as touching both squadrons: its first day plus every move inside its span.
- So one input is judged three ways: lists by its first day, days by that day, the gate by its whole span.

**Cause:** engine/inputs.ts `inputsFor(unit)` with no `at` judges only the input's first day (`inputBelongs`, falling back to `inputAtIso(r.date)`).

**Fix:**
1. Add `inputTouches(r, unit)` in inputs.ts. It is true when any named man is `unit`'s on the first day or on any home change inside the span, the gate's daysOf rule. The engine needs the home-change dates, so the resolver also exposes `homeChangesIn(pid, a, b)` from state/units.ts.
2. List readers use it: InputsPage rows and DeletedGroup, the InputsCal month and `hidden`, inputsFor's no-`at` path.
3. Always include `holds(r, me())`, so his own input is always on his page.
4. Keep the day readers (inputsOn, reconcileDayFiling, freezes) as they are.
5. A test: own leave after the move is listed; a leave across the move is listed on both squadrons' pages.

Editing it per squadron stays held (D2221, "only a master or the man, as built"). That is not part of this finding.

### F3: the squadron filter made every "inputs on this day" reader about 47 times slower. (Low-medium; performance)
**Measured (scratch test):** `inputsFor('u142','2026-07-14', 5,000 inputs)` with one home row per person (63) took 3.30 ms a call. A plain pass over the same list took 0.070 ms.

**Where it bites:** the readers that used to be a cheap `INPUTS.forEach(covers)` now run the home lookup on every input before the date test:
- reconcileDayFiling
- dayInputsFrozen
- dayFilingFingerprint
- filingRestorePlan
- dayDiscardCount
- frozenInputMatch
- liveFilingAt
- projectOilInputs
- oilEvidenceNow

Several run for each day on every validate or repaint, so a year of inputs costs tens to hundreds of ms per keystroke. Before the batch, only the date test ran.

**Cause:**
- `inputsFor(unit, at)` filters by `inputBelongs` first; the caller then tests coverage.
- `homeUnitOn` filters and sorts all home rows on every call.

**Fix:**
1. When `at` is given, test `inputCoversDate(r, at)` first, as inputsOn already does. A home lookup only for inputs covering the day removes nearly all of it.
2. Index homes by pid once in units-model rowsFrom (`Map<pid, sorted rows>`).

### F4 (low): the Inputs page's person filter lists the schedule-in-view's people, not his own squadron's.
InputsPage's `people()` is `rosterOptions()`, which defaults to UNIT. Every other list on the page uses myUnit(). UNIT is fixed at sign-in (store.ts sessionUnit, today), while myUnit() reads today's date live. So a session open across a move's midnight shows the old squadron in the filter and the new one in the rows. When the master's menu (D2197, filed) lands, the two will disagree for him every time.

**Fix:** `rosterOptions(myUnit())` there, plus the same date fix as F1.

No proof run for F4. The input is to sign in, cross the move's date, and open the Filters box.

## Explicit negatives (checked, nothing found)
- **Saved settings per squadron (hooks.ts):** storedKey/keys round trip is clean. A unit prefix lists the unit in view's names in plain form, and get/set re-qualify them. Community keys holding "@" stay plain. Mission roles and history lines are left unqualified on purpose.
- **Saved-week memory (weekstash.ts):**
  - Every map is keyed by the unit-qualified week, including the source-rows memo and preserved blobs.
  - stashDays strips the unit before landing requests (wkOf then viewOfWeek). That would land the wrong squadron's requests on a qualified key from another squadron, but all three callers pass bare keys: weekctx bundle, peek, and the official world. The OIL pass and the holiday warning read their blobs raw (stashOilWeek).
- **weekctx.ts:** the bundle cache is keyed by unit; the hidden-rows memo is keyed by blob content.
- **weeks-data.ts / week149.ts:** 149's demo row ids ('r9s…') never collide with 142's, and nothing parses the 'rs' prefix. Every other 149 week is blank.
- **verid.ts:** dayIso reads the date part only after splitting off the unit.
- **boardland.ts:** compares day keys with the unit included.
- **editlog.ts:** the history loads only the squadron in view's lines; the sweep and the 2,000 cap touch only that list; switchUnit re-reads it (store.ts:842).
- **logout.ts:** the order is the Tracker's question, end session, flush, then reload. The case where a sign-in comes before a held save lands is D2205's M2, already filed.
- **OIL answer list (OilDayList / oilday.ts):** list and save both scope to myUnit. oilputback.ts scopes its "stood" and "back" sets to the unit in view.
- **Medical counts:** the tab's lists and the Inputs page's counts use the same today/myUnit test.
- **Deleted and posted-out men:** they keep their home rows (nothing deletes them), so the Deleted and Posted out / archived groups still find them.
- **SANS calendar and day:** cells and day groups read his squadron's people on that date.
- **Engine landing and freezing:** overlay landRequests and landingDue judge the start day, which agrees with reconcileDayFiling on the landing day.
- **Notes on held items:** the holiday form names other squadrons (D2195, filed). Master follow-the-pick is P3 (D2197, filed).

## The shape: where this area keeps breeding faults (D2235; recommendations only)
1. **"Whose" is judged on four different dates:**
   - rosterOf/homeUnitOf default to today.
   - inputsFor with no date uses the input's first day.
   - inputsFor with a date uses that day.
   - The gate uses the first day plus every move in the span.

   The notices use their own rules again. F1 and F2 are both this. Simpler: make the date a required argument (no `= rosterToday()` default), and keep two named questions, `onDay(unit, iso)` for day readers and `touches(unit, span)` for list readers. That removes the whole "wrong date by default" class.
2. **Two squadrons, picked by hand at about 20 call sites:** UNIT and myUnit() are chosen per call, guided by comments. The Inputs page already mixes them: rows from myUnit, the filter, column settings, planning pucks and flying plan from UNIT. One resolver per page, `pageUnit('inputs' | 'quals' | 'schedule')`, would make P3 (D2197) a one-line change and remove the F4 class.
3. **The guards count spellings, not meaning:** they count the literal `Object.keys(PEOPLE)` and `INPUTS`. Wrappers escape them: rosterOptions(), whoId by callsign, the pins' `INPUTS.find(iid)`, the inputsInMode argument. Because they count numbers, an allowed file can swap one walk for another unnoticed. They did not catch F4. Better: lint for imports of PEOPLE/INPUTS outside a short list of modules, and make readers go through roster/inputs functions whose signatures require a unit and a date.
4. **Bare versus qualified week keys** meet in weekstash (`qk`/`wkOf`). A bare key silently means "the unit in view", which is a trap for the first caller that names another unit. Use qualified keys inside the engine and strip only at display.
5. **History lines decide their squadron by a chain of fallbacks** inside push (u0, then elogUnitOk, then the unit in view, then his own home), built up over three fix reads. Writers should state the squadron, and push should refuse a line that names none.

Rulings: none this session (read-only review).
Walk: none (a code read with unit proofs; the scenarios above need a walk).
