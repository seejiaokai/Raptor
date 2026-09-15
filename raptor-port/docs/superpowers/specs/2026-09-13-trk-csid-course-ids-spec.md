# [TRK-CSID] Phase 1 — stable hidden ids for Tracker COURSES (spec)

**Status:** REV 4 — Astra R1+R2+R3 dispositions folded in (§14, §15, §16 are
BINDING and supersede any earlier clause they touch) · 13 Sep 26
**Part of:** `[ARCH-STACK]` step 1 (stable ids everywhere) · `[TRK-CSID]`
**Scope decision (owner, 13 Sep 26):** TRK-CSID is split into **two passes**.
This spec is **Phase 1 — COURSES only**. Phase 2 (syllabus ids) is a separate
spec/branch/review, because syllabuses are global and the built-in syllabus
templates are identified by **name in shipped code** (`SYLLABI`,
`DEFAULT_LAYOUTS`, `SYL_ALIAS` bases, `SYL_ORDER`, `SYL_RENAME`) plus a web of
name-keyed prefs (`SYL_HIDDEN`/`SYL_ALIAS`/`SYL_TOMB`/`SYL_ORDER`) — a larger,
riskier change that must not sit behind the safe course work.

**Model/process:** HEAVY (persisted data, silent-defect risk). Build on Opus
4.8 high, test-first. Astra red-teams THIS spec. Fable-high inspects the built
diff (steered at reload/hydrate, partial-failure, migration-resume, import).
Full gates. Push + Vercel link, **HOLD for "merge live".**

---

## 1. Problem

Students and schedule rows carry stable hidden ids; **courses do not.** A
course is still its typed NAME:

- `COURSES` is a `string[]` of course names (`app/core.js:246`,
  `loadCourses`/`saveCourses`).
- `course` (module `let`) is the current course NAME.
- Every per-course storage key embeds the name: `v3:<courseName>:...` (all the
  `kXxx(c, …)` builders).
- `prefGet/prefSet('lastCourse')` and `prefGet/prefSet('lastCrew:'+c)` store the
  name.
- The export file keys courses by name (`students.courses: string[]`,
  `students.byCourse: {courseName: …}`, `fileFormat.js`).

So **renaming a course moves data by name** — `renCourse` is a ~65-line
copy-every-record-then-verify-then-delete apparatus (`core.js:3122`) that can
half-fail and strand a course. Two browsers naming a course the same thing, or
an old backup, cannot be reconciled by identity. This mirrors exactly the
problem the enrolment-id round (10 Sep 26, `app/ids.js` + `migrateIds`) already
solved for students.

## 2. Goal (what "done" means for Phase 1)

1. Every course carries a permanent opaque `id`; the typed name becomes a
   **label**. `COURSES` becomes `{ id, name }[]`.
2. Every per-course storage key re-bases on the **course id**, not the name.
3. A **resumable, read-back-verified migration** converts an existing browser's
   name-keyed courses to id-keyed once, mirroring `migrateIds` (one-shot flag,
   durable scratch id-map, move-verify-then-delete, self-healing retry).
4. **Rename becomes a label-only change** — `renCourse` sets `entry.name` with a
   duplicate-name guard and moves **no** records. The copy/verify/delete
   apparatus is deleted.
