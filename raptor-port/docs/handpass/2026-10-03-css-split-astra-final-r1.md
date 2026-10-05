# CSS split — fresh independent Astra final inspection R1

Status: **PASS for the mechanical stylesheet split on the bound snapshot below**, with the evidence qualifications in this report. No source defect requiring a correction was found. This is initial final inspection 1, not approval of Astra's plan, the earlier feature builds, physical-iPhone behavior, or a merge into main. Sol authored the implementation; this fresh inspector did not plan, coordinate or build it. Sol's independent plan challenge is retained separately.

## Authority and snapshot

Read the session instructions, handoff, mandatory general rules, project guide, scheduler and people/accounts rulings, executor, temporary Codex review workflow, bug-check order, relevant full decisions and performance guardrails. D493/D539–D541 authorize an unchanged-look split; D496 assigns this fresh independent read. D499 permits proportionate shared functional evidence without dropping gates or distinct routes. Later visual work still requires the owner's answers and approved pictures.

| Bound item | Independently checked value |
| --- | --- |
| Workspace / branch | `C:/Users/User/projects/Raptor`, `codex/workflow-ui` |
| Integrated pre-split base | `0804877ca099c844b77bfd8692cd2d055e5534c7` |
| Plan | `docs/superpowers/plans/2026-10-03-css-split-plan.md` |
| Plan SHA256 | `c5ac898b456d4db6be51ca80e2e18404dc60e76cd4a0b9d43ea4cfc39524fb79` |
| Freeze manifest | `docs/handpass/css-split/source-freeze.json`, **834 entries**, every byte count and SHA256 checked against disk; **zero mismatches** |
| Freeze SHA256 | `a5841180ff6c4d3e45cea4ff30cb3e028f27257d1886e868354c1765532d1ee5` |
| Immutable inspection brief SHA256 | `20e951b2b8bfa866f39818df82719181eba3d7658dd5307d74d6552112f90381` |
| Original stylesheet | **506,840 bytes**, SHA256 `0c16a9f046abaedb4f06e7876e2811a78e4695cf930fee884e3432d3c0f26fec` |

The three current remote build refs (Insights, Rally and Discard) are ancestors of the bound integrated base. The two integration merge commits precede the split. The current source delta is limited to the stylesheet entry and 22 parts, the test-only reader, the architecture test and ten CSS-reading test setups. No production TypeScript/JavaScript, engine body, markup, storage, role logic, dependency manifest, lockfile or browser-test assertion was changed by the split. New scripts are local evidence drivers, not production entry points. The file-map and feature-impact edits describe ownership and retain their previous contracts. Staged additions were included in the inspection; this was not an unstaged-only diff.

## Source and emitted-output inspection

I parsed the entry's actual import list, read each part's opening and closing boundary, independently parsed every complete part with error recovery disabled, concatenated their raw Buffers without separators, and compared the result directly with `git show` of the bound original and with the saved baseline source. Both comparisons are exactly equal. This proves the moved declaration bodies, comments, whitespace, CRLF, media conditions, order and late overrides were retained; I did not infer equality from a line count or a hash asserted by the extraction script.

The 22 contiguous ranges run from foundation/login through Logic, shell, week, shared pucks, Quals, Inputs/calendar, windows/tools, responsive week, Board/history, drag, editing, responsive Board rows, input editors, Admin/Help, medical, save status, OIL/Board, availability, Changes/Quals and late Insights. Boundaries are outside declarations, comments and grouping rules. The original resource inventory has one data-SVG URL and no relative resource needing rebasing. There is no namespace/layer/import dependency hidden in the parts. Keeping shared runs and late overrides in their original positions is correct for this mechanical step.

All four actual emitted CSS assets were compared byte-for-byte against the saved baseline assets:

| Asset | Bytes | Result |
| --- | ---: | --- |
| `index-CXdqUrrO.css` | 218742 | Exact |
| `LeaveWarPage-C7jiJ1U2.css` | 76185 | Exact |
| `TrackerPage-RlgGU7Bu.css` | 32016 | Exact |
| `idle-BfPG9c67.css` | 3445 | Exact |

No AST fallback, tolerance, filename-only inference, media reordering or source normalization was needed. Existing `main.tsx` still has its single eager import of the same stylesheet entry. A source/script search found no current production fragment importer or overlooked executable raw reader of the former monolith. The remaining references are comments, the architecture test, the deliberate preservation driver and the adapted Tracker mutation target.

