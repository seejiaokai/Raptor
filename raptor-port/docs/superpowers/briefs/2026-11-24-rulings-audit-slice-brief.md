# The rulings audit — a slice helper's brief (chat 173, 24 Nov 26; his D2567, D2610)

You are a fresh Opus helper, blind to the other slices. **Read-only** except your one findings file; do not commit.
Repo: `C:\Users\User\projects\Raptor\.claude\worktrees\chat-156-handoff-a6d8d7`. Other helpers may be editing rule files
and guides in this working copy at the same time (the checking fix) — ignore those changes; read the rulings files as
they are, and never edit them.

## Your job

The plan is `raptor-port/docs/superpowers/plans/2026-11-24-rulings-audit-plan.md`. Read its §1, §3 (what a helper does
with each item — follow it exactly), §4 (the record), §5 (what is not a finding) and §10 (the red team's corrections).
Your slice number is in the message that started you; its row in §2's table says what you read and roughly how much.

Your items:
- from `raptor-port/docs/superpowers/briefs/2026-11-24-rulings-audit-inventory.md` (step A): the lines whose Slice
  column names your slice — comments (list 1, C), words (2a W, 2b GR), designs (3a GD, 3b GN, 3c GS). The Slice column
  is a keyword guess: drop what is plainly not yours (say so in your coverage ledger), add what is plainly yours that it
  missed. List 2a is noisy (headers, one-word labels): a string that states or enforces no rule is passed in one line.
- from `raptor-port/docs/superpowers/briefs/2026-11-24-rulings-audit-pairs.md` (step B): every question that falls to
  your area — set each surface's rule side by side, as lesson 32 asks.

## How to read

- The rulings: your area's page under `.claude/rules/decisions/`, then each governing ruling's FULL row, by subject not
  phrasing: `grep -h '^| D1234 ' .claude/decisions-full/*.md` and keyword greps — with the SHELL (the Grep tool hides
  long rows). Also `DECISIONS-ARCHIVE.md` and open branches' rulings (`git grep <word> claude/allavail-sans-postout-141
  -- .claude/decisions-full`) before calling anything unruled.
- Newer rulings not yet in these files: chat 170 (pull request 841) holds the owner's ruling that the bell's
  changed-input line names EVERY change, never "and N more change(s)" — replacing D2521's count — and that an undone
  change gets a notification of its own (numbers D2600–D2609, being recorded). Treat these as rulings.
- The app: this working copy carries the SANS words job before its last round. For anything in that job (the SANS
  reminder, `leavewar/sansunfiled.ts`, the SANS bell lines), read its branch tip:
  `git show claude/allavail-sans-postout-141:<path>`; D2564's fix is commit `1d2ed3415` there. Everything else: this
  working copy.
- Write scripts with the Write tool and run the file; the shell guard refuses inline scripts holding backslashes.

## Not findings (put none in your file)

- A problem only in data already stored (the demo data), when the code is right going forward (D56).
- A scheduler who is not an admin: a scheduler is always an admin (D785).
- `src/engine` bodies are verbatim ports: a difference there IS a finding with its harm (the port rule limits edits,
  not detection); only the ported comment text is not a reading.
- Tidiness, naming, code style: not this audit.

## Your output

`raptor-port/docs/superpowers/briefs/2026-11-24-rulings-audit-slice<N>.md`, in §4's form: the findings table (MISMATCH /
OPEN READING / NO RULING — each with the ruling's number and the exact words quoted, the app's file and line or the
drawing's path, when it happens in real life, a named worked example, the harm, your recommendation), the side-by-side
tables for the pair questions, and the coverage ledger (every item: its id and class, MATCH in one line). A clash with
a clear ruling is a MISMATCH — a fault, not a question for him. If you pass about 60% of your context, stop, save, and
name what is left at the end of the file. Reply with the path, your counts by class, and each MISMATCH and OPEN READING
in one line.
