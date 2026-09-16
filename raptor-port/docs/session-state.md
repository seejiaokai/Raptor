# Session handoff — [CRP-FLAG] flagging + [FLAG-EXPORT] export, COMBINED on one branch

## RESUME HERE (handoff to a fresh chat, 16 Sep 26 — end of the Fable + Decision-#1 session)

**Branch to select: `claude/crewrest-published-flagging`.** Off `main`, NOT pushed, NOT merged.
Three clean commits since the last handoff, ALL green (**vitest 4795/4795 · build clean · tfin
728/0 · e2e browser gate green**):
- `e10d231` — the Fable cross-provider pass: FR-001/002/003/005 fixed test-first + the
  "Not Yet Signed" marker moved to WORKING-COPY ONLY.
- `055847c` — Decision #1: a request filed live on a PUBLISHED day is a working-copy pending
  amendment.
- (handoff commit for this doc.)

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

1. **ITEM 2 — the cross-week 7-day-run bug (CRPF-006/R2-004). HIGHEST RISK, do it FIRST with care.**
   **Owner's confirmed repro (16 Sep 26):** the week of Jul 13–19, Warden works Mon→Sun (7 straight);
   Mon+Tue published, Wed–Sun draft; and **NOBODY works the prior week (Jul 6–12 — all ground days)**.
   The 7-day breach (maxRun=6, so breach on the 7th day) should land on **SUNDAY** — instead it lands
   ONLY on **TUESDAY**. The cross-week seed (`seedRunIn`/`workedSet`/`prevSundaySeed`, weekctx.ts) is
   inventing ~5 phantom prior-week days for Warden and mis-placing the breach. This is the flagged
   seed double-count, and it is an ORDINARY case, NOT "narrow". **Also required (owner):** the 7-day
   check must be truly CONTINUOUS across ANY 7 consecutive days incl. cross-week (e.g. Tue→Mon), not
   tied to Mon–Sun. Root fix direction (from the review): make the accepted-row / seed dedup
   DAY-LOCAL (defer to a row on the day BEING BUILT, `d.ground`), replacing the blanket
   `if(xweek)return true` bypass in `inpShow`; thread it through buildDay for loaded/neighbour/
   midnight-tail. HIGH regression risk across every seed read — parity 728/0 + full suite are the net.
   **TEST-FIRST, SCENARIO-BASED (owner mandate — see below).** Then a cross-provider bug-check
   (BOTH Fable + Codex).
2. **ITEM 3 — the three click/hover fixes (R3-003 / R3-004 / CRPF-009), medium, UI-focus.** The flags
   are CORRECT and visible; only click-to-jump is off. (a) DayPop day-detail modal reads live
   DAYS + WORKING WARN → resolve its displayed version (withDaySnap + withOfficialWarn for an
   approved view day); (b) selectPerson/personWarnDays read WORKING → a published-only breach's puck
   opens no box (avail↔view world-resolution, cycle risk); (c) trace/warning refs need a
   `data-world` + stable id so a cross-world click is a defined no-op. Details in the review doc.
3. **[FLAG-EXPORT] — owner picks the PDF design** (sample `docs/img/flag-export-sample-new.html`):
   denser/airier, a signature block, include duties/sims/ground rows, logo, portrait vs landscape.
   Then finalise + the deferred next-week-peek working-vs-signed labelling.
4. **Live-drive Decision #1** (standing UI instruction — not yet done this session) + the 7-day
   scenario, on the built bundle. Then **Push → Vercel → "merge live"** when the owner is happy
   (do-not-watch-PR holds).

### OWNER MANDATE — SCENARIO-BASED RULE TESTING (16 Sep 26, why Item 2's bug slipped)
The bug slipped because the tests checked the two-world MACHINERY (one input, one day, one flag),
never a realistic scheduler SCENARIO — and a reviewer-flagged rules bug was wrongly filed as "rare".
For Item 2 (and any rules-engine work): **build a real week AND its neighbours, plant a real
situation (e.g. "Warden works Mon→Sun, nothing before"), and assert the warnings land on the RIGHT
DAYS** — the outcome a scheduler eyeballs, not the internal return value. Enumerate alternate
scenarios first ("what if this happens?"): empty/full neighbour weeks, cross-boundary runs,
published-vs-working splits. Never defer a flagged rules bug as "rare" without a scenario proving it.
Memory: `scenario-based-rule-testing`.

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
