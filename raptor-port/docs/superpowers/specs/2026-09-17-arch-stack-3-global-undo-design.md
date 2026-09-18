# [ARCH-STACK] Step 3 — one global undo — DESIGN (Rev 3, 18 Sep 26)

> **Status:** Rev 3 — **BUILD-READY pending a fresh dual cross-provider re-review** of THIS
> revision. Rev 2 was returned REVISE by both providers (Codex/Astra GU2-001..010 + Fable
> R2-01..14, converged); Fable independently **confirmed every `[CMDL-FINISH]` foundation claim
> TRUE in code** (causal join, `write()` on all five stores, the phase-5 `expectedRevs` checker,
> stable `sched.als` keys, the live `issuedDisclosed` read). Rev 3 folds in ALL round-2 findings.
> The three converged highs it fixes: the revision/conflict model that would refuse every redo and
> every second consecutive undo (§4); the reconciler-suppression seam that suppressed nothing (§3.4);
> and the reversal-authorization hole that let a member undo an admin's decision (§5). A handful of
> small FOUNDATION additions are folded into build phase 1 (§13). No code ships until this revision
> is red-teamed clean and the owner says "merge live".
>
> **Method (still binding):** every claim about existing machinery was re-checked against CODE, and
> the round-2 fix specs cite exact `file:line`. A doc agreeing with a doc is evidence of nothing.
> Round-2 transcript: `2026-09-17-arch-stack-3-global-undo-review-log.md` (§14/§15 map every finding
> to where Rev 3 closes it).

**Depends on:** Step 1 (stable ids) — DONE. Step 2 (command/commit layer + change stream) — DONE +
live (PR #409/#410). **`[CMDL-FINISH]`** — DONE + live (PR #412/#415), foundation re-confirmed in
code by the round-2 review.
**Feeds / interleaves with:** Step 4 (one Absence record) — §7.
**Plan of record:** `2026-09-13-architecture-rootcause-plan.md` (RC1/ARCH-02; SEQ-002/003/004).
**Front-door contract:** `docs/undo-contract.md`. Read it first.

---

## 0. OWNER RULINGS BAKED IN (product-direction, settled 17–18 Sep 26 — not reopened by the red-team)

1. **Conflict policy = REFUSE-WHOLE** (§4). Owner, 18 Sep 26.
2. **Import undo granularity = ONE UNDO PER WHOLE IMPORT** (§10.2). Owner, 18 Sep 26.
3. **One global Undo button**, "undo the last thing I did, anywhere", with snap-to-context; no
   per-screen affordance (§8). Owner, 13 Sep + confirmed 18 Sep.
4. **Redo stays at the change** (§8). Coordinator call, 18 Sep, owner not objecting.
5. **On-the-record undo of a registered publish = a line in the history** (not a correcting
   amendment); issued id never erased or reused; an export is NOT a boundary event (§6). Owner,
   17 Sep 26.

The round-2 review raised NO new product questions; every finding is technical and is decided by
the coordinator per the repo's standing rule.

---

## 1. THE FRAMING — a CUTOVER, built ADDITIVELY, legacy stacks retire after Step 4

Step 3 introduces ONE global undo timeline the Undo/Redo buttons drive, *replacing* the three
snapshot stacks (scheduler `HIST`, Leave War per-war snapshot, Tracker mark/structural history).
The cutover is a **strangler**, staged per module:

- The new timeline becomes authoritative for the UI, one module at a time.
- The legacy stacks are kept as a dormant fallback until Step 4 removes the last reconciliation
  ambiguity (SEQ-004); they are deleted only **after Step 4**.
- **"Dormant" means UNREACHABLE, not merely unused (round-2 GU2-006/R2-08 + round-1 F4).** This is
  the load-bearing safety rule and it is STRONGER in Rev 3: because a legacy restore path writes
  **off-stream — it does not bump the per-record revision** (LW `historyApply`/`LW_RESTORING` →
  `rawPersist`, scheduler `histRestore` → `SCHED_RESYNC`, Tracker `TRK_RESTORING` raw writes), a
  reachable legacy stack silently advances shared records past what the timeline's expectation map
  (§4) knows, so the timeline's conflict check then passes on stale data and corrupts. Therefore a
  module's legacy restore paths must be UNREACHABLE from the moment ANY cut-over module's closures
  can touch that module's records (§7 reworks the order around this — the scheduler's input-delete
  already writes LW records via `retractLwRow`, so LW's legacy restore cannot stay reachable once
  the scheduler is cut over).

**Non-multi-user by construction, forward-compatible.** Single-tab, single-session, per-actor
timeline; `actor`+`session` on every entry so the Step-5 multi-user rules attach without rework
(§5.4). Memory `future-undo-semantics-multiuser` is authoritative.

---

## 2. What it must dissolve — the bug family, and WHY one timeline removes it at the root

The 13-Sep sync/delete/undo audit found a bug family tracing to two whole-world snapshot stacks
over the same synced data: rewinding one stack re-drives the diff reconciler
(`sync.ts` `runOutbound`/`runInbound`), which re-derives the *other* side by comparison — a guess.

