# Final code read — DB readiness phase 6 (a), (b), (d) — Astra

## Verdict

**No findings.** I found no new, pre-existing-but-made-reachable, or otherwise in-scope defect in the reviewed diff (`0d1a5e18..HEAD -- raptor-port/src`) or in the working-tree comment correction in `state/person-delete.ts`.

This was a read-only code review. I did not run a unit test: the brief permits one only to confirm a concrete finding, and the read did not produce one. I treated the existing evidence sheet as corroboration, not as a substitute for tracing the production paths. Step (c), group B, phase 7, and harm confined to old demo data remain out of scope as directed.

## Findings

None.

## Ranked failure scenarios checked

The ordering below starts with the least-shared and most specialised path.

### 1. Delete executed inside the Leave War posting pass

- **Setup:** A person has future flying, duty, sim, passenger, ground, Common Programme and OIL positions, working sign-offs and parked plans; at least one affected day is issued; the person’s posting-out outcome is Delete and becomes due while `runPoOutcomes` is executing its own command.
- **Production gesture and visible sign:** Leave War → Post out → Delete. When the posting pass runs, Leave War must show the ended/gone posting, Admin → Users must no longer offer the account, future working Schedule/Board/OIL surfaces must omit the person, past days and the issued face must retain them, and History must retain the removal lines.
- **Expected record effect:** The posting command may change the person, account/settings, inputs, plan, Leave War and change-batch records. It must not emit a loaded-day, book, saved-week, issued-version or retraction write.
- **Disproof:** Any future working occurrence survives after reload; any pre-cutoff or issued occurrence disappears; Undo post out restores the delete; or the command stream/storage names a schedule day/book row.
- **Trace:** `leavewar/sync.ts:runPoOutcomes` enlists the scheduler only for rollback and baseline protection, then calls `person-delete.ts:applyDelete`. `applyDelete` records the person’s own durable changes and queues `overlayDeletedWeek`; `schedApplyEnd` seals the command while the days are still unchanged. At phase 8 the overlay runs, `resyncSchedBaseline` moves the baseline to the derived working copy, and only then do reflow/history effects run. Thus the outer command has no schedule-row delta, the working copy changes before repaint/history capture, and delete/posting remains outside global Undo. The saved-week preflight is repeated inside the command, so a late unreadable or preserved-week refusal rolls back the entire posting outcome.
- **Result:** Correct. This is the path most likely to fail through ordering rather than a missing field, and I found no ordering gap.

### 2. Whole-day replacement after deletion

- **Setup:** A future day has saved plans, a template and an issued version containing the deleted person.
- **Production gesture and visible sign:** Edit Schedule → switch plan; load an older or issued version to the working copy; apply a template. The resulting working day must omit the person and the app must say that the person was left out because they were deleted. The historical issued preview must remain unchanged.
- **Disproof:** The person returns in the working copy, is silently stripped without the existing rows-left explanation, or disappears from the frozen issued record.
- **Trace:** Each incoming whole-day model passes through `engine/drafts.ts:leaveOut`, which invokes `HOOKS.stripDeleted`; `state/person-delete.ts:stripDeletedFromDay` applies the same cutoff and complete seat removal as the week overlay and returns callsigns for the visible message. Issued snapshots themselves are never handed to `overlayDeletedWeek`.
- **Result:** Correct.

### 3. Warmed saved-week and never-saved-week reads after deletion

- **Setup:** Warm next-week Peek, cross-week crew-rest/run results and the request row finder, first with a saved future week and then with a never-saved seed week; return to the current week and delete a person present in those future days.
- **Production gesture and visible sign:** Admin → Users → Delete account → confirm. Peek and later navigation must omit the person immediately; cross-week warnings and availability must use the same derived days; reload must agree; merely reading must author no week row.
- **Disproof:** Stale preview or row-finder data remains until the week is opened, the seed branch still shows the person, or deletion rewrites or authors the future week.
- **Trace:** Saved working days enter through `weekstash.ts:stashDays`, which parses a copy and overlays it. `stashGroundBySrc` keys its memo by both stored bytes and `deletedSig`. `ui/peek.ts:peekKey` also includes `deletedSig`. The pure-seed branches in `weekctx.ts:bundle` and `ui/peek.ts:peekWeekHTML` overlay a fresh or copied value rather than the cache itself. `state/store.ts:applyWeekModel` overlays days plus working sign-offs, bindings and plans before the scheduler baseline is established; the no-stash boot path overlays the seed before landing.
- **Result:** Correct.

