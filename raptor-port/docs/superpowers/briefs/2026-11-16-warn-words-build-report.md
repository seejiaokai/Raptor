# The builder's report — [WARN-WORDS-STANDALONE], the build stage (the night of 16 Nov 26, chat 83)

Saved by the night's coordinator the moment it arrived (about 01:58), as the builder returned it, condensed only in
layout. The builder's brief: `2026-11-16-warn-words-build-brief.md` (this folder). Not a reader's report — the walk and
the reads come after.

## 1. What is built — all three pieces
- **A, the approved words:** commit `3b126098c`.
- **B, the assumed landing (D2046, D2047, D2053):** a new Logic setting "A flight" (`VCONF.fltLen`), 60 min to start,
  bounds 15–480, its row under "Rows with no end time", before "A sim". Read by: the conflict window from step to dekit,
  the tight turn, the debrief, crew rest, the long day and Insights' hours, OIL, and the crew list's and ALL AVAIL's busy
  windows. Readers, each with its test in `engine/assumedlanding.test.ts`: `events.ts` `ldM` / `noLd` (tight turn,
  debrief, conflict, crew rest, long day); `validate.ts` `workSpan` (long day, Insights); `oil.ts` `fltOilWin` /
  `dayOilWork` / `dayOilBlind` (`dayOilSpans`); `avail.ts` `personBusy`, `slotRules`. Kept by a published day: in
  `KEPT_RULE_KEYS` (D2005) and as a fourth kept OIL value (D2044); test `leavewar/assumedlanding-published.test.ts`.
- **C, D2055:** a standby shift with START typed and END blank gets `noEnd`; crew rest skips it, flying or not; its
  SA_FLY_NO_TIME warning stays. B and C are one commit (they share `events.ts` and `validate.ts`).

## 2. Commits, pushed
`3b126098c` (A) · `43af4f51e` (B and C), on `claude/warn-words-standalone`.

## 3. Tests
- New `engine/assumedlanding.test.ts`, 20 tests: the 17 of B seen red first (14 failed; one harness fix — `validate()`
  before `workSpan`); the 3 of C seen red (2 failed; the third the control, END typed, passes both sides).
- New `leavewar/assumedlanding-published.test.ts`, 7 tests — **NOT seen red on its own** (written after the OIL change).
- Changed on purpose, each with a comment naming its ruling: rulescheck-batch2 part 2 ×2 and part 2b ×2 (2b's ground row
  moved to 13:40, past the dekit); rulesfirst-3-crew-rest W35 ×2 (D1936 → D2053; D1990 → the assumed landing; the edge
  moved to 23:00 + 12h); daystart-default-rally (the D1936 test); oilflighttimes ("take-off, no landing" no longer named);
  oilworkstart OWS5 (split, a new case); oilworkstart-published ×2 (the kept block has `fltLen: 60`); logic.test D1990,
  D1997, D932 (`fltLen` added to its keys — the guard caught the new "1h") and a new "A flight" row test;
  oilscreenwords; schema.test RULEVALS (`fltLen` optional).
- Full unit suite under the lock: 838 files, 14,507 passed, 20 skipped. Build OK (one type fix in `avail.ts`).
  rulecheck OK, docsize OK, lint:changed no new finding.

## 4. The original's 728 and the parity test
- `node reference/tfin.js`: 728 passed, 0 failed. `parity.test.ts` green — its seed has no blank landing, so the
  reference side's string (`refwin.ts` rebrief, still "took off … with no landing typed") is never compared on this case.
- A new key `fltLen`, not the reference's unused `dur` (85), so the reference stays untouched.

## 5. Wordings the build settled, old → new
- Crew rest: "Monday took off 12:00 with no landing typed + 2h debrief (assumed) → ended 14:00 → clear 02:00" →
  "Monday landing assumed 13:00 (T/O + 1h) + 2h debrief (assumed) → ended 15:00 → clear 03:00".
- Tight turn: "… 60 min … VL BFM landing assumed 09:00 …" (the take-off) → "Tight turn: VL BFM → RU BFM, 0 min (needs
  90). VL BFM landing assumed 13:00 (T/O + 1h), RU BFM T/O 13:00".
