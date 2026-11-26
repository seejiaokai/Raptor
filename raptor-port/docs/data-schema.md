# Data schema, as shipped

What RAPTOR stores, the shape of each record, and where it lives today.
Read this before the shared-database (Dataverse) step: it is the map of the
tables that step has to hold, taken from the working code on 8 Sep 26, not
from a design. Nothing here is proposed — every field is one the app reads
or writes now. The last section lists what is *loose* about these shapes
and what a database migration would want to tighten.

Companion docs: `engine-rules.md` (what the validator does with these
records), `ui-contracts.md` (how the screens render them),
`leavewar/` and `tracker/` (those two modules' own notes).

## The three storage worlds

RAPTOR is one app, but it keeps three separate stores, each behind its own
"door" (a small module every save goes through). The doors are the seams a
shared database replaces; nothing above a door knows where a key lives.

| World | Door (the seam) | Key prefix (built site) | Backed by today |
|---|---|---|---|
| Scheduler | `store` + `storeBackend.impl` in `src/engine/hooks.ts`, plugged in once by `src/main.tsx` | `raptor:settings/*`, `raptor:weeks/*` (rows — phase 1), `raptor:inputs/<iid>`, `raptor:people/<pid>`, `raptor:plan/pp:<id>` and `raptor:plan/dm:<iso>` (one row each since 30 Sep 26, `[DB-READINESS]` group A, phase 2; `inputs/all`, `people/all`, `plan/all` until then) (legacy `sqn142_` imported once) | the whiteboard (`src/storage/`) → BrowserBackend on the built site |
| Leave War | `StorageBackend {read, write, remove, keys}` (remove and keys since 30 Sep 26, `[DB-READINESS]` group A phase 0) in `src/leavewar/state/storage.ts`, now the whiteboard-backed adapter | `raptor:leavewar/*` (legacy `leavewar:` ignored) | the whiteboard (`src/storage/`) → BrowserBackend on the built site |
| Tracker | `storage {get, set, delete, list}` (async) in `src/tracker/storage.js`; per-browser prefs via `ocuLocal:` (NOT through the whiteboard) | `raptor:tracker/*` (legacy `ocu:` imported once); prefs stay `ocuLocal:*` | the whiteboard (`src/storage/`) → BrowserBackend on the built site — the record; the .json file is an import/export FORMAT only (9 Sep 26) |

Two smaller seams sit beside these: `docBackend.impl` in `src/state/docs.ts`
(uploaded attachments — an in-memory cache over a per-browser IndexedDB
drawer, `src/storage/docstore.ts`, wired by `docBoot`; see Attachments) and
`HOOKS.whoami()` (who is making an edit — the one hook that changes the day
real accounts arrive).

History worth knowing: the Tracker, before it was merged in (7 Sep 26), had
a `sync/cloud.js` layer written for Dataverse / Firebase over a SharePoint
file. It never switched on outside the hosts it was written for and was
removed at the merge; `storage.js` is what replaced it.

## What persists, and what is session-only

This is the single most important fact for the database step. Since the
storage seam (8 Sep 26) the whole app boots through the whiteboard
(`src/storage/`), so on the **built site** (BrowserBackend) everything
persists together, per browser; in **dev and tests** (MemoryBackend) every
boot starts clean by design. This replaced the pre-seam doctrine (owner,
23 Aug 26 — "it's ok that u don't remember once I exit the session") once the
owner approved "everything persists on the built site".

| Data | Lives in | Survives reload? |
|---|---|---|
| Roster (PEOPLE), schedule + publish book + per-week stash (DAYS/SCHED), inputs (INPUTS), planning pucks (PLANPUCKS/DAYRMK) | whiteboard → backend (Browser on the built site, Memory in dev/tests) | **Yes** on the built site (per browser); no in dev/tests by design |
| Templates, house orders, rule overrides, cancel reasons, look-ahead, stores list | whiteboard → backend (settings collection; legacy `sqn142_*`) | Yes |
| Every Leave War record | whiteboard → backend (Browser on the built site, Memory in dev/tests) | **Yes** on the built site (per browser); no in dev/tests by design |
| Tracker charts and students | whiteboard → backend (`raptor:tracker/*` on the built site) + the syllabus file | Yes |
| Undo history | scheduler session memory | **No** — session-only by design |
| The Scheduler Board's right-panel width (D1113, D1118 — 21 Oct 26) | this browser's localStorage, key `raptorLocal:sbSideW` (a number of pixels; absent = 320), written straight there by `src/ui/board.ts wireSideGrip` — NOT through the whiteboard or the settings command, outside every shared prefix: a view preference of one person on one computer, like the Tracker's `ocuLocal:*` (World 3). Not a table for the database step | **Yes**, on that browser only; never shared |
| The change history (the edit log) and each person's seen record | settings collection, one row per line (`elog:<lineId>`) and one per person (`seen:<pid>`) since 30 Sep 26 (`[DB-READINESS]` group A phase 4.3 — they were `elog` and `changeseen`, `[DRAFT-PENDING]`, 28 Sep 26) | **Yes** — and it outlives a sign-out (D336 (b)) |
| Attachment bytes (medical documents) | in-memory cache → per-browser IndexedDB drawer (`raptor-docs`, `src/storage/docstore.ts`) on the built site; memory-only in dev/tests | **Yes** on the built site (per browser, since 8 Sep 26); no in dev/tests |
| Units, places, each unit's place, rights in another unit, each person's home (multi-squadron batch 1, step 1) | settings collection, one row each — `unit:<id>`, `place:<id>`, `unitplace:<id>`, `grant:<id>`, `home:<id>` — §Units, places, homes and rights | Yes |
| Accounts, access requests, each admin's seen requests | settings collection, one row each — `account:<id>`, `accessreq:<id>`, `reqseen:<accountId>` (since 30 Sep 26, `[DB-READINESS]` group A phase 4.4; they were `accounts` and `accessreqs`) — below, §Accounts and session | Yes |
| The store's own stamp, `settings/schema` | ONE object since 30 Sep 26 (`[DB-READINESS]` group A phase 0, `src/storage/schema.ts`): `{ stage, dataFormatVersion, initialized, appliedAt, minClient }` — the design's `SchemaVersion` row (`data-model.md`). `initialized` is how the app knows the store has STARTED (it replaced the sniffs of `inputs/all` and `leavewar/wars`); a first boot writes its seed and `initialized` in ONE saved group; a wipe clears it; a store ahead of the build is never touched. A bare number (every store before) still reads, as format 5 with `initialized` unknown, and is upgraded at its next boot | Yes |
| The change log, `changes/*` | its own collection since 30 Sep 26 (group A phase 0 — cleared by a wipe with `inputs`, `weeks`, `leavewar`); written since phase 4.1: ONE `changes/<clientBootId>-<first seq>` per saved group, in that group — `{ type, seqs, actorId, at, items: [{ table, key, op }] }` (`actorId` an account's id, or for a session with no account its bare role — `pending`, `off` (`guest` went with the guest view — D2239) — never a sign-in name, 5 Nov 26), a pure invalidation log (it names the rows, never their values) — by the whiteboard's seal (`src/state/changebatch.ts`); the newest 200 kept, the oldest retired in the group that adds the newest. A group written outside every command is never sealed — only the Tracker's first mount (its seed and migrations), named in `src/state/changebatch-rollcall.test.ts` | Yes |

**What an empty store starts with — the boot policy (since 30 Sep 26, `[DB-READINESS]` group A phase 5 — `src/bootpolicy.ts`,
`src/boot.ts`).** The build's own settings choose it: the DEMO (the default — every test, the dev server, the e2e suite,
his preview) seeds an empty store with the demo world as always; a SHARED store (`VITE_SEED_DEMO=false`) is never
seeded — no demo requests, roster, weeks (the two authored demo weeks read blank), accounts, Leave War world or Tracker
course — and its first boot stores exactly the stamp, its FIRST ADMIN's person and account (from `VITE_BOOTSTRAP_ADMIN`:
a sign-in name and a person, or a person IT already made), and the one change-log batch naming them, in one saved group.
A shared store whose first admin is not configured, or not as a person the app can make, refuses to start and writes
nothing. A started store is read as it stands under either policy — no account row then means no account under a shared
store's policy, a list with no admin is left as it is there, and no war stored means no war under either (the Leave War
shows "No leave period yet"). Every boot resets the live scheduler data in place from frozen copies of the demo, or to
blank (`src/state/seeds.ts`), before storage is read.

`?fresh=1` on the URL forces the Memory backend for a clean-start demo. So
"moving RAPTOR to a database" is now giving these already-per-browser shapes
a permanent, **shared** home, rather than saving them for the first time.

## Whose is each record — a squadron's or everyone's (the key inventory, 17 Nov 26)

