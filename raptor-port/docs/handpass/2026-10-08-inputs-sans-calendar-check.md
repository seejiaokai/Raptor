# The Inputs calendar and the SANS availability calendar — the job's ONE bug check (D485), steps 1 to 5

Branch `claude/inputs-sans-calendar`. Started 8 Oct 26, night, at his word: *"Do step 6: the records still owed, then
the job's one bug check for steps 1 to 5 by the checking guide. No merge."* The method: `docs/bug-check-order.md`.
Pictures: `docs/img/handpass/2026-10-08-inputs-sans-calendar-check/`. Written DURING the check — a section says so
where it is still open.

**What is checked.** Everything this branch adds to `main` (`126c6074`): 206 files of app code. Step 0 (Opus's read of
Codex's first build), step 1 (the flying plan's records, the war's reads, the late cut-offs, who placed an input, the
group input's no-screen half), step 2 (the Leave War's four rows, typing, picking, the Event sheet's presets and short
forms), step 3 (the windows shell and the window called "Calendar"), step 4 (the SANS calendar), step 5 (the Inputs
calendar and one input filed for several people), and the rulings built between them (D665, D668–D677). **Not in it:**
the top of the Leave War on a phone (D678, D679 — checked by itself, `2026-10-08-lw-phone-header.md`).

## 1. The eight questions, and the tier

| # | Question | Answer | Why |
|---|---|---|---|
| 1 | Money, or how many count as present | **YES** | the SANS date's "still needed" is a count of who is present; a shared duty on a weekend or holiday is OIL for every man in it, answered once by the filer (D660) |
| 2 | The published record | **YES** | an input filed, moved or deleted on a published day is a pending change (D178); a group filing is one item of the changes window (D663) |
| 3 | Saved data | **YES** | new stored rows (a date's class and figures, a weekday's rule, a running figure, the three colours, the two cut-offs, the members' switch), new fields on an input (who placed it, the group), event short forms |
| 4 | A shared drawer | **YES** | a day's tag, the need, the late tag, the placed-by line and a shared input are each drawn in several places |
| 5 | A new gesture or mode | **YES** | typing in a cell, three ways to pick cells, picking dates, dragging a bar, the keyboard on two months, the "Several people" switch |
| 6 | A new surface | **YES** | two calendars, eight windows on a new shell, four rows on the Leave War, the people picker |
| 7 | Roles | **YES** | who may file, change or delete whose input; the members' switch; SANS availability for another man is the admin's |
| 8 | The warning list, or how a rule is read | **YES** | the late mark gains a second way of setting its cut-off, and two cut-offs |

**Tier: FULL.**

## 2. The rulings that apply

The job's own: **D614–D664** and **D668, D671, D672, D675** (`.claude/rules/decisions/scheduler.md`), **D665, D669,
D670, D673, D674, D676, D677** (`leave-war.md`). Standing rulings it must not break: D19 (a weekend no leave period
covers says why), D25 (OIL is earned leave), D45, D103, D178 (nothing on a published day changes unacknowledged; a
pending change wipes the sign-offs), D148 (Undo is the signed-in person's own), D142 (a day's OIL comes from its latest
published version), D213 / D215 (what a guest sees), D487 (button sizes), D56 (stored demo data is not a finding),
D58 / D63 (no unit designation), the late-input mark's settled rules (a mark, never a warning; downchits exempt; the
word stays a word). **A clash found while listing them: none between rulings.** One between a ruling's plan and the
build is roll-call row A5 below.

## 3. The roll-call — every place each thing is drawn

"Code" = the call site was found by search on `2c64041e` (the routine named, the file that calls it). "Walk" is filled
from the walk: SEEN and OPERATED on that surface, with its picture — a row with a code mark and no walk mark is not
proved.

### A. A day's class and tag — day flying, night flying, no fly (NF), public holiday, Off day

