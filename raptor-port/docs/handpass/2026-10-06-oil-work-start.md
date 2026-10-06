# `[OIL-WORK-START]` (D591, D592) — evidence sheet (6 Oct 26)

**Authority: D591, D592** (owner, 5 Oct 26 — "it should take the actual intime/rally time right? not the nominal report
timing"; "yes that's what i meant, all 4 as recommended … count work hours as first till last end"). His instruction
for this chat: build `[OIL-WORK-START]` with its own full check; merge nothing. Branch
`claude/oil-work-start-build-35a0e3`, cut from `main` at the merge of PR #483 (d584a2a8). Nothing merged; `main`
untouched.

**Status: SEE §Status at the foot** (written last).

## Questions waiting for him

None that blocks. **Readings the agent made in the build, for him to overrule if he wants them otherwise** (recorded in
D592's full row as readings (6)–(10); each is tested as built and can be changed in a line or two):

1. **A time entered LATER than the nominal one shortens the day.** Take-off 12:00, in-time typed 10:00 → his OIL day
   starts 10:00, not 09:00 — so a late in-time can cost a full day. Recommended: keep — it is D591's own words ("the
   actual intime/rally time … not the nominal") and what the work-hours bar does. What waits on it: nothing.
2. **After a Logic change, a published weekend reads "1 pending" when anyone's OIL amount OR his worked times would
   change** — and reads nothing when the change would leave every OIL record on that day exactly as it is. Recommended:
   keep. The agent first built "only when an amount changes"; Astra and Sol 6.1, each reading the plan blind to the
   other, both read his words ("a Logic value changed afterwards reads as a pending change") as covering the worked
   times too, because the Leave War checks them against leave on the same day. The price: changing "Flight debrief
   after land" makes every published weekend with a flying line read pending until it is signed and published again,
   or the value is put back. If he would rather it read pending only when an amount changes, it is a one-line change.
3. **The four sign-offs fall when a Logic change made after they signed would alter that day's OIL** — on a day not yet
   published, or with an amendment waiting — and stand again when the value is put back. Recommended: keep; without it
   a day signed as a full day could go out as a half day. (Both plan challenges asked for it.)
4. **An SC shift's typed B (its in-time) does not move its OIL** — he said "a flying line". Recommended: leave it.
   **ANSWERED 7 Oct 26 — D606, the other way:** *"It rarely happens but SC B if filled u can count it as work hours
   as well and OIL earned."* Built on this branch after the first check closed; its own check is §D606 at the foot.

## The eight questions (bug-check order §5) → tier FULL

| # | Question | Answer |
|---|---|---|
| 1 | OIL / what a man is owed | **YES** — where a flying line's OIL day starts; which Logic values a published day's OIL is worked out from |
| 2 | The published record | **YES** — a published version keeps three more values; a new kind of pending change; what a sign-off is bound to |
| 3 | Saved data | **YES** — `rv` on a published day's OIL record, `orv` on a sign-off's binding (`docs/data-schema.md`) |
| 4 | A shared drawer | **YES** — one work walk and one amount body feed the credit, the tracker, the green edge, the OIL Earn figures and the ALL AVAIL window |
| 5 | A new gesture or mode | NO — no new control |
| 6 | A new surface | NO — one new line in the To go out list; new words on the Logic page |
| 7 | Roles | NO — the same result for everyone; the member's read-only face was walked |
| 8 | The warning list | NO — no warning is added, removed or reworded; a Logic change is told by the pending line (D45), not by a warning |

## The rulings that apply — each walked against the build

| Ruling | What it says here | Result |
|---|---|---|
| D591, D592 (1) | the earliest in-time or Rally that applies to the formation | `engine/oilworkstart.test.ts` OWS1; host H7; walker B |
| D592 (2) | the nominal time where none is typed | OWS2; host H1; walker B S26 |
| D592 (3); D503, D42 | an evening-before report lengthens the line's own day; the day before earns nothing | OWS3 (engine and at the Leave War cell); walker B S30, S31 |
| D592 (4); D48, D142, D2 | a published day keeps its OIL until published again; the latest published version pays | `leavewar/oilworkstart-published.test.ts` OWS6–OWS9; `e2e/oilworkstart.spec.ts`; host H2–H6; walkers A, C |
| D592 (5); the 29 Aug 26 envelope rule | first start to last end, gaps included | OWS4; walker C S01, S03 |
| D505, D506 | a formation's own line before a wave-wide one, each activity apart; the earliest of duplicates, any order | OWS1; walker B S28, S29 |
| D497–D504, D509, D510, D600 | the In-time / Rally box, its button, its spellings — unchanged | untouched (`reporting.ts` not edited); walker B S23–S27 |
| D49 | a nought-minute sortie still earns | OWS5; the zero-span boundary pinned and filed (`[OIL-ZERO-SPAN-SORTIE]`); walker B S34 |
| D24, D28, D31, D43 | which seats earn by default; the switch; no OIL from a guess | unchanged — OWS5; walker D S36–S38. The Logic page's wording corrected to D24 (it said standby lines "never" earn) |
| D44, D45 | nothing on a published day changes unacknowledged; who was behind a placeholder is frozen | the pending line is the acknowledgement; the crowd untouched — OWS7; walker C S03 |
| D98 | back to what was published shows nothing pending | OWS7 (value put back); host H5 the other way; walker A |
| D103 | anything pending takes the sign-offs down | OWS7, OWS11 |
| D99, D168 | the To go out list says what is waiting | `ui/oilworkstart.test.tsx`; host picture; walker A |
| D109, D113, D114, D178 | one act, one change; a request's edit folds its own OIL change | the Logic line is never folded — `ui/oilworkstart.test.tsx` (the combined case, each put back on its own); walker C S14 |
| D186 | a published day keeps the one rule value it prints, compared only where the day prints it | the same shape used here: the three values are kept always, compared only where a record would change |
| D482 | Insights' hours move at once on a Logic change | unchanged, and stays different from OIL — `rally-consumers.test.ts`; walker B H-03 |
| D19, D21 | a weekend no period covers; an Off day earns nothing | unchanged — walker D S39, S40 |
| D56 | harm only in stored demo data is not a finding | said in every brief; a version published before this build reads today's values and raises nothing (OWS10) |
| The robustness doctrine (21 Aug 26) | the five families | §The walk — the family column of Astra's scenarios |

**A clash flagged, and how it was settled (the rules sweep):** RT8 of the Rally work pinned "nominal OIL unaffected by
reporting-only edits" (`engine/rally-consumers.test.ts`). D591 is the later ruling and says the opposite; it narrows
D498. The test's OIL line was changed to follow D591, its other half (ordinary busy, the SANS window and the work span
keep their own definitions) kept, and the Rally register and design note now say so.

## The roll-call

**The THING: a man's OIL for a day — his amount and the worked times stored beside it.** Every place the app works it
out or draws it:

| Where | Shows it under the new rules? | Operable there? | What else is on the same pixels | Proof |
|---|---|---|---|---|
| Leave War grid — the FO / HO cell | **YES** — written by the credit pass from each date's own published record | read only (a tap opens the day's sheet) | a leave or bid on the same day sits beside it | published test (`cellOf`); host H1–H7; `e2e/oilworkstart.spec.ts` |
| Leave War — the day's sheet and the day's list ("worked 07:00–13:15") | **YES** — the stored record's own times | read only | — | published test (`worked`); walker C |
| OIL tracker — the credit's row and the balance | **YES** — and now EVERY worked period (it printed only the first: Astra's F1, fixed) | read only for a member | the row's reason and "N left" | `leavewar/ui/oiltracker.test.tsx`; host pictures; walker C S01 |
| Leave War clash strip (a credit against leave or a bid) | **YES** — it reads the stored record's times, which now hold still | as before | — | published test "the clash with an afternoon leave follows the PUBLISHED worked times, and moves only with the amendment" (added after Sol's read); not walked in a browser (see §Not walked) |
| The Inputs page — the note to the filer when leave is filed over work ALREADY published ("… is recorded as working 07:00–13:15 on 18 Jul — this … is filed anyway and flagged"), and the day going amber | **YES** — the door reads the stored record's times, so the stretch only the published times cover still counts | as before: filed, flagged, never refused | — | published test "a leave filed in the stretch only the PUBLISHED times cover is still flagged, and the note names those times", through the real Inputs door (the row Astra's read found missing); not walked in a browser |
| The board's and the week's green edge on a puck | **YES** — the face being shown: a published face its own kept values, the working copy today's | — | the warning ring and the C chip (unchanged) | `ui/oilworkstart.test.tsx` OWS6; host H3; walker D H-05 |
| OIL Earn mode — the FO / HO figures and the switches | **YES** for the figures; the switches unchanged | admin, working copy only (as before) | — | `ui/oilworkstart.test.tsx`; walker D S38, H-05 |
| ALL AVAIL window — "Who earns OIL" | **YES** — it reads the same figure body | as before | — | walker C S03 |
| The day's OIL advisories ("not published yet", "started earning after it was published", "no usable times") | **YES** for the full-day line (the one amount body); **MUST NOT** gain a Logic-change warning, because D45's pending line is how a change to a published day is told | — | — | unchanged tests; this sheet's question 8 |
| The publish-time toast (a bid now sits on published work; a desk with no times) | **YES, by construction** — it reads the published record through the same walk | — | — | unchanged; NOT separately walked |
| The Unpublish warning | **YES** for the values; its older fault — it assumes the whole credit goes when an amendment is withdrawn — is FILED (`[UNPUB-WARN-AL-RESTORES]`, Astra's F2) | — | — | walker C S02 (recorded) |
| "N pending" — the week's chip, the board's chip, the ⓘ panel, the Amendments box | **YES** — one count for the new line | the chip opens the list | the changes window's own "N changes" chip shares its class (a trap for the walk's helpers, named in the brief) | `ui/oilworkstart.test.tsx` (`counts`); host H2; walker A |
| The To go out list | **YES** — the new line, the value and each man | its sub-lines are not tappable, because the value lives on the Logic page | — | `ui/oilworkstart.test.tsx`; host picture; `e2e`; walker A |
| The change history (All changes) | **NO, because** a Logic change writes no history line today — older than this job, filed as `[HIST-PER-PAGE]`; the pending line's who / when are blank for the same reason | — | — | walker A (recorded) |
| The four sign-off selects | **YES** — they fall and return with the value | as before | — | published test OWS7, OWS11; `e2e`; walker A |
| The Logic page's words | **YES** — the nominal-report row, the OIL row, the AVALON row | Edit rules, as before | — | `ui/logic` tests; walker A H-02 |
| Insights — Work hours | **MUST NOT**, because D482 keeps Insights moving at once and its day starts at step where no line is typed | — | — | `rally-consumers.test.ts`; walker B H-03 (recorded) |
| CSV / print | **NO, because** neither carries an OIL column | — | — | unchanged |
| A week that is off screen | **YES** — the credit pass reads its saved published record | — | — | published test (off-screen week); walker C S05 |
| A saved plan; an older version loaded onto the working copy | **YES, by construction** — a working copy never carries a published record's values (`drafts.ts liveDay` strips the whole block) | as before | — | walker D S19, S20 |
| View-only Sched for a member and a guest | **YES** — the same readers | read only | — | walker C H-04 |

