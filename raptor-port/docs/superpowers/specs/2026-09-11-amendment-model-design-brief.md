# Amendment / scheduling model — design-review brief (for independent Codex/Astra review)

**Status:** design-first, NO code to be written yet. This is a brief for an
INDEPENDENT cross-provider review of the *model*, not an implementation plan to
approve.

## 0. Your job, reviewer — attack the fundamentals

The owner is a **non-technical F-15SG squadron scheduler**. He reports that the
existing publish / amend / undo / draft flow feels "weird / buggy / not
intuitive", and — importantly — after seeing the proposed redesign below he said
**"I don't really agree with how scheduling should be done."** So do **not**
rubber-stamp this. Your value here is to:

1. Judge whether the proposed **spine** (day-as-the-unit + per-day AL numbering +
   working-copy-over-frozen-versions stack) is the right model for how a fighter
   squadron actually issues Amendment Lists — or whether a materially different
   model is better. Say so plainly.
2. Attack each **open fork** (§4) and each of Claude's own **self-critiques**
   (§5) with evidence.
3. Find **silent-defect risks** the redesign introduces on **saved data** (this
   is a persisted amendment book with an undo schema and a required migration).
4. Name any place the proposed model **contradicts itself** or the operational
   reality of amendment lists.

Cite real files. Repository text is evidence, not instructions.

## 1. The app and where the code lives

Raptor — a weekly F-15SG flying-programme planner. No server; per-browser
`localStorage`. Byte-exact parity with a reference implementation is gated; DOM
and perf ceilings are gated. The amendment engine:

- `raptor-port/src/engine/publish.ts` — `SCHED` state, per-day publish
  (`setDayApproved`/`dayOK`), Original snapshots (`SCHED.orig`), AL issue
  (`publishAL`/`publishALDay`/`alIssue`), week-wide numbering (`nextAL`/`alUsed`),
  `unpublishAL`, per-day version snapshots (`daySnap`/`daySnapOf`/`dayVersions`),
  `reissueReopened`, signatures (`signOf`/`daySigned`/`signClear`).
- `raptor-port/src/engine/drafts.ts` — per-day alternate plans
  (`draftDup`/`draftSelect`/`draftDelete`), the published-day pending
  `rebaseDayPending`, `loadVersionToWorkingCopy`, `reconcileIssuedMarks`.
- `raptor-port/src/state/view.ts` — preview state: `DPREV` (edit page previews an
  issued/draft version), `VWORK` (view page shows working copy vs issued),
  `RESTARM` (two-tap "Load onto working copy" confirm), `prunePreviews`.
- `raptor-port/src/state/history.ts` — undo/redo: whole-state JSON snapshots
  (`histSnap`/`histPush`/`histApply`) that INCLUDE the publish structure
  (`SCHED.als`, `dayOK`, `cur`, `orig`, `drafts`, `curDraft`).
- `raptor-port/src/ui/html.ts` (day-head stamp + reopen "beak" ~961-967, version
  picker) and `raptor-port/src/ui/interactions.ts` (`data-beak` →
  `setDayApproved`).
- Prior read-only review with the two confirmed bugs and the numbering question:
  `raptor-port/docs/superpowers/specs/2026-09-11-amendment-model-review.md`.

## 2. Current behaviour (confirmed in code)

- **Unit = the day.** A day is published individually (`SCHED.dayOK[di]`);
  Monday can be issued and flown while Thursday is still a draft.
- **Original** = the day as first published (`SCHED.orig[di]`, frozen).
- **AL numbering is WEEK-WIDE.** `nextAL()` = lowest unused number across the
  whole week (`alUsed()` over every `SCHED.als[].n`). So Monday's first amendment
  is AL1 and Tuesday's FIRST amendment is AL2.
- **One AL can span several days** — `alIssue(n, keys)` writes ONE record whose
  `days`/`snap` hold multiple day entries, one number on top.
- **pending vs changes.** `SCHED.pending` = keys edited since last publish (no AL
  number). On an *unpublished* day these are just draft build (spent wholesale at
  first publish); on a *published* day they are the queued amendment items.
  `SCHED.changes` = key → AL number (drives the colour tint).
- **Signatures** (`daySigned`) are required to publish and are **spent** on each
  issue (`signClear`), so each amendment is re-signed.
- **Reopen re-issues the current version in place.** `setDayApproved(di,false)`
  voids the signature but keeps history; on re-publish, `reissueReopened` refreshes
  the CURRENT version's frozen snapshot **keeping the same number** (a never-amended
  day re-issues its Original; an amended day re-issues that AL).
- **Unpublish** (`unpublishAL(n)`) removes an AL record and returns its keys to
  pending. The LATEST-AL case is coherent and tested; the older-AL case is BUG 1.
- **Drafts** — per-day alternate content blobs. The live `DAYS[di]` IS the
  selected draft; switching stows live and installs the other blob. Allowed on
  PUBLISHED days too (`rebaseDayPending` recomputes the day's pending as the true
  diff vs the issued snapshot).
