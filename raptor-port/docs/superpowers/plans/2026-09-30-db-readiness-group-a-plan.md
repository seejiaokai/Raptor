# [DB-READINESS] group A — the table-shaping half (plan v2, 30 Sep 26)

**Branch:** `claude/db-readiness-table-shaping-4094f6` (cut from `main` at the day-lock merge, PR #475).
**His order:** D453 (29 Sep 26) — group A lands BEFORE the IT team settles its tables; group B after the app is connected.
**Tier:** FULL (saved data). **Reviews:** this plan red-teamed by BOTH Fable and Astra (D353) — round 1 folded in
(`raptor-port/docs/superpowers/briefs/2026-09-30-db-readiness-group-a-dispositions-r1.md`; v1 is commit e2368d9f); the
finished code read by both (persistence). **Rulings range:** D460–D469. **Observations:** #380–#389.
**New since v1 (his words, 30 Sep 26 — "what i heard no plugin for now", from IT, unconfirmed):** no server-side plug-in.
Recorded in `OUTSTANDING.md` `[IT-QUESTIONS]`. It settles `data-model.md` §12 q9 — nothing on the server can write a day,
so a member's input, a delete and a request handed on are worked out on read — and moves "how the lock is made firm"
(D450) to the lock's build (group B) with fewer tools. Phase 6 below no longer waits on q9.
**The design of record:** `raptor-port/docs/data-model.md` §2, §3, §5–§9, §12.

## 0. What group A is for

The IT team is designing its Dataverse tables now from `data-model.md`. Today the app saves a handful of big bundles
(`inputs/all`, `people/all`, `plan/all`, one record per WEEK, `leavewar/wars` with every war and bid, the ledger, the
2,000-line edit log, the account list). Group A makes **every record the app saves correspond to one row of one table in
the design** (§2.5 gives the exact rule and the matrix), adds what decides the tables' shape — one change-log record per
saved action, store-safe deletes, no demo data in a shared store — and fixes the design wherever the code shows it wrong.
Doing it now, against the stand-in database, is how shape mistakes surface BEFORE the tables settle, and it makes the
eventual adapter a thin mapping. Nothing on screen changes.

## 1. What the code is today (verified 30 Sep 26 — three read-only sweeps, direct reads, both reviewers)

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
2. **Deletes come only from a command's own change** — the before→after of the records that command enlisted (an
   input gone from `INPUTS`, a record gone from a Leave War cell's list between the command's before and after), never
   from comparing storage with memory. Legacy writers outside commands (`persistPeople`, the settings adapter) delete
   only by an explicit call. A stored row the app cannot read is kept byte-for-byte, never deleted, never loaded
   (logged once). The stand-in removes a deleted key; the batch item says `op: 'delete'`, from which the adapter writes
   Dataverse's tombstone (group B) — so no reader changes.
3. **Order lives on the row, SPARSE and STABLE.** `ord` (a number): a new row appends at `max + 1024`, an insert takes
   the midpoint, renumbering only when a gap closes and then as its own recorded change; NEVER computed from the array
   position at save. So an `unshift` writes one row, not every row. The undo's `inputs/__order` sets `ord` only on rows
   whose position changed. IT: `Input.sortIndex`, `Person.sortIndex`, `LeaveBid.sortIndex` — decimal.
4. **Keys are the ids the app already treats as identity, or the design's own unique alternate keys.** `iid`, `pid` (a
   handle, never renamed — the callsign is an attribute), `verId~n`, a ledger entry's id, a puck id, a Leave War record's
   `recId`; and the design's declared unique keys — a week's start, (week, day), a remark's date, (person, counter).
   Dataverse upserts by alternate key, so the adapter stays stateless (Astra A-04's GUID-per-row declined; the reason is
   in the dispositions). **A Leave War record is keyed by its `recId`, not its date** — a move changes the date, not the
   row. Keys are parsed from the RIGHT where an id may carry a separator (war ids; `verId` carries `#`).
5. **The mapping rule:** a stored record maps to ONE row — or to one parent row plus its FIXED child rows written in the
   same changeset by a pure field mapping (a person and his granted qualification marks; an issuance and its four
   sign-offs). No record is ever merged from, or fanned out by guessing. The matrix:

| Stored key | Design table (stage 1) | Written by | Order | Notes |
|---|---|---|---|---|
| `weeks/<wk>` | `ScheduleWeek` | persistAll (week first saved; a stamp change) | — | `v`, `am` |
| `weeks/<wk>#<di>` | `ScheduleDay` | persistAll | — | the day and every field naming it, `wo` and `un` slices |
| `weeks/<wk>:is:<verId>~<n>` | `Amendment` + 4 `IssuedSignoff` | publish, unpublish's reissue | — | EVERY issuance incl. the Original (sequence 0); append-only, never rewritten |
| `weeks/<wk>:rx:<verId>~<n>` | `AmendmentRetraction` | unpublish | — | beside its issuance; join rebuilds `als`/`orig`/`retired` |
| `inputs/<iid>` | `Input` + `InputAttachment` | commands via persistAll | `ord` | `docIds` are the fixed children |
| `people/<pid>` | `Person` + `QualMark` | persistAll, persistPeople | `ord` | placeholders (`special`) are code, never rows |
| `plan/pp:<id>` | `PlanningPuck` | commands via persistAll | `sortIndex` | |
| `plan/dm:<iso>` | `DayRemark` | commands via persistAll | — | |
| `leavewar/war:<warId>` | `LeaveWar` | rawPersist | — | the period, its days as JSON |
| `leavewar/rec:<warId>:<recId>` | `LeaveBid` | rawPersist | `ord` within (pid, date) | pid, date, the record |
| `leavewar/ledger:<id>` | `LeaveLedger` | rawPersist | — | |
| `leavewar/opening:<pid>:<counter>` | `LeaveOpening` | rawPersist | — | |
| `leavewar/profile:<pid>` | `LeavePersonProfile` (+ `past` child rows) | rawPersist | — | from `postouts`, `personedits` (band, seat override) and `perslabels`; `sxo` goes to `Person` through the shell's person writer |
| `settings/elog:<lineId>` | `EditLog` | the edit log | `at`, then `lineId` | phase 4 |
| `settings/seen:<pid>` | `EditLogSeen` | the person himself | — | phase 4 |
| `settings/account:<id>`, `settings/accessreq:<id>` | `User`, `AccessRequest` | Admin → Users, sign-up | — | phase 4 |
| `settings/<key>` (templates, rules, stores, …; the Leave War's settings-like keys) | `Setting` | as today | — | unchanged; a `null` set removes the key (F19) |
| `settings/qualcols` | `Setting` (stage 1) | Admin | — | **design corrected:** the column list stays one Setting at stage 1; `Qualification` rows when a report needs them |
| `changes/<batchId>` | `ChangeBatch` | the whiteboard's seal (phase 4) | — | the one new collection; joins `RESET` |
| `settings/booted`, `settings/schema` | — | the boot, the fold | — | not tables — the stand-in's own marks |
| the Tracker's `tracker/v3:*` | `Course`, `Syllabus`, `TrainingEvent`, `Layout`, `Enrolment`, `CoursePlan` | the Tracker | — | **unchanged — his question 2 (§5)** |
| the documents drawer (IndexedDB) | `Attachment` | `docAdd` | — | **excluded until §12 q2** (which file store); its writer is outside every command — named for group B |

6. **Old records are folded once, atomically, triggered by the schema stamp** (Fable F13). `SCHEMA_VERSION` → 6. A store
   below 5 is wiped as today; a store AT 5 is folded: ONE `putMany` through the real backend, before the whiteboard fills
   — every new row, `null` for every old blob, the schema stamp 6 and `settings/booted` — so a crash leaves the old
   world or the new, never half. A store at 6 never looks for old blobs. His preview browser keeps its people, accounts
   and Tracker links (the Tracker keys are untouched).
7. **One saved group = one user action with its causal children = one changeset = one `ChangeBatch`.** The closure
   stays atomic (Astra A-01's per-pipeline split declined — a projection's failure must not leave its root saved). The
   postman keeps its merge (a merged send still carries every batch record, and the pagehide flush stays synchronous);
   **sending each group as its own changeset moves to group B with the adapter** (Fable F3).
8. **"Already booted" is one explicit stamp**, `settings/booted`, written by whoever seeds (in the seed's own group), by
   the fold, and alone by an empty shared store's first boot. `isHydrated()` and `hadStoredWars` both read it. A store
   carrying it is never seeded, whatever else is in it.
9. **The command layer's records follow the storage grain:** `sched.book/<wk>#<di>`, `sched.mutes/<wk>#<di>`,
   `sched.week/<wk>` (`v`, `am`); `weekstash/<wk>#<di>`; `plan/pp:<id>`, `plan/dm:<iso>`; `lw.opening/<pid>:<counter>`,
   `lw.profile/<pid>`; `lw.cell` stays the Leave War's undo address. `LOGICAL_TO_BLOB` rewritten. `undo/derive.ts`
   `sharesKeys`' week-family rule becomes per day.

## 3. The work, in phases (red test first in each; its own suites green before the next)

### Phase 0 — the fold and the boot stamp (the frame every later phase writes into)
`SCHEMA_VERSION` 6; the fold framework (§2.6) with no record types yet; `settings/booted` (§2.8) replacing both sniffs;
the Leave War's `StorageBackend`, `memoryBackend`, `localBackend` and `leavewarAdapter` gain `remove` and `keys` (v1
wrongly said they had them). Tests: a store at 5 folds in one `putMany` and reads as booted; a store at 6 with zero
input rows (every input deleted) reloads with NONE of the demo back, and likewise zero wars; a crash between the fold's
write and the next boot leaves the old or the new world.

### Phase 1 — the schedule one day per piece
1. `src/state/weekrows.ts` (new): `splitWeek(blob)` → week row, seven day rows, issuance and retraction records; and
   `joinWeek`. Placement as §1 and the matrix; `al` dropped; `un` sliced by the day the input would land on (its start,
   clamped into the week). A key or field naming no single day FAILS the split loudly. Missing week row at schema ≥ 6 →
   the stamps default to CURRENT (`RID_BOOK_VERSION`, `AMBOOK_VERSION`); a missing day row → a blank day.
   **Tests first:** split then join equals the original for every retained field, `un` compared as a set — the two demo
   weeks, a week published and amended, one unpublished and reissued, one with drafts and saved plans, one with a
   taken-off input; the key-naming-no-day failure; seven day rows, no week row → editable, ids intact.
2. `persistAll` writes rows through the split, memoised on the stash string (unchanged week = one string compare). A
   week's FIRST save writes the week row and all seven day rows together. The loaded week is written whenever it is
   stashed, dirty, OR any row of it is known to the whiteboard — so an Undo back to pristine reaches storage (F2). The
   reconcile at line 119 goes. Issuance records are written once and never rewritten; an unpublish writes a retraction.
   Read-only protection stays per WEEK: any unreadable day row preserves the whole week byte-for-byte, as today.
3. **Confinement of the incidental other-day writers** (moved here from v1's phase 6(f)): `reconcileIssuedMarks`,
   whole-week `ensureRowIds`, `discardPending`'s scope, load-time re-landing and migrations. For each: read what it is
   for; if its effect on another day is incidental, confine it to the days the command touched; if it is real, it
   becomes a read-time derivation in phase 6 or is named for the lock's build. **Test:** on a week with a published day
   AND a landed input, a Monday edit changes exactly ONE stored day row's string; a drag Monday→Tuesday exactly two.
4. `hydrate` joins rows into the stash; `decompose`, `schedWriteRecords`, `applyBook`, the week-stash store
   (`store.ts:212-237`, `writeStashRecords`) per day; `undo/derive.ts` and the timeline on the new ids; `sharesKeys` per
   day. **Test:** an Undo of Monday's edit is not blocked by a later edit on Tuesday of the same week (today it is), on
   the loaded week and on a week left and returned to. Every `src/undo/*` suite green.
5. `npm run perf` before and after.

### Phase 2 — inputs, people and the planning calendar one row each
`inputs/<iid>`, `people/<pid>` with sparse `ord`; `plan/pp:<id>`, `plan/dm:<iso>`; `persistPeople` writes rows;
placeholders never stored; the settings adapter's `null` set removes the key. Hydrate rebuilds in stored order.
**Tests:** the GAP test "two people editing the SAME blob clobber each other" flips to HOLDS — two clients each file an
input and both survive, and NEITHER client's save changes the other's stored row string; an `unshift` filing writes
exactly one row; client A deletes X while client B (booted earlier) files Y — X stays deleted, nothing of A's is
touched; an unreadable input row survives an edit elsewhere; the Inputs page, Quals and the pickers keep their order
across a reload.

### Phase 3 — the Leave War one record each
`rawPersist` writes per war, per record (`recId`), per ledger entry, per (person, counter), per person profile; unchanged
records skipped by reference equality to the last-persisted state (the war state is immutable-by-path). Boot reads the
rows into `wars[].recs`, the ledger, openings and profiles. `sxo` from person edits through the shell's person writer.
The war writes that today go out OUTSIDE a command (the coalesced idle-reconcile `rawPersist` calls, boot writes before
`LW_READY`) routed into commands, so every war write is in a group with its batch. `LOGICAL_TO_BLOB` corrected.
**Tests:** two clients bidding on different days of one war both survive; an admin's decision and a member's bid on two
records of one person/date both survive; a moved bid is ONE row changed (its date), not a delete and an insert; the
Leave War's store, undo and e2e suites green; `npm run perf` before and after.

### Phase 4 — the change log, the edit log, accounts
1. **`ChangeBatch` at the seal** (Fable F7): the whiteboard gains `setSealer(fn)`; at the outermost commit, after
   computing the net group, it asks the sealer for one more change and appends it to the SAME group. The command layer's
   sealer writes `changes/<batchId>`: `id` (`<clientBootId>-<outermost seq>`), `at`, `actorId`, `type` (the outermost
   command's), `seqs` (every envelope that ran inside the group), `items` (every other key in the group, with `op`; the
   batch does not list itself). Groups sealed outside a command (boot, the fold) carry none. **Test:** a whiteboard
   subscriber asserts every group after boot carries exactly one `changes/` entry whose items equal the rest of the
   group — including a user action that drains two projections (one group, one batch, three seqs).
2. **A stand-in reader, to prove the shape:** a test-only second client reads the batches since its mark, re-reads each
   named row once, and ends with the first client's view (an input, a day, a war record).
3. **The edit log one line per record:** `settings/elog:<lineId>` (`lineId` = `<clientBootId>-<n>`, ordered by `at`
   then `lineId`); the 2,000-line cap becomes "load the newest 2,000"; `settings/seen:<pid>` per person. IT: `EditLog.seq`
   must be assigned by the store (its `changeSeq`), never the client — the stand-in's `lineId` maps to it at the adapter.
4. **Accounts and access requests one row each** (`settings/account:<id>`, `settings/accessreq:<id>`) — two admins adding
   two accounts at once both survive. The auth step (stage 4) replaces how a `User` signs in, not that the app writes
   the rows (D165: the admin creates each person and his account).

### Phase 5 — never seed demo data into a shared store
1. **A boot policy chosen at the composition root** (`main.tsx`), passed to every seeder: `seedDemo` true on Memory and
   Browser by default (tests, dev, e2e, his Vercel preview — unchanged for him); false for a shared store (a constructor
   option on the stand-in, `new MemoryBackend({ seedDemo: false })`; the Dataverse adapter later). The policy decides
   only an UNSTAMPED store's first boot; a stamped store is never seeded (§2.8).
2. With `seedDemo` false: the scheduler's seed singletons emptied in place before anything can save (`INPUTS`, `PEOPLE`
   bar the code placeholders, `DAYS` → a blank week, the demo week bundles); the seed merges, `autoAcceptSeedInputs`,
   `installDemoWorld`'s demo half, the Leave War's seed wars/openings/ledger (empty instead — its settings-like DEFAULTS
   stay, they are defaults), the Tracker's demo pair, and the seed accounts — including `accountsLoad`'s lock-out repair,
   which re-adds the seed admin. The built-in syllabus charts stay (shipped course content, D62). The default course:
   his question 3 (§5).
3. **The first admin of an empty shared store:** the stand-in reads one bootstrap admin from its configuration; the real
   answer goes to IT (`[IT-QUESTIONS]`).
4. **Tests:** a no-seed boot, then a demo boot, in one process, and the reverse; two no-seed boots; a store holding only
   new-shape Leave War rows; a stamped store with an empty war list; the Tracker's migrations under no-seed; account
   lock-out repair under no-seed; and the walk-shaped test: the bootstrap admin visits every page, the Leave War and the
   Tracker — storage then holds only the stamps and what he did.

### Phase 6 — worked out on read (unblocked: no plug-in, so this is the only route)
Rule 9 of the design, smallest first, each its own step with the whole engine suite, `tfin.js` 728/0 and the walk:
(a) a handed-on OIL decision ignored on read — the decision records the input assignment it was made for, else it
reopens the known hand-away-and-back gap; (b) the input landings' pending marks (`inp:`) counted from the filing against
the day's baseline instead of stored marks; (c) an input's landing as a read-time overlay from the `Input` plus the day's
stored decisions keyed by input id (the largest — 18 reader files); (d) a delete by `Person.deletedFrom` filtered on
read instead of rewriting every stored week. `[OIL-RELINK-XWEEK]` goes with (c). §12 q9's reporting half still goes to
IT (they confirm, they do not choose).

### Phase 7 — the small OIL follow-ups (D147, D453 "with")
`[OIL-READ-LEFTOVERS]` 1, 2, 4; `[STORE-READER-SWEEP]`; `[OIL-REQ-NAMEBOX]` (a walk question for him first); `[OIL-WORDS]`;
`[OIL-PERSONAL-PLACEHOLDER]` (FULL); `[CROWD-SIM-BRIEF]` (WALK). Behaviour, not shape — last, and never holding the shape
work: if IT's tables settle first, phases 0–5 are what must be in.

## 4. Documents fixed in the same change (D201)

`data-model.md`: §6's `FanOutBackend` sentence; §3's field placement (`rt` keyed by version, split by its `di`; `o` is
issuance sequence 0 → `Amendment`, not a day-row field; `a` → `Amendment`; `un` a day-row field keyed by input id);
§5 the field map rewritten to the matrix above (the `dayOK`/`cur`/`orig` row corrected); `sortIndex` on `Input`, `Person`,
`LeaveBid` (decimal); `LeaveOpening` per (person, counter) confirmed; `LeavePersonProfile`'s sources; `Qualification` a
Setting at stage 1; `ChangeBatch.items` and "one batch per saved group" as built; `EditLog.seq` store-assigned;
"Admin → Data's clear of a week" (§3, §7) marked as a future command (nothing does it today); §12 q8 and q9 with the
"no plug-in" news. `data-schema.md` (the as-is map) to the new keys. `schema.ts` `SchedFields` gains `rt`, `cr`; the
"FOURTEEN fields" comments. `weekstash.ts` / `persist.ts` comments about the Admin sweep (no caller). `LOGICAL_TO_BLOB`.
`docs/file-map.md`. `handover-dataverse.md` §what we do on our side. `[IT-QUESTIONS]`: the first admin; `sortIndex`; the
alternate keys (§2.4); `EditLog.seq`; plug-ins only, or Custom APIs and Power Automate flows too.

## 5. What this plan needs from him (product or scope — not technical)

1. **§12 q9 to IT, as a confirmation** (no plug-in leaves one route): "reports read the published versions plus the leave
   and people tables — any problem?" Nothing waits on it.
2. **The Tracker — include it?** Its courses, charts, layouts and enrolments are Tracker records today (one per course
   and chart for the marks); two instructors marking two different students of the same course at the same moment would
   overwrite one another once shared. My recommendation: **yes — a phase that saves one record per student's marks and
   dates**, because the `Enrolment` table IT builds now would carry them.
3. **An empty real database: should the Tracker start with a course already made?** Today a fresh Tracker creates one
   named "26ABSG". My recommendation: no demo-named course — the first person to open the Tracker adds the course.
4. **When do IT's tables settle?** (D453.)

## 6. Checks (FULL tier, `raptor-port/docs/bug-check-order.md`)

- Red tests first per phase; the full gate set once per phase under the PC lock (D228): unit, build, `tfin.js` 728/0,
  e2e, smoke, `npm run perf`; `rulecheck`, `docsize`.
- **Roll-call before the walk:** every place the app SAVES — each writer of each record — one row each: has its per-row
  path / must not, because… / MISSING. The matrix and §1 are its first draft.
- **The walk** (a real browser on `vite preview`, the Browser backend), a reload and a picture after each:
  file / edit / delete an input; file two in a row (one stored row each); add / archive a person; a planning puck and a
  day title; edit two days of one week; edit, Undo to pristine, reload; a week with a PUBLISHED day — edit another day,
  Unpublish, publish again (a reissue) — the issued versions, the four names and the history intact after each reload;
  bid / decide / move / delete on the war; an OIL award; undo and redo each; three quick edits then an immediate reload;
  delete every input, reload (no demo back); orders before and after reload (Inputs page, Quals, the pickers, a Leave
  War cell with two records); two tabs on different records (both survive); a browser holding the OLD shape (fold,
  nothing lost); a week's rows with its week row removed by hand (editable, ids intact); the stand-in shared store
  (nothing seeded). Evidence sheet with pictures in `raptor-port/docs/handpass/`.
- **Then** both reviewers read the code (persistence — D353), given the evidence sheet (D11).
- **Excluded from every reviewer's brief (D56):** a problem living only in data already stored, when the code is correct
  going forward. The fold must not break a load (D401); it need not preserve quirks of old demo records.

## 7. Risks, said plainly

- **Undo** is the most fragile consumer — its record ids change in phase 1; every undo suite stays green and the walk
  undoes after every step.
- **The other-day writers** (phase 1.3) are engine code; each confinement is checked against `tfin.js` 728/0.
- **Order** — a missed order-dependent reader shows as a list in a different order after reload; phase 2's tests and the
  walk compare orders.
- **Phase 6 (c) and (d)** touch the engine's readers; the largest items in group A.
- **Time.** Phases 0–5: several sessions of building plus a FULL check. Phase 6: as long again. Phase 7: one batch.