**The second THING: where "when does this crew report" is read.** Earned leave was the last reader doing its own
arithmetic; it now asks the one shared reader. The table of every reader is in
`docs/handpass/parts/stack-read-AB.md` §1 ("Every reader of 'when does this crew report'") — its last own-arithmetic
row is closed by this job; ordinary busy windows and the tight-turn advisory keep theirs by ruling.

## The door check

| Action | State | The control | Result |
|---|---|---|---|
| Type, change or remove an In-time / Rally line | a day not published / published | "+ In-time / Rally" (week and board), the line's box, its ✕ — unchanged | the working copy's OIL follows at once; a published day reads pending as ever and its OIL waits for the amendment (OWS9) |
| Change one of the three Logic values | any | Logic → Edit rules → the box; Reset to standard; Undo — unchanged | published days hold; the pending line appears where a record would change |
| See WHY a published day reads pending after a Logic change | published | the day's "N pending" chip → To go out | the line names the value and each man |
| Clear that pending | published | put the value back on Logic — or sign and Publish AL | both walked (host H4, H5; `e2e`) |
| Apply today's values to a published day whose records would NOT change | published | none — and none is needed: nothing a reader could see would differ | by design (OWS7) |
| Sign again after the sign-offs fell | any | the four selects | unchanged |

