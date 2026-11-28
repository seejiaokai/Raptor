# Day window, step 9b: drawings on the real app (chat 199 helper)

Script: `C:/Users/User/projects/Raptor/raptor-port/docs/mock/2026-11-28-day-window-more/draw-more.mjs` (v1.0).
Pictures: `C:/Users/User/projects/Raptor/raptor-port/docs/mock/2026-11-28-day-window-more/img/`. There are 102 files: every state at both sizes, with a marked picture (yellow dashed outline and numbered tag) wherever something new is the point, plus a `-clean` picture of each.
Run it from `raptor-port/`: `node docs/mock/2026-11-28-day-window-more/draw-more.mjs --size d|p [--only s01,s04,...]`. It uses one size per process. The phone is 402×874 at 3x with touch; the desktop is 1536×864 at 2x (1536×1100 for s08 only, as draw-to-review.mjs does).
Nothing under `raptor-port/src` changed. The files of record in `2026-11-28-what-we-build/` are untouched. Nothing was committed.

## Build, server, errors
- **Rebuilt.** `dist` dated from 17:53, before commit 71eec5997 (17:54, the Approvals phone line). The checks lock was free. Rebuilt with `npm run build` on HEAD **184888131** (branch claude/lw-day-window-198), which exited 0.
- **Server.** `vite preview` ran on 127.0.0.1:4181 and is **stopped**, by its port. Nothing listens on 4181 now.
- **Errors.** No console errors or page errors in any run, at either size.
- **Checks on every frame.** The window never runs sideways (0 at both sizes). The transform's "spill" list flags only the pencil button (its drawn icon measures wider than its box, as it does in the drawing of record). No words are cut or broken in any picture I opened.

## The world (added to the drawing of record's `setupWorld`)
- **Ghost: five approved LL bids, Mon 14 – Fri 18 Dec, placed on the war.** Used by s01. This is a guess: the brief named Cutter, but Cutter's days that week are already used by b5–b8.
- **Two set-hours LL entries (10:00–15:00) filed on the Inputs page:** Cutter on Tue 22 Dec and Ranger on Tue 8 Dec.
- **Two approved LL entries for Ranger filed on the Inputs page:** Mon 30 Nov (bidding closed) and Fri 20 Nov (a past day).
- **A refused bid for Cutter on Wed 23 Dec.** It was placed pending, then refused with the window's own Refuse.
- **Auto-approve.** It was turned back on afterwards (the switch is remembered), so the leave buttons look as they do in the approved b-pictures.
- **s06 is a real line.** Ranger really withdrew his pending bid on Wed 2 Dec after Saber's first look at Approvals.
- **s08 is real.** An ALL AVAIL "Survival refresher" (Training, 13:00–14:00) was filed on Monday 13 Jul, and Zenith's Meeting was really rejected with today's Reject.
- **Each staged record was checked on screen** before any drawing.

## The states

