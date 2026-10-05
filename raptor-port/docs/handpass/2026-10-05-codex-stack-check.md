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
| A | P1-01…06, P2-01…08 | 4221 | `parts/stk-A.md` | out |
| B | P2-09…18, H-01, H-05…H-08 | 4222 | `parts/stk-B.md` | out |
| C | P3-01…18, H-02, H-03 | 4221 | `parts/stk-C.md` | out |
| D | P4c-01…16, P4d-01…06, H-04 | 4222 | `parts/stk-D.md` | out |
| E | P4a, P4b, P4e, and one picture of every screen at two sizes | 4221 | `parts/stk-E.md` | out |
| F | P5-01…08, X-01…12 | 4222 | `parts/stk-F.md` | out |
| G | L-01…L-08 | 4221 | `parts/stk-G.md` | BACK — 142 pictures, 15 opened by the walker; the host opened 8 (those behind the findings) |
| K | L-09…L-16 | 4222 | `parts/stk-K.md` | out |

### 5.2 What the walk has found so far, and each disposition
"Seen" = the host opened the walker's picture and it shows the fault. "To reproduce" = taken from the walker's figures,
not yet seen by the host — it is reproduced by the red test written before its fix. Provenance is against `main`
(`de470db5`). Dispositions are the host's proposals until the fix round; none is fixed yet.

| # | The finding (what a person sees) | From | Seen? | `main`? | Proposed disposition |
|---|---|---|---|---|---|
| W1 | A PUBLISHED weekend's earned leave moves at once when a Logic value is changed — "Nominal report before T/O", "Flight debrief after land" or the full-day threshold: Ranger's Saturday goes from +1 (07:00–13:15) to +0.5 (07:30–13:15) with "No pending changes", ORIG and the four sign-offs standing; it flips back when the value is put back. Against D48, D142. | L-01 (walker G); Astra M1; reader AB lead 1 — three finders | SEEN (the tracker before and after; the day's bar) | the same on `main` (the earned-leave code is untouched); the stack makes it likelier — the same box now sets the button's time (D510) | NOT this stack's fault; high consequence. To be put to him and FILED as its own job (it changes what a published day stores) — never fixed under cover of this check |
| W2 | Typing new words for the "+ In-time / Rally" button on Logic lights "RULES MODIFIED" on both week banners for everyone, and Logic says "1 rule changed … the schedule is being checked against these values" — no rule changed. | L-02; reader AB lead 2 | SEEN (the Logic strip) | new in the stack (`94aa8913`) | fix here, red test first |
| W3 | `08:30H: VL RALLY AFTER IN TIME` beside a whole-wave `08:00H: IN TIME …`: VL's crew start 08:30, RU's 08:00 (VL's work hours 30 minutes shorter), in either order. Against D505. | L-03; reader AB lead 3 | to reproduce (figures read off the window) | `main` gave VL 08:30 too, by another route; the stack promised D505 | fix here, red test first |
| W4 | A person on a flying line with no times reads "NaN min" in Insights' Work hours. | L-04 (the walker's side find) | to reproduce | not yet compared | reproduce, compare with `main`, then fix or file |
| W5 | A wave with a reporting line and no take-off yet: its header reads "In-time / Rally —" and it has no band in Available crew; with no take-off the button fills only the words, and `0800` typed at the front joins them as `0800IN TIME + WX/NOTAMS`. | L-04; reader AB lead 4 | to reproduce | new against `main` (reader) | reproduce, then fix here |
| W6 | The lines are still called "in-times" in the changes window ("In-times", "2 in-times → 1 in-time"), the gold-dot bubble ("· IN-TIMES") and the ✕ toast ("In-time line removed") — beside "In-time / Rally" on the box, the button and Undo. D504. | L-05; reader AB lead 5 | recorded by the walker | new (the rename) | fix here: one shared name, a test that draws each place |
| W7 | Every Blue/Red answer is listed in the changes window under "Leave War · rmuv8bvw885wj10" — a hidden code, under another page's name — in both groupings; the same for an answer a day template copies; and after Undo of the template its lines are still listed. D530, D340. | L-06; reader C lead 1 | SEEN (the changes window) | new in the stack (`4cfe81a1`) | fix here, red test first |
| W8 | On a demo day nobody has edited, a Blue/Red answer is gone after a reload, a sign-in, or a visit to the next week and back (bars back to one, the button back to "Choose"); it holds once the day has been saved once. Only the two built-in demo weeks can do it. D530. | L-07; reader C lead 2 | to reproduce | old id behaviour on `main`, harmless there; this feature made it matter | fix here (repeatable ids for the built-in weeks) — he would meet it on his look |
| W9 | While one formation's Blue/Red question is open, no "Choose / Change mission role" button appears for any other formation — week, board and phone. D527, D529. | L-08; reader C lead 3 | SEEN (the week: VL's question open, RU's RED AIR box in use, no button) | new in the stack (reachable since the D535 fix) | fix here, red test first |

**Still to come from walkers and readers, unproven:** the Tab route's leads (L-10 to L-15), the four confirmation
windows (L-09), Retry off-screen on the phone board's Desktop layout (L-16), and a walker's remark that Logic values
did not survive a reload on this build (H-07 tests it).

## 6. The break tests — to come
## 7. Errors seen — to come
## 8. What was NOT walked, and why — to come
## 9. The gates — to come
## 10. The reads, and each owed read paid — to come
## 11. Trial 1 (the walkers) and Trial 2 (the builder) — to come
## 12. His look — the "look here" card — to come
