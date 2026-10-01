# Red-team report — `[DB-READINESS]` group A, phase 6 plan v1 (Fable, blind, 30 Sep 26)

*(Saved by the host from Fable's final message; the brief: `2026-09-30-db-readiness-phase6-redteam.md`.)*

**Verdict: REVISE.** One finding changes the plan's door list and the overlay's home (F1); two change a sentence of the plan (F2, F4); the rest are build-checklist items. Every claim below was checked against the code on the branch, not taken from the plan.

The plan's §1 facts held up: the prune sits on the one OIL read door (`engine/oilev.ts oilEvidenceOf → oilEvidence → pruneHandedOverDecisions`) and `dayDiscardCount` (`engine/publish.ts` ~674–688) compares the raw block; the `inp:` marks have exactly three writers (`engine/slots.ts` 455, 472, 715) and no count on a published day reads them (`dayPendingItemsIn`, `filingDelta`); only `isPersonal` requests become rows (`acceptInput`'s `isUnavail` refusal, `autoAcceptInput`'s `isPersonal` gate); `r.person` is written in exactly one place (`ui/inputedit.tsx commitInputEdit` line 1038 — `reassignInput` sets `draft.person` and goes through it); `stripPersonFromDay` covers every seat kind.

---

### F1 — HIGH — The overlay's stash door is at the wrong level: four readers of a stashed week's days never go through `bundle()`

**Evidence.** `bundle()` (`engine/weekctx.ts` 74–99) is one of five readers of `stashDays`/`stashGroundBySrc`:
- `ui/peek.ts peekWeekHTML` line 262: `stashDays(nextWk) || weekBundle(nextWk)` → `peekDayHTML` → `peekPuck` draws crew from `PEOPLE[id]` (lines 49–58). This is the desktop's next-week columns — a visible surface.
- `engine/weekctx.ts windowDiverges` line 280: `stashDays(v)` raw → `canonicalDiff(snap.d, days.days[di], di)` is what `engine/validate.ts officialDiverges` (line 1531) uses to decide whether OFFICIAL aliases WORKING.
- `bundle()`'s own official branch, lines 85–88: `st.days.map((d,di)=>issuedDayIn(sc,di,v,d))` — `issuedDayIn` returns the RAW `working` day for any unapproved day (line 64). "The WORKING world only" (plan §2.1) therefore leaves every unpublished stashed day un-overlaid in the official pass.
- `engine/weekstash.ts stashGroundBySrc` (memoised on the blob string, line 220): read by `engine/oilev.ts stashStanding` (line 383, the OIL standing of a request whose row is in another week) and by `rowElsewhere`, which serves `acceptInput`'s guard, `relandInputs`' re-park, `ui/html.ts accCtl` ("On Sun 19 Jul"), `publish.ts rowsLeftOut` and `inputedit.tsx landedOnUnloadedWeek`. The memo key is the blob, so a request change (INPUTS) with the blob unchanged serves the pre-overlay rows.

**Scenario (d).** Setup: Hex on next week's Tuesday flying line; next week saved, not loaded; Edit Schedule on a desktop (>820px). Action: Admin → Users, Delete Hex (cutoff today). Expected (D297): Tuesday's peek column has no Hex. Observed with the overlay only at `bundle()`: the peek draws Hex. Load next week → gone; come back → the peek now reads the in-memory stash copy `loadWeek` wrote on the way out (`stashPut(CURWEEK, weekStashSnap())`, the overlaid DAYS) → gone. Reload → drawn again (the stored row keeps him by design). What a person sees depends on the path taken, not the state.

**Scenario (official world / alias gate).** Under the plan the "Load the week of … to edit" refusal goes, so a member can re-time his landed appointment on a PUBLISHED Sunday of a saved, unloaded week. Raw stash = old row; issued Sunday = old row; overlaid stash = new row. `windowDiverges` compares raw vs issued → "no divergence" → alias → the loaded Monday's official pass reads the overlaid working Sunday as its official neighbour. The alias decision is made on a day nobody else reads.

**Scenario (c).** A request re-dated out of a saved week keeps its stale row there until that week is read. The plan says `rowElsewhere` will skip such a row; it does not say where the skip lives, and `stashStanding` (a second reader of the same memo) is not named.

**Fix — change the plan first (§2.1), then build:**
1. Home the overlay in the engine (`engine/overlay.ts`): it needs only `INPUTS`, `inputCoversDate`, `inpId`, `isPersonal`, `PEOPLE`, `whoId`, `whoArr`, `dayIso` — all engine imports. Move `stripPersonFromDay` there from `state/person-delete.ts` (re-export for its remaining callers). The overlay takes `(days, weekKey)` and uses `dayIso(weekKey, i)` per day — never `d.dt` (year-ambiguous).
2. Apply it INSIDE `engine/weekstash.ts stashDays(v)`, right after the re-labelling loop (line 197), so `bundle()` (both worlds — `issuedDayIn` then still substitutes the issued snapshot for approved days, D299 kept), `windowDiverges`/`windowInputs`/`windowFiling`, `ui/peek.ts` and `stashGroundBySrc` all read one overlaid copy. Delete the separate "`rowElsewhere` skips…" line from §3(c) — it comes for free.
3. `stashGroundBySrc`: keep the memo for the parse only, or key it on (blob, an INPUTS/PEOPLE generation). Simplest: memoise the raw parse by blob; run the overlay's request half (rule 1/2 filter, cheap) per call before building the map.
4. `bundle()`'s pure-seed branch (`bundleCache`, line 54): apply the (d) half to a fresh `weekBundle(v)` copy when any `PEOPLE[id].deleted` exists, or key the cache on a roster generation. (The seed weeks carry no request rows — `grep src: engine/week2.ts engine/data.ts` → 0 — so only (d) matters there.)
5. `applyWeekModel` and the two `engine/drafts.ts` doors (lines 300, 610) stay as planned — they install into `DAYS`, not the stash.
6. Red tests first: the peek after a delete with the next week saved and unloaded (desktop width); `windowDiverges` given an overlaid neighbour; `stashStanding` for a request re-dated within a saved week; the landing of a request re-dated out of a saved week into the loaded one (today refused by the raw `rowElsewhere`).

---

### F2 — MEDIUM — (a): an extra's refusal is thrown away the moment he becomes the holder

**Evidence.** `ui/oilmode.ts toggleOilPerson` writes `people["<pid>|i:<iid>"]` for ANY man on the row — the extras too (D18); `engine/oilev.ts pruneHandedOverDecisions` keeps an extra's decision through `landedExtras(day, iid, holder)` (line 445); `ui/inputedit.tsx commitInputEdit` (lines 1164–1180, D271) on a hand-over to a man already in `more` blanks his extra slot and keeps him once as the holder. The plan stamps `pa` on every `i:` decision and ignores "a decision about the request's CURRENT holder whose recorded holding is not the current one".

**Scenario.** Setup: Bane files a Saturday duty request; the scheduler puts Stiff on its row as an extra and, in OIL Earn, taps Stiff off (`people["stiff|i:X"]='deny'`, `pa=0`). Action: Bane can't make it; the scheduler drags the request to Stiff (`reassignInput` → `commitInputEdit`, `hand=1`, Stiff kept once as holder). Expected: Stiff still earns nothing — the refusal was about Stiff on this row. Observed under the plan: Stiff is now the holder, `pa=0 ≠ hand=1` → ignored → Stiff earns FO. On an unpublished day nothing flags it; on a published day it reads pending (the OIL axis), which at least shows. Today's code keeps the refusal (`clearOilPersonDecisions` clears Bane's key only; Stiff's stays and matches the new holder).

**Fix — the §3(a) sentence changes, then build:**
1. `toggleOilPerson`: write `pa[k] = hand` only when `String(person) === String(inp.person)` at the time of the tap (the holder). An extra's decision carries no `pa`.
2. `pruneHandedOverDecisions`: apply the holding rule only when `pa` HAS an entry for the key; a decision with none keeps today's rule (holder → applies; extra → applies; neither → dropped). This is also the plan's old-data rule, unchanged.
3. Delete `pa[k]` wherever `people[k]` goes: `toggleOilPerson`'s `want === dflt` branch, `tidyDay`, `stripOilSwitches`, and the prune's copy (or `oilEvidenceKey` will read a changed block for an inert key).
4. Tests: the scenario above (refusal stands); the control A→B→A (still inert); an extra refused → handed to him → back → to him again (state the intended answer — with no `pa` it revives, today's rule — and pin it).

---

### F3 — MEDIUM — Consistency: the hollow AL / OG tags on the cells a derived change touched are drawn from marks that are no longer saved

**Evidence.** `engine/publish.ts markEdit` writes `SCHED.pending` (the day's book slice → part of the day row, `state/persist.ts loadedRows`); `ui/html.ts alAttr` draws the hollow ALn tag (D93) and the OG tag (D172) from those marks. Under §2.2 the relink's marks (`commitInputEdit → unacceptInput/acceptInput → markDeletion/markStructuralAdd/markEdit`), the delete's `setSlotVal` marks and the load-time landing's `markStructuralAdd` are in memory only, and the overlay re-makes/removes/strips at read WITHOUT marking. The landing is the one exception that stays consistent — it runs and marks at every load.

**Scenario.** Setup: Monday published with Ranger's appointment row. Action: Ranger changes its time on the Inputs page; the scheduler's Edit Schedule shows the row's time cell with a hollow AL1 tag and "1 pending". Reload. Expected: the same picture. Observed: "1 pending" and the pending list are right (the canonical delta), the cell wears no tag. Same for a row removed by a request's deletion and for the delete's emptied ground-row holders on a published day. Today the relink's marks are saved with the day, so this is a regression the plan introduces.

**Fix — build (add a line to §3(c)/(d)):** the overlay, on a PUBLISHED working day only, marks what it changed exactly as the in-memory path does: a re-made row's differing cells via `markEdit(key)` (rid-anchored through `ridWriteKey`), a removed row via `markDeletion(di,'ground', deletionWasIssued(...))`, a blanked seat/holder via its slot key. On a never-published day write nothing (D118). Make the in-memory path and the overlay share the marking body so they cannot mark different keys. Test: the scenario above — the same `SCHED.pending` keys before and after a reload.

---

### F4 — MEDIUM — (c)'s whole-day replacement door narrows D363 without saying so, and `dayDiscardCount` must follow it

**Evidence.** D363 (full row): "puts back EVERY row that version had — a deleted request's row included — left as built". Today `engine/drafts.ts loadVersionToWorkingCopy` → `leaveOut` → `publish.ts rowsLeftOut` leaves out only a row whose request stands on another loaded day or another week (D175); a request re-dated to a week with no row is put back. Plan §2.1 applies the overlay (rule 2: "its request no longer covers the day → the row goes") at `liveDay`; §3(c)'s `kept` covers only a DELETED request. `publish.ts dayDiscardCount` (lines 674–688) measures "against the day as the load will LEAVE it" using `rowsLeftOut` only.

**Scenario.** Setup: Monday published with R's row; R re-dated by its member to next week (never loaded — no row anywhere). Action: "Load onto working copy" of Monday's issued version. Today: R's row is back on Monday (D363's letter) and "Discard N edits" counts it. Under the plan: rule 2 removes it at the door, and unless `dayDiscardCount` applies the same rule to `after`, the confirm says "Discard 1 edit" for a load that puts nothing back — the exact D175 precedent the code comments record.

**Fix — plan first:** state in §3(c) that rule 2 narrows D363 for a request that no longer covers the day (or set `kept` on such a row at the replacement door if D363's letter is to stand — say which; it is a product reading, so put it on his look card and record it against D363's full row, D201). **Build:** `dayDiscardCount` runs the overlay's request half on `after` (the same body `leaveOut` uses) so the confirm and the load agree.

---

### F5 — LOW — `commitInputEdit` on a request whose row is on a saved, unloaded week (the refusal the plan removes)

**Evidence.** `ui/inputedit.tsx commitInputEdit` lines 1023–1040: `wasDi = acceptedDay(r)` is −1 for a row on another week while `wasAcc === 'g'`; `unacceptInput(-1, r)` finds no row and parks 'r'; the re-accept's `di` resolves to −1 when the request's dates are off the loaded week (line 1145) → the toast "Moved outside the programmed week — it is no longer accepted" (line 1196) and `delete r.acc` (line 1205). Wrong words for a remarks edit, and `acc` cleared for a request whose row still stands.

**Fix — build:** when `wasAcc === 'g'`, `wasDi < 0` and `rowElsewhere(inpId(r), r)` is a hit, skip the unaccept / re-accept and the toast; leave `acc`; the overlay's rule 4 re-makes the row when that week is read. Test: edit the remarks of a request landed on a saved, unloaded week — no toast, `acc` unchanged, the stored row byte-identical, the row re-made on that week's load.

---

### F6 — LOW — The restore door is a place a day comes into memory the plan does not name

**Evidence.** `state/sched-commit.ts schedWriteRecords` line 240: `DAYS[di] = cw(e.value)` under `restore:true`, followed by `reconcileDayFiling(di)` — no overlay. Checked orders in the stand-in: a stale request row or a deleted man in a restore image is refused (`deletedRestoreProblem`; `outOfBandConflict` on the day record's revision when another person's derived change touched it; the undo list ends at sign-out), and I could not build an order that installs one. **Fix — build, as a belt:** apply the overlay to the installed day in the `days` case before `reconcileDayFiling`, so the four doors are one rule.

---

### F7 — LOW — (b) build notes
`engine/publish.ts inputActionCount` (line 848) has no caller — delete it with the marks. `ui/pendlist.ts` lines 176 and 270 read `inp:` off the DELTA's `addr` (`filingDelta`), not off marks — they stay. `engine/drafts.ts` lines 371 and 670 and `publish.ts` line 1208 (the Unpublish re-open) become dead guards — remove with a test or leave, but do not "ignore an inp: key" in `ui/pendlist.ts`. The adoption's bare `markEdit()` (`slots.ts` 472) stays — it is the history/render epilogue.

---

### F8 — LOW — Live relink and rule 4 must be one body, not two that agree
Today's relink is unaccept + accept: the row loses its place and (off a published day) its id; rule 4 "keeps its id, its place". If the live path stays as it is, the pending list after a member's edit reads "moved" + "changed" live and only "changed" after a reload. **Build:** `commitInputEdit` calls `remakeLandedRow` INSTEAD of unaccept/accept when the day is unchanged; the unaccept/accept path stays only for a change of day.

---

## Explicit negatives — what I checked and found nothing in

**Q1 (§2.2 list).** Every `writeInputs` / `writeInputsBatch` / `writeInputsBatchWith` caller (`inputedit.tsx` 853/984/1260/1272/1455/1584/1710/1722/1745, `InputsPage.tsx` 479/536/633/665, `InputsCal.tsx`, `caldrag.ts`, `leavewar/sync.ts` 315, `probe-bridge.ts`): each makes a request, plan or OIL-answer change whose day effect is reproducible on read. The scheduler's Accept / ✕ / → Unavail (`ui/interactions.ts` data-acc handler line 599; `ui/board.ts` grdel line 1071) run bare and are committed by `view.afterSchedMutate()` → `sched.mutate`, so a holder's placement IS saved. The board's Ground "+ Inputs" (`commitNewInput`, `toGround`) lands inside `inputs.batch` — derived, and the plan's load-time landing reproduces it (the issued version never saw it). No command outside the list writes a day as a side effect: `setSlotVal`, `stripPersonFromDay`, `stashEditWeek` have no caller outside `person-delete.ts`; `stashEditDays` only `clearOilPersonDecisions` (going); `person.archive`, `people.edit`, `lw.postout` (the sheet), the war's absence door (a leave — never a row; `leavewar/inputgate.ts` calls no accept/unaccept), `lw.sync` (war records only) and the boot (`applyWeekModel` outside any command; `sched.load` already unsaved) write none. Undo/Redo: `lw.postoutRun` is a projection with a barrier (`undo/timeline.ts ingest`), `person.delete` is in `NOT_UNDONE_TYPES`; the `undo.restore` of an `inputs.*` step is the only derived restore. Nothing missing, nothing wrongly in.

**Q2 (doors).** Beyond F1 and F6: `applyWeekModel` (boot through `initStore`, every `loadWeek`, both branches, the unreadable placeholder), the plan switch and version load (`drafts.ts` 300/610), `engine/daytpl.ts applyDayTpl` (line 254 — templates carry no crew and no `src`: `blankWho`, seats blanked, `delete r.src`), the official world for approved days (`issuedDayIn` → issued snapshots; the Leave War's `stashOilWeek` reads issued snapshots only; `creditable`/`availableFor` exclude a deleted man by date, `sync.ts` 840/1010), `roster-restore.ts stillNamed` (a belt for an undo that removes a person record — never a delete), `quarantine.ts` (dates only). No other `DAYS[di] =` install exists.

**Q3 (published-record rulings with a reload).** Walked each: D114 (✕ is `sched.mutate`, saved; after reload 'r' is kept by `relandInputs`, 'g'→'r' pairs with the delete unit → 1); D174 (filed since then ✕: 'r' kept, `filingSame` absent/'r', `frozenInputMatch` absent/'r' → 0 both ways); D176 (`present=false` branch → 0); D177/D178 (the input axis reads live INPUTS vs `snap.inp`; the issued face reads `withDaySnap`'s frozen copies — untouched by the overlay); D363 (the `kept` row survives rule 1; the unpaired 'g'→absent filing entry names it); D175 (`rowsLeftOut` reads loaded DAYS plus the overlaid stash); 16 Sep 26 (the load-time landing reproduces the live landing at the same index — `acceptInput` appends after the stored rows, and a holder's later save carries the landed row in place). Counts, lists and sign-offs agree across a reload; F3 (tags) is the one divergence; F4 is a load-door narrowing, not a reload divergence.

**Q4 (the stamp).** Orders checked: A→B→A (inert — right); undo of A→B (`hand` restored with the record → revives — right); redo (inert); A→B→A→B (B's first refusal inert — today's `clearOilPersonDecisions` deletes it on B→A, same outcome); a decision about B under hand 1, then undo/redo; the request deleted and undone (`hand` restored); the medical cascade's minted tails (new ids, hand 0); the Leave War's moves (leave — `oilAsks` false). The "dropped at the next save" refusal: the plan's reason is right, and there is a second — the saver (the day's holder) and the undoer (on the Inputs page) may be different people. F2 is the one wrong ignore.

**Q5 (deleted man).** Checked every place: seats of every kind incl. sim pax/more and allhands (`stripPersonFromDay`), `oild.people`, sign-offs and bindings, parked plans (loaded `SCHED.drafts`, stash `dr`), landed rows of his requests (the overlay must derive `srcs` from the ROW as `stripDeletedFromDay` does — `whoId(r.who) === id` — since his future requests are gone from INPUTS), the planning calendar (own table), the Leave War (`forgetPersonFrom`), the ALL AVAIL crowd and OIL sentinel (by date), issued versions (kept, D299), the change history and the Inputs page (kept). Before the cutoff: the overlay compares `dayIso(wk, di)` per day; nothing strips him there. Misses: F1's peek and official branch. `sim.who` free text is never stripped — as today.

**Q6 (consistency).** F1, F3, F4, F8 are the divergences. Consistent: the delete's change-history lines (elog rows saved inside the command, D337), the pending count on a published day (canonical delta both paths), the sign-offs (bound to the same comparison), the undo list (per sign-in), the load-time landing (runs and marks at every load), the first save after a derived change on a never-saved week (only the changed day is written; the other days re-land at load).

**D56 applied:** nothing above lives only in stored data; each finding would recur on new data.
