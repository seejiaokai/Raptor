# D1047 — the second narrow read: the fix for N1 (19 Oct 26)

A fresh Opus reader, blind to the chat that wrote the fix and to the earlier reads' chats. Read: the fix commit's code and
tests (`interactions.ts` — `firstReplace`, `firstChange`, `firstTypingReplaces`, `placeSuggestion`, `oweChange`,
`selectWhole`, `armFreshTime`, the `TIME_DOWN` / `TIME_PRESS` listeners; RB11's changed block and the new `firstReplace` block
in `brieftime-ui.test.tsx`; the e2e step in `rallybox.spec.ts`) against `read-d1047-narrow.md` §N1. The board's time boxes
are plain `<input>`s with no `inputmode` (`board.ts`, `board-html.ts`), so a phone shows its full text keyboard there.
D56 applied: nothing below lives only in stored data. `npx vitest run src/ui/brieftime-ui.test.tsx` — 34 of 34 pass.
No browser run, no phone.

**N1 itself is closed:** a drag now disarms on `pointerup` (a press that moved more than 6px) before any key, so
Backspace or Delete after digits chosen by a mouse drag is ordinary editing again (`13:`); a keyboard selection disarms on
its arrow key; a second press disarms on `pointerdown`. And Backspace staying armed means a phone that ignores the
selection made inside `keydown` still clears the time, which was N1's iOS point.

## Findings

### M1 — this round: an Android keyboard's composed word is taken as the new time

**Failure.** Android phone, Chrome, Gboard (or Samsung's keyboard), Scheduler Board: tap a take-off reading 13:00 once,
type `1`. Gboard picks up the word under the caret and composes it again, so the browser's change is
`insertCompositionText` with `data` = the whole composed word (`"001"`, or `"13:001"` if it treats the time as one
word), not `"1"`. `firstReplace` returns that `data`: the box reads `001` (saved as 00:01) or `13:001` (no change). Before
this round the shape reading (`firstChange`) gave `1`. The week's boxes, which are editable text, the same.

**Cause.** `firstReplace` returns `ie.data` for every `inputType` that starts with `insert`. Its own comment says "an
insertion that added exactly that much", but nothing checks it. Only a typed `insertText` (and a paste, when the browser
gives its text) reliably carries just what was put in. A composition carries the whole word being composed, and an
`insertReplacementText` carries the replacement for a word.

**Fix** (`interactions.ts`, `firstReplace`):

```ts
if ((kind === 'insertText' || kind === 'insertFromPaste') && typeof ie.data === 'string' && ie.data) return ie.data
```

Every other insertion goes to `firstChange` as before this round, which reads an Android re-composition at the end of the
time correctly (`13:00` → `13:001` → `1`). Correct the comment above it to say which kinds are trusted and why. Test, in the
`firstReplace` block: `firstReplace('13:00', new InputEvent('input', { inputType: 'insertCompositionText', data: '001' }),
'13:001')` → `'1'`; the same with `insertReplacementText` → read by shape.
*Not checked on a device:* how Gboard treats a time as a word. The fix is right whichever way it does. Rewriting the box in
the middle of a composition (which the code did before this round too) is owed one look on an Android phone if the
squadron has schedulers on one. His iPhone types `insertText` and is unaffected.

### M2 — this round: a placed suggestion with some of its digits chosen, typed over, loses the rest

**Failure.** Desktop Scheduler Board, an empty B box suggesting 07:20: click it (placed, caret after it), double-click
`20` (chosen), type `4` `5`. Before this round: `07:4` then `07:45`. Now: `4` then `45`, which is not a time. The same
for `20` chosen with shift+arrow or a mouse drag, and on the week's boxes. D1047's rule is that a second press, a drag or
an arrow key gives back ordinary digit editing, and here none of them does.

**Cause.** The suggestion's first change goes through `firstTypingReplaces`, which now calls `firstReplace` and so takes
`data` (`"4"`) whatever was chosen. Unlike an armed box (`armFreshTime`), that path has no second-press, drag or arrow
give-back, so it never learns that the digits were chosen. Before this round the shape reading kept an insertion that
left the box shorter (`07:4` → `null` → kept as typed).

**Fix** (`interactions.ts`, `firstTypingReplaces`): keep the suggestion on the shape reading, as it was before this round:

```ts
const n = firstChange(sug, read(), (e as InputEvent | undefined)?.inputType || '')
```

A placed suggestion's caret is always at its end, where the shape reading is exact, so this round's `0915` case cannot
arise there. Test: `placeSuggestion` on a `09:40` box, `setSelectionRange(3, 5)`, an `insertText` input with `data: '4'`
leaving `09:4` → the box keeps `09:4`.
*The fuller form, recommended as its own small change:* the placed suggestion still keeps none of D1047's give-backs. An
arrow key, then typing, replaces it, and so does a second press (both were like this before this round). Placing could arm
the box through `armFreshTime` in place of `firstTypingReplaces` (both branches): it reads the suggestion on `beforeinput`,
and its arrow, second-press, drag, Backspace and leaving rules then serve the suggestion too, which is what D1047's "every
time box" and D1038's "same first-change rule" say. The suggestion's own `save` on leaving stays. The `change` that
`oweChange` owes reaches `txtSet` with the stored value after an Escape, and `txtSet` makes nothing of it.

### M3 — not this round's (from the first D1047 build): a scroll that starts on the armed box ends it

**Failure.** iPhone, Scheduler Board: tap a B box reading 16:00 (armed, keyboard up), then push the board up with the
finger starting on that same box, to see it above the keyboard (D1048 is not built yet). Type `1`. Got: `16:001`, the
picture behind D1047. Expected `1`.

