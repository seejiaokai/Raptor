# Astra plan red-team report

## Verdict

**REVISE BEFORE IMPLEMENTATION.**

I found **eight material gaps**: four high-severity functional defects, three medium-severity interaction/specification defects, and one verification-tier error. No files were changed and no application/tests were run; this was the requested read-only pre-build review.

The brief called the source simply `publish.ts`; the relevant production file is `src/engine/publish.ts`, which I included in the review.

## Findings

### ASTRA-01 — High — Frozen edit-page previews would show live-history dots and bubbles

**Evidence**

- The plan relies on `!inVersionLook()` and excludes only `.pv-frozen`: [plan line 100](/C:/Users/User/projects/Raptor-hist/raptor-port/docs/superpowers/plans/2026-09-28-hist-phone-by-item-plan.md:100).
- `inVersionLook()` is just the transient `PV` flag used while generating an HTML string: [html.ts line 47](/C:/Users/User/projects/Raptor-hist/raptor-port/src/ui/html.ts:47).
- By the time the post-render pass runs, `PV` has returned to false.
- Edit-week saved-plan/version previews persist in the DOM as `.day.preview`: [html.ts line 1544](/C:/Users/User/projects/Raptor-hist/raptor-port/src/ui/html.ts:1544).
- Those previews suppress seat `data-slot`, but retain address-bearing typed fields such as `data-bfld`: [html.ts line 1713](/C:/Users/User/projects/Raptor-hist/raptor-port/src/ui/html.ts:1713).
- `EditWeek` builds such previews through `dayPreviewHTML`: [EditWeek.tsx line 27](/C:/Users/User/projects/Raptor-hist/raptor-port/src/ui/EditWeek.tsx:27).

**Concrete failure scenario**

- Setup: Edit a formation callsign or remarks so it has history.
- Action: Open a saved plan or issued-version preview of that day, then open Changes/History.
- Expected: The frozen document has no live-history dot and no live bubble.
- Disproof: The preview’s typed field gains `data-hist`, or hover/tap opens a bubble describing the live working-copy history.

This is especially serious because the preview would look as though its frozen contents carried live provenance.

**Exact plan correction**

1. Stop using `inVersionLook()` as a post-render DOM guard.
2. Add one shared eligibility function in `histbubble.ts` that rejects any cell inside either `.preview` or `.pv-frozen`.
3. Use that function in all three paths:
   - dot decoration;
   - `cellOf()` before opening a bubble;
   - `findHistCell()` before returning a jump destination.
4. Keep the board’s `.pv-frozen` exclusion, but add the edit week’s persistent `.preview` exclusion explicitly.
5. Add component tests using real `dayPreviewHTML` markup, not a synthetic `.pv-frozen` wrapper.
6. Add browser checks for both a saved-plan preview and an issued-version preview: no dot, no bubble, and no list jump landing inside the preview.
7. Restore the live day and prove its dots and bubbles return.

---

### ASTRA-02 — High — The board’s wave-title detail is explicitly excluded despite H4/H5

**Evidence**

- H4 says **every detail with history** gets a gold dot, and H5 says a dotted detail opens its bubble: [plan lines 35–37](/C:/Users/User/projects/Raptor-hist/raptor-port/docs/superpowers/plans/2026-09-28-hist-phone-by-item-plan.md:35).
- The plan nevertheless says the board’s wave-title select gets no dot because the existing bubble cannot answer it: [plan line 243](/C:/Users/User/projects/Raptor-hist/raptor-port/docs/superpowers/plans/2026-09-28-hist-phone-by-item-plan.md:243).
- The board visibly renders that detail as `[data-wsel]`: [board.ts line 160](/C:/Users/User/projects/Raptor-hist/raptor-port/src/ui/board.ts:160).
- Changing it writes a real `wl:` history value: [board.ts line 1152](/C:/Users/User/projects/Raptor-hist/raptor-port/src/ui/board.ts:1152).
- The current bubble code knowingly classifies `wl` as having no board cell: [histbubble.ts line 151](/C:/Users/User/projects/Raptor-hist/raptor-port/src/ui/histbubble.ts:151).

