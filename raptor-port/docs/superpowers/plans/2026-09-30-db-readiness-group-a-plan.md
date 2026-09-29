# [DB-READINESS] group A — the table-shaping half (plan, 30 Sep 26)

**Branch:** `claude/db-readiness-table-shaping-4094f6` (cut from `main` at the day-lock merge, PR #475).
**His order:** D453 (29 Sep 26) — group A lands BEFORE the IT team settles its tables; group B after the app is connected.
**Tier:** FULL (saved data). **Reviews:** this plan red-teamed by BOTH Fable and Astra (D353); the finished code read by
both (persistence). **Rulings range for this chat:** D460–D469. **Observations:** #380–#389.
**The design of record it builds toward:** `raptor-port/docs/data-model.md` §3 (ScheduleWeek, ScheduleDay at stage 1,
PlanningPuck / DayRemark, Input, Amendment, the Leave War tables), §5 (the field map), §7 (the multi-user rules), §9 (the
day lock, rule 9, the change log), §12 q9.

## 0. What group A is for, in one paragraph

The IT team is designing its Dataverse tables now from `data-model.md`. Today the app saves a handful of big bundles
(`inputs/all`, `people/all`, `plan/all`, one record per WEEK, `leavewar/wars` holding every war and every bid,
`leavewar/ledger`). Group A makes **every record the app saves correspond to exactly one row of one table in the
design** — one per input, person, planning puck, day remark, Leave War record, ledger entry, and the schedule one row
per DAY plus a small week row — and adds the pieces that decide the tables' shape: one change-log record per command, no
save path that deletes records it does not own, and no demo data in a shared store. Doing it now, against the stand-in
database, is how shape mistakes surface BEFORE the tables settle (a missing order column, a field that names no single
day), and it makes the eventual adapter a thin one-to-one mapping. Nothing on screen changes.

## 1. What the code is today (verified 30 Sep 26 — three read-only sweeps plus direct reads)

- **Storage path.** Every durable write lands on the whiteboard (`src/storage/whiteboard.ts`) as `collection/id → JSON
  string`; the command layer (`src/command/commit.ts`) opens ONE whiteboard transaction per outermost command, so a
  command's net change reaches the postman as one group; the postman (`src/storage/postman.ts`) MERGES consecutive groups
  (300 ms coalesce) into one `putMany`.
- **The scheduler's saver** is `persistAll()` (`src/state/persist.ts`), run on every history step: it rewrites
  `inputs/all`, `people/all`, `plan/all`, every stashed week and the loaded week (only once dirty), then **deletes every
  stored week nothing local backs** (line 119) — the reconcile.
- **The command layer is already finer than storage.** `decompose()` (`src/state/sched-commit.ts`) yields
  `days/<wk>#<di>` per day, `sched.orig/<wk>:<di>`, `sched.als/<wk>:<verId>`, `sched.retired/<wk>:<verId>~<n>`,
  `inputs/<iid>` (+ an explicit `inputs/__order`), but ONE `sched.book/<wk>` and ONE `sched.mutes/<wk>` per week and ONE
  `plan/all`. The Leave War's `lwDecompose` yields `lw.war/<id>`, `lw.cell/<war>:<pid>:<date>` (the record LIST at an
  address), `lw.ledger/<entryId>`, and coarse singletons. `LOGICAL_TO_BLOB` (`src/command/registry.ts`) maps them onto
  the big physical blobs — and is stale in places (`leavewar/balances`, `leavewar/config` do not exist; `lw.bid` is
  produced by nothing).
- **The persisted week** (`weekStashSnap()`, `state/store.ts:460`) is `{ d, …schedFields(), wo, un }` — 16 book fields.
  All but four split cleanly by day: `d`, `ok`, `sg`, `sb`, `o`, `cv`, `dr`, `cd`, `cr` by day index; `c`, `p`, `ad` by
  the slot key's leading day (`keyDay()`); `wo` by the mute key's leading day. The four: **`a`** (`SCHED.als`, one array
  for the week — each record carries `di`/`iso`, and the design never says where it goes), **`rt`** (`SCHED.retired`,
  keyed `<verId>~<n>`, NOT by day index as §3 says — splits by `entry.di`), **`al`** (no reader — drop), **`un`** (a flat
  list of input ids, names no day — the design already moves it out), plus the stamps `v`, `am` (week-wide).
