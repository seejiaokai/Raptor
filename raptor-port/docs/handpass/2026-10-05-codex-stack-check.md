# The Codex stack — Claude's ONE check (D589) — the evidence sheet — started 5 Oct 26

Branch `claude/codex-stack-review`, cut from `codex/save-note-controls`; the app code checked is commit `bcc69fc8`
against `main` at `de470db5`. Five pieces, built 2–5 Oct 26 while Claude waited (D494, D496): **Discard marks removed**
(D488) · **In-time / Rally and work hours** (D497–D511) · **Insights' mission mix** (D512–D538) · **the workflow UI pass**
(D540–D566: the stylesheet split, the phone board repair, the Tab route, the phone Insights menu, the tapered wing with
the Logic search and the Insights cross) · **the failed-save warning's band** (D586, D587). The Inputs/SANS calendar
(`codex/inputs-sans-calendar`) is on hold and outside this check.

**STATE OF THIS SHEET: IN PROGRESS.** It is written as the check goes (order §9). A section that says "to come" has not
been done; nothing here is a result until its section is filled. **6 Oct 26: the fix round is done (§5.3 — sixteen
findings fixed, each with a test that was red first), the host has looked at the fixes in a real browser (§5.4), the
re-walk is under way (§5.5), and three questions wait for him at the head of §12.**

**Every read the Codex blocks of `HANDOFF.md` list as owed to Claude is paid by this check** (D589) — §10 names each.

## 1. The eight questions — tier FULL

| # | The question | Answer | Why, read off the change |
|---|---|---|---|
| 1 | Earned leave (D25) | YES | Rally / work hours changes where a person's day starts (`engine/reporting.ts`, `events.ts`, `validate.ts`); the worked-hours test of a weekend or holiday reads that start |
| 2 | The published record | YES | "Discard marks" and its command are cut out of the publishing path (`publish.ts`, `sched-commit.ts`, `ALPanel.tsx`); a Blue/Red answer counts on a published day with no amendment (D530); a wrong timing no longer blocks publishing (D509) |
| 3 | Saved data | YES | a new stored record, the mission-role answer (`state/mission-roles.ts`, `persist.ts`, `storage/reset.ts`, `storage/boot.ts`); two new Logic values (`reportLead`, `reportText`) and the tracking switch |
| 4 | A shared drawer | YES | the stylesheet split touches every screen; `board.ts`, `html.ts`, `textedit.ts` draw every line; the warning band sits under every full-screen surface; thirteen windows share one close rule |
| 5 | A new gesture or mode | YES | Tab through the schedule; the phone ⋯ → Insights; "Choose / Change mission role" and the Blue / Red / Later question; "+ In-time / Rally"; Retry |
| 6 | A new surface | YES | the mission-mix chart with Show all; the warning band; the phone menu; the board's Insights door |
| 7 | Roles | YES | `state/perms.ts`: a new table (`MissionRoleAnswer` — admin all, member and guest read), two new commands, `sched.discard` removed, a new settings key |
| 8 | The warning list | YES | the timing-order warnings (in-time, Rally, brief, take-off, landing), "suggested brief", the previous-day wording, how rest and the long day read the start |

