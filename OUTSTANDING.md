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
   - **[AMEND-SEL-FOLLOWUPS] — DONE + LIVE (merged 15 Sep 26, PR #405).** Archived — the
     resolution is in `OUTSTANDING-ARCHIVE.md`. The 7 changes (incl. the signature-leak bug, taken the
     per-plan way) were built, cross-provider bug-checked, and merged to `main`.
   - **[REPO-CLEANUP] (owner, 15 Sep 26) — DONE (18 Sep 26). Nothing removed, by owner's choice.**
     Step 1 (delete the handoff screenshots) was done earlier. Step 2, the repo-wide space/
     redundancy sweep, was RUN this session and found the repo already tidy — so do NOT re-run it:
     **zero dead source files** (all 522 checked by an import-graph scan), and only **~0.9 KB** of
     genuinely-dead CSS (every other unused-looking class is built dynamically at runtime, e.g.
     `seat-${seat}`, the `g-*` group family — removing them would break the app). The only real
     weight was **~0.6 MB of design write-ups for already-shipped features**; the owner chose to
     **KEEP them on purpose** — better for history-keeping (a note left in the tree is browsable;
     a git-deleted one is only recoverable if you know it existed). No files removed. Archived 24 Sep 26 —
     the full result is in `OUTSTANDING-ARCHIVE.md`.
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
**TOP OF THE QUEUE (updated 23 Sep 26).** **[OIL-AUTO-REMOVE] AND [OIL-SEATS-CAN-EARN] ARE BOTH
MERGED AND LIVE.**
1) **[ALL-AVAIL-WINDOW]** — **LIVE on `main` (23 Sep 26)**, after his look on Vercel and his "merge live"; no phone
resize corner (D77). Archived 24 Sep 26; the built contract is `raptor-port/docs/ui-contracts.md`
§[ALL-AVAIL-WINDOW]. 2) **[DOCS-GUARD]** LIVE 23 Sep 26 (archived);
nothing left. 3) **[HUMAN-RETEST]** — the Tracker part MERGED 23 Sep 26 (his look done); the amendment system next. 4) **[DOC-TRIM]** — unblocked now that the OIL scaffolding has become
archive. 5) The stack resumes at **[DB-STEP]**.
**Small OIL follow-ups, any time, none blocking:** `[OIL-READ-LEFTOVERS]` (4 items the final reads
raised and the branch deliberately left), `[STORE-READER-SWEEP]`, `[OIL-REQ-NAMEBOX]`,
`[POSTOUT-LOST]`'s remaining half, `[OIL-WORDS]`, and from the window's bug check
`[OIL-PERSONAL-PLACEHOLDER]` and `[CROWD-SIM-BRIEF]` (both further down this file).
`[LW-MONTHJUMP-PHONE]` and `[LW-HBAR-RESYNC]` — FIXED on `claude/lw-monthjump-phone` (PR #428) with the
owner's filmed frozen-bar jump, and archived; MERGED to `main` 23 Sep 26 on his "merge live" (look done). Left from it:
`[LW-FROZEN-BAR-GAP]` (a one-frame blink, further down this file). **Tracker, 23 Sep 26 (night):** his
pinch-zoom report is FIXED and MERGED on his "merge live" (`claude/tracker-pinch-anchor`, walked, gates green);
filed from it `[TRK-PINCH-DRAGS-BALL]` (with his "left side cut off" report — FULL-tier checked and MERGED 24 Sep 26 on D133, archived; left from it `[TRK-PINCH-ASK]`), `[TRK-EDIT-SIDEWAYS]`, `[TRK-TAP-AFTER-DRAG]`. `[CI-TWO-CORES]` — DONE and
archived: the checks run on his PC as a Windows service, its folder permissions tightened.

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
5. ~~**[TRK-CSID]** / **[INP-CSID]**~~ — **DONE + LIVE (13–14 Sep 26), both archived.** Was: the stable-id work (Tracker courses/syllabuses;
   schedule personal inputs); independent, medium, not urgent.
6. **[TRK-ATTEMPTS]** — small new feature, low urgency.
7. **[RECALL]** — future feature (fresh recall from archive); design when reached.
7a. **[CMDL-FINISH] — DONE + LIVE (18 Sep 26, PR #412 build + PR #415 finish).** The one command
   layer is finished for **Leave War + Tracker** (causal both-side envelope, per-record write seam,
   one-envelope-per-Tracker-gesture, guarded lw/trk stores, `TRK_RESTORING`, `sched.als` re-key,
   cross-provider punch-list). DONE + LIVE — archived 24 Sep 26 (`OUTSTANDING-ARCHIVE.md`). Its two deferred items fold
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
`claude/oil-auto-remove-design`, MERGED 22 Sep 26 (D34); `[ALL-AVAIL-REDEF]` archived 24 Sep 26. The line that stood here
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
- **[CMDL-FINISH] — Finish the shared foundation for Leave War + Tracker. DONE + LIVE 18 Sep 26 (archived).**
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
- **[INP-CSID] — Give leave/personal inputs a permanent hidden tag. DONE 13 Sep 26 (archived).** Like schedule rows and
  students already have, so two look-alike entries can't cross when one is deleted.
- **[TRK-CSID] — Give courses and syllabuses a permanent hidden tag. DONE + LIVE 13–14 Sep 26 (archived).** Students and
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

### [S4-BUGHUNT-MERGED] MERGED to main (PR #422, 21 Sep 26) — 34 commits. Kept for what it SET ASIDE.
**Read `raptor-port/docs/archive/HANDOFF-S4-BUGHUNT.md` (archived 24 Sep 26), then `raptor-port/docs/superpowers/specs/2026-09-20-CURRENT-STATE.md`
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
- **TWO OWNER RULINGS — BUILT 21 Sep 26** (D80/D81, register N13/N14;
  `specs/2026-09-20-NEXT-TASK-oil-award-and-oil-warning.md` is the record): (1) an OIL AWARD stops flagging a leave day (he did
  NOT rule on `duty` — ask), and (2) warn, on the day AND at publish, when a worked weekend earns
  nobody anything because the duty desk has no times. The second came from him testing DASH on SDO
  for Sun 16 Aug and getting no credit.
- **Both things that were to be put to the owner are ANSWERED AND BUILT.** The ruling to carry
  forward: **OIL may be credited by hand on ANY day** — the weekend/public-holiday restriction
  belongs to the AUTOMATIC pass, which reads the published schedule, not to a credit the squadron
  types itself (D79, register N11).

### [DOC-TRIM] The repo is too heavy to read (owner, 21 Sep 26 — D14)
**THE RULINGS AND THE BACKLOG PASS — DONE 24 Sep 26 (D136 + D137; checked by Fable and Astra).** The rulings are split by
area into `.claude/rules/decisions/` — How we work loads in every session, each other area by itself when its files are
read — with `DECISIONS.md` as the map and replaced/spent rulings in `DECISIONS-ARCHIVE.md`; 14 finished items left this
file (1,479 → ~1,200 lines). **Left here:** `raptor-port/CLAUDE.md` 1,543 → 500 and `HANDOFF.md` 983 → 400 (below);
this file → 600 (the priority list and the plain-terms block rewritten to live items only); and pin the new rulings
files' line endings to LF in `.gitattributes`, like `DECISIONS.md` — held back to ride the next code change, because
a `.gitattributes` change alone starts a full check run on his PC.
**THE SPRING CLEAN — measured and planned 24 Sep 26, NEXT (recommended BEFORE the amendment re-test; his word to start).**
His ask: every session loads too much; make the repo clear and directed, cut clutter, and a summary must never change
the meaning (**D138**). **Measured:** a session reads ~120k tokens before it works — always loaded ~18k (the rule files
~5k, the general rulings ~11k, the memory index ~2k), `raptor-port/CLAUDE.md` ~29k (loads with any raptor-port file),
`HANDOFF.md` ~46k and this file ~24k (read at start). **Disk:** the folder is 1.5 GB — 934 MB is four OLD worktrees in
`.claude/worktrees/` (all merged into `main`; the one with "224 changes" holds only deleted copies of `.claude` files),
`node_modules` 151 MB (needed; `npm ci` rebuilds it), the evidence pictures 160 MB (`docs/img/handpass`, 1,256 files, in
git), `.git` 178 MB (48 MB unpacked). GitHub's copy is ~125 MB; only a fresh single-commit repo ([REPO-PRIVATE]) shrinks it.
**The plan, in order — MOVE text whole, never reword it (D138):**
1. **Disk, ~5 min, needs his yes:** `git worktree remove` the four old worktrees + `git worktree prune`, delete the three
   ignored `.log` files, `git gc`. Frees ~0.95 GB on his PC; nothing in git changes.
2. **`raptor-port/CLAUDE.md` ~29k → ~8k:** move §Stable decisions (the pre-21-Sep rulings) verbatim into the area rulings
   files as a dated "before this list" section each (the Leave War roster → `leave-war.md`; board, waves, drag, time, week
   navigation, inputs & admin, the late-input mark, performance → `scheduler.md`), and the long Leave War / Tracker
   architecture paragraphs likewise — they then load only when that area is touched. Cross-cutting ones (pipeline & repo
   invariants) stay always-loaded. Raise those files' ceilings with the reason (D136).
3. **`HANDOFF.md` ~46k → ~10k (400 lines):** current state only; resolved stories MOVED to `HANDOFF-ARCHIVE.md`; the deploy
   traps to a tier-2 doc; `[DEPLOY-DOCS]`'s Pages-era text corrected.
4. **This file ~24k → ~12k (600 lines):** the priority list and plain-terms block rewritten to live items only — the old
   block MOVED to the archive whole.
5. **Root tidy:** the closed handoffs (`HANDOFF-OIL-WALK.md`, `HANDOFF-S4-BUGHUNT.md`) and the retired `BUG-TESTING.md` into
   an archive folder, every pointer updated.
6. **Leave the evidence pictures** (sessions never read them; git keeps them anyway; the [REPO-CLEANUP] keep ruling).
7. **Checks:** `docsize` green; **Fable and Astra each given every before/after pair, asked only whether any rule,
   condition, date or reason changed or vanished** (D138). Target ~120k → ~45–50k per session start. ~3–4 h, 1–2 sessions.
   **D139 (24 Sep 26):** for this job, Opus 5.5 and Fable 5.1 may be spent freely on the work and the reviews, Astra
   reviews (about half its allowance left, fine) — never the model that wrote a thing checking it.
**His words: "theres going to be alot of context for the AI to read ... reading so much context
as an AI it starts to hallucinate."** Measured that day: **1,830 lines loaded every session**
whatever the task, plus **2,228 more** at session start. `HANDOFF.md` states its own 550-line
ceiling inside itself and had reached 961.

- **Policy and tiers: `raptor-port/docs/doc-budget.md`. Gate: `npm run docsize`.** Ceilings keep
  declared headroom and move only in a docs-only commit (corrected 23 Sep 26 — the zero-headroom
  ratchet was withdrawn, D29). This item is the reduction, and it is a DOCS-ONLY pass.
- **The one change worth doing FIRST, and on its own** (~30–45 min, compounding on every later
  session): `CLAUDE.md` is 1,539 lines and is loaded every time. Most of that is §Stable
  decisions — historical rulings, which are tier-2 reference, not tier-0 index. Move them to
  `docs/stable-decisions.md` and leave ONE line per topic pointing in. Target ~500 lines.
  Careful work: that section is the project's memory of what must not be relitigated, so move
  it wholesale, verify nothing is dropped, then lower the ceiling — leaving headroom, never to zero.
- **Then:** `HANDOFF.md` 961 → 400 (current state only; the stories belong in commit messages).
  **Its "Open / deferred / queued" section is NOT a backlog** ([DOCS-GUARD] F7, 23 Sep 26): empty
  it into this file item by item — each open thing becomes an item here or a line in a tier-2 doc —
  so there is ONE backlog to guard, not two;
  `OUTSTANDING.md` 1,210 → 600 (done items out, one short block per live item); `ui-contracts.md`
  is 7,095 lines and needs no budget but does need sub-heads so a session can read one section.
- **The writing rule that stops it recurring** is in `doc-budget.md` §2: record the DECISION,
  not the transcript. Quote him only where the exact words are load-bearing; never quote the
  same words in two files; a reason earns its place only if it would change a future decision.
  This does NOT thin the reasoning — that is the plain-language rule and it still holds. It
  stops saying the same thing three times.
- **Move finished items with `node raptor-port/scripts/backlog-archive.mjs <ID> --homes <file>`**,
  never by hand or by a one-off script. (The old "prune on write" is withdrawn — D29 rule 3.)

### [HUMAN-RETEST] Re-test the earlier builds the way a person uses them (owner, 21 Sep 26)
**ORDER (D85 + D86, 23 Sep 26): TWO CHATS IN PARALLEL — THE TRACKER and THE AMENDMENT SYSTEM**, one
feature per chat. Amendment chat: port 4173, rulings from D90. Tracker chat: port 4180, rulings from
D120. Never two full gate runs at once (false failures under load). The order of the other three
(change-recording, the absence record, the Leave War links) is not ruled: propose it and ask.
**D153 (23 Sep 26): the TRACKER chat starts NOW, on its own worktree from `main`, beside the Leave War
fix on `claude/lw-monthjump-phone`** — which still merges FIRST. Tracker chat: preview 4180, e2e
`E2E_PORT=4182`, smoke `SMOKE_PORT=4181`, rulings from D120; never a full gate run while the Leave War
chat or the PC runner (`gh run list`) is mid-run. **D154: a third chat builds a presentation to
commanders and a demo video** on its own worktree (preview 4185, rulings from D170); D58 holds for the
deck/video. **D155: the Tracker chat is PAUSED** at its own handoff — the demo video first (the Leave War
fixes are live on `main`); it resumes on his word, bringing `main` in first (D78).
**D135 (24 Sep 26): the demo is DONE** — the PC is no longer shared with it; D86's one-full-run-at-a-time stands.
**D125 (23 Sep 26): the Tracker chat RESUMES** beside the demo chat, on `claude/tracker-human-retest-8d3411`
(`main` merged in) — the demo has first call on the PC: heavy runs one at a time, only on a quiet PC, and the
Tracker pauses at its next clean point if the demo slows.
**THE TRACKER PART IS DONE — MERGED to `main` 23 Sep 26 on his "merge live", after his look** (evidence
`raptor-port/docs/handpass/2026-09-23-tracker.md`; rulings D120–D132). Next here: the amendment system (D86), then the three.
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

`raptor-port/CLAUDE.md` §Build & verify and §How to work here, and `HANDOFF.md` §Deploy, still describe GitHub Pages as the official live site, the "done means live" chain ending at Pages, and `seejiaokai.github.io/Raptor` as the page to check. All of it stopped being true on 23 Sep 26: Pages is gone, the publish job is off, Vercel is the only viewer. Marked SUPERSEDED in place at the two most misleading lines; the proper rewrite is its own docs pass (D29 — never trim inside another change). **Tier: NONE.** Do it with `[DOC-TRIM]`, which owns the same two files.

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

### [POSTOUT-LOST] A posted-out man walks back into the squadron on a reload — **FIXED 22 Sep 26 on `claude/oil-seats-can-earn`** (not merged)

**FIXED, because it caused TWO of the five defects the OIL walk left open** — the day that reopens
asking for an amendment nobody made, and the count chip that says one more man than the war pays.
Measured side by side they are one fault: the issued day froze 27 men behind the placeholder, the
reload gave the live copy 28, and the difference is the man who left in January. The OIL code was
doing exactly what D44/D45 say. Deferring this last session was right on the evidence then and
wrong once the cause was measured. **The fix:** a posting window arriving ON the projected person
is recorded in the store's own posting record, in the body that already lays that record back on
(`leavewar/state/store.ts` `setPeople`) — so a window with no record behind it is a state the store
cannot be left in. Pinned by `src/leavewar/postout-persist.test.ts` (4 new cases, red first);
re-walked by `scripts/handpass/rw-03-pending-and-count.mjs`, four days, all clean. Full story:
`raptor-port/docs/handpass/2026-09-22-oil-seats.md` §6a.

**STILL OPEN, and still this item's:** the seed flies that man in July while the demo posts him out
in January. He is reliably posted out now, so the contradiction is STABLE rather than intermittent.
Demo data, breaks nothing; the dev-phase ruling says clear it rather than migrate. Decide it when
the demo seed is next touched. *The original entry:* the window was written onto the person by the
demo overlay and never saved, so after any reload he was available again — reaching the crew picker,
ALL AVAIL, the manning counts and every rule that asks who is free.

**Context.** `raptor-port/docs/handpass/2026-09-21-oil.md` §9 · the red team's §3 in
`…/specs/2026-09-21-oil-fixplan-redteam-fable.md` · script `scripts/handpass/settle-d4.mjs`.

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

### [LW-WEEKDAY-WORK] The Leave War cannot see ordinary weekday work — OPEN, needs the owner first (21 Sep 26)
Its place in the order and the one-paragraph description are item 3 of `[BACKLOG-ORDER]` above.
Given a heading 23 Sep 26 ([DOCS-GUARD] F5) so the document gate counts it — it had been named in
his order without ever having an item of its own. **Talk to him before building any of it.**

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

### [TRK-TAP-AFTER-DRAG] The first tap on a button after dragging or pinching the chart does nothing (23 Sep 26)
**Place:** ask him first — seen only in the test browser's touch emulation, not yet on a real iPhone. Straight
after a one-finger drag or a pinch on the chart, the first tap on − (or the ✎ menu) is lost; the second works.
The finger's down and up both reach the button, but no press follows. Same on the live code before the pinch
fix; a mouse click is fine (F-D in `raptor-port/docs/handpass/2026-09-23-tracker-pinch.md`). If he has
never noticed it on his phone, close it as an emulation quirk.

### [TRK-BAKE-STALE] The chart-baking script no longer runs (found 23 Sep 26)
`raptor-port/scripts/tracker/bake-user-charts.mjs` resolves `src/data/…` from `scripts/` (the folder
does not exist — the data is `src/tracker/data/`), reads name-keyed charts (before the 13 Sep ids) and
the one-table `eventInfo` (before D126). The D120 route (export → wipe → import) does not need it; fix
it only if baking a chart into the shipped data comes back. **Place:** low, after `[TRK-RETEST-NOTES]`.

### [DOCSGUARD-MERGE] The docs guard reads a merged branch's pre-merge history as its own moves (23 Sep 26)
`npm run docsize` walks every commit since the base that touched `OUTSTANDING.md`. On a branch that
merged `main` in (D78), that includes the branch's commits from BEFORE the merge, whose copy of an item
`main` later rewrote and archived — so it reports "left OUTSTANDING.md but N lines did not arrive" for
a move that happened, and was checked, on `main` (`[LW-MONTHJUMP-PHONE]` on the Tracker branch). The
Tracker branch records it with the guard's own `Docs-guard-allow:` trailer. **Fix, not done here (a
gate is not edited to pass a change):** skip an item already archived AT THE BASE — its move was
checked on the base's own history. **Place:** before the next branch that merges `main` in.

