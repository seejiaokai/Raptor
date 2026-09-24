# 1. Roll-call

This is a static inspection of the current checkout. Nothing was edited or executed. Earlier Raptor audit memory only influenced the risk ordering; all technical conclusions below were rechecked against the current repository.

## Objects and all visible destinations

| Thing | Places where it is drawn or represented |
|---|---|
| Published day | Edit-week day head; scheduler-board publish strip; view-only issued face; day-details panel; Amendments panel when it has a new delta; CSV/print status; Leave War through derived OIL; warnings evaluated against the published face. |
| Issued Original / ALn | ORIG/ALn tag on edit week and board; issued-version entries in the plans menu; frozen issued preview; view-only default face and issued/working selector; Amendments history; day-details AL list; print stamp; solid cell marks. |
| Working copy | Edit week; scheduler board; view-only “Working draft” choice; live plan selected in the plans menu; version-load target. |
| Pending change | Dotted cell mark where the change has a cell address; canonical `N pending` count; Publish AL button; Amendments pending summary; “Not yet signed”; day-details count; sometimes the edit-history list/bubble. |
| Issued change mark | Solid AL-coloured cell/row edge on edit/working faces and the corresponding issued snapshot; restored when a field is reverted to a value issued in an earlier AL. |
| Removal | Synthetic `del:` amendment item; pending/issued totals; Amendments wording; history as a structural line. It has no live cell after deletion. |
| Reorder | Synthetic `mov:` amendment item; pending/issued totals and Amendments wording; no single ordinary cell owns it. |
| Input filing | Synthetic `inp:` item; pending/issued totals and Amendments wording; the affected schedule representation plus Inputs state. Loading a schedule version does not discard the filing itself. |
| Four sign-offs | Current checker, Scheduler, Planner and Approver pills on the edit week and board; names frozen into issued records; issued-AL hover text; Approver named directly in the Amendments history. |
| Saved plan | Edit-week and board selector; plans menu; plan-management modal; read-only plan preview; unpublished view-week plan picker. |
| Retired/unpublished issuance | Stored in `SCHED.retired`; indirectly observable through the changed current version, working copy and Undo. It has no direct screen, selector or history browser. |
| `N pending` | Edit-week day strip; board strip; active issued-preview confirmation; day-details panel; plan-switch toast; Amendments panel’s per-day canonical total. |
| Version tag | DRAFT/ORIG/ALn beside the day title on edit week and board. The view page uses its issued/working selector instead. |
| “Not yet signed” | Working-copy day head in the week. It is deliberately absent from an issued face. It is currently missing from the scheduler board. |
| Day’s OIL | OIL Earn mode on the scheduler board; pending Amendments description; publication warnings/toasts; Leave War OIL cells/tracker; unpublished-OIL warning; derived solely from the latest issued snapshot. |

## Surface-by-surface roll-call

