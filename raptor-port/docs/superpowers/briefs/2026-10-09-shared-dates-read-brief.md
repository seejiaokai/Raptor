# The code read — a saved shared input's dates are changed in its window (D681) — 9 Oct 26

You are one of TWO independent readers of one small, finished change (bug-check order §4 rank 2, §4a; D590, D601 — Astra
reviews what Opus wrote and Sol 6.1 reads second, each blind to the other). You did not write it. Work READ-ONLY: change
nothing, build nothing, start no server. **You cannot run anything** (the sandbox has no writable temp folder — a test
run reports zero tests): read the source, and where you would have run a case, NAME the exact input and the answer you
expect; the host runs it. Never read the other reader's report (`2026-10-09-shared-dates-read-astra.md` /
`…-read-sol.md`); never approve — your report is evidence, the owner approves.

## What it is

Branch `claude/inputs-sans-calendar`, ONE commit: `git show cfcd40b7 -- raptor-port/src raptor-port/e2e` (the diff is
`src/ui/inputedit.tsx`, its tests in `src/ui/groupeditor.test.tsx`, two browser tests at the foot of
`e2e/inputs-calendar.spec.ts`). The job it closes was read by both of you on 8 Oct; this is the one door that read
found MISSING (Astra's R3), built on the owner's word.

**The promise — the owner's rulings** (one line each in `.claude/rules/decisions/scheduler.md`; a ruling's full row,
with the readings he was told: `grep -h '^| D681 |' .claude/decisions-full/*.md`, the shell's grep):
- **D681** (9 Oct 26): a saved shared input's dates can be changed — in the input's own window, by whoever may change
  the input, for everyone in it at once. Read its seven readings; each is a claim about what was built.
- **D655**: a group filing is one shared input, shown and edited as one thing; the man himself, whoever filed it and an
  admin may change or delete it. **D660, D682**: whoever files or changes it answers the OIL question for all of them,
  once; the latest answer counts; the scheduler's refusal on the day still wins. (OIL is earned leave banked as time
  off — never pay, D25; `.claude/rules/decisions/oil.md`.) **D658**: SANS availability for several is an admin's only.
  **D45, D103, D178**: nothing on a published day changes without the scheduler acknowledging it. **D148, D672**: Undo.
- The contract: `raptor-port/docs/ui-contracts.md` "One input filed for several people" — its "Its DATES are changed
  in its window" bullet says what the code is meant to do, line by line.
- Also: `raptor-port/CLAUDE.md` §Architecture rules (the mutation and persistence funnels), `.claude/rules/raptor-executor.md`,
  `raptor-port/docs/bug-check-order.md` §2b, §4, §6.

**In your hands: the evidence sheet** — `raptor-port/docs/handpass/2026-10-08-inputs-sans-calendar-check.md` **§12**: the
eight questions and the tier, the ROLL-CALL of every place the app opens an input (R1–R11) with whether the dates door
is there, the door check, the sizing, and the walk of the running app (16 steps, `scripts/handpass/cal-host-dates.mjs`).
The walk was done before you; you are asked for what a walk cannot see.

## Read these — whole where they are short, the named parts where they are long

1. `src/ui/inputedit.tsx`: `datesHere` and `midPick` (search for them); the `RangeCal` block in the form; the hint
   under the form; `save()` — the `grouped` branch — and `doSave()`; `commitGroup` WHOLE; `commitInputEdit` WHOLE (how a
   changed date is written: the remark's "till" word, `mod`, `yr`, the Leave War's `lw` tag, the stamp); `oilGate` and
   `normalizeInputDraft`; the two layout effects of the editor as a window (the re-seed on `[r]`, and the
   follow-the-record effect with `WIN_FIELDS`, `base`, `clash`); `draftOf`.
2. `src/ui/RangeCal.tsx` whole (its `pick`, and that its month `view` is seeded ONCE).
3. For comparison, the door that already moved a shared input's dates: `src/ui/caldrag.ts commitChipMove` and
   `askOilIfPending` in `inputedit.tsx` — the new door and this one must agree about everything but the control.
4. `src/state/perms.ts` (`mayEditInput`, `mayChangeInput`, `inputBreach`) and `src/state/inputgroup.ts`.
5. `src/engine/oil.ts voidedOil`, `src/leavewar/sync.ts oilAskPlan` — what happens to each man's standing OIL answer
   when the dates move ONTO a weekend or holiday, OFF one, or from one weekend to another.

## What to answer — each with a file and line, or "checked, none"

A. **A wrong line.** The input, what the code does, what the ruling or the contract says it should do. Look hard at:
   - `midPick` — is there any order of taps, of a record swapped or re-found under the window (`keepDraft`, `stay()`,
     the "another input asked for" question), or of a change made BEHIND the window while a pick is half made, after
     which Save writes dates he did not pick, or the calendar shows one range and the draft holds another?
   - the follow-the-record effect: the bar is dragged behind the window (a) before he touches the calendar, (b) after
     his first tap, (c) after both — what does each do, and is a date changed both ways put to him (`clash`)?
   - a range that crosses the year's end, and a record whose `yr` is not the loaded year;
   - the remark: the picker does not rewrite it and the save "follows the till word" — is there a remark that ends up
     saying a date that is no longer the last day, for one man and not another?
   - the title keeps the SAVED dates while the line under the calendar shows the draft — can they mislead?
B. **A MISSING line.** Against the roll-call (sheet §12): a door that opens a saved shared input and should have the
   calendar and has not, or has it and should not. A reader for whom the calendar is hidden but the write is still
   reachable (the keyboard, Enter in the remark box, a stale window after his rights changed), or the reverse — shown,
   then refused at the write. A question the save should ask and this route skips (OIL for every man kept; a medical
   kind; a clash with leave; a published day's acknowledgement).
C. **A rule held in ONE place only where two are needed** — on screen but not at the command gate, or the reverse.
D. **The tests:** name the wire of this diff no test would go red for (for instance: is anything red if `midPick` were
   never reset on a new record? if `datesHere` forgot `!readOnly`? if the picker rewrote the remark?).
E. **The words:** do D681's seven readings, the contract's bullet and the sheet's §12 say what the code does? Does the
   hint under the form tell him the truth in both cases (a one-day input, a range)?
F. **What is NOT a finding (owner, D56):** this app is pre-promulgation and its entire stored world is DEMO DATA that
   will be CLEARED before the database step. Do not report a problem whose harm exists only in data already stored when
   the code is already correct going forward — no migration, no back-compat. If the app would do it again to NEW data,
   report it. Also not yours: an ordinary one-man input's dates in this window (D681 reading 7 — not built, by his
   ruling); the size of the calendar's days on a phone (D487 — told to him); one row for a group input on the SCHEDULE
   (D661, D662 — its own job); the three items the 8 Oct check filed (`OUTSTANDING.md` `[CAL-UNDO-OTHERS]`,
   `[CAL-TOGO-ONE-ITEM]`, `[CAL-CHECK-SEEN]`).

Then: up to eight exact cases for the host to run, ranked (setup, action, what you expect, what would disprove it);
explicit negatives — what you checked and found sound, one line each; and a verdict line — **PASS** or **CHANGES
REQUIRED** with the changes listed. A claim is a finding only with a concrete failure, its cause and its fix (D489):
give exact, step-by-step fix instructions for each.
