# Stable ids — Tracker students by id, schedule rows with an id — design

**Date:** 10 Sep 26 · **Branch:** `claude/read-handoff-docs-wuftw9` · **Status:** approved by the owner, to build.

The Dataverse handover (`docs/handover-dataverse.md`) promises the table
designer one thing from our side before his tables exist: "Two things are
still keyed by a human string today — Tracker students by their typed name,
schedule rows by their position. We change both to stable ids first, on our
side, so your keys map cleanly onto ours." This is that change. Owner, 10 Sep
26: "start the stable-ids change", scope option 1 — the Tracker fully
re-keyed, every schedule row given an id it carries alongside, the
scheduler's position-based ADDRESSING left as it is.

Nothing a screen shows changes. The byte parity gate (728/0), the HTML
byte-compare, the geometry suite and the Tracker smoke suite stay the proof.

## Decisions

| Question | Decision |
|---|---|
| What gets an id in the Tracker? | The **enrolment** — a student's place on a course. One id per (course, student), shared by every syllabus of that course (today the same NAME is the same student across a course's syllabi; pace and lulls are per course). The person keeps Raptor's `PEOPLE` id; the enrolment carries it as `pid` when the student was picked off the roster. |
| Roster entry shape | `{ id, name, pid? }` in the same ordered array at the same key (`v3:<course>:<syl>:roster`). Position in the array is still the crew order (the ball wedge index, the chip number). |
| Id recipe | Opaque, minted at creation, never derived from the name: `'s' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8)`. Random rather than a counter so two browsers never mint the same id (the database step merges them). The scheduler uses the same recipe with prefix `'r'`, in its own module — the Tracker never imports the engine. |
| Which records key by the id | Marks (`:m:<id>`), dates (`:d:<id>`), lulls, pace, last-edit (`last:<id>`), the course's `lastStudent` value, the per-browser `ocuLocal:lastCrew:<course>` pref, `active`, the undo entry's `who`, `failLog`, `lullCopy.picked`, the crew dropdown's option value, the chip's `data-rm`. The name is read through one accessor `nameOf(id)`. |
| The links record | Gone. `v3:links` folds into `pid` on the roster entry at migration; `linkOf`/`linkedPerson` read `pid`. An old export file's `links` block is accepted on import and folded the same way; a new export writes none. |
| The colon guard on student names | Dropped — a student name is no longer a key segment (`data-model.md` §2: "after that it is a display rule only"). Course and syllabus names keep the guard; they are still key segments this round. |
| Student rename | Becomes possible; **no control this round** (owner, 10 Sep 26). |
| Standalone rule | Unchanged. A typed student gets an id the same way; nothing Raptor-specific is added. `+ Add` with an empty bridge is still the old prompt byte for byte. |
| Existing browser data | Converted once per course on first load, by one function `migrateIds(c)` gated by `v3:<c>:idmig`, in the shape of `migrateRosters`. Lossless; old keys deleted after the move. |
| Which schedule rows get an id | Every row of the ScheduleRow family the design names: `Wave`, `Formation`, `AircraftSeat` (the seat pair), `DutyBlock`, `DutyRow`, `SimRow` (amt and oft), `AllhandsRow` (programme), `GroundRow`. Field `rid?: string`. Not `Day` (its date is its natural key). |
| Where row ids are minted | ONE function `ensureRowIds(DAYS)` (`src/engine/rowids.ts`): walks the week, mints a missing `rid`, re-mints a DUPLICATE (a row copied by a template, a duplicated wave, a draft). Called from `histInit()` and `histPush()` in `state/history.ts` before the snapshot is taken — so every snapshot, every undo step, every stash and every persisted week carries ids, and the "mint at creation, not at render" lesson from `inputs.ts` holds by construction (nothing is rendered or saved before `histPush`). No add path is touched individually. |
| Addressing | Unchanged. Slot keys stay positional; `keys.ts` remapping stays; the amendment book, the edit log, tombstones and `mov:` marks stay as they are. `EditLog.rowId` is NOT written this round (it needs a key → row resolver; noted in `HANDOFF.md`). |
| Parity | `rid` is never printed: `html.ts` builds every key from the loop index and stringifies no row. If an event or warning object ever carries a row wholesale, the `parity.test.ts` `stripKeys` idiom excises it — checked at build, not assumed. |
| Course and syllabus ids | Out of scope. Their names stay key segments; `renCourse` / `moveSylData` still walk keys (now by student id). |

