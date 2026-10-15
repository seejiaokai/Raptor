# Bug check — Quals' one row and its paragraph deleted (`[GUIDE-ONE-ROW]`, D935)

Branch `claude/one-row-guide-medical` (pull request 519, beside the Medical tab's row and the Logic page — their check:
`2026-10-15-logic-medical.md`). Built 16 Oct 26 by Opus in a fresh chat, as drawn (`scripts/handpass/mock-quals-one-row.mjs`,
https://claude.ai/artifact/QZqDmvnF4esm4zaixiNgTA) and answered "1-4 as recommended" (D935). Pictures:
`docs/img/handpass/2026-10-16-quals-one-row/` (the walk's), its `look/` folder (marked, for his look).

## Questions waiting for him
**ANSWERED 16 Oct 26 — "As recommended" (D937): both built on this branch, tests first — see §9.**
1. **The narrowest phones, while editing (the design guide §3: "if shorter words still do not fit, the layout is drawn
   and put to him").** At 320 wide (the smallest iPhones), with Enable editing pressed, the filter shrinks to its
   magnifier alone — the row stays one row, but there is no room to type a name. At 360 it keeps 63–77 px, at 375
   78–92, on his iPhone (390) 93–107. Recommended: on a phone, "Save changes" reads "Save" (as Export did), which gives
   the filter about 50 px more and room to type at 320. Picture: `look/q1-narrow-filter.png` (the filter marked).
   Waits: nothing else — the build is complete without it.
2. **Quals opens scrolled on a phone (older than this change; met in passing).** Opening Quals from the schedule's menu
   lands 120 px down — the row and the Viewing switch are above the screen until the page is scrolled up. The app keeps
   the window's scroll from page to page; the Inputs page was fixed to arrive at its top (ui-contracts, "The page arrives
   at its top"), Quals never was. Recommended: Quals arrives at its top too, as a small fix with its own test. Picture:
   `look/q2-arrives-scrolled.png` (where the row should be, marked). Filed `[QUALS-ARRIVES-SCROLLED]`.

## 1. The tier — the eight questions (the order's §5)
1. Money: **NO** — no OIL is touched. 2. The published record: **NO**. 3. Saved data: **NO** — the date box was never
read or saved (an uncontrolled box with a fixed value; no code read `#qDate`, searched); the export writes the same file.
4. A shared drawer: **NO** — `.qbar` is drawn by `QualsPage.tsx` alone (searched). 5. A new gesture or mode: **YES** — a
control removed (the date box), three links removed, Export's words change by width. 6. A new surface: **NO**. 7. Roles:
**NO** — who may edit is unchanged; a member's face walked. 8. The warning list: **NO**. → **WALK.**

## 2. The roll-call
**The row, every state and width it is drawn in** (one drawer, `QualsPage.tsx` `.qbar`):
| Place | No date box | One line, every control 36 | Export's words | Filter has room | A finger's 44 (phone) | What else on the pixels |
|---|---|---|---|---|---|---|
| admin, not editing — 390 | YES (walk, e2e, unit) | YES (walk, e2e) | "Export" (walk, e2e) | 190 px | YES (e2e) | the top bar above; the page may arrive scrolled under it (question 2) |
| admin, editing — 390 | YES | YES | "Export" | 107 px | YES | the Add qualification bar below (Edit quals on) |
| admin, Edit quals on — 390 | YES | YES | "Export" | 93 px | YES | the same |
| the three states — 600 | YES (e2e) | YES (e2e) | "Export to Excel" (e2e) | ≥ 56 (e2e) | YES (e2e) | — |
| the three states — 1280 | YES (walk, e2e) | YES | "Export to Excel" | 200 px, at the right | n/a, a mouse | — |
| a member — 390 and 1280 | YES (walk) | YES (walk) | as above | 190 / 200 | — | — |
| narrower phones — 375, 360, 320 (measured) | YES | YES, at all three | "Export" | 360: 63–160; 320: 23–120 — **question 1** | — | — |

**Every action the removed controls gave, and where it is now** (the order §6, a change that removes controls):
| Removed | It gave | Now |
|---|---|---|
| the date box (`#qDate`) | nothing — a copy of the original app's static box; no code read it | — |
| "Add qualifications" link | opened the Admin page | the Admin tab (every admin's nav); a qualification is added on Quals itself (Edit quals → Add qualification) |
| "Set which quals your squadron uses" | nothing — never wired | Edit quals does it |
| "Admin page" link | nothing — never wired | the Admin tab |
| the paragraph's words (CAT drives the chip colour; ✓ = held; a cell toggles in edit mode; archive is on Admin → Users) | words only | the page shows them (D930, D935); archive's place is Admin → Users (D310) |
| what stood BELOW the paragraph | the Viewing switch and the table | they move up by its height; nothing is placed against the screen there (the frozen header measures the table itself — the older Quals browser tests ran green with it, below) |

## 3. Sizing the walk (D607)
1. **Type:** E (a row's controls restyled and one control removed). 2. **What only a walk finds:** the row's fit at each
width in each editing state, the short word showing, the export still downloading and saying so, the filter still
filtering, a member's face. 3. **The ledger:** the last E walks (Inputs toolbar D910, the Medical row D927) found their
fit only at the narrowest phone. 4. **Chosen:** the host alone, one script on the built app as assertions
(`scripts/handpass/quals-row-walk.mjs` — 390 by touch, 1280 by mouse, admin and member, every control in the row
pressed), the row's room measured at 375, 360 and 320, and the browser test at 390, 600 and 1280. 5. **Its row:** added
to the ledger.

## 4. The walk
`scripts/handpass/quals-row-walk.mjs` on the served build: **21 of 21 PASS** after two of the script's own measures were
corrected (it read the full words kept for a screen reader as visible, and looked for the "CSV downloaded" note under
the wrong name — the pictures showed "Export" and the note was there; no app fault). No page errors. Pressed: Export
(the LoX file `142-LoX-FCP.csv` downloads, "CSV downloaded" shows — phone and desktop), the filter (34 → 1 rows),
Enable editing, Edit quals on and off, Save changes. Pictures: `phone-admin-view.png`, `phone-admin-filtered.png`,
`phone-admin-editing.png`, `phone-admin-editquals.png`, `phone-member-view.png`, the `desk-` five, `phone375-`,
`phone360-`, `phone320-admin-editquals.png`. Found: question 1 (the narrowest phones) and question 2 (arrives scrolled).

## 5. Break tests
Unit (`scripts/handpass/breaks/2026-10-16-quals-one-row.json`): **2 of 2 caught** — the date box put back; the short
word not hidden from a screen reader. Browser (`…quals-one-row.browser.json`, `e2e/geometry.spec.ts` "D935"): **4 of 4
caught** — the buttons below 36; the long words on a phone; the filter never giving way; no finger strip on a phone.

## 6. Gates
A small follow-up on pull request 519, whose whole set ran before (D902): the tests it touches — `quals.test.tsx`
**71/71** (3 new tests red first, then green), `e2e/geometry.spec.ts -g D935` **3/3**, the older Quals browser tests (`geometry.spec.ts` and `onedoor.spec.ts`, `-g quals`) **5/5**, the build with its typecheck,
`npm run rulecheck` OK. GitHub's run of the pull request is the full check; nothing merges until it is green.
`scripts/handpass/od-walk.mjs`'s old "the help line says where archive went" check now asserts the paragraph is gone.

## 7. The code read
None: a WALK tier carries no model read (the order §5); the change is a stylesheet block, one button's words and a
deleted paragraph, each pinned by a test proved by a break.

## 8. Not walked, and why
The row at 600 is carried by the browser test (the same controls and route as 390 and 1280, a fit only). The iPhone's
own letters (his phone, Apple's font) are wider than Windows' — the room left at 390 (93 px at the tightest) leaves a
margin; his look on his phone is the proof.

## 9. His answers (D937 — "As recommended", 16 Oct 26), built and re-walked
- **"Save" on a phone:** "Save changes" carries its full words (kept as its name) and "Save" shown at ≤ 480, as Export.
  The filter's room while editing at 320 is now 75–89 px (it was 23–37); 360: 115–129; 375: 130–144.
- **Quals opens at its top:** one arrival effect in `QualsPage.tsx`, as `InputsPage.tsx` has (the page mounts on each
  arrival). Arriving by the phone's menu from a week scrolled 120 px now lands at 0, the row right under the top bar.
- **Tests first:** `quals.test.tsx` "D937" (red, then 72/72); `e2e/geometry.spec.ts` "D935 D937" now at 320 too and no
  longer scrolls the page itself, plus "D937 a phone: arriving from a scrolled page…" — five red on the old build, then
  green; the Quals browser tests with the older ones **10/10**. (The first red run of the arrival test failed on the
  test's own slip — it called this file's own scroll helper — so its red is proved by the break below instead.)
- **Breaks:** unit 3 of 3, browser 6 of 6 (two new: the arrival scroll removed — 4 tests went red; "Save" not shown).
- **Re-walk** (`rewalk-d937/`, the walk now arriving through the real menu and never scrolling the page itself):
  **30 of 30 PASS**, no page errors.

Walk: Quals' row — 21/21, then after D937 30/30 on the served build (390 touch, 1280 mouse, admin and member, arriving through the menu), room measured at 375/360/320, e2e 10/10 at 320/390/600/1280, breaks 9/9; his two answers built.
