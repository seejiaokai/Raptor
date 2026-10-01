# Red-team brief — [WARN-HIDE-KEPT] the hidden-warnings change (D469, D471, D472, D475) — round 1 — 1 Oct 26

You are red-teaming a PLAN before any code is written. Work READ-ONLY: read files, run nothing that writes (the one
file you may write is your own report, named at the foot). Report in the format below, as your final message.

**The plan:** `raptor-port/docs/superpowers/plans/2026-10-01-warn-hide-kept-plan.md` — read it whole. §1 is what the
owner ruled; §2 what the code does today; §3 the design; §4 the rulings; §5 the roll-call of every reader of a warning
or a puck's flag; §8 the build order; §10 what is left as it is.
**The picture he approved (D475):** `raptor-port/docs/mock/warn-hide.html` (its pictures `raptor-port/docs/mock/img/warn-hide/`).

**The owner's rulings** — from the live files, not memory: `.claude/rules/decisions/scheduler.md` and
`.claude/rules/decisions/how-we-work.md` (one line each); the full rows in `.claude/decisions-full/<same name>` — search
with the shell, e.g. `grep -h '^| D469 |' .claude/decisions-full/*.md`. The ones this plan stands on: **D469, D471, D472,
D475**; D45, D97, D98, D99, D101, D103, D168, D179, D183, D184, D185, D187, D188, D346, D363; D56 and D473 (how we work).
Also the Aug 26 rule the plan replaces in part: `raptor-port/docs/ui-contracts.md` §Muting a check. Also
`.claude/rules/raptor-executor.md` and `raptor-port/docs/bug-check-order.md` §2b, §4.

**The code** is under `raptor-port/src` (branch `claude/warn-hide-kept`, cut from `main`; nothing of this is built yet —
check each claim of §2 against the code, and each design step of §3 against what the code can actually carry):
`engine/validate.ts` (`validateCore` — `add`, `markRing` / `markChip` / `markDash` / `markTrace` and every site that calls
them; `LIVE_ON_FACE`; `validate`, `officialFor`, `withIssuedWeek`, `faceWarn`, `versionFaceWarn`, `warnSliceOf`,
`HOOKS.issuedWarn`, `HOOKS.warnNow`, `withOfficialWarn`, `workingWarn`, `crossDayIfPlaced`, `lgFired`),
`engine/publish.ts` (`daySnap`, `freezeWarn`, `warnSliceKey`, `warnDelta`, `dayDelta`, `dayDeltaCore`, `dayPendingItemsIn`,
`itemCounts`, `diffCounts`, `pendingKey`, `signBoundOk`, `alIssue`, `publishALDay`, `unpublishDay`, `retiredEntry`,
`dayDiscardCount`), `engine/drafts.ts` (`loadVersionToWorkingCopy`, `reconcileIssuedMarks`, `draftSelect`),
`engine/hooks.ts`, `engine/avail.ts`, `engine/insights.ts`, `state/view.ts` (`WARNOFF`, `warnMuteKey`, `toggleWarnOff`,
`VIEW_RESET`, `displayedByDay`, `displayedBundle`, `selectPerson`, `warnFocusMap`, `afterSchedMutate`), `state/store.ts`
(`initStore`, `applyWeekModel`, `loadWeek`, `resetSession`, `weekStashSnap`), `state/history.ts` (`histSnap`,
`histRestore`), `state/sched-commit.ts` (the `sched.mutes` record, `decompose`, the restore of a record, `commitSched`),
`state/weekrows.ts`, `state/persist.ts`, `state/dropflag.ts`, `state/changelines.ts`, `undo/describe.ts`,
`ui/html.ts` (`dayWarnHTML`, `dayTraceHTML`, `dayInfoHTML`, `exemptDeskOwn`, `personWarnMsgs`, the puck marks),
`ui/board.ts boardWarnHTML`, `ui/board-html.ts`, `ui/palette-html.ts`, `ui/interactions.ts` (the `data-woff` handler),
`ui/pendlist.ts`, `ui/highlights.ts`, `ui/AvailWindow.tsx`, `ui/Modals.tsx`, `ui/printpdf.ts`, `ui/export.ts`. The tests
that pin today's behaviour: `state/warnmute.test.ts`, `ui/warnmute-week.test.ts`, `state/view-reset.test.ts`,
`state/sched-routing.test.ts`, `ui/latepub.test.tsx`, `engine/parity.test.ts`, `ui/html.test.ts`.

## What to do

