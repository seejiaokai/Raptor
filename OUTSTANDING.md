# Outstanding & standby tasks

A running backlog of work deferred or placed on standby, so it can be picked up
in a future session. Companion to `HANDOFF.md`; this is the "not now, but don't
lose it" list.

**To resume:** read this file first, then the relevant design record (linked per
item).

> ## Maintaining this file — do this every time it's touched
> **The three D29 rules (owner, 22 Sep 26), enforced by `npm run docsize` in CI and a Stop hook:**
> 1. **Finished work LEAVES this file** for `OUTSTANDING-ARCHIVE.md` — moved whole, never deleted,
>    never summarised on the way, and ONLY by `node raptor-port/scripts/backlog-archive.mjs <ID>
>    --homes <file>`, which refuses what it cannot do exactly. (Supersedes "move the item to Done at the bottom".) **The test for
>    "finished" is never the heading's words** (they go stale — Fable F4): every fact a later session
>    would need must first have a pointer in a tier-2 doc or a code comment. Write the pointer, THEN
>    move the item.
> 2. **A ruling never lives only here.** It gets a D-number in its area's rulings file (`.claude/rules/decisions/`;
>    the map is `DECISIONS.md`) and a real home.
> 3. **Never trim this file inside a code change.** Over budget there is deferred; the trim is its
>    own docs-only pass.
> - **Item ids are UNIQUE.** A second heading for the same work gets its own id.
> - **A script edits this file's BYTES and never normalises its line endings** (pinned LF by
>   `.gitattributes`): a whole-file rewrite hides a destroyed item inside a diff nobody can read.
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

**Models:** Opus 5.5 plans and builds; Fable 5.1 and Astra review — never the model that wrote the thing (D67,
`.claude/rules/decisions/how-we-work.md`). *(The 7 Sep "Opus 4.8, default" line that stood here is archived.)*

## Priority — live items only (rewritten 24 Sep 26)

**Where this order comes from:** his own orders, each cited; where he has set none, the item's own "Place" line —
said as such, never dressed up as his. One line per item, in plain words; the detail is the item below. The old
list (13–23 Sep 26), its finished entries and the "In plain terms" block are in `OUTSTANDING-ARCHIVE.md`, moved
whole on 24 Sep 26. **Re-order this list whenever an item changes** (§Maintaining).

**His order:**
1. **[HUMAN-RETEST]** — the amendment system is DONE on `claude/amendment-retest`, waiting for his look and "merge
   live"; next, in HIS order (D147, 24 Sep 26): the absence record TOGETHER with [S4-HUNT-REST], then change-recording,
   then the Leave War links LAST (with the 7 Sep phone check).
   *(24 Sep 26: the change-recording re-test also carries [UNDO-ROSTER-SETTINGS] and D148 — both the one undo's.)*
2. **[S4-HUNT-REST]** — the bug hunt's untouched ground, in his own 1–7 order, walked WITH the absence-record re-test
   (D147: its ground IS the absence record).
3. **[BACKLOG-ORDER]** — "after the hunt" (21 Sep 26): [PUB-UNAVAIL] → [LW-LOCKMARK] → [LW-WEEKDAY-WORK] (talk to
   him before building any of it) → then (D147) [OIL-AWARD-IS-A-GRANT] with [OIL-EARNED-VS-GRANTED], and the small OIL
   follow-ups below as ONE batch → [DB-STEP], then the [AMEND] work queued behind it. The architecture comes first,
   then the individual bugs (D144): the stack ([ARCH-STACK]) resumes at [DB-STEP], with its step 6 still to come.
4. **Before ANY collaborator is added** — an event, not a slot: take the checks runner off this repo (SEC-101, in
   [REPO-PRIVATE]).

**The small OIL follow-ups — ONE batch, after the OIL award fix and before the database (D147):** [OIL-READ-LEFTOVERS] (its items 1, 2, 4),
[STORE-READER-SWEEP], [OIL-REQ-NAMEBOX] (a walk question for him), [OIL-WORDS],
[OIL-PERSONAL-PLACEHOLDER] (FULL tier), [CROWD-SIM-BRIEF] (WALK tier), [OIL-RELINK-XWEEK].

**Placed by their own lines — not his rulings:** the Leave War — [LW-FROZEN-BAR-GAP] (after [HUMAN-RETEST]; show him
first), [LW-FIGSEL-SLOW] and [LW-SCRUBBER-FLAKY] (test-only). The Tracker — [TRK-RETEST-NOTES] and
[TRK-EDIT-SIDEWAYS] (their gates have passed), [TRK-PINCH-ASK] (his next Tracker session), [TRK-SMOKE-ADD-RACE]
(before the next Tracker change that touches the smoke suite), [TRK-PALETTE-ASK] (his answer D157: Raptor's colours
fully — a small build), [TRK-BAKE-STALE] (low). The Leave War — [LW-RESET-ORDER] (his yes, D160 — a small build).
The board — [PUCK-FLAG-GLOW] (D164: a flagged puck does not glow — a small build), [BOARD-KEYBOARD-GAP] (phone; small). The amendment batch, all decided 24–25 Sep 26 (D91–D105), ONE build after the re-test merges — `raptor-port/docs/superpowers/specs/2026-09-25-amendment-batch.md`: [PENDING-SUMMARY], [AMEND-PHONE-APPROVER], [AMEND-TEMPLATE-PUBLISHED], [AMEND-NYS-WORDING], [AMEND-LOAD-FILING], [AMEND-MARK-RING-CLASH] (design approved, D93 — to build) and [BOARD-RING-STROKES] (his question), [AVAILWIN-PREVIEW-BAR] (low), [AMEND-SMALL-SEEN] (any time). The docs and the checks — [DEPLOY-DOCS] (its operational half), [DOC-POINTERS-CODE] and
[RULINGS-LF-PIN] (with the next code change), [DOC-SUBHEADS] and [RULING-HOMES-AUDIT] (any time, docs only),
[BG-CWD-GUARD] (his go, D162 — any time). Roles — [QUALS-MEMBER-SCOPE] (his answer D149: own row only; a small
FULL-tier build, any time).

**Waiting on him — no order exists:** [OIL-EARNED-VS-GRANTED] (his figure — ask first, when the award fix reaches it;
D147), [LW-COMMIT-MANNING] (his call), [LEAVE-YEAR] ("we will do this next time", 19 Sep — no slot since),
[REPO-PRIVATE]'s sharing half, [EOD] (design first; no slot
ruled), [CRP-FLAG]'s remainder and then [FLAG-EXPORT], the [AMEND] leftovers, [ADMIN-DISPLAY] ("next time we revisit",
D161), with [USER-GUIDE] (wanted, not urgent) and [PERF-RESIDUALS] (two of them change wording
or feel — his call).

**Future milestones:** [DB-STEP] (with [TRK-DISK] inside it), [XFER], [RECALL], [TRK-ATTEMPTS] (low urgency).

**Kept live as a warning, nothing to build:** [OIL-AUTO-REMOVE] — it warns a later session off re-doing the four
walk defects and off assuming he looked at the walked Saturday (his look was waived).

---

## Items

### [AMEND] Amendment engine redesign — CORE BUILDING (decisions resolved)
**STATUS 24 Sep 26 (the spring clean, from Fable's read of the code):** the core is BUILT and merged — per-day
numbering, AM-01 version ids (`engine/verid.ts`), AM-06 signatures bound to content, Phase 2 (the reopen control
gone). AM-02's migration was dropped on his word (14 Sep 26: reset, don't migrate). **Left:** AM-04 (frozen
availability in the canonical content — `publish.ts` says it is not done), the publish-entry validation matrix,
AM-09 (durable write/lease). *(Corrected 24 Sep 26 by the amendment re-test: PSF-001 — a filing-only change
publishing on stale signatures — is NOT open: he answered it 15 Sep 26, "close it now", and it is built; register
AM14 in `raptor-port/docs/superpowers/specs/2026-09-24-amendment-behaviour-register.md`.)* The
heading and the lines below about "building on `claude/amendment-engine-core`" and "Opus 4.8" are history.
Rebuild the publish/amend/version model: per-day isolated numbering (never
week-wide), published = immutable, every change a new AL, supersede-never-retract,
undo cannot cross a publish, load-old-version → republish-as-next-AL as the safe
recovery path. *(Superseded in part 18 Sep 26, marked 24 Sep 26 per D90: undo of a published day = UNPUBLISH it;
a quiet correction republishes under the SAME label; every issuance is still kept, never erased — register
AM32–AM37c.)*
- **Decisions RESOLVED (owner, 12 Sep 26):** plans SURVIVE as backups; ALL FOUR roles
  re-sign every amendment; crew SEE the live draft (issued stays authority). OIL for
  this build = latest AL/Original per day, per-day, read-failure protection (the
  worked-day lock stays **[OIL]**). *(Superseded 24 Sep 26 by D142 (his ruling of 20 Sep 26): a day's OIL comes
  from its latest published version — the latest amendment, or the EOD if that is the latest — however old the
  day; no lock, no clock. `[OIL]` is archived.)*
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
  no-content-change closure path + treatment of unclosed/legacy worked dates. *(Superseded in part 24 Sep 26 by
  D142: a later published version that takes a man off a past day DOES take that day's OIL — he confirmed it —
  so "a later AL can still strip its OIL" is the rule, not the defect. What may remain is the closure path itself.)*
