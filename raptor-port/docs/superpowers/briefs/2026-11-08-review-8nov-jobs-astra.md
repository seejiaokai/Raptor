# Astra — blind, read-only review

Reviewed all **16 app pull requests and seven rules-diet pull requests** listed in the brief, against their specified historical versions.

**No substantiated defect to number A1 was found.** One original requirement remains partly delivered, explicitly accepted by the owner: the pinned dates row’s remaining one-frame gap in #680.

This is a source and rules review, not a fresh whole-app bug check. I did not open another reviewer’s report, change any file, commit or push. The required-check decision tests ran **9/9 passed**. I did not rerun the full unit suite, production build, browser suite or physical-phone checks, and do not certify the historical test counts or deployments afresh.

## App pull requests

### #664 — DELIVERED

**Findings:** None established.

**Checked and found sound:**

- Both narrow-screen menus receive keyboard focus, support arrow navigation and return focus appropriately on Escape.
- Opening another menu closes the previous one. A held Enter does not immediately activate the first item.
- Widening the screen closes the now-hidden menu.
- Overlapping week slides restore every affected week’s scrolling and pointer handling. Only the last crossed week receives the final landing adjustment.
- Added tests cover overlapping slides, reversed completion order, disabled menu items and focus restoration.
- The removed backlog entries were preserved whole in the archive.

The later cyan-ring work belongs to #689. The different Tab behaviours were expressly retained by D1772.

### #667 — DELIVERED

**Findings:** None established.

**Checked and found sound:**

- The extracted display and save-status helpers retain their callers and behaviour.
- Replacing repeated list searches with sets preserves order and, where items are added during a loop, updates the set too.
- Storage migration and reset operations remain sequential; the changes explain why the code checker must not parallelise them.
- The posting-permission check rejects unexpected outcome names, including inherited object-property names, without throwing.
- The save-status tests follow the moved helper; their assertions were not removed.
- No rules-engine file changed.

The reduced code-check count includes documented suppressions where changing the behaviour would be wrong. It is not evidence that every original warning represented a repaired defect.

### #669 — DELIVERED

**Findings:** None established.

**Checked and found sound:**

- Mission-role wording and normalisation have one shared implementation.
- Trimming, whitespace handling, the name-length limit and recognised side values remain consistent.
- The editor checks the current context when deciding whether an offered answer still applies.
- Tests exercise changes to unsaved remarks and the Choose path, rather than checking only the extracted helper.
- History and Undo continue to distinguish absent answers from recorded answers.
- The engine change is confined to this shared mission-role handling; it does not alter flying-time or OIL calculations.

### #670 — DELIVERED

**Findings:** None established.

**Checked and found sound:**

- The affected hosted test jobs have explicit time limits.
- The Tracker smoke step also has its own limit.
- The change limits stalled runs; it does not remove assertions, skip tests or relax their expected results.

I did not independently measure whether those limits accommodate every slow hosted run.

### #676 — DELIVERED

**Findings:** None established.

**Checked and found sound:**

- On desktop, **+ Input** moves to the right end of its row.
- The list makes room only at the approved wider sizes and while the window remains in its opening position.
- The smaller-screen exception is retained: the window covers the list rather than crushing its columns.
- The narrower Type column and the list’s closing border follow the subsequent rulings.
- The calendar’s expand marks use drawings without changing the action.
- Changed position assertions follow D1787; the surrounding wrapping and alignment assertions remain.

No new physical-phone or rendered-layout verification was performed in this review.

### #678 — DELIVERED

**Findings:** None established.

**Checked and found sound:**

- With no entered reporting time or rally, a completed flying line starts its working-day calculation at take-off minus the configured default rally.
- Entered reporting times retain precedence.
- Standalone shifts retain their existing treatment.
- The separate flying record used for SANS checks keeps its report-or-step value; crew-rest handling still reads the entered reporting information.
- Unfinished flying lines cannot contribute one real endpoint to another event’s working span.
- A flying line with no measurable span does not extend the working day.
- The changed event property’s consumers were traced: the intended effect reaches working hours and long-day warnings, not the OIL calculation itself.
- The reference-test adapter changes only the authorised default-start behaviour and requires exactly one matching location.

The engine changes are within D1786’s requested behaviour. I found no unrelated engine cleanup.

### #679 — DELIVERED

