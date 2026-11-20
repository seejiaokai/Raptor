# The full review (D2235), area B — Fable's report (blind; copy at `424a4310c`)

Reader: Fable, a background helper of chat 123, blind to the other five readers and to the builder's report; brief
`2026-11-20-multi-sqn-b1-full-review-brief.md` with area B (accounts, people, squadron records, saved data and Undo); its
own exported copy of `424a4310c` with `AREA.patch`; finished whole. Not yet reproduced by the host. The report as returned:

---

# Area B review — accounts, people, squadron records, saved data and Undo (Fable, blind)

Copy: `...\scratchpad\frv\fable-b` at `424a4310c`. Nothing under `raptor-port/src` changed; proof tests were scratch files in the copy, run one at a time with `npx vitest run`, each RED, then deleted. No git touched.

**Context that shapes every finding:** in this copy nothing but sign-in moves the squadron in view (`switchUnit` has one caller, `resetSession`). There is no Schedules menu, no Admin → Squadrons, and Admin → Users lists everyone. So today "squadron in view" = "my squadron" for everyone, and the only cross-squadron actor is the master on Admin → Users. Findings 1–3 are live today. Finding 4 goes live the moment the "149 ▾" pick calls `switchUnit`.

## Findings, by consequence

### 1. A delete made from the other squadron leaves the man on his own squadron's planning calendar (live; D299 / D710 / D337)
- **Failing input (red):** demo boot, Saber (master, 142) signs in. `switchUnit('u149')`, `addPlanPuck('2026-07-20','Range day',['osp9','mer9'])`, `switchUnit('u142')`, `deletePerson('osp9')` → `null` (done). `switchUnit('u149')` → `PLANPUCKS` still names `osp9`. Assertion "149's calendar still names the deleted man: expected true to be false".
- **Production path:** the master deletes a 149 man on Admin → Users while 142 is in view (the only view he has today).
- **Consequence:** the note still shows the deleted man after his cutoff. `plan.ts planMoveBlock` then stops that note being moved, because a deleted man is on it. No history line says he was taken off.
- **Cause:** `person-delete.ts applyDelete` step 3c strips only `PLANPUCKS`, which holds the squadron in view. Another squadron's calendar lives in `store.ts PLAN_MEM` or in `plan/<unit>@pp:` rows, and nothing visits those. Weeks are safe (read-time overlay) and the war is safe (`foreign.ts`); the calendar has neither.
- **Fix:**
  1. Move step 3c's loop into one exported function in `state/plan.ts` (`stripGoneFromPlan()`, using its own `goneOn`: blank the id where `date >= deletedFrom`, `trimTail`, drop a note left empty).
  2. Call it from `applyDelete` (as now), from `store.ts switchUnit` after the entered squadron's calendar is in `PLANPUCKS` (both branches, before `enterWeek`), and at the end of `persist.ts hydratePlan`.
  3. Pin three tests: this proof; a reload variant; and that a later edit of the stripped note still saves. The last matters because the gate's stored-row check compares against the saved row, which still names him — I did not test that interaction.

### 2. The guest switch of any squadron but "u142" does nothing (live in the demo for 149; dead for every squadron on a shared store whose first squadron is not 142)
- **Failing input (red, two worlds):**
  - (a) `bootApp` with `{ seedDemo:false, bootstrap:{…, unit:{num:'149'}} }`. The admin signs in (view `u149`), `setGuestView(true)` → saved, `GUESTVIEW` true. Sign out. A new person signs in, `requestAccess(...)`, signs out. `signIn('new@unit.example','p').kind` → `'waiting'`, expected `'guest'`.
  - (b) The demo with Kestrel (`ad9`): the same result.
