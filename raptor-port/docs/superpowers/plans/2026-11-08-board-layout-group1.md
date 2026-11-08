# Group 1 of the pictures round's build — the board's layout (chat 11, 8 Nov 26)

The build plan's item 1 (`2026-11-08-pictures-round-build.md` §The groups): D1780, D1781, [BOARD-KEYS-LOOKS] (D1771,
D1772). Branch `claude/pr-board-layout-62eb71`, cut from `origin/main` once pull request 679 (chat 5) merged —
`git switch --no-track -C claude/pr-board-layout-62eb71 origin/main` (no upstream: the push.default trap). Rulings
range D1800–D1809 (none used yet). Chat 13 (group 3) shares the board files: settled 8 Nov 26 — it touches only the
published-version banner's 👁 in `SchedBoard.tsx` (~437–442), the Unavailable row in `board-html.ts`, `QUARANTINE_NOTE`
and `.wln-mute` in `board.ts`, `04-pucks-sections.css`, `03-week.css`; this branch keeps to the `.sb-top` block and the
⋯ menu in `SchedBoard.tsx`, `sheetfocus.ts`, `10-board-history.css`, `13-board-rows-responsive.css`, the ring rules.

## The tier — WALK (the bug-check order §5)

Money NO (layout only, nothing counted); published record NO; saved data NO (nothing stored changes); **shared drawer
YES** — the ⋯ menu's ring reaches the week's ⋯ too (D1771), and the jet's line is drawn for every flying wave;
**new mode YES** — the sideways board scrolls as one page; new surface NO; roles NO; warnings NO. → WALK, with the
drawing check, a keyboard walk at a phone's and a desktop's width, the plain-user round (D1557), and the code read:
Astra beside a fresh blind Opus reader (one each; two not required — nothing of money, record, permissions, saved data).

## D1781 — 821 to 1099 wide: remarks on their own row, the times stacked

`src/ui/scheduler/13-board-rows-responsive.css`: the band `(min-width:821px) and (max-width:1439px)` (~line 48, grid
`18px 56px 64px 48px 48px 48px 48px 1fr 1fr 1.2fr 92px`) gets a narrower band 821–1099 after it, on
`.schedboard:not(.sb-wide)`, from the drawn CSS in `docs/img/handpass/2026-11-07-pictures-round/notes-board.md` §2(g):
grid `18px 56px 64px 48px 48px <seat> <seat>`; `.sb-rb` / `.sb-tl` flex columns (R over B, TO over LD) as the phone's
(the phone block from ~line 341); the headings `.sb-hrb` / `.sb-htl` stacked; grip on row 1; remarks `.sb-rcell` row 2
col 2–6; the line's buttons `.lctl` row 2 col 7–end; NOTES heading and the end heading hidden. **The design read's
point:** give the two seats fixed widths, the remarks the rest, so the line stays dense (at 1000 the seats stood 370px
apart). Check the standby lines (SC, AVALON, BB — R · B · START · END, D1085) stack the same way. `.sb-wide` untouched;
from 1100 as today. Measured targets (the page): line 111px; remarks 323 (821), 355 (874), 418 (1000), 468 (1099); every
part in reach. The e2e geometry tests at these widths need new measures.

## D1780 — a phone on its side: the head scrolls away, the bar stays

