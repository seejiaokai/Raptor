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

## 6. Gates
The whole gate set under the PC lock, in one run, on this branch with the fix (NOT `main`'s code): build clean · tfin 728 / 0 · unit 11407 / 11407 (641 files) · e2e 817 passed, 0 failed, 59 skipped · smoke 446 / 0 · rulecheck OK · docsize OK — WHOLLY GREEN.

## 7. The closing lines
- Walk: 39/39 PASS — desktop 1440×900 (mouse) and phone 390×844 (touch), drawer open and closed, a man's row both
  halves and a group heading; pictures opened (`L1`–`L4`, before `B1`–`B4` and `N8`).
- Gates: build clean · tfin 728 / 0 · unit 11407 / 11407 (641 files) · e2e 817 passed, 0 failed, 59 skipped · smoke 446 / 0 · rulecheck OK · docsize OK.
- Code read: none — not required at tier LOOK (the order's §5).
