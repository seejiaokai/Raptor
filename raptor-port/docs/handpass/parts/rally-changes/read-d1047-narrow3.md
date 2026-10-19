# D1047 — the third narrow read: the fixes for M1, M2, M3 (19 Oct 26)

A fresh Opus reader, blind to the chat that wrote the fixes and to the earlier reads' chats. Read: the fix commit's code and
tests (`interactions.ts` — `firstReplace`, `firstTypingReplaces`, `placeSuggestion`, `armFreshTime`, the `TIME_DOWN` /
`TIME_PRESS` / `ARMED_PRESS` listeners; the new `firstReplace` and M3 blocks in `brieftime-ui.test.tsx`; RB5 and RB9 for
M2) against `read-d1047-narrow2.md` §M1–§M3. Round 3 of at most 3. D56 applied: nothing below lives only in stored data.
`npx vitest run src/ui/brieftime-ui.test.tsx` — 35 of 35 pass. No browser run, no phone.

## Verdicts on the three fixes

- **M1 — right and complete.** Only `insertText` and `insertFromPaste` give their `data`; a composition, a replacement or
  a drop goes to the shape reading, as before the round. Its test pins the composition case. (`insertReplacementText`,
  asked for in M1, has no test; it takes the same branch, so this is a test gap only.)
- **M2 — right; consistent with RB5 and RB9.** `firstTypingReplaces` now calls `firstChange` with the browser's kind.
  RB5's two tests send a plain `input` with no kind: `09:401010` → `1010`, `10:200955` → `0955`, `1` kept — unchanged by
  the fix. RB9's `09:4` → `''` the same. A double-click on `20` of a placed `07:20`, then `4`, gives `07:4` again (`d < 0`
  with an insertion kind is never a clear). **But nothing pins it** (see T1): RB5 sends no `data`, so the code before
  this fix passed every test too.
- **M3 — right for the case it was written for** (a quick scroll started on the armed box keeps it armed; a tap disarms).
  Answers to the four questions, then two findings.

### The four questions

1. **Can a pointerup belong to a different press?** Yes, with two fingers: finger A lands on the armed box (`ARMED_PRESS`
   set), finger B touches elsewhere and lifts, and B's `pointerup` disarms A's box. A pinch sends `pointercancel` to both
   fingers instead, so it is not this case. The reverse also happens: another finger's `pointercancel` clears A's note,
   and A's own tap then leaves the box armed. Both are rare. The first fails safe (ordinary editing). The second does
   not, but needs two fingers at once. Both go with F2's fix (match `pointerId`).
2. **Can `ARMED_PRESS` be left stale and then disarm a different box?** Never a *different* box. The note names the box
   that was focused at the press. Any other box can be armed only after the focus leaves that one, and leaving runs `off()`,
   which nulls `_freshOff`, so the stale call is a no-op. On a phone the arming focus always comes *after* the tap's
   `pointerup`, so a stale note is used up before the new arming. **The same box, re-armed by a mouse, is the exception:
   F2.**
