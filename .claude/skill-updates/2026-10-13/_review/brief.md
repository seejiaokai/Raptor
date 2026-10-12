# Independent read: draft changes to the working guides, 13 Oct 26

You are an independent reviewer. Another session (Claude Opus 5.5) wrote these drafts; you have seen none of its
reasoning, and your job is to find what is wrong with them BEFORE the owner approves them (owner rulings D70 and
D810: a change to a working guide is read before he approves it, never by its writer; for this review the reader is
one fresh Opus reader). **Read-only, with one exception: you may create exactly ONE file — your report, at
`.claude/skill-updates/2026-10-13/_review/opus-reader.md`. Edit, create or delete nothing else. Run no git command
that writes.** Read the LIVE files named below; do not trust a quotation of them in this brief.

## What you are reviewing

- This repo keeps agent "skills" (method guides the coding agent loads when a kind of work starts) under
  `.claude/skills/`, and its own method documents under `raptor-port/docs/`. Sessions log lessons as numbered notes
  in `.claude/skill-observations/log.md` (each headed `### Observation N:`). A review of all 272 OPEN notes (120 to
  541) produced DRAFT changes, staged under `.claude/skill-updates/2026-10-13/` at each live file's relative path.
  Nothing live has changed.
- **The whole change set, live → draft, is one file:** `.claude/skill-updates/2026-10-13/_review/diff.patch`
  (26 files, about 720 lines added; two files are NEW: `raptor-port/docs/walk-scripts.md` and
  `.claude/skills/brainstorming/mockups-on-the-real-app.md`).
- **Which note each change carries, and every closure:** `_review/dispositions.md` — one row per note, a code
  (APPLY / REFLECTED / FILED / MEMORY / ASK / OPEN) and where it lands. Proposed notes for this machine's memory
  (outside the repo): `_memory/additions.md`. Two proposed backlog items: `_docs/OUTSTANDING-items.md`.
- Where lessons go and why: `.claude/skills/TASK-OBSERVER-VENDORED.md` §Reviews in this repo.
- **The rules and rulings you may need:** `.claude/rules/*.md` (the always-loaded rules) and
  `.claude/rules/decisions/how-we-work.md` (one line a ruling). A ruling's full text is one row in
  `.claude/decisions-full/*.md` — open it with the SHELL (`grep -h '^| D608 |' .claude/decisions-full/*.md`); the Grep
  tool hides long rows. The ones these drafts lean on: D16, D56, D67, D70, D78, D138, D141, D151, D201, D228, D302,
  D353, D390, D588, D590, D607, D608, D761, D787, D790, D810.
- **Two guide lines that are not from notes:** the backlog items `[WALK-FINGER-NOT-LOCATOR]` and
  `[METHOD-LIT-COLOUR]` in `OUTSTANDING.md` each PROPOSED wording for `raptor-port/docs/bug-check-order.md` and waited
  for a read. The draft makes them (§7.2 and §6; §7.1 and anti-pattern 21). Check the draft against each item's own
  proposed wording.

## Check, in this order

1. **Fidelity.** Does each change say what its note meant? Open the note by number in the live log and compare. Flag
   distortion, overstatement, a lost condition or exception, or a note mapped to a change that does not carry it.
   **Read every row that cites `BCO §6`, `DEC`, `HO`, `shipping.md` or `MOCK` against its note, and at least sixty
   other APPLY rows spread across every target file.** Say in your report which rows you read.
2. **Contradictions** — within a guide, across guides, and with the repo's rules and rulings. Look hard at:
   - `bug-check-order.md` §7.0's new bullet ("a designed scenario is left unwalked only for a reason about the
     scenario") against the wording D607 / D608 approved around it, and against `raptor-port/docs/walk-ledger.md`;
   - §4's added parenthesis on walkers sharing ONE server against D16's full row ("its own port") — does it narrow
     the owner's ruling, or only the agent's recipe inside it?
   - §4 "Before a brief leaves" and the two reworded hand-back items against the rest of §4 and against D353 / D790;
   - §5 "A fix is new code" against the about-three-round cap and D790;
   - `.claude/rules/shipping.md`: its one corrected sentence against D86, D228 and `gates-and-deploy.md`;
   - `DECISIONS.md` steps 1 and 2 against what `raptor-port/scripts/backlog-archive.mjs` and
     `raptor-port/scripts/docsize.mjs` actually do (which cell a REPLACED / SPENT mark is read from; whether an
     ANSWERED mark is accepted; what the homes check does with a backlog item named in a home cell);
   - `HANDOFF.md`'s head and `session-handoff` against each other and against `.claude/rules/doc-structure.md`;
   - `test-driven-development`: "red is an observation" (break the line once green) against the skill's own Iron
     Law ("write code before the test? delete it");
   - `dispatching-parallel-agents`: "stage by explicit path" against "never commit a tree an agent is still writing".