| id | Files (each with -phone/-desktop, plus -clean) | What it shows | Words | Guesses / notes |
|---|---|---|---|---|
| s01 | s01-several-days | Ghost's approved LL card on Wed 16 Dec. "All 5 days" (lit) and "Wed 16" stand where "Pick a range" stood. The two chips are cloned from the real several-day window. Remarks show "till 18 Dec". Mark 1 is on the chips. | app's own ("All 5 days", "Wed 16") | **The person:** Ghost, not Cutter. **The chip's words:** the app today reads "Wed 16" (as "Mon 7"), not the brief's "Wed 16 Dec". I kept the app's own form; the words table holds it. **Leave figures:** Ghost's leave buttons show "–" because that is what the real window shows for him. |
| s02a | s02a-hours-admin | An admin on Cutter's 10:00–15:00 LL (Tue 22 Dec). The card has the pencil (mark 1), Move and Delete (mark 2), and Remarks · Document. It has no Duration row, leave buttons, Approve or Refuse, and no Auto-approve. The last row is kept. | heading "Approved · 10:00–15:00" (DRAFT, w2's shape) | **The grid box:** the app draws this leave as a whole-day LL box. That is real, not drawn. |
| s02b | s02b-hours-member | Ranger (us/us) on his own 10:00–15:00 LL (Tue 8 Dec). The card has Delete (mark 1), the pencil (mark 2), and Remarks · Document. It has no Move. The last row is the member's CSE · OD · ⋯. This is the picture for **Q7**. | the same heading DRAFT | **Placed line:** "Placed by Ranger" is my guess for leave he filed himself. |
| s03 (Q5) | s03-A-closed, s03-A-past, s03-B-closed, s03-B-past, s03-C-closed, s03-C-past | Ranger's approved LL on Mon 30 Nov (closed) and Fri 20 Nov (past). The grid cells are real. **A:** Delete only (mark 1), plus Remarks · Document, plus line w9 (mark 2). **B:** Remarks · Document only, with a line pointing to the Inputs page. **C:** Move, Delete, Remarks, Duration and the leave buttons (marks 1 and 2), as on an open day. | A: w9 (closed / past). B: DRAFT. C: none | **Option B:** w9 has no wording for B, so I drafted "Bidding is closed on this day. Change or delete this leave on the Inputs page." and "This day has passed. Change or delete this leave on the Inputs page." **Option C:** I added no line saying a change sends it back to pending. A reviewer may want one. **Last row:** kept as CSE · OD · ⋯, as today's member window on a closed day keeps it. |
| s04 (Q4) | s04-A-switch-shown, s04-B-hidden | Option A is b3's card (Cutter, approved Inputs LL, Wed 9 Dec) with the app's real Auto-approve switch kept in the title bar (mark 1). Option B is the same card without it. | none new | **No marked B:** s04-B has only a clean picture, since nothing is new in it. |
| s05 | s05-group-meanwhile | The group LL (Cutter, Ghost and Dash, Mon 21 Dec; the people b7 used) as it stands until Q1 and Q2 are answered. The card shows its three pucks, the placed line, the pencil (mark 1) and line w8 (mark 2). It has no buttons, Remarks row or leave buttons. The last row is kept. | w8 | **w8's dash:** "For all 3 — open it with the pencil." uses a dash to join two thoughts. That is for Fable to reword. |
| s05-q2 | s05-q2-group-course | A group CSE (Cutter, Ghost and Dash, Mon 14 Dec), drawn as Q2's recommendation: Move and Delete (mark 1), the "Change · 3 pax · Cutter" line (mark 2), the pencil, Remarks · Document, and the add part for leave over a course (as b5). | w4 (ruled) | **The world:** it has no real group course. Cutter's real CSE cell and box are used, and the three pucks are drawn on. |
| s06 | s06-also-since | Approvals under "New", in the "Also since you last looked" list. The new line, "Approved leave deleted by Ranger", is cloned from the real "Bid withdrawn by Ranger" line just below it (mark 1). It has a struck LL box and the date link "Thu 3 Dec ›" (desktop) or "3 Dec ›" (phone). | w26, put into the line's own shape | **w26's draft:** the plan's text is "Ranger deleted his approved LL · Thu 3 Dec". In the line's shape, the kind and day are the box and date link, so the words read like the withdrawn line. Fable should confirm this. **Where the list shows:** it appears only under the "New" choice. |
| s07 | s07-bell-lines | Ranger's real bell list, with three lines cloned from his real "Your leave · Thu 3 Dec · LL added and approved · Saber" line. They read "LL changed to OL · Saber" (1), "LL changed to LL (AM) · Saber" (2) and "LL changed to OL · pending · Saber" (3). The real lines stay underneath. | w10, w11, w10 pending | **Days:** 3 Dec, 9 Dec and 4 Dec were my choice. **Line 3:** the pending variant is drawn in addition to the two lines asked for. |
| s08 (Q6) | s08-none-common, s08-none-ground, s08-none-review, s08-one-common, s08-one-ground, s08-one-review | Edit Schedule's **week**, Monday 13 Jul, each part pictured separately. Each Ground Programme row that came from an input gets today's Reject button, cloned (mark 2). The ALL AVAIL Common Programme row gets one too (mark 3). The line "To take an input off, press Reject on it in Personal Inputs below." is hidden. Personal Inputs becomes "To review" (mark 1). **none:** the heading and "none" only. **one:** the Meeting, really rejected, waits with today's → Ground / → Unavail buttons and today's note (w24). | w16, w17 (w19 removed) | **Phone layout:** the people column has no room on a phone, so the Reject drops under the puck there. That follows D947's phone rule for an input's button; it is my reading of where it goes. **Viewport:** desktop uses a 1100-high viewport. |
| s09 | s09-member-other-day | Ranger looking at Cutter's Fri 18 Dec: the OIL award card (mark 1) and the pending LL card (mark 2). They are read-only, with no buttons, Remarks box or leave buttons, and the last row is hidden. | w5 | **What a member sees today:** another man's leave opens nothing, and his OD opens a read-only sheet. **Manning line:** kept on the drawing. **Last row:** hidden is my guess, because a member does not file a course for another man. |
| s10 | s10-refused | Cutter's real refused bid (Wed 23 Dec). The card has Approve greyed, "Refused" lit red with the cyan ring (mark 1, on its corner), Move, Delete, Remarks, Duration and the leave buttons. The placed line reads "Placed by Saber · … · Refused by Saber · Fri 27 Nov, 14:05". | w0 (ruled), w2 | **Buttons and colour:** they follow today's list for a refused bid (Approve, Refused, Move, Delete; D2881). The lit red is the app's own #F0555F. |
| s11 | s11-oil-earned | An OIL the schedule earned (FO*) on Cutter's Sat 12 Dec, as a card with no buttons (mark 1). The FO* box is drawn into the grid cell too, because the world has no published weekend. | DRAFT: "OIL earned · a day" and "Worked 08:00–16:30 · from the published schedule" | **Words:** both lines are my draft. Today's list says "OIL earned, worked … · given by Weekend/PH" with "From the published schedule." under it. |
| s12 | s12-replaced-notice | On Cutter's Mon 14 Dec: the CSE card, then a notice card (mark 1) reading "Cutter’s LL bid was replaced by CSE (Saber)", with "OK, seen". It has no box, as today's line has none. | app's own, word for word | **Shape:** a notice card with no kind box is my guess. |
| s13 (Q3) | s13-q3-pending-second-tap | b2's pending card (Cutter, Wed 2 Dec) after OL is tapped once. Line w1 stands just above the leave buttons (mark 1), as b3o1 shows it. | w1 | — |