This is exactly the “missing call site” the brief warned about. Existing bubble coverage cannot define the approved universe if it omits a visible, logged schedule detail.

**Concrete failure scenario**

- Setup: On the scheduler board, rename a wave.
- Action: Open History.
- Expected: The changed wave-title select has a gold dot; hover/tap shows its wave-label history.
- Disproof: The select remains undotted and silent while the same `wl:` line appears in the changes window.

**Exact plan correction**

1. Add `[data-wsel]` to `CELL_SEL`.
2. Extend `keyOf()` so `data-wsel="di.gi"` resolves to `wl:di.gi`.
3. Remove `wl` from `NO_BOARD_CELL`; the board now has a valid destination.
4. Include `select` in the replaced/typed-control dot styling and place its dot inside the bottom-right corner.
5. Verify the capture listener does not prevent the select’s ordinary open/change behavior.
6. Add tests for:
   - dot on the board wave-title select;
   - desktop hover bubble;
   - phone tap bubble without disabling selection;
   - a changes-window tap landing on the select;
   - no dot/bubble on the disabled select inside `.pv-frozen`.

Traffic remains a legitimate negative: it exists only in its modal and has no persistent schedule cell.

---

### ASTRA-03 — High — Personal Inputs and Unavailable rows cannot resolve their keyless history

**Evidence**

- `data-inprow` is converted into the synthetic key `iu:<iid>`: [histbubble.ts line 172](/C:/Users/User/projects/Raptor-hist/raptor-port/src/ui/histbubble.ts:172).
- Input-history writers store `iid`, dates and absence metadata but pass `null` as the history key: [changelines.ts lines 82–99](/C:/Users/User/projects/Raptor-hist/raptor-port/src/state/changelines.ts:82).
- `elogFor()` and `elogAllFor()` match only exact `r.key` values: [editlog.ts line 410](/C:/Users/User/projects/Raptor-hist/raptor-port/src/engine/editlog.ts:410).
- The proposed `elogKeySet()` contains only rows with keys: [plan line 96](/C:/Users/User/projects/Raptor-hist/raptor-port/docs/superpowers/plans/2026-09-28-hist-phone-by-item-plan.md:96).

Therefore `iu:<iid>` is never present. The row can neither receive a dot nor answer with a bubble, even for newly-created data.

**Concrete failure scenario**

- Setup: Add a personal input, edit its dates or remarks, then file it under Unavailable.
- Action: Open History and tap/hover the input row on the edit week or board.
- Expected: The row is dotted and the bubble shows that input’s history for that rendered day.
- Disproof: The row has no dot, or tapping it immediately hides/produces no bubble while its lines appear in All changes.

**Exact plan correction**

1. Replace the string-only lookup with a shared `historyAddressOf(element)`:
   - ordinary cells return their canonical/rid key;
   - an input row returns its `iid` plus the calendar date of its containing `.day[data-day]`.
2. Add `historyRowsForAddress(address)`:
   - keyed details retain the existing exact-key behavior;
   - input details match `r.iid === iid` or `r.iids.includes(iid)`;
   - input matches must also satisfy `rowTouches(r, renderedDate)`.
3. Build one memoised address index for the loaded week:
   - canonical schedule keys;
   - `iu:<date>:<iid>` tokens for every loaded date touched by each input row;
   - include every id in `iids`, not just the current `iid`.
4. Use this same resolver for dots and bubble contents.
5. Keep `findHistCell()`’s existing `iu:<iid>` jump contract separate so current list-jump behavior is not broken.
6. Test add, edit, move, medical cut, delete and filing changes on:
   - Personal Inputs;
   - Unavailable;
   - edit week;
   - board;
   - a multi-day input;
   - an input move whose history contains both old and new IDs.

No migration is needed; this corrects newly-written records and therefore is not excluded by D56.

---

### ASTRA-04 — High — The non-seat dot would overwrite existing AL tags

**Evidence**

