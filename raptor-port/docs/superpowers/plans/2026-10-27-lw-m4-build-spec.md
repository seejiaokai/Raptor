# The Leave War overhaul's M4 — deciding: the build spec (27 Oct 26)

**What M4 is.** The fourth of the five merges of the approved build plan (`2026-10-22-leave-war-overhaul-build-plan.md`,
D1250; next by D1404): batch 8 (Approvals — the tab, its list, Approve all, the "New" choice, a request's dates opening the
grid) and batch 9 (the bell's Leave War lines). Its own branch, cut from `main` once this plan is approved; tier FULL (a new
stored field on every request; Approve all one command over many requests; a new kind of notice and a third notice writer —
a permission row widened; the bell is shared by every page). One fresh, blind Opus read of the finished code (D790), the
security read of D1411 (it changes who may write a notice), the ChatGPT reads owed on `[NO-ASTRA-LIST]` (D761).

**Rulings it carries** (open each full row before acting on its detail — `grep -h '^| D1152 |' .claude/decisions-full/*.md`):
Approvals — D1152, D1197, D1184, D1189, D1192, D1180, D1181, D1178, D1254 (a tab: Grid · Approvals · Balances · OIL for an
admin; a member has no Approvals tab), D1196 and D1188 (as D1254 narrows them), D1231 (the "New" choice, the cyan dots, the
dates that open the grid with the just-added ring and a slim "Back to Approvals" bar; no dot on the grid), D1208 and D1219
(no notification to the admin about new requests, no switch), D1223 (the URHO is an admin — no Leave-War role), D1246
(halves .5), D1175 (look F), D1361 and D1330 (Approve / Refuse rest grey, the decided one lit, a second tap sends it back),
D1339 and D1346 (a leave placed over several days is one entry — one line), D1153 (a bid takes its leave off at once — "LVE
Bal" already counts it), D860 (the just-added ring is one look). The bell — D1142, D1214, D1216, D769 (how the bell
speaks), D148 (Undo reverses only one's own change), D1166 (Inputs-page leave is never decided in Approvals and keeps
telling him through the Inputs door). Must keep: D672 (Undo leaves the screen where it is), D641 / D642 (windows do not
block), D1302 / D1186 (the admin's "Approve what I enter"), D1225 / D1263 (a member's pending bid on a closed day), D1008
(a member reads every row), D1281 (the phone press checks), D487 (button sizes).
The red team's fixes it carries (design note §10.2): A4 (Approve all "tap again", plain line buttons), A5's desktop half as
D1254 changes it (Approvals is a tab, so it no longer opens over the grid), A11 (two lines a request on a phone), B1 (never
told twice), B8 (a decision taken from a state since changed is refused), B12 (a posted-out man's line tagged; a man with no
row opens his person window).

**Every file, function and line below was read on `main` at 36b7beaa9 on 27 Oct 26 and may have moved; the builder
verifies each before acting.**

## 0. Before starting — what is settled and what is not

- **Both questions the plan said M4 waits on are answered:** Q8 → D1214 (every member's bell told when bidding opens or
  closes); Q11 → D1216 (a read line keeps "taken back"; an unread one goes with the Undo). The plan's §2 table is updated.
- **The plan's M4 row is stale on one point (D1254 narrowed D1196 and D1231 after it was written):** Approvals is a TAB,
  not a button with a window docked to the grid; from a request's dates the Grid tab opens with a slim "Back to Approvals"
  bar on a desktop as on a phone. This spec builds the tab; the plan's row is corrected in the same change (D201).