## The words table (top of the script, `const W`; change words there and re-run)

| key | words | source |
|---|---|---|
| placedBy / refusedBy | Placed by / Refused by | w0, ruled D2927 |
| headPending / headApproved / headRefused | Pending · Whole day / Approved · Whole day / Refused · Whole day | w2 |
| headHours | Approved · 10:00–15:00 | DRAFT (w2's shape) |
| headCourse | Whole day | w2 |
| allDays / dayChip | All 5 days / Wed 16 | app's own words |
| w1 | Only one kind of leave a day. Tap OL again to change this LL to OL. | w1 |
| w4 | Change · 3 pax · Cutter | w4, ruled D2784 |
| w5head / w5sub | OIL award · a day / Weekend det · given by Saber | w5 |
| w8 | For all 3 — open it with the pencil. | w8 draft |
| w9closed | Bidding is closed on this day. You can delete this leave here, or change it on the Inputs page. | w9 |
| w9past | This day has passed. You can delete this leave here, or change it on the Inputs page. | w9, completed with its own tail |
| q5Bclosed / q5Bpast | Bidding is closed on this day. Change or delete this leave on the Inputs page. / This day has passed. Change or delete this leave on the Inputs page. | DRAFT |
| w10 / w10pending / w11 | LL changed to OL / LL changed to OL · pending / LL changed to LL (AM) | w10, w11 |
| bellWho, bellBy | Your leave, Saber | app's own |
| w26 (+ w26date) | Approved leave deleted by Ranger (Thu 3 Dec ›) | w26, put into the line's own shape |
| s11head / s11sub | OIL earned · a day / Worked 08:00–16:30 · from the published schedule | DRAFT |
| s12text / s12seen | Cutter’s LL bid was replaced by CSE (Saber) / OK, seen | app's own |
| w16 / w17 | To review / none | w16 (ruled D2883), w17 |

## Where the app differs from the brief, and what was drawn in
- **The placed line.** Every card here reads "Placed by …", as ruled in D2927. The approved b-pictures still read "Placed Saber".
- **The day chip** reads "Wed 16", not "Wed 16 Dec" (see s01).
- **The several-day example** uses Ghost, not Cutter (see s01).
- **The plan names a different folder,** `docs/mock/2026-11-29-day-window-more/`. The brief's `2026-11-28-day-window-more/` was used.
- **Drawn in, not real:**
  - the card contents everywhere (as in the drawing of record);
  - the FO* box in Cutter's 12 Dec cell (s11), removed straight after its picture;
  - the three pucks on the group course (s05-q2);
  - the cloned bell lines (s07) and the "also" line (s06);
  - the cloned Reject buttons and the renamed heading (s08).
- **Kept in sight:**
  - **The tapped cell on a phone.** The grid is scrolled so the tapped cell stands above the phone's window. To do that, a hidden 700px spacer is added below the page; it is out of every picture.
  - **s08's hidden lines.** The line that goes and the accepted rows are hidden, never removed.

## Faults I could not fix
None outstanding. Fixed along the way:
- The Auto-approve switch had been left off by the refused bid's setup, which made the leave buttons look like bids. Fixed.
- The FO* cell box carried into later frames. Fixed.
- On a phone the tapped cell was hidden behind the window. Fixed.
- In s08 the pucks squeezed beside the Reject (desktop), and the Reject ran into the remarks (phone). Fixed.
- In s10 the tag covered the word "Approve". Fixed.

Left for a reviewer: s09 and s12 mark a whole card, so their tags sit on the card's right edge on a phone.
