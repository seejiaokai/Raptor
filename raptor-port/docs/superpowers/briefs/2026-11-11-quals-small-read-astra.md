# Two small Quals fixes — Astra's blind read (11 Nov 26, chat 64, job 3)

Reader: Astra (the Codex command line, model gpt-6-astra, reasoning high, read-only sandbox). Blind to the other reader; told not to open the handoff file, the evidence sheet's folder or the pictures. Brief: `2026-11-11-quals-small-read-brief.md`, fed whole as the prompt. Under review: `git diff 24a75372d 7765901d1` (the branch head was `ae996bffb`, notes and pictures only after `7765901d1`). Run 06:56 to 07:06 on 11 Nov 26, exit 0. The report below is as it arrived. Its dispositions: the evidence sheet, `raptor-port/docs/handpass/2026-11-11-quals-small.md`.

---

**Three findings: two behaviour gaps and one stale contract. I would return this for correction.**

I reviewed the requested comparison, `24a75372d → 7765901d1`. The checkout is on the named branch at a later commit, but its source, browser tests and contract file match the requested review target. No files changed, committed or pushed. I did not open the prohibited folders, handoff or another reader’s report; no handoff block appeared.

I ran two small, in-memory checks against the actual effect/handler bodies. They confirm the logic described below, but are **not browser proof**. No build or browser suite ran.

All source references below are under `raptor-port/`.

**1. P2 — A second finger on the pinned headings can reorder a column while the first finger remains down.**

**Failure sequence:** Admin, 402×874. Open Quals → Edit → Edit quals. Scroll down until the pinned headings show, and sideways until two qualification headings are reachable. Put the first finger on one heading. Put a second finger on another pinned heading, move that finger sideways, then lift only that finger.

The second finger can select the landing column and commit the first finger’s drag. It should cancel the column drag when the gesture becomes a pinch, as the table’s own heading does.

**Cause:** The new forwarding at `src/ui/QualsPage.tsx:1142–1143` connects pointer presses and moves, but misses the companion pinch handling:

- `onDown` ignores a non-primary finger without cancelling the existing drag: line 602.
- `onMove` accepts either finger: lines 636–646.
- Any document `pointerup` finishes the drag: lines 648–684.
- The cancellation is called by the pinch controller at line 748, but that controller listens on `.qwrap` at lines 715–716. The pinned row is its sibling, not its descendant: lines 1118–1140.
- `src/ui/pinchzoom.ts:479–485` attaches the initiating touch listeners only to the supplied surface.

**Evidence:** Executing the extracted handlers in memory produced a column-move request when the non-primary finger moved and lifted. The first finger had not lifted.

**Compared with main:** The pinned row cannot initiate a drag on main, so this mistaken write is newly reachable. The real table already has the pinch-cancellation connection that the new surface lacks.

**Exact fix:**

1. Track the pointer ID that starts the column drag.
2. Before returning for a second touch pointer, cancel the active column drag.
3. Accept drag moves and successful releases only from the initiating pointer.
4. Route `pointercancel` to cancellation, not the successful-drop handler.
5. Connect the pinned row to the **same pinch controller**, including its cancellation callback. One concrete approach is a shared page-level touch listener with an explicit start predicate requiring a touch to originate inside `.qwrap` or `.qfixed`; retain non-passive touch listeners and exclude the toolbar/filter.
6. Test both fingers starting on the pinned row, and one starting there with the other outside it.

**Missing test:** “Pinned heading: adding a second finger cancels reorder; either lift order writes no column order.” Assert unchanged order, unchanged Undo depth, no lift/landing marks, and normal table zoom where a pinch is accepted. Run with and without scroll-driven animations.

**2. P2 — A filtered-out request loses its only chance to bring the row into view.**

**Failure sequence:** Admin, 1000×700 or 402×700. Suspend and enable a pilot to produce “Check his quals.” On Quals, enter a filter that excludes him. Press “Check his quals,” then clear the filter with his row below the visible area.

The prompt disappears. Initially there is no target row or outline. Clearing the filter restores the outline, but the page never goes to him.

**Cause:** `src/ui/QualsPage.tsx:352` marks the request spent **before** finding its row at lines 353–354.

