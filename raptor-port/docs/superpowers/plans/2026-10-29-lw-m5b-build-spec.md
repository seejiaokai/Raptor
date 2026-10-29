# The Leave War overhaul's M5b — the admin's set-up: the build spec (29 Oct 26)

**What M5b is.** The second of M5's two merges (D1475; the M5 plan `2026-10-28-lw-m5-plan.md` §3 and §7): jobs 6–7 —
the new Settings window, Management first, holidays and events by file. Built on `claude/leave-war-m5b-iphone-balances-1402b7`
(with the iPhone locked-Balances fix already on it, D1497/D1498). Tier **FULL**: of the eight questions, saved data is yes
(a built-in Quals column added to every stored list at load; holidays added in bulk from a file, one command), a new
surface (the Events list, the import's preview), new controls (Events…, "+ SANS", Export / Import sheet, "＋ Event" from
the list), a shared drawer (a qualification group drawn on the grid, in Settings, in the quals popover, in the counter
filters), and a new command with its permission row (the import). One fresh, blind Opus read of the finished code (D790);
the security read (D1411) on the new command's gate; the ChatGPT reads owed on `[NO-ASTRA-LIST]` (D761).

**Every M5b screen has an approved drawing (D1499–D1502) and is built to it, checked beside it as it is built and after
every fix** (D1424, D1426, D1478, D1495; walk-scripts §10). The drawings of record, all under
`raptor-port/docs/mock/lw-overhaul/full/m5b/`, drawn by `full-m5b-draw.mjs` on the branch's base (main at 7215c5ec3 with the
fix): `m5b-d1-settings-desk` / `-phone` / `-desk-sans` (and their `-whole`), `m5b-d2-events-desk` / `-phone`,
`m5b-d3-holidays-buttons-desk` / `-phone`, `m5b-d3-holidays-preview-desk` / `-phone`, `m5b-d4-quals-desk`. The script's
transforms carry the exact markup and spacing (the label rows' `min-width: 78px`, the rows box's padding, the Events
top row's margins): the build reads them from there, never re-types them (D1478).

**Rulings it carries** (open each full row before acting on its detail — `grep -h '^| D1499 |' .claude/decisions-full/*.md`):
D1499 (Settings as drawn — answers D1205; builds D1221 "+ SANS", D1485 no Balances line), D1500 (the Events list — D1155's
list half), D1501 (holidays by file — D1155's file half, narrowed), D1502 (Management already on Quals — narrows D1200,
D1149); and with them D1215 (SANS off unless added, never in Everyone else), D1270 (no sideways scroll in Settings on a
phone), D160 (Reset order in ⚙), D638 (a holiday has two doors onto one record — the Event row and the Holidays list),
D645 (the Event window, its presets and short forms), D652 (a holiday's short form), D1259 (events stay full Event rows),
D1200's "a man in Management still counts in his own seat" (a group never moves a count). Must keep: D641 (windows do not
block), D997 (a phone window in the middle), D672 (Undo leaves the screen where it is), D487 (button sizes), D850 (feedback
on the screen itself), D1281 (the phone press checks), D200 (perms.ts and §11 together), D56 (stored demo data is no
finding), D149 (a member edits his own Quals row, every column — see reading 1).

**Every file and line named in §3 was read on the branch at a633a2970 on 29 Oct 26; the builder verifies each before acting.**

## 0. Before starting — what is settled and what is not

- **All four questions are answered** (29 Oct 26, "All as recommended": D1499–D1502; read for meaning by one fresh reader,
  D138, two findings taken). Nothing in this spec waits on him.
- **Readings built as recommended and named at his look, his to strike** (§5) — none blocks the build.
- **Where the build may depart from a drawing:** nowhere on purpose. A departure found needed while building is drawn beside
  the approved picture and put to him first (D1426); an outright fault (words breaking, something covered or off screen) is
  fixed without asking.

## 1. The screens

### 1.1 Settings (D1499; drawing `m5b-d1-settings-*`)

- **Title:** "SETTINGS" alone (the "counters, rows & groups" line goes); the window's spoken name "Settings".
- **Three label rows** in the bid window's own row style (`.bidsheet-row` + `.lab`, the label column 78px):
  **Year** — Calendar…, Events…; **Manning** — ＋ Counter, ＋ Event row (and －Event row while more than the default
  rows exist, as today); **Order** — ⇅ Rearrange the grid, ↺ Reset order (greyed while the roster is in its default order;
  arms "Really reset?" as today). The trays, their headings and their sentences go.
- **Show SANS goes.** SANS is added by **"+ SANS", the first of the add chips** (while SANS is off) and taken off by its
  row's ✕ (D1221) — the row keeps "shown · counted" at the foot of the groups, with no grip.
- **Groups:** the heading reads "Groups" (its hint line goes); rows as today; **Everyone else** is a last, muted row: no
  grip, a dashed empty swatch, its name grey, "last" where a row says its kind, its count, no ✕; it cannot be moved or
  removed. The sentence under the list goes. A tap on a group's name still lists who is in it (D1499 reading 3).
- **Add a group:** its hint line goes; "+ SANS" first, then the offerable groups in their order (Management first among
  the qualifications once there, §1.4).
- **Who wins when someone fits two:** "— rarely needed" goes ("follows the page" / "custom order set"); what opens under it
  is not drawn and stays as built (reading 8).
- **Back to the standard groups** stays.
- **A phone never scrolls it sideways** (D1270): kept by a browser test at 402 and at 375.

### 1.2 The Events list (D1500; drawing `m5b-d2-events-*`)

- **Opened by Events…** in Settings: Settings closes and the list opens in the same window frame (a `Sheet`, its title bar
  "EVENTS" and the period in View, e.g. "JAN – DEC 26").
- **Its top row:** "＋ Event" (the Settings window's own ＋ button) at the left; "Edit presets" (the Event window's own
  button) at the right.
- **Its lines:** the Event rows' events over the period in View (the period on screen — D1484's sense of "in View"), one
  line each by date: a merged band one line, a word repeated on next-door days on one row one line (as a band is one event),
  each drawn as a line of the Calendar window's Holidays list (`.hol-list` / `.hol-line`: its date or run of dates, its full
  name, then its kind's mark — the square and word a tap on a filled event cell already shows, `.evpeek-kind`); an event with
  no kind shows none; an event whose last day is before the app's today is greyed (`is-past`). Sorted by first day, then row.