| Place | Does it SHOW the amendment state? | Can the person ACT there? | What shares the same pixels? |
|---|---|---|---|
| Edit-week day head | Yes: plan name, DRAFT/ORIG/ALn, canonical pending count, Publish day/AL, Unpublish and “Not yet signed”. | Admin can open plans, preview versions, publish, unpublish and open details/board. Member cannot enter this edit surface. | Date, Today marker, Templates, plan selector, version tag, pending chip, publish controls, aircraft count and warning/status controls. |
| Edit-week cells | Yes: dotted pending and solid issued AL marks on addressable content. | Admin edits text, times, crew, structures and ordering. | Content, cancellation/FYI marks, validation flags, availability, selection/highlight and amendment paint. |
| Scheduler-board desktop header/sign strip | Partly: plans, version tag, four sign-offs, pending count, publish and unpublish. “Not yet signed” is missing. | Admin can sign, switch plans, preview, publish and unpublish. | History entry, plan selector, version tag, signature pills and publish controls. |
| Scheduler-board desktop body | Yes: working content, dotted/solid marks, deletion/reorder effects and OIL mode. | Admin edits, drags, adds, removes, reorders and opens OIL Earn. | Schedule content, validation, availability, history highlighting, drag state and OIL overlays. |
| Scheduler-board phone form | Same underlying amendment model and controls as desktop, with responsive/folded presentation. “Not yet signed” remains missing. | Admin uses tap-driven edit/sign/publish/plan/OIL controls; hover-only history is replaced by tap/list paths. | Compact controls, folded warnings, drag/tap targets and OIL pucks compete for substantially less space. |
| View-only week, issued face | Yes: frozen latest issued content, issued-version label in the selector and warnings for that issued face. No pending paint or “Not yet signed”. | Any viewer may choose “Working draft”; no schedule write. | Frozen content, official warnings and issued/working selector. |
| View-only week, working-draft peek | Yes: live working content, “Working draft — not issued”, pending working state and working warnings. | Any viewer may return to issued; no editing or publishing. | Live content and current warnings, but no admin write controls. |
| Amendments panel | Yes: every published day with a canonical delta, kinds/counts, signing lock and per-day Publish AL; issued AL history below. | Admin publishes a specific AL. It also draws “Discard marks”, which is defective for published-only marks. | Pending summary, removal/reorder/input/OIL wording, sign state and issued AL tags. |
| `~` day-details panel | Yes: published/draft status, current version, AL list and an “unpublished edits” count. | Read-only inspection. | Programme totals, people counts, warnings and AL summary. Its pending count currently uses the wrong authority. |
| Edit-history list | Yes for session edits: what, before/after, person and time; structural actions are plain rows. It is not issuance history. | Filter, group and jump to addressable board details. | Day filter, grouping, jump targets and session-only disclaimer. |
| History hover/pinned bubble | Yes for addressable details; desktop hover and pinned/tap flows show the edit story. | Inspect or open the full list; no data mutation. | The underlying cell’s amendment paint, selection and validation state. |
| Next-week peek | No amendment versions, tags, pending marks or sign-offs; it renders inert planned content. | No amendment action. | Compact future content and limited validation marks. This omission is designed, not a defect. |
| Issued-version preview | Yes: frozen Original/ALn, read-only banner, live issued tag and captured discard count. | Back to live; two-step “Discard N edits & load” when needed. Publish/unpublish and ordinary editing are blocked. | Preview banner, live plan selector/tag, frozen content and Load/Back controls. |
| Saved-plan preview | Yes: frozen plan with a Draft/read-only treatment, not issued clothes. | Back to live or “Switch to this plan”; no direct editing while previewing. | Plan banner, plan selector and frozen content. Old-version warnings are intentionally absent. |
| Plans menu | Yes: live working plan, stored alternatives and issued versions; selected/live state. | Admin switches plans, creates an alternative, opens management or previews an issued version. | Live-plan name, issued-version choices and pencil/manage controls. |
| Plans modal | Yes: plan names, selected/live plan and published-day explanatory text. | Admin renames, selects or deletes a non-live plan. | Tabs, rename input, Delete/Select/Done. It self-hides after view-as-member. |
| CSV export | Shows schedule rows from published snapshots for published days; draft days use their live content. It does not export visual amendment marks. | Scheduler invokes export; exported data is read-only. | Plain row data only; version status is not a separate CSV column. |
| Print/PDF | Shows published snapshot content and a per-day “Published — Original/ALn” or working-draft stamp. | Scheduler opens the browser print flow. | Clean report layout without editing, pending marks, plans or signature pills. It currently includes the whole week, the known partial-build exception. |
| Leave War OIL cells/tracker | Yes: OIL earned from the latest published day plus any live bid and clash flag. | Members handle their own bids; scheduler changes the earning document only by republishing the schedule day. | Earned credit, bid state, decision marks and clash/warning presentation. |
| Warnings list/strip | Yes: unpublished-OIL reminders, nobody-earns/no-period warnings, bid clash and schedule warnings for the face being shown. | Mostly inspection; publishing or fixing the underlying schedule resolves them. | Validation severity, current display world and publication warning text. |
| Undo/redo bar and toasts | Indirectly: names publish, unpublish, plan, OIL and edit actions and restores their state. | Admin can undo/redo scheduler operations within the global timeline. | Current undo description and transient publication/OIL warnings. It is not a version browser. |

# 2. Door list

## Visible actions

