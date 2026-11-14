# Walk of the checking tools — 14 Nov 26 (overnight job 3, branch `claude/check-tools-1114`)

Checking tools only; the app is unchanged. Built with `npm run build`, served with `npx vite preview --port 4321`, driven by
`scripts/handpass/check-tools-walk.mjs` (Chromium; desktop 1536x864, phone 402x874; signed in as the admin).
Pictures and raw outputs: `docs/img/handpass/2026-11-14-check-tools/` (`walk-run.txt` is the script's full output).

## 1. A fixed list, ringed with a tag — PASS
The bell's list is `position: fixed`. Marked with the tag "the bell list"; box measured before and after.
- Desktop: before `878,50,348,62`, after `878,50,348,62` — same. Tag placed inside (above would be cut by the window). (Fix round: now above — §Fix round.)
- Phone: before `8,46,386,62`, after `8,46,386,62` — same.
- Pictures (opened and looked at): `s1-pc-bell-list.png`, `s1-ph-bell-list.png` — the list in its place under the bar, ring pink, tag whole, "Nothing new" unmoved.

## 2. A part inside a panel that hides overflow (the Scheduler Board's OIL Earn button, Saturday) — PASS
The board is `overflow: clip/clip` (`div#schedBoard`).
- Unpinned: mark ok, tag moved to "above" (it fits), box before/after the same `971.5,66,95.8,28`. Picture `s2-pc-oil-unpinned.png`: ring pink round OIL Earn, tag "OIL Earn" whole above it.
- Pinned `place:'above'`, `strict:false`, on OIL Earn: above fits, so it was NOT refused (correct, nothing cut). To reach a refusal I repeated it on the board's first six buttons: the one at the panel's top edge (nth 0) was refused, the others fine. Message, quoted:
  `the tag on #schedBoard button is not wholly visible anywhere it was tried — above: cut off by div#schedBoard.schedboard`
  (ok:false, no tag left behind: tagsLeft 0). `s2-pc-oil-pinned-refused.png` is a plain screenshot with the helper's marks cleared (not a marked picture).
- The flying wave's panel at 821 wide was not used (MISSING, below); the board's panel stood in.

## 3. A redraw, then the picture is refused; clear leaves nothing — PASS (with a note)
- First redraw try: pressing OIL Earn did not replace the button node, so the mark survived and the picture was (correctly) taken: `s3-pc-mark-survives-press.png` (ring still on OIL Earn, now green/on). Not a fault.
- Second redraw: mark placed, board closed and reopened (the app redraws the button). `shot()` refused, message quoted:
  `drawmark: picture refused — mark "OIL" on #sbOil: its part was redrawn and the mark is gone — mark it again just before the picture`
  and no file was written.
- After `clear()`: `[data-drawmark-tag]` count 0, `[data-drawmark-ring]` count 0 (also 0 after the second clear). The app still works: pressed OIL Earn, the bar came on/off as before (`s3-pc-app-still-works.png`; `s3-pc-after-redraw-plain.png`).

## 4. A page error is printed and logged — PASS
`setTimeout(() => { throw new Error('walk-probe') })` gave, in the run output and in `drawmark-log.txt`:
`[page error] walk-probe` (with a time stamp). `dm.errors` held it; the log file contains it. (It printed twice in the log, once per watcher on the page — the helper plus the extra helper made in step 2 — noted, harmless.)

## 5. The rule check — PASS
- `npm run rulecheck`: `rulecheck OK` — 863 test files, 333 rulings, 301 named by a test, 32 named by nothing (all baseline, OR20 among them). (`rulecheck-1-green.txt`)
- With "(OR29)" removed from the title at `src/leavewar/onerecord-write.test.ts` line 208: exit 1; quoted: `named by nothing: 33 (… OR20, OR29)`, `OR29 — the only named person beside ALL AVAIL / ALL reads it and may take himself out, never changes it (D770)`, `Name the rule in a test ("... (OR29)"), or add it to BASELINE with a reason.` (`rulecheck-2-red-OR29.txt`)
- Restored with `git checkout --`; `git status` shows nothing under `src`; rerun `rulecheck OK`, 32 named by nothing. (`rulecheck-3-green-restored.txt`)

## 6. Self-tests — PASS
`node scripts/handpass/drawmark-selftest.mjs`: all 16 PASS (exit 0). `node scripts/drawcheck/selftest.mjs`: all 16 PASS (exit 0). (`selftest-drawmark.txt`, `selftest-drawcheck.txt`)

## 7. Plain-user round — PASS
Signed in, bell opened (`s7-pc-bell.png`), Edit Schedule (`s7-pc-editsched.png`), the Saturday board (`s7-pc-board.png`), the Leave War (`s7-pc-leavewar.png`), signed out to the sign-in form (`s7-pc-signed-out.png`). Nothing looked or behaved oddly; page errors during both runs: none (the probe's own excluded).

## Faults in the tools
None found.

## MISSING
- The flying wave's panel at 821 wide on Edit Schedule (the board's panel was used for the clipped-panel steps).
- The plain-user round on the phone beyond the bell list (side menu, Edit Schedule, board, Leave War on a phone not walked).

## Fix round (14 Nov 26, after the two blind reads)
The reads: `docs/superpowers/briefs/2026-11-14-check-tools-read-{brief,astra,opus}.md`. Each finding was made a failing
test or a caught mutant before its fix; the outputs are in the pictures folder, named `fixround-*`. The helper as it was
before is kept outside the repo; `DRAWMARK=<file> node scripts/handpass/drawmark-selftest.mjs` runs the new self-test on
any copy.

| Finding | Reproduced? | Red before | Fix | Green after |
|---|---|---|---|---|
| A. OR26 on a test that did not hold it | yes | the guard in `commitInput` set to `if (false)`: the old OR26 test (groupinput) stayed green, only an untagged test failed (`fixround-or26-mutant-before-move.txt`) | "(OR26)" moved to `inputedit.wire.test.tsx`'s "a member never hands an input to another person"; register rows corrected | the same mutant now fails the OR26 test (`…-after-move.txt`); guard restored, 36/36 (`…-restored.txt`) |
| B. OR15's tagged tests hold the saved answer, not the earning | yes, by reading: no earning check in either tagged test; the earning lives in the engine, which no mutant may touch | — | "(OR15)" written on `oilclaimrow.test.tsx`'s credit-pass cases (a Yes earns for the man added; a No or no answer for none); OR15 marked "in part", "one claim an input" left to the engine's tests | rulecheck OK |
| C. register wording (OR4, OR8, OR11, OR51, OR52) | yes: OR51's test asserts the war's "LL approved" line; OR52's sick-leave test asserts nothing for him; D778's row gives seven kinds | — | rows rewritten to the rulings and tests | — |
| D. OR20's instruction four times; the column and the table disagreeing | yes: a script compared the table with the test files — 5 rows disagreed (OR2, OR15, OR25, OR26, OR41) | — | the instruction kept on its register row and rulecheck's baseline comment, pointers elsewhere; table and column made to agree; one line says the table is the record | 0 disagreements |
| E. the tag as the part's child changes how the app draws | yes | `:last-child` green → black; `:empty` dash gone; tag inside the part (`fixround-drawmark-selftest-vs-old-helper.txt`) | tags in one layer of the helper's own, outside the app's tree (a child of `<html>`); chosen over checking children's looks because nothing then reaches the app's rules at all, and a check could only catch the cases it knows | green |
| F. scaled clipping measured wrong | yes | a half-size panel and a zoomed one: NOT REFUSED | clipping measured on the screen from the part's own clipping ancestors, scaled by how the panel is drawn | refused, naming the panel |
| G. addClass bookkeeping | yes | refusal took the part's own "hl" off; clear() left the added class | only the classes the mark added are recorded and taken off | green |
| H. hide with a missing `within` | yes | NOT REFUSED; the toast hidden | one lookup for `within`, shared with mark; a missing one refuses | green |
| I. an invisible mark passes | yes | NO FAULT for a parent at opacity 0, nor a hidden part | one test of "shown" (an ancestor's opacity counted) in check and shot | refused |
| J. a refused second mark strips the first | yes | the first ring stripped; check said "redrawn" | one mark a part, refused before anything is touched | green |
| K. the self-test's gaps | yes: the `blockOf` mutant (`return el.parentElement`) passed the old 16 | the old helper fails 12 of the new 32 | the new cases above, plus a fixed part in a clipping panel and a panel scrolled after the mark | 32/32; the `blockOf` mutant now fails one (`…-vs-blockof-mutant.txt`). The scrolled-panel case was already refused before (its box check) — kept as a guard for the new layer |
| L. the drawing check excused any pink | yes | an ordinary pink border and shadow, not marked: no difference (`fixround-drawcheck-selftest-vs-old-compare.txt`) | excused only on a part the drawing marked: the measure records the helper's ring on it, or a spec part says `marked: true` for an older drawing | 18/18 |

The older M5b drawing (its heading's inline pink ring) carries no `marked` flag, so it is no longer excused by colour;
its spec already leaves `shadow` out of that part's checks, so nothing changes for it.

**The walk again** (built, served on 4321 after the lock was found free, stopped after): all 7 steps pass as before;
`walk-results.json`, `walk-run.txt` and the pictures rewritten under the same names. One change: the bell list's tag now
stands **above** the list (it was inside) — the list's own clipping no longer counts for a tag outside it, which the
layer makes right; the cropped pictures show the tag whole over the top bar, pointing at the list. Step 2's refusal now
reads "above: div#schedBoard.schedboard cuts its part off there". Self-tests: helper 32/32, drawing check 18/18.

Walk: docs/handpass/2026-11-14-check-tools.md · 12 pictures (6 rewritten in the fix round, the rest taken again byte for byte the same) · 5 surfaces (bell list, Edit Schedule, Scheduler Board, Leave War, sign-in) · MISSING: flying wave panel at 821 wide; phone plain-user round beyond the bell list
