# The Leave War small fixes — the fresh, blind Opus code read (21 Oct 26)

A fresh Opus helper that did not write the code (D790; no Fable, D903; no Astra or Sol — ChatGPT is out, D761), given the
evidence sheet, the walkers' tables and the scenario list, asked for absences as well as errors, told D56 and D489. Its
report as returned; the host's dispositions are in the sheet's §13.

**Result: no HIGH or MEDIUM findings. Three LOW.**

## LOW

**L1 — The date question appears for a date the posting will refuse (item 7).** W1 saw this in scenario 17.
- Failure: Probey is posted in on 24 Oct with a Delete posting dated 31 Oct. Pick 20 Oct in the Post out sheet's date box.
  "Tap again to delete Probey" appears and the line reads "On 20 Oct: deleted…". Only the second tap brings the refusal
  ("Posted in on 24 Oct…"). The button promised a delete the app will never do.
- Cause: in `BidPicker.tsx PostOutSheet`, the date box's onChange only asks `deletesNow(v)` before setting `askDate`. The
  refusals (`postingProblem(id,'out',from)` and the never-delete-yourself check `postOutProblem`) are only reached inside
  `postOutOr` when the date is saved.
- Fix: a prop `refusedAt?: (poDate: string) => string | null`, passed from Matrix as `d => postOutProblem(open.id,
  'delete') || postingProblem(open.id, 'out', d)`; in the date onChange, before the ask: if refused, no ask, the refusal
  shown at once. Pin it: a post-in after the picked date — no "Tap again", the refusal shown, nothing saved.

**L2 — "Really reset?" stays armed while Reset order greys out, and fires on one tap when it lights again (item 2).**
- Failure (desktop): Torch is drawn in Jan and hand-ordered. Open ⚙, tap Reset order: "Really reset?". With the sheet still
  up, scroll the grid to Mar. The line greys but still reads "Really reset?". Scroll back to Jan: it lights, still armed,
  so one tap resets. New reach: before this change the line's state could not change while the sheet was open, except by
  Undo, which a person cannot press past the sheet.
- Cause: `SettingsSheet.tsx` takes `armOrder` back on close and on leaving the page, but not when `handOrder` turns false.
- Fix: `useEffect(() => { if (!handOrder) setArmOrder(false) }, [handOrder])`; pin it in `settingssheet.test.tsx`.

**L3 — The Legend still teaches `*LL` / `LL*` (an absence for item 1).** W2 saw this too.
- Failure: Legend → "The * — a half day" shows `*LL` = AM and `LL*` = PM; every grid box and both sheets' chips read
  `<LL` / `LL>`.
- Cause: `Chrome.tsx` ~605–607 not touched; the glossary already explains `<LL` (`engine/codes.ts`).
- Fix: the two swatches `<LL` / `LL>`, the section retitled for a half day.

## Older, seen in passing (not findings)
- Other armed questions on the war's sheets are not taken back on leaving the page: the drag selection's "Delete — sure?"
  for records and OIL awards, and the below-zero "tap the same leave again" in both sheets (undoable, unlike a person
  delete). ui-contracts' "Every armed 'Tap again to delete'…" names three sheets — tighten the wording or extend.
- A clash about a SANS man with Show SANS off: tapping its row opens nothing (no row) — W2's note.
- With the Delete chip armed, picking a past date saves the current outcome at once (as before the change).
- When the delete would be held (the last admin), the question still reads "Tap again to delete"; the held note beside
  it (as the chip's existing arm).
- Reset order counts the men of a folded group (not drawn) but not men outside the months on screen.

## Checked and found right (explicit negatives)
Item 6: the suffixed `visWindow` is only an effect key; the measure and the every-render step build the same signature;
the counter guarantees the anchor step runs after every capture; one pass over ~60 people per render; the frozen column
and the grid both read `visWinRef.current`; a hidden page keeps the last window. Item 7: the chip arm and the date question
cannot both be live; the second tap saves the date shown, as Delete; a refused save puts the box back; a future date
picked while asked saves at once; Undo post out, ✕, a tap outside, "Place leave…", leaving the page and a posting changed
underneath each clear it; no question carried to another man; the question's clock is the pass's (`effectiveToday`); admin
only; the other Delete doors already ask twice; Admin → Users edits no posting date; the effects sit before any early
return. Item 2: `shown` is the grid's own row test; the sheet re-renders when the drawn set changes; the listener is
cleaned up. Item 8: the names column sized from the cells; both layouts use `whoOf`. Items 1, 3: the only two chip rows;
the pin moves before any repaint; the bridge test-only.
