# Insights — final design pictures, 3 Oct 26

Status: final pictures inspected; independent Astra design read PASS after two presentation fixes.
Owner agreement is pending under D515. No application source, tests, contracts or saved-role behaviour changed.
This record is design evidence, not the FULL build check or a code approval.

## Baseline and isolation

- Refreshed `origin/claude/planning-filing-3-oct`: `5f9bf9781874f7ee8dcaf69ebe1b532606e851a7`.
- Created `codex/insights-mission-mix` from that ref without resetting an existing branch.
- Isolated checkout: `C:/Users/User/projects/Raptor/.claude/worktrees/codex-insights-mission-mix`.
  Primary checkout and all existing worktrees/changes preserved. Dependencies are a junction to the primary
  checkout's existing `node_modules`; generated build output is local and ignored.
- Revised plan SHA256 `A51541CA5557914E37989A6F445BD828D1FDDE2ADBFD0930E557234DE4B99DBD`.
  Original plan SHA256 `5889ECDC501EDFDCA982A090790DE4CFEDB66E0AF53066C4B50B93A7FB052968`.
  Both frozen plans and every earlier review record unchanged. Three plan-review rounds remain complete.
- D512–D531 full rows read; D532 checked unused. This request reaffirms existing rulings; none recorded.

## Pictures and what they prove

Gallery: [phone/desktop final look](../../img/insights-final-look/index.html).
Driver: `docs/img/insights-final-look/final-look.cjs`; results: `result.json`; final fingerprints:
`final-picture-hashes.json`. All 18 final PNGs opened individually by the host; Astra opened all 18 before the
last corrections, then independently opened the four corrected pictures. Phone 390×844, desktop 1440×1000,
short phone 390×568. The already-approved Logic switch is unchanged.

| State | Phone | Desktop |
|---|---|---|
| Mixed/all-blue/all-red/total-only chart; twelve plus Show all | [picture](../../img/insights-final-look/chart-phone.png) | [picture](../../img/insights-final-look/chart-desktop.png) |
| Board entry | [picture](../../img/insights-final-look/board-phone.png) | [picture](../../img/insights-final-look/board-desktop.png) |
| Working Choose | [picture](../../img/insights-final-look/working-choose-phone.png) | [picture](../../img/insights-final-look/working-choose-desktop.png) |
| Working question | [picture](../../img/insights-final-look/working-question-phone.png) | [picture](../../img/insights-final-look/working-question-desktop.png) |
| Working Change | [picture](../../img/insights-final-look/working-change-phone.png) | [picture](../../img/insights-final-look/working-change-desktop.png) |
| Actual issued-view banner/selector | [picture](../../img/insights-final-look/published-view-phone.png) | [picture](../../img/insights-final-look/published-view-desktop.png) |
| Published read-only Remarks/Change | [picture](../../img/insights-final-look/published-change-phone.png) | [picture](../../img/insights-final-look/published-change-desktop.png) |
| Published question | [picture](../../img/insights-final-look/published-question-phone.png) | [picture](../../img/insights-final-look/published-question-desktop.png) |

Short phone: [working](../../img/insights-final-look/working-question-short.png),
[published](../../img/insights-final-look/published-question-short.png).

The generator serves the unchanged baseline production bundle, enters the existing Board, and uses its real
sign/publish/version-view controls on disposable fresh browser data for the issued layout. Role controls and
chart splits are scoped DOM illustrations. The chart's source totals are retained; Show all mock operates
12 → 38 → 12. Geometry, same focused Remarks node/selection, Later retaining text/prior answer, no overlap,
and typed input refusal on the illustrative read-only Remarks are asserted. Browser errors: zero.

These checks do not prove real own-edit triggers, either editor's role wiring, storage, history, Undo, permissions,
travel semantics, separate saved contexts or Board opener operation. None of S01–S33 has been run for the build.
The latest-published route proposal is: existing version menu → latest issued version → tap read-only Remarks →
Choose/Change. The answer updates Insights immediately; the programme stays unchanged. No working-copy load is needed.

## Failures, fixes and limits

- First capture attempt tried the hidden phone shell Insights control with a visible click and failed.
  Design capture now opens the existing modal directly; this is explicitly not proof of the future Board opener.
