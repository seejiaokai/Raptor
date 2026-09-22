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

**NEXT AFTER THE OIL BRANCH MERGES (owner, 22 Sep 26 — D24, D27, D28):**
`[OIL-SEATS-CAN-EARN]` — one change on his principle that every seat can earn, the default decides,
and the admin can override. It sits immediately after `[OIL-AUTO-REMOVE]` goes live and AHEAD of
`[OIL-NEXT-TWO]`, in a FRESH chat, at FULL tier. Kept OFF `claude/oil-auto-remove-design`, which is
at its last gate.

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
   causes. See `OUTSTANDING-ARCHIVE.md` for the
   full diagnosis; in short — (a) the add-student box cleared its field a beat after it
   opened, so a machine-speed fill was wiped and the add silently no-op'd; (b) a failing run
   abandoned its preview server, and on Windows even a passing run did, so the next run
   couldn't bind the port and failed on clean code. Both fixed, cross-provider reviewed
   (Codex + Fable), gates green. The follow-up #1 build can run its per-phase gate set.
1b. **[DOC-TRIM] — NEW, owner 21 Sep 26 (D14), AFTER [OIL-AUTO-REMOVE] merges.**
   A session reads ~4,000 lines before it can work. The ratchet (`npm run docsize`) already
   stops further growth; this is the trim itself. Do it after OIL merges, not before —
   a third of tonight's new lines are that task's scaffolding and become archive the day it
   closes. See the item below.
**TOP OF THE QUEUE (22 Sep 26, re-ordered after D38).** **[OIL-AUTO-REMOVE] IS MERGED AND CLOSED.**
1) **[OIL-SEATS-CAN-EARN]** — **IN FLIGHT: steps 1–4 of 11 BUILT, committed and pushed on
`claude/oil-seats-can-earn`; steps 5–11, the WALK and the two code reads still to go.** Resume from
`raptor-port/docs/superpowers/specs/2026-09-22-oil-seats-build-handoff.md` — it names what is built,
what is left verbatim from the plan's §5, the decisions taken this session and the traps already hit.
Plan: `raptor-port/docs/superpowers/specs/2026-09-22-oil-seats-can-earn-plan.md`. 2) **[ALL-AVAIL-WINDOW]**
(D38, NEW) — straight after, because it opens FROM the counters that job builds. 3) **[DOCS-GUARD]**,
scope and order settled by D30. 4) **[HUMAN-RETEST]**. 5) **[DOC-TRIM]** — unblocked now that a third
of the OIL scaffolding became archive. 6) The stack resumes at **[DB-STEP]**.

**STALE ABOVE, CORRECTED 22 Sep 26:** the "STACK PROGRESS (updated 18 Sep 26)" block says the next
stack item is step 4 (one Absence record). **Step 4 SHIPPED on 20 Sep 26** — `raptor-port/CLAUDE.md`
records it (an absence is ONE record, the Raptor Input; `runInbound`/`runOutbound`/`retractLwRow`/
`ingestFromRaptor` deleted). The stack's real next item is **[DB-STEP]**.
**Open for the owner:** he has not picked whether to do the one cheap `CLAUDE.md` trim (~30 min,
a move not a cut, ~700 lines off EVERY later session) as a warm-up before the scenarios, or to
leave all of [DOC-TRIM] until after the merge. Either is fine; the ratchet already stops growth.

1a. **[HUMAN-RETEST] — NEW, owner 21 Sep 26, HIGH once [OIL-AUTO-REMOVE] is closed.**
   Re-run the hands-on pass over EVERY feature whose "bug test" was really a code review plus
   unit tests. See the item below for the full reasoning — the short version is that the OIL
   build passed two model reviews and 5328 tests, and the owner then found three defects in
   minutes by opening the app, all of them surfaces that were never wired up. Any earlier
   build checked the same way is carrying the same class of defect, unfound.
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
   cross-provider punch-list). DONE + LIVE — see the item below. Its two deferred items fold
   into `[GLOBAL-UNDO]`.
8. **[GLOBAL-UNDO] — PHASE 1 + PHASE 2 BUILT + MERGED LIVE (18 Sep 26).** The one-global-undo
   re-architecture; absorbs [XWEEK-UNDO] and the whole delete/undo bug family. Live cutover done
   (scheduler/board/Leave War undo + Unpublish + off-week). Deferred review items + the two inherited
   [CMDL-FINISH] deferrals under the item below; the multi-user/per-session refinements land at [DB-STEP].
9. **[DB-STEP]** / **[XFER]** — the future database milestone and multi-squadron
   transfer; **[TRK-DISK]** (Decision A) is fixed inside [DB-STEP].

**NEXT, added 21 Sep 26 — the OIL pair, ahead of the numbered list above.**
**NEXT: a CROSS-PROVIDER BUG CHECK of the OIL build**, then the owner's "merge live". The code was
written on Opus 5, so the check goes to **Fable 5.1 (high)** and **Astra (Codex, high)**, both, and
each finding must come back with exact step-by-step fix instructions. Where to point them, what the
build decided on its own, what the rules walk already found, and the ONE design question still open
(should the green bar show on every puck a man wears, or only on the events that counted towards his
day?) are all in `raptor-port/docs/superpowers/specs/2026-09-21-oil-build-handoff.md`.

*(Done 21 Sep 2026: **[ALL-AVAIL-REDEF]** and **[OIL-AUTO-REMOVE]** — built together on branch
`claude/oil-auto-remove-design`, holding for the owner's "merge live". The line that stood here
said both "need a Codex red team before anything is written"; that was STALE the day it was
written — Codex red-teamed the design TWICE and reviewing was closed by the owner's own cap, as
§9 of the decisions doc records. Corrected in the build's PR. What the build had to obey, and the
two rule clashes it found, are in
`raptor-port/docs/superpowers/specs/2026-09-21-oil-behaviour-register.md`.)*

