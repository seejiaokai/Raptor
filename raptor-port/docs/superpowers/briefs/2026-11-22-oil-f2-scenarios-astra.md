Independent scenario-design report — exported copy identified by BRIEF.md as ac3e22f77. Read-only; no files changed. These are scenarios and source-derived failure predictions, not a completed browser walk.
The export lacks HANDOFF.md, OUTSTANDING.md, the full ruling rows and the design guide. Expectations below use the brief and supplied rule summaries. OIL means earned leave, not money.

1. Scenarios

S01. On both Edit Schedule’s week and the Scheduler Board, independently start with each of CUR CK, SKED CK, PLANNED BY and APPROVED BY; choose a name with an unanswered input present. EXPECTED: the list opens before signing, showing that exact box and name with a dotted edge and “waiting for your answer” (D2294, D2297, D2299).

S02. With two unanswered inputs, answer only the first and Save; reopen the now-signed box and select the same name, then repeat with a different name. EXPECTED: the remaining question is offered in both cases; merely reopening or cancelling the name chooser changes nothing (D2294, D2299).

S03. Choose a sign-off using Tab, arrows and Enter; answer and Save using only the keyboard. EXPECTED: the same held-name flow, no premature signature, visible focus and a usable return position (D2294, D2299; keyboard rule).

S04. Exercise Save → Later → ×, Save → × → Later, Later → Save → ×, Later → × → Save, × → Save → Later and × → Later → Save, rotating the starting box through all four and using the fourth box to check the result. EXPECTED: partial Save leaves remaining questions askable; × cancels only its held signature; after Later, subsequent boxes sign directly without another list for the same unanswered inputs (D2294, D2299).

S05. Across the four boxes, repeat partial Save → partial Save, × → × and Later → another sign-off; also replace an open hold by picking another box before answering. EXPECTED: each Save writes its selected answers before its own name; cancelled or replaced holds never sign later; Later suppresses further asking for that day (D2294, D2299).

S06. Make unsaved Yes/No picks, then separately use ×, Escape and Later. EXPECTED: all three discard the picks; × and Escape record no name, whereas Later records the held name and shows the appropriate consequence beforehand (D2294, D2299).

S07. Open an input’s own window over the list; press Escape there, then Escape in the list; separately press Escape while editing a background field. EXPECTED: Escape closes or cancels the foremost applicable editor, never signs; cancelling a background edit does not dismiss the list (D641, D2299; keyboard rule).

S08. Move the list and click, scroll and edit behind it. EXPECTED: the page remains usable, outside clicks do not dismiss the list, and neither signing nor saving occurs merely through moving focus (D641, D2294).

S09. Clear existing signatures with unanswered inputs present; repeat while another signature is held, then close that list with ×. EXPECTED: Clear asks no OIL question, clears the recorded names, and × cannot restore them; choosing the blank name likewise only clears (D2294, D2299).

S10. List three inputs; select Yes for one, No for another and leave the third untouched, then Save and sign another box. EXPECTED: the two answers save together, No counts as answered, only the third remains askable, and the first held name was recorded after the answers (D782, D2294).

S11. Use Yes to all, change one to No, deselect another, then Save; repeat with No to all and Later. EXPECTED: Save writes exactly the current selections; Later writes none of them; counts and singular/plural wording follow the live list (D782, D2296, D2299).

S12. Answer Saturday for an input spanning Friday through Monday, then sign Sunday and the following week. EXPECTED: only Saturday’s answer changes; other unanswered qualifying dates still ask, and Later on Saturday does not suppress Sunday (D782, D2294).

S13. Answer one shared input containing several named people; inspect each person’s schedule and earned-leave record before and after publication. EXPECTED: one list row and one answer for everyone; automatic earned leave changes only with publication (D762, D2).

S14. Repeat with ALL AVAIL, then ALL AVAIL plus a named person; change someone’s availability after publication. EXPECTED: one question per input, the published eligible crowd earns according to its frozen membership, and later changes wait for republication (D32, D43, D45, D762).

S15. Repeat the first-signature flow on a plain weekend, a named weekday holiday, an unnamed holiday and an ordinary working weekday. EXPECTED: qualifying days ask with truthful headings; the weekday does not ask; opening from a sign-off never claims a holiday was just declared (D2294, D782, D804).

S16. Mix unanswered work with cancelled, information-only and taken-off inputs, leave, medical, Personal, SANS availability and upchits. EXPECTED: only qualifying work appears or is named as unanswered at publish (D804, D814, D2294).

