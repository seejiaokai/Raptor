# S2 step U1's seventh round — the sixth read's findings (chat 205's brief, 27 Nov 26)

For ONE OPUS builder (his D2819: Opus until his weekly reset). The orchestrator reviews your diff, runs your tests and
commits; **you do not commit, stage, push, build or take the checks lock.** Work only in
`C:/Users/User/projects/Raptor/.claude/worktrees/fable-read-faults-4104f0` (branch `claude/msq-s2-users-685735`).

## Where things stand
U1 (Admin → Users across squadrons: another squadron's man shows a short row with one access line) has had six fix
rounds; the sixth (6013506fe, merged with the batch branch at 2ca4e4558, seven tests re-pointed after the core's
squadron-pick refusal at 1e0dab7cc) passed its build. Its read — Astra, two fresh Opus readers, an Opus security
reader, each blind — found **no way to see what must not be seen and no way to make a row write what the rule
forbids** (the security reader: no hole). The smaller findings below remain; every proof was re-run by the
orchestrator and fails as its reader said. This round closes them and nothing else. **No new words on screen** — the
only note is the existing `changedWhileOpenWords`.

## Read first
- `.claude/rules/raptor-executor.md`; `.claude/rules/decisions/people-accounts.md` (with the Read tool).
- The rule as the readers had it: `raptor-port/docs/superpowers/briefs/2026-11-27-msq-s2-u1-read-brief-7.md`; the sixth
  round's brief and report (`…-u1fix6-brief.md`, `…-u1fix6-report.md`).
- The readers' reports and proofs (outside the repo):
  `C:/Users/User/AppData/Roaming/Claude/side-session-notes/local_eeb07289-ed8b-483b-8502-00962970c7d1/s2-chat205/fixread6/`
  — `astra/report.md` (+ `zz-astra-proof-1`), `opus2/report.md` (+ `zz-opus2-proof-1`, `-2`), `opus1/report.md`
  (+ its proofs), `security/report.md` (10 passing pins `zz-security-proof-1`, `-2` — keep them green). Line numbers
  there are of 1e0dab7cc; find each place by name.

## The fixes
**A. The archived row's post-in date: one rule for "untouched", kept across midnight and across Save name.** Two
findings share one cause — the copy's opening date is both "what he has not touched" and "what the clock last said":
- opus2 F2 ((b), one person and the clock): Kestrel types a callsign on Osprey's archived row, leaves the date alone,
  shuts the Archived fold; at midnight the row closes silently and his callsign is gone, nothing counted.
- Astra 1 (one person): he picks 16 Jul on 15 Jul and types a callsign; midnight keeps the row (round 6); on 16 Jul he
  presses Save name — `ownWrite`'s fresh copy (`judgedNow` → `shownOf`) takes today, 16 Jul, as the opening date, so
  his picked date now reads untouched: the row stops counting unsaved work though the date was never applied by
  Restore, and at the next midnight a later draft is thrown away silently.
Build: (1) on a page draw (not at a press), an archived row whose typed date equals its copy's date and whose copy's
date is no longer today rolls forward — the copy's date and the typed date both become today — and is then judged as
now (opus2's fix (i)); a press with nothing redrawn stays strict (`askAgain`), so it refuses with the note as today.
(2) Save name refreshes the copy's saved person and account fields as now but KEEPS the previous copy's post-in date;
the page-held date is unchanged. Keep rejudge4 §19's and rejudge6 §38's pins true or re-point them by name if (1)
changes what they pin (an untouched date at midnight now rolls forward rather than closing — say so). Tests: opus2
proof 2; Astra proof 1 (both tests).

**B. A bell landing on the very man whose row is open can hide that row** (opus2 F1; held out of sight, counted, not
lost). Kestrel on 149 finds Ranger (142) by the search, opens his short row, picks None, taps a bell landing for him:
the landing clears the search, Ranger was listed only by it, the row leaves the page held and counted but unseen.
Build (opus2's fix): `useRingLanding` keeps the search when the landing is for the open man and he would not be listed
without it (`listedWithoutSearch(pid)` = `rowInView(usersView(pageUnit('own'), todayIso(), '', filt, actorIsMaster()),
pid, !!P(pid)?.archived)`); otherwise clears it as now. Correct the comment above it. Tests: opus2 proof 1 (both).

**C. A changed "Give access" is thrown away without a word by his own midnight move or his own Undo / Redo** (opus1
F1; (b), one person). Round 6's throw-away in `Waiting` (`if (open && !live) { setOpen(null); setOpened(null) }`) is
silent whatever made the request leave the page's list. A pick can only throw away an UNCHANGED form now (the core's K4
refuses a pick while it holds a change — opus1 proofs 5, 6; rejudge6 §39), but a master admin's own move landing at
midnight, or his own Redo of a refusal, drops a changed form silently. Build (opus1's steps 1–3, with the orchestrator's
call on the words): hold the squadron in view in `Approving` (set in `startApprove`); at the throw-away, when the form
was changed and the request did not leave by his own pick (`pageUnit('schedule') !== open.view && enteredByPick()`),
set a note state `{ seq, callsign }` and clear as now; raise the note in an effect keyed on it, so strict mode says it
once. **The words are the existing `changedWhileOpenWords(<the request's callsign>)` — no new words** (the
orchestrator's call: the same note is said today when a man is deleted under his open row; whether its "Open it again"
always holds is already filed for the database step, `[ROW-NOTE-OPEN-AGAIN]`). An unchanged form still goes silently.
Tests: opus1 proofs 1 and 3 — adapt their assertion to "the note said once" where they accept "kept, or its loss is
said"; §39 stays green.

Not in this round (the orchestrator reports them on): opus1 F2 (the core's "Add a person" after a master admin's own
midnight move — chat 204's); the bell tap not asked by the leave-guard (the core's later steps); the security reader's
two-people corner (the database step).

## Limits and checks
Tests first — every proof seen failing on the code as it stands, then lasting tests in a new
`src/ui/msq-s2-rejudge7.test.tsx` (plain-word names, no `zz-` names left in the repo). Every earlier test kept green;
one the round truly changes is re-pointed by name and listed. Change only `ui/UsersPanel.tsx`, `msq-s2-*` tests,
`docs/file-map.md`, `docs/data-schema.md` if a stored fact changes. Do not edit `ui/AdminPage.tsx` unless a fix below
names it, `state/*`, `ui/Shell.tsx`, `ui/guard.ts`, `ui/guardnote*`, `test-support/*`, any `msq-guard-*` test (chat
204's — if one goes red, report its failing lines), or anything under `.claude/`. One test file at a time from
`raptor-port/` (`npx vitest run <file>`): the seven `msq-s2-rej*` files, `msq-s2-row`, `msq-s2-asis`, `msq-users-row`,
`msq-s2-lists`, `msq-users-filter`, `msq-guard-g`, `msq-guard-rollcall`, `msq-guard-note`, `msq-guard-asis`,
`onedoor-users`, `accounts-ui`, `accounts-newperson`, `postout-landing`, `admin`, `msq-bell-tap`,
`state/edit-rights-readers`, and the security reader's two pin files copied in and removed again.
`msq-guard-open.test.tsx` only with `-t "userrow"`, `-t "archrow"` and `-t "giveaccess"` (whole, it runs out of
memory). `npx tsc -p tsconfig.app.json --noEmit` (supporting only). `npm run lint:changed` once at the end against the
last commit — say what it names in `ui/UsersPanel.tsx`, and whether this round adds any. Never the full suite, the
build or the lock. On Windows write scripts to files and run them.

## Report
Your file tool may decline a report file — do not go round that: your final reply is the report. Each fix:
failed-before / passes-after by test name; what you built and where; pins re-pointed by name and why; every file run
with its count; the security pins' result; the code check's lines; anything a person would SEE differently; anything
unclear and what you chose. End with a ten-line summary.
