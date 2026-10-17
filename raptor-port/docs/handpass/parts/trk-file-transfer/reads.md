# `[TRK-FILE-TRANSFER-SPLIT]` — the two fresh Opus reports, as returned (17 Oct 26, the night's run)

Both fresh Opus helpers that did not write the code (D790; Fable not used, D903; Astra and Sol 6.1 out — on `[NO-ASTRA-LIST]`).
Saved the moment they arrived, before anything was done about them. Their dispositions: the evidence sheet §6.

## 1. The blind code read (handed the commit `f1cc61974` and the intent; not the walk or the sheet)

**Verdict:** yes, only a move — nothing breaks, nothing stale left in a live document; two low weak spots, both in the
new test only; the app's behaviour unchanged.

1. **Low (test only)** — `file-transfer-boundary.test.ts` "core's normalizeImport is the module's, given the live
   catalogue" cannot tell the live catalogue from an empty or stale one. Failure: change the wrapper to
   `normalizeFile(parsed, [])` (or a catalogue captured at load) and this test still passes. Cause: the file it imports is
   the store's own export, so every chart id is already in the store and the reconcile remaps nothing either way. (The
   suite as a whole would still catch it — the "refused file writes nothing" test would then replace chart Y.) Fix: give
   it a file the catalogue changes — add a chart "BOUNDARY X", import a v3 file whose `sylcat` names `scfreshx` "BOUNDARY X",
   assert `C.normalizeImport(file).charts.order` equals `[C.sylIdOf('BOUNDARY X')]`, keeping the equality with the module's.
2. **Low (test only)** — the "imports nothing but the syllabus-id helpers" scan does not see a re-export: an
   `export { x } from '../state/store'` would pass. Fix: scan the comment-stripped code with
   `/\b(?:import|from)\s*\(?\s*['"]([^'"]+)['"]/g` (covers `import … from`, `export … from`, a bare import and a dynamic
   `import()`), expect `['./sylIds.js']`.

**Older, met in passing:** none worth filing.

**Checked clean:** every removed line against the new file (only the parameter, its one use, the `export`s, the added
comments and a re-declared `has` of the same body differ); every free variable resolves to the same thing (the sylIds.js
imports, `has`, and `SYLS` now passed in); the wrapper reads `SYLS` inside its body at each call, so every reassignment
of the catalogue is seen, and its one app caller (`importClick`) calls it synchronously as before; every caller of the
moved names resolves; nothing in `scripts/`, `e2e`, the smoke bridge uses them; the removed import is unused; no import
cycle (`fileTransfer.js` imports only `sylIds.js`, which imports nothing); the module lands in the Tracker's lazy chunk
only; the source scans of `core.js` in other tests look for nothing that moved; the documents (the file map's new row,
`sylIds.js`'s comment; the Tracker's rulings §Architecture and its known gaps never named where these lived; the 13 Sep
spec and 23 Sep brief are dated history). Ran the boundary test: 11 / 11.

## 2. The scenario designer (asked what is MISSING; handed the test, the walk script and the records)

**Bottom line:** the only difference between the builds is `SYLS` → the `existing` argument, read at the same moment,
handed the same array, with every helper from the same `sylIds.js` and nothing mutating it; a wrong import name would
stop the Tracker loading and every walk scenario would have caught it. So no import scenario (version 1, students only,
Skip this one, a user-named rename, `charts.deleted`, disagreeing catalogues, `eventInfoBySyl`) can come out differently
— each runs downstream of an identical result. Dropped as differences.

**Real for this move:**
1. **A screen outside Import uses a moved function** — `sameDef` also serves ✓ Save changes on a built-in chart
   (`persistSyl`): a built-in saved back to its shipped form drops its override. Missing from the roll-call and driven by
   neither the walk nor the boundary test. Only through the import binding could the move change it — a roll-call row
   ("has it, because…"), not a likely fault; one recording step would close it cheaply.
2. **`remapStudentsSyl` is used outside `normalizeImport`** — Import's "Add as new" step. S4 covers it; a roll-call
   sentence. (That call sits outside any try/catch and can throw the older-version words — the same in both builds; for
   the backlog only.)

**Not a gap — B6, the deep copy the break test missed:** traced: after `normalizeImport`, `importClick` reads only
`parsed.contains`, `parsed.links` and `parsed.students` as a fallback reached only when the result's students are null;
`parsed` is a fresh `JSON.parse` nothing else holds. The mutant changes nothing observable today — a missing robustness
pin, not a correctness gap. Optional pin: a deep-frozen fixture, asserting no throw and no change.

**For the module's future, cheap pure pins:** (3) a file with no version: chart upgraded by name, students left raw and
not refused; (4) a v3 file whose two catalogues give one id two names → the disagreement error; (5) a students-only v3
file against a store with a same-named custom chart → its references take the store's id; (6) a reference only in
`plan.sylId` outside both catalogues → refused, inside → remapped; (7) `eventInfoBySyl` and `layouts` re-keyed with
`syllabi`; (8) `charts.deleted` passes through untouched (documents current behaviour).

**The walk's sizing:** for a word-for-word move whose only seam is a parameter read at the same moment, recording is
adequate and stronger than an eye — both builds, clock held, random seeded, the real File → Import controls at both
sizes, every message and stored record compared, two runs of the old build first; it meets D608 (real controls pressed).
The shortfall is breadth, not method: the scope came from "Import", not from "every place the moved code runs" — add the
Save changes step and the roll-call row and the sizing is complete. No human-eye walker needed.
