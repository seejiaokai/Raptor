# Brief — two older small faults round 4's walk met, fixed (the night of 25 Nov 26, job 3)

You are a helper of chat 170, on an unattended night. The owner is asleep: never message him, never ask him anything,
never merge, never touch `main`. You BUILD and then, on the host's word, CHECK. Your replies are reports to the host.

## Where you work

- Only in `C:\Users\User\projects\Raptor-words`. Never read-write, switch or build in `C:\Users\User\projects\Raptor`.
  Start every shell command with `cd "C:/Users/User/projects/Raptor-words"`.
- Your branch: `claude/r4-walk-faults-170`, cut from `main` by you as your first step:
  `git fetch origin` then `git switch -c claude/r4-walk-faults-170 origin/main`, then `git branch --unset-upstream`
  (here a branch cut this way tracks `main`, and a plain push would land ON `main` — never push without the explicit
  refspec: `git push origin HEAD:refs/heads/claude/r4-walk-faults-170`, alone in its own command). The checkout was on
  `claude/night-1125-bell-pages-170`, clean; the host switches back to it after you stop.
- Do not edit `HANDOFF.md`, any rulings file or `OUTSTANDING.md` — the host keeps the records. You write: the fixes
  and their tests, your evidence sheet, walk scripts and pictures, `raptor-port/docs/file-map.md` for new files.
- Scratch outside the checkout: `D:/rw4/night3/` — builds, raw captures, logs, the readers' raw reports.

## The two faults (both older than round 4, both reproduced on `main`; neither is wrong on a published record or OIL)

Read `OUTSTANDING.md`, item `[UI-SLEEK-PASS]`, the paragraph "Round 4's walk, left for a later round", points (1) and
(4) — its pictures, steps and reports are named there — and the evidence sheet
`raptor-port/docs/handpass/2026-11-24-words-r4-build.md` §12.

1. **A long word runs past the passing note's border on a phone.** A value of 60 letters with no space typed into a
   time box makes the note that names what was typed run about 10px past its own border (Chromium and WebKit). The
   fix: the note's box breaks a long word. Proved by a real-browser test of the box at a phone's width. Nothing new is
   drawn and no word changes — if your fix would change how any ordinary note looks, stop and report instead.
2. **The Scheduler Board's Ground Programme row is one change behind.** With the Board open, an accepted input's start
   changed in its in-place box (0900) saves — the input, the week and the Personal Inputs row read 09:00 — but the
   Board's own Ground Programme row for it still shows 08:00, and after a second change shows the first; closing the
   Board or a reload clears it; leaving the stale box without typing writes nothing back. Steps:
   `raptor-port/scripts/handpass/wr4-d-d4b.mjs`; report `raptor-port/docs/handpass/parts/wr4/d-report.md`. Find the
   cause first (`systematic-debugging`: reproduce, find where the row reads its value and why it is not redrawn — do
   not patch the symptom with an extra redraw until you know which redraw is missing and whether other rows of the
   Board share it). If the cause is wider than this row (other in-place boxes lag the same way), fix the cause and say
   which rows it covered; if fixing it would change behaviour anyone has ruled on, stop at the report.

## Rules that bind you

