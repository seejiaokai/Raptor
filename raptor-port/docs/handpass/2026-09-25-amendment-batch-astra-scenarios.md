# Astra review — amendment batch

## Verdict

**BLOCKED as written.** The plan has four high-consequence defects:

1. Item 14’s “one leftover per place” rule misreads D109. A same-box replacement removes one person and adds another: **two people changes**, not one.
2. Item 1 deliberately leaves a dashed seat outline on View-only’s working-draft face, contradicting “a changed puck gets a tag, never a ring” and “View-only included.”
3. Item 6’s filing restore is unsafe for multi-day requests because `INPUTS.acc` is week-global while the operation loads one day.
4. The new `units` count is not copied into a retired issuance, so Unpublish can lose the frozen human count from the immutable record.

The D103 `pd` signature-binding axis is sound in principle: it binds signatures to the complete pending comparison and naturally restores them when the day returns exactly to the signed state. Its required plan/Unpublish/Undo coverage is missing.

Review snapshot: committed HEAD `f0518eb3` plus the live, unfinished work for items 8–10 and 12. I treated that working tree as evidence, not as completed code. I edited nothing and ran no tests.

## Production coverage contract

| Item | Required visible sign or gesture |
|---|---|
| 1 — puck tags | Solid ALn tag for an issued changed puck; hollow dotted ALn tag for a waiting puck. Flying/SC, programme, duty, sim, ground and applicable input/claim pucks; Edit week, board, View-only issued face and View-only working-draft peek; desktop and phone. Warning edges must remain untouched. |
| 2 — board warning rings | Every ordinary board puck that has the week’s amber, grey, thin-red, dashed or dotted warning must show the same ring. Do not introduce ordinary warning rings into OIL mode or override exempt-seat special handling. |
| 3 — Signed line | Under the day head on Edit week and View-only, and above the board sign-off boxes. Issued face=current version; working draft=current published base; old preview=previewed version. Roles on desktop, names only on phone. Admin and member must see the same issued names. |
| 4 — template refusal | Edit-week Templates opener, board Templates opener, `pickDayTpl`, direct `applyDayTpl`/probe path. Published day stays byte-for-byte unchanged and every visible door explains why. Saving a template remains allowed. |
| 5 — two-state marker | Edit week and board working copy only: “Not yet signed” while any signature is missing/invalid, then “Not yet published” when all four are valid. Never on View-only’s issued face or a frozen preview. |
| 6 — version load | “Load onto working copy” from Edit week and board preview. Restore content and that version’s filing state, leave the issued pointer unchanged, and finish with zero pending when loading the current issued version. |
| 7 — signature invalidation | Every pending source: crew/placeholder membership, seat/list changes, text/time/area/remarks, structure/order, request filing/times, Quals/posting, OIL. Each plan owns its signatures. Revert restores; Unpublish clears live and parked plans; Undo/Redo must not revive spent signatures. |
| 8 — pending list | Button on the published working copy’s pending chip in Edit week and board, desktop and phone. Never on View-only, draft days or previews. Net rows only, internally scrolling, outside-tap/Escape close, tappable where a truthful target exists. |
| 9 — attribution | “Admin” or “Member” from the session edit log, never the “View as” person. “Earlier” when a keyed change predates the log. No fabricated attribution for genuinely keyless structure/order/OIL actions. |
| 10 — history bubble | Board History mode: desktop hover and phone tap still operate the underlying editor. A long story scrolls internally; a pinned jump survives scrolling until dismissed. |
| 11 — phone keyboard | Phone board only, History both on and off. While typing in a low field, the board and focused schedule remain visible above the real keyboard; the page behind remains locked and no blank band appears. |
| 12 — current-surface jump | Edit History and pending-list rows use one jump. From Edit week, remain on the week and step to the day; from board, remain on board and pin the bubble. Missing versus surface-only details get truthful, different messages. |
| 13 — ORIG seal | Same A1 seal from the shared `verTagHTML` on Edit week, board and View-only; desktop and phone; issued and working-draft faces. It must not resemble AL4 white, an alert or a button. |
| 14 — one count | One authority for day head, board strip, day-info panel, sign-off status, Amendments pending line, plan-switch message, load discard confirm, publish toast, stored AL history and pending-list rows. Eligibility stays based on the non-empty canonical delta. |

