# OIL fix-plan red team — Codex, independent (22 Sep 26)

Scope: static review of the hand-pass evidence, the ordered fix list, the rulings and the production
paths named in the brief. I changed no code, ran no gate, and started or stopped no server.

This is not an endorsement of the list. Two repairs on the list have the wrong shape:

1. a person/request pair is still not a sufficient address unless it also belongs to one
   **assignment incarnation**; otherwise A → B → A revives A's old refusal;
2. making a multi-day request land on every covered day would repair OIL by corrupting the meaning
   of every request in validation, availability, printing and amendments.

## Answer first: what owns an OIL decision?

An admin's per-person OIL override belongs to **the person–request assignment**, not to the person
alone and not to the request alone. More precisely, its address is:

`person + input iid + assignment incarnation + day`

The day is already supplied by `Day.oild`. The missing part is the assignment incarnation.

- Request-only is wrong: a refusal follows the request to a new worker. That is the observed loss.
- Person-only is wrong: a refusal follows the man after he has left this request and can ambush an
  unrelated future placement.
- A bare person/request pair is also wrong: A → B → A makes the old `A|i:iid` key live again. The
  current comment in `engine/oilev.ts` lines 119–123 notices that the old key becomes dormant; it
  does not notice that dormancy is reversible.

The clearing rule is therefore a lifecycle rule, not a delete-one-key rule:

1. Any change of `input.person` ends the old assignment and creates a new incarnation.
2. The member's `row.oil` answers are void and the new holder must answer every applicable day
   again. An unanswered new holder earns nothing; the UI must not silently present that as a
   scheduler refusal.
3. Every admin per-person override made in an older incarnation becomes unreachable, for every
   covered date and every parked week. Returning the request to the first holder creates another
   new incarnation; it does not revive the first one.
4. Undo restores the old person, answer and incarnation together, so Undo legitimately restores
   the old decision. A later ordinary edit of times or remarks does not change the incarnation.
5. On an already-published day, the rule is identical but applies only to the **working copy**. The
   issued snapshot keeps the old holder, old answer and old decision under R-1/OIL24 until AL is
   published. The reassignment, new answer and incarnation change are one input transaction, clear
   the sign-offs, and produce one real OIL/input amendment. Before AL, the old holder's issued money
   remains; after AL, the old holder is withdrawn and the new holder is credited from the new
   issued evidence.

Do not implement this by sweeping only `DAYS`. A request can cover a stashed week, and a loaded-day
sweep would leave a refusal waiting off-screen. Persist a small assignment generation on the input
(legacy absent = generation 0), increment it in the shared person-change commit, freeze it in
`OilInputEv`, and include it in the per-person decision address. That makes old decisions inert in
loaded days, parked plans and stashed weeks without rewriting an issued snapshot. Stale keys may be
garbage-collected when their day is next written, but correctness must not depend on that cleanup.

## Ranked attack on the ordered fixes

### Rank 1 — Fix 1: reassignment carries a refusal — **KNOWN defect; NEW plan-shape correction**

#### Shape

The defect is not simply “the decision is keyed to the request.” `personDecision()` already reads
`Day.oild.people[person|item]`, and `item` is `i:<iid>` for an input. It is a pair today. Two missing
operations combine to make it look request-keyed:

- `oilGate()` decides that a person-only edit is already covered when the dates and amounts match,
  so it does not ask the new holder. Its staleness test at `ui/inputedit.tsx:657–659` never compares
  `draft.person` with `prevRow.person`.
- `commitInputEdit()` then deletes `row.oil` at `ui/inputedit.tsx:1027–1034`. With no new member
  answer, `itemDefaultFor()` and `oilEarnedWork()` correctly default the input to no OIL.
- The old `oldPerson|i:iid` override remains in `Day.oild.people`. It is dormant while somebody
  else holds the request and becomes live again if the request returns to the old holder.

The wrong repair is either “key it to the pair” (already true and still resurrects) or “delete the
old person's key from the loaded day” (misses other covered days, stashed weeks and A → B → A after
a later refusal). Use an assignment generation as described above.

#### Blast radius

- Inputs page, board input editor, calendar reassignment and any direct reassign helper must all
  pass the same `oilGate()` and `commitInputEdit()` lifecycle. Fixing one React form leaves another
  door open.
- The input-derived ground row is deleted and recreated during relink. Its scheduler-added `more`,
  `cx`, `info`, flag and row identity preservation must remain intact.
- The generation becomes part of frozen evidence, signature binding, `oilEvidenceKey()`, plan
  parking, persistence, schema validation and global Undo/Redo.
- A published reassignment must not edit `snap.d.oilev` or move money before publication. A helper
  that mutates snapshots to “clear” the old key violates the full freeze.
- Multi-day and cross-week requests are the trap: the old decision can live on a different day's
  `oild` in a stashed week. An epoch address handles that; a local deletion does not.
- D18's extra man on the landed row must use the same assignment incarnation for his override. The
  generation is a property of the request assignment, not only of the filer.

#### Rulings in conflict

- **OIL10** requires the member's answer to be the default. Failing to re-ask the new holder turns
  “unanswered” into a silent denial.
- **OIL25** is too broad as written. An iid survives an ordinary member edit, but a person change is
  not ordinary continuity. Revise it to say “iid plus assignment incarnation; time/remarks edits
  retain the incarnation, person changes do not.”
- **OIL24 / D2 (R-1)** forbids clearing or recomputing the issued decision before an amendment.
- **OIL29** requires the live projection to derive current assignment evidence while the issued
  block stays frozen.
- The person-change prose in `docs/engine-rules.md:1759–1763` says the member answer is void, but it
  omits the admin override and the hand-back case. `engine/oilev.ts:119–123` is likewise incomplete.

#### Exact repair, in order

