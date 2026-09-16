# Session handoff — crew-rest / flagging on the PUBLISHED schedule: BUILD IN PROGRESS

## RESUME HERE (overnight autonomous run finished, 16 Sep 26)
**[CRP-FLAG] is BUILT + GATED + BUG-CHECKED on branch `claude/crewrest-published-flagging`,
holding for "merge live" (NOT merged).** All 7 phases done + 3 rounds of Codex code review.
- **Design + phase table:** `…/2026-09-15-crewrest-flagging-build-context.md`.
- **Bug-check log + the flagged "phase 8" owner decisions:** `…/2026-09-15-crewrest-flagging-code-review.md` — READ THIS to decide what's next on the feature.
- **Gates (all green):** vitest 4785/4785 · build · tfin 728/0 · smoke 425/0 · e2e 423
  (2 pre-existing phone-width fails). Live-verified desktop + phone.
- **Codex (GPT-6 Astra high) rounds 1–3:** fixed all the tractable/safe findings test-first;
  FLAGGED a coherent phase 8 (none a safety gap): (1) the filing-membership model — an
  AMENDMENT-ENGINE decision that intersects `[AMEND-SEL-FOLLOWUPS]`; (2) the pre-existing xweek
  dedup; (3) accessor-completeness UI (day-detail modal, person-select, trace-world id).
- **Fable is RECONNECTED and working (16 Sep 26)** — the standalone `claude` CLI's OAuth was
  refreshed; a connectivity check ran as `claude-fable-5-1` (observed_models confirmed), completed
  clean. Fable allowance is high again. **A Fable cross-provider pass has NOT been run yet** — it is
  the FIRST thing for the next chat: run it via the claudex-loop runner
  (`review --host codex --model claude-fable-5-1 --repo <root> --plan <brief>`), aim it at (a) an
  independent check of the Codex fixes and (b) the flagged filing-membership / amendment-engine
  decision. A ready brief: `…/scratchpad/crp-flag-fable.md` was one-off (temp, may be gone); write a
  fresh brief from the code-review doc.
- **Commits:** d650a32 89703c2 d72634a ec14acc c663bc7 7f130a3 (phases 1–6) · efa4611 89e9d22
  3a59e66 (Codex fix rounds 1–3) + docs.

**Next on the feature:** the owner decides the phase-8 items (esp. the filing-membership model,
best done WITH [AMEND-SEL-FOLLOWUPS]). Everything else is done, holding for "merge live".

**Second overnight task:** [FLAG-EXPORT] — export the PUBLISHED version + a nicer report-grade PDF
(owner direction 16 Sep, samples for him to pick). See OUTSTANDING.md [FLAG-EXPORT].

---

## (original design handoff, kept for reference)
# Session handoff — crew-rest / flagging on the PUBLISHED schedule: DESIGN DONE + RED-TEAMED, ready to BUILD

## Where it is
The owner's parked ask — show live warnings (crew rest incl. cross-day/past-midnight,
the 7-day work rule, timing clashes) on the PUBLISHED schedule — is **fully scoped,
designed, and cross-provider red-teamed. NOT built.** Everything needed to build is
written down. On its own branch `claude/crewrest-published-flagging` (off `main`).

**Build spec (read this first):**
`raptor-port/docs/superpowers/specs/2026-09-15-crewrest-flagging-plan-v2.md`
— §5 mechanism, §11 tests, **§14 the tricky build spots**. Review history:
`…-crewrest-flagging-review-log.md` (2 red-team rounds + a confirmation round, Codex GPT-6 Astra + Fable 5.1). The earlier `…-crewrest-on-published-flagging-plan.md` and
`…-flagging-architecture-workflow-question.md` are superseded context.

## The model, in one line
Two versions of each day get checked: the **signed** (official) schedule and the **live
working copy**. Every screen shows one of them per day, and the warnings follow whichever
version that day is showing. Rule for checking a day (crew rest / 7-day / midnight, looking
at the days before AND after it): reference each surrounding day's **published version if it
has one, else its working copy**; while a day is being amended, that amendment drives the
scheduler's own preview so they see the effect before publishing. Content stays byte-frozen;
warnings are a live overlay. A **"Not Yet Signed"** marker (everyone) shows where the live
copy differs from the signed one. Clock-free; NOT coupled to EOD.

## Owner decisions (15 Sep 26) — settled, do not reopen
- Show **everything a draft shows** on published days.
- Published flags render **identically for everyone** (member = admin); only *publishing* is scheduler-gated.
- The "view as working" per-day peek stays **open to all** (a peeked day shows working flags, stamped "Working draft").
- **No number on the publish button** — show affected warnings in the LIST ("goes away once signed" / "new once signed"); a "Not Yet Signed" day marker for everyone. No wrap-up reminder.
- **Exports (PDF/CSV) must export the PUBLISHED version** — split to follow-up `[FLAG-EXPORT]` in OUTSTANDING (with next-week-peek labelling). NOT in this build.
- The phone "board" fix is a **no-op** — no separate view-page board exists; the view week is the surface.

## Build process (owner's rules)
Opus 4.8, HEAVY, **test-first**. Keep parity `tfin.js` **728/0** (issued CONTENT is byte-frozen).
Full gates before the PR. After building, a **fresh cross-provider CODE inspection** (Codex + Fable) — the §14 spots are only truly checkable in code. **No merge without the owner's "merge live".** Don't watch the PR.

## Still parked (separate task, NOT this build)
- **Housekeeping** (own gated PR): delete the handoff screenshots in
  `raptor-port/docs/img/plans-selector-followups/` and the consumed plan docs, then a
  repo-wide dead-code/space sweep following the CAUTION list in
  `raptor-port/docs/plans-selector-followups.md` (some dead-looking code is kept on
  purpose). Report what's removed; ask before anything load-bearing.
- Tracker smoke gate is flaky (random `addStudent` timeout, no auto-retry) — Tracker
  workstream, not this task.

## Opening prompt for the fresh chat
> Picking up Raptor on branch `claude/crewrest-published-flagging`. BUILD the "live flagging
> on the published schedule" feature. The design is DONE and cross-provider red-teamed — read
> `raptor-port/docs/session-state.md` then the build spec
> `raptor-port/docs/superpowers/specs/2026-09-15-crewrest-flagging-plan-v2.md` (esp. §5, §11, §14).
> Build it test-first on Opus, keep tfin.js 728/0, run all gates, then a fresh Codex + Fable
> code inspection. Do NOT merge until I say "merge live." Speak to me in plain layman terms.
