# [ARCH-STACK] Step 2 — follow-up #1: route the REMAINING scheduler writes through commit()

**Status:** **Rev 2** (17 Sep 26) — folds all 12 ACCEPTED round-1 findings + the 17 Sep correctness
sweep. Ready for round-2 cross-provider re-review, then test-first build.
**Branch:** `claude/arch-stack-2-command-core-design` (Step 2 built + gated + inspected, NOT merged)
**Author:** Claude Opus (Rev 1, 17 Sep 26) · Rev 2 same session, post-round-1
**Parent design:** `2026-09-16-arch-stack-2-command-layer-design.md` (Rev 5 + the **Rev 5.1**
correctness block), esp. §3 model, §5.1 scheduler adoption.
**Review log:** `2026-09-17-arch-stack-2-followup1-scheduler-routing-review-log.md` — the round-1
finding table is the checklist this Rev answers.
**Prior art to COPY:** `state/people-settings-commit.ts` (the baseline pattern),
`state/sched-commit.ts` (phase 2a), `command/commit.ts` (the engine).

## Rev 2 change-list (every round-1 ACCEPT, with the section that answers it)

| Finding | Sev | Answered in |
|---|---|---|
| SR-005 / F1 — baseline `signature()` blinds the whole-world guard | HIGH | §3.1 (signature stays LIVE) + §3.6 (the `commit.ts` guard fix) |
| SR-001 — `commitPublish` never advances the baseline | HIGH | §3.3 (ONE shared apply-end wrapper, used by every scheduler reducer) |
| SR-002 — new command types not permission-registered | HIGH | §3.5 |
| SR-006 / F2 / F6 — `ensureRowIds`/`inpId` mint AFTER the advance | HIGH/MED | §3.3 (mint inside the seam, before the advance) + §3.1 (decompose reads `r.iid`) |
| SR-007 / F3 — `resetSession` clears WARNOFF with no re-sync | MED | §3.2 (re-sync CALLBACK registered into `history.ts`) |
| SR-004 / F4 — `isCommitting()` is true post-delivery too | MED | §3.3 (`isInReducer()`) |
| SR-008 — rendering MUTATES (`signOf` lazily inserts `SCHED.sign[di]`) | MED | §3.2a |
| F7 — Option B adds a `view ↔ sched-commit` import cycle | LOW | §3.4 (inject via `HOOKS.schedEpilogue`) |
| F5 — a failed backstop command reverts a structural edit that used to stick | LOW | §6 (documented behaviour change + a "couldn't save" toast) |
| SR-003 — durable effects run BEFORE the backstop txn opens | HIGH (Codex) | §7 (documented Step-2 limitation — **owner scope call**) |
| F8 — §1 table factual errors | LOW | §1 (table rebuilt from the code, 17 Sep) |
| F9 — P1 alone is not stream-neutral | LOW | §4 (P1–P4 land as ONE gated change) |

**New in Rev 2, not from round 1** (found by the 17 Sep code sweep): the inline-text epilogue is
**deferred by a `setTimeout(0)`**, not synchronous — §6, risk 5.

---

## 0. Goal, in one line

Close the gap where a set of button-driven / structural scheduler edits mutate `DAYS`/`SCHED`
and then repaint **without going through `commit()`**, so those durable changes never reach the
command change-stream. This is **additive and byte-invariant** exactly like the rest of Step 2:
the legacy `histPush`/`persistAll`/snapshot-undo machinery stays running and authoritative; we only
ADD the record-level envelope around writes that currently emit none. **No user-visible change; parity
`reference/tfin.js` stays 728/0.**

### Non-goals (unchanged from Step 2)
- No cutover of persistence or undo (Steps 3/5). Undo/redo are NOT routed through `commit()`.
- No tightening of permissions (permissive `anyone` at Step 2; real auth Step 5).
- Follow-up #2 (latch `persistAll` with `histPush`) is RELATED but tracked separately; see §7.

---

## 1. What is currently unrouted (the gap) — REBUILT from the code, 17 Sep 26

