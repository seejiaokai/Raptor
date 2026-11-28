# S2 step U1's eleventh round — Add a person and Refuse keep their receipt (chat 205's brief, 27 Nov 26)

For ONE OPUS builder (his D2819). The orchestrator reviews, runs and commits; **you do not commit, stage, push, build or
take the checks lock.** Work only in `C:/Users/User/projects/Raptor/.claude/worktrees/fable-read-faults-4104f0`.

## Where things stand
Round 10 (774bac3c0, brief `…/briefs/2026-11-27-msq-s2-u1fix10-brief.md`, report `…-u1fix10-report.md`) added
`pressPaths` with `afterWrite(pressed: 'row' | 'give', write)`: every writing press of a piece of OPEN WORK runs its
write inside `HOOKS.toastBatch`, then judges the other slot at once (`otherAtPress`), so its receipt comes first and the
other's note after it, on one line. The tenth read (security: no hole; opus1, opus2: the same class on two presses that
are not open work — every proof re-run by the orchestrator and failing) found the two writing presses round 10 left out.
Reports: `C:/Users/User/AppData/Roaming/Claude/side-session-notes/local_eeb07289-ed8b-483b-8502-00962970c7d1/s2-chat205/fixread10/{opus1,opus2}/report.md`
— read both whole. **No new words.** Do NOT build the same-squadron bell line (waits on a question).

## The fix (one, for both)
**"+ Add a person" and Refuse on the waiting list lose their receipt to the other work's note** (one person; Refuse with
the clock). E.g. Give access open and changed on Newface's request; he adds a person with sign-in newface@mail — the add
answers the request, the redraw closes the form, only "Newface’s row changed while it was open, so nothing was saved.
Open it again." stays ("Zedd added — newface@mail can sign in now" lost). Or an archived man's row open, he adds a person
under that man's callsign (free while archived). Or Ranger's whole row open and typed, his move lands at midnight unseen,
he presses Refuse on any request — "Refused newface@mail" lost.
Build: in `pressPaths`, a third press kind `'add'` whose `afterWrite` judges BOTH slots after the write (the add form and
the waiting list are in neither): for each of `work.row`, `work.give` present, `otherAtPress(entry, x)`; drop every one
that closes in ONE `dropWork({ row, give })`; say the callsigns owed a note in ONE `sayChanged([...])`, row first then
give — all inside the one `HOOKS.toastBatch`, after `write()`. Return `addWrite: (write) => afterWrite('add', write)`.
- `add()` in `UsersPanel`: change ONLY its write line to
  `addWrite(() => { if (done(addPersonAndAccount(name, np, role, postIn), ok)) resetAddForm() })` (use the real names
  there). Chat 204 agreed to exactly this line; nothing else in `add()`, the add form, `addFormDiffers` or its checks.
- `Waiting`'s Refuse: pass `addWrite` into `Waiting` (beside `afterWrite`); Refuse →
  `addWrite(() => { done(declineRequest(r.id), \`Refused ${r.name}\`) })`.
Tests failing first, then lasting in a new `src/ui/msq-s2-rejudge11.test.tsx` (read the real note element, as rejudge10
does): `fixread10/opus1/zz-opus1-proof-1.test.tsx` (1a, 1b failing; its control passing), `-2` (1), and
`fixread10/opus2/zz-opus2-proof-1.test.tsx`, `-2` (1 each); plus a control: Refuse with no other open work shows
"Refused <name>" alone, once. If rejudge4 §20 pins `Waiting`'s props by name, re-point it by name with the reason.

## Limits and checks
Change only `ui/UsersPanel.tsx`, `msq-s2-*` tests. Not `state/*`, `ui/guard.ts`, `ui/guardnote*`, `ui/topstate.ts`,
`ui/Shell.tsx`, `ui/DateBox.tsx`, `ui/AdminPage.tsx`, `test-support/*`, `msq-guard-*`, `src/engine/`, `.claude/`. One
test file at a time from `raptor-port/` (`npx vitest run <file>`): all eleven `msq-s2-rej*` files, `msq-s2-row`,
`msq-s2-asis`, `msq-s2-lists`, `msq-users-row`, `msq-users-filter`, `msq-guard-g`, `msq-guard-rollcall`,
`msq-guard-note`, `msq-guard-asis`, `msq-guard-doors`, `msq-guard-doors-switch`, `msq-guard-doors-bell`,
`onedoor-users`, `accounts-ui`, `accounts-newperson`, `postout-landing`, `admin`, `msq-bell-tap`,
`state/edit-rights-readers`; `msq-guard-open.test.tsx` only with `-t "userrow|archrow|giveaccess|addperson"`; the
security pins (`fixread9/security/zz-security-proof-1..2`, `fixread10/security/zz-security-proof-1`) copied into
`src/ui/` one at a time, run, removed. `npx tsc -p tsconfig.app.json --noEmit`;
`npm run lint:changed -- --base HEAD --include-untracked`. No `zz-` file left. Never the full suite, the build or the
lock. On Windows write scripts to files and run them; a JS replace uses a function replacement.

## Report
Your final reply is the report: failed-before / passes-after by test name; what you built and where; re-points by name
and why; every file run with its count; the security pins; the type check and code check lines; anything a person would
SEE differently; anything unclear and what you chose; a ten-line summary.
