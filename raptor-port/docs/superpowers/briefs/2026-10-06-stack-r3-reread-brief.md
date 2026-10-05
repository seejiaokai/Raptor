# The re-read of the third round's fixes — 6 Oct 26

*(One brief, word for word, for two readers who work apart — D590, D601. Do not open the other reader's report, nor the
first round's reports (`raptor-port/docs/handpass/2026-10-06-stack-r3-read-*.md`) of the OTHER reader; your own first
report you may read. Not to be edited after the reads start. This is the second and LAST read of this round.)*

You read three changes Opus 5.5 built (`raptor-port/docs/superpowers/briefs/2026-10-06-stack-r3-read-brief.md`). Both
readers, apart, found the same fault: the Tab that keeps the caret in a day's last box no longer let the Scheduler Board
bring its held panel up to date. That is fixed, and two small filed faults of the Blue/Red question were fixed with it.
Read the fixes as the reviewer who did not write them. READ-ONLY: change nothing, run no build, test or server.

## What changed

`git diff c0eff959 HEAD -- raptor-port/src raptor-port/e2e` (the commit after the first brief, to the tip of
`claude/codex-stack-review`):

1. **The finding.** `raptor-port/src/ui/schedule-tab.ts`, the branch for "no next box and no control after it, going
   forward": after the blur and its checks, the page's redraw is carried through at once —
   `flushSync(() => notify())` from `react-dom` — while the caret is out of the box; then the same window / scope /
   "something else took the focus" checks again; then the box (or its twin after the redraw, or the day's last box) is
   focused and the caret put at the end. The `notify()` that used to follow the refocus is gone.
   Tests: `e2e/schedule-tab.spec.ts` "D597 the last box's Tab still brings the day up to date …" (the phone's board —
   red on the build you read: area time `1240-1405`); `src/ui/schedule-tab.test.tsx` "D597 with Flying last on the day
   …" and the existing "week settles derived display … final Tab" (both go red with the `flushSync` line taken out).
2. **`[ROLE-BLANK-CALLSIGN]`.** A line with no callsign was named by its hidden row code in the Blue/Red question, in
   Undo and in History. `src/state/mission-roles.ts` (the target's `name` falls back to "Line") and
   `src/state/changelines.ts` (the copy's fallback). Test: `mission-role-interim-fixes.test.tsx` "ROLE-BLANK-CALLSIGN …".
3. **`[ROLE-BUTTON-AFTER-ANSWER]`.** After Blue, Red or Later, with the caret still in that Remarks box, nothing was
   offered until he clicked out and back in. `src/ui/mission-role-offer.ts` `offerForFocus()`, called after Later, after
   a saved answer, and where a stale button is removed. Test: "ROLE-BUTTON-AFTER-ANSWER …"; and TWO older expectations
   changed with it — `src/ui/mission-role-offer.test.tsx` (the `MIX6 R1 … saves dirty Remarks before role action`
   family: "no mission-role control at all after the action" became "no question; the button is back, worded Choose
   after Later and Change after an answer") and the last lines of `W9 …` in `mission-role-interim-fixes.test.tsx`.
4. `src/ui/flagglow-css.test.ts`: the two expectations that spell out the dotted ring's stylesheet text now carry
   `var(--dot-w,1.5px)`.

The walk, re-run on this code with the fix round's steps added (R3-19 to R3-24), 50 steps at desktop and phone size:
`raptor-port/docs/img/handpass/2026-10-06-codex-stack-r3/result.md`.

## What to answer

**A. Is the finding fixed, everywhere it lived?** The board at phone width; the week with the stale box and the last
box in one section; a published day; a day whose last box the redraw removes or replaces. Does carrying the redraw
through inside a key handler do anything it should not — a second save, a history entry, a validation that changes what
is stored, a loop, a redraw under a caret that some OTHER code has just placed (a window opened by the save), a lost
scroll position, an error from React when called at that moment? Is the caret put back in the right box when the redraw
has replaced it — and never in a box of another day or a box that is not his to type in?

**B. The two small fixes.** Can "Line" now name two different lines confusingly where the row code told them apart —
and does anything read `name` as an identity? Can `offerForFocus` draw a button where the rulings say none belongs: under
a formation whose question is open; on a published look; for a member; with tracking Off; on a box that is not a
Remarks box; twice?

**C. The changed expectations.** For each older test whose expectation changed (item 3 and item 4): is the new
expectation what the rulings ask (D527, D529 — "show a temporary button while its Remarks box is being edited"), no
looser than the old one, and does it still catch what the old one caught?

## What is NOT a finding

As in the first brief: a problem that lives only in data already stored (D56); a fault that is the same on `main` and
that these changes neither made nor touched (one line under "Older"); style; and any claim without a concrete failure —
steps → what happens → what should, and which ruling → cause with file and line → the exact fix (D489).

## The report

Your final message is the report: **1. Findings** (or "none"); **2. Checked and sound**; **3. Older, not this change**;
**4. What I did not check.** State a verdict in the first line: PASS, or CHANGES REQUIRED.