**Routed today** (via `state/store.ts` helpers → `commitSched*`): `writeSlot`, `writeFill`,
`writeText`, `writeDelete`, `writeInputs`, `writeInputsBatch`, `moveSection`, `moveSectionTo`, and
the publish path (2b: `setDayApproved`, `publishALDay`, `discardPending`).
`writeText` has **no production caller** (its only caller is a test) — it is routed but dormant;
do not treat it as live coverage of the text path. The real text path is row C below.
The `state/plan.ts` writers (PLANPUCKS / DAYRMK) are **already routed**, through `writeInputs` —
they are NOT part of this change (Rev 1 wrongly listed them under row F).

**NOT routed** — mutate the model then call the epilogue directly:

| # | Path | Files (17 Sep, verified) | Epilogue used |
|---|------|--------------------------|---------------|
| A | Board structural add/delete/flag/sort/move (line, wave, note, programme, duty, sim, ground; flag toggles; "sort all"; AMT block; SA-role flip) | `ui/board.ts` — **43** `afterSchedMutate()` calls | `view.afterSchedMutate()` (+ `notify()`) |
| A2 | The other board-family writers Rev 1 MISSED (F8) | `state/view.ts:placeArmed` (the palette-tap plant), `ui/drag.ts` (the puck drop), `ui/Modals.tsx:airEdit` (the airspace/traffic edit), `ui/interactions.ts` ×7 (incl. right-click clear, the brief-time accept, input accept) | `view.afterSchedMutate()` |
| B | In-place section/wave/row drag | `ui/rowdrag.ts` ×1, the `ui/drag.ts` drop above | `view.afterSchedMutate()` |
| C | Inline text commit (the LIVE text path) | `ui/textedit.ts:txtCommit` — **deferred inside a `setTimeout(0)`**, see §6 risk 5; `ui/interactions.ts` (the brief-time accept, after `txtSet`) | `view.afterSchedMutate()` |
| D | Day sign-off / sign-clear | `ui/Shell.tsx` (`setSign`), `ui/interactions.ts` (`signClear`) | `HOOKS.histPush()` **direct** (NOT afterSchedMutate) |
| E | Warning mute toggle | `ui/interactions.ts` → `view.toggleWarnOff` | `HOOKS.histPush()` direct; `WARNOFF` rides the histSnap |
| F | Draft rename / delete | `ui/DraftsModal.tsx` (rename, delete) → `engine/drafts.ts` (`draftRename`/`draftDelete`) | `HOOKS.histPush()` direct. There is **no "park" verb** — Rev 1 invented it. Draft duplicate/select go through `ui/board.ts` and land in row A. |

Engine-internal callers of `afterSchedMutate` (`engine/slots.ts`, `engine/daytpl.ts`,
`engine/drafts.ts`, `engine/publish.ts`) are comments or run **inside** a UI caller's write, so they
are nested by construction and handled by the §3.3 in-reducer branch. The one **non-forward** caller
is `probe-bridge.ts` (the e2e bridge) — it must be able to run the raw epilogue without opening a
command; see §3.4.

The common shape: **the model is mutated in place, THEN a durable-write epilogue runs.** The epilogue is
`afterSchedMutate()` for A–C, a bare `HOOKS.histPush()` for D–F.

---

## 2. Why the phase-2a store shape can't just be reused as-is

`schedStore` (phase 2a) is a **live-snapshot** store: `capture = () => histSnap()`,
`records()` reads LIVE `DAYS`/`SCHED`. That works for the funnel helpers because they **enlist BEFORE
they mutate** (`commitSchedVoid(fn)` runs `txn.enlist(schedStore)` first, then `fn` mutates). The
before-image is captured pre-mutation.

The unrouted paths mutate FIRST, then reach the epilogue. If the epilogue opens a command at that point,
`txn.enlist` captures the **already-mutated** world as the before-image → `deriveChanges` sees no diff →
**the structural change is invisible to the stream.** This is the exact problem `people-settings-commit.ts`
already solved with a **lagging BASELINE**.

---

## 3. The mechanism (copy the People pattern)

### 3.1 Give `schedStore` a lagging baseline — but keep `signature()` LIVE (SR-005 / F1)

Introduce a module-level `SCHED_BASELINE: string | null` (a `histSnap()` string), and change:

