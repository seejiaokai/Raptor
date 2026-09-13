# [TRK-CSID] Phase 2 — stable hidden ids for Tracker SYLLABUSES (spec)

**Status:** REV 1 — pre-red-team draft · 13 Sep 26 · awaiting Astra R1
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
