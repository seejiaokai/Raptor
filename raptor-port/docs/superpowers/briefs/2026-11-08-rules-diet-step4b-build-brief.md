# The rules diet, step 4 part 2 — the build brief: the five always-loaded files as checklists (8 Nov 26)

For the helper (Opus) that drafts part 2 in chat 2's worktree, branch `claude/rules-diet-step-4-7b92cb` (level with `main`
at 7744e66db, part 1 merged). Two blind readers will read what you write afterwards (D1739), so write for them too:
every rule kept, meaning unchanged.

## What and why

The rules diet (his D1732, D1735; plan `raptor-port/docs/superpowers/plans/2026-11-07-rules-diet-plan.md` §3 and its
step-4 section) turns the five rule files every chat loads into one-page checklists:
`.claude/rules/shipping.md`, `doc-structure.md`, `record-decisions.md`, `plain-language.md`, `bug-check.md`. Part 1
already made `.claude/rules/decisions/how-we-work.md` a page — read it once, whole, before you start: it states the
general rulings, so a checklist need not repeat a rule the page states, but must not contradict it.

Plan §3: "Each keeps every rule it carries, one statement each with its numbers — including the rules a guard enforces,
in their own short words (the push guard lets a push through when it cannot reach GitHub, and Codex has no hooks); the
stories and worked examples move whole … by `backlog-archive.mjs --move` (D138), a one-line pointer left." Its sizes
(shipping ~2,000 tokens, doc-structure ~1,300, record-decisions ~1,100, plain-language ~1,350, bug-check ~850) are
estimates, never targets (D141): the test is whether each piece is needed where it sits.

## The method — in this order

1. **Measure first:** `node raptor-port/scripts/docsize.mjs --reads` (save the table).
2. **Move each file's old text whole.** Create `raptor-port/docs/archive/rule-files-2026-11-08.md` with a short head in
   the shape of `raptor-port/docs/archive/rule-files-2026-11-02.md` (moved whole by `--move`, D138, D1735; searched,
   never loaded; paths from the repo root; the checklist in each file is the rule, this the old wording with its stories
   and worked examples). Then, file by file, move everything below the file's `# ` title line whole into it:
   `node raptor-port/scripts/backlog-archive.mjs --move <file> --from "<exact first line below the title>" --to-line
   "<exact last line>" --dest raptor-port/docs/archive/rule-files-2026-11-08.md --pointer "<one line naming the archive
   file>"` (`--dry-run` first; read the script's head, lines 642–669, for its rules). Give each file a `## ` heading in
   the archive before its block if the move does not (add it by hand before the move, at the end of the archive). Why
   the archive and not `raptor-port/docs/guide-full.md`: that file's `##` headings must mirror `raptor-port/CLAUDE.md`'s
   sections and every `###` must be named by one short form there — the files' own headings would fail its check.
   Add a row for the new file to `raptor-port/docs/archive/README.md`, in the shape of the 2 Nov row.
3. **Write each checklist** between the title and the pointer. Rules:
   - every rule the old text carried is stated — one bullet or numbered step each, short, its D-numbers after it; every
     D-number the old file carried appears in the new one; a story, a dated anecdote, his words beyond what the rule needs
     and a worked example stay in the archive only;
   - nothing reworded into a different meaning: keep each "only", "never", "unless", "until", "both", each exception and
     each condition; where a rule names a command, a path or a number he or a check relies on (the lock folder, the
     `gh run list` command, the 2-hour stale lock, `Rulings:` and `Walk:` lines' shapes, the eight questions, the tiers
     NONE / LOOK / WALK / FULL, the trigger list), keep it exact;
   - keep these headings, which other files point at: shipping `## The checks`, `## Pull requests`; doc-structure
     `## What a chat reads, and when`, `## Where a new fact goes — one home each` (its table may stay as it is — it is a
     checklist already), `## When it leaves`, `## In his workflow`, `## The check that keeps it`; record-decisions
     `## The rule`, `## Two catches`, `## When a ruling overwrites another — fix what it leaves behind`, and a section for
     "read it before you ask him anything" with its check; plain-language a section named `## A check before you send`
     (`AGENTS.md` tells Codex to run it); bug-check `## The trigger`, `## When to call in Fable and Codex`,
     `## What is not a finding`;
   - the pointers each file already has (to `bug-check-order.md`, `bug-check-checklist.md`, `guide-full.md` sections,
     `doc-budget.md` §5, `gates-and-deploy.md`, the 2 Nov archive) stay;
   - the rules a guard or hook enforces are stated in their own short words, since Codex has no hooks (`AGENTS.md`);
   - ordinary sentences, the app's and the project's own names; capitals only for emphasis a rule needs.
4. **Lower each file's tripwire** in `raptor-port/scripts/docsize.mjs` (the `.claude/rules/…` rows near line 110–130) to
   about 10% above its new line count, with a short comment giving the reason, as part 1 did for `how-we-work.md`.
5. **Check, each command on its own line, its exit echoed, never through a pipe:**
   `node raptor-port/scripts/backlog-archive.mjs --rulings` (once the general rulings are a page, the five files join
   its checks: a line citing a ruling must cite every live ruling marked as changing it, and none may cite one archived
   as replaced — it prints what to fix) and `cd raptor-port && npm run docsize`. Both must pass. Then measure again
   (`--reads`).
6. **Write the account by requirement**, `raptor-port/docs/superpowers/briefs/2026-11-08-rules-diet-step4b-account.md`:
   for each file, a table — every requirement of the old text (a rule, a condition, an exception, a command, a number),
   its D-numbers, and where the checklist states it (heading and line), or "story — archived whole" with a word on why
   it states no rule. Then the before-and-after sizes. Mark anything you were unsure of as a question for the host.
7. **Commit** on the branch (a clear message ending with the line `Co-Authored-By: Claude Opus 5.5
   <noreply@anthropic.com>`). **Do not push**, do not open a pull request, do not touch `HANDOFF.md` — the host does
   those.

## Traps on this PC (each has cost a night before)

- Write any edit script to a file with the Write tool and run it with node; `node -e` in Git Bash mangles escapes, and a
  bash heredoc whose body holds an apostrophe fails. In a JS replace use `s.replace(a, () => b)` — a `$'` in prose
  doubles text otherwise. Python edits need `open(…, newline='')` or the whole file turns CRLF.
- From the worktree's root never `cd ..` before git; use full paths.
- `check | tail && commit` commits even when the check failed: run each check on its own line and test its own exit.
- The repo is public: copy nothing private into it.
- A file under `.claude/rules/` loads in every chat, yours included: what you write is what the next chat obeys.

## What to report back

The commit, the before-and-after `--reads` table, each file's old and new size, anything you were unsure of, and any
rule you could not state without changing its meaning (leave such a rule in its old words in the checklist and say so).
