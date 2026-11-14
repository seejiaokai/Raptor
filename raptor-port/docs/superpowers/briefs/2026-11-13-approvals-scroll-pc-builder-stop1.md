# [APPROVALS-SCROLL-INSIDE] the PC build — the builder's report at "built", before the walk (13 Nov 26, 01:55, chat 67's night)

Saved by the night's coordinator as it arrived (the overnight guide, "A helper's report"). The builder: a fresh Opus
helper; branch `claude/approvals-scroll-pc`, commit `029440c03`. The walk, the drawing check and the two code reads
had NOT started when this was written — the evidence sheet is `docs/handpass/2026-11-13-approvals-scroll-pc.md`.

## What the app now does
- **On a PC:** the Approvals page fills the screen and only its list of requests scrolls. The title, chips, Approve all
  and the column headings stay put; the headings stay pinned at the top of the list as it scrolls.
- **Inside the list:** "Also since you last looked" (under New) and "Nothing here for these dates." scroll with the list.
- **A short list:** the card still reaches the foot of the screen, so its edge does not move when a month is picked (D2008).
- **"Back to Approvals":** the list comes back at the place it was left (the list's own place, not the window's).
- **On a phone:** nothing changes; the whole page scrolls as before. Tests written before the change pin this.
- **Balances:** the rule that fits a page to the screen's true height (lesson 31) moved whole into one shared file,
  which both pages now use. Balances behaves as before; its six true-height tests still pass.

## Where the PC look ends and the phone look begins (the builder's technical choice)
- The split is at the Leave War's own phone width, 700 wide, which both pages already use.
- Anything wider gets the PC look: a tablet either way up, or a narrow desktop window. 700 or narrower keeps today's
  whole-page scroll.
- Why: Approvals switches at exactly the width where the rest of the Leave War's top switches, so there is no width
  where the two disagree.

## Files
- New: `src/leavewar/ui/screenfit.ts`, `src/leavewar/ui/apprscroll.test.tsx`.
- Changed: `src/leavewar/ui/ApprovalsPage.tsx`, `src/leavewar/ui/approvals.css`, `src/leavewar/ui/BalancesPage.tsx`,
  `e2e/leavewar.spec.ts`, `docs/file-map.md`, `docs/feature-impact.md` (one line in the Approvals section; drift-seam:
  anything that brings a line into view scrolls the list, not the window).

## Checks the builder ran and watched
- Tests written first: 13 new unit tests (the 3 phone tests passed on today's code; the 10 PC tests failed for the
  expected reasons); 4 new browser tests (the phone one passed on today's code; the 3 PC ones failed — no inner
  scroller; the January chip moved the card's edge by 432px).
- Unit tests after: 147 of 147 (the new file, M4 page, Balances, the two clash files) and 76 of 76 (the Leave War page,
  phone head, top row, M4 ride).
- `npx tsc -b` passed; `npm run lint:changed` no new finding; `npm run build` (under the lock) passed; `npm run docsize` passed.
- Browser tests (the Approvals, Balances and "Pick dates" tests, the 4 new ones included, port 4185): 39 passed,
  14 skipped, 1 failed — an older phone test the job does not touch, "on a phone the grid shown again after Approvals
  draws the month in view by itself"; run alone with three repeats it passed 3 of 3 (timing-sensitive when 8 run at once).

## Proposed roll-call rows
What scrolls now (the list, not the window); each way into Approvals (the tab, the clash note's "Decide it in
Approvals ›", the OIL tracker closing back); each way back (the slim bar's Back, ✕, another tab); the window-resize
listener; Balances as the second user of the shared fit rule.

## Traps met
- The script guard refuses a shell script that writes a file and holds a backslash — the browser tests were appended
  with the editor instead (a known guard).
- A CSS trap: the rule that stops the card's other parts from growing outranked the scroller's own rule, so the
  scroller's rule needs the same page-level prefix to win.
- The builder's own context compacted once before this report.

## Questions for him
None parked.
