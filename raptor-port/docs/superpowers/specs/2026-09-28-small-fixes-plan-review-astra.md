# Astra report — small-fixes batch plan red-team and walk design

## Verdict

The plan is not safe to build unchanged.

The most serious problems are:

1. Part C still couples sentinel membership to payable work. Implemented literally, the assumed hour can become payable OIL.
2. Part E treats the global `inp.acc` field as though it were a week-local row location. Setting it to `g` from an off-screen stash can create pending changes and remove sign-offs through navigation alone.
3. Part D1 changes the semantics of every toast in the app to solve one publish-specific collision. It would join contradictory success/failure messages.
4. Part G1 missed two production ISO-date refusal messages, and its proposed structural test cannot see tooltip attributes or toasts.
5. Parts B and A omit important overlay interactions: the drag filter also shadows the hover-reason bubble, and the two default floating windows can completely cover one another.

This report is a static, read-only review. I made no changes and ran no writing tests.

---

# Job 1 — ranked findings

## ASTRA-SF-01 — Critical — Part C can pay OIL for the guessed hour

### Evidence

`dayOilWork` currently has one sentinel expansion path:

- `src/engine/oil.ts:137-163` builds payable `OilWork` spans.
- `src/engine/oil.ts:188-196` calls `expandAll(win, item)` and then passes every returned person to `put`, which creates a payable schedule span.
- `src/engine/oilev.ts:510-520` uses that same callback to record the frozen `sent[item]` crowd.
- `src/engine/oilev.ts:601-607` runs `dayOilWork` again for the money calculation, resolving the sentinel from the frozen `ev.sent`.
- `src/engine/oil.ts:250-299` rejects missing-end rows in every relevant family—sim, duty, ground and Common Programme—because `w2` returns `null`.

The plan says to “record the crowd … while crediting nobody” (`small-fixes-batch-plan.md:133-140`), but it does not say how to separate those outcomes. Today the same callback both records membership and mints the payable spans.

D31 and D360 are explicit: the one-hour default is for availability only; it must never invent credit.

### Concrete failure scenario

- Setup: On an OIL-earning Saturday, put `ALL AVAIL` on a Ground Programme row starting at 18:30 with no end.
- Action: Publish the day, then run the Leave War credit pass.
- Expected: The count is worked out for 18:30–19:30 and frozen, but nobody receives OIL from that row. The window and OIL mode say, “No OIL worked out — this row has no end time.”
- Disproof: Any person behind that puck receives a schedule `OilWork` span, an FO/HO figure, a green earning state, or a Leave War credit.

The same test is required for sim, duty and Common Programme rows.

### Exact plan correction

1. Extend the sentinel callback contract so it distinguishes the scheduling window from the payable window. One workable shape is:

   ```ts
   expandAll(scheduleWin, item, payable): string[]
   ```

2. For a row with valid written start and end:

   - `scheduleWin` is the written window.
   - `payable` is `true`.
   - Resolve the crowd, store it in `sent[item]`, and create spans.

3. For a row with a start but no end:

   - `scheduleWin` comes from the existing `VCONF.openEnd` default.
   - `payable` is `false`.
   - Resolve and store the crowd, but do not call `put` for any returned person.
   - Do not call `reach`; the row must not gain an OIL switch.

4. During `oilDayWork(day, ev)`, return the frozen crowd for the assumed scheduling window, but keep `payable=false`, so replay of the issued evidence still creates no work spans.

5. Apply that split at every sentinel-capable callsite:

   - sim seats, passengers and extras;
   - duty primary and extras;
   - hand-entered ground primary and extras;
   - Common Programme primary and extras;
   - accepted-request sentinel handling in `oilev.ts`.

6. Add direct downstream assertions, not just chip assertions:

   - `oilEvidence.sent[item]` contains the expected crowd;
   - `oilDayWork` contains no spans from the open-ended row;
   - `oilEarnedWork` contains no resulting credit;
   - Leave War balance is unchanged;
   - the issued version retains the frozen crowd after live availability changes.

7. For a row with no start, do not manufacture a `sent` entry. Add a renderer-only unknown `?` door when the row has a sentinel but no usable scheduling window. Do not encode it as `unrecorded`; that state already means an older issued document whose membership was never frozen.

---

## ASTRA-SF-02 — High — Part E collapses week-local row location into global filing state

### Evidence

The plan proposes that a request with a row on a stashed week be reconciled to `inp.acc='g'` (`small-fixes-batch-plan.md:195-203`).

But `acc` is global, while the row is week-local:

- `src/state/store.ts:565-579` deliberately clears `g` on a week switch and re-derives it from the loaded week.
- `src/engine/slots.ts:579-584` currently sets `g` only when a row is present in loaded `DAYS`.
- `src/engine/slots.ts:613-620` can return an accepted day only from loaded `DAYS`.
- `src/engine/publish.ts:406-423` puts the global `inp.acc` value into every covered day’s filing fingerprint and signature binding.
- `src/engine/slots.ts:598-607` can overwrite the result with `r` from the loaded stash’s `unaccepted` set.
- `src/engine/inputs.ts:528-543` and `src/engine/events.ts:61-71` use `acc` to decide whether the input itself speaks or defers to a landed row.
- `src/engine/oilev.ts:329-400` already has a separate stashed-week row-state search for OIL claims.
- `src/ui/inputedit.tsx:891-925` has another off-week row scan for edit/delete refusal.
- `src/state/person-delete.ts:243-289` has its own loaded- and stashed-week sweep.

