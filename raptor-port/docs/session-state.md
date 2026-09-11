# Session handoff — amendment engine redesign (design-first) + backlog

## Where it started
Owner (non-technical) resumed the amendment-model work from the 11 Sep review.
Design-first, no code. This session settled the publish/amend model, cross-reviewed
it with Astra (Codex), stood up a durable backlog (`/OUTSTANDING.md`), and captured
the reasoning into committed docs so a future session can pull it back out.

## Shipped
- Nothing to `main`. New docs committed to the designated `claude/` branch and
  pushed; PR open, awaiting the owner's "merge live". Docs-only.
- (Not this session, for context: the AL-tooltip security fix merged as PR #393 and
  is live — logged under Done in `/OUTSTANDING.md`.)

## Unfinished
- **[AMEND] amendment redesign is DESIGN-ONLY, blocked on two owner decisions:**
  #1 plans (disappear at publish vs survive as contingencies); #3 signatures (all
  four roles re-sign each amendment vs fewer). Settled: per-day isolated numbering
  (never week-wide), published = immutable, every change a new AL,
  supersede-never-retract, undo can't cross a publish. Astra verdict = REVISE, with
  4 must-fixes (unique date-qualified version IDs; saved-week migration incl. Leave
  War's direct reads; define what a published version captures; bind signatures to
  content). Full state + rationale + mockup links:
  `raptor-port/docs/superpowers/specs/2026-09-11-amendment-model-decisions.md`
  (§10 context, §6 findings); review brief `-design-brief.md`; original review
  `-review.md`.
- **Two built-but-unmerged Tracker fixes** (old branches — re-check vs current `main`
  before landing): `claude/tracker-import-conflict-fix` (#386),
  `claude/storage-legacy-import-ledger`. See `/OUTSTANDING.md` [TRK-IMPORT]/[TRK-LEDGER].
- Nothing else in flight.

## Branch state
- Designated branch: the `claude/` branch this handoff was pushed to (docs).
- Its PR is open, awaiting "merge live". Docs-only → no gates run.
- If it has MERGED before the next session starts, reset first:
  `git fetch origin main && git checkout -B <branch> origin/main`.

## Gates
- Not run — docs-only change (no code touched); `deploy.yml` skips `**.md` /
  `.claude/**`, so no gate checks apply. Run from `raptor-port/` (with `npm ci`) only
  when code work resumes.

## Open questions
- **[AMEND] #1 plans** and **#3 signatures** — the two the owner must answer to
  unblock the rebuild (details in the decisions doc §4).
- **[OIL]** lock earned-OIL on an already-worked day — owner leaning yes; confirm.

## Pick up here
Get the owner's **plans** and **signatures** decisions, then revise the design brief
and re-run Astra on a **frozen** file (`claudex-loop`, host=claude reviewer=codex).
The whole backlog, priority order and per-task context live in `/OUTSTANDING.md`.
