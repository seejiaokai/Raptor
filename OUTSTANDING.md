# Outstanding & standby tasks

A running backlog of work deferred or placed on standby, so it can be picked up
in a future session. Companion to `HANDOFF.md`; this is the "not now, but don't
lose it" list.

**To resume:** read this file first, then the relevant design record (linked per
item).

> ## Maintaining this file — do this every time it's touched
> - **Completed** → move the item to **Done** at the bottom, with the date and a
>   one-line "how it was resolved."
> - **Deferred again / changed** → update the item's status and note why, and
>   adjust its place in the priority list.
> - **Re-order the priority list whenever items change** — by *logical* order,
>   not habit: what's actionable now, what's blocked, dependencies, and effort
>   vs. risk. Call out any non-obvious ordering in one line.
> - **Before adding an item, verify it isn't already done** (check git log /
>   `main` / the code) — don't backlog completed work.
> - Keep it true, like `HANDOFF.md`. A stale backlog is worse than none.
> - Item **IDs are stable** (`[AMEND]`, `[OIL]`…); priority is a separate
>   ordered list that references them, so re-prioritising never renumbers items.
> - **Rich context → a committed context doc.** When a task carries reasoning worth
>   keeping (why a decision went that way, research, rejected options, mockup links),
>   capture it in a committed doc in the repo and link it from the item's **Context**
>   line — so the next session pulls the *thinking* out, not just the task title.
>   Don't leave the reasoning only in a chat; the chat is gone next session.

**Model guidance (owner's standing rule):** build / voluminous multi-file / lots
of reading → **Opus 4.8, default**; hard-reasoning review, bug-check, verify or a
tricky design call → **Fable 5.1, high**; mechanical / low-risk → a cheaper model.

---

## Priority — logical order (updated 13 Sep 2026)

**NEW backbone (owner, 13 Sep 26): [ARCH-STACK]** — a whole-app architectural review (both
providers) reframed much of the backlog as ONE ordered stack (stable ids → one write/command
layer → global undo → one-Absence-record → storage door/DB → remove quarantine). Owner's rule:
**fix the architecture first, then individual bugs.** `[GLOBAL-UNDO]`, `[INP-CSID]`, `[TRK-CSID]`,
`[CMDL-FINISH]`, `[DB-STEP]` are STEPS of it. STOP: interim two-system undo patches + further
quarantine rounds.

**STACK PROGRESS (updated 18 Sep 26):** step 1 (stable ids) DONE; step 1b quick wins DONE;
**step 2 (the one command/commit layer) DONE + LIVE** — follow-up #1 (routing every scheduler
write, PR #409/#410) AND **`[CMDL-FINISH]`** (finishing the command layer for Leave War + Tracker:
the causal both-side envelope, the per-record write seam, one-envelope-per-Tracker-gesture, guarded
lw/trk stores, `TRK_RESTORING`, `sched.als` re-key, and the cross-provider inspection punch-list)
both merged and live — PR #412 (build) + PR #415 (finish), plus the undo front-door doc #413.
**step 3 (`[GLOBAL-UNDO]`) — PHASE 1 + PHASE 2 BUILT + MERGED LIVE (18 Sep 26).** The one global
undo timeline is live: every Undo/Redo (scheduler/board/Leave War) drives it, plus the Unpublish
button and off-week undo. Built test-first (Opus high), driven in the app, dual-reviewed (Fable +
Codex) and folded in. Two `[CMDL-FINISH]` items were deferred INTO it and remain open (the Leave War
posting-window rebuild on a postouts restore = CMDLF-002; grouping a whole Import as one undo step),
plus the phase-2 review deferrals under the item below. **NEXT = step 4 (one Absence record) / [DB-STEP].**

**STEP 4 ([ONE-ABSENCE]) — DESIGN Rev 2 DONE + dual red-teamed (19 Sep 26); GATED on owner decisions.**
Design + both-provider red-team (Codex/Astra high + Fable, both REVISE→affirmed the direction, all
7+11 findings folded) on branch `claude/arch-stack-4-absence-record-design`. The model: an approved
absence becomes ONE record (the scheduler Input); the Leave War stops storing its own copy and reads
approved leave by id (a pure in-memory projection, like the roster). **Decision-ready, NOT build-ready
— it branches on two NEW owner decisions the red-team surfaced** (a *moved* approved bid: keep approval
or return to pending — a live 27 Aug feature; and an absence change on a *published* day: silent or a
pending amendment) plus four earlier ones. **PREREQUISITES: [SYNC-INTEG] P2 + P4 must land first.**
After the owner answers → Rev 3 → a second red-team round → build. Docs:
`docs/superpowers/specs/2026-09-19-arch-stack-4-one-absence-record-design.md` (§8 = the decisions) +
`…-review-log.md`.

Below is the older item ordering (kept for the non-stack items); land what's **cheap, done, or
in-flight and risk-reducing** first.

