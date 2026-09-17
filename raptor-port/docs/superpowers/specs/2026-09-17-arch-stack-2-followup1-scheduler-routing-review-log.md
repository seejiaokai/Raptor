# Review log — [ARCH-STACK] Step 2 follow-up #1 (scheduler routing) plan

Cross-provider red-team of `2026-09-17-arch-stack-2-followup1-scheduler-routing-plan.md`.
- Host: Claude Opus 4.8 (this session) — plan author + arbiter.
- Reviewer 1: Codex / GPT-6 Astra, high effort (read-only).
- Reviewer 2: Fable 5.1 (Anthropic-side, different model than the author).
- Round cap: 5. Review only — no build authorized by the loop.

## Round 1 — BOTH reviewers: REVISE (converged on the same core defects)

Plan SHA reviewed: `82f1a3f…`. Codex GPT-6 Astra (240s) + Fable 5.1 (433s). Both affirm the
APPROACH (lagging baseline + hybrid: explicit `schedWrite` for D/E/F, `afterSchedMutate` backstop
for A–C) is sound; Fable calls the hybrid "the right fork" and gives the decisive argument that a
per-call-site approach (Option A) would MISS ≥5 `afterSchedMutate` callers the §1 table omitted.
Full reviewer JSON: scratchpad `reviews-r1.txt` + the two `result.json` artifacts.

### Findings + host dispositions (all ACCEPTED — no rejections; the reviews were high-signal)