**Findings:** None established.

**Checked and found sound:**

- Pressing the switch’s words produces one change, not two.
- The label press does not clear the selected person as though blank board space had been pressed.
- In OIL Earn mode, ineligible pucks explain why and do not select a person.
- Leave, medical, personal requests, SANS availability and placeholder bodies have appropriate refusal paths.
- A placeholder’s count retains its separate opening action.
- Outside OIL Earn mode, the normal input-opening and seat actions remain.
- Existing arithmetic is retained; this change concerns controls and explanations.
- Revised wording assertions follow D1782 and D1783, with behavioural checks retained.

### #680 — PARTLY against the original aim; DELIVERED against the accepted release scope

**Findings:** No new defect established.

**Checked and found sound:**

- The day window counts rows continuing below its visible area and presents the grey footer.
- The pinned-heading update is applied synchronously when the pinning state changes.
- Tests check the heading within the scroll frame, rather than only after a settling delay.
- The remaining painted frame is expressly acknowledged by **D1850** and retained as **[LW-PIN-LAST-FRAME]**.

The original “never blink” aim is not fully achieved. That is an accepted, recorded limitation, not concealed completion or a newly discovered regression.

### #687 — DELIVERED

**Findings:** None established.

**Checked and found sound:**

- Marking-window placement accounts for the tabs, screen edges, available space and a short viewport.
- The chart movement settles before final placement; pending animation work is cancelled on cleanup.
- Keyboard focus restoration avoids undoing the intended chart movement.
- The approved proposal supports the implemented above/below placement choices.
- The short-screen fallback is explicitly accepted by D1861.
- Phone Find clearing and closing restore the appropriate focus.
- Restore uses the shared drawn arrow.
- The removed backlog entry survives whole in the archive.

I did not treat the brief description of “opens whole below” as overriding the approved proposal and the subsequent short-screen ruling.

### #689 — DELIVERED

**Findings:** None established.

**Checked and found sound:**

- The sideways-phone layout is narrowly scoped to the relevant touch-screen dimensions.
- The board scrolls as one surface while its action bar and crew column remain positioned appropriately.
- Drag-edge scrolling, floating windows and keyboard scrolling use the changed scrolling surface.
- The 821–1099 layout gives remarks their own row and stacks the time fields as ruled.
- The cyan keyboard ring is limited to keyboard focus.
- The existing drag-scroll test changes its target to the newly authorised scrolling surface without dropping its behavioural assertion.

**Verification limitation:** the new keyboard-clearance browser test contains a conditional skip when its chosen box is already above the simulated keyboard. That test therefore does not prove the clearance case on every run. I found no evidence here that the condition hid an actual failure, so I have not promoted it to a defect finding.

### #691 — DELIVERED

**Findings:** None established.

**Checked and found sound:**

- Waiting marks identify the relevant current inputs, including replacements and moved or split entries.
- Issued views do not acquire working-copy waiting marks.
- A change-list jump targets a row that is actually drawn, rather than assuming every recorded row is present.
- Personal Inputs opens when the target needs it; an Unavailable entry does not open that panel unnecessarily.
- Unreadable saved weeks are distinguished from readable records produced by an older format.
- The existing refusal protections remain; the new words explain the actual reason.
- Accept/unaccept paths check protection before proceeding and check again after a delayed OIL answer.
- Drawn eyes and reset arrows retain the existing actions.
- Changed tests retain refusal, rollback, published-view and hit-target assertions.

The engine changes are supporting readers and explanations. I found no change that rewrites an issued record or alters OIL entitlement.

### #696 — DELIVERED

**Findings:** None established.

**Checked and found sound:**

- The two messages lose their typed symbols while retaining their instructions.
- Shared icons retain the Tracker’s styling hooks and appropriate dimensions.
- Palette aliases resolve to the app’s existing values.
- The chart’s independently exported colours remain covered.
- Removal of standalone fallbacks follows the retirement of standalone Tracker support.
- Revised tests still check resolved colour values, contrast and the shared drawings; they do not merely accept missing styling.

### #698 — DELIVERED

**Findings:** None established.

**Checked and found sound:**

