# Inputs/SANS independent final code inspection R2

5 October 2026. **CHANGES REQUIRED — one P2 finding (F1).** Final inspection 2 of 2, on the unchanged Freeze10 snapshot. This is the same inspection resumed after a usage interruption; the required whole-file reads were completed before closing. No third Astra inspection is requested or implied. Sol authored the implementation; this independent review does not adopt R1's conclusion or approve the author's own work.

Rulings: none.

## Identity and authority

- Branch: `codex/inputs-sans-calendar`; unpublished baseline: `9bd14458b905e31a7d960a0529a960f3b6a13c0b`.
- Immutable brief: `docs/superpowers/briefs/2026-10-05-inputs-sans-astra-final-r2.md`, SHA256 `6314A534AE440B0B7743D5E2864B4D250886D356944B36268D1D13C40DE62029`.
- Freeze10 manifest SHA256: `1ceb5d4789149b9cd00ade74521bb82e8ad0b1143e9009e0fbcb636bbd91e75a`. Independently matched all 858 files and all 18 production HTTP assets against bytes and hashes, with no mismatch. App, tests and bundle did not change between Freeze9 and Freeze10; the latter corrected the focused C04 driver evidence.
- Production inspected: `http://localhost:4192`. Main bundle `index-DJQMLASa.js`, 646236 bytes, SHA256 `85bf08f50a671e2782a08d226bfe5d3188db1478ac5d0bffbbe61cd12a59f70e`.
- Private evidence root: `C:/Users/User/.codex/visualizations/2026/10/04/01a106e0-f018-7e91-be46-ca442dde08b3/inputs-sans`. Relative image/log/diagnostic names below resolve there.
- Freeze9 ledger SHA256: `fed513760cdc929ec8e3e46419dd50687374476dbdd7caf72f55d0ae95a3e5b5`. Freeze10 focused ledger SHA256: `8b41cebb3b94962732541da16a2ee953718c6460cc8aa13536e6cb4d9e15b5ea`. All 42 listed image hashes matched.

Read AGENTS, HANDOFF's current work, all six ordered standing rule files, project guide, applicable Scheduler/People/OIL/Leave War rulings and relevant full rows, executor, review workflow, bug-check order, current backlog, and the read-only craft guide. D569–D580 were read as full decisions; D580 authorizes the recommendations-based build while the owner sleeps and supersedes the earlier build hold. It does not waive independent review or authorize main. The standing full popup rule below supplies F1; no new owner decision is invented.

## F1 — P2: Colour settings does not dismiss outside and Escape leaves the calendar

**Location:** `src/ui/SansCalendarControls.tsx:38–55`, specifically the toggle at 45 and conditional popup at 46; related calendar Escape handler `src/ui/InputsCal.tsx:278–285`.

**Requirement and applicability:** `docs/guide-full.md:585–592`, “A click-open popup closes on a click outside it” (owner, 4 September 2026): “Any transient panel/menu/palette a tap OPENS must dismiss on an outside pointer-down”. The full paragraph prescribes a capturing document `pointerdown` listener for a small inline popup, treating popup and toggle presses as inside; Sheet provides scrim and Escape handling. This is a standing rule predating numbered decisions, not an invented D number. Colour settings is exactly such a tap-open transient, absolutely positioned settings form. It is not the persistent ALL/AVAIL or Changes window covered by their distinct rules. The backlog's MODAL-DRAG-CLOSE entry also distinguishes a pointer that starts inside from a genuine outside press. D548's earlier instruction to leave other popups alone does not exempt this newly introduced control.

**Concrete observed interaction:** In a fresh desktop browser context on the frozen production server, sign in as admin, enter Inputs SANS calendar, open Colour settings, change amber to 2 without saving, then click the visible Inputs heading outside the form. The form stays open. Press Escape: the form disappears because the entire calendar closes to List, rather than the popup owning the dismissal. There were zero collected application errors. The actual outside-click screenshot was personally opened at readable detail. This is an interaction failure, not an inference from appearance.

