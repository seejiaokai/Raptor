# The Leave War overhaul's M5a — a person's leave figures: the build spec (28 Oct 26)

**What M5a is.** The first of M5's two merges (D1475; the M5 plan `2026-10-28-lw-m5-plan.md` §3): jobs 1–5 — the person
window with a member's new rows, the Balances tab and page with its lock, a member's own writes, and the leave year
([LEAVE-YEAR]: grades, the 1 Jan roll-over, carried-forward days used first). Its own branch, cut from `main` once this spec
is approved; tier FULL (every answer of the eight questions but the warning list is yes: what a man is owed in leave, saved
data — a new stored balance and grade, roles — a member writing his own row; a new tab and page, a window rebuilt, a shared
figure drawn in five places). One fresh, blind Opus read of the finished code (D790), the security read of D1411 (it
changes who may write a balance), the ChatGPT reads owed on `[NO-ASTRA-LIST]` (D761).

**Every M5a screen has an approved drawing (D1479–D1489) and is built to it, checked beside it as it is built and after
every fix (D1424, D1426, D1478; the order's §7.11 lesson 8).** The drawings of record, all under
`raptor-port/docs/mock/lw-overhaul/full/m5a/`: the person window `m5a-p2-desk-drawn` (admin, desktop, docked at the grid's
right edge), `m5a-p4-phone-own` (a member's own, phone, his new lines dotted), `m5a-p5-phone-locked`, `m5a-p6-phone-other`
(another man's, read only), `m5a-c-approved` / `m5a-c-vs-20d` (the tiles, round 20d's own); the Balances page
`m5b-b1-desk` (admin), `m5b-b2-rest` / `-slid` / `-pinch` (phone), `m5b-b3-desk` / `-phone` (Days taken), `m5b-b5-tabs-402`
and `-375-noicons` (the tab row), `m5c-c1-grades` / `-picker` / `-nograde-cut` (the Grades window, a row's grade box, "No
grade"), `m5c-c2-desk-open-cut` / `-desk-locked-cut` / `-phones` (a member's page, unlocked and locked), `m5c-c3-lock` /
`-lock-phone` (the lock off and on), `m5c-c4-three` (1 Jan, the other kinds kept). Their scripts —
`full-m5a-person.mjs`, `full-m5a-balances.mjs`, staged by `full-m5a-stage.mjs` — carry the exact sizes, spacings and
colours: the build reads them from there, never re-types them (D1478).

**Rulings it carries** (open each full row before acting on its detail — `grep -h '^| D1479 |' .claude/decisions-full/*.md`):
the figures — D1479 (App bal typed once, then coming down by itself as each leave is approved, carried-forward days first;
War bal = App bal less the days pending), D1472 as D1479 restates it, D1217 ("pending", App bal / War bal), D1153 (a bid
comes off at once — War bal), D1224 (carried-forward first), D1246 (halves .5), D1251–D1253 (every pending figure amber,
the word grey; a small tile's Pending / War bal list); the person window — D1480 (as drawn), D1148 (the year picker), D1201
(every balance at once), D1203 / D1209 (a member edits his own, never OIL), D1238–D1241 (the tile grid), D1231 and D1481
(new lines dotted inside the window only, no count on My leave), D1327 / D1328 (each line led by its kind's box, no long
description), D1292 (a document chip opens it), D1008 (a member reads every man's OIL); the Balances page — D1230, D1242
(for everyone, a member his own row while unlocked), D1254 / D1483 (the tab row; four tabs on a phone, icons dropped on a
narrow iPhone), D1482 (desktop as drawn), D1483 (phone: names fixed, figures slide, pinch), D1484 (Days taken counts the
View period), D1485 (no Settings line), D1255 (OIL read only, ›), D1233 ("+36"), D1236 (a phone shows every column), D1245
(the grid's Balances / FIGURES drawer goes, each name keeping its LVE figure), D1249 (no "No grade" chip); the lock —
D1220, D1247, D1487, D1488; grades and the year — D1229, D1234, D1486 (the Grades window), D1218, D1235, D1473, D1474,
D1489 (only LVE rolls over). Must keep: D672 (Undo leaves the screen where it is), D641 (windows do not block), D997 (a
phone window in the middle), D991 (speed), D487 (button sizes), D1281 (the phone press checks), D200 (perms.ts and §11
together), D56 (stored demo data is no finding), D1424 / D1478 (built to the drawing).
The red team's fixes it carries (design note §10.2): **A1** (My leave opens his own person window; one-line rows; the
dot and a muted "who, when"; a deleted leave struck through for that visit), **A3 / B7** (what he types is his official
figure — settled by D1479), **A5** (the person window docked at the grid's right edge on a desktop, draggable), **A10**
(the padlock on the window's Balances heading), **B6** (a member writes only his own balances, only while unlocked — read
when saved, his Undo after a lock refused alike; a history line "LVE balance 18 → 20 · Ranger"; halves only), **B12**'s
off-roster half (a man with no row still opens his person window).

**Every file, function and line in §4 was read on `main` at 230aa3b on 28 Oct 26 and may have moved; the builder
verifies each before acting.**

## 0. Before starting — what is settled and what is not

- **The M5 plan's open points are all answered** (§4 there: D1472–D1475, then rounds 1 and 2, D1479–D1489). The rulings
  D1478–D1489 had their fresh reader against his words on 28 Oct 26 (D138): eight as recorded; four corrected the same day
  — D1472's and D1248's short lines restated as D1479 and D1484 left them, D1480's home cell (§4 of the plan, not §2), and
  D1483's "under 400 wide", which was the agent's cut-off presented as his (the page showed him only 375 wide).
- **Two questions for him before the build** (§6: Q1 a grade changed after 1 Jan; Q2 the grid's drag-to-give-days bar).
  Everything else in this spec is either ruled, drawn, or a reading named in §6 for his look, his to strike, none blocking.
- **Where the build may depart from a drawing:** nowhere on purpose. A departure found needed while building (a fit at an
  iPhone's wider letters, say) is drawn beside the approved picture and put to him first (D1426).

## 1. The figures — one engine, read everywhere

*(Rewritten 28 Oct 26 on the spec's fresh read, findings 1–6: the arithmetic is now one formula with a worked table.)*

**1.1 What is stored for a person's leave (D1479, B6).** For each of LVE, CCL, FCL, PL, EL and CL, the figure last TYPED,
as the official leave app showed it: the figure, for LVE the carried-forward part ("incl. 2 carried fwd"), the DAY it was
typed (the app's today, `memberToday` — never the machine's clock, so a moved clock and a real one never disagree:
finding 6), who typed it, and **the snapshot** — the days of his approved leave of that kind as they stood at that moment,
one entry a day and a half (`date`, `half`), never a total (finding 2). OIL is not typed (D1209, D1255). A figure is a whole
number or a .5; below zero may be typed; carried forward is a whole number or a .5 from 0 to the figure (or 0 when the
figure is below zero). **A box saves on Enter or on leaving it, never on each key** (finding 13); Escape puts the old figure
back; one tap then typing replaces it (D1080). **A save of either LVE box writes the whole row afresh** (narrow read 2):
`amount` = the App bal box as it then shows (the running figure, or what was typed into it), `cf` = the carried-forward box
as it then shows (the running carried forward, or what was typed into it), clamped to 0 … max(`amount`, 0); the day is
today and the snapshot is taken now. So correcting only "incl. 2" to 3 after 26–27 Jan were approved gives 15 incl. 3,
never 17 incl. 3. The history line's "from" is the running figure shown before the save.

**1.2 How a leave's days are counted.** The war's one charging rule (`engine/charge.ts chargedDays`: a weekend or holiday
charges nothing, except a pilot's run of 15 or more days of LL / OL, his answer of 19 Sep 26), with two additions:
- **It is run on a stated set of leave**, and the engine runs it on three sets: the approved leave now, the approved leave
  of the snapshot, and the approved leave with the pending added. So a pending bid that lengthens a pilot's run past 15
  days changes only War bal and Pending, never App bal (finding 1).
- **A date no period covers is charged by the plain rule** — a weekday 1 (a half .5), Saturday and Sunday 0, no holidays
  known — so Inputs-page leave in a year with no period yet still comes off, and creating that period later moves nothing
  that was already counted the same way in the snapshot (finding 2). Today such a date charges nothing; this is new and is
  named to him (reading 17).
Both the snapshot and today's leave are charged NOW, with today's periods, holidays and runs: a period created, a holiday
added or a run grown after typing treats the snapshot and today alike — so leave already approved when he typed never moves
App bal; leave approved since is charged as the war now counts it, so a holiday later found on one of its days gives that day
back (narrow read 7).

**1.3 The formula — App bal for one kind.** Let *typed* be the figure, *cf* its carried-forward part and *Y0* the year of
the day typed. For each date, *delta* = what the approved leave now charges on that date less what the snapshot charges
there (negative where a leave was shortened, moved off or deleted). Let *net(y)* be the sum of *delta* over the dates of
year *y*; a date before Y0 counts in Y0 (finding 3c — a change to an earlier year's leave moves the figure now, as the
official app would show it).
- **CCL, FCL, PL, EL, CL:** App bal = typed − the sum of every *net(y)*. No years, no roll-over (D1489).
- **LVE, the typing year Y0:** two pools — carried forward *CF = cf*, this year's *AN = typed − cf*. If *net(Y0)* ≥ 0 it
  comes off as **the year's rule** below, with *C = cf*.
- **The year's rule, for any year y** (narrow read 8), *C* being the carried forward at the start of y (*cf* in Y0, the
  roll-over's *new CF* after): if *net(y)* ≥ 0, *CF = max(0, C − net(y))* and *AN = AN − max(0, net(y) − C)* —
  carried-forward first (D1224); if *net(y)* < 0 (days given back), *CF = C* and *AN = AN − net(y)*. Days given back in a
  year first cancel days taken that year (the netting), and only the rest go back to this year's leave — so "incl. N
  carried fwd" never shows more than it started the year with (finding 3a; reading 18).
- **LVE, each 1 Jan of a year y after Y0, up to this year** (D1235, D1474): the carried-forward left goes; *new CF =
  max(0, AN)*; *new AN = the grade's days held on 1 Jan y + min(0, AN)* (below zero carries nothing forward and the
  overdrawn days still come off: −2 + 33 = 31). Then *net(y)* is taken off by the year's rule, with *C = new CF*.
  No grade on that day adds 0 (D1474). Grade and its days as they held on that 1 Jan (Q1).
- **LVE, days in a year after this one** (a leave approved now for next January): they come off now (D1479), from the
  total only — App bal = *CF + AN − the sum of net(y) for y after this year*; "incl. N carried fwd" is this year's *CF*,
  untouched, since those days will use next year's carried forward (D1218, D1473). A later-year day already approved
  when he typed is in the snapshot, so it is inside the typed figure and never comes off again (finding 3b).
- **Never typed** (finding 5): read as typed 0, cf 0, on 1 Jan of the year of the war's earliest period (or of this year
  when no period exists — a shared store may hold none), with an empty snapshot; it moves if an earlier period is
  created later (reading 4) — so each 1 Jan after it adds his grade's days and his approved leave since comes off (reading 4). **An old
  row in today's bare-number shape** (demo data, D56) is read the same way, its number as the figure — never skipped, never
  a loop from the year 1970: the years run from that start year to this year plus the last year holding any of his leave,
  and a test pins a load that would otherwise loop (finding 5).

**1.4 Pending, War bal, taken.** War bal = the same formula run with his pending leave counted as approved; Pending =
App bal − War bal (D1479: War bal is App bal less the pending, so the tile always adds up); both every year (D1217 —
days, never requests; the figure amber, the word grey — D1251, D1252). In one corner the two readings part: a pending day
in a year whose carried-forward has since ended costs nothing more, so it shows no pending figure though the request still
waits (D1474's "counts in the year its days fall in"; reading 19 — the worked table, row 8). War bal is the one figure the
grid shows beside his name, My leave's LVE, Approvals' LVE BAL and the bid windows' leave buttons (D1153). "3 taken" (the
LVE tile) = his approved LVE days charged on dates from 1 Jan of this year up to today (the drawings: 19–21 Jan approved
and past → 3; 26–27 Jan ahead → not taken). MED's tile = medical days this year up to today, calendar days (a half .5).
**Days taken** (the Balances page, D1484) = for each kind, its days on dates inside the View period up to today, approved
only — the leave kinds as charged (weekends free, as the figures count them), MED, CSE and OD as calendar days, since none
of them is charged against a balance (a two-week course reads 14; reading 20). **The grid's two small lines beside a name**
(`MatrixRows.tsx figureLines`; finding 12): the first War bal, the second his LL and OL days in the View period, approved
and pending (Ranger's drawn "12.5 / 7.5": 5 approved + 2.5 pending).

**1.5 The worked table — every ruled example through the formula (the walk's and the tests' expected figures).** A junior
pilot (+33); 2027 holds a period, 1 Jan a public holiday.

| # | Case | Expected | Note |
|---|---|---|---|
| 1 | D1479: typed 17 incl. 4 on 5 Jan; LL 26–27 Jan approved after | App bal 15 incl. 2; with 2.5 pending, War bal 12.5 | as ruled |
| 2 | the same, the 2.5 approved | App bal 12.5, Pending gone, War bal 12.5 | as ruled |
| 3 | D1235: 37 left incl. 4, nothing since; 1 Jan | 66 incl. 33 | as ruled |
| 4 | D1474: the same, no grade | 33 incl. 33 | as ruled |
| 5 | D1474: −2 left (incl. 0); 1 Jan | 31 incl. 0 | as ruled |
| 6 | D1473: 23 left incl. 3; LL Thu 31 Dec – Mon 4 Jan approved on 20 Dec | 20 Dec: 21 incl. 2 · 31 Dec: 21 incl. 2 · 1 Jan: 52 incl. 19 · after 4 Jan: 52 incl. 19 | **the ruling's narrative reads 22, 53, 52**: it counts the days as they are taken; D1479 (the later ruling, D90) takes a leave off when approved, so only the last figure is the same — reading 21 |
| 7 | the same leave, approved only on 2 Jan | 31 Dec: 23 incl. 3 · 1 Jan: 53 incl. 20 · 2 Jan: 52 incl. 19 | 31 Dec counts in 2026 (D1473) and takes 2026's carried-forward, which has ended, so only 4 Jan comes off — reading 22 |
| 8 | D1474: 10 left incl. 4; LL Tue 29 – Wed 30 Dec pending over 1 Jan | 28 Dec: App 10, Pending −2, War 8 · 1 Jan: App 39, Pending —, War 39 | reading 19 |
| 9 | typed 20 incl. 0 in Nov 2026; LL 2–3 Feb 2027 approved on the Inputs page before typing; the 2027 period created after | 20, unchanged by the period | finding 2 |
| 10 | a pilot, Feb 2027: LL Mon 1 – Fri 12 approved (10 charged); LL Sat 13 – Sun 21 bid, pending | App bal unchanged; Pending −11 (the run of 21 days now charges every day: 21 − 10); War bal 11 lower. Approvals' DAYS and My leave count the bid alone: 5 | finding 1; reading 24 |
| 11 | typed 23 incl. 3; a 2-day leave approved before typing then deleted | 25 incl. 3 | days back to this year's leave — reading 18 |

Every row is a unit test of the engine before any screen is built, and rows 1, 2, 6, 8 and 10 are walked on screen (§7).

**1.6 One engine.** One pure module answers §1.3–1.4 for a person, a kind and a day, and every surface reads it. **It takes
the leave as an input** (approved, pending, and a what-if set), so the bid windows' "what is left if I place this" and the
below-zero ask read the same engine rather than a second one (finding 12). Its readers, each moved onto it (§4 lists their
code): the person window's tiles; the Balances page (both views); the grid's two lines beside each name; My leave; Approvals'
LVE BAL; the bid windows' "left" on each leave button and the below-zero ask (D418) in the one-day and drag windows; the
below-zero helpers and the top row's figures. A test feeds one world to every reader and checks they agree.

## 2. The screens

**2.1 The person window (D1480; jobs 1–2).** Built to `m5a-p2-desk-drawn` and `m5a-p4-phone-own`. The heading: his name,
✕; then BALANCES with the padlock and "Locked for members" (admin) or "Locked by admin" (member) while locked (A10,
D1220); round 20d's tiles exactly (`m5a-c-approved`): LVE (its box, "3 taken"; App bal · Pending · War bal on one line, the
pending figure amber; "incl. [2] carried fwd · till 31 Dec" under App bal), OIL ("0 ›", opening the OIL tracker — D1209),
MED (days); then CCL, FCL, PL, EL, CL, each its box and, only while its Pending figure is not 0, "Pending −1 / War bal 2" as a
little list (D1253). A box only where the viewer may type (an admin any row; a member his own row while unlocked); locked,
no boxes for a member, boxes kept for an admin. Then LEAVE and the year picker ("2026 and ahead"; past years in its list —
D1148): his leave one line each, without a puck — the kind's box (look F: filled approved, hollow dashed pending, grey
struck refused), the dates (a half day "Thu 29 Jan, AM"), a paperclip where it has a document (a tap opens it — D1292),
the days, the state (Pending in amber); a tap on a line takes the grid there (the ring, as Approvals' dates do — D1449,
D860). **New since his last visit** (his own window only — D1231, D1481): a line someone else changed since he last opened
it wears the cyan dot and a muted line under it, "approved by Saber · yesterday 08:40" (refused, moved, deleted, added by an
admin the same way); a leave someone else deleted stays struck through for that visit. Another man's window reads only,
no dots (`m5a-p6-phone-other`). **Where it stands:** a desktop docked at the grid's right edge, draggable, the grid working
behind it (A5, D641); a phone in the middle of the screen (D997). **Ways in:** a tap on a name on the grid; My leave (his
own — A1); Approvals' line or the bell's line for a man with no row (B12 — M4 built that half). A name on the Balances page opens his
person window too, as D1148 has every tap on a person on the Leave War do (not drawn; reading 23 — finding 13).

**2.2 The Balances tab and page (D1482–D1488; job 3).** Built to `m5b-b1-desk`, `m5b-b2-*`, `m5b-b3-*`, `m5c-*`. The tab
row: Grid · Approvals N · Balances · OIL (admin), Grid · Balances · OIL (member), ⚙ at the right end (D1254); on a phone
round 19's tighter spacing, the icons dropped on a narrow iPhone (`m5b-b5-*`; the cut-off under 400 wide is the agent's
reading — D1483 as corrected). The page takes the grid card's place, as Approvals' does (M4's pattern — the grid stays
mounted behind it). Its bar: Balances | Days taken, Find a person, then Grades… and Lock for members at the right (admin
only); the same bar in both views, so nothing moves when the view switches (D1484). **Balances view:** one row a person in
the grid's own order and groups (SXO 12, IP 8 …), each name the schedule's own puck (D1476, D1482); GRADE · AUTO + LVE ON 1
JAN (a box with the grade and "+36" and its list — D1486; "No grade" in amber; a member sees his grade as words with its
"+36" — D1487); LVE: APP BAL (box), INCL. CARRIED FWD (box), PENDING (amber), WAR BAL (bold); OIL read only, "0 ›" opening
his OIL tracker (D1255); OTHER LEAVE: CCL, FCL, PL, EL, CL — a box each, the pending figure in amber after it, every box
keeping its column (D1482). **Days taken view:** "DAYS TAKEN IN JAN – DEC 26" over LL, OL, OIL, CCL, FCL, PL, EL, CL, MED,
CSE, OD; a dash for none (D1484). **On a phone (D1483):** the names column (puck over "Senior pilot · +36 ⌄") stays while
the figures slide sideways; a pinch zooms the list out until every column fits; Grades and the padlock in the bar (the
padlock open and unlit when off, closed and lit cyan when on — D1488). **A member (D1487):** his own row in boxes while
unlocked, everyone else's read only; locked, everything read only with the padlock and "Locked by admin" — on a phone on a
slim line under the bar; no Grades, no lock switch. **Grades… (D1486, D1234):** a window — each grade a grip, its name in a
box, "19 people", its "+36" box, a ✕; "+ Grade" at the foot; a drag shows one landing line (D890); deleting a grade people
hold asks first, naming how many, and they become "No grade" (Undo brings it back); two grades not deleted cannot share a name. Its
starting list: Senior pilot +36, Junior pilot +33, Senior WSO +21, Junior WSO +18, Ops A +14 (D1229).

**2.3 The lock (D1220, D1247, D1488; job 4).** One switch for everyone, an admin's only, on the Balances page. Locked: a
member's boxes go on the page and in his window, "Locked by admin" with the padlock; an admin keeps his boxes and reads
"Locked for members". The lock is read when a member's change is SAVED, not only when the box is drawn — a box open while
the admin locks refuses his save with its reason, and his Undo of an earlier change after the lock is refused alike (B6).

**2.4 What leaves the screen.** The grid's FIGURES / Balances drawer and its fold (D1245, D1257), its "Set", and the grants
dragged down a column — a balance changes only by its box, by approved leave, and by 1 Jan (reading R3, §6). Today's
figures sheet (`PersonFiguresSheet`) is replaced by the person window; its "LVE TOT" goes to Days taken (D1480's reading).
Settings gains no Balances line (D1485).

## 3. What is stored, and who may write it (D473, D200 — the documents in the same change)

*(Rewritten 28 Oct 26 on the spec's fresh read, findings 7–11.)*

- **The typed figures — a collection of their own, `lw.balance`, rows `bal:<pid>:<kind>`** = `{ amount, cf? (LVE), day,
  by, snap: [[date, half], …] }`. Not the old `opening:<pid>:<counter>` rows: those stay bare numbers for OIL, which
  `engine/oiltracker.ts` (~L220), `counters.ts figureParts` (~L384), `readWorldRows` (~L918) and `seedOpenings` read as
  numbers — a changed shape would turn every OIL balance to nothing (finding 8). No door writes an opening any more; OIL's
  stay readable (demo data, D56) until [LW-OIL-OPENING-AWARD] is settled; the other kinds' old openings are read once as
  "never typed" figures (§1.3). The new collection is listed in EVERY place a war collection is (finding 7's list, the
  same for each new collection below): `readWorldRows`, `lwDecompose`, `applyLwRecord`, `LW_COLLS`, `lwRows`,
  `LwNow`, the State field, `rows.ts`; a test writes one, reloads, undoes and redoes it and reads it back whole.
- **A person's grade — a collection of its own, `lw.grade`, rows `grade:<pid>`** = `{ hist: [{ id | null, from }] }`
  (`null` is "No grade"; `from` a day; a change on the day the last entry was made replaces it). Not on `profile:<pid>`:
  `rows.ts profileJSON` keeps only `post` and `label`, so the next posting or label write would drop it, and a grade-only
  profile throws "would be emptied" (finding 7).
- **The grades list and the lock — `lw.config`**: `grades: [{ id, name, order, days: [{ n, from }], goneFrom? }]` (a deleted
  grade keeps its days with the day it went, so a 1 Jan before that still reads them and one after adds nothing —
  finding 11) and `balLock: boolean`. The starting five (D1229) have FIXED ids (`sp`, `jp`, `sw`, `jw`, `opsa`). **No command runs at boot** (narrow
  read 6): while `lw.config` has no `grades` field (absent, never an empty list) the engine reads the starting five; the first
  admin edit of the list writes it whole; `balLock` reads false while absent. Fixed ids mean a man's grade never points at
  nothing after a reload (finding 11). `lw.config`'s fields are
  listed in four places (`store.ts lwRecords` ~L1361–1368, `applyLwRecord` ~L1440–1452, `rows.ts CONFIG_KEYS` ~L128–135,
  the boot's `readStored`); both new fields join all four, with the reload-and-Undo test.
- **A member's "last visit" — a settings row of his own, `lwseen:<pid>` = `{ at: ms }`** (the moment matters here, not the
  day), on M4's `apprseen:` pattern whole (`state/apprseen.ts`), written through `commitSettingsIntent('lw.seen', { owner:
  pid }, …)` when anyone opens his OWN person window, an admin included; the previous moment kept for that visit. Every
  piece M4's needed: a `T.` table, a `PERMS` row (each person C R U his own), a `COMMAND_OPS` entry for `lw.seen` (`cmdAuthorize`
  refuses an unmapped type — M4's bug of 27 Oct), its `definePermission` in `state/people-settings-commit.ts` and its prefix
  in `SETTINGS_ROW_PREFIXES`, `undo/timeline.ts NOT_STEPS`, `storage/tables.ts`, §11. And one M4's did not need:
  `ownershipViolation`'s `settings` case (`perms.ts` ~L995–1005) allows `lwseen:<pid>` only for his own pid AND only under
  `env.type === 'lw.seen'`, as `seen:` and `noticeseen:` are paired (finding 10c).
- **The commands, each named, mapped and registered** (`COMMAND_OPS`, `lwRegisterCommands` ~L1498–1520, `undo/describe.ts`
  words of its own — "Undo: LVE balance 18 → 20", not today's "an opening balance": finding 12; finding 10d): `lw.balance`
  (a typed figure — an Undo step); `lw.grade` (a person's grade — admin); `lw.grades` (the grades list — admin);
  `lw.balLock` (the lock — admin); `lw.seen` (not an Undo step).
- **Who may write — `state/perms.ts` and `docs/data-model.md` §11 together (D200).** Today ONE row, `T.ledger`, covers
  `LeaveOpening`, `LeaveLedger` and `LeaveCounter` (~L76, ~L115), and the balance write rides `lw.edit`, whose gate row is a
  BID's. New rows: **`LeaveBalance`** — admin C R U D; member **R for every row** (D1242: every member reads every man's
  figures — finding 10a) and **C U D of his own** (his first typing creates the row, his Undo of it deletes it — narrow
  read 5); **`LeaveGrade`** — admin C R U D, member R; the grades list and the lock stay
  under `lw.config`'s admin row. `T.ledger` is never widened (a member would reach grants and OIL corrections).
  **`ownershipViolation`** (~L916–1015) gains: `lw.balance` — a member only on his own pid, only while `balLock` is off
  as it stands when the command is saved (an open box after the lock, and his Undo or Redo after it, refused alike — B6);
  the kind one of LVE, CCL, FCL, PL, EL, CL and `cf` only on LVE; and `lw.grade` joined to the "an admin's record" case — its `default: break` would otherwise ALLOW a member's
  grade write (finding 7).
- **What the gate recomputes, so a member cannot forge it (finding 9):** for an `lw.balance` row it refuses unless `by` is
  the writer himself, `day` is the app's today, `amount` and `cf` are halves with 0 ≤ `cf` ≤ max(`amount`, 0), and `snap`
  equals the snapshot the store itself builds from his approved leave at that moment (compared sorted by date, then half) — so a member cannot type 20 with a
  snapshot that shows 120, back-date the day before a 1 Jan, or write another man's name as the one who typed it. **These
  three forging checks apply to a forward write; a restore that `undo/timeline.ts verifiedReplay` vouches for, image for
  image, passes them** — `lw.balance` joins its `want` set beside `inputs` and `lw.cell` (~L531–533) — so his own Undo of his
  second typing, or a Redo the next day, puts back the earlier row with its older day and snapshot (narrow read 1). The lock
  check applies to both (B6). With no war wired, the gate refuses a member's write. Each check has a break test (§8), and a
  test pins a member's Undo and next-day Redo of his second typing, unlocked, as accepted.
- **The change history (`state/changelines.ts`).** Today a balance writes no line and its Undo none (~L543–546). New lines:
  "LVE balance 18 → 20 · Ranger" (B6), each kind by its name; "LVE carried fwd 2 → 3"; "Grade Junior pilot → Senior pilot ·
  Saber"; "Balances locked for members · Saber"; the grades list's add, rename, days and delete. `lw.balance`, `lw.grade`,
  `lw.grades` and `lw.balLock` join the `wrote` set so Undo's line is written too. **And the war's own lines gain machine
  marks** for a leave deleted, moved and its kind changed (the field and the input kind, not only the words): today an
  admin deleting a pending bid logs `say(g, 'deleted')` with no field, and the person window's struck-through line cannot be
  read back from words — `alsoSince` refuses to parse them (finding 12).
- **The security read (D1411):** this changes who may write a balance — one extra fresh reader looks only for holes, given
  the list above (a member's write to another man, while locked, of OIL, of a grade, the lock or the list; a forged
  snapshot, day or name; `lwseen:` of another pid; the old `lw.edit` path to an opening, closed).

## 4. Where it is built — the code, as read on main (the survey of 28 Oct 26)

**The engine (§1.6).** Today `engine/counters.ts balanceOf` (~L171–184) is `opening + grants (+ earned OIL) − drawnFrom`,
and `drawnFrom` (~L130–141) sums `engine/charge.ts chargedDays` over every war and every date — one running balance a
kind across all periods, pending requests counted in full (refused nothing). New: one pure module (say
`engine/leaveyear.ts`) on top of `chargedDays`, which already returns a map by date, so a year is a filter on the date and
a 15-day run across 31 Dec still decides its days as one run. It runs `chargedDays` on stated sets of leave (§1.2 — approved now, the snapshot, approved with the pending, a what-if), so
`chargedDays` must take its records as an input rather than read every view's charges (today `v.charges` carries no
state: approved and pending are told apart by each day's records, `v.all`), and charges a date no period covers by the
plain rule. It answers, for a person, a kind and
a day: App bal, carried fwd and its end date, Pending, War bal, taken; and days taken by kind over a range. Grants still
count, from the ledger, only those dated on or after the typed day (whatever Q2 decides, none are lost). `takenOf` /
`lveConOf` / `medConOf` (~L251–303, every source, no range) are replaced by it. **Two things the survey found the engine
must fix while it is there:** `figureCtxOf()` (store ~L4686–4691) uses `localToday()`, not `memberToday()`, so a test
clock moves neither OIL's expiry nor a year's end — the year must turn on the app's today; and a man with no row (a SANS
man while SANS is off) is not in `figureCtxOf().people`, so the pilots' 15-day rule never applies to him — the engine is
given the off-roster identities too (`sync.ts warIdentityIfHidden`'s source). Leave on dates no period covers is charged by the plain rule (§1.2), a change from today. **The figures' memo** (`Matrix.tsx
figureCtx = useMemo(…, [version])` and the row memo) is keyed on the app's today as well, so a page left open across
midnight on 31 Dec rolls over at midnight as the today ring does (D1266) — finding 6.

**Its readers, each moved onto it (§5's first list):** the grid's two lines beside each name — drawn per row by
`MatrixRows.tsx figureLines` (~L307), behind the memo firewall, not by `Matrix.tsx` (~L655 only picks the fixed LVE figure;
`FIGURES` / `plainBal('annual')`), which today shows LL and OL used of all time, pending included, and becomes §1.4's two
lines; `store.ts balanceAfterFill` / `withFill` — the below-zero ask (D418) in the one-day window and the drag window
(`SelectSheet.tsx` ~L248) and the leave buttons' "left", read through the engine's what-if set; `ui/belowzero.ts` and
`Chrome.tsx` (both read `FIGURES`); `ui/myleave.ts myLeaveOf` (~L26–49) — whose "pending" today counts
CALENDAR days of every leave-kind request, weekends included, and so disagrees with Approvals: it becomes the sum of every
kind's Pending; `leavewar/approvals.ts figuresOf` (~L114–163, LVE BAL and DAYS); the bid windows' "left"; the OIL figure
stays `oilLedgerOf`. A test feeds one world to every reader.

**The person window.** Today `leavewar/ui/CounterSheet.tsx PersonFiguresSheet` (~L314–421): `visibleFigures()` rows, an
admin's "Set" (`<input type=number step=0.5>`, any finite number accepted), no EL row; `FigureBreakdownSheet` (~L215–292)
on a tap. The rest of the file's `CounterSheet` picker (~L30–199) is dead — Matrix imports only those two. Replaced by a
new `leavewar/ui/PersonWindow.tsx` drawn from `full-m5a-person.mjs`'s own markup and sizes (D1478); every kind shown
whatever `figureHidden` says. Mounted where the sheet is (`Matrix.tsx` ~L4660–4668, `whoOpen` ~L388, the asks ~L407–414),
keeping the `warIdentityIfHidden` fallback. `setBalance` (~L4942) goes; the new `lw.balance` writer accepts a man with no
row (a SANS man while SANS is off), whose figure today fails in silence on its "not on the roster" refusal. **Docked** at the grid's right edge on a desktop (A5): a
draggable window, not a sheet over the grid, the grid working behind it (D641). **The list:** `leavewar/ui/LeaveLine.tsx`
(39 lines, used by `DayPanel.tsx` ~L84) gains "no puck" and a muted "who, when" line under it; its rows come from a new
per-person builder (the day panel's `state/daypanel.ts dayPanelData` works a day at a time): approved leave — one Input,
one line; pending and refused requests — one line a run by `reqRunKey` (Approvals' `linesOfWar`, `approvals.ts` ~L56–92,
the pattern); across every war, filtered by the year picker. "Who, when" reads M4's `decidedBy` / `decidedAt` on a request,
the Input's `by` and stamp, and — for a leave deleted, moved or re-typed by someone else — the change history's Leave War
lines by their new machine marks (§3), never by parsing their words. **My leave** (`Chrome.tsx` ~L221–231) keeps
`askLw({ kind: 'person', id: me })`; it shows only while the viewer has a row, so a hidden SANS man has none — as today
(not in M5a). The grid's tap on the LVE figure (`setBalOpen`, ~L384, ~L4647 → `FigureBreakdownSheet`) opens the person
window instead (reading 15).

**The Balances tab and page.** The tab row is `Chrome.tsx Topbar` (~L102–253): `type Tab = 'grid' | 'approvals' | 'oil'`
(~L149–154), `tabOn` (~L155), and three-way ternaries for the test id, title and glyph (~L173–180) — each gains Balances.
The page takes the grid card's place as Approvals' does (`LeaveWarPage.tsx Body`, ~L72–106: the grid `hidden`, still
mounted, `setLwOnScreen(false)` so it does not fill in the background, its scroll kept per page). **`ApprMode`
(`ui/lwnav.ts`) is Approvals' own** ('off' | 'page' | 'bar') and the Topbar's member guard (~L148) switches it off for a
member: M5a makes the page choice general — the grid, Approvals or Balances — so Balances stays for a member and Approvals'
slim bar still works. New `leavewar/ui/BalancesPage.tsx` from `full-m5a-balances.mjs`'s own markup; its phone pinch is
`ui/pinchzoom.ts wirePinch` with the OIL tracker's set-up (`OilTracker.tsx` ~L289–315: CSS zoom, the sticky headings and
names held on their axis, `ui/lwzoom.ts` limits) — reusable as it is. The Grades window: a new `GradesSheet.tsx` (drag by
`ui/rowdrag`'s pattern, one landing line — D890).

**What goes (§2.4).** The FIGURES drawer is already unreachable (`bracketRow`, the only home of its toggle, is never
called — `Matrix.tsx` ~L2369–2398) but its code is threaded through the grid: `figuresOpen` (~L371) and the four effect
lists that name it (~L771, ~L2129, ~L3138, ~L3317), `drawerAt` / `drawerRef` / `onDrawerBox` (~L377–380), `drawerRows`
(~L3600–3617), the measuring and `--drawer-w` effects (~L3466–3517), `syncDrawerHeights` (~L3528), `headerRow`'s drawer
branch (~L2432–2440), the stuck mirror's (~L4189–4264), its render (~L4355–4369), `mx-figures` (~L3910), the pinch's
`alsoY` (~L1474), `ui/FiguresDrawer.tsx` (300 lines; Matrix imports four names from it, ~L11) and `matrix.css`
~L2667–2912. Removed whole, measured before and after (`docs/performance.md` §E: day cells one memoised `PersonMonth` a
month comparing only its own slices; every row, the header included, the same cell structure — his iPhone the gate; the
`LwBody` firewall untouched). **Separate and still live — Q2 decides it:** the drag down the grid's LVE column
(`wireFigureSelect` ~L744–800, `figSelCtxRef` ~L3815–3828, `BalanceBar` + `CreditForm` ~L4528, → `grantTo(ids, 'annual',
…)`). If it goes, `grantTo` stays for the OIL tracker.

**Tests that pin what changes** (rewritten to the new behaviour, never weakened): the drawer — `ui/figdrawer.test.tsx`,
e2e `leavewar.spec.ts` (~L34, ~L143, ~L1182, ~L2348); the person sheet — `ui/person.test.tsx`, `ui/counters.test.tsx`,
e2e `leavewar.spec.ts` (~L322–343, ~L3247–3280), `ui/scrim.test.tsx`; the balance write — `state/store.test.ts`
(~L2096, ~L2240–2270, including the pin that `setBalance(…, 'oil', …)` succeeds, which becomes a refusal),
`rows.test.ts` (~L289, ~L341), `undoaudit.test.ts` (~L289), `ui/bidding.test.tsx`, `ui/figselect.test.tsx`,
`ui/oiltracker.test.tsx` (~L164); the drag grant (if Q2 removes it) — `ui/balancebar.test.tsx`,
`ui/draggrantoil.test.tsx`; permissions — `leavewar/permsparity.test.ts`, `state/perms.test.ts` (§11 parsed and matched
to `PERMS`).

**No other branch touches these files** (to check at the build: `git diff --name-only $(git merge-base origin/main <b>) <b>`
for each open branch — D302).

## 5. The roll-call seed (bug-check order §6) — the builder fills every cell: has it / must not, because… / MISSING

**A leave balance figure** (every place one is drawn — each must read §1.5's one engine and agree): the person window's
tiles (App bal, Pending, War bal, carried fwd, taken; the five small tiles); the Balances page's Balances view (desktop and
phone, an admin's and a member's, locked and not); its Days taken view; the grid's figure beside each name (its two small
lines); My leave's "LVE 12.5 · OIL 0 · 5 pending" (desktop row and phone View line); Approvals' LVE BAL (M4 — desktop and
phone); the bid windows' "left" on each leave button (the one-day window, the drag window, the whole-leave window); the
day panel (if it shows a balance); the OIL tracker (must not change — OIL is not typed); Insights or any export that reads
a balance (find out; must not drift).
**A balance write** (every door that changes one): the window's boxes; the page's boxes; Undo and Redo of each; an
approval, a refusal, a put-back, a move, a delete, a whole-leave decision, Approve all (each moves App bal or Pending by its
days, nothing else); an Inputs-page leave filed, lengthened, shortened, re-dated or deleted (it lands approved — D1166);
1 Jan crossing (worked out, so every reader at once); the lock flipping under an open box; a reload.
**A grade** (where it shows and is set): the page's grade box and list; the phone's grade line; a member's grade words;
the Grades window (rename, reorder, delete, add, its "+ days"); the roll-over's figure; "No grade" in amber.
**The person window** (every way in and every kind of man): a name on the grid (pilot, WSO, ground personnel, OCU "O",
SANS while on the war); My leave; a man with no row (SANS off the war — from Approvals and the bell); a posted-out man;
an archived man reached from an old request; one's own, another's, an admin's own.
**A new-since-last-visit line** (an admin's own window too) (each change someone else can make to his leave): approved, refused, put back to a bid,
moved, deleted (struck through), kind changed (D1460), placed approved by an admin (D1422), a whole leave decided, Approve
all, an Inputs-page change by a scheduler; and his own change of each (never dotted).

## 6. Put to him before the build — two questions; the readings his to strike

**Q1 — a person's grade changed after 1 Jan.** Recon is a Junior pilot (+33) on 1 Jan 2027, so 33 days are added; on
1 Mar 2027 an admin makes him a Senior pilot (+36). *Recommended:* the new grade counts from the next 1 Jan — his 2027
figures stay as they are, and on 1 Jan 2028 36 are added; the same for a grade's "+ days" changed in the Grades window
mid-year. One cost of A: a wrong grade put right after 1 Jan (on 3 Jan, say) also waits for the next 1 Jan — that year's figure is
put right by typing App bal. *The other way:* the change reaches back to 1 Jan, and his App bal jumps by 3 on 1 Mar. (Picture: the grade box
and its list, `full/m5a/m5c-c1-picker`, Recon's row at the top.) Until he answers, nothing else waits: it is decided by one date
check in the engine.

**Q2 — the grid's "drag down the LVE column to give days" bar.** Today an admin can drag down the LVE figures beside the
names and give several people extra LVE at once ("3 people · +LVE · days · Save" — the bar he asked to have ringed on
6 Sep 26; picture on today's main `full/m5a/m5a-q2-grant-desk`, drawn by `full-m5a-q-grant.mjs`). No ruling keeps or removes it;
the FIGURES drawer it sat beside goes (D1245). *Recommended: it goes too* — App bal is now typed from the official leave
app and comes down by itself (D1479), so an extra day granted officially shows up in the official figure he types; one
way to change a balance (its box on the Balances page, every row a box) leaves fewer places for the figures to disagree.
*The other way:* it stays, its days added to App bal from the day given. Nothing else waits on this answer.

**Readings built as recommended and named at his look, his to strike — none blocks the build:**
1. CCL, FCL, PL, EL and CL come down by themselves as their leave is approved, as App bal does (D1479's rule, for every
   typed kind): the box shows the running figure, and its Pending / War bal lines show only while its Pending figure is not 0.
2. "Since he typed" is counted by what was approved when he typed, day by day, not by a leave's dates or by when it was
   approved: a leave already approved then takes nothing off; one lengthened afterwards takes only its new days; one
   deleted gives its days back.
3. The grid's FIGURES drawer and its grants go: a balance changes only by its box, by approved leave and by 1 Jan.
4. A person whose figures were never typed counts from 0 on 1 Jan of the war's first year: each 1 Jan since adds his
   grade's days and his approved leave since comes off.
5. "3 taken" is his approved LVE days from 1 Jan up to today; Days taken counts approved days in the View period up to
   today (as the drawings were made).
6. The person window lists his leave — LL, OL, OIL taken, CCL, FCL, PL, EL, CL; a medical, a course, an overseas duty and
   an Other are not leave and stay on the grid (MED's tile counts medical days).
7. "New since his last visit" is a change someone else made to his leave; his own are never dotted; the dots go when he
   closes his own window; the moment he last opened it is kept across a reload.
8. A balance change — his or an admin's — is a line in the change history ("LVE balance 18 → 20 · Ranger"); his bell is
   not told of an admin's change (proposed in the notifications register, not built).
9. The Balances page lists the people on the grid in its order; a SANS man while SANS is off the war, and an archived man,
   are not listed.
10. A typed figure takes halves only (17, 17.5); a figure below zero may be typed.
11. Deleting a grade makes its holders "No grade" from that day; past 1 Jans keep what they added.
12. The roll-over applies only to a 1 Jan after the figure was last typed — a figure typed on 3 Jan already includes that
    year's days.
13. On a phone the tabs keep their icons from 400 wide (his 402 keeps them); under that they drop them (D1483 as
    corrected).
14. My leave's "5 pending" counts the days pending of every kind as each kind charges them (weekends not counted, as
    Approvals' DAYS) — today it counts calendar days, so the two can differ.
15. A tap on the LVE figure beside a name on the grid opens his person window (today it opens a breakdown of that one
    figure) — one window for a man's figures.
16. OIL is refused as a typed figure by every door (B6). How an opening OIL balance from the old system is given at
    go-live (D1255 — an award in the OIL tracker) has two side effects today: an award shows on the grid as an FO / HO on
    its date (D402) and follows the OIL expiry rule. Only real data meets it, at the database step, so it is filed as a
    question for then (`[LW-OIL-OPENING-AWARD]`), not built here.
17. Leave on a date no period covers yet comes off by the plain rule — weekdays count, Saturday and Sunday do not, no
    holidays known (today such a date counts nothing). Creating the period later moves nothing that was already approved
    when he typed; leave approved since gives a day back if the new period makes one of its days a holiday.
18. Days given back in a year (a leave deleted or shortened) first cancel days taken that year; only the rest go back to
    this year's leave, never to carried forward. If those days had used carried forward, after 1 Jan the war can show up to
    that many days more than the official app, until App bal is typed again.
19. A pending day in a year whose carried-forward has ended costs nothing more, so it shows no pending figure on the tile,
    though the request still waits in his list (D1474 — §1.5 row 8).
20. Days taken counts leave as the balances charge it (weekends free) and MED, a course and an overseas duty as calendar
    days (a two-week course reads 14).
21. D1473's worked example reads 21, 52, 52 (on 31 Dec, 1 Jan, after 4 Jan), not the ruling's 22, 53, 52: D1479, the later
    ruling, takes a leave off when it is approved, not as its days pass; only the end figure is the same (§1.5 row 6).
22. A leave approved only after 1 Jan for a day of the year just ended counts in that year (D1473), so a day the ended
    carried-forward covers costs nothing now (§1.5 row 7).
23. A tap on a name on the Balances page opens his person window, as every tap on a person on the Leave War does (D1148);
    it was not drawn.
24. A bid that lengthens a pilot's approved run past 15 days shows the run's weekends in his tile's Pending; My leave's
    count and Approvals' DAYS count the request's own days (§1.5 row 10) — the one place the figures may differ, and the
    agreement test says so.

**Records of each answer:** a ruling row in `leave-war.md` the moment he answers; reading 8's bell line in
`docs/notifications-register.md` as proposed.

## 7. The walk (sized at the build in `docs/walk-ledger.md`; expect WIDE — two roles, phone 402 × 874 and desktop 1536 × 860 at his 125%)

Types B, C, D, G, H (a new page and a rebuilt window; new boxes and the lock; one figure drawn in many places; saved data
and its Undo and reload; who may write). Sonnet walkers take the pictures, the host opens every deciding one (D787, D1271,
D1273); a picture within about 100 ms of each phone lift (D1281); a test that changes the data directly never stands in
for a press (D608); every surface beside its approved drawing (lesson 8). **§7.11's lessons, each given its scenario:**
1 (states) — the tables below; 2 (speed) — the phone's sideways slide and pinch at a person's speed, a quick flick and a
slow drag; 3 (feedback) — after each typed figure, what shows it took (the figure, War bal, the grid's figure) and what is
out of sight (a figure off screen to the right on a phone); 4 (the page behind) — with the person window docked, press the
grid and another name; 5 (brought into sight) — a box tapped on a phone, the keys over it, the bar's slim "Locked by
admin" line; 6 — the phone's own sideways scroll and pinch on the page: his iPhone's look before merge, scroll bars
judged with `--hide-scrollbars` off; 7 — nothing steered frame by frame (say so); 9 (alignment measured) — every heading of
the Balances page against its figures on every line, at both widths, in every kind of puck (pilot, WSO, ground, O, SANS) —
`scripts/handpass/lw-m4-colalign.mjs` the pattern; 10 (the way back) — leave the Balances tab for the grid, OIL,
Approvals, the View picker and back, after changing a figure while hidden and waiting past the idle time, in WebKit; 11
(what fits) — the page zoomed out at 1536 and at 2560.

**The figures × the days (lesson 1, the money table — each cell a scenario or a named test):** typed, then a leave approved
(this year, next year, across 31 Dec — D1473's worked example to the day); a leave approved before typing; one lengthened,
shortened, moved, deleted, refused back, put back to a bid; an Inputs-page leave; a half day; a run of 15 days over a
weekend; a holiday inside a leave; the clock moved to 31 Dec, 1 Jan, 4 Jan; no grade; below zero (−2 → 31); a grade changed
after 1 Jan (Q1); each other kind kept on 1 Jan; Undo and Redo of a typed figure; a reload.
**The page × who × the lock:** admin, member own row, member another's row; unlocked, locked, locked while a box is open;
member's Undo after the lock; admin's member view (D292). **How the lock is walked under an open box** (finding 14 — the war
carries no change across browser tabs, and Undo's list clears at sign-out, D148): signed in as the member, his box open or
his change made, the lock is flipped through the localhost bridge as the admin's own command — the stand-in for the other
person — and the member's Save and Undo are real presses; the bridge's flip is named in the evidence sheet as such (D608:
the press under test is real).
**And (finding 14):** a period created after a figure was typed (§1.5 row 9); a pending bid that makes a pilot's 15-day run
(row 10); the page left open across midnight on 31 Dec (the figures roll over at midnight without a touch); Days taken for
MED, CSE and OD with weekends inside them; every row of §1.5's table that is marked walked.

1. Admin, desktop: the Balances tab, the page beside `m5b-b1-desk`; type Ranger's App bal and carried fwd, see War bal, the
   grid's figure, My leave and Approvals' LVE BAL follow; Undo (the screen where it was — D672); Redo; reload.
2. Approve one of Ranger's pending leaves: App bal falls by its days, Pending falls, War bal stays (D1479); the same with a
   CCL; refuse it back.
3. Days taken: the View period switched; a past period; a future one.
4. Grades…: rename, reorder by drag, delete one held by people (asked first, "No grade" in amber), Undo; add one; a row's
   grade box and its list.
5. The lock: on → the member's page and window read only with "Locked by admin"; a member's box open while the admin locks →
   his save refused with its reason; his Undo of an earlier change refused.
6. The member (us/us): his own row in boxes, others' read only; his window from My leave with its dots and "who, when"; a
   leave deleted by the admin struck through; close and reopen → no dots; reload → the moment kept.
7. The clock at 20 Dec, 31 Dec 2026, 1 Jan and 4 Jan 2027 with D1473's worked example — §1.5 row 6's figures, not the
   ruling's narrative (reading 21); D1474's three cases; D1489's other kinds kept.
8. The person window on a desktop docked at the grid's right edge, dragged, the grid pressed behind it; on a phone in the
   middle; every way in (§5); another man's (read only, no dots); a man with no row.
9. Phone: the tab row at 402, 390 and 375 (icons kept, kept, dropped — D1483 as corrected); the page at rest, slid, pinched
   (lesson 2's speeds); the bar's padlock off and on; a box tapped with the keys up.
10. Speed (`docs/performance.md` §E, the built bundle, before and after): the grid's node count with the drawer gone; the
    Balances page with 50 people opening and sliding; a typed figure → the grid's repaint counted (`PersonMonth` draws).

## 8. The checks — the FULL row of the checking order, whole (`docs/bug-check-order.md` §5, §7.0)

The rules sweep; scenario design by a fresh model other than the builder (§7 is its seed, not its replacement); the
roll-call (§5); the door check; the walk sized and walked (§7); the break tests (each new guard broken on purpose goes red —
the lock read at save, the own-row check, halves only, cf within the figure, the snapshot recomputed, the typed day, the
name of who typed, a member's grade write refused, `lwseen:` of another pid; and §1.5's table as unit tests before any
screen); the demo seeded with typed figures, grades, a man
with no grade, pending and approved leave either side of the typed date, so the walk has them; GitHub's run of the pull
request as the full check while the repo is public (D1086), the changed tests on his PC; **one fresh, blind Opus read of
the finished code** (D790) **and the security read** (D1411 — a member writing another man's balance, a member writing
while locked, a member writing a grade, the lock or OIL, a forged "by"); the fixes red-first, the re-walk of what they
touched; the evidence sheet with its `Walk:` line; pictures for his look beside the drawings; "merge live" his. Owed and
written on `[NO-ASTRA-LIST]` (D761): the two ChatGPT reads FULL wants and the other provider's scenario design.

## 9. Open points and records

**The fresh read of this spec** (28 Oct 26, one blind Opus reader): 14 findings, all taken — §1 rewritten around one
formula and a worked table (a pending bid never moves App bal; the snapshot kept day by day and charged now; dates no
period covers charged by the plain rule; carried forward defined in every case; D1473's example under D1479; never-typed
and old rows bounded; one clock, the app's today), §3 rewritten (the typed figures and the grade each a collection of
their own, OIL's openings left numeric, every place a collection is listed, the grades' dated shape and fixed ids, the
member's read of every row, `lw.seen` mapped, the commands named, what the gate recomputes), the missed readers (§4), the
machine marks on the war's history lines, the box saving on Enter or leaving it, readings 17–23, and the walk's method for
the lock and its four added scenarios. **Then a narrow fresh read of the rewritten §1 and §3** (28 Oct 26): every figure of
§1.5 recomputed by hand and correct; nine findings, all taken — restores pass the forging checks, what a save of either box
writes, row 10's figures and reading 24, the netting in reading 18, a member's C U D on his own row, no command at boot for
the starting grades, §1.2's last sentence, one year's rule for every year, and three one-line points.

**Left to the build — technical (the builder decides and says what he did):** the engine's exact shape (§1.5); how the
snapshot of §1.2 is held (§3); the grades' dated history (§3); the page's sideways slide and pinch (§4); the seen moment's
row (§3).

**Not in M5a:** M5b (the new Settings with "+ SANS", Management first, holidays and events by file — D1475); the bell line
for an admin's balance change (reading 8, proposed only); a Leave-War-only role (none — D1223).

**Records the same change carries:** `docs/data-schema.md` (the typed figures, grades, the seen moment), `docs/data-model.md`
(their tables and §11's rows — D200), `docs/notifications-register.md` (reading 8's line, proposed), `docs/ui-contracts.md`
(the person window, the Balances page, the lock), `docs/feature-impact.md` (the Balances page; the one balance engine and its
readers), `docs/file-map.md` (new and removed files), `docs/performance.md` §E (the measures), `docs/engine-rules.md` (the
leave year), the walk ledger and the evidence sheet; this spec linked from `[LW-OVERHAUL]` and `[LEAVE-YEAR]`. Typecheck
with `npm run build` (`tsc --noEmit` reports nothing here); check the browser-test port is free before a run.
