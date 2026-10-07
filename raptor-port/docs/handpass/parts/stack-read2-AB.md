# Stack read, second pass — piece AB (Discard marks removed · In-time / Rally and work hours) — 6 Oct 26

Reader: Opus 5.5, under `docs/superpowers/briefs/2026-10-06-codex-stack-read-pass2-brief.md`. READ ONLY — this file is the one
thing created. Code read at `eb8fd4d6`; `main` = `de470db5`. Nothing was run: every finding is read off the code and still
needs its red test.

## 1. Findings

**F1 — A man seated on a flying line with no take-off loses his crew-rest check (W4's kind; OLD on `main`). Medium.**
- *Steps.* Mon: X on a line landing 22:30. Tue: X on a line taking off 07:00 → red "Crew rest breach", ring, Monday's dotted
  mark. Now Tue "+ Line" (it comes up blank) and put X in its seat. Expected: the breach stays (D185). By the code the
  warning, the ring and the dotted mark all go. Second way: the blank crewed line on MONDAY, in a wave drawn before his
  22:30 landing → Tuesday's breach is never raised.
- *Cause.* `engine/validate.ts`: a blank line's event carries not-a-number times (`events.ts:269–270`). Today: `nomOf`/`insOf`
  (l.500, l.517) give NaN, `Math.min.apply` over his legs (l.534–535) is NaN, both tests (l.572, l.626) are false.
  Yesterday: l.457–461 keeps the NaN end when it is his first event; l.528 then returns. The same-day tight turn
  (l.685–687, sort and adjacent pairs) can miss a turn the same way.
- *`main`:* the same (its l.477, 488, 494). W4/RF1 fixed only the work-hours reader of that event.
- *Fix.* (1) l.458 `if(rawEnd==null||!isFinite(rawEnd))return;` (2) l.498 build `byR` only from legs with a finite `to`;
  (3) in the tight-turn loop only (l.685) pair the legs with a finite `to` — leave `dturns`, which counts a timeless leg on
  purpose (l.674); (4) tests: the breach stands with a blank crewed line on either day, either wave order.

**F2 — The red explanation under the lines goes stale when a take-off, brief or callsign is committed by Tab (W16's kind;
NEW). Low–medium.**
- *Steps.* Edit Schedule, a wave with `08:00H: IN TIME`, VL take-off 12:00. Click VL's take-off, type `0900`, Tab. The warning
  list gains "VL: in-time 08:00 is later than suggested brief 06:40" at once (W15); the explanation under the lines stays
  empty until the caret leaves the flying section (week) or panel (board). The reverse too: fix the take-off and the red
  sentence stays. D509: "explained while editing".
- *Cause.* The sentence is written only by a redraw of its block or by a reporting line's own input/blur
  (`ui/textedit.ts:51–61, 166, 183`). The caret's block is held (`dayswap.ts swapDayAround`; `SchedBoard.tsx` `put`);
  `refreshWaveReports` (`ui/html.ts:1203`) corrects the header only.
- *`main`:* cannot happen (no explanation line, no Tab route).
- *Fix.* In `refreshWaveReports`, for every `.intimes[data-intimes]` that does not hold `document.activeElement`, set its
  `[data-reporting-feedback]` `textContent` to `reportingIssuesForWave(w,gi)` — text only, as W16. Test beside "W16".

**F3 — "To go out" words an edited reporting line "2 In-time / Rally lines → 2 In-time / Rally lines" (W11's kind; OLD).
Low–medium.**
- *Steps.* Published day, change a line's clock 08:00 → 07:00, open "1 pending" → To go out. Both walks changed the COUNT
  (L-05, "2 → 1"); nobody edited without it.
- *Cause.* `ui/pendlist.ts:92` words the lines by count; l.311 uses it for both sides. All changes shows the real text.
- *`main`:* the same ("2 in-times → 2 in-times"). It matters more now that the line sets the report and the day.
- *Fix.* In `pendItemWords` (`kind==='change'`, an `it:` address) parse both lists: `from` = lines only in the old one, `to` =
  lines only in the new, joined " / "; counts when one side is empty. Test in `ui/intimesadd.test.tsx`.

**F4 — On the Scheduler Board a reporting-line change in the changes window is not a button (a door the roll-call lacks; OLD).
Low.** `ui/histbubble.ts:168` still lists `it` among details the board does not draw; the board draws the block with its
address (`board.ts:182`, `keyOf` l.198) and the warning list already jumps there. Fix: drop `'it'` from `NO_BOARD_CELL`,
correct the comments (there, `ChangesWindow.tsx:81`), one test.

## 2. A — absences

- A8, A9, A12: read — no caller, phrase or permission row left in `src`, `e2e`, `probes`.
- A10: sound — none of those screens reads a draft day's marks; untouched.
- B11 pucks: sound — both warnings are filed with no person (`validate.ts:661`).
- B17 / R3 pre-drop line: sound — the probe runs the one crew-rest body over the same four days; the empty-formation gap
  is filed (`[REST-FIRST-CREW-HINT]`).
- B22, B23: sound — a wave's lines are read only by `reporting.ts`, the two builders, the two edit handlers and the pending
  diff (`restore.ts:68`).
- R4 SANS: one shared body; the previous-evening case is filed (`[SANS-PREVIOUS-REPORT-OFFER]`).
- R5 SC in-time: `seatIntime`'s SC branch is `main`'s, character for character.
- R11, R12: unchanged arithmetic; with the midnight shortcut gone a small-hours take-off can raise the amber tight-turn
  note where `main` was silent — the rule applied correctly.
- R15: sound — live values; row 61 matches what the button does (§12 question 4).
- B7 / A5 peek, B12 print and CSV: sound as code. The first pass's question — should print show an evening-before report —
  is NOT on §12's list; still open, low.
- D2: the same `markEdit` + `afterSchedMutate` route as the walked edit.
- Not on the roll-call: F4; wave templates mint no lines (`wavetpl.ts:242`) — sound.

## 3. B — siblings

- Wording (W6): after "+" or ✕ Undo reads "a change to the schedule", after a typed edit "an In-time / Rally line" (walker
  M's row; `interactions.ts:745, 783` record no key). Low. Searched every shipped string for the old name: none.
- A key that does not persist (W8): searched — lines addressed by wave, hides by their words (`warnhide.ts:20`): none.
- Returns before it looks (W5): `reportingIssuesForWave` is quiet when every line of a wave is CANCELLED (RF5b covers only
  "no lines"), while `waveInTime` covers both. Defensible; noted.
- One spelling, not another (W3, W19): the promised spellings (`remarks-vocabulary.md`) all resolve. Old: the FIRST
  clock-like token wins — `RM 204 0800H IN TIME` reads 02:04, on `main` too.
- Redraw held under the caret (W15, W16): F2.
- Not-a-number (W4, RF1): F1. Searched bands, header, button, order check, Insights: none.
- A published figure moved by Logic (W1): searched `reportLead`, `briefLead`, `debrief` — only the ruled-live ones (D188,
  D482) and W1.
- Before and after the same (W11): F3. A Tab pass through an untouched line writes nothing (`textedit.ts:176`).

## 4. C — the fixes in this piece

- `engine/reporting.ts`: W3 sound. W19: a clockless note holding `1330Z` or `29.92` now gets the amber line — harmless.
  RF5: with several unnamed new lines the explanation repeats one sentence per line ("WAVE 1: reporting line 1 has no
  recognised clock." ×3); the list dedupes (`validate.ts:656`) — dedupe where the three callers join. Cosmetic, new.
- `engine/events.ts` (W5): sound — a no-take-off formation supplies the header only when nothing gives an earlier time.
- `engine/validate.ts` (W4, RF1): sound for work hours; leaves F1.
- `engine/rules.ts`, `Shell.tsx`, `LogicPage.tsx` (W2): sound; "2 off standard" beside "1 rule changed" is intended.
- `ui/html.ts`, `ui/board.ts` (W16): sound — text nodes only; read-only looks carry no drag address. Leaves F2.
- `editlog.ts`, `pendlist.ts`, `changesmodel.ts`, `interactions.ts`, `undo/describe.ts` (W6): one name; nothing parses the
  old words. Leaves F3.

## 5. Not read, and how sure

Not read: tests, CSS, `weekctx.ts` internals, `leavewar/` (W1 is filed), `reorder.ts`, the Tab route itself (D2's). Fairly sure
of F1 and F3 (plain arithmetic, one string path); F2 rests on the redraw grain read in `dayswap.ts` and `SchedBoard.tsx` — one
run of its steps settles it.
