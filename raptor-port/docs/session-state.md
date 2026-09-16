# Session handoff — [ARCH-STACK] Step 2 (the one write/command layer) — DESIGN DONE + BUILD-READY

## RESUME HERE (handoff, 16 Sep 26 — DESIGN COMPLETE, ready to BUILD)

**What this is:** Step 2 of the architecture backbone — the ONE write/command layer over stable
ids that undo, persistence, sync and the database all consume. **The DESIGN is finished and
build-ready.** It was red-teamed across BOTH providers over **four rounds** (Codex GPT-6 Astra +
Fable 5.1, high; findings 11→7→7→5 / 13→9→7→7, both converged and both affirm the strategy is
sound). NOT built yet.

**Branch to select in the new-chat picker:** `claude/arch-stack-2-command-core-design` (pushed;
off `main`; DOCS ONLY so far — no code, nothing merged). Do NOT start from `main` — the design doc
+ review log live on this branch.

**Read first, in order:**
1. `raptor-port/docs/superpowers/specs/2026-09-16-arch-stack-2-command-layer-design.md` — **Rev 5,
   the build spec.** §0 (the ADDITIVE framing — the key decision), §3 (the command model), §5
   (per-module adoption), §7 (tests), §8 (rollout order). The Rev-5 change-list at the top maps
   every red-team fix to its section.
2. `…-2026-09-16-arch-stack-2-command-layer-review-log.md` — the 4-round transcript + dispositions.
3. `docs/superpowers/specs/2026-09-13-architecture-rootcause-plan.md` — the parent plan (RC4 = this
   step; SEQ-001..004 binding).

**The build, in one line:** ADD the command gate + change stream **alongside** today's machinery
(`persistAll`, `HOOKS.histPush`, the three snapshot undo stacks all STAY and behave exactly as
today); route every FORWARD write through `commit()`; prove the stream captures every durable write
and that a command is all-or-nothing in memory. **No cutover of persistence or undo happens here** —
those are Steps 3/5. Undo/redo are NOT routed through `commit()` at Step 2.

**Build rules (owner):** Opus 4.8, **HEAVY, test-first**; keep parity `reference/tfin.js` **728/0**
(the layer changes no rendered byte); run all gates each phase; **additive regression proof** that
persistence + undo behave identically to pre-Step-2; **per-phase parity gate** (rollout §8 order:
core → scheduler → PEOPLE/VCONF/settings → Leave War → Tracker). After building, a **fresh
cross-provider CODE inspection** (Codex + Fable). **No merge without the owner's "merge live."**
Don't watch the PR.

**Settled decisions baked into the spec (do not relitigate):**
- **Undo of a publish** — silent BEFORE it's sent/disclosed; an on-the-record forward withdrawal (a
  correcting amendment) AFTER. Undo is per-user + per-session, never touches another user's actions,
  won't clobber a later edit. Memory `undo-of-publish-semantics`; spec §3.4.
- **Roster/settings edits ARE undoable** (user commands, never amendments).
- **New modules must use this command layer**, never a 4th store-pattern. Memory
  `new-modules-follow-command-layer`; `CLAUDE.md` §Architecture rules + `docs/architecture-direction.md`.
- **Step-3 deferrals** (NOT this build): undo-authorization, put-once enforcement on issued records,
  the crossable-boundary enforcement, retiring the snapshot undo stacks. **Step-4 deferral:** the
  fully-clean input+leave undo (one-Absence record). See OUTSTANDING [GLOBAL-UNDO].

**Opening prompt for the fresh chat:**
> Continuing Raptor. Select branch `claude/arch-stack-2-command-core-design`. BUILD [ARCH-STACK]
> Step 2 — the one write/command layer. The design is DONE and 4-round cross-provider red-teamed —
> read `raptor-port/docs/session-state.md` then the build spec
> `raptor-port/docs/superpowers/specs/2026-09-16-arch-stack-2-command-layer-design.md` (Rev 5;
> esp. §0 additive framing, §3 model, §5 adoption, §8 rollout). Build it **additively**, test-first,
> Opus heavy, keep `tfin.js` 728/0, run all gates + the additive regression proof per phase, then a
> fresh Codex + Fable code inspection. Do NOT merge until I say "merge live." Speak plainly.

---

# (earlier handoff, kept for reference) — [CRP-FLAG] flagging + [FLAG-EXPORT] export

## RESUME HERE (handoff, 16 Sep 26 — ITEM 2 + 3(a) MERGED LIVE)

**ITEM 2 + ITEM 3(a) ARE MERGED TO `main` AND LIVE** (PR #406, merge commit `a02f83e`, deployed to
seejiaokai.github.io/Raptor and verified on the real page: the view-only Sunday shows the 7-day breach
chip "7" + the details modal, edit stays clean). Do NOT re-merge. **For the NEXT chunk, start a FRESH
branch OFF `main`** (main now contains all this work) — do NOT reuse `claude/crewrest-published-flagging`
(merged/stale). Both were cross-provider APPROVED (Codex GPT-6 Astra + Fable 5.1). Gates on the merge
were green (vitest 4806, build, tfin 728/0, all 3 browser gates; the only CI red was the KNOWN-FLAKY
`tracker (smoke)` addStudent-timeout gate — a separate app, unrelated, deploy does not depend on it).