Every answer is YES, so the tier is FULL by any one of 1, 2, 3, 7 or 8 (D485: a batch takes its riskiest change's tier).

## 2. Who does what (D588, D589, D590)

| Job | Who | Why |
|---|---|---|
| The plan of the check, the roll-call, reproducing every finding, opening every picture | the host, Opus 5.5 | Opus wrote none of Codex's code |
| Reading Codex's code, piece by piece (AB · C · D1 · D2) | four Opus 5.5 readers, each in its own space, pass 1 before the walk (the inventory and leads), pass 2 after it with this sheet in hand | D67 (3): what Codex builds, Opus reads; never Sonnet (D588) |
| Reading what OPUS wrote inside the stack — the Insights fixes of 3 Oct (D534, D536, D538) and the save-note fix (D586), whose last round has had no independent read | Astra; Sol 6.1 second on the Insights fixes (they touch the published record) | D590 |
| The one side-by-side | Astra, Sol 6.1 and Fable 5.1 each read the Insights fixes once, blind to each other; his weekly allowance read before and after Fable | D590 (5) |
| The scenario list | Astra — a fresh session, told that the Codex sheets are claims; the host adds its own from the roll-call, because Astra planned these builds | D353; anti-pattern 10 |
| The walk | Sonnet 5.5 walkers, each in its own world; pictures and a filled table | D588 |
| The check set | a Sonnet 5.5 helper under the PC lock | D588, D228 |
| Trial 1 — the walkers | one Opus and one Sonnet walker, the Rally scenarios, on the Rally build as it stood before its review fixes (`786d2b2c`), neither told what is wrong | D588 (3), D480 |
| Trial 2 — the builder | `[OG-TAG-OVER-COUNT]` built by a Sonnet helper to a precise spec, read by Opus | D588 (4) |

**The builds walked.** `raptor-port/dist-stack` — `npm run build` of this branch at `8785118d` (app code `bcc69fc8`),
frozen 5 Oct 26; servers `raptor-stack-a` (4221), `raptor-stack-b` (4222). `raptor-port/dist-rallyold` — the same build
command on `786d2b2c` in a temporary checkout, frozen the same day; servers `raptor-rallyold-o` (4226),
`raptor-rallyold-s` (4227). *(Codex's Rally sheet names an earlier commit, `9cc5d4ff`, as "the known-defect baseline" —
the build BEFORE Rally existed. D588, the later ruling, says "the Rally build as it stood before its review fixes", and
on the earlier one the Rally scenarios could not be walked at all; so the trial uses `786d2b2c`.)*

## 3. The rulings walked (the rules sweep: one mark per surface for what is shown, one per order for OIL)
Each ruling of the five pieces, the scenarios that walked it (first walk · re-walk) and the result on the fixed build.

| Ruling | What it says, in short | Walked by | Result |
|---|---|---|---|
| D488 | no "Discard marks"; a day not yet published keeps its marks until published | P1-01…06 (A · M) — week, board, the amendments box, member and admin, phone | PASS on every surface |
| D497–D501, D504 | the In-time / Rally box: one clock per line, a named formation's line or the whole wave's | P2-04…13 (A, B · M), R-11 | PASS; W6's one name on every place that prints it |
| D502 → D509 | a timing pair out of order is a red warning, explained while editing, and never blocks publishing | P2-10, P2-11 (B · M), R-04, the host's run | PASS — and since W15 the list shows it while he is still typing |
| D503 | a reporting clock later than its take-off is the previous day, one day back at most | P2-04, H-01, H-05 (A, B), H-A1 (M) | PASS |
| D505, D506, D507 | own-over-wide per activity; the earliest of duplicates; Rally may equal brief | P2-06, P2-07, P2-11, L-03 (A, B, G · M) | PASS (W3 fixed: a clocked "RALLY AFTER IN TIME" no longer replaces the wave's in-time) |
| D510, D511 | the button fills take-off less the Logic time, and the Logic words | P2-08, P2-09 (A, B · M), L-02 | PASS for a first press and for the words (W2 fixed); the SECOND press copies the line already there — §12, question 4 |
| D25, D48, D142, D591, D592 (OIL) | a published day's OIL comes from its published version | P2-01…03, X-11, L-01 (A, F, G · M) | W1 — a Logic value moves a published weekend's OIL at once: older than the stack, FILED `[OIL-WORK-START]`; the stack's own changes move no OIL (H-04, X-09) |
| D512, D513, D516–D518, D523, D531 | Insights' Blue/Red split, the first twelve and Show all, standby is no sortie, exact DS / RED count Red, the rest ask | P3-01…18 (C · Q), H-02 | PASS |
| D519 | no mark on a schedule line for the mission role | H-02 (C · Q) — week, board, View-only, print | PASS (pictures pixel-identical across the three states) |
| D521, D522, D524 | the Logic switch, Off at first | P3-08, H-07 (B · Q), break C6 | PASS |
| D525, D527, D529 | the answer is remembered until the wording changes; Change while editing Remarks; the automatic question only after his own edit | P3-07, P3-08, X-01 (C, F · Q), L-08, the two-formation steps | PASS (W9, RF4 fixed) |
| D530 | an answer counts at once on a published day, no amendment, sign-offs untouched | P3-01, X-03, X-05 (C, F · Q), R-01 | PASS — programme and signature book byte-identical after each answer; W8 fixed (an answer on an unedited demo day survives a reload) |
| D535 | an open question stays through unrelated edits | P3-07, P3-08 (C · Q) | PASS on the board and for edits; two corners parked — §12, questions 2 and 3 |
| D536, D537, D538 | the window's top on a phone; a tall window to a thin strip; a drag-out never closes a window | P4e-07, P4e-08 (E · P), L-09 (K · N) | PASS — thirteen surrounds and, since W10, the four confirmation windows |
| D541, D548 | the stylesheet split changes nothing visible; the phone board's Desktop layout shows the schedule | P4a, P4b (E): 47 screens at two sizes | PASS; W13 and W18 fixed in that layout |
| D544, D550–D556 | the Tab route, both surfaces; Enter and Escape as before | P4c-01…16 (D · P), H-04, L-10…L-13, R-04 | PASS, with W11, W12, W15, W16 fixed; W14 (a) parked — §12, question 1 |
| D557, D558 | the phone ⋯ menu with Insights; the drawer's WEEK section gone | P4d-01…06 (D · P), X-06 | PASS |
| D560–D566 | the Tracker's tapered wing; Logic's search and the Insights cross stay in view | P4e-01…06 (E · P), X-07 | PASS |
| D586, D587 | the failed-save warning's band, under every full-screen surface, never in a window | P5-01…08 (F · N), L-16, X-04, X-05 | PASS |
| D103, D45 | a pending change on a published day wipes the sign-offs; nothing changes there unacknowledged | H-04, P4c-12, L-11, R-04 (e), the host's own run | PASS — a whole-day Tab pass writes nothing; one typed word shows "1 pending" and empties the four boxes at once |
| D149, D200, D213, D215 (roles) | a member reads, an admin answers; a guest reads what a member reads | H-03, P1-06, P3-17, P4d-05 (C, A, D · Q, M, P) | PASS; the guest on a PHONE was not walked (§8) |

## 4. The roll-call and the door check
**261 rows**, written by the four first-pass readers (AB 61, C 90, D1 63, D2 47 — each surface the piece draws on, each
door, each reader of a shared value), every row with the reader's own answer: has it / must not, because … / MISSING.
`parts/stk-rollcall-marks.md` sets every row against both walks (a Sonnet document chore, spot-checked by the host
against the walkers' tables): **216 rows walked, 45 not.** Each of the 45 was then READ by its piece's second-pass
reader (§10.3) and has a written answer — 44 "sound, because …" (most are things with no screen: a permission row, a
test helper, a CI filter; or surfaces the piece never reaches: the Tracker, the Inputs calendar, CSV), and one
corrected (the board in OIL Earn mode offers no mission-role button — its text boxes are off there — where the first
pass had said it would). The rows whose latest verdict is FAIL or PARTIAL all trace to items already dispositioned:
P2-08 (§12, question 4), P2-17 (`[PEEK-ISSUED]`), W1 (`[OIL-WORK-START]`), L-12 (§12, question 1), P4c-03
(`[REQ-ROW-OWN-BOXES]`), P4c-11 (`[BOARD-TIME-ESCAPE]`; Enter as before), P4c-07 (the SC row's B box, as built),
P4b-02 (the pan gesture, left by D548), P3-17 (the guest on a phone, §8).
Parts, one per reader: `parts/stack-read-AB.md`, `-C.md`, `-D1.md`, `-D2.md`; the save-note band's own roll-call is in
`2026-10-05-save-note-controls.md` and is re-checked here against the top of the stack.

## 5. The walk — IN PROGRESS
### 5.1 How it is walked
Astra designed 104 scenarios (`../superpowers/briefs/2026-10-05-codex-stack-scenarios-astra.md`, from
`…-scenarios-brief.md`); the host added eight (`…-scenarios-host.md`, H-01 to H-08, with notes on three of Astra's that
tested a promise the host's brief worded wrongly — RECORDED, not judged) and, from the four readers' leads, sixteen
more (`…-scenarios-leads.md`, L-01 to L-16). One brief for every walker: `…-codex-stack-walk-brief.md`. Eight Sonnet 5.5
walkers (D588), each a fresh browser world per scenario, on the frozen build, under the PC lock:

| Walker | Share | Server | Table | State |
|---|---|---|---|---|
| A | P1-01…06, P2-01…08 | 4221 | `parts/stk-A.md` | BACK — 91 pictures, 22 opened by the walker; Discard marks six of six PASS (guest not walked); P2-04 to P2-07 PASS; P2-01 FAIL (W1); P2-02, P2-03, P2-08 RECORDED |
| B | P2-09…18, H-01, H-05…H-08 | 4222 | `parts/stk-B.md` | BACK — 167 pictures, about 70 opened by the walker (it says which were not, and that they are not evidence), desktop and phone. 13 PASS, 1 PARTIAL (P2-15: a Common Programme row has no CX to press), 1 FAIL (P2-17, the next-week peek — judged below). PASS: the button's words from Logic, blank restoring the default (P2-09); a red timing warning never blocks the first publish or the amendment (P2-10); equal Rally and brief legal, one minute later flagged (P2-11); a formation's line moves that formation only, a person's name is no target (P2-13); standby is no sortie, SC MAIN alone gains hours (P2-14); the long day, crew rest and the 7-day run stay apart (P2-16); the published face, print and CSV keep the issued wording until the amendment (P2-17); plans and templates carry the lines (P2-18); H-01 — NO negative work hours: the evening clock is read as the previous day and the day carries a long-day note (16:20 (previous day) → 13:25); H-05 a 01:30 take-off fills 22:30 and says "(prev day)"; H-06 markup typed on Logic is drawn as text everywhere; H-07 each Logic change is one undo step and all three values SURVIVE A RELOAD; H-08 the new warning hides like any other, and on a published day the hide waits for the amendment |
| C | P3-01…18, H-02, H-03 | 4221 | `parts/stk-C.md` | BACK — 301 pictures (about 119 behind the final table), about 25 opened by the walker; the host opened 2. 19 PASS, 1 FAIL (P3-04 — W7 again, the changes-window heading), 1 PARTIAL (P3-17: the guest on a phone not walked). PASS on the high-consequence lines: an answer on a published day counts at once with the pending count, the sign-offs and the day's stored record byte-identical (P3-01, seen by the host: the issued Original with its Remarks, and the split bars); an older version offers no way to answer (P3-02); saved plans and day templates carry their own answers and Undo leaves no orphan (P3-04, P3-05); the question stays through an unrelated edit and goes on each of ten context changes (P3-07, P3-08); another person's answer is not undone (P3-18); no mark on any schedule line (H-02); a member never meets a question or a button and sees the admin's bars (H-03); the same twelve rows and Show all from all six doors (P3-16) |
| D | P4c-01…16, P4d-01…06, H-04 | 4222 | `parts/stk-D.md` | BACK — 111 pictures, 31 opened by the walker. The Tab route: 13 of 16 PASS (the order on week and board, reordered sections, folded sections, standby rows, no loop, no write on an unchanged pass through a signed published day, short screens, other apps' own Tab); the phone ⋯ menu 5 of 6 PASS; H-04 PASS — a Tab pass through a published Saturday left "0 pending", the four sign-offs and every Leave War cell as they were |
| E | P4a, P4b, P4e, and one picture of every screen at two sizes | 4221 | `parts/stk-E.md` | BACK — 352 pictures, about 155 opened by the walker; the host opened 1. 19 of 20 PASS: every lazy-loaded app keeps its own look in either order of visit; the sign-in and no-access screens; dense paint and hit targets on a built Saturday; Inputs, Quals, Medical, Logic, Help, Admin; every window at normal and short size; the phone board's Desktop layout draws all ten sections 816 px wide, both published versions read-only, the day kept through layout switches; the wing in every Tracker mode with marks and save / export / import intact; Logic's search and the Insights cross stay reachable; all thirteen surrounds keep a window open through a drag-out and close on a real surround press. **The every-screen look (D541): 47 screens at two sizes, every one "looks whole", no page scrolling sideways — except one phone card, judged below** |
| F | P5-01…08, X-01…12 | 4222 | `parts/stk-F.md` | BACK — 190 pictures, the 87 behind its table all opened by the walker; the host opened 2. The failed-save band: 8 of 8 PASS (its own band under the OIL tracker, the board, the Inputs calendar and the Medical view; one reachable Retry; nothing covered on nine pages at three sizes; the Tracker's Tools stays open; a placed window keeps its size; no band inside a window; Saving… unchanged). The crossings: 11 of 12 PASS — Tab out of a Remarks box that asks Blue/Red keeps the next keystroke (X-01, three surfaces); a failed save in the middle of a Tab run or of a Blue/Red answer loses nothing after Retry and a reload (X-04, X-05); an answer on a published day leaves a waiting timing correction waiting (X-03); the phone ⋯ menu, the Insights cross and Logic's search all sit right with the band showing (X-06, X-07); work hours and the Blue/Red split move separately (X-09). X-11 FAIL = W1 a third time (HO → FO at 3h → 4h) |
| G | L-01…L-08 | 4221 | `parts/stk-G.md` | BACK — 142 pictures, 15 opened by the walker; the host opened 8 (those behind the findings) |
| K | L-09…L-16 | 4222 | `parts/stk-K.md` | BACK — 109 pictures, 23 opened by the walker; the host opened 3 |

### 5.2 What the walk has found so far, and each disposition
"Seen" = the host opened the walker's picture and it shows the fault. "To reproduce" = taken from the walker's figures,
not yet seen by the host — it is reproduced by the red test written before its fix. Provenance is against `main`
(`de470db5`). Dispositions are the host's proposals until the fix round; none is fixed yet.

| # | The finding (what a person sees) | From | Seen? | `main`? | Proposed disposition |
|---|---|---|---|---|---|
| W1 | A PUBLISHED weekend's earned leave moves at once when a Logic value is changed — "Nominal report before T/O", "Flight debrief after land" or the full-day threshold: Ranger's Saturday goes from +1 (07:00–13:15) to +0.5 (07:30–13:15) with "No pending changes", ORIG and the four sign-offs standing; it flips back when the value is put back. Against D48, D142. | L-01 (walker G); Astra M1; reader AB lead 1 — three finders | SEEN (the tracker before and after; the day's bar) | the same on `main` (the earned-leave code is untouched); the stack makes it likelier — the same box now sets the button's time (D510) | NOT this stack's fault; high consequence. Put to him 5 Oct 26; his answer is **D591** — a flying line's earned leave is to be worked out from its actual in-time / Rally, not the nominal report time (not yet built; walker A's P2-02 / P2-03 record that an entered clock moves only the work-hours bar today). FILED with the freeze as one job, `OUTSTANDING.md` `[OIL-WORK-START]` — never fixed under cover of this check. Walker A reproduced it a second way (P2-01: HO → FO at 3h → 4h, still so after a week switch and a reload) |
| W2 | Typing new words for the "+ In-time / Rally" button on Logic lights "RULES MODIFIED" on both week banners for everyone, and Logic says "1 rule changed … the schedule is being checked against these values" — no rule changed. | L-02; reader AB lead 2 | SEEN (the Logic strip) | new in the stack (`94aa8913`) | fix here, red test first |
| W3 | `08:30H: VL RALLY AFTER IN TIME` beside a whole-wave `08:00H: IN TIME …`: VL's crew start 08:30, RU's 08:00 (VL's work hours 30 minutes shorter), in either order. Against D505. | L-03; reader AB lead 3 | to reproduce (figures read off the window) | `main` gave VL 08:30 too, by another route; the stack promised D505 | fix here, red test first |
| W4 | A person on a flying line with no times reads "NaN min" in Insights' Work hours. | L-04 (the walker's side find) | to reproduce | not yet compared | reproduce, compare with `main`, then fix or file |
| W5 | A wave with a reporting line and no take-off yet: its header reads "In-time / Rally —" and it has no band in Available crew; with no take-off the button fills only the words, and `0800` typed at the front joins them as `0800IN TIME + WX/NOTAMS`. | L-04; reader AB lead 4 | to reproduce | new against `main` (reader) | reproduce, then fix here |
| W6 | The lines are still called "in-times" in the changes window ("In-times", "2 in-times → 1 in-time"), the gold-dot bubble ("· IN-TIMES") and the ✕ toast ("In-time line removed") — beside "In-time / Rally" on the box, the button and Undo. D504. | L-05; reader AB lead 5 | recorded by the walker | new (the rename) | fix here: one shared name, a test that draws each place |
| W7 | Every Blue/Red answer is listed in the changes window under "Leave War · rmuv8bvw885wj10" — a hidden code, under another page's name — in both groupings; the same for an answer a day template copies; and after Undo of the template its lines are still listed. D530, D340. | L-06; reader C lead 1 | SEEN (the changes window) | new in the stack (`4cfe81a1`) | fix here, red test first |
| W8 | On a demo day nobody has edited, a Blue/Red answer is gone after a reload, a sign-in, or a visit to the next week and back (bars back to one, the button back to "Choose"); it holds once the day has been saved once. Only the two built-in demo weeks can do it. D530. | L-07; reader C lead 2 | to reproduce | old id behaviour on `main`, harmless there; this feature made it matter | fix here (repeatable ids for the built-in weeks) — he would meet it on his look |
| W9 | While one formation's Blue/Red question is open, no "Choose / Change mission role" button appears for any other formation — week, board and phone. D527, D529. | L-08; reader C lead 3 | SEEN (the week: VL's question open, RU's RED AIR box in use, no button) | new in the stack (reachable since the D535 fix) | fix here, red test first |

| W10 | Four confirmation windows — the OIL question, the upchit one, "covers other days", "no medical document" — close when a press that began INSIDE them is dragged out and released on the dark surround (desktop and phone). D538. | L-09 (walker K); reader C lead 4 | to reproduce | the same on `main`; the 3 Oct fix covered thirteen windows and its guard test missed these four | fix here (the same helper), red test first; Astra reads it (Opus wrote the original fix) |
| W11 | A remark stored with a double space counts as CHANGED when Tab merely passes through it: after a Tab pass through a published Tuesday with nothing typed the day read "1 pending", "Not yet signed", "Publish AL1", with a change line whose before and after look the same. D103, D529. | L-11; reader D2 lead 2 | SEEN (Tuesday's bar and the amendments box) | `main` does the same on a click-through; the Tab route makes a whole-day pass normal | fix here (compare the folded text before writing), red test first |
| W12 | A save that opens a window leaves the typing behind it: a weekend duty request's start time changed + Tab opens the OIL question, the caret stays in the end-time box behind it, and typed characters and further Tabs go into the schedule ("That is not a time"). | L-14; reader D2 lead 5 | SEEN (the OIL window over the editor, the toast) | the first hop is the same on `main`; walking on behind the window is new | fix here, red test first |
| W13 | On a phone, the Scheduler Board's Desktop layout with a failed save: "Not saved — keep this page open" and its Retry are never on screen together — Retry sits about 700 px to the right, reached only by panning. D587. | L-16; reader D1 lead 1 | SEEN (the band cut off at the left, no Retry) | new (neither the band nor a working Desktop layout exists on `main`) | fix here (the band pinned to the screen's width), a browser test |
| W14 | After the day's last open text box on the week, Tab lands on nothing (the page body); the next Tab goes to the next day's Templates. On the board it lands on the ✕ of the first warning line. D553 says "the next normal button or control". | L-12; reader D2 lead 3 | recorded by the walker | new (the route) | fix here: where the day has no later control, let the browser's own Tab carry on |
| W15 | While he is still tabbing, the day does not redraw: the issue count, the warning list, the puck rings and "N pending" stay as they were until Escape or a click; then they update. | L-13; reader D2 lead 4 | recorded by the walker | new in degree (on `main` Tab reached a puck after two or three boxes, so the day redrew often) | UPGRADED after walker F (its F-1, SEEN by the host: the board says "No conflicts flagged for Friday ✓" with the red line "VL: rally 10:00 is later than suggested brief 09:40." showing under the reporting lines, the caret in the next box): a warning made — or cleared — by a Tab commit is missing from, or left in, the day's list and count until he leaves the text boxes; Enter or a click shows it at once. D509 says the warning shows in the list. Fix here if it can be done without redrawing under the caret (redraw the list and the day's bar only); otherwise on the look card with the reason |
| W16 | On Edit Schedule's week a wave's header keeps the OLD clock after its In-time / Rally line is edited ("21:30 (prev day)" beside a line reading 22:30H) until the next edit or a reload; the board's header is right at the same moment. | walker A (its own find, off the list) | to reproduce | not yet compared | reproduce, compare with `main`, then fix here |

**Leads that did NOT reproduce.** Reader D2's lead 1 (a box still showing an old copy writes it back when entered by a
click): walker K walked all three forms — PASS each; the host ran the take-off / Area-time case on both builds with real
clicks (`scripts/handpass/stk-host-click-cmp.mjs`): the window followed to `1255-1405` and nothing was stored, on the
stack and on `main` alike. The reason is the same on both: after a CHANGED box, one click into another box lands on
the page (the day redraws first) and it takes a second click to put the caret in — old behaviour, on `main` too, FILED
as a low item rather than fixed here (`OUTSTANDING.md` `[EDIT-SECOND-CLICK]`). Only a phone keyboard's own next-field arrows
could still reach the reader's case — a real-device line for his look. Reader D2's lead 6 (the page jerking on a
wrapped box): walker K measured no movement at either width — not a finding.

**Recorded, for the host to judge.** P2-08 (walker A): with a line already on the wave, a second press of "+ In-time /
Rally" copies that line's clock (08:00) and not take-off less the Logic value (10:00) — as the 3 Oct review's fix D
specified ("when the wave has no resolved report"); D510's own words do not carry that condition. A question for him
on the look card, not a fault. L-09: a plain click on the surround also closes each of the four windows, cancelling
the save — as built.

**A walker's remark thrown out.** Walker G wrote that Logic values are not kept across a reload on this build; its
script had pressed "Reset to standard" before the reload. H-07 (walker B) tests it properly.

**Walker D's three FAILs, each judged by the host — none is a fault of this stack.**
- *P4c-11 (Escape on the Scheduler Board's TIME boxes does not put the old value back, and a click away saves it).* The host ran the
  walker's own probe (`stk-D-1b.mjs`) on `main`'s build and on the stack: the same on both, box for box — the board's take-off,
  landing, Brief and duty-start boxes keep what was typed after Escape and save it on leaving; the week's boxes and the board's text
  boxes restore. D544 says "keep the existing Enter and Escape meanings" — they are kept. Old behaviour: FILED low
  (`[BOARD-TIME-ESCAPE]`), for his word.
- *P4c-03 (typing in the Ground ROW's own boxes of a row that came from a request changes the row, not the request).* The row's own
  boxes are the scheduler's layer over the request, typed by click on `main` too; typing in the request's own boxes saves to the
  request and the row follows (walker D, and L-10 (c) by walker K). Astra's scenario assumed the row is the request. Not walked on
  `main`; to confirm by reading at the fix round — not listed as a finding.
- *P4d-01 (the guest's view has no ⋯ menu and no Insights).* By design: the guest's pages never had Insights (the 1 Oct check
  excluded the same scenario for the same reason). Not a finding.
Also recorded by walker D: after Enter in a time box the caret is dropped and the next Tab starts again from the top of the section
(with W14 at the fix round); the board draws a Brief box on SC / AVALON / BB rows, which the route visits (as built — on SC it is
the in-time, the settled 24 Aug 26 rule).

| W17 | An empty formation — "+ Line", nobody on it — raises Insights' SORTIES tile (31 → 32) and FORMATIONS tile (16 → 17); the per-person bars are right. | walker C (its own observation O1) | to reproduce | not yet compared | reproduce, compare with `main`; if old, file low |

| W18 | On a phone, the Scheduler Board in its Desktop layout, panned so the ⋯ button sits at the right edge: its menu opens past the edge of the screen and "Insights" (with Sort and Phone layout) is cut off; panned further left it works. Also recorded: a sideways pan takes only when it starts on the board's top bar, not on the schedule — the 4 Oct investigation's known behaviour, left by D548. | walker F (its F-2) | SEEN (the menu cut at the right edge) | new for Insights (the item is the stack's; the layout was unusable before the repair) | fix here (keep the menu inside the screen), a browser test |

| W19 | A reporting line whose clock is spelt in a way the app does not read — `8h00 VL IN TIME`, `8.00 …` — is kept as typed, counts as no clock, and nothing says so; `2400` and `25:99` do warn, and a line with no clock at all gets "reporting line 2 has no recognised clock". | walker B (its F2) | to reproduce | not yet compared | low — reproduce; if the advisory exists for one case, give this one the same line |

*(W17, W18 and W19 are listed here, out of the table above, because they arrived after it; the fix round renumbers nothing.)*

**Walker B's FAIL, judged — not this stack's.** *P2-17: the next-week peek column shows the WORKING copy of a published day ("PB ACM" while
View-only Sched, print, CSV and the Original all read the issued BFM).* The peek has never read the publish state — it is the open
question already filed for him as `OUTSTANDING.md` `[PEEK-ISSUED]`; the stack did not touch it. Not a finding here; it goes on his
look card as a reminder that the question is his.

**Walker E's finds, judged.**
- *The green OIL chip is painted over the date and time on a phone Inputs card of an OIL-credited request (seen by the host:
  "18 Jul 11:00–12:00" with "OIL" over it).* NOT the stack's and NOT the stylesheet split's: the Inputs page's code and its
  stylesheet part have no change anywhere in the stack (`git diff de470db5 bcc69fc8` is empty for them, and the split's parts
  re-join byte for byte — reader D1). Older: FILED low, `OUTSTANDING.md` `[INP-OIL-CHIP-PHONE]`.
- *P4b-02 FAIL: in the phone board's Desktop layout a sideways swipe on the schedule itself moves nothing (14 of 790 px); it pans
  only from the title strip; and a swipe along the Mon–Sun chips both pans and changes the open day.* The first is the 4 Oct
  investigation's known behaviour, left by D548 ("fix ONLY the blank layout"); the second was seen only in the test browser's touch
  emulation. Both go on his look card for his iPhone — he ruled the rest of that layout left as it is.
- Observations, none a fault of the stack: the Quals date box is the browser's plain grey box; Admin → Squadron config's order lists
  glue the number to the name ("Overall notes1"); a passing toast lies over a window on a phone; the Tracker opens with an empty band
  above its first ball. Not compared with `main`; listed for the look card only if he asks.

**THE WALK IS COMPLETE — eight walkers back, 5 Oct 26.** 1,471 pictures saved by the walkers; the host opened 16, each one
behind a finding or a high-consequence PASS. The PC lock was released when the last walker returned.

### 5.3 The fix round (6 Oct 26) — what was done about each finding
Built by the host (Opus 5.5) on this branch, each with a test that FAILED first; the app code of the fixed build is
commit `b1632e32`. "Old" = the same on `main` (`de470db5`), read off its code.

| # | Disposition | What was done, and the test that pins it |
|---|---|---|
| W1 | FILED, not fixed here — `OUTSTANDING.md` `[OIL-WORK-START]` (D591, D592) | Older than the stack; its own job after the stack is live. |
| W2 | FIXED `29c68485` | The stamp and Logic's strip count only settings a check reads (`engine/rules.ts rulesCheckedOffCount`); the count, the cell's tag and Reset still know the words. `ui/logic.test.tsx` "W2". |
| W3 | FIXED `29c68485` | "RALLY AFTER IN TIME" with a clock is a rally line only (`engine/reporting.ts`). `engine/rally-workspan.test.ts` "W3", both orders. |
| W4 | FIXED `29c68485` — old on `main` (its event builder and `workSpan` are the same there) | `engine/validate.ts workSpan` ignores a line with no times. `engine/insights.test.ts` "W4". |
| W5 | FIXED `29c68485` | `engine/events.ts waveInTime` reads a formation with no take-off as the day's checks do. `engine/intimes.test.ts` "W5". The joined spelling `0800IN TIME` is told "no recognised clock" (W19). |
| W6 | FIXED `c4fb74af` | One name, `REPORTING_LABEL`, in the changes window, the pending list, the change record and the ✕ toast. `ui/intimesadd.test.tsx` "W6" draws each place and scans the shipped strings. |
| W7 | FIXED `c4fb74af` | A Blue/Red answer is filed under its formation — the same item as that line's other changes (`ui/changesmodel.ts roleItem`). `ui/changesmodel.test.ts` "W7", both groupings. The lines of an undone template staying listed is how the history works for every change (an "Undo — …" line is added; nothing is erased) — not a fault. |
| W8 | FIXED `c4fb74af` | The two built-in weeks carry repeatable hidden row ids (`engine/weeks-data.ts seedRids`; the boot seeds the same). `state/mission-role-seedweek.test.ts` (the real save and a fresh boot; a week switch), `engine/rowids.test.ts` "W8". |
| W9 | FIXED `2893c5a1` | Two slots: the one open question, and the button under the Remarks he is in (`ui/mission-role-offer.ts`). `ui/mission-role-interim-fixes.test.tsx` "W9". |
| W10 | FIXED `2893c5a1` — old on `main` | `ui/outside.ts clickedSurround` in the four windows; the guard test now refuses a surround test by class too. `ui/outside.test.tsx` "W10", all four. |
| W11 | FIXED `5b55e1c1` — old on `main` (a click-through did the same) | `engine/slots.ts txtSet` folds the stored words before calling a text change. `ui/schedule-tab.test.tsx` "W11". |
| W12 | FIXED `5b55e1c1` | The Tab route stops when its save asks for a window and declines while one is up (`ui/pops.ts windowOverSchedule`); the four question sheets take the keyboard on opening (`ui/sheetfocus.ts`). `ui/schedule-tab.test.tsx` "W12". |
| W13 | FIXED `5b55e1c1` | The band is pinned to the screen in the phone board's Desktop layout (`ui/scheduler/17-save-status.css`). `e2e/save-note.spec.ts`, three pans, two phone sizes. |
| W14 | **(a) PARKED on his answer — §12, question 1.** (b) not reproduced after W15 | (a) After a day's last box with no button below it, Tab leaves the caret on nothing — D553 says "the next normal button" and "without changing day"; the browser's own next stop is the NEXT day's Templates button, which D553 does not approve. (b) The reader's "the control Tab lands on is redrawn a moment later": on the fixed build the host's run landed on the ✕ of a warning line and stayed there (§5.4). |
| W15 | FIXED `b1632e32` | Everything that does not hold the caret is redrawn at once: on the week `ui/dayswap.ts swapDayAround`, on the board every panel but the caret's. `ui/dayswap.test.ts`, `ui/schedule-tab.test.tsx` "W15" (week and board). **Still held by design: the puck rings and marks INSIDE the section the caret is in — they catch up when the caret leaves that section (his look card).** |
| W16 | FIXED `b1632e32` | The wave header's clock is corrected in place (`ui/html.ts refreshWaveReports`, text only — the edit week stays byte-identical with the reference). `ui/schedule-tab.test.tsx` "W16". New in the stack (`main`'s week header shows no clock). |
| W17 | FILED low — old on `main` (the same counting line) | `OUTSTANDING.md` `[INSIGHTS-EMPTY-LINE-COUNT]`: an uncrewed line counts as a sortie and a formation, as the day's own "4 X 4" count does. A question for him, not a fault of the stack. |
| W18 | FIXED `5b55e1c1` | The board's ⋯ menu hangs from the button's right edge when it would pass the screen's. `e2e/geometry.spec.ts`. |
| W19 | FIXED `29c68485` | `8h00`, `8.00`, `0800IN` get the "no recognised clock" line; `FL240`, `2 SHIPS`, `2.5 HRS` do not. `engine/rally-workspan.test.ts` "W19". |

After the round: unit **7805 / 7805** (492 files), tfin **728 / 0** — watched 6 Oct 26 under the PC lock. The full
check set is §9.

### 5.4 The host's own look at the fixes, in a real browser (6 Oct 26)
`scripts/handpass/stk-host-fix.mjs` on the fixed build (`dist-fix`, port 4233), the real keyboard throughout; results
`parts/stk2-host.json`; 9 pictures in `../img/handpass/2026-10-06-codex-stack-fix/host/`, **all opened by the host**.

| Step | What the screen said | Verdict |
|---|---|---|
| W15, week | Mon, list open; line 1 retyped `12:40H: VL IN TIME`, Tab: the caret in the next line; the list gains "VL: in-time 12:40 is later than suggested brief 10:20." and the bar goes 6 → 7 warnings at once; `ZZ` typed straight after lands in the box that has the caret | PASS |
| W16 | Mon 20 Jul, wave 1's line set to 23:30H, Tab: the header reads "WAVE 1 · In-time / Rally 23:30 (prev day)" with the caret still in a text box | PASS |
| W15, board | Tue; line 1 retyped `08:40H: VL IN TIME`, Tab: the list goes "4 issues · 2 warnings" → "5 issues · 3 warnings" and names it, the caret in the next line; the header note follows ("In-time / Rally 07:00 · 4 ac") | PASS (seen) |
| W14 (b), board | after a saved line in the run, Tab from the last open box: focus on the ✕ of a warning line at once and 0.7 s later | not reproduced |
| W13 | phone, board in Desktop layout, a failed save, panned 0 / 395 / 790 px: words at 14–220 px, Retry at 314–376 px of 390, a finger on Retry lands on Retry — every pan | PASS (seen) |
| W18 | the ⋯ button 10 px and 350 px from the left: the menu at 10–186 px and 204–380 px, Insights · Sort all · Phone layout whole | PASS (seen) |
| errors | none in either run | PASS |

### 5.5 The re-walk (6 Oct 26) — DONE: four walkers back
Four Sonnet 5.5 walkers (D588; Trial 1's conditions, §11) on the frozen fixed build `raptor-port/dist-fix` (app code
`b1632e32`), ports 4231 / 4232, under the PC lock; brief `…/2026-10-06-codex-stack-rewalk-brief.md`, added scenarios
`…-rewalk-additions.md` (R-01, R-03, R-04, R-11); each started from the first walk's scripts as a recipe, never a
verdict, into its own folder (`../img/handpass/2026-10-06-codex-stack-fix/<letter>/`). No console error, page error or
4xx in any run. About 820 pictures saved by the walkers, 96 opened by them.

| Walker | Share | Result | Table |
|---|---|---|---|
| M | L-02…L-08, R-11, the stale-header steps, P1-01…06, P2-08…13, L-01 (record) | every fixed finding PASSES: no stamp for the button's words, and the stamp back for a number (W2); VL's day starts 08:00 in either order (W3); no "NaN", the new wave's header and band (W4, W5); "In-time / Rally" in the changes window, the pending list, the gold-dot bubble and the ✕ toast (W6); an answer under "Flying · VL" in both groupings (W7); the answer kept across a reload, a saved day and a week switch (W8); the button under the second formation with the first one's question still open — week, board, phone (W9); the week header 22:30 straight after the Tab (W16); the odd spellings told "no recognised clock", `BLDG 12` and `FL240` left alone (W19). Discard marks six of six PASS. **One FAIL, P2-08** — the second press of "+ In-time / Rally" copies the line already there, not take-off less the Logic value: the first walk's recorded question, as built on the 3 Oct review's instruction (§12, question 4). L-01 recorded: W1 exactly as filed (`[OIL-WORK-START]`). | `parts/stk2-M.md` |
| N | L-09…L-16, R-03, R-04, the ⋯ menu, P5-01…08, X-06, X-07 | the four confirmation windows keep open through a drag-out, desktop and phone, 8 of 8 (W10); 146 Tabs through a published Tuesday holding a double-spaced remark: nothing written, the sign-offs standing (W11); the OIL question opens with the caret INSIDE it, `X` typed goes nowhere, Tab moves among its buttons (W12 — on a duty whose time change really re-prices it; the scenario as the host wrote it, a 4-hour duty moved an hour, opens no window: the host's premise, not a fault); the band's words and Retry together at three pans (W13); the day's list gains the new red line straight after ONE Tab, the next three Tabs move nothing, the typed letter is in the caret's box, Undo puts the list back — week, board, phone week, and a published Tuesday reads "1 pending", "Not yet signed" with the caret still in text (W15); the ⋯ menu whole at three positions (W18); the failed-save band 8 of 8, X-06, X-07 PASS. **One FAIL, L-12 on the week** — Tab after the day's last box lands on nothing (W14 (a), parked: §12, question 1; the same dead stop on the PHONE board, where no control follows the last box either). Recorded, as designed: the puck rings INSIDE the section the caret is in wait for the caret to leave it (W15's stated limit). | `parts/stk2-N.md` |
| P | P4c-01…16, H-04, P4d-01…06, P4e-06/07/08, ten Tabs in a row | the Tab route as on the first walk: the order on week and board, reordered and folded sections, standby rows, no write on a pass through a signed published day (214 board / 206 week boxes — bar and signed line identical), short screens; ten Tabs after one changed take-off: every Tab in the next box, no box under the caret replaced, the caret box moved 0 px, ONE saved change. The phone ⋯ menus, the Insights cross, tall and short windows, all thirteen surrounds PASS. **Three older behaviours again, none the stack's** (judged on the first walk, §5.2): typing in a request's PROGRAMME ROW changes the row, not the request (`[REQ-ROW-OWN-BOXES]` — filed low; nothing in the stack touched that code); Escape in a board TIME box (`[BOARD-TIME-ESCAPE]`); after Enter the caret is dropped (Enter's existing meaning, D544). | `parts/stk2-P.md` |
| Q | R-01, P3-01/02/04/05/07/08/16/18, H-02, H-03, H-07, X-01/03/04/05/09, the two-formation question | **20 of 20 PASS.** A week nobody touched stores no week row before or after a reload, and an answer on it survives a reload and a week switch while its day stays unsaved (R-01); an answer on a published day counts at once with the programme and the signature book byte-identical (P3-01, X-03, X-05); plans and day templates carry their own answers, Undo takes template and answer back together (P3-04, P3-05); the question's ten endings (P3-08); a member never meets a question or a button and sees the admin's bars (H-03); the two-formation steps: one question, one button, the answer on the right formation — week, board and phone. | `parts/stk2-Q.md` |

**Opened by the host (Trial 1's condition 1).** The host REPRODUCED the two published-day results itself rather than
rest on a walker's picture (`scripts/handpass/stk-host-pub.mjs`, 4 pictures opened): 136 Tabs through a signed,
published Tuesday leave the day as stored byte-identical, its signed line standing, nothing pending; one typed word
and ONE Tab show "1 pending", "Not yet signed", the four boxes to sign and "Publish AL1" with the caret still in a text
box; Undo puts the day back. Of the walkers' own pictures the host opened five (the answer's "Change mission role"
after a reload; the published AL1 after an answer; the Leave War cells unchanged after the Tab pass; two of N's).
The FAILs' pictures were not re-opened: each is a behaviour already established on the first walk.

### 5.6 What the fix round's two reads found, and the second fix round (6 Oct 26)
Astra and Sol 6.1 each read the five fix commits, apart (§10.2). Five real gaps, all fixed in `a8355d98`, each with a
test that failed first:

| # | Found by | The gap | The fix |
|---|---|---|---|
| RF1 | both | W4 half-fixed: an unfinished flying line still lent its wave's reporting clock to the day (08:00 from it, 14:00 from a ground row: "six hours" for one hour of work) | `workSpan` counts an event only when both its ends are real (`engine/insights.test.ts` "RF1") |
| RF2 | both | W12 half-fixed: the question sheet took the keyboard once and let it go — Shift+Tab walked back into the editor underneath; and the board's cancel-reason and Sort all dialogs were not counted as windows | the sheets KEEP the keyboard (Tab and Shift+Tab go round inside the topmost one); the two board dialogs count, and take the keyboard (`ui/sheetfocus.ts`, `ui/pops.ts`; `ui/outside.test.tsx` "RF2", `ui/schedule-tab.test.tsx` "RF2") |
| RF3 | Astra | W11 broke one path: a formation whose stored Mission holds a doubled space could not be answered Blue/Red (the answer path took the unchanged words for a failed save) | the answer path folds the stored words as the writer does (`ui/mission-role-interim-fixes.test.tsx` "RF3") |
| RF4 | Astra | W9 half-fixed: the button vanished on moving between the Remarks of two aircraft of one formation | the button is rebuilt on the box he is in ("RF4") |
| RF5 | both | W19 half-fixed: a clock the app cannot read was told so only once a take-off existed (walker M met the same on L-04) | the advisory no longer waits for a take-off; order checks still do (`engine/rally-workspan.test.ts` "RF5") |

**Walked (6 Oct 26): walker S, six scenarios written for these fixes — 6 of 6 PASS** (`parts/stk2-S.md`, 48 pictures,
14 opened by it): sixteen Tab and Shift+Tab presses all stay inside the OIL question, `XYZ` changes nothing behind it,
Escape closes it; twelve presses each stay inside Sort all and the cancel-reason dialog, and Tab works on the schedule
again after each is closed (RF2); a pilot with one ground hour keeps exactly that with an untimed line under an 08:00
in-time, and reads 08:00–14:00 once the line has times — no "NaN" (RF1); `8h00 IN TIME` is told so with no take-off,
and still when the wave is left with no line, once (RF5, RF5b); the button follows him to the second aircraft's
Remarks, week and board (RF4); a Mission stored `ACM /  DS` is answered Red with the words untouched and one new line
in the history (RF3). *One thing the host did wrong: it rebuilt the served build once while S was walking (for the
readers' second-pass fixes — the order says never). Nothing S walked was changed by that rebuild, and S reported no
FAIL to re-run; said here so the evidence is read with it.*

Neither reviewer found a fault in W8 (the repeatable ids — two tabs, templates, saved plans, Undo across a week
switch, a partly saved week), in W15's partial redraw (no block left owed for good, no box moved under the caret), or
in W2, W3, W5, W6, W7, W10, W13, W18.

## 6. The break tests (6 Oct 26)
`scripts/handpass/stk-breaks.py` cuts ONE wire at a time, runs the test file that should notice, and puts the file
back from git; results `parts/stk-breaks.json`. **27 wires cut, 27 times a named test went red** (the first run left
six green — five because the host had pointed at the wrong test file, one because no test told a caret that briefly
touched the next box from one that never did; that test was strengthened, and all six were re-run red).

| Wire | The surface | The test that went red |
|---|---|---|
| B1 | a crew's report time reads the In-time / Rally lines | `rally-workspan.test` "D497 rally alone can report…" |
| B2 | a timing pair out of order reaches the day's warning list | `schedule-tab.test` "W15 … week", "… Board" |
| B3 | the "+ In-time / Rally" button fills the Logic words | `rally-feedback.test` "review D2 mints the configured literal text…" |
| B4, B5 | the wave header on the week (previous day) and on the board | `rally-feedback.test` "review E both headers…"; `schedule-tab.test` "W16" |
| C1 | Insights splits a bar by Blue / Red | `insights-mission-mix.test` "MIX4 MIX14 MIX15…" |
| C2 | the question after his own edit, week and board | `mission-role-offer.test` "MIX6 R1…" ×2 |
| C3 | the published board's read-only Remarks door | `mission-role-interim-fixes.test` "F1 …" |
| C4 | a saved answer comes back at boot | `mission-role-persist.test` "MIX12 two independently answered contexts…" |
| C5 | only an admin may answer | `perms.test` / `mission-roles.test` "a guest, a pending person and an account switched off…" |
| C6 | the Logic switch | `mission-role-offer.test` "MIX1 the actual Logic edit switch…" |
| C7 | the board's own way into Insights | `mission-role-offer.test` "MIX16 both real Board entry callbacks…" |
| C8 | an answer's line in the change history | `mission-roles.test` "D525/D530 answer/correction history…" |
| D1 | the stylesheet parts, all loaded, in order | `scheduler-css-order.test` "imports every physical part exactly once…" |
| D2 | Tab on the schedule takes the route | `schedule-tab.test` "Board repeats all flight fields…" |
| D3 | the phone ⋯ menu's Insights item | `schedule-insights-menu.test` "editsched: More after Highlight…" |
| E1, E2 | the failed-save band on the board and on the Inputs calendar | the BROWSER test, `e2e/save-note.spec.ts` "the full-screen board, the Inputs calendar and the Medical view each show it…" (no unit test mounts those two — the browser test is their only guard) |
| F1–F8 | the fix round's own: W11, W15 week, W15 board, W8, W12, W10, W7, W2 | each fix's own test, by name (§5.3) |
| A1 | "Discard marks" removed | NOT RUN — a removed control has no wire to cut; its absence is walked (P1-06) and pinned by the source scan in reader AB's negatives |

## 7. Errors seen
None. Across the first walk (eight walkers), the re-walk (four) and the host's own runs, no console error, page error
or 4xx was recorded — the forced "quota exceeded" of the failed-save steps excepted, which is the fixture.
## 8. What was NOT walked, and why
- **A real iPhone, throughout.** Every phone step ran in the test browser at phone size with touch. Lines only his
  device can prove are on the look card (§12): the keyboard's own next-field arrows on the schedule; the board's
  Desktop layout panned by finger; Safari's bars against the Insights window's top strip; the wing's label at his size.
- **The guest on a phone** (P3-17 was walked on a desktop only) and **the suspended-account screen** — no change in the
  stack reaches either; not walked.
- **The admin's member view on the Tab route** — the route asks the same permission as every edit; walked as admin
  and as a real member (who has no Edit Schedule), not as an admin switched to the member view.
- **Tab with a modifier key or while composing text** (an input-method keyboard) — declined by the route by reading;
  not walked.
- **R-03 as the host first wrote it** — a 4-hour duty moved by an hour re-prices nothing, so no window opens: the
  host's premise was wrong. Walked instead on a duty whose change does open the OIL question (three ways, PASS), and
  again by walker S for the keys staying inside it.
- **The peek of next week showing the working copy of a published day** (P2-17) — the open question already filed
  for him (`[PEEK-ISSUED]`); not the stack's.
## 9. The gates — to come
## 10. The reads, and each owed read paid — IN PROGRESS

### 10.1 The one side-by-side (D590 (5)) — Astra, Sol 6.1 and Fable 5.1 on the Insights fixes of 3 Oct
One brief, word for word (`../superpowers/briefs/2026-10-06-insights-fixes-side-by-side-brief.md`); each read apart, in
a checkout frozen at `9e8ed334` — the tree as it stood straight after the three commits, so none could see what this
check found later. Reports as returned: `…-insights-fixes-read-astra.md`, `-sol.md`, `-fable.md`. Three real faults of
those commits were already known from this check's walk (W7, W9, W10) — the reviewers were not told.

| What there was to find | Astra | Sol 6.1 | Fable 5.1 |
|---|---|---|---|
| W10 — four confirmation windows still close on a drag-out (the fix's roll-call missed them) | MISSED — wrote "I checked all thirteen changed callers" as sound | FOUND, all four, with the fix | FOUND, all four, with the fix |
| W9 — no Choose / Change button for another formation while a question is open | IN PART — named the line that blocks it, inside another finding | not found | FOUND, with the two-slot fix this check built |
| W7 — an answer filed under "Leave War · (a hidden code)" in the changes window | not found | FOUND, with the fix | MISSED — judged that fix sound |
| NEW — typing a cue on a second formation REPLACES the first formation's open question (D535 lists no such ending) | FOUND | FOUND | noted in one sentence, not raised |
| NEW — on Edit Schedule's week, moving to another day does not end the question (D535 says it does; the board does) | FOUND | FOUND | not found |
| Sort all ends an open question | — | — | raised as low, "a judgement call" — D535's full row says a structural move does end it: as ruled |
| False alarms | none | none | none |
| Said plainly what it did not check | yes | yes | yes |
| Cost | his ChatGPT account | his ChatGPT account | 216,000 tokens, 8½ minutes; **his week 7% → 8%, his Fable week 0% → 1%** (5-hour window 8% → 10%), read with nothing else of Claude's running |

**What it shows, for his ruling on whether Sol keeps the second seat:** on this one sample Sol found the most (four
real things), Astra and Sol TOGETHER found everything Fable found except a clean statement of W9 — and found two things
Fable did not; Fable alone would have missed W7 and both new ones. No one reviewer found everything: the three known
faults were each missed by at least one of them. The pair from one maker did not miss the same things here. One sample
of three small commits is thin evidence — the recommendation is in §12.

**The two new finds** are real gaps against D535's own words; both are choices about what he wants to see, so they are
parked, not guessed: §12, questions 2 and 3.

### 10.2 The fix round's own reads (D590: Astra, and Sol 6.1 second — it touches the published record and saved data)
Astra and Sol 6.1, apart, on the five fix commits (brief `…/2026-10-06-codex-stack-fix-read-brief.md`; reports
`…-codex-stack-fix-read-astra.md`, `-sol.md`). Both: REVISE. Four gaps found by both and one more each by Astra — RF1
to RF5, all real, all fixed (§5.6). Neither found a fault in the repeatable row ids, the caret-safe redraw, or the
other ten fixes. **Second round** on the one commit of those fixes (brief `…-fix-read-r2-brief.md`; reports
`…-fix-read-r2-astra.md`, `-sol.md`): both found RF1–RF4 fixed and pinned by tests that fail without them, and BOTH
the same leftover — a wave with no line at all went quiet about an unreadable clock (RF5b, fixed, `eb8fd4d6`). Two
rounds, as capped. What they said is unpinned by a test and left so: the cancel-reason dialog's own keyboard ring, two
sheets one over another, a sheet with no enabled control (walker S walks the first; the others cannot arise from the
app's own controls today).
### 10.3 The four Opus readers' second pass on Codex's code, with the walk in hand (6 Oct 26)
Four fresh Opus 5.5 readers, one per piece, each with its first pass, this sheet and the roll-call marks; asked for
ABSENCES (every unwalked roll-call row read), SIBLINGS (another instance of each kind of fault found) and how the fixes
sit in the piece. Reports: `parts/stack-read2-AB.md`, `-C.md`, `-D1.md`, `-D2.md`. Every one of the 45 unwalked
roll-call rows has a line there: "sound, because …", or a finding. Findings, by reading (each needed its red test):

| From | The finding | Disposition |
|---|---|---|
| D1 | the failed-save band above the phone width — the board's Desktop layout with the phone turned on its side: an empty amber strip, no words, no Retry | FIXED `4e8695bf` (browser test at 844 and 1024 wide, three pans) |
| D2 | the caret-safe redraw wrote nothing when a day gained its FIRST warning or lost its last | FIXED `4e8695bf` (`dayswap.test`) |
| D2 | a take-off saved by Tab, then a CLICK into Area time: the old window stored as typed | FIXED `4e8695bf` (every arrival in a box refreshes it; `schedule-tab.test` "P2-F2") |
| D2 | an open Blue/Red question vanished at the catch-up paint after the caret left text | FIXED `4e8695bf` (`mission-role-interim-fixes.test` "P2-F3") |
| AB | the red explanation under a wave's lines stale after a take-off or brief committed by Tab | FIXED `4e8695bf` (text refresh beside W16's; no test of its own — filed with `[WINDOWS-KEEP-KEYS]`) |
| AB | **a man put on a flying line with no take-off loses his crew-rest check — OLD, the same on `main`** | FILED, MEDIUM: `[REST-BLANK-LINE]` — an engine change with its own walk; proposed first after the stack |
| AB | "To go out" words an edited line "2 lines → 2 lines" (old); a reporting-line change is no button on the board (old) | FILED low: `[PEND-INTIME-WORDS]`, `[BOARD-INTIME-JUMP]` |
| C | a line with no callsign named by a hidden code in the question and Undo; the button not put back after an answer; "not chosen" has no way back | FILED low: `[ROLE-BLANK-CALLSIGN]`, `[ROLE-BUTTON-AFTER-ANSWER]`, `[ROLE-NOT-CHOSEN]` (a question for him) |
| D2 | the larger windows let Tab walk into the page behind (old) | FILED low: `[WINDOWS-KEEP-KEYS]` |

One correction to this sheet from that pass: "the puck rings inside the caret's section catch up when the caret leaves
that section" (§5.3, W15) is not exact — they catch up at the next saved change after it leaves, or when the caret
leaves the text boxes altogether.
### 10.4 Each read the Codex blocks listed as owed to Claude — paid by this check (D589)
| Owed (the `HANDOFF.md` blocks' own words) | Paid by |
|---|---|
| `codex/discard-marks-remove` — Claude's FULL check | reader AB (pass 1 and 2), walkers A and M, break tests |
| `codex/rally-workspan` — a FULL independent walk, plan / code / scenario reads | reader AB, walkers A, B, M; Astra's scenarios; Trial 1 ran on its pre-fix build |
| `codex/insights-mission-mix` — the code and scenario coverage; and the read of OPUS's three fixes by reviewers who are not Opus | reader C, walkers C and Q; the fixes: Astra, Sol 6.1 and Fable 5.1 (§10.1) |
| `codex/workflow-ui` — plan / code / scenarios and a full independent desktop and phone walk (the split, the board repair, the Tab route, the phone menu, the wing and the two bars) | readers D1 and D2, walkers D, E, P (47 screens at two sizes) |
| `codex/save-note-controls` — the last round, never independently read | Astra (`…-owed-small-reads-astra.md` Part 3: the app sound; two test soft spots filed `[SAVE-NOTE-TEST-GAPS]`); reader D1; walkers F and N |
| the working-guide changes Codex made before the reset (D70) — `AGENTS.md`'s D496 part, `raptor-port/docs/codex-review-workflow.md`, the D496 banners on `raptor-port/CLAUDE.md`, `bug-check-order.md` and `guide-full.md`, the D499 addendum | read by the host (Opus), 6 Oct 26: they say what D494, D496 and D499 say, keep the independence rule and "Claude's read before main", and extend nothing past the reset. One tidy-up, not a fault: the three banners describe an arrangement that ended on 5 Oct 26 at 19:00 — to go at the next documents pass |
| the short lines of D591–D594 against their full rows (D138) | Astra — three corrected (§12, the guide wording) |
| the guide wording written for D588–D590, and D596 (D70) | Astra and Sol 6.1, one round each; corrections applied; **waits for his approval** |

## 11. Trial 1 (the walkers) and Trial 2 (the builder)

### Trial 1 — DONE, decided (D588 (3), D480, D595): walking the app stays with Sonnet 5.5
The whole record is `parts/stk-trial-1.md`. In short: one Opus and one Sonnet walker, the same brief and the same Rally
scenarios, on the Rally build as it stood before its review fixes (`786d2b2c`), neither told what was wrong. Five known
faults were in it. The Opus walker caught all five; the Sonnet walker caught four fully and the fifth in part (it did
not raise the missing "previous day" wording as a finding, but it alone caught the negative rest figure). Both found the
same fault off the list ("NaN min"), the Sonnet walker with the sharper control. No false alarm from either. The Sonnet
walker took 31 minutes and about 446,000 tokens for eleven scenarios; the Opus walker 54 minutes and about 627,000 for
twelve — about 70% of the tokens at a lower price each, roughly half the cost. Its weaknesses: it opened about a third of
its pictures (38 of 117; the Opus walker 136 of 136), and it marked two scenarios "recorded" where a verdict was due.
**The decision (the agent's, D595; told to him the same night — "ok so sonnet is good for this"):** every walk goes to
Sonnet walkers, with no Opus walker beside them, on three conditions now written into the walk brief and used on this
re-walk: the host opens the pictures behind every FAIL and every high-consequence PASS; a scenario with an expected
result is judged PASS or FAIL; a walker's conclusion is a finding only once the host has reproduced it. Unchanged
(D588 (5)): Sonnet never reads code for bugs, never decides a finding, never writes a plan, a roll-call or a scenario
list.

### Trial 2 — the builder — to come (after the check: one small low-risk fix, `[OG-TAG-OVER-COUNT]`, built by a Sonnet helper to a precise spec, read by Opus)

## 12. His look — four questions first, then the "look here" card

### Questions waiting for him (D596 — nothing below was guessed; only these pieces are left as built)

1. **Tab after the last text box of a day (W14).** On Edit Schedule's week, when the day has no button below its last
   text box, Tab leaves the caret on nothing. You ruled "Tab goes on to the next normal button, without looping or
   changing day" (D553) — here the next button belongs to the NEXT day. Which do you want?
   **(A, recommended) the caret stays in that last box** — nothing vanishes, nothing jumps; Shift+Tab goes back.
   (B) Tab goes on to the next day's first button (the week pans to that day). (C) leave it as built.
   The same dead stop is on the PHONE's Scheduler Board (no button follows its last box); the desktop board goes on
   to the first ✕ of the warning list.
   *Parked on it: W14 (a) only. Everything else about the Tab route is fixed and re-walked.*
2. **A second formation asks while the first one's Blue/Red question is still open.** You type "DS FOR RU" on VL and
   leave its question unanswered, then type a DS / RED remark on another formation. Today the new question REPLACES
   VL's (VL's goes without an answer; its "Choose mission role" button still works when you select its Remarks). You
   ruled a question stays until answered, Later, or its own wording changes (D535), and "not many questions at once"
   (D523). Which do you want?
   **(A, recommended) show both, each under its own formation** — they only ever arise one at a time, from your own
   typing. (B) keep the first, show nothing for the second until you select its Remarks. (C) leave it as built — the
   newest replaces the older.
   *Parked on it: this one behaviour — found by Astra and Sol (§10.1). The button for another formation (W9) is fixed.*
3. **On Edit Schedule's week, does going to another day end an open Blue/Red question?** On the Scheduler Board it
   does (D535). On the week several days are on screen at once on a desktop, and on a phone you swipe between them;
   today the question waits on its day until you answer it or press Later, and nothing else is blocked by it.
   **(A, recommended) leave it — it waits where you left it.** (B) end it when you swipe or step to another day.
   *Parked on it: nothing else.*
4. **The second press of "+ In-time / Rally" on a wave that already has a line.** You ruled the button "fills in the
   wave's earliest take-off less the Logic time" (D510). When the wave already has a line, the button today COPIES that
   line's clock instead (a wave reporting 08:00 gets a second 08:00 line, not 10:00 for a 12:00 take-off at 2 hours) —
   built that way on the 3 Oct review's instruction, so a second line starts where the first is.
   **(A, recommended) leave it** — a second line is nearly always for the same report time with other words (a Rally
   after the in-time), and the clock is one edit away. (B) always take-off less the Logic time, whatever is there.
   *Parked on it: nothing — recorded by both walks (P2-08).*

### The look card — five minutes on your phone and a desktop, on the preview
1. **Edit Schedule, any day: type a time and press Tab, and keep pressing Tab.** The caret should run callsign,
   mission, brief, take-off, landing, remarks; the day's warning list and its count should change as you go, without
   you leaving the boxes. On a published day one typed word and one Tab should show "1 pending" and "Not yet signed"
   at once.
2. **A wave's "+ In-time / Rally"** should fill take-off less three hours with "IN TIME + WX/NOTAMS"; a line typed
   later than its take-off should read "(prev day)" in the wave's header. Type `8h00 IN TIME`: the day should say it
   cannot read that clock.
3. **Logic → "Track Blue/Red sorties" On**, then type `DS FOR RU` in a formation's Remarks: the Blue / Red question
   should open under that formation and stay there while you edit other things; Insights should split that crew's
   bars as soon as you answer — on a published day too, with no amendment.
4. **On your iPhone only** (the test browser cannot prove these): the Scheduler Board's ⋯ → Desktop layout, panned by
   finger, and its ⋯ menu near the right edge; the keyboard's own next-field arrows on the schedule; the Insights
   window's top against Safari's bars; the Tracker's flight symbol and its label at your size.
5. **Nothing should look different anywhere else** — the stylesheet was only split into parts. If a screen looks
   off, that is a finding.
Known and filed, so you need not report them: a published weekend's OIL moving when a Logic time is changed
(`[OIL-WORK-START]`, D591 — the next job); Escape in a time box on the board; the green OIL chip over a phone request
card's date.