- **REV5-02** a late OIL acknowledgement (`reviseOil`→`row.oil`, no publication gate) has
  no defined transition into an immutable/closed day.
- **REV5-03** pick ONE correction transition (corrections are EOD-kind, not signed AL).
- **REV5-05** closing a day doesn't freeze holiday eligibility (`setDayEvent` removing a
  PH → `runOilPass` deletes the credit, no closed-day guard); freeze the non-working basis.
- **Design record:** the EOD design is preserved in §3b of `…-amendment-core-build-brief.md`;
  findings + dispositions in the review log. **Model:** design-first, red-team both
  providers again before building; then Opus build + Codex inspection.

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
- **[GU-MAYREV] ANSWERED (D148, 24 Sep 26): Undo reverses only the signed-in person's own changes, clears on sign-out, and refuses (saying who) if someone else has since changed the same thing — `raptor-port/docs/undo-contract.md` §4. Build it with the amendment or change-recording work. The question as it was put:** — Undo is enabled on the newest eligible entry
  whatever the actor, and the timeline is not cleared on logout, so a member behind an admin edit
  sees an enabled-but-refused Undo. Grey it, or skip past non-reversible entries. Clearing the
  timeline on logout is the near-term direction (memory `future-undo-semantics-multiuser`).
- **[GU-E5]** an input-only undo does not jump to its week (the record restores correctly).
- **[GU-LWLOCK]** a restore can push a vestigial legacy-LW history step. No user-facing effect.
- **[GU-COSMETIC]** an AL barrier bound to the loaded week; view-effects not rolled back on a
  failed restore. Both LOW.

### [RECALL] Fresh recall from archive — FUTURE FEATURE
An admin recalls an archived person back into Quals. **Behaviour (owner, 13 Sep 26):**
leaving the whole app SYSTEM then being posted back = **FRESH** — new/updated quals and
new Leave War balances; only past history stays frozen. NOT "restored exactly as they
left." Replaces the current Quals ✕ / "Restore exactly" behaviour (see [SYNC-INTEG] P6).
- **Absorbs `[SYNC-INTEG]` P6** (carried here 24 Sep 26, when that item was archived): a Quals ✕ confirm — a
  confirmation that archiving someone removes their leave; small, and `QualsPage.tsx` archives with no
  question today. Its P7 (a stale "Leave War session-only" line) is done: `raptor-port/CLAUDE.md` and the Leave
  War's architecture say it persists.
- **Context:** the sync spec §Parked; memories `multi-squadron-and-person-transfer`,
  `future-undo-semantics-multiuser`.

### [XFER] Multi-squadron + transfer a person with their data — FUTURE MILESTONE (with [DB-STEP])
**Behaviour (owner, 13 Sep 26):** many squadrons on one app / one backend; transferring a
person BETWEEN squadrons carries ALL their data across (quals, history, leave) — distinct
from leaving the system entirely, which is a fresh return. The identity model must let one
person move between squadrons with data intact.
- **Context:** memory `multi-squadron-and-person-transfer`; ties to
  `docs/architecture-direction.md` and [DB-STEP].

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

### [HUMAN-RETEST] Re-test the earlier builds the way a person uses them (owner, 21 Sep 26)
**ORDER (D85 + D86, 23 Sep 26): TWO CHATS IN PARALLEL — THE TRACKER and THE AMENDMENT SYSTEM**, one
feature per chat. Amendment chat: port 4173, rulings from D90. Tracker chat: port 4180, rulings from
D120. Never two full gate runs at once (false failures under load). **The order of the other three — SET by him
(D147, 24 Sep 26):** the absence record, walked TOGETHER with [S4-HUNT-REST]; then change-recording; then the Leave
War links LAST, with the 7 Sep phone check folded in.
*(Its lines on which chat ran when — D153, D154, D155, D135, D125, every one spent — moved 24 Sep 26 to `OUTSTANDING-ARCHIVE.md`. The Tracker part is merged; the demo is done.)*
**THE TRACKER PART IS DONE — MERGED to `main` 23 Sep 26 on his "merge live", after his look** (evidence
`raptor-port/docs/handpass/2026-09-23-tracker.md`; rulings D120–D132).
**THE AMENDMENT SYSTEM PART IS DONE on `claude/amendment-retest` (24 Sep 26) — waiting for his look and his "merge live"**
(evidence `raptor-port/docs/handpass/2026-09-24-amendment.md`, his look card §13; the register
`raptor-port/docs/superpowers/specs/2026-09-24-amendment-behaviour-register.md`; its questions `[AMEND-D45-FILING]`,
`[AMEND-PHONE-APPROVER]`, `[AMEND-TEMPLATE-PUBLISHED]`, `[AMEND-NYS-WORDING]`, `[AMEND-REISSUE-DOOR]`,
`[AMEND-LOAD-FILING]`). The older-amendment unpublish ("BUG 1") was walked three deep and has not come back. Next
here, in his order (D147): the absence record with [S4-HUNT-REST], then change-recording, then the Leave War links.
**Added 24 Sep 26 (the spring clean, from `HANDOFF.md` §Open as Fable classified it):** the amendment walk includes
unpublishing an OLDER amendment — the 11 Sep review's "BUG 1" (the day left contradictory) looks dissolved by the
supersede-never-retract rebuild (`unpublishAL` is gone), which only a walk can confirm; and the Leave War half of
the 7 Sep 26 device pass (the figures drawer, the bulk balance entry, the 6 Sep phone fixes) was never given his
iPhone look — fold it into the Leave War links walk.
**Tracker scope (D120):** his charts reach the database by export → wipe → import, so the older-data
converters and old file formats are NOT walked; the current export → wipe → import round trip is
walked FIRST (`docs/tracker/known-gaps.md`, head note).
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

### [LW-FIGSEL-SLOW] One Leave War unit test times out under a full parallel run (23 Sep 26)

`src/leavewar/ui/figselect.test.tsx` "an undo, a stage change and the drawer toggle all drop it" takes ~4–5s
alone (3.9s on the final tree; the same on the code before the Leave War fixes) but ran past its 20s limit in
2 of 3 full `npm test` runs on the owner's PC on 23 Sep 26 (another chat's worktree active). Pre-existing,
load-only. Fix: split its three drop cases into three tests (each renders the whole year once), or give it its
own longer limit — not a pause. Evidence: `raptor-port/docs/handpass/2026-09-23-lw-monthjump.md` §13/§15.

### [LW-FROZEN-BAR-GAP] For one frame no dates header shows while the page scrolls it away (23 Sep 26)

Found by the frame-by-frame pictures of the frozen-bar fix (evidence sheet §11, frame 1 of
`fixed-desktop-frozen-bar-first-frames.png`). When the page scrolls the real dates header up under the
top bar, the frozen copy arrives ONE painted frame later — it is React state set in the window's scroll
handler, so it renders on the next frame — and that frame has no header at all. **Pre-existing, and not
the owner's "scrolling rapidly horizontally"** (that jump is fixed): a blink, not a slide. Fix direction:
in `Matrix.tsx`'s stuck effect, commit the change of stuck-or-not synchronously (`flushSync`) — ONLY when
it changes, never per scroll event, because the whole grid re-renders on it — or keep the bar mounted and
show/hide it outside React; either needs a speed check (the re-render would land inside the scroll
frame). The Quals page's frozen header has the same shape. **Place:** the next Leave War polish item,
after `[HUMAN-RETEST]`; show him first — he may not see a one-frame blink at all.

### [OIL-PERSONAL-PLACEHOLDER] A placeholder on a landed "Personal" request row draws no count (23 Sep 26)