## Part A — the Tracker (`src/tracker/`)

### A1. Roster, accessors, id mint (`app/core.js`)

```js
export function mintId() { return 's' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }
export function nameOf(id) { const r = roster.find(x => x.id === id); return r ? r.name : ''; }
export function pidOf(id) { const r = roster.find(x => x.id === id); return (r && r.pid) || null; }
export function byName(name) { return roster.find(x => x.name === name) || null; }
```

`roster` is `[{ id, name, pid? }]`. `migrateIds(c)` runs BEFORE the roster
is read in `loadCourseNow`, so by the time `sParse(rr, [], 'array')` runs
every entry is an object; a string entry after that point is a corrupt
record and is dropped by `sParse`'s shape check. `saveRoster` writes the
objects.

### A2. Every per-student key takes the id

`kMarks/kMarksFor/kDates/kDatesFor/kDatesOld/kLulls/kPace/kLast` — the `s`
argument is the id. `loadStudent` iterates `roster` and keys `marks[id]`,
`dates[id]`, `lulls[id]`, `pace[id]`, `lastEdit[id]`. Every accessor
(`gradeOf`, `failOf`, `failDates`, `doneDate`, `isAvail`, `paceOf`, `epwOf`,
`failList`, `markHtml`, `statsFor`, `nextOfCat`) takes the id. `markHtml`
prints `nameOf(id)`.

`addStudent`: mints `id`, pushes `{ id, name, pid }` (`pid` from the picked
person, absent for a typed name), creates `marks[id]`/`dates[id]`, saves,
sets `active = id`. Dedupe: same name on this roster → today's silent skip;
same `pid` already on this roster → the same skip. The `refuseColon` call on
the student name is removed; `LINKS` writes are removed.

`removeStudentNow(id)`: filters by id, deletes the id-keyed maps and keys,
prunes undo by `e.who !== id`, the cross-syllabus "still elsewhere" scan is
by id, the `lastStudent`/`lastCrew` clears compare ids. The confirm text
prints `nameOf(id)`.

`saveCrewOrder(list)`: the modal reads names and saves names today; it now
reads `roster.map(r => r.name)` and `reranked` maps the ordered names back
through `byName` (names are unique per roster, kept by the dedupe).

`setActive(id)`, `prefSet('lastCrew:' + course, id)`, `kLastStudent` value =
id, `noteLastEdit(id)`, `ballTap` → `roster[wi].id`, `renderKeyBall` compares
`roster[i].id === active` and prints `roster[i].name`, `ballGroup` reads
`roster[i].id` for the lookups. `failLog = id`; `lullCopy.picked = [ids]`.

Undo: `markSnap(id, what)` stores `who: id`; `whatOf` prints `' for ' +
nameOf(u.who)` (the tooltip text is pinned; it must still read the NAME).
`liveEntry` drops entries whose `who` has no `marks[who]` — unchanged.

`moveSylData`, `renCourse`, `dupSyl`: the per-student key walks enumerate
`roster` entries and use `r.id`. `renCourse` no longer moves a links sub-map.

### A3. `migrateIds(c)` — once per course

Runs from `loadCourseNow` right after `migrateRosters(c)`, gated by
`kIdMig(c) = 'v3:' + c + ':idmig'`.

1. Read every syllabus roster of the course (`allSylNames()`, plus the
   custom names). Build `ids = { name → id }` across ALL of them — the same
   name on two syllabi gets ONE id.