| Finding | User-visible | Root today | How ONE timeline dissolves it |
|---|---|---|---|
| **A** | Delete an approved leave on the war → comes back "Raptor-owned", undeletable | reconciler demotes+rebuilds | Undo applies exact recorded before-images, no reconciler guessing. **A ALSO has a FORWARD face** (no undo involved) — carried as a forward splice fix (below), not claimed dissolved by undo alone. |
| **C** | A member Undo/Redo reverses an **admin's** LW decision | snapshot restore, no role check | `mayReverse` per-change against the CURRENT actor AND the forward actor's role (§5) — REFUSED. |
| **D** | Undo of a synced leave flips it Raptor-owned, loses `source`/`shiftedFrom`/remarks, re-mints `iid` | demote path re-mints | Before-image CONTAINS all of it; restore re-mints nothing. |
| **E** | Delete a leave on the war, Undo → shows **twice** | LW Undo restores bid → reconciler mints a 2nd row | Inverse restores both records' one prior state; reconciler re-run reaches a fixpoint (§3.4), derives nothing. |
| **F** | Filing on inputs what the war had makes the war copy "Raptor's"; deleting input deletes original | forward ownership upgrade | Undo restores before-images; the FORWARD ambiguity is removed by **Step 4** (§7). |
| **I** | Delete/edit an input off-week → stale ground row reappears on return | cleanup searches only loaded week | Conditional on weekstash capture + a weekstash `write()` adapter (§2 note + §11 + §13 phase 1). |

**Root fix (RC1/ARCH-02):** an undo is a **replay of recorded inverse data**, not a re-derivation.
The envelope already carries deep `before`/`after` for every record the forward *causal closure*
touched (LW causal join now real — `[CMDL-FINISH]`, re-confirmed round-2). Applying it as a
`restore`-origin commit reverses both sides without asking the reconciler to guess; the reconciler
is then allowed to run and MUST find nothing (§3.4).

> **Corrections carried from round-1/round-2 (do not re-over-claim):**
> - **Finding A's FORWARD face is a separate fix** (war-side delete of an empty-cell lw-tagged row
>   **splices** the row out rather than demoting) — carried in phase 5 with its own regression test,
>   or A is dropped from this table. Not dissolved by undo alone.
> - **Finding I needs a weekstash `write()` adapter.** `weekstashStore` has `capture/restore/records`
>   but NO `write()` today (round-2 GU2-008, `state/store.ts:199-208`); `clearHistoryData` enlists it
>   and deletes stashed weeks in a real user command (`inputedit.tsx:1330`). So the off-week inverse
>   cannot be APPLIED until phase 1 adds `weekstashStore.write()`. Until then an off-week closure
>   **refuses whole** rather than half-applying. §13 phase 1 adds the adapter; §11 covers the `acc`
>   half.

> **CRUX-1 (make-or-break):** a `restore` commit must not let the diff reconciler re-derive the
> other side. The mechanism CHANGED in Rev 3 — see §3.4.

---

## 3. The model

### 3.1 The timeline
```ts
interface UndoEntry {
  seq: number            // the forward USER envelope's seq (identity)
  scope: Scope           // primary display destination for the snap (§8)
  contexts: RecordCtx[]  // ALL storage contexts the closure touches — weeks, wars, courses
                         // (R2-06/GU2-007): derived from the closure's record ids, NOT from scope
  actor: Actor           // WHO did it — snapshot at commit; actor.role drives reversal auth (§5)
  type: string           // originating type (logging/debug only)
  owners: RecordOwner[]  // per-change record ownership, derived at forward time (§5.1)
  inverse: Change[]      // invert() of the closure's changes, reverse order, NEVER coalesced (R2-14)
  forward: Change[]      // the closure's own changes (for redo)
  revs: Record<string,number>  // the closure's post-commit per-record revisions (seeds `expected`, §4)
  boundary?: Boundary    // publish boundary; registration read LIVE at undo time (§6)
  eligible: boolean      // false while the entry's module(s) are not yet cut over (§7)
  undone: boolean
}
```
- **One list ordered by `seq`, across all modules.** Only `origin:'user'` envelopes become entries
  (`types.ts` L21).
- **An entry is a CAUSAL CLOSURE, derived TRANSITIVELY (round-2 R2-13).** `finalize` sets
  `causalSeq` to each pipeline's OWN seq (`commit.ts:264`), so a projection raised by a projection's
  phase-8 chains to that projection, not the user root. The entry is therefore the user envelope
  ∪ **all envelopes reachable by following `causedBy` upward to that seq** — walk the chain, don't
  assume one hop. Orphan projections (no `causedBy` — idle trailing reconciles, `store.ts:1291`) are
  NEVER folded. Children are drained inside the same outer `commit()` (before it returns), so the
  closure is complete by the time the entry is recorded. A projection/restore child is never its own
  entry and never truncates the redo tail.
