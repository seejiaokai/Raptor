# Read brief — the five-flags batch, the final code read (Fable and Astra, blind to each other), 26 Sep 26

You are reading a finished change on branch `claude/five-flags-batch-build-ef7d85` in
`C:\Users\User\projects\Raptor\.claude\worktrees\five-flags-batch-build-ef7d85`. You did NOT write it. **Read-only:
change nothing, run no server, rebuild nothing.** The other provider reads the same change at the same time; you will
not see each other's report before both exist (bug-check order §4).

## The five promises
1. **[PUCK-FLAG-GLOW] (D164, "can u not make it glow")** — a flagged puck never glows; the signed-in man's own purple
   "this is you" puck used to lay a red halo over its solid and dashed rings.
2. **[LW-RESET-ORDER] (D160, "9 yes")** — a "Reset order" line in the Leave War's ⚙ Settings puts a hand-arranged
   roster back in the default order (no button on the grid, no strip).
3. **[CROWD-SWAP-SAYS-BUSY]** — moving a man inside the Common Programme crowd he is on toasted "already on <that row>".
4. **[VIEW-ARROW-OVER-LIST]** — the week's floating ‹ arrow covered the start of the day at the front (an opened
   warning list) on a desktop.
5. **[BG-GUARD-FALSE]** — the background-command guard was built on a wrong note about where a background shell starts.

## Read, by path (nothing under `.claude/rules/` loads for you by itself)
- The rulings: `.claude/rules/decisions/scheduler.md` (D164; §Settled "Board behaviour", "Week navigation & cross-week
  continuity"), `.claude/rules/decisions/leave-war.md` (D160; §Settled "Leave War roster & display"; §Architecture),
  `.claude/rules/decisions/how-we-work.md` (D56, D162), `.claude/rules/raptor-executor.md`.
- **The evidence sheet — the roll-calls are §3, the break tests §4, the walk §5, what was NOT walked §6:**
  `raptor-port/docs/handpass/2026-09-26-five-flags.md`, and the walkers' tables in `raptor-port/docs/handpass/parts/`
  (`2026-09-26-five-flags-w*.md`). Fable's scenario design: `raptor-port/docs/superpowers/specs/2026-09-26-five-flags-scenarios-fable.md`.
- The change: `git diff main -- raptor-port/src raptor-port/e2e .claude/hooks raptor-port/docs/ui-contracts.md
  raptor-port/docs/engine-rules.md raptor-port/docs/feature-impact.md` (and `git log main..HEAD` for the story).
  The heart of each: `src/ui/scheduler.css` (`.puck.me.boxred`, `.puck.me.boxdash`, the desktop `.week` rule);
  `src/leavewar/state/store.ts` (`resetRosterOrder`, `rosterFollowsDefault`, `displayRoster`) and
  `src/leavewar/ui/SettingsSheet.tsx`; `src/engine/keys.ts` (`seatRow`), `src/engine/avail.ts` (`selfKey`, the busy
  scan), `src/engine/validate.ts` (`crossDayIfPlaced`, `restIfPlaced`); `src/state/view.ts` (`weekInset`,
  `weekLeftDay`, `scrollWeekToDay`) and `src/ui/highlights.ts` (`bringIntoView`); `.claude/hooks/bg-cwd-guard.mjs`.
  **Added after the walk (§5 of the sheet):** one man, one place on a row — `src/engine/avail.ts` (the check before the
  busy scan), `src/engine/slots.ts` (`rowPlaces`, `lastFilled`, fillSlot's `putAt`), `src/ui/drag.ts` (the hover and
  `barDrop` keys, the cell branch), `src/state/view.ts` (`placeArmed`), `src/ui/palette-html.ts` (the armed key as
  armed); the SC shift scan's leaving seat (`avail.ts`); `weekInset` 'right' measured against the › arrow; the two
  resets in ⚙ Settings take each other's question back (`SettingsSheet.tsx`, `Matrix.tsx`).

## The job — find what is MISSING, not only what is wrong
> Do not merely review the changed code. Starting from the user promise and the applicable rulings, enumerate every
> qualifying object, renderer, visible door, writer, reader, downstream consumer, role, overlay and meaningful order
> of actions. **Assume every existing line may be correct and the defect may be a MISSING call site.** For each item,
> state where the visible sign and the working gesture should exist in the production app. Then rank concrete failure
> scenarios with setup, action, expected result, and the observation that would disprove correctness. Start with the
> least-shared or most specialised surface.

Concretely:
0. **The walk's own fixes (§5)** — one man, one place on a row: every caller that asks the busy check AFTER a write
   must name the place the man landed on (`lastFilled`), or an ordinary add reads as a second copy; every caller that
   asks BEFORE a write must keep a "+ add" key as it is. Find a caller that does neither (the green rings, the board's
   own drop paths, the Inputs page's accept into a row, a request row, `iu:` reassign, the ALL AVAIL window, undo/redo
   repaints). And: does `rowPlaces` list every place a man can stand on each kind of row?
1. **Every other key-shape compare.** `seatRow` is now the one "which row is this" — is any other place still comparing
   a seat key with an event's key raw, or trimming a Common Programme key its own way (the pending list, the change
   jump, the drop flag, the OIL claims, the amendment marks, the selection rings, the history)? Does widening the busy
   scan to the seat being left hide a REAL clash anywhere (a man on the same row twice; a sim whose front seat and pax
   are both him; a swap where the other man lands where he was)?
2. **Every landing of the week.** Any path that puts a day at the front — or reads "the day at the front" — that does
   not go through `weekInset` or `panDays` (a resize, the board close, the Inputs page's jump back to the week, the
   Insights modal, a published-version look, the phone at 821px exactly)? Any reader that measured from the week's
   old 20px padding (the carry, the palette's day-follow, `dayRangeText`, `setWeekTail`, the e2e helpers)?
3. **Reset order.** The store's admin gate, the Undo step, persistence (an EMPTY saved order after a reload), the war
   switch (one order for every war?), Rearrange on, Show SANS on, and `rosterFollowsDefault` versus the grid's own
   drawing (`Matrix.tsx` filters rows by the visible window — can the two disagree?).
4. **The rings.** Any other rule that draws a flag ring on a puck with a blur — `@media` blocks, the board's own
   stylesheet, the print sheet, the ghosts' veil — that `flagglow-css.test.ts` does not walk?
5. **The guard.** A command the guard now lets through that dies in the starting folder, or refuses that works
   (Windows paths, PowerShell forms, a start folder with a trailing separator or different case).
6. **The tests.** Any check that passes while the thing it names is broken (a vacuous pass), and any wired place with
   no break test (§4).

## What is NOT a finding (owner, D56)
This app is pre-promulgation and its entire stored world is DEMO DATA that will be CLEARED before the database step.
**Do not report a problem whose harm exists only in data already stored when the code is already correct going
forward** — no migration, no back-compat, no "an existing record would read wrongly". If the app would do it again to
NEW data, report it: that is a real finding and this exclusion does not touch it.
Also not findings: anything the evidence sheet already disposes (§5, §6) — unless you think the disposition is wrong;
then say why.

## What to hand back
- Findings ranked by severity, each with: the file and line; setup → action → what the screen shows → what it should
  show; whether it is new with this branch or already on `main` (check `git show main:<path>`); and **exact,
  step-by-step fix instructions**, not a direction.
- **Explicit negatives** — "I checked X and found nothing" — for each of the six areas above.
- Plain words. Under 1,500 words.