- The plan states that every non-seat addressable cell has `::after` free: [plan line 81](/C:/Users/User/projects/Raptor-hist/raptor-port/docs/superpowers/plans/2026-09-28-hist-phone-by-item-plan.md:81).
- That statement is false. `areacell`, `timecell`, `rmkcell`, `intimes`, and `sb-rcell` already use `::after` for solid AL tags: [scheduler.css line 1756](/C:/Users/User/projects/Raptor-hist/raptor-port/src/ui/scheduler.css:1756).
- Other marked `span`, `b`, `i` and `div` elements also use `::after` for their AL tag: [scheduler.css line 1823](/C:/Users/User/projects/Raptor-hist/raptor-port/src/ui/scheduler.css:1823).
- Empty area/time cells already use `::before` for their placeholder: [scheduler.css line 1170](/C:/Users/User/projects/Raptor-hist/raptor-port/src/ui/scheduler.css:1170).

A pseudo-element cannot simultaneously draw the AL tag and the history dot. Depending on selector order, either the dot or the official AL tag disappears.

**Concrete failure scenario**

- Setup: Publish a day, edit an area, time, remarks, in-times or board remarks cell so it has both an amendment tag and history.
- Action: Open History.
- Expected: The AL tag remains intact and the separate gold dot is visible.
- Disproof: The AL tag disappears, changes into a dot, or the history dot is absent.

**Exact plan correction**

1. Retain seat `::before` for the outside-puck dot, with the drag-clone exclusion.
2. Do not use a pseudo-element or add `position:relative` for non-seat details.
3. Draw every non-seat dot—including `input`, `textarea`, `select`, contenteditable cells, input rows and chips—as a radial-gradient background layer inside the bottom-right corner.
4. Audit the affected focus/hover rules and change any `background:` shorthand that would erase the image to `background-color:` or an explicitly combined background.
5. Preserve all existing background colours and amendment outlines.
6. Add browser assertions for simultaneous:
   - `data-hist + data-alc`;
   - `data-hist + data-aln`;
   - seat history + OG;
   - seat history + AL;
   - warning ring, SANS edge and warning chip;
   - an empty area/time placeholder;
   - focus on a typed box;
   - a drag ghost.
7. Measure the painted dot and tag separately with computed pseudo/background styles.

This also removes the plan’s unresolved risk that adding `position:relative` to a non-seat cell changes the containing block of children inside it.

---

### ASTRA-05 — Medium — New posting and roster lines would be grouped under “The day”

**Evidence**

The item table assumes that:

- Quals records have `sect:'quals' + sub + fld`;
- Leave War records have `sect:'abs' + sub`;
- a posting or roster line without a day can stand alone: [plan lines 152–155](/C:/Users/User/projects/Raptor-hist/raptor-port/docs/superpowers/plans/2026-09-28-hist-phone-by-item-plan.md:152).

The actual new-data writers do something different:

- Posting-out/in lines have a date and `sect:'quals'`, but no `sub` or `fld`: [changelines.ts lines 277–305](/C:/Users/User/projects/Raptor-hist/raptor-port/src/state/changelines.ts:277).
- “Added to the roster” has today’s date and `sect:'quals'`, but no `sub` or `fld`: [changelines.ts lines 324–332](/C:/Users/User/projects/Raptor-hist/raptor-port/src/state/changelines.ts:324).

Both therefore fall through to the plan’s dated fallback, **The day**. The plan’s assertion that these are undated lines is factually wrong.

**Concrete failure scenario**

- Setup: Add a new person, then create or change his posting-out date.
- Action: Open All changes grouped by Item for the applicable week.
- Expected:
  - the roster line is under `Quals · <person>`;
  - the posting is under `Leave War · <person>`.
- Disproof: Either appears in the generic `The day` group.

**Exact plan correction**

1. Permit two narrow writer changes using existing `ELogRow` fields; do not introduce a schema version.
2. For every posting-out/in line, write:
   - `sect:'abs'`;
   - `sub:pid`;
   - `fld:'posting'`;
   - the existing date/wdate values.
3. For “added to the roster”, write:
   - `sect:'quals'`;
   - `sub:pid`;
   - `fld:'roster'`;
   - the existing date.
