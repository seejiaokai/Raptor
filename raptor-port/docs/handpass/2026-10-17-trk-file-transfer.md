# `[TRK-FILE-TRANSFER-SPLIT]` — the Tracker import's store-free steps in a file of their own — the bug check (FULL)

**Where it stands (17 Oct 26, the night's run):** a MOVE, and proved one three ways — line for line against `main`, by a
test written first and passed on the old code, and by recording File → Import on the built app before and after (five
scenarios, desktop and phone, identical on every question shown and every stored Tracker record). Read by two fresh Opus helpers that did not write it (D790): a blind code read — only a move — and a scenario designer; their four points, all in the new test, are fixed, and the break that first slipped through is now caught (8 of 8).
**Nothing on screen changes — there is nothing for him to look at; his "merge live" is all that is left.**

`Walk: docs/handpass/2026-10-17-trk-file-transfer.md · 52 pictures · 1 surface (the Tracker's File → Import, with Export for S1) at 2 sizes · 5 scenarios recorded on the build before and the build after, compared byte for byte (and two runs of the build before, first) · MISSING: none open — no helper walked: a change that must change nothing is proved by recording, not by looking`

Branch `claude/tracker-feature-batch-6ea3a7`, cut from `main` at pull request 528. Rulings D493, D775 (and his word of
17 Oct 26 to start it, with `/overnight`).

## 1. The eight questions — tier FULL

3 (saved data — how older files are read): YES — the moved lines decide how an older (version 1 or 2) file and a
current one are read on import, though no rule changes; the item itself names FULL. The rest: NO — no earned leave, no
published record, no shared drawer, no new gesture, mode or surface, no roles (the Tracker reads none — D121), no
warning.

## 2. What was done

About 80 lines — `normalizeImport`, `sameDef`, `remapStudentsSyl` and the older-version refusal's words
(`STUDENT_GUARD_MSG`) — moved from `src/tracker/app/core.js` to the new `src/tracker/app/fileTransfer.js` beside
`fileFormat.js`. `normalizeImport` takes the store's chart catalogue as a second argument; `core.js` keeps
`normalizeImport(parsed)` of the same name, a one-line call with its live catalogue. `export` added to the four names;
`upgradeSyllabi`, used only by the moved lines, dropped from `core.js`'s imports. The rest of export / import stays in
`core.js`: it rewrites the store's own lists, and lifting it would need the catch-all "core context" Astra's read said
to stop at (the look of 13 Oct 26).

## 3. The roll-call — every place the moved lines are used

| Place | Uses | Proved by |
|---|---|---|
| File → Import (`importClick`) | `normalizeImport` (through core's own), `remapStudentsSyl` (Add as new), the refusal's words | the recording walk S1–S5, both sizes; the boundary test end to end; `retest.test.tsx`, `leftovers.test.tsx`, the smoke's import block |
| A chart brought in (`applyCharts`) | `sameDef` — a built-in coming in exactly as shipped is not an edit | S1 (every built-in replaced from the backup — none stored as edited: the records match) |
| ✓ Save changes on a chart (`persistSyl`) — **added on the scenario designer's read** | `sameDef` — a built-in saved back to its shipped form drops its override | `retest.test.tsx` re-walk R-1 (Save changes after a fonts-only edit does not mark an untouched built-in "✎ edited") — green in the gate run on the branch; the same body, imported. Not recorded in the walk: the only way the move could change it is the import binding, which the module link proves — a broken binding stops the Tracker loading, and every walk scenario loaded it |
| The students guardrail (`reconcileStudentsSyllabi`) | the refusal's words | S2 (an older file's students refused, the words shown — identical) |
| The unit tests (`tracker.test.tsx`) | `core.normalizeImport` | the boundary test: core's equals the module's given `SYLS` |

## 4. The proofs that it is only a move

| Proof | Result |
|---|---|
| Line for line against `main` (a script) | 86 lines removed from `core.js`; all but six found verbatim in `fileTransfer.js` — the six: four `export`s, the catalogue argument in the signature, and `SYLS` → `existing` in the one call |
| The test written FIRST — `src/tracker/file-transfer-boundary.test.ts` (11 checks): the module imports only the syllabus-id helpers and touches no store or browser; a store id winning by name in charts and students alike; an empty catalogue; a clash refused whole (no test had reached that refusal before); a version-2 file upgraded; a dangling student reference refused while the charts come; the file never changed; core's `normalizeImport` is the module's; a whole backup through File → Export and File → Import changes no record and no id; a refused file writes nothing | 11 / 11 on the code before the move, 11 / 11 after; the Tracker's whole unit set 435 / 435 |
| **Recording the built app** (`scripts/handpass/trk-ft-walk.mjs`): `main` built from its source alone, the branch built; File → Import driven five ways at 1440 × 900 and 390 × 844 by finger on the phone, the clock held and the random numbers seeded; every question shown and every Tracker record in storage after each scenario written out | two runs of `main` identical; `main` vs the branch **identical at both sizes** (821 lines of record each, 19 records after S1 — S4's students land on the chart minted for "Add as new", so the comparison did not pass on an empty world). Pictures: `docs/img/handpass/2026-10-17-trk-file-transfer/{desk,phone}/`; records: `docs/handpass/parts/trk-file-transfer/` |

**The sizing step (D607 — `docs/walk-ledger.md`):** (1) type E-like — a move of code with no behaviour, on the saved-data
path (G only in that it reads files); (2) only a walk could find a wiring the tests do not reach — the File menu's own
buttons, the questions' order, the phone; (3) the ledger's one precedent, `[LW-ROWS-SPLIT]` (13 Oct 26), was proved by
recording, no helper, nothing found on screen; (4) chosen: the host's recording walk, five scenarios, desktop and phone,
before and after, no helper walker; (5) its row is added below.

## 5. The break tests

Each planted alone in the moved code, the boundary test and the Tracker's three import-reaching unit files run:

| Break | Caught |
|---|---|
| B1 core hands an empty catalogue instead of the store's | yes |
| B2 the students not re-keyed with the charts | yes |
| B3 the scratch value `_b` compared | yes |
| B4 a name clash not refused | yes |
| B5 two student blocks landing on one chart not refused | yes |
| B6 the incoming file's charts and students not copied before use | first run: NO — nothing today depends on the copy (the scenario designer traced it: the file is a fresh read nothing else holds); a pin added (a deep-frozen file; the result shares nothing with it) — caught on the re-run |
| B7 a student reference to a chart the file lacks accepted | yes |
| B8 the module reaching the store | yes |

## 6. The reads

Both reports, as returned: `docs/handpass/parts/trk-file-transfer/reads.md`. Without Astra and Sol 6.1 — on `[NO-ASTRA-LIST]`.

| Reader | Found | Done |
|---|---|---|
| A fresh, blind Opus code read (handed the commit and the intent only) | only a move; every free variable resolves the same; the catalogue read at each call; no cycle; the Tracker's lazy chunk only; no stale document. Two low, test only: (1) core's `normalizeImport` test could not tell the live catalogue from an empty one; (2) the stands-alone scan missed a re-export | both fixed (`da594e099`), each seen to fail on its break |
| A fresh Opus scenario designer (asked what is missing) | no import scenario can differ (identical code, identical catalogue); the roll-call missed ✓ Save changes (`sameDef`) and Add as new (`remapStudentsSyl`); B6 is a missing pin, not a gap; five cheap pins for the module's future; the recording walk adequate, its breadth to include Save changes | roll-call rows added (Save changes carried by R-1, Add as new by S4); four pins added (a frozen file, layouts and details follow the id, disagreeing catalogues, a file with no version); one pin left (`charts.deleted` passing through — it documents behaviour, it proves nothing of the move) |

A fix round of the TEST only — no app code changed after the reads, so no read of the fixes (`bug-check-order.md` §5: a fix that rewrites logic).

## 7. The gates

The whole set on his PC under the lock, 17 Oct 26, on `bd07272f7` (the move and its walk; the later commit changes the new test only): build clean · tfin 728 / 0 · unit 11603 / 11603 (652 files) · e2e 844 passed, 0 failed, 59 skipped · smoke 446 / 0 · rulecheck OK · docsize OK — WHOLLY GREEN. After the test fix: the boundary test 15 / 15 (D902 — only the touched test; GitHub's run of the pull request is its full check).

## 8. Found on the way — older than this job

- **The students refusal gives the wrong reason for a current file.** S5: a file of today's version whose students point
  at a chart it does not carry is refused with "These student marks were saved by an older version and can't be brought
  in safely…" — but the file is not older; it does not match. The same words serve the real older-version case (S2).
  Unchanged by the move (identical before and after). Put to him with the Tracker batch's questions (round 1) —
  `[TRK-IMPORT-REFUSAL-WORDS]`.
- **An import stores the chart catalogue in the file's order.** The list a person sees — the Syllabus list, ⇅ Reorder —
  follows the chart order, which is unchanged; the catalogue's own stored order is not shown anywhere found. Not a
  finding on its own; noted in the boundary test's comparison.

## 9. For him

Nothing to look at: nothing on screen changes. His "merge live" is all that is left.
