# Red team — [DB-READINESS] group A plan, round 1 (Fable 5.1, 30 Sep 26)

Reviewed read-only against the live files: the plan (`docs/superpowers/plans/2026-09-30-db-readiness-group-a-plan.md`),
`docs/data-model.md` §2, §3, §5–§9, §12; the rulings D453, D354, D353, D56, D54, D22, D68, D144, D148, D355, D356,
D450–D454, D401, D165, D120/D121 (full rows); the Leave War and Tracker architecture sections; `raptor-executor.md`;
`undo-contract.md` §1–§3; `OUTSTANDING.md` `[DB-READINESS]` and `[IT-QUESTIONS]`; and the code the plan rests on
(`storage/*`, `state/persist.ts`, `state/sched-commit.ts`, `state/store.ts`, `state/history.ts`, `engine/weekstash.ts`,
`command/*`, `undo/derive.ts`, `undo/timeline.ts`, `leavewar/state/store.ts`, `leavewar/state/storage.ts`,
`leavewar/state/demoworld.ts`, `main.tsx`, `state/accounts.ts`, `state/person-delete.ts`, `engine/publish.ts`,
`engine/editlog.ts`, `storage/docstore.ts`, `tracker/app/core.js` seeding).

D56 applied throughout: nothing below is about data already stored. Every finding is about what the NEW code would do
to NEW data, or about a shape IT will build a table from.

