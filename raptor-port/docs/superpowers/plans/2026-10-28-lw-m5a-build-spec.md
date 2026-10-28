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

**1.1 What is stored for a person's leave (D1479, B6).** For each of LVE, CCL, FCL, PL, EL and CL, the figure he (or an
admin) last TYPED, as the official leave app showed it, with when, by whom, and — for LVE — how many of those days were
carried forward ("incl. 2 carried fwd"). Typing keeps a snapshot of the approved leave the typed figure already includes
(§1.2), so that nothing approved before he typed comes off twice. OIL is not typed (D1209, D1255): it stays the OIL
tracker's earned and awarded record. Halves only: a typed figure is a whole number or a .5, anything else refused with its
reason; a figure below zero may be typed (an overdrawn balance is real).

**1.2 App bal — the running figure (D1479).** App bal = the typed figure less every day of his approved leave of that kind
that is not already inside it — worked out as *the days his approved leave charges now* less *the days it charged when he
typed*, so:
- a leave approved after he typed comes off, the day it is approved — its days whatever their date (D1479's example:
  typed 17 on 5 Jan, 26–27 Jan approved → 15);
- a leave already approved when he typed takes nothing off (it is inside the official figure);
- an approved leave later deleted, refused back, put back to a bid, shortened or moved gives its days back, and one
  lengthened takes only its new days (the reading D1479's row names: "a refused or deleted approved leave puts its days
  back");
- typing again "only corrects it and starts the count afresh" — a new snapshot.
"Days a leave charges" is the war's one charging rule (`engine/charge.ts`: weekends and holidays count nothing, except a run
of 15 or more days of LL / OL, his answer of 19 Sep 26), the same rule Approvals' DAYS and the bid windows' figures use.

**1.3 The leave year (D1218, D1224, D1229, D1235, D1473, D1474, D1489).** LVE alone has years:
- a day of leave is charged to the year it falls in (D1473); within a year, carried-forward days go first (D1224);
- a day in a later year, approved now, comes off now (D1479) and is charged, when its year comes, to that year — so it
  uses next year's carried-forward days (this year's unused annual leave), never this year's carried-forward days, which
  end on 31 Dec (D1218; D1473's worked example: 31 Dec takes this year's carried-forward day, 4 Jan next year's);
- **on 1 Jan, by itself, with no one doing anything:** what is left of the carried-forward days goes; what is left of the
  year's annual leave becomes the new carried-forward; the grade's days are added (D1235: 37 left of which 4 carried
  forward, a junior pilot → 33 carried forward and 66 in all); no grade adds nothing; below zero carries nothing forward
  and the overdrawn days still come off (−2 + 33 = 31 — D1474); pending days count in the year they fall in (D1474);
- **how it runs (the builder's call, the plan's §4):** worked out, never stored — App bal for any day is computed from the
  typed figure, its date, the approved leave and the grades held on each 1 Jan since. No command runs on 1 Jan, so nothing
  waits for an admin to sign in, nothing runs twice, Undo needs nothing of its own, and a member's window is right on 1 Jan
  before anyone else opens the app. The price: the grade held, and its "+ days", on each past 1 Jan must be known — so a
  grade given to a person, and a grade's "+ days", are kept with the date they took effect (§3), and the 1 Jan of a year
  reads what held on that day (Q1, §6).
- CCL, FCL, PL, EL and CL keep their figures on 1 Jan; each comes down only by approved leave of its own kind, and a new
  year's figure is typed from the official app (D1489).

**1.4 Pending, War bal, taken.** Pending = the days his pending requests of that kind charge, every year (D1217 — days,
never requests; amber, the word grey — D1251, D1252). War bal = App bal less Pending (D1479) — the one figure the grid
shows beside his name, My leave's LVE, Approvals' LVE BAL and the bid windows' leave buttons (D1153). "3 taken" (the LVE
tile) = his approved LVE days on dates from 1 Jan of this year up to today (the drawings' rule: `full-m5a-stage.mjs`, 19–21
Jan approved and past → 3; 26–27 Jan approved and ahead → not yet taken). MED's "0 days" = medical days on dates this year
up to today. Days taken (the Balances page) = approved days of each kind on dates inside the View period up to today
(D1484).

**1.5 One engine.** One pure module answers all of §1.2–1.4 for a person, a kind and a day, and every surface reads it —
the person window's tiles, the Balances page (both views), the grid's figure beside each name, My leave, Approvals' LVE
BAL, the bid windows' "left" on each leave button, the day panel's figures if it shows any. Today these are worked out in
more than one place (§4); M5a leaves exactly one. A test feeds the same world to every reader and checks they agree.

