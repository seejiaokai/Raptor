# D1047 — the narrow read of the fix for F1–F4 (19 Oct 26)

A fresh Opus reader, blind to the chat that wrote the fix and to the first read's own chat. Read: the fix commit's code and
tests only (`interactions.ts` — `oweChange`, `selectWhole`, `armFreshTime`, `isTimeBox`, `sugAddr`; RB11's new block in
`brieftime-ui.test.tsx`; the e2e step in `rallybox.spec.ts`) against `read-d1047.md` §F1–§F4, with the code each one
touches (`board.ts` `boardChange`, `boardTab`; `textedit.ts` `routeKeyDown`, `refreshTextDestination`, the week's
`[data-inp]` focus-out; `html.ts` `inpTimeCells`; `slots.ts` `txtSet`). D56 applied: nothing below lives only in stored data.
`npx vitest run src/ui/brieftime-ui.test.tsx` — 32 of 32 pass. No browser run (the gate lock was held).

## Finding

### N1 — F4's Backspace undoes F2: digits chosen with a drag, then Backspace or Delete, still empty the whole time

**Failure.** Desktop board or week, a take-off reading 13:00, not focused: press and drag across `00` (one press, so the
box arms), press Backspace. Expected `13:` (F2, and D1047's "dragging gives back ordinary digit editing"). Got: the box
empties. Delete the same. This is exactly F2's failure, which the fix was meant to close; only typing over the drag is right.

**Cause.** `keydown` always comes before `beforeinput`. The new `key` handler, on Backspace or Delete without Ctrl/Cmd/Alt,
calls `selectWhole(el)` unconditionally and then `off()` — so his chosen range is replaced by the whole time before `before`
(where F2's check lives) can see it, and `before` is no longer listening anyway. F2's unit test raises only
`beforeinput`/`input`, never the `keydown`, so it passes over the failure.

**Fix** (`armFreshTime`, `interactions.ts`). Share F2's selection test, make F4 select the whole time only when the caret is
collapsed, and keep the box armed through the key, so the clear is read by `after` whatever the browser actually deleted:

```ts
const chose = () => el instanceof HTMLInputElement ? el.selectionStart !== el.selectionEnd : !(window.getSelection()?.isCollapsed ?? true)
let ours = false                       // the whole time was selected by F4, not by him
const before = () => { if (!ours && chose()) { off(); return } ; was = boxValue(el) }
const key = (e: KeyboardEvent) => {
  if (/^(Arrow|Home$|End$)/.test(e.key)) { off(); return }
  if ((e.key === 'Backspace' || e.key === 'Delete') && !e.ctrlKey && !e.metaKey && !e.altKey) {
    if (chose()) { off(); return }      // digits he chose: ordinary editing (F2)
    selectWhole(el); ours = true        // F4: stay armed — `after` reads the deletion as '' and owes the board its change (F1)
  }
}
```

Staying armed also removes a dependency the built version has on his iPhone: as built, the clear relies on WebKit honouring a
selection made inside `keydown` (and `input.select()`, which older iOS ignored — `setSelectionRange(0, el.value.length)` is
the safer call in `selectWhole`); if it does not, one digit goes (`13:0`) and the box is already disarmed, which is worse than
before F4. With `ours`, a one-digit deletion still reads as a deletion (`firstChange` → `''`), so the box clears either way.
Test: in RB11, `setSelectionRange(3, 5)`, raise `keydown` Backspace, then `beforeinput`/`input` deleting `00` → `13:`, still
not `''`; and caret collapsed + keydown + a one-character deletion → `''` with one owed `change` on blur.

## Checked and right

- **F1, the owed `change`.** All three engines raise a text box's own `change` before its `blur` (the document's focus change
  dispatches it first), so `native` marks it paid before `leave` runs — no doubled save on Tab or a tap elsewhere. Enter: the
  browser's own Enter `change` (if the value moved since the rewrite) runs before the `setTimeout(pay)`; if none, `pay` raises
  it; a later blur finds it paid. A doubled `change` would in any case be refused by `txtSet` (`was === v → false`) on a
  schedule box. `boardTab`'s day step blurs (→ `pay`), then compares the box with the now-saved schedule; a second `change`
  there is the same no-op the browser's own path already produced before this fix.
- **Escape.** The board's time-box Escape writes `fmtTxt(boxText)` and an input row's writes `inpTimeText` — the same readers
  `refreshTextDestination` uses on arrival — so `shown` (read on `beforeinput`, after the arrival) equals the restored value
  and nothing is paid. The e2e step (type `9`, Escape → schedule and box 13:00) covers it in a real browser.
- **A redrawn box.** `isConnected` stops a `change` on a detached box, which could not reach the board's listener anyway; a
  box replaced under the caret loses typed text on the browser's own path too — not new. Listeners: `oweChange`'s three go on
  `blur`; a box thrown away takes them with it. Leaving the window (switching app) blurs the box and pays — the same moment the
  week already saves at.
- **F3.** The week's input cells are inside `#eWeek` (the day's markup), carry `data-inp="<tail>.str|end"`, save on focus-out
  with their own "unchanged → nothing" guard, and restore on Escape — nothing more needed. The "all day" cell is empty and is
  never armed. Nit, no failure: the regex's dot is unescaped (`/.(str|end)$/`, meant `/\.(str|end)$/`); the only other
  `data-inp` field is `rmks`, so nothing else matches today.
- **`sugAddr`.** `SUG_PRESS` notes and matches only `.sugbox` elements, which are only the R and B boxes (`data-bfld` /
  `data-txt`, read first, unchanged); no input-row box is a `.sugbox`, so suggestion placing is untouched. `TIME_PRESS` now
  tells input-row boxes apart by their own address instead of all sharing `null`.
- **Ctrl/Cmd/Alt+Backspace** skip F4 and stay armed; their word or line deletion reads as a deletion and clears the time —
  consistent with "Backspace clears it".

## Test gaps (no failure found)

- No real-browser step pays the owed `change`: since F4, the e2e's Backspace-then-Tab goes through the browser's own deletion
  and its own `change`; the only owed case it reaches is Escape (nothing paid). Add: tap 13:00, type one digit, Tab → saved;
  and a paste of `1300` as the first change, Enter → 13:00.
- **The walk on his iPhone settles N1's iOS half:** board, tap a take-off once, soft-keyboard Backspace → empty; Tab/Done →
  the schedule shows it cleared.
