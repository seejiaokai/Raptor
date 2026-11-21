# Evidence sheet — batch 1's multi-squadron reshape (chat 127, from 21 Nov 26)

The build of `docs/superpowers/plans/2026-11-20-multi-sqn-b1-reshape.md` by its §10 phases, his D2244 (Opus builds;
Fable reads the core's rights change blind before any helper builds on it; Sonnet walks; the four-reader fix read at
the end, D2236). Branch `claude/multi-sqn-b1-107`, pull request 806 (draft — not merged before a fix read comes back
clear). Pictures: `docs/img/handpass/2026-11-21-msq-reshape/`.

## The eight answers and the tier

| # | Question | Answer |
|---|---|---|
| 1 | Money (OIL, who counts as present) | YES — the war's roster by date (A1), OIL eligibility across a move (`oilOpenOn`), A4's holidays per squadron |
| 2 | The published record | YES — the sign-off boxes (C5), `snap.ros` frozen by the day (C4) |
| 3 | Saved data | YES — rights read by date, the planning record routed to another squadron's store, the foreign posting pass |
| 4 | A shared drawer | YES — the roster readers behind every crew list and palette |
| 5 | A new gesture or mode | YES — the midnight band and its "Close" (drawn, approved D2243 Q7) |
| 6 | A new surface | NO — no new screen; the band sits on an existing window |
| 7 | Roles | YES — Pieces B and C, PA1–PA3, R1, R7 |
| 8 | The warning list | NO — no warning's words or rule reading changes; the refusals are doors' words, not warnings |

**Tier: FULL.**

## The roll-call (one row per surface the reshape touches — §13; filled during the walk)

