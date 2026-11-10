# The small schedule-and-board fixes — evidence sheet (chats 61–63, 10–11 Nov 26)

Branch `claude/next-jobs-recommendation-c110df`, pull request 756. Built by chat 62; the rest of the walk, a fourth fix,
the reads and this sheet by chat 63. Pictures: `docs/img/handpass/2026-11-10-sched-board-small/` — `repro/` (chat 61,
the faults before), `walk/` (chat 62's first share, `sb62-walk.mjs`), `walk2/` (chat 63, `sb63-walk.mjs`), each with
its `walk.json`.

## 1. What changed, and the tier

1. [SCHED-MARKS-WALK-ODDS] 1 — the week's issues bar: "N warnings" by count (`src/ui/html.ts` `dayWarnHTML`).
2. [SCHED-MARKS-WALK-ODDS] 3 — the changes window's foot says "Tap a change to go to it — the window stays open." only
   where a drawn line can be tapped; none on an empty list, over lines that cannot be tapped, or on "To go out"
   (`src/ui/ChangesWindow.tsx`).
3. [BOARD-UNDO-SAME-DAY] (D672) — the board's Undo and Redo bring the changed box on screen when it is out of view and
   move nothing when it is in view (`src/ui/boardland.ts`, `src/state/undo-wire.ts`).
4. Found by this walk (W9b) and fixed red-first in chat 63: on a phone with the changes window open, a change below the
   screen was brought up to the screen's foot — under the window. The landing now stops above a window standing on the
   screen's foot (`boardland.ts`; test `e2e/board-undo-land.spec.ts` "the changes window open…", red on the phone
   before the fix, 8 of 8 green after).

**The eight questions (§5):** money NO (no OIL, no count of who is present); published record NO (the window only reads
it; Undo's landing moves the screen, not the step); saved data NO (nothing stored changes); **shared drawer YES** (the
bar's drawer serves Edit Schedule, View-only Sched and a published version's look; the landing serves every board
Undo); new gesture or mode NO (no new control — the foot is words, the landing a scroll); new surface NO; roles NO (a
member's foot unchanged, walked); warning list NO (what a warning says is unchanged — only the bar's count word).
**Tier: WALK.** Not a batch over four features: one check for the lot (D485).

## 2. Roll-call (§6)

**A. "N warning(s)" — every place a count of warnings is drawn** (searched `warning\${`, `' warning'`, `warning<` in
`src/ui`, 11 Nov 26):

| Place | SHOWS the plural | USABLE (its tap) | PAINTED there too |
|---|---|---|---|
| Edit Schedule's week bar (`dayWarnHTML`) | YES — W1 (chat 62), both sizes | YES — opens the list, unchanged (W1 pictures) | the issues word and caret; a hidden warning's count dropped (D472), unchanged |
| View-only Sched's bar (same drawer) | YES — W1 | YES | same |
| A published version's look on the week (`OFW`, same drawer) | YES, by the same line — NO walk of its own because the demo has no older version to look at until a day is re-published; the drawer is the one line walked above | — | — |
| The board's bar (`board.ts`) | YES — already plural before this change (the model fix 1 copied) | YES | unchanged |
| The next-week preview (`peek.ts`) | NO, because it draws no issues bar at all (it reads no warnings, by design) — W4 picture | — | — |
| The day's ⓘ panel "N warning · N advisory · N note" (`html.ts` near `dip-sev`) | MISSING — filed, his to say (D994), in [SCHED-MARKS-WALK-ODDS] | — | — |
| Insights' tile "N warning" (`insights-html.ts`) | MISSING — filed, his to say (D994), in [SCHED-MARKS-WALK-ODDS] | — | — |

**B. The changes window's foot — every opener, every tab, every role:**

| Opened from / state | SHOWS (the right foot) | USABLE (a tap goes, window stays) | PAINTED there |
|---|---|---|---|
| Edit Schedule's clock, admin, untouched week | YES — no foot under "No changes this week yet." (W2) | — nothing to tap | no empty band (W2) |
| Edit Schedule's clock, a change made | YES — "Tap a change…" (W12, three sizes) | YES (W2 tap, window stays) | — |
| A day's "N pending" chip → "To go out" | YES — no window foot; the list's own "Tap a change to go to it." (W5) | — | tabs do not move as the foot comes and goes (W5) |
| Same window, "All changes", Item | YES (W5) | YES | — |
| "All changes", Who | YES (W5) | YES | — |
| Every group folded | YES — no foot (W5; chat 62 W2 for Item) | — nothing drawn to tap | — |
| "New to you" | YES — "✓ Mark all as seen", unchanged (W5) | — | — |
| View-only Sched, admin, a day's "1 change" | YES (W6) | YES | — |
| View-only Sched, member, "1 new" → New to you / All changes | YES — "✓ Mark all as seen" / "Read only — …", never "Tap a change" (W7, three sizes) | lines still tappable, as before | — |
| The board's History | YES (W2, W12) | YES | — |
| The phone's slim bar after "Hide ▾" | NO foot, because the bar draws none (unchanged code path) | its Show ▴ and ✕, unchanged | — |

**C. The board's Undo landing — every way an Undo reaches the board:**

