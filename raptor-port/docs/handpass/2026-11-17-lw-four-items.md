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
| D2156 (answers D2153, D2154) | Balances: every column from the left, heading over its box; PENDING APPROVAL; a pending figure a dashed amber tag, no minus; another kind's on its box's corner | |
| D2157 (answers D2151, D2152) | On a PC the grid's one day under the mouse wears a thin cyan ring, no fill; the row's faint tint stays; a phone unchanged | |
| D2155 (narrows D2150) | The OIL award editor: one fixed layout; AM / PM's place kept empty; Delete as wide as "Really delete?"; nothing moves | |
| D2158 | The New-period window's Name fills from the dates, follows them; a typed name kept; an emptied box follows again | |
| D1253, D1482 | Balances' amber pending figures — changed in look by D2156 on the Balances page only | |
| D1483, D1236 | Balances on a phone pinches out until every column fits | |
| D1493, D1497 | A figure read only ends where a box's would | |
| D1164, D260 | Half an OIL day takes AM or PM; an award's day never changes | |
| D641 | The grid behind a window keeps working | |

Clashes: none found (D2156 sets aside D1253's minus on the Balances page only — the person window's tiles keep theirs, the
agent's reading, see the candidates below).

## The roll-call — every place the four changes show

Columns: SHOW (does it draw the change), USABLE (does the press / typing work there), PAINTED (what else stands on those
pixels). Each cell YES / NO-because / MISSING; walked cells get their picture's name.

### 1. The pending tag and the left-set columns (D2156)

| Place | SHOW | USABLE | PAINTED | Proved by |
|---|---|---|---|---|
| Balances, desktop, admin, unlocked — LVE column | | | | |
| Balances, desktop, admin — another kind's box corner (CCL…CL) | | | | |
| Balances, desktop, member (figures read only) | | | | |
| Balances, desktop, locked period | | | | |
| Balances, phone 402, admin | | | | |
| Balances, phone, member / locked | | | | |
| Balances, phone, slid to the end (CL's tag whole) | | | | |
| Balances, phone, pinched out (D1483) | | | | |
| Balances, desktop and phone, his own row (`.me`) | | | | |
| Balances, Days taken view | must NOT change — the drawing is of the Balances view | | | |
| The person window's tiles ("Pending −1") | must NOT change — D2156 names the Balances page only (agent's reading) | | | |
| The grid's counter column, Approvals | must NOT change — not the Balances page | | | |

### 2. The hover ring (D2157)

| Place | SHOW | USABLE | PAINTED | Proved by |
|---|---|---|---|---|
| Grid, desktop, an empty day of a man | | n/a — a mark, no press | | |
| Grid, desktop, a day under a leave block / a bid / a pile / a warning mark (the block is drawn above the cell) | | | | |
| Grid, desktop, his own row (two cyan lines kept) | | | | |
| Grid, desktop, a selected / picked day | must NOT — the stronger mark stays | | | |
| Grid, desktop, the move's landing day, the just-added ring | must NOT | | | |
| Grid, desktop, Rearrange — a row being landed on | must NOT | | | |
| Grid, desktop, during a drag (`tdrag`) | must NOT | | | |
| Grid, desktop, Manning / Event / heading rows, the counts row's amber or red ring | must NOT — not a man's day cell | | | |
| Grid, desktop, behind an open window (D641) | | | | |
| Grid, phone — a tap | must NOT — no ring stuck after a tap (`hover: hover` only) | | | |

### 3. The award editor's fixed layout (D2155)

| Place | SHOW | USABLE | PAINTED | Proved by |
|---|---|---|---|---|
| OIL tracker, from the tab, desktop, admin — an award opened | | | | |
| OIL tracker, phone 402, admin | | | | |
| OIL tracker opened from Balances (the OIL figure) | | | | |
| OIL tracker opened from Approvals | | | | |
| Amount 0.5 ↔ 1 ↔ 2.5: date, reason, given-by, buttons unmoved | | | | |
| Delete armed ("Really delete?") ↔ not: nothing moves | | | | |
| A refusal under the buttons (a bad amount) | | | | |
| The correction editor (a taken day's) | must NOT — D2155 names the award's editor (candidate, below) | | | |
| A member — no editor | must NOT — admin only | | | |
| The editor's words — no code note drawn on screen | | | | oiltracker.test.tsx "a grant box shows who gave it…" (red on the build, 17 Nov 26) |

### 4. The period's name from its dates (D2158)

| Place | SHOW | USABLE | PAINTED | Proved by |
|---|---|---|---|---|
| "+ New period" from the war picker, desktop | | | | |
| the same, phone | | | | |
| The Holidays ask (a holiday on dates no period covers) — the window over Days | | | | warask.test.tsx; leavewar.spec.ts "a holiday on dates no leave period covers waits" |
| Dates changed after a typed name — kept | | | | wars.test.tsx |
| Box emptied, then dates changed — follows again | | | | wars.test.tsx |
| Across a year's end; one month; days mid-month | | | | warname.test.ts |
| The made period's name in the picker, Balances' title, the Holidays tag | | | | |
| Saved and read back after a reload | | | | |

## Candidates to put to him (D852 — the same improvement elsewhere, never changed unasked)

1. The person window's tiles still show a pending figure with a minus ("Pending −1") — the reading D2154 says confuses.
2. The OIL tracker's correction editor (a taken day's) is not given the steady layout.

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

## Astra's scenarios

## Orders walked — what the screen said

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

## Errors seen

## What was NOT walked, and why

## The reads

## Gate counts

## What the check found, and each disposition

| # | Found by | What | Disposition |
|---|---|---|---|
| 1 | GitHub's code check, 17 Nov 26 | The award editor drew its layout note on screen as words | Fixed red-first (`oiltracker.test.tsx`) |
| 2 | GitHub's run | Two tests still expected the New-period name empty and Create greyed | Re-expressed for D2158 — the app was right |
| 3 | GitHub's run (phone) | A-F3 measured War bal at its right edge, which now moves with the figure | Re-expressed for option B — the app was right |
| 4 | GitHub's run (phone) | "a finger behind an open sheet scrolls the grid" failed once, passed on its retry and locally | Watch on the next run; not touched by the four items |
| 5 | Chat 100's new browser test | **The hover ring never drew on a desktop.** The grid's style file is nested under the Leave War page, so a rule starting at the page's `body` read as "a body inside the page" and matched nothing; its drag guard also named the scheduler's puck drag, not the grid's own | Fixed red-first (`leavewar.spec.ts` "the grid's day under the mouse…", red: "none"): the rule hangs off the grid's own wrapper, off while the grid selects |
| 6 | Chat 100's new browser test | **The award editor slid by about half a pixel** when the amount went 0.5 ↔ 1, phone and desktop: the empty AM / PM place, drawn as plain words, stood 0.4–0.5px shorter than the AM / PM buttons | Fixed red-first (`leavewar.spec.ts` "the OIL award editor…", red at 0.5 → 1 on the phone): the empty place is the pair's own buttons, hidden and out of reach; the test now measures to a tenth of a pixel |

Why the build's own checks missed 5 and 6: no browser test of either existed — chat 99 listed them as to be written (its
"Pick up here"); the ring was compared with its drawing only as injected CSS on `main`'s build, where the nesting did not
apply. The lesson is already §7.11's 22 ("checked by what is drawn") — the new test asserts the computed style on the day.
