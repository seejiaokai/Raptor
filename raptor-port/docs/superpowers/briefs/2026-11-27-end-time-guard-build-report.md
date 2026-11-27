# [END-TIME-GUARD] overnight build: report (chat 202's night, Opus builder)

Branch `claude/end-time-guard-202` in `C:/Users/User/projects/Raptor-endtime`. Seven commits, all pushed; nothing uncommitted; the lock is released. Finished at 03:04, well before 09:00. No pull request opened, nothing merged. `main` untouched.

## What is built, step by step
- **Step A — the plan, revised** (`8b4e4f5c1`). File: `raptor-port/docs/superpowers/plans/2026-11-27-end-time-guard-plan.md`, with the revision section first (§R1–R6) and the first plan kept whole underneath.
  - I checked every finding from both blind reviews in the code. Each one is marked taken in, partly confirmed, or not checked, with the reason.
  - Not checked tonight: Astra 8's S17 (the board's BRIEF/DEBRIEF seat) and Astra 9 (the newer OIL list rulings D2800/D2801). Astra 3 (Undo/Redo) is only partly confirmed by reading; no test was written for it.
  - The build order is changed: rule → refusals → demo remake → one full run → screens.
- **Step 1 — the one rule** (`f38e678b2`). `engine/timegaps.ts`, new and port-only, decides which items of a day are missing a time.
  - What it does: someone on an item means trimmed, non-empty entries only; a start needs its end; "TBD" counts as empty. It leaves out All day input rows, cancelled and information-only items, the AMT block's BRIEF/DEBRIEF with nobody on them, and blank rows.
  - Every question case keeps today's behaviour (never refused).
  - Tests: 45 pass, 5 skipped (each names its question). Red before (no module), green after.
- **Step 2 — the refusals** (`fd1be501c`).
  - `state/timeguard.ts` holds D2854's exact words and says them in the grey "Blocked:" note. The AL it names is the one the press would publish. A hook tells the screens.
  - `state/sched-commit.ts` refuses Publish day and Publish AL only where the engine would act. The quarantine, a published day's no-op, "still a draft" and "No changes" keep their own words. The time refusal comes before the signature check.
  - `ui/oilsign.ts`: a sign-off pick is refused before the OIL question. `writeSign` also refuses, as the backstop for the OIL list's held Save and Later. Taking a name out is never refused.
  - The engine itself is untouched.
  - Tests: `timeguard-doors` 13 (7 red before), `timeguard-oil` 5 (4 red before).
- **Step 3 — the demo remade** (`e9b8f7388`). Week 1's seven rows and week 2's Friday MASS DEBRIEF now have the end the app had assumed (start plus one hour).
  - The change is in the seed itself, `engine/data.ts`, so every reader sees it. The original app's copy gets the same ends (`testing/refwin.ts`).
  - The reference parity check stays green. `timegaps-demo` 3 tests, red on the old seed.
- **Step 4 — one full unit run under the lock** (`706051a26`). Sorted below.
- **Step 5 — the screens** (`03966ac0e`).
  - **The outline:** one pass over what is drawn (`ui/timegap-paint.ts`, called from the highlight pass every screen already runs).
    - It marks every empty time box the rule names: the week's, the board's, and the board's inline Common Programme, take-off and landing inputs (every copy). It also covers the section the caret is in.
    - It marks only boxes that can be typed in, so never on View-only Sched or a frozen look.
    - Red after a refused press, box by box, until that box's time is typed. Red is kept per squadron, date and saved plan, and cleared at sign-out.
  - **Edit Schedule's line:** "1 item missing a time · 4 to sign". The board's line has no box names until the last time is typed.
  - **The sign-off box while a time is missing:** its list is disabled and out of the tab order. The pill itself takes click, Enter or Space and says the note.
  - **Publish day / Publish AL on the day head:** greyed but pressable while a time is missing. The press is refused with the note.
  - **Styles** come from the try-out.
  - Tests: `timeguard-screens` 12 pass + 3 skipped. 9 red without the screen changes. 14 neighbouring files (348 tests) green; the build passes the type check.
- **The file map** (`4cac9aa11`).

