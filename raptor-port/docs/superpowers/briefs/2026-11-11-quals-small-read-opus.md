# Two small Quals fixes — the fresh, blind Opus read (11 Nov 26, chat 64, job 3)

Reader: a fresh Opus helper that did not write the code, blind to Astra's report (which was kept outside the checkout until this one arrived) and told not to open the handoff file, the evidence sheet's folder or the pictures. Brief: `2026-11-11-quals-small-read-brief.md`, the same as Astra's. Under review: `git diff 24a75372d 7765901d1`. Launched 07:07 on 11 Nov 26, reported about five minutes later; it ran no tests. The report below is as it arrived. Its dispositions: the evidence sheet, `raptor-port/docs/handpass/2026-11-11-quals-small.md`.

---

BLIND OPUS CODE READ: two small Quals fixes (`git diff 24a75372d 7765901d1`)

Method. I read the diff and these parts of `raptor-port/src/ui/QualsPage.tsx` at 7765901d1:
- the outline ask, lines 312–361
- the column drag, 571–710
- the pinned row's effect, 815–958
- the pinned row's markup, 1135–1185

I also read:
- the Undo route, `src/state/undo-wire.ts:194–197`
- "Check my quals", `src/ui/WelcomeBack.tsx:32`
- `src/ui/lift.ts boxOf`, `src/ui/edgescroll.ts`
- the Quals CSS, `05-quals.css:97–219`
- the six new e2e tests (`geometry.spec.ts:6170–6480`) and the new unit test
- the full rows of D672 and D895

I ran no tests and wrote no proof file. Nothing was created or deleted in the checkout. No handoff block appeared in my chat.

FINDINGS

1. A record still states the old behaviour (documentation, real).
- Claim: `raptor-port/docs/ui-contracts.md` lines 5520–5522, in the column-drag section, still say "the frozen header mirror `.qfixed` still carries no drag handlers, so a heading is dragged on the real table."
- Why it matters: the change corrected the copy of this sentence at line ~8352 but missed this one. The next reader will believe a pinned heading cannot drag.
- `main`: has the same line, but it was true there.
- Fix: after "on the real table." append: *(CORRECTED 11 Nov 26 — [QUALS-PINNED-HEAD-NO-DRAG]: a heading pressed in the mirror now starts the same drag; see the corrected note in §What a drag LOOKS like.)*. Then grep `ui-contracts.md` for "no drag handlers" and confirm only the two corrected places remain.
- Test: none. This is a document.

2. A redraw during a pinned drag can wipe the drag's marks (minor, new path only).
- Claim: the pinned copy's markup is an inline `{ __html: … }` object, made new on every render (QualsPage.tsx ~1152 and ~1177). Under React 19 that re-sets the HTML on each render, as the code's own comment at line 446 says. So any redraw of the page during a drag started on the pinned row:
  - wipes `qdragging` (the picked-up look) from the pressed pinned heading;
  - leaves `over` pointing at a heading that is no longer on the page.
- When it shows: a drag on the pinned row while something redraws the page. Triggers are a re-pin from a resize, a window resize, a phone toolbar change (the visualViewport resize), or a store change arriving.
- What the person sees: the pressed heading loses its half-faded look mid-drag. The landing mark comes back on the next move, because `th !== over` re-adds it. The drop itself is still right, because `over.dataset.col` survives on the detached heading.
- Is it new? The table's own drag cannot hit this: the table's markup is memoised (`tableInner`). The pinned drag is new, so the exposure is new.
- How likely: low. Nothing I found redraws during a plain drag. The `qdrop` and `qdragging` classes change no size, so the watchers that re-measure the heading never fire.
- Fix:
  - (a) Wrap the pinned row's `__html` objects in `useMemo`, keyed on `[stuck, qzEff, qz, cols, qSeatView, qSort, qEditing, qualsEdit, armDel, ver]`, the same way `tableInner` is built.
  - Or (b): at the top of `onMove`, if `from` is set and `over` has no `isConnected`, set `over = null`. And in `onMove`, re-add `qdragging` to `mirrorRef.current?.querySelector('th[data-col="'+from+'"]')` when the pinned copy is mounted.
  - (a) is cleaner and also stops typed state being lost.
- Test: in the desktop pinned-drag e2e test, mid-drag, call `window.dispatchEvent(new Event('resize'))`, wait 400 ms, move once more, then assert the pinned `th[data-col=from]` still has `qdragging` and exactly one `th.qdrop` exists.

3. Your question, the filter hiding his row when the ask arrives. Supported by D672, but the owner should hear it.
- What the code does: `backWent.current = backHl` is set before the `if (!el) return`, so the trip is spent even when his row isn't drawn. Clearing the filter later outlines him without moving the page.
- D672's full row: Undo moves "only when it is out of view", at the moment of the Undo. Its reading (6) defines "in view" as wholly on screen.
- A later page move set off by the person's own typing in the filter box would be the very kind of surprise jump this fix removes. So I read the new behaviour as consistent with D672, not contradicting it.
- What the person meets: with a filter typed that hides him, pressing "Check his quals" on the "he's back" note shows nothing — no outline, no move. That moment is older, unchanged by this change. Only an admin already on Quals with a filter typed can reach it, since the page mounts with an empty filter.
- Recommendation: keep as built. Tell him in one line; the choice is his.
- Missing test: unit test — type into `#qFilter` so he is hidden, `focusQualsRow('bane'); notify()`, assert no trip; clear the filter, assert he is outlined and still no trip.

EXPLICIT NEGATIVES

Q1, the one trip.
- Every way an outline is asked for, and where:
  - "Check his quals", line 1114, calls `checkBack`.
  - Undo and Redo of a person go through `undo-wire.ts:197` (`focusQualsRow`).
  - "Check my quals" goes through `WelcomeBack.tsx:32`.
  - All three reach `checkBack`, which makes a new `{id}` object every time. A second ask for the same man therefore makes its own trip.
