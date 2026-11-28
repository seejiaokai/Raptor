# S2 step U1's fourth round, the one guard — the builder's report (a Fable helper, for chat 205, 26 Nov 26), saved by the host from the builder's reply

Brief: `2026-11-26-msq-s2-u1fix4-brief.md`. Tests first; reviewed by the orchestrator before the commit. **The four
readers' read of this round and the walk are owed.**

## Files

`src/ui/UsersPanel.tsx` (the only app file); `src/ui/msq-s2-rejudge4.test.tsx` (new, 106 tests, §16–§26);
`src/ui/msq-s2-rejudge3.test.tsx` (one test re-pointed by name, one pin added — 39); `docs/data-schema.md` (edit
rights: "who is looking at an open row"), `docs/file-map.md`. `state/edit-rights-readers.test.ts` unchanged and green
(no new `adminOfUnit` / `isAdmin` call).

## The guard

- `OpenedOn` gains `shown` (the copy) and `admin` (who is looking). ONE reader, `shownOf(pid, kind)`, builds the copy:
  `acct` (which account, or none), `name`, `role` (as the Role box shows it, master mark first), `on`, `lines` (every
  other squadron's line), `cs`; on an archived row also `taken`, `box` (the callsign its box opens on), `postIn`.
- `rowChanged` compares the store with the copy whole (one JSON comparison) beside the four old facts and
  `adminThere`; asked on every page draw, every editor draw and through the belt before every action.
- The whole row's and the archived row's editors no longer receive the account: they are handed the copy and read the
  man only through it; every write names the account by it.
- Who is looking: `adminThere(unit)` — does the signed-in person's account, in the store today, still make him an
  admin of the squadron the row opened on (`accounts.ts levelIn`); read from the store, not the session.
- What the admin types or picks is not the copy: a page-held value `Typed` (sign-in box, Role box, lines, the short
  row's pick), started from the copy at each opening, cleared at close.
- A row's own actions all close the row in the same press except the archived row's Save name, which takes a fresh copy.
- **The short row keeps round 2's design** (no copy; read afresh each draw; Save compares the pick with the store;
  a put-back pick let go; a sign-in given or taken under it followed live — rejudge3 §15 pins both); its pick is now
  page-held and tied to the sign-in it was made on.
- A bell landing for another man closes an open row in that draw, no note (for the very man whose row is open: stays).
- `takenAwayUnder` asks `leftByHisPick` (the squadron in view moved by his own pick or bell tap); `closedByHisPick`
  unchanged for the draw rule. `shown` (is Users on screen) joins the page's held picture.

## Each reader's case — failed first on ae465d73d, passes now

Opus 1 (a sign-in given under an open "Give sign-in" row: the row closes with the note; not demoted, not renamed) ·
Opus 2 (bell landing; the archived fold; strict mode) · Astra A1 (regrouping keeps the short row's pick) · Astra A2
(a row put away by Admin → Data or "Back to categories", then his move lands: silent) · security S1 = Fable F1 (his own
move into the squadron he works by Plan: the note once, before the app makes his session a member's; with nothing
redrawn Save writes nothing and says it) · S1's second half, **re-pointed by name in rejudge3 §12**: "as built today:
Hunter is made a member … nothing is said" → "… and the note is said, once, as his standing goes" · security S2 = Fable
F2 (silent at his own View-only pick). Pins kept: security 2A's four, both readers' controls, a master admin's own move
keeps his row and typing, Fable's proof 0 (ten).

## The per-field tests (§16–§19) and the left-out-field test (§20)

Eight fields of the whole row, each changed by another admin through its real door: with a redraw (closes, note once,
nothing written); with nothing redrawn — every button writes nothing (31 tests); through the signed-in admin's own
Undo, then Redo. The archived row: sign-in name, callsign, a roster man taking his callsign, the date rolling past
midnight; each of Restore as / Save name / Delete with nothing redrawn. A field left out is caught two ways: (a) the
test reads `UsersPanel.tsx` and lists every imported or top-level name each editor uses against a short allowed list;
(b) every stored field of his account and person record is changed in turn under his open row — either the row closes
or the still-open row reads character for character as a freshly opened one. Seventeen one-line removals of the
guard's parts each turned the right tests red (file restored, byte-compared).

## Checks run by the builder (one file at a time, from `raptor-port/`)

45 files, 1,015 tests passed, 0 failed: rejudge4 106 · rejudge3 39 · rejudge2 52 · rejudge 23 · row 15 · asis 24 ·
users-row 7 · s2-lists 14 · users-filter 24 · guard-open 174 · guard-g 13 · guard-asis 29 · guard-rollcall 17 ·
onedoor-users 22 · accounts-ui 21 · accounts-newperson 26 · edit-rights-readers 4 · quals 83 · noteswords 120 ·
postout-landing 4 · the other 25 of round 3's list. Type check exit 0 (supporting only). Document check OK. Not run:
the changed-code check, the build, the full suite, browser tests, the running app.

## What a person sees differently (no new words)

A whole row or an archived row closes with the existing note whenever anything it shows changed under it — by another
admin or his own Undo / Redo. An archived row also closes with the note if the date rolls past midnight (its post-in
date box shows today) or a roster man takes his callsign. His own standing going (his move's day, or made a member by
another admin): the note, once. A bell tap for another man closes an open row quietly; a row put away by leaving Users
closes quietly. Typing and picks survive a regrouping; a row hidden by his own search and brought back still holds
what he typed (it used to reset).

## The builder's choices, for the readers and the host

1. Who is looking is one fact — admin of the row's squadron by his account — not his home (a master admin's own move
   must keep his row; "made a member" changes no home). 2. A suspended, archived or deleted signed-in admin stays as
today (the suspended screen speaks). 3. The signed-in admin's rights over other squadrons' lines are not in the copy
(read afresh, judged by the doors). 4. The post-in date in the copy closes an open archived row at midnight. 5. The
whole row's typing is held by the page (a whole row can change group under a master admin's Squadron tick); the
archived row's boxes stay its own; a Delete's armed state stays local, so a regrouping disarms it. 6. `toggle` records
whether Users was on screen (`drawn: shown`) — one existing msq-users-filter test needed it; test unchanged.
7. Approving a waiting request onto the man whose row is open closes that row with the note.
