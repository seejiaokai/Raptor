# [DB-READINESS] group A — the table-shaping half (plan v3, 30 Sep 26)

**Branch:** `claude/db-readiness-table-shaping-4094f6` (cut from `main` at the day-lock merge, PR #475).
**His order:** D453 (29 Sep 26) — group A lands BEFORE the IT team settles its tables; group B after the app is connected.
**Tier:** FULL (saved data). **Reviews:** red-teamed by BOTH Fable and Astra (D353) — rounds 1 and 2 folded in
(`raptor-port/docs/superpowers/briefs/2026-09-30-db-readiness-group-a-dispositions-r1.md`, `…-r2.md`; v1 commit e2368d9f,
v2 commit e3d64c29); round 3 is the last (his cap). The finished code read by both (persistence).
**Rulings range:** D460–D469. **Observations:** #380–#389.
**"No plug-in for now"** (his words, 30 Sep 26, heard from IT, UNCONFIRMED — `OUTSTANDING.md` `[IT-QUESTIONS]`). Two
questions are kept apart (Astra R2-08): **how the app works out a day's picture** — on read, from the day row plus the
inputs and people (design §9 rule 9); with no plug-in there is no other way, so the app's side proceeds, PROVISIONALLY
until IT confirms in writing; and **how reports get the same picture** — IT's to confirm (§12 q9): the hand-over of the
`ScheduleDay` / `Input` shape as FINAL waits on that written answer. "How the lock is made firm" (D450) moves to the
lock's build (group B) with the tools IT allows.
**The design of record:** `raptor-port/docs/data-model.md` §2, §3, §5–§9, §12.

## 0. What group A is for

The IT team is designing its Dataverse tables now from `data-model.md`. Today the app saves a handful of big bundles
(`inputs/all`, `people/all`, `plan/all`, one record per WEEK, `leavewar/wars` with every war and bid, the ledger, the
2,000-line edit log, the account list). Group A makes **every record the app saves correspond to one row of one table in
the design** (§2.5 gives the exact rule and the matrix), adds what decides the tables' shape — one change-log record per
saved action, store-safe deletes, no demo data in a shared store — and fixes the design wherever the code shows it wrong.
Doing it now, against the stand-in database, is how shape mistakes surface BEFORE the tables settle, and it makes the
eventual adapter a thin mapping. Nothing on screen changes.

## 1. What the code is today (verified 30 Sep 26 — three read-only sweeps, direct reads, both reviewers' two rounds)

- **Storage path.** Durable writes land on the whiteboard (`src/storage/whiteboard.ts`) as `collection/id → string`.
  The command layer opens ONE whiteboard transaction per outermost dispatch and commits it after the drained projections
  (`command/commit.ts:88-97, 169-180`) — so a user action and its causal children reach the postman as ONE group, on
  purpose (§20.1). The postman merges consecutive groups (300 ms) into one `putMany`; the Browser backend writes a group
  synchronously, which the pagehide flush relies on (`storage/boot.ts:65-73`).
- **The scheduler's saver** `persistAll()` (`state/persist.ts`) rewrites `inputs/all`, `people/all`, `plan/all`, every
  stashed week, and the loaded week once dirty — then deletes every stored week nothing local backs (line 119), which
  also covers "a week first stored this session, then undone to its load state" (lines 115-118).
- **"Already booted" is sniffed** from `inputs/all` (`persist.ts:52-58` → `isHydrated`, which gates the seed merges in
  `store.ts:834`) and `leavewar/wars` (`main.tsx:59` → `installDemoWorld`). The Tracker has its own `v3:seedstamp`.
- **The command layer is finer than storage.** `decompose()` (`state/sched-commit.ts`) yields `days/<wk>#<di>`,
  `sched.orig/<wk>:<di>`, `sched.als/<wk>:<verId>`, `sched.retired/<wk>:<verId>~<n>`, `inputs/<iid>` (+ `inputs/__order`),
  but ONE `sched.book/<wk>`, ONE `sched.mutes/<wk>`, ONE `plan/all`. The Leave War's `lwDecompose` yields `lw.war/<id>`,
  `lw.cell/<war>:<pid>:<date>` (the record list at an address), `lw.ledger/<entryId>`, and coarse singletons.
  `LOGICAL_TO_BLOB` (`command/registry.ts`) is stale (`leavewar/balances`, `leavewar/config`, `lw.bid`).
- **The persisted week** (`weekStashSnap()`, `store.ts:460`) is `{ d, …schedFields(), wo, un }`: `d`, `ok`, `sg`, `sb`,
  `cv`, `dr`, `cd`, `cr` by day index; `c`, `p`, `ad` by the slot key's leading day; `wo` by the mute key's leading day;
  `o` (the Original — an issuance with sequence 0, `publish.ts:338`); `a` (`SCHED.als`, each record with `di`/`iso`);
  `rt` (`SCHED.retired`, keyed `<verId>~<n>` — an unpublish MOVES a record here, `publish.ts:1159`); `al` (no reader);
  `v`, `am` (week-wide stamps — absent they read as a foundation-era book: ids re-minted, week read-only,
  `store.ts:551-572`); `un` (input ids a scheduler took off — an explicit decision that stops a re-landing on reload,
  `store.ts:429-461, 589-598`).
- **Order matters, and only `PlanningPuck` has a column for it.** `INPUTS` (writers `push` and `unshift`; the command
  layer records `inputs/__order`, CMDLF-010), `PEOPLE` (iterated by key order at 27 sites), a Leave War cell's list.
- **Other big records:** the edit log `settings/elog` (one record, 2,000 lines, rewritten by every logged change, `seq`
  a per-browser counter — `engine/editlog.ts:119, 330`); `settings/changeseen` (everyone's "seen" in one record);
  `settings/accounts`, `settings/accessreqs` (one record each, `state/accounts.ts:247`).
- **Demo seeding** fills an empty store on its first boot with no user action (`persistAll` writes the seed `INPUTS` —
  including the Leave War's demo absences — and `PEOPLE`; the Leave War writes its seed wars/openings/ledger at its first
  write; the Tracker writes the default course `26ABSG` and the demo pair `STUDENT A/B`; accounts persist the seed list
  on the first edit, and re-add the seed admin to a list with no usable admin). ~340 e2e tests, the Tracker smoke,
  `tfin.js` and ~157 unit files depend on the seed — it stays for them.
- **Writers that touch days they were not asked to:** `reconcileIssuedMarks` (every published day, on every board/text
  edit), `ensureRowIds(DAYS)` (whole week), `discardPending` (every unpublished day), week load re-landing inputs and
  the format migrations, `person-delete.ts` and `clearOilPersonDecisions` (every stored week). A drag from one day to
  another writes two days — legitimately.


## 2. The decisions (technical — mine; stated for the reviewers)

1. **Split at the RECORD level, not in a backend fan-out** (both reviewers agree). The app's own records become the rows.
   `data-model.md` §6's `FanOutBackend` sentence is corrected (D201).
2. **Rows are written from the command stream; deletes only from a command's own change** (Astra A-03, R2-03). A
   persistence consumer runs at phase 9 of every command — after the envelope exists, before the outer whiteboard
   transaction seals (`command/commit.ts:169-180, 252-294`) — and maps each `CommitEnvelope.changes[]` entry through ONE
   pure logical-record → stored-row mapper: a `put` for an add or update, a remove only for an explicit `delete`. This is
   the architecture's own long-planned Step-5 "fold subscriber" (`command/registry.ts` header; `undo-contract.md` §0).
   `persistAll` and the Leave War's `rawPersist` stop writing rows while a command is open; they remain ONLY for boot, the
   fold, and named non-command paths, each listed in phase 4.1 with its disposition. A non-command delete is an explicit
   call taking the exact row key. A stored row the app cannot read is kept byte-for-byte, never deleted, never loaded
   (logged once). The stand-in removes a deleted key; the batch item says `op: 'delete'`, from which the adapter writes
   Dataverse's tombstone (group B), so no reader changes. (Correction to v2: every roster write is already a
   `people.edit` command — `people-settings-commit.ts:244-246`; the raw `persistPeople` has no other caller.)
3. **Order lives on the row, sparse and stable, and ties break by id** (F5, F2-04, R2-10). `ord` is minted where ids are
   minted — `applyEnd()` beside `mintInpIds()` (`sched-commit.ts:360-364`) and the people store's advance — for rows
   without one, from their CURRENT neighbours: a first row `min − 1024`, a last row `max + 1024`, between two the
   midpoint, a run of new rows evenly spaced. A row that has one is never touched, so an unshift writes one row and a
   split (the clash gate's cut of a leave around a medical, the sync's slicing) writes only its pieces. The order
   everywhere is `(ord, stable id)` — never `ord` alone. Renumbering happens only when a gap closes, as its own recorded
   command naming every row it changes. The undo's `inputs/__order` sets `ord` only on rows whose neighbours changed, by
   the same rule. IT: `Input.sortIndex`, `Person.sortIndex`, `LeaveBid.sortIndex` — decimal; the order is (sortIndex, key).
4. **Keys are the ids the app already treats as identity, or the design's own unique alternate keys** (A-04 declined,
   upheld by both in round 2). `iid`, `pid`, `verId~n`, a ledger entry's id, a puck id (now `newId('pp')`, F2-07), a Leave
   War record's `recId`, an account id; and the design's declared unique keys — a week's start, (week, day), a remark's
   date, (person, counter). Dataverse upserts by alternate key; the adapter stays stateless. A Leave War record is keyed
   by `recId`, not its date. Keys are parsed from the RIGHT where an id may carry a separator.