The plan is sound in its main decision (§2.1 — split at the record level, not in a backend fan-out: I agree, and the
design's own §3 "the adapter takes the command layer's write set" already implies it). The findings are about what the
split removes without replacing, and about records that still do not map one-to-one.

---

## BLOCKER / HIGH

### F1 — HIGH — §2.4, phase 2.2 / 3.2 / 5: the boot's "has this store been booted before" signals are the two blobs
the plan deletes; nothing replaces them, so an empty collection re-seeds

**What is wrong.** Today the boot decides "seed or not" by sniffing one record each:
- `state/persist.ts:52-58` — `hydrated = true` only when `inputs/all` parses as an array; `state/store.ts:834` — `if
  (!isHydrated())` runs `otherWeekInputs`, `seedDemoSans`, `seedDemoMedical`.
- `main.tsx:59` — `hadStoredWars = wb.has('leavewar', 'wars')`; `installDemoWorld(false)` (`demoworld.ts:169-235`)
  re-overlays the demo people, the demo OIL story, `remapPersonKeys`, and pushes every seed absence into `INPUTS`.
- `tracker/app/core.js:5515-5519` — the `v3:seedstamp` record (this one survives the split; listed for completeness).

The plan folds `inputs/all` and `leavewar/wars` into rows (§2.4) and never says what `isHydrated()` and
`hadStoredWars` become. Read literally, both go false on every boot after the fold: on the Browser backend
(`seedsDemo` true — his Vercel preview, every e2e run) the demo inputs and the demo wars come back on every reload. And
even with a sensible per-row reading ("hydrated = at least one `inputs/<iid>` row exists"), a squadron that has deleted
its last input, or its last war, reloads and gets the demo back. That is new-data harm, prevented by nothing in the
plan — D56 does not apply.

**Exact fix.** Replace presence-sniffing with ONE explicit stamp, written by whoever seeds:
1. Add a settings record `settings/booted` (value `'1'`). The seeder writes it in the SAME whiteboard group as its
   seed (phase 5's demo path), and phase 5's empty-shared-store boot writes it alone, before anything else can save.
2. `isHydrated()` ≡ `wb.has('settings', 'booted')`; `hadStoredWars` ≡ the same call (one signal for the whole world —
   the Leave War's world and the scheduler's were never independently seeded anyway: `main.tsx:56-61`).
3. The fold (§2.4) writes `settings/booted` in its all-or-nothing group, so a returning browser reads as booted.
4. Phase 5's test gains: on the Browser backend, delete every input → reload → none returns; delete every war
   (if the app allows an empty war list) → reload → no demo war returns; on the fake shared backend the stamp exists
   and nothing else is seeded.
5. The Tracker keeps `v3:seedstamp` (it is per-Tracker and already explicit), but phase 5 makes it read `seedsDemo`
   too, as the plan already says.

### F2 — HIGH — §2.2 / phase 1.2: removing the reconcile at `persist.ts:119` without replacing its FIRST purpose loses
an undo across a reload

**What is wrong.** `persistAll` writes the loaded week only when `stashHas(CURWEEK) || snaps.weekDirty()`
(`persist.ts:110`). Within a session where the week was never left (so never stashed): edit it → the rows are written;
Undo back to the load state → `weekDirty()` is false, nothing is written; today line 119 deletes the stale record —
the comment at lines 115-118 names exactly this case. The plan removes line 119 ("no per-row reconcile replaces it")
and keeps the guard. Result: the stale day rows stay; the next boot hydrates them (`persist.ts:79-82`) and
`applyWeekModel` restores the edit the person had undone. New data, going forward.

(A week that was left and returned to is safe: `hydrate` stashes every stored week, so `stashHas` is true and the live
content, pristine or not, is always written. The hole is only a week first stored in the session it is undone in.)

**Exact fix.** The known-keys set the plan already introduces (§2.2) is the answer — use it for the guard too:
1. `persistAll` writes the loaded week's rows when the week is stashed, OR dirty, OR the whiteboard holds any
   `weeks/<wk>…` key for it (the client "knows" rows for that week). The whiteboard's same-value skip
   (`whiteboard.ts:73-75`) makes the extra writes free.
2. Delete the "a pristine copy of the seed must never be persisted" branch for a week that already has rows — the
   trap it guards (`weekstash.ts` header, `store.ts:463-471`: a stored pristine copy outranks a later deploy's changed
   seed) only exists for a week with NO rows; once a week has rows, its rows are the record.
3. Test: fresh boot, edit Tuesday, Undo, reload → Tuesday is pristine. Same with two edits and two Undos.

### F3 — HIGH — phase 4.2: a queue of groups breaks the pagehide flush (the 8 Sep 26 "edit lost on reload" bug returns)

**What is wrong.** The Browser backend writes a whole group synchronously — `browser.ts:74-78` has no `await` inside
`putMany` — which is what `guardUnload` relies on: `boot.ts:65-73` "the Browser backend writes inside put() before its
first await, so every letter still in its 300 ms coalesce wait lands synchronously here". That holds because the postman
sends ONE merged group (`postman.ts:100-132`). With phase 4.2's queue, `flush()` sends the head group synchronously,
then `await`s it, then sends the next — and on `pagehide` the page is gone after the first await. Every group behind the
head is lost on a close or a reload right after several quick edits (a drag then a note then a publish, within 300 ms
of each other is rare; a phone put in the pocket a second after three taps is not).

**Exact fix — pick one, and say which.**
- **(a) Preferred: move the queue to group B.** Its only consumer is the adapter (one Dataverse changeset per group);
  nothing in group A's shape work needs groups apart on the wire — the ChangeBatch is written INSIDE the whiteboard
  group (F7), so a merged `putMany` still carries every batch row. Keep today's merge; re-prove nothing. `[DB-READINESS]`
  group B already owns "the real request counts".
- **(b) If the queue stays:** `Postman.flush()` hands the backend EVERY queued group in ONE synchronous call — a
  `putGroups(groups: Entry[][])` on the contract (default: apply in order in one journal write), the Browser backend
  writing all of them before its first await; the journal-superset proof covers the concatenation (it is the ordered
  union, so a retry is still a superset). Test: three commits, `flush()` NOT awaited, read localStorage at once → all
  three landed.

### F4 — HIGH — phase 1.1 / 1.3, §2.5: a missing or forgotten week row (`v`, `am`) reads as a foundation-era,
unsupported book — the week goes read-only and its ids are stripped

**What is wrong.** `applyWeekModel` sets `SCHED.ridV = s.v` and `SCHED.amV = s.am` (`store.ts:551-552`); undefined
`ridV` makes `migrateLegacyIds` strip and re-mint every row id (`store.ts:669-689`), and undefined `amV` makes
`amFormatOf` answer `unsupported`, which `setPreservedBlob` turns into a byte-frozen read-only week
(`store.ts:571-572`). Today both ride inside the one week blob, so they cannot be missing. The plan moves them to a
separate `weeks/<wk>` row written "only when its stamps changed". Three ways the row is absent while day rows exist:
the fold forgets it; a bulk load by IT writes days only (data-model §9's last paragraph already warns bulk loads must
write batches — this is the same class); under the day lock later, a holder's save of one day with the week row lost.
The join then makes the whole week read-only or re-keys it.

**Exact fix.**
1. `joinWeek`: when the week row is absent and the store is at schema 6 or later, default `v` and `am` to the CURRENT
   versions (`RID_BOOK_VERSION`, `AMBOOK_VERSION` — `publish.ts:54`). A week that exists as rows can only be current;
   "absent = foundation-era" was true only while the stamps lived in the blob.
2. The fold writes `weeks/<wk>` from the blob's `v`/`am` in the same group as the seven day rows.
3. A week's FIRST save writes the week row and ALL seven day rows together (the design's "created together",
   ScheduleDay §3) — say so in phase 1.2; today "only the rows whose string changed" is silent about it (the whiteboard
   happens to write an absent key, but the plan should state the invariant, and the walk should check the seven rows
   exist after one Monday edit).
4. Tests: seven day rows, no week row → editable, `ridV` current, no id re-minted; fold of a demo week → the week row
   exists with the blob's stamps.

### F5 — HIGH — §2.3, phase 2.1 / 2.3: a dense `ord` written on every row re-creates the whole-row clobber the phase
exists to remove

**What is wrong.** `INPUTS` writers use `push` AND `unshift` (`sched-commit.ts:129-134`, CMDLF-010), and an Undo of a
delete restores the row at its old position through `inputs/__order`. If `ord` is dense (0, 1, 2 …), an unshift or a
positional restore renumbers EVERY input row, so one filing rewrites every row's whole record. Two clients filing at the
same moment: each survives its own new row (the GAP test flips green), but client A's renumbering of B's rows overwrites
B's concurrent edit of one of them — the clobber moved from one blob to N rows. The same holds for `people/<pid>` if
`ord` is ever re-derived from position at save.

**Exact fix.**
1. `ord` is SPARSE and STABLE: a new row appends at `max + 1024`; an insert between neighbours takes the midpoint
   (a float is fine for the stand-in; tell IT `sortIndex` is a decimal, or renumber at the adapter); renumbering runs only
   when a gap closes, as its own recorded change. `ord` is NEVER computed from the array index at save.
2. `inputs/__order` stays the undo's carrier; on `write()` it sets `ord` only on rows whose position changed.
3. Phase 2's test adds: filing an input that unshifts writes exactly ONE `inputs/` row; two clients file at once and
   neither client's save changes the OTHER client's stored row string (assert the string, not just presence).
4. §4's IT note: `Input.sortIndex`, `Person.sortIndex`, `LeaveBid.sortIndex` are decimal, sparse.

### F6 — HIGH — §2.5, §4: the edit log (`settings/elog`) is left as one 2,000-line record rewritten by every command,
with a per-browser `seq` — a stage-1 table in the design, and the biggest clobber surface once shared

**What is wrong.** `engine/editlog.ts:119` writes `store.set('elog', { v:1, next, rows })` — every logged change
rewrites the whole record; `seq` is `ELOG.next++` (`editlog.ts:330-332`), a per-browser counter. Data-model §6 lists
`EditLog` at stage 1; §3 EditLog says `seq` "only rises — what `EditLogSeen` points at". Shared, two clients each
rewrite the whole log over the other's lines (a history of absence changes, D263, silently loses lines), and their
`seq`s collide so "new since you last looked" (`changeseen`) points at the wrong lines. D453 names group A as "what
decides the tables' shape": `EditLog.seq` being store-assigned (the design's `changeSeq`) is a shape decision IT must
build, and the plan does not mention the log at all (its "settings-like keys unchanged" would sweep it in).

