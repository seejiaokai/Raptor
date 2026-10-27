# M4's scenario design — a fresh Opus designer, read-only, on commit 21f578261 (27 Oct 26)

Kept as the designer handed it back (the order's §4 rank 1). It read the whole spec, the order's §7.11 and the M4 diff;
changed no files, ran no tests. ★ = its top 10. P = phone 402×874, D = desktop 1536×860. "Reading" = no ruling says.
**Disposition: none yet** — the next chat takes each into the walk (or a named test) and writes its result in the
evidence sheet `docs/handpass/2026-10-27-lw-m4.md`.

## (1) Ranked scenarios
**★1. Redo after an Undo on Approvals (admin, P+D).** Approve one line; Undo from the top bar; Redo. Expected (D1421,
reading): lit "Approved" again, a second tap sends it back. Disproof: "Already approved by Saber", greyed, both buttons
off — the `ApprovalsPage` rows memo drops `lit` when Undo brings the request back; after Redo it is gone again → stale.

**★2. Undo while on the Approvals page (admin, D then P).** Scroll ~30 lines down, approve one near the foot, Undo.
Expected (D672): the list stays where it is, the line back to pending in place. Disproof: the page jumps —
`undo-wire.ts snapView` calls `focusDay(date,{ifHidden:true})` while the grid is hidden (width 0), so the day is never
"in view" and the jump moves the window's scroll (the Approvals page's). Check Grid → Back afterwards too.

**★3. The ring on a cold or far month (P, both roles).** (a) Fresh member sign-in, tap a bell line for a far month (June
when the grid lands on January) — the war's first visit of the session. (b) Admin on Approvals taps a December request's
dates (the hidden grid's window of months has shrunk). Expected (D860, D1231, D1142): the grid at that day, the ring ~6 s,
clear of the slim bar. Disproof: no ring — `cellring.ts` gives up after 40 frames (~0.67 s); the first build takes ~1 s.
Pictures at 0.1 s, 1 s, 3 s.

**★4. Bidding shortened or split (member's bell).** Admin opens Apr, May, Jun by three taps, then closes May (or Jun).
Expected (spec 9.4 "widening or shortening a stretch is one line with its new dates"; D1214): Ranger's bell still says
Apr (and Jun) open. Disproof: only "1 May – 31 May bidding closed" live, "Apr–Jun open" hidden — `openingTells` writes
only the closed run and `noticeLive` hides an older overlapping bidding line.

**★5. Admin re-types a member's pending bid.** Ranger bids LL Tue–Wed; admin ("Approve what I enter" off) re-types to OL
(a) through the drag window / Pick a range, (b) through the one-day bid window. Expected (reading; D1142 names no
"re-typed"): the same line, or none, by both routes. Disproof: (a) rings "LL bid deleted · Saber" (`decisionTells`: old
id gone, new id unpaired); (b) rings nothing — the standalone save in `persistNotify` (`cmdCommit` type `lw.edit`) calls
`tellHolidays` but never `tellDecisions`. The routes disagree.

**★6. "Approve what I enter" places a different kind over a pending bid.** Ranger has a pending LL; admin (toggle on)
places OL that day. Expected (D1422, D1142): a line naming OL ("OL added and approved · Saber"). Disproof: "LL approved ·
Saber". Also the bid window's "Placed · Decided" reads "Placed Ranger" (a re-typed kind keeps the first stamp though Saber
placed the OL).

**★7. A remark on a war-approved leave changed in the drag window (admin; member's bell).** Expected (D1166 with D1142,
reading): Ranger told once, as on `main` ("Remark changed"). Disproof: no line — `sched-commit.ts` sets `skipLw` for
every `lw.*` command, dropping the Inputs door's line, and the war writes nothing for a remarks-only change. Confirm on
`main` that it was told there (a regression).

**★8. Two lines that join while the list is drawn (admin).** Ranger LL bids Mon and Wed (two lines); tap Mon's dates;
on the grid place Ranger's Tue LL pending; Back. Expected (D1339, D1346, reading): one line Mon–Wed. Disproof: an extra
greyed "No longer there" line — the rows merge keeps only the first old row's match. Also the reverse (a middle day
deleted, one line splits) and a re-type of a drawn line.

