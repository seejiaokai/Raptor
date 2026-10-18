# The narrow read of the fix round, round 2 — report (19 Oct 26)

A fresh Opus read of the two fix commits on `claude/schedule-amendments-fixes-fffce0`: `0df257c26` (N1: the letting-go
of a pressed box sends `CARET_GONE` and no longer calls the whole app's `notify()`) and `9cbdc5e64` (a held block is
remembered as owed: `OWED` in `swapDayAround`, the board's panel record dropped). Read: both diffs; `textedit.ts`
(the mark, `letGo`, `routeFocusOut`, `routeFocusIn`, `refreshTextDestination`, `textCaret`, `txtCommit`); `dayswap.ts`
whole; `EditWeek.tsx` whole; `SchedBoard.tsx` effects 228–345; `topbits.tsx` (`UndoPair`, `globalUndoEngine`); the
day's markup shape in `html.ts` (`dayHTML`'s top-level children and its sections). Ran: `dayswap.test.ts`,
`textcaret.test.ts`, `schedule-tab.test.tsx` (55/55), `rowdrag.test.tsx` (34/34), all green; plus three throwaway jsdom
tests in my own temp folder (nothing written in the repo).

**Verdict.** Both fixes are right for what they answer, and neither breaks anything beside it that I could find. One
finding: the same "Undo with the caret still in the block" route has a second, worse consequence the `OWED` fix does
not reach — an In-time line is lost and another duplicated, on the week and the board (F1, older than the batch).

---

## F1 (MEDIUM, older — not caused by these commits; the `OWED` fix does not reach it). Undo with the caret still on an In-time line overwrites the line before it

**Setup.** Edit Schedule, any day, a wave with three In-time lines: `A 07:00H`, `B 07:30H`, `C 08:00H`. The same route
the commit `9cbdc5e64` fixes: an Undo that runs while the caret stays in a text box (the walk reproduced it on the
built app; on an iPhone a tap on Undo is the likely way — Safari does not move the focus to a button; my assumption).

**Action.** Click into line A, delete all its text, move the caret on to line B (Tab or a click). Press Undo with the
caret still on line B. Then leave line B — with or without typing anything.

**What happens.** Reproduced in jsdom on both surfaces, with the same harness as the commit's own test (`undo()` with
the caret kept):
- After the emptying: stored `[B, C]` — correct; on screen line A's node is removed and B and C are re-addressed to
  places 0 and 1 (`routeFocusOut`, the `!nv` branch).
- After Undo: stored `[A, B, C]` — correct; on screen still only B and C, B still addressed as place **0**: the block is
  held for the caret, so nothing rewrites it.
- Leaving line B commits its text into stored place 0: stored becomes **`[B 07:30H, B 07:30H, C 08:00H]`** — A is gone
  and B is doubled, with no typing at all. Typing a change into B first gives `[B 07:45H, B 07:30H, C 08:00H]`.
- The Scheduler Board gives the identical result (its lines are re-addressed the same way).

The `OWED` change makes the block repaint once the caret has left — but the leaving itself is what commits, and it reads
the stale place before any repaint. On a published day the overwrite is also a pending amendment with a history line.
New data is hurt (not D56).

**What should happen.** Stored `[A, B, C]` after leaving B untouched; `[A, B 07:45H, C]` after typing in B.

**Cause.** `ui/textedit.ts`, `routeFocusOut`'s In-time branch writes to the place written on the line node
(`data-itline`); the emptying branch re-addresses the surviving nodes in place; an Undo (or Redo) that runs while the
caret stays in that block changes the stored list under it, and the held block (`EditWeek.tsx` caret path →
`swapDayAround`; `SchedBoard.tsx` `put`) keeps the stale addresses until after the caret's own commit. The same class
covers any Undo/Redo that shifts places under a held block (a wave or line restored before the one with the caret).
`refreshTextDestination` heals a line only when focus ARRIVES, so the line that already had the caret is the one
exposed.