1. Red first in `src/ui/oilconfirm.test.tsx`: create an answered Saturday input for A, set
   `A|i:iid` to `deny`, edit only the person to B, and assert that `OilConfirm` opens naming B.
   Save B's Yes; change B → A and assert the sheet opens again and A does not inherit the old deny.
2. Red first in `src/engine/oilev.test.ts`: pin three generations of the same iid. Generation 0/A
   deny must not apply to generation 1/B or generation 2/A. An ordinary remarks/time edit that does
   not invalidate the amount must keep the generation and its decision.
3. Add a persisted numeric assignment field to input records (name it for OIL, not a generic row
   revision). Treat absence as `0`; add it to the input schema/persistence tests. Do not use a
   timestamp or the mutable person id as the generation.
4. In `oilGate()` (`ui/inputedit.tsx`), compare `draft.person` with `prevRow.person`. A person change
   is always stale and returns `kind:'ask'`; pass an empty `prev` so the old holder's choices are not
   preselected for the new holder.
5. In `commitInputEdit()` (`ui/inputedit.tsx`), at the already-captured `wasPerson` call site,
   increment the assignment generation exactly when the normalized saved person differs. Keep the
   existing `delete r.oil`. This runs inside the existing `writeInputsBatch()` call, so person,
   answer, generation and relink remain one Undo step.
6. Add the generation to `OilInputEv` and `projectOilInputs()` in `engine/oilev.ts`, and to
   `OILINP` in `engine/schema.test.ts`.
7. Replace the literal `${person}|${item}` construction shared by `personDecision()` and
   `toggleOilPerson()` with one exported address helper. For `i:<iid>`, resolve the input's frozen
   generation from `ev.inputs`; for ordinary rows retain the current person/item address. Both read
   and write must call the same helper.
8. Include the generation in `oilEvidenceKey()`. Do not mutate issued evidence and do not make the
   key depend on live `INPUTS` when `ev` is a snapshot.
9. Red integration test in `src/leavewar/oilsync.test.ts`: publish Original for A, deny and publish
   AL1, reassign to B and answer Yes. Before the next AL, A's issued result remains and B has not
   replaced it; after AL, A is withdrawn and B is credited. Then B → A must ask again and must not
   restore the AL1 denial.
10. Add a cross-week variant with the refusal on a stashed covered day. The old key may remain in
    serialized `oild`, but the new generation must make it unreachable. Add an Undo/Redo assertion
    proving that Undo restores the prior generation and its decision atomically.

### Rank 2 — Fix 2: multi-day request pays nothing — **DISAGREE**

#### Shape

Do **not** make the request land on every day it covers. `acceptInput()` deliberately creates one
source row, `acceptedDay()` deliberately returns one anchor, and the idempotency guard rejects a
second `ground[].src === iid`. One row represents the request; it is not a daily repeating task.

The actual defect is local to evidence eligibility. `projectOilInputs()` correctly projects the
claim for every covered ISO. `oilInputEligible(day, inp)` then insists that a landed claim have its
source row on the day being paid. A Friday-anchored request therefore fails on Saturday even though
Saturday's member answer is frozen correctly.

The money should read the request directly, but it must not lose what the one source row presently
means: landed versus dormant, cancelled, information-only or deleted. That row is the request's
single schedule standing, and R-2 uses it to suppress the claim.

#### What the listed repair would break

- Every covered day would become a real scheduled event for clash validation, crew-rest/run logic,
  busy/ALL AVAIL filtering and the palette, even when the request is one continuous commitment.
- The request would print and publish repeatedly and would acquire several row ids, amendment
  marks, delete targets, histories and possibly different hand edits.
- `acceptInput()`'s exact-iid idempotency guard at `engine/slots.ts:376–377`, `acceptedDay()`,
  `unacceptInput()`, relink and restore reconciliation all assume one landing. Relaxing that guard
  makes duplicate acceptance possible; keeping it prevents the proposed repair.
- Cancellation or `ⓘ` could diverge per clone. The app would have no answer for whether cancelling
  Tuesday cancels the request, Tuesday only, or all copies.
- Cross-week spans would duplicate into multiple week books and turn one input edit into an
  off-week schedule mutation, colliding with quarantine and global Undo.
- Leave, medical, overseas duty and courses share the input architecture. A generic “land each
  day” change is not confined to OIL.

#### Rulings in conflict

- The established one-row `acceptInput()` / `acceptedDay()` contract and its stable-iid
  idempotency rule.
- **OIL28**: cloning rows creates apparent schedule work; an allow may count work, not invent it.
- **OIL29**: the live candidate should derive the request and freeze it once, not materialize a
  changing set of rows.
- **OIL24 / R-1**: the issued block must freeze the source row's effective standing for every
  covered day.
- **R-2 / OIL13 / current OIL31**: cancel, info, deletion and dormancy of the one landed row must
  suppress the claim on all covered days.

#### Exact repair, in order

1. Red first in `src/engine/oilev.test.ts`: one Fri–Mon Training, one Friday source row, Saturday
   Yes and Sunday No. Assert Saturday produces the input span and Sunday does not. Add variants
   where the one Friday row is `cx`, `info`, deleted and restored; its state must govern every
   covered day.
2. Red first in `src/engine/slots.test.ts` (or the existing accepted-input suite): after publishing
   every covered day there is still exactly one `ground[].src === iid`. This is the guard against
   “fixing” the test by cloning rows.
3. Extract a read-only source-row locator from the duplicated scan in `acceptedDay()` and
   `landedOnUnloadedWeek()`. It must look in the loaded `DAYS` first and in readable stashed weeks
   second, skipping the current week's stale stash. It returns the one source row and enough state
   to distinguish active, `cx`, `info`, deleted/missing and never-landed.
4. Extend `OilInputEv` with a normalized frozen standing, not merely raw `acc`: for example
   `unlanded | unavailable | active | cancelled | info | dormant | dangling`. Build it once in
   `projectOilInputs()` from the input and the single source-row locator.
