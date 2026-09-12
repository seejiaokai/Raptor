# Session handoff — [AMEND] Phase 2: quarantine REDESIGN built + gate-green; cross-provider bug-check in flight

## Where it stands (branch `claude/amendment-engine-core`)
The legacy-book QUARANTINE redesign (the round-3 REVISE, 8 findings P2-REV2-01..08)
is **BUILT and gate-green**. All local gates pass:
**unit 4601/4601 · parity 728/0 · build clean.**

Commits on top of the gate-green base `169e85a` (`d949ea1` = the brief/handoff, docs-only):
- `661a1be` — cluster 1: the INPUT choke-point + off-week 'u' filing (P2-REV2-04, 06)
- `9390f0c` — cluster 2: schedule-mutation + publication + rendering gates (P2-REV2-02, 03)
- `2180c87` — cluster 3: unreadable saved week preserved, never seeded over (P2-REV2-01)
- `07d8386` — cluster 4: filing knock-on, template-arm lifecycle, legacy no-op (P2-REV2-05, 07, 08)
- `4546887` — a tsc type fix on the alIssue guard

## The redesign in one line per finding
- **04 (choke-point):** `writeInputs`/`writeInputsBatch` (state/store.ts) now snapshot the
  model and roll it back (via a new `histRestore`, the same restore undo runs) if the batch
  touched an input covering a protected date or a protected loaded week's schedule. EVERY
  input writer already funnels through these two, so a new writer is caught automatically —
  the convergence the per-site guards lacked. No-op fast path when nothing is quarantined.
- **06:** a `'u'` filed-unavailable input survives an off-week remarks edit (inputedit.tsx).
- **02/03:** every structural schedule mutator refuses on `protectedWeek()` —
  draftSelect/draftDup/loadVersionToWorkingCopy/draftDelete/draftRename, applyDayTpl,
  setDayApproved/publishALDay/alIssue (refuses FIRST). `dayIssuedHTML` classifies by the
  week/book, not id resolution. UI preview buttons inert on a protected week.
- **01:** `applyWeekModel` distinguishes MISSING from UNREADABLE; a damaged stash loads the
  seed as a placeholder VIEW but byte-preserves its original bytes and is read-only.
  `protectedWeek()` now also true for a preserved week; `stashDays` returns null for a
  no-days blob; the OIL pass protects a preserved loaded week.
- **05:** `reconcileDayFiling` (engine/slots.ts), from `rebaseDayPending` (the chokepoint every
  approved-day replacement funnels through), unfiles a `'g'` whose row a replacement dropped.
- **07:** a monotonic nav token (`view.navGen()`) folded into `dayTplArmKey` invalidates a
  stale template-apply confirm on any navigation.
- **08:** `shiftKeys`/`permuteKeys` remap keys/adds/structAdds only when present.

## ROUND-2 fixes done (13 Sep 26) — awaiting re-review
Both bug-checks (Codex/Astra + Fable) returned REVISE on the first redesign
(8 findings P2-QREV-01..08, root cause: the input gate was run-then-rollback, not
a preflight). All fixed across commits `0087e35` (A+C — preflight + one shared
classifier) and `5e417f8` (B-G — filing reconcile, nav token, OIL bell,
quarantine notice, edge guards). Findings + fix map:
`docs/superpowers/specs/2026-09-13-amendment-phase2-quarantine-round2-findings.md`.
All gates green again: **unit 4615/4615 · parity 728/0 · build clean.**

Owner also asked (13 Sep) for a dedicated cross-provider look at what UNDO does
and does NOT restore across platforms (Leave War, medical docs, edit log) — a
guardrail-or-reconcile question. Folded into the round-2 re-review scope.

## ROUND-2 RE-REVIEW DONE (13 Sep 26) — a small OPEN set remains → round 3
Both providers re-checked the round-2 fixes (@`08c5a86`). Fable VERIFIED most closed
(A1, A4, B1/B2, C, D, E, G). A small set is still open — full list + PRECISE fix specs
in `docs/superpowers/specs/2026-09-13-amendment-phase2-quarantine-round2-findings.md`
(the "RE-REVIEW" + "UNDO cross-platform audit" sections). Headlines:
- **Medical cascade LW withdrawal (HIGH, EXECUTED, PERSISTENT — 2 Opus attempts):** the
  preflight covers only the first kept segment; `mintMedSegments` + edit-path upchit
  removals still fire `retractLwRow` unpreflighted. Precise fix: gate `retractLwRow` at
  source (`leavewar/sync.ts`: `if(!row?.lw||inputProtected(row))return`) + preflight
  inside `applyMedPlan`/`mintMedSegments`.
- **Sync boundary (MED), reconcile/nav global-acc (HIGH), classifier totality (HIGH,
  regression), date labels (HIGH, pre-existing), notice layer (MED), empty-string stash,
  OIL span, callsign rename (rare), nav close/open (LOW).**
- **UNDO (owner's question):** mostly self-heals (Leave War re-derives on undo); ONE real
  pre-existing bug — **U1:** delete-leave → undo → redo → undo silently erases a synced
  leave on both sides. Fix = RECONCILE the stale-splice against the live war, not a
  session set.

## ROUND-3 PLAN (owner rules, 13 Sep 26)
- The PERSISTENT deep ones (medical cascade / sync / reconcile-nav quarantine web, and
  U1) → HAND to Codex/Fable to FIX with the detailed specs above as the work order
  (`[[escalate-persistent-bug-to-fixer]]` + `[[reviewer-must-give-detailed-fix-specs]]`):
  they survived Opus attempts, advanced model has the better chance. Mechanism:
  claudex-loop `codex-build` / runner build mode; or a Fable fix subagent.
- The small clear ones (classifier catch totality, empty-string, date-labels-to-ISO,
  notice-layer-into-dayHTML, nav close/open) → Opus can fix directly, test-first.
- Keep every gate green (unit 4615+, parity 728/0, build). Keep the tree QUIESCENT during
  any Codex inspect (a mid-inspection commit flags "code changed").
- Re-run BOTH bug-checks after. **Do NOT merge** until owner says "merge live" AND Codex is
  clean. No-auto-merge stands. PR #395 and the EOD feature stay untouched.

## Standing constraints (unchanged)
Both this repo's sessions share ONE working folder — only one runs git at a time; put the tree
on `claude/amendment-engine-core` first. Every new persisted field still rides
`schedFields()`+`histApply`; parity stays 728/0.