- The pull-request workflow starts even for notes-only changes, allowing the required summary check to finish.
- A code change cannot pass when all substantive jobs were skipped.
- Failure and cancellation are rejected.
- Missing or malformed change-classification output is rejected.
- A code pull request requires a complete successful test route and a successful code check.
- The notes-only classification matches the workflow’s corresponding list.
- The code-check exclusions are directed at the approved records and reference material.
- The duplicated design-check settings are checked for agreement.
- The board-navigation test uses a controlled clock while retaining checks on both sides of the 350 ms boundary.
- The script guard was reviewed as an accidental-command guard, with its documented limits, rather than as a security sandbox.

**Fresh verification:** all nine required-check decision tests passed. I did not independently recheck the repository’s live branch-protection configuration.

### #702 — DELIVERED

**Findings:** None established.

**Checked and found sound:**

- Save-layer registration is moved to a separate wiring point, removing the circular imports.
- All four supplied loaders remain registered in their previous rollback order.
- Command types remain declared, with permission decisions still delegated to the existing permission resolver.
- Registration occurs before normal application use.
- Extracted person and archived-person editors retain their save, restore, archive and two-step delete behaviour.
- Opening and closing an editor resets its draft through mounting behaviour.
- Own-account restrictions remain.
- The rollback-loader test becomes more specific: it checks the supplied loaders and the complete expected count.

### #706 — DELIVERED

**Findings:** None established.

**Checked and found sound:**

- Storage refusal is distinguished from deliberately selected memory storage.
- The warning state is passed from startup to both the app and Tracker.
- **Not kept** uses the existing warning space without offering a meaningless Retry.
- A real failed save retains priority and its Retry action.
- Screens that make room for the failed-save band also make room for this band.
- The Tracker suppresses its successful-save wording while storage is not kept.
- The magnifier uses the shared drawing.
- Tests cover the warning wording, absence of Retry, reserved space and precedence of an actual failed save.

### #707 — DELIVERED

**Findings:** None established.

**Checked and found sound:**

- Medical reserves room only while the input window remains in its opening position.
- A genuine drag marks the window as placed; merely pressing its title does not.
- Inputs and Medical share the room-size value.
- Cut-off draft handling is extracted without changing its interpretation.
- Calendar-wheel recentering and legend-state changes preserve their existing transitions.
- The removed backlog entries were preserved whole in the archive.

## Cross-cutting app checks

**Documents cut during code changes:** only #664, #687 and #707 had Markdown files with net deletions. In each case the shortened file was the backlog. The removed substantive entries were found **whole** in its archive; these are permitted moves, not lost records.

**Tests:** no test file was deleted in the listed app changes. The changed assertions examined follow approved behaviour, moved helpers or shared styling. The conditional skip in #689 is disclosed above. I found no unjustified expected-value reversal or widened timeout used to conceal a failure.

**Rules engine:** production engine changes are confined to #669, #678 and #691. I found no unrelated refactoring of the ported calculation bodies.

**Historical claims:** source and test additions support the claimed implementations. This review does not independently prove every historical “passed”, “walked” or “live” claim.

## Rules-diet pull requests

The tables below compare the requested historical OLD and NEW versions. The wording is shortened for this report; the **Full row** column states the governing requirement and relevant exceptions. Later rulings are distinguished from changes introduced by the rewrite.

### #663 — DELIVERED

**Findings:** No changed operative meaning established.

**Checked and found sound:** the page preserves the separation between owner choices, technical decisions, independent review, release authority and required evidence.

