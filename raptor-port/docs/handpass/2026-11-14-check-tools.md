# Walk of the checking tools — 14 Nov 26 (overnight job 3, branch `claude/check-tools-1114`)

Checking tools only; the app is unchanged. Built with `npm run build`, served with `npx vite preview --port 4321`, driven by
`scripts/handpass/check-tools-walk.mjs` (Chromium; desktop 1536x864, phone 402x874; signed in as the admin).
Pictures and raw outputs: `docs/img/handpass/2026-11-14-check-tools/` (`walk-run.txt` is the script's full output).

## 1. A fixed list, ringed with a tag — PASS
The bell's list is `position: fixed`. Marked with the tag "the bell list"; box measured before and after.
- Desktop: before `878,50,348,62`, after `878,50,348,62` — same. Tag placed inside (above would be cut by the window).
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

Walk: docs/handpass/2026-11-14-check-tools.md · 12 pictures · 5 surfaces (bell list, Edit Schedule, Scheduler Board, Leave War, sign-in) · MISSING: flying wave panel at 821 wide; phone plain-user round beyond the bell list
