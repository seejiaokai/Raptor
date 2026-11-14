# Job 3 — the walk of two small Quals fixes: the walker's brief (chat 64, the night of 11 Nov 26)

You WALK the running app as a person would and report what you SEE. You do not read code for bugs, you do not fix
anything, you do not decide whether a finding is real — you record it exactly, with its picture and how to repeat it.

**The checkout:** `C:/Users/User/projects/Raptor/.claude/worktrees/next-jobs-recommendation-fixes-3756f8`, branch
`claude/quals-small-1111`, last code commit `7765901d1`. `raptor-port/dist` is ALREADY BUILT from it — do not build, do
not run `npm test` or any Playwright test file (they rebuild `dist`). Never switch branch, commit, push or stash. The
only files you may write inside the checkout are pictures under
`raptor-port/docs/img/handpass/2026-11-11-quals-small/` (make the folder). Your scripts and their output go in
`C:/Users/User/AppData/Local/Temp/claude/cee81c3498095cef/0808c898-68d1-497c-a60b-ea8a401daabb/scratchpad/job3/walk/`.

## Read first
1. `raptor-port/docs/walk-scripts.md` — how a walk script is written here and what each trap has cost. Follow it.
2. `raptor-port/CLAUDE.md` §Build & verify (signing in: `ad`/`a` is the admin, `us`/`us` a member; the login boxes; the
   browser fallback line every new Playwright script copies from `playwright.config.ts`).
