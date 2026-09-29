# Brief — the small-fixes batch: red-team the plan AND design the walk's scenarios (28 Sep 26), round 1

You are reviewing a PLAN, before any code is written, for a React/TypeScript scheduling app. The repo is the worktree
`C:\Users\User\projects\Raptor\.claude\worktrees\trk-smoke-add-race-bug-007eed` (branch `claude/small-fixes-batch-d223f6`,
cut from `main`), the app in `raptor-port/`. You did not write the plan. Read-only: change nothing, run nothing that writes.
Another reviewer (a different model) is doing the same job blind to you; do not look for their report.

**Read first:**
- The plan: `raptor-port/docs/superpowers/plans/2026-09-28-small-fixes-batch-plan.md` — seven parts (A–G), each an item
  from `OUTSTANDING.md` (grep the item id there for its full text: `[AVAILWIN-PREVIEW-BAR]`, `[GHOST-FLAG-SHADOW]`,
  `[ALLAVAIL-OPEN-ROW]`, `[AMEND-SMALL-SEEN]` (items 1, 3, 4, 5, 9 only), `[REQ-ORPHAN-ROW]`, `[REQ-DOOR-WORDS]`,
  `[LW-ISO-DATES]`, `[LW-SPARE-MOVE-DOORS]`, `[ABSENCE-SMALL-SEEN]`).
- The owner's rulings: `.claude/rules/decisions/scheduler.md`, `oil.md`, `leave-war.md`, `how-we-work.md` (the plan's §0
  lists the rows it must keep — D27, D31, D36–D41, D44, D45, D65, D66, D77, D92, D98, D103, D114, D164, D167, D168, D174–D179,
  D260–D266, D270, D272, D275, D300, D330–D335; and D56, D90, D201, D29). Where two conflict, the later one wins.
- The rules for building here (Codex loads none of these by itself): `.claude/rules/raptor-executor.md`,
  `.claude/rules/bug-check.md`, `raptor-port/docs/bug-check-order.md`, `raptor-port/CLAUDE.md` (the architecture rules,
  the mutation and persistence funnels).
- The code the plan names, at least: `src/ui/floatwin.ts`, `src/ui/AvailWindow.tsx`, `src/ui/ChangesWindow.tsx`,
  `src/ui/SchedBoard.tsx` (the preview bar, lines ~230–270), `src/ui/scheduler.css` (`.availwin`, `.chgwin`, `.dprev-bar`,
  `.sb-side`, `.dragimg`, `.tdghost`, `.lift`, the ring rules `.puck.boxred` / `.boxdash` / `.boxdot` / `.warn*` / `.me` /
  `.wfoc*`, `.form .csmsn`, `.sb-line`, the `[data-alc]` tags), `src/ui/drag.ts` (`setDragImage`, `tdArm`, `ghostXf`),
  `src/ui/toast.ts`, `src/state/sched-commit.ts` (`commitPublish`, `commitUnpublish`), `src/leavewar/sync.ts`
  (`publishFlagsBids`), `src/engine/publish.ts` (`currentBindNow`, `signBoundOk`, `rowsLeftOut`, `AL_COLORS`),
  `src/engine/canonical.ts`, `src/engine/order.ts` (`groundOrder`), `src/engine/restore.ts` (`dayKeys`),
  `src/engine/reorder.ts` (`sortGround`), `src/engine/slots.ts` (`acceptInput`, `acceptedDay`, `reconcileLandedAcc`,
  `relandInputs`, `reconcileDayFiling`, `unacceptInput`), `src/engine/weekstash.ts`, `src/engine/drafts.ts` (`leaveOut`,
  `draftSelect`, `loadVersionToWorkingCopy`), `src/ui/inputedit.tsx` (`landedOnUnloadedWeek`, `removeInput`,
  `dropInputRow`), `src/ui/html.ts` (`accCtl`, the preview banner ~1515–1545), `src/ui/interactions.ts` (the `data-acc`
  and `data-draftgo` handlers), `src/ui/board.ts` (`switchDraft`), `src/ui/pendlist.ts` (`requestName`, `requestWords`,
  the input branch), `src/state/changelines.ts`, `src/engine/oil.ts` (`w2`, `dayOilWork`), `src/engine/oilev.ts`,
  `src/ui/oilmode.ts` (`oilSentinelSummary`), and the Leave War sheets the plan's part G names.

