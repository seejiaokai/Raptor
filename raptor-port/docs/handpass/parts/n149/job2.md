# Night of 22–23 Nov 26, job 2 — the builder's report (a pick's other pages)

Saved as it arrived (chat 149's helper; commits `37295eaab` build, `4ec98328f` a browser-test fix, the measure script,
one docs line; branch `claude/msq-b1-screens-135`).

**Built.** (1) The board's number (b1-2): a small grey squadron number after the Scheduler Board's day title, the
squadron in view (149 once picked), the drawn badge's look (8.5px, 7px on a phone), inside the title so nothing in the bar
moves; shown for every squadron (the caption sets no condition). (2) The Tracker after a pick (D2318, §16 D2′; f2a–f2d):
one band across the Tracker page's top, no Close — (a) still an admin of the Tracker's squadron by any road (read from
the account): "This is 149's Tracker. Pick 149 to change it. To open 142's, sign out and in.", the Tracker under a
light veil, nothing pressable or reachable by keys, its Undo / Redo greyed; (b) no longer an admin of it: "You can't open
149's Tracker any more. Sign out and in to open 142's.", everything hidden but kept in memory (never reset or unmounted);
the member view: "This is 149's Tracker. Leave the member view to open it.", hidden the same way; (c) the Tracker's
squadron is his pages': nothing. The pick's question, in the logout's own box: "You have unsaved chart edits on “2026”.
Save them before switching to 142?" — Stay (no pick) / Discard them (dropped, then the pick) / Save them (saved into the
Tracker's own squadron, then the pick; a failed save keeps him where he is); asked by the menu's pick and the bell tap's
entry (`enterForLine`), on whatever page he is on, the Tracker tab never brought forward. (3) A window open at a pick
(D2323; f7a, f7b): an open Leave War or Input window reads "This is 142's. You picked 149 — close this to go on.", every
control greyed and inert, its ✕ (and its question) and the band's Close still working; picking back restores it.

**Tests (red first):** `src/ui/msq-board-sqn.test.tsx` 2/2 red → green; `src/state/msq-trk-cover.test.tsx` 8 (6 red →
green, 2 controls); `src/ui/msq-pick-windows.test.tsx` 5 (2 red → green, 2 controls, 1 control added after its own review
found a wrong "You picked 149" when a Plan is lowered under a window — fixed, the test proven red without the fix);
`src/tracker/msq-trk-pick-ask.test.tsx` 6/6 red → green; `e2e/msq-job2.spec.ts` (1536) 4 passed on its second run (the
first failed only because the board covers the top bar — the test now closes the board before picking).

**Checks:** build; code check no new finding; docsize OK; perms-scan and edit-rights-readers pass (`trackerCoverKind` is
not a counted edit question; described in `docs/data-schema.md` §Edit rights by squadron); the related unit files one at a
time, all pass (typing-hold, typing-hold-grid, reshape-r6-reenter, msq-fix2-tracker-moved-master,
msq-fix-sched-windows-midnight, msq-warfix-held-window-words, msq-sqn-menu, msq-bell-tap, rolestable, msq-fix2-undo-reach,
r2-held-figure, remarks-midnight, balances-midnight, tracker.test 86, retest 51, leftovers 72, msq-warfix-trk-refused,
msq-undo-worlds, reshape-a02-midnight); Tracker smoke 472/0 under the lock. Full unit suite not run here (GitHub's run).

**Measured** (`scripts/handpass/n149/measure-job2.mjs`): b1-2 desktop badge 31×14, 6px after the title, clear of the bar
on all seven days; phone 25.7×12, 16px after the date, not cut. f2a band 36px desktop / 47px iPhone (the drawing's
figures), veil rgba(10,12,16,.5) as drawn. f2c, f2d words and buttons as drawn (f2d also from View-only Sched). f7a 20
controls greyed, f7b 50 — the drawing's counts. No difference over ~2px. Not measured in a browser: f2b, f2c on the phone
(held by unit tests); f7a on the phone (below).

**Findings for the owner:** a Leave War window's shade lies over the top bar (desktop and phone) — a press on "142 ▾"
lands on the shade and closes the window first, so f7a is not reachable by mouse or finger; on an iPhone the Input window
covers the top bar, so f7b is reachable only on a desktop. The bands are right wherever the state is reached (keyboard, a
bell tap). Recorded in `docs/ui-contracts.md`.

**Its decisions worth his look:** the board's number always shows; a bell tap that enters another squadron counts as a
pick for the window band; his own move at midnight keeps D2243's band on the chart editor, no cover; the question is
asked only when the pick moves his own pages off the Tracker's squadron (a View holder's pick never asks); from another
page the question's shade dims the whole screen, keys start on Stay, Escape answers Stay. **Possible wording gap:** "To open
142's, sign out and in." — for a master admin whose Tracker is his home's while 149 is picked, signing out and in brings
his home's back; to open 149's he must pick 149 before opening the Tracker.

**Files.** New: `src/ui/heldro.ts`, the four tests, `e2e/msq-job2.spec.ts`, `scripts/handpass/n149/measure-job2.mjs`.
Changed: `src/ui/SchedBoard.tsx`, `src/ui/scheduler/10-board-history.css`, `17-save-status.css`, `src/state/typing-hold.ts`,
`store.ts`, `perms.ts` (two functions added), `pick.ts`, `belltap.ts`, `src/ui/topstate.ts`, `MoveBand.tsx`,
`InputWindow.tsx`, `src/leavewar/ui/Sheet.tsx`, `src/tracker/role.js`, `app/core.js`, `App.jsx`, `TrackerPage.tsx`,
`tracker.css`, `playwright.config.ts`; docs `ui-contracts.md`, `data-schema.md`, `file-map.md`;
`.claude/rules/decisions/scheduler.md` (a `paths:` line for the new spec). Not touched: `leavewar/sync.ts`.