- **A closure may touch one record twice (round-2 R2-14)** (e.g. a withdraw deletes `lw.cell/x`, an
  inbound re-puts it). The inverse keeps BOTH changes in reverse order and is applied as-is; the
  engine never coalesces changes per record, and each store's `write()` applies its entry list in
  order (LW's is a stable sort, `store.ts:1194`).
- **Navigation is NOT an entry (round-2 R2-10).** `lw.current` is demoted from a stream record to a
  raw persisted view-preference (dropped from `lwDecompose`; it is already classified
  VIEW_PREFERENCE in `registry.ts:7`), so `selectWar` no longer emits a `user` envelope. As a belt:
  the engine's entry filter also excludes any envelope whose changes are ALL in `{lw.current}` or a
  `trk.plan` change whose only differing key is `sylId`, and such an envelope never truncates redo.

### 3.2 Deriving the inverse
For a closure's ordered `changes = [c1..cn]` (user envelope then its `causedBy` chain in seq order),
the inverse is `[invert(cn)..invert(c1)]` where
`invert({op,collection,id,before,after}) = {op:(op==='put'&&before===undefined)?'delete':'put', collection, id, before:after, after:before}`.
`put` with no `before` → `delete`; `delete` → `put` of its `before`. Reverse order + no per-record
coalescing (R2-14). Pure data from the envelope.

### 3.3 Applying the inverse — via each store's `write()` seam, with clone-on-write
Undo of entry `E` issues **one** `commitAs(inverseCmd, { origin:'restore', causedBy:E.seq })` (round-2
R2-11: `commitAs` gains a `causedBy?` opt; the restore type is registered
`definePermission('undo.restore', anyone)` because `mayReverse` (§5) is the real gate, evaluated by
the engine BEFORE the commit). Its reducer:
1. enlists exactly the stores/records in `E.inverse` (loading any off-screen week first — §8),
2. calls each store's **`write(entries, {allowIssued})`** with that store's inverse `RecordEntry[]`
   — apply-all-then-rebuild, refusing issued records unless the boundary rule (§6) grants
   `allowIssued`,
3. lets persist/notify/history fire once at the boundary (phase 8) via `cmdDeferEffect`.
- **Deep clone between the immutable timeline image and mutable live state (round-2 GU2-009).**
  Scheduler and people `write()` currently assign `e.value` BY REFERENCE into DAYS/INPUTS/SCHED/
  PEOPLE (`sched-commit.ts:135-205`, `people-settings-commit.ts:170-175`); LW already clones
  (`store.ts:1196-1201`). Phase 1 adds the same clone-on-write to scheduler + people `write()`, so a
  later in-place edit can never mutate an entry's recorded `forward`/`before` image (which would make
  a subsequent redo replay the wrong value). This is a FOUNDATION fix (§13 phase 1).
The restore is transactional (SEQ-003), latched (one repaint/notify), and recorded as a `restore`
envelope that is not a new `user` entry — it flips `E.undone`. Redo is the symmetric `restore` of
`E.forward`.

### 3.4 The reconciler on `restore` — LET IT RUN, PROVE IT FINDS NOTHING (Rev-3 rewrite, round-2 GU2-001/R2-02)
**Rev 2 was wrong:** it said re-installing the registered effect contexts (`HIST.lock`, `lw.hist`)
suppresses the reconcilers. It does not — `runOutbound`/`runInbound`/`runOilPass`/`runPoArchive`
gate on the module-private `SYNCING` flag (`sync.ts:70,248,526,926,1079`), which is never registered
with the latch; the locks only stop legacy `recordHistory`/`histPush` from pushing a legacy step
(that is finding F10, not reconciler suppression).

**Rev 3 does NOT add a `SYNCING` suppression context.** Fable's round-2 argument (accepted):
suppressing the reconcilers would HIDE a non-fixpoint — if the restored world were ever not
self-consistent, suppression would defer the re-derivation to the next unrelated edit, chaining the
drift to the WRONG cause and making it un-debuggable. Instead:

- **(a) Re-install `HIST.lock` + `lw.hist` for the restore's duration** — ONLY so no legacy undo step
  is pushed and LW persists route to the projection lane (F10). This is the existing, tested seam.
- **(b) The GUARANTEE is closure idempotence, made OBSERVABLE.** The inverse already writes BOTH
  sides' before-images (the causal child was in the forward closure), so when phase 8 lets the
  reconcilers run they diff a FULLY-restored world and derive nothing. Fable hand-traced this holds
  for the four load-bearing scenarios (war-delete of an lw-owned leave; Inputs-page delete of a
  raptor-owned leave; approve-a-bid outbound mint; publish → OIL credit) on BOTH wiring lane orders
  (Raptor lane inbound-first `sync.ts:1162`, LW lane outbound-first `:1178`), because `write()`
  applies ALL entries before any pass runs. **The invariant, asserted after every `restore` commit:
  `commandStream()` contains no `projection` envelope with `causedBy === restore.seq`** — literally
  "the reconcilers found nothing to do". A non-empty result is a hard test failure and names the
  exact restore that broke the fixpoint. The (b) property test (§12) is the safety net.

---

## 4. Conflict detection — REFUSE-WHOLE, timeline-owned expectations (Rev-3 rewrite, round-2 GU2-003/R2-01)

**Rev 2 was wrong:** it pinned each entry's forward `revs` and demanded exact equality at undo time.
But `finalize` bumps every touched record's revision for EVERY origin, including `restore`
(`commit.ts:269-275`, no origin check), so: undo E (a restore) makes `rev = E.revs+1`; a later redo
of E with `expectedRevs=E.revs` → `conflict` (redo ALWAYS fails); and undoing E2 then E1 where both
touched the week-wide `sched.book/<wk>` record (every scheduler edit does, `sched-commit.ts:87-91`)
→ E1's pinned rev is stale → refused. A monotonic counter cannot express "has been undone back to
E's state".

**Rev 3 splits the two questions the pinned-rev conflated:**

