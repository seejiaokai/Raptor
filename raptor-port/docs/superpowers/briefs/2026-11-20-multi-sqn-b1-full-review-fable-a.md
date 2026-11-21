# The full review (D2235), area A — Fable's report (blind; copy at `424a4310c`)

Reader: Fable, a background helper of chat 123, blind to the other five readers and to the builder's report; brief
`2026-11-20-multi-sqn-b1-full-review-brief.md` with area A (the Leave War and the Tracker); its own exported copy of
`424a4310c` with `AREA.patch`; finished whole. Not yet reproduced by the host. The report as returned:

---

# Area A (the Leave War and the Tracker) — blind read, Fable

Copy: `claude/multi-sqn-b1-107` at `424a4310c`. No file under `raptor-port/src` changed. Two scratch proof files were run and deleted (`src/leavewar/zz-proof-a.test.ts`, `zz-proof-b.test.ts`), both on the harness of `multi-sqn-a3-foreign.test.ts`. Three findings, each red; all three need a move or a shared store. I found no fault in today's two-squadron demo flow. The area's own existing tests were read, not re-run.

## Findings, by consequence

### F1 — A move leaves both squadrons' Leave Wars wrong (red)

**Input (15 Jul 26, Saber signed in):**
- `setCell('bane','2026-07-08','LL')`, `setCell('bane','2026-08-10','LL')`, `grantOil(['bane'],1,'2026-06-03','past')`
- `setHome('bane','u149')` → ok, counts from 16 Jul.
- Clock to 16 Jul; Kestrel signs in, then Saber.