- **A tap on a line opens that event's own window** (EventSheet, on its row and first day); the list waits behind it and
  comes back when that window closes. "＋ Event" opens the same window with nothing picked, ready to pick dates (§1.3).
  "Edit presets" opens the window's presets view; its ‹ goes back to the list.
- **Empty:** "No events in <period>." in the list's place.
- **The list repaints with the store** (an Undo, a change on the grid while it is open).

### 1.3 "＋ Event" — a new event from the list

The Event window as built (presets, name, On grid, kind, this day / a range, merge / repeat), opened **with no day picked**
(as the Holidays form's new holiday, D671) on the month of the app's today — or the period's first month if today is
outside it. **Its row is found at Save:** the first Event row free across the dates picked (`engine/holidays.ts
freeEventLine`), as a holiday's is; none free → refused with the Holidays list's own sentence ("Every Event row is already
used on those dates — add an Event row in the Leave War's ⚙ Settings, then try again."). One day picked saves as that day;
a run saves as one merged bar unless "Repeat" is chosen. Move and Delete are not offered (there is nothing yet).

### 1.4 Management on Quals (D1502; drawing `m5b-d4-quals-desk`)

- **A built-in column** `{ k: 'mgmt', h: 'Management', lav: true }` in `engine/qualcols.ts DEFAULT_QUAL_COLS`, beside SXO
  (after it). The heading prints in capitals as every heading does ("MANAGEMENT").
- **At load** (`qualColsLoad`) a stored list without `mgmt` gains it after `sxo` (or first, where there is no SXO) — a
  stored empty list included (D1502: every squadron has it). Nothing is written at load; the next column edit writes it.
- **It cannot be removed:** in Edit quals its heading has no ✕ (its grip stays — it can be moved); the list's writer
  (`setQualCols`) puts it back where a caller leaves it out (a write-path backstop, as every guard here is).
- **Its ticks** are as every column's: an admin's on any row; a member's on his own row (D149 unchanged — reading 1).
- **The Leave War:** the war knows it by its key `mgmt`, not its heading. It is offered as a group like any qualification
  (`q:mgmt`); **added, it stands first** — `addGroup` inserts it at the top of the display order, and of a custom who-wins
  order. It may then be dragged like any group. Its default swatch is the palette's blue, `#5AA9E6` (the drawing's
  `#4FA3E0` is not a palette colour; this is the nearest, within the check's colour tolerance); a pick changes it.
- **A man in Management still counts in his own seat** — groups never move a count (`engine/groups.ts` invariant).

### 1.5 Holidays by file (D1501; drawings `m5b-d3-holidays-*`)

- **Two buttons under the Holidays list** in the Calendar window (desktop: its Holidays part; phone: its Holidays tab):
  **Export sheet** (the app's Document button, `.abtn.docbtn`, its arrow turned down — the one new glyph) and **Import
  sheet** (the same button with its upload arrow). Shown also where the year has no holidays (under "No public holidays…").
- **Export** saves `holidays-<year>.csv`: a header row `From,To,Name,Kind,On grid`, then one line per holiday of the year
  shown (`holidaysIn(year)`), dates as `2026-08-09`, Kind `PH` or `Off day`, On grid the short form it prints. Plain CSV
  (no library): a name with a comma or a quote is quoted, its quotes doubled; a leading `=`, `+`, `-` or `@` in a name is
  written after a `'` so a spreadsheet never runs it as a formula.
- **Import** opens the browser's file picker (`.csv`, plain text); the file is read in the browser and **nothing is added
  yet**: the list's place shows the **preview** — the file's name in bold, then "7 to add · 4 already here · 1 not read",
  then one line per row of the sheet as a Holidays-list line: **new** (its name bold, "new" in cyan at the right),
  **already here** (greyed, as a past line), **not read** ("—" for its date, its name in red, and under it in red what is
  wrong and how to put it right — "Row 11: the date “8/11” cannot be read. Write it as 2026-11-08."); then **Cancel** and
  **Add 7 holidays** (the app's primary button), Add greyed where nothing is new. Cancel, or the year arrows, put the list
  back.
- **Reading the sheet** (the builder's call, M5 plan §4): the header row is found by its words (From, To, Name, Kind, On
  grid — any case, any order; a sheet with no header is read in that order); a byte-order mark and blank lines are skipped;
  commas, or semicolons or tabs where the header uses them. **Dates:** `2026-08-09`; a day-first date as a spreadsheet saves
  one in Singapore, `9/8/2026` or `09/08/26`; `9 Aug 2026` / `9-Aug-26`. Anything else — or a date with no year — is not read,
  and the line says how to write it (a day-first guess, with the sheet's year, given as the example). **To** empty = one day.
  **Kind** `PH`, `Public holiday`, `Off day` or `Off` (any case); anything else is not read ("Write PH or Off day.").
  **Name** up to the Holidays list's own limit; empty takes the kind's word, as the form does. **On grid** as the form's
  (`badShort` → not read with its rule).
- **"Already here"** = a holiday of the same kind on the same first and last day already in the app (its name not compared).
- **A row the app cannot place** — no leave period covers its first day, it runs past its period's end — is "not read" with
  the Holidays list's own sentence and its way out in words ("No leave period covers 3 Jan 27 yet — create it, then import
  again.").
- **Add** writes every new line in **one command**, `lw.holiday.import` — one Undo step ("Undo: adding 7 holidays"), all or
  nothing: each line is planned against the war as the lines before it leave it (its row found as `holidayAdd` finds it);
  if any is refused at that moment, nothing is added and the preview names the row and why. Inside the command the
  holidays' own after-effects run as for one holiday (the OIL question for work already published on a new PH, D783, via
  the gesture's `tellHolidays`). After it the list is back, each added line wearing the app's just-added ring (D850, D860).

## 2. What is stored, and who may write it (D473, D200 — the documents in the same change)

- **No new collection or field.** The Quals column list (`qualcols`) gains `mgmt` by default; the ticks are `p.quals.mgmt`
  as any column's; the imported holidays are the war's own holiday records (tagged day events and bands), written by the
  holidays' own planner; the Events list and the preview keep nothing. `showSans` stays the stored flag "+ SANS" and its ✕
  set (no change of meaning).
- **One new command, `lw.holiday.import`** — `COMMAND_OPS` in `state/perms.ts` as its three siblings (`op(T.war, 'U')`),
  `cmdDefinePermission` in `store.ts` beside them (admin only in the store, as every holiday writer), `undo/describe.ts`
  words, `state/undo-wire.ts` landing (its first day), `data-model.md` §11 unchanged in substance (the war's row already
  governs it — named in the evidence sheet).
- **`docs/data-schema.md`** (the qualcols default; the Management key), **`docs/data-model.md`** (Qualification: the
  built-in `mgmt` row that cannot be removed).

## 3. Where it is built — the code, as read at a633a2970

- **Settings:** `src/leavewar/ui/SettingsSheet.tsx` (485 lines) — the trays at L185–276, Show SANS L224–230, groups
  L279–372, add chips L405–423, who wins L426–476. Matrix mounts it at `Matrix.tsx` ~L4385–4409 (`onDays`, `onRearrange`,
  `onAddCounter`); a new `onEvents`. The chips' writer `store.ts addGroup` (~L2471); SANS `setShowSans` (~L4706).
- **Events list:** a new `src/leavewar/ui/EventsSheet.tsx` and an engine builder (`engine/eventlist.ts eventLines(period,
  rows, defs)`) over `period.days[].events` / `eventKinds` / `period.bands` (`engine` `bandAt`, `dayEventKind`,
  `classifyEvent`, `EVENT_KIND_WORDS`); the Event window `EventSheet.tsx` gains `fresh` (no day picked, row at Save) and
  `startView: 'types'` with ‹ back to the list; Matrix's `eventEdit` state (~L395) and its mount (~L4353–4362).
- **Management:** `src/engine/qualcols.ts` (default, load, write backstop); `src/ui/QualsPage.tsx` `qualsHead` (~L175–182:
  no ✕ on `mgmt`) and `delQual` (~L407, refuses `mgmt`); `src/leavewar/engine/groups.ts` (nothing — `mgmt` is an ordinary
  qualification key); `store.ts addGroup` (Management first); `ui/groupColor.ts qualSwatch` (its default blue).
- **Holidays by file:** `src/ui/HolidaysPanel.tsx` (the buttons and the preview, ~L113–133); a new pure
  `src/leavewar/engine/holidaysheet.ts` (write and read the CSV, classify each row); `leavewar/state/store.ts`
  `holidayPlan` (~L4542) made to plan against a given set of wars, and a new `holidaysImport(drafts)`; `leavewar/sync.ts`
  re-exports it beside `holidayAdd`. The Document button and its upload glyph: wherever the Leave War draws "Document"
  (to be reused, not copied).
- **Tests that pin what changes** (rewritten to the new behaviour, never weakened): `leavewar/ui/settingssheet.test.tsx`,
  `leavewar/ui/events.test.tsx`, any test reading `sans-toggle`, `settings-days-hint`, `roster-order-hint`, the qualcols
  default ten (`engine/qualcols` tests, `QualsPage` tests, Leave War catalogue tests), `undoaudit.test.ts`; e2e
  `leavewar.spec.ts` where it opens Settings or presses Show SANS. Found by running them, listed in the evidence sheet.
- **No other open branch touches these files** (to check at the build: `git diff --name-only $(git merge-base origin/main
  <b>) <b>` for each open branch — D302).

## 4. The roll-call seed (bug-check order §6) — the builder fills every cell: has it / must not, because… / MISSING

**A qualification group (Management):** the grid's group heading and its rows; Settings' group row, its swatch and palette,
its count, the members list on a tap of its name; the add chips; the who-wins list; the quals popover on a name's chip
(`shownQuals`); the counter form's filters (`heldQuals`); the Inputs "Several people" picker (does it read quals?); the
Quals table, its sort, its Export, Edit quals (no ✕), a member's own row; the change history's Quals line for a tick
("Management ✓ · Saber"); the people projection (`raptorRoster.qualCatalogue`); Undo of a tick and of adding the group.
**SANS on the war:** "+ SANS"; its row's ✕; the grid's SANS group; Everyone else never holding a SANS man (D1215); a man
posted out as SANS (D283); Approvals and the person window for a hidden SANS man (unchanged).
**An event:** the Event rows on the grid; the event peek; the Event window (from a cell, a drag, the list, "＋ Event");
the Events list; the Holidays list (PH and Off days are both); the Inputs and SANS calendars' date tags; the day panel; OIL
(a PH or Off day decides what earns); Undo and Redo of each write.
**A holiday added by file:** the Holidays list, the grid's Event row, the calendars' tags, the Required rows (a holiday
needs nobody), OIL's question for published work (D783), the bell, Undo / Redo, a reload, the period HOLDING each date (a
sheet across two years).
**Every way into Settings and back:** ⚙ on desktop and phone; Calendar… (Settings closes); Events… (Settings closes);
Rearrange (Settings closes); ＋ Counter (Settings closes); Escape; a click outside (D641 — the grid behind works).

## 5. Readings built as recommended — named at his look, his to strike

1. **A member may tick his own row's Management** (D149: his own row, every column — unchanged; D1502's reading 1 said
   "D149's own-row rule unchanged"). Ticked, he is drawn under Management on the Leave War once the group is added. Put to
   him at his look: *recommended* — only an admin ticks Management (a one-line guard), since D1502's line says "the admin
   ticks its people".
2. A sheet may hold dates of any year; each is added to the period holding it; the preview lists them all.
3. "Already here" compares kind and dates, not the name — a sheet that spells a holiday differently adds nothing twice.
4. An import is all or nothing and one Undo step.
5. A day-first date (`9/8/2026`) is read as 9 August — as Singapore writes it.
6. Export writes the year on screen; a holiday running across New Year is written whole in the year it starts in.
7. The Events list's "past" is by the app's today; an event over today is not greyed.
8. Who wins' opened words stay as built (not drawn).
9. Management's default swatch is the palette's blue.
10. "＋ Event" places the event on the first Event row free across its dates; Move and Delete come once it is saved.

## 6. The drawing check (D1494, D1495; walk-scripts §10)

`scripts/drawcheck/specs/lw-m5b.mjs`, recorded from `full-m5b-draw.mjs` on the drawing's own build (main at 7215c5ec3 with
the fix, `claude/leave-war-m5b-iphone-balances-1402b7` at 3d2a069c4 — the commit it was drawn on), the approved pictures in
`full/m5b/`; records into `docs/mock/lw-overhaul/drawcheck/m5b/`. States and parts (a part inside another measured from it):
- **settings-desk / settings-phone** (`m5b-d1-settings-desk` / `-phone`): the window; the rows box; each label; Calendar…,
  Events…; ＋ Counter; Rearrange; Reset order; the Groups heading; the Management row, its swatch, name, kind, count, ✕;
  the SXO row; the Everyone else row, its swatch, name, "last", count; the first chip ("+ SANS"); the who-wins bar. Reached
  by real presses: Quals → Edit → tick Reaper's and Anvil's Management → Done; Leave War → ⚙ → "+ Management".
- **settings-desk-sans** (`-desk-sans`): the same with "+ SANS" pressed — the SANS row at the foot, "shown · counted".
- **events-desk / events-phone** (`m5b-d2-events-*`): the window, title, period, ＋ Event, Edit presets, the first line, its
  date / name / kind mark, the EX SHIELD line (no mark). Reached as the drawing staged it (the four events by the localhost
  bridge's `lwSetDayEvent`), then ⚙ → Events….
- **holidays-buttons-desk / -phone**: the Holidays part, its list, the file row, Export, Import (place, size, words).
- **holidays-preview-desk / -phone**: the preview box, its head, the first new line, its "new", the not-read line and its
  reason, Cancel, Add. Reached by Import with the drawing's own sample sheet as a file (the same twelve rows).
- **quals-desk** (`m5b-d4-quals-desk`): the MANAGEMENT heading beside SXO, Anvil's tick under it.
Run after every change: `npm run build`, then `node scripts/drawcheck/check.mjs scripts/drawcheck/specs/lw-m5b.mjs --dist
dist --out docs/img/handpass/2026-10-29-drawcheck-m5b-<n>`; red until each difference is put back or he rules to keep it.

## 7. The walk (sized at the build in `docs/walk-ledger.md`)

Types B, C, E, G (a rebuilt window; new controls; a new list window; saved data by file and Undo). Admin at his PC's size
(1536 × 860 at 125%) and his iPhone's (402 × 874); a member at both for Quals and the grid's Management group. Sonnet
walkers take the pictures, the host opens every deciding one (D787, D1271, D1273); a picture within about 100 ms of each
phone lift (D1281); a test that changes the data directly never stands in for a press (D608); every surface beside its
approved drawing (lesson 8). §7.11's lessons, each given its scenario: 1 (states — the tables below); 3 (feedback — after
Add, the added lines ringed; after "+ SANS", the SANS rows on the grid out of sight); 4 (the page behind — Settings and the
Events list over the grid; the grid pressed behind); 5 (brought into sight — the preview on a phone, Add reached); 9
(alignment measured — the label rows' buttons on one column; the Events list's three columns); 10 (the way back — Events…
→ an event → back to the list → ✕; Calendar… → Holidays → Import → Cancel); 11 (what fits — Settings at 375 with no
sideways scroll).

**Settings × state:** SANS off / on; Management not added / added (first) / dragged down / removed; a custom who-wins
order then Management added; roster arranged by hand (Reset order lit) / default (greyed); more Event rows than default
(－ Event row); Everyone else 0 and > 0 (a list of only qualification groups).
**Events × kind:** PH (a day, a run), Off day, No leave week on row 2, a working event, an untagged exercise, a past one,
an event over today; the list empty; a tap → edit → save → back; ＋ Event one day, a run merged, a run repeated, rows full;
Edit presets → ‹; Undo of a save made from the list.
**Import × sheet:** the drawing's sample; a sheet saved back by a spreadsheet (day-first dates, a BOM, semicolons); no
header; a row with no year; a bad kind; a too-long name; a bad On grid; a row no period covers; a row running past the
period's end; a run of days; a sheet across two years; all already here (Add greyed); a duplicate row in the sheet; Undo
and Redo of the import; a reload; a PH added over a published worked weekend (the OIL question, D783).
**Management × who:** admin ticks, member ticks his own (reading 1), member on another's row (refused); the group added,
its people on the grid first; a man in Management and IP counted once in his seat (the Manning rows unchanged).

## 8. The checks — the FULL row of the checking order (`docs/bug-check-order.md` §5, §7.0)

The rules sweep; scenario design by a fresh model other than the builder (§7 is its seed); the roll-call (§4); the door
check; the walk sized and walked (§7); the break tests (each new guard broken on purpose goes red — Management's ✕
refused at the page and the writer; the load adding Management; the import all-or-nothing; the CSV formula guard; a member
refused the import; "Already here" not added twice); the drawing check green or each difference his; GitHub's run of the
pull request as the full check while the repo is public (D1086), the changed tests on his PC; **one fresh, blind Opus read
of the finished code** (D790) **and the security read** (D1411 — the import's gate: a member, a sheet built to write
outside its period or onto a row that is not free, a formula in an exported name); the fixes red-first, the re-walk of what
they touched; the evidence sheet with its `Walk:` line; pictures for his look beside the drawings; "merge live" his. Owed
and written on `[NO-ASTRA-LIST]` (D761): the ChatGPT reads FULL wants and the other provider's scenario design.

## 9. Records the same change carries

`docs/data-schema.md` and `docs/data-model.md` (§2); `docs/ui-contracts.md` (the Settings window, the Events list, the
import); `docs/feature-impact.md` (holidays by file; the Events list; Management); `docs/file-map.md` (new files);
`docs/walk-ledger.md` (the walk's row); the evidence sheet `docs/handpass/2026-10-29-lw-m5b.md`; this spec linked from
`[LW-OVERHAUL]`. Typecheck with `npm run build` (`tsc --noEmit` reports nothing here); check the browser-test port is free
before a run.
