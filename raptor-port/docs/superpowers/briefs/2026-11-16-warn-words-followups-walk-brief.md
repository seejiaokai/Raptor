# Walk brief — `[WARN-WORDS-STANDALONE]`'s follow-ups (D2073, D2074, D2077, D2078), one Sonnet walker

Written by chat 86 (16 Nov 26) for the walker the NEXT chat starts. The evidence sheet:
`docs/handpass/2026-11-16-warn-words-followups.md`. Before sending it, the host checks the frozen folder still exists
and its bundle name (below), and re-runs the host probe once.

## What you walk
Astra's ten scenarios, in her order: `docs/superpowers/briefs/2026-11-16-warn-words-followups-scenarios-astra.md`
(read it whole, then the corrections below). Desktop 1536 × 864 Chromium for all ten; the phone (402 × 874 WebKit,
touch) for scenarios 1, 8, 9, 10 and one row of 7 (AVALON, a WSO). About 75 minutes; if short, finish in order and list
what was not walked.

## Corrections to Astra's text (the host's, checked against the rulings)
- **OIL on the blank-END SC desk** (her intro and scenario 6): D2073 changes crew rest only. What OIL Earn and the
  ALL AVAIL count say for that desk is "as on `main` today" — RECORD exactly what each says; do not judge it.
- **Scenario 3** (publish, amend, the 👁 looks, load the Original): RECORD the Monday surfaces as she says; the PASS
  lines are only "the crew-rest reading follows the END of the copy on screen" and "loading the Original keeps the SC
  desk's no-END treatment".
- **Scenario 4's hand-typed row inside the SC block:** RECORD (the ruling does not settle it).
- **Scenario 7's CAT IW pilot:** not walked — carried by a test (the sheet's sizing line 4). Do not plant a record.
- **Scenario 10:** each size keeps ITS OWN approved height; the approved pictures are
  `docs/mock/2026-11-16-legend-words/img/<desktop|phone>-2-proposed.png`. Both doors: Edit Schedule's fold
  (`#eLegendBox`) and View-only Sched's (`#vLegend`'s fold).
- Where she says "the published viewer", the app's word is the 👁 look at a published version.

## How to walk — read first
- Read `docs/walk-scripts.md` §3 to §7, whole, before writing any script.
- **The driver:** `scripts/handpass/www/www-lib.mjs`, set by environment BEFORE it is imported, exactly as the host's
  probe does (`scripts/handpass/wwf/wwf-host-probe.mjs` — copy its first lines): `WWW_DIST` the frozen folder
  `C:/Users/User/AppData/Local/Temp/walk-7eade5b52`, `WWW_BUNDLE` `index-Dqzz8EGM.js`, `WWW_WHO` `w1`, a `WWW_RUN` per
  run, and `HP_SHOTS` under `docs/img/handpass/2026-11-16-warn-words-followups/w1/<run>`. `open({ phone, who })` gives a
  new browser with real storage, the frozen build served from inside it (no server; NEVER run `npm run build`,
  `npm test` or any browser test — they rebuild and break the frozen world); `who` `'a'` the admin Saber, `'u'` the
  member Ranger. Ranger's person key is `bane`. The lib gives `board`, `closeBoard`, `addWave`, `seat`, `flight`,
  `typeIn`, `press`, `boardWarn`, `weekWarn`, `dayDetails`, `closeDayPop`, `trace`, `row`, `pic`, `fin`.
- **The proven route** (desktop, this build): the probe above — the board's `[data-dwadd="<day>"]` (+ Block),
  `[data-blktpl="sc"]` (SC Shift; `[data-blktpl=""]` is Empty block), a desk's boxes
  `[data-bfld="dr:<day>.<block>.<row>.str|end|role"]`, its people `[data-fill="d:<day>.<block>.<row>.+"]`. Prove any
  other helper's first step on this build before building on it.
- **Your own files only:** scripts `scripts/handpass/wwf/wwf-w1-*.mjs`; pictures only under your `HP_SHOTS`; nothing
  else written anywhere. Scripts written with the file tool (UTF-8), run from `raptor-port/` by full path
  (`cd C:/Users/User/projects/Raptor/raptor-port && node scripts/handpass/wwf/<file>`), never inline in the shell.
- **Days:** the demo week (13 Jul 26, days 0–6 Mon–Sun); the next week 20 Jul 26. Use men away from other commitments
  unless a scenario adds one, and say which.
- **Every step:** a picture after it; words read from the element that draws them; on the phone a picture within
  about 100ms of each tap's lift beside the settled one (`press(w, sel, { after: '<name>' })`).
- **Judging:** an EXPECTED line is PASS or FAIL; RECORDED only where Astra or this brief says RECORD. A step whose own
  set-up could not act is NOT WALKED, never FAIL. A FAIL first gets walk-scripts §7's questions and a picture at the
  failing step. Console or page errors are findings: list them.
- **Not a finding:** a problem only in data already stored (D56); a scheduler who is not an admin (D785); the ALL
  AVAIL window ignoring Escape or a tap outside (filed, `[ALLAVAIL-ESCAPE]`).
- **Stop:** after 3 failed attempts at one gesture, picture it, NOT WALKED with why, move on. Stop every browser you
  started. Write your report ONCE to `docs/handpass/parts/2026-11-16-wwf-w1.md` — one table row per step (scenario,
  size, what was done, EXPECTED, what the screen said, verdict, picture path), then errors, then each window opened and
  how each way of closing it behaved, then the run folders and picture count. Your message back: ten lines naming every
  FAIL.
