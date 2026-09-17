# [ARCH-STACK] Step 2 — follow-up #1: route the REMAINING scheduler writes through commit()

**Status:** **Rev 3** (17 Sep 26) — folds all 12 round-1 findings (Rev 2) PLUS all 11 round-2
findings (both providers REVISE again; approach affirmed a second time). Ready for the test-first
build. Both owner decisions in §9 stay settled.
**Branch:** `claude/arch-stack-2-command-core-design` (Step 2 built + gated + inspected, NOT merged)
**Author:** Claude Opus (Rev 1 → Rev 3, 17 Sep 26, same session, post-round-1 and post-round-2)
**Parent design:** `2026-09-16-arch-stack-2-command-layer-design.md` (Rev 5 + the **Rev 5.1**
correctness block), esp. §3 model, §5.1 scheduler adoption.
**Review log:** `2026-09-17-arch-stack-2-followup1-scheduler-routing-review-log.md` — the round-1 AND
round-2 finding tables are the checklist this Rev answers.
**Prior art to COPY:** `state/people-settings-commit.ts` (the baseline pattern),
`state/sched-commit.ts` (phase 2a), `command/commit.ts` (the engine).

## Rev 3 change-list (every round-2 ACCEPT, with the section that answers it)

| Finding | Sev | Answered in |
|---|---|---|
| R2-01 — SR-008's `materializeSigns` fix is wrong (readers mutate on every paint, after the re-sync) | HIGH | §3.2a REWRITTEN — non-mutating `signAt` readers; `materializeSigns` deleted |
| R2-02 — two stores-loadout writes escape the backstop entirely | HIGH | §1 new row G + §3.5 new type `sched.stores` + §3.3 wrap |
| R2-04 — the inline-text epilogue is DROPPED (not delayed) on tab-through → edit absent from stream | HIGH | §1 row C moved to EXPLICIT `schedWrite` + §3.3 + §6 risk 5 now FIXED |
| R2-03 — the `isInReducer` raw branch mis-guards + needs a 2nd core edit §9 forbids | MED | §3.3 — `schedWrite = commitSchedVoid`; child-join handles nesting; no `isInReducer` export |
| R2-05 — two popups mutate `DAYS` on OPEN (same class as SR-008) | MED | §3.2b (new) — lazy-init at write sites only |
| R2-06 — the guard does NOT detect a stale baseline (§3.1/§6 overclaim) | MED | §3.1 claim corrected + §3.2c (new) the `assertBaselineClean()` guardrail |
| R2-07 — baseline must be `histSnap()` AFTER restore; register at module-eval; tolerate missing `iid` | MED | §3.1 (iid) + §3.2 (restore + module-eval) |
| R2-08 — a boot re-sync is missed (demo overlay pushes INPUTS raw) | LOW | §3.2 re-sync list |
| R2-09 — the probe bridge runs the backstop, not raw; no stream reader for the proof | LOW | §3.4 + §5 (bridge raw path + stream reader) |
| R2-10 — §1 table/counts wrong; `writeSlot/Fill/Delete` are dormant | LOW | §1 rebuilt |
| R2-11 — `schedWrite` can't return the toast values; pre-reads; `_resetPermissions` | LOW | §3.3 (`schedWriteValue`) + §4 build notes |

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

**Routed today** (via `state/store.ts` helpers / `commitSched*`) — CORRECTED in Rev 3 (R2-10):
`writeInputs`, `writeInputsBatch`, `moveSection`, `moveSectionTo`, and the publish trio
(`commitSetDayApproved`, `commitPublishALDay`, `commitDiscardPending`).
**`writeSlot`, `writeFill`, `writeDelete` and `writeText` are DORMANT** — like `writeText`, their
only callers are tests. Every LIVE slot / fill / delete path is a backstop path (a direct
`setSlotVal`/`fillSlot` + `afterSchedMutate`): `ui/drag.ts` (the drop), `state/view.ts:placeArmed`,
`ui/Shell.tsx` (the right-click clear), board deletes splice directly. Do NOT treat the four helpers
as live coverage. The `state/plan.ts` writers (PLANPUCKS / DAYRMK) are **already routed**, through
`writeInputs` — not part of this change (Rev 1 wrongly listed them under row F).