**NEXT = ITEM 3 remainder (minor polish) or [FLAG-EXPORT] (recommended).** See the outstanding list below.
Item 3(a) (puck-select displayed-world highlight, commit `c976f31`) is DONE + live. Item 3 remainder is
(b) a `data-world` tag on trace refs (cross-world click is already a defined no-op, Fable-confirmed) and
(c) the DayPop modal CONTENT snapshot for an approved view day (its warnings are already world-resolved)
— both genuinely minor. **[FLAG-EXPORT]** (owner picks the PDF design) is the recommended next build;
note `raptor-port/src/ui/export-published.test.ts` already exists on main (prior [FLAG-EXPORT] groundwork).

**ITEM 2 — DONE (commits a82d64b · 4bc14d2 · e01d6fb).** The owner's "7-day breach on the wrong
day" was NOT the seed dedup — every clean-prior-week reproduction lands it correctly. The real bug:
the view-only page drew DRAFT days from the WORKING world, so a cross-day breach (7-day run, crew
rest / overnight over a boundary) that lands on a draft day vanished whenever an unpublished
working-copy fix to a PUBLISHED neighbour cleared it. Fix: view-page live-draft days render their
flags in the OFFICIAL world (`viewDayHTML` wraps `dayHTML` in `withOfficialWarn`); one predicate
`dayDisplaysOfficial(di)` mirrors that render for the click/focus accessor (`displayedByDay`) and
the DayPop details modal — render, click and details now agree in ONE world. Aliased = no-op ⇒
parity untouched; the edit week is unchanged (working copy is the truth, so a pending fix previews
as solved). Codex GPT-6 Astra bug-check CONVERGED: REVISE(2: displayedByDay + DayPop) → REVISE(1:
VWORK mirror) → APPROVED(0). Full write-up + dispositions: the code-review doc's "ITEM 2" section.
Pins: `src/ui/viewrun.test.tsx`. **STILL genuinely open: CRPF-006/R2-004 the cross-week SEED dedup**
(a separate pre-existing crew-rest seed double-count — its own careful pass; NOT what Item 2 was).

### Earlier commits (green): `e10d231` Fable pass · `055847c` Decision #1 · handoff.

### DONE THIS SESSION (all committed)
- **Fable 5.1 independent pass** (`claudex-loop review --host codex --model claude-fable-5-1`,
  artifacts in scratchpad). Verdict REVISE, 6 findings; log appended to
  `…/2026-09-15-crewrest-flagging-code-review.md` ("FABLE PASS"). Fixed test-first:
  - **FR-001** (med, real bug Codex missed): `inpShow` ran the accepted-row deferral on the LIVE
    acc during the official pass → a sign-time 'g' whose working row was unaccepted showed twice on
    the issued face. Now computes the effective acc once and runs the whole gate on it.
  - **FR-002** (med): the cross-week alias gate compared a neighbour's frozen 'g' to the
    navigation-cleared live acc → forced the 2nd validate() pass every keystroke. `filingDiffers`
    gains an `xweek` flag ('g'=='' cross-week; 'r'/'u' exact). Zero-cost alias restored.
  - **FR-003 / FR-005** (low): withIssuedWeek install moved inside the try; inpShow reads `inp.iid`
    directly (no mint on the official pass).
- **"Not Yet Signed" marker = WORKING COPY ONLY** (owner 16 Sep 26): the published/issued face
  stays TRUE until published, so it never renders under PV (`html.ts`: `!PV&&notYetSigned`).
- **Decision #1 (owner 16 Sep 26)** — a request filed LIVE on a published day auto-accepts on the
  WORKING copy as a pending amendment (pending count rises); issued face frozen; scheduler removes
  if unwanted. `autoAcceptInput(row, onApproved)` splits the callers — interactive paths pass
  onApproved, seed/restore do NOT (no churn at load). filingDelta/filingKey untouched. See memory
  `published-day-input-is-pending-amendment`.

### OUTSTANDING — on THIS branch (do in order, next chat)

1. **ITEM 2 — DONE (16 Sep 26).** See the RESUME block above. It turned out NOT to be the seed dedup:
   the real bug was the view-only page drawing DRAFT days from the WORKING world, so a published-truth
   cross-day breach landing on a draft day was hidden by an unpublished working-copy fix. Fixed +
   gated + Codex-APPROVED + live-confirmed. (The cross-week SEED dedup CRPF-006/R2-004 is a SEPARATE
   still-open pre-existing bug — do it in its own careful pass, it is not what the owner was seeing.)
