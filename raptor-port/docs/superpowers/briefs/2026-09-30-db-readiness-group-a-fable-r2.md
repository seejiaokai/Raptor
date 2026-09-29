# Red team — [DB-READINESS] group A plan, round 2 (Fable 5.1, 30 Sep 26)

Reviewed read-only: plan v2 (`docs/superpowers/plans/2026-09-30-db-readiness-group-a-plan.md`) against v1 (commit
e2368d9f), the dispositions (`…-dispositions-r1.md`), both round-1 reports, `data-model.md` §2, §3, §5–§9, §12,
`OUTSTANDING.md` `[DB-READINESS]` / `[IT-QUESTIONS]`, the full rows of D453, D401, D165, D148, D450, D56, D354–D356,
D120, D22, D144, and the code every claim below cites (`command/commit.ts`, `storage/*`, `state/persist.ts`,
`state/store.ts`, `state/sched-commit.ts`, `state/history.ts`, `state/people-settings-commit.ts`, `state/accounts.ts`,
`state/changes.ts`, `state/plan.ts`, `engine/editlog.ts`, `engine/publish.ts`, `engine/hooks.ts`, `engine/newid.ts`,
`engine/weekstash.ts`, `undo/derive.ts`, `leavewar/state/{store,storage,demoworld}.ts`, `leavewar/engine/warrecs.ts`,
`main.tsx`, `tracker/app/core.js`). D56 applied: nothing below is about data already stored.

v2 is a much better plan than v1: the record-level split, the stamp, the sealer, the append-only issuances, sparse
`ord`, the matrix and the per-day command grain are all right. What follows are the places where an accepted fix is
not yet complete, one declined reason that has a hole, and what v2 introduced that will fail its own tests.

---

## 1. The ACCEPTED round-1 findings — is each v2 fix correct and complete?

| Finding | v2 fix | Verdict |
|---|---|---|
| F1 boot stamp | §2.8, phase 0 | Correct. INCOMPLETE on one point — F2-06 below (a future wipe must remove the stamp). |
| F2 undo to pristine | phase 1.2 | Correct and complete. |
| F3 queue → group B | §2.7 | Correct. |
| F4 missing week row | phase 1.1 | Correct and complete. |
| F5 sparse `ord` | §2.3 | Correct in principle; INCOMPLETE — F2-04 (where `ord` is assigned, the unshift rule, the split-with-pieces writers). |
| F6 edit log | phase 4.3 | INCOMPLETE — F2-01 (the line is written outside the command's group, so phase 4.1's own test fails) and F2-02 (per-client line ids break "seen"). |
| F7 sealer | phase 4.1 | Correct. The test needs the exemption list of F2-03, and `clientBootId` does not exist yet (mint one per page life with `newId('c')`, `engine/newid.ts:14`). |
| F8 a Original as issuance 0 | §2.5 | Correct. |
| F8 b parent + 4 children | §2.5 | Correct (see §2 below). |
| F8 c append-only + retraction | §2.5 | Correct; `~n`'s rule is undefined — F2-10. |
| F8 d openings per (person, counter) | §2.5 | Correct. |
| F8 e profile | §2.5 | Correct for band / windows / label; the `sxo` half opens a new seam nobody has named — F2-09. |
| F8 f placeholders | §2.5 | Correct. |
| F9 tables with no records | §2.5 | Correct. |
| F10 one-day-write test; `un` | phase 1.1, 1.3 | Correct. |
| F11 split cost | phases 1.2, 3 | Correct (the memo helps stashed weeks only; the loaded week is split on every history step — `npm run perf` is the right gate). |
| F12 per-week read-only | phase 1.2 | Correct as a rule; INCOMPLETE as a mechanism — F2-08 (there is no single blob to preserve any more). |
| F13 fold atomicity + trigger | §2.6, phase 0 | Correct in substance; one boot-order hole — F2-11. |
| F14 LW adapter remove/keys | phase 0 | Correct. |
| F15 seed as a boot option | phase 5.1 | Correct. |
| F17 key grammar | §2.4 | Correct. |
| F18 sharesKeys per day | phase 1.4 | Correct. |
| F19 null settings | phase 2 | Correct. |

