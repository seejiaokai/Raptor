# Session handoff — [CRP-FLAG] flagging + [FLAG-EXPORT] export, COMBINED on one branch

## RESUME HERE (handoff to a fresh chat, 16 Sep 26)

**Branch to select: `claude/crewrest-published-flagging`.** It now carries BOTH features
(FLAG-EXPORT was merged into it, owner's call, so they ship together). Off `main`, NOT pushed,
NOT merged — holds for the owner's testing + "merge live". Combined gates all green:
**vitest 4789/4789 · build clean · tfin 728/0** (+ smoke 425/0 & e2e 423/2-pre-existing from the
last full run before the merge). Local live-drive verified the flagging feature (desktop + phone).

### DONE this work (all committed on the branch)
- **[CRP-FLAG] live flagging on the published schedule — 7 phases, test-first.** Published days
  show their flags again (crew rest incl. cross-day, 7-day run, clashes) computed against the
  SIGNED version, content byte-frozen; "Not Yet Signed" marker (everyone) + in-list "goes away /
  new once signed" markings; click/focus + neighbour-week + filing all world-resolved.
  Design + phases: `docs/superpowers/specs/2026-09-15-crewrest-flagging-build-context.md`.
- **3 rounds of Codex (GPT-6 Astra high) code review** — all tractable/safe findings fixed
  test-first; the rest FLAGGED (see below). Log: `…/2026-09-15-crewrest-flagging-code-review.md`.
- **§4 immediate-flag behaviour pinned:** medical, quals, and rule (VCONF) changes flag the
  published face immediately (unversioned); LEAVE is versioned (not immediate).
- **[FLAG-EXPORT]** — functional half done: the PDF/CSV export now outputs the PUBLISHED version
  per day (`publishedDays()`), with a per-day "Published/Working" stamp. Report-grade PDF redesign
  is a DRAFT sample for the owner to pick: `docs/img/flag-export-sample-new.html`. Doc:
  `…/2026-09-16-flag-export.md`.

### OUTSTANDING — on THIS branch (do in order, next chat)
1. **Run the Fable cross-provider pass** on the fixed flagging code (Fable is reconnected + working;
   allowance high). claudex-loop runner: `review --host codex --model claude-fable-5-1 --repo <root>
   --plan <brief>`; write a fresh brief from the code-review doc. Aim: independently check the Codex
   fixes + judge the flagged filing-membership decision. Fix anything safe test-first; flag
   amendment-engine calls.
2. **DECIDE the filing-membership question (phase-8 item #1, owner's call).** The amendment engine
   treats an input absent-at-sign and present-with-empty-acc identically (filingDelta/filingKey), but
   the flagging OFFICIAL gate now treats them as different. For a fresh unaccepted commitment on a
   published day, OFFICIAL correctly excludes it, but the amendment engine sees "no change" (no
   Not-Yet-Signed, not publishable). Full consistency changes publish-eligibility + signature binding
   → **best done WITH `[AMEND-SEL-FOLLOWUPS]`** (the signature workstream). Details in the review doc.
3. **The other flagged phase-8 items (optional / owner priority):** (a) the pre-existing xweek
   seed-dedup bug (CRPF-006/R2-004 — its own careful test-first pass); (b) accessor-completeness UI
   — the day-detail modal, person-select highlight, and trace cross-world identity (medium, UI-focus,
   the flags themselves are correct). All in the review doc's "OWNER DECISIONS / remaining work".
4. **[FLAG-EXPORT] — pick/adjust the PDF design** (owner's call): denser/airier, a signature block
   (Planned/Approved by), include duties/sims/ground rows (currently flying-only), a logo, portrait
   vs landscape. Then finalise. Plus the deferred next-week-peek working-vs-signed labelling.
5. **Push → Vercel test → "merge live"** when the owner is happy (do-not-watch-PR still holds).

### OUTSTANDING — the wider backlog (other branches/tasks; full detail in `OUTSTANDING.md`)
- **[AMEND-SEL-FOLLOWUPS]** — on `claude/amendment-engine-core` (PR #405); the plans-selector
  follow-ups incl. the per-plan signature work. Overlaps phase-8 #2 above.
- **[REPO-CLEANUP]** — delete consumed screenshots + dead-code sweep (needs owner sign-off per file).
- **[ARCH-STACK]** backbone: step 2 (one write/command layer, branch `claude/arch-stack-2-command-core`),
  step 3 `[GLOBAL-UNDO]`, step 4 (one Absence record), then `[DB-STEP]` (Dataverse).
- **[SYNC-INTEG]** (small leave guardrails), **[EOD]**, **[OIL]**, **[TRK-ATTEMPTS]**, **[RECALL]**,
  **[XFER]**, **[TRK-DISK]** — see OUTSTANDING.md for scope/priority.

### Opening prompt for the fresh chat
> Continuing Raptor. Select branch `claude/crewrest-published-flagging` — it carries BOTH the
> published-schedule flagging ([CRP-FLAG]) and the export follow-up ([FLAG-EXPORT]), combined.
> **Read `raptor-port/docs/session-state.md` first**, then the code-review doc
> `…/2026-09-15-crewrest-flagging-code-review.md`. Combined gates are green (4789/4789, tfin 728/0).
> Fable is reconnected + working. Do the "OUTSTANDING — on THIS branch" list in order: (1) run a
> Fable pass over the flagging fixes + the flagged filing-membership decision; (2) bring me that
> decision; (4) let me pick the export design. Don't merge until I say "merge live". Speak plainly.

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
