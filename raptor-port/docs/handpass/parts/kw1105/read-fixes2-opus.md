# The keys and windows batch: a fresh Opus read of the G1 and G2 fix (commit 18af1a235), 5 Nov 26

This read covers `raptor-port/src/ui/DocViewer.tsx` and `raptor-port/src/ui/sheetfocus.ts` as changed by 18af1a235, measured
against G1 and G2 in `read-fixes-opus.md`. It was a blind read: I did not write the fix. I read the code only. I ran no tests and
no browser.

## Findings

### H1 (MEDIUM): G2's search of the whole week can send the keys to another input's "→ Ground" / "→ Unavail"

**What he does.** He is on Edit Schedule with the keyboard. Saturday shows one input that asks the OIL question, say an Event,
with its "→ Ground" button. Monday, further left and scrolled out of view, shows another input with its own "→ Ground". He Tabs to
Saturday's "→ Ground" and presses Enter. The OIL question opens (`OilWaitSheet` → `OilConfirm`, which uses `useSheetFocus`). He
answers it and saves.

**What goes wrong.** The input goes onto the programme, and its card on Saturday now shows "Reject" instead of "→ Ground". The
sheet closes and the keys go to **Monday's "→ Ground"**, which belongs to a different input and is out of sight (`preventScroll`).
His next Enter or Space puts Monday's input on the programme, a change he never saw. On a published day that change is pending
and the four sign-offs fall (D103). If the input asks OIL, a second question appears for an input he did not touch.

Before G2 (with F4 alone) the keys went nowhere, which is the outcome G2 itself describes as better than a wrong control. There
is a second form of this that comes from F4 and was not added by G2: if Saturday holds two such inputs, the keys go to the second
input's "→ Ground" on the same day.

**Cause.** In `sheetfocus.ts locate` the twin is found by the control's **first** data attribute
(`const da = [...el.attributes].find(x => x.name.startsWith('data-'))`). The accept buttons are drawn as
`<button class="accb" data-acc="${dest}" data-accd="${di}" data-acck="${k}">` (`html.ts` 2420–2434). Their first attribute is
`data-acc`, and its value is only the destination (`g`, `u` or `x`), not which input the button belongs to. So
`button[data-acc="g"]` matches every unaccepted input's "→ Ground" on every day. G2's new `pick(weekBox)` now searches all of them
across the week (line 120). Of the in-day controls drawn in `html.ts`, this is the only one whose first data attribute says
nothing about which item it belongs to. The others carry the day index (`${di}…`, a slot key) or the input's id (`data-inpedit`,
`data-lateoff`). `data-dwclear="1"` opens no sheet.

**Fix.** Make the search look for the control's identity, not only its first attribute. The narrow fix: when the element carries
`data-acck`, add it to the selector:

```ts
const sel = el.id ? `[id="${q(el.id)}"]` : da ? `${tag}[${da.name}="${q(da.value)}"]` + (el.dataset.acck != null ? `[data-acck="${q(el.dataset.acck)}"]` : '') : ''
```

A broader alternative: build the selector from every `data-*` attribute except the amendment marks (`data-alp`, `data-aln`).
That costs a few legitimate re-finds, where the answer becomes "nothing" rather than a wrong control. With the narrow fix, the
pressed button (now `data-acc="x"` with the same `data-acck`) is no longer matched on any day, so the keys go nowhere, as before
G2. **Red test first**, in `oilkeysback.test.tsx`: draw `<button data-acc="g" data-acck="i1">` on day 5 and
`<button data-acc="g" data-acck="i2">` on day 0. Focus day 5's button and raise a sheet. Redraw day 5 as
`<button data-acc="x" data-acck="i1">` and close the sheet. The keys must not be on day 0's button. Then the same check with i2
on day 5 too.

### H2 (LOW): when the page shown is itself gone, the viewer can move to another entry while that entry still has a page

**What he does.** Medical: an episode of A (one file), B (two files) and C. He adds B's second file in B's window and saves. He
opens the episode from B's card, steps › to B's second file ("3 of 4"), then presses Undo on the bar. Undo works with the viewer
open (D1645), and it takes the second file away.

