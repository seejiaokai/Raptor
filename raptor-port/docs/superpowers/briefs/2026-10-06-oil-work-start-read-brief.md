# The final code read — OIL from the entered In-time / Rally; a published day keeps the OIL it went out with (`[OIL-WORK-START]`, D591, D592) — 6 Oct 26

You are one of TWO independent readers of a finished change (bug-check order §4 rank 2, §4a; D590, D601 — Astra reviews
what Opus wrote and Sol 6.1 reads second, each blind to the other). You did not write it. Work READ-ONLY: change
nothing, build nothing, start no server. **You cannot run anything** (the sandbox has no writable temp folder — a test
run reports zero tests): read the source, and where you would have run a case, NAME the exact input and the answer you
expect; the host runs it. Never read the other reader's report (`…-read-astra.md` / `…-read-sol.md`); never approve —
your report is evidence, the owner approves.

**The change:** branch `claude/oil-work-start-build-35a0e3` against `main` —
`git diff origin/main...HEAD -- raptor-port/src raptor-port/e2e raptor-port/playwright.config.ts raptor-port/scripts/rulecheck.mjs raptor-port/docs/engine-rules.md`
(plus anything uncommitted: `git status`). App code:
- `raptor-port/src/engine/oil.ts` — `dayOilWork`'s ordinary flying branch (the report from `reporting.ts
  resolveReporting`; `lead` / `deb` from `opts.rv`), `OilRuleVals`, `oilRuleValsNow`, `uniformOil`'s second argument,
  `oilCapableItems`'s second argument;
- `raptor-port/src/engine/oilev.ts` — `OilEvidence.rv`; `oilEvidence`'s last return; `oilKeptVals`, `oilAmount`,
  `oilWorkSpans` (moved from `leavewar/sync.ts`, unchanged), `OilRec`, `oilRecordsOf`, `oilRuleShift`, `oilShiftKey`;
  `oilDayWork` handing `rv` on; `oilWouldEarn`;
- `raptor-port/src/engine/publish.ts` — `oilDelta` / `oilRuleDelta` (the `oilrv:<di>` entry); `dayPendingItemsIn` (the
  fold and the separate push); `currentBindNow`'s `orv`; `signBoundOk` / `oilRvBoundOk`;
- `raptor-port/src/leavewar/sync.ts` — `creditFrom`'s `blocks`, `desiredOilCells` (the amount per date's own block);
- `raptor-port/src/ui/oilmode.ts` — `amtOf(ev, …)`, `oilDayFigures`, `oilFigureFor`, `oilEligible`, `oilItemCellHTML`;
- `raptor-port/src/ui/pendlist.ts` — `oilRuleWords` and its dispatch in `pendItemWords`;
- `raptor-port/src/ui/logic-html.ts` — three sentences; `raptor-port/src/leavewar/ui/OilTracker.tsx` — one line (every
  worked period).
Tests: `raptor-port/src/engine/oilworkstart.test.ts`, `raptor-port/src/leavewar/oilworkstart-published.test.ts`,
`raptor-port/src/ui/oilworkstart.test.tsx`, `raptor-port/e2e/oilworkstart.spec.ts`, one case added to
`raptor-port/src/leavewar/ui/oiltracker.test.tsx`, and ONE older pin changed —
`raptor-port/src/engine/rally-consumers.test.ts` (RT8's "nominal OIL unaffected by reporting-only edits"): judge
whether the changed pin traces to D591 and keeps its other half.

**Read first, from the live files:**
- the evidence sheet, WITH ITS ROLL-CALL — you are asked for absences against it:
  `raptor-port/docs/handpass/2026-10-06-oil-work-start.md` (the fault on screen before and after, the walkers' table,
  the break tests, what the plan's two challenges and the scenario read changed, what was NOT walked, what was filed);
- the register, one line per behaviour: `raptor-port/docs/superpowers/specs/2026-10-06-oil-work-start-behaviour-register.md`
  (OWS1–OWS11); the plan: `raptor-port/docs/superpowers/plans/2026-10-06-oil-work-start-plan.md` (§7 is what was built
  where it differs from §3); the scenario designer's report and its numbers table:
  `raptor-port/docs/superpowers/briefs/2026-10-06-oil-work-start-scenarios-astra.md`;
- the job as filed: `OUTSTANDING.md` `[OIL-WORK-START]`, and the three filed beside it: `[OIL-ZERO-SPAN-SORTIE]`,
  `[UNPUB-WARN-AL-RESTORES]`, `[HIST-PER-PAGE]`;
- the owner's rulings — one line each in `.claude/rules/decisions/oil.md`, `scheduler.md`, `how-we-work.md`; each
  ruling's full row by `grep -h '^| D591 |' .claude/decisions-full/*.md` (the shell): **D591, D592** (read both full
  rows — his words, and the agent's readings (6)–(10) made in the build); **D497–D507, D509, D510** (In-time / Rally);
  **D42, D48, D49, D142, D2**; **D44, D45, D98, D99, D103**; **D109, D113, D114, D178** (one act, one change; a
  request's edit folds its own OIL change); **D186, D482**; **D24, D28, D31, D43**; **D56**;
- `raptor-port/docs/engine-rules.md` §Weekend/PH work earns OIL ("What pools" — the flying seat; §Which published
  version pays — "A published day keeps the Logic values its OIL was worked out from");
  `raptor-port/docs/data-schema.md` §A day's OIL evidence and the `signBind` row; `raptor-port/docs/feature-impact.md`
  ("OIL's two drift-seams");
- `raptor-port/CLAUDE.md` §Architecture rules and §Coding conventions (`src/engine/` bodies are verbatim ports: a diff
  there is the behaviour change and nothing else), "The rules-engine robustness doctrine" (full text:
  `raptor-port/docs/guide-full.md`); `.claude/rules/raptor-executor.md`.

## What the build claims — attack each

1. **An ordinary flying line's OIL day starts at the report the shared reader gives, and at the nominal time only where
   it gives none.** Is there an input where `resolveReporting`'s answer is wrong FOR OIL though right for the
   work-hours bar — a wave with `standalone` set oddly, a formation with no callsign, two formations sharing a
   callsign, a line naming a formation that is cancelled, a wave whose `intimes` is not an array, a take-off that
   parses and a landing that does not? Does anything else in `dayOilWork` (the SC branch, the exempt default, `reach`,
   the cockpit belt) now behave differently from `main`? Is the `parseReportingLines({...wv, intimes: …})` copy safe —
   does `resolveReporting(wv, f, st, lines)` read anything from `wv` that the copy changed?
2. **Nothing that is not an ordinary flying line moved.** SC MAIN / SPARE, AVALON, BB, sims, duty, ground, Common
   Programme, the request half (`oilEarnedWork`'s input loop), the membership (`oilEvidence`'s `sent`), the decisions.
3. **A published day's OIL no longer reads a live Logic value anywhere.** Trace EVERY path from an issued snapshot to
   an amount or a worked time and name any that still reads `VCONF.reportLead`, `VCONF.debrief` or `VCONF.oilFullMin`:
   the credit pass (loaded week and every stashed week), `publishFlagsBids`, `oilCreditBidAgainst`, the board and week
   green edge, OIL Earn's figures, the ALL AVAIL window, `oilWouldEarn` and the `OIL_*` advisories, the Leave War's
   own readers of the stored record, exports. Is there any OTHER live input on that path the change should have kept
   (a fourth value: `step`? `openEnd` / `simLen` through `openEndRows`? the reader's own `VCONF.reportLead` inside
   `resolveReporting`'s `instant` for a standalone wave)?
4. **`rv` is written at every publication and nowhere else.** First publish, an amendment, Unpublish then publish, a
   correcting reissue, a publication undone and redone, a version loaded onto the working copy (must NOT carry it), a
   saved plan (must NOT carry it), a stashed week. Is `oilEvidence()` ever called for something that is then STORED
   other than through `daySnap`? Does adding `rv` to the live candidate change `oilEvidenceKey` / `oilSignKey` (it
   must not — they are built field by field), or any deep-equality comparison of two evidence blocks?
5. **The pending comparison** (`oilRuleShift`): the same day, the same block, the block's kept values against today's.
   Is `{ ...ev, rv: now }` enough to make every reader on that side use today's (the `OIL_WORK` memo is keyed on the
   block object — can a stale memo be served)? Can it fire when nothing a reader could see would change, or stay
   silent when something would — think of the clipping in `oilWorkSpans` (a start before midnight, an end after it),
   two periods that merge under one value and not the other, a man who earns nothing on one side, a man the roster no
   longer holds, a day whose block says it does not earn. Is the entry's `from` / `to` stable (sorted, no object
   order)? Is `oilrv:<di>` safe everywhere a delta entry's `addr` is parsed (`keyDay`, `pendingKey`'s rewrite,
   `canonical.ts`, the stored amendment diff, the changes window, History)?
6. **The count, the list and the sign-offs agree** (D99, D103): `dayDelta`, `dayPendingItems`, the week's and board's
   chips, the Amendments box, `pendItemWords`. With a request edited AND a Logic value changed; with an OIL decision
   changed AND a Logic value changed; with a warning hidden as well. After the amendment is published, is the entry
   gone and is the stored amendment's item list sane (what does an `oilrv:` entry read as in a published amendment's
   own record)?
7. **A sign-off's binding** (`orv`, `oilRvBoundOk`): does it fall exactly when the day as it stands would be written
   differently under the signing-time values than under today's, and stand again when the value is put back? A
   binding stored before this build (no `orv`); a day that earned nothing when signed and earns now (a holiday
   declared); a parked plan's own sign-offs (`drafts`, `curDraft` — do they carry `orv`, and is it checked against the
   right day?); `setSign` called inside a publish read pass (the `cb` memo). Cost: `signBoundOk` runs per role per
   repaint — is the fast path really taken when nothing changed?
8. **Robustness (the five families):** a stored `rv` that is not three numbers; `intimes` holding non-strings; a
   Logic value at its bounds (0, 480, 720); two tabs; a week loaded from storage written by this build and by `main`.
9. **The moved function** `oilWorkSpans`: byte-for-byte the body that left `leavewar/sync.ts`? Every old caller still
   reaching it?
10. **The tests:** does each new test fail without the change it names (the break table in the sheet claims 22 of
    22)? Is any assertion weaker than its title? Do the fixtures write the way the app writes (the published tests
    build a day in place and publish through `setDayApproved` / `publishALDay` / `setSign` — is anything the real
    Publish button does skipped that matters here)?

## What I want from you

> Do not merely review the changed code. Starting from the user promise and the applicable
> rulings, enumerate every qualifying object, renderer, visible door, writer, reader, downstream
> consumer, role, overlay and meaningful order of actions. **Assume every existing line may be
> correct and the defect may be a MISSING call site.** For each item, state where the visible sign
> and the working gesture should exist in the production app. Then rank concrete failure scenarios
> with setup, action, expected result, and the observation that would disprove correctness. Start
> with the least-shared or most specialised surface.

> This app is pre-promulgation and its entire stored world is DEMO DATA that will be CLEARED before
> the database step. **Do not report a problem whose harm exists only in data already stored when
> the code is already correct going forward** — no migration, no back-compat, no "an existing
> record would read wrongly". If the app would do it again to NEW data, report it: that is a real
> finding and this exclusion does not touch it.

Read the sheet's roll-call for ABSENCES: a place that shows a man's OIL or its times and is not in the table; a row
marked "by construction" that the code does not in fact construct.

For every finding: the concrete failure (setup, action, what goes wrong, who sees it); the ruling it breaks; **whether
`main` does the same** (compare — severity depends on it); and **exact, step-by-step fix instructions** (file,
function, the line to change and what it becomes), with the test that should go red first. Rank them. A claim is a
finding only with a concrete failure, its cause and its fix. Give **explicit negatives** — "I checked X and found
nothing" — for each numbered claim above.

Three owed reads ride with this run (D138): (a) the short line of **D591** in `.claude/rules/decisions/oil.md` (its
tail "— NOT YET BUILT" was removed) against its full row; (b) **D592**'s full row now carries the agent's readings
(6)–(10) — does any of them misstate, or pass off as his, something he did not say; (c) the three sentences changed on
the Logic page (`ui/logic-html.ts`) against D24, D591 and D592 — is each true of the code.

End with a verdict line: `PASS` / `CHANGES REQUIRED` and the changes in order.