| Surface | SHOW | USABLE | PAINTED there | Proved by |
|---|---|---|---|---|
| Inputs — list, filter, deleted and archived groups (C1, C2, C11) | has it — each list by day on Wed 15, Thu 16, Fri 17: Hunter A and B, Kestrel B and C, Ranger all three, Osprey none (W1-02) | has it — the ruled "Blocked: Ranger is 149's from Thu 16 Jul…" at the window, refused again after a re-try (W1-01); a deleted group: must not, because a delete is final (D350) — no Restore of a deleted input (W1 lead 5) | has it — Saber's leave unchanged in both squadrons (W1-02) | W1-01, W1-02 both sizes |
| Inputs calendar — notes, day titles, their edits and Undo (A-ii) | has it — each bar in its squadron; B drawn whole 15–17 in both, C only in 149 (W1-02, RECORDED) | MISSING → fixed: the 14–17 bar's drag refused with no word at all (W1 lead 3, "schedfix"); the late cut-off's Undo note named "a rule on the Logic page" (W1 lead 4, "schedfix" — new words a question) | has it — notes and titles stay in their squadron, Undo puts back the edit (W1-05) | W1-01, W1-05; `ui/msq-fix-w1-caldrag-words.test.tsx`, `undo/msq-fix-cutoff-note.test.ts` |
| Input window — people picker and Save across a move (C6, Q8's words) | has it — the picker leaves Ranger out of a 14–17 draft, offers him on the 14 only (W1-01) | has it — Ranger, Saber and Hunter with Plan save; a picked-then-redated Ranger refused at Save (W1-01); MISSING → fixed: open across his own midnight it was not held and saved Hunter's input into 149's week (W3-F3, "schedfix") | has it — nothing saved by a refusal (W1-01) | W1-01, W1-02, W3-06 b; `ui/msq-fix-sched-windows-midnight.test.tsx` |
| Edit Schedule — day panel, crew palette, free all day, ALL AVAIL crowd (C4) | has it — every palette mode by day in both squadrons, a WSO and a Personnel mover too; ALL AVAIL Thu 16 44 without Ranger, Wed 15 48 with him (W4-01) | MISSING → fixed: his puck dragged onto 142's Fri 17 after his move, no word (W4-F2, "schedfix" at the door, "corelines" at the gate); text typed across his midnight dropped on Enter with no word (W3-F2, "schedfix") | MISSING → fixed: Kestrel's edited 149 week read 142's days on its other days after a reload (W4-F1, "schedfix"); the placeholder meetings stay on 142 (W1-04) | W4-01, W4-02, W4-04, W1-04, W3-06 a; `state/msq-fix-w4f1-week-reload.test.ts`, `ui/msq-fix-w4f2-drag-day.test.tsx`, `state/corelines-sched-day.test.ts` |
| Edit Schedule — sign-off boxes (C5; R8 his answer) | has it — Tue 14's boxes list Ranger after the move and on Fri 17, Mon 20's do not; with Plan H 149's boxes read Kestrel, Ranger, Hunter, Saber, CUR CK 149's own (W4-03) | has it — Tue 14 published with Ranger signed, amended AL1 on Fri 17 (W4-03) | MISSING → fixed: 149's boxes would offer a moved-in man his old Scheduler tick ("corelines" line 4); known and left: a signature stored before the move counts by the bare tick (Mon 20 published with "Ranger") | W4-03 both sizes; `engine/corelines-sign-tick.test.ts` |
| Publish and sign — the frozen roster (C4) | has it — on Mon 20, Fri 17's issued readers show the issued day and the working readers the working copy, in both squadrons; Ranger not free all day on 142's Fri 17, free on 149's (W4-04) | has it — publish and amend (W4-03) | MISSING → fixed: Kestrel's CSV named "142-schedule.csv" (the "142" family, "schedfix"); "Export as PDF" prints the working copy of Edit Schedule (RECORDED — the working page) | W4-04 desktop; `ui/msq-fix-sqn-number.test.tsx` |
| Quals (A-ii setting) | has it — today's roster (Ranger in 142's on Wed, in 149's on Fri — W1-03); his row leaves Hunter's and enters Kestrel's at midnight with no reload (W4-08) | has it | MISSING → fixed: Kestrel's export named "142-LoX-ALL.csv" ("schedfix"); known and left: the page still shows a moved-in man's old Scheduler tick ticked | W1-03, W4-08 desktop |
| Medical counts | has it — on Fri 17 not in 142's, in 149's (W1-03) | a medical, its end and its cut-short across the move refused "Blocked: nothing was kept" — a question for him (no approved sentence) | has it | W1-03 desktop; W4-08 Medical NOT WALKED (no subject) |
| SANS calendar and day | has it — Ranger not offered (not a SANS man); a 142 SANS man's day "Input added" (W1-03) | has it | has it — SANS colours in each squadron's own (W1-05) | W1-03, W1-05 |
| OIL answer list (A4, PB3–PB5, R3, R4) | has it — 149's holiday asks 149's schedulers only, its list 149's (W1-06); Hunter with Plan of 149 opens 149's list from his bell (W5-05) | has it — "OIL answered for 1 input" (W5-05); Later, Yes, No (W1-06) | has it — 142's bells and Friday untouched (W1-06) | W1-06 desktop, W5-05 both sizes |
| Leave War — rows across a move (A1, drawn), a day now another squadron's (A7) | has it — 142's row striped from Thu 16, no "PO", 149's striped before it, on three days; Available one lower in 142, one higher in 149; the Manning sheet agrees (W2-01) | MISSING → fixed: a phone (WebKit) tap on a striped day opened the man above's window for the day before (W2-F1, "warfix"); a pending bid on a day now 149's could be neither approved, refused nor removed (W2-F3, "warfix") | MISSING → fixed: leave approved in 142's war before the move showed and was charged in 149's war (W2-F2, "warfix") | W2-01, W2-03, W2-05, W2-06; `leavewar/msq-warfix-*.test.*` |
| Leave War — posting pass, held note (A5, A6, PB1, PB2) | has it — every due posting ran once on Thu 16 with nobody of 149 signed in; Kestrel's bell holds all four (W2-07) | has it — a held last-admin posting runs by itself, once, when Osprey is made admin; "Undo post out" before the day stops it (W5-06) | must not, because Admin → Users lists both squadrons until step 5: a 142 admin without Plan sees 149's held note on Kestrel's row (W5-06, held) | W2-07, W5-06 both sizes |
| Tracker — people, rebind at midnight (A2) | has it — each new sign-in binds the day's squadron; a Tracker first opened after midnight is 149's (W3-08, W3-04) | MISSING → fixed: the kept 142 Tracker refused a write in silence and "Save changes" read "saved" (W3-F4, "warfix") | has it — nothing stored in either Tracker (W3-03) | W3-03, W3-04, W3-08 desktop; `tracker/msq-warfix-trk-refused.test.tsx` |
| Admin → Users — Suspend, Demote, Archive, Delete of a last admin (B3, Piece C; R12 his answer) | has it — "Kestrel is 149's last admin. Make another admin of 149 first." at every door, never "That did not save"; the dated sentence with Move O (W5-01, W5-02) | has it — with Osprey or Merlin an admin each goes through; role and Suspend undo and redo (W5-01, W5-02) | has it — the row unchanged after each refusal | W5-01, W5-02 both sizes |
| Admin → Users — re-link, Restore, Delete and their Undo (Piece B, guardrails 1 and 2) | has it — Restore and Delete (W5-01, W5-07, W5-08); the re-link: must not be walked, because no control links a sign-in to another person (a question for him) | has it — Undo greyed with its reason at add, archive, restore and delete (D350, W5-08); "Restore as …": no control (NOT WALKED) | has it — a delete takes Osprey off 149's notes only (W5-07) | W5-01, W5-07, W5-08; re-link by `state/reshape-plan-audit.test.ts`, `state/msq-undo-rights.test.ts`, `state/piece-b-tables.test.ts` |
| Admin → Users — "+ New squadron" (B6, R5) — no screen yet | must not, because no screen yet | — | — | not walked; `state/reshape-piece-c-doors.test.ts`, `state/reshape-b6-squadron-without-admin.test.ts` |
| The bell — posting lines to a squadron's admins (adminsOf) | has it — on Thu the 142 lines leave Hunter's bell, read or unread, never struck; his own line stays (W4-07); 149's admins carry the pass's lines, 142's none (W2-07) | has it — Ranger's own line gone on 142's Undo, back on Redo (W4-07) | has it — the bell's reading of a moved admin audited sound ("corelines" line 5) | W4-07, W2-07 both sizes; `state/corelines-bell-moved-admin.test.ts` |
| The top bar's Undo / Redo — steps across the midnight swap (A-v) | has it — after midnight Undo passes over the 142 war's step (W3-05) and Hunter's 142 role answers (W4-06) | has it — the 23:50 leave taken, Redo back (W3-05) | has it — no 142 step undone into 149 | W3-05, W4-06; the setup reload clears the list, so W2-02's orders 1–2 by `state/war-day-not-its-squadron-gate.test.ts` |
| The midnight band on a Leave War window and a Tracker pop-up (A-iv, drawn D2243 Q7) | has it — "You are 149's from today. This can't be saved in 142's Leave War." and "Close", drawn at 00:00:01, both engines (W3-01); the Tracker's editor band (W3-03); each stacked war window (W3-07) | has it — Close, ✕, Escape, a tap outside, each to 149's war (W3-01, 8 of 8); MISSING → fixed: a placed bid's window emptied his typed words when he left the box (W3-F1) and Hunter's held window closed in silence on a leave chip (W3-F5) ("warfix") | has it — nothing stored in either war; the manning line drops after midnight (a question — departure from the Q7 drawing, pictures W3-02) | W3-01, W3-02, W3-03, W3-07; drawing check `drawcheck-band/`; `leavewar/msq-warfix-held-window-words.test.tsx` |
| Waiting screen — no guest view (B2, D2239) | has it — "Waiting for an admin", his details, only "Sign out" (W5-08) | must not offer "View the schedule", because D2239 removed the guest view — none offered | has it — no "Guest view" switch for either squadron (W5-08) | W5-08 both sizes |

**The roll-call, widened (added at the sheet's fill, 22 Nov 26 — the walk brief's §2 rows 21–49, filled from what the walkers saw):**

| # | Surface | SHOW | USABLE | PAINTED there | Proved by |
|---|---|---|---|---|---|
| 21 | Mission role (Blue / Red / Later) and Insights | has it — each answer stays with its squadron, nothing published or signed (W4-06) | has it; "Later" NOT WALKED (time) | MISSING → fixed with W4-F1: Kestrel's Insights listed 142's people (the mixed week) | W4-06 desktop |
| 22 | Saved plans, previews, templates, reopened weeks | has it — Plan A / Plan B keep each squadron's inputs, Undo and Redo (W4-05) | has it — a day template applied places no person (W4-02); rename, "Delete plan", the phone selector NOT WALKED (time) | MISSING → fixed: signed in again, Kestrel's other days showed 142's crew (W4-F1) | W4-05, W4-02 desktop |
| 23 | Scheduler Board and View-only Sched | has it — the issued readers (W4-04); the member view switches at midnight with no reload (W4 round) | has it | MISSING → fixed: Osprey's View-only showed 142's days (W4-F1) | W4-04, W4 round |
| 24 | ALL AVAIL / free-all-day crowds, "Who's available / Who earns OIL" | has it — by day (W4-01), Fri 24's 142 crowd 40 without Hunter or Ranger (W1-04) | "Who earns OIL": NOT WALKED (no control of that name found) | has it — the crowd says 40 where its chip says 41 (W1 lead 7, for the host) | W4-01, W1-04 |
| 25 | Changes window and history bubble | has it — Kestrel's history holds 149's lines only (W4-04) | a change's jump and the bubble NOT WALKED (time) | has it | W4-04 desktop |
| 26 | Exports: schedule CSV, Export as PDF, Quals export | MISSING → fixed: the file names read 142 for 149 ("schedfix") | has it — the files made; the CSV holds flying lines only (RECORDED) | — | W4-04, W1-03 |
| 27 | Calendar… → Holidays: export / import sheet, every opener | has it — the holiday added on Fri 17, its OIL list from the bell and the schedule (W1-06) | the sheet's export and import: not reported by W1 — NOT WALKED | has it — 142 untouched (W1-06) | W1-06 desktop |
| 28 | Own-page settings and their Undo | has it — the cut-off's first save, Undo, Redo, each squadron its own (W1-05) | MISSING → fixed: the Undo note's page name (W1 lead 4); Edit quals, SANS colours, Every weekday, Days… with Undo not reported — NOT WALKED | has it | W1-05 |
| 29 | Admin → Data "Clear old clutter…"; a delete's calendar cleanup | has it — "No old clutter in that period" (RECORDED; no day notes made) | has it — the delete's cleanup (W5-07) | has it | W5-07 desktop |
| 30 | Leave War Approvals and "Approve all" | has it — "Approve all" writes nothing on Ranger's days (W2-03) | MISSING → fixed: W2-F3 | has it — 149's Approvals not listing it (W2-05) | W2-03, W2-05 |
| 31 | Balances, Days taken, My leave, person window, OIL tracker | MISSING → fixed: W2-F2 (149's war "LVE −6", "LL Mon 20 Jul 1 Approved") | the OIL tracker has no door to put a credit on a date (RECORDED); another year NOT WALKED | has it after the fix in the tests; on screen: the re-walk | W2-06 desktop |
| 32 | The war's other writers and pinned row copies | has it — pinned names striped when scrolled (W2-01) | has it — cell, range, Grant OIL, block, Approve all write nothing on a day now 149's (W2-03); the skip's words "already holding leave or a medical" for a moved man's days (RECORDED, words) | has it | W2-01, W2-03 both sizes |
| 33 | Manning sheet, flying-day rows | has it — "Pilots Thu 16 Jul … Available 25" agrees with the grid (W2-01) | — | has it | W2-01 |
| 34 | Tracker's Down days, side panel, Export… | has it — Down days RECORDED, Export… listed (W3-08) | has it | — | W3-08 desktop; the phone NOT WALKED (its setup's Save timed out three times) |
| 35 | Tracker chart editor, apart from an event pop-up | has it — the band (W3-03) | MISSING → fixed: W3-F4 | has it | W3-03 |
| 36 | Bell audiences beyond posting lines | has it — Ranger changing the remark tells Hunter, now 149's admin (D2228, W4-07) | has it — Redo brings a line back | RECORDED: a new 142 decision on Ranger's leave after his move tells his bell nothing; a read line gone, not struck, seen only with two tabs (not reproduced in one) — for the host | W4-07 desktop and phone |
| 37 | Access: Request access, waiting, Give access, Add a person, Give sign-in, Restore as, welcome-back card | has it — each squadron's new person in its own war (W5-08) | has it — Give access, Refuse; "Restore as …" and rename: no control (NOT WALKED) | RECORDED: no welcome-back card at Ranger's Thu sign-in; Kestrel's "On the roster" list offers both squadrons' 64 names (held, both-squadron list until step 5) | W5-08 both sizes |
| 38 | Every way a war window closes | has it — Close, ✕, Escape, a tap outside (W3-01) | has it | — | W3-01 both sizes |
| 39 | Other war windows at midnight, two stacked | has it — the band on each (W3-07) | has it — the war stays 142's under the lower window, 149's when the last closes (RECORDED) | has it; Approvals, the other order and the phone stack NOT WALKED | W3-07 desktop |
| 40 | Schedule-side windows open across midnight | MISSING → fixed: W3-F3, W3-F2 ("schedfix") | the sign-off list after midnight: the column is 149's, nothing saved (RECORDED); Publish (day locked, "4 to sign") and "Every weekday" NOT WALKED | has it after the fix in the tests; on screen: the re-walk | W3-06 |
| 41 | Writers that copy people onto a day | has it — a template places nobody (W4-02) | MISSING → fixed: the drag (W4-F2); "Every weekday" and a saved plan onto Mon 20 NOT WALKED | RECORDED: a 142 line already naming him shows a plain puck, no mark (a line that named him before stays — "corelines" line 2) | W4-02 desktop |
| 42 | A signature already in a box before the move | has it — kept on Mon 20 (RECORDED) | has it — Mon 20 published | known and left: a stored signature counts by the bare tick | W4-03 |
| 43 | Refusal words at the other doors | MISSING → fixed: the calendar drag (W1 lead 3) | the course, medical and Delete answer "Blocked: nothing was kept" — a question for him | — | W1-01, W1-03 |
| 44 | The bystander's open page at midnight | has it — Quals, the Person filter, the war, the palette follow the day with no reload (W4-08) | has it — Hunter's Save after midnight refused "He is 149's. Only an admin of 149 can change his account.", Kestrel's saved (W4-08) | RECORDED: Admin → Users' "Post in" date stays Wed after midnight with no reload (W4, W5 — for the host, lesson 29) | W4-08 desktop, the editor on the phone |
| 45 | The kept Tracker after midnight | has it | MISSING → fixed: W3-F4 | has it | W3-03 |
| 46 | Three clocks | NO-because the library pins the time zone to Asia/Singapore, one midnight | — | — | none needed |
| 47 | A posting set on a man who then moves | RECORDED — "POSTING OUT 20 JUL · OVERSEAS SQN" on Saber's Users on Thu 16; by Mon 20 no tag, no bell, no change in either war (W2-07; the plan §6.5 — skipped by both passes, D2221 not built) | — | has it — nothing of 142 changed | W2-07 |
| 48 | The member view by the name badge across midnight | has it — 142's at 23:57, 149's at 00:00:30, no reload (W4 round) | has it | has it | W4 round desktop |
| 49 | The top bar's small squadron number over TALON | MISSING → fixed: "142" for every sign-in, Kestrel's included, with or without a move (every walker; "schedfix"); known and left: the browser tab's static title "142 Flying Programme" | — | — | W1, W2, W3-04, W4, W5-08; `ui/msq-fix-sqn-number.test.tsx` |

## The five sizing lines (§7.0)

(written at the sizing step, before any walker starts)

Written by the helper "walkprep" before the walkers started (21 Nov 26, chat 131), in
`docs/superpowers/briefs/2026-11-21-msq-reshape-walk-brief.md` §1 — its five lines, in short (the full text is there):

1. **The type of change:** A, D, C, G and H — one answer to "whose is he on a day" inside shared readers; each page
   drawing it by its own call; a new mode (a window held at midnight with the band and its "Close"); saved data (rights
   as dated rows, Undo across a move and midnight, the posting pass over every squadron); who may do what (the last-admin
   rule at every door, Plan, a right ending at the move day). FULL.
2. **What only a walk could find:** a page whose own call still reads today or the loaded squadron (some twenty
   surfaces draw the answer separately); a door reaching the generic words instead of the ruled sentence; the band on
   each war window and the Tracker's chart editor at midnight, in both engines, each way to close; the orders around
   the move, midnight and Undo; what a phone's tap leaves. The tests prove the rules by calling the state, not a door.
3. **What the ledger says:** this branch's earlier walks (18 Nov FULL, 18 Nov WALK, 19 Nov FULL, 20 Nov Plan audit)
   found 1 fault in all, the reads the rest, and the walkers' own scripts made several false ones — so sized to what
   only a walk proves, every EXPECTED line sourced.
4. **The walk chosen:** five Opus walkers (his D2256) in parallel, each in its own browser storage on the one frozen
   build — W1 Inputs, calendars, holidays and OIL; W2 the Leave War, its money and the posting pass; W3 midnight, the man
   who moves; W4 the schedule, publishing, the bell and the bystanders at midnight; W5 rights, people and the admin
   doors; 38 merged scenarios (37 walked, W5-09 not — no door) and five plain-user rounds; desktop 1536 × 864 Chromium
   and iPhone 402 × 874 WebKit by touch; no other sizes. The band's drawing check by the host. Carried by tests: the
   move's Undo, moving oneself or a master admin, the re-link, "+ New squadron", a place row's day, the guards' counter.
5. **After the walk:** the ledger row (drafted at the foot of this sheet's walk, below, and in the ledger).

## The rulings that apply, swept against the running build

## The orders walked

The frozen build `D:\raptor-work\walk-6bbf9fe52\dist` (commit `6bbf9fe52`, bundle `index-Cu6gn0SU.js`), served at
`http://localhost:4621`, 21–22 Nov 26 (the night of chat 131). Five Opus walkers (his D2256, which narrows D787 for
now) side by side, each its own fresh browser storage; the only setup through storage a move or a right (the brief's
"Move M", "Move H", "Move O", "Plan H"), everything else pressed on screen. Their prompt `D:\raptor-work\walk\WALKER-PROMPT.md`;
their tables `D:\raptor-work\walk\W<n>\results.md` (W5 `results-final.md`). Tokens were not measured for any walker.
"d" = desktop 1536 Chromium, "p" = iPhone 402 WebKit by touch.

| Share | Walker | Scenarios walked | Sizes | Plain-user round | Pictures taken | Time | What the screen and the money said, in short |
|---|---|---|---|---|---|---|---|
| W1 Inputs, calendars, holidays, OIL | Opus | W1-01 … W1-06 | d and p; W1-03's Quals and export and W1-06 past publishing d only (script) | Kestrel, d | 393 | about 3.5 h (its own report) | Q8's sentence at every leave door; lists and pickers by day; the late mark by the input's own squadron; 149's holiday asks only 149's OIL question; no FAIL against an EXPECTED line — 7 leads |
| W2 Leave War, money, posting pass | Opus | W2-01 … W2-07 (W2-02's orders 1–2 not walkable: the setup reload clears Undo) | d at Wed 15, Thu 16, Fri 17; p at Thu 16 | Osprey, d; p not past sign-in | 411 | about 3 h 20 min | the stripes and the Available figures right (142's P 25 after the move against 26, 149's one higher); the posting pass ran once with nobody of 149 signed in; the money wrong: Ranger "LVE −6" / "−7" in 149's war — W2-F2; 3 findings |
| W3 midnight, the man who moves | Opus | W3-01 … W3-08 (W3-05's variant, W3-06 d and e, part of W3-07 not walked) | d and p, some d only | Ranger, Wed / Thu / Fri d, Thu p | 458 (412 cited) | not stated (back about 01:15 by the chat's clock) | the band, its four ways to close, nothing stored, 149's war after; pages turn to 149's with no reload; 5 findings |
| W4 schedule, publishing, bell, bystanders | Opus | W4-01 … W4-08 (parts not walked, below) | d; the boxes, palette, bell and row editor on p | Hunter plain, with Plan H, and the member view across midnight; p | 281 | not stated (started 22:54) | sign-off boxes and palettes by day; issued and working readers agree; the bell's 142 lines gone on the move day; 2 findings (W4-F1, W4-F2) and the "142" family |
| W5 rights, people, admin doors | Opus | W5-01 … W5-08 (W5-09 not walked — no door) | d and p | Saber, d and p | 601 (586 + 16 in a re-run folder) | about 2 h 40 min | every last-admin door in the ruled words, the dated sentence, Plan ending with the role, the held posting running once, the waiting screen without a guest view; 6 leads, none a fault after the host's look |

**RE-WALK (22 Nov)** — the fixes' re-walk in two rounds, each on a fresh frozen build of the branch tip, Opus walkers
side by side, each its own browser storage, the same setup rule (a move or a right through storage, everything else
pressed). Their reports `D:\raptor-work\walk\<share>\REPORT.md`, tables `results.md`, pictures `img\`. Tokens not
measured. What they saw, fixed and still failing, is under "What the walk found" below.

| Round | Share | Walker | Build | What it re-walked | Sizes | Plain-user round | Pictures taken | Time |
|---|---|---|---|---|---|---|---|---|
| 1 | RS the schedule side | Opus | `e57cb6c3a` (`index-BvvsHS0Q.js`), port 4631 | W4-F1, W4-F2, W3-06 a–c, W3-03, the "142" family, W1 leads 3 and 4, Move H's sign-off boxes, ALL AVAIL for 149 (the readers') | d and p | Kestrel publishing and amending, Osprey, Saber, Ranger — d; p to Publish day | 244 | about 2½ h |
| 1 | RL the Leave War and the Tracker | Opus | the same | W2-F1, W2-F2, W2-F3, the war windows and the Tracker across midnight, ⇄Move after a move | d and p (WebKit and Chromium phone for W2-F1) | Ranger, Kestrel, Hunter in the war; the Tracker for Ranger Wed and Thu, Hunter Thu — d and p | 319 | 02:03–02:44 |
| 1 | RK the kinds of sign-in, Admin → Users | Opus | the same | K1, K3, the last admin, Archive's words, D2260, the bell of a role change | d and p (items 3 and 5 d only) | Ranger, Osprey, Hunter, Kestrel, Saber — d and p | 419 | about 45 min |
| 2 | R2L the Leave War and the Tracker | Opus | `24f44b903` (`index-DTsJIA5o.js`), port 4641 | round 2's war fixes: ⇄Move of a bid and of approved leave, a duty filed across a move, the hidden leave's doors, OIL awards, the Balances box and bid remarks at midnight, the person window, the posting tag, the Tracker after an Undo (9 items, 1 with no door) | d and p (item 5's drag d only) | the war and the Tracker as RL's, word for word | 231 | 03:49–04:20 |
| 2 | R2S the schedule side, Inputs, Admin → Users | Opus | the same | round 2's Inputs and core fixes: ALL AVAIL for 149, the meeting's stamp, the input window at midnight, a moved admin made admin, Undo across a squadron change, the SANS day, the settings windows, Delete and drag words, "Several people", the filing marks on the new squadron's day (10 items) | d and p (items 1–2's 149 check, 4 and 8's drag d only) | publish, AL1 (the phone too now), Undo, bell, View-only; Inputs, Quals, Admin → Users for Kestrel, Osprey, Hunter, Saber, Ranger | 492 | about 2 h |

## The cases carried by a test

(each fault's proof copied red first — §9.1 of the plan; the host reruns both runs)

| Fault | Test file | Red on | Green on |
|---|---|---|---|
| C9 (the guards' counter dropped a template's `${…}` code) | `engine/roster-readers.test.ts`, `engine/inputsfor-readers.test.ts` (their C9 cases) | the old counter (chat 127, before `b526f2f45`) | `b526f2f45` |
| B4 (an own page read and wrote the members' switch of the signed-in man's home, not the page's) | `state/memberfile-own-unit.test.ts` (copied word for word from the repro brief, only the harness changed) | `518b675a3` | `3208bfe7e` |
| A5 step 7 — another squadron's posting through the second store; the bell lines' audience | `state/posting-pass-every-squadron-gate.test.ts` (12; 8 red, 4 refusals already refused) | `0f9d98ef7` | `7ada453ba` |
| B1's gate line — a delete takes its man off another squadron's planning notes, and only that | `state/delete-strips-other-calendar-gate.test.ts` (9; the 4 allowed cases red, the 5 refusals green on both) | `7ada453ba` | `81092264c` |
| A7's gate half — a war's change to a man's day not its squadron's only removes (D2243) | `state/war-day-not-its-squadron-gate.test.ts` (6; both refusal cases red, the allowed green on both) | `81092264c` | `f12c09d56` |
| Piece B: R2, R3 (its two reads name the move day, §4.4), R4 (a–d), R5, K1 — copied whole from the repro brief | `state/reshape-r2-move-back`, `-r3-undo-move`, `-r4-no-old-right`, `-r5-first-admin-moving`, `-k1-place-day` `.test.ts` (15; 10 red, 5 controls green on both) | `9288f0593` (core files before Piece B) | the night's Piece B commit |
| Piece B: PA1 (a–e), PA2 (a, b), PA3 (a) — the Plan audit; R1 (O1 a, b) — the blind read | `state/reshape-plan-audit.test.ts`, `state/reshape-plan-audit-read.test.ts` (13; 10 red, 3 controls/guard green on both; O2 and O4 left for P3 and phase 3) | `9288f0593` | the night's Piece B commit |
| Piece B's tables — the reading rule, the one check for homes and places, guardrail 2's leave-out, R7, moves-tomorrow | `state/piece-b-tables.test.ts` (21) | new behaviour — not fault proofs | `6a3ca222d` |
| Piece C: B3 (the door judged today, the gate every date — a correct refusal reached the screen as "That did not save"), B6 (a squadron made, or left, with no admin) — copied whole from the repro brief | `state/reshape-b3-lock-door-vs-gate.test.ts`, `state/reshape-b6-squadron-without-admin.test.ts` (7; 5 red, 2 green on both — the Archive control, and Hunter taking his own Plan away, refused by PA1 already) | `6a3ca222d` (core files before Piece C) | `be0dc7e13` |
| Piece C's lock table (§5.4 — dates × admins at home × a Plan-only squadron × a master at home only × an archived admin × the first admin moving in × a new squadron's first admin moving away later × a Plan sign-in that is a member there × a squadron removed whole × the whole app) and every door in the one words table (D2184 Q10, D2217 Q15, D2246), the gate past the door for a right and a squadron, the Undo and Redo of "+ New squadron" | `state/lastadmin.test.ts` (22), `state/reshape-piece-c-doors.test.ts` (20) | new behaviour — not fault proofs | `be0dc7e13` |
| **Phase 3 (chats 130–131, 21 Nov 26)** — the rows below; the red and green of each are its builder's and the host's runs as their commits record them, and the twelve test files named were run again together on `b2e09dc1a`'s code by the documents step: 56 passed, 1 expected fail (A2's Tracker case, below) | | | |
| The contract — the "whose is he on a day" readers (`homeOn`, `homeUnitOf`, `onRosterOf`, `rosterOf`, `unitPeople`, `myUnit`, `levelIn`, `levelOfAccount`) took today by default, and `inputsFor` had a no-day form | no proof file of its own: the whole unit suite, where a missing or malformed day now throws (`engine/roster.ts needDay`) — 26 app callers and 125 test calls given their day; the guard `engine/inputsfor-readers.test.ts` (its allowance for `engine/inputs.ts` raised by one, `inputsOnFirstDay`) | new contract — not a fault proof; that guard red until its allowance | `ea7fa94cf` (the whole unit suite through the lock: 951 of 952 files, the one red that guard, then green) |
| R6 of the 35 — a member's own command could remove who refused his bid and when, where both stamps went together | `state/reshape-r6-refusal-stamps.test.ts` — "R6 — a member's own command never removes who refused his bid and when" (proof r-r6 copied whole; 5 cases, "both stamps removed, still refused: refused by the gate" the red one) | `ea7fa94cf` | `c0a856d83` |
| The late mark — an input's late mark was judged by the loaded squadron's cut-off, not its own squadron's (owed by phase 2's "own pages") | `engine/late-own-cutoff.test.ts` — "an input's late mark reads its own squadron's cut-off": "a 149 man's input, 142 loaded: 149 cuts off on the Monday, 142 a week before — on time by 149's", with its control | the code before `7b5a53fea` | `7b5a53fea` |
| A4 — one squadron's public holiday reached another at the same place: its days, its OIL question, its bell | `leavewar/msq-holidays-own-sqn.test.tsx` — "A4 (bell) — 142’s holiday tells only 142’s schedulers" (2, the second "(A4, the call site easy to miss) 142’s holiday asks no OIL question of a 149 man’s input on that day"); `leavewar/holidays-by-place.test.ts` — its first two cases and its R32 words rewritten to D2195 and D2207: "a public holiday is its own squadron's, as an Off day is (D2195)", "A4 — a holiday 142 adds stays 142’s (D2195)", "R32 (D2184, D2207): a new public holiday names, before it is saved, its own squadron's published days it puts out of date" | `c0a856d83` (the proofs' own commit `b02185f1b`) | `40321d9ab` |
| PB3 — a holiday's OIL question never reached an admin holding Plan of that squadron | `leavewar/msq-holidays-own-sqn.test.tsx` — "PB3 — a holiday’s OIL question reaches that squadron’s admins, a plain admin holding Plan of it among them (D2202)" | `c0a856d83` | `b6e60c91c` |
| PB4 with R3 — once told, the line counted and opened the reader's home squadron, and the list saved only the reader's home squadron's answers | the same file — "PB4 + R3 + R4 — the line carries its squadron: its count, its span, the list it opens and the list’s save are 149’s" (its count and list cases); "O4 — the one OIL list saves the answers of the squadron it LISTS (PB4 must reach ui/oilday.ts saveOilDay)" (the blind read's O4 word for word, and "(R3, its door) a 142 admin with no right in 149 is refused the 149 list’s save") | `c0a856d83` | `7ea050e19` |
| R4 with PB5 — a holiday line's dates, name, newer-line check and the list's foot read the loaded war, or any squadron's line | the same file — in "PB4 + R3 + R4 …": its dates-and-name case, "(R4) a 142 holiday on the same day does not take the place of Hunter’s 149 line: one line each squadron" and "the list the bell’s tap opens (its dates only — ui/topstate.ts openNotice) finds the line’s squadron: 149’s input" (added with the fix; red with that lookup switched off); "PB5 — the list’s foot asks only lines of the list’s own squadron" | `c0a856d83` | `d5c86a299` |
| The flying plan read the loaded Leave War's holidays for another squadron's page (found with A4) | the same file — "the flying plan’s facts are the page’s squadron’s holidays, never the loaded war’s" | `c0a856d83` | `09602d118`; the helper merged `6adfca111`, its 12 proofs re-run by the host red on the code before the merge and green after; the follow-ups (the bell's tap, the record's field, the put-back's list) `cc77b061f` |
| B2 — the guest switch worked for 142 only; closed by removing the guest view (D2239) | `ui/reshape-b2-no-guest-switch.test.tsx` — "B2 — no squadron's guest switch exists (D2239)" (3: Kestrel's and Hunter's cases red, the control green on both); `state/reshape-b2b-no-guest-switch-shared-store.test.ts` — "B2 (shared store, first squadron 149) — no guest switch exists (D2239)" (1, red) — both proofs rewritten to "no squadron's switch exists" (`a1ce90674`) | `c0a856d83` | `f031c157f`; merged `218184770`; the store's label `0ea1b4342`, where the host re-ran them: 3 red and the control green with the merge's source files put back, 4 green after |
| A2's proof — signed in across his own move, the page stayed in his old squadron | `state/reshape-a02-midnight.test.ts` — "A2 — the war follows his squadron at midnight of his move" (proof `a-a02-signed-in-across-move` word for word, the clock moved by the app's own wake: "Ranger signed in on 15 Jul, moved to 149 from 16 Jul; at 00:05 on 16 Jul his war is 149’s and holds his row", with its control; its Tracker case kept word for word as an expected fail — OPEN, the plan §14 item 3: a loaded Tracker moves at the next sign-in); `state/midnight-swap-undo.test.ts` — "enterSquadron at his own midnight — fired by the clock alone", "A-v across the midnight swap — his Undo after the clock moved him" (6) | `c0a856d83`, where the trigger was off (the proofs' own commit `d02951d7f`) | `548f7426a` |
| The hold and the band (D2243 Q7) — an open Leave War window at midnight of his move | `state/typing-hold.test.tsx` — "a Leave War window open at midnight of his move" (6, the band's approved words, the refused save, Close and Escape among them) and "the Tracker at midnight of his move (the plan §14 item 3 — it cannot be re-read in place once loaded)" (1) | `548f7426a` (the tests' own commit `d09893e27`) | `52159d559` |
| R6 of the blind read — a pick with no right behind it, or a war or Tracker not the page's own squadron's, left the page where it was (dormant until a screen gives or takes a right) | `state/reshape-r6-reenter.test.tsx` — "the pick half: a squadron picked with no readable right behind it", "the war half: a Leave War loaded that is not the page’s own squadron", "the Tracker half: a Tracker bound to a squadron that is not the page’s own" (6; 3 red, 3 already green with the swap and the hold); `state/pick-stands.test.ts` — "pickStandsOn" (4, new behaviour) | `46a97946f` | `61d2926f5`; the helper merged `9dbdfe9f3` |
| The midnight words fault — at midnight of his move the grid swapped his open bid window for the closed note, so his typed words were gone under the band (found by the drawing check, D1494) | `state/typing-hold-grid.test.tsx` — "Ranger's bid window open at midnight of his move": "stays the bid window, his words in it, under the band", with its control | the code before `0a98f2ae1` | `0a98f2ae1` (the 88 files that render the grid, 1,505 tests, green through the lock) |
| **The night of 21–22 Nov (chat 131) — the walk's and the sign-in kinds' faults, each fixed red first by a Fable helper.** The host re-ran each helper's red test files on the base and after the merge: "meeting" 2 of 7 red on `c0384d8db`, green after; "kinds" 9 of 11 red on `89eecb06a`, 71 of 71 green after the merge (with the kinds table's pinned tests); "schedfix" 16 of 25 red on `be714876d`, 25 of 25 green; "warfix" 18 of 25 red on `be714876d`, 25 of 25 green; "corelines" 14 of 53 red on `095df926a`, 233 of 233 green (with the gate's and kinds' tests) | | | |
| The meeting (D2243 Q1) — a 149 ALL AVAIL meeting moved to 142's schedule when a 149 man added to it took himself out | `state/msq-meeting-stays.test.ts` | `c0384d8db` (the proof's commit) | `232ddab1f`; merged `809be97b2` |
| K1 (D2253) — a master admin in the member view still reached every squadron | `state/signin-kinds-proof.test.ts` (the reviewer's proofs word for word), `state/signin-kinds-fixes.test.ts`; the table `docs/superpowers/briefs/2026-11-21-msq-signin-kinds-table.md`, its cells `state/signin-kinds-{cells,gate}.test.ts` | `89eecb06a` | `125564253`; merged `a4e6eec35` |
| K2 (his D2260) — a master admin could be made a member while he held the mark | the same two files | `89eecb06a` | `125564253`; merged `a4e6eec35` |
| K3 (D2160) — an admin who moved arrived as the new squadron's admin | the same two files | `89eecb06a` | `125564253`; merged `a4e6eec35` |
| K4 (D2160) — a squadron's own admin could not move his own man | the same two files | `89eecb06a` | `125564253`; merged `a4e6eec35` |
| K5 (D1695, D2197) — a Plan holder typed his own balance into another squadron's war | the same two files | `89eecb06a` | `125564253`; merged `a4e6eec35` |
| The delete's meeting (D2243 Q1) — a man deleted out of an ALL AVAIL meeting left it with no squadron | `state/msq-meeting-stays-delete.test.ts` | `89eecb06a` | `125564253`; merged `a4e6eec35` |
| W4-F1 — Kestrel's edited 149 week read 142's days on its other days after a reload (a read-back fault: a stored week joined under its bare date) | `state/msq-fix-w4f1-week-reload.test.ts` | `be714876d` (proof `c547bde80`) | `568f95c5c`; merged `45fcc4ce5` |
| The "142" family — the top bar's number, the schedule CSV, the print and Quals' export read 142 for 149's people | `ui/msq-fix-sqn-number.test.tsx` | `be714876d` (proof `2a3205bee`) | `e72ab9a4e`; merged `45fcc4ce5` |
| W3-F3, W3-F2 — the input window not held across a man's own midnight (saved into 149's week); text typed in a schedule box across it dropped with no word | `ui/msq-fix-sched-windows-midnight.test.tsx` | `be714876d` (proof `5a28d039b`) | `06bd5cb04`; merged `45fcc4ce5` |
| W4-F2 — a drag placed Ranger on a 142 day after his move, no word | `ui/msq-fix-w4f2-drag-day.test.tsx` | `be714876d` (proof `cc783a44b`) | `b31eac4a4`; merged `45fcc4ce5` |
| W1 lead 3 — the calendar's drag of leave across a man's move refused with no word | `ui/msq-fix-w1-caldrag-words.test.tsx` | `be714876d` (proof `e1fb6272b`) | `683deada6`; merged `45fcc4ce5` |
| W1 lead 4 — the Undo note for Inputs' late cut-off named "a rule on the Logic page" | `undo/msq-fix-cutoff-note.test.ts` | `be714876d` (proof `371b9d124`) | `f867fa05f`; merged `45fcc4ce5` |
| W2-F2 — leave approved in 142's war before a move showed and was charged in 149's war too | `leavewar/msq-warfix-f2-leave-one-war.test.ts` (6 of 8 red; the two controls green) | `be714876d` (proof `9480f538b`) | `c016d580e`; merged `25139ce05` |
| W2-F3 — a pending bid on a day now 149's: Approve and Refuse answered the generic words, the striped day opened nothing, nothing removed it | `leavewar/msq-warfix-f3-pending-other-day.test.tsx` (4 of 6 red) | `be714876d` (proof `9792a189b`) | `e8c5a13c3`, `aae9b54f0`; merged `25139ce05` |
| W3-F1, W3-F5 — a placed bid's held window emptied his typed words; an admin's held window closed on a leave chip | `leavewar/msq-warfix-held-window-words.test.tsx` (3 of 5 red) | `be714876d` (proof `65d3e03a1`) | `c4d37c091`; merged `25139ce05` |
| W3-F4 — a Tracker save the gate refuses said nothing, and "Save changes" read saved | `tracker/msq-warfix-trk-refused.test.tsx` (3 of 4 red; the control green) | `be714876d` (proof `9f2e29261`) | `48bee3da2`; merged `25139ce05` |
| W2-F1 — a phone (WebKit) tap on a striped day opened a neighbour's window | `leavewar/msq-warfix-row-tap.test.tsx` (a person's row takes no click of its own — the browser-side cause; the real phone is his look) | `be714876d` (proof `233ee6878`) | `50b354612`; merged `25139ce05` |
| Core line 1 — a person's own command could write or change the squadron whose war approved his leave (the stamp "warfix" added) | `state/corelines-lwu.test.ts` (5 of 7 red) | `095df926a` (proof `092ce77e7`) | `a3d721b00`; merged `f99bf3c4d` |
| Core line 2 — the save check let a schedule day newly name a man who is another squadron's that day (W4-F2 at the gate) | `state/corelines-sched-day.test.ts` (4 of 9 red) | `095df926a` (proof `eda7d8aa7`) | `b444b1d83`; merged `f99bf3c4d` |
| Core line 3 — the last-admin rule read an admin's bare role, not his level at home (K3's leftover) | `state/lastadmin.test.ts` (its new cases) | `095df926a` | `6f720c4a8`; merged `f99bf3c4d` |
| Core line 4 (D2160) — the squadron he joined offered a moved-in man his old Scheduler tick in its sign-off boxes | `engine/corelines-sign-tick.test.ts` (2 of 5 red), `engine/reshape-c5-sign-boxes.test.ts` | `095df926a` (proof `32efab0a3`) | `9aba46d07`, `2ee2347dc`; merged `f99bf3c4d` |
| Core line 5 — the bell's reading of an admin who moved, audited: sound through every door | `state/corelines-bell-moved-admin.test.ts` (two cases pinned) | not a fault proof — green on both | `10a3ca8b7`; merged `f99bf3c4d` |

## The pictures

The walk's deciding pictures, copied with their names into `docs/img/handpass/2026-11-21-msq-reshape/` (36, about
3.6 MB): each finding's and one for each high-consequence PASS. Each was opened before it was copied. The walkers'
other pictures (2,144 in all) stay in `D:\raptor-work\walk\W<n>\img\`, outside the repo. The band's drawing check is
in `drawcheck-band/`, the war's and the schedule's drawing comparisons in `war/` and `schedule/` (earlier phases).

| Picture | What it shows |
|---|---|
| `W1-01-03-save-d.png` | Hunter stretching Ranger's leave to 17 Jul: the window stays open, "Blocked: Ranger is 149's from Thu 16 Jul. Only Ranger or an admin of both 142 and 149 can change leave that runs across his move." (PASS, the ruled words) |
| `W1-01-07-delete-after-d.png` | Hunter pressing Delete on that leave: "Blocked: nothing was kept" (the generic words — a question) |
| `W1-03-15-01-course-d.png` | Hunter's Course for Ranger 14–17 Jul: "Blocked: nothing was kept" (a question) |
| `W1-01-07-caldrag-d.png` | the Inputs calendar after Hunter dragged Ranger's 14–17 bar: the bar back in place, no word at all (W1 lead 3, fixed) |
| `W1-05-03-cut-149-undo-d.png` | Kestrel's cut-off back at 14 after Undo; the Undo note's words ("Undid: a rule on the Logic page") are in the walker's log, gone from this picture (W1 lead 4, fixed) |
| `W1-06-02-saved-d.png` | 149's new holiday on Fri 17: the OIL question lists 149's duties only (Osprey, Ranger after his move) (PASS, OIL) |
| `W2-01-t-bane-07-17-press-p.png` | the phone (WebKit): a tap on Ranger's striped Fri 17 opens "Piston Thu 16 Jul" — the man above, the day before (W2-F1, fixed) |
| `W2-01-16-01-142war-d.png` | 142's war on Thu 16: Ranger's and Echo's rows striped from Thu 16, no "PO" (PASS, the move day) |
| `W2-01-16-10-149war-d.png` | 149's war on Thu 16: Ranger's leave approved in 142's war on Fri 24 shown as "LL", his figure "−7" (W2-F2, fixed) |
| `W2-06-16-ad9-03-person-d.png` | 149's person window for Ranger: "LL Mon 20 Jul 1 Approved", app balance "−6" — charged in both wars (W2-F2, fixed) |
| `W2-05-14-02-approve-d.png` | 142's Approvals: Ranger's pending Fri 24 answering "Couldn't decide that — the week is locked, or something else refused it" (W2-F3, fixed) |
| `W2-07-05-kestrel-bell-d.png` | Kestrel's bell on Thu 16: the four postings that ran with nobody of 149 signed in (PASS, the posting pass) |
| `W3-01close-02b-000001-band-p.png` | the band at 00:00:01 on the phone: "You are 149's from today. This can't be saved in 142's Leave War." and "Close" (PASS, the approved words) |
| `W3-01bbid-03-afterleave-d.png` | a placed bid's held window after he left the remarks box: the box empty, his typed words gone (W3-F1, fixed) |
| `W3-02hunter-03-chip-d.png` | after Hunter pressed a leave chip under the band: his window gone, 149's war showing, no word (W3-F5, fixed) |
| `W3-02ranger-01-2358-d.png` | Ranger's Wed 15 window at 23:58: the manning line "No manning row turns amber or red" above his remarks |
| `W3-02ranger-02-000030-d.png` | the same window at 00:00:30: the band, his words kept, the manning line gone (a question — departure from the Q7 drawing) |
| `W3-02osprey-02-000030-d.png` | the control: Osprey, who did not move, at 00:00:30 — his window turned to "Bidding is closed…", his words gone, so the day rule is the war's own |
| `W3-03us-02-000030-d.png` | the Tracker's chart editor at 00:00:30: "You are 149's from today. This can't be saved in 142's Tracker." and "Close" (PASS) |
| `W3-03us-08-fri17-dco-d.png` | the kept 142 Tracker on Fri 17 after a write: the corner reads "saved", no word of the refusal (W3-F4, fixed) |
| `W3-03us-07b-save-after-undo-d.png` | Undo then "Save changes": "saved" with nothing stored (W3-F4, fixed) |
| `W3-06a-04-after-d.png` | Hunter's Edit Schedule just after midnight: the page half-changed, the text he typed dropped with no word (W3-F2, fixed) |
| `W3-06b-04-after-d.png` | Hunter's own appointment "W3MIDB", filed in a window opened on 142's page before midnight, saved onto 149's Inputs calendar on Mon 20 (W3-F3, fixed) |
| `W3-04us-war-03-topbar-d.png` | the top bar's small number "142" over TALON on 149's war after midnight (the "142" family, fixed) |
| `R7-edit-after-reload-d.png` | Kestrel's 149 week after one edit and a reload: Monday holds 142's people (Warden, Ranger, Trident, Piston) (W4-F1, fixed) |
| `W4-02-s6-after-drop-d.png` | Ranger dragged onto 142's Fri 17 "CMD ENGAGEMENT @ CREW ROOM (ALL)" after his move, no word (W4-F2, fixed) |
| `W4-08-s3-hunter-save-refused-d.png` | Hunter's Save on Ranger's row after midnight: "He is 149's. Only an admin of 149 can change his account." (PASS, a right ending at the move day) |
| `W4-03-s9-mon20-signed-kept-ranger-d.png` | 142's Mon 20 after the move: PLANNED BY still "Ranger", "Signed — this day can be published" (known and left) |
| `W4-07-s7-hunter-bell-open-0000-d.png` | Hunter's bell held open at 00:00:30: only "Meeting Fri 17 Jul · You were added · Saber" — the 142 admin lines gone, none struck (PASS, D2218) |
| `W5-01-a1-member-d.png` | Saber making Kestrel a member: "Kestrel is 149's last admin. Make another admin of 149 first." (PASS, D2184 Q10) |
| `W5-02-a1-suspend-d.png` | with Move O: "Kestrel is 149's last admin from Fri 17 Jul, when Osprey moves to 142. Make another admin of 149 first." (PASS, D2217 Q15) |
| `W5-01-c3-hunter-archive-press-d.png` | Hunter's Archive of Kestrel: "He is 149's. Only an admin of 149 can change him." (not a fault — both built sentences stay, D2205 M5) |
| `W5-06-a3-hunter-thu-d.png` | Hunter without Plan on Thu: 149's held note "Kestrel is 149's last admin. The posting waits until 149 has another admin." on Kestrel's row (held — Admin → Users lists both squadrons until step 5) |
| `W5-06-a6-after-nostep-d.png` | after Osprey was made admin, with no other step: "Archived 16 Jul 26 by his posting (Overseas Sqn)" (PASS, the held posting ran once) |
| `W5-03-b2-undo-d.png` | Saber's Undo after making Hunter (Plan of 149) a member: "Undid: Hunter's role" — his role and his Plan both back (RECORDED; the agent's reading of D2199) |
| `W5-08-b1-waiting-p.png` | the waiting screen on the phone: "Waiting for an admin", his details, only "Sign out" — no guest view (PASS, D2239) |

**The re-walks' deciding pictures (22 Nov)** — 22, about 2.5 MB, each opened before it was copied: each still-failing
or new finding's and a few high-consequence FIXED ones; `rw-1-` is round 1 (`e57cb6c3a`), `rw-2-` round 2
(`24f44b903`). The re-walkers' other pictures (1,705 taken in all) stay in `D:\raptor-work\walk\<share>\img\`.

| Picture | What it shows |
|---|---|
| `rw-1-RS-W3-06b-02-0001-d.png` | Hunter (Move H) at 00:01, after opening "+ Input" at 23:52: the window gone, the page jumped to 149's View-only Sched, "HUNTER · MEMBER", his typed words lost, no word (still failing → "core" item 2) |
| `rw-1-RS-W3-03us-07b-save-after-undo-p.png` | the phone: Ranger's Tracker after Undo then "Save changes" — the corner "● saved", nothing stored (still failing → "trksave") |
| `rw-1-RS-ALLAVAIL-03-k-aa-after-save-press-d.png` | Kestrel's ALL AVAIL Meeting for 149's Mon 20 from "+ INPUTS": "Blocked: nothing was kept" (the readers' finding → "inputs") |
| `rw-1-RS-W1-3-02-caldrag-14-to-16-d.png` | Hunter's drag of Ranger's Tue 14 leave bar onto Thu 16 on 142's Inputs calendar: "Blocked: nothing was kept" — the ruled sentence lost (new, words → "inputs" item 10) |
| `rw-1-RL-MOVE2-02-target-press-d.png` | Ranger's ⇄Move of his Wed 15 LL onto his striped Fri 17: "That record changed or is no longer there — nothing to move.", the LL gone from Wed 15 (the readers' A7 finding → "warA7") |
| `rw-1-RL-F2-16-ad2-person-d.png` | 142's person window for Ranger on Thu 16: still "LL Mon 20 Jul 1 Approved" and "LL Fri 24 Jul 1 Approved"; LVE app bal 13, war bal 10.5 (D2243 Q6 → "warA7" item 10) |
| `rw-1-RK-P5-a3-save-press-d.png` | after Saber's Save of the moved-in Hunter's Role box reading Admin: no words, the row still MEMBER (new → "core" item 9) |
| `rw-1-RS-F1-03-editsched-after-reload-d.png` | Kestrel's 149 Edit Schedule after an edit and a reload: 149's own crews on each day (W4-F1 FIXED) |
| `rw-1-RS-F2-03-after-drop-note-d.png` | Ranger's puck dropped on 142's Fri 17 after his move: "This change could not be saved.", Thursday kept (W4-F2 FIXED) |
| `rw-1-RL-F2-16-ad9-person-d.png` | 149's war on Thu 16 (Kestrel): Ranger's person window "No leave in 2026 and ahead.", LVE 0 (W2-F2 FIXED — each war its own leave) |
| `rw-1-RL-F3-16-02-approve-press-d.png` | 142's Approvals on Thu 16: Ranger's pending Fri 24 — "Ranger is 149's from Thu 16 Jul, so this can't go back into 142's Leave War." (W2-F3 FIXED) |
| `rw-2-R2L-I1-02-target-press-d.png` | Ranger's ⇄Move onto Fri 17: "This change could not be saved." and Cancel, the LL still on Wed 15 (FIXED) |
| `rw-2-R2L-I3-OD-02-pressed-d.png` | Hunter's OD 15–17 Jul for Ranger: Wed 15 filed, Thu–Fri striped and empty; the note "1 day filed. This change could not be saved.." (words, being fixed — "r2close") |
| `rw-2-R2L-I6A-02-000030-d.png` | Ranger at 00:00:30 of his move: the page now 149's Balances, his typed "33" in 149's Ranger row, no band (question 15) |
| `rw-2-R2L-I4-01-daylist-d.png` | 142's war on Thu 16: Fri 17's day list "AWAY · 2" without Ranger, his row striped — no door to his hidden approved leave (question 13) |
| `rw-2-R2L-I5-b-drag-save-press-d.png` | the OIL tracker: a +1 credit on 17 Jul for Piston, Ranger and Saber — "This change could not be saved.", none given (question 14) |
| `rw-2-R2L-I7-02-person-thu16-d.png` | 142's person window for Ranger on Thu 16 after the fix: no July line; LVE app bal 13, war bal 10.5 (question 12) |
| `rw-2-R2S-I1-Kestrel-board-04-ALLAVAIL-after-d.png` | Kestrel's ALL AVAIL on 149's Mon 20 board: "Input added to the Common Programme" (FIXED) |
| `rw-2-R2S-I3-04-0001-d.png` | Hunter's input window at 00:01 of his move: the page stays on Inputs (149's, "HUNTER · MEMBER"), the window held with "This change could not be saved." and Close, his words "R2S3MIDNIGHT" kept (FIXED; the band's schedule-side words are question 1) |
| `rw-2-R2S-I4-03-save-press-d.png` | Saber's one Save making the moved-in Hunter admin: "Saved", the row ADMIN (FIXED) |
| `rw-2-R2S-I9s-05-add-press-d.png` | Hunter's "Several people" Training redated to Fri 17: "1 picked" (Ranger), no 142 name offered, Add → "Blocked: nothing was kept" (new, to settle) |
| `rw-2-R2S-I7-inputs-03-0001-d.png` | Hunter's Inputs at 00:01: the settings window opened at 23:57 gone with no word, nothing saved (question 11) |

## The break tests

## Errors seen

- **The source scan left red by Piece B, found by Piece C's wide run (21 Nov 26):** `state/perms-scan.test.ts` (D200 (3) —
  authority decided in one place) failed on three account-role reads Piece B put outside the allowed files
  (`notices.ts adminThen`, `units.ts addUnit` and `setGrant`) and Piece C's own in `lastadmin.ts`. Not a behaviour fault —
  each read an account record's role, which is data — but the guard is what keeps a second gate from growing: all four
  now read `units-model.ts isAdminRole`. Piece B's own runs had covered only the multi-squadron and gate files; from
  Piece C on, a core commit runs the whole unit suite (15,308 passed, 1 failed — F11-4, owed and fail-closed).
- **GitHub red at `24f44b903` (22 Nov 26), the Leave War's browser tests:** every failure at an Undo press — "core"'s
  new Undo reach check blocked the steps of the localhost bridge's admin role over a member's sign-in, which the unit
  suite never takes; fixed in one line by "e2efix" (`f628adba6`), no test changed (the reads, phase 4). Its open note:
  the reach check's other clauses would still block a bridge-raised member's Undo of another man's row (no test hits it).

## What was NOT walked, and why

- **A move itself, and its Undo** — no screen saves or undoes a move, so every move was written into storage as setup
  (the brief's "Move M", "Move H", "Move O"), and the move's Undo before and after its day is carried by
  `state/reshape-r3-undo-move.test.ts`, `state/reshape-r2-move-back.test.ts`, `state/fable-move-undo-after-midnight.test.ts`;
  moving oneself or a master admin by `state/reshape-r1-r7-words.test.ts` (the brief's F28, left out).
- **The re-link (W5-09)** — Admin → Users' person editor has no control that links a sign-in to another person
  ("Give access → On the roster" is a first link); carried by `state/reshape-plan-audit.test.ts` (PA3),
  `state/msq-undo-rights.test.ts`, `state/piece-b-tables.test.ts`. Whether such a screen is meant to exist is a question
  for him.
- **"Restore as …" and a rename** — no such control on an archived row (Restore, Delete, Cancel, the post-in date) (W5-08).
- **D2246's ending** ("Only a master admin or an admin of 149 can make another.") — no seeded sign-in may act but cannot
  make a 149 admin (W5-02); carried by `state/reshape-piece-c-doors.test.ts`.
- **"+ New squadron"** — no screen yet; `state/reshape-piece-c-doors.test.ts`, `state/reshape-b6-squadron-without-admin.test.ts`.
- **W2-02's orders 1 and 2** (Undo onto a day now 149's) — the setup's reload clears the Undo list, so no person's order
  reaches it; `state/war-day-not-its-squadron-gate.test.ts`. Order 3: the striped cell opens nothing, so no removal door
  on the grid (since fixed for a pending bid of the war's own, W2-F3).
- **W1:** a Restore from a deleted group (none exists — D350); the calendar drag on the phone; W1-03's Quals and export
  and W1-06 past publishing on the phone (script); the Holidays sheet's export and import; Edit quals, SANS colours,
  "Every weekday" and Days… with Undo (not reported).
- **W2:** W2-06 on the phone (its approval not reached) and another year; the Osprey round on the phone past sign-in (a
  cell press on the phone did not land); the Inputs "+ New" in the round (not found by the script).
- **W3:** W3-05's variant (the 23:30 leave on Mon 20 is not in 142's war — striped); W3-06 d Publish ("Publish day"
  locked, "4 to sign") and e "Every weekday" (not found in time); W3-07 from Approvals, the other order and the phone
  stack; W3-08 on the phone (its setup's Save timed out three times).
- **W4:** "Who earns OIL" (no control of that name in the weekday ALL AVAIL window); "Every weekday" and a saved plan
  onto Mon 20; a change's jump and the history bubble; W4-05's rename, "Delete plan" and the phone selector; W4-06's
  "Later" and the phone; W4-08's Medical (Ranger has no medical line to move).
- **Three clocks** — the walk's library pins the time zone to Asia/Singapore (+08:00, Perth's and the Tracker's), so
  there is one midnight; his iPhone's zone is his look card's.
- **His look card** (the brief §7): Ranger's held bid window with the keys up on his iPhone; 149's war flicked to its foot
  just after the change; "Export as PDF (print)" of a published 142 day on his iPhone.

## The gate counts

## What the walk found, and each disposition

Every finding was reproduced red by the helper that fixed it before its fix (the cases carried by a test, above); "to
check" items not in any helper's list are the host's to settle.

**Fixed (each red first, its test above):**

| Finding | Walker | Seen | Fixed by |
|---|---|---|---|
| W4-F1 | W4 | after Kestrel's first edit of a 149 day and a reload, 149's other days (Edit Schedule, View-only, Insights, the CSV) read 142's days — a stored week read back under its bare date | "schedfix" |
| W3-F3 | W3 | Hunter's input window, opened on 142's page before his own midnight, saved his record into 149's week | "schedfix" |
| W3-F2 | W3 | Edit Schedule text typed across his midnight dropped on Enter with no word | "schedfix" |
| W4-F2 | W4 | a drag put Ranger on a 142 day after his move, no word | "schedfix" (the door), "corelines" line 2 (the gate) |
| The "142" family | W1, W2, W3, W4, W5 | the top bar's number "142" for every sign-in; Kestrel's CSV "142-schedule.csv" and Quals export "142-LoX-ALL.csv"; the print | "schedfix" |
| W1 lead 3 | W1 | the calendar drag of the 14–17 bar refused with no word | "schedfix" |
| W1 lead 4 | W1 | the late cut-off's Undo note named "a rule on the Logic page" | "schedfix" — the new words ("the late cut-off for inputs" / "…for SANS commitments") are his to confirm |
| W2-F2 | W2 (and W3's "LVE −5", "LVE 0 · OIL −3") | leave approved in 142's war before the move shown and charged in 149's war | "warfix" (a squadron stamp on war-approved leave), "corelines" line 1 (the gate polices it) |
| W2-F3 | W2 | a pending bid on a day now 149's could be neither approved, refused nor removed | "warfix" — Approve refused in D2243's sentence, Refuse in the generic words, the striped day opens the day's list for Delete |
| W2-F1 | W2 | a phone (WebKit) tap on a striped day opened a neighbour's window | "warfix" — his iPhone stays his look |
| W3-F1 | W3 | a placed bid's held window emptied his typed words | "warfix" |
| W3-F5 | W3 | Hunter's held window closed in silence on a leave chip | "warfix" |
| W3-F4 | W3 | the kept 142 Tracker refused a write in silence; "Save changes" read saved | "warfix" |
| K1–K5, the delete's meeting | Fable's sign-in kinds table (job 2), none reachable on screen today | see the cases above | "kinds" |
| The meeting | the host's own find | a 149 ALL AVAIL meeting moved to 142 | "meeting" |
| A moved-in man's old Scheduler tick offered in 149's boxes | "kinds"' leftover | — | "corelines" line 4 |

**Questions for him:**

1. The band's words on the schedule side: the held input window and a schedule box say the generic "This change could
   not be saved." — the Q7 sentence is the war's and the Tracker's only ("schedfix").
2. The Undo note's new words for the late cut-off ("schedfix", W1 lead 4).
3. The generic "Blocked: nothing was kept" for a course, a medical, its end or cut-short, and a Delete across a move
   (W1-01, W1-03; pictures `W1-01-07-delete-after-d.png`, `W1-03-15-01-course-d.png`) — D2240's sentence names leave only.
4. The manning line's loss after midnight on a day now in the past, against the Q7 drawing (drawn on 24 Jul) — Osprey,
   who did not move, loses his window to "Bidding is closed…" too, so it is the war's day rule; a departure to show him
   (pictures `W3-02ranger-01-2358-d.png`, `W3-02ranger-02-000030-d.png`, `W3-02osprey-02-000030-d.png`; D1426, D1478).
5. Is a screen to re-link a sign-in to another person meant to exist (W5-09)?
6. After "warfix", 149's war shows nothing of 142's for a man who joins it — his leave there starts at "LVE 0" until
   typed (the agent's reading, no ruling).

Gathered from the fix read and the re-walks (22 Nov):

7. The ✕ on 142's Tuesday for a request across a move — Ranger's 14–17 Jul request lands on 142's Tue 14; after his
   move Hunter's ✕ there answers "Couldn't save that — try again": may 142's admin take it off his own Tuesday, or
   should the ✕ say a D2240-style sentence? (fable-1 F4 b; D2221)
8. 149's holiday OIL list holds an input across a move its admin can never answer — Ranger's Training 15–17 Jul, moved
   16 Jul; Kestrel makes Fri 17 a 149 holiday; Yes and Save → "Blocked: nothing was kept", the line stays for good,
   "Yes to all" refused whole: save the rest and say D2240's sentence, or let an OIL answer alone pass for the squadron
   the input sits in that day? (fable-3 F4)
9. An admin taking back his own man's move before its day — Hunter moves Ranger to 149 from tomorrow, then cannot put
   him back ("This change could not be saved."); only a master admin can, before midnight (fable-2 F4).
10. A mixed meeting between a man's move and his take-out reads as the other squadron's — a 149 ALL AVAIL meeting with
    Osprey added; Osprey moves to 142 from Thu 16; until he takes himself out the meeting reads as 142's (opus-1 F3).
11. The settings windows (Inputs, SANS, Calendar) close without a word on a squadron change — opened at 23:57, gone at
    00:01, nothing saved — an exception to D1623, where only the Calendar window's own ✕ or Escape closes it ("inputs";
    R2S item 7, `rw-2-R2S-I7-inputs-03-0001-d.png`).
12. 142's LVE still counts approved leave hidden after the move — Ranger's Mon 20 and Fri 24 LL, approved in 142 before
    his move, are off 142's person window, but its LVE still reads war balance 10.5; not counting them would read 2 days
    higher ("warA7"; R2L item 7, `rw-2-R2L-I7-02-person-thu16-d.png`).
13. A hidden approved leave has no removal door in the old war after the move — Ranger's approved Fri 17 is off the
    grid, the day's list ("AWAY · 2" without him), Approvals and the person window, so send-back, Delete and Undo
    cannot be pressed (R2L item 4, `rw-2-R2L-I4-01-daylist-d.png`).
14. One moved man in an OIL drag pick refuses the whole pick — Hunter's +1 credit on 17 Jul for Piston, Ranger and
    Saber: "This change could not be saved.", Piston and Saber get nothing too; the grid's Grant OIL "Give FO" over
    Wed 15–Fri 17 writes Wed 15 only, with no word (R2L item 5, `rw-2-R2L-I5-b-drag-save-press-d.png`).
15. The Balances page swaps to the new squadron's at midnight with his typed figure in the new row and no band —
    Ranger types 33 at 23:58; at 00:00:30 the page is 149's Balances, "33" in 149's Ranger row; leaving the box says
    "This change could not be saved." and nothing is stored (R2L item 6A, `rw-2-R2L-I6A-02-000030-d.png`).

**Known and left:**

- The browser tab's static title "142 Flying Programme" (`index.html`) — "schedfix" left it.
- The Quals page still shows a moved-in man's old Scheduler tick ticked (149's admin unticks and ticks to give it anew)
  — "corelines".
- A signature stored before the move counts by the bare tick: Mon 20's PLANNED BY "Ranger" kept and published (W4-03,
  `W4-03-s9-mon20-signed-kept-ranger-d.png`).

**Not a fault, or held on purpose:**

- Hunter's Archive of a 149 man says "…can change him." where Save, Suspend and Delete say "…can change his account."
  (W5-01) — both are built sentences D2205 M5 keeps (the host's reading).
- A 142 admin without Plan sees 149's held-posting note on Kestrel's row (W5-06), and Kestrel's "On the roster" list
  offers both squadrons' people (W5-08) — Admin → Users lists both squadrons until step 5 (held).
- The posting sheet gives today's last-admin sentence for a post-out after a dated gap (W5-02 — no ruled sentence; RECORDED).
- The demo's built-in today is Mon 13 Jul whatever the clock ("Monday Jul 13 · Today", Medical "as of 13 Jul" — W1, W4).
- "Request access" names no squadron (B7, held); the Tracker not re-read in place at midnight (it moves at the next
  sign-in); the band's generic "This change could not be saved." on a later day (held — the walk brief §5).
- W2-02: the Undo list does not survive the setup reload (a reload is not a person's act — the test carries it).
- What Undo puts back after Plan ends with a demotion: role and Plan both (W5-03) — the agent's reading of D2199, to tell
  him.

**For the host to settle (RECORDED or odd, in no helper's list):**

- W1 lead 6: the mixed meeting "Hunter, Ranger, ALL AVAIL" shows on both squadrons' lists and days — against D2243 Q1's row.
- W1 lead 7: the ALL AVAIL crowd window says 40 where its chip says 41.
- W1 round: a tap outside leaves the input window open (W4's round: it is a side window with no veil).
- W2: the range window says "4 days" over striped days, and "already holding leave or a medical" for days that are
  149's (W2-01, W2-03 — words).
- W2-04: after a member removes his refused bid, no screen shows who refused it and when (the record keeps it —
  `state/reshape-r6-refusal-stamps.test.ts`).
- W2-07: Raven's posting line reads "9 h" where the others read "now"; Ranger's posting set before his move — tagged on
  Thu, nothing by Mon 20 (the plan §6.5: skipped by both passes; D2221 not built).
- W3: 149's war opens at about 19 Jul with AUG lit after the change; two presses of a group's remove ✕ under the band
  in ⚙ Settings removed nothing, no word (the script's own ✕, W3-07).
- W4-07: a new 142 decision on Ranger's own leave after his move tells his bell nothing; Ranger's read line gone, not
  struck "taken back", seen only with two live tabs (not reproduced in one); Kestrel's change to the remark refused by
  Q8's sentence with the brief's own dates (the walker used Ranger's change — PASS).
- W4 and W5: Admin → Users' "Post in" date stays Wed after midnight with the page open (lesson 29, low).
- W4: Pacer, added with post-in Wed 15, offered in 142's palette on Mon 13 and Tue 14.
- W5-08: no welcome-back card at Ranger's Thu sign-in after his move.
- R2S 9b (the second re-walk, new): "Several people" redated past the picked man's move leaves him picked and
  un-pickable, no 142 name offered, Add → "Blocked: nothing was kept" (`rw-2-R2S-I9s-05-add-press-d.png`).

**RE-WALK (22 Nov)** — what the two rounds of the re-walk saw (the walkers and builds under "The orders walked"); the
deciding pictures opened and copied with an `rw-` prefix (below, "The pictures").

*Round 1, on `e57cb6c3a` (RS, RL, RK) — FIXED on screen:* W4-F1 (Kestrel's week after a reload, View-only, Insights,
the CSV "149-schedule.csv"; d, p); W4-F2 (the drag refused "This change could not be saved.", Ranger stays on Thu,
Friday's lists do not offer him); W3-06 a (cell text across midnight: nothing stored, the generic words — his typed words
not kept); W3-03 (the Tracker band and Close; the Fri 17 write refused with its box and status); the "142" family (the
top bar 149 at 00:00:30, the CSV, the print, Quals' "149-LoX-FCP.csv"); W1 lead 4 ("Undid: the late cut-off for
inputs" / "…for SANS commitments"); W2-F1 (no striped day opens a window, WebKit and Chromium phone); W2-F2 (149's war
holds no 142 leave, LVE 0; no day in both wars); W2-F3 (Approve in D2243's sentence, Refuse "This change could not be
saved.", the striped Fri 24 opens the day's list and Delete removes it); W3-F1 and W3-F5 (the band, his remarks kept, a
chip does nothing under it); K1 and K3 (the member view, a moved admin a member from his move day); the last-admin
words and their Undo. Move H's sign-off boxes PASS.

*Round 1 — still failing or new, and where each went (all reproduced by the host):*

| What the re-walk saw | Walker | Went to | Seen fixed |
|---|---|---|---|
| Hunter's input window open across his midnight: nothing saved into 149's any more, but the window closed with no word, the page jumped to View-only Sched, his words gone (W3-F3's remainder — the full session reset) | RS | "core" item 2 (the Undo list and open windows kept at a midnight access change) | round 2, R2S item 3 |
| The Tracker on the phone: Undo then "Save changes" read "● saved" with nothing stored (W3-F4's remainder) | RS | "trksave" (a refused chart save leaves no empty Undo step) | round 2, R2L item 9 |
| ALL AVAIL / ALL refused for 149 at every door ("Blocked: nothing was kept") — the readers' finding | RS | "inputs" item 2 | round 2, R2S item 1 |
| The calendar drag of Ranger's Tue 14 bar onto Thu 16 back to "Blocked: nothing was kept" — the first walk's fix of W1 lead 3 undone by a later change (words) | RS | "inputs" item 10 (D2240's sentence over the whole span) | round 2, R2S item 8 |
| ⇄Move of a waiting bid onto a day after his move: "That record changed or is no longer there — nothing to move." and the bid gone — the readers' A7 finding | RL | "warA7" item 1 | round 2, R2L item 1 |
| 142's person window still lists leave approved before the move (D2243 Q6 — "kept out of sight in the old war") | RL | "warA7" item 10; whether 142's LVE still counts it is question 12 | round 2, R2L item 7 |
| Saber making the moved-in Hunter 149's admin: the Role box already read Admin, Save said nothing, he stayed a member (two saves needed) | RK | "core" item 9 (the box opens on his role today) | round 2, R2S item 4 |
| Archive's "…can change him." where Member, Suspend and Delete say "…can change his account." | RK | not a fault — D2205 M5 keeps the built words (`24f44b903`; "core"'s report had proposed changing them) | — |

*Round 2, on `24f44b903` (R2L, R2S) — FIXED on screen:* ⇄Move of a bid (Ranger onto Fri 17, d p; Hunter onto Mon 20)
and of approved leave (Hunter onto Thu 16, Saber onto Fri 17): "This change could not be saved.", nothing moved, no
bell line; a duty filed 15–17 Jul for Ranger files Wed 15 only, nothing on 16–17 in either war; OIL awards on Fri 17
refused; the Balances box and bid remarks across midnight store nothing; 142's person window lists no July line; the
posting tag "POSTING OUT 20 JUL · OVERSEAS SQN" for another squadron's man; the Tracker after an Undo never "● saved";
ALL AVAIL / ALL for 149 from the board, Inputs and Osprey's own window; Osprey's take-out keeps the meeting 149's; the
input window held at midnight with the band and Close, his words kept, nothing stored; the moved admin made admin in one
step; Undo across a squadron change ("Something else changed this after your action — it can't be undone now. Press
Undo again for: Saber's quals.", then "Undid: Saber's quals"); the SANS day 142's; Delete and the drag in D2240's
sentence; a picked man's puck kept; Kestrel's edit, Undo and "+ Alt Plan" on 149's Thursday with 142's Tuesday intact.

*Round 2 — still failing or new:*

| What the re-walk saw | Walker | Disposition |
|---|---|---|
| A duty filed across his move: the note "1 day filed. This change could not be saved.." — two full stops, and it does not say two days were skipped or why (words) | R2L item 3 | being fixed — "r2close" item 4 (one body for the note) |
| "Several people" Training redated from Tue 14 to Fri 17 with Ranger the only one picked: no 142 name offered, Ranger cannot be un-picked, Add → "Blocked: nothing was kept", the window stays (control: on Tue 14 the last puck cannot be un-picked either, every name stays offered) | R2S item 9b | new, to settle (the host) — `rw-2-R2S-I9s-05-add-press-d.png` |
| The settings windows closing at midnight with no word; 142's LVE counting hidden leave; a hidden leave with no removal door; a drag pick refused whole; the Balances page swapped under his typing | R2S item 7; R2L items 7, 4, 5, 6A | questions 11–15 |

Seen in passing, recorded, for the host: the Tracker's refusal words cut at desktop width; a moved Hunter with a
Tracker event pop-up open at midnight lands on 149's View-only Sched, the pop-up gone (he is a member from his move day);
a role or Suspend change in 149 rings no bell; the Undo across a squadron change says "Something else changed…" when
the cause was the move; the date picker rings 13 Jul as today (the demo's own today); MY LEAVE "LVE 0" for a man who
joined 149 (question 6); no screen lets Ranger choose a leave's squadron.

*The plain-user rounds:* every round PASS and none worse than the first walk — RS and R2S publish, AL1 (on the phone
too in round 2), Undo, the bell, View-only, Inputs, Quals and Admin → Users for five sign-ins; RL and R2L the war
(approve, Grant OIL, Balances, the below-zero ask) and the Tracker (DCO, "● saved", Undo) for Ranger before and after
his move and for Hunter; RK sign in and out, an own SANS tick, an own Appointment filed and deleted, the bell. Older,
not worse: My leave stays open on a tap outside; the phone's row tint hides the stripes while a window is open; WebKit
cuts the Tracker's chooser words.

Not re-walked: R2L item 4's buttons (no door — question 13), item 5's drag on the phone; RS's phone AL1 (walked in
round 2), Saber across both squadrons (no Schedules menu); RK D2260's words (no route: no master admin control).

## The reads (phase 2: Fable's blind read of the core's rights change; phase 4: the four-reader fix read)

### Phase 2 — Fable's blind read of the core's rights change (his D2244), 21 Nov 26

On an exported copy of `6c0908481` (the code, no records), brief and report word for word in
`docs/superpowers/briefs/2026-11-21-msq-reshape-fable-read-brief.md` and `…-fable-read-report.md`. Four findings, each
reproduced red in this checkout before it counted (10 red, 3 controls green), each fixed as Fable specified and green
after; the whole unit suite run after the fixes. No right found holding where it should not.

| # | Finding | Severity | Fix | Proof (red on `6c0908481`, green after) |
|---|---|---|---|---|
| 1 | The first admin's move into his new squadron could never be taken back or undone — the lock read his date as home-only | HIGH | `lastadmin.ts`: a home admin of that date who still counts there by his own Plan after the step keeps the squadron | `state/fable-first-admin-takeback.test.ts` |
| 2 | Making a squadron's only Plan admin a master admin: the door let through what the gate refused ("That did not save") | MED | `accounts.ts setMaster` asks the lock at the door | `state/fable-master-mark-lock.test.ts` |
| 3 | Six squadron doors (move, take in, View given or taken, a place moved, "+ New squadron" by a non-master) showed the gate's raw reason | MED | `units.ts said()`: a refusal raised inside a command keeps its words, everything else the generic words (as `saidOf`) | `state/fable-unit-doors-raw-reason.test.ts` (6) |
| 4 | A move's Undo after its day began jammed his whole Undo list ("just now" on every press) | MED | `undo/timeline.ts refusedFor`: "changed for a day already begun" is blocked for good, in today's words | `state/fable-move-undo-after-midnight.test.ts` |

Fable's "one thing for the owner" (not a fault — the plan's §5.3 reading): once a squadron has an admin at home, a Plan
holder no longer counts for it — put to him (the block's questions).

### Phase 4 — the four-reader fix read (his D2236), 22 Nov 26

Ten blind readers, each on its own exported copy of `07c97a3ec` (the code, no records), briefs
`docs/superpowers/briefs/2026-11-21-msq-reshape-fixread-*`: Astra (GPT-6 Astra by Codex, read-only) on shares 1–3, a
fresh Opus on shares 1–3, a fresh Fable on shares 1–3, and a fresh Fable security reader on the whole reshape. Astra
runs nothing: its proposed tests were written into its copies and run by the host — 10 of 10 red. The Claude readers ran
their own proofs; the host ran every claim red again before it counted. Reports `D:\raptor-work\reads\reports\`, proofs
`D:\raptor-work\reads\proofs\<reader>\` (outside the repo).

**The fixes (round 2), each red first, merged into `claude/multi-sqn-b1-107`:** "inputs" (Fable, `16c091ca4`), "warA7"
(Fable, `f3a76625d`), "core" (Fable, `645a9bbb4`), with "trksave" (Opus, `a1529addd`, the re-walk's Tracker find). The
host re-ran each helper's red tests on its base: "inputs" 32 of 53 red on `74c98ea09`; "warA7" 27 of 29 red, its 2
controls green; "core" 28 failed, its 2 setup-changed older files green; "trksave" 3 of 4 red on `2a04aaa99` — all
green after the merges. Whole unit suite at `24f44b903`: 15,830 passed, 1 failed (the known double-tap timing test,
green alone), 1 expected fail. Then "e2efix" (Fable, `f628adba6`): GitHub's run at `24f44b903` was red in the Leave
War's browser tests — one cause, "core"'s Undo reach check blocking every step of the localhost bridge's admin role over
a member's sign-in (the tests' Undo presses); one line, no test changed, a red unit test added; the Leave War browser
spec 466 passed, 0 failed after. Merges: `git log --first-parent 7b7d9d847..1c49ba3c5`.

Below, "red" is the host's re-run; a fix names its helper and item. "His" = put to him (the questions list above).

**Astra, share 1 (Inputs, calendars, SANS, own pages)**

| # | Finding | Severity | Red | Disposition |
|---|---|---|---|---|
| 1 | Saber's Inputs settings window, kept open while he picked 149, switched off 149's "Members may file duties for others" instead of 142's | HIGH | yes | fixed — "inputs" 5 (the switch read and written for the window's squadron), `16c091ca4` |
| 2 | Kestrel cannot add an ALL AVAIL meeting through the input window: the door's draft carries no squadron stamp, read as 142's | HIGH | yes | fixed — "inputs" 2 (the door's draft carries filer and stamp) |
| 3 | A Calendar window kept open across a squadron pick: its Holidays half follows the loaded war and adds to 142's | HIGH | yes | fixed — "inputs" 6: the window closes on a squadron change (no word — question 11); the Holidays half's own squadron left with the war's writers |
| 4 | Ranger, moving tomorrow, opens Fri 17 on his 142 SANS calendar: commitments 149's, figures 142's | MED | yes | fixed — "inputs" 4 (the page's squadron today) |

**Astra, share 2 (rights, Undo, Admin → Users)**

| # | Finding | Severity | Red | Disposition |
|---|---|---|---|---|
| 1 | An admin who moves loses his whole Undo list at midnight (the access change ran the full sign-in reset) | MED | yes | fixed — "core" 2 (same account and person keep the list, page and windows) |
| 2 | Undo that would take the last Plan admin of a squadron says "That couldn't be completed just now.", not the last-admin sentence | MED | yes | fixed — "core" 3 |

**Astra, share 3 (the Leave War, OIL, postings, the Tracker)**

| # | Finding | Severity | Red | Disposition |
|---|---|---|---|---|
| F1 | ⇄Move of a waiting bid onto a day now 149's removes the bid and lands nothing | HIGH | yes | fixed — "warA7" 1 (refused before anything moves; any refused write rolls the whole move back), `f3a76625d` |
| F2 | Approved leave moved onto a day now 149's is accepted, still 142's | HIGH | yes | fixed — "warA7" 2 and 5 (the doors refuse; the gate and Undo judge war-approved leave added on a foreign day) |
| F3 | A moved master admin still saves into the kept 142 Tracker under the band | HIGH | yes | fixed — "core" 6 (a Tracker not the page's squadron today refuses, masters included) |
| F4 | A moved master's bid remarks save under the midnight band when he leaves the box | HIGH | yes | fixed — "warA7" 8 |

Astra's builder's choice 13 (the Undo of a deleted approval restoring it): his — already filed as
`[LW-DELETE-POSTING-RESTORE]`, not a proven fault.

**Fable, share 1**

| # | Finding | Severity | Red | Disposition |
|---|---|---|---|---|
| F1 | Work on 149's Thu 16 (a plan switch, Undo, template, version) rewrites or is refused over 142's accepted filing mark of a request landing on 142's Tue 14 | HIGH | yes (5 red, 2 controls green) | fixed — "inputs" 1 (the filing marks walk the input's first day only; not Fable's "day and first day" form, since a request lands on the old squadron's later days too) |
| F2 | The SANS day window (= Astra 4, Opus F4) | HIGH | yes | fixed — "inputs" 4 |
| F3 | An existing input changed to ALL AVAIL alone is refused at the door, though the save would pass | MED | yes | fixed — "inputs" 2 |
| F4 a | Hunter's Delete of Ranger's leave across the move answers "Blocked: nothing was kept", not D2240's sentence | MED | yes | fixed — "inputs" 7 |
| F4 b | Hunter's ✕ on the request on 142's Tue 14 → "Couldn't save that — try again" | MED | yes | his — question 7 |
| F5 | In "Several people" a picked man vanishes when the date moves past his move | LOW | yes | fixed — "inputs" 8 (a picked man's puck kept); the re-walk's 9b is its neighbour, to settle |
| F6 | The calendars' "How this works" cut-off sentence reads the pick's rule (dormant) | LOW | yes | fixed — "inputs" 9 |

**Fable, share 2**

| # | Finding | Severity | Red | Disposition |
|---|---|---|---|---|
| F1 | Undo / Redo of a right that would leave a squadron with no admin gives no reason and jams the list | MED | yes | fixed — "core" 3 |
| F2 | Other permanent refusals still jam Undo (a removed squadron; a moved first admin's older step) | MED | yes | fixed — "core" 1 (the reach check: an unreachable step is blocked once, "Press Undo again for: …"); its input-step neighbour is round 2's F1 |
| F3 | A hand-made Scheduler tick record follows a man into the squadron he joins | LOW | yes | fixed — "core" 4 |
| F4 | An admin cannot take back his own man's move before its day — only a master admin can | LOW | yes | his — question 9 |

**Fable, share 3**

| # | Finding | Severity | Red | Disposition |
|---|---|---|---|---|
| F1 | ⇄Move of a waiting bid onto a day now 149's deletes it (= Astra F1, Opus F1) | HIGH | yes | fixed — "warA7" 1 |
| F2 | Approved leave slid onto a day after the move; Hunter's OD 15–17 across the move filed nothing, the honest 15th lost, the window closed as filed | HIGH | yes | fixed — "warA7" 2 and 3 (a filed duty skips the other squadron's days and counts the store) |
| F3 | A figure typed on 142's Balances before his own midnight saved into 149's war | MED | yes | fixed — "warA7" 7 (the box remembers its squadron); its band neighbour is round 2's F3 |
| F4 | 149's holiday OIL list holds an input across a move its admin can never answer; one row refuses the whole save | MED | yes | his — question 8 |
| F5 | OIL awards still given on a day now another squadron's (the reader: his to decide) | LOW | yes | fixed — "warA7" 6 (awards refused there; the gate and Undo read awards) |
| F6 | Admin → Users' posting tag missing for another squadron's man | LOW | yes | fixed — "warA7" 9 |

**Opus, share 1**

| # | Finding | Severity | Red | Disposition |
|---|---|---|---|---|
| F1 | 149's admin and members cannot file ALL AVAIL / ALL through the input window; 142's pass for any squadron | HIGH | yes (4 cases) | fixed — "inputs" 2 |
| F2 | A forged squadron stamp on an input that names people is never judged; a take-out then leaves the meeting on 149's schedule | HIGH | yes | fixed — "core" 5 and 7 (the stamp and filer judged while men are named; a take-out passes only where the stamp is kept) |
| F3 a | A 149 ALL AVAIL meeting moves to 142 when Osprey, moved to 142, takes himself out | MED | yes | fixed — "inputs" 3 (a placeholder input keeps its stamp while men are named) |
| F3 b | Between the move and the take-out the mixed meeting reads as 142's | MED | yes | his — question 10 |
| F4 | The SANS day window | MED | yes | fixed — "inputs" 4 |
| F5 | A cut-off or look-ahead save for another squadron says saved when refused; the settings windows stay bound across midnight; the members' switch | LOW–MED | yes (2) | fixed — "inputs" 5 (read back, "This change could not be saved."; the windows close on a squadron change) |

**Opus, share 2**

| # | Finding | Severity | Red | Disposition |
|---|---|---|---|---|
| F1 | An Undo of a step the actor can no longer reach jams his whole list ("That couldn't be completed just now." every press) | MED | yes (2) | fixed — "core" 1; the input-step neighbour is round 2's F1 |
| F2 | A hand-made command lets the old squadron's admin plant a Scheduler tick counting in the joining squadron | MED | yes | fixed — "core" 4 |
| F3 | The Redo of a squadron-row-only step that would leave no admin answers the generic words | LOW–MED | yes | fixed — "core" 3 |

**Opus, share 3** — the reader's pattern: "a day now another squadron's takes nothing new" was checked only at the
war's cell writer.

| # | Finding | Severity | Red | Disposition |
|---|---|---|---|---|
| F1 | ⇄Move of a waiting bid onto Fri 17 after the move: the bid on neither day | HIGH | yes | fixed — "warA7" 1 |
| F2 | Approved leave moved onto Fri 17: "moved", 142's war holds it | HIGH | yes | fixed — "warA7" 2 and 5 |
| F3 | Approved leave on Fri 17 sent back to waiting: the leave gone, no bid | MED | yes | fixed — "warA7" 4 |
| F4 | Approved leave on Fri 17 deleted after the move, then Undo: back in 142's war | HIGH | yes | fixed — "warA7" 5 (Undo in D2243 Q3's sentence) |
| F5 | An OIL award on Fri 17 after the move: 142's ledger holds it | MED | yes (2) | fixed — "warA7" 6 |

The reader's builder's choice 13 (a person delete's Undo never counting a removed approval — older code): filed with
`[LW-DELETE-POSTING-RESTORE]`; its "outside share" (a duty filed from 142's war onto a 149 day) is Fable's F2, fixed.

**Fable, security (whole reshape)**

| # | Finding | Severity | Red | Disposition |
|---|---|---|---|---|
| 1 | A 142 member (or plain admin) plants an ALL AVAIL meeting on 149's schedule by a forged stamp then a take-out (three routes) | HIGH | yes (3) | fixed — "core" 5 and 7 |
| 2 | A 142 admin gives his man 149's Scheduler tick (= Opus F2, Fable F3) | MED | yes | fixed — "core" 4 |
| 3 | 149's admin, once Hunter holds Plan of 149, rewrites a 142 admin's read records and deletes 142's lines from his bell | MED | yes (2 red, the control green) | fixed — "core" 8 (read records by the person's home squadron; the audience rule only for a line wholly that squadron's) |

In all: 44 claims (many the same fault seen by two or three readers), every one run red by the host; 40 fixed red
first, 4 his to decide (questions 7–10). Each reader's tidiness note is filed, not fixed (the big files that took the
new rules: the input editor, the gate, the war's sync). Where a helper chose another fix than the reader's, its report
names it: "inputs" item 1's first-day walk; "warA7"'s refusal reason ("away", Fable's, not Opus's "window"); "inputs"
left `perms.ts membersFileOn` and added a squadron-taking twin.

### Round 2 — Astra's read of round 2's fixes (`74c98ea09..24f44b903`), 22 Nov 26

Astra, read-only, on a copy with the round's patch and the ten readers' reports: did each fix close its finding and the
doors beside it, open a new hole, or contradict a ruling? Every earlier finding closed in source except three
neighbours; no new hole, no other contradiction. Report `D:\raptor-work\reads\reports\r2-astra.md`.

| # | Finding | Severity | Red | Disposition |
|---|---|---|---|---|
| F1 | Undo still jams on an input step after the actor loses Plan — Hunter's Meeting for Osprey refuses every press, his earlier View change never reached (neighbour of Opus-2 F1, Fable-2 F2) | MED | yes, on the tip | being fixed — "r2close" (the reach check asks the gate's own input rule) |
| F2 | The Undo of shortening approved leave to a morning puts the afternoon back into 142's war on a day now 149's (neighbour of Astra-3 F2, Fable-3 F2, Opus-3 F2 and F4) | HIGH | its test failed in its setup; re-written through the real path (the row lookup only), then red for the finding's reason | being fixed — "r2close" (the part of the day compared, not only the day) |
| F3 | A figure typed in a master admin's person window in 142's war across midnight saves under the band (neighbour of Fable-3 F3, Astra-3 F4) | HIGH | yes, on the tip (33 saved) | being fixed — "r2close" (the box also checks the band) |

"r2close" also carries the re-walk's two full stops in a filed duty's note (its item 4).

## The Walk line

`Walk: docs/handpass/2026-11-21-msq-reshape.md · FULL · the walk (5 Opus walkers) and two re-walks (5 Opus walkers) · 58 pictures kept (3,849 taken: 2,144 the walk, 1,705 the re-walks) · 47 surfaces · 37 orders + 5 plain-user rounds, re-walked: 39 orders (21 in round 1, 18 in round 2) + 5 plain-user rounds · MISSING: 13 the walk found, all fixed red first and seen fixed on screen; the ten-reader fix read 44 claims, 40 fixed red first, 4 his to decide; the re-walks 7 still failing or new — 5 fixed red first, 1 being fixed ("r2close"), 1 to settle (R2S 9b); Astra's round-2 read 3 neighbours, being fixed ("r2close"); 15 questions for him; 3 known and left`