```
capture:   () => baseline()            // was histSnap()  — the rollback + before-image copy
records:   decompose(baseline())       // was decompose(live DAYS/SCHED)
signature: () => histSnap()            // UNCHANGED — must stay LIVE (see below)
restore:   (snap) => { histRestore(snap); SCHED_BASELINE = snap }
```

where `baseline() = SCHED_BASELINE ?? histSnap()`.

**Why `signature()` must NOT become the baseline.** The whole-world guard compares a store's
signature before and after a command to catch a write that changed a store nobody enlisted. If the
signature reads the baseline, it returns the same string before and after **by construction** — the
guard can never fire again, and Rev 1 §6's claim that "the guard will catch a baseline that
disagrees with live" was exactly backwards. Keeping `signature()` on live `histSnap()` preserves the
guard AND gives the stale-baseline detection Rev 1 wanted for free. This is the round-1 finding both
reviewers rated highest.

`schedRecords()` parses the baseline snapshot the same way `history.ts` serialises it (`d`, the 14
`schedFields()` keys, `wo`=WARNOFF, `pp`/`dm`, and `i`=INPUTS) and decomposes into the same record set
it emits today (days / sched.book / sched.mutes / orig / als / inputs / plan).
**The decomposition must read the SNAPSHOT, not the live singletons**, and must read each input row's
`r.iid` **directly** — never `inpId(r)`, which MINTS an id as a side effect of being read (SR-006/F2).
A minting read inside `records()` writes to the live world during derivation.

**Invariant (the whole correctness argument):** between commands, `SCHED_BASELINE === histSnap()` (live).
It is advanced to the current `histSnap()` at each command's apply-end, and re-synced whenever the world
is replaced out-of-band (below). So:
- **Funnel path** (enlist-before-mutate): at enlist, baseline == live == pre-mutation → before correct;
  fn mutates + advances baseline to new live → after == new baseline → diff correct.
- **Board path** (mutate-before-epilogue): DAYS mutated, baseline still == old live; epilogue opens a
  command → before == old baseline (pre-mutation); fn advances baseline to new live → after correct.

Both cases derive the identical diff. This is the same reasoning that makes People correct.

### 3.2 Advance + re-sync points

- **Advance** (baseline := histSnap()) at the END of every scheduler command's apply — implemented once,
  in the shared apply-end wrapper (§3.3), in BOTH the committing and non-committing branches, and used
  by **`commitPublish` as well as `commitSched`** (SR-001: `commitPublish` builds its own `Command`
  and so never saw Rev 1's advance — after conversion, publish would have compared the baseline to
  itself, emitted nothing, and left the baseline permanently stale).
- **Re-sync** (`resyncSchedBaseline()`, mirroring `resyncPeopleBaseline`) after any out-of-band world
  replacement that does NOT go through a command:
  - `loadWeek` (swaps DAYS/DATES/SCHED for the week),
  - undo / redo / `histRestore` (snapshot restore) — **including the quarantine rollback inside
    `runInputWrite`**, which calls `histRestore` directly,
  - `histInit` / boot baseline, week-stash restore,
  - `initStore` after hydrate (the Fable-5 lesson: registration captures the seed, hydrate rewrites it),
  - **`resetSession` → `resetViewState('session')`, which clears `WARNOFF`** — WARNOFF is inside the
    baseline, so mute → log out → log in → edit would otherwise emit a bogus mute-clear (SR-007/F3).

  **Structurally, not by enumeration.** `state/history.ts` cannot import `state/sched-commit.ts`
  (import cycle), so register a **re-sync callback** into `history.ts` at `initStore` time and have
  `histInit`/`histRestore` invoke it. That covers undo, redo, the quarantine rollback, `loadWeek` and
  boot **by construction** rather than by remembering; `resetSession` gets an explicit call because it
  clears view state without restoring a snapshot. Each point still gets its own test — a missed
  re-sync is the highest-risk failure in this change (§6 risk 1).

### 3.2a Rendering MUTATES — materialize before the baseline (SR-008)

