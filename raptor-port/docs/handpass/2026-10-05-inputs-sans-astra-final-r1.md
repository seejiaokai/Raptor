# Inputs/SANS — independent Astra final inspection R1

5 Oct 2026 · D496 initial 1 of 2 · **CHANGES REQUIRED** · one P2 finding, three independently reproduced cases.

Sol 6.1 wrote production; this inspector made no production/test changes. This report reviews `codex/inputs-sans-calendar` against parent `9bd14458`, including intended new files. D579/D580 authorize this build; Claude-before-main remains. This is neither owner acceptance nor Claude approval. Rulings: none this session.

## Identity and evidence

- Immutable brief SHA256: `c38f62ddb2c9f625560f954d704bc476a95392716e6c3e3f6b9b1ea50cc1d1cb`.
- Independently checked all 858 manifest entries against both copied freeze7 and live files, including byte sizes and hashes; independently fetched and compared all 18 served HTTP assets. No discrepancies. Manifest SHA256: `6018e3fedfd83d58d157baa3c8d93d5d78560dc4c9b715b62cec2403092ee655`.
- Actual app: `http://localhost:4192`; main `index-BmmW-mPF.js`, SHA256 `4d40a37ce5a7f43c55a63a2bfc919364207e81aee1dbaad1b9ddf46c006c9699`.
- Checked the 30 ledger image hashes and personally opened all 30 original PNGs, including all seven useful freeze6-showcase states. Ledger SHA256: `f48cd1f0096cdbd841da524b4e0e862b765f99b6c017fa27049e71d31dd482fe`.
- Independently compared freeze6 to freeze7: only the registered main handpass driver differs. Production, tests, CSS and bundle are identical. Astra-authored driver amendments are not independently approved by this Astra read; Sol's separate challenge is the relevant independent read for those amendments.
- Private evidence base: `C:/Users/User/.codex/visualizations/2026/10/04/01a106e0-f018-7e91-be46-ca442dde08b3/inputs-sans/`. All relative evidence paths below refer there.

Read the changed production/test bodies across their complete files, intended new modules/tests/drivers, central state/permission/Undo wiring, and the named brief, plan, evidence and governing rules. Large unrelated historical block comments in several test/state files were elided during reads; executable bodies were not limited to changed lines. No broad suite was rerun by this inspector. The narrow real-browser reproductions below were separately authorized by the host.

## Finding method and scope

Do not merely review the changed code. Starting from the user promise and the applicable rulings, enumerate every qualifying object, renderer, visible door, writer, reader, downstream consumer, role, overlay and meaningful order of actions. **Assume every existing line may be correct and the defect may be a MISSING call site.** For each item, state where the visible sign and the working gesture should exist in the production app. Then rank concrete failure scenarios with setup, action, expected result, and the observation that would disprove correctness. Start with the least-shared or most specialised surface.

This app is pre-promulgation and its entire stored world is DEMO DATA that will be CLEARED before the database step. **Do not report a problem whose harm exists only in data already stored when the code is already correct going forward** — no migration, no back-compat, no "an existing record would read wrongly". If the app would do it again to NEW data, report it: that is a real finding and this exclusion does not touch it.

F1 below concerns rows created and edited through this running build during this inspection. It is not a stored-demo migration finding.

## F1 — P2: successful saves lack a complete destination-and-reveal contract

The data saves, but the person can lose sight of it or see it described as the wrong kind of input. The new mode separation makes a successful save need a destination mode, date and actual saved-row identity. Inference from newly appearing IDs inside a keyed calendar does not provide that contract.

### Reproduction A: Member add becomes a hidden SANS offer

Setup: fresh isolated Chromium admin session. In SANS, set the search to `NO_MATCH_R1`; return to Member Inputs, whose independent search is empty. Open 23 Oct 2026, choose Add, choose SANS Availability, select eligible Zenith (`vinci`), tick Fly, leave All day, and enter `R1 cross-mode new offer`. The explicit Fly tick matters: changing the type does not inherit the default SANS form's Fly flag.