**Exact fix (recommended — make Undo/Redo never run under a held caret, the way a desktop Chromium click already
behaves, since there the button takes the focus on mousedown):**
1. `ui/topbits.tsx`, `globalUndoEngine()`: import `editingText` from `./textedit`. Wrap the bodies of `undo` and `redo`
   as `run(body)` where:
   ```ts
   const run = (body: () => void) => {
     const a = document.activeElement as HTMLElement | null
     if (a && a !== document.body && editingText()) { a.blur(); setTimeout(body, 0); return }
     body()
   }
   ```
   The blur runs `routeFocusOut` at once (the box's own typing, if any, is committed as its own change — so Undo then
   takes back that typing first, exactly as on a desktop click today). The `setTimeout(…, 0)` runs the Undo after the
   `txtCommit` backstop that blur scheduled (timers of 0 run in order), so the backstop never lands after the Undo and
   cannot record anything over it. With no caret left, the Undo's paint is the ordinary one and rewrites the block with
   fresh addresses.
2. Leave `probe-bridge.ts`'s `w.undo` as it is (a test hook).
3. Tests, red first, in `schedule-tab.test.tsx` (drive `globalUndoEngine().undo()` / the `#undoBtn` click, not the
   store's `undo()`): (a) the week — three lines, empty A, focus B, Undo, flush, leave B: stored `[A, B, C]`; (b) the
   same on the board; (c) a B time typed, caret on in the same line, Undo: stored B back to empty AND the box shows it,
   AND Redo is still offered (`undoState().canRedo`); (d) a box with typing NOT yet committed, Undo: the typing is what
   is taken back.
4. Keep `OWED` and the board's dropped record — they stay correct and cheap, and cover a paint held for any other reason.

(A narrower alternative, if he wants the caret kept through Undo on a phone: in the caret paths of `EditWeek.tsx` and
`SchedBoard.tsx`, after the held block is skipped, re-address its In-time lines from the model — every
`[data-itline]` / `[data-itdel]` / `.itrow[data-move]` in the held block whose text matches a stored line gets that
line's place, and a node matching none is removed. More code, more ways to be wrong; I recommend 1.)

---

## The two fixes against the brief's questions

### `0df257c26` — `CARET_GONE` instead of `notify()` (N1)

**Right.** `letGo` clears the mark first, then dispatches `CARET_GONE` on `document`; both listeners are on `document`
(target phase — the event need not bubble). Each `resume` returns at once when no paint is owed, so a scroll that held
nothing now costs nothing. The `notify` spy in `textcaret.test.ts` is a real negative: the old assertion of the same spy
passed, so it does intercept `textedit`'s call.

**(a) Every route that relied on the old `notify()` still gets its held paint** — checked each:
- Only two places ever hold a paint for the mark: `EditWeek.tsx` (line 133: sets `pendingPaint` on every paint taken
  while `editingText()`, including the W15 narrow path and its early returns) and `SchedBoard.tsx` (line 288, same).
  Checked: `editingText`/`textCaret` have no other callers in `src` outside tests (and `txtCommit`, whose skip predates
  the batch and was never undone by the old `notify()` either). Both listen to `CARET_GONE`. Nothing else is owed.
- A finger that scrolled (`pointercancel`): `letGo` → `CARET_GONE` → both `resume`s. Pinned on both surfaces by the
  new `schedule-tab.test.tsx` cases.
- The 600 ms timer after a finger's lift on a box that never takes the focus (a disabled board field, the Blue/Red
  buttons): the same `letGo`, the same event. A paint held in those 600 ms set `pendingPaint`, so it is drawn.
- A board opened while a box was pressed: the board's first paint is held (`!boardRef.contains(caret)` returns with
  `pendingPaint = {di, nav}` for the new day); `CARET_GONE` → the board's `resume` → its `SBDAY`/`navGen` match → drawn.
- A swipe past Sunday: the week cross's own paint, if held, records the new `navGen` (each held paint overwrites
  `pendingPaint`), so `resume`'s nav check passes; if the cross ran after the cancel there was nothing held.
