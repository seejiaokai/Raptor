# D1786 — the fresh, blind Opus code read (8 Nov 26, chat 6; brief: `2026-11-08-day-start-read-brief.md`)

The report as returned (a subagent of chat 6 that had not seen the build or any other reader's report), whole; the
disposition follows it.

---

**Fresh, blind Opus read of D1786 (a day with nothing entered starts at the default rally), against the diff named in the brief: origin/main...efa9445b8**

**Read this first: housekeeping that affects your next push**
- Your commit cbdeaecb9 ("an unfinished or empty sortie stretches no work day") swept in my throwaway proof file `raptor-port/src/ui/zz-reader-tmp.test.tsx`. Its first test fails on purpose, so it would turn CI red.
- I have deleted the file, so `git status` now shows it as `D`. Please commit that deletion, or amend, before pushing. The branch is 4 commits ahead of origin, which is still at 060f6dec3, so nothing bad has been pushed yet.
- These are your work or the walker's, and I did not touch them: the uncommitted edits to `events.ts`, `daystart-default-rally.test.ts` and `docs/remarks-vocabulary.md`, and the untracked `docs/img/handpass/2026-11-08-day-start/` and `scripts/handpass/ds-*.mjs`.
- You were editing the same worktree while I worked, so some of my later single-file test runs may have included cbdeaecb9.

## Findings

### F1 · Low · `raptor-port/docs/engine-rules.md` §Where a day with nothing entered starts, bullet "A published day (D179)"
The bullet says the face keeps its long-day note "and the day reads nothing pending for it". That is false.

**What goes wrong (reproduced in a throwaway jsdom test, latepub-style setup):**
1. Fri 17 Jul: a new line VL, take-off 08:00, landing 15:30, salsa (Saint) and freak (Echo), nothing typed.
2. Saint's note reads "12h30, 05:00 → 17:30 (last landing 15:30 + 2h debrief assumed)".
3. Publish Friday and sign all four.
4. On the Logic page, change the default rally from 180 to 120.
5. The issued face still shows the 12h30 note. Today's judgement of the issued day raises no note: 06:00 → 17:30 is 11h30.
6. The day now has a `warn` pending item ("Warnings on this day changed") and its sign-offs fall (`daySigned` false). Insights moves at once.

**Contrast:** the same day with "05:00 IN TIME" typed shows nothing pending after the same Logic change.

**Cause:** LONGDAY is a frozen warning (not in `LIVE_ON_FACE`), and the official pass is the detector (`publish.ts warnDelta`). It runs today's code with today's settings. Since D1786 the default rally moves the long day, so it is now a Logic setting that can make a published weekday pending and drop its sign-offs. Before, it could do that only through OIL on weekends and holidays.

This behaviour is what D179 and D103 call for. `latepub.test.tsx` already pins the same thing for a "Long work day" change. Only the document is wrong.

The same mechanism will make every day published before this build with such a line read pending once the note changes. Under D56 that is stored data, so not a finding — but worth one line to him.

**Fix:**
1. Rewrite the bullet. Suggested words: "the face keeps the note it went out with until its next amendment; today's judgement of the issued day is the detector, so where the note changes — a change of the default rally on the Logic page, or this build reaching a day published before it — the day reads one pending change, 'Warnings on this day changed', and its four sign-offs fall (D179, D103), as latepub.test.tsx pins for a Long work day change; Insights moves at once (D482)."
2. Pin it in `daystart-default-rally.test.ts` or `latepub.test.tsx`, using the setup above:
   - publish and sign all four, then set `VCONF.reportLead = 120` and validate;
   - expect `officialWarn()` to still carry the 12h30 note;
   - expect `dayPendingItems(4)` to contain a `warn` item and `daySigned(4)` to be false;
   - in the contrast case with an in-time typed, expect no `warn` item.
3. In the closing report, answer the D1786 cost point "a long-day note new on a published day is checked against D179": it freezes on the face, reads pending, and the four sign-offs fall.

### F2 · Low · `events.ts buildDay` and `validate.ts workSpan`, as briefed (efa9445b8) — a line with no landing
**What goes wrong:** take-off 12:00, landing blank, nothing entered. `workSpan` gave 09:00 → 14:00 (300 minutes). `fltOilWin` gave null, so OIL counts nothing. Before D1786 the span was 3h, from the step.

**Cause:** `ldM = toMin(f.ld||f.to)` borrows the take-off as the landing.

So the doc's "the same start as OIL's fltOilWin, case for case" was not true for an unfinished line. The builder's "in every case" test left this case out.

**Status:** cbdeaecb9 appears to address it (its message names exactly this). That commit is outside my brief and I only glanced at it. Make sure its test pins Insights as well as `workSpan`, and that the engine-rules account names the unfinished line.

## Checked and found whole
**Every reader of a sortie event's report:**
- `workSpan` handles null.
- `validate.ts` SC_INTIME (around line 829) checks shifts only.
- `restIfPlaced` clones a sibling event, but crew rest reads `day.fly` plus non-flying events only.
- `crowdClashes`, NO_BRIEF and DEBRIEF read brief and landing only.
- The clash loop reads step, dekit, take-off and landing.
- The prior-day ends read landing plus debrief.
- The `avail.ts` busy and row checks read the event's start, end and slot.
- `weekctx` seeds use events only for who is on and when they finish.
- AvailWindow's issued-face flags go through `crowdClashes`.
- Neither the probe bridge nor any browser test or probe reads report.
- Nothing else meets null.

**Unchanged:** the SANS window (`day.fly`, the earlier of report and step), the availability window (step to dekit, D36), crew rest, the tight advisory (nominal is still take-off less the default rally), and OIL.

**One start:** these cases match `fltOilWin`:
- nothing entered;
- an in-time earlier or later than the default;
- a rally box later than the step;
- a typed RALLY line;
- an unreadable clock (8h00) and words with no clock;
- an evening-before clock;
- a take-off after midnight (the default rally falls the evening before);
- the same take-off and landing;
- a formation-specific in-time (same `resolveReporting`);
- a standby row that flies (a shift, `scReport` on both sides);
- a late-show remark (neither side reads it);
- a Logic value below the step or zero.

On a published day after a Logic change, OIL keeps its kept lead (D592(4)) while Insights takes today's (D482). The rulings allow that.

**Pre-existing, not this change:** a take-off stored without its colon ("1200") reads NaN in events but 720 in OIL. The write paths normalise times.

**Second demo week (information, not a finding):** week 2 (20–26 Jul) has 8 seats with nothing entered:
- Tue RU, because wave 1's in-time line names VL only: prism, nick, bapster and bullet go from 08:00 to 06:00.
- Wed wave 1 VL: pump, dirty, bruise and rocky go from 09:00 to 07:00.

Each is +2h in Insights for that week, and no new long-day note appears. "Only the one line made for this question moves" holds for week 1 only. Tell the walk and his look to expect this.

**Parity (observation, no failure):** the seed has no line with nothing entered, so parity passes. The reference is not mirrored. The house precedent (rering / turnring) mirrors even when the seed never fires. A one-line refwin swap would make a future fixture safe: `events.push({id,s:stepM,e:dekitM,to:toM,ld:ldM,report,` → `report:intime,`. Today a fixture would fail loudly, not silently.

**Words:** the default rally row is true for every value 0–480 (D932). I found no other Logic, Help or code-comment line saying the long day or the hours start at the step:
- "Half days: a sortie counts from its step" is about clashes, and the event still opens at the step.
- The Long work day row and the Insights heading are fine.
- The `workSpan` and long-day block comments are now accurate.

**Tests run, one file at a time, all green:** daystart-default-rally, parity, rally-workspan, rally-consumers, html, insights, longday-msg, warnhide, scintime, brieftime, oilworkstart (engine, Leave War, ui), ruleflex, validate, rallybox, rally-dated-rest, logic, oilflighttimes, restblank, latepub, insights-published, audit-c-gaps, personnel, crossweek, weekctx, official-flags. `rulecheck` passes.

**Not run** (the lock rules): the full suite, the build, browser tests, `tfin.js`. `tfin.js` runs against the untouched reference only, so this change cannot move it.

Read-only review completed
Rulings: none this session

---

## Disposition (chat 6, 8 Nov 26)

- **Housekeeping:** the swept-in proof file is taken out of the branch in the next commit; it was never pushed.
- **F1:** right, and the same as Astra's and Sol 6.1's — `engine-rules.md` corrected; pinned in
  `engine/daystart-default-rally.test.ts` (publish at a 1h default rally, change to 3h: the issued face keeps no note, one
  change waiting, sign-offs fall, Insights +2h; put back: nothing waits), with the contrast case (an in-time typed:
  nothing waits). The owner is told the published-day consequence in plain words.
- **F2:** fixed in cbdeaecb9 and the commit after it (no landing, and no take-off, both counted nowhere), pinned there; the
  engine-rules account names the unfinished line.
- **Second demo week:** passed to his look — eight seats there count two hours more in Insights; no new long-day note.
- **Parity:** mirrored — `testing/refwin.ts redaystart` swaps the reference's sortie event to `report:shiftLine?report:intime`
  (the core only); parity, html, the input wiring and the AAR tests green.
