# Bug check — `[TRK-REORDER-FINGER-DRAG]`: the Tracker's ⇅ Reorder rows drag by finger and by mouse, one look (D922, D924)

Branch `claude/trk-reorder-finger-drag`. Drawn first for him (D853, D921): the page
https://claude.ai/artifact/8mNLc9PU5u2ME2C4BvNosu (`docs/mock/2026-10-15-trk-reorder-drag/`, drawn by
`scripts/handpass/mock-trk-reorder-drag.mjs`); his answer "All as recommended" (D924) — the ⠿ grip, a mouse drag the same
look, "Drag a row, or use ▲/▼." deleted.

## 1. The eight questions and the tier

| # | Question | Answer |
|---|---|---|
| 1 | Money (OIL) | NO — the Tracker earns nothing; the order of a dropdown. |
| 2 | Published record | NO — the Tracker has none. |
| 3 | Saved data | NO — the same three save paths (`saveOrderList`, `saveCourseOrder`, `saveCrewOrder`) receive the same list shape; only how the list is rearranged before Save changed. |
| 4 | A shared drawer | NO — one component (`Modals.jsx` OrdModalInner) draws all three windows; nothing else draws a Reorder row. The `.ordrow` class is also on the window's "Restore" rows (`#ordHidden`): they carry no grip and no drag, and the new rules are scoped to `#ordList` or to `.grip`. |
| 5 | A new gesture or mode | **YES** — a finger drag on a phone; the mouse drag rebuilt on the same pointer machine. |
| 6 | A new surface | NO. |
| 7 | Roles | NO — the Tracker has one access for everyone (D121). |
| 8 | The warning list | NO. |

**Tier: WALK.**

## 2. The rulings swept

D922, D924 (the job); D900 (the list follows at its edge — kept, now for a finger too); D895 / the design guide §5a (one
drop, one landing line; carried to the edge, the view follows); D890, D891 (one line a gap, the foot only under the last row);
D876 (one mark, one look — the landing flash is the app's own `lift-land`); D846 (words that only say what the screen shows —
the deleted hint); D487 (no button looks bigger — the grip's larger touch area is invisible); D686 (a finger on a window never
scrolls the page behind — the finger scrolls the list, walked E2).

## 3. The roll-call — every place a Reorder row is drawn

| Place | The ⠿ grip | A finger drag | A mouse drag, one line | Notes |
|---|---|---|---|---|
| Syllabus order (the Syllabus ✎ menu → ⇅ Reorder syllabi) | has it (walked R1) | has it (walked R2–R10, phone) | has it (walked R2–R10, desk) | words: walked R1 |
| Course order (the Course ✎ menu → ⇅ Reorder courses) | has it (`reorderdrag.test.tsx`) | has it — the same component, `mode` changes only the list, its tag and its save (`ORD_MODES`); the demo world holds one course, so nothing to carry | as the finger | words: the test |
| Crew order (Students → ⇅ Reorder) | has it (walked E0 picture) | has it (walked E1, E2, phone) | has it (walked E1, desk) | words: walked (E1 picture) |
| The "Restore" rows under the list (`#ordHidden`) | must not, because they are restored, not reordered — none drawn | must not — no handler | must not — no handler | unchanged |

## 4. Sizing the walk (§7.0)

1. **Type:** C (a new gesture — a finger drag; the mouse drag rebuilt) and E (its look: the ring, the line, the grip).
2. **What only a walk could find:** whether a REAL finger (Chromium's touch events) reaches the grip and is not taken by the
   list's scroll; whether a finger elsewhere still scrolls; the real line's place and colour on screen; the edge scroll by
   finger on a long list; that Save order reaches the dropdown; Escape against the Tracker's own Escape. The tests carry the
   row-half arithmetic and the drop's order in jsdom.
3. **The ledger:** type C, E drag walks of 15 Oct 26 (`edgescroll-walk`, `edgeturn-walk`, `cal2-walk`) — the host alone, 14–77
   checks, two of them found real faults in the change (a canvas foot unreachable; a band under a Save bar).
4. **Chosen:** the host alone, `scripts/handpass/trd-walk.mjs` on the built bundle as assertions, desktop (1440 × 900) by
   mouse and phone (390 × 844, 3x) by touch (CDP); the Syllabus window (R0–R10) and a Crew window made long through the app's
   own "+ Add" (E0–E2). The Course window is carried by `reorderdrag.test.tsx` (the same component; the test renders it and
   checks its grip and words). No short screen: the window is a fixed 52vh list, measured inside it.
5. **After:** the ledger's row is added (`docs/walk-ledger.md`).

## 5. The walk

`DL_BASE=http://localhost:4173 DL_SHOTS=docs/img/handpass/2026-10-15-trk-reorder-drag/walk node scripts/handpass/trd-walk.mjs`
— **desk 29/29, phone 30/30**, no page or console error. Pictures: `docs/img/handpass/2026-10-15-trk-reorder-drag/walk/`
(R1 open, R2 carrying, R4 landed, R6 the last row's foot, E1 the edge — each size), opened and looked at.

Driven, each both sizes unless named: the grip ⠿ on every row; the words; no browser drag left; the grip's touch area 23 × 36
inside its row, `touch-action:none` (phone); the carried row's ring; ONE line on the third row's top; the second row's lower half
draws the same line; let go — it lands above the third; the landed row flashes, and nothing is left marked after; carried up to
first; the last row's foot, it goes last; its own place — carried, no line, nothing moves, it flashes in place; ▼ still moves a
row and carries nothing; a finger on a row's name carries nothing (phone); Escape mid-carry ends the carry and the window stays
(desk); a click carries nothing (desk); Cancel leaves the dropdown as it was; a carry then Save order — the dropdown lists the new
order, the window closes; the crew list (18 rows) held at its foot runs down, still one line, the row lands 18th; a finger on the
names scrolls the list (phone).

The walk script's own faults, fixed in the script: it picked the same roster person sixteen times (one added) — now a
different one each time.

## 6. Break tests

To be run: the drag's three wires — the grip's handler, the one-line-a-gap step, the landing mark.

## 7. What was NOT walked, and why

- **His iPhone (Safari).** Chromium's touch events stand in for a finger; Safari sends a touch's later events to the element it
  began on — here the grip, which stays on the page for the whole carry (only classes change), and the moves are heard on the
  window. Only his iPhone proves the feel: a carry by the grip, and a finger elsewhere scrolling the list. On his look card.
- **The Course window's carry on screen** — the demo world has one course; carried by the same component and the test.

## 8. The code read (D790 — one fresh, blind Opus reader)

Running.

## 9. The gates

Running under the lock.

## 10. Closing lines

To be written.