No state was found where the data allows an action with no control.

## The fault on screen — before and after (the host's own walk)

`scripts/handpass/ows-host.mjs`, written as assertions of the RIGHT behaviour, run on the build as it stood on `main`
(d584a2a8, port 4291) and on the fixed build (port 4292). Results: `docs/handpass/parts/ows-host-before.json`,
`…-after.json`; pictures `docs/img/handpass/2026-10-06-oil-work-start/host-before/`, `host-after/`.

| Step | Before (`main`) | After |
|---|---|---|
| H1 Ranger on a Saturday line 10:00–11:15, published | full day, worked 07:00–13:15 | the same |
| H2 "Nominal report before T/O" 3h → 2h30 | **the cell became HO at once; the tracker read "+0.5 … 07:30–13:15"; nothing in To go out** | the cell FO, the tracker "+1 … 07:00–13:15"; 1 pending; the four sign-offs empty; the list: "OIL on this day · Logic values changed since it was published / Logic · Nominal report before T/O 3h → 2h30 / Ranger · OIL full day · 07:00–13:15 → half day · 07:30–13:15" |
| H3 View-only Sched's published face | **the half-day edge** | the full-day edge |
| H4 the amendment | no amendment could be published (nothing was waiting) | AL1; now HO, worked 07:30–13:15; nothing pending |
| H5 the value put back | **the cell flipped back to FO by itself** | the amendment keeps its HO; 1 pending again |
| H6 a reload | the same wrong state | the same right state |
| H7 Sunday: a line 12:00–13:00, published; then IN TIME 0830 typed; then the amendment | **the in-time never reached the OIL: HO, 09:00–15:00 after the amendment too** | pending on typing, HO held; after the amendment FO, worked 08:30–15:00 |

1 of 7 steps passed before; 7 of 7 after. Browser errors: none in either run. Pictures opened by the host: the To go
out list after the change (after), the tracker after the change (before and after) — the three that carry the finding.

## The break tests

`scripts/handpass/ows-break.py` cuts each wire of the change once and runs the three test files
(`docs/handpass/parts/ows-break.json`). **22 cuts, 22 red; every file put back, all green after.** The first run found
three wires with no test, each closed before the walk: the "what would a man on this row get" helper's kept-values
parameter could not change any answer (a row's default is off only for a standby row, whose window never reads the
values) — the parameter was removed; a hand-edited or half-written kept value was untested — pinned (read as none
kept); and the standby cut was not a real cut — replaced.

| Cut | What was broken | Red |
|---|---|---|
| B01 | the flying line stops reading its entered in-time / Rally | 23 |
| B02, B03 | the walk ignores the kept report lead / the kept debrief | 14, 7 |
| B04 | the threshold ignores the value handed in | 10 |
| B05 | the published record no longer keeps the three values | 24 |
| B06, B07 | the work walk / the amount read today's values | 16, 9 |
| B08 | the credit pass does not face each date's own record | 2 |
| B09 | the board's figures read today's full-day line | 1 |
| B10–B12 | no pending entry; not listed as its own item; folded with a request's | 11, 8, 7 |
| B13, B22 | the pending line loses its words; names no man | 6, ≥1 |
| B14, B15 | a sign-off keeps no values; is not checked against them | 4, 4 |
| B16, B17 | the comparison on the amount alone; firing whenever a value differs | 3, 6 |
| B18, B20 | "could he earn here" / "can this row earn" read today's values on a published face | 1, 1 |
| B21 | a malformed kept value is trusted | 1 |
| B23 | a standby wave is measured like a flying line | ≥1 |

## The plan, and what its two challenges changed

`docs/superpowers/plans/2026-10-06-oil-work-start-plan.md` — written before any app code, challenged once by Astra and
once by Sol 6.1, blind to each other (`docs/superpowers/briefs/2026-10-06-oil-work-start-plan-challenge-{astra,sol}.md`),
both PROCEED WITH CHANGES. Its §7 is the disposition table. In short: the sign-offs' binding to the values (both) —
built; "amounts only" contradicted by D592's words (both) — changed to the whole record, in Astra's shape, not Sol's
"whenever a value differs"; the Logic line never folded into a request's (both) — built; the zero-span sortie (Astra) —
not built, pinned and filed; the reader checklist (both) — done; "EOD" corrected (Sol).

## Astra's scenario read

`docs/superpowers/briefs/2026-10-06-oil-work-start-scenarios-astra.md`: two roll-call tables, 42 scenarios with their
numbers, a 38-row numbers table, and the owed read of D591 / D592's short lines against their full rows — **PASS for
both**. All five builder's readings judged sound (the comparison "as revised"). Three finds outside the core, each
older than this job and the same on `main`:

| # | The find | Disposition |
|---|---|---|
| F1 | the OIL tracker prints only the first worked period of a credit | **confirmed (a red test), fixed** — `leavewar/ui/OilTracker.tsx`, `oiltracker.test.tsx` |
| F2 | the Unpublish warning assumes the whole credit goes when an AMENDMENT is withdrawn | **filed, not built** — `[UNPUB-WARN-AL-RESTORES]`; it errs toward warning; walker C records what it says |
| F3 | the Logic page says SC spare / AVALON / BB "earn nothing at all" — against D24 | **fixed** (words only) |