The object roll-call must include:

- Flying FCP/RCP seats, including SC and multi-aircraft formations.
- Programme `who[]`.
- Duty holder and `more[]`.
- Sim FCP/RCP, `pax[]` and `more[]`.
- Ground `who` and `more[]`.
- Placeholders and duplicate placeholder occurrences.
- Times, areas, area-times, remarks, labels, notes, stores, in-times, traffic, flags and cancellation composites.
- Row/aircraft/formation/wave/block add, delete and reorder.
- Input filing states `fresh`, `g`, `u`, `r`.
- OIL decisions and placeholder membership.
- Current plan, parked plans, current issued version, older preview, View-only working-draft peek, Unpublish and Undo/Redo.

## Ranked failure scenarios

The order begins with the least-shared and most specialised surfaces.

1. **P0 — phone board keyboard, item 11.**  
   Setup: phone-sized board, long day, focused remarks/time field near the bottom, History off and then on. Action: open the real iPhone keyboard and type, scroll, change day, close keyboard. Expected: focused field and surrounding schedule remain above the keyboard; one board scroller; background remains fixed. Disproof: blank band, board behind the keyboard, page leak, lost focus, or wrong scroll position.

2. **P0 — View-only working-draft puck, item 1.**  
   Setup: published puck with a pending change and a dotted/dashed warning. Action: member opens View-only, then chooses Working draft. Expected: hollow ALn tag and the original warning ring; no amendment outline around seat or puck. Disproof: dashed neutral seat outline, missing ALn tag, or altered warning stroke. The plan currently specifies the disproof at [scheduler.css](</C:/Users/User/projects/Raptor/raptor-port/src/ui/scheduler.css:1702>).

3. **P0 — multi-day filing restore, item 6.**  
   Setup: one request spans Monday–Wednesday and is accepted onto Tuesday; publish Monday and Tuesday; remove or change Monday’s working copy. Action: load Monday’s current issued version. Expected: Monday returns to zero pending without clearing Tuesday’s valid `g` landing or changing Tuesday’s signatures/count/OIL. Disproof: Tuesday row becomes fresh/dangling, Monday remains filing-pending, or another day changes silently.

4. **P0 — same-box replacement, item 14.**  
   Setup: published SODB contains Warden. Action: replace Warden with Reaper, with neither appearing elsewhere. Expected under the literal D109 units: two rows—Warden removed, Reaper added—and count 2. Disproof: one combined “people box changed” item. The committed implementation currently collapses this at [canonical.ts](</C:/Users/User/projects/Raptor/raptor-port/src/engine/canonical.ts:413>).

5. **P0 — several people leave one list, item 14.**  
   Setup: published programme row contains A, B, C. Action: remove A and B. Expected: two person changes. Disproof: one change because both departures share one programme “place.”

6. **P0 — move through an added/deleted row, items 8 and 14.**  
   Setup: Warden is on an existing duty; add a new row and move him into it. Repeat by deleting his original row while placing him on a survivor. Expected: structural add/delete plus a truthful “Warden: old → new” move. Unmatched people contained solely in a new/deleted row remain covered by the structural item. Disproof: correct total with a false “Warden removed” row, or no move line because one row did not survive.

7. **P0 — D103 across plans, item 7.**  
   Setup: publish, create Plan A and Plan B, sign both independently. Action: change Plan B, revert it, switch A/B repeatedly. Expected: B invalid while changed, B restores when reverted, A never borrows B’s signatures and remains governed by its own content. Disproof: cross-plan bleed, signatures not restoring, or a changed plan publishing on another plan’s four names.

8. **P0 — Unpublish and Undo/Redo, item 7.**  
   Setup: signed Plan A and parked signed Plan B; publish an AL. Action: Unpublish, Undo, Redo, switch plans. Expected: Unpublish clears live and every parked plan; no sequence revives old signatures; republish requires four new sign-offs. Disproof: any green name returns from a parked plan or timeline restore.

9. **P0 — Signed line version identity, item 3.**  
   Setup: Original and AL1 have different signers; working copy also has new incomplete sign-offs. Action: inspect Edit live, board live, View issued, View working-draft peek, then preview Original and AL1. Expected: each line names the version on screen or the published base explicitly; never the working sign boxes. Disproof: any surface names the latest/current signers regardless of preview. Test both roles and widths.