### 4. OIL refusal across A → B → A, including Undo/Redo

- **Setup:** An unlanded OIL-eligible request belongs to A; A has a per-man refusal; transfer A → B → A. Separately, make B’s refusal during B’s holding, Undo the hand-over, Redo it and reload.
- **Production gesture and visible sign:** Personal Inputs, Calendar or Board request editor → change Person; then top-bar Undo/Redo. OIL Earn mode, All Available details, day head, Pending list and sign-offs must agree that a decision is valid only for the holding in which it was made. A’s old refusal must not revive when A returns; B’s refusal must survive arrival, become void on departure and remain void on a later return.
- **Expected record effect:** Each hand-over changes the Input and audit rows only. The explicit OIL decision may make its normal schedule write. The excluded step-(c) landed-row relink may still write its day by design.
- **Disproof:** A refusal revives, disappears on first arrival, validity differs after reload, Undo restores `person` without the matching counter state, or an unlanded hand-over changes a day/book row.
- **Trace:** Every production reassignment funnels through `ui/inputedit.tsx:commitInputEdit`, which increments `Input.hand` and records `Input.leftAt[oldPerson]` in the same Input mutation. Whole-Input command snapshots therefore restore `person`, `hand` and `leftAt` together. `ui/oilmode.ts:toggleOilPerson` records the current holding in `oild.pa`. The shared evidence door `engine/oilev.ts:pruneHandedOverDecisions` drops decisions older than the person’s departure before any live consumer receives them.
- **Result:** Correct.

### 5. Live OIL versus issued OIL and earned leave

- **Setup:** Publish an OIL-earning day, then change a holder, a per-man decision, placeholder membership or delete a person without reissuing.
- **Production gesture and visible sign:** Inspect Board → OIL Earn, All Available, Pending, Publish/AL, Leave War and Oil Tracker. Working surfaces must show the pruned current evidence and a pending OIL delta; the issued face and earned-leave consumers must retain the issued evidence until reissue.
- **Disproof:** A raw old decision affects a live surface, the issued face changes before reissue, or Leave War/Oil Tracker awards from the live working copy.
- **Trace:** Production decision consumers route through `oilEvidence` or `oilEvidenceOf`; `ui/oilmode.ts:evOf`, validation, publishing and the pending-list crowd comparison all use those derived doors. `publish.ts:oilDelta` compares derived live evidence to frozen issued evidence. `leavewar/sync.ts:stashOilWeek` intentionally reads the raw publication book only to resolve the frozen issued snapshot; it does not treat the overlaid working copy as issued. In `weekctx.ts:bundle`, working days are overlaid first, then official mode substitutes the untouched issued snapshot. I found no product reader of `oild.people` that bypasses the evidence door.
- **Result:** Correct.

### 6. Filing under Unavailable without `inp:` marks

- **Setup:** One request covers multiple published days with all four sign-offs; also exercise new-after-issue, newly-covering, removed and exact-round-trip cases.
- **Production gesture and visible sign:** Personal Inputs or the schedule card → Unavailable/Accept/Undo/Redo; inspect both day heads, Pending lists, sign-offs, AL/Publish and the Amendments panel; reload. Filing changes must appear on every affected published day from the Input record alone, invalidate all four sign-offs while different, and disappear when returned exactly to the issued filing.
- **Expected record effect:** Input and audit rows only, except for the explicitly out-of-scope step-(c) landed-row operations. No new `inp:*` pending key or schedule day/book write.
- **Disproof:** Only one covered day updates, a sign-off remains valid, pending depends on navigation, a ghost remains after an exact round trip, or a new raw `inp:*` key is written.
- **Trace:** `engine/slots.ts:acceptInput` and `unacceptInput` no longer write filing marks. `engine/publish.ts:filingDelta` compares current request filing with the issued `fil` fingerprint and feeds the ordinary day delta, count, list and signature path. `reconcileIssuedMarks` admits legacy `inp:` keys but never creates one; drafts and canonical code similarly preserve or ignore legacy marks without depending on them for new filing changes. The Amendments panel now counts only marks it can actually discard, matching evidence-sheet F1.
- **Result:** Correct.

