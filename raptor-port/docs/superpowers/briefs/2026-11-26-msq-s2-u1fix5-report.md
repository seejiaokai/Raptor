# S2 step U1's fifth round — the builder's report (a Fable helper, for chat 205, 27 Nov 26), saved by the host from the builder's reply

Brief: `2026-11-26-msq-s2-u1fix5-brief.md` (its seven fixes and the Addendum's 8 and 9). Tests first. **The read of this
round (Astra, a fresh Opus in the Fable seat, an Opus security reader — his D2819) and the walk are owed.**

## Files
`src/ui/UsersPanel.tsx` (the only app file); `src/ui/msq-s2-rejudge5.test.tsx` (new, 83 tests, §27–§34);
`src/ui/msq-s2-rejudge4.test.tsx` (§20 tightened, 110); `docs/data-schema.md`, `docs/file-map.md`.

## Failed before
rejudge5 on the code as it stood: 52 failed, 31 passed (the pins) — seen on the real file before any change, and the
finished file against a copy of HEAD's `UsersPanel.tsx`. After: 83 pass. rejudge4 §20 before: 4 failed; after: 110.

## Fix by fix
1. **Who is looking is required.** `adminThere(unit)` false when `sessionLapsed()`; `OpenedOn.admin` gone (nothing
   compared); `toggle` opens nothing when `adminThere` is false, and calls `notify()` when the session lapsed. Hand-made
   sessions with no account as before. §27: suspended / archived / deleted / made a member × Save, Suspend, Archive,
   Delete (whole row), the short row, on a draw, a row never OPENED on such a session (made a member; short row; his own
   move at midnight), the whole app (suspended, plain and strict: note once, nothing saved; made a member: the press
   opens nothing, the app makes his session a member's). Pins: a plain open row across draws; his View-only pick; a
   right in another squadron taken; a master admin's own move; Hunter made a master admin under his open row; the
   archived-row press after his own move.
2. **A deleted man's row never writes.** `rowChanged` true for a deleted man; the draw rule still closes with no note.
   §28. Accepted corner: a press on the stale row says the usual note, ending "Open it again." (no new words).
3. **The archived row's boxes are page-held.** `Typed` gains `box`, `postIn`; `ArchivedRow` / `ArchivedEditor` take
   `typed` / `onTyped`; `err` and the Delete arm stay local. §29: the fold, his search, a search that finds nobody then
   cleared, a Filter tick, Save name keeping the date he picked. Pins: Cancel throws it away; one man's typing never in
   the next man's.
4. **The leave-guard's reports come from the page.** `rowWork(pid, on, typed)` → `useRowReports` in `UsersPanel`; the
   literal lines `useGuardWork('userrow', …)` and `useGuardWork('archrow', …)` kept in `UsersPanel.tsx`; the editors no
   longer report; a short row counts by the same test as its "not saved" mark; the archived box compared trimmed; a
   hidden row still counts. §30 (incl. the Addendum's B2).
5. **A bell landing for another man closes a stale row silently.** `useRingLanding` returns `closedNow`; the page treats
   the row as closed in that draw. §31 (plain and strict). Pin: a landing for the very man whose row is open — note once.
6. **A short row with a pick whose man can no longer be sent it.** `pickOnMaster` joins `rowChanged` for a short row
   (note on a draw and at Save); at Save a pick whose sign-in is no longer his closes with the note and sends nothing.
   §32. Choice: a sign-in simply GONE is still followed on a draw without a note (the round-3 pin kept); the note comes at
   Save.
7. **§20 tightened.** Both editors' props pinned (declared, handed, read); the name check covers `rowLocks`,
   `SquadronLines`, `lineState`; the comment says what it still does not prove; the Fable reader's two roads (E1, E2)
   planted and seen caught. The two "(a)" lists re-pointed (`useGuardWork`/`typedDiffers` leave the whole row's list,
   `useGuardWork` leaves the archived list, `Typed` joins it) — names unchanged.
8. **A short row put away whose man leaves the list never comes back open.** `SeenAt.at` (his search, ticks, fold when
   the row was last on the page); `stillListed` asked only of a row out of sight at the last draw; if not listed, the
   row closes, no note. §33 (D1, D1b, D2). Pins: on the page when the Undo lands → note once; put away and brought back
   unchanged → still open; a man found only by the search; a whole row and an archived row put away whose man leaves;
   a row its OWN write took off the list (Save name) still held. **The reader's fix as written broke a round-3 pin (the
   row's own Save name taking it off the search raised the note); narrowed as above — that pin is green again.**
9. **"Give access" reports only while its request still waits.** One change in `Waiting()`. §34 (B3, B3b); pin: while
   the request waits, the changed form counts.

## Checks run (one file at a time; all green unless said)
rejudge5 83 · rejudge4 110 · rejudge3 39 · rejudge2 52 · rejudge 23 · row 15 · asis 24 · users-row 7 · s2-lists 14 ·
users-filter 24 · guard-g 14 · guard-asis 29 (+4 todo) · onedoor-users 22 · accounts-ui 21 · accounts-newperson 26 ·
postout-landing 4 · edit-rights-readers 4 · quals 83 · noteswords 120 · msq-s2-plan 4 · msq-s2-order 14 ·
msq-fix2-users-moved-admin 1 · msq-fix3-users-one-save 3 · msq-squadrons-panel 17 · rolestable 12 · adminclear 15 ·
msq-admin-config 3 · msq-clear 6 · msq-fix3-admin-panel-undo 4 · reshape-b2-no-guest-switch 3 · roster-readers 3 ·
msq-bell-tap 12 · admin 5 · memberview 7 · odds 17 · inputsfor-readers 3 · unit-setting-guard 3 · vconf-readers 2 ·
toastblocked 10 · msq-guard-note 55 · msq-guard-input-sqn 4 (+1 todo). Type check exit 0. Document check OK.
**The core's two files:** `msq-guard-rollcall` 29 pass. `msq-guard-open`: run whole, 337 of 341 passed, then the test
worker died "JavaScript heap out of memory" (~19 min); no test failed; the last four pass alone, `-t "userrow"` 9 pass —
all 341 seen passing across two runs, never in one; whether it ran out of memory before this round: not checked.
**The readers' proofs on the changed code:** security 1–5 (24/24, 9/9, 5/5, 8/8, 4/4), opus 4/4, astra-3 2/2, fable-0
7/7, fable-1 8/8, fable-3 3/3. Three fail as written for reasons outside the fix: astra-1 (expects the note with a
straight apostrophe; the app's is curly — no door called, the row closed); astra-2's search case (expects the fold open
after the search is cleared; as built the cleared search shuts it — the row is held and both boxes are there once the
fold is tapped, §29); fable-2's E1/E2 (a copy of the OLD name counter inside the proof — the lasting versions are §20).
**The code check (`npm run lint:changed`, it did compare with `origin/main`):** exit 1, 59 new findings on the whole
branch, 55 in other chats' files; in `UsersPanel.tsx` four — high control-flow complexity in `PersonRow`,
`useOpenRowJudged`, `UsersPanel`, and "state adjusted after a prop changes" on the `openNew` effect (chat 204's fix of
that one is on the batch branch). `PersonEditor` no longer named. Against this branch's last commit: no new finding.
Not run: the build, the full suite, browser tests, the running app.

## What a person would see differently (no new words)
An admin suspended, archived, deleted or made a member by another admin: his open row closes with the existing note and
writes nothing; a press afterwards opens nothing and the app shows what his account now gives. An archived man's row
keeps the typed callsign and date across the fold, a search and a Filter tick. A short row put away whose man left the
list is closed when brought back (no note). A bell tap for another man closes a stale row quietly. A short-row pick on a
man made master admin closes with the note. Save name no longer renames a deleted man. The leave-guard counts an
unsaved short row and rows out of sight, and stops counting Give access once its form is gone.

## The builder's choices
"Required" applies to any session with an account behind it — the localhost developer route that forces the admin role
onto a member account can no longer open rows (no test or browser test does that). Fix 6 and fix 8 as above. After
Save name the box keeps exactly what he typed (a trailing space stays), compared trimmed. A press that opens nothing is
silent (apart from the repaint on a lapsed session). Every key in an archived row's two boxes now redraws the whole
list, as the whole row's have since round 4 — not measured in a browser.
