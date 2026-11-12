# The fresh, blind Opus read — job 2 (commit 300be6535), saved as it arrived, 13 Nov 26 about 06:20

## Findings

**1. A Logic change can still raise or clear a red OIL flag on a published day at once, while that day's OIL stays as published.** (D2014's "its OIL warning", D1991, D2013.) Pre-existing.
- What a person does and sees: a Saturday published with a line take-off 10:00, landing 10:00, in-time 10:00 earns a half day under the kept 2h debrief (D49). The admin sets "Flight debrief after land" to 0 on the Logic page. At once the published Saturday shows the hard red warning "WAVE 1 … has no usable times — nobody on it earns OIL for this day", in View-only Sched too (one of the live warnings on the face, LIVE_ON_FACE). The Leave War still credits the half day (it reads the kept debrief). The reverse: published with debrief 0 (warning, nothing credited), then raised: the red flag vanishes from the published face while the credit still pays nothing. Same with "Default rally before T/O" and debrief both 0, no in-time typed. Contradicts D1991, D2013 and the new strip.
- Cause: validate.ts (about line 1539) runs `withLiveRules(()=>{ const blind=dayOilBlind(DAYS[di]||{}) … add('hard','OIL_NO_TIMES',…) })`; oil.ts `dayOilBlind` calls `fltMeasuresNothing(wv,f)` with no leads (falls back to `ruleNow('reportLead')` / `ruleNow('debrief')`), and `zeroShift` calls `saZeroSpanWin(wv,f,ruleNow('reportLead'))` — today's values under `withLiveRules`, even on the official pass judging the issued snapshot.
- Fix: (1) `dayOilBlind(day, rv?)` passes `rv?.reportLead, rv?.debrief` to `fltMeasuresNothing` and `rv ? rv.reportLead : ruleNow('reportLead')` to `saZeroSpanWin`; (2) the validator passes `oilKeptVals(oilEvidenceOf(di, DAYS[di]))` (official pass: the frozen block's values; working copy: the live candidate's, today's); (3) keep `withLiveRules` round the rest; (4) red-first test, both directions; (5) correct engine-rules §Publishing.
- How sure: about 75%, from reading.

**2. The IT flow guide still names the old checks.** `raptor-port/scripts/itflow/content.mjs` lines 799 and 829 ("On leave + flying", "Downchit + flying"); the built deck matches too. Fix: change both, rebuild the deck, retake `r1-warn` if it shows the name. Certain the text is stale.

**3. Two code comments now say the opposite of D2014.** `engine/faceattrs.ts` above `KEPT_RULE_KEYS` ("a question waiting for the owner"); `engine/oil.ts` above `fltMeasuresNothing` ("The OIL credit and the 'no usable times' list … read today's"). Reword to D2014 / D592 (4); the second after finding 1. Certain; low harm.

**4. (Low, possible) The strip claims more than holds for the late cut-offs.** `rulesCheckedOffCount` (engine/rules.ts 205) counts the Inputs and SANS late cut-offs; changing only one, the strip says a published day keeps its settings, but LATE tags are drawn live everywhere (ui/html.ts lateTag → isLateInput). Arguably covered ("for its checks and its OIL"; LATE is a mark). Not sure it is a fault.

## Checked and found sound
- Readers of the old names: hide key is code + message (warnhide.ts hideKey), Insights groups by code, every surface reads the one table; reference comparisons pass (html.test.ts, parity.test.ts: 54 passed); no e2e reads "+ flying".
- The no-landing flag: set only when the landing box is not a time; sortie only; stored with the winning end per man; follows the last end across a second sortie, the overnight take-off and days 2–4 back (weekctx datedRestSeed); reset by a later-ending input or non-flying row; equal-to-take-off keeps "landed"; the mirror matches; a legacy "1300" landing is stored data only (D56); workSpan skips it.
- D2014's claim holds for every credited figure: the Leave War credit (sync.ts desiredOilCells → creditFrom → oilAmount with kept values), Balances, the tracker, the input half; Unpublish, Undo/Redo, an older version, the EOD, publish (daySnap freezes); a holiday after publication; the To go out list; the sign-offs' binding (oilRvBoundOk); the published face's green edge; Edit Schedule's green edge on a pending day (D2013); voidedOil working copy only.
- The strip: singular/plural, it/them, spacing, the member's sentence, reset hides it.
- Tests pin both halves with positive matches.

## Tidiness (outside the engine)
- Walk scripts `scripts/handpass/bta-D-4.mjs` and `ins-a-11.mjs` match `/^On leave \+ flying/` — would count 0 and pass; update or mark historical.
- LogicPage.tsx and refwin.ts: nothing duplicated or unused.
- The scheduler page still lists the four under "Not built yet" (closing records).