**Job 1 — find what is WRONG and what is MISSING in the plan.** Do not merely review the plan's text. Starting from the
owner's promise and the rulings, enumerate every qualifying object, renderer, visible door, writer, reader, downstream
consumer, role, overlay and meaningful order of actions. **Assume every existing line may be correct and the defect may
be a MISSING call site.** For each item, state where the visible sign and the working gesture should exist in the
production app. Then rank concrete failure scenarios with setup, action, expected result, and the observation that would
disprove correctness. Start with the least-shared or most specialised surface. Specifically:
1. **A (the windows):** every surface a floating window can open over on the board, the edit week and View-only (the
   preview bar, the armed "Discard N edits & load — confirm" bar that is taller, the working-draft bar on View-only, a
   bar that appears or grows while a window is already open, a window he dragged, the two windows together, the phone and
   a short screen). Is "re-place on the next animation frame" sound, and is there a simpler, exact trigger?
2. **B (the ghost):** is `filter: drop-shadow` on the ghost right — does it get clipped by the puck's `overflow:hidden`,
   does it shadow the hover reason bubble (`.dwhy`, `.haswhy`), does it cost a repaint per move on a `will-change`
   layer, does it survive the touch ghost (`.tdghost`) and the mouse ghost (`.dragimg`) alike? Every ring state a
   draggable puck can wear (list any the plan misses).
3. **C (the open-ended row):** is the investigation right? Is the proposed change safe for the frozen crowd at
   publication (D44), the pending count, the OIL money walk (D31 — nothing may be credited from a guessed hour), the
   window's two tabs, a sim / duty / ground row with no end? What would a "?" chip break?
4. **D1 (the toast):** what else in the app speaks twice in one breath and would now be joined — list the call sites and
   say whether each join helps or harms. Is "the same task, a zero-delay timer marks the turn" right in jsdom tests with
   fake timers?
5. **D9 (the signature):** does binding the digest to the SHOWN order open a hole — a real, visible change that no
   longer clears the sign-offs (a hand-ordered day, `gman`, a row with no start time sorting to the end, two rows with
   the same start, the Common Programme's own order, another section's `Sort`)? Is anything else bound by position?
6. **E (requests):** the week-boundary helper — every reader of "is this request landed" that it must reach and does
   not (the OIL walk's claim rows, `inputFlags` / `inputDormant`, the Inputs page's own status, the pending comparison's
   filing fingerprint, `relandInputs`' `unaccepted` set, the Leave War's day view, `person-delete.ts`'s sweep); what a
   PUBLISHED day's pending count does when a request's filing changes from '' to 'g' by navigation (the P2-REV2-05
   "phantom input-amendment from navigation alone" hazard); a week never visited (no stash); the plan-switch re-file
   from 'r' to 'g' against D174/D176/D98.
7. **F, G:** the same questions for the wording changes: every door that shows the same act, so no two say it
   differently.
8. What makes the plan bigger than it needs to be, or a simpler design that serves every ruling as well.

**Job 2 — design the walk's scenarios** (bug-check order §4 rank 1: you work from what was PROMISED, not from what will
be built). For each part A–G: the scenarios that would prove it right or wrong in the RUNNING app — setup through the
app's own controls, the action, what the screen must show (in the app's words), and what would prove it wrong; both
orders of every pair of actions; the phone and the desktop; after publishing. Mark the three you would walk first.

**What is NOT a finding (the owner, D56):** This app is pre-promulgation and its entire stored world is DEMO DATA that
will be CLEARED before the database step. **Do not report a problem whose harm exists only in data already stored when
the code is already correct going forward** — no migration, no back-compat, no "an existing record would read wrongly".
If the app would do it again to NEW data, report it: that is a real finding and this exclusion does not touch it.

**Your report:** findings ranked most severe first, each with an id, a severity, the evidence (file and line), the
concrete scenario, and **exact, step-by-step fix instructions** for the plan (not a direction). Then the scenario list.
Then **explicit negatives** — what you checked and found sound. Plain words where you can; the owner does not read code.