**NOT routed** — mutate the model then call the epilogue directly:

| # | Path | Files (17 Sep, Rev 3 counts) | Epilogue used |
|---|------|--------------------------|---------------|
| A | Board structural add/delete/flag/sort/move (line, wave, note, programme, duty, sim, ground; flag toggles; "sort all"; AMT block; SA-role flip) | `ui/board.ts` — **39** `afterSchedMutate()` CALLS (46 matches = 1 def + 6 comments + 39) | `view.afterSchedMutate()` (+ `notify()`) |
| A2 | The other board-family backstop writers | `state/view.ts:placeArmed` (palette-tap plant, 1 call), `ui/drag.ts` (the puck drop, **1** call — the other 4 matches are comments), `ui/Modals.tsx:airEdit` (airspace/traffic edit), **`ui/Shell.tsx:onCtx`** (the right-click clear — Rev 2 mis-filed this under interactions.ts), `ui/interactions.ts` (the brief-time accept, input accept) | `view.afterSchedMutate()` |
| B | In-place section/wave/row drag | `ui/rowdrag.ts` ×1, the `ui/drag.ts` drop above | `view.afterSchedMutate()` |
| C | Inline text commit (the LIVE text path) — **Rev 3: routed by EXPLICIT synchronous `schedWrite`, NOT the backstop** (R2-04). `ui/textedit.ts:txtCommit`'s `setTimeout(0)` epilogue is DROPPED, not merely delayed, on an ordinary tab-through, so the deferred backstop cannot be trusted to fire. | `ui/textedit.ts` (5 focusout branches: `data-txt`, intimes, bombs, area, atime); `ui/interactions.ts` (brief-time accept, after `txtSet`) | **`schedWrite('sched.text', …)` around the mutation**; `txtCommit()`'s deferred repaint stays as a no-op backstop |
| D | Day sign-off / sign-clear | `ui/Shell.tsx` (`setSign`), `ui/interactions.ts` (`signClear`) | `HOOKS.histPush()` **direct** (NOT afterSchedMutate) |
| E | Warning mute toggle | `ui/interactions.ts` → `view.toggleWarnOff` | `HOOKS.histPush()` direct; `WARNOFF` rides the histSnap |
| F | Draft rename / delete | `ui/DraftsModal.tsx` (rename, delete) → `engine/drafts.ts` (`draftRename`/`draftDelete`) | `HOOKS.histPush()` direct. There is **no "park" verb** — Rev 1 invented it. Draft duplicate/select go through `ui/board.ts` and land in row A. |
| G | **Stores loadout toggle (NEW in Rev 3, R2-02)** — the chip ✕ removal (`[data-store]`) and the C-popup toggle (`[data-cfg]`). These call `markEdit(key)` → `histPush` → `persistAll` but **never** call `afterSchedMutate` OR any D/E/F wrapper, so `HOOKS.schedEpilogue` never fires — they escape the backstop entirely. Fable's `markEdit(` sweep confirms these are the ONLY two escapes. | `ui/interactions.ts` ×2 | **`schedWrite('sched.stores', …)` around the mutation**; `paint()`/`queueHold`/`notify()` stay outside |

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
guard can never fire again. Keeping `signature()` on live `histSnap()` preserves the guard.