5. **Import/export carry course ids** (file version → 2), with a
   reconcile-by-name on import (mirror `reconcileIds`: the store's id wins) and
   v1 (name-keyed) files upgraded on read (mirror `upgradeCourseBlock`).
6. Gates stay green, incl. `smoke:tracker` (trust CI; the addStudent-on-tallest
   check is a known local flake).

**Out of scope (Phase 2):** syllabus ids, the syllabus catalogue/prefs, the
`kSyls`/`kLayoutFor`/`kSylOrder`/`kSylHidden`/`kSylAlias`/`kSylTomb` keys,
`plan.sylName`, `moveSylData`, `renSyl`/`delSyl`/`dupSyl`/`addSyl`. Those stay
name-based this phase. **`who→personId`** (1C) is separate too.

## 3. Identity model

```
mintCourseId() → 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2,8)
```
Random (not a counter), so two browsers never mint the same id — same rule as
`mintId()` for students (`app/ids.js:11`). Prefix `'c'` (students are `'s'`), so
the two id-spaces are visibly distinct in a dump.

`COURSES: { id, name }[]`. Helpers on `core.js`:
- `courseName(id)` → the label, `''` if unknown.
- `courseIdOf(name)` → the id of the first course with that name, or `null`.
- The module `let course` holds the current course **id**.
- `curCourseName()` (for status/prompt text) → `courseName(course)`.

New courses are **born id-keyed** — `addCourse` mints an id and writes
`kCourseIdMig`-clean state, exactly as `addCourse` already sets `kIdMig`/
`kRosterMig` for a clean enrolment start (`core.js:3117`).

## 4. Storage keys

No key **shape** changes — only the value fed into the course segment changes
from name to id. After migration, for course id `C`:

`v3:<C>:syl` · `v3:<C>:roster` (legacy flat) · `v3:<C>:<syl>:roster` ·
`v3:<C>:rostermig` · `v3:<C>:plan` · `v3:<C>:lulls:<s>` · `v3:<C>:pace:<s>` ·
`v3:<C>:last:<s>` · `v3:<C>:lastStudent` · `v3:<C>:idmig` · `v3:<C>:idmap` ·
`v3:<C>:<syl>:m:<s>` · `v3:<C>:d:<s>` (legacy) · `v3:<C>:<syl>:d:<s>` ·
`v3:<C>:syls` (legacy own) · `v3:lay:<C>:<syl>` (legacy own layout).

**Unchanged (global, NOT course-scoped):** `v3:courses`, `v3:links`,
`v3:master:*` (global syllabus definitions, layouts, order, prefs). Course id
never touches these.

Prefs (per-browser `localStorage`, not the seam): `lastCourse` → course **id**;
`lastCrew:<C>` → course **id** segment.

Course id is opaque (`c…`, no colon), so it is always a safe key segment.

## 5. Migration — `migrateCourseIds()`

Mirror `migrateIds` discipline: **derive the map, write it durably, move every
record and read it back, delete the old only after the new verifies, write the
index (COURSES) last, set the flag only when everything verified; any failure
leaves the flag unset and the old keys in place, and the next boot finishes the
job — idempotent.** (`core.js:485-570` is the model.)

New keys:
- `kCourseIdMig = 'v3:courseidmig'` — one-shot done flag (global, not per-course).
- `kCourseIdMap = 'v3:courseidmap'` — durable name→id scratch map of a run in
  progress; deleted when the flag lands.

### 5.1 Deriving the map
`COURSES` after `loadCourses()` is still `string[]` (or already `{id,name}[]` on
a resumed/partly-done store — handle both). For each course:
- an entry already carrying an id lends it;
- a bare-string (legacy) course reuses the id in the saved scratch map if
  present (resume), else mints one.

Write the map to `kCourseIdMap` and **read it back** before moving anything; if
the read-back differs, abort (the next boot retries). Same as `migrateIds`
writes `kIdMap` first (`core.js:534-536`).

### 5.2 Moving records — the `list()`-prefix approach (primary design; RED-TEAM THIS)
The per-course keys embed the course name in the **middle** of composite keys
(`v3:<name>:<syl>:m:<student>`). Enumerating them field-by-field the way
`migrateIds` enumerates per-student keys would require reconstructing every
syllabus and student **before** the enrolment migration has run — and would risk
missing a key (the Obs-15/16 failure: you grep the builders and miss one; a
missed key strands data under the old name forever).

So Phase 1 moves by **key prefix** instead, which cannot miss a key:

```
for each course { name, id } (id ≠ name):
  moved = 0, ok = true
  for k in storage.list():
     seg = secondSegment(k)                 // v3:<seg>:...  (exact, colon-bounded)
     if seg === name:  ok &&= moveKey(k, replaceSecondSeg(k, id))
     // legacy own-layout keys carry the course at position 3: v3:lay:<course>:<syl>
     if k starts 'v3:lay:' && thirdSegment(k) === name:
                       ok &&= moveKey(k, 'v3:lay:' + id + rest)
  move prefs: lastCrew:<name> → lastCrew:<id>; if lastCourse===name → id
  if !ok: return   // leave flag unset; next boot resumes from the same scratch map
```

`moveKey(from,to)` is the proven `moved()` body from `migrateIds` (`core.js:545`):
absent/empty → nothing; else write `to` (unless it already holds it — a retry),
**read back**, only then `delKey(from)`, confirm the delete. An empty string
reads as absent on both sides (the `delKey` tombstone), same as `migrateIds`.

**Segment matching is exact and colon-bounded** — `v3:<name>:` where the char
after `<name>` is `:`. This prevents prefix collisions (course `26A` vs `26AB`:
`v3:26A:` ≠ the `v3:26AB…` slice). We only ever process names that are in
`COURSES`, and the global namespace segments (`courses`, `links`, `master`,
`lay`) are never course names — but §7 adds a **defensive guard** so a course
literally named one of them cannot be produced or migrated ambiguously.

Why prefix-move over field-by-field here (state in the spec for the reviewer):
it is exhaustive by construction (no builder to miss), it is agnostic to whether
the enrolment/roster-split migrations have run (it moves the raw name segment,
strings-on-roster and all), and the colon-boundary match + fixed global
skiplist make its blast radius auditable. The cost is one `list()` per boot
until the flag lands.

### 5.3 Writing the index + flag
After every course's keys verify: write `COURSES` as `{id,name}[]` via
`saveCourses`, **read it back**, then set `kCourseIdMig='1'` and delete
`kCourseIdMap`. Order matters — the index (what every later reader keys off) is
written **last**, after the records it points at, exactly as `migrateIds` writes
the roster last (`core.js:558-568`).

### 5.4 Where it runs
In `init()`, **after `loadCourses()` and BEFORE `migrateAllCourses()`**
(`core.js:3968-3971`): the enrolment migration reads per-course keys, so the
course segment must already be id by then. One retry on the same boot if the
flag is still unset (mirror `loadCourseNow`'s single retry, `core.js:689`).
`migrateAllCourses` then iterates the now-`{id,name}` COURSES by **id**.

The `prefGet('lastCourse')` compare in `init` switches to id
(`COURSES.some(c=>c.id===want)`).

### 5.5 Held-until-converted guard
If `kCourseIdMig` is unset after both attempts, the store is mid-conversion.
Course-mutating writes (`addCourse`, `renCourse`, `delCourse`, `saveCourseOrder`,
and — already covered — roster writes via `rosterHeld`) must be refused with a
message until the flag lands, so a write cannot strand a half-moved course
(mirror `rosterHeld`/`HELD_MSG`, `core.js:695-708`). Add `courseHeld` set from
`!kCourseIdMig`. **RED-TEAM:** is a course-level held flag sufficient, or does
any non-course write also need gating? (Enrolment writes already re-base on the
id course segment once course migration is done, so they are safe after the
flag; before it, roster writes are held by `rosterHeld` per course.)

## 6. Rename becomes label-only

`renCourse` (`core.js:3122`) collapses to:
- prompt, trim, uppercase, colon-refuse (kept — see §8), dup-name guard against
  `COURSES.map(c=>c.name)`;
- set the current course entry's `name`; `saveCourses()`; refresh.

**Delete** the entire copy/`move`/verify/`whole`/partial-carry apparatus
(`core.js:3130-3204`). No record moves — they are keyed by the id, which does
not change. This is the payoff and the headline test.

`switchCourse(id)`, `delCourse`, `saveCourseOrder`, `addCourse` all operate on
ids: dropdowns and the reorder modal pass the course **id**; labels render via
`courseName`. (Header.jsx / OrdModal — see §9.)

## 7. Defensive naming guard

Refuse a course whose name (case-insensitively) equals a reserved global
segment `courses` / `links` / `master` / `lay`, at `addCourse` and `renCourse`,
with a plain message. This makes the prefix-move's global skiplist a guaranteed
invariant rather than a case-sensitivity accident. (Existing data uppercases
names, so this refuses nothing real.)

## 8. Colon refusal

Keep `refuseColon` on course names in Phase 1. Rationale: courses are id-keyed
after this change so a colon in a course NAME is technically safe, but
**syllabus** names remain name-keyed until Phase 2 and the file format's
`noColon('course', …)` is shared plumbing; relaxing the course rule now is
extra scope with no user ask. Note in code + this spec that it MAY be relaxed in
Phase 2 alongside the syllabus work, the way the student colon rule was relaxed
when students became ids. **Decision: keep; low risk.**

## 9. UI touch-points

- **Header.jsx** course `<select>`: option `value` becomes course **id**, text
  the name; `onChange` → `switchCourse(id)`. `addCourse`/`renCourse`/`delCourse`
  wiring unchanged (they take no arg or read `course`).
- **OrdModal (course mode)**: the reorder list currently lists names and
  `saveCourseOrder(list)` reranks `COURSES` by name (`core.js:3068`). Switch to
  ids: the modal item id = course id, label = name; `saveCourseOrder` reranks by
  id. **RED-TEAM:** confirm OrdModal's shared item model handles id-keyed items
  for course mode without disturbing syllabus/crew modes (which stay name/…).
- Any status/prompt string that showed the course name now reads
  `courseName(course)` / the entry name, never the id.

## 10. Import / export (file version 1 → 2)

`fileFormat.js`:
- `FILE_VERSION = 2`. `readFile` still accepts v1 (`version <= FILE_VERSION`).
- **v2 shape:** `students.courses: {id,name}[]`; `students.byCourse` keyed by
  course **id**, each course block unchanged inside. (Syllabi stay name-keyed
  inside `bySyllabus` this phase.)
- **v1 shape (name-keyed courses)** still validates; a **course-level upgrade on
  read** (new, in `app/ids.js` or a sibling — mirror `upgradeCourseBlock`) mints
  ids for name-keyed courses and re-keys `byCourse`, before anything is applied.
- `checkStudents` accepts **both** course shapes (string list OR `{id,name}`
  entries), never a mix — mirror the dual roster-shape check
  (`fileFormat.js:141-155`), with the same "one id, one name" and no-dupes
  guards at the course level.

`core.js` apply/collect (`collectStudents`/`applyStudents`, `readCourseBlock`/
`writeCourseBlock`):
- **Export** writes `{id,name}` courses and id-keyed `byCourse`.
- **Import reconcile-by-name** (new `reconcileCourseIds`, mirror `reconcileIds`,
  `app/ids.js:102`): a file course whose **name** matches a store course adopts
  the **store's** id (the store's id wins); the store id is rewritten through the
  block's `byCourse` key and any nested references. A file course with no
  name-match keeps its id (or the upgraded one). **RED-TEAM:** courses have no
  `pid`-style tiebreaker — name is the whole identity, and `COURSES` dedupes by
  name, so name-match = same course and merge is correct. Confirm there is no
  case where two genuinely different courses share a name such that merge loses
  data. (If the file's course id is already in the store under a *different*
  name, that is the store's own course — keep the store name, as students do.)

## 11. Docs to keep true (same PR)

- **CLAUDE.md** Tracker section: "A student is an ENROLMENT ID" paragraph gains a
  sibling — courses are ids too; course NAMES are labels, not key segments; the
  `v3:<course>:…` grammar note updates; the colon note clarifies course names
  keep the refusal for now (syllabus names still key by name until Phase 2).
- **OUTSTANDING.md** `[TRK-CSID]`: split into **1B-i (courses) — DONE** and
  **1B-ii (syllabuses) — OPEN**, with the Phase-2 built-in-identity risk noted.
- **HANDOFF.md** file map / open items if touched.
- **docs/tracker/known-gaps.md**, **docs/data-model.md** / **data-schema.md**
  where they describe course identity.

## 12. Tests (test-first; mirror the enrolment id tests)

New/extended unit tests (`src/tracker/**/*.test.*`, run under the tracker vitest
project):
1. **migrateCourseIds — fresh store**: name-keyed course → `{id,name}`, every
   per-course key re-based, flag set, scratch map gone, records readable by id.
2. **legacy → id**: a store with real name-keyed marks/dates/roster/plan/lulls/
   pace/lastStudent for a course; after migration every record reads back under
   the id, nothing left under the name.
3. **resume after interrupt**: simulate a failed write mid-move (a store that
   refuses one `set`); flag stays unset, scratch map persists, second run
   reuses the same ids and completes; no record duplicated or stranded.
4. **read-back failure**: the index write fails → flag not set → old keys
   intact.
5. **rename is label-only**: rename a course; assert **no** storage key moved
   (spy the store), only the entry name changed, all records still read by id.
6. **dup-name / reserved-name refusal** at addCourse & renCourse.
7. **born id-keyed**: `addCourse` writes an entry with an id and `courseidmig`
   clean; no migration needed for it.
8. **file dual-shape**: `readFile` accepts a v1 (string courses) and a v2
   ({id,name}) file; a mixed/dup/bad-shape course list is refused with a named
   error.
9. **import reconcile**: a file whose course id differs from the store's for the
   same name adopts the store id; marks/dates land under the store id, not a
   duplicate course.
10. **collect→apply round trip** preserves ids.

Plus: `smoke:tracker` stays green (CI is the arbiter). Full gate set once before
the PR.

## 13. Open questions for the Astra red-team

1. `list()`-prefix move vs field-by-field: is the prefix approach's blast radius
   (global skiplist + colon-bounded 2nd-segment match + defensive naming guard)
   airtight? Any store key under `v3:` that is course-scoped but NOT caught by
   `v3:<name>:` or `v3:lay:<name>:`? Any global key that COULD be caught?
2. Ordering vs the enrolment/roster-split migrations and their flags
   (`kIdMig`/`kIdMap`/`kRosterMig` move as ordinary `v3:<name>:` keys — confirm
   an interrupted enrolment run survives a course-id move with its scratch map
   intact).
3. The `courseHeld` guard scope (§5.5).
4. Import reconcile semantics when name-match ≠ same course (§10) — is merge
   ever wrong for courses?
5. Two-tab / concurrent-boot: two tabs both running `migrateCourseIds` — the
   read-back + "already holds it" idempotency should make it safe; confirm.
6. Anything the file-version bump breaks for a v0/older reader (older deployed
   build reading a v2 file → `version > FILE_VERSION` refusal message is
   correct; confirm that is acceptable and messaged).

---

## 14. R1 — Astra (Codex GPT-6, high) red-team dispositions & BINDING revisions

Astra verdict **REVISE** — 8 HIGH + 1 LOW, all evidence-backed and confirmed
against the real code. Host (Claude) arbitration below. This section is
authoritative where it conflicts with §§1–13.

### Grounding the storage reality (confirmed by reading the code)
The deployed Tracker write path is `tracker/storage.js` → `trackerTarget(wb)`
(`adapters.ts:27`) → **whiteboard (in-memory, synchronous)**; the whiteboard is
the only thing with a route to a backend, via the Postman (coalesces per record
300 ms, retries independently — `postman.ts:26,55`). So a `sGet` immediately
after `sSet` reads the **whiteboard (memory)**, not the backend, and the
Tracker's `flushNow`/`loadLatest` are **no-ops** (`storage.js:62-63`). **The
shipped enrolment migration `migrateIds` runs through this exact path with the
exact same read-back + no-op-flush profile.** This reframes CSID-01/02.

### Dispositions

**CSID-01 (durability — read-back reads memory; Postman can drop a write) —
ACCEPT-AS-PRE-EXISTING + fix the ordering.**
The durability gap is real but it is the **already-shipped** profile of every
Tracker migration (`migrateIds`), and it is exactly `[TRK-DISK]` in OUTSTANDING,
which the ARCH-STACK plan assigns to the **DB step (RC5 — record-oriented
storage door with acknowledged durable writes)**. Per owner doctrine ("no
interim patches the DB step throws away"; reset-not-migrate; pre-promulgation
demo data), Phase 1 does **not** invent a bespoke durable-write/journal layer.
It **inherits `migrateIds`' discipline verbatim** (read-back catches
whiteboard-level failures; the flag/scratch-map give resumability) and **does
not regress it**. Two binding corrections that need no durability layer:
- **Ordering:** never delete a source before the destination read-back passes
  (already the `moved()` contract), and set the one-shot flag **only after the
  index (COURSES) read-back passes**, which is last. On any failure the flag
  stays unset, the durable scratch map (written and read back first) pins the
  name→id decisions, and the next boot resumes the SAME map.
- **No false durability claims:** the spec says the read-back proves the
  whiteboard write; backend durability is the DB step's job.
Flag to owner as an **inherited known limitation**, not a new one.

**CSID-02 (two tabs migrate → different ids, competing index writes) —
ACCEPT-AS-PRE-EXISTING + document.**
Same lineage: `migrateIds` is equally un-serialised across tabs, and cross-tab
safety (revision checks) is explicitly **DB-step (RC5)** scope. A localStorage
cross-tab lock is the exact interim mechanism the plan forbids. Phase 1 accepts
the same narrow window (only the ONE first load that converts; single-user demo
data) and does not widen it. Documented; **do not** claim cross-tab safety.

**CSID-03 (`v3:links` payload is keyed by course NAME) — ACCEPT, MUST FIX.**
`v3:links = {courseName: {studentName: personId}}`; `migrateIds` reads
`links[c]` and `collectStudents`/`applyStudents` read course-keyed links. Moving
a course's records to its id while leaving `v3:links` name-keyed strands every
student's person link (and `idmig` then blocks re-conversion). **Fix:** in
`migrateCourseIds`, after the name→id map is durable, **rewrite `v3:links`
top-level keys from course name → course id** (read-back), before enrolment
migration runs. In the v1 **file** upgrade (§10), translate the file's `links`
block's course keys alongside `byCourse`. Fixtures: linked course,
pre-roster-split course, interrupted-enrolment course.

**CSID-04 (`rosterHeld` ≠ course-migration-complete; writers + boot bypass a
4-command guard) — ACCEPT, redesign as FAIL-CLOSED BOOT.**
Replace "gate 4 commands" (§5.5) with the scheduler's proven 1A shape: **if
`migrateCourseIds` does not set `kCourseIdMig` after its one retry, boot fails
closed** — `init()` does **not** call `loadCourse`, does **not** set `ready`, and
`TrackerPage` renders a plain "Couldn't finish upgrading your Tracker data —
reload to try again" state with no board mounted. No normal writer (plan writes,
roster/enrolment migration, date/pace/lull setters, `applyStudents`, syllabus
rename/delete, export) runs, so none can write one namespace or emit a
conflicting roster. Simpler and safer than enumerating every writer. (Mirrors 1A
item 3 "a failed reset fails the boot to Retry, never a half-reset.") Verify
`TrackerPage` can render off `core.ready===false` + an error flag without
mounting the imperative board.