**Observed:**
- 142: `getState().people` has no `bane`, though his two records are still stored. His months in 142 (leave on 8 Jul, the OIL given on 3 Jun) have no row to show them.
- 149: `bane` is a row. From reading `projectPeople`, the row carries no start date, so he would read as 149's man for every month before he came (read, not asserted).
- 142's stored war was byte-identical across the sign-ins: nothing is destroyed, only hidden.
- Aside (the gate's, not reviewed): as Saber on 16 Jul, `setCell('bane','2026-08-11','LL')` on 142's war still returned true.

**Expected:** 142 keeps his row for the months he was there (D299's rule for a man who left); 149 counts him from his move day.

**Cause:**
- `raptorRoster.ts projectPeople` asks `onRosterOf(id, unit)` with the date defaulted to today, for a grid that spans a year.
- The only thing that keeps a departed man's row is a stored posting window (`store.ts setPeople`, `po[id].to`), and `home.set` writes none.

**Fix:**
1. In `state/units-model.ts` add `stintsIn(rows, pid, unit)` returning `{from,to}[]` from his Home rows (to = the day before the next row).
2. In `projectPeople`, replace the today test with "has a stint in `unit`". Where the war holds no stored window for him, set `from`/`to`/`past` from those stints.
3. `setPeople` and `reprojectRoster` keep laying a stored window over that, as now.
4. Tests: day before, move day, day after, move and back.

Carrying his balances across is batch 4's and is not claimed here.

### F2 — On his move day, a man still signed in is left on his old squadron's worlds (red)

**Input:**
- Saber: `setHome('bane','u149')`.
- Bane signs in (`us`), 15 Jul.
- Clock to 16 Jul 00:05, `raptorNotify()` (what the posting clock does at midnight).

**Observed:** `myUnit()` is `u149`, `worldUnit()` is still `u142`, and his own row is gone from the war he is looking at (`people.some(bane)` false, 50 rows).

**Expected:** his own squadron's Leave War with his row (D2132, D2087).

**Read, not run:** the Tracker stays his old squadron's too. `tracker/storage.js bindStorageUnit` refuses a second unit once loaded, and `peoplewire.ts` prefers `storageUnit()`. A phone left open overnight is the ordinary way to hit this.

**Cause:** the war and the Tracker are bound once at sign-in (`state/store.ts resetSession` → `swapWarWorld`; `markStorageLoaded`), while `myUnit()` is read live. `accounts.ts sessionNow()` remakes a session only when role or person changes, never home.

**Fix:**
1. `sessionFor` stamps `unit: homeOn(pid)` on the session.
2. `sessionNow()` also returns a fresh session when `homeOn(SESSION.pid) !== SESSION.unit`.
3. `App.tsx` already runs `resetSession(next)`, which swaps the schedule and the war.
4. In the session hook, if `storageUnit()` is set and differs from the new unit, send queued saves and reload through `ui/logout.ts`'s reload seam, as sign-out does.
5. Test: the input above, expecting `worldUnit()==='u149'` and his row present.

### F3 — Shared store: a person with no Home row is on no roster (red)

**Input:** `setUnitSeeds(false); projectPeople(true,'u142').length` → 0.

**Where it bites:** the boot's "person IT already made" form (`boot.ts bootstrapFirstAdmin`, `personId`) writes a Home row for the first admin only. Every other pre-made person then reads as homeless.

**Consequence:**
- Off the Leave War.
- Off the Tracker's + Add (`unitPeople`).
- Earns no OIL (`desiredOilCells` requires `homeUnitOf(id, iso) === unit`).
- No screen sets a home.

The demo cannot show this, because a man with no row falls back to 142 there.

**Fix:**
1. In `bootstrapFirstAdmin`, inside the same boot group, write a Home row to the first unit for every stored, non-special person who has none.
2. Add a guard test: no enumerated person has a null home on a shared store.

## Checked, nothing found

- **Sign-ins in turn (ran, green):** Kestrel writes a bid and an OIL grant, then Saber, Kestrel, Saber sign in. Both stored worlds stay byte-identical; the passes a swap runs write nothing to either.
- **OIL warnings after a swap (ran, green):** 149 given a public holiday 142 lacks (149 moved to another place), page left on 142, Kestrel signs in. The week's "OIL waiting" line matches a fresh re-check. I suspected a missing re-check in `swapWarWorld`; the war lane's signature compare covers it.
- **Admin role order (read):** the war's role mirror is set after the swap, so the swap's blank state does not demote a 149 admin.
- **Where writes go (read):** every war row goes through the loaded door (`backend` is replaced by `initStore`); nothing holds the boot door.
- **Second store, `foreign.ts` (read, against its own tests):** rules match `closeStintOnArchive`, `openStint` and `forgetPersonFrom`. A refusal rolls its slots back. A load inside the delete's command comes before the enlist, so the guard is satisfied. The man's Home rows survive his delete, so the door still finds his squadron.
- **A war nobody has opened** keeps a profile written into it (`early`). There is no "delete period" writer, so a world cannot fall back to not started.
- **Tracker:** "last course / last student" picks are keyed per person; no other browser storage bypasses the per-squadron door. It loads only after sign-in (`tracker/App.jsx`).
- **Revision numbers** are in memory and Undo clears at sign-in, so the war's unit-less ids do not collide within a page.
- **Grid landing (`Matrix.tsx`, `reanchor.ts`):** `reanchorPlan`'s shift corrects only what the redraw moved; `landingScroll` floors in screen dots; a click cannot clear the landing mark. Not multi-squadron code.
- **Speed:** `homeUnitOn` filters every Home row on each call and the rosters call it per person. Fine at two squadrons; worth indexing by person later.
- **Left alone as known:** holidays laid across squadrons by place (`placeHolidaysFor`, `holidayTodo` telling the other squadron) breach D2195; the next person getting the first squadron's Tracker while a save waits (D2205).

## The shape — where this area keeps breeding faults (recommendation only)

**1. Four answers to "which squadron".** `UNIT` (schedule in view), `worldUnit()` (war loaded), `storageUnit()` (Tracker bound) and `myUnit()` (home today, live), plus three hard-coded `'u142'` defaults (`BOOT_UNIT`, `WORLD_UNIT`, the demo fallback home).
- One function mixes them: `desiredOilCells(unit)` reaches `availableFor`, which reads `rosterOf(UNIT)`; `tellHoliday` asks `myUnit()` while `holidayTodo` asks the war; `peoplewire` uses `storageUnit() || myUnit()`.
- They agree today only because steps 5–6 are unbuilt. F2 is the first disagreement; the master's menu pick (D2197) will be the second.
- Simpler: one session squadron, set by one `enterSquadron(unit)` that moves schedule, war and Tracker together or reloads; every reader takes `unit` as a required argument.
- Removes stale-world faults and "right rule, wrong squadron".

**2. Membership asked "today" for surfaces that span time.** `onRosterOf(id, unit, iso = today)` feeds a year-long grid and OIL history; the war then patches it with stored posting windows.
- Simpler: Home rows are the stints; a war's roster is whoever has a stint overlapping its periods.
- Removes F1 and most of batch 4's transfer special cases.

**3. Two implementations of one war.** `foreign.ts` and the foreign branches in `sync.ts` (`foreignPerson`, `foreignShows`, `pastOnForeign`, `deleteOnForeign`) re-state `store.ts`'s rules for a war that is not loaded. Passes (postings, OIL, absences) run only for the loaded war, so 149's due postings wait for a 149 sign-in.
- Simpler: make the war store an instance (`createWarStore(backend, unit)`); another squadron's war is the same code on a second instance.
- Removes drift between the two bodies and the "runs later" class.

**4. War and Tracker records carry no squadron in their ids.** The gate must ask probes; `installAbsenceDoor` now installs five beside the squadron probe.
- Simpler: the plan's own rule, one `u149@…` encoding through every layer, as the weeks have.
- Removes the probe set and makes a second device's copy safe by construction.

**5. Bell lines are written by plain functions, then re-derived at the gate** (`warLinesOwed`, `holidayLinesOwed`, `followUpsOwed`). Fix reads 6–13 were all this pair drifting.
- Simpler: lines are written only inside typed war commands whose reducer derives them; the gate checks the command, not the line.

**6. The demo cannot show a shared store's faults.** A missing home means 142 in the demo and nowhere in a shared store (F3).
- Simpler: no fallback; the demo seeds Home rows for 142's people like anyone's.

Rulings: none this session.