Private probe `r2-popup-probe.cjs` SHA256 `B16899A75F02838B5C4B315A28BBAF2BA0F4E987A4B83E38B903D27FC2235C36`; result `r2-popup-result.json` SHA256 `49C73565243AFD0131D5BB14A7396C3C7BD8893C5C59D607906A1BF48E57F339`; screenshot `r2-popup-after-outside.png` SHA256 `31A85D2A09E7B78332C8637274018A4FAFB15180365237FE5D44133422353C7F`. Result: `afterOutside: true`, `afterEscape: { popup: false, list: "true" }`, `errors: []`. The probe did not save the draft or edit production files.

**Cause:** The component's local open state closes only through toggle, Save or Cancel. It has no outside-pointer listener or containment ref and does not participate in calendar Escape ownership. The calendar's capture handler knows other foreground editors/pickers but not this popup.

**Required fix:** Add containment-aware outside-pointer dismissal while open, including the toggle in the inside boundary, and coordinate Escape so its first press closes only this popup while retaining Calendar. Dismissal must not save the draft. Avoid listener-order races with the calendar capture handler. Verify inside typing/select interaction, toggle and Cancel, genuine outside pointer-down, Escape staying in Calendar, and opening another day without the stale popup. Cover admin/member exposure and phone/short-screen reachability as appropriate. This is one missing interaction contract with a related Escape consequence, not two artificially separate findings.

No other concrete new-data defect was found in the completed read. The passing suites did not cover this dismissal path and cannot override the observed failure.

## Whole-file and relevant-body coverage

All changed production bodies were read whole: `src/state/sans-calendar.ts`, `people-settings-commit.ts`, `perms.ts`, `undo-wire.ts`, `view.ts`; `src/ui/SansCalendarControls.tsx`, `sans-calendar-model.ts`, `InputsPage.tsx`, `InputsCal.tsx`, `inputedit.tsx`, `scheduler/06-inputs.css`, `scheduler/07-inputs-calendar.css`; and `src/undo/describe.ts`.

All changed tests and registered drivers were read whole: `src/state/sans-calendar.test.ts`, `plan.test.ts` (276 lines), `view-reset.test.ts` (126), `undo-wire.test.ts` (453); `src/ui/sans-calendar-model.test.ts`, `inputs-calendar-flow.test.tsx`, `inputsfmt.test.tsx` (119), `inputs.test.tsx` (1410), `inputscal.test.tsx` (1007); `e2e/inputs-sans-calendar.spec.ts`, `e2e/geometry.spec.ts` (5448), `e2e/step4-leavewar.spec.ts` (750); `playwright.config.ts`, `probes/adapted/audit-async.cjs`, `scripts/handpass/inputs-sans-calendar.cjs`, `scripts/handpass/inputs-sans-supplementary.mjs` (364). Long files were read in consecutive chunks; truncated portions were reopened rather than counted as read. Current documentation delta and the complete Inputs/SANS evidence sheet were read.

Relevant unchanged bodies were also inspected: the whole `src/ui/caldrag.ts`; input write/batch and session/role reset paths in `src/state/store.ts`; restore/snapshot application in `src/undo/timeline.ts`; date coverage, authored-date availability and SANS window/badge bodies in `src/engine/inputs.ts`; transaction reducer/queue/rollback bodies in `src/command/commit.ts`; holder/base reconciliation in `src/state/holderbase.ts`; and request, standing-input, reconcile, landing and view bodies in `src/engine/overlay.ts`. Medical segmentation and all save callbacks were included in the whole input editor read. No engine body was changed by this inspection.

## Object, writer and missing-door roll-call

