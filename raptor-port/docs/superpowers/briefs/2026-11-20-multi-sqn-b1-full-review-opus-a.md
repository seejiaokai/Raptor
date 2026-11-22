# The full review (D2235), area A — the fresh Opus reader's report (blind; copy at `424a4310c`)

Reader: a fresh Opus reader, a background helper of chat 123, blind to the other five readers and to the builder's
report; brief `2026-11-20-multi-sqn-b1-full-review-brief.md` with area A (the Leave War and the Tracker); its own exported
copy of `424a4310c` with `AREA.patch`; finished whole. Not yet reproduced by the host. The report as returned:

---

AREA A REVIEW: the Leave War and the Tracker (blind Opus reader, copy at 424a4310c)

Method: I read AREA.patch whole, then the code it calls (state/units.ts, engine/roster.ts, state/store.ts sign-in and unit switch, boot.ts, the command guard, undo's NOT_UNDONE_TYPES, absences/schedrecs, the OIL ask path). I ran two proof files, one at a time. I deleted both before finishing, so the copy is clean.

---

## F1 (highest): one squadron's public holiday still reaches the other squadron. Breaches D2195. The backlog already lists the fix as owed, but it has not been done at this commit.

**What happens.** When 142's admin adds a public holiday, 149's war reads that day as a public holiday (149 is at the same place). That changes 149's leave charging, its OIL earning day, its calendars and its Holidays list. 149's schedulers also get the "Inputs need an OIL answer" line, and the holiday warning (R32) names 149's published days. D2195's full row says "a holiday one squadron adds never touches another squadron's days, OIL or bell". The OUTSTANDING item [MULTI-SQN-DESIGN] says "step 4's holidays by place undone". At this commit it is still all wired. The area's own test `holidays-by-place.test.ts` (its first case) still asserts the overturned behaviour.

**Proof, red** (holidays-by-place harness, 142's admin signed in, demo Wed 15 Jul):
- `holidayAdd({kind:'ph',from:WED,to:WED})`, then `nonWorkingFor('u149', WED)` gives **true** (expected false).
- After `as149()`, `dayFacts(WED).kind` gives **'ph'** (expected not 'ph').

**Cause.** All in `leavewar/sync.ts`:
- `setPlaceHolidays(() => placeHolidaysFor(worldUnit()))`, which store.ts reads through `withPlaceHolidays` in `getState`.
- `nonWorkingFor` (last line) consults `placeHolidaysFor`.
- `holidayOutOfDate` names other squadrons at the same place.
- `holidayTodo.toFor` tells every scheduler whose squadron has an open input.

**Fix steps** (several of these call sites are easy to miss):
1. Remove `setPlaceHolidays(...)` from `installAbsenceDoor`. Delete `withPlaceHolidays`, `PLACE_PH` and `PLACE_VER` from `getState`. Keep `period: cur.period`.
2. In `nonWorkingFor`, drop the `placeHolidaysFor(unit).has(iso)` line. Delete `placeHolidaysFor`, `ownPublicHolidays` and `PLACE_CACHE`.
3. `holidayOutOfDate`: return only `worldUnit()`'s entry.
4. `holidayTodo`: set `told = ownSchedulerIds()` filtered by `oilOpenOn(from, to, worldUnit())`, and pass `worldUnit()` in the `todo.push` test too.
   - Missing call site: `oilOpenOn` → `oilAskPlan` → `isNonWorkingISO` judges ANY squadron's input by the LOADED war's holidays. Without this step, 142's holiday still asks 149's inputs, and still tells 149's admins, after steps 1–3.
5. Rewrite `holidays-by-place.test.ts` to D2195 (the two proofs above as its red cases).
6. Update the R32 test of the warning wording, since "142's" was dropped (D2207).

---

## F2: a squadron's postings run on their date only if one of that squadron's own people opens the app that day

**What happens.** A posting out runs inside the posting pass of the war that is loaded (`runPoOutcomes`, which reads `getState().postOuts`). After sign-out the app reloads, and the boot always loads the boot squadron's war (142's). A sign-in then swaps in his own squadron's war. So:
- 142's postings run on any boot.
- 149's postings run only when a 149 person signs in.

On a day when only Saber (the master, home 142) uses the app, a 149 man posted out "Overseas Sqn" is not archived and his account stays open. Under "Delete" he is not deleted, so he stays on 149's pickers and rosters. 149's admins are not told until one of them signs in. Rulings broken: D2136/D1105 ("the app does the one picked on the posting date", "deletes him automatically") and D1546 ("nobody is ever gone silently").

The visible sign is missing too. Admin → Users' amber "cannot run" line (D2214, `postingHeldNote`/`poHeldReason`) reads only the loaded war. So the master's Admin → Users, which lists 149 men until step 5, never shows a 149 man's held posting.

**Proof, red** (fixread3-postlock harness):
1. Kestrel (`ad9`) runs `postOut('osp9','2026-07-16','overseas')`.
2. He signs out, the app reloads as the boot does (142's world), and the clock moves to 16 Jul.
3. Saber signs in and `runPoOutcomes()` runs.
4. Result: `PEOPLE.osp9.archived` is **undefined** (expected true), and his account is still on.

Control, green: the same steps with Kestrel signing in on 16 Jul archives him.

**Cause.** The pass is a fact of one module-level world. Other squadrons' stored postings are read only through the new A3 store (`state/foreign.ts`), and only for Admin → Users' four doors.

**Fix steps:**
1. In `runPoOutcomes`, after the loaded world's scan, scan each other unit's stored profiles. Use `readForeign(WORLD_DOOR(u).backend, pid)` for every `profile:` key holding a due `post`.
2. Run those through the pure halves that already exist (`stintClosed`, `personCut`, `keepsWindow`), writing via `foreignWar(u)` enlisted in the pass's one command. That is the same shape as `archivePerson`/`deleteOnForeign`.
3. Notices go to that unit's admins (`schedulerIds().filter(pid => homeUnitOf(pid) === u)`).
4. Make `poHeldReason`/`postingHeldNote` read the man's own unit's stored post (`foreignHome`) the same way.
5. Red test: the proof above.

If the owner would rather leave this to a scheduled flow at the database step, it should be filed and told to him, because today it is a silent delay.

---

## Explicit negatives (checked, nothing found)
- **foreign.ts rollback/Undo.** person.archive, person.restore and person.delete are not Undo steps (`undo/timeline.ts NOT_UNDONE_TYPES`), so a whole-slot `restore` cannot rewrite other men. `load()` runs outside the command, or before `enlist` inside the delete, so the guard never sees an un-enlisted change. A refused command writes nothing (the writer is on `onCommit`, which a rollback never fires).
- **OIL pass by squadron.** Eligibility checks `homeUnitOf(id, iso) === unit`. The reverse sweep skips other units' days. The stash is read by qualified key. `live` only applies when the unit in view is the war's. Today `UNIT === worldUnit()` for everyone, because both are set at sign-in.
- **ALL AVAIL crowd** (`availableFor` → `rosterOf(UNIT, iso)`) and the SANS figures (`sansFlyOwn`) are one squadron's.
- **Bell routing.** `ownSchedulerIds`, `atWarHome` in `tellWar`/`warAudience`, the `postingLinesOf` filters and `followUpsOwed` match D2218 and D2222 as worded.
- **demoworld.** The demo overlay applies only to u142. 149's first world gets the seed's periods with no records.
- **Tracker.** The doorway binds the signed-in person's own squadron at the first `init`, and refuses a rebind once loaded. Sign-out reloads (`ui/logout.ts`). peoplewire offers `unitPeople(unit)` and `inputsFor(unit)` only, so a 149 man is never offered on 142's course.
- **Matrix/reanchor** (a scroll fix, not multi-squadron). The shift arithmetic `cellLeft - (anchorLeft - moved)` has the right sign, dot-floor landing is correct at a scale of 1.25, and nothing loops.

## Risks not proven: they become faults once step 5 lands
- `postInNewPerson` reads `projectPeople(true)`, which is the loaded war only. When New person gains its home-squadron choice (D2094), a master adding a 149 man with a post-in date gets "That did not save". It needs the foreign path, as Restore has.
- Under D2197, a master's pick must move the Leave War and the Tracker. Today the Tracker refuses a rebind for the life of the page, and the war swaps only at sign-in. Both need a deliberate swap path, not a reload.

---

## The shape (D2235): where this area keeps breeding faults

1. **"Which squadron?" has five answers that agree only by accident:**
   - `worldUnit()` (the war loaded)
   - `UNIT` (the schedule in view)
   - `myUnit()` (the signed-in person, today)
   - `homeUnitOf(pid, iso)` (by date)
   - `storageUnit()` (the Tracker's binding)

   "Is this a day off?" likewise has three bodies:
   - `isNonWorkingISO`: the loaded war
   - `nonWorkingFor(unit)`
   - `HOOKS.oilEarningDay`: the unit in view

   F1's missed call site (`oilAskPlan`) is this pattern. Each fix-read cycle has found one more place that asked the wrong one.

   Simpler: one `PageUnits` value set at sign-in and at the menu pick (`{war, view, tracker}`), and day facts as a function of `(unit, iso)` only, with the loaded war just a cache of it. Removes: wrong-squadron day-off and OIL answers, and divergence when step 5's menu separates view from home.

2. **Two writers of a squadron's war.** `store.ts` writes the loaded war; `foreign.ts` and the duplicated rules in sync.ts (`pastOnForeign` vs `pastOnWar`, `foreignShows` vs the hidden rule, `foreignPerson` vs `dated`/`withStored`) write every other war. Each new door (F2's pass, New person's post-in) must be written twice, and a fix to one copy misses the other.

   Simpler: make the war store an instance per unit (a factory, not a module singleton swapped by `initStore(keepListeners)`). The page holds the one it shows, and any command can open another unit's instance through its door. Removes: "acted on the loaded war instead of his own" (A3 and F2), and stale module caches across swaps (`STORED`, `PLACE_CACHE`, `LEFT`, `MERGED`), each of which needed a hand-written clear.

3. **Passes run per loaded world.** That covers posting, OIL, absences and holiday tells, so anything dated depends on who opens the app (F2).

   Simpler: a per-unit pass over stored rows, from the pure halves already extracted, or explicitly the database step's scheduled flow.

4. **Bell lines are plain functions any command may call, so the gate re-derives what each writer "owes".** The probes are `setWarLinesOwed`, `setHolidayLinesOwed`, `setFollowUpsProbe` and `setLwPostingProbe`. Fix reads 6 to 13 each added one.

   Simpler: lines produced only as a projection from a command's own changes, never by a callable writer, with the gate checking that the projection ran. Removes the whole "made-up line signed as someone" class.

Rulings: none this session (read-only review).
Context: not measured (no usage tool called).
