# Session handoff — [CMDL-FINISH] design LOCKED, build handed to a fresh session

## Where it started
Owner asked to take **[CMDL-FINISH]** (ARCH-STACK step 2 completion — finish the one
command layer for Leave War + Tracker) on the HEAVY path: design → red-team BOTH
providers → build (Opus 4.8 high) → cross-provider code inspection → gates → hold for
"merge live". It **gates [GLOBAL-UNDO]**.

## Shipped
- Nothing to production. Design is docs-only on branch `claude/cmdl-finish`
  (commit `8235c19`). No PR opened.

## Unfinished
- The **BUILD (phases P1–P6) has not started** — deliberately stopped here to hand off
  to a fresh session. The design is build-ready: FOUR cross-provider red-team rounds
  (Codex/GPT-6 Astra + Fable 5.1), converged — **Fable APPROVED/SHIP-READY**, Codex
  confirmed all round-3 folds closed. The three agreed **LOCK patches** are folded into
  the design's "LOCK patches" section; 9 build-advice notes are in the review log's
  round-4 entry. Do NOT re-open the design; build it.

## Branch state
- Designated branch: `claude/cmdl-finish` (pushed, tracks origin, off `main` at
  `8235c19`). No PR. NOT merged. Build continues on THIS branch — do NOT reset to main.

## Gates
- **None run this session — DOCS-ONLY** (design spec + review log + an OUTSTANDING.md
  note + the skill-observation log). Nothing code changed, so nothing to gate.
- The build runs the full gate set per phase from `raptor-port/` (fresh container:
  `npm ci` first): `npm test` · `npm run build` · `node reference/tfin.js` ·
  `npm run test:e2e` · `npm run smoke:tracker`, plus `probes:adapted`/`perf` for
  UI-visible work, and the live-view drive.

## Open questions
- None blocking. import-undo-granularity, the off-week FULL weekstash store, and
  GU-005 are deferred to [GLOBAL-UNDO] BY DESIGN (stated in the spec), not session
  leftovers.
- Owner offered, not yet taken up: a versioned backup of the machine-local memory
  files into the repo (his ~22 memory facts live only in the Claude home folder,
  outside git). Optional, non-blocking.

## Pick up here
Build **[CMDL-FINISH] P1** on `claude/cmdl-finish`, test-first, per
`raptor-port/docs/superpowers/specs/2026-09-17-arch-stack-cmdl-finish-design.md` §7
(fold each phase's "LOCK patches" as you build it). Read that design + its
`…-cmdl-finish-review-log.md` first. Full gates per phase; cross-provider CODE
inspection of the built code after the build; NO merge without "merge live".
