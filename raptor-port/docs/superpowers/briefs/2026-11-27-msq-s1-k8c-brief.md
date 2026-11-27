# Section 1 (the guard rail) — step K8c: an Undo that changes the squadron in view closes what the guard closes (chat 204, 27 Nov 26)

**A fault in K8, found by question 27's words check (P1 in `2026-11-27-msq-s1-q27-words-check-report.md`).** The
coordinator agreed it is a closing step, not a block. It is right whatever he answers on dropping the refusals.

## The fault

1. Saber, a master admin, makes 151 with "+ New squadron" and picks it.
2. He opens a window that only shows things: Who's available (ALL AVAIL), Changes, Insights, a SANS day, the Leave
   War's day panel, a show-only war sheet, or one of the Tracker's four. Or he turns on Logic's or Quals' edit mode.
3. He presses Undo.

The Undo is not refused, which is correct, because those are rows that close or modes that end. The step then takes 151
away, and the squadron changes later through `state/store.ts maybeReenter` → `enterSquadron`.

That road never runs `closeShown()`. Only the pick, the view switch, a bell line's entry and the page door's landing do
(`state/pick.ts`; `state/store.ts` about l.132, 143, 796; `state/belltap.ts`). So the windows stay up over 142, and
Logic's and Quals' edit modes stay on. A value typed on Logic for 151 that is still waiting its moment is then never
written by the mode's own end.

This breaks his D2596 and D2597 (a window that only shows things closes when the squadron switches) and D2627 A4 (the
edit modes end at a door's last step).

## Read first

- K8's brief and report (`2026-11-27-msq-s1-k8-{brief,report}.md`). K4's brief rules where this one is silent.
- `state/undo-wire.ts squadronRefusal` and `snapView`, and its comment on rows 21 and 13.
- `state/store.ts maybeReenter`, `landOnOfferedPage`, `stepPage`.
- `state/guard.ts closeShown`, and what each mode's `end()` does: Logic hands over `flushRuleApply()` and then turns
  the mode off; Quals drops the hidden words of "Add qualification" at a squadron change.
- The P1 section of the words-check report.

## What is built

**Where the Undo or Redo goes through on row 21 or row 13**, meaning the guard was asked and let it through, run the
guard's closing step (`closeShown()`) **before the step's own writes**. Then the squadron change it causes leaves
nothing behind:
- the show-only windows are shut;
- Logic's and Quals' edit modes have ended through their own `end()`.

**Never on any other road.** Do not put it in `maybeReenter` for every caller:
- His own move at midnight goes through that same function. It is a change he did not make, and it closes nothing
  (A14, A15, pinned).
- An Undo that does not change the squadron in view closes nothing.

**The hard case: Logic's edit mode with a value typed but not yet applied.** Its end writes that value. If that write
happens inside the Undo, it must not become a step that the Undo then takes back instead of "+ New squadron", and it
must not be lost. Find out what the code does, and choose the smallest correct order:
- the end's write lands, and the Undo still takes back "+ New squadron"; or
- the value written for 151 goes with 151.

Say in your report which you chose and why. If neither can be made correct without a change he would see, **STOP**
and report it as a question.

## Tests (written first, each seen failing)

Add them in `ui/msq-guard-doors-undo.test.tsx`, beside K8's, or in a new describe there. Use `saberOn151()`, or
whatever that file uses to reach the road.
- ALL AVAIL open, Undo: the window is shut after 151 goes, and 142 is in view.
- The same for Changes and Insights, one test each. Add a SANS day if the file reaches one cheaply.
- Logic's edit mode on, Undo: the mode is off after 151 goes. With a value just typed: the case above, as you chose it.
- Quals' edit mode on with words in "Add qualification", Undo: the mode is off and the words are gone.
- **Pins:**
  - an ordinary Undo (no squadron change) with ALL AVAIL open leaves it open;
  - his own move at midnight with ALL AVAIL open leaves it open, as today (A14).
- The row-13 road (the landing) is a belt only, because no button reaches it. Cover it by the engine call K8's B23 uses,
  and name it as a belt in the test.

## Checks

- Run the undo file and K8's other files: `msq-guard-doors*`, `msq-guard-g`, `msq-guard-note`.
- Run every test that names `squadronRefusal`, `snapView` or `stepPage`. Find them with grep in `*.test.ts*`.
- Run `npm run lint:changed`. It must stay at the one finding that belongs to the Admin → Users section.
- **The full unit suite and `npm run build`: under the checks lock** (`node scripts/gatelock.mjs status`, then `take`,
  then release the moment the run ends). If another chat holds the lock, report NOT RUN. Never wait in a loop.
- Show each test failing first by setting the code aside with a patch file: `git diff` → `git checkout --` → run →
  `git apply`. **Never `git stash`.**

## Rules

- Work only in `C:/Users/User/projects/Raptor/.claude/worktrees/lw-balances-hover-275293` (branch
  `claude/msq-s1-guard-6ae5e1`). Never in `heuristic-yonath-4d55e7`. **Do not commit or push.**
- **`raptor-port/.tmp/k10-root.patch` is K10's held work. Do not apply, change or delete it, or anything in
  `raptor-port/.tmp/`.**
- Never touch `undo/timeline.ts`; the Admin → Users section changes its `stuck` hook. Never touch `ui/UsersPanel.tsx`,
  `ui/AdminPage.tsx`, `ui/topstate.ts` or `storage/`.
- No new words on screen. No refusal added or widened; his D1613 hold is in force while he weighs going without the
  block.
- Never weaken or delete a test.
- Write your report to `raptor-port/docs/superpowers/briefs/2026-11-27-msq-s1-k8c-report.md`:
  - what changed, file by file;
  - the Logic case and your choice;
  - each test with "seen failing: yes / pin";
  - the checks, each with its result;
  - what is open.
- Then reply in under 120 words.