3. The six browser tests the builder added at the END of `raptor-port/e2e/geometry.spec.ts` (the block "Quals: the
   outline's one trip…") — for how to reach "Check his quals", Edit quals and the pinned heading row. Do not run that file.

## Stand it up
Serve the built app yourself: check a port is free (try 4391; `Get-NetTCPConnection -LocalPort 4391` in PowerShell must
find nothing), then from `raptor-port` (cd by its FULL path): `npx vite preview --port 4391 --strictPort` in the
background, output to a file. Drive `http://localhost:4391/`. Stop it BY ITS PORT when you finish. Each scenario starts
from a fresh browser context (the app saves in the browser — a fresh context is a fresh world). Watch console errors,
page errors and failed requests in every script and report any.

**Sizes and browsers:** desktop 1280×800 (Chromium, mouse); phone 402×874, touch on, device scale 3 (Chromium, by
touch — real touch events, `hasTouch: true`, taps and finger drags through the touchscreen / CDP touch points as
walk-scripts.md says, never a mouse on the phone); and the scenarios marked WK again in WebKit at the phone's size
(`webkit` from Playwright, if it is installed — if it is not, say so and do not install anything).

## What changed (what you are checking)
- **A — the outline's one trip.** When an admin is sent to a man's quals ("Check his quals" — the prompt after Enable
  or Restore on Admin → Users), when a man presses his own "Check my quals" welcome note, or when Undo / Redo of a
  Quals change outlines a row: the page goes to that row ONCE. After that, a change for any other reason must never move
  the page back to the outlined row.
- **B — a pinned heading drags its column.** In Edit quals, with the page scrolled down so the heading row is the
  pinned copy under the top bar, pressing a column's heading there and dragging starts the same column drag as the
  table's own heading: the lift frame, the landing mark, the drop, the new order, Undo.

## The scenarios — each at desktop and phone unless it says otherwise; a picture at each ★
Record for each: PASS / FAIL / NOT RUN (why) / OBSERVED (something odd that is not this change's claim).
Scroll positions are measured (`scrollY` of whatever scrolls — find the scroller on the running page, do not assume the
window) before and after each press, and written in your report.

**A — the outline**
- A1 "Check his quals" from Admin → Users (Enable or Restore a man whose row is far down the Quals list): you land on
  Quals with his row in sight ★ and outlined — assert the outline as PAINTED (a computed style on the row's cells), not
  a class name. Is the row clear of the top bar and the pinned heading row? ★
- A2 after A1, scroll so his row is off screen. Then, one at a time, each with the page's place measured before and
  after and a ★ right after: tick another man's box; untick it; sort by a column; type in the filter box and clear it;
  enter Edit quals; in Edit quals tick a box, drag a column (the table's own heading and, scrolled down, a pinned
  one); leave Edit quals. EXPECTED each time: the page stays where it was (a sort or a filter may re-flow the list —
  then say what moved and whether the page jumped TO HIS ROW).
- A3 scroll back to him: is he still outlined, and for how long does the outline last after A1 (note what you see —
  its life is meant to be unchanged; compare with A1's first seconds).
- A4 "Check his quals" a second time for the same man with his row off screen, and for a different man: the page
  goes to the row each time (each ask makes its own trip) ★.
- A5 the member (`us`): the "Check my quals" welcome note, if you can raise it (a newly enabled account's first sign-in —
  see how the builder's test or the app raises it; if you cannot raise it in ten minutes, NOT RUN with what you tried).
  Then A2's presses a member can make (his own row's boxes).
- A6 Undo: on Quals tick a box on a man near the top, scroll to the foot, press Undo in the top bar: the page goes to
  the change (it was out of view) ★ and outlines the row. Now scroll to the foot again and tick another man's box: the
  page must NOT jump back ★. Then Redo with the changed row IN view: the page must not move at all (the rule: Undo and
  Redo leave the screen where it is when what they change is in view). Then Redo with it out of view: it goes there.
- A7 Undo of a Quals change pressed from ANOTHER page (Edit Schedule, Admin): what happens — are you taken to Quals,
  does the row outline, where is the page? Record it; then come to Quals and tick a box elsewhere: no jump.
- A8 the filter case: type a filter that hides the man, then get sent to him ("Check his quals" with the filter still
  typed, if the filter survives leaving and returning to Quals — say whether it does). What do you see on arrival ★? Clear
  the filter: is he outlined, and does the page go to him ★? RECORD exactly; do not judge.
- A9 with the outline up, leave Quals for another page and come back; reload the page: where is the page, is there an
  outline, does anything scroll?
- A10 the short screen: desktop 1280×600 — A1 and A2's first two presses.

**B — the pinned heading** (Edit quals, scrolled down until the pinned heading row shows)
- B1 list the heading's copies on the running page by their own elements (the table's own heading row, the pinned
  row's moving headings, the pinned still name heading, any frozen corner) — how many, their boxes ★.
- B2 desktop, mouse: press a pinned heading and drag it three columns right at an ordinary speed: ★ mid-drag (the lift
  frame on the pressed column, the one landing mark), drop, ★ after: the new order in the pinned row AND in the table
  (scroll up and read the table's own heading row) — the same. Undo ★: the old order back, the page not thrown
  anywhere. Redo. Then drag left; then to the far edge so the table scrolls sideways under the drag (the pinned row
  moving in step with the table — ★ mid-scroll); a slow drag; a quick flick; a short press-and-release without
  moving (nothing moves, nothing lifts); a drag dropped back where it started (nothing changes, nothing in Undo).
- B3 phone, finger (WK): the same set by touch — and say what the PAGE does under the finger: does the page scroll
  up/down or sideways while the heading is being dragged; does a plain vertical flick that starts on a pinned heading
  still scroll the page; does a sideways swipe on the pinned row still scroll the table sideways when it is NOT a
  drag (compare with the same finger moves on the table's own heading row at the page's top — the pinned row must
  behave as the table's own does; any difference is a finding). ★ within about 100ms of each lift as well as settled.
  While pressed, the pinned cells stay opaque (no table content showing through) ★.
- B4 the ✕ inside a pinned heading, the still name heading, a press on the pinned row's empty part: what each does,
  beside what the same press does on the table's own heading row. RECORD (the ✕ in a pinned heading is believed to do
  nothing — confirm, and say what the ✕ in the table's own heading does).
- B5 not in Edit quals (view): press and drag a pinned heading — nothing lifts; a tap on it does what a tap on the
  table's own heading does in view (a sort?) — compare the two.
- B6 the member (`us`): can he reach Edit quals; does a pinned heading drag for him (it must not, if the table's own
  does not).
- B7 with a filter typed and with a sort on: B2's first drag again.
- B8 after a pinned drag, flick to the page's very foot and back to the top on the phone: the pinned row is where it
  belongs, its headings over their columns (measure three headings' left edges against their columns' cells) ★.
- B9 where the column order shows elsewhere: after a drag, the Leave War's quals list for a man (his window) and
  Quals' Export, if you can reach them — the new order there? RECORD.

**The plain-user round of Quals** (as a person would, desktop and phone, a ★ at each step): open Quals; find a man
with the filter; tick and untick a qual; Undo, Redo; sort by two columns; Edit quals — add a qual column if the page
lets you, rename it, drag it, remove it, Done; every control on the page that opens or closes something pressed (and
closed by each of its own ways — its button, ✕, Escape, a tap outside); Export. Then look at the other places a tick
shows: the man's row in Admin → Users or his person window, and a seat's qual warning on Edit Schedule if one is there.

## Rules for the pictures
A ★ is a saved picture, named `<scenario>-<pc|phone|wk>-<n>-<what>.png`, and you OPEN every one you save (the Read
tool) before its step counts — say in your report what each deciding picture shows. A walk that left no picture did
not happen. A step that asserts a mark or an outline measures it as drawn on screen, on each element it must cover.

## Hand back (your final message — plain text, under 700 words, no file dumps)
- the port and browsers used; WebKit run or not;
- a table: scenario · size · PASS / FAIL / NOT RUN / OBSERVED · the measured figures in a few words · its pictures;
- every FAIL and OBSERVED written so another person can repeat it: the account, the size, each press in order, what
  was expected, what the screen showed, the picture;
- B1's list of copies; what was not walked and why; errors seen in the console; the count of pictures saved (counted
  on disk); the names of your scripts.
