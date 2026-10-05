# The Codex stack — Claude's ONE check (D589) — the evidence sheet — started 5 Oct 26

Branch `claude/codex-stack-review`, cut from `codex/save-note-controls`; the app code checked is commit `bcc69fc8`
against `main` at `de470db5`. Five pieces, built 2–5 Oct 26 while Claude waited (D494, D496): **Discard marks removed**
(D488) · **In-time / Rally and work hours** (D497–D511) · **Insights' mission mix** (D512–D538) · **the workflow UI pass**
(D540–D566: the stylesheet split, the phone board repair, the Tab route, the phone Insights menu, the tapered wing with
the Logic search and the Insights cross) · **the failed-save warning's band** (D586, D587). The Inputs/SANS calendar
(`codex/inputs-sans-calendar`) is on hold and outside this check.

**STATE OF THIS SHEET: IN PROGRESS.** It is written as the check goes (order §9). A section that says "to come" has not
been done; nothing here is a result until its section is filled.

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

## 3. The rulings walked — to come (the rules sweep: one mark per surface for what is shown, one per order for earned leave)

## 4. The roll-call and the door check — to come
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
| B | P2-09…18, H-01, H-05…H-08 | 4222 | `parts/stk-B.md` | out |
| C | P3-01…18, H-02, H-03 | 4221 | `parts/stk-C.md` | BACK — 301 pictures (about 119 behind the final table), about 25 opened by the walker; the host opened 2. 19 PASS, 1 FAIL (P3-04 — W7 again, the changes-window heading), 1 PARTIAL (P3-17: the guest on a phone not walked). PASS on the high-consequence lines: an answer on a published day counts at once with the pending count, the sign-offs and the day's stored record byte-identical (P3-01, seen by the host: the issued Original with its Remarks, and the split bars); an older version offers no way to answer (P3-02); saved plans and day templates carry their own answers and Undo leaves no orphan (P3-04, P3-05); the question stays through an unrelated edit and goes on each of ten context changes (P3-07, P3-08); another person's answer is not undone (P3-18); no mark on any schedule line (H-02); a member never meets a question or a button and sees the admin's bars (H-03); the same twelve rows and Show all from all six doors (P3-16) |
| D | P4c-01…16, P4d-01…06, H-04 | 4222 | `parts/stk-D.md` | BACK — 111 pictures, 31 opened by the walker. The Tab route: 13 of 16 PASS (the order on week and board, reordered sections, folded sections, standby rows, no loop, no write on an unchanged pass through a signed published day, short screens, other apps' own Tab); the phone ⋯ menu 5 of 6 PASS; H-04 PASS — a Tab pass through a published Saturday left "0 pending", the four sign-offs and every Leave War cell as they were |
| E | P4a, P4b, P4e, and one picture of every screen at two sizes | 4221 | `parts/stk-E.md` | out |
| F | P5-01…08, X-01…12 | 4222 | `parts/stk-F.md` | out |
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
| W15 | While he is still tabbing, the day does not redraw: the issue count, the warning list, the puck rings and "N pending" stay as they were until Escape or a click; then they update. | L-13; reader D2 lead 4 | recorded by the walker | new in degree (on `main` Tab reached a puck after two or three boxes, so the day redrew often) | a LOOK for him, not a wrong save — on the look card; no fix proposed here |
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
  boxes restore. D544 says "keep the existing Enter and Escape meanings" — they are kept. Old behaviour: to FILE low
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

*(W17 is listed here, out of the table above, because it arrived after it; the fix round renumbers nothing.)*

**Still out:** walkers B, E, F.

## 6. The break tests — to come
## 7. Errors seen — to come
## 8. What was NOT walked, and why — to come
## 9. The gates — to come
## 10. The reads, and each owed read paid — to come
## 11. Trial 1 (the walkers) and Trial 2 (the builder) — to come
## 12. His look — the "look here" card — to come