`signOf` lazily inserts `SCHED.sign[di]` when a day's sign strip is first rendered. That is a live
write **outside any command**, so live drifts from the baseline just by looking at a day, and the next
command emits a spurious `sched.book` sign record. Fix: materialize the sign objects for all loaded
days before establishing each baseline (in the same seam that advances it), or make the readers
non-mutating. Test: render a day's sign strip, then run a no-op command — it must emit nothing.

### 3.3 The seam

Add ONE helper in `state/sched-commit.ts`:

```
export function schedWrite(type: string, fn: () => void): void {
  if (isInReducer()) { fn(); applyEnd(); return }      // nested: raw + advance, no new cmd
  commitSchedVoid(type, () => { fn(); /* applyEnd runs in the wrapper */ })
}

// the ONE shared apply-end, called by commitSched AND commitPublish AND the nested branch
function applyEnd(): void {
  ensureRowIds(DAYS)          // idempotent; mints what histPush would mint in phase 8
  mintInpIds()                // idempotent
  materializeSigns()          // §3.2a
  SCHED_BASELINE = histSnap()
}
```

Three things this fixes that Rev 1 got wrong:

1. **`isInReducer()`, not `isCommitting()` (SR-004/F4).** `isCommitting()` is true in the reducer
   phase *and* during phase-8/9 effect delivery. A `schedWrite` raised by an `onCommit` subscriber or
   a latched effect would therefore take the "nested: raw" branch — applying the change and advancing
   the baseline while emitting **nothing**. Silent loss. `isInReducer()` (`phase === 'reducer' &&
   active`) must be exported from `commit.ts` and used here; an idle or post-delivery call goes
   through `commitSchedVoid`, which either runs the pipeline or enqueues and drains.
2. **Mint the ids INSIDE the seam, before advancing (SR-006/F2/F6).** `histPush` runs `ensureRowIds`,
   but `histPush` is LATCHED and released in phase 8 — *after* the seam advanced the baseline. So a
   board add would emit id-less rows, and the id mint would then show up as a phantom diff on the
   NEXT command, with baseline ≠ live in between. Minting in the seam (both calls are idempotent)
   makes the emitted rows carry their rids and keeps the invariant exact.
3. **One wrapper, every reducer.** Folding the advance into `commitSched` alone leaves `commitPublish`
   out (SR-001). `applyEnd()` is called from the shared place both go through.

### 3.4 THE DESIGN FORK — RESOLVED (round 1: both reviewers, hybrid)

- **Option A — explicit `schedWrite` at each call site.** Cons proved decisive: Fable showed a
  per-call-site conversion would **miss at least five** `afterSchedMutate` callers that Rev 1's §1
  table did not even list (now row A2). A table that was wrong once will be wrong again; a new site
  added later forgets the wrapper silently.
- **Option B — automatic backstop at the epilogue.** `afterSchedMutate()` self-wraps in
  `commitSchedVoid('sched.mutate', rawEpilogue)` when called outside a command.

**RESOLVED: the hybrid.** Baseline + `schedWrite` primitive (needed either way); `schedWrite`
explicitly at D/E/F (they need a deliberate type and share no epilogue); the `afterSchedMutate`
backstop for the A/A2/B/C bulk, so ~50 board sites are never touched and cannot silently regress.

**The import cycle (F7).** Option B needs `state/view.ts` → `state/sched-commit.ts`, a new edge into
a module `sched-commit` already depends on — a module-evaluation TDZ risk. Inject instead:
`view.afterSchedMutate` calls `HOOKS.schedEpilogue(rawEpilogue)`, wired at `initStore` exactly like
`setSettingsWriteHook`. Default (unwired, e.g. the probe bridge before boot) = run raw. No new import
edge.

**A "repaint only" `afterSchedMutate` is already safe:** it self-wraps, finds zero record changes,
emits nothing (`commit.ts` phase 7) and still repaints.

### 3.5 Registration (SR-002)

No new stores. Keep the single `schedStore` registration; only its `capture/records/restore` bodies
change (signature stays live, §3.1). Add `resyncSchedBaseline()` and wire the re-sync points.

