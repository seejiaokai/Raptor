# The narrow read of the fix round — report (19 Oct 26, round 1)

Reader: a fresh Opus 5.5 reader that wrote none of the fixes. Read only, at the branch head
(`claude/schedule-amendments-fixes-fffce0`, `b1e3ac72a`). Read: the brief; F1–F3 of the read report (stopped at
"## Observations"); `b2797b27f`, `5a20cccfe`, `f9cdafcdb` whole; `textedit.ts` (the mark, `routeFocusOut`,
`routeFocusIn`, `txtCommit`, `textCaret`/`editingText`), `EditWeek.tsx` and `SchedBoard.tsx` (both paint effects and both
`resume` effects), `rowdrag.ts` whole, `html.ts intimesInner`/`ted`, `board.ts` In-time block and the `data-bfld`/`data-role-*`
emitters, `mission-role-offer.ts`, `pan.ts` (resize, re-land, peek sync, `dayStep`, `weekScrollMax`, `initPan`), `Shell.tsx`
`saveBand`, every synthetic `resize` in `src`, `state/store.ts notify`, `docs/performance.md` (notify cost entries).
Ran (single files, no build): `textcaret.test.ts`, `rowdrag.test.tsx`, `pan.test.tsx` — 3 files, 65 tests, all pass.

**Verdict:** F1, F2 and F3 are each fixed on every route their finding names. One new finding, introduced by the F1
fix (N1, a performance cost on the phone). No other regression found. D1026's short line: **yes**, it says the same.

---

## N1 (MEDIUM-LOW, new with `b2797b27f`). Every finger scroll that starts on a text box now runs a full repaint of the app

**Setup.** Edit Schedule on a phone (week or Scheduler Board), or the Inputs pages; no box has the caret.

**Action.** Put a finger down on any text box (a note, a time, a remark, an In-time line, a board field) and scroll —
vertically or sideways. The week is mostly text boxes and pucks, so this is a large share of all scrolls.

**What happens.** `pointerdown` sets the mark on the box; the browser takes the touch as a pan and fires
`pointercancel`; the new listener calls `letGo()`, which does `ARRIVING = null; notify()`. `notify()` is the global
store bump: every `useVersion` consumer re-renders, `EditWeek`'s paint effect rebuilds all seven day strings
(`editDayStrings`), the open board rebuilds its four panels' strings, then `refreshHighlights`, `refreshHistDots`,
`reconcileMissionRoleOffer`, `histBubRecheck`. Nothing has changed, so the diff writes nothing — but the work runs, at the
start of the fling. `docs/performance.md` measures one such full repaint at ~70 ms at 4× ("seven day strings rebuilt each
time"), and records two invariants this breaks in spirit: a view-only gesture never triggers the global `notify()`
(the board's narrow lane, entry 1) and a post-render lifecycle never repaints through `notify()` (the fresh-add box —
whose dozen notifies were the "black screen after a fast fling" on iOS). The same `notify()` also fires 0 ms / 600 ms
after a tap on a `TEXTBOX` element that never takes the focus (a `disabled` board input, the Blue/Red role offer's buttons
on iOS, which carry `data-role-ui`). D991 makes scroll smoothness part of the bar.

**What should happen.** Letting go of the mark repaints only a surface that actually held a redraw for it; a scroll that
held nothing costs nothing.

**Cause.** `ui/textedit.ts`, `letGo` (line 98) calls the global `notify()` unconditionally whenever the mark was set
and the focus is not on it. The only consumers that ever held a paint for the mark are the two `pendingPaint` effects
(`EditWeek.tsx`, `SchedBoard.tsx`), and each already has a cheap "resume" path that does nothing when no paint is owed —
but it listens only to `focusout`.

**New or old.** New with `b2797b27f` (before it, the clear was silent — which was F1).

**Exact fix.**
1. `ui/textedit.ts`: add `export const CARET_GONE = 'raptor-caret-gone'`. In `letGo`, replace `notify()` with
   `document.dispatchEvent(new Event(CARET_GONE))` (after `ARRIVING = null`, so `editingText()` is already false when the
   listeners run).
2. `ui/EditWeek.tsx`, the `resume` effect (around line 104): beside `document.addEventListener('focusout', resume)` add
   `document.addEventListener(CARET_GONE, resume)`, and remove it in the cleanup. `resume` already returns at once when
   `pendingPaint.current == null`, and otherwise repaints through `setSettledPaint` (UI only, no mutation).
3. `ui/SchedBoard.tsx`, the `resume` effect (around line 235): the same two lines.
4. Nothing else needs the global bump: `txtCommit`'s skipped backstop is a repaint-only concern (the text command was
   already recorded synchronously by `commitText`), and those two effects are the only places that defer on the mark
   (checked: `editingText`/`textCaret` have no other callers in `src` outside tests).
