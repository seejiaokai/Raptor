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

## 5. What the check has found — each with its proof and its disposition

"Found by" says which part of the check found it; "Seen" is the host's own reproduction in the running build before
anything was changed. A finding with no "Seen" is not in this table.

| # | The fault, as a person meets it | Found by | Seen (the host, on the build as walked) | Disposition |
|---|---|---|---|---|
| W1 | A holiday with a short form of its own — "National Day", "ND" — reads "ND" on the SANS month, the Inputs month and the Leave War's Event row, and "PH" on the "Calendar" window's own month | the roll-call (row A5), before any walker started | `scripts/handpass/cal-host-leads.mjs` A5: Calendar month "PH", the other three "ND" — picture `host-leads/a5-2-calendar-month.png` (opened) | FIXED, a test red first (`ui/dayswindow.test.tsx` "a holiday with a short form of its own prints THAT"); two older tests that pinned the fixed word re-pointed |
| W2 | With the Inputs settings window opened over an input's editor window, Escape closes the EDITOR — the one behind — and what he had typed is lost; the settings window stays | Astra's scenario design (M1), from reading the promise against the code | the same script, M1: after Escape the editor was gone and the settings window still up — picture `host-leads/m1-2-after-escape.png` (opened) | FIXED, a test red first (`ui/editorwindow.test.tsx` "Escape belongs to the window in FRONT") |
| W3 | After the front window is closed, no window is "in front": the one left does not wear the front mark, and Escape does nothing until it is pressed | the host, fixing W2 (the editor now asks which window is in front, and the answer was stale) | `ui/floatwindow.test.tsx` "when the front one closes…" — red on the build as walked (it named the closed window as still in front) | FIXED, that test red first |
| W4 | In a shared input, one more person picked (or one taken out) and nothing else touched: pressing another input's bar throws the change away with no question | Astra's scenario design (M2) | the same script, M2: four picked, one added, another bar pressed — no question, the window showed the other input — picture `host-leads/m2-2-after-other-bar.png` | FIXED, two tests red first (`ui/editorwindow.test.tsx` "a change of the PEOPLE alone is unsaved work too") |
| W5 | While the editor asks "you have unsaved changes", it announces "Changed while this window was open: people — X added, Y taken off", then the reverse, and puts the saved people back over the ones he picked | the host, writing W4's test | that test's own output on the build as walked: the two messages, and three people picked where he had left two | FIXED, a test red first ("while it asks, it says nothing was changed behind it…") |

**Not a fault of the app — a check that had gone stale:** the adapted probe `audit-async` read 52 of 54. Its two failures
counted one row of the Inputs List for every RECORD (44) where the List draws one row an ENTRY (the demo's four-man
meeting is one row: 41), and added in a List on the SANS tab, which has none. Both follow from his rulings (D654, D620);
the host confirmed every single-person input has its row and the shared one has one, then re-pointed the two checks:
55 of 55.

**From D624's pairs and the walkers (fix round 2) — each seen by the host before it was changed:**

