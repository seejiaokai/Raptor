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
| Leave War clash strip (a credit against leave or a bid) | **YES, by construction** — it reads the stored record's times, which now hold still | as before | — | NOT separately walked (see §Not walked) |
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
