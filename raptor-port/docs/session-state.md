# Session handoff — [TRK-CSID] 1B-ii (Tracker SYLLABUS ids): BUILT + REVIEWED + GATED, at HOLD for "merge live"

## Where it is
1B-ii is **BUILT, reviewed and gated** on branch `claude/trk-csid-syllabus-ids` (off
`main`, NOT merged). Five cross-provider Codex review rounds ran on the built diff; all
28 findings across the rounds were fixed with regression pins. **All local gates green**
(unit **4697**, build ✓, tfin **728/0**, smoke:tracker ✓). Resting state: branch pushed,
Vercel preview link handed to the owner, PR unsubscribed. **HOLD for owner "merge live".**

## Round-5 (final) review — 3 findings, all fixed with pins
- **CSID-IR-01** (silent loss): a `plan.custom` legacy course's OWN hand-drawn layout
  was misfiled onto the built-in the sylName spells and its source purged — the edited
  chart lost its positions. Fixed: the course's own layout key is claimed for the minted
  edited-chart id (`editedLayKey`), keyed by the exact source key. Pin in the migration
  harness.
- **CSID-IR-02** (stale-marks resurface): the RESET only swept courses still in the
  visible index; a deleted course keeps its records, so a later re-import surfaced old
  marks. Fixed: the journal's course list is now `allCourseNamespaces()` (every persisted
  namespace), swept + plan-repaired without re-adding to the index. Pin added.
- **CSID-IR-03** (over-strict refusal): reference completeness is against the UNION of
  the charts + students catalogues (§15), not `students.sylcat` alone. Fixed in
  `normalizeImport`, `reconcileStudentsSyllabi`, and `fileFormat.checkCharts`
  (union passed from `readFile`). Pins in tracker + fileFormat tests.

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
- `app/sylIds.test.ts` (pure), `app/sylIds.migration.test.ts` (KEEP/RESET journal
  harness — now incl. the IR-01 edited-layout and IR-02 deleted-namespace pins),
  `app/fileFormat.test.ts` (§8 colon relaxation + the IR-03 union-completeness pins),
  `tracker.test.tsx` re-baselined (dup=empty, rename=catalogue-only, guardrail import,
  v3 reconcile, + the IR-03 union-reference pin). Whole suite `npm test`: **4697 green**.

## Remaining steps (owner's loop)
1. **DONE** — review (5 Codex rounds) + full gates + push + Vercel link + PR unsubscribed.
2. **HOLD for "merge live".** Nothing merges without it. On the owner's word: merge on
   green → wait for Pages → load the live Tracker tab and look → one "it's live" notification.

## Gotcha learned this session
- Course ids are lowercase base36 (`^c[0-9a-z]+$`); a test fixture id with an
  uppercase letter fails the migration preflight (returns false, no bootError there).
- The smoke suite HALTS on the first uncaught error (linear script), so fix all
  syllabus-key references (names→ids) before a run is informative; it serves `dist/`,
  so `npm run build` first.

## Opening prompt for a fresh chat (if handing off)
> Picking up Raptor on `claude/trk-csid-syllabus-ids`. [TRK-CSID] 1B-ii is BUILT,
> reviewed (5 Codex rounds, all findings fixed) and fully gated (unit 4697 / build /
> tfin 728/0 / smoke:tracker). Read raptor-port/docs/session-state.md. It is at HOLD:
> branch pushed, Vercel link given, PR unsubscribed. Do NOT merge until I say "merge
> live"; on that word run the "done means live" chain and send one notification.
