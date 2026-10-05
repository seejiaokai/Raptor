# An independent read of the fix round — the Codex stack check (D589) — 6 Oct 26

*(The same brief, word for word, goes to two reviewers who work apart — Astra and Sol 6.1 (D590). Do not open the other
reviewer's report: any file named `2026-10-06-codex-stack-fix-read-*.md` other than this brief, or any
`2026-10-06-insights-fixes-read-*.md`. Do not open `docs/handpass/parts/stk2-*` — a walk of the running app is in
progress there and is not yours to read.)*

**You did not write this code. Opus 5.5 did, on 5–6 Oct 26.** Work READ-ONLY: change nothing, run no build and no test
suite. Your final message is your report, in the format at the foot.

## What you are reading

Five commits on the branch `claude/codex-stack-review` — `git show <sha>` each, code and tests:

| Commit | The findings it set out to fix (W-numbers: the evidence sheet's §5.2) |
|---|---|
| `29c68485` | W2 the words the "+ In-time / Rally" button fills in no longer light "RULES MODIFIED"; W3 "RALLY AFTER IN TIME" typed with a clock is that rally's time only; W4 a flying line with no times gives no "NaN" hours; W5 a wave with a reporting line and no take-off; W19 a clock spelt `8h00` / `8.00` / `0800IN` is told "no recognised clock" |
| `c4fb74af` | W6 one name, "In-time / Rally", wherever the box is named; W7 a Blue/Red answer is filed under its formation in the changes window; W8 the two built-in demo weeks carry repeatable hidden row ids, so an answer on a day nobody has saved survives a reload |
| `2893c5a1` | W9 the "Choose / Change mission role" button shows for another formation while one question is open; W10 four confirmation windows no longer close on a drag-out |
| `5b55e1c1` | W11 a remark holding a doubled space is not "changed" by a Tab or click through it; W12 a save that opens a window stops the Tab route, and the window takes the keyboard; W13 on a phone, the Scheduler Board's Desktop layout keeps the failed-save warning and its Retry together; W18 the board's ⋯ menu stays on screen |
| `b1632e32` | W15 while a text box has the caret, everything that does not hold it is still redrawn (the day's warning list, its count, the sign-off strip); W16 the wave header's clock is corrected in place |

The sheet: `raptor-port/docs/handpass/2026-10-05-codex-stack-check.md` — §1 (why this is the highest tier), §5.2 (each
finding as a person meets it, with the ruling it breaks). The four first-pass readers' reports, which proposed most of
these fixes step by step, are `docs/handpass/parts/stack-read-AB.md`, `-C.md`, `-D1.md`, `-D2.md` (§4 Leads of each) —
judge whether each fix does what its finding needs, not whether it follows the proposal.

The owner's rulings are one line each in `.claude/rules/decisions/scheduler.md` and `how-we-work.md`; the full row of
any ruling: `grep -h '^| D535 |' .claude/decisions-full/*.md`. Read the full rows of the rulings a finding names before
judging its fix (D103, D45, D48 for a published day; D505, D509–D511 for the reporting lines; D523, D527, D529, D530,
D535, D538 for the Blue/Red question and the windows; D553 for the Tab route; D587 for the warning's band).

## Why two reviewers: what a wrong result here could do silently

- **The published record.** W11 changes the one writer of every schedule text box (`engine/slots.ts txtSet`); W15
  changes when the week and the board redraw (`ui/dayswap.ts`, `ui/EditWeek.tsx`, `ui/SchedBoard.tsx`) — a published
  day's "N pending", its sign-off strip and its amendment marks are drawn there.
- **Saved data.** W8 changes the hidden ids of every row of the two built-in weeks (`engine/weeks-data.ts seedRids`,
  `state/store.ts initStore`); everything keyed by a row id — the amendment book, undo, the change history, the
  Blue/Red answers, saved plans — meets those ids.
- **OIL (earned leave, time off banked).** W3, W5 and W4 touch the reading of a crew's report time and work span
  (`engine/reporting.ts`, `engine/events.ts waveInTime`, `engine/validate.ts workSpan`).
- **The warning list.** W19 and W3 change what the reporting checks say.

## How to read (the project's standing wording — follow it)

> Do not merely review the changed code. Starting from the user promise and the applicable rulings, enumerate every
> qualifying object, renderer, visible door, writer, reader, downstream consumer, role, overlay and meaningful order of
> actions. **Assume every existing line may be correct and the defect may be a MISSING call site.** For each item, state
> where the visible sign and the working gesture should exist in the production app. Then rank concrete failure
> scenarios with setup, action, expected result, and the observation that would disprove correctness. Start with the
> least-shared or most specialised surface.

> This app is pre-promulgation and its entire stored world is DEMO DATA that will be CLEARED before the database step.
> **Do not report a problem whose harm exists only in data already stored when the code is already correct going
> forward** — no migration, no back-compat, no "an existing record would read wrongly". If the app would do it again to
> NEW data, report it: that is a real finding and this exclusion does not touch it.

A claim is a finding only with a concrete failure (exact steps a person can do in the app), its cause in the code
(file and line), and its fix. Say for each whether the fix round introduced it, left the original finding partly
unfixed, or broke something that worked on the commit before (`git show 9f463a1f:<path>` is the tree before the round).
Give **exact, step-by-step fix instructions**. Give **explicit negatives** for what you checked and found sound.

Questions the host most wants answered, beyond the general read:
1. W15 — can the partial redraw ever leave something on screen that no later redraw corrects (a block marked as held
   that is never caught up; the remembered chunks drifting from what is on screen; a redraw running while a week
   change, a look at an older version or a glide is in flight)? Can it replace or move the box under the caret?
2. W8 — is there any reader or writer for which a row id that repeats on every load is wrong where a random one was
   right (two browser tabs, a day template, a saved plan, Undo across a week switch, the amendment book of a week only
   partly saved)?
3. W11 — is there a text box whose stored words legitimately differ only in spacing from what is typed, where
   refusing the write loses something?
4. W9 — any order of focus, edit, answer, Later, Undo and repaint in which two questions show, an answer lands on the
   wrong formation, or a button outlives its Remarks box.
5. W12 — any window the list in `ui/pops.ts windowOverSchedule` leaves out, or any state in which it stays true and
   Tab on the schedule is stuck with the browser's own behaviour for good.
6. W19 / W3 — a line a scheduler would really type that is now wrongly told "no recognised clock", or wrongly read.

## Your report (your final message; at most about 1,800 words)

1. **Findings**, most serious first — for each: a one-line title · the steps · what the ruling says should happen ·
   what the code does (file:line) · introduced by the round / the finding partly unfixed / broke what worked · the
   fix, step by step.
2. **Explicit negatives** — what you checked and found sound, one line each (answer the six questions here where the
   answer is "sound").
3. **What you did not read, and why.**
4. One line: how sure you are that nothing serious is left in these five commits, and what would change your mind.
