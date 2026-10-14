# Bug check — the Leave War's landing line runs through the figures (`[LW-LANDING-LINE-FIGURES]`, D883)

Branch `claude/backlog-work-session-12d909`. Built 15 Oct 26 by Opus, on his word ("U can do the small fix of the blue
landing line", D889). Tier **LOOK**.

## 1. The tier — the eight questions (the order's §5)
1. Money (OIL is owed): **NO** — nothing counted changes; the figures are only drawn. 2. The published record: **NO**.
3. Saved data: **NO** — the drag's landing mark is screen state, never stored. 4. A shared drawer: **NO** — one surface
(the Leave War grid in Rearrange); the drawer's copy of a row is drawn by the drawer alone, and the row's other copy, the
phone's frozen band, is torn down while Rearrange is on (`Matrix.tsx bandActive`). 5. A new gesture or mode: **NO** —
the drag is as it was; only its line is drawn on one more table. 6. A new surface: **NO**. 7. Roles: **NO**. 8. The
warning list: **NO**. → **LOOK**: the gates, before and after pictures at phone and desktop, this sheet. The walk below
is more than LOOK asks — a real drag, scripted as assertions, because the fault was found only by a real drag
(`noglow-drag.mjs`, 15 Oct 26: a class held still drew nothing where a drag did).

## 2. The cause, and the fix
The figures drawer (the eight figures popped out beside the names) is a SECOND table laid over the day columns. The
drag marked only the real row (`tr.dragover`), so its line was drawn on the real cells UNDER the drawer and hidden there:
on screen it broke across the figures. **Fix:** the drawer's copy of each row now wears the same `dragover` /
`dragover after` classes, by the same tests as the real row — a man's row and a group heading
(`FiguresDrawer.tsx DrawerOver`, `Matrix.tsx drawerRows`) — and draws the same 3px line, no light, at a specificity that
beats the drawer's own box rules, the last box keeping its right edge (`matrix.css`, after `tr.me td.fig.last`).
With the drawer CLOSED the line already ran through the one figure column (walked, below).

## 3. The rulings swept
D883 (the line runs unbroken across the name, the counters and the days — man's row and group heading; phone as desktop:
the agent's reading in its full row, now walked); D882, D887 (no light on the line — none added; `noglow-css.test.ts`
green); D876 (one line, one look — the drawer's line is the grid's own, 3px, `--accent`); D159 / D679 (nothing of the
grid's zoom or top touched). No ruling contradicted.

## 4. The tests
- `src/leavewar/ui/figdrawer.test.tsx` "the Rearrange landing line runs through the drawer too" (2 cases): a man's row
  landed on, top half then lower half, wears the mark in the grid AND its drawer copy, and no other row does; a group
  heading's drawer box the same; gone with the drop. **Red before the fix** (both failed with the drawer half undone),
  green after.
- `src/leavewar/ui/rowglow.test.ts` "the landing bar runs on through the figures drawer…": the six rules draw the 3px
  `--accent` line, no light; they out-rank `.fig`, `.fig.last` and the viewer row's band; the last box comes later than
  the viewer row's last-box rule and keeps the drawer's right edge.

## 5. The walk
`scripts/handpass/lwlanding-drag.mjs` on the built bundle (`npm run build`, `vite preview`), the host alone; desktop
1440×900 by a real mouse, phone 390×844 by real touch events; Rearrange on; the drag held, read, pictured and let go
WITHOUT a drop (Escape; a touch-cancel), the roster order compared after each. Steps: a man's row, upper half and lower
half, with the drawer open; a group heading with the drawer open (desktop — the phone draws its heading the same way and
the unit test carries it); a man's row with the drawer closed. Each reads the computed shadow of every cell in view in
the row — the grid's and the drawer's — and what shows at each figure column's centre just inside the row's edge
(the drawer, drawing the line). **39 / 39 PASS**, no console or page errors. One script fault on the first run: the
"what shows here" read went through the drawer, which stands down to the pointer in Rearrange — the read now lends the
drawer the pointer for that moment; the app is unchanged by it.

**Pictures** (`docs/img/handpass/2026-10-15-lw-landing-line/`): after — `L1-man-upper-drawer-{desk,phone}`,
`L2-man-lower-drawer-{desk,phone}`, `L3-group-drawer-desk`, `L4-man-closed-{desk,phone}`, each opened: the line runs
unbroken across name, figures and days. Before — the live app's own, `docs/mock/2026-10-15-noglow-places/N8-landing-line-today-desk.png`;
and `B1`–`B4` (`DL_BEFORE=1`): the same page with the drawer row's class taken off, which is what the build before the fix
drew (it never set it) — the break across the figures.

**Seen, not this job's:** on a group heading, the drawer's empty box is the page's dark heading colour from its second
column on, while the first column shows the real heading cell's shade beneath — as before this change (the drawer's
`figfill` rules are untouched). Not filed: no fault — the box spans the drawer from the closed column's edge.

## 5a. Round two — one line a gap (owner D890, 15 Oct 26)
His look at the preview on his iPhone: in one gap the line showed in two places a few pixels apart (under Warden,
then on top of Ranger) — "Shouldn't it be just 1 position when I try to move between rows?" The drop was already
one place (the commit resolves "after a row" to "before the row that follows it"); only the drawing differed. **Fix:**
on the grid, over a row's lower half, the hover names the row that follows it when that row is of the same kind
(stepping over a sibling the page hides), so the line is drawn once, on that row's top edge; under the last row of a
list, or above a heading, it stays on the row's foot; over the row just above the one being dragged, no line (the
drop leaves it where it is) (`Matrix.tsx startRowDrag`). Every grid row in Rearrange — a man's row, a heading, the
Manning rows (the Manning case by `countersamong.test.tsx`, whose drop order is unchanged — the default war has no
counter to drag on the walk). **Tests:** `figdrawer.test.tsx` — the lower half marks the row below (grid and drawer),
the last row keeps its foot, the row above the dragged one shows nothing; the first and third **red** with the
change undone. **Re-walk** (`DL_SHOTS=docs/img/handpass/2026-10-15-lw-landing-line/one-gap`, its own folder): the
same script with one more check on each lower-half step — **41 / 41 PASS**, desktop and phone; `one-gap/L2-*`
opened: over Warden's lower half the line is on Drifter's top edge. **Load:** none — the line is a style on one row
while a drag is on; nothing is added to the grid (his question, answered).
**Other places with the same two positions, named to him (D852), not changed:** the Leave War's ⚙ Settings Groups list
and its "Who wins" list (`bidpicker.css` `.set-grow` / `.gs-row`), and a day opened on the Inputs calendar — a note
dragged to reorder (`.ic-sec`). Not the same: the Scheduler Board and Edit Schedule's line / wave / section drags
(one line on the row under the pointer) and Quals' column headings (a ring round the heading). Filed as
`[DRAG-ONE-LINE-ELSEWHERE]`.

