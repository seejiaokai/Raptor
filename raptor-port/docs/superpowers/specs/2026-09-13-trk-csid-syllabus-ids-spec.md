# [TRK-CSID] Phase 2 — stable hidden ids for Tracker SYLLABUSES (spec)

**Status:** REV 3 — Astra R1+R2 dispositions folded in (§14, §15 are BINDING and
supersede any earlier clause they touch) · 13 Sep 26 · awaiting Astra R3
**Part of:** `[ARCH-STACK]` step 1 (stable ids everywhere) · `[TRK-CSID]` 1B-ii
**Predecessor:** Phase 1 — COURSE ids (`2026-09-13-trk-csid-course-ids-spec.md`,
4-round Astra red-team, APPROVED, LIVE). This phase MIRRORS its shape; where a
mechanism is identical (mint grammar, fail-closed boot, read-back discipline,
reconcile-by-name on import) this spec points at Phase 1 rather than restating it.

**Owner decisions (13 Sep 26), BINDING — they set this spec apart from Phase 1:**
1. **CONVERSION = "keep charts, reset marks" (NOT a full in-place migration).** The
   owner hand-wrote every flow chart and syllabus, but is happy to lose student
   marks/enrolments (pre-promulgation demo data). So the build **converts the GLOBAL
   chart catalogue in place** (definitions, layouts, order, hidden/alias/tomb — all
   his hand-drawn work, kept automatically) and **RESETS the per-(course,syllabus)
   student layer** (rosters, marks, dates, pace/lulls/last) rather than migrating it.
   This deliberately removes the single riskiest piece — moving thousands of
   mark/date records whose key carries the syllabus name in the MIDDLE segment.
2. **Safety backup first.** Before the new code reaches his live browser, the owner
   exports a **charts-only** backup (⤓ File → Export, charts ticked, students OFF,
   ALL syllabuses selected). Insurance only; the in-place catalogue conversion is
   designed to preserve the charts without it.
3. **RELAX the colon refusal** on syllabus/chart names in THIS phase (§8). Once a
   syllabus is id-keyed its name is a label, exactly as a student name became when
   students got ids.

**Model/process:** HEAVY (persisted data, silent-defect risk). Build on Opus 4.8
high, test-first. Astra red-teams THIS spec to APPROVED. Fable-high inspects the
built diff (steered at reload/hydrate, the catalogue conversion, the student-layer
reset, built-in reconcile, import). Full gates. Push + Vercel link, **HOLD for
"merge live".**

---

## 1. Problem

Students (10 Sep 26) and courses (13 Sep 26, Phase 1) carry stable hidden ids;
**syllabuses do not.** A syllabus is still its typed NAME, and that name is:

- a **global-catalogue key** — `CUSTOMS` (`v3:master:syls`) is `{name: events}`;
  layouts `v3:master:lay:<name>`; the order/hidden/alias/tomb prefs are
  name-arrays / name-keyed objects (`v3:master:sylorder|sylhidden|sylalias|syltomb`).
- a **per-course key MIDDLE segment** — `v3:<courseId>:<name>:roster`,
  `v3:<courseId>:<name>:m:<studentId>`, `v3:<courseId>:<name>:d:<studentId>`.
- the **current-chart pointer** — `plan.sylName` (per course), read everywhere via
  `curSyl()`; `kMarks`/`kDates`/`kLayout` bake `curSyl()` into the key at read time.
- **named in shipped code** — the built-in templates are keyed by name in
  `SYLLABI` / `SYL_NAMES` (`data/syllabi.js`), `DEFAULT_LAYOUTS` (`data/layouts.js`),
  `EVENT_INFO_BY_SYL` (`data/eventInfo.js`), plus `SYL_RENAME`
  (`{'FG JUL 26':'2026','Default July 26':'2026'}`) and the `SYL_ALIAS`
  layout-borrow map.

So **renaming a syllabus moves data by name** — `renSyl` (`core.js:3426`) is a
delete-and-recreate dance: it copies the flow into `CUSTOMS[newName]`, tombstones
the old (`SYL_HIDDEN.push`, `SYL_TOMB[old]=1`), copies the layout, sets
`SYL_ALIAS[new]=base`, rewrites `SYL_ORDER`, and calls `moveSylData(old,new)`
(`core.js:3144`) to walk every course and move every student's marks/dates by name.
`delSyl` / `dupSyl` are the same shape. Two browsers naming a chart the same thing,
or an old backup, cannot be reconciled by identity.

**Why this is harder than courses (the two extra dimensions):**
- **Built-ins are code-referenced.** A course is pure user data; a syllabus name is
  *also* a key into shipped tables. An id scheme must keep the code able to find
  "the 2026 built-in" after the user has relabelled it.
- **The name sits MID-KEY** for the student layer, not as a clean top-level segment
  — the exact hazard that made Phase 1's mark-migration the part everyone red-teamed.
  The owner's "reset marks" decision sidesteps it entirely (§5.3).

## 2. Goal (what "done" means for Phase 2)

1. Every syllabus carries a permanent opaque `id`; the typed name becomes a
   **label**. Built-ins carry a **deterministic, shipped id** (same on every browser
   and build); user-created syllabuses carry a **minted random id** (§3).
2. The **global chart catalogue** re-bases on the id: `v3:master:syls` id-keyed,
   `v3:master:lay:<id>`, and the four prefs id-keyed — converted **in place**,
   read-back-verified, preserving every hand-drawn chart and layout.
3. The **per-(course,syllabus) student layer is RESET** (not migrated): rosters,
   marks, dates, pace/lulls/last cleared to a clean id-native start; each course's
   `plan` keeps its selection by mapping `sylName → sylId`.
4. **Rename / delete / duplicate become label-or-catalogue-only** — no student
   record moves by name (there are none keyed by name after the reset), and a rename
   is `entry.name = …` with a dup guard. The `moveSylData` walk and the built-in
   tombstone-and-shadow dance collapse.
5. **Import/export carry syllabus ids** (file version → 3), with a
   reconcile-by-name/id on import (built-in by deterministic id or name/alias;
   custom by name, store id wins) and older files upgraded on read.
6. **Colon refusal relaxed** on syllabus/chart names (§8).
7. Gates stay green, incl. `smoke:tracker` (trust CI; the addStudent flake is known).
   The conversion ships with **rename/reorder/delete/duplicate/import behaviour
   tests as the first invariant-harness increment** (sequence re-review, SEQ-001).

