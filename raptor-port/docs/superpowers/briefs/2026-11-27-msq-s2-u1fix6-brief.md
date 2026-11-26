# S2 step U1's sixth round — the fifth read's findings (chat 205's brief, 27 Nov 26)

For ONE OPUS builder (his D2819: Opus until his weekly reset). The orchestrator reviews your diff, runs your tests and
commits; **you do not commit, stage, push, build or take the checks lock.** Work only in
`C:/Users/User/projects/Raptor/.claude/worktrees/fable-read-faults-4104f0` (branch `claude/msq-s2-users-685735`).

## Where things stand
U1 (Admin → Users across squadrons: another squadron's man shows a short row with one access line) has had five fix
rounds; the fifth (effc621d5, merged with the batch branch at a39a013cf) passed its build. Its read — Astra, two fresh
Opus readers, an Opus security reader, each blind — found **no way to see what must not be seen and no way for one
person alone to make a row write what the rule forbids** (the security reader: no hole at all). Five smaller findings
remain; every proof was re-run by the orchestrator and fails as its reader said. This round closes them and nothing
else. **No new words on screen** — the only note is the existing `changedWhileOpenWords`.

## Read first
- `.claude/rules/raptor-executor.md`; `.claude/rules/decisions/people-accounts.md` (with the Read tool).
- The rule as the readers had it: `raptor-port/docs/superpowers/briefs/2026-11-26-msq-s2-u1-read-brief-6.md`; the fifth
  round's brief and report (`…-u1fix5-brief.md`, `…-u1fix5-report.md`).
- The readers' reports and proofs (outside the repo):
  `C:/Users/User/AppData/Roaming/Claude/side-session-notes/local_eeb07289-ed8b-483b-8502-00962970c7d1/s2-chat205/fixread5/`
  — `opus1/report.md` (+ `zz-opus1-proof-1..3`), `opus2/report.md` (+ `zz-opus2-proof-1..3`), `astra/report.md` (its
  proofs `astra/zz-astra-proof-1`, `-2`), `security/report.md` (11 passing pins `zz-security-proof-1`, `-2` — keep them
  green). Line numbers there are of a39a013cf; find each place by name.

## The fixes
**A. A short row's pick is dropped without a word when the man's sign-in goes or changes and the page redraws** (found
by THREE readers — opus1 F1, opus2 F1, Astra 1; (b)). Today `rowChanged` asks only `pickOnMaster` for a short row; a
pick whose sign-in is no longer his is caught only at Save. One person can do it (Saber's own Undo of giving the
sign-in; his Redo then brings the pick back "not saved" with no press). Build: the short row's check fails whenever a
pick exists and his account is gone, is another account, or is now a master admin (opus1's `pickCannotGo`), on every
draw as at Save — the row closes with the note where it was on the page, silently where it was hidden; a short row with
NO pick still follows his sign-in live (keep those pins). Re-point by name, never weaken: `msq-s2-rejudge3.test.tsx`
§15 "pin: his sign-in moved to another man under his open short row, a pick made…" and the matching expectation in
`msq-s2-rejudge4.test.tsx` (about l.727); correct rejudge5 §32's header. Tests: opus1 1a, 1b; opus2 1a, 1b; Astra 1.

**B. A pick made "untouched" by another admin's change later turns into a change with no press, and Save undoes that
admin's act** (opus1 F2; (a), two people). Kestrel picks None; Saber also takes the View (the row reads untouched);
Saber gives it back — with no press the row turns "not saved" and Save takes the View away. Round 3 let a pick go when
put back BY HAND for exactly this reason. Build: the pick is let go the moment it equals the line he holds now, by any
route (the page's judging, or the editor's draw) — choose the place that holds with A. Test: opus1 proof 3.

**C. The REAL bell landing reaches Users one draw late** (Astra 2; one person and the clock). `AdminPage` takes the
landing in an effect, so Users' first draw still has the old `ring`, judges the stale row and queues the note before
the landing that should close it silently arrives. Build: the landing is known to Users on the first draw responding to
it (a change in `ui/AdminPage.tsx` is allowed for this, nothing else there); scrolling and the ring's timer stay
effects; a landing on the very man whose row is open stays as today. Test: Astra proof 2 (through `openAdminUsers` with
the real Admin page, plain and strict).

**D. Midnight alone closes an archived row whose post-in date he PICKED** (opus2 F2; one person and the clock; (b) when
the row is in the shut fold). The copy holds the date the box opens on (today), so at midnight the row counts as
changed though the box shows his own date. Build: the copy's date is compared only while he has left it untouched (what
he typed equals the copy's date); otherwise the fresh read takes the copy's date before comparing; the editor's own
judging and the page-goes note are handed the typed work too. rejudge4 §19's midnight case with the date untouched
still closes, as pinned. Tests: opus2 proof 2 (2a, 2b).

**E. "Give access" changed, then a squadron pick: the form is held but not counted while away** (opus2 F3; (b)).
Build: the open form is thrown away when its request leaves the page's list (in `Waiting`, while drawing), as an open
row is at a pick today. Test: opus2 proof 3.

## Limits and checks
Tests first — every proof seen failing on the code as it stands, then lasting tests in `src/ui/msq-s2-rejudge6.test.tsx`
(plain-word names, no `zz-` names left in the repo). Every earlier test kept green; one the round truly changes is
re-pointed by name and listed. Change only `ui/UsersPanel.tsx`, `ui/AdminPage.tsx` (fix C only), `msq-s2-*` tests,
`docs/file-map.md`, `docs/data-schema.md` if a stored fact changes. Do not edit `state/*`, `ui/Shell.tsx`, `ui/guard.ts`,
`ui/guardnote*`, `test-support/*`, any `msq-guard-*` test (chat 204's — if one goes red, report its failing lines), or
anything under `.claude/`. One test file at a time from `raptor-port/` (`npx vitest run <file>`): the six
`msq-s2-rej*` files, `msq-s2-row`, `msq-s2-asis`, `msq-users-row`, `msq-s2-lists`, `msq-users-filter`, `msq-guard-g`,
`msq-guard-rollcall`, `msq-guard-note`, `msq-guard-asis`, `onedoor-users`, `accounts-ui`, `accounts-newperson`,
`postout-landing`, `admin`, `msq-bell-tap`, `state/edit-rights-readers`, and the security reader's two pin files copied
in and removed again. `msq-guard-open.test.tsx` only with `-t "userrow"` and `-t "giveaccess"` (whole, it runs out of
memory). `npx tsc -p tsconfig.app.json --noEmit` (supporting only). `npm run lint:changed` once at the end — say what it
names in `ui/UsersPanel.tsx` and `ui/AdminPage.tsx`, and whether this round adds any. Never the full suite, the build or
the lock. On Windows write scripts to files and run them.

## Report
Your file tool may decline a report file — do not go round that: your final reply is the report. Each fix:
failed-before / passes-after by test name; what you built and where; pins re-pointed by name and why; every file run
with its count; the security pins' result; the code check's lines; anything a person would SEE differently; anything
unclear and what you chose. End with a ten-line summary.
