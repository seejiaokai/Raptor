# The code read — an SC shift's typed B (its in-time) counts for OIL (D606, built on `[OIL-WORK-START]`) — 7 Oct 26

You are one of TWO independent readers of a small, finished change (bug-check order §4 rank 2, §4a; D590, D601 — Astra
reviews what Opus wrote and Sol 6.1 reads second, each blind to the other). You did not write it. Work READ-ONLY: change
nothing, build nothing, start no server. **You cannot run anything** (the sandbox has no writable temp folder — a test
run reports zero tests): read the source, and where you would have run a case, NAME the exact input and the answer you
expect; the host runs it. Never read the other reader's report (`2026-10-07-oil-sc-intime-read-astra.md` /
`…-read-sol.md`); never approve — your report is evidence, the owner approves.

## The owner's ruling

**D606 (7 Oct 26):** *"It rarely happens but SC B if filled u can count it as work hours as well and OIL earned."* —
full row: `grep -h '^| D606 |' .claude/decisions-full/*.md` (the shell). Read it: it carries the builder's SIX readings,
each of which you are asked to judge against his words and the standing rules — above all:
- (1) the EARLIER of the B and the written start (a later B shortens nothing);
- (2) a B on the evening before, read by the body crew rest already reads it with, lengthening the shift's own day only;
- (3) the B is the MAIN's in-time only — a SPARE switched on in OIL Earn earns the shift's WRITTEN hours. The builder
  first wrote this the other way (a switched-on SPARE takes the B too) and reversed it on the app's own standing
  sentence "A SPARE reports nowhere, so his B does nothing" (24 Aug 26; the Logic page's SC in-time row) and on
  `engine/scintime.test.ts` "MAIN only". Say which reading his words and the standing rules support better;
- (5) "work hours" were already counted from an SC MAIN's B (`validate.ts workSpan`, since 24 Aug 26) — check that
  claim in the code: is there any work-hours reader (Insights' bar, the long-work-day note) that does NOT count it?

Also read the rulings it stands on: **D591, D592** (and D592's withdrawn reading (10)), **D24, D35** (a SPARE's
switch), **D42** (a day's own hours), **D48, D142** (a published day), **D56** (stored-demo-data harm is NOT a
finding — do not produce one), and the settled decision "On SC, the B box is an IN-TIME" in
`.claude/rules/decisions/scheduler.md` §Settled before this list → Board behaviour.

## The change

`git diff 0dbb6e1b..HEAD -- raptor-port/src raptor-port/e2e raptor-port/scripts/handpass/ows-break.py` (the branch is
`claude/oil-work-start-build-35a0e3`; `0dbb6e1b` is the commit that recorded the ruling, before any code).
- `raptor-port/src/engine/reporting.ts` — new `scIntime(br, toM, lead?)`: the one body that reads an SC line's B;
- `raptor-port/src/engine/events.ts` — `seatIntime` now calls it (must be byte-equivalent in behaviour to the two
  lines it replaced — check);
- `raptor-port/src/engine/oil.ts` — `dayOilWork`'s standalone branch: `scWin`, `scB`, `win`, and `seatWin` for a SPARE
  row;
- `raptor-port/src/ui/logic-html.ts` — two sentences (the OIL row; the SC in-time row).
Tests: `raptor-port/src/engine/oilscintime.test.ts` (new), three cases under "OWS12" in
`raptor-port/src/leavewar/oilworkstart-published.test.ts`, one new test in `raptor-port/e2e/oilworkstart.spec.ts`
("OWS12"), and ONE older pin changed in `raptor-port/src/engine/oilworkstart.test.ts` ("an SC shift is its written
window …" — its typed-B clause removed): judge whether that change traces to D606 and keeps its other half.

**Read first, from the live files:** the evidence sheet with its roll-call —
`raptor-port/docs/handpass/2026-10-06-oil-work-start.md` (its last section, "D606", is this change's own record: what
was walked, the break tests B24–B30, what was NOT walked); the register
`raptor-port/docs/superpowers/specs/2026-10-06-oil-work-start-behaviour-register.md` (OWS12, OWS5);
`raptor-port/docs/engine-rules.md` §Weekend/PH work earns OIL (search "D606"); the walker's brief and report
(`raptor-port/docs/superpowers/briefs/2026-10-07-oil-sc-intime-walk-brief.md`,
`raptor-port/docs/handpass/parts/ows-E.md`).

## What to answer — each with a line reference, or "checked, none"

1. **Is the rule right?** For an SC wave, every combination of: B blank / unreadable / earlier / equal / later than the
   start; a shift crossing midnight; a shift starting within the nominal lead of midnight with a B "on the evening
   before"; a shift whose written start equals its end; MAIN and SPARE rows; a formation-level `spare` flag with none on
   the aircraft row; a cancelled row or line. Name any input where the span is wrong, with the answer you expect.
2. **One reader.** Is there any OTHER place that works out when an SC crew starts — for OIL or for anything shown beside
   OIL — that now disagrees with `scIntime` (crew rest, the long-day note, Insights, the SANS window, the crew list's
   crew-rest line, the wave header)? Does `seatIntime` behave exactly as before for every wave kind?
3. **A published day.** The evening-before reading depends on "Nominal report before T/O". Trace that a published day's
   OIL uses the value it KEPT (`opts.rv`), that a later Logic change holds the published OIL and raises the Logic
   pending line (the existing `oilRuleShift`), and that nothing else in the published readers (the credit pass, the
   board's figures, OIL Earn's "can this row earn", the ALL AVAIL window) reads the B with today's value.
4. **A B typed after publication.** It is an ordinary field change (`ff:<di>.<gi>.<li>.br`): confirm it reads pending,
   takes the sign-offs down, and that the OIL moves only at the amendment. Is there an `oil:` evidence change it should
   also raise, or a case where the OIL moves with NO pending shown?
5. **Downstream of the span.** The stored worked times now start earlier: the Leave War's clash strip, the Inputs
   page's "recorded as working" note, the publish-time toast, the OIL tracker — does any of them mis-handle a span that
   starts before the shift's written start, or a start of 00:00 from an evening-before B?
6. **AVALON / BB and every other row kind:** unchanged? (`wv.kind==='sc'` is the whole guard.)
7. **The tests:** does each new test prove what its name says; is any assertion vacuous; is the changed pin justified;
   which wire of the diff has no test that would go red (the break results B24–B30 are in
   `raptor-port/docs/handpass/parts/ows-break.json` — recorded, not re-run by you)?
8. **The words:** do the two Logic sentences and the rules document say what the code does? The D606 short line in
   `.claude/rules/decisions/oil.md` against its full row (D138) — PASS or what differs.
9. **Absences.** Against the roll-call in the sheet: any surface that shows a man's OIL, his worked times or his work
   hours that this change should reach and does not, or reaches and should not.

Then: up to eight exact cases for the host to run, ranked (setup, action, the number you expect, what would disprove
it); and a verdict line — **PASS** or **CHANGES REQUIRED** with the changes listed. A claim is a finding only with a
concrete failure, its cause and its fix (D489); give exact, step-by-step fix instructions for each.