2. For each syllabus and each string entry: move `:m:<name>` → `:m:<id>`,
   `:d:<name>` → `:d:<id>`; write the roster as objects with `pid =
   LINKS[c][name]` when present.
3. Per course: move `lulls:<name>`, `pace:<name>`, `last:<name>`, the legacy
   `d:<name>` (kDatesOld); rewrite the `lastStudent` value; rewrite the
   per-browser `lastCrew:<c>` pref if it names a migrated student.
4. Delete `LINKS[c]`, save links (the record empties course by course and
   is deleted outright once empty).
5. Set the flag. Any throw leaves the flag unset and nothing half-moved
   (each move is read-then-write-then-delete; a retry finds either the old
   key or the new one, never neither).

A roster entry that is already an object is skipped (an import wrote it).

### A4. File format (`app/fileFormat.js`, `collectStudents`, `applyStudents`)

- `students.byCourse[c].bySyllabus[syl].roster` is `[{ id, name, pid? }]`;
  `marks` and `dates` are keyed by id; course-level `lulls`/`pace` keyed by
  id. `links` is no longer written.
- The validator accepts BOTH roster shapes (a string array is a legacy file)
  and, on a legacy file, requires `marks`/`dates`/`lulls`/`pace` keys to be
  names; on a new file, ids. The colon check on student names goes; the
  `links` block is accepted when present (legacy) and checked as today.
- `applyStudents` upgrades a legacy course block before writing through ONE
  converter `upgradeCourseBlock(block, links)` — an in-memory function that
  mints ids for string entries, re-keys the block's marks/dates/lulls/pace
  maps and folds `links` into `pid`. `migrateIds` reads a course out of the
  store into that same block shape, calls the same converter, and writes the
  result back — so the two paths cannot drift.

### A5. Surfaces

- `Header.jsx`: `<option key={r.id} value={r.id}>{r.name}</option>`;
  `setActive(e.target.value)` unchanged in shape.
- `SidePanel.jsx`: chips `key={r.id}`, `data-rm={r.id}`, text `r.name`,
  `linkedPerson(r.id)`; the Failures card heading prints `nameOf(s)`; the
  lull-copy list filters by id and prints names; Overall's `— {name}`.
- `Pop.jsx`, `ShowAllPanel.jsx`: titles print `nameOf(core.active)`.
- `Modals.jsx` crew order: `read: () => core.roster.map(r => r.name)`,
  save unchanged (names → `reranked`).
- The people bridge (`people.js`, `peoplewire.ts`, `TrackerPage.tsx`) is
  untouched.

## Part B — the scheduler (`src/engine/`, `src/state/`)

### B1. `src/engine/rowids.ts` (new)

```ts
export function mintRowId(){ return 'r'+Date.now().toString(36)+Math.random().toString(36).slice(2,8); }
/* Walk every row of every day; mint a missing rid; re-mint a duplicate (a row
   copied by a day template, a duplicated wave or a draft carries its source's
   id — the copy is a new row). Returns the number minted. */
export function ensureRowIds(days:any[]):number
```

Rows walked per day: `allhands[]`, `waves[]` → `formations[]` →
`aircraft[]`, `sims.amt[]`, `sims.oft[]`, `dutywaves[]` → `rows[]`,
`ground[]`. A `seen` set across the whole week decides duplicates.

### B2. Where it runs

`state/history.ts`: `histInit()` and `histPush()` call `ensureRowIds(DAYS)`
first. That covers boot (`main.tsx` hydrate → `histInit`), every mutation
(`afterSchedMutate` → `markEdit` → `histPush`), every week load (`loadWeek`
re-baselines with `histInit`), a stash written by a pre-change browser, an
amendment restore or draft switch that installs id-less rows from an old
snapshot (they mint at the epilogue), and the undo stack (a snapshot always
carries ids because it is taken after the call).

### B3. Declared types

