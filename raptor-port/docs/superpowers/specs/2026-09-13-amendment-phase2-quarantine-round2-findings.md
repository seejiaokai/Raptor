# Quarantine redesign — round-2 cross-provider bug-check (13 Sep 26)

The redesign (built on `169e85a`, gate-green: unit 4601/parity 728/0/build clean)
was bug-checked across **both** Codex/Astra (`--base 169e85a`, gpt-6-astra, high) and
**Fable 5.1 high**. BOTH returned **not-yet-merge**, independently confirming the same
core problems. This is the fix list for the second cycle.

## Root cause (my design error)
I built the input gate as **run-then-rollback** (execute the batch, then `histRestore`
if it touched a protected date) instead of the **preflight** (check-before-execute) the
brief actually specified. Rollback cannot cleanly undo side effects that already fired
(Leave War cells, the edit log, docAdd), rolls a mixed batch back wholesale, and leaves
callers unable to tell it failed. The correction is to preflight every writer per the
brief's own list, keeping the funnel rollback only as a last-resort backstop.

## Findings (both reviewers, merged; severity = higher of the two)

### A — Input protection must be a PREFLIGHT (HIGH)  [Codex QREV-01/02/03/04 · Fable 1/3/8]
- **A1 Filing bypasses the funnel.** `interactions.ts:481` calls `acceptInput`/
  `unacceptInput` directly; those check only `protectedWeek()` (loaded week), not
  `protectedDates()` (stashed protected weeks). A multi-day input spanning a supported
  loaded week + a stashed protected week can be un/re-filed, changing the protected
  input's global `acc`. → Route filing through the global protected-date preflight.
- **A2 Rollback can't undo cross-store side effects.** Inside a batch, `applyMedPlan`/
  `dropInputRow` call `retractLwRow` → withdraws Leave War cells + `RETRACTED` BEFORE the
  mutation; `histRestore` restores only DAYS/INPUTS/SCHED. A rejected medical add leaves
  the war withdrawn while the input is restored. Also orphaned: `logAction`, `docAdd`
  blobs, the `inpId` counter. → Preflight the whole plan before ANY mutation/side effect.
- **A3 Coarse batch rollback breaks unrelated sync.** `sync.ts runOutbound` batches every
  stale/missing row; one protected row rolls back the ENTIRE batch (legit rows on normal
  weeks included), and the mismatch persists → a permanent refuse-loop that blocks all
  future LW→Raptor sync and toasts "locked" on every notify. → `desiredRuns`/stale
  detection must EXCLUDE protected-date rows before building the batch.
- **A4 Callers ignore the failure boolean.** `clearHistoryData` proceeds with
  `stashDrop`/`persistAll`/"Cleared N records" after a rejected batch (partial destructive
  op); `InputsPage` runs `finishAdd` after rejection (flashes an unrelated row, clears the
  remarks box + orphaned document); `commitNewInput`/`commitInputEdit` return true after a
  rejected cascade. → Propagate the refusal; preflight `clearHistoryData` before deleting.

### B — Filing reconcile: regression + coverage gap
- **B1 (HIGH, REGRESSION vs 169e85a)  [Fable 2]** `reconcileDayFiling` only DELETES
  `acc='g'`, never re-derives it. Draft round-trip on a published day (switch away →
  row gone → acc deleted; switch back → row returns) leaves `acc` undefined despite the
  row being on the board → phantom filing amendment, "Accept" refused by the dedup guard,
  and a mis-frozen fingerprint. → Mirror `reconcileLandedAcc`: SET `'g'` when a
  src-matching row exists and `acc` is falsy, CLEAR when no row exists.
- **B2 (MED)  [Codex QREV-07 · Fable 4]** `reconcileDayFiling` runs only via
  `rebaseDayPending`, which fires only for APPROVED days. An unpublished replace that drops
  a row, then first publish, freezes `fil='g'` with no landing → navigation phantom. →
  Reconcile after EVERY whole-day replacement, approved or not.