### 7. Delete coverage, cutoff, roles, reload and Undo/Redo

- **Setup:** Place the target before and after the cutoff in every supported seat/list form, landed request rows, working OIL switches, all four sign-off roles and bindings, parked plans, planning pucks and inputs spanning the cutoff; retain an issued version. Exercise admin deletion, unauthorized member calls, later ordinary scheduler edits, global Undo/Redo and reload.
- **Production gesture and visible sign:** Admin → Users is the only delete door. Future Edit Schedule, View-only Schedule, Board, Peek, OIL, Inputs, calendar and Leave War surfaces omit the person; past and issued displays retain them. Blocked Undo steps say the person was deleted and are skipped; unrelated eligible steps continue to work.
- **Disproof:** A role crosses its permission boundary; an adjacent extra shifts rather than leaving a stable gap; a ground row from the now-removed request survives; a signer’s binding survives without the signer; a spanning input’s retained past becomes dormant; reload differs from right-after; or Undo restores the person, account or future occurrence.
- **Trace:** `overlay.ts:stripPersonFromDay` covers flying pilot/wingman, duty holder/extras, sim pilot/wingman/passengers/extras, ordinary ground holder/extras, Common Programme holder/extras, landed rows and OIL switches. `stripSign` clears each role and its binding; `overlayDeletedWeek` also descends into parked-plan days and their sign-offs. `hisLanded` uses the request’s current holder and falls back to the row name only after the request has gone, preserving the hand-over-before-delete order. `applyDelete` removes future inputs, shortens spanning inputs to the day before cutoff, leaves prior days and issued records alone, and keeps the request accepted for its retained span. `deletedRestoreProblem` rejects restores of people, accounts, inputs, plan rows, days, book rows and off-screen week rows that would resurrect a deleted person.
- **Result:** Correct.

### 8. Overlay cost in validation-time `stashDays` and `bundle`

- **Setup:** Deleted people exist; validation reads adjacent saved and pure-seed weeks on each edit.
- **Production gesture and visible sign:** Type or make an ordinary schedule edit. The visible schedule must not gain input lag or repaint instability.
- **Disproof:** Overlay work scales into a user-visible regression, mutates cached seed or stash objects, or makes repeated validation produce different results.
- **Trace:** `stashDays` already reparses mutable stash bytes on each read and overlays only that parsed seven-day copy. The pure-seed cache remains immutable; cloning happens only when `deletedOverlayDue` says a cutoff can affect the week. Peek and row-finder caches include the deletion signature. Work is linear in seven days, deleted people and the rows on those days; I found no recursive validation, write-back or render loop. The supplied measured check with two deleted people reports about 0.2 ms extra per validation and under 1% of a painted edit, so the static cost has no demonstrated severity.
- **Result:** No performance finding.

## Complete door, reader and writer roll-call

