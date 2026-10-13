# Brief — a blind read of one small change: "→ Unavail" waits on its OIL question (D804)

You are an independent reader. Read-only: change no file, build nothing, run no browser test (a full check may be
running on this PC — a build would break it). You may run ONE unit test file at a time (`cd raptor-port && npx vitest run
<file>`). Do not read `raptor-port/docs/handpass/2026-10-13-inputs-batch.md` or any other reader's report — your read is
blind. Write your report to the path named at the end and return its summary.

## What changed, and why

Branch `claude/inputs-schedule-batch`, commit `cf0d9061f` (`git show cf0d9061f -- raptor-port/src raptor-port/e2e`).
The owner's ruling D804 (13 Oct 26) — open its full row first: `grep -h '^| D804 |' .claude/decisions-full/*.md` (the
shell's grep), and D793's and D783's the same way. In short: leave and medical inputs never earn OIL (time off banked
for weekend or holiday work — never pay) and are never asked; every other kind that can earn is asked the OIL question
and its answer decides, wherever it is filed — so the scheduler's "→ Unavail" button, which files an input of kind
"Other" under Unavailable, now puts the OIL question FIRST where the input needs an answer, exactly as "Accept" /
"→ Ground" has done since D793: nothing is written until it is answered; answered, the answer and the filing are ONE
command and one Undo; not answered, nothing is filed and a bar stays ("Not filed — OIL not answered" · Answer OIL · OK).

The door is `raptor-port/src/ui/interactions.ts` (search `data-acc`): `press()`, `run()`, `refusalWords`. The waiting
mechanism: `raptor-port/src/ui/oilwait.ts`, `raptor-port/src/state/view.ts` (`OilWait`), the gate
`raptor-port/src/ui/inputedit.tsx` (`oilGate`, `dryRun`, `saveBatchX`, `commitInputEdit`), the write
`raptor-port/src/engine/slots.ts` (`acceptInput`, `unacceptInput`). The tests: `raptor-port/src/ui/oilwait.test.tsx`
(search `D804`), `raptor-port/e2e/oilwait.spec.ts`. Area rules to read before judging: `.claude/rules/decisions/oil.md`
and `.claude/rules/decisions/scheduler.md` (short lines; open a full row before leaning on its detail).

## What to answer

1. **Is the change right and complete?** Walk `press()` → `holdForOil` → `answerOilWait` / `leaveOilWait` /
   `oilBarAgain` for `dest === 'u'` line by line. In particular: the answered path writes the answer with
   `commitInputEdit(…, { sched: true, oil })` and THEN `acceptInput(di, x, 'u')` inside one `saveBatchX` — is anything
   that path does right for "on the programme" and wrong for "under Unavailable" (the `reconcileIssuedMarks([di])`
   call, the refusal's words in `refusalWords`, the note it says, the `off()` and `here()` guards in `redo` / `ask`, a
   published day's pending count and sign-offs, the change history's line, the member's bell)?
2. **What did it break beside it?** Every other reader of `OilWaitKind` / `WAIT_WORDS` / `OILWAIT.kind`; the sheet that
   draws the question (search `oilconf`); the bar; anything that assumed four kinds.
3. **What is MISSING — the question reading code is worst at, so spend most of your time here.** List EVERY way an
   input that asks the OIL question can come to be filed under Unavailable (`acc === 'u'`) without passing this door:
   an input's own window (a type changed to or from "Other"; a save with `_ctx`), a drag, a paste, a week load, a plan
   switch, a template, Undo / Redo, the working-out after every command, publishing, the Inputs page. For each: does it
   ask where D804 says it should, is it one of the ways D793's reading 3 says never asks (an Undo), or is it a gap? And
   the reverse: can "→ Unavail" now ask a question for an input that should NOT be asked (a Personal input, leave, a
   working day, one already answered — a No is an answer, a day the card is not of)?
4. **The tests:** does each new test fail without the change for the reason its name gives? Name any claim of the
   ruling no test holds.

## What is NOT a finding

- A problem that lives ONLY in data already stored, where the code is right going forward (D56) — the whole store is
  demo data, cleared before the database step.
- A scheduler who is not an admin (D785 — never the case).
- Style, naming, or a wish for a refactor. Tidiness: at most three lines at the end, filed not fixed (D489).
- **A claim is a finding only with a concrete failure — the steps or the inputs, what the app then does, what it should
  do — its cause (file and line) and its exact fix (D489).** Say for each whether you REPRODUCED it (a test you ran, by
  name) or only read it.

## The report

Markdown, at `raptor-port/docs/handpass/parts/ib/read-d804-<opus|fable>.md` (this is the one file you may create):
a one-paragraph verdict; findings ranked, each with severity, failure, cause, fix, reproduced-or-read; then the list for
question 3 as a table (the way in · asks / must not / GAP · where); then what you did not read.