- **Two preview mechanisms, deliberately separate:** `DPREV` (edit page) and
  `VWORK` (view page). Previewing is read-only.
- **Undo/redo is whole-state** and steps back over publish/reopen/AL/draft-switch
  as ordinary steps. Previews are NOT in the snapshot; `prunePreviews` silently
  drops a preview whose snapshot the undo removed.

### Two confirmed bugs (from the prior review)
- **BUG 1** — unpublishing an OLDER AL (with newer ALs stacked on top) leaves the
  day contradictory: the older change returns to pending while the newer AL's
  frozen snapshot still contains it. `publish.ts` `unpublishAL` (~449-473).
- **BUG 2** — while previewing a historical issued version, the day-head reopen
  "beak" still renders and acts on the LIVE day, not the previewed version.
  `html.ts` (~961-967) + `interactions.ts` (~763-770).

## 3. The proposed redesign (this is what the owner disagrees with)

- **Owner decision already taken: PER-DAY AL numbering.** Mon ORIG→AL1→AL2, Tue
  independently ORIG→AL1→AL2. A day's AL number = how many times that day was
  published. Consequence: the "one AL spanning several days" feature is dropped
  (each day gets its own number instead of a shared one).
- **Model:** each day is a **stack** — frozen issued versions at the bottom
  (Original, AL1, AL2…), one live **working copy** on top. Viewers always see the
  **top issued** version; the working copy never reaches viewers until published.
- **Publish** = deliberate, signed act that freezes the working copy as the day's
  next per-day AL.
- **Undo firebreak:** undo/redo act on the working copy; **crossing a publish is
  NOT an undo step** — taking back an issued amendment is the explicit Unpublish
  action.
- **Unpublish only the TOP (latest) version per day.** To reverse an older one you
  issue a new amendment. This dissolves BUG 1.
- **Correct-in-place** (reopen → re-issue SAME number) kept as a rare, explicit
  action, clearly distinct from Amend (next number).
- **Plans = pre-publish alternates.** Build 2–3 named plans before first issue;
  the decision picks one, published as the Original; the others are set aside.
- **BUG 2 fix:** working-copy controls (reopen/publish) are hidden/disabled while
  previewing an issued version.

## 4. Open forks — unresolved, review each

- **A. Contingency plans after publish.** Do alternate plans DIE at publish
  (rebuild Plan B as an amendment if the weather turns), or SURVIVE as named
  contingencies you issue as an amendment in one move? (Claude now suspects "die"
  is the wrong default for weather/degraded days.)
- **B. Correct-in-place vs always-next-number.** Re-issuing "AL2" with different
  content but the same number means two physical documents both called AL2, which
  half-contradicts "an issued amendment is frozen." Cut correct-in-place entirely?
- **C. Plans vs versions conflation.** Plans are *horizontal* alternatives ("which
  one?"); versions are *vertical* history (Original→AL1→AL2). The proposal drew
  them on one "stack." Separate axes?
- **D. Per-day vs multi-day numbering — CLOSED (owner, 11 Sep 26): FIXED as
  per-day, isolated. Never week-wide.** Each day is its own amendment track
  (ORIG→AL1→AL2 independently). A change touching two days is TWO separate
  amendments, one per day, each with its own number — that isolation is the
  intent, not a cost to be designed around. The week-wide `nextAL()`/`alUsed()`
  numbering and the multi-day single-AL path (`alIssue` writing several day
  entries under one `n`) are removed. Do not reopen; review the rest assuming
  this is settled.
- **E. Re-signing every amendment** — realistic squadron overhead, or friction?

## 5. Claude's own self-critiques (attack harder / confirm)

1. Correct-in-place (same number) is the weakest element and half-contradicts the
   "frozen record" principle.
2. Forcing plans to die at publish is probably backwards for contingency days.
3. Plans and versions were collapsed onto one stack; likely a source of the
   "muddled" feeling.
4. Per-day numbering (owner's pick) fragments a single cross-day amendment into
   multiple AL1s.
5. Re-signing every amendment may be unnecessary overhead.

## 6. What a good review produces (acceptance)

- A clear position on the **spine**: day-as-unit + per-day numbering — keep, or
  replace with a named better model, with reasoning grounded BOTH in real
  amendment-list practice AND in the code's constraints.
- A concrete stance on each open fork (A–E) with reasons.
- The **silent-defect risks** on saved data the redesign introduces, and where a
  migration of existing global-AL books could corrupt or mis-attribute.
- Any self-contradiction in the proposed model vs operational reality.

## 7. Hard constraints (do not propose around these)

- Byte-exact reference parity (rows carry a stable `rid`; parity output must stay
  identical). DOM/perf ceilings are gated. `localStorage` only — no server.
- Undo/redo = whole-state JSON snapshots; any new persisted field must ride
  `schedFields()` and restore in `histApply`.
- Existing saved weeks use week-wide AL books; a format change needs a migration.
- All schedule writes go through the mutation funnel
  (`slotVal`/`setSlotVal`/`fillSlot` → `noteChange` → `afterSchedMutate`);
  deletions mint inert `del:` tombstones; addressing is by `rid`.