The multi-squadron build's first step (batch 1, step 0 — plan
`docs/superpowers/plans/2026-11-17-multi-sqn-build-batches.md` §3.4; D1695, D2087). From batch 1 two squadrons share
one app, so every stored record is placed once: **a unit's** — one squadron's (a detachment's from batch 2), each unit
keeping its own copy, its id carrying the unit from step 2 (`<unit>@<its id today>`) — or **the community's** — one
record for everyone, whatever schedule is in view. Nothing a person's own squadron owns is ever worked out from the
schedule in view. The list in code is `src/storage/keyowner.ts`; `storage/keyowner.test.ts` fails on a stored key or a
settings key the source names that is on neither list, so a new kind of record cannot be saved before someone decides
whose it is.

| Owner | Stored records |
|---|---|
| **A unit's** | `weeks/*` (weeks, days, issued versions, retractions) · `plan/*` (the planning calendar's `pp:` and `dm:`) · `leavewar/*` — the Leave War's whole world · `tracker/*` — the Tracker's whole key space (courses, charts, ball details, flex, layouts, marks, dates, pace, plans) · settings `rules`, `daytpl`, `dutytpl`, `wavetpl`, `wavehide`, `wavedefault`, `cxreasons`, `stores`, `lookahead`, `secdefault`, `qualcols`, `insights`, `sanscalendar`, `memberfile` (`guestview` left this list with the guest view — D2239) · settings rows `flyday:`, `flyrule:`, `flyrun:`, `missionrole:`, `elog:`, `apprseen:` (moved here from the community's — batch 1's second half §3 item 7, R2, 23 Nov 26) |
| **The community's** | `people/*` · `inputs/*` (one record an input; from step 3 every reader asks `inputsFor(unit, iso…)` — an input belongs to its person's home unit on its date) · `notices/*` · `changes/*` (the store's change log) · settings `schema` · settings rows `account:`, `accessreq:`, `reqseen:`, `seen:`, `noticeseen:`, `lwseen:` · settings rows `unit:`, `place:`, `unitplace:`, `grant:`, `home:` — the units, where each is, each person's home and each right in another unit (step 1, §Units, places, homes and rights below): they say which unit a record is, so they are no one unit's |
| **Neither — this browser's** | `raptorLocal:*` and `ocuLocal:*` (view preferences, outside the store) · the documents drawer `raptor-docs` (a person's attachment, the community's when it reaches the database) |

**The module singletons**, the live halves of those records: a **unit's** holds the one unit in view, as it holds one
week today, and the "142 ▾" pick reloads it by a week load's path (step 2) — `DAYS`, `SCHED`, `DATES`, `CURWEEK`,
`PLANPUCKS`, `DAYRMK`, `VCONF`, `SHIFT_HARD`, `CXR_CFG`, `DAYTPL_CFG`, `DUTYTPL_CFG`, `WAVETPL_CFG`, `WAVEHIDE`,
`STORE_CFG`, `LOOK_CFG`, `ELOG`, the check's results (`WARN`, `REST`, `EVD`, …), and the module-private
week stash (`engine/weekstash.ts`, keyed by unit and week from step 2 — it holds every unit's weeks touched, never only
the one in view), flying-plan cache (`state/flyplan.ts`), Quals' column list (`engine/qualcols.ts`), mission-role
answers (`state/mission-roles.ts`) and members' switch (`state/memberfile.ts`); the Leave War's and the Tracker's whole
stores are each a unit's world, held for the signed-in person's home unit and started fresh by the reload at sign-out.
A **community** singleton holds everyone's and is never swapped — `PEOPLE`, `ID_BY_CS`, `INPUTS`, `ACCOUNTS_LIST`,
`ACCESS_REQS`, `NOTICES`, the seen caches (`state/changes.ts`, `state/noticeseen.ts`); from step 3 every enumeration of
`PEOPLE` goes through `rosterOf(unit, iso)`.

**Whose a community record is — asked, never stored (step 3, 18 Nov 26).** Nothing new is saved: no person row and no
input row carries a unit. A person is the unit of his home row on the date (`home:` rows, `state/units.ts homeOn`; on the
demo a person with no home row is `u142`'s); an input is its person's home unit's on its date (`engine/inputs.ts
inputsFor` / `inputBelongs` — a unit's when any man named in it is at home there on the date, its window offering its
first named man's unit's people, `inputUnitOf`; an input naming only ALL / ALL AVAIL is its filer's unit's).
So a transfer (batch 4) moves a man's inputs from its date by adding one home row, rewriting none. Every walk of either
whole list that is not for one squadron is allowed by name in the two guard tests, each with its reason
(`engine/roster-readers.test.ts`, `engine/inputsfor-readers.test.ts`). The Leave War's OIL credits are derived from the
signed-in person's home unit's own published days (its loaded week live when it is in view, its other weeks from the
stash by their qualified keys), never from the schedule in view — the stored war records are unchanged in shape.

### The unit-qualified id — `<unit>@<its id today>` (batch 1, step 2, 18 Nov 26)

One codec, `src/storage/unitid.ts` (`qualify`, `split`, `unitOf`, `localOf`), carried through every layer — the engine,
the state layer, the change stream, Undo and storage — never added only at the storage edge. A unit id is opaque and
plain, `u` and base-36 letters (`u142`, `u149`): no hyphen, slash, tilde, colon, hash or `@`, so nothing that reads an
id by its separators can take the unit for part of the date. **The date part is read only after the unit is split off**
(`localOf` — `engine/verid.ts dayIso`, `engine/weeks-data.ts weekBundle`, `undo/derive.ts isoOfDay`,
`state/persist.ts weekKey`). An `@` after anything that is not a unit id (`wren@mail`) is not a unit.

| Where | A unit's record, as named now |
|---|---|
| the change stream (`collection/id`) | `days/u142@13/07/2026#0`, `sched.book/…#0`, `sched.mutes/…#4`, `sched.week/u142@13/07/2026`, `sched.issuance/u142@13/07/2026:<verId>~n`, `sched.retraction/…`, `weekstash/u142@13/07/2026<sfx>`, `plan/u142@pp:<id>`, `plan/u142@dm:<iso>`, `settings/u142@rules`, `settings/u142@flyday:<iso>`; a schedule command's scope `{ module:'sched', weekId:'u142@13/07/2026' }` |
| stored rows | `weeks/u142@13-07-2026` (the week row), `…#<di>`, `…:is:<verId>~n`, `…:rx:<verId>~n` · `plan/u142@pp:<id>`, `plan/u142@dm:<iso>` · `settings/u142@<name>` (`sqn142_u142@<name>` behind the settings door, `engine/hooks.ts storedKey`) |
| memory | the week stash (`engine/weekstash.ts`) is keyed by unit and week: a bare week key means the unit in view's, a qualified one that unit's; `stashKeys()` lists the unit in view's weeks, `stashEntries()` every unit's, qualified |

**Settings:** a setting's logical name (`rules`, `stores`, `flyday:<iso>` …) means the unit in view's; it is stored as
`<unit>@<name>` and written only by its named settings command (`settings.stores`, `fly.day.set` …), whose change names
the stored id. The settings records the command layer keeps cover every unit's stored settings, so Undo puts back
another unit's setting by its own name. **Not yet qualified, on purpose:** `elog:` (the change history across the apps)
stays as it was, readable by the unit in view only. *(Step 4, 18 Nov 26: `missionrole:` is qualified now — each blue/red
answer row is stored as `<unit>@missionrole:<its id>`, under the unit whose schedule it was given on, and only the unit in
view's rows are read into memory, read again when the unit in view changes (`state/persist.ts hydrateRolesFor`, from
`state/store.ts switchUnit`). `elog:` is the open item still: its reader did not move in step 4.)* *(The full check of
batch 1, 18 Nov 26: each `elog:` line now carries `u`, the unit it was made in — the unit in view when the change was
made; a line saved before carries none and reads as the boot unit's. Only the unit in view's lines are read into
memory (`engine/editlog.ts elogLoad`), read again when the unit in view changes (`state/store.ts switchUnit`), so a
squadron's changes window, its "new to you" count and Admin → Data's "Clear edit history…" reach its own lines only. The
row id stays bare: the line's id is minted once, never shared, so it needs no qualifying.)*

**The Leave War and the Tracker — a whole world per unit (step 4, 18 Nov 26).** Neither store knows a squadron
exists: each reads and writes its keys as it always has (`war:2026`, `v3:master:syls` …), and the door it is handed
stores every key under one unit — `leavewar/u149@war:2026`, `tracker/u142@v3:master:syls` (`storage/adapters.ts
leavewarAdapter(wb, unit)`, `trackerTarget(wb, unit)`, the same codec as the weeks). A door lists, reads, writes and
removes only its own unit's keys, so two squadrons' worlds never meet; a key with no unit (a browser's records from
before step 4) is no unit's and is never read (D22 — cleared at step 6). The Leave War loaded is the signed-in
person's home unit's (`leavewar/sync.ts swapWarWorld`, at every sign-in — and, since the reshape of 21 Nov 26, again at
midnight of his own move, through the page's one entry `state/store.ts enterSquadron`), its roster that unit's people alone; the
other squadrons' worlds are read from their own doors where a reader needs them (their public holidays, below). The
Tracker binds the signed-in person's home unit when it first loads (`tracker/storage.js markStorageLoaded`) and refuses a
bind to another unit after that — so, until signing out reloads the app (plan §3.4, O8 — not built in step 4), a second
person of the other squadron signing in on the same tab is still shown the first one's Tracker. Nothing changes in the
records' shape. **Public holidays — each squadron's own (his D2195, 18 Nov 26; built 21 Nov 26, the reshape's A4):** a
public holiday is stored in the one squadron's war it was entered in and is that squadron's alone — no other squadron
reads it, even at the same place (`leavewar/sync.ts nonWorkingFor(unit, iso)` answers from that squadron's own list: the
loaded war for its own squadron, another's from its door). *(Replaced: as built on the night of 17–18 Nov 26 every other
squadron at the same place on that date read it laid onto its own war — `placeHolidaysFor`, removed.)* An
Off day stays its own squadron's. **The demo (step 4):** 149's people (`state/demoseed.ts DEMO_149_PEOPLE` — their own
ids and callsigns, each with a seeded home row in 149), their own two inputs, their own week on the same dates as 142's
(`engine/week149.ts`), their own Leave War world (the seed's periods and holidays, nobody's records) and one Tracker
course; seeded accounts `ad9` (149's admin), `us9` (149's member) and `ad2` (a second 142 admin), never printed on the
sign-in card.

**Stored data from before step 2 (D22):** an unqualified week, day or planning row is simply not read — the store is
cleared and both units seeded fresh, never converted; no converter is written for it. The schema stamp bump that clears
it on the next boot is step 6's. Until then a browser that saved weeks before step 2 shows them as never saved.

### Edit rights by squadron — the four kinds (batch 1's second half, step A, 22 Nov 26)

Once the Schedules menu lets a person pick a squadron he holds only View of (D2252), "is he an admin?" asked of the role
alone would offer him that squadron's edit controls. Every caller of the edit questions is one of four kinds, each with
its own question (`src/state/perms.ts`, the block above `mayEditOwnPage`); the per-file list with each reason is
`src/state/edit-rights-readers.test.ts`, which fails on a caller it does not list.

| Kind | The question | Asked by |
|---|---|---|
| **schedule** — a control on the schedule in view | `canEditSched()` / `lgCanEdit()` / `HOOKS.editMode()` → `maySchedEditPage()`: the role in force AND an admin of the squadron picked | Edit Schedule, the Scheduler Board, View-only Sched's edit doors, Logic, the day / wave / duty templates (whether each dialog — Duty templates, Flying waves, Day templates, and Plans below — is drawn is asked in `ui/windrawn.ts`, moved there from the four dialog files by the guard rail's K1a, 26 Nov 26) and Admin → Squadron config — its defaults, its three template doors and the whole panel greyed under "This is 149's set-up…" for anyone who is not that squadron's admin (D2317), the saved plans, the changes window's member form, the ALL AVAIL window's earning switch, Admin → Data's "Clear old clutter…" and "Clear edit history…" (they act on the schedule in view's planning notes and change history), which page an Undo lands on, Edit Schedule's tab and its entry in the ☰ menu (`ui/Drawer.tsx` — the walk's F1, 23 Nov 26) |
| **own** — his own squadron's page | `canEditOwn()` → `mayEditOwnPage()`: the role in force AND an admin of `pageUnit('own')` (a View holder's home; a Plan holder's or master admin's pick) | the Inputs window and calendar, an input's documents and people picker, the OIL list raised after filing; the Quals, SANS and Inputs pages' own role checks (their writes judged by each man's squadron) |
| **named** — a squadron of its own | `adminOfUnit(u)`: the role in force AND his level in `u` that day is admin (its own admins, a Plan holder, a master admin — D2336) | the Inputs, SANS and Calendar settings windows (stamped with the squadron they open on — `state/cutoff.ts openWinFor`), the late cut-off, the OIL list, the planning calendar's verbs (the calendar lent to them — `ui/owncal.ts`), an input of another squadron opened read only, the Home squadron Add a person names (`state/roster-add.ts newHomeProblem` — §4 item 7) and the squadrons its "Home squadron" box offers (`ui/usersfilter-model.ts addHomeChoices`, the same test), Admin → Users' opened row — the rest of a man's row is an admin of his own squadron's, each squadron line an admin of that squadron's (`ui/UsersPanel.tsx rowLocks`, `ui/useraccess-model.ts lineState` — D2191, D2336) |
| **role** — a question about the person | `isAdmin()` / `mayEditSched()` | the member-view switch and role chip, the Admin and Logic tabs, the drawer's Admin entry and the help page's admin parts, the bell's own reads, the bug reports' mark, who answers access requests at all, and Admin → Users as the app takes the Admin page away under an open row — whether the role in force is still an admin's, deciding only whether the "row changed" note is said (`ui/UsersPanel.tsx takenAwayUnder`; no control, no write) |

**Beside the four kinds — who is looking at an open row (Admin → Users, U1's fourth round):** for a row left open, the
page also holds whether the signed-in person's ACCOUNT, as the store has it today, still makes him an admin of the
squadron the row opened on — its own admin, a Plan holder of it, a master admin (`ui/UsersPanel.tsx adminThere`, through
`state/accounts.ts levelIn`; the store, not the role in force, because the session still says "admin" until the app
makes it again after the next draw). It decides only whether the open row closes with its "row changed" note — his own
move's day come, or another admin made him a member — and it offers no control and lets no write through, so it is no
edit question and no entry of the inventory. Tests: `src/ui/msq-s2-rejudge4.test.tsx` §24.
**Since U1's fifth round it is required, not compared, and asks first whether his session still stands**
(`state/accounts.ts sessionLapsed` — his sign-in suspended, his person archived or deleted, his account gone, its role
changed, put on another person; a hand-made session with no account never lapses): the answer is no longer held from
the press and compared later — an open row closes at any judging where it is "no", and a press opens no row without it
(`ui/UsersPanel.tsx adminThere`, `rowChanged`, `toggle` — where the session has lapsed the press asks the app to
repaint, so it ends or remakes his session at once). Still no edit question: it only closes a row or leaves one shut,
and the scan of `src/state/edit-rights-readers.test.ts` counts neither `sessionLapsed` nor `levelIn`. Tests:
`src/ui/msq-s2-rejudge5.test.tsx` §27.

**The landing (D8):** wherever the page is Edit Schedule, the role in force an admin's and `maySchedEditPage()` false — a
pick of a squadron he holds View of, R6's re-entry, a Plan lowered while he is there — he lands on View-only Sched
(`state/store.ts landOffEditSched`, run on every notify and after every `enterSquadron`). Tests:
`src/state/edit-rights-pick.test.ts`.

**The Tracker after a pick (§16 D2′, D2318 — night job 2, 23 Nov 26):** not a fifth kind but a reading of the account:
`state/perms.ts trackerCoverKind()` asks whether the signed-in ACCOUNT (not the role in force) is an admin of the squadron
the Tracker loaded (`trkUnitNow`) by any road — home, Plan, the master mark — when that squadron is not `pageUnit('own')`:
yes, read only ('ro'; 'member' in the member view); no, hidden ('gone'). It offers no edit control; every Tracker write is
still judged by the gate's 7f clause on the role in force. `ownPageIfPicked(u)` answers which squadron his own pages would
be were `u` picked, for the pick's question about unsaved chart edits (`state/pick.ts askBeforeEntering`). Tests:
`src/state/msq-trk-cover.test.tsx`, `src/tracker/msq-trk-pick-ask.test.tsx`.

### Settings held in memory — read from an own page (step A's second inventory, §15 D4 / §16 D4′, 22 Nov 26)

`VCONF` (and `ruleNow`, which reads it) holds one squadron's Logic values: the schedule in view's. Each reader is marked
in `src/state/vconf-readers.test.ts` — **schedule in view** (the schedule engine, Logic, the week, the board, OIL Earn
mode: they judge the schedule shown) or **own squadron** (they ask the squadron of the thing judged, through the readers
`state/cutoff.ts` installs, `VCONF` only where that squadron is the loaded one):
- an input's late mark — its own squadron's cut-off (`engine/inputs.ts cutBackFor`, the reshape's phase 3);
- an input's OIL amount — its own squadron's "Full-day OIL threshold" (`engine/oil.ts inputOilAmt(…, unit)`, read by the
  ask plan `leavewar/sync.ts oilAskPlan`, the bell's pending-OIL count through it, and `voidedOil` / `repricedOil` at the
  save door and at the gate); test `src/state/vconf-own-readers.test.ts`;
- the "bidding closed · its dates ended" line — his own squadron's war, loaded or stored (`leavewar/sync.ts endedLines`);
  test `src/leavewar/msq-ended-lines.test.ts`.
Traced, nothing to change: the Leave War's OIL credits (`desiredOilCells`) read each published day's own kept threshold
(`engine/oilev.ts oilAmount`); only a block published before the values were kept falls to today's — stored data (D56).

---

## World 1 — the scheduler

### A day's OIL evidence (`Day.oild`, `Day.oilev` — 21 Sep 26, `[OIL-AUTO-REMOVE]`)

Two fields, and the difference between them is the whole design (`engine/oilev.ts`,
`docs/engine-rules.md` §Weekend/PH work earns OIL):

- **`oild` — the scheduler's DECISIONS. Day content.** `{ blanket?: 1, items?: {
  <itemKey>: 0 }, people?: { "<personId>|<itemKey>": 'allow' | 'deny' }, pa?: { "<personId>|i:<iid>": <holding> } }` —
  `pa` (30 Sep 26, `[DB-READINESS]` group A phase 6 (a)): the holding of the request each decision about it was made under
  (the request's `hand` then); a decision about a man the request has LEFT since (`Input.leftAt`) reads as nothing. Stored on
  the live day, so it rides the snapshot, a parked plan, an undo and the persistence
  funnel like any typed time, and changing it is publishable as an amendment. Absent
  means nothing was decided, so the ordinary rules decide alone — which is why a mark
  turned on and off again is DELETED rather than left as an empty object.
- **`oilev` — the FROZEN evidence. On an ISSUED SNAPSHOT'S day copy ONLY.**
  `{ iso, earns, d: <the decisions>, inputs: [{ iid, person, type, asks, acc, win,
  ans }], sent: { <itemKey>: personId[] }, rv?: { reportLead, debrief, oilFullMin, fltLen? } }` — `rv` (6 Oct 26,
  `[OIL-WORK-START]`, D592 (4)): the three Logic values the day's OIL was worked out from, in minutes, as they stood at
  publication (and since D2046, 16 Nov 26, the assumed flight length `fltLen`, absent on an older block, which then reads today's); on a day that earns only. Every reader of the block's OIL uses them, so a later Logic change moves a
  published day's OIL only when the day is published again. A block without it (an earlier build's) reads today's
  values. Attached by `publish.ts:daySnap` and
  stripped from every clone back onto a working copy (`drafts.ts:liveDay`). *(Since the one-rule build, 12 Oct 26 — step 2 (d); D762: an entry of `inputs` is ONE claim an input and carries `people` (the named ids) and `ph` (its placeholder, where it holds one) in place of `person`; `sent['i:<iid>']` is written for a claim that has a placeholder and never contains a person named in the input. A block frozen before the build keeps `person` and is read by the legacy reader — `oilev.ts legacyClaim` — so the day keeps the OIL it went out with; `claimPeople` / `claimPh` read either shape.)* It is the
  ONLY thing the credit pass reads on a published day. **Never present on a live day**
  — there it is derived on read, so it cannot go stale and a plan restored months
  later cannot resurrect an obsolete projection.

An item key is `i:<inputId>` for anything derived from an input (including a ground row
the input landed on — the row is deleted and recreated on every member edit, the input
is not) and `r:<rowId>` for a hand-built row.

**On the wire to the database:** `oild` is real squadron data and must migrate. `oilev`
is part of the ISSUED DOCUMENT and must migrate WITH its snapshot — it cannot be
recomputed later, which is exactly why the cutover clears pre-existing weeks
(`storage/reset.ts`, schema 5) rather than trying to rebuild evidence nobody stored.


### People (the roster) — `PEOPLE[id]`, `src/engine/people.ts`

One record per person, keyed by a short lowercase id that is the same id
the schedule, the inputs and the Leave War all use.

| Field | Type | Meaning |
|---|---|---|
| id (key) | string | e.g. a short handle; never shown, used everywhere |
| `cs` | string | callsign — the display name |
| `seat` | `'FCP' \| 'RCP' \| 'GND'` | front cockpit (pilot), rear cockpit (WSO), ground |
| `q` | `'OCU' \| 'D' \| 'C' \| 'B' \| 'A' \| 'IW' \| 'IP' \| 'IR' \| 'FI'` or `''` | category ladder, lowest to highest (`QORDER`); ground crew hold `''` |
| `sxo` | boolean | SXO-qualified |
| `initials`, `flight`, `remarks` | string | ground-crew extras |
| `pers` | boolean | ground personnel (no flying quals derive) |
| `special` | boolean | a sentinel body (`ALL`, `ALL AVAIL`) — occupies slots, is not a person |
| `archived` | boolean | kept out of every roster |
| `archivedBy` | `'po'` \| `'del'` \| `'admin'` | `'admin'` when Archive on Admin → Users did (`[ONE-DOOR]`, D310, D323 — only Restore there takes it back); `'po'` when the Leave War's posting pass archived him (an "Overseas Sqn" posting, its date come) — the archive the posting's Undo, a later date or another outcome takes back; `'del'` when a delete did (below); absent = archived by hand on Quals (the absence-record re-test's final read, 26 Sep 26) |
| `archivedOn`, `archivedWho` | `'YYYY-MM-DD'`, person id | **how and when he came to be archived** (D329, 28 Sep 26 — his row on Admin → Users says it, `leavewar/sync.ts archivedLine`): the day an admin archived him and that admin's person id (read back as his current callsign), or — `archivedBy 'po'` — his posting's date and no id. Cleared by Restore and by a posting's take-back; absent on a man archived before it was kept |
| `deleted`, `deletedFrom` | boolean, `'YYYY-MM-DD'` | **the delete's hidden mark** (`[POST-OUT-OUTCOMES]`, D287, D290, 27 Sep 26 — `state/person-delete.ts`): the record is KEPT (every day he flew still points at him, D297) but read as gone everywhere — no list, no picker, the Archived one included; his callsign free (the callsign index skips him); `deletedFrom` the first day he is gone, the later of the delete's date and the calendar date. Written with `archived: true, archivedBy: 'del'`. Never cleared — a delete is final |
| `sanBy` | `'po'` | present only when a SANS posting ticked `san` on its date (D283) — what the posting takes back; absent = ticked by hand |
| `sanFrom` | ISO date | the first day of the SANS he holds now (D2313): a posting's own date, a hand tick's day; absent on a SANS man = from always (every tick older than D2313). Every reader about a DAY asks `engine/people.ts sansOn(id, iso)`, never `san` alone |
| `sanWas` | `[from, to][]` | each earlier stretch of SANS that has ended (D2313) — `to` is the day it ended and is not a SANS day; `from` `''` = from always; written when a tick is taken off by hand or an archive ends a posting's SANS. (A SANS posting set AHEAD writes nothing here: the day's reader asks the Leave War's saved posting until it runs — D2329, `engine/people.ts setSansAhead`) |
| `sanPo` | `[from, to][]` | the days a SANS POSTING had him fly with us before an archive closed his stint — `from` the posting's date, `to` the archive's day (not one of them); written by the archive from his saved posting (`leavewar/sync.ts archivePerson`), never by a tick; the ALL AVAIL crowd counts him on such a day when he is named and free (D327, D283, D27 — round 4b's reads of D2328, 22 Nov 26) |
| `schedOf`, `schedFrom` | unit id, `'YYYY-MM-DD'` | **the squadron his Scheduler tick was given in, and the day** (core line 4, 22 Nov 26 — D2160: the tick ends in the old squadron on a move's date). Written with the tick by `state/quals-write.ts`, dropped when it is unticked; read by `state/units-model.ts schedTickHolds` for the sign-off boxes (`engine/publish.ts signPeople`): the tick counts in that squadron from that day until the start of his next move day. Absent on a ticked man (every seeded one): the squadron of his first home row, from always. An admin's to write, as the tick is (`perms.ts OWN_ROW_ADMIN_ONLY`), and only as it is: on a ticked person, the squadron he is in today, from today — the Undo of an untick alone puts back an earlier day (`perms.ts schedRecordViolation`, fix read 2); it counts on no day before its own |
| `san`, `sanQ` | boolean, `{flown, carry, missedQtrs}` | SANS member and their quarter progress |
| `tf`, `sched` | boolean | terrain-following mark; scheduler appointment (both granted, never derived) |
| `quals` | object | **derived at boot** by `deriveQuals`: `sxo, imc, nvg, tf, san, sched, scDay, scNight, daar, naar` (booleans; `daar`/`naar` may also be `'I'` = instructor) |

The quals ladder invariants are enforced at boot and on every tick: night
is signed off after day (SC and AAR alike); an instructor night mark that
outruns its day one is demoted, not removed.

### Inputs (leave / away / medical / activity) — `INPUTS[]`, `src/engine/inputs.ts`

One record per filed input. The type catalogue (`inpMeta`) is the source of
truth for what each type means; the fields below are what a record carries.

| Field | Type | Meaning |
|---|---|---|
| `iid` | string | **CORRECTED 17 Sep 26** — it is NOT `'i' + n` and there is NO counter. Since ARCH-STACK 1A it is the shared OPAQUE id `newId('i')` = `'i'` + a base-36 timestamp + 6 random base-36 chars (`src/engine/newid.ts`), minted by `inpId` on first read and by `mintInpIds` at boot. Opaque precisely so two devices cannot both mint `i5`. The stable handle — never address an input by index. `state/persist.ts` says so in place: "no counter to seed past stored ids" |
| `people` | `Array<{ p, by?, at?, mod?, h? }>` | **WHO IS IN IT — the list of the input's people, in the order they joined** (the one-rule build, 12 Oct 26, `[ALL-AVAIL-AS-MEMBER]`; owner D756, D759: "an input is stored as ONE record with the list of its people"). Every input a command writes carries it; an input for one person is a list of one. `p` — a PEOPLE id, or one of the two PLACEHOLDERS `allavail` / `all` (at most ONE, beside named people or alone — D753; only on a one-day input of the six kinds *[SEVEN since 12 Oct 26 — D778: Personal is one of them; D712 stands for "Attach"]*, never filed under Unavailable). `by` / `at` — who put THIS person in and when. `mod` — his own late date, kept only where it is later than the input's (a person added from the schedule never reads late — D741). `h` — the input's `hand` when he was put in: a scheduler's OIL switch about him made under an earlier holding reads as nothing. Read through `engine/inputs.ts peopleOf` (and `namedOf`, `placeholderOf`, `idsOf`, `holds`, `entryOf`), never directly; written only by `engine/inputown.ts` (`toPeople`, `putPerson`, `takePerson`, `swapPerson`, `ownInputOf`) under `ui/inputedit.tsx commitInput`. Held at the save boundary for every command, an Undo's restore included (`engine/inputs.ts shapeProblem`): at least one entry, nobody twice, at most one placeholder, and a Personal input one person's own *[WITHDRAWN 12 Oct 26 — D776: a Personal input may hold several people, as every other kind; only a medical kind and an upchit are one person's]* |
| `person` | string | **THE OLD SHAPE since the one-rule build (12 Oct 26 — D756): no command writes it any more.** A record has `people` or `person`; one saved before the build — and a seed literal left verbatim (`engine/inputs.ts`, `engine/week2.ts`) — keeps `person`, reads as a one-person input for ever (`peopleOf`) and is rewritten with `people` the first time who is in it changes — nothing stored is converted (D56). *As it was:* a PEOPLE id — a person's, or one of the two PLACEHOLDERS `allavail` / `all` for an input filed for "whoever is free" (D700, D702, 9 Oct 26): then no name is stored at all, the record is one of six kinds, one day, never in a group (`engine/inputs.ts placeholderProblem`; held at the save boundary), and `by` is whose OIL answer everyone behind it follows (D711) |
| `date` | string | day, display form (`'Jul 13'`) |
| `endDate` | string? | last day of a multi-day input |
| `firstEnd` | string? (ISO `yyyy-mm-dd`) | a DOWNCHIT's last day as it was filed, kept the first time an upchit cuts it short (owner D999, 18 Oct 26) — with its year, unlike `date`; dropped when its dates are changed by hand or another medical cuts it: an upchit moved later gives the days back up to the day before its new date, never past this; removed once given back whole. Absent on every other input, and on a downchit no upchit has cut |
| `yr` | number | the anchor year the bare date label belongs to — written on create/edit (`src/ui/inputedit.tsx:712`, `src/ui/InputsPage.tsx:391`, `src/leavewar/sync.ts:323`) and back-filled at boot on any row without one (`src/state/store.ts:602`); part of the content key `inpKey` |
| `allday` | boolean | all day, or a window |
| `s`, `e` | number? | window start / end in **minutes from midnight** (when not all-day) |
| `half` | string? | half-day marker for types that allow it |
| `type` | string | one of the catalogue codes below |
| `remarks` | string? | free text, may be `''`; absent on the seed SANS rows. **Only what a person typed (owner D948, 16 Oct 26):** the app no longer writes "till <date>" (or the Leave War's "on <date>") into it — every screen prints it from the input's dates (`engine/inputs.ts remarksShown`). A record saved before may still carry one: it is read as the date, and the next save of the record drops it (demo data, D56) |
| `till` | boolean? | **the till-date tick's hand choice** (owner D953, 17 Oct 26): present ONLY where someone ticked or unticked the date against its default — ticked for every input except a one-day duty or other commitment (D951, D952) — so its default is always `!till`; absent = as its dates say (`engine/inputs.ts tillShown`). A choice that equals the record's default now is one its dates or kind overtook and is dropped by the next write (`tillSettle`, in `state/store.ts runInputWrite`) |
| `title` | string? | **the input's own name** (owner D715, D716 — 9 Oct 26; `[INPUT-OWN-TITLE]`): present ONLY where its filer typed one that differs from its kind's own name, on a kind that takes a title (the "Duty & other commitments" kinds — `engine/inputs.ts titledKind`); trimmed, at most 40 characters (`titleOf`, the one normaliser). Absent on every other record — a title on a kind that takes none is ignored on read and dropped at the next save. Shared by every record of a group input (`state/inputgroup.ts SHARED_FIELDS`) *(since the one-rule build, 12 Oct 26 — D756: an input is one record, so its title is everyone's; `state/inputgroup.ts` is removed)*. The KIND (`type`) goes on deciding every rule. |
| `mod` | string | last-modified date, ISO `yyyy-mm-dd` — **frozen at the moment of the write** (`engine/inputs.ts nowStamp`, every create, edit, trim and the Leave War's approve door); a record minted before the freeze may still carry the literal `'now'`, which the reader resolves to today (`inputStampISO`). *(Corrected 1 Oct 26, `[STORE-READER-SWEEP]`: this row said the app still writes `'now'`.)* |
| `acc` | `undefined \| 'g' \| 'u' \| 'r'` | never landed / landed on the Ground Programme / actioned to Unavailable / **removed by a scheduler (dormant)** — ONE filing for everyone in the input since the one-rule build (12 Oct 26, D759 reading 1): one man is not taken off the programme alone, he is taken out of the input |
| `u` | string? (a squadron's id, `u142`) | **the squadron an input of ALL AVAIL / ALL alone was filed on** (the multi-squadron reshape, 21 Nov 26 — his D2243, the reshape plan §12 Q1: such an input stays on the squadron it was filed on when its filer moves squadron). Present on an input that holds a placeholder — with men named beside it too (the fix round of 22 Nov 26, Opus's read F3: the stamp was dropped once a man was named and found again from the man taken out, so a 149 meeting whose added man had moved to 142 came back stamped 142). **Written at filing:** the squadron its window was opened among — the schedule in view's from a schedule's panel, the page's own squadron from the Inputs page or its calendars (`ui/InputWindow.tsx` hands it in; `ui/inputedit.tsx commitNewInput`, `filedOn`: with none handed in, the page's own) — and on the demo seed's placeholder inputs (`state/demoseed.ts`). **Settled by every save that changes who is in it** (`engine/inputs.ts settleStamp`): an input left with no placeholder loses the stamp — whose it is follows its people; one holding a placeholder keeps the stamp it has, and with none takes the squadron the input stood on before the save, else the page's own. A member's take-out of himself alone writes no stamp — it stays exactly as it was (the gate lets him change only his own entry — D770). The window's Person list and its save door judge the same stamp the save will write (`ui/inputedit.tsx draftImage`). **Read by** `engine/inputs.ts inputSquadrons` / `inputOnDay` (and through them the gate, the lists and the bell's `state/notices.ts filerUnits`), named-first: while a man is named the input is its people's and the stamp is only carried; naming nobody, the stamp where there is one, else its filer's squadron on its first day — so an input filed before the stamp, which carries none, reads as it always did (demo data, D56). Not to be confused with the filing `acc: 'u'` above. Pinned by `state/reshape-c3-allavail-stamp.test.ts` |
| `schedPlaced` | `true?` | **a scheduler has moved this input** (his D1388, 26 Oct 26 — `[LW-OTHER-GOES-TO-LOCK]`): written in the same command as his move by each of his doors — Reject, → Ground, → Unavail (`ui/interactions.ts`), its Ground Programme row removed (`ui/board.ts`), his window's Goes to or a retype that moves it (`ui/inputedit.tsx markMoved`) — never on his own one-person input, never by filing; from then on a member's save leaves where it stands (`commitInputEdit`), his window offers no Goes to, and the commit gate refuses a member's command that moves it or sets or clears the mark (`state/perms.ts mayMovePlace`, `inputBreach`); read by `engine/inputs.ts placeHeld`, which also holds a record parked by a Reject (`acc:'r'`) |
| `odGround` | `true?` | **an overseas duty a scheduler put on the Ground Programme** (his D1393, 26 Oct 26): kept on the record because the `'g'` a week works out for itself is cleared at every week load, and an overseas duty with no mark stands under Unavailable by its kind; absent on every other record. Taken off again by Reject or → Unavail (`engine/slots.ts`), dropped by a retype (`ui/inputedit.tsx`); read by `engine/inputs.ts odOut` / `goesOnProg` |
| `hand` | number? | how many times the request has changed hands — +1 at every change of person (`ui/inputedit.tsx commitInputEdit`); absent = 0 (`[DB-READINESS]` group A phase 6 (a), 30 Sep 26). *(Since the one-rule build, 12 Oct 26: +1 each time a person or placeholder is put in, taken out or replaced — `engine/inputown.ts`; an entry's `h` is its value when he was put in.)* |
| `leftAt` | `{ <personId>: number }`? | the holding at which the request LEFT each man — written by the hand-over and, since step 3 of the one-rule build (12 Oct 26), whenever a person is taken out of an input's list (dropped again when he is put back — his entry's `h` says it then); an OIL decision about him made under an earlier holding reads as nothing (phase 6 (a)) |
| `cx`, `cxr` | boolean?, string? | CANCELLED, with its reason — the INPUT's own since step 4 of the one-rule build (owner D760, 12 Oct 26): a CX the scheduler puts on the row that came from the input. `cx` is `false` and `cxr` absent once un-cancelled. Written only by a scheduler (`ui/reqdoor.ts rowMark`); the row carries a copy; a cancelled input earns nobody OIL and is not checked against the rules |
| `flag` | boolean? | the red box (a scheduler's note to the next scheduler) — the input's own since the same step; shown on the schedule only; no part of what the input says to a published day |
| `info` | boolean? | information only — the input's own since the same step: not checked against the rules, earns nobody OIL |
| `lateOff` | boolean? | its LATE mark dropped by a scheduler, for everyone (owner D1586, 3 Nov 26 — until then a session-only set): absent = shown. A mark, not a change of the input — it stamps no `mod` and is no field the published-day comparison reads. Written only by a scheduler, through `inputs.lateOff` (`ui/interactions.ts`); a member's own later save of the input deletes it, the same day too (owner D1620 — `ui/inputedit.tsx commitInputEdit`, `commitInput`) |
| `by` / `at` | string? / number? | **who PLACED it and when** (owner D629, 7 Oct 26): the signed-in PERSON's id and the moment (ms) — the filer, who can differ from `person` (an admin filing for a member; the approver of a leave on the Leave War). Written once, by `state/inputstamp.ts stampPlaced` (the editor's new input, the Inputs List's Add form, the war's approve door — an approval that extends a leave re-states it); never changed by an edit; a PIECE the app cuts from a record (a leave cut or moved, a medical split) is a copy and carries that record's. Absent on a record filed before 7 Oct 26 or with nobody signed in. *(Since the one-rule build, 12 Oct 26 — D755 (2), D759 reading 7: `by` IS the input's filer — there is no `grpBy` — and it is no longer "never changed": it passes to the scheduler who replaces the input's only person, to the one person of an input someone else filed when he adds people to it, and, when its filer takes himself out, by the one body `state/perms.ts byAfterLeaving`. Who put in each PERSON is his entry's own `by` / `at` in `people`.)* |
| `modBy` / `modAt` | string? / number? | **who last CHANGED it and when** — equal to `by` / `at` on a record nobody has changed. Written by `state/inputstamp.ts stampChanged` at every door that changes an input (the plan `docs/superpowers/plans/2026-10-07-inputs-sans-redesign-plan.md` §3.8: an edit, an OIL answer alone, a leave moved or cut, a medical split or trimmed, a posting's trim). ONE moment per command. `modBy` is absent when the last change was the app's own act (a posting that ran by itself on its date). Undo / Redo put all four back as recorded. **Beside `mod`, never instead of it** — `mod` is the DATE the late rule reads, written exactly as before; a filing decision (`acc`) is not a change to the record and stamps nothing |
| `grp` / `grpBy` | string? / string? | **NOT WRITTEN ANY MORE (the one-rule build, 12 Oct 26 — owner D756, D759): an input filed for several is ONE record with `people`; there is no group id, no entry worked out on read, and `state/inputgroup.ts` is removed. A record saved before the build may still carry the two fields: they are ignored — it reads as that man's own one-person input (D759 reading 10; demo data, D56) — and dropped the first time who is in it changes (`inputown.ts toPeople`). The text below is the shape of 7 Oct 26, kept as the record.** *As it was:* **an input filed for a GROUP** (owner D654, D655, 7 Oct 26; the plan `docs/superpowers/plans/2026-10-07-inputs-sans-redesign-plan.md` §3.13): `grp` is a group id, the same on every record of one group filing, absent on an ordinary input; `grpBy` is the ENTRY'S FILER (a person id), the same on every record of the group and never changed once set — always together, never one alone. The group is kept as ONE RECORD PER MAN (every reader of an input reads one man's record and is unchanged); an "entry" — the one thing the Inputs page shows — is worked out on read: the records sharing a `grp` AND the same shared fields (`type, title, date, endDate, yr, allday, s, e, half, remarks, sans` — `sans` read as the set of Fly / OFT / AMT boxes ticked, so one availability an admin files for several SANS people is one entry, D658), `src/state/inputgroup.ts entriesOf`. A record changed alone no longer matches and reads as that man's own input; nothing is written to keep a group in step. Held at the write (the inputs door and the Undo / Redo restore): one man once an entry, one filer a group. `by` stays the truth of who placed THIS man's record |
| `lw` | string? | the **war id** the leave was approved in — PROVENANCE ("approved in war W"), written by the war's approval door (`src/leavewar/sync.ts` `doorApprove`); a member's own date/type edit clears it ([ARCH-STACK] step 4) |
| `lwBy` / `lwAt` | string? / number? | **who placed the REQUEST this leave was approved from, and when** (ms) — the earliest of the run's (the Leave War overhaul's M4, 8.6, 27 Oct 26): the Input's own `by` / `at` name the APPROVER, so the placer rides beside them and a put-back gives them back to the request (`sync.ts doorApprove`, `placerOf`). Written only by the war's approval door; a member's command never writes them (`perms.ts ownershipViolation`, the `inputs` case — a piece cut from the leave carries its parent's) |
| `lwU` | string? | **the squadron whose Leave War approved it** (the reshape walk's W2-F2, 22 Nov 26 — his D2243 Q6): written by `sync.ts doorApprove` where each squadron has a war of its own, so leave approved in 142's war before a man's move stays 142's (out of sight under the stripe) and is not in 149's war "until the Transfer batch carries it". A leave without it, and every other absence, is in the war whose squadron he is on that day (`sync.ts absenceOwnerOf`, `state/merge.ts AbsenceOwner`). Policed by the gate with `lwBy` / `lwAt` — one stamp: a person's own command keeps it or drops it, never writes or changes it (`perms.ts warPlacerForged`; `state/corelines-lwu.test.ts`) |
| `docId` / `docIds` | string / string[] | attachment ids (see Attachments) |
| `oil` | `{ 'yyyy-mm-dd': 0 \| 0.5 \| 1 }`? | the per-day OIL credit decision from the OilConfirm ask-flow — **the input's ONE answer, for everyone in it** (owner D762; the one-rule build, 12 Oct 26: given by whoever filed it or an admin; nobody in an input of several gives an answer of his own) — written after a create or edit (`src/ui/InputsPage.tsx:425`, `:599`, `:631`; `src/ui/inputedit.tsx:1325`, `:1335`) |
| `sans` | `{ f?, o?, a? }`? | SANS Availability only: which of Fly / OFT / AMT are offered (`src/ui/inputedit.tsx:715`, `:861`; `src/ui/InputsPage.tsx:397`) |

**Type catalogue** (`code` → group; each entry also carries `name, work,
local, ground, half, shiftHard` flags):

- `leave`: `LL` local, `OL` overseas, `OIL` off in lieu, `CCL` childcare, `PL` paternity, `FCL` family care, `EL` embarkation, `CL` compassionate
- `med`: `HL` hospitalisation, `OML` ordinary medical, `ATT C` medically down — cannot report, `ATT B` medically down — no flying, may work
- `upchit`: `Upchit` — fit to fly again
- `act`: `Training`, `CSE`, `Meeting`, `Attach`, `Personal`, `Appointment`, `Duty`, `Event` (D713, 9 Oct 26 — Duty's flags), `Other` — *[25 Oct 26 (D1372, D1374): `CSE` and `Attach` are filed under Unavailable by themselves — `acc:"u"` written at the save (`inputs.ts landsUnavail`, `filingOf`), an `Other` where its window's "Goes to" says (D1356); an `Attach` carries `to` (free words, at most 40 — D1373), shown in its name.]*
- `duty`: `OD` overseas duty (*[D1356, 25 Oct 26: UNA goes — an "Other" under Unavailable takes its place on the Leave War, the schedule and the Inputs page alike; BUILT 25 Oct 26 on `claude/lw-m3-placing-leave` ([LW-OTHER-UNAVAIL]): the war reads any commitment under Unavailable (`absences.ts warCounts`), drawn outlined by its letters (OTH, ATCH…); a stored UNA is dropped on read (`warrecs.ts isRetiredUna`).]* UNA stood here as an input kind for a day in round 2; since D1338, 24 Oct 26, it is the Leave War's own record — World 2, `WarRec` — never an input)
- `sans`: `SANS Availability`

### A schedule day — `DAYS[0..6]`, `src/engine/data.ts`

One record per day of the loaded week, Monday first. Times inside a day are
`'HHMM'` strings for `str`/`end` and `'HH:MM'` for take-off / land.

```
{
  dow: 'Monday', dt: 'Jul 13', wc: '4 X 4 X 0', today?: true,
  notes: string[],
  allhands: [{ prog, str, end, who? }],
  waves: [{
    label, night: boolean, intimes: string[], traffic: string[],
    formations: [{
      cs, msn, to, ld, rl?,          // rl: the formation's own rally (D1026, 19 Oct 26)
      aircraft: [{ p, w, area, rmks, opts: { tk2, tpod, nav, bombs } }]
    }]
  }],
  sims: { amt: [row], oft: [row] },        // row = { label, str, end, rmks } +
                                           //   either { p, w } or { pax: [] } or { who }
  dutywaves: [{ label, rows: [{ role, id, str, end }] }],
  ground: [{ prog, str, end, who }],
  simnotes, prognotes, dutynotes, grndnotes: string,   // per-section notes
  npub?: string[]                           // the section notes made public ('pn' 'dtn' 'sn' 'gn'), absent = none —
                                           //   D1588: saved with the note and shared; rides the issued copy (D1592)
  secOrder?: string[]                       // section display order, absent = canonical
}
```

**Every entry of `pax[]` and `more[]` is text — a seat skipped is `''`, never a hole or `null`** (`engine/slots.ts setSlotVal` pads; `[OIL-READ-LEFTOVERS]` 2, `[DB-READINESS]` phase 7 — pin `ui/simspare.test.tsx`).
`p` / `w` / `who` / `id` / `pax[]` are PEOPLE ids. Rows also carry flags the
engine sets as the day is worked: `cx` (cancelled) with `cxr` (the cancel
reason, from the cancel-reasons list), `info` (info-only), and on a
standalone crew row `spare` with its `role` label (`MAIN` / `SPARE`,
`src/engine/waves.ts:40`, `src/engine/wavetpl.ts:190`). Two things that
look like row fields are **not**: the engine's `spareAcs` is rebuilt from
the `spare` rows on every validate (`src/engine/events.ts:343-388`) and
never stored, and the late mark is derived from the input's `mod` plus a
session-only forgiven set (`LATEOFF`, `src/state/view.ts:139`) — nothing on
a row records it. Sections are addressed by **slot keys** of the form
`d:<day>.<section>.<index>…` — positional, which is one of the loose spots
noted at the end.

**Fields written only after boot** — absent from the seed literals, so a
seed-walking check never sees them; each with its writer:

| Where | Field | Writer |
|---|---|---|
| wave | `standalone`, `kind` (`sc \| avalon \| bb`), `noconf` | `makeStandalone` (`src/engine/waves.ts`), the + Wave picker (`src/ui/board.ts`), a placed template (`src/engine/wavetpl.ts`) |
| formation | `shift` | `makeStandalone` (`src/engine/waves.ts:51`), a standby template (`src/engine/wavetpl.ts:225`) |
| formation | `rl` (the formation's own rally, 'HH:MM' or absent — D1026, 19 Oct 26; every line's — a standby wave's too since D1036, 19 Oct 26) | the R box on Edit Schedule's week (`src/ui/html.ts`) and the board (`src/ui/board.ts`) through the `ff:…rl` text key (`src/engine/slots.ts`, a time box like `br`); read by `src/engine/reporting.ts resolveReporting` as a formation-specific rally, and on an SC line by `scReport` beside its in-time box (D1041); on any standby line a typed `rl` or `br` flies the whole shift ([STANDBY-FLIES], D1044, D1045 — `src/engine/waves.ts saFlies`) |
| formation | `br` (typed SC in-time) | the board's B box (`src/ui/board.ts`) through the `ff:…br` text key (`src/engine/slots.ts`) |
| formation | `area`, `atime` (the typed-over area strip) | `src/ui/textedit.ts:184`, `:194` |
| seat pair | `spare`, `role` | `saCrewRow` (`src/engine/waves.ts:40`), a standby template (`src/engine/wavetpl.ts:190`), the MAIN/SPARE badge flip |
| seat pair | `fly` (`true` or absent — a standby row ticked "Flies" by hand, [STANDBY-FLIES], D1061, 19 Oct 26) | the Scheduler Board's Flies chip (`src/ui/interactions.ts`, `data-safly`); read by `src/engine/waves.ts saFlies`; dropped by a day template (`src/engine/daytpl.ts`); in the row's amendment key (`src/engine/restore.ts`) only when set |
| duty block | `sa` (which standalone wave the desk serves), `noconf` | `waveDutyBlock` (`src/engine/waves.ts:96`), `blockFromTpl` (`src/engine/dutytpl.ts:184`) |
| ground row | `rmks`, `src` (the landed input's content key) | `acceptInput` (`src/engine/slots.ts:367`) |
| ground row | `srcv` (a short hash of what the row was last made or re-made from — its request's six fields *[since the one-rule build, 12 Oct 26: and EVERYONE on it and the input's marks — `cx` with its reason, `flag`, `info` — under a build mark, so every row made before the build is re-made once at its first read; `overlay.ts srcvOf`]*), `kept` (a row a loaded version or a switched-in plan brought back although its request is gone or cannot stand on the day — D363); neither canonical ([DB-READINESS] group A phase 6 (c), 1 Oct 26) | `acceptInput`, the read-time view (`src/engine/overlay.ts viewOfWeek`), a whole-day replacement (`src/engine/drafts.ts markKept`) |
| ground row | `who`, `more`, `cx` / `cxr`, `flag`, `info` **on a row that came from an input** — a COPY of the input's people (the first to join in `who`, the rest in `more`, in the order they joined) and of its marks, written whole by the request wherever it makes or re-makes its row and only where set; never the row's own (the one-rule build, 12 Oct 26 — D755, D760). On a scheduler's own row they are the row's, as before | `src/engine/overlay.ts requestRowFields`; a person is put on or taken off through `src/ui/reqdoor.ts` (the input is changed), a mark through `reqdoor.ts rowMark` |
| ground row | `srcg` — **NOT WRITTEN ANY MORE (the one-rule build, 12 Oct 26 — D756): an input is one row; a stored row's `srcg` is ignored and dropped at its next re-make, and `src/engine/inputentry.ts` is removed.** *As it was:* for a row from a record of a SHARED input only: its entry's own identity, the group's id and a short hash of every shared field (`src/engine/inputentry.ts entryIdOf`); rows of one day carrying the same one, with the scheduler's marks alike, are drawn as ONE row (`src/engine/grouprows.ts`). Absent on an ordinary request's row; not canonical — no unit of a published day's comparison, no sign-off binding (`[GROUP-INPUT-ONE-ROW]`, D661, 11 Oct 26). A grouped record's `srcv` carries it too, so its row is re-made when any shared field moves | the request, wherever it makes or re-makes its row (`src/engine/overlay.ts requestRowFields`); stripped from a day template |
| day | `gman` (ground list frozen to hand order) | a ground-row drag / Sort (`src/engine/reorder.ts:237`, `:425`) |

### The publish book — `SCHED`, `src/engine/publish.ts`

Everything about a week's publication state, keyed by day index 0..6.

| Field | Shape | Meaning |
|---|---|---|
| `al` | number | amendment counter |
| `pending` | `{ key: 1 }` | edits made since the last publish |
| `changes` | `{ key: alNumber }` | **issued** keys → the AL number that issued them (written by `src/engine/publish.ts:publishAL`); a key edited again is deleted from here as it goes pending (`publish.ts:markEdit`) |
| `added` | `{ key: 1 }` | structural adds (a new line/wave/row) |
| `als` | `[{ n, keys[], sign, days[], n0, adds, structAdds, snap }]` | every published amendment (AL), newest last; `sign` here is the four **callsigns** frozen at issue, `snap` the covered days as issued |
| `dayOK` | `{ di: 1 }` | which days are **published — approval is per day, not per week** |
| `sign` | `{ di: { cur, sked, plan, appr } }` | the four sign-off slots per day; each value is a **PEOPLE id** when signed (the picker's options are ids, `src/ui/html.ts`, written by `src/engine/publish.ts:setSign` from the Shell's sign-picker handler) and `''` when unsigned |
| `orig` | `{ di: snapshot }` | the day as first published |
| `cur` | `{ di: 'orig' \| n }` | which version each day currently shows |
| `drafts`, `curDraft` | `{ di: [{id,name,d,sign?,signBind?}] }`, `{ di }` | per-day alternate plans and which is live; each blob carries its OWN sign-offs + AM-06 bindings since 15 Sep 26 (item 1a) |

Synthetic keys ride the same book: `del:<day>.<n>.<kind>` (a deletion),
`mov:…` (a move), `inp:<day>.<token>` (an input filing).

**A snapshot** (`SCHED.orig[di]`, `SCHED.als[].snap`) — the day as issued: `d` (the day, with its OIL evidence `d.oilev`),
`c` (its marks), `fil` (each covering input's filing state) and, since 26 Sep 26 (`[LEAVE-LATE-PUBLISHED]`, D177–D179),
`inp` (a full copy of every input covering the day — the issued face reads these, never the live records), `w` (the day's
slice of the official warnings as it went out: `byDay`, `sev`, `chip`, `dash`, and `cs` the callsigns its warnings were
worded with — only the warnings that freeze and the marks THEY raise; what stays live is not kept: the next-day crew-rest
mark, a crew-rest breach, the 7-day run, a lapsed qualification and the OIL warnings, `validate.ts LIVE_ON_FACE`, D183–D185),
`pa` (the men on the day as the roster drew them — CAT, seat, posting — every man in a person slot of its content, behind
its placeholder pucks, or of its inputs), `rv` (the Logic settings the day was published under — since D2005, 12 Nov 26,
every setting its checks read, `engine/faceattrs.ts KEPT_RULE_KEYS` — the assumed flight length `fltLen` among them since
D2046, 16 Nov 26, absent on an older version — plus `shiftHard`, the SC MAIN clash table; before
it, only the rule value it prints, a blank brief's lead) and `ros` (the aircrew roster at issue, for the day panel's "free
all day"). The face, the CSV and the print draw `pa` and `rv.briefLead` (`engine/faceattrs.ts`); the validator judges the
published day by `rv` (`faceattrs.ts withDayRules`, D2005); the pending comparison measures today's `pa` against them, and
only `rv.briefLead` where a flying line prints a suggested brief (D186) — a change of any other setting reads nothing
pending; `ros` is drawn, never compared. A retired issuance keeps all of them (`publish.ts retireIssued`). Size: a copy of
a day's few inputs and its warning list per version — measured in the evidence sheet. Declared in `src/engine/schema.ts`
`DaySnapshot` / `WarnSlice`.
**The hides a version went out with (`[WARN-HIDE-KEPT]`, D469 / D471, 1 Oct 26)** ride inside `w`: `w.wo` — the keys of
the day's warnings hidden as it was issued (only those that match a warning; absent when nothing was hidden); `w.shown`
— the rings, chips and dashes of the warnings that freeze AS SHOWN then (kept only beside `wo`); and in `w.face` a hidden
warning carries `off: true`. `w.byDay` / `sev` / `chip` / `dash` stay as the rules raised them — they are the pending
comparison's basis, and a hide is its own comparison (the working copy's `wo` against the version's `w.wo`, one pending
change per warning that differs — `publish.ts hidePending`). An amendment's stored item counts (`ukinds`) gain `hide`, and its stored `diff` carries one `kind:'hide'` entry per warning hidden or flagged again (`addr: hide:<di>.<fingerprint of its key>`, `from` / `to` the plain `shown` / `hidden` — `engine/schema.ts AlDiffEntry`; pinned by `engine/schema.test.ts`, an amendment issued with a hide and conformed).

### The week record — `weekStashSnap()` / the week stash

Two snapshots share one field list (`schedFields()`, `src/state/history.ts` — **16 fields**, `rt` and `cr` with
[GLOBAL-UNDO]), and only one of them is kept — **in memory as one record, in storage as ROWS** (below).

**The week record** is `weekStashSnap()` (`src/state/store.ts:weekStashSnap`) —
what the stash holds for every visited week, and what `raptor:weeks/<week>` held as one record until 30 Sep 26:

**CORRECTED 17 Sep 26 — the old example listed ELEVEN SCHED fields and mislabelled `un`.**
Three fields were missing: `sb` (signature BINDINGS), `v` (`ridV`) and `am` (`amV`, the
amendment-format stamp). That matters beyond tidiness: `engine/publish.ts` classifies a
published book with no `amV` as UNSUPPORTED and read-only-quarantines the week, so a
serializer built from the old list would freeze every week it wrote, and every signature
binding would be lost (a signature is content-valid only while its binding still matches).

```
{ d: DAYS,                                  // the seven day objects
  c, p, ad, a, al, ok, sg, sb, o, cv, dr, cd, v, am, rt, cr,   // the SIXTEEN SCHED fields,
                                            //   short names, from schedFields()
  wo: string[] }                            // the warnings hidden on the WORKING copy (view.WARNOFF) — kept with the day
                                            //   for everyone until someone flags one again (D469, 1 Oct 26; built by
                                            //   `[WARN-HIDE-KEPT]`: read back at boot and week load, kept through a sign-in).
                                            //   Each is a key — `<di>|<rule>|<person ids>|<the words, callsigns folded to @id>`
                                            //   (engine/warnhide.ts hideKey) — filed in its day's row by that leading day.
                                            //   A key whose warning is no longer raised stays, inert (it is live again if
                                            //   the same situation returns) — not an error in the row.
```
*(`un` — the stable ids of the requests a scheduler took off on this week — left the record 30 Sep 26: it is read from
each request's own `acc: 'r'` mark, `store.ts takenOff` — `[DB-READINESS]` group A, F3-02.)*

| short | `SCHED` field | what it is |
|---|---|---|
| `c` | `changes` | issued key → the AL seq that issued it |
| `p` | `pending` | keys edited since the last issue (the TINT; not AL eligibility) |
| `ad` | `added` | outstanding draft structural-add identities |
| `a` | `als` | the AL records, one per issue, single-day |
| `al` | `al` | the week's AL bookkeeping |
| `ok` | `dayOK` | per-day published state |
| `sg` | `sign` | the four live sign-off slots per day |
| **`sb`** | **`signBind`** | **what each signature signed — digest, date, issued base id, plan revision. A signature is valid only while all four still match** — and, since 6 Oct 26 (`[OIL-WORK-START]`), `orv`: the three Logic values the day's OIL was worked out from when it was signed (`{ reportLead, debrief, oilFullMin }`, earning days only, else null); the signature falls while the day as it stands would write anyone's OIL record differently under those values than under today's |
| `o` | `orig` | the frozen Original per day |
| `cv` | `cur` | which version each day shows (a verId) |
| `dr` | `drafts` | the parked alternate plans per day |
| `cd` | `curDraft` | which plan the live day is |
| **`v`** | **`ridV`** | **row-id version stamp** |
| **`am`** | **`amV`** | **amendment-format stamp — a published book WITHOUT this reads as unsupported and is quarantined** |
| `rt` | `retired` | the withdrawn issuances (an Unpublish), keyed `<verId>~<n>`; each keeps its issued record whole as `rec` |
| `cr` | `correcting` | a day being corrected after an Unpublish: the version it may reissue under the same label |

It carries **no inputs and no planning layer** — those are global, and
their own records: since 30 Sep 26 (`[DB-READINESS]` group A, phase 2) ONE ROW EACH, written from the command
that changed them (`src/state/persist.ts` — the stream consumer; `persistAll` is gone):

| stored id | row | holds |
|---|---|---|
| `raptor:inputs/<iid>` | a request (`Input`) | the whole request — ONE row an input, whoever and however many are in it (since the one-rule build, 12 Oct 26: an input filed for several was a row a man) — with `ord` — its place in the list (`src/command/ord.ts`; the design's `sortIndex`) |
| `raptor:people/<pid>` | a person (`Person`) | the whole roster record, with `ord`; the two placeholder pucks (ALL `all`, ALL AVAIL `allavail`) are code and never stored |
| `raptor:plan/pp:<id>` | a planning note — its words, its people, or both (`PlanningPuck`; D684) | the entry, with `ord`; its id the app's opaque `newId('pp')` (a note saved before keeps its `pp<N>`) |
| `raptor:plan/dm:<iso>` | a day title (`DayRemark`) | the title string |

A list reads back in its order `(ord, id)` — ties between two people's rows break by id, the same on every device. A
first boot stores the seed's rows once, in the boot's one group; a row that will not read is left in storage as it is and
not read. A setting saved as `null` removes its key (it reads as never set).

**The undo snapshot** is `histSnap()` (`src/state/history.ts:histSnap`): the same
fields plus `i: INPUTS`, `pp: PLANPUCKS`, `dm: DAYRMK`. It is the undo
stack's unit only and is never stored.

The week stash (`src/engine/weekstash.ts`) keys week records by week-start
`'dd/mm/yyyy'` with a per-week change counter, and **it persists — as rows since 30 Sep 26** (`[DB-READINESS]` group A,
phase 1 — `src/state/weekrows.ts`, the design's `ScheduleWeek`, `ScheduleDay`, `Amendment`, `AmendmentRetraction`).
The week's id is its key with `/` replaced by `-`; its rows are

| stored id | row | holds |
|---|---|---|
| `raptor:weeks/13-07-2026` | the week row | the two format stamps `v`, `am` — nothing else |
| `raptor:weeks/13-07-2026#<di>` | a day row (0 = Monday … 6) | the day `d`; that day's slice of `c`, `p`, `ad` (the keys naming it); its `ok`, `sg`, `sb`, `cv`, `dr`, `cd`, `cr`; its muted warnings `wo`. A slice with nothing for the day is left out |
| `raptor:weeks/13-07-2026:is:<verId>~<n>` | an issuance | the issued record as it went out — the Original (`<iso>#0`) or an amendment; `n` = how many times that version had been withdrawn before it went out. Written ONCE: an Unpublish never touches it |
| `raptor:weeks/13-07-2026:rx:<verId>~<n>` | a retraction | an Unpublish of that issuance: `at`, `by`, `restoreSeq`, `logged` |

`al` and `un` are not stored. At boot every week's rows are joined back into one stash record
(`src/state/persist.ts:hydrate`); a week whose rows will not read, whose week row still carries a whole old week, or
that was published by an older build is kept byte-for-byte, loads read-only, and its rows are never rewritten.
**Written from the command stream, never by `persistAll`**: each command's changes to a week go out as exactly the rows
they touched, in its one saved group; a week's first save writes its week row and ONLY the days it changed (a day no
one has saved has no row and reads as the week untouched — the group-wide walk's finding H3, 30 Sep 26), and a week load's landing is saved only onto
days already saved; a pristine seed week is never written; a row is removed only by an explicit delete (an Undo of a publish or an
Unpublish). A week switch writes nothing of the week left, and NOTHING of the week arriving: its landing pass (the
`sched.load` command) is worked out again at every load, the boot's too (the group-A final read, Fable F2 and F1, 30 Sep 26: saving it wrote this browser's copy of rows another person may have changed, and made a member's browser the writer of days a member may not write — the plan's phase 6(c) direction, a landing worked out on read). This is what the persistence
table at the top calls "per-week stash — Yes".

### Planning layer — `src/state/plan.ts`

- `PLANPUCKS[]`: `{ id: 'pp'+n, date: 'yyyy-mm-dd', text?, ids?: personId[], kind? }` — a NOTE dropped on a calendar day; the day column is `date`. **One kind of record since 9 Oct 26 (owner D684, D695 — a note carries its own pucks):** `text` its words ('' or absent where it holds people alone), `ids` its people (PEOPLE ids; `''` a gap a removed man left — his place is held; trailing gaps are trimmed), either or both, never neither (`src/state/plan.ts` `addPlanPuck`, `togglePuckPerson`). `kind` is no longer written or read: a record saved before then may carry `'pucks'` (the old pucks row — people, no words) or nothing (a note of words), and both load as notes
- `DAYRMK`: `{ 'yyyy-mm-dd': title }` — the day's free-text title

### Attachments — `src/state/docs.ts`

`docBackend.impl`: a map `id → { name, mime, size, blob }` — the synchronous
read path the viewer needs in render. Behind it (since 8 Sep 26) a durable
per-browser drawer: **IndexedDB** `raptor-docs` (`src/storage/docstore.ts`),
wired by `docBoot` from `main.tsx` on the built site only (dev/tests/`?fresh`
stay memory-only). `docAdd` writes through to it; `docBoot` fills the cache
back at boot. Ids are random (`state/docs.ts newDocId` — `doc-<uuid>`), so two minters cannot collide; an older
`doc<N>` id still resolves. *(Corrected 1 Oct 26, `[STORE-READER-SWEEP]`: this said the boot advances an id counter.)* Its OWN drawer, deliberately NOT the
~5 MB text seam a couple of photos would overflow. Accepts photos (`image/*`)
and PDFs, capped at **8 MB** each. Append-only (undo can resurrect the input
that owned one). Input records carry only the id, never the bytes. Fail-soft:
a drawer that will not open (private mode) leaves the store memory-only.
Migration seam: a browser that persisted INPUTS before the drawer existed
holds `docId`s whose blobs were never saved — read honestly as "no document
on file" (never fabricated) until the data is cleared.

### Edit log — `ELOG.rows`, `src/engine/editlog.ts`

`{ seq, t, who, pid, di, date, end?, wdate?, wend?, iid?, sect?, key, lbl, from, to }` — the line's number (only rises,
kept across a reload), wall-clock, display name (from `HOOKS.whoami()` — the signed-in CALLSIGN since `[ACCOUNTS]`, 26 Sep
26), the person behind it (`HOOKS.whoamiId()`, so a rename moves nothing), the day index of the week loaded when it was
written, its CALENDAR day (ISO — the week it belongs to) and, for an absence, the span after (`date`–`end`) and before
(`wdate`–`wend`), the input it is about, the part of the day a line with no key belongs to, for a Quals line the person it
is about and which of his details (`sub`, `fld` — by id, so a rename never loses it; Astra's final read), for an absence
line the person too (`sub`) and — for one record of an input filed for several people — that filing's group id (`grp`, the
record's own `Input.grp`; 8 Oct 26, D663: the changes window files the men of one filing under one item *[since the one-rule build, 12 Oct 26: `grp` is not written on a new line — an input of several is one record and its own lines are one each, under its first person; a line for ONE person put in or taken out carries `one` and that person in `sub`; the hand-over line of an input of one — its only person replaced — carries `fld: 'whose'` with the NEW person in `sub` (13 Oct 26, `[HIST-DOT-INPUT-ROW]`: History tells it on his puck); stored lines that carry `grp` still group, read only]*), every input a war decision is about when more than one (`iids` — a moved day is re-filed as a
new record), and its exact days when they are not one run (`days`, `wdays` — a gap day stays untouched), the slot key, a frozen label
of what it was, before and after (a person key keeps the person's ID — `elogVal` says his live callsign). **Durable since
`[DRAFT-PENDING]` (28 Sep 26, D336 (b)):** loaded at boot, kept across sign-in and sign-out, never a command record (undo
never rewinds it). **One row per line since 30 Sep 26 (`[DB-READINESS]` group A, phase 4.3):** `settings/elog:<lineId>` =
the line without its in-memory `seq`, written the moment the line is kept — inside the command that made it, in its saved
group and its change-log batch (a line given just BEFORE its command opens — the board's in-place edits, a text box — is held and kept inside that
command's group, the group-wide walk's finding H2, 30 Sep 26; a line no command claims by the end of the turn goes
through a command of its own, `elog.line`; the Admin
→ Data sweep is one command, `elog.sweep`, deleting exact lines). `lineId` (`<page>.<n>`, rising within a page life) is
the line's identity; the history's order is `(t, lineId)` on every client, and `seq` is only a line's place in the list
loaded now. Capped at 2,000 lines — the oldest line's row deleted in the same group that adds the newest; a boot loads the
newest 2,000 in order; a row that will not read, or lacks its time, is left in storage and not read. The old whole record
(`elog = { v, next, rows }`) is converted by the fold (`src/state/settingsrows.ts elogConverter`), never read.
**Each person's "seen"** is `settings/seen:<pid>` = `{ units: { <unit>: { upto: { at, lineId } | null, extra: lineId[] } } }`
— one cursor for each squadron's history, since each history is loaded alone (the fix read of multi-squadron batch 1's
full check, 18 Nov 26 — Astra 6: one cursor folded over 142's lines read an older 149 line seen); a row in the old shape,
`{ upto, extra }` at its top (was one `changeseen` record for everyone), reads as every squadron's until that squadron
is marked: positions in that order, written only by `state/changes.ts` through `changes.seen`, his OWN row only
(`perms.ts ownershipViolation`) — data-model §11 `EditLogSeen`.

### The bell's notices — `NOTICES[]`, `src/state/notices.ts` (the one-rule build's step 7, 12 Oct 26 — D755 (3), D760, D769)

"Someone else changed an input you are in." One record a person told:
`{ id, to, by, at, iid, name, day, what }` — `to` the person told (a PEOPLE id); `by` who made the change (a PEOPLE id),
or `null` where the app did (a posting run on its date, a delete); `at` when (ms); `iid` the input; `name` what the input
was called then (its title, else its kind) and `day` its first day then (yyyy-mm-dd) — kept on the notice because the
input may since have been renamed, moved or deleted; `what` what happened, as a list of parts (data, never a
sentence): `{k:'in'}` he was put in · `{k:'out'}` he was taken out · `{k:'del'}` deleted · `{k:'cx', why?}` cancelled ·
`{k:'uncx'}` brought back · `{k:'off'}` / `{k:'on'}` taken off the programme / put back · `{k:'unav'}` / `{k:'unavoff'}` filed under Unavailable / taken out of it (D815) · `{k:'when', a?, b?, t?}` its
day(s) and hours as they are now · `{k:'add', who}` / `{k:'rem', who}` others (ids, a placeholder among them) put in or
taken out · `{k:'kind', was, now}` its kind changed (24 Nov 26, his D2521: "LL changed to OL") · `{k:'title', was}` renamed — its title's own words, or an Attach's "To" · `{k:'rmk'}` its remark changed. (A `when` part for a half day carries `h` — 'AM' or 'PM' — in place of its clock times `t`, and `c`, its kind, where its bold name is its kind (D2521). A line saved before keeps `t` and its `title` part, and reads as it always did.)
*(19 Nov 26, fix read 6, fault C — his D2223, D2218: an input's line to someone told ONLY as its filer — named in it
neither before nor after — also carries `fu`, the squadrons that judgement read (each named man's home on each of the
input's days — since fix read 7, fault Q, his D2225 — or the input's own squadron where it names nobody —
`state/notices.ts filerUnits`), only those he was told through (`filerVia`: his home while he has not moved since the
input was filed, a right he holds, or — once moved — his home today where he is its admin, his D2228, 20 Nov 26, fix
read 13, item C); absent on a named man's line. His move retires such
a line by `fu` alone, on his move day (`noticeLeftBell`), never by the input as it stands later. Lines stored before
carry none: demo data, D56.)*
*(22 Nov 26, batch 1's second half, plan §7 items 1–2 — D2198, D2202: EVERY LINE CARRIES ITS SQUADRON, `u` — an input's
line its input's (`engine/inputs.ts inputUnitOf`), a war line its war's, a posting's and its take-back's the posting's, a
holiday's the holiday's (beside its part's `u`); the worked-out lines (bidding ended, "off the manpower") carry theirs
too. Read by the bell's switch, its grey mark and its tap; a line stored before has none and reads as its reader's
home (`state/notices.ts lineUnit` — D56). A squadron's admin lines (posting, take-back, holiday) go to ONE audience,
`state/accounts.ts adminLineAudience`: its admins and Plan holders, and every master admin who can sign in.)*
*(13 Oct 26, `[OIL-ASK-NOTIFY]`: a second kind rides the same record — a day made a holiday, `iid` empty and `what` =
`[{ k: 'oilhol', a, b, u? }]` (`name` is the holiday's own name, '' where it has none; `a`..`b` the whole holiday as it stood when the notice was made — what the bell shows is read live from the war, never from these; `u` — since the multi-squadron reshape, 21 Nov 26, the Plan audit's PB4 with the blind read's R3 and R4 — the squadron the line was written for, each squadron owning its own holiday list, D2195: its count of inputs still to answer, its dates and name, the list a tap opens, and which lines it replaces are that squadron's, whoever reads it — at home, by Plan, or a master admin; a line stored before `u` reads as its reader's home squadron today, D56 — `notices.ts holOf`), one a scheduler, written inside the Leave War's own command through the scheduler store;
`state/notices.ts noticeHoliday`. Nothing else about how a notice is stored changes.)*
*(27 Oct 26, the Leave War overhaul's M4 — D1142, D1214, D1216, D1422: the WAR'S OWN LINES ride the same record, `iid` empty, `name` "Your leave" or "Leave War", `day` the first day: `{ k: 'lw', c, a, b, d, to?, tb?, again? }` a decision on his leave — `c` the kind as stored (LL, \*LL), `a`..`b` its days, `d` what was done (`approved`, `refused`, `repend`, `putback`, `moved`, `deleted`, `added`, `bidmoved`, `biddel`), `to`..`tb` where a move took it, `again` a Redo after a "taken back" line · `{ k: 'lwopen', a, b, open }` bidding opened or closed on a stretch (`end: true` — closed because its last date passed: never stored, each person's bell works it out from the periods, `state/notices.ts setDerivedNotices`, id `lwend:<war>:<from>:<to>`) · `{ k: 'lwback', c?, a, b, d, ref }` a line the admin's Undo took back after the member had read it, `ref` the line it was. Written inside the war's own command (`leavewar/state/store.ts tellDecisions` / `tellOpenings` → `leavewar/sync.ts tellWar` / `tellBidding`), and the "taken back" lines by the follow-up command `lw.notice` (`sync.ts warNoticesReversed`), never an Undo step. **And on an input's own line:** `{ k: 'rbid', c }` — this input replaced his pending Leave War bid of kind `c` (9.3a: "You were added · replaces your LL bid"), noted by the clash gate inside the same command (`notices.ts noteReplacedBid`).)*
*(5 Nov 26, `[POSTOUT-RUN-NOTICE]` — D1546, D1547, D1690, D1691: A POSTING OUT THAT RAN rides the same record, `iid` empty, `by` empty (a posting keeps no setter), `name` the man's callsign when it ran (shown by his callsign of today), `day` the posting's date: `{ k: 'po', who, o, acct? }` — `who` the man, `o` the outcome that ran (`overseas`, `delete`, `sans`), `acct: true` an archived man who held a sign-in ("archived, account suspended"). One an admin who can sign in, never the man himself, written inside the posting pass's own command (`leavewar/sync.ts runPoOutcomes`, the scheduler store enlisted — `state/notices.ts noticePosting`), kept as the record that it ran. **A posting with no outcome ("off the manpower") runs nothing, so its line is never stored:** each admin's bell works it out from the stored posting once its date has come, for fourteen days, id `po:<person>:<date>`, `o: 'none'` — following the posting as it stands, never saved (his D1696) (`leavewar/sync.ts postedLines`, through `setDerivedNotices`). A scheduler's line only: hidden in the admin's member view (`notices.ts noticeLive`). **Taken back (5 Nov 26, `[NOTICE-UNDO-RETRACT]` step 1 — D1693, D1699):** the posting sheet's "Undo post out" removes every admin's line about that posting inside its own command, and to each admin who had READ his (his `noticeseen` record) writes `{ k: 'poback', who, o, acct? }` — `by` the admin who pressed it (never to him), the same `name` and `day` — shown as the posting's words struck through, then "taken back · <who>". The war's own taken-back line `lwback` now also carries `to`, `tb` (where a move took the leave), so its struck words are the line's own. **A SANS man's line of planned days with nothing filed (23 Nov 26 — D2338) is worked out, never stored** (`leavewar/sansunfiled.ts`, id `sansdue:<person>:<posting date>[:n]`; a stored row of that kind is refused by the permissions check, and the bell reads only ISO dates from such a part — chat 147's code reads); **taken back with its posting after he read it** (D1693, D1699, D1710), it leaves one stored row to him, `{ k: 'sansback', days }` — `by` the admin who pressed it, `day` the posting's date, `name` "Your SANS availability" — shown as its days' words struck through, then "taken back · <who>".)*
*(22 Nov 26, batch 1's second half §7 item 6 — his D2251, D2309, D2319: HIS OWN ACCOUNT'S LINE rides the same record, `iid` empty, `to` the man himself (archived or suspended among them — read once he can sign in again; never a deleted man), `name` his callsign, `day` the day it took effect, no squadron stamp (`u`) of the line's own: `{ k: 'acct', c, u?, num?, why?, mv? }` — `c` what changed (`admin`, `member`, `off`, `on`, `view`, `viewEnd`, `plan`, `planEnd`, `master`, `masterEnd`), `u` and `num` the squadron it names and its number as written (an Undo of "+ New squadron" still says 150), `why` the app's own reason with no one's name (`moved` with `mv` the squadron he moved to, `archived`); `by` whoever made the change, none where the app did. Written INSIDE the command that changed his access (`state/acctlines.ts tellAccess`, the scheduler store enlisted by `engine/hooks.ts bellEnlist`), or, for a move, by the app's own `account.told` command on its day with the fixed id `acct:mv:<account>:<day>:<c>:<u>` (`writeMoveLines`). An Undo's opposite line carries `ref`, the step's line it answers (`acctFollowUps`).)*

*(22 Nov 26, batch 1's second half §7 item 7 — his D2214: A POSTING THAT COULD NOT RUN rides the same record, `iid` empty, `by` none (the app), `to` an admin of the man's squadron, `name` the man's callsign, `day` the posting's date, `u` his squadron: `{ k: 'pofail', who, o }`. Written only by the app's own `posting.failed` command after the posting's command was refused or held (not the last-admin lock), each line's id fixed — `pofail:<pid>@<posting date>:<outcome>:<admin>` (`state/notices.ts poFailedLineId`).)*
**Stored one row each, in a collection of their own:** `notices/<id>`, written from the command stream
(`state/persist.ts` — the `notices` mapper) and read back at boot. **Written INSIDE the command that changed the input**
(`state/sched-commit.ts tellPass`, at the scheduler store's one shared end): the records are that command's own, in its
saved group — so its Undo removes them and a Redo puts them back. Never rewritten once made. Wiped with the inputs on a
format change (`storage/reset.ts RESET`). **Kept for good in this build** — no line is pruned; how long a notice is
kept is the database step's retention rule (`OUTSTANDING.md` `[NOTICE-RETENTION]`).
*(24 Nov 26, his D2391, D2394: A MAN'S SANS CHANGE LINE rides the same record, `iid` empty, `name` 'Your SANS availability', `day` the posting's old date or the day of the untick: `{ k: 'sansback', days, hid?, how, to?, back?, over?, kept?, again?, ref?, ended? }` — `days` the reminder he had read; `hid` the filed days it hid; `how` what changed (`later`, `earlier`, `undone`, `other`, `untick`), `to` the new date; `back` an untick's "taken back"; `over` the unread lines of this kind it replaces (they stop showing, and return if its Undo takes it); `kept` — owed by a reminder one of those stood on; `again` a Redo's copy of the line its Undo took back, `ref` that line's id (a take-back carries `ref` too); a copy stands only while that line does, and in its place, the latest copy alone; `ended` — after the change he had no SANS day from today, the one kind of line that starts his reminder afresh (the four reads of 0eaacc411). A line with no `how` keeps its old words. The reminder itself (`sansdue`) stays worked out, never stored; its id names the days it says with each day's count below.)*

**What each person has READ** is `settings/noticeseen:<pid>` = `{ upto: <ms>, ids: <notice id>[] }` — the notices in
`ids` are read (one for a tap on a line, every one of his for "Mark all read"), over a floor: every notice made at or
before `upto` is read too. This build never moves `upto` (it stays 0 — it is for the database step's retention sweep);
read is by id because a Redo puts a notice back with its first time. Written only by `state/noticeseen.ts` through `notices.seen`,
his OWN row only (`perms.ts ownershipViolation`), never an Undo step — data-model §11 `NoticeSeen`.

### Accounts and session — `src/state/accounts.ts`, `src/state/auth.ts` (`[ACCOUNTS]`, 26 Sep 26 — D166, D204)

Durable settings rows below — one per account (`account:<id>`), per waiting request (`accessreq:<id>`), per admin's
seen requests (`reqseen:<accountId>`) since 30 Sep 26 (`[DB-READINESS]` group A phase 4.4) —
written ONLY by `state/accounts.ts` through its intent commands, each command writing EXACTLY the rows its own list edit
changed (never against storage, so a client that has not read another's new account cannot remove it); the session is
memory only (a reload lands on the sign-in, as always).
- **No account row at all** = the four seeded demo accounts, held in memory (as a missing record was); the first account
  write stores every account of the list it leaves. **Two account rows for one person** (two admins at once — the
  database's unique `personId` refuses the second, group B): the older (`createdAt`; a seeded one, with none, oldest)
  is kept on load, the other dropped with a logged line.
- `SESSION`: `{ user, role, pid, name }` — `user` the account id (or `principal:<name>` for someone signed in without
  access), `role` `'admin' | 'main' | 'pending' | 'off'` (`'guest'` went with the guest view — D2239; a session still carrying it
  is read as switched off, `perms.ts roleOf`), `pid` his person (null without access), `name` the
  sign-in name (it stands for the defence mail address)
- `ME`: the signed-in person's PEOPLE id — set only by `resetSession` from the account (the "View as" picker is gone)
- **No password is stored anywhere** (data-model §3): an added account takes any password; the two seeded sign-ins'
  passwords (`ad`, `us`) live in code only (`accounts.ts SEED_PASS`)
- (`ACCOUNTS` — the two hard-coded logins — and `USERS[]` — the old Manage-users list, which drove nothing — are gone)

### Settings and templates — the `sqn142_*` keys

Each key writes **`null` when the squadron is on the shipped standard**, so
a later change to the standard is picked up rather than frozen in a browser.

| Key | Value | Record |
|---|---|---|
| `daytpl` | `DayTpl[]` | `{ id, title, d: DayTplBlob, missionRoleSeeds? }` — whole saved day, minus dates/crew/row IDs; optional `{ format:1, seeds:[{ path:[wave,formation], context, side }] }` outside `d`, validated against conditional context v1; applying creates fresh annotation IDs in the same structure transaction (D529–D531) |
| `insights` | `{ trackBlueRedSorties:true }` or null | squadron Insights tracking; absent/malformed is Off; independently loaded, saved and undone; warning rules/search/reset/count/stamp do not consume it (D512, D524) |
| `missionrole:<encoded-id>` | `MissionRoleAnswer` | one guarded row: `{ format:1, contextVersion:1, weekKey, dayISO, formationRid, context, side:'blue'\|'red' }`; ID = URI-encoded JSON tuple `[1,weekKey,dayISO,formationRid,context]`. Week is a real Monday, day within it. Unsupported or mismatched records remain stored and inert. Mapper alone writes these rows; raw settings writes refuse. Existing schema wipe removes these rows and filters them from an unfinished reset journal, without a schema bump (D530) |
| `wavetpl` | `WaveTpl[]` | `{ id, title, kind: 'fly' \| 'sc' \| 'avalon' \| 'bb', lines: [{ cs, msn, to, ld, spare }] }` |
| `wavehide` | `string[]` | hidden wave-template ids |
| `wavedefault` | `string[]` | house wave order |
| `dutytpl` | `DutyTpl[]` | `{ id, title, wave: '' \| 'sc' \| 'avalon' \| 'bb', rows: [{ role, str, end }] }` |
| `cxreasons` | `string[]` | the cancel-reason list — **a stored empty list is a decision** (every reason removed in the editor) and reads back empty; a list whose every row is unusable falls back to the shipped set (`[STORE-READER-SWEEP]`, phase 7; the same for `stores` and `qualcols`) |
| `lookahead` | `{ w, s }` | weeks ahead, to-Sunday flag |
| `secdefault` | `string[]` | section order, from `notes, prog, waves, duty, sims, ground, inputs, avail, sans, unav` |
| `stores` | `[[key, label]]` | the stores list — a stored empty list stays empty after a reload (as `cxreasons`) |
| `qualcols` | `QualCol[]` | the LoX column list — `{ k, h, lav?, apt?, scq?, aar?, fcpOnly? }` in display order (saved since the 8 Sep 26 bug pass: the ticks under a column persist, so the column must too); a stored empty list — every column removed on the Quals page — stays empty after a reload (as `cxreasons`) **but for Management**: the built-in column `mgmt` (D1502, 29 Oct 26) cannot be removed, so every list read gains it after SXO (first where there is no SXO) and the writer puts it back — nothing written at load; its ticks are `p.quals.mgmt`, and the Leave War draws its group first once added |
| `account:<id>` | `Account` | one row per account (`[DB-READINESS]` group A phase 4.4 — it was one `accounts` list): `{ id, name, role: 'admin' \| 'main', pid, on, offBy?, seenFrom?, createdAt?, master?, masterFrom?, pidFrom?, adminOf?, adminFrom?, adminAt?, masterAt?, kept? }` — `adminAt`, `masterAt` (ms — batch 1's second half, plan §16 D1′, 22 Nov 26) the moments the home admin role and the master mark began, and `kept` (with the mark, §16 D1′a) each squadron he held Plan of when made a master admin, with that Plan's moment: read only by the bell (`state/notices.ts rightStart` — a squadron's admin line shows only where the right began no later than it; `state/bellsqn.ts bellDefault` — a kept squadron on by default), stamped by the one row writer (`state/accounts.ts stampMoments`), held by the gate (`state/perms.ts momentsViolation`); `seenFrom` (`[DRAFT-PENDING]`, Fable F6): where the change history stood when the account was made, a POSITION `{ at, lineId }` (phase 4.3), so someone given access later starts with nothing new; `createdAt` (ms) — the older of two accounts for one person wins; `name` the sign-in name (lower-case, unique; stands for the defence mail address), `pid` the person (one account each), `on` false = **suspended** (D285); `offBy: 'po'` only when an "Overseas Sqn" posting suspended it on its date (what "he's back" enables — any hand Suspend / Enable drops it); `master: true` — the master mark (multi-squadron batch 1, step 1, D2191): a master is admin of every unit and the only one who makes a unit or another master; it changes only by its own command `account.master`, by a master, never on his own account, one master always left — the commit gate refuses it in any other command; absent on every other account (the demo's master is Saber, `acad`); `masterFrom` (fix read 7, fault P, 19 Nov 26) the day the mark was set, written with it and gone with it — read only by the bell's move-day test (`state/notices.ts adminThen`), so a mark set after a man's move, or on the move's own day (a move day counts only a mark held before that day began — fix read 8, fault D), never brings back a line his move retired; absent on a mark set before it (counts from always, D56); `pidFrom` (fix read 10, fault D, 20 Nov 26) the day the account was last linked to another person, written by a re-link and read only by the same move-day test, so an admin's right counts from the later of its own day and the re-link; absent on an account never re-linked. An account is removed only with its person, by a delete (D287, `[POST-OUT-OUTCOMES]`). **No password.** No row at all = the four seeded demo accounts (`[ACCOUNTS]`, D166) |
| `accessreq:<id>` | `AccessRequest` | one row per waiting request (was one `accessreqs` list): `{ id, name, cs, ini, seat, cat, at }` — who asked (the signed-in principal, from the session); what he typed, text only — the displayed callsign/name (≤ 14), initials (may be blank), `seat` `FCP`/`RCP`/`GND`, `cat` (`''` for personnel) — never a link to a puck; when. (D204; `[ACCOUNTS-NEW-PERSON]` D214, D216, D227 — the typed name field gave way to the initials, D219). Who has had it on screen is no longer on it: |
| `reqseen:<accountId>` | `{ userId, seenRequestIds }` | each admin's own row of the requests he has had on screen — his bell (D216, D227); written only by `access.seen`, his own row; removed with his account (data-model `AccessRequestSeen`, R3-04) |
| `seen:<pid>` | `{ units: { <unit>: { upto, extra } } }` | each person's own "seen" for the change history, one cursor a squadron — §The change history above (was one `changeseen` record, then one `{ upto, extra }` for every squadron) |
| `noticeseen:<pid>` | `{ upto, ids }` | each person's own record of which of his bell's notices he has read — §The bell's notices above; **his SANS reminder's id names the days it held (`sansdue:<pid>[:<n>]~<iso>,<iso>…`), and his reads of it are never dropped, folded to one id a reminder naming every day he has seen in it** — the reminder lights again only for a day not among them (D2560; `state/noticeseen.ts keepReminders`, `reminderDays`, `leavewar/sansunfiled.ts readOf`); a record an older build saved with a mark after each day (`<iso>.<stamp>`) reads as its days; an ADMIN reads every person's (M4 9.3 — his Undo of a war decision asks whether its line was read) |
| `<unit>@apprseen:<pid>` | `{ at }` | when this ADMIN last opened that squadron's Leave War Approvals (ms) — what its "New" choice and cyan dots count from (the overhaul's M4, 8.4 — D1231); one row per person PER SQUADRON, a unit's row (batch 1's second half §3 item 7, R2, §15 D14 — it was one community row `apprseen:<pid>` for every squadron, so opening 142's Approvals took "New" off 149's; a row an older build stored under the plain name is read by nothing, D56); written when he OPENS the tab (a reload or a dropped page keeps it) for the war the page shows (`leavewar/state/store.ts worldUnit`), by `lw.apprseen`, his own row only — the gate's 7e reads the name with the squadron split off — never an Undo step (`state/apprseen.ts`; data-model `LeaveApprovalsSeen`) |
| `lwseen:<pid>` | `{ at }` | when this PERSON last opened his OWN person window on the Leave War (ms, the moment, not the day) — a line of his leave someone else changed since then wears the cyan dot (the overhaul's M5a, D1231, D1481); written when he opens it (an admin too, on his own window), by `lw.seen`, his own pid only — the gate allows `lwseen:<pid>` only for the signed-in person and only under `lw.seen`; never an Undo step; the previous moment is what "new" counts from for that visit and is kept across a reload (`state/lwseen.ts`; data-model `LeaveSeen`) |
| `bellsqn:<pid>` | `{ <unit id>: boolean, … }` | which squadrons' lines this PERSON's bell shows — "Show 142 149" (batch 1's second half §7 item 3, 22 Nov 26 — D2198, D2202): only his own choices; a squadron he never switched takes the default (his home on, a Plan squadron on, a master admin's other squadrons off — those he held Plan of when made one, kept on his account, on). Read in `state/notices.ts noticeLive`, never of a line about him; a line switched off is kept, not listed, counted or marked read. Written by `bell.squadrons`, his own pid only, for every role; its keys squadrons of the store, its values on / off, never removed; never an Undo step (`state/bellsqn.ts`; data-model `BellSquadrons`) |
| `sansplan:<pid>:<iso>` | — (no longer a record) | was a stamp of when a SANS man was last newly put on the programme on that date, which lit his bell's SANS reminder again (D2394 2a; chat 156). **Removed — his D2560, 24 Nov 26:** the reminder, once read, lights again only for a day not in it when he read it, and that is read from his own read record (`noticeseen:<pid>`, below — the reminder's id names its days), so nothing is stored for it: no command writes this row (`sans.planned` is gone), it is no settings row kind (`state/people-settings-commit.ts SETTINGS_ROW_PREFIXES`, `storage/keyowner.ts`), the gate has no check of it (`state/perms.ts`), and a row an older build stored is left where it lies and read by nothing (D56) |
| `guestview` | — (no longer a record) | was the admin's switch letting people waiting for access read the published week as a guest (D204). **Removed with the guest view — D2239, 20 Nov 26:** no command writes it (`guestview.set` has no row at the gate, so it is refused), it is no settings key (`state/people-settings-commit.ts SETTINGS_KEYS`, `storage/keyowner.ts`), and a value an older build stored is left where it lies and read by nothing (D56) |
| `memberfile` | `false` or null | the members' switch — "members may file duties and commitments for other people" (owner D654, D655): ON (null) by default, `false` = admins only. Written only by the admin command `settings.memberfile` (`src/state/memberfile.ts`); a raw write is refused. Read live by `src/state/perms.ts membersFileOn`. Switched off, nothing already filed is removed or altered — a member's right over what he had filed for others simply goes |
| `rules` | `{ v: { numericRule?: number, reportText?: string }, s: { kind: boolean } }` | overrides only: `v` for thresholds off the standard (`briefLead, dur, step, dekit, minTurn, tightTurn, crewRest, debrief, reportLead, longDay, epBrief, simDebrief, amtDebrief, openEnd, maxRun, inputLead, scDayFrom, scDayTo, simLen, fltLen, oilFullMin` (`fltLen`, the assumed flight length — D2046, 16 Nov 26) — and, since 7 Oct 26 (D628, D639), the two late cut-offs' seven: `inputCutMode, inputCutWd, inputCutWeeks, sansLead, sansCutMode, sansCutWd, sansCutWeeks` — a mode (0 days / 1 weekday), a weekday (0 = Monday … 6), a number of weeks (1–8), a number of days (0–60)), plus D511 text `reportText` (default `IN TIME + WX/NOTAMS`, trim/CR-LF-to-space, max60, empty falls back); `s` for which kinds hard-clash a shift (`fly, sim, duty, shift, ground, prog`). Numeric keys remain numbers; text travels with the same rules record/reset/snapshot/export/Undo |
| `sanscalendar`, `flyday:<ISO>`, `flyrule:<id>`, `flyrun:<ISO>` | see below | the SANS calendar's three day colours and the flying plan's three kinds of row — a date's class and required figures, a weekday's rule, a running figure (`src/state/flyplan.ts`): §The flying plan and the SANS calendar's colours, at the foot of this file |

---

### Units, places, homes and rights — `src/state/units.ts`, `src/state/units-model.ts` (multi-squadron batch 1, step 1, 17 Nov 26)

Durable settings rows, one per thing, written ONLY by their typed commands (`unit.add`, `unit.place`, `place.set`,
`grant.set`, `grant.remove`, `home.set`; a person's first home also inside `person.add`, `account.addNew` and
`access.approveNew`) and refused as a raw write, as the flying plan's are. Ids are a letter and base 36 — never a
hyphen, a tilde or a dot. Nothing on screen reads them yet; step 2 puts the unit into the schedule's identity.

| Key | Fields | Notes |
|---|---|---|
| `unit:<id>` | `{ id, num, kind: 'sqn', parent? }` | a squadron; `id` `u` + base 36 (`u142`), `num` what a person reads (letters and digits, at most 12, one unit per number); `parent` for a detachment (batch 2). Made only by a master |
| `place:<id>` | `{ id, name, tz }` | where a unit is; `tz` a time zone the browser knows (`Intl`). The GMT label ("GMT+8") is worked out for each date (`gmtLabel(tz, iso)`), never stored |
| `unitplace:<id>` | `{ id, unit, place, from }` | a unit at a place from a date: a move adds a row from the NEXT day (D2119), the history kept; before a unit's first row, that first row holds |
| `grant:<id>` | `{ id, account, unit, level: 'admin' \| 'view', from?, first?, fromAt? }` | `fromAt` (ms — batch 1's second half, plan §16 D1′, 22 Nov 26) the moment it became Plan, none on a View row: the bell shows a squadron's admin line only where its reader's right there began no later than it (`state/notices.ts rightStart`); a right in a unit that is NOT the account's home — never "member" of another squadron (D2094); one per account and unit; `from` (fix read 7, fault P, 19 Nov 26) the day it was given (rewritten when a grant is replaced) — read only by the bell's move-day test (`state/notices.ts adminThen`), so a right given after a man's move, or on the move's own day (a move day counts only a right held before that day began — fix read 8, fault D), never brings back a line his move retired; absent on a grant saved before it (counts from always, D56); the gate's levels never read it |
| `home:<id>` | `{ id, pid, unit, from }` | a person's home unit from a date: written in the command that makes him (the adder's own unit by default, D2094); a change counts from the next day; before his first row, that first row holds |

**One answer for a level, no fact stored twice:** an account's level in a unit is its own `role` in its HOME unit
(`admin`, or `member` for `main`), its grant's level elsewhere, `admin` everywhere for a master, otherwise none
(`state/accounts.ts levelIn`). **Seeds, as the accounts:** no stored row means the seeded one, held in memory and never
written at load; a stored row of the same id wins. The demo seeds `u142` and `u149` at `p1` "Home base"
(`Australia/Perth`), both from 2000-01-01; on the demo a person with no home row is at `u142`, on a shared store
nowhere — a shared store's first boot makes its first unit (142 at Home base on Perth time unless the bootstrap setting
names another, `unit: { num, place, tz }`), its place, the unit's place, the first admin's home and his master mark, in
the boot's one group (`src/boot.ts`). **Who writes them** is the commit gate's (`state/perms.ts` unitRowViolation):
a unit a master's; a unit's place, a right and a home an admin OF the unit the row names, before and after, judged on the
rows as they stood before the command.

## World 2 — Leave War

Fully typed (TypeScript interfaces), so these shapes are exact. Dates here
are ISO `'yyyy-mm-dd'` throughout.

### Keys (`raptor:leavewar/*` on the built site; legacy `leavewar:*`)

**ONE ROW PER RECORD since 30 Sep 26 (`[DB-READINESS]` group A, phase 3 — `src/leavewar/state/rows.ts`).** Each row is written
FROM THE COMMAND that changed it — the war's store subscribes to the command stream and writes, through its own
door (`state/storage.ts`), exactly the rows each command's changes land in, inside that command's one saved group; a
row is removed only for a record that command removed. The first boot stores the seed's world as rows (and the demo
world replaces it, inside the boot's group); the one-time fold (`store.ts leavewarConverter`) converts an old store.
**One more writer, for another squadron's war (A3, 19 Nov 26 — `src/leavewar/state/foreign.ts`):** the master's Archive,
Restore, Restore as and Delete on Admin → Users of a man whose squadron's war is not the one loaded write that
squadron's own rows through its own door — his `profile:<pid>` (the window; the label kept as stored), his `rec:` rows
and his `ledger:` rows (a delete's records and OIL awards from the cutoff) — from the command's `lwx.profile` /
`lwx.rec` / `lwx.ledger` changes. The same keys and values; nothing new is stored. A squadron whose war has never been
opened keeps such a profile row: its first open takes the seed's periods and keeps the stored windows and labels.

| stored key | the design's table | holds |
|---|---|---|
| `war:<warId>` | `LeaveWar` | the war's `Period` (its days, bands, open dates and last-closed note — D1177) with `ord` — its place among the wars, the order they were created (the period picker's) |
| `rec:<warId>:<recId>` | `LeaveBid` | ONE of the war's own records (a request, an earned credit, a notice, a UNA — `WarRec` below) with `pid` and `date` (its address) and `ord` (its place at that address). Several share an address; the list there reads back by `(ord, recId)`. A MOVE rewrites the one row (its new `pid` / `date`) |
| `ledger:<id>` | `LeaveLedger` | one `LedgerEntry`; a reload reads the ledger by (date, entry time, id) — every reader sorts it for itself |
| `opening:<pid>:<counter>` | `LeaveOpening` | one opening balance, a number. *[M5a, 28 Oct 26 (D1479): no door writes an opening any more. OIL's stay bare numbers, still read by the OIL tracker (`engine/oiltracker.ts`, `counters.ts figureParts`, `readWorldRows`, `seedOpenings`) until `[LW-OIL-OPENING-AWARD]` is settled; the other counters' old openings (annual, ccl, fcl, pl, el, cl) are read ONCE, as figures never typed (below) — stored demo data, D56.]* |
| `bal:<pid>:<kind>` | `LeaveBalance` | **a figure TYPED from the official leave app** (M5a, D1479) — one row per person and kind (`kind` one of LVE, CCL, FCL, PL, EL, CL; never OIL, D1209, D1255; the kind read from the RIGHT of the key): `{ amount, cf?, day, by, snap }` — see §A person's leave figures below. Written by `lw.balance` |
| `grade:<pid>` | `LeaveGrade` | **a person's leave grade over time** (M5a, D1229, D1490): `{ hist: [{ id \| null, from }] }` — `id` null is "No grade", `from` the day it was set (a change counting from the next 1 Jan; a change on the day the last entry was made replaces that entry). Kept in a row of its own, not on `profile:<pid>` (`rows.ts profileJSON` keeps only `post` and `label`). Written by `lw.grade` |
| `profile:<pid>` | `LeavePersonProfile` | `{ post?, label? }` — his posting window (`post`: the `postouts` entry below) and his personnel label (`label`, the admin's text for a ground-crew row); the row goes when both do. A man DELETED before he ever arrived keeps `post` as his post-in date alone — `{ from, to: null, gone: true }`, no earlier stint, no outcome (Astra's read of D2328, 22 Nov 26: without it ALL AVAIL counted him before that date; `store.ts arrivalKept`) |
| `current`, `oilpolicy`, `eventdefs`, `figorder`, `rosterorder`, `manningorder`, `manninghidden`, `fighidden`, `groupdefs`, `grouppriority`, `grouppriocustom`, `groupcolors`, `manningdefs`, `eventrows`, `showsans`, `reqnames` | `Setting` | one key each, as before — only the keys a command changed are written. **`manningorder` — the order of the Manning block's rows — is a list of counter ids and, since D674 (8 Oct 26), may also hold the four fixed rows' TOKENS (`@req-p`, `@req-w`, `@avail-p`, `@avail-w` — `leavewar/engine/fixedrows.ts`): a list that names none of them means "these counters, then the four", which is what every list saved before that day says and what is still saved while no counter stands among or below the four; nothing stored is converted.** **`manningdefs` starts ABSENT and means "no counters" — the Manning block comes with no count rows of its own (D669, 8 Oct 26; until then an absent or unreadable list read as eleven built-in counters, and a pre-19 Aug 26 `manningthresh` overlay was laid over them — that key is no longer read). `manninghidden` is still read and written, so a store from before loads as it was, but nothing consults it: the eye that hid a row became a delete cross and a row can no longer be hidden.** `manningdefs` holds at most `MAX_MANNING_RULES` (60) counters: ONE number for the reader (a longer list reads as damage → no saved list, so no counters) and the writer (a new counter past it is refused, and the form says so) — `[STORE-READER-SWEEP]`, phase 7. **Since the Inputs / SANS redesign (7 Oct 26, D640) the list may also hold `availp` and `availw`** — the two Available rows the SANS calendar reads, stored only once an admin has renamed or re-defined one (until then the built-in definition serves: every pilot / every WSO — "Reset counters", which also put it back, went with D669). They are BESIDE the limit (the list may be 62 long, the ordinary counters still at most 60); each is a `people` count with `threshold` `{amber: 0, red: 0}` — a stored one of any other shape is left out at the read, and a SANS man is never counted whatever its filter says (`leavewar/engine/availrows.ts`). **Since the Leave War overhaul (D1190, D1191, D1202 — batch 3) each may also carry `points: {amber?, red}`** — its amber and red points, each a number plus or minus that day's Required (negatives allowed, at most 99 either way), never an absolute figure: red under Required + `red`, amber under Required + `amber` where set. ABSENT = `{red: 0}`, no amber — the rule the rows always had (red under Required), so every row stored before reads as it did; "red + 0" alone is not written; a pair that will not read is left out and the row still reads; on any other counter the field is dropped. Written with the row's Save (`lw.availrow`). **`reqnames` (D1193, narrowing D668) — `{p?, w?}`, the Required P and Required W rows' names where an admin has renamed one** (trimmed, at most 80 characters; a seat absent reads "Required P" / "Required W"; a blank or the original typed back removes the seat). Absent, or `{}`, = both originals. Written by `lw.reqname`. Distinct from the Raptor-side `settings/flynames` step 1 once wrote (below), which nothing reads. |
| `grades`, `ballock` | `Setting` | **the two settings the leave year added to `lw.config`** (M5a). `grades` — the squadron's own list of leave grades, `[{ id, name, order, days: [{ n, from }], goneFrom? }]` (D1229, D1234): `days` is dated so a "+ days" change counts from the next 1 Jan (D1490); a deleted grade keeps its record with the day it went (`goneFrom`) so a 1 Jan before that day still reads its days and one after adds nothing (reading 11). **ABSENT until an admin first edits the list** (never an empty list; no command runs at boot): while absent the engine reads the starting five, with FIXED ids so a man's grade never points at nothing after a reload — `sp` Senior pilot +36, `jp` Junior pilot +33, `sw` Senior WSO +21, `jw` Junior WSO +18, `opsa` Ops A +14 (`engine/leaveyear.ts START_GRADES`; D1229); the first edit writes the whole list, starting five included. `ballock` (the config field is `balLock`) — a boolean, "Lock for members" (D1220, D1247, D1488); absent reads false. Both are fields of the one `lw.config` record, written by `lw.grades` and `lw.balLock` (admin only); `rows.ts CONFIG_KEYS` pairs the field with its stored key |

A started store is read as it stands — no opening, ledger entry or window stored means none, never the seed's; a
row that will not read (or a war claiming a day another already holds, or a record that would break its address's
rules — two people each bidding the same half at once) is left in storage as it is and not read. *(Until 30 Sep 26:
every key above in ONE record each for everyone — `wars` (every war with every record), `openings`, `ledger`,
`postouts`, `perslabels` — rewritten whole by every edit, with `personedits` beside them; the fold removes them.)*
(Since [ARCH-STACK] step 4, 20 Sep 26, a war's records are `recs` — an older shape is not migrated — `SCHEMA_VERSION` 4
clears `inputs`, `weeks` and `leavewar` on a returning browser.)

The posting window is the only per-person record Leave War keeps (8 Sep 26 bug
pass — a posting-out date used to vanish on reload): the `post` of his profile row,
`Person` — since `[ONE-DOOR]` (D320, 27 Sep 26) with `past: { from, to }[]` beside `from`/`to`, his CLOSED earlier stints (from `from <= to`, in order, never overlapping, the last ending before the current `from`; a malformed list is dropped whole on reading) — the person as last projected with
the posting-out window (`to`, `poOutcome`, `poDone`, and the older
`poArchive` kept in step — `true` = `'overseas'`) on them, and `gone: true`
once he is deleted — an entry exists while either date is set.
`poOutcome` is which posting it is (`'overseas' | 'delete' | 'sans' | 'none'`,
`[POST-OUT-OUTCOMES]`, D229); `poDone` the posting date its outcome has run
for (so it runs once). `people` itself is never stored: it is re-projected from
Raptor's `PEOPLE` on every boot and the window is laid back on top. (The identity
overrides stored beside it until 30 Sep 26 — `personedits`, `{ [personId]: { seat?, band?,
sxo? } }`, the war's Edit person — are gone: D460, D461; a man's seat, band and SXO are Quals's.)

### The state — `src/leavewar/state/store.ts`

```
people: Person[]            requirements: Requirements     qualCatalog: QualDef[]
eventDefs: EventDef[]       wars: LeaveWar[]               currentId: string
period                      // the current war's period
getState() adds grid, states, views — DERIVED on read (state/merge.ts) from the
  war's own records + the Inputs; rawState() is what is stored
openings: Openings          ledger: Ledger                 oilPolicy: OilPolicy
role: 'member' | 'admin'    viewer: string | null
figureOrder, rosterOrder, manningOrder, manningHidden, figureHidden: string[]
persLabels, groupColors: Record<string, string>
groupDefs: GroupDef[]       groupPriority: string[]        groupPriorityCustom: boolean
eventRows: number           showSans: boolean
focusDate: string | null    focusSeq: number
postOuts: { personId: Person }   // (personEdits went with the war's Edit person — D460, D461)
balances: Balances          // M5a: pid → kind → TypedBal — the figures typed (`bal:` rows)
gradeHist: GradeHists       // M5a: pid → GradeEntry[] (`grade:` rows)
grades: GradeDef[] | undefined   // M5a: the grades list — undefined until an admin first edits it (the starting five are read)
balLock: boolean            // M5a: "Lock for members"
```

### Records

| Record | Fields |
|---|---|
| `Person` | `id, callsign, seat: 'pilot' \| 'wso' \| 'gnd', band: 'instructor' \| 'ops', sxo, from, to` (dates in squadron, null = open), `poArchive?, poOutcome?, poDone?, gone?, q?, scd?, scn?, xq?: string[], san?, pers?, label?` — built from the scheduler's PEOPLE, **same ids** |
| `LeaveWar` | `{ period, recs }` — one war (stored) |
| `Recs` | `personId → date → WarRec[]` — the war's OWN records only ([ARCH-STACK] step 4) |
| `WarRec` | each with `ord?` (its place at its address — `[DB-READINESS]` group A, phase 3), one of: **request** `{ id, kind:'request', code, state: 'pending' \| 'acknowledged' \| 'refused', shiftedFrom?, carried?, remarks?, till?, docIds?, placedBy?, placedAt?, decidedBy?, decidedAt? }` — `remarks` (≤ 200), `till` (the "till <date>" tick where it differs from the default) and `docIds` (≤ 20 attachment ids) are the request's own words and papers since M3 7.1 (D1210, D1226, D1150), carried onto the Input at approval and back at an un-approval; `placedBy` / `placedAt` (a person id ≤ 80, ms) who placed it and when — kept across a move, a re-typed kind on the same half and a put-back (the approved Input keeps them as `lwBy` / `lwAt`); `decidedBy` / `decidedAt` who refused it and when, cleared when it goes back to pending (the overhaul's M4, 8.6, 27 Oct 26 — the Approvals list's order and PLACED column, the bid window's "Placed · Decided" line); a request saved before M4 has none (D401); a member writes only his own, now (`perms.ts stampForged`); `carried` holds only the moved marks now, and an older row's `carried.remarks` reads as `remarks` (D401) · **OIL credit** `{ id, kind:'credit', code: 'FO' \| 'HO', oil: 'auto', via?, note?, spans? }` — the SCHEDULE'S credit only (an HO's half is derived from `spans`, never stored: the half its earliest work started in — before noon the morning, D1164); an OIL award is a ledger entry since [OIL-AWARD-IS-A-GRANT] (29 Sep 26), and an old `oil:'manual'` record is dropped on read (D401) · **notice** `{ id, kind:'notice', code, was, byType, byWho, seq, at, remarks?, docIds?, iid? }` (a replaced bid, until "OK, seen"; since M4 9.3a, 27 Oct 26, a bid replaced WHOLE keeps its `remarks` and `docIds` here, and `iid` names the input that replaced it — offered onto that leave from the day's list, `sync.ts replacedCarry`) · ~~**UNA**~~ — **retired 25 Oct 26 (D1356; [LW-OTHER-UNAVAIL]):** an "Other" under Unavailable took its place; a stored UNA record is dropped on read (`warrecs.ts isRetiredUna`). Nothing "approved" is ever stored here — approved leave is the Input with `lw` |
| `Period` | `id, name, start, end, open: {from, to}[], lastClosed: {from, to, by, at} \| null, days: DayInfo[], bands: EventBand[], ord?` (the open dates replaced `stage`, `bidFrom`, `bidTo` — D1177, 22 Oct 26; empty `open` = closed; an old saved period with a stage still loads: an `open` war's window becomes one stretch, any other stage none — `leavewar/state/store.ts readWar`) (its place among the wars — `[DB-READINESS]` group A, phase 3) |
| `Grid` (derived) | `personId → date → code` — the main code a cell shows |
| `Cell` | `{ type, portion: 'full' \| 'am' \| 'pm' }` — a parsed code |
| `States` (derived) | `personId → date → BidRecord` — the main record's colour state; `source: 'raptor'` now means "locked on the war" (filed on the Inputs page, or medical) |
| `Views` (derived) | `personId → date → DayView` — every record on the day, the main one, the corner mark, the charges (`engine/dayview.ts`) |
| `Openings` | `personId → { counter: number }` — opening balances. *[M5a, 28 Oct 26 (D1479): no longer WRITTEN by any door. Only OIL's are still read, as numbers, by the OIL tracker; the other counters' are read once as never-typed figures — see §A person's leave figures.]* |
| `TypedBal` | `{ amount, cf?, day, by, snap }` — see §A person's leave figures (M5a) |
| `GradeDef`, `GradeEntry` | `GradeDef { id, name, order, days: [{ n, from }], goneFrom? }`; `GradeEntry { id: string \| null, from }` — see §A person's leave figures (M5a) |
| `CounterName` | `'annual' \| 'oil' \| 'ccl' \| 'fcl' \| 'pl' \| 'el' \| 'cl'` |
| `LedgerEntry` | `id, personId, counter, amount, date, reason, approvedBy, givenBy?, enteredBy?, enteredAt?, half?` — a grant or correction; a positive OIL entry is an OIL AWARD, the ONE kind of hand-given OIL (D400, D402), drawn on the war grid on its date; `enteredBy` / `enteredAt` who entered it and when (D200 (2)); `half: 'am' \| 'pm'` only on an OIL award worth exactly 0.5 (an HO) — the half of its day it is drawn in (D1164), stored as the admin picked it or, unpicked, the other half beside a half-day leave, else the morning; an HO stored without it (before D1164) reads as the morning and still loads, a bad or misplaced one is dropped with the entry kept (D401); a new entry's id is opaque (`ol-…`) |
| `OilPolicy` | `expiry: { n, unit: 'days' \| 'months' } \| null, historyMonths \| null` |
| `OilLedger` (derived) | `credits: OilCredit[], debits: OilDebit[], balance, earned, awarded, corrections, taken, expired, overdrawn, first` — `earned` the automatic credits, `awarded` every award, `corrections` the negative entries (D400) |
| `OilCredit` | `id, date, amount, reason, source: 'opening' \| 'auto' \| 'grant', approvedBy?, givenBy?, enteredBy?, enteredAt?, half?, expires, used: [{date, amount}], left, expired, ledgerId?` — `grant` is an award (a ledger entry); `half` an HO's half of its day (D1164) |
| `OilDebit` | `id, date, amount, reason, source: 'taken' \| 'correction' \| 'opening', from: [{creditId, amount}], unbacked, ledgerId?` |
| `EventDef` | `{ name, kind: 'off' \| 'free' \| 'nolv' \| 'work', short? }` — a preset; `short` is what the grid prints for an event of that name (one to three letters or digits, `engine/eventshort.ts normShort`; the four seeded ones carry PH, OFF, NL, SC — D645). Absent on a library stored before short forms: its events print one derived from the name |
| `DayInfo` | `{ date, events: string[], eventKinds?: (kind \| null)[], eventShorts?: (string \| null)[], blocked, blockedReason, ph }` — a day's Event lines: each line's text, its own kind tag and its own short form, same index, written TOGETHER (`engine/period.ts writeDayEvent`; the build plan §3.12). `eventShorts` is absent on a day that never had one typed |
| `EventBand` | `{ line, from, to, text, kind?, short? }` — a merged event over a run of dates on one Event line; `short` as on a day, absent where none was typed |
| `Requirements` | `{ default: { rules: ManningRule[] }, overrides: { key: Requirement } }` |
| `QualDef` | `{ k, label }` |

### A person's leave figures — the typed figures, grades, the lock and the last visit (M5a, 28 Oct 26)

The Leave War overhaul's M5a (D1479, D1475; build spec `docs/superpowers/plans/2026-10-28-lw-m5a-build-spec.md` §1, §3).
How a figure is WORKED OUT from these records is `engine-rules.md` §The leave year (M5a); the tables for the database
step are `data-model.md` (`LeaveBalance`, `LeaveGrade`, `LeaveSeen`; who may write them is §11 there, with
`state/perms.ts`, together — D200).

| Record | Stored as | Fields | Written by (named command) |
|---|---|---|---|
| **LeaveBalance** | `bal:<pid>:<kind>`, one row per person and kind | `{ amount, cf?, day, by, snap }` — see below | `lw.balance` |
| **LeaveGrade** | `grade:<pid>`, one row per person | `{ hist: [{ id \| null, from }] }` | `lw.grade` (admin) |
| the grades list | `lw.config` field `grades` (stored key `grades`) | `[{ id, name, order, days: [{ n, from }], goneFrom? }]`; absent until an admin first edits it | `lw.grades` (admin) |
| the lock | `lw.config` field `balLock` (stored key `ballock`) | boolean; absent reads false | `lw.balLock` (admin) |
| **LeaveSeen** | `settings/lwseen:<pid>` | `{ at: ms }` | `lw.seen` (his own pid only; never an Undo step) |
| **BellSquadrons** | `settings/bellsqn:<pid>` | `{ <unit id>: boolean }` | `bell.squadrons` (his own pid only, every role; never an Undo step) |

**`bal:<pid>:<kind>` = `{ amount, cf?, day, by, snap }`.** `kind` is LVE, CCL, FCL, PL, EL or CL (OIL is never typed —
D1209, D1255; the gate refuses it at every door). `amount` is a whole number or a .5, below zero allowed (reading 10);
`cf` is LVE's carried-forward part, a whole number or a .5 from 0 to the figure (0 when the figure is below zero), and
only ever on LVE; `day` is **the app's today when it was typed** (`memberToday`, never the machine's clock — a moved test
clock and a real one never disagree); `by` the person who typed it; `snap` the SNAPSHOT — his approved leave of that kind
as it stood at that moment, `[[date, 'am' | 'pm' | 'day'], …]` sorted by date then half, one entry a day and a half,
never a total. A save of either LVE box writes the whole row afresh (`amount` as the App bal box then shows, `cf` as the
carried-forward box then shows, clamped to 0 … max(`amount`, 0)). A row that will not read (`store.ts readTypedBal`) is
left in storage as it is and not read. **The member's own row: he creates it by his first typing and his Undo deletes it.**
**What the gate recomputes** (`state/perms.ts ownershipViolation`, so a member cannot forge it): `by` is the writer
himself, `day` is the app's today, `amount` and `cf` are halves with 0 ≤ `cf` ≤ max(`amount`, 0), and `snap` equals the
snapshot the store itself builds from his approved leave at that moment — on a forward write; a restore that
`undo/timeline.ts verifiedReplay` vouches for, image for image, passes (his own Undo, or a Redo the next day). A member
writes only his own pid and only while `balLock` is off as it stands when the command is saved.

**Never typed / the old openings.** A person with no `bal:` row for a kind is read as typed 0 (cf 0) on 1 Jan of the year
of the war's earliest period (of this year when none exists), with an empty snapshot. The old `opening:<pid>:<counter>`
rows of the other kinds (annual, ccl, fcl, pl, el, cl) are read **once** the same way, their number as the figure — stored
demo data, D56; no door writes one any more. **OIL's `opening:` rows are unchanged: bare numbers, read by the OIL tracker.**

**`grade:<pid>`** — `id` is a grade's id, or `null` for "No grade"; `from` the day set. A grade given after 1 Jan counts
from the next 1 Jan (D1490); a change on the day the last entry was made replaces that entry. Kept apart from
`profile:<pid>` because that row keeps only `post` and `label` and a grade-only profile would be refused as empty.
A grade deleted from the list leaves its holders "No grade" from that day (reading 11).

**The commands.** Each is named, mapped in `state/perms.ts COMMAND_OPS` and registered, so the gate asks the right row
and Undo has words of its own ("LVE balance 18 → 20"): `lw.balance` (a typed figure — an Undo step; the member's own
or an admin's), `lw.grade` (admin), `lw.grades` (the list — admin), `lw.balLock` (the lock — admin), `lw.seen` (not an
Undo step). All five are in every place a war collection or setting is listed: `readWorldRows`, `lwDecompose`,
`applyLwRecord`, `LW_COLLS`, `lwRows`, `LwNow`, the state fields, `rows.ts`, `storage/tables.ts`. Their change-history
lines (build spec §3, `state/changelines.ts`; the gesture's `note` carries JSON `{k, from, to}` for a balance, `{from, to}`
names for a grade, a short string for the list): "LVE balance 18 → 20 · Ranger", "Grade Junior pilot → Senior pilot ·
Saber", "Balances locked for members · Saber", the list's add, rename, days and delete.

**`settings/lwseen:<pid>` = `{ at: ms }`** — the moment (not the day) he last opened his OWN person window, an admin
included; the previous moment is what "new since his last visit" counts from for that visit. It follows M4's
`apprseen:` pattern whole (`state/lwseen.ts`); the gate allows it only for his own pid and only under `lw.seen`.

### Sync with the scheduler — `src/leavewar/sync.ts`

**Since [ARCH-STACK] step 4 (20 Sep 26) there is no copy to sync.** An absence
(leave, medical, course, overseas duty) is ONE record — the Input. The war
READS the Inputs (`refreshAbsences`) and derives what each day shows; approving
on the war WRITES the Input in the same command, tagged `lw: <war id>` as
provenance ("approved in war W"), not as a loop-breaker. OIL credits remain a
derived pass (`runOilPass`) writing `oil:'auto'` records.

---

## World 3 — the Tracker

Vendored JavaScript, shapes fixed in `src/tracker/app/fileFormat.js`.
Course, syllabus and student names are free text LABELS. **CORRECTED
17 Sep 26:** they are no longer used as keys — courses, syllabi and students all
carry stable ids (13 Sep / 10 Sep 26), so renaming any of them moves nothing. A
colon is allowed in a syllabus, chart or student name; a COURSE name still
refuses one.

### Keys (`raptor:tracker/*` on the built site; legacy `ocu:*`) and prefs (`ocuLocal:*`)

`v3:master`, `v3:courses`, `v3:lay`, `v3:seedstamp` hold
the containers below. **Event details are PER CHART since 23 Sep 26 (D126)** —
`v3:master:eventinfo` = `{ sylId: { eventId: { name?, fmt?, hrs?, crew?, pre? } } }`,
only the fields that differ from that chart's shipped wording (the base table
plus a built-in's own profile); an emptied field is stored as `''`. The old
one-table key `v3:eventinfo` (`{ eventId: fields }`, shown on every chart with
that code) is converted ONCE when the new key is absent — each edit laid on
every chart that has the event — and then left untouched as a backup
(`app/eventDetails.js`). **Deleted courses (D128)** are `v3:delcourses` =
`{ id, name }[]`; their records stay filed under the id, and ⇅ Reorder courses
restores one. A Last Flown record (`…:d:<id>`) may carry `handSyll` /
`handCurr: true` — the day in that box was typed by hand and stands until a
later flight (D123). **Each save travels with its command (30 Sep 26, `[DB-READINESS]`
group A phase 4.1):** a record a command changed is written by the Tracker's own subscriber
to the command stream, through its storage door, inside that command's saved group and its
change-log batch — never again after it; its own Undo / Redo is one restore command each
(`tracker.undo` / `tracker.redo`). Only its first mount (the seed and one-time migrations,
their flags) writes outside a command. **One row per thing (30 Sep 26, `[DB-READINESS]` group A phase 5b — D462,
D464):** the records that held several people's or several charts' work are STORED one row each, through the row door
in `core.js` (`app/rows.js` holds the one conversion; every caller still reads and writes the old record whole):
a course and chart's student list `v3:<course>:<chart>:roster` → `v3:<course>:<chart>:enr:<enrolmentId>` =
`{ id, name, pid?, ord }` (`Enrolment`); the course list `v3:courses` and the deleted courses `v3:delcourses` →
`v3:master:course:<courseId>` = `{ id, name, ord, deleted? }` (`Course`); the chart records `v3:master:syls`
(definitions), `sylcat` (names), `sylorder` (display order), `sylhidden`, `syltomb` → `v3:master:chart:<sylId>` =
`{ id, name?, base?, userNamed?, ord?, hidden?, tomb?, def? }` (`Syllabus` — the catalogue list now reads in the
display order, the one order a chart row carries); the details typed on the balls `v3:master:eventinfo` →
`v3:master:info:<sylId>:<encoded ball code>` = the ball's typed fields (`TrainingEvent`), with a one-time flag
`v3:eventinfomig` = `'1'` once the details are in their per-chart form (so clearing the last one never brings the old
one-table `v3:eventinfo` back). Order rides the row (`ord`, read by (ord, id) — `src/command/ord.ts`). A write stores
only the rows its list CHANGED against what that copy of the Tracker last read, so two people's work on two things never
overwrites; one write is one command. An old whole record that is still stored (a browser the fold has not reached, the
standalone Tracker) is read as it stands, and converted to rows at its next write; one that cannot be split (bare names
from before the ids) is kept whole. A browser's old records are converted once at boot by the fold's `tracker` converter
(`src/tracker/fold.ts`, registered by `src/boot.ts` — the last of the eight: the store's format is 6). The layouts, marks,
dates, pace, lulls, plans and flags keep their keys. **The flex settings (18 Oct 26 — D1006, D1014, D1018)** are one
row for the whole Tracker, `v3:master:flex` = `{ on: boolean, from: number[6] }` — the switch and the six "From" days
(defaults 7, 14, 21, 31, 60, 120: each a whole number ≥ 1, each above the one before); missing or damaged reads as the
defaults; written only by an admin, as its own command `trk.flex` (a `Setting` in `data-model.md` §11); a backup of every
chart carries it as `charts.flex`. **The chart a signed-in person has open is his own place** (D376),
kept on his browser under `ocuLocal:who:<id>:lastSyl:<course>` — never written into the course's shared `v3:<course>:plan`,
whose `sylId` names the course's own chart (with nobody signed in as a person, the one shared answer is kept).
Since the seam the Tracker's data flows through the
whiteboard and lands under `raptor:tracker/<key>` (e.g. `raptor:tracker/v3:master:syls`);
the legacy `ocu:*` keys are imported once, by the browser backend (`src/storage/browser.ts`) — the Tracker's own
doorway has no path to them, nor to the browser's storage at all, since [TRK-STANDALONE-LEFTOVERS] (5 Nov 26): with
nothing plugged in, only in a unit test that never runs the boot, it keeps its records in memory. Nothing stored changes
or is read differently: the running app always had the whiteboard plugged in (`src/boot.ts`, before the app is drawn). `ocuLocal:*` holds this browser's
last course and crew member — a view preference, written straight to
localStorage (NOT through the whiteboard), kept outside the shared prefix by design. Since the Tracker follows the squadron
picked (his D2395) the course he was on is also noted per squadron as he leaves it, `ocuLocal:who:<id>:lastCourse@<unit>`,
read where the plain `…:lastCourse` names no course of the squadron being opened, so a visit to 149's Tracker does not cost
him his place on 142's.

### Containers

```
charts   = { order: string[],
             syllabi:  { name: event[] },        // event = { id, type, seq, prereqs: string[], phase, _b }
             layouts:  { name: object },
             eventInfoBySyl: { sylId: { eventId: { name?, fmt?, hrs?, crew?, pre? } } },  // D126: each chart's OWN edits
             deleted: sylId[] }   // D127: a backup of EVERY chart names the built-ins deleted when written
             // a file written before D126 carries `eventInfo: { eventId: fields }` (one table)
             // instead; import lays its real edits on the imported charts only

students = { courses: string[],
             byCourse: { course: {
               plan: object,
               bySyllabus: { syl: {
                 roster: { id, name, pid? }[],                 // legacy files: string[] (names)
                 marks:  { enrolmentId: { eventId: { g, f } } },   // g = grade (0 = none), f = failure ticks
                 dates:  { enrolmentId: { eventId: date } } } } } } }
```

**A student is an enrolment id since 10 Sep 26 (stable ids).** A roster entry
is `{ id, name, pid? }` — `id` opaque (`s` + base-36 time + random, minted
when the student is added), `name` the typed callsign (a label; the pencil on
each Students-card chip renames it — `core.js:renameStudent`, 10 Sep 26,
everyone may, refused if another enrolment on the course holds that name; the id
and every id-keyed record are untouched), `pid` the Raptor `PEOPLE` id when the
student was picked off the roster. Every per-student record files under the
id: `v3:<course>:<syl>:m:<id>`, `:d:<id>`, `v3:<course>:pace:<id>`,
`lulls:<id>`, `last:<id>`, and `lastStudent` holds an id. The same name on
two syllabi of one course is ONE enrolment (pace and lulls are per course).
Existing browser data converts once per course — `v3:<course>:idmig` = `'1'`
marks it done — by `core.js migrateIds` through the one converter
`app/ids.js upgradeCourseBlock`: the name → id mapping is built from every
roster first and parked in `v3:<course>:idmap` (read back before anything
moves, reused if the run is interrupted so a retry lands every record under
the same id), each record is written under the id and read back before its
name key is deleted, the roster is written last and the flag after it; the
map is deleted with the flag. Run at the first mount they are the Tracker's one exempt writer; run AFTER it (an
Import bringing a course this browser never converted) the flags, the map and the old `v3:links` record are each saved
as a command of their own (`trk.meta`) with its change-log batch (the group-wide walk's W5 finding 1, 30 Sep 26 — they
had gone out bare). A course whose conversion did not finish
(the roster still a string list after the retry) refuses roster writes
until a later load converts it. `migrateAllCourses()` at init converts
courses nobody has opened; a course still waiting for the older roster
split (`rostermig`) converts on its first open. **CORRECTED 17 Sep 26 — a course
rename MOVES NOTHING.** Since course ids (13 Sep 26) every per-course key files
under the id (`v3:<courseId>:…`), so `renCourse` just sets the entry's name; the
old copy-verify-delete apparatus described here (write, read back, delete the
old; the old course left listed beside the new) is GONE. `app/courseIds.js` is
the one converter (mint/upgrade/reconcile); `migrateCourseIds` re-bases a
name-keyed browser once — resumable, read-back-verified, a `storage.list()`
prefix-move with a reserved-namespace skiplist
(`courses`/`links`/`master`/`lay`/`SYLLABUS EDIT`) and a fail-closed preflight:
a reserved or colon-bearing legacy course name stops the boot (`bootError` → the
reload panel, no board, no writers). Course-id grammar `^c[0-9a-z]+$`; Import
refuses a reserved name or a non-matching id at the file boundary.

A mark record is `{ g, f, fd, d, by?, at? }` — grade code, failure count,
one ISO date per failure (oldest first, null when undated), the done date,
and since 9 Sep 26 **who** made the last write (Raptor's `HOOKS.whoami()`
display name, absent when unknown) and **when** (ISO instant). `dates[s]`
(`lastSyll, lastCurr`) carries the same two stamps. Undo
snapshots restore them verbatim. **Since 18 Oct 26 (D1002, D1005) nothing writes `downDays` or `upchit`:** the typed
"No. of Down Days" and the "Upchit Date" box went; a record that still holds them loads as it is and the two fields are
left unread (D56 — no conversion).

**A pace record** `v3:<course>:pace:<id>` = `{ epw, target, target2, courseStart? }` — per course and student, whatever
the chart — the pace, End date A and B, and **since 18 Oct 26 (D1003, D1018) the course start** (an ISO day, or null):
the day the student's down days are counted from, set in "+ Add" (today by default — written with a fresh pace only
when he has none) and changed in the Info panel. It travels in a backup inside `pace` with no change to the file.

### The person link — `pid` on the entry (`v3:links` is legacy)

The Raptor `PEOPLE` id a student was picked with (the Students card's
`+ Add` lists the roster via the no-import bridge `src/tracker/people.js`,
fed by `TrackerPage.tsx` → `src/tracker/peoplewire.ts`) rides the roster
entry as `pid` since 10 Sep 26. Picking the same person again, or typing a
name already on the course, lands on the existing enrolment (a pid that
already belongs to a differently named entry, or a name already linked to
another person, is refused with a message). The 9 Sep 26 record
`v3:links` = `{ [course]: { [studentName]: personId } }` is read once by
the migration, folded into `pid`, and deleted; a file's `links` block is
read the same way on Import and never written by Export.

**The medical rider (18 Oct 26 — D1002, D1003, D1018): the down days are read, never stored.** The same bridge carries
a third channel, each man's downchits (HL, OML, ATT C, ATT B) worked out on Raptor's side by `peoplewire.ts
medForTracker` from `INPUTS` into `{ [personId]: { iid, type, startIso, endIso, half, firstEnd?, cutOn? }[] }` — plain
ISO days, the row's own year resolved there; `firstEnd` / `cutOn` only where an upchit cut the input and it keeps the
end it was filed with (D999). The Tracker counts a student's down days from it through his `pid` (`core.js
downDaysOf`: from his course start to today, a half day ½, each input clipped to that span). Nothing of it is saved in
the Tracker's store or written to a backup — the Inputs stay the one record of a medical day; the standalone Tracker
gets nothing and shows "—".

**A syllabus is a syllabus id since 1B-ii (`[TRK-CSID]`, 13 Sep 26).** The
`<syl>` segment above is a syllabus id: built-ins carry a deterministic
shipped id from `app/sylIds.js:BUILTIN_SYL` (`sb…`), user charts a minted
`sc…`; the global catalogue is `v3:master:sylcat` (`{id,name,base?,userNamed?}[]`),
definitions `v3:master:syls` and layouts `v3:master:lay:<sylId>` are id-keyed,
and `plan.sylId` replaces `plan.sylName`. `migrateSylIds` converts the
catalogue in place (payload journal, flags `v3:sylcatmig`/`v3:sylreset`) and
RESETS the per-(course,syllabus) student layer ("keep charts, reset marks").
File version → 3; student marks import only from an id-native v3 file with a
`sylcat` (the §19 guardrail). A COURSE name is still a storage-key segment
shown in name reconcile, so a course name containing a colon is refused at
every entry point and by the file check; a SYLLABUS, CHART or STUDENT name is
a label now and may contain a colon.

### The syllabus file

`{ format: 'ocu-tracker', version: 1, savedAt, contains: { charts, students, links }, charts?, students?, links? }`
— a FORMAT, not a store (9 Sep 26): ⤓ Export writes one from the store, ⇪ Import
reads one back in (charts always; students & marks — and the links that ride
with them — only after a yes; the file's students are matched to the
enrolments the course already has, by person id then by name, so the store's
id wins and a student it does not carry keeps their place — `ids.js
reconcileIds`, 10 Sep 26). Nothing
binds a file; the store above is the record. The database migration's recipe
is exactly this shape: Export (both boxes ticked) → wipe → Import, answer yes.

---

## Loose spots a database migration should tighten

Listed in the order they would bite.

1. **The scheduler schema is declared but not yet enforced by the compiler.**
   Since 9 Sep 26 `src/engine/schema.ts` types every record above and
   `src/engine/schema.test.ts` walks the shipped seeds, the initial `SCHED`
   and both week snapshots against those types — an unknown field or a
   wrong primitive is a red test. The seeds never carry the after-boot
   fields tabled under the schedule day (a typed `br`, a landed `src`, a
   template's `sa`), so those are declared from their writers and the same
   test's "after edits" block exercises the writers to check them. The live
   exports (PEOPLE, DAYS, INPUTS, SCHED) still read `any` (the verbatim-port
   rule); flipping them is a later, behaviour-free step. The Leave War is
   fully typed.
2. **Three date conventions.** Scheduler: `'Jul 13'` display strings, a
   0..6 day index, minutes-from-midnight; Leave War: ISO `'yyyy-mm-dd'`;
   Tracker: free text. A shared store wants one (ISO).
3. **Positional slot keys — the id half is done (10 Sep 26).** Every
   schedule row (wave, formation, seat pair, duty block and row, sim,
   programme and ground row) carries `rid`: opaque, minted by one walk
   (`engine/rowids.ts ensureRowIds`) that runs before every baseline and
   snapshot, never printed, never used for addressing. A copy (a day
   template, a duplicated wave, a draft) is a new row and mints fresh; a
   move, an undo, a restore keeps the id; snapshots written before ids
   existed are back-filled by address once. Rows are STILL addressed by
   `day.section.index`, so inserting a row renumbers the ones after it
   (`keys.ts` remaps the book and the edit log to cope); the addressing
   rewrite is the next step. *(Corrected 24 Sep 26: that rewrite SHIPPED 11 Sep 26 — the amendment
   book now resolves rows by `rid`, translated at the screen boundary; `raptor-port/CLAUDE.md` §The
   slot-key grammar.)*
   *(6 Oct 26, the Codex stack check's W8: the rows of the two BUILT-IN demo weeks carry REPEATABLE ids — the same id
   for the same row on every load (`engine/weeks-data.ts seedRids`: its week, its day and its place in the day's walk;
   the boot seeds the module's own literal the same way). A day nobody has saved is read from the built-in week every
   time, and its random ids changed on every load, which lost any record keyed by a row id that does not save its day —
   a Blue/Red answer (D530). Every other row — a blank week's, anything added — is still minted at random.)*
4. **The demo seed is code.** PEOPLE, DAYS and INPUTS are literals in
   `people.ts` / `data.ts` / `inputs.ts`. A database replaces the seed; the
   seed then becomes test fixtures only. The repository is public: no real
   names or dates may ever be committed as seed.
5. **Accounts are two hard-coded users.** Real sign-in is a separate step
   from storage; `HOOKS.whoami()` is the one seam the edit log needs.
6. **Attachments are blobs in a per-browser file store** (IndexedDB
   `raptor-docs`, since 8 Sep 26). The database step gives them a **shared**
   file store, not a table column; inputs already reference them by id only.
   Ids are minted globally unique (`doc-`+UUID, 9 Sep 26) so a shared store
   never collides two files under one id; the DB layer still owns write-verify
   and cross-store referential integrity (see the storage-seam spec's
   "Database-stage requirements").
7. **`null` means "standard"** for every `sqn142_*` key. The migration must
   keep that meaning (absent row = shipped default), not store the default.
8. **The three worlds do not share a style** (sync vs async doors, three
   prefixes, TS vs JS). Unifying them behind one async door is the
   storage-seam work; the shapes above do not change for it.
9. **One person, three records — the student half is done (10 Sep 26).**
   The scheduler roster is the identity; the Leave War projects it (same
   ids) and a Tracker student is an enrolment id carrying `pid` where they
   were picked off that roster. Courses and syllabi are still keyed by
   typed name, and their storage keys are those names joined with `:`
   *(corrected 24 Sep 26: since 13 Sep 26 both are stable ids too — `COURSES`/`SYLS` entries `{id,name}`,
   keys filed under the id; `.claude/rules/seams/tracker.md` §Architecture)*. The
   designed model (`data-model.md`) makes Enrolment (person × course ×
   syllabus) the row and the name an attribute.
10. **Progression is a summary, not a history.** A Tracker mark holds the
    latest grade, a failure count with dates, the done date and (since
    9 Sep 26) who last wrote it and when. It cannot answer "what happened on
    each attempt". `data-model.md` records each Attempt and derives today's
    mark from them.
11. **Hours are display text** (`'2.0 Hrs'`) in the event details, not a
    number, so nothing totals them. Left as-is on purpose — the owner is
    replacing the event details himself; the model types hours as a number.
12. **Two tabs of one browser overwrite each other's whole-record writes.** A known gap of the storage
    seam's first stage (8 Sep 26): each tab writes whole records through its own postman, so the later
    write wins; the stage-3 "incoming" side (live-ish sync) is the fix, which the database step
    brings. The Tracker's own case is in `docs/tracker/known-gaps.md`. *(Moved here 24 Sep 26 from
    `HANDOFF.md`'s storage-seam story, now archived, where it was the only place it was written.)*

## Suggested first cut of tables

The cheapest seamless path keeps the app's own units rather than
normalising on day one:

| Table | Row = | Source shape |
|---|---|---|
| `People` | one person | PEOPLE record (+ Leave War `Person` extras) |
| `Inputs` | one filed input | INPUTS record |
| `Weeks` | one week, JSON snapshot column | `weekStashSnap()` — DAYS + SCHED + muted warnings (the removed-input keys left it 30 Sep 26), stored since 30 Sep 26 as the week's rows — its week row, a day row for each day someone has saved, one per issuance and one per retraction (`src/state/weekrows.ts`; inputs and the planning layer are their own rows, not part of it) |
| `Amendments` | one published AL | `SCHED.als[n]` (also inside the week snapshot; split out when reporting needs it) |
| `EditLog` | one edit | `ELogRow` |
| `Settings` | one `sqn142_*` key | key + JSON value, absent = standard |
| `Attachments` | one file | id, name, mime, size + a file store reference |
| `LW_Wars` | one war | `LeaveWar` (period + the war's record lists as JSON) |
| `LW_Openings`, `LW_Ledger`, `LW_OilPolicy`, `LW_EventDefs`, `LW_Settings` | as named | the matching `leavewar:*` keys |
| `TR_Charts`, `TR_Students` | one container each | `charts`, `students` |

Normalising `Weeks` into Days / Waves / Formations / Aircraft rows is a
later step, worth doing only when something outside RAPTOR (a report, Power
BI) needs to query inside a week.

## The flying plan and the SANS calendar's colours (7–8 Oct 26; the first build's D580 records below, superseded)

**The flying plan (the Inputs / SANS redesign, 7 Oct 26 — D617–D642; `src/state/flyplan.ts`, records and resolver
`src/state/flyplan-model.ts`).** Three kinds of settings row, each its own stored record, written only by its typed admin
command and refused as a raw write: `settings/flyday:<YYYY-MM-DD>` = `{cls?, p?, w?}` — what is set for ONE date: its
flying class (`day`, `night`, `nf` no fly, `none` not set), required pilots, required WSOs; any subset; the class stored
only where it differs from what the date would inherit; the row removed when empty (`fly.day.set`, one command for one
date or a picked block). `settings/flyrule:<id>` = `{id, wd, cls, from, until?}` — every weekday `wd` (0 = Monday) from a
date onward, with or without a last day (`fly.rule.set`, `fly.rule.remove`). `settings/flyrun:<YYYY-MM-DD>` = `{p?, w?}`
— a required figure RUNNING from that date, per seat; `null` ends the run for that seat (`fly.run.set` — which, typed as
"From <date> on" on the Leave War, also takes that date's own `p` / `w` out of its `flyday:` row in the same command, so
the run shows on the day it starts: one command, two rows, one Undo step; applied to a PICKED BLOCK it does the same for
every picked flying weekday — one command, the run's row and each of those `flyday:` rows). Whole numbers of
zero or more; a row that fails the check is read as nothing. *(`settings/flynames` = `{p?, w?}`, a saved name for each Required row, was written by this branch's step 1 and is
GONE since 8 Oct 26 — D668: the Required rows keep their names. Nothing reads or writes the key; it never reached
`main`, so no table needs a column for it.)* From the same change `settings/sanscalendar` is read by the
flying plan as THREE figures, `{yellowFrom, amberFrom, redFrom}`, whole numbers, `1 <= yellow < amber < red`, defaults
1 / 3 / 5, written by the one admin command `settings.sanscalendar` from the SANS calendar's gear (D618). **The first
calendar build's own records are GONE since 8 Oct 26 (step 4 — the build plan §3.10):** its two-figure `sanscalendar`
(`{amberFrom, redFrom}`), its `settings/sansday:<date>` rows (`{required, flying}`) and its command `sans.day.set`, with
`src/state/sans-calendar.ts`. None of it reached `main`, so no table needs them; a row of either left in a browser's
storage is read by nothing (the two-figure record reads as the defaults). The day's requirement and class are the
`flyday:` / `flyrule:` / `flyrun:` rows above. The paragraph that described them is kept below, marked.

*(SUPERSEDED 8 Oct 26 — the first calendar build's records, removed; kept as written, for the record:)*
`settings/sanscalendar` holds `{amberFrom,redFrom}`: safe whole numbers, `1 <= amberFrom < redFrom`.
Absent/malformed reads shipped defaults1/3. `settings/sansday:<YYYY-MM-DD>` holds
`{required:number|null,flying:'unset'|'day'|'night'|'both'}`. Required is a safe integer >=0;
null means no target, 0 explicitly none required. A null/unset pair deletes the row.
Dates round-trip as real ISO dates; unknown fields/periods are refused. Writes use typed
admin commands `sans.day.set` and `settings.sanscalendar`, one settings record per changed day.
Input records are unchanged. Sun/moon intent never rewrites availability or issued schedules.
