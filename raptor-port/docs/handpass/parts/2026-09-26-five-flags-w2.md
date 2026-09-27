# Five-flags batch — walker W2: [LW-RESET-ORDER] (D160), "Reset order" in the Leave War's ⚙ Settings

- **Build walked:** the production bundle of `ca5d04e3`, served at http://localhost:4176/ (not rebuilt).
- **Scenarios:** Fable F10, F11, F12, F18 and roll-call §2.2 (`raptor-port/docs/superpowers/specs/2026-09-26-five-flags-scenarios-fable.md`).
- **Script (the re-walk):** `raptor-port/scripts/handpass/ff-w2.mjs` — from `raptor-port/`: `node scripts/handpass/ff-w2.mjs all`
  (or `desktop` / `phone`, and one of `F10 F11 F12 F18 G M P`). Every check asserts the RIGHT behaviour; every world is a
  fresh browser context; every fixture made through the app's own controls (⇅ Rearrange and the row / heading grips, the
  ⚙ sheet, the counter builder, the who-wins list, Quals' CAT select and + Add person, the Period picker, the Leave War's
  Undo / Redo, the top bar's Undo, Logout + sign-in). `window.*` read only.
- **Pictures:** `raptor-port/docs/img/handpass/2026-09-26-five-flags/w2/` (`d-` desktop 1440×900, `p-` phone 390×844,
  touch, device scale 2).
- **Result of the last full run:** **97 PASS, 0 FAIL**, 10 notes (observations, below). No console error, page error or
  4xx in any of the ten worlds.

## 1. Roll-call — every place the app draws the roster order, or the new control

| # | Place | Shows the reset / usable | Evidence |
|---|---|---|---|
| 1 | Leave War grid, frozen name column — desktop | YES — hand order drawn, reset draws the ranked default at once | F10-1a…3e, F18; `d-F10-3…`, `d-F10-7-grid-after-reset` |
| 2 | Same grid — phone (finger drag, 0.8 zoom) | YES | P-1, P-2c; `p-P-1b…`, `p-P-2d…` |
| 3 | The grid in Rearrange (⠿ grips, widened name column) | YES — reset while arranging keeps Rearrange on, every grip, the widened column (136px desktop; 74px on the phone = 92px at its 0.8 zoom); the first drag after picks up the live default | F18-6b/6c/6d/7, P-5; `d-F18-6b…`, `d-F18-7…`, `p-P-5…` |
| 4 | Figures drawer (per-person rows, desktop opens it) | YES — same order as the name column, hand and reset | F10-0b, F10-2d, F10-3f |
| 5 | The grid's drag-select (a block of rows × days) | YES — reads the drawn order: Ridge→Echo takes "Ridge, Echo" under the hand order, "Ridge, Basher, Echo" after the reset | F10-2f, F10-3g |
| 6 | The drawer's figure-column drag (a run of people for the balance bar) | NO-because not driven separately: it reads the same `rosterSequence()` as row 5 (Matrix.tsx, `figSelCtxRef.order`), which row 5 walked | — |
| 7 | OIL tracker sheet (one row per person) | YES — hand order and reset both followed | F10-2e, F10-4a; `d-F10-8-oil-tracker-after-reset` |
| 8 | The member's grid | YES — the admin's hand order is the member's too (one order for the squadron) | M-2; `d-M-1-member-no-gear` |
| 9 | The other war (Period picker, JAN - DEC 27) | YES — world-level: the hand order and the reset both show there; the line greyed there too | F18-0b, F18-5a; `d-F18-0b…`, `d-F18-5…` |
| 10 | After a reload (the saved order) | YES — a hand order survives a reload (control); a reset survives a reload (an empty saved order stays "follow the default", a later CAT change still re-ranks) | F18-0c, F18-4a, F12-A7/A8, P-6 |
| 11 | ⚙ Settings "Roster order" line — desktop | YES — greyed / enabled / armed / fired / disarmed on ✕, Escape, a press outside | F10, F11-3-*; `d-F10-0…6`, `d-F11-3-reopened…` |
| 12 | ⚙ Settings line — phone | YES — on screen, nothing over it, tappable, same states | P-0a/0b, P-2a/2b/2c, P-4; `p-P-0…`, `p-P-2*`, `p-P-4…` |
| 13 | The member's top row (must not have the door) | YES must-not holds — no ⚙, no ⇅, no Reset order, both widths | M-1, P-M; `d-M-1…`, `p-P-M…` |
| 14 | The Leave War's own Undo / Redo (its top row) | YES — one step: Undo brings the hand order back, Redo resets | F18-2a/3a, P-3; `d-F18-2…`, `p-P-3…` |
| 15 | The top bar's Undo (#undoBtn) | NO-because it is not drawn on the Leave War page (the shell draws it on Edit Schedule). From Edit Schedule it reaches the war's reset (one timeline) — YES | F18-3c; `d-F18-3c-edit-schedule-top-bar-undo` |
| 16 | Quals → Leave War (CAT change, + Add person) | YES — after a reset, both land ranked with no second reset | F12-A1…A8; `d-F12-A*` |
| 17 | Manning counter rows | NO-because they are sums per day; order does not enter them | — |
| 18 | Bid sheet, figures sheet, tap list | NO-because each shows one person | — |
| 19 | Quals table, the schedule's crew palette | NO-because they have their own order; `rosterorder` is read only in the Leave War store (`displayRoster` has two readers: Matrix, OilTracker) | — |
| 20 | The ⚙ sheet's neighbours (must not be disturbed) | YES — ＋ Counter, ± Event row, Show SANS, ↺ Reset counters and its own arm, the groups list and its drag, the colour palette, Who wins (custom), Back to the standard groups | F11-1a…2g, F11-4*, F11-5a, G-3 |