- A pressed box removed from the page: `arriving()` drops a disconnected box the moment anything reads the caret, so a
  paint after the removal is never held; a `letGo` that finds the mark already gone dispatches nothing, but in that case
  the read that dropped it was itself a paint, `resume`, or `txtCommit`'s timer (which then runs `afterSchedMutate` →
  `notify`). No route found where a held paint is left with no event to resume it.
- The focus arriving (`routeFocusIn`) or leaving (`routeFocusOut`) clears the mark with a `focusout`/`focusin` in train,
  so `resume` already runs there — unchanged.

**What it broke beside it:** nothing found. Checked `focusout` listener removal symmetry (both cleanups remove both
listeners); `notify` is still imported and used in `textedit.ts` (the Escape disarm), so no dead import.

### `9cbdc5e64` — a held block remembered as owed

**Right** for the route it names, on both surfaces, draft and published: the held block's chunk is `OWED`, which no real
markup can equal (the HTML parser drops U+0000), so the first paint after the caret leaves always rewrites it — and the
`HELD` prefix on the day's string already makes that day get compared. Redo after Undo keeps it owed. The week's case
where the Undo's own paint runs with the caret ALREADY gone (a desktop click on Undo whose paint beats `resume`'s timer)
is fixed too, because `OWED` sits in the kept chunks the ordinary `swapDay` compares against.

**(b) `OWED`** — checked every reader of the kept chunks: `swapDay` and `swapDayAround` only compare (`!==`) and never
write a chunk to the page (they write the freshly parsed node); `fits` checks only `typeof` and lengths, and `OWED` is a
string standing where a string stood, so counts and types line up; the warning-box branch prepends/slices
`pb.kids` by position, carrying `OWED` with its block. `chunksOfHTML` is only fed the stored day strings, never chunks.
`ViewWeek` keeps its own chunks (never sees `OWED`). Over and over: while the caret stays, the held block is skipped
every paint and nothing is written (each other block compares equal to what it last wrote), so no repeated write, no
caret move (`holdingPlace` measures zero), no scroll write on the caret path. After the caret leaves: one rewrite, and the
scroll hold (`panHold`) runs as for any held block before. No loop found.

**(c) The board's dropped record** — `put` deletes the record only when the panel's markup differs AND the caret is in
it, and returns without writing; every later paint with the caret still there takes the same return. No rewrite while
the caret is in the panel. Checked: `panelPrev` has no other reader (lines 280, 295, 298, 299 only); only the board panel
holds text boxes (the sign, warn, day-dots and roster panels have none), so no other panel can lose its record.

---

## Observations (not findings)

- **O1 — the shape-mismatch hold still keeps the pre-typing chunks.** `swapDayAround`'s two `return { chunks: prev,
  held: true }` paths (no fit, or no previous chunks) hand back what was written before the typing, not `OWED`. If one
  text commit both changed the caret's block and changed the day's block count (other than the warnings box), then an
  Undo with the caret still there would leave the typed value on screen for good, as before. I found no typed text that
  does that today: the top-level children are fixed in edit mode, and the sections that come and go are drawn from
  requests, which no typed schedule text adds or removes. Cheap hardening if wanted: on those two returns, when `prev`
  lines up with the live children, mark the live child (and day-body child) that holds the caret as `OWED` in the
  returned copy; a `dayswap.test.ts` case pins it.
- **O2 — an owed block stays as typed while the caret works elsewhere.** If the caret moves on to another block or day
  without leaving text, the owed block is rewritten only by the next paint or when the caret leaves text — not "for
  good", and a focus into any of its boxes heals that box from the model. Older design, unchanged by these commits.
- **O3 — one extra rewrite.** Because a held block is now owed even when the stored value comes back to what was last
  written, a week block or the whole board panel is rewritten once when the caret leaves in that case. Cost only.

Not opened, per the brief: the walk sheets and the evidence sheet. Nothing in the repo changed except this report.