**Out of scope:** `who→personId` (1C, separate); any change to the enrolment-id
machinery beyond resetting the layer it keys; the event-info store (`v3:eventinfo`
is keyed by EVENT id, not syllabus — untouched).

## 3. Identity model

Two id-spaces, deliberately different, both distinct from course (`c…`) and student
(`s…`) ids so a storage dump is legible:

```
BUILT-IN  →  a shipped, deterministic id (same everywhere, every build)
CUSTOM    →  mintSylId() = 'sc' + Date.now().toString(36) + Math.random().toString(36).slice(2,8)
```

**Grammar** `SYL_ID_RE = /^s[bc][0-9a-z]+$/` — `sb…` built-in, `sc…` custom, no
separator, so it is always a safe key segment and cannot collide with a global
(`courses`/`links`/`master`/`lay`). Enforced at every boundary that accepts an id
from OUTSIDE (import, hand-edited store), exactly as `COURSE_ID_RE` is.

**Why deterministic ids for built-ins (and the rejected alternative — RED-TEAM
THIS, §13.1).** Built-ins are named in shipped code. Two clean designs exist:
- *(A, CHOSEN)* **Deterministic shipped id.** A code table
  `BUILTIN_SYL = [{ id, name, aliases? }]` gives each built-in a stable id that
  never changes — not even when its display name changes via a user rename or a
  shipped `SYL_RENAME`. `SYLLABI`/`DEFAULT_LAYOUTS`/`EVENT_INFO_BY_SYL` stay keyed
  by name; the table maps id↔name so `sylSource(id)` resolves the shipped
  definition. A new shipped built-in appears in the table with its own fixed id.
  Cross-browser a built-in has the SAME id, so importing a built-in chart matches
  by id with no reconcile. `SYL_RENAME` becomes the table's `aliases` (old shipped
  names that resolve to the entry's id).
- *(B, REJECTED)* **Random per-browser id + reconcile-with-shipped-code every boot.**
  Mirrors the "mint random, reconcile by name" style, but forces a new, complex,
  every-boot reconcile pass (match each shipped built-in to a stored entry by an
  anchor, mint if missing, follow `SYL_RENAME` to keep the id stable). More moving
  parts, more bug seams — the kind of mechanism `prefer-guardrail-over-bug-cascade`
  says to avoid. (A) needs no per-boot reconcile: a built-in's id is a pure function
  of the code table.

**The catalogue.** In memory, `SYLS` is the ordered live list of
`{ id, name, base? }`:
- **built-in** — `base` = the shipped `SYLLABI` key it draws its definition,
  default layout and per-syllabus event-info from; `name` = the display label
  (initially `base`, editable); `id` = the table's fixed `sb…`.
- **edited built-in** — same entry, plus an override definition stored under its id
  in `v3:master:syls` (today: `CUSTOMS[name]` shadowing `SYLLABI[name]`).
- **custom** — no `base`; definition under its `sc…` id in `v3:master:syls`.

Helpers on `core.js` (mirror the course helpers):
- `sylName(id)` → label, `''` if unknown. `sylIdOf(name)` → id of the first
  syllabus with that name, or `null`.
- `curSylId()` → `plan.sylId` (replaces `curSyl()` as the key input); `curSylName()`
  → `sylName(plan.sylId)` for status/prompt text.
- `sylSource(id)` → `customDefs[id] || (entry.base ? SYLLABI[entry.base] : null)`.
- `builtinOf(id)` / `isHidden(id)` take ids.

New syllabuses are **born id-keyed** — `addSyl`/`dupSyl` mint an `sc…` id and file
under it, like `addCourse`.

## 4. Storage keys

No key **shape** changes — only the value in the syllabus segment changes from name
to id. Global keys (`SYL_NS = 'v3:master'`):

- `v3:master:syls` — custom/edited definitions, now `{ sylId: events }`.
- `v3:master:lay:<sylId>` — layout per syllabus id (was `…:lay:<name>`).
- `v3:master:sylcat` — **NEW**: the catalogue index `{ id, name, base? }[]` (the
  live `SYLS`), so labels, custom membership and built-in relabels persist. (Today
  the "index" is implicit — built-ins from code, customs from `Object.keys(CUSTOMS)`.
  With relabellable built-ins and stable ids it must be stored.)
- `v3:master:sylorder` — display order, now `sylId[]`.
- `v3:master:sylhidden` — hidden set, now `sylId[]` (built-in ids).
- `v3:master:sylalias` — layout-borrow map, now `{ sylId: baseSylId }` (or folded
  into the catalogue `base`; §6 — RED-TEAM whether `SYL_ALIAS` survives at all).
- `v3:master:syltomb` — deleted set, now `{ sylId: 1 }` (built-in ids the user
  deleted, so the catalogue never re-offers them).

Per-course keys (syllabus id is the MIDDLE segment), **created fresh after the
reset**: `v3:<courseId>:<sylId>:roster` · `…:<sylId>:m:<studentId>` ·
`…:<sylId>:d:<studentId>`. `plan.sylId` replaces `plan.sylName`.

**Unchanged:** `v3:eventinfo` (event-id-keyed, global — NOT syllabus-scoped);
course-level keys (`v3:<courseId>:plan|lastStudent|…` — reset in content §5.3 but
same shape); `v3:courses`/`v3:links`/`v3:master:*` global namespace.

`kMarks`/`kDates`/`kLayout` switch from `curSyl()` (name) to `curSylId()` (id).
Layout-fallback adoption (`kLayoutOldMaster`/`kLayoutOwn`, legacy) is dropped by
the reset — their content is legacy student/own-layout state, not catalogue.

## 5. Conversion — `migrateSylIds()`

Runs once per browser, id `kSylIdMig = 'v3:sylidmig'` (one-shot flag), scratch
`kSylIdMap = 'v3:sylidmap'`. Same read-back discipline as `migrateCourseIds`
(`core.js:636`): derive the name→id map, write it durably and read it back before
moving anything, move-verify-then-delete each key, write the index LAST, set the
flag only when everything verified, fail-closed on any error. It has **two halves**:
a KEEP half (global catalogue, converted) and a RESET half (student layer, cleared).

### 5.1 Where it runs
In `init()`, **after `migrateCourseIds()` (Phase 1) and `loadCourses()`, BEFORE
`migrateAllCourses()`/`loadCourse()`.** Course ids must already be settled (the
student-layer keys the reset clears are `v3:<courseId>:…`). One retry on the same
boot (mirror the course retry). On failure → `setBootError(...)` (fail-closed boot,
§7), no board, no writers.