4. Leave ordinary Quals-detail records unchanged.
5. Update `itemOf` so these records enter their person-backed items through metadata, never by parsing their sentence.
6. Add writer tests first, then `itemOf` tests for posting set/change/take-back, posting in, and roster addition.
7. Apply D56 correctly: do not migrate old demo rows or add sentence-parsing compatibility.

---

### ASTRA-06 — Medium — The plan preserves old Who folding despite D345

**Evidence**

- D345 explicitly says **every group open by default**, then separately says **Who keeps its sittings**: [scheduler decision D345](/C:/Users/User/projects/Raptor-hist/.claude/rules/decisions/scheduler.md:42).
- The plan keeps the old “fresh groups open, otherwise first group” behavior for Who: [plan lines 180–182](/C:/Users/User/projects/Raptor-hist/raptor-port/docs/superpowers/plans/2026-09-28-hist-phone-by-item-plan.md:180).
- Current code implements that older D167 behavior: [ChangesWindow.tsx line 162](/C:/Users/User/projects/Raptor-hist/raptor-port/src/ui/ChangesWindow.tsx:162).
- D90 says the later ruling wins.

“Who keeps its sittings” preserves the grouping unit; it does not preserve the superseded initial folding rule.

**Concrete failure scenario**

- Setup: All changes contains three old Who sittings and no fresh lines.
- Action: Select Who.
- Expected: All three sittings are open until the reader folds them.
- Disproof: Only the first sitting is open.

**Exact plan correction**

1. State that I7 applies to both Item groups and Who sittings.
2. Replace the default-open calculation for every foldable group with:
   - explicit `CHGFOLD` value when present;
   - otherwise open.
3. Keep manual folds stable while the window remains open.
4. Keep one-entry Item groups ungrouped and without a caret.
5. Update the D167 text in `ui-contracts.md` under D201, explicitly noting that D345 supersedes only the default folding behavior, not sittings.
6. Test All changes and New to you, Item and Who, with fresh and non-fresh groups; all begin open and hand folds persist.

---

### ASTRA-07 — Medium — ALL AVAIL can completely cover the minimized phone bar

**Evidence**

- Both phone windows occupy the same left/right/bottom position and have the same 62vh expanded height: [scheduler.css lines 6363–6365](/C:/Users/User/projects/Raptor-hist/raptor-port/src/ui/scheduler.css:6363), [scheduler.css lines 6465–6467](/C:/Users/User/projects/Raptor-hist/raptor-port/src/ui/scheduler.css:6465).
- The last pressed window becomes z-index 411: [scheduler.css line 6400](/C:/Users/User/projects/Raptor-hist/raptor-port/src/ui/scheduler.css:6400).
- The minimized Changes bar lacks the expanded window’s pointer-capture call that raises it: [ChangesWindow.tsx lines 142–151](/C:/Users/User/projects/Raptor-hist/raptor-port/src/ui/ChangesWindow.tsx:142).
- The current two-window browser test is desktop-only.

**Concrete failure scenario**

- Setup: On a phone, open History and press Hide so its bar is at the bottom.
- Action: Tap an ALL AVAIL puck and then interact with that window.
- Expected: The History bar remains reachable, including Show and ✕.
- Disproof: `elementFromPoint()` at the centre of the History bar returns an element inside `.availwin`; the user must close ALL AVAIL to recover History.

**Exact plan correction**

1. Define the minimized bar as an edge-docked control, not an ordinary competing window.
2. On phone only, give `.chgwin.bar` z-index 412:
   - above both floating windows at 410/411;
   - below the bubble, drawers and modals.
3. Keep normal “last pressed is in front” behavior when Changes is expanded.
4. Restore `onPointerDownCapture` on the bar root so pressing it updates front ownership before Show expands it.
5. Add a phone browser test in both orders:
   - ALL AVAIL → History → Hide;
   - History → Hide → ALL AVAIL.
6. In each order, assert with `elementFromPoint()` that Show and ✕ are reachable, then operate both.
7. Include a short-height phone/landscape case because both controls are bottom-docked.