Action: save through the real shared editor.

Expected: retain both modes' independently remembered filters, switch to SANS on the saved date, and reveal/identify the saved commitment despite the destination's hiding search. It must also be discoverable in List by the promised reveal convention.

Observed: SANS becomes active, its search remains `NO_MATCH_R1`, the day closes and no saved row is visible. Reopening 23 Oct shows `1 available` but `No commitments match these filters.` Clearing search reveals Zenith, Fly, All day and the exact new remark. Stored row `imuuarhwemzhrri` has date Oct 23, yr 2026, type SANS Availability and `sans.f=true`. This proves a reveal failure rather than a failed save or aggregate-count error.

Evidence: `r1-cross-mode-filter.json` and `r1-cross-mode-filter.png`; original picture personally opened.

### Reproduction B: SANS offer becomes a falsely labelled Member input in SANS

Setup: fresh admin session, SANS on 23 Oct 2026. Add a Zenith/Fly/All day offer with remark `R1 existing type flip`; then open that newly created row.

Action: change its type to Personal and save.

Expected: the saved Personal input is discoverable on the relevant date in Member Inputs; SANS contains only SANS commitments.

Observed: SANS remains active. Its correct aggregate is `0 available`, but the stale saved-row pin force-inserts this Personal row into SANS. The row says `No activities` and `OFT / AMT only · not counted for flying`. Stored row `imuuasmvwyxb8s6` is actually Personal. The input was not lost; it is misrepresented by the wrong renderer.

Evidence: `r1-existing-type-flip.json`, `r1-existing-sans-to-member.png`; original picture personally opened.

### Reproduction C: Member input becomes an invisible SANS offer

Continue B by manually switching to Member Inputs, opening 23 Oct and the same Personal row. Change it to SANS Availability, tick Fly and save.

Expected: SANS mode/date and a discoverable saved offer, with remembered filters retained.

Observed: Member Inputs remains active and the day says `No inputs on this day — hold the cell or tap + Input`. The same actual row is now SANS Availability with Fly. The successful update has no corresponding destination/reveal action.

Evidence: `r1-existing-type-flip.json`, `r1-existing-member-to-sans.png`; original picture personally opened. An initial fixture attempt with an ineligible/unselected Fly combination correctly failed validation and was discarded as a setup error, not counted as a product failure.

Private reproduction SHA256 (paths relative to the exact private base above):

| File | SHA256 |
|---|---|
| `r1-cross-mode-filter.json` | `88636960062db2d151b34e96f79a78bebd769a6b3aefbdbc823f7e6ce0bd92e3` |
| `r1-cross-mode-filter.png` | `facb24593b33e064f15ec1b4eab267fe6ef396fca852aefd390040a460fd84d1` |
| `r1-existing-type-flip.json` | `ae458b1e23dbab336eb8ba61af9ae885c501db444755323be170f391f17adbb7` |
| `r1-existing-sans-to-member.png` | `6a5483581ae84990a14e132e06ec4b08bde4c7057d1576fc4be8716ef9e0a771` |
| `r1-existing-member-to-sans.png` | `155710cdf3f62a1f59241b23efa5f5cf738c48a1994d210f860691c3cc6d5eee` |

### Cause and exact repair boundary

| Location | Missing or incorrect behavior |
|---|---|
| `src/ui/InputsPage.tsx:1137` | Calendar is keyed by mode, so switching mode remounts it after the row already exists. |
| `src/ui/InputsCal.tsx:167–172` | Local `savedId` and initial `knownInputs` set infer a new row only during an existing mount. The remounted calendar considers the just-saved ID already known. Updates to an existing ID are never new additions. |
| `src/ui/InputsCal.tsx:525–527` | Forced reveal checks ID/date but not current mode. A stale pin can insert a Personal row into the SANS renderer. |
| `src/ui/inputedit.tsx:1605,1618,1646` | Only ordinary new `_calendar` saves select mode/month. Existing saves and confirmed medical saves close/toast without a common saved-row notification. |
| `src/ui/InputsPage.tsx:474–479,625–658` | List add has its own pin, while ordinary inline edit and confirmed medical/OIL edit success paths only close/toast. The new destination/reveal behavior is not a shared post-save obligation. |
| `src/state/undo-wire.ts:151,179` | Direction-aware mode routing exists, but restored-row discoverability under remembered filters is not covered by a common reveal request. |