## 2. Checks (all from the last full run)

| id | what | result | picture |
|---|---|---|---|
| F10-0a | fresh world draws the ranked default in every group (independent reading: seat, CAT ladder, callsign) | PASS | `d-F10-0-fresh-greyed` |
| F10-0b | drawer lists the same order as the name column | PASS | `d-F10-0-fresh-greyed` |
| F10-0c | fresh world: line greyed, hint "In the default order — …" | PASS | `d-F10-0-fresh-greyed` |
| F10-0d | hint and title are production copy | PASS | `d-F10-0-fresh-greyed` |
| F10-1a | drag Ranger below Saber (Rearrange) | PASS | `d-F10-1-ranger-below-saber-arranging` |
| F10-1b | drag him back → default drawn again | PASS | `d-F10-2-away-and-back-greyed` |
| F10-1c | after away-and-back the line is GREYED | PASS | `d-F10-2-away-and-back-greyed` |
| F10-1d | a forced press on the greyed line neither arms nor writes | PASS | `d-F10-2-away-and-back-greyed` |
| F10-1e | the first Undo after it undoes the last DRAG (no invisible reset step) | PASS | `d-F10-2-away-and-back-greyed` |
| F10-1f | Redo puts him back | PASS | `d-F10-2-away-and-back-greyed` |
| F10-2a | a WSO dragged up among the pilots lands at the top of the WSOs | PASS | `d-F10-3-wso-dragged-up-lands-top-of-wsos` |
| F10-2d | drawer draws the hand order | PASS | `d-F10-3-wso-dragged-up-lands-top-of-wsos` |
| F10-2e | OIL tracker lists the hand order | PASS | `d-F10-3-wso-dragged-up-lands-top-of-wsos` |
| F10-2f | drag-select Ridge→Echo = "Ridge, Echo" under the hand order | PASS | `d-F10-3-wso-dragged-up-lands-top-of-wsos` |
| F10-2b | real change → line ENABLED, hint "Arranged by hand. …" | PASS | `d-F10-4-real-change-enabled` |
| F10-2c | enabled hint and title production copy | PASS | `d-F10-4-real-change-enabled` |
| F10-3a | one tap arms Reset order only | PASS | `d-F10-5-armed-really-reset` |
| F10-3b | arming changes nothing on the grid | PASS | `d-F10-5-armed-really-reset` |
| F10-3c | second tap resets to the default | PASS | `d-F10-6-after-reset-greyed-again` |
| F10-3d | the sheet repaints at once: greyed, default hint | PASS | `d-F10-6-after-reset-greyed-again` |
| F10-3e | every group ranked after the reset | PASS | `d-F10-7-grid-after-reset` |
| F10-3f | drawer follows the reset | PASS | `d-F10-7-grid-after-reset` |
| F10-3g | same drag-select after reset = "Ridge, Basher, Echo" | PASS | `d-F10-7-grid-after-reset` |
| F10-4a | OIL tracker follows the reset | PASS | `d-F10-8-oil-tracker-after-reset` |
| F11-0a | fixture: custom counter W2 CREW | PASS | `d-F11-0-fixture-sheet-custom-whowins` |
| F11-0d | fixture: custom who-wins order | PASS | `d-F11-0-fixture-sheet-custom-whowins` |
| F11-0c | fixture: hand order | PASS | `d-F11-1-order-armed-counters-not` |
| F11-1a | one tap on Reset order arms only it | PASS | `d-F11-1-order-armed-counters-not` |
| F11-1b | one tap on Reset counters arms only it, fires nothing | PASS | `d-F11-2-both-armed` |
| F11-1d | two single taps fired neither reset | PASS | `d-F11-2-both-armed` |
| F11-2a | "Really reset?" on Reset order fires it | PASS | `d-F11-3-order-fired-counter-kept` |
| F11-2b | the custom counter survives the roster reset | PASS | `d-F11-3-order-fired-counter-kept` |
| F11-2c | Show SANS, groups, colours, who-wins unchanged | PASS | `d-F11-3-order-fired-counter-kept` |
| F11-2g | the CUSTOM who-wins order unchanged | PASS | `d-F11-3-order-fired-counter-kept` |
| F11-2e | grid: counters 12/12, event lines 3/3, headings unchanged | PASS | `d-F11-3-order-fired-counter-kept` |
| F11-2f | closed and reopened: both lines unarmed | PASS | `d-F11-3-order-fired-counter-kept` |
| F11-3-x / -escape / -outside | armed, closed by ✕ / Escape / a press outside → reopened unarmed, nothing reset | PASS ×3 | `d-F11-3-reopened-unarmed-after-{x,escape,outside}` |
| F11-4a | one tap on Reset counters arms only it | PASS | `d-F11-4-counters-reset-order-kept` |
| F11-4b | Reset counters fired: W2 CREW gone | PASS | `d-F11-4b-counters-reset-w2crew-gone` |
| F11-4c | …the hand order stands, line still enabled | PASS | `d-F11-4-counters-reset-order-kept` |
| F11-5a | Back to the standard groups keeps the hand order | PASS | `d-F11-5-standard-groups-order-kept` |
| F12-A0 | fixture: hand order, then reset | PASS | `d-F12-A1-quals-outlaw-cat-a` |
| F12-A1 | Outlaw CAT C → A on Quals → ranked under CAT A | PASS | `d-F12-A1-quals-outlaw-cat-a`, `d-F12-A2-outlaw-ranked-under-cat-a` |
| F12-A3 | no second reset needed: line stays greyed | PASS | `d-F12-A3-after-cat-change-line-greyed` |
| F12-A4 | + Add person "Aardvark" (pilot, CAT C) lands ranked, first of CAT C | PASS | `d-F12-A4-quals-add-aardvark`, `d-F12-A5-aardvark-ranked-in-ops-p` |
| F12-A6 | line still greyed | PASS | `d-F12-A5-aardvark-ranked-in-ops-p` |
| F12-A7 | reload keeps both ranked | PASS | `d-F12-A7-after-reload-ranked` |
| F12-A8 | after the reload a second CAT change (C → B) still re-ranks | PASS | `d-F12-A8-after-reload-aardvark-cat-b` |
| F12-B0 | away-and-back saved order → greyed | PASS | — (same state as `d-F10-2-away-and-back-greyed`) |
| F12-B2 | a newcomer then sinks (saved-order rule) and the line LIGHTS | PASS | `d-F12-B1-saved-order-newcomer-sank-to-foot`, `d-F12-B2-newcomer-sank-line-lit` |
| F12-B3 | Reset order puts the newcomer ranked | PASS | `d-F12-B3-after-reset-aardvark-ranked` |
| F18-0 / 0b / 0c | hand order; the other war shows it; a reload keeps it (control) | PASS ×3 | `d-F18-0b-war-27-hand-order`, `d-F18-0c-reload-keeps-hand-order` |
| F18-1a | reset → default | PASS | `d-F18-1-after-reset-undo-label` |
| F18-2a / 2c | Undo brings the hand order back; line enabled again | PASS ×2 | `d-F18-2-after-undo-hand-order-back` |
| F18-3a | Redo resets again | PASS | `d-F18-3a-after-redo-default` |
| F18-3c | the top bar's Undo on Edit Schedule undoes the war's reset (one timeline) | PASS | `d-F18-3c-edit-schedule-top-bar-undo` |
| F18-3d | Redo on the war puts it back | PASS | `d-F18-3a-after-redo-default` |
| F18-4a | reload after the reset: default, line greyed | PASS | `d-F18-4-after-reload-default` |
| F18-5a / 5b | JAN - DEC 27 draws the default, greyed; back to 26 | PASS ×2 | `d-F18-5-war-27-default` |
| F18-6a | fixture: Rearrange on, SANS on, hand order | PASS | `d-F18-6-arranging-sans-hand` |
| F18-6b | ⚙ opens while arranging; line enabled | PASS | `d-F18-6-arranging-sans-hand` |
| F18-6c | reset: every group ranked, SANS ranked at the foot | PASS | `d-F18-6b-arranging-sans-after-reset`, `d-F18-6c-sans-group-ranked-at-foot` |
| F18-6d | still arranging: 61 grips / 61 rows, name column 136px kept | PASS | `d-F18-6b-arranging-sans-after-reset` |
| F18-7 | first drag after the reset moves one row off the live default | PASS | `d-F18-7-first-drag-after-reset` |
| G-1a / 1b | IP heading dragged above SXO; a group move leaves the line greyed | PASS ×2 | `d-G-1-group-moved-line-greyed`, `d-G-1b-ip-above-sxo` |
| G-2a / 2b | hand order in the IP block, reset: IP stays above SXO | PASS ×2 | `d-G-2-reset-keeps-group-order` |
| G-3 | the sheet's groups list still drags beside the new tray; line greyed | PASS | `d-G-3-sheet-group-drag-with-new-tray` |
| M-1 / M-2 | member: no ⚙ / ⇅ / Reset order; sees the admin's order | PASS ×2 | `d-M-1-member-no-gear` |
| P-0a / 0b | phone: line there, greyed, wholly on screen, nothing over it | PASS ×2 | `p-P-0-leavewar-top-row`, `p-P-0-settings-roster-line-greyed` |
| P-1 | phone: a finger drag (CDP touch) in Rearrange | PASS | `p-P-1a-arranging`, `p-P-1b-finger-drag-ranger-below-saber` |
| P-2a / 2b / 2c | phone: lights, arms, fires | PASS ×3 | `p-P-2a-line-enabled`, `p-P-2b-armed`, `p-P-2c-after-reset`, `p-P-2d-grid-after-reset` |
| P-3 | phone: the war's Undo brings the hand order back | PASS | `p-P-3-after-undo` |
| P-4 | phone: armed, closed, reopened unarmed | PASS | `p-P-4-reopened-unarmed` |
| P-5 | phone: reset while arranging keeps Rearrange and the column | PASS | `p-P-5-reset-while-arranging` |
| P-6 | phone: reload keeps the reset | PASS | `p-P-6-after-reload-default` |
| P-M | phone member: no door | PASS | `p-P-M-member-no-gear` |
| *-ERR (×10) | no console error, page error or 4xx in each world | PASS | — |