Found by Fable's scenario design, confirmed by reading (not walked). A "Personal" request can land on
the ground programme (`ground:true`) but never asks the OIL question (`oilAsks` excludes it), and the
request half of the evidence only records a placeholder's crowd for ASKING types — so ALL / ALL AVAIL
dropped on such a row gets no membership: no count chip, no window, on any day. D27 says the count
shows wherever the puck lands; D46 lets it land on a request row. **Pre-existing on `main`** (the
membership code is `[OIL-SEATS-CAN-EARN]`'s), rare in practice. The fix touches the OIL evidence
(`engine/oilev.ts` — record the crowd for any landed row standing a placeholder, earning or not), so
it is FULL tier and wants both readers. Evidence: `raptor-port/docs/handpass/2026-09-23-allavail-window.md` §3.

### [CROWD-SIM-BRIEF] The D38 flag does not cover a crowd man's SIM brief/debrief (23 Sep 26)

The window flags an event that sits inside a crowd man's own FLIGHT brief or debrief (`crowdClashes`,
`engine/validate.ts`). His SIM brief/debrief windows are built inside the warning pass from its
private sim table and are not reachable from outside it, so a sim man behind an ALL AVAIL is listed
clean. Needs the sim windows lifted into one body, as the flight ones were. WALK tier.