**Every introduced command type must be permission-registered** — `sched.mutate`, `sched.sign`,
`sched.signClear`, `sched.warnMute`, `sched.draft.rename`, `sched.draft.delete` — with `anyone`, like
every other Step-2 type. An unregistered type is REJECTED by `authorize`, which would break a real
signed-in admin's edit. The trap: the **system actor bypasses authorization**, so a test using the
headless actor passes while the app fails. **Every permission test here must use a real signed-in
admin actor.**

### 3.6 The one edit to committed Step-2 engine code (SR-005) — needs the owner's nod

`commit.ts guardSnapshot` currently takes the guard signature from the `capture()` string as a
shortcut. That is only valid while `capture === signature`. Once `capture()` returns the baseline and
`signature()` stays live, the shortcut reads the wrong string and the guard is blinded anyway. Fix:
`guardSnapshot` derives `sig` from `storeSignature(s)` (i.e. `signature()`), independent of `capture()`.
Small, scoped, and necessary — but it edits Step-2 core that is already committed and inspected.
Tests: a stale-baseline people command neither fails nor mutates `DAYS`; a raw un-enlisted `DAYS`
mutation still fails the commit and restores.

---

## 4. Rollout — P1–P4 land as ONE gated change (F9)

Rev 1 gated P1 alone as "behaviour-neutral". It is not: while D/E/F stay out-of-band, a sign, a mute
or a draft rename between two routed writes leaves baseline ≠ live, and the next routed write absorbs
that change into its envelope under the wrong command type. The mis-attribution window closes only
when every path is on the seam. So P1–P4 are built and tested in order but **gated and landed
together**; P5 is the separate proof step.

1. **P1 — baseline conversion.** `schedStore` → baseline model (signature live); `applyEnd()` shared
   wrapper; `resyncSchedBaseline()` + the `history.ts` callback + the explicit `resetSession` call;
   the `commit.ts` guard fix (§3.6); sign materialization (§3.2a).
   Tests: a funnel write still emits the identical change; `loadWeek` / undo / redo / quarantine
   rollback / `resetSession` between two writes leaks NO whole-world diff; after any of them
   `SCHED_BASELINE === histSnap()`.
2. **P2 — the `schedWrite` seam + `afterSchedMutate` backstop (A/A2/B/C)** via `HOOKS.schedEpilogue`.
   Tests: each structural kind emits exactly the expected record change; a repaint-only call emits
   nothing; after a board add every emitted row carries a rid; an `onCommit` subscriber's `schedWrite`
   emits a SECOND envelope (not a silent raw write).
3. **P3 — sign / sign-clear (D).** `schedWrite('sched.sign' / 'sched.signClear', …)`. Test: signing
   emits a `sched.book` change on the `sg`/`sb` fields, with a real signed-in admin actor.
4. **P4 — warn-mute (E) + draft rename/delete (F).** `toggleWarnOff` emits a `sched.mutes` change;
   the draft writers emit `sched.book` (`dr`/`cd`) changes. Test each.
5. **P5 — full sweep + cross-provider code inspection.** All gates, parity 728/0, e2e, smoke; then
   Codex + Fable independent code inspection of the diff.

Each phase: `npx vitest run <file>` while iterating; full gate set + the live drive before landing.

---

## 5. Test plan (machinery + LIVE, per the owner's standing rule)

**Machinery (vitest).** Central assertions: (a) every routed write emits the expected record diff and
nothing spurious; (b) every re-sync point leaks no whole-world diff and restores the invariant;
(c) a rollback (forced via the test conflict-checker) restores the model AND the baseline; (d) the
whole-world guard still fires on a raw un-enlisted `DAYS` mutation (the SR-005 regression test);
(e) parity 728/0.

**Live scenario drive (I run this myself, headless, on `vite preview` — the deployed bundle):**
log in as `ad`/`a` and, for each kind, confirm on screen it behaves exactly as today AND that the
change stream captured it (probe-bridge read of the stream length / last envelope):

add a line · delete a wave · flag a row · sort a day · drag a wave · **drag-drop a puck** ·
**palette-tap plant** · **right-click clear** · **airspace edit** · **accept an input** ·
edit inline text · sign a day · clear a signature · mute a warning · rename a draft · delete a draft.

The five in bold are backstop-only paths Rev 1's table never named (F8) — they are exactly the ones a
per-call-site conversion would have missed, so they are the ones that prove the backstop works.
A green vitest is necessary but not sufficient.