The proposed “four readers” are therefore not the complete reader set.

Most seriously, `dayFilingFingerprint` will change from `''` to `g` solely because a week was loaded and the new helper discovered another week’s row. On a published day, that is a pending change and therefore removes all four sign-offs under D103. That is the exact P2-REV2-05 navigation-only hazard named by the brief.

### Concrete failure scenario

- Setup: A timed request spans Sunday of week 1 and Monday of week 2. Its one landed row is on Sunday and is stashed with week 1. Monday has already been published with its own filing fingerprint and four sign-offs.
- Action: Move between week 1 and week 2 without editing the request or either schedule.
- Expected: Monday’s pending count and sign-offs do not move merely because of navigation. Its card may say where the physical row stands, but the document comparison is unchanged.
- Disproof: Monday gains a pending item, loses signatures, changes warning behaviour, or changes the request from live to dormant/accepted solely on navigation.

### Exact plan correction

1. Do not make an off-week row set the global `inp.acc` field to `g`.

2. Replace `srcOnStashedWeek(id): boolean` with one shared, pure location resolver, for example:

   ```ts
   landedLocation(id): {
     kind: 'loaded' | 'stashed'
     week: string
     di: number
     iso: string
     state: 'active' | 'cx' | 'info'
   } | null
   ```

3. Make the helper:

   - scan live `DAYS` first;
   - skip the loaded week’s stale stash entry;
   - scan other readable stashes;
   - return `null` for a never-visited week with no stash;
   - never mutate `INPUTS`, `DAYS`, or a stash.

4. Use that resolver in all relevant readers:

   - `acceptInput`: refuse a second row and name the existing date/week.
   - `acceptedDay` or a new `acceptedLocation`: let UI wording find the row without requiring global `acc==='g'`.
   - `landedOnUnloadedWeek`: replace its private scan.
   - Inputs card status and `accCtl`: say “On Sun 19 Jul’s programme”; its Undo must refuse and name the week to load.
   - `rowsLeftOut`: treat an off-week location as an existing row.
   - OIL `landedStanding`: consume the shared resolver rather than keeping a second stash parser.
   - Leave War claim/day projection: use the physical location and state, not `acc==='g'`.
   - `relandInputs`: do not set an input to `r` merely because the current week’s old `unaccepted` set names it while its physical row exists elsewhere.
   - `person-delete.ts`: retain its authorised stashed-week write sweep, but test it against the same row-location contract.

5. Keep `reconcileLandedAcc` and `reconcileDayFiling` week-local:

   - set `g` only when the matching row is in loaded `DAYS`;
   - clear `g` only when no loaded row warrants it;
   - never use an off-week stash lookup to change the scalar.

6. Re-file `r → g` only when a whole-day replacement has actually restored that request’s row into loaded `DAYS`. That part of the plan is sound and satisfies D98/D175; it must not generalise to stashed rows.

7. Add invariants after every navigation, plan switch and load:

   - no request has two physical rows;
   - navigation alone does not change `dayFilingFingerprint`, pending count or sign validity;
   - a timed request still speaks on covered days where its physical row is not present;
   - OIL claim standing agrees with the actual stashed row;
   - a never-visited week is not treated as holding a row.

---

## ASTRA-SF-03 — High — Part D1 globally batches unrelated and contradictory toasts

### Evidence

The plan changes the one global toast so all messages in the same browser task join (`small-fixes-batch-plan.md:144-153`).

That affects much more than publishing:

- `src/state/sched-commit.ts:513-529`: publish produces the primary message and then invokes the Leave War publish gate. This is the collision that needs joining.
- `src/leavewar/sync.ts:1181-1213`: the gate already collects its own blind-OIL, no-period and live-bid facts into one explicit message.
- `src/ui/inputedit.tsx:1169-1173`: intentionally queues a warning in a microtask so it replaces the caller’s generic success toast and remains visible.
- `src/state/quals-write.ts:61-73`: dependent qualification changes speak inside the transaction.
- `src/state/quals-write.ts:89-98`: if that transaction is refused or rolled back, it then says “That did not save.”
- `src/state/sched-commit.ts:460-475`: the generic command wrapper can likewise produce a failure toast after a writer spoke.
- `src/ui/toast.ts:7-50`: today the last message wins and its reading time is calculated immediately.

With global batching, a rolled-back qualification edit can say the equivalent of “NAAR removed too · That did not save.” The first half describes a change that did not survive.

A zero-delay timer is also an unstable test boundary under fake timers: if a test does not advance the timer between gestures, logically separate calls may remain in the same pending batch.

### Concrete failure scenario

- Setup: Cause a qualification dependency side-effect, then make the command fail through the existing test refusal hook.
- Action: Press the qualification control once.
- Expected: The final visible result says only that the save failed; it must not claim a dependent qualification was removed.
- Disproof: One joined toast contains both the rolled-back side effect and the failure.

