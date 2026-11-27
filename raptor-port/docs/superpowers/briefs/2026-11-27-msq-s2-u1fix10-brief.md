# S2 step U1's tenth round — still listed, the master put-back, receipts kept (chat 205's brief, 27 Nov 26)

For ONE OPUS builder (his D2819). The orchestrator reviews, runs and commits; **you do not commit, stage, push, build or
take the checks lock.** Work only in `C:/Users/User/projects/Raptor/.claude/worktrees/fable-read-faults-4104f0`.

## Where things stand
Round 8 (568bbd643) made Admin → Users one record of open work and one judge (plan
`raptor-port/docs/superpowers/plans/2026-11-27-msq-s2-open-work-judge.md`, its "Red team, folded in" section governs);
round 9 (2c76884af, brief `…/briefs/2026-11-27-msq-s2-u1fix9-brief.md`) fixed the press paths (`closeFound`,
`closedAtPress`, `onClose(found?)`, the short row's fresh line). The ninth read of four (of 51503c085) found no hole by
one person; its proofs below were all re-run by the orchestrator and fail as reported. Reports (read each finding whole):
`C:/Users/User/AppData/Roaming/Claude/side-session-notes/local_eeb07289-ed8b-483b-8502-00962970c7d1/s2-chat205/fixread9/{security,astra,opus1,opus2}/report.md`.
**No new words** — the only note is `changedWhileOpenWords`; its words unchanged (his D2730 Q13). Do NOT build opus1 F1
(the same-squadron bell line) — it waits on another chat's word.

## The fixes
**A. A press still writes after the man LEFT THE PAGE'S LIST through another admin's change, nothing redrawn** (security
F1 = Astra 1; a write let through, two people). `askAgain` (→ `judgeRow`) and the short row's line press never ask
whether he is still listed. Build as the security report's fix: a page `listedNow(pid)` =
`rowInView(usersView(pageUnit('own'), todayIso(), q, filt, actorIsMaster()), pid, archOpenNow)` (use the names the page
really has); passed as `listed` through `PersonRow` / `ArchivedRow` to the three editors (re-point rejudge4 §20's prop
pins by name: a page function, not a value of the man); `askAgain` returns true only when `judgeRow(...) === 'ok' &&
listed(pid)`, else `onClose(true)` (covers every writing press: Save, Suspend/Enable, Give sign-in, Archive, Delete,
Restore, Restore as, Save name); the short row's line press and Save: not listed → `onStale()`. Tests failing first:
`fixread9/security/zz-security-proof-2.test.tsx` (3 failing; its 4 passing controls stay passing) and Astra's
`fixread9/astra/zz-astra-proof-1.test.tsx` (2). Keep `zz-security-proof-1` (8 pins) passing.

**B. A refused press judges the other work without the draw's `left` / `lost`** (opus2 F1 = Astra 2, same cause).
`closedAtPress` must apply the same checks as the draw (left the list, lost) to the other entry, so a refused press
beside a row that left the list closes both and says both notes once in one batch. Tests: `fixread9/opus2/zz-opus2-proof-1.test.tsx`,
Astra's `fixread9/astra/zz-astra-proof-2.test.tsx` (2).

**C. Round 9 regression: a master admin pick read as a put-back** (opus2 F2). In the short row's line press,
`const putBack = !!fresh.a && fresh.a.id === a.id && v === fresh.line` needs `&& fresh.rolePick !== 'master'` (check the
names; the report gives the case). Test: `fixread9/opus2/zz-opus2-proof-2.test.tsx`.

**D. A writing press's own receipt is replaced by the redraw's note for the other work** (opus1 F2/F3 = opus2 F3;
notes only, one person). E.g. Hunter types a sign-in on Drifter's row, then gives Newface access "On the roster" as
Drifter → only "Drifter’s row changed while it was open, so nothing was saved. Open it again." stays (the receipt
"newface@mail can sign in now" replaced). Cause: `done()` and `GiveForm.go` toast then `notify()`; the redraw's
`useOpenWorkJudged` says the other's note in a separate batch. Build as opus1's "One fix": a page `afterWrite(pressed,
write)` beside `closeFound` — inside `HOOKS.toastBatch`: run the write (its receipt or the door's own words such as
"That request is gone"), then judge the other slot at once as `closedAtPress` does (with B's checks), drop it with a
functional `setWork` where not ok and say its note in the same batch where `noteOwed`; route every writing press through
it, so the redraw finds the other already closed; receipt first, then note, one line. Tests:
`fixread9/opus1/zz-opus1-proof-2.test.tsx` (2), `-4` (1), `fixread9/opus2/zz-opus2-proof-3.test.tsx`; plus a control:
a writing press with no other open work shows its receipt alone, once.

All proofs above made failing first, then lasting in a new `src/ui/msq-s2-rejudge10.test.tsx` (read the real note
element, as rejudge9 does). Do NOT put `fixread9/opus1/zz-opus1-proof-1` in it (that is the waiting bell-line case).

## Limits and checks
Change only `ui/UsersPanel.tsx`, `msq-s2-*` tests. Not `state/*`, `ui/guard.ts`, `ui/guardnote*`, `ui/topstate.ts`,
`ui/Shell.tsx`, `ui/DateBox.tsx`, `ui/AdminPage.tsx`, `test-support/*`, `msq-guard-*`, `src/engine/`, `.claude/`, and
not `add()` or the Add a person form (another chat's). One test file at a time from `raptor-port/`
(`npx vitest run <file>`): all ten `msq-s2-rej*` files, `msq-s2-row`, `msq-s2-asis`, `msq-s2-lists`, `msq-users-row`,
`msq-users-filter`, `msq-guard-g`, `msq-guard-rollcall`, `msq-guard-note`, `msq-guard-asis`, `msq-guard-doors`,
`msq-guard-doors-switch`, `msq-guard-doors-bell`, `onedoor-users`, `accounts-ui`, `accounts-newperson`,
`postout-landing`, `admin`, `msq-bell-tap`, `state/edit-rights-readers`; `msq-guard-open.test.tsx` only with
`-t "userrow|archrow|giveaccess"`; the security pins (`fixread6/security/zz-security-proof-1..2`,
`fixread7/security/zz-security-proof-1..3`, `fixread8/security/zz-security-proof-1`, `fixread9/security/zz-security-proof-1`)
copied into `src/ui/` one at a time, run, removed. `npx tsc -p tsconfig.app.json --noEmit`;
`npm run lint:changed -- --base HEAD --include-untracked`. No `zz-` file left. Never the full suite, the build or the
lock. On Windows write scripts to files and run them; a JS replace uses a function replacement.

## Report
Your file tool may decline a report file — your final reply is the report: each fix with failed-before / passes-after
by test name; what you built and where; re-points by name and why; every file run with its count; the security pins;
the type check and code check lines; anything a person would SEE differently; anything unclear and what you chose; a
ten-line summary.