**CSID-05 (syllabus & other COURSES-traversing writers hold course-key
responsibilities) — ACCEPT, MUST FIX; full audit below.**
Every function that loops `COURSES` or passes a course into a course-scoped
key/compare must use the entry **id** (syllabus IDENTITY still name-based). All
in `app/core.js`:
- `394` `COURSES.filter(c=>c!=='SYLLABUS EDIT')` → filter by `c.name`.
- `573` `migrateAllCourses` `for c of COURSES` → `c.id`.
- `2979` `purgeLegacySyl` `COURSES.map(c=>kSylsOwn(c))` → `kSylsOwn(c.id)`.
- `2991` `moveSylData` `for c of COURSES` → `c.id`; `c===course` → `c.id===course`.
- `3113/3128` `addCourse`/`switchCourse` `COURSES.includes(v)` → `.some(c=>c.name===v)` (add) / resolve by id (switch).
- `3210` `delCourse` `COURSES.filter(c=>c!==course)` → `c.id!==course`.
- `3603` `COURSES.indexOf(course)` → `.some(c=>c.id===course)`.
- `3636` `collectStudents` `for c of COURSES` → `c.id` (key), `c.name` (label).
- `3657/3816` `collectStudents`/`applyStudents` `COURSES.slice()` → `{id,name}[]`.
- `3975` `init` `COURSES.includes(__want)` → `.some(c=>c.id===__want)`.
Grep gate before "done": no `k...(c,`/`kXxx(<courseName>` passing a name where an
id is now required; no `c === course` / `COURSES.includes` on a raw string.

