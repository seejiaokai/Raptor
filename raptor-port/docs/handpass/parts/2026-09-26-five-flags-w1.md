# Five-flags batch — walker W1: [PUCK-FLAG-GLOW] (D164), the "this is you" puck with a flag ring

Walked 26 Sep 26 against the production bundle of `ca5d04e3` served at http://localhost:4176 (not rebuilt), Chromium
(Playwright), fresh browser context = fresh demo world per part. Script: `raptor-port/scripts/handpass/ff-w1.mjs`
(`node scripts/handpass/ff-w1.mjs [A|B|C|D|E|F|G|all]` from `raptor-port/`; every check asserts the RIGHT behaviour, so
re-running it is the re-walk). Pictures: `raptor-port/docs/img/handpass/2026-09-26-five-flags/w1/` (72). Scenarios:
Fable F13, F14, F15 and §2.1 rows 1–14 and 18. Fixtures made through the app's own controls only (the board's
arm-and-plant, + Row, + Item, the Unavailable + Add dialog, the board's remarks box, the Logic page's edit box, the
sign-off selects / Publish / Unpublish, Admin → Users, Logout / Sign in). The "you" puck was never clicked (Fable
trap a); rings read by computed style and pictures.

**Result: 64 PASS · 0 FAIL · 7 NOTES** (A 10 · B 21 + 2 notes · C 7 + 1 · D 2 + 3 · E 8 · F 12 + 1 · G 4). The promise holds everywhere it was walked: a flagged "you" puck (solid) wears
`rgb(240, 85, 95) 0px 0px 0px 2px` — byte-identical to any other flagged puck — and the dashed one wears the 2px dashed
outline with `box-shadow: none`. The purple fill stays. The notes are pre-existing looks Fable asked to be reported
(unchanged by this branch — the diff touches only `.puck.me.boxred` and `.puck.me.boxdash`).

## Roll-call (§2.1) — the thing: a puck that is BOTH "this is you" and flagged