### Exact plan correction

1. Keep ordinary `toast()` replacement semantics unchanged.

2. Add an explicit scoped batching seam, not automatic macrotask batching. For example, add `HOOKS.toastBatch(fn)` with a headless default of `fn()`.

3. The UI implementation of `toastBatch` should:

   - collect messages only while the supplied callback runs;
   - de-duplicate identical messages;
   - preserve call order;
   - retain the strongest tint;
   - flush synchronously when the callback returns;
   - clear its collector in `finally`, including on exceptions.

4. Wrap only the successful publish writer plus `publishGate` in that scope in `commitPublish`.

5. Do not batch:

   - general scheduler commands;
   - qualification dependency messages;
   - input-edit microtask warnings;
   - Leave War operations that already compose their own sentence;
   - failure or rollback epilogues.

6. Add a refusal case: a publish that does not mint a version must show only its refusal and must not flush a stale partial batch.

7. Add the Unpublish success sentence only after `commitUnpublish` returns success. The first-tap warning about credits already bid against remains a separate earlier interaction.

---

## ASTRA-SF-04 — Medium — Part G1 missed production ISO-date messages, and its structural test cannot see all visible copy

### Evidence

The plan lists the absence-door messages at `sync.ts:471`, `:482` and `:511`, but misses the approval door:

- `src/leavewar/sync.ts:329`: `` `${it.date} is on a locked week — not approved` ``
- `src/leavewar/sync.ts:334`: `` `${it.date} already holds leave or a medical at that time — not approved` ``

These answers travel through the same production door and can be shown to the user.

The proposed test renders sheets and checks their visible text for ISO strings (`small-fixes-batch-plan.md:253-257`). That cannot cover:

- the two door-result messages above;
- `Matrix.tsx:688-689` PO hover `title` strings, because `title` is not in `textContent`;
- any `aria-label` or input value;
- toast copy.

### Concrete failure scenario

- Setup: Create a locked schedule week matching a Leave War bid date.
- Action: Approve the bid from the day sheet.
- Expected: The refusal names the date as “17 Jul 26,” not `2026-07-17`.
- Disproof: The toast or refusal line contains raw ISO.

### Exact plan correction

1. Add `shortDate(it.date)` to the approval refusals at `sync.ts:329` and `:334`, as well as the already listed decide/remove refusals.

2. Keep the engine’s returned machine fields in ISO; format only the user-facing reason string.

3. Split the structural proof into:

   - rendered text assertions for sheets and banners;
   - explicit `title`, `aria-label`, placeholder and value assertions;
   - door-result tests for approve, decide, remove and move refusals;
   - a browser hover check for the PO corner tooltip.

4. Inventory the actual output boundary rather than every ISO in the DOM: `data-testid` and internal values are correctly machine-readable and should not make the test fail.

---

## ASTRA-SF-05 — Medium — Part B’s filter also shadows the hover-reason bubble

### Evidence

- `src/ui/drag.ts:84-115` appends `.dwhy` as a child of the ghost and toggles `.haswhy`.
- `src/ui/scheduler.css:1292-1295` lifts the ghost’s overflow and gives `.dwhy` its own shadow.
- A CSS `filter` on the ghost composites the entire rendered subtree, including that child.

Therefore `filter: drop-shadow(...)` on `.dragimg.lift` or `.tdghost.lift` will also give the reason bubble the ghost’s deep shadow, on top of `.dwhy`’s own shadow. It can also require the filtered source to be re-rasterised whenever the target changes and `.dwhy` is inserted or removed.

The plan’s state list also misses:

- base `.puck.wfoc`, `scheduler.css:3153`;
- `.puck.hl`, `scheduler.css:1391`;
- the combined `.wfoc.echo.advf`, `scheduler.css:3159`.

`sel` does not add a ring, and the green OIL ring is not draggable; those are valid exclusions.

### Concrete failure scenario

- Setup: Drag a red-, amber-, grey-, dashed- or warning-focused puck over a target that produces a hover reason.
- Action: Hold the drag still over the target.
- Expected: The puck retains its own state ring, cyan lift and one neutral depth shadow. The reason card has only its small local shadow.
- Disproof: The reason card has a second large black silhouette, any ring disappears, or target-to-target movement introduces new repaint spikes.

### Exact plan correction

The smallest safe CSS design is already available in the existing veil:

1. Remove the depth `box-shadow` from `.tdghost.lift,.dragimg.lift`.

2. Do not put `filter` on the ghost.

3. Put the neutral depth shadow on the ghost veil itself:

   ```css
   .tdghost.lift::before,
   .dragimg.lift::before {
     box-shadow: var(--lift-box), 0 8px 20px rgba(0,0,0,.6);
   }
   ```

   The veil owns a separate `box-shadow` property, so the cloned puck’s ring cannot replace it. The `.dwhy` child is not inside the pseudo-element, so it does not inherit that shadow.

4. Test mouse and touch ghosts with:

   - plain;
   - `boxred`;
   - `boxdash`;
   - `boxdot`;
   - `warn`;
   - `warn hard`;
   - `warn note`;
   - `me` unflagged and flagged;
   - `hl`;
   - base `wfoc`;
   - `wfoc advf`;
   - `wfoc echo`;
   - `wfoc echo advf`.

