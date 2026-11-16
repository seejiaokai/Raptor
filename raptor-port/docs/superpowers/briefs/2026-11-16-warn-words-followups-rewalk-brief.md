# Re-walk brief — `[WARN-WORDS-STANDALONE]`'s follow-ups: the two read fixes and D2079 / D2080, one Sonnet walker (w2)

Written by chat 88 (16 Nov 26). The evidence sheet: `docs/handpass/2026-11-16-warn-words-followups.md`. The first
walk (w1) passed; this re-walk covers only what changed after it (the bug-check order §5: a fix is new code), plus the
plain-user round. About 40 minutes.

## What changed since w1 (the four things you walk)
1. **Two desks of one man (Astra's F1, fixed):** an SC Shift desk with START typed and END blank, and a plain desk of
   the same man, same role and same hours, END blank too. The plain desk counts as ending START + 1 hour for crew
   rest; the SC desk is left out. Before the fix, when the SC desk came FIRST it swallowed the plain desk, and the man
   showed no crew-rest line at all.
2. **The red Q mark's hover (Opus F1, fixed):** the Q chip on a puck stands for four checks (an illegal seat, SC
   currency, AAR currency, an AAR instructor). Its hover / title now reads "Qual / illegal seat" (the Legend's words),
   never "Illegal seat" alone. The warning LINES keep their own words ("Illegal seat: …", "Not SC NIGHT current: …").
3. **D2080:** a desk made from an AVALON template (or a BB one — a template whose "For wave" is BB), once its wave
   FLIES (an R or B typed on that wave's line), with START typed and END blank, is left out of crew rest, as an SC
   desk is. With END typed it counts.
4. **D2079:** the Logic page's crew-rest check, its "How it works" fold, second line ends exactly: "A standby shift, or
   a desk made from an SC, AVALON or BB template, with START typed and END blank is left out until its END is typed."

## Scenarios — EXPECTED lines are PASS / FAIL
- **R1 (desktop, then phone):** week of 20 Jul 26 (`H.SUNDAY_WK`), Friday (day 4). Ranger (key `bane`) on an SC Shift
  desk (`tpl 'sc'`), role SXO AM, START 20:00, END blank; then a plain desk (Empty block, `tpl ''`), role SXO AM,
  START 20:00, END blank, Ranger. Saturday (day 5): a flight with take-off 10:00 and B 07:00 (report 07:00), Ranger in
  the front seat. EXPECTED: Saturday shows exactly ONE crew-rest line for Ranger naming the Friday duty ending 21:00
  ("…duty ended 21:00 → clear 09:00…"), and Friday shows NO conflict line of Ranger with himself. Then the twin:
  the same on a fresh run with the PLAIN desk made first, the SC desk second — EXPECTED the same one line, no conflict.
  Then type Friday's SC desk END 23:00 — EXPECTED the crew-rest line now names 23:00 (the later end wins). Clear it —
  back to 21:00. Read the week's issues list AND the day-details window for Saturday.
- **R2 (desktop; the phone for the two taps):** a day of the demo week. (a) A pilot who is NOT SC NIGHT current in
  an AVALON line's MAIN front seat (find one: the warning list then says "Not SC NIGHT current: …"). EXPECTED: his
  puck's Q chip hover / title reads "Qual / illegal seat"; the list line reads "Not SC NIGHT current: …"; no line says
  "Illegal seat" for him. (b) Hex (a WSO, `rocky`) in an ordinary flight's front seat. EXPECTED: his Q chip reads
  "Qual / illegal seat"; the list line reads "Hex — Illegal seat: a WSO in the front seat of …". On the phone, tap each
  Q chip and picture what the tap shows (record its words).
- **R3 (desktop):** next week's Wednesday (day 2 of 27 Jul 26, `H.MONDAY_WK`). Add an AVALON wave
  (`[data-wvadd]`, `.wavemenu [data-wmkind="avalon"]`) and type its first line's R box (`ff:<day>.<wave>.0.rl`)
  18:00 so the wave flies. + Block → AVALON (`[data-blktpl="avalon"]`): its first row START 20:00, END blank, Ranger.
  Thursday: a flight, B 07:00, take-off 10:00, Ranger in the front seat. EXPECTED: no crew-rest line for Ranger on
  Thursday. END 23:00 → EXPECTED one crew-rest line naming the Wednesday duty ending 23:00. END cleared → none.
  Then a control: clear the AVALON line's R (the wave no longer flies) and record what Thursday shows (RECORD only).
  Then BB: in the "+ Block" menu's template sheet make a template "BB test" with "For wave" BB, one row; add a BB wave
  (`data-wmkind="bb"`), type its R 18:00; place "BB test" on the Wednesday of 3 Aug week or another free pair of days,
  START 20:00, END blank, a man free next morning with a 07:00 report — EXPECTED none; END 23:00 — EXPECTED one line.
- **R4 (desktop admin, phone admin, desktop member `who 'u'`):** the Logic page; find the crew-rest check, open its
  "How it works" fold. EXPECTED: its second line reads word for word as point 4 above. Picture the fold open at each size.
- **R5, the plain-user round (desktop, then phone the first three):** on Edit Schedule, the everyday tasks start to
  finish: put a man on a flight, open the day's issues list and tap a line (picture what lights), open the day-details
  window and close it by its own button, open and fold the Legend, publish a day (all four sign-offs picked) and read
  it on View-only Sched, as the admin and as the member. Every control that opens or closes something is pressed,
  and every other place that shows the result looked at. RECORD what each shows; a fault you see is a FAIL with its
  picture.

## How to walk — read first
- Read `docs/walk-scripts.md` §3 to §7, whole, before writing any script.
- **The driver and helpers:** copy `scripts/handpass/wwf/wwf-host-s08u.mjs` — it imports `wwf-w1-lib.mjs` (its
  `gotoWeek`, `makeDesk`, `setEnd`, `flight2`, `reload`) and sets the frozen build of `fd8c40f40`:
  `WWW_DIST` `C:/Users/User/AppData/Local/Temp/walk-fd8c40f40`, `WWW_BUNDLE` `index-B9-7bbV4.js`. w1's `init`
  writes `w1` and a `w1/` picture folder over whatever you set, so write your own `wwf-w2-lib.mjs`: re-export
  everything of `wwf-w1-lib.mjs` and add an `init` copied from it with `w2` in both places, pictures under
  `docs/img/handpass/2026-11-16-warn-words-followups/w2/<run>`; prove it once (one picture lands in `w2/`) before
  walking. `open({ phone, who })` gives a new browser with real storage, the build served from inside it
  (no server). NEVER run `npm run build`, `npm test` or any browser test — they rebuild and break the frozen world.
- **On the Scheduler Board press ITS own Undo / Redo (`#sbUndo`, `#sbRedo`), never the page's `#undoBtn`:** the
  board covers the page's top bar, and a script that presses the covered button hits whatever lies on top (w1's
  one false lead). Likewise read the board's own controls under `#schedBoard`.
- **Your own files only:** scripts `scripts/handpass/wwf/wwf-w2-*.mjs`; pictures only under your folder; nothing else
  written anywhere. Scripts written with the file tool (UTF-8), run from `raptor-port/` by full path
  (`cd C:/Users/User/projects/Raptor/raptor-port && node scripts/handpass/wwf/<file>`), never inline in the shell.
- **Every step:** a picture after it; words read from the element that draws them; on the phone a picture within
  about 100ms of each tap's lift beside the settled one (`press(w, sel, { after: '<name>' })`).
- **Judging:** an EXPECTED line is PASS or FAIL; RECORDED only where this brief says RECORD. A step whose own set-up
  could not act is NOT WALKED, never FAIL. A FAIL first gets walk-scripts §7's questions and a picture at the failing
  step. Console or page errors are findings: list them.
- **Not a finding:** a problem only in data already stored (D56); a scheduler who is not an admin (D785); the ALL
  AVAIL window ignoring Escape (filed, `[ALLAVAIL-ESCAPE]`); "Couldn't save that document" on the phone (the test
  browser's WebKit on Windows stores no files — `docs/walk-scripts.md`); the Legend's last word passing under the
  phone's AIRCREW tab (the host has it).
- **Stop:** after 3 failed attempts at one gesture, picture it, NOT WALKED with why, move on. Stop every browser you
  started. Write your report ONCE to `docs/handpass/parts/2026-11-16-wwf-w2.md` — one table row per step (scenario,
  size, what was done, EXPECTED, what the screen said, verdict, picture path), then errors, then each window opened and
  how it closed, then the run folders and picture count. Your message back: ten lines naming every FAIL.