The retained blank separators now end 21 physical parts. A staged whitespace checker can report those as blank EOF lines; they are exact bytes of the original contiguous ranges. Deleting them would violate this task's preservation contract. CRLF-aware checking distinguishes those from newly authored trailing whitespace. A generic claim that every staged whitespace check passes would be inaccurate; retaining these baseline bytes is accepted, not a reason to reformat them.

## Tests and clean-install dependency reasoning

The test reader validates explicit imports against the declared list, rejects executable CSS beside them, rejects duplicate/missing/unlisted/reordered names and concatenates the actual files in manifest order. It fails rather than silently testing only the entry's imports. The architecture test checks the directory inventory, independent part parsing, nested imports, the production entry and direct fragment-import prohibition; its five negative cases cover missing, duplicate, reversed, unlisted and extra-rule entry text.

I read the complete deltas for `amendretest`, `caltouch`, `css-invalidation`, `drawerlock`, `flagglow-css`, `layers`, `lift-css`, `modal-phone-height`, `topbar-css` and Tracker `trk-palette`. Every behavioral assertion and existing comment-removal operation remains unchanged. Only the stylesheet acquisition/import setup changed. The executable Tracker break driver now alters the same amber token in the foundation part, where the exact original token occurs; its mutation and expected result were not weakened.

The parser is not an accidental local-only package: the unchanged lockfile records Vite **8.2.0** with **required** dependency `lightningcss: ^1.33.0`, locks `lightningcss` **1.33.0**, and includes its native platform packages through the normal package dependency graph. A normal development `npm ci` therefore supplies it. I did not run a disruptive fresh install; this conclusion is from the committed dependency graph, not simply successful resolution from the current installation. No dependency was added.

Early architecture RED (2 failures / 6 passes), original-reader 127 green and post-split 135 green are the builder's recorded chronology. Their standalone raw logs were not in the supplied evidence tree when inspected, so I do **not** independently certify those early counts or their timing. The final full-unit raw log does independently support 7727 passing tests in 489 files, and the new test/source inspection establishes the intended detection mechanisms. This limitation does not indicate a missing current test or weakened assertion.

## Runtime evidence audit and 32-family disposition

Tier remains **FULL**: money arithmetic NO, published presentation YES, saved shape NO, shared drawing YES, new gesture NO, new surface NO, roles/visibility YES and warning presentation YES. I reviewed the three browser drivers and their result data. The main before/after **91 surface records compare exactly**, including names, viewports and sampled styles. The additional **88 named geometry/style sample records compare exactly**. All 18 recorded CSSOM break sensors have a changed broken value and an exactly restored original value; they remove a real winning declaration in disposable browser state. These are paint sensors, not a claim that every feature's full lifecycle was mutation-tested.

| Families | Supported result and boundary |
| --- | --- |
| S01–S05 sign-in/request/wait/suspended/guest | Real login/account controls in both primary widths; resulting states pictured. Disposable local test identities; no private material. |
| S06–S08 view/edit/Board | Main routes at both widths and measured shell/editor geometry. Regular phone Board works in the sampled picture. Forced-wide phone body is a known failure, explicitly excluded from usability PASS below. |
| S09–S12 Inputs/calendar/Quals/Logic | Both widths and actual-member matrix; inline editor/cancel, calendar navigation, Quals scrolling, Logic search/admin edit door. Detailed own-versus-other write enforcement is inherited automated coverage, not a new full permission walk. |
| S13–S15 Leave War/Tracker/Help | Navigation and appearance at both widths; lower Leave War view, Tracker event/layout/file surfaces and Help draft entered/cleared without sending. Their separate stylesheet assets also match exactly. |
| S16–S19 Admin Users/config/Data/Medical | Distinct main subviews at both widths; phone category drill-in, all template editors, Medical calendar and document route. No destructive Data operation is needed for a style move. |
| S20 shared modal | Week and Board Insights doors at both widths; original phone top/height behavior remains visibly present. Short-height Insights separately sampled. |
| S21 templates | Duty, Wave and Day editors opened/closed. Empty Day-template content is not invented populated-state evidence. |
| S22 Plans/drafts | Corrected extras04 opens real Plans menu and manager at desktop/phone; earlier wrong-root failure retained. |
| S23 input editor/questions | Inline editor and schedule-input popup representatives; unchanged obscure medical/OIL question states receive structural/test coverage, not a claim every subtype was populated. |
| S24 medical document | Actual card/viewer open and close at both widths. **Next not exercised**: no corresponding operation in extras04; pictured fixture has one document. Exact CSS and existing tests cover unchanged controls structurally. |
| S25 day/Traffic airpop | Day detail and Traffic doors opened/closed and pictured; empty Traffic state qualifies only its pictured frame. |
| S26 calendars | Week/range/Medical calendar doors and previous-month Inputs navigation. An empty October capture does not prove a populated October day. |
| S27 menu/highlights | Phone drawer used for real navigation; Board highlight opening and desktop equivalents pictured; actual member Admin/Edit doors asserted absent. |
| S28 Changes/bubble | Changes frame opened/closed over Board at both widths. Empty window capture does not prove populated bubble/Hide/Show lifecycle; unchanged selectors/tests carry that structural coverage. |
| S29 availability | Board and Week count-chip routes opened/closed at both widths in extras04. No claim of every unchanged person/OIL-tab operation. |
| S30 Board More/OIL/feedback | Phone More, layout toggle and OIL controls plus desktop direct doors; wide-body failure retained. |
| S31 Leave War secondary | Settings and OIL sheet representatives both widths; not every unchanged subtype's lifecycle. |
| S32 Tracker secondary | File cancel, event close, layout and syllabus cancel; Tools/Fit sampled at short sizes. Small fitted labels/canvas space remain visual limitations. |