Scope: `@media (min-width:821px) and (pointer:coarse) and (orientation:landscape) and (max-height:500px)` (the app's own
`SIDEWAYS_PHONE`, `ui/navfold.ts`, plus ≥821 — below that the phone layout's one-row bar stays), on
`.schedboard:not(.sb-wide)`. The desktop layout switch (`.sb-wide`) on a sideways phone stays as today (its pinch-zoom
scroller, D1107/D1109) — a roll-call row, filed.
**Design (drawing B: at rest exactly today, scrolled the head gone from BOTH columns, the bar pinned 51px):** the board
scrolls as one page, and **no markup changes** (wrappers were dropped: `17-save-status.css` styles the two bands as
`.sb-top > .saveband / .oilband`, and `13-…css:604` `.sb-top>.sb-calbtn` — child selectors a wrapper would break). In
the sideways block: `.schedboard` is the scroller (`overflow-y:auto`, x hidden — it is `overflow:clip` today);
`.sb-top{position:sticky; top:calc(-1 * var(--sb-headH)); z-index}` — the sticky-with-negative-top way: the whole top
scrolls up until only its last line (the bar: `.sb-hl` + `.sb-actions`, and the bands under it) is left, then stays;
its own fill in front (D1518). `.sb-main` natural height (`flex:none`); `.sb-boardwrap` no scroller of its own
(`overflow:visible`); `.sb-side` `position:sticky; top:var(--sb-barH); align-self:flex-start;
height:calc(var(--sb-boardH) - var(--sb-barH))`, keeping its inner scrolls (at rest its foot stands headH below the
screen until the head has scrolled — "as any page does"; a roll-call row). Publish beside `--sb-topH` (the
ResizeObserver effect, ~line 350, observing the board too): `--sb-headH` = the bar line's top within `.sb-top` less the
bar's top padding (10px), `--sb-barH` = `--sb-topH` − `--sb-headH`, `--sb-boardH` = the board's clientHeight. Never a scroll-driven fold (D1081, D1412 — nothing moves on
its own when the keys open). **Check, roll-call rows:** kbscroll's board path (the box's nearest scroller now the board
itself — `keepAboveKeyboard`), D1106's windows opening below the bar (`--sb-topH` with the head scrolled away), the drag's
edge auto-scroll, undo/redo scrolling to a change (D672), a warning's tap scrolling to its line, the just-added ring
scrolling into view, the day change resetting the scroll, History's bubbles, the ALL AVAIL window, the sign-off box.
His iPhone look at the end (the real keyboard — D1780's own words; §7.11 lessons 6, 7, 21).

## [BOARD-KEYS-LOOKS] — D1771 (D1772 nothing to build)

The app's cyan keyboard ring (`outline:2px solid var(--accent); outline-offset:2px` on `:focus-visible`, as the day chips
and the board menus' small buttons, D1646, D1652) on: the board's ⋯ items (`.sb-moreitem` — keep the raised row, drop the
browser's ring, approved picture `docs/img/handpass/2026-11-08-board-keys/walk/003-narrow-q1-proposed.png`), the week's
⋯ items (`ScheduleInsightsMenu.tsx`), "+ Block" (board.ts — CSS only, no markup), the desktop bar's Templates `#sbTpl`
and the phone day bar's Templates (oilmode.ts dayBarHTML — CSS only). Also checked (D1771's side note, D1646): + Wave,
the plans selector, a jet's stores, the duty role box. Tidy-up: `SchedBoard.tsx moreItems` reuses `sheetfocus.ts
menuItems`. Evidence `docs/handpass/2026-11-08-board-keys.md` §11.

## Order

1. Cut the branch; the evidence sheet's skeleton (`docs/handpass/2026-11-08-board-layout.md`, §9's headings).
2. D1781 CSS → its unit/e2e measures → the drawing check (`scripts/handpass/pr-board.mjs`, `pr-board-measured.json`).
3. D1780 wrappers + sideways block → tests (a jsdom pin that the wrappers are contents-only off the sideways look; an
   e2e at 874×402 touch: scroll, the bar's top 0, the side column's place, a tapped box with a stand-in keyboard).
4. D1771 rings + the tidy-up → tests.
5. Pull request into `main` (GitHub's run is the gates). Roll-call, sizing (§7.0, walk ledger), Sonnet walkers, the
   plain-user round, the keyboard walk at 402 and 1536.
6. Astra + a fresh blind Opus read → fix → re-walk → green → sheet closed → his look (his iPhone, sideways, the keys up).