### 5.2 KEEP half — convert the global catalogue (his hand-drawn charts)
1. **Assemble the name set** from every source, so nothing is missed: `SYL_NAMES`
   (built-ins, incl. `SYL_RENAME` targets), `Object.keys` of `v3:master:syls` and
   the legacy custom stores (`kSylsOldMaster` `v3:SYLLABUS EDIT:syls`, each course's
   `kSylsOwn` `v3:<courseId>:syls`), the four prefs' names, every `v3:master:lay:<name>`
   suffix, and each course's `plan.sylName` (+ `plan.__oldSyl`).
2. **Assign ids:** a built-in name (or a `SYL_RENAME`/`aliases` source) → the table's
   deterministic `sb…` id; every other name → a minted `sc…` id (reuse the durable
   scratch map on a resumed run). Refuse a name that resolves to no safe id.
3. **Write the map durably and read it back** (mirror `kCourseIdMap`).
4. **Move the global keys** (each `moved(from,to)` read-back-verified):
   - `v3:master:syls`: re-key the object `{name:events}` → `{id:events}` (built-in
     shadows land under the built-in id; customs under their minted id). Fold in the
     legacy `kSylsOldMaster`/`kSylsOwn` custom defs first, then purge those legacy
     keys.
   - `v3:master:lay:<name>` → `v3:master:lay:<id>` (prefix move via `storage.list()`,
     colon-bounded, reserved-skiplist — same machinery as Phase 1's `v3:lay:` move).
   - `sylorder` (`[name]`→`[id]`), `sylhidden` (`[name]`→`[id]`), `sylalias`
     (`{name:base}`→`{id:baseId}`), `syltomb` (`{name:1}`→`{id:1}`).
5. **Write the catalogue index** `v3:master:sylcat` = `{id,name,base?}[]` LAST and
   read it back (the index every later reader keys off — mirror COURSES written last).

### 5.3 RESET half — clear the student layer (the risky part, thrown away)
For every course id `C` in `COURSES`, delete via a `storage.list()` scan (bounded,
cannot miss a key):
- `v3:<C>:<seg>:roster` · `v3:<C>:<seg>:m:<*>` · `v3:<C>:<seg>:d:<*>` (any middle
  `seg`), plus the pre-split flat `v3:<C>:roster` and legacy `v3:<C>:d:<*>`;
- `v3:<C>:lulls:<*>` · `v3:<C>:pace:<*>` · `v3:<C>:last:<*>` · `v3:<C>:lastStudent`;
- reset the migration flags to a clean id-native start: `v3:<C>:rostermig = 1`,
  `v3:<C>:idmig = 1`, delete `v3:<C>:idmap`;
- convert `v3:<C>:plan`: `sylName → sylId` via the §5.2 map (so the course reopens on
  the same chart), drop `__oldSyl`, keep the rest (`mode`, `epw`, `target`; clear
  `lulls` if it referenced students — RED-TEAM §13.4).
Then re-seed the demo pair once on the default course exactly as a fresh store would
(so `smoke:tracker` still finds STUDENT A/B) — the reset returns each course to the
"born clean" state `addCourse` produces.

**Reset is delete-only and idempotent**; a half-done reset simply finishes on the
retry/next boot (the flag is set only after both halves verify). Because it only
DELETES the student layer and only WRITES the catalogue, there is no move whose
partial failure can strand a mark — the failure modes Phase 1 fought are gone.

### 5.4 Durability / two-tab (inherited, NOT new)
Identical profile to `migrateCourseIds`/`migrateIds`: the read-back proves the
in-memory whiteboard, not the backend; two tabs are un-serialised. This is
`[TRK-DISK]`, owned by `[DB-STEP]` (RC5). Do NOT wire `flushNow` (Astra confirmed in
Phase 1 it is not a durability barrier). Flag to owner as an inherited limitation.

## 6. Rename / delete / duplicate become catalogue-only

- **`renSyl`** collapses to: prompt, trim, dup-name guard against `SYLS.map(s=>s.name)`,
  set the entry's `name`, `saveSylCat()`, refresh. **No** `moveSylData`, **no**
  tombstone-and-shadow, **no** layout copy, **no** `SYL_ALIAS` rewrite. A built-in
  rename is now a pure relabel that keeps its id, its `base` (shipped definition) and
  its layout. This is the headline test.
- **`delSyl`**: remove the entry from `SYLS` (custom) or mark its id in `syltomb` +
  `sylhidden` (built-in, so the catalogue never re-offers it); delete
  `v3:master:syls[id]` and `v3:master:lay:<id>`; drop it from `sylorder`. Keep the
  "revert edits only" branch for a built-in (delete just the override under its id).
  No per-course record to purge (student layer is id-keyed; deletion leaves orphan
  `v3:<C>:<deletedId>:…` records — acceptable, and a `delSyl` may sweep them by
  prefix, RED-TEAM §13.3).
- **`dupSyl`**: mint an `sc…` id, copy the flow into `v3:master:syls[newId]`, the
  layout into `v3:master:lay:<newId>`, add the catalogue entry; **no** mark copy
  (student layer starts empty on the copy — a change from today, acceptable under the
  reset, RED-TEAM §13.3).
- **`moveSylData` and `purgeLegacySyl` are DELETED.** `SYL_ALIAS` may be deletable
  too — with stable built-in ids, a relabelled built-in still resolves its layout via
  its own `base`; alias only mattered when the name was the identity (§13 Q).

`switchSyllabus`/`switchSylNow` operate on ids; the dropdown/reorder pass ids;
labels render via `sylName`.

## 7. Fail-closed boot & reserved-name guard

- **Fail-closed boot** — reuse Phase 1's exact shape (`bootError` + `setBootError`
  that `notify()`s; `App` renders the reload panel with no board, no writers). If
  `migrateSylIds` cannot verify after its one retry, boot fails closed. The
  preflight refuses a syllabus name that cannot be safely converted (a name that
  after §8 still cannot be a stored label — none, since colon is now allowed and the
  name is no longer a key; the only preflight failure is an internal invariant break,
  e.g. a stored id that violates the grammar).
- **Reserved built-in id space** — user-minted ids are `sc…`; the `sb…` space is the
  code table's alone. A minted id can never collide with a built-in.

## 8. Colon relaxation (owner decision)