| Qualifying object or operation | Writer or read overlay | Production surface and working gesture | Downstream visible sign checked |
|---|---|---|---|
| Posting-out Delete | `runPoOutcomes` → `applyDelete` → deferred `overlayDeletedWeek` | Leave War → Post out → Delete; let the due pass run | Leave War ended/gone, account removed, future working programme clear, past and issued retained |
| Direct Delete | `deletePerson` → `applyDelete` → deferred overlay | Admin → Users → Delete account → confirm | Same schedule result as posting; refusal text for protected or unreadable future week |
| Loaded saved week | `state/store.ts:applyWeekModel` with days, sign/book and plans | Week chips/navigation; reload | Schedule, Edit Schedule and Board omit deleted person from cutoff |
| Current never-saved seed | `state/store.ts:initStore` seed overlay | First load or reload before any schedule save | Seed week agrees with deletion without creating a week row |
| Off-screen saved working days | `weekstash.ts:stashDays` | Navigate, validate, warm Peek or row finder | Cross-week rest/run/standing and Peek agree with later navigation |
| Off-screen never-saved days | `weekctx.ts:bundle`; Peek seed fallback | Validate or open next-week Peek | Cached seed never resurrects the deleted person |
| Row-finder cache | `stashGroundBySrc`, keyed by bytes plus `deletedSig` | Edit or delete a request whose row may be on another week | Accept, delete and reassign controls do not act on a stale row |
| Peek cache | `peekKey`, whose key includes `deletedSig` | Open trailing Peek before and after Delete | Preview invalidates immediately |
| Whole-day plan/version/template copy | `drafts.ts:leaveOut` → `HOOKS.stripDeleted` | Plan switch, Load version, template application | Working copy strips person and displays “left out — he has been deleted” |
| Flying seats | `stripPersonFromDay` | Open affected future day after Delete | Pilot and wingman empty; other seats stable |
| Duty rows | `stripPersonFromDay` | Open affected future day | Holder and extras empty in place |
| Sim rows | `stripPersonFromDay` | Open affected future day | Pilot, wingman, passenger and extras empty in place |
| Ground rows | `stripPersonFromDay` plus `hisLanded` | Open affected future day or Board | Direct holder/extras empty; deleted person’s request row removed; new holder’s row retained |
| Common Programme | `stripPersonFromDay` | Open affected future day or Board | Holder and extras empty in place |
| Working OIL switches and stamps | `stripOilSwitches` | Board → OIL Earn or All Available | Deleted person’s working decisions disappear with their stamps |
| Working sign-offs and bindings | `stripSign` | Day head and sign-off controls | Each matching role is unsigned and its content binding is removed |
| Parked plans | `overlayDeletedWeek` book traversal | Switch plan on affected day | Plan day and plan sign-offs omit the person |
| Issued day/version | Deliberately not overlaid | View issued day or issued-version preview | Historical face retains the person; loading it to the working copy strips them |
| Input hand-over record | `commitInputEdit` writes `person`, `hand` and `leftAt` atomically | Inputs, card, calendar or board reassignment; Undo/Redo | All live OIL surfaces agree after A → B → A and history travel |
| OIL decision | `toggleOilPerson` writes decision plus `pa` | Board → OIL Earn switch | Decision is valid for the current holding only |
| Live OIL decision reader | `pruneHandedOverDecisions` inside `oilEvidence` | OIL mode, All Available, day pending and signatures | No stale refusal or stale crowd on any live renderer |
| Issued OIL evidence | Frozen `oilev` or issued snapshot | Issued face, Leave War, Oil Tracker | Earned leave remains as issued until reissue |
| Filing state | Input `acc`; no day mark | Inputs or card → Unavailable/Accept; Undo/Redo | Derived pending count/list and sign-off invalidation on every covered issued day |
| Legacy `inp:` keys | Read or ignored for compatibility only | Amendments and pending on legacy demo state | No new act depends on or creates the key; no migration finding under D56 |
| Delete-cutoff inputs | `applyDelete` removes future rows and shortens spans | Delete a person with a spanning request | Future absence gone; retained past stays accepted and readable |
| Planning-calendar pucks | `applyDelete`, stable-gap removal | Calendar after Delete | Person gone from cutoff without shifting surviving positions |
| Undo/Redo restore guard | `deletedRestoreProblem` | Top-bar Undo/Redo after Delete | Prohibited resurrection is refused or skipped; unrelated own steps remain usable |
| Member role | Input ownership guard | Member attempts another person’s hand-over or deletion | Gesture is unavailable or refused; no records change |
| Scheduler role | Schedule and OIL command authority | Accept, Unavailable, OIL decision and ordinary day edit | Only promised Input or held-day records change |
| Admin role | Delete authority | Admin → Users → Delete account | Person/account deletion and derived working overlay occur through the sole visible door |
| Published working day | `filingDelta`, `oilDelta`, deletion overlay | Inspect day head, Pending and sign-offs after an Input or delete change | Working day reports current derived delta without rewriting its issued baseline |
| Issued snapshot | Frozen publication record | View published face, Leave War or Oil Tracker | Historical programme and earned OIL stay unchanged until explicit reissue |
| Holder’s next day write | Ordinary scheduler command after overlay | Make one normal edit to one affected day and press Done | Exactly that touched day is persisted without the deleted person; other days remain untouched |
| Reload boundary | Person/Input rows reload, then normal overlay/evidence doors | Reload after hand-over, filing or deletion | Reload matches the immediate working result and authors no schedule row merely by reading |

