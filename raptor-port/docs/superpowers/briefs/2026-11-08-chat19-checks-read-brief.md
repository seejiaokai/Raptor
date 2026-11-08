# The checks job (pull request 698) — the brief for its two blind reads (8 Nov 26, chat 27)

Sent word for word to Astra (`codex exec -m gpt-6-astra`, reasoning high, read-only) and to a fresh, blind Opus reader,
each blind to the other (D790, D1770). A hook change is read as a working-guide change (D1761); `shipping.md` §The
checks changed too. Their reports: `2026-11-08-chat19-checks-read-astra.md`, `…-read-opus.md`.

---

You are a blind code reader for the Raptor repo (a squadron scheduling web app). Read only; change no file; run any
read-only command you like (tests included). Nobody else's report on this change is given to you — do not look for one.

THE CHANGE: branch `claude/chat19-checks` (pull request 698), the working tree you are in. No screen of the app changes.
Read it with `git diff origin/main...HEAD` (and `git diff origin/main...HEAD --stat`), then the live files whole:
- `.claude/hooks/script-guard.mjs` and `.claude/hooks/script-guard.test.mjs` (run: `node --test .claude/hooks/script-guard.test.mjs`);
  its wiring in `.claude/settings.json`; the shell reader it borrows, `parse` in `.claude/hooks/push-guard.mjs`.
- `raptor-port/scripts/ci/checks-passed.mjs` and its test (`cd raptor-port && node --test scripts/ci/checks-passed.test.mjs`);
  `.github/workflows/deploy.yml` (the new "what changed" first job, every gate job's `needs`, the last "checks passed" job,
  the pull_request trigger without `paths-ignore`).
- `raptor-port/scripts/docsize.mjs` (the new rule that the two design-checker settings files stay byte-for-byte equal);
  `.impeccable/config.json` and `raptor-port/.impeccable/config.json`.
- `raptor-port/doctor.config.json` (React Doctor's three skipped folders).
- `raptor-port/src/ui/boardnav.test.tsx` (the held clock between a release and a click).
- `raptor-port/scripts/rulecheck.mjs` (one ruling left its baseline).
- The words: `.claude/rules/shipping.md` §The checks, `raptor-port/docs/gates-and-deploy.md`, `raptor-port/docs/file-map.md`.
The backlog items it closes, in `OUTSTANDING.md`: `[SHELL-SCRIPT-GUARD]`, `[CI-SMOKE-TIMEOUT]`, `[TESTS-REQUIRED-ON-MAIN]`,
`[BOARDNAV-SCRUB-CLICK-TIMER]`, `[DESIGN-CHECK-GOLD-DOT]` (grep `### [NAME]`). The rulings that bound it: the general
page `.claude/rules/decisions/how-we-work.md` (its full rows: `.claude/decisions-full/how-we-work.md`), the scheduler's
`.claude/rules/decisions/scheduler.md` (D1890; full rows `.claude/decisions-full/scheduler.md`) and `shipping.md` itself —
open a full row with `grep -h '^| D1890 |' .claude/decisions-full/*.md`.

THE INTENT, as its builders state it:
1. The script guard (a PreToolUse hook on the agent's Bash tool) refuses three shell slips: a script typed into the
   command line that writes a file and holds a backslash (or, unquoted, a `$` or backtick); `sed -i` / `perl -i` on a
   git-tracked file; a command that reads input none is given (`cat > f`, `python -`, a bare `node`, Python fed
   `/dev/null`). Its header lists what was measured (M1–M5). It must never refuse everyday work — a commit or pull-request
   message from a here-document is always let through — and anything it cannot read is let through.
2. "Checks passed" is the one job to require on `main`: on a pull request every gate job either runs or is skipped only
   because the pull request changes notes only (the same list as the push trigger's `paths-ignore`), and "checks passed"
   fails if any needed job failed, was cancelled, or was skipped when it should have run.
3. The design checker's settings now sit in both the top folder and `raptor-port/`, kept equal by the document check.
4. React Doctor skips the mock-up pages, the pictures and the read-only original (D1716).
5. The board test's clock stands still between the release and the click, so a slow machine cannot fail it.

ASK — what is MISSING or WRONG. A claim is a finding only with a concrete failure (the exact command, file list or
condition), its cause, and its exact fix (D489). For each area:
- Script guard: an everyday command it would wrongly refuse (git, gh, npm, node/python running a file, a commit message
  or pull-request body from a here-document, `cat file`, a pipe into `cat`, Windows paths with backslashes in a plain
  command); a logged slip it would let through; a command shape that makes it crash or hang, or refuse every command;
  the settings' wiring turning a refusal into "allowed" or an error into a refusal; a measured claim in its header that
  its code contradicts. Note: in one chat the Bash tool's input was an open pipe that never ends; in another, on the same
  PC, it was `/dev/null` (a bare `cat > f` ended at once, the file empty; Python still saw a keyboard) — judge refusal 3
  against both.
- Checks passed: a pull request that could show "checks passed" green while a gate failed, was cancelled or was skipped
  wrongly; a notes-only pull request that would run every gate or none it should; the notes-only list differing from
  `shipping.md`'s "only notes" list or the push trigger's list; renames, deletions, an empty diff, a huge diff, a fork, a
  re-run; the "what changed" job failing — does it fail closed (everything runs, or "checks passed" red)?; anything else
  in the workflow changed by accident (push to `main`, the deploy, caches, concurrency, the public-repo routing).
- The two settings copies and the docsize rule: a path the glob no longer matches from either folder; the check missing a
  difference or failing on equal files (line endings).
- React Doctor's skips: any app code they hide.
- The board test: does holding only `setTimeout` still test what it claims, or can it pass with the fault back in?
- The words (a working-guide change — D1761's narrow brief): does each changed line say what its ruling meant, contradict a
  guide or a ruling, drop a safeguard, or add bulk?

NOT A FINDING (D56): a problem that lives only in data already stored, when the code is already correct going forward —
the whole store is demo data, cleared before the database step. Style or tidiness alone is not a finding; put it in a
short tidiness note at the end (three questions of the changed lines: anything to delete, anything doubled, anything
hard to follow — filed, not fixed; never the rules engine). A scheduler is always an admin (D785).

RETURN: findings first, most serious first, each with severity, the failure, the cause, the fix; then what you checked
and found sound, one line each; then the tidiness note.