The browser helpers use ordinary visible controls, scroll and center hit-testing before their normal mouse clicks; there is no force click to hide a covered target. Week's Blue answer uses native focus/Enter as a separate route from Board's Red mouse answer. Dense Saturday is built through the existing real-control fixture helper; its local navigation bridge is not presented as proof of a visible door. The actual-member matrix logs in as the member rather than relying solely on the main walk's admin member-view switch.

Extras03 is correctly **FAIL overall** after its later wrong Plans-root selector. Its previously recorded Board role/Rally/Red and Week role/Rally/keyboard-Blue operations did pass and remain usable partial evidence. Extras04 completes the remaining window routes, not a retrospective overall PASS for extras03. The earlier invalid Rally fixture and covered Week mouse target remain disclosed. No app behavior was edited to make these harness routes pass.

Additional evidence limits: short-height captures operate/sample **Insights, Board and Tracker Tools** at 844×390 and 1440×480. They do not establish every edge-docked control on short Changes, availability, calendar or drawer states. The scripts do not provide a comprehensive failed-request ledger: main listens for console and page errors; matrix/extras record page errors. Their empty lists must not be enlarged into a claim that every HTTP response or console event was audited. These omissions are explicit structural-coverage qualifications for an exact-CSS move, not fresh proof of those unchanged workflows. No production module changed and no observed output discrepancy suggests a new targeted runtime failure needing another heavy run.

## Independently opened pictures

I opened these **20 original PNGs** with the image viewer at original resolution, independently of the coordinator's full ledgers. Paths below are relative to `docs/handpass/css-split/`.

| Pictures | Observation |
| --- | --- |
| `baseline-03/phone-board.png`, `after-01/phone-board.png` | Regular phone Board has sign-offs, warnings, notes and programme rows; sampled layout preserved. |
| `baseline-03/phone-board-wide.png`, `after-01/phone-board-wide.png` | Both show the known blank day body below sign-off. |
| `baseline-03/phone-board-insights.png`, `after-01/phone-board-insights.png` | Insights begins below the thin top strip; close/title and bars visible; lower content remains internally scrollable by design, not fully pictured. |
| `baseline-03/desktop-admin-editsched.png`, `after-01/desktop-admin-editsched.png` | Dense draft schedule, warning/sign-off regions, palette and reporting header preserved. |
| `baseline-03/phone-admin-inputs.png`, `after-01/phone-admin-inputs.png` | Input controls and date selector preserve their phone presentation. |
| `after-01/desktop-admin-logic.png` | Reporting timing/text fields and independent mission switch coexist visibly. |
| `after-01/desktop-admin-leavewar.png` | Shell, dense grid and frozen person labels remain coherent. |
| `matrix-after-01/phone-short-844-tracker-tools.png` | Tools and Fit visible; expanded tools leave only a narrow chart strip. |
| `extras-after-04/phone-board-wide-content.png` | Blank wide body persists after the extra top/left scroll attempt; this is not readable-body proof. |
| `after-01/phone-member-quals.png` | Member Quals table visible; image alone does not prove permission enforcement. |
| `after-01/phone-admin-admin.png` | Phone Admin category controls remain visible. |
| `after-01/phone-admin-tracker.png` | Existing large upper canvas space and tiny fitted labels visible. |
| `extras-after-04/phone-medical-document.png` | Certificate and Close visible; small fitted text, no Next control in this state. |
| `extras-after-03/desktop-rally-and-role.png` | Rally warning appears beside reporting controls; role question is below this frame, so its existence/action is established by runtime assertions rather than this picture. |
| `matrix-after-01/desktop-short-1440-insights.png` | Modal title/close remain visible in a short desktop viewport. |

