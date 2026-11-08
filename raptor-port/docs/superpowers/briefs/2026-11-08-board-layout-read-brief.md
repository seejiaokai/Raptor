# The code read of the board's layout — the brief (chat 11, 8 Nov 26)

One brief, the same for both readers — Astra (the standing reviewer, D1770) and a fresh, blind Opus reader (D790) — each
blind to the other and to the walk. **Read-only: change no file, commit nothing.** Do NOT open the evidence sheet
(`docs/handpass/2026-11-08-board-layout.md`), the walk's brief or pictures, or any other reader's report.

## What to read

- **The change:** pull request 689, branch `claude/pr-board-layout-62eb71`. Its code:
  `git diff origin/main...claude/pr-board-layout-62eb71 -- raptor-port/src raptor-port/e2e raptor-port/playwright.config.ts`
  — five source files (`src/ui/SchedBoard.tsx`, `src/ui/sheetfocus.ts`, `src/ui/scheduler/09-week-responsive.css`,
  `10-board-history.css`, `13-board-rows-responsive.css`, `18-oil-board.css`) and two tests (`src/ui/boardlayout-css.test.ts`,
  `e2e/board-layout.spec.ts`). Read each changed file around its change, and its callers and readers, in the live tree.
- **The rules that govern it** (Codex loads none of these by itself — open each): `.claude/rules/decisions/scheduler.md`
  and `.claude/rules/decisions/design.md` (the rulings, one line each; a full row: `grep -h '^| D1780 |' .claude/decisions-full/*.md`),
  `.claude/rules/raptor-executor.md`, `.claude/rules/ui-design.md`, `raptor-port/CLAUDE.md`, and in
  `raptor-port/docs/ui-contracts.md` the sections on the Scheduler Board (search "D1780", "D1781", "D1771", "sb-top",
  "kbscroll", "D1106").

## The promise (the rulings, in the app's words)

- **D1781:** on the desktop Scheduler Board from 821 to 1099 wide each jet's line puts its remarks on a row of their own and
  stacks R over B and TO over LD as a phone does, so every part of the line is in reach and the remarks get over 300px;
  wider, the times stay in one line (D1029). A standby wave (SC, AVALON, BB) reads R · B · START · END (D1085).
- **D1780:** on a phone on its side the board's Calendar, title, day strip and search scroll away with the list, as any page
  does, while its bar of buttons stays at the top, so with the keys up the list gets about 151px and nothing jumps when the
  keys open (D1081, D1412). *The host's reading of "a phone on its side":* 821 wide or more, a coarse pointer, landscape,
  at most 500 tall — the app's own sideways test (`ui/navfold.ts`) plus the desktop look's 821; below 821 the phone
  layout's one-row bar was already short. *The host's reading:* the desktop layout switch on a phone (`.sb-wide`) keeps its
  own pinch-zoom scroller (D1107, D1109) and is left as it is.
- **D1771 (with D1646, D1652, D842):** under the keys an item of the board's or the week's ⋯ menu, and the board's + Block
  and Templates buttons, wear the app's cyan keyboard ring in place of the browser's own; the ⋯ item keeps its raised row.
  *The host's reading:* + Wave, the plans selector, a jet's stores and the phone day bar's buttons too (D1646's "the board's
  small menus"); a mouse or a finger leaves no ring. D1772: Tab out of a menu is left as built.
- **Must not change:** the board at 1100 and wider; its phone layout (820 and narrower); `.sb-wide`; Edit Schedule's week,
  View-only Sched and the next-week peek; a phone upright; a desktop with a mouse; a tablet on its side taller than 500.
- **Around it, still binding:** windows that open below the board's bar (D1106); nothing pinned leaks (D1518); a drag
  carried to the edge scrolls the view (D895 §5A); undo and redo leave the screen where it is when the change is in view
  (D672); the page itself never zooms on a phone (D1567); one ring, never two (D842).

## The question (verbatim, the bug-check order §4)

> Do not merely review the changed code. Starting from the user promise and the applicable
> rulings, enumerate every qualifying object, renderer, visible door, writer, reader, downstream
> consumer, role, overlay and meaningful order of actions. **Assume every existing line may be
> correct and the defect may be a MISSING call site.** For each item, state where the visible sign
> and the working gesture should exist in the production app. Then rank concrete failure scenarios
> with setup, action, expected result, and the observation that would disprove correctness. Start
> with the least-shared or most specialised surface.

In particular, for D1780: every piece of code that scrolls, measures or positions anything on the board assumed the list's
own box (`.sb-boardwrap`) was the scroller and `.sb-top` a fixed height — the keyboard's raise (`kbscroll.ts`), the jumps
(a warning's tap, the changes window, undo/redo, the just-added ring), the floating windows' top (`floatwin.ts`), the drag's
edge scroll (`interactions.ts`, `rowdrag.ts`, `drag.ts`), History's bubbles (`histbubble.ts`), the day change, the
drawer's `--sb-topH`, the sign-off box, the ALL AVAIL window. For D1781: every kind of row a line can be (flying, standby,
in-time lines, a published look, History's marks, a cancelled jet, a single-seat line) and its headings. For D1771: every
place the ⋯ items and the named buttons are drawn, and whether any other rule out-ranks the new ones.

> This app is pre-promulgation and its entire stored world is DEMO DATA that will be CLEARED before
> the database step. **Do not report a problem whose harm exists only in data already stored when
> the code is already correct going forward** — no migration, no back-compat, no "an existing
> record would read wrongly". If the app would do it again to NEW data, report it: that is a real
> finding and this exclusion does not touch it.

A scheduler is always an admin (D785): no finding about a scheduler who is not one.

## What to hand back

- Each finding: a concrete failure (setup, action, what shows, what should show — and the ruling), its cause in the code,
  and **exact, step-by-step fix instructions** (the file, the rule or line, what to write). A claim with no concrete
  failure is not a finding (D489).
- **Explicit negatives:** each area you checked and found nothing in, by name ("I checked the floating windows' top with
  the head scrolled away and found …").
- You cannot build or run the app or its browser tests here: for each finding that needs the browser to prove, name the
  exact input you would run (size, touch or mouse, the steps) — the host runs it before believing it.
- A short tidiness note, filed not fixed (D489): of the changed lines only — is anything repeated that one rule could hold,
  is any name or comment misleading, is anything left that nothing uses. No size figures.
