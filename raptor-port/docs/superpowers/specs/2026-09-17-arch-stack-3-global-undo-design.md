# [ARCH-STACK] Step 3 — one global undo — DESIGN (Rev 1, 17 Sep 26)

> **Status:** Rev 1 — **REVISE** after round-1 cross-provider red-team (Codex/GPT-6 Astra
> + Fable 5.1, both converged). NOT build-ready. See the review log
> (`2026-09-17-arch-stack-3-global-undo-review-log.md`) for the 9+10 findings. **Key
> correction:** the command layer (Step 2) is genuinely finished only for the SCHEDULER;
> for Leave War and Tracker the causal join / projection origins / one-envelope-per-gesture
> / a per-record write seam were deferred or never built — these are Step-2-COMPLETION
> prerequisites, not Step-3 assumptions, and several §2 "already dissolved by Step 2"
> claims below are wrong as written (finding I not captured off-week; finding A is a
> forward bug; the LW both-side envelope does not exist). Rev 2 pending owner steer on
> scoping (see the report). No code. Nothing ships until the design is clean, the owner
> rules on §9, and a build lands under "merge live".
>
> **Method (the 17 Sep lesson):** every claim about existing machinery below was
> checked against the CODE (`src/command/types.ts`, the shipped Step-2 layer), not
> against another doc. A doc agreeing with a doc is evidence of nothing.