| ID | Sev | Issue (short) | Disposition |
|----|-----|---------------|-------------|
| SR-005 / F1 | HIGH | Setting BOTH `capture()` and `signature()` to the baseline DISABLES the whole-world guard's ability to catch a raw scheduler write from an un-enlisted store; §6's "guard catches baseline/live mismatch" claim is FALSE. | **ACCEPT.** Keep `signature()` = live `histSnap()`. Fix `commit.ts guardSnapshot` so `sig` derives from `storeSignature(s)` (=signature()) independent of the `capture()` string — the string shortcut is only valid when capture==signature. Add tests: a stale-baseline people cmd neither fails nor mutates DAYS; a raw un-enlisted DAYS mutation still fails+restores. **NB: this edits committed Step-2 engine code (`commit.ts`).** |
| SR-001 | HIGH | `commitPublish` builds its own command and never advances the baseline → after conversion, publish compares baseline-to-itself, emits nothing, leaves baseline stale. | **ACCEPT.** Advance the baseline via a shared apply-end wrapper used by EVERY scheduler reducer (commitSched AND commitPublish). Verify Original/AL envelopes + boundary + a following edit. |
| SR-002 | HIGH | New types (`sched.mutate`/`sched.sign`/…) aren't permission-registered → `authorize` rejects a signed-in admin's command. The SYSTEM actor bypasses this, so a system-actor test would hide it. | **ACCEPT.** Register every introduced type with `anyone`; test with a real signed-in admin actor. |
| SR-006 / F2 / F6 | HIGH/MED | `histPush` mints row ids (`ensureRowIds`) but is DEFERRED to phase 8 — AFTER the seam advances the baseline. A board add emits id-less rows AND the next command's diff carries the id mint → baseline≠live between commands. Same for `inpId` minting on read in the decomposition. | **ACCEPT.** In the seam, call `ensureRowIds(DAYS)` + `mintInpIds()` (idempotent) immediately before advancing the baseline; decomposition reads `r.iid` directly, never the minting `inpId`. Test: after a board add, every emitted row has a rid and `SCHED_BASELINE===histSnap()`. |
| SR-007 / F3 | MED | `resetSession`→`resetViewState('session')` clears WARNOFF (in the baseline) with NO re-sync; §3.2 omits it. Mute→logout→login→edit emits a bogus mute-clear. | **ACCEPT.** Re-sync at end of `resetSession`; structurally, register a re-sync CALLBACK invoked from `history.ts histInit/histRestore` (history can't import sched-commit — cycle), covering undo/redo/quarantine/loadWeek/initStore by construction. Test each re-sync point. |
| SR-004 / F4 | MED | The `isCommitting()` guard is true in BOTH reducer and post-delivery phases; a `schedWrite` from an onCommit subscriber / phase-8 effect runs raw + advances baseline → change applied but never streamed (silent). | **ACCEPT.** Expose `isInReducer()` (`phase==='reducer' && active`) from commit.ts; use THAT for the raw+advance branch; idle/post go through `commitSchedVoid` (runs pipeline or enqueues+drains). Test: an onCommit subscriber's schedWrite emits a 2nd envelope. |
| SR-008 | MED | Rendering MUTATES: `signOf` lazily inserts `SCHED.sign[di]`; opening an unsigned day's sign strip changes live state outside a command → a later no-op/edit emits spurious sign records. | **ACCEPT.** Materialize the sign objects before establishing each baseline (or make the readers non-mutating). Test: render, then a no-op command emits nothing. |
| F7 | LOW | Option B needs `view.ts`→`sched-commit.ts`, adding a `view↔sched-commit` import cycle (TDZ risk at module-eval). | **ACCEPT.** Inject via `HOOKS.schedEpilogue(rawEpilogue)` (the `setSettingsWriteHook` pattern) — no new import edge into view.ts. |
| F5 | LOW | Error path: if the backstop command fails (throw/conflict), rollback reverts the just-made structural edit while `notify()`/`toast('added')` still fire → a silent user-visible revert. Today the edit sticks. | **ACCEPT as a DOCUMENTED behaviour change** (atomicity wins over "the edit sticks") + toast "couldn't save" on `ok:false`. Note: no conflict checker exists in prod at Step 2, so this only triggers under a test checker or a thrown invariant. |
| SR-003 | HIGH(codex) | Durable effects (markEdit→histPush, persistAll) run BEFORE `afterSchedMutate` at board sites, i.e. OUTSIDE the backstop txn. A rejected backstop command can't cleanly undo them; undo could resurrect a rejected edit. | **ACCEPT AS A STEP-2 LIMITATION, documented.** At Step 2 the command layer is ADDITIVE (legacy histPush/persist are authoritative; the command only RECORDS), and prod has no rollback path, so this is inert now. Full atomicity = open the txn before the first mark at ~40 sites = a large invasive rework that belongs with follow-up #2 / Step 3. **← owner scope call (see report).** |
| F8 | LOW | §1 factual errors: F is `engine/drafts.ts`+`DraftsModal.tsx` (not plan.ts); no "park" verb; plan.ts writers ALREADY routed via `writeInputs`; `writeText` has a test caller; A–C omits `Shell.tsx:204`, `view.ts:899` (placeArmed), `Modals.tsx:111`, `drag.ts:283`, `interactions.ts:498/567/605/820/873/1168`. | **ACCEPT.** Correct the table; expand the P2 live-drive list to include a palette-tap plant, right-click clear, airspace edit, drag-drop, input accept (backstop-only paths). |
| F9 | LOW | P1 isn't "behaviour-neutral": while D/E/F stay out-of-band, a sign/mute/draft between two routed writes leaves baseline≠live and the next write absorbs it. | **ACCEPT.** Land P1–P4 as ONE gated change (removes the mis-attribution window) rather than gating P1 alone as stream-neutral. |

### Round-1 outcome
Approach affirmed; 12 concrete defects, all accepted (2 as documented Step-2 limitations). Plan needs a
Rev-2 addressing every ACCEPT, then a round-2 re-review of the changed SHA. Two items need the owner's
nod: (a) Rev-2 now edits committed Step-2 engine code (`commit.ts` guard) — small + scoped; (b) accept
SR-003/F5 as a Step-2 limitation vs expand scope to full rollback atomicity now.

## Rev 2 written (17 Sep 26) — every round-1 ACCEPT folded, plus the correctness sweep

The plan is now **Rev 2**. Its change-list table maps each of the 12 findings to the section that
answers it; the bodies are not repeated here. Two items still need the owner's word before the
build starts — they are restated in the plan's §9:
1. may Rev 2 edit committed Step-2 core (`commit.ts guardSnapshot`, plan §3.6)?
2. accept SR-003 (plan §7) as a documented Step-2 limitation?

**F8 was re-derived independently against the code, not taken on trust.** Confirmed: `state/plan.ts`
does not own the draft writers (`engine/drafts.ts` + `ui/DraftsModal.tsx` do), there is no "park"
verb, and the §1 table omitted `state/view.ts:placeArmed`, `ui/drag.ts` (the puck drop) and
`ui/Modals.tsx:airEdit`. Exact 17 Sep counts now in the plan: **43** `afterSchedMutate()` calls in
`ui/board.ts`, **7** in `ui/interactions.ts`, 1 each in `ui/rowdrag.ts`, `ui/textedit.ts`,
`ui/Modals.tsx`, `ui/Shell.tsx`, 2 in `ui/drag.ts`, 2 in `state/view.ts`; the one non-forward caller
is `probe-bridge.ts`.

**One defect the round-1 reviewers did not find** (plan §6 risk 5): `ui/textedit.ts:txtCommit` runs
`afterSchedMutate()` inside a **`setTimeout(0)`**, so the inline-text epilogue is separated from its
own mutation by a macrotask. A command landing in that gap advances the baseline over the text
change and folds it into ITS envelope under the wrong type; the deferred backstop then finds no diff.
Nothing is lost from the stream — it is mis-attributed. Documented and accepted at Step 2; a test
drives the boundary.

**Verified while writing Rev 2** (so the plan cannot name a primitive that does not exist):
`commit.ts` already carries `phase === 'reducer' && active` for `isInReducer()`; `mintInpIds`,
`resyncPeopleBaseline` and `setSettingsWriteHook` all exist; `signOf` does lazily insert
`SCHED.sign[di]`, confirming SR-008 against the code rather than against the review.

**Gates after the sweep** (docs + one corrected code comment): vitest 4865/4865 · parity 728/0 ·
build green.

### Still to do
Round 2 re-review of the Rev-2 SHA, both providers, with a host-authored feedback file of these
dispositions. Then build.

### Owner decisions (17 Sep 26) — both RESOLVED
1. **Editing committed Step-2 core is APPROVED**, scoped to `commit.ts guardSnapshot` only
   (SR-005/F1). Nothing else rides on this permission.
2. **SR-003 ACCEPTED as a documented Step-2 limitation** (plan §7). Re-open it at Step 3 when undo
   becomes stream-driven — do not inherit it silently.

Round 2 is therefore a review of the Rev-2 plan with both decisions already settled; reviewers should
not re-litigate them, only judge whether Rev 2 actually delivers what it claims.

## Round 2 — BOTH reviewers: REVISE (approach affirmed a SECOND time; new completeness defects)

Plan SHA reviewed: `fb4250e` file, checkout `d1a6e88`. Codex GPT-6 Astra high (334s) + Fable 5.1
(914s, read-only subagent). **Both respected the two settled owner decisions** — neither re-litigated
the core edit or SR-003. Both re-affirm the approach (lagging baseline + hybrid) and confirm the
round-1 fixes are correct as written (the guard split §3.1/§3.6, `commitPublish` needing the shared
apply-end, the permission trap, the re-sync callback covering undo/redo/quarantine/loadWeek/boot).
Raw reviewer output: scratchpad `codex-r2-findings.md` + the Fable subagent result.

**Two NEW HIGH defects Rev 2 did not close, plus a wrong fix and several completeness items. All
ACCEPTED — the reviews were high-signal and grounded in quoted code.** Convergences noted.

| ID (this round) | Sev | Issue (short) | Disposition → Rev 3 |
|----|-----|---------------|---------------------|
| R2-01 (Fable F1) | HIGH | **SR-008's fix is wrong.** `materializeSigns()` in `applyEnd` can't help: the sign readers (`signRoleOk`/`signShown`/`signNames` → `signOf`) insert `SCHED.sign[di]` on EVERY day paint (view week too — `html.ts:1083` computes it before the `ed` gate), and that paint runs AFTER the boot/week-load re-sync. So the first command after every boot and every week-load still emits a spurious `sched.book`; materializing only fixes the after-image, never the already-captured before-image. Materializing in the re-sync instead makes a pristine week read dirty → stashed/persisted (the persisted-pristine-copy trap). | **ACCEPT — replaces §3.2a.** Make the READERS non-mutating: add frozen-default `signAt(di)`; point `signRoleOk`/`signShown`/`signNames` at it; leave `signOf` for the one write site (`setSign`). Delete `materializeSigns`. Byte-neutral (readers only read). Test: boot → paint view week → first command emits no `sched.book`; and a pristine week is NOT dirty after boot+paint. |
| R2-02 (Fable F2) | HIGH | **Two durable `DAYS` writes escape the backstop ENTIRELY.** The stores-loadout chip removal (`interactions.ts` `[data-store]`) and the C-popup toggle (`[data-cfg]`) call `markEdit(key)` → `histPush` → `persistAll` but never call `afterSchedMutate` OR a D/E/F wrapper, so `HOOKS.schedEpilogue` never fires and the §1 grep missed them. The loadout change is durable, live≠baseline, and the next command absorbs it under the wrong type. Fable swept every `markEdit(` caller: these are the ONLY two escapes. | **ACCEPT — new row G + new type `sched.stores`.** Wrap each body in `schedWrite(SCHED_TYPES.stores, …)`, keeping `paint()/queueHold/notify()` outside. Test: toggle a chip → one `sched.stores` envelope with a `days` put; a following `sched.sign` carries no `days` change. |
| R2-03 (Codex SR2-002 = Fable F3) | MED | The `isInReducer` raw branch (a) never enlists `schedStore`, so a `schedWrite` inside a NON-scheduler parent command mutates an un-enlisted store → `guardCheck` restores it and rejects the parent (the scheduler edit is silently reverted); and (b) requires a SECOND edit to committed core (exporting `isInReducer` from `commit.ts`+`index.ts`), which §9 scopes out. Unnecessary: `dispatch` already child-joins a reducer-time `commit()` (`commit.ts:85`), enlisting `schedStore` into the parent, and enqueues+drains in 'post'. | **ACCEPT.** `schedWrite(type, fn) = commitSchedVoid(type, fn)`; fold `applyEnd()` into BOTH `commitSched` and `commitPublish` apply bodies (after `fn()`). Drop the `isInReducer` branch and the core export — keeps the core edit to exactly the approved `guardSnapshot`. Idempotent double-`applyEnd` in the nested case. Tests: `schedWrite` inside a people command lands in the people envelope and does NOT fail the guard; an `onCommit` subscriber's `schedWrite` emits a second (queued) envelope. |
| R2-04 (Codex SR2-001 = Fable F4) | MED→HIGH | **The text epilogue is DROPPED, not delayed** (worse than §6 risk 5). `txtCommit`'s `setTimeout(0)` returns with no `afterSchedMutate` when focus is in another text cell and does NOT reschedule; the heal branch never re-arms it. Ordinary tab-through (edit A → Tab to B → leave B unchanged) makes A's edit durable but never opens a command; a following week-switch/logout advances the baseline over it → absent from the stream entirely. Keyboard users hit this constantly. | **ACCEPT — row C moves from backstop to EXPLICIT synchronous `schedWrite`.** In each focusout branch wrap the model mutation: `schedWrite(SCHED_TYPES.text, () => { if (txtSet(p,v)) markEdit() })` (and the intimes/bombs/area/atime equivalents), leaving `txtCommit()`'s deferred repaint as a now-no-op backstop. No caret repaint (the sync `markEdit`/`notify`/`histPush` already run at focusout today; inside the command they release at phase 8 same tick). Test: edit A → Tab to B → click elsewhere → one `sched.text` envelope; a following board add carries no text change. |
| R2-05 (Fable F5) | MED | **Two popups mutate `DAYS` on OPEN** (same class as SR-008, on `days` records): the airspace popup `useEffect` (`Modals.tsx` `g.traffic = g.traffic || []`) and `openStoresMenu` (`interactions.ts` `a.opts = a.opts || {}`). Opening writes an empty field outside any command → next command emits a bogus `days` put. | **ACCEPT.** Read into a local on open; do the `||`-init only at the write sites. Test: open each popup, close, run a no-op command → nothing emitted. Fable's lazy-init sweep found no other on-read inserts. |
| R2-06 (Codex SR2-004 + guardrail) | MED | §3.1/§6 OVERCLAIM: keeping `signature()` live does NOT give stale-baseline detection — the guard compares live-before vs live-after and skips enlisted stores, so an earlier raw mutation survives an unrelated command undetected (this is the mechanism behind R2-02/R2-04). | **ACCEPT — correct the claim AND add the guardrail.** Add a dev/test invariant `assertBaselineClean()` (`SCHED_BASELINE === histSnap()`) asserted at command entry and after every re-sync, so a MISSED escape site fails a test loudly instead of being absorbed silently. This is the structural answer to "the site table keeps being incomplete" (prefer-guardrail-over-bug-cascade). |
| R2-07 (Fable F10) | MED | **Two invariant-exactness bugs.** (a) `histRestore` re-installs with `||{}`/`||[]` defaults, so `histSnap()` after a restore can differ by a byte from the raw snapshot string — Rev 2's `restore: SCHED_BASELINE = snap` would leave the invariant off by that byte. (b) Registration must be at module-eval (`registerSchedCommandLayer`, via `wireStore`), not "at initStore" — tests/paths that call `loadWeek`/`histInit` without `initStore` would stay stale. Plus: decomposition must tolerate a not-yet-minted `iid`. | **ACCEPT.** `restore = (snap) => { histRestore(snap); resyncSchedBaseline() }` and the callback = `resyncSchedBaseline` (always `SCHED_BASELINE = histSnap()`, never the raw snap). Register the callback + `HOOKS.schedEpilogue` inside `registerSchedCommandLayer`. `schedRecords` skips a row with no `iid`; invariant test: after `applyEnd` every INPUTS row has an `iid`. |
| R2-08 (Fable F6) | LOW | A boot re-sync is missed: `installDemoWorld` pushes INPUTS raw between the two boot baselines, so on a FIRST-ever boot the Leave-War sync's `inputs.batch` envelope absorbs the demo rows. First-boot demo-data only. | **ACCEPT.** `resyncSchedBaseline()` right after `installDemoWorld` (before `wireLeaveWarSync`); add to the §3.2 list. |
| R2-09 (Codex SR2-003 = Fable F9) | LOW | The probe bridge runs the backstop, not raw: `HOOKS.schedEpilogue` is wired at module-eval, long before `installProbeBridge`, so `w.afterSchedMutate()` opens a command; and the bridge exposes no stream reader for the §5 live proof. | **ACCEPT.** Add a read-only bridge accessor (stream length + copied last envelope) for the P5 proof; expose an explicit raw epilogue (`w.afterSchedMutateRaw`) + `resyncSchedBaseline` for fixture setup so bridge setup emits nothing; correct §1's "before boot = raw" claim. |
| R2-10 (Codex + Fable F7/F8) | LOW | §1 table/counts wrong: `board.ts` has **39** `afterSchedMutate` CALLS (46 matches = 1 def + 6 comments + 39), not 43; `drag.ts` has 1 call not 2; the right-click clear is `Shell.tsx:onCtx`, not `interactions.ts` (Shell.tsx absent from row A2); and `writeSlot`/`writeFill`/`writeDelete` are DORMANT like `writeText` — every live slot/fill/delete path is a backstop path, so "routed today" is only `writeInputs*`, `moveSection*`, the publish trio. | **ACCEPT.** Rebuild the table + counts; P1's "funnel write emits identical change" test drives `writeInputsBatch`/`moveSectionTo`; slot/fill/delete assertions move to P2 (via `placeArmed` + the drag drop). |
| R2-11 (Fable F11) | LOW | Build notes: `toggleWarnOff`/`draftRename`/`draftDelete` return values the toasts read — `schedWrite: () => void` can't return them (add `schedWriteValue` or capture via closure). `Shell.tsx` reads `daySigned(di)` before `setSign` — keep that read outside the wrapper. `_resetPermissions` in a future signed-in test would leave the backstop rejected (the `registered` flag blocks re-registration) — worth a comment. | **ACCEPT.** Add `schedWriteValue<T>`; keep pre-reads outside wrappers; comment `_resetPermissions`. |

## P5 — cross-provider CODE inspection of the BUILT diff (both providers: REVISE → all fixed)

The Rev-3 build (`d8ec03b`, base `3a565c2`) was inspected by Codex GPT-6 Astra high (`inspect --base`)
and a Fable 5.1 agent, both read-only against the real diff. **Both affirmed the mechanism matches the
plan in every load-bearing place** (decompose keys == `schedFields`; `applyEnd` in both reducers;
`signAt` at every read site; the guard edit exactly as approved; popups no longer write on open; no
write captured twice). Both returned REVISE with a small, convergent finding set. All fixed in the
follow-up commit; gates re-run green.

| ID | Sev | Issue | Fix (commit after `d8ec03b`) |
|----|-----|-------|------|
| **F-01** (Fable; Codex missed) | MED | `histInit` calls `syncHistBtns()` (→ `notify()`) BEFORE it re-synced the baseline, and `loadWeek`'s landing pass notifies mid-swap. A notify-listener command (the Leave War sync's `writeInputsBatch` is a real one) would then diff the OLD week against the new → a spurious WHOLE-WEEK envelope (and a rollback would restore the old week under the new id). | `histInit` re-syncs BEFORE `syncHistBtns`; `applyWeekModel` re-syncs after the id-mint (before the landing pass) AND before return. Pinned: `sched-routing.test.ts` F-01 (a listener command fired during `loadWeek` never diffs the old week) — verified to FAIL without the fix. |
| **SR-I-001 / F-03** (both) | MED/LOW | The `afterSchedMutate` backstop used `isCommitting() ? raw() : …`; `isCommitting()` is true in phase 8/9 too, and the raw branch never enlists `schedStore` inside a non-scheduler parent → guard-reject, or silent loss in post. No current caller, but latent. | Backstop is now ALWAYS `commitSchedVoid(SCHED_TYPES.mutate, raw)` (same fix as `schedWrite`, R2-03); dispatch child-joins / enqueues. |
| **SR-I-003 / F-02** (both) | MED/LOW | The bombs (stores TEXT) focusout branch still did `a.opts = a.opts || {}` on blur — the R2-05 escape class the popup fix missed. | Read through a local `o = a.opts || {}`; init `a.opts` only inside the command when the value changes; guard the `heal`. |
| **SR-I-002 / F-05** (Codex MED, Fable INFO) | MED | The synchronous `sched.text` command wrapped `markEdit` but left `reconcileIssuedMarks` in the deferred backstop — so restoring a published day's issued value emitted a SECOND envelope (the deferred step was not the promised no-op). | New `commitText()` helper runs `reconcileIssuedMarks()` INSIDE each text command before `markEdit`; the deferred backstop is then a true no-op. |
| **F-04** (Fable) | LOW | `schedWriteValue` returned the reducer's value even after a rollback; plan §6 risk 6's "couldn't save" toast was not built. Inert at Step 2 (no prod rollback path). | `toastFail()` in `schedWrite`/`schedWriteValue`/backstop toasts on `ok:false`; `schedWriteValue` returns a falsy default on failure. |
| **F-06** (Fable) | DOC | Plan §3.3 still said `assertBaselineClean()` "at command entry" (contradicting the corrected §3.2c) and used the wrong name. | Corrected to `schedBaselineClean()`, asserted in tests after each gesture/re-sync. |