*(Done 12 Sep 2026: **[TRK-IMPORT]** and **[TRK-LEDGER]** — both merged live, now in `OUTSTANDING-ARCHIVE.md`. [TRK-LEDGER]'s one
inherent corner — a record deleted just after migration on a full store can be re-copied — was moved to
`raptor-port/docs/tracker/known-gaps.md` on 22 Sep 26, because the archive is searched and never read.)*

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
**Not a flake.** Two independent causes, both fixed and both pinned: the shared add-student box
cleared its text field in a post-paint step that ran AFTER the box had been read (a shipped
bug, not a test bug), and a second race on back-to-back adds. Proven by instrumenting the
running app at the failing add and reading what the box actually held at submit time.
**The full diagnosis is in the commit message**, which is where a how-it-was-found story
belongs (`doc-budget.md` §3). Nothing outstanding; kept only until it merges.

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
- **MEDICAL GUARDRAIL BATCH — BUILT + ALL GATES GREEN, held for "merge live" (19 Sep 26,
  branch `claude/sync-integ-medical-guardrails`).** THREE items built test-first on Opus 4.8:
  (1) **P2 medical member-filed only** — the war blocks medical creation for ALL roles incl admin
  (store write path) and the medical pickers are gone; it still DISPLAYS member-filed medical that
  syncs in; war→Raptor no longer crosses medical; the demo's war-created medical is reset via
  `leavewar` added to the versioned storage reset (SCHEMA_VERSION 2→3) and re-shown as a member-filed
  example. (2) **Relaxed document prompt** — filing a medical with no certificate PROMPTS once
  ([Upload]/[No document]) instead of hard-refusing; "No document" files it with none; the
  replace-don't-strip guard stays (`docGate` + `DocConfirm`, wired into all three editors). (3) **P4
  "Clear old data" is CLUTTER-ONLY** — clears only past pucks + day notes; never an input, a balance,
  a stashed week, or the loaded week; renamed "Clear old clutter"; validates real calendar dates.
  Process: pre-build plan red-teamed by Codex (APPROVED after 1 revise round); post-build code
  inspected by Codex + Fable (Fable: no permission/data-loss holes; all findings folded in). Gates:
  unit 4985/0, build, parity 728/0, e2e, smoke 425/0. **Plan + dispositions:**
  `raptor-port/docs/superpowers/specs/2026-09-19-sync-integ-guardrails-build-plan.md`.
  **SCOPE NOTE (owner's call):** the backlog listed "clear genuinely-empty past weeks" under P4; the
  red-team proved dropping a stashed week can lose a day's amendment history (SYNC-003) or resurrect a
  deliberately-emptied authored week (SYNC-005), so per the guardrail-over-cascade rule the sweep
  drops NO stashed weeks. A narrow safe empty-week drop is a possible later follow-up.
- **STILL OPEN in [SYNC-INTEG] (NOT in this batch):** **P6** a Quals ✕ confirm (a confirmation that
  archiving removes the person's leave; small; superseded by the fresh-recall feature [RECALL]);
  **P7** fix CLAUDE.md's stale "Leave War session-only" line (the 8 Sep storage work persists the LW
  world; already corrected in raptor-port/CLAUDE.md but re-verify the root CLAUDE.md / any stale copy).
- **Urgency:** low (pre-live). Model: Opus build, gates, no merge without "merge live".
- **Context:** the build plan above + the 13 Sep sync spec (findings, dispositions).

### [CMDL-FINISH] Finish the command layer for Leave War + Tracker — DONE + LIVE (18 Sep 26)

ARCH-STACK step 2 completion: the causal both-side envelope, the per-record write seam,
one-envelope-per-Tracker-gesture, guarded lw/trk stores, `TRK_RESTORING`, `sched.als` re-key, and the
cross-provider inspection punch-list. Merged as PR #412 (build) + PR #415 (finish), plus the undo
front-door doc #413. **Two items were deferred INTO `[GLOBAL-UNDO]` and remain open there:** the
Leave War posting-window rebuild on a postouts restore (CMDLF-002), and grouping a whole Import as
one undo step.

**Still open, tracked in `[SYNC-INTEG]` not here:** P6 a Quals ✕ confirm (superseded by `[RECALL]`);
P7 a stale "Leave War session-only" line in the ROOT CLAUDE.md (raptor-port's copy is corrected).

Full story: `git log` for those PRs, and `docs/undo-contract.md` for the contract it established.

### [GLOBAL-UNDO] One global per-session undo — BUILT + MERGED LIVE (18 Sep 26)

Phase 1 (engine) + phase 2 (live cutover) built, five gates green, driven in the app, dual-reviewed
(Fable + Codex), merged on his "merge live". Every Undo/Redo — scheduler, board, Leave War — drives
the ONE timeline; the Unpublish button and off-week undo are live. Shipped behaviour:
`raptor-port/docs/undo-contract.md`. Review dispositions and the full reasoning for each deferral
below: `git log -S"GU-P2" -- OUTSTANDING.md` (`docs/session-state.md` was deleted in `d92303b`).

**SEVEN DEFERRALS, all still open, none blocking — they land at the multi-user / DB step:**

- **[GU-E2E]** two Leave War undo e2e tests `test.fixme`d for CI — a second admin drag-select never
  arms on the CI runners (traced to the sync re-scoping the war). Passes locally; not a product
  defect. Fix the harness, then un-fixme.
- **[CMDLF-002]** rebuild the Leave War posting-out windows on a `lw.postouts` restore, and
  whole-Import undo granularity — both inherited from `[CMDL-FINISH]`; `lw.postouts` is still a
  deferred collection.
- **[GU-C3]** reland conflict/auth coverage — the restore re-derives `acc` beyond the entry's
  closure without widening the conflict set. Inert single-user; real with concurrent users.
- **[GU-MAYREV] PRODUCT QUESTION for the owner** — Undo is enabled on the newest eligible entry
  whatever the actor, and the timeline is not cleared on logout, so a member behind an admin edit
  sees an enabled-but-refused Undo. Grey it, or skip past non-reversible entries. Clearing the
  timeline on logout is the near-term direction (memory `future-undo-semantics-multiuser`).
- **[GU-E5]** an input-only undo does not jump to its week (the record restores correctly).
- **[GU-LWLOCK]** a restore can push a vestigial legacy-LW history step. No user-facing effect.
- **[GU-COSMETIC]** an AL barrier bound to the loaded week; view-effects not rolled back on a
  failed restore. Both LOW.

### [GLOBAL-UNDO] design record (Rev 6) — MOVED OUT 22 Sep 26

The full Rev 6 design record lived here after the work was built, merged and went live on
18 Sep 26. A backlog is for what is NOT done, and every line of this file is read by every session
that opens it, so it is retired to git history rather than carried forever: `git log -S"Rev 6"
-- OUTSTANDING.md` finds it, and the shipped behaviour is in `docs/undo-contract.md`.

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

### [ARCH-STACK-4] One absence record — BUILT, IN REVIEW, HOLDING FOR "merge live" (20 Sep 26)
Step 4 of the [ARCH-STACK] backbone. Branch `claude/db-step4-one-absence`. An absence is ONE record
(the Input); the Leave War stores only its own records (requests, OIL credits, replaced-bid notices)
as a list per person/date and DERIVES what each day shows on read; approving on the war writes the
Input in the same command; every save is all-or-nothing (phase 0). The owner's clash rules run at
one seat in the inputs door (`leavewar/inputgate.ts`) and on undo/redo; publishing a weekend/PH day
replaces a clashing bid. The multi-record box (grey `+n` / amber `!`) and its tap list are built;
screenshots in `raptor-port/docs/img/step4-shots/`.
- **Read to resume:** the build log `raptor-port/docs/superpowers/plans/2026-09-19-arch-stack-4-build-log.md`
  (what is built where + status), the rules of record
  `raptor-port/docs/superpowers/specs/2026-09-20-arch-stack-4-clash-check.md`, the inspection brief
  `…/plans/2026-09-20-arch-stack-4-inspection-brief.md`.
- **Left:** fold in the cross-provider code inspection (Codex + Fable) and the scenario tester's
  findings; hold for the owner's "merge live". Deferred on purpose: OIL itself as a read-time
  derivation (design §7), per-year balances `[LEAVE-YEAR]`, published-day Unavailable `[PUB-UNAVAIL]`.

### [S4-BUGHUNT] Full scenario bug hunt of the one-absence model — NEXT (owner, 20 Sep 26)
The owner's next task: a full end-to-end bug test of the step-4 scenarios NOT yet covered. **Fable and
Codex PLAN the hunt (a scenario list each, cross-provider), Opus EXECUTES** in the running app and fixes
what it finds. Everything the planners need is in
`raptor-port/docs/superpowers/plans/2026-09-20-arch-stack-4-test-coverage.md` — bugs already caught, what
the 18 e2e + the unit suites already cover, and §3's list of untested ground (other Input doors, answer
A's weekday case, pre-posting-in leave, medical corners, the OIL pass vs absences, cross-war dates, bulk
gestures, undo depth, storage faults, phone touch, figures on multi-record days). Rules of record:
`specs/2026-09-20-arch-stack-4-clash-check.md`. Do it on the step-4 branch (or on main once it merges).

### [S4-BUGHUNT] MERGED to main (PR #422, 21 Sep 26) — 34 commits. Kept for what it SET ASIDE.
**Read `HANDOFF-S4-BUGHUNT.md`, then `raptor-port/docs/superpowers/specs/2026-09-20-CURRENT-STATE.md`
and nothing else first.** That spec is the single destination: what is built, what is parked, and the
RULES SET ASIDE today that must not be re-applied — B4's "overlap means no credit", BOTH halves of
B5 (the bid-door refusal AND "publishing replaces an undecided bid"), §26.3's refusal of leave over
recorded work, Q5's skip, H2 used to decide whether a medical and leave clash at all, and the August
rules about posted-out and pre-joining rows. Several older documents still read as live and are not.
- **Twenty fixes built and green.** The five items that were left to build are DONE, plus a sixth
  the owner asked for in the same breath (a Post in date — the app had no joining date at all
  before), plus two more from questions the hand test raised and he answered: an admin can now
  RECORD that someone worked (FO/HO with reason, who said so and hours, **on any day** — his
  ruling), and can place leave or OIL on a day outside someone's posting dates. **Three parked**
  with their reasons, **one closed** as not a defect.
- **The owner's three open questions are ANSWERED** and recorded in CURRENT-STATE §6. One of them
  changed how leave is charged — it does not: he ruled the app was right and the written rule had
  the wrong word.
- **ALL SEVEN GATES RUN** — unit 327/5181, build, tfin 728/0, rulecheck, e2e 447/0, perf 4/0,
  Tracker smoke 425/0 — **and the hand-testing pass in the running app is DONE.** It found one real
  defect (the new hours box was unusable on a phone), now fixed. One test pair is not certified: see
  the handoff's "the one thing NOT certified".
- **`npm run perf` was dead on the Windows desktop** and silently so — it hard-coded the container's
  Chromium path. Fixed to the repo's own fallback. If another probe "fails instantly", suspect this.
- Came out of it and now standing: the behaviour register, `npm run rulecheck`, the rules-first red
  team as a third review, and the CLAUDE.md standing order to sweep the rules and hand-test against
  them on every build.
- **TWO NEW OWNER RULINGS, NOT YET BUILT** — `specs/2026-09-20-NEXT-TASK-oil-award-and-oil-warning.md`
  is the whole task, written for a fresh session: (1) an OIL AWARD stops flagging a leave day (he did
  NOT rule on `duty` — ask), and (2) warn, on the day AND at publish, when a worked weekend earns
  nobody anything because the duty desk has no times. The second came from him testing DASH on SDO
  for Sun 16 Aug and getting no credit.
- **Both things that were to be put to the owner are ANSWERED AND BUILT.** The ruling to carry
  forward: **OIL may be credited by hand on ANY day** — the weekend/public-holiday restriction
  belongs to the AUTOMATIC pass, which reads the published schedule, not to a credit the squadron
  types itself.

### [DOC-TRIM] The repo is too heavy to read (owner, 21 Sep 26 — D14)
**His words: "theres going to be alot of context for the AI to read ... reading so much context
as an AI it starts to hallucinate."** Measured that day: **1,830 lines loaded every session**
whatever the task, plus **2,228 more** at session start. `HANDOFF.md` states its own 550-line
ceiling inside itself and had reached 961.

- **Policy and tiers: `raptor-port/docs/doc-budget.md`. Gate: `npm run docsize`** — a RATCHET,
  so ceilings only ever go down. Growth is already stopped; this item is the reduction.
- **The one change worth doing FIRST, and on its own** (~30–45 min, compounding on every later
  session): `CLAUDE.md` is 1,539 lines and is loaded every time. Most of that is §Stable
  decisions — historical rulings, which are tier-2 reference, not tier-0 index. Move them to
  `docs/stable-decisions.md` and leave ONE line per topic pointing in. Target ~500 lines.
  Careful work: that section is the project's memory of what must not be relitigated, so move
  it wholesale, verify nothing is dropped, and lower the ceiling in the same commit.
- **Then:** `HANDOFF.md` 961 → 400 (current state only; the stories belong in commit messages);
  `OUTSTANDING.md` 1,210 → 600 (done items out, one short block per live item); `ui-contracts.md`
  is 7,095 lines and needs no budget but does need sub-heads so a session can read one section.
- **The writing rule that stops it recurring** is in `doc-budget.md` §2: record the DECISION,
  not the transcript. Quote him only where the exact words are load-bearing; never quote the
  same words in two files; a reason earns its place only if it would change a future decision.
  This does NOT thin the reasoning — that is the plain-language rule and it still holds. It
  stops saying the same thing three times.
- **Prune on write:** touching a doc means leaving it no longer than you found it.

### [HUMAN-RETEST] Re-test the earlier builds the way a person uses them (owner, 21 Sep 26)
**His words: "This also means that all the previous bug tests we did there will be bugs not
captured. Because I didnt test them when i told u that u would test like a human since."** He is
right, and the OIL build is the proof. It had a two-model cross-provider review and 5341 green
tests, and he then opened the app and found three defects within minutes: the green OIL strip never
reached the board's flying seats or its Common Programme; any advisory chip on a puck painted over
the strip; and in OIL Earn mode the flying seats, the SC shifts and the Common Programme were not
tappable at all — the mode's one gesture did not work on the biggest part of a weekend schedule.

**All three are the same shape: a surface that was never wired up.** Every line of code that IS
there is correct, so reading code cannot find them, and no test caught them because every assertion
about the strip had been written against a duty desk or a ground row — the two surfaces that DO go
through the shared renderer. `docs/feature-impact.md` had even NAMED this drift-seam in advance,
worded as "a new seat renderer"; the hole was in two existing ones.

**So any earlier feature whose bug check was a code review plus unit tests is carrying this class of
defect, unfound.** The scope is every build reviewed that way — the amendment core, the command
layer, the one-absence record, the Leave War wires, the Tracker. The method is the owner's standing
rule, applied properly: build the real thing in the running app, walk every surface that draws the
feature, walk every ORDER of gestures, and ask of each screen whether what is drawn is what a person
would expect to see and can actually use.

**DO THIS AFTER [OIL-AUTO-REMOVE] is closed and merged** (owner: "perhaps the next session we can do
that after this task is truely completed and free of bugs"). Start from
`raptor-port/docs/superpowers/specs/2026-09-21-oil-bugcheck-fixplan.md` §"the two the owner found",
which records why the static pass missed them, and from the scenario lists Fable and Codex wrote for
the OIL pass — the same scenario-design-then-execute shape is what this needs.

### [OIL-AUTO-REMOVE] Taking OIL off — **MERGED 22 Sep 26 (D34). CLOSED.**

**Live on `main` as of 22 Sep 26**, every check green, on his "merge live". **His five-minute look
was WAIVED** — the evidence is the walk and the gates, not an owner sighting; do not assume the
walked Saturday was eyeballed. The walk's own evidence sheet is
`raptor-port/docs/handpass/2026-09-22-oil-walk.md`. **Stays live in this file, not archived**, because
it warns a later session off re-doing the four walk defects and off assuming the owner looked.

> **BUG-CHECKED AND FIXED 21 Sep 26. The remaining job is the hands-on scenario pass.**
> Cross-provider check by Fable 5.1 and Astra/Codex, both read-only, neither the model that
> built it. **Ten defects fixed from their reports, plus FOUR the owner found by opening the
> app, plus his O-1 ruling — all built, tested and pushed (commit `b3d8ee8`).**
>
> - **Triage and what was fixed:** `docs/superpowers/specs/2026-09-21-oil-bugcheck-fixplan.md`;
>   both reviews verbatim beside it. Four of their eight were ONE root cause — the freeze
>   boundary had more doors than `creditFrom`.
> - **Owner rulings from it:** R-1 (only the issued schedule pays, BOTH directions) and R-2
>   (the two pre-existing money bugs share that root cause, so they are fixed here). O-1: the
>   green bar shows only on the events that COUNTED — BUILT, superseding OIL21. All in
>   `DECISIONS.md` D1–D3, D15.
> - **What the reviews could NOT find, and the owner did:** the app draws a puck in six places
>   and only some were wired to this feature — the board's cockpit seats and Common Programme,
>   the WEEK's cockpit seats, the mode's own gesture on all three, and a chip painting over the
>   strip. Every call site is now enumerated and decided. **This is what produced the new
>   bug-check standing order** (`docs/bug-check-order.md`).
>
> **NEXT: execute the two scenario lists in the running app** — Fable's 44 and Codex's 24,
> `…/specs/2026-09-21-oil-scenarios-{fable,codex}.md`. **Start from
> `…/specs/2026-09-21-oil-handpass-handoff.md`**, which says what is already walked by hand so
> it is not redone, names the highest-value scenarios left, and carries the one open question
> for the owner (a pending OIL change looks identical to one in force).
>
> **Gates at that commit:** 5350 unit · build · parity 728/0 · rulecheck OK · tracker 425/0 ·
> **e2e 446 pass / 1 fail** — a Leave War grid scrollbar test that passes in isolation and
> fails under full parallel load. Unresolved on purpose: the handoff names the check that
> settles whether it is ours or pre-existing, and forbids waving it through.

**The three shapes were put to him and he rejected the framing** — rightly. Instead of fighting the
derived credit, ask about the EVENT at the source. He then designed the interface himself: an
**"OIL Earn" mode** on the scheduler board that glows every puck earning OIL that day, where the
admin taps a puck to take a man off one event, or taps an item to stop the whole item earning.

- **The design of record is `…/specs/2026-09-21-oil-auto-remove-decisions.md`** — every owner
  ruling of that session verbatim, plus the ground truth behind them. Nothing lives only in chat.
- **Design rulings that must NOT be relitigated** (21 Sep 26, §8/§9 of the decisions doc, which
  carries each in full): the published schedule is the truth — a full freeze, corrected by
  unpublish-and-republish under the same label, never an approved-absence carve-out; the
  development reset ships at its real scope; a sentinel puck goes green when everyone behind
  it earns the same, the count chip carries the mixed case; ALL and ALL AVAIL stay identical
  on purpose; NO Leave War removal door; the exception shows as ONE line on the day and a
  per-person exclusion never appears on the issued schedule.
- **The design red team was capped at two rounds**, so §9's four answers were never
  independently reviewed — which is why the post-build check weighted them highest. Done; see
  the bug-check fix plan.
- **The owner's mockup** (his own artifact canvas) is a revision behind; redraw before use.

### [ALL-AVAIL-REDEF] What ALL AVAIL and ALL actually mean (owner, 21 Sep 26) — BUILT 21 Sep 26
His ruling, in short: no ground crew by default; a SANS man only when planned with us that day;
ATT B still in; anyone whose own tasking clashes in time is out. **His exact words and the full
before/after table are §2.6 of the decisions doc** — quoted there, not here.

Split out of [OIL-AUTO-REMOVE] because it changes **who gets planted on a row**, not only who gets
credited, and because it closed a real disagreement: two answers to "is this man available" living
in one app.

- **Do it WITH or BEFORE [OIL-AUTO-REMOVE]**: the OIL mode's sentinel expansion depends on what ALL
  AVAIL means.
- **Consider merging with [LW-COMMIT-MANNING]** below — same root cause, same seam.
- **It fixes a live bug as a side effect** (§5 of the doc): a man whose Training input was answered
  "no OIL" is still swept into an ALL AVAIL family day and credited anyway, for an event he is not
  at. If this item is deferred, that needs its own guard.

### [LW-COMMIT-MANNING] Duty & commitments must reduce the Leave War manning — the OTHER half of N17 (owner, 21 Sep 26)
**Owner's words, and he then said to file it: "The manning should only reduce if they are like
planned by things like leave, duty & commitments."**

N17 built the first half — an OIL credit no longer removes a man. The second half is NOT true and
never was: **duty-and-commitment inputs do not reach the Leave War at all.** `absences.ts warVisible`
admits leave, medical, a course and overseas duty, and nothing else — so Training, Meeting, Fly
with, Appointment, Duty and Other are invisible to that grid and to its manning.

Found by Astra in the N16 bug check, and verified: it is NOT a regression from N17. What N17 removed
was an ACCIDENTAL reduction — a duty input that happened to earn an OIL credit used to zero the man
through the credit, on a weekend only. A weekday commitment never counted at all.

**The scenario that shows it:** an SC-day team needs six and the squadron has exactly six on a
Saturday. One of them has an accepted all-day Training input. The Leave War still reads six and one
complete team; it should read five and a shortage.

**The shape, when it is built:**
1. Project active duty-and-commitment inputs into a manning-only contribution — NOT into the war's
   editable cells, its clashes, its charges, or anything that reads as OIL evidence.
2. Fold its full/half-day portions into `DayView.away`, capped per half so leave and a commitment on
   the same half cannot subtract the man twice.
3. Carry it through the category counts, `ruleHave`, the presence counts and `scTeams`.
4. Respect removed/dormant inputs, the posting dates and the ground-crew rules.
5. An OIL credit still removes nobody (N17), whichever way the input that earned it was filed.

**Why it is its own job:** it changes the manning figures on a screen the owner reads, it needs a
decision about which of the six types count (a two-hour Appointment is not a day off the programme),
and the projection is a new seam into the war. Not a line. **Priority: his call — raised with him on
21 Sep and filed at his word.**

### [OIL-PHONE-TARGETS] The OIL mode's phone tap targets — CLOSED, RULED "leave it" (owner, D26, 22 Sep 26)

**Nothing to build. Do not re-open or re-file as a defect.** At 390px the mode draws 71 tappable
things, median 15px tall, all under 44px — measured and true. What was wrong was the agent's
INFERENCE from it; he corrected that directly: *"I can still settle OIL on my phone easily from my
point of view."* He uses it, so his judgment governs. Kept as a RULED item with its date (standing
order §7.6) so a later session cannot rediscover the measurement and "fix" it. Detail: the walk sheet
§6 item 12.

### [DOCS-GUARD] Nothing detects a destroyed record — Fable's F1/F3 (22 Sep 26)

**The one finding that would stop a recurrence, and it is not built.** `docsize.mjs` counts LINES
only; `npm run docsize` is in no hook, not in `npm test`, and not in CI — `deploy.yml` has
`paths-ignore: '**.md'`, so **a docs-only PR runs ZERO checks** and one deleting half the backlog
merges unexamined. D29's three rules reduce the temptation; none detects a bad script.

**F1:** add an inventory pass to `docsize.mjs` — parse item ids from the live + archive files, read
the HEAD versions via `git show`, and FAIL by name when an id is lost, duplicated, or when any
non-blank line of a block that left the live file is missing from the archive (**body level, not a
heading count — that is what passes a file whose bodies are doubled**). Wire it into CI with
`paths: ['**.md', …docsize.mjs]` and a `.claude/hooks/backlog-guard.sh` **Stop** hook, because Stop
fires however the edit was made — a python or Bash script included.

**F3:** the gate must never demand a trim inside a code change. Over ceiling AND the diff touches
`raptor-port/src` → print "deferred to its own pass (D29)" and exit 0; over ceiling and docs-only →
exit 1, because that IS the trim pass. Seven of eight gated files sit at ZERO headroom while other
rules require adding lines to two of them during a fix — that is the squeeze that caused the
destruction. Also: a ceiling constant may change only in a commit touching no `src` file.

**Then F2** (four live texts still order trim-on-touch: the `outstanding-tasks-file` memory,
`.claude/rules/record-decisions.md` line 37, `doc-budget.md` §3, and docsize's own failure message),
**F6** (rulings still with no D-number: the award ruling, "OIL may be credited by hand on ANY day",
and two unbuilt S4 rulings), and the rest of **F4/F5** (the classification rule reworded to "write the
pointer, THEN move"; `.gitattributes` pinning CRLF; two lying headings; duplicate ids
`[GLOBAL-UNDO]`/`[S4-BUGHUNT]`; the phantom `[LW-WEEKDAY-WORK]`; a committed archive mover).

**DO ALL OF IT, IN FABLE'S ORDER — owner's D30, 22 Sep 26: _"Nvm I'll do what fable recommend"_.**
The scope and the sequence are SETTLED; do not re-decide them (the agent offered three different
recommendations on this in three messages, which is what he ended):

1. **F1 + F3** — the inventory check and the gate that can never demand a trim inside a code change.
   ~1 h. These make everything after them enforceable, which is why they are first.
2. **F2 + F6** — the docs-only correction pass, ~45 min, done UNDER the new gate.
3. **F4 items 1/3/4 and F5 items 1–2** — ~30 min.
4. **F5's archive mover and F7** — when the next archive pass is actually due.

**Tier: NONE-to-LOOK** — docs and scripts only, no `raptor-port/src`, so it cannot endanger any app
work; a cheap model can execute it. Total ~2–2½ h, and it splits cleanly into the four sittings above.
Full findings and exact fix steps:
`raptor-port/docs/superpowers/specs/2026-09-22-backlog-process-attack.md`.
Rulings: `DECISIONS.md` D29 (the three rules) and **D30** (this order).

### [OIL-UNDO-WORDS] Undo says "a change to the schedule" when it took back an OIL decision (22 Sep 26)

Found in the walk while proving fix 5's boundary. Inside OIL Earn, the first two presses of the
board's Undo correctly reverse the OIL decisions — and each says **"Undid: a change to the
schedule"**. Taking a man off an event is not a schedule change; the mode exists precisely because
the schedule must not move while OIL is being decided, so the words contradict the screen they appear
on. The third press, which leaves the mode, says the right thing ("Left OIL Earn — the next undo
would change the day itself").

**Tier: NONE** (words only, one string). The label comes from the undo entry's own description, so
the fix is to give an OIL decision its own wording rather than inheriting the generic one. Evidence:
`raptor-port/docs/handpass/2026-09-22-oil-walk.md` §5.1; re-run with
`scripts/handpass/j5-undo.mjs`. **Fold into `[OIL-SEATS-CAN-EARN]` or `[OIL-WORDS]`** — not worth its
own pass.

### [OIL-SEATS-CAN-EARN] Every seat can earn, the default decides — ONE change (owner, D24 + D28, 22 Sep 26)

**STATUS 22 Sep 26: IN FLIGHT — steps 1–4 of 11 built, committed and pushed on branch
`claude/oil-seats-can-earn`. NOT merged; the owner has not said "merge live" and must not be asked
until the FULL-tier walk is done.**
**Context → `raptor-port/docs/superpowers/specs/2026-09-22-oil-seats-build-handoff.md`** — the
resume doc: what landed, what is left (verbatim from the plan's §5, which is not to be resequenced),
the decisions taken during the build, and the traps already paid for.
**Behaviour register → `raptor-port/docs/superpowers/specs/2026-09-22-oil-seats-behaviour-register.md`**
— the list the rules sweep walks in the running app.
Gates at the checkpoint: vitest 5514/5514 · build OK · parity 728/0 · rulecheck OK. The two browser
gates have NOT been run yet.

**D28 merged two items into this one.** His principle: *"If everywhere in the schedule can earn oil,
then the all avail or all puck should also be able to earn oil"* — every seat can earn, the DEFAULT
decides whether it does, the admin can always override. That replaced both his own earlier lean
(ALL AVAIL not on duty) and the agent's per-seat allow-list, and it removes the class of defect
rather than enumerating around it. **Nothing earns by default that does not earn today.**

**Half one — the exempt kinds (D24).** *"is it too late to revert that SC spare, Avalon and BB could
also earn OIL? … But by default they are not going to earn OIL."* SC SPARE, AVALON lines and desks,
and BB lines must OFFER the switch, defaulting to OFF. Today they are wholly inert — no switch, no
door. **Not a flag flip:** all three are skipped BEFORE anyone enters the calculation (`engine/oil.ts`
— `saExemptKind`, `f.spare`/`ac.spare`), so no item key and no person window exist for a credit to
attach to. **Supersedes D15 and D20 on the DOOR only**; D20's second half carries forward (a duty
block MADE from an AVALON template gets the same treatment). **D35 (22 Sep 26) makes that
explicit: the SWITCH reaches the template-minted block too**, not only the no-earn default —
otherwise the same seat answers differently depending on how it was made.

**Half two — ALL AVAIL / ALL, which the OWNER FOUND (22 Sep 26).** A duty desk he added on his phone,
Dash and ALL AVAIL on it: **on that seat ALL AVAIL credits NOBODY** — the day pays the 2 named people
and writes no key for the sentinel, a silent drop. Cause: `putWho` expands a sentinel, `put` drops
anything that is not a person, and only the Common Programme and Ground Programme PRIMARY seats use
`putWho` — flying lines, sims, duty desks and **the extras array of every row type** use `put`.
**PRE-EXISTING** (`main` has the same structure) but newly consequential. Measured in
`raptor-port/scripts/handpass/w11-duty.mjs`; roll-call table in the walk sheet §11.

**Half three — D27, the display half.** ALL AVAIL / ALL are a SCHEDULING feature: dropped anywhere
they work out who would be available and SHOW THE COUNT, with OIL Earn OFF. Extends
`[ALL-AVAIL-REDEF]` (WHO counts as available) by settling WHERE the answer shows.

**ANSWERED — D31 (22 Sep 26).** A seat the rules genuinely cannot MEASURE (no times, zero length,
cancelled, ⓘ) offers NO switch, and says why on screen instead. That is the ONE boundary on D28:
every measurable seat offers the switch, but where there is no window a credit would be invented
rather than earned. The refusal must NAME its reason — never a silent absence.

**RED-TEAMED 22 Sep 26 — BOTH PROVIDERS RETURNED REVISE; the plan is NOT buildable as written.**
Fable (7 must-fix, 9 should-fix) and Codex/Astra (7, four high), blind to each other, nothing
rejected, four findings change its shape. **Read `…/2026-09-22-oil-seats-can-earn-review-log.md`
before touching the plan** (Fable's text verbatim beside it). **D43 settles the default, more
simply than either reviewer proposed:** the placeholder pucks are ON by default wherever they can
land, like named people; only the four exempt KINDS default off (D24/D35). That closes the worst
finding outright — nothing is switched off, so no issued Saturday loses credits silently.

**Tier: FULL** — money, reaches an issued day, adds roll-call rows on every seat type. **Sequencing,
his: NEXT — `[OIL-AUTO-REMOVE]` merged 22 Sep 26**, so this is unblocked and at the head of the
queue, ahead of `[OIL-NEXT-TWO]`. **THE PLAN IS WRITTEN:**
`raptor-port/docs/superpowers/specs/2026-09-22-oil-seats-can-earn-plan.md` — it carries D24/D27/D28/
D31/D32/D33/D35, the roll-call of all six seat types, four findings read off the code (the earn
default is ON today; the earn rule is written twice; the sentinel drop is one helper not six call
sites; placement is unrestricted today) and the order of work. **Red-team it across BOTH providers
before a line is written.** The
display-versus-earning cost analysis and the size estimate are in
`raptor-port/docs/handpass/2026-09-22-oil-walk.md` §11 and §11a. Rulings: `DECISIONS.md` D24, D27, D28.

### [ALL-AVAIL-WINDOW] The counter opens a movable window of PUCKS, not a bubble of names (owner, D38, 22 Sep 26)

**His words:** *"the current interface to show just names on a bubble … is not intuitive … a window
that is movable and … resizable and a user can still click and edit/scroll the schedule behind while
that window is still opened … show the pucks just like how the placeholder shows the personnel and I
can click on the flagging as well … pilot then wso, left right column … Perhaps make a mock up before
we execute this."*

**ONE WINDOW, TWO JOBS.** Tapping either counter opens the same panel: (a) who is AVAILABLE behind an
ALL AVAIL / ALL puck, and (b) who is CREDITED OIL — and in (b) he switches individual pucks off.
Today (a) is a one-line string of names and (b) lives inside the mode's own decoration.

**What makes it different from every panel the app already has:**
- **MOVABLE and RESIZABLE by the user**, and it **does not block the schedule** — he scrolls AND
  EDITS behind it while it is open. Not a `Sheet` (scrim + Escape, blocks everything) and not an
  inline popup (dismisses on an outside click — the 4 Sep 26 standing rule). **This is a THIRD
  transient-surface kind and the first one the app has; it needs its own contract**, and the outside-
  click rule has to be stated as not applying to it, or a later session will "fix" it.
- **Real pucks in the placeholder's own layout** — pilots left column, WSOs right — carrying the same
  warning flags the rest of the app draws, and clickable.

**WHY THE FLAGS ARE THE POINT, in his example:** a man whose ops brief sits inside his standard
debrief must APPEAR, flagged, so the scheduler sees the overlap and judges it. **That is the other
half of D36** — availability stays narrow (he IS available) precisely because the app's job here is
to SURFACE the clash, not to remove him from the list. Do not let this item drift into "filter him
out"; that is the change D36 refuses.

**MOCK-UP BUILT AND APPROVED 22 Sep 26 (D41 — "that mock up looks good"). IT IS THE DESIGN OF
RECORD; changing it now needs his word.** `raptor-port/docs/mock/allavail-window.html`, a working comp in the
app's OWN stylesheet (it drags, resizes, and the schedule behind it scrolls and types). Also published
as an Artifact for him: <https://claude.ai/artifact/3kHfkdRobBjgtmhnyGvkdi>. **He reviewed it across
three rounds and ruled four times: D39** — one puck per row at every width, and the counter chip drops
the word "free"; **D40** — the window opens SKINNY at **212px wide** (the two 74px pucks, their gap
and about 16px of slack per column; **186px is the floor**, below which a puck clips), and its drag
handle is the app's own six-dot grip, not a dashed or hamburger glyph. **Build to those numbers.** A flagged man's reason wraps under his
puck at that width and moves beside him when the window is dragged wider; it is never dropped.

**THE MODE RULE, confirmed with him 22 Sep 26.** Tapping the counter always shows WHO IS AVAILABLE —
any day, OIL or not. The **"Who earns OIL" half exists only while OIL Earn is switched on**; with the
mode off there are no tabs at all, just the one list, and on an ordinary weekday (which cannot earn)
it never appears. That is D27 carried through: availability is a scheduling fact, earning is a mode.

**A CONSTRAINT THE BUILD MUST RESPECT:** a puck is a MEASURED 74×15 (`--puck-w`/`--puck-h`, pinned
with `!important` in `scheduler.css` and watched by the browser geometry gate). Do NOT stretch pucks
to fill this window's columns. The mock instead gives each man a full ROW — puck at its true size,
the rest of the row carrying his flag's reason inline, which is what makes the list scannable and is
exactly the case he opened this with.

**Sequencing: AFTER `[OIL-SEATS-CAN-EARN]`**, which builds the counters this window opens from, and
which settles where they appear. Ruling: `DECISIONS.md` D38; the related ones are D27 (the count is a
scheduling feature), D36 (the narrow window) and D37 (the count reads as what it is).

### [OIL-WORDS] Stop calling OIL "money" in the code comments (owner, D25, 22 Sep 26)

OIL is banked TIME OFF, not pay. **Nothing on screen is wrong** — checked 22 Sep 26, no user-facing
string says paid, pay or money. The shorthand is in CODE COMMENTS (`ui/oilmode.ts` ~117, 211, 294,
455, 542, plus `engine/oil*.ts`) and some test names. **Tier: NONE.** Fold into any later pass that
already touches those files; the definition now heads the OIL behaviour register.

### [OIL-NEXT-TWO] The two the owner parked until after the bug check (21 Sep 26)
**His words: "We can do point 2 and 3 later after the 3 things above are done."** The three being
the browser gates, the hand test in the running app, and the cross-provider bug check on
[OIL-AWARD-ADD]. So these are queued BEHIND that branch being finished, not forgotten.

1. **[OIL-EARNED-VS-GRANTED]** — below. The recommendation put to him was DO IT, as its own small
   change, because it changes two figures he reads and he should be looking at it deliberately
   rather than finding it inside another job.
2. **His own look at the Vercel preview** — build a Saturday with an award, publish it, and see
   whether 4 reads the way he expects. Nothing merges before that.

**Both belong in a FRESH chat**, agreed with him on 21 Sep: they are new work, and the point to
switch is once [OIL-AWARD-ADD] is green or merged. The handoff note names the branch.

### [OIL-AWARD-IS-A-GRANT] An award is a ledger grant stored a second way (Fable, 21 Sep 26)
**Raised by the [OIL-AWARD-ADD] design review as the real architectural root cause. NOT built, and
deliberately not bundled — it moves persisted balances again and touches ~28 test files, so it is
its own escalated session. It needs the owner's go before anything is written.**

After his two rulings an award now: flags nothing, stands nobody down from flying, counts nobody on
the duty manning, is never touched by the published schedule, and adds to the OIL balance. That is
exactly what the OIL tracker's own ledger GRANT already does. The only differences left are where
it is stored and which editor reaches it — so the same fact lives in two stores, which is the drift
seam the house rules name. [OIL-AWARD-ADD] adds a fourth reader of it rather than removing one.

**The shape, if it is ever done:** awards become ledger entries; the Leave War DERIVES the FO/HO
contribution from the ledger on read, exactly the way an absence is derived from the Inputs page;
the three cell editors become one ledger edit; a one-time conversion of stored hand-typed credits
and of the demo seed. **Priority: after the bug hunt, and below [PUB-UNAVAIL] — it is tidiness with
a real risk attached, not a hole in the paperwork.**

### [OIL-EARNED-VS-GRANTED] The tracker calls an award "earned" (Fable, 21 Sep 26)
**Small, and it is the OWNER'S FIGURE to change, which is why it was not folded into
[OIL-AWARD-ADD] silently.**

The tracker's summary counts a hand-typed award under **earned**, and the +OIL breakdown labels the
whole lot "earned by weekend/PH work". That has been true since long before the award ruling, and
[OIL-AWARD-ADD] does not change how a single credit is classified — only that a Saturday can now
carry two. But it makes the wording visible: a Saturday he worked one day on and was awarded three
for will read "earned 4".

**If he wants it:** `oiltracker.ts` counts `auto && !manual` as earned and `manual` as granted;
`counters.ts` splits the +OIL part into "earned by weekend/PH work" and "awarded on the war".
One afternoon. **Ask him before doing it** — it changes two numbers he reads.

### [OIL-AWARD-ADD] An award and a worked day ADD UP — MERGED to main, 21 Sep 26 (PR #423)

**DONE.** Rulings N16–N19 built, all in the OIL behaviour register and each named by a test that
`npm run rulecheck` watches — so the register, not this file, is where they live. Design:
`specs/2026-09-21-oil-award-add-design.md`; what the two review rounds found and what was done with
each: `…-review-log.md`, **worth reading before any further OIL work**. The take-over-and-hand-back
machinery was retired, which was the point — both silent balance bugs of 20–21 Sep lived in its
snapshot. **One half is NOT done and is tracked separately: `[LW-COMMIT-MANNING]`** (N17's other
half — duty and commitments must reduce the Leave War manning).

### [OIL-AWARD-ADD-RULING] The ruling as it was given, kept for the reasoning

> "Yes an award and a worked day add up. So it's 4. The auto oil credits don't get affected by
> manual OIL inputs."

**The ruling.** A 3-day award on a Saturday the man then works is worth **4** — the award's 3 plus
the day's 1. The two are INDEPENDENT: what the schedule earns is never changed by what a person
typed, and what a person typed is never changed by the schedule.

**What the app does today (wrong under this ruling).** One credit record per person per day. When
the schedule earns a credit on a day that already holds an award, it TAKES THE AWARD OVER in place
and stashes it in a snapshot for the unpublish hand-back. Since 21 Sep it keeps the LARGER of the
two (3), which was the safe reading of a defect Fable found — before that fix it kept only the
schedule's 1 and the man silently lost two days.

**What this ruling actually asks for, and why it SIMPLIFIES the app.** Two records on the day, side
by side: the app's own credit and the award, each keeping its own worth, reason and giver. The whole
take-over-and-hand-back machinery exists ONLY because they were sharing one slot — under this ruling
it can go. The day view already sums `earnsOil` across every credit and already asks `.some(auto)`
for duty, so the engine is ready; the work is in the store and the tracker.

**The pieces:**
1. `ingestDutyCredit` writes the app's credit BESIDE an award instead of over it; the `manual`
   snapshot and the hand-back retire (keep the reader for records already stored).
2. `setManualCredit` stops refusing an award on a day the schedule already earns ("That day already
   earns OIL from the published schedule").
3. The reverse sweep (`clearRaptorCell`) removes only the app's own credit, never the award.
4. The OIL tracker lists ONE ENTRY PER CREDIT on the day, not the first one it finds.
5. The day window and the tap list read back both.
6. The grid cell holds one code: the app's own (starred) shows, with the award behind the `+1` mark
   — the same way the app already shows a day carrying more than one record.

**Do this in a FRESH session, not at the tail of one.** It moves persisted OIL balances, which is
where both of the night's silent bugs lived; the project's own rule escalates that kind of change.
Build it test-first and put it through both reviewers.

### [POSTOUT-LOST] A posted-out man walks back into the squadron on a reload — NEW, 22 Sep 26

A person's posting-out window is written straight onto the person by the demo overlay and never
recorded in the persisted posting record. The overlay runs only on a first-ever boot, so once
anything is saved and the page reloads, the posting is gone and he is available again — which
reaches the crew picker, ALL AVAIL, the manning counts and every rule that asks who is free, not
just OIL. Found under a mis-diagnosed OIL report; reproduced (27 members before a reload, 28
after). Deliberately NOT fixed on the OIL branch: not an OIL defect, and it would widen a money
change into an availability one. Watch the dev-phase ruling when fixing — the seed flies him in
July while the demo posts him out in January, so deciding which is right may be most of the job.

**Context.** `raptor-port/docs/handpass/2026-09-21-oil.md` §9 · the red team's §3 in
`…/specs/2026-09-21-oil-fixplan-redteam-fable.md` · script `scripts/handpass/settle-d4.mjs`.

### [OIL-RELINK-XWEEK] A request landed in a stashed week keeps the OLD man, and can land twice — OPEN, 22 Sep 26

**Pre-existing, not OIL-caused, and out of scope for this branch** (Fable F8). Two limits that job
2's "one row" premise stands on:

- A person change made while the anchor's week is STASHED cannot reach the row. The relink finds
  nothing to unaccept, toasts "moved outside the programmed week" and drops the landing mark; when
  that week loads, the row is re-found and re-marked — but its `who` is still the OLD man. The money
  goes to the new man through the claim while the programme draws the old one.
- The duplicate-landing guard scans LOADED days only, so a request landed in week B whose start is
  then moved into week A gets a SECOND row when week A loads. The two rows can disagree (one
  cancelled, one live), and the standing reads whichever week is loaded.

The stash-aware read built for `[OIL-XWEEK-ELSEWHERE]` is the same seam a stash-aware relink would
use. **Context.** `…/specs/2026-09-22-oil-jobs12-codereview-fable.md` §3 F8.

### [LW-SCRUBBER-FLAKY] Leave War e2e tests time out on a saturated machine — PRE-EXISTING (21 Sep 26)
`e2e/leavewar.spec.ts` "the bottom scrollbar is a year-wide scrubber", lw-desktop only. Under a full
parallel run it sometimes times out after the SEP month button is clicked: the grid has not scrolled
within 4s, so the bar's fraction still reads 0. Checked the way the OIL handoff demanded — the SAME
full run on `main` (bdd51cc) FAILED it (446 passed, 1 failed) while `claude/oil-auto-remove-design`
PASSED it (447 passed, 0 failed). **Pre-existing; not the OIL branch's.** It also passes in isolation
(287/0 for the Leave War projects alone). The fault is the test's, not the app's: a fixed 4s poll on
a year-wide grid redraw. Fix by waiting for the grid's own scroll to settle instead of a wall clock,
or raise that poll and the twelve-months one beside it. Low priority — it bites only a loaded dev
box; CI runs three workers with one retry. Logs from both runs are in the 21 Sep evidence sheet,
`raptor-port/docs/handpass/2026-09-21-oil.md`.

**WIDENED 22 Sep 26 — it is a FAMILY, not one test.** The overnight run on this branch failed a
different one, `e2e/step4-leavewar.spec.ts` "leave during a course", lw-desktop, and it failed on the
LOGIN page: the sign-in form had not rendered before the fill timed out. Run on its own it passes in
six seconds. Same cause, same shape — a fixed wall-clock wait on a loaded box — so the fix is the
same one, and it belongs to the Leave War e2e suite rather than to any branch.

### [S4-HUNT-REST] The bug hunt's untouched ground — about three quarters of it (owner, 21 Sep 26)
The branch turned into a long detour through the rules and the five items, so most of the hunt Fable
and Codex planned (eight batches) has never been run. The owner listed what is still untouched, and
this is his order. **Realistically two or three sessions.**
1. **The Inputs page calendar, by DRAG.** It has 43 tests of its own behaviour, but the clash rules
   have never been tested through the drag route — dragging leave onto a pending bid, onto other
   leave at overlapping times, onto a day someone is recorded working. A door people use daily.
2. **The medical dialog's cascade** — a medical laid over existing leave and over other medicals:
   how many pieces it mints, whether ONE undo puts it all back, whether cancelling leaves a
   half-edit behind.
3. **Bulk gestures by real drag** — select a block, then fill / approve / delete / move it, and
   whether the "N written, M skipped" message tells the truth.
4. **Switching wars with a sheet open**, and undo after switching.
5. **Storage faults** — a save that fails halfway: does the app say so, and does a retry land the
   WHOLE thing?
6. **Phone, by finger** — drag-select and the two-step move at phone width, and a day carrying
   eight records.
7. **Figures on days with several records** — four records on one day, and whether the manning count
   removes the man ONCE rather than twice.

### [BACKLOG-ORDER] The backlog proper, in the owner's order (21 Sep 26)
After the hunt. Recorded here because he gave the ORDER, which the individual items do not carry:
1. **[PUB-UNAVAIL]** — a published day's "not available" list changes silently. File a new absence
   over an already-published day and that day's list changes with no amendment, no re-sign and no
   line in the history. An audit hole on published paperwork; **the next one he would fix**.
2. **[LW-LOCKMARK] / the day-vs-record lock** — the grid locks by DAY, not by RECORD. The free-half
   fix works around this rather than fixing it. Worth doing once, properly.
3. **[LW-WEEKDAY-WORK] — the Leave War cannot see ordinary weekday work at all.** Work only reaches
   that grid as an OIL credit, and credits only happen on weekends and holidays, so a man flying
   every Tuesday has nothing on his row to show it. **Bigger than everything else on this page put
   together, and it needs a conversation with the owner before any of it is built.**
4. **[DB-STEP]**, and then the **[AMEND]** work queued behind it.

### [LW-UI-WINDOW] The Leave War input window — Ack, four buttons, every stage (owner, 20–21 Sep 26)
Four asks, given in one sitting while the OIL rulings were being built. A mock-up of all four windows
was shown to the owner and approved before he slept (the only change he asked for: "Duty input", not
"Duty claim", as the giver of OIL credited from an accepted input).
1. **"Pending" becomes "Ack"** — EVERYWHERE the word shows: the decision button, the legend, the
   corner-mark tooltips, the warning list. The button already WRITES `acknowledged`; only the label
   was "Pending" (owner, 27 Aug 26) — so this is a rename, and it **supersedes that 27 Aug naming**
   (`newest-instruction-wins`). Fix the stale text in the same change.
2. **One click on an input gives all four decisions** — Ack, Approve, Refuse, and **Move** with its
   own date box, so a single click can move an input exactly as a drag-select + Move does today.
3. **The same window in EVERY stage** — Open for bidding, Bidding closed, Published. Same size: the
   extra controls are squeezed in, the move date sits beside the decision buttons.
4. **Published behaves as it does today, with the new window's controls.** An input that is approved
   AND published: clicking it lets member and admin write REMARKS, nothing else — to change it, an
   admin goes back to Open for bidding or Bidding closed. An input NOT yet approved on a published
   day stays editable exactly as it is now, with the new buttons (LL / Clear / +OIL / PO / PI and the
   rest).
**Context:** the approved mock-up is in the 21 Sep session; re-draw from this item if it is lost.

### [LW-OIL-DETAIL] What a credited OIL day says when you click it (owner, 20–21 Sep 26)
Clicking an FO or HO shows, at the bottom of the day window: the **reason**, **given by**, and **days
granted**. Both kinds, one shape:
- **An award** (hand-typed) — all three editable, as the OIL tracker already allows.
- **OIL the app credited itself** — the same three lines, filled in: the reason in the words the
  engine already computes (`Duty`, `FLT`, `SIM`, `FLT + SIM`), the giver **"Weekend/PH"**, or
  **"Duty input"** where the credit came from an accepted duty-and-commitments input rather than a
  weekend. Automatic credits must also appear **in the OIL tracker like every other credit**.

### [LW-LOCKMARK] Retire the war's `source:'raptor'` lock marker — OPEN (follow-up to step 4, 20 Sep 26)
Codex's round-2 inspection (AS4-R2-004, low): the merged view still synthesises `source:'raptor'` ("locked on
the war") and Matrix reads it through `raptorOwns`, and the published remarks sheet finds its Input via
`leaveInputAt` (person/date/code) rather than the record id. Correct today (the tap list acts by id on any
multi-record day), but design §6 wants the lock derived from each contribution's own Input. Replace the
Matrix `raptorOwns` checks with per-contribution predicates, open the remarks sheet by iid, then delete
`sourceOf`/`raptorOwns` and the synthesised `source`. Also open: a publish → undo → publish → undo → redo
refusal ("an earlier undone change touches the same thing") that exists on `main` too (found by the step-4
scenario tester) — the global undo timeline's own item.

### [PUB-UNAVAIL] New absence silently changes a published day's Unavailable list — NEXT AFTER step 4
A new absence covering an already-published day changes that day's issued Unavailable list with no
amendment, no re-sign, no history line (`html.ts:1515` reads live inputs; the filing fingerprint
compares `acc` only). Owner (19 Sep 26): fix as its own item straight after step 4. Context: design §13.2.

### [LEAVE-YEAR] Yearly leave balances and carry-over — OPEN (owner, 19 Sep 26: "we will do this next time")
Today each person has ONE running balance per counter; leave on 1 Jan simply comes off it, and a new
year is handled by the admin's "Reset counters". Decide next session: separate balances per year/war,
carry-over rules, and which year a leave crossing 31 Dec charges. Context: clash catalogue Q10.

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
  build; no merge without "merge live". Owner decisions are in `DECISIONS.md`.

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
**The repo is already tidy; there is nothing worth removing. Do not re-open without a new
reason.** Checked: 0 dead source files across 522 modules; dead CSS ~0.9 KB (the rest are
dynamically built class names, false positives); `ts-prune` output was barrel re-exports and
keep-list symbols, acting on it would be a bug. The only real weight is ~0.6 MB of design
write-ups for shipped features, and the owner ruled **KEEP** — a note in the tree is browsable
history; git keeps it either way, so deleting saved nothing.
- Method note for a future sweep: strip the leading `YYYY-MM-DD-` before testing whether a doc
  is referenced, because OUTSTANDING/HANDOFF cite design docs by their date-elided tail.
- **NOTE (21 Sep 26): this was about disk space, which was never the problem.** The problem is
  how much must be READ per session — that is `[DOC-TRIM]`, a different measure entirely.