5. Change `oilInputEligible()` to consume only that frozen standing plus `asks` and `win`; remove
   its current-day `ground` lookup. `oilEarnedWork()` then pays Saturday from Saturday's frozen
   input evidence while respecting Friday's one-row state.
6. Include the normalized standing in `oilEvidenceKey()` and the schema. Do not include a volatile
   implementation value that changes during reload if its effective standing did not change.
7. Add a cross-week red test: a Fri–Mon request landed on Friday in the previous week's stash must
   pay an answered Monday from the same single row; cancelling the anchor must suppress Monday.
8. Finish with `src/leavewar/oilsync.test.ts` through `setSign()` and the real publication path:
   Saturday Yes lands, Sunday No does not, and schedule work on the same days pools into the same
   envelope. Assert one source row before and after publication.

### Rank 3 — Fix 8: D18, the second man on a landed request row — **KNOWN ruling; NEW mirror-bug warning**

#### Shape

The tempting repair is to remove `if (g.cx || g.src) return` in `dayOilWork()`. That is wrong. It
would feed the filer through the schedule half, whose default is Yes, and thereby override the
member's No. The same owner would enter twice: once as unconditional scheduled work and again as
the answered input claim.

D18 requires a split inside a source row:

- the request owner remains exclusively in the input half, governed by the member answer and the
  admin override;
- scheduler-added `g.more` people are schedule work, governed by their own per-person override on
  the same request item;
- no person is emitted twice, and `cx`, `info`, missing times and dormancy suppress both halves.

#### Blast radius

- `dayOilWork()` feeds credit, the mode's capable-item set, green-bar placement and sentinel logic.
- The owner must not become unconditional scheduled work or receive duplicate spans.
- Extra people affect availability and validation already; only OIL is changing.
- A whole-row input switch would let one click override the member's answer and every extra man.
  The current claim-row name is deliberately not a switch. Fix its wording; do not silently enable
  it while implementing D18.
- The assignment generation from Fix 1 must address extra-person decisions too.

#### Rulings in conflict

- **D18** supersedes the “every `src` row earns nothing” part of **OIL31**.
- `docs/engine-rules.md:1703–1705` and `1856–1862` still state the superseded all-or-nothing rule
  and must change in the same patch.
- **OIL10** still gives the requester the first word; D18 must not bypass it.
- **OIL28** prevents a source row with no window, or a cancelled/info row, from minting work.
- **O-1 / OIL21** requires the second man's green edge on that row once he counts.

#### Exact repair, in order

1. Red first in `src/engine/oilev.test.ts`: owner answered No plus one `g.more` man. Expect no owner
   span and one extra-man span on item `i:iid`. Add owner Yes, extra-man deny, duplicate-extra,
   cancellation, info-only and no-times variants.
2. In the ground loop of `dayOilWork()` (`engine/oil.ts:188–193`), split the `g.src` branch. Resolve
   the same written window; call `reach(item)`; emit only unique real people in `g.more`, excluding
   `g.who`/the request owner. Leave the ordinary non-source `putWho()` path unchanged.
3. Keep the request owner in `oilEarnedWork()`'s input half. Do not put the source row's `who` into
   the schedule half.
4. In `ui/oilmode.ts`/`board-html.ts`, let `oilRowPeople()` draw both eligible pucks but keep the
   claim name non-toggleable. Replace the false “nothing on this row can earn” title with “OIL is
   decided per person on this request.”
5. Red in `src/ui/oilmode.test.tsx`: owner No is dim/inert by his default, extra man glows, each
   person's override changes only that person, and no row-wide toggle is offered.
6. Red in `src/leavewar/oilsync.test.ts`: publish through the production wire and assert the second
   man receives the credit while a declining owner does not.
7. Revise OIL31, `engine-rules.md` and the claim-row UI contract in the same change. Newest ruling
   wins; leaving the old prose makes rulecheck endorse the opposite behavior.

### Rank 4 — Fix 3: reload manufactures an amendment — **KNOWN defect; NEW normalization diagnosis**

#### Shape

Do not suppress `dayHasChanges()`, clear the pending count after load, or special-case the first
reload. That would hide a real OIL amendment behind the same aggregate `oil:<di>` address.

The static seam is `oilEvidenceKey()`: it serializes `OilInputEv.acc`, while `acc === 'g'` is a
derived landing cache that `store.ts:563` and `841` deliberately deletes and the landing passes
reconstruct. Filing state is already a separate publication axis in `dayFilingFingerprint()` and
`filingDelta()`. A volatile cache is therefore represented twice: once as filing, and again in the
OIL evidence digest. The observed “earning day only, clean Wednesday, no history” signature fits
that seam. The red test must prove the exact before/after value before code is changed; static
inspection alone does not justify blindly dropping `acc`.

Fix 2's normalized frozen standing is the right joint repair: the key should represent semantic
eligibility (active/cancelled/info/dormant/etc.), not whether the loader has momentarily stripped
or re-derived `g`.

#### Blast radius

- `oilEvidenceKey()` also binds signatures through `currentBind()` and drives the one OIL delta.
  Dropping data indiscriminately can let a real cancellation, removal or filing change publish on
  stale signatures or disappear from the amendment panel.
- `filingDelta()` remains the sole authority for `acc` filing changes. The two axes must not both
  report the same transition or both omit it.
- Stashed weeks, plan restore and global Undo run the same `g` strip/reland lifecycle.
- Existing F9 was deliberately not implemented. The new hand-pass evidence invalidates the reason
  to leave the raw cache in the key, but not the requirement to retain its effective meaning.

#### Rulings in conflict

- **OIL27**: a real OIL edit is one publishable item; a load is not an edit.
- **OIL29**: derived live evidence must not go stale, but equivalent derived states must compare
  equal.