S17. From a held list, open an input and answer it there; repeat by deleting it, taking it off the programme or changing its dates. EXPECTED: the list immediately reflects what still qualifies; stale picks cannot overwrite the new answer or act on a removed input (D641, D782, D814).

S18. Answer every remaining input elsewhere while a name is held, then press Close. EXPECTED: “Nothing left to answer”; under the builder’s stated interpretation the held box disappears, and Close signs nothing (D2299).

S19. While Yes is selected but unsaved, change that input’s hours behind the list from half-day to full-day eligibility, then Save. EXPECTED: the displayed amount and saved answer agree with the current input; all its people receive the same answer (D641, D762, D782).

S20. Press Later, then bring a previously absent unanswered input onto that day through a supported filing or put-back route; also change an existing deferred input in place. EXPECTED: no unanswered work becomes invisible; reopening for a newly encountered input is the builder’s interpretation, which must be distinguished from D2294’s literal “asks no more that day.”

S21. Save answers and a held name on an already-published day awaiting an amendment; inspect View-only Sched and earned leave before publishing. EXPECTED: previous signatures invalidated by the answers fall, the newly completed signature stands, and the issued schedule and earned leave remain unchanged until the amendment (D103, D2, D2294).

S22. With all four boxes signed and no changes pending on an issued day, complete or re-pick signatures. EXPECTED: no false publish opportunity and no duplicate completion message merely for re-picking a name; any outstanding OIL question still follows the sign-off rule (D2294; existing publication contract).

S23. Hold a name on Plan A, then switch to Plan B containing the same unanswered input but different programme work; press Later and repeat with Save. EXPECTED: Plan A’s pending name must not silently sign Plan B; each plan owns its signatures (per-plan signing contract; D2294).

S24. Hold a name, then load a published version, duplicate a plan, preview an older version or undo a plan switch behind the list. EXPECTED: no held name is transferred to a replacement plan or used to sign content hidden behind a preview; historical signatures remain historical (D45, D95, D102; per-plan signing contract).

S25. Hold Saturday’s name, move the Board to Sunday, then Save or Later; separately move to another week and try both buttons, including leaving and returning. EXPECTED: Sunday or another week never receives Saturday’s signature; any answers saved remain confined to the list’s named date (D641, D2294).

S26. Hold a name, change squadron, then Save or Later; repeat after returning to the original squadron. EXPECTED: no signature or answer leaks into the other squadron, and the list’s authority and destination remain correct (D2195, D2201, D2294).

S27. Hold a name, sign out and sign in as another scheduler or a member; also repeat after Later. EXPECTED: no pending name or unsaved picks survive the session; whether deferred questions return must be reported as the builder’s session-only interpretation, not an explicit part of D2294 (D148, D785, D2299).

S28. Open the list as a scheduler, then lose the right to edit its squadron or enter member view before saving. EXPECTED: no answer or signature is written under lost authority; a refusal cannot silently consume the outstanding question (D785; list permission contract).

S29. As a member, inspect the same unanswered input and use its permitted own-input answer route. EXPECTED: no sign-off controls or scheduler-list answers are available; membership of a shared input alone grants no separate OIL answer (D762, D785).

S30. Save two selected answers with a held name; Undo twice and Redo twice, inspecting both pages after every step. EXPECTED: the answers remain one batch; the builder’s proposed order is name undone first, answers second, then answers restored before the name; never a valid signature against different answers (D148, D782, D2294).

S31. Undo and Redo immediately before a hold, while picks are unsaved, after Later, after ×/Escape and after Clear. EXPECTED: opening, picking and cancelling add no saved changes; Undo reverses the recorded action, with no ghost signature or stale answer. Explicitly check whether undoing Later should also reverse its suppression—the brief does not settle that (D148, D2299).

S32. Undo an answer while another box is held; then Save or Later. Also Undo and Redo publication. EXPECTED: the live list follows restored answers, signatures match the restored content, and earned leave follows the latest issued version without duplicate credit (D148, D142, D2294).

S33. Open the list through the bell, immediately after saving a holiday, and after loading a published version, first with no held sign-off. EXPECTED: those doors show no held box; Save answers only, and Later/×/Escape sign nobody (D781, D782, D818, D865).

S34. Repeat those three doors while a sign-off is already held, for both the same date and another date. EXPECTED: a replacement list cannot secretly retain the previous door’s name; its visible controls and wording must match what Save and Later actually do (D2297, D2299).

S35. Leave one, two, three and four inputs unanswered, including a custom title and a shared input, then publish through each available publish control. EXPECTED: the note identifies the unanswered work and its lack of earned leave; counting rather than naming four inputs is the builder’s wording choice, not an explicit exception to D2294.

