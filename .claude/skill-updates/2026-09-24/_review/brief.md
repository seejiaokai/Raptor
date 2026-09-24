# Independent read: draft changes to the working guides (skills) and two project docs, 24 Sep 26

You are an independent reviewer. A different model (Claude Opus 5.5) wrote these drafts; your job is to find
what is wrong with them BEFORE the owner approves them (owner ruling D70: both Fable and Astra read skill
changes, one round each, never the model that wrote them). **Read-only: do not edit, create or delete any
file.** Read the LIVE files named below — do not trust a quotation of them in this brief.

## What you are reviewing

- This repo vendors agent "skills" (method guides the coding agent loads when a kind of work starts) under
  `.claude/skills/`. A review of the 44 OPEN observations in `.claude/skill-observations/log.md` (each headed
  `### Observation N:`) produced DRAFT changes, staged under `.claude/skill-updates/2026-09-24/` at the live
  files' relative paths: `_docs/` = the repo's project docs (`raptor-port/docs/bug-check-order.md`,
  `raptor-port/docs/gates-and-deploy.md`), `_notes/` = `.claude/skills/*.md` provenance notes. Nothing live has
  changed.
- **The whole change set, live → draft, is one file:** `.claude/skill-updates/2026-09-24/_review/diff.patch`
  (12 files, ~170 lines added).
- **Which observation each change implements, and every closure:** `_review/dispositions.md` (a table: # →
  ACTIONED / OPEN, the group, where it lands). Proposed additions to machine-local memory notes (outside the
  repo): `_memory/additions.md`. A proposed backlog item: `_docs/OUTSTANDING-item.md`.
- Where lessons go and why: `.claude/skills/TASK-OBSERVER-VENDORED.md` §Reviews in this repo.
- **The rulings you may need** (Codex: these do not load for you by themselves — open them):
  `.claude/rules/decisions/how-we-work.md` (D16, D17, D67, D69, D70, D84, D140, D151 are the ones these drafts
  touch), `.claude/rules/*.md` (the always-loaded rules), and — only to check the worked examples —
  `.claude/rules/decisions/tracker.md` and `.claude/rules/decisions/oil.md`.
- **One fix that is not an observation:** rulings D16 and D17 name `raptor-port/docs/bug-check-order.md` (§4 and
  §7.2) as their home, but no commit ever wrote them there. The draft writes them in (§4, the fan-out paragraph;
  §7.2, the scripted driver). **Check those two paragraphs against the D16 and D17 rows for meaning (D138: a
  summary must never change what the original meant).** The §4 paragraph also carries a refinement from
  observation #213 — walkers may share ONE preview when each starts a fresh browser context, so D16's recipe's
  "own port" is not needed. Judge whether that narrows the owner's ruling or only the agent's recipe inside it.

## Check, in this order

1. **Fidelity.** Does each change say what its observation meant? Open the observation by number in the live log
   and compare. Flag distortion, overstatement, lost nuance, or an observation mapped to a change that does not
   carry it.
2. **Contradictions** — within a skill, across skills, and with the repo's rules and rulings. Look hard at:
   - `systematic-debugging`: the new "product bug" questions vs the upstream "implement appropriate handling
     (retry, timeout …)" and the existing "flaky is a hypothesis" block;
   - `condition-based-waiting.md`: "Before You Pace a Test" vs its own "Use when: tests are flaky";
   - `gates-and-deploy.md`: the new intermittent-stop rule vs D84 (one re-run of a known Leave War timeout
     family, no investigation) and vs D151;
   - `session-handoff`: the new lines vs D69, D29 and the rest of the skill (approved today, D145);
   - `bug-check-order.md` §4 vs D16, §7.2 vs D17, §7.7 vs the e2e helpers it names (`raptor-port/e2e/app.ts`).
3. **Lost safeguards.** Did any edit weaken or delete an existing rule, check or enforcement step?
4. **Wrong closures.** For #198, #204 and #230 (closed as already reflected) and #120/#122 (kept open): is the
   lesson really stated at the cited place, clearly enough that a future agent would not repeat the mistake?
5. **Bloat.** Anything that repeats what the target already says, or would not change an agent's behaviour.
6. **Commands and names.** Any command, flag, API or file path in the drafts that is wrong
   (`MSYS_NO_PATHCONV`, `git config --show-origin --get-all`, `GIT_TERMINAL_PROMPT`,
   `Emulation.setCPUThrottlingRate`, `Input.dispatchTouchEvent`, `getClientRects`, `MutationObserver` timing,
   the claudex runner's `--effort` choices, `lwRole` / `raptorRole`, `raptor-port/scripts/handpass/lib.mjs`,
   `trk-pinch.mjs`).
7. **Leakage.** Project-specific detail in the generic upstream skills (`systematic-debugging`,
   `test-driven-development`, `verification-before-completion`, `writing-plans`, `task-observer`) that would
   mislead outside this repo. Pointers to this repo's own docs are intentional; flag them only if misleading.

## Not findings — do not report

- Style or word choice that does not change meaning.
- Upstream skill text the drafts did not touch.
- Anything that lives only in data already stored in the app (owner ruling D56).
- The choice to put lessons in skills and in the bug-check order rather than `raptor-port/CLAUDE.md` or
  `.claude/rules/`.

## Output

A numbered list, most severe first. For each: the draft file and line, what is wrong, why it matters, and the
EXACT fix (the owner's standing rule: reviewers give precise fix instructions, not directions). Then the
explicit negatives — what you checked and found nothing in. Then a one-word verdict: APPROVE or REVISE. Keep it
under 1,200 words.
