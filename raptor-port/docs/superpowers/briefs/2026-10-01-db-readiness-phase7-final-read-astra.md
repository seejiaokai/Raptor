# Astra's final code read — [DB-READINESS] group A phase 7 (1 Oct 26)

*(Saved verbatim from Astra's final message — `codex exec -m gpt-5.6-sol -c model_reasoning_effort=high -s read-only`, the code at commit 11274558; brief `2026-10-01-db-readiness-phase7-final-read-brief.md`. Blind to Fable's read.)*


## Verdict: REVISE

Reviewed branch `claude/db-readiness-p7-oil-followups` at HEAD `1127455856706a946e84ae9d8526530dca2404f3`, against base `7612b19d`.

I found one medium-severity interaction defect. I found no correctness defect in the new OIL evidence, D470, SIM-window validation, slot padding, stored-list, counter, remark, wording, or window-foot logic.

## Finding 1 — phone week-view count chip does not reliably receive a finger tap

**Severity:** Medium  
**Provenance:** Older interaction code made newly reachable by this change on Personal request rows.

Relevant code:

- The counter is a very small inline element with 9px text and no minimum touch dimensions: [scheduler.css](/C:/Users/User/projects/Raptor/raptor-port/src/ui/scheduler.css:6376).
- Phone one-puck rows wrap it below the puck: [scheduler.css](/C:/Users/User/projects/Raptor/raptor-port/src/ui/scheduler.css:3554).
- The counter markup carries the correct `data-oilsent` door: [html.ts](/C:/Users/User/projects/Raptor/raptor-port/src/ui/html.ts:666).
- The window opens only when the resulting click lands on that element or one of its descendants: [interactions.ts](/C:/Users/User/projects/Raptor/raptor-port/src/ui/interactions.ts:569).
- The existing browser test checks exact-center paint order with `elementFromPoint`, but does not dispatch a touch: [geometry.spec.ts](/C:/Users/User/projects/Raptor/raptor-port/e2e/geometry.spec.ts:5067).
- The phase-7 walk reproduced the failure on Edit Schedule and View-only Sched: [p7-c.md](/C:/Users/User/projects/Raptor/raptor-port/docs/handpass/parts/p7-c.md:34), [phase-7 check](/C:/Users/User/projects/Raptor/raptor-port/docs/handpass/2026-10-01-dbr-phase7-check.md:123).

### Exact scenario

**Setup**

1. Use a 390×844 touch-capable phone context.
2. Open Edit Schedule or View-only Sched.
3. Show a row whose ALL or ALL AVAIL puck has a count underneath it. A Personal request row produced by this batch is one such row.

**Action**

Tap the count with a finger-style touch.

**What happens**

The touch is resolved onto the adjacent puck roughly 2px above the count. The puck becomes selected or the row is armed, and the ALL AVAIL window does not open. A mouse click at the same nominal point works. The phone scheduler board also works.

**What should happen**

The touch must land on the count’s `data-oilsent` door and open the same read-only ALL AVAIL window used on desktop and on the board.

The walker reproduced this in Chromium phone emulation, not on a physical iPhone. However, the measured target is visibly undersized, both week surfaces fail while the larger board placement succeeds, and the existing non-touch geometry test cannot disprove the touch failure.

### Exact fix

1. In [scheduler.css](/C:/Users/User/projects/Raptor/raptor-port/src/ui/scheduler.css:6376), keep the existing desktop and board styling.

2. Inside the existing `@media (max-width:820px)` phone block, add a rule limited to the two week surfaces:

```css
#eWeek .oilcount,
#vWeek .oilcount {
  box-sizing: border-box;
  min-width: 28px;
  min-height: 28px;
  margin: 3px 0 0;
  padding: 0 6px;
  justify-content: center;
  touch-action: manipulation;
}
```

The existing phone `.seat` wrapping rule at line 3567 will keep this larger target beneath the puck and within its own people column. Do not apply this rule to `#schedBoard`; its count already works and has different geometry.

3. Add a real touch regression to `e2e/geometry.spec.ts` or a new `e2e/availwin-touch.spec.ts`:

   - Create a browser context with `hasTouch: true`, `isMobile: true`, and a 390×844 viewport.
   - Put ALL AVAIL on a Personal request row.
   - Exercise both `#eWeek` and `#vWeek`.
   - Dispatch `locator.tap()` and a CDP touch with a 12px contact radius at the count’s centre.
   - Assert `.availwin:not([hidden])` becomes visible.
   - Assert the window shows the correct count and Personal-request explanation.
   - Assert the adjacent puck is not selected and no seat or row is armed.
   - Repeat View-only Sched as a member and assert there are no earn controls.
   - Retain the existing containment and `elementFromPoint` assertions so the fix cannot solve touch by overlapping the remarks column.

