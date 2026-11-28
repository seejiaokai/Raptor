# S2 step U1's ninth round — the judge's press paths (chat 205's brief, 27 Nov 26)

For ONE OPUS builder (his D2819). The orchestrator reviews, runs and commits; **you do not commit, stage, push, build or
take the checks lock.** Work only in `C:/Users/User/projects/Raptor/.claude/worktrees/fable-read-faults-4104f0`.

## Where things stand
The eighth round (568bbd643) reshaped Admin → Users into one record of open work and one judge (plan
`raptor-port/docs/superpowers/plans/2026-11-27-msq-s2-open-work-judge.md`, its "Red team, folded in" section governs;
report `…/briefs/2026-11-27-msq-s2-judge-report.md`). Its blind read of four found NO HOLE and said the reshape closes the
class — but two press-path findings remain, every proof re-run by the orchestrator and failing. This round closes those
two and nothing else. **No new words** — the only note is `changedWhileOpenWords`; its words unchanged (his D2730 Q13).

## The fixes
**A. A press that finds work changed says its note OUTSIDE the batch; the redraw it causes says the other work's note,
which replaces the first on screen** (found by three readers: Astra 1, opus1 F1, opus2 F1). Hunter (142's admin) has
Ranger's whole row changed and Give access changed, both on screen; his own move to 150 lands at midnight, nothing
redrawn; he presses Ranger's Save (or Give access's button): both close (right) but only one sentence stays. Cause:
`saidChanged` (from `askAgain`, and the short row's Save) and `giveAsked` call `HOOKS.toast` at once; the close redraws;
`useOpenWorkJudged` then says the other entry's note through `sayChanged` — a second call replacing the first.
Build: a press that finds its work changed closes and announces EVERY piece of open work that is no longer ok at that
one moment, in one batch: the pressed entry's callsign first; the other entry, if `judge(other, 'press')` is not ok,
dropped too and its callsign added where `noteOwed` says so (on screen at the last draw); both closed in one functional
`setWork`; the list said once through `sayChanged` (`HOOKS.toastBatch`). No direct `HOOKS.toast` left on a press path.
Keep rejudge4 §20's `WHOLE_PROPS` / `ARCH_PROPS` unchanged if you can (e.g. the page's `closeRow` / `closeGive` take an
optional "found changed" flag through the existing `onClose`); if a prop must be added, re-point §20 by name with the
reason. Keep: the deleted-row press exception, silence for work put out of sight, and the door's own words for a request
already gone. Tests (failing first, then lasting in a new `src/ui/msq-s2-rejudge9.test.tsx`): Astra's
`…/fixread8/astra/zz-astra-proof-1.test.tsx` (4 tests), opus2's `…/fixread8/opus2/zz-opus2-proof-1.test.tsx` (2),
opus1's `…/fixread8/opus1/zz-opus1-proof-1.test.tsx` (2) — all read the real note element; and a one-note control (a
press on a single changed entry shows its sentence once). Folders under
`C:/Users/User/AppData/Roaming/Claude/side-session-notes/local_eeb07289-ed8b-483b-8502-00962970c7d1/s2-chat205/`.

**B. The short row's line press compares with the LAST DRAW's line** (Astra 2). Kestrel opens Ranger's short row on
149 (Ranger holds View), picks None; Saber removes Ranger's View with nothing redrawn; Kestrel presses View — the handler
compares with the captured `lineNow`, reads it as a put-back, clears the pick: the redraw shows None, nothing unsaved,
Save sends nothing — his deliberate View dropped silently. Build: in the line press, judge the row FIRST (with the typed
pick); re-read the held line fresh (`shortHeld` / the store) in the handler; clear the pick only when the pressed value
equals that FRESH line; otherwise keep his explicit choice against the freshly checked account. Keep the rule that a
later draw lets a pick go when the store has made it equal (`pickNowHeld`). Test: `…/fixread8/astra/zz-astra-proof-2.test.tsx`
(2), failing first, lasting in rejudge9.

## Limits and checks
Change only `ui/UsersPanel.tsx`, `msq-s2-*` tests, `docs/file-map.md`. Not `state/*`, `ui/guard.ts`, `ui/guardnote*`,
`ui/Shell.tsx`, `ui/DateBox.tsx`, `test-support/*`, `msq-guard-*`, `src/engine/`, `.claude/`. One test file at a time
from `raptor-port/` (`npx vitest run <file>`): all nine `msq-s2-rej*` files, `msq-s2-row`, `msq-s2-asis`,
`msq-s2-lists`, `msq-users-row`, `msq-users-filter`, `msq-guard-g`, `msq-guard-rollcall`, `msq-guard-note`,
`msq-guard-asis`, `msq-guard-doors`, `msq-guard-doors-switch`, `onedoor-users`, `accounts-ui`, `accounts-newperson`,
`postout-landing`, `admin`, `msq-bell-tap`, `state/edit-rights-readers`; `msq-guard-open.test.tsx` only with
`-t "userrow|archrow|giveaccess"`; the security pins (`fixread6/security/zz-security-proof-1..2`,
`fixread7/security/zz-security-proof-1..3`, `fixread8/security/zz-security-proof-1`) copied in one at a time, run,
removed. `npx tsc -p tsconfig.app.json --noEmit`; `npm run lint:changed -- --base HEAD --include-untracked`. No `zz-`
file left. Never the full suite, the build or the lock. On Windows write scripts to files and run them.

## Report
Your file tool may decline a report file — your final reply is the report: each fix with failed-before / passes-after
by test name; what you built and where; re-points by name and why; every file run with its count; the security pins;
the type check and code check lines; anything a person would SEE differently; anything unclear and what you chose; a
ten-line summary.