**CORRECTED in Rev 3 (R2-06): keeping `signature()` live does NOT give stale-baseline detection.**
Rev 1/Rev 2 claimed it did "for free"; it does not. The guard compares live-before vs live-after
WITHIN one command and skips any store the command enlisted, so an earlier out-of-band mutation
(a missed escape site) survives an unrelated command undetected and is absorbed by the next scheduler
command. That silent-absorption is the exact shape of R2-02 (stores) and R2-04 (dropped text). The
guard is still worth keeping (it catches an un-enlisted write DURING a command), but the detector for
a stale baseline is the separate `assertBaselineClean()` invariant added in §3.2c — do not rely on
the guard for it.

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
  - **`installDemoWorld` on a first-ever boot (NEW, R2-08)** — it pushes INPUTS raw between the two
    boot baselines, so the Leave-War sync's `inputs.batch` would otherwise absorb the demo rows. Call
    `resyncSchedBaseline()` right after `installDemoWorld` in `main.tsx`, before `wireLeaveWarSync`.
  - **`resetSession` → `resetViewState('session')`, which clears `WARNOFF`** — WARNOFF is inside the
    baseline, so mute → log out → log in → edit would otherwise emit a bogus mute-clear (SR-007/F3).

  **Structurally, not by enumeration.** `state/history.ts` cannot import `state/sched-commit.ts`
  (import cycle), so register a **re-sync callback** into `history.ts` and have `histInit`/`histRestore`
  invoke it. That covers undo, redo, the quarantine rollback, `loadWeek` and boot **by construction**
  rather than by remembering; `resetSession` and `installDemoWorld` get explicit calls because they
  change the world without restoring a snapshot. Each point still gets its own test — a missed re-sync
  is the highest-risk failure in this change (§6 risk 1).

  **Two exactness fixes (R2-07):**
  - **The callback and `restore` must set the baseline to `histSnap()` AFTER the restore, never the
    raw snapshot string.** `histRestore` re-installs fields with `||{}`/`||[]` defaults, so
    `histSnap()` after a restore can differ from the raw snapshot by a byte (e.g. `sb:{}` vs
    `sb:undefined`); assigning the raw `snap` would leave `SCHED_BASELINE` off by that byte and the
    next decompose would see a phantom diff. So `restore: (snap) => { histRestore(snap); resyncSchedBaseline() }`
    and the callback = `resyncSchedBaseline` (which always does `SCHED_BASELINE = histSnap()`).
  - **Register the callback + the `HOOKS.schedEpilogue` hook at MODULE-EVAL** (inside
    `registerSchedCommandLayer`, reached from `wireStore`), not "at `initStore` time". Tests and paths
    that call `loadWeek`/`histInit` without `initStore` must still see a live callback.

### 3.2a Rendering MUTATES — make the sign READERS non-mutating (SR-008; REWRITTEN in Rev 3, R2-01)

`signOf` lazily inserts `SCHED.sign[di]` when a day's sign strip is rendered — a live write **outside
any command**, so live drifts from the baseline just by looking at a day.

**Rev 2's fix (materialize signs in `applyEnd`) does NOT work (R2-01).** The readers
(`signRoleOk`/`signShown`/`signNames` → `signOf`) insert on EVERY day paint, view week included
(`ui/html.ts` computes `daySigned(di)` unconditionally, before the `ed` gate), and that paint happens
*after* the boot/week-load re-sync. So the first command after every boot and every week-load still
emits a spurious `sched.book`: `applyEnd` can only fix the after-image, never the already-captured
before-image. Materializing in the re-sync instead makes a pristine week read dirty → it gets stashed
and persisted (the persisted-pristine-copy trap `weekstash.ts` warns about).

**Fix: remove the mutation-on-read.** Add a non-mutating reader `signAt(di)` = `((SCHED.sign||{})[+di]) || EMPTY_SIGN`
where `EMPTY_SIGN` is a frozen `{cur:'',sked:'',plan:'',appr:''}`. Point the three READ sites
(`signRoleOk`, `signShown`, `signNames`) at `signAt`. Leave `signOf` for the one WRITE site
(`setSign`); `signClear` and `drafts.ts` already write directly / read defensively. **Delete
`materializeSigns` — `applyEnd` no longer needs it.** Byte-neutral: the readers only read fields, so
rendered strings are unchanged (a snapshot test pinning `sg` entries for unsigned days needs its
fixture updated — the only expected fallout). Tests: boot → paint the view week → first command emits
no `sched.book` change; a pristine week is NOT dirty after boot + paint.

