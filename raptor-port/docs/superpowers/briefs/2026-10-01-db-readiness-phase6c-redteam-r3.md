# Red-team brief — [DB-READINESS] group A, PHASE 6 step (c) v3, ROUND 3 (the last) — 1 Oct 26

You are red-teaming a PLAN before any code is written. Work READ-ONLY: read files, run nothing that writes. Report in the
format below, as your final message.

**The plan:** `raptor-port/docs/superpowers/plans/2026-09-30-db-readiness-phase6-plan.md` — §3 (c) is now **v3** (a holder
base), with §8 items 5–10. §2 (the doors, "a derived change is made after its command") and the built steps (a), (b), (d)
stand; read them for context. v2 = commit 0894227c. **Round 2's two reports and the dispositions v3 answers:**
`raptor-port/docs/superpowers/briefs/2026-09-30-db-readiness-phase6-redteam-r2-fable.md`, `…-r2-astra.md`,
`…-dispositions-r2.md` — read all three; judge whether v3 closes each round-2 finding, and what v3 itself breaks.
**The design of record:** `raptor-port/docs/data-model.md` §3 (ScheduleWeek, ScheduleDay, Input), §9 (rule 9; rule 11 on
Undo), §11 (permissions).

**The owner's rulings** — from the live files, not memory: `.claude/rules/decisions/scheduler.md`, `oil.md`,
`people-accounts.md`, `how-we-work.md` (one line each); the full rows in `.claude/decisions-full/<same name>` (search:
`grep -h '^| D363 |' .claude/decisions-full/*.md`). The ones v3 names: D18, D91, D98, D114, D170 / D172, D174–D178, D271,
D297, D363, D450, D467, and the 16 Sep 26 rule "a request filed live on a published day lands on the working copy as a
pending amendment" (`raptor-port/docs/engine-rules.md`). Also `.claude/rules/raptor-executor.md` and
`raptor-port/docs/bug-check-order.md` §2b.

**The code** is under `raptor-port/src` — the plan names what it relies on; check each claim against the code (the
branch is `claude/db-readiness-p6c-holder-base`, cut from the phase-6 branch with (a), (b), (d) built). The places that
matter most: `engine/overlay.ts`, `engine/weekstash.ts` (`stashDays`, `stashGroundBySrc`, `rowElsewhere`),
`engine/weekctx.ts bundle`, `ui/peek.ts`, `engine/slots.ts` (`acceptInput`, `autoAcceptInput`, `relandInputs`,
`reconcileDayFiling`, `unacceptInput`), `engine/drafts.ts` (`loadVersionToWorkingCopy`, `draftSelect`, `rebaseDayPending`,
`reconcileIssuedMarks`), `engine/publish.ts` (`dayFilingFingerprint`, `filingSame`, `filingRestorePlan`, `dayDiscardCount`,
`dayShownPendCount`, `discardableCount`), `engine/oilev.ts` (`landedStanding`, `stashStanding`), `state/store.ts`
(`applyWeekModel`, `loadWeek`, `initStore`, `weekStashSnap`), `state/sched-commit.ts` (`applyEnd`, `schedWriteRecords`,
the commit helpers), `command/commit.ts` (the phases — when a phase-8 effect runs, what it can see), `state/persist.ts
scheduleRows` (which day rows a command writes, from what), `state/person-delete.ts`, `ui/inputedit.tsx`
(`commitNewInput`, `commitInputEdit`, `removeInput`, `dropInputRow`), `ui/InputsPage.tsx`, `state/perms.ts
ownershipViolation`.

## What to do

> Do not merely review the changed code. Starting from the user promise and the applicable
> rulings, enumerate every qualifying object, renderer, visible door, writer, reader, downstream
> consumer, role, overlay and meaningful order of actions. **Assume every existing line may be
> correct and the defect may be a MISSING call site.** For each item, state where the visible sign
> and the working gesture should exist in the production app. Then rank concrete failure scenarios
> with setup, action, expected result, and the observation that would disprove correctness. Start
> with the least-shared or most specialised surface.

The questions for THIS round:

1. **The holder base (§2, §5).** Is "the base moves for a day whose row the command wrote, or whose live content / marks
   differ from what the last pass left; then it becomes the view" sound? Find an order of commands, Undo / Redo, week
   loads and reloads after which the base is not the stored row, or the view right after an act differs from the view
   after a reload. Is anything written OUTSIDE a command, or read inside one, that the pass would absorb wrongly (the
   rollback path, `histRestore`, a nested command, a projection raised at phase 8/9, the posting pass, an off-week Undo)?
2. **The marks (§5).** Base marks / rebuilt from the issued version / base less the dangling: find a sequence on a
   published or unpublished day that leaves a wrong mark, or a count ("N pending", "Clear the marks … (N)", the load's
   "Discard N edits", the sign-offs) that differs right after vs after a reload.
3. **`kept` (§1, §3 rule 3, the stated limits).** Is the lifecycle right against D363 and D175? Is the first stated limit
   acceptable, or does it make a real failure on new data?
4. **The view and the finder (§3, §4).** Rules 1–7, the landing (start day only; a published day only if its current
   issued version never saw the request; the deterministic id `'r' + <request id>`), the finder without landing, the
   memo key. Recursion, a second row, a row that should stand and does not, an id collision, a published day churned at
   load, and OIL: does anything in v3 change what a man earns (`oilev.ts landedStanding` / `stashStanding`, the Leave War's
   OIL pass)?
5. **The commands (§6, §9).** Is anything a holder intends now unsaved, or anything derived now saved? Every door that
   files, edits or deletes a request (the dialog, the Inputs page, the in-place cells, the calendar drag, a reassign, the
   medical cascade, the Leave War's absence door and remarks editor, the clear-old-data sweep). Does §9 refuse a member
   action that must work?
6. **The load and the boot (§8)**, the removal of `sched.load`, and §7 (a whole-day replacement, the load's count), against
   D98, D114, D174–D178, D363, the 16 Sep 26 rule, and §8's list of visible changes — is any visible change missing from
   §8?

**And this, in the same breath — WHAT IS NOT A FINDING (owner, D56):**

> This app is pre-promulgation and its entire stored world is DEMO DATA that will be CLEARED before
> the database step. **Do not report a problem whose harm exists only in data already stored when
> the code is already correct going forward** — no migration, no back-compat, no "an existing
> record would read wrongly". If the app would do it again to NEW data, report it: that is a real
> finding and this exclusion does not touch it.

## How to report

- Each finding: a short title; severity (BLOCK / HIGH / MEDIUM / LOW); the concrete scenario (setup, action, expected,
  what would be observed); the code evidence (file and function); and **exact, step-by-step fix instructions** — not a
  direction. Say whether it can be fixed during the build (named in the build's checklist) or must change the plan first.
- **Explicit negatives:** for each of the six questions, what you checked and found nothing in ("I checked X").
- A verdict: APPROVE / REVISE / BLOCK. **This is round 3, the last of the owner's cap of about three** — after it, findings
  fold into the build and the final code reads. Say which findings, if any, genuinely cannot be folded into the build.
- No restatement of the plan, no preferences, no style.
- You are one of two reviewers working blind to each other; do not look for or read another review of THIS round (files
  named `…-r3-…`).