**CSID-06 (import reconcile: name-first vs same-id conflict; many-to-one
overwrite) — ACCEPT, MIRROR `reconcileIds` PRECISELY.**
`reconcileCourseIds` follows `ids.js:102-136`: (1) build `taken` from all file
course ids; (2) **resolve store-id match FIRST** — a file course whose id equals
a store course id IS that course, keep + reserve it; (3) **name fallback only**
where the target id is not already `taken` and does not contradict an id match;
(4) reserve every chosen target across the WHOLE file so two file courses can
never map onto one store id; (5) collect **conflicts** (a file course whose name
matches a store course already claimed by a different id, or a duplicate
destination id / label clash) and **REFUSE the import** with a named message,
exactly as the student path refuses. Cover Astra's counterexample (export
ALPHA=c1; rename→BRAVO; add ALPHA=c2; import backup) and the many-to-one case.

**CSID-07 (v2 import retains supplied ids; no id grammar → `master:lay` clobbers
globals) — ACCEPT, ENFORCE ID GRAMMAR AT EVERY BOUNDARY.**
Safe course-id grammar `^c[0-9a-z]+$` (the `mintCourseId` shape). Enforce in
`fileFormat.js` (`checkStudents`) for **every** course id — v2 input AND the ids
the v1 upgrade produces — and in `migrateCourseIds` when reading scratch map /
index. Reject any id with a separator or reserved namespace before a single key
is written; validate `byCourse` keys correspond to the validated `courses`
catalogue. (Sibling gap: the student-id validator also only checks nonempty —
out of Phase-1 scope; log it.)

