# S2 step U1's tenth round — the builder's report (an Opus helper, 27 Nov 26; saved by chat 205 from its reply)

Brief: `2026-11-27-msq-s2-u1fix10-brief.md`. Status: READY FOR INDEPENDENT REVIEW. Nothing committed, staged, pushed or built; no lock; no `zz-` file left.

## Each fix — failed before, passes after (`src/ui/msq-s2-rejudge10.test.tsx`, 21 tests; on the old code 13 failed, 8 passed)
- **A — a press after the man left the list (§60):** security proofs 2, 2b, 2c and Astra 1 (strict false/true) failed → pass; the controls ("control", "control 2b", "control 2c", "as built … Saber FINDS Hunter by search … GIVES View") green before and after; "pin: a line pressed on the screen still standing…" green before (the draw already closes it), kept as a pin.
- **B — a refused press beside a row that left the list (§61):** opus2 proof 1, Astra 2 (strict false/true) failed → pass.
- **C — the master admin's None (§62):** opus2 proof 2 "Kestrel presses none" failed → pass; the "view" case green throughout.
- **D — the press keeps its receipt (§63):** opus2 proof 3, opus1 proofs 2, 3, 4 failed → pass; two new controls pass (a writing press with no other open work: its receipt alone, once; a whole row's Save: "Saved" alone, once). The waiting bell-line case (opus1 proof 1) is not in the file.

## What was built (`src/ui/UsersPanel.tsx`)
- **A:** `askAgain(pid, on, onClose, listed, t?, day?)` true only when the judge says ok AND `listed(pid)`, else `onClose(true)` — Save, Suspend/Enable, Give sign-in, Archive, Delete, Restore, Restore as, Save name, the short row's Save. The short row's line press: `if (rowChanged(...) || !p.listed(p.pid)) { p.onStale(); return }`. Page `listedNow(pid) = rowInView(usersView(pageUnit('own'), todayIso(), q, filt, actorIsMaster()), pid, archOpenNow)`, passed as `listed` through `PersonRow` / `ArchivedRow` to the three editors.
- **B:** `otherAtPress(e, x: PressAt)` judges the other work as the draw does: the judge; then, for a row the judge keeps, `left` (on screen at the last draw and not listed now → closes with the note); then `lost` (`stillListed` false → closes silently). `closedAtPress(w, pressed, x)` uses it; the pressed always closes and is named first.
- **C:** `putBack = !!fresh.a && fresh.a.id === a.id && fresh.rolePick !== 'master' && v === fresh.line`.
- **D:** a plain function `pressPaths(work, setWork, setSeen, x)` beside `closedAtPress` holds `dropWork`, `closeFound`, `afterWrite`, `closeRow`, `closeGive`, `rowWrite`, `giveWrite`. `afterWrite(pressed, write)` runs inside `HOOKS.toastBatch`: `write()` (its receipt or the door's words, its own close), then the other slot judged with `otherAtPress`, dropped with a functional `setWork` keyed on the man or request, its note in the same batch. Every writing press goes through it (whole row Save, Suspend/Enable, Give sign-in, Archive, Delete second tap; short row Save; archived Restore, Restore as, Save name, Delete; Give access's `go`); editors get an `afterWrite` prop, `GiveForm` through `Waiting`. Moved out of `UsersPanel` because the code check flagged the component as too large; clean after.

## Re-points
`msq-s2-rejudge4.test.tsx` §20: `WHOLE_PROPS` and `ARCH_PROPS` gain `listed` and `afterWrite`, by name (page functions, never a value of the man; reason in the comment). Before: 2 failed ("(a2)"); after: 110 pass.

## Files run, one at a time, after the final code (and once before the move out of the component)
rejudge 23 · 2 52 · 3 39 · 4 110 · 5 83 · 6 21 · 7 14 · 8 32 · 9 15 · 10 21 · msq-s2-row 15 · msq-s2-asis 24 · msq-s2-lists 14 · msq-users-row 7 · msq-users-filter 24 · msq-guard-g 24 · msq-guard-rollcall 38 · msq-guard-note 58 · msq-guard-asis 29 (+4 todo) · msq-guard-doors 125 (+1 todo) · msq-guard-doors-switch 104 · msq-guard-doors-bell 76 · onedoor-users 22 · accounts-ui 21 · accounts-newperson 26 · postout-landing 4 · admin 5 · msq-bell-tap 12 · state/edit-rights-readers 4 · msq-guard-open `-t "userrow|archrow|giveaccess"` 23 (318 skipped) — all pass.
Security pins: fixread6 1 8/8, 2 2/2; fixread7 1 8/8, 2 2/2, 3 2/2; fixread8 1 11/11; fixread9 1 8/8, 2 7/7 (was 3 failing). Ninth-read proofs: Astra 1 2/2, 2 2/2; opus2 1 1/1, 2 2/2; opus1 2 2/2, 4 1/1; opus2 3 — 1 failing on purpose (below).
`npx tsc -p tsconfig.app.json --noEmit` 0; `npm run lint:changed -- --base HEAD --include-untracked` "no new finding (25 changed files)".

## What a person sees differently
- After another admin's change takes a man off the list, a Save / Suspend / Archive (etc.) on his still-open row writes nothing; the row closes with "<callsign>’s row changed while it was open, so nothing was saved. Open it again." (before: the press went through).
- A press that writes and also closes the other open work says both on one line, receipt first ("newface@mail can sign in now · Drifter’s row changed while it was open, so nothing was saved. Open it again."); before, only the second half showed. The whole line takes the note's amber, the batch using the strongest colour any part asked for.
- A refused Give access beside a row that left the list shows both notes, Newface's first.
- None on the row of a man made master admin unseen closes the row with the note instead of doing nothing silently.
- No new words.

## Unclear, and what was chosen
- opus2 proof 3 asserts the row's note is never said over a successful write; the brief's D says "receipt first, then note, one line" — the brief followed; the reader's file still fails its last check (its first check, the receipt on screen, passes). Whether his own act should close the other row silently is a wording question.
- Short row Save goes through `askAgain`, so not listed → `onClose(true)` (closes with the note in the press's batch, the other judged) rather than `onStale()` — the same on screen.
- Refuse on the waiting list is not routed through `afterWrite` (not open work, not on the list, changes no open row).