No pixel-identity claim is made: toast timing, scrollbar position and neighboring days can vary. The coordinator's 187-before/136-after ledger remains the evidence for its broader individual inspection; I did not re-open all 323 originals or claim that I did.

## Findings, dispositions and gates

**No blocking new source findings.** Explicit negatives: no cascade reorder, truncated rule/comment, relative URL regression, lazy-loading change, selector change, production import bypass, lost original CSS-test assertion, engine/markup/state/storage change or package change found.

Evidence correction E1: the sheet originally described medical-document Next as completed. Concrete mismatch: extras04 has no Next operation and its fixture shows one certificate. Cause: the driver conditionally skips absent Next; the prose generalized the viewer route. Fix: say card/viewer open/close; mark Next unexercised, structurally unchanged. **Resolved:** the host corrected the sheet during this read; I re-read the saved correction, including its explicit short-height limits and HOST-REPORTED early counts. No app or test change was needed. The immutable brief retains its original claims as the historical inspection request. Error-list boundaries above likewise constrain the report rather than implying broader evidence.

Existing `[PHONE-WIDE-BOARD-BLANK]` is independently visible before and after and already filed in the backlog on 29 September. It is a real existing usability fault, **not** a D56 stored-demo exclusion. Its unchanged presence is nonblocking for the expressly mechanical split, not resolved, waived, or accepted as a usable Board. `[PALETTE-WRAPPED-HEADER]` and `[VH-SHEETS-IPHONE]` remain filed for later work; do not silently fix them during extraction. Phone document/Tracker text and short-height viewport losses remain visible limitations. Physical iPhone Safari keyboard/browser-bar/fling behavior is not proved.

I read the retained final gate logs: **unit 7727/0 (489 files), build PASS, original reference 728/0, browser 527 passed +49 skipped, Tracker 445/0, rulecheck PASS; six adapted probes 155 assertions, performance four assertions PASS**. Existing Vite/config/dynamic-import and jsdom warnings are present, not erased. Week 5131 and Board 1018 nodes satisfy unchanged ceilings 5450/1150; edit isolation and scroll400→400 pass. Reported timing medians are reference comparisons, not a measured speed improvement caused by this split. Gate-lock ownership/release is builder-recorded execution evidence; this inspector did not claim to have personally watched the historical lock acquisition.

No application gate, browser walk or install was rerun by this inspector: there was no concrete changed-source concern, and D499 prohibits reassurance-only repeated broad runs. Deterministic file/byte/parser/result-data checks were run independently. Only this report was written. The immutable brief, plan, source, tests, drivers and previous reviews were not changed.

D489 tidiness/connection read: the physical ownership names honestly describe existing contiguous runs; order is explicit at the sole entry; the shared test reader replaces repeated monolith assumptions without entering production. No new domain responsibility, duplicate business decision, disconnected consumer or concrete further extraction need was found in the changed code. Engine bodies were not subjected to a refactor request.

**OWED: Claude's read after Monday 5 October 2026, 19:00 Asia/Singapore** — plan, code, scenario coverage and full independent walk for `codex/workflow-ui` and the three inherited branches `codex/insights-mission-mix`, `codex/rally-workspan`, `codex/discard-marks-remove`, before main. This PASS supplies the Codex-side fresh code inspection only. No main push, merge, merging PR or later UI implementation is authorized.

Final independent recheck: all 834 bound entries and the freeze/brief hashes still match after the host's evidence wording corrections. The report's required document check exited successfully; the current branch retains the permitted D29 overage, not a generic within-budget claim.

Docs: OUTSTANDING 106 items (+12 −2, −2 all in ARCHIVE) · DECISIONS D1–D541 (new: D491, D492, D493, D494, D495, D496, D497, D498, D499, D500, D501, D502, D503, D504, D505, D506, D507, D508, D509, D510, D511, D512, D513, D514, D515, D516, D517, D518, D519, D520, D521, D522, D523, D524, D525, D526, D527, D528, D529, D530, D531, D532, D533, D534, D535, D536, D537, D538, D539, D540, D541) · homes OK

docsize: OVER by 1478, deferred (D29)

Walk: reviewed completed preservation evidence and its qualified 32-family inventory; independently opened 20 pertinent originals. Did not run a new walk. Known blank phone-wide Board remains filed and unchanged. Rulings: none from this review.