| # | The fault, as a person meets it | Found by | Seen (the host) | Disposition |
|---|---|---|---|---|
| W6 | In the Holidays form "On grid" stays empty while a name is typed; his ruling D652 (reading 1) has it fill itself from the name, as the Event sheet's box does | D624's pair for "Adding one" (the helper's comparison) | `ui/holidayspanel.test.tsx` "On grid fills itself…" red on the build as walked (the box read '' where "ND" was due) | FIXED, two tests red first; two older tests that expected an empty box re-pointed |
| W7 | In the changes window a filing for several people is one heading over a LINE FOR EACH MAN; D663 says "not a line for each man" and the approved picture shows one line with the names under it | D624's pair for the changes window | the pair itself, opened by the host (`side/36`): "Ace · Meeting added…", "Drifter · Meeting added…", "Ranger · Meeting added…" under one heading | FIXED, four tests red first (`ui/changesmodel.test.ts`); re-walked by the host in the running build: one line, "Ace · Anvil · Saber" under it (`host-rewalk/w7-changes-window.png`) |
| W8 | A SANS commitment's editor ends "The dates are changed on the Inputs page" — but SANS availability is on no list of the Inputs tab (D620) | walker D (H-06) | the sentence in the editor's code, shown for every existing record | FIXED, a test red first (`ui/unavailedit.test.tsx`): "To change its dates, delete it and add it again on the SANS calendar." |
| W9 | On a phone turned on its side (844 × 390) a day opened on either calendar shows none of its entries: the pinned top fills the 270px window and the list under it is a sliver | walker D (P4-02) | `scripts/handpass/cal-host-side.mjs` on the build as walked: 4 entries on the Inputs day, 0 in view | FIXED in the stylesheet (under 480px of height the window is one scroll); two real-browser tests added (`e2e/inputs-sans-calendar.spec.ts`); the host's script passes on the rebuilt copy for the Inputs day |

**Re-walk of round 1 by the host, on the rebuilt copy (`scripts/handpass/cal-host-leads.mjs`, pictures `host-rewalk/`):** the
"Calendar" month, the Inputs month, the SANS month and the Leave War's row all read "ND"; Escape closes the settings
window and the editor keeps "host: unsaved remark"; one more person picked and another bar pressed — the question
shows and the five stay picked; the changes window shows one line and the names. **4 of 4.**

## 6. The walk — eight Sonnet 5.5 walkers on a frozen copy of the build (`dist-wh`, the code of `9b5d085b`)

Each walker's own table, with the controls used and the figures read: `docs/handpass/parts/cal-<L>.md`; its pictures:
`docs/img/handpass/2026-10-08-inputs-sans-calendar-check/<L>/`. A walker's FAIL is in §5 only once the host has seen it.

| Walker | Share | PASS | FAIL | PARTIAL | What the host made of each FAIL |
|---|---|---|---|---|---|
| B | the Leave War (P2-01..12, H-04) | 12 | 1 | 0 | **P2-04** — a typed "-5" saves 5, "2.5" saves 25, "1234" saves 123: AS BUILT, not a fault — the box takes digits only, three at most (`ui-contracts.md`), so what is saved is what the box SHOWS before Enter; the scenario expected a refusal. Told to him on the look card. **Two more it reported, FILED (`[CAL-CHECK-SEEN]`):** on a phone the first tap after a finger-drag of a counter in Rearrange is ignored (the second works); on a phone on its side the number pad covers the Required cell being typed |
| D | the SANS calendar (P4-01..12, H-06, H-08) | 11 | 2 | 1 | **P4-02** → W9. **P4-01, one clause** — a man posted out or archived stops counting on his commitments BEFORE that date too: AS TOLD (step 4's reading: "a commitment of a man … archived is listed under Not counted with the reason"); it changes only days already past by the time he is archived. On the look card. **H-06** → W8 |
| E | the Inputs calendar (P5-01..12, H-05, H-09, H-10) | 8 | 4 | 3 | **P5-01** and its false "people added / taken off" message → W4, W5 (found by the host first). **P5-06** (Escape during a bar's drag leaves the picked-up copy on screen) and **P5-11** (Undo turns the month back to July though the input's August days were in view; the List's row does not flash) → see below. **H-09's reload line** — the host's own scenario was wrong: a reload asks for the sign-in and opens on View-only Sched, as the app always has |
| A | one day's facts (P1-01..12) | 11 | 1 | 0 | **P1-03** → W1 (the "Calendar" month's tag). Everything else held on desktop and phone: the Leave War's rows and working box, the SANS date and its opened day and the "Calendar" window gave ONE answer for every date read — a date no period covers reads a dash, not 0; a running figure skips weekends, holidays, Off days and no-fly days; pilots' and WSOs' runs stay apart; NF needs 0 and still takes OFT and AMT; a year's end and 29 Feb 2028 keep their own dates; Undo, Redo and a reload move every reader |
| C | the windows and "Calendar" (P3-01..12, H-01..03) | 8 | 2 | 5 | **P3-01** → W2; **H-01** → W1. H-02 (layering): every window was found at its own centre and at every one of its buttons, phone and desktop, and the war's new-period sheet is in front of "Calendar" on a phone — with TWO exceptions it reported, see W11 below. H-03: no "Days" on screen anywhere. Filed (`[CAL-CHECK-SEEN]`): the "Calendar" window on a 568-tall phone is 20px too tall after it has been dragged and brought back; Escape on a Delete question after a press on the page closes the whole day window; Escape does nothing once a control on the page behind has the keyboard (the shell's rule, as built); a settings window left open stays up when the page is changed |
| G | published days, OIL, the Leave War (X-01..09) | 7 | 0 | 2 | **The downstream numbers, read on the Leave War's cells and the OIL tracker, before and after, desktop and phone:** a shared all-day duty on Sat 18 Jul gave each of three men 1 day and the filer nothing; a two-hour duty on the Sunday half a day each; nothing moved before the day was published; one man's own No took only his away, at the amendment; the scheduler's refusal of another held against the filer's later Yes; a public holiday added to a published weekday earned nothing until the reissue, and an Off day nothing at all. **A shared input on a published day:** 3 pending, the four sign-offs down, the issued face unchanged until the amendment; moved by its bar — three off the old day, three on the new; Undo back to the baseline. Its findings → W10, W11 below and the look card (the filer's later OIL answer goes to everyone in it, as he was told on 8 Oct) |
| F | one input for several people; the late rule (P6-01..12, H-07) | 12 | 0 | 1 | Nothing failed. A group leave over one man's own leave or sick leave is refused naming him and saves nobody; one OIL question, then a full-day claim on each man's own cell after publishing (the tracker: 4 to 5, 0 to 1, 0 to 1); adding a man leaves the others' answers and stamps alone; the filer, a man in it, a stranger and an admin each get their own doors through the editor, the List, Delete and a bar's drag; with the members' switch off an open draft keeps its people and Save and Undo are refused in words; every forbidden kind is refused with the picks kept. **The late rule under a controlled clock:** Inputs at 14 days — 29 Jun on time, 30 Jun late; SANS at "the Wednesday two weeks before" — on time through 1 Jul 23:30, late at 2 Jul 00:30; a later edit takes its own date; the same across New Year. Three small things FILED (`[CAL-CHECK-SEEN]`): a reader's OIL row shows a "Change…" button that cannot be pressed; with the switch off the filer is told "Only Ranger — who filed it — … can change this" and offered "Take me out"; a group's OIL question after a drag is titled with one man's name |
| H | Undo, the changes window, a failed save, roles, postings, print, short screens (X-10..18) | 5 | 4 | 0 | **X-10** — Undo after ANOTHER person's change: a different group input and a different Required day undo cleanly, and the same thing changed since is refused — but (a) the refusal reads "A later change touches the same thing — undo that first" and does not say WHO (D148 has it say who), and (b) one admin's holiday on 19 Aug blocks the other's Undo of his own holiday on 12 Aug. REPORTED BY THE WALKER, NOT YET SEEN BY THE HOST — filed as `[CAL-UNDO-OTHERS]`, to be reproduced first. **X-11** — "To go out" lists a shared input as a line for each man where "All changes" and "New to you" show one item; he was told it holds on every tab (D663 reading 2). Seen by walkers G and H; the pending list is built by other code than the one fixed in W7 — FILED, `[CAL-TOGO-ONE-ITEM]`. **X-13** — on a phone on its side an open window lies over the failed-save band's Retry (whole and reachable at 1440 and at 390 × 568; retry plus reload gave exactly one saved group) and **X-17** — the pulled-up day covers the top bar's Undo until it is lowered (as ruled: D648 pulls it up "to nearly the full screen"); on its side the day opens over the month's arrows — FILED with the other sideways-phone finds (`[CAL-CHECK-SEEN]`). Passed: a second change on a pending day counts differences from the issued version, not clicks; a role change closes every admin door at the ACTION; a posting out, an archive and losing SANS status agree across the SANS count, his inputs and a published day's pending; nothing of "placed by" reaches the board, the week, print or CSV; a reload and a second sign-in at every publish stage keep the group, each man's OIL, the pending count and the stamps |

**Fix round 2c:**

| # | The fault, as a person meets it | Found by | Seen (the host) | Disposition |
|---|---|---|---|---|
| W10 | An input running 29 Jul to 3 Aug, looked at in AUGUST: an Undo of its move turns the month back to July, where it starts — his ruling D672 says the screen moves only when what changed is out of view | walker E (P5-11) | `ui/inputsmonth.test.tsx` "part of it is on the month shown…" red on the build as walked (the month went to October for an input with November days in view) | FIXED, that test red first — two places turned the month (`state/view.ts requestInpReveal`, `ui/InputsCal.tsx`) |
| W11 | Which window is in front, twice: (a) with the "Calendar" window up over the Leave War's grid, the Event sheet a press on the grid opens comes up BEHIND it; (b) "Calendar…" pressed in a settings window while "Calendar" is already up leaves it behind the settings window that asked | walkers C and G (the roll-call's rows W1 and W5 / W7) | two tests red on the build as walked: a blocking sheet drawn with a window up was not raised (`leavewar/ui/warask.test.tsx`); a window asked for again was not brought forward (`ui/floatwindow.test.tsx`) | FIXED, both tests red first — every Leave War sheet that BLOCKS is drawn over an open window; the three doors to "Calendar" bring it forward |
| W12 | On a desktop both months, the tabs and the tools run flush to the screen's edges (the approved drawings stand in from both sides) | D624's pairs; walkers C and D | the host's own pictures (`sans-look/desk-month`: the gear and "5+" against the right edge) | FIXED in the stylesheet: 12px each side from 821px up — a look, pinned by the browser tests' "no sideways scroll" only; on the look card |

## 7. What is filed, not fixed — and why each may wait

Every one is in `OUTSTANDING.md` with its evidence. None loses data, earns or withholds OIL wrongly, or lets someone change what he may not.

| Item | What a person meets | Why it waits |
|---|---|---|
| `[CAL-UNDO-OTHERS]` | Undo refused after another person's change does not name him; one admin's holiday blocks Undo of another's on a different date | walker H only — to be reproduced by the host first; an Undo that refuses too readily loses nothing |
| `[CAL-TOGO-ONE-ITEM]` | "To go out" still lists a shared input as a line for each man | the count beside it is per man by his own ruling (D663 reading 3), so the list and the count agree; its builder is separate code |
| `[CAL-CHECK-SEEN]` | the small ones, each with its walker and picture: a phone ON ITS SIDE (the number pad covers the Required cell; windows lie over the top bar, the month's arrows and the failed-save band's Retry; the Highlight list runs off the foot); the first tap after a finger-drag of a counter in Rearrange is ignored; the "Calendar" window on a 568-tall phone is 20px too tall once dragged and brought back; Escape on a Delete question after a press on the page closes the day; Escape during a bar's drag leaves the picked-up copy on screen; the List's row does not flash on Undo; a stale "changed while this window was open" note after a drag is undone; a reader's OIL row shows a dead "Change…" button; the filer told "only <himself> can change this" with the members' switch off; a group's OIL question titled with one man's name; a settings window stays up across a change of page | each is cosmetic, a rare gesture, or a sideways phone; two were reported by one walker and not yet seen by the host (said in the item) |

## 8. Told to him, not changed — differences from an approved picture, or a reading the walk made visible (the look card)

0. **A shared input's DATES cannot be changed once it is saved** — it can be dragged (its length kept) or deleted and filed again. Found by Astra's read; filed as `[CAL-SHARED-DATES]`; the builder would build it before "merge live". **ANSWERED 9 Oct 26 — "2 agree" (D681): it is built before "merge live", in the input’s own window, for everyone in it at once.** **BUILT 9 Oct 26 — §12.**
1. **Picking several days opens the new-input window at once.** The drawing left the days picked with a bar at the foot ("4 days · Cancel · + Input"); the plan says "release opens + Input for the range, as today".
2. **The List is today's list.** The drawing showed a re-made one (a range box in the tools row, one-line rows under day headings); the plan kept the List as it was.
3. **No strip of keys along the foot of the desktop month.** The keys work; the drawing listed them on the page.
4. **The people picker's pucks are spaced for a finger** — about twice the drawing's spacing — so on a phone the SANS group is below the first screen; the headings carry no count ("Pilots · 29"); "All" is on Pilots, WSOs and Personnel, not SANS (told 8 Oct).
5. **On a 1440-wide laptop the "Calendar" window shows Month and Holidays as two tabs**; side by side from 1510 (his PC is 1536) — told 8 Oct.
6. **An Available figure under its Required turns its digits red**; the drawing washed the whole cell.
7. **The Inputs month's colour key reads "absence / duty or commitment"** (the drawing: "away all day / part of the day") — told 8 Oct.
8. **Whoever filed a shared duty and answers its OIL question again answers for everyone in it** — so a man's own earlier No is replaced by the filer's later Yes (the scheduler's refusal still holds). Told 8 Oct as a reading; the walk showed it happen (walker G, X-04). **This is OIL — his to confirm.** **CONFIRMED 9 Oct 26 — "3 OIL yes that’s what I want" (D682): the latest answer is the one that counts, whoever gave it; a man may still change his own afterwards.**
9. **A man posted out or archived stops counting on the SANS calendar for his commitments BEFORE that date too** — only days already past by then (walkers D and H).
10. **A Required cell takes digits only**: a typed "-5" shows and saves 5, "2.5" shows and saves 25.
11. **On a phone the month's five-week July shows five inputs a day at 844 tall, then "+N more"** — the drawing showed six.

## 9. The gates, the break tests, and what was NOT walked

**The whole gate set, under the PC lock, watched — on `02e99d04` (the code after fix round 2):** unit 9310 of 9310 (564 files)
· build clean · the reference 728 / 0 · the Tracker smoke 445 / 0 · the rule check OK · the document check OK · the
browser tests **701 passed, 5 failed**, 56 skipped. The five were checks, not the app: four older Leave War tests still
expected the fixed "PH" on the "Calendar" month (W1 changed it to the holiday's short form) and this check's own new
sideways-phone test had no commitment on its date. Corrected (`ea459963`) and re-run by name: 9 of 9. **Before the
fixes, on the code as walked:** `npm run perf` 4 of 4 (the week 5,131 nodes of a 5,450 ceiling, the board 1,018 of
1,150); the six adapted probes — five pass, `audit-async` 52 of 54 and, re-pointed at D654 / D620, 55 of 55.

**The break tests (the order's §8.4).** Each of the twelve fixes has a named test that was SEEN red on the code as walked
before the fix went in — its failure is quoted in §5's "Seen" column or in the fix's commit — except W9 and W12, which
are stylesheet rules: W9 is held by two real-browser tests (`e2e/inputs-sans-calendar.spec.ts` "a phone on its side…"),
seen failing by the host's script before the rule; W12 (the desktop margin) is a look and is held by nothing but the
"no sideways scroll" tests. For the code of steps 1 to 5 the builder's own lists stand: 81 + 41 + 65 + 111 + 35 + 15 +
25 + 7 rules, each broken alone and caught (`scripts/handpass/breaks/2026-10-08-*.json`, and the handoff's step notes).

**Not walked, and why.**
- **His iPhone.** Every phone step ran in a desktop browser at a phone's size with real touch events. The number pad,
  a finger's hold-then-drag, the windows' pull-up and Safari's own handling are his look (§8 and the look card).
- **A guest and a person with no access** on the new screens: neither can reach the Inputs page or the Leave War, which
  walker B confirmed for the no-access card; the guest view was not switched on.
- **Tab and Shift + Enter in a Required cell** (walker B); **the roster with no ground crew** in the people picker
  (walker F); **the Leave War's own move or cut with an input's editor open** — on the Leave War the editor is the
  blocking dialog, so it cannot be done (walker G).
- **The short screens for every flow.** 390 × 568, a phone on its side and 1536 × 864 were walked for every window and
  both months, not for each of the hundred scenarios.
- **Print and CSV of an ISSUED day** were read once (walker H), not at each publish stage.
- **The roll-call's rows A10 and E8** (the "no leave period" note; a cut-off in days marking what it marked before) were
  not driven: A10 was not touched by this job, and E8 is carried by `engine/lateinput.test.ts`, which calls the
  calculation — it proves the arithmetic, and walker F walked the route once on screen (29 Jun on time, 30 Jun late).

**The roll-call, after the walk.** Rows A1–A9, A11, B1–B6, C1–C3, D1–D8, E1–E7, F1–F7, G1–G10, H1–H8 and W1–W10 were each
SEEN and OPERATED by a walker (the table in each `parts/cal-<letter>.md` cites its pictures). MISSING, with its
disposition: **A5** — fixed (W1). **G5 on the "To go out" tab** — filed (`[CAL-TOGO-ONE-ITEM]`). **W1 and W5 / W7**
(a sheet behind the "Calendar" window; "Calendar" behind its settings window) — fixed (W11). No row is blank.

## 10. The two code reads (each blind to the other; the sheet in their hands)

**Astra — `docs/superpowers/briefs/2026-10-08-inputs-sans-check-read-astra.md` — CHANGES REQUIRED.** Five findings, each
traced through the source with its cause and fix steps. **NONE IS YET REPRODUCED BY THE HOST — each is a lead until it is
(the order's §4: reproduce through the real route, check against the ruling, compare with `main`).**

| # | Astra's finding | Its rating | The host's disposition |
|---|---|---|---|
| R1 | A shared input changed to a medical kind and cut to ONE person ("Keep Ace only") is still saved by the group's branch: the document, upchit and medical-clash questions are skipped, and a document attached in that window is dropped (`ui/inputedit.tsx` — the group branch returns before the questions; the writer puts the survivor's old attachments back) | High | **SEEN and FIXED (W14):** `ui/groupeditor.test.tsx` "kind changed to a medical one, people cut to one" failed on the code as read — the save said "Input updated" with no question asked. The group's save now REFUSES a medical kind in words ("A medical entry is one person's own. Take the other people out and save first — then change its kind.") and writes nothing; the one-person save, which asks every question, is then the only way in. (Astra proposed carrying the questions into the group's branch; the refusal is the smaller, safer change — the builder's call, told to him) |
| R2 | A shared weekend duty answered Yes for two; the FIRST man changes his own answer to No; the filer then changes the hours. The save asks the OIL gate about the first man only — his No stands, so no question opens — and the second man's answer, voided by the new hours, is left unanswered: he is asked by his own bell, which D660 says must not happen | High | **SEEN and FIXED (W13):** `ui/groupeditor.test.tsx` "the FIRST man has said No for himself; the filer makes it all day" failed on the code as read — no question opened (the LAST-man order passed). The save now asks the OIL gate of EVERY man kept and opens the one question while any needs an answer. On `main`? Not there — a shared input is this job's |
| R3 | A SAVED shared input has no door that changes its date RANGE: the List's row opens the window, the window draws no date picker for an existing input, and a bar's drag keeps its length | Medium | **CONFIRMED by reading the three doors it names** (the List's row opens the window; the window's picker is drawn for a new input only; the drag keeps the length) — a MISSING DOOR, not a wrong line. NOT BUILT in this check: FILED as `[CAL-SHARED-DATES]`, recommended before "merge live", and first on the look card |
| R4 | Undo of a "Calendar" change (a date set no-fly, a weekday's rule) always switches the Inputs page to the SANS tab and, for a rule, to the month it starts in — even when what changed is in view (D672) (`state/undo-wire.ts`) | Medium | **SEEN and FIXED (W17), found by BOTH readers:** `state/undo-wire.test.ts` "…while the Inputs calendar already shows it: the tab and the month stay" failed on the code as read (the tab went to SANS). A calendar that is up keeps its tab; its month turns only when the date is not on it; a weekday's rule is in view on every month from its start |
| R5 | The "no medical entry for several people" rule is held on screen and at the group's save only: two men of a shared meeting, each retyped SEPARATELY from Edit Schedule into the same medical kind, keep their group and are one shared medical entry again on Inputs | Medium | **SEEN and FIXED (W15):** `state/inputgroup.test.ts` — two records of one group, both a medical kind (or an upchit), read as ONE entry on the code as read. Held now at the one place a group is worked out (`entriesOf`): a medical entry or an upchit is never part of a group, whatever its record carries — so the month, the List, the editor and the changes window all read each as the man's own |

Its negatives (checked, sound): the roll-call's readers of the placed-by line, the late tag, the holiday tag and the
required figures; the members' switch, the filer checks, forged-stamp checks and verified replay behind every screen;
the late rule's arithmetic and settings. Its test-coverage table names seven combined cases no test holds — among them
that W12's desktop margin has no geometry assertion.

**Sol 6.1 — `docs/superpowers/briefs/2026-10-08-inputs-sans-check-read-sol.md` — CHANGES REQUIRED.** Read blind to Astra's. Four findings and one confirmation; **none yet reproduced by the host unless its row says so.**

| # | Sol's finding | Its rating | The host's disposition |
|---|---|---|---|
| S1 | A holiday form left open while the SAME event is changed on the Leave War into a working event (same name, same date): Delete — or Save — from the stale form still goes through, because the match compares the row, the dates and the name but not the kind; for a repeated run one surviving day is enough (`leavewar/engine/holidays.ts` about lines 80 and 94; `state/store.ts` 3512, 3558) | Medium | **SEEN and FIXED (W18):** two tests in `leavewar/holidays.test.ts` failed on the code as read — the stale line's Delete answered `ok` for an event since made a working one, and for a run with one day changed. The match now checks the KIND and EVERY day of a run; a stale Delete or Change is refused, "no longer there", and nothing is taken away |
| S2 | The same fault as R2 on another door: a shared bar DRAGGED onto a weekend asks the OIL question of one record only (`ui/caldrag.ts` about line 149 → `askOilIfPending(r)`), so one man's standing No can leave another unanswered | Medium | **SEEN and FIXED (W16):** `ui/groupeditor.test.tsx` "the FIRST man has a standing No, the other no answer: it asks" failed on the code as read (nothing asked). The question that follows a move now looks at every man of the entry and opens on the first who needs an answer |
| S3 | A person whose callsign sorts BEFORE the others is added to a shared input from the List: the filing is drawn TWICE — the old first man's row is pinned after the entries are de-duplicated (`ui/InputsPage.tsx` about lines 364, 788, 825). Drawing only; nothing extra is saved | Medium-low | **SEEN and FIXED (W19):** `ui/sharedline.test.tsx` "a man sorting FIRST is added from the List: still ONE row" failed on the code as read — two rows for one filing. Walker C had seen exactly this ("Anvil +2" and "Ace +2") and the host had wrongly set it aside as two filings. A pinned record is now turned into the row its entry is drawn as, once |
| S4 | = Astra's R4: Undo of a "Calendar" change switches the Inputs page to the SANS tab though the date is in view | Medium-low | FIXED with R4 (W17) |
| — | The medical-group rule missing at the command gate (the sheet's H8) | confirmed | covered by W15: a medical entry or an upchit is never read as part of a group, whatever a command writes |

**Reconciled.** The two reads share one finding (R4 = S4). Astra alone: R1, R2, R3, R5. Sol alone: S1, S2, S3. Neither
reported a fault in what a published day issues, in what OIL a man is credited, or in who may change whose input at
the command gate. Both name `[CAL-TOGO-ONE-ITEM]` as still open.

## 11. The close — 9 Oct 26, 00:50

**After both reads' fixes — the whole gate set again, under the PC lock, watched, on `8b5fe3cb`: wholly green.** unit 9324
of 9324 (564 files) · build clean · the reference 728 / 0 · the browser tests 706 passed, 0 failed, 56 skipped · the
Tracker smoke 445 / 0 · the rule check OK · the document check OK.

**The re-walk of what the fixes touched, by the host, in the running final build** (pictures `host-final/`):
`cal-host-leads.mjs` 4 of 4 (one holiday, one word on four screens; Escape and the window in front; a people-only
change asks and keeps the picks; the changes window's one line with the names under it); `cal-host-side.mjs` 2 of 2 (a
day opened on a sideways phone, both calendars — every entry reached); `cal-host-short.mjs` 6 of 6 (each settings
window's Save reached at 844, 664 and 568 tall). The readers' seven fixes (W13–W19) are rules of what is asked, saved or
drawn once — each is held by the test that failed before it and by the green browser suite; they were not walked again
by hand. **That is said plainly: W13 to W19 have a failing-then-passing test each and no picture.**

**Found and fixed in this check: nineteen** (W1–W12 from the roll-call, Astra's scenario leads, D624's pairs and the walk;
W13–W19 from the two code reads). **Filed, not fixed: four items** — `[CAL-SHARED-DATES]` (a missing door, recommended
before "merge live"), `[CAL-UNDO-OTHERS]`, `[CAL-TOGO-ONE-ITEM]`, `[CAL-CHECK-SEEN]`. **Parked for him: one question**
(below). **Not done: his look; a pull request — he said "No merge".**

`Walk: docs/handpass/2026-10-08-inputs-sans-calendar-check.md · 2,043 pictures (the walkers) + 40 (the host) · 60 surfaces (the roll-call's rows, each seen and operated) · 100 orders (Astra's 90 scenarios and the host's 10) · MISSING: 3 fixed (A5; a sheet behind the Calendar window; Calendar behind its settings window), 1 filed (To go out as lines)`

Carried by a test, not walked (listed apart, the order's §7.0): the resolver's boundary cases
(`state/flyplan-model.test.ts`) and the late rule's dates (`engine/lateinput.test.ts`, `engine/latecut.test.ts`) — each
calls the calculation and proves the arithmetic; the route on screen was walked once for each (walkers A and F).

`Docs: OUTSTANDING 147 items (+14 −0) · DECISIONS D1–D679 · homes OK`
`docsize: OVER by 17353, deferred (D29)`

### Questions waiting for him

1. **May the approved mock-ups be copied from your private folder into the repo?** The plan's step 6 has them go into
   `raptor-port/docs/mock/`. Seven of the 36 showed the other squadron's daily figures (six SANS pictures and the settings
   sheet drawn over the SANS month); all seven are redrawn with made-up numbers and waiting. The copy was stopped by the
   app's own safety check on moving private files into a repo that is public for now. **Recommended: yes** — the redrawn
   seven carry nothing of the other squadron, and the rest never did. Waiting on it: the mock-up half of D624's
   side-by-side pictures in this sheet (the pairs exist on your PC; the differences they showed are §5 and §8).

**Question 1 — ANSWERED 9 Oct 26: "1 yes" (D680).** The copy is made: the 36 approved pictures and the page that shows them are in `raptor-port/docs/mock/` (`inputs-sans-calendar.html`, pictures under `img/inputs-sans-calendar/`). The host opened every one of the 36 before the commit: the seven SANS pictures carry the made-up figures only, the Leave War pictures are the demo squadron, and none shows the other squadron’s numbers or names. The originals stay in his private folder.

**The look card’s first two lines are answered too (9 Oct 26):** line 1 — agreed, built before "merge live" (D681); line 2 — yes, that is what he wants (D682). Lines 3 to 5 still wait for his look.

### The look card — on the preview, his iPhone for the phone lines

1. **A shared input's dates cannot be changed once saved** (drag it, or delete and file again) — say if it is built before "merge live".
2. **OIL:** whoever filed a shared duty and answers its OIL question again answers for everyone in it — a man's own earlier No is replaced. Is that what you want?
3. Pick several days on the Inputs month: the new-input window opens at once (the drawing kept the days picked with a bar to confirm).
4. The people picker on your phone: the pucks are spaced for a finger, so SANS is below the first screen. Tighter, as drawn?
5. On your iPhone: type a Required figure on the number pad; hold and drag a bar; pull a day's window up by its bar.

## 12. The door built after the check — a saved shared input’s dates (D681, 9 Oct 26; `[CAL-SHARED-DATES]`)

His word ("2 agree"): built before "merge live". It rides this job’s one check (D485) as its last piece, with its own
tier, roll-call, sizing, walk, gates and reads.

**What was built.** In the window a shared input opens in on the Inputs page, the two-tap calendar a new input already
has — for a reader who may change the input for everyone (its filer, an admin). The first tap is the new start, the
next the new end; one tap and Save is a one-day input. Save is the entry’s one command, which already took its dates
from the window: only the control was missing. The words under the form now speak of this door. Nothing is stored
that was not stored before; no rule of who may was changed.

**The eight questions.** 1 OIL — YES (new dates that reach a weekend or a holiday bring the OIL question). 2 the
published record — YES (new dates on a published day are a change waiting to go out). 3 saved data — NO: no field,
no reader of older data. 4 a shared drawer — YES (the one editor, opened from five places). 5 a new control — YES.
6 a new surface — NO. 7 roles — YES, by the rule that an unprovable NO is a YES: the control must follow who may
change the input. 8 the warning list — NO. **Tier: FULL.**

**The rulings swept, each checked in the running build or by the test named:** D681 (D1–D8, M2, P); D655 — its
filer and an admin change it, a man in it does not (M1, M2; `groupeditor.test.tsx`); D660 and D682 — the OIL question
asked once, of whoever changes the dates, its answer on every record (D9); D658 — a SANS commitment an admin filed
for several (D11); D641 — the page behind the window works (D8); D663, D109, D178 — one change waiting on a published
day, by the same command the bar’s drag uses (not walked again: below); D629 — "placed by" untouched, "changed" stamped
(`commitInputEdit`, unchanged); D672 — Undo leaves the month where it is (D4); D487 — no button resized (the
calendar’s days are the size they are on "+ Input").

### The roll-call — every place the app opens an input, and whether the dates door is there

| # | Where a saved shared input is opened | The calendar | Usable by | What else is on those pixels | Seen |
|---|---|---|---|---|---|
| R1 | Inputs month — its one bar | HAS IT | filer, admin | the window grows by the calendar; its body scrolls; Save stays the last row | D1, D5–D9, P |
| R2 | Inputs month — the opened day’s one line | HAS IT | filer, admin | the editor opens in FRONT of the day’s window | D2 |
| R3 | Inputs List — the shared row’s one button | HAS IT | filer, admin | the List’s own Add form (its own calendar, other ids) is behind the window | D3 |
| R4 | SANS month — the opened day’s line of a commitment filed for several | HAS IT | admin (D658: a member never files SANS for another) | the SANS day’s window behind | D11 |
| R5 | any of R1–R4, read by a man IN it who did not file it | MUST NOT, because the dates are everyone’s (D655) — he keeps "Take me out" and his own OIL answer | — | — | M1 |
| R6 | any of R1–R4, read by anyone else | MUST NOT (read only) — and the words that sent him "to the Inputs page" are gone | — | — | `groupeditor.test.tsx` "a man in it … and anyone else" |
| R7 | Edit Schedule’s board and week — the dialog on ONE man’s record | MUST NOT, because a moved span would take the row off the day it was opened from (the dialog’s standing rule); its words still say where the dates are changed | — | — | `groupeditor.test.tsx` "the board’s dialog on a record of a shared input" (a render of the same component; not driven in the built app — said plainly) |
| R8 | the bell’s OIL question, which opens the editor on the flagged record | as R1 or R5, by who reads it | — | the OIL sheet is over the form until answered | not walked: the same component and the same test of who may (`readOnly`) |
| R9 | an ordinary one-man input, in the same window | MUST NOT in this change (D681 reading 7): it keeps its row in the List and its bar | — | — | `groupeditor.test.tsx` "an ordinary one-man input keeps its window as it was" |
| R10 | a medical entry | never shared (`inputgroup.ts`), so never R1–R4 | — | — | W15’s test |
| R11 | the Leave War’s remark sheet; the changes window; View-only Sched | NOT APPLICABLE — none of them opens the editor | — | — | — |

**The door check — the new control in both orders:** people then dates (D5); dates then people (D6); dates half
picked, then another input asked for (D7 — it asks first); dates changed BEHIND the window while it is open (D8 —
the window follows); dates then Save into a question (D9 — OIL); dates then Save into a refusal (D10 — the window
stays, nothing written for anyone); Undo after (D4).

### The sizing (D607)

1. **The type of change:** C (a new control on a surface that exists), touching H (it must follow who may) — NOT G:
   the command it saves through is unchanged and was walked in this check (the editor’s save, the bar’s drag).
2. **What only a walk could find:** the calendar missing on one of the four doors or present where it must not be; the
   window too tall for a short or sideways phone, Save pushed out of reach; a finger’s tap landing on the wrong day; the
   OIL sheet or the refusal drawn under the window; the window not following a drag made behind it. The tests cover who
   may, the one command, one Undo, and the OIL answer on every record.
3. **What the ledger says:** walks of a new control on an existing window (type C) found layout and layering faults,
   seldom a rule; this check’s own eight-walker pass found its faults on windows over other things and on short
   screens — so those are driven here.
4. **The walk chosen:** the HOST, no helpers — 16 steps in one script, the app’s own controls throughout: eleven on a
   desktop as the admin, two as the member Ranger, and the same flow on a phone upright (390 × 844), short (390 × 568)
   and on its side (844 × 390). **Left to a test, each named:** who may per role beyond the two faces driven
   (`groupeditor.test.tsx` — through the window’s own controls in a rendered page); the board’s dialog (R7 — the same
   file; a render, not the built app). **Not walked again and carried by no new test:** a published day reading "1
   pending" after the dates move onto it — the write is the SAME command the bar’s drag runs (`commitGroup`), which
   walkers G and H drove onto published days in this check (§6); the route on screen differs only in the control.
5. **The row** is added to `docs/walk-ledger.md`.

### The walk — `scripts/handpass/cal-host-dates.mjs`, the built bundle, 9 Oct 26; pictures `host-dates/` (23)

| Step | What was pressed | Result |
|---|---|---|
| D1 | the bar of a meeting filed for three | the window, the calendar in it, the saved day lit |
| D2 | the opened day’s line | the same window and calendar |
| D3 | the List’s one row; a tap on the 27th, a tap on the 28th; Save | the line under the calendar read "Oct 27 → Oct 28"; all three records on those days; ONE bar |
| D4 | Undo, once | every man back on the 20th |
| D5 | a fourth man added, THEN new days | four records, one input, the new days |
| D6 | one tap on a new day, THEN a man taken off | a one-day input; three records on it, his gone |
| D7 | a new start picked, then a press on another input’s bar | it ASKS before showing the other; Cancel leaves the input as it was |
| D8 | the window open; the bar behind it dragged two days on; a remark typed; Save | the calendar in the window moved to the new day by itself; saved on the dragged day with the remark |
| D9 | a duty for two on a Friday stretched onto the Saturday; Save | the OIL question ONCE, over the window; nothing written before the answer; Yes on both records |
| D10 | leave for two stretched over one man’s other leave; Save | refused for everyone, in words naming him ("Sidewinder already has LL on 8 Oct … nothing was saved for anyone"); the window stays |
| D11 | the SANS month: a commitment for two SANS people, from its day | the calendar in the window; both men on the new days; no "delete it and add it again" |
| M1 | Ranger opens the demo’s meeting for four, which he did not file | no calendar; "Take me out" offered; nothing sends him elsewhere for the dates |
| M2 | Ranger files a meeting for himself and Saber, reopens it, picks new days | the calendar is there for him; both records on the new days |
| P × 3 | a phone upright, short and on its side: tap the bar, tap two days, reach Save, tap it | the window whole on the screen; the calendar inside its width; Save reached with nothing over it; saved |

**16 of 16.** On the first run D10 read FAIL: the script looked for the message in the wrong element — the picture
showed the right words on screen; the script was corrected and the whole walk run again (the host’s error, not the app’s).
**The pictures were opened by the host:** D3 (the List behind, the window, the two days lit), D9 (the OIL sheet over the
window), D10 (the refusal), D11 (the SANS window), M1, and the phone upright, short and on its side.

**Seen, and told to him rather than changed:** on a phone the calendar’s days are about 20 points tall — the size they
already are on "+ Input", and no button is resized without his word (D487). A finger landed on the right day in every
run; it goes on the look card.

**Break tests:** a refusal for one man (D10); a half-finished pick abandoned (D7); the record moved behind the open
window (D8); the three small screens (P).

### The gates after the walk — under the PC lock, watched, on `cfcd40b7`: wholly green

unit 9335 of 9335 (564 files) · build clean · the reference 728 / 0 · the browser tests 708 passed, 0 failed, 56
skipped · the Tracker smoke 445 / 0 · the rule check OK · the document check OK.

### The two code reads of the door (each blind to the other; this section in their hands)

Astra and Sol 6.1, `codex exec`, read-only, the brief `docs/superpowers/briefs/2026-10-09-shared-dates-read-brief.md`;
their reports whole: `…-read-astra.md`, `…-read-sol.md`. Both: **CHANGES REQUIRED.** Seven findings, six distinct.
**Every one was reproduced by the host as a failing test before anything was changed** (`ui/groupeditor.test.tsx`, "the
date door, after the two reads": nine red of ten), and none had been met by the walk — each needs an order of action
the sixteen steps did not take.

| # | Who | What goes wrong | Disposition | The test that was red first |
|---|---|---|---|---|
| W20 | Astra A1 | A shared input moved by EXACTLY a year (13 Oct 2027 to 13 Oct 2026): nothing is written, and the window closes saying "Input updated" — the dates were compared as their printed labels, which carry no year inside the loaded one | FIXED — `commitGroup` compares the dates themselves | "moved by exactly a year…" |
| W21 | Astra A2 = Sol 2 | A remark that says "till 14 Oct"; a man ADDED and new dates in one Save: the men kept get "till 21 Oct", the added man keeps "till 14 Oct" — and since the remark is part of what makes the records one entry, the one input comes out as TWO | FIXED — one effective remark, worked out once, for every man kept or added; the picker still never rewrites the remark | "a remark that says till 14 Oct…" (both orders) |
| W22 | Astra A3 | A December input opened without closing an October one: the title and the line say December, the calendar shows October (its month is seeded once, and was seeded from the input held before) | FIXED — the calendar is made again when the window takes another record’s dates, never on a tap | "another shared input opened without closing the first…" |
| W23 | Astra A4 | A new start tapped; the input moved behind the window; "Take theirs": the window still waits for an END, so the next tap stretches the range instead of starting a new one | FIXED — dates taken back are a finished range again | "…Take theirs: the next tap is a NEW start again" |
| W24 | Sol 3 | The first tap is ON the day already saved, then the input is moved behind the window: his start is replaced without a word (a tap that changes nothing read as "not touched") and the next tap finishes THEIR range | FIXED — a date he has tapped is his; a move behind him then asks | "the first tap is on the day it is already saved for…" |
| W25 | Sol 1 | **OIL (D682).** The filer adds a man to a Saturday duty already answered; the sheet comes back for "X +2"; he answers — and the answer goes on the ADDED man’s record alone, a man’s own earlier No still standing. Older than this door, but against the ruling of the same day, and this door’s sheet rests on it | FIXED — the filer’s (or an admin’s) fresh answer goes on every record kept; a man who may only ADD somebody still answers for that man alone; a cancelled question moves nobody’s answer. D660’s full row says what D682 changed in it | "a man added to a Saturday duty already answered…" (Yes and No); `leavewar/groupwrite.test.ts` "the FILER adds a man and answers again…" |
| — | both | The words under the form did not say the one-day way | FIXED — "…for one day, tap that day and Save" | "the words under the form say the one-day way too" |

**Run and found sound, as both readers expected:** a range across the year’s end (30 Dec to 1 Jan 2027, both men, reopened);
a Saturday duty answered Yes and moved to a Tuesday (nothing asked, nothing left to earn — the host first wrote this
test expecting the old answer to be wiped; it stays written against its own Saturday and earns nothing on a Tuesday:
the host’s wrong expectation, corrected). **Their cases NOT run, said plainly:** a reader’s right to change taken away
while the OIL sheet is open (Astra 6, Sol 5 — the write is refused at the command gate by the rule `perms.test.ts`
holds; not driven); a move onto a published day (Astra 8, Sol 8 — the same command the bar’s drag runs, walked in §6;
not walked again through this control).

**One existing test changed, by a ruling:** `leavewar/groupwrite.test.ts` "a man added later … nobody else’s answer
moves" was about a man who did NOT file the entry adding somebody; it stands, retitled to say so. The filer’s case is
a new test beside it (D682).

### The re-walk of what the fixes touched — the same script on the fixed build, pictures `host-dates-2/`

**19 of 19:** the sixteen steps again, and three added for the fixes — D12 a December input opened over an October one
(the calendar reads "DEC 2026", its day lit); D13 a man added and new days in one Save with a "till" remark (three
records, one bar, every remark "brief till 11 Nov"; the remark box untouched while picking); D14 the filer adds a third
man to a Saturday duty where one man holds his own No, and answers Yes (one sheet, headed "OIL — Gambit +2, Duty"; Yes
on all three). The three new pictures were opened by the host.

## 13. D624’s pairs — each approved mock-up beside the built screen (in the repo since 9 Oct 26, on his word: D680)

**36 pictures, `docs/img/handpass/2026-10-08-inputs-sans-calendar-check/pairs/`** — one for each approved mock-up of
`docs/mock/inputs-sans-calendar.html`, numbered in that page’s order (`01-sans` … `36-chg-one-phone`). In each, the
mock-up is on the LEFT and the built screen on the RIGHT, at the same scale, a magenta line between them. The seven
SANS mock-ups are the ones redrawn with made-up figures; the built halves show the demo squadron.

**When they were made, said plainly:** on the night of 8 Oct, BEFORE this check’s fixes — they are the evidence the
fixes came from, not pictures of the final build. What they showed is §5 (W1, W6, W7 and W12 were found in them) and
§8 (the differences told to him and not changed: the picker’s spacing, "Calendar" for "Days", the gear’s lines,
several days picked opening the window at once). The built side after the fixes is in the host’s re-walk pictures
(`host-rewalk/`, `host-final/`) and the walkers’ own.

## 14. The close of the date door — 9 Oct 26

**The final gate run, under the PC lock, watched, on `ec9791b8` (the door and its six fixes):** unit 9349 of 9349 (564
files) · build clean · the reference 728 / 0 · the Tracker smoke 445 / 0 · the rule check OK · the document check OK ·
**the browser tests 707 passed, 1 FAILED, 56 skipped.** The one failure is `e2e/leavewar.spec.ts` "the grid draws a
window of months over year-wide placeholders…" (Leave War, desktop), at its 5-second wait for December to leave the
drawn months — **the known unsteady test `[LW-WINDOW-PRUNE-FLAKE-2]`** (`OUTSTANDING.md`: a fixed wait for something that
happens only when the PC is idle), on a screen this change does not touch (the change is one file, the input editor).
By D84 it got one re-run and no investigation: **alone, 3 of 3; its whole group (the Leave War desktop browser tests)
re-run under the lock, 186 passed, 0 failed.** The same test passed in the first full run of this section, on `cfcd40b7`.
Said plainly: no single full run on the final code was wholly green; every gate but that one test was, and that test
passed four times running straight after.

`Walk: docs/handpass/2026-10-08-inputs-sans-calendar-check.md · 2,043 pictures (the walkers) + 40 (the host) + 49 (the date door: 23 and 26) + 36 pairs · 71 surfaces (the roll-call's 60 rows and the date door's 11) · 119 orders (100, and the date door's 19 steps) · MISSING: 4 fixed (A5; a sheet behind the Calendar window; Calendar behind its settings window; a saved shared input's dates — built, D681), 1 filed (To go out as lines)`

Carried by a test, not walked (the order’s §7.0): the six fixes W20–W25 beyond the three re-walk steps (W20 a move of
exactly a year, W23 "Take theirs", W24 a tap on the saved day — each `ui/groupeditor.test.tsx`, through the window’s
own controls in a rendered page; the change behind the window is made by calling the entry’s command directly, the
route a real drag takes having been walked as D8); the board’s dialog (R7).

`Docs: OUTSTANDING 146 items (+13 −0) · DECISIONS D1–D682 · homes OK`
`docsize: OVER, deferred (D29)`

**Found and fixed since §11: six (W20–W25), all from the two reads.** In the whole check: twenty-five fixed.
**Filed, not fixed: three** (`[CAL-UNDO-OTHERS]`, `[CAL-TOGO-ONE-ITEM]`, `[CAL-CHECK-SEEN]`) — `[CAL-SHARED-DATES]` is built
and archived. **No question is waiting for him.**

### The look card, as it stands — on the preview, his iPhone for the phone lines

1. **The new date door.** Open a shared input (its bar, or its row in the List): the calendar is in its window. Tap the
   new start, tap the new end, Save — everyone in it moves; Undo puts it back.
2. **OIL, as he ruled (D682) — one reading to hear:** when whoever filed a shared weekend duty ADDS a person and answers
   the OIL question that comes back, the answer is now for everyone in it, not only the person added. Cancelling the
   question changes nobody’s answer.
3. On a phone the calendar’s days in that window are small — the size they already are on "+ Input". Bigger?
4. Pick several days on the Inputs month: the new-input window opens at once (the drawing kept the days picked with a
   bar to confirm).
5. The people picker on his phone: the pucks are spaced for a finger, so SANS is below the first screen. Tighter, as drawn?
6. On his iPhone: type a Required figure on the number pad; hold and drag a bar; pull a day’s window up by its bar.

## 15. His look, first change — the day opened on the Inputs calendar, on a phone (D683, 9 Oct 26)

His words, with a picture from his iPhone of Thu 16 Jul on the preview: "Can u show the window to like a tall size when
someone clicks on a day for input. Day title and input can be slightly shorter in height. +note and pucks can shift it
to to beside the day title in this case on the right of thu 16 jul".

**Built:** on a phone the day opens at its TALL height (it opened two-thirds high), every time, and its bar still
brings it down and back; the "Day title" box and "+ Input" are 38px on a phone (from 44); an admin’s "+ Note" and
"+ Pucks" are in the window’s bar, after the date — on a desktop too. The SANS calendar’s day is not changed (D648).

**The eight questions.** 1 OIL — NO: nothing that files, saves or counts is touched; the three files changed draw a
window. 2 the published record — NO, the same reason. 3 saved data — NO: the height is not remembered, nothing is
stored. 4 a shared drawer — YES: the window shell every window of this job stands on took two new settings. 5 a new
control or place for one — YES: two buttons moved into a bar that is also a drag handle and, on a phone, a tap
target. 6 a new surface — NO. 7 roles — NO: who sees "+ Note" and "+ Pucks" is the test it was, moved with them (a
member’s bar was driven). 8 the warning list — NO. **Tier: WALK.**

**Roll-call — every window on the shell, and whether it changed.** The Inputs day: opens tall on a phone, two buttons
in its bar — CHANGED (seen). The SANS day (`rests`, no `tallFirst`, no `tools`): MUST NOT change, because D648 is his
ruling for it — `ui/sansday.test.tsx` "on a phone: two rest heights" still green, and its browser test. "Calendar",
the two settings windows, the input editor, the changes and ALL AVAIL windows: pass neither setting — MUST NOT
change (`ui/floatwindow.test.tsx`, the day-window browser tests of both calendars, 5 of 5).

**Sizing (D607).** Type E and C: layout, and two controls in a new place. Only a walk could find: the bar too crowded
to read the date; a tap on a moved button taken as a tap on the bar; the tall window off the screen on a short phone;
the list under a shorter top. The ledger: layout walks find what is covered or cut off, at the sizes driven. **Chosen:
the host alone, one scripted run of the built bundle** (`scripts/handpass/cal-host-day-look.mjs`, a look, not a gate; pictures `host-day/`, 13) — a phone as the admin
and as the member, a short phone, a phone on its side, a desktop.

| What was driven | Result |
|---|---|
| phone 390 × 844, admin: tap 16 Jul | the window 824 of 844 high, tall; the date read whole (137 wide); "+ Note" 56 × 36 and "+ Pucks" 64 × 36 in the bar, the cross 44; the title box 38, "+ Input" 38; no sideways scroll |
| …a tap on the date in the bar | down to two-thirds; no input opened by the tap; a second tap, tall again |
| …a tap on "+ Note" | the note box opens; the window stays tall |
| phone, the member Ranger | tall; the bar carries the date alone; "+ Input" 38 |
| phone 390 × 568 | 548 of 568 high, whole on the screen; the same bar |
| a phone on its side, 844 × 390, and a desktop 1440 × 900 | the window beside the month as before (not made tall); "+ Note" and "+ Pucks" in the bar; the title box 36, "+ Input" 40 — as they were |

Pictures opened by the host: the phone as admin (opened; "+ Note" pressed) and the desktop.
**Seen, not changed:** Escape pressed while typing a note closes the whole day — the shell’s rule, older than this
change; added to `[CAL-CHECK-SEEN]`.

**Tests, red first:** `ui/inputsday.test.tsx` "the day as he asked for it on his phone (D683)" — four of seven red
before the build. **Two existing tests changed, by the ruling:** `ui/inputscal.test.tsx` (the two buttons "lead the
list" → they are in the bar) and `e2e/inputs-calendar.spec.ts` (the phone day "opens about two-thirds high", "+ Input"
at least 44 → opens tall, 38).

## 16. His look, second and third — a drag picks the pucks (D685); a finger on a window never scrolls the page behind (D686)

**D685 — his words, with a picture of the people picker:** "I should be able to drag to select multiple pucks". Built in
the one picker (`ui/PeoplePick.tsx`): a drag does what its first puck does, across the headings, never letting the last
man go; on a phone it starts sideways, and a finger moved up or down still scrolls.

**D686 — his report, with a picture of the new-input window:** "then I try to scroll the page, surprisingly the page
behind this window is being scrolled instead of the window that my finger is on". **NOT REPRODUCED on the build PC —
said plainly.** The host drove the built bundle with a real touch at five phone heights, with the page behind made
taller than the screen and the form both fitting and not: in this browser engine the page behind never moved. The
cause is taken from how an iPhone is known to behave — where what is under the finger cannot scroll (it fits, or is at
its end), the swipe passes to the page behind, and the stylesheet’s hold applies only where there is something to
scroll — and the window now stops such a swipe itself (`ui/FloatWindow.tsx`, every window on the shell). **Only his
iPhone can say it is fixed; it is the first line of the look card.**

**The eight questions, for the two together.** 1 OIL — NO: neither files, saves or counts anything; the picker hands
its owner the same list of people a run of taps would. 2 the published record — NO. 3 saved data — NO. 4 a shared
drawer — YES: the one picker (four places) and the one window shell (every window). 5 a new gesture — YES. 6 a new
surface — NO. 7 roles — NO: who may be picked is asked after the picking, by the test it was (`pickProblem`, the
save). 8 the warning list — NO. **Tier: WALK.**

**Roll-call.** The picker shows in: a new input’s window, a saved shared input’s window, the List’s own Add form, the
SANS calendar’s "+ Commitment" — ONE component, so the drag is in all four or none (driven in the first; the others
by the component’s own test). The window shell carries: a day opened (both calendars), the input window, "Calendar",
the two settings windows — the listener is the shell’s, so all or none; the two OLDER movable windows (the changes
window, ALL AVAIL) are not on this shell and are NOT changed — the same fault may be theirs, and it is said on the
look card rather than assumed.

**Sizing (D607).** Type C twice. Only a real finger could say: that a sideways slide is given to the picker and an
up-down one kept by the browser; that the click after a drag does not undo its first puck; that stopping stray swipes
did not stop the window’s own scrolling. **Chosen: the host, three real-browser tests** (they are the walk, and stay
as gates): a phone — a finger slid along a row of four picks the four, and a finger moved up over the pucks scrolls
the form and picks nobody; a desktop — a mouse dragged along a row and down into the next picks every puck passed,
a click then lets one go, a drag begun on a picked puck lets them go; a short phone — a finger on the form scrolls
the form and not the page, and at the form’s foot moves nothing. **3 of 3.**

**Tests, red first:** `ui/peoplepick.test.tsx` "a drag across the pucks…" (five of six red) and
`ui/floatwindow.test.tsx` "a finger on a window…" (two of five red — the other three pin what must stay as it was).