3. **Lost safeguards.** Did any edit weaken or delete an existing rule, check or enforcement step? (`diff.patch`
   shows every removed line; each should reappear, extended.)
4. **Wrong closures.** For the 18 REFLECTED rows: is the lesson really stated at the cited place, clearly enough
   that a future agent would not repeat the mistake? For the 6 ASK rows (272, 329, 339, 388, 418, 534): is closing
   without a change right, or does the note carry a lesson that should land? For the FILED rows: is a backlog item
   enough, or does a guide line also need to exist today?
5. **Bulk and doubling.** Anything that repeats what its target already says, would not change an agent's behaviour,
   or states one lesson in two drafts where one would do (the same lesson deliberately appears for two different
   readers in places — a test author in `test-driven-development`, a walk-script author in `walk-scripts.md`: say
   where that doubling is NOT earned).
6. **The two new guides.** Is each a sound home, or should its content sit elsewhere? Is any line of
   `walk-scripts.md` wrong, unclear, or likely to mislead a walker (a Sonnet helper) handed it with a brief? Does it
   contradict `bug-check-order.md`, `walk-ledger.md` or `raptor-port/docs/handpass/README.md`? The same questions of
   `mockups-on-the-real-app.md` against `brainstorming/SKILL.md`'s own paragraph on mocks.
7. **Commands, names and paths.** Anything in the drafts that is wrong or does not exist: `git ls-files
   --error-unmatch`, `git log <merged>..origin/<branch>`, `gh pr view <n> --json state`, `git merge --ff-only
   origin/main`, `npx tsc --noEmit -p tsconfig.app.json`, `process.env.HP_SHOTS ||=`, `import.meta.url`,
   `document.activeElement`, `elementFromPoint`, `matchMedia('(pointer: coarse)')`, `touch-action`, `DOCSGUARD_ALLOW`
   and `Docs-guard-allow`, `gatelock.mjs release`, `scripts/handpass/breaks.mjs` and `breaks-browser.mjs` (do they
   take a list, as the draft says?), every section number and file path a draft cites.
8. **Leakage.** Project-specific detail in the generic upstream skills (`systematic-debugging`,
   `test-driven-development`, `verification-before-completion`, `writing-plans`, `receiving-code-review`,
   `dispatching-parallel-agents`, `executing-plans`, `find-skills`, `task-observer`) that would mislead outside
   this repo. Pointers to this repo's own documents are intentional; flag them only if misleading.
9. **The memory notes and the two backlog items.** Does each say what its notes meant? Is anything in a memory note
   really a rule of the app that belongs in the repo instead?

## Not findings — do not report

- Style or word choice that does not change meaning.
- Upstream skill text the drafts did not touch.
- Anything that lives only in data already stored in the app (owner ruling D56).
- That lessons go into skills and the two method documents rather than `raptor-port/CLAUDE.md` or `.claude/rules/`
  (settled by the earlier reviews). The two NEW guides, and the one corrected sentence of `shipping.md`, ARE open to
  challenge.

## Output

Write your full report to `.claude/skill-updates/2026-10-13/_review/opus-reader.md`: a numbered list, most severe
first. For each finding: the draft file and its line or heading, what is wrong, why it matters, and the EXACT fix —
the replacement text, word for word (the owner's standing rule: a reviewer gives precise fix instructions, not a
direction). Then the explicit negatives — what you checked and found nothing in, including the rows you read for
check 1. Then one word: APPROVE or REVISE. Keep the report under 2,500 words. Your final message back is a SHORT
summary only: the verdict, the count of findings by severity, and the report's path. Send it once.
