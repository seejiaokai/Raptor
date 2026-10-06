# The plan challenge — `[OIL-WORK-START]` (D591, D592) — 6 Oct 26

You are one of TWO independent challengers of a build plan (bug-check order §4 rank 3; D353, D590 — Astra and Sol 6.1,
each blind to the other). You did not write it. Work READ-ONLY: change nothing, build nothing, start no server, run no
test suite. Never read the other challenger's report (`…-plan-challenge-astra.md` / `…-plan-challenge-sol.md`). Your
report is evidence for the builder; nobody is asked to approve anything.

**The plan:** `raptor-port/docs/superpowers/plans/2026-10-06-oil-work-start-plan.md` — read it whole. No app code has
changed yet; the code you read is `main`.

**Read first, from the live files (nothing is pasted here on purpose):**
- the job as filed: `OUTSTANDING.md`, the item `[OIL-WORK-START]`;
- the owner's rulings — one line each in `.claude/rules/decisions/oil.md`, `scheduler.md`, `how-we-work.md`; each
  ruling's FULL row by `grep -h '^| D591 |' .claude/decisions-full/*.md` (the shell): **D591, D592** (this job);
  **D497–D507, D509, D510** (In-time / Rally: what a line means, the earliest applicable stage, the evening before);
  **D42, D48, D49, D142, D2** (which day earns; an issued day keeps what it went out with; the latest published
  version pays); **D44, D45, D98, D103** (nothing on a published day changes unacknowledged; back to as-published
  shows nothing pending; any pending change takes the sign-offs down); **D186** (the one printed rule value a
  published day already keeps); **D482** (Insights' hours move at once — the contrast); **D56** (below);
- the rules as written: `raptor-port/docs/engine-rules.md` §Weekend/PH work earns OIL (to its end);
- the code on the path: `raptor-port/src/engine/oil.ts` (whole), `engine/reporting.ts` (whole), `engine/oilev.ts`
  (`OilEvidence`, `oilEvidence`, `oilDayWork`, `oilEarnedWork`, `oilEvidenceKey`, `oilSignKey`, `oilWouldEarn`),
  `engine/publish.ts` (`daySnap`, `oilDelta`, `dayDeltaIn`, `dayPendingItemsIn`, `freezeWarn`, `faceRuleVals`,
  `currentBind`, `pendingKey`, `oilBoundOk`), `engine/faceattrs.ts`, `engine/drafts.ts` (`liveDay`),
  `leavewar/sync.ts` (`creditFrom`, `desiredOilCells`, `publishFlagsBids`, the Unpublish warning below them),
  `ui/oilmode.ts` (`amtOf`, `oilDayFigures`, and its direct `dayOilWork` call), `ui/pendlist.ts` (`pendItemWords`),
  `engine/events.ts` (`seatIntime`) and `engine/validate.ts` (`workSpan`, the `OIL_*` advisories);
- the two earlier proposals for half 2: `raptor-port/docs/handpass/parts/stack-read-AB.md` §4 lead 1, and
  `raptor-port/docs/superpowers/briefs/2026-10-05-codex-stack-scenarios-astra.md` M1, M2;
- `raptor-port/CLAUDE.md` §Architecture rules and §Coding conventions; `.claude/rules/raptor-executor.md`.

## What to do

Do not merely review the plan's text. Starting from the owner's rulings, enumerate every reader, writer, frozen copy,
comparison, signature binding, downstream consumer, role and meaningful order of actions that a published day's OIL
passes through. **Assume every existing line may be correct and the defect may be a MISSING call site** — a reader the
plan does not list, a publication path that does not freeze, a comparison that never fires, a surface that still shows
today's answer for an issued day. Then answer the plan's §6 (a)–(f), each explicitly, and anything else you find.

For every finding give: the concrete failure (setup, action, what goes wrong, who sees it), the ruling it breaks,
whether `main` does the same today, and **exact step-by-step fix instructions** (file, function, what to add). Rank
them. Give **explicit negatives** too: "I checked X and found nothing".

Where the plan names a "builder's reading", say whether the rulings' words support it, contradict it, or leave it to
the owner — and if to the owner, the one-line question in the app's own words with your recommended answer.

**Not a finding (owner, D56):** this app is pre-promulgation and its entire stored world is DEMO DATA that will be
CLEARED before the database step. Do not report a problem whose harm exists only in data already stored when the code
is already correct going forward — no migration, no back-compat, no "an existing record would read wrongly". If the
app would do it again to NEW data, report it: that is a real finding and this exclusion does not touch it. (A version
issued before this build must still LOAD and READ without breaking — that much is in scope.)

End with a verdict line: `PLAN: PROCEED` / `PROCEED WITH CHANGES` / `RETHINK`, and the changes in order.
