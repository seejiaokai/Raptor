# Scenario design — the hidden ?timing readout (TALON, branch claude/app-speed-readout-161)

You are designing the TEST SCENARIOS for a walk of the running app. You are blind: do not read any other reader's report,
any evidence sheet or walk report for this job, or the `HANDOFF.md` block for this branch; if a handoff block is pasted
into your context after a compaction, do not read it and say so in your report. Do not change any file in the repo.

## The promise (the owner's rulings, from their full rows in `.claude/decisions-full/how-we-work.md` — D2481, D2483)

- D2481: "Step 1 of the app's speed is a hidden timing readout opened by adding ?timing to the address: without it nothing
  is shown or downloaded; with it a foldable card shows start-up, page and download times and the computer's make-up, with
  a Copy button, never anything about a person, saving nothing."
- D2483: "The timing readout is built as its mock-up of 24 Nov 26 shows, in the words Fable's review gave it: one of the
  app's movable windows, its ✕ folding it to a corner button, Copy all; open when the app starts on a computer, folded on
  a phone." Where a browser gives no figure the row says "not given by Safari" (or "by this browser"), never a blank or a 0.
- Its purpose (the speed plan, `raptor-port/docs/superpowers/plans/2026-11-24-app-speed-plan.md` step 1): the owner opens
  the live app on a slow office computer with `?timing`, uses it for a minute, presses Copy all and pastes the text to the
  developer. The figures decide which speed fix is built next, so a WRONG or MISLEADING figure is the worst failure, after
  any harm to the app for people who never use the switch.
- The host's reading (no ruling behind it — treat as a question): the times are taken from the moment a page is asked for
  to the second animation frame after that page is the one on screen with no loading claw over it; the sign-in from the
  press (accepted) to the week's days drawn; start-up rows from opening the address.

## What was built (read the code for yourself)

`raptor-port/src/ui/timing.ts` (switch, marks, freeze counter), `src/ui/TimingReadout.tsx` (the window, a separate download),
`src/ui/timingtext.ts` (words), `src/ui/timing.css`, and the marks in `src/main.tsx`, `src/state/view.ts` (`setPage`),
`src/ui/Login.tsx`. The window uses the app's `FloatWin` (`src/ui/FloatWindow.tsx`, `src/ui/floatwin.ts`). Pages:
`src/ui/Shell.tsx`. Separately downloaded pages (Leave War, Tracker): `src/ui/pagedownload.ts`, `src/ui/pageload.tsx`,
`src/ui/pageclaw.ts`. The mock-up's words are pinned in `src/ui/timingtext.test.ts`.

## Your job

> Do not merely review the changed code. Starting from the user promise and the applicable
> rulings, enumerate every qualifying object, renderer, visible door, writer, reader, downstream
> consumer, role, overlay and meaningful order of actions. **Assume every existing line may be
> correct and the defect may be a MISSING call site.** For each item, state where the visible sign
> and the working gesture should exist in the production app. Then rank concrete failure scenarios
> with setup, action, expected result, and the observation that would disprove correctness. Start
> with the least-shared or most specialised surface.

> This app is pre-promulgation and its entire stored world is DEMO DATA that will be CLEARED before
> the database step. **Do not report a problem whose harm exists only in data already stored when
> the code is already correct going forward** — no migration, no back-compat, no "an existing
> record would read wrongly". If the app would do it again to NEW data, report it: that is a real
> finding and this exclusion does not touch it.

Cover at least: the app WITHOUT the switch (nothing different, nothing extra downloaded — how a walker proves it);
every way a page is opened (top bar, the phone's ☰ drawer, sign-in landing, sign-out, a page reopened after a failed
download's Retry, the browser's back button if any); every page; a page left before it finished drawing; a page whose
download fails; first visit and a repeat visit (files kept by the browser); phone and desktop; the window dragged, folded,
reopened, Escape; the window over other windows and bands (the failed-save band, other FloatWins, drawers, dialogs);
Copy all where the clipboard is refused; a member and an admin; anything that could make a figure wrong or misleading
(double counting, a time that includes the readout's own drawing, a stale figure, a sign-in that lands elsewhere).

For each scenario: setup, action, EXPECTED (with its source — a ruling above, the mock-up words, or "RECORD exactly what
it shows" where you cannot settle it), and the observation that would disprove correctness. Rank them, most damaging
first. Give explicit negatives ("I checked X and found nothing"). Where you believe the code is already wrong, say so
with the line and an exact step-by-step fix.

Write your whole report to `<REPORT>` (the path given in your prompt) as you go, each scenario the moment it is
settled, and return it as your final message too.