5. For each, test both with and without `.dwhy`.

6. Measure continuous movement and target-change movement separately; the latter adds/removes the bubble.

---

## ASTRA-SF-06 — Medium — Part A does not solve the two-window state and uses an indirect timing trigger

### Evidence

Both windows default to the same top-right origin:

- `.availwin`: `right:16px; top:96px; width:212px`, `scheduler.css:6304-6310`.
- `.chgwin`: `right:16px; top:96px; width:380px`, `scheduler.css:6409-6416`.

If the Changes window is in front, it completely covers the narrower ALL AVAIL window. `floatwin.ts:24-30` says the pressed window comes forward, but a fully hidden window has no title bar to press.

The plan’s “one animation frame after each render” (`small-fixes-batch-plan.md:86-88`) is broad and indirect. The exact event is a change in the preview-bar container’s geometry. One frame also does not guarantee correction after later font/layout growth.

### Concrete failure scenario

- Setup: Open ALL AVAIL, then open Changes over a previewed board day.
- Action: Try to bring ALL AVAIL forward without closing Changes or reopening the count from the schedule.
- Expected: Both title bars—or another explicit fronting control—remain reachable.
- Disproof: ALL AVAIL is completely hidden.

### Exact plan correction

1. Add a stable clearance element, preferably the board warning/preview container rather than querying for a transient `.dprev-bar`.

2. Observe that container with `ResizeObserver`; use a small `MutationObserver` only if insertion/removal does not change its observed box reliably.

3. Re-place an unowned window when the actual clearance rect changes. Do not schedule a frame after every unrelated render.

4. Keep the current rule that a user-positioned or resized box is never moved automatically.

5. Maintain a small registry of mounted floating-window rectangles. When placing an unowned desktop window:

   - clear the preview bar first;
   - try a non-overlapping position immediately left of the other window;
   - if the viewport is too narrow, cascade them so both title bars and close buttons remain exposed;
   - never change a user-owned box.

6. Test both opening orders and both front orders.

7. Include all preview-bar shapes:

   - ordinary issued preview;
   - the taller “Discard N edits & load — confirm” state;
   - draft “Switch to this plan”;
   - View-only working-draft banner;
   - bar absent → appears while open;
   - bar grows while open;
   - bar disappears;
   - 1440×900, 1440×700, phone;
   - dragged and resized windows.

---

## ASTRA-SF-07 — Medium — Part D9 leaves the new `gord` identity undefined

### Evidence

Today `gord` is the shown order’s raw array positions:

- `src/engine/publish.ts:1237-1245`.
- `src/engine/order.ts:25-33` shows that `ri` changes when the raw ground array is sorted.
- `src/engine/canonical.ts:230-244` compares ground order using surviving `rid`s in effective display order.

The plan says only that `gord` “becomes that order’s identity” (`small-fixes-batch-plan.md:181-186`). If implementation retains `.map(x => x.ri)` after normalising the copy, Sort still changes `0,1` versus `1,0` and the reported defect remains.

### Concrete failure scenario

- Setup: Publish and sign a day whose raw ground rows are stored as 10:00 then 09:00, while the screen already displays 09:00 then 10:00.
- Action: Press Sort.
- Expected: Zero pending; all four sign-offs remain.
- Disproof: `gord` changes and the signatures disappear.

### Exact plan correction

1. Add one pure projection, for example `signatureDayView(day)`, which clones the day and replaces `ground` with `groundOrder(...).map(x => x.row)` without mutating live data.

2. Digest that projection.

3. Set `gord` to the ordered sequence of stable ground-row `rid`s, not positions. If an unminted row can reach signing, use a deterministic canonical fingerprint only as a guarded fallback.

4. Test:

   - automatic time order followed by Sort: binding stable;
   - hand order with `gman`: real order change invalidates;
   - no-start rows at the end: Sort-only storage normalisation stable;
   - equal-start rows: stable tie order;
   - time edit that changes displayed position: invalidates;
   - Common Programme Sort: invalidates only when its displayed order changes;
   - another section’s Sort: same rule;
   - returning to the exact issued display order restores the sign-offs.

The overall design—bind signatures to what the user sees—is sound once the identity is made explicit.

---

## ASTRA-SF-08 — Medium — Part G2 knowingly leaves two more obsolete move doors

### Evidence

Production uses `moveRecordsProblem` and `moveRecords`. Searches show:

- `shiftBid` and `moveAbsenceById` have test callers only.
- `moveCells` and `moveProblem` likewise have test callers only.
- `shiftBid` itself delegates to `moveCells`, `leavewar/state/store.ts:4046-4052`.
- `moveProblem` and `moveCells` are exported wrappers at `store.ts:4334-4342`.

The plan acknowledges that `moveCells` and `moveProblem` have no production callers, but defers their removal (`small-fixes-batch-plan.md:271-274`). D330–D335 make `moveRecords` the one move door, and D201 says overwritten-rule leftovers are cleaned in the same change.

### Concrete failure scenario

There is no present user gesture through these wrappers; that is precisely the problem. A later caller can accidentally choose a stale public API whose refusal and history behaviour is no longer the production rule.