| Ruling | OLD | NEW | Full row | Verdict |
|---|---|---|---|---|
| D53 | Search rulings and backlog before calling something missing or undecided. | Same search obligation, with the other loaded recording rules. | Search all areas and archive; stale comments are not authority. | SAME |
| D67 | Opus builds; independent readers review, subject to amendments. | Writer and fresh reader remain separate; current reader arrangement stated. | Later reader rulings amend roles, not independence. | SAME |
| D68 | Never shrink necessary reading to save context. | Required sections must still be read. | D1735 permits section-based reading, not omitted applicable sections. | SAME |
| D70 | Working-guide changes receive independent review before approval. | Review, approval and design-lesson exception retained. | Reader substitutions and the named lesson exception apply. | SAME |
| D90 | Later ruling wins; name the clash and fix its consequences. | Both rulings, dates and three correction areas retained. | Partial overlap remains a question, not assumed supersession. | SAME |
| D136 | Live rulings remain loaded; only eligible retirements leave. | Live statements remain in loaded files after conversion. | D1735 changes the form; D971 forbids retiring a merely narrowed rule. | SAME |
| D138 | Summaries must preserve meaning. | Condensed records retain that obligation. | Conditions, exceptions and reasons affecting decisions must survive. | SAME |
| D141 | No size targets; ceilings are tripwires. | Same distinction and reasoned increases. | Never cut needed information to reach a number. | SAME |
| D490 | Features by area; small fixes ride with their batch. | Same, with urgent harm handled immediately. | The urgent-harm qualification is identified as the agent’s reading. | SAME |
| D588 | Sonnet may walk, run checks and do chores; not review code. | Allowed work and prohibited high-risk work remain explicit. | Later rulings settle the small trials and walker arrangement. | SAME |
| D785 | Every scheduler is an admin. | Same; members, guests and unsigned users remain in scope. | No invented non-admin scheduler scenarios. | SAME |
| D790 | Fresh blind Opus finished-code review. | Same brief, no other report, host reproduces claims. | Finished-code review does not replace plan review or app walking. | SAME |
| D1530 | Public repository and Vercel remain on his order. | Same scope and owner-controlled reconsideration. | Does not waive every other platform requirement. | SAME |
| D1537 | Strict checking by area; engine remains verbatim. | Same separation and original-test protection. | No engine cleanup merely to satisfy strict checking. | SAME |
| D1625 | Show anything newly visible before building it. | Includes small fixes and copied existing designs. | Being part of a bug fix is not an exemption. | SAME |
| D1734 | ChatGPT readers called on his word, with later exceptions. | Calls and reads-owed list stated with those exceptions. | Assessed at this PR; later standing-reviewer rulings are separate. | SAME |
| D1735 | Pages replace short lines; every live rule stays loaded. | Loading, full rows, checklists and ordered rollout retained. | Meaning-preservation and retirement safeguards still apply. | SAME |
| D1739 | Every reworded diet step gets two blind reads. | Same; inability to obtain Astra’s read must be raised first. | No proceeding silently without that read. | SAME |
| D1743 | Temporary allowance window authorises the named reads. | Window and unresolved post-window arrangement retained. | Later D1770 settles the continuing arrangement. | SAME |

### #665 — DELIVERED

**Findings:** No weakened or dropped checklist obligation established.

**Checked and found sound:** the body below the title of each old file is preserved **byte for byte** in the named archive. The new files retain pointers to it.

| Checklist | Old obligations inventoried | Result |
|---|---|---|
| Bug check | Owner request, source change, completion claim, reported fault and reviewer finding all trigger it. | PRESENT |
| Bug check | Read the current method; answer eight questions; uncertain answers count as yes; state the tier and intended checks. | PRESENT |
| Bug check | Roll-call, door check, walk sizing, walk, gates, reads, fixes, re-walk, evidence and owner look remain ordered. | PRESENT |
| Bug check | Direct data changes do not replace pressing controls; a review and green tests do not constitute an app walk. | PRESENT |
| Bug check | No blank roll-call cells; pictures and the closing Walk line remain required. | PRESENT |
| Bug check | Missed owner-found faults become lessons; current reader rules and independent findings remain. | PRESENT |
| Bug check | Stored-data exclusion requires both stored-only harm and correct forward behaviour; skipped checks must be disclosed. | PRESENT |
| Document structure | General and area loading rules; full rows before detail; one appropriate home for each kind of information. | PRESENT |
| Document structure | Rulings, backlog, handoff, contracts, engine rules, schemas, maps, plans, evidence and archives retain their distinct purposes. | PRESENT |
| Document structure | Whole-text moves, pointers, archive eligibility and the prescribed archive mechanism. | PRESENT |
| Document structure | Own handoff block, branch ownership, parallel number ranges and compaction records. | PRESENT |
| Document structure | Size checks are tripwires; source changes do not justify document trimming. | PRESENT |
| Plain language | Lead with the consequence; app vocabulary; no raw technical output; say what changed and whether it worked. | PRESENT |
| Plain language | Concision must not remove reasoning, trade-offs, limitations or actionable facts. | PRESENT |
| Plain language | Technical choices belong to the agent; product choices belong to the owner. | PRESENT |
| Plain language | Clear waiting point and recommendation; required links, pictures and handoff prompt. | PRESENT |
| Plain language | Pre-send checks; explain unavoidable terminology; re-explain failed wording without blaming the reader. | PRESENT |
| Record decisions | Recognise qualifying decisions immediately, before their work; ordinary task instructions are excluded. | PRESENT |
| Record decisions | Record in the area and real home, with its number; never the backlog alone. | PRESENT |
| Record decisions | Checkpoint sweep, retirement checks and closing Rulings line. | PRESENT |
| Record decisions | Supersession updates documents, files the app work and updates affected lists. | PRESENT |
| Record decisions | Admit missed rulings; search all rulings, full rows, archive and backlog before reopening a settled question. | PRESENT |
| Shipping | Branch push and live merge remain distinct; notes-only authority has explicit inclusions and exclusions; diet steps retain their exception. | PRESENT |
| Shipping | Required local document-reading checks, exact-head results, no push during an active run and one merge at a time. | PRESENT |
| Shipping | Related-job batching, preview when ready, continued work while checks run and records before the closing report. | PRESENT |
| Shipping | Fix and reread findings; bounded auto-merge authority; main checks and production confirmation. | PRESENT |
| Shipping | Public/private test arrangements, shared-PC lock, heartbeat, release and coordination obligations. | PRESENT |
| Shipping | Skipped CI is not merge authority; stopped watching and disabled automatic fixing are disclosed. | PRESENT |

