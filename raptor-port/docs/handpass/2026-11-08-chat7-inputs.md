# The Inputs list's "+ Input" at the right, the list making room, the calendar's drawn expand marks — the bug check (8 Nov 26, chat 7)

Branch `claude/pr-inputs-add-right-5b2653`, pull request 676. The pictures round's group 5
(`docs/superpowers/plans/2026-11-08-pictures-round-build.md`): his **D1787** (`[INP-ADD-RIGHT]`) and **D1792 (b)** (my part of
`[UI-CONSISTENCY-LOOK]`). What was built, the walker's brief and the readers' brief:
`docs/superpowers/briefs/2026-11-08-chat7-inputs-briefs.md`. Pictures: `docs/img/handpass/2026-11-08-chat7-inputs/` (the walk) and
`docs/img/handpass/2026-11-08-drawcheck-inp-add-right/` (the drawing check).

## 1. The eight answers and the tier

1 OIL: NO — nothing earns or is counted. 2 The published record: NO — no publish, sign or amendment path. 3 Saved data: NO —
nothing stored changes (a window's place was already remembered for the session, `winorder.ts`, untouched). 4 A shared drawer:
NO — the room and the narrowing live in the Inputs list's own stylesheet (`06-inputs.css`); the two new marks are ADDED to the
shared icon files (`glyphs.ts`, `icons.tsx`), no existing mark changed (chat 9, which adds to the same files, told). 5 A new
gesture or mode: NO — a button moves along its row; the room is a layout the list takes while a window is open, pressed by
nothing new. 6 A new surface: NO. 7 Roles: NO — a member's list is the same list, his "+ Input" moving as an admin's does.
8 The warning list: NO.
**Tier: LOOK** by the eight (cosmetic, one surface — the Inputs page), **raised by the plan to a small WALK**: the room and the
narrowing change the list's geometry at five desktop widths, and a window over the list is a place the walk can find what the
tests cannot. Told to him: chat 3's brief set the walk; he is told in the look card (§12).

**The rulings that apply** (each checked on the running build — §4, §7): **D1787** (the button at the right end; the room from
about 1340; Name, Start, End narrowing first; narrower the window covers the list; the phone unchanged) — PASS at 1536, 1340,
1280, 1024, 821 and 390; **D1792 (b)** (the calendar's ⤢ / ⤡ become drawn arrows out / in) — PASS, desktop and phone; **D1300**
(Medical's "+ Medical" at the right and its room — the pattern copied) — untouched, §7; **D1139** ("+ Input" and the dates button
36 tall) — PASS; **D910** (on a phone "+ Input" first in its top row) — PASS; **D1396** (the expand control's place, its words
and its pressed look) — PASS, only the mark changed; **D729** (the button beside the dates button) — narrowed by D1787 on a
desktop, as its full row says; **D997 / D996** (a phone's window in the middle) — PASS, no room on a phone; **D641** (a window
can be dragged and leaves the page working) — the fault both readers found (§8 R1), fixed; **D1625** (anything new he sees drawn
first) — nothing new drawn: every look built is a drawn one; the narrow-desktop Remarks at 821 is put to him (§12 Q1);
**D1557** (the plain-user round) — §4 P; **D487** (button sizes) — nothing resized.

## 2. The roll-call (§6)

Each cell: **has it** / **must not, because…** / **MISSING** — and how it was seen. "Walk" = the Sonnet walker's
`docs/img/handpass/2026-11-08-chat7-inputs/walk.mjs`; "host" = the host's re-walk after the fixes (§6); "e2e" =
`e2e/inputs-calendar.spec.ts` "D1787"; "unit" = `src/ui/inputs.test.tsx` / `inputsmonth.test.tsx`.

| Where the app draws it | SHOWS | USABLE | What else is PAINTED there |
|---|---|---|---|
| "+ Input" on the desktop List (821 and up) | has it — at the row's right end, gap 0, 66×36, at 1536, 1340, 1280, 1024, 821 (walk a; e2e) | has it — opens the New input window at every width (walk b) | the dates button at the row's left, 134 wide, unmoved (walk a) |
| "+ Input" on a phone's List (≤ 820) | has it — first in the top row, before the dates button (walk ph-a; e2e phone) | has it — the window opens in the middle, nearly full screen (walk ph-b) | the Calendar / List switch, filter and gear at the row's right (ph-a) |
| The list's room while an input's window is open, ≥ 1340 | has it — the list stops 12px short of the window; Name / Start / End 110 / 140 / 90; Remarks 346 at 1536, 150 at 1340 (walk b, e; e2e) | has it — the rows stay clickable; a row clicked opens the same room (walk e; unit "a row's own window") | the window over the filter row's lower edge, as drawn (§4 note 1) |
| The same window dragged away, ≥ 1340 | MISSING at the reads (R1: the room stayed, the list squeezed AND covered) → FIXED red first: the room goes once the window is dragged (e2e "dragged away") | has it — reopened where he left it, no room made (e2e) | — |
| The window over the List, 821–1339 | must not make room, because Remarks would be too narrow to read (D1787) — covers the list, gap −414 at 1280, 1024, 821 (walk b) | has it — ✕, Escape, Cancel each close it, the list as before (walk c) | the dates pop-up opens and closes with it open (walk d) |
| The List with no window, 821–1099 | has it — Name / Start / End narrowed: Remarks 260 at 1024, 57 at 821 (walk a) | — | 57 at 821 still breaks words in two — put to him, §12 Q1 |
| The List with no window, 1100 and up | has it — the full widths (250 / 150 / 115), Remarks 341 at 1280, 597 at 1536 (walk a) | — | — |
| A phone's List with the window open | must not make room, because the phone's window stands in the middle (D996, D997) — no `.in-room`, the list's padding unchanged (walk ph-b; e2e phone) | has it — ✕, Escape, Cancel (walk ph-c) | the dates button under the window — the phone window covering the screen as built (D909) |
| The Medical tab's room (D1300) | has it — untouched by this change (host §6) | has it (host §6) | — |
| The Inputs calendar's expand button, desktop | has it — arrows out at rest, arrows in pressed, cyan outline pressed; 34×28, no typed mark (walk cal 1–3; unit) | has it — pressed shows every input, pressed again "+N more" back (walk cal; walk-more at 390×560) | the "How this works" row's words beside it, unmoved (walk cal) |
| The Inputs calendar's expand button, phone | has it — as the desktop (walk ph-cal 1–3) | has it — 16 bars and four "+N more" → 21 bars, none → back (walk-more ph390x560) | — |
| The typed ⤢ / ⤡ anywhere else | must not, because D1792 replaces them — none left in the app's code (a search: only comments name them) | — | — |

**Rows by kind of change (§6's list), run:** a floating surface — the input window over the List, opened from "+ Input" and from a
row, closed each way (walk b, c, e); a removed or replaced control — the typed marks gone, nothing else lost (search above); a
changed quantity — the column widths at each width (walk, e2e); a component's second home — the one `inputedit` window opened from
the List, the Calendar and Medical (host §6).

## 3. Sizing the walk (§7.0, `docs/walk-ledger.md`)

1. **Type:** E (layout — the button's place, the room, the narrowing; the marks' geometry), with C's question for the window
   over the list (opened, dragged, closed each way).
2. **What only a walk could find:** the list's geometry beside a real window at five desktop widths and a phone; the window's own
   ways of closing with the list behind; the dates pop-up over both; the expand mark as drawn at 2×. The unit tests prove the
   button's order and the room's class; the browser tests measure the widths; neither sees a picture.
3. **The ledger:** type E walks of one surface (the board's narrow layout, the Inputs calendar's top row) find their faults in
   what stands over what at one width, rarely in the arithmetic — so every width is pictured with the window open.
4. **Chosen:** one Sonnet walker (the brief, `…chat7-inputs-briefs.md`), the five widths 1536, 1340, 1280, 1024, 821 and a phone
   390×844, each with steps a–e, the plain-user round at 1536 and on the phone, the calendar's button at 1536 and the phone;
   the drawing check beside the eight drawings (§5); the host's re-walk of what the fixes touched (§6). Carried by tests: the
   column widths at each width (e2e "D1787", through the real "+ Input" press), the button's order and the room's class (unit,
   through the page's own render), a row's window making the room (unit, a row clicked).
5. **Its row:** added to the ledger at the close.

## 4. The walk (the Sonnet walker, 8 Nov 26 — the report, checked by the host)

Build of `5573f4be9`'s code (the source unchanged since `2596e0d4e`), served on 4378, Chromium at device scale 2, the clock on
13 Jul 26 (the drawings' day). Columns: Name / Start / End / Type / Remarks / Changed / last. "gap" = the window's left less the
list's right.

| Width | a — the row | b — "+ Input" pressed | c — ✕ / Escape / Cancel | d — dates pop-up | e — a row clicked |
|---|---|---|---|---|---|
| 1536 | + Input 1458–1524, gap to the row's end 0; full 250/150/115/160/597 | window left 1090, list right 1078, gap 12; 110/140/90/160/346 | each back to 250/150/115/160/597 | opens and closes, with and without the window | the same room, gap 12, Remarks 346 |
| 1340 | gap 0; 250/150/115/160/401 | window 894, list 882, gap 12; Remarks 150 | as before each time | PASS | gap 12, Remarks 150 |
| 1280 | gap 0; 250/150/115/160/341 | window 834 over the list (gap −414); widths unchanged | PASS | PASS | PASS |
| 1024 | gap 0; 110/140/90/160/260 | window 578 over the list; unchanged | PASS | PASS | PASS |
| 821 | gap 0; 110/140/90/160/57 | window 375 over the list; unchanged | PASS | PASS | PASS |
| phone 390×844 | + Input first (8–64), dates button after it | no room; window 366×820 in the middle | each closes it | covered while the window is up (D909); opens and closes without | — |

**P — the plain-user round (D1557):** at 1536, an OL for Anvil on 16 Jul filed through "+ Input" → Add: 19 rows → 20, the new row
ringed blue and seen whole (`w1536-p3-added-row.png`), the window closed by itself; reopened by its row, the remark changed and
saved (`w1536-p5-saved-viewport.png`); deleted from its window, at once with no question (D792), 19 rows again (`w1536-p7-deleted.png`).
The same on the phone (`ph-p1` … `ph-p7`). Filters: a desktop has no Filters button (the fields stand in the row) — n/a; the
phone's opened and closed.
**Calendar:** the expand button at rest, pressed, pressed again, close-ups at 2× (`w1536-cal-*`, `ph-cal-*`). July fits every
input at 864 and 844 tall, so a second run at 390×560 showed the change: four "+N more", 16 bars → none, 21 bars → back
(`ph390x560-more-*`). At 1536×560 the desktop month does not cut — no "+N more" either way.
**Errors:** none — console, page errors, responses of 400 and up, in both runs.

**Pictures the host opened** (each deciding one): `w1536-b-newwindow.png` (the room — the list stops short, the window clear of
it), `w821-a-viewport.png` (Remarks 57: words broken in two, "Medic / al" — §12 Q1), `w1536-cal-2-pressed-closeup.png` (arrows in,
cyan outline), … (completed below as each is opened).

**Notes a plain user might meet (the walker's, checked):** (1) at 1536 the window's top edge stands over the lower part of the
filter row and over "+ Input", of which a cyan sliver shows at the window's right — the drawing shows the same, as "+ Medical"
stands under Medical's window (named to him, §12); (2) at 1340 the window's top cuts the Calendar / List switch's lower half —
still readable; (3) the New input window's calendar opens on the month of today, not the list's range — older, not this change.

## 5. The drawing check (D1424, D1495) — `scripts/drawcheck/specs/inp-add-right.mjs`

(filled after the run)

## 6. The fixes, and the host's re-walk of what they touched

(filled after the fixes)

## 7. Cases carried by a test

| Case | Test | What it proves | Through |
|---|---|---|---|
| The column widths at 1536, 1340, 1280, 1024, 821, with and without the window | e2e "D1787" (one per width) | the widths and the list's right edge against the window's left | the real "+ Input" press on the built app |
| A dragged window gives the room back; reopened where he left it, none made | e2e "D1787: the input window dragged away…" | the widths back to the closed ones; the list's padding not the room's | a real drag of the window's bar, Escape, a row's click |
| A phone makes no room | e2e "D1787 … phone" | no `.in-room`, the list's padding unchanged with the window open | the real tap on "+ Input" |
| "+ Input" after the dates button, after a spring | unit `inputs.test.tsx` | the order of the row's controls on a desktop | the page's own render |
| A row's window makes the same room as "+ Input"'s | unit `inputs.test.tsx` "a row's own window…" | `in-room` on with the row's window, off after Cancel | a row clicked, Cancel pressed |
| The expand button's drawn marks | unit `inputsmonth.test.tsx` | no typed mark; arrows out at rest, in when pressed | the button pressed |

## 8. The reads, and what was done with each

**Astra** (`docs/superpowers/briefs/2026-11-08-chat7-inputs-read-astra.md`, word for word): (1) P2 — the room is fixed and ignores
a window dragged away and reopened (the window keeps its place) → **R1, fixed red first** (§6); (2) P3 — a test comment named a
browser-test file that does not exist → fixed.
**The fresh, blind Opus read** (a helper; its report could not be saved word for word — this is the host's summary, said so):
(1) MEDIUM, the same as Astra's (1) — R1; (2) LOW, the phone's browser test never opened a window → added (§7); (3) LOW, nothing
tested a row's window making the room → added (§7); (4) the comment's file name → fixed. Its open questions, looked at in the
pictures: (a) a row clicked at 1340 and up may jump as the columns narrow — (filled); (b) "+ Input" stands under the open window
— drawn so on purpose, named to him; (c) Start 140 may wrap a timed span — (filled); (d) a real scroll bar takes about 15px from
Remarks (the test browser hides it) — (filled); (e) the room goes the moment the row lands, as Medical's does — as built, the
comment corrected. **Tidiness (filed, not fixed):** the room's size written twice (Inputs and Medical stylesheets); the expand
button's font size and line height now unused; a comment of the page untrue → corrected.
**R1, the same in Medical:** Medical's room (D1300) makes the same room for a dragged window — outside this job's lane, filed.

## 9. Break tests

(filled)

## 10. What was NOT walked, and why

(filled)

## 11. The gates

(filled)

## 12. His look

(filled)