| Object or boundary | Doors traced and result |
| --- | --- |
| SANS daily target and colour cutoffs | Live settings reads, admin writes, validation, reset, transaction queue and undo were traced. Unset differs from explicit zero; strict integer/date validation and ordered cutoffs are present. Member has no settings write door. Popup dismissal is F1. |
| Commitment count | Unique person IDs with an authored-date F commitment; O-only/A-only excluded. Duplicate offers count once. Search/member filters affect visible rows, not aggregate count. Overnight offers retain their authored date semantics. No operational time-window gate was incorrectly added. |
| New commitments | Calendar editor and List add independently save actual rows, then reveal the saved result. List inline editing has its own draft. Mode-qualified reveal prevents unrelated List/SANS pinning. |
| Retype, clashes and medical split | Calendar editor, List inline path and confirmed medical path were traced. Actual retained first segment is used on save rather than an unsaved draft or removed middle. Existing identity and split clones remain distinguishable. |
| Undo/Redo | Directional restore intent, actual affected row after restore, and clearing of stale reveal were inspected. Redo must reveal an actual restored segment; no invented requirement forces the first segment for every Redo. Addition Undo removes stale reveal. |
| Roles and reset | Permission is checked at writer/commit boundaries; captured actor, queued results, logout/session reset, role switch and member context were traced. Member own editing and other-person readonly rendering were observed. |
| Touch and range | Long hold, synthetic click suppression, next genuine pointer, chip move, cross-month selection and permission recheck at commit were traced. Two separate hold sequences have before/release/next-tap pictures. |
| Planning versus issued | Live planning rederives from stored holder/base and current settings/inputs. Issued output is preserved; publication and restore are separate boundaries. |
| Deliberate omissions | No new route, operational slot validation, caps/ops implementation, Tracker work, backend synchronization protocol or data migration is introduced. These are not missing required Inputs/SANS doors. D56 does not require migration for this additive/defaulted settings work. |

The least-shared newly authored door was the small Colour settings form; that is where the independent probe found the missing contract. Persistent windows were not indiscriminately treated as dismissible popups.

## Ranked concrete new-data action orders

These are falsifiable action orders checked against source and retained runtime evidence; only order 1 required this review's new small browser probe. They are not a claim that this reviewer reran all suites.

| Rank | Setup and actions | Required outcome and observed disposition |
| --- | --- | --- |
| 1 | Open Colour settings, type amber 2, press outside; then Escape. | Outside closes without saving; Escape closes only the top popup. **FAIL, F1**, directly reproduced. |
| 2 | Under a hiding filter, create a medical span July 20–24 with middle July 22–23 retained elsewhere; save, Undo, Redo. Repeat by retyping an existing row. | Save reveals actual July 20–21 first retained segment. Exact preimage and two-segment restoration survive Undo/Redo. Freeze10's two medical cases pass; Redo may reveal a different actual restored segment. |
| 3 | Create an Upchit through List under a nonmatching filter, then restore it across Undo/Redo. | Actual new row is revealed without pinning a stale draft. Retained reveal case and directional source handling pass. |
| 4 | Retype a saved commitment across modes while a hiding filter is active, on desktop and phone. | Correct actual row/date/mode is shown. Both cross-mode pictures show Zenith Fly July 23; no wrong-mode pin found. |
| 5 | Save a current SANS commitment, deliberately change person and search to hide it. | Aggregate remains correct; zero visible rows and no stale current-saved banner. Corrected C04 uses a real save and passes with aggregate 3/4. |
| 6 | Change live planning inputs/settings, inspect issued output, Undo while in member Calendar context. | Planning changes, issued output stays frozen, context remains coherent. Retained signatures/assertions and pictures pass. |
| 7 | Queue a write, change actor/session context; open own and other-person editors immediately and after settling. | No permission escalation or previous-row flash; populated readonly state is retained. Source checks and immediate/settled pictures pass. |
| 8 | Hold July 22, release, then genuinely tap July 23; repeat separately. Move a chip and select July 30–August 2. | Release does not extend the range; next real tap does. Both focused hold sequences and retained move/range cases pass. |
| 9 | Mix duplicate F offers, O-only/A-only, 10–11 and 22–02 offers; filter the display; use unset and zero targets. | Unique authored-date F count, filter-independent aggregate, exact times and unset/zero distinction remain correct. Model/state tests and desktop/phone evidence pass. |
| 10 | Exercise List add/inline medical clash, planning restore, then logout/re-enter with hiding context. | First retained actual row revealed; independent drafts and session reset clear stale pins. Corrected context case passes; original bad setup remains archived. |

## Personally opened originals: complete 42-image inventory

Walk: all 39 originals named by `freeze9-final-runtime-ledger.json` and all 3 named by `freeze10-focused-final-ledger.json` were personally opened individually at readable detail. Logs were not counted as pictures. The separate F1 diagnostic is a 43rd image, not a substitute for any original. The following observations distinguish visible facts from deeper assertions supplied by the logs.