- The seat view and the ask are set in one batch, so they commit in the same render. The table is drawn in render (`dangerouslySetInnerHTML`, memoised on `ver`), so the row exists before the passive effect runs.
- Undo while on Quals: the commit that carries the Undo's redraw runs the effect with the old ask (went = true, outline only). The next commit carries the new ask and its single trip.
- Arriving on the page: the "opens at its top" scroll, the focus check and then the outline run in that order, so the trip comes after the scroll to the top.
- StrictMode doubles only mount effects, where the ask is still empty, and only in development. Effects run only on commit, so a discarded render cannot spend a trip.
- Edit quals open or closed hides no rows. A view switch comes from `checkBack` itself. I found nothing.

Q2, what the changed path no longer runs.
- Removing the scroll on every repaint drops only one thing: re-centring after a later change of layout.
- The trip uses `block:'center'`. The page is laid out at the passive effect, including the "he's back" note's removal in the same commit. The app loads no fonts. The pinned row appears at the top, clear of a centred row. The pinch zoom is untouched by an ask.
- `rowOnScreen` still clears the top bar and the table's heading. I found no dependence on the old scrolls.

Q3, Undo and Redo against D672.
- "In view" is judged on the first trip (line 360): in view, no move; out of view, one trip; then free. Both directions use the same route. An Undo pressed from another page lands on Quals (`primary='quals'`) and goes through the mount path.

Q4, the pinned drag is the table's drag.
- The press and move reach the same `onDown` and `onMove` functions, through `pinnedDrag`.
- The column is identified by key (`data-col`), not by position. Sort, filter, sideways scroll and zoom therefore cannot mis-identify it. Both copies come from the same `qualsHead(cols, …)`.
- The frame is `boxOf(wrap, tbl, col)`: the TABLE's column for the table's full height. When the table's heading is off screen above, the frame is still visible in the rows below.
- The edge scroll starts `from: col`, so it finds `.qwrap`. Without the scroll-driven path, `onXScroll` keeps the pinned row in step; with it, the browser does.
- Listeners: the pinned row uses React handlers on a node that persists. Release is the document's pointerup and pointercancel (unchanged), and the effect's cleanup nulls the ref.
- If the pinned copy unmounts mid-drag, later moves are heard only over the table. That matches the table's own drag.
- A second finger: `isPrimary === false` is ignored. The pinch starts only on `.qwrap`, which cancels the drag; this is unchanged.
- Touch: `.qtbl.qediting thead th.qcol{touch-action:none}` matches the pinned copy too, exactly as on the table's heading. Outside Edit quals the pinned row's touch handling is as before.
- The frozen name copy has no `data-col`. Its 1-px overhang shows the Initials heading, which has none either.

Q5, doors that must stay shut.
- `onDown` returns unless `canEditQuals()` is true (admin, editing and Edit quals all on).
- Outside Edit quals the pinned headings carry `data-sort` and no `data-col` (`qualsHead`), so the press is also refused at `!th`.
- A member is not an admin, so he is refused.
- The name heading is sort-only. A press on the ✕ returns at `[data-del]`.
- The ✕ inside a pinned heading doing nothing on a click is older: the pinned row's `onClick` is unchanged from `main`.

Q6, every copy and every reader.
- Copies of the heading: the table's, the pinned moving row and the pinned name copy.
- Readers of the column order: these three, the Leave War's quals list, Export and saved data. All read `qualCols()`. The write is `moveQual` → `setQualCols`, one command with one Undo, the same as from the table. Each is right after a pinned drag and after its Undo.

Q7, the tests.
- On `main`:
  - The unit test would fail: every repaint called `scrollIntoView`.
  - Both rescroll e2e tests would fail, because the tick re-scrolled.
  - Both pinned e2e tests would fail: no handler.
- No existing assertion was weakened.
- Gaps — tests not written:
  - (a) the filter case (finding 3);
  - (b) a drag from the pinned row carried to the edge, showing the table and the pinned row scroll together;
  - (c) a member, or Edit quals off, pressing a pinned heading and moving nothing;
  - (d) the path without scroll-driven animations (WebKit, iPhone before iOS 26), where `.qfixed-scroll` is a real scroller. All the e2e tests run where the scroll-driven path is on;
  - (e) a redraw mid-drag (finding 2).
- For (b): desktop at 1000 by 700, Edit quals, scroll to 320. Press the pinned heading's words, move to `wrap.right - 10` and hold 600 ms. Assert `.qwrap.scrollLeft` grew and `mirror.scrollLeft` (or its transform) followed. Drop, then Undo.

Q8, records.
- The three corrected lines at ~3651, ~7820 and ~8352 are true of the code.
- Stale: line 5521 (finding 1).
- Searching "back-hl", "outline", "Check his quals" and "pinned" turned up nothing else stale, including in `src`, `e2e` and `feature-impact.md`.

Q9, tidiness (filed, not fixed).
- `undrag` clears the moving pinned row but not the pinned name copy. Harmless, since that copy cannot carry the mark.
- The ask held as an `{id}` object compared by identity is short and clear, but it relies on `checkBack` always making a new object. A one-line comment is already there.
- Nothing duplicated or misnamed.

Older, in passing:
- The outline is never cleared, by design: the item's own text.
- No Escape cancels a column drag. That is older, on both copies.

VERDICT: Both promises hold in the code. One stale line in the records must be corrected (finding 1). One minor hardening is recommended, the pinned row's markup memoised (finding 2). The filter case goes to him as a one-line note (finding 3). Five tests are missing (Q7). Nothing blocks.
