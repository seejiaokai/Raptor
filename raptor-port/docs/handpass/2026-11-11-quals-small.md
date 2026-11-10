# Evidence sheet — two small Quals faults (`claude/quals-small-1111`, pull request 758) — 11 Nov 26, chat 64, job 3

`[QUALS-OUTLINE-RESCROLL]` — the outline after "Check his quals", "Check my quals" or an Undo takes the page to its row
once. `[QUALS-PINNED-HEAD-NO-DRAG]` — in Edit quals, scrolled down, a heading in the pinned row under the top bar drags
its column as the table's own heading does. Pictures: `docs/img/handpass/2026-11-11-quals-small/`.

## 1. The eight answers and the tier

| # | Question | Answer |
|---|---|---|
| 1 | Money / OIL / who counts as present | NO — Quals' page scroll and a heading's press; no figure is worked out |
| 2 | The published record | NO — nothing of a schedule is read or written |
| 3 | Saved data | NO — the column order is saved by the same writer the table's own heading already uses; no new field |
| 4 | A shared drawer | NO new one — but the heading is drawn in copies (the table's own row, the pinned copy), so §6's "a part drawn in more than one copy" row is run |
| 5 | A new gesture or mode | **YES** — a new place to press: the pinned heading now starts the column drag |
| 6 | A new surface | NO |
| 7 | Roles | NO — who may edit quals is untouched (checked in the walk: a member gets no drag from the pinned row) |
| 8 | The warning list | NO |

**Tier: WALK.** The night's plan adds Astra's read and a fresh, blind Opus read of the finished code (D1770, D790).

## 2. The rulings that apply

| Ruling | In the app's words | Result |
|---|---|---|
| D672 | Undo and Redo leave the screen where it is when what they change is in view, and move to the change only when it is out of view | |
| D895 | The drag rules — a drag lifts what is pressed, shows where it will land, and a tap moves nothing | |
| D1281 | On a phone a pinned cell never turns see-through while pressed | |
| D785 | A scheduler is always an admin; a member edits only his own Quals row | |
| D1557 | The plain-user round of the screen | |

(The Quals page's own rulings the walker and the readers open: `.claude/rules/decisions/people-accounts.md`.)

## 3. The roll-call

The things: (a) Quals' row outline and its one trip; (b) a column heading, in each copy the page draws.

| # | Place | Shows | Usable | What else is painted there |
|---|---|---|---|---|
| a1 | The outline after the admin's "Check his quals" (from Enable / Restore on Admin → Users) | | | |
| a2 | The outline after a man's own "Check my quals" welcome note | | | |
| a3 | The outline after Undo of a Quals change, on the Quals page | | | |
| a4 | The outline after Redo of a Quals change, on the Quals page | | | |
| a5 | Undo / Redo of a Quals change pressed from another page | | | |
| b1 | The table's own heading row (Edit quals) | | | |
| b2 | The pinned copy's moving row of headings (Edit quals, scrolled down) | | | |
| b3 | The pinned copy's still name heading | | | |
| b4 | The lift frame and the landing mark during a drag from the pinned row | | | |
| b5 | The pinned headings outside Edit quals (view) and for a member | | | |
| b6 | Where the column order shows after the drop: the table, the pinned row, the Leave War's quals list, Export | | | |

One row per opener of the trip (a1–a5): "is the person still on the page they started from" is answered in the walk.

## 4. The door check (the new place to press)

| State | Press on a pinned heading | Result |
|---|---|---|
| Edit quals, admin, desktop, mouse — drag | | |
| Edit quals, admin, phone, finger — drag | | |
| Edit quals — a tap, no movement | | |
| Edit quals — the ✕ inside a pinned heading | | |
| Edit quals — the still name heading | | |
| View (not Edit quals), admin | | |
| A member | | |
| With the filter box holding text; with a sort on | | |

## 5. The five sizing lines (D607)

1. **Type:** C (a new place to press for an existing gesture) and E in part (what scrolls, and when); the outline fix is a behaviour fix on one page.
2. **What only a walk could find:** the pinned copy against the table's own heading at each size and by finger; the page's own scrolling under a finger's drag; WebKit (the builder's browser tests ran in Chromium); every opener of the outline's trip; what a later change of each kind does to the page's place. The tests already carry: the trip made once (unit and browser, desktop and phone), the pinned drag's lift frame and landing by mouse and by finger in Chromium.
3. **What the ledger says:** 15 walks of type C recorded, about half found something; the 6 Nov 26 walk of this same page (a heading dragged by a finger, the pinned name heading) found faults a test browser's touch showed.
4. **The walk chosen:** one Sonnet walker, scripted, on the served production build: desktop 1280×800 and a phone 402×874 by touch in Chromium, the pinned-heading drag and the outline's trip again in WebKit at the phone's size; about 30 scenarios with the plain-user round; no case left to a test alone.
5. **After the walk:** its row in `docs/walk-ledger.md`.

## 6. The lessons of §7.11 — each against this change

## 7. The orders walked

## 8. The cases carried by a test

## 9. The pictures

## 10. The break tests

## 11. Errors seen

## 12. What was not walked, and why

## 13. The gate counts

## 14. The reads

## 15. What the walk and the reads found, and each disposition

## 16. `Walk:` line