### [DEPLOY-DOCS] The Pages-era deploy text is stale since the repo went private (D59, 23 Sep 26)
**STATUS 24 Sep 26: the DOCS half is DONE** in the spring clean — the Pages-era text of `raptor-port/CLAUDE.md` and
`HANDOFF.md` moved whole to `raptor-port/docs/archive/`; the live rules are `.claude/rules/shipping.md` and
`raptor-port/docs/gates-and-deploy.md` (its Now block); "done" means live on Vercel (D143); the "site is public"
sentences corrected. **Left** (Astra's red team, finding 12): the header and comments of
`.github/workflows/deploy.yml` and `raptor-port/scripts/handpass/live-check.mjs`, which still describe a Pages
deploy — files that start the gates, so their own small change.

`raptor-port/CLAUDE.md` §Build & verify and §How to work here, and `HANDOFF.md` §Deploy, still describe GitHub Pages as the official live site, the "done means live" chain ending at Pages, and `seejiaokai.github.io/Raptor` as the page to check. All of it stopped being true on 23 Sep 26: Pages is gone, the publish job is off, Vercel is the only viewer. Marked SUPERSEDED in place at the two most misleading lines; the proper rewrite is its own docs pass (D29 — never trim inside another change). **Tier: NONE.** Do it with `[DOC-TRIM]`, which owns the same two files.

### [OIL-WORDS] Stop calling OIL "money" in the code comments (owner, D25, 22 Sep 26)

OIL is banked TIME OFF, not pay. **Nothing on screen is wrong** — checked 22 Sep 26, no user-facing
string says paid, pay or money. The shorthand is in CODE COMMENTS (`ui/oilmode.ts` ~117, 211, 294,
455, 542, plus `engine/oil*.ts`) and some test names. **Tier: NONE.** Fold into any later pass that
already touches those files; the definition now heads the OIL behaviour register.

### [OIL-AWARD-IS-A-GRANT] An award is a ledger grant stored a second way (Fable, 21 Sep 26)
**Raised by the [OIL-AWARD-ADD] design review as the real architectural root cause. NOT built, and
deliberately not bundled — it moves persisted balances again and touches ~28 test files, so it is
its own escalated session. It needs the owner's go before anything is written.** **GO GIVEN (D147, 24 Sep 26):**
after his after-the-hunt items and BEFORE [DB-STEP], so the database stores one kind of award; [OIL-EARNED-VS-GRANTED]
folds in (its label is still his figure — ask him when it comes); then the small OIL follow-ups as one batch.

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
**Related, deferred on purpose from `[ARCH-STACK-4]` (merged; archived 24 Sep 26):** OIL itself as a read-time
derivation — the step-4 design §7 (`specs/2026-09-19-arch-stack-4-one-absence-design.md`). Decide both together.

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
**Do it as its own small change, in a FRESH chat** (agreed with him 21 Sep 26 — carried here 24 Sep 26 from
`[OIL-NEXT-TWO]`, now archived, whose other half, his look at the award preview, closed when PR #423 merged).

### [OIL-READ-LEFTOVERS] The four the two final code reads raised and this branch did not act on (22 Sep 26)

Both providers read the finished OIL branch blind to each other and returned the SAME four defects;
three were already fixed and the fourth (a nought-minute SC/AVALON/BB shift saying it still earns)
was fixed in the same session. Reports and the reconciliation:
`raptor-port/docs/superpowers/specs/2026-09-22-oil-seats-final-read-{fable,codex,reconciled}.md`.
These four are what was deliberately left:

1. **The saved-plan preview's chip and its tap disagree about which list it is** (Fable F3, LOW).
   Wording, on a surface `[ALL-AVAIL-WINDOW]` replaces. Do it there or not at all.
2. **The second spare sim seat leaves a hole in the stored crew array** (Fable F4, LOW). Check it
   against `slots.ts`'s trailing-blank trim before changing anything — the array shape is that
   file's contract, not D50's.
3. **An already-issued weekend carrying a placeholder reads "1 pending" the moment this ships**
   (Fable F5, LOW). **PART DONE 22 Sep 26, on his "ok fix this first".** The day used to say "1
   pending" with no cell marked and nothing in History, while the chip beside the puck said "?" —
   something changed, nothing said what, and the one place to look was never written down. The day
   now NAMES it (`OIL_OLD_BLOCK`), so he is not republishing blind. **CLOSED — RULED D54 (23 Sep 26,
   "leave it as it is"): the day raises the mark.** He republishes once per affected day and those
   men get their OIL. Do not re-open it later as a bug (standing order §7.6).
4. **A placeholder that reaches a cockpit by copy draws the jet as crewed** (Fable F8, LOW,
   pre-existing). D47 belts the money on purpose and names this; the screen half is one advisory
   away. A product call, not a defect against the plan.

### [REPO-PRIVATE] Make the repo private and share it with developers — HALF DONE 23 Sep 26 (D59)

**23 Sep 26, later: D88 ("I'll make it public for now") was REVERSED by D89 before he switched — it
stays PRIVATE** and the checks move to his own PC (`[CI-TWO-CORES]`). Why it mattered: 146 old branches
on GitHub still carry the D58 unit designation IN THEIR FILES, and `main`'s history in 14 commits.

**DONE, BY HIM, 23 Sep 26 (D59): THE REPO IS PRIVATE**, reversing his own *"nvm disregard this
first"* the same day after a check found the unit named in the app. Pages is GONE (API 404), so the
publish job in `.github/workflows/deploy.yml` is OFF — it would fail every push and still bill —
with the gates left running. `README.md` corrected. **The app is viewed on VERCEL now.**

**STILL OPEN — the sharing half** (*"i would like to make my repo private, and share with developers
on my app"*). Route: Settings → Collaborators, by username, Write; they run it locally and do not
need Vercel. **Unmade question:** a collaborator here sees the uploaded original, the whole history
and every agent-facing doc. If that matters, the fresh single-commit repo below is the answer.
**BEFORE THE FIRST COLLABORATOR IS ADDED (Astra SEC-101, 23 Sep 26): take the self-hosted runner off
this repo** (Settings → Actions → Runners → JK → Remove) and set `CI_ON_GITHUB=true` — or move the
runner to a separate owner-only CI repo. A pull request runs its own copy of the workflow, so the
guard in `deploy.yml` cannot stop a collaborator's PR from aiming a job at his PC.
**What was established while it was up, so it is not re-derived:**
- The repo is **PUBLIC** today and the live site answers **200 to anyone** with the URL, no login.
  The hard-coded accounts are one search away in `src/state/auth.ts`, so removing credentials from
  the README was never a security change (it was done anyway — they were STALE and contradicted the
  24 Aug decision to keep them off the sign-in card).
- **Pages cannot serve privately.** From a private repo it needs a paid plan, and even then the
  published site is public — private Pages is enterprise-only. So Pages is not a sharing route at
  any sensible price. Going private on the free plan simply turns the live site off.
- **Collaborators** is the sharing route: Settings → Collaborators → add by GitHub username, Write.
- **The Vercel preview is HIS alone** — it sits behind Vercel's own sign-in, and a developer cannot
  generate one. Adding them needs a Vercel team seat (the free tier is single-person). **Developers
  do not need it**: `cd raptor-port && npm install && npm run dev` gives each of them the whole app.
- **MEASURED, 23 Sep 26 — one push costs 37 BILLED Actions minutes** (31 real minutes over nine
  jobs; GitHub rounds every job up, so the rounding alone is 6). Public repos are unlimited; private
  ones are metered. At the commonly-quoted 2,000/month that is ~54 pushes, and one heavy session
  (23 Sep) used ~220. **His plan and live usage were NOT readable from the session** and should be
  read off Settings → Billing and plans rather than assumed.

**The recommendation on the table:** private + collaborators with Write + Pages OFF + developers run
it locally; pay for Vercel seats only if non-developers need to look. **His call, unmade.**

**WHAT A DEVELOPER WOULD FIND, measured 23 Sep 26.** `raptor-port/reference/scheduler.html` (435 KB)
is the original app, in the open, and LOAD-BEARING — `npm run test:reference` (the 728/0 line) runs
it; `PORTING.md` calls the job a port of it. `RAPTOR-Command-Brief.pptx` is gone from the tree but
lives in three commits, and **slide 1 still carries the service name** (binary, so D58's text sweep
could not reach it). Plus ~660 agent-taken screenshots, and 1,296 commits across ~25 branches all
carrying agent attribution and agent-facing docs. **A history rewrite does NOT clean GitHub** —
old objects stay reachable via PR refs and forks; only support can purge them. **A worktree does
not isolate any of this; it shares the same history.** The clean route is a FRESH repo with ONE
commit — app source only — which drops the deck, the original and the archive in a single step.

**NO RESTRICTED MATERIAL WAS EVER UPLOADED — checked 23 Sep 26, do not re-run.** Clean: the uploaded
original (no marking of any kind), the deck's 10 slides, the demo data (63 invented callsigns, no
real names/IDs/DOB/next-of-kin/rank), and the stores, mission and area vocabulary (generic training
terms and compass points). The only `RESTRICTED` is the stamp the app PRINTS on schedules it
generates (`src/ui/printpdf.ts`) — the product working, not a trace of anything received.
`tracker.css`'s `.restricted` banner is dead style, rendered nowhere. **That check never opened the Tracker's SYLLABUS data** (222 events of course content) — and he has since ruled it OUT OF SCOPE (D62): leave it, never flag it again. Every other mention of the aircraft type is now "fighter squadron" or the bare "F-15" (D63, D64) — only that syllabus data keeps it.
### [STORE-READER-SWEEP] A stored record read more narrowly than it is written — sweep for more (22 Sep 26)

**TWO INSTANCES FOUND IN ONE FILE IN ONE EVENING, both silent, both about official
dates.** `readPostOuts` insisted a posting record carry a LEAVING date, so every
JOINING date `setPostIn` wrote was discarded at the next boot; and `setPeople`'s
keep rule then tested membership of that record rather than the leaving date it
means. Both fixed on `claude/oil-seats-can-earn`. Neither was found by a walk or
a review — they came from re-reading the file around an unrelated fix.

**The shape, so it can be looked for:** a writer grows a new case (a second date,
a new field, a nullable end) and the untrusted-storage reader beside it is not
widened with it. The write succeeds, the reload silently drops it, and nothing on
screen says so. Two spot-checks came back clean (`readPersonEdits` matches
`setPerson`'s type exactly; `readOilPolicy` covers both its fields) — the rest of
`leavewar/state/store.ts`'s readers, and the scheduler's own storage seam, have
not been walked. **Small, mechanical, and worth doing once**: for each reader,
find its writer and diff the shapes. Priority: with the other small follow-ups.

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
this is his order. **Realistically two or three sessions.** **Place (D147, 24 Sep 26):** walked TOGETHER with the
absence-record re-test of [HUMAN-RETEST], straight after the amendment system — one pass, since this ground IS the
absence record.
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

### [LW-WEEKDAY-WORK] The Leave War cannot see ordinary weekday work — OPEN, needs the owner first (21 Sep 26)
Its place in the order and the one-paragraph description are item 3 of `[BACKLOG-ORDER]` above.
Given a heading 23 Sep 26 ([DOCS-GUARD] F5) so the document gate counts it — it had been named in
his order without ever having an item of its own. **Talk to him before building any of it.**

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

**THE DATA GETS WIPED ON THE WAY IN (owner, D54, 23 Sep 26 — "this app is going to get wiped of
data before its being brought into a database as these are demo data anyway").** Stated as a PLAN,
not an option: nothing now in the store has to survive the move. It is the 13 Sep dev-phase rule and
D22 strengthened — those approved clearing when it was simpler; this says the clearing is going to
happen, so "the harm lives only in data that already exists, and it is prevented going forward" is
a reason to STOP, not a cost to weigh. Use it as a test on any finding from here to the database.
**The Tracker's hand-drawn charts are the exception, and they travel by EXPORT → WIPE → IMPORT
(owner, D120, 23 Sep 26):** he exports them, the app is wiped, he imports the file. So the current
Export and Import of charts must be faithful at this step; the older-data converters and old file
formats need not be (`docs/tracker/known-gaps.md`, head note).
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

- **The notional TODAY stays pinned to the demo week until real data arrives**
  (owner, 24 Aug 26). `weeknav.ts`'s `TODAY = '13/07/2026'` drives only the
  today-ring/dot on the week pickers; every time-STAMP already reads the device
  clock. When the demo is replaced, point that one literal (and nothing else) at
  the device date.

### [CRP-FLAG] Live flagging on the PUBLISHED schedule — DESIGNED + RED-TEAMED, ready to build (15 Sep 26)
**STATUS 24 Sep 26: PARTLY BUILT** — PR #406 (16 Sep 26) merged the plan's "Item 2 + 3(a)" (the two checked
versions; the official-flags overlay). The note of what came next was lost with an old handoff line and the
retired `docs/session-state.md`. **Before touching this, check the code against the plan's §11 test list**
(`raptor-port/docs/superpowers/specs/2026-09-15-crewrest-flagging-plan-v2.md`). "Ready to build" above is history.
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
**STATUS 24 Sep 26: PART DONE** — it prints the PUBLISHED version with a per-day signed/working stamp, as a
white one-layout report (`raptor-port/src/ui/printpdf.ts`). **Left:** the current day only (it still prints the
whole loaded week), the 1–2 sample PDFs for him to pick, and the next-week peek's label. The "functional" bullet
below is done.
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

### [OIL-REQ-NAMEBOX] A man typed into a REQUEST row's name box in place of the requester earns nothing — OPEN, 22 Sep 26

**Deferred deliberately during `[OIL-SEATS-CAN-EARN]` step 6, not missed.** That step made a
PLACEHOLDER on an accepted request's row count the people it stands for, in the name box and in the
extras line alike. It left one case alone: a real, named person dragged into the name box in place
of the man who filed the request. He does no worse than before — he earned nothing there yesterday
either — but he is plainly doing the work, and D18 ("for 2 he should earn") is the same argument
that got the extras line paid.

**Why it was left.** In every path the app has, that box holds the requester, and the money already
pays him from his own answer. Crediting "whoever is in the box" would move money on a case nobody
has reported, inside a step whose scope the plan fixed. Doing it silently is exactly the shape the
OIL build keeps getting bitten by.

**What to do.** Put it to the owner as a walk question — can the scheduler put someone ELSE in a
request row's name box, and if so should he earn from it? If yes, it is one line in
`landedExtras` (treat the name box like the extras, the requester still excluded) plus a test.
**Priority: with the other small OIL follow-ups, after the walk.**
**Context:** `raptor-port/docs/superpowers/specs/2026-09-22-oil-seats-can-earn-plan.md` §5 step 6;
the body is `raptor-port/src/engine/oilev.ts` `landedExtras`, and its own comment says why.

---

### [TRK-RETEST-NOTES] The Tracker walk's smaller notes — filed, not fixed (23 Sep 26)
**Place:** after the Tracker `[HUMAN-RETEST]` merges; none blocks it. Found by the three walkers
(`raptor-port/docs/handpass/parts/tracker/w1.md`, `w2.md`, `w3.md`), each with its picture there.
Marked **his call** where the answer is product direction, not a defect.
- **Entering ✎ Edit chart layout moves a scrolled chart** 190–240px (ACG-04 500 → 262; back to 449, not
  500) — the code means to keep the view (`toggleArrange`); the arrange canvas drops the centring slack
  (`padBoard`) without moving the scroll by it. A real defect, small. (w2 off-list)
- **The Failures card still counts failures on an N.A. event** while the ball hides its ticks — his call. (w2 N1)
- **The X labels follow the order failures were RECORDED, not their days**; − takes back the last
  recorded — his call. (w2 N2)
- **Ctrl+Z right after a pace / end-date / lull change takes back an OLDER mark** (those are not in the
  history; the ↶ tooltip is honest, the key is not). (w2 N3)
- **A slowly typed date undoes through half-typed years** (Upchit read 02/11/0202) — the Done-on box
  now ignores half-typed years (W2-F2); the Last Flown, down-days and upchit boxes do not. (w2 N4)
- **A press on another student's red failure tick grades the picked student** instead of picking the
  owner of that slice (a thin target). (w2 N5)
- **+ Set lull period opens on the last month looked at**, not this month. (w2 N6)
- **A future "Done on" day is accepted** (Currency then reads "−1d") — his call; D123 lets it come back
  down. (w2 N7)
- **After a students import a course new to the app is added after the app's own courses** (the
  course-order twin of F6); students are demo data under D120, so low. (w1 O3)
- **On a phone the Crew box reads "STUDEN…" for every student** (88px at every width under 1050). (w3 O1)
- **A + Add dialog left open while the roster changes keeps its old list** (keyboard-only). (w3 O3)
- **At 844×390 Raptor's own top bar is 149px** (the desktop menu in two rows) — a shell matter; the
  Tracker's column now fits under it (w3-F3). (w3 O4)
- **A `scheduler.css` comment says a dozing page's insides read 0×0** — they report full boxes. (w3 O5)
- **At 1200px the status beside ✓ Save changes shortens to "● un…"** (whole on hover) — the price of the
  fixed save corner (w3-F5); the button says what matters.

### [TRK-EDIT-SIDEWAYS] Edit chart layout on a sideways phone leaves the chart no room (23 Sep 26)
**Place:** after `[TRK-PINCH-DRAGS-BALL]`. At 844×390 the tool strip fills the screen and the chart area is
0px — nothing to see, drag or pinch (picture `docs/img/handpass/2026-09-23-tracker-pinch/after-phone-sideways-edit-no-room.png`).
Upright it keeps 446px. Older than the pinch fix (F-C in its sheet). A layout job: fold or scroll the strip sideways.

### [TRK-PINCH-ASK] His iPhone look at the pinch fix (24 Sep 26)
**Place:** his next Tracker session — nothing is broken; `[TRK-PINCH-DRAGS-BALL]` merged on D133 without his look.
The two feel questions are ANSWERED — **D134: keep both as built** (a deliberate drag joined by a second finger goes
back; the finger left down after a pinch does nothing). Left: his look card, on his iPhone on the live app:
`raptor-port/docs/handpass/2026-09-23-tracker-pinch-ball.md` §12 — Safari is the one browser no walk here drives, and
one line of the fix (the board holding both fingers) is proven only there.

### [TRK-SMOKE-ADD-RACE] The smoke suite's "+ Add" step can still lose a typed name (24 Sep 26)
**Place:** after `[TRK-PINCH-ASK]`, before the next Tracker change that touches the smoke suite. Seen twice on
24 Sep 26: a local smoke run (check 261, an add straight after syllabus switches) and PR #431's first run on his PC
(check 231, an add straight after a roster pick) — both at the step's own `waitForFunction` on `#dlgInput`, whose
comment calls it "the residual behind the intermittent TRK-SMOKE timeout after the reset-on-render fix" (the 17 Sep
fix, `[TRK-SMOKE]`). Not caused by PR #431 — its changes do not run on that desktop mouse path; the whole suite passed
442/442 on the same code, and an isolated probe (a syllabus switch or a roster pick, then at once an add, 24 times)
lost nothing on either PR #431's build or `main`'s. Both stops came while the PC was busy, and both straight after a
save or a load had started — a background notify re-rendering the controlled input. **Do:** instrument the running app
at the failing add under load (as the 17 Sep fix did) and fix the re-render, not the wait; until then, a stop there
is re-run once WITH this item cited, never silently.

### [TRK-BAKE-STALE] The chart-baking script no longer runs (found 23 Sep 26)
`raptor-port/scripts/tracker/bake-user-charts.mjs` resolves `src/data/…` from `scripts/` (the folder
does not exist — the data is `src/tracker/data/`), reads name-keyed charts (before the 13 Sep ids) and
the one-table `eventInfo` (before D126). The D120 route (export → wipe → import) does not need it; fix
it only if baking a chart into the shipped data comes back. **Place:** low, after `[TRK-RETEST-NOTES]`.

### [LW-RESET-ORDER] A "back to the default order" control for the Leave War roster — his call, build only if he asks (moved from HANDOFF.md, 24 Sep 26)
**HE ASKED (D160, 24 Sep 26): build it** — a "Reset order" line in ⚙ Settings running the store's `autoSortRoster`;
no button, no strip. WALK tier (a new control). **Place:** any time, none blocking.

- **OWNER'S CALL — no "back to the default order" control since Auto-sort went
  (6 Sep 26).** A hand-arranged Leave War roster stays arranged until dragged
  back; the store's `autoSortRoster` still exists. Offered: a "Reset order" line
  in ⚙ Settings. Build only if he asks.

### [ADMIN-DISPLAY] An Admin "Display" area of per-section fold defaults — awaiting his go-ahead, do NOT build without it (moved from HANDOFF.md, 24 Sep 26)
**DEFERRED BY HIM (D161, 24 Sep 26): "next time we revisit this again"** — put it to him again when Admin or the
section folds are next touched. (Its first half — the wave show/hide toggle leaving Admin — was done 30 Aug 26.)

- **QUEUED, awaiting the owner's go-ahead — an Admin "Display" area (owner,
  26 Aug 26; do NOT build without his confirmation).** Remove the wave
  Shown/Hidden toggle (`WAVEHIDE`) from Admin → Squadron config and replace it
  with a "Display" category holding per-section open/collapsed fold defaults,
  set separately for View schedule, Edit schedule and the Scheduler board —
  generalising the `PIOPEN` fold idiom to every section.

### [USER-GUIDE] A user guide for users and admins — wanted, not started, not urgent (moved from HANDOFF.md, 24 Sep 26)

- **A USER GUIDE is wanted, for users and admins** (owner, 10 Aug 26). Not
  started, not urgent. The half that can't be worked out by looking at the
  screen is already collected in `docs/remarks-vocabulary.md` — **keep that
  file true as rules are added.** Still to gather: the day/AL publishing flow,
  the roles split, what each warning means in practice, the phone gestures.

### [QUALS-MEMBER-SCOPE] May a member edit ANY row on the Quals page? — a question for him (moved from HANDOFF.md, 24 Sep 26)

**ANSWERED (D149, 24 Sep 26) — now a small build:** a member edits his OWN row only, and every column of it (SXO and
SCHEDULER included); an admin edits any row. The gate goes at the page and the write path, with a test per column;
permissions, so FULL tier. **Place:** any time, none blocking. The question as it was put:
  - **Member Quals-editing scope** — a member in Quals editing mode can tick/edit
    ANY row's table contents (callsign, CAT, SXO, SANS). The 5 Aug decision reads
    that as intended, but it sits oddly beside the Inputs page's own-row-only
    rule; if own-row-only quals is wanted, the gate belongs in the same three
    places the authority-sweep fix touched.

### [TRK-PALETTE-ASK] The Tracker's own dark palette, or Raptor's? — ask him once (filed 24 Sep 26)
**ANSWERED (D157, 24 Sep 26): Raptor's, FULLY** — backgrounds, text and the event colours (`tracker.css` variables and
`app/core.js` `TYPE_COLOR` / `GRADE_FILL`). Shown to him first as three versions of the real chart. LOOK tier plus a
phone look that the chart still reads at a glance. **Place:** any time, none blocking.
From the 7 Sep 26 device pass (`HANDOFF.md` §Open, "OWNER'S DEVICE PASS", archived 24 Sep 26 in
`raptor-port/docs/archive/handoff-2026-09-24.md`): one open question rode the retired bug-testing list's row
#376 — whether the Tracker keeps its own dark palette or takes Raptor's. It was recorded nowhere else. Ask him
once, in his next Tracker session; build nothing until he answers.