| # | Private relative original | Observation |
| --- | --- | --- |
| 1 | freeze9-reveal/cross-mode-desktop.png | Actual Zenith Fly July 23 shown despite hiding filter/banner context. |
| 2 | freeze9-reveal/cross-mode-phone.png | Same restored row on phone; transient toast lower on screen. |
| 3 | freeze9-reveal/list-inline-pinned.png | Member Personal restored under NO_MEMBER_MATCH; separate add draft visible. |
| 4 | freeze9-reveal/calendar-first-retained-segment.png | Actual first OML July 22–24 segment in Calendar. |
| 5 | freeze9-reveal/list-first-retained-segment.png | Actual first retained segment in List. |
| 6 | freeze9-reveal/list-new-clash-pinned.png | New OML July 22–24 result shown. |
| 7 | freeze9-reveal/list-new-upchit-pinned.png | Actual new Upchit July 22 shown. |
| 8 | freeze9-reveal/planning-undo-member-context.png | Member Calendar context and July 22 title preserved. |
| 9 | freeze9-reveal/FAIL-context-and-session-reset.png | Preserved failed setup: remount cleared search; row visible without feedback. Not a passing image. |
| 10 | freeze9-context-r4/context-and-session-reset.png | Corrected hiding filter: aggregate 1, zero listed rows, no banner. |
| 11 | freeze9-main/desktop-offers.png | 3/6, four displayed offers, exact 10–11 and 22–02 times; O/A-only rows distinguishable. |
| 12 | freeze9-main/phone-calendar.png | Phone month layout and lower transient toast visible. |
| 13 | freeze9-main/short-phone-day.png | Short-screen day form with scroll and reachable Close/Save. |
| 14 | freeze9-main/short-phone-editor.png | Short-screen editor footer/Add and blank Remarks. |
| 15 | freeze9-main/member-readonly.png | Other member Bolt populated, readonly, Close only. |
| 16 | freeze9-supplement/member-own-editor.png | Ranger own 10–11 F+O input with Save/Delete. |
| 17 | freeze9-supplement/touch-range-editor.png | July 30–August 2 range populated. |
| 18 | freeze9-supplement/short-phone-hold-editor.png | Actual date July 22; focus outline on 30 is not the selected date. |
| 19 | freeze9-supplement/touch-chip-moved.png | Moved chip on July 21. |
| 20 | freeze9-supplement/issued-frozen.png | Issued schedule pixels; freeze equality comes from retained signature assertions. |
| 21 | freeze9-supplement/medical-document.png | Certificate document view/edit door visible. |
| 22 | freeze9-supplement/planning-filtered-calendar.png | Filtered LL planning view, July 22 title/puck. |
| 23 | freeze9-focused/hold-a-before-release.png | Hold A opens July 22. |
| 24 | freeze9-focused/hold-a-after-release.png | Release retains July 22. |
| 25 | freeze9-focused/hold-a-next-genuine-tap.png | Genuine tap extends to July 22–23. |
| 26 | freeze9-focused/hold-b-before-release.png | Independent hold B opens July 22. |
| 27 | freeze9-focused/hold-b-after-release.png | Release retains July 22 again. |
| 28 | freeze9-focused/hold-b-next-genuine-tap.png | Next genuine tap extends July 22–23 again. |
| 29 | freeze9-focused/own-reopen-immediate.png | Own editor populated immediately. |
| 30 | freeze9-focused/own-reopen-settled.png | Same populated own state after settling. |
| 31 | freeze9-focused/readonly-other-immediate.png | Bolt readonly state populated immediately. |
| 32 | freeze9-focused/readonly-other-settled.png | Same readonly state after settling. |
| 33 | freeze9-showcase/desktop-sans-day.png | 2/5, red cutoff 3, sun/moon target controls distinguish unset and zero. |
| 34 | freeze9-showcase/phone-sans-calendar.png | Header fits phone; vertical scroll remains available. |
| 35 | freeze9-showcase/phone-sans-day.png | 2/5 and two exact-time rows; temporary admin toast crosses lower Save area. |
| 36 | freeze9-showcase/phone-commitment-editor.png | October 9 custom 6–18, blank Remarks; footer below this screenshot, separately covered by short-screen evidence. |
| 37 | freeze9-showcase/phone-member-day.png | October 9 member meeting 9–11. |
| 38 | freeze9-showcase/phone-member-list.png | Existing member List add form retained. |
| 39 | freeze9-showcase/phone-member-list-cards.png | Actual meeting date/time/remark cards and edit/delete doors. |
| 40 | freeze10-current-banner/c04-filtered-current-banner.png | Jester plus nonmatching search, aggregate 3/4, zero offers and no stale banner. |
| 41 | freeze10-medical-split/medical-middle-new-saved-first.png | New OML first retained July 20–21 displayed on July 20. Later/middle segments and restore equality are log assertions. |
| 42 | freeze10-medical-split/medical-middle-existing-saved-first.png | Existing retyped OML first July 20–21 segment shown, 6–18 preserved. Later clone equality is a log assertion. |

