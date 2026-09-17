# Session handoff — [ARCH-STACK] f/u #1 scheduler routing BUILT + gated + live-driven (Rev 3, NOT merged); P5 code inspection running

## THE STATE (owner session, 17 Sep 26 pt.4): follow-up #1 is BUILT — round 2 done, Rev 3, P1–P4 landed as one change, awaiting "merge live"

**Branch to select in the new-chat picker:** `claude/arch-stack-2-command-core-design`. NOT `main`.
Everything below is committed on it and NOT merged.

**What was done this session (commits on the branch):**
- `3a565c2` — plan → **Rev 3**: folded all 11 round-2 findings (Codex GPT-6 Astra + Fable 5.1, both
  REVISE, approach affirmed a SECOND time). Two NEW HIGH (SR-008 fix was wrong → non-mutating `signAt`
  readers; two stores-loadout writes escaped the backstop) + a wrong `isInReducer` fork + text-drop +
  exactness/doc items. Full disposition table in the review-log's Round-2 section.
- `d8ec03b` — **the BUILD (Rev 3, P1–P4 as one gated change).** Lagging `SCHED_BASELINE` (copy the
  People pattern); `decompose(snapshot)`; `signature()` stays live; `applyEnd` folded into commitSched
  AND commitPublish; re-sync callback in `history.ts` (histInit/histRestore) + explicit `resetSession`
  + demo-overlay calls; the approved `commit.ts guardSnapshot` edit; non-mutating `signAt`; explicit
  `schedWrite` at text/sign/warn/draft/stores; the `afterSchedMutate` backstop via `HOOKS.schedEpilogue`;
  popup lazy-init fixed; `schedBaselineClean()` guardrail; probe-bridge stream reader.
  Gates: **vitest 4877/4877** (9 new routing tests, `src/state/sched-routing.test.ts`) · **parity 728/0**
  · build green. **Live drive on the real bundle PASSED**: a real inline text edit emitted one
  `sched.text`, a real board add emitted one `sched.mutate`, baseline clean throughout, no console/HTTP
  errors, board renders correctly.
- `fa85422` — **[TRK-SMOKE] hardened** the add-student smoke step (test-only): confirm the typed name
  landed before OK (no silent-blank submit) + raise the after-OK wait 15s→30s. The earlier "flake" this
  session was pure machine CONTENTION (smoke run straight after the e2e suite); smoke is 425/0 in
  isolation ×3 and 425/0 run right after e2e now.

**Two PRE-EXISTING e2e failures (NOT from this work, unrelated to the scheduler change):**
`geometry.spec.ts:1976` (board brief-inline at phone width — PROVEN to fail identically on the clean
tree) and `leavewar.spec.ts:2241` (lw-phone CDP touch-tap timing — passed with this code then flaked
under load). They are the branch's known "2 pre-existing e2e failures". They are RED, so a green-CI
merge needs them fixed or re-run — a SEPARATE job from the scheduler change.

- `12b527f` — **P5 code inspection findings FIXED.** Codex GPT-6 Astra + Fable both inspected the built
  `d8ec03b` diff (read-only), affirmed the mechanism, and returned REVISE with a small convergent set,
  all fixed: **F-01** (Fable, the real one — `histInit` notified before re-syncing + `loadWeek`'s
  landing-pass mid-swap notify → a listener command diffed the OLD week; fixed by re-syncing before the
  notify in `histInit` and at the week-swap, pinned by a test verified to fail without the fix); the
  backstop now always opens a command (SR-I-001); the bombs stores-text box no longer inits `a.opts` on
  blur (SR-I-003); `commitText()` runs the issued-mark reconcile inside each text command (SR-I-002);
  a "couldn't save" toast on a rejected command (F-04, inert at Step 2); a doc fix (F-06). Full table:
  the review-log's **P5** section.
  Gates after fixes: **vitest 4878/4878** · **parity 728/0** · build green · live drive re-run clean.

**STATUS: DONE + gated, awaiting the owner's explicit "merge live".** The scheduler routing change is
complete — plan twice red-teamed, code inspected by both providers, every finding fixed, all gates
green, driven live on the real bundle. Do NOT merge before the owner says "merge live". Do NOT open/
watch a PR.

