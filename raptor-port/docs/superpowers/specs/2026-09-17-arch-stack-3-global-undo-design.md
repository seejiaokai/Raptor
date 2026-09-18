# [ARCH-STACK] Step 3 — one global undo — DESIGN (Rev 2, 18 Sep 26)

> **Status:** Rev 2 — **BUILD-READY pending a fresh dual cross-provider red-team** of THIS
> revision (Codex/Astra + Fable 5.1, both high). Rev 1 was returned REVISE by both reviewers
> (converged) because it assumed Step-2 machinery that was only built for the scheduler. That
> gap has since been closed by **`[CMDL-FINISH]` (merged + live, PR #412/#415)**: Leave War and
> Tracker now have the causal both-side envelope, projection origins, one-gesture-one-envelope,
> the per-store `write()` seam, and guarded-store registration. So Rev 2 rewrites the design on
> the foundation that now genuinely exists, folds in the durable §12-B undo-engine corrections
> and the two items `[CMDL-FINISH]` deferred to this step (CMDLF-002 postouts reproject; whole-
> Import undo granularity), and bakes in the owner's product rulings (below). No code ships until
> this revision is red-teamed clean and the owner says "merge live".
>
> **Method (the 17 Sep lesson, still binding):** every claim about existing machinery below was
> re-checked against CODE (`src/command/types.ts`, `src/state/sched-commit.ts`,
> `src/leavewar/state/store.ts`, `src/state/disclosure.ts`), not against another doc. A doc
> agreeing with a doc is evidence of nothing.

**Depends on:** Step 1 (stable ids everywhere) — DONE. Step 2 (the one command/commit layer +
record-level change stream) — DONE + live (PR #409/#410). **`[CMDL-FINISH]`** (Step-2 completion
for LW + Tracker: causal join, projection origins, one-gesture-one-envelope, `write()` seam,
guarded stores) — **DONE + live (PR #412/#415).**
**Feeds / interleaves with:** Step 4 (one Absence record) — see §7 (sequencing).
**Plan of record:** `2026-09-13-architecture-rootcause-plan.md` (RC1/ARCH-02; SEQ-002/003/004).
**Front-door contract this consumes:** `docs/undo-contract.md` (the durable summary of the command
stream + the `write()` seam + the plug-in checklist). Read it first.
**Round-1 review transcript:** `2026-09-17-arch-stack-3-global-undo-review-log.md` (9 Codex + 10
Fable findings, all accepted). This revision closes every one; §14 maps them.

---

## 0. OWNER RULINGS BAKED IN (product-direction, settled 17–18 Sep 26)

These were the §9 open questions. They are now decided and are NOT reopened by the red-team; the
red-team attacks correctness, not these product calls.

1. **Conflict policy = REFUSE-WHOLE.** If any target record was advanced by a later change, the
   undo is refused whole with a plain message; nothing partial is applied (§4). Owner, 18 Sep 26.
2. **Import undo granularity = ONE UNDO PER WHOLE IMPORT.** A single training-data import (many
   charts/students) is ONE undo entry that removes all of it, not one-per-chart (§10.2). Owner,
   18 Sep 26. This completes the `importClick` item `[CMDL-FINISH]` left per-write.
3. **One global Undo button** — "undo the last thing I did, anywhere", with snap-to-context. No
   per-screen "undo only here" affordance (§8). Owner (13 Sep + confirmed 18 Sep).
4. **Redo stays at the change.** After an undo snaps you to another week/tab, Redo re-applies
   there and keeps you there — same as undo (§8). Coordinator call, 18 Sep, owner not objecting.
5. **On-the-record undo of a registered publish = a line in the history** (not a correcting
   amendment); the issued id is never erased or reused; an export is NOT a boundary event (§6).
   Owner, 17 Sep 26, superseding the 16 Sep "correcting amendment" wording.

---

## 1. THE FRAMING — Step 3 is a CUTOVER, built ADDITIVELY, the legacy stacks retire after Step 4

Step 2 + `[CMDL-FINISH]` were purely additive: they added the stream and the per-store seams and
changed no undo behaviour. Step 3 is the first real **cutover** — it introduces ONE global undo
timeline that the Undo/Redo buttons drive, *replacing* the three separate snapshot stacks. The
cutover is a **strangler**, staged per module, never a big-bang:

- **The new timeline becomes authoritative for the UI**, driving Undo/Redo, one module at a time.
- **The three legacy snapshot stacks are KEPT as a dormant fallback** (scheduler `HIST`, Leave
  War per-war snapshot, Tracker mark/structural history) until Step 4 removes the last
  reconciliation ambiguity (SEQ-004). They are **retired** — `undo()`/`lwUndo()`/`applyMarkHist()`
  deleted — only **after Step 4**.
- **"Dormant" means UNREACHABLE, not merely unused** (round-1 finding F4/GU-009 — the load-bearing
  safety rule). Once a module is cut over, EVERY undo/redo entry point for it — the buttons, the
  Ctrl+Z / keyboard handlers, the probe bridge, any exported handler — routes through the ONE new
  dispatcher; the legacy path for that module is not reachable from any input. Two undo systems
  must never drive one module's records, or the global timeline and a live legacy stack disagree
  on revisions and the very two-systems hazard this whole step exists to remove sneaks back in
  (§9). A surviving legacy call (e.g. an internal restore) may only run as
  `commitAs(restore, system)`.

**What Step 3 delivers:** one Undo button for the whole app, over stable ids, that
(1) dissolves the delete-vs-undo bug family at the root (§2), (2) refuses a member reversing an
admin's or another person's decision (§5), (3) refuses-whole rather than clobbering a later
independent edit (§4, SEQ-003), (4) honours the publish boundary read LIVE (§6, SEQ-002 + the
17 Sep ruling), and (5) snaps the view to where a change was so an off-screen undo is visible
([XWEEK-UNDO]).

**Non-multi-user by construction, but forward-compatible.** Step 3 builds the **single-tab,
single-session, per-actor** timeline. The multi-user rules (undo scoped to login session; never
touches another user; others see your change/undo live from the shared DB; `remote` changes are
never undo entries) are **captured, not built** (memory `future-undo-semantics-multiuser`) and the
shape carries `actor`+`session` on every entry so Step 5 slots in without rework (§5.4).

---

## 2. What it must dissolve — the bug family, and WHY one timeline removes it at the root

The read-only cross-provider audit (Codex + Fable, 13 Sep 26,
`2026-09-13-sync-delete-undo-integrity-spec.md`) found a family of delete/undo bugs tracing to
**two whole-world snapshot undo stacks (scheduler + Leave War) sitting over the same synced data**.
When one stack rewinds its photo it re-drives the diff reconciler (`sync.ts`
`runOutbound`/`runInbound`), which re-derives the *other* side by comparison — and every such
re-derivation is a guess about which copy wins.

| Finding | What the user sees | Root (today) | How ONE timeline dissolves it |
|---|---|---|---|
| **A (undo-face)** | Delete an approved leave on the war → it comes back "Raptor-owned", can't be deleted again | reconciler demotes+rebuilds instead of propagating the delete | Undo applies the **exact recorded before-image** of every touched record, never re-running the reconciler as a guessing pass. **BUT finding A also has a FORWARD face** (war-side delete → demote → re-land raptor-owned, no undo involved) that a record-level inverse cannot reach — see the note below. |
| **C (DU-001)** | A member can Undo/Redo to reverse an **admin's** Leave War decision | `historyApply` restores a snapshot with no role/viewer check | Reversal is authorized per-change against the CURRENT actor via `mayReverse` (§5); admin-decision-undone-by-member is REFUSED. |
| **D (DU-005/006)** | Undo of a synced leave flips it Raptor-owned, loses `source`/`shiftedFrom`/remarks, re-mints a fresh `iid` | the demote path re-mints; unrelated snapshots overlap | The before-image already CONTAINS `source`/`shiftedFrom`/remarks/`iid`; restoring it re-mints nothing. Unrelated edits are separate records, never in this envelope's inverse. |
| **E (F4)** | Delete a leave on the war, Undo → the person shows it **twice** | LW Undo restores the bid → reconciler mints a *second* plain row | The inverse restores the *one* prior state of both the bid record and the day record; no second row is derived (reconciler suppressed on restore, §3.4). |
| **F (F5)** | Filing on inputs what the war already had makes the war copy "Raptor's"; deleting the input later deletes the original | forward reconciliation ownership upgrade | Undo restores exact before-images; the **forward** ownership ambiguity is what **Step 4** (one Absence record) removes — §7. |
| **I (DU-004)** | Delete/edit an input while on another week → a stale ground row reappears on return | delete cleanup searches only the loaded week's DAYS | Conditional — see the off-week note below. |

**The one root fix (RC1/ARCH-02):** an undo is a **replay of recorded inverse data**, not a
re-derivation. The Step-2 envelope already carries the deep `before`/`after` of every record the
forward command touched — including causal children that JOINED the transaction (now genuinely
true for LW after `[CMDL-FINISH]`). Applying it as a `restore`-origin commit reverses both sides of
a synced fact *without asking the reconciler to guess*.

> **Correction to Rev 1 (finding F2/A + F6/I — do NOT re-claim what a record inverse cannot do):**
> - **Finding A's FORWARD face is not dissolved by undo.** The war-delete→demote→re-land bug
>   happens with no undo in play. The GUARANTEE is idempotence of the restored *causal closure*
>   (re-running the reconciler on the restored world yields no further Change); the suppression
>   token (§3.4) is an optimisation, not the guarantee. **We carry the forward fix** as part of
>   this step (recommended, since A is the most-reported bug): a war-side delete of an empty-cell
>   lw-tagged row **splices** the row out rather than demoting it. If the red-team judges the
>   forward fix out of scope, finding A is explicitly **dropped from the "dissolved" table** rather
>   than falsely claimed.
> - **Finding I (off-week) is conditional on weekstash capture.** `decompose()` reads only the
>   loaded `CURWEEK`; stashed weeks live in `engine/weekstash.ts`. `[CMDL-FINISH]` added the
>   `weekstash` logical collection (`types.ts` line 37–38) so a protected-week clear rolls back
>   atomically, but **the stash is only enlisted where a writer enlists it**. Row I is dissolved
>   **iff** the off-week delete path enlists the stash record for every affected week; where it
>   does not yet, the off-week undo **refuses** (honest) rather than half-restoring. §11 (F7/acc)
>   and the build phase for scheduler pin which paths enlist the stash. Do not claim I solved
>   wholesale.

> **CRUX-1 for the red-team (make-or-break correctness).** At Step 3 the LW↔inputs sync
> reconcilers still exist as live subscribers (they become pure `onCommit`-by-id handlers only at
> Step 4). A `restore`-origin commit **must not** let the diff reconciler re-fire and re-derive the
> other side. Mechanism + the idempotence guarantee: §3.4. Attack this first.

---

## 3. The model

### 3.1 The timeline
```ts
interface UndoEntry {
  seq: number            // the forward user-envelope's seq (identity)
  scope: Scope           // WHERE it happened (drives snap-to-context, §8)
  actor: Actor           // WHO did it (snapshot at commit; authorization + session scoping)
  type: string           // the originating command type (kept for logging/debug only)
  owners: RecordOwner[]  // §5.1 — per-change ownership DERIVED FROM THE RECORD at forward time
  inverse: Change[]      // derived from the envelope: per record, invert(), reverse order
  forward: Change[]      // the envelope's own changes (for redo)
  revs: Record<string,number>  // the causal closure's post-commit per-record revisions (conflict base, §4)
  boundary?: Boundary    // publish-boundary flag; registration read LIVE at undo time (§6)
  undone: boolean
}
```
- **One list, ordered by `seq`, across all modules.** Only `origin:'user'` envelopes become
  entries (the stream tags `remote`/`projection`/`restore`/`seed` as non-undo — `types.ts` L21).
- **A timeline entry is a CAUSAL CLOSURE, not a single envelope.** A user action's `projection`
  children (the LW↔inputs reconciler writes, now real `projection`-origin commits with `causedBy`)
  are folded into the entry via their `causedBy` chain: the entry's `inverse`/`forward`/`revs`
  cover the user envelope AND its chained projections. This is what makes the both-side undo
  complete. A projection/restore child is **never its own entry** and its arrival **never truncates
  the redo tail** (round-1 F1/GU-001).
- **Undo cursor + redo tail.** Undo reverses the newest not-yet-undone eligible entry; a new
  `user` commit truncates the redo tail (standard). Redo re-applies `forward` as a `restore`
  commit.

### 3.2 Deriving the inverse
For a closure's ordered `changes = [c1..cn]` (user envelope then its `causedBy` projections in seq
order), the inverse is `[invert(cn)..invert(c1)]` where
`invert({op,collection,id,before,after}) = {op: (op==='put' && before===undefined) ? 'delete' : 'put', collection, id, before: after, after: before}`.
- A `put` with no `before` (record created) inverts to a `delete`.
- A `delete` inverts to a `put` of its `before`.
- Reverse order matters when two changes touch dependent records in one closure.
Pure data from the envelope — no module code, no re-derivation.

### 3.3 Applying the inverse — via each store's `write()` seam
Undo of entry `E` issues **one** `commitAs(inverseCmd, { origin:'restore' })` whose reducer:
1. enlists exactly the stores/records in `E.inverse`,
2. calls each store's **`write(entries, {allowIssued})`** (`types.ts` L142–152) with that store's
   inverse `RecordEntry[]` — apply-all-then-rebuild, refusing issued records unless the boundary
   rule (§6) grants `allowIssued`,
3. lets persist/notify/history fire **once** at the transaction boundary (phase 8) via
   `cmdDeferEffect` — never inline, so no reconciler observes a half-applied world.

Because it goes through `commit()` it is **transactional** (all-or-nothing rollback — SEQ-003
atomicity), **latched** (one repaint/notify at the end), and **recorded** as a `restore` envelope
(`causedBy: E.seq`) that is **not** a new `user` entry — instead it flips `E.undone = true`. Redo is
the symmetric `restore` commit of `E.forward`. This replaces Rev 1's glib "commit() releases the
effects" wording (round-1 F8/GU-007): the seam is explicit per-store `write()` adapters, which
`[CMDL-FINISH]` built and unit-tested for all five stores.

### 3.4 Suppressing the reconciler on `restore` (the CRUX-1 mechanism) — corrected
The inverse already carries BOTH sides' before-images (the causal child joined the forward
transaction). Two layers, per round-1 F2:
- **(a) Origin gate via the registered effect context (the real seam, not a private flag).** Rev 1
  named `SYNCING`/`HIST.lock`; F2 showed `SYNCING` is a private module flag not registered with the
  latch. The correct seam is the **`registerEffectContext`** mechanism `[CMDL-FINISH]` shipped
  (`store.ts` L1226 registers `lw.hist`; the scheduler registers its own): a `restore`-origin
  commit re-installs each registered suppression context for the duration of its apply+release, so
  the outbound/inbound reconcilers no-op while the inverse's both-side changes are written directly.
