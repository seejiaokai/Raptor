# [SYNC-INTEG] medical guardrail batch — build plan (19 Sep 26)

Prerequisite before the one-Absence rebuild. Owner-scoped to THREE items (P6 Quals-✕
confirm and P7 doc fix are NOT in this batch). Source of decisions: OUTSTANDING [SYNC-INTEG]
and `2026-09-13-sync-delete-undo-integrity-spec.md` (revised P2/P4). Build on Opus 4.8 high,
test-first, own gated PR, hold for "merge live".

This doc is the plan handed to a cross-provider red-team (Codex) BEFORE building, because the
batch changes PERMISSIONS (who may write medical) and DELETION (what "clear old data" removes).

---

## Item 1 — Medical is member-filed ONLY (P2)

**Decision (owner, 13 Sep 26, revising 17 Aug 26):** the Leave War may DISPLAY member-filed
medical (synced in from the member's own Inputs filing, which carries the certificate) but may
no longer CREATE it. Block war-side medical creation for ALL roles incl admin; hide the war's
medical pickers. Existing war-created medical is demo data → reset, no migration/back-compat.

### Write-path backstop (the load-bearing half)
`src/leavewar/state/store.ts` — three writers currently gate medical by `role !== 'admin'`:
- `setCell` (~1983): `if (isMedical(clean) && state.role !== 'admin') return`
  → `if (isMedical(clean)) return` (block ALL roles).
- `setCellRange` (~2044): `medBlocked = isMedical(...) && state.role !== 'admin'`
  → `medBlocked = isMedical(...)`.
- `setCells` (~2096): same → `medBlocked = isMedical(...)`.

`shiftBid`/`moveCells` never carry medical (not biddable / admin-only; store comment line ~3304).
`ingestFromRaptorImpl` (~2995) writes member-filed medical DIRECTLY via `updateWar`, NOT through
`setCell`, so the backstop change does NOT affect member-filed medical display. Confirmed by read.

### Hide the pickers (the affordance half)
Both Matrix call sites pass `medical={role === 'admin'}`:
- `Matrix.tsx` ~3770 (SelectSheet, drag batch) and ~4007 (BidPicker, single cell).

**Decision:** REMOVE the `medical` prop entirely from `BidPicker`, `SelectSheet`, and both Matrix
call sites, and delete the medical-render blocks (BidPicker ~233-248, SelectSheet ~145-152) and the
now-unused `MEDICAL_TYPES` imports. Rationale: a permanently-`false` prop with a live medical-render
branch is exactly the latent re-enablement seam the robustness doctrine warns about. The store gate
is the backstop; removing the UI is the honest, seam-free expression of "medical is never created on
the war." (Alternative — pass `medical={false}` — leaves dead code; rejected.)

### Reset the demo data
`src/leavewar/engine/seed.ts` `seedGrid()`: SPLICE carries war-originated medical
`'2026-01-05': 'ATTC', '2026-01-06': 'OML'` (no `source:'raptor'` state → war-created). REMOVE those
two cells (keep SPLICE's `'2026-01-08': 'LL'`). Existing browsers: reset via the coordinated storage
version, NOT migration — bump `storage/reset.ts SCHEMA_VERSION` (2→3) so a persisted pre-existing LW
world with war-medical is cleared and re-seeded clean (memory `dev-phase-reset-demo-data-not-migrate`).
**OPEN QUESTION for red-team:** does bumping SCHEMA_VERSION actually clear+re-seed the LEAVE WAR world
(it clears `inputs`+`weeks`; does it clear `leavewar:` keys / re-run installDemoWorld with
`hadStoredWars=false`)? If not, the reset must be expressed differently. Verify in build.

### Tests
- `store.test.ts`: invert the two "refuses a medical code from a member" tests → refuses from admin too.
- `bidding.test.tsx` / `selectsheet.test.tsx`: assert medical markers never render (any role).
- `matrix.test.tsx` grid-display of member-filed medical stays green (display unaffected).
- A test: `ingestFromRaptor` still lands member-filed medical on the war (display preserved).
- Update `counters`/`demomed` tests that assert SPLICE's seed ATTC/OML counts.

---

## Item 2 — Relaxed mandatory-document prompt

**Today:** filing a medical input with no certificate is HARD-refused in two places
(`inputedit.tsx normalizeInputDraft` ~567-570 and `InputsPage.tsx add()` ~366).
**Want:** on saving a medical input with no document, PROMPT once — [Upload] or [No document];
"No document" files it with none. Keep the replace-don't-strip guard on an entry that already has a
document. Five certificate types (needsDoc = isDownchit || isUpchit): ATT C, ATT B, HL, OML, Upchit.

### Shared gate mirroring the existing `oilGate`/`OilConfirm` doctrine
New `docGate(draft, except): 'ok' | 'refused' | 'ask'`:
- `'ok'` — not a needsDoc type; OR draft already has a doc; OR `except` was medical with NO doc
  (pre-feature bare legacy row — don't nag, preserves current free-edit behaviour).
- `'refused'` — `except` was medical and HAD ≥1 doc, draft now has none (replace-don't-strip). Toast
  the existing "keep at least one document" message; caller aborts.
- `'ask'` — NEW medical, or a row retyped INTO medical, with no doc. Caller opens `DocConfirm`.

`normalizeInputDraft`: REMOVE the first hard-refuse (new-medical-no-doc, ~567-570); KEEP the
replace-strip refuse (~576-578) so any direct caller still enforces it. The relaxation is safe only
because every medical-CREATING surface is one of the three editors below, each of which runs docGate
first. Verified non-creating callers of commitInputEdit: caldrag (date move, except present),
reassignInput (Unavailable person swap), QualsPage (reads downchit only). Build-time check:
`commitNewInput` callers.

### `DocConfirm` sheet
Small Sheet (mirror `OilConfirm.tsx` shape/scrim/Escape): title "No medical document attached",
body "File this <type> without a certificate?", buttons **Upload** (dismiss, return to editor where
the existing upload control sits) and **No document** (resume the save with the doc treated as
resolved). No new confirm primitive — reuse the editors' existing sheet pattern.

### Wire into the three commit paths (docGate BEFORE the type sheets / oilGate)
- `inputedit.tsx` InputEditor `save(skipDoc=false)`: `const dg = skipDoc ? 'ok' : docGate(draft, except)`.
  On `'refused'` → toast+return; on `'ask'` → `setDocConf({...})` and return; DocConfirm "No document"
  → `save(true)` (resumes through the upchit-summary / downchit-clash / oilGate pipeline so a no-doc
  downchit still gets its clash sheet). Threaded as an arg, no lingering state.
- `InputsPage.tsx` `add()`: extract the post-doc body into a closure; docGate → ask opens DocConfirm
  whose "No document" runs the closure; else proceed.
- `InputsPage.tsx` edit commit (~623/637 region): same docGate insertion ahead of the type sheets.

### Tests
- docGate unit: ok/refused/ask across (new medical no-doc), (retyped into medical), (has doc),
  (except had doc → refused), (except bare legacy → ok), (non-medical → ok).
- New medical no-doc → "No document" files it with none (a row lands, docIds empty).
- Replace-strip still hard-refused (unchanged).
- Existing "attach the document first" hard-refuse tests → become the prompt path.

---

## Item 3 — "Clear old data" is CLUTTER-ONLY (P4)

**Today** `clearHistoryData` (`inputedit.tsx` ~1286) deletes past INPUTS (`doomed`), plan pucks,
day notes, and stashed weeks whose whole span is in the window. **Want:** clear ONLY old plan
pucks, day notes, and genuinely-empty past weeks — never delete any leave/medical/duty input, never
change balances, never touch the currently-loaded week — honest confirm showing the count.

### Changes to `clearHistoryData`
1. **Remove the `doomed` INPUTS deletion entirely.** No input is ever cleared by this button — which
   also means balances (derived from inputs) are never changed. This drops the `inputProtected(doomed)`
   preflight (no inputs to protect) — but keep a protected-week guard on the stash drop.
2. Keep pucks (`PLANPUCKS`) + day notes (`DAYRMK`) in-window deletion.
3. **Narrow the stash drop to genuinely-empty weeks.** New `stashWeekEmpty(blob)` in `weekstash.ts`
   (co-located with the blob shape): true iff the parsed blob has NO day carrying content in
   waves/allhands/ground/dutywaves/sims.amt/sims.oft/notes AND no publish state (als `a`, dayOK `ok`,
   orig `o`, cur `cv`, drafts `dr` all empty/absent). Conservative — any parse doubt → NOT empty (keep).
   The existing test blob `{"d":[]}` (empty days, no publish) classifies empty → still droppable.
4. **Never touch the currently-loaded week in ANY collection.** Exclude CURWEEK's 7 ISO dates from the
   puck/note selection, and exclude CURWEEK's stash key from the week drop. (CURWEEK dd/mm/yyyy →
   Mon..Sun ISO via the one week-math seam.)
5. `dry`-run selection == execute selection (already true — same body; keep it).
6. Honest confirm: the count is pucks + notes + empty-weeks only (no inputs). The Admin panel's
   confirm copy updated to say leave/medical/duty inputs are NOT affected.

### Tests (rewrite `wipe.test.tsx` data-sweep cases)
- Inputs are NEVER deleted (the January `divot` input is KEPT now); balances untouched.
- Pucks + day notes in-window still cleared; crossing-edge kept whole.
- A stashed empty week in-window dropped; a stashed week WITH content in-window KEPT.
- The currently-loaded week's pucks/notes/stash never touched even when in-window.
- Count reflects pucks+notes+empty-weeks only.
- Member gate holds; malformed/missing dates clear nothing (fail closed).

---

## Process
Test-first per item. Gates from `raptor-port/`: `npm test`, `npm run build`,
`node reference/tfin.js` (728/0), `npm run test:e2e`, `npm run smoke:tracker`. Then cross-provider
bug-check (Codex now while its window is open + Fable after). Preview link to owner. Hold for
"merge live".

## Red-team, please pressure-test
1. **Permission holes** — any path that still writes medical on the war after the three store gates?
   (drag batch `setCells`/`setCellRange`, `shiftBid`/`moveCells`, balance-bar, undo/redo replay,
   ingest, OIL pass). Does `role==='member'` vs admin matter anywhere now?
2. **Member-filed medical display** — does removing the pickers + gating the writers break the
   member→war sync-in for medical? (should not; ingest is direct.)
3. **docGate bypass** — any medical-creating caller that skips docGate and, with the relaxed
   normalizeInputDraft, now silently files a bare medical? (commitNewInput, board dialogs, drag→Ground.)
4. **Replace-don't-strip** — still enforced on every edit path after the relaxation?
5. **Clear-data safety** — with inputs removed from the sweep, is there ANY residual path that still
   deletes an input or moves a balance? Is the "genuinely-empty" predicate ever true for a week that
   actually holds content (false-empty → data loss)? Loaded-week exclusion correct at week boundaries?
6. **Demo reset** — does the SCHEMA_VERSION bump actually clear+re-seed the Leave War world, or is the
   war-medical reset expressed wrong?