**[TRK-SMOKE] earlier context (still true):** FIXED + MERGED LIVE 17 Sep (PR #408, squash `93deab7` on
`main`). This branch was synced with `main` after that, so it contains the fix; `fa85422` above only
adds test-robustness on top.

**PLAIN LANGUAGE — the owner raised this explicitly on 17 Sep 26.** He had to ask three times for a
reply to be re-explained without jargon, said it read as possibly made up, and switched model over
it. `.claude/rules/plain-language.md` now ends with a mechanical pre-send check — **run it on every
message.** The drift is worst in long, dense replies late in a session. It is not his
comprehension; it is our writing.

## (done 17 Sep 26) The correctness sweep — TWO ROUNDS, plus three owner rulings

**The correctness sweep the owner ordered is DONE, and has had its own cross-provider round 2**
(commits `94b1d37`, `fb4250e`, `e9a11d8`; same branch, not merged). Do not redo it.

**Round 2 result:** both providers REVISE. 21 of 22 claims confirmed, **16 further defects found
and fixed**. The worst: the engine-rules §Version snapshots section that round 1 edited still
described THREE more removed functions (`reissueReopened`, `unpublishAL`, `publishAL`) as live,
plus two superseded record shapes — one of which would have made a database serializer quarantine
every week it wrote. **Standing lesson, now in the sweep doc: when a sweep finds deleted machinery
described as live, the unit of repair is the SECTION, not the sentence.**

**TWO OWNER DECISIONS ARE OPEN (ask first thing):**
1. **The disclosure gap** (design spec §9 question 4, sweep doc §F). The set of issued versions
   that have LEFT the machine is in memory, so an amendment exported as a PDF reads as
   never-disclosed after a reload — and Step 3 chooses silent-reverse vs on-the-record withdrawal
   from exactly that signal. Inert today. Recommendation: fail safe (treat every issued id
   hydrated from storage as disclosed).
2. **The tracker smoke gate.** It has failed three times running on clean code. Spec §1 makes
   smoke green non-negotiable per phase, so before the follow-up #1 build it needs diagnosing or
   an explicit owner waiver. Do NOT wave it through.

What the sweep produced:

- **`docs/superpowers/specs/2026-09-17-doc-correctness-sweep.md`** — the claims → evidence table
  (22 findings, each naming the code file that proves it), the two mechanical passes that found the
  worst of them, and an explicit list of what was set aside. **Read this before touching any doc.**
- The Rev-5 design spec carries a **Rev 5.1** block: nine wrong facts fixed, plus four places the
  BUILD knowingly diverged from the design (toast/edit-log latching never wired, permissions
  permissive, the LW store unguarded, the LW join deferred). Believe the code over the prose there.
- **The follow-up #1 plan is now Rev 2**, folding all 12 accepted round-1 findings, with a table
  mapping each finding to the section that answers it. It also carries one defect the round-1
  reviewers missed: `ui/textedit.ts:txtCommit` defers `afterSchedMutate()` by a `setTimeout(0)`, so
  a command landing in that gap mis-attributes the text change (plan §6 risk 5).
- Biggest single find: `engine-rules.md` described **`restoreDayVersion`** as live in nine places.
  It was REMOVED at Phase 2 and its replacement inverts the key behaviour. Quoted dead in place.

### Next steps, in order
1. **The owner still owes two answers** (plan §9): may Rev 2 edit committed Step-2 core
   (`commit.ts guardSnapshot`)? and accept SR-003 as a documented Step-2 limitation?
2. **Round-2 cross-provider red-team** of the Rev-2 plan — and, separately and cheaply, hand BOTH
   providers the sweep's claims table with the instruction in its §D: *open the code and tell me
   which rows I got wrong*. Never "review these documents" — that is the method that already failed.
3. Then BUILD test-first, **P1–P4 as ONE gated change** (F9), parity 728/0, live drive by the session.

Gates at the sweep's commit: vitest 4865/4865 · parity 728/0 · build green.
**Not merged. Do not merge until the owner says "merge live." Do not watch or open a PR.**

