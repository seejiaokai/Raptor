# Final code read — brief ([DB-READINESS] group A phase 7, the small OIL follow-ups, 1 Oct 26)

You are an independent reviewer of FINISHED code (bug-check order §4 rank 2 — both providers, blind to each other; this
batch touches earned leave, the published record and saved data). You did not write it. READ-ONLY: change no file.

## Read first (live files — read them; this brief only points)
- **The change:** `git diff 7612b19d..HEAD -- raptor-port/src` (the base is `main`). Read every changed file whole where the
  change sits inside a larger body — `engine/oilev.ts` (`oilEvidence`), `engine/validate.ts` (`crowdClashes`, the sim
  brief block of the warning pass, `SIMW`), `engine/slots.ts` (`setSlotVal`), `ui/oilmode.ts` (`inertWhy`, `OIL_NO_MOVE`),
  `ui/AvailWindow.tsx`, `state/view.ts` (`AVAILWIN_FOOTID`), `ui/pops.ts`, `ui/logic-html.ts`, `ui/drag.ts`, `engine/stores.ts`, `engine/cxreasons.ts`, `engine/qualcols.ts`,
  `leavewar/state/store.ts` (`readManningRules`, `saveManningRule`), `leavewar/ui/CounterForm.tsx`, `leavewar/sync.ts`
  (`carriedRemark`, `doorDecideApproved`), `leavewar/engine/requirements.ts`, `probe-bridge.ts`.
- **The plan:** `raptor-port/docs/superpowers/plans/2026-10-01-db-readiness-phase7-plan.md`.
- **The evidence sheet, with the roll-call and what the walk saw:** `raptor-port/docs/handpass/2026-10-01-dbr-phase7-check.md`
  (and the three walkers' reports beside it, `docs/handpass/parts/p7-a.md`, `p7-b.md`, `p7-c.md`).
- **The rulings** (you load none of `.claude/rules/` by yourself): `.claude/rules/decisions/oil.md`, `scheduler.md`,
  `how-we-work.md`, `leave-war.md`; a ruling's full row is one line of `.claude/decisions-full/<same name>`
  (`grep -h '^| D43 |' .claude/decisions-full/*.md`). Also `.claude/rules/raptor-executor.md`.
- **The method:** `raptor-port/docs/bug-check-order.md` §2b, §4, §6.

## The job — use this wording as your method
Do not merely review the changed code. Starting from the user promise and the applicable rulings, enumerate every
qualifying object, renderer, visible door, writer, reader, downstream consumer, role, overlay and meaningful order of
actions. **Assume every existing line may be correct and the defect may be a MISSING call site.** For each item, state
where the visible sign and the working gesture should exist in the production app. Then rank concrete failure scenarios
with setup, action, expected result, and the observation that would disprove correctness. Start with the least-shared or
most specialised surface. **Check the evidence sheet's roll-call for gaps** — a surface it never names, a column left
without a mark.

Questions the build most wants answered (not a limit on what you look at):
1. `oilEvidence`'s new loop writes a crowd for a request row whose request never asks (Personal). Can it ever move OIL —
   through `oilEarnedWork`, `oilEligible`, `spanDefault`, `itemState`, the signature key, `oilMovedInputsOnly`, the Leave
   War's credit pass? Can it write an entry the asking loop would have refused, or miss one it should write (a request
   read by `r.iid`; a multi-day request; a week not on screen; a kept / cancelled / information-only row)? Does every
   reader of `ev.sent` keyed `i:<iid>` cope with a request that is NOT in `ev.inputs`?
2. `crowdClashes` now reads the day's sim windows (`SIMW`, or the record's own when handed in). Is `SIMW` right in every
   world the validator runs in (the official pass, the phantom Monday pass, `snapGlobals` / `restoreGlobals`, a week
   swap)? Is the warning list byte-identical (the two sentences moved into `simBriefSays` / `simDebriefSays`)? Any reader
   of the window's flags that still asks the flight half only?
3. `setSlotVal`'s padding: any other writer of `pax` / `more` (a drag, a swap, `fillSlot`, a template, a paste) that can
   still leave a hole, or that relied on one?
4. The three "a stored empty list is a decision" readers and the counter limit: can a legitimate empty list now be read
   where the app cannot work with one? Is there a fourth reader of the same shape the sweep missed?
5. `carriedRemark`: can it cut the typist's own words, or leave the Input and the request disagreeing?
6. The four reworded on-screen sentences: any other sentence a person reads that still calls OIL pay or money?
7. **D470** (ruled during the check, built after the walk began): `oilev.ts landedExtras` now gathers a request row's NAME
   BOX like its extras — a real person who is not the request's holder. Every caller (`oilEarnedWork`, the hand-over
   prune `pruneHandedOverDecisions`, `ui/oilmode.ts oilEligible`): can the holder ever be gathered (earning twice, or his
   own No buried), can a man be credited from a row he is not on, does a hand-over to or from the man in the box leave a
   stale decision deciding? The evidence sheet §2 names one choice: an already-published DEMO day carrying such a man is
   not built around (D56 over D48) — say if you read the rulings differently.
8. The ALL AVAIL window's foot now keeps WHO was tapped (`state/view.ts AVAILWIN_FOOTID`) and re-says the sentence at
   every draw; on a Personal row its earn half's hint is the row's reason (`ui/oilmode.ts oilNoAskWhy`). Any state in
   which the foot now says something untrue or goes blank when it should speak?

## What is NOT a finding (owner, D56)
This app is pre-promulgation and its entire stored world is DEMO DATA that will be CLEARED before the database step. **Do
not report a problem whose harm exists only in data already stored when the code is already correct going forward** — no
migration, no back-compat, no "an existing record would read wrongly". If the app would do it again to NEW data, report
it: that is a real finding and this exclusion does not touch it. (So: a day published before this build that carries a
placeholder on a Personal row reading "1 pending" is NOT a finding — D54.)

## What to return
- A verdict: APPROVE / REVISE / BLOCK.
- Findings ranked by severity, each with: the file and line, the exact scenario (setup, action, what happens, what
  should), whether it is new in this change or older code this change made reachable, and **exact, step-by-step fix
  instructions** — which line, what to write, which test to add and what it asserts. Not a direction.
- **Explicit negatives** — "I checked X and found nothing" for each of the six questions and anything else you covered.
- Anything the roll-call misses.
Known and deliberately left, do not re-raise: `[OIL-REQ-NAMEBOX]` (a man in the name box of another man's request earns
nothing — a question put to the owner); `[WARN-HIDE-KEPT]` (how long a hidden warning lasts — a question put to the
owner); the comments-only rewording of "money" → "credit" (`[OIL-WORDS]`), which lands after this read as its own commit,
proven by an identical production bundle.
