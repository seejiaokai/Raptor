# [WARN-WORDS-STANDALONE] — the code read's brief (chat 83's builder, 16 Nov 26)

The ONE brief for both blind code reads of the job (`docs/bug-check-order.md` §4, §4a; D790, D1770): Astra (Codex), and a
fresh Opus reader. Same words to each; neither sees the walk's report, the builder's report or the other's. Each runs in
an exported copy, `C:/Users/User/www-read` — the branch `claude/warn-words-standalone` at the commit named in the
copy's `READ-COMMIT.txt`, without the job's documents, reports, plans, briefs or pictures. The job's app diff against
`main`: `JOB-DIFF.patch` at that folder's root.

## The brief, as sent

You are a blind code reader of a finished change to a flying-schedule app (React + a rules engine), working in the folder
`C:/Users/User/www-read` only. Do not open anything outside it — the project's live checkout holds other readers'
reports and the walk's results, and your read must be blind to them. If, after a compaction of your own context, a
"handoff" block is pasted into your chat, do not read it, and name that in your report.

**The change** (`JOB-DIFF.patch`; the files under `raptor-port/src`). His rulings' full rows are in
`.claude/decisions-full/scheduler.md` and `oil.md` (search `^| D2046 |` and so on); the area pages
`.claude/rules/decisions/scheduler.md` and `oil.md` state them as they stand. Three pieces:
1. **Every warning reads on its own** (D2045, D2048, D2050, D2058–D2065, D2068–D2071, D2054, D2067; the approved words
   in `raptor-port/docs/superpowers/specs/2026-11-15-warn-words-standalone.md` §3c–§3g, which overrule its earlier
   sections). Every line the rules engine writes names who, which items, their times and why; "Conflict:" for "Clash:";
   a conflict between a flight and another item names the end of the flight that causes it (step / T/O–landing / dekit)
   by the Logic step and dekit settings; the pending list's OIL note says what moved and whether OIL changed; the Logic
   note one sentence. A conflict's hide is keyed on its two items (D2001), a request's on its words (D2018).
2. **The assumed landing** (D2046, D2047, D2053; D1990, D2010, D2022 corrected): a flight with a take-off and no landing
   typed (blank or "TBD") lands `VCONF.fltLen` (a new Logic setting, 60 min) after take-off, for every check that reads
   the landing — conflicts, the tight turn, the debrief, crew rest, the long day, Insights' hours, OIL's worked times
   (*the builder's reading of "every check"*), and who is free (the crew list's and ALL AVAIL's busy windows). A
   published day keeps the setting it went out with (D2005, `KEPT_RULE_KEYS`) and its OIL keeps it as a fourth kept value
   (D2044, `OilRuleVals.fltLen`); a change reads pending only where it would change that day's OIL.
3. **D2055:** a standby shift with START typed and END blank is left out of crew rest until END is typed (`noEnd`); its
   own warning stays. *The builder's reading:* the same for a shift that flies.

**Do not merely review the changed code.** Starting from the user promise and the applicable rulings, enumerate every
qualifying object, renderer, visible door, writer, reader, downstream consumer, role, overlay and meaningful order of
actions. **Assume every existing line may be correct and the defect may be a MISSING call site.** For each item, state
where the visible sign and the working gesture should exist in the production app. Then rank concrete failure scenarios
with setup, action, expected result, and the observation that would disprove correctness. Start with the least-shared or
most specialised surface.

In particular: every reader of a formation's landing (`ld`) that computes it by itself instead of reading the events'
`ldM` — `src/engine/`, `src/ui/`, `src/state/`, `src/leavewar/` (the OIL tracker, the Leave War's cells and sync), the
reference side's words (`refwin.ts` and the parity test — the reference's crew-rest tail still says "took off … with no
landing typed": is any path of the app's own text still reaching it?); every path that sets, resets and reads `noLd`,
`noEnd` and `prevFlyNoLd` (flights, standby lines that fly, SC shifts, duty inputs, the week before, a published
neighbour); every place a published day's kept settings are read (`KEPT_RULE_KEYS`, `oilKeptVals`, `oilValsSame`,
`oilRvBoundOk`, the pending list's `OIL_VALS`) — and the published-day OIL test
(`src/leavewar/assumedlanding-published.test.ts`), written after the engine change and never seen red on its own: does
it really fail if the kept `fltLen` is dropped?; every drawer of the warning sentence (`escMsg` and the builders that
should call it) and of the checks' short names (`WCODE`, `CHIP_LABEL`, the Logic page, Insights); the hide's key; the
drop note (`state/dropflag.ts`).

**What is NOT a finding (owner, D56):** This app is pre-promulgation and its entire stored world is DEMO DATA that will
be CLEARED before the database step. **Do not report a problem whose harm exists only in data already stored when the
code is already correct going forward** — no migration, no back-compat, no "an existing record would read wrongly", no
"a hide stored before the rewording comes back once", no "a published day's frozen list carries the old words". If the
app would do it again to NEW data, report it: that is a real finding and this exclusion does not touch it. Also not a
finding: anything about a scheduler who is not an admin (D785) — a scheduler is always an admin.

**What to hand back** — one report, in plain text, saved where your run's instructions say:
- each finding: the concrete failure (setup → action → what the screen shows), its cause (file and line), whether it is
  NEW in this change or older (compare with `main`'s code in the patch's minus lines), and **exact, step-by-step fix
  instructions** — not a direction;
- **explicit negatives:** every place you checked and found right ("I checked X and found nothing");
- you cannot run the app here: for any claim that needs a run, name the exact input (the day, the times, the people, the
  clicks) or the exact unit test you would write, and the host will run it. Write no file anywhere except your one
  report.
