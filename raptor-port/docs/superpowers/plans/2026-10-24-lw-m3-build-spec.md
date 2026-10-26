# The Leave War overhaul's M3 — placing leave: the build spec (night of 23–24 Oct 26)

**What M3 is.** The third of the five merges of the approved build plan (`2026-10-22-leave-war-overhaul-build-plan.md`,
D1250): batch 5 (the bid windows), batch 6 (the day panel), batch 7 (documents), with four small backlog items folded in
([LW-ENTERED-DATE-UTC], [LW-M1-READ-LEFTOVERS] parts 1, 2 and 4, [LW-MONTH-MEMO-UNPINNED]). Branch
`claude/lw-m3-placing-leave`, cut from `main` at e2e646bed. Tier FULL (a new admin command; documents saved on the war's
records and carried into the Inputs; a permission row widened); one fresh, blind Opus read of the finished code (D790), the
ChatGPT reads owed on `[NO-ASTRA-LIST]` (D761).

**Rulings it carries** (open each full row before acting on its detail — `grep -h '^| D1144 |' .claude/decisions-full/*.md`):
D1144, D1183, D1147 (narrowed by D1186, D1187, D1182), D1153 (pin only), D1159, D1212, D1213 (D1243 narrows only the
Manning count), D1210, D1226, D1143, D1198, D1150, D1179 (filed in `inputs.md`), D1151 (register line only), D1217
("pending", never "waiting"), D1246 (halves .5), D1175 (look F), D1158 (no Ack), D418 (the below-zero ask stays), D264 /
D331 (one format for both sheets), D1225 / D1176 (the closed-day note), D1263 (Undo onto a closed day), D1166 (the Inputs
page is never stopped), D1008 (a member reads every row), D1227 / D1272 / D1274 / D1277 (the bid bubble — built in M2,
must keep working), D672 (Undo leaves the grid where it is), D641 / D642 (windows don't block), D1281 (the press checks).
The red team's fixes it carries (design note §10.2): A1 (the one-line leave row, built here for M5 to reuse), A2, A5
(the phone half), A8, A9, A12 (pucks in the day panel), B9.

**Written by a helper from the plan and the rulings; the builder verifies each line against the code before acting.**
Every file, function and line number below was read on main at e2e646bed on 23 Oct 26 and may have moved.

## 0. Before starting — what is settled and what is not

- **Nothing M3 needs from him is open.** §2 of the build plan names Q7 for M2/M3 — answered (D1213). The remarks questions
  are answered (D1210, D1226); the words are answered (D1212, D1217, D1246). No ruling says M3 waits on a look.
- **Gaps in the build plan's batch list, filled here:** D1210 and D1226 (remarks and the till tick on a request), D1212
  ("Date" / "Duration"), and D1213 (the Available rows named in the day line) all say "built with M3" in their full rows
  but are not in the plan's batch 5 list. They are in this spec (§1, steps 5.8–5.10).
- **The drawings of record** (`raptor-port/docs/mock/lw-overhaul/full/`): `r9-remarks-bid-phone.png` (the member's bid
  window with Date / Duration / Document / Remarks — the newest), `r9-remarks-closed-phone.png` (his pending bid on a closed
  day: Delete, Document, Remarks), `r7-11-bid-admin-desk.png` and `r7-12-bid-admin-phone.png` (the admin's tick, the "Also"
  row), `r7-13-entry-desk.png` (a placed entry with its document chip), `r7-05-day-phone.png` / `r7-06-day-desk.png` (the
  day panel), `../r1q4-a3-stacked.png` (the day line's stacked rows). **They predate D1212, D1217 and D1246**: build
  "Date", "Duration", "Pending", "14.5" where a drawing says "How many", "How much", "Waiting", "14½".
- **Not M3:** the "Placed · Decided" lines drawn at the top of `r7-13` are who placed a request and when — a stored field of
  batch 8 (M4). The document icon on an Approvals line (D1178) is M4. The person window and My leave's one-line list are M5
  (A1) — M3 builds only the shared row and uses it in the day panel.
- **A parallel branch touches the same files (D302).** `claude/lw-phone-pinch-zoom` (pull request 568, awaiting his iPhone
  look) changes `leavewar/ui/Matrix.tsx`, `select.ts`, `matrix.css`, `bidpicker.css`, `chrome.css`, `FlyRows.tsx`,
  `Chrome.tsx` and `e2e/leavewar.spec.ts`. Before changing those, message that chat (ListAgents, SendMessage) with what you
  will change and leave, and repeat it in this branch's HANDOFF block; whichever merges second brings `main` in first (D78).
  The date-heading tap (step 6.1) is the likeliest clash: pinch to zoom also reads presses on the grid's header.

## 1. Batch 5 — the bid windows

Places: the one-day window `leavewar/ui/BidPicker.tsx` (`BidPicker`, ~1200 lines) and the drag-selection window
`leavewar/ui/SelectSheet.tsx`, both wired in `leavewar/ui/Matrix.tsx` (BidPicker ~4335, SelectSheet ~4056). Their rows
today: header (who · date · "now X" · ✕) → How many → Decide → Selected (Move · Delete · Note) → How much → Which leave →
the admin's +OIL · PO · PI row.

**The row order after M3** (one order for both windows, D264/D331, a row with nothing to act on not drawn):
title bar (who · date or span · [admin: ☑ Approve what I enter] · ✕) → **the day line** → Date → Decide → Selected →
**Document** → **Remarks** → Duration → Which leave → **Also** (admin). On an empty day this reads, as `r9-remarks-bid-phone`
draws: day line, Date, Duration, Document, Remarks, Which leave — so Duration moves above Document there. *Builder's call
(technical — keep it identical for both states if cleaner):* on an empty day put Duration directly under Date, as the
drawing; on a day holding a bid keep Decide · Selected between them.

**5.1 The day line (D1144, D1213, D1198's lesson 20 and 29).** At the top, one line: the Available row of the person's own
seat, before → after the bid, then each Manning row the bid would turn amber or red on its own line, flush left, names in
one column, figures in a second ("IP  16 → 15 · amber"), each in its colour; where none would, one calm line. Words
(agent's, as drawn): "Available P 24.5 → 23.5 · red"; the calm line "No manning row turns amber or red". The Available
row's name is the settings' own (`sync.ts availRowNames()`), never a typed "Available P". An Available row at amber or red
counts as a turned row (D1213). It follows Duration (a half lowers by .5) and the range as they change; the kind of leave
does not change it (every leave lowers manning — D998). A man who moves no Available row (a SANS man, ground crew — D626,
`countsFor`) gets no Available line, only the Manning lines or the calm line.
- New pure engine module `leavewar/engine/whatif.ts`: `dayWhatIf({ people, grid, states, requirements, views }, personId,
  dates, portion)` → `{ seat: 'p'|'w'|null, avail: { before, after } | null, turned: Array<{ ruleId, label, before, after,
  level: 'amber'|'red' }> }`, using `evaluate.ts evaluateDay` and `availrows.ts availHave` on the grid with the bid added
  (the same "with the bid added" the store's `counters.ts withFill` does for balances — reuse its shape, do not write a
  third), and the Available points through `sync.ts availVerdictAt`. Only days the store would write count
  (`cellProblem` refuses the rest — as `balanceAfterFill` already does).
- **A range or a drag across several days:** one line set for the worst day — the day whose Available figure falls lowest
  — with its date first ("Tue 27 Jan · Available P 24 → 23 · red"). *Agent's reading* (§7, point 1).
- **A drag across several people (SelectSheet):** the same, worst person-day, the callsign before the date. *Agent's
  reading* (§7, point 1).
- Computed only while the window is open and only when its inputs change (open, Duration, range) — never on the grid's
  render (`performance.md` §E). Wire it from Matrix where the store objects already are, as `balanceAfter` is (~584).
- Tests (red first): `leavewar/engine/whatif.test.ts` — for each of a pilot, a WSO, a SANS man and a half day, the what-if
  equals `evaluateDay` read after the real `setCell` (the property that keeps the two from drifting); a bid turning an
  Available row amber names it (D1213). `leavewar/ui/bidwindow-dayline.test.tsx` — the line's text, the stacked rows in DOM
  order with names and figures in separate cells, the calm line, Duration AM changes "→ 23.5", a range names its worst day.

**5.2 The balance on every leave button (D1144, D1153 pinned, D1246).** Each button reads its code and what is left NOW
("LL 14.5", "CCL 0", "OL −1.5") — the figure the grid's balance column shows (`balanceAfterFill(...).before`, one call per
code; the LL and OL buttons share LVE, so they show the same figure). A kind that spends nothing shows no figure. A
negative figure is drawn in the app's red, as `r7-11` draws. Halves ".5", never "½". The "tap again" ask before a balance
goes below zero stays exactly as built (`belowzero.ts`, D418). **SelectSheet with one person:** his figures; **with several
people:** no figures on the buttons (the below-zero ask still names each man) — *agent's reading* (§7, point 2).
- Tests: `ui/bidding.test.tsx` (extend) — the eight figures for Ranger in the demo, "−1.5" for Anvil, ".5" never "½";
  `state/balanceafter.test.ts` (extend) — pin D1153: placing a bid lowers the figure the button shows next time at once.

**5.3 The buttons in their kind's colour (D1183, D1175).** LL light amber, OL deep amber, OIL green, CCL FCL PL EL CL blue —
the same colour classes the grid's boxes use (share the kind map M2 built for look F; find it in `MatrixRows.tsx` /
`matrix.css` — do not copy the colours). A button whose figure is 0 or below keeps its colour, dimmed, and stays pressable.
+OIL, PO and PI keep their own looks.
- Test: `ui/bidding.test.tsx` — each button carries its kind's class, the dimmed class at ≤ 0; `ui/lookf.test.tsx` (M2's) —
  one assertion that the button class and the box class come from the same map.

**5.4 Filled or hollow by the tick (A8).** A member's leave buttons are always hollow and dashed (the pending look). An
admin's are filled (the approved look) while "Approve what I enter" is ticked, hollow and dashed when unticked.
- Test: `ui/approvewhatienter.test.tsx` (new) — the class flips with the tick; never filled for a member.

**5.5 "Approve what I enter" (D1147, D1186, D1187, D1182).** An admin's windows only — the one-day window and the
drag-selection window alike (D1187's reading) — in the title bar at its right end, before ✕, a tick labelled "Approve what
I enter", **ticked each time the window opens**; an untick lasts only while that window is open. While ticked, whatever he
places, on any row, is approved as it is placed: one press, one command, one Undo.
- **The new admin command.** `leavewar/state/store.ts`: a writer `placeApproved(cells, code)` running ONE gesture of a new
  type `lw.placeApproved`: inside it, the same per-day write as `writeMany`/`setCell` (so every refusal stays the store's
  one rule — `cellProblem`, posted-out, occupied, `dayWritable`), then `DOOR.approve` for exactly the requests that write
  made (find them by id after the write — `setCell` returns only a boolean today; have the shared body return the new
  record ids). `gesture` joins nested calls (it returns `fn()` while a commit is running), so this is one envelope —
  `setBidStates` already does write-then-approve this way under `lw.decide`. Gate: `canDecide(state.role)` at the top, as
  `setBidStates` has.
- **A day the approval refuses** (`doorApprove`'s skips: a locked week, leave or a medical already there) keeps its bid,
  pending, and the window stays open and says which days and why, in `doorApprove`'s own words ("3 Feb is on a locked week —
  not approved"); the rest are approved. Never a whole-window failure.
- **Permission (D200), the same change:** `state/perms.ts COMMAND_OPS` — `'lw.placeApproved': op(T.bid, 'U')` (admin, no
  member path, like `lw.decide`); the store's `cmdDefinePermission` list beside `lw.decide` (~1496); `undo/describe.ts` — its
  words ("placing and approving leave"); `docs/data-model.md` §11 `LeaveBid` admin column — add "place and approve in one
  step (D1147)". `leavewar/permsparity.test.ts` then fails until both exist — run it.
- **What it must not change:** the approval still writes the Input through the absence door with `lw` and is stamped
  placed by the admin now (`stampPlaced`); `state/notices.ts noticePass` still skips a new war-approved input (the bell's
  decision line is M4, D1142); the bid bubble (D1227/D1272) still rises when the approved leave turns a row amber or red.
- Tests (red first): `ui/approvewhatienter.test.tsx` — the tick is in the title bar, checked on open, absent for a member;
  untick, close, reopen → ticked; ticked + LL on Ranger's empty day → an Input with `lw`, no request left, the box filled;
  one Undo takes both back, Redo puts both back; unticked → a pending request as today; a range ticked across a locked
  week → the rest approved, the refused days named, their bids pending; the drag-selection window the same.
  `state/store.test.ts` — `placeApproved` is one command (one Undo step, one envelope) and does nothing for a member.

**5.6 Two even rows of four, and "Also" (A9).** "Which leave" is a grid of four columns on every width — LL OL OIL CCL /
FCL PL EL CL — as `r7-10`..`r7-12` draw (his lesson 28). The admin's +OIL · PO · PI stand on their own row labelled "Also";
a member has no Also row. In SelectSheet, Also holds PO (one person only, as today).
- Tests: `ui/bidding.test.tsx` — the Also label for an admin, none for a member; e2e (§6) — at 402 and 1440 the eight
  buttons sit in two rows of four, equal widths (measure each button's top and width).

**5.7 On a phone the tapped cell stays in sight (A5, phone half).** When a bid window opens on a phone and would cover the
tapped cell, the grid first scrolls so the cell sits just above the window's top edge. The desktop is untouched (its
window does not block — D641/D642). Undo leaves the grid where it is (D672) — this scroll is only at opening.
- Test: e2e at 402×874 — tap a cell in the lower half of the screen; after the window opens, the cell's bottom ≤ the
  window's top; a cell already clear of it does not move.

**5.8 "Date" and "Duration", everywhere the same two things are asked (D1212).** BidPicker's "How many" → "Date",
"How much" → "Duration"; SelectSheet's "How much" → "Duration"; the Inputs page's input window's "When" row
(`ui/inputedit.tsx` ~2995) → "Duration", and its SpanPicker's group name "How much of the day" (~175) → "Duration". The OIL
panel's "Days" box stays (it asks a number, not these). Grep the whole `src/` for the old words and the tests that read
them (`movestandard.test.tsx`, `selectsheet.test.tsx`, the inputs window tests).
- Test: one assertion per place that the row reads "Date" / "Duration"; a grep-style test is not needed.

**5.9 Remarks on a request (D1210), with the till tick (D1226).** A Remarks box on the bid window — on an empty day for the
bid about to be placed, on a day holding a bid for that bid — and on the closed-day window for his own pending bid
(`r9-remarks-closed-phone.png`). It works exactly as the Inputs page's: the typed words only in the box; after it, in grey,
"till <date>" from the request's dates (its last day; for a placed multi-day request, the last day of its run), with a tick
before the date — ticked by default for leave (D952); unticked, the date is struck through and no screen prints it; a hand
choice is kept only where it differs from the default (D953); two-digit year (D1095). Reuse the Inputs page's own pieces
(`engine/inputs.ts tillOfISO`, `tillDefaultISO`, the window's `inped-tl` markup) — do not rewrite them. A member writes his
own request's remarks, an admin any. On approval the remarks and the tick go into the Input (D1226's reading), so the
Inputs page shows the same; on a put-back they come back to the request.
- **Saving:** on an empty day the box is part of the bid the leave tap writes (no extra press). On a day holding a bid,
  saved when the box is left or Enter pressed, as one command of type `lw.reqmeta` (5.10); nothing saved if unchanged.
- **Stored data:** see 7.1 — the request's `remarks`, `till`.
- Tests: `ui/bidremarks.test.tsx` (new) — the box and the grey "till 23 Jan 26"; a range moves the date; unticked strikes it;
  the placed bid carries both; approval → the Input's `remarks` and `till:false`; Undo; the Inputs list shows the same
  remark; a member edits his own pending bid's remark on a closed day (ClosedNoteSheet) and it saves.

**5.10 Document above "Which leave" (A2, D1159).** The app's one Document button — `ui/inputedit.tsx DocField` (upload
arrow and "Document"; "Add" once a file is there; each file a chip with its ✕). On an empty day a file picked first is held
by the window and goes onto the bid the leave tap writes (one command with the bid); ✕ before the tap drops it. On a day
holding a bid, a file picked is added to that bid at once — one `lw.reqmeta` command, one Undo. On the closed-day window,
beside Delete (as drawn). A chip's name opens the document (DocViewer) — *agent's reading*, §7 point 5.
- **How the war reaches it — no fifth seam:** import the button and the document helpers through `leavewar/sync.ts`
  (re-export `DocField`'s data helpers `docAdd`, `docGet`, `rowDocIds` and a `openDocs(ids, title)` door that sets
  `ui/pops.ts DOCVIEW`), as a rider on that seam — the war already reaches Raptor's input window that way for remarks.
  The DocViewer (`ui/DocViewer.tsx`) today takes an input row and draws an input's footer actions; give it a read-only
  form for a war request's list (no edit buttons — a request is changed in its window). Read DocViewer whole first.
- **The new command `lw.reqmeta`** (a request's documents and remarks): `perms.ts COMMAND_OPS 'lw.reqmeta': op(T.bid, 'U',
  'optional')` (his own row, like `lw.edit`); the store's writer `setRequestWords(personId, date, recId, { remarks?, till?,
  docIds? })` — gated by `canEditRow` only, **not** by `dayWritable`, so it works on a closed day (D1150: "even after its
  dates are locked"); it writes every record of that request's run (same person, same code, consecutive days, same
  remarks) so one bid of a fortnight carries one set of words — *technical; verify the run rule against `doorApprove`'s*.
- **The commit's open-day check must let it through, and only it (perms.ts, the `lw.cell` case ~811):** today a member's
  change on a day not open for him passes only if it takes his pending bids away (`onlyTakesPending`) — a document added
  would be refused "a war day not open for bidding". Add: under `env.type === 'lw.reqmeta'`, a change whose before and
  after hold the same records, the same ids, codes and states, differing only in `remarks`, `till` and `docIds` of his own
  pending requests, passes. Undo and Redo of such a step are the same kind of change, so D1263's check is not reached —
  pin that it still refuses a Redo that puts a bid back (the D1263 block of `opendates-store.test.ts` stays green).
- **§11 (D200), the same change:** `LeaveBid` member column — "on a day not open for him, his own pending request's
  documents and remarks may still change (D1150, D1210)"; `Attachment` — unchanged (C R own, R every member — D211).
- Tests (red first): `leavewar/lw-commit.test.ts` (or `state/lw-commit.test.ts`) — on a closed day a member's `lw.reqmeta`
  adding a document to his pending bid commits; the same command changing the code, adding a request, or touching another
  man's row is refused; his Undo and Redo of it commit. `ui/biddocs.test.tsx` (new) — DOM order: Document before Which
  leave; pick then LL → the bid's `docIds`; ✕ then LL → none; on a held bid a pick writes at once (one Undo step).

**5.11 A re-typed bid keeps its words.** Today `setCell` on a day holding a live request of the same half replaces it with
a fresh record (`store.ts` ~2955). Carry the replaced request's `remarks`, `till` and `docIds` onto the new one, so
changing LL to OL never loses a document. Test in `ui/biddocs.test.tsx`.

## 2. Batch 6 — the day panel (D1143, D1198; A1's row, A12)

**6.1 The tap.** A tap (a click on a desktop) on a date's heading opens that day's panel — on a phone and a desktop. The
headings are drawn in `Matrix.tsx` (~2079–2096, `<th className="day …">`); on a phone the frozen header band repeats them —
find its builder and cover both. One listener on the header row, the date read from an attribute on the `th`
(`data-d`) — no button inside each heading (the grid's node ceiling, `probes/perf-port.cjs`, and `performance.md` §E). The
tap must not arm a selection or a month drag (`ui/select.ts` — check what a press on the header does today) and must not
fire at the end of a pinch or a scroll (coordinate with the pinch branch — §0). Keyboard: the day panel's ‹ › step from the
heading the panel was opened on; one heading — today's, else the first drawn — takes Tab and Enter opens it (*technical
reading*; 365 tab stops would be worse).

**6.2 The panel.** New `leavewar/ui/DayPanel.tsx`, in the app's `ui/FloatWindow.tsx FloatWin` with `rests` — the same
window the SANS calendar's day uses (`ui/SansDay.tsx`), so it comes up from the foot on a phone and floats on a desktop
"as the Inputs and SANS calendars' day does" (D1143, D997). Non-blocking: the grid behind it works (D641). Its content, top
to bottom (`r7-05`, `r7-06`):
1. The title "Tue 27 Jan" with ‹ › to step a day; stepping crosses months and periods — every figure read from the period
   holding that date (B3; `sync.ts dayFacts(iso)` already does) — and a date no period holds says "No leave period covers
   this date" with dashes, never 0 (as SansDay).
2. A day not open for bidding says so on its first line (D1198's reading): for a member "Not open for bidding"; for an
   admin the same words. *Words agent's; shown at his look.* Also the day's events at its top, one line each with their
   full names — the agent told him so on his page (round 20: "tap the date, the day panel lists them at its top") before
   D1259 kept the Event rows; not a ruling — §7 point 6.
3. The figures, each on its own line, names in one column and figures in another (lessons 20, 29): the Required P and
   Available P lines, the Required W and Available W lines (their names from settings — D1193, D640), then every Manning
   row with that day's figure, each in its amber or red (the same verdict its cell wears — read `evaluatePeriod`'s result
   Matrix already holds, `verdicts[date]`, and `availVerdictAt`). Halves ".5".
4. "Away · N": one line per person away that day — everything the grid shows lowering that day's manning (leave, a
   medical, a course, an overseas duty, a bid not refused — D998) — each the shared one-line row (6.3). Pucks, not plain
   names (A12, lesson 25). Sorted as the grid's rows are (the page order). **Never a remark** — not the request's, not the
   Input's (D1143). A member sees every man's line (D1008).
- Lines are read only in M3 (no tap) — §7 point 6.
- **Speed (§E):** the panel is drawn outside the grid; its open state and its day live in a small listener set (as
  `ui/warask.ts` / `state/screen.ts`), never in a store field the grid's rows read — opening it, stepping it, or a bid
  placed with it open repaints no `PersonMonth`. It follows the store (its figures change when a bid lands, an Undo runs).

**6.3 The shared one-line leave row (A1).** New `leavewar/ui/LeaveLine.tsx`: puck · the kind's look-F box (filled approved,
hollow dashed pending, grey struck refused — reuse the grid's classes) · dates (the run: "26 – 28 Jan", from the Input's
dates or the request's consecutive run) · days ("3", ".5") · state ("Approved" / "Pending" — D1217; an Inputs-page medical,
course or duty reads its kind's state the same way as the grid). Built once here; the person window (M5) reuses it.

- Tests (red first): `leavewar/ui/daypanel.test.tsx` (new) — a header tap opens it with its date; ‹ › steps, across a month
  and into the next period; the figure lines' names and figures in separate cells, amber and red classes; the Away lines
  (puck, box, "26 – 28 Jan", "3", "Pending"); a request and an Input both carrying remarks → no remark text in the panel;
  a member's closed day → the first line; a date no period holds → the note and dashes. `matrix-rows-memo.test.tsx`
  (extend) — opening and stepping the panel renders no `PersonMonth`. e2e (§6) — phone from the foot, desktop floating,
  the grid's node count unchanged within its band.

## 3. Batch 7 — documents (D1150, D1159, D1179, D1151, B9)

**7.1 The stored request (D473 — data-schema and data-model in the same change).** `leavewar/engine/warrecs.ts RequestRec`
gains `remarks?: string` (≤ `MAX_CARRIED_REMARK`, 200), `till?: boolean` (only a hand choice against the default) and
`docIds?: string[]` (each a `state/docs` id; cap the count, e.g. 20). *Technical recommendation:* move the request's words
out of `carried` — `carried.remarks` today is the only remark a request has and approval already reads it — so `carried`
keeps only `lwMoved`; the reader (`readRecBody` ~312, `readCarried`) reads an old `carried.remarks` into `remarks` so an old
saved shape still loads (D401). Every place that rebuilds a request field by field must copy the three: `store.ts` ~4880
(a move), `sync.ts` ~573 (`doorDecideApproved`), `decideRequest`, and any other `kind: 'request'` literal (grep). The rows
(`leavewar/state/rows.ts`) store each record whole, so nothing new there — pin a reload.
- Docs: `docs/data-schema.md` §World 2 the `WarRec` request line; `docs/data-model.md` `LeaveBid` — fields `remarks`,
  `tillShown`, and documents as a link table `LeaveBidAttachment` (`leaveBidId`, `attachmentId`), the same shape as
  `InputAttachment`; the import table row for `raptor:leavewar/wars`.
- Tests: `leavewar/engine/warrecs.test.ts` (or the reader's own) — round-trip of the three, the caps, junk dropped, an old
  `carried.remarks` read; a reload keeps them (`state/rows` / `store.test.ts` reload case).

**7.2 Carried into the Input and back (B9).** `leavewar/sync.ts`:
- `doorApprove` (~383): the run key adds `till` beside the remark; the run's documents are the union of its days'
  `docIds` (one leave, its documents — never split a fortnight because one day has a file); `inputRowFor` gets `remarks`,
  `till`, and `docFields(docIds)`; the extension merge (before / after an Input already there) unions the documents too.
- `doorDecideApproved` (~551, a put-back to a bid or a refusal): each day's new request takes the Input's `remarks`, `till`
  and `docIds` — "a put-back carries its documents".
- `sliceInput` / `cutDates` already carry documents verbatim to each piece (its comment says so — verify, and pin it):
  deleting or cutting one day never takes a document from the days still covered.
- `doorMoveApproved` and a request's move carry documents.
- The document files themselves are never deleted by any of this — the drawer keeps every stored file (`state/docs.ts`,
  undo can bring a record back); B9's risk is a RECORD losing its list, which the tests above pin.
- Tests (red first): `leavewar/docsdoor.test.ts` (new) — approve a 3-day bid with a file → one Input with `docIds` and
  `till:false`; put one day back → that day's request has the file, the other two days' Input keeps it; delete one day of
  the leave → the rest keep it; move the approved leave → kept; move the request → kept; approve two runs that merge →
  the union; Undo of each.

**7.3 An entry already placed (D1159).** Where a person opens a leave already on the grid:
- **A pending or refused bid** — its window (BidPicker with Decide / Selected) carries Document and Remarks for it (5.9,
  5.10); the day's list (`ui/DayList.tsx`, a day holding several records) gives each request line its Document chips and a
  Document button (the same `DocField`), for whoever may change that record.
- **A war-approved leave** (an Input with `lw`) — the member's tap on his own opens `ui/RemarksSheet.tsx`; add the
  Document row there, saved through Raptor's one input commit (`ui/inputedit.tsx commitInputEdit`, as `setLeaveRemarks`
  does — own for a member, any for an admin). An admin's BidPicker on an approved leave (its Note button) the same.
- **An Inputs-page record shown on the war** (`RaptorSheet` in `BidPicker.tsx` ~850): its document chips shown (a tap opens
  them); Document / Add only on a leave, for its owner or an admin. A medical's documents are changed on the Inputs page
  only (its replace-don't-strip guard lives there) — *agent's reading*, §7 point 7.
- **A documents-only change to an input must not:** clear its `lw` (only a member's own date or kind edit does), make a
  published day pending or drop its sign-offs (a document prints nowhere on the schedule), or ring anyone's bell. Verify in
  `commitInputEdit` / `noticePass`; pin each.
- Tests: `ui/remarks.test.tsx` (extend) — the Document row saves on the Input, `lw` kept; `ui/daylist.test.tsx` (extend);
  an inputs test — a documents-only edit on a published day leaves the day with nothing pending and its sign-offs; a
  notices test — it tells nobody.

**7.4 The Inputs page (D1150, D1179, D1212).** Read `.claude/rules/decisions/inputs.md` first (D1179 is filed there).
- **Every input can carry documents:** the input window's Document row (`inputedit.tsx` ~3021) is drawn for every kind,
  not only `needsDoc` (medical); the commit saves `docFields` for every kind (~1025 and ~1263 are gated by `needsDoc` —
  widen them); `needsDoc` keeps meaning "a medical, whose document is asked and guarded".
- **A new leave asks for its document, never as a stop:** `docGate` (~717) answers 'ask' also for a NEW leave (or one
  retyped into leave — `isLeave`) with no document; editing a leave already saved never asks. `DocConfirm` gets the leave
  words — *agent's wording, shown at his look*: head "No document — Ranger, LL"; body "Attach the approval from the leave
  app now, or file it and attach it later."; buttons unchanged (Upload / No document). The medical words unchanged.
- **The list's paperclip** (`InputsPage.tsx` ~877) shows on every row with a document — it already reads `rowDocIds`, so it
  follows by itself; check the Inputs calendar's day card the same.
- **The type filter picks a family (D1179):** "All leave", "All medical", "All duty & commitments" as choices at the head
  of each group in the type drop-down (`InputsPage.tsx` `fType` ~199/433/619, families from `engine/inputs.ts TYPE_GROUPS`);
  the calendar follows the same value (`InputsCal` `fType` prop ~941); a view setting, not a record (check `memberType`'s
  persistence and keep it a per-person view setting).
- **"No document":** a quiet "No document" in the row's document place on a leave or medical row with none (D1179's
  reading), never on a duty row.
- **"Duration"** for the window's "When" row (5.8).
- **The register (D1151):** `docs/notifications-register.md` P1 already holds the reminder a day before a leave with no
  document; add a line only if the build finds another place a notice is wanted, and name it in the closing report.
- Tests: `ui/inputs-docs.test.tsx` (new) — the Document row for LL, a Training and a medical; a new LL with none → the
  leave ask, "No document" saves it, Upload returns to the window; an existing LL edited never asks; the saved LL keeps its
  `docIds`; `ui/inputs.test.tsx` (extend) — "All leave" shows every leave kind and nothing else, the calendar follows,
  "No document" on a bare leave and a bare medical, not on a duty.

## 4. The folded items

**[LW-ENTERED-DATE-UTC].** An OIL award's "Entered by Saber · 22 Oct 26" prints the world (UTC) date: `ui/DayList.tsx`
~298 prints `rec.enteredAt.slice(0, 10)`. Print the local date of that instant (a helper beside `ui/dates.ts`, one body),
and grep for every other printer of `enteredAt` (the award window, the OIL tracker). Test in the Leave War suite's fixed
zone (`vite.config.ts`: Pacific/Midway, UTC−11): an award entered at `2026-10-23T03:00:00Z` prints "22 Oct 26" (fails today).

**[LW-M1-READ-LEFTOVERS] (1) A member's shared input over another man's pending bid.** Check in the running app first
(D660: a member files for others): the clash rule (`leavewar/inputgate.ts replaceBids`) writes a notice on the other man's
war row inside the member's command, and the commit refuses "another person's war row" (`perms.ts` `lw.cell` case), so
the whole filing fails. If it fails: in that case, allow a member's `inputs.write` / `inputs.batch` command to change
another man's `lw.cell` only by removing his pending requests and adding the matching replaced-bid notice(s) — the
clash rule's own write — and nothing else. §11 `LeaveBid` member column gains the line. Test: `leavewar/ui/memberclash.test.tsx`
or `lw-commit.test.ts` — the filing lands, the other man's bid becomes a notice, one Undo puts both back.

**(2) "This replaces your LL bid…" said before the commit's check.** `leavewar/inputgate.ts apply` (~372–384) toasts
inside the command, before the commit can refuse it. Say it only once the command lands — defer the toast to after the
commit (verify `cmdDeferEffect` runs only for a command that committed; if not, hold the words and say them on success).
Test: a filing the commit refuses shows no "This replaces" note; one that lands shows it once.

**(4) A member's Move refused on a closed landing** reads "That lands outside what you can edit — pick another day."
(`Matrix.tsx moveReason`, 'window'). For a member whose landing day is closed for him: "That day is closed for bidding.
Pick an open day." — built as the agent's suggestion, shown to him in the morning (HANDOFF's plan, (a)); the old words stay
for a landing outside the war's dates. Test: `moveone.test.tsx` (extend).

**[LW-MONTH-MEMO-UNPINNED].** Measure first, on the built bundle (`performance.md` Part 1): one `setCell` today redraws
every `PersonMonth` of every drawn row (5,840 month-draws for 16 rows in the unit test). Find which prop changes for an
untouched month (start from `MatrixRows.tsx` — each row is handed the whole grid and day views afresh; the read
`docs/handpass/parts/lwrows/read-opus.md` F4's recipe did NOT work as written), decide whether it should (it is the phone's
cost of a bid), fix it if it should not, and pin the month's guard: `matrix-rows-memo.test.tsx` — one cell written redraws
only that row's month (fails today), and the test fails when the `memo` is taken off. Record the before and after in
`performance.md` §E.

## 5. The roll-call seed (bug-check order §6)

Every place the app draws each thing M3 touches. The builder fills the three columns (shows it / usable there / what else is
painted there) with YES, NO-because or MISSING — no blank cells.

**A bid window** (the one-day window, the drag-selection window and every window a leave tap opens):
1. BidPicker on an empty day — member (open day), admin (any day), phone and desktop.
2. BidPicker on a day holding a pending bid — member own, admin any.
3. BidPicker on a refused bid; on a war-approved leave (admin — Decide, Selected, Note); on a half day held by the Inputs
   page (`onlyPortion`); on a day holding an OIL award (+OIL shown); with PO / PI open.
4. SelectSheet — one person several days; several people; a member's selection crossing closed days.
5. ClosedNoteSheet — a closed day with nothing of his; with his pending bid (D1225).
6. DayList — a day holding several records (each request line).
7. RemarksSheet — a member's tap on his own approved leave.
8. RaptorSheet — an Inputs-page leave and a medical, opened on the war.
9. AwardSheet (an OIL award) and the move banner (Move from any of the above) — must not change, check they don't.

**The day panel:** the desktop header's date headings; the phone's frozen header band; a month's first date ("JAN THU 01");
a weekend, a PH and a no-leave day's coloured heading; a member's dimmed, locked heading (M1); the today heading; a heading
next to a not-yet-drawn placeholder; the heading in Rearrange (must not open, or must — decide and write it); a date no
period covers (stepped to with ›).

**A document chip / the Document button:** BidPicker (empty day; held bid); SelectSheet (one person); ClosedNoteSheet;
DayList's request lines; RemarksSheet; RaptorSheet; the Inputs page's input window (every kind); the Inputs list's paperclip;
the Inputs calendar's day card; the Medical page (unchanged — check it still pages a medical's documents); DocViewer from each;
the schedule's Unavailable / Personal Inputs rows where a puck tap opens a document (`ui/html.ts` — does a leave with a document
now open it? write the answer); the Approvals line (M4 — MISSING by design, say so).

**A leave entry** (where a placed leave is drawn, to check its documents and words survive): the grid cell (`PersonMonth`);
the day panel's Away line; My leave's list (M2's `ui/myleave.ts`); today's person window (D1148); the Inputs list, calendar
and card; the schedule's Unavailable list (week and board); the bell (unchanged in M3); the OIL tracker for an OIL leave.

## 6. The walk (phone 402×874, desktop 1440×900; admin `ad`, member `us` = Ranger)

Sized at the build in `docs/walk-ledger.md` (D607, D608) — expect wide: two roles, two widths, every row of §5. Sonnet
walkers take the pictures (D787); the host opens every picture that decides something (D1271, D1273). Every phone tap also
gets a picture within about 100 ms of the lift with the pointer left where it pressed (D1281, `walk-scripts.md`), and the
standing "pinned cell never see-through" e2e test is extended to press the new controls (the tick, Document, Remarks, the
date headings, ‹ ›). The built windows are measured beside `r9-remarks-bid-phone.png`, `r7-11`, `r7-12` and `r7-05` at his
iPhone's width (lessons 42, 43). A test that changes the data directly never stands in for a press (D608).

**The bid windows**
1. Member, open day: tap → the day line, eight buttons with figures in two rows of four, hollow; Duration AM → the line
   moves .5; LL → pending box; reload → still there. Phone and desktop.
2. Member, a bid that turns Available P red → the day line said so; after placing, the bubble under Manning (or at the foot
   when Manning is off screen — D1277).
3. Admin, a member's empty day: the tick is on; buttons filled; LL → approved box, an Input on the Inputs page with `lw`;
   Undo → both gone, grid where it was (D672); Redo → both back.
4. Admin unticks, places LL → pending; closes and reopens → ticked again.
5. Admin, ticked, a range across a locked week → the rest approved, the note names the refused days; their bids pending.
6. Admin, ticked, drag-selection across three people → all approved; one Undo.
7. Below zero: Anvil (−1.5) LL → "tap again"; tap again → placed (ticked: approved).
8. Phone: a cell low on screen → the grid scrolls it above the window (A5).
9. "Date" / "Duration" in both windows and the Inputs window.

**Remarks and the till tick (both orders)**
10. Remarks typed, then Pick a range → "till" follows the range's end; Pick a range first, then remarks → the same.
11. Untick till, place, approve (admin) → the Inputs page shows the remark with no till date; put it back to a bid → the
    request's remark and untick came back.

**Documents (both orders, reload, Undo)**
12. Document picked, then LL → the bid has the file; LL first, then reopen and Document → the same bid has it.
13. ✕ on the chip before the tap → the bid has none.
14. Member, a pending bid on a day since closed (close it as admin first): Document and Remarks there save; Undo takes the
    file back, Redo puts it back; Delete still works (D1225); a new bid there is still refused.
15. Admin approves a bid with a file → the Inputs list shows the paperclip; open it → the file. Put one day back → that day's
    bid shows the file, the rest of the leave keeps it. Delete one day of the approved leave → the others keep it.
16. Move a bid with a file; move an approved leave with a file → kept. Re-type LL → OL → kept.
17. Inputs page: new LL with no document → the leave ask; "No document" files it; edit it later and Add a file → no ask,
    the war's cell unchanged, the published day (if any) not pending, nobody's bell.
18. Inputs filter "All leave", "All medical", "All duty & commitments"; "No document" on bare leave and medical rows; the
    calendar follows.
19. Reload after 12, 14, 15 — every file and remark still there (built bundle, browser backend).

**The day panel**
20. Tap a heading → the panel; ‹ › across a month end and into the next period; a date no period covers.
21. With the panel open, place a bid on that day → the figures and the Away list change; Undo → back. And the other order:
    place the bid first, then open the panel.
22. Member on a closed day → the first line; the panel shows no remark anywhere though the day's leave has one.
23. Phone: from the foot, the grid still scrolls behind it; desktop: floating, draggable, the grid works.
24. Rearrange on: a heading tap does what the roll-call (§5) wrote.

**The folded items**
25. A member files a shared input naming a man with a pending bid (D660) → lands; his bid becomes a notice; Undo.
26. A filing the commit refuses shows no "This replaces" note.
27. Member's Move onto a closed day → "That day is closed for bidding. Pick an open day."
28. An OIL award entered in the evening shows today's date in the day's list (set the PC clock's zone if needed).

**Speed (§E, built bundle, before and after):** the grid's node count; a tap on a cell to the window up; a heading tap to
the panel up; one bid placed — `PersonMonth` draws counted (the memo fix).

## 7. Open points

**Left to the build — technical (recommendations above, the builder decides and says what he did):** where `dayWhatIf`
lives and how it shares `withFill`'s shape; one row order on empty and held days; the request's words as top-level fields
(recommended) or kept in `carried`; the run rule `lw.reqmeta` writes across; documents unioned over a run and on a merge;
the war reaching the documents through `sync.ts`; DocViewer's read-only form; the heading's one tab stop; deferring the
replace note; the month memo's fix.

**Readings built as recommended and shown to him at his look, his to strike — none blocks the build:**
1. A range's or a drag's day line names the worst day (and, across people, the worst person-day).
2. A drag across several people shows no figures on the buttons; Document and Remarks only when the drag holds one person.
3. Remarks and documents on his own pending bid on a closed day — drawn already (`r9-remarks-closed-phone.png`, with his
   5A answer), so not a new question; named so he knows the permission it needed.
4. The leave document ask's words (7.4).
5. A document chip's name opens the document, in every place the button stands — the Inputs window included.
6. The day panel lists the day's events at its top (as told on his page, round 20, before D1259); its lines are read only.
7. A medical's documents are changed on the Inputs page only, not from the war.
8. The Move refusal's words (§4 (4)).
9. "Placed · Decided" (drawn in `r7-13`) waits for M4.

**Truly his — none.** No ruling M3 needs is unanswered; if the build finds one, park it in HANDOFF's "Questions waiting for
him" (D596) and carry on with the rest.

**Records the same change carries:** `docs/data-schema.md`, `docs/data-model.md` (LeaveBid fields, LeaveBidAttachment, §11
LeaveBid / Input rows), `docs/ui-contracts.md` (the bid windows, the day panel), `docs/feature-impact.md` (the day panel; a
document on a war request), `docs/file-map.md` (`whatif.ts`, `DayPanel.tsx`, `LeaveLine.tsx`, new tests),
`docs/performance.md` §E (the measures), the walk ledger and the evidence sheet; this spec linked from `[LW-OVERHAUL]`.
Typecheck with `npm run build` (`tsc --noEmit` reports nothing here); check the browser-test port is free before a run.
