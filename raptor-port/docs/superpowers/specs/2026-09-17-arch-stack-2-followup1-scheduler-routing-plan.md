# [ARCH-STACK] Step 2 — follow-up #1: route the REMAINING scheduler writes through commit()

**Status:** PLAN (for cross-provider red-team, then test-first build)
**Branch:** `claude/arch-stack-2-command-core-design` (Step 2 built + gated + inspected, NOT merged)
**Author:** Claude Opus 4.8, 17 Sep 26
**Parent design:** `2026-09-16-arch-stack-2-command-layer-design.md` (Rev 5), esp. §3 model, §5.1 scheduler adoption.
**Prior art to COPY:** `state/people-settings-commit.ts` (the baseline pattern), `state/sched-commit.ts` (phase 2a), `command/commit.ts` (the engine).

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

## 1. What is currently unrouted (the gap)

Routed today (via `state/store.ts` helpers → `commitSched*`): `writeSlot`, `writeFill`, `writeText`
(NOTE: `writeText` is currently DEAD — zero callers), `writeDelete`, `writeInputs`,
`writeInputsBatch`, section move/reorder, and the publish path (2b).

**NOT routed** — mutate the model then call the epilogue directly:

| # | Path | Files | Epilogue used |
|---|------|-------|---------------|
| A | Board structural add/delete/flag/sort/move (line, wave, note, programme, duty, sim, ground; flag toggles; "sort all"; AMT block; SA-role flip) | `ui/board.ts` (~40 sites) | `view.afterSchedMutate()` (+ `notify()`) |
| B | In-place section/wave/row drag | `ui/rowdrag.ts:260`, board drag sites | `view.afterSchedMutate()` |
| C | Inline text commit (the LIVE text path) | `ui/textedit.ts:39`, `ui/interactions.ts:677` | `view.afterSchedMutate()` |
| D | Day sign-off / sign-clear | `ui/Shell.tsx:159` (`setSign`), `ui/interactions.ts:927` (`signClear`) | `HOOKS.histPush()` **direct** (NOT afterSchedMutate) |
| E | Warning mute toggle | `ui/interactions.ts:1009` → `view.toggleWarnOff` | `notify()` only; `WARNOFF` rides the histSnap, snapshot taken elsewhere |
| F | Draft rename / delete / park | `state/plan.ts` + `ui/*` draft controls | mixed (`histPush`/afterSchedMutate) |

The common shape: **the model is mutated in place, THEN a durable-write epilogue runs.** The epilogue is
`afterSchedMutate()` for A–C, a bare `HOOKS.histPush()` for D, and `WARNOFF`-mutate-then-notify for E.

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

### 3.1 Give `schedStore` a lagging baseline
Introduce a module-level `SCHED_BASELINE: string | null` (a `histSnap()` string), and change:

```
capture:   () => baseline()            // was histSnap()
records:   decompose(baseline())       // was decompose(live DAYS/SCHED)
signature: () => baseline()
restore:   (snap) => { histRestore(snap); SCHED_BASELINE = snap }
```

where `baseline() = SCHED_BASELINE ?? histSnap()`. `schedRecords()` parses the baseline snapshot the
same way `history.ts` serialises it (`d`, the SCHED fields, `wo`=WARNOFF, `pp`/`dm`, and INPUTS) and
decomposes into the same record set it emits today (days / sched.book / sched.mutes / orig / als /
inputs / plan). **The decomposition must read the SNAPSHOT, not the live singletons.**

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
  inside the seam (§4), in BOTH the committing and non-committing branches.
- **Re-sync** (`resyncSchedBaseline()`, mirroring `resyncPeopleBaseline`) after any out-of-band world
  replacement that does NOT go through a command:
  - `loadWeek` (swaps DAYS/DATES/SCHED for the week),
  - undo / redo / `histRestore` (snapshot restore),
  - `histInit` / boot baseline, week-stash restore,
  - `initStore` after hydrate (the Fable-5 lesson: registration captures the seed, hydrate rewrites it).
  Miss one and the next command emits a bogus whole-world diff (and a rollback would rebuild the world
  from a stale baseline). This is the single highest-risk list in the change — it gets its own test each.

### 3.3 The seam
Add ONE helper in `state/sched-commit.ts`:

```
export function schedWrite(type: string, fn: () => void): void {
  if (isCommitting()) { fn(); SCHED_BASELINE = histSnap(); return }   // nested: raw + advance, no new cmd
  commitSchedVoid(type, () => { fn(); SCHED_BASELINE = histSnap() })  // top-level: enlist + run + advance
}
```

and make `commitSchedVoid`/`commitSchedValue`/`commitSched` advance the baseline at apply-end too (so
the EXISTING funnel helpers keep the invariant without each caller remembering). Cleanest: fold the
advance into `commitSched` itself (one place), not into every `fn`.

### 3.4 THE DESIGN FORK (for the red-team to settle)

Two ways to get the unrouted sites onto the seam:

- **Option A — explicit `schedWrite` at each call site.** Convert the ~55 sites from
  `{ mutate; afterSchedMutate(); notify() }` to `schedWrite('sched.line.add', () => { mutate; afterSchedMutate() }); notify()`.
  Pros: explicit, greppable, meaningful per-command `type` on the stream, no risk of catching an
  unintended path. Cons: ~55 small edits; a NEW site added later that forgets `schedWrite` silently
  re-opens the gap (no structural backstop).

