# Evidence sheet — [LW-BIDPICKER-CSS-INSIDE] (14 Nov 26, chat 72's night, job 1)

**The change:** the bid sheet's 202 styling rules moved inside the Leave War page's wrapper; nothing a person sees should change. **Tier: WALK.**
Walked on the built bundle of `claude/lw-bidpicker-css-1114b`, served on port 4294, by `scripts/handpass/lw-bidpicker-css-walk.mjs` (Chromium, clock set to Wed 4 Nov 26 and left running). Desktop 1536x864 and phone 402x874 (touch, scale 1), admin (Saber) and member (Ranger). Pictures: `docs/img/handpass/2026-11-14-bidpicker-css/walk/` (`d-NN-*` desktop, `p-NN-*` phone, `*-mem-*` member; `*-justtapped` = a picture about 60 ms after the tap; `walk-log.json` holds every step's reading). Every step also reads whether any button looks browser-default (grey face, Times font) and whether the window sits inside the screen; none did.

## Steps

| # | Step | Pictures (desktop / phone) | Result |
|---|---|---|---|
| 1 | Free day: window opens; Whole day / AM / PM; remark typed; Auto-approve off and on; the ⋯ menu open and closed; Pick a range (calendar); ✕ | d-01…d-12 / p-01…p-17 | PASS |
| 1 | Grant OIL (HO · 0.5, FO · 1, "other" box typed 1.5); CSE; OD; LL with auto-approve off (pending) | d-13…d-17 / p-18…p-26 | PASS |
| 2 | Pending leave window: Refuse (window closes), reopened with "Refused" lit, Refuse pressed again (back to pending), Move, Approve, approved window, Document row, Delete | d-18…d-28 / p-27…p-42 | PASS |
| 2 | "Delete — sure?" in the one-day window (armed only over a day holding an OIL award) | d-29 / p-43 | NOT WALKED: the delete on a plain war leave goes at once (as built); the award-day route did not open a Delete (see MISSING) |
| 3 | Two entries on a day: the day's list, Refuse on a row, Delete chip | d-30…d-32 / p-44…p-47 | PASS (the armed words were not read from the chip; not seen) |
| 4 | Drag across 4 days: the drag window, its leave button | d-33, d-34 / p-48…p-50 | PASS |
| 5 | Settings (groups, Rearrange the grid, Reset order); Rearrange mode; a counter row opens the counter's window (name, amber/red boxes, Save, Edit counter…); Events list; its ✕ armed "Delete — sure?"; Calendar… | d-35…d-41 / p-51…p-60 | PASS |
| 6 | Open for bidding window, a month button, a stretch's calendar icon | d-42…d-44 / p-61…p-64 | PASS |
| 7 | Balances tab, Grades window, a name opens the person window, Approvals tab, Refuse on a line, Approve all armed (amber "tap again") | d-45…d-50 / p-65…p-75 | PASS |
| 8 | Desktop: hover on AM, LL, OL, Grant OIL, ⋯; Tab through the bid window | d-51…d-63 | PASS (see observation 1) |
| M | Member: bid window on his own row, AM, remark, ⋯, a closed day's window, his own approved leave's window (Move, Delete, Remarks, Document), Open for bidding window | d-01-mem…d-07-mem / p-01-mem…p-10-mem | PASS |

I opened about 40 of the pictures myself, both sizes: bid window (empty, pending, refused, approved, award, range calendar, ⋯ menu), day's list, drag window, Settings, counter window, Events with armed ✕, Open for bidding with a stretch calendar, Grades, person window, Approvals with Approve all armed, hover, focus rings, and the member's three windows. Buttons, fields, switches, chips and calendars carry the app's look everywhere; nothing is cut off, overlapping, unstyled or wrongly coloured.

## Findings

None.

## Observations (not findings)

1. Tab order: the first stops were the Remarks box (no ring; the box's own light edge), the "till <date>" tick (a native checkbox with the browser's own thin focus mark, hardly visible: `d-58-tab-2-bidtill.png`), then the buttons with the app's cyan ring (`d-59-tab-3-BUTTON.png`, `d-60…d-62`). I did not compare this tick against the build before the change, so I cannot say whether it is new; a style move cannot add a native mark, so it is probably as it always was. To check against `main` if wanted.
2. Over a plain war leave Delete deletes at once; "Delete — sure?" appears for a day holding an OIL award (the code asks only then), and in the Events list (seen: `d-40-events-armed.png`).

## Console and page errors

None: no page errors, no console errors, no 4xx/5xx responses, across all four worlds (desktop and phone, admin and member).

## Not reached

- The one-day window's own "Delete — sure?" (day holding an OIL award: the Delete did not open by the route I used) and the day's list's armed Delete wording.
- The counter's full form behind "Edit counter…" (the is/is-not row, count box, Save counter, Delete counter); the counter window itself (name, thresholds, Save) was pictured.
- A Tab ring on the phone (a touch screen has none).
- Not compared picture by picture with the build before the change; the computed-style comparison of that is the capture script's job (`lw-bidpicker-css-capture.mjs`).

Walk: docs/handpass/2026-11-14-bidpicker-css.md · 155 pictures · 14 surfaces (one-day bid window, ⋯ menu, range calendar, Grant OIL, decision rows, day's list, drag window, Settings, Rearrange and counter window, Events list, Open for bidding, Balances/Grades/person window, Approvals, member's windows) · MISSING: the one-day window's armed "Delete — sure?", the counter's full "Edit counter…" form
