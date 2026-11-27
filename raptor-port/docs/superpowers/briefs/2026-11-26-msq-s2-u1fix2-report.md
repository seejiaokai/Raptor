# S2 step U1's second fix round — the builder's report (a Fable helper, for chat 205, 26 Nov 26), saved by the host from the builder's reply

Brief: `2026-11-26-msq-s2-u1fix2-brief.md`. Branch `claude/msq-s2-users-685735`. Built tests first; reviewed by the
orchestrator (the diff read, the tests re-run) before the commit. **A permissions change: the four readers' read of
this round and the walk are owed.**

## Files

- `src/ui/UsersPanel.tsx` — the only app file.
- `src/ui/msq-s2-rejudge2.test.tsx` — new, §6–§11 (split from the first file, which would have passed 1,200 lines).
- `src/ui/msq-s2-rejudge.test.tsx`, `src/ui/msq-s2-row.test.tsx` — headers only; no test changed.
- `docs/file-map.md` — one paragraph for the round's two files.

## What changed in the app

1. **The held judgement knows more.** `OpenedOn` is `{ unit, short, home, arch, view }`, built in one place
   (`judgedNow(pid)`) at the press. `rowChanged` is true when the page's squadron, short-or-whole, his home, or
   archived-or-not no longer holds. Handed whole (`on`) to all three editors; `{ unit, short: false }` is gone. The
   squadron in view (`view`) is held for item 5 and is no part of `rowChanged`, so a View-only pick leaves the row open.
2. **The archived man's row gets the belt.** `ArchivedRow` takes `openOn` and draws its editor only with it.
   `ArchivedEditor` asks again at the head of Restore / "Restore as", Save name and Delete (both taps). Judged against
   the judgement as held at the press, so pins B1 and B2 still pass.
3. **An editor judges itself on its own draws — the brief's first form.** One hook, `useJudgedOnDraw`, in all three
   editors: on every draw it asks `rowChanged`; where true the editor draws nothing and, in a layout effect, asks the
   page to draw again; the page's own judging then closes the row and raises the note by its one rule. The note has
   one home, so it cannot be said twice; under strict mode the page is asked twice and the second draw finds the row
   closed (tested: once). The callback handed down is one stable function, so the effect cannot loop.
4. **The open short row shows the line he holds today.** `ForeignEditor` reads his account, his line and his home
   squadron's number on every draw and holds only `picked`. "Not saved" is "picked, and differs from the line he holds
   now". Save reads the held line once more and sends only a pick that differs from it. The row stays open across such
   a change. The editor reads the account itself, so it no longer takes `a` or `callsign`.
5. **The note is owed whenever he did not pick.** `closedByHisPick`: the page's squadron is no longer the row's, the
   squadron in view is no longer the one held, and `state/typing-hold.ts enteredByPick()` is true. No core file edited.
   **One line beyond the brief, kept on the host's call:** on every draw the row survives, the page holds the squadron
   in view again — so a row that survived a View-only pick and is closed later, with no pick, by the page becoming
   that squadron's another way (his own move there, a master admin giving him Plan of it) still gets the note. Two
   tests prove it. The "rare case" is thereby closed on the page's side; nothing is asked of the core (chat 204 had
   declined a pick counter; none is needed).
- One shared belt, `askAgain(pid, on, onClose)`, for the whole row's five writes, the short row's Save and the
  archived row's four. The comment above `ForeignEditor` rewritten. No new words: the only note is
  `changedWhileOpenWords`.
- **After the host's review (a third small pass):** a man DELETED under his open row closes it with no note, as before
  this round — "Open it again." would be untrue of a man who is gone; archived or restored under it keeps the note.

## Each reader's case — failed before (on eda4bd991), passes after

