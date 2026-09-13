# Session handoff — [ARCH-STACK] 1B-i (Tracker COURSE ids) shipped; next is 1B-ii (SYLLABUS ids)

## Where it started
Owner asked to do ARCH-STACK step 1B ([TRK-CSID]) — stable hidden ids for Tracker
COURSES and SYLLABUSES. On recon it split cleanly: courses are a clean mirror of the
enrolment-id work; syllabuses are tangled (global, built-ins identified by name in code).
Owner chose **two passes, courses first**. This session did the course pass (1B-i).

## Shipped
- **[TRK-CSID] 1B-i — course ids** — PR #398, MERGED to `main` on the owner's "merge live",
  deploy green, live-verified. Courses carry an opaque `{id,name}` id; every per-course key
  files under the id; renaming a course is now label-only (moves nothing). New
  `src/tracker/app/courseIds.js` + `migrateCourseIds` (resumable, read-back-verified,
  fail-closed preflight, translates `v3:links`); fail-closed boot in `App.jsx`; file
  version 2 in `app/fileFormat.js`. Spec (4-round Astra red-team APPROVED + Fable-high
  built-diff review, all fixed): `docs/superpowers/specs/2026-09-13-trk-csid-course-ids-spec.md`.

## Unfinished
- none. (1B-ii below is the next planned step, not leftover work — it is recorded in
  `OUTSTANDING.md` [TRK-CSID] / [ARCH-STACK]. This file stays only to tee up that next task,
  as the owner asked; delete it once 1B-ii starts on its own branch.)

## Branch state
- Designated branch this session: `claude/trk-csid-course-ids` — its PR (#398) is MERGED.
- **The next session must reset before new work** (do not stack onto merged history):
  `git fetch origin main && git checkout -B claude/trk-csid-syllabus-ids origin/main`

## Gates (this session, watched)
- `npm test` 4670/275 files · `npm run build` clean · `node reference/tfin.js` 728/0 ·
  `npm run test:e2e` 423 passed/0 failed in CI (2 specs — geometry + lw-phone — fail only on
  a loaded local Windows box; trust CI) · `npm run smoke:tracker` 427/0 in CI (its
  `addStudent` step is the documented slow-local-machine flake; trust CI).
- `probes:adapted` / `perf` not run — this PR was Tracker-only (no scheduler/UI/perf touch).
- Run all from `raptor-port/`; a fresh container needs `npm ci` first.

## Open questions
- none.

## Pick up here — 1B-ii: SYLLABUS ids (the second, harder pass)
Give syllabuses stable hidden ids and re-base the global + per-(course,syllabus) keys, so
renaming a syllabus becomes label-only too (today `moveSylData` moves data by name). Harder
than courses because syllabuses are GLOBAL and built-in templates are identified by NAME in
shipped code (`SYLLABI`, `DEFAULT_LAYOUTS`, `SYL_ALIAS` bases, `SYL_ORDER`, `SYL_RENAME`) plus
name-keyed prefs (`SYL_HIDDEN`/`SYL_ALIAS`/`SYL_TOMB`/`SYL_ORDER`). This is also where the
colon-refusal on syllabus/chart names can be relaxed. HEAVY, persisted-data, silent-defect
risk. Mirror 1B-i's shape: `courseIds.js` is the model for a new `sylIds.js`; `migrateCourseIds`
is the model for the migration; keep the fail-closed-boot + file-version + reconcile-on-import
patterns. Full item + context: `OUTSTANDING.md` [TRK-CSID] 1B-ii.

Process (owner's standing loop for this stack): spec → Astra (Codex) red-team of the spec to
APPROVED → build on Opus 4.8 high, test-first → Fable-high review of the built diff → full
gates (npm test, build, tfin 728/0, test:e2e, smoke:tracker) → push, Vercel link, HOLD for
"merge live". Nothing merges without it.

### Ready-to-paste opening prompt for the next chat
> Picking up Raptor (fresh clone, main). ARCH-STACK step 1B-i (course ids) is DONE and live on
> main. Now do **1B-ii — [TRK-CSID]: stable hidden ids for Tracker SYLLABUSES** (the second
> pass; courses are already done). Read first, in order: raptor-port/docs/session-state.md,
> then raptor-port/docs/superpowers/specs/2026-09-13-trk-csid-course-ids-spec.md (the course
> pass — mirror its shape), then the [TRK-CSID] and [ARCH-STACK] items in OUTSTANDING.md.
> Follow my auto-memories. Treat this as HEAVY (persisted data, silent-defect risk): syllabuses
> are GLOBAL and built-in templates are name-identified in shipped code, so it is bigger than
> courses. New branch off main: claude/trk-csid-syllabus-ids. Process: spec → Astra red-team →
> build (Opus) → Fable-high review of the built diff → full gates → push, Vercel link, HOLD for
> "merge live".