Drop `refuseColon` from `addSyl`/`renSyl`/`dupSyl` and `noColon('chart'|'syllabus',…)`
from `fileFormat.js` — a syllabus/chart name is a label after this change, not a key
segment, exactly as a student name became. **Course names KEEP the refusal** (course
ids are the segment, but a course name is still shown in name-keyed reconcile — leave
Phase 1's rule; revisit if 1C touches it). Note in code + docs that the relaxation
rides the syllabus id conversion. Add a test: a chart named `A/G: A/A` imports and
renames cleanly.

## 9. UI touch-points

- **Header.jsx** syllabus `<select>`: option `value` = syllabus **id**, text = name;
  `onChange` → `switchSyllabus(id)`. The export/import "pick syllabuses" list
  (`copyPick`) keys by id, labels by name.
- **OrdModal (syllabus mode)** — today lists NAMES and `saveOrderList(names)` sets
  `SYL_ORDER`. Syllabus names are unique among syllabuses, so keep the **names-in-modal**
  pattern (like course mode, review CSID-09): the modal item is the name, `saveOrderList`
  reranks `SYL_ORDER` (ids) via a name→id map. Confirm the shared `OrdModalInner` needs
  no change. `restoreHiddenSyl` takes an id.
- Any status/prompt string that showed the syllabus name reads `sylName(id)`.

## 10. Import / export (file version 2 → 3)

`fileFormat.js`:
- `FILE_VERSION = 3`. `readFile` accepts v1/v2/v3 (`version <= FILE_VERSION`).
- **charts block** gains syllabus identity: `charts.syllabi` / `charts.layouts`
  keyed by syllabus **id**, `charts.order` a list of ids, plus a `charts.sylcat`
  `{id,name,base?}[]` giving each id its label. (`eventInfo` stays event-id-keyed.)
- **byCourse[*].bySyllabus** keyed by syllabus **id** (v3). Since the store's student
  layer is reset, an imported file's marks still apply by id where the ids reconcile.
- **v1/v2 (name-keyed charts) upgrade on read** — a pure `upgradeSyllabi(charts,
  students)` (new in `app/sylIds.js`, mirror `upgradeCourses`): a built-in name (or
  `aliases`) → its deterministic `sb…` id; every other name → a minted `sc…`; re-key
  `syllabi`/`layouts`/`order`/`bySyllabus` throughout; build `sylcat`. Refuse a file
  that gives one id two names or one name two ids (mirror the course/enrolment checks).
- **reconcile-by-name/id on import** (`reconcileSylIds`, mirror `reconcileCourseIds`,
  `courseIds.js:117`): a file syllabus whose id the store already has IS that
  syllabus (built-ins always match by their deterministic id); else name-fallback to
  a store syllabus of the same name (store id wins); reserve every target across the
  whole file; a name that matches a store syllabus under a different id is a
  **conflict → refuse the import** with a named message.
- `checkCharts`/`checkStudents` accept **both** shapes (name-keyed OR id-keyed), never
  a mix, and enforce `SYL_ID_RE` on every id at the boundary (mirror the course-id
  grammar check, review CSID-07).

`core.js` `collectCharts`/`applyCharts` and `readCourseBlock`/`writeCourseBlock`
write id-keyed and read via the reconcile.

## 11. Docs to keep true (same PR)

- **CLAUDE.md** Tracker section: the "Syllabus ids are Phase 2 …" paragraph flips to
  DONE — syllabuses are ids too (built-ins deterministic `sb…`, customs `sc…`);
  the `v3:master:*` grammar note updates; the colon note flips (course names keep the
  refusal, syllabus/chart names no longer). The "keep charts / reset marks" conversion
  is recorded as the chosen strategy.
- **OUTSTANDING.md** `[TRK-CSID]`: 1B-ii → DONE; `[ARCH-STACK]` 1B note updated.
- **HANDOFF.md** file map (`app/sylIds.js` new) / open items.
- **docs/tracker/known-gaps.md**, **docs/data-model.md** / **data-schema.md** where
  they describe syllabus identity; **session-state.md** deleted/rewritten for 1C.

## 12. Tests (test-first; the first invariant-harness increment — SEQ-001)

Classify each invariant before coding (hard / advisory / frozen). New/extended unit
tests under the tracker vitest project:
1. **migrateSylIds — fresh store**: built-ins get their deterministic ids, catalogue
   written, flag set, scratch gone; no student layer to reset.
2. **KEEP half**: a store with custom charts + edited built-ins + layouts + order +
   hidden/tomb → after conversion every chart/layout reads back under its id, labels
   preserved, built-ins under `sb…`, customs under `sc…`, legacy custom stores folded
   in and purged.
3. **RESET half**: a store with rosters/marks/dates/pace/lulls under name-keyed
   syllabus segments → after conversion the student layer is GONE, each course born
   clean (`rostermig`/`idmig` set), `plan.sylId` points at the mapped chart, demo pair
   re-seeded on the default course.
4. **resume after interrupt**: a refused write mid-conversion leaves the flag unset,
   scratch map persists, second run reuses the same ids and completes; no chart lost,
   no student layer half-reset.
5. **rename is catalogue-only** (headline): rename a syllabus (custom AND built-in);
   assert **no** `v3:master:syls`/`lay` key moved (spy the store), only the entry name
   changed, the definition/layout still read by the same id.
6. **reorder / delete / duplicate** behaviour: reorder persists as ids; delete a
   built-in tombs its id (never re-offered) and a custom removes it; duplicate mints a
   new `sc…` with copied flow+layout and empty student layer.
7. **built-in stability across a shipped rename**: an entry whose `base` is a
   `SYL_RENAME`/`aliases` source keeps its `sb…` id and picks up the new label.
8. **file dual-shape**: `readFile` accepts a v2 (name-keyed charts) and a v3
   (id-keyed) file; a mixed/dup/bad-id chart list is refused with a named error.
9. **import reconcile**: a file whose custom syllabus id differs from the store's for
   the same name adopts the store id; a built-in always matches by its deterministic
   id; a name-vs-different-id clash refuses the import.
10. **colon allowed**: a chart named with a colon imports, renames and files cleanly.
11. **round trip** `collectCharts → applyCharts` preserves ids and labels.

Plus `smoke:tracker` green (CI arbiter). Full gate set once before the PR.

## 13. Open questions for the Astra red-team

1. **Deterministic built-in ids (§3, design A) vs random+reconcile (design B).** Is a
   shipped `sb…` table the right call, and does it fully remove the every-boot
   reconcile? Any case where a built-in's id must vary per browser?
2. **KEEP/RESET split integrity.** The conversion converts the global catalogue and
   clears the student layer in one flagged pass. Is any ordering wrong (e.g. can a
   catalogue write land while the student-layer scan is mid-delete and be re-read as a
   syllabus)? Should the two halves have independent flags so a KEEP that verified is
   never redone if the RESET fails?
3. **Orphaned per-course records after delete/duplicate/reset** (§6): student-layer
   records under a since-deleted syllabus id. Sweep by prefix in `delSyl`, or leave
   inert? Any reader that would resurrect them?
4. **`plan` conversion (§5.3).** Mapping `sylName→sylId` per course vs resetting the
   plan wholesale — does anything read `plan.lulls`/`custom`/`__oldSyl` such that a
   partial keep is wrong?
5. **Legacy custom-def sources** (`v3:SYLLABUS EDIT:syls`, `v3:<courseId>:syls`): the
   KEEP half folds them into `v3:master:syls` then purges. Confirm the fold order
   can't drop a def the load-time adoption would otherwise have added, and that
   `SYLLABUS EDIT` (a reserved course name) is handled.
6. **`SYL_ALIAS` retirement (§6).** With stable built-in ids and `base` on the entry,
   is `SYL_ALIAS` fully redundant, or does any layout-borrow path still need it?
7. **Two concurrent boots** running `migrateSylIds` — the read-back + "already holds
   it" idempotency should make it safe (inherited profile); confirm the RESET
   delete-scan is equally safe under a racing writer.
8. **File version bump to 3** for an older deployed build reading a v3 file
   (`version > FILE_VERSION` refusal) — acceptable and messaged, as in Phase 1?
9. **Colon relaxation blast radius (§8)** — any remaining place a syllabus/chart name
   is still used as a key or a `localStorage` segment that the relaxation would break?

---

*Process: this REV 1 goes to Astra (Codex, high) to APPROVED; each changed plan
re-binds to the new SHA, as Phase 1 did (R1→R4). Then build on Opus 4.8 high,
test-first; Fable-high inspects the built diff; full gates; push + Vercel; HOLD for
"merge live".*

---

## 14. R1 — Astra (Codex GPT-6, high) red-team dispositions & BINDING revisions

Astra R1 verdict **REVISE** — 10 findings (5 HIGH + 5 MEDIUM), every one
evidence-backed and confirmed against the real code by the host. **All 10 ACCEPTED.**
This section is authoritative where it conflicts with §§1–13. Plan SHA reviewed:
`fcd780f5…`. (Session `01a09b03-e6f7-78c3-82a7-6c97e8295077`.)

The findings cluster on four things §§1–13 under-specified: (i) the in-place KEEP
rewrite is not safely resumable; (ii) KEEP must collect MORE legacy chart sources,
and MERGE aliases that collapse onto one id without data loss; (iii) the file/import
identity path needs one normalize + one whole-file reconcile, and an
always-present identity catalogue; (iv) deterministic ids still need a boot
reconcile and a defined delete/restore semantics. Binding fixes below.

### CSID2-01 (HIGH — KEEP in-place rewrite is not resumably self-describing) — ACCEPT, REDESIGN §5.2 RESUMABILITY.
Phase 1 was safe because `COURSES` carries `{id,name}` — a half-done index is
self-describing. Re-keying `v3:master:syls`/prefs/layout **in place** to id-only
loses the name, so a retry that re-reads `Object.keys(syls)` sees ids and
mis-treats them as names (and an id-shaped legacy name defeats regex detection).
**Binding fix — drive every conversion off a durable, self-describing map; never
re-discover from mutated stores:**
- **Discovery runs ONCE (fresh run only).** Assemble the name set (§5.2 step 1) only
  when `kSylIdMap` is absent. Write the full **name→id map** to `kSylIdMap` and read
  it back before moving anything (mirror `migrateCourseIds`). Also write the
  **`v3:master:sylcat` `{id,name,base?}[]` index** at this point as the durable,
  self-describing source of truth (it carries BOTH id and name, so a resumed run is
  never ambiguous).
- **A resumed run (map present) drives off the map/sylcat, NOT off re-reading `syls`.**
  Each in-place object conversion is idempotent by construction: for `syls` and each
  pref, rebuild the id-keyed object from `(name→id map) × (whatever the source holds,
  under name OR id)`, so running it twice is a no-op. A key already in id form is left.
- **`plan.sylId` already written is preserved** — the plan conversion (§5.3) checks
  for an existing `sylId` before mapping `sylName`.
- **Two flags, KEEP then RESET.** Split the one-shot flag into `kSylCatMig`
  (catalogue converted + verified) and `kSylReset` (student layer cleared). KEEP sets
  `kSylCatMig` after the catalogue verifies; RESET sets `kSylReset` after the sweep.
  A KEEP that verified is never redone if RESET later fails; boot is "ready" only when
  both are set (else fail-closed retry). (Answers §13 Q2.)
- Tests add: interrupt after each in-place rewrite, after KEEP-completes-RESET-fails,
  and an id-shaped legacy syllabus name.

### CSID2-02 (HIGH — KEEP omits legacy chart layout + definition sources the loader still adopts) — ACCEPT, MUST FIX (this is the "lose a hand-drawn chart" risk).
`loadLayout` (`core.js:292–296`) adopts `v3:lay:SYLLABUS EDIT:<name>` and
`v3:lay:<courseId>:<name>` as chart layouts; `loadCourse` (`core.js:802–811`) adopts
the single legacy definition `v3:<courseId>:syl` when `plan.custom`. §5.2 collected
neither, so a course never opened through those paths could **lose its hand-drawn
layout or definition** on conversion — the exact thing the owner's "keep charts"
decision must not do. **Binding fix — KEEP collects ALL chart sources before
retiring any loader:**
- **Definitions**, precedence highest-wins, per syllabus id: `v3:master:syls[name]` →
  legacy master `v3:SYLLABUS EDIT:syls[name]` → per-course own `v3:<courseId>:syls[name]`
  → the `plan.custom` single `v3:<courseId>:syl` (converted to its own catalogue entry).
- **Layouts**, precedence per syllabus id: `v3:master:lay:<name>` → legacy master
  `v3:lay:SYLLABUS EDIT:<name>` → per-course `v3:lay:<courseId>:<name>`.
- Fold into the id-keyed catalogue/layout FIRST, verify, and only THEN purge the
  legacy source keys. `plan.custom` is cleared only after its def is safely an entry.
- Tests add: a chart whose only layout/def is under each legacy namespace survives.

### CSID2-03 (HIGH — aliases collapse onto one id with no merge/collision policy) — ACCEPT, MUST FIX.
Historical aliases (`'FG JUL 26'`,`'Default July 26'`) and the canonical name all map
to one built-in id, but §5.2 had no policy for their competing definitions, layouts,
labels, hidden/tomb state — and the inherited `moved()` **deletes a source whenever
the destination is non-empty, without checking equal content** (`core.js:671–675`), so
two different layouts collapse by enumeration order; and "one catalogue entry per
discovered name" mints **duplicate entries** for one id. **Binding fix:**
- **Group sources by TARGET id before writing** (never a blind prefix-move for the
  many-to-one built-in case). Deduplicate catalogue entries: exactly one `{id,name,base}`
  per id.
- **Canonical precedence among alias sources:** the canonical shipped name's records
  win, then aliases in the code table's declared order; the winner's label is the
  entry `name`.
- **Never delete a DIFFERING source because its destination exists.** For a
  many-to-one merge, only the chosen winner is written; losing sources are deleted
  only if byte-equal to the winner, else **retained as a recovery copy and the boot
  fails closed** with a diagnostic (do not silently drop a user's differing layout).
- Distinguish a stale alias record from an **independent custom chart that merely uses
  an old shipped name as its typed name** — the latter is NOT a built-in (it has a
  custom def and no built-in provenance), so it takes a minted `sc…`, not the built-in id.
- Tests add: a store holding both `'FG JUL 26'` and `'2026'` layouts (differing) →
  fail-closed, nothing deleted; a custom chart literally named `'FG JUL 26'` → its own
  `sc…` id.

### CSID2-04 (HIGH — student-only / partial exports carry no syllabus labels) — ACCEPT, MUST FIX (file format).
Labels lived only in `charts.sylcat`, but student-only export (charts OFF, students
ON, `core.js:3983–3998`) and `collectStudents` export all courses/syllabuses
independently of chart selection — so a v3 student-only file's custom syllabus id can
never reconcile by name at the destination. **Binding fix:** the file carries an
**always-present, identity-only syllabus catalogue** `students.sylcat`
(`{id,name,base?}[]`, definitions-free) covering **every syllabus id referenced by any
exported `bySyllabus` block or `plan.sylId`**, emitted in student-only and
partial-chart exports too. `charts.sylcat` (when charts are present) may carry the
richer entries; `reconcileSylIds` reads whichever catalogue is present. Import
**validates reference completeness** (every referenced id has a catalogue entry) and
**defines the absent-chart case:** importing students for a custom syllabus not at the
destination and not in the file's charts is **refused with a named message** (no
unreachable records written). Tests add: student-only round trip reconciles by name;
a student block referencing an uncatalogued id is refused.

### CSID2-05 (HIGH — import upgrade mints twice; per-chart reconcile can't reserve across the file) — ACCEPT, MUST FIX (import architecture).
`importClick` calls `describeFile` (→`readFile`, `core.js:4029`) then `readFile` again
(`4032`); if the name→id upgrade mints inside `readFile`, the display list and the
applied charts get **different ids** for the same legacy custom chart, and
`applyCharts` can't find it. The per-name apply loop (`4034–4053`) also can't enforce
§10's whole-file target reservation. **Binding fix — normalize once, reconcile once:**
- `readFile`/`describeFile` are **pure and never mint** (they read + validate only,
  accepting name- or id-keyed shapes).
- `importClick` runs a **single `normalizeImport(obj)`** step that upgrades name→id
  (minting once for legacy customs), then computes **one complete `reconcileSylIds`
  map across the whole file** (built-ins by deterministic id; customs by name, store
  id wins; whole-file target reservation; conflicts → refuse). Every later step —
  the display/duplicate list, replace vs add-as-new, `applyCharts`, `applyStudents`
  plan pointers — consumes THAT one normalized+reconciled result.
- **Add-as-new mints a fresh `sc…` identity** and its imported students (if any) are
  attached to that new id, not the source id.
- Tests add: a legacy custom chart imports and is found by apply (one id end to end);
  two file charts that would reserve the same store id are handled by the one map.

### CSID2-06 (MEDIUM — deterministic ids still require a boot-time catalogue reconcile) — ACCEPT, ADD §5a BOOT RECONCILE.
Deterministic ids remove minting/matching for built-ins but NOT catalogue
maintenance: after the one-shot migration the persisted `sylcat` lacks a
newly-shipped built-in; a stored `base` can name a `SYLLABI` key removed by a shipped
rename (→ `sylSource` returns nothing); and shipped label changes must not clobber a
user relabel. **Binding fix — a boot reconcile (`reconcileBuiltins()`), idempotent,
runs every boot after the catalogue loads AND inside `reloadFromStore`:**
- **Add** each shipped built-in (canonical id from the `BUILTIN_SYL` table) that has
  no `sylcat` entry and is not tombstoned.
- **Repoint `base`** to the canonical shipped key when the stored `base` is now only
  an alias-source (shipped rename), so `sylSource` keeps resolving.
- **Provenance for labels:** the entry carries `userNamed:true` once a user renames it;
  `reconcileBuiltins` updates the label from the shipped name only when `!userNamed`.
- Never mints (built-in ids are deterministic); never touches custom entries.
- Tests add: a newly-shipped built-in appears after migration; a shipped rename keeps
  the id + repoints base; a user-renamed built-in is not relabelled by a shipped change.

### CSID2-07 (MEDIUM — plan legacy student-fallback fields re-seed cleared state) — ACCEPT, MUST FIX.
`loadStudent` (`core.js:940–942`) seeds a student lacking a per-student record from
`plan.lulls` / `plan.epw` / `plan.target` / `plan.target2`, so after RESET a reseeded
or newly-added student **inherits supposedly-cleared scheduling state**. **Binding
fix — RESET zeroes the legacy fallbacks on each course's plan:** `plan.lulls = []`,
`plan.target = null`, `plan.target2 = null`; keep `plan.epw` at the default (2) as a
genuine course pace default (documented), or reset it too — RED-TEAM R2 which. Drop
`plan.__oldSyl`. Test: add a student after conversion + reload → no inherited
lulls/targets.

### CSID2-08 (MEDIUM — deleted built-in records are not inert; restore/import reattaches them) — ACCEPT, DEFINE DELETE = SWEEP.
With a deterministic id, a deleted-then-restored built-in reuses the same id and
reconnects old roster/marks/dates; import un-tombs an id (`core.js:3782–3783`);
`storeSylNames` includes hidden built-ins so `readCourseBlock`/`findEnrolment` still
see retained enrolments. **Binding fix — deletion is a real sweep (matches today's
`moveSylData(nm,null)` and the delete confirmation "removes … every student's marks
on it, in every course"):** `delSyl` sweeps `v3:<courseId>:<sylId>:roster|m:*|d:*`
across ALL courses (bounded `storage.list()` scan), then tombs the id. **HIDDEN ≠
DELETED:** a hidden built-in keeps its records (it is only hidden, still exported/
matched); a **tombstoned** id has none (swept) and `reconcileBuiltins` never re-adds
it. This also disposes of the orphan-record open questions (§13 Q3): delete sweeps;
`dupSyl`'s copy legitimately starts with an empty student layer. Tests add: delete a
built-in with marks → records gone in every course; restore it → comes back empty
(shipped def, no marks); hidden built-in keeps its records.

### CSID2-09 (MEDIUM — OrdModalInner syllabus mode / hidden-restore / tag need id adaptation) — ACCEPT, CORRECT §9.
`Modals.jsx:233` filters shipped NAMES through `isHidden` (finds no hidden ids);
`235–237` passes a NAME to `restoreHiddenSyl` and appends it to a names list; the
syllabus-tag callback (`:205`) passes names to `builtinOf` / indexes `CUSTOMS` by name.
**Binding fix:** the reorder list may still present labels, but syllabus-mode hidden
enumeration, restore and tagging switch to ids — enumerate hidden catalogue/table
entries by id, resolve visible labels→ids for `builtinOf`/`sylSource`, pass **ids** to
`restoreHiddenSyl`, and append the entry's **display label** to the modal list; handle
a label collision when restoring (two entries sharing a label). Confirm against the
real `Modals.jsx` at build. (Supersedes §9's "shared component needs no change.")

### CSID2-10 (MEDIUM — colon relaxation misses the import "Add as new" path) — ACCEPT, MUST FIX.
`importClick` still calls `refuseColon(to)` (`core.js:4050`). **Binding fix:** drop the
syllabus colon refusal there too (keep the blank/duplicate-label checks). Add §8 to
the list; test the Add-as-new dialog path, not only file validation and rename.

### Net effect on §§1–13
- §5.2 rewritten per CSID2-01 (discover-once + durable self-describing map/sylcat,
  two flags), CSID2-02 (collect all legacy layout/def sources, verify-then-purge),
  CSID2-03 (group-by-target, precedence, never-delete-differing, dedupe entries).
- **New §5a** boot reconcile (`reconcileBuiltins`, also in `reloadFromStore`) per
  CSID2-06 — design A (deterministic ids) STANDS, with this reconcile.
- §5.3 RESET zeroes `plan.lulls/target/target2` (CSID2-07).
- §6 `delSyl` = sweep-then-tomb; hidden≠deleted (CSID2-08).
- §9 OrdModal syllabus-mode/hidden/restore/tag id-adapted (CSID2-09).
- §8 colon relaxation includes the import Add-as-new path (CSID2-10).
- §10 file: `sylcat` is an always-present identity catalogue (student-only too,
  CSID2-04); one `normalizeImport` + one whole-file `reconcileSylIds`, `readFile`
  pure/non-minting (CSID2-05).
- §12 tests extended per every disposition above.

### Round 2
These revisions are a changed plan → **re-review by Astra required** (approval binds to
the new SHA). Open for R2: (a) the two-flag KEEP/RESET split + discover-once
resumability — airtight, or any residual re-discovery path? (b) the group-by-target
merge's fail-closed-on-differing-source — right call, or too aggressive? (c) reset
`plan.epw` too, or keep as a course default? (d) any remaining file/import path where
a syllabus id is minted or reconciled more than once.

---

## 15. R2 — Astra dispositions & BINDING revisions

Astra R2 verdict **REVISE** — 6 findings (2 HIGH + 4 MEDIUM), all emergent from the
R1 revisions, all confirmed. **All 6 ACCEPTED.** §15 is authoritative where it
conflicts with §§1–14. Plan SHA reviewed: `a2490c91…`. (Session
`01a09b0c-a940-79c2-af3e-70cd7610cb1f`.) The R2 theme: the resumable rewrite must not
guess name-vs-id (use a payload journal); alias classification must be ONE conservative
rule shared by store + file; the file catalogue must be a validated union carrying
`userNamed`; delete must repair every course's plan; and a single unique-label policy
must cover every catalogue writer.

### CSID2-R2-01 (HIGH — the "name OR id" resumable lookup is still ambiguous) — ACCEPT, REPLACE with a PAYLOAD JOURNAL.
Counterexample (confirmed): shipped id for `2026` is `B`; a legacy custom chart is
literally NAMED `B` and gets `sc…` id `C`. Original `v3:master:syls` is `{2026:D1, B:D2}`;
converted it is `{B:D1, C:D2}`. On retry, name-first lookup mis-assigns `D1` to the
custom; id-first mis-reads the original. `addSyl` only refuses colons/dupes
(`core.js:3403–3412`) so a name equal to another chart's destination id is accepted,
and the two flags don't record which representation a half-written object is in.
**Binding fix — a durable PAYLOAD JOURNAL; never guess name-vs-id, never re-derive from
a mutated store:**
- Replace `kSylIdMap` (name→id only) with `kSylIdJournal` — a single durable record,
  written and read back BEFORE any store mutation, holding the COMPLETE intended
  outputs, computed ONCE from the original sources: the name→id map; the full id-keyed
  `sylcat` (`{id,name,base?,userNamed?}[]`); the full id-keyed `syls` object **with its
  event payloads**; every layout as `{ destKey: payload }` (payload carried, not moved
  from a possibly-clobbered live key); the id-forms of order/hidden/tomb/alias; the
  per-course `plan.sylId` map; and the explicit lists of legacy keys to purge and (at
  RESET) student-layer keys to sweep.
- **Apply = replay the journal**: whole-object writes for `syls`/`sylcat`/prefs, and
  each layout written from the journal's carried payload to its dest key, then source
  purge — read-back-verified. Whole-object/whole-key writes from carried payloads are
  idempotent, so a retry simply re-applies; there is no live-object to mis-parse.
- **Journal atomicity:** `kSylIdJournal` is written+read-back before any mutation; the
  KEEP flag lands only after the whole replay verifies. If the journal write itself is
  interrupted, no mutation has begun. (Map/catalogue init is one durable record, closing
  the "separate writes" gap R2 flagged.)
- Test: a legacy label equal to another chart's destination id, differing
  defs/layouts/prefs, interrupted after each apply step → resumes correctly, no swap.

### CSID2-R2-02 (HIGH — alias→built-in classification lacks provenance and diverges store vs file) — ACCEPT, ONE SHARED CONSERVATIVE CLASSIFIER.
Legacy data carries no provenance (`persistSyl` stores name→events, `collectCharts`
exports names/defs/layouts only), and §10 mapped every historical alias name to the
built-in id while §14 wanted an independent custom of that name to get `sc…` — so a v2
backup of such a custom could silently become an override of `2026` on import while
store-migration kept it separate. **Binding fix — ONE `classifySyllabus(name, def)` used
by BOTH store conversion and file normalization, provenance-free and conservative:**
- **Only a CURRENT canonical shipped name resolves to its deterministic `sb…` id.**
- **A historical alias name** (a `SYL_RENAME` source such as `'FG JUL 26'`) is treated
  as an **independent custom (`sc…`)**, NOT auto-folded onto the built-in — in both
  paths. It never merges two distinct charts, needs no provenance, and cannot diverge.
  (Cost is nil in practice: the app already rewrites `plan.sylName` alias→canonical at
  load (`core.js:814`), so a live store's *current* built-in is under the canonical
  name; and the owner re-imports from a clean current-named backup.)
- `SYL_RENAME`/`aliases` keep ONE narrow, well-provenanced role: the boot reconcile
  (§5a) repointing an existing built-in entry's `base` when a *shipped* build renames a
  built-in (the entry's prior `base` was the old canonical name — clear provenance).
  This is distinct from classifying an arbitrary legacy stored/file name.
- Test the SAME ambiguous chart through migration AND backup import → same outcome
  (separate custom), never a silent override.

### CSID2-R2-03 (MEDIUM — file catalogue must be a validated UNION, not "whichever present") — ACCEPT, MUST FIX.
A partial export can have `charts.sylcat` covering A while `students.sylcat` covers B;
neither alone covers the file. **Binding fix:** `normalizeImport` builds the **union** of
`charts.sylcat` ∪ `students.sylcat` before reconciliation; overlapping ids must AGREE on
identity metadata (name/base/userNamed) or the file is refused; enforce id- and
name-uniqueness across the union; every id referenced by any chart, `bySyllabus` block
or `plan.sylId` must be present in the union (reference-completeness against the union).
Retain the one union map through the whole apply (charts, students via `upgradeCourses`/
`reconcileCourseIds`, plan pointers). Test: charts-of-A + students-of-B partial export
reconciles; a cross-catalogue metadata disagreement is refused.

### CSID2-R2-04 (MEDIUM — delete sweep omits the all-course plan repair moveSylData did) — ACCEPT, MUST FIX.
`moveSylData` rewrites every course's persisted plan (`core.js:3167–3172`); the R1 sweep
dropped that, so an unopened course selecting the deleted id keeps a dangling
`plan.sylId`, which `collectStudents` exports (`733–759, 3737–3741`) and reference-
completeness then refuses on re-import. **Binding fix:** `delSyl` walks **every** course
(persisted plans included, not just the live one) and repoints any `plan.sylId` equal to
the deleted id to a valid remaining syllabus (`firstSylName`-equivalent by id); clear
matching `lastStudent`/last-edit pointers where they name the deleted id. Test:
delete → export → import WITHOUT opening the affected courses.

### CSID2-R2-05 (MEDIUM — `userNamed` provenance is not in the file schema, so it is lost on round trip) — ACCEPT, MUST FIX (schema).
Rename built-in `2026`→`'Instructor Edition'`, export, import into a fresh browser: the
label arrives without `userNamed`, so `reconcileBuiltins` sees `!userNamed` and restores
the shipped label on reload — breaking the id+label round trip. **Binding fix:** the
file `sylcat` entry shape is `{ id, name, base?, userNamed? }`; `userNamed` is validated
and preserved through normalize/apply. Define the incoming-label rule: importing a
built-in id that the store already holds keeps the STORE's label if the store's is
`userNamed` and the file's is not (store user-edit wins), else adopts the file's
`userNamed` label; a plain (non-userNamed) incoming label never overwrites a local
userNamed one. Test: rename → export → fresh import → reload keeps the label; a later
shipped rename still respects it.

### CSID2-R2-06 (MEDIUM — catalogue writers can create duplicate labels) — ACCEPT, ONE UNIQUE-LABEL POLICY.
A user owns custom `'2027'`; a later build renames built-in `2026`→`'2027'` → two entries
share a label, breaking `sylIdOf`'s first-match and names-in-modal. **Binding fix — a
single `ensureUniqueLabel(id, desiredName)` applied by EVERY catalogue writer**
(`reconcileBuiltins` additions and shipped renames, `renSyl`, `addSyl`, `dupSyl`,
`restoreHiddenSyl`, import apply): preserve an existing user label, and disambiguate the
INCOMING one (a shipped rename that collides with a user's custom label appends a
distinguishing suffix, or retains the prior built-in label when available — never
silently duplicates). Because the id is the true key, this is a display/lookup guard;
pair it with making `reconcile`/modal id-first (§9, §10) so a transient collision can
never resolve the wrong record. Test: newly-shipped built-in AND shipped rename each
colliding with an existing custom label → labels stay unique, ids untouched.

### Net effect on §§1–14
- §14 CSID2-01 resumability is REPLACED by the payload journal (CSID2-R2-01).
- §14 CSID2-03/§10 alias handling is REPLACED by the one shared conservative classifier;
  historical aliases → custom, not built-in (CSID2-R2-02).
- §10/§14 CSID2-04 file catalogue becomes a validated UNION carrying `userNamed`
  (CSID2-R2-03, R2-05).
- §6/§14 CSID2-08 `delSyl` also repairs every course's plan (CSID2-R2-04).
- §5a/§9 gain the single `ensureUniqueLabel` writer policy (CSID2-R2-06).

### Round 3
Changed plan → **re-review by Astra** (approval binds to the new SHA). R3 confirms these
6 fixes and looks for any further emergent defect; on APPROVED the plan is ready to
build. Open for R3: (a) does the payload journal fully remove name-vs-id ambiguity, incl.
the legacy-name-equals-destination-id case? (b) is "historical alias → custom" the right
conservative call, or does any real store rely on the alias→built-in fold? (c) does the
union catalogue + `userNamed` rule close the round-trip and partial-export gaps?
