# Session handoff — [ARCH-STACK] step 1B-i (Tracker COURSE ids) BUILT, holding for "merge live"

## Where it is
`[ARCH-STACK]` **step 1B-i — stable hidden ids for Tracker COURSES** (`[TRK-CSID]`,
first of two passes) is **built, committed, pushed, gates run, and HOLDING for the
owner's explicit "merge live".** Nothing is merged.

- **Branch:** `claude/trk-csid-course-ids` · **PR #398** (open, not watched — monitor off).
- **Vercel preview:** https://raptor-git-claude-trk-csid-course-ids-kai-e2f5.vercel.app
- **Base:** `main` at `ded444f`. Commits: `42d14b6` (build) + `88f0d2d` (review fixes).

## What it does (plain)
Courses used to be filed by their NAME, so renaming a course physically moved every
record and could strand data. Now every course has a permanent hidden id; the name is
just a label; all data files under the id — so **renaming a course moves nothing**. Same
safety students already have. Syllabus ids are the SECOND pass (1B-ii), left name-keyed.

## What shipped (technical)
- `src/tracker/app/courseIds.js` — mint / id-grammar + reserved-name guards / `upgradeCourses`
  (v1 name-keyed → v2 id-keyed) / `reconcileCourseIds` (store id wins, conflicts refused).
- `migrateCourseIds` (core.js) — once-per-browser, resumable, read-back-verified
  `storage.list()` prefix-move with a reserved-namespace skiplist + fail-closed preflight
  (reserved / colon / bad-id legacy name → `bootError`); translates the `v3:links` payload.
- Fail-closed boot (App.jsx + core `bootError`/`setBootError`): reload panel, no board/writers;
  `ready`-transition effect draws once `#board` mounts.
- Import/export file **version 2** (`{id,name}` courses); `fileFormat` validates both shapes.
- Every COURSES-traversing writer uses the id; renCourse is label-only; OrdModal names-mode.

## Process record
- Spec: `docs/superpowers/specs/2026-09-13-trk-csid-course-ids-spec.md`.
- Astra (Codex GPT-6, high) red-team of the spec: **4 rounds, 8→4→2→0, APPROVED** (§14/§15/§16 are binding dispositions).
- Fable 5.1 (high) review of the BUILT diff: 3 findings (1 high, 1 med smoke, 1 low), **all fixed** in `88f0d2d`.

## Gates (all green except documented pre-existing flakes)
- `npm test` 4670/0 · `npm run build` ✓ · `node reference/tfin.js` **728/0** ✓
- `npm run test:e2e` 423 pass, 2 fail = the documented loaded-local-machine flakes in
  `geometry.spec` (scheduler) + `leavewar.spec` — unrelated to this Tracker-only change, CI-green.
- `npm run smoke:tracker` — every course-id assertion passes; aborts on the documented
  `addStudent` slow-machine flake (CI-green). **Trust CI for these; do not chase locally.**

## Pick up here
1. **Owner tests the Vercel link** (open the Tracker, add/rename a course, import/export). Say "merge live" to ship.
2. On "merge live": merge PR #398 on green → wait for Pages → load the live site and look at the Tracker → ONE notification it's live.
3. **Then 1B-ii — SYLLABUS ids** (its own spec → Astra red-team → build → Fable → gates → hold).
   Then 1C (`who→personId`), then step 2 (the one write/command layer). See OUTSTANDING `[ARCH-STACK]` / `[TRK-CSID]`.