**★9. Approve all meets a refusal the pre-check misses (unit test; walk if a published week exists).** Ranger has an
approved LL on the last day of a locked week and a matching pending LL the next day, among other lines in one Approve all.
Expected (spec 8.3, A4): that line says why, the rest approved. Disproof: every line "Couldn't decide that…" — the door
joins the new approval onto the neighbouring approved leave (a locked input) and the whole command rolls back;
`approveWhy` looks only at the request's own date.

**★10. A SANS man while SANS is off the war (admin).** SANS on; admin places a pending bid for a SANS man; ✕ on the SANS
group. Expected (spec 8.2; D1215, D1221): LOWEST AVAIL "SANS · not in Avail"; the dates open his person window.
Disproof: an empty cell — `figuresOf` gets `who` undefined, so its SANS test is false.

**11. A member's own Inputs-page leave over his own pending bid (admin view).** Expected (spec 8.4, reading): "Also since"
shows one line, "Filed on the Inputs page". Disproof: a second "Bid withdrawn by Ranger" — `changelines.ts warLines`
counts the replaced bid as a withdrawal (the notice it leaves is not a request); the change history carries it too.
**12. Bell tap while the member's OIL tab or a window is open (P).** Expected (spec 9.6): the grid at that day, ringed.
Disproof: OIL stays on top — `openWarAt` closes Approvals but never OIL.
**13. The slim bar against the foot of the screen (P; lessons 4, 5).** With it up, (a) a bid that turns a row red (the
manning bubble, D1358); (b) the bid window. Expected: nothing overlaps; the window's buttons press; the ringed cell above
both bars.
**14. Pick dates… (P+D; lesson 4).** Pick a single day; tap outside; Escape. Expected (4 Sep 26: a click-open popup closes
on a click outside it): it closes. Disproof: stays open after a one-day pick (it closes only when the second day differs)
and nothing handles a tap outside.
**15. Approving next to an earlier approval re-stamps who approved it.** Approve Mon–Tue; later Wed (the door joins it).
Expected (spec 8.6, reading): Mon's "Placed · Decided" still names the first approval's admin and time. Disproof: "Approved
Saber · <now>" — `stampPlaced(merged)`.
**16. The admin's own placement shows as new.** "Approve what I enter" off, the admin places Ranger's bid; leave the tab
and come back. Expected (reading, as "never what he did himself" in "Also"): no cyan dot.
**17. The counts agree (spec 15c).** One pending request in next year's period: tab = N, page header = N−1 (+1 named for
the other period), the slim bar = ? Disproof: the slim bar shows the every-period count beside the page's this-period
count with no "+1" note.
**18. A day with two entries opens the day's list (D1315, spec §6).** Expected: each entry's "Placed · Decided". Disproof:
none — `PlacedLine` is mounted only in `BidPicker`.
**19. The ring's six seconds (P).** Within them scroll so neighbouring months draw, and tap the ringed cell. Expected
(D860, reading): the ring holds until the tap (a class added by hand — a repaint can remove it).
**20. Opening Approvals is no Undo step (admin).** Approve, Undo, leave Approvals, open it again, Redo; open the changes
window. Expected (spec §3; D148): Redo still works; the changes window shows nothing for "Approvals opened" or "taken back".
**21. A posted-out man and a deleted man (admin).** Expected (spec 8.2, B12): "posted out 14 Oct"; Approve refused on the
line ("Posted out — refuse or delete it"); Refuse works. Watch: a deleted man ('gone') shows no tag, and "delete it" points
at a gesture he cannot reach (no row).
**22. Approve all, fast and slow (lesson 2; A4).** Double-tap under 150 ms; two taps 3 s apart; arm, change the filter,
tap. Expected: approves only on a second, separate tap on "Approve N — tap again", never twice. Picture the armed words.
**23. "Taken back" — a unit test only (note it in the walk).** Undo of a decision the member has read → "Approval of LL
taken back · Saber"; unread → the line goes (D1216); Redo → "LL approved again", unread, on top. Not walkable in one
browser: the Undo list clears at sign-out (D148) and the member's read mark needs him signed in.
**24. Who is told about bidding (D1214).** Every account on the war but the admin who did it, one line; archived and
deleted none; a tap lands on the stretch's first day. A reading to put to him: men with SANS off the war get none
(`warAudience` reads the war's roster).
**25. Bidding that ends by its last date (spec 9.4, P7).** Clock past a stretch's end: "… · bidding closed · its dates
ended", no name; replaces the "open" line; unread for a new member; gone after 14 days (the build's reading); "Mark all
read" clears it.
**26.** The line-state table (spec §7, lesson 1): each cell once — half day, a weekend inside a run, OIL and CCL, 0/1/2+
documents, "by …", saved before M4 (dash), a run joined from two placed times (earliest shown); DAYS and LVE BAL against
the bid window's day line.
**27.** Stale in one browser (spec walk 6): arm Approve all; tap a line's dates; on the grid refuse that bid (a) or move it
into the next period (b); Back. Expected: disarmed and recounted; "Already refused by Saber" / "Moved to …".
**28.** The document viewer open over Approvals (lesson 4; D641): press another line's Approve behind it — the viewer must
still match its own request; its foot has no "Edit input", no "Upchit".
**29.** "Never told twice" (spec 9.2, B1), its six cases, one line each; then an Inputs-page change by the admin to the
same leave still tells Ranger once (D1166).
**30.** A member (spec 15): no Approvals tab, arrows cannot reach it; an admin who switches to member view with the slim
bar up is taken off it.
**31.** A leave across the period boundary (B3): one line in each period; "+1 pending in …" switches the View.
**32.** Speed (lesson 2, perf §E): 50 pending lines; time one decision (every line's figures recomputed); count the grid's
repaints; open the bell with many bidding lines (the hide-older check runs per pair, each recomputing the derived lines).
**33.** Reload after decisions, bidding lines, read marks and "last opened" (spec 14, 15b): all kept.
Lessons 6–7: nothing handed to the phone itself (lesson 7 n/a); lesson 6 in part — the tab row and the two-line requests at
390, 402 and 431–700 with an iPhone's wider letters need his look on his iPhone before merge.

## (2) Gaps in the spec's own seed (§6, §7)
No step for Redo's line state (1), Undo with the page up (2), a cold or far ring (3), shortening or splitting a stretch (4),
re-typed kinds (5, 6), remark-only changes under the "never told twice" skip (7), lines joining or splitting while drawn
(8), the door's join onto locked leave (9), the re-stamp on a join (15); §7 step 10 assumes "taken back" can be walked — it
cannot in one browser (23); the roll-call names the day's list for placed / decided but nothing checks it (18); the changes
window and Redo against the two new non-Undo commands (20); the OIL tab or another window open at a bell tap (12); a
member's own Inputs-page leave over his own bid in "Also since" (11).

## (3) Negatives
9.8 holds (only a leave or medical replaces a bid; a member files only duties for others, D655) — **but one control test is
missing: the same member change to a shared leave the admin filed with NO pending bid under it; if it lands, the refusal in
`m4ride.test.ts` comes from the war-row check, not D763, and the claim is unproven.** A member cannot write a war line (a
notice needs a real input id), his "last opened" (an admin's record), nor forge placed / decided (`stampForged` tests —
see the security read for its holes). The new follow-up and "last opened" commands do not clear Redo. Inputs-page changes
still tell through the Inputs door. A member's move keeps the id (no withdrawal). Back to pending clears "decided by". The
drag window's decide runs as a decision command. A person's own change tells nobody; postings keep telling.

## (4) Missing call sites it names
`store.ts persistNotify` (no `tellDecisions` — 5b) · `ApprovalsPage.tsx` rows memo (1, 8) · `undo-wire.ts snapView` (2) ·
`cellring.ts look` 40-frame cap (3) · `store.ts openingTells` with `notices.ts noticeLive` (4) · `store.ts decisionTells`
re-type / over-place pairing (5, 6) · `sched-commit.ts` skip flag (7) · `sync.ts approveWhy` the joined neighbour (9) ·
`approvals.ts figuresOf` off-roster SANS (10) · `changelines.ts warLines` a replacement read as a withdrawal (11) ·
`sync.ts openWarAt` never closes OIL (12) · `ui/DayList.tsx` no `PlacedLine` (18).