Its two document notes are done: the register's "amount only" wording, and the zero-span item it could not find in the
backlog (it was filed minutes after its read).

*(Astra's report and its brief name the register `…-oil-work-start-register.md`; the file was renamed
`…-oil-work-start-behaviour-register.md` afterwards so the document check reads it. The two files are kept as written.)*

## The walk

**Four walkers (Sonnet 5.5 — D588), each in its own world, on the frozen build (bf92e003, ports 4293–4296), under the
PC's one lock.** One brief for all four (`docs/superpowers/briefs/2026-10-06-oil-work-start-walk-brief.md`), Astra's 42
scenarios shared out by subject, the host's five additions, and a slice of Astra's ordered pairs each. None was told
whether anything was wrong. Their reports: `docs/handpass/parts/ows-{A,B,C,D}.md`; their step tables
`…/ows-{A,B,C,D}.json` (these keep the rows of runs a walker later re-did — see "Rows marked FAIL" below); pictures
`docs/img/handpass/2026-10-06-oil-work-start/{A,B,C,D}/`. Every fixture through the app's own controls; desktop
1440×900, and phone 390×844 where the share named it. Browser errors (console, page, 4xx) in any run of any walker:
**none**.

| Walker | Its share | Result | Pictures saved / opened by it |
|---|---|---|---|
| A — a Logic change under a published day; the pending line; the sign-offs | S08, S10, S11 (a flight and a desk), S12, S13, S04, S06, S07, S41; S08 and S10 on a phone; H-01 (Undo, Redo, Reset to standard), H-02 (the Logic page's words, desktop and phone); 36 ordered-pair runs {lead, debrief, threshold} × {sign, publish, amend} | every scenario PASS; S12 PARTIAL (below); 36 of 36 pairs as the rules say | 578 / 26 |
| B — the In-time / Rally lines and where the day starts | S09, S33, S25, S26, S27, S28, S29, S30, S31, S32, S23, S24, S34; S09 and S24 on a phone; H-03; 36 ordered-pair runs {add, change, remove a line} × {publish, amend, lead} | 81 PASS, 0 FAIL, 17 RECORDED | 654 / 21 |
| C — downstream: the tracker, the Leave War, Unpublish, requests, a member | S01, S03, S05, S02, S16, S17, S18, S14, S15, S42; S01 and S42 on a phone; H-04 (the member's face); 24 ordered-pair runs {Unpublish, load an older version, a member's request edit} × {lead, change a line} | every OIL number PASS; S14 PARTIAL (below); S02's warning words RECORDED | 328 / about 43 |
| D — the other seats and doors | S35, S36 (13 men on every kind of seat), S37, S38, S39, S40, S19, S20, S21, S22; S38 on a phone; H-05; 24 ordered-pair runs {a man off, a row off} × {lead, debrief, amend} | PASS, with two finds (below) | 357 / 31 |

**What the walk saw, in the app's words** (each read where the OIL lands — the Leave War cell, the worked times, the
tracker's balance — as well as on the day):
- A sortie 12:00–13:00 with nothing typed: half day, worked 09:00–15:00. IN TIME 08:59: full day, 08:59–15:00. Every
  accepted spelling (0830, 08:30, 0830H, 0830L, 830) gives 08:30; `8h30`, `25:90`, `FL240`, words only and "rally after
  in-time" with no in-time give the nominal 09:00. A formation's own line beats the wave's; a wave-wide Rally still
  applies to it. Two in-times across midnight, either order: the evening before. Saturday 01:00–02:00 reporting 22:00 on
  Friday: half day, worked 00:00–04:00, Friday empty; 21:59: full day. A public-holiday Monday reads the Sunday evening
  across the week edge, and Sunday earns nothing from it.
- A Logic value changed under a published day: the cell, the worked times and the balance HOLD; the day reads 1 pending
  with the Logic line naming the value and the man; "Not yet signed"; Undo, Redo and Reset to standard behave as
  putting the value back; the amendment applies it, still ONE credit. Both edit boxes for the lead edit the one value;
  bad entries are refused. A second week that is off screen holds the same way, and amending one Saturday leaves the
  other alone. An SC shift's B box, a duty desk, a sim and a ground row never gain flight padding.
- Sign-offs: on a day not yet published, signed then a value changed → the four go blank and Publish locks; put back →
  they return. Two signed before a change and two after: only the pair whose value is current stand.
- Publish → Undo → Redo → reload, and the same around an amendment: the credit follows the version that stands, no
  stale credit. Unpublish an Original: the credit goes. Unpublish an amendment: the Original's OIL comes back.
- A member editing his own earning request after publishing: the published OIL holds, his edit and the Logic change
  are two separate lines, and the amendment lands both once. A member's View-only Sched keeps the published full-day
  edge and offers no control that moves OIL.
- The tracker prints both worked periods of a day ("06:00–06:30, 10:00–15:00"), wrapped cleanly on a phone.

**Finds, each reproduced or settled by the host before it is written here:**

| # | From | What the screen did | Disposition |
|---|---|---|---|
| W1 | D, S38 (and the pairs with a man or a row switched off) | with another change also waiting — his flight row switched off, not yet published — the Logic line's "Ranger · OIL full day · … → full day · …15:30" read as what the amendment would give him; it is his PUBLISHED OIL under today's values | **fixed** — the man's line now reads "Ranger · OIL as published, under today's values"; `ui/oilworkstart.test.tsx`, `e2e/oilworkstart.spec.ts`; the host's re-walk on the rebuilt build (7 of 7, picture `host-rewalk/dk-05-H2-togoout.png`, opened) |
| W2 | D, S39 D2 / D3 | "Off day" set on a published earning Saturday: the credit held and the day read nothing pending | **not a fault — the scenario's expectation was wrong.** A weekend earns as a weekend whatever is tagged on it, and an Off day is deliberately inert for OIL (D21; `leavewar/engine/eventdefs.ts isNonWorkingDay`: a weekend first). Nothing changed, so nothing is pending. Unchanged from `main` |
| W3 | A, S12 | a debrief change on a published day where a ground row sits inside the debrief window: no OIL line (the record does not change), but the day reads 1 pending for "Not enough time to attend the VIPER debrief … (land + 2h30) changed" | **as ruled, older than this job** — a warning's words on a published face are frozen and a rule change that rewrites them reads pending (D179). The OIL clause of S12 holds |
| W4 | C, S14 | with a member's request edit AND a Logic change waiting, no screen prints the amendment's combined worked times before it goes out | **left** — each change has its own line; what the day WILL earn is the working copy's figure in OIL Earn (FO / HO, not the minutes). Landed correctly at the amendment |
| W5 | C, S02 and S16 | the Unpublish warning and its done-message say the day's OIL "leaves the Leave War" when withdrawing an AMENDMENT brought the Original's OIL back (balance 0 → 0.5) | **filed before the walk** — `[UNPUB-WARN-AL-RESTORES]`; the walker's words are now in the item |
| W6 | B, S34 | a 12:00–12:00 line with its in-time at 12:00 and the debrief at zero earns nothing, and the day's advisory still says it "earns from the report and debrief" | **filed before the walk** — `[OIL-ZERO-SPAN-SORTIE]` |
| W7 | B, S26 | `IN TIME FL240` and plain words raise no "no recognised clock" warning (`8h30` and `25:90` do) | **as built by the Rally work** (a flight level is not an attempted clock); OIL falls back to nominal in every case |
| W8 | D | OIL Earn's day switch keeps the label "Nothing today earns" while it is on (only its tooltip changes) | older, not this job's — noted, not filed (cosmetic) |
| W9 | B, H-03 (recorded) | Insights' work hours for the man moved 18h → 20h30 when the 08:30 in-time was published, his OIL day 6h00 → 6h30 | **as ruled** — with nothing typed the bar starts at step and OIL at the nominal report (D592 (2), D482) |

**Rows marked FAIL in the walkers' own tables, each accounted for** (the JSON keeps superseded runs): A — S12.2 (W3)
and twelve rows of its first pair script, whose expectations it corrected and re-ran (`ows-A-pairsY-*.json`); B —
S32.2, its first read of sign-offs from the wrong element, re-read; C — S14.c (W4) and the phone's OIL Earn button it
did not find (NOT WALKED); D — S36's SC SPARE (it needed the row's own switch; re-walked alone, PASS), S37's window
(its selector; redone), S38.8 desktop and phone (W1), S39 D2 / D3 (W2), S40.1 (a label check of its own), S20 (it read
the live copy's line instead of the preview; the picture shows 08:30).

**The host opened** the pictures behind each find and each kind of "holds" step: `host-after/dk-05-H2-togoout`,
`host-before/dk-06-H2-tracker`, `host-after/dk-07-H2-tracker`, `host-rewalk/dk-05-H2-togoout`,
`A/dk-10-S12-b2-togoout`, `A/dk-04-S07-4-restored-6h01`, `B/ph-06-S09phb-day-togoout`, `B/dk-23-S34c-day-togoout`,
`C/ph-13-S01-3-tracker`, `C/dk-14-S14-3-togoout`, `D/dk-37-S38-8-flightoff-debrief-togoout`, `D/dk-06-S36-al-tracker`
— twelve. The walkers opened about 121 of their 1,917 between them and say so; a picture nobody opened is a record,
not evidence.

## What was NOT walked, and why

- **Astra's full ordered-pair expansion** — 364 short runs; 120 were walked (the four slices above), chosen so every
  action letter meets a publish, an amendment or a Logic change in both orders. Not walked: the pairs among the three
  reporting-line actions themselves, among the three Logic values themselves, and most pairs with "load an older
  version" against a version other than the one paying.
- **Undo → Redo → reload after EVERY step** of the numbered scenarios — done for the 120 pair runs, S18, S31 and H-01,
  not around each step of the rest.
- **The Leave War's clash strip, the Inputs page's "recorded as working" note and the publish-time toast, in a
  browser.** After the two code reads the first two are proven by tests through the real stores and the real Inputs
  door (a leave beside the published work, and over it); neither was looked at on screen in this job, and the toast
  (a bid already standing when work is published over it) was not set up at all.
- **A guest's own pages and the phone's OIL Earn figure** in S42 (walker C did not reach them); a guest's waiting
  screen was seen with no write control.
- **Copy day** — Astra's S21 names it; the app has no such control (a day template and "+ Alt Plan" were walked).
- **The pairs and S05, S18 at phone width.**
- **A real iPhone** — every phone picture is Chromium at 390×844; his look covers it.
- **The demo seed was not extended** with a weekend flying line carrying an in-time (order §7.1): the demo weekend is
  duty crew only by design, in both demo weeks, and the first week must match the original app line for line. The case
  is built through the app's controls each time (the host's walk, the browser test, every walker).

