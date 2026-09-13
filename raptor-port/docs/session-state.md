# Session handoff — [TRK-CSID] 1B-ii (Tracker SYLLABUS ids): BUILT, awaiting review → gates → merge

## Where it is
1B-ii is **BUILT** on branch `claude/trk-csid-syllabus-ids` (off `main`, NOT merged).
Implementation complete, compiles, and the **unit suite is green** (149 tests incl. the
new migration harness). Remaining before merge: Fable-high review of the built diff →
full gates → push + Vercel link → HOLD for owner "merge live".

## What was built (the spec's §§14–19, binding)
- **New pure module `src/tracker/app/sylIds.js`** (mirrors `courseIds.js`): the
  `BUILTIN_SYL` deterministic-id table (`sb2024`/`sb2026`/`sbtx2026`/`sbagaa2026`),
  `mintSylId`, grammar `SYL_ID_RE=^s[bc][0-9a-z]+$`, `classifyDefinedName`,
  `upgradeSyllabi` (name-keyed→id + sylcat), `buildUnionSylcat`, `reconcileSylIds`.
- **`core.js`**: the `SYLS` catalogue + id helpers (`sylName`/`sylIdOf`/`curSylId`/
  `curSylName`/`sylSource`/`baseOf`/`builtinOf`/`isHidden`/`sylHasOwnDef`/
  `ensureUniqueLabel`); id-keyed key builders (`kMarks`/`kDates`/`kLayout` via
  `curSylId()`); `plan.sylId`; **`migrateSylIds`** (payload journal — build-once,
  KEEP catalogue in place + RESET student layer, two flags `kSylCatMig`/`kSylReset`,
  `purge = sources ∖ destinations`, verify after all purges, legacy layout event-id
  translation incl. `__font`); **`reconcileBuiltins`** (boot + `reloadFromStore`);
  `renSyl`/`delSyl`(sweep + all-course plan repair)/`dupSyl`(empty layer)/`addSyl`
  catalogue-only; `moveSylData`/`purgeLegacySyl`/`SYL_ALIAS`/`SYL_RENAME` deleted;
  file `collectCharts`/`applyCharts`/`collectStudents`/`applyStudents`/`normalizeImport`/
  `importClick` id-keyed + the **v3 student-import guardrail (§19)**.
- **`fileFormat.js`**: `FILE_VERSION=3`, dual-shape charts/students, `sylcat`
  validation, colon relaxed on chart/syllabus names (course names keep it).
- **UI**: Header syllabus `<select>` by id; Modals OrdModal syllabus-mode + copy
  picker by id (names-in-modal kept).
- **Docs**: CLAUDE.md Tracker section flipped to DONE; OUTSTANDING.md 1B-ii → BUILT.

## Tests
- `app/sylIds.test.ts` (19, pure), `app/sylIds.migration.test.ts` (3, KEEP/RESET
  journal harness), `app/fileFormat.test.ts` (§8 colon relaxation), `tracker.test.tsx`
  re-baselined (dup=empty, rename=catalogue-only, guardrail import, v3 reconcile;
  the legacy enrolment-migration / rosterHeld / rename-moves-marks tests were removed —
  coverage moved to the migration harness). `npm test` for tracker+app: **149 green**.

## Remaining steps (owner's loop)
1. **Fable-high review of the built diff** (persisted data, silent-defect risk) — the
   reserved smart review. Route via claudex-loop (host=claude, reviewer=codex is the
   token-cheaper default per memory; Fable for the uncertain/high-stakes findings).
2. **Full gates** from `raptor-port/`: `npm test`, `npm run build`,
   `node reference/tfin.js` (728/0 — scheduler parity, unaffected), `npm run test:e2e`,
   `npm run smoke:tracker` (the guardrail/id fixtures were updated; re-run to confirm).
3. **Push** the branch, hand the owner the **Vercel preview link**, unsubscribe the PR.
4. **HOLD for "merge live".** Nothing merges without it.

## Gotcha learned this session
- Course ids are lowercase base36 (`^c[0-9a-z]+$`); a test fixture id with an
  uppercase letter fails the migration preflight (returns false, no bootError there).
- The smoke suite HALTS on the first uncaught error (linear script), so fix all
  syllabus-key references (names→ids) before a run is informative; it serves `dist/`,
  so `npm run build` first.

## Opening prompt for a fresh chat (if handing off)
> Picking up Raptor on `claude/trk-csid-syllabus-ids`. [TRK-CSID] 1B-ii is BUILT and
> the unit suite is green (149). Read raptor-port/docs/session-state.md. Remaining:
> Fable-high review of the built diff, then full gates (npm test / build / tfin 728/0 /
> test:e2e / smoke:tracker — from raptor-port/, npm ci first in a fresh container),
> then push + Vercel link, then HOLD for my "merge live". Do NOT merge without it.
