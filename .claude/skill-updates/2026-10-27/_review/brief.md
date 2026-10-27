# Independent read: draft changes to the working guides, 27 Oct 26

You are an independent reviewer. Another session (Claude Opus 5.5) wrote these drafts; you have seen none of its
reasoning, and your job is to find what is wrong with them BEFORE the owner approves them (owner rulings D70 and D1414: a
change to a working guide is read before he approves it, never by its writer; for this review the reader is one fresh,
blind Opus reader). **Read-only, with one exception: you may create exactly ONE file — your report, at
`.claude/skill-updates/2026-10-27/_review/opus-reader.md`. Edit, create or delete nothing else. Run no git command that
writes, no install, no `--rehearse`.** Read the LIVE files named below; do not trust a quotation of them in this brief.

## What you are reviewing

- This repo keeps agent "skills" (method guides the coding agent loads when a kind of work starts) under
  `.claude/skills/`, and its own method documents under `raptor-port/docs/`. Sessions log lessons as numbered notes in
  `.claude/skill-observations/log.md` (each headed `### Observation N:`). A review of all 152 OPEN notes (120, 122, 542 to
  719, with gaps) produced DRAFT changes, staged under `.claude/skill-updates/2026-10-27/` at each live file's relative
  path. Nothing live has changed.
- **The whole change set, live → draft, is one file:** `.claude/skill-updates/2026-10-27/_review/diff.patch` (19 files,
  about 480 lines added; 25 lines removed — each one reappears extended).
- **Which note each change carries, and every closure:** `_review/dispositions.md` — one row per note, a code (APPLY /
  REFLECTED / FILED / MEMORY / ASK / OPEN) and where it lands. Proposed notes for this PC's memory (outside the repo):
  `_memory/additions.md`. Proposed additions to three backlog items: `_docs/OUTSTANDING-items.md`. The install script:
  `_install/install.mjs` (with `_install/check-dispositions.mjs`).
- Where lessons go and why: `.claude/skills/TASK-OBSERVER-VENDORED.md` §Reviews in this repo.
- **The rules and rulings you may need:** `.claude/rules/*.md` (the always-loaded rules) and
  `.claude/rules/decisions/how-we-work.md` (one line a ruling). A ruling's full text is one row in
  `.claude/decisions-full/*.md` — open it with the SHELL (`grep -h '^| D1104 |' .claude/decisions-full/*.md`); the Grep
  tool hides long rows; replaced or spent ones are in `DECISIONS-ARCHIVE.md`. The ones these drafts lean on: D56, D70,
  D73, D138, D151, D790, D852, D855, D941, D975, D976, D1033, D1086, D1088, D1090, D1103, D1104, D1281, D1297, D1407, D1414.
  The overnight guide's backlog item `[OVERNIGHT-SESSION-PER-JOB]` (in `OUTSTANDING.md`) also bears on one draft.

## Check, in this order

1. **Fidelity.** Does each change say what its note meant? Open the note by number in the live log and compare. Flag
   distortion, overstatement, a lost condition, a date or number that the note does not support, or a note mapped to a
   change that does not carry it. **Read every row that cites OVN, SH, DP, DEC, TO, WR or GD against its note, and at
   least forty other APPLY rows spread across WS, BCO, MOCK, SD, TDD, VBC and BC.** Say which rows you read.
2. **Run the drafts, do not only read them** (the method note 583 asks for). (a) Take three real notes the drafts carry —
   your choice, from three different guides — and say whether an agent following ONLY the drafted line would have avoided
   that note's failure. (b) Construct one case that obeys every drafted line of `walk-scripts.md` §4 and still reports a
   false PASS or a false FAIL, if you can. (c) For the overnight guide, replay one night as the draft has it (Part 1
   message → his "go" → jobs → morning) and list every place the draft is ambiguous or contradicts itself.
