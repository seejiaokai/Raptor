# Sync / delete-undo integrity — round-3 spec & record (13 Sep 26)

Companion to the quarantine round-2/round-3 work. Pile 1 (the four persistent deep
quarantine findings) landed on `claude/amendment-engine-core` (commit `054d3d7`,
gate-green). This document captures the follow-on: a focused **read-only
cross-provider audit** of DELETE / UNDO behaviour across the Leave War ↔ inputs ↔
documents seams, the owner's decisions from that discussion, and the fix plan.

The audit ran on both providers (Codex/GPT-6-Astra high, and Fable 5.1) as a
read-only review; their raw outputs lived in a scratch dir that does not persist, so
the findings are recorded below.

> **DIRECTION CHANGE (owner, 13 Sep 26) — read first.** The whole UNDO/permission half
> of this (findings A/P1, C/P3/DU-001, D, E, F, I) is NO LONGER patched here. The root
> cause is two SEPARATE per-section undo systems over shared data; the owner chose to
> remove that root wholesale via **one global per-session undo (`[GLOBAL-UNDO]` in
> OUTSTANDING), built as a step BEFORE the database** — not interim two-system patches
> (which would be thrown away), and safe to defer because the app is pre-promulgation
> (demo data, no live users). An Astra red-team of the interim two-system plan (REVISE,
> 6 findings — recorded below) is what exposed how fragile the two-system approach is and
> prompted this. **What remains actionable from this spec is only the small NON-undo
> guardrails: P2 (medical member-filed), P4 (clutter-only clear-data), P6 (Quals ✕
> confirm), P7 (doc fix).** The findings/decisions below stand as the record for
> `[GLOBAL-UNDO]` and `[SYNC-INTEG]`.

---

## Owner decisions (13 Sep 26) — settled