3. **On a mouse, does a press on the armed box always end in `pointerup` before the next key?** On Windows (his PC and the
   squadron's Edge), yes: a left, right or middle press each ends in `pointerup` before any key. Exceptions: a held button
   while typing (his own odd act; the key then replaces, harmless); a press that starts the browser's own drag of chosen
   text (`pointercancel` early, so the box stays armed; contrived); and a Mac, whose right-click / ctrl-click menu takes
   the release (F2).
4. **Does the 450 ms line hold for the iPhone's loupe?** It cannot be settled from the code. WebKit's loupe in a focused
   field starts after a variable delay, shorter when the finger lands on the caret, and since iOS 13 the caret can be
   picked up and dragged at once. Whether that ends the page's touch with `pointercancel`, `pointerup` or nothing is not
   known here. With `pointerup` it disarms (right). With an early `pointercancel` (under 450 ms) or no event at all, the box
   stays armed and the next digit replaces the time after he moved the caret (wrong). F1's fix makes the answer not matter.

## Findings

### F1 — a long press on Android (and possibly the iPhone's quick loupe) leaves the box armed

**Failure.** An Android 12 or later phone, Chrome, Scheduler Board: tap a take-off reading 13:00 (armed), then
long-press its `00`. Android's long-press time is 400 ms, so Chrome picks the word and sends `pointercancel` at about
400 ms. That is under 450, so the box stays armed. Type `3`: `firstReplace` takes `data` `'3'` and the box reads `3`.
D1047 says a long press gives ordinary editing, which here is `13:3`. On the iPhone the same happens whenever the loupe
or a caret pick-up ends the touch with an early `pointercancel`, or with no event (question 4).
*Not checked on a device:* that Chrome's long-press `pointercancel` comes when the word is picked. If it sends `pointerup`
instead, the box is disarmed and there is no failure. His iPhone is the device that matters. Android matters only if the
squadron has schedulers on one.

**Cause.** The cancelled press is judged by its length alone, and nothing ties 450 ms to either platform. A scroll and a
caret move differ in something the code can read: a scroll leaves the caret where it was, while a long press, the loupe
or a caret drag moves it or picks digits.

**Fix** (`interactions.ts`, time-independent; the 450 ms rule stays as an extra early disarm):

```ts
const selOf = (el: HTMLElement) => {
  if (el instanceof HTMLInputElement) return `${el.selectionStart},${el.selectionEnd}`
  const s = window.getSelection(); return s && s.rangeCount ? [s.anchorNode, s.anchorOffset, s.focusNode, s.focusOffset] : null
}
// pointerdown, the armed-box branch: note the caret at the press
ARMED_PRESS = { el: t, at: Date.now(), id: e.pointerId }; (t as any)._pressSel = selOf(t)
// armFreshTime: a press whose end was not a tap is judged by the caret at the first key
const pressMoved = () => { const ps = (el as any)._pressSel; (el as any)._pressSel = null
  if (ps == null) return false; const now = selOf(el)
  return Array.isArray(ps) ? !Array.isArray(now) || ps.some((v, k) => v !== now[k]) : ps !== now }
// first line of `key` AND of `before`:
if (pressMoved()) { off(); return }
// and `off` clears (el as any)._pressSel
```

`key` runs before Backspace's `selectWhole`, so the note is used up before the code changes the selection itself. On a
keyboard that sends no `keydown` (Android's `Unidentified`), `before` makes the same check. A `pointerup` (a tap)
disarms at once, as now. Tests: a pointerdown on the armed box, then `setSelectionRange(3, 5)`, then a quick
`pointercancel`, then an `insertText` `'3'` leaving `13:3` → the box keeps `13:3`. With the caret unchanged, the quick
cancel still replaces (the M3 test as it is). Also the ≥450 ms branch (`vi.spyOn(Date, 'now')`), which has no test now.

### F2 — a press whose release never came disarms the same box when a mouse arms it again (Mac)

**Failure.** On a Mac, in Chrome or Safari, Scheduler Board: click a take-off reading 13:00 (armed). Right-click it (or
ctrl-click): `ARMED_PRESS` is set, and the menu takes the release, so no `pointerup` comes. Press Escape, then Tab
away (`off()`), then click the same box again. Its `pointerdown` finds the box unfocused (`TIME_PRESS`), and the mouse
press focuses and arms it before its own `pointerup`. That `pointerup` then finds the stale note naming this box and
calls its new `_freshOff`. Type `1`: `13:001`, the picture behind D1047. Windows and the iPhone are not affected: Windows
delivers the release, and on a phone the arming comes after `pointerup`. *Not checked:* that the Mac menu takes the
release.

**Cause.** The note is never dropped by a later press of the same pointer, and up and cancel act for any pointer.

**Fix** (`interactions.ts`, the M3 listeners): keep `id: e.pointerId` in the note (F1's line). At the top of the second
`pointerdown` listener: `if (ARMED_PRESS && ARMED_PRESS.id === e.pointerId) ARMED_PRESS = null`. A mouse always has the
same id, so a new press replaces its stale note, and each new touch has a new id, so another finger's note is left alone.
In `pointerup` and `pointercancel`, act only when `e.pointerId === ARMED_PRESS.id` (this also closes question 1's two-finger
cases). Test: pointerdown on the armed box with no up; blur; pointerdown on the same box, focus, `armFreshTime`, then
pointerup → still armed.

### F3 — not this round's (from the first D1047 build): a long press on a box not yet focused arms it

**Failure.** Android, Chrome: long-press a take-off reading 13:00 that is not focused. `pointerdown` sets `TIME_PRESS`,
Chrome picks `00` and sends `pointercancel`, and then focuses the box. The focus arrives within 1.5 s, so the box is
armed. Type `3`: `3` (`data`), where D1047's long press should give `13:3`. The same note lets the iPhone's ‹ › form arrows
arm a box: a scroll started on box B leaves `TIME_PRESS` set to B, and ›, which sends no key, reaches B within 1.5 s and
arms it, though D1047 says "a Tab arms nothing".

**Cause.** The new `pointercancel` listener clears `TIME_DOWN` but not `TIME_PRESS`. A cancelled press was never a tap.

**Fix:** in the `pointercancel` listener, `TIME_PRESS = null` beside `TIME_DOWN = null`. A tap never ends in
`pointercancel`, so no arming tap is lost. Test (with edit mode on, or arming never runs): pointerdown on an unfocused time box,
`pointercancel`, focus it → not armed.

## Test gaps, no failure

- **T1 — M2 is unpinned.** Add the narrow read's own test: `placeSuggestion` on a `09:40` box, `setSelectionRange(3, 5)`,
  set the value to `09:4`, then an `InputEvent('input', { inputType: 'insertText', data: '4' })` → the box keeps `09:4`. It fails on
  the code before the fix (`'4'`) and passes now.
- **T2 — `insertReplacementText`** read by its shape, as M1 asked (one line in the `firstReplace` block).

## Checked and right

- The M3 test's two halves run the real listeners: the box sits inside `#eWeek`, so `isTimeBox` passes, and it is
  focused, so the armed branch is taken. A quick cancel keeps the box armed, and a pointerdown then pointerup disarms it.
- On a phone, the arming tap itself can never be disarmed by the new `pointerup` line: the box is not yet focused at that
  tap's `pointerdown`, so no note is made.
- A mouse second press then a drag: `pointerup` disarms through the note, and the drag check finds nothing armed. The
  result is the same as before the round.
- A Windows right-click: disarmed at `pointerup`, before the menu, so a Paste from it is ordinary. The same as before the
  round, when it disarmed at `pointerdown`.
- `pointercancel` now clearing `TIME_DOWN` removes the earlier read's harmless stale value.

## Open, for the walk on his iPhone (with the narrow read's list)

- Tap a box, then touch the caret itself and drag it at once (no hold), then type: digits edited in place. Before F1's fix
  this depends on what WebKit sends (question 4).
- Tap a box, long-press it and move the loupe, then type: edited in place.
