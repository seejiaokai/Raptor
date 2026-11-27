# S2 step U1's ninth round — the judge's press paths: the builder's report (an Opus helper, his D2819; for chat 205, 27 Nov 26), saved by the host from the builder's reply

Brief: `2026-11-27-msq-s2-u1fix9-brief.md`. Tests first. **The read of this round and the walk are owed.**

## Built (`src/ui/UsersPanel.tsx`)
- **A.** A press that finds its work changed hands the close to the page (`onClose(true)` from `askAgain`, `giveAsked`
  and the short row's Save; `saidChanged` removed — no press path calls `HOOKS.toast` directly). The page's `closeRow` /
  `closeGive` take an optional `found` flag → `closeFound`, using the plain helper `closedAtPress(work, pressed,
  rowOnScreen)`: one functional `setWork` drops every entry no longer as started, `sayChanged` says all their notes once
  (the pressed first). Kept: the pressed entry always says its note (a deleted man's row too); work out of sight or an
  unchanged Give access closes silently (`noteOwed`); the door's own words for a request already gone. Each editor's
  `onClose` typed `(found?: true) => void` inline (no new name for rejudge4 §20); the four Cancel buttons call
  `() => p.onClose()`.
- **B.** The short row's line press judges the row first (holding the pick), then reads the line he holds fresh from the
  store; the pick is let go only when he presses that fresh line on the same sign-in the screen showed, otherwise kept;
  the pick is always made on the sign-in the screen showed (a first draft made it on the fresh sign-in — the security
  pin fixread6 proof 1 caught it; a lasting test now pins it).
- New `src/ui/msq-s2-rejudge9.test.tsx` (15 tests, §50, §51); `docs/file-map.md` one line.

## Failed first
rejudge9 on the code as it stood: 11 failed, 3 passed (the controls). After: 15/15. §50 (A): Astra 1 ×4 (`#accEdSave`,
`#apvGo`, strict off and on), opus1 F1 ×2, opus2 F1 ×2, the builder's "the row pressed while the changed form's request was
answered by another admin, nothing redrawn: both sentences on screen, once each"; controls (one changed row alone; one
changed Give access alone; an unchanged Give access beside a changed row goes silently). §51 (B): Astra 2 ×2; the pin "no
pick made; Ranger's sign-in put on another man and a new one given him with View of 149, nothing redrawn; None pressed
on the old screen, then Save: neither sign-in written, the note".

## Re-points: none (rejudge4 §20's lists unchanged, 110 green).

## Checks (builder, one file at a time, final code)
rejudge 23 · 2 52 · 3 39 · 4 110 · 5 83 · 6 21 · 7 14 · 8 32 · 9 15 · row 15 · asis 24 · lists 14 · users-row 7 ·
users-filter 24 · guard-g 21 (+1 todo) · guard-rollcall 29 · guard-note 58 · guard-asis 29 (+4 todo) · guard-doors 125
(+1 todo) · guard-doors-switch 104 · onedoor-users 22 · accounts-ui 21 · accounts-newperson 26 · postout-landing 4 ·
admin 5 · msq-bell-tap 12 · edit-rights-readers 4 · msq-guard-open `-t` 23. Security pins: fixread6 1 8/8, 2 2/2;
fixread7 1 8/8, 2 2/2, 3 2/2; fixread8 1 11/11. Type check 0; code check against HEAD no new finding; docsize OK.
**The host re-ran** rejudge9 15, rejudge8 32, rejudge4 110, guard-rollcall 29, edit-rights-readers 4 — green.

## What a person would see differently (no new words)
Two works closed by one refused press show both sentences on one line, the pressed first. On the short row a line pressed
after another admin's unseen change keeps his choice, and Save sends it.

## The builder's choice
The other entry is judged with `'draw'`, not the brief's `'press'`: the only difference is whether Give access's request
still waits — a request already gone is the door's to say only at that form's own press; with `'press'` a row pressed
while the changed form's request had been answered left the form open and the next draw's note replaced the row's (the
same fault) — pinned by the builder's own test.