## The two code reads

Astra and Sol 6.1 (D590 — Opus wrote the code), each on the frozen code and this sheet as it then stood, blind to the
other, one brief (`docs/superpowers/briefs/2026-10-06-oil-work-start-read-brief.md`, which carries the D56 exclusion).
Their reports are filed as written: `…-oil-work-start-read-astra.md`, `…-oil-work-start-read-sol.md`. Neither can run
the app or the tests; each read the code against ten claims the brief put to it and said so claim by claim.

| Reader | Verdict | What it asked for | Disposition |
|---|---|---|---|
| Sol 6.1 | **PASS — required changes: none** | optional: the "not a list" reporting test should assert the exact span, not just "something" | done (`engine/oilworkstart.test.ts`) |
| Astra | **CHANGES REQUIRED — none of them in the app** ("No production-code repair is established by this read") | **F1 (low):** the browser test's "the four sign-offs fell" proved nothing — publishing hands the four back empty, so none were standing when the Logic value changed | **fixed** — the test now signs the published day again, counts four, changes the value, counts none, and checks the amendment cannot go out until the four sign again (`e2e/oilworkstart.spec.ts`) |
| | | a roll-call row was missing: leave filed over work ALREADY published (the Inputs door reads the stored credit — a different order from publishing work over a bid) | **added**, with a test through the real Inputs door (the roll-call's new row) |
| | | the sheet had no §Status and no gates yet | this section, §The gates and §Status |

**Both passed the three owed meaning reads (D138):** D591's short line; D592's readings (6)–(10), as the agent's
readings and not his words; the three sentences changed on the Logic page.

**Neither found a fault in the rule.** Both traced every reader of a published day's OIL and found none still reading
today's three values; both checked the pending comparison, the sign-offs' binding and the moved worked-times function
and found no defect. Neither reported anything under D56.

**The cases each reader ranked for the host, and what became of them** (they are checks to run, not findings):

| Case | Ran as |
|---|---|
| Leave filed in the stretch only the published times cover (Astra 1) | new test, through the real Inputs door — flagged, the note names 07:00–13:15 |
| The clash with something in the afternoon moves only with the amendment (Sol 1) | new test, with an afternoon LEAVE; with a BID, and the publish-time toast (Astra 2): **not run** |
| Four sign-offs standing → none → amendment locked → signed → amendment (Astra 3) | the browser test, as repaired |
| A cancelled formation's line does not become the wave's (Astra 7) | new test |
| A change that moves only hours past midnight raises nothing (Astra 6, Sol 6) | new test |
| Malformed reporting lines; an unreadable landing (Astra 8, Sol 11) | `engine/oilworkstart.test.ts` (OWS2, OWS5) |
| Two Saturdays, one off screen; amend only one (Astra 10, Sol 4) | published test (off-screen week); walker C S05 |
| A request edit and a Logic change together, both orders (Astra 5, Sol 8) | walker C S14 and its pairs |
| Two worked periods in one day; the debrief moves only the second (Sol 5) | walker C S01; published test (worked times pending) |
| A report on the evening before (Sol 7) | walker B; published test OWS9 |
| SC, AVALON and the other seats never gain flight padding (Sol 10) | walker D S36; `engine` OWS5 |
| Three versions side by side — Original, the amendment, the working copy under a third value (Astra 4, Sol 3) | **partly**: each face reads its own values (`ui/oilworkstart.test.tsx`; walker D S19, S20); the three-way case as written **not run** |
| Sign-offs on two saved plans, switching between them under a changed value (Sol 2) | **not run** (a saved plan was walked; its sign-offs across a switch were not) |
| A weekday signed and published, then declared a holiday (Sol 9) | **not run** here — older behaviour (D2), unchanged |
| The setting's limits: 0 / 0 / 720 and 480 / 480 / 720 (Astra 9, Sol 10) | **not run** as written |
| A second tab opened cold (Sol 12) | **not run** — a reload was (host H6, the walkers) |

**After the two reads** the only changes are to tests and documents: four new tests, one tightened assertion, the browser test's F1 repair and
its helper (§The gates). No app code changed after the reads, so nothing built is unread; the tests added after them have
had no independent read (the cap of two is spent).

## The gates

All under the PC's one lock, each count from a run watched in this chat.

| Run | On | Result |
|---|---|---|
| 1 | the build as walked | unit 8032 / 8032 · build · tfin 728 / 0 · e2e 617 passed, 50 skipped, **1 failed** — this job's own new browser test, at its last step · smoke 445 / 0 · rulecheck · docsize |
| 2 | after the test's helper was made to wait on the value | e2e **618 passed, 50 skipped, 0 failed** · perf 4 / 0 (week DOM 5131 ≤ 5450, board DOM 1018 ≤ 1150) · the six adapted probes passed (155 checks) |
| 3 | after the reads' test fixes | unit 8034 / 8034 · build · tfin 728 / 0 · e2e 617 passed, **1 failed — the same test, the same step** · smoke **aborted** (see below) |
| 4 | after that step was traced and the helper repaired | **unit 8034 / 8034 (499 files) · build clean · tfin 728 / 0 · e2e 618 passed, 0 failed, 50 skipped · smoke 445 / 0 · rulecheck OK · docsize OK** |
| 5 | after two more tests (the readers' cases) | the full unit suite again: **8036 / 8036 (499 files)** |

**Speed:** one edit of the week costs the same as on `main` — 190.6 ms against 187.8 ms on `main`'s own build, measured
back to back on the same machine, inside the spread of three trials each.

**The test that failed twice, and why.** Both failures were the same step of `e2e/oilworkstart.spec.ts`: Logic opened,
"Nominal report before T/O" typed, Tab — and the app still held the old value. The first repair (wait until the app
holds the value) only turned a silent wrong state into a clear failure. Traced the second time with a watcher on the
Logic page's body: about half a second after the page opens, its list of rules is replaced by the same markup — new
boxes, nothing visibly different — and a value typed into a box at that instant goes with the old box. It reproduces
every time with a pause put between the typing and the Tab, and never by a person's hands. The helper now types again
until the app holds the value (no fixed wait), and the test has the time its length needs: it is one chain of a dozen
page changes, about 20 seconds on a free machine, 70 with the page slowed four times over and eight copies at once
(8 of 8 passed that way; 6 of 6 at full speed; 3 of 3 with the pause that used to break it). **The redraw is older
than this job and not in anything it changed** — filed, `[LOGIC-REDRAW-DROPS-TYPING]`, with what is not yet traced
(what asks for it, and whether it can happen later while a person is typing).

**The aborted smoke run (run 3) was the host's own mistake, not the app's:** while the Tracker smoke was running, the
host ran the browser test in a loop to chase the failure above; that run rebuilds the app's files, and it did so under
the smoke's server, which then served nothing. Run 4 was made with nothing else running. (Logged for the working
guides: a browser-test run of even one file rebuilds the app, so it must not start while any gate is in flight.)

## His look — five minutes

On the branch's preview, signed in as admin, on the demo week:

1. **Edit Schedule → Saturday → the board → "+ Wave", a flying line 10:00–11:15 with one man in it → the four sign →
   Publish.** Leave War: his Saturday reads **FO**.
2. **Logic → Edit rules → "Nominal report before T/O" 3h → 2h30.** Leave War: **still FO** (it used to turn HO at
   once). Edit Schedule: the Saturday reads **"1 pending"** and the four sign-offs are empty; tap the count → "To go
   out" names the value and the man ("OIL as published, under today's values").
3. **Sign the four again → Publish AL1.** Leave War: now **HO** — the new value applies only once it goes out.
4. **Sunday: a line 12:00–13:00, "+ In-time / Rally" typed 08:30, publish.** Leave War: **FO**; the OIL tracker reads
   worked 08:30–15:00 (with nothing typed it is 09:00–15:00, a half day).
5. **Logic:** read the three reworded rows — the nominal report, OIL, AVALON.

The four readings at the head of this sheet are his to overrule; none blocks.

## Status

*(As it stood on 6 Oct 26, before D606. What was built after it — an SC shift's typed in-time — has its own check and
its own status in §D606, at the foot.)*

**BUILT; FULL-checked; ready for his look. Not merged; `main` untouched; nothing reaches `main` without his "merge
live".** Branch `claude/oil-work-start-build-35a0e3`, pushed, one pull request open — not for merging until his word.

- **The rule:** no fault found by the walk (four walkers, 47 scenarios and 120 ordered pairs, no browser error), by
  the 22 break tests, or by either code read.
- **Found and fixed in this job:** the fault itself (a published day's OIL moved the moment a Logic value changed; a
  flying line's OIL day ignored its typed in-time / Rally); the OIL tracker printing only the first worked period of a
  day; the Logic page saying standby lines can never earn; the pending line's wording (walk W1).
- **Found and filed, none of it this job's doing:** `[OIL-ZERO-SPAN-SORTIE]`, `[UNPUB-WARN-AL-RESTORES]`,
  `[LOGIC-REDRAW-DROPS-TYPING]`.
- **Gates:** run 4 above, all green on the final app code; the unit suite again after the last two tests:
  **8036 / 8036 (499 files)**.
- **Not proven:** §What was NOT walked, and the "not run" rows of the readers' cases above — chiefly a bid (not a
  leave) standing when work is published over it, sign-offs across two saved plans, and a real iPhone.

`Walk: docs/handpass/2026-10-06-oil-work-start.md · 1,995 pictures · 21 surfaces · 47 scenarios + 120 ordered pairs · MISSING: none — two "NO, because" rows (the change history: filed [HIST-PER-PAGE]; CSV / print: no OIL column)`

## D606 — an SC shift's typed B (its in-time) counts for OIL (7 Oct 26)

**Authority: D606** (owner, 7 Oct 26 — *"It rarely happens but SC B if filled u can count it as work hours as well and
OIL earned."*), his answer to reading 4 at the head of this sheet. Built on this branch AFTER the check above had
closed and the branch had been pushed; this section is that change's own check. Everything above describes the build
before it — where it says an SC shift's B "moves nothing", this section is what now stands.

**The readings the agent made, for him to overrule** (D606's full row; each tested as built):
1. the EARLIER of the B and the shift's written start is used — a B typed later than the start shortens nothing (the
   guard his 24 Aug rule already put on it: "if B is filled earlier than TO for main only");
2. it is the MAIN's in-time only — the app's standing sentence is "a SPARE reports nowhere, so his B does nothing": a
   SPARE earns nothing by default, and one switched on in OIL Earn earns the shift's WRITTEN hours;
3. a shift that starts within the nominal lead of midnight reads a later B as the evening before — as crew rest has
   read it since 24 Aug — and that lengthens the shift's own day only;
4. AVALON and BB are untouched; 5. the work-hours day already started at an SC MAIN's B (24 Aug 26) — nothing new was
   built for it; 6. a B typed after the day is published is a pending change, and the OIL moves with the amendment.

**The eight questions → FULL** (1 YES — what a man is owed; 4 YES — the one work walk feeds every OIL surface; 2, 3 —
NO new saved field and no new kind of pending change: the B is a line's own box, already in the published record; 5,
6, 7 NO; 8 — two sentences on the Logic page, no warning added or reworded). Sized to the change: one walker on a
frozen build, the break tests, the gates, both readers on the diff.

**The roll-call — an SC MAIN's OIL where its B is filled:**

| Where | Shows it? | Proof |
|---|---|---|
| Leave War grid — the FO / HO cell | **YES** | walker E01–E10; published tests (OWS12); `e2e` OWS12 |
| OIL tracker — the row's worked times and the balance | **YES** — "FLT · 06:00–13:00", "00:00–07:00" for an evening-before B | E04, E08, E10 (host opened E04's tracker) |
| The board's and the week's green edge; OIL Earn's figures | **YES** — the working copy reads FO the moment the B is typed, the published face keeps its half-day edge | E03; E14 (the member's face) |
| OIL Earn's switches — a SPARE seat, an AVALON seat | **YES** — a SPARE switched on earns 07:00–13:00, never from the B; AVALON 19:00–23:59 with 17:00 in its B box | E09, E12; engine test "MAIN only", "AVALON and BB" |
| "N pending", the Amendments box, To go out | **YES** — a B typed on a published day is the line's own change ("SC · brief 06:00"; the word "brief" for an SC in-time is older wording — FILED); the evening-before case raises the Logic line when the lead changes | E02, E06, E11 (host opened E11's list) |
| The four sign-offs | **YES** — fall with the B change; fall and return with the Logic value | E02, E11; published tests |
| The Inputs page's "recorded as working" note; the day going amber | **YES** — "recorded as working 06:00–13:00 on 18 Jul", the amber mark on the Leave War day | E16 |
| Insights — Work hours | **AS BEFORE** — 20h → 21h with the B; built 24 Aug 26, untouched | E13 (recorded); published test (`workSpan` 360) |
| The Logic page's words | **YES** — its OIL row and its SC in-time row | read in the source; not pictured |
| ALL AVAIL window "Who earns OIL"; the publish-time toast; the Leave War's clash strip | **YES, by construction** — the same work walk and the stored record | NOT walked |
| Edit Schedule's desktop WEEK | **NO, because** the week has never drawn an SC line's B (his call of 24 Aug 26 — "raise mirroring only if he asks"): a B typed on the board now moves OIL and the week gives no sign of it; the OIL tracker's worked times do | told to him in the report — his to raise |
| The published face (View-only Sched) | **NO, because** the published face draws no B column for SC either (E14) — the same seam | recorded |
| CSV / print | **NO, because** neither carries an OIL column | unchanged |