5. Tests, red first:
   - `textcaret.test.ts`: change the pointercancel case to expect `notify` NOT called and a `CARET_GONE` event dispatched.
   - An `EditWeek` (or board) test: set the mark with a `pointerdown` on a week box while the page has the focus, make a
     change that notifies (the week's paint is held — assert the old text is still in the block), then dispatch
     `pointercancel`, flush timers, and assert the block now shows the new text. This also pins the finding's own
     bullets 2–3, which the fix commit did not add (see O3).
6. Disproof / measure: a 4× trace of a vertical fling begun on a text cell on the phone viewport, before and after —
   before, a long task at the pan's start; after, none.

---

## F1 — the pressed-box mark (`b2797b27f`)

**Is it right?** Yes, on every route the finding names.
- Finger lands on a box and scrolls → `pointercancel` → `PRESSING = false`, `letGo()` clears the mark and notifies →
  the week's and the board's paint effects rerun with `editingText()` false. Failure 1 (board opens blank): by the time
  the board button is tapped the mark is gone; the button's `pointerdown` does not set it (not a `TEXTBOX`). Checked.
- Failure 2 (swipe past Sunday): `pointercancel` fires at the pan's start, before `touchend` → `loadWeek`, so the
  effect sees no caret and consumes `WEEKJUMP`. If a browser ever delivers `pointerup` instead (no pan), the 600 ms
  timer's `letGo` now notifies, and the effect consumes the still-set `WEEKJUMP` then. Checked.
- Failure 3 (a change in the held block): the notify reruns the paint; the narrow branch's `HELD` prefix guarantees
  the owed block is rewritten; the board's `panelPrev` was never updated for the held panel, so it is rewritten. Checked.
- Null `relatedTarget` (keyboard "Done", `blur()` in code) with no press down → mark dropped. Checked.
- Mouse and keyboard routes: mouse press → focus arrives → `routeFocusIn` clears; Tab → `relatedTarget` names the box.
  Unchanged. Draft day vs published day: the mark is day-agnostic. Checked.

**Is it complete?** Listeners and callers checked:
- `pointerdown` / `pointerup` / `pointercancel` (document, capture) — the three ways a press starts and ends. Checked,
  nothing found. (A lost `pointerup` — a native dialog opened on a press — would leave `PRESSING` true; nothing in `src`
  does that on a press. Nothing found.)
- `routeFocusIn` (Shell, document-level) — clears on every arrival, any surface. Checked, nothing found.
- `routeFocusOut` (Shell, document-level) — runs the mark line before the `canEditSched` gate. Checked, nothing found.
- `arriving()`'s disconnect branch still clears silently (the finding's fix step 3 asked for a notify there). Every
  caller that can hit it — the two paint effects, the two `resume` timers, `txtCommit`'s timer — itself goes on to paint
  or to `afterSchedMutate` when it gets null back, and both surfaces read the same module state in the same pass, so no
  owed paint is left behind. Checked, nothing found.
- Other surfaces that defer on the caret: none (`editingText`/`textCaret` used only by `EditWeek`, `SchedBoard`,
  `txtCommit`). Checked, nothing found.

**What did it break?** N1 above (cost, not behaviour). Behaviour: a caret that should hold a redraw still does — the
mark still stands from press to focus arrival on mouse; on touch, focus arrives (on the compat `mousedown`) inside the
600 ms window and `relatedTarget` names the box. See O1 for the one assumption this rests on.

## F2 — an emptied In-time line, then another line's grip (`5a20cccfe`)

The fix is not the one the finding proposed (read the address after the blur); it computes the shifted address before
the blur. Read against both: the implemented one is the better of the two.

**Is it right?** Yes.
- A emptied, C's grip pressed (board, same wave): `at` `…2` → `…1`; blur deletes A and re-addresses the board rows in
  place; `flushSync(notify)` rewrites the panel (its string changed, nothing holds it — the grip press sets no mark); the
  re-find by `…1` lifts C. If the panel were not rewritten, the grip is still connected and `from` is read from its row,
  which `routeFocusOut` has already re-addressed to `…1`. Both paths lift C. Checked.
