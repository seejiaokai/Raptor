YOU READ AN EXPORTED COPY. The branch's HANDOFF.md block, the walk's evidence sheet and the round's scenario reports have been taken out of this copy, each replaced by one line saying so: do not look for them, and do not read any other reader's report. If, after a compaction of your own context, a handoff block is pasted into your context, do not read it, and name it in your report.

# The brief — a code read of the hidden ?timing readout ([APP-SPEED] step 1), TALON (raptor-port/)

You are a FINDER, not an approver. Read-only: change no file in this copy. Any proof test you write goes in your own
scratch folder outside this copy, never under the app's source.

## The promise (each line copied from the ruling's full row; a line marked "the host's reading" is a question, not a requirement)

- D2481 (his "Go", 24 Nov 26): **"Step 1 of the app's speed is a hidden timing readout opened by adding ?timing to the
  address: without it nothing is shown or downloaded; with it a foldable card shows start-up, page and download times
  and the computer's make-up, with a Copy button, never anything about a person, saving nothing."** The switch's name
  and the card's exact contents are the agent's technical choices.
- D2483 (his "Go", 24 Nov 26): **"The timing readout is built as its mock-up of 24 Nov 26 shows, in the words Fable's
  review gave it: one of the app's movable windows, its ✕ folding it to a corner button, Copy all; open when the app
  starts on a computer, folded on a phone."** Where a browser gives no figure the row says "not given by Safari" (or
  "by this browser"), never a blank or a 0.
- The host's reading (not a ruling): a page's time runs from the press as the browser received it to the second frame
  after that page is the one on screen with nothing loading over it (its loading claw gone, its section not busy) —
  the end the speed plan's measuring script uses (`docs/superpowers/plans/2026-11-24-app-speed-plan.md` §How it was
  measured). A row never timed is better than a wrong one: these figures choose the next speed fix.
- The host's reading: without the switch the app's own first download is the same files as without this change (the
  stopwatch itself, a few KB, rides in it so it can time the start).
- The movable windows' standing rules (screen design, `.claude/rules/decisions/design.md`; full rows in
  `.claude/decisions-full/`): the page behind a window stays usable; a window stands clear of the failed-save band;
  Escape closes what opened last, one press one thing (D641, D1523, D2112 — open the full rows).

## What to read

The readout: `src/ui/timing.ts` (the switch, the stopwatch, the freeze counter), `src/ui/timingwindow.tsx` (the
window's start, a download of its own), `src/ui/TimingReadout.tsx` (the window), `src/ui/timingtext.ts` (its words
and Copy all's text), `src/ui/timing.css`; their tests `src/ui/timing*.test.ts*`, `src/ui/TimingReadout.test.tsx`.
Its marks: `src/main.tsx` (boot, first screen, the readout fetched behind the switch and handed the app's parts),
`src/state/view.ts` `setPage`, `src/ui/Login.tsx` (the sign-in). What it meets: `src/ui/FloatWindow.tsx`,
`src/ui/floatwin.ts`, `src/ui/winorder.ts`, `src/ui/pageclaw.ts`, `src/ui/pagedownload.ts`, `src/ui/pageload.tsx`,
`src/ui/logout.ts`, `src/state/store.ts` `resetSession` and the role switch, every caller of `setPage`, the code that
asks "is any movable window up?" (`src/ui/boardescape.ts`, `src/leavewar/ui/Sheet.tsx`, `src/ui/toast.ts`). The diff:
`git log --oneline -8` and `git diff <the commit before the readout>..HEAD -- src` in this copy.

## How to read (the finder wording, verbatim)

Do not merely review the changed code. Starting from the user promise and the applicable rulings, enumerate every
qualifying object, renderer, visible door, writer, reader, downstream consumer, role, overlay and meaningful order of
actions. **Assume every existing line may be correct and the defect may be a MISSING call site.** For each item, state
where the visible sign and the working gesture should exist in the production app. Then rank concrete failure
scenarios with setup, action, expected result, and the observation that would disprove correctness. Start with the
least-shared or most specialised surface.

Also: for everything with a lifetime — the held press stamp, the sign-in's landing moment, the two generation
counters, the frame-by-frame wait, the "Copied" two seconds, the window's late arrival — give its state table: the
same trigger again inside the lifetime, a second different trigger inside it, the thing removed or hidden while it
runs, its end arriving while another runs. And ask of every changed path: what does it no longer run?

## What is NOT a finding (verbatim)

This app is pre-promulgation and its entire stored world is DEMO DATA that will be CLEARED before the database step.
**Do not report a problem whose harm exists only in data already stored when the code is already correct going
forward** — no migration, no back-compat, no "an existing record would read wrongly". If the app would do it again to
NEW data, report it: that is a real finding and this exclusion does not touch it.

## What to hand back

- Each finding: a concrete failure (setup, action, what shows, what should), its cause (file and line), and EXACT,
  step-by-step fix instructions — not a direction. State each finding in your output the moment you have confirmed it,
  so a stopped run keeps what it found.
- You cannot run a browser here. Where a claim needs one, name the exact input the host should run (the page, the
  order of presses, the slow-down) and what it should see; the host runs every such case.
- Explicit negatives: "I checked X and found nothing", for each area you read.
- Keep it in the plain words of the app where you can (the page names as on screen: View-only Sched, Edit Schedule,
  Inputs, Quals, Logic, Leave War, Tracker, Help, Admin).