---

## 6. Risks

1. **A missed re-sync point** → a spurious whole-world envelope, or a rollback rebuilding from a stale
   baseline (data-loss-shaped). Mitigation: the `history.ts` callback covers undo/redo/restore/
   loadWeek/boot by construction (§3.2); `resetSession` explicitly; one test each. The whole-world
   guard also still detects baseline-vs-live disagreement **because `signature()` stays live** — the
   thing Rev 1 claimed for free and would have destroyed.
2. **Double-emit** if a site is both explicitly `schedWrite`-wrapped AND caught by the backstop.
   Mitigation: the `isInReducer()` guard makes the inner call raw; verify no path double-opens.
3. **Parity drift** — any behaviour change shows as tfin ≠ 728/0. Byte-identical bodies; the layer adds
   no rendered output.
4. **Perf** — the guard serialises `histSnap` per routed write (already true at Step 2; follow-up #6).
   Measure `npm run perf` before/after P2; the board budget is **≤1150 `#sbBoard` nodes** and the
   edit-week **≤5450 `#eWeek` nodes** (`probes/perf-port.cjs`) — do not regress either.
5. **The inline-text epilogue is DEFERRED, not synchronous** (new in Rev 2). `ui/textedit.ts:txtCommit`
   mutates through the funnel, then runs `afterSchedMutate()` inside a `setTimeout(0)`, and only once
   focus has left every text field. So between the text mutation and the backstop command there is a
   macrotask boundary. If any other scheduler command runs in that gap, it advances the baseline over
   the text change and folds it into ITS envelope under the wrong `type`; the deferred backstop then
   finds no diff and emits nothing. Nothing is lost from the stream — the change is still recorded —
   but it is **mis-attributed**. Reachability is low (the timer fires before the next user gesture in
   normal flow), so: document it, add a test that drives a text edit and a board add across the timer
   boundary, and accept the mis-attribution at Step 2 rather than making the text path synchronous
   (which would repaint under the caret — the reason the defer exists).
6. **A failed backstop command now reverts an edit that used to stick (F5).** If the wrapping command
   throws or is rejected, rollback reverts the structural edit while the site's own `notify()` and its
   "added" toast have already fired — the user sees a success message and no row. Today the edit
   sticks. **Accepted as a deliberate behaviour change** (atomicity beats a half-applied edit), plus a
   "couldn't save that — try again" toast on `ok:false`. Inert in practice at Step 2: there is no
   conflict checker in production, so this only triggers under a test checker or a thrown invariant.

## 7. Known Step-2 limitation, documented not fixed (SR-003) — **owner scope call**

At the board sites the durable effects run BEFORE the backstop transaction opens: `markEdit` →
`histPush` → `persistAll` have already fired by the time `afterSchedMutate` self-wraps. A rejected
backstop command therefore cannot cleanly undo them, and in principle undo could resurrect a rejected
edit.

**Why it is inert today:** Step 2 is ADDITIVE — the legacy `histPush`/`persistAll` path is the
authoritative one and the command layer only RECORDS. Production has no rollback path at all.
**Why we are not fixing it here:** full atomicity means opening the transaction before the first mark
at ~40 board sites — a large, invasive rework that belongs with follow-up #2 / Step 3.
**Recommendation: accept and document, fix later.**

## 8. Interaction with follow-up #2 (persistAll/histPush latch)

Follow-up #2 notes `persistAll` runs INLINE in the reducer while `histPush` defers. This change routes
MORE writes through the reducer, so it slightly widens #2's exposure. It does not fix or worsen it
materially (the durable write still precedes the guard as today). Keep #2 separate; note the ordering in
the P5 inspection. If round 2 judges #2 a prerequisite, promote it ahead of P3.

## 9. The two decisions the owner must make before the build

1. **May we edit the small piece of committed Step-2 core** (`commit.ts guardSnapshot`, §3.6) to
   un-blind the whole-world guard? It is necessary and well-scoped.
2. **Accept SR-003 (§7) as a documented Step-2 limitation**, fixed with follow-up #2 / Step 3?
   Recommendation: yes.
