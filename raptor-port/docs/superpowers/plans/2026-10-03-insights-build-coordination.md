# Insights build coordination — 3 Oct 26

This is execution coordination evidence, not a new technical-plan review round or final-code approval.
The response below is retained verbatim. Its original observations describe the state at the time of that read.
The follow-up disposition is appended separately.

## Complete independent coordination response (verbatim)

D532’s short rule, full ruling, current UI contract and final-look record agree: the owner approved the complete gallery, fulfilling D515 before implementation. The revised plan remains binding; FULL checks, all 33 scenarios, a fresh Astra code inspection and Claude’s later code/scenario read remain owed.

Three prose corrections remain in the inspected state:

- Spec lines 72–73 retain the broken sentence “This access/wording is pending his final picture agreement was given under D532.”
- The backlog item’s opening still says “final look/build pending”, immediately before the new approval paragraph.
- Your own HANDOFF block still awaits approval. Update only that block; the older foreign block’s historical wording must remain preserved.

The revised plan still hashes to `A51541CA5557914E37989A6F445BD828D1FDDE2ADBFD0930E557234DE4B99DBD`. Against `7ea067e1`, the plans-directory diff contains only the final-look record; previous plans/reviews remain unchanged. Application source and e2e were unchanged when checked.

The following maps the existing S01–S33 without changing their requirements. These are readiness instructions, **not execution results**.

| ID | Production route and practical evidence |
|---|---|
| S01 | Pure resolver vectors, then actual Mission editing through week `routeFocusOut` and Board `boardChange`. Exact aliases produce automatic Red without Choose/Change; additional Mission text follows conditional resolution. |
| S02 | Use every pinned Mission/Remarks lexical example in the resolver tests. Operate both actual editors for representative cue and near-miss cases; do not infer side from FOR/FROM. |
| S03 | Drive `computeInsights` and the shared `InsightsModal` with a person having four occupied seats: two Blue and two Red. Remove one applicable answer: the whole row must become ordinary total four. |
| S04 | Use the existing issued-world counting path with empty aircraft, both seats, duplicate person, aircraft/formation cancellation and standalone waves. Assert existing sortie/form totals and full hours output, including SC main, alongside role counts. |
| S05 | After answering, use actual seat assignment, time, AREA, stores, flag, reorder and cancellation controls. Compare annotation/history before and after; uncancelling must reuse the same answer. |
| S06 | Perform the `DS FOR VL // BRIEF 30 PRIOR` edit through week contenteditable **and** Board textarea, then the semicolon example. Assert saved text changes while role identity and answer remain unchanged. |
| S07 | Golden-vector tests cover exact context strings for unit/direction changes, `/`, comma, newline, clause order and undelimited time. Include real editor examples to catch differences between `textContent` and textarea `.value`. |
| S08 | Answer BFM’s conditional Remarks; change Mission to ACM through each Mission editor. Repeat Remarks-first creation. Observe one committed context transition and one question, not a question from focus alone. |
| S09 | Edit unanswered A to unanswered B using an actual Remarks control. Observe one question for B. Then edit its separate timing clause and observe no new question. |
| S10 | Board’s `data-lac`, `data-ldel`, `data-gline`, formation/wave creation and day-template application supply structural routes. Include a formation with distinct cues on different aircraft; only a qualifying single-target transition asks. |
| S11 | Start with six unresolved formations; operate actual Logic toggle, Tab, Shift-Tab, Later, Escape, reload and Undo. No question burst. Focused Remarks exposes temporary Choose; its explicit click opens the question. |
| S12 | Save text, choose Later, navigate/reload, return through actual Remarks focus and Choose. Answer, then Change→Later. Verify durable text, retained prior answer and disappearance of temporary controls. |
| S13 | Publish through actual sign/publish controls, then answer/correct through latest-published Remarks. Compare command closure and persisted rows: one annotation plus intended history, with day/signatures/issue/pending/holder-base/OIL unchanged. |
| S14 | Use published `DS FOR VL` and pending working `DS FROM RU`, with the same formation identity. Operate both real doors. Published Red controls current Insights; working Blue and its Undo cannot alter published context or existing pending/signature bytes. |
| S15 | Continue S14 through normal AL publication and permitted publication Undo/unpublish. Assert which issued/working source `issuedWorld` actually selects at each step; neither context record is rewritten by publication. |
| S16 | Use real text commit, answer command and global Undo/Redo controls in the specified order. Check distinct history words, separate steps, no restore question and no publication barrier caused by role Undo. |
| S17 | Inspect `changelines`/edit-log output for answer, no-op, correction, refusal, copy and reversal. Assert actor/date/count, and absence of a role key from canonical AL content. A visible history line alone does not prove a correct commit closure. |
| S18 | Use `planMenu`’s duplicate/select routes (`draftDup`, `draftSelect`) and `loadVersionToWorkingCopy`. These preserve identity. Corrections must remain shared for equal contexts; different contexts coexist; frozen issue bytes remain unchanged. |
| S19 | Actual route: save a day template, reload the library, apply through the template picker to another unpublished day. `tplFromDay`/`applyDayTpl` strip row IDs, so this is the concrete fresh-identity transport case. Check independent seed, correction, published refusal and atomic Undo. |
| S20 | Use the actual fresh-identity template route for seed validation, key collision and forced second-store failure. Existing row moves are same-day/container reorder; saved-plan duplicate preserves IDs. No general scheduler copy/import door was found. Record unavailable variants explicitly rather than inventing UI evidence; test any newly discovered real writer. |
| S21 | Extend the real `wireRows`/whiteboard/backend/boot pipeline tests. Persist both contexts, fail/retry a group, reload, and hydrate an empty store. Exercise the existing schema-wipe fixture and pending journal together; annotation keys must not survive a wipe that already removes their schedule. |
| S22 | Capture the actual active element and selection before each editor’s commit gesture. Assert strict node identity and exact range after temporary insertion, then type into that node. An ordinary subsequent redraw must contain exactly one question. |
| S23 | Operate Choose/Change using pointer and keyboard while text is selected. The blur→click sequence is essential: the temporary action must survive long enough to receive its click without replacing the Remarks node or leaving a ghost. |
| S24 | Run the specified phone, short-phone, desktop, short-laptop and keyboard-height views. Measure hit targets/overlap and scroll reachability, then open every proof image. Desktop emulation does not establish physical-device keyboard behaviour. |
| S25 | Retain an old callback/offer, then perform each destructive/context/navigation transition. Invoke the stale event and assert no write, no retargeting by position and no recreated DOM. Version advance and Off/logout need their own invalidation paths. |
| S26 | Combine expected-revision conflict tests with the actual command guard. Exercise member/guest/pending/Off direct attempts and a forged otherwise-allowed command that changes the role store. Check zero durable writes/history on refusal and relevant actor conflict text. |
| S27 | Use actual Logic On→Undo→Redo, reload and Reset to standard. Check stored feature setting, Undo words and Logic landing, while warning-rule count/stamp/reset and schedule rows remain unchanged. Off edits followed by On must not prompt. |
| S28 | Answer on W, navigate to another week/day, then actual global Undo/Redo. Check `undo/derive` week/day extraction, registered store and `undo-wire` landing. Compare all unrelated row writes; test same-key conflict separately from another context’s edit. |
| S29 | Render 0/12/13/many flyers, long and missing person labels through the shared modal. `computeInsights` and `insightsHTML` both need fallback protection. Exercise Show all, close/reopen/week change and member/guest viewing; keep the hours list complete. |
| S30 | Operate Shell’s existing Insights button, Drawer, new Board desktop entry and phone overflow entry, including from an older preview. Compare identical latest-issued figures and use `elementFromPoint`; close and verify original Board/day/scroll. |
| S31 | Use a long everything-day fixture and repeated actual focus/type/role/toggle/unrelated edit/drag/wheel/week operations. Count transient DOM and listener/scanning activity; compare to existing performance ceilings. A single clean screenshot cannot establish this row. |
| S32 | Open the genuine `DPREV`/`pv-frozen` latest-published view through the version selector. Focus/select read-only Remarks; attempt text mutation and role answer. Advance the issue while the offer is open, then reject the stale answer. Historical previews expose no action. |
| S33 | Feed malformed IDs, records, side/context versions and normalization cases through the real loader/resolver. Read operations must neither repair nor delete stored records. Old missing and newly unanswered conditional data must both remain unresolved. |