| Stored-data action | On-screen door | State, role and device behavior |
|---|---|---|
| Edit schedule content | Edit week and scheduler-board fields, pickers, add/delete and drag controls | Admin only; draft or live working copy; desktop and phone. Blocked during an issued/plan preview and under view-as-member. |
| Sign/clear Current checker | Current-checker sign-off selector | Admin edit surfaces; open candidate set. Content changes invalidate the binding; reverting restores it. |
| Sign/clear Scheduler, Planner, Approver | Their three sign-off selectors | Admin edit surfaces; only appointed schedulers are offered, with an already-signed name retained if later unappointed. |
| Publish Original | Per-day “Publish day” | Admin; never-published day; enabled only after all four valid signatures. |
| Publish ALn | Per-day button in week, board and Amendments panel | Admin; published day with a real canonical delta; enabled only after fresh valid signatures and never during preview. |
| Unpublish latest issuance | Per-day “Unpublish” | Admin; published live day; latest issue only. One tap normally, two taps when issued OIL has a bid against it. Hidden during preview, on view-only surfaces and in quarantined weeks. |
| Undo/redo publication | Global Undo/Redo | Admin; undo of publish uses the unpublish model. Undo after a completed unpublish restores the withdrawn issuance. |
| Preview Original/ALn | Issued rows in the plans menu | Admin edit surfaces; read-only. Load/Back replace edit/publish doors. |
| Load issued version onto working copy | “Load onto working copy”, with confirmation when content will be discarded | Admin; issued version remains current for viewers until another AL is published. Input filing state is retained. |
| View issued versus working | Per-day selector on the view-only week | Admin, member and admin-as-member; published days only; both desktop and phone. No mutation. |
| Create an alternative plan | `+ Alt Plan` | Admin; draft or published day. First use creates Plan A and Plan B. |
| Switch live plan | Plan row in menu or Select in modal | Admin; draft or published working day. Published-day pending state is rebased against the issued snapshot. |
| Preview a parked plan | Unpublished view-page picker or plans-menu preview | Read-only; the edit side can explicitly switch it live. Published view-only days hide parked plans. |
| Rename/delete plan | Pencil/manage modal | Admin; live plan cannot be deleted. Deleting down to one removes the plan structure and returns to “Live working copy”. |
| Edit then revert | Same edit control used in reverse | Admin; after publication the canonical delta, pending mark and signature validity must return to the issued state. |
| Add then remove | Add and delete controls | Admin; adding and removing the same new structure must net to no amendment. Removing an issued structure creates a real tombstone. |
| Reorder then reorder back | Drag/rearrange controls | Admin; a real issued-row move creates `mov:`; reversing exactly must clear it. |
| Accept/unaccept an input | Inputs page filing controls | Member for their own input and authorized admin paths; on a published day it becomes a pending filing amendment and needs fresh signatures. |
| Change OIL earning decision | Scheduler-board OIL Earn mode | Admin; weekend/holiday working copy. Leave War does not move until publication. |
| Place/change OIL bid | Leave War bid controls | Member’s own bid; publishing keeps an undecided clash and flags it. |
| Inspect changes | Board history line, history list and cell hover/tap bubble | Admin/session view; phone has no hover but retains list/tap paths. |
| Export | CSV and Print/PDF controls | Scheduler/admin only. Uses published snapshots; export is not a publication or undo boundary. |

## State gates

- Draft day: four signatures can unlock only that day’s Original publication. There is no Publish AL or Unpublish.
- Published, no delta: issued tag remains; no Publish AL; status says there is nothing to publish; Unpublish remains available.
- Published, changed: canonical pending count, “Not yet signed”, fresh sign-offs and per-day Publish AL are required.
- Issued preview: all writers, Publish AL and Unpublish are blocked; only Back/Load and navigation remain.
- Plan preview: read-only; Switch makes it live.
- After unpublish: the withdrawn latest issuance is retired, the prior surviving issue becomes current, working changes reopen and signatures clear.
- After undo of publish: same quiet-withdrawal model; no silently rewritten issued snapshot.
- Member/admin-as-member: no edit, sign, publish, unpublish or plan-management writers. Issued/working viewing remains available.
- Phone: the same state-writing doors remain, adapted to tap/fold presentation; hover history is not available.
- Weekend with an OIL bid against it: first Unpublish tap warns and arms; second confirms; Leave War must immediately recompute from the prior latest publication.