### C — One shared unreadable/preserved classifier (HIGH/MED)  [Codex QREV-05/06 · Fable 5]
- **C1** `protectedDates()` neither treats `!Array.isArray(sc.d)` as unreadable nor
  consults `isPreservedWeek(k)`, so an unopened damaged stash contributes NO protected
  dates and the input funnel accepts writes onto it until it is opened.
- **C2** `applyWeekModel`'s unreadable check is conditional on parsed `s` being truthy, so
  stored JSON `null`/`false`/`0` slips through → seed loaded, preservation cleared,
  `persistAll` overwrites the stored record with seed.
- → ONE stash decoder/classifier used by load, `protectedDates`, preservation, and OIL;
  storage PRESENCE determined independently of parsed truthiness.

### D — OIL ask on a protected date can't be answered (MED)  [Fable 6]
`oilAskPlan`/pending have no protected-date filter, so an ack on a quarantined week keeps
the bell lit; the answer write is rolled back. → Skip protected dates in the ask
(the OIL pass already treats them as "credit stands").

### E — Nav token misses board-day navigation (LOW-MED)  [Codex QREV-08 · Fable 10]
`setBoardDay`/`boardDayStep` bump `BOARDREV`, not `NAVGEN`, so a within-week board step
away-and-back leaves a stale template-apply confirm that applies on one pick. → Bump the
nav token on board-day transitions too.

### F — Unreadable week renders the seed as if it were the schedule (MED)  [Fable 7]
The placeholder view shows demo/empty content with no on-screen quarantine indication
(only approved days get `dayUnsupportedHTML`). → Surface an explicit quarantine notice for
a preserved week (brief §4).

### G — Smaller
- **G1 (LOW-MED, SUSPECTED)  [Fable 9]** the P2-REV2-06 `'u'` restore ignores a type change
  — a `'u'` leave retyped to an activity and moved off-week keeps `'u'` and never lands.
- **G2 (LOW)  [Fable 11]** schedule structural writes still rely on `editMode` render
  gating; `data-signclear` → `signClear` has NO gate. → add `protectedWeek()` at the write.
- **G3 (LOW)  [Fable 13]** `fn()` throwing inside `runInputWrite` leaves a half-mutated
  model — wrap and restore from the snapshot that is already taken.
- **G4 (LOW, pre-existing)  [Codex QREV-12 / Fable 12]** Admin "clear old data" cannot drop
  a preserved LOADED week (`stashDrop` leaves `PRESERVED`; persist rewrites it).

## What both reviewers judged CORRECT / converged
Rollback mechanics (`histRestore` restores every `histSnap` field in place, no false
rollback on normal weeks, the sorted-multiset compare is sound); `protectedWeek()`
broadening has no swap-window hole and no import cycle; the unreadable path never persists
the seed placeholder; `keys.ts` is correct; `dayIssuedHTML` is right for the unsupported
(not-unreadable) case; publication guards are sound.

## RE-REVIEW after the round-2 fixes (13 Sep 26, @08c5a86) — both providers
Codex/Astra (`--base 169e85a`) and Fable 5.1 both re-checked. Fable VERIFIED closed:
A1, A4, B1/B2, C1/C2, D, E, G1/G2/G4, and the commitInputEdit preflight-vs-in-batch
plan. So most of round-2 landed. What REMAINS OPEN (merged, higher severity first):