## Meaningful operation order checked

### Posting-pass delete

1. The posting pass determines the due outcome and checks the hold/refusal conditions.
2. Its outer command enlists people, settings and Leave War; it enlists the scheduler only when a delete needs rollback and baseline protection.
3. `applyDelete` repeats the stash preflight inside the command.
4. The person is marked deleted with `deletedFrom`; the account is removed.
5. Future inputs are removed and spanning inputs are shortened.
6. Planning pucks and Leave War state are updated.
7. The loaded days are still unchanged when `schedApplyEnd` advances the in-command scheduler baseline.
8. The command derives and emits its durable non-day changes.
9. At phase 8, `overlayDeletedWeek` strips the loaded working copy.
10. `resyncSchedBaseline` advances the scheduler baseline to that derived copy.
11. Validation, repaint and history snapshot see the overlaid model.
12. No day or book row belongs to the posting command; the next legitimate holder edit persists only its touched day.

### Direct admin delete

1. The visible Admin → Users door checks role and `deleteProblem`.
2. Stored-week preflight refuses unreadable or preserved affected weeks before the command.
3. The command resynchronises the scheduler baseline before enlistment.
4. `applyDelete` repeats the preflight and makes the person-owned durable changes.
5. The Leave War half is updated in the same command.
6. The same phase-8 overlay, baseline and repaint order as the posting pass follows.
7. Global Undo cannot restore the deleted person or any future record containing them.

### Request hand-over

1. Every UI reassignment reaches `commitInputEdit`.
2. If a landed row exists, the current step-(c) unaccept/reaccept relink occurs; this remains intentionally out of scope.
3. The Input’s person is replaced.
4. `hand` increments once.
5. `leftAt[oldPerson]` records that new hand.
6. The hand-over command captures the whole Input, so Undo/Redo travels across all three fields together.
7. No day-wide refusal-clearing sweep occurs.
8. Each live OIL read clones the decisions and prunes stamps older than the person’s recorded departure.
9. Issued OIL evidence remains frozen until reissue.

### OIL decision

1. OIL mode resolves the live evidence through `oilEvidenceOf`.
2. The user toggles the person/item decision.
3. The writer records both the decision and the current Input holding in `oild.pa`.
4. Later hand-over reads compare `pa` against `leftAt`.
5. A stale decision is omitted from derived evidence without mutating the stored day.
6. Pending and sign-off keys compare this derived evidence with the frozen issued evidence.

### Filing under Unavailable

1. The user acts through the Inputs page or schedule card.
2. The Input’s `acc` filing changes.
3. No `inp:*` pending mark is written into any covered day.
4. Each affected issued day recomputes `filingDelta` from the live Input and its issued filing fingerprint.
5. The derived item feeds pending count/list and content-signature invalidation.
6. Undo/Redo restores the Input record and therefore restores the derived result on all covered days.
7. Reissue freezes the current filing as the new clean baseline.
8. Unpublish does not recreate an `inp:*` mark.

### Saved and seeded week reads