## Data actions with no screen

- There is no direct browser for `SCHED.retired`. A retired issuance is stored but can only be inferred or recovered through immediate Undo. At the current no-shared-database step, undisseminated retirement is intentionally silent.
- Per-person “undo my own last input change” is **NOT BUILT** under D148. Its absence is not a defect in this retest.
- Frozen published-unavailability membership is **NOT BUILT** under `[PUB-UNAVAIL]`.
- Current-day-only export is **PARTLY BUILT**: published-snapshot export is live, but it still exports the whole week.
- EOD issuance is **DEFERRED**.
- There is deliberately no Publish-all control and no arbitrary withdrawal of a non-latest issuance. Older versions can only be peeled after every later version has first been withdrawn.

## Drawn control that does nothing usefully

The Amendments panel’s **Discard marks** button is enabled from the global raw pending count. On a published-only change, the engine deliberately refuses to clear those marks but still records/reflows and toasts “Pending marks cleared”. That is a real dead/misleading control.

# 3. Ranked failure scenarios

Ranks begin with the most specialised and least-shared surfaces.

## Top 15 — full execution scripts

| Rank | Setup | Action | Expected result | Observation that disproves correctness |
|---:|---|---|---|---|
| 1 | On a weekend, publish an Original that earns OIL for A while A has an undecided bid. Publish AL1 that removes A, then AL2 that gives the work to B. Photograph edit, view and Leave War after every issue. | Two-tap Unpublish AL2; inspect every surface. Then Unpublish the now-latest AL1; inspect again. Finally Undo that second unpublish. | After the first withdrawal, AL1 is current, AL2 is retired, the live AL2-shaped copy is pending against AL1, and Leave War reflects AL1. After the second, Original is current and OIL reflects Original. Undo restores AL1, not AL2. Version tags, view face, marks and OIL all agree. | Any stale AL2 tag, viewer content from one version and marks from another, lost working changes, wrong same-label reissue number, bid deletion, or Leave War reflecting a retired/newer working copy. |
| 2 **CONFIRMED DEFECT** | Publish a day; change one visible field without republishing. Open the scheduler board first at desktop width, then phone width. | Compare the week day head with the board header/sign strip. | Both working-copy edit surfaces show “Not yet signed”; the issued view shows neither. | The week shows the marker but either board width does not. This is what the current code predicts. |
| 3 **CONFIRMED DEFECT** | Publish a day, make one ordinary pending edit, and ensure there are no pending marks on never-published days. | Open Amendments and press “Discard marks”. | Because published divergence cannot be discarded by that command, the button should be unavailable or explicitly explain that there are no discardable draft marks. | The button is enabled, announces success, but the pending change/count remains. This is what the current code predicts. |
| 4 **CONFIRMED DEFECT** | Publish a weekend day, then change only an OIL earning decision. This produces a canonical OIL delta without an ordinary `SCHED.pending` cell key. | Compare the edit-week count, board count, Amendments summary and `~` day-details panel. | Every place says one real unpublished difference; Amendments says “what this day earns changed”. | Day-details says zero/no unpublished edits while the canonical surfaces say one. This is what the current code predicts. |
| 5 **CONFIRMED DEFECT** | On a published day, prepare Plan A matching the issued document and Plan B differing only in an OIL decision or another canonical-only field. | Switch A→B, then B→A, reading the toast and visible pending count each time. | B reports one canonical difference; A reports a match. The toast and all visible counts agree. | Toast says “matches…nothing pending” while the day head/Amendments offers an AL, or reports a different number. Current code predicts this drift. |
| 6 | Publish a day, then alter its working copy without republishing. Include a conspicuous callsign/time. | Export CSV and Print/PDF at desktop and phone widths. | Both exports contain the frozen issued value, not the working edit. Print names the issued version. Export does not change Undo. Whole-week scope is the known PARTLY BUILT behavior and is not a new finding. | Working-copy content leaks into either export, the stamp names the wrong version, or export changes what Undo can reach. |
| 7 | Publish Original, edit, re-sign and publish AL1 on an ordinary weekday. Capture the issued and working faces. | Unpublish AL1, then immediately Undo the unpublish. Separately repeat from a fresh state and Undo the AL1 publication itself. | Direct unpublish reopens AL1 content as a working correction with Original current; Undo restores AL1. Undo-publish uses the same quiet-withdrawal model. No issued snapshot is rewritten. | Different semantics for the two routes, missing pending changes, AL2 allocated on same-label reissue, or viewer remaining on the withdrawn issue. |
| 8 | Branch from the same freshly published day. | Branch A: sign all four, then edit. Branch B: edit, then sign all four. Revert Branch A’s edit afterward. | A’s edit invalidates displayed signatures and blocks publish; exact revert restores them. B’s signatures bind to the changed content and unlock AL publication. | Signatures stay green after changed content, do not return after exact revert, or signatures from the wrong content unlock publication. |
| 9 | Publish AL1 and create Plan A/B with distinct content. | Branch A: switch to B, preview Original and load it. Then switch A and back B. Branch B: while A is live load Original, then switch to B and back A. | Load changes only the currently live plan/working copy. Switching stows it under that plan. AL1 remains the viewer’s issued version throughout, and each plan preserves its own content/signatures. | Load silently changes the viewer, overwrites the wrong parked plan, loses a plan’s signatures, or leaves plan name/content mismatched. |
| 10 | Prepare a fileable member input covering a day. Use equivalent clean branches. | Branch A: accept/file the input, sign and publish the day/AL. Branch B: publish first, then accept/file the input. | A includes the filing in that issuance. B leaves the existing issue frozen and creates an `input filing` delta requiring fresh signatures and the next AL. | Filing silently changes an issued face, is absent from the next AL, does not invalidate signatures, or loading a version discards the Inputs record. |
| 11 | Publish a day with a known text/time value and valid sign-offs. | Change value A→B and then B→A; repeat by Undo/Redo. | Dotted mark, pending count and sign invalidation appear at B and all disappear/restore at A. Any prior solid issued mark returns. | Phantom pending survives, original sign-off does not restore, or history/hover points at the wrong cell. |
| 12 | Publish a day with one issued row and room for a new row. | Add a new row and delete it. Then delete the issued row and Undo; finally recreate equivalent content through the UI. | Add→delete nets to no delta. Deleting an issued row creates one removal. Undo restores clean state. Merely recreating equivalent content must not corrupt identity or mark another row. | False removal after add→delete, one deletion expanded into multiple items, or issued marks migrate to the wrong row. |
| 13 | Publish a day containing at least three reorderable issued rows. | Move row A past B, then put it exactly back. Repeat using Undo/Redo. | First move creates one reorder item; reversing clears it and restores signatures. Other rows retain their issued marks by identity. | Reorder is missed, remains pending after exact reversal, or a colour follows a position instead of its row. |
| 14 | Build a high-information state: published AL1, Plan A/B, one working delta, partial signatures, view-page Working selection and an armed preview/unpublish confirmation. | Reload; change week and return; log out/in as admin; log out/in as member; admin View-as-member and back; resize desktop→phone→desktop. | Persisted schedule, versions, plans and pending data survive. Session/week-only preview, working-view choice, armed confirmation and edit history clear at their documented boundary. Member/view-as never retains write controls. Responsive changes do not mutate state. | Durable state disappears, transient state leaks into a new session/week/role, member can write, or phone/desktop show different version content. |
| 15 | On a weekend, create three equivalent branches with issued work earning OIL and an undecided bid against it. | Branch A publish; Branch B publish then unpublish; Branch C publish then Undo publish, then Redo. Inspect Leave War after every action. | Publish creates the issued credit and keeps/flags the bid. Unpublish and Undo-publish remove/revert credit according to the prior latest issue without deleting the bid. Redo restores exactly once. | Working changes move credit early, bid vanishes, credit duplicates, another day changes, or Undo/Redo disagrees with direct unpublish. |