- **OIL24**: an empty AL damages the issued record even if money does not move.
- The publication design says filing is a distinct fourth axis. Raw `acc` in the OIL key makes it
  a fifth copy of the same fact.

#### Exact repair, in order

1. Red first in `src/state/persist.test.ts`: create an earning Saturday with an input, sign through
   `setSign()`, publish through the normal approval path, serialize/hydrate through the real store
   path, and assert `dayDelta(SAT)`, `dayHasChanges(SAT)` and the next version label are unchanged.
   Capture and compare the pre/post `oilEvidenceKey()` components so the failing field is named.
2. Red in `src/engine/oilev.test.ts`: stripping and re-deriving `g` to the same source row must keep
   the key equal; `active → cx`, `active → info`, `active → dormant`, member answer, person,
   assignment generation and window changes must make it unequal.
3. Implement Fix 2's normalized standing in `projectOilInputs()`. Serialize that standing in
   `oilEvidenceKey()` and remove raw `acc` from the OIL axis. Keep `filingKey()`/`filingDelta()`
   unchanged.
4. Add the same round-trip assertion for a stashed week and for Undo restore, because both strip
   derived `g` at different call sites.
5. Assert a genuine filing-only change still invalidates signatures and produces exactly the
   input delta, while a genuine OIL decision produces exactly the OIL delta.

### Rank 5 — Fix 6: earning weekend outside the Leave War — **KNOWN defect; DISAGREE with “can never land”**

#### Shape

The entitlement and its destination are different facts. A weekend can earn without a current war;
`isNonWorkingISO()` correctly recognizes weekends without one. `runOilPass()` cannot insert the cell
until `warHolding()` finds a period. If a period covering that date is later created, the same issued
snapshot can and should land the credit. Therefore do not set `OilEvidence.earns = false`, refuse
publication, or require a second publication merely because the destination is absent today.

The screen needs a third state: **earned and issued, but not posted because no Leave War period
covers the date**. Green must not claim that the cell has landed. Preserve the evidence and make the
missing destination explicit before and after publication.

#### Blast radius

- Treating “no war” as “does not earn” loses historical entitlement and requires a later schedule
  amendment for a Leave War configuration change.
- `publishFlagsBids()` currently returns at line 1065 when there is no war, making its later
  `if (!war)` branch unreachable. Adding wording only at the later branch fixes nothing.
- The generic “No conflicts flagged” line must not render when the unposted warning exists.
- The OIL tracker/grid has no row or cell yet. The warning must live on the schedule day and must
  clear automatically when a covering period is added and `runOilPass()` posts the issued credit.
- A missing war is not the same as an undecided leave clash; do not create a fake clash record.

#### Rulings in conflict

- **OIL11**: publication is what earns; destination setup should not redefine publication.
- **OIL20/OIL21**: the current green language reads as a posted benefit. It needs an unposted
  visual/tooltip state rather than a false full-green success.
- **OIL24 / R-1**: the already-issued evidence must be sufficient when the war later appears.
- **OIL33** is the same honesty principle: if nobody actually receives a cell, say why.

#### Exact repair, in order

1. Red in `src/leavewar/oilsync.test.ts`: publish a worked Saturday outside every period. Assert no
   cell, but retain the issued evidence. Add a period covering the date and run the ordinary Leave
   War update; assert the credit lands from the same issued version with no schedule AL.
2. Add one destination hook at the Leave War seam, alongside `HOOKS.oilEarningDay`, that answers
   whether the ISO is covered by a writable war. Keep it out of `engine/oil.ts` arithmetic.
3. In `validateCore()` add `OIL_NO_WAR` when a weekend/PH has real candidate or issued OIL but no
   covering period. Before publication say “will be recorded but cannot be posted”; after
   publication say “was earned but is not posted.” Suppress the generic success line while present.
4. Move the no-war handling in `publishFlagsBids()` before its line-1065 return, or split the early
   gate so a warning can be emitted without a `war`. Delete the currently unreachable `!war`
   branch after its behavior is covered.
5. In `oilSeatDeco()`/the day header, use an explicit unposted class or badge and tooltip. Do not
   reuse the ordinary green wording “earns FO” when the tracker has no destination, and do not
   remove the underlying issued evidence.
6. Red in `src/ui/oilmode.test.tsx` for the draft and issued wording, and in a rendered browser test
   for the visible non-green/unposted distinction.

### Rank 6 — Fix 5: OIL mode is not read-only — **KNOWN defect; DISAGREE with global lock**

#### Shape

The ruling is “read-only for **schedule editing**,” not “the application is inert.” A global guard
on every writer would also block the OIL gestures the mode exists to make, and disabling Undo/Redo
would contradict the hand-pass scenario that deliberately verifies OIL decisions are undoable.

Use a schedule-write quarantine at both render and mutation doors. For Undo/Redo, the safe simple
rule is: leave OIL mode first, then apply the history step. That prevents an old schedule edit from
occurring under OIL furniture while preserving global history.

Sign-off and Publish are not schedule-content edits; they are the route by which OIL decisions take
effect. The current wording does not rule them out. Plans and Unpublish replace or withdraw the day
under the mode and should exit or be withheld. Do not disable Sign/Publish without an owner ruling.

#### Blast radius

- Personal Inputs and Unavailable have their own field/edit paths, separate from the main board's
  `stoRO/mvRO` gates.
- The crew palette is outside the board content tree. Hiding drop targets is insufficient because
  `drag.ts` can still start a gesture and leave the UI in drag state.
- Plan selection, version load and Unpublish can replace the day and its `oild`; keeping the mode
  open would show controls for a different decision set.
- Undo/Redo is global. A hard block strands legitimate OIL decisions and violates established
  history behavior; allowing it without exiting permits schedule mutation inside the mode.
- Publishing while the mode remains on must either refresh against the new issued/live state or
  deliberately exit. Leaving stale mode markup is unsafe.