| # | Where a puck is drawn | Walked? | Result | Picture(s) |
|---|---|---|---|---|
| 1 | Edit week — flying seat | YES | plain red ring, no glow | A-desktop-*, B4-desktop-editweek-cockpit |
| 2 | Edit week — duty desk holder + extras | YES (holder on a new + Row; extras on SDO) | plain | B4-desktop-editweek-desk |
| 3 | Edit week — sim seat + pax + extras | YES (OFT seat, BOX pax, EP-4 and EP-6N extras) | plain | B4-desktop-editweek-sim |
| 4 | Edit week — ground row name + extras | YES (name on a new + Item; extras on STAFF MTG) | plain | B4-desktop-editweek-ground |
| 5 | Edit week — Common Programme crowd | YES | plain | B4-desktop-editweek-programme |
| 6 | Edit week — Unavailable block (leave filed through the board's + Add) | YES | plain | B4-desktop-editweek-unavailable |
| 7 | View-only Sched — unpublished; published (frozen + live); phone | YES | plain on every face | B6-*, B7-desktop-view-published-*, E1-*, C4-phone-* |
| 8 | Desktop board — cockpit, programme, desk (holder+extras), sim (seat, pax, extras), ground (name+extras), Unavailable | YES (12 pucks) | plain | B1-desktop-board-* (13 pictures) |
| 9 | Phone board — the same | YES (13 pucks incl. roster) | plain | B3-phone-board-* |
| 10 | Board OIL mode | NO-because flags are not drawn in the mode — walked once for Fable's note: the purple "you" ring + glow hides the green OIL ring on your own puck (pre-existing) | NOTE F9 | F9-desktop-oil-mode-you-puck |
| 11 | Crew palette — Edit aside, phone drawer (armed), board roster | YES | "you", plain red box, no red glow | B4-desktop-edit-aside-palette, B3-phone-drawer-armed-saber-in-picker, B1-desktop-board-roster |
| 12 | ALL AVAIL window (Saber listed on INTEL UPDATE 16:00–16:20; his clash in words beside him) | YES (desktop) | plain | B5-desktop-allavail-window-* |
| 13 | 👁 look at the issued Original — edit week and board (D187, the version's own flags) | YES | plain | B7-desktop-look-original-* |
| 14 | Mouse ghost (desktop) and finger ghost (touch phone, CDP touch events) | YES | red ring plain, cyan lift box on the veil, no glow; drop back → "Already in that seat" | B2-desktop-mouse-ghost-of-saber, G1-phone-finger-ghost-of-saber |
| 18 | Leave War `tr.me` row (its own glow, wanted) | YES (one picture) | still drawn; untouched (no Leave War CSS for it in the diff) | F8-desktop-leavewar-you-row |

Rows 15–17 (next-week preview, Inputs calendar / medical view, print / CSV / lists / legend swatch) are Fable's NO rows
(no flagged "you" puck can be drawn there); only the legend's "you" swatch was checked (E3: same purple).

## Every check

| Id | What | Result | Picture |
|---|---|---|---|
| A1-desktop / A1-phone | after (this branch): every flagged "you" puck of Saber's on Monday = plain 2px red ring, purple fill, no glow | PASS | A-*-after-branch-saber-you-beside-ranger |
| A2-desktop / A2-phone | Saber's ring byte-identical to Ranger's (flagged, not "you") | PASS | same |
| A3-desktop / A3-phone | before (main's two rules injected): the same puck has one blurred red layer — the glow he reported | PASS | A-*-before-main-saber-you-glows-beside-ranger |
| A4-* / A5-* | injected rules removed → plain again; no console errors | PASS | A-desktop-monday-edit-week-context |
| B0 / B0b | fixture through the board (desk holder+extras, sim pax+extras ×2, ground name+extras, ALL AVAIL, leave); nothing selected afterwards | PASS | — |
| B1 / B1b | desktop board: 12 flagged "you" pucks, every kind of row, all plain | PASS | B1-desktop-board-* |
| B1c | board roster: Saber "you", plain | PASS | B1-desktop-board-roster |
| B2 | mouse ghost: cyan lift box on its veil, no red glow | PASS | B2-desktop-mouse-ghost-of-saber |
| B2n / B2d | the ghost's own shadow is the red ring, so its dark depth shadow is gone — for Ranger's ghost (not "you") too | NOTE | B2-desktop-mouse-ghost-of-saber |
| B2b / B2c | drop back → "Already in that seat"; puck still "you", plain | PASS | — |
| B3 | phone board: 13 flagged "you" pucks, plain | PASS | B3-phone-board-* |
| B3b | phone drawer (a seat armed): Saber "you", plain | PASS | B3-phone-drawer-armed-saber-in-picker |
| B4 / B4b / B4c | edit week: 12 pucks, every kind, plain; Edit aside palette plain | PASS | B4-desktop-* |
| B5 | ALL AVAIL window: Saber "you", plain, his clash named beside him | PASS | B5-desktop-allavail-window-* |
| B6 / B6p | View-only Sched unpublished, desktop and phone: plain | PASS | B6-* |
| B7 | Monday published (the issued face): plain | PASS | B7-desktop-view-published-* |
| B7b | a pending amendment on the published day (live face): plain | PASS | — |
| B7c / B7d | 👁 look at the Original, edit week and board: plain | PASS | B7-desktop-look-original-* |
| B9 | no errors in B | PASS | — |
| C1 | as Saber, "LATE SHOW" typed on Outlaw's Tuesday line, crew rest still 12h: Tuesday still SOLID (too deep), Monday DOTTED | PASS | C1-desktop-as-saber-outlaw-tue-solid-not-you |
| C2 | signed in as Outlaw (seeded member account `outlaw`): his solid "you" puck plain | PASS | C2-desktop-as-outlaw-tue-solid-you |
| C2d | dotted ring on his own puck: the purple "you" ring AND its purple glow sit under the dots | NOTE | C2-desktop-as-outlaw-mon-dotted-you, C4-phone-as-outlaw-mon-dotted-you |
| C3 | as Saber, crew rest 8h on the Logic page: Outlaw's Tuesday turns DASHED, nothing behind | PASS | C3-desktop-as-saber-outlaw-tue-dashed-not-you |
| C4 / C4p | as Outlaw: his dashed "you" puck = 2px dashed red outline, box-shadow none, purple fill — desktop and phone | PASS | C4-desktop-after-branch-*, C4-phone-as-outlaw-tue-dashed-you |
| C4b | before (main's rules injected): red haze behind the dashes | PASS | C4-desktop-before-main-as-outlaw-tue-dashed-you-haze |
| C9 | no errors in C | PASS | — |
| D0 | accounts added on Admin → Users for Wildcard and Static (admin role) | PASS | D0-desktop-as-saber-* (the "not you" baselines) |
| D1a | AMBER on your own puck (Wildcard, Mon, CP advisory): hidden — purple ring + glow instead, only the chip says it; Tally beside him shows the amber ring | NOTE | D1-desktop-as-wildcard-mon-amber-you-beside-tally, D1-phone-* |
| D1b | THIN RED on your own puck (Wildcard, Thu, CP not authorised): hidden the same way; Pixel beside him shows it | NOTE | D1-desktop-as-wildcard-thu-thinred-you-beside-pixel |
| D2a | GREY NOTE on your own puck (Static, Tue, long day): hidden the same way; as Saber sees him it shows | NOTE | D2-desktop-as-static-*, D0-desktop-as-saber-static-tue-grey-not-you |
| D9 | no errors in D | PASS | — |
| E0 | as admin, Ranger planted onto STAFF MTG (the one write before signing in) | PASS | — |
| E1-desktop / E1-phone | signed in as `us` (Ranger, member): his 4 flagged pucks "you", plain | PASS | E1-*-as-ranger-member-you-beside-saber |
| E2-* | Saber (not "you" now): olive, plain red ring | PASS | same |
| E3-* | legend "you" swatch the same purple | PASS | E3-*-legend-you-swatch |
| E9 | no errors in E | PASS | — |
| F1 | Saber on one Tuesday event: "you", unflagged — purple ring + glow (the "you" highlight, kept) | PASS | F1-desktop-you-no-flag |
| F2a / F2 | you → flag on (overlapping row planted): both pucks plain red | PASS | F2-desktop-you-then-flag-on |
| F3 / F4 | top-bar Undo → flag off (purple back); Redo → flag on, plain | PASS | F3-desktop-after-undo-flag-off |
| F5 / F5b | highlight chip (CAT A) on: purple yields, red ring stays plain; chip off → "you" back | PASS | F5-desktop-chip-on-purple-yields-ring-stays |
| F6 / F6b | Tuesday published → plain on View-only; unpublished → plain | PASS | F6-desktop-published-tuesday |
| F7 | reload: still flagged, plain | PASS | — |
| F8 | Leave War still marks his row | PASS | F8-desktop-leavewar-you-row |
| F9 | OIL mode (Saturday): his own puck's green OIL ring hidden under the purple "you" ring | NOTE | F9-desktop-oil-mode-you-puck |
| F99 | no errors in F | PASS | — |
| G1 | finger ghost (390×844, touch, CDP touchStart → hold 320 ms → touchMove): purple, cyan lift box on veil, no red glow | PASS | G1-phone-finger-ghost-of-saber |
| G2 / G3 | let go on his own seat → "Already in that seat"; still "you", plain | PASS | — |
| G9 | no errors in G | PASS | — |

## Orders walked (§2.1)
- flag on → you: C1→C2 (Outlaw flagged, then signed in as him), D0→D1/D2 (Wildcard, Static), E0→E1 (Ranger).
- you → flag on → flag off (Undo) → on (Redo): F1–F4 (Saber, Tuesday).
- select a chip (purple yields, ring stays) → clear: F5.
- publish → unpublish: F6 (Tuesday); publish + amendment + 👁 look: B7 (Monday).
- reload: F7. Drag and drop-back: B2 (mouse), G1–G3 (finger).

## Errors seen
None — no console error, page error or 4xx in any part (A–G).

## What was NOT walked, and why
- **Safari / a real iPhone.** Chromium only; the finger ghost is a CDP touch drag in Chromium. Safari's own delivery of
  a touch's later events is not proven here (§7.9) — owner's look card.
- **The other rings (amber, thin red, grey, dotted) are not a promise of D164** — measured and pictured as notes only.
- **Orders at phone width** (F1–F7 desktop only); the ALL AVAIL window and the 👁 look at phone width; the thin-red and
  grey notes at phone width (amber pictured at phone).
- **Selecting another man's puck (blue)** as a second way the purple yields — the chip (F5) walks the same yield.
- Rows 15–17 (Fable's NO rows) beyond the legend swatch.
- An ALL AVAIL placed on an open-ended row (DINNER WITH CMD 18:30–) drew no count chip, so no door to the window from
  that row — seen while building the fixture, outside this item, not investigated (may be the "nothing to measure"
  rule, D31).