## Ranks 16–40

16. **Per-day isolation.** Setup changes on Monday and Tuesday → sign/publish Monday only → expected Tuesday remains untouched and pending → disproof: Tuesday marks/signatures/version move.

17. **Per-day identifiers.** Publish Monday AL1 and Tuesday AL1 → expected distinct date-qualified identities and both visible as AL1 on their own day → disproof: preview/load resolves the other day.

18. **Original immutability.** Publish Original, then several ALs → preview Original after each → expected byte-stable content → disproof: Original acquires later edits or colours.

19. **Four-role eligibility.** Withdraw one scheduler appointment after signing → expected existing name remains visible but invalid appointment state follows the settled rule; an unsigned replacement list offers only appointed schedulers → disproof: arbitrary people offered or invalid day publishes.

20. **Three-of-four refusal.** Sign only three roles and try every Publish door → expected every door locked/refused → disproof: any callsite publishes.

21. **Availability after signing.** Sign, change availability only → expected signatures remain valid under D45 → disproof: availability alone clears them.

22. **Filing after signing.** Sign, then accept/unaccept an input covering the published day → expected fresh signature requirement → disproof: AL publishes using pre-filing signatures.

23. **Per-plan signatures.** Sign Plan A, switch and sign Plan B, then return A→B → expected each plan restores its own four bindings → disproof: one plan inherits or clears the other’s state.