**Noted, not fixed (out of scope / inert):** Fable flagged a PRE-EXISTING quirk — `SCHED` has no
`drafts`/`curDraft` own-keys, so the first `histRestore` of a session flips `dr`/`cd` `undefined`→`{}`
and a quarantine rollback then emits a spurious `sched.book`; unchanged by this work and now a one-time
flip. Left for a separate pass.

Gates after the fix round: **vitest 4878/4878** (10 routing tests incl. the F-01 pin) · **parity 728/0**
· build green · live drive re-run (text→`sched.text`, board→`sched.mutate`, baseline clean, no errors).

### Round-2 outcome
Approach affirmed a second time by both providers; both settled owner decisions respected. Two NEW
HIGH completeness defects (R2-01 wrong SR-008 fix, R2-02 two escaping stores writes), one MED elevated
to HIGH-impact (R2-04 text edits dropped from the stream), and a set of correctness/exactness/doc
items — all with concrete agreed fixes, no rejections. The pattern (round 1 missed row A2; round 2
found two more escapes + two on-open mutations) is answered structurally in Rev 3 by the
`assertBaselineClean()` guardrail (R2-06), which turns a missed site from a silent absorption into a
failing test. Plan advances to **Rev 3**. The final net is P5's cross-provider inspection of the real
diff. No third plan-level round is planned unless the owner asks — the remaining risk is completeness,
and the guardrail + P5 code inspection cover it better than more prose review.