---

### ASTRA-08 — Medium — WALK is the wrong verification tier

**Evidence**

- The plan answers “saved data” No and selects WALK: [plan lines 257–264](/C:/Users/User/projects/Raptor-hist/raptor-port/docs/superpowers/plans/2026-09-28-hist-phone-by-item-plan.md:257).
- The item model is a new reader of the durable edit log; that log persists up to 2,000 rows: [editlog.ts lines 62–65](/C:/Users/User/projects/Raptor-hist/raptor-port/src/engine/editlog.ts:62).
- The bug-check order says a Yes to saved data—or how it is read—requires FULL: [bug-check-order.md lines 322–334](/C:/Users/User/projects/Raptor-hist/raptor-port/docs/bug-check-order.md:322).
- ASTRA-05 also requires adding metadata to newly-persisted rows.

This is not a migration finding. The issue is whether newly-created history is grouped identically after reload.

**Exact plan correction**

1. Change bug-check question 3 to **YES**: the change interprets durable stored history, and the corrected plan writes item metadata into new history rows.
2. Change the tier to **FULL**.
3. Add a save/reload scenario containing:
   - schedule-cell changes;
   - an input move with `iid/iids`;
   - Quals;
   - roster addition;
   - posting;
   - Leave War;
   - a paired schedule move.
4. After reload, assert the same item identities, titles, ordering, move count and Who sittings.
5. Include session reset/sign-out and week-return checks.
6. After the walk, perform the independent code reads required by FULL and give them the completed surface/door matrix.
7. Keep D56 in the reviewer briefs: no migration or compatibility work for demo rows.

## Coverage roll-call

| Production surface/object | Dot | Bubble/gesture | Result |
|---|---:|---:|---|
| Live Edit Schedule seats and ordinary keyed fields | Yes | Hover/tap | Sound after the CSS correction |
| Live scheduler board seats and ordinary keyed fields | Yes | Hover/tap | Sound after the CSS correction |
| Board wave-title select | Yes | Hover/tap/select remains usable | **Missing — ASTRA-02** |
| Personal Inputs and Unavailable rows | Yes | Bubble for that input/day | **Broken lookup — ASTRA-03** |
| Edit-week saved-plan/version `.preview` | No | No | **Would leak live history — ASTRA-01** |
| Board `.pv-frozen` preview | No | No | Correctly identified by the plan |
| Next-week peek | No | No | Correct: it has no live address keys |
| Aircrew palettes | No | No | Correct: not a schedule place |
| ALL AVAIL pucks | No | No | Correct for dots; phone window interaction missing |
| Drag clone/ghost | No | No | Correctly excluded; retain veil ownership |
| View-only schedule | No dots/bubbles | Changes window remains readable | Defensible under D338 |
| Traffic modal | No persistent schedule dot | Listed but not a schedule-cell bubble | Defensible |
| Published AL/OG/warning/SANS combinations | Yes, clear of existing marks | Yes | **CSS collision — ASTRA-04** |

## History writer and item-classification roll-call

| History source | Identity available | Planned classification | Result |
|---|---|---|---|
| `slots.noteChange`, `txtSet`, `publish.markEdit` with values | Stable row-anchored key | Formation/wave/duty/sim/programme/ground/note | Sound |
| Input add/edit/move/delete | `iid`, sometimes `iids`, date spans | Input by person/request | Item grouping sound; dot/bubble lookup broken |
| Quals detail | `sect + sub + fld` | Quals person | Sound |
| Leave War decision/ledger | `sect:'abs' + sub` | Leave War person | Sound |
| Posting in/out | Date + wrong `sect`, no `sub/fld` | Intended Leave War person | **Misclassified — ASTRA-05** |
| Added to roster | Date + `sect`, no `sub/fld` | Intended Quals person | **Misclassified — ASTRA-05** |
| Publish/withdraw/sign/undo/structural lines | Day or no stable item | The day or own line | Sound |
| Paired same-day seat move | Two keyed rows → one `CLine` | Both Item groups; once in Who/count | Sound |
| Cross-day move | Not paired across days | One line on each day | Sound |

