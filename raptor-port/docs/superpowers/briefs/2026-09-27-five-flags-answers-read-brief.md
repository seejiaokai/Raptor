# Read brief — his answers to the five-flags look card, built (D270, D271, D272, D275) — the final code read (Fable and Astra, blind to each other), 27 Sep 26

You are reading a finished change on branch `claude/five-flags-batch-continue-2cfa70` in
`C:\Users\User\projects\Raptor\.claude\worktrees\trk-smoke-add-race-bug-007eed`. You did NOT write it. **Read-only:
change nothing, run no server, rebuild nothing, run no test suite** (other chats share this PC and its check lock). The
other provider reads the same change at the same time; you will not see each other's report before both exist
(bug-check order §4).

## The four promises (the owner's own words, 27 Sep 26)
1. **D270, "Q2 yes"** — on the signed-in man's OWN puck a flag's ring wins over the purple "this is you" ring: amber
   advisory, thin red, grey note, the dotted "causes tomorrow's breach" ring (alone), exactly as another man's puck shows
   it, with no glow (D164). The purple FILL stays and still says "you". Unflagged, his puck keeps the purple ring + glow.
2. **D272, "question 2 yes"** — in OIL Earn mode his own puck shows the GREEN OIL ring, not the purple one; purple fill stays.
3. **D271, "Q1 refused"** — a man put on a row he is already on is REFUSED — one man, once per row. The drop (from the crew
   list or from another row) and the palette tap on an armed "+ add" write nothing: the row keeps its one copy, nothing
   reads pending, and the app says why ("Ranger — already on FLIGHT SAFETY STAND-DOWN 08:30–09:00 · not added twice").
   Narrows the 13 Aug 26 "everything plants, warning after" rule for this one case. Readings stated to him: (1) a man on
   two DIFFERENT rows at once is still only warned; (2) a swap of two men inside one crowd still works; (3) a crew-list man
   dropped onto ANOTHER man's place in a crowd he is already in is refused the same way; (4) judged before anything is
   written, at every door, as D33's placeholder-on-a-cockpit refusal is.