#### Rulings in conflict

- `ui-contracts.md:7062–7067` says read-only **for schedule editing**.
- **OIL2/OIL3/OIL7/OIL9** require four kinds of OIL writes while the mode is active.
- The accepted Undo/Redo scenarios require decisions to ride normal history.
- **OIL11/OIL16/OIL27** require a route to sign and publish OIL changes; a blanket ban on Publish
  conflicts with that workflow.

#### Exact repair, in order

1. Red in `src/ui/oilmode.test.tsx`: while on, Personal Inputs and Unavailable time/remarks/late
   controls do not mutate; the palette cannot begin mouse or touch drag; Plans and Unpublish do not
   act; OIL puck/item/blanket decisions still act.
2. `board.ts:306–309` already passes the mode-widened `mvRO` into `sbInputsGroupPanel()` and
   `sbUnavailPanel()`; do not add a second gate there. The hole is `sbInpRow()` at
   `board-html.ts:593`: its compact read-only branch runs only for `RO && !oilItem`, so the very
   claim rows OIL mode must show fall through to live `data-ifld` fields and the live late chip.
   Split that branch so `RO` always emits static times/remarks and no Accept/Undo/edit attributes,
   while an OIL claim still uses `oilItemCellHTML()` and `oilSeatHTML()` for its permitted OIL
   gesture. Add stale-DOM guards in the input-field and late-chip writers too.
3. In `SchedBoard.tsx`, withhold or inert the board palette while `oilModeOn(SBDAY)`. In the
   pointer/mouse start entry of `ui/drag.ts`, refuse a source whose active board day is in OIL mode;
   this is the missing-door backstop.
4. At `routeClick()`'s `data-planmenu`, plan-select/load and `data-signclear`/Unpublish paths, exit
   mode before any day replacement or withhold the control. Prefer withholding Plans/Unpublish and
   leaving Sign/Publish available.
5. At the shared Undo/Redo button and keyboard call sites, call `setOilDay(null)` before `undo()` or
   `redo()`. Red test: enter mode, make one OIL decision, leave an older schedule edit beneath it;
   first Undo restores the OIL decision and exits, second Undo changes schedule with mode off.
6. After successful Publish, explicitly exit the mode (least ambiguous), repaint, and test that the
   issued bar and amendment label agree. Keep sign-off usable unless the owner rules otherwise.
7. Rename one of the two visible “✓ Done” controls while in mode, or hide the board-close Done until
   OIL mode exits. Test there is one visible button with that accessible name.

### Rank 7 — Fix 4: PH removed after publication — **KNOWN defect; NEW issued/live display requirement**

#### Shape

The proposed mirror advisory is necessary but incomplete. `validateCore()` places all OIL warnings
inside `if (earnsOil)`, so the reverse case cannot execute once the live PH is gone. Move the
published/live comparison outside that gate.

The advisory must say that issued money **still remains until AL**, because the live board removes
the OIL door and bars while the war correctly shows the frozen result. Otherwise the scheduler is
still looking at two apparently contradictory truths. Do not “fix” the screen by withdrawing the
credit or mutating the snapshot.

#### Blast radius

- Forward and reverse drift must be symmetric but distinct in wording and tests.
- Re-adding the PH before publication is a no-op round trip and must clear both warning and delta.
- `oilShown()` and bar rendering currently follow live eligibility except in explicit version
  preview. A warning alone leaves no inspection door on the live board. Add an issued-state summary
  or allow read-only inspection of the current issued OIL evidence; do not expose live toggles on a
  day that no longer qualifies.
- History should not claim that a user made an OIL gesture; the PH change belongs to Leave War, but
  the pending amendment panel must name the eligibility change.

#### Rulings in conflict

- **D2 / R-1 and OIL24**: issued money is already correct and must remain so until AL.
- **OIL27**: the reverse eligibility change is a real publishable OIL delta.
- `engine-rules.md:1836–1847` documents only the forward `OIL_STALE_DAY` advisory and is incomplete.
- `ui-contracts.md:7039–7041` promises issued evidence on a published day, but the live working board
  demonstrates only that in version preview. The contract needs an explicit working-copy rule.

#### Exact repair, in order

1. Red in `src/engine/validate.test.ts`: publish a PH with frozen `earns:true`, remove the PH and
   assert a reverse warning while `oilWouldEarn()` is now false. Assert the frozen credit remains.
   Re-add the PH and assert warning/delta disappear.
2. Extract a small comparison in `engine/oilev.ts` or `validate.ts` that reads live
   `oilEvidence(di).earns` and current `daySnapOf(di, dayCurVer(di)).d.oilev.earns`. Return
   `started | stopped | same | unavailable`.
3. Call it in `validateCore()` outside the live `earnsOil` block. Keep `OIL_STALE_DAY` for started;
   add a stable reverse code/message for stopped: issued OIL remains until the day is republished.
4. Add the same state to the pending-change description for `oil:<di>` so “1 change” names why.
5. Give the live published board a read-only issued-OIL inspection affordance or summary when
   `stopped`; do not restore writable OIL controls and do not draw the live blank state as if it
   were the issued truth.
6. Red in `src/leavewar/oilsync.test.ts`: removal leaves the credit; AL removes it; re-add-before-AL
   leaves it with no amendment. Red in `src/ui/oilmode.test.tsx` for the visible issued/live wording.

### Rank 8 — Fix 7: SC switch duplicated on every aircraft row — **KNOWN defect; NEW wider reach**

#### Shape

`board.ts:167` renders one `.sb-line` per aircraft and calls `oilItemCellHTML()` at line 225 for
every one, all with `rowItemKey(f.rid)`. The duplicates are aliases for one formation decision.

Do not move the control to the wave header: an SC wave can contain separate AM and PM formations,
and one header switch would merge two distinct windows and crews. Render exactly one switch per
formation/shift, on its first aircraft row or a formation header; later aircraft rows get a plain
label/continuation cell. The same loop serves ordinary multi-aircraft formations, so this is not an
SC-only defect.