### Exact plan correction

1. First port every behavioural assertion from all four wrappers to `moveRecordsProblem`/`moveRecords`.

2. Require the new tests to pass on today’s production door before deleting anything.

3. Search all source, probes, scripts and docs again.

4. Delete all four obsolete exports together:

   - `shiftBid`;
   - `moveAbsenceById`;
   - `moveCells`;
   - `moveProblem`;
   - private `dayDiff` if then unused.

5. Remove or rewrite every test and document mention.

6. Retain lower-level pure helpers only if `moveRecords` still uses them; do not keep an exported public facade alive solely through its own tests.

---

## ASTRA-SF-09 — Medium — Part D3 conflates two different callsign renderers

### Evidence

The week and View-only line use `.form .csmsn`:

- `scheduler.css:1115-1129`;
- `html.ts:1713`.

The phone board uses a different renderer:

- `board.ts:247-285` emits `.lin` and `.msn`;
- `scheduler.css:3970`;
- the phone grid gives the callsign a 36px track at `scheduler.css:5389`.

Therefore a change to `.form .csmsn` cannot fix the board, and a board padding/track change cannot fix the week’s inline `.ntx` ellipsis behaviour.

### Exact plan correction

1. Treat the week/View-only and board as two explicit CSS fixes sharing one six-character acceptance criterion.

2. Week/View-only:

   - make the dot a fixed flex/grid item;
   - give `.ntx` `min-width:0`;
   - put clipping/ellipsis on the actual text span, not on a parent containing an indivisible inline block.

3. Phone board:

   - widen the `.lin` track from the mission track’s flexible space, or reduce `.lin` horizontal padding/font together;
   - retain a minimum usable mission width;
   - keep the six-letter callsign on one line.

4. Test editable and read-only markup separately at 390 and 360px. Test the board in narrow mode and `.sb-wide`.

5. Confirm names longer than six letters still indicate truncation and never wrap.

---

## ASTRA-SF-10 — Low — Part F1 needs an explicit reason split before delegating

### Evidence

`switchDraft` returns `false` for several different reasons:

- no permission/edit mode;
- missing day;
- missing plan;
- already live, after speaking its own sentence;
- failed `draftSelect`.

See `src/ui/board.ts:1513-1543`.

The current banner handler produces “That plan is no longer available” only when its direct `draftSelect` fails, `src/ui/interactions.ts:957-975`. The plan says to delegate while keeping that sentence only for a gone plan, but does not specify how to distinguish the false results.

### Concrete failure scenario

- Setup: Leave a stale banner button for a plan which is now already live.
- Action: Press “Switch to this plan.”
- Expected: One sentence: the plan is already live.
- Disproof: The app additionally or instead says the plan is no longer available.

### Exact plan correction

1. Before calling `switchDraft`, resolve the target plan from `dayDrafts(di)`.

2. If it does not exist, say “That plan is no longer available” and stop.

3. Otherwise call `switchDraft` and do not add any second sentence, regardless of its return value.

4. Retain the interaction-level permission and protected-week gates so an inert read-only button does not claim the plan disappeared.

5. Test missing, already-live, successful, protected and unauthorised cases.

---

## ASTRA-SF-11 — Low — Part F3 proposes a non-authoritative history fallback

### Evidence

The pending model already carries authoritative issued request data:

- `src/ui/pendlist.ts:161-175` obtains `it.was` or `snap.inp[id]`.
- The filing-only branch instead calls `requestWords`, which consults only live `INPUTS` and a ground row, `pendlist.ts:99-118` and `:317-322`.

That is the actual missing connection. Parsing or searching change-history wording is unnecessary for an issued deleted request and may select a later edit of the same input.

Under D174/D176, a request the issued record never held, later added/filed and then deleted/taken off, should normally net to no pending item.

### Exact plan correction

1. Pass `di` and the pending item’s `was` record into `requestWords`.

2. Name a deleted filing change from:

   - `it.was`;
   - otherwise `snap.inp[id]`;
   - otherwise the issued/live ground row.

3. Use change history only for the independent “who changed it and when” fields already handled by `editRowOf`, not as the record’s identity source.

4. Add a negative test: a request absent at issue, filed after issue and then removed/deleted produces zero pending—not a history-named ghost line.

5. Update `drafts.ts` to use the same pure request-name helper rather than parsing prose from a log line.

---

# Required coverage map