### [DOC-POINTERS-CODE] Code comments that point at documentation moved in the spring clean (filed 24 Sep 26)
**Place:** ride the next change that touches `raptor-port/src` anyway — a pointer-only edit there starts the full
check run on his PC (D89, D151), which a docs pass must not do. Every one of these still LANDS today, through a
signpost or an index left at the old place, so none is urgent; each should name the new home directly:
- `raptor-port/e2e/leavewar.spec.ts:2387` — "BUG-TESTING.md #371" → `raptor-port/docs/archive/BUG-TESTING.md`.
- `raptor-port/src/engine/audit-d-keyspace.test.ts:279` — "HANDOFF §Known issues" → `HANDOFF-ARCHIVE.md` (the frozen
  4 Sep snapshot; `HANDOFF.md` §Moved says so).
- `raptor-port/src/engine/overnight.test.ts:2` — "docs/session-state.md" → `raptor-port/docs/archive/session-state.md`.
- `raptor-port/src/ui/html.ts:1180` and `raptor-port/src/ui/latemark.test.tsx:13` — "§Stable decisions" (the late-input
  mark) → `.claude/rules/decisions/scheduler.md` §Settled before this list.
- `raptor-port/src/ui/AdminPage.tsx:240, 283` — "HANDOFF" (the caveat; the parked Power Apps end state) →
  `raptor-port/docs/architecture-direction.md` §Parked direction.