| Route | SHOWS (the box brought on screen / nothing moves) | USABLE | PAINTED over the landed box |
|---|---|---|---|
| Board's Undo, box above the screen | YES — under the bar (chat 62 W3, PC and phone) | YES | nothing (`elementFromPoint`) |
| Board's Undo, box below the screen (a flying remark; an input's remark — the input branch) | YES — up clear of the foot (W8, three sizes) | YES | nothing |
| Board's Redo, box in view | YES — nothing moves (W3, W12) | YES | — |
| Undo pressed on another day's board (tab on a PC, › on a phone) | YES — Monday back, box in view (W10, three sizes; chat 62's not-run phone step) | YES | nothing |
| Undo with the changes window open, box above | YES (W9, three sizes) | YES, window stays open | nothing |
| Undo with the changes window open, box below | **was MISSING on the phone** — landed under the window (W9b, before); fixed red-first (item 4), re-walked | YES | nothing, after the fix |
| A phone held sideways (the whole board scrolls, D1780) | YES (W8, W9, W10 at 874 × 402) | YES | nothing |
| A keyboard Undo (Ctrl+Z) | NO, because the scheduler has no keyboard Undo — only the Tracker does (searched 11 Nov 26; W11 recorded) | — | — |
| A week load that closed the board, then Undo | YES by the same call (`setBoardDay` then the landing) — carried by the code read, not walked: reaching it needs a week change mid-session; named in the reads' brief | — | — |
| The pinched desktop layout on a phone | up and down only — a known limit, told to him; sideways not handled | — | — |

## 3. Sizing (§7.0, `walk-ledger.md`)

1. **Type:** D (one word drawn by several drawers), C-like routes of one existing control (Undo reaching the board), and
   the window's foot over several openers and roles.
2. **What only a walk could find:** a drawer or opener the change never reached; the landing against what stands over
   the list (the bar, a window, the screen's foot) at each size — jsdom lays nothing out.
3. **The ledger:** type D walks have found faults 10 times in 10 — every opener and surface walked, not sampled.
4. **The walk chosen:** the host alone, scripted (a helper not worth starting for about 25 steps), on the production
   build, at his PC's 1536 × 730 (Chromium), his iPhone's 402 × 874 and a phone on its side 874 × 402 (WebKit, by
   touch). Carried by tests, not walked: the step-to-box addresses for each kind of row (`boardland.test.ts`, the pure
   half, calling the function directly — it proves the addresses, not that the screen moves); the plural's two counts
   (`warnmute-week.test.ts`). Every route on screen above was pressed.
5. **Row added** to the ledger at the close (below).

**Lessons of §7.11, each against this change:** 3 (after every press, what tells him) — the landing IS the telling,
pictured just after each press (W8–W10 "just-after" pictures); 4 (a window that leaves the page working) — W9/W9b press
Undo behind the open window; 5 (a box moved into sight, checked against all that can stand over it) — **this is the
lesson W9b met**, the window at the foot; 12 (every page a window opens from) — Edit Schedule, View-only Sched, the
board; 19 (each way a window closes, WebKit touch) — ✕, the button again; Escape recorded (an open question to him);
21/30 (touch is not his phone; a picture within ~100 ms) — the "just-after" pictures; the bounce of a real iPhone is his
look; 24 (against the top bar, the phone's foot) — W8 brings boxes to the foot at 402 and 874 × 402; 27 (neighbours
before and after a press) — W5 measures the tabs as the foot comes and goes. The rest (drags, pinch, lists measured,
print, the day's turn at midnight, zoom-dependent marks, drawings) do not apply: no drag, gesture, layout, print or
date reading changed, and no screen here has an approved drawing.

## 4. The walk

- Chat 62 (`walk/walk.json`): 21 pass, 0 fail, 1 not run (the phone's other-day step — found no day tab; done as W10).
- Chat 63 (`walk2/walk.json`, on the build with fix 4): **99 pass, 0 fail, 0 not run, 7 records**, 81 pictures, at
  1536 × 730 (Chromium), 402 × 874 and 874 × 402 (WebKit, touch). Before fix 4 the same script's W9b failed on the
  phone ("on top: false — what is there: the window's foot"); the clean run is the re-walk.
- The plain-user round (§7.0a), W12 at three sizes: open the board from the week, change a remark, Undo, Redo, History
  opened and closed by ✕ and by History again, Escape recorded, ✓ Done, the week shows the change, Edit Schedule's
  clock opened and closed — all pass.
- Pictures opened by the host: chat 62's three PC pictures (the bar, the empty window, the board after Undo); chat 63's
  `w9b-phone-3-after-undo` (the remark just above the open window — the fix) and `w5-pc-1-to-go-out` (one foot, the
  list's own). The rest are judged by the script's measured checks (`elementFromPoint`, the foot's words).

## 5. Tests and gates

- Touched unit files: 74 tests green (`boardland`, `histlist`, `warnmute-week`, `html`); `npx tsc -b` clean;
  `npm run lint:changed` no new finding.
- `e2e/board-undo-land.spec.ts`: 8 of 8 green (the new test red on the phone before fix 4).
- GitHub's run of pull request 756: GATES

## 6. The reads

READS

## 7. Found, and each disposition

- W9b (the landing under the phone's changes window): fixed red-first, re-walked (item 4).
- The ⓘ panel's and Insights' "N warning": filed in [SCHED-MARKS-WALK-ODDS] for his word (D994).
- Escape does not close the changes window: already an open question to him, [CHGWIN-ESCAPE].
- No keyboard Undo on the scheduler: not a fault of this change; recorded.

## 8. What was not walked, and why

- A published version's look (the week's 👁): its bar is the same drawer line walked on Edit Schedule and View-only
  Sched; the demo has no older version until a day is published twice.
- Undo after a week load closed the board: the same landing call; named to the readers.
- His real iPhone (the bounce, the smooth scroll's feel): his look.