---

## READ THIS FIRST (17 Sep 26 pt.3 — what the rest of that day did, so you don't redo it)

**The MAIN job is unchanged and is the block below: [ARCH-STACK] follow-up #1, plan written,
round 1 of the red-team done, needs a Rev-2 + round 2 and then the build. NO production code
for it has been written.** After the pt.2 handoff the owner diverted onto instruction/config
work; all of it is committed and pushed on the same branch. Do not re-derive it:

- **Two rules files added** (`.claude/rules/`, which Claude Code DOES auto-load — verified
  against the changelog; an earlier claim that it does not was wrong):
  `plain-language.md` (unscoped → loads every session; the owner's no-jargon rules) and
  `raptor-executor.md` (`paths:`-scoped to raptor-port src/e2e/probes/scripts → loads while
  implementing; approved-spec discipline, verification without self-approval, review integrity,
  the Status/Changes/Checks/Open-items closing report). Both are pointed at from CLAUDE.md's
  "Where things live". Commits `519cc77`, `a1f97e3`.
- **CLAUDE.md + HANDOFF + routed docs: three correctness passes** (`ade901b`, `be88259`,
  `1753e33`, `2f12b86`) from a Fable + Codex cross-provider review of the instruction files.
  Highlights: the SUPERSEDED auto-merge chain that got a fix merged without the owner on
  9 Sep was still reading as LIVE in three places (plus a fourth in HANDOFF) and is now quoted
  dead; a whole family of stale "session-only / a reload forgets" claims was corrected in
  CLAUDE.md, HANDOFF.md, architecture-direction.md, leavewar/known-gaps.md, ui-contracts.md and
  data-schema.md (the app PERSISTS on a built site — CLAUDE.md §Architecture rules now carries
  one authoritative "WHAT ACTUALLY PERSISTS" ledger); the browser-testing instructions were
  actively WRONG for the owner's only environment and were rewritten.
- **NEW STANDING RULE, first rule in CLAUDE.md: THE NEWEST OWNER INSTRUCTION WINS** (owner,
  17 Sep 26). When two dated rulings conflict, follow the later one, say which you set aside,
  and FIX the stale text in the same PR rather than working around it. Memory:
  `newest-instruction-wins`.
- **ENVIRONMENT (owner, 17 Sep 26): the Windows desktop is the ONLY place work happens**; the
  phone remote-controls that same session. Container paths (`/home/user/Raptor`,
  `/opt/pw-browsers/chromium`, the agent proxy) are LEGACY — a new Playwright script uses the
  repo's `existsSync` fallback; kill a stray preview by PORT with `Get-NetTCPConnection`.
- **MODELS while the claudex loop is the work (owner, 17 Sep 26): Opus is the workhorse, no
  sonnet and no haiku.** Fable and Astra review on their top models; a subagent may take a
  READ-ONLY sweep but inherits Opus; the implementation never leaves the main session.
- **[LW-OPEN] BUILT, gated and live-driven** (`d50b219`): the Leave War now always opens on the
  war being WORKED (open → closed → published → draft), never the one last viewed. It was a
  REGRESSION caused by the 8 Sep persistence, found by a reviewer, not a bug report. One
  existing test was DELIBERATELY REVERSED by owner ruling (noted in place). Gates: vitest
  4865/4865, parity 728/0, build; the e2e ×2 and the tracker smoke reds were each PROVED
  pre-existing by re-running them against a stashed tree — do the same before trusting a red.
- **Known, not chased:** the tracker smoke gate failed three times running on the desktop, on
  clean code too. Worth its own look; blocks nothing.

---

## RESUME HERE (handoff, 17 Sep 26 pt.2 — FOLLOW-UP #1 PLAN written + round-1 red-teamed; NO CODE WRITTEN)

**Branch to select in the new-chat picker:** `claude/arch-stack-2-command-core-design` (same branch;
Step 2 still NOT merged — the owner chose to finish follow-up #1 BEFORE merging, so the whole thing
merges once). Do NOT start from `main`.

**Where we got to.** The owner picked option 2 (do the top follow-up first, keep Step 2 unmerged).
Follow-up #1 = route the REMAINING scheduler writes (board/drag/text/sign/mute/draft) through
`commit()`. **The PLAN is written and has had ROUND 1 of the cross-provider red-team. NO production
code has been touched.**
- Plan: `docs/superpowers/specs/2026-09-17-arch-stack-2-followup1-scheduler-routing-plan.md` (Rev 1).
- Review log + every finding and host disposition:
  `…-2026-09-17-arch-stack-2-followup1-scheduler-routing-review-log.md`.

**Round-1 result: BOTH reviewers REVISE, converged.** Codex GPT-6 Astra (high) + Fable 5.1 both
AFFIRM the approach (lagging baseline + hybrid: explicit `schedWrite` for sign/mute/draft, an
`afterSchedMutate` backstop for the board/drag/text bulk — Fable calls the hybrid "the right fork"
and shows a per-call-site-only approach would MISS ≥5 callers). They found **12 concrete defects,
ALL ACCEPTED** (2 as documented Step-2 limitations). The big three:
1. **SR-005/F1 (HIGH)** — setting BOTH `capture()` and `signature()` to the baseline BLINDS the
   whole-world guard. Fix: keep `signature()` = live `histSnap()` AND fix `commit.ts guardSnapshot`
   to take `sig` from `storeSignature(s)`, not the capture string. **This edits committed Step-2
   engine code.**
2. **SR-001 (HIGH)** — `commitPublish` builds its own command and never advances the baseline →
   publish would emit nothing. Fix: one shared apply-end wrapper across EVERY scheduler reducer.
3. **SR-006/F2/F6 (HIGH/MED)** — `histPush`'s `ensureRowIds` mint is deferred to phase 8, i.e. AFTER
   the baseline advance. Fix: `ensureRowIds(DAYS)` + `mintInpIds()` inside the seam before advancing;
   decomposition reads `r.iid` directly, never the minting `inpId`.
   (Full table of all 12 + dispositions is in the review log — read it, don't re-derive.)

### THE TWO OWNER DECISIONS STILL OPEN (ask him first thing)
1. **OK to edit the small piece of committed Step-2 core** (`commit.ts` guardSnapshot) to un-blind
   the guard? It is necessary and well-scoped.
2. **OK to accept SR-003/F5 as a documented Step-2 limitation** — in a rare error path a rejected
   edit may not fully rewind, because the legacy histPush/persist already saw it. Inert today (the
   layer only RECORDS; prod has no rollback path). Full fix = open the txn before the first mark at
   ~40 sites = belongs with follow-up #2 / Step 3. **Recommendation: accept + document, fix later.**

### NEXT STEPS, in order
1. Get the owner's answer on the two decisions above.
2. Revise the plan to **Rev 2** addressing all 12 ACCEPTs (the review log's table is the checklist).
3. **Round 2 re-review** of the changed plan — resume BOTH reviewers with a host-authored feedback
   file of the dispositions (runner: `claudex-loop` skill, `scripts/runner.py`,
   `review --host claude` = Codex, `review --host codex --model claude-fable-5-1` = Fable;
   artifacts go to the scratchpad, NOT the repo).
4. Only then BUILD, test-first, landing **P1–P4 as ONE gated change** (F9: gating P1 alone is not
   stream-neutral). Gates + parity 728/0 each step.
5. **The owner asked me to do the LIVE testing myself** (not hand it to him): build + `vite preview`,
   drive it headless, recreate each edit scenario AND assert the change stream captured it. His
   Vercel check is optional now. Live-drive list must include the backstop-only paths: palette-tap
   plant, right-click clear, airspace edit, drag-drop, input accept.

### Runner gotcha (Windows)
The claudex runner's final stdout print dies on a unicode arrow (`charmap` codec) — harmless, the
run still completes. Read `result.json` from the artifact subdir and note **the verdict/findings are
nested under the `response` key**. Dump to a utf-8 FILE and read that; printing to the console
crashes on `→`.

### STANDING RULES (unchanged)
Opus, HEAVY, test-first. **Do NOT merge until the owner says "merge live."** Do NOT watch/open a PR.
Plain language to the owner. NB: the session reported a switch from Opus 4.8 to **Opus 5** partway —
flagged to the owner, no work was redone.

---

## (earlier, same day) STEP 2 BUILT, GATED, INSPECTED; NOT merged, awaiting "merge live"

**Branch:** `claude/arch-stack-2-command-core-design` (off `main`, NOT merged). Select THIS branch
in the new-chat picker.
**Commits (newest last):** `e11d122` p1 core · `a9fddd4` p2a scheduler funnel · `4db7c66` **2b
publish** · `72aa477` **3 people+settings** · `0e69a42` **4 Leave War** · `8fbf0ae` **5 Tracker**
· `05a1215` **cross-provider inspection fixes**.

### WHAT IS DONE — the whole of Step 2 is built additively and green
All five rollout phases are routed through `commit()` **alongside** today's machinery (persistAll /
histPush / the three snapshot undo stacks all stay and behave exactly as today), each with its own
tests, and a full cross-provider code inspection (Codex GPT + Fable 5.1, both high) has been folded
in. Per-phase design: `docs/superpowers/specs/2026-09-16-arch-stack-2-command-layer-design.md` (Rev 5).
- **2b — publish path:** setDayApproved/publishALDay/discardPending route through commit with a
  `txn.boundary({kind:'publish',ids,crossable})`; `state/disclosure.ts` is the monotonic issued-id
  disclosure registry (PDF/CSV/session-end report to it). Emits `sched.orig`/`sched.als`. Test:
  `state/publish-commit.test.ts` (+ completeness reconstruct-vs-histSnap).
- **3 — people + full settings inventory:** intercepted at the ONE persist seam each — the
  `store.set` write-hook in `engine/hooks.ts` (11 settings keys) and the wrapped `persistPeople`
  (`state/people-settings-commit.ts`). ~30 UI call sites untouched. Test:
  `state/people-settings-commit.test.ts`.
- **4 — Leave War:** the `persist()` router in `leavewar/state/store.ts` routes standalone USER
  edits through commit (records `lw.cell/lw.bid/lw.war/ledger/balances/oilpolicy/postouts/current/
  config`); every LOCKED path (the 4 sync reconcilers + undo) and boot stay raw (LW_READY gate).
  Test: `leavewar/state/lw-commit.test.ts`. **DEFERRED here:** sync-as-projection + the causal
  input-delete→bid-delete JOIN (they need live-scenario sign-off on the delicate sync loop).
- **5 — Tracker:** the `sSet`/`delKey` router in `tracker/app/core.js` (the sync mem write inside
  commit, async storage OUTSIDE); a segment-precise allowlist maps keys to the 10 collections +
  `trk.courses`; migration flags stay raw. Test: `tracker/trk-commit.test.ts`.

### GATES (all green as of this handoff, from `raptor-port/`)
`npx vitest run` **4863/4863** · `npm run build` clean · `node reference/tfin.js` **728/0** ·
`npm run test:e2e` only the 2 known pre-existing failures · `npm run smoke:tracker` **425/0**.
NB (SUPERSEDED 17 Sep 26): the smoke `addStudent` timeout and the stray-server-on-:4179 spawn
failure were NOT flakes — both were fixed in [TRK-SMOKE] (dialog field-reset race + a harness that
leaked its preview server; the harness now tree-kills its server on every exit). A jsdom file in
the full vitest run can still time out under heavy load — kill stray servers by PORT and re-run
before trusting a red only for THAT.

### FOLLOW-UPS the inspection surfaced (NOT live bugs — the writes work via the legacy path; these
are stream-completeness / robustness items a future session should pick up, ranked):
1. **[HIGH] Route the remaining scheduler writes (Fable-3 / Codex-2).** ~55 board/draft structural
   edits (`ui/board.ts` add/delete/flag/sort/move, `ui/rowdrag.ts`, inline text via `ui/textedit.ts`
   + `interactions.ts:677` — note `store.ts writeText` is currently DEAD, zero callers), plus
   `setSign`/`signClear`/warn-mute/draft rename+delete, mutate DAYS/SCHED then call
   `view.afterSchedMutate()` directly, so they emit no envelope. FIX: make `afterSchedMutate` the
   seam (a `schedWrite(type, fn)` wrapper) + give schedStore a BASELINE (records/capture read the
   last-committed histSnap, advanced at each command's apply-end AND re-synced on loadWeek/undo/
   restore — the same pattern people/LW use). Keep byte-identical bodies (tfin 728/0). This is a
   moderate rework of committed phase-2a code and wants the owner's live-scenario sign-off.
2. **[MED-HIGH] Latch persistAll with histPush (Fable-4/6).** `persist.ts:138` wraps the already-
   latched `HOOKS.histPush` so `push()` defers but `persistAll()` runs INLINE in the reducer → the
   durable write precedes the guard/invariant AND the phase-8 `ensureRowIds` mint (a routed write
   that adds a row persists it id-less and its stream `days` change lacks the rid → the
   reconstruct-and-compare would fail on that path). FIX: in `wirePersist`, install ONE latched
   step `() => { histPush(); persistAll() }` (import raw histPush + deferEffect; do NOT re-wrap the
   store.ts latched hook); call `ensureRowIds(DAYS)` at the top of `schedRecords()`.
3. **[MED] LW sync-as-projection + the causal JOIN (design §5.3).** Wrap the 4 sync reconcilers to
   emit `commitAs(origin:'projection')`; make the causal `withdrawLeaveCell` inside a Raptor input
   command JOIN that transaction (it currently runs raw under `locked`). Needs the delicate-sync
   live drive.
4. **[MED] Tracker/LW/people durable-write atomicity on rollback (Fable-6).** The durable persist
   runs in/after apply, so a (rare, no-conflict-checker-in-prod) rollback leaves storage ahead of
   memory; LW additionally gets a phantom undo entry. FIX: defer the backend writes to phase 8 /
   check the CommitResult before the async persist.
5. **[MED] Cross-week session-end disclosure (Fable-10):** `discloseCurrentIssued` only walks the
   loaded week; also walk the week stash on session end.
6. **[MED/LOW] Guard per-write cost (Fable-11):** the whole-world guard serializes histSnap ×~3 +
   settings ×2 per routed write; cache histSnap per-txn and skip guardSnapshot for declared-enlist
   stores. Run `npm run perf` before/after.
7. **[LOW] Origin is always 'user' (Fable-13):** settings writes at boot, and sync-driven
   writeInputsBatch/persistPeople, stamp 'user'; Step 3 will otherwise mint undo entries for them
   (tie to follow-up 3).

### STANDING RULES for the next session
Opus 4.8, HEAVY, test-first. **Do NOT merge until the owner says "merge live."** Do NOT watch/open
a PR. Plain language to the owner. Full review log lives in the two subagent transcripts (this
session) + the commit messages. task-observer obs #49 logged.

### (superseded) earlier build-in-progress note
**Branch:** `claude/arch-stack-2-command-core-design`. **The build spec** is
`docs/superpowers/specs/2026-09-16-arch-stack-2-command-layer-design.md` (Rev 5).


---

## (earlier) RESUME HERE (handoff, 16 Sep 26 — DESIGN COMPLETE, ready to BUILD)

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
- Tracker smoke gate `addStudent` timeout — DIAGNOSED + FIXED 17 Sep 26 ([TRK-SMOKE]); it was a
  real dialog race + a leaked preview server, not a flake.

## Opening prompt for the fresh chat
> Picking up Raptor on branch `claude/crewrest-published-flagging`. BUILD the "live flagging
> on the published schedule" feature. The design is DONE and cross-provider red-teamed — read
> `raptor-port/docs/session-state.md` then the build spec
> `raptor-port/docs/superpowers/specs/2026-09-15-crewrest-flagging-plan-v2.md` (esp. §5, §11, §14).
> Build it test-first on Opus, keep tfin.js 728/0, run all gates, then a fresh Codex + Fable
> code inspection. Do NOT merge until I say "merge live." Speak to me in plain layman terms.
