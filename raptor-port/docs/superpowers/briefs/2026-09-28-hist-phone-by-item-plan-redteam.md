# Red-team brief — the `[HIST-PHONE-HIDE]` + `[CHG-BY-ITEM]` plan (28 Sep 26), round 1

You are reviewing a PLAN, before any code is written, for a React/TypeScript scheduling app. The repo for this work is
the worktree `C:\Users\User\projects\Raptor-hist` (branch `claude/hist-phone-by-item`, cut from `main`), the app in
`raptor-port/`. You did not write the plan. Read-only: change nothing, run nothing that writes.

**Read first:**
- The plan: `raptor-port/docs/superpowers/plans/2026-09-28-hist-phone-by-item-plan.md`.
- The owner's rulings it builds: `.claude/rules/decisions/scheduler.md` rows **D339, D340, D344, D345** (the approved
  design), and the standing ones it must not break: **D92, D116, D119, D167, D168, D169, D170, D171, D172, D263, D338**;
  `.claude/rules/decisions/how-we-work.md` **D56, D90, D201**. Where two rulings conflict, the later one wins.
- The approved mock-ups (pictures of the real app with the proposal drawn on):
  `raptor-port/docs/img/handpass/2026-09-28-draft-pending/histphone/histphone-mockup.png` and
  `raptor-port/docs/img/handpass/2026-09-28-draft-pending/byitem/byitem-mockup.png`; the scripts that drew them,
  `raptor-port/scripts/handpass/dp-histphone.mjs` and `dp-byitem.mjs`.
- The code the plan names: `src/ui/ChangesWindow.tsx`, `src/ui/changesmodel.ts` (+ `.test.ts`), `src/ui/changesopen.ts`,
  `src/ui/floatwin.ts`, `src/ui/histbubble.ts` (+ `.test.tsx`), `src/engine/editlog.ts`, `src/engine/rowids.ts`
  (`ridKey`, `posKey`, `keyLevels`), `src/state/changelines.ts`, `src/state/changes.ts`, `src/state/view.ts` (`CHGWIN`,
  `setChgWin`, `HISTMODE`), `src/ui/EditWeek.tsx`, `src/ui/SchedBoard.tsx`, `src/ui/ViewWeek.tsx`, `src/ui/highlights.ts`,
  `src/ui/peek.ts`, `src/ui/scheduler.css` (`.chgwin`, `.seat[data-og]`, `.tdghost.lift::before`, `.histbub`),
  `src/ui/interactions.ts` (`jumpToChange`), `src/ui/pendlist.ts`, `e2e/changeswin.spec.ts`,
  `scripts/handpass/dp-walk.mjs`. The contract: `raptor-port/docs/ui-contracts.md` §The one changes window and
  §History on the board.
- The rules for building in this area (Codex does not load these by itself): `.claude/rules/raptor-executor.md`,
  `.claude/rules/decisions/scheduler.md`, `.claude/rules/bug-check.md` and `raptor-port/docs/bug-check-order.md`.

**Your job — find what is WRONG and what is MISSING.** Do not merely review the plan's text. Starting from the owner's
promise and the rulings, enumerate every qualifying object, renderer, visible door, writer, reader, downstream consumer,
role, overlay and meaningful order of actions. **Assume every existing line may be correct and the defect may be a
MISSING call site.** For each item, state where the visible sign and the working gesture should exist in the production
app. Then rank concrete failure scenarios with setup, action, expected result, and the observation that would disprove
correctness. Start with the least-shared or most specialised surface.

Specifically ask:
1. Does the plan honour every approved call (H1–H5, I1–I7) and every standing ruling — and does any ruling ask for
   something the plan leaves out or reads wrongly? Name the ruling and the gap. Are the plan's stated readings (the
   typed box's dot inside its corner; the hint on the phone only; the View-only bar's words; the bar's count; Who's
   folding) defensible, or does a ruling already answer them differently?
2. **The gold dots.** Is "the bubble's own keys, by a pass after each repaint" the right mechanism? Every surface and
   cell kind that draws a detail with a history — which does the plan miss, or dot wrongly (a version look, a saved
   plan, the peek, a palette, the ALL AVAIL window, a drag ghost, the board over the week, View-only)? Every repaint
   path that could leave the dots stale (a per-block swap, a repaint skipped under the caret, a week change, a board
   day change, a notify that repaints nothing). Does `position:relative` on a non-seat cell break anything drawn inside
   it? The dot beside the OG / AL tags, a flag ring, a SANS edge, a warning chip. The cost of the pass.
3. **Items.** Is the item table complete for every key the history can hold (every prefix `logEdit` can receive — look
   at `slots.ts noteChange`, `publish.ts markEdit`, `txtSet` — and every keyless writer)? Is identity by the
   row-anchored key right in every case — a deleted row, a row moved within a day, a row moved to another day, a copied
   day (template, duplicated wave — re-minted rids), a saved plan brought out (rids kept), a week never loaded, a line
   whose key was dropped (`elogRemap`)? The move's two entries: their words, their taps, their "new" dots, the counts.
   The week view's day-first titles. Who's item-first lines.
4. **Hide / Show / the bar.** The drag on the bar, the phone layout breakpoint, the bar's place after the panel was
   dragged, the bar over the board and over View-only, ✕, a week or page change while hidden, a tap on a line (the
   existing bar), the ALL AVAIL window beside it.
5. What makes the plan bigger than it needs to be — or a simpler design that serves every approved call as well.

**What is NOT a finding (the owner, D56):** This app is pre-promulgation and its entire stored world is DEMO DATA that
will be CLEARED before the database step. **Do not report a problem whose harm exists only in data already stored when
the code is already correct going forward** — no migration, no back-compat, no "an existing record would read wrongly".
If the app would do it again to NEW data, report it: that is a real finding and this exclusion does not touch it.

**Your report:** findings ranked most severe first, each with an id, a severity, the evidence (file and line), the
concrete scenario, and **exact, step-by-step fix instructions** for the plan (not a direction). Then **explicit
negatives** — what you checked and found sound. Plain words where you can; the owner does not read code.