24. **Plan lifecycle.** Create A/B/C, rename uniquely, attempt duplicate/blank names, delete non-live plans down to one → expected validation and collapse to “Live working copy” → disproof: duplicate name, live deletion or orphaned selector.

25. **Viewer default.** With an unpublished working edit over AL1, enter view-only as member and admin-as-member → expected AL1 issued face by default → disproof: live edit visible before choosing Working draft.

26. **Viewer working choice.** Choose Working draft, leave the page and return/reload → expected clear label while selected and issued default after its reset boundary → disproof: unlabeled working content or choice leaking to board/another session.

27. **Preview load count.** Create multiple content changes plus an input filing, preview Original and press Load → expected confirmation counts only content actually discarded; filing remains → disproof: count includes filing or filing disappears.

28. **Preview guard sweep.** While previewing an issued version, try week, board, Amendments and stale controls → expected no edit, publish or unpublish path works → disproof: any hidden/stale writer mutates live data.

29. **Plan-preview clothes.** Preview a parked plan on an unpublished day → expected Draft/read-only treatment and no ORIG/AL tag or issued warnings → disproof: it looks published.

30. **View-as-member authority.** Open plan manager as admin, flip to member while it is open, then use keyboard/tap remnants → expected modal and every writer disappear/refuse → disproof: rename/delete/sign/publish succeeds.

31. **Sequential latest-only withdrawal.** Issue Original, AL1, AL2; attempt to target AL1 directly, then peel AL2 and AL1 → expected only current latest can be withdrawn → disproof: arbitrary older withdrawal or skipped current-pointer update.

32. **Unpublish without OIL clash.** Published ordinary weekday or weekend with no bid against → expected one tap → disproof: needless confirmation or refusal.

33. **Unpublish with OIL clash.** Published weekend with live bid → first tap arms/warns; navigate/preview away; return → expected arm cancelled and a fresh two-tap sequence required → disproof: delayed second tap withdraws unexpectedly.

34. **Issued marks.** Publish AL1 containing ordinary edit, deletion, reorder and input filing → expected solid AL1 attribution and correct aggregate kinds → disproof: dotted remnants, missing structural totals or marks painted onto unrelated cells.

35. **AL2 recolour.** Edit an AL1-marked item and publish AL2, then revert it to AL1’s value → expected AL2 while changed, then restored AL1 tint when reverted → disproof: latest colour sticks after revert.

36. **Warnings by displayed face.** Make working copy fix an issued cross-day warning → expected edit/Working face reflects fix while issued view retains its issued warning → disproof: one face’s validation leaks into the other.

37. **Old-version and plan warnings.** Preview an older issued version and a parked plan → expected no newly recomputed live flags on those read-only previews → disproof: current working warnings paint the frozen preview.

