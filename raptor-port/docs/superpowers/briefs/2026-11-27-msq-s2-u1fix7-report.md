# S2 step U1's seventh round — the builder's report (an Opus helper, his D2819; for chat 205, 27 Nov 26), saved by the host from the builder's reply

Brief: `2026-11-27-msq-s2-u1fix7-brief.md`. Tests first. **The read of this round and the walk are owed.**

## Files
`src/ui/UsersPanel.tsx`; `src/ui/msq-s2-rejudge7.test.tsx` (new, 14 tests, §40–§42); pins re-pointed in
`msq-s2-rejudge4` §19 and `msq-s2-rejudge6` §38; `docs/file-map.md`. `docs/data-schema.md` unchanged (no stored fact).

## Failed before
All 7 readers' proof tests failed on the code as it stood (opus2 proof 1 ×2 and 2 ×1, Astra proof 1 ×2, opus1 proofs 1
and 3). After: 6 pass; opus2 proof 1's first test fails only on its own `search: ''` field — the ordered fix keeps the
search ('Ranger'); the lasting test expects it kept. rejudge7 against the old panel: 9 of 14 failed, the 5 "pin:" held.
Security pins 10/10 before and after.

## The fixes
- **A** — `rolledForward`: on a draw, where the date box still holds the copy's date and that date is no longer today,
  the copy's date and the box both move to today, held by the page, then the row is judged (`useOpenRowJudged`, and
  `takenAwayUnder` — the judging as the Admin page is taken away — the builder's choice, so the clock alone never raises
  the note there either). A press with nothing redrawn stays strict (`askAgain`). `ownWrite` (Save name) keeps the
  previous copy's post-in date; the typed date is left. Tests: opus2 proof 2; Astra tests 1, 2; "once the page has
  drawn past midnight, Restore on the rolled box goes through, no note". Pins: a press past midnight with nothing
  redrawn stays strict; Save name with the date untouched.
- **B** — `useRingLanding` handed `listedWithoutSearch(pid)` (the brief's formula, built in `UsersPanel`): the search
  is cleared only for a landing on another man, or where the open man is listed without it; comment corrected. Tests:
  opus2 proof 1 (both). Pin: a landing on an open man listed without the search clears it as before.
- **C** — `Approving.view` (the squadron in view, set in `startApprove`); in `Waiting`, a changed form thrown away not
  by his own pick sets `{ seq, callsign }`; an effect says `changedWhileOpenWords(<the callsign the request asked as>)`
  once (strict mode too). No new words; an unchanged form goes silently. Tests: opus1 proofs 1, 3, and strict mode.
  Pins: the same midnight and Redo cases with nothing changed stay silent. rejudge6 §39 green.

## Pins re-pointed (one change: an untouched date at midnight now rolls forward and the row stays open)
- rejudge4 §19: the midnight field left out of the "…and the page redraws: the row closes with the note, once" table,
  replaced by "the date rolls past midnight…, and the page redraws: the row stays open, the untouched box rolled to the
  new day, his callsign kept — no note, nothing written"; its "with NOTHING redrawn" cases unchanged.
- rejudge6 §38 pin "his date picked, then picked back to the day the box opened on…": now rolls and stays open (a date
  picked back cannot be told from an untouched one).
- rejudge6 §38 pin "the date left untouched — midnight closes…" → "…rolls the box to the new day; the row stays open
  with his callsign, counted, no note".

## Checks (builder; one file at a time, all green)
rejudge 23 · 2 52 · 3 39 · 4 110 · 5 83 · 6 21 · 7 14 · row 15 · asis 24 · users-row 7 · s2-lists 14 · users-filter 24 ·
guard-g 19 (+1 todo) · guard-rollcall 29 · guard-note 58 · guard-asis 29 (+4 todo) · onedoor-users 22 · accounts-ui 21 ·
accounts-newperson 26 · postout-landing 4 · admin 5 · msq-bell-tap 12 · edit-rights-readers 4 · security pins 8 + 2 ·
msq-guard-open `-t userrow` 9, `archrow` 7, `giveaccess` 7. Type check exit 0. Code check against the last commit: no
new finding (5 files); against main: the same three older "high control-flow complexity" findings (`PersonRow`,
`useOpenRowJudged`, `UsersPanel`), none added. Document check OK.
**The host re-ran** every `msq-s2-*` file, guard-rollcall, guard-note, guard-g, admin, msq-bell-tap and msq-guard-open
`-t "archrow|giveaccess|userrow"` (23): all green.

## What a person would see differently (no new words)
An archived row with its date untouched stays open past midnight, its box on the new day, the typed callsign kept (the
shut fold too). After Save name a picked date still counts as not saved. A bell tap for the man whose row he found by
the search keeps the search and the row open, ringed. A changed Give access taken away by his own midnight move or Undo
/ Redo says the usual note once, naming the request's callsign.

## The builder's choices
The search expectation of opus2 proof 1 (kept, as ordered); the roll also in `takenAwayUnder`; a changed Give access
whose request he answers from the man's own row now says the note (the rule "did not leave by his own pick" covers it;
"Open it again" filed as `[ROW-NOTE-OPEN-AGAIN]`).