### 4.1 The timeline's own expectation map
The timeline keeps `expected: Map<recordKey, rev>`. It is updated:
- when an envelope is RECORDED as an entry (and for each `causedBy`-chained child): `expected[key] = env.revs[key]`;
- when a `restore`/nav commit is ISSUED (and its chained children): `expected[key] = env.revs[key]`.
So `expected` always holds the revision the timeline last accounted for on each record.

### 4.2 Out-of-band conflict (the SEQ-003 hazard)
To undo/redo `E`, the restore command sets `cmd.expectedRevs = { key: expected[key] }` for every key
in `E`'s closure. The **phase-5 in-transaction checker** (`Command.expectedRevs`, checked at
`commit.ts:216-217,397-403`, INSIDE the txn, pre-finalize, root + child) compares each record's
CURRENT revision. A mismatch means something advanced the record OUTSIDE the timeline's knowledge —
an orphan projection, a `remote` change (Step 5), or a still-reachable legacy stack — and the commit
**rejects as `conflict`**, rolling back the whole inverse. This is the atomic guarantee.

### 4.3 Non-linear conflict (a SEPARATE timeline rule, not a revision rule)
Reversing an older entry while a newer one still stands is a timeline question:
- **Refuse undo of `E`** if any NEWER not-yet-undone entry's closure shares a record key with `E`.
- **Refuse redo of `E`** if any newer entry committed AFTER `E`'s undo shares a record key with `E`.
Both are checked against the timeline before the restore is issued, with a plain message.

### 4.4 Policy — refuse-whole (owner)
On any conflict (4.2 or 4.3), refuse the whole undo/redo; nothing partial. Message: "A later change
to <thing> is in the way — undo that first."

> **Known consequence, stated (round-2 R2-01 makes it concrete):** because `sched.book/<wk>` is a
> week-wide hot record every scheduler edit touches, the §4.3 key-sharing rule means **scheduler undo
> is effectively LINEAR per week** — you can undo the most recent edit on a week, then the next, but
> not reach past a later un-undone edit on the same week. This is correct-and-strict, acceptable for
> Step 3 (single-tab, pre-live). Loosening it needs Step-4+ splitting of `sched.book`, not a
> partial-undo hack now. A property test asserts the positive case works: **N edits on one week → N
> undos → N redos, all succeed** (the case Rev 2 would have failed at the first redo).

---

## 5. Authorization at reversal time — `mayReverse`, actor-role + record ownership (Rev-3 rewrite, round-2 GU2-002/R2-03/GU2-010)

**Rev 2 was wrong:** its per-record ownership table classified an approved bid as owned by the bidder
(`setBidState` writes `lw.bid/<war>:<pid>:<date>`, `store.ts:2147-2166`; its outbound child mints
`inputs/<iid>` with `value.person=pid`, `sync.ts:338`), so a member could undo the ADMIN's approval
of their own leave — the exact finding C the design claims to dissolve.

**The fix — the forward ACTOR's role is what gates reversal, not just the record owner:**

```ts
mayReverse(E: UndoEntry, cur: Actor): boolean =
  cur.role === 'admin'
  || ( E.actor.role !== 'admin'          // an action an admin took is admin-only to reverse,
                                          //   whatever record it landed on
       && cur.personId != null
       && E.owners.every(o => o.person === cur.personId) )  // every change is the current person's
```

Record ownership (`E.owners`, derived at forward time) per collection:

| collection | record owner |
|---|---|
| `lw.cell`, `lw.bid` | the person id parsed from the record id `${warId}:${pid}:${date}` (split pid/date from the RIGHT — warId may contain colons; `verId` has no colon so the split is safe, round-2 R2-05-verify) |
| `inputs/<iid>` | `value.person` |
| `inputs/__order` | **structural metadata — owned by the union of the affected input records' owners** (round-2 GU2-010): a member may reverse an `__order` change iff every input it reorders/creates/deletes is theirs. Not a person-less admin-only record. |
| `people/<id>` | `id` — a member ticks their own quals via a `people.edit` user envelope and may undo it (round-2 R2-03) |
| `lw.war`, `lw.ledger`, `lw.balances`, `lw.oilpolicy`, `lw.postouts`, `lw.config`, `lw.current` | admin-only |
| `days`, `sched.*`, `settings`, `plan`, `trk.*` | admin-only |

- **Canonical refusal now holds:** admin approves a bid (`E.actor.role==='admin'`) → toggles
  View-as-member (`cur.role==='member'`) → undo ⇒ the `E.actor.role!=='admin'` clause is false ⇒
  **REFUSED**, regardless of whose `lw.bid` record it is.
- **Redo carries the identical gate** (round-2 R2-03).
- Splitting `lw.edit` into per-operation typed commands is a later layer; correctness comes from
  `E.actor.role` + record ownership now.
- `Actor.personId` is the `ME`/viewer binding (`actor.ts:29`, confirmed round-2), not `SESSION` —
  defense-in-depth parity; real identity at Step 5.

### 5.2 History segregation on identity change / 5.3 redo gate / 5.4 multi-user shape
Unchanged from Rev 2: on real login/logout/role change the timeline segregates (Step 3 enforces via
the per-change ownership check; full login clearing is Step 5); redo is authorized identically; every
entry carries `actor`+`session` so the Step-5 rules attach without rework (memory
`future-undo-semantics-multiuser`).

---

