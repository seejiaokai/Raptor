# Session handoff — amendment round-3 landed, then a whole-app architecture review reframed the roadmap

## Where it started
Continuing `[AMEND]` round 3 on `claude/amendment-engine-core`: two piles of quarantine
findings to fix. Fixing them surfaced a delete/undo bug FAMILY across the Leave War ↔ inputs
↔ documents seams; a cross-provider audit + a long owner design discussion turned into a
whole-app ARCHITECTURAL review that reframed the backlog. Nothing merged; nothing live.

## Shipped
- Nothing merged. Six commits on the branch (`1a6c242..HEAD`), NOT pushed at handoff time
  (push is part of this handoff). Two are CODE (gate-green), four are docs.
  - `054d3d7` Pile 2 (Opus, test-first): 5 small quarantine findings — classifier totality,
    empty-string stash, absolute date labels, notice-layer in shared builders, nav close/open.
  - `bcb473a` Pile 1 (Codex/Astra build, Opus-inspected): the 4 persistent deep findings —
    medical cascade LW withdrawal, sync boundary, reconcile/nav global-acc, U1 undo→redo→undo.
  - Docs: the sync-integrity spec, its Phase-1 red-team revision, the pivot to one global undo,
    and the architecture root-cause plan.

## Unfinished
- **THE ROADMAP CHANGED — read `docs/superpowers/specs/2026-09-13-architecture-rootcause-plan.md`
  and OUTSTANDING `[ARCH-STACK]` first.** A whole-app architectural review by BOTH providers
  (Astra + Fable) converged: the app is one store-pattern built three times and knows only THAT
  something changed, not WHAT. Fix order: (1) stable ids everywhere; (1b) ISO dates + a
  session-reset registry + the `mod:'now'` late-mark fix; (2) one write/command layer; (3) global
  per-session undo (inverse-patch, not snapshot); (4) one Absence record (design before the
  Dataverse tables freeze); (5) record storage door → Dataverse; (6) remove quarantine/legacy.
- **STOP doing:** interim two-system undo patches and further quarantine rounds — both replaced
  by the stack (owner ruled: reset demo data, don't migrate). The Phase-1 sync-integrity build
  was deliberately STOPPED mid-flight and its partial edits are in `git stash@{0}` (discard it;
  it was the interim two-system undo patch the review said not to build).
- **Small pre-stack guardrails still worth doing** (low urgency, pre-live), in OUTSTANDING
  `[SYNC-INTEG]`: P2 medical member-filed only, P4 clutter-only clear-data, P6 Quals ✕ confirm,
  P7 doc fix (CLAUDE.md's "Leave War session-only" line is stale).
- Owner's decisions + process principles from this session are captured in the auto-memory
  (guardrail-over-bug-cascade, dev-phase-reset-demo-data-not-migrate,
  architectural-root-cause-before-minute-fixes, future-undo-semantics-multiuser,
  multi-squadron-and-person-transfer, persist-per-task-context) — they load automatically.

## Branch state
- Designated branch: `claude/amendment-engine-core`.
- Its PR is <push at handoff; open/none — see chat>. NOT merged. No "merge live" given.
- If it has MERGED by the time you read this, reset before new work:
  `git fetch origin main && git checkout -B claude/amendment-engine-core origin/main`.

## Gates
- At the last CODE commit (`bcb473a`), run first-hand this session: `npm test` **4641/4641**,
  `node reference/tfin.js` **728/0**, `npm run build` clean. All commits since are docs-only,
  so HEAD's code == `bcb473a`.
- `npm run test:e2e`, `npm run smoke:tracker`, `probes:adapted`, `perf` — NOT run this session
  (the round-3 changes touch quarantine/sync/undo, not geometry or the Tracker tab). Run before
  any merge. From `raptor-port/`; a fresh container needs `npm ci` first.

## Open questions
- The owner was deciding how to start the stack: (1) I start step 1 (stable ids) now, or
  (2) start it in a fresh chat. He asked to hand off to a new chat — so option 2.

## Pick up here
Start `[ARCH-STACK]` **step 1 — stable ids** (cheap, independent, no deps; the foundation the
rest keys on): give personal inputs a UUID `iid` and make `ground.src`/filing address it,
`who`→`personId`, note ids, Tracker course/syllabus ids — per the plan doc. Spec → Astra
red-team → build → gates. Fable is ~18% until Mon 19:00; lead with Astra, save Fable for a crux.