- `raptor-port/src/engine/hooks.ts:72` — "the file map" → `raptor-port/docs/file-map.md`.
- `raptor-port/src/testing/refwin.ts:578` — "HANDOFF.md records the same trap" → `raptor-port/docs/gates-and-deploy.md`.
- Comments citing a §Stable decisions sub-heading by name (e.g. §Drag-reordering in `canonical.ts`, §Week navigation
  in `weekglide.ts`) land through `raptor-port/CLAUDE.md` §Stable decisions → "Moved to the area files", which
  keeps every old name; point them at the area file when their file is next touched.
Found by `git grep` on 24 Sep 26 (the spring clean's red team, Fable finding 10, Astra finding 11).

### [PERF-RESIDUALS] Speed wins measured and deferred — two are his call (filed 24 Sep 26)
From `HANDOFF.md` §In flight (archived 24 Sep 26): several speed wins are measured and deferred — the seven
day-strings sort, the JS-bound drop, hover-boundary repaints, the `body.dnd` decorations, the one `validate`
call; two are the owner's call because they change wording or feel. The ledger and each one's measurement:
`raptor-port/docs/performance.md` (Part 2; §Dead ends says what not to retry). **Place:** when a speed complaint
or a board change comes near one of them; put the two that change wording or feel to him first.

### [RULINGS-LF-PIN] Pin the rulings files to LF line endings, with the next change that runs the checks (filed 24 Sep 26)
A leftover of `[DOC-TRIM]` (archived 24 Sep 26). `.gitattributes` pins `OUTSTANDING.md`, `OUTSTANDING-ARCHIVE.md`,
`DECISIONS.md` and `HANDOFF.md` to LF ([DOCS-GUARD] F4, 23 Sep 26), so no script or editor setting can rewrite every
line of them at once — a whole-file diff is where a destroyed record hides. The rulings split (D137) added
`DECISIONS-ARCHIVE.md` and the area files under `.claude/rules/decisions/`, which are NOT pinned; all of them are LF
today (checked 24 Sep 26 with `git ls-files --eol`). Add them — a pattern for the folder covers a new area file too.
**Place:** ride the next change that starts the full checks on his PC anyway: `.gitattributes` is not on the deploy
workflow's docs-only skip list, so a change to it alone starts a full run (D89, D151), which a docs pass must not do.

### [DOC-SUBHEADS] The long reference docs need sub-headings, so a chat can read one section (filed 24 Sep 26)
A leftover of `[DOC-TRIM]` (archived 24 Sep 26), which named it on 21 Sep 26 — `ui-contracts.md` "needs sub-heads so a
session can read one section" — and the spring clean did not do it. The rule it breaks is tier 2's in
`raptor-port/docs/doc-budget.md` §1: "no section over ~150 lines without sub-heads". Counted 24 Sep 26 (runs of over
150 lines with no heading line), all in `raptor-port/docs/`: `ui-contracts.md` 13 (the longest 469 lines),
`engine-rules.md` 5 (its §Validation runs 927 lines), `feature-impact.md` 1 (550), `performance.md` 1 (313). Adding
headings rewords nothing; anything more is a move (D138, `backlog-archive.mjs --move`). Docs only — no full check
run. **Place:** any time, none blocking; sooner if a chat has to read one of those sections whole.

### [BG-CWD-GUARD] A backgrounded npm command that starts at the repo root dies at once — guard it, don't re-warn (filed 24 Sep 26)
**HIS GO (D162, 24 Sep 26): build the hook.**
From the skills notebook, observation #42 (1 Sep 26), which the 23 Sep and 24 Sep reviews both judged a code or
config change, not a guide change (D146). A `run_in_background` shell starts at the REPO ROOT, where there is no
`package.json`, so a bare `npm run …` fails instantly — and the wrapper's exit code can read 0. The bold warning in
`raptor-port/CLAUDE.md` §Build & verify is text, and it has been broken three times. **The fix is structural:** a
`PreToolUse` hook (under `.claude/`, so no full check run) that refuses a backgrounded `npm` command without
`cd raptor-port`, or a root `package.json` whose scripts `cd raptor-port && npm run …` (it would start the full
checks and could change what Vercel detects). **Place:** any time, none blocking — but ask him first: a hook runs in
every chat, and it is standing configuration.

### [RULING-HOMES-AUDIT] Check once that each ruling's named home really carries it (filed 24 Sep 26)
Found in the 24 Sep 26 skills review (D146): D16 and D17 named `raptor-port/docs/bug-check-order.md` as their home,
and no commit had ever written them there (the review wrote them in). The document gate checks only that a named
home EXISTS — and, for a new row, that the change touched it — never that it carries the ruling. A read-only audit
the same day found 24 more rows whose named homes never mention their number: D5–D13, D53, D58, D63 (How we work);
D1–D3, D15, D28, D31, D32, D43, D52 (OIL); D39, D51 (Scheduler); D64 (Tracker). Most predate the numbering and carry
the content unnumbered (the 21 Sep bug-check rulings are the order's own text). **The job, docs only:** check each
by CONTENT once; write any that is missing into its home; add the D-number beside content that is there, so a later
audit is mechanical — then consider making the gate require a NEW row's document homes to cite its number.
**Place:** any time, none blocking.

### [PUCK-FLAG-GLOW] A red-flagged "View as" puck glows; no flagged puck should (his ask, D164, 24 Sep 26)
He sent two pictures: a red-flagged puck with a red glow (Ranger, the person being viewed as) and one without (Saber).
The glow comes from `raptor-port/src/ui/scheduler.css`: `.puck.me.boxred` and `.puck.me.boxdash` add
`0 0 10px 1px rgba(240,85,95,.7)` on top of the red ring when the View-as puck is flagged. **Do:** drop that glow, so
a flagged View-as puck shows the same plain red ring (solid or dashed) as every other flagged puck; keep the purple
"this is you" fill and ring. Read the precedence notes near `.puck.me` first (every puck rule carrying `!important`)
and walk both widths with a flagged View-as puck. LOOK tier on one shared puck rule — check every surface that draws
a puck. **Place:** any time, none blocking; a good one to ride the next scheduler change.

### [AMEND-PHONE-APPROVER] On a phone, who approved each amendment is shown nowhere — a question for him (24 Sep 26)
**DECIDED 25 Sep 26 — D102: the slim "Signed ALn" line (A) on View-only Sched, the board AND the edit week; B not taken.
To build with the D92 batch, including keeping the Original's signers.**
**Mock-up (25 Sep 26, his ask):** `raptor-port/docs/mock/amend-answers.html` §Question 3 (maker
`raptor-port/scripts/handpass/am/mk-view-signers.mjs`): A — one slim "Signed ALn" line under the day head on View-only
Sched (roles on desktop, names only on a phone); B — the ⓘ panel lists every version with its four signers. Asked: A+B
(recommended) or B only. **Build gap found:** an AL record keeps its signers (`SCHED.als[].sign`), the Original does
not — `setDayApproved` clears the sign-offs without keeping them (`raptor-port/src/engine/publish.ts`); the build stores
them on `SCHED.orig[di]`.
**ANSWERED 25 Sep 26 — D95, wider than asked:** View-only Sched shows who signed off each published version (the
original and every amendment), for everyone who reads it, compactly; a mock-up first, at his ask. The recommendation
below (the approver alone, in the ⓘ panel) is superseded by it.
Found by the amendment re-test's roll-call (`raptor-port/docs/handpass/2026-09-24-amendment.md` §4, R10; Fable 5-4).
The desktop's Amendments panel lists every issued amendment with its day, its item count and who APPROVED it (the
four signers in its tooltip) and the "N days with changes to publish" summary. On a phone (≤ 820px) that panel is
hidden on purpose (`raptor-port/src/ui/scheduler.css`, `@media (max-width:820px){.alpanel{display:none}}`); the
phone still has each day's own "N pending" and Publish AL button, and the ⓘ day panel lists the day's amendments
("AL1 · 1 item") — but without who approved them. **No ruling covers it either way.** **The question:** should the
phone show who approved each amendment? **The agent's recommendation:** yes, cheaply — add "approved by <callsign>"
to each amendment line in the ⓘ day panel (`dayInfoHTML`, `raptor-port/src/ui/html.ts`), which serves both widths;
keep the full panel desktop-only. One thing for him to weigh: the ⓘ panel is also open to members on View-only
Sched, so they would see the approver's callsign too (the desktop panel is the scheduler's page only). **Place:**
waiting on him; small once answered.