1. A saved blob is parsed into a fresh copy by `stashDays`.
2. Day labels are refreshed.
3. The deletion overlay is applied to the working-day copy.
4. Cross-week validation, Peek and row-finder consumers receive that copy.
5. If the official world is required, `weekctx` substitutes the issued snapshot after resolving the working bundle, so issued history is not overlaid.
6. A never-saved seed remains cached only in its pure form; a copy is overlaid on each affected read.
7. Opening or validating either form does not write it back.

## Explicit negatives

### Step (a): request hand-over and OIL holding stamps

- No alternative production writer of an existing Input’s `person` was found outside `commitInputEdit`; the calendar drag and schedule reassign paths call it.
- `hand`, `leftAt` and `person` therefore share the same command and Undo image.
- No live per-man OIL decision reader bypassing `oilEvidence` or `oilEvidenceOf` was found.
- No hand-over-time refusal-clearing sweep or saved-week write remains.
- `toggleOilPerson` writes `pa` alongside the decision and uses the Input’s current hand.
- Holder and extra decisions follow the same prune door.
- Blanket and item decisions reach the same derived evidence.
- The known accepted-row unaccept/reaccept is step (c) and was not reported.

### Step (b): filing without stored `inp:` marks

- No remaining production writer of `inp:*` pending marks was found.
- Every new filing delta reaches day delta, pending count/list, signatures and sign-off invalidation through `filingDelta`.
- Multi-day filing changes are recomputed for every covered issued day.
- New-after-issue, removed, newly-covering and returned-to-issued cases are compared by record content rather than by mark presence.
- Remaining `inp:` branches are compatibility and non-row handling for already stored marks, which is not a D56 finding.
- Unpublish does not manufacture a replacement mark.
- The Amendments panel no longer counts inert marks whose button never undid the filing; this is the intended visible F1 change.
- No new filing-only action writes a schedule day or book row.

### Step (d): deletion overlay ingress doors

- No missing ingress was found among loaded saved weeks, current seed boot, saved off-screen reads, pure-seed cross-week reads, Peek, row-finder memoisation or whole-day replacement.
- `applyWeekModel` overlays the loaded week before its scheduler baseline.
- The no-stash seed path overlays before automatic landing.
- `stashDays` overlays a parsed copy, not the stored bytes.
- `weekctx:bundle` overlays a copy of a never-saved cached seed.
- Peek’s saved and seed branches both receive the overlay.
- `stashGroundBySrc` and Peek invalidate their caches with `deletedSig`.
- Plan, version and template loads pass through the deletion hook.
- Reload recomputes the same result from `Person.deletedFrom`.

### Step (d): objects removed by the overlay

- Flying pilot and wingman seats are covered.
- Duty holder and extras are covered.
- Sim pilot, wingman, passenger and extras are covered.
- Ordinary ground holder and extras are covered.
- Common Programme holder and extras are covered.
- Landed request rows are resolved using the request’s current holder.
- Working OIL person switches and their holding stamps are covered.
- All four working sign-off roles and their bindings are covered.
- Parked-plan days, sign-offs and bindings are covered.
- Stable list positions are retained; only trailing blanks are trimmed.
- Days before the real-calendar cutoff are left unchanged.
- Issued snapshots are not overlaid.

### Delete persistence, command order and baseline

- Direct and posting-pass deletion make the working screen change only after the command boundary.
- The baseline is then moved to the overlaid state before subsequent scheduler commands.
- The deletion command contains no schedule-day or book-row change.
- The phase-8 working-copy change is not attributed to the deleting admin as a day edit.
- The next legitimate holder edit saves only its touched day, with the deleted person already absent.
- Other affected days remain unwritten until their holders change them.
- An unreadable or preserved affected stash is refused rather than silently skipped.
- The inside-command preflight closes the race between the visible preflight and actual mutation.
- A refusal leaves the posting outcome unmarked and rolls back all enlisted records.

### Earned leave and issued history

- Live UI consumers use pruned live evidence.
- Published pending comparison uses pruned live evidence versus frozen issued evidence.
- Issued faces retain the exact issued programme and OIL evidence.
- Leave War and Oil Tracker resolve earned leave from the issued snapshot, not from the unpublished working copy.
- Official cross-week calculation replaces the overlaid working day with the issued snapshot.
- No path was found that overlays an issued version.
- Loading an issued version into the working copy applies the deletion belt only to the new working copy and reports the omission.