| # | Place | Must show | Code | Walk |
|---|---|---|---|---|
| A1 | SANS month, each date | sun / moon, NF, the holiday's short form in green, OFF grey | `SansCal.tsx` ← `sync.ts flyMonth`, `dayFacts().short` | |
| A2 | SANS day opened | the day's name; the working; a no-fly day still takes OFT and AMT (D642) | `SansDay.tsx` ← `flyAnswer`, `dayFacts`; `sansadd.ts` | |
| A3 | Inputs month, each date | the tag only — short form, OFF, NF; **must not** show sun or moon or any figure (D627) | `InputsCal.tsx` ← `inputscal-model.ts dayTag` | |
| A4 | Inputs day opened | the holiday's full name in the title | `InputsCal.tsx` (`dayFacts().name`) | |
| A5 | "Calendar" month, each date | the tag, or the class buttons | `DaysWindow.tsx` ← `flyMonth` — **prints the fixed words "PH" / "OFF", not the holiday's short form** (the plan §3.12: "the calendars' date tag is the short form … so PH, OFF or ND"). CANDIDATE — to be seen in the app | |
| A6 | Leave War, Required P / W cells | the figure, "NF", or a dash | `FlyRows.tsx` ← `flyMonth` | |
| A7 | Leave War, Event row and the column's tint | the short form; a tap opens the full name and kind | the war's own (`eventdefs.ts shortOf`) | |
| A8 | "Calendar" → Holidays list | date, full name, kind, short form | `HolidaysPanel.tsx` ← `sync.ts holidaysIn` | |
| A9 | OIL: a worked public holiday earns | a holiday added from the Holidays list earns exactly as one typed on the Event row — it is the same record | `eventdefs.ts` (the war's one holiday test) ← `engine/oil.ts` | |
| A10 | The schedule's "no leave period covers this day" note (D19) | unchanged | not touched by this job | |
| A11 | **Must not:** the board, the week, the Leave War grid | no sun, no moon — day or night shows on the SANS calendar only (D577, D627) | no import of the flying plan in `html.ts`, `board-html.ts` | |

### B. The required figure and "still needed"

| # | Place | Must show | Code | Walk |
|---|---|---|---|---|
| B1 | Leave War, Required cells — typed by an admin, read by a member | the one resolver's figure; a corner mark where a running figure starts | `FlyRows.tsx`, `FlyEdit.tsx` | |
| B2 | Leave War, the working under an Available cell | required, available, SANS committed, still needed — read only, everyone | `FlyRows.tsx` ← `flyAnswer`, `sansFly` | |
| B3 | Leave War, the panel for a picked block | which cells will be written; "These days" / "From <date> on" | `ReqPanel.tsx`, `reqpick.ts planPick` | |
| B4 | SANS month, each date | the pair, pilots left and WSOs right, coloured by the two added together; a dash where unknown; "0 0" grey where nobody is needed | `SansCal.tsx` ← `sanscal-model.ts sansCell` | |
| B5 | SANS day opened | the same four figures as B2, for the same date | `SansDay.tsx` | |
| B6 | **Must not:** the Inputs month | no figure of any kind (D627) | `dayTag` returns a tag only | |

### C. The count of who is available

| # | Place | Must show | Code | Walk |
|---|---|---|---|---|
| C1 | Leave War, Available P / W cells | the count; red under its Required; never a SANS man | `availrows.ts availHave` | |
| C2 | the working box (B2), the SANS date (B4), the SANS day (B5) | the same count | `sync.ts dayFacts` ← `availHave` | |
| C3 | the counter window for an Available row — its live preview | the same count as the cell, as the definition is changed | `CounterForm.tsx` ← `availHave` | |

### D. Who placed it, and when (D629)

| # | Place | Code | Walk |
|---|---|---|---|
| D1 | SANS day opened — each commitment | `sanscal-model.ts` ← `placedLine` | |
| D2 | Inputs day opened — each line | `InputsCal.tsx` ← `placedLineOf` | |
| D3 | a bar's tooltip on a desktop | `InputsCal.tsx tip()` | |
| D4 | the List, under the remark | `InputsPage.tsx` | |
| D5 | the editor's foot — not on a new input | `inputedit.tsx` | |
| D6 | a Medical card | `MedicalView.tsx` | |
| D7 | the document viewer | `DocViewer.tsx` | |
| D8 | **Must not:** a month's date cell, the board, the week, print, CSV | `placedline` is imported by none of `html.ts`, `board-html.ts`, `export.ts`, `printpdf.ts` | |

### E. The late tag, and the cut-off it is judged by

| # | Place | Code | Walk |
|---|---|---|---|
| E1 | the board's Personal Inputs and Unavailable rows | `board-html.ts` ← `lateTag` (unchanged) | |
| E2 | the week's Personal Inputs and Unavailable blocks | `html.ts` (unchanged) | |
| E3 | the List's Remarks column | `InputsPage.tsx` | |
| E4 | Inputs day opened — LATE, a tap opens the reason; once for a shared input where everyone is late | `InputsCal.tsx` (`idy-late`) | |
| E5 | SANS day opened — LATE on a commitment, judged by the SANS cut-off | `SansDay.tsx` (`sd-late`) ← `sanscal-model.ts lateWord` | |
| E6 | "How this works" on both calendars — the cut-off as it is set | `cutSentence` | |
| E7 | the Logic page's two cut-off rows and the switch's row — each opens the same settings window | `logic-html.ts`, `LogicPage.tsx` | |
| E8 | **Unchanged:** a cut-off set in days marks exactly what it marked before | `engine/lateinput.test.ts` (every earlier assertion untouched) | |

### F. An input as a bar — and where an input must look as it did

| # | Place | Code | Walk |
|---|---|---|---|
| F1 | Inputs month — one bar across its days, over a week's end and a month's end; "+N more" | `InputsCal.tsx`, `inputscal-model.ts layoutBars` | |
| F2 | Inputs day opened — one line an input | `itemsOn` | |
| F3 | the List (behind Calendar / List) | `InputsPage.tsx` | |
| F4 | **Unchanged:** the Medical view (now a tab, in the page) | `MedicalView.tsx` | |
| F5 | **Unchanged:** the board's Unavailable and Personal Inputs rows, the week's blocks | not touched | |
| F6 | **Unchanged:** the Leave War's cells for a leave or a medical | not touched | |
| F7 | **Gone, by ruling:** SANS availability on the List and on every form of the Inputs tab (D620) | `TYPE_ALLOW` | |

### G. One input filed for several people — ONE thing in five places, each man's own record everywhere else

| # | Place | Must be | Code | Walk |
|---|---|---|---|---|
| G1 | Inputs month | one bar | `entriesOf` → `monthItems` | |
| G2 | Inputs day opened | one line, its people listed; one Delete that asks "for all N people?" | `InputsCal.tsx` | |
| G3 | the List | one row, one button (it opens the window) | `InputsPage.tsx` ← `entriesOf` | |
| G4 | the editor | one window; a man in it who did not file it gets "Take me out"; anyone else reads | `inputedit.tsx` | |
| G5 | the changes window | one item, its people under it (D663) | `changesmodel.ts` | |
| G6 | the SANS day, for an availability an admin filed for several | each man his own puck line (the day lists PEOPLE) — to be seen | `sanscal-model.ts` | |
| G7 | **Each man alone:** the board's rows, the week's rows | unchanged | not touched (one row for the group is its own job — D661, D662) | |
| G8 | **Each man alone:** the warnings; the Leave War's cells; the late mark | unchanged | every reader reads one man's record | |
| G9 | **Each man alone:** the bell's OIL question — nobody left to be asked (D660) | the filer answered for all | `inputedit.tsx commitGroup` | |
| G10 | **Each man alone:** a published day's pending count; print; CSV | unchanged | not touched | |

### H. Who may change an input — every door, every role

| # | Door | Admin | Member, his own | Member, one he filed for another (switch on) | Member, another's | Guest / no access | Walk |
|---|---|---|---|---|---|---|---|
| H1 | the editor (a bar, a line, a List row) | edits | edits | edits; cannot move it to another person | reads | reads / no page | |
| H2 | the List's row button | yes | yes | yes | none drawn | none | |
| H3 | a bar dragged | moves | moves | moves | refused, says why | — | |
| H4 | the opened day's Delete, and the keyboard's | asks, deletes | asks, deletes | asks, deletes | says who can | — | |
| H5 | "Take me out" of a shared input | — | yes (a man in it) | — | — | — | |
| H6 | "+ Input" / "+ Commitment" for someone else | any kind, anyone (several: not medical, not an upchit) | — | a duty or a commitment only; never SANS availability (D658) | — | — | |
| H7 | the settings gears, "Calendar", the Required cells, the counters | yes | reads | reads | reads | — | |
| H8 | the write itself, behind every door | `perms.ts` — `perms.test.ts` and `perms-scan.test.ts` green; `docs/data-model.md` §11 rows `Input`, `Setting`, `LeaveWar` | | | | | |

### W. The windows — what each can open over (the order's §6: layering is a missing line only a browser sees)

| # | Window | Opens from | Can stand over | Walk |
|---|---|---|---|---|
| W1 | "Calendar" (Month, Holidays) | the Leave War's ⚙, both calendars' gears, the SANS day | the Leave War grid and its OIL tracker; the SANS month; the Inputs month and its List | |
| W2 | "Every <weekday>" | a weekday's heading in W1 | beside W1 | |
| W3 | the holiday form | the Holidays list | beside W1; the war's new-period sheet must come up in FRONT of W1 on a phone | |
| W4 | the SANS day | a date on the SANS month | the month (a phone: a panel that pulls up; a desktop: beside it) | |
| W5 | the SANS settings | the SANS gear; the Logic page's row | the SANS month; the Logic page | |
| W6 | the Inputs day | a date on the Inputs month | the month | |
| W7 | the Inputs settings | the Inputs gear; the Logic page's rows | the Inputs month; the Logic page | |
| W8 | the input editor, as a window | a bar, a line, a List row, "+ Input" — on the Inputs page | the month, the List, the opened day (W6) | |
| W9 | the Required panel; the people's-days panel | a pick on the Leave War | the grid, which still works behind them (D642) | |
| W10 | the typing box and the phone's number pad; the working box | a Required cell; an Available cell | the grid | |

### The doors (the order's §3 door check) — every action a person can now take, and its control

| Action | Control | States walked |
|---|---|---|
| set one date day / night / no fly | "Calendar" month: a phone's one stepping button, a desktop's three | a weekday, a weekend, a holiday (no control), back to what its weekday gives |
| set every <weekday> from a date | the weekday's heading → the form | with and without an end; two rules for one weekday; removed |
| add, change, remove a holiday or an Off day | Holidays list → the form (one-calendar picker, D671); the Leave War's Event row → the Event sheet | one day, a run, across two periods (refused), dates no period covers (waits) |
| type a required figure | a Required cell → the box (desktop), the number pad (phone) | one day; "From <date> on"; a no-fly day; Enter / Tab / Escape |
| give several cells one figure | a drag, Shift-drag or hold-then-drag over the Required rows → the panel | "These days", "From here on"; a block holding a weekend, a holiday and a no-fly day |
| rename / re-define an Available row | its name → the counter window | leave out OCU; "Reset counters" |
| add, move, delete a counter | Rearrange: the grip, the red cross; the counter's window | above, between and below the four fixed rows (D674) |
| file a SANS commitment | "+ Commitment"; a tap, a slide, a drag, a hold-then-drag on dates | own; an admin for one and for several; a no-fly day |
| highlight one SANS person | Highlight | pick, change, clear |
| set the colours and a cut-off | each calendar's gear; the Logic page's rows | days; a weekday of N weeks before; a bad value |
| file an input | "+ Input"; picked dates; the List's Add form | one person; several; a published day |
| move an input | drag its bar | by mouse, by finger; across a week's end; dropped where it was |
| change / delete an input | a bar or a line → the editor window; Delete on the line; the keyboard | own, another's, a shared one; behind an open window |
| switch members' filing for others | the Inputs gear | on, off, off with a member's shared input standing |

## 4. The sizing step (the order's §7.0; `docs/walk-ledger.md`)

1. **The type of change.** B (two calendars, eight windows, four rows, a picker), C (typing in a cell, three picks,
   date picking, a bar's drag, two keyboards, a switch), D (the tag, the need, the late tag, the placed-by line and a
   shared input are each drawn in several places), G (new stored rows and fields; a published day's pending count),
   H (who may file and change whose input), E (three sizes of every new screen), and A for two calculations (the
   one resolver; the late rule's second way).
2. **What only a walk could find here.** Whether each of 50-odd roll-call rows is really on its screen and works
   there — at a phone, a short phone, a desktop and his 1536-wide screen; whether ten kinds of window stand in front
   of what they open over, drag, and leave the page working; whether a finger and a mouse do on the real page what
   the tests do with made-up events; whether the Leave War, the three calendars and the schedule AGREE about one day;
   each role's own face. What the tests and reads already carry: the resolver's arithmetic and the late rule's
   boundaries (unit tests that call the calculation directly — they prove no screen), and that each rule in six
   strictness lists is held by a named test (§6).
3. **What the ledger says.** Walks of a thing drawn in several places found a fault ten times of ten; of a new screen
   four of five; of a role rule two of two; of a new control eight of fifteen, most on the wide jobs. Where this
   job's kind was last checked as one stack (five pieces, 5–6 Oct), eight Sonnet walkers found five faults of their
   own and confirmed thirteen more. A walk of a rule inside one calculation found least — so the resolver's and the
   late rule's repeated cases are left to their tests, and only their routes on screen are walked.
4. **The walk chosen.** Fanned out (D16): **seven Sonnet 5.5 walkers** (D588), each in its own browser world on a
   frozen copy of the build, one area each — the Leave War's rows; the "Calendar" window and the windows' own
   behaviour; the SANS calendar; the Inputs calendar's month, day and keyboard; the editor window, placed-by and the
   late tag; one input for several people; the crossings (a published day, OIL, Undo, a reload, the Leave War
   against the calendars). Astra's scenarios plus the host's additions for the roll-call rows they miss. Sizes: phone
   390×844 and desktop 1440×900 always; 390×568 and a phone on its side for every screen built as a screen-tall
   column; 1536×864 for the desktop months. The host: opens every picture behind a FAIL and behind every PASS on
   OIL, a published day, a role or saved data; reproduces every finding; and makes D624's pairs itself — each
   approved mock-up beside the built screen at the same size. **Carried by a test, not walked:** the resolver's
   boundary cases (`state/flyplan-model.test.ts` — calls the calculation; proves the arithmetic, no screen) and the
   late rule's dates (`engine/lateinput.test.ts` — the same); each is walked ONCE through its real controls.
5. **Its row in the ledger:** added at the close (§9).