### [UNDO-ROSTER-SETTINGS] The one Undo does not cover roster or settings edits, though his 16 Sep 26 rule says it should (found 24 Sep 26)
Found by the amendment re-test's rule-to-test mapping (register AM39d,
`raptor-port/docs/superpowers/specs/2026-09-24-amendment-behaviour-register.md`). His 16 Sep 26 rule, recorded in the
command-layer design (`raptor-port/docs/superpowers/specs/2026-09-16-arch-stack-2-command-layer-design.md`): roster
and settings edits ARE undoable — ordinary user changes, never amendments. The "never amendments" half holds; the
"undoable" half is not built: the global undo's cutover lists only the schedule, the Leave War, inputs and plans
(`raptor-port/src/state/undo-wire.ts`, `setCutoverModules(['sched', 'lw', 'inputs', 'plan'])`), so adding a person,
renaming a callsign or changing a Logic setting cannot be undone. **Place:** the change-recording re-test (D147,
second after the absence record) — it is the one undo's own subject; build it there with D148 (undo only your own
changes). Walk it first: confirm on screen that Undo stays greyed or skips a roster / settings edit.

### [AMEND-TEMPLATE-PUBLISHED] A day template applied to a published day — a question for him (24 Sep 26)
**DECIDED 25 Sep 26 — D96 ("4 refuse"): refused on a published day, with the reason on screen; build it with the D92
batch.**
Found by the amendment re-test's walker W2 (`raptor-port/docs/handpass/parts/2026-09-24-amendment-w2.md` W2-F2). Applying a
day template to a published day rebuilds the day from the template's rows, and a template row is always a NEW row (a
copy strips its identity — `raptor-port/src/engine/daytpl.ts`), so: (1) saving Tuesday as a template and applying it
straight back reads **"31 changes · 15 removals"** for a day identical to what was issued — publishing that AL would
claim every row was removed and re-added (AM20, AM23: a mark means "differs from what was issued"); (2) the day's
ACCEPTED inputs (a Fly-with, a Meeting, an Appointment) are taken off the programme, because the template's rows carry
no link to them — members' accepted requests quietly leave the day. **The question:** on a published day, should
applying a template (a) be refused, (b) keep every row that matches what was issued and every accepted input, counting
only real differences, or (c) stay as it is (the day is rebuilt, and the amendment says so)? **The agent's
recommendation:** (b) — it keeps the amendment true and the members' requests on the programme; (a) is the cheap safe
answer if templates on a published day are rare. Undo puts the day back today, so nothing is lost by waiting.
**Place:** waiting on him.

### [AMEND-NYS-WORDING] "Not yet signed" beside four valid sign-offs — a wording question for him (24 Sep 26)
**DECIDED 25 Sep 26 — D97 ("5 ok"): two states, "Not yet signed" / "Not yet published"; build with the D92 batch.**
**25 Sep 26 — found while answering him:** the marker never looks at the sign-offs (`notYetSigned` = published AND
`dayHasChanges`), so it reads "Not yet signed" in the ORDINARY flow too — change, all four sign, not yet published.
Recommendation put to him: two states — "Not yet signed" while any of the four is missing, "Not yet published" once
all four are valid. Waiting on his word.
Found by the amendment re-test's walker W4 (`raptor-port/docs/handpass/parts/2026-09-24-amendment-w4.md` §3.5, P6). His
D45 (22 Sep 26) keeps the sign-offs valid when only who-is-available changes (a leave for a man behind an ALL AVAIL puck):
the day then shows "1 pending", four green sign-offs, an open "Publish AL1" — and, beside the tag, **"Not yet signed"**
(AM24, 16 Sep 26: the marker shows whenever a published day has unpublished changes). It is the rule working, but it
reads as a contradiction. **The question:** should the marker then read something else ("Not yet published"), or hide
while the sign-offs cover the change? **Kept as built until he answers.** Small either way (`nysMarkHTML`,
`raptor-port/src/ui/html.ts`; `notYetSigned`, `raptor-port/src/engine/publish.ts`). **Place:** waiting on him; ask
with the amendment re-test's look card.

### [AVAILWIN-PREVIEW-BAR] On the desktop board the ALL AVAIL window, opened from a preview, covers the preview bar (found 24 Sep 26)
Found by the amendment re-test's walker W2 (W2-F7). Saturday's board → plans selector → Original → tap the ALL AVAIL
count: the window docks top-right (`raptor-port/src/ui/scheduler.css`, its default right/top) exactly over the board's
preview bar — "Load onto working copy" hidden, "← Back to live copy" mostly covered. It can be dragged aside by its
grip; the week and the phone board are fine. **To do:** open it below the bar when the board is previewing (or dock
it clear of the bar always). LOOK tier. **Place:** low; with the next [ALL-AVAIL-WINDOW] or board change.

### [AMEND-SMALL-SEEN] Small things the amendment re-test saw in passing (24 Sep 26)
None breaks an amendment rule; each is a line to fix or ask about, from the walkers' reports
(`raptor-port/docs/handpass/parts/2026-09-24-amendment-w1.md` §5, `-w4.md` §6):
1. **Saturday's "Published AL1 · 14 items" toast** is replaced in the same instant by the OIL warning; the person only
   ever sees the warning. **Unpublish** says nothing at all (only the tag changes) — AM15b's principle would favour a word.
2. **Undo of a take-off time change** says "Undid: a note on the schedule" (AM39b: say what it did) — for the
   change-recording re-test, with [UNDO-ROSTER-SETTINGS].
3. **Five-letter callsigns** (VIPER, COBRA) drawn "…" in the edit week's callsign column; on the phone board they wrap
   ("VIP/R").
4. At 390px the solid **"AL1" tag** beside a time is clipped to "AL"; on the desktop week the **left scroll arrow** sits
   over the first sign-off pill of the leftmost day.
5. **AL7 and AL8** are the same orange; the register names no colour past AL7 (ask him if it matters).
6. **Leave War, phone:** a man's figure sheet sends the grid back to 1 January, and it stays there after the sheet
   closes (desktop keeps its place).
7. **Leave War bid sheet:** placing an LL bid on a weekend asks "That takes Fable to -1 ANNUAL", though a weekend LL
   charges nothing (his figure stays 0).