## 6. The publish boundary — read LIVE, issued face FROZEN (Rev-3 rewrite, round-2 GU2-005/R2-04)

The single checkable fact — **has the shared DB registered this issued version?** — is read at UNDO
TIME via `issuedDisclosed(id)` (`src/state/disclosure.ts:51`; `discloseIssued` records it), NOT from
the frozen `boundary.crossable`, for each `E.boundary.ids`.

- **NOT registered (`!issuedDisclosed`)** — nothing is on the shared record. Undo reverses the
  publish **silently**; a later re-publish MAY reuse the same issued id (SEQ-002). This is the only
  path live at Step 3 (no shared DB yet).

- **Registered (`issuedDisclosed`) — a PARTIAL inverse that FREEZES the issued face (round-2 R2-04
  fixes Rev 2's recovery-breaking version):** Rev 2 said "skip `sched.als`/`sched.orig`" but would
  still revert the whole `sched.book`, rewinding `cur[di]`/`dayOK` — so `dayApproved` (which reads
  only `dayOK`, `publish.ts:120`) would think the day was never published and the next publish would
  overwrite `orig[di]` with the SAME `iso#0` id (immutability + new-id recovery both violated). The
  correct partial inverse:
  1. **Skip** `sched.als` and `sched.orig` changes (issued records never erased; their stable ids —
     `sched.als/<id>`, `sched-commit.ts:106` — never reused).
  2. **Within `sched.book`, leave `cv` (cur), `ok` (dayOK) and `al` UNTOUCHED** — the issued face is
     frozen. `cur[di]` stays at the issued version (e.g. AL1); `dayOK` stays true.
  3. **Reverse** `days/<wk>#<di>`, the working-copy marks (`p/c/ad`) and signatures (`sg/sb`).
     Because `dayDelta` is canonical (day vs the `cur` snapshot), this reversal automatically becomes
     the pending diff for the NEXT amendment — consistent with memory
     `published-day-input-is-pending-amendment`. Recovery re-publishes as AL2 (`nextSeq` derives from
     the AL list, `publish.ts:725`, so it is a NEW id — round-2 R2-05-verify).
  4. **Write a DURABLE "withdrawn on the record" line.** The edit log is session-only (won't survive
     a reload), so the history line lives in a new durable book field
     `wd: { [verId]: { at, by, restoreSeq } }`, wired into `schedFields()` (`history.ts:24`),
     `weekStashSnap` (`store.ts:428`), `decompose()`/`applyBook()`, and rendered in the AL history
     panel. This is a FOUNDATION addition (§13 phase 1).
  5. **Enforce issued-record immutability at the command gate** (round-2 GU2-005): a normal (non-
     restore, non-`allowIssued`) commit that would overwrite a registered `sched.als`/`sched.orig`
     record is refused at phase 5. (Step-2 §3.4 deferred this; Step 3 turns it on for registered ids.)

- **AL1-under-AL2 = conflict, by design (round-2 F5-verify):** undoing the creation of AL1 when AL2
  was numbered after it shares the `sched.book` record → the §4.3 non-linear rule refuses it. You
  cannot pull a middle issued version.

At Step 3 `issuedDisclosed` is always false → only the silent path is live/testable; the registered
path is unit-modelled via `MemoryDoor`'s `discloseIssued`, its real driver arriving with the Step-5
DB adapter.

---

## 7. Sequencing vs Step 4, and cutover by RECORD-SET not module (Rev-3 rework, round-2 GU2-006/R2-08)

SEQ-004: **Step 4 (one Absence record) BEFORE retiring the three stacks.** While a leave is stored
twice (an Input + a war cell) the cleanest undo is a Step-4 payoff; keep the LW snapshot as a dormant
fallback until then.

**The round-2 correction to the cutover ORDER.** Rev 2 said "cut scheduler over in phase 2, LW stays
on its stack until phase 5". But a scheduler/input command's closure **already contains LW records**
— `retractLwRow` (`inputedit.tsx:1225`) joins the input command's transaction and writes `lw.cell`.
Its global inverse must restore those LW records. If LW's legacy `historyApply` is still REACHABLE, it
can overwrite those same records off-stream without bumping revisions (§1), and the timeline's
`expected` map (§4) goes stale silently → corruption. So:

- **Eligibility is computed from a closure's FULL record-set, not its initiating module.** A closure
  is undoable only when EVERY module whose records it touches has its legacy restore paths
  unreachable.
- **LW's legacy restore paths (`lwUndo`/`historyApply`/`LW_RESTORING`) are made UNREACHABLE at the
  SAME cutover as the scheduler** (phase 2), because scheduler closures already reach LW records. LW
  can keep its own snapshot data as a dormant DATA fallback, but no reachable button/handler may
  invoke it. LW's OWN `user` envelopes are recorded from phase 2 but marked `eligible:false` until
  LW's full forward cutover; the dispatcher skips ineligible entries.
- **Orphan-projection consequence, stated (round-2 R2-08):** a still-reachable LW legacy path (before
  phase 2) that wakes `runOutbound` at idle produces an orphan `inputs.batch` projection (no
  `causedBy`) that bumps `inputs` revs. A later global undo of a scheduler/inputs entry sharing that
  input record then fails the §4.2 out-of-band check — a SAFE refusal, not corruption. This is why LW
  legacy reachability must end at phase 2.

**Recommended build order (technical call, flagged to the owner):**
1. **Step 3a — engine + foundation additions + scheduler/people/settings/Tracker cutover, AND LW
   legacy restore made unreachable** (its forward cutover completes here too, since its records are
   already reachable from scheduler closures — this is a change from Rev 2, forced by GU2-006).
2. **Step 4 — one Absence record** (removes finding F's forward double-storage).
3. **Step 3b — delete the three dormant stacks** (`undo()`/`lwUndo()`/`applyMarkHist()`).

Step 3 and Step 4 remain siblings, red-teamed close together; only stack DELETION depends on Step 4.

---

## 8. Snap-to-context ([XWEEK-UNDO]) — pre-check, then load, then apply (Rev-3, round-2 R2-09/GU2-007)

Every entry carries `contexts` (§3.1) — ALL storage contexts derived from the closure's record ids,
not just the display `scope`. So an inputs-rooted closure that also changed `days/<weekA>#<di>`
carries week A in `contexts` even though `scope` is `{module:'inputs'}`.

Ordering (Rev 2's "conflict-check → snap → apply" can't hold, because `schedWriteRecords` refuses a
foreign-week write so `loadWeek` MUST precede the reducer, but the phase-5 check runs AFTER the
reducer):
1. **Stateless pre-check** (`revisionOf(key)` vs `expected[key]`, plus the §4.3 non-linear rule)
   BEFORE moving anything — catches every single-tab conflict cheaply.
2. **Load every week/context in `E.contexts`** (transactional: all required weeks loaded/enlisted
   before the reducer, or the whole operation refuses — no partial multi-week restore).
3. **Snap the view** to the primary `scope` (a view-only move — enlists no records; the demoted
   `lw.current`/`trk.plan` view-prefs are written as `restore`-origin commits that update `expected`,
   so nav is never a `user` entry, round-2 R2-10).
4. **Apply the inverse** through `write()`; the in-txn `expectedRevs` (§4.2) is the atomic net.
Honest note: an in-txn refusal after the snap leaves the view moved but data untouched; optionally
`loadWeek` back to the prior week on refusal.

---

## 9. Dormant = UNREACHABLE + the single dispatcher (Rev-3, round-2 GU2-006/R2-12)

- **One dispatcher** — `globalUndo()` / `globalRedo()`. EVERY entry point routes through it. The
  complete set today (round-2 R2-12, enumerated so none is missed at cutover):
  - Scheduler: Shell buttons (`Shell.tsx:319-320`), board buttons (`SchedBoard.tsx:348-350`). No
    Ctrl+Z (`textedit.ts` handles Enter/Escape only).
  - Leave War: `lwUndo`/`lwRedo` (`Chrome.tsx:109,118`).
  - Tracker: buttons (`Header.jsx:238-239`) + the ONLY keyboard Undo/Redo in the app
    (`App.jsx:99` → `core.js:2612 handleUndoKey`).
  - Probe bridge: `w.undo`/`w.redo` (`probe-bridge.ts:90`) AND `w.histApply`/`w.histPush`
    (`:220`) — a direct legacy restore the e2e/probes call.
- **`eligibleModules` / record-set eligibility grows per phase (§7).** At each module's cutover its
  legacy entry points are retargeted to the dispatcher and its legacy restore becomes unreachable
  (e.g. `Chrome.tsx` no longer imports `lwUndo`; `w.undo`→`globalUndo`; `w.histApply` restricted to
  tests or removed). A per-phase test asserts the legacy path is unreachable and no module's records
  are driven by two systems.
- Any internally-surviving legacy restore (boot/migration) runs only as `commitAs(restore, system)`.

---

## 10. The two folded-in `[CMDL-FINISH]` deferrals

### 10.1 CMDLF-002 — restoring `lw.postouts` reprojects the roster INSIDE `write()` (Rev-3, round-2 R2-05)
Rev 2 proposed doing the reproject "in the restore commit under suppression" — but `setPeople` ends
in a bare inline `notify()` (`store.ts:1575`) that wakes `reprojectRoster`+`lwSyncTurn`→ the
reconcilers, inside the reducer, with nothing suppressing them (§3.4). And `projectPeople` lives in
`leavewar/state/raptorRoster.ts` (no store import), so the "crosses the sync.ts boundary" premise was
overstated.

**Completion — a pure state lay inside `lwStore.write()`, no reconciler involvement:** factor
`setPeople`'s lay-over (`store.ts:1566-1574`) into a pure `layRoster(people, postOuts, personEdits)`.
In `write()`, if any entry is `lw.postouts` or `lw.config`, set
`next.people = layRoster(projectPeople(next.showSans), next.postOuts, next.personEdits)` before
`withCurrent(next)`; the already-deferred boundary `notify()` (`:1205`) then finds `reprojectRoster`'s
signature unchanged (a fixpoint, §3.4). Remove the CMDLF-002 deferral marker (`:1147-1156`).
Property test: approve/retract a posting-out → undo → `postOuts` AND every roster posting-window
(`people[].to`/`poArchive`) deep-equal the pre-state; and assert the legitimate edge — restoring a
past-dated window with `poArchive:true` re-archives via `runPoArchive` as a projection child of the
restore (that is a real derived effect, not a non-fixpoint).

### 10.2 Whole-Import undo = ONE undo, three phases (Rev-3, round-2 R2-07)
Rev 2's staging was infeasible (`causedBy` can't chain across an `await`; `loadCourse` writes). The
real shape:
- **Phase A (async, ZERO writes):** parse the file, collect every `uiChoice`/`uiPrompt` answer, do
  every `sGet`, and run the reconcile/migration logic as PURE functions that RETURN the complete
  `{ key → value | delete }` record set (charts, layouts, sylcat/order/hidden/tomb, eventinfo,
  per-course rosters/marks/dates/plan/pace/lulls, migration flags, courses). A cancelled chart prompt
  simply drops that chart from the set.
- **Phase B (sync, ONE `trkGesture`):** apply the whole set via `sSet`/`delKey` (gesture-pending →
  mem now, storage at the boundary) — ONE `user` envelope of type `trk.gesture`.
- **Phase C (view only):** `trkReloadGlobalsFromMem()` + `trkReloadCurrentFromMem(true)`
  (`core.js:402,411` — both write-free) + render.
Guard test: a multi-chart import adds EXACTLY ONE `user` envelope; a single undo returns the
catalogue/marks/roster to the pre-import state.

---

## 11. Cross-week `acc` — preserve authored `r`/`u`, recompute only landing (Rev-3, round-2 GU2-004/R2-06)

Rev 2's "strip `acc` as derived" was wrong: `acc` has THREE values — `'g'` (derived per-week
landing), `'r'` (removed/dormant, an authored decision, `engine/inputs.ts:440`), `'u'` (filed
unavailable, authored). `loadWeek`'s own clear preserves `'r'`/`'u'` precisely because they are
decisions, not landings (`state/store.ts:556-567`); dropping `'u'` was the P2-IMPL-05 phantom-
amendment bug.

