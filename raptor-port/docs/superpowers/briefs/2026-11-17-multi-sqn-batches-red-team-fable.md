Fable — fresh, blind red team of the batch plan at commit 4a33e6930, read-only.

Read: the plan whole; the scheduler page §Not built yet; People & accounts §Many squadrons; full rows D2093, D2094,
D2132, D1971, D2167, D2110; the design note by grep (R29, R32, R35); both seams files; `storage/` (backend, tables,
adapters, schema), `state/persist.ts` (hydrate, the row writer), `state/weekrows.ts`, `engine/weekstash.ts` (exports),
`engine/weeks-data.ts`, `engine/hooks.ts` (store), `state/store.ts` (resetSession, loadWeek's inputs pass),
`state/perms.ts` and `accounts.ts` (exports), `leavewar/sync.ts` (the OIL pass, holidays), `tracker/peoplewire.ts`,
`ui/logout.ts`, `boot.ts`. Not run: no test, no app. Not read: `UsersPanel`, `AdminPage`, `Shell`, `icons`, the undo
contract's §5 text.

**Verdict.** The order is sound, the 3 ↔ 4 swap included. Batch 1's "swap the schedule world, filter the community" is
workable, but as written it swaps too little: five HIGH, all in what the plan does not name. Counts: 5 HIGH, 7 MEDIUM,
5 LOW.

## HIGH

**H1 — Looking at 149's schedule rewrites 142's OIL.**
- Failure: Saber (142, View of 149) picks "149 ▾". The Leave War's OIL pass runs on every repaint and reads the loaded
  days and the in-memory saved weeks; it now finds 149's published weekend, not 142's. Its reverse sweep collects every
  142 credit whose day no longer shows as published, and saves that into 142's war. The same on the next sign-in of any
  142 person who looks at 149.
- Cause: §3.4 lists the singletons that swap (`DAYS`, `SCHED`, `DATES`, `CURWEEK`, …) but not the saved-weeks stash
  (`engine/weekstash.ts`, keyed by bare week, filled with EVERY stored week at hydrate — `persist.ts` 235–250).
  `sync.ts` 1779–1830 reads `DAYS`/`SCHED` for the loaded week and `stashKeys()` for the rest. Ten modules read the
  stash by bare week (`weekctx`, `oilev`, `quarantine`, `person-delete`, `roster-restore`, `weekrows`, `store`, …), so
  crew rest looking back a week and the input lock would also read the other squadron's week of the same dates.
- Fix: add to §3.4: the stash is keyed `(unit, week)` and holds every unit; every stash reader takes the unit (a guard
  test on the importers, as for `PEOPLE`); the OIL pass, the publish gate and `HOOKS.oilEarningDay` read the HOME
  unit's days from the stash whenever the unit in view is not home, never the live singletons. This is also the read
  path batches 2 and 3 need (H5) — without it they rebuild batch 1.

**H2 — `INPUTS` is left unfiltered and unclassified; 142's inputs land on 149's days.**
- Failure: a week load puts every input on the loaded days and resets each input's accepted mark against the loaded
  world (`store.ts` 650–667). With 149 in view, every 142 man's leave is landed on 149's schedule (his row in 149's
  programme — a people leak), and 142 inputs' accepted marks are recomputed against 149's published days. Then Saber
  opens Inputs ("stays on his own squadron") with 149 still loaded and files leave for a 142 man: the clash gate checks
  149's days, so leave over a day he flies in 142 is not refused, the amendment is not raised, and the row is saved
  with the wrong mark.
- Cause: §3.4 classifies the 81 `PEOPLE` files only. `INPUTS` has 72 importing files; the plan names none. And nothing
  says which world is loaded while a home-only page writes.
- Fix: (a) the landing pass and every roster-style `INPUTS` reader go through one `inputsOf(unit, iso)` (by `homeOn`),
  under the same guard test; (b) one invariant in `commit()`: a command that reads or writes schedule-world state runs
  only while its unit is the unit in view — opening Inputs, Quals, the Leave War or the Tracker swaps the world back to
  home first (the pick then applies to the schedule pages only, which is what D2132 says).

**H3 — A 149 man signing in after a 142 man on the same PC gets 142's Leave War and Tracker.**
- Failure: the walk's own case — four sign-ins on one PC. Logout does not reload (`ui/logout.ts`; `resetSession`).
  The Leave War store is booted once (`boot.ts` 100–118), the Tracker's `core.init()` runs once on first mount and the
  section stays mounted. The 149 member sees 142's war and course list, and a bid he files is written into 142's war.
- Cause: §3.4 says the war's world "is the signed-in person's home unit" but gives no moment it changes; the swap is
  described for the "149 ▾" pick only.
- Fix: `resetSession` is the one seam: it sets the unit in view to home, reloads the schedule world, re-inits the Leave
  War store on that unit's keys (with its history re-baseline) and remounts the Tracker keyed by unit. Say what the
  boot-time passes do with nobody signed in (run for no unit). Add the sign-out / sign-in-across-squadrons walk, each
  direction. Cheaper and safer: make the sign-in of a person whose home differs from the last world a full page reload
  with the unit as the boot's parameter — one boot's wait, no in-place re-init of two foreign stores.

**H4 — The Tracker is not separated: only the course carries the unit.**
- Failure: a 149 admin edits a chart's structure or deletes a ball; D474 makes that reach every course on the chart, so
  142's marks on it go. That is exactly the case D2167 says "does not arise" because each squadron has a Tracker of its
  own. The chart catalogue, chart definitions, event details, layouts and the admin-only flex settings are all global
  rows (`v3:master:*`, `tables.ts` TRACKER).
- Cause: §3.4 "a course carries its unit; the course list and the people bridge show … home unit only".
- Fix: the Tracker's whole key space sits under the unit (the storage doorway adds it, as for the Leave War), built-in
  charts seeded per unit; `rosterOf(home)` in `projectForTracker`. No per-record filter.

**H5 — Batch 2 goes live with detachment work earning no OIL and unchecked across schedules.**
- Failure: a 149 man on "249" flies a published Saturday there. The OIL pass reads his home unit's days only (batch 1),
  and "OIL for a day worked for both" is batch 3 — he earns nothing. The 142 man put on 149's open detachment (Q24,
  batch 2) is the cross-squadron case outright. Days in a row and crew rest "follow the man across places" (D2165) need
  the home day and the detachment day read together; §4 names only the time-zone part.