#### Blast radius

- AM and PM must remain independent items.
- A multi-aircraft ordinary formation currently has the same duplicate control shape even though
  the hand pass named SC. Fix the generic renderer once.
- Spare formations remain structurally ineligible and get no active switch.
- Removing a grid cell can shift the row's CSS tracks; emit a non-interactive continuation cell
  rather than dropping the first column.
- History should name the formation once and one click should create one amendment item.

#### Rulings in conflict

- **OIL7** says the item's name is one item switch, not one alias per aircraft.
- **D15** says SC MAIN earns and SC SPARE does not; a switch beside an empty spare must not govern
  main crew.
- **OIL28** forbids an ineligible spare from presenting an apparently effective earning control.

#### Exact repair, in order

1. Red in `src/ui/oilmode.test.tsx`: an SC wave with four AM and four PM aircraft rows renders two
   active item switches, not eight; toggling AM leaves PM unchanged; an empty spare has none.
2. Add the same red case for an ordinary two-aircraft formation. This is the unwalked sibling.
3. In `board.ts`'s `f.aircraft.forEach`, call `oilItemCellHTML()` only for `ai === 0` and emit a
   plain, non-addressable continuation cell for later aircraft. Keep the identical grid track.
4. Key the control by `f.rid`, as now; never by `ai`, wave index or visible callsign.
5. Assert one history line, one `oil:<di>` delta and the correct AM-only earned spans after the tap.

### Rank 9 — Fix 9: wording and reach batch — **KNOWN, with one DISAGREE**

These are not one safe mechanical batch. Each has a different missing call site or ruling.

#### 9a. ALL AVAIL count missing on the board — **KNOWN**

- **Shape/blast:** `sbProgPanel()`'s custom Common Programme renderer calls
  `oilSeatDeco(...).oil` at `board-html.ts:223` and discards `.chip`. Do not create a second count
  calculation; append both fields from the shared decoration. Preserve the puck as the arm target
  and the chip as the list target.
- **Rulings:** OIL21a and OIL23; `ui-contracts.md:7021–7038`.
- **Red first:** `oilmode.test.tsx`, all-full/all-half/mixed/none on Common Programme board. Then
  retain `const deco = oilSeatDeco(...)` and append `deco.chip` beside the puck at that call site.

#### 9b. No “not in force yet” mark — **KNOWN (D18 accepted Q1)**

- **Shape/blast:** do not apply generic `alAttr()` to the whole row; OIL is one aggregate delta and
  that would mark unrelated pucks. Compare the live per-puck result with the current issued block
  and mark only a changed puck/item. Draft Original has no “not in force” concept; publication and
  a no-op round trip clear it.
- **Rulings:** OIL16, OIL24, OIL27 and D18. DECISIONS Q1 is now stale because D18 accepted the
  hand-pass finding; close or supersede Q1.
- **Red first:** `oilmode.test.tsx`: deny one man on published day, only his puck gets the pending
  marker, war stays issued, AL clears it. Implement the comparison beside `oilPuck()`/`oilSeatHTML()`
  using current snapshot evidence, not DOM text.

#### 9c. Placeholder on a duty desk says nothing — **KNOWN**

- **Shape/blast:** a sentinel on an unsupported desk must not expand or earn. Add an inert title and
  visible reason; do not make duty/cockpit/sim sentinels eligible merely to produce a count.
- **Rulings:** OIL8 applies only where a sentinel can expand; OIL28 and the hand-pass D18 acceptance
  keep unsupported placement at zero.
- **Red first:** `oilmode.test.tsx` for ALL AVAIL on duty desk: inert, no switch, title “placeholder
  here earns nobody.” Put the wording in `oilSeatHTML()`'s structural-ineligibility branch using a
  specific reason returned by the eligibility helper.

#### 9d. Whole worked day pays nobody silently — **KNOWN**

- **Shape/blast:** `oilBlindLine()` only speaks when `dayOilBlind()` finds untimed rows. A blanket,
  all-denied day, or switched-off items can have real written work and no earners without any blind
  row. Add a generic no-earner line independently, then combine it with blind/bid warnings once.
- **Rulings:** OIL33 and D18.
- **Red first:** `leavewar/oilsync.test.ts` for blanket, all denied, all items off, and genuinely
  empty day. In `publishFlagsBids()`, if issued `ev.earns`, the issued day has real candidate work,
  and `oilEarnedWork()` is empty, append “earned nobody any OIL.” Do not warn on a truly empty day.
  Mirror it in `validateCore()` while building.

#### 9e. Viewer’s own puck loses the stripe — **KNOWN**

- **Shape/blast:** `.puck.me { background: ... !important }` is a shorthand that resets
  `background-image`, wiping `.oilbar-*`. Change it to `background-color: ... !important`, or add
  equally authoritative composed `me + oilbar` image rules. Preserve the purple identity and the
  warning/drag rings.
- **Rulings:** OIL20, OIL21a/b.
- **Red first:** a CSS contract test plus rendered browser assertion for `.puck.me.oilbar-fo` and
  `-ho` on week, View-only and board. Do not accept a class-only jsdom assertion; inspect pixels or
  computed background layers.

#### 9f. 15px phone tap targets — **KNOWN**

- **Shape/blast:** making every puck visibly 44px high turns a 27-person sentinel into an enormous
  block. Use a coarse-pointer hit box/minimum row target while keeping the 15px visual puck, or a
  focused picker sheet for expanded sentinels. Avoid overlap between adjacent absolute hit areas.
- **Rulings:** OIL2/OIL8 and the phone one-row bar fit contract.
- **Red first:** a real-browser 390px geometry test that asserts each actionable target's hit rect
  is at least 44px and adjacent target centers resolve to the intended person. CSS belongs in the
  OIL-mode coarse-pointer media query, not global `.puck` geometry.