## Required action-order checks

The final plan should explicitly walk these orders:

1. Open → Hide → Show → close.
2. Open → drag panel → Hide → Show; bar stays at the bottom and the panel returns to its dragged position.
3. Open → tap a list line → automatic bar → Show.
4. Open → Mark all seen:
   - OG and list “new” marks disappear;
   - history dots remain because the detail still has history.
5. Open on Edit Schedule → open/close board → History remains consistent.
6. Edit row → reorder row → dot follows its `rid`.
7. Open preview → no dots/bubbles → return to live day → dots/bubbles return.
8. Publish after an edit → AL tag and history dot coexist.
9. Change board day and change week while hidden.
10. Open ALL AVAIL before and after minimizing History.
11. Reload and return to the week.
12. Member opens from a day chip; admin opens from the top icon and board button.

## Explicit negatives

I checked the following and found the plan sound, subject to the findings above:

- **Typed-box dot inside the corner:** defensible. Replaced controls cannot draw a child outside themselves, and D345 requires a dot rather than the mock-up script’s temporary underline.
- **Phone-only hint:** defensible. The approved feature is “History on a phone,” while desktop uses hover rather than tap.
- **View-only bar wording:** defensible. D338 limits the schedule dot/bubble gesture to Edit Schedule and the board, so `Changes · N changes` avoids falsely promising dots on View-only.
- **Bar count:** correct as all listed changes, singularised; a paired move counts once.
- **Item default:** correctly changes to Item in `changesopen.ts`.
- **Newest item and newest sub-line ordering:** the proposed ordering follows D119 and D345.
- **Move representation:** two Item entries may safely share one `CLine`; the tab count and Mark all as seen can remain one. Each schedule place should still carry its own history dot.
- **Row identity:** stable `rid` anchoring is correct for reorder, rename and deletion fallback. `ridWriteKey` mints before new writes.
- **Copies and drafts:** templates and duplicated waves re-mint row IDs, while saved plans deliberately keep them. That is the correct boundary.
- **Old dropped/positional keys:** I did not report compatibility work; D56 excludes it when new writes are already row-anchored.
- **Week/page change:** current state resets close the changes window, including while minimized.
- **Dragged-panel restoration:** returning `null` for the minimized bar correctly lets phone CSS dock it while retaining the saved expanded box.
- **Post-render pass shape:** a memoised address index plus one scoped DOM pass is reasonable. Per-block swaps, board-day changes and ordinary no-write notifications already reach the post-render point. The measured performance requirement should remain rather than assuming the stated 1–3 ms.
- **Caret repaint guard:** I did not elevate this to a defect. Every visible door that changes History focus blurs/commits the active field first. Add a focused regression test, but the current production action paths do not establish a failure scenario.
- **Roles and doors:** member day chips, admin top icon, board History button, and read-only membership behavior remain consistent with D169/D171/D338.
- **No guest exposure, no View-only bubbles, no palette/peek dots:** correct.

## Simpler corrected design

The plan can become smaller and safer by centring it on one abstraction:

1. `historyAddressOf(element)` returns either:
   - a canonical schedule key; or
   - an input ID plus rendered calendar date.
2. `historyRowsForAddress(address)` is the single answer used by:
   - bubble display;
   - dot presence;
   - tests.
3. One memoised weekly address index contains schedule keys and input/date tokens.
4. Seats use `::before`; every non-seat control/cell uses one background-dot recipe. No non-seat pseudo-element ownership table or new containing blocks.
5. `itemOf` continues to use stable metadata. Add the two missing writer metadata fields rather than parsing frozen sentences.
6. Both Item and Who groups use one default-open rule.

That preserves the approved behavior while removing the two false assumptions at the centre of the present plan: “every history has a key” and “every non-seat `::after` is free.”

**Status: PLAN REQUIRES REVISION.**

**Walk: NOT DONE — this is a pre-build, read-only plan review; there is no implementation to drive.**

Prior Raptor memory was used only for repository/test-risk orientation; every finding above was re-established from the current checkout.