**Evidence:** The extracted effect, run first without the row and then with it present and out of view, gave:

| Version | Trips after the row appeared | Outline restored |
|---|---:|---|
| Main | 1 | Yes |
| Reviewed fix | 0 | Yes |

**Ruling:** The builder’s reading is **not supported by D672**. That ruling conditions movement on visibility; it does not say that an absent row spends a request. D284’s full row also describes a way straight to the returning man’s Quals row. Neither prescribes filter-clearing policy. Deliberately cancelling a hidden request would therefore be an owner decision, not a consequence of those rulings.

**Compared with main:** Main also fails to reveal him immediately through an excluding filter, but it makes the deferred trip when the filter is cleared. This change removes that recovery.

**Exact fix:**

1. Look up the row before assigning `backWent.current`.
2. If the row does not exist, return without spending the request.
3. Once it exists, restore the outline.
4. If this request is already spent, return.
5. Mark it spent, then apply the existing visibility check and conditional scroll.
6. Keep the existing rule that a newer request replaces the previous target.

This preserves the previous deferred reveal while preventing repeated trips after a successful visibility check. Automatically clearing the filter would be a separate behaviour choice.

**Missing test:** “A request hidden by the filter makes its one trip when revealed, then later redraws leave the page alone.” Cover the admin prompt, the member’s welcome prompt while already on Quals, Undo and Redo.

**3. P3 — Another live contract still says pinned headings cannot drag.**

`docs/ui-contracts.md:5520–5522` still says the frozen mirror carries no drag handlers and headings must be dragged on the real table.

**Concrete consequence:** A maintainer following the Edit quals contract gets the opposite instruction from the corrected frozen-header contract at line 3654.

**Compared with main:** The sentence was accurate on main; the new implementation makes it false.

**Exact fix:** Replace those sentences with the shared-handler behaviour, including the table-based frame measurement and sideways scroller. Retain historical wording only where explicitly marked as historical. Repeat the subject search for “mirror,” “pinned,” “heading,” and “drag,” rather than only the backlog ID.

**Check that would catch it:** A subject-based contract reconciliation. A new runtime test is unnecessary for this wording correction.

**Coverage, starting with the specialised surfaces**

| Object or surface | Required visible sign and gesture | Read result |
|---|---|---|
| Pinned moving headings | Admin in Edit quals: lifted column, one landing target, reorder and Undo | Connected to the shared pointer handlers; second-finger handling missing. `QualsPage.tsx:601–684,1142–1159`. |
| Pinned still name corner | Sortable name heading; no qualification drag | It draws the same heading builder, clipped to the name column. The name has no `data-col`. No new drag door found. Lines 159,1174–1179. |
| Real table headings | Existing column drag in Edit quals | Same handlers and writer. Lines 679–680. |
| Initials, Flight, CAT, Remarks headings | Existing sorting where offered; no qualification reorder | Only qualification headings receive `data-col`. Lines 158–188. |
| Heading’s remove control | Must not start a drag | Explicit exclusion at line 605. Pinned remove remains inactive, as on main. |
| Pilot, WSO and Personnel target rows | Outline on the whole row; conditional reveal | Both row renderers retain the target attribute. Lines 236,280,353–360. |
| Filtered-out target | No row to paint yet; request must have a defined disposition | Finding 2. |
| Group-heading row | Scrolls away; no mirrored drag door | Deliberately excluded from mirrors. Lines 191–197,1154–1159. |
| Lift and landing overlays | One frame over the real column; one current landing target | Shared frame and landing path. Lines 631,646,1003–1010. |
| Admin outside Edit quals | No reorder | Current-mode gate and absence of draggable markup. Lines 445,452–455,603. |
| Member, including admin in member view | Own-row editing only; no column-order control | Same admin gate; no new bypass found. `state/perms.ts:94,205,359–367,582`. |
| Guest or signed-out viewer | No column-order write | No new role path introduced; settings updates remain admin-only. Same permission references. |

**Answers to the nine questions**

**1. Every request and its lifetime.** I found one local setter, `checkBack`, and two production callers of the external focus setter:

- Admin “Check his quals”: `QualsPage.tsx:1114 → 324–328`.
- Member “Check my quals”: `WelcomeBack.tsx:23–32 → state/view.ts:506–507 → QualsPage.tsx:336–340`.
- Undo **and** Redo of a person change: `state/undo-wire.ts:194–197,254–259`, through that same external request.
- Clearing the request and resetting the session are not new asks: `view.ts:507,1062`.

Column-order Undo is a settings change, so it opens Quals without requesting a man’s outline: `undo-wire.ts:212`.

A second request for the same man creates a new object and gets another visibility check. An external request made before mount survives until Quals mounts; the page is conditionally mounted in `Shell.tsx:700–701`. Seat selection and the request are updated together. Neither edit mode excludes people from the table.

I found no new duplicate-trip path from an ordinary rerender or StrictMode effect replay: the request identity remains stable and the spent ref survives effect replay. A later request supersedes an earlier unconsumed request; the external request is a single slot, not a queue. That was already true on main. Filtering is the concrete exception described in finding 2.

**2. What no longer runs.** Subsequent repaints still restore the outline but skip the visibility check and scroll. That includes repaints caused by pin measurements and zoom updates. I found no separate caller that relies on the old repeated scroll to complete a normal initial reveal. Table content is produced synchronously, and the opening scroll-to-top effect precedes request processing: `QualsPage.tsx:335–360,453–455`.

I cannot certify clearance at every size. The existing visibility check is passed the **real** heading, not the pinned mirror. Once that real heading is above the fold, `onscreen.ts:43–50` does not account for the mirror’s height. Centring also does not explicitly reserve bar space on a very short screen. These are older geometry limitations, not newly introduced findings.

Missing browser check: 844×390, maximum table zoom, target near the top/bottom, with a taller top bar; request the row and assert its resting rectangle clears both bars. Repeat after a viewport-height change. Do not infer success from a scroll call.

**3. Undo and Redo against D672.** The trip is conditional, not unconditional: `QualsPage.tsx:360` calls `rowOnScreen`. Both directions use the same landing path, including navigation from another page. After the first visibility check, later redraws are free of the old resnap.

I found no new direction-specific omission. Filtered targets are finding 2. The older “All → person’s seat view” change can itself rearrange the screen before visibility is judged; this fix does not introduce it.

**4. Shared drag, identity and lifecycle.** Columns are identified by stable keys, not position: `QualsPage.tsx:506–513,606,621`. Sorting/filtering changes people, not those keys; removing a column removes it from the shared list. Frame measurement uses the actual table and actual column, even above the fold: `lift.ts:55–59`. Edge scrolling finds `.qwrap` from that real column: `QualsPage.tsx:634`, `edgescroll.ts:25–34`. The mirror follows that scroller through the existing browser animation or scroll listener.

I found no new wrong-column or double-listener path. Page cleanup removes native listeners and clears the forwarding ref: lines 702–709. However, the second-finger connection is missing, as finding 1 explains.

Escape is not wired to this column-drag cancellation, and `pointercancel` uses the successful-drop handler. These mechanisms already exist on main’s real-table drag. Disappearing pinned markup also does not itself cancel the shared drag; the document release listener remains active. These require explicit cancellation tests.

Touch handling does **not** distinguish a plain swipe from a drag after a threshold. `scheduler/05-quals.css:214` sets `touch-action:none` on editable qualification headings from the start, for both copies. Thus the premise that the real heading leaves ordinary swipes alone is not true. This is unchanged CSS, not a newly added scroll suppression.

**5. Shut doors.** I checked the renderer, current-mode gate, permission rules and settings command mapping and found no new member or read-mode reorder route. The pinned name corner cannot start one. The remove control is excluded before lift; its pinned click still does nothing because the pinned click handler only sorts: `QualsPage.tsx:605,1144–1146`. Main does the same.

**6. Copies and readers.** There are three heading renderings: the real table, moving pinned table and clipped still-corner table. All call `qualsHead` with the current shared list: `QualsPage.tsx:282,1159,1179`.

The write and downstream paths remain shared:

| Reader | Evidence |
|---|---|
| Quals table and both mirrors | `QualsPage.tsx:301–302,453,1159,1179` |
| Export headings and values | `QualsPage.tsx:1017–1027` |
| Saved column order | `engine/qualcols.ts:71–76` |
| Undo/Redo restoration | `state/people-settings-commit.ts:114–117,168–176` |
| Leave War qualification catalogue | `leavewar/state/raptorRoster.ts:110–118`; `leavewar/sync.ts:2181–2182` |
| Leave War counter choices | `leavewar/ui/CounterForm.tsx:228–241` |
| Group labels and qualification names in history | `leavewar/ui/Matrix.tsx:1749`; `state/changelines.ts:577` |

Removed-but-held qualifications remain appended to the Leave War catalogue intentionally; qualification order does not reorder the war’s independently configured groups.

I found no separate pinned-drag writer or stale downstream reader introduced by this change. Reload, Export and Leave War results were not exercised.

**7. The seven tests.**

| New test | What it establishes | Expected result on main, by reading |
|---|---|---|
| Admin prompt, desktop and phone — `geometry.spec.ts:6244` | Later tick does not resnap; outline remains | Both should fail at the retained-scroll assertion |
| Undo, desktop and phone — line 6281 | First-row Undo stays at the top; later tick/sort does not resnap | Both should fail after the later tick |
| Desktop pinned drag — line 6332 | Same resulting order as real-table drag; frame geometry, target, cleanup, Undo, tap/remove exclusions | Should fail when pinned drag produces no frame/order |
| Phone pinned drag — line 6419 | One-finger reorder and Undo at one size | Should fail at the pinned landing target |
| Unit test — `quals.test.tsx:1256` | One scroll call per request, including a repeated request for the same man | Should fail at the first unrelated repaint |

Those are expected failures, **not an observed red-on-main run**.

No existing assertion was weakened: the browser-file replacement is its type import; the tests are appended.

The tests can remain green with both behaviour findings. Further missing tests are:

- **“Every opener reveals once”**: member welcome, Redo, other-page Undo, repeated request and StrictMode mount.
- **“D672 at the pinned boundary”**: row wholly visible, partly behind the mirror, above and below view; compare position before and after both directions.
- **“Pinned drag cancellation”**: second finger, Escape, pointer cancellation, release outside, and pin disappearing.
- **“Pinned edge carry”**: hold at each edge until an initially hidden destination appears, at zoom 0.5 and 2.
- **“Pinned drag readers agree”**: reorder → Export → Leave War choices → reload; then fresh reorder → Undo/Redo and compare again.
- **“Outline is painted”**: computed border/shadow on every cell and the frozen name-cell edge, rather than class presence alone.
- **WebKit coverage**: the new helper unconditionally creates a CDP session at line 6198, so these tests cannot simply be rerun as WebKit tests.

**8. Records.** The corrected frozen-header and drag paragraphs describe the ordinary one-pointer path accurately, but do not establish complete gesture parity. The outline paragraph accurately describes spending the request on the first repaint; it overstates successful reveal when that repaint has no target.

Finding 3 is the remaining directly contradictory contract. Older comments also remain inaccurate: `QualsPage.tsx:1130–1137` describes a mirrored group row and sorting as the mirror’s only interaction; lines 70–75 describe obsolete persistence/state mirroring. I found no additional new test name asserting that pinned dragging remains unavailable. The backlog still lists both items open; closing records are outside this read.

**9. Tidiness, filed here only.** The shared handler ref and shared cleanup avoid a second drag implementation. I found no unnecessary duplicated behaviour in the changed executable lines. The new explanatory comments repeat the bug story in several places. `backWent` also misleadingly means “request consumed,” even when no trip happened; finding 2 removes that mismatch for absent rows.

Older, in passing: pinned remove is inactive; the visibility helper misses the separate pinned header; All-view Undo changes seat view; Escape does not cancel the column drag; pointer cancellation can commit it.

The overall change warrants **FULL** checking because the new gesture writes saved column order. Shared rendering and a new gesture also apply; entitlement, publishing, role policy, warning logic and a new screen do not. This turn completed only the requested read and limited in-memory checks.

Walk: NOT DONE — prohibited by the brief.  
Rulings: none this session.

**Verdict: return for fixes to second-finger handling, hidden-row request consumption and the stale drag contract.**

