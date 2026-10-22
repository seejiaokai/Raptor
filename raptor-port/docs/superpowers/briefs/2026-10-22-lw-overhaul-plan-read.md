# The Leave War overhaul build plan — a fresh, blind read (22 Oct 26)

Reader: a fresh Opus that wrote none of it. Read: the plan, the code map, the design note §5, §6, §9.3, §10, the Leave War
rulings (D1141–D1207, full rows of D1177, D418), shipping.md, the checking order §5, D761, D790, D1086, D1087. Code
checked where a claim rested on it (`leavewar/sync.ts warFactsVersion`, `leavewar/ui/FlyRows.tsx`). Every finding has
a failure, its cause and its fix (D489).

## Findings

**F1 — D1196 is in two batches, and batch 4 would ship an empty button.** Batch 4 (M2) lists D1196/D1188; batch 8 (M4)
lists them again. The code map says the Approvals button "lands with the Approvals list — a button with nothing behind it
must not ship". Built in M2, it is live for one merge with nothing to open. *Fix:* batch 4 builds only D1196's second
line (open dates, under-manned, Legend the same for everyone). The button goes in batch 8. Re-measure the phone's first
line in M4 (View + picker + "+" + Approvals at his iPhone width).

**F2 — "My leave" (M2) and the day panel (M3) depend on the person window (M5, waiting on his look).** A1 makes a tap
on My leave open his own person window. A1 also says the day panel's "Away" list uses the person window's one-line row.
Both are placed in M5, so M2 must either build the separate list A1 removes, or ship My leave with no tap. M3's day panel
would then be redrawn in M5. *Fix:* say what M2's tap does until M5 (recommended: open today's person window), and build
the one-line leave row as a shared piece in batch 6, which the person window reuses. Or move My leave's tap and the
panel's Away rows to M5 explicitly.

**F3 — The five stage behaviours point at a superseded table.** Batch 1 says each behaviour's rule comes from "the design
note §9.3's Q5 table". That table was written for lock dates (D1156, archived). It says the green outline goes, a new
period "starts locked whole", Undo takes back "a lock", and there is an "Approvals in progress" lock. D1177's readings say
the opposite on the outline (open days keep it) and on Undo (it takes back opening and closing). A builder following the
table removes the outline. *Fix:* cite D1177's full row and the narrowed D418, D333, D352, D1166 as the source. Mark the
§9.3 table as the lock-era draft, per D201.

**F4 — An old saved war row on a live browser.** Batch 1 says the stage and bidding dates are "dropped (demo data
cleared — D56)". The moment M1 is live, his phone's saved war still has `stage`/`bidFrom`/`bidTo` and no open stretches.
A reader that expects the new shape breaks the Leave War page. D56 does not cover a crash on load. *Fix:* batch 1 states
that the reader accepts an old row (open + window → one stretch, else none — the code map's rule), with a test that loads
one. Or the merge clears the stored war data under D22, said in advance. The same applies to a stored `'acknowledged'`
being read as waiting in batch 2.

**F5 — A renamed Required row may not repaint.** Batch 3 says the amber and red points must be part of the rows'
signature. The cell signature (`sig`) carries the class, so that holds. The names, though, are drawn outside the memoised
cells, and the war's facts signal (`warFactsVersion`) watches only `people`, `requirements`, `eventDefs` and the wars. A
Required name stored as a new config field (the code map's `reqNames`) changes none of these. The row and the calendars
then keep the old name until something else changes. *Fix:* store the names inside `requirements`, or add the field to
that signature. Add a test that a rename repaints the row and the Calendar window.

**F6 — The grid's speed is measured only around M2.** M1 changes the grid too: one outline per stretch instead of one
box, the closed-day dim, and a new tap path on every closed own-row cell (D1176). M3 adds taps on the date headings, which
the "every row carries identical cells" contract governs. *Fix:* measure the built bundle (perf, node band) before and
after M1 and M3 as well, not only M2.

**F7 — Two permission rows the plan does not name.** Batch 10's holiday import is a new command type (the code map's
`lw.holiday.import`), so it needs its `perms.ts` row and its §11 row together (D200). Batch 3's offset and name writers
replace `setManningThreshold`, which refuses Available ids and negatives today. If they become a named command, they need
a row too. *Fix:* name both in batches 10 and 3, and in risk 5.

**F8 — Red-team fix A7a is dropped.** Only A7b (a month drag runs in calendar order) is carried. A7a — a second finger
cancels an arming or armed selection — is in no batch and not on `[LW-PHONE-PINCH-ZOOM]`. *Fix:* add it to that backlog
item, or to batch 2 or 4.

**F9 — The checks in §4 fall short of FULL and contradict §1.** §1's table says code reads are "fresh, blind Opus; a
ChatGPT reader on `[NO-ASTRA-LIST]`". §4 says "two fresh, blind Opus reads". Two Opus reads never count as two
independent readers (AGENTS.md, D67), and D903 gives the riskiest changes the Opus read alone. §4 also leaves out the
parts of FULL in the order's §5 table: the rules sweep, the other model's scenario design (owed while ChatGPT is out,
D353), the door check, the break tests, the case seeded in the demo data, and the re-walk of fixes. *Fix:* one fresh,
blind Opus read per merge (a second is optional and named as such). Write both owed ChatGPT reads (Astra and Sol 6.1, since
saved data and permissions need two) and the owed scenario design on `[NO-ASTRA-LIST]`. Then point §4 at the order's FULL
row rather than its own short list.

**F10 — The bell's "takes the grid there" for a man with no row.** B12's fix (open his person window) is placed only in
Approvals (batch 8). The bell's tap (D1142, batch 9) has the same gap: a SANS member with Show SANS off. *Fix:* carry
B12's fallback in batch 9 too.

## Checked and sound

- **Every live ruling is placed.** D1141–D1203 are all in a batch or waiting on his look, except D1148 (rolled into
  D1201 — name it in the waiting line) and D1157, D1161–D1163, D1165 (no code, or confirmed by D1175). D1159 appears in
  two batches on purpose (built in 5, used in 7).
- **The red team's fixes all land.** A1, A2, A4, A5, A8, A9, A11, A12, B1, B2, B3, B6, B8, B9, B10 and B12 each land, with
  A1 and B6 in M5 and A12's parts spread over batches 3, 6 and M5. A7 lands except A7a (F8).
- **The order otherwise holds.** Look F and the Available points (M2) come before the bid line and day panel (M3);
  documents come before Approvals' icon (M3 before M4); who-placed is stored by Approvals' own batch; the bell follows
  Approve all; Q8 needs open dates (M1). One order within M3: build batch 7's stored document list before or with
  batch 5's Document button (A2 writes onto it).
- **M1 alone fits D1087.** Batch 1 is itself four related jobs (the window, the closed note, the landing date, the clash
  words), and it is FULL with a different risk from M2. Say that, rather than citing D1087 for a one-batch merge.
- **The question placement is right.** Q5 and Q6 go before M1, Q9 and Q12 on M2, Q7 on M2/M3, Q8 and Q11 on M4, and Q1–Q4
  and Q10 on M5. One addition: a yes to Q7 changes the architecture's "Available rows are never judged" line (D665's
  amendment). Name it there, and keep the SANS calendar's need unchanged.
- **The shipping rules hold.** A pull request at build (D1086), touched tests on his PC, Sonnet walkers (D787), "merge
  live" his own, and M1 never sharing a merge with M4.
