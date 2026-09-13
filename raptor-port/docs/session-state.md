# Session handoff — [TRK-CSID] 1B-ii (Tracker SYLLABUS ids): SPEC APPROVED, ready to BUILD

## Where it is
ARCH-STACK 1B-i (course ids) is DONE + live on `main`. This session did the **1B-ii
spec + red-team**: stable hidden ids for Tracker SYLLABUSES.

**The spec is APPROVED** by Astra (Codex/GPT-6, high) — 7 rounds, findings 10→6→3→2→3→2→0,
final verdict **APPROVED** bound to the committed REV 7 (SHA `39864b64…`). Spec + the full
round-by-round dispositions:
`docs/superpowers/specs/2026-09-13-trk-csid-syllabus-ids-spec.md` (§§14–19 are BINDING and
supersede earlier clauses; read them — they carry every design decision).

**Nothing is built yet.** Next step is the BUILD (Opus, test-first).

## Branch
`claude/trk-csid-syllabus-ids` (off `main`). Spec commits d5e426b→c7c2c8b. Nothing merged.

## The approach the spec settled (owner decisions, all in the spec)
- **Ids:** built-ins get **deterministic shipped ids** from a `BUILTIN_SYL` table
  (`sb…`); user charts get **minted** ids (`sc…`). Grammar `^s[bc][0-9a-z]+$`; `base`
  is authoritative from the table.
- **Conversion = "keep charts, reset marks"** (owner): the global chart catalogue
  (definitions, layouts, order/hidden/tomb/alias) is converted **in place** via a durable
  **payload journal** (discover once, whole-object writes, purge = sources ∖ destinations,
  verify after purge; two flags `kSylCatMig`/`kSylReset`); the per-(course,syllabus)
  **student layer is RESET** (rosters/marks/dates/pace/lulls/last cleared; plan
  `sylName→sylId`, `lulls/target/target2` zeroed). Legacy layout sources are folded in
  first (with legacy event-id translation via `padId`/`SPECIAL`, incl. `__font`).
- **Boot reconcile** (`reconcileBuiltins`, also in `reloadFromStore`): adds newly-shipped
  built-ins, repoints `base` on a shipped rename, respects `userNamed`; single
  `ensureUniqueLabel` on every catalogue writer.
- **rename/delete/dup = catalogue-only** (`moveSylData`/`purgeLegacySyl` deleted);
  `delSyl` sweeps records across ALL courses + repairs every course's plan; hidden ≠
  deleted.
- **Import guardrail (owner):** charts import from ANY backup; **student marks import ONLY
  from an id-native v3 file with a `sylcat`** — older/unresolved student blocks are
  refused with a plain message (no alias-guessing in the file path). File version → 3.
- **Colon relaxation (owner):** syllabus/chart names may contain a colon now (course
  names keep the refusal). Includes the import "Add as new" path.

## The owner already did his safety backup
He exported a **charts-only** backup from the live app (⤓ File → Export, charts on,
students off, all syllabuses) — insurance. The in-place catalogue conversion preserves
charts anyway. **Do not ship anything that auto-wipes before he has loaded the new build;
the reset only runs in his browser after merge-to-Pages + load, and Vercel previews use a
different origin so they never touch his real Tracker data.**

## Process (owner's standing loop) — remaining steps
build on **Opus 4.8 high, test-first** (ship the conversion with rename/reorder/delete/
duplicate/import behaviour tests as the FIRST invariant-harness increment — classify each
invariant hard/advisory/frozen) → **Fable-high review of the built diff** (persisted-data,
silent-defect risk; the reserved smart-review) → full gates (`npm test`, `npm run build`,
`node reference/tfin.js` 728/0, `npm run test:e2e`, `npm run smoke:tracker` — from
`raptor-port/`, `npm ci` first in a fresh container) → push, Vercel link, **HOLD for
"merge live".** Nothing merges without it.

## Windows/runner gotchas learned this session (for the review CLI)
- Prefix the claudex-loop runner with `PYTHONUTF8=1 PYTHONIOENCODING=utf-8` (arrows crash
  cp1252). Capture the runner's stdout to a stable file and parse the result from there.
- Native Windows Python can't open git-bash `/c/...` paths — use the Read tool or `C:\...`.

## Ready-to-paste opening prompt for a FRESH build chat
> Picking up Raptor on branch `claude/trk-csid-syllabus-ids`. The [TRK-CSID] 1B-ii
> syllabus-ids SPEC is APPROVED (Astra, 7 rounds). Read, in order:
> raptor-port/docs/session-state.md, then the spec
> raptor-port/docs/superpowers/specs/2026-09-13-trk-csid-syllabus-ids-spec.md —
> §§14–19 are BINDING, they carry every decision. BUILD it now on Opus 4.8 high,
> test-first, following my auto-memories. Ship the conversion with rename/reorder/
> delete/duplicate/import behaviour tests as the first invariant-harness increment.
> Then Fable-high review of the built diff → full gates → push + Vercel link → HOLD for
> "merge live". This is HEAVY (persisted data, silent-defect risk): keep charts / reset
> marks, deterministic built-in ids, the payload-journal migration, and the v3
> student-import guardrail exactly as the spec's §§14–19 specify.