### #684 — DELIVERED

**Findings:** No changed operative OIL rule established.

**Checked and found sound:** earned leave remains distinct from pay, and the important boundaries between working copy, issued record, eligibility and discretionary awards remain.

| Ruling | OLD | NEW | Full row | Verdict |
|---|---|---|---|---|
| D1 | Count only qualifying work. | Same calculation boundary. | A displayed bar alone is not entitlement. | SAME |
| D2 | Holiday changes interact with issued days. | Both directions and publication handling retained. | Changing holiday status must not silently rewrite issued entitlement. | SAME |
| D19 | Explain a missing period and offer its creation appropriately. | Scheduler-facing remedy retained. | Name the missing period; offer the authorised way forward. | SAME |
| D24 | Exempt standby kinds can be switched on, default off. | Same, with later flying treatment. | The door exists; default eligibility is not widened. | SAME |
| D25 | OIL is earned leave. | Time off banked, never pay. | Terminology must not turn leave into money. | SAME |
| D26 | Retain the agreed target until a real complaint warrants change. | Same restriction. | No unsolicited redesign of the target. | SAME |
| D31 | Unmeasurable work earns nothing. | Same, with D49’s qualification. | Do not erase a measurable report/debrief span. | SAME |
| D42 | Overnight work belongs to its own day. | Same attribution. | Crossing midnight does not move the earning to another day. | SAME |
| D48 | Published entitlement is retained until republished. | Same. | Working changes do not silently alter the issued record. | SAME |
| D49 | Equal take-off and landing can still have measurable duty. | Report/debrief case and warning retained. | Zero airborne duration is not automatically zero duty. | SAME |
| D80 | Awarding OIL does not itself settle leave/manning treatment. | Unsettled part remains identified. | An award must not invent a leave flag or manning rule. | SAME |
| D142 | Use the latest published record. | Same, without making the clock decide publication. | Current time does not substitute for publication. | SAME |
| D261 | Own award may be made at any time. | Same scope. | No invented timing restriction. | SAME |
| D400 | Earned and awarded OIL are distinct. | Distinction retained. | One must not be presented as the other. | SAME |
| D592 | Actual/default reporting and previous-night rules define the span. | Conditions and identified readings retained. | Preserve reporting precedence, day boundary and publication treatment. | SAME |
| D804 | Leave and medical are excluded from the input OIL question. | Other applicable filings retain the question. | No blanket removal of the question. | SAME |
| D1579 | Future table work is deferred. | Still identified as future work. | A proposed database representation is not a current implementation claim. | SAME |

### #690 — DELIVERED

**Findings:** No changed operative guide rule established.

**Checked and found sound:** the rewrite does not authorise automatic deck rebuilding, hide unbuilt app changes or replace screenshots with an imagined workflow.