- A emptied and A's own grip pressed: blur (A deleted), return — no drag. Matches "nothing if C itself is gone". Checked.
- The emptied line in another wave or day, or a grip of another kind (wave `.wvgrip`, section `.secgrip`, `mv:ac/d/s/g/p/n`):
  untouched, correctly — an In-time deletion renumbers only that wave's In-time rows. Checked.
- Week line focused (iPhone: a tap on the board button does not move the focus), board grip pressed: the board rows are
  not re-addressed by the blur (only the week's block is), so the finding's proposed fix would have lifted D; the
  implemented arithmetic uses the model index and lifts C. Checked.
- Finger and mouse take the same `onDown`. Published day: same code; the wrong "order changed" can no longer be made.
  Checked.

**Is it complete?** Other blurs that delete or insert a row and so renumber addresses: searched `routeFocusOut`'s
branches (`data-txt`, `data-inp`, `bombs`, `area`, `atime`), `txtSet`, and the board's `change` path — only an emptied
In-time line deletes on blur. Checked, nothing found. The emptiness test (`textContent.trim()` empty) matches
`routeFocusOut`'s (`intimeFold(text.trim())` falsy). Checked, nothing found.

**What did it break?** Nothing found: a drag from a non-emptied line, from any other kind, or with no caret takes the
same path as before (the blur moved two lines earlier, before `atSec`/`gripCls` are read — neither depends on the blur).

## F3 — only a real resize re-lands the desktop week (`f9cdafcdb`)

**Is it right?** Yes. Shell's `saveBand` resize is refused by its flag and, independently, by the unchanged width; the
Leave War's and the Tracker's own synthetic resizes (`LeaveWarPage.tsx`, `TrackerPage.tsx`) are refused by the unchanged
width too (before the fix they also re-landed, harmlessly — the week is hidden then). `updateWeekNav` and
`syncPeekOnResize` still run on every event. Checked.

**Is it complete?** `resizeRelands` and `relandWeekAfterResize` have one caller each (`onResize`, its timer). Checked,
nothing found.

**What did it break?** Window narrowed or widened → width changes → re-land. Zoom changed (Ctrl +/−) → `innerWidth`
changes → re-land. Phone turned → width changes; ≤ 820 px is left alone as before, a large phone or tablet turned past
820 px re-lands. A height-only resize no longer re-lands: day columns are a fixed 552 px basis, so a height change does
not move them. Checked, nothing found. (The one theoretical gap — a height-only resize that toggles the page's vertical
scrollbar while the week sits at its far right end, letting the browser clamp `scrollLeft` by the scrollbar's width — is
too narrow to count; if it is ever wanted, compare the week's own `clientWidth` instead of `innerWidth`.)

---

## Observations (not findings under D489)

- **O1 — touch and a null `relatedTarget`.** On a tap the focus moves at the compat `mousedown`, after `pointerup`, so
  `PRESSING` is already false there. The old rule kept the mark on any null-`relatedTarget` focusout; the new one keeps
  it only during a press. That is safe as long as a tap from one box to another always names the box it goes to — true
  in Chromium, and what I expect of WebKit for inputs and contenteditables, but not verified on the owner's iPhone. If it
  ever came back null there, [EDIT-SECOND-CLICK] would return on the phone. Disproof: on the iPhone, change a week box,
  then tap another box once — the caret should arrive. A zero-cost belt if wanted: clear `PRESSING` on a touch's
  `pointerup` only in the 600 ms timer (with `letGo`), not at once.
- **O2 — F2's test** covers A-emptied/C-dragged; the own-grip "no drag" route and the week-line/board-grip route have no
  test. Each is a two-line addition to the same `describe`.
- **O3 — F1's tests** pin the mark and the notify call, but not the finding's bullets 2–3 (a held week paint actually
  drawn after the 600 ms timer; the board drawing its panels with a stale mark). N1's step 5 adds the first.

## D1026 (D138 check)

**Yes.** The short line in `.claude/rules/decisions/scheduler.md` is the full row's bold sentence word for word (only the
bold marks dropped): nothing lost, nothing changed in meaning.

Rulings: none this session (read-only reader).