- Debrief: "Misses VL BFM debrief 12:00–14:00 (landing assumed): …" → "Misses VL BFM debrief 13:00–15:00 (landing
  assumed): BRIEFING …".
- Conflict: "Conflict: VL BFM (landing assumed 13:00, dekit to 13:30) & BRIEFING 13:10–13:20" (the flight first, as the
  engine writes it).
- Long day: "(last landing 12:00 + 2h debrief assumed)" → "(last landing assumed 19:00 (T/O + 1h) + 2h debrief assumed)".
- **The Logic row "A flight":** "A flight with a take-off and no landing is taken to land this long after take-off.
  Clashes, the tight turn, the debrief, crew rest, the long day, OIL and Insights hours count to that landing, and its
  warnings say it was assumed."
- Pending-list label: "Logic · A flight with no landing typed".
- Crew rest's "How it works" line 2 ends: "…or, where no landing is typed, at the assumed landing (A flight, 1h after
  take-off) plus the debrief." OIL's "How it works" adds "With no landing typed, it lands at its assumed landing (A
  flight)."; the next line starts "Any other row the scheduler adds with no times…".
- D2046's own words were "assumed it landed 13:00 (take-off + 1h)"; the build uses the approved words' shape, "landing
  assumed X (T/O + N)", so every line reads alike.

## 6. Decisions and why
- A new key `fltLen` (reference and parity untouched).
- A published day keeps `fltLen` (D2005); its OIL keeps it as a fourth value (D2044), so a change reads one pending OIL
  line only where it would move someone's OIL; an older block without it reads today's value and raises nothing (D56).
- OIL reads the assumed landing — the builder's reading of "every check" (D2046) and D2053.
- A flight with a take-off and no landing is no longer named in "no usable times", since it now earns.
- The crew list and ALL AVAIL busy windows use the assumed landing, so the picker agrees with the conflict list (D2059).
- A standby shift's blank END is never assumed: D2055 changes crew rest only; its clash window and the crew list still
  read START to START, as before.
- D2013 unchanged: once anything waits on a published day, today's setting is used.

## 7. Points for him (the builder's "questions truly his")
- (a) OIL reads the assumed landing — a Saturday flight, take-off 10:00, landing blank: before, it earned nothing and was
  named "no usable times"; now half a day, 07:00–13:00 (a full day if "A flight" is set to 90 min). Recommended: keep.
  Built; reverted in one place if he says. *(The coordinator's note: D2046's full row and the backlog item already name
  OIL among the checks that read the assumed landing — shown to him as built, not held as an open question.)*
- (b) The Logic row's words, and "landing assumed 13:00 (T/O + 1h)" in place of D2046's "assumed it landed 13:00
  (take-off + 1h)" — shown to him with real pictures. Recommended: the short form, matching the approved words.
- (c) D2055 for a shift that flies: built the same as one that does not (the builder's reading).

## 8. What the walk must cover (also in the evidence sheet, "For the walk")
- A weekday flight with a take-off and a blank landing, then "TBD": every line names the assumed landing; typing a
  landing reverts each one.
- The Logic "A flight" row: change it to 90, the lines move, Reset; its out-of-bounds note.
- A published weekend day with such a flight: change "A flight" → one pending OIL line, sign-offs down → publish AL1 →
  the Leave War's FO/HO follows.
- The crew list and ALL AVAIL on a seat inside the assumed window.
- A Monday SC, and a flying SC, with START set and END blank: no crew rest Tuesday, "flies but has no END" still shown;
  END typed and the rest returns.
- The roll-call rows added for B and C: the Logic row, the busy windows, OIL Earn, the Leave War.

## 9. Found and not fixed
- `refwin.ts` rebrief (the reference side's crew-rest tail) still prints "took off … with no landing typed"; the parity
  seed never reaches it — for the reads.
- OIL's "How it works" comment says "exactly four" lines; there are more (older).
- `OUTSTANDING.md` 11 lines over its tripwire, from `main`.
- The evidence sheet's roll-call cells are still blank, for the walk.

Rulings: none this stage · Walk: none yet · Lessons added: none · Status: ready for the walk and the reads.
