## 1. Findings

**Four gaps remain.** These are source-derived findings on the frozen checkout; I did not run the app, builds or tests.

### F1 — Another formation’s edit replaces an unanswered question

**Steps:** Turn tracking On. On Edit Schedule, give formation A Mission `ACM` and Remarks `DS FOR EAGLE`. Leave Remarks so A’s question opens. Without answering, edit formation B on the same day to `DS FOR VIPER`, then leave its Remarks.

**Expected:** D535 says A’s question stays until answered, Later is pressed, its own context changes, or one of the stated dismissal events occurs. B’s edit does not change A.

**Code result:** B’s deferred edit handler calls `show()` unconditionally. Because B has a different identity, `show()` removes A’s question and inserts B’s. Both the week editor and Board use this controller. See [mission-role-offer.ts:160](C:/Users/User/projects/Raptor-sbs/raptor-port/src/ui/mission-role-offer.ts:160) and [mission-role-offer.ts:97](C:/Users/User/projects/Raptor-sbs/raptor-port/src/ui/mission-role-offer.ts:97).

**Provenance:** A gap in the first commit’s F2 coverage. The replacement path already existed; the new reconciliation preserves questions through ordinary edits but does not protect them from another automatic question.

**Fix:**

1. Before either automatic-offer path opens a question, reconcile any existing question.
2. If a valid question remains for another formation, retain it and suppress the new automatic question. Save B’s edit normally; its unanswered role remains reachable through Choose mission role.
3. Apply that check to both the text-edit path and the structural-edit path.
4. Add connected regressions in both editors: A asks, B gains a cue, A remains, answering writes only A, and B remains unresolved.

### F2 — Four confirmation windows still close after an inside-to-outside drag

**Steps:** In Inputs, start a new medical input without attaching a certificate and press Add/Save. In “No medical document”, begin selecting explanatory text inside the window, drag onto its dark surround, and release.

**Expected:** D538 says a window closes on its surround only when the press began there.

**Code result:** This confirmation still checks only where the click landed and dismisses through `onUpload`. The same omission exists in the medical-overlap, Upchit and OIL confirmations; their dismissal also loses any choices made in that confirmation.

The missed handlers are [DocConfirm.tsx:31](C:/Users/User/projects/Raptor-sbs/raptor-port/src/ui/DocConfirm.tsx:31), [MedClashConfirm.tsx:81](C:/Users/User/projects/Raptor-sbs/raptor-port/src/ui/MedClashConfirm.tsx:81), [UpchitConfirm.tsx:40](C:/Users/User/projects/Raptor-sbs/raptor-port/src/ui/UpchitConfirm.tsx:40) and [OilConfirm.tsx:112](C:/Users/User/projects/Raptor-sbs/raptor-port/src/ui/OilConfirm.tsx:112).

**Provenance:** Older faults left outside the third commit’s claimed coverage. Its scan at [outside.test.tsx:48](C:/Users/User/projects/Raptor-sbs/raptor-port/src/ui/outside.test.tsx:48) recognises only the old **id-based** handler spelling; these four use classes.

**Fix:**

1. Extend the shared helper to accept the actual surround element as well as an id. Require both click target and recorded press target to equal that element.
2. Route these four handlers through it using `e.currentTarget`; preserve their existing dismissal callbacks.
3. Add mounted checks for all four: inside press/outside release preserves the window and choices; an ordinary surround click dismisses.
4. Check their production entry routes from the Inputs form and input editor, including confirmations opened over the Board. Replace the narrow spelling scan with explicit coverage of every surround-dismissed window.

### F3 — History still displays a role change under “Leave War · [hidden id]”

**Steps:** Answer a formation’s Blue/Red question. Save that day as a template and apply it to an unpublished day. Open the changes window and inspect the copied role under both Item and Who grouping.

**Expected:** D534’s F3 requires the copied answer to be identified by its formation.

**Code result:** The first commit correctly fixes the stored sentence, but writes the formation id into `sub`. The visible History reader treats every keyless `sub` outside Quals as a Leave War person. It therefore produces a heading such as “Leave War · r…”, although the sentence beneath now contains the formation name.

