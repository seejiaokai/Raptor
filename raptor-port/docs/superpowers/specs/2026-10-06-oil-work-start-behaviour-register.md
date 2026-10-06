# `[OIL-WORK-START]` — behaviour register (D591, D592; 6 Oct 26)

One plain line per behaviour, each named by a test (`scripts/rulecheck.mjs`, OWS1–OWS12). The rulings' full rows:
`grep -h '^| D59[12] |' .claude/decisions-full/*.md`. The plan and its two challenges:
`../plans/2026-10-06-oil-work-start-plan.md`, `../briefs/2026-10-06-oil-work-start-plan-challenge-{astra,sol}.md`.
The rules as written: `../../engine-rules.md` §Weekend/PH work earns OIL. The check: `../../handpass/2026-10-06-oil-work-start.md`.

| ID | The behaviour | Ruling | Named proof |
|---|---|---|---|
| OWS1 | A flying line's OIL day starts at the earliest entered in-time or Rally that applies to its formation — a line naming the formation before a wave-wide one, each activity apart, whatever the order of the lines; a time later than the nominal one shortens the day | D591, D592 (1); D505, D506 | `engine/oilworkstart.test.ts` |
| OWS2 | With nothing entered, or nothing the reader can read as a clock, the day starts at the nominal report: take-off less the Logic page's "Nominal report before T/O" | D592 (2) | `engine/oilworkstart.test.ts` |
| OWS3 | A report on the evening before (a clock later than its take-off) lengthens that line's own day and earns the day before nothing | D592 (3); D503, D42 | `engine/oilworkstart.test.ts`; `leavewar/oilworkstart-published.test.ts` |
| OWS4 | The day still runs from the start of his first event to the end of his last, gaps included — so from the earlier of his entered report and any earlier event | D592 (5); the 29 Aug 26 rule | `engine/oilworkstart.test.ts` |
| OWS5 | Unchanged: SC, AVALON and BB lines are their written window (no reporting line moves them; an SC shift's typed B is OWS12); sims, duty, ground and Common Programme rows; a cancelled line or jet; a line with no readable times; a nought-minute sortie still earns from its report and debrief (D49) | D591 ("a flying line"); D49 | `engine/oilworkstart.test.ts`; `engine/oil.test.ts`, `engine/oilflighttimes.test.ts` (untouched) |
| OWS6 | A published version keeps the three Logic values its OIL was worked out from (nominal report, flight debrief, full-day line); its credit, its worked times and the published face's OIL figures do not move when one changes — on the loaded week and on a week that is off screen | D592 (4); D48, D142 | `leavewar/oilworkstart-published.test.ts`; `ui/oilworkstart.test.tsx` |
| OWS7 | A Logic change that would write somebody's OIL record for a published day differently — his amount or his worked times — reads as ONE pending change of its own — in every count and in the To go out list, naming the value and each man — takes the four sign-offs down, and clears when the value is put back; a change that would write every record there as it stands raises nothing; it is never folded into an edited request's line | D592 (4); D45, D98, D103 | `leavewar/oilworkstart-published.test.ts`; `ui/oilworkstart.test.tsx` |
| OWS8 | Publishing the day again (an amendment, or Unpublish and publish) applies today's values and keeps them with the new version | D592 (4); D142 | `leavewar/oilworkstart-published.test.ts` |
| OWS9 | An in-time or Rally changed after publishing reads pending (it is day content) and moves the OIL only when the day goes out again — the credit reads the published version's own lines | D592 (4) | `leavewar/oilworkstart-published.test.ts` |
| OWS10 | A version published before the values were kept still loads and reads — with today's values, as that build did — and raises nothing pending | D56 | `leavewar/oilworkstart-published.test.ts` |
| OWS11 | The four sign-offs fall when a Logic change made after they signed would alter the OIL of the day as it stands — a day not yet published, or an amendment waiting — and stand again when the value is put back; a change that moves nobody's OIL leaves them | D45, D103 (the plan challenge's finding 1) | `leavewar/oilworkstart-published.test.ts` |
| OWS12 | An SC shift's typed B (its in-time), where filled, starts the shift's OIL span: the earlier of the B and the written start, to the shift's end — for the MAIN by default and a SPARE once switched on; a blank B, AVALON and BB are their written window; a B typed after the day is published moves the OIL only when the day goes out again; the work-hours bar already counts it | D606 | `engine/oilscintime.test.ts`; `leavewar/oilworkstart-published.test.ts` |

**The builder's readings** (each named in the plan, tested as built, and put to him on the look card):
- a time entered LATER than the nominal one shortens the day (OWS1) — D591's own words, and what the work-hours bar does;
- the pending comparison (OWS7) and the sign-off check (OWS11) are on each man's whole OIL RECORD — his amount (nothing,
  half, full) AND the worked times stored beside it — and a Logic change that would write every record on the day
  exactly as it stands raises nothing. *(First built on the amount alone; both plan challenges read D592's words as
  covering the worked times, and it was changed before the walk — the plan's §7.)*
- a line the app cannot read as a clock, or "rally after in-time" with no in-time, counts as nothing entered (OWS2);
- ~~an SC shift's typed B does not move its OIL (OWS5) — D591 says "a flying line".~~ **Overruled by him, 7 Oct 26
  (D606): a filled B counts — OWS12.** What remains the builder's reading there: the EARLIER of the B and the written
  start (a later B shortens nothing); a SPARE's B counts only once the SPARE is switched on.

**What this register replaces:** RT8's "nominal OIL unaffected by reporting-only edits"
(`2026-10-02-rally-behaviour-register.md`) — D591 narrowed D498; its other half (ordinary busy, the SANS window and the
work span keep their own definitions) stands.