8. **A phone drag-off** removes a puck silently; right-click says "Fable removed".
9. **"Sort" on the ground programme** of a published day whose rows are kept out of time order moves them in the
   array without changing what is shown — and blanks the four sign-offs though "no changes to publish" (the final read,
   Fable #1's mirror; the digest keys ground rows by position). A false re-sign, never a false publish.
**Place:** any time; items 6–8 with the Leave War links re-test (D147, last).

### [BOARD-KEYBOARD-GAP] On a phone, typing on the board lets the schedule behind show above the keyboard (found 25 Sep 26)
Reported by him from the live app on his iPhone: *"when I click on the history button and I try to type on a text area as
shown, as the keyboard shows, u can see a small area of the edit or view only schedule behind the scheduler board."*
Picture: `raptor-port/docs/img/bugs/2026-09-25-board-keyboard-gap.png` — a Common Programme item name being typed on the
board; between the board and the keyboard a strip of the week behind shows (a 14:45–15:30 row with Wildcard). **Likely
cause, read from the code, not tried:** the board is `position:fixed; inset:0` (`raptor-port/src/ui/scheduler.css`
`.schedboard`), sized to the page, while the phone keyboard shrinks and pans the VISIBLE area, so the page behind can
scroll into the gap; other panels already follow the visible area (`window.visualViewport` in
`raptor-port/src/leavewar/ui/Sheet.tsx`, `raptor-port/src/ui/histbubble.ts`). **His mention of the History button:**
unclear whether History mode has to be on — reproduce both ways. **To do:** reproduce at phone size with the keyboard up
(or a shrunken visual viewport); make nothing behind the board ever show (hold the page behind still while the board is
open, or size the board to the visible area). LOOK tier, phone only. **Place:** with the board items; small.

### [PENDING-SUMMARY] Tap "N pending" to see what changed, by whom and when — his idea (25 Sep 26), waiting on his word
**ALL FOUR PARTS DECIDED 25 Sep 26:** (1) D103 any pending change wipes the sign-offs; (2) D99 + D100 the tappable,
scrolling list that jumps to each change (mock-up approved); (3) D104 callsigns wait for the database; (4) D105 the bubble
stays, hover or tap, scrolling when long. To build with the D92 batch — FULL tier (sign-offs, published records).
**Part (2) DECIDED 25 Sep 26 — D99: "N pending" is a button listing the day's waiting changes; tapping one takes the
view to it. Parts (1), (3), (4) still his; mock-up first.**
**APPROVED 25 Sep 26 — D100 ("looks good and function"); a long list scrolls inside the window.** **Mock-up (25 Sep 26):** `raptor-port/docs/mock/pending-list.html` (maker `raptor-port/scripts/handpass/am/mk-pending-list.mjs`)
— "N pending ▾" opens the net list (where, before → after, who, when; "earlier" where the record is gone), a tap jumps.
Part (3), asked 25 Sep 26 whether tracking by "View as" is worth it before the database: the agent recommended not.
His words: *"why dont we just wipe the sign offs for any changes to the schedule? And any type of change to that schedule
will show a pending. And the scheduler can click on pending and see a summary of what changed. by who & time. Would this
be like the edit history function? (except that im thinking of changing to seeing who the member callsign is instead of
just admin or member account, but if we just merge it into pending does it make sense? is it the same thing? And it
should also have the function that if i enable something i can still mouse over the portion of the schedule and see the
bubble popup"* … *"or click"*. **Four parts:** (1) every pending change wipes the sign-offs — this would replace D45's
signature half (today a change in who is behind ALL / ALL AVAIL, an edited request's times, or a Quals/posting change
shows pending but keeps the signatures); D45's freeze half stays; (2) tapping "N pending" opens the day's waiting changes
with who made each and when; (3) the author shown as the person's callsign, not the shared admin/member account; (4) the
History mode's bubble kept — hover on a desktop, tap on a phone. **The agent's answers, given in chat:** yes to all four
as one design; pending (the NET difference from what is published — change a time and back and nothing is pending) and
Edit history (every edit, in order) share one record, so the summary lists the net changes, each with its last author
and time from the history, and Edit history stays the full story. **Two limits to build around:** the edit log is kept
only while the page is open (by design until the database — `raptor-port/CLAUDE.md` §What actually persists), so
who/when is missing for changes made before a reload, except members' requests, which carry who filed them; and one
shared login per role means the app cannot know the person — the "View as" person can stand in until each person has
a login at the database step. **To do:** his word on each part, a mock-up first (the house rule for a visual
direction), then build with the amendment batch; parts (1) and (2) touch published records and sign-offs — FULL tier.
**Place:** before [AMEND-MARK-RING-CLASH]'s build, since both reshape the same day head and marks.

### [AMEND-MARK-RING-CLASH] On the edit surfaces an amendment mark on a puck hides its dashed or dotted warning ring (found 24 Sep 26)
Found by the amendment re-test's final code read (Fable #3). The edit week's and the board's AL-coloured mark for a
pending puck (`#eWeek .seat[data-aln] .puck`, `#schedBoard …`, `raptor-port/src/ui/scheduler.css`) is an outline on the
puck, and so are the sanctioned-late (dashed) and crew-rest trace (dotted) rings — the mark out-ranks them, so a
scheduler editing a published day does not see those two rings on a man whose seat has an unpublished change. The same
clash on the VIEW page was fixed in the re-test (its neutral hint moved onto the seat around the puck); the edit
surfaces' mark is an established look (`raptor-port/docs/ui-contracts.md` §Amendment marks), so moving it is a visual
change to show him first. **Examples shown 24 Sep 26, at his ask** — `raptor-port/docs/mock/amend-seat-marks.html`, three
situations the app itself produced (a swap, a late show, an everyday change), its maker
`raptor-port/scripts/handpass/am/mk-seat-marks.mjs` (the CSS as `B_CSS`, in `mk-seat-marks-lib.mjs`), and — at his second
ask — a busy Monday with AL1–AL3 out and AL4 waiting (`mk-seat-marks-busy.mjs`). **The fix is now D92 (his, 24 Sep 26) — design C:** a
changed puck is marked by its ALn tag only, never a ring — solid once out (today's tag), hollow and dotted while waiting
— so a puck's edge carries only warnings; the published ring `.seat[data-alc] .puck` and the waiting outline
`#eWeek/#schedBoard .seat[data-aln] .puck` go, a hollow `.seat[data-aln]::after` tag comes in (`C_CSS`); times, areas and
remarks keep their marks. **Why, measured:** the published ring covers the thin amber (advisory), grey (note) and thin red
`.warn` rings today (Tally at AL3 in the busy day), and the waiting outline's `box-shadow:none` wipes them too. Design B
(the waiting outline kept except where a ring competes) was superseded by D92 the same day. It reaches View-only Sched
(the squadron's published face), so the bug-check order sets the tier at build. **Design A** (the
first mock-up: the mark moved onto the seat) was dropped on measurement — a seat is exactly its puck's 74×15 box and a
crew pair sits 3px apart, so at real size (DPR 1) the mark and a dotted ring sit half a pixel apart and blur into one,
and any larger offset runs into the next puck. The view page's neutral hint, moved onto the seat by the re-test, has
A's geometry: check it where it can meet a ring when B is built. **Design APPROVED 24 Sep 26 (D93, "the fix looks good").** **To do:** build D92 on every surface that
draws a changed puck, with a geometry pin (e2e) that every ring's stroke survives a published and a waiting change. **Place:** next, on
his word (the mock-up's other half, a mark for an emptied seat, was declined — D91).

### [BOARD-RING-STROKES] The board draws every warning ring solid: no dashed late show, no dotted crew-rest cause (found 24 Sep 26)
**DECIDED 25 Sep 26 — D94 ("1. yes"): the board draws all three rings as the week does; build it with the D92 batch.**
Found while making the examples for [AMEND-MARK-RING-CLASH] (the mock-up's "Also found"). **What a person sees:** on the edit
week a crew-rest breach sanctioned by a LATE SHOW remark rings DASHED, and the day that causes tomorrow's breach rings
DOTTED — `raptor-port/docs/ui-contracts.md` §Three crew-rest rings, "on every puck of that man on the causing day". On
the scheduler board the same man rings SOLID for the sanctioned breach and carries no ring at all on the causing day.
**Why:** the board's seat builders call `puck()` with `dash=false, trace=null` (`raptor-port/src/ui/board-html.ts`), so
the two strokes never reach it; no comment, contract line or ruling found says that is deliberate. **Recommendation, put
to him on the mock-up page:** make the board match the week (pass the day's dash and trace as the week's builder does;
the geometry gate already measures the rings). LOOK tier. **Place:** after [AMEND-MARK-RING-CLASH]; waiting on his word.

### [AMEND-LOAD-FILING] Should "Load onto working copy" also put back an input the scheduler had taken off? — a question for him (24 Sep 26)
**DECIDED 25 Sep 26 — D98 (his AM20 principle: back to what was published = nothing pending): the load puts the request
back too; build with the D92 batch.**
**Example shown (25 Sep 26, his ask "can u explain with examples or mock ups?"):** `raptor-port/docs/mock/amend-answers.html`
§Question 7 (maker `raptor-port/scripts/handpass/am/mk-load-input.mjs`) — the real flow, three steps; waiting on his word.
Found by the amendment re-test (walker W4, F3: `raptor-port/docs/handpass/parts/2026-09-24-amendment-w4.md`; the final
read, Fable #2). **Today, by design** (`raptor-port/src/engine/publish.ts` `dayDiscardCount`, P2-REREVIEW-08): a load
puts back the version's CONTENT and leaves every input's filing as it is. So: take an input off a published day (its
row goes, the input reads "removed"), then Load AL1 — the row comes back from AL1, but the input still reads
"removed", and the day shows "1 pending · 1 input filing" against the very version just loaded. Its "→ Ground" used
to do nothing at all; since the re-test it says the input is already on the programme. The way back today, read from the code (not walked): delete that ground row, then Accept the input — it should re-land as the issued row, and the day read as issued. **The question:** should a load
also put such an input back on (the day then matches the loaded version exactly), or leave it removed AND leave its
row off? **The agent's recommendation:** put it back on, as the version recorded it — "Load AL1" then means the day
as AL1 was — and count it in the load's confirm ("N edits replaced"). **Careful when building:** the first attempt did
it inside the general filing reconcile and, as Fable's read showed, a plan switched away and back then turned a
deliberate removal into a fresh input that flags; do it in the load alone, from the version's own filing record
(`snap.fil`). **Place:** waiting on him.