38. **Holiday declared after publication.** Publish ordinary day, then declare it a holiday without republishing → expected no OIL yet plus republication warning; publish AL → expected credit then appears → disproof: credit moves before AL or not after it.

39. **Date/week boundary.** Create Monday pending/version state, change to another week’s Monday and back at both widths → expected no weekday-name collision; all identity is date/week scoped → disproof: preview, marks or OIL attach to the other Monday.

40. **Complete opposite-action sweep after publication.** For each supported gesture perform both directions: assign/remove person, text edit/revert, add/delete, delete/Undo, reorder/reverse, sign/clear, accept/unaccept input, switch A/B, preview/back, OIL off/on/clear and publish/unpublish/Undo. Expected every exact round trip returns content, canonical delta, marks, signatures, version pointer and OIL to the starting state. Any residue or cross-day effect disproves correctness.

Dependencies that are deliberately not defect scenarios:

- Current-day-only export depends on AM50 and is **PARTLY BUILT**.
- Published-unavailable membership freeze depends on `[PUB-UNAVAIL]` and is **NOT BUILT**.
- Per-person own-input undo depends on D148 and is **NOT BUILT**.
- EOD scenarios depend on AM52 and are **DEFERRED**.

# 4. Explicit negatives

- I checked per-day publication and found no publish-all writer or control.
- I checked version identity and found date-qualified per-day IDs, cross-day validation and per-day AL sequencing.
- I checked Original creation and later AL issue paths and found no forward path that rewrites the Original.
- I checked the latest-version resolver and found it falls back through surviving ALs to Original rather than trusting an orphaned current pointer.
- I checked Unpublish and found latest-only retirement, prior-version selection, same-label correction and preview/auth guards.
- I checked Undo integration and found publish-boundary handling and sign clearing wired into the scheduler command layer.
- I checked issued-version loading and found it leaves the issued current pointer unchanged and excludes global input filing state from the discard count.
- I checked preview callsites and found write, Publish AL and Unpublish guards in the week, board, Amendments panel and command wrapper.
- I checked plan switching and found published-day rebasing for value, removal, add, reorder and input-filing identities.
- I checked per-plan signatures and found both sign values and their content bindings stored in each plan.
- I checked signature binding and found ordinary content changes invalidate signatures, exact reverts can restore them, and availability is excluded as ruled.
- I checked role enforcement and found both hidden controls and command-level admin guards; the plan modal also self-hides after view-as-member.
- I checked the view-only page and found published days default to the frozen issued snapshot, with an explicit, labelled working-draft choice.
- I checked issued and saved-plan previews and found no intended edit gestures on their frozen content.
- I checked amendment mark derivation and found canonical-delta eligibility, issued solid marks, pending dotted marks, tombstones and move items.
- I checked add→remove and edit→revert implementation/tests and found explicit net-zero handling.
- I checked OIL derivation and found the latest issued snapshot is the downstream source; live working changes do not directly update Leave War.
- I checked OIL publication clash handling and found the bid is retained and flagged rather than replaced.
- I checked exports and found both CSV and print source published snapshots. I found the already-declared whole-week scope, not a new current-day implementation.
- I checked History and found a session edit log, not a misleading claim that it is persistent issuance history.
- I checked retired issuance storage and found no user-visible retired-version browser. At the present no-database step, silent undisseminated retirement is the settled behavior.
- I checked next-week peek and found no amendment tags, signs or marks; the renderer is intentionally inert and planned-content-only.
- I checked the production-browser suite and found no complete end-to-end amendment journey covering publish→AL→unpublish→viewer→OIL at both widths. That is a test-coverage gap, not itself an application defect.
- I found no new-data migration or old-format issue within D56 scope.
- I did not treat the EOD, D148 own-change undo, published-unavailability freeze, whole-week export or remaining warning backlog as amendment defects because the register marks them deferred, not built or partly built.

# 5. Confirmed defects and exact fixes

## F1 — “Not yet signed” is missing from the scheduler board

**Scenario:** 2  
**Status:** Confirmed by code inspection.