## Ranked failure-scenario review

| Rank | Setup and action | Expected result | Observation that would disprove correctness | Result |
|---|---|---|---|---|
| 1 | Put a non-holder in another person’s Personal-request name box; answer OIL; hand the request to and from that person; publish. | The name-box occupant earns once while on the row; the holder earns only through his own answer; stale decisions are pruned only after the person leaves. | Holder appears twice, his own No is buried, somebody not on the row earns, or an old answer controls after departure. | No source defect found. |
| 2 | Personal request that never asks the OIL question, including multi-day, off-screen week, kept/cancelled/information-only variants. | Membership is recorded for the count, but no OIL can move through the input or schedule halves. | An `i:<iid>` membership becomes an input, a credit, an eligible switch, or a Leave War award. | No defect found. |
| 3 | Validate crowd people against a sim brief/debrief in the live week, official issued world, phantom-Monday pass, and after a week swap. | The appropriate world’s `SIMW` controls the flag, and the warning sentences remain identical. | Flight-only events are consulted, issued validation reads live windows, or snapshot restoration leaks a previous week. | No defect found. |
| 4 | Fill a later `pax` or `more` seat by tap, drag, swap, template, and `fillSlot`. | Earlier positions are explicit empty strings and no sparse array is persisted. | A hole or `null` remains, or a reader changes behaviour because it expected a hole. | No defect found. |
| 5 | Store an intentionally empty stores, cancel-reasons, or qualification-column list; reload; reach 60 Leave War counters. | Empty remains empty; malformed non-empty data falls back; the 61st new counter is refused while an existing one remains editable. | Defaults silently return, the app cannot render empty, or writer and reader limits differ. | No defect found. |
| 6 | Keep the ALL AVAIL window open, change the relevant person’s timing or availability, redraw, switch tabs, then remove the person. | The foot re-says that person’s current reason, resets on tab/open changes, and clears only when the person is no longer in the list. | A previous person’s sentence survives, becomes false, or goes blank while that person remains listed. | No state defect found; the separate touch-door defect above remains. |

## Explicit negatives

### 1. Personal-request membership and OIL movement

I checked [oilEvidence](/C:/Users/User/projects/Raptor/raptor-port/src/engine/oilev.ts:484), every `ev.sent` reader, `spanDefault`, `itemState`, the evidence/signature keys, `oilDayWork`, `oilMovedInputsOnly`, `oilEarnedWork`, `oilEligible`, and the Leave War credit path.

The new loop records only `sent` membership. It does not add the Personal request to `ev.inputs`; schedule earnings skip the request’s source row; therefore the crowd cannot acquire OIL from that membership. The loop also repeats the necessary live-row, sentinel, request, date-window, cancellation, kept and information-only checks. Raw request IDs and multi-day anchors remain consistent, including requests outside the currently displayed week. I found no reader that requires every `i:<iid>` in `sent` to exist in `inputs`.

### 2. SIM windows and warning wording

I checked [crowdClashes](/C:/Users/User/projects/Raptor/raptor-port/src/engine/validate.ts:221), the shared sentence builders at lines 181–182, warning generation at lines 920–923, `SIMW` initialization/population, official validation, phantom Monday, week changes, and [snapGlobals](/C:/Users/User/projects/Raptor/raptor-port/src/engine/validate.ts:1624).

An explicitly supplied empty sim-window list correctly overrides the global list. Snapshot/restore includes `SIMW`. The warning list and window flags use the same sentence builders, and I found no remaining flag reader restricted to the flight-event half.

### 3. Slot padding and writers

I checked [setSlotVal](/C:/Users/User/projects/Raptor/raptor-port/src/engine/slots.ts:157), `fillSlot`, tap filling, drag, swap, and direct template/overlay construction.

The mutation funnel pads `more` and `pax` with `''` before writing the requested index. Direct constructors produce dense arrays. I found no writer that can still introduce a hole and no consumer relying on sparse-array semantics.

### 4. Stored empty lists and counter limit

I checked:

- [storesLoad](/C:/Users/User/projects/Raptor/raptor-port/src/engine/stores.ts:143)
- [cxReasonsLoad](/C:/Users/User/projects/Raptor/raptor-port/src/engine/cxreasons.ts:94)
- [qualColsLoad](/C:/Users/User/projects/Raptor/raptor-port/src/engine/qualcols.ts:73)
- [readManningRules](/C:/Users/User/projects/Raptor/raptor-port/src/leavewar/state/store.ts:588)
- [saveManningRule](/C:/Users/User/projects/Raptor/raptor-port/src/leavewar/state/store.ts:3970)
- the counter form’s use of the shared maximum.