10. **P1 — removal attribution and jump, items 8–9–12.**  
    Setup: remove a person from a surviving seat/list. Action: open pending list. Expected: Admin/Member and time from the keyed edit; row taps to the now-empty seat or owning row. A structural row deletion remains un-attributed and non-jumpable. Disproof: all removals are blank/disabled, as the plan currently says.

11. **P1 — surface-specific History jump, item 12.**  
    Setup: edit area, area-time, in-times, wave label, traffic and an ordinary seat. Action: open Edit History from the week and tap each; repeat from the board. Expected: `ar`, `at`, `it`, `wl` work on the week; ordinary cells work on both; board-only/week-only cases explain the other surface; traffic says it has no drawn cell. Disproof: week rows are disabled by the board’s exclusion list or the board opens from Edit week. The active work’s separate `weekJumpable` direction is correct and must remain.

12. **P1 — long History bubble, item 10.**  
    Setup: edit one detail 30 times. Action: desktop hover, move pointer from cell into list and wheel-scroll; phone tap, expand and finger-scroll. Expected: no disappearance while crossing into the list; underlying initial edit still occurs; scroll stays inside; pinned jump survives board scroll. Disproof: bubble vanishes at the boundary, board scrolls instead, or History makes the cell read-only.

13. **P1 — board warning-renderer roll-call, item 2.**  
    Setup: one day gives distinct pucks amber, grey, thin-red, dashed and dotted states across flying, SC, programme, duty, sim, ground and relevant input/claim renderers. Action: compare Edit week and board. Expected: matching strokes in normal rendering; OIL mode and exempt-own-rule branches retain their special behavior. Disproof: any board puck misses its ring or gains an inappropriate ordinary ring.

14. **P1 — every template door, item 4.**  
    Setup: published day with and without pending edits, with an armed seat. Action: try every template in the week menu, board menu, `pickDayTpl`, direct engine/probe. Expected: disabled/refused with one sentence; no content, filing, pending marks, arms, sign-offs or Undo entry changes. Draft day still applies. Disproof: any door applies, silently no-ops, or gives the old working-draft behavior.

15. **P1 — marker transition, item 5.**  
    Setup: published day, make one pending change. Action: observe with 0–3 valid signers, add fourth, invalidate one, restore it, publish. Expected: Not yet signed → Not yet published → Not yet signed → Not yet published → no marker. Disproof: wording follows change existence alone, appears on issued View, or disagrees between board and week.

16. **P1 — frozen count through retirement, item 14.**  
    Setup: publish a one-unit move whose canonical diff has two cells. Action: inspect every reader, Unpublish it, mark the retired issuance disclosed, Undo/Redo and reload. Expected: the immutable record retains `units:1` throughout. Disproof: retired/history count falls back to `diff.length === 2`. Current [retireIssued](</C:/Users/User/projects/Raptor/raptor-port/src/engine/publish.ts:796>) copies `diff` and `sign`, not `units`.

17. **P1 — filing-state four-way load, item 6.**  
    Setup separately with a version frozen at fresh, `g`, `u` and `r`; change each to another state. Action: load that version. Expected: exact frozen state, correct row presence, zero pending, one Undo restores the pre-load state. Disproof: general reconciliation converts a deliberate `r` to fresh, creates dangling `g`, or leaves a filing delta.

18. **P2 — ORIG seal collision, item 13.**  
    Setup: ORIG beside AL3, AL4, warning badges, long date and plan selector. Action: inspect all three surfaces at desktop and 390px. Expected: same compact A1 seal, no wrap, no AL/warning meaning. Disproof: white AL4 confusion, button affordance, clipping or differing renderers.

19. **P2 — pending popover behavior, item 8.**  
    Setup: enough mixed changes to overflow: moves, additions, removals, time, order, filing and OIL. Action: open from week and board; scroll; tap jump; Escape; outside tap; change day. Expected: list length equals chip, one internal scroller, correct overlay level, truthful disabled rows, clean dismissal. Disproof: clipped behind board/modal, stale list, background scrolling, or count/list mismatch.