#### 9g. History names claims by puck text — **KNOWN**

- **Shape/blast:** `oilItemName()` reads the first DOM element carrying the item key. On claim rows
  that can be the puck's rendered `callsign + FO/HO`. History must not depend on render order or
  text content.
- **Rulings:** auditability behind OIL27; D18's accepted screen findings.
- **Red first:** `oilmode.test.tsx` history for Training and Overseas Duty. Add an item-label resolver
  keyed by `i:iid` that reads frozen/live input metadata (`inpLabel/type`), and use it in the board
  gesture call sites. Retain DOM fallback only for hand-built row items until their resolver is
  centralized.

#### 9h. Claim-row name contradicts its puck — **KNOWN**

- **Shape/blast:** input claims are per-person and intentionally have no whole-item switch; they
  are not structurally unable to earn. Do not fix the sentence by enabling a row-wide switch.
- **Rulings:** OIL10, OIL7 and D18.
- **Red first:** `oilmode.test.tsx` for Personal Inputs, Unavailable and landed source row. In
  `oilItemCellHTML()` accept a reason/state distinct from `none`; render “OIL is decided per person
  on this request” without `data-oilitem` when the item is an input claim.

#### 9i. “Tap to see each one” does nothing — **KNOWN; root not yet proved**

- **Shape/blast:** both `interactions.ts:490–491` (week) and `board.ts:1205–1206` (board) already call
  `oilSentinelList()`. Adding a third handler is the wrong repair. The failure is therefore reach,
  hit geometry, propagation, stale markup or toast visibility.
- **Rulings:** OIL8 and `ui-contracts.md:7033–7038`.
- **Red first:** dispatch through the mounted Shell in `oilmode.test.tsx` on week, member View-only
  and board and spy on `HOOKS.toast`; then add a real-browser coordinate click. If unit is green and
  coordinate red, fix the covering element/pointer geometry. If no event arrives, fix propagation
  priority. Keep the chip—not the puck—as the target.

#### 9j. Empty Saturday nags — **KNOWN; isolate what “empty” means**

- **Shape/blast:** `validateCore()` already gates the reminder with `oilWouldEarn()`, and the engine
  test says a constructed empty day is false. Do not weaken the reminder globally. The production
  “empty” day may still contain seed desks, sentinels, stale source rows or a cached warning.
- **Rulings:** the reminder contract explicitly says silent on an empty weekend; OIL11.
- **Red first:** reproduce the exact 25 Jul production seed in `validate.test.ts`, assert which span
  makes `oilWouldEarn()` true, then remove only non-work artifacts from `dayOilWork()` or force
  validation refresh after the last row is cleared. The test must also retain the reminder for one
  real timed worker.

#### 9k. “Off day” does nothing — **DISAGREE: do not change code**

- **Shape/blast:** this is already ruled. Leave War defines event kind `free` (“Off day” given by
  management) as **not** a public holiday and its tests pin that leave still charges and work earns
  no OIL. Making it earn would change both leave charging and OIL semantics, or make the two engines
  disagree.
- **Rulings:** `logic-html.ts` explicitly says an Off day earns nothing; `eventdefs.ts` and
  `charge.test.ts` distinguish `free` from PH kind `off`. The sentence at `ui-contracts.md:6972`
  saying “off-day-tagged days” conflicts with those later, concrete rules and must be corrected.
- **Red first:** no product code test should be made red. Add a rule/doc test that PH kind `off`
  earns and management kind `free` does not, then repair the stale UI-contract wording. If the
  owner wants the opposite, record a new ruling first and change OIL and leave charging together.

## What is missing from the list

Ranked independently by squadron cost.

### M1 — Cross-week assignment decisions can survive any loaded-day cleanup — **NEW, high**

This is the off-screen version of Fix 1. `Day.oild` belongs to each week/plan; `input.person` is
global. A reassignment can change the request while an old pair decision remains in a covered
stashed week. Clearing `DAYS[di].oild.people` in `commitInputEdit()` would pass the obvious same-week
test and fail later when that week is loaded. The assignment-generation repair is required. Red
first: a two-week request, denial on week 2, return to week 1, A → B → A, then reopen week 2; no old
denial may apply. Put this in `state/loadweek.test.ts` plus `oilev.test.ts`.

### M2 — Ordinary multi-aircraft flying lines duplicate the same switch — **NEW, medium-high**

Fix 7 is described as SC, but the duplication is in the generic
`formation.aircraft.forEach()` renderer. A two-aircraft VIPER formation receives two controls with
the same `f.rid` just as SC does. Fix and test the generic formation, not an SC label special case.

### M3 — The Leave War cell sheet offers a generic Clear that cannot remove auto OIL — **KNOWN omission, medium**

The EF hand pass found the button and proved the earned credit correctly survives. The list omits
it. `BidPicker.tsx:472–474` always renders `bid-clear`; for an auto-credit-only day its `clearCells()`
call writes nothing and then explains failure. Hide/rename that generic Clear when the only record
is issued auto OIL and show “Change the published schedule” instead. Do not wire it to
`clearRaptorCell()`: that would create a second money authority. Red first in the mounted Matrix/
BidPicker test, then gate the call site using `creditShown.auto` and absence of a clearable bid.

### M4 — Posting out on the day worked replaces the visible FO/HO with PO — **KNOWN omission, medium**

The ledger and tracker keep the credit, but the primary grid cell stops showing it. This is the
same “screen contradicts money” shape as Fix 4. Compose the posted-out marker with the earned OIL
display on the boundary day rather than letting PO replace the credit. Red first in
`leavewar/ui/daylist.test.tsx` or the Matrix cell test: post out from the worked date, assert the
cell exposes both PO and issued FO/HO and the tracker remains unchanged. This needs an owner-facing
display ruling if the grid cannot carry both marks cleanly; do not alter the ledger.