The most important wiring/evidence risks identified from current source are:

- **Two separate text writers:** week contenteditable uses `routeFocusOut`/`txtCommit`; Board textarea uses `boardChange`, with a separate Enter/Escape bridge. One adapter’s success does not establish the other.
- **Published access is deliberately frozen:** Board normally exits editing handlers when `DPREV` is active. The approved role door needs its own read-only focus/action path; removing that existing text guard would violate S14/S32.
- **Atomic template transport must cross two stores:** the existing template path only carries day content and strips IDs. A role seed’s successful lookup is insufficient unless day creation and annotations commit/rollback together.
- **Undo needs identity-aware navigation:** existing `weekOf`, `dayKeyOf`, registered stores, labels and landing recognise existing collections. A new role command can appear undoable while still landing incorrectly or invoking scheduler restore side effects.
- **Storage cannot be proved by an in-memory map:** physical settings rows, the role store, boot hydration, empty rehydration, existing schema wipe and journal filtering all need connected evidence. Current reset keeps settings wholesale.
- **Guard registration is broader than a command permission:** the forged-command case must demonstrate that an unrelated allowed command cannot alter role records.
- **Show-all and role controls are transient:** existing popup reset/navigation paths must clear them; same-opening updates must preserve expansion without restoring stale offers.
- **Design evidence remains separate:** the 18 approved pictures establish the agreed look. They execute none of S01–S33.

All 33 scenarios are ready for builder execution with the route qualification in S20. No new product decision or plan round is needed. I made no edits and ran no application tests.

Rulings: D532 independently checked; no new ruling.

## Follow-up disposition — independent reread, 3 Oct 26

Sol corrected both stale prose findings after the response above. The spec now says:
“This access/wording received final picture agreement under D532; no new permanent marker/dropdown.”
The backlog opening now says:
“Direction/lifecycle settled through D532; Opus REVISE addressed, revised technical plan independently PASS; final look approved, build/check underway”.
Both corrections are independently verified in the working tree. They accurately record visual approval and implementation
authorization without implying implementation completion or code approval. The short/full D532 ruling and current UI
contract retain the unchanged revised plan, FULL checks, all33, fresh Astra inspection and Claude's later code/scenario
read before main.

Sol's own HANDOFF block still contains the earlier pending-approval status at this reread and is to be refreshed next
by Sol. The foreign historical block remains untouched; its old “D532 is next” wording is historical evidence, not a
current unanswered product question.

This follow-up creates only this new coordination record. It does not revise the original response, settled plan or
previous review records, and it does not execute or approve any S01–S33 test result.

