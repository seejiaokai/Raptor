# Evidence sheet — the four Leave War items, chats 99–100 (17 Nov 26)

Branch `claude/lw-four-items`, pull request 801. One batch, one check (D485, D490): [LW-BAL-NEATER] (D2156), [LW-GRID-HOVER-RING]
(D2157), [LW-OIL-EDIT-STEADY] (D2155), [LW-WAR-AUTONAME] (D2158). Pictures: `docs/img/handpass/2026-11-17-lw-four-items/`.

## The eight answers and the tier

| # | Question | Answer |
|---|---|---|
| 1 | Money (OIL included) | **YES** — the award editor saves an OIL award's amount, half, reason and given-by; Balances draws pending figures |
| 2 | The published record | NO — none of the four reaches publishing, signing, amendments or an issued copy: Balances, the grid's hover, the OIL tracker's editor and the New-period window are Leave War surfaces that write no schedule record |
| 3 | Saved data | **YES** — the app now writes the new period's name (the name a war is saved under) by itself |
| 4 | A shared drawer | **YES** — the hover ring is on every man's day cell of the grid; the pending tag is drawn by one part on the phone's and the desktop's rows, admin and read-only |
| 5 | A new gesture or mode | **YES** — the hover ring is a new response to the mouse (no new control) |
| 6 | A new surface | NO — no new screen, panel, sheet or kind of row; each change is inside an existing one |
| 7 | Roles | NO — who may do or see anything is unchanged (`perms.ts` untouched); the tag on a read-only figure is drawing only, walked for member and locked all the same |
| 8 | The warning list | NO — no warning's words or rule touched |

**Tier: FULL** (1 and 3). Told to him by chat 99; the split into two chats (A: this sheet, roll-call, tests, scenario brief;
B: the walk, the reads, the fixes) told by chat 100 (the checklist's step 3).

## The rulings that apply

| Ruling | In the app's words | Checked against the build |
|---|---|---|
| D2156 (answers D2153, D2154) | Balances: every column from the left, heading over its box; PENDING APPROVAL; a pending figure a dashed amber tag, no minus; another kind's on its box's corner | PASS — W1 B-a (0 headings over 2px off at 1536, 2560, 402 both engines), S8; phone faults 8–10 fixed; drawing check: desktop matches, phone departures named |
| D2157 (answers D2151, D2152) | On a PC the grid's one day under the mouse wears a thin cyan ring, no fill; the row's faint tint stays; a phone unchanged | PASS — W1 S9, S10, S18, S19, S20; the row tint is `main`'s, kept |
| D2155 (narrows D2150) | The OIL award editor: one fixed layout; AM / PM's place kept empty; Delete as wide as "Really delete?"; nothing moves | PASS — W2 S2, S11, S13 and the D2155 test; finds 13 (opens past the edge) and 14 (Delete's words) fixed |
| D2158 | The New-period window's Name fills from the dates, follows them; a typed name kept; an emptied box follows again | PASS — W3 S5, S21, S22, S24; reload keeps it |
| D1253, D1482 | Balances' amber pending figures — changed in look by D2156 on the Balances page only | PASS — the person window keeps "−N" (W1 B-d) |
| D1483, D1236 | Balances on a phone pinches out until every column fits | PASS — W1 S16 |
| D1493, D1497 | A figure read only ends where a box's would | PASS — W1 S8 (a read-only figure and its tag) |
| D1164, D260 | Half an OIL day takes AM or PM; an award's day never changes | PASS — W2 S11 (half day round trip), the date shown never changed |
| D641 | The grid behind a window keeps working | PASS — W1 S19, W3 plain-user round |