**CSID-08 (legacy stores/imports can already hold a course named `master`;
§5.2 would sweep `v3:master:*`) — ACCEPT, PREFLIGHT + REJECT AT IMPORT.**
(a) **import boundary** — `checkStudents`/`applyStudents` refuse a course whose
name equals a reserved namespace `courses`/`links`/`master`/`lay`
**case-insensitively**; (b) **migration preflight** — before moving any key,
`migrateCourseIds` scans existing course names; a reserved-name collision **fails
closed** (CSID-04 boot state) with a recoverable diagnostic rather than sweeping
globals. The `list()`-move keeps an **explicit** reserved skiplist in the
algorithm: a matched key whose 2nd segment is a reserved global is never treated
as course-scoped.

**CSID-09 (OrdModal comparator on ids/objects) — ACCEPT via names-in-modal.**
Confirmed `OrdModalInner` renders each item as a string (`key={n}`, `{n}`,
`localeCompare`, `restore`). Course mode stays **string/name-based** like crew:
`course.read: () => core.COURSES.map(c=>c.name)`, `tag: n =>
n===core.courseName(core.course)?'current':''`, `saveCourseOrder(nameList)`
reranks `COURSES` **entries** by a name→entry map (the `saveCrewOrder` pattern,
`core.js:3081`). Course names are unique among courses, so name-reorder is
unambiguous and A–Z sorts labels. Shared component needs **no** change.