- Host picture inspection found the initial published overlay insufficiently established its frozen context,
  repeated Mission boxes were inconsistent, and a measurement selector depended on an attribute removed by
  the mock. Fixed by using the actual issued-view route, consistent ACM examples and stable measurement markers.
- Astra found a fixture-publication toast in two full pictures and Change shown without visible Remarks focus.
  Four earlier pictures retained in `diagnostics/`; earlier full-set fingerprints in `first-picture-hashes.json`.
  Generator now waits for the real toast to fade, refocuses/selects the original node and asserts identity/range.
  Gallery explains the published access route. Corrected capture checks and independent reread PASS.
- Baseline `npm run build` PASS. FULL gates/PC lock/frozen running-app walk are still due after source implementation.
  These desktop-browser phone emulations do not establish physical-device behaviour.
- `npm run docsize` PASS for the design/status additions, every record accounted for. Existing note about a foreign
  merged handoff block retained; this chat does not own it. Whitespace check PASS; no source diff. Repeat the document
  check after the closing-status edits and before commit. No gate-baseline count replaced by a mock result.

## Complete independent Astra responses

### Initial coordination/scenario confirmation — read-only, no new plan round

The final-look work can proceed without another plan review or product-question round. I read the revised plan, both complete reviews including Opus §7, the current spec, applicable rulings and existing picture scripts. The revised plan’s fingerprint matches its recorded value.

For the owner’s final phone/desktop pictures, cover these distinct states:

| Picture | What must be visible |
|---|---|
| Insights | Mixed, all-blue, all-red and ordinary total-only rows together; unchanged totals/common scale; clear “Role not chosen” explanation; first twelve and Show all. Include expanded/Show less state in the preview. |
| Board entry | Desktop Insights beside the bell; phone Insights inside ⋯. Keep the phone bar one row and existing buttons unchanged. |
| Working Remarks | Temporary **Choose mission role** when unanswered; **Change mission role** when answered, both after AREA. Show **Working copy** where published wording differs. |
| Question | Formation-wide Blue / Red / Later after AREA, Remarks readable, no guessed selection or permanent role marker. |
| Latest published | Existing issued-version view, focusable read-only Remarks, temporary action and **Published · Original/ALn** question. Keep the issued-view banner visible enough to establish context. |

Use the two-context example already specified: published **DS FOR VL**, answered Red; working **DS FROM RU**, answered Blue. This makes the separate contexts understandable without changing the product design.

Reuse the machinery in `raptor-port/docs/img/insights-proposal/`:

- `remarks-lifecycle.cjs`: existing bundle, scoped styling and after-AREA insertion; phone 390×844, desktop 1440×1000, short phone 390×568.
- `proposal.cjs`: chart proportions and desktop/phone Board placement.
- `logic-switch.cjs`: approved Logic appearance and total-only chart treatment.

Create a new final-look generator/output set. Preserve earlier evidence. The existing lifecycle generator opens on **every blur**, lacks Choose/context labels and does not demonstrate the published door; copying that behavior unchanged would misrepresent D529. Its focus check also does not prove continued typing or selection preservation. The existing Show all and Board buttons are inert, and the total-only chart exists only at phone width.

For the published example, the actual route is the Board’s existing version menu → latest entry under **Issued · read-only**. Do not use **Load onto working copy**. Make only the illustrative Remarks display read-only/focusable and remove its schedule-write attribute. Preserve the published appearance and existing dimensions. Older previews get no role action.

All **33 independently supplied scenarios, S01–S33, are present and ready to carry into the build evidence**:

- S01–S07: classification, counting and pinned context.
- S08–S12: own-edit triggers, unanswered access and correction.
- S13–S18: published/working separation, Undo and history.
- S19–S21: template/copy travel and persistence.
- S22–S26: both editors, focus, viewport, stale action and permission checks.
- S27–S28: actual setting Undo and off-week answer Undo.
- S29–S33: list expansion, all openers, performance, published access and malformed records.

Keep those exact IDs; each later needs setup, real action, observed result and evidence. No scenario has been executed by this read. Mock interaction/layout checks remain design evidence only. The application build remains FULL, with fresh Astra inspection and Claude’s later code/scenario read owed.

No file edits, Git mutations, app changes or new rulings. Rulings: none.

### Initial 18-picture design read

**Design evidence read complete: two presentation corrections before the owner’s look.** I read the generator and results and opened all 18 PNGs individually. This is a design read, not plan or application-code approval.