## 2. The screens

**2.1 The person window (D1480; jobs 1–2).** Built to `m5a-p2-desk-drawn` and `m5a-p4-phone-own`. The heading: his name,
✕; then BALANCES with the padlock and "Locked for members" (admin) or "Locked by admin" (member) while locked (A10,
D1220); round 20d's tiles exactly (`m5a-c-approved`): LVE (its box, "3 taken"; App bal · Pending · War bal on one line, the
pending figure amber; "incl. [2] carried fwd · till 31 Dec" under App bal), OIL ("0 ›", opening the OIL tracker — D1209),
MED (days); then CCL, FCL, PL, EL, CL, each its box and, only while something is pending, "Pending −1 / War bal 2" as a
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
own — A1); Approvals' line or the bell's line for a man with no row (B12 — M4 built that half). A name on the Balances page opens
nothing (none was drawn).

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
hold asks first, naming how many, and they become "No grade" (Undo brings it back); two grades cannot share a name. Its
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

- **The typed figure — `LeaveOpening`, changed shape.** Today `opening:<pid>:<counter>` holds a bare number, back-solved by
  `setBalance` against every draw of all time (`store.ts` ~L4942), and `readOpenings` (~L477) skips any row that is not a
  number. It becomes `{ amount, at, by, cf?, base }`: the figure typed, when (ms), who, for LVE the carried-forward part,
  and `base` — the approved leave's charged days at that moment (LVE: by year; the others: one number) — so §1.2's "not
  already inside it" is a subtraction. Changed together, or a field is dropped at the next reload: `readOpenings`, the
  `lw.opening` record mapping (`store.ts` ~L1355, ~L1405–1414), `rows.ts` (`openingKey`, ~L39, ~L117),
  `docs/data-schema.md` §World 2, `docs/data-model.md` LeaveOpening. A row in the old shape (a bare number — demo data,
  D56) is read as a figure typed at the beginning of time with an empty `base`, never skipped (D401: an old record must
  not break a load), with a test. **OIL is refused at the store** (B6): no OIL opening is written by any door; the
  seed's `oil:` openings (`engine/seed.ts` ~L193–206) are demo data, left readable.