**Cause.** The second-press check runs on `pointerdown` (`document.activeElement === t && t.dataset.fresh` → `_freshOff`),
and a touch fires `pointerdown` when the finger lands, before the browser knows whether it is a tap, a long press or a scroll.

**Fix** (`interactions.ts`, the listeners): note the press on the armed box at `pointerdown` and decide at its end. On
`pointerup` (a tap, or a drag on it) it is a second press, so `_freshOff`. On `pointercancel` (the browser took the
gesture) disarm only for a press held 450 ms or longer, which is a long press or the loupe moving the caret. A shorter one
is a scroll, and the box stays armed:

```ts
let ARMED_PRESS: { el: any, at: number } | null = null
// pointerdown, in place of the immediate _freshOff:
if (document.activeElement === t && t.dataset.fresh) { ARMED_PRESS = { el: t, at: Date.now() }; TIME_PRESS = null; return }
// pointerup:
if (ARMED_PRESS) { ARMED_PRESS.el._freshOff?.(); ARMED_PRESS = null }
// pointercancel:
document.addEventListener('pointercancel', () => { const p = ARMED_PRESS; ARMED_PRESS = null; TIME_DOWN = null
  if (p && Date.now() - p.at >= 450) p.el._freshOff?.() }, true)
```

A mouse is unchanged: every press ends in `pointerup`, before any key. Test: a pointerdown on the armed box then a quick
`pointercancel` leaves it armed; pointerdown then pointerup disarms it. The 450 ms line, and whether the iPhone's loupe
ends in `pointercancel`, go to the walk on his iPhone (below).

## Checked and right

- **What `data` gives, kind by kind** (with M1's fix): a typed digit gives `1`. A digit typed over any selection the box
  still armed holds (select-all, ctrl+A, a word a single tap left chosen) gives what was typed. iOS dictation gives
  `insertText` with the words, the same. A paste whose `data` is null (Chrome's editable text, and maybe its `<input>`)
  falls to the shape reading, as before this round (see the gap below).
- **A partial selection made by keyboard** (shift+arrow, shift+Home / End, ctrl+shift+arrow): `keydown` comes before
  `beforeinput`, and the arrow / Home / End test disarms the box first. The typed digit edits the chosen digits.
- **The drag test against a tap.** A finger's first tap arms the box after its `pointerup`, because the focus comes with
  the mouse events that follow `touchend`. So a finger that moves a few pixels during a tap (Android lets 8dp count as a
  tap) can never disarm the box it is arming. A mouse click moving 6px or less stays armed. A `pointercancel` leaves
  `TIME_DOWN` stale, but the next `pointerdown` always overwrites it, so it is harmless. A mouse double-click disarms on
  its second press, as D1047 says. A two-finger pinch while a box is armed overwrites `TIME_DOWN` and may disarm it: rare,
  and it fails safe (ordinary editing).
- **Backspace staying armed.** Ctrl / Cmd / Alt + Backspace and Delete at the end each delete the selected whole and read
  as a deletion, giving an empty box. A held key: the first press clears and disarms; the repeats do ordinary editing on an
  empty box. Android's keyboard often sends Backspace as `Unidentified`, so the whole time is not selected and one digit
  goes, but the box is still armed and the first-change reading empties it (N1's point holds there too). On the week, an
  emptied editable box may keep a `<br>`: its `textContent` is `''`, and `setBoxValue` clears it.
- **The owed change after a Backspace clear.** `after` calls `oweChange(el, '13:00')`. On Tab, the browser's own `change`
  marks it paid, or `pay` raises it, so exactly one either way. Escape puts 13:00 back, which equals `shown`, so nothing is
  paid. The e2e's Backspace-then-Tab step proves the saved `''`, and its new `insertText('0915')` + Tab step proves a
  first-change rewrite paid on leaving (the previous read's test gap is closed).
- **`selectWhole`** with `setSelectionRange(0, length)` in place of `select()`: right, and the safer call on old iOS.

## Gaps, no failure found this round

- **A paste with no `data`, caret not at the end.** The shape reading still turns `0915` pasted into `13:0|0` into
  `9150`. This is not new, and a paste as the first change is rare. If it is wanted: read the caret at `beforeinput`
  (`selectionStart` / `selectionEnd`, or the selection's range on the week) and take `v.slice(start, start + v.length -
  (was.length - (end - start)))`, which is exact for every insertion and could in time replace both `data` and the shape.
- **Nit.** The `firstReplace` test calls "a word a double tap selected, typed over" a fresh time. On a real phone a
  double tap's second tap disarms the box first (second press), so that case is only reached when a single tap leaves a
  word chosen, which is what the browser test saw. Reword the comment and test name so they are not taken as a promise
  for double taps.
- **Shift+Delete on Windows is Cut.** On an armed box it now cuts the whole time to the clipboard: the box clears, as for
  Delete, and the clipboard gets `13:00`. The same before this round (Shift was never excluded). Harmless.

## Open, for the walk on his iPhone

- Tap a B box once and press the soft keyboard's Backspace: empty. Then Done: the schedule shows it cleared (N1's iOS half,
  still owed).
- Tap a box, scroll the board with the finger starting on that box, then type: replaced (M3, after its fix).
- Tap a box, long-press it and move the caret with the loupe, then type: digits edited in place (M3's 450 ms line).
- **Not covered by any give-back, from the first build:** the iPhone's own way to drag the caret, holding the space bar
  and sliding, sends no key and no press to the page. The box stays armed, and the next digit replaces the time, where
  D1047 says dragging the caret gives ordinary editing. The likely cure is to watch `selectionchange` while the box is
  armed: a caret move after the tap has settled, not made by Backspace's own whole-time selection, disarms it. Whether
  Safari reports that move is for the walk to settle before it is built.