## Gates, retained failures and limits

FULL tier applies. Final gate logs were inspected; this reviewer did not rerun the broad suites or claim authorship of their execution.

| Gate | Evidence and result |
| --- | --- |
| Unit | `r1-final-unit.log`: 7810 tests / 494 files PASS, 709.76 seconds, 3 workers. Known jsdom navigation/scrollTo and Vite warnings do not represent failed tests. |
| Browser | `r1-final-browser.log`: 570 PASS, 49 existing skips, 8.4 minutes. Skips are not passes. |
| Adapted probes | `r1-final-adapted.log`: six PASS, assertion counts 17/54/9/25/15/36, total 156. |
| Performance | `r1-final-perf.log`: 4 PASS / 0 FAIL; week 5131/5450, board 1018/1150, scroll 400→400. |
| Build / rulecheck | Final host/evidence-sheet PASS; rulecheck 506 test files and 211 rulings. Not re-executed by this reviewer. |
| Runtime | 50 effective groups PASS plus 7 showcase cases; all 42 original pictures personally inspected. Main/supplement/focused collectors report no application errors; showcase's error collection is narrower (page errors). |
| Snapshot | Independent 858-file / 18-HTTP-asset match, 42 image hashes, no mismatch. Source/test/bundle unchanged after final gates. |
| Reference / Tracker | 728/0 reference and 445/0 Tracker are retained historical applicable evidence, not new R2 reruns. |
| Document / whitespace | Host's pre-report document gate passed 113 items, D1–D580 homes; 7128 excess lines remain deferred under D29. This report's closing document check is run after writing and its result accompanies the report handoff. Windows-aware whitespace gate passed before this report; closing check also accompanies handoff. |
| Shared lock | Last inspected state FREE. No broad suite was run by this inspection. |

Original failures remain evidence: Freeze8 real restore failures, Freeze9 context setup failure, and C04's outdated pin-policy fixture were retained rather than replaced. Corrected cases exercise the intended final contract, including an actual current save before C04's deliberate filter change. The hold screenshot contradiction was resolved using two before-release/after-release/next-genuine-tap sequences, not by interpreting the earlier focus outline as a date. None of these histories erase F1.

Limits: Chromium desktop and emulated phone evidence does not establish physical-device Safari behavior, cross-device backend synchronization, or absence of all defects. Pixel inspection establishes visible states; snapshot equality and later split rows depend on explicitly identified assertions. No required whole-file read or original-picture inspection remains incomplete. No additional source finding is claimed from untested platform behavior.

## Disposition and owed read

**CHANGES REQUIRED.** Fix F1 and validate the touched interaction paths. Passing aggregate suites and the completed independent read do not grant approval while the concrete popup contract fails. Preserve this report and its reviewed snapshot identity; subsequent changes are outside this report's disposition.

**OWED: Claude's read after the reset**, after Monday 5 October 2026 19:00, for `codex/inputs-sans-calendar`, including any F1 repair, before main. No main push, merge, merging PR, owner picture approval or private-picture publication is authorized by this report. There is no third Astra inspection to manufacture approval.