3. **The writer's own doubts — read these first and hardest:**
   - `overnight/SKILL.md`: the new "Each job is handed to one fresh helper" bullet and the "Low or Medium?" bullet against
     D1103's and D1104's FULL rows and `[OVERNIGHT-SESSION-PER-JOB]`. D1103 says each job in a fresh SESSION, "if it works,
     the guide changed"; the night found a session cannot be started from his phone's turn, so the draft says a helper.
     Is that a faithful reading or an unapproved change of his ruling? Is the stop rule's new "unless what is left resets
     before it could be used" faithful to D1033?
   - Row 623 is ASK on the ground that D1088 overtook it — is it overtaken, or does a part survive?
   - `bug-check-order.md` §4's new table "what each part of a check holds still" against the rest of §4 and against
     `walk-scripts.md` §9 ("break where nobody is reading", "a runner holds the tree until it prints DONE").
   - `bug-check-order.md` §7.9's new "stand-in is believed only once calibrated" against §7.11 lesson 7 — duplicate or
     contradiction?
   - `design-practices.md` §0 step 2's added sentence and §9's head (lesson ranges) — both inside wording he approved
     (D855, D941). Does either narrow or contradict what he approved?
   - `design-practices.md` §1a's new test "0" — does anything elsewhere count the tests from 1 or cite "test 1" as the
     first step?
   - `session-handoff/SKILL.md`'s new line on the main checkout, and `gates-and-deploy.md`'s paragraph on it: is "tell him"
     the right action, given the hook that refuses writes to another worktree (this PC's memory note
     `C:\Users\User\.claude\projects\C--Users-User-projects-Raptor\memory\one-checkout-per-session.md`)?
   - `task-observer/SKILL.md`'s size trigger: does it contradict the skill's own "never gate their work on the review"?
   - Leakage into the generic upstream skills (`systematic-debugging`, `test-driven-development`,
     `verification-before-completion`, `task-observer`): project-specific detail that would mislead outside this repo.
4. **Contradictions** — within a guide, across guides, and with the repo's rules and rulings.
5. **Lost safeguards.** Did any edit weaken or delete an existing rule? (`diff.patch` shows the 25 removed lines.)
6. **Wrong closures.** For the 28 REFLECTED rows: is the lesson really stated at the cited place, clearly enough that a
   future agent would not repeat the mistake? Read at least fifteen, including 561, 562, 570, 594, 596, 608, 629, 669,
   681, 686, 689 and 718. For the 15 FILED rows: is a backlog line enough, or does a guide line also need to exist today
   (586, 590, 616, 630, 634 and 644 are one trap met six times)? For the two ASK rows (623, 703): is closing right?
7. **Bulk and doubling.** Anything that repeats what its target already says, would not change an agent's behaviour, or
   states one lesson in two drafts where one would do — say where a doubling is NOT earned.
8. **Commands, names and paths.** Check each exists or is right: `git grep -h -o -E … $(git for-each-ref
   --format='%(refname)' refs/remotes/origin) -- …` (and the observation form in `task-observer/SKILL.md`); `git ls-remote
   origin <branch>` "equals HEAD"; `grep -n "LW_OUT =\|HP_SHOTS ="`; a step filter `ONLY=` in the walk scripts
   (`raptor-port/scripts/handpass/`); `LW_WIDE_LETTERS`; `Input.synthesizeScrollGesture`; `pic(…, { around })`;
   `raptor-port/scripts/handpass/video-frames.mjs`; `src/engine/inputs-readers.test.ts`; `src/state/perms-scan.test.ts`;
   `RULING_BYTES`; `--move-rows --dry-run`; `raptor:leavewar/rec:`; `':(exclude)raptor-port/docs'`; every section number
   a draft cites.
9. **The install script.** Read `_install/install.mjs` and `check-dispositions.mjs` as code: can it overwrite a live file
   that changed after its draft was made; can a status edit cross an entry boundary; is the archive move safe against a
   concurrent append; does `--skip` leave the right rows OPEN; does the rehearsal restore only what it copied?
10. **The memory notes and the backlog additions.** Does each say what its notes meant? Is anything in a memory note
    really a rule of the repo that belongs in the repo instead?

## Not findings — do not report

- Style or word choice that does not change meaning.
- Upstream skill text the drafts did not touch.
- Anything that lives only in data already stored in the app (owner ruling D56).
- That lessons go into skills and the project's method documents rather than `raptor-port/CLAUDE.md` or `.claude/rules/`
  (settled by the earlier reviews).
- The ruling D1414 itself, the two archived rulings D1402/D1403, or the tripwire raises in `raptor-port/scripts/docsize.mjs`
  — already recorded, not drafts. (The one-line short form of D1414 in `.claude/rules/decisions/how-we-work.md` IS open to
  you: check it says what its full row says — D138.)

## Output

Write your full report to `.claude/skill-updates/2026-10-27/_review/opus-reader.md`: a numbered list, most severe first.
For each finding: the draft file and its heading, what is wrong, why it matters, and the EXACT fix — the replacement text,
word for word. Then the explicit negatives — what you checked and found nothing in, including the rows you read for checks
1 and 6. Then one word: APPROVE or REVISE. Keep the report under 3,000 words. Your final message back is a SHORT summary
only: the verdict, the count of findings by severity, and the report's path. Send it once.