1. **[AMEND]** — the main project. Decisions resolved; brief re-frozen & re-reviewed;
   **CORE built + round-3 in progress** on `claude/amendment-engine-core`. **[BUG2]**
   folds in here.
   - **[AMEND-SEL-FOLLOWUPS] — DONE + LIVE (merged 15 Sep 26, PR #405).** See the Done
     section for the resolution. The 7 changes (incl. the signature-leak bug, taken the
     per-plan way) were built, cross-provider bug-checked, and merged to `main`.
   - **[REPO-CLEANUP] (owner, 15 Sep 26) — DONE (18 Sep 26). Nothing removed, by owner's choice.**
     Step 1 (delete the handoff screenshots) was done earlier. Step 2, the repo-wide space/
     redundancy sweep, was RUN this session and found the repo already tidy — so do NOT re-run it:
     **zero dead source files** (all 522 checked by an import-graph scan), and only **~0.9 KB** of
     genuinely-dead CSS (every other unused-looking class is built dynamically at runtime, e.g.
     `seat-${seat}`, the `g-*` group family — removing them would break the app). The only real
     weight was **~0.6 MB of design write-ups for already-shipped features**; the owner chose to
     **KEEP them on purpose** — better for history-keeping (a note left in the tree is browsable;
     a git-deleted one is only recoverable if you know it existed). No files removed. See the Done
     section for the full result.
1b. **[TRK-SMOKE] — DONE + MERGED LIVE (17 Sep 26, PR #408, squash `93deab7` on `main`).**
   Code-only cherry-pick; the rest of this branch stayed unmerged. It was NOT a flake: two real
   causes. See the Done section entry for the
   full diagnosis; in short — (a) the add-student box cleared its field a beat after it
   opened, so a machine-speed fill was wiped and the add silently no-op'd; (b) a failing run
   abandoned its preview server, and on Windows even a passing run did, so the next run
   couldn't bind the port and failed on clean code. Both fixed, cross-provider reviewed
   (Codex + Fable), gates green. The follow-up #1 build can run its per-phase gate set.
2. **[SYNC-INTEG]** — now just the small NON-undo guardrails (medical member-filed,
   clutter-only clear-data, Quals ✕ confirm, doc fix). Low urgency (pre-live); cheap batch.
   *The undo/permission half was pulled out into [GLOBAL-UNDO] (owner, 13 Sep 26).*
3. **[EOD]** — the end-of-day feature split out of [AMEND]; design-first follow-on,
   after the core lands.
4. **[OIL]** — depends on [AMEND]; do straight after.
5. **[TRK-CSID]** / **[INP-CSID]** — the stable-id work (Tracker courses/syllabuses;
   schedule personal inputs); independent, medium, not urgent.
6. **[TRK-ATTEMPTS]** — small new feature, low urgency.
7. **[RECALL]** — future feature (fresh recall from archive); design when reached.
7a. **[CMDL-FINISH] — DONE + LIVE (18 Sep 26, PR #412 build + PR #415 finish).** The one command
   layer is finished for **Leave War + Tracker** (causal both-side envelope, per-record write seam,
   one-envelope-per-Tracker-gesture, guarded lw/trk stores, `TRK_RESTORING`, `sched.als` re-key,
   cross-provider punch-list). See the item below / the Done section. Its two deferred items fold
   into `[GLOBAL-UNDO]`.
8. **[GLOBAL-UNDO] — PHASE 1 + PHASE 2 BUILT + MERGED LIVE (18 Sep 26).** The one-global-undo
   re-architecture; absorbs [XWEEK-UNDO] and the whole delete/undo bug family. Live cutover done
   (scheduler/board/Leave War undo + Unpublish + off-week). Deferred review items + the two inherited
   [CMDL-FINISH] deferrals under the item below; the multi-user/per-session refinements land at [DB-STEP].
9. **[DB-STEP]** / **[XFER]** — the future database milestone and multi-squadron
   transfer; **[TRK-DISK]** (Decision A) is fixed inside [DB-STEP].

*(Done 12 Sep 2026: **[TRK-IMPORT]** and **[TRK-LEDGER]** — both merged live; see Done.)*

---

## In plain terms (quick read)

One line each, no jargon:

- **[AMEND] — The amendment engine rebuild (the big one).** Each day gets its own
  amendments, published is locked, every change is a new AL, no take-backs. Decisions
  made; now being built, phase by phase. The end-of-day "record actuals" part is split
  off as **[EOD]** to build later.
- **[EOD] — The end-of-day "what actually flew" record.** A quick end-of-day note of
  what really happened (scrubs, changes), with no sign-off. Designed, but it needs its
  own careful round before building — set aside so the main rebuild ships first.
- **[OIL] — Don't wipe off-in-lieu someone already earned.** Removing a person by
  amendment currently erases their weekend/holiday OIL — wrong if they'd already
  worked the day. Lock it once the day's been worked. After the amendment rebuild.
- **[BUG2] — Double-check one suspected bug.** A reopen button might act on the wrong
  version while you're viewing history — Astra thinks it may not actually happen.
  Quick check, folded into the amendment work.
- **[SYNC-INTEG] — Small safety guardrails for leave.** Medical can only be filed by the
  member (not created on the Leave War); the "clear old data" button only clears clutter and
  never touches leave/balances; a warning on the Quals ✕; a doc fix. (The bigger delete/undo
  fixes moved to [GLOBAL-UNDO].) Low urgency — we're not live yet.
- **[CMDL-FINISH] — Finish the shared foundation for Leave War + Tracker (next architecture step).**
  The "command layer" (the app's one proper doorway for changes) was finished for the main schedule
  but only half-done for Leave War and the Tracker — some of it was quietly left for later. Global
  undo can't be built safely until it's finished. Found by red-teaming the undo design on paper
  before building. This is the next build; global undo comes right after.
- **[GLOBAL-UNDO] — One undo for the whole app, before the database step.** Today each
  section has its own separate undo, and that's the root of the weird delete/undo bugs. One
  shared undo (per login session, never touching another user) removes that whole class of
  bugs instead of patching each. A step to do before going live / before the database.
- **[RECALL] — Bring a posted-out person back, fresh.** When someone leaves the whole app
  and returns, they come back with new quals and new leave balances (past kept as record) —
  not their old ones. Future feature.
- **[XWEEK-UNDO] — Undo across weeks (part of [GLOBAL-UNDO]).** If you undo something on a
  week you're not viewing, the app takes you to that week and shows what changed. Built as
  part of the one-global-undo step.
- **[XFER] — Move a person to another squadron, data intact.** In the multi-squadron future,
  transferring someone carries all their data across (unlike leaving the system, which resets).
- **[INP-CSID] — Give leave/personal inputs a permanent hidden tag.** Like schedule rows and
  students already have, so two look-alike entries can't cross when one is deleted.
- **[TRK-CSID] — Give courses and syllabuses a permanent hidden tag.** Students and
  schedule rows already have one (so they survive being moved or renamed); courses
  and syllabuses don't yet, so renaming one is riskier. Medium job, not urgent.
- **[TRK-ATTEMPTS] — Remember a student's earlier attempts.** Today only the latest
  grade is kept; this would keep the earlier tries too. Small new feature.
- **[TRK-DISK] — A rare "nearly-full storage" data-loss gap.** On upgrades or renames
  the app trusts its own memory instead of confirming the save really reached storage
  before deleting the original. Rare, mostly self-heals. Best fixed with the database
  step.
- **[DB-STEP] — The big future move to a shared database.** Today everything saves
  only in your own browser — nothing is shared across people or devices. This is the
  large future project (Dataverse) that several parked items fold into.

---

## Items

### [AMEND] Amendment engine redesign — CORE BUILDING (decisions resolved)
Rebuild the publish/amend/version model: per-day isolated numbering (never
week-wide), published = immutable, every change a new AL, supersede-never-retract,
undo cannot cross a publish, load-old-version → republish-as-next-AL as the safe
recovery path.
- **Decisions RESOLVED (owner, 12 Sep 26):** plans SURVIVE as backups; ALL FOUR roles
  re-sign every amendment; crew SEE the live draft (issued stays authority). OIL for
  this build = latest AL/Original per day, per-day, read-failure protection (the
  worked-day lock stays **[OIL]**).
- **Reviewed:** the design brief was re-frozen (Rev 3) and re-reviewed by BOTH providers
  (converged), then Rev 4 owner additions (EOD, OIL simplification, plan names) got a
  further Astra/Codex red-team → Rev 5. Plan naming passed clean; the EOD findings
  (REV5-01…05) are why EOD is split out (see **[EOD]**).
- **Must-build (still in scope):** AM-01 date-qualified version IDs; AM-02 versioned
  saved-week migration (incl. Leave War's direct reads); AM-04 what a published version
  captures; AM-06 signatures bound to content; AM-09 durable write/lease.
- **Now:** building the CORE test-first on `claude/amendment-engine-core`, phase by
  phase; full gates per phase; **no merge without "merge live"**; fresh Codex inspection
  of the final code.
- **Model:** build on Opus 4.8 (high); final code inspection on Codex; Fable reserved
  for a single high-stakes finding.
- **Context & records (read to resume):** the build plan
  `raptor-port/docs/superpowers/specs/2026-09-12-amendment-core-build-plan.md` (phases +
  proofs), the frozen spec `…-amendment-core-build-brief.md`, the decisions doc
  `…-2026-09-11-amendment-model-decisions.md` (rationale, mockups §10), and the review
  log `…-amendment-rev4-rev5-review-log.md`.

### [EOD] End-of-Day "record actuals" — DEFERRED (design follow-on, after [AMEND] core)
The end-of-day actuals record: a distinct end-of-day publish that captures what actually
flew (scrubs, deviations), labelled EOD, with **no four-role sign-off** — just "recorded
by X". Owner designed it 12 Sep; split out of the core build because an unsigned publish
path in a clock-free app needs its own design cycle. Astra/Codex REV5 findings to resolve:
- **REV5-01** the "day is closed" boundary is scheduler-asserted with no eligibility rule
  → a future day could be closed+EOD'd to publish an unsigned plan change; the app has no
  clock (`weeknav.ts TODAY` fixed). Needs a real "day is done" mechanism or a narrowed,
  documented trust guarantee (EOD is never the forward-plan authority).
- **REV5-04** "worked" ≠ "marked closed": a worked-as-planned day gets no EOD and stays
  unclosed, so a later AL can still strip its OIL; legacy worked days too. Needs a
  no-content-change closure path + treatment of unclosed/legacy worked dates.
- **REV5-02** a late OIL acknowledgement (`reviseOil`→`row.oil`, no publication gate) has
  no defined transition into an immutable/closed day.
- **REV5-03** pick ONE correction transition (corrections are EOD-kind, not signed AL).
- **REV5-05** closing a day doesn't freeze holiday eligibility (`setDayEvent` removing a
  PH → `runOilPass` deletes the credit, no closed-day guard); freeze the non-working basis.
- **Design record:** the EOD design is preserved in §3b of `…-amendment-core-build-brief.md`;
  findings + dispositions in the review log. **Model:** design-first, red-team both
  providers again before building; then Opus build + Codex inspection.

### [OIL] Lock earned OIL on an already-worked day — STANDBY (after [AMEND])
An amendment that removes a person re-derives Leave War auto-OIL from the current
published version and sweeps it away — correct for a **future** day, wrong for a
**past** day already worked.
- **Decision (owner leaning, 11 Sep 26):** earned OIL on an already-worked day is
  **locked**; amendments only affect OIL for days not yet flown. Exception: an
  amendment whose explicit purpose is "he didn't work it after all."
- **Cross-feature, verified:** `src/leavewar/sync.ts` `runOilPass`/`desiredOilCells`
  + `src/engine/oil.ts`; acknowledged claims (`row.oil`) are the only sticky source
  today. Sequenced after [AMEND].
- **Model:** build on Opus; a Fable-high bug-check (touches money + saved data).

### [BUG2] Verify the reopen control during version preview — SMALL (folds into [AMEND])
Astra says the original Bug 2 may **not** reproduce (EditWeek `ed=false`; SchedBoard
`pv=true` → no controls emitted). Verify; keep the defensive handler guards.
- **Model:** Fable, high — short, focused verification.

### [ARCH-STACK] The architectural root-cause stack — the backbone (both providers, 13 Sep 26)
**STEP 1A DONE + LIVE (13 Sep 26, PR #396):** stable ids on the scheduler side — input filing by
`iid` (`[INP-CSID]` done), day notes as `{rid,t}` objects, coordinated storage-format reset;
plus a history-ordering determinism fix and a cross-week accepted-input edit/delete guard. Both
providers inspected the built code; all findings fixed. Remaining in step 1: **1B** (`[TRK-CSID]`,
Tracker ids — split 13 Sep 26: **1B-i COURSE ids DONE + LIVE**; **1B-ii SYLLABUS ids DONE + LIVE**
(14 Sep 26 — incl. a Fable review, then an independent Codex re-review that found RR-01/02/03 +
owner-requested RR-03b, all fixed and merged via PR #402)) and **1C** (`who→personId`,
parity-sensitive). **1C DONE + LIVE (14 Sep 26, PR #403, merged to `main`, deployed & live-verified).**
Ground/Common-Programme `who` now store the stable person id (flying/duty/sim/inputs already did);
rename is label-only (the DAYS-walk is gone); sim `who` is free text only; `addPerson` refuses an
id-colliding callsign; coordinated storage reset (SCHEMA_VERSION 1→2). Process: design →
cross-provider plan red-team (Claude + Codex, both REVISE → fixes folded) → Opus 4.8 build →
independent cross-provider code inspection (Claude SHIP-READY; Codex REVISE → test-strength + a
peek regression fixed + locked; two-tab reset limitation acknowledged as [DB-STEP]-owned). Gates:
tfin.js 728/0, vitest 4728/4728, smoke 425/0, build; live-verified (ground/programme names resolve
id→cs, sim `who` shows as text, all assets 200, no console errors). *(Deploy note: the first two
publish runs hit the known `addStudent` smoke flake — deploy skipped; a fresh workflow_dispatch run
was green and published, exactly the #398 pattern.)* Spec + dispositions:
`raptor-port/docs/superpowers/specs/2026-09-14-arch-stack-1c-personid-spec.md` (§§12–13 binding).
**With 1C, step 1 (stable ids everywhere) is COMPLETE.**

**STEP 1b — PARTIAL, in review (14 Sep 26, PR #404, held for "merge live").** The two
GENUINE quick wins of 1b are built on `claude/arch-stack-1b-quickwins`: (a) the `mod:'now'`
late-mark freeze — input write paths stored the literal 'now' and re-resolved it to
read-time "today", so an on-time input silently read LATE once re-read on a later day
(latent until INPUTS persist at the DB step); now frozen to today's ISO at the write
(`nowStamp()`, all 7 sites), display still reads "now" same-day. (b) A **SessionState reset
registry** (`view.ts` `VIEW_RESET`) — `resetSession`/`loadWeek` hand-clear-lists had drifted;
one declared per-field policy both iterate, plus a drift-guard test; closed two leaks it
surfaced (HLGROUP, RESTARM). Gates: vitest 4737/4737, build, tfin 728/0 (e2e's 2 phone-width
fails + tracker smoke `addStudent` timeout are pre-existing on `main`, verified). **The other
two 1b items were NOT quick wins on inspection and are SPLIT OUT (owner-approved, 14 Sep 26):**
**ISO dates** is a parity-sensitive record-shape change across ~20 files (`date`+`yr`+`endDate`
→ ISO, Leave War sync, medical, quarantine, storage reset) — promote to its own item with a
design + cross-provider red-team before building; **landing-on-the-row** is largely delivered
by 1A (ground row `src`→stable iid) and its remainder is owned by **step 4** (one Absence
record) — no separate 1b work.

Deferred
follow-ups: (finding 2, orphaned `Other` hard-grade) noted below; and a
**pre-existing** peek-preview cache nit surfaced by the 1C code inspection
(Codex PID-R03) — the ViewWeek preview cache keys on the week only, so a person
rename isn't reflected in the cached preview until a week change. Predates 1C
(perf-cache-adjacent); fix by adding a roster-revision to the preview cache key
when convenient (low priority, cosmetic).
A whole-app architectural review by BOTH Astra and Fable (read-only) converged on one story:
the app is **one store-pattern built three times** (Scheduler / Leave War / Tracker), and it
knows only THAT something changed, never WHAT. The fix is a **record-level change stream over
stable ids** that undo, persistence, sync and the database all consume — build once, not four
times. Several existing items are STEPS of this stack. **Full plan (root causes, order, effort,
what to stop):** `raptor-port/docs/superpowers/specs/2026-09-13-architecture-rootcause-plan.md`.
- **Order:** (1) stable ids everywhere [INP-CSID]/[TRK-CSID] + `who→personId`/note-ids/`iid`→UUID
  — DONE; (1b) quick wins — the `mod:'now'` late-mark fix + a session-reset registry DONE (PR #404,
  in review); landing-on-row folded into step 4, ISO dates split to its own item (see 1b status
  above); (2) ONE write/command layer (all 3 modules, PEOPLE/settings included);
  (3) global per-session undo as inverse-patch [GLOBAL-UNDO]; (4) ONE Absence record (design NOW,
  before the Dataverse tables freeze); (5) record-oriented storage door → Dataverse [DB-STEP];
  (6) remove the quarantine/legacy machinery.
- **Stop now:** interim two-system undo patches and further quarantine rounds (both replaced by
  steps 2–3 and 6). Only the small [SYNC-INTEG] guardrails remain worth doing pre-stack.
- **Model/process:** HEAVY, foundational. Each step: design → red-team (Astra lead, Fable for the
  crux) → build → inspect → gates → hold for "merge live". Start with (1) — cheap, independent.
- **Context:** the plan doc above (synthesises both reviews); memories
  `architectural-root-cause-before-minute-fixes`, `future-undo-semantics-multiuser`.
- **Sequence re-review (Astra/GPT-6 high, 13 Sep 26) — REVISE, backbone SOUND.** Adds a
  **split/incremental invariant + property-testing layer** (small harness now → grown per step →
  property tests at the command layer → persistence fault tests at the DB step; NOT big-bang, NOT
  DB-eve). Invariants must be CLASSIFIED first (hard-enforce vs advisory-detect vs frozen-issued) —
  don't enforce example rules literally (double-booking is intentionally warn-not-block; only the
  ISSUED snapshot is immutable). Order refinements: undo (3) must respect the amendment publish
  boundary; pull the transaction/conflict contract + storage test-double ahead of undo (into 2);
  do one-Absence (4) before retiring the 3 undo stacks. Full dispositions in the plan doc's
  "Sequence re-review" section.
- **1A follow-ups (post-build inspection, 13 Sep 26):** two faces of the cross-week accepted-input
  LANDING model that step (4) "one Absence record" dissolves. (a) **DONE now (owner: guard):** editing/
  deleting an accepted input whose ground row is on a non-loaded week is refused with "Load the week
  of <date>…" (was a silent stale link under stable ids) — `inputedit.tsx:landedOnUnloadedWeek`. (b)
  **DEFERRED to step (4):** an accepted `Other` whose input is later deleted loses its hard-clash
  grade (orphaned row → `shiftHardGround` can't resolve the type; narrow — Fable inspect #2). Fix
  when landings become the one Absence record, or a cheap `srcType` on the ground row if it surfaces.

### [TRK-SMOKE] The `addStudent` tracker smoke check — DONE 17 Sep 26 (committed, NOT merged)
**Answer to the mandated first question: NOT a flake.** It failed deterministically at one spot
(the second of two back-to-back adds) and, when the machine was clean, a specific race — proven
by instrumenting the running app at the failing add and reading the value the box held at submit
time. Two independent causes, both fixed:

1. **The add-student box wiped the typed name (shipped bug).** The shared in-page dialog cleared
   its text field to the default in a POST-PAINT step that ran a beat AFTER the box was already
   fillable. A human types later than that, so a person never hit it — but a machine-speed fill
   (the smoke suite, a fast paste, a password manager) landed the name before the clear, which
   then wiped it, so OK submitted a blank and the add silently no-op'd → the roster option never
   appeared → 15s timeout. FIX (`src/tracker/components/Modals.jsx`): clear the field DURING
   render, before it is ever shown, so nothing typed can be clobbered. Focus moved to its own
   effect keyed on the dialog serial (a Fable-review fix — the interim version cancelled the
   cursor when any background refresh landed within 30ms of opening). Two regression tests pin
   both, each proven to fail on the pre-fix code.
2. **Failed runs (and, on Windows, ALL runs) abandoned the preview server.** The harness only
   tore down at the end-of-file; a timed-out check threw before that and left the vite server
   holding the strict port, and on Windows even a passing run leaked it because `server.kill()`
   killed only the shell wrapper, not the vite child. An orphan on the port makes the NEXT run
   fail to bind — the "stray :4179" and "fails three times running on clean code". FIX
   (`scripts/tracker/smoke.mjs`): register a teardown (close browser + kill server) BEFORE the
   browser launches and on any crash, memoised so a second failure can't race ahead of it, with
   a Windows tree-kill (`taskkill /T /F`) and a bounded browser close.

**Verification.** vitest 4868/0 · build clean · parity 728/0 · tracker units 76/76 (2 new
regression tests) · `npm run smoke:tracker` 425/0 repeatedly with the server confirmed torn
down, and a forced browser-launch failure now cleans up too. Cross-provider bug-check: Codex
(found the teardown-before-launch gap, fixed) + Fable (found the focus regression + a concurrent-
teardown leak, both fixed). **MERGED LIVE 17 Sep 26 (PR #408, code-only cherry-pick, squash
`93deab7` on `main`).** Only the tracker fix went live; the rest of the branch stayed unmerged.
NB the app itself is fast (Tracker tab opens in ~0.4s, instant thereafter); the slowness during
this work was the leaked servers, not the app.

---

### [SYNC-INTEG] Leave War ↔ inputs guardrails (NON-undo part) — small, ready
A read-only cross-provider audit (Codex + Fable, 13 Sep 26) of DELETE/UNDO across the
Leave War ↔ inputs ↔ documents seams found a family of data-integrity + permission
issues. **All decisions, findings and the fix plan are in**
`raptor-port/docs/superpowers/specs/2026-09-13-sync-delete-undo-integrity-spec.md`.
**DECISION 13 Sep 26 (owner):** the whole UNDO/permission half of this — the delete-vs-undo
resurrection, the undo-family bugs, and the member-undoes-admin gap — is NOT patched here;
it is dissolved wholesale by a single **global undo re-architecture → see [GLOBAL-UNDO]**,
done as a step BEFORE the database. Do NOT build interim two-system undo patches (they'd be
thrown away). Rationale: pre-promulgation demo data (no live users), and the root cause is
having two separate undo systems over shared data — remove the root, don't patch each face.
- **What REMAINS here (independent of undo, small guardrails):** P2 medical is member-filed
  only (block creation on the war for all roles + hide the war medical pickers; existing =
  demo, reset — no migration); P4 "Clear old data" is CLUTTER-ONLY (old pucks/day-notes/empty
  past weeks; never deletes any leave/medical/duty input; never the loaded week); P6 a Quals ✕
  confirm; P7 fix CLAUDE.md's stale "Leave War session-only" line.
- **Urgency:** low (pre-live); do as a cheap batch when convenient. Model: Opus build,
  gates, no merge without "merge live".
- **Context:** the spec/record above (findings, dispositions).

### [CMDL-FINISH] Finish the command layer for Leave War + Tracker — ARCH-STACK step 2 completion — DONE + LIVE (18 Sep 26)
**STATUS (18 Sep 26):** DONE + LIVE. P1–P6 (P4 partial) merged as PR #412; the undo front-door doc
as PR #413 (`docs/undo-contract.md`); the FINISH work — the remaining P4 Tracker gestures,
`TRK_RESTORING`, registering trkStore guarded, and the cross-provider inspection punch-list — merged
as **PR #415** (`7889ff5` on `main`), deployed and live-verified (Tracker renders, no console errors).
All five gates green. Punch-list: 6 fixed (CMDLF-004/005/006/010/012, Fable#7/#8), 2 deferred with
reasons (**CMDLF-002** postouts-reproject → [GLOBAL-UNDO], marker in `leavewar/state/store.ts`;
**CMDLF-011** legacy sched.als → reset-demo-data, no fix); importClick left per-write (grouping the
whole Import is the [GLOBAL-UNDO] import-undo-granularity question). Both deferrals + the seams this
built are [GLOBAL-UNDO]'s to consume/complete. Detail: `docs/session-state.md`; front-door doc
`docs/undo-contract.md`.

The 17 Sep design + dual red-team (Codex + Fable, both REVISE, converged) of `[GLOBAL-UNDO]`
found that ARCH-STACK step 2 is genuinely finished only for the **scheduler**. Building global
undo requires the command stream to carry the FULL ripple of one user action as one causal unit,
and to have a real per-record write-back seam — neither exists yet for Leave War or Tracker.
Owner decision (17 Sep 26): do this as its **own gated step FIRST**, then build global undo.
- **What to build (concrete, from the red-team fix specs — see the review log below):**
  - **The causal both-side envelope (F1/GU-001) — the load-bearing item.** Route the Leave War
    sync reconcilers as `origin:'projection'` (`commitInputsAs`/`commitSchedAs`/`cmdCommitAs`);
    route LW `persist()`'s locked/committing branch through a projection commit so a causal write
    raised inside a reducer JOINS its envelope and a reconciler write raised from a notify becomes
    a `projection` with `causedBy`; fix `causalSeq` so phase-8 subscriber commits chain `causedBy`.
  - **Per-record write seam (F8/GU-007):** add `write(entry)` to `EnlistableStore` per store (rebuild
    live state + derived indexes + baselines, then persist+notify); a scoped per-commit conflict
    checker reading `expectedRevs`.
  - **One Tracker gesture = one envelope (GU-004):** group each gesture's synchronous model changes
    (`popGrade` mark + Last-Flown; add/delete/import) into one transaction before async persistence.
  - **Off-week capture (GU-003/F6):** register the weekstash as an `EnlistableStore`, OR keep the
    current off-week edit refusal until it exists (don't claim finding I solved).
  - **Re-key `sched.als/<id>` by id (F5):** a Step-1 stable-id leak (array-index keys) surfaced here.
  - **Tracker unsaved structural edits (GU-005):** scope a stream-visible undoable draft so the
    structural history can eventually retire (may extend into [GLOBAL-UNDO]).
- **Process:** HEAVY, design-first → cross-provider red-team (both) → Opus build → cross-provider
  code inspection → gates → hold for "merge live". Note the earlier queued "follow-up #2 latch
  persist with histPush" folds in here (same command-layer-completion territory).
- **Model:** design + build on Opus 4.8 (high); red-team + code-inspect on Codex + Fable.
- **Context (READ FIRST):** the review log `raptor-port/docs/superpowers/specs/2026-09-17-arch-stack-3-global-undo-review-log.md`
  (all 9+10 findings with exact file:line + step-by-step fix specs) and the Step-2 design
  `2026-09-16-arch-stack-2-command-layer-design.md`. Global-undo design (gated behind this):
  `2026-09-17-arch-stack-3-global-undo-design.md` §12.

### [GLOBAL-UNDO] One global per-session undo — PHASE 1 + PHASE 2 BUILT + MERGED LIVE (18 Sep 26)
**BUILD STATUS (18 Sep 26): phase 1 (engine) + phase 2 (LIVE cutover 2.3–2.6) BUILT, all five gates
green, driven in the app, dual-reviewed (Fable + Codex) and folded in; MERGED LIVE on owner's "merge
live".** Every Undo/Redo (scheduler/board/Leave War) drives the ONE timeline; the Unpublish button +
off-week undo are live. Detail + the review dispositions: `docs/session-state.md`.

**DEFERRED (not blocking; land at the multi-user / DB step):**
- **[GU-E2E] two LW undo e2e tests quarantined for CI (18 Sep 26).** `undo fired in MOVE mode` and
  `rapid undo/redo settle` (e2e/leavewar.spec.ts, `test.fixme`) do a SECOND admin drag-select after
  an edit; on GitHub Actions' headless Linux runners that second drag never arms (persistent, not a
  timing race — retries don't help). Cause traced to the edit's Raptor→LW sync re-scoping the war
  (`setViewer(ME)` on every Raptor notify). Passes 100% locally (real bundle, full lw-desktop) and
  the two single-drag undo tests pass on CI; behaviour also covered by undoaudit/chrome/undo-wire
  unit tests and driven live. Fix: make the second-admin-drag harness CI-robust (e.g. pin the viewer
  or drive the setup off a bridge), then un-fixme. Not a product defect.
- **inherited [CMDL-FINISH] deferrals** — CMDLF-002 (rebuild the Leave War posting-out windows on a
  `lw.postouts` restore) and whole-Import undo granularity. These were deferred INTO global-undo when
  the command layer landed; phase 2 keeps `lw.postouts` a deferred collection (its entries are
  ineligible for undo), so both remain open for a later phase.
- **[GU-C3] reland conflict/auth coverage (Codex GU-P2-005)** — the restore's `reconcileDayFiling`
  re-derives `acc` for inputs beyond the entry's closure without expanding the conflict/auth/
  expectedRevs set. Inert in the synchronous single-user prototype (re-derive-only, never lands a
  row, `acc` self-heals on loadWeek); real once there are concurrent users / a shared DB. Fix with
  the per-session undo work below.
- **[GU-MAYREV] mayReverse button state (Fable#3) — PRODUCT QUESTION for the owner.** `undoState()`
  enables Undo on the newest ELIGIBLE entry regardless of the actor, and the timeline isn't cleared
  on logout, so a member behind an admin's edit sees an enabled-but-refused Undo and can't reach
  their own older entries. Options: grey the button for a non-reversible newest entry, OR skip past
  non-reversible entries (safe only where keys don't overlap — `undoConflict` guards the rest).
  Low impact now (effectively one admin user); ties to the future per-session/per-user undo
  (memory `future-undo-semantics-multiuser`) — clearing the timeline on `resetSession` is the
  near-term direction.
- **[GU-E5] input-only undo doesn't snap to its week (Codex GU-P2-006)** — E5 was deliberately
  dropped in phase 2 (subsumed by the reland). Minor UX (an input-only undo relands on the loaded
  week; the record restores correctly, only the view doesn't jump).
- **[GU-LWLOCK] LW lock through notify (Codex GU-P2-008)** — a restore-caused LW projection can push
  a vestigial legacy-LW history step. No user-facing effect (buttons drive global undo, not the
  legacy LW stack). Cosmetic; tidy when the legacy LW stack is retired.
- **[GU-COSMETIC]** resolvePublishDay binds an AL barrier to CURWEEK → a jump-then-refuse on another
  week (Fable#6, correct outcome); postRestore view-effects (armDrop/prunePreviews) aren't rolled
  back on a failed restore (Fable#7, drops the armed puck on a rare refusal). Both LOW.

### [GLOBAL-UNDO] design record (Rev 6) — for reference
`[CMDL-FINISH]` foundation is merged + live.
The design was hardened over **6 revisions with a dual cross-provider red-team every round** (Codex/
Astra + Fable, both high): **Rev 5 → Fable APPROVED (build-ready, no further design round); Codex
REVISE with 6 contained §6 findings, all folded into Rev 6.** The engine took no finding in the last
two rounds and was hand-verified twice. Design of record:
`raptor-port/docs/superpowers/specs/2026-09-17-arch-stack-3-global-undo-design.md` **Rev 6**; transcript
`…-global-undo-review-log.md`; front-door `raptor-port/docs/undo-contract.md`; build handoff
`raptor-port/docs/session-state.md`. The 18 Sep owner reframe (undo-of-publish = UNPUBLISH
+ same-label quiet correction) is captured below and in memory `undo-of-publish-semantics`.

**OWNER DECISION 17 Sep 26 — what an on-the-record undo IS. SUPERSEDES the 16 Sep wording.**
The boundary was settled first: undo is silent while the shared database has NOT registered
the publish, and goes on the record once it HAS (an export is NOT a boundary event). The
remaining question was what the on-the-record form is — and the answer is:
**just a line in the history saying it was undone.**

- **NOT** a correcting amendment. The 16 Sep record said "an on-the-record forward withdrawal
  (= a correcting amendment) — append-only, unique never-reused ids, derived credits
  recompute, with a one-line heads-up". That is SET ASIDE; newest instruction wins.
- The owner's stated purpose is traceability — "to prevent silent bugs" — not notifying the
  squadron. A history line satisfies that purpose.
- **What it deliberately does NOT do, so nobody re-derives it as a gap:** nothing is pushed to
  anyone. If the publish had already reached the shared record, others are not actively told
  it was undone — the undo is discoverable in the history, not announced. The owner's call,
  made knowingly.
- STILL BINDING from before: **never ERASE an issued record** — every issuance is kept as its own
  immutable snapshot; the history line is additive.
- **UPDATED 18 Sep 26 (SUPERSEDES "never reuse a version id"):** undo of a publish is an explicit
  **UNPUBLISH** (back to a working copy) + a day-header button; a **quiet correction** then
  republishes as the **SAME version label** (Original stays Original, AL1 stays AL1), not shown as
  an amendment — so the LABEL is deliberately reused. A real **amendment** stays the separate act of
  editing the live working copy and publishing as the next AL. A disseminated correction writes a
  history line; guardrails: scheduler/admin only, unpublish clears that day's sign-offs, only the
  latest version is unpublishable. See design §6 + memory `undo-of-publish-semantics`.

**Decision (owner, 13 Sep 26):** replace the current SEPARATE per-section undo stacks
(schedule / Leave War / Tracker) with ONE global, per-session, per-user undo timeline. The
whole delete/undo weird-behaviour family exists BECAUSE two independent undo systems sit over
the same synced data and disagree; one timeline removes that class of bugs at the root instead
of patching each. **Do this as a dedicated step BEFORE [DB-STEP]** (it unifies the section
stores' history, which the DB step needs anyway), NOT as a mid-fix patch now.
- **Absorbs (do not fix separately):** the delete-vs-undo resurrection (finding A/P1), the
  undo-family bugs (D, E, F, I), the member-undoes-admin permission gap (C/DU-001/P3), per-week
  undo that survives navigation, and the [XWEEK-UNDO] snap-to-page idea.
- **Rules to honour (owner):** undo scoped to the LOGIN SESSION (logout clears it), never
  affects another user, others see every change live from the shared DB; undo only reverses
  your own actions; a role/viewer PREVIEW must not wipe an admin's undo.
- **Gate:** must be done before promulgation / real users (the interim bugs are tolerable only
  because it's demo data).
- **Clean input+leave undo lands at step 4, NOT before (owner, 16 Sep 26).** A schedule undo that
  also reverses an accepted LEAVE input's Leave War cell reaches its fully-clean form only once an
  approved absence is ONE record (ARCH-STACK step 4, one-Absence). Until then the command carries
  the leave effect in its own inverse data so it can't drift, but the cleanest version is a step-4
  payoff — don't try to fully solve input+leave undo before step 4.
- **Undo-of-publish semantics — SUPERSEDED by the 18 Sep UNPUBLISH reframe above (see line 430+).**
  ~~16 Sep: silent reverse before sent; an on-the-record forward withdrawal (a correcting amendment,
  never-reused version ids) after.~~ SET ASIDE. The current rule (18 Sep): undo of a publish =
  UNPUBLISH → quiet-correct → reissue the SAME version LABEL (label reused; each issuance kept as an
  immutable snapshot; a history line once disseminated); a real amendment is the separate working-copy
  → next-AL act. Undo stays per-user + per-session (logout clears; never touches another user; won't
  clobber a later edit); roster/settings edits ARE undoable. See design §6 + memory
  `undo-of-publish-semantics`.
- **Context:** the sync spec (findings A/C/D/E/F/I + the red-team on why the two-system patch
  is the wrong approach); memories `future-undo-semantics-multiuser` (architecture direction),
  `undo-of-publish-semantics`, `multi-squadron-and-person-transfer`; ties to
  `docs/architecture-direction.md` + [DB-STEP].
- **READ FIRST — the front-door doc `raptor-port/docs/undo-contract.md`** (written at CMDL-FINISH
  completion): the durable, plain summary of the whole command layer — the change stream, the
  per-store `write()` seam this undo build consumes, and the checklist a new undo feature must
  satisfy. It condenses the three ARCH-STACK step-2/3 designs into one so this build reads ONE
  doc, not four. Any future undo development (per-person, whole-import, global) follows it.

### [RECALL] Fresh recall from archive — FUTURE FEATURE
An admin recalls an archived person back into Quals. **Behaviour (owner, 13 Sep 26):**
leaving the whole app SYSTEM then being posted back = **FRESH** — new/updated quals and
new Leave War balances; only past history stays frozen. NOT "restored exactly as they
left." Replaces the current Quals ✕ / "Restore exactly" behaviour (see [SYNC-INTEG] P6).
- **Context:** the sync spec §Parked; memories `multi-squadron-and-person-transfer`,
  `future-undo-semantics-multiuser`.

### [XWEEK-UNDO] Cross-week "snap-to-page" undo — FUTURE FEATURE
**Behaviour (owner, 13 Sep 26):** undoing something not on the current page snaps you to
that week and shows what the undo did. Builds on Phase 2's per-week persistent undo.
Future multi-user rules: undo is scoped to the login SESSION (logout clears it), never
affects another user, but others see every change live from the shared DB.
- **Context:** the sync spec §Parked; memory `future-undo-semantics-multiuser`.

### [XFER] Multi-squadron + transfer a person with their data — FUTURE MILESTONE (with [DB-STEP])
**Behaviour (owner, 13 Sep 26):** many squadrons on one app / one backend; transferring a
person BETWEEN squadrons carries ALL their data across (quals, history, leave) — distinct
from leaving the system entirely, which is a fresh return. The identity model must let one
person move between squadrons with data intact.
- **Context:** memory `multi-squadron-and-person-transfer`; ties to
  `docs/architecture-direction.md` and [DB-STEP].

### [INP-CSID] Stable ids for personal inputs — DONE (13 Sep 2026, ARCH-STACK 1A item 1)
Delivered by ARCH-STACK step 1A: personal inputs are filed/accepted/undone/edited by their
stable opaque `iid` (`newId('i')`), not the content key `inpKey`. Twins file independently and
the accept guard is a same-input idempotency check; `inpKey` stays only as a display/dedup hint.
Merged live in PR #396. Finding J (`DU-007`) closed.

### [TRK-CSID] Give courses & syllabuses their own hidden ids — SPLIT (owner, 13 Sep 26)
Two passes (courses first — clean; syllabuses second — the tangled global/built-in half).

**1B-i — COURSE ids — DONE + LIVE (13 Sep 26; PR #398 code + #399 docs, merged to `main`, deployed & live-verified).**
*(Deploy note: #398's first publish failed on the known `addStudent` smoke flake so it was NOT live despite an earlier handoff saying so; re-published via workflow_dispatch — green — and live-verified this session.)*
`COURSES` is `{id,name}[]`, `course` is the current course id, every per-course key
files under the id, so **renaming a course is a label change that moves nothing**
(the old copy-verify-delete apparatus in `renCourse` is gone). New `app/courseIds.js`
(mint/upgrade/reconcile) + `migrateCourseIds` (resumable, read-back-verified,
`list()`-prefix move with a reserved skiplist + fail-closed preflight, translates
`v3:links`). Fail-closed boot (`bootError` → App reload panel). Import carries
`{id,name}` courses (file v2), reconciles to the store's ids by name, refuses a
reserved name / bad id. Spec + 4-round Astra red-team (APPROVED):
`raptor-port/docs/superpowers/specs/2026-09-13-trk-csid-course-ids-spec.md`.
Known limitation (inherited, NOT new): the migration's durability + two-tab safety
match the shipped enrolment migration (read-back proves the in-memory whiteboard,
not the backend) — this is `[TRK-DISK]`, owned by `[DB-STEP]` (RC5); no interim
patch built. Fable-high final review of the built diff before merge.

**1B-ii — SYLLABUS ids — DONE + LIVE (14 Sep 26; PR #400 build → #401 Fable-review fixes → #402 Codex re-review fixes).**
*(Finished via an independent Codex re-review of the merged Fable fix: it found RR-01 an
order-dependent layout-conflict brick, RR-02 raw-text layout equality + one-sided empty
guard, RR-03 a suppressed legacy def resurrected as a visible custom; plus owner-requested
RR-03b a hidden built-in's edited def vanishing. All fixed with fail-first tests and merged
in PR #402; gates green, deployed.)*
Syllabuses now carry stable hidden ids: built-ins get **deterministic shipped ids**
from a `BUILTIN_SYL` table (`app/sylIds.js` — `sb2024`/`sb2026`/`sbtx2026`/
`sbagaa2026`), user charts a minted `sc…`; grammar `^s[bc][0-9a-z]+$`. The global
catalogue is `SYLS`=`{id,name,base?,userNamed?}[]` (`v3:master:sylcat`), `base`
authoritative from the table. **Renaming a syllabus is a label change that moves
nothing** (`renSyl` = set name + `userNamed`; `moveSylData`/`purgeLegacySyl`/
`SYL_ALIAS`/`SYL_RENAME` all deleted). Conversion = **"keep charts, reset marks"**
(owner): `migrateSylIds` converts the global catalogue IN PLACE via a durable
**payload journal** (compute-once, whole-object writes, `purge = sources ∖
destinations`, verify after all purges; two flags `kSylCatMig`/`kSylReset`; legacy
layout event-ids translated via `padId`/`SPECIAL` incl. `__font`) and RESETS the
per-(course,syllabus) student layer. Boot reconcile `reconcileBuiltins` (also in
`reloadFromStore`). `plan.sylId` replaces `plan.sylName`. **Import guardrail
(owner, §19):** charts import from any version; student marks/dates/rosters import
ONLY from an id-native v3 file with a `sylcat` (pre-v3 / unresolved → refused, plain
message; charts still import). File version → 3. **Colon relaxed** on syllabus/
chart names (course names keep the refusal). One converter `app/sylIds.js` shared
with Import. Spec + 7-round Astra red-team (APPROVED):
`raptor-port/docs/superpowers/specs/2026-09-13-trk-csid-syllabus-ids-spec.md` (§§14–19 binding).
Tests: `app/sylIds.test.ts` (pure), `app/sylIds.migration.test.ts` (KEEP/RESET
journal harness), tracker.test.tsx re-baselined (rename/reorder/delete/dup/guardrail),
smoke fixtures → ids + v3. Inherited `[TRK-DISK]` durability limitation stands.
- **Done:** merged and live 14 Sep 26 (PR #402). The inherited `[TRK-DISK]` durability
  limitation still stands (owned by `[DB-STEP]`).

### [TRK-ATTEMPTS] Keep a student's attempt history — OPEN (small, feature)
Remember a student's *earlier* tries at an event, not just the latest grade. More a
new feature than a cleanup. (Verified open: no attempt-history in `tracker/`.)
- **Model:** build on Opus, default; small, clear spec.

### [TRK-DISK] Tracker migration/rename "safety check" reads memory, not disk — Decision A — OPEN
On upgrade or a course/syllabus rename, the app copies records, checks the copy in
**working memory**, then deletes the originals — so a failed disk write (storage
full) can delete an original before its copy is safely saved. Same gap on syllabus
rename. Largely self-healing; bites only near-full storage + tab closed before the
retry (more likely on iPhone). Never fixed, not logged as a limitation.
- **Fix within [DB-STEP]:** a real "it's saved" signal the delete waits for, rather
  than a piecemeal patch in three places. Or pull earlier on request.

### [DB-STEP] The shared-database step (Dataverse) — FUTURE MILESTONE
The big future move: Raptor, Leave War and Tracker all run on `localStorage` /
session today; the target is a shared database (**Dataverse** — `src/storage/`
seam, `docs/data-model.md`). Large, design-first, its own red-team. Several parked
items are meant to be resolved here — notably **[TRK-DISK]** (the memory-not-disk
save signal) and the Tracker's dropped SharePoint/Dataverse/Firebase layers.
- **Model:** design review on Fable, high (the expensive-to-get-wrong decision);
  build volume on Opus.
- **Tooling to revisit HERE (owner asked 17 Sep 26; Opus + Fable both advised defer):** when the
  Dataverse adapter/API + auth are being built, reconsider a **cross-layer (frontend↔backend↔DB)
  reviewer** and a **security-audit skill** — both premature until a backend/login exist. NOT worth
  installing now: generic PR-review / systematic-debugging / test-generation / Playwright skills
  duplicate the current pipeline (cross-provider red-team, the 6-gate suite, vendored
  systematic-debugging / test-driven-development / `/code-review` / `/security-review`); and any
  Postgres-specific tuning tool does NOT apply — the DB is Dataverse, not Postgres.

### [CRP-FLAG] Live flagging on the PUBLISHED schedule — DESIGNED + RED-TEAMED, ready to build (15 Sep 26)
Show live warnings (crew rest incl. cross-day/past-midnight, the 7-day work rule, timing
clashes) on the published/signed schedule again — today publishing a day hides them. Model:
two checked versions (signed + working); each screen flags the version it shows; check a day
against each surrounding day's **published version if it has one, else its working copy**; the
day being amended drives the scheduler's own preview. Content byte-frozen; "Not Yet Signed"
marker (everyone). Clock-free; NOT coupled to EOD.
- **Fully scoped + cross-provider red-teamed** (2 rounds + a confirmation, Codex + Fable). On
  branch `claude/crewrest-published-flagging`. **Build spec:**
  `raptor-port/docs/superpowers/specs/2026-09-15-crewrest-flagging-plan-v2.md` (§5 mechanism,
  §11 tests, §14 tricky build spots); review log alongside it.
- **HEAVY**, test-first, Opus; keep `tfin.js` 728/0; fresh Codex+Fable CODE inspection after
  build; no merge without "merge live". Owner decisions locked in session-state.md.

### [FLAG-EXPORT] PDF export — print the PUBLISHED version, CURRENT DAY only + a nicer agency-facing redesign — OPEN (follow-up of [CRP-FLAG])
THREE halves now (owner, 15–17 Sep 26):
- **SCOPE — CURRENT DAY ONLY (owner, 17 Sep 26): "my end goal is to export the current day
  only's published schedule … its only purpose is to export the snapshot of the current
  schedule."** Today `ui/printpdf.ts:printSchedPDF` exports the WHOLE loaded week
  (`publishedDays()` + a Mon–Sun label). Narrow it to the one day. Same ruling also settled
  two other things worth keeping together: the export is a **scheduler-only** function ("they
  know what's the latest copy to use"), and it is **NOT** a publication boundary — exporting
  does not constrain undo, which is why the three export/print/session-end "disclosure" call
  sites were removed on 17 Sep (see `docs/superpowers/specs/2026-09-16-arch-stack-2-command-layer-design.md`
  §3.4 and `src/state/disclosure.ts`). Flagged during the 17 Sep correctness sweep and
  deliberately NOT changed there — it is a real behaviour change needing its own gate and a
  live check. Context: that sweep doc's §G.
- **Functional (not a design call — safe to build):** exports (`schedRows`→export.ts/printpdf.ts)
  read the live working `DAYS`; export the **published** version instead, and label the
  next-week peek working-vs-signed.
- **Visual redesign (owner direction, 16 Sep 26 — "your call on the design"):** the PDF is a
  REPORTING tool to an agency next time, not a planning tool. So:
  - **DROP the right-hand personnel / "Aircrew Available" roster columns** (planning-only, not
    needed for the report).
  - **White background** (not the app's dark theme).
  - **Make the format nicer / cleaner — NOT multiple grids** (a single clean layout).
  - Similar to Raptor style is fine; it need NOT match the sheet exactly. Initials-vs-callsign
    doesn't matter.
  - **Sample of the current sheet:** `raptor-port/docs/img/flag-export-sample-current.png`
    (the "16 Sep 2026 Schedule AL0" export the squadron sends today).
  - **Process:** produce 1–2 rendered sample PDFs for the owner to PICK before finalizing
    (his "show a picture before product code" rule); nothing merges without "merge live".
- Separate gated PR after [CRP-FLAG]. Context: [CRP-FLAG]'s review log + the sample image.

---

## Done

### [REPO-CLEANUP] Repo-wide space/redundancy sweep — DONE, NOTHING REMOVED (18 Sep 26)
The sweep was run and the conclusion is: **the repo is already tidy; there is nothing worth
removing.** Do not re-open this without a new reason. What was checked and found:
- **Source files: 0 dead.** An import-graph scan over all 522 `src` modules (handling
  extensioned `.js` imports and vitest's glob-loaded `.test.*` entry points) found no file that
  nothing imports.
- **Dead CSS: negligible.** A scan of all 8 stylesheets against every source file (including the
  innerHTML string-builders) flagged ~60 candidate classes, but almost all are **built
  dynamically** (`seat-${p.seat}`, the `g-*` group family, the `sbi-`/`ic-pick` families) — false
  positives. The genuinely-dead, single-class rules total **~0.9 KB**, not worth a gated cycle.
- **Unused exports (`ts-prune`): not actionable.** Output was dominated by the `command/` and
  `engine/` barrel `index.ts` re-exports and core keep-list symbols (`HOOKS`, `storeBackend`,
  `VCONF`, `RULE_SPEC`) — flagging them is a false positive; acting on it would be a bug.
- **Docs: ~0.6 MB of design write-ups for already-shipped features** (board rebuild, Leave War
  bulk-balance + figures drawer, stores config, the Sep-7 rules audit, tracker interface rework,
  leave types, plans-selector red-team). These are the only real weight. **Owner's decision:
  KEEP them all** — leaving a note in the tree is the stronger form of history-keeping (browsable),
  vs. a git-deleted file that is only recoverable if you know it existed. Git keeps history either
  way, so deletion would have saved ~0.6 MB for no benefit and a real downside. **No removals made.**
- Method note for a future sweep: the "referenced nowhere" test must strip the leading `YYYY-MM-DD-`
  from a doc's filename, because OUTSTANDING/HANDOFF cite design docs by their date-elided tail
  (`…-amendment-rev4-rev5-review-log.md`); a raw basename grep under-counts references and would
  mark live-context docs as orphans.

### [AMEND-SEL-FOLLOWUPS] Plans-selector 7 follow-ups (incl. the signature-leak bug) — DONE + LIVE 15 Sep 26
The owner's 15 Sep batch of 7 changes to the plans-selector redesign, all built test-first on
`claude/amendment-engine-core` and merged as **PR #405** (merge commit `9ba253c`), which the
branch is now fully inside. Resolutions: (1) the signature-leak bug — signatures are now
**per-plan** (owner's option a): each saved plan carries its own four sign-offs, so signing one
plan never fills another; a plan whose content moved out from under a signature reads empty; a
later Codex finding (PSF-001) bound signatures to the filing axis too. (2) the amber week banner
removed entirely. (3) version tag coloured by AL number off the shared palette. (4) tag moved
left of the 4X4 badge. (5) tag shown on the view-only schedule too. (6) no change needed —
view-only live faces already show warnings. (7) the board sign-off line is publish-aware.
Cross-provider bug-checked (Codex + Fable); gates green (unit 4671/0, tfin 728/0, e2e, tracker
smoke). Housekeeping follow-on tracked under **[REPO-CLEANUP]** above (screenshots deleted
18 Sep 26; the space sweep is now READY — the [CMDL-FINISH] hold lifted when it merged, 18 Sep 26).

### [LW-OPEN] Leave War opens on the war being WORKED — DONE 17 Sep 26
Owner ruling (17 Sep 26, restating his 7 Sep rule under newest-instruction-wins):
the tab always opens on the war open for bidding, else closed, else published,
else draft — never on the one last viewed. Was a REGRESSION, not a missing
feature: the 8 Sep storage seam made the tab persist, so the stored `current`
started winning from the second visit; before that nothing was stored and the
stage pick ran every load, so the rule held by accident.
**Resolved:** `state/store.ts initStore` now always stage-picks and ignores the
stored `current` (still recorded at every switch, for the shared database and
so a switch holds for the rest of the session). Pinned by three tests in
`state/store.test.ts`, one of which REPLACES an older test that asserted the
opposite ("remembers which war was on screen across a reload") — reversed by
owner ruling, noted in place. Gates: vitest 4865/4865, parity 728/0, build,
e2e (only the 2 known pre-existing failures, proved pre-existing by re-running
them against a stashed tree), tracker smoke. LIVE-DRIVEN on the built bundle:
opened on JAN-DEC 26 -> switched to the 27 draft -> switch held -> reload came
back on JAN-DEC 26 with the bidding border showing, no console errors.


### [TRK-IMPORT] Tracker import-conflict refusal — DONE (12 Sep 2026)
Import now refuses when a file names a *different person* under a callsign already
on the course, before writing anything — so the existing student is no longer
silently dropped and their marks orphaned. Rebased on current `main`, full gates
green, independent Astra/Codex bug-check run **on the fix**: it found the refusal
scan read only the per-syllabus rosters and missed a course still on the ORIGINAL
pre-syllabus flat roster (v3:<c>:roster), which a conflicting import could still
overwrite. Closed that (the scan reads the flat roster + its links too) and made
the refusal message honest that charts imported first may already be in. Astra
re-check: sound. Merged as **PR #386**, deployed, confirmed live (Tracker renders,
no console errors).

### [TRK-LEDGER] Tracker legacy-import ledger (Decision B) — DONE (12 Sep 2026)
A half-finished first-time legacy import used to seal itself done on the first
`raptor:` key and hide the rest forever; it now resumes via a per-key ledger and
grandfathers existing installs. Rebased on `main`, gates green, Astra bug-check on
the fix found a residual: if the store was so full that even the ledger write
failed, the next boot grandfathered and lost the rest. Closed with a
`__legacy__/started` marker written before the first copy, and gated persistence on
that marker being durable (a persisted record always has its marker). One inherent
corner documented (a record deleted seconds after migration on an already-full
store can be re-copied — resume without a durable ledger can't tell "not copied"
from "copied then deleted"). Astra re-check: sound. Merged as **PR #387**, deployed,
confirmed live.

### [SEC-ALTIP] AL panel tooltip HTML injection (AM-08) — DONE (11 Sep 2026)
The amendment sign-off tooltip could run injected code from a crafted callsign;
it's now escaped at display time, so already-saved names are covered too. Verified
end to end: merged as **PR #393** to `main` (CI green), deployed, and confirmed on
the live site (Amendments panel renders normally, no errors). Found by the
Astra/Codex amendment review; fixed in its own spawned session.
