# S2 step U1's sixth round — the builder's report (an Opus helper, his D2819; for chat 205, 27 Nov 26), saved by the host from the builder's reply

Brief: `2026-11-27-msq-s2-u1fix6-brief.md`. Tests first. **The read of this round and the walk are owed.**

## Files
`src/ui/UsersPanel.tsx` (fixes A, B, D, E, and the coordinator's comment above `useGuardSection('users', …)` — now naming
the open row on Users, "Add a person" and "Give access"; comment only); `src/ui/AdminPage.tsx` (fix C only);
`src/ui/msq-s2-rejudge6.test.tsx` (new, 21 tests, §35–§39); pins re-pointed in `msq-s2-rejudge3` §15 and
`msq-s2-rejudge4` §21, `msq-s2-rejudge5` §32's header corrected; `docs/file-map.md`. `docs/data-schema.md` unchanged (no
stored fact changes).

## Failed before
rejudge6 against HEAD's `UsersPanel.tsx` and `AdminPage.tsx`: 14 failed, 7 passed (the 7 "pin:" tests). After: 21 pass.

## The fixes
- **A** — `pickOnMaster` became `pickCannotGo`: "changed" when a pick exists and his account is gone, is another
  account, or he is now a master admin; `rowChanged` uses it on every draw as at Save; the page's rule decides the note
  (on the page: once; put away: silent). §35 (plain and strict; a new sign-in given after; one person's own Undo / Redo;
  a row put away). Pins: no pick → follows the sign-in live, no note; the master admin case closes with the note.
- **B** — `pickNowHeld`: in `useOpenRowJudged`'s keep-open branch a pick equal to the line he holds now is let go (the
  hook is handed `setTyped`); after A's check, on every page draw, out of sight too. §36.
- **C** — `AdminPage.tsx`: the landing taken while drawing, in a hook of its own `useAdminIntent` (the pattern of
  `useOpenRequest`); only `clearAdminOpen()` stays an effect (run only when the record's number is the one taken); the
  ring's timer and scroll unchanged. A first version raised a complexity finding in `AdminPage`; gone after the move.
  §37 through `openAdminUsers` with the whole App, plain and strict. Pins: a landing on the very man whose row changed
  unseen closes with the note once; with nothing changed the row stays open with its typing.
- **D** — `shownNow` in `rowChanged`: for an archived row whose typed date differs from the copy's, the fresh read takes
  the copy's date before comparing; `ArchivedEditor`'s own judging and `askAgain` handed `typed`; `useNoteAsPageGoes`
  keeps `typed`. §38 (on the page; in the shut fold; Restore after midnight on his date and callsign). Pins: a date
  picked then picked back to today closes at midnight with the note; untouched closes (rejudge4 §19).
- **E** — `Waiting`, while drawing: `if (open && !live) { setOpen(null); setOpened(null) }`. §39; pin: while the request
  waits, the changed form counts.

## Pins re-pointed
- rejudge3 §15: "pin: his sign-in moved to another man under his open short row, a pick made — the row falls back to the
  words and Cancel alone…" → "…a pick made — the row closes with the note, once: nothing can be sent for him or for the
  other man" (the old pin held the silent drop fix A closes).
- rejudge4 §21: "a pick is his for the sign-in it was made on: … the row shows the new sign-in's line untouched, and Save
  sends nothing" → "… the master admin puts Ranger's sign-in on another man — the row closes with the note, once; he is
  given a new one: nothing of the pick is carried onto it, and nothing is sent" (still reopens, checks the new line, no
  "not saved", Save sends nothing).
- rejudge5 §32's header corrected; no test changed.

## Readers' proofs after
Passing now: astra-2 (2/2), opus1-3 (1/1), opus2-2 (2/2), opus1-1 1a. Four still fail because of how the proof is
written: astra-1 (counts the note with a straight apostrophe; the app's is curly — §35 counts the app's words); opus1-1
1b (clears its note count before a second redraw — the note came on the first); opus2-1 1b (a placeholder assertion
that can never match — the real result, closed with the note once after the Undo and closed after the Redo, is pinned
in §35); opus2-3 (asserts "held and counted" on 142; the brief chose "thrown away"). Security pins 9/9, 2/2.

## Checks (one file at a time, from `raptor-port/`; all green)
rejudge 23 · rejudge2 52 · rejudge3 39 · rejudge4 110 · rejudge5 83 · rejudge6 21 · row 15 · asis 24 · users-row 7 ·
s2-lists 14 · users-filter 24 · guard-g 15 · guard-rollcall 29 · guard-note 55 · guard-asis 29 (+4 todo) · onedoor-users
22 · accounts-ui 21 · accounts-newperson 26 · postout-landing 4 · admin 5 · msq-bell-tap 12 · edit-rights-readers 4 ·
security pins 9 + 2 · msq-guard-open `-t "userrow"` 9, `-t "giveaccess"` 7. Type check exit 0. Document check OK.
Code check: against `origin/main` it timed out (React Doctor over 600 s, exit 2 — not compared); against the last
commit: "no new finding (6 changed files read against HEAD)".

## What a person would see differently (no new words)
A short row with an unsaved pick closes with the usual note when that man's sign-in is moved or taken (silent if he had
put it out of sight). A pick made pointless by another admin's change leaves the row reading untouched. A bell tap
landing on another man no longer raises the note over a row changed unseen. An archived row with a hand-picked post-in
date stays open across midnight. A half-filled "Give access" form is gone after a pick of another squadron and back.

## The builder's choices
B in the page's judging only (the short row's editor has no state of its own). D compares only the post-in date with
what he typed (the callsign box's opening value does not depend on the clock). C clears the record only when its number
is the one taken. A test that had failed on the old code lost "pin:" from its name; one that held already gained it.