- **Option B — automatic backstop at the epilogue.** Make `afterSchedMutate()` itself baseline-aware:
  when called OUTSIDE a command, it self-wraps in `commitSchedVoid('sched.mutate', rawEpilogue)`.
  Then A–C route with ZERO call-site edits. Pros: one choke-point (matches the app's "bypassing the
  funnel is always a bug" doctrine), a new site is auto-covered. Cons: generic `type`; must guard every
  non-forward caller of `afterSchedMutate` (there is only the probe bridge — check); D/E/F still need
  their own handling because they DON'T call afterSchedMutate.

**Recommendation:** a **hybrid** — implement the baseline + `schedWrite` primitive (needed either way),
adopt `schedWrite` explicitly at the D/E/F sites (they need a deliberate type + they don't share an
epilogue), AND make `afterSchedMutate` an automatic backstop (Option B) for the A–C bulk so we don't
touch 40 board sites and can't silently regress. Net: explicit where the exit differs, automatic where
it's uniform. **Red-team: is the double mechanism worth it, or should we pick one? Is there a caller of
`afterSchedMutate` that must NOT emit (a pure repaint with no model change)?** (Note: a no-op command
that changed no record emits nothing — `commit.ts` phase 7 — so a "repaint only" afterSchedMutate is
already safe: it self-wraps, finds zero changes, emits nothing, still repaints.)

### 3.5 Registration
No new stores. Keep the single `schedStore` registration; only its `capture/records/signature/restore`
bodies change to baseline-backed. Add `resyncSchedBaseline()` export and wire the re-sync points.

---

## 4. Rollout (small, test-first phases; gates each phase; parity 728/0 each phase)

1. **P1 — baseline conversion, behaviour-neutral.** Convert `schedStore` to the baseline model + add
   `resyncSchedBaseline()` and wire every re-sync point (§3.2). The funnel helpers already route, so
   after P1 the EXISTING routed writes must still emit identical envelopes AND every re-sync point must
   hold the invariant. Tests: extend `scheduler-commit.test.ts` — a funnel write still emits the same
   change; a `loadWeek` / undo / redo / restore between two writes does NOT leak a whole-world diff.
2. **P2 — the `schedWrite` seam + afterSchedMutate backstop (A–C).** Board add/delete/flag/sort/move,
   rowdrag, inline text now emit envelopes. Test: each structural kind emits exactly the expected
   record change (a new day-record diff), and is a no-op-safe repaint when nothing changed.
3. **P3 — sign / sign-clear (D).** Route `setSign`/`signClear` through `schedWrite('sched.sign' / 'sched.signClear', …)`. Test: signing emits a `sched.book` change (the `sg`/`sb` fields).
4. **P4 — warn-mute (E) + drafts (F).** Route `toggleWarnOff` (emits a `sched.mutes` change) and the
   draft rename/delete/park writers. Test each.
5. **P5 — full sweep + cross-provider code inspection.** All gates, parity, e2e, smoke; then Codex +
   Fable independent code inspection of the diff.

Each phase: `npx vitest run <file>` while iterating; full gate set + live drive at phase end.

---

## 5. Test plan (machinery + LIVE, per the owner's standing rule)

**Machinery (vitest):** per phase above. Central assertions: (a) every routed write emits the expected
record diff and nothing spurious; (b) the re-sync points never leak a whole-world diff; (c) a rollback
(forced via the test conflict-checker) restores the model AND the baseline; (d) parity 728/0.

**Live scenario drive (I run this myself, headless, on `vite preview` — the deployed bundle):**
log in as `ad`/`a`, and for each kind — add a line / delete a wave / flag a row / sort a day / drag a
wave / edit inline text / sign a day / mute a warning / rename a draft — confirm on screen it behaves
exactly as today AND that the change stream captured it (assert via a probe-bridge read of
`commandStream()` length/last-envelope). A green vitest is necessary but not sufficient.

---

## 6. Risks

- **A missed re-sync point** → a spurious whole-world envelope, or a rollback rebuilding from a stale
  baseline (data-loss-shaped). Mitigation: enumerate every world-replacement path (§3.2), one test each,
  and lean on the phase-2 **whole-world guard** (`guardCheck`) which already fails a commit if an
  un-enlisted store changed — it will also catch a baseline that disagrees with live at command start.
- **Double-emit** if a site is both explicitly `schedWrite`-wrapped AND caught by the afterSchedMutate
  backstop. Mitigation: the `isCommitting()` guard makes the inner call raw; verify no path double-opens.
- **Parity drift** — any behaviour change shows as tfin ≠ 728/0. Byte-identical bodies; the layer adds
  no rendered output.
- **Perf** — the guard serialises histSnap per routed write (already true at Step 2; follow-up #6).
  Measure `npm run perf` before/after P2; do not regress the board budget.

## 7. Interaction with follow-up #2 (persistAll/histPush latch)
Follow-up #2 notes `persistAll` runs INLINE in the reducer while `histPush` defers. This change routes
MORE writes through the reducer, so it slightly widens #2's exposure. It does not fix or worsen it
materially (the durable write still precedes the guard as today). Keep #2 separate; note the ordering in
the P5 inspection. If the red-team judges #2 a prerequisite, promote it ahead of P3.
