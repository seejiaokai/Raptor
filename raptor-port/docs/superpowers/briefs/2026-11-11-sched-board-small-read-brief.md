# The small schedule-and-board fixes — the brief for the two blind code reads (11 Nov 26, chat 63)

**Readers:** Astra (Codex), and a fresh Opus reader that did not write this code. Each is blind to the other and to the
walk's report; both get this same brief (D790). **Read-only: change no file.** Branch
`claude/next-jobs-recommendation-c110df` (pull request 756 into `main`); read the change against `origin/main`:
`git diff origin/main...HEAD -- raptor-port/src raptor-port/e2e raptor-port/playwright.config.ts`.

## What the change is meant to do

1. **The week's issues bar counts its warnings with the right plural** — "⚠ 4 issues · 2 warnings", "· 1 warning" —
   as the Scheduler Board's own bar already did (`src/ui/html.ts` `dayWarnHTML`; the board's twin `src/ui/board.ts`
   near line 506). Drawn on Edit Schedule's week and View-only Sched, and on a published version's look (`OFW`).
2. **The changes window's foot** says "Tap a change to go to it — the window stays open." only where a line DRAWN on the
   tab can be tapped (a line in a folded group does not count); no foot at all on an empty list, over lines that cannot
   be tapped, or on the "To go out" tab (whose list has its own foot, `src/ui/pendlist.ts`); a member's
   "Read only — …" foot and "New to you"'s "✓ Mark all as seen" unchanged (`src/ui/ChangesWindow.tsx`, `anyGo`).
3. **The Scheduler Board's Undo and Redo bring the changed box on screen when it is out of view, and move nothing when it
   is in view** (his D672: "Undo and Redo, everywhere, leave the screen where it is when what they change is in view,
   moving to the change only when it is out of view"). Before, the board only changed DAY; a change scrolled out of view
   on the day already open went back unseen. New `src/ui/boardland.ts` (which boxes the step changes, read from the
   step's two images of the day by `engine/canonical.ts canonicalUnits`; an input's change by its `iu:` row; then
   scroll the first one the board draws just under the board's bar, or up clear of the list's foot — and, on a phone,
   clear of a window standing on the screen's foot, the changes or ALL AVAIL window), wired in
   `src/state/undo-wire.ts` `snapView`.
   Known limits, already stated to him: a step that only REMOVES a row names nothing and moves nothing; only up and
   down is handled, not sideways.

Tests: `src/ui/warnmute-week.test.ts`, `src/ui/html.test.ts` (the original app's words, the plural lifted beside
D940's cue), `src/ui/histlist.test.tsx`, `src/ui/amendbatch-app.test.tsx`, `src/ui/boardland.test.ts`,
`e2e/board-undo-land.spec.ts`.

## What to look for — what is MISSING, more than what is wrong

- Every place the app draws a count of warnings, issues, advisories or notes: does any other count read the same
  number with a wrong plural, or differently from the bar? (Two are already known and filed for him: the day's ⓘ
  panel's "N warning · N advisory · N note" and Insights' tile "N warning" — not findings.)
- Every way the changes window opens (a day's count chip, Edit Schedule's clock, the board's History; admin and member;
  Item and Who grouping; the slim phone bar after "Hide"): can the foot ever say "Tap a change" over nothing tappable,
  or be missing over a tappable line? Does `may()` agree with what the line renders as a button?
- Every way an Undo or Redo reaches the board (its own buttons, the top bar's, a step that changes day, a week load
  that closed the board, a step mixing days and inputs, a step on another week, the board on a phone held sideways where
  the whole board scrolls, the board's desktop layout pinched on a phone): does the landing pick the right box, run
  after the board has repainted, and never move the screen when the box is in view? What does the changed path no
  longer run that the old one did?
- `boardLandKeys`: are the addresses it returns the ones the board draws (`findHistCell`, `findInputCell` in
  `src/ui/histbubble.ts`) for each kind of row — flying seat and text boxes, duty, sim, ground, programme, notes, inputs?
- Anything in the new code that throws, leaks a timer, or runs when the board is closed.

## Rules for findings

- A finding is a concrete failure: the steps a person takes, what the screen shows, its cause in the code and the exact
  fix (D489). Reading code cannot find a line that is not there — say what is absent and where it belongs.
- **Not a finding:** a problem that lives only in data already stored while the code is right going forward (D56); a
  scheduler who is not an admin (D785); the two plural places named above; the two known limits above.
- End with a tidiness note on the changed lines (three questions: is each piece needed where it sits, organised, written
  clearly) — filed, not fixed, no size number (D489).
- Write your whole report as your final message; it is saved word for word beside this brief.