`schema.ts`: `rid?: string` on `AllhandsRow`, `GroundRow`, `AircraftSeat`,
`Formation`, `Wave`, `SimRow`, `DutyRow`, `DutyBlock`, with the comment
"stable row id — minted by `rowids.ts`, never printed, optional only before
the first `histInit`". `schema.test.ts`: `rid:'string?'` on the eight specs;
the after-boot block additionally asserts every row HAS one (a
`rowsHaveIds(days)` walk); the after-edits block conforms rows minted by
`makeStandalone`, `waveFromTpl`, `blockFromTpl` after an `ensureRowIds`.

## Part C — tests (red first)

Tracker (`tracker.test.tsx`, `fileFormat.test.ts`, `smoke.mjs`):
1. Migration: seed old-shape keys for two syllabi + `v3:links`, load the
   course → roster objects, same name → one id across syllabi, marks/dates/
   pace/lulls/last re-filed, `pid` folded, old keys gone, links empty, flag
   set, second load a no-op.
2. Add: typed → `{id,name}` no `pid`; picked → `pid`; same-name dedupe;
   same-`pid` dedupe; the standalone prompt pinned test unchanged.
3. Marks by id: grade → `:m:<id>` written, `:m:<name>` never; undo `who` is
   the id and the tooltip reads the name.
4. Remove: id-keyed keys and maps gone, undo pruned, `lastCrew` cleared.
5. Course rename, syllabus rename, duplicate syllabus: keys move by id.
6. Export shape; import of a NEW file; import of a LEGACY file (string
   roster + `links`) lands as ids with `pid`.
7. A student name with a colon is accepted (the guard is gone); course and
   syllabus names still refuse one.
8. `fileFormat.test.ts`: both roster shapes accepted; a mixed one refused;
   the id-keyed maps checked.
9. `smoke.mjs`: helpers read option TEXT (`rosterNow`, `addStudent`), chip
   removal finds the chip by name then its `.x`, direct key reads resolve
   the id via `__coreForTests.roster`; one new check seeds a legacy-shape
   store in `localStorage` before load and sees the converted roster.

Scheduler (`rowids.test.ts`, `schema.test.ts`, existing parity):
1. `ensureRowIds` on the seed week mints one per row, returns the count,
   second call returns 0; a duplicated row is re-minted; ids unique.
2. Every add path yields a row with `rid` after `histPush` (`+ Line`,
   `+ Wave`, standalone, template wave, template duty block, sim, ground,
   programme, an input landing a ground row).
3. Deleting a row leaves every OTHER row's `rid` unchanged (the whole
   point); reorder likewise; undo restores the same ids.
4. `restoreDayVersion` from a snapshot without ids → rows carry ids after
   the epilogue.
5. `html.test.ts` byte-identical (unchanged test), `parity.test.ts`
   unchanged, `tfin.js` 728/0.

## Part D — documents

`docs/data-schema.md` (roster shape, id-keyed records, `rid` on rows, the
loose spots 1 and 3 rewritten), `docs/data-model.md` (§Enrolment "from
today" now maps `id`; §ScheduleRow "rid" as the migration key; stage-2 row
marks the two halves done, the addressing rewrite left), `docs/handover-
dataverse.md` (item 1 done, what the keys are), `CLAUDE.md` (the Tracker
paragraph; the slot-key grammar gains one line: rows also carry `rid`),
`HANDOFF.md` (the `EditLog.rowId` and course/syllabus-id follow-ups),
`docs/tracker/known-gaps.md`, `docs/feature-impact.md` (the Tracker export
row).

## Not in this round

Student rename control · course and syllabus ids · `EditLog.rowId` ·
re-addressing schedule rows by id (the `keys.ts` rewrite) · `Attempt` rows
behind the mark summary.

## Order of work and time

A (Tracker) ≈ 4–5 h on the heavy path; B (rows) ≈ 1.5 h; C runs inside A/B
red-first; D + gates + the built-bundle drive ≈ 1 h. Two commits (Tracker;
rows), one PR on the branch, the preview link, HOLD for "merge live".