| Ruling | OLD | NEW | Full row | Verdict |
|---|---|---|---|---|
| D403 | Rebuild only when he says. | No automatic rebuild, schedule or refresh filing. | Owner controls refreshes, including already-filed work. | SAME |
| D410 | PowerPoint and PDF; journey map, real screenshots, test box. | Format, audience, screenshots and checks retained. | Explain use, not engine arithmetic; original sample was a first-build step. | SAME |
| D411 | Approved four-picture style and alternate-plan workflow. | Both retained. | Show how journeys connect, not isolated screens only. | SAME |
| D412 | Every way to perform an action, not just his examples. | Multiple ways and their tests retained. | Examples do not cap coverage. | SAME |
| D413 | Leave War workflow with later amendments. | Current ordering and member/admin paths stated. | Read with D1177 and D1208, not obsolete stages. | SAME |
| D414 | Tracker covered in full. | Tools, updates, restrictions, students, courses and transfer retained. | The listed examples are not exhaustive. | SAME |
| D415 | Show every place changed by one action. | Same spread across screens, checked in the app. | Do not substitute calculation internals. | SAME |
| D416 | Explain Board versus week editing. | Both modes and when to use each retained. | Day detail versus weekly overview remains. | SAME |
| D417 | Show setup and editing of manning rows. | Screen workflow retained. | Not the arithmetic behind the count. | SAME |
| D1177 | Referenced amendment removing Leave War stages. | Open dates, bidding and subsequent changes stated explicitly. | Closed dates do not create a new prohibition on Inputs changes. | SAME |

The newer D1724 direction is explicitly marked as separate, unbuilt work. It is not presented as what the existing deck or app already does.

### #700 — DELIVERED

**Findings:** No permission widening or lost deletion safeguard established.

**Checked and found sound:** the page keeps permissions separate from roster presence, preserves historical records and retains the last-admin protection.

| Ruling | OLD | NEW | Full row | Verdict |
|---|---|---|---|---|
| D149 | Restrictions on changing one’s own row. | Restrictions and later exceptions retained. | Read with D218, D1510 and D1651. | SAME |
| D200 | One permission gate and tests. | Same requirement. | Hiding a control alone is not enforcement. | SAME |
| D204 | Two joining routes; guest route off. | Same current arrangement. | No new guest authority. | SAME |
| D211 | Member medical access. | Scope retained. | Member access is not reduced to the guest view. | SAME |
| D213 | Guest medical view excludes documents. | Exclusion retained. | Guests do not receive another person’s attachments. | SAME |
| D215 | Guest draft/issued views are read-only. | Same. | Seeing a schedule does not authorise editing. | SAME |
| D226 | Fourteen-character limit rejects excess. | Reject, never silently truncate. | No different saved identity from what was entered. | SAME |
| D286 | Reusing a callsign accounts for archived people. | Restore/rename distinction retained. | Do not silently merge identities. | SAME |
| D290 | Delete keeps a hidden historical identity. | Never erase the underlying history. | Old records must remain attributable. | SAME |
| D297 | Past records stay; future presence goes. | Same boundary. | Deletion must not rewrite past flying. | SAME |
| D304 | Use the real effective date. | Same date basis. | Do not substitute an unrelated displayed date. | SAME |
| D306 | Last-admin protection holds the whole action. | Same all-or-nothing protection. | No partial posting or deletion before refusal. | SAME |
| D308 | Sign-in access and arrival date are separate. | Same distinction. | Access does not itself count someone present. | SAME |
| D320 | Separate service stints are preserved. | Same. | Returning must not erase the earlier stint. | SAME |
| D327 | Frozen crowd and named pending changes differ. | Distinction retained. | Do not retrospectively replace frozen membership. | SAME |
| D1102 | Deletion requires the second confirmation. | Date/control route keeps both steps. | Changing the confirmation’s appearance does not remove confirmation. | SAME |
| D1110 | Table-only zoom, up to the specified limit. | Scope and limit retained. | No page-wide zoom authority. | SAME |
| D1651 | Scheduler permission remains admin-controlled. | Same. | No own-row permission escalation. | SAME |
| D1709 | Ground personnel are not SANS. | Same exclusion. | Do not offer ground personnel the SANS role. | SAME |

### #708 — DELIVERED

**Findings:** No actionable change of design-rule meaning established.

**Checked and found sound:** numerical boundaries, named exceptions and owner-approved limits remain.