Repair as one scoped UI contract, without changing engine/lifecycle/storage semantics:

1. Hold an explicit transient saved-input request above the keyed calendar, containing actual saved ID, actual ISO date and destination mode. Derive it from the committed row, including a medical operation's first retained segment, rather than the pre-confirmation draft or merely the first global row after arbitrary work.
2. Emit only after successful writes from every Inputs save door: List add; ordinary inline edit; confirmed medical/upchit/OIL paths; calendar shared-editor add; existing shared-editor edit; confirmed shared-editor medical save. Preserve cancellation/refusal behavior. Shared editors reached from the schedule must retain their schedule context; check the Inputs context/current page before redirecting an existing editor save.
3. Calendar consumes the request after remount or edit, selects the correct date and reveals the actual current-mode row. List consumes the same request with its existing pin convention. Never insert a row into a renderer for a different mode; never resurrect a deleted row from a request payload.
4. Preserve independent filter memories. Saving may temporarily reveal the saved row; deliberate filter/mode changes release that pin. Reset transient requests on session reset. Changing tabs without saving must not clear remembered filters.
5. Connect directional Undo/Redo to the restored image only when the actual restored row exists. Test a filtered type flip in both directions, addition Undo removing the row, and Redo restoring it. Do not replace the existing correct direction-aware routing with a forward-image-only rule.
6. Add failing-first integration tests for A–C plus the missing List and confirmation doors; assert visible mode, date, person/type/ID and saved-row discoverability. Keep a separate assertion that SANS never renders a Personal row. Rewalk the affected actual save routes on phone and desktop, then obtain fresh independent R2 on the fixed snapshot.

The host's proposed transient request approach matches this repair boundary. That agreement is not approval of unwritten code. A–C are runtime-confirmed; the List/medical/OIL/filtered-Undo omissions are source-traced obligations of the same repair, not falsely claimed as separate live reproductions.

## Promise/door/writer/reader roll-call and explicit negatives

| Qualifying object or order | Visible sign and working route | Independent assessment |
|---|---|---|
| Shared editor ordinary/new/existing plus document, upchit, medical clash and OIL overlays | Day/list row → editor → applicable confirmation → saved row on appropriate tab/date | F1; specialized success callbacks are missing the same reveal contract. Existing normalization, document and confirmation machinery remains present. No evidence of silent cancellation writes or a new bypass of medical/OIL decisions. |
| Member/SANS tabs; Calendar default; List secondary | Same Inputs route, independent remembered filters, retained range/sort/export; day/list renderers consume the right mode | Modes/filter separation and retained List machinery are present. F1 prevents approval of the full save-to-discovery promise. |
| Fly versus OFT/AMT-only, duplicate person, partial/custom and multi-day offers | Everyone's flying total above filtered day rows; hours remain visible | Model reads unfiltered INPUTS and deduplicates person IDs; only Fly contributes. O/A-only remains visible. Partial hours do not imply full-day coverage. No new aggregate-versus-filter defect found. |
| Dates/year/overnight | Daily targets and offered-date spans, including reverse range and cross-year | Strict real ISO validation, year-aware spans and existing overnight ownership retained; tests cover leap/year edges. No speculative credit on the next date is introduced. |
| Admin required/flying and thresholds | Day settings and amber/red controls; explicit unset/zero/day/night/both | Typed intent, exact payload validation, finite safe nonnegative required values, inclusive positive ordered thresholds, permission backstop and command queue are present. Readback/failure rollback is tested. No new direct naked settings write found. |
| Member own/others; admin and stale actor | Other-person read-only editor; own eligible writes; settings admin-only | UI and central permissions both apply. Read-only pictures show fields rather than editable controls. No new ownership or admin-setting bypass found. |
| Mouse range; phone/keyboard Select dates; arrows; Escape/cancel | Empty background drag or two-date selection produces one unsaved multi-day editor | Input chips, pucks, notes and controls retain gesture ownership. Reverse order is normalized. Cross-month selection uses explicit mode/arrows; cancellation/unmount clears selection. No additional range defect found. |
| Hold-to-add; moved touch; scroll/swipe; next tap | One editor after stationary hold, movement preserves competing gestures, ordinary later tap still works | Actual retained touch evidence and source cleanup support the repaired release behavior. The earlier real release defect is not erased by the later pass. Physical Safari remains unproved. |
| Planning notes/pucks and embedded Member calendar | Existing planning marks/doors remain on Member surface | Preserved source and planning-filter picture support separation. No dropped planning door found in this bounded review. |
| Issued/pending/signoffs, downstream scheduling and OIL/Leave War | Existing command pipeline and published safeguards, preserved downstream state | No engine production-body change. Source paths and retained issued/medical/ownership evidence support preservation; this inspector did not independently replay every published lifecycle order. |
| Undo/Redo/reload/session reset | Correct restored mode/settings/date; persistence via existing per-browser backend | Existing directional Undo regression is repaired and tested. F1 adds filtered saved-row discovery coverage still owed. No cross-device database promise is made. |