S36. Publish with an unanswered input alongside a desk with unusable times, a clashing leave bid and, separately, no Leave War period for that year. EXPECTED: the publication result and every applicable warning remain visible together; none replaces the unanswered-input warning (D81, D19, D2294).

S37. Give only one squadron a weekday holiday; repeat with a shared input and an input spanning a person’s transfer between squadrons. EXPECTED: each list asks only for its own qualifying dates, and answering one side cannot change another date’s answer or publication (D2195, D2206, D2262).

S38. On a phone in portrait and landscape, exercise all four native name pickers, a long shared-input list, Save/Later/×, dragging, scrolling and the keyboard where available. EXPECTED: the held box, dotted edge, full names and footer remain readable; controls stay reachable; a swipe does not activate the page behind. Capture immediate and settled pictures after taps (D641, D686, D2297, D2299, D1281).

2. The roll-call

Paths below are relative to raptor-port/src.

R01. ui/html.ts signoffHTML and ui/board.ts boardSignHTML → ui/Shell.tsx onChange → ui/oilsign.ts signPick: HAS the new door on both editable surfaces; no second ordinary name-selection writer was found. Same-name confirmation is the gap described below.

R02. ui/interactions.ts routeClick, data-signclear → engine/publish.ts signClear: intentionally bypasses the question because it removes signatures. Clear must remain usable with the list open and must not turn dismissal into signing.

R03. ui/interactions.ts routeClick, data-beak/data-alpub → state/sched-commit.ts commitSetDayApproved/commitPublishALDay: both the week and Board publish through these routes. They should enforce valid signatures and carry the unanswered-input warning; they need not ask again after Later.

R04. ui/ALPanel.tsx ALPanel → commitPublishALDay: the Amendments panel is another publication door. HAS the shared warning through commitPublish → publishFlagsBids; include it in the walk rather than testing only the day’s publish button.

R05. engine/publish.ts setDayApproved, publishALDay and alIssue: these issue and consume signatures without signPick. Production wrappers supply the warning; probe-bridge.ts exposes raw publication functions that bypass that wrapper, so calling them is not evidence that the visible publication route works.

R06. engine/drafts.ts draftDup and draftSelect, reached through ui/board.ts switchDraft and the plans controls: copy, store and restore signatures without signPick. Restoring valid plan signatures should not ask anew merely for restoration; an outstanding held signature must remain attached to its original plan. That latter protection is MISSING.

R07. engine/drafts.ts loadVersionToWorkingCopy, reached through ui/interactions.ts routeClick: replaces the working content without a new signing gesture; ui/oilputback.ts oilPutBackWatch opens an ordinary list only when unanswered work is brought back. A surviving hold must not sign replacement content.

R08. state/sched-commit.ts applyBookDay/schedWriteRecords and schedPostRestore, state/history.ts histRestore/histApply, and state/store.ts applyWeekModel/loadWeek: restore signature records outside signPick. Undo, Redo and loading should restore records with their bindings, never generate a new signature or replay a held name.

R09. engine/publish.ts resetSched, signClear, signClearPlans and unpublishDay, plus engine/overlay.ts stripSign/overlayDeletedWeek: clear signatures outside the new door. These are removal/reset paths and must not ask; a pending hold must not resurrect a removed signer or defeat an unpublish.

R10. ui/topstate.ts openNotice, leavewar/sync.ts tellHoliday/askFiledOil and ui/oilputback.ts oilPutBackWatch: other list openers intentionally carry no held signature. ui/html.ts signedLineHTML and ui/ALPanel.tsx show issued signers read-only; neither should acquire a signing door.

3. Concrete failures

F01. Failing browser test: hold a name on Plan A, switch to a different Plan B retaining the same unanswered input, then press Later; EXPECTED neither plan gains that held signature, but holdStands checks only squadron/date and writeSign signs current Plan B. Cause: SignHold carries no plan identity, and oilPutBackWatch leaves the existing list untouched when no new unanswered input is brought back. Fix: capture the selected plan identity with the hold, invalidate the hold on plan replacement, and verify that identity before either Save or Later writes a signature; keep any continuing answer-only list visibly free of the cancelled hold.

F02. Failing browser test on both pages: with two unanswered inputs, choose CUR CK, answer only the first and Save, then confirm the same CUR CK name again; EXPECTED the remaining input’s list opens, but native same-value selection emits no change event and Shell’s onChange is the only entry to signPick. Fix: add an explicit same-name confirmation path through the same guarded signing action, while preserving cancellation of the native chooser as a no-op; test both mouse/touch and keyboard confirmation, not a directly invoked change handler.

Rulings: none this session.