| Ruling | OLD | NEW | Full row | Verdict |
|---|---|---|---|---|
| D348 | Phone bar follows the ruled button order. | Order and schedule-only history retained. | Bell remains at the far right; Board is separate. | SAME |
| D587 | Failed-save band on full-screen working surfaces. | Same; short visits remain exempt. | Windows, sheets and phone menu do not each acquire a band. | SAME |
| D672 | Undo/Redo moves only when the change is out of view. | Same, including clear-of-bar visibility. | Cross-page navigation remains allowed. | SAME |
| D850 | Design feedback into the screen; notes only where needed. | Result feedback and note exceptions retained. | Failure, refusal, warnings and unseen results still need explanation. | SAME |
| D876 | One added-item mark; no competing flash. | Same, with named exceptions. | Suggested-time flash and Leave War colour exceptions remain. | SAME |
| D887 | No glow on marks; named branding exception. | Same current rule. | Later removal of the page wash does not remove the logo exception. | SAME |
| D895 | One drop, one landing line; view follows at an edge. | Both drag requirements retained. | No new drop behaviour is inferred. | SAME |
| D926 | Page controls share a row. | Rule and Legend-fold exception retained. | A fold is not treated as a button requiring relocation. | SAME |
| D1126 | Compact top-bar look through 1599 wide. | Boundary retained. | No widening of the threshold. | SAME |
| D1134 | One drawn pencil. | Same drawing and two typed-text exceptions. | Help text and edited chart-name marker remain exceptions. | SAME |
| D1518 | Pinned surfaces must not leak. | Same, with desktop week-arrow exception. | D1522’s explicit exception is retained. | SAME |
| D1523 | Resized but unmoved windows follow the save band. | Same. | A genuinely moved window retains its position. | SAME |
| D1567 | Phone page does not zoom; designated grids do. | Scope and desktop/larger-text qualifications retained. | No authority to suppress the user’s larger-text setting. | SAME |
| D1611 | Immediate claw on the two measured slow pages. | Same named scope. | Not a loader added to every page. | SAME |
| D1627 | Only the selected confirmation questions change. | Named set and D1628 additions retained. | Other confirmations remain as they were. | SAME |
| D1638 | Failed Retry does not reload or sign out. | Card and focus return retained. | A failed retry must not strand the user offline. | SAME |
| D1667 | “Blocked:” for a refused change. | Distinct from failed-save wording; document exception retained. | Do not relabel every refusal “Not saved”. | SAME |
| D1706 | Action menus use plain 38-high rows. | Height, green award action and choice-menu exception retained. | Templates and + Wave are not swept into this change. | SAME |
| D1772 | Retain each menu’s current Tab behaviour. | All three cases stated. | Shift+Tab to the opener may leave the menu open. | SAME |
| D1901 | Not-kept warning approved but not yet built. | Correctly recorded as future at this merge. | #706’s later implementation does not make this earlier status a rewrite defect. | SAME |

### #714 — DELIVERED

**Findings:** No lost Tracker safeguard or unjustified new authority established.

**Checked and found sound:** student history, course deletion, shared marks, access restrictions and deferred database work remain distinguished.