### Undo and Redo

- Hand-over metadata is restored with the Input.
- A hand-over’s old and new holder decision validity therefore travels consistently through Undo and Redo.
- Delete and posting are not themselves undoable.
- The restore guard covers people, accounts, inputs, plan rows, loaded days, book rows and off-screen week rows that could revive a deleted person.
- Refused steps are skipped rather than permanently blocking the Undo button.
- Deferred deletion overlay and history ordering do not put the derived strip into the deletion envelope.
- The scheduler baseline is not left at the pre-overlay image.
- No permitted unrelated Undo or Redo path was found that should be blocked merely because a person was deleted.

### Roles and visible doors

- Admin → Users is the only visible direct deletion door.
- The command boundary independently enforces admin deletion authority.
- A member cannot edit another person’s Input through a hand-made call.
- A member-owned Input mutation remains an Input operation and does not acquire a day write.
- Scheduler OIL and Accept actions remain schedule-authorised operations.
- Issued views remain read-only.
- A refused role action changes no enlisted record.

### Caches and performance

- Deletion-aware derived caches include `deletedSig`.
- The pure seed cache is never mutated.
- `stashDays` overlays only a fresh parsed copy.
- Overlay reads do not write or increase stash generations.
- Validation-time work is bounded to the relevant seven-day bundles, deleted people and rows on those days.
- No recursive validation, notification or persistence loop was found.
- The supplied performance evidence measured approximately 0.2 ms extra per validation with two deleted people, under 1% of a painted edit.
- I therefore found no correctness or actionable performance defect.

## Evidence limitations

The evidence sheet is strong but not exhaustive. These are the limits I retained while reaching the no-findings verdict:

- The scripted visual walks sampled flying seats, desks and a sim seat rather than placing the deleted person in every supported seat and extras array on screen. The production traversal and targeted unit coverage enumerate the remaining seat types, but the visual evidence alone does not prove their geometry.
- The posting-pass walk checked the deletion result and non-undoability but did not re-walk every unchanged Leave War ended-state presentation. My conclusion there rests on the unchanged posting-state code plus the reviewed command order.
- The performance gate normally boots with nobody deleted. The separate two-deleted-person timing closes the immediate concern, but it is not a stress test of an unusually large historical deleted roster.
- The evidence compares right-after and reload in one client. It does not claim that an already-open second client updates before reload; the supplied design explicitly allows it to remain stale until it rereads shared storage.
- Unit and jsdom evidence cannot prove pointer hit-testing, phone geometry or paint stability. The supplied desktop and phone production walks cover representative visible doors, but not every combination in the roll-call.
- The evidence sheet’s break tests demonstrate that the named overlay doors are independently necessary. They do not prove by themselves that no unnamed door exists; I separately searched the saved/stashed/seeded week readers, day-replacement writers, raw OIL-decision readers and `inp:` consumers for that reason.
- I did not run another test file because the review produced no concrete finding requiring confirmation. The reported suite, browser and performance results remain supplied evidence rather than a test execution by this reviewer.
- Evidence-sheet F1 and F2 are real visible differences from the pre-phase-6 build, but they match the approved design: the Amendments panel no longer counts useless filing marks, and never-saved weeks now correctly apply deletion on read.

None of these limitations exposes a concrete defect in the reviewed code.

## Questions only the owner can answer

None.

The potentially ambiguous behaviours are already settled by the supplied rulings:

- Issued history stays frozen.
- The delete cutoff is real-calendar based.
- Deletion and posting are final and outside global Undo.
- Open clients may remain stale until reload.
- Only the day holder’s later day edit persists the derived deletion overlay.
- Legacy stored-only harm is not a finding under D56.
- Step-(c) landed-row writes remain intentionally out of scope.

**Recommendation:** Accept the phase-6 (a), (b), and (d) implementation on this final code read.

