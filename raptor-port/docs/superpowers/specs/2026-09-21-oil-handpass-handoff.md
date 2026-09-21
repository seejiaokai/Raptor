# HANDOFF — execute the two scenario lists (21 Sep 26, late)

**Branch `claude/oil-auto-remove-design`, PR #424. Nothing merged. Holding for the owner's
"merge live".** The previous session's handoff is `2026-09-21-oil-build-handoff.md`; this one
replaces it as the current state.

## Read these, in this order, and nothing else first

1. **`raptor-port/docs/bug-check-order.md`** — the ADOPTED standing order for how this project
   bug-checks. It is new, the owner adopted it tonight, and it tells you what to do and in what
   order. `.claude/rules/bug-check.md` makes it trigger on its own.
2. **`2026-09-21-oil-bugcheck-fixplan.md`** — what was wrong and what was fixed, including the
   part the reviews missed and why.
3. The two scenario lists — **`2026-09-21-oil-scenarios-fable.md`** (44 scenarios, ranked) and
   **`2026-09-21-oil-scenarios-codex.md`** (24, ranked). **This is the job.**

## THE JOB: execute both scenario lists in the running app

The owner's instruction: *"ask fable and codex to think through all the possible scenarios to test
for bugs and opus be the executor"*. They designed; you execute. Drive the built app in a real
browser — do not re-read the code and call it done. That is the mistake this whole session exists
to correct.

**Start from the merged list, not from either file alone.** They overlap heavily; Fable's S1–S12
and Codex's 1–3 are the same ground. Dedupe first, then work down by rank.

**Already executed by hand, and passing — do NOT redo:**

- every surface that draws a puck, on the board AND the week: flying lines, SC MAIN, SC SPARE,
  AVALON line and desk, Common Programme, Ground Programme, ⓘ row, both desk kinds, the ALL AVAIL
  sentinel. All wear the strip where they should and none where they should not.
- the mode's tappability across all of those, and every event's name-switch.
- a man on an earning row and an ⓘ row at once (the owner's original O-1 complaint).
- undo and redo of an OIL decision, through the real buttons.
- publishing a day through the real sign-off selects and Publish day button.
- **R-1 forward, end to end through real doors:** published a Wednesday as an ordinary day →
  declared 15 Jul a public holiday on the Leave War grid → nobody paid, and the day says *"This day
  started earning OIL after it was published — publish it again so the OIL lands"* → re-signed,
  published AL1 → the man is paid FO and the message goes.

**Highest value still to do** (Fable's own ranking, minus what is done): S4 the pending-bar
question (is there anything telling a scheduler the bar he sees is not yet in force?), S5 a second
man on a member's input row, S10 the frozen-versus-live sentinel membership after a member files
leave, S6 a sentinel planted somewhere it cannot expand, S25 templates dropping decisions
silently, S35 the stuck-mode family. Then Block B onwards — ordered gestures, retraction, publish
and amend paths, the edges of the measure.

## What changed tonight, in one place

Commit `b3d8ee8`. Ten defects from the cross-provider check plus four the owner found by opening
the app, plus his O-1 ruling. The engine-rules and ui-contracts sections are updated; the register
carries OIL21 revised and OIL21a/OIL21b added; the rulecheck table tracks them.

**The root cause worth remembering:** the app draws a puck in six places and only some were wired
to this feature. Every call site is now enumerated and decided. The tests walk the seat KINDS on
both surfaces, and each was checked red before its fix.

## Two things the owner has NOT answered

1. **Fable S4's judgement call** — on a published day, an OIL decision not yet published changes
   the bar on the scheduler's own screen while the Leave War still pays the issued figure. Nothing
   on the puck says "pending". A typed edit gets a dotted amendment mark; an OIL decision gets only
   the day's aggregate "1 change". Put it to him with a recommendation once you have seen it.
2. **Fable's Appendix D** lists eight places that draw a man and pass no OIL mark. Most are plainly
   right (a crew picker is not a day; a SANS offer is never work). Each still needs its one written
   line, so a deliberate absence and a hole stop looking alike. Note that its entry for the week's
   Personal Inputs / Unavailable puck is already FIXED — the list was written before that commit.

## Gates at this commit

5350 unit · build · parity 728/0 · rulecheck OK · tracker smoke 425/0 · **e2e 446 passed, 1 failed.**

**The one e2e failure, stated honestly rather than waved through.** It is
`e2e/leavewar.spec.ts:4301` — "the bottom scrollbar is a year-wide scrubber" — a Leave War GRID
test, in an area this branch does not touch. What was actually observed tonight, in three runs:
full run → 1 failed (this one); full run again later → 5 failed (this one plus four Leave War
figures-drawer tests); a focused re-run of only the Leave War projects → **287 passed, 0 failed**.
So it passes in isolation and fails under the full parallel load, and the four others were plain
load flakiness.

**Do not report this as "flaky, ignore it" without doing the one check nobody did:** run
`npx playwright test e2e/leavewar.spec.ts --project=lw-desktop` on `main` under the same full-suite
load and see whether it fails there too. If it does, it is pre-existing and belongs in
`OUTSTANDING.md`, not in this branch's report. If it does not, it is ours and must be found. It is
recorded here precisely because assuming would be the same mistake this session exists to correct.

## Standing rules that bit this session, so they do not bite again

- A code review plus green tests is **not** a bug check. Two frontier models passed this build; the
  owner found three defects by opening the app.
- A test that mentions a ruling it does not actually prove makes the coverage gate lie. One was
  caught and renamed tonight.
- A fixture must be built the way the app builds it. A hand-made AVALON wave is not a standalone
  wave, and a test using one checks a different program.
- Verify a test fails **before** the fix. Both new seat-kind tests were checked that way.
