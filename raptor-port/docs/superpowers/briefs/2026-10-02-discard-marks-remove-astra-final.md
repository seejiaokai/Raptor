# D488 final code inspection — Astra

Written before dispatch, 2 Oct 26. Immutable after the inspection starts.

Inspect Sol 6.1's `codex/discard-marks-remove` work, independently and read-only. You are a fresh
inspector, not the planning/scenario agent. D496 authorizes this Codex-only model arrangement;
Claude's Monday further reads remain owed before main. Do not invoke Claude, edit anything,
run heavy checks, commit, push, create a PR or merge. No cross-provider approval is claimed.

Read root AGENTS and its required rules, the current own HANDOFF block, scheduler decisions and
the full D488/D148 rows, and bug-check-order §4/4a. App base:
`d9492f1e3dad78cb15dc25b4fbfc8e01f6eb24df` on `claude/planning-filing-3-oct`.
Current HEAD is a docs-only D496 commit; app changes are uncommitted. Use `git diff` and `git status`
to inspect that exact working snapshot. The host retains its source/harness fingerprint outside
the checkout and will check it again after your read. Restrict your verdict to the D488 change.

Promise: remove Discard marks completely, including the command/count and future marks-cleared
history writer; keep draft marks until normal first publication; retain normal publication/AL,
Undo/Redo, adjacent-day isolation, saved state, existing history and existing phone/member rules.
No replacement clearing door, data migration, new schema, CSS or button resizing.

Do not merely review the changed code. Starting from the user promise and the applicable
rulings, enumerate every qualifying object, renderer, visible door, writer, reader, downstream
consumer, role, overlay and meaningful order of actions. **Assume every existing line may be
correct and the defect may be a MISSING call site.** For each item, state where the visible sign
and the working gesture should exist in the production app. Then rank concrete failure scenarios
with setup, action, expected result, and the observation that would disprove correctness. Start
with the least-shared or most specialised surface.

This app is pre-promulgation and its entire stored world is DEMO DATA that will be CLEARED before
the database step. **Do not report a problem whose harm exists only in data already stored when
the code is already correct going forward** — no migration, no back-compat, no "an existing
record would read wrongly". If the app would do it again to NEW data, report it: that is a real
finding and this exclusion does not touch it.

Check removed command callers/exports, permission registry and history descriptors; equivalence
of the retained draft guidance; meaningful replacements for obsolete tests; and the added actual
UI walker. Check all evidence claims against observed results and picture targets. Evidence:
`docs/handpass/2026-10-02-discard-marks-remove.md`; walker:
`scripts/handpass/discard-marks-remove.mjs`; pictures/results under
`docs/img/handpass/2026-10-02-discard-marks-remove/final/` and `history/`.
Raw gates: `C:/Users/User/AppData/Local/Temp/codex-discard-marks-gates/`.

Return a definite PASS or findings, exact inspected snapshot and scope/limits. For every finding
give user impact, reachability, applicable ruling, base-versus-new provenance, setup/action/expected
result/disproving observation, and exact step-by-step fix instructions. Distinguish app defects
from missing check evidence and unrelated pre-existing defects (D489). Give explicit negatives:
"I checked X and found nothing." Failed, incomplete or empty inspection is never approval.
Do not turn a demo-only issue or unrelated whole-app scenario into a D488 blocker. The full gates
already ran; do not rerun them for reassurance. One final-code round now, at most one fix verification.
