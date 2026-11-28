# Scenario brief — the crew list's SANS words and F / O / A column (chat 207, 26 Nov 26)

You design the scenarios a walker will run in the RUNNING app (a scripted real browser, desktop 1536×1000 and an iPhone-size
phone 402×874 WebKit). You do not walk, and you do not judge whether the code is right: say **what is missing** — the
cases, orders and states a walk must cover so a fault cannot hide. Another designer works on the same brief, blind to you;
you will not see their list.

## The change (commit `dbd8e9a4e` on branch `claude/sans-warnlines-185`)
Edit Schedule's crew list (the panel of people a scheduler drags onto seats) has a SANS section — men posted out as SANS
(part-time, they file which events they can do: Fly, OFT sim, AMT sim, each with hours). When a seat is picked (pressed),
each SANS man who cannot take it is struck, with a reason line under his name; after the reason, a small letter for each
event he offered (F, O, A).
1. **The words (his D2584 Q2):** where he filed but not for the picked seat's event, the reason names what he DID offer —
   "SANS — offered Fly only, not OFT"; two offered: "SANS — offered OFT and AMT only, not Fly". Nothing ticked keeps
   "SANS — not offering …". Unchanged: a man with nothing filed gets no reason line while no seat is picked (D2420), and
   with a seat picked keeps the line under his struck name as built (D2420's reading — check it against the drawing,
   which shows "SANS — no availability filed for today" there; corrected by the host after the first designer read the
   brief); a man ahead of his SANS date
   reads "SANS from Fri 17 Jul: no availability filed" and is never told to file (D2587); filing is the SANS man's job, so
   no line tells the scheduler to file.
2. **The column (D2581, D2582):** the F / O / A letters stand in one column down the SANS section, straight after the
   widest reason — never wherever each reason ends, never at the row's right edge.
3. **The hours (D2750, D2751):** with a place picked, his offered hours stand on a line under the letter, never cut off
   (e.g. Jester offered AMT 08:00–10:00: "A" with "08:00–10:00" under it). The letters show whether or not a place is
   picked; the reasons only once one is.
4. The same words read in the drag hover, the drop's note and an armed seat (one source — D2587's reading).

## Where to look (read these; they are yours to read)
- His drawing, approved: `raptor-port/docs/mock/2026-11-25-sans-d2588/` (`index.html`, `words.json`, `draw.mjs`) — its
  scene `col`; its asserts are the part list.
- The rulings' full rows: `grep -h '^| D2584 |' .claude/decisions-full/*.md` (and D2581, D2582, D2750, D2751, D2420, D2587,
  D2338). The scheduler's rulings page: `.claude/rules/decisions/scheduler.md`.
- The changed code (for what it touches, not to review): `raptor-port/src/ui/palette-html.ts`,
  `raptor-port/src/ui/scheduler/12-schedule-editing.css`, `raptor-port/src/engine/avail.ts`, and the tests added
  (`src/ui/sans-column.test.ts`, `src/engine/sans-offered-crew.test.ts`, `e2e/sans-unfiled-wrap.spec.ts`).
- The demo people: Saber (admin, `ad`/`a`), Ranger (`us`/`us`, posted out as SANS from Fri 17 Jul via the Leave War's
  sheet); the demo's SANS men with nothing filed: Cards, Wrangler, Yeti, Badger; others the demo files for (Jester among
  them). The clock starts 2026-07-15 09:00.

## What to hand back
A list of scenarios, each: an id (yours), the size(s), the steps through the app's own controls, the EXPECTED result in
the app's words (from the rulings or the drawing — mark any that is your own reading), and the picture to take. Then
negatives (things that must NOT happen), then your questions — a case the rulings do not settle. Cover at least: each
pair and three of offered events against each picked seat kind (flying seat, OFT seat and extra place, AMT seat and extra
place, a standby row), nothing ticked, nothing filed, ahead of his date; the widest reason changing (a longer one appears
or goes) and the column following; the longest line ("SANS — offered OFT and AMT only, not Fly") under a struck name at
402; hours with AM / PM or whole-day filings; a man who offered two events with two sets of hours; the section's other
readers (drag hover, drop note, armed seat) agreeing; picking and unpicking a seat; the drawing check at 1536 and 402.