1. **Medical is member-filed ONLY.** The Leave War may DISPLAY medical (synced in
   from the member's own filing, which carries the certificate) but may no longer
   CREATE it. Removes the admin-originates-medical path. **Revisits the 17 Aug 26
   "medical markers are management's" decision** — deliberately.
2. **Deletes are provenance-aware.** A deliberate delete propagates and STICKS on
   both sides; an UNDO rebuilds. The system must distinguish "deleted on purpose"
   from "momentarily absent during an undo."
3. **A medical document remaining after an undo is ACCEPTED.** The append-only
   document store stays; no file-deletion work.
4. **Return vs transfer (FUTURE):** leaving the whole APP SYSTEM then being posted
   back = **FRESH** (new quals + new Leave War balances, past frozen); being posted
   from one squadron to another WITHIN the system = **data PRESERVED**. See
   memory `multi-squadron-and-person-transfer`.
5. **"Clear old data" never touches leave records or balances.** It clears only
   past scheduling clutter.
6. **Undo model:** near-term, per-week undo must SURVIVE navigating away from a week
   and back within a session (today it resets on every week switch). Cross-week
   "undo something off-screen → snap me to that week and show what changed" is
   FUTURE. Future multi-user undo (end-state DB): scoped to the login SESSION
   (logout clears it), never affects another user, but others see every change live.
   See memory `future-undo-semantics-multiuser`.

---

## Findings (merged; Codex `DU-xxx` + Fable `Fx`), with disposition

Severity is the higher of the two reviewers'. "Root" = the shared delete-vs-undo
ambiguity in `sync.ts warSupersedes` / the demote path.

| # | Sev | What (plain) | Mechanism | Disposition |
|---|-----|--------------|-----------|-------------|
| A (F1/DU-002) | HIGH | Deleting an approved leave/medical on the WAR resurrects it as Raptor-owned, and the board then won't let you delete it again; day-by-day vs whole-run is inconsistent; a move can leave it on BOTH dates | `sync.ts` `warSupersedes` false when cell empty → `runOutbound:300-302` `delete row.lw` instead of splice → `runInbound` re-lands raptor-owned. `runOutbound` before `runInbound` (`:1158-9`). | **Phase 1** (provenance-aware delete). Root fix. |
| B (F2) | HIGH | "Clear old data" wipes past approved leave from the war and REFUNDS leave balances | `inputedit.tsx clearHistoryData:1287-8` runs `dropInputRow`→`retractLwRow` on every doomed input, no lw exclusion; leave charge reads the grid (`leavewar/engine/charge.ts`); runs `locked` so no LW undo | **Phase 1** (P4). |
| C (DU-001) | HIGH | A member can Undo/Redo to reverse/reinstate ADMIN Leave War decisions | `store.ts historyApply:1091` restores whole snapshot, no role/viewer check; `setRole:1618` doesn't rebaseline HIST; `Chrome.tsx:106-120` Undo/Redo buttons gated only by can-undo, not role. **Verified by Opus.** | **Phase 1** (P3). Authorization. |
| D (F3/DU-005/006) | MED | Undo of a synced leave silently flips it to Raptor-owned, loses `source`/`shiftedFrom`/remarks, re-mints with fresh `iid` (reads as touched-today for the LATE mark); undoing an UNRELATED war edit can resurrect a deleted bid | same `warSupersedes`/demote path under `HIST.lock`; `RETAINED` only fills on outbound splice, not on undo-removal | **Phase 2** (undo done right) — same root. |
| E (F4) | MED | Delete a leave on the war, press its Undo → the person shows that leave TWICE | after A the input is plain + cell raptor-owned; LW Undo restores the bid → `runOutbound` mints a 2nd row; no dedupe of plain rows | **Phase 2**. |
| F (F5) | MED | Filing on inputs something the war already had makes the war's copy "Raptor's"; deleting the input later deletes the original too | `ingestFromRaptor:2721` upgrades a bid to `{approved,raptor}`; reverse sweeps then treat it as Raptor's | **Phase 2** (design with D/E). |
| G (DU-003) | (disputed) | A medical certificate could attach to the wrong episode (two same-type spans) | `sync.ts:312-324` `priorRemark` keyed only by `person|type|portion`, set once; both re-mints read the first record. Opus confirmed the code path; Fable judged the doc store itself sound. | **MOOTED by decision 1** (no war-originated medical → path can't fire). No separate work. |
| H (F7) | LOW-MED | The Quals ✕ (archive without posting-out window) strips a person's leave from both sides | `sync.ts reprojectRoster:1017-20` keeps only `to!==null`; excluded person's cells cleared + inputs spliced; self-heals on Restore | **Phase 1** (P6) small guardrail/confirm; full redesign rides the FRESH RECALL feature (parked). |
| I (DU-004) | MED | Deleting/editing an input while on another week leaves a stale ground row that reappears on return | `applyWeekModel` clears per-week `acc`; `unacceptInput` searches only loaded DAYS; other weeks' saved rows untouched | **Phase 2** (delete cleanup across all weeks). |
| J (DU-007) | MED | Two inputs sharing `inpKey` → deleting one removes the other's filing | `reconcileLandedAcc` assigns `acc='g'` to both from one ground row; reverse lookup ambiguous | **Parked** — rides input stable-ids (sibling of the schedule `rid` work). |

**Deliberate / not bugs (confirmed by both, no change):** the edit log surviving
undo (paperwork); medical documents never physically deleted (accepted, decision 3
— only unbounded storage growth, minor); undo not crossing a week switch (being
changed per decision 6 to survive navigation; true cross-week undo is future).

**Also found:** the pin `sync.test.ts:443` ("clearing the grid marker removes its
input") is **false-green** — it counts only lw-tagged rows and never runs
`runInbound`, so it misses finding A. **Fix the test in Phase 1.** And CLAUDE.md's
"Leave War is session-only" line is **stale** — two tabs now share persisted
wars/inputs (`leavewarAdapter(wb)`); fix the doc.

---

## Fix plan

### Phase 1 — before-live: data integrity + permissions (build first)
Independent of the undo rework; these are the data-loss / authorization risks.

- **P1 — Provenance-aware war-side delete (finding A).** A deliberate war-side
  delete of a war-originated leave must RETRACT the matching input (propagate),
  not demote+rebuild. Distinguish a deliberate delete from an undo-induced absence
  (a clean signal exists: reconcile under `HIST.lock` = undo → rebuild; otherwise a
  genuine clear → propagate). Cover single/`clearCells`/day-by-day/`shiftBid`-move.
- **P2 — Medical member-filed only (decision 1).** Block medical origination on the
  war for everyone (extend the existing `isMedical && role!=='admin'` gate to all);
  ensure the war→inputs mint path never creates medical. Confirm display of
  member-filed medical still syncs in. Removes finding G.
- **P3 — Leave War undo permission gate (finding C).** Gate `lwUndo`/`lwRedo` (and
  `historyApply`) so a member can never restore admin-only or another person's
  state; rebaseline/segregate the LW history on login/role/identity change.
- **P4 — Clear-old-data guard (finding B + DU-008).** Never delete leave records or
  change balances; never clear the currently-loaded week (and don't count it as
  cleared); keep the protected-week preflight; honest confirmation showing the
  count + cutoff + "leave is not affected"; suggest an Export first (deletion is
  permanent). Old-leave purging, if ever wanted, is a SEPARATE explicit action.
- **P5 — Fix the false-green test** (`sync.test.ts:443`) so finding A can't regress.
- **P6 — Quals ✕ guardrail (finding H).** A confirmation that it removes the
  person's leave. Keep small; superseded by the fresh-recall feature.
- **P7 — Doc fix:** correct CLAUDE.md's stale "Leave War session-only" line.

### Phase 2 — undo done right (closely following Phase 1; same machinery)
- Undo-family fixes (findings D, E, F): undo restores both sides cleanly — no
  ownership flip, no duplicate, no lost remarks/doc-link; a deleted bid is not
  resurrected by undoing an unrelated edit.
- Off-week delete cleanup (finding I): a global input delete/edit cleans its
  landings in EVERY affected week, inside the same undo step.
- **Per-week undo survives navigation (decision 6):** each week keeps its own live
  undo stack across away-and-back within a session. Keep it SESSION-SCOPED and
  PER-USER so it extends to the future multi-user rules (memory
  `future-undo-semantics-multiuser`).

### Parked → OUTSTANDING
- Cross-week "snap-to-page" undo (decision 6, future).
- Fresh recall from archive (replaces the ✕ area; decision 4).
- Multi-squadron + transfer-a-person-with-data (memory).
- Shared-identity wrong-row delete (finding J) — rides input stable-ids.

---

## Phase 1 — RED-TEAM REVISION (Astra, 13 Sep 26)
Astra red-teamed the Phase 1 plan (verdict REVISE, 6 findings). Re-processed through
the owner's dev-phase rule (`[[dev-phase-reset-demo-data-not-migrate]]` — pre-promulgation,
demo data is reset not migrated) and the guardrail-simplify rule, three findings dissolve
and three are real forward-behaviour fixes. The revised Phase 1:

- **P1 (real, HIGH) — delete-vs-undo needs a real signal, not `HIST.lock`.** There are TWO
  HIST objects; a scheduler-undo restores the input under the SCHEDULER lock while the Leave
  War lock is false, so "unlocked = deliberate delete" would delete a leave an undo is
  restoring (breaks `quarantine-pile1.test.ts:108`). Fix: an explicit RECONCILIATION CONTEXT
  distinguishing (deliberate war mutation) / (scheduler-history restore) / (Leave War history
  restore) / (ordinary sync), carried across the whole synchronous notify cycle; propagate a
  delete ONLY on a deliberate war mutation; keep both undo paths working.
- **P2 (revised) — block medical creation on the war for ALL roles** at every writer
  (`setCell`/`setCellRange`/`setCells`/`setBidState`/`shiftBid`) AND hide medical from the war
  pickers (`Matrix.tsx`, `BidPicker.tsx`); keep member-filed medical DISPLAY + `ingestFromRaptor`.
  **Existing war-originated medical is demo data → reset it, NO migration/back-compat code**
  (owner rule). The builder must only ensure blocking creation doesn't break on existing rows.
- **P3 (real) — reset Leave War undo history only at GENUINE login/logout**, NOT on a
  role/viewer PREVIEW toggle (the admin "view as member" contract preserves history); enforce
  permissions against the actual restoration diff; make `lwCanUndo`/`lwCanRedo` reflect whether
  restoration is permitted.
- **P4 (SIMPLIFIED) — "Clear old data" is CLUTTER-ONLY.** It removes only old plan pucks, old
  day notes, and genuinely-empty past weeks. It **never deletes any leave, medical, or duty
  input**, so the OIL-balance dependency (P4-001) and the "which records are leave" predicate
  (P4-002) both fall away. Never touch the loaded week in ANY collection; dry-run selection ==
  execute selection; honest confirm.
- **P5** fix the false-green test with a real approved non-medical leave fixture, assertions
  over ALL matching inputs, and the real bidirectional notify; **P6** Quals ✕ confirm; **P7** doc fix.

DISSOLVED by the dev-phase rule / clutter-only simplification: P2-001 (existing-medical
migration), P4-001 (duty-sourced OIL balance), P4-002 (leave-retention predicate).

## Process (owner's standing rules)
HEAVY (silent data loss / permissions). Phase 1: this spec → **Astra red-team of the
plan** (Fable is ~18% until Mon 19:00, so Astra leads) → Astra build with per-finding
fix specs (`[[reviewer-must-give-detailed-fix-specs]]`) → Opus inspect + full gates →
a single **Fable-high verify on the two data-loss/permission fixes (P1, P3/P4)** →
hold; **no merge without "merge live"** and a clean Codex pass. Keep the tree quiescent
during any inspect. Gates to hold: unit ≥ 4624, parity 728/0, build clean.