## Pictures, gates and limitations

The immediate resize/previous-month phone image `freeze6-main-r2/phone-calendar.png` visibly clips the Monday edge; it was not discarded. Its grid is horizontally translated/faded while the weekday header stays fixed, consistent with the existing 240 ms month transition. Settled fresh-phone showcase pictures fit all seven columns. Together with the source transition and the 170-case geometry/calendar confirmation, the evidence supports an intermediate animation frame rather than a settled rotation overflow. This is an evidence-based inference, not a separate device reproduction. No additional material settled overflow/readability defect was found in the inspected originals.

The evidence sheet `docs/handpass/2026-10-05-inputs-sans-calendar.md` records final freeze6 main 17, supplementary 10 and focused 4 passing scenarios, with 30 originals. Recorded gates are 7,802 unit tests/494 files; 569 browser tests with 49 existing skips; build; reference 728/0; Tracker 445/0; six adapted probes passing (corrected audit 54/0); performance 4/0; rulecheck/docsize. These are reviewed evidence, not suites rerun by this inspector.

Retain the original failed runs: the first broad browser run used a preview rebuilt mid-run and cannot be final proof; the unchanged Tracker Shift+Tab assertion failed under load, then its complete 53-test file passed alone and all 7,802 passed at three workers without edits; the real hold-release regression failed before repair; the driver's wrong date-order assumption and audit pre-Redo comparison were corrected without weakening the product expectation. Freeze6 changed two scoped CSS heights and added eight target assertions; build plus 170 calendar/geometry cases passed afterward. Earlier complete functional suites are not represented as rerun after that height-only change. No physical Safari walk is claimed.

Walk: this report and the build evidence sheet · 30 retained originals plus 3 new failure pictures personally opened · 3 focused save/type-change sequences reproduced · MISSING: F1 unresolved, changes required. No extra visual polish or stored-only migration work is requested.

## Required next disposition

Sol fixes F1 with failing-first coverage, scoped checks and an affected phone/desktop rewalk; a fresh independent final R2 then reviews the complete corrected source/evidence. Passing existing gates cannot substitute for fixing the concrete new-data failure.

OWED before main: Claude's independent plan, code/scenario and full phone/desktop reads on `codex/inputs-sans-calendar` after reset, plus inherited branch reads recorded in HANDOFF for discard marks, rally/work-hours, Insights and workflow UI. This report does not discharge any of those reads, owner acceptance, or authorize main/merge. No production, test, prior report, brief or protected file was edited by this inspector.