### Net effect on §§1–13
- §5.2 keeps the `list()`-prefix move **plus** the explicit reserved skiplist and
  the CSID-08 preflight; add the `v3:links` name→id rewrite (CSID-03).
- §5.5 is **replaced** by the CSID-04 fail-closed boot.
- §6 rename-is-label-only stands; the §14 audit (CSID-05) makes surrounding
  COURSES-traversing writers id-safe in the same PR.
- §9 OrdModal per CSID-09; Header dropdown value=id / label=name, title via
  `courseName`.
- §10 gains precise reconcile precedence (CSID-06), course-id grammar validation
  (CSID-07), reserved-name rejection at import + links translation (CSID-08/03).
- §12 tests add: `v3:links` translation; fail-closed boot; reserved-name
  preflight & import rejection; id-grammar rejection (v1-upgrade & v2); reconcile
  rename/name-reuse & many-to-one refusal.

### Round 2
These revisions are a changed plan → **re-review by Astra required** before build
(approval binds to the new SHA). Open for R2: (a) fail-closed boot vs a coherent
migration-aware read/write view, given the Tracker has no existing boot-retry
screen? (b) inherit `migrateIds`' durability/two-tab profile, or wire the
Tracker's `flushNow` to the real `postman.flush` at migration commit as a
low-cost, non-throwaway hardening? (c) does the reserved skiplist + id grammar
fully close the global-namespace blast radius?

---