5. **The mapping rule:** a stored record maps to ONE row. The only fixed children are an issuance's four sign-offs
   (`IssuedSignoff`, unique per role — written in the same changeset by a pure field mapping). **A variable list stays
   JSON on its parent at stage 1, and the design is corrected to say so** (Astra R2-01, option 3/4) — never a relational
   child written by inferring deletes from the parent. The matrix, every stage-1 table:

| Stored key | Design table (stage 1) | Written by (command) | Order | Notes |
|---|---|---|---|---|
| `weeks/<wk>` | `ScheduleWeek` | the stream (`sched.week`) | — | `v`, `am`; written with the seven day rows when a week is first saved |
| `weeks/<wk>#<di>` | `ScheduleDay` | the stream (`days`, `sched.book`, `sched.mutes` per day) | — | the day and every field naming it, its `wo` and `un` slices |
| `weeks/<wk>:is:<verId>~<n>` | `Amendment` + 4 `IssuedSignoff` | the stream (`sched.issuance`) | — | EVERY issuance incl. the Original (sequence 0); `n` = the number of retractions of that `verId` when it was issued (0 first); append-only |
| `weeks/<wk>:rx:<verId>~<n>` | `AmendmentRetraction` | the stream (`sched.retraction`) | — | the retraction of `is:<verId>~<n>`; join rebuilds `orig`, `als` and `retired[<verId>~<n+1>]` as today |
| `inputs/<iid>` | `Input` | the stream | `ord` | `docIds` JSON on the row (InputAttachment with Attachment, §12 q2) |
| `people/<pid>` | `Person` | the stream (`people.edit`) | `ord` | granted marks JSON on the row (QualMark and Qualification at stage 2, together); `seat`, `sxo` here only; placeholders (`special`) are code, never rows |
| `plan/pp:<id>` | `PlanningPuck` | the stream | `sortIndex` | id `newId('pp')` |
| `plan/dm:<iso>` | `DayRemark` | the stream | — | |
| `leavewar/war:<warId>` | `LeaveWar` | the stream (`lw.war`) | — | the period, its days as JSON |
| `leavewar/rec:<warId>:<recId>` | `LeaveBid` | the stream (`lw.cell` → per record) | `ord` within (pid, date) | pid, date, the record |
| `leavewar/ledger:<id>` | `LeaveLedger` | the stream (`lw.ledger`) | — | |
| `leavewar/opening:<pid>:<counter>` | `LeaveOpening` | the stream (`lw.opening`) | — | |
| `leavewar/profile:<pid>` | `LeavePersonProfile` | the stream (`lw.profile`) | — | the posting window, outcome, label; `past` stints JSON on the row; no `band` (from his CAT — D461) |
| `settings/elog:<lineId>` | `EditLog` | at `keep`, inside the command | `(at, lineId)` | lists (`inputIds`, `days`, `wasDays`) JSON on the line |
| `settings/seen:<pid>` | `EditLogSeen` | the person himself | — | `{ upto: {at, lineId} | null, extra: lineId[] }` |
| `settings/account:<id>` | `User` | Admin → Users | — | `seenFrom` = a position `(at, lineId)` |
| `settings/accessreq:<id>` | `AccessRequest` | sign-up, Admin → Users | — | `seenBy` leaves the row → `settings/reqseen:<accountId>` (per admin, like EditLogSeen) |
| `settings/<key>` (templates, rules, stores, …; the Leave War's settings-like keys; `qualcols`) | `Setting` | as today | — | unchanged; a `null` set removes the key (F19). `qualcols` a Setting at stage 1; `Qualification` rows at stage 2 with QualMark (design corrected) |
| `changes/<batchId>` | `ChangeBatch` | the whiteboard's seal (phase 4) | — | the one new collection; joins `RESET` |
| `settings/schema` | `SchemaVersion` | the boot, the fold | — | the stand-in's stamp is the design's SchemaVersion row |
| `settings/booted` | — | the seed, the fold, an empty store's first boot | — | a RESET-class mark, never a Setting the design carries |
| (code) | `InputType`, `LeaveCounter` | reference data, seeded by IT from the shipped catalogues | — | not app-written; the app reads its code copy at stage 1 |
| — | `TakeOverRequest` | the lock's build (group B) | — | not in group A |
| the Tracker's `tracker/v3:*` | `Course`, `Syllabus`, `TrainingEvent`, `Layout`, `Enrolment`, `CoursePlan` | the Tracker | — | **unchanged — his question 2 (§5)** |
| the documents drawer (IndexedDB) | `Attachment`, `InputAttachment` | `docAdd` | — | **excluded until §12 q2** (which file store); its writer is outside every command — named for group B |

6. **Old records are folded once, atomically, and only by a build that can fold them all** (F13, R2-02, F2-11).
   `SCHEMA_VERSION` becomes 6 ONLY in the build that registers every converter (weeks, inputs, people, plan, the Leave
   War, the edit log, accounts); a converter manifest refuses to stamp 6 if any is missing — the store stays at 5 and the
   app boots as today. Two predicates: `wipeDue` (below 5, as today) and `foldDue` (exactly 5). A fold is ONE `putMany`
   through the real backend before the whiteboard fills — every new row, `null` for every old blob, stamp 6 and
   `settings/booted`; at a fold boot the journal filter is skipped (the unfinished group's values are already overlaid
   on the snapshot and folded with it), so the fold's group is the superset. A store at 6 never looks for old blobs.
7. **One saved group = one user action with its causal children = one `ChangeBatch`** (A-01's decline upheld by both).
   The batch is a **pure invalidation log**: `items = [{ table, key, op }]` for every other key in the group, `seqs` (every
   envelope that ran in it — a user commit raised during delivery joins the group but is its own undo entry; the batch's
   `type` names the outermost), `actorId`, `at`. It carries NO store version and NO GUID (Astra R2-05, option 1): the
   writer's new versions come from the changeset's own reply, and a reader re-reads the rows it names. `data-model.md`
   §9's "each changed row's … new version" and "refreshes its local versions from the items" are corrected. The postman
   keeps its merge (the pagehide flush stays synchronous — F3); **group B must replace the merge before promising one
   changeset per command on the wire**, since a merged send cannot be split again once two commands touch one row.
8. **"Already booted" is one explicit stamp**, `settings/booted`: written by the seed in its own group, by the fold, and
   alone by an empty shared store's first boot; `isHydrated()` and `hadStoredWars` both read it; a store carrying it is
   never seeded. **A wipe removes it** (`resetPreSchema`'s wipe branch), so a future reset re-seeds his preview (F2-06).
9. **The command layer's records follow the storage grain:** `sched.book/<wk>#<di>`, `sched.mutes/<wk>#<di>`,
   `sched.week/<wk>`; **`sched.issuance/<wk>:<verId>~<n>`, `sched.retraction/<wk>:<verId>~<n>`** replacing
   `sched.orig` / `sched.als` / `sched.retired` (the Original is issuance sequence 0; an unpublish adds a retraction and
   never deletes or moves an issuance — R2-04); `weekstash/<wk>#<di>`; `plan/pp:<id>`, `plan/dm:<iso>`;
   `lw.opening/<pid>:<counter>`, `lw.profile/<pid>`; `lw.cell` stays the Leave War's undo address and maps to its
   records. The registry, `types.ts`, `LOGICAL_TO_BLOB`, `schedWriteRecords`, `undo/derive.ts` and the timeline follow;
   `sharesKeys`' week-family rule becomes per day.

## 3. The work, in phases (red test first in each; its own suites green before the next)

### Phase 0 — the frame: the fold machinery, the boot stamp, the stream consumer's skeleton
The converter registry and manifest, the atomic fold (§2.6) — **production stays at schema 5**; `settings/booted`
replacing both sniffs (§2.8), and removed by a wipe; the Leave War's `StorageBackend`, `memoryBackend`, `localBackend` and
`leavewarAdapter` gain `remove` and `keys`; a `clientBootId` (`newId('c')`, once per page life); the phase-9 persistence
consumer and the mapper, wired but mapping nothing yet. **Tests:** an incomplete manifest writes no stamp 6; a stamped
store with zero inputs (and, separately, zero wars) reloads with none of the demo back; a wipe removes the stamp and the
next boot seeds; an unfinished group plus a fold, crash after the fold's journal write → the next boot has the new world
including that group's values.

### Phase 1 — the schedule one day per piece
1. `src/state/weekrows.ts` (new): `splitWeek` → week row, seven day rows, issuances, retractions; `joinWeek`. `al`
   dropped; `un` sliced by the day the input would land on (its start, clamped into the week); a key or field naming no
   single day FAILS the split loudly; a missing week row at schema ≥ 6 → the stamps CURRENT; a missing day row → a blank
   day. **Tests first:** split then join equals the original for every retained field, `un` as a set — the two demo
   weeks, a week published and amended, one unpublished and reissued (the `~n` mapping), one with drafts and saved plans,
   one with a taken-off input; the key-naming-no-day failure; seven day rows and no week row → editable, ids intact.
2. The mapper learns the schedule: `days`, `sched.book`, `sched.mutes` per day → the day row (a week's first save writes
   the week row and all seven day rows together); `sched.week` → the week row; issuance / retraction records → their
   rows, written once. The reconcile at `persist.ts:119` goes. Preservation stays per WEEK with a mechanism (F2-08):
   `PRESERVED` becomes `wk → Map<rowKey, rawString>` classified per week at hydrate BEFORE the join (any row unparseable,
   or the join classifying `unsupported`); a preserved week's rows are written back verbatim and never from the join.
   The split is memoised on the stash string; `npm run perf` before and after.
3. **Other-day writers, each with a fixed disposition** (Astra R2-07):
   - `reconcileIssuedMarks` — takes the command's touched-day set; an ordinary edit reconciles only those days.
   - `ensureRowIds(DAYS)` — checks ids across the week for collisions but mutates only new or touched rows; the legacy
     backfill becomes an explicit boot migration.
   - `discardPending` — an intentional multi-day command: its envelope names every day it changes (at the lock's build
     it will hold every such day).
   - load-time re-landing and format migrations — `loadWeek` becomes a `sched.load` projection (F2-03): its persist and
     re-landing are one named group; format migrations are an explicit migration group, never a side effect of an edit.
     Phase 6(c) removes the re-landing writes altogether.
   - `person-delete` and `clearOilPersonDecisions` — deliberate multi-week system commands, enumerating every changed day
     in their envelopes (phase 6(a) and (d) replace them).
   **Tests, one per writer,** asserting the exact changed logical ids AND the exact stored keys; plus: on a week with a
   published day and a landed input, a Monday edit changes exactly one stored day row; a drag Monday→Tuesday exactly two.
4. `hydrate` joins rows into the stash; `decompose`, `schedWriteRecords`, `applyBook`, the week-stash store per day;
   issuance / retraction command records; undo and the timeline on the new ids. **Tests:** an Undo of Monday's edit is
   not blocked by a later Tuesday edit of the same week (loaded, and left and returned to); first publish, amendment,
   unpublish, same-label reissue, undo and redo checked at the ENVELOPE (not only storage); edit → Undo to pristine →
   reload → pristine (F2); every `src/undo/*` suite green.

### Phase 2 — inputs, people and the planning calendar one row each
The mapper learns `inputs`, `people`, `plan`; `ord` minted per §2.3; puck ids `newId('pp')` (`seedPuckCounter` and `PPN`
go); placeholders never stored; the settings adapter's `null` set removes the key; hydrate rebuilds by `(ord, id)`.
**Tests:** the GAP test "two people editing the SAME blob clobber each other" flips to HOLDS — two clients each file an
input, both survive, and NEITHER client's save changes the other's stored row string; two clients add a puck on the same
date → two rows; an `unshift` filing writes exactly one row; a clash-gate split writes only its pieces; client A deletes
X while client B (booted earlier) files Y — X stays deleted; an unreadable input row survives an edit elsewhere;
concurrent appends and concurrent inserts into one gap read in the same order on every reload; the Inputs page, Quals and
the pickers keep their order across a reload.

### Phase 3 — the Leave War one record each
The mapper learns the war: `lw.war`, `lw.cell` → its records, `lw.ledger`, `lw.opening`, `lw.profile`. The war writes
that today go out OUTSIDE a command (the coalesced idle-reconcile `rawPersist` calls, boot writes before `LW_READY`) are
routed into commands. **No Edit person on the war (his rulings D460, D461, 30 Sep 26): Quals is the one place a
man's seat, band and SXO change** — the name sheet's "Edit person" button and `PersonSheet.tsx` go; the war stops writing
and reading `personedits`; seat and SXO come from the person, band from his CAT; `lw.config`'s `personEdits` goes. `LOGICAL_TO_BLOB` corrected. **Tests:** two clients bidding on
different days of one war both survive; an admin's decision and a member's bid on two records of one person/date both
survive; a moved bid is ONE row changed; the Leave War's store, undo and e2e suites green; `npm run perf` before and after.

### Phase 4 — the change log, the edit log, accounts (its 4.1 test goes green only after phase 3)
1. **`ChangeBatch` at the seal** (§2.7): the whiteboard's `setSealer(fn)` appends one `changes/<batchId>` (`<clientBootId>-
   <outermost seq>`) to the SAME group. **Every writer that reaches the whiteboard after boot outside a command is listed
   with its disposition** (F2-03): `loadWeek` → `sched.load` (phase 1.3); the Leave War's idle raw writes → routed (phase
   3); the undo/redo `logAction` lines and `commitDiscardPending`'s → routed through the command that caused them; the
   Tracker's first-mount seed and migrations → exempt by name (its own world, once). **Test:** every group after boot
   carries exactly one `changes/` entry whose items equal the rest of the group, EXCEPT the named exempt groups, which
   carry none and touch only their own keys — including a user action that drains two projections (one group, one batch,
   three seqs) and two rapid commands touching the same row (both batches survive; a reader fetches the row once).
2. **A stand-in reader, to prove the shape:** a test-only second client reads the batches since its mark, re-reads each
   named row once, and ends with the first client's view (an input, a day, a war record, a history line).
3. **The edit log one line per record, written at `keep`** (F2-01, R2-06): `settings/elog:<lineId>` set synchronously
   when the latched log effect is released, inside the open transaction; `queueSave` / `SAVE_QUEUED` deleted
   (`elogFlush` a no-op kept for `resetSession`); the 2,000 cap deletes the oldest line in the same group; boot loads the
   newest 2,000 by `(at, lineId)`; the order is `(at, lineId)` everywhere (F2-02); `settings/seen:<pid>` as the matrix;
   Admin → Data's history sweep a named command deleting exact line ids. **Test:** one user edit → ONE group holding the
   domain rows, every line it logged and one batch; nothing lands after the microtasks drain.
4. **Accounts, access requests and "seen" one row each** — `settings/account:<id>`, `settings/accessreq:<id>`,
   `settings/reqseen:<accountId>`; `seenFrom` a position; two admins adding accounts, or marking requests seen, at once
   both survive; two accounts for ONE person — the older (`createdAt`) wins and the other is dropped with a logged line
   (the design's unique `personId` refuses the second at the store in group B).

### Phase 5 — never seed demo data into a shared store
1. **A `BootPolicy` chosen in `main.tsx`** and passed separately to the shell, the scheduler, the Leave War, the Tracker
   and accounts; `Backend` stays persistence-only. Default `seedDemo: true` (tests, dev, e2e, his Vercel preview —
   unchanged for him); `false` for a shared store. The policy decides only an UNSTAMPED store's first boot.
2. **Frozen seed copies** (F2-05 a, R2-09): each seed literal is deep-frozen once at module load (`SEED_INPUTS`,
   `SEED_PEOPLE`, `SEED_DAYS`, the authored week bundles, the Leave War's seed wars/openings/ledger, the seed accounts);
   every boot resets the LIVE exported arrays and objects in place — from a fresh clone of the seed, or to blank — before
   `accountsLoad`, the Tracker's `applyBundle`, the scheduler's merges and the Leave War's init. So a demo boot after a
   blank boot in one process loads the demo, and the reverse is blank.
3. With `seedDemo` false, also skipped: `autoAcceptSeedInputs`, `installDemoWorld`'s demo half, the Tracker's demo pair
   and default course (his question 3), and `accountsLoad`'s lock-out repair (which re-adds the seed admin). The Leave
   War's settings-like DEFAULTS and the built-in syllabus charts stay (defaults and shipped content, D62).
4. **The first admin:** a bootstrap admin from the root configuration, separate from the demo accounts; the real answer
   to IT (`[IT-QUESTIONS]`). The Tracker gets a test reset hook for its one-shot `init()`.
5. **Tests:** demo→blank and blank→demo with the same module instances; two blank boots; stamped stores under both
   policies; a store holding only new-shape Leave War rows; a stamped store with an empty war list; the Tracker's
   migrations and account repair under blank; the walk-shaped test — the bootstrap admin visits every page, the Leave War
   and the Tracker, and storage then holds only the stamps and what he did.

### Phase 6 — worked out on read (the app's side; PROVISIONAL until IT confirms in writing)
Design rule 9, smallest first, each its own step with the whole engine suite, `tfin.js` 728/0 and the walk: (a) a
handed-on OIL decision ignored on read — the decision records the input assignment it was made for; (b) the input
landings' pending marks (`inp:`) counted from the filing against the day's baseline; (c) an input's landing as a
read-time overlay from the `Input` plus the day's stored decisions keyed by input id — which removes `sched.load`'s
re-landing writes (18 reader files; `[OIL-RELINK-XWEEK]` goes with it); (d) a delete by `Person.deletedFrom` filtered on
read instead of rewriting every stored week. **The final hand-over of the `ScheduleDay` / `Input` shape waits on IT's
written answer on reporting (§12 q9); if reports cannot reproduce the overlay, a reportable projection (a view, or a
table with a named owner and writer) is added before the tables settle.**

### Phase 7 — the small OIL follow-ups (D147, D453 "with")
`[OIL-READ-LEFTOVERS]` 1, 2, 4; `[STORE-READER-SWEEP]`; `[OIL-REQ-NAMEBOX]` (a walk question for him first); `[OIL-WORDS]`;
`[OIL-PERSONAL-PLACEHOLDER]` (FULL); `[CROWD-SIM-BRIEF]` (WALK). Behaviour, not shape — last, never holding the shape work.

## 4. Documents fixed in the same change (D201)

`data-model.md`: §6's `FanOutBackend` sentence; §3's field placement (`rt` keyed by version; `o` = issuance 0 →
`Amendment`; `a` → `Amendment`; `un` a day-row field keyed by input id); §3/§5/§6: `QualMark` and `Qualification` move to
stage 2 together (marks JSON on `Person` at stage 1), `InputAttachment` goes with `Attachment`, `past` stints and an edit
line's lists are JSON at stage 1, `AccessRequest.seenBy` becomes a per-admin row; `sortIndex` on `Input`, `Person`,
`LeaveBid` (decimal; order `(sortIndex, key)`); `LeaveOpening` per (person, counter); `LeavePersonProfile` without the
`seat` override (it was already "dropped"); §5 the field map = the matrix; §9 `ChangeBatch` as a pure invalidation log
(`{table, key, op}`, no versions) and "one batch per saved group"; `EditLog.seq` store-assigned, `EditLogSeen.upTo` and
`User.seenFrom` positions in the log's order; "Admin → Data's clear of a week" marked future; §12 q8, q9 with the "no
plug-in" news and the two questions kept apart. `data-schema.md` to the new keys. `schema.ts` `SchedFields` + `rt`, `cr`;
the "FOURTEEN fields" comments. `weekstash.ts` / `persist.ts` Admin-sweep comments. `registry.ts` header (the fold
subscriber now built). `undo-contract.md` §0 (persistence is now a stream consumer). `leave-war.md` §Architecture (the
fifth seam). `docs/file-map.md`. `handover-dataverse.md`. `[IT-QUESTIONS]`: confirm "no plug-in" in writing, and whether
Custom APIs and Power Automate flows are allowed; reporting on the worked-out picture (§12 q9); the first admin;
`sortIndex`; the alternate keys; `EditLog.seq`; `InputType` and `LeaveCounter` seeded by IT.

## 5. What this plan needs from him (product or scope — not technical)

1. **To IT, in writing:** "no plug-in" confirmed (and whether Custom APIs / Power Automate flows are allowed); and
   whether reports can combine a day with the leave and people tables (§12 q9). The app's side proceeds meanwhile; the
   final hand-over of the day and input tables waits on the second answer.
2. **The Tracker — include it?** Recommendation: yes — a phase saving one record per student's marks and dates, because
   the `Enrolment` table IT builds now would carry them.
3. **An empty real database: should the Tracker start with a course already made?** Today a fresh Tracker creates one
   named "26ABSG". Recommendation: no — the first person to open the Tracker adds the course.
4. **When do IT's tables settle?** (D453.)
5. **ANSWERED 30 Sep 26 — D460, D461:** Quals is the truth; the Leave War's Edit person is removed; seat, band and SXO
   change only on Quals.

## 6. Checks (FULL tier, `raptor-port/docs/bug-check-order.md`)

- Red tests first per phase; the full gate set once per phase under the PC lock (D228): unit, build, `tfin.js` 728/0,
  e2e, smoke, `npm run perf`; `rulecheck`, `docsize`.
- **Roll-call before the walk:** every place the app SAVES — each writer of each record — has its per-row path / must
  not, because… / MISSING. The matrix, §1 and phase 4.1's list are its first draft.
- **The walk** (a real browser on `vite preview`, the Browser backend), a reload and a picture after each: file / edit /
  delete an input; file two in a row (one stored row each, order kept); add / archive a person; a planning puck and a
  day title; two tabs each add a puck on one date (both remain); edit two days of one week; edit, Undo to pristine,
  reload; a week with a PUBLISHED day — edit another day, Unpublish, publish again (a reissue) — the issued versions, the
  four names and the history intact after each reload; bid / decide / move / delete on the war; the war's SXO tap (the
  schedule and Quals show it); an OIL award; undo and redo each; three quick edits then an immediate reload; delete every
  input, reload (no demo back); orders before and after reload (Inputs page, Quals, the pickers, a Leave War cell with two
  records); two tabs on different records (both survive); an edit on one client and the stand-in reader on another (the
  history line arrives); a week switch onto a week another client filed an input for (its group carries a batch or is a
  named one); a browser holding the OLD shape (fold, nothing lost); a schema bump on a stamped store (the demo is back); a
  hand-damaged DAY row (the whole week read-only, every other row's bytes untouched after an edit elsewhere); a week's
  rows with its week row removed (editable, ids intact); the stand-in shared store (nothing seeded). Evidence sheet with
  pictures in `raptor-port/docs/handpass/`.
- **Then** both reviewers read the code (persistence — D353), given the evidence sheet (D11).
- **Excluded from every reviewer's brief (D56):** a problem living only in data already stored, when the code is correct
  going forward. The fold must not break a load (D401); it need not preserve quirks of old demo records.

## 7. Risks, said plainly

- **Persistence moves to the command stream** (§2.2) — the biggest architectural change here, and the one the design
  always intended; the registry's reconstruct-and-compare completeness test is the guard that nothing durable escapes it.
- **Undo** — its record ids change in phase 1; every undo suite stays green and the walk undoes after every step.
- **The other-day writers** (phase 1.3) are engine code; each confinement is checked against `tfin.js` 728/0.
- **Order** — phase 2's tests and the walk compare orders before and after reload.
- **Phase 6 (c) and (d)** touch the engine's readers; the largest items in group A.
- **Time.** Phases 0–5: several sessions of building plus a FULL check. Phase 6: as long again. Phase 7: one batch.