**Depends on:** Step 2 (the one command/commit layer + record-level change stream)
— DONE + live (PR #409/#410). Step 1 (stable ids everywhere) — DONE.
**Feeds / interleaves with:** Step 4 (one Absence record) — see §7 (sequencing).
**Plan of record:** `2026-09-13-architecture-rootcause-plan.md` (RC1/ARCH-02; SEQ-002/003/004 binding).
**Backlog item:** `[GLOBAL-UNDO]` in `OUTSTANDING.md`.
**Step-2 contract this consumes:** `2026-09-16-arch-stack-2-command-layer-design.md`
and the shipped `src/command/types.ts`.

---

## 0. THE FRAMING — Step 3 is a CUTOVER, built ADDITIVELY, retired after Step 4

Step 2 was purely additive: it added the stream and changed no undo behaviour. Step 3
is the first real **cutover** — it introduces ONE global undo timeline that the Undo/Redo
buttons drive, *replacing* the three separate snapshot stacks. To keep that safe, the
cutover is staged, not a big-bang:

- **The new timeline is built and made authoritative for the UI**, driving Undo/Redo.
- **The three legacy snapshot stacks are KEPT RUNNING** (scheduler `HIST`, Leave War
  per-war snapshot, Tracker per-course/syl mark history) as a **dormant fallback** until
  Step 4 removes the last reconciliation ambiguity (SEQ-004). They are **retired** — the
  three `undo()`/`lwUndo()`/`applyMarkHist()` paths deleted — only **after Step 4**.
- **This is why undo now routes through `commit()`** (Step 2 deliberately did NOT route
  undo — §0 of the Step-2 design; Step 3 does): the inverse must be transactional,
  authorized, conflict-checked and recorded on the stream like any other change.

**What Step 3 delivers:** one Undo button for the whole app, over stable ids, that
(1) dissolves the delete-vs-undo bug family at the root (§2), (2) refuses a member
reversing an admin's or another person's decision (§5), (3) never clobbers a later
independent edit (§4, SEQ-003), (4) honours the publish boundary (§6, SEQ-002 + the
17 Sep owner ruling), and (5) snaps the view to where a change was so an off-screen
undo is visible ([XWEEK-UNDO]).

**Non-multi-user by construction, but forward-compatible.** Step 3 builds the
**single-tab, single-session, per-actor** timeline. The multi-user rules (undo scoped
to login session; never touches another user; others see your change/undo live from the
shared DB; `remote` changes are never your undo entries) are **captured, not built**
(memory `future-undo-semantics-multiuser`). The design is shaped so the multi-user
machinery slots in at Step 5 without rework (§5.4).

---

## 1. Purpose & scope

**In scope:**
- The **global undo timeline**: an ordered, in-memory log of the `user` envelopes on
  the Step-2 stream, with an undo cursor and a redo tail.
- **Inverse application** as a `restore`-origin `commit()`: derive the inverse `Change[]`
  from an envelope's per-record `before`/`after`, apply atomically, emit no new `user`
  entry.
- **Conflict detection** via the envelope `revs` map (SEQ-003): refuse (or partial, §4.3)
  an undo whose target records were advanced by a later independent edit.
- **Authorization at reversal time** (§5): per-change `permission(originating type)` vs
  the CURRENT actor/ownership; history segregation on login/role/identity change.
- **The publish-boundary rule** (§6): `boundary.crossable` chooses silent-reverse vs
  go-through-and-record; issued records never erased, ids never reused.
- **Scope-driven snap-to-context** (§8): undoing an off-screen change navigates to it.
- **Module cutover order** (§7): scheduler + people + settings + Tracker onto the
  timeline now; Leave War runs the timeline additively and its stack retires after Step 4.
- The next **invariant-harness increment** + undo property tests (§10).

**Out of scope (later steps):**
- Retiring the three snapshot stacks entirely — **after Step 4** (SEQ-004).
- The one-Absence model change itself — **Step 4**.
- Real multi-user session scoping, live remote propagation, cross-client conflict —
  **Step 5** (the shared DB). Step 3 builds the single-client shape they extend.
- The Dataverse adapter, per-record durable persistence — **Step 5**.
- UI/rendering rework beyond wiring the two buttons + the snap-to-context hop.

**Non-negotiables:** `tfin.js` **728/0**; `npm test`/build/e2e/smoke green each phase;
**reset, not migrate**; the perf ceilings hold; **for every module still on its legacy
stack, behaviour is provably identical to today until its cutover phase** (strangler).

---

## 2. What it must dissolve — the bug family, and WHY one timeline removes it at the root

The read-only cross-provider audit (Codex + Fable, 13 Sep 26,
`2026-09-13-sync-delete-undo-integrity-spec.md`) found a family of delete/undo bugs that
all trace to **two whole-world snapshot undo stacks (scheduler + Leave War) sitting over
the same synced data**. When one stack rewinds its photo, it re-drives the diff-reconciler
(`sync.ts` `runOutbound`/`runInbound`), which re-derives the *other* side by comparison —
and every such re-derivation is a guess about which copy wins. The concrete faces:

| Finding | What the user sees | Root (today) | How ONE timeline dissolves it |
|---|---|---|---|
| **A (undo-face)** | Delete an approved leave on the war → it comes back "Raptor-owned" and can't be deleted again | reconciler demotes+rebuilds instead of propagating the delete | The inverse is the **exact record-level before-image** of every touched record, applied directly. Undo never re-runs the reconciler as a guessing pass. |
| **C (DU-001)** | A member can Undo/Redo to reverse an **admin's** Leave War decision | `historyApply` restores a whole snapshot with no role/viewer check; `setRole` doesn't rebaseline history | Reversal is authorized per-change against the CURRENT actor (§5); admin-decision-undone-by-member is REFUSED. History segregates on role/identity change. |
| **D (DU-005/006)** | Undo of a synced leave flips it to Raptor-owned, loses `source`/`shiftedFrom`/remarks, re-mints a fresh `iid` (reads as a late mark); undoing an unrelated war edit resurrects a deleted bid | the demote path re-mints; unrelated snapshots overlap | The before-image already **contains** `source`/`shiftedFrom`/remarks/`iid`; restoring it re-mints nothing. Unrelated edits are separate records, never in this envelope's inverse. |
| **E (F4)** | Delete a leave on the war, Undo → the person shows that leave **twice** | LW Undo restores the bid → reconciler mints a *second* plain row | The inverse restores the *one* prior state of both the bid record and the day record; no second row is derived. |
| **F (F5)** | Filing on inputs what the war already had makes the war copy "Raptor's"; deleting the input later deletes the original | forward reconciliation ownership upgrade | Undo restores exact before-images; the **forward** ownership ambiguity is what **Step 4** (one Absence record) removes — see §7. |
| **I (DU-004)** | Delete/edit an input while on another week → a stale ground row reappears on return | delete cleanup searches only the loaded week's DAYS | The envelope captured **every** touched `days/<wk>#<di>` record (causal children joined the txn at commit time), so the inverse restores/removes landings in **every** affected week, by id — not just the loaded one. |

**The one root fix (RC1/ARCH-02):** an undo is a **replay of recorded inverse data**, not a
re-derivation. Because the Step-2 envelope already carries the deep `before`/`after` of
every record the forward command touched — including causal children that joined the
transaction — the inverse is fully determined data. Applying it as a `restore`-origin
commit reverses both sides of a synced fact *without asking the reconciler to guess*.

> **CRUX-1 for the red-team (the make-or-break correctness question).** At Step 3 the
> Leave War↔inputs sync reconcilers still exist as live subscribers (they become pure
> `onCommit`-by-id handlers only at Step 4). The design REQUIRES that a `restore`-origin
> commit **suppresses the diff-reconciler** — the inverse already contains both sides'
> before-images, so the reconciler must NOT re-fire and re-derive. Mechanism proposed in
> §3.4. If a `restore` commit can still trigger a reconciler pass that re-guesses the
> other side, findings A/D/E are NOT dissolved. This is the first thing the red-team
> must attack.

---

## 3. The model

### 3.1 The timeline
```ts
interface UndoEntry {
  seq: number            // the forward envelope's seq (identity)
  scope: Scope           // WHERE it happened (drives snap-to-context, §8)
  actor: Actor           // WHO did it (authorization + session/actor scoping)
  type: string           // the originating command type (authorization lookup)
  inverse: Change[]      // derived from the envelope: per record, {op:invert, before:after, after:before}, reverse order
  forward: Change[]      // the envelope's own changes (for redo)
  revs: Record<string,number>  // the envelope's post-commit per-record revisions (conflict base, §4)
  boundary?: Boundary    // publish-boundary flag (§6)
  undone: boolean
}
```
- **One list, ordered by `seq`, across all modules.** Only `origin:'user'` envelopes
  become entries (the stream already tags `remote`/`projection`/`restore`/`seed` as
  non-undo — `types.ts` line 18–21). A `projection`/`restore` child's changes are already
  folded into the causal `user` envelope (they share the transaction), so they are never
  separate entries.
- **Undo cursor + redo tail.** Undo reverses the newest not-yet-undone eligible entry and
  moves the cursor back; a **new `user` commit truncates the redo tail** (standard). Redo
  re-applies `forward` as a `restore` commit.

### 3.2 Deriving the inverse
For envelope `E` with `changes = [c1..cn]`, the inverse is `[invert(cn)..invert(c1)]`
(reverse order) where `invert({op,collection,id,before,after}) = {op: op==='put'?(before===undefined?'delete':'put'):'put', collection, id, before: after, after: before}`.
- A `put` with no `before` (record created) inverts to a `delete`.
- A `delete` inverts to a `put` of its `before`.
- Reverse order matters when two changes touch dependent records in one command.
This is pure data from the envelope — no module code, no re-derivation.

### 3.3 Applying the inverse
Undo of entry `E` issues **one** `commitAs(inverseCmd, { origin:'restore' })` whose reducer
enlists exactly the records in `E.inverse` and writes each `after`. Because it goes through
`commit()` it is: **transactional** (all-or-nothing rollback if any record write fails —
SEQ-003 atomicity), **latched** (one repaint/notify at the end, like today), and **recorded**
on the stream as a `restore` envelope (`causedBy: E.seq`) — which is **not** a new `user`
entry, so it does not itself become undoable; instead it flips `E.undone = true`. Redo is the
symmetric `restore` commit of `E.forward`, flipping `E.undone = false`.

### 3.4 Suppressing the reconciler on `restore` (the CRUX-1 mechanism)
The Leave War sync subscribers must treat a `restore`-origin commit as **authoritative,
already-complete data** and **not** run their diff pass. Two candidate mechanisms for the
red-team to choose between:
- **(a) Origin gate.** The reconcilers already run under a suppression token
  (`HIST.lock`/`SYNCING`, carried by the Step-2 latch). Extend that: a `restore` commit
  raises the same suppression for the duration of its apply+release, so the outbound/inbound
  reconcilers no-op while the inverse's own both-side changes are written directly. This
  reuses an existing, tested seam.
- **(b) Explicit both-side inverse.** The inverse `Change[]` *already* contains the war-cell
  record AND the input record before-images (both were in the forward envelope, because the
  causal child joined the transaction — Step-2 §3.2). So even if a reconciler fired, it would
  find both sides already at their prior state and derive an empty diff — provided the
  reconciler is a pure function of state (idempotent). This is the safety net under (a).
**Recommendation:** do BOTH — (a) as the primary guarantee, (b) as the invariant a property
test asserts (a `restore` commit reaches a fixpoint: re-running the reconciler produces no
further Change). Red-team: is (b) actually idempotent given `runOutbound` runs before
`runInbound`?

---

## 4. Conflict detection (SEQ-003) — never clobber a later edit

The classic hazard: A writes X→Y, B writes →Z, then A undoes and must **not** silently
restore X over B's Z. Snapshot stacks get this wrong; the record-level timeline detects it.

### 4.1 The check
Each entry pins `revs` — the per-record revision *after* its own commit. To undo entry `E`,
for each record `r` in `E.inverse`, compare the record's **current** in-memory revision
(the per-record revision map, `types.ts` `revs`, `CommitEnvelope`) to the revision the
timeline last accounted for on that record. If any record has advanced **beyond** what
undo expects — i.e. a later `user` or `remote` commit touched it after `E` and it has not
itself been undone back to `E`'s state — that record is **conflicted**.

### 4.2 Atomicity
The inverse is one `commit()` transaction: enlist all target records, and if the conflict
check (phase-5 invariant, Step-2 §3.2) fails for any, **roll back the whole inverse and
emit nothing** — return `conflict`. An approval's inverse can never restore its bid while
its Absence write is rejected.

### 4.3 Policy on a conflict — OWNER/RED-TEAM CALL (§9-Q1)
Two defensible policies:
- **Refuse-whole** (simplest, safest): if any target record is conflicted, refuse the undo
  with a plain message ("A later change to <thing> is in the way — undo that first"). No
  partial state.
- **Undo-independent-only**: reverse the records that are NOT conflicted, report the ones
  skipped. More convenient, more surface area.
**Recommendation:** **refuse-whole** for Step 3 (pre-live, single-tab conflicts are rare;
the simplest rule can't corrupt), revisit at Step 5 when real concurrency arrives.

---

## 5. Authorization at reversal time (finding C, §3.5 of Step 2)

### 5.1 The rule
Undoing/redoing routes through `commit()`, but the authorization question is not "may this
actor write?" — it is "**may this actor reverse THIS change?**". For every change in
`E.inverse`, evaluate `permission(E.type)` (the originating command's permission) against
the **current effective actor + ownership**:
- A **member** may never reverse a change whose originating command required admin, nor a
  change owned by another `personId`.
- The canonical refusal: **admin makes a decision → toggles View-as-member → tries to undo
  their own admin decision → REFUSED** (Step-2 §3.5; the view-as binding is `ME`, not
  `SESSION`). Ownership `personId` comes from the `ME`/viewer binding (defense-in-depth
  parity now; real identity at Step 5).

### 5.2 History segregation on identity change
Finding C's second half: `setRole` never rebaselined history, so a member inherited an
admin's undoable timeline. Fix at the root: **on real login/logout and on role/identity
change, the timeline is segregated** — entries owned by a different actor are not eligible
for the current actor to reverse, and a logout clears the session's timeline. At Step 3
(single account, `ME` toggle) this is enforced by the per-change ownership check in §5.1;
the full login/logout clearing is the Step-5 multi-user extension (§5.4), designed now.

### 5.3 Redo carries the same gate
Redo re-applies a forward change; it is authorized identically (you may only redo what you
were allowed to undo). No unauthorized state re-enters through redo.

### 5.4 Forward-compatible multi-user shape (FUTURE — capture, don't build)
The single-client design already carries `actor` + `session` on every entry, so the Step-5
rules attach without rework: (1) filter the timeline to `entry.actor.session === current
session` (logout clears); (2) `remote`-origin envelopes are never entries (already true);
(3) an undo is a normal forward `restore` commit the shared DB propagates, so others see it
live; (4) one person's timeline never contains another's `user` envelope. Memory
`future-undo-semantics-multiuser` is the authority; nothing multi-user is built at Step 3.

---

## 6. The publish boundary (SEQ-002 + the 17 Sep owner ruling, reconciled)

Step-2 §3.4 resolved this with the owner; Step 3 is where the contract is consumed and
enforced. The single checkable fact is `boundary.crossable` on a publish envelope:
**has the shared database registered this issued version?**

- **NOT registered (`crossable = true`)** — nothing is on the shared record anywhere. Undo
  reverses the publish **silently** (today's silent-undo-before-sent). Because the issued
  artefact was never seen by anyone, a later re-publish MAY reuse the same issued id — this
  is exactly SEQ-002's "publish AL1 → undo its creation → republish can reuse `iso#1`".
- **Registered (`crossable = false`)** — the issued version is out. The undo **goes through**
  (owner, 17 Sep: *"it will be recorded as this was undone in the history to prevent silent
  bugs"*) but: the issued record is **never erased and its id is never reused**; recovery
  **re-publishes under a NEW id**; a **line in the history** records the undo; and any
  **restored signature bindings are re-validated** (SEQ-002). The undo does not *silently*
  cross a registered publish.

**Reconciling SEQ-002 vs §3.4 (they are the two sides of one boundary, not a contradiction):**
SEQ-002 (13 Sep, Codex) says "undo cannot cross a signed-off publish" and gives the reuse-
`iso#1` example — that is the **pre-registration** case (silent, id reusable because unseen).
The §3.4 owner ruling (17 Sep) governs the **post-registration** case (undo logged, id never
reused). Where the two dates differ, newest wins (memory `newest-instruction-wins`): the
17 Sep ruling is authoritative and SEQ-002 is read as the pre-registration half. **Both are
honoured, neither is dropped.**

**At Step 3 there is no shared database**, so nothing can be registered → `crossable` is
always `true` → only the **silent** path is live and testable. The registered path is
designed and unit-modelled (via `MemoryDoor`) but its real trigger arrives with the Step-5
DB adapter. This mirrors Step 2, where the boundary seam is present but unwired.

> **CRUX-2 for the red-team:** confirm the per-side id-reuse rule (reusable pre-registration,
> never post-registration) is consistent with the amendment engine's identity model
> (`undo-of-publish-semantics`, the amendment phase-2 plan L251–262) and that "undo the act
> of publishing" is well-defined when the publish envelope's inverse would delete a
> `sched.als/<wk>:<n>` record that later ALs were numbered against.

---

## 7. Sequencing vs Step 4 (one Absence record) — SEQ-004, and the recommended interleave

SEQ-004 (accepted in the re-review) is explicit: **do Step 4 (one Absence record) BEFORE
retiring the three undo stacks.** The reason is finding F's *forward* ambiguity — while a
leave fact is stored **twice** (an Input and a war cell) and reconciled by diff, the very
cleanest undo of a leave action is a Step-4 payoff (memory note: "clean input+leave undo
lands at step 4, not before"). Step 3's record-level inverse handles it *correctly* via
before-images, but the belt-and-braces of keeping the LW snapshot stack as a fallback is
worth holding until one-Absence removes the ambiguity for good.

**Recommended build order (a technical sequencing call — flagged plainly to the owner):**
1. **Step 3a — the undo ENGINE + the non-double-storage modules.** Build the timeline,
   inverse application, conflict detection, authorization, snap-to-context; cut **scheduler,
   people, settings, Tracker** onto it (none has the leave double-storage problem). Leave War's
   `user` envelopes are already **on the timeline** (they emit envelopes since Step 2) and
   undo them via record-level inverse, but the **LW snapshot stack stays as the dormant
   fallback**.
2. **Step 4 — one Absence record** (approve/retract as commands, `bid.inputId`, one roster
   projection). Removes the double-storage that finding F's forward path exploits.
3. **Step 3b — retire the three snapshot stacks** onto the global timeline, now that the
   last reconciliation ambiguity is gone. Delete `undo()`/`lwUndo()`/`applyMarkHist()`.

This means **Step 3 and Step 4 designs are siblings and should be red-teamed close together**
(the plan already flags Step 4 "design NOW, before the Dataverse tables freeze"). Step 3's
design does not depend on Step 4's internals; only the **stack retirement** does.

---

## 8. Snap-to-context ([XWEEK-UNDO])

Every entry carries `scope`, so the UI can put the reversed change in front of the user:
- Undoing a `{module:'sched', weekId}` change on a non-loaded week → load that week and
  flash the changed day/rows.
- Undoing a `{module:'lw', warId}` change while on the schedule → open Leave War at that war.
- Undoing a `{module:'trk', courseId, sylId, student?}` change → switch to that course/syllabus
  and centre the affected event.
The navigation hop runs **before** the inverse apply's repaint so the user sees the thing
change. This is the product behaviour the owner asked for (undoing something off-screen shows
you where it happened). Purely a view move — it enlists no records and is not itself undoable.

---

## 9. Open questions — for the owner and/or the red-team

1. **Conflict policy (§4.3):** refuse-whole vs undo-independent-only. *Recommendation:
   refuse-whole for Step 3.* — **owner-flavoured product call.**
2. **One button, or Undo-here vs Undo-anywhere?** The owner asked for ONE global undo and
   snap-to-context, which reads as a single "Undo (last thing you did, anywhere)". Confirm
   there is no desire for a per-area "undo only on this screen" affordance. — **owner call.**
3. **Redo across a snap:** after an undo snaps you to week 3, does Redo re-apply there and
   keep you, or return you to where you were? *Recommendation: stay where the change is, like
   undo.* — **owner-flavoured.**
4. **CRUX-1 (§3.4):** does a `restore`-origin commit provably suppress the reconciler, and is
   the reconciler idempotent as the safety net? — **red-team (correctness).**
5. **CRUX-2 (§6):** id-reuse per boundary side vs the amendment identity model. — **red-team.**
6. **Does keeping three dormant fallback stacks through Step 3a (§7) create a NEW two-systems
   hazard** (the global timeline and a still-live legacy stack disagreeing), or is the legacy
   stack truly dormant once the buttons drive the timeline? — **red-team (this is the exact
   failure mode we are trying to remove; it must not sneak back in during the strangler).**

---

## 10. Testing & invariants (the next harness increment)

Classify first (hard / advisory / frozen — SEQ-001), then property-test the undo layer:
- **(hard)** inverse of an envelope, applied, returns every touched record to its exact
  `before` (deep-equal) — for scheduler, inputs, people, settings, LW cell/bid, Tracker.
- **(hard)** a `restore` commit reaches a **reconciler fixpoint**: re-running the LW sync
  produces no further Change (the CRUX-1 idempotence net, §3.4b).
- **(hard)** undo/redo round-trips N random `user` commands back to the exact start state
  (stateful property test over generated valid AND conflicting command sequences).
- **(hard)** conflict: A:X→Y, B:→Z, then undo A ⇒ `conflict`, B's Z intact, nothing partial.
- **(hard/auth)** admin decides → toggle View-as-member → undo ⇒ REFUSED; member can't
  reverse another `personId`'s change; redo carries the same gate.
- **(frozen)** silent reverse while `crossable`; on the registered side (`MemoryDoor`),
  the issued record is untouched, its id never reused, and a history line is written.
- **(regression, findings A/C/D/E/F/I)** each of the six concrete scenarios from the sync
  spec, driven through the real command layer, produces the correct single-copy result — the
  standing rule (memory `scenario-based-rule-testing`): build the real situation, assert it
  lands right, don't just unit the machinery.
- **(strangler parity)** for each module still on its legacy stack, undo/redo behave
  byte-identically to pre-Step-3 until that module's cutover phase.

Grow the Step-2 `MemoryDoor` + invariant harness; do not build a new framework.

---

## 11. Rollout (all within Step 3; strangler, gate after each)
1. **Engine:** the timeline, inverse derivation, `restore`-commit application, conflict check,
   authorization, snap-to-context, `MemoryDoor` boundary model + the harness increment.
2. **Scheduler** onto the timeline (its `HIST` stack kept dormant as fallback).
3. **People + settings** onto the timeline.
4. **Tracker** onto the timeline (its mark history kept dormant).
5. **Leave War** onto the timeline (its snapshot stack kept dormant — the CRUX-1 module).
6. *(after Step 4)* **Retire** the three dormant stacks.
Each item shippable and gated; nothing merges without "merge live"; a fresh cross-provider
CODE inspection after the build (standard here).

---

## 12. Round-1 red-team → the plan is RESHAPED (owner decision, 17 Sep 26)

Both reviewers (Codex/Astra + Fable 5.1) returned **REVISE** and converged: the design
over-assumed what the shipped Step-2 stream delivers. The command layer is genuinely finished
only for the **scheduler**; for **Leave War** and **Tracker** the causal join, projection
origins, one-envelope-per-gesture and a per-record write seam were **deferred or never built**.
Full findings + fix specs: `2026-09-17-arch-stack-3-global-undo-review-log.md`.

**Owner decision (17 Sep 26):** do **"finish the command layer for Leave War + Tracker" as its
own gated step FIRST** (`[CMDL-FINISH]` in OUTSTANDING.md), then build global undo on the
corrected design. The findings partition as:

**A. Foundation-completion prerequisites → the NEW `[CMDL-FINISH]` step (build BEFORE undo):**
- **F1/GU-001 — the causal both-side envelope.** Route the LW sync reconcilers as
  `origin:'projection'` via `commitInputsAs`/`commitSchedAs`/`cmdCommitAs`; route LW `persist()`'s
  locked/committing branch through a projection commit so a causal write raised in a reducer JOINS
  its envelope and a reconciler write raised from notify becomes a `projection` with `causedBy`;
  fix `causalSeq` so phase-8 subscriber commits chain `causedBy`. Result: one user action's full
  ripple is one causal closure on the stream. This is the load-bearing prerequisite.
- **F8/GU-007 — the per-record write seam.** Add `write(entry)` to `EnlistableStore` per store
  (scheduler/inputs/plan/people/settings/LW/Tracker) that rebuilds live state + derived indexes +
  baselines then persists+notifies; add a scoped per-commit conflict checker reading `expectedRevs`.
- **GU-004 — one Tracker gesture = one envelope.** Group each gesture's synchronous model changes
  (`popGrade`'s mark + Last-Flown; add/delete/import) into one transaction before async persistence.
- **GU-003/F6 — off-week capture.** Register the weekstash as an `EnlistableStore` and enlist it in
  stash writers, OR keep the current off-week refusal until it exists (do not claim finding I solved).
- **F5(partial)/GU-008 — re-key `sched.als/<id>`** by the AL's stable id, not the array index
  (a Step-1 stable-id leak surfaced here; belongs with the foundation).
- **GU-005 — Tracker unsaved structural edits** need a stream-visible undoable draft representation
  before the structural history can retire (scope this in `[CMDL-FINISH]`; it may extend into undo).

**B. True undo-engine design → stays here, folded into Rev 2 AFTER `[CMDL-FINISH]` lands:**
- **F3/GU-002 — reversal authorization.** Replace `permission(E.type)` (all types are `anyone`
  today) with a `mayReverse(E, cur)` predicate whose ownership is derived **from the record** per
  collection; store `E.actor` + derived owners on the entry; same gate for redo.
- **F2 — the guarantee.** Idempotence of the restored **closure** is the guarantee; the suppression
  token is an optimisation only. Carry the forward splice-not-demote fix for finding A (recommended)
  or drop A from the "dissolved" table — do not claim it as-is.
- **F5/GU-008 — boundary live.** Read `boundary.ids.some(issuedDisclosed)` at undo time, not the
  frozen `crossable`; specify the registered-side partial inverse (skip `sched.als`/`sched.orig`
  changes + write a history line); AL1-under-AL2 = conflict via `sched.book` (intended).
- **F4/GU-009 — dormant = UNREACHABLE.** Rewire every entry point (buttons, Ctrl+Z, probe bridge)
  at each module's cutover; `eligibleModules` grown per phase so two systems never drive one
  module's records; single dispatcher; causal-closure entries never truncate the redo tail.
- **F7 — cross-week `acc`.** Strip `acc` as a projection field from the inverse; re-run the landing
  reconcile inside the restore commit.
- **F9/F10 — refuse-whole** makes non-linear scheduler undo mostly refused (the week-wide
  `sched.book` hot record); legacy `HIST` diverges once the timeline is used (state, don't hide).

**Rev 2 is NOT written yet** — it is deliberately deferred until `[CMDL-FINISH]` is built, because
the foundation build changes the exact code this design sits on, and a polished Rev 2 now would be
re-based anyway. The durable corrections are captured above so no thinking is lost.