## 2. The DECLINED / PARTLY ACCEPTED — is the reason sound?

- **A-01 (one durable group per command) — the decline is sound.** The whiteboard group is the atomic unit by
  construction: the outermost dispatch opens ONE transaction and commits it after `drainQueue()` (`command/commit.ts:169-180`);
  the whiteboard emits the net change as one group (`storage/whiteboard.ts:134-146`). Splitting per pipeline would let a
  drained projection's failure leave its root committed — exactly what §20.1 exists to prevent. Batch-per-group with
  `seqs` listing every envelope is the honest record. One caveat to write down: a `user`-origin commit raised during
  delivery is enqueued into the SAME group but is its own undo entry (`commit.ts:188-194`) — the batch's `type` names
  the outermost only; `seqs` carries both. Say so in §2.7; no change of design.
- **A-04 (GUID row ids) — the decline is sound, with ONE concrete hole the plan must close: F2-07.** Every key v2
  relies on is either collision-resistant across clients (`iid` and `rid` via `newId`, `engine/newid.ts:14`; a war
  record's `recId`, `warrecs.ts:127-131`; a ledger entry `ledgerId()`, `leavewar/state/store.ts:3440`; an account id,
  `accounts.ts:249`; a new person's pid, `roster-add.ts:118`) or a declared unique natural key. Except the planning
  puck: `plan.ts:49-51` mints `'pp' + (++PPN)`, a per-browser counter seeded from the largest stored id
  (`persist.ts:77`). Two clients booted from the same store both mint `pp<max+1>`, and under `plan/pp:<id>` the second
  save overwrites the first — a real clobber in new data, on the very table phase 2 flips the GAP test for.
- **A-06 (empty in place vs fresh state) — the decline is sound for production but contradicts the plan's own
  phase 5.4 test: F2-05.** Emptying the module literals in place is what `hydrate` does today (`persist.ts:54, 62,
  73-76`) and is fine for one page life. But phase 5.4 promises "a no-seed boot, then a demo boot, in one process":
  once `INPUTS`, `PEOPLE`, `DAYS` and the week bundles have been emptied in place, the demo boot in the same process has
  no seed left to load. One of the two must give.
- **F8 b (sign-offs as fixed children) — sound.** `sign:{[di]:{cur,sked,plan,appr}}` (`publish.ts:1078`; the Original
  the same shape, `publish.ts:338`) maps by a pure field mapping to four `IssuedSignoff` rows unique on
  (`amendmentId`, `role`) — the design's own shape (`data-model.md` §Sign-offs). No design change needed.

---

## 3. What v2 introduced that is NEW and wrong or missing

### F2-01 — HIGH — phase 4.1 / 4.3: the edit-log line is written OUTSIDE the command's group, so "every group after boot carries exactly one `changes/` entry" fails on every logged edit — and a history line is never named by any batch

**What is wrong.** `logEdit`/`logAction` → `push` defers `keep` into the command's phase 8 (`editlog.ts:330-338`,
`setElogDefer(deferEffect)` at `store.ts:779`); `keep` calls `queueSave()`, which is a MICROTASK (`editlog.ts:121-125`).
The dispatch is synchronous and commits the whiteboard transaction in its `finally` (`commit.ts:179`) before any
microtask runs, so `elogFlush` → `store.set('elog', …)` always lands AFTER the group closed. And `elog` is not one of
`SETTINGS_KEYS` (`people-settings-commit.ts:62-72`), so the settings write hook writes it RAW (`:278`): a whiteboard
`set` outside any transaction → its own one-entry group (`whiteboard.ts:78`) with no batch. Phase 4.3's per-line
records change the key, not the timing. Consequences: (1) phase 4.1's test fails on the first edit; (2) if the builder
"fixes" the test by exempting `elog:` groups, no history line is ever in a batch — the 30-second check (design §9, the
change log: "every write the app makes … has its batch") never learns of another person's lines, so the changes window
(D169, D170's "new to you") only updates on reload.

**Exact fix.** In phase 4.3:
1. Write each line AT `keep` (`editlog.ts:331`): `store.set('elog:' + lineId, row)` (raw is right — the settings
   store's enlistment does not want 2,000 dynamic keys; the whiteboard group carries it and the sealer lists it).
   Inside a command `keep` already runs at phase 8, inside the transaction — the line lands in the command's group.
   Outside a command (`undo()`/`redo()`'s `logAction`, `history.ts:142-143`; `commitDiscardPending`'s `logAction`
   after `isOk`, `sched-commit.ts:572`) the write is its own group: route those two through the command that caused
   them (the undo timeline's restore command; the discard command) or accept them as the batch-less groups they are
   and NAME them in the test's exemption list.
2. Delete `queueSave` / `SAVE_QUEUED`; `elogFlush` becomes a no-op (keep the export for `resetSession`).
3. The 2,000 cap: at `keep`, when the count exceeds the cap, delete the oldest key in the same write (one more entry
   in the same group) — never a rewrite of 2,000 keys.
4. The test: an edit that logs a line → the group has ONE batch whose `items` include the `settings/elog:<lineId>`
   key.

### F2-02 — MEDIUM — phase 4.3 / 4.4: per-client line ids have no total order, and three consumers assume one monotonic integer per browser

**What is wrong.** `seq` today is `ELOG.next++` (`editlog.ts:332`). Consumers: `changeseen.upto` / `extra`
(`changes.ts:60`, the walk at `:75-79` "the log is kept in number order"), `Account.seenFrom = ELOG.next`
(`accounts.ts:278, 320`; read at `changes.ts:24-27, 59`), and `elogWeekRows().reverse()` (`editlog.ts:110`). With
`lineId = <clientBootId>-<n>` two clients' `n`s mean nothing to each other, so "seen up to N" is undefined, and a
member given access after the history began (`seenFrom`) starts with everything or nothing. Phase 4.3 says "ordered by
`at` then `lineId`" for the rows but not what `upTo`, `extra` and `seenFrom` become — and `EditLogSeen.upTo` is a
column IT is building now (the design says "every line numbered up to it").

**Exact fix.**
1. Define the stand-in's line order ONCE: `(at, lineId)` ascending, ties by `lineId`. `elogLoad` sorts by it; the
   window reads the sorted list.
2. `settings/seen:<pid>` = `{ upto: { at, lineId } | null, extra: lineId[] }`; `isNewToMe` compares by the same order;
   `markSeen`'s fold walks the sorted list.
3. `Account.seenFrom` = `{ at, lineId }` of the newest line at the moment the account was made (or the boot's clock
   with a `''` lineId — "nothing before now").
4. §4: `EditLogSeen.upTo` and `User.seenFrom` become "the position in the log's order", stated as `(at, lineId)` in the
   stand-in and the store's `changeSeq` once assigned; `[IT-QUESTIONS]` gains: "`EditLog.seq` = your `changeSeq`,
   store-assigned; the client orders by `(at, lineId)` until then".

### F2-03 — MEDIUM — phase 4.1's test will meet groups written after boot by NO command; the plan names only boot and the fold

**What is wrong.** "Groups sealed outside a command (boot, the fold) carry none" — but these fire after boot:
- **A week switch.** `loadWeek` is not a command (callers: `board.ts:1844-1866`, `interactions.ts:544, 1297`,
  `pan.ts:185-186`, `GuestApp.tsx:51`). It stashes the week being left (`store.ts:627`) and `weekSwapEnd()` runs
  `persistAll()` (`persist.ts:129`; `store.ts:692`) — outside any transaction. The arriving week's re-landing
  (`applyWeekModel` → `relandInputs`/`autoAcceptSeedInputs`, `store.ts:589-598`) writes ground rows into its days, so
  after another client files an input for that week, the first history step — or that very persist — changes a day
  row with no command behind it. Until phase 6 (c) makes the landing read-time, this is a real write.
- **The Leave War's coalesced idle writes** (`store.ts:1296` raw `rawPersist()` on the second cell of an idle turn,
  outside the turn's projection) — phase 3 routes these; say the sealer test is run only AFTER phase 3, or it fails.
- **The Tracker's first-mount seed and migrations** (`core.init()` runs on the tab's first mount, not at app boot —
  `tracker.md` §Architecture; `applyBundle` `core.js:5515-5519`) — raw writes long after boot.

**Exact fix.** Phase 4.1 lists every writer that reaches the whiteboard outside a command after boot, with one
disposition each: `loadWeek` → wrap `weekSwapEnd`'s persist and the leave-stash in a `commitProjection` of type
`sched.load` (system actor; it is the one place the plan's own §1 "load-time re-landing" writer lives, and phase 1.3
already targets it); the Leave War's idle raw writes → phase 3 (already); the Tracker's first-mount seed/migrations →
exempt by name (a boot in its own world), and `settings/booted`-style: they run once. The test then asserts "exactly
one batch" for every group EXCEPT the named ones, which it asserts carry zero batches AND touch only their own keys.

### F2-04 — MEDIUM — §2.3 / phase 2: where `ord` is assigned, and the head-insert rule

**What is wrong.** (1) §2.3 says `ord` is "NEVER computed from the array position at save" but not WHERE it is
assigned. If `persistAll` assigns it, the command layer's lagging baseline never sees it (`sched-commit.ts:65-71`), so
the NEXT command's diff absorbs the `ord` change as its own (the SR-006 class, `:78-83`) and an Undo of that later
command would also undo the order. (2) "A new row appends at `max + 1024`" — but the Inputs page and the input editor
`unshift` (`InputsPage.tsx:480, 538`; `inputedit.tsx:855`; `probe-bridge.ts:174`): a head insert has no left
neighbour. (3) Writers that replace one row with several in place — the clash gate splitting a leave around a medical
(`leavewar/inputgate.ts:169`), the sync's slicing (`leavewar/sync.ts:390-391, 449-451, 593`) — need the pieces to take
midpoints between the replaced row's neighbours, or they land at the end after a reload.

**Exact fix.** `ord` is minted in `applyEnd()` beside `mintInpIds()` (`sched-commit.ts:360-364`) and in the people
store's `advancePeople`: every row without an `ord` takes one from its CURRENT neighbours — first row: `min − 1024`;
last: `max + 1024`; between: the midpoint; a run of new rows between two neighbours: evenly spaced. Rows that already
carry one are never touched. So an unshift writes one row; a split writes the pieces only. Hydrate sorts by `ord`
(ties by `iid`, so two clients' equal midpoints still read the same everywhere). `inputs/__order` on `write()` sets
`ord` only on rows whose neighbours changed, by the same rule.

### F2-05 — MEDIUM — phase 5.2 vs phase 5.4: the declined half of A-06 contradicts the plan's own test

**What is wrong.** Phase 5.2 empties the seed literals in place; phase 5.4 tests "a no-seed boot, then a demo boot, in
one process, and the reverse". After the first no-seed boot the seed is gone from the process. The disposition's
defence ("vitest isolates modules per test file") is true but means that test cannot exist as written.

**Exact fix — pick one and say which.** (a) Keep a frozen deep copy of each seed literal at module load
(`SEED_INPUTS`, `SEED_PEOPLE`, `SEED_DAYS`, and `weekBundle`'s authored weeks) and give `initStore(policy)` a
`restoreSeed()` step for the demo policy — a few lines, and it also makes a `?fresh=1` boot in the same process
honest; or (b) drop the in-process pair from 5.4 and run each policy under `vi.resetModules()`, stating that a page
life has exactly one policy. I prefer (a): it costs nothing at runtime and removes a process-order trap for ever.

### F2-06 — MEDIUM — §2.8 / phase 0: a future schema wipe leaves `settings/booted` standing, so his preview boots EMPTY after the next reset

**What is wrong.** `RESET` is `['inputs', 'weeks', 'leavewar']` (`reset.ts:55`); `settings` is kept. Today a wipe
re-seeds because the sniffed blobs are gone. With the stamp, a store at 6 wiped by a future bump to 7 (D22 makes
resets the usual path) keeps `settings/booted`, so nothing seeds: an empty schedule, no inputs, no wars on every
returning browser of his — and on the Browser backend the demo is the whole point.

**Exact fix.** `resetPreSchema`'s wipe branch also removes `settings/booted` (one line, in the same durable sweep
before the stamp is written). Test: a store at 6 with the stamp, bumped to 7 → after the wipe it seeds again. And say
in §2.8 that the stamp is a RESET-class mark, never a Setting the design carries.

### F2-07 — HIGH — §2.4 / phase 2: `plan/pp:<id>` ids are a per-browser counter, so two clients' pucks collide

**What is wrong.** `nextPuckId()` = `'pp' + (++PPN)` (`plan.ts:49-51`), `PPN` seeded at hydrate from the largest stored
id (`persist.ts:77`). Two clients booted from the same store mint the same next id; under `plan/pp:<id>` the second
save overwrites the first puck, silently, and the stand-in reader (phase 4.2) cannot tell. This is the one key in the
matrix that is neither random nor a declared natural key — the hole in A-04's otherwise sound decline.

**Exact fix.** Phase 2: `nextPuckId()` = `newId('pp')` (`engine/newid.ts`), `seedPuckCounter` and `PPN` deleted;
existing ids are left as they are (unique within one browser; the fold does not renumber — D56). Test: two clients
each add a puck on the same date → two rows, both survive after either client's save. `[IT-QUESTIONS]`: `PlanningPuck`
is keyed by the app's `id` (an alternate key), like `Input.iid`.

### F2-08 — MEDIUM — phase 1.2: "preserves the whole week byte-for-byte, as today" has no mechanism once a week is rows

**What is wrong.** Today preservation keeps ONE string under ONE key (`weekstash.ts:75-79`; written back verbatim at
`persist.ts:99, 104-109`; classified in `applyWeekModel`, `store.ts:506-560`). After phase 1 a week is a week row,
seven day rows and its issuances; an unreadable day row has no single blob to freeze, and `applyWeekModel` now sees a
JOINED blob that `joinWeek` built — the classification (unreadable / unsupported) must run on the rows, before the
join, or a damaged row is folded into a readable-looking week and overwritten on the next save.

**Exact fix.** `PRESERVED` becomes `wk → Map<rowKey, string>` — every `weeks/<wk>…` key of that week as read at boot;
`hydrate` classifies per week (any row unparseable, or the join classifying `unsupported`) and stores the raw row
strings; `persistAll` writes those strings back verbatim for a preserved week and never the join; `stashDrop` drops
the map; `preservedBlob()`'s callers (`store.ts:559, 627`; `persist.ts:99, 108`) take the map. The rest of F12 stands:
the week stays read-only as a whole.

### F2-09 — MEDIUM — §2.5 (`leavewar/profile`), phase 3: `sxo` "through the shell's person writer" is a FIFTH seam across the Leave War boundary, unnamed

**What is wrong.** The war's own admin sheet flips `sxo` today (`PersonSheet.tsx:66-70` → `setPerson`,
`leavewar/state/store.ts:1536-1552`) and stores it as a war-side override (`personedits`, read at `:603-616`). The
design already says the `seat` override is dropped and `sxo` folds onto `Person` (§5). Making the war's tap write
Raptor's `PEOPLE` is a behaviour change and a new seam (`leave-war.md` §Architecture: four seams, "don't add a fifth
casually"), with a permission consequence (`QualMark` is admin-only in §11 — fine, the war's admin IS the admin, but
it must be the one perms.ts answer, D200 (3)).

**Exact fix.** Phase 3 states it: the SXO chip calls `commitPeopleEdit` (`people-settings-commit.ts:258-262`) to set
`PEOPLE[pid].sxo`, the projection then carries it back (`reprojectRoster`); the war's `seat`/`sxo` overrides are no
longer written or read (band stays in the profile); `leave-war.md` §Architecture names the seam beside the
`restoreArchivedPerson → setPostOut` precedent; the rulings sweep asks nothing of him (the design already rules it).

### F2-10 — LOW — §2.5: `<verId>~<n>`'s rule is undefined, and today's `rt` keys start at `~1`

`nextRetiredN` returns `max + 1` (`publish.ts:1138-1142`), so a first retraction is `<verId>~1`; v2's matrix keys
EVERY issuance `~n` without saying what `n` is for a live one. Define: `n` = the number of retractions of that
`versionId` at the moment it is issued (0 first); the retraction of `is:~n` is `rx:~n`; `joinWeek` rebuilds
`SCHED.retired[<id>~<n+1>]` from `is:~n + rx:~n` so the in-memory keys stay as today, and the round-trip test states
that mapping.

### F2-11 — LOW — phase 0: the fold boot and an unfinished group from before the upgrade

`bootStorage` filters an unfinished group to the collections a WIPE keeps and rewrites the journal whenever
`resetDue(snap)` (`boot.ts:22-27`), then `resetPreSchema` wipes below `SCHEMA_VERSION` (`reset.ts:84-93`). Both key
off one predicate. At 5 → 6 the fold must NOT filter (those entries are data — already overlaid on `snap` by `loadAll`,
`browser.ts:61-64`, so the fold reads them), and the fold's own `putMany` overwrites the journal key: if it then fails
mid-way, the pre-upgrade group's kept entries survive only in the dead page's postman. Fix: two predicates (`wipeDue`
< 5, `foldDue` == 5); at a fold boot skip the journal rewrite, let the fold's group be the superset, and `unfinished()`
reports null after it lands. Add to phase 0's tests: "an unfinished group + the fold, crash after the fold's journal
write → next boot has the new world including that group's values".

### F2-12 — LOW — three small things to say plainly

- Phase 6 is "unblocked" on a report he heard and IT has not confirmed. Read-time is safe under either answer, so
  building it is not wrong — but mark it PROVISIONAL and put "confirm no plug-in in writing" at the top of
  `[IT-QUESTIONS]` before phase 6 starts, so nobody later reads v2 as IT's word.
- §2.2 calls `persistPeople` "a legacy writer outside commands". It is not: every roster write is a `people.edit`
  command (`people-settings-commit.ts:244-246`); the raw `persist.ts:123` has no other caller. Correct the sentence
  (it matters because §2.2's delete rule is stated per writer class).
- Phase 4.4: two admins adding an account for the SAME person at once now yield two rows; `accountsLoad` keeps the
  first by key order (`accounts.ts:127`) — arbitrary. Say: the older (`createdAt`) wins and the other is dropped with a
  logged line; the design's `personId` unique index makes the store refuse the second in group B.

---

## Walk and test gaps in v2 (§6)

Add, each with a reload and a picture: (1) two tabs, each adds a planning puck on the same date → both remain
(F2-07); (2) an edit on client A, the stand-in reader on client B → B's changes window shows A's history line without a
reload (F2-01); (3) a week switch onto a stored week after another client filed an input for it → the sealer test's
group has a batch, or is on the named list (F2-03); (4) a schema bump on a stamped store → the demo is back (F2-06);
(5) a store with one hand-damaged DAY row → the whole week read-only, every other row's bytes untouched after an edit
elsewhere (F2-08); (6) the Inputs page: file (an unshift), then file another → exactly one `inputs/` row changed each
time, order kept after reload (F2-04).

## Sequencing

Unchanged from round 1 except: phase 4.1's sealer test cannot go green before phase 3 (the Leave War's raw idle
writes) and before F2-01 / F2-03 are built — say so in phase 4's opening line, or build 4.1 last within phase 4.

---

## Verdict: REVISE

Round 2 of 3. Nothing here reopens a decision; each is a missing mechanism or a test the plan sets itself up to fail.
The three that matter most:
- **F2-01** — the edit-log line is written after the command's group closes (a microtask, raw path), so phase 4.1's
  test fails on the first edit and no history line is ever in a batch; write it at `keep`, inside the command.
- **F2-07** — planning-puck ids are a per-browser counter, so two clients' pucks collide under `plan/pp:<id>`; mint
  them with `newId`.
- **F2-02** — per-client line ids leave "seen", `seenFrom` and the log's order undefined; define the `(at, lineId)`
  order and the seen shape, and tell IT.