- **What "New" is (D1231's reading, settled):** the admin side of "since your last visit" — the cyan dot on each line that
  arrived since he last opened Approvals, the "New N" choice that shows only those, and the "Also since you last looked"
  group (P9 of the notifications register: a member withdrew a pending bid; leave filed on the Inputs page landed on the
  war). The member side (dotted lines in My leave) is M5's, with the person window (A1).
- **The drawings of record** (`raptor-port/docs/mock/lw-overhaul/full/`): `r7-14-approvals-desk.png`,
  `r7-15-approvals-armed-desk.png`, `r7-16-approvals-phone.png` (the list, its columns, the phone's two-line requests,
  "Approve all — tap again"), `r14-dots-1-new.png`, `r14-dots-2-shown.png`, `r14-dots-3-phone.png` (the dots, a request's
  dates → the grid ringed), `r19-nav-admin-desk.png`, `r19-nav-admin-phone.png` (the tab row), `r7-28-bell-phone.png` (the
  bell's lines). **They predate D1254 and D1217:** r7-14 to r7-16 draw Approvals as a window docked over the grid and
  "waiting"; build it as the tab's page and "pending". **The tab's page itself was never drawn** — it is drawn for his look
  before the build (§5, look L1).

## 1. Batch 8 — Approvals

**8.1 The tab (D1254, D1188; built as drawn — D1420).** An admin's tab row reads Grid · Approvals N · OIL (Balances joins in M5, between Approvals
and OIL — never a tab with nothing behind it). N is the count of pending requests in EVERY period — since the count is the
only sign that anything waits (D1208, D1219), a request in next year's period, bid on while he views this year, must still
show — and it rises as requests come in (D1152). The list itself covers the period on view (D1184); where other periods
hold pending requests, a line at its head says so and switches View there: "+4 pending in JAN – DEC 27 ›" (the fresh read,
finding 5). A
member has no Approvals tab. The tab's page takes the grid card's place under the top row, as the Balances page will
(`r14-bal-1-desk`); the top row (the tabs, View, My leave, ⚙) stays. The keyboard: the tab row's own (one tab stop, the
arrows). Re-measure the phone's tab row at 390, 402 and 431–700 and with an iPhone's wider letters — three tabs and ⚙ now,
four in M5 (build plan batch 4's note).

**8.2 The list (D1152, D1189, D1180, D1181, D1178, D1192, D1246, D1217).** One line a request, oldest first by when it was
placed. A request is what the grid treats as one entry: the days placed together in one go (D1339, D1346), whatever their
number — so a five-day OL is one line, "Mon 23 – Fri 27 Feb · 5 days". Each line: the new dot (8.4) · the person's puck
(his seat's colour, his CAT chip, a SANS man's purple edge — the war's own name-cell look, not the board's puck) · the
kind's look-F box drawn pending · the dates (cyan, "›" — 8.5) · DAYS · LVE BAL (the balance the request already counts —
D1153; an OIL or a CCL… request shows its own kind's balance, labelled; below zero red) · LOWEST AVAIL (his seat's
Available row's lowest figure over the request's days, then every Manning row the request turns amber or red, each on its
own line in its colour, flush left — a row already amber or red that the request lowers further counts, as the bid
bubble's does (D1345); a SANS man's line "SANS · not in Avail") · PLACED (the date and time; "by <name>" when
someone else placed it) · the document mark (the Inputs list's paperclip, its number when two or more; a tap opens the
document viewer for the admin to read before deciding; nothing when none) · Approve · Refuse. Columns line up from line to
line under headings drawn once; numbers right-aligned. On a wide desktop the list keeps one eye-span (about 1240px) so
the buttons stand near the figures (the drawing, `r22-1-desk`). On a phone each request is two lines (A11): puck · box ·
dates · paperclip · Approve · Refuse; then the four figures under headings drawn once (`r22-5-phone`). A posted-out man's
puck carries his posting tag (B12) — "posting out 12 Mar" before it runs (`sync.ts postingPendingTag`); once an archive or
a transfer has run that tag is gone (it returns nothing), so the line reads "posted out 14 Oct", and his Approve is refused
on the line ("Posted out — refuse or delete it") while Refuse still works. A line joined from next-door bids placed at
different times or by different people (D1346, the run rule) shows the EARLIEST placed time and its "by". The figures are worked out when the tab opens and when the war changes, not on every
grid repaint (the code map's cost note).

**8.3 Deciding a line (D1361, D1330, A4, B8).** Approve and Refuse rest grey, their words green and red. A tap decides that
one request at once — one command, one Undo — and its button lights ("Approved" solid green, or "Refused" solid red); the
line STAYS where it is, lit, until he leaves Approvals or changes the dates (D1421), so a slip is put right
by a second tap on the lit button (it goes back to pending, as in the bid windows) and nothing moves under his finger.
**A line re-keys after its own decision** (the fresh read, finding 2): approving turns the request into an Input and a
put-back mints a new request with a new id, so the writer returns the new ids per item and the line follows them —
otherwise its own second tap reads as stale. Back to pending clears "decided by" (`decideRequest` spreads the record and
would keep "Refused by Hex" on a pending line). A test: approve, second tap, approve again. **"Leaving Approvals"** means
choosing another tab, the page, or ✕ on the slim bar and then going elsewhere — a tap on a request's dates with the slim
bar up is not leaving: the lit lines, the dots, the New set and the dates picked all survive Back. The count on the tab and
"Approve all N" count only what is still pending. A request the clash rules refuse is not decided: its line says why,
in red, under its dates, and stays pending. A decision taken from a state since changed — the request deleted, moved or
already decided by someone else since the list was drawn — is refused, the line saying what happened ("Already refused by
Hex"; "Already approved by Hex"; "No longer there") (B8). Today such a press is skipped in silence (the survey, §3): the line
carries the record ids and the state it was drawn from, the writer compares them, and "who decided" is a new stored pair
on the request, `decidedBy` / `decidedAt` (§3) — the same pair draws the entry window's "Decided" line (`r7-13`). An
approval's "who" can also be read off the war-approved Input's `by`.

**8.4 "New" (D1231's reading; P9).** The list remembers, for each admin, when he last opened the tab. A request placed
since then wears the cyan dot; the "New N" choice shows only those and, under them, "Also since you last looked · nothing
to decide": a member's withdrawn pending bid, and leave filed on the Inputs page that landed on the war — each a line with
its puck, box, dates, what happened and when (`r22-2-desk`). The dots clear when he leaves Approvals (8.3's meaning). The
moment stored is when he OPENED the tab, written then (a reload or an iPhone dropping the page while he is on it must not
lose it); "new" is anything placed after the previous stored moment — a per-person record (§3). The "also" lines' dates are
links too, as the requests' are (D1231's reading): a withdrawn bid's dates open the grid there, the day ringed, nothing
in it. Where the "also" lines come from is the build's to find and say: the change history's
Leave War lines (`state/changelines.ts`) if they hold a member's delete of his own pending bid and an Inputs-page leave
landing on the war, by who and when; a deleted request otherwise leaves no trace to list.

**8.5 The dates (D1184, D1197, D1231 as D1254 narrows it).** The filter row: New N · DATES · All · the period's months as
the "Open for bidding" window has them (two rows of six on a phone, with New and All leading), a month with nothing pending
dimmed · Pick dates… (the app's one calendar) · Approve all N at the right. "Approve all" — the main-button look (A4) — approves exactly
what the list shows: one press arms it ("Approve 13 — tap again", A4), a second approves every pending line shown as ONE
command and one Undo; anything that changes what the list shows while it is armed (a filter, one line decided, an Undo, a
request coming or going) disarms it, so the second tap never approves a number he did not read; a line the clash rules refuse is reported on its line and the rest go through (`r22-3-desk`). A tap on a request's
dates opens the Grid tab, scrolled so the cell stands clear of the frozen columns and the slim bar, the cell wearing the
just-added ring for about six seconds (D860), and a slim bar at the foot — "● Approvals · 15 pending · 3 new · Back ▴ · ✕" —
on a desktop as on a phone (`r22-4-desk`, `r22-6-phone`). Back opens the tab again where it was (the dates picked, the
scroll); ✕ drops the bar. A man with no row on the grid (a SANS man while SANS is off the war) opens his person window
instead (B12).

**8.6 Who placed it and when (the new stored field).** Every request records who placed it and when, kept across a move and
a re-typed kind, restored as recorded by Undo and Redo (the Inputs page's precedent — D629); the list's order and its PLACED
column rest on it; the entry window's "Placed · Decided" lines (`r7-13`, held back from M3) are built here. A request saved
before M4 has none: it sorts first and shows a dash. **Every place a request is made or rebuilt carries the pair** (the
survey, §2): `setCell` mints it (a re-typed kind on the same half keeps the first stamp — the request is the same request);
the move rebuilds the landed record field by field and drops any new field unless it is added there or to
`requestWords()`; the put-back (`sync.ts doorDecideApproved`) makes a new request from the Input, whose `by` is the
APPROVER — so the approved Input carries the request's own placer and time and the put-back restores them;
`replaceClashingBids` and `decideRequest` spread the record and keep it.

## 2. Batch 9 — the bell's Leave War lines

**9.1 A decision on his leave (D1142, D769).** The member is told, one line a decision: his bid approved or refused, his
approved leave put back to a bid, moved or deleted, his bid replaced by a clashing input — naming who did it; a run of days
decided together is one line ("Your leave · Mon 19 – Wed 21 Jan · LL approved · Saber"); a tap opens the Leave War's grid at
that day with the just-added ring. A decision a person takes on his own row tells nobody (his own move, his own delete). The
line is written inside the war's own command, so it is saved and undone with it.

**9.2 Never told twice (B1).** While the war's own commands write the Inputs page's copy of a war-approved leave, the Inputs
door's own notice ("Deleted", "Now Tue 14 – …", "You were added") is skipped for that leave and the war writes its one line;
a change made on the Inputs page keeps telling him through the Inputs door as today (D1166). A test for each of the six
cases, including a put-back that rings one line.

**9.3 Undo (D1216, D148).** The admin's Undo of a decision takes its line back if the member has not read it; if he has, a
new line says "Approval of LL taken back · Saber" (or "Refusal of…", "Move of…", "Deletion of…"). Redo leaves the "taken back"
line where it is (it happened); where one stands for that decision, Redo's follow-up writes a FRESH line, new id and the
time now — "LL approved again · Saber" — because the old line, put back with its old id, is still in his read marks and
would come back already read under an unread "taken back" (the fresh read, finding 3); where none stands, Redo simply puts
the old line back. **How (the agent's call, from the survey §7):** an
Undo restores an exact image, so it cannot itself leave or write a line. The decision's line goes with the Undo as today;
then, once the Undo has landed, a follow-up notice command — never an Undo step (`undo/timeline.ts NOT_STEPS`) — writes the
"taken back" line for each member whose read mark covered the line that went. For the admin's device to see a member's
read mark, the read-mark record (`NoticeSeen`) gains read for an admin (`state/perms.ts`, `docs/data-model.md` §11 —
D200; a permission widened, in the security read's brief). The alternative, the member's own device noticing a line it read
has gone, cannot say who took it back; not taken.

**9.3a A bid replaced by a clashing input (D1142, the survey §7).** An Inputs-page filing that names him and replaces his
pending bid already tells him "You were added" through the Inputs door; one line, not two: that line reads "… · replaces
your LL bid" and the war writes none (a member's own filing over his own bid tells him nothing, as today). The war's grid
notice ("OK, seen") stays. M3's leftover (7) is built here: the replaced bid's remarks and documents are kept on that grid
notice and offered onto the replacing leave of the same man. A member filing it must carry the replacing input's id on the
line, or the permission check refuses his whole filing (`ownershipViolation`, `case 'notices'`).

**9.4 Bidding opens or closes (D1214).** When an admin opens dates for bidding or closes them (the "Open for bidding"
window), every person on the war except him gets one line: "Leave War · 1 Apr – 30 Jun · bidding open · Saber" / "…
bidding closed · Saber"; widening or shortening a stretch is one line with its new dates; a tap opens the Leave War with
that stretch in view (the grid at its first open day). Undo follows 9.3. **Not a line a month:** each month tapped in the
window is its own command, so an admin opening four months would ring every member four times — one live line per member
per stretch, the newest replacing the older (as the holiday's lines do, `noticeLive`). Who gets it: every account tied to a
person on the war, the archived, deleted and special left out, the admin who did it left out. **A stretch that ends because its last date passes rings too** — D1214
ruled the register's P7 in as written, and P7's "when" includes "its last day passes" (the fresh read, finding 4): "Leave
War · 1 Apr – 30 Jun · bidding closed · its dates ended", no name. No command runs on that date, so the line is not a
stored notice: each person's bell derives it from the period's stored stretches once the date has passed (its own steady
id, read like any other line); at the database step a scheduled flow may write it instead (noted for the IT side).

**9.4a An admin's leave placed approved on a member's row (the register's P2 — ruled in, D1422).** "Approve what I enter" makes a
new war-approved Input, which today tells nobody. He is told (D1422): "Your leave · Mon 9 Mar · LL added and approved · Saber",
a tap opening the grid there; written by `placeApproved` (`lw.placeApproved`) as 9.1's lines are.

**9.6 The tap (the survey §7, §10).** No route opens the Leave War at a date today: `sync.ts openWarAt(iso, personId?)`,
from the bell (`ui/topbits.tsx openNotice`), opens the page, the war holding the date, the grid at that day and the
person's cell ringed. The page's first-visit landing (`LeaveWarPage.tsx`, its landed flag) must not override it. **A line for a man
with no row on the grid** (a SANS man while SANS is off the war — B12, the build plan's batch 9) opens his person window
instead, as Approvals' dates do (8.5).

**9.7 An admin moving or deleting a member's pending bid** (not in D1142's list, which names a decided bid and an approved
leave — the fresh read, finding 11): one line, "Your leave · Tue 27 Jan · LL bid moved to Thu 29 Jan · Saber" / "… LL bid
deleted · Saber" — a reading named at his look, his to strike.

**9.8 A member's shared filing over another man's pending bid** — **FOUND NOT TO ARISE at the build (27 Oct 26):** only a
leave or a medical replaces a bid, a member files neither for another man (D655) and may not change a shared leave someone
else filed (D763); pinned (`memberclash.test.ts`, `m4ride.test.ts`), no permission widened. As written before the build
(`[LW-M1-READ-LEFTOVERS]` (1), placed "with the Leave War's
next batch"): today it writes a war notice on that man's row and the commit refuses the whole filing. 9.3a's one line rests
on that filing landing, so it is built here: the war's notice rides the filing's own input id (the permission check's
`rides`), and the case is walked. `[LW-CLASH-ROWLESS-TAP]` closes with the off-roster person window (8.5).

**9.5 Nothing to the admin (D1208, D1219).** No bell line tells an admin that a request waits; the tab's count is the only
sign. A member's withdrawn bid and an Inputs-page leave reach him only in "Also since you last looked" (8.4).

## 3. What is stored, and who may write it (D473, D200 — the documents in the same change)

- **The request's "placed by" / "placed at" and "decided by" / "decided at"** — `leavewar/engine/warrecs.ts RequestRec`,
  read by `readRecBody` (a field it does not read is dropped at the next reload); saved whole as JSON (`rows.ts recJSON`),
  so no row mapping changes; `docs/data-schema.md` (the WarRec request fields — it still lists the retired UNA kind: fix it
  in the same change) and `docs/data-model.md` §3 LeaveBid (its `placedBy` row is the retired UNA's: new rows for a
  request). The reader keeps an old request without them (D401), with a test.
- **The new notices** (a war decision, bidding opened / closed, a taken-back line) — the Notice record's new kinds;
  `docs/data-model.md` §3 Notice and §11's Notice row, which today allows a notice only inside a change to the input it names
  or the holiday's: a third writer, the war's decide / move / delete / open-dates commands, admin only; a member's own war
  command writes none. `state/perms.ts` and §11 change together (D200); the parity test catches a missing row. Grows
  [NOTICE-RETENTION]'s question.
- **Each admin's "last opened Approvals"** — a settings row of his own, `apprseen:<personId>`, on the pattern of the access
  requests' `reqseen:` (`state/accounts.ts`): written when he leaves the tab through `commitSettingsIntent`, never an Undo
  step (`NOT_STEPS`); its prefix joins `state/people-settings-commit.ts SETTINGS_ROW_PREFIXES`; PERMS a type of its own
  (each person his own row); `docs/data-schema.md`, `docs/data-model.md` and §11.
- **The read-mark record gains an admin's read** (9.3) — `NoticeSeen`, PERMS `[T.noticeseen]` and §11 together.
- **The follow-up notice command of 9.3** (after an Undo or a Redo) is a notice writer of its own type — named in
  `state/perms.ts`, §11's Notice row and `undo/timeline.ts NOT_STEPS` together.
- **The security read (D1411):** this widens who may write a notice — one extra fresh reader looks only for holes (a member
  writing a notice to another, a member reaching Approvals' commands, a forged "placed by").

## 4. Where it is built — the code, as read on main (the survey of 27 Oct 26; the 22 Oct code map's §F and §H are stale)

**The tab.** `leavewar/ui/Chrome.tsx Topbar` — the tab list holds Grid and OIL; a tab is a one-shot ask (`ui/lwnav.ts askLw`,
`LwAsk = grid | oil | settings | person`) that `Matrix.tsx` takes (OIL is a window over the grid; nothing stored). Approvals
adds `approvals` to `LwAsk`, a third tab, an open state, and `tabOn` becomes three-way. The page is a new
`leavewar/ui/ApprovalsPage.tsx` drawn in the grid card's place; the grid stays mounted behind it (its scroll and window
of months kept for "Back"), never repainted by the list.

**The writer for Approve, Refuse and Approve all.** None today takes a list of `{personId, date, recId}` with approve and
refuse mixed and returns a result per line (`setBidStates` works per cell and decides both halves; `decideRequestById` one
record a command; the door's `why[]` is a list of sentences tied to nothing, and a record not found is skipped with no
reason). New: `store.ts decideRequests(items)` → `{ results: [{ id, done | refused(reason) | stale(who, what) }] }`, ONE
`gesture('lw.decide')`, every item checked FIRST (the open week, the clash rules, the state it was drawn from) so no inner
refusal ever reaches the Inputs write — **a refusal inside the inner command rolls back the whole outer one** (the survey §3:
`changeAbsenceById`'s comment; `doorApprove` returns done 0 when its Inputs write is refused). The door returns its reasons
keyed by item. Deciding reaches the war that holds each date (`listAt` / `warHolding`), so a request in another period is
decided in its own war; Undo returns to the war on screen (`gesture` scope).

**The list's figures.** "Lowest Avail" cannot use the bid window's what-if as it is (on a day holding the pending bid it
falls to `standingWhatIf`, which lists every amber or red row, the request's or not): call `engine/whatif.ts dayWhatIf` on
the day rebuilt WITHOUT just that request (not the whole date — the other half kept, as `engine/counters.ts fillRow`
does) with the request's own code; `avail` null gives "SANS · not in Avail". Required read a month at a time
(`sync.ts flyMonth`, as `manningRedDays` does). Worked out once when the tab opens or the war changes. DAYS: the days the
request takes off LVE (`engine/charge.ts`), so it agrees with LVE Bal — the day panel's calendar-day count is not used.
A line is one request run: the store's `reqRunKey` / the door's run rule (the same code, state, remarks, till and
documents, consecutive dates, one war) — the same grouping one approval turns into one Input.

**The line's pieces.** The left half reuses M3's `leavewar/ui/LeaveLine.tsx` (Raptor's own puck through `sync.ts puckHtml` —
lesson 25, never a look-alike; the code map's "the war's name-cell look" is wrong) with slots for the posting tag (`sync.ts
postingPendingTag`, today used only by Admin → Users), and without its "Pending" word. The paperclip: `ui/icons.tsx
ClipIcon` (the Inputs list's), its count when two or more (new). **Nothing on the war opens a document today** (M3's
"DocViewer's read-only form" and its reading 5 were not built): `ui/DocViewer.tsx` takes an Input-shaped row with "Edit
input" and "Upchit" in its foot — a request form of it, read only, opened through the `sync.ts` seam, built here and used
by the paperclip and by every document chip on the war (DayList, the bid windows' Document row).

**The grid after a date tap.** The grid has no just-added ring today; the ring on a cell is view state outside the
`PersonMonth` memo (`docs/performance.md` §E), six seconds, `docs/design-practices.md` §4's one mark. `store.ts focusDay`
lands the date; its `{open}` opens the cell's window, which is not wanted — a focus ask that rings without opening. The slim
bar is new (the nearest precedent the move banner). A SANS man with SANS off is not in `state.people` at all
(`reprojectRoster`), so `PersonFiguresSheet`'s guard opens nothing: the person window must take a man off the roster
(`sync.ts warIdentityIfHidden` is the pattern).

**The bell.** `state/notices.ts` — new `NoticePart` kinds (a war decision with its code, dates and what; bidding open /
closed with the dates; taken back), their words in `partWords` / `noticeWords`, `noticeLive` merging the bidding lines.
Written by a `tellDecisions(before)` and a `tellOpenings(before)` inside `store.ts gesture`, beside `tellHolidays`, through a
`sync.ts` hook that writes via `commitInputs(SCHED_TYPES.inputsWrite, …)` as `tellHoliday` does — a refusal changes no
input, so the hook must enlist the scheduler's store itself. B1: in `state/sched-commit.ts tellPass` (or `noticePass`), when
the envelope is a war door type (`lw.*`, but not `lw.postout` / `lw.postoutRun`, which keep telling, nor `lw.file`), skip
any input whose before or after carries `lw`. Bidding: `store.ts openDates` / `closeDates` / `setStretch` (`writeOpen` →
`lw.open`); "who" is `state.viewer`.

**Permissions** (`state/perms.ts`, `docs/data-model.md` §11, together — D200). `ownershipViolation`'s `case 'notices'`: an
admin's war command may write the new kinds; a member's war command writes none; a member's Inputs filing that replaces his
bid rides its own input's id. §11's Notice sentence ("written only inside the change to the input it names … and one more
writer, the holiday") and §3's "the one place a command of the war writes a Notice" are reworded. The new `apprseen` row;
NoticeSeen's admin read. `leavewar/permsparity.test.ts` gains Approve all and the bidding notices.

**No other branch touches these files** (27 Oct 26: the one active branch, the handoff review, changes notes only).

## 5. Put to him before the build — one look and two questions (D853, D1222; the page names each picture)

**ANSWERED 27 Oct 26 — "All as recommended": L1 → D1420, Q1 → D1421, Q2 → D1422; the readings below stand, none struck.**

**L1 — Approvals as a tab's page** (`full/r22-1-desk`, `r22-2-desk`, `r22-5-phone`; the tab row's own place on the phone
re-measured in the build). Recommended: as drawn — the page takes the grid card's place, the list held to one eye-span on a
wide desktop, the phone's two-line requests.
**Q1 — a line just decided stays where it is, lit, until he leaves the tab** (`r22-3-desk`). Recommended yes: a slip is put
right with a second tap and nothing moves under his finger; the count and "Approve all" count only what is still pending.
The other way: the line leaves the list at once (an Undo brings it back).
**Q2 — a member told when an admin places leave on his row already approved** (`r22-7-bell-phone`; the register's P2).
Recommended yes: "Your leave · Mon 9 Mar · LL added and approved · Saber". Today he is told nothing.
*(A third question, whether bidding that ends by its last date alone rings, was dropped after the fresh read: D1214 ruled
the register's P7 in as written, and P7 counts "its last day passes" as closing — it is built, 9.4.)*

**Readings built as recommended and named at his look, his to strike — none blocks the build:**
1. The tab's count is every pending request, in every period; the list shows the period on view, with "+N pending in
   JAN – DEC 27 ›" where another period holds some.
2. A request placed over several days is one line; DAYS is what it takes off LVE (a weekend inside it not counted).
3. Bidding lines go to everyone on the war but the admin who did it; a run of month taps is one line per stretch.
4. Undo of an open or a close follows D1216, as a decision's does.
5. A bid replaced by a member's own filing tells him nothing; by someone else's, one line, the Inputs one, naming the bid.
6. A request saved before M4 shows a dash for "placed" and sorts first.
7. The bell's "taken back" needs an admin's device to read whether the member read the line — a permission widened.
8. Every document chip on the war opens the document, read only.
9. An admin moving or deleting a member's pending bid tells him (9.7).
10. A posted-out man's pending request: tagged "posted out 14 Oct"; Approve refused on the line, Refuse works.
11. Bidding that ends by its last date tells everyone "bidding closed · its dates ended", with no name (D1214, P7).

**Records of each answer:** a ruling row in `leave-war.md` the moment he answers; Q2 also in
`docs/notifications-register.md` (P2 ruled or struck); reading 9 a new register line (proposed, his to strike).

## 6. The roll-call seed (bug-check order §6) — the builder fills every cell: has it / must not, because… / MISSING

**A pending request** (every place one is drawn, for its new "placed" and "decided" and its line): the grid cell
(`PersonMonth`); the bid windows on it (member own, admin any); the day's list (DayList); the day panel's Away line; the
entry window's "Placed · Decided" lines (`r7-13`); My leave's figures (M2); today's person window (D1148); the OIL tracker
for an OIL request; the Approvals line, desktop and phone; the clash note (`Chrome.tsx`); the Manning red-days list.
**A decision** (where approving or refusing is done, so each agrees with Approvals and writes the same line): the bid
window's Approve · Refuse; the drag-selection window; the day's list; Approvals' line; Approve all; "Approve what I enter";
Undo and Redo of each; a decision on a request in another period (`warHolding`).
**A notice** (where the bell's lines show): the bell list on a phone and a desktop (`ui/topbits.tsx`, `Shell.tsx`); its
count; "Mark all read"; a tap on each new kind (the grid at that day, ringed); the Inputs-page lines B1 must not double;
the war's grid notice for a replaced bid; the changes window (must not show a notice).
**The date tap and the ring:** a request on screen; off screen to the right and left; in another period; a SANS man with
SANS off (his person window); a posted-out man; the slim bar's Back after a scroll; ✕.
**A document:** the Approvals paperclip; DayList's chips; the bid windows' Document row; the Inputs list (unchanged); the
viewer's foot on a request (no "Edit input", no "Upchit").

## 7. The walk (sized at the build in `docs/walk-ledger.md`; expect WIDE — two roles, phone 402 × 874 and desktop 1536 × 860 at his 125%)

Sonnet walkers take the pictures, the host opens every deciding one (D787, D1271, D1273); a picture within about 100 ms of
each phone lift (D1281); a test that changes the data directly never stands in for a press (D608). **§7.11's lessons, each
given its scenario:** 1 (states) — the table of a line's states below; 2 (speed) — Approve all's two taps fast and slow, a
quick flick through the list; 3 (feedback) — after each press, what shows it happened (the lit button, the count, the bell's
dot) and what is out of sight (a refused line below the fold after Approve all); 4 (the page behind) — with the slim bar
up, press the grid; 5 (brought into sight) — the ringed cell against the frozen columns, the slim bar, the month bar; 6 and
7 — nothing is handed to the phone itself here (no new scrolling of its own, no keyboard work); the walk says so.

**A line's states × what it shows** (lesson 1): pending · approved here (lit) · refused here (lit) · back to pending (second
tap) · refused by the clash rules · decided elsewhere since (stale) · deleted since · a SANS man · a posted-out man · with
documents (0, 1, 2+) · a half day · a run over a weekend · an OIL and a CCL request · placed by someone else ("by …") · saved
before M4 (dash) · a man archived or transferred since he bid · on a locked, published week (the door's "locked week"
refusal, not a clash) · a leave across the period boundary (two lines, one in each period — B3) · joined from bids placed at
two times (the earliest shown). Each cell a scenario or a named test.

1. Admin, desktop: the tab, its count; the list oldest first; every column against the request's own figures on the grid
   and in the bid window's day line.
2. Approve one → lit, the tab count and "Approve all" fall by one; Undo → back, the screen where it was (D672); Redo.
3. Second tap on the lit Approve → pending again; the same with Refuse.
4. Approve all across Jan with one line the clash rules refuse → the rest approved, the refused line says why; ONE Undo
   brings every line back; the members' bells: one line each, none twice.
5. Pick dates…, a month, New: "Approve all" approves exactly what shows — a pending request outside the filter untouched.
6. Stale (B8): the war carries no change across browser tabs today (`[LW-NIGHT1025-OLDER]` (b)), so two contexts cannot
   prove it — a unit test feeds the writer a line drawn from an older state; and in one browser: arm Approve all, tap a
   listed request's dates, delete that bid on the grid, Back — "Approve all" is disarmed and recounted, the deleted line
   says "No longer there".
7. A date tap: the Grid tab, the grid there, the cell ringed about six seconds, the slim bar; Back → the list where it was;
   ✕; a SANS man with SANS off → his person window; a request in another period.
8. The paperclip → the document, read only; its count with two.
9. The member's bell, for each case of 9.1 (approved, refused, put back, moved, deleted, replaced) and 9.7 — one line, the
   words, the tap → the grid at that day ringed; a SANS man with SANS off → his person window; no Inputs-door line beside
   it (B1); an Inputs-page change to the same leave still tells him once; a member's shared filing over another man's
   pending bid lands (9.8).
10. Undo of a decision he has not read → its line gone; one he has read → "… taken back · Saber" comes; then Redo → "LL
    approved again · Saber", unread, on top.
11. Bidding: open four months by four taps → one line per member; close → one line; the admin himself none; a tap → the war
    with that stretch in view; Undo.
12. A member's own move and delete of his pending bid → no line for him; the admin's "Also since you last looked" lists the
    withdrawal; Inputs-page leave landing on the war lists there too.
13. Phone: the tab row with Approvals; the two-line requests; New and the months in two rows; Approve all; the slim bar; a
    picture after each tap.
14. Reload after 2, 4, 10, 11 — the stamps, the decisions, the lines, the read marks and "last opened" all kept (the built
    bundle, browser storage).
15. A member: no Approvals tab; nothing of Approvals reachable by the keyboard or a typed address; an admin who switches to
    member view while on the tab is taken off it (D292).
15a. The keyboard and a screen reader: the tab order through fifty lines, the lit button read as pressed, the armed and the
    refused words announced.
15b. Reload, or the page dropped, while on the tab → the "last opened" moment kept; the next visit's New counts from it.
15c. The count with a pending request in next year's period while this year is on view; "+N pending in … ›".
16. Speed (§E, the built bundle, before and after): the grid's node count with the tab used and left; the tab opening with
    fifty pending requests; a decision → the grid's repaint counted (`PersonMonth` draws).

## 8. The checks — the FULL row of the checking order, whole (`docs/bug-check-order.md` §5, §7.0)

The rules sweep; scenario design by a fresh model other than the builder (§7 above is its seed, not its replacement); the
roll-call (§6); the door check; the walk sized and walked (§7); the break tests (each new guard broken on purpose goes red);
the demo seeded with pending requests, documents and a SANS man so the walk has them; GitHub's run of the pull request as
the full check while the repo is public (D1086), the changed tests on his PC; **one fresh, blind Opus read of the finished
code** (D790) **and the security read** (D1411 — who may write a notice, the read-mark widened, a member reaching
Approvals' writer, a forged placer); the fixes red-first, the re-walk of what they touched; the evidence sheet with its
`Walk:` line; pictures for his look; "merge live" his. Owed and written on `[NO-ASTRA-LIST]` (D761): the two ChatGPT
reads FULL wants and the other provider's scenario design.

## 9. Open points and records

**Left to the build — technical (the builder decides and says what he did):** the writer's exact shape, its per-item
reasons and the new ids it returns; where "also since" reads from (8.4); the focus ask that rings without opening; the request form of the viewer;
the off-roster person window; merging the bidding lines.

**The fresh read of this spec** (27 Oct 26, one blind Opus reader): 15 findings, all taken — 8.1's count, 8.2's
posted-out and joined lines, 8.3's re-keying and "leaving", 8.4's moment stored, 8.5's disarm, 9.3's Redo, 9.4's ending
date (Q3 dropped), 9.6's off-roster tap, 9.7, 9.8, §3's follow-up writer, and the walk's states and steps.

**Not in M4:** the member's side of "since your last visit" and the person window (M5, A1); the Balances tab (M5); the
document reminder the day before a leave (the register's P1 — later, D1150); M3's leftover (8), the silent 20-document cap,
and the two older walk finds (an approved leave's window without "Back to bid"; a drag with a selection window open) — they
stay on `[LW-OVERHAUL]` unless he moves them.

**Records the same change carries:** `docs/data-schema.md`, `docs/data-model.md` (LeaveBid's four fields, the Notice
kinds, §11's Notice, NoticeSeen and the new row), `docs/notifications-register.md` (R1 built; P4, P7, P8 built; P2 and P9
as ruled), `docs/ui-contracts.md` (Approvals, the slim bar, the ring on a cell), `docs/feature-impact.md` (Approvals; the
bell's Leave War lines), `docs/file-map.md` (`ApprovalsPage.tsx` and the new tests), `docs/performance.md` §E (the
measures), the walk ledger and the evidence sheet; this spec linked from `[LW-OVERHAUL]`; the build plan's §2 table and M4
row as this spec corrects them. Typecheck with `npm run build` (`tsc --noEmit` reports nothing here); check the
browser-test port is free before a run.