> Do not merely review the changed code. Starting from the user promise and the applicable
> rulings, enumerate every qualifying object, renderer, visible door, writer, reader, downstream
> consumer, role, overlay and meaningful order of actions. **Assume every existing line may be
> correct and the defect may be a MISSING call site.** For each item, state where the visible sign
> and the working gesture should exist in the production app. Then rank concrete failure scenarios
> with setup, action, expected result, and the observation that would disprove correctness. Start
> with the least-shared or most specialised surface.

The questions for this round:

1. **"Each mark knows its warning" (§3.2).** The plan attributes a ring, chip or dash to "a warning of that day and that
   code naming that man". Go through EVERY mark site in `validateCore` and say whether that holds: a mark whose man is
   not in the `who` of the warning beside it; a mark with no warning; a warning raised under one code and marked under
   another (`DNIF_FLY` / `LEAVE_FLY` / `INPUT_FLY`, `CREW_TIGHT` / `TURN`, the `DT` chip and `DT_SUM`); the deduplicated
   `add`; the two kinds of trace (crew rest, the 7-day run) and the cross-week ones. Name every site where the rule would
   keep a flag that should go, or drop one that should stay. Is replaying `marks` guaranteed to rebuild the same maps the
   day loop writes when nothing is hidden?
2. **The shown bundle and the raw one (§3.2, §3.3).** With `WARN` now "as shown" and `OFFICIAL` raw: find a reader that
   gets the wrong one — a comparison that would now read a hide as a warnings change (`warnSliceKey`, `warnSliceOf`,
   `HOOKS.issuedWarn`, `officialDiverges`, an identity check such as `WARN===officialWarn()`), a memo keyed on a bundle's
   identity that goes stale or thrashes, an engine probe that must see a hidden breach and would not, a `withDaySnap` /
   `withIssuedWeek` / `withVersionWarn` swap that restores the wrong one. Is §5 missing a reader? (It was made from a
   sweep; assume it has holes and look for them.)
3. **The published day (§3.4).** Is `w.wo` + `w.shown` + the shown `w.face` enough to draw every published face and every
   look at an older version exactly as it went out, the live-on-face warnings included? Find an order of actions — hide /
   publish / amend / unpublish / load a version / Undo / Redo / a reload / a callsign rename / a rule or people change —
   after which (a) a published face shows a flag or hides one it did not go out with, with nothing pending; (b) the count
   of pending changes, "Not yet signed", the sign-offs or the publish button disagree with each other or with the list;
   (c) a hide is counted twice (once as a hide, once as "warnings changed"); (d) D98 fails (a day back to what was
   published still reads pending, or the reverse). Is "one pending change per warning whose hidden state differs, among
   today's judgement of the issued day" the right set — what about a warning hidden as issued that today's judgement no
   longer raises, or one that only the working copy has?
4. **Kept for everyone (§3.5).** The boot read-back, the session reset, the baseline, Undo / Redo (D148: his own change
   only; refuse when another has changed that day's hides since), a restored record, the week stash, a week left and
   returned to, a second week. Find an order after which a saved hide is lost, doubled, attached to the wrong day or
   week, or written outside a command. Does the change of the key's shape (callsigns folded to ids) break any writer or
   reader of `wo` (`weekrows.ts splitParts` keys by the leading day)?
5. **The lists and the counts (§3.6, §5).** Every count and colour that must drop a hidden warning, every list that must
   keep it struck; the person-narrowed list; "also flagged on"; the "new once signed" / "goes away once signed" rows
   beside a struck line; the day with every issue hidden; the board's panel on a phone (folded); a look at a version.
   Is anything on screen still naming the removed "N hidden" line?
6. **What the plan leaves (§10)** — is any of the four a real failure on new data rather than an accepted limit?
7. **Anything the plan did not think of** — a role, a surface, an order of actions, a ruling it contradicts.

**And this, in the same breath — WHAT IS NOT A FINDING (owner, D56):**

> This app is pre-promulgation and its entire stored world is DEMO DATA that will be CLEARED before
> the database step. **Do not report a problem whose harm exists only in data already stored when
> the code is already correct going forward** — no migration, no back-compat, no "an existing
> record would read wrongly". If the app would do it again to NEW data, report it: that is a real
> finding and this exclusion does not touch it.

## How to report

- Each finding: a short title; severity (BLOCK / HIGH / MEDIUM / LOW); the concrete scenario (setup, action, expected,
  what would be observed); the code evidence (file and function); and **exact, step-by-step fix instructions** — not a
  direction.
- **Explicit negatives:** for each of the seven questions, say what you checked and found sound ("I checked X and found
  nothing").
- A verdict on the plan: APPROVE / REVISE / BLOCK, and the three findings that matter most.
- Plain text or Markdown; no need to restate the plan.
