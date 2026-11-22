# The reshape's walk — sizing, roll-call, merged scenarios and the walkers' brief (21 Nov 26, chat 131)

Written by the helper "walkprep" for the host of chat 131 (the multi-squadron reshape's FULL check, branch
`claude/multi-sqn-b1-107`, tip `2d1837646`). Sources: the two blind scenario designs (Astra's S01–S30, the fresh Opus
reader's F1–F30 with gaps G1–G17, kept outside the checkout until both reported), their brief
`2026-11-21-msq-reshape-scenarios-brief.md`, the reshape plan §3.5, §4.6, §5.5, §6.5, §11–§14, the evidence sheet
`docs/handpass/2026-11-21-msq-reshape.md`, the rulings' full rows, `docs/walk-scripts.md`, the bug-check order §2a, §4,
§7.0–§7.11, §10 (21), the walk ledger. The shared library is `scripts/handpass/msq/msq-rs-lib.mjs` (smoke-tested on the
frozen build `index-CCRzWlJB.js`, §5 below). Words in "quotes" are the app's or a ruling's words.

**Names.** Saber = `ad` (142 admin, master admin, person `stiff`); Hunter = `ad2` (142 admin, `prowler`); Ranger = `us`
(142 member, `bane`); Kestrel = `ad9` (149's only admin, `kes9`); Osprey = `us9` (149 member, `osp9`). 149 also has
Merlin, Harrier, Condor, Falcon, Heron, Raven, Shrike, Gannet. Nothing on screen prints a squadron's number except the
top bar's small "142"/"149" over TALON and a few sentences — tell the squadron by its people.
**Days** (July 2026, Perth = Singapore time, +08:00): Tue 14, **Wed 15 = M−1**, **Thu 16 = M (the move day)**, Fri 17 =
M+1, Mon 20, Fri 24. **SETUP shorthands** (storage, through the library, the only bridge writes allowed): **Move M** =
`saveMove(w,{pid:'bane',from:'u142',to:'u149',day:'2026-07-16'})`; **Move H** = the same for `prowler`; **Move O** =
`osp9` from `u149` to `u142`, day `2026-07-17`; **Plan H** = `giveRight(w,{account:'acad2',unit:'u149',level:'admin'})`;
**View R** = `giveRight(w,{account:'acus',unit:'u149',level:'view'})`. Everything else — inputs, leave, bids,
holidays, postings, roles, ticks, publishing — is made through the app's own controls (the order's §7.7).

---

## 1. The five sizing lines (§7.0 — ready to paste into the evidence sheet)

1. **The type of change:** A (one answer to "whose is he on a day" inside shared readers), D (each page draws the
   answer by its own call — crew lists, sign-off boxes, the war's striped rows, the Inputs lists, the bell), C (a new
   mode: a window held at midnight with the band and its "Close"), G (saved data: rights read as dated rows, Undo across
   a move and across midnight, the posting pass over every squadron) and H (who may do what: the last-admin rule at every
   door, Plan, a right ending at the move day). FULL tier (questions 1, 2, 3, 7 YES).
2. **What only a walk could find here:** a page whose own call still reads today, or the loaded squadron, where the
   shared reader now takes a day (the "never wired up" kind — some twenty surfaces draw the answer separately, roll-call
   §2); a door that reaches the gate's generic words instead of the ruled sentence; the band on each war window and on
   the Tracker's chart editor at midnight, in WebKit by touch and in Chromium, and each of its four ways to close; the
   orders around the move, midnight and Undo on screen; what a phone's tap leaves. The tests named in the sheet's
   "cases carried by a test" prove the rules by calling the state directly — they prove no door, no page and no order
   of presses (§7.0: "a test that changes the state directly does not prove that the screen offers a working route").
3. **What the ledger says** (type A/D/G/H, this branch): 18 Nov FULL — two walkers, 287 pictures, found 1 of the 13
   faults (the reads found 12); 18 Nov WALK — one walker, 62 pictures, about 12 min, found 0; 19 Nov FULL — three
   walkers, 744 pictures, then one re-walker, 141 pictures, about 17 min, found 0 in the app (the reads 11); 20 Nov Plan
   audit — one walker, 105 steps, 210,000 tokens, found 0. On this branch the walks found few faults and the walkers'
   own scripts made several false ones (the wrong window read, the wrong figure, a brief's control that was not on
   screen). So: sized to the surfaces and orders only a walk proves, the host's own short route first, every EXPECTED
   line sourced.
4. **The walk chosen:** five Opus walkers (his D2256, which narrows D787 for now) in parallel, each in its own fresh
   browser storage on the host's one frozen build — W1 Inputs, calendars, holidays and OIL; W2 the Leave War, its money
   and the posting pass; W3 midnight, the man who moves; W4 the schedule, publishing, the bell and the bystanders at
   midnight; W5 rights, people and the admin doors. **38 merged scenarios** (37 walked, 1 NOT WALKED — no door) from
   both designers' 60, plus **five plain-user rounds**, one per seeded sign-in (D1557). Every scenario at desktop 1536 ×
   864 Chromium and iPhone 402 × 874 WebKit by touch unless marked; no sizes beyond those (no page fitted to the screen
   changes layout — lesson 31 and the narrow-desktop rule do not apply, §6). **The drawing check:** the midnight band
   (`scripts/drawcheck/specs/msq-midnight-band.mjs`, four states) is run by the host on the same frozen folder, beside
   W3; the war's striped rows (q6b, q6c, q6d) and the dated last-admin refusal (picture 9b, `docs/mock/2026-11-19-multi-
   sqn-pieces/img/p9-d.png`) have no part list — compared by eye, side by side, in W2-01/W2-02 and W5-02, and said "not
   measured". **Carried by tests instead** (each calls the state, not the screen; named in the sheet): the move's Undo
   before and after its day (`state/reshape-r3-undo-move.test.ts`, `state/fable-move-undo-after-midnight.test.ts` — no
   screen saves or undoes a move); moving oneself and a master admin (`state/reshape-r1-r7-words.test.ts`); the re-link
   and its guardrails (`state/reshape-plan-audit.test.ts` PA3, `state/msq-undo-rights.test.ts`,
   `state/piece-b-tables.test.ts`); "+ New squadron" and a squadron with no admin (`state/reshape-piece-c-doors.test.ts`,
   `state/reshape-b6-squadron-without-admin.test.ts`, `state/lastadmin.test.ts`); a place row's day
   (`state/reshape-k1-place-day.test.ts`); the guards' counter (C9); the qualified-key reader (C8). Repeated cases of one
   route (a third day of the same reading) are walked once at each size, not once per day, where the scenario says so.
5. **After the walk:** the host adds the ledger row (type A, C, D, G, H; five Opus walkers; scenarios, pictures, tokens
   per walker, what was found) before the closing report.

**Time** — not measured for a walk of this size. Guesses: W1 2–2.5 h, W2 2–2.5 h, W3 2.5–3 h (every scenario crosses
midnight, both engines), W4 2.5–3 h (publishing, exports), W5 2–2.5 h; about 400,000–700,000 tokens each (the Plan
audit's one Opus-sized walker: 210,000 for six scenarios at both sizes).

---

## 2. The roll-call, widened

The thing: **a person who moves squadron, and each squadron's own people, records and rights, on every day.** SHOW =
the right people and records for the day, a refusal in the app's words; USABLE = the allowed act works end to end and
lands only in its squadron and days; PAINTED = nothing of the other squadron, or of the other side of the move day,
changes. Rows 1–20 are the host's; 21 on are the designers' gaps and one lead of the smoke test. Each cell is filled by
the walk; the last column names who fills it.

| # | Surface | SHOW | USABLE | PAINTED there | Scenario |
|---|---|---|---|---|---|
| 1 | Inputs — list, filter, deleted and archived groups | walk | walk | walk | W1-02, W1-01, W1-03 |
| 2 | Inputs calendar — notes, day titles, edits, Undo | walk | walk | walk | W1-05, W1-01 (drag-stretch) |
| 3 | Input window — picker and Save across a move (Q8) | walk | walk | walk | W1-01, W1-02 |
| 4 | Edit Schedule — day panel, crew palette, free all day, ALL AVAIL | walk | walk | walk | W4-01, W4-02, W1-04 |
| 5 | Edit Schedule — sign-off boxes | walk | walk | walk | W4-03 |
| 6 | Publish and sign — the frozen roster | walk | walk | walk | W4-03, W4-04 |
| 7 | Quals | walk | walk | walk | W1-03, W4-03 (Scheduler tick), rounds |
| 8 | Medical counts | walk | walk | walk | W1-03 |
| 9 | SANS calendar and day | walk | walk | walk | W1-03 |
| 10 | OIL answer list | walk | walk | walk | W1-06, W5-05 |
| 11 | Leave War — rows across a move; a day now another squadron's | walk | walk | walk | W2-01, W2-02, W2-03 |
| 12 | Leave War — posting pass, held note | walk | walk | walk | W2-07, W5-06 |
| 13 | Tracker — people; the change at the next sign-in | walk | walk | walk | W3-08, W3-03 |
| 14 | Admin → Users — Suspend, Demote, Archive, Delete of a last admin | walk | walk | walk | W5-01, W5-02 |
| 15 | Admin → Users — re-link, Restore, Delete and their Undo | walk (Restore, Delete) | **re-link: no control** | walk | W5-07, W5-08; re-link W5-09 NOT WALKED — tests §1 line 4; host decision §8 |
| 16 | "+ New squadron" — no screen | NO-because no screen | — | — | not walked; `state/reshape-piece-c-doors.test.ts`, `reshape-b6-squadron-without-admin.test.ts` |
| 17 | The bell — posting lines to a squadron's admins | walk | walk | walk | W2-07, W5-06, W4-07 |
| 18 | Top bar's Undo / Redo across the midnight change | walk | walk | walk | W3-05, W4-06 |
| 19 | The midnight band — a Leave War window, a Tracker pop-up | walk | walk | walk | W3-01, W3-02, W3-03, W3-07; drawing check (host) |
| 20 | Waiting screen — no guest view | walk | walk | walk | W5-08 |
| 21 | Mission role (Blue / Red / Later) and Insights (Astra) | walk | walk | walk | W4-06, W4-04 (Insights' idle list) |
| 22 | Saved plans, previews, day/duty/wave templates, reopened weeks (Astra, G6) | walk | walk | walk | W4-05, W4-02 |
| 23 | Scheduler Board and View-only Sched (Astra) | walk | walk | walk | W4-04, rounds |
| 24 | ALL AVAIL / free-all-day crowd windows, "Who's available / Who earns OIL" (Astra, G8) | walk | walk | walk | W4-01, W4-04, W1-04 |
| 25 | Changes window and history bubble (Astra, G13) | walk | walk | walk | W4-04, W1-01 |
| 26 | Exports: schedule CSV, Export as PDF, Quals Export (Astra, G8) | walk | walk | — | W4-04, W1-03 |
| 27 | Calendar… → Holidays: export / import sheet, every opener (Astra, G10) | walk | walk | walk | W1-06 |
| 28 | Own-page settings and their Undo: Inputs cut-off, Edit quals, SANS colours, Every weekday, the members' filing switch, Days…, Logic (Astra, G10) | walk | walk | walk | W1-05 |
| 29 | Admin → Data "Clear old clutter…"; a delete's calendar cleanup (Astra) | walk | walk | walk | W5-07 |
| 30 | Leave War Approvals and "Approve all" (Astra, G1) | walk | walk | walk | W2-05, W2-03 |
| 31 | Balances, Days taken, My leave, person window, OIL tracker (Astra, G2) | walk | walk | walk | W2-06 |
| 32 | War's other writers and pinned row copies (Astra, G6) | walk | walk | walk | W2-03, W2-01 |
| 33 | Manning sheet, flying-day rows (Astra) | walk | — | walk | W2-01 |
| 34 | Tracker's Down days, side panel, Export… (Astra, G12) | walk | walk | — | W3-08 |
| 35 | Tracker chart editor, apart from an event pop-up (Astra, G12) | walk | walk | walk | W3-03 |
| 36 | Bell audiences beyond posting lines — input, named-man, filer, OIL, taken-back lines (Astra) | walk | walk | walk | W4-07 |
| 37 | Access: Request access, waiting, Give access → On the roster / New person, Add a person, Give sign-in, Restore as, welcome-back card (Astra, G17) | walk | walk | walk | W5-08 |
| 38 | Every way a war window closes: band "Close", ✕, Escape, a tap outside (G3) | walk | walk | — | W3-01 |
| 39 | Other war windows at midnight, two stacked (G4) | walk | walk | walk | W3-07 |
| 40 | Schedule-side windows open across midnight (G5) | walk | walk | walk | W3-06 |
| 41 | Writers that copy people onto a day: drag, template, saved plan, Every weekday (G6) | walk | walk | walk | W4-02 |
| 42 | A signature already in a box before the move (G7) | walk | walk | walk | W4-03 |
| 43 | Refusal words at the other doors: calendar drag, delete, restore, day panel's accept and put-back, a medical, a non-leave input (G9) | walk | walk | — | W1-01, W1-03 |
| 44 | The bystander's open page at midnight (G11) | walk | walk | walk | W4-08 |
| 45 | The kept Tracker after midnight (G12) | walk | walk | walk | W3-03 |
| 46 | Three clocks (G15) | NO-because the library pins the time zone to Asia/Singapore (+08:00, the same as Perth and the Tracker's), so there is one midnight; his iPhone's zone is his look card's | — | — | none needed |
| 47 | A posting set on a man who then moves (G16) | walk | walk | walk | W2-07 |
| 48 | The member view by the name badge, before and after midnight (G14, D2253) | walk | walk | walk | W4 round |
| 49 | Top bar's small squadron number over TALON after the midnight change (the smoke test's lead: it read "142" over 149's war) | walk | — | walk | W3-04 (RECORD) |

---

## 3. The merged scenarios

Form of each: **sign-in · clock · SETUP · ACTION · EXPECTED (source) · disproof · sizes · pictures.** "both" = desktop
and iPhone. Pictures: one per assertion that matters, named `<id>-<step>-<d|p>.png`; on the phone every tap through
`pressShot` (the picture within about 100 ms of the lift, then the settled one — §7.10). Each scenario's verdict is PASS
or FAIL against its EXPECTED line, RECORDED only where it says **RECORD**. "Admin → Users" route, the war's cell, the
bid window, the band and the Tracker's editor are reached as in §5's recipes.

### W1 — Inputs, calendars, holidays and OIL (no midnight)

**W1-01 (S09 + F6) — leave across his move: who may save it, at every door.** `ad2`, `ad9`, `us`, `ad`; Wed 15 Jul
10:00. SETUP: Move M saved after step 1; a second fresh world for the order "move saved first, then filed". ACTION:
Hunter, Inputs → "+ New", LL for Ranger Tue 14 Jul, Save; Move M; reopen it, stretch to Fri 17, Save. Kestrel from
149's Inputs list: change its remark, Save. Then each other door on that leave as Hunter and as Kestrel: the Inputs
calendar's drag-stretch, Delete, Restore from the deleted group, the schedule day panel's edit. Then Ranger and Saber
make the same change. After a refusal: tap away, tap the date box afresh, choose the same end date, Save again (lesson
16). Third world: SETUP Plan H, Hunter stretches it. EXPECTED: at the window, it stays open and the passing note reads
"Blocked: Ranger is 149's from Thu 16 Jul. Only Ranger or an admin of both 142 and 149 can change leave that runs
across his move." (D2240, D2241, D1667; plan §12 Q8 and its "Blocked:" note); Ranger, Saber (a master admin) and
Hunter with Plan of 149 save it (D2241); the picker leaves Ranger out of a new 14–17 Jul draft of Hunter's (plan §11
C6); untouched dates are not lost. The other doors: refused, nothing saved — **RECORD their words** (G9: no ruled
sentence there). Disproof: any door saves it for Hunter or Kestrel alone; "master" alone, "Not saved:"; a partial
save; the refusal shown only once and the second Save passing. both. Pictures: the window with the note, each door's
refusal, the list after.

**W1-02 (S10 + F7) — three inputs, five readers, three days.** each sign-in; worlds at Wed 15, Thu 16, Fri 17 Jul
09:00. SETUP (each world): through Inputs as Hunter before the move — A: Ranger LL 13–14 Jul; B: Ranger files his own
LL 14–17 Jul; C: Ranger LL 20–22 Jul (made by Ranger); a non-mover's leave (Saber) beside them; then Move M. ACTION:
each sign-in: Inputs list, the Person filter, the calendar; 142's and 149's day panel for Tue 14, Fri 17, Mon 20;
open the picker for a before-only, an after-only and a spanning range, change only the dates after picking Ranger and
press Save. EXPECTED: Hunter's list holds A and B, never C; Kestrel's B and C, never A; Ranger's own page all three on
every day; Osprey none of them (plan §1 C1, C2, C11; D2252's reason — a member's Inputs are his own); the day panels
show him unavailable only on days that are that squadron's (plan §11, C4); Saber's leave unchanged everywhere; a date
change after picking him is refused at Save as W1-01 (C6). The calendar bar's ends in each squadron: **RECORD**.
Disproof: C on 142's list; A on 149's; Ranger's own input missing on a day; a stale picked Ranger saved. both (the
third day at desktop only: the same reading). Pictures: each list, each calendar, each day panel.

**W1-03 (S13 + F8) — a non-leave input and a medical across the move; Medical, Quals and SANS agree.** `ad2`, `ad9`,
`us`; Wed 15 Jul, then a world at Fri 17. SETUP: Move M. ACTION: Hunter files a Course for Ranger 14–17 Jul, a down-chit
(medical) 15–17 Jul, and moves the medical's end; files a SANS availability for a 142 SANS man and one for Ranger across
the move; Medical tab, its document and its cut-short control; Quals at each sign-in (today's roster), "Export to
Excel" ("Export" on the phone); the SANS calendar, its day and "Calendar…". EXPECTED: the course and the medical across
the move are refused by the same rule as leave (D2221 as corrected by D2240/D2241: only Ranger or an admin of both) —
**RECORD the words** (no ruled sentence for these, `inputedit` names leave only); Medical's counts on Fri 17: not in
142's, in 149's (plan §1 C4, the dated roster); Quals lists today's roster (Ranger in 142's on Wed, in 149's on Fri);
the export holds the same names as the page. Medical totals and contributors: **RECORD**. Disproof: saved by Hunter
alone; counted in both or neither; the export disagreeing with the page; closing the document closes the input under
it. both. Pictures: each refusal, Medical on both days, Quals, the export's file listed (its rows printed in the log).

**W1-04 (S11) — an ALL / ALL AVAIL meeting stays on the squadron it was filed on.** `ad2`, `ad9`, `ad`; Wed 15 Jul.
SETUP: through Inputs Hunter files an ALL AVAIL meeting and an ALL meeting for Fri 24 Jul; a mixed one naming Ranger
and ALL AVAIL; then Move H. ACTION: a world at Fri 17: 142's and 149's week of Mon 20 Jul, Fri 24's day; the crowd
window and its "Who's available / Who earns OIL"; Inputs in each squadron; Hunter edits and deletes the meeting where
offered, Undo, Redo. EXPECTED: the placeholder-only meetings stay on 142's schedule and Inputs, never on 149's; their
crowd is Fri 24's 142 people (D2243 Q1, D2245's row; `state/reshape-c3-allavail-stamp.test.ts` carries the stamp).
The mixed meeting: **RECORD** where it lands and who is in its crowd. Hunter's edit, delete, Undo: **RECORD** (he is
149's from Thu; whether he may still change a 142 meeting is not ruled). Disproof: a placeholder meeting on 149's
Friday, twice, or Ranger in 142's crowd; an Undo writing into 149. both. Pictures: each week's Friday, each crowd window.

**W1-05 (S12 + F16) — notes, day titles, settings and the late mark keep their squadron.** `ad9`, `ad2`, `us`, `us9`;
Wed 15 Jul. SETUP: Kestrel sets 149's cut-off in Inputs settings so Mon 20 Jul is late for 149 and not for 142 (or the
reverse — read each squadron's cut-off first); Move M. ACTION: in each squadron a calendar note and a day title, one
naming Ranger; edit its dates and people, Undo, Redo, reload; Ranger files LL Mon 20 Jul and LL Wed 15 Jul; Osprey
files one for Mon 20; Quals' "Edit quals", SANS colours, "Every weekday" and Days… in each squadron, each with Undo (the
first save of a setting never made before among them). EXPECTED: Mon 20's late mark by 149's cut-off, Wed 15's by
142's (`engine/late-own-cutoff.test.ts`; the brief's summary: "an input's late mark goes by its own squadron's
cut-off"); each note, title and setting only in its own squadron, Undo putting back the edit's before-image, not
deleting the note (plan §3.2 A-ii, A-v). An input across the move (B of W1-02): **RECORD** its mark. Disproof: a mark
that follows the page he filed on; a first save leaking into the other squadron; a reload differing. desktop; the note
edit and its Undo on the phone. Pictures: both cut-offs, the marks, each note before and after Undo.

**W1-06 (S17 + F15) — each squadron's own holiday and OIL answer.** `ad9`, `ad2`, `ad`, `us9`, `us`; Wed 15 Jul.
SETUP: through the app: Kestrel publishes 149's Fri 17 Jul as a working day; Osprey and Ranger file qualifying inputs;
Move M. ACTION: Kestrel, Calendar… → Holidays: add a holiday on Fri 17 (read the warning); open the OIL answer list from
his bell and from the schedule; "Yes · FO/HO", "No", "Yes to all", "No to all", "Later", Save, Close; reopen. Hunter adds
a differently named 142 holiday on Mon 20 and a same-named one on Fri 17. Export each Holidays sheet; in a fresh world
import one through its preview. Undo and Redo the answers. EXPECTED: the warning "Already published as a working day:
Fri 17 Jul. Publish it again so the crew on it earn OIL for the holiday." in the warning line's green, no squadron
number (D2207); 142's Friday, Inputs calendar, war and bells untouched by 149's holiday and the reverse (D2195); the
OIL line reaches 149's schedulers only (D2195; `leavewar/msq-holidays-own-sqn.test.tsx` A4); the list's name, dates,
count, foot and save are 149's (plan §19 PB3–PB5, §19b R3, R4). Ranger's leave across the move judged by 149's list on
Fri 17: **RECORD** its count. Disproof: Hunter's or Saber's bell rings for 149's holiday; 142's Friday shaded; an
answer saved for 142; "Later" saving. both. Pictures: the warning, the list from each opener, each bell, both Fridays.

### W2 — the Leave War, its money and the posting pass (clock by day; W2-07 crosses its due date)

**W2-01 (S14 + F11) — both wars' rows across a move, three days.** `ad2`, `ad9`, `us`; worlds at Wed 15, Thu 16, Fri
17 Jul 09:00. SETUP: Saber opens July for bidding; Ranger bids and Hunter approves entries on both sides of M (Mon 13,
Fri 24); a real posting out on Havoc (the Post out sheet, a date in July) beside him; a 142 WSO (Echo) also moved
(saveMove, day 16 Jul) for the second kind of row (lesson 25); then Move M. ACTION: July in each war: pinned names and
scrolled grid, the month strip, the Manning sheet; tap his striped cells as admin and as himself; drag a range across
Tue 14–Fri 17 on his row; drag a block over several rows including his; Admin → Users' row for Ranger; one pinch
part-way down the grid on the phone. EXPECTED: 142's war: his row as before up to Wed 15, striped from Thu 16, no "PO",
no posting sheet; 149's: striped before Thu 16, live from it (D2243 Q6; drawings q6a, q6b — compared side by side,
"not measured"); Admin → Users: no posting tag (D2243 Q6); a striped cell opens nothing and a range skips it, as a
posted-out man's away days do (plan §11 A1, A7; D320 — walk Havoc's away cell beside it, lesson 23); 142's Available
figure one lower from Thu 16 than on Wed 15, 149's one higher, the grid, the Manning sheet and the bid window's line
agreeing (plan §11 A1 "not in manning"). The leave approved before the move on Fri 24: out of sight in 142's stripe, not
in 149's (D2243 Q6). Disproof: "PO" or the posting hatch on the stripe; a window opening; a figure counting him in both
or neither; a pinned copy unstriped; Echo's row behaving otherwise. both. Pictures: each war at each day, the Manning
sheet, the tap on a striped cell (pressShot), the pinch.

**W2-02 (S15 + F13) — Undo onto a day now 149's, from a cell of two and of one.** `ad2`; Wed 15 Jul. SETUP (before the
move, through the war): Ranger's Fri 17 Jul holds LL AM and OL PM; Mon 20 holds one LL. ACTION: Hunter removes one of
Fri's two, removes Mon's one; Move M (the reload keeps the Undo list? — RECORD); press Undo twice; then press it again.
Second world: Hunter places leave on Fri 17, Undo, Move M, Redo. Third: Move M first, then remove one of Fri's two (a
removal is allowed), Undo. EXPECTED: each Undo or Redo that would put leave back reads "Ranger is 149's from Thu 16 Jul,
so this can't go back into 142's Leave War." (D2243 Q3; drawing q6d, side by side); the next press goes on, never the
same refusal for ever (plan §11 A2; evidence sheet Fable 4); a removal after the move is allowed (D2243 Q3). Whether the
Undo list survives the setup reload: **RECORD** (a reload is not a person's act — if the list is gone, the scenario is
NOT WALKED for that order and `state/war-day-not-its-squadron-gate.test.ts` carries it). Disproof: leave back on a
striped day; "That couldn't be completed just now." in place of the sentence; both halves removed together. both.
Pictures: the cell before, each refusal, the cell after.

**W2-03 (S16 + F12) — the war's other writers cannot write a day now 149's.** `ad`, `ad2` with Plan H, `ad9`, `us`; Wed
15 Jul. SETUP: Saber opens July for bidding; Ranger bids a range 20–24 Jul and Hunter approves part; Move M; second world
adds Plan H. ACTION: on 142's war onto Ranger's Fri 24: the cell, a range window, a block drag (quick flick and slow on
the phone, lesson 2), the day list, Approvals → "Approve all", a credit and an OIL award from the OIL tracker — as
Saber, as Hunter with Plan of 149, as Hunter. EXPECTED: no leave put in for anyone, master admins and Plan holders
included (D2243 Q3); a removal allowed. The words at each door, and whether a credit or an OIL award (not leave) is
refused: **RECORD**. Disproof: anything written onto 142's Fri 24 for Ranger; "Approve all" committing part. both.
Pictures: each door's result, the cell after, Approvals before and after.

**W2-04 (S16 member part + F29) — a member's refused bid shows no Move.** `us`, `us9`; Wed 15 Jul. SETUP: Saber opens
July for bidding; Ranger and Osprey each bid; Hunter refuses Ranger's, Kestrel refuses Osprey's. ACTION: each member
opens his refused bid; removes it the allowed way; the bell and the change history. EXPECTED: no Move; Delete as before
(D1177; plan §13 "R1's owed walk"); who refused it and when stay on the record after the member's removal
(`state/reshape-r6-refusal-stamps.test.ts`; plan R6). Disproof: a Move control; the refusal's stamps gone. both.
Pictures: the refused bid window (pressShot), after removal.

**W2-05 (S04 part + F3) — a pending bid on a day now 149's, in Approvals.** `us`, `ad2`, `ad`, `ad9`; Tue 14 Jul, then
a world at Thu 16. SETUP: Saber opens July; Ranger bids LL Fri 24 in 142's war; then Move M. ACTION: Hunter opens 142's
Approvals; Approve, then Refuse, then Delete; Ranger opens My leave; Kestrel opens 149's Approvals; measure the list's
headings against its figures (lesson 9). EXPECTED: nobody puts his leave into 142's war for that day — Approve refused
(D2243 Q3); a removal (Delete) allowed (Q3); the tab's count and the grid agree (two surfaces). Whether the line is
listed, its count, and whether Refuse (a change, not a removal) is allowed: **RECORD**. Disproof: a counted line that
can be neither approved, refused nor removed; an approval landing on the striped day; a count with nothing to open.
both. Pictures: Approvals in each state, the count, My leave.

**W2-06 (S04 part + F14) — leave approved before the move, and the money.** `us`, `ad2`, `ad9`; worlds at Wed 15 and
Thu 16. SETUP: Saber opens July; Ranger bids LL Mon 20, Hunter approves; Move M. ACTION: in each war Balances, Days
taken, My leave, the person window and its OIL link, the OIL tracker, another year; the schedule's Mon 20 in each
squadron. EXPECTED: the leave out of sight in 142's stripe, the input still on the schedule, 149's war without it
until the Transfer batch (D2243 Q6; plan §12 Q6). Every balance and count, in both wars, both days: **RECORD** (the
smoke test saw "MY LEAVE LVE -5" in 149's war after midnight, against "LVE 12.5" in 142's). Disproof: two surfaces of
one war disagreeing on his figure; the leave counted in both wars. both. Pictures: each figure's place.

**W2-07 (S18 + F26 first part + G16) — the posting pass with nobody of 149 signed in.** `ad9`, `ad`, `ad2`, `us`; Wed
15 Jul, then the clock to Thu 16 09:00 with the page open. SETUP: Kestrel, through Post out: Overseas on Osprey for
Thu 16; SANS on Heron, Delete on Gannet, "off the manpower" (no chip) on Raven, each due Thu 16; Hunter sets a posting
on Ranger for Mon 20 Jul; then Move M (G16). ACTION: sign out; Saber signs in on Wed in 142; clockTo Thu 16 09:00
without opening 149; read Admin → Users, Saber's and Hunter's bells; sign in as Kestrel, read 149's war, Admin → Users
and his bell; run the clock to Mon 20 and read Ranger's row and both wars. EXPECTED: each due posting runs once on its
day with nobody of 149 signed in, its outcome as picked (plan §11, A5; D2136); 149's admins' bells carry the lines
(D1546, D1547); Saber's bell carries his primary squadron's lines only by default (D2198) and Hunter's and Ranger's
none (D2194); nothing of 142 changes. Ranger's posting set before his move: **RECORD** his tag and what each pass does
on Mon 20 (plan §6.5: skipped by both passes; D2221 not built). Disproof: a posting waiting for 149 to be opened,
running twice, touching 142; a line on a 142 member's bell. desktop; the bells on the phone. Pictures: each row, each
bell, each war.

### W3 — midnight, the man who moves (every scenario crosses 23:58 → 00:00:30 on Wed 15 → Thu 16)

**W3-01 (S29 + F1) — his typed words, and each way of closing, at midnight.** `us`, then `ad`, `ad9`; Wed 15 23:54.
SETUP: Move M at the sign-in card; Saber opens July for bidding; Ranger's pending LL on Wed 15. ACTION: Ranger opens
that bid's window in 142's war, types in its remarks and does not leave the box; clockTo 23:58 (picture), 00:00:01
(picture — the band's first frame, its pixels counted in its box, lesson 22), 00:00:30; tap the war grid behind the
window (lesson 4); scroll the window's body under the band on the phone (lesson 15); press a leave chip and RECORD its
words; close by the band's "Close". Repeat in fresh worlds for ✕, Escape and a tap outside. Then Saber reads 142's war,
Kestrel 149's. EXPECTED: band "You are 149's from today. This can't be saved in 142's Leave War." and "Close", his words
still in the box; nothing saved into either war; no failed-save band, no passing note; after each closing 149's Leave
War opens with his row live from Thu 16 (D2243 Q7; plan §11 A2's band; drawing q7b; `state/typing-hold.test.tsx`).
The window's other controls' boxes before and after midnight measured against the drawing (lesson 27). Disproof: the
remark in either war; "Blocked:" or failed-save words after closing; a closing way that leaves 142's war showing.
both. Pictures: 23:58, 00:00:01, 00:00:30, each closing (pressShot), each war after.

**W3-02 (F2) — the manning line in the window at 23:58 and 00:00:30.** `us`, with controls `us9` and `ad2`; Wed 15
23:54. SETUP: Move M; July open; Ranger's Wed 15 cell empty. ACTION: Ranger opens a new-bid window on Wed 15 (his only
day still 142's), types remarks; pictures at 23:58 and 00:00:30; press a leave chip after midnight. Controls in fresh
worlds: Osprey (no move) with a window on his Wed 15 cell across midnight; Hunter under Move H with his own. EXPECTED at
23:58: title "Ranger Wed 15 Jul", the manning line, remarks, Whole day / AM / PM, "Pick a range", the chips; no band
(D1144, D1314). At 00:00:30: the band and "Close" under the title, his words kept (D2243 Q7, drawing q7b). The manning
line after midnight: **RECORD exactly what it says** for all three (the drawing was drawn on a Fri 24 window he can no
longer open; a member's line drops on a day before today — D1211, D1296; if Osprey loses it too and Hunter keeps it,
it is the war's standing rule and a departure from the drawing to name to him with both pictures, D1426, D1478). The
chip's words: **RECORD**; nothing saved (Q7). Disproof: Osprey keeps the line while Ranger loses it; anything else of
the window changes. both. Pictures: each window at 23:58 and 00:00:30.

**W3-03 (S30 + F19 + G12) — the Tracker's chart editor at midnight, the event pop-up, and the kept Tracker.** `us`, then
`ad2` under Move H; Wed 15 23:56 → 00:01, then Fri 17 in the same session. SETUP: Move M. ACTION: Tracker, the pencil →
"Edit chart layout", move one thing; past midnight: picture; "✓ Save changes", "✓ Done editing chart", the band's
"Close"; then every other Tracker control that writes; look for his own row; Undo. Fresh world: an event pop-up open
across midnight, its own save and close. Sign out and in. EXPECTED: band "You are 149's from today. This can't be saved
in 142's Tracker." and "Close", the edits unsaved (D2243 Q7; drawing q7c); Close saves nothing; after sign-out and in,
149's Tracker (plan §14 item 3 — a loaded Tracker moves at the next sign-in; `state/reshape-a02-midnight.test.ts`'s
expected fail). On Fri 17 a write reads "This change could not be saved." (held, the scenarios brief). The event
pop-up at midnight, his row in the kept Tracker, every other write's words: **RECORD** (the plan §11 says a Tracker
pop-up gets "the same" band; the approved drawing and the build show the chart editor only — §8). Disproof: any write
landing in 142's Tracker after midnight, or in 149's from 142's page; the editor saving on Close; the next sign-in
still 142's. both. Pictures: the band, each press, the Tracker after sign-in.

**W3-04 (S28 + F17) — midnight with nothing open.** `us`, then `ad2` under Move H; 23:58 → 00:00:30. SETUP: Move M (or
H). ACTION: the page left open in turn on the schedule, Inputs, the Leave War, Quals, and a Tracker never opened
before; no touch across midnight; picture each at 00:00:30; then open the Tracker; on the phone flick 149's war to its
foot and back (lesson 24); leave the war hidden behind Inputs across midnight, wait 3 s, come back by its tab (lesson
10). EXPECTED: with no reload, 149's schedule and war (plan §11 A2; `state/reshape-a02-midnight.test.ts`); Hunter acts
as an admin in 149's war (his role, D2228's reading of "an admin of 149"). The Tracker first opened after midnight, and
the top bar's small squadron number: **RECORD** (smoke: "142" over 149's war). Disproof: a reload (count the page's
loads — `w.loads`); 142's people still listed; Hunter a member in 149's war. both. Pictures: each page at 00:00:30, the
first frame after the tab press.

**W3-05 (S28 Undo half + F21) — Undo after midnight.** `us`; 23:30 → 00:01. SETUP: Move M; July open. ACTION: 23:30 file
own leave on Inputs for Mon 20 (it is 149's day then? — RECORD where it lands); 23:40 bid in 142's war on Wed 15;
23:50 file a second leave; past midnight press Undo until it greys, then Redo. Variant world: the 23:30 leave moved in
142's war at 23:50. EXPECTED: the 142 war step passed over; the 23:50 leave taken; in the variant once "A later change
touches the same thing and can’t be undone." and the next press goes on (plan §11 A2, §13). Disproof: a 142 step
undone into 149; the same refusal on every press; the list cleared. both. Pictures: each press (pressShot), the button's
greyed words.

**W3-06 (F4 + G5) — an admin who moves, a schedule window open at midnight.** `ad2` under Move H, then `ad`, `ad9`;
23:57 → 00:01. ACTION (each in a fresh world, 142's week of Mon 13 Jul): (a) a cell's text being typed; (b) the Input
window, a new unavailable for Saber; (c) the Input window, a new ALL AVAIL meeting for Fri 24; (d) Publish on Thu's
day; (e) "Every weekday"; (f) a sign-off box's list open — press its save after midnight. Then Saber and Kestrel read
142's and 149's week, Inputs and history. EXPECTED: nothing typed on 142's page is saved into 149's, and nothing
dropped without a word (D2243 Q7's rule; plan §3.5 "a pending save"); the meeting is not 149's (D2243 Q1). What each
window does: **RECORD exactly**. Disproof: any record in 149's week, Inputs or history made on 142's page; a 142 day
published by a man no longer its admin; a window closing silently. desktop; (a) and (c) on the phone.

**W3-07 (S29 other windows + F20) — other war windows, and two stacked, at midnight.** `ad2` under Move H; `us` under
Move M for the member's windows; 23:57 → 00:01. ACTION (fresh worlds): a person window with a bid window over it;
Grades; ⚙ Settings; the block-drag sheet; the Post out sheet; the bid window opened from My leave, from the person
window and from Approvals (lesson 12); close the top one, then the lower one; the other order in another world. The
boxes typed into are found by searching the war's windows for text boxes (lesson 14). EXPECTED: each carries the band
(D2243 Q7: "a window open at midnight gets the drawn band"); nothing saved into 149 from either window; typed words
kept. When the war changes to 149's (after the top window closes, or the last): **RECORD** the order. Disproof: a window
without the band; a save into 149 from the lower window; the war changing under an open window. desktop; one stacked
pair on the phone. Pictures: each window's band, each closing.

**W3-08 (S05) — the Tracker's people, Down days and export at sign-in.** `us`, `us9`, `ad2`; worlds at Wed 15, Thu 16,
Fri 17 09:00. SETUP: Move M; through Inputs medical records spanning Thu 16; ordinary Tracker work for Ranger and
Osprey through its controls. ACTION: sign in; the person list, the side panel's "No. of Down Days", "Down days", an
event pop-up, "Export…". EXPECTED: each new sign-in binds the squadron he is in that day (plan §14 item 3); medical
intervals from his own records (two surfaces: Inputs' Medical and the Tracker agree). The Down days figure: **RECORD**.
Disproof: a new sign-in on Thu bound to 142; another squadron's record counted. both (Fri at desktop only). Pictures:
the list, the panel, the export listed.

### W4 — the schedule, publishing, the bell, and the bystanders at midnight

**W4-01 (S07) — every crew palette mode reads the day.** `ad2`, `ad9`; worlds at Wed 15 and Fri 17. SETUP: Quals as
Saber: Scheduler and SANS marks as needed; Move M; Echo (a WSO) moved too, and a Personnel man added through "Add a
person" and moved (lesson 25). ACTION: each day's panel and crew palette — "Previous day / Next day", armed and unarmed
placement, free all day, SANS availability, ALL AVAIL and its "Who's available / Who earns OIL"; place and remove a non-
mover. EXPECTED: names, counts and allowed placements are that day's: Ranger in 142's on Tue 14 and Wed 15, never on Thu
16 on; in 149's from Thu 16, including an old day opened after M (D2243 Q2's reading — "as the crew list"; plan C4, C6).
Disproof: only the count changes; the armed palette keeps the previous day; the WSO or Personnel mover follows another
rule; a non-mover vanishes. both. Pictures: each palette, each crowd window.

**W4-02 (F5) — people copied onto a day he is not the squadron's.** `ad2`; Tue 14 Jul. SETUP: before the move crew Ranger
on a flying line on Wed 15, Thu 16 and Mon 20, on a duty desk and a sim seat; save Tue as a day template and as a saved
plan; then Move M. ACTION: look at Thu and Mon; drag his puck from Wed to Fri (slow and quick on the phone); apply the
template and the plan to Mon 20; "Every weekday" for Ranger over the week. EXPECTED: the crew list and palette of Thu,
Fri and Mon do not offer him (D2243 Q2; plan C4). What a line already naming him shows, and each copy's result:
**RECORD** — a warning, his puck, or nothing. Disproof: Ranger newly placed on a 142 day from Thu 16 by any gesture with
no word. desktop; the drag on the phone. Pictures: each day before and after, the puck following the finger.

**W4-03 (S08 + F9 + G7) — sign-off boxes and publishing a day he was 142's.** `ad2`, `ad9`, `ad`; Wed 15, then a world
at Fri 17. SETUP: Quals as Saber: Ranger and Hunter the Scheduler tick; before the move, PLANNED BY on Mon 20 signed
"Ranger"; Move M; a second world adds Plan H. ACTION: open Tue 14's and Mon 20's SKED CK, PLANNED BY, APPROVED BY,
CUR CK; publish Tue 14 with Ranger signed; on Fri 17 amend Tue 14 and sign again; try to publish Mon 20. As Kestrel on
149's Fri 17: the same four boxes (with Plan H: Hunter in them). EXPECTED: Tue 14's boxes offer Ranger on any later date,
Mon 20's do not (D2243 Q2); after the day's own people, the three scheduler boxes offer a master admin with the tick
(Saber) and a Plan holder with the tick (Hunter, Plan H) — never in CUR CK (D2245). The kept signature on Mon 20 and the
published, pending and signature states: **RECORD**. Disproof: Ranger offered afresh on Mon 20; Tue 14's box losing him
on Fri 17; Saber or Hunter in CUR CK or ahead of the day's own. both. Pictures: each box list open (pressShot).

**W4-04 (S03 + F10) — the frozen roster and its readers.** `ad2`, `us9`, `ad9`; Wed 15, then Mon 20. SETUP: publish
distinguishable Fri 17 days in 142 and 149; one later unpublished change; Move M. ACTION: on Mon 20 open Fri 17 on Edit
Schedule, the Scheduler Board, View-only Sched, the change history (Week, the day, Item / Who, a change's jump, Hide,
Close) and the history bubble; its ALL AVAIL window and free all day; Insights for the week; "Export to Excel (CSV)"
and "Export as PDF (print)" — print-media pictures in Chromium and WebKit (lesson 18). EXPECTED: Ranger not free all
day on 142's Fri 17, free on 149's (plan C4; D327); the issued readers and the exports agree with the issued day, the
working readers with the working copy (two surfaces). Insights' idle list, the issue, pending and signature labels:
**RECORD**. Disproof: Ranger in 142's Friday crowd or idle list; an export showing the working copy for an issued
day; a change's jump opening the other squadron. both (exports desktop; print pictures both engines).

**W4-05 (S02) — plans, stored weeks and previews keep their own inputs.** `ad2`, `ad9`; Wed 15. SETUP: through the
app, distinguishable ground inputs in each squadron's week, one each side of Ranger's move, and an alternate plan in
each; Move M. ACTION: the day's plan selector, Plans → Select, rename, "Delete plan", Done, Undo, Redo; another week
and back; sign out and in. EXPECTED: each plan and week shows its own squadron's inputs; a stored and reopened copy
agrees with the one selected (plan C8, §3.2). Disproof: another squadron's input lands; a reload reverses the result.
desktop; the selector on the phone.

**W4-06 (S01) — the mission role across the boundary.** `ad2`, `ad9`; Wed 15 23:50 → Thu 16. SETUP: Kestrel files and
answers a 149 mission's role; Hunter a 142 mission whose question shows; Move H. ACTION: Hunter "Blue", then "Change
mission role → Red"; Insights; past midnight on 149's page Undo, Redo; a fresh world with "Later". EXPECTED: each answer
stays with its squadron; an answer alone publishes nothing and moves no signature or OIL; the 142 step is passed over
by Undo after midnight (plan §11: "a step left in a squadron he can no longer enter is passed over"). The figures:
**RECORD**. Disproof: 149's answer changed by a 142 Undo; publishing or OIL moved. both.

**W4-07 (S20 + F22) — the bell on the move day.** `ad2` under Move H, `us` under Move M, `ad`, `ad9`; Wed 15 → Thu 16,
the bell open across midnight once. SETUP through the app: on Wed Hunter's bell holds 142 admin lines — one read, one
unread — and one about himself (his own leave decided); Hunter files Ranger's leave 13–17 Jul; Saber posts out a 142
man and Hunter has the line. ACTION: cross midnight with the bell open, then closed and reopened; Saber undoes the 142
posting; Kestrel changes the remark of the leave Hunter filed for Ranger; Ranger's own leave decision undone by 142,
then redone. EXPECTED: on Thu the 142 lines leave Hunter's bell, read or unread, never struck "taken back"; the line
about himself stays (D2218); Saber's undo tells Hunter nothing (D2218); Kestrel's change tells Hunter, now an admin of
Ranger's squadron (D2228); Ranger's own line is struck "taken back" when read, gone when unread, back on Redo (D2222).
The badge counts at each step: **RECORD**. Disproof: a 142 line surviving; a line struck; a count wrong until reload.
both. Pictures: the bell at each step (pressShot on the phone).

**W4-08 (F18 + G11) — midnight for those who did not move.** `ad2` and `ad9`, each in its own world; 23:58 → 00:00:30.
SETUP: Move M. ACTION: each has open in turn: the Fri 17 day panel, the Inputs Person filter, Quals, Medical, the Leave
War and Admin → Users; Hunter has Ranger's row editor open and presses Save after midnight. EXPECTED: with no reload
Ranger leaves Hunter's lists and enters Kestrel's (lesson 29, D1266: every reading follows the new day without a
reload; plan §11); Hunter's Save after midnight refused "He is 149's. Only an admin of 149 can change his account."
(D2205 M5); Kestrel's own change to Ranger's row works. Disproof: a list needing a reload; Hunter's save landing.
desktop; the row editor on the phone.

### W5 — rights, people and the admin doors (clock by day)

**W5-01 (S21 + F23) — every last-admin door on Kestrel.** `ad`, `ad2`, `ad9`; Wed 15. SETUP: none (Kestrel is 149's
only admin). ACTION: Saber on Kestrel's row: Role → Member → Save; Suspend; Archive; Delete → "Tap again to delete
Kestrel". Kestrel taps his own row. Hunter on Kestrel's row. Then Saber makes Osprey an admin (Role → Admin → Save) and
repeats each in fresh worlds, then Undo and Redo of each allowed step. EXPECTED: Saber, at every door: "Kestrel is 149's
last admin. Make another admin of 149 first." — never "That did not save" (D2184 Q10's words; plan B3; D2246: a master
admin keeps the approved words); Kestrel's own row does not open (D322 — the words shown: RECORD); Hunter: "He is 149's.
Only an admin of 149 can change his account." (D2205 M5); with Osprey an admin each goes through; Suspend and the role
change undo and redo; Archive and Delete are not steps of Undo — the greyed button says why; Restore takes back Archive
(D350). An Undo or Redo that would leave 149 with no admin: refused — **RECORD its words** (no ruled sentence for the
Undo button). Disproof: two doors, two sentences; a raw reason; any step ending with no 149 admin. both. Pictures: each
refusal, side by side with picture 9's words.

**W5-02 (S22 + F24) — the last-admin check sees a later gap.** `ad`, `ad9`, `ad2`; Wed 15. SETUP: Saber makes Osprey an
admin on screen; then Move O (Osprey to 142 from Fri 17). ACTION: Saber: Suspend, Member, Archive, Delete of Kestrel;
a posting out of Kestrel due Sat 18; then in a fresh world make Merlin an admin (a replacement from today) and repeat.
EXPECTED: "Kestrel is 149's last admin from Fri 17 Jul, when Osprey moves to 142. Make another admin of 149 first."
(D2217 Q15, picture 9b, side by side, "not measured"); with Merlin an admin each goes through. D2246's ending ("Only a
master admin or an admin of 149 can make another.") needs an actor who may act but cannot make a 149 admin: if no seeded
route reaches it, NOT WALKED — `state/reshape-piece-c-doors.test.ts` carries it. Disproof: today's sentence for the
dated case; a raw reason. both.

**W5-03 (S23 + F27 last part) — making a Plan holder a member ends his Plan.** `ad2`, `ad`; Wed 15. SETUP: Plan H.
ACTION: Saber makes Hunter a member (Role → Member → Save); read Hunter's reach (his bell's 149 lines, Admin → Users on
Osprey) as Hunter; Undo, Redo as Saber. Fresh world: a second 142 admin (made through Users: Role → Admin) given Plan
by setup, and Hunter (a plain admin) makes him a member. EXPECTED: allowed to an admin of his own squadron; his Plan
ends in the same step (D2250) — Hunter as a member reaches nothing of 149 (D2252). What Undo puts back — the role only,
or the Plan too: **RECORD** (not ruled; the plan's reading). Disproof: a member keeping Plan; the role change refused.
desktop; the role change on the phone.

**W5-04 (S24) — a move ends his rights on its day, and coming back does not revive them.** `ad2`, `ad`; Wed 15, then
the clock to Thu 16 and Fri 17. SETUP: Plan H; Move H (to 149 from Thu 16); later Move back to 142 from Fri 17 (a third
home row). ACTION: on Wed Hunter changes Osprey's role and puts it back (Plan holds); on Thu (149's admin at home) the
same; on Fri, back in 142, Hunter opens Osprey's row. EXPECTED: Plan holds through Wed 15 and ends at the start of Thu 16
(D2243 Q4, D2203); on Fri Hunter is refused "He is 149's. Only an admin of 149 can change his account." (D2205 M5) — the
Plan never comes back. The move's Undo: NOT WALKED (no screen saves or undoes a move) —
`state/reshape-r3-undo-move.test.ts`, `state/reshape-r2-move-back.test.ts`. Disproof: Plan ended on Wed, or alive on
Fri. desktop.

**W5-05 (S27 + F27 first part) — Hunter with Plan of 149, what he can reach.** `ad2`; Wed 15. SETUP: Plan H; through
149's pages as Kestrel: a 149 holiday and inputs that raise an OIL question; a posting on a 149 man. ACTION: Hunter's bell
(149's admin lines); the OIL answer list from that line; Admin → Users on 149's people (make Osprey an admin, then a
member); the name badge → member view and back (D2253). EXPECTED: 149's admin lines on his bell (D2202); the list opens
on 149's and saves 149's (plan §19 PB4, O4); he changes 149's people as its admins do (D2201, D2211); in the member view
his own pages are 142's. His other pages (Inputs, schedule, war, Tracker) stay 142's — no "Schedules" menu yet (held,
step 5): what he can reach: **RECORD**. The full sweep of 149's pages is NOT WALKED (no picker; moving him to 149 would
end the Plan under test). Disproof: a reachable 149 act refused, or written into 142. desktop; the bell on the phone.

**W5-06 (S19 + F26 second part) — a held last-admin posting runs by itself once 149 has another admin.** `ad9`, `ad`,
`ad2`, `us`; Wed 15, then the clock to Thu 16 with the page open. SETUP: Kestrel sets an Overseas post-out on himself for
Thu 16 (the sheet's words before confirming: RECORD). Second world: Plan H as well. ACTION: on Thu, Saber's Admin → Users
(the held note on Kestrel's row), Hunter's with Plan of 149, Ranger's screen and bell; Saber makes Osprey an admin; look
again with no other step. Opposite order in a fresh world: Osprey made admin on Wed, then the due day. "Undo post out"
before the due day in a third. EXPECTED: the posting waits whole, never half done; shown on the row for a master admin
or a Plan holder of 149, never on a 142 member's screen or bell (plan §11; D306; D2247: Plan does not stand in for the
last own admin); it runs by itself once 149 has another admin, once (plan A5, A6). The held words and the bell counts:
**RECORD**. Disproof: a press needed to run it; a double run; a note to Ranger or Hunter without Plan. desktop; the row on
the phone.

**W5-07 (S06 + Fable's order 8) — delete and cleanup reach the right calendar.** `ad`, `ad2`, `ad9`; Wed 15. SETUP:
Kestrel puts a planning note naming Osprey on 149's Inputs calendar and a multi-person note; Hunter one naming Ranger on
142's; Move M. ACTION: Saber deletes Osprey through Users (from 142's pages); read both calendars; Hunter archives
Ranger on Wed, against Kestrel archiving him on Thu (fresh worlds), then Restore by each; Admin → Data → "Clear old
clutter…", a period, "Tap again to clear … items". EXPECTED: the delete takes Osprey off 149's notes and only there
(plan B1, §6.5; `state/delete-strips-other-calendar-gate.test.ts`); Hunter's archive of Ranger, who is 149's from Thu:
**RECORD** (who may archive a man across his move is not ruled for archive); cleanup touches only its period and
squadron — **RECORD** the count it names. Disproof: 142's notes cleaned for a 149 delete; other names gone. desktop.

**W5-08 (S26 + F30 + G17) — new people, access, the waiting screen.** a new sign-in, `ad`, `ad9`; Wed 15. ACTION: in each
squadron "Add a person" with and without sign-in, "Give sign-in"; a new name signs in → "Request access" → the waiting
screen; then "Give access → New person / On the roster" and "Refuse" in separate worlds; Archive, Restore, "Restore as
…", rename; the welcome-back card at a sign-in on Thu 16 after Move M (Ranger). Global Undo at each boundary. EXPECTED:
the waiting screen shows "Waiting for an admin", his details and Sign out, no "View the schedule"; no admin has a "Guest
view" switch for either squadron (D2239); Kestrel's new person is 149's, Saber's 142's (D2192); Undo greyed with its
reason at add, archive, restore and delete (D350). "Request access" naming no squadron is held (B7) — not a finding.
The welcome-back card's words: **RECORD**. Disproof: any door into a schedule while waiting; a person in the wrong
squadron. both.

**W5-09 (S25 + F25) — a re-link and its Undo — NOT WALKED.** Admin → Users' person editor offers the sign-in name, its
role, Suspend / Enable, Archive, Delete and Cancel — no control links an existing sign-in to another person (checked in
the source and the Plan audit's walk). "Give access → On the roster" is a first link, not a re-link. Carried by
`state/reshape-plan-audit.test.ts` (PA3), `state/msq-undo-rights.test.ts`, `state/piece-b-tables.test.ts`. Host
decision, §8.

### Left out

- **F28 (moving yourself; a master admin moved by a plain admin)** — no screen moves a person; the designer's own route
  calls the move door through the bridge as the signed-in man, which is not setup and presses nothing. Carried by
  `state/reshape-r1-r7-words.test.ts` (D2249's words).

### EXPECTED lines changed from a designer's, and why

1. F23 — Kestrel on his own row: "You can't change your own account — ask another admin" → his row does not open
   (D322, the page's "Your own row can't be opened"); the words RECORD.
2. F23 — an Undo leaving 149 with no admin "refused in the same words" → refused, words RECORD (no ruling or contract
   gives the Undo button the door's sentence).
3. F22 — "Kestrel changes its remark → Hunter is not told (he is a member there)" → Hunter IS told: his account is an
   admin's and after Move H he is an admin of Ranger's new squadron — D2228's own worked case.
4. F26 / S19 — the held words "Kestrel is 149's last admin. The posting waits until 149 has another admin." → RECORD
   (no row I found carries that sentence; D306 rules the behaviour, which stays PASS/FAIL).
5. F27 — "offered in SKED CK… on a 149 day" as Hunter → walked from Kestrel's 149 day (W4-03): Hunter cannot reach
   149's Edit Schedule without the "Schedules" menu (held, step 5).
6. F17 — "a Tracker first opened after midnight is 149's" → RECORD (the plan §14 item 3 and the A2 test speak of a
   loaded Tracker; a first load after midnight is not ruled).
7. F20 — "closing the top one leaves the war held until the last closes" → RECORD the order (code only, no ruling);
   the band on each window and nothing saved stay PASS/FAIL.
8. F12 / S16 — a credit and an OIL award onto the striped day "refused" → RECORD (D2243 Q3 rules leave only).
9. S23 — "a non-master Undo restores the role only; a master restore may restore eligible Plan" → RECORD (cited to a
   build log, not a ruling); the Plan ending with the demotion stays PASS/FAIL (D2250).
10. F3 — Refuse on the striped day → RECORD (a change, not a removal; Q3 rules putting leave in and removals only).
11. S11 / W1-04 — Hunter's edit of his 142 meeting after his move → RECORD (not ruled).
12. S06 / order 8 — Hunter archiving Ranger across the move → RECORD.
13. S30 — the event pop-up at midnight → RECORD, and the plan-versus-drawing difference is put to the host (§8).
14. F8 — the course's and the medical's refusal words → RECORD (the ruled sentence names leave only).
15. W2-02 — whether the Undo list survives the setup reload → RECORD, with its test named if it does not.

---

## 4. The five shares

| Share | Scenarios | Clock | Plain-user round (D1557) | Size of work |
|---|---|---|---|---|
| **W1** Inputs, calendars, holidays, OIL | W1-01 … W1-06 (6) | by day; no midnight | **Kestrel** (149 admin) | many doors × three sign-ins |
| **W2** Leave War, its money, the posting pass | W2-01 … W2-07 (7) | by day; W2-07 runs Wed → Thu and to Mon 20 with the page open | **Osprey** (149 member) | three days × two wars |
| **W3** midnight, the man who moves | W3-01 … W3-08 (8) | every one but W3-08 crosses 23:58 → 00:00:30 | **Ranger** (on Wed 15, Thu 16, Fri 17) | fresh world per closing way |
| **W4** schedule, publishing, bell, bystanders | W4-01 … W4-08 (8) | W4-06, W4-07, W4-08 cross midnight | **Hunter** — once plain, once with Plan of 149, once in the member view before and after midnight under Move H (G14) | publishing, exports |
| **W5** rights, people, admin doors | W5-01 … W5-08 (+ W5-09 not walked) | by day; W5-04 and W5-06 run the clock with the page open | **Saber** (master admin) | many fresh worlds |

Each walker builds its own fixtures in its own storage: no share waits for another's person, day or right. **The plain-
user round, each sign-in:** file, change and delete his own input (list and calendar, a note and a day title, Undo); a
day panel and the crew list; Quals; Medical; the SANS calendar and a day; the Leave War — bid, change, delete, a range,
My leave, Balances; the Tracker — one entry; the bell; the welcome-back card. Admins add: crew a line, sign the four
boxes, publish, amend; Inputs settings, Holidays, Days…; Admin → Users — Add a person, Give access, Role, Suspend /
Enable, Archive, Restore, Delete, each with Undo and Redo. **Every window or pop-up opened is closed by each of its own
ways — Close, ✕, Escape, a tap outside — once each, with a picture after the one tap, asking whether it is gone and
whether what lay under it is as it was (lessons 19, 12).** After each act look at the other places that should show it:
the other squadron's same page (its admin's sign-in), the bell, the change history. Ranger's round runs with Move M
standing; Hunter's last part with Move H.

---

## 5. The walker's common section (paste at the head of each walker's prompt)

You are walker **W<n>** of the multi-squadron reshape's FULL check (project Raptor, a squadron scheduling app; code
under `raptor-port/`). You walk the running app in a real browser and report what you see. **You do not read code for
bugs, you do not fix app code, you do not decide whether a finding is real** — the host reproduces every finding. Read
first: this brief whole (`raptor-port/docs/superpowers/briefs/2026-11-21-msq-reshape-walk-brief.md`), and
`raptor-port/docs/walk-scripts.md` §3 to §7.

**The build.** The host serves one frozen build at `http://localhost:<PORT>` (in your prompt) and its bundle name
(`RS_BUNDLE`). Never rebuild, never `npm run build`, never the Playwright test runner — plain node scripts that load the
`playwright` library through `scripts/handpass/msq/msq-rs-lib.mjs`. Each world is a new browser and context: its own
storage. Two sizes: desktop 1536 × 864 Chromium (`size: 'd'`), iPhone 402 × 874 WebKit by touch (`size: 'p'`).

**Your files.** Your own worktree and branch `claude/msq-b1-walk-w<n>`. Scripts: `raptor-port/scripts/handpass/msq/
msq-rs-w<n>-*.mjs` (prove the name free first), written with the file tool, saved as UTF-8, run from `raptor-port/`
with `RS_SHARE=w<n> RS_BUNDLE=<bundle>` — never inline in the shell (backslashes and apostrophes are lost); never
rewrite and run a script in one step. Pictures: `raptor-port/docs/img/handpass/2026-11-21-msq-reshape/w<n>/`, named
`<scenario>-<step>-<d|p>.png` (the library adds `-d`/`-p`); one run, one folder — a re-run of one step goes to a sub-
folder (`RS_OUT=…/w<n>/only-<step>`). Nothing under `raptor-port/test-results/`. Scratch: `D:\raptor-work\walk-w<n>\`
(the C: drive is nearly full). Commit scripts, pictures and your report (`raptor-port/docs/handpass/parts/
2026-11-21-msq-reshape/w<n>-report.md`) and push your branch alone in its own command:
`git push origin HEAD:refs/heads/claude/msq-b1-walk-w<n>`. Never `main`, never `claude/multi-sqn-b1-107`, no pull
request. A guard refuses `sed -i` on tracked files — use the file tools.

**The library** (`msq-rs-lib.mjs`, smoke-tested 21 Nov 26: all five sign-ins at both sizes, a move saved for Ranger, the
clock 23:58 → 00:00:30 — 142's war striped from Thu 16 at 23:58, 149's war with Ranger in it at 00:00:30, no reload):
`world({origin,size,user,now,moves,rights})`, `signIn`, `signOut`, `saveMove`, `giveRight`, `clockTo`, `nav`, `tap`,
`shot`, `pressShot`, `errors`, `note`, `row`, `table`; ids `ACCT`, `PID`, `CS`, `U142`, `U149`. Its head says what each
does. **SETUP through storage is only a move and a right** (`moves`/`rights` in `world`, or `saveMove`/`giveRight`
mid-run — each reloads, and signs the same person in again if the card came back); everything else through the app's
own controls (§7.7) — a state you cannot reach that way is a missing door: report it, never plant it.

**Recipes proved on earlier builds — prove the first step on this screen before building on it** (walk-scripts §1):
open July for bidding as Saber: Leave War → "Bidding closed" → "JUL" → the sheet's ✕ (the drawing check's
`reachWar`); a war cell: `[data-testid="cell-<pid>-<yyyy-mm-dd>"]`; the bid window `.bidsheet`, its title
`.bidsheet-hd`, remarks `#bid-remarks`, the band `.bidsheet .saveband.moveband` (its "Close" a button inside); the
Tracker's editor: `button[title^="Edit the syllabus"]` → "Edit chart layout" → `#arrTools.on`, its band `#page-tracker
.saveband.moveband`; Inputs: `#inNew`, `#inpEditPerson`, `#inpEditType`, `#inpEditRmk`, `.inped-win .dcal-d[aria-label^=
"Thu 16 Jul 2026"]`, `#inpEditSave`, then the document question ("No document" / "Later" / "OK"); Inputs' tabs
`#inMemberMode`, `#inSansMode`, `#inMedBtn`; Admin → Users: `nav(w,'admin')` → the "Users" category → the search box →
`button.acc-main` (the row) → `.acc-edit` with `#accEdSave`, `#accEdOnOff` (Suspend / Enable), `#accEdArchive`,
`#accEdDel` ("Tap again to delete …"), `#accEdCancel`; the bell `#notifyBell`, its list `[data-testid="bell-list"]`
`.bl-line` (`.unread`); Undo `#undoBtn` / Redo — on the Scheduler Board its own `#sbUndo` / `#sbRedo`; the phone's menu
`#burger`; Sign out reads "Logout". The change history opens on "New to you" — press "All changes" to see your own.