**One look in real browsers** (Chromium 1536 and WebKit 402, my own script, not the walk). Thursday staged with 4 gaps.
- Grey outline on each gap; the line reads "4 items missing a time · 4 to sign"; one press turned all 4 boxes red with the exact note; the list stayed shut.
- The board's line read the count with no names, and its boxes were red.
- No page errors. Pictures: `C:/Users/User/AppData/Local/Temp/claude/e4a2e041dc204652/9d009bef-7085-412d-8262-997b111d0f0a/scratchpad/endtime-build/look/`
- Not covered: the phone board did not open in my script, so the phone board is not looked at. No drawing check was run against the try-out.

## Full-run counts (lock taken and released each time, no waits)
- **Run 1, after steps 1–3** (02:24–02:38): 1087 files; 16,528 passed, 12 failed in 4 files.
- **Run 2, after step 5** (02:46–03:00): 1088 files; 16,553 passed, 1 failed (`sharedrow-walkfinds`, a stack-trace error under load; 17/17 when run alone).

## Tests rewritten, and the ruling behind each
- **`leavewar/publishdoor.test.ts`** — 9 cases published a weekend desk that had a man on it and no times. D2612 and D2852 now forbid that.
  - A new case proves the publish is refused.
  - The others now type a desk whose times measure nothing (08:00–08:00). It still publishes and still says "no usable times", so every note the file pins is pinned as before. 26/26.
  - I also changed a weekday case that would otherwise have passed for the wrong reason. Its publish is now refused, so the check that nothing is said held only because nothing was published; it now uses the same zero-length desk, so the day really publishes.
- **`engine/rulesfirst-8-oil-hours.test.ts` W86** — the day's warning and D360's counts are kept. Publishing that day is now refused (2 items). The publish-time "earned nobody" line is kept on zero-length desks. 12/12.
- **`doubletap-more` and `doubletap-windows`** (one test each) failed in run 1 and pass alone. Not this change; not rewritten.

No test was weakened, skipped or deleted.

## Left out, and why
- **The count line's tap:** Edit Schedule's is a later step; the board's is Q19.
- **The Legend line (D2803):** to be drawn for his look first.
- **The Amendments panel's Publish AL:** R6. The command refuses it on every route anyway.
- **The Logic page and document words:** Q-W5. Nothing else in the plan's step 7 (records, rulings marks, contracts) was done.
- **The browser test files the plan names** (`e2e/leavewar.spec.ts`, `e2e/oilworkstart.spec.ts`) were not run. They may hold blank-desk publishes.

## QUESTIONS FOR HIM
Full text with cases is in the plan's §R5. In every case the build keeps today's behaviour until he answers.
- **R1** — only the end typed, nobody on it. Recommended: counted.
- **R2** — a word other than TBD in a time box. Recommended: counts as empty.
- **R3** — a box emptied after a refused press. Recommended: red while the day has any red. **Built literally instead: grey until the next refused press.** That is my reading of D2853, so this one needs his answer.
- **R4** — how long red lasts. Built: this browser, until sign-out.
- **R5** — read-only places. Built: no outline.
- **R6** — the Amendments panel's Publish AL. Left disabled until signed.
- **R7** — a line whose every aircraft is cancelled. Not counted.
- **R8** — the "EXT SQN" sim label. Not counted as someone.
- **Q-W1 to Q-W6** — the words not ruled by him. Q-W1 (one-item count line) and Q-W2 (one-item publish note) are built as written.
- **Q14** — typing "TBD" is still refused by the time writer.
- **Q15** — Undo of an Unpublish when the working copy has a gap.
- **Q16** — which AMT rows are the block's BRIEF/DEBRIEF. Built: the engine's wider label test.
- **Q17** — clearing a time on an input's row makes that input all day.
- **Q18** — who builds this job (D2819).
- **Q19** — the board's count-line tap.
- **Q20** — the D360 "?" chip and the outline on the same gap.
- **Q21** — the stale-appointment words beside the count. Kept.

## What surprised me
- Only 12 tests broke, not the 47–94 files the plan feared. Putting the demo fix in the seed absorbed nearly all of it.
- Playwright treats the refusing sign box and the greyed Publish as disabled (`aria-disabled`), so walk scripts must press them with `force`. A person's tap is unaffected.
- On WebKit, staging the day raised "Couldn't save that document: your browser storage may be full" once. That is not this change, but a walker may meet it.
- **Reads still owed:**
  - Two blind code reads (Astra and a fresh Opus), plus a fresh Opus in Fable's seat this week, listed as owed.
  - The FULL walk.
  - The words of the one-item count and publish forms (Q-W1, Q-W2), which Fable's read did not cover word for word.
