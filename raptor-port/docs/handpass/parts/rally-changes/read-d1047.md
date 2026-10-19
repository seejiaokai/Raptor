# [RALLY-BOX-CHANGES] — the fresh read of D1047 (one tap into a time box, then typing, replaces its time) — 19 Oct 26

Reader: a fresh Opus 5.5, blind to the chat that wrote it (D790; no Fable, D903). Read: `git show 360e37b8f -- raptor-port/src
raptor-port/e2e`; `git diff 360e37b8f -- raptor-port/src` (empty — no follow-up); D1047's full row; and around the change
`firstChange`, `placeSuggestion`, `SUG_PRESS`, `textedit.ts` (`ARRIVING`, `routeFocusIn` / `refreshTextDestination`,
`routeKeyDown`'s Escape and Enter branches), `board.ts boardChange` / `boardTab`, `SchedBoard.tsx`'s held paint, the board's
time-box builders (`board.ts` R/B/TO/LD, `board-html.ts` `sbTxt('atm')`, the input row's `fld('atm')`), the week's `ted()` and
input cells (`html.ts`), and every e2e file that types into or fills a time box. Ran: `npx vitest run
src/ui/brieftime-ui.test.tsx` — 28 of 28 pass. No browser run (the gate lock was held); F1 is reasoned from browser behaviour
this codebase already records, and names the one walk step that settles it.

## Findings

### F1 — on the Scheduler Board, a time cleared by the first Backspace (or replaced by one paste) is never saved

**Failure.** Board, a take-off reading 13:00: tap it, press Backspace — the box empties (as built). Press Enter, Tab, or tap
elsewhere: no save. The schedule still holds 13:00; the box keeps showing it empty until something else repaints the board
panel, when 13:00 comes back. On a published day no amendment is raised for the clear he thinks he made. The same for a
whole time pasted (or put in by one iOS QuickType / autofill insertion) as the first change: the box shows `1300`, nothing
saves. Typing digit by digit is not affected — after the first digit the rest are ordinary typing, which the browser does see.
It applies to every `<input>` time box on the board, the input rows' start and end (`data-ifld`, saved by `setInpField`)
included. The week is not affected: it saves on leaving the box by reading what the box holds.

**Cause.** The board saves only on the browser's `change` event (`SchedBoard.tsx` → `boardChange`). After the first change,
`armFreshTime`'s `after` rewrites the box with `el.value = …` (`setBoxValue`). A value set by script while the box has the focus
resets the browser's own "has the user changed this?" baseline, so when the box is then left or Enter is pressed the browser
sees no change from that baseline and raises no `change`. This codebase records the behaviour twice: `placeSuggestion` raises
`change` itself because "the browser raises only for what was typed" (walker B's F3: Enter after a placed suggestion did not
save), and `boardTab` raises it by hand when the box and the schedule disagree. The new path has neither. The e2e test misses
it: its Backspace step is followed by Escape, never by Enter or Tab.

**Fix** (`interactions.ts`, `armFreshTime`, the `<input>` case only). After `setBoxValue(el, n)` in `after`, owe the board a
`change` until the browser raises one, in the same way `placeSuggestion` owes its save, comparing with the schedule as `boardTab`
does so a save can never be doubled:

```ts
if (el instanceof HTMLInputElement) {
  let paid = false
  const native = () => { paid = true }
  const pay = () => { if (!paid && el.isConnected && el.value !== w) { paid = true; el.dispatchEvent(new Event('change', { bubbles: true })) } }
  const enter = (k: KeyboardEvent) => { if (k.key === 'Enter') setTimeout(pay, 0) }   // after the browser's own Enter change, if any
  const leave = () => { pay(); el.removeEventListener('change', native); el.removeEventListener('keydown', enter); el.removeEventListener('blur', leave) }
  el.addEventListener('change', native); el.addEventListener('keydown', enter); el.addEventListener('blur', leave)
}
```

Escape stays right: `routeKeyDown` puts the old time back (`fmtTxt` — equal to `w`, which the box showed) before its blur, so
`pay` sees no difference and writes nothing. Add to the e2e test, after the Backspace step: Tab (not Escape), then
`expect.poll(f).toBe('')`, and a paste case (`insertText` of `1300` as the first change, then Enter → `13:00`). **The walk
step that settles it:** board, tap a take-off, Backspace, Tab — read the schedule.

### F2 — the first press made as a drag-selection, then Backspace, empties the whole time

**Failure.** Desktop board or week, a time reading 13:00 not yet focused: press and drag across `00` (one press), press
Backspace. Expected `13:` — the digits he chose — and the box empties instead. Selecting `13` that way and pressing Backspace
empties it too. (Typing over such a selection is right: it keeps what was typed.) D1047 says dragging the caret gives back
ordinary digit editing.

**Cause.** The drag is a single press, so the box arms on its arrival. A deletion of the selection's end or start has exactly the
shape of "a Backspace at the caret" (`firstChange`: the box now holds the old time with something taken out), so it is read as
"empty the box".

**Fix.** In `armFreshTime`'s `before`, give back ordinary editing when he has already selected something:
`const sel = el instanceof HTMLInputElement ? el.selectionStart !== el.selectionEnd : !(window.getSelection()?.isCollapsed ?? true); if (sel) { off(); return }`.
A select-all then Backspace or typing is unchanged (the browser does it on its own), and RB11's "a selection typed over keeps
what was typed" still holds (jsdom leaves the caret collapsed at the end).

### F3 — the week's input rows' start and end are left out; the board's are in

**Failure.** On the week, tap an accepted input's start "08:00" and type `0900`: the box reads `08:000900`, as before D1047. The
same input's start on the Scheduler Board is a D1047 box (class `atm`) and replaces. D1047 is "every time box", the board and
the week alike.

**Cause.** `isTimeBox` takes a week box only by `data-txt` matching `TIME_TXT`; an input's own cells on the week carry
`data-inp="<id>.str|end"` (`html.ts` `cell()`), not `data-txt`.

**Fix.** In `isTimeBox`'s contenteditable branch also accept `/\.(str|end)$/.test(el.dataset.inp || '')`, and in `sugAddr`'s
use for `TIME_PRESS` read `data-inp` / `data-ifld` too (`h.dataset.bfld || h.dataset.txt || h.dataset.ifld || h.dataset.inp`), so
these boxes are matched by their own address rather than all by `null`. Their save (focusout, `[data-inp]`) and Escape
(`routeKeyDown`'s `ic` branch) need nothing. The "all day" box (empty, its words a placeholder) arms nothing, as an empty box
never does.

### F4 (small) — a tap that lands the caret at the very start, then Backspace, does nothing

**Failure.** A tap or click on the left edge of the first digit puts the caret before it; Backspace then deletes nothing, the
browser raises no change, and the time stays (the box stays armed, so the next digit typed does replace it). "One tap then
Backspace clears it" fails for that tap. Delete with the caret at the end is the same.

**Cause.** `armFreshTime` acts only on a change the browser makes; at the start of the box Backspace makes none.

**Fix.** In `armFreshTime`'s `key` handler, while armed: on `Backspace` or `Delete` with the caret collapsed, select the whole
time first (`el.select()` for an `<input>`; a range over the box's contents for the week) and let the key go on — the browser
then deletes it itself, so its own `change` follows on the board and F1's owed save is not needed for this path.

## Checked and right

- **A box drawn again under the press.** The board and the week hold the panel the press is going to (`textedit.ts ARRIVING`,
  `SchedBoard.tsx` held paint), so the box normally survives; where it is drawn again, `TIME_PRESS` matches by address and a
  passing focus elsewhere (the board's own frame, a non-time box, another address) does not use the note up — the same shape
  as `SUG_PRESS`.
- **Every board time box** is `input.tm` / `input.atm`: R, B, take-off, landing; duty, sim, ground and programme START/END
  (`sbTxt('atm')`, `boxHTML`); the common programme (`ap:`); an input row's start and end. Every week time box built by
  `ted()` carries `data-txt` with a `TIME_TXT` key (`.to .ld .br .rl .str .end`). Only F3's input cells are missing.
- **Read-only, View-only, a member, a look at an older version.** A read-only board draws `disabled` inputs (`isTimeBox`
  refuses them); the week draws no `contenteditable` for them; `focusin` also asks `canEditSched() && editMode()`. Nothing arms.
- **A published day.** The save path is the same as typing (`boardChange` → `txtSet`, the week's focusout), apart from F1.
- **Tab** arms nothing (no press; every keydown clears the note). **Keydown before focus** cannot happen on a tap; arming is
  synchronous in `focusin`. **A press that becomes a scroll or a drag** (a finger scroll, a grip or puck drag): no focus
  arrives, the note expires in 1.5 s, and a row or puck drag never starts on a time box.
- **A second press** on an armed box disarms it before the browser moves the caret; a double or triple click disarms on its
  second press and the browser's own word or whole selection is then typed over as usual.
- **Arrow / Home / End** disarm; Shift+Arrow too. Ctrl+A then typing or Backspace comes out right either way.
- **iOS.** The tap's order (press, focus, then the click that may move the caret) is handled: the caret's place does not matter,
  since the value is read on `beforeinput`. `insertReplacementText` and `insertFromPaste` are read as insertions (right, but see
  F1 for the board's save). Android keyboards that type through composition (`insertCompositionText`) get their text rewritten
  in the middle of a composition — the same exposure `placeSuggestion` already has; the owner's phone is an iPhone, and digits on
  iOS do not compose. Not a finding; worth one Android look if members ever edit times.
- **Escape while armed** puts the old time back and leaves (week and board); `blur` disarms. **Enter** commits as before.
- **The suggestion on the same press.** An empty box is never armed (`boxValue(el).trim()` at `focusin`, before
  `placeSuggestion` runs in its `setTimeout` or on the click), and a placed suggestion is never re-armed (`dataset.placed`).
- **Listeners.** Each armed box's four listeners go at its first change, an arrow key, or `blur`; a box thrown away while armed
  takes them with it. The three document listeners are added once, at load.
- **Existing tests.** No e2e test clicks a time box and then types expecting the digits added: `schedule-tab.spec.ts` presses or
  clicks then `fill()`s (the browser's select-all then insert — a shorter value replacing a selection, kept as typed), or
  focuses by script (`last.focus()`, no press, nothing armed); `geometry.spec.ts` fills without a press; `changeswin.spec.ts`
  writes by script. No unit test raises a press on a time box. Nothing gets a replaced value where it expected an added one.
