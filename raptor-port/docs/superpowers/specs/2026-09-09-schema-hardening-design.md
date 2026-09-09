# Schema hardening + the person → Tracker link — design

**Date:** 9 Sep 26 · **Branch:** `claude/read-handoff-docs-wuftw9` · **Status:** implemented in this branch.

The technical team's recommendation (9 Sep 26): "define the application's
data model and database schema … syllabus structures, training events,
students, progression records and scheduling data to support live data
updates, multi-user access and long-term maintainability." The owner's
addition, same day: "a person is also linked to the tracker and can be
selected to be placed in a course … fix most of what you think is correct
… make sure the functionality is not affected."

`docs/data-schema.md` is the map of what the app stores today. This spec is
the set of changes that move it toward the designed model in
`docs/data-model.md` WITHOUT changing what any screen does. Every item here
is a behaviour-preserving addition; the byte parity gate (728/0), the
geometry suite and the Tracker smoke suite stay the proof.

## Decisions

| Question | Decision |
|---|---|
| Where does the person identity live? | Raptor's `PEOPLE` id is THE person id, app-wide. Leave War already projects it; the Tracker now links to it. No second identity is minted. |
| How does the Tracker reach Raptor's people? | A third no-import bridge module, `src/tracker/people.js`, in the exact shape of `role.js`: a setter Raptor calls, a getter + subscribe the Tracker reads. The Tracker never imports the engine (the chunk must stay a lazy island); Raptor never imports `core.js`. Wired from `TrackerPage.tsx` (the existing page seam), change-guarded by signature the way Leave War's `reprojectRoster` is. |
| Are students re-keyed by person id? | **No — not this round.** Marks, dates, rosters, undo and the 399-check smoke suite all key students by their typed name. Re-keying is stage 2 (stable row ids) work. Instead a LINK record maps `course → student name → person id`. It is additive: a student with no link behaves exactly as today. |
| Where do links live? | One record, `raptor:tracker/v3:links` = `{ [course]: { [studentName]: personId } }`, loaded at `init`, saved on every change, moved by course rename, dropped with the student. Rides Export/Import as a third block `links` beside `charts`/`students`. |
| How is a person "selected to be placed in a course"? | The Students card's `+ Add` opens the same dialog it always did, now with a searchable list of the squadron roster ABOVE the free-text box. Picking a person adds them under their callsign (upper-cased, as every roster name is) and records the link. Typing a name still adds an unlinked student, so a visitor from another unit still works and the smoke suite's `#dlgInput` flow is unchanged. |
| Who is offered? | Every non-archived, non-sentinel, non-ground person; OCU-category first, then by seat then callsign. A person already on this roster is shown but not re-added (today's silent dedupe, kept). |
| Who marked, and when? | Every mark and date write stamps `by` (Raptor's `HOOKS.whoami()` display name via the bridge; omitted when unknown) and `at` (ISO instant). Extra fields ride the same records; the file check already tolerates them; undo snapshots restore them verbatim. |
| The colon in names | Course, syllabus and student names are storage-key segments joined by `:`. A name containing `:` is refused at every entry point (add/rename) with a plain message, and a file carrying one is refused by `fileFormat.js` naming the offending part. |
| Scheduler shapes | Declared as TypeScript types in `src/engine/schema.ts` and PROVED by a runtime conformance test over the shipped seeds. The live exports stay `:any` (the verbatim-port rule); the types are the contract the database step builds to. |
| Dates, positional keys, whole-record blobs, version/ETag | Not changed here — parity-locked or storage-seam stage 2/3 work. Recorded in `docs/data-model.md` as the target and the migration rule. |

## Part A — the person bridge and the link

### `src/tracker/people.js` (new, no imports)

```js
let list = []            // [{ id, cs, seat: 'FCP'|'RCP', q, sxo }]
let who = () => ''       // display name of the editor, '' when unknown
const subs = new Set()
export function setPeople(next) { /* no-op if signature unchanged; else replace + notify */ }
export function getPeople() { return list }
export function onPeople(f) { subs.add(f); return () => subs.delete(f) }
export function setWhoami(fn) { who = typeof fn === 'function' ? fn : () => '' }
export function whoami() { try { return String(who() || '') } catch { return '' } }
```

`tracker.test.tsx` already guards that `role.js` imports nothing; the same
guard covers `people.js`.

### Wiring — `TrackerPage.tsx`

On mount, subscribe to Raptor's store (`subscribe` from `src/state/store.ts`)
and on every notify project `PEOPLE` → `setPeople(projectForTracker(PEOPLE))`;
the bridge's own signature guard makes an unrelated notify a no-op. Also
`setWhoami(() => HOOKS.whoami())` once. The projection lives in
`src/tracker/peoplewire.ts` (a Raptor-side file that imports the engine; it
is imported by `TrackerPage.tsx` only, never by the Tracker chunk):

```
projectForTracker(PEOPLE):
  skip archived, special, pers, seat GND
  → { id, cs, seat, q: q||'', sxo: !!sxo }
  sort: q==='OCU' first, then seat (FCP before RCP), then cs
```

### Links — `core.js`

- Key `kLinks = 'v3:links'`; in-memory `LINKS = {}` loaded in `init` (parse
  as object, absent/corrupt → `{}`), saved by `saveLinks()`.
- `linkOf(course, name) → personId | null`; `linkedPerson(name)` → the bridge
  person for the current course, or null.
- `addStudent()`: opens `uiPick('Add a crew member', people, {input: true,
  placeholder: 'Or type a callsign'})`. Result `{pick: id}` → name =
  `cs.toUpperCase()`, add as today, then `LINKS[course][name] = id`,
  `saveLinks()`. Result string → add as today, no link. Empty/cancel → return.
- `removeStudent(r)`: also deletes `LINKS[course][r]` (saves if it changed).
- `renCourse`: moves `LINKS[old]` → `LINKS[new]`.
- Export: `collectLinks()` → `{ [course]: { [name]: id } }` for the courses
  being exported; `buildFile` gains `links` + `contains.links`.
  Import: `checkLinks` (object of objects of strings) and `applyLinks`
  (merge per course, only for names present on that course's rosters after
  `applyStudents`) — applied only on the students "yes" path.

### The dialog — `uiPick`

`_dlgShow` gains `list: [{ key, label, sub }]` and `filter: true`. `DlgModal`
renders a search box (`#dlgFilter`) and a scrolling list (`#dlgList`, one
`button.dlg-item[data-key]` per entry, label + muted sub-text) above the
existing `#dlgInput` when both are present. Clicking an item resolves
`{ pick: key }`; OK resolves the input text as today. Copy is production:
title "Add a crew member", list heading "From the squadron roster", input
placeholder "Or type a callsign". No list → the dialog is byte-for-byte the
old prompt.

### The roster chip

In `SidePanel.jsx` a linked student's chip carries `class="linked"` and a
`title="On the squadron roster as <callsign>"`; CSS (scoped under
`#page-tracker`) draws a small accent dot before the name. Nothing else on
screen changes.

## Part B — Tracker hygiene

- **Colon guard.** `addStudent`, `addCourse`, `addSyl`, `renCourse`,
  `renSyl`: a trimmed name containing `:` → `uiAlert('A name can't contain
  a colon (:), because the app uses it to file the record.')`, return.
  `fileFormat.js`: `checkCharts` refuses a syllabus name with `:`;
  `checkStudents` refuses a course, syllabus or student name with `:` — each
  message names the part.
- **Provenance.** A helper `stamp(rec)` in `core.js` sets `rec.at = new
  Date().toISOString()` and `rec.by = whoami()` (deleted when `''`). Called
  in `popGrade`, `popFail`, `setDoneDate`, `setFailDate` on the mark record,
  and in `setLastSyll/setLastCurr/setDownDays/setUpchit` + `flownOn` on the
  `dates[s]` record. Undo/redo restore snapshots verbatim (they carry the
  stamps of the time). No screen reads them yet.

## Part C — scheduler schema types

`src/engine/schema.ts` declares (from `docs/data-schema.md` + the field
inventory): `Person`, `Quals`, `SanQ`, `Input`, `InputType`, `Day`,
`AllhandsRow`, `Wave`, `Formation`, `Aircraft`, `AircraftOpts`, `SimRow`,
`DutyWave`, `DutyRow`, `GroundRow`, `Sched`, `Amendment`, `WeekSnapshot`,
`WeekStashSnapshot`, `PlanPuck`, `DayRmk`, `ELogRow`, `DayTpl`, `WaveTpl`,
`DutyTpl`, `QualCol`, `RuleOverrides`, `Lookahead`, `SettingsRecord` union.
Doc comment on each field: meaning, unit, who writes it.

`src/engine/schema.test.ts`: a small structural checker (no dependency)
walks `PEOPLE`, `INPUTS`, `DAYS`, `WEEK2_DAYS`, the initial `SCHED`, a
`histSnap()` and a `weekStashSnap()` and fails on an unknown field or a
wrong primitive type — so a new field added to a seed without a type is a
red test, and the types cannot drift from the data. The live exports keep
`:any`.

## Part D — the documents

- `docs/data-model.md` (new): the designed model for the technical team —
  entities, ids, ownership/timestamps/versioning, one date format, the
  Person ↔ Student link, Attempt history, how today's records map onto it,
  the migration recipe, the database-stage requirements carried from the
  storage-seam spec.
- `docs/data-schema.md`: the Tracker section gains links, `by/at`, the
  colon rule; the loose-spots list is updated (1 → declared; 8 → the bridge).
- `CLAUDE.md`: the Tracker's seams — role.js, TrackerPage.tsx, and now the
  people bridge; "No data crosses yet" is superseded.
- `HANDOFF.md`: file map + the one open item (re-keying students by id is
  stage 2).

## Tests (each must be red before its change)

- `people.test.ts`: signature guard (same list twice → one notify), whoami
  fallback, import-free.
- `tracker.test.tsx`: `TrackerPage` pushes a projection (OCU first, no
  archived/GND/special), `addStudent` with `{pick}` adds under the callsign
  and links; a typed name adds unlinked; remove drops the link; rename moves
  it; a colon name is refused with the message; a mark write stamps `by/at`
  and undo restores the old stamp; Export carries `links` and Import applies
  them only with students.
- `fileFormat` (new `fileFormat.test.ts`): colon refusal messages; `links`
  validation.
- `smoke.mjs`: + checks — picker lists a roster person, picking adds and
  marks the chip linked, typed name still works, export file has `links`.
- `schema.test.ts` as above.

## Gates

`npm run build` · `node reference/tfin.js` 728/0 · `npm test` ·
`npm run test:e2e` · `npm run smoke:tracker` · the vite-preview drive with
screenshots of the picker (desktop + phone).

## Public-repository rule

No real names, marks or dates. The picker is driven by the invented demo
roster; smoke fixtures stay `STUDENT A`-style placeholders.