- Cause: §1 "no borrowed-man machinery is needed"; §4 lists no OIL line.
- Fix: batch 2 builds "one man's days across every schedule he is on" — the OIL pass and the people checks reading all
  his units' published days through H1's stash — for a squadron and its detachment; batch 3 then adds only the second
  squadron's rules (D2183's differing values, D2161). Or move Q24 to batch 3 — but the own-detachment OIL cannot move.

## MEDIUM

**M1 — Which stored keys are a unit's is not listed.** "Setting keys gain the unit" would also prefix community rows
(`account:`, `accessreq:`, `noticeseen:`), and `tableOf` names tables by prefix (`elog:`, `account:` — `tables.ts`
55–66), so a prefixed row is filed as `Setting`. Unnamed and shared today: the planning calendar's rows (`plan/pp:<id>`,
`plan/dm:<iso>` — a day title 149 types shows on 142's calendar), `qualcols` (142's admin deletes a column, 149's Quals
loses it — against "each with its own Quals"), `memberfile`, `guestview`, `cxreasons`, `stores`, `insights`,
`lookahead`, `sanscalendar`, `missionrole:`. Fix: a table in §3.4 of every collection and settings key — unit's or
community's — with a test that fails on an unlisted key; `tableOf` strips the unit first.

**M2 — The `PEOPLE` guard is too coarse.** A file is one class, but a file can hold both: 45 enumerations of `PEOPLE`
sit in 22 files. A new `Object.keys(PEOPLE)` loop added to a "look-up" file passes the test and lists 149's people.
Fix: the test bans enumeration of `PEOPLE` (and `INPUTS`) outside `rosterOf`/`inputsOf`, with a short reasoned
allow-list of sites.

**M3 — Rights as an array inside the account cannot be guarded by row.** O3 has a 142 admin write a 149 man's account
record to add View. A row-level rule then lets him add `{149, admin}` to himself or strip a 149 admin; `lastAdminIfGone`
counts admins app-wide. Fix: one row per grant, `UnitAccess { account, unit, level }`, owned by its unit — "an admin of
the row's unit may add or remove it" is one `PERMS` row and one §11 line, and it is the table IT's column needs;
last-admin counted per unit. Batch 4 ends a man's old access by deleting rows.

**M4 — A new squadron cannot be started.** "+ New squadron" makes a unit with no people, no admin, no leave period.
Admins are made "by its own admins or a master admin", but O3 shows an admin only his own squadron's people, and O2
omits D2093's "has access to every squadron". Fix: O2 states the master admin's reach — every squadron's Admin → Users
and View of every schedule — and step 4 includes making a new squadron's first admin; walk it.

**M5 — The holiday list must be read by the place on that date.** In batch 1 a place change is live. 149's admin moves
it; "each war reading its place's list" then drops every past holiday from 149's war, and leave already charged over
them changes. Fix: one `placeOn(unit, iso)`; the war and the OIL earning day read the list of that date's place; a test.

**M6 — The change history and the guest view are not split.** The edit log is one list (`elog:<lineId>`); a 142 member
opening it reads 149's edits, days named by date with no squadron. `guestview` is one switch: with 149's off and 142's
on, a man who asked 149 gets in. Fix: each log line carries its unit and the page filters; `guestview` per unit, the
guest seeing the squadron he asked; add as an open point.

**M7 — "One undo list per unit" is under-specified and not needed.** Community commands (an input, a person) belong to
no unit's list; and access elsewhere is View only, so a person writes in one schedule. Cheaper: the one list as today;
with another unit in view Undo is greyed with its reason (as D350's). Only if the master admin may edit two squadrons
does it matter — say which in O2.

## LOW

- **L1** — the demo's hidden row ids are built from week, day and position (`seedRids`); 149's demo week on the same
  dates gets 142's ids, and a Blue/Red answer keyed by them shows on both. Add the unit; `weekBundle` takes the unit.
- **L2** — `~` already separates version and count in issued rows (`<wk>:is:<iso>#<ver>~<n>`); `parseRowId` and
  `weekOfId` cut at `:` and `#`. Choose a separator none of these use, and test the grammar.
- **L3** — `Unit.off` reads as one field; Off days are dated event lines in the war. Leave them in the unit's own war;
  move only public holidays.
- **L4** — agreed, in no batch: Escape closing the changes window (D2112); a shared wave's line "ticked to show"
  (D2105); a detachment using home's holiday list and its ALL AVAIL counting its men there (D2165, D2184).
- **L5** — the holiday move is the batch's only OIL change and separable: land it as batch 1's second pull request.