Seen first on the code as it stood: 34 failed, 10 passed (the 10 are pins). After: all pass.
Fable 1 (Delete armed on 149's page; Restore; Save name) · Astra 1 with security 1 (Delete armed on 142's own page) ·
security 1 (Restore by Hunter; Save name of a man with no sign-in) · Fable 3 (1)–(3) (a move 142 → 150 under the short
row: the line, the Save, the no-sign-in words) · Astra 4, re-pointed (the row closes, the note once; opened again it
names 150) · Fable 4 with the security read's "one more face", re-pointed (the row closes with the note; nobody
pressed his archived row, so none of its editor is drawn) · Astra 2 (typing after his move landed unseen) · Fable 3
(4)–(6) (Mako given View under the open row; then Save; his own Undo) · Opus 2, re-pointed (the row shows None, its
Save sends nothing) · Fable 2 (1) with Opus 1 (Plan of 149 taken away) · Fable 2 (2) (Plan lowered to View) · Fable 2
(3) (Hunter's own move at midnight) · Astra 3 (a master admin's own move at midnight) — each failed for the reason its
report gives. Pins that passed before and after: security's pin 1 with Fable's soundness 7; Fable's soundness 1–6, 8.

## Tests

All in `src/ui/msq-s2-rejudge2.test.tsx`, plain-word names, `asOther` for another admin's write. Merged where two or
three readers proved one case (named once in the title). No first-round test re-pointed or weakened —
`msq-s2-rejudge` (23) and `msq-s2-row` (15) pass unchanged. Added by the builder, each seen failing first: Delete's
first tap; "Restore as"; the short row's Save after a move 142 → 150 with no redraw; a whole row whose man another
admin archives; an archived row whose man another admin restores; a squadron line picked in the whole row after an
unseen landing, and the same on the short row and the archived row's callsign box; strict mode on Astra 2; Save sends
the admin's own pick and only that; a pick another admin has already made true is no longer marked; Save reads the
line once more with nothing redrawn; the two "survived a View-only pick" tests.

## Checks run by the builder (from `raptor-port/`, one file at a time)

28 files, 438 tests, all pass: `msq-s2-rejudge2` 44 (48 after the third pass) · `msq-s2-rejudge` 23 · `msq-s2-row` 15 · `msq-s2-asis` 24 ·
`msq-users-row` 7 · `msq-s2-lists` 14 · `state/msq-s2-plan` 4 · `state/msq-s2-order` 14 · `msq-guard-g` 13 ·
`msq-guard-rollcall` 17 · `accounts-newperson` 26 · `accounts-ui` 21 · `msq-fix2-users-moved-admin` 1 ·
`msq-fix3-users-one-save` 3 · `msq-squadrons-panel` 17 · `msq-users-filter` 24 · `onedoor-users` 22 · `rolestable` 12
· `adminclear` 15 · `msq-admin-config` 3 · `msq-clear` 6 · `msq-fix3-admin-panel-undo` 4 · `postout-landing` 4 ·
`reshape-b2-no-guest-switch` 3 · `engine/roster-readers` 3 · `state/edit-rights-readers` 4 · `msq-bell-tap` 12 ·
`quals` 83. Type check of the app's files: exit 0 (supporting only). Document check: OK. The changed-code check could
not read `origin/main`'s side — not run in effect (`useLayoutEffect` is new to this file). Not run by the builder:
the build, the full suite, the browser tests, any look at the running app.

## What a person sees differently (no new words)

The open row closes with the existing amber note in more cases: his move from one other squadron to another; he is
archived or restored by someone else while his row is open; the page's squadron changes without the signed-in
person's pick (his Plan taken or lowered, his own move at midnight, Plan given of a squadron he was only viewing);
typing in a row after a move landed with nothing redrawn. On an archived man's row, Restore, "Restore as", Save name
and Delete give that note and close the row, doing nothing, where the row changed under it. An archived row never
stands open by itself after someone else archives him, nor a whole row after someone else restores him. The open
short row's line follows a change made under it.

## For the next builder in these tests

- The spy in the new test file reads every other name from the real accounts module each time; the first-round
  file's spy copies the module once, which leaves the permission checks reading the seeded accounts list — a master
  admin made inside a test there is not one to them. Know this before a later test in the first file makes one.
- `asOther` has a side effect in the test world: a door called as another person notifies while "he" is signed in, so
  the app's midnight check enters his home and comes back at the next draw; where the signed-in master admin had
  picked another squadron first, the page ends on 142.
- `PersonRow`'s own `!foreignHere` guard is left as it was (the Opus read's tidiness note on it, filed not fixed).