## 3. Orders walked
hand order → reset → Undo → Redo (war pair) · reset → top-bar Undo (Edit Schedule) → war Redo · drag away → drag back → forced
press on the greyed line → Undo → Redo · arm order → arm counters → fire order · arm counters → fire counters (order kept) ·
arm → close by ✕ / Escape / outside / walk to Quals and back · hand order → reload (kept) · reset → reload (kept) → CAT change
(still ranked) · reset → CAT change → + Add person → reload → CAT change · saved-but-default → newcomer → line lights → reset ·
hand order → war switch · reset → war switch → back · Rearrange on + SANS on → reset → first drag · group heading drag
(grid and sheet) → line stays greyed; group moved + hand order → reset keeps the group move · admin hand order → Logout →
member sees it. Desktop and phone (door, finger drag, arm, fire, Undo, close, Rearrange + reset, reload).

## 4. Notes — observations, not failures (none is new with this branch)
1. **Undo / Redo words** after a reset: "Undid: a change to the leave board" / "Redid: …" (F18-2b/3b, P-3b) — the generic
   Leave War label from `src/undo/describe.ts`, not changed by this branch; the "say what it did" ask is AM39b
   (`OUTSTANDING.md` [AMEND-SMALL-SEEN] item 2).
2. **Both "Really reset?" can stand at once** (F11-1c, `d-F11-2-both-armed`): arming Reset counters does not disarm Reset
   order, and firing Reset order leaves Reset counters armed until the sheet closes (F11-2d). One tap never fires the other
   (Fable's "disproved by" is not met). Reset counters' arm lives in Matrix.tsx, unchanged here.
3. **An armed line survives walking to another page and back** while the sheet stays open (F11-3-page,
   `d-F11-3b-armed-after-page-switch`) — the same as Reset counters' arm; the sheet stays open across a page switch.
4. **Under a SAVED order a newcomer sinks to the end of his seat**, which in OPS P draws a second "CAT C" sub-heading below
   CAT D (F12-B1, `d-F12-B1-saved-order-newcomer-sank-to-foot`); and SANS shown after a hand order was saved are drawn in
   the store's order, not ranked (F18-6x: Zenith, Bolt, Rebel, Jester…). Both are `displayRoster`'s saved-order rule,
   whose body this branch did not change (`git diff main` adds only the `saved` parameter). The branch makes both
   curable: the line lights and Reset order ranks them (F12-B2/B3, F18-6c).
5. Phone, unrelated: "Sidewinder" reads "Sidew…" in Rearrange and "Side…" at rest.

## 5. Not walked, and why
- The drawer's figure-column drag (row 6): reads the same order function as the drag-select, which was walked.
- A real iPhone: the finger drag is Chromium's CDP touch; the sheet's tap targets and the drag on Safari are for his look.
- F11 / F12 / F18's war switch and SANS at the phone width: the store logic is width-independent; the phone walk covered the
  door, the finger drag, arm / fire / Undo / close, Rearrange + reset and a reload.
- Keyboard-only reach (Tab / Enter to the line); a second admin in another browser (the world is per-browser until the
  database); a folded group, a posted-out or archived man, or the "Everyone else" group under a hand order.

## 6. Errors seen
None: no console error, page error or HTTP 4xx in any of the ten worlds (F10, F11, F12A, F12B, F18, G, M, P, PM).
