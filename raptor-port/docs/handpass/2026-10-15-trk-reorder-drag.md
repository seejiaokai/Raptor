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

**The re-walk** on the fixed build (`70f2adbdd`), the same script into
`docs/img/handpass/2026-10-15-trk-reorder-drag/rewalk/`: **desk 29/29, phone 30/30**, no error.

The walk script's own faults, fixed in the script: it picked the same roster person sixteen times (one added) — now a
different one each time.

## 6. Break tests

`node scripts/handpass/breaks.mjs scripts/handpass/breaks/trd.json` — **13 of 13 caught**, every file put back: the grip takes
no finger; one line a gap undone; no landing mark; a finger anywhere on the row takes it; Escape left to the window; the edge
scroll not fed by the pointer; the old hint back; and, for the code read's fixes, a second pointer's moves, a second pointer's
lift, a grip taken while a mouse press waits, a buttonless mouse move, the window's blur ignored, the 4px threshold removed.
Not breakable in jsdom: F3's iOS selection rules (CSS only a real iPhone shows) — on his look card.

## 7. What was NOT walked, and why

- **His iPhone (Safari).** Chromium's touch events stand in for a finger; Safari sends a touch's later events to the element it
  began on — here the grip, which stays on the page for the whole carry (only classes change), and the moves are heard on the
  window. Only his iPhone proves the feel: a carry by the grip, and a finger elsewhere scrolling the list. On his look card.
- **The Course window's carry on screen** — the demo world has one course; carried by the same component and the test.

## 8. The code read (D790 — one fresh, blind Opus reader)

**Round one** (the build commit `e8ccfee65`, given the rulings and the state table to fill; D56 in the brief) — four minor
findings, each fixed red first in `70f2adbdd`:

| # | What a person meets | Fix | Test |
|---|---|---|---|
| F1 | A second finger (or the mouse) took over a finger's carry — its lift dropped the row; a finger on a grip while a mouse press waited started a second drag | every listener answers only the pointer that took the row; a waiting mouse press blocks a new drag | "a second pointer neither moves nor drops…", "a finger on a grip while a mouse press waits…" |
| F2 | A mouse release the page never heard (the right button's menu, another program) left the row stuck to the mouse, and the next click — Save order's — dropped it there | a mouse move with no button held ends the carry; the window's blur ends a carry or a waiting press | "a mouse whose release the page never heard…" |
| F3 | On an iPhone a finger held on the grip could start text selection and cancel the touch | `-webkit-user-select:none; -webkit-touch-callout:none` on the rows | none possible in jsdom — his iPhone |
| F4 | The 4px mouse threshold and the in-place flash were not proved | tests added; a test whose last line was always true tightened | "a mouse press … 3px is a click…", "let go on its own place…" |

Sound, by the reader: the drop's arithmetic both ways, one line a gap, Escape heard before the Tracker's own, the unmount
cleanup, the touch's capture to a grip that stays on the page, the edge scroll, the Restore rows untouched, the landing slot.

**Round two** (the fix commit `70f2adbdd` alone, a second fresh Opus reader — §5 "a fix is new code"): **no defect found.** Checked: the drag's first move handed over directly (the old synthetic move would now be refused by its pointer id); every listener added has its removal on every path, unmount included; the waiting-press mark cannot stay set; `buttons` on a mouse across browsers (a finger or pen never meets the check); blur does not fire for focus moving inside the page; the iOS rules reach the grip. Its one note, not a finding: a release the page missed followed by a click with no move first would drop on the last line — it needs the pointer already resting on a button when the menu closes. The last round; nothing further carried.

## 9. The gates

The whole set under the lock, on the fixed code (`70f2adbdd`), 15 Oct 26: **unit PASS (444 s), build PASS, tfin PASS
(728/0), e2e PASS (329 s), the Tracker smoke PASS (296 s), rulecheck PASS, docsize PASS** — wholly green. (A first run on the
build commit was stopped part-way when the code read's findings came in; its result was never used.)

## 10. Closing lines

**His look card (only his iPhone proves these):** (1) carry a row by its ⠿ grip in the Syllabus order window — the row
ringed, one blue line in the gap, the row flashing where it lands; (2) hold the grip a moment before moving — no blue
text selection or copy bubble (F3); (3) a finger on a row's name scrolls a long crew list; (4) Save order, and the Syllabus
dropdown shows the new order. On the desktop: a mouse drag shows the same ring and line, never a box.

`Walk:` WALK tier — the host, `trd-walk.mjs` on the built bundle, desktop by mouse 29/29 and phone by touch 30/30, re-walked
29/29 and 30/30 after the fixes; pictures `docs/img/handpass/2026-10-15-trk-reorder-drag/walk/` and `…/rewalk/`, opened.

`Reads:` one fresh blind Opus read (four minor, fixed red first), one fresh Opus read of the fixes (no defect). No ChatGPT
reader (out — D790): on `[NO-ASTRA-LIST]`.