## Plan findings and exact corrections

### 1. Blocker — D109 is being broadened into “one person box,” which the ruling does not say

D109 distinguishes people from boxes: a man only off is one; a man only on is one; times, areas and remarks are one per box. Therefore A→B in one person box is two unmatched person events. The plan’s GAP chooses one without support, and the committed [canonicalUnits](</C:/Users/User/projects/Raptor/raptor-port/src/engine/canonical.ts:356>) implements that guess.

Required change:

1. In `engine/canonical.ts::canonicalUnits`, retain one event per token occurrence.
2. Pair equal tokens off/on across different same-day places deterministically; each pair emits one `reseat`.
3. Emit one unit for every unmatched off and every unmatched on in surviving places. Do not collapse them per place.
4. Permit pairing with an added/deleted row so the pending-list wording remains a move.
5. Keep the structural add/delete item. Suppress only unmatched occupants wholly owned by the new/deleted row, avoiding double-counting its contents.
6. Add tests for multiple removals from one list, A→B replacement, duplicates, duplicate placeholders, every person grammar, added/deleted-row moves, reorder-before-move, move-before-reorder and cross-day movement.
7. If the owner truly wants replacements counted as one, record that as a new ruling; do not claim D109 already decides it.

### 2. Blocker — View-only is explicitly excluded from the waiting tag

The plan removes the edit-surface outline but preserves `#vWeek .seat[data-alp]` as a dashed outline. That conflicts with D93 and the batch’s “Every surface, View-only included.”

Required change:

1. Remove the pending seat outline for a published working-draft puck.
2. Draw the hollow `ALn` tag from `.seat[data-aln]::after` on Edit week, board and View-only working-draft peek.
3. Keep the issued View face frozen: it naturally has only stored `data-alc` marks.
4. Preserve cell-level marks for time/area/remarks.
5. Geometry-test every warning-ring type beneath both solid and hollow tags.

### 3. Blocker — item 6 ignores that filing is global and loading is per day

`dayFilingFingerprint` records a request’s global `acc` on every covered day, while `loadVersionToWorkingCopy` replaces one day. “Set `g` only where its row is on the loaded day” is wrong for a multi-day request accepted onto another day; setting fresh guarantees the loaded day still differs from its own snapshot.

Required change:

1. Add a load-only helper beside `loadVersionToWorkingCopy`; do not use `reconcileDayFiling`.
2. Resolve `g` ownership by scanning all loaded days for the request’s `src`, not merely the loaded day.
3. Never clear a valid `g` landing on another day.
4. Restore `u`, `r` and fresh only when that does not contradict an existing ground landing.
5. After restoration, assert the loaded day’s filing comparison is empty; refuse with a visible reason if exact restoration is impossible rather than claiming success.
6. Re-evaluate every covered published day whose global `acc` changed so its count and signature validity update together.
7. Pin same-day and multi-day cases for all four states.

This is a new-data path, so D56 does not exclude it.

### 4. High — `units` is dropped on retirement

`alIssue` stores `units`, but [retireIssued](</C:/Users/User/projects/Raptor/raptor-port/src/engine/publish.ts:802>) does not copy it.

Required change: copy `units: rec?.units` into the retired record and test publish → Unpublish → disclosed history → Undo/Redo → persistence. The fallback to `diff.length` is acceptable only for old demo records under D56.

### 5. High — “a removal has no log and no target” is too broad

A structural row deletion has no live cell. A person removed from a surviving seat or list has stable addresses, an edit-log entry and a truthful destination: the empty seat or owning row.

Required change:

- Keep `keys` and `jump` for unmatched person-off units.
- Attribute from the newest matching log row.
- Jump to the empty seat/row.
- Reserve blank attribution/non-button treatment for genuinely keyless structural deletion, reorder, filing or OIL.
- For a move, use the destination as the primary target.

The active pending-list work already distinguishes person removals; the tests must prevent regression to the plan wording.

### 6. High — History row eligibility must be surface-aware

The original `histJumpable` answers “can the board draw this?” before the new jump decides whether it is on the board or week. That would leave valid week details non-clickable.