- **(b) Closure idempotence is the GUARANTEE (not the token).** A property test asserts that after
  a `restore` commit, re-running the LW sync reconcilers produces **no further Change** — i.e. the
  restored closure is a fixpoint. This is the safety net if (a)'s suppression is ever bypassed. The
  red-team must confirm idempotence holds given `runOutbound` runs before `runInbound`.

---

## 4. Conflict detection (SEQ-003) — REFUSE-WHOLE (owner-decided)

The classic hazard: A writes X→Y, B writes →Z, then A undoes and must **not** silently restore X
over B's Z.

### 4.1 The check — inside the transaction (round-1 F8)
Each entry pins `revs` — the per-record revision after its own causal closure committed. The
restore command declares `expectedRevs` (= `E.revs`) and the **phase-5 per-commit conflict checker**
(`Command.expectedRevs`, `types.ts` L177–183) compares each target record's CURRENT in-memory
revision to it. If any record advanced beyond what the timeline expects (a later `user`/`remote`
commit touched it and it has not been undone back to `E`'s state), the commit **rejects as
`conflict`** and rolls back the whole inverse — atomic, nothing partial. The check is INSIDE the
transaction, not a stateless pre-check (Rev 1's gap).

### 4.2 Policy — refuse-whole (owner, 18 Sep 26)
On any conflicted target record, refuse the undo with a plain message ("A later change to <thing>
is in the way — undo that first"). No partial state. Revisit at Step 5 when real concurrency
arrives.

> **Known consequence, stated not hidden (round-1 F9):** `sched.book/<wk>` is a week-wide "hot"
> record (it holds the pending-amendment marks), so many scheduler edits touch it. Under
> refuse-whole, **non-linear scheduler undo is frequently refused** (undo the 2nd-last edit while
> the last still stands → the shared `sched.book` advanced → refused). This is correct-but-strict.
> It is acceptable for Step 3 (single-tab, pre-live); if it proves annoying in the live-view pass,
> the mitigation is Step-4+ record-splitting of `sched.book`, not a partial-undo hack now.

---

## 5. Authorization at reversal time — `mayReverse`, ownership FROM THE RECORD (round-1 F3/GU-002)

### 5.1 The rule
Rev 1 said `permission(E.type)`. That cannot work on shipped code: **every** command permission is
`anyone` today (`lw.edit` is one permissive type for approve/bid/move/stage — `store.ts` L1212), so
`permission(E.type)` would permit a member undoing an admin's decision. Replace it with a Step-3
predicate:

```ts
mayReverse(E: UndoEntry, cur: Actor): boolean
```

evaluated per change, with **ownership derived from the RECORD**, per collection, captured on the
entry at forward time as `E.owners`:

| collection | owner / gate |
|---|---|
| `lw.cell`, `lw.bid` | the person id parsed from the record id (`${warId}:${pid}:${date}`) — only that person, or an admin, may reverse |
| `lw.war`, `lw.ledger`, `lw.balances`, `lw.oilpolicy`, `lw.postouts`, `lw.config`, `lw.current` | admin-only (war-level decisions) |
| `inputs` | `value.person` — only that person, or an admin |
| `days`, `sched.*`, `people`, `settings`, `plan`, `trk.*` | admin-only (schedule/roster/tracker are admin-authored) |

- The canonical refusal: **admin decides → toggles View-as-member → tries to undo their own admin
  decision → REFUSED**, because `cur` is the effective (member) actor and ownership on an admin-only
  record is admin. Ownership `personId` comes from the `ME`/viewer binding, not `SESSION` (Step-2
  §3.5; real identity at Step 5).
- **Redo carries the identical gate** (§5.3) — you may only redo what you were allowed to undo.
- Splitting `lw.edit` into per-operation typed commands (approve/bid/move/stage) is a LATER layer;
  Step 3 gets correctness from record-derived ownership, not from typed permissions.

### 5.2 History segregation on identity change
On real login/logout and on role/identity change, the timeline segregates: entries owned by a
different actor are not eligible for the current actor to reverse, and a logout clears the session's
timeline. At Step 3 (single account, `ME` toggle) this is enforced by the per-change ownership check
in §5.1; full login/logout clearing is the Step-5 multi-user extension (§5.4), designed now.

### 5.3 Redo carries the same gate — see §5.1.

### 5.4 Forward-compatible multi-user shape (FUTURE — capture, don't build)
Every entry carries `actor`+`session`, so Step-5 rules attach without rework: (1) filter the
timeline to `entry.actor.session === current session` (logout clears); (2) `remote`-origin
envelopes are never entries (already true); (3) an undo is a normal forward `restore` commit the
shared DB propagates, so others see it live; (4) one person's timeline never contains another's
`user` envelope. Memory `future-undo-semantics-multiuser` is authoritative; nothing multi-user is
built at Step 3.

---

## 6. The publish boundary — read LIVE (round-1 F5/GU-008 + the 17 Sep owner ruling)

Step-2 §3.4 resolved the policy with the owner; Step 3 consumes + enforces it. The single checkable
fact is **has the shared database registered this issued version?** — read at UNDO TIME, not from
the frozen envelope.

- **Rev 1's bug:** it read `boundary.crossable`, a value sealed at publish time. After
  acknowledgement `crossable` is stale → undo would silently reverse a registered publish. **Fix:**
  evaluate registration LIVE via `issuedDisclosed(id)` (`src/state/disclosure.ts` L46–51 —
  `discloseIssued` records disclosure, `issuedDisclosed` reads it) for each `E.boundary.ids`. The
  frozen `crossable` is ignored.

- **NOT registered (`!issuedDisclosed`)** — nothing is on the shared record anywhere. Undo reverses
  the publish **silently** (today's silent-undo-before-sent). A later re-publish MAY reuse the same
  issued id (SEQ-002's "publish AL1 → undo → republish reuses `iso#1`").

- **Registered (`issuedDisclosed`)** — the issued version is out. The undo **goes through** (owner,
  17 Sep: *"it will be recorded as this was undone in the history to prevent silent bugs"*) but as a
  **partial inverse**: the inverse SKIPS the `sched.als`/`sched.orig` changes (the issued record is
  never erased and its id — now stable, `sched.als/<id>` per `sched-commit.ts` L106 — is never
  reused), the working-copy changes ARE reversed, a **line is written to the history**, and any
  restored signature bindings are re-validated (SEQ-002). Recovery re-publishes under a NEW id.

- **AL1-under-AL2 = conflict, by design (round-1 F5).** Undoing the creation of AL1 when AL2 was
  numbered after it is caught as a **conflict** via the `sched.book`/`sched.als` revision advance
  (§4) and refused — you cannot pull out a middle issued version. State this; do not special-case it.

**At Step 3 there is no shared database**, so `issuedDisclosed` is always false → only the **silent**
path is live and testable against real state. The registered path is unit-modelled via `MemoryDoor`
(its `discloseIssued` trigger), its real driver arriving with the Step-5 DB adapter.

> **CRUX-2 for the red-team:** confirm the live-read registered/unregistered id-reuse rule is
> consistent with the amendment engine's identity model (`undo-of-publish-semantics`; amendment
> phase-2 plan L251–262), and that the partial-inverse (skip `sched.als`/`orig`, write a history
> line) is well-defined when the publish closure also touched `days`/`sched.book`.

---

## 7. Sequencing vs Step 4 (one Absence record) — SEQ-004, recommended interleave

SEQ-004: **do Step 4 (one Absence record) BEFORE retiring the three undo stacks.** While a leave
fact is stored **twice** (an Input and a war cell) and reconciled by diff, the cleanest undo of a
leave action is a Step-4 payoff. Step 3's record-level inverse handles it *correctly* via
before-images, but keeping the LW snapshot stack as a dormant fallback is worth holding until
one-Absence removes the forward ambiguity (finding F) for good.

**Recommended build order (technical sequencing call — flagged to the owner):**
1. **Step 3a — the undo ENGINE + the non-double-storage modules.** Timeline, inverse, `restore`
   application via `write()`, conflict, `mayReverse`, snap-to-context, live boundary; cut
   **scheduler, people, settings, Tracker** onto it. LW's `user` envelopes are on the timeline and
   undo via record-level inverse, but the **LW snapshot stack stays dormant**.
2. **Step 4 — one Absence record** (approve/retract as commands, `bid.inputId`, one roster
   projection). Removes the double-storage finding F's forward path exploits.
3. **Step 3b — retire the three snapshot stacks** onto the global timeline. Delete
   `undo()`/`lwUndo()`/`applyMarkHist()`.

Step 3 and Step 4 designs are siblings and should be red-teamed close together. Step 3's design does
not depend on Step 4's internals; only the **stack retirement** does.

---

## 8. Snap-to-context ([XWEEK-UNDO]) — record-free navigation, ordered AFTER auth+conflict

Every entry carries `scope`, so the UI can put the reversed change in front of the user:
- `{module:'sched', weekId}` on a non-loaded week → load that week and flash the changed day/rows.
- `{module:'lw', warId}` while on the schedule → open Leave War at that war.
- `{module:'trk', courseId, sylId, student?}` → switch to that course/syllabus and centre the event.

Two corrections from round-1 (F/GU-006):
- **Navigation must create NO user envelope and MUST NOT truncate the redo tail.** `selectWar` /
  `switchSyllabus` / `loadWeek` today emit records or mutate acceptance. The snap uses **navigation-
  only** variants (view-state moves that enlist no records, or run as `restore`/`system` so they are
  never `user` entries). A snap is a pure view move; it is not itself undoable.
- **Order: authorize → conflict-check → (only if the undo will proceed) snap → apply.** A refused
  undo must never have moved the view or mutated anything through its snap. The nav hop runs before
  the inverse apply's repaint so the user SEES the change, but after the undo is known to be
  allowed.

---

## 9. Dormant = UNREACHABLE + the single dispatcher (round-1 F4/GU-009)

This is the explicit answer to Rev 1 §9-Q6 and the exact failure mode the whole step removes.

- **One dispatcher.** Every undo/redo entry point in the app — the toolbar buttons, the Ctrl+Z /
  keyboard handlers, `probe-bridge` hooks, and any exported `undo`/`redo` handler — is rewired to a
  single `globalUndo()` / `globalRedo()` dispatcher.
- **`eligibleModules` grows per cutover phase.** The dispatcher only drives modules that have been
  cut over. A module still on its legacy stack keeps its OWN buttons until its phase; the moment it
  is cut over, its legacy entry points are rerouted to the dispatcher and its legacy stack is no
  longer reachable from any input.
- **No module is driven by two systems at once.** This is the invariant a strangler-parity test
  asserts per phase (§12). The Tracker subtlety (round-1 F4): its legacy `doUndo`→`saveLayout`
  already emits a `user` envelope, so leaving it reachable would let a legacy undo become a NEW
  timeline entry — exactly the disagreement we forbid. At Tracker cutover its legacy `doUndo` is
  unreachable.
- Any legacy path that must survive internally (a boot/migration restore) runs only as
  `commitAs(restore, system)`, never as a reachable user undo.

---

## 10. The two folded-in `[CMDL-FINISH]` deferrals

### 10.1 CMDLF-002 — restoring `lw.postouts` must reproject the roster posting-windows
`applyLwRecord` currently sets `s.postOuts = e.value` and stops (`store.ts` L1147–1157). But the
people **posting-windows** on the roster are a PROJECTION built by `reprojectRoster` from each
person's CURRENT `ex.from/ex.to`, not from `postOuts` — so a postouts-only record restore is
invisible to the roster and the windows are stale.

**Completion (the undo CONSUMER's orchestration, per the deferral marker):** when a `restore`
closure includes an `lw.postouts` change, the restore commit — which already holds the clean-
projection context and suppresses the reconcilers (§3.4) — after applying the record, re-lays the
restored `postOuts` over the CLEAN Raptor projection: `setPeople(projectPeople())` then the posting-
window pass, INSIDE the restore commit's deferred boundary, under the effect-context suppression so
it does not re-enter the LW↔Raptor reconcilers as a fresh user action. This crosses the LW↔Raptor
boundary `sync.ts` owns, which is why it belongs to the consumer, not to the bare `applyLwRecord`.
A property test: approve/retract a posting-out, undo, assert both `postOuts` AND every roster
posting-window equal the pre-state (deep-equal), and the reconciler reaches a fixpoint.

### 10.2 Whole-Import undo granularity — ONE undo per import (owner, 18 Sep 26)
`importClick` was left per-write at `[CMDL-FINISH]` (each chart/student its own commit) because
`applyCharts`/`applyStudents` are large async guardrail paths with `loadCourse` reloads inside. The
owner has ruled a whole import is **ONE** undo entry.

**Approach:** the import stays async on the OUTSIDE (reads, prompts, `loadCourse` reloads stay
outside `commit`, per the one-gesture rule), but its synchronous model writes across all charts +
students are grouped into **one causal closure** — a single `user` commit whose reducer applies
every chart/student record, with the per-chart reloads sequenced as `projection` children joined by
`causedBy` (or, if a reload must be async, the import is staged so all record writes land in one
commit and the reloads are pure view rebuilds after). One import → one timeline entry → one undo
removes all of it. This is a Tracker-cutover-phase build item (§13 phase 4); a property test drives
a multi-chart import then a single undo and asserts the catalogue/marks/roster return to pre-import
state.

---

## 11. Cross-week `acc` handling (round-1 F7)

`inputs.acc` is per-loaded-week *derived landing* state carried on a global `inputs` record. A naive
cross-week undo snap-loads the target week then restores a stale `acc` → a false landing, and it
also trips the "exact before-image" invariant on every cross-week undo.

**Fix:** the inverse **strips `acc` as a projection field** (it is derived, not authored), and the
restore commit **re-runs the landing reconcile** for the affected week INSIDE the restore
transaction (as a suppressed projection, same as §3.4), so `acc` is recomputed from the restored
authored state rather than replayed stale. Long-term, `acc` moves onto the day record (Step 4+); for
Step 3 the strip-and-recompute is sufficient and is asserted by a cross-week undo property test.

---

## 12. Testing & invariants (grow the Step-2 `MemoryDoor` + harness — do not build a new framework)

Classify first (hard / advisory / frozen — SEQ-001), then property-test the undo layer:
- **(hard)** inverse of a closure, applied, returns every touched record to its exact `before`
  (deep-equal) — scheduler, inputs, people, settings, LW cell/bid/**postouts+roster windows**,
  Tracker.
- **(hard)** a `restore` commit reaches a **reconciler fixpoint**: re-running LW sync produces no
  further Change (the CRUX-1 idempotence net, §3.4b) — including the postouts reproject (§10.1) and
  the `acc` recompute (§11).
- **(hard)** undo/redo round-trips N random `user` commands back to the exact start state (stateful
  property test over generated valid AND conflicting sequences), and **redo carries the auth gate**.
- **(hard)** conflict: A:X→Y, B:→Z, then undo A ⇒ `conflict`, B's Z intact, nothing partial;
  `sched.book` week-wide record behaves as §4.2 states.
- **(hard/auth)** admin decides → toggle View-as-member → undo ⇒ REFUSED; member can't reverse
  another `personId`'s change; redo same gate — via `mayReverse` with record-derived ownership.
- **(hard)** whole-import: multi-chart import → ONE undo ⇒ pre-import state (§10.2).
- **(frozen)** silent reverse while `!issuedDisclosed`; on the registered side (`MemoryDoor`
  `discloseIssued`), the issued `sched.als/<id>` is untouched, its id never reused, the working copy
  IS reversed, and a history line is written (§6).
- **(hard/strangler)** for each module still on its legacy stack, undo/redo behave byte-identically
  to pre-Step-3 until that module's cutover; after cutover, **no module is reachable by two undo
  systems** (§9) — assert the legacy entry point is unreachable.
- **(regression, findings A/C/D/E/F/I)** each concrete scenario from the sync spec, driven through
  the real command layer, produces the correct single-copy result (memory
  `scenario-based-rule-testing`: build the real situation in the running app, assert it lands right,
  don't just unit the machinery). Finding A includes the FORWARD splice fix (§2) or is dropped from
  the table.

---

## 13. Rollout (all within Step 3; strangler, all five gates green after each phase; nothing merges
without "merge live"; a fresh cross-provider CODE inspection after the build)
1. **Engine:** the timeline + causal-closure entries, inverse derivation, `restore`-commit
   application via `write()`, the phase-5 conflict checker wired to `expectedRevs`, `mayReverse`
   authorization, snap-to-context (record-free nav), live boundary via `issuedDisclosed`, the single
   dispatcher, `MemoryDoor` boundary model + the harness increment. **No module cut over yet.**
2. **Scheduler** onto the timeline (its `HIST` stack kept dormant + made unreachable at its entry
   points); includes the `acc` strip-and-recompute (§11) and the off-week/weekstash enlistment
   decision (finding I, §2) — enlist or keep-refusing, explicitly.
3. **People + settings** onto the timeline.
4. **Tracker** onto the timeline (mark + structural history kept dormant + unreachable); includes
   whole-import = one undo (§10.2) and the undoable-draft representation for unsaved structural edits
   (round-1 GU-005) so structural undo coverage is not lost.
5. **Leave War** onto the timeline (snapshot stack kept dormant + unreachable — the CRUX-1 module);
   includes the postouts reproject (§10.1) and the forward splice fix for finding A (§2).
6. *(after Step 4)* **Retire** the three dormant stacks.

Each item is shippable and gated. The forward finding-A splice fix (phase 5) is the one behaviour
change outside undo itself — called out in its own commit with its own regression test.

---

## 14. Round-1 findings → where Rev 2 closes each

| round-1 | closed in Rev 2 |
|---|---|
| GU-001 / F1 — causal both-side envelope didn't exist | Now built (`[CMDL-FINISH]`); §3.1 causal-closure entries; §3.4a uses the real `registerEffectContext` seam |
| GU-002 / F3 — `permission(E.type)` insufficient (all `anyone`) | §5 `mayReverse` with ownership DERIVED FROM THE RECORD per collection |
| GU-003 / F6 — off-week / weekstash not captured | §2 note + §11: conditional on stash enlistment; refuse where absent; do not over-claim I |
| GU-004 — one Tracker gesture ≠ one envelope | Now built (`trkGesture`, `[CMDL-FINISH]`); §10.2 whole-import one closure |
| GU-005 — Tracker unsaved structural edits lost if history dormant | §13 phase 4: undoable-draft representation before structural history goes dormant |
| GU-006 — snap mutates records / truncates redo | §8: record-free nav, ordered after auth+conflict, no user entry |
| GU-007 / F8 — effect contract glib; no `write()` seam | Now built (`write()` per store, `[CMDL-FINISH]`); §3.3 explicit per-store adapters |
| GU-008 / F5 — boundary read from frozen `crossable`; `sched.als` array-indexed | §6 live `issuedDisclosed`; `sched.als/<id>` now stable-id-keyed (built); registered-side partial inverse specified |
| GU-009 / F4 — dormant stacks reachable | §9 dormant = UNREACHABLE + single dispatcher + per-phase `eligibleModules` |
| F2 — suppression token is not the guarantee; finding A is a forward bug | §2 correction + §3.4b closure idempotence IS the guarantee; forward splice fix carried (or A dropped) |
| F7 — cross-week `acc` restored stale | §11 strip `acc` + recompute inside the restore |
| F9 — `sched.book` hot record → refuse-whole refuses a lot | §4.2 stated as a known consequence, not hidden |
| F10 — legacy `HIST` diverges once timeline used | §9 unreachable rule makes this moot; not claimed behaviour-identical after cutover |

**Revision history:** Rev 1 (17 Sep 26) — first design, both-provider red-team → REVISE (converged).
Round-1 transcript: `2026-09-17-arch-stack-3-global-undo-review-log.md`. Rev 2 (18 Sep 26) —
rewritten on the now-built `[CMDL-FINISH]` foundation; folds §12-B corrections + CMDLF-002 +
whole-import; bakes owner rulings §0. **Next: fresh dual red-team of Rev 2, then build.**