**The three conditions (the order's §4).** (1) The host opens the pictures behind every FAIL and every high-consequence
PASS (OIL, a published day, a role or right, saved data) — name them. (2) A scenario with an EXPECTED line is PASS or
FAIL; RECORDED only where this brief writes **RECORD**. (3) Your conclusion is a finding only after the host reproduces
it — write "to check", never "a fault". **What is NOT a finding:** *"This app is pre-promulgation and its entire stored
world is DEMO DATA that will be CLEARED before the database step. Do not report a problem whose harm exists only in data
already stored when the code is already correct going forward — no migration, no back-compat, no 'an existing record
would read wrongly'. If the app would do it again to NEW data, report it: that is a real finding."* (D56). A scheduler
who is not an admin (D785). Held on purpose: K2, K3, A3, B7 ("Request access" names no squadron), C7 (sign-out's
reload), C10; Admin → Squadrons and any screen that gives View or Plan or moves a person; the "Schedules" menu; Admin →
Users listing both squadrons; the Tracker not re-read in place at midnight (it moves at the next sign-in); the band's
generic "This change could not be saved." on a later day; the guest view (removed, D2239). WebKit on Windows refusing
to store a document ("Couldn't save that document — your browser storage may be full…") is the test browser's, not the
app's.

**Traps** (walk-scripts §3–§7, each once a false FAIL): the clock is left running — `clockTo` only forward; a step back
is a fresh world. Assert each fixture step landed before relying on it, and answer every question a control raises. Name
what an action made by the ids before and after, never by position. Two people acting in turn share one tab — sign out
and in; a FAIL from two live tabs is reproduced in one before it is reported. Read the words a person sees (elements
wider than 1px; typed words are a box's `value`); normalise the no-break space before "›". Press the control the app
routes, at its own box. A negative check first proves its subject is drawn; every new pass/fail read is run once on a
screen where it must pass and once where it must fail; an absence is judged after the slowest way it could appear (wait
2 s). Every scroll step asserts the scroller moved; "in view" by `elementFromPoint` at the visible middle. **On the
phone, what a press opens is proved on screen before anything in it is pressed — never a script that scrolls first**;
every tap through `pressShot` (the picture within about 100 ms of the lift, then the settled one), and you name any tint,
see-through cell or shifted box only the pressed one shows. A scripted finger rests about 90 ms before it lifts; wait
600 ms between two taps on one box. A gesture is measured by what the person sees — what was under the finger stays
there. Undo is the app's own button, never the keyboard's keys. A window's title bar keeps the keys — check a "tap away"
left the box. A mark is asserted as PAINTED by a computed style on each element it must cover, and every picture you
cite you have opened (anti-pattern 21). Every screen you picture: each pair of side-by-side boxes one height and one
line (lesson 23b — the pattern `scripts/handpass/adm-pairs-measure.mjs`). Before calling anything a FAIL, read the
script's world first (walk-scripts §7): what does the world hold, what did the script press, what did the box read. A
check whose own set-up could not act is NOT WALKED, never FAIL; stop after three failed attempts at one gesture and
report it.

**Report** (under about 1,500 words, one file, then a short hand-back): a filled table — scenario, size, PASS / FAIL /
RECORDED / NOT WALKED, what was seen in the app's words, picture names; then each finding "to check" with exact steps
to reproduce (world, clock, setup, presses) and its pictures; the console errors and any failed-save band seen (`errors`);
your final run's picture count and folder; the scripts' names. Send it ONCE, after closing every browser you started.

---

## 6. The lessons of §7.11 for this walk

| # | Lesson | Covered by |
|---|---|---|
| 1 | state × reading table | W3-02 (the window before and after midnight, every line), W2-05 (pending / approved / refused / removed), W1-01 (window before and after a refusal) |
| 2 | drags at a person's speed | W2-03 block drag quick and slow on the phone; W4-02 the puck drag |
| 3 | what tells the person it happened | every press: the note read (`note`) and the result pictured; W1-01 the refusal |
| 4 | a press on the page behind a working window | W3-01 (the grid tapped behind the held window) |
| 5 | a box moved into sight vs what stands over it | W3-01 (the remarks under the band, measured at rest against the window's pinned bars, phone) |
| 6 | what only the real phone draws | W3-01's held window with the keys up — his look card (§7) |
| 7 | motion steered against the phone's own | cannot apply: nothing is moved frame by frame against the phone's motion |
| 8 | a screen with an approved drawing | the drawing check on the band (host); q6a–q6d in W2-01/W2-02, picture 9b in W5-01/W5-02, by eye, "not measured" |
| 9 | lists measured, every kind of row | W2-05 (Approvals), W2-06 (Balances), W2-01 (a pilot and a WSO mover's rows) |
| 10 | a page hidden and shown again | W3-04 (the war hidden behind Inputs across midnight, back by its tab, in WebKit, first frame pictured) |
| 11 | a reading that depends on how much fits | cannot apply: nothing the reshape draws depends on the width shown |
| 12 | every page a window opens from | W3-07 (the bid window from the grid, My leave, the person window, Approvals); W1-06 (the OIL list from the bell and the schedule) |
| 13 | a pinch part-way down | W2-01 (one pinch mid-grid on the phone, the striped row under the pinned names) |
| 14 | boxes found by searching | W3-07 (the war's windows' text boxes listed by search, each tapped on the phone) |
| 15 | a bar over a scrolling area | W3-01 (the band over the window's scrolled body, phone) |
| 16 | the same figure after a refusal | W1-01 (tap away, tap the date afresh, the same end date, Save) |
| 17 | a control that shows or hides part of a page | W3-01 (the band's Close: the page no wider than the window after); W4 round (the member view switch) |
| 18 | print and download | W4-04 (CSV and print pictures, Chromium and WebKit), W1-03 (Quals export), W1-06 (holiday sheet), W3-08 (Tracker Export…) — his look card |
| 19 | a window over a window, each way to close | W3-07 (two stacked), W3-01 (four ways), every round |
| 20 | a gesture the ways a hand makes it | W2-03 (the range drag slow, quick, short, again before it settles) |
| 21 | the test browser's touch is not his phone's | named on his look card (§7) |
| 22 | judged by what is drawn | W3-01 (the band's pixels at 00:00:01, its first frame) |
| 23 | what a tap opens, against the rulings for that kind of entry | W2-01 (a striped cell beside Havoc's posted-out away cell, D320) |
| 23b | side-by-side boxes on every screen pictured | every walker, §5 traps (`adm-pairs-measure.mjs` pattern) |
| 24 | flick to the foot on a phone | W3-04 (149's war after the change, flicked to its foot and back) — and his look card |
| 25 | every place the thing can be put | W2-01 and W4-01 (a pilot, a WSO and a Personnel man moved); W4-02 (a flying line, a desk, a sim seat) |
| 26 | a gesture measured by what is seen | W4-02 (the puck follows the finger) |
| 27 | neighbours' boxes across a press | W3-01, W3-02 (the window's controls before and after the band arrives, against the drawing) |
| 28 | on a phone, what a press opens proved on screen first | every phone step (§5 traps) — the OIL list, Approvals, a Users row |
| 29 | the page open across midnight | W3 all, W4-06, W4-07, W4-08 |
| 30 | the picture within 100 ms of a tap | `pressShot` on every phone tap |
| 31 | a page fitted to the screen at 125% | cannot apply: no page fitted to the screen changes its layout here |

## 7. What only his iPhone or PC can show (his look card)

- **His iPhone, lesson 6 / 21:** Ranger's bid window held at midnight with the keys up — does the band stay over the
  typed words, and does a tap outside or "Close" do what the test browser's did.
- **His iPhone, lesson 24:** 149's Leave War, just after the change, flicked hard to its foot and back — the top bar and
  the pinned dates stay.
- **His iPhone, lesson 18:** "Export as PDF (print)" of a published 142 day Ranger was on before his move.
- **His PC, lesson 31:** nothing — no page fitted to the screen changes.
- Lesson 7: nothing — no motion steered against the phone's own.

## 8. For the host before the walkers start

1. **The re-link (W5-09):** the plan §4.6 and §13 ask for Admin → Users' re-link to be walked, but its person editor has
   no control to link a sign-in to another person. Decide: a missing door (a finding), or not built (NOT WALKED, tests).
2. **The Tracker event pop-up at midnight (W3-03):** the plan §11 says a pop-up gets "the same" band; the approved
   drawing and the build put it on the chart editor only. Walked as RECORD; yours to settle with his rulings.
3. **Two leads from the smoke test** (to check, not findings): after midnight the top bar's small number still read
   "142" over 149's war (W3-04); Ranger's "MY LEAVE" read "LVE -5" in 149's war, "LVE 12.5" in 142's (W2-06).
4. Run your own short route on the shared recipes first (walk-scripts §1) and add any trap met to §5 before the walkers
   go; give each walker the port, the bundle name and its share number.
5. The walkers run five browsers at once on his PC — no build or browser test of the host's may run meanwhile, and
   nothing rebuilds the frozen folder (the order's §4).