- **[PERSISTENT — 2 Opus attempts] Medical cascade LW withdrawal** (Codex Q2R-01 ·
  Fable #1, HIGH, EXECUTED): the preflight covers only the FIRST kept segment.
  `mintMedSegments` segs 2..n (InputsPage.tsx:502/602, inputedit.tsx:1445) and the
  upchit ticked-removals on the EDIT path (InputsPage.tsx:567, inputedit.tsx:1410/1420)
  run `applyMedPlan`→`retractLwRow` UNPREFLIGHTED → the war is withdrawn, the model
  rolled back, and `runOutbound`'s protected-row filter then freezes the mismatch
  forever. **Precise fix (both):** gate the side effect at its source —
  `leavewar/sync.ts` `retractLwRow`: `if (!row?.lw || inputProtected(row)) return`;
  and preflight inside `applyMedPlan`/`mintMedSegments` so the 6 sites can't drift.
- **[PERSISTENT] Sync boundary** (Q2R-02 · Fable #2, MED, EXECUTED): the protected
  filter judges a coalesced run's two halves independently → a leave crossing a
  protected boundary is stranded (lost on the Raptor side) or duplicated. Fix:
  evaluate the diff per `person|type|portion` pair; if either side touches a
  protected date, leave both out and treat an existing covered row as satisfying it.
- **[PERSISTENT] reconcile / navigation global-acc** (Q2R-05, HIGH): `reconcileDayFiling`
  and the store.ts navigation acc-clear/rebuild write global `acc` for a protected-
  SPANNING input with no `inputProtected` guard. Fix: guard both against protected
  dates; separate per-week landing from the global filing decision.
- **Notice layer** (Q2R-06 · Fable #3, MED): the `dayIssuedHTML` notice is unreachable
  for a damaged week (all days unapproved → `dayHTML`). Fix: put the check in `dayHTML`
  (the shared builder) or a week-level banner; cover ViewWeek/EditWeek/board.
- **Classifier totality** (Q2R-04, HIGH, REGRESSION): `stashProtected` catches only
  JSON.parse, so `amFormatOf` throwing on a damaged `als` propagates and breaks other
  weeks' writes. Fix: wrap the whole classification; classification failure = unreadable.
- **Date labels** (Q2R-03, HIGH, PRE-EXISTING): `protectedDates` uses `weekBundle(k).dates`
  (yearless for authored weeks) → cross-year mislock. Fix: absolute ISO/ordinals.
- **Empty string stash** (Q2R-08, MED): `''` reads as absent. Fix: presence by explicit
  null, pass `''` to the classifier.
- **OIL span** (Q2R-07, MED): whole-row lock vs per-day ask — a row spanning
  protected+unprotected still nags but can't be answered. Fix: align ask/revise/commit.
- **Callsign rename on a frozen week** (Q2R-09, MED, PRE-EXISTING, rare): rename rewrites
  frozen schedule who-fields. Fix: preflight against protected refs / stable ids.
- **Nav close/open** (Q2R-10, LOW), perf memoise (Fable #4), non-quarantine throw
  (G3, LOW), rollback log residue (LOW), removeInput boolean (LOW).

### UNDO cross-platform audit (owner's question)
Undo restores DAYS/INPUTS/SCHED/WARNOFF/PLANPUCKS/DAYRMK. Leave War is NOT in the
snapshot but IS re-derived on undo (histApply→reflow→notify runs the sync while
HIST.lock holds), so it self-heals for the ordinary cases; medical doc blobs are
append-only (harmless orphans); the edit log is deliberately not undone.
- **Gap U1 (HIGH, PRE-EXISTING, EXECUTED):** the `RETRACTED` demote is single-shot, so
  delete-leave → undo → redo → undo silently ERASES a synced leave on both sides.
  Fix (RECONCILE): in the stale loop splice only when the war actively holds a
  different/refused state; when cells are absent/Raptor-owned, demote — derivable
  from the war, not a session set.
- **Gap U2 (MED):** undo cannot remove a war-minted row (re-derived on undo). Add a
  one-line toast ("that leave comes from Leave War — change it there").
- **Gap U3:** the rollback backstop is finding-1's problem (fixed by the retractLwRow gate).

## Sequence
Fix A→G test-first, keep every gate green, never weaken an assertion. Then re-run BOTH
bug-checks (keep the tree quiescent during an inspect — a mid-inspection commit flags
"code changed"). Merge only on Codex clean AND the owner's "merge live".