### M5 — No visible Leave War row can make a correctly earned credit undiscoverable — **KNOWN omission, medium**

The CD worker found Jester had no row, so the money scenario had to be rerun with Ace. R-2 correctly
allows credit to exist without a live roster row, but the user still needs a way to find it. The
tracker should surface credits for archived/hidden/no-row identities with callsign and status. Red
first in `leavewar/ui/oiltracker.test.tsx`: ingest issued OIL for a person absent from the grid and
assert a discoverable tracker entry. Do not add the person back to ALL AVAIL or make grid visibility
a money gate.

### M6 — Two “Done” buttons and no gesture feedback were dropped from the batch — **KNOWN omission, low**

The detailed G sheet lists both, the ordered summary does not. Fix 5 should leave one accessible
“Done” label while in mode. For feedback, the current source now calls `act()`/toast for OIL
gestures, so first add a mounted-Shell test and compare it with the hand-pass revision; do not add a
second toast path if the implementation already changed. The red test is the authority.

### M7 — The pending mark needs a group rule for sentinel pucks — **NEW, low but easy to get wrong**

Fix 9 says “mark a puck,” but ALL AVAIL is a frozen group with four states. One member's unpublished
deny can change only the count, the bar, or both. Mark the sentinel chip/puck if its aggregate live
state differs from issued, and list which members differ on tap; do not paint all expanded people as
pending merely because one changed. Red first beside the four-state sentinel tests.

### M8 — “No war” publication warning is unreachable at its current call site — **NEW code finding, low implementation cost**

`publishFlagsBids()` returns on `!warHolding(...)` before line 1092's `if (!war)` can execute. Any
plan that only edits the later branch will ship no fix. The exact repair is included under Fix 6.

### Not a requested fix: board cannot originate a multi-day input — **KNOWN, low**

The board's day-scoped Add Input form has no range field. That is a discoverability/product-scope
gap, not the cause of the payment bug; the Inputs page already owns ranges. Do not enlarge the OIL
repair into a second range editor without a separate ruling.

## Explicit negatives — checked and found nothing

- **The arithmetic:** `envMin()`/`uniformOil()` and the six-hour/midnight model are not implicated.
  None of these fixes should touch the threshold or replace the envelope with summed intervals.
- **The member's per-day answer storage:** `oilAskPlan()` and the OilConfirm shape already represent
  Saturday Yes/Sunday No. Fix 2 loses the answer later; it is not a picker or arithmetic defect.
- **The current decision is not request-only:** `personDecision()` already uses `person|item`. The
  missing concept is assignment lifetime and the missing call is the person-change re-ask.
- **Issued-money direction on PH removal:** `desiredOilCells()`/`creditFrom()` resolve the issued
  snapshot before the reverse sweep. The money is correct; only live presentation and warning are
  wrong.
- **Live roster is not a second money authority:** `creditable` no longer removes an archived or
  hidden person's issued credit. Do not put that gate back while fixing discoverability.
- **One-row request landing is internally coherent:** stable iid, exact-id duplicate guard,
  `acceptedDay()`, unaccept/relink and restore all agree on one anchor. The multi-day fix belongs in
  evidence projection, not row multiplication.
- **Cancelled/info landed claims:** the existing same-day `oilInputEligible()` check correctly
  suppresses them. The change is to freeze that one row's standing across every covered day, not to
  remove the gate.
- **The OIL delta is intentionally aggregate:** one `oil:<di>` item is correct under OIL27. The
  reload fix must normalize its evidence, not explode it into per-person amendment items.
- **Other main-board controls:** the normal flying, sim, duty, ground and Common Programme editors
  already fold `oilm` into `stoRO/mvRO`. The remaining holes are the independent Inputs/Unavailable
  builders, palette start door, history crossing, and lifecycle controls.
- **Sign and Publish:** I found no ruling that “read-only for schedule editing” forbids them. They
  are the necessary commit path for OIL decisions. Plans/Unpublish are different because they
  replace or withdraw the day under the mode.
- **SC AM versus PM identity:** `f.rid` already gives each formation its own item. The defect is the
  renderer repeating that item once per aircraft, not the engine merging shifts.
- **ALL/ALL AVAIL calculation:** the inspected failure is a dropped `.chip` in one custom board
  renderer. The shared four-state summary and frozen membership logic are not the repair target.
- **Sentinel list business logic and click routes exist:** `oilSentinelList()`, the document-level
  route and the board route are present. The hand-pass failure needs a red mounted/browser test to
  locate the reach or geometry break; another list implementation is not justified.
- **AVALON/BB, SC spare, cancelled/info, zero-length and unreadable-time exclusions:** the engine
  paths inspected still enforce them. D18 must not broaden any of those exclusions away.
- **Management “Off day”:** the Leave War event model, charge tests and Logic page consistently say
  it is given time off, not a PH and not OIL-earning. The conflicting `ui-contracts.md` sentence is
  the defect unless the owner issues a newer ruling.
- **No code, gates or runtime were touched for this review:** the conclusions above are code- and
  evidence-backed plan constraints, not a fresh execution claim.

## Build order after this red team

1. Fix 1's assignment incarnation and forced re-answer, including published and cross-week tests.
2. Fix 2 and Fix 3 together around one normalized frozen input standing; do not clone rows.
3. Implement D18 with the owner/input-half versus extra/schedule-half split.
4. Add the no-war unposted state without discarding entitlement.
5. Close the mode's independent write doors while preserving OIL writes and publication.
6. Add symmetric published/live eligibility presentation.
7. Deduplicate formation switches generically.
8. Take the UI batch one red test at a time; explicitly reject the Off day behavior change.

That order prevents the screen fixes from hardening the wrong ownership model and keeps the two
money-changing repairs ahead of presentation work.