4. **D275, "I still prefer these"** — the desktop week goes back to NO room beside the ‹ arrow (everything
   `[VIEW-ARROW-OVER-LIST]` added comes out; the week is `main`'s again there).

## Read, by path (nothing under `.claude/rules/` loads for you by itself)
- The rulings: `.claude/rules/decisions/scheduler.md` (D270–D275, D164; §Settled "Board behaviour", "Week navigation"),
  `.claude/rules/decisions/oil.md` (D33, D43, D47 — the placeholder refusal D271 copies), `.claude/rules/decisions/how-we-work.md`
  (D56), `.claude/rules/raptor-executor.md`.
- **The evidence sheet — the roll-calls are §3 (a: every surface of the "you" ring; b: every door onto a row; c: every
  landing), the break tests §4, the walk §5, what was NOT walked §6:** `raptor-port/docs/handpass/2026-09-27-five-flags-answers.md`.
  Fable's scenario design: `raptor-port/docs/superpowers/specs/2026-09-27-five-flags-builds-scenarios-fable.md`. The batch
  this builds on (for context only): `raptor-port/docs/handpass/2026-09-26-five-flags.md`.
- The change: `git diff a0a164a3 -- raptor-port/src raptor-port/e2e raptor-port/docs/ui-contracts.md raptor-port/docs/engine-rules.md raptor-port/docs/feature-impact.md`
  (`a0a164a3` is the batch before these answers; `git log a0a164a3..HEAD` for the story). The heart of each:
  `src/ui/scheduler.css` (`.puck.me` split in two; the `.puck.me:not(.warn):not(.boxred):not(.boxdash):not(.boxdot):not(.oilglow)`
  ring; the deleted `.puck.me.boxred/.boxdash/.boxdot/.warn`; the desktop `.week` padding); `src/engine/avail.ts`
  (`rowTwice`, and `slotBar` asking it first — before the ⓘ info-row exit); `src/ui/drag.ts` (`applyDrop` — the seat
  branch for a roster drop and BOTH ends of a swap, the cell branch); `src/state/view.ts` (`placeArmed`; `weekInset`
  removed from `weekLeftDay` / `scrollWeekToDay`); `src/engine/slots.ts` (`fillSlot`'s belt); `src/ui/highlights.ts`
  (back to `main`); the tests `src/ui/flagglow-css.test.ts` (a hand-resolved cascade), `src/ui/lift-css.test.ts`,
  `src/ui/rowtwice-refusal.test.tsx`, `src/engine/crowdself.test.ts`.

## The job — find what is MISSING, not only what is wrong
> Do not merely review the changed code. Starting from the user promise and the applicable rulings, enumerate every
> qualifying object, renderer, visible door, writer, reader, downstream consumer, role, overlay and meaningful order
> of actions. **Assume every existing line may be correct and the defect may be a MISSING call site.** For each item,
> state where the visible sign and the working gesture should exist in the production app. Then rank concrete failure
> scenarios with setup, action, expected result, and the observation that would disprove correctness. Start with the
> least-shared or most specialised surface.

Concretely:
1. **The rings.** Is there any state class a "you" puck can carry that the `:not()` list misses, so the purple ring still
   hides it (the clicked-warning focus `wfoc` is not added while a warning is focused — check), or any context rule
   (`@media`, the board, the palette's standby / busy inset, the print sheet, a published look, the ALL AVAIL window,
   the drag ghost) where his puck now shows something ANOTHER man's puck does not? Does removing the ring's `!important`
   from flagged "you" pucks let a lower rule (`.puck.hl`, `.puck.sel`, `.dragimg`) now paint over a flag ring on HIS puck
   only? Is `flagglow-css.test.ts`'s hand-made cascade right (specificity of `:not()`, `!important`, order, the
   `background` shorthand), and does its class cross-product cover every ring set `html.ts puck()` can emit?
2. **Every door onto a row.** Any way a man reaches a row he already stands on that does not pass `rowTwice` before its
   write: the board and the week (both surfaces call `applyDrop`?), the finger path, the armed "+ add" and an armed empty
   place, a SWAP whose second end is the copy, a move from another row, the sim's `.*` / `.pax.+` keys, a desk's or a
   ground row's primary seat versus its `.xN` extras, the SC shift / AVALON seats, an ⓘ row, the accepted-request row,
   `iu:` reassign, the Inputs page, templates / duplicated waves / plans, undo/redo, the command layer's
   `writeSlot` / `writeFill`. And the reverse: anything refused that must not be (a swap inside one crowd; a move to the
   end of his own crowd; a man planted onto his OWN place; a placeholder; a man on a DIFFERENT overlapping row; a
   flying line — the same man FCP and RCP of one jet is a different rule).
3. **Does the refusal leave the app consistent?** Nothing written, nothing pending, no Undo step, no edit-log line, the
   drawer / the arm / the drag state / the landing flash as they should be; the words the same in the caption, the crew
   list's struck line and the toast; the "N free" head count; the green "where can he go" rings.
4. **The arrow revert.** Anything of `[VIEW-ARROW-OVER-LIST]` left behind (a reader of `scrollPaddingLeft`, a comment, a
   test helper, a doc) or anything reverted that belonged to another item of the batch.
5. **The tests.** A check that passes while the thing it names is broken (a vacuous pass), and any wired place with no
   break test (§4 of the sheet).

## What is NOT a finding (owner, D56)
This app is pre-promulgation and its entire stored world is DEMO DATA that will be CLEARED before the database step.
**Do not report a problem whose harm exists only in data already stored when the code is already correct going
forward** — no migration, no back-compat, no "an existing record would read wrongly" (a row that already holds a man
twice, written before D271, is exactly this). If the app would do it again to NEW data, report it: that is a real
finding and this exclusion does not touch it.
Also not findings: anything the evidence sheet already disposes — unless you think the disposition is wrong; then say why.

## What to hand back
- Findings ranked by severity, each with: the file and line; setup → action → what the screen shows → what it should
  show; whether it is new with this branch or already on `main` (`git show main:<path>`); and **exact, step-by-step fix
  instructions**, not a direction.
- **Explicit negatives** — "I checked X and found nothing" — for each of the five areas above.
- Plain words. Under 1,500 words.