| Part | Production sign and gesture | Writers/readers/downstream consumers | Roles and meaningful orders |
|---|---|---|---|
| A | ALL AVAIL count opens its window; History opens Changes; title bars drag/resize/raise; preview buttons remain tappable | `floatwin.ts`, both window components, `SchedBoard` preview container, CSS desktop/phone layouts | Admin/member/view-only where the underlying surface is readable; window→preview and preview→window; ALL AVAIL→Changes and reverse; dragged→bar growth |
| B | A picked-up puck visibly retains its state ring, cyan lift, depth and hover reason | mouse `setDragImage`, touch `tdArm`, `ghostXf`, `.dwhy`, every ring selector | Admin editing; mouse and touch; reason before/after target change; working copy only |
| C | Count/`?` chip opens ALL AVAIL; availability tab names assumed hour; OIL tab/mode gives refusal | `dayOilWork`, evidence `sent`, frozen snapshot, summary/chip, Avail window, OIL mode, `oilEarnedWork`, Leave War credit | Scheduler for OIL controls; all readers for availability; open row→publish and publish→live change |
| D1 | Publish/Unpublish toast | publish engine, command boundary, publish gate, global toast | Scheduler; first publish and AL; success/refusal; publish then unpublish |
| D3/D4 | Callsign text and AL tag on week, View-only and board | two callsign renderers; time/area amendment pseudo-elements | Edit, View-only and board; desktop/phone; before/after AL |
| D9 | Four signature chips remain or disappear consistently with “N pending” | `groundOrder`, canonical digest/diff, Sort writers, `currentBind`, `signBoundOk` | Scheduler/signers; sign→Sort and Sort→sign; hand order, ties, no-start |
| E | Request card status, Accept/Undo wording/refusal, pending count, OIL/Leave War agreement | accept/unaccept, location resolver, reconcile/load/plan switch, Inputs page, filing fingerprint, rows-left-out, OIL claim projection, person delete | Admin/scheduler/member-own-input; accept in week 1 then visit week 2 and reverse; publish before/after; plan switch |
| F | Plan-switch sentence, request Undo label/toast, named pending request | banner/menu doors, `switchDraft`, `accCtl`, interaction handler, `pendlist`, changes window | Scheduler; same day/other day/other week; live/missing plan; board/edit week/Changes |
| G | Human dates, move doors, clash-strip direction, Viewing As chip, locked input styling | every listed sheet plus approve refusals/tooltips; production `moveRecords`; Chrome strip/CSS/input modal | Admin/member/view-as; phone/desktop; bid clash vs Input clash; read-only vs editable |

---

# Job 2 — running-app walk scenarios

The starred scenarios are the first three I would walk.

## A — floating windows

### A1 — Window already open, preview bar appears

- Setup: Desktop 1440×700. Open the board on a published day in its live working copy. Open ALL AVAIL.
- Action: Preview Original.
- Screen must show: ALL AVAIL below the entire preview bar; “Back to live copy” and “Load onto working copy” remain clickable; the window bottom remains on screen.
- Wrong if: the bar is covered for even the settled state, the window is clipped, or the user must close it.

Repeat in reverse: preview Original first, then open ALL AVAIL.

### A2 — Armed preview bar grows

- Setup: Give the live day unpublished edits, preview an issued version, and open Changes.
- Action: Press “Load onto working copy” once so the bar grows to “Discard N edits & load — confirm” plus “Keep editing.”
- Screen must show: the unplaced window moves below the taller bar.
- Wrong if: either new button is under the window.

Reverse: arm the confirmation first, then open the window.

### A3 — Both windows together

- Setup: Open ALL AVAIL and Changes at desktop width.
- Action: Open them in both orders and press each title bar.
- Screen must show: both title bars/close buttons remain reachable; pressing one raises it.
- Wrong if: the front Changes window completely hides ALL AVAIL.

### A4 — User placement is respected

- Setup: Drag and resize each window.
- Action: Start/arm/end a preview and resize the browser.
- Screen must show: preview changes do not move the user-owned box; browser narrowing clamps only enough to retain the title bar.
- Wrong if: it jumps back to the default corner or is stranded off-screen.

### A5 — Other surfaces and phone

Repeat on:

- Edit Schedule day preview;
- View-only working-draft preview;
- 1440×900;
- 390×844 phone.

The phone window remains a bottom panel and the preview bar remains at the top of the scroller.

---

## B — drag ghost

### B1 — Every draggable state, mouse and touch

Through app controls, create pucks carrying each reachable state:

- unflagged;
- amber warning;
- hard red;
- grey note;
- solid red;
- dashed red;
- dotted red;
- “this is you”;
- search highlight;
- base warning focus;
- advisory focus;
- echo focus;
- advisory echo focus.

Drag each on desktop with the mouse and on phone with touch.

The screen must show the state ring, cyan lift and neutral depth together. Wrong if one replaces another.

### B2 — Hover reason

- Setup: Pick up a flagged puck.
- Action: Hover over a target that gives a placement warning.
- Screen must show: one amber reason card under the puck, with its own small shadow.
- Wrong if: the reason card receives the large ghost shadow, is clipped, or the original ring disappears.

Move between warning and non-warning targets repeatedly. Wrong if each pointer movement—not merely target change—causes visible stutter.

### B3 — Published-state boundary

- Setup: Publish the day so a puck has an AL tag.
- Action: Return to the live working copy and drag it.
- Screen must show: AL remains a tag, warning remains a ring, lift remains the cyan/depth treatment.
- Wrong if: the amendment becomes another ring or hides severity.

An issued preview remains read-only and offers no drag.

---

## C — open-ended sentinel rows

### ★ C1 — Availability count without OIL money

- Setup: OIL-earning Saturday. Add a Ground Programme row at 18:30 with no end. Put ALL AVAIL on it.
- Action: Open the count and then the OIL tab.
- Screen must show: a numeric count; “18:30–19:30 · no end time, an hour assumed”; and “No OIL worked out — this row has no end time.”
- Wrong if: there is no chip, no reason, an OIL switch appears, any puck is shown as earning, or Leave War gains credit.