**Fix:** in the inverse, strip `acc` ONLY when `=== 'g'` (mirror `store.ts:567`'s predicate exactly,
including `inputProtected`); preserve authored `'r'`/`'u'` in both inverse and forward. Inside the
restore reducer, after `schedStore.write()`, recompute the derived landing: run
`reconcileLandedAcc()` then the landing pass with `pending/changes/added` saved+restored around it
(the `store.ts:583-593` idiom), exposed as one `relandInputs()` from `state/store.ts`. Add
`weekId: CURWEEK` to `inputsScope()` so the snap can load the recording week; the `days` ids in the
closure are the fallback source of the affected week (feeds `E.contexts`, §8).

---

## 12. Testing & invariants (grow the `MemoryDoor` + harness — no new framework)

Classify first (hard/advisory/frozen — SEQ-001), then property-test:
- **(hard)** inverse of a closure returns every touched record to its exact `before` (deep-equal) —
  scheduler, inputs, people, settings, LW cell/bid/**postouts+roster windows**, Tracker; with
  **clone-on-write** so interleaved undo/redo + in-place edits never replay a mutated image (GU2-009).
- **(hard, fixpoint)** after every `restore` commit, `commandStream()` has NO `projection` with
  `causedBy===restore.seq` (§3.4b) — incl. postouts reproject (§10.1) and `acc` recompute (§11).
- **(hard, sequential)** N edits on one week → N undos → N redos, all succeed (§4 — the case Rev 2
  would fail); undo/redo round-trips N random `user` closures back to exact start state.
- **(hard, conflict)** A:X→Y, B:→Z, undo A ⇒ `conflict` (out-of-band, §4.2), B's Z intact; and the
  §4.3 non-linear refusal (newer un-undone entry shares a key) — nothing partial.
- **(hard, auth)** admin approves → View-as-member → undo ⇒ REFUSED (§5, `E.actor.role`); member
  can't reverse another person's change; member CAN undo own bid / own qual tick / own input
  create+delete (incl. `inputs/__order`); redo same gate.
- **(hard, import)** multi-chart import → EXACTLY ONE `user` envelope → one undo ⇒ pre-import (§10.2).
- **(frozen, boundary)** silent while `!issuedDisclosed`; on the registered side (`MemoryDoor`),
  `sched.als/<id>` + `sched.orig` untouched, `cur[di]`/`dayOK` frozen, working copy reversed, a
  durable `wd` line written, recovery publishes a NEW id; a normal overwrite of a registered issued
  record is refused at the gate (§6).
- **(hard, off-week)** an off-week closure restores/removes landings in every affected week via
  `weekstashStore.write()`; where the stash is not enlisted, the undo refuses whole (§2/§11).
- **(hard, strangler)** each legacy-stack module behaves byte-identically pre-cutover; after cutover
  its legacy entry point is UNREACHABLE and no module's records are driven by two systems (§9);
  navigation never creates an entry (§3.1/R2-10).
- **(regression A/C/D/E/F/I)** each sync-spec scenario driven through the real command layer in the
  running app (memory `scenario-based-rule-testing`) — finding A includes the forward splice fix or
  is dropped from the §2 table.

---

## 13. Rollout (strangler; all five gates green after each phase; nothing merges without "merge live";
a fresh cross-provider CODE inspection after the build)

**Phase 1 — Engine + FOUNDATION additions (no module cut over yet):**
- the timeline + transitive causal-closure derivation (§3.1), inverse (§3.2), `restore` application
  via `write()` (§3.3), the `commandStream()`-fixpoint invariant (§3.4);
- the timeline `expected` map + phase-5 conflict wiring + the §4.3 non-linear rule;
- `mayReverse` with `E.actor.role` + record ownership (§5);
- live-boundary via `issuedDisclosed`, the durable `wd` book field, gate-level issued immutability
  for registered ids (§6);
- snap-to-context with `E.contexts` + the stateless pre-check (§8); the single dispatcher (§9);
- **the small foundation additions the review surfaced:** `weekstashStore.write()` (GU2-008);
  clone-on-write in scheduler + people `write()` (GU2-009); `commitAs` `causedBy?` + the
  `undo.restore` permission (R2-11); demote `lw.current` to a raw view-pref (R2-10); `layRoster`
  extraction (§10.1); `relandInputs()` extraction (§11);
- `MemoryDoor` boundary model + the harness increment.
**Phase 2 — Scheduler cutover AND LW legacy restore made unreachable together** (forced by GU2-006):
scheduler + LW records share closures via `retractLwRow`, so LW's legacy restore cannot stay
reachable once the scheduler is undoable. Includes the `acc` strip-and-reland (§11) and the off-week/
weekstash enlistment (finding I) — enlist or explicitly refuse.
**Phase 3 — People + settings** onto the timeline.
**Phase 4 — Tracker** onto the timeline (mark + structural history dormant + unreachable); whole-
import = one undo (§10.2) + an undoable-draft representation for unsaved structural edits (round-1
GU-005) so structural undo coverage is not lost.
**Phase 5 — Leave War forward cutover complete** (its snapshot data kept as a dormant fallback);
postouts reproject (§10.1) + the forward splice fix for finding A (§2), the latter in its own commit
with its own regression test.
**Phase 6 (after Step 4)** — delete the three dormant stacks.

Each phase shippable and gated.

---

## 14. Round-1 findings → closed (see the review log for round-1 detail)
All 9 Codex (GU-001..009) + 10 Fable (F1..F10) round-1 findings were folded into Rev 2 and remain
closed; the machinery they demanded (causal join, `write()`, one-gesture, off-week collection, stable
`sched.als`) is confirmed built. The Rev-2 mapping table is preserved in git history of this file.

## 15. Round-2 findings → where Rev 3 closes each

| round-2 | closed in Rev 3 |
|---|---|
| GU2-001 / R2-02 — suppression seam suppresses nothing | §3.4 rewritten: locks stop legacy step-push only; reconcilers RUN; fixpoint made observable (no `projection` caused by the restore seq); NO SYNCING context |
| GU2-002 / R2-03 — member can reverse admin decision | §5 `mayReverse` keyed on `E.actor.role` + record ownership; admin action admin-only whatever the record |
| GU2-003 / R2-01 — revs model refuses redo + 2nd undo | §4 timeline-owned `expected` map (out-of-band conflict) split from the §4.3 non-linear key-sharing rule; N-edits→N-undos→N-redos test |
| GU2-004 / R2-06 — `acc` strip erases authored `r`/`u` | §11 strip only `'g'`; preserve `r`/`u`; `relandInputs()` inside restore |
| GU2-005 / R2-04 — skipping issued breaks recovery | §6 issued face frozen (`cv`/`ok`/`al` untouched); durable `wd` line; gate-level immutability; recovery = new-id AL2 |
| GU2-006 / R2-08 — module cutover doesn't isolate shared records | §1/§7/§9 eligibility by closure record-SET; LW legacy restore unreachable at scheduler cutover (phase 2) |
| GU2-007 / R2-06 — scope misses replay contexts | §3.1 `contexts` derived from record ids; §8 load all contexts or refuse; `weekId` on `inputsScope` |
| GU2-008 — weekstash has no `write()` | §2 note + §13 phase 1 adds `weekstashStore.write()`; refuse off-week closures until then |
| GU2-009 — replay aliases timeline images | §3.3 clone-on-write in scheduler + people `write()` (LW already clones); interleave test |
| GU2-010 — `inputs/__order` has no owner | §5 structural-metadata ownership = union of affected input owners |
| R2-05 — postouts reproject re-enters reconcilers inline | §10.1 pure `layRoster` inside `lwStore.write()`, no reconciler involvement |
| R2-07 — import staging hand-wavy | §10.2 three phases (async zero-write set → one `trkGesture` → write-free reload) |
| R2-09 — snap ordering can't hold | §8 stateless pre-check → load contexts → snap → in-txn net |
| R2-10 — navigation becomes an entry | §3.1 demote `lw.current` to view-pref + entry filter; nav as `restore`-origin |
| R2-11 — `commitAs` has no `causedBy`; restore type unregistered | §3.3 + §13 phase 1 |
| R2-12 — entry-point set incomplete | §9 full enumeration incl probe `w.histApply`/`w.histPush` + Tracker keyboard |
| R2-13 — closure derivation must be transitive | §3.1 walk `causedBy` upward; orphans never folded |
| R2-14 — a closure can change one record twice | §3.1/§3.2 never coalesce; apply inverse list as-is |

**Revision history:** Rev 1 (17 Sep) first design → REVISE (converged). Rev 2 (18 Sep) rebuilt on the
live `[CMDL-FINISH]` foundation → REVISE (converged; foundation confirmed built). Rev 3 (18 Sep) folds
all round-2 findings. **Next: fresh dual re-review of Rev 3, then build (Opus, high, test-first).**