**What goes wrong.** The viewer shows **C's** paper, title and "Edit input" ("3 of 3"), though B still has its first file at
"2 of 3". This is G1's own harm (the "Edit input" he presses opens an entry he was not reading), on the one path G1 left as it
was.

**Cause.** `DocViewer.tsx` line 77. When the shown key is gone, the fallback is `els[Math.min(i, els.length - 1)]`, the page that
slid into the old position. That is the next entry's page whenever the gone page was not the last.

**Fix.** Look first for a page of the same entry, then for the neighbour:

```ts
const sid = shown.slice(0, shown.lastIndexOf('#'))
let k = -1; els.forEach((e: any, n: number) => { if (pageKey(e).startsWith(sid + '#') && (k < 0 || n <= i)) k = n })
setShown(pageKey(els[k >= 0 ? k : Math.min(i, els.length - 1)]))
```

Only do this when `sid` is non-empty: a read-only page has no input id and keeps today's fallback. Red test: the
`barfree.test.tsx` episode with B given two files, its second file shown, that file taken away → the title is still B's.

## What I checked and found right (no finding)

- **The state set during render cannot loop or fight the pager.** `turn` sets the page and the key together, so after a › press
  the next render finds the key at the new page and sets nothing. An unrelated repaint (a notify) finds the same key at the same
  page and sets nothing. The "gone" branch sets a key taken from `els` itself, so the next render finds it and settles. At most
  two extra renders, never React's re-render limit.
- **A viewer opened again on another entry.** Every `setDocView` is a new object (`pops.ts` 113), so `v !== seenV` re-seats both
  the page and the key from `seatAt`. Closing (`v` null) clears the key to `''`, so nothing is tracked while closed.
- **Two pages with the same key.** No caller produces them. `MedicalView.open` passes `medEpisode`'s distinct inputs. Every
  read-only caller (`leavewar/sync.ts` 3164 and 3185, `InputWindow.tsx` 85) passes ONE row, whose pages differ by file id. A
  read-only row with no input id gives `#<docId>`, still distinct. A single row with no document is one page. *Latent only:* if
  two pages ever did share a key, `findIndex` would return the first, and a › press would snap back to it.
- **The shown page gone, then a Redo bringing it back.** The view stays on the neighbour it fell to (G1's "kept by what it
  shows", applied after the fall). It does not jump back. I think that is right: the page on screen is never changed by a press
  he did not make.
- **`seatAt` by `docId`.** It seats on the file pressed, and the key carries that file's id, so a later change to the list keeps
  that file.
- **The document address is not re-made.** When the list changes, the page index moves but the entry stays the same, so `doc`
  (`docGet(cur.docId)`) is the same object and the effect does not mint a new URL.
- **G2's other paths.** If the week is gone (a page change), `pick(null)` gives null. A control in no day (the board, the bar)
  is searched as before. The original day is searched again in the week pass, which is harmless. The rest of the controls that
  open a sheet or menu from a day (`data-dayinfo`, `data-planmenu`, `data-daytplopen`, text boxes `data-txt`, `data-inpedit`,
  `data-sarole`/`data-stcfg` slot keys) name their day or their input, so the week fallback cannot reach a different control
  for them.

## Questions

1. H1's narrow fix covers the one control I found. Should `locate` instead take a short list of identity attributes, so that a
   future control drawn with a generic first attribute cannot bring this back? I would build the narrow fix now and file the
   list as a note.

## What I did not read

- The batch's other changes, except where this commit touches them.
- `board.ts` 1643 and `sheetfocus.ts` 213 and 245 (the menus' anchors), past checking that their anchors are board controls or
  day-indexed buttons.
- `barfree.ts` and `SchedBoard.tsx` beyond their call lines.
- The CSS.
- Whether `oilGate` asks for every kind on every day. I relied on the code comment in `interactions.ts` (the → Ground and
  → Unavail OIL wait) and on `OilWaitSheet` using `OilConfirm`.

I ran no test and no browser. Both findings come from reading the code and have not been reproduced.