- Read before any change: `raptor-port/CLAUDE.md` (the project guide), `.claude/rules/raptor-executor.md`,
  `.claude/rules/bug-check.md`, and the bug-check order through its checklist
  (`raptor-port/docs/bug-check-checklist.md` → the sections of `raptor-port/docs/bug-check-order.md` it names — open
  them, never from memory). The area's rulings: `.claude/rules/decisions/scheduler.md` (the Board, the in-place boxes,
  the notes) and `.claude/rules/decisions/inputs.md` — open them with the Read tool before planning; a ruling's detail
  is in its full row (`grep -h '^| D… |' .claude/decisions-full/*.md`, the shell's grep).
- **Red first:** each fix has a test that fails before it and passes after; run it and see it fail before you fix.
- `src/engine/` bodies are verbatim ports — you should not need to touch them; if you think you do, stop and report.
- Not a finding: a problem that lives only in data already stored (the store is demo data); a scheduler who is not an
  admin. Never weaken a test to pass. Never delete data or history.
- **This week's rule on words:** you write no new sentence a person reads. If a fix seems to need one, stop and report.
- The checks lock (`node raptor-port/scripts/gatelock.mjs status|take "<branch> — <what>"|release`): take it before
  anything that builds or any browser-test run of more than one file, wait while another chat holds it (chat 174 runs
  walks tonight and holds it for long stretches — a waiting take can lose the gap between its walks: take it in a
  loop that tries every few seconds, with a ceiling of 40 minutes, then report what you could not run); release it the
  moment your run ends, pass or fail. One unit test file, a typecheck (`npx tsc -b`), or a walk script on a build
  already frozen needs none.
- GitHub's run of the pull request is the full check (about 6 minutes); on this PC run only the tests of what you
  changed, the two tests that scan source text if you add or edit a source file (`raptor-port/docs/gates-and-deploy.md`
  names them), `npx tsc -b` and `npm run docsize`.
- Windows traps: a script with an apostrophe is written to a file and run, never a heredoc; in a JS edit script use
  `s.replace(a, () => b)`; no `jq` (use `gh -q`); `MSYS_NO_PATHCONV=1` before `git show ref:path`; a refused push takes
  its commit with it — commit and push in separate commands.
- If you start anything in the background (a waiting loop, a server), stop it before each reply and say you did.

## Part A — build, then STOP and report (the host opens the pull request)

1. Answer the order's eight questions (§5) against the actual change and state the tier (NONE / LOOK / WALK / FULL)
   with the reason for each answer; do the roll-call (§2): every place the app draws the note's box, and every place
   the Board draws a ground row or an in-place time box, each with "has it / must not, because… / MISSING".
2. Reproduce each fault, find the cause, write the failing test, fix, see it pass. Run the touched tests, the two
   source-scanning tests, `npx tsc -b`.
3. Start the evidence sheet `raptor-port/docs/handpass/2026-11-25-r4-walk-faults.md` (the order's §9 shape): the tier
   and its answers, the roll-call, each fault's cause in two sentences, the tests.
4. Commit (message ending `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`), read `git show --stat`, push by
   the explicit refspec. Do NOT open a pull request.
5. Reply with: the tier and why; each fault's cause and fix in plain words; every file you changed (the host compares
   them with the other open branches before the pull request opens); the tests and their counts; the size of walk you
   propose (the order's §7.0 and `raptor-port/docs/walk-ledger.md`); anything you stopped on.

## Part B — on the host's word: the check, in the order's order

- **Scenarios** are designed by readers other than you: Astra (`codex exec -m gpt-6-astra` — the way round 4 called
  it is in `raptor-port/docs/superpowers/briefs/2026-11-24-words-r4-read-brief.md` and the sheet of that job) and a
  fresh, blind Fable helper, each blind to the other, asked what is missing; you combine the two lists in the sheet.
  If Astra's service refuses, a fresh blind Opus takes its seat and the sheet says the walk went without Astra's
  design.
- **The walk**: on a frozen build of your branch (build under the lock, to `D:/rw4/night3/build-fix`; `main`'s is
  `D:/rw4/build-new3` for before-and-after), with round 4's tooling (`raptor-port/scripts/handpass/wr4-lib.mjs`), a
  desktop 1440×900 and his iPhone's size 402×874 with touch, WebKit too for the note's box; one fresh Opus walker
  under Low; every control that opens or closes pressed, every other place that should show the result looked at
  (the week, the Personal Inputs row, the Inputs page, the bell), pictures of each; plus the plain-user round of the
  Board's ground rows. You open every picture that decides something and reproduce every finding before it counts.
- **The reads** of the finished code, each blind, the same brief, after the walk: Astra and a fresh Opus that did not
  write it; every claim written as a failing test before it is believed. Each reader's raw report stays in
  `D:/rw4/night3/` until both have reported, then both are saved whole beside the brief.
- Fix, re-walk what the fixes touched, break tests (`raptor-port/scripts/handpass/breaks.mjs`, as round 4's
  `breaks/wr4-words.json`), finish the evidence sheet with its `Walk:` line, the walk ledger's row
  (`raptor-port/docs/walk-ledger.md`), `npm run docsize`, commit, push — never while the branch's checks are running
  (`gh run list --branch claude/r4-walk-faults-170 --limit 6 --json status,workflowName,headSha`; a push starts two
  runs — read them all).
- Reply with the closing report: what each fix does in the app, the `Walk:` line, the readers' claims and what became
  of each, the gate counts you saw, what was not walked and why, any read that was owed and not done, and the last
  commit. Save the same text to `D:/rw4/night3/notes-for-the-host.md`.