Repeat for:

- sim seat;
- sim passenger/extra;
- duty desk and extra;
- Common Programme primary/extra.

### C2 — Publish freezes membership but not guessed pay

- Setup: Perform C1 and publish.
- Action: Change one member’s availability afterward.
- Screen must show: issued preview keeps its published count; working copy shows the new count and one pending change; sign-offs fall on the working copy.
- Wrong if: issued membership changes live, pending does not appear, or either version pays the assumed hour.

Reverse order: publish a normal timed row, then remove its end in the working copy. The working copy must show the assumed crowd/no-credit state pending against the issued timed state.

### C3 — No start at all

- Setup: Put ALL/ALL AVAIL on a row with no start and no end.
- Action: Press the `?` chip.
- Screen must show: the existing “no usable start and end times” explanation; no list of invented people; no OIL switch.
- Wrong if: no door exists, `0` pretends to be a measured count, or the state is labelled as old/unrecorded publication.

---

## D — amendment small fixes

### D1 — Publish and Unpublish wording

- Setup: Weekend day with a valid schedule, no Leave War period and a condition that produces the blind-OIL warning.
- Action: Publish.
- Screen must show: one toast containing the successful publication fact plus the gate’s warning facts, without duplicates.
- Wrong if: the publication fact is swallowed or unrelated messages are appended.

Then Unpublish through its confirmation. The success sentence appears only after the actual unpublish.

Also force a refused qualification or scheduler write. Wrong if a rolled-back side effect is joined to “That did not save.”

### D3 — Callsigns

At 1440, 390 and 360px, enter five- and six-letter callsigns and one longer name.

Check:

- Edit Schedule week;
- View-only Schedule;
- narrow board;
- `.sb-wide` board.

Five and six letters must be complete and single-line. The longer name must visibly truncate rather than wrap or masquerade as a different callsign.

### D4 — AL tag

- Setup: Publish a change to a time field as AL1.
- Action: View it on the phone week, View-only and board.
- Screen must show: complete `AL1`, inside the viewport and not clipped to `AL`.
- Wrong if: only `AL` appears, the tag covers the time illegibly, or the desktop placement changes.

### ★ D9 — Signature binding follows displayed order

- Setup: Publish a day with 10:00 stored before 09:00 but displayed in time order; apply all four sign-offs.
- Action: Press Sort.
- Screen must show: `0 pending`; all signatures remain.
- Wrong if: any signer disappears.

Then cover:

1. Hand-order two rows: pending appears and signatures disappear.
2. Put them back exactly: pending returns to zero and signatures return.
3. Change a start time so displayed order changes: signatures disappear.
4. Sort equal-time rows: stable ties do not change.
5. Sort with a no-start row: it remains at the end without false invalidation.
6. Sort Common Programme and one other section: a visible order change invalidates; a storage-only no-op does not.

---

## E — cross-week request rows

### ★ E1 — Sunday/Monday boundary, no second row and no navigation amendment

- Setup: Create one timed request spanning Sunday of week 1 and Monday of week 2. Land it on Sunday. Publish/sign the relevant Monday state needed for the comparison.
- Action: Load week 2.
- Screen must show: the request card says its row is on Sunday’s programme; Accept does not offer or refuses with the exact location; Monday’s pending/signature state does not change merely from navigation.
- Wrong if: a second row is created, `acc` changes the published filing fingerprint, or sign-offs fall.

Repeat in reverse: land on Monday first, then visit Sunday.

### E2 — Same request, OIL and Leave War

- Setup: Use an OIL-asking multi-day request with its row on the other week. Give it an answer and make the landed row active, then cancelled.
- Action: Load the opposite week and inspect the OIL question/credit and Leave War day.
- Screen must show: both apps agree with the actual stashed row state.
- Wrong if: one says active while the other pays as unlanded, or `acc` alone decides.

### E3 — Stale loaded-week stash

- Setup: Land a request, leave and return, take its row off in the live loaded week.
- Action: Delete the request.
- Screen must show: deletion is allowed; the stale copy of the loaded week’s stash does not produce “Load this week first.”
- Wrong if: its own stale stash blocks it.

### E4 — Plan restores a dormant row

- Setup: Park a plan containing the request’s row. Take the live row off so the request reads removed. Switch the parked plan in.
- Screen must show: the loaded row and card agree that it is on the programme; deletion removes that row; pending reflects only the actual difference from the issued version.
- Wrong if: the card remains “taken off,” Accept does nothing, or deletion leaves an orphan.

Reverse: restore a plan without the row after it is present. It must reconcile the loaded filing without touching another week’s row.

### E5 — Never-visited week

- Setup: Create a spanning request whose first date lies in a week never opened and therefore never stashed.
- Action: Visit the adjacent week.
- Screen must show: no claim that a physical row exists in the never-visited week.
- Wrong if: absence of a stash is treated as an off-week landing.

### E6 — Person deletion