Required change: use separate board/week eligibility, with `ar`, `at`, `it` and `wl` allowed on the week, and traffic non-cellular everywhere. The active `weekJumpable` work is the right direction. Test grouped and ungrouped History rows, both openers, desktop and phone.

### 7. High — the Signed line needs an explicit displayed-version resolver

`withDaySnap` swaps day content but not all publication-book state. A Signed-line helper that consults `dayCurVer()` internally can therefore name the wrong record under preview.

Required change:

- Pass the displayed version explicitly into `signedLineHTML`.
- Edit/board live: current published base.
- Edit/board preview: `PVV`.
- View issued: issued-face version.
- View working draft: current published base.
- Capture Original signers before `signClear` in [publish.ts](</C:/Users/User/projects/Raptor/raptor-port/src/engine/publish.ts:221>).
- Test different signer names per version so an accidental “latest” read cannot pass.

### 8. High — board-ring work must preserve special branches

“Every puck call passes `dashOf/traceOf`” is too blunt. OIL-mode pucks deliberately suppress normal warnings, and exempt duty pucks deliberately show their own rule.

Required change: add shared normal-warning arguments only to ordinary flying, SC, programme, duty, sim, ground and equivalent input/claim renderers. Leave OIL and exempt-special calls explicit. The roll-call must assert both the positive and negative branches.

### 9. High — item 10 needs a real pointer bridge and visible-viewport height

The behavior cannot be achieved by CSS scrolling alone. Leaving the anchor fires its `mouseout` before a body-level bubble can own the pointer.

Required change:

- Anchor `mouseout` must retain the bubble when `relatedTarget` is inside `.histbub`.
- Bubble `mouseleave` closes only when the pointer is on neither bubble nor anchor.
- Give pointer events only to an overflowing `.hb-all`; preserve the phone’s initial through-tap.
- Bound height from `visualViewport.height`, not merely `vh`.
- Verify wheel, trackpad and touch scroll plus pinned behavior.

The active work has begun these changes; they still require a real-browser crossing/scroll test.

### 10. High — item 11 is an outcome, not yet an implementable plan

“Size to the visible viewport” needs exact ownership and cleanup.

Required change in `SchedBoard`:

1. While open, subscribe to `visualViewport.resize` and `.scroll`.
2. Publish visible top, left, width and height to the board root; do not leave conflicting `inset:0`/bottom/right constraints.
3. Preserve the body scroll lock.
4. After viewport movement, keep the active field within the visible portion of the board’s own scroller.
5. Remove listeners and inline values on close.
6. Test synthetic viewport changes, then require the owner’s real-iPhone check with History off/on and phone/desktop-layout modes.

### 11. High — the proposed test section is much too small

“One unit test per item” cannot satisfy this batch’s roll-call and order requirements. The minimum is:

- Pure count tests per person grammar and structural interaction.
- One all-readers count test, including retired records.
- Plan/signature/Unpublish/Undo integration tests.
- Surface-specific jump tests.
- Role and version-identity Signed-line tests.
- Template opener plus engine-door tests.
- Filing-load tests across all four states and multi-day ownership.
- Real-browser geometry and gesture tests for tags/rings, popover, bubble and keyboard.
- Production walk on the everything-day across Edit week, board and View-only, desktop and phone.

## Explicit negatives

- No finding against keeping the canonical AL `diff` unchanged. D109 changes the human counting unit, not the issued record.
- No conceptual finding against `currentBind.pd`: stable whole-`dayDelta` binding plus absent-as-empty supports D103 and AM11.
- No finding against View-only’s issued face hiding working-copy counts or the pending-list door.
- No finding against retaining time, area and remark marks.
- No finding against the absence of a removed-person row mark; D91 explicitly rejects it.
- No “Reissue AL1” button should be added; D101 settles that.
- No migration/back-compat finding for already stored records lacking `units`, Original signers or `pd`, provided all new writes are correct. That is the D56 exclusion.
- `dayInfoHTML`’s issued-face content is already replayed through the issued-world wrapper in `Modals.tsx`; I found no new AM5 defect there.
- The shared template menu does give the UI two openers over one picker. The remaining obligation is engine refusal plus the same visible reason at both openers.
- Passing the focused item-14/item-7 tests would not clear the batch: most remaining risks are missing renderers, gestures, overlays and action order.