## 5b. Round three — the other three lists (owner D891, "Yes fix them too")
The ⚙ Settings Groups and "Who wins" lists ride the same `startRowDrag` — D890's step had been held to the grid; the
limit is lifted. A day's notes on the Inputs calendar have their own drag (`InputsCal.tsx startSecDrag`): the same step
there (its release already resolves "after X" to "before whatever follows X"). The picture first that D852 asks for
was replaced, said to him, by these before / after pictures before the merge — the look is the grid's he had seen.
**Tests:** `settingssheet.test.tsx` (Groups: the lower half marks the row below, the last movable row keeps its foot;
Who wins: the row below), `inputscal.test.tsx` (a note's lower half marks the note below; the last note keeps its foot)
— three **red** with the two changes undone. **Walk:** `scripts/handpass/onegap-lists.mjs`, desktop by mouse and phone
by touch, the three notes made with the day's own "+ Note": **14 / 14 PASS**, no errors. Pictures
(`docs/img/handpass/2026-10-15-lw-landing-line/lists/`): after `G1-groups-*`, `G2-whowins-*`, `G3-notes-*`; before
`B-G1…B-G3` (the same hold with the bar put back on the hovered row's foot). `G1-groups-phone`, `G3-notes-phone` opened:
one bar, on the second row's top.

## 5c. Round four — a drag held at the edge scrolls (D892, D893); a counter's grip (his finds)
**Edge scroll:** one shared piece, `src/ui/edgescroll.ts`, at the Leave War drag selection's own numbers (which
`select.ts` now reads from it — values unchanged); plugged into the Rearrange drag (rows, headings, counters; the ⚙
lists ride it), a day's notes and its seated pucks on the Inputs calendar, Quals' heading drag (sideways). After each
step the thing under the still pointer is read again, so the landing mark follows. **Walk** (`edgescroll-walk.mjs`):
**14 / 14 PASS**, desktop by mouse, phone by touch — Rearrange ran the page 0 → about 830–970 px and a row near the foot
wore the line; a day's 30 notes ran 0 → about 600 px; Quals ran sideways (0 → 558 on an 820-wide desktop, 263 → 988 on
a phone); each let go with no drop, order unchanged; no errors. Not walked: a seated puck dragged inside a note (its
chip is kept under the finger as the list runs — compiled, its file's tests run). Seen, as before: run to the page's
end, a finger on the blank strip under the last row has nothing to land on — moved up onto a row, the line shows.
**Grip:** measured (`grip-reach.mjs`) — both ⠿ about 7 x 10 px on a phone, a counter's row 19 px against a man's 21;
points of 81 round each that start a drag: a counter's 6, a man's 9. Each grip now takes a press over a larger
invisible area inside its row (the guide §6, D487): a counter's 16, a man's 20; the grip looks the same (`grip/`).
**Tests:** `src/ui/edgescroll.test.ts` (the step, the loop, the held band); `rowglow.test.ts` (the grips' area).

## 6. Gates
The whole gate set under the PC lock, in one run, on this branch with the fix (NOT `main`'s code): build clean · tfin 728 / 0 · unit 11407 / 11407 (641 files) · e2e 817 passed, 0 failed, 59 skipped · smoke 446 / 0 · rulecheck OK · docsize OK — WHOLLY GREEN.

Rounds three and four (D891–D893), the whole gate set under the lock in one run on the committed code: build clean · tfin 728 / 0 · unit 11418 / 11418 (642 files) · e2e 817 passed, 0 failed, 59 skipped · smoke 446 / 0 · rulecheck OK · docsize OK — WHOLLY GREEN.

## 7. The closing lines
- Walk: 39/39 PASS — desktop 1440×900 (mouse) and phone 390×844 (touch), drawer open and closed, a man's row both
  halves and a group heading; pictures opened (`L1`–`L4`, before `B1`–`B4` and `N8`).
- Gates: build clean · tfin 728 / 0 · unit 11407 / 11407 (641 files) · e2e 817 passed, 0 failed, 59 skipped · smoke 446 / 0 · rulecheck OK · docsize OK.
- Code read: none — not required at tier LOOK (the order's §5).
- Round two (D890) gates, one run under the lock: build clean · tfin 728 / 0 · unit 11409 / 11409 (641 files) · e2e 816 passed, 1 failed, 59 skipped · smoke 446 / 0 · rulecheck OK · docsize OK — the one failure the Leave War desktop timing test "the grid draws a window of months…" (D84; this change does not touch the window of months): alone under the lock, three times over, 3 of 3. After it, a test only: `countersamong.test.tsx` — a
  counter over the lower half of Required P draws the line on Required W's top (his "Counter has this rearrange
  issue"); 13 / 13, red with the change undone.