1. **Remove the publication toast from both full published-view pictures.** They still show “Monday published — APPROVED”, left by fixture setup. Beside the new role workflow, that can suggest answering requires publication, contrary to D530. Wait for the toast to disappear and recapture those two pictures.

2. **Refocus Remarks before capturing working-change at both widths.** Those pictures show Change mission role while Remarks has no visible focus or selection. The generator opens this state directly after Later without refocusing. Focus/select the same Remarks node before capture so the picture accurately illustrates the temporary editing-only action.

Add a short explanation beside the published pictures: **Open the latest published version, tap its read-only Remarks, then Choose or Change mission role. The answer updates Insights immediately; the programme stays unchanged.** The prominent existing “Load onto working copy” button is a different route and should not appear to be the next step.

The visible layouts otherwise satisfy the proposed look:

- Chart totals, proportions, mixed and single-colour bars, ordinary total-only row and explanation are readable at both widths.
- Show all is visible; the result records the mock’s 12 → 38 → 12 operation.
- Desktop Insights sits beside the bell; phone Insights sits in ⋯ without crowding the bar.
- Both repeated Mission boxes show ACM consistently.
- Working **DS FROM RU** and published **DS FOR VL** are visually distinct and labelled.
- Choose, Change and Blue / Red / Later sit below AREA, leaving Remarks visible.
- Phone, desktop and short-phone question pictures show no overlap or clipped controls.
- Published Remarks is visibly selectable within the frozen layout; the generator checks typed input is refused.

The reported checks remain appropriately limited: mock focus/range preservation, Later retention, dimensions and read-only display. Automatic edit triggers, both production editors, saved answers, permissions, Undo, separate published/working records and actual Board opening behavior remain unbuilt. The 33 build scenarios still supply that later evidence.

No files changed. Rulings: none.

### Corrected-four reread

**Both presentation findings are resolved.** I independently opened all four corrected PNGs and read the updated gallery text and relevant generator changes.

- Both published-view pictures now show the genuine issued-view banner and selector without the misleading publication toast.
- Both working-change pictures now visibly focus Remarks with the same text selection, correctly showing Change mission role during editing. The generator asserts original-node identity and selection.
- The gallery clearly explains the latest-published → read-only Remarks → Choose/Change route, immediate Insights update and unchanged programme.

No unresolved finding remains from this design-picture read. The pictures are ready for the owner’s final agreement. This does not approve application code, execute the 33 build scenarios or replace the owner’s answer.

No files changed. Rulings: none.

### Bounded design/status-prose read

The additions preserve the agreed meaning and scope. One closing-status correction remains before they are final:

- **The handoff says “Shipped”, but the design files are still uncommitted in this checkout.** Use “Prepared” until the branch push completes, or confirm the completed push before retaining that wording.
- Its checks line promises the final document-check result in the design record; that record currently contains no such result. Add the actual outcome after running it.

Everything else in this bounded read is consistent:

- The new evidence record retains all three complete responses verbatim, including the initial findings and their resolution.
- Owner picture agreement remains explicitly pending; technical-plan agreement, design inspection and application verification are correctly distinguished.
- No saved-role behavior or S01–S33 execution is claimed. FULL checks, fresh Astra code inspection and Claude’s later read remain owed.
- The new spec section, backlog update and file-map entry point to the correct new gallery/evidence and preserve the earlier records.
- Compared with baseline `5f9bf978`, the original/revised plans, previous review records, earlier proposal pictures, source and browser-test files are unchanged.
- Both plan fingerprints match their recorded values.
- Removing only this chat’s Insights block from the comparison leaves the entire handoff identical, including every foreign block.
- The 18 final pictures, four retained diagnostic pictures and both fingerprint lists exist.

No other finding. This was a status/design-prose read, not another technical-plan round or code inspection. No files changed. Rulings: none.

Disposition: handoff now says Prepared, making no premature push claim. Actual document-check PASS added above.
No design/plan/source change follows these two closing-status corrections.

## Next / owed

Await explicit owner final-look agreement (D515); record it before source work, after rechecking D532.
Then the unchanged revised plan drives failing production-route tests first, Sol implementation, all S01–S33,
FULL locked gates/frozen walk and a fresh Astra final-code inspection. OWED: Claude's later code/scenario
read after the reset on `codex/insights-mission-mix`, before main. No PR, merge or main push.
