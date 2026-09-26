# [HUMAN-RETEST] the absence record, walked with [S4-HUNT-REST] — the plan (26 Sep 26)

Branch `claude/absence-record-d147-af6a50` (cut from `main` at `e27e15fe`, the merge of PR #442 `[ACCOUNTS]`). His
order: D147 (the absence record together with `[S4-HUNT-REST]`, then change-recording, then the Leave War links).
Written by Opus 5.5 (the builder of this re-test); reviewed by Fable 5.1 and Astra, blind to each other (D67). The
order this follows is `raptor-port/docs/bug-check-order.md`. Parallel with `claude/accounts-new-person` and a
small-fixes batch (D228): preview port **4175**, browser tests `E2E_PORT=4192`, rulings **D260–D269**, and every
heavy run takes the PC-wide lock (`node C:/Users/User/projects/Raptor/raptor-port/scripts/gatelock.mjs take|release`).

## 0. What "the absence record" is, plainly

Since `[ARCH-STACK]` step 4 (20 Sep 26) an absence — leave, a medical, a course, overseas duty — is ONE record: the
person's Input on the Inputs page. The Leave War does not keep its own copy; it READS the Inputs and draws them on
its grid (one code per day by the ladder, a grey `+n` for the rest, an amber `!` when something needs an admin),
charges them against the man's balances by halves, and takes him off the manning. The war stores only what is its
own: bids (undecided / Ack / approved / refused), OIL credits (the schedule's automatic ones and an admin's typed
award) and the notices left when someone else's filing replaced a bid. Approving a bid on the war WRITES the Input.
The owner's clash rules run at ONE seat inside the Inputs door (`src/leavewar/inputgate.ts`), so every door —
the Inputs page, its calendar, the week and the board, reassign, the war's own gestures, undo and redo — obeys
the same rules. The schedule reads the same Inputs: its Unavailable rows, the crew picker, the warnings, the
ALL AVAIL window, export.

The hunt that followed (PR #422, 21 Sep 26) changed the rules a great deal (`specs/2026-09-20-CURRENT-STATE.md`
§1–§6) and was proved by tests and by reading only — **nobody ever watched it on screen** (its §8). Most of the
ground Fable and Codex planned for it was never run: `[S4-HUNT-REST]`'s seven areas.

## 1. Scope

**In:**
1. **The hand test owed since 21 Sep** — CURRENT-STATE §1 rows 1–24 and §6 (Q1–Q5), walked ruling by ruling in the
   running app: the Post in sheet and its undo; a row that appears in a month the person had already left; a
   pre-joining day tapped by an admin and by the person himself; the bid sheet opening on one half with the other
   named; the hours box on a hand-typed credit; what a member reads on a clashed day; recording that someone worked
   (FO/HO with reason and giver) on any day; placing leave or OIL outside the posting dates; publishing KEEPS an
   undecided bid and flags the day; the one window (Ack / Approve / Refuse / Move) in every stage.
2. **`[S4-HUNT-REST]`, his order:** (1) the Inputs calendar by DRAG; (2) the medical dialog's cascade; (3) bulk
   gestures by real drag; (4) switching wars with a sheet open, and undo after switching; (5) storage faults;
   (6) phone, by finger; (7) figures on days with several records. Their scenarios, already designed by Fable and
   Codex on 20 Sep: `plans/2026-09-20-s4-bughunt-plan.md` batches C, B, D, E, H, G, F (batch A — the OIL ask
   flow — ran in PR #422).
3. **What the rulings since 21 Sep did to absences** (§3 below), walked where they meet an absence: accounts (the
   war follows the signed-in callsign; a member acts on his own row; the guest), a late input on a published day
   (pending, the face frozen), the "till" note (D189), the award and the worked day adding up.
4. **`[PUB-UNAVAIL]`** — filed 19 Sep ("a new absence silently changes a published day's Unavailable list") and
   very likely CLOSED by `[LEAVE-LATE-PUBLISHED]` (D177–D179, merged PR #438). The walk confirms it on screen; if
   it holds, the item is archived with a pointer, not rebuilt.

**Out, and why:**
- **Undo reverses only your own changes (D148)** — decided, not built; it is the change-recording re-test's subject
  (next in D147). This walk RECORDS what undo does today at the absence boundaries (after a sign-out, as the other
  person) so that re-test starts from evidence. Not a finding here.
- **The Leave War links** (the 7 Sep phone check, the figures drawer, bulk balance entry) — last in D147.
- **Filed and waiting on him or on a batch** — not re-reported if met, only cross-referenced: `[LW-WEEKDAY-WORK]`,
  `[LW-COMMIT-MANNING]`, `[LEAVE-YEAR]`, `[LW-LOCKMARK]`, `[OIL-AWARD-IS-A-GRANT]` / `[OIL-EARNED-VS-GRANTED]` and the
  small OIL follow-ups (D147, D203 — one batch before the database), `[OIL-PERSONAL-PLACEHOLDER]`,
  `[OIL-RELINK-XWEEK]`, `[LW-FIGSEL-SLOW]`, `[LW-SCRUBBER-FLAKY]`, `[INPUTSCAL-TAP-FLAKY]` (test-only).
- **What is NOT a finding (D56):** harm living only in data already stored when the code is right going forward.
- **Deliberate, not bugs** (register §8, CURRENT-STATE §4): one undecided + one refused request may share a half;
  windows that only touch do not clash; OIL may go negative.

## 2. The eight questions → FULL

| # | question | answer | why |
|---|---|---|---|
| 1 | Money (earned leave counts, D25) | **YES** | every leave balance, the OIL balance, the medical total, the 15-day run, the manning count |
| 2 | The published record | **YES** | a late input on a published day reads pending and the face stays as issued (D177–D179); publishing flags a clashing bid (N9); a published weekend's OIL credit meets leave |
| 3 | Saved data | **YES** | the Inputs, the war's records, notices, posting dates, medical documents; storage faults (`[S4-HUNT-REST]` 5) |
| 4 | A shared drawer | **YES** | one day view (`engine/dayview.ts`) draws every war cell; one Unavailable reader draws the schedule's rows on the week, the board and the view page |
| 5 | A new gesture or mode | **YES** (re-test of existing doors, most never walked) | calendar drag and hold-to-add, bulk drag, two-step move, the one window, Post in, the hours box |
| 6 | A new surface | NO — a re-test | every existing surface is walked |
| 7 | Roles | **YES** | admin / member (own row, D166) / guest (D213, D215); a member's own filing vs someone else's |
| 8 | The warning list | **YES** | leave over work, a clash note, an amber `!`, INPUT_FLY, the OIL warnings, "1 pending" |

**Tier: FULL.** In order (§5 of the order): the rules sweep → Fable and Astra review THIS plan and design the
scenarios (what is MISSING) → the roll-call and the door check → the everything-world fixture → the walk, fanned
out, with pictures → fixes, each red first → the gates → Fable and Astra read the code with the evidence sheet →
fixes → re-walk what the fixes touched → the gates → the sheet → his look card.

## 3. The rules sweep — every live rule that governs an absence

**The rules of record, newest wins (D90):** `specs/2026-09-20-CURRENT-STATE.md` (it overrides every other 20 Sep
document) → `specs/2026-09-20-one-absence-behaviour-register.md` (B1–B9, H1–H6, Q1–Q15, N1–N19 — with the rows
CURRENT-STATE §5 sets aside marked there) → `specs/2026-09-20-arch-stack-4-clash-check.md`. **The sweep's output is
a new §11 in the register** ("Rulings since the hunt"), the register being those rules' real home; this plan only
lists them.

**Live from the hunt (walk each on every surface it shows on):** B1, B2, B3, the ladder, the mark, Q8 · B7 at every
door, H3 as overruled, back-to-back is not a clash, H6, Q6 · H2 (the STEP of a cut only), the six-hour rule,
§7 (real hours decide whether a medical and leave meet, and where the surviving piece starts), same type twice
refused, the upchit · the owner's bid rule (19 Sep), H1, answer B, B6, answer A, Q2 · figures read the records, Q1,
H4/Q13 with N6 ("touches both halves"), answer C and N8 (posting dates are official and gate nothing), Q10 · B4 as
narrowed by N2 (the credit LANDS and flags), B8/N5 (a typed credit's hours), the ask, Q15 · Q11, Q12, Q14 ·
N1 (noon is the afternoon), N3 (an acknowledged duty replaces the person's own bid), N4 (leave onto work: filed and
flagged, at every door), N7 (Post in), N9 (publishing KEEPS the bid and flags), N10 (a member told what a clash
means for HIS leave), N11 (record that someone worked, any day), N12 (leave/OIL outside the posting dates from the
grid), N13 (an award flags nothing, counts nobody on duty), N14 (a worked weekend that earns nobody says so), N15
(one window, every stage; "Ack"), N16 (an award and a worked day add up), N17 (manning counts bodies; only a
planned absence takes one away), N18 (a clash note holds long enough to read, amber), N19 (an award is ONE number,
in halves; refused, never corrected).

**Set aside — do NOT test them as live** (CURRENT-STATE §5): B4 "overlap → no credit"; both halves of B5; the
18 Aug "pre-joining day is blank"; §26.3 "leave over work refused"; Q5 "approving skips a worked day"; H2 deciding
WHETHER a medical and leave clash; the original H3; the 19 Aug "the row disappears next month" (narrowed).

**Since the hunt — what later rulings did to an absence:**

| ruling | what it means for an absence | walk it where |
|---|---|---|
| D79–D82 (23 Sep, recorded) | = N11, N13, N14, N16 | the leave sheet's credit form, the OIL tracker, a leave day under an award |
| D142 (24 Sep) | a day's OIL is its LATEST published version — an AL that takes a man off takes his credit | a published weekend with leave beside the duty, then an AL |
| D163 (24 Sep) | two demo oddities left (awards dated after the demo week; a man flying in July though posted out in January) | not findings |
| D166 (25 Sep), built in `[ACCOUNTS]` | the war follows the SIGNED-IN callsign; a member bids only on HIS own row; "View as" is gone; who-did-it names the callsign | every war door as `us` (Ranger) vs `ad` (Saber); the notice's actor label (was "(an admin)" — register §8) |
| D174, D176 | a request filed since publishing then taken off / deleted reads 0 | a request row on a published weekend |
| D177, D178, D179 | every input change after a day is published — filed, edited, deleted, moved — reads "1 pending" on the admin's working copy and drops the four sign-offs; the published face keeps what it was issued with, **a medical included** (D179, D185 — frozen, not live) | a leave / medical / course filed, stretched, cut, moved and deleted over a published day, from EVERY door (Inputs page, calendar drag, the war's approve, an upchit, a medical cut) — and whether the war's own approve counts as such a change |
| D189 | stretching or trimming a leave rewrites its "till <date>" remark, and each published day it still covers reads pending | the war's approve-and-extend, a medical cut, an upchit |
| D103 | any pending change on a published day wipes the sign-offs | as D177 |
| D211, D213, D215 | every member sees a medical input's type, remarks and documents; a guest sees the medical row on View-only Sched as a member does, read only | the Unavailable row on the view page as member and guest; the Inputs page and medical view as a member |
| D148 | undo reverses only your own changes — DECIDED, NOT BUILT (change-recording re-test) | recorded, not judged |
| D56, D54 | stored-demo-data harm is not a finding | the reviewers' briefs |

**A clash to put to him if the walk shows it** (flagged now, not decided): D177's "the agent's reading" said a
medical downchit stays LIVE on the published face; D179 and D185 (later) froze it. Newest wins (D90) — the walk
tests FROZEN. The stale text is D177's own row, which already carries "WIDENED BY D178" but not D179's reversal of
its medical sentence; fixed in the register §11 and the row marked, in the same change (D201).

## 4. The roll-call — every place the app draws an absence

**The THINGS:** a leave (LL, OL, CL and the other leave types; full day, a half preset, custom times, multi-day,
overnight) · a medical (ATT C / HL / OML — a downchit; ATT B) and an upchit · a course (CSE) · overseas duty (OD) ·
a bid (undecided, Ack, approved, refused; one half or both) · a notice ("your bid was replaced") · an OIL credit
(automatic, from the published schedule; an admin's award, with hours or without) · a posting date (in, out) · the
figures (each counter's balance, the OIL balance, the medical total, the 15-day run) · the manning count and the
under-manned list.

**Columns** (filled by the walk; no blank cell at the end): SHOWS it? · can the person ACT on it there? · what else
is PAINTED on the same pixels? · walked (who, which widths, which role).

| # | place | what it should show / let him do (the promise) |
|---|---|---|
| R1 | Inputs page — the table (desktop and phone) | every input with its type, dates, half/times, remarks, the war's provenance edge (blue "filed on the Inputs page" vs filed from the war); add, edit, delete, CSV; the medical badge and document paperclip |
| R2 | Inputs page — the add / edit dialog (`#inpEditPop`) | type, span, AM/PM halves, custom times, remarks, person (admin); the clash refusals and the amber clash notes (N18); the OIL ask on a weekend duty; the medical document ask |
| R3 | Inputs page — the calendar (month cells, popover) | each day's chips; hold-to-add; drag a chip to another day; the same refusals as the dialog; the drag ghost never stranded |
| R4 | Inputs page — the medical view (`INPVIEW 'med'`) | who is down and why, the pending count badge, the document viewer; upchit; "replaces it / keep the tail" (MedClashConfirm) |
| R5 | The Leave War grid — a day cell (desktop and phone) | one code by the ladder, grey `+n`, amber `!`, the PO / pre-join hatch, the dotted moved mark, the open-bidding box |
| R6 | The Leave War — the day window / tap list (`DayList`) | every record on the day, ladder order, its own actions (Ack / Approve / Refuse / Move, delete, back-to-bid, OK seen, remarks); the member's line (N10) |
| R7 | The Leave War — the bid sheet (`BidPicker`) | pick a code, one half or both; refused with the reason at every door; the free half beside filed leave named (item 17) |
| R8 | The Leave War — bulk (`SelectSheet`, drag-select) | fill / approve / refuse / back-to-bid / delete / move over a rectangle; "N written, M skipped" true |
| R9 | The Leave War — a person's sheet (`PersonSheet`) | Post in, Post out, their undo; the button through to file leave outside the dates (N12) |
| R10 | The Leave War — the credit form (`CreditForm`) on the leave sheet | code, one quantity in halves (N19), reason, given by, hours (N5); refused odd quantities |
| R11 | The Leave War — the balance column (`BalanceBar`) and the figures drawer / `FigureCell` | the balances move the moment an absence is filed, cut, moved, deleted, undone (Fable round-1 #1 regression) |
| R12 | The Leave War — manning row, `ManningSheet`, the under-manned list | a man counted away ONCE on a multi-record day; a posted-out man never counted; an award counts nobody (N13, N17) |
| R13 | The Leave War — the OIL tracker (`OilTracker`) | the credit's why / who / how many days (item 23); the grant; the balance |
| R14 | The Leave War — the remarks sheet (published, approved leave) | a note editor for the owner or an admin |
| R15 | The Leave War — war switch (the period picker) and the stage control | the sheet closes or goes inert on a switch; undo returns to the war the change was made in |
| R16 | Edit Schedule — the week's Unavailable rows and Personal Inputs | the absence on its day, the late mark, reassign (`iu:`), the edit dialog, the pending mark on a published day (D177) |
| R17 | The scheduler board — Unavailable and Personal Inputs panels (desktop and phone) | as R16; the fold (`data-pitog`); + Add |
| R18 | View-only Sched — the ISSUED face and the working-draft peek | the face keeps what it went out with (D177–D179); the peek shows the live input; member and GUEST see a medical row (D213, D215) |
| R19 | The crew picker and the ALL AVAIL window / count | a man on leave or medical is not offered as free; the count reads the records |
| R20 | The warning list and the ⓘ day panel | leave over work (INPUT_FLY), a medical on a worked day (Q6), the OIL warnings (N14), "1 pending" |
| R21 | History / the edit log | who filed, cut, moved, approved — named by callsign (D166 (5)) |
| R22 | Export — `142-inputs.csv` and the schedule export | the input as stored; the schedule's Unavailable as issued |
| R23 | Week Insights | whatever it counts of absences (open question `[INSIGHTS-WORKING-COPY]` — not re-reported) |
| R24 | The guest view (D215) | the published schedule's medical row, read only; no door into the war or the Inputs |

**The door check** (every action the data allows → the on-screen control, in every state: admin / member-own-row /
member-other-row / guest; phone and desktop; bidding open / closed / published / a draft war; a published day and an
unpublished one; after undo; after a reload; after a war switch): file leave (dialog, calendar hold, calendar drag,
board + Add, the war's approve, the war's "file outside the dates" button) · edit (dialog from the table, the week,
the board; reassign by `iu:` drag) · delete (table, tap list, bulk, the week/board dialog) · bid / re-bid / clear a
bid · Ack / Approve / Refuse / back-to-bid / Move (one window; bulk) · the medical: add, edit, "replaces it / keep the
tail", upchit, the same-type refusal, attach a document · answer the OIL ask (yes / no / only some days) · record an
award (the leave sheet, the OIL tracker) · Post in / Post out and their undo · OK seen · undo / redo (the war's
buttons and the global ones) · switch war · reload · sign out and in as the other person.

## 5. The everything-world (bug-check order §7.1, written for the absence record)

**A Leave War period with every stage** (the demo's JAN–DEC 26, bidding open 1 Jan–31 Mar, and JAN–DEC 27) and, on
ONE person and his neighbours, every kind of record, **made through the app's own controls** (§7.7) by a fixture
script, saved per port (the saved world is tied to its origin — `docs/handpass/README.md`):

- a pending bid, an Ack'd bid, an approved leave (war-filed), a refused bid, a notice left by someone else's filing;
- Inputs-filed leave: full day, AM half, PM half, custom times (08:00–10:00 and 10:30–11:30 in one morning), a
  leave starting at exactly 12:00 (N1), a multi-day run, an overnight leave;
- a medical cutting a leave (ATT C over LL), a half-day medical over a full leave, a medical with custom hours
  (§7), an ATT B beside work, an upchit ending a medical early, two medicals of the same type refused;
- a course with leave on top (Q8), overseas duty;
- a published weekend: a named duty earning an automatic credit, a bid on the same Saturday (N9), leave beside the
  duty at non-overlapping hours (B4/N2), an award on a day he also worked (N16);
- an award with hours and one without (B8/N5); an award on a Tuesday (N11);
- a man posted out mid-period with clearing leave after it; a man with a Post in date and leave before it;
- a pilot with a 15-day LL/OL run crossing a weekend (H4), with one day LL-morning OL-afternoon (N6);
- one day carrying FOUR records (F1) and one carrying EIGHT (G2);
- the demo week's published Saturday carrying a late leave, a late medical and a stretched leave (D177, D189).

## 6. The walk — fanned out (D16), one lock

The host (this chat) builds the fixture, walks the roll-call itself at both widths (R1–R24, the pictures in
`docs/img/handpass/2026-09-26-absence/host/`), then hands four walkers their worlds. Every walker: the production
bundle on **one** preview server at `http://localhost:4175` (each its own fresh browser context, so its own
storage), the fixture recipe and the saved world, `scripts/handpass/lib.mjs` + the absence helpers
(`scripts/handpass/ab/ab-lib.mjs`), its own picture folder, and the instruction to return PICTURES and a filled
table; the host REPRODUCES every finding before it enters the sheet. **The walk takes the PC lock** (D228) for its
whole run; nobody rebuilds the bundle while walkers are on it (bug-check order §4).

| walker | ground | from |
|---|---|---|
| W1 | **The Inputs calendar and the Inputs doors** — drag a chip onto a pending bid / onto other leave at overlapping times / onto a worked day / a multi-day drag over full-day bids / hold-to-add / a medical chip onto leave; the dialog's refusals and clash notes; the refusal never strands the ghost | `[S4-HUNT-REST]` 1; plan C1–C4 |
| W2 | **The medical cascade** — the three-piece OML (B2), "replaces it, keep the tail" (B3), the same-type refusal at add / edit / drag BEFORE anything is touched (B4), cancel leaves nothing (B5), the upchit over a cut (B6), custom-hour medicals (§7), a medical on a PUBLISHED day (D179 frozen + pending), the document ask | `[S4-HUNT-REST]` 2; plan B2–B6 |
| W3 | **The war's gestures** — bulk fill / approve / refuse / back-to-bid / delete / move by REAL drag over a mixed rectangle, counts true (D1–D5); the one window in every stage (N15); switching wars with a sheet open, undo after switching, a redo the rules refuse, undo across a reload (E1–E4); Post in / out, outside-the-dates (N7, N8, N12); storage faults (H1–H3) | `[S4-HUNT-REST]` 3, 4, 5; plan D, E, H |
| W4 | **Phone, figures and money** — touch drag-select and the two-step move at 390px, a flick scrolls and never arms (G1); the tap list with EIGHT records at 390px (G2); four records on a day: one code, `+3`, the right half charged, manning removes him ONCE (F1); a posted-out man with two half-days (F2), leave before posting-in (F3), a notice-only day (F4), the 15-day run through a split day (F5); every figure after every gesture | `[S4-HUNT-REST]` 6, 7; plan G, F |

The host's own walk (before the walkers) covers what crosses to the SCHEDULE and the accounts: R16–R24; the
published-day pending from every door (D177–D179, D189); `[PUB-UNAVAIL]`; member vs admin vs guest on every war door
(D166, D213, D215); the CURRENT-STATE §1/§6 hand test not in a walker's ground (items 5, 9, 10, 11, 15, 16, 18, 19,
21–24).

**Every order** (§7.4): each pair of the feature's own actions in BOTH orders — file then bid, bid then file; approve
then medical, medical then approve; publish then file, file then publish; award then work, work then award; Post out
then file, file then Post out — on a published day and an unpublished one; after each: undo, redo, reload.

## 7. Evidence, tests, and what closes it

- The sheet: `docs/handpass/2026-09-26-absence.md` (the eight answers, the roll-call, the doors, the orders, every
  finding and its disposition, what was NOT walked, the gates, the two reads, the re-walk, his look card). Walkers'
  sheets: `docs/handpass/parts/2026-09-26-absence-w{1..4}.md`. Scripts: `scripts/handpass/ab/`.
- Every confirmed defect: a test red first, through the production route; a row in the roll-call.
- **Break tests** (§8.4): for each wired surface the roll-call marks YES — the absence door (the gate), the merged
  read (a war cell), the tap list, the bid-sheet refusal wording, the calendar drag's refusal, the Unavailable row
  on the issued face, the balance column's repaint — break the wire once and name the test that goes red; where
  none goes red, write one.
- `npm run rulecheck` must stay OK; the register's §9 list ("what nothing points at") must not grow, and the
  rulings the walk names get named tests where they had none.
- The gates on the final code, under the lock: unit · build · tfin 728/0 · e2e (`E2E_PORT=4192`) · Tracker smoke ·
  rulecheck · docsize.
- The two final code reads (Fable, Astra), blind, WITH the sheet — the finder wording and D56 in the brief.
- His look card: three to five lines, expectations in the app's words.

## 8. What the reviewers of this plan are asked (Fable and Astra, blind)

The brief is `docs/superpowers/briefs/2026-09-26-absence-retest-scenarios-brief.md`: attack THIS plan for what it
MISSES — a surface, a door, a role, an order, a rule — and design the ranked failure scenarios the walk must
execute. Their findings fold into §4–§6 before the walk starts (capped at one round — the design review cap).