| Ruling | OLD | NEW | Full row | Verdict |
|---|---|---|---|---|
| D120 | Current export/import round trip. | Current requirement retained. | Old demo-data concerns are not a licence to lose newly written data. | SAME |
| D121 | Member access, subject to later restrictions. | Access and restricted exceptions retained. | D1014’s admin-only scope still applies. | SAME |
| D124 | Deleting removes the relevant marks; Undo before Save. | Scope and recovery window retained. | Do not promise recovery after the commitment boundary. | SAME |
| D126 | Chart details have their own treatment. | Separation retained. | No collapsing distinct details into unrelated records. | SAME |
| D131 | Backup handling excludes deleted courses. | Same. | Deleted courses must not silently return through backup. | SAME |
| D132 | Import preserves existing marks. | Same. | Importing a chart is not permission to reset progress. | SAME |
| D134 | Pinch and taking back the action remain supported. | Same behaviour retained. | Gesture work does not remove recovery. | SAME |
| D371 | Fail history is chronological. | Same ordering. | A display rewrite must not reorder attempts arbitrarily. | SAME |
| D374 | Future-date restrictions with named exceptions. | Active restrictions retained alongside later removal of obsolete fields. | Read with later field-removal rulings. | SAME |
| D376 | Tracker has its own place in the app. | Same current integration. | Retired standalone support is not reintroduced. | SAME |
| D464 | Charts must not be lost; tell the owner of a threat. | Both duties retained. | Silent loss is not acceptable migration behaviour. | SAME |
| D474 | Chart structure shared; marks per enrolment. | Same separation. | One enrolment’s update must not change another’s marks. | SAME |
| D979 | Correction is not another attempt. | Attempt history and correction distinction retained. | Editing an error must not invent an extra try. | SAME |
| D981 | Course-deletion condition depends on its marks. | Same condition. | Do not replace it with a weaker appearance-based test. | SAME |
| D983 | Two named matters wait for the database. | Deferrals remain explicit. | The page does not claim them built. | SAME |
| D986 | A touch stopping motion does not open an event. | Same. | Stopping a glide must not also mark. | SAME |
| D989 | The five agreed glide behaviours. | Conditions retained. | Movement, stopping and opening remain separate. | SAME |
| D1004 | Down status does not confer currency. | Same. | No new currency rule. | SAME |
| D1005 | Roster/non-current and syllabus distinctions. | Retained with D1931’s later student-entry direction. | Later approved change is identified, not silently inferred. | SAME |
| D1014 | Flexible editing is admin-only. | Same. | No member permission widening. | SAME |
| D1018 | Defined fields, “from” information and member read access. | Required information and limits retained. | No field or access condition dropped in the sample. | SAME |

D1931 legitimately replaces D191’s typed-new-student behaviour. The page identifies the new work as unbuilt; it does not claim the current app already enforces it.

## Absent D-number audit

**No operative rule was found to have disappeared.** However, the brief’s literal “absent from this page must be archived” test is not satisfied by every number: some remain live in other loaded rule files.

That distinction matters. D1735 expressly permits a live ruling to be stated in **a file that loads**. Archiving a still-live ruling merely because its duplicate citation left one page would itself be wrong. The retained locations and genuine retirements are separated below.

| PR | Archived numbers absent from NEW | Still-live numbers absent from NEW, with their retained home |
|---|---|---|
| #663 | D86, D88, D291, D341, D354, D391, D467, D476, D496, D567, D602, D609, D614, D775, D810, D832, D873, D972, D973, D974, D1414, D1556, D1566, D1593, D1594, D1659, D1736 | Bug check: D9, D56, D1297. Recording: D13. Document structure/recording: D29, D78, D975. Shipping: D60, D143, D151, D228, D302, D902, D1086, D1087, D1089, D1090, D1091, D1097, D1407, D1640, D1742. Plain language: D904, D921. Relevant area/design files: D836, D1101. |
| #684 | D18, D20, D34, D738, D744, D750 | D390 and D971 remain in the general/document-recording rules. |
| #690 | None | D137, D141 and D390 remain in the general and document rules. |
| #700 | None | D390 remains in the general/document rules; D1107 remains in Scheduler. |
| #708 | D911, D1612, D1616 | D390 remains in the general/document rules; D1320 remains in Leave War. |
| #714 | D191, D563, D565, D896, D1366, D1660 | D390 remains in the general/document rules; D59 remains in the general/shipping rules. |

Replacement chains checked include:

- General: D88→D89, D341→D343, D354→D473, D567→D568, D873→D874, D1593→D1594→D1734.
- OIL: D18→D755; D20’s surviving requirements carried by D24/D35; D738 and D744→D755/D762.
- Design: D911→D926, D1612→D1614, D1616→D1618.
- Tracker: D565→D566 and D191→D1931.

The remaining archived entries are marked as spent one-off permissions or completed tasks. I found no sampled case where a ruling was retired merely because a later ruling narrowed one part of it.

## Did the day’s work damage the project?

**No demonstrated damage was found in these 23 pull requests.** The evidence does not support saying that the day’s work generally broke the app or corrupted the rules.

That answer has limits: this was a blind source review with one small fresh test run, not a fresh end-to-end or physical-phone verification. The accepted one-frame limitation remains, and the conditional browser-test skip weakens what that particular test can prove. Neither establishes a newly introduced app failure.

**Rulings: none this session.**  
**Files changed by Astra: none.**