### 3.2b Two popups mutate `DAYS` on OPEN (NEW in Rev 3, R2-05)

Same class as 3.2a, on `days` records. The airspace popup's `useEffect` (`ui/Modals.tsx`) does
`g.traffic = g.traffic || []` on open, and `openStoresMenu` (`ui/interactions.ts`) does
`a.opts = a.opts || {}` on open. Each writes an empty field onto the live row outside any command, so
the next command's `deepEqual` on `days/<wk>#<di>` sees `traffic:[]`/`opts:{}` vs absent → a bogus
`days` put. Fix: read into a local on open (`const list = g.traffic || []`); do the `||`-init only at
the WRITE sites. Test: open each popup, close it, run a no-op command → nothing emitted.

### 3.2c The stale-baseline guardrail — `assertBaselineClean()` (NEW in Rev 3, R2-06)

The pattern across rounds (round 1 missed row A2; round 2 found rows G and the two on-open mutations)
is that a hand-built inventory of durable-write sites keeps being incomplete, and the whole-world
guard does NOT catch a stale baseline (§3.1 corrected). So add the structural detector: a helper
`schedBaselineClean()` = `SCHED_BASELINE === histSnap()`.

**Placement (corrected during the build): NOT at command entry.** A legitimate backstop command
(row A/B/C/G) mutates the model BEFORE it opens, so at its entry `baseline ≠ live` by design — an
entry assertion would misfire on every board edit. The invariant that actually distinguishes a
missed escape from a legitimate edit is: **AFTER a gesture completes, `baseline === live`** (a routed
gesture's command ran `applyEnd`; an escaped write left the baseline behind). So `schedBaselineClean()`
is asserted **in tests after each gesture and after each re-sync**, and exposed on the probe bridge
for the live drive. A missed escape site fails that assertion loudly instead of being absorbed
silently. This is the guardrail that makes the site enumeration self-checking rather than a
completeness promise.

### 3.3 The seam (SIMPLIFIED in Rev 3, R2-03)

Add helpers in `state/sched-commit.ts`. `schedWrite` is just `commitSchedVoid` — **no `isInReducer`
branch, no second edit to committed core.** The shared `applyEnd()` is folded into BOTH
`commitSched` and `commitPublish` apply bodies (after `fn()`):

```
export function schedWrite(type: string, fn: () => void): void { commitSchedVoid(type, fn) }
// D/E/F + drafts return values the toasts read — capture them (R2-11):
export function schedWriteValue<T>(type: string, fn: () => T): T { return commitSchedValue(type, fn) }

// the ONE shared apply-end, folded into commitSched AND commitPublish's apply, after fn():
function applyEnd(): void {
  ensureRowIds(DAYS)          // idempotent; mints what histPush would mint in phase 8
  mintInpIds()                // idempotent
  SCHED_BASELINE = histSnap()
  // materializeSigns() is GONE — §3.2a makes the readers non-mutating instead
}
```

Why the raw `isInReducer` branch is dropped (R2-03): `dispatch` already child-joins a reducer-time
`commit()` (`commit.ts:85` — `active.api.child(cmd)`). So a nested `schedWrite` → `commitSchedVoid`
→ `commit` → child-join: its `txn.enlist(schedStore)` is a no-op when the parent already enlisted it,
and when the parent is a NON-scheduler command it enlists the scheduler store with the lagging
baseline as before-image, folding the scheduler change into the parent envelope. Rev 2's raw branch
would instead mutate an un-enlisted store → `guardCheck` restores it and rejects the parent (the
scheduler edit silently reverted). In 'post' phase `commitSchedVoid` enqueues and drains synchronously
— nothing lost. This also keeps the SR-004 fix (no raw-apply-no-emit branch) **and** removes the need
to export `isInReducer` from `commit.ts`, so the only edit to committed core stays the approved
`guardSnapshot` change (§9).

Still correct from Rev 2 (unchanged):
- **Mint the ids INSIDE the seam, before advancing (SR-006/F2/F6).** `histPush` runs `ensureRowIds`
  but is LATCHED and released in phase 8 — after `applyEnd` advanced the baseline. Minting in the seam
  (both idempotent) makes the emitted rows carry their rids and keeps the invariant exact.
- **One wrapper, every reducer (SR-001).** `commitPublish` builds its own `Command`, so `applyEnd()`
  is appended to its apply body too (after `fn()`, before/after the boundary is immaterial — the
  boundary reads `issuedIdSet` which `applyEnd` doesn't touch).
- `assertBaselineClean()` (§3.2c) is called at command entry so a missed escape site fails a test.

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

**The probe bridge (R2-09).** `HOOKS.schedEpilogue` is wired at module-eval (§3.2), long before
`installProbeBridge` runs, so `probe-bridge.ts`'s `w.afterSchedMutate` would open a command — Rev 2's
"the probe bridge before boot = run raw" is not true of the built app. Two bridge additions: (1) an
explicit RAW path — expose `w.afterSchedMutateRaw` (the raw epilogue) + `w.resyncSchedBaseline` so an
e2e fixture can set the model up without emitting envelopes and without leaving the baseline stale;
(2) a read-only stream reader — `w.commandStreamLen()` and `w.lastEnvelope()` (a copy) — for the P5
live proof to confirm each real gesture recorded exactly one envelope.

### 3.5 Registration (SR-002)

No new stores. Keep the single `schedStore` registration; only its `capture/records/restore` bodies
change (signature stays live, §3.1). Add `resyncSchedBaseline()` and wire the re-sync points.

**Every introduced command type must be permission-registered** — `sched.mutate`, `sched.text`,
`sched.stores` (NEW, R2-02), `sched.sign`, `sched.signClear`, `sched.warnMute`, `sched.draft.rename`,
`sched.draft.delete` — with `anyone`, like every other Step-2 type. Adding each to `SCHED_TYPES`
auto-registers it via the existing `for (const t of Object.values(SCHED_TYPES)) definePermission(t, anyone)`
loop. An unregistered type is REJECTED by `authorize`, which would break a real signed-in admin's edit.
The trap: the **system actor bypasses authorization**, so a test using the headless actor passes while
the app fails. **Every permission test here must use a real signed-in admin actor.**

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

1. **P1 — baseline conversion + guardrail + the core edit.** `schedStore` → baseline model (signature
   live); `applyEnd()` folded into `commitSched` + `commitPublish`; `resyncSchedBaseline()` + the
   module-eval `history.ts` callback (using `histSnap()` after restore, §3.2) + the explicit
   `resetSession` + `installDemoWorld` calls; the `commit.ts guardSnapshot` fix (§3.6); the
   non-mutating `signAt` readers (§3.2a); the `assertBaselineClean()` guardrail (§3.2c).
   Tests: a funnel write (`writeInputsBatch`, `moveSectionTo`) still emits the identical change;
   `loadWeek` / undo / redo / quarantine rollback / `resetSession` / boot between two writes leaks NO
   whole-world diff; after any of them `SCHED_BASELINE === histSnap()`; boot → paint the view week →
   first command emits no `sched.book`; a pristine week is NOT dirty after boot+paint.
2. **P2 — the `schedWrite` seam + `afterSchedMutate` backstop (A/A2/B) + the slot/fill/delete paths**
   via `HOOKS.schedEpilogue`. Tests: each structural kind emits exactly the expected record change; a
   repaint-only call emits nothing; slot/fill/delete via `placeArmed` + the drag drop each emit;
   after a board add every emitted row carries a rid; the open-airspace and open-stores popups emit
   nothing (§3.2b); a `schedWrite` inside a NON-scheduler (people) command lands in the people
   envelope and does NOT fail the guard; an `onCommit` subscriber's `schedWrite` emits a SECOND
   (queued) envelope.
3. **P3 — inline text (C, EXPLICIT) + sign / sign-clear (D).** Each text focusout branch wraps its
   mutation in `schedWrite('sched.text', …)` (§3.3); `schedWrite('sched.sign' / 'sched.signClear', …)`
   for D. Tests: edit A → Tab to B → click elsewhere → ONE `sched.text` envelope, and a following
   board add carries no text change (the R2-04 regression); signing emits a `sched.book` change on
   `sg`/`sb`, with a real signed-in admin actor.
4. **P4 — stores loadout (G) + warn-mute (E) + draft rename/delete (F).** `schedWrite('sched.stores', …)`
   at both loadout sites; `schedWriteValue` for the draft writers + `toggleWarnOff` (they return values
   the toasts read, R2-11). Tests: a store-chip toggle emits ONE `sched.stores` envelope with a `days`
   put and a following `sched.sign` carries no `days` change; `toggleWarnOff` emits a `sched.mutes`
   change; the draft writers emit `sched.book` (`dr`/`cd`) changes.
5. **P5 — full sweep + cross-provider code inspection.** All gates, parity 728/0, e2e, smoke; the live
   drive (§5, with the new bridge stream reader confirming one envelope per gesture); then Codex +
   Fable independent code inspection of the diff.

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
change stream captured it — using the NEW bridge reader (`w.commandStreamLen()` / `w.lastEnvelope()`,
§3.4) to confirm each gesture recorded EXACTLY ONE envelope of the expected type:

add a line · delete a wave · flag a row · sort a day · drag a wave · **drag-drop a puck** ·
**palette-tap plant** · **right-click clear** · **airspace edit** · **accept an input** ·
**edit inline text (then tab-through, the R2-04 case)** · **toggle a store loadout chip (row G)** ·
sign a day · clear a signature · mute a warning · rename a draft · delete a draft.

Plus two NEGATIVE checks (they must emit NOTHING): **open then close the airspace popup**, and
**open then close the stores popup** (§3.2b), each followed by a no-op — the stream length must not
move. The bold paths are the backstop-only / newly-found ones (F8, R2-02, R2-04, R2-05) — exactly the
ones a hand-built table missed, so they are the ones that prove the mechanism. A green vitest is
necessary but not sufficient.

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
5. **The inline-text epilogue — FIXED in Rev 3, no longer a risk (R2-04).** Round 2 showed the
   `setTimeout(0)` epilogue is DROPPED, not merely delayed: on an ordinary tab-through it never fires,
   so the edit could be absent from the stream entirely, not just mis-attributed. Rev 3 routes the
   text MUTATION synchronously through `schedWrite('sched.text', …)` at each focusout branch (§3.3,
   row C), leaving the deferred `afterSchedMutate` as a repaint-only no-op backstop. No caret repaint
   (the sync `markEdit`/`notify`/`histPush` already run at focusout today; inside the command they
   release at phase 8, same tick). The regression test drives edit-A → tab-to-B → blur and asserts one
   `sched.text` envelope before any following command.
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

## 9. The two owner decisions — BOTH RESOLVED (owner, 17 Sep 26)

1. **May we edit the small piece of committed Step-2 core** (`commit.ts guardSnapshot`, §3.6) to
   un-blind the whole-world guard? — **YES, APPROVED.** Keep it to exactly that: `guardSnapshot`
   takes `sig` from `storeSignature(s)` instead of the `capture()` string. No other Step-2 core
   change rides along on this permission; anything else needs its own ask.
2. **Accept SR-003 (§7) as a documented Step-2 limitation**, fixed with follow-up #2 / Step 3?
   — **YES, ACCEPTED.** It stays documented in §7 and inert (the command layer only RECORDS at
   Step 2 and production has no rollback path). It must be re-opened, not quietly inherited, when
   Step 3 makes undo stream-driven.