**The door check:** type, change or clear the B — the board's B box on the SC line, at desktop and phone width (E15:
four boxes, one per crew row, between MSN and TO); an unreadable entry is refused with "abc is not a time — try 0900
or 09:00" and the box goes back (E07). No state was found where the data allows an action with no control.

**Red first:** `engine/oilscintime.test.ts` — 8 of 14 failed on the code before the change (the six that passed are the
"nothing changes" cases); the browser test OWS12 fails with the change cut out ("Expected FO, Received HO") and passes
with it; the older pin "an SC shift is its written window — neither a reporting line nor its typed B box moves it"
was changed to what D606 rules (its reporting-line half kept). **Break tests:** the whole script re-run — 29 cuts, 29
red, restored green; seven new — B24 (the OIL ignores the B) 11 red, B25 (a later B shortens) 4, B26 (AVALON / BB read
theirs) 1, B27 (a SPARE takes it) 1, B28 (today's lead, not the day's own) 2, B29 (no evening-before reading) 3, B30
(crew rest stops reading it) 6; B23 re-aimed at the new line, 18.

**The walk — one walker (Sonnet 5.5, D588), letter E, on the frozen build (73f89786, port 4294):**
`docs/superpowers/briefs/2026-10-07-oil-sc-intime-walk-brief.md`; report `docs/handpass/parts/ows-E.md`, table
`…/ows-E.json`, pictures `docs/img/handpass/2026-10-06-oil-work-start/E/` (98 saved, 35 opened by the walker).
Sixteen scenarios through the app's own controls, desktop and (E15) phone; browser errors: **none**.