## 15. R2 — Astra dispositions & BINDING revisions

Astra R2 verdict **REVISE** — the 8 R1 findings are resolved/accepted at spec
level; 4 NEW defects, all emergent from the R1 revisions themselves, all real.
Astra also **answered R2 open questions**: (b) rechecked `postman.flush` — it
dispatches pending writes but "would NOT establish a durability barrier," so
Phase 1 **inherits `migrateIds`' profile and does not wire `flushNow`** (a
non-barrier that the DB step replaces anyway); the durability + two-tab
deferrals are **accepted** and not re-raised. §15 is authoritative.

**CSID-R2-01 (HIGH — the `'SYLLABUS EDIT'` legacy filter + prefix-move sweeps
shared legacy syllabus sources) — ACCEPT, MUST FIX.**
My §14 audit item `394` was itself buggy: `loadCourses` runs **before**
migration, when `COURSES` entries are still **strings**, so `c.name !==
'SYLLABUS EDIT'` is `undefined !== …` = always true — the retired entry
**survives**, and the prefix-move would then sweep `v3:SYLLABUS EDIT:syls` and
`v3:lay:SYLLABUS EDIT:*` (the shared legacy syllabus definition/layout sources
read by `kSylsOldMaster`/`kLayoutOldMaster`, `core.js:275-280,639-646`) into an
id namespace, so opening a course can no longer find those definitions and
`loadCourseNow` silently falls back to a different syllabus. **Fix:** (a) the
pre-migration filter handles **both shapes** — drop the retired entry whether it
is the string `'SYLLABUS EDIT'` or an object named it; (b) `'SYLLABUS EDIT'` is
added to the migration's **reserved skiplist** so its `v3:SYLLABUS EDIT:*` and
`v3:lay:SYLLABUS EDIT:*` keys are **never** moved and stay available to their
existing adoption paths; (c) it is never entered into the name→id map. Fixture: a
legacy catalogue `['ALPHA','SYLLABUS EDIT']` → ALPHA migrates, the shared legacy
syllabus/layout keys are untouched and still adopted.

**CSID-R2-02 (HIGH — colon-containing legacy course names break the
prefix `secondSegment`) — ACCEPT, MUST FIX.**
Colon refusal was only added 9 Sep 26; an older store can hold a course `'26:A'`
→ key `v3:26:A:plan`, whose 2nd colon-bounded segment is `'26'`, not `'26:A'`.
The move would then **skip** the course's records (strand them, then stamp
completion) or, if a course `'26'` also exists, **capture** `'26:A'`'s records
into `'26'`. **Fix:** the migration **preflight validates every legacy source
name** before moving anything — reject a name containing `':'` (and any
structurally invalid name) exactly as it rejects a reserved name (CSID-08),
**failing closed** (CSID-04 boot state) with a specific diagnostic and **without
stamping the completion flag**. Fixtures: a lone `'26:A'`; `'26:A'` alongside
`'26'`.

**CSID-R2-03 (MEDIUM — fail-closed boot needs a concrete mount sequence the
current wiring cannot provide) — ACCEPT, SPECIFY THE SEQUENCE.**
Confirmed the wiring: `App.jsx` renders all writable chrome (Header commands,
keyboard/click handlers, `#board`) and its **mount-only** effect calls
`core.init()` (`App.jsx:75`); `renderBoard` no-ops with no `#board`
(`core.js:1729`); a mount-only effect does **not** re-run when `ready` flips.
**Binding design:**
- `core.init()` gains a `bootError` (module `let`, exported/getter). If
  `migrateCourseIds` (incl. the CSID-02/R2-01/R2-02/08 preflights) does **not**
  reach its completion flag after the one retry, `init` sets `bootError`,
  does **not** call `loadCourse`, and does **not** set `ready`.
- `App` is gated on core state (it already subscribes via
  `useSyncExternalStore`): `if (core.bootError) return <BootError/>` (a plain
  "couldn't finish upgrading — reload to try again" panel, **no** Header,
  **no** `#board`, **no** document listeners); else `if (!core.ready) return
  <BootLoading/>` (lightweight placeholder, same exclusions); else render the
  full chrome.
- Kickoff stays: a mount effect calls `core.init()` once (runs even when the
  render is a placeholder — effects fire after a placeholder render too).
- Replace the mount-only `if (core.ready) renderBoard()` with a
  **`ready`-transition** effect: `useEffect(() => { if (core.ready &&
  !core.bootError) { core.renderBoard(); core.notify() } }, [core.ready])` — it
  draws once the chrome (and `#board`) has mounted, and also covers the
  logout→login remount where `ready` is already true on mount. `renderBoard` is
  idempotent (replaces markup), so no harmful double-draw.