The canonical predicate explicitly says it represents a published working copy that differs from its issued version in [publish.ts](/C:/Users/User/projects/Raptor/raptor-port/src/engine/publish.ts:347). The edit-week day head calls it in [html.ts](/C:/Users/User/projects/Raptor/raptor-port/src/ui/html.ts:1409). The board’s shared publication strip renders the plan selector, version tag and `dayStatHTML`, but never renders the marker in [board.ts](/C:/Users/User/projects/Raptor/raptor-port/src/ui/board.ts:386).

Expected fix:

1. Extract the marker markup from `dayHTML` into a shared `workingAmendmentMarkerHTML(di, showingIssued)` helper.
2. Have the helper return “Not yet signed” only when `notYetSigned(di)` is true and the surface is displaying the live working copy.
3. Call it from the edit-week day head.
4. Call it from `boardSignHTML` beside `verTagHTML`.
5. Pass the board’s actual display world so member/read-only issued rendering cannot receive the marker.
6. Keep it absent during an issued preview and on the view-only issued face.
7. Add UI tests for week, desktop board, phone board, issued view and Working-draft view from the same state.
8. Add a rendered-browser scenario that photographs all five surfaces.

## F2 — Canonical pending counts drift in day details and plan-switch feedback

**Scenarios:** 4 and 5  
**Status:** Confirmed by code inspection.

The correct published-day authority is `dayDelta(di)`: [publish.ts](/C:/Users/User/projects/Raptor/raptor-port/src/engine/publish.ts:332). The normal day strip already uses that authority in [html.ts](/C:/Users/User/projects/Raptor/raptor-port/src/ui/html.ts:1244).

Two other callsites use raw mark counts:

- Day details assigns `dp=dayPendCount(di)` and displays it as unpublished edits in [html.ts](/C:/Users/User/projects/Raptor/raptor-port/src/ui/html.ts:1966).
- The plan-switch toast uses `dayPendCount(di)` to claim either “N differences” or “matches” in [board.ts](/C:/Users/User/projects/Raptor/raptor-port/src/ui/board.ts:1545).

OIL decisions are canonical day content but their writers do not create ordinary cell pending keys, so these callsites can report zero while Publish AL is correctly offered.

Expected fix:

1. Add one exported helper, for example `dayVisiblePendingCount(di)`.
2. Implement it as `dayApproved(di) ? dayDelta(di).length : dayPendCount(di)`.
3. Replace the local count calculation in `dayStatHTML` with that helper, preserving its special frozen-preview count.
4. Replace `dayPendCount` in `dayInfoHTML`.
5. Replace `dayPendCount` in the published-plan `switchDraft` toast.
6. Search every user-visible use of `dayPendCount` and retain it only where the text genuinely means raw marks on a never-published day.
7. Add tests using an OIL-only delta and at least one other canonical-only delta.
8. Assert identical counts in week, board, Amendments panel, day details, preview confirmation and plan-switch toast.

## F3 — “Discard marks” is enabled for published changes it cannot discard

**Scenario:** 3  
**Status:** Confirmed by code inspection.

The panel enables the button from global `pendCount()` and always calls `commitDiscardPending` in [ALPanel.tsx](/C:/Users/User/projects/Raptor/raptor-port/src/ui/ALPanel.tsx:13). The engine deliberately removes keys only from never-published days but unconditionally reflows, pushes history and announces “Pending marks cleared” in [publish.ts](/C:/Users/User/projects/Raptor/raptor-port/src/engine/publish.ts:715).

Expected fix:

1. Add `discardablePendingCount()` that counts only pending keys whose day has no issued Original.
2. Drive the button’s enabled state from that count, not global `pendCount()`.
3. Rename it to “Discard draft marks” or give it equally explicit explanatory text.
4. When published changes exist but no draft marks are discardable, disable or omit the control and state that published changes must be reverted or issued.
5. Make `discardPending()` return the number removed.
6. If that number is zero, do not push history, emit a command envelope, reflow or show a success toast.
7. If draft and published marks coexist, remove only the draft marks and report the exact number removed.
8. Add engine, command-layer and panel tests for draft-only, published-only, mixed and zero-mark states.

No additional scenario is asserted here as a confirmed application defect. The remaining scenarios are high-risk production walks intended to find missing renderer, gesture, lifecycle and cross-system callsites that static review cannot clear.