See [changelines.ts:468](C:/Users/User/projects/Raptor-sbs/raptor-port/src/state/changelines.ts:468), [changesmodel.ts:192](C:/Users/User/projects/Raptor-sbs/raptor-port/src/ui/changesmodel.ts:192) and [changesmodel.ts:285](C:/Users/User/projects/Raptor-sbs/raptor-port/src/ui/changesmodel.ts:285).

**Provenance:** An older reader fault left uncovered by the first commit’s F3 repair. It affects newly copied answers and directly chosen answers.

**Fix:**

1. In `itemOf()`, handle `fld === 'mission-role'` before the generic person/Leave War branch.
2. Resolve the formation by its day and `sub` id. Use its callsign for the heading; if it has gone, extract the saved formation name preceding ` · mission role · `.
3. Keep grouping identity based on day and formation identity; never pass that formation id to the person-name lookup.
4. Extend the template regression through the mounted changes window. Assert correct headings in Item and Who grouping, with no Leave War label or hidden id. Repeat for a directly chosen answer.

### F4 — Changing days in the phone week does not dismiss the old question

**Steps:** Open Monday’s unanswered question in Edit Schedule’s phone week view. Swipe to Tuesday, let the day change settle, then swipe back to Monday.

**Expected:** D535 says moving to another day dismisses the question. Returning without another qualifying edit should not reopen it.

**Code result:** Week panning changes the displayed day through `setRosDay()`, which only assigns the day. The role target’s view stamp includes Board day and navigation generation, but neither changes on this within-week swipe. Monday’s question therefore remains and is still answerable on return.

See [view.ts:58](C:/Users/User/projects/Raptor-sbs/raptor-port/src/state/view.ts:58), [pan.ts:369](C:/Users/User/projects/Raptor-sbs/raptor-port/src/ui/pan.ts:369) and [mission-roles.ts:78](C:/Users/User/projects/Raptor-sbs/raptor-port/src/state/mission-roles.ts:78).

**Provenance:** An older navigation gap left uncovered by F2’s stated lifecycle coverage.

**Fix:**

1. When the settled displayed day changes on Edit Schedule with the Board closed, advance the navigation generation.
2. Let the existing notification reconcile and clear the old question; that generation change must also invalidate queued automatic offers.
3. Add a real phone-week navigation regression: Monday question → Tuesday → Monday leaves no question and creates no answer. Check the desktop day-step route too.

## 2. Explicit negatives

- I checked the latest-published Board Remarks repair: it retains the amendment attributes while omitting the schedule-edit key; I found no defect there.
- I checked ordinary week/Board Remarks and tracking-Off rendering: their existing amendment path remains intact.
- I checked unrelated timing edits: the new reconciliation refreshes the question’s target and button handlers.
- I checked answer-time guards: formation/context, day and role revisions, permission, session, tracking epoch and view are still checked.
- I checked Undo/Redo invalidation and Board/page/week/version changes: their existing invalidation paths remain present.
- I checked role-only writes: they enlist the separate role store and do not write the signed programme or clear its four sign-offs.
- I checked template capture/application: valid answers receive fresh destination identities; the new name lookup reads the installed destination. The stored sentence repair is sound.
- I checked all thirteen migrated handlers: templates, plans, drawer, document viewer, input editor, day details, Traffic, Insights, cancellation, Sort all and date picker call the shared helper.
- I checked that helper’s ordinary single-pointer sequence: an inside press prevents surround dismissal; a surround press permits it.
- I checked the shared modal sizing rules: dynamic height wins, the percentage fallback remains, and short windows retain content height at the bottom. I found no later override defeating these rules.
- I checked the added tests: they cover their named narrow cases, but do not cover the four failures above. I claim no test results from this session.

## 3. What I did not read, and why

I did not open other checkouts, later branches or reviewers’ report files. I did not audit the whole underlying Insights feature, unrelated engine behaviour, or the separate Tracker/Leave War implementations beyond their surround structure.

A preliminary external memory-index search was a boundary mistake. It exposed project summaries; I opened no linked reports and excluded that lookup from the findings.

**Walk: NOT DONE — the brief requires a read-only review without builds or test suites.** Nothing was changed.

**Rulings: none this session.**

## 4. Confidence

**Moderate confidence that these commits introduce no serious data or authority defect; no all-clear because four coverage gaps remain.** Running the exact failure sequences, especially on physical iPhone Safari, could change that assessment.