- **Order matters and the design has no column for it.** `INPUTS` order is meaningful (the command layer records
  `inputs/__order` for exactly that reason, CMDLF-010); `PEOPLE` is iterated by key order at 27 sites; a Leave War
  cell's record list is ordered. Per-row storage loses any order not carried on the row.
- **Demo seeding.** A fresh store is filled on its FIRST boot with no user action: `persistAll` writes the seed
  `INPUTS` (the demo rows plus the Leave War's demo absences it pushed in) and `PEOPLE`; the Leave War writes its seed
  wars / openings / ledger at its first write; the Tracker writes a default course and the demo pair `STUDENT A/B`;
  accounts persist the seed list on the first account edit. The only notion of backend kind is `chooseBackend()`
  (Memory for tests/dev/`?fresh=1`, Browser for a built site). ~340 e2e tests, the Tracker smoke, `tfin.js` and ~157
  unit files depend on the seed — it must stay for them.
- **Writers that touch days they were not asked to** (these matter for the day lock later; see §3 phase 6):
  `reconcileIssuedMarks` (every published day, on every board/text edit), `ensureRowIds(DAYS)` (whole week),
  `discardPending` (every unpublished day), week load re-landing inputs into days (`relandInputs`,
  `autoAcceptSeedInputs`) and the format migrations at load, `person-delete.ts` (every stored week), `clearOilPersonDecisions`
  (every stored week), a drag from one day to another (two days — legitimate).

## 2. The decisions this plan makes (technical — mine to make, stated for the reviewers)

1. **Split at the RECORD level, not in a backend fan-out.** `data-model.md` §6 stage 1 describes a `FanOutBackend` that
   splits the big records behind the postman so "the whiteboard never learns the difference". I recommend the opposite:
   the app's own records become the rows (`inputs/<iid>`, `people/<pid>`, …). Why: a fan-out must diff whole blobs to
   guess which rows changed and which were deleted — the same "infer intent from whole records" the design's §3
   forbids for the schedule ("the adapter does not infer intent from whole records") and the root of the reconcile bug;
   per-row records let a version sit beside each key, keep the whiteboard's per-command group equal to the command's
   changeset, and make the adapter a mapping. §6's text is corrected in the same change (D201).
2. **No save path deletes a record it did not itself remove.** Deletes come from what THIS client last saved or loaded
   and no longer has (a per-collection "known keys" set kept by the saver), never from "what storage holds that I do
   not" — so the week reconcile goes, and no per-row reconcile replaces it. A week leaves storage only by an explicit
   command.
3. **Every row that has an order carries it.** Inputs, people and Leave War records gain a stored order value written
   on the row (`ord`, a number; new rows append past the largest known), read back in that order on hydrate. This is a
   SHAPE finding for IT: `Input`, `Person` and `LeaveBid` need a `sortIndex` column (`PlanningPuck` already has one).
4. **Old blobs are folded, not wiped.** A returning browser holding `inputs/all`, `people/all`, `plan/all`, whole-week
   records or `leavewar/wars` / `ledger` is converted to rows once at boot (idempotent: split, write rows, remove the
   blob, all in one all-or-nothing group through the real backend before the whiteboard fills — the `resetPreSchema`
   pattern). It is a few lines per record and keeps his preview browser's accounts, people and Tracker links intact;
   D56 means no reviewer should chase edge cases in old demo data beyond "a load never breaks" (D401's standard).
5. **Stored keys** (the existing collections, plus ONE new one for the change log — phase 4):
   `inputs/<iid>` · `people/<pid>` · `plan/pp:<id>`, `plan/dm:<iso>` · `weeks/<wk>` (the week row: `v`, `am`) and
   `weeks/<wk>#<di>` (the day row) and `weeks/<wk>:al:<verId>` (an issued version), `weeks/<wk>:rt:<verId>~<n>` (a
   withdrawn issuance) · `leavewar/war:<warId>` (the period), `leavewar/rec:<warId>:<pid>:<date>:<recId>`,
   `leavewar/ledger:<entryId>`, `leavewar/opening:<pid>`, `leavewar/postout:<pid>`, `leavewar/personedit:<pid>`, the
   settings-like keys unchanged. Each maps to one table row in §5 of the design, which gets the exact field map.
6. **The command layer's records follow the same grain** (design §3 "the same grain above the store"): `sched.book` and
   `sched.mutes` become per day (`<wk>#<di>`); `v`/`am` a week record; `weekstash/<wk>` (the off-screen weeks) emits per
   day too; `plan/all` becomes per puck / per remark; `lw.cell` stays the address (the undo unit) while its storage is
   per record. `LOGICAL_TO_BLOB` is rewritten to the new keys. So an Undo step names days, and two edits on different
   days of a week stop sharing a record.

## 3. The work, in phases (each phase: red test first, then the change, then its own tests green)

### Phase 1 — the schedule one day per piece (storage and command records)
1. `splitWeek(blob) → { week, days[7], issued[], withdrawn[] }` and `joinWeek(...)`, one module
   (`src/state/weekrows.ts`, new). Placement exactly as §1 above; `al` dropped; `un` NOT stored (phase 5 works it out —
   until then it is rebuilt at load from `Input.acc === 'r'` plus the day, the agent's reading that it is "mostly
   redundant" checked by a test first). **The design's test, written first:** split then join is byte-identical for the
   two demo weeks, a published-and-amended week, a week with withdrawn issuances and drafts; a key or field naming no
   single day FAILS the split loudly (never silently dropped); a change on one day produces exactly one day write.
2. `persistAll` writes rows through the split, only the rows whose string changed (the whiteboard already ignores
   same-value sets). The reconcile at line 119 goes. The preserved-week path (`isPreservedWeek`) becomes per day: an
   unreadable day row reads as a read-only blank day and is written back byte-for-byte (the damaged-blob case is still
   live; the pre-Phase-2 case is dead since schema 5 — its code stays, unreachable, noted).
3. `hydrate` joins rows back into the stash; the fold of an old whole-week record (§2.4).
4. `decompose` / `schedWriteRecords` / `applyBook` per day; `undo/derive.ts` (`weekOf`, `sharesKeys`) and the timeline
   read the new ids; the per-week stash store emits per day.
   Tests: the existing undo suites (`src/undo/*`) green unchanged in meaning; a new one — an Undo of Monday's edit is not
   blocked by a later edit on Tuesday of the same week (today it is: both touch `sched.book/<wk>`).

### Phase 2 — inputs, people and the planning calendar one row each
1. `inputs/<iid>` with `ord`; `people/<pid>` with `ord`; `plan/pp:<id>` (already has its order), `plan/dm:<iso>`.
   `persistPeople()` (the Quals page's own save) writes rows too. Deletes from the known-keys set (§2.2).
2. Hydrate rebuilds `INPUTS` and `PEOPLE` in stored order; folds the old `all` records.
3. The command layer: `plan/all` → per puck / per remark; `inputs/__order` stays the undo's order carrier and maps onto
   the rows' `ord`.
4. **The design's GAP test flips:** `dbreadiness.test.ts` "two people editing the SAME blob clobber each other" becomes
   HOLDS — two clients each file an input, both survive; the same for two people's roster rows and two planning pucks.
   A new one: client A deletes input X while client B (booted earlier) files input Y — B's save never deletes X back to
   life and never deletes anything it did not remove.

### Phase 3 — the Leave War one record each
1. `rawPersist` (`leavewar/state/store.ts:1000`) writes per war / per record / per ledger entry / per person for
   openings, post-outs and person edits, each with the order it needs; unchanged keys stay silent. The settings-like keys
   are unchanged. Its StorageBackend gains `remove` and `keys` (the adapter already has them) so a deleted record is
   removed, from the known-keys set.
2. Boot (`initStore`) reads the rows back into `wars[].recs` and the ledger; folds the old `wars` / `ledger` blobs.
3. The Leave War writes that today go out OUTSIDE a command (the coalesced idle-reconcile `rawPersist` calls, sweep §3)
   are routed through `cmdCommitProjection` so every war write is inside a command's group — needed for the change log
   (phase 4). `LOGICAL_TO_BLOB` corrected.
   Tests: two clients bidding on different days of one war both survive; an admin's decision and a member's bid on
   different records of one person/date both survive; the Leave War's store and undo suites green.

### Phase 4 — the change log, and one saved group per command
1. **One `ChangeBatch` record per command** (`changes/<batchId>`, a new collection — the one collection added), written
   by the command layer inside the command's own whiteboard transaction, so it is in the same all-or-nothing group:
   `id`, `at`, `actorId`, `type`, `items` = every stored key the group writes or removes (table, id, op). The design's
   version per item comes from the store at the adapter (group B) — the stand-in writes none. Writes outside any command
   (boot, the fold) write no batch; a test lists every such writer and fails on a new one.
2. **The postman keeps each command's group apart** — a queue of groups sent in order, one `putMany` each, a failed
   head retried whole before the next is sent — instead of merging them (the merge made "one changeset per command"
   untrue on the wire). The journal-superset property (§20.3) is re-proved for the queue in `postman.test.ts` and
   `contract.test.ts`.
3. **A stand-in reader, to prove the shape, not the product:** a test-only second client reads the batches written since
   its last mark, re-reads each named row once and applies them — proving the batch carries enough to rebuild another
   client's view (inputs, a day, a war record). The real 30-second check, its screens and its request counts are group B.

### Phase 5 — never seed demo data into a shared store
1. `chooseBackend` returns the backend with a `seedsDemo` flag: Memory and Browser **true** (tests, dev, the e2e run and
   his Vercel preview keep today's demo — nothing changes for him), a shared backend **false** (only the fake shared
   backend in tests today; the Dataverse adapter later).
2. With `seedsDemo` false the boot empties the module-level seed literals in place BEFORE anything can save
   (`INPUTS`, `PEOPLE`, `DAYS` → a blank week, the week bundles), skips the seed merges (`seedDemoSans`,
   `seedDemoMedical`, `otherWeekInputs`, `autoAcceptSeedInputs`), `installDemoWorld`'s demo half, the Leave War's
   `seedWars / seedOpenings / seedLedger` fallbacks (empty instead; the settings-like defaults stay — they are defaults,
   not demo), the Tracker's demo pair (its default course and built-in charts stay: shipped syllabus content, D62), and
   the seed accounts.
3. **The first admin of an empty shared store** — with no seed accounts there is no one to sign in as. The plan does
   not invent a product answer: the stand-in reads one bootstrap admin from the backend's configuration, and the real
   answer is put to IT as `[IT-QUESTIONS]` (D165 already says an admin creates each person; who creates the first).
4. Tests: a fake shared backend boots, signs in the bootstrap admin, visits every page and the Leave War and the
   Tracker — afterwards storage holds only the schema stamp and what that admin did; no demo callsign, input, war, course
   student or account appears anywhere.

### Phase 6 — worked out on read (AFTER IT answers §12 q9 — see §5 below)
Only the design's rule 9 half, in its order of risk, smallest first: (a) `un` derived (small); (b) the handed-on OIL
decision ignored on read — the decision records the input assignment it was made for, else it reopens the known
hand-away-and-back gap (small–moderate); (c) the input landings' pending marks (`inp:`) counted from the filing against
the day's baseline instead of stored marks (moderate); (d) an input's landing as a read-time overlay from the `Input`
plus the day's stored decisions keyed by input id (large — 18 reader files); (e) a delete by `Person.deletedFrom`
filtered on read instead of rewriting every stored week (large — every day reader); (f) the incidental other-day writers
(`reconcileIssuedMarks`, whole-week `ensureRowIds`, `discardPending`, load-time re-landing and migrations) confined to
the day a command means. Each of (c)–(f) is its own step with the whole engine suite, `tfin.js` 728/0 and the walk. **If
IT answers q9 "no" (they want a server step to write the day), (c)–(e) change shape — which is why it waits.**

### Phase 7 — the small OIL follow-ups (D147, D453 "with")
`[OIL-READ-LEFTOVERS]` items 1, 2, 4; `[STORE-READER-SWEEP]`; `[OIL-REQ-NAMEBOX]` (a walk question for him first);
`[OIL-WORDS]`; `[OIL-PERSONAL-PLACEHOLDER]` (FULL); `[CROWD-SIM-BRIEF]` (WALK); `[OIL-RELINK-XWEEK]`. They change
behaviour, not table shapes, so they go last and do not hold the shape work: if IT's tables settle first, phases 1–5
are what must be in. `[OIL-RELINK-XWEEK]` touches the same seam as phase 6 (d) and goes with it.

## 4. Documents fixed in the same change (D201 — what the old text leaves behind)

`data-model.md`: §6's `FanOutBackend` sentence (§2.1); §3's "every SCHED map keyed by day index (… `rt` …)" (`rt` is
keyed by version, split by its `di`); where `a` (`SCHED.als`) goes (its own records → `Amendment`); `Input`, `Person`,
`LeaveBid` gain `sortIndex`; `ChangeBatch.items` as built; "Admin → Data's clear of a week" (§3, §7) describes nothing
the app does today — marked as a future command, not a present one; §5's field map rewritten to the stored keys.
`data-schema.md` (the as-is map) to the new keys. `schema.ts` `SchedFields` gains `rt`, `cr`; the "FOURTEEN fields"
comments corrected. `weekstash.ts` / `persist.ts` comments about the Admin sweep (no caller since `clearHistoryData`
stopped dropping weeks). `LOGICAL_TO_BLOB`. `docs/file-map.md` for new files. `handover-dataverse.md` §what we do on our
side. `[IT-QUESTIONS]` gains the first-admin question and the `sortIndex` columns.

## 5. What this plan needs from him (product or scope — not technical)

1. **§12 q9 to the IT team now** (the one question that must be answered before phase 6 is built): *"A member's input,
   a deleted person and a request handed on change what a day shows without writing the day — each day is the day row
   PLUS the inputs and people it reads. Does that suit your reporting?"* Phases 1–5 go ahead meanwhile.
2. **The Tracker — include it?** His D453 list names inputs, people, the Leave War and the schedule; the Tracker's marks
   and dates are one record per course-and-chart today, so two instructors marking two different students of the same
   course at the same moment would overwrite one another once shared. The design moves them to rows at its stage 2
   (`Attempt`). My recommendation: **add it as a phase** (one record per student's marks and dates), because the
   `Enrolment` table IT builds now would carry them — cheaper to find its shape now than to reshape a settled table.
3. **When do IT's tables settle?** (D453: "Ask IT when its tables settle — group A must land first.")

## 6. Checks (FULL tier, `raptor-port/docs/bug-check-order.md`)

- Red tests first per phase; the full gate set once per phase under the PC lock (D228): unit, build, `tfin.js` 728/0,
  e2e, smoke. `rulecheck`, `docsize`.
- **Roll-call before the walk:** every place the app SAVES (not draws) — each writer of each record, one row each: has
  its per-row path / must not, because… / MISSING. The sweeps above are its first draft.
- **The walk** (a real browser, `vite preview`, the Browser backend): file / edit / delete an input, add / archive a
  person, a planning puck and a day title, edit two days of one week, publish and amend a day, bid / decide / delete on
  the war, give an OIL award, undo and redo each — reload after each and compare; then two tabs of one browser on
  different records (both survive — today they do not); then a returning browser holding the OLD shape (fold, nothing
  lost); then the fake shared backend (nothing seeded). Evidence sheet with pictures, `raptor-port/docs/handpass/`.
- **Then** both reviewers read the code (persistence — D353), given the evidence sheet (D11: walk before inspection).
- **Excluded from every reviewer's brief (D56):** a problem living only in data already stored — the demo data is
  wiped before the database — when the code is correct going forward. The fold must not break a load; it need not
  preserve every quirk of old demo records.

## 7. Risks, said plainly

- **Undo is the most fragile consumer.** Its record ids change in phase 1; every undo suite must stay green, and the
  walk undoes after every step.
- **Order.** A missed order-dependent reader shows as a roster or an input list in a different order after a reload —
  the walk compares orders, and phase 2's first test pins them.
- **Size of phase 6.** (d) and (e) touch the engine's readers; they are the largest items in all of group A and the
  reason it is split from 1–5.
- **Time.** Phases 1–5: several sessions of building plus a FULL check. Phase 6: as long again. Phase 7: one batch.