Clashes: none found (D2156 sets aside D1253's minus on the Balances page only — the person window's tiles keep theirs, the
agent's reading, see the candidates below).

## The roll-call — every place the four changes show

Columns: SHOW (does it draw the change), USABLE (does the press / typing work there), PAINTED (what else stands on those
pixels). Each cell YES / NO-because / MISSING; walked cells get their picture's name.

### 1. The pending tag and the left-set columns (D2156)

| Place | SHOW | USABLE | PAINTED | Proved by |
|---|---|---|---|---|
| Balances, desktop, admin, unlocked — LVE column | YES — PENDING APPROVAL heading, dashed amber tag, no minus | YES — boxes typed (W1 S7) | YES — nothing over it (W1 S16) | W1 B-a, S8; drawing check desk: matches |
| Balances, desktop, admin — another kind's box corner (CCL…CL) | YES — tags on the corner (W1 S8) | YES — a press passes through to the box | YES — no neighbour under the tag | W1 S8 desktop; drawing check desk: matches |
| Balances, desktop, member (figures read only) | YES — tags on read-only figures | YES — his own non-OIL boxes only, the rest read only (W1 S7) | YES | W1 S7, S8 |
| Balances, desktop, locked period | YES | YES — a member 0 boxes and the "locked" note; the admin editable (W1 S7) | YES | W1 S7 (bidding closed and balances locked, both) |
| Balances, phone 402, admin | YES | YES | NO-because the pinned names shrank (find 8) and CCL ran into FCL (find 9) → fixed | W1 B-a, B-b; `leavewar.spec.ts` find 8 and 9 tests; re-walk R-Bb, R-S8, R-Ba |
| Balances, phone, member / locked | YES | YES — as on the desktop (W1 S7 at 402) | YES after find 8 | W1 B-b, S7; re-walk R-Bb |
| Balances, phone, slid to the end (CL's tag whole) | YES — CL's tag whole (the 18px end room) | NO-because a tapped box near the edge left its tag cut (find 10) → fixed | YES | W1 B-c; find 10 test; re-walk R-Bc; drawing check slid: the end room, named |
| Balances, phone, pinched out (D1483) | YES — tags stay on their boxes | YES | YES — tags pass under the pinned names (W1 S16) | W1 S16 |
| Balances, desktop and phone, his own row (`.me`) | YES | YES — a member types into his own row (W1 S7) | YES | W1 S7 |
| Balances, Days taken view | must NOT change — unchanged (NAME, GRADE, LL … OD) | — | — | W1 B-d |
| The person window's tiles ("Pending −1") | must NOT change — unchanged ("LVE −2.5, CCL −1, PL −0.5, CL −1") | — | — | W1 B-d; candidate 1 for him |
| The grid's counter column, Approvals | must NOT change — NO-because option B's rules sit on the Balances page's own parts only; Approvals and the grid opened in the plain round, unchanged | — | — | W3 plain-user round; W2 S14 (Approvals behind the tracker) |

### 2. The hover ring (D2157)

| Place | SHOW | USABLE | PAINTED | Proved by |
|---|---|---|---|---|
| Grid, desktop, an empty day of a man | YES — thin cyan ring, no fill; gone on leaving | n/a — a mark, no press | YES — neighbours not ringed | W1 S9; `leavewar.spec.ts` "the grid's day under the mouse…" |
| Grid, desktop, a day under a leave block / a bid / a pile / a warning mark (the block is drawn above the cell) | YES — on every kind of painted day; on a joined block three sides show, the run-on side under the block (find 11, a look for him) | n/a | YES | W1 S9 (`w1-S9-admin-joined-first-c.png`) |
| Grid, desktop, his own row (two cyan lines kept) | YES — the ring, his row's lines kept | n/a | YES | W1 S18 |
| Grid, desktop, a selected / picked day | must NOT — the selection's 2px ring stays | — | — | W1 S10; `leavewar.spec.ts` "a picked day keeps its own stronger ring…" |
| Grid, desktop, the move's landing day, the just-added ring | must NOT — the move's target amber; no thin ring over it | — | — | W1 S10 |
| Grid, desktop, Rearrange — a row being landed on | must NOT — the ring back only after leaving Rearrange | — | — | W1 S10 |
| Grid, desktop, during a drag (`tdrag`) | must NOT — the strong marks only | — | — | W1 S10 |
| Grid, desktop, Manning / Event / heading rows, the counts row's amber or red ring | must NOT — names, headings, Events and manning rows no ring | — | — | W1 S9 |
| Grid, desktop, behind an open window (D641) | YES — behind the picked-days panel; none under New leave war, whose press does nothing | YES — a press on a day swaps to the one-day window | YES | W1 S19 |
| Grid, phone — a tap | must NOT — `(hover: hover)` false; the tap frame only while its window is open, nothing left after, both engines | — | — | W1 S20; the media rule test |

### 3. The award editor's fixed layout (D2155)

| Place | SHOW | USABLE | PAINTED | Proved by |
|---|---|---|---|---|
| OIL tracker, from the tab, desktop, admin — an award opened | YES — the fixed layout on every lane (CNY, partly used, 2027, AM half) | YES — Save, Cancel, Delete pressed | YES | W2 S1, S2, S12, S13 |
| OIL tracker, phone 402, admin | YES | NO-because Delete / Cancel opened past the screen's edge (find 13) → fixed | YES after the fix | W2 E-a; find 13 test; re-walk R-Ea |
| OIL tracker opened from Balances (the OIL figure) | YES | YES — closed back to Balances | YES | W2 S14 (Balances name → person window → OIL tile) |
| OIL tracker opened from Approvals | YES | YES — Escape back to Approvals | YES | W2 S14 |
| Amount 0.5 ↔ 1 ↔ 2.5: date, reason, given-by, buttons unmoved | YES — nothing moved, phone and desktop | YES | YES | W2 S2, S11; `leavewar.spec.ts` D2155 test (to a tenth of a pixel) |
| Delete armed ("Really delete?") ↔ not: nothing moves | YES — Delete no wider armed; its words now on Cancel's line (find 14) | YES — two taps delete | YES | W2 S2, S13; find 14 test |
| A refusal under the buttons (a bad amount) | YES — under the buttons, the parts keep their boxes | YES — a valid retry saves | YES | W2 S12 |
| The correction editor (a taken day's) | must NOT — a different editor opens, unchanged | — | — | W2 S1 (dol-3); candidate 2 for him |
| A member — no editor | must NOT — no editor, no gear, no credit panel | — | — | W2 E-b, desktop and both phones |
| The editor's words — no code note drawn on screen | | | | oiltracker.test.tsx "a grant box shows who gave it…" (red on the build, 17 Nov 26) |

### 4. The period's name from its dates (D2158)

| Place | SHOW | USABLE | PAINTED | Proved by |
|---|---|---|---|---|
| "+ New period" from the war picker, desktop | YES — the name follows the dates | YES — Create | YES | W3 S21, S22 |
| the same, phone | YES — both engines | YES | YES | W3 S21, S22 (phoneC, phoneW) |
| The Holidays ask (a holiday on dates no period covers) — the window over Days | YES — "MAR - DEC 28" | YES — Create, the holiday saved | YES — whole above the Days window | W3 S5 (both doors, all sizes) |
| Dates changed after a typed name — kept | YES | YES | YES | W3 S21 |
| Box emptied, then dates changed — follows again | YES — spaces-only too | YES — Create greyed while empty | YES | W3 S21e |
| Across a year's end; one month; days mid-month | YES — "DEC 29 - FEB 30", "JAN 29" | YES | YES | W3 S21, S24 |
| The made period's name in the picker, Balances' title, the Holidays tag | YES — the picker, Open for bidding, Events, Days taken print it; Balances' main view and Approvals print no name | YES — the "+3 pending in …" link opens it | YES | W3 S23 |
| Saved and read back after a reload | YES — kept after a reload | YES | YES | W3 S24 (`w3-desk-s24-12-after-reload.png`) |

## Candidates to put to him (D852 — the same improvement elsewhere, never changed unasked)

1. The person window's tiles still show a pending figure with a minus ("Pending −1") — the reading D2154 says confuses.
2. The OIL tracker's correction editor (a taken day's) is not given the steady layout.
3. Two periods in one month take the same name ("JAN 29"); the picker tells them apart only by place (W3, scenario 24).
4. The grid's day sheet has an award editor of its own that still moves its Save (both reads).

## Departures from the drawings to name to him (not yet shown)

1. The phone row keeps 18px at its end so CL's tag is whole when slid to the end (the drawing's slid picture cut it).
2. "INCL. CARRIED FWD" wraps to three lines, as the drawing's picture has it (the backlog item said two).
3. Read-only figures (a member, or locked) get the tag on their corner too — the drawing shows an admin's boxes only.

## The five sizing lines (§7.0)

Written by the host (Opus), chat 101, 17 Nov 26, before any walker started.

1. **Type of change:** E (the layout of Balances and of the award editor), C (the hover ring — a new response to the
   mouse), D (the pending tag drawn on the phone's and the desktop's rows, admin and read-only, by one part but in
   several homes), G (the period's name is saved data — the made period read back after a reload, and Undo).
2. **What only a walk could find here:** a column whose heading does not stand over its boxes at an iPhone's or a
   desktop's width, or a tag cut or covered (slid to the end, pinched out, his own row); a ring that does not draw over
   a filled day (a leave block is drawn above the cell), or that sticks after a phone tap, or that fights a picked
   day; the award editor sliding on a press or hanging past a phone's edge as it opens; the name box not following the
   dates as a person picks them in the real calendar, and the name read back in the picker, Balances' title, the
   Holidays tag and after a reload. Carried already: the name's arithmetic (`warname.test.ts`), the typed / emptied
   rule (`wars.test.tsx`), the ring's computed style and the editor's geometry to a tenth of a pixel
   (`leavewar.spec.ts`, phone and desktop) — those work through the real controls but on the demo's convenient rows.
3. **What the ledger says:** Leave War walks of type E / D / C on one Sonnet walker took 13–51 min and 190k–280k
   tokens; they found their faults on the phone (the pinned rows, a window's height) and the reads found what a walk
   could not (a press eaten after Escape). Walks of type E with a drawing found their differences by the drawing check,
   not by eye.
4. **The walk chosen:** two Sonnet walkers at once on the frozen build of `01f1030c4`, each in its own browser world:
   **W1** Balances and the hover ring (desktop 1536 Chromium; phone 402 Chromium by touch and 402 WebKit), admin,
   member, a locked period; **W2** the award editor and the new period's name (the same sizes), admin and member, and
   the plain-user round of the Leave War (§7.0a). Astra's scenarios set the list (below). Sizes beyond the required:
   WebKit at 402 (his iPhone's engine) for every layout scenario; 2560 for Balances (lesson 11). The drawing check run
   beside it by an Opus helper on the same frozen build (three part lists written first — the drawings had none).
   Repeated cases left to tests: the name's date pairs (`warname.test.ts` — calls the calculation directly; the walk
   drives five through the real calendar); the editor's amounts beyond 0.5 / 1 / 2.5 (`leavewar.spec.ts` — the real
   controls).
5. **After the walk:** its row in `docs/walk-ledger.md` — added at the close.

## The lessons of §7.11, each against a scenario or a test

Gone through by the host, chat 102 (the walk's briefs carried them: chat 101's W1–W3, chat 102's re-walk).

| # | Lesson | Covered by, or why it cannot apply |
|---|---|---|
| 1 | State × reading table | Balances: admin / member unlocked / member locked × bidding open / closed (W1 S7); the editor: amount 0.5 / 1 / 2.5 / 3 × Delete armed or not (D2155 test, W2 S2) |
| 2 | Drags and swipes at ordinary speed | The phone's finger slide of Balances and the tracker (W1 B-b, W2 E-a over CDP touch); the grid's drag (W1 S10); no new gesture |
| 3 | After every press, what tells him and what is out of sight | E-a: the editor's buttons out of sight on opening — find 13; Balances' tapped box — find 10 |
| 4 | A window that leaves the page working | W1 S19 (the ring behind the picked-days panel; none under New leave war) |
| 5 | A box moved into sight, checked where it rests | Find 10's reveal and find 13's: re-walk R-Bc, R-Ea, against the pinned names |
| 6 | Handed to the phone (scrolling, bounce) | The two reveals slide the list by script, not the phone's own motion; the real iPhone's slide and bounce — his look |
| 7 | Steered frame by frame against the phone's motion | Cannot apply — nothing steers a motion frame by frame |
| 8 | A screen with an approved drawing | The drawing check on all three drawings, run again after the fixes (`2026-11-17-drawcheck-*-rerun`); departures named |
| 9 | Every list measured, heading against figures | W1 B-a at 1536, 2560, 402 both engines; S17 at 125% |
| 10 | A page hidden and shown again | Cannot apply — no change reads the page's visibility; W3's reload and period switch read the name back |
| 11 | A reading that depends on how much fits | W1 B-a and S17 at 1536 and 2560 |
| 12 | Every page each window opens from | W2 S14: the tracker from the tab, Balances, the grid's person window, My leave, over Approvals |
| 13 | A pinch part-way down a list | W1 S16 (tags under the pinned names, pinched); re-walk R-Ea pinched in Chromium |
| 14 | A keyboard walk's boxes found by searching the code | Cannot apply — no keyboard walk changed; the editor's boxes typed (W2 S2) |
| 15 | Every bar over a scrolling area | Balances' pinned name panel — find 8, re-walk R-Bb |
| 16 | After a refusal at a box | W2 S12: refused amounts, then a valid retry saved |
| 17 | A control that shows or hides part of a page | The editor's AM / PM place (D2155 test, both ways and back); the archive mark (W2 S1) |
| 18 | Prints or downloads | Cannot apply — nothing prints or downloads |
| 19 | Every window closed by each of its ways | W2 S14, W3 plain-user round (✕, Escape, outside, Cancel), phone WebKit and desktop |
| 20 | A gesture the ways a hand makes it | Cannot apply — no new gesture; the hover is a mouse resting (W1 S9 at three points) |
| 21 | A test browser's touch is not his phone's | The sheet names for his look: the two reveals' slide and the iPhone's letters in the editor's buttons |
| 22 | Checked by what is drawn | The ring by computed style and picture (W1 S9); the tag's place by its box (find 10's test) |
| 23 | What a tap opens, by the rulings | W2 S1: an award opens the award editor, a correction the correction editor, a carried-in figure nothing |
| 23 (second) | Side-by-side boxes one height and one line | The editor's three buttons — find 14, its test; W1 B-a's heading pairs |
| 24 | Placed against the top bar, or measured on a scroll | The reveals measure on open, not on a scroll; nothing set against the top bar |
| 25 | Made through the app's own controls in every place | W3 S5 (both holiday doors) and S21; W1 B-c's pending made by the request controls |
| 26 | What was under the fingers stays | W2 S2: typing and arming Delete moved nothing; the reveal runs once, on opening (re-walk R-Ea) |
| 27 | Neighbouring controls before and after a press | D2155 test (every part to a tenth of a pixel); find 9 (CCL beside FCL) |
| 28 | On a phone, what a press opens proved on screen first | W2 E-a pictured the editor at once with no script slide — how find 13 was found |
| 29 | Anything that reads today | Cannot apply — the name reads the dates picked, not today |
| 30 | Every phone tap pictured within ~100ms | W2 E-a, W1 B-c, re-walk R-Bc and R-Ea |
| 31 | A page fitted to the screen that scrolls inside itself, at 125% | W1 S17 at 1536 with 125%; no fitted page changed |

## Astra's scenarios

Astra (`gpt-6-astra`, high, read-only, the branch at `01f1030c4`), chat 101, brief
`docs/superpowers/briefs/2026-11-17-lw-four-items-scenarios-brief.md`, report
`…/2026-11-17-lw-four-items-scenarios-astra.md`: 24 ranked scenarios and the roll-call's gaps. Its corrections taken:
"locked" split into **bidding closed** and **balances locked for members**; a member with balances unlocked edits his
own non-OIL boxes. All 24 handed to the walkers (`…/2026-11-17-lw-four-items-walk-brief.md`: W1 7–10, 15–20; W2 1–4,
11–14; W3 5, 6, 21–24 and the plain-user round), none set aside.

## Orders walked — what the screen said

The first walk, on the frozen `01f1030c4` (before finds 8–10), three Sonnet walkers in their own worlds, each signing in
through the real screen (admin, member): **W1** Balances and the hover ring — 9 PASS, 4 FAIL, 1 RECORDED; **W2** the award
editor — 132 PASS, 0 FAIL, 35 RECORDED; **W3** the period's name and the plain-user round — 148 PASS, 0 FAIL, 47 RECORDED,
6 NOT WALKED. Reports and pictures `docs/img/handpass/2026-11-17-lw-four-items/w1|w2|w3/`.

**Judged by the host, chat 102 (17 Nov 26), every FAIL's picture and every OIL / saved-data PASS's opened, cropped:**
- W1 **B-c** and **S8** — finds 10 and 9, fixed red-first after this build; re-walked below.
- W1 **S9 / S18** (a hovered day's own tint reads cyan .05) — not this change: the grid's row tint, `.mx tbody tr:hover td`,
  is word for word on `main` and D2157 keeps it ("the row's faint tint stays"). `w1-S9-admin-duty-weekend-c.png`: the thin
  ring on the day, the row's faint tint beside it. **PASS** for D2157.
- W1 **S9, a joined block** (`w1-S9-admin-joined-first-c.png`): the ring shows on three sides of the block's first day,
  the block covering only the side where it runs on — find 11 stays a look for him, softer than the read put it.
- W1 **B-d** RECORDED — Days taken and the person window's "Pending −N" unchanged, as the roll-call says they must be.
- W2 **E-a** — find 13, fixed. W2 **S2**'s Save (amount 3) and Delete twice, opened (`w2-Ea-chromium-dol1-7-after-save.png`):
  the award reads +3 and Drifter's balance 4 → 5 (+6.5 → +7.5) — OIL right.
- W2 **E-b**'s oddity (the member's tracker "lacked" `l7`): `w2-Eb-desk-chromium-1-tracker.png` shows Drifter's "+1 3 Jan
  Weekend recovery" drawn — the walker searched by the admin's box name, which a member's box does not carry. Not a fault.
- W2 the correction editor, a carried-in figure, the archive (RECORDED) — boundaries as the roll-call has them.
- W3 every RECORDED is the app as ruled: a spaces-only name keeps Create greyed and follows the dates again (D2158's
  "emptied"); Escape with the month chooser open closes the chooser only (one layer a press); a reload lands on the sign-in
  screen with the world kept; the person window and the tracker leave the grid working (D641) and so do not close on an
  outside tap; a new period opens closed for bidding. `w3-desk-s24-12-after-reload.png`: the new period's name kept after a
  reload. **Two periods in one month are both named "JAN 29"**, told apart in the picker only by their place — as D2158
  rules; a candidate for him (below).
- W3 **scenario 6** (the first period ever) NOT WALKED: the demo always seeds two periods and no control deletes them all;
  carried by `src/leavewar/emptywar.test.tsx`.

**The re-walk, chat 102, on the frozen `356e2fc6a` (finds 8–10, 13, 14), one Sonnet walker** — brief
`docs/superpowers/briefs/2026-11-17-lw-four-items-rewalk-brief.md`, report and 116 pictures `…/2026-11-17-lw-four-items/r1/`:
**72 PASS, 0 FAIL, 16 RECORDED.** R-Bb (the pinned names full width, admin / member, unlocked / locked, slides 0–220, after a
pinch), R-Bc (the tapped PL box and its tag end at 398 inside 402), R-S8 (each press focuses its own box; CCL to FCL 5px
on the phone), R-Ba (no heading over 2px off; CCL 61px phone, 66px desktop), R-Ea (both awards open with all three buttons
whole, clear of the names; typing slides nothing; nothing moves), R-Ed (one height, one line, spread 0), R-plain (a typed
CCL kept; the 14 Mar award 2 → 3, BAL 4 → 5; deleted, BAL 5 → 2) — all PASS. Opened by the host:
`r1-Ea-webkit-dol-1-2-settled.png` (the editor whole in WebKit), `r1-Bb-chromium-admin-unlocked-slide220.png` (the walker's
"red mark" is the last letter of WAR BAL half under the pinned name heading — ordinary sliding, the panel solid). Its lead,
Tab after a typed Balances figure going to the tab button, is in the box's own code, unchanged from `main` — filed
`[LW-BAL-TAB-NEXT]`. Find 15 (GitHub's wide letters) came after this re-walk; its test carries it, the walked layout
unchanged on this PC's letters.

## Cases carried by a test

| Case | Test | What it proves |
|---|---|---|
| No code note drawn in the award editor | `oiltracker.test.tsx` "a grant box shows who gave it…" | red on the first build (the editor showed the note as words), green after |
| The name fills from the dates; Create ready | `warask.test.tsx` "opens its own New-period sheet…"; `leavewar.spec.ts` "a holiday on dates no leave period covers waits" | re-expressed for D2158 (they expected an empty name and Create greyed) |
| A box's figure whole, nothing beside it moving | `leavewar.spec.ts` "M5a walk A-F3" | re-expressed for option B: War bal read at its left edge (the column's start) |
| The hover ring drawn on the hovered day only, gone on leaving; his own row's lines kept | `leavewar.spec.ts` "the grid's day under the mouse wears a thin ring…" (desktop) | computed style of the day and its neighbours |
| A picked day keeps the selection's ring under the mouse; the phone has no mouse and every ring rule is a mouse's only | `leavewar.spec.ts` "a picked day keeps its own stronger ring…" (desktop: mid-drag; phone: the media rule) | |
| The award editor: amount 0.5 ↔ 1 ↔ 2.5 ↔ 3 and Delete armed move nothing; every part inside its box and the screen, on top | `leavewar.spec.ts` "the OIL award editor: the amount 0.5 ↔ 1 ↔ 2.5…" (phone 402 and desktop) | to a tenth of a pixel |

Red-first, 17 Nov 26 (chat 100): the branch's new unit tests run on `main`'s app code — 5 red (the name from the dates ×3,
the Holidays ask, the corner tag); its changed browser tests — 9 red (option B ×4, drawing E ×2, B-F4, the Holidays ask
×2); all green on the branch.

## Break tests

One a wired surface, each seen red on a build without its part (§8):
- Balances, the left-set columns and the tag: `leavewar.spec.ts` option B ×4, B-F4, the three find 8–10 tests (red on
  `01f1030c4`); `balances.test.tsx` the corner tag (red on `main`).
- The hover ring: `leavewar.spec.ts` "the grid's day under the mouse…" (red: "none", find 5) and "a picked day keeps its own
  stronger ring…".
- The award editor: the D2155 test (red at 0.5 → 1, find 6) and "…opens with Save, Cancel and Delete in sight…" (red
  443.97 > 402.5 and 1.8 > 0.5, finds 13–14); `oiltracker.test.tsx` the code note (find 1).
- The period's name: `warname.test.ts`, `wars.test.tsx`, `warask.test.tsx` (red on `main`, chat 100).

## Errors seen

The re-walk watched page and console errors on every page for its whole run: none. The first walk's three reports name
none; whether they watched is not stated.

## What was NOT walked, and why

- Astra's scenario 6, the first period ever: the demo always seeds two periods and no control deletes them all —
  `src/leavewar/emptywar.test.tsx` carries it.
- A touch drag across days or names on the phone (W2 S3's two Grant OIL routes): not drivable in the test browser; the
  one-day route stands for the phone, and the routes are unchanged by this batch.
- WebKit's finger slide: not drivable here; a script slide stood in, said so in each row.
- Only his iPhone can show: the real slide and bounce after the two reveals, and Apple's letters in the editor's buttons
  and Balances' headings — on his look card.

## The reads

Two blind reads, chat 101, 17 Nov 26, same brief (`docs/superpowers/briefs/2026-11-17-lw-four-items-read-brief.md`),
each on an exported copy of `01f1030c4` without the evidence sheet, the handoff or the pictures, neither seeing the walk
or the other: **Astra** (`gpt-6-astra`, high, read-only; report `…/2026-11-17-lw-four-items-read-astra.md`) — 2 findings
(the pinned names, the tag after a tap); **a fresh Opus reader** (report `…/2026-11-17-lw-four-items-read-opus.md`, condensed by the host) — 4 findings
(the same two, CCL into FCL, the ring hidden on a day inside a leave block). Both: no fault in the OIL save or the saved
period name; the person window's "−1" and the grid's day sheet award editor (it still moves) noted as outside the
rulings — candidates for him (D852). Tidiness (filed, not fixed): the old phone column list (removed with the fix),
`.bp-oc`'s overridden widths and their stale comment, the desktop OIL cell's stale comment, `.w-war`'s `nowrap` that never
applies, the two hover rules repeating one long selector.

**The fix round's narrow read (§5 "A fix is new code"), chat 103, 17 Nov 26.** Round 1: a fresh Opus reader, handed only the
three fix commits of finds 8–10 and 13–15 and the faults they answer (`docs/superpowers/briefs/2026-11-17-lw-four-items-fixread-brief.md`),
no sheet, no walk — finds 16–19. Each fix judged right for its own fault. Round 2: the same kind of reader on the fix of find 17
alone (`843247955`): right for its fault, the move before the first paint sound (nothing takes focus, a re-render with the
same award open does not re-slide, zoom read off the screen), two gaps — finds 20–21, each a one-line change with its own
red-first test. Under §5's threshold ("more than a one-line guard") they take no third read: round 2 is the last.

## Gate counts

GitHub's run of the pull request (the full set while the repo is public, D1086): green on `2edd9f5c4` (finds 13–15) and
on `b145e487c`, the last code (finds 17–21) — build, the original's 728, unit, browser (phone and desktop), the Tracker's,
the rule and document checks; the notes commits after it re-run it, and the closing report names the last one read. On
this PC, between rounds: every OIL browser test 28 passed (2 skipped by width), the OIL tracker's unit file 30, the type
check clean, the phone Balances tests 3.

**§12, ticked (chat 103):** the eight answers and the tier ✓ · the rulings listed, no clash ✓ · the roll-call, no blanks ✓ ·
the production build driven at both widths ✓ · the fixture through the app's own controls ✓ (Leave War's everything-case,
§2a) · every surface seen and operated ✓ · the walk sized before it began, every order a result ✓ · the real result
observed — the saved award and the saved period name read back after a reload ✓ · tests through the app's own routes ✓ ·
one red break test per wired surface ✓ · the gates ✓ · the reads done and every finding disposed of ✓ (16 to him) · the
sheet with its pictures and what was not walked ✓ · his look — asked, chat 103.

## What the check found, and each disposition

| # | Found by | What | Disposition |
|---|---|---|---|
| 1 | GitHub's code check, 17 Nov 26 | The award editor drew its layout note on screen as words | Fixed red-first (`oiltracker.test.tsx`) |
| 2 | GitHub's run | Two tests still expected the New-period name empty and Create greyed | Re-expressed for D2158 — the app was right |
| 3 | GitHub's run (phone) | A-F3 measured War bal at its right edge, which now moves with the figure | Re-expressed for option B — the app was right |
| 4 | GitHub's run (phone) | "a finger behind an open sheet scrolls the grid" failed once, passed on its retry and locally | Watch on the next run; not touched by the four items |
| 5 | Chat 100's new browser test | **The hover ring never drew on a desktop.** The grid's style file is nested under the Leave War page, so a rule starting at the page's `body` read as "a body inside the page" and matched nothing; its drag guard also named the scheduler's puck drag, not the grid's own | Fixed red-first (`leavewar.spec.ts` "the grid's day under the mouse…", red: "none"): the rule hangs off the grid's own wrapper, off while the grid selects |
| 6 | Chat 100's new browser test | **The award editor slid by about half a pixel** when the amount went 0.5 ↔ 1, phone and desktop: the empty AM / PM place, drawn as plain words, stood 0.4–0.5px shorter than the AM / PM buttons | Fixed red-first (`leavewar.spec.ts` "the OIL award editor…", red at 0.5 → 1 on the phone): the empty place is the pair's own buttons, hidden and out of reach; the test now measures to a tenth of a pixel |
| 7 | GitHub's run of `01f1030c4` (phone) | The award editor test: "Delete armed" read every part 14px left — with GitHub's wider letters Delete hung ~12px past a 402 phone's edge and the test's own press slid the list | The test's set-up: it now brings Delete into view before measuring (a finger's tap slides nothing). How the editor opens on a phone, cut or not, is the walk's E-a |
| 8 | Both reads (Astra, fresh Opus) | **Phone Balances: the pinned names shrank to their words** (86px of 132), so slid boxes showed beside each name, ragged row by row — D1518 | Fixed red-first (`leavewar.spec.ts` "Balances on a phone: the pinned name panel fills…", red 86 ≥ 131.5): the name cells stretch again. The drawing's slid picture had the same shrink — a departure from it, named |
| 9 | Fresh Opus read | **Phone Balances: CCL's box ran 2px into FCL's** — its cell carries OTHER LEAVE's rule (7px) in a 54px column | Fixed red-first ("…CCL's box never touches FCL's box", red −2): CCL's column 61px. A 7px departure from the drawing (it had the touch), named |
| 10 | Both reads | **Phone Balances: a tapped box near the right edge left its corner tag cut** (408 vs the list's 402) — the reveal measured the cell, which no longer holds the out-of-flow tag; B-F4's fix undone | Fixed red-first ("…a box focused near the right edge keeps its pending tag inside the list", red 408 ≤ 402): the reveal measures the tag too |
| 12 | The drawing check (an Opus helper, chat 101, on `01f1030c4` — before finds 8–10; every record replays its approved picture exactly) | Desktop: no difference on any of the three. Phone Balances: rows 6px wider (the known end room; CL's tag whole at 396 where the drawing cut it). Phone award editor: Delete 79.2 wide at rest, drawn 63.4 — the drawing's own Delete grew to 79.2 when armed, against D2155; the build keeps 79.2 always. Under 2px but seen: "Delete" sits 1.8px higher than "Cancel" on the phone (1px desktop). The hover beside a tapped day: a stand-in's 0.12 fill no person reaches | Departures for him with the recommendation to keep the build: the end room, Delete's width. The 1.8px word offset: to reproduce and fix if real. Re-run the Balances check after finds 8–9 (CCL's column now 7px wider than drawn — a named departure). Runs `docs/img/handpass/2026-11-17-drawcheck-lw-*`; a "ring" check added to the comparing (selftest 22 of 22) |
| 11 | Fresh Opus read | On a day inside a joined leave block the hover ring is mostly hidden (the block is drawn over the day's sides); on his own row it changes nothing he can see | A look for him, not an outright fault: the drawing hovered an empty day only. Ringing filled days adds a mark he will see — a drawing first (D1625), with the walk's pictures (W1 scenario 9) |
| 13 | The walk, W2's E-a (chat 101), judged and reproduced by the host (chat 102) | **On a 402 phone an award near the list's right edge opened its editor with Cancel cut and Delete wholly past the screen** (the 14 Mar award: Cancel to 444, Delete 449–528; the 3 Jan award: Delete to 423). `main` opened the same 300px editing box without sliding the list either, but D2155's Delete, as wide as "Really delete?", made it 16px worse | Fixed red-first (`leavewar.spec.ts` "the OIL award editor opens with Save, Cancel and Delete in sight…", red 443.97 ≤ 402.5 on the phone, green on the desktop): the list slides only as far as the open editor needs, never under the pinned names (the way a tapped Balances box comes into sight) |
| 14 | The drawing check (find 12's 1.8px), reproduced by the host (chat 102) | **"Delete" sat 1.8px off "Cancel"'s line on a phone, 1px on a desktop** — its words stacked in a grid beside its hidden "Really delete?" | Fixed red-first (the same test: the three buttons one height, their words on one line, red 1.8 / 1.0 > 0.5): the hidden twin is a line of no height, so Delete's words sit as Cancel's do; Delete still no wider when armed (the D2155 test green) |
| 15 | GitHub's run of `356e2fc6a` (phone), reproduced by the host with wide letters stood in by spacing | **With wider letters than this PC's, Delete still opened 8.8px past a 402 phone's edge** — the button row, held on one line, forced the editing box wider than the room beside the pinned names | Fixed red-first (the in-sight test's "— wide letters" twin, red 429.39 ≤ 402.5): the buttons wrap only when the letters are too wide; Delete keeps its one width, so nothing moves (D2155 test green). A wrapped Delete stands at its own height on its own line |
| 16 | The fix round's narrow read (chat 103), reproduced by the host on the phone (Ctrl+scroll zoom, 402 wide) | **Pinched in, the award editor no longer fits beside the held names:** at zoom 1.04 Delete ran to 414 on a 402 screen; at 1.36 Delete stood wholly past the edge (406–539), Cancel ending at 400. The editor is a fixed size inside the zoomed table, wider than the room; the slide keeps the editor's left (the amount) clear of the names, so the right end is what stays cut. The phone opens at 0.8, where it fits (find 13); one notch in (0.855, 0.914) still fits. `main` did the same at every zoom | **A product choice — put to him** on the look card (his "the rest looks good", D2172, and "looks good", D2175: left as is — find 11 too): leave it (Save, Cancel and the amount in sight; a finger slides the list to Delete, as for any wide row) — recommended; or zoom the list out just far enough while the editor is open. Not built either way until he answers |
| 17 | The fix round's narrow read (chat 103), reproduced by the host | **The last award, its row at the list's foot, opened with Save, Cancel and Delete all below the list's edge** (phone: buttons 864–892, the list ending at 833) — the slide of find 13 was sideways only, and the editor is taller than the award | Fixed red-first (`leavewar.spec.ts` "the OIL award editor at the list's foot opens…", red 894.7 ≤ 833.4 phone, 926.5 ≤ 850.4 desktop): the list slides up as far as the editor needs, never under the heading rows held at the top |
| 18 | The fix round's narrow read | The editor was drawn cut for a frame before it slid (the slide waited a frame; nothing here needs that wait — no box takes focus) | Fixed with 17: the slide runs before the first paint. Below what a picture 100ms after the tap can show; carried by reading the code, said so |
| 19 | The fix round's narrow read | Three test weaknesses: the in-sight test's tap could land off-screen if the award moved past the edge; the full-width names test read rows cut at the list's foot; the in-sight test accepts a wrapped button with this PC's letters too | The first two taken (an assert the award is tappable on screen; only rows inside the list). The third declined: on GitHub's own, wider letters the plain case may wrap by design (find 15), so the check would fail there with no fault; Delete's width is pinned by the D2155 test |
| 20 | The fix round's second narrow read (chat 103), reproduced by the host | **An award tapped half under the held headings opened its first line (the amount, the date) behind the group heading strip** ("SXO · 12" is held under the two heading rows too; the top limit counted only those) | Fixed red-first (`leavewar.spec.ts` "…tapped half under the held headings opens with its first line in sight", red: the amount box not on top at its middle, phone and desktop): the limit leaves room for one group strip |
| 21 | The fix round's second narrow read, reproduced by the host | **A refused save's warning, at the list's foot, stood below the list's edge** (phone 843.7 > 833.4, desktop 864.2 > 850.4) — the slide ran only when an award opened, and the warning is drawn after | Fixed red-first ("…a refused save's warning comes into sight"): the warning appearing slides the list the same way |

Why the build's own checks missed 5 and 6: no browser test of either existed — chat 99 listed them as to be written (its
"Pick up here"); the ring was compared with its drawing only as injected CSS on `main`'s build, where the nesting did not
apply. The lesson is already §7.11's 22 ("checked by what is drawn") — the new test asserts the computed style on the day.