| # | What | The screen |
|---|---|---|
| E01 | SC MAIN 07:00–13:00, B blank, published | HO · worked 07:00–13:00 |
| E02 | B 06:00 typed on the published day | HO holds · 1 pending · sign-offs empty · "SC · brief 06:00" |
| E03 | OIL Earn on the working copy; the published face | FO on the working copy · the half-day edge on the published face |
| E04 | Publish AL | FO · worked 06:00–13:00 · nothing pending |
| E05 | Undo, Redo, reload | Undo: back to ORIG's HO with the B waiting · Redo and reload: AL1, FO · ONE row for the day throughout |
| E06 | B → 08:00, AL2 | FO holds until it goes out · then HO, 07:00–13:00 |
| E07 | `abc`, `25:90` | refused, the box goes back · nothing pending |
| E08 | B 06:00 before the first publish | FO · 06:00–13:00 |
| E09 | a SPARE with B 06:00; then switched on | nothing · then HO, 07:00–13:00 (not 06:00) |
| E10 | shift 01:00–07:00, B 23:00 | FO · 00:00–07:00 · Friday nothing |
| E11 | lead 3h → 30 min under E10's day, unsigned and signed | holds · 1 pending · "Ranger · OIL as published, under today's values: full day · 00:00–07:00 → half day · 01:00–07:00" · the four fall, and return with the value |
| E12 | AVALON, B 17:00, seat switched on | FO · 19:00–23:59 — no 17:00 anywhere |
| E13 | Insights before and after the B | 20h → 21h (recorded) |
| E14 | the member's View-only Sched | the published line and its edge; nothing to type into |
| E15 | phone: E01 → E02 → E04 | the same numbers; the B box is there |
| E16 | leave 06:00–06:30 filed over the published FO | "Ranger is recorded as working 06:00–13:00 on 18 Jul — this LL is filed anyway and flagged" · the amber mark |

