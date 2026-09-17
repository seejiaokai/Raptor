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
`[DB-STEP]` are STEPS of it. The immediate next build is **stable ids (step 1)** — cheap,
independent. STOP: interim two-system undo patches + further quarantine rounds.

Below is the older item ordering (kept for the non-stack items); land what's **cheap, done, or
in-flight and risk-reducing** first.

1. **[AMEND]** — the main project. Decisions resolved; brief re-frozen & re-reviewed;
   **CORE built + round-3 in progress** on `claude/amendment-engine-core`. **[BUG2]**
   folds in here.
   - **[AMEND-SEL-FOLLOWUPS] (owner, 15 Sep 26) — DO NEXT, blocks merge of PR #405.**
     After testing the plans-selector redesign the owner asked for 7 changes, incl. a
     real BUG (signatures leak across plans — day-level, not per-plan). Same branch
     `claude/amendment-engine-core` (PR #405), Opus high, test-first, Codex+Fable
     bug-check. **Do NOT merge #405 until these land.**
     **Context (READ FIRST):** `raptor-port/docs/plans-selector-followups.md`.
   - **[REPO-CLEANUP] (owner, 15 Sep 26) — SECOND task, AFTER the follow-ups merge.**
     Delete the handoff screenshots (`raptor-port/docs/img/plans-selector-followups/`), then
     do a repo-wide space/redundancy sweep (orphaned files, dead CSS, unused exports, stale
     docs, build cruft). **CAUTION:** the repo deliberately keeps some dead-looking code
     (CLAUDE.md §Stable decisions — `WEEKS`, `restoreDayVersion`, `openWarns`, etc.); grep for
     refs and confirm before removing anything. Own gated PR, in batches. See the "SECOND
     TASK" section of `raptor-port/docs/plans-selector-followups.md`.
1b. **[TRK-SMOKE] (owner asked, 17 Sep 26) — DO BEFORE THE NEXT BUILD.** The `addStudent`
   tracker smoke check keeps failing on clean code and has already caused a deploy to be
   skipped while a handoff claimed it was live. Placed here, ahead of the feature backlog,
   for one reason only: it is a GATE, and the follow-up #1 build runs the gate set per phase.
   Cheap relative to what it protects; fix it or record an explicit waiver.
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
8. **[GLOBAL-UNDO]** — the one-global-undo re-architecture; a step **before** [DB-STEP]
   (must land before going live). Absorbs [XWEEK-UNDO] and the whole delete/undo bug family.
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

### [TRK-SMOKE] The `addStudent` tracker smoke check keeps failing — OPEN (owner asked, 17 Sep 26)
**Why this is its own item now.** It has been treated as "the known flake" and mentioned in
passing four times in this file, but it has never had an owner or a diagnosis, and it has
already cost something real: a publish run failed on it, so a change was **NOT live despite a
handoff saying it was** (see the deploy note under [TRK-CSID]). On 17 Sep it failed three
times running on the desktop, on clean code.

**Why fix rather than excuse it.** A check that always fails has stopped being a check — red
now reads as "that's just the tracker again", which is exactly how a genuine failure gets
waved through. And there is no third option: the ARCH-STACK spec §1 makes smoke green a
per-phase non-negotiable, so it is either fixed or **permanently** excused, and permanently
excusing a gate is worse than not having it.

**Open question the diagnosis must answer FIRST: is it a flake at all?** It may be a real
failure that has been sitting there since something changed. Do not assume timing.
Start at the `addStudent` smoke fixture; it has timed out rather than asserted-false in every
report so far, which points at a wait/ordering problem rather than wrong behaviour — but that
is a hypothesis, not a finding.

**Blocks:** the follow-up #1 build's per-phase gate set. Do this BEFORE that build, or get an
explicit owner waiver recorded here.
**Effort:** unknown until diagnosed; assume small-to-medium. Opus (investigative — if it turns
out to be a real break, switching models mid-way loses the thread).

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

### [GLOBAL-UNDO] One global per-session undo — a step BEFORE the database
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
- STILL BINDING from before: **never erase or reuse an issued version id.** The history line
  is additive; the issued record stays immutable.

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
- **Undo-of-publish semantics SETTLED (owner, 16 Sep 26):** silent reverse BEFORE a publish is
  sent/witnessed; an on-the-record forward withdrawal (a correcting amendment — append-only, unique
  never-reused version ids, derived credits recompute) AFTER. Undo is per-user + per-session
  (logout clears; never touches another user's actions; won't clobber a later edit). Roster/settings
  edits ARE undoable. See step-2 design §3.4 + memory `undo-of-publish-semantics`.
- **Context:** the sync spec (findings A/C/D/E/F/I + the red-team on why the two-system patch
  is the wrong approach); memories `future-undo-semantics-multiuser` (architecture direction),
  `undo-of-publish-semantics`, `multi-squadron-and-person-transfer`; ties to
  `docs/architecture-direction.md` + [DB-STEP].

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