A stored literal `[]` remains an intentional empty list. A non-empty but wholly invalid list still falls back to defaults. Downstream screens have empty states and restore/add doors. I found no fourth persisted-list reader with the same empty-versus-missing mistake. Duty-template deletion is not such a reader: its UI preserves the required minimum separately.

### 5. `carriedRemark`

I checked [carriedRemark](/C:/Users/User/projects/Raptor/raptor-port/src/leavewar/sync.ts:463) and the approval/request synchronization around it.

Text at or below 200 characters is unchanged. For longer legacy text, the owned date tail is removed before the 200-character cut; the normal editor already caps the typist’s body at 200. The destination rebuilds its own system tail. I found no normal application path that cuts valid typist text or leaves the request and generated Input with conflicting bodies.

### 6. User-visible pay/money wording

I checked the four altered strings and searched the production source for remaining `pay`, `paid`, and `money` wording.

I found no remaining user-visible sentence that describes OIL as pay or money. Remaining matches are implementation comments, including the comments-only wording explicitly excluded by the brief.

### 7. D470 name-box occupant

I checked [landedExtras](/C:/Users/User/projects/Raptor/raptor-port/src/engine/oilev.ts:998) and all three consumers: `oilEarnedWork`, `pruneHandedOverDecisions`, and [oilEligible](/C:/Users/User/projects/Raptor/raptor-port/src/ui/oilmode.ts:685).

The row’s real name-box occupant is added alongside extras and crowd members, but the request holder, placeholders, special IDs, unknown people and duplicates are excluded. The holder’s entitlement continues through the input half only. A name-box person is credited only while actually present on that request row. Handover pruning retains a decision while its person remains on the row and invalidates it after departure. I found no double award, buried holder refusal, off-row credit, or stale controlling decision.

I agree with D56 over D48: an already-issued demo day created by old code is excluded; new rows and publications use the corrected path.

### 8. Window foot identity and Personal hint

I checked [view.ts](/C:/Users/User/projects/Raptor/raptor-port/src/state/view.ts:416), [AvailWindow.tsx](/C:/Users/User/projects/Raptor/raptor-port/src/ui/AvailWindow.tsx:319), and [oilNoAskWhy](/C:/Users/User/projects/Raptor/raptor-port/src/ui/oilmode.ts:602).

Opening, closing, and switching tabs reset both the text and person ID. A redraw recomputes the tapped person’s current explanation if that ID is still present; otherwise it clears it. The Personal hint reads the installed row’s source type first and uses the live request only as compatibility fallback. I found no state where it retains another person’s reason, speaks an untrue reason, or is blank when the identified person should still speak.

## Surface and role roll-call

The reviewed production graph covers:

- Board, Edit Schedule week and View-only week.
- Working days, issued faces, issued-version previews and saved-plan previews.
- Scheduler and member roles.
- Desktop and phone arrangements.
- OIL Earn row and window halves.
- Leave War downstream credit.
- Changes window, next-week peek, print and CSV exclusions.
- Tap, delegated click, drag, swap, fill, template and direct overlay writers.
- Publish, redraw, tab switch, week switch, handover, departure and reload orderings.

The count is intentionally absent from the next-week peek and exports. The changes window does not add a second count line. Member views expose the read-only list but no earn controls.

## Roll-call and evidence gaps

1. The evidence table says “phone” and walks the board, but it does not separately prove a finger tap on the newly supported **Personal request** count in both phone week views. The generic C35 walk exposed the same shared-markup failure.

2. The permanent browser gate claims that the phone count “takes its own press,” but it only checks exact-centre paint order in a non-touch context. That is the direct test gap behind Finding 1.

3. D470 has strong source and unit coverage, plus a host re-walk, but there is no single direct scenario covering handover **to and from the current name-box occupant** while that person has an explicit OIL decision. I found the source behaviour correct, but this remains the highest-value additional D470 regression.

4. The evidence sheet did not fully walk edit, move, take-off, delete and handover orders for a published Personal request. Source tracing found no defect.

5. `carriedRemark` has focused code/test evidence, but the complete long-remark approval round-trip was not visibly walked.

6. Print and CSV were not walked. Their builders do not render the counter, so this is an evidence gap rather than a missing production surface.

## Verification limits and repository state

- I made no file changes.
- I ran no build or test suite.
- The working tree remained clean.
- `git diff --check` reports six added lines in `leavewar/state/store.ts` because that whole tracked file uses CRLF; inspection found no substantive trailing-space defect.