**Exact fix.** Either add it as a small phase or state the deferral and its shape:
- **Phase (recommended):** `elog/<seq>` one record per line (a new collection, so the reset can clear it); `seq` in the
  stand-in = `<t>-<clientBootId>` ordered by `t` with the boot id as tie-break, mapped to the store's `changeSeq` at the
  adapter; the 2,000-line cap becomes "read the newest 2,000" at load; `changeseen` becomes `settings/changeseen:<pid>`
  (one row per person — the design's `EditLogSeen`). Undo/redo lines stay append-only as today.
- **Or defer to group B**, but then §2.5 says so explicitly, §4 corrects the design (EditLog "per browser today;
  shared at group B"), and `[IT-QUESTIONS]` gains: "`EditLog.seq` must be assigned by the store (your `changeSeq`),
  never by the client; `EditLogSeen` is one row per person."

---

## MEDIUM

### F7 — MEDIUM — phase 4.1: "one ChangeBatch per command, written by the command layer inside the command's
transaction" cannot be built as written — the net group is known only at the whiteboard's outermost seal, after the
drained projections

**What is wrong.** The whiteboard transaction opens in `dispatch` (`commit.ts:169`) and commits in its `finally` AFTER
`drainQueue()` (`commit.ts:174-180`); the group it emits is the NET change over the outermost command PLUS every joined
child and every drained projection/restore (`whiteboard.ts:134-146`). So (a) the command layer cannot list "every
stored key the group writes" before the seal, and (b) "one per command" is undefined when one user action drains three
projections in the same group (the Leave War's `lw.sync`, `persistNotify`'s projections at `leavewar/state/store.ts:1293-1296`).

**Exact fix.**
1. The whiteboard grows a seal hook: `setSealer(fn: (net: Change[]) => Change | null)`. At the outermost `commit()`,
   after computing `group`, it calls the sealer, and if a change comes back it sets the key in the map and appends it
   to the SAME emitted group. That is the only place the exact key list exists.
2. The command layer installs the sealer at `wirePersist`: batch id = `<clientBootId>-<outermost seq>`; `type` = the
   outermost command's type; `seqs` = every envelope seq that ran inside the group (children join the envelope; drained
   pipelines have their own); `actorId` from the outermost envelope; `items` = the net group's keys with `op`.
3. Define the unit: **one batch per whiteboard group** — which is one all-or-nothing write, which is what the design's
   "one changeset per command" means on the wire. Say so in §2.5 and §4 (ChangeBatch.items "as built").
4. Groups sealed outside any command (boot, the fold, `?fresh` seeds, the raw Leave War paths until phase 3.3) get no
   batch; the phase-4 test subscribes to the whiteboard and asserts every group after boot carries exactly one
   `changes/` entry whose items equal the rest of the group.
5. Add `changes` to `COLLECTIONS` (`backend.ts:6-7`) and to `RESET` (`reset.ts:55`) — a batch naming rows a version
   bump wiped must go with them; check `BrowserBackend.loadAll` enumerates the new prefix.

### F8 — MEDIUM — §2.5 / §1 / brief Q3: six stored records that do not map to one row of one table

Each is a shape IT will build from, so each needs a decision in the plan (stored key, or a corrected design line):

- **(a) The Original (`o`, `SCHED.orig[di]`) inside the day row.** `publish.ts:338` makes it `{ id: verId(iso,0),
  …daySnap(di), sign }` — an issuance with sequence 0, which the design's Amendment table says IS an Amendment row
  ("`sequence` 0 is the Original"), append-only, retirable (`publish.ts:1165` moves it to `retired` on unpublish). The
  plan puts it in the mutable day row (§1 "`o` … by day index"), so every day save re-sends the signed Original and no
  table can enforce its immutability. The command layer already keeps it apart (`sched.orig/<wk>:<di>`,
  `sched-commit.ts:102-106`) — folding it into the day row breaks the plan's own §2.6 "same grain above the store".
  **Fix:** store it as `weeks/<wk>:al:<verId(iso,0)>~0`, i.e. one issued record like any AL; correct data-model §5's
  "`SCHED.dayOK` / `cur` / `orig` inside each snapshot" row to "`orig` → `Amendment` sequence 0".
- **(b) An AL record carries its four sign-offs** (`publish.ts:1078` `sign:{[di]:sign}`) — one record ↔ `Amendment` +
  four `IssuedSignoff`. **Fix (simplest, and consistent with the day lock's "publish is one changeset"):** keep them
  inside the record and correct the design: at stage 1 `Amendment.signoffs` is a JSON column, `IssuedSignoff` rows come
  with stage 2. Say so in §4.
- **(c) A retired issuance.** `publish.ts:1159` MOVES the record out of `als`/`orig` into `retired[<verId>~<n>]`; a
  reissue reuses `verId`. The design has an append-only `Amendment` with `reissue` and a separate `AmendmentRetraction`
  — no row is ever moved or updated. **Fix:** key EVERY issuance `weeks/<wk>:al:<verId>~<n>` from the start (n = the
  reissue count, 0 first), never rewritten; an unpublish writes `weeks/<wk>:rx:<verId>~<n>` (`retractedBy`,
  `retractedAt`) beside it; `joinWeek` rebuilds `SCHED.als` (issuances with no `rx`) and `SCHED.retired` (those with
  one). The in-memory shapes do not change.
- **(d) `leavewar/opening:<pid>`** holds every counter for one person; the design's `LeaveOpening` is unique per
  (person, counter). **Fix:** either `leavewar/opening:<pid>:<counter>`, or correct the design to one row per person
  with a JSON of counters (the app reads/writes them together — the JSON-column rule in §2 fits). Also the command
  record stays `lw.balances/all` (`leavewar/state/store.ts:1123`) — split it to `lw.opening/<pid>[:<counter>]` or the
  grains diverge.
- **(e) `leavewar/postout:<pid>` + `leavewar/personedit:<pid>` + the `perslabels` map** ↔ ONE `LeavePersonProfile` row
  (plus `past` stints as child rows). Three records into one row. **Fix:** one record `leavewar/profile:<pid>` =
  `{ band, from, to, poOutcome, poDone, label, past[] }` (the design's own field list), one command record
  `lw.profile/<pid>`; `perslabels` leaves the settings-like list.
- **(f) Placeholders in `PEOPLE`** (`p.special`, `person-delete.ts:221`) become `people/<pid>` rows → `Person` rows
  for things that are not people. **Fix:** exclude `special` entries from the rows (they are code, like the seed) or
  tell IT `Person.isPlaceholder`. A question, not a call for the reviewer.

### F9 — MEDIUM — §2.5 / brief Q3: stage-1 tables the plan leaves with no records, unnamed

A reader of §2.5 cannot tell an omission from a decision. List each and its reason:
- `Attachment` metadata: only in the IndexedDB drawer (`docstore.ts`, `state/docs.ts:39,96`), no whiteboard record;
  out of group A until IT answers §12 q2 (file store) — say so, and note `docAdd` is a writer outside every command.
- `User` / `AccessRequest`: `settings/accounts`, `settings/accessreqs` are one record each (`accounts.ts:247-248`) —
  two admins adding two accounts at once clobber. Design §5 says User is replaced by the auth provider at stage 4;
  state "left whole until then" and put the AccessRequest clobber into `[IT-QUESTIONS]` or group B.
- `Qualification` (`settings/qualcols`), `EditLogSeen` (`settings/changeseen`, one record for everyone —
  `state/changes.ts:81`).
- The Tracker's `Course`, `Syllabus`, `TrainingEvent`, `Layout`, `Enrolment` (all stage 1 in §6): §5.2 asks him about
  the marks only; name these five so his answer covers the whole tab (D120 keeps its checks off old data, not off the
  shape).

### F10 — MEDIUM — phase 1.1's test vs phase 6(f); and `un` in two places

- Phase 1's test "a change on one day produces exactly one day write" is promised BEFORE phase 6(f) confines
  `reconcileIssuedMarks` (every published day on every edit), whole-week `ensureRowIds` and `discardPending` (§1, last
  bullet). Either the test is scoped to a week with no published day (then it proves little) or it fails. **Fix:** define
  the test as "exactly one day ROW whose stored string changed", run it on a week with a published day AND a pending
  input landing (so `reconcileIssuedMarks` runs). If a second day row changes, the confinement of THAT writer moves
  into phase 1 — it does not depend on q9 (it is about which rows a command touches, not about how a member's input
  reaches a day). Keep (c)–(e) held.
- Phase 1.1 says `un` is not stored and "rebuilt at load" (that IS working it out on read); phase 6(a) then lists "`un`
  derived (small)" again, and 1.1's pointer reads "phase 5". **Fix:** delete 6(a); 1.1 says "phase 6's first item, done
  here". `unacceptedKeys` needs `DAYS` and `dayApproved` (`store.ts:449-458`), so the rebuild runs after the join.

### F11 — MEDIUM — phases 1.2 and 3.1: the cost of splitting on every history step

`persistAll` runs on every history step (`persist.ts:143`) and today passes each stashed week's string straight through
(`persist.ts:99-100`); the plan would parse and re-serialise every stashed week into 7+ rows on every step, and
`rawPersist` (`leavewar/state/store.ts:1000`) would enumerate every record of every war on every Leave War write
(`persistNotify`'s coalesced idle reconcile calls it per cell — `store.ts:1297-1300`). **Fix:** memo the split per week
on the stash STRING itself (the `SRC_MEMO` idiom, `weekstash.ts:213-231`) so an unchanged week costs one string compare;
the Leave War state is immutable (`withList` copies only the changed path), so `rawPersist` skips any war / person /
date whose object is reference-equal to the last-persisted state. Gate: `npm run perf` before and after phase 1 and 3
("a day-1 edit rewrites only day 1" already measures this class).

### F12 — MEDIUM — phase 1.2: per-day read-only ("an unreadable day row reads as a read-only blank day") opens a new
protection surface the app does not need

`isPreservedWeek`, `protectedWeek`, `inputProtected`, `protectedDates`, `stashProtected` and the quarantine classifier
are all per WEEK; making preservation per day touches every one of them (input landings across a half-preserved week,
the id migrations skipped per day, `stashEditWeek` refusing per week). **Fix:** keep it per week: if ANY day row of a
week is unreadable, the whole week is preserved byte-for-byte (every row written back verbatim) and read-only, exactly
as today. A MISSING day row with the week row present is a blank day (the design's "Null = a blank day") — that is the
only new case, and it is a read, not a protection.

### F13 — MEDIUM — §2.4 / §2.5: the fold's trigger and atomicity, and the reset list

- The plan says "one all-or-nothing group … the `resetPreSchema` pattern", but `resetPreSchema` is sequential
  `remove` calls then a verify then a stamp (`reset.ts:83-93`), not one group. **Fix:** the fold is ONE `putMany`
  (rows + `null` removals of the blobs + the schema stamp + `settings/booted`, F1) through the real backend before the
  whiteboard fills; a crash mid-way leaves either the old world or the new (the journal contract).
- Make the schema stamp the ONE trigger: `SCHEMA_VERSION = 6`; a store below 5 is wiped as today, a store at 5 is
  folded; a store at 6 never sniffs for blobs. Presence-sniffing on every boot is what F1 is removing.
- `changes` (F7) and any new collection join `RESET`.

### F14 — MEDIUM — phase 3.1 states a false fact: "Its StorageBackend gains `remove` and `keys` (the adapter already
has them)"

`leavewar/state/storage.ts:8-11` is `read`/`write` only; `storage/adapters.ts:19-24` `leavewarAdapter` is `read`/`write`
only. It is the TRACKER target (`adapters.ts:27-34`) that has `remove` and `keys`. **Fix:** add both to `StorageBackend`,
`memoryBackend`, `localBackend` and `leavewarAdapter` in phase 3.1; the Leave War's vendored unit suite uses
`memoryBackend`, so it needs them too.

---

## LOW

### F15 — LOW — phase 5.1: `seedsDemo` on the backend KIND, and there is no "fake shared backend in tests today"

`dbreadiness.test.ts:75-84, 99-111` shares one `MemoryBackend` between two clients — that is the fake shared database;
no class is "shared". With Memory = true, phase 5.4's test has nothing to instantiate. **Fix:** `seedsDemo` is a
constructor option (`new MemoryBackend({ seedsDemo: false })`), default true for Memory and Browser. And the flag never
decides alone: with F1's `settings/booted` stamp, a store that already carries it is never seeded whatever the backend
says — the backend flag only decides what an UNSTAMPED store's first boot does.

### F16 — LOW — phase 4.2 (if the queue stays): a poisoned head blocks every later group for ever

Today a failed group is merged UNDER newer values and a newer value can supersede a bad one (`postman.ts:112-118`);
with a queue, "a failed head retried whole before the next is sent" means one refused group (group B's honest
refusals, a version mismatch) stalls the whole app's saves. Say so and link `[DB-READINESS]` (2) and (5), or take F3(a).

### F17 — LOW — §2.5 key grammar

A war id may itself contain `:` (`undo/derive.ts:84-86`, `leavewar/state/store.ts:1143-1147` parse from the RIGHT), so
`leavewar/rec:<warId>:<pid>:<date>:<recId>` must be parsed from the right too; `verId` contains the ISO date and a
separator — check `weeks/<wk>:al:<verId>~<n>` splits unambiguously (`weekOf` takes the head before the first `:`/`#`,
`derive.ts:24-26`, which is fine, but the `al` parser must not split on the verId's own characters).

### F18 — LOW — §2.6 / phase 1.4: `sharesKeys`' week-family rule

`derive.ts:153-161`: a `weekstash/<wk>` key shares with EVERY same-week scheduler key. With `weekstash/<wk>#<di>` and
`sched.book/<wk>#<di>`, the family rule must become per DAY (a stash day key shares with same-day keys only), or the new
test "Monday's undo is not blocked by Tuesday's edit" fails for any week that was left and returned to. Also
`store.ts:213-218` emits the stash as whole blobs and `writeStashRecords` (`weekstash.ts:102-108`) writes whole blobs —
both need the split/join, and the plan's phase 1.4 should name them.

### F19 — LOW — settings `null` writes vs the design's "absent means default"

`accounts.ts:331` `store.set('guestview', on ? true : null)` and the settings adapter (`adapters.ts:12-17`, no
`removeItem`) store the string `null`. Data-model §5 says "do not write a row for a key on the shipped standard". Not
group A's job, but §4's `data-schema.md` rewrite should note it, and the adapter can map a `null` set to a delete in
one line.

---

## Walk and test gaps (brief Q5)

Add to §6's walk, each with a reload and a picture:
1. A week with a PUBLISHED day: edit another day → reload → the issued version, its ALs, the four names and the
   history panel unchanged; Unpublish → reload → the withdrawn issuance in the history; publish again (a reissue) →
   reload (F8 a–c).
2. Edit a week, Undo to pristine, reload (F2). Delete every input, reload (F1).
3. Three quick edits then an immediate reload / tab close on the Browser backend (F3).
4. A week's rows with the week row removed by hand → editable, ids intact (F4). A missing day row → a blank day, the
   rest editable (F12).
5. File an input, then file another (an unshift) → only one row changed in storage (F5); reorder-sensitive readers:
   the Inputs page order, the roster order on Quals and the pickers, a Leave War cell with two records — before and
   after reload.
6. The perf gate (`npm run perf`) after phases 1 and 3 (F11).

Tests a defect would slip past as the plan stands: no test that the group for one command carries exactly one batch
whose items equal the group (F7); no test that a week's first save writes all seven rows and the week row (F4); no test
on the postman flush with more than one queued group (F3); no test on `isHydrated` with zero input rows (F1).

## Sequencing (brief Q4)

Holding phase 6 (b)–(e) until IT answers §12 q9 is right — a "no" changes their shape. But the write-set confinement
half of (f) belongs with phase 1's own test (F10), and phase 4.2's queue belongs with the adapter in group B (F3).
Nothing else in phases 1–5 is redone by phase 6. The Tracker question (§5.2) should name the five stage-1 tables it
covers (F9) so his answer settles the whole tab. `[OIL-RELINK-XWEEK]` riding with 6(d) is right.

---

## Verdict: REVISE

The three that matter most:
- **F1** — the split removes the boot's only "already booted" signals (`inputs/all`, `leavewar/wars`); without an
  explicit stamp, an emptied collection re-seeds the demo over real data.
- **F3** — a queue of groups breaks the synchronous pagehide flush the Browser backend relies on; edits behind the head
  group are lost on close — move the queue to group B or flush every group in one call.
- **F2 + F4** — two silent read-back regressions: an undo to pristine that never reaches storage (the reconcile's first
  purpose, dropped without a replacement), and a missing week row that turns a week read-only and re-keys it.
