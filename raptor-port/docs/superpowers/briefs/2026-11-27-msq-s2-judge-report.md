# S2 step U1's eighth round — one record of open work, one judge: the builder's report (an Opus helper, his D2819; for chat 205, 27 Nov 26), saved by the host from the builder's reply

Brief: the plan `raptor-port/docs/superpowers/plans/2026-11-27-msq-s2-open-work-judge.md` with its last section "Red team,
folded in" (red team: Astra, a fresh Opus, a fresh Opus in the Fable seat — D2238, D2819 owed). Parts A and B only; §8
(Add a person — his answer to question 25) and C (question 26) NOT built. **The read of this round and the walk are owed.**

## Built (`src/ui/UsersPanel.tsx` unless named)
- Pass 1, the date: `ui/DateBox.tsx` gains an optional `onSelect`, called on every pick, the day already held included,
  before `onChange` (which still fires only on a change). The archived row's Post in shows his pick once his "set" mark
  is on, else today, worked out live each draw; Restore and Restore as send that day; `askAgain` refuses a press past
  midnight on a box he never touched. `Shown` holds no post-in date; `rolledForward` and `shownNow` gone. Each typed
  field has a "he set this" mark; the diff counting reads the marks.
- Passes 2–5, built together: `OpenWork { row, give }` one page state; `judge` (gone / pick / changed / ok);
  `noteOwed` decides the note; `useOpenWorkJudged` writes the record at most once a draw, every other write
  `setWork(w => …)`. Give access lifted out of `Waiting` (now shows, holds nothing) into `GiveForm` (same markup and
  ids); its press asks the judge first (`giveAsked`); its copy (`reqKey`) never holds seenBy; its Post in worked out
  per draw. `useNoteAsPageGoes` covers Give access; notes owed at one moment said together through `HOOKS.toastBatch`
  (`sayChanged`). The landing writes no open work, hands `closedNow` to the judge, and where the search hid the open
  man sets the search to his callsign (`landingSearch`). Removed: `closedByHisPick`, `leftByHisPick`,
  `useOpenRowJudged`, `OpenAtDraw`, `Approving`, `startApprove`. Two code-check findings fixed (`useRingLanding`'s
  complexity → `landingSearch`; `see` its own argument of `useOpenWorkJudged`).
- `ui/toast.ts` one comment sentence; `docs/file-map.md` one paragraph; new `src/ui/msq-s2-rejudge8.test.tsx` (32
  tests, §43–§49).

## Failing first
rejudge8 on the old code: 19 failed, 13 passed (recorded before any change; the lapsed-session tests moved to Hunter on
142 — Kestrel is 149's last admin and cannot be suspended — then seen failing for the right reason). After pass 1: 17
passed, 15 failed (every §43 archived test green). After passes 2–5: 32/32.

## Re-points (each with a reason comment in its test)
1. rejudge6 §38: "pin: his date picked, then picked back to the day the box opened on: untouched again — midnight
   rolls the box…" → "pin: his date picked back to the day the box opened on is his: it stays on that day across
   midnight, counted, no note" (plan §1.2, §5.2, the orchestrator's call 1).
2. rejudge4 §20: `ARCH_MAY_USE` gains `'effectiveToday'` (the archived row reads today live).
3. rejudge2 §10: the pin "Hunter (View of 150 only) picks 150 … so the row stays open, no note" → "… and the row closes
   without a word (his own pick)"; the two "Hunter's row of Ranger survives his View-only pick of 150; then …" open the
   row after the pick, still the note once (no open work outlives a change of the squadron in view — §2.1 step 2).
4. rejudge5 §27 NOT re-pointed (the plan expected it): it types in the row, so the guard refuses the pick — still true.

## Checks (builder; one file at a time, all exit 0)
After the last edit: rejudge8 32, rejudge 23, rejudge2 52, rejudge3 39, rejudge4 110, rejudge5 83, rejudge6 21, rejudge7
14, msq-bell-tap 12, admin 5, postout-landing 4, onedoor-users 22. Before the two code-check fixes: msq-s2-row 15, asis
24, lists 14, edit-rights-readers 4, leavewar/noperiod-join 1, msq-guard-doors 125 (+1 todo), msq-guard-doors-switch 104,
accounts-ui 21, accounts-newperson 26, msq-users-row 7, msq-users-filter 24, guard-rollcall 29, guard-note 58, guard-g 21
(+1 todo), guard-asis 29 (+4 todo), datebox 48, datecal 75, leavewar datebox-sheet 6, tracker/leftovers 72, adminclear
15, nodatebox 2; msq-guard-open `-t "userrow|archrow|giveaccess"` 23. Security pins (fixread6 1–2, fixread7 1–3, copied
in, run, removed): 8, 2, 8, 2, 2 — all green. Type check clean. Code check against HEAD: no new finding (30 files).
Document check OK. Build, full suite, e2e: not run (forbidden to the builder).

## What a person would see differently (no new words)
Archived row: a post-in date he picks stays his, even the day already shown; Restore uses it. Give access → New person:
an untouched Post in shows today after midnight; a press past midnight with nothing redrawn sends nothing and says the
note. A lapsed session's Give access: the press sends nothing, says the note; its button opens nothing. The Admin page
taken away: a changed Give access says the note; put out of sight, silent. A bell landing brings back an open row his
search hid (the search set to his callsign). Two notes due at one moment show together. A request already gone shows
only the door's own words. Add a person's Post in still keeps its opening day (§8 not built).

## For the host
The comment on `toastBatch` in `engine/hooks.ts` is stale ("only a publish uses it") — outside the builder's files.