- **A person's grade — on his profile.** `profile:<pid>` (`LeavePersonProfile`, today `{post?, label?}`) gains `grades:
  [{ id, from }]` — the grade and the day it took effect, newest last; a change on the day it was set replaces that day's
  entry. Admin only. The 1 Jan of a year reads the entry in force that day (Q1).
- **The grades list and the lock — `lw.config`.** `grades: [{ id, name, order, days: [{ n, from }], gone? }]` (a deleted
  grade kept, marked `gone`, so a past 1 Jan still reads its days) and `balLock: boolean`. `lw.config`'s fields are listed
  in FOUR places — `store.ts lwRecords` (~L1361–1368), `applyLwRecord` (~L1440–1452), `rows.ts CONFIG_KEYS`
  (~L128–135), the boot's `readStored` (~L1119's pattern); a field missed in one is lost on reload or by Undo: a test reads
  each new field back through a reload and an Undo. The starting list (D1229) is seeded once when `grades` is absent.
- **A member's "last visit" — a settings row of his own, `lwseen:<pid>`**, on M4's `apprseen:` pattern whole
  (`state/apprseen.ts`): `{ at: ms }`, written through `commitSettingsIntent('lw.seen', { owner: pid }, …)` when he opens
  his own person window, the previous moment kept for that visit; its prefix in `state/people-settings-commit.ts
  SETTINGS_ROW_PREFIXES` and its type registered there (`definePermission`, as L335 does for `apprseen` — without it the
  command layer refuses the type, M4's bug of 27 Oct); `undo/timeline.ts NOT_STEPS`; `storage/tables.ts`. **One step
  M4's did not need:** `ownershipViolation`'s `settings` case (`perms.ts` ~L995–1005) lets a member write only `seen:` and
  `noticeseen:` rows of his own; `lwseen:<pid>` joins them, his own pid only.
- **Who may write — `state/perms.ts` and `docs/data-model.md` §11 together (D200; the parity tests catch a drift).**
  Today ONE row, `T.ledger`, covers `LeaveOpening`, `LeaveLedger` and `LeaveCounter` (~L76, ~L115), and the balance write
  rides `lw.edit`, whose gate row is a BID's — a member passes it, and only `setBalance`'s role check and
  `ownershipViolation`'s "an admin's record" stop him. **M5a splits `LeaveOpening` out to its own row** (admin C R U D,
  member R and U of his own row) — never by widening `T.ledger`, which would let a member write grants and OIL
  corrections — and gives the typed figure **its own command, `lw.balance`** (`op(T.opening, 'U', 'required')`,
  registered in `lwRegisterCommands` ~L1498–1520), an Undo step, with an `ownershipViolation` branch: a member only on his
  own pid, only while `balLock` is off **as it stands when the command is saved** (so an open box after the lock, and his
  Undo after the lock, are refused alike — B6), never OIL, halves only. Grades, the grades list and the lock: admin only
  (`lw.grade`, `lw.config`). `leavewar/permsparity.test.ts` gains the member's own write, his write to another man, his
  write while locked, his Undo after the lock, an OIL write, a grade write and the lock — each refused or allowed as
  above. Member view (D292) is a real member to these checks.
- **The change history (`state/changelines.ts`).** Today a balance writes no line and its Undo none (~L543–546; no
  handler for `lw.opening` or `lw.config`). New: `openingLines` — "LVE balance 18 → 20 · Ranger" (B6), each kind by its
  name, carried forward as "LVE carried fwd 2 → 3"; a grade — "Grade Junior pilot → Senior pilot · Saber"; the lock —
  "Balances locked for members · Saber"; the grades list — added, renamed, its days, deleted. `lw.opening` and
  `lw.config` join the `wrote` set so Undo's line is written too.
- **The security read (D1411):** this changes who may write a balance — one extra fresh reader looks only for holes (a
  member writing another man's figure or a grade, writing while locked, an OIL opening by any door, a forged "by",
  `lwseen:` of another pid).

## 4. Where it is built — the code, as read on main (the survey of 28 Oct 26)

**The engine (§1.5).** Today `engine/counters.ts balanceOf` (~L171–184) is `opening + grants (+ earned OIL) − drawnFrom`,
and `drawnFrom` (~L130–141) sums `engine/charge.ts chargedDays` over every war and every date — one running balance a
kind across all periods, pending requests counted in full (refused nothing). New: one pure module (say
`engine/leaveyear.ts`) on top of `chargedDays`, which already returns a map by date, so a year is a filter on the date and
a 15-day run across 31 Dec still decides its days as one run. It splits approved from pending by reading each day's
records (`v.all` — an Input against a request), since `v.charges` carries no state. It answers, for a person, a kind and
a day: App bal, carried fwd and its end date, Pending, War bal, taken; and days taken by kind over a range. Grants still
count, from the ledger, only those made after the typed moment (whatever Q2 decides, none are lost). `takenOf` /
`lveConOf` / `medConOf` (~L251–303, every source, no range) are replaced by it. **Two things the survey found the engine
must fix while it is there:** `figureCtxOf()` (store ~L4686–4691) uses `localToday()`, not `memberToday()`, so a test
clock moves neither OIL's expiry nor a year's end — the year must turn on the app's today; and a man with no row (a SANS
man while SANS is off) is not in `figureCtxOf().people`, so the pilots' 15-day rule never applies to him — the engine is
given the off-roster identities too (`sync.ts warIdentityIfHidden`'s source). Leave on dates no period covers is not
charged, as today (no war holds a view of it); the walk of D1473's example needs a 2027 period.

**Its readers, each moved onto it (§5's first list):** the grid's figure beside each name (`Matrix.tsx` ~L655, the fixed
LVE figure; `FIGURES` / `plainBal('annual')`); `ui/myleave.ts myLeaveOf` (~L26–49) — whose "pending" today counts
CALENDAR days of every leave-kind request, weekends included, and so disagrees with Approvals: it becomes the sum of every
kind's Pending; `leavewar/approvals.ts figuresOf` (~L114–163, LVE BAL and DAYS); the bid windows' "left"; the OIL figure
stays `oilLedgerOf`. A test feeds one world to every reader.

**The person window.** Today `leavewar/ui/CounterSheet.tsx PersonFiguresSheet` (~L314–421): `visibleFigures()` rows, an
admin's "Set" (`<input type=number step=0.5>`, any finite number accepted), no EL row; `FigureBreakdownSheet` (~L215–292)
on a tap. The rest of the file's `CounterSheet` picker (~L30–199) is dead — Matrix imports only those two. Replaced by a
new `leavewar/ui/PersonWindow.tsx` drawn from `full-m5a-person.mjs`'s own markup and sizes (D1478); every kind shown
whatever `figureHidden` says. Mounted where the sheet is (`Matrix.tsx` ~L4660–4668, `whoOpen` ~L388, the asks ~L407–414),
keeping the `warIdentityIfHidden` fallback — and `setBalance`'s "not on the roster" refusal (~L4944) is lifted for such a
man, or an admin's typed figure for him fails in silence. **Docked** at the grid's right edge on a desktop (A5): a
draggable window, not a sheet over the grid, the grid working behind it (D641). **The list:** `leavewar/ui/LeaveLine.tsx`
(39 lines, used by `DayPanel.tsx` ~L84) gains "no puck" and a muted "who, when" line under it; its rows come from a new
per-person builder (the day panel's `state/daypanel.ts dayPanelData` works a day at a time): approved leave — one Input,
one line; pending and refused requests — one line a run by `reqRunKey` (Approvals' `linesOfWar`, `approvals.ts` ~L56–92,
the pattern); across every war, filtered by the year picker. "Who, when" reads M4's `decidedBy` / `decidedAt` on a request,
the Input's `by` and stamp, and — for a leave deleted by someone else — the change history's Leave War lines
(`state/changelines.ts`), as Approvals' "Also since you last looked" does. **My leave** (`Chrome.tsx` ~L221–231) keeps
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
**A new-since-last-visit line** (each change someone else can make to his leave): approved, refused, put back to a bid,
moved, deleted (struck through), kind changed (D1460), placed approved by an admin (D1422), a whole leave decided, Approve
all, an Inputs-page change by a scheduler; and his own change of each (never dotted).

## 6. Put to him before the build — two questions; the readings his to strike

**Q1 — a person's grade changed after 1 Jan.** Recon is a Junior pilot (+33) on 1 Jan 2027, so 33 days are added; on
1 Mar 2027 an admin makes him a Senior pilot (+36). *Recommended:* the new grade counts from the next 1 Jan — his 2027
figures stay as they are, and on 1 Jan 2028 36 are added; the same for a grade's "+ days" changed in the Grades window
mid-year. *The other way:* the change reaches back to 1 Jan, and his App bal jumps by 3 on 1 Mar. (Picture: the grade box
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
   typed kind): the box shows the running figure, and its Pending / War bal lines show only while something is pending.
2. "Since he typed" is counted by what was approved when he typed, not by a leave's dates: a leave already approved then
   takes nothing off; one lengthened afterwards takes only its new days; one deleted gives its days back.
3. The grid's FIGURES drawer and its grants go: a balance changes only by its box, by approved leave and by 1 Jan.
4. A person whose figures were never typed shows 0, and 1 Jan adds his grade's days to that.
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
member's Undo after the lock; admin's member view (D292).

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
7. The clock at 31 Dec 2026, 1 Jan 2027 and 4 Jan 2027 with D1473's worked example; D1474's three cases; D1489's other kinds.
8. The person window on a desktop docked at the grid's right edge, dragged, the grid pressed behind it; on a phone in the
   middle; every way in (§5); another man's (read only, no dots); a man with no row.
9. Phone: the tab row at 402, 390 and 375 (icons kept, kept, dropped — D1483 as corrected); the page at rest, slid, pinched
   (lesson 2's speeds); the bar's padlock off and on; a box tapped with the keys up.
10. Speed (`docs/performance.md` §E, the built bundle, before and after): the grid's node count with the drawer gone; the
    Balances page with 50 people opening and sliding; a typed figure → the grid's repaint counted (`PersonMonth` draws).

## 8. The checks — the FULL row of the checking order, whole (`docs/bug-check-order.md` §5, §7.0)

The rules sweep; scenario design by a fresh model other than the builder (§7 is its seed, not its replacement); the
roll-call (§5); the door check; the walk sized and walked (§7); the break tests (each new guard broken on purpose goes red —
the lock read at save, the own-row check, halves only, the snapshot); the demo seeded with typed figures, grades, a man
with no grade, pending and approved leave either side of the typed date, so the walk has them; GitHub's run of the pull
request as the full check while the repo is public (D1086), the changed tests on his PC; **one fresh, blind Opus read of
the finished code** (D790) **and the security read** (D1411 — a member writing another man's balance, a member writing
while locked, a member writing a grade, the lock or OIL, a forged "by"); the fixes red-first, the re-walk of what they
touched; the evidence sheet with its `Walk:` line; pictures for his look beside the drawings; "merge live" his. Owed and
written on `[NO-ASTRA-LIST]` (D761): the two ChatGPT reads FULL wants and the other provider's scenario design.

## 9. Open points and records

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