Cover: successful first boot, failed-migration boot, reload recovery,
logout/login remount. (This is the Tracker's version of 1A "fail the boot to
Retry, never a half-migration.")

**CSID-R2-04 (MEDIUM — `migrateRosters`' hardcoded `c === '26ABSG'` fresh-store
seed breaks once `c` is an id) — ACCEPT, MUST FIX + add to audit.**
`migrateRosters` seeds the demo pair only when `c === '26ABSG'` (`core.js:431`);
after course-id migration `c` is an opaque id, so a fresh store never seeds
STUDENT A/B yet still sets `rostermig`, permanently skipping it — and
`smoke.mjs:2762,2797` relies on the demo pair. **Fix:** resolve the default
course's id once (the id minted for/assigned to `'26ABSG'`, or a `DEFAULT_COURSE`
sentinel) and compare `c` against that id; add this sentinel comparison to the
CSID-05 audit and state the expected fresh-store roster. Also audit for any
other hardcoded `'26ABSG'` / course-name literal (e.g. `loadCourses`' default
`['26ABSG']` becomes a default **entry** `{id:mint,name:'26ABSG'}` born
id-clean, and `firstSylName`/defaults referencing it).

### Net effect
- §14 CSID-05 audit item `394` is corrected by CSID-R2-01 (both-shape filter,
  skiplist), and gains the CSID-R2-04 `migrateRosters` seed site + the
  `loadCourses` default-entry conversion.
- §14 CSID-08 preflight extends to **colon/invalid** legacy names (CSID-R2-02).
- §14 CSID-04 fail-closed boot gains the concrete mount sequence (CSID-R2-03).
- Durability/two-tab (CSID-01/02): **inherit, do not wire flushNow** — Astra
  confirmed it is not a durability barrier.

### Round 3
Changed plan → **re-review by Astra** before build (approval binds to the new
SHA). R3 confirms the 4 R2 fixes and looks for any further emergent defect.

---

## 16. R3 — Astra dispositions & BINDING revisions

Astra R3 verdict **REVISE** — the four R2 scenarios are addressed; 2 concrete
gaps remain, both real. §16 is authoritative.

**CSID-R3-01 (HIGH — `'SYLLABUS EDIT'` reserved only in the migration skiplist,
not at add/rename/import) — ACCEPT, MUST FIX.**
The both-shape filter drops a course named `'SYLLABUS EDIT'` and the migration
skiplist protects its legacy keys, but §7/§14 reserve only
`courses`/`links`/`master`/`lay` at the add/rename/import boundaries. So renaming
a populated id-keyed course to `'SYLLABUS EDIT'` succeeds, and the next
`loadCourses` filters the entry out and saves the filtered index
(`core.js:391-396`), orphaning its records; a v2 import carrying that label loses
its entry immediately (`applyStudents`→`reloadFromStore`→`loadCourses`,
`core.js:3599,3820`). **Fix:** add `'SYLLABUS EDIT'` to the reserved-name set
**consistently** — `refuseColon`-adjacent reserved-name refusal at `addCourse`
and `renCourse`, and the import reserved-name rejection in
`checkStudents`/`applyStudents` — **case-insensitively**, alongside
`courses`/`links`/`master`/`lay`. Keep the legacy both-shape filter and the
source-key skiplist for historical stores. Fixtures: rename a populated course to
`'SYLLABUS EDIT'` (refused); import a valid-id course labelled `'SYLLABUS EDIT'`
(refused). (The single reserved-name list is one constant, shared by all
boundaries, so the four checks cannot drift.)

**CSID-R3-02 (MEDIUM — fail-closed `bootError` never `notify()`s, so the UI can
hang on BootLoading) — ACCEPT, MUST FIX.**
`App` subscribes via `useSyncExternalStore(core.subscribe, core.getVersion)`
(`App.jsx:63`) and the snapshot changes only through `notify()`
(`core.js:25-29`). Setting `bootError` while leaving `ready` false without a
`notify()` leaves `App` on `BootLoading` indefinitely — the ready-transition
effect never fires and nothing re-renders. **Fix:** publish **every** terminal
boot failure through a setter `setBootError(msg)` that assigns `bootError` **and
calls `notify()`** — including inside the migration's `try/catch` preflight
rejections. `init()`'s failure path calls `setBootError` (never a bare
assignment). Test: a preflight rejection drives `BootLoading → BootError` with
**no** tab switch, user input, or unrelated `notify()`.

### Net effect
- §7/§14 reserved-name set becomes a **single shared constant**
  `RESERVED_COURSE_NAMES = ['courses','links','master','lay','syllabus edit']`
  (compared case-insensitively), enforced at add, rename, import validation, and
  the migration preflight — one list, no drift (CSID-R3-01).
- §15 CSID-R2-03 boot: the failure path uses `setBootError` (assign + `notify`)
  so the store subscription re-renders `App` into `BootError` (CSID-R3-02).

### Round 4
Changed plan → **re-review by Astra** (approval binds to the new SHA). R4
confirms these two fixes and looks for any further emergent defect; on APPROVED
the plan is ready to build.