2. **ITEM 3 — NEXT. The remaining click/hover world-resolution (R3-004 / CRPF-009), medium, UI-focus.**
   The flags are CORRECT and visible; only puck/trace click-to-jump is off. Item 2 already did the
   DayPop modal's WARNING world (CRP-I2-002: dayInfoHTML now resolves through `dayDisplaysOfficial` +
   `withOfficialWarn`) and the `displayedByDay` click accessor. REMAINING: (a) `selectPerson`/
   `personWarnDays` (avail.ts) still read WORKING → clicking a published-only breach's PUCK to select
   the person doesn't light their official warning days (the flagged avail↔view world-resolution,
   CYCLE RISK — route through `dayDisplaysOfficial`, watch the import graph); (b) trace/warning refs
   need a `data-world` + stable id so a cross-world click is a defined no-op (CRPF-009); (c) optional:
   the DayPop modal's CONTENT for an approved view day (withDaySnap) — the WARNINGS half is done, the
   frozen-content half is the R3-003 remainder. Reuse `dayDisplaysOfficial` (one predicate, already
   the single source of truth). Details in the review doc's ITEM 2 + ROUND 3 sections.
3. **[FLAG-EXPORT] — owner picks the PDF design** (sample `docs/img/flag-export-sample-new.html`):
   denser/airier, a signature block, include duties/sims/ground rows, logo, portrait vs landscape.
   Then finalise + the deferred next-week-peek working-vs-signed labelling.
4. **Live-drive Decision #1** (standing UI instruction — not yet done this session) + the 7-day
   scenario, on the built bundle. Then **Push → Vercel → "merge live"** when the owner is happy
   (do-not-watch-PR holds).

### OWNER MANDATE — SCENARIO-BASED BUG TESTING, STANDING FOR ALL BUG TESTS (16 Sep 26)
The bug slipped because the tests checked the two-world MACHINERY (one input, one day, one flag),
never a realistic scheduler SCENARIO — and a reviewer-flagged rules bug was wrongly filed as "rare".
Henceforth (owner: "Henceforth all bug tests will be done this way") EVERY bug test is BOTH:
1. **Machinery + scenario unit tests** — build a real week AND its neighbours (empty/full prior
   week, published/draft mix, a cross-boundary run like Tue→Mon), plant a concrete situation ("Warden
   works Mon→Sun, nothing before"), assert the warnings land on the RIGHT DAYS (wrong ones clean).
2. **A LIVE-APP scenario drive** (owner: "test scenario by literally setting on the app and see if it
   happens to what u want. That is the real bug test on top of the machinery") — build + `vite
   preview`, log in, recreate the EXACT scenario in the app (the `window.setPage/addWave/
   openScheduler` bridges + real edits/publishes), and CONFIRM the behaviour visually. A green vitest
   is necessary but not sufficient. Enumerate alternate scenarios first. Never defer a flagged bug as
   "rare" without a scenario proving it. Memory: `scenario-based-rule-testing`.

### OUTSTANDING — the wider backlog (other branches/tasks; full detail in `OUTSTANDING.md`)
- **[AMEND-SEL-FOLLOWUPS]** — on `claude/amendment-engine-core` (PR #405); the per-plan signature
  work. (Decision #1 was done WITHOUT touching signatures, so no longer blocks on it.)
- **[REPO-CLEANUP]** — delete consumed screenshots + dead-code sweep (owner sign-off per file).
- **[ARCH-STACK]** backbone: step 2 (`claude/arch-stack-2-command-core`), step 3 `[GLOBAL-UNDO]`,
  step 4 (one Absence record), then `[DB-STEP]` (Dataverse).
- **[SYNC-INTEG]**, **[EOD]**, **[OIL]**, **[TRK-ATTEMPTS]**, **[RECALL]**, **[XFER]**,
  **[TRK-DISK]** — see OUTSTANDING.md.

### Opening prompt for the fresh chat
> Continuing Raptor. Select branch `claude/crewrest-published-flagging` (off main, NOT merged).
> **Read `raptor-port/docs/session-state.md` first**, then the code-review doc
> `…/2026-09-15-crewrest-flagging-code-review.md`. Gates are green (vitest 4795/4795, build,
> tfin 728/0, e2e). Fable + Codex both available. Do the "OUTSTANDING — on THIS branch" list:
> **ITEM 2 first** — the cross-week 7-day-run bug. Repro: Warden works Mon→Sun (Jul 13–19), Mon+Tue
> published / Wed–Sun draft, NOBODY works the prior week → the 7-day breach should land on Sunday
> but shows ONLY on Tuesday; also make the 7-day run truly continuous cross-week (Tue→Mon etc.).
> **Test-first and SCENARIO-BASED** (build real weeks, assert warnings land on the right days — see
> the "OWNER MANDATE" section), then a bug-check across BOTH Fable and Codex. Then ITEM 3 (the three
> click/hover fixes). Opus, heavy, test-first. Don't merge until I say "merge live". Speak plainly.

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