- **Consequence:** an admin turns "let people waiting read the published week" on, the screen shows it on, and no one waiting ever gets in. In the demo, 142's switch alone decides for everyone, and guests see 142's week.
- **Cause:** `guestview` is a unit's setting (`keyowner.ts`). `signIn` and `guestEntry` read `GUESTVIEW`, which `accountsLoad` reads by plain name, so it is the squadron in view's. With nobody signed in, the view is the literal `BOOT_UNIT = 'u142'` (`unitview.ts`; `store.ts sessionUnit` fallback).
- **Fix:**
  1. Give the request its squadron (`AccessRequest.unit` — the plan's "Request access asks the squadron first", D2094).
  2. In `signIn` / `guestEntry`, read `store.get(qualify(rq.unit,'guestview'))` instead of `GUESTVIEW`.
  3. Start the guest's session in `rq.unit` (`sessionUnit`).
  4. Until 1 lands: let him in if any squadron's switch is on, or make the switch community. That is a product call — put it to the owner.
  5. Replace the literal `'u142'` fallbacks with "the store's first unit, else none": `store.ts sessionUnit`, `perms.ts myUnit`, `engine/roster.ts`, `editlog.ts`.

### 3. The last-admin lock is judged for today by the door and for every date by the gate — the admin gets "That did not save" with no reason (live once a move is saved; D2184 Q10)
- **Failing input (red):** Saber makes Osprey a second 149 admin, then `setHome('osp9','u142')` (from tomorrow). `updateAccount(<Kestrel>, { on:false })` returns `'That did not save'`; expected the lock's own sentence ("Kestrel is 149's last admin…").
- **What held:** the gate refused it, and nothing was half-saved — Kestrel stayed on.
- **Cause:** `accounts.ts lockProblem` asks `homeOn(x.pid)` for today only. `postingLock` and the gate's `lastAdminViolation` walk today plus every future home row. The same today-only `lockProblem` backs `suspendForArchive`, `deleteAccountProblem` and `accountsRestoreProblem`, so Archive and an Undo of an account step fail silently the same way. This is the filed "refused delete's words" family, on Suspend, Demote, Archive and Undo — which are not filed.
- **Fix:**
  1. Fold `lockProblem` and `postingLock` into one function `(list, { ok, countArchived }) → 'app' | {unit,date} | null` that iterates the same dates.
  2. `lockProblem` returns its sentence from that result.
  3. `homeMoveLockWords` asks the same function with the candidate home rows.

### 4. Latent — lands with the "149 ▾" pick: a person's own-squadron pages read the picked squadron's settings (D2132)
- **Failing input (red):** Kestrel `setMembersFile(false)` for 149. Ranger (142 member) signs in: `membersFileOn()` is true. `switchUnit('u149')` → `membersFileOn()` is false. His Inputs page stays 142's, but its "file for others" rule is now 149's — in `perms.ts` and `ui/inputedit.tsx` both.
- **Cause:** `engine/hooks.ts storedKey` turns every plain unit-setting name into the squadron in view's.
- **Same shape, read not run:**
  - `state/flyplan.ts` (`flyday:` / `flyrule:` / `flyrun:` / `sanscalendar`) feeds the Leave War's need figures and the SANS calendar.
  - `engine/qualcols.ts` feeds Quals.
  - The `rules` late cut-off feeds the Inputs pages.
  - `persist.ts`'s `insights.role` mapper qualifies with the view at write time. An Undo after a pick writes the other squadron's `missionrole:` row and leaves the real one stored. Those ids carry no unit, so `timeline.ts inUnitView` lets the step through.
- **Fix:**
  1. Readers that are "my squadron's" ask by unit: `store.get(qualify(myUnit(), name))`, or a `unitSetting(unit, name)` helper.
  2. `insights.role` ids carry their unit like every other unit record.
  3. Extend the existing guard-test pattern (`roster-readers`, `inputsfor-readers`) to fail on a plain-name read of a unit setting outside the schedule pages.

## Explicit negatives
**Run, green:**
- A shared store whose first squadron is 149: no `u142` key in any collection after boot, after sign-in, or after a planning note. View and `myUnit()` are both `u149`.
- The refused Suspend in finding 3 left the accounts as they were.

**Read only, found nothing:**
- Week, stash, issuance and plan ids carry the unit end to end (`sched-commit decompose`, `weekstash qk`, `persist weekId/weekKey`, `undo/derive isoOfDay`). 142's and 149's same-dated weeks are different records.
- `weekstashStore.write` refuses only the qualified loaded week. `loadContext` never changes the squadron in view.
- `restoreSettings` puts each record back by its stored name; another squadron's setting is not rewritten as the view's.
- `changes.ts`: one cursor per squadron; `markSeen` writes only the view's and keeps the others.
- `unitDoor`: a key of another unit is never listed, read or written. `tableOf`, `resetEntry` and `leaveWarStarted` split the unit off first.
- `writeAccounts` first-write path; `rowsOf` ignoring removed rows; `dropAccountOfPid` dropping grants in the same command.
- Undo: Archive, Restore and Delete (the only steps carrying `lwx.*` ids of a squadron not in view) are outside Undo by D350, so no step is stranded "waiting in 149" for a master who cannot get there.
- `roster-restore.ts stillNamed` reads only the view's calendar and the loaded war, but is unreachable under D350 (a belt). Not a finding.

**Not tested:** a session left open across the midnight of the signed-in man's own move. By reading, the view and the loaded war stay his old squadron's until he signs in again, and the gate (`warUnitViolation`, level today) then refuses his war writes in gate words. Minor; no screen saves a move yet.

**Slower:** `settingsRecordKeys` now walks `store.keys('')` twice per capture, with a `split` per key. That is every settings key of every squadron, history lines included, on every command that enlists settings. Not measured.

## Where the visible sign and the working gesture should be
- **Admin → Users (master, any man):** Delete and Archive must clean every squadron-owned record of that man's squadron. Weeks: yes. War: yes. Calendar: no (finding 1).
- **Admin → Users guest switch:** must decide for the people asking for that squadron (finding 2).
- **Suspend, role, Archive, and Undo of these:** the lock's sentence on the row, not the gate's (finding 3).
- **Inputs, Quals, Leave War, SANS calendar for a non-master:** every rule and setting from his own squadron whatever the pick (finding 4).
- **Roles and order:** member, squadron admin and master on each; the day before and after a saved move.

## The shape — where this area keeps breeding faults (recommendation only)
1. **An ambient "squadron in view" silently qualifies plain names** (`storedKey`, `weekstash qk`, `inView`, the role mapper). One variable carries two meanings — "the schedule on screen" and "whose rule applies" — and every own-squadron reader must remember not to use it. That gives findings 2 and 4, the role mapper, and `PLAN_MEM`. *Simpler:* no default. A unit setting is read as `(unit, name)`; the schedule pages pass `viewUnit()`, everything else `myUnit()`; a plain-name read of a unit setting throws in dev. Removes the whole class "right data, wrong squadron's rule".
2. **"No squadron" is answered as the literal `u142`** in seven places. *Simpler:* null means none; the boot unit is the store's first unit. Removes finding 2's shared-store half and phantom-unit worlds.
3. **One rule, a door copy and a gate copy** (last-admin lock in four forms; `otherSquadronProblem` / `homeUnitViolation`; `masterChangeProblem` / gate G1). Most of the sixteen fix reads in the comments are these two drifting apart. *Simpler:* the gate's predicates return a reason code; the doors run the same predicate on the draft change and look the sentence up in one table. Removes "That did not save" and screen-says-yes / gate-says-no.
4. **Three mechanisms for "another squadron's records inside my command":** read-time overlay (weeks), a second store `lwx.*` (war), nothing (calendar, role answers). *Simpler:* one unit-addressed record source for every unit-owned kind, so a command names `plan/u149@pp:…` as it names `settings/u149@rules`. Removes finding 1 and the next kind someone forgets.
5. **Dates of rights bolted onto Undo** (`masterFrom`, `pidFrom`, `Grant.from`, `madeAt` / `undoneOn` / `redoneOn` / `stoodBefore`, `redate`, `leaveOut`) to keep one promise: a bell line a move retired never returns. *Simpler:* mark the line itself retired when the move retires it. Then no later right, re-link or restore can revive it, and Undo needs no re-dating. Removes the fix-read 7–12 family.

## For the closing report
- Walk: none (code read with unit proofs only).
- Rulings: none this session.
- Scratch files deleted; `raptor-port/src` in the copy is as exported.