**The walker's notes, each looked at by the host:**
- *OIL Earn's bar says "Nothing today earns" while Ranger's puck reads FO* (E03; host opened
  `E/dk-08-E03-oilearn-board`). It is the bar's day SWITCH — a button that would make nothing on the day earn — not a
  status; the first walk's W8 is the same thing. Two walkers have now read it as a status, so it is **filed**:
  `[OIL-EARN-DAY-SWITCH-WORDS]` (low, words). Older than this job.
- *The changes window calls an SC shift's B "brief"* (E02, E06, E15). Older wording; on an SC line the B is the
  in-time, and since D606 it moves OIL. **Filed:** `[SC-B-CHANGE-SAYS-BRIEF]` (low, words).

**The host opened** `E/dk-08-E03-oilearn-board`, `E/dk-11-E04-tracker` (the row reads "+1 18 Jul AUTO Weekend/PH ·
FLT · 06:00–13:00 · 1 left") and `E/dk-20-E11-signed-0h30-togoout` (the Logic line as quoted above).

**NOT walked:** the ALL AVAIL window's OIL tab, the publish-time toast and the clash strip with an SC B; an SC MAIN and
another event of his on the same day (tested: `engine/oilscintime.test.ts`, "first start to last end"); the PM shift
and both MAIN rows at once; E05–E14 at phone width; the next day's cell after E12's overnight AVALON; a real `us`
sign-in for E14 (the admin's member view was used); a real iPhone.