- Setup: A person has a spanning request and an off-week stashed row on/after the deletion cutoff.
- Action: Delete the person through Admin → Users.
- Screen must show: the authorised sweep removes the request row from the loaded/stashed programme consistently, or refuses atomically if the stash cannot be read.
- Wrong if: the person disappears but their linked row survives, or a kept pre-cutoff input is accidentally parked as `r`.

---

## F — request-door wording

### F1 — Banner and menu say the same act once

- Setup: Published day with a parked plan carrying pending differences.
- Action: Switch to it first through the Plans menu, restore, then through the preview banner.
- Screen must show the same sentence, including the correct pending or “matches ORIG — nothing pending” tail.
- Wrong if: the banner produces a second competing sentence.

Also check missing plan, already-live plan, protected week and unauthorised role.

### F2 — Undo names the actual day

- Setup: A multi-day request card is visible on Monday but its row stands on Tuesday.
- Action: Inspect and press Undo from Monday.
- Screen must show: “Undo · Tue,” a title naming Tuesday’s ground programme, and a toast saying the row came off Tuesday’s programme.
- Wrong if: it merely says “Undo” or implies Monday.

Same-day Undo remains plain. Other-week Undo refuses before calling `unacceptInput` and names the week/date to load.

### F3 — Deleted filed request remains named

- Setup: Publish a day containing a named request filed under Unavailable. Delete it afterward.
- Action: Inspect the board pending list, Edit Schedule and Changes → To go out.
- Screen must show: “Ranger · Meeting · under Unavailable → deleted,” with the same identity everywhere.
- Wrong if: any surface says “A request.”

Negative order: add/file a request only after publication, then take it off/delete it. It must return to zero pending rather than creating a history-derived ghost line.

---

## G — Leave War and absence leftovers

### G1 — Date voice

Through real controls, inspect:

- one-day bid sheet;
- moved-from line;
- Leave from Raptor/OIL credited sheet;
- member’s award sheet;
- Posted out/in sheets and notes;
- one-day selection sheet;
- move refusal banner;
- PO tooltip;
- approve, decide and remove refusal messages;
- remarks sheet;
- Raptor input-window title.

Single-day headers use their chosen day-first header form; dates inside prose use `17 Jul 26`; no user-visible raw ISO remains.

Check desktop/phone, admin/member, text, tooltips and toast/refusal output. Machine attributes remain ISO.

### G2 — One production move door

Exercise every production gesture:

- one-day sheet Move;
- day-list row Move;
- selected range Move;
- dragged block Move;
- bid and approved absence;
- locked landing refusal;
- wrong/stale record refusal;
- next-war refusal;
- reload and original-origin trail;
- one Undo step.

All must reach `moveRecordsProblem`/`moveRecords`, produce one history line, and write nothing after refusal. No UI or probe should reference the retired wrappers.

### G3 — Absence presentation

1. Create bid-versus-leave clash: strip says “resolve on the sheet.”
2. Create schedule-earned OIL versus Inputs-page leave: strip says “change the leave on the Inputs page.”
3. View as a member with a long name at 390 and 360px: “VIEWING AS” remains complete; only the name ellipses.
4. Open another member’s input read-only: fields are visibly muted, have no active highlight and use the default cursor.
5. Repeat the member two-row phone case: neither leave row paints over the frozen balance column.

---

# Explicit negatives — checked and found sound

- Part A’s distinction between an unowned window and a user-dragged/resized box is sound. Adding only `top` and `max-height` would not satisfy the current ResizeObserver’s “user box” test, which checks inline width/height.
- The phone floating-window layouts are already separate bottom panels and should not be moved by the desktop clearance code.
- A filter is not clipped by the filtered element’s own `overflow:hidden`; the Part B problem is the filter including `.dwhy`, not self-clipping.
- Mouse and touch ghosts already share the one-transform rule.
- The OIL green ring is correctly excluded from draggable-state coverage because OIL Earn mode refuses an ordinary drag.
- The Part C investigation correctly identifies that the count is a scheduling fact and D31 only prohibits guessed money. The error is in the proposed separation mechanism, not the owner’s ruling.
- Freezing the assumed-hour crowd at publication is correct under D44; a later crowd change should be pending.
- A no-start `?` chip is safe if it is explicitly an unknown/refusal door. It must not be encoded as a measured zero or as legacy “unrecorded” evidence.
- Normalising the signature digest to effective displayed ground order is the right design. It needs stable row identity and the wider Sort matrix described above.
- Skipping the loaded week’s stale stash entry is correct.
- Treating a never-visited week with no stash as containing no landed row is correct.
- Re-filing `r → g` after a whole-day replacement is correct when the row is actually present in loaded `DAYS`.
- No general write into a stashed week is needed for the ordinary request-card fix. The existing person-delete command is a separate authorised atomic sweep.
- Delegating the preview-banner switch to `switchDraft` is correct once the missing/already-live results are distinguished.
- Stored Leave War dates should remain ISO. Part G1 is a display-only change.
- D300 is already respected: the post-in/post-out buttons need not repeat the date from the field.
- Leaving AL8’s colour unchanged pending the owner’s answer is reasonable because the numbered tag remains unambiguous.
- I have not reported migration or old-demo-data-only damage. The findings above can recur with newly created data and current gestures, so D56 does not exclude them.

