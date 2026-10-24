# Round 3's check — the fresh, blind Opus code read (24 Oct 26)

Read at commit 3b95fc0c8 with `git show` / `git diff` (brief: `docs/superpowers/briefs/2026-10-24-lw-round3-code-read.md`);
nothing run. Its findings as handed back (ranked by what a person meets), each with the host's disposition in the sheet.

- **R1 (medium; new in round 3).** The free-half window (a morning LL filed on the Inputs page, the afternoon free) shows the
  MORNING leave's Remarks / Document, editable: words typed there and OL tapped are saved onto the Inputs-page leave (moving
  its last-changed time, which the LATE mark reads) and the new PM bid gets none; a document goes the same way. Cause:
  `Matrix.tsx adminNoteRow` is set whenever the day's state is 'approved' — an Inputs-page leave projects as approved — and
  `BidPicker` uses it as `leaveRow`. Fix: `approvedRow={openFreeHalf ? null : adminNoteRow}` (better: also require the war's own
  leave, `!raptorOwns(...)`), and in BidPicker `leaveRow = !span && !held && !onlyPortion ? approvedRow : null`. Test: the
  setup, `bid-remarks` empty; type, switch off, OL → the request carries the words, the INPUTS row keeps "Clinic".
  Same cause, a judgement: on the war's own approved half day the window is that leave's; a bid for the other half carries no
  words.
- **R2 (medium-low; M3's).** Words on a refused bid do not ride with a re-bid: `flushWords` saves them onto the refused bid,
  then `setCell(..., newWords)` runs with `newWords` undefined (a bid is held) and the store carries words only from LIVE bids it
  replaces. Fix: `newWords = !held ? wordsOf(draft) : held.rec.state === 'refused' ? wordsOf(words) : undefined`.
- **R3 (medium-low; F7 incomplete).** The list still re-orders on a tie: an approved whole-day LL and a half-day OIL award (AM)
  both start at 0; after Refuse the refused bid ranks below the award in `view.all`, so a quick second tap lands on the award's
  Delete, which deletes it with no ask. Fix: sort by `win[0]`, then `win[1]`, then code, then index — none change when a leave
  becomes a bid or a refused bid.
- **R4 (low-medium; D1333).** `useGrow` measures only when the text changes: removing a document (has-docs drops, the box narrows)
  or turning the phone leaves a long remark's last line hidden. Fix: re-measure on width (a ResizeObserver on the box).
- **R5 (low).** A member's own refused bid lights its leave — the walk's X1, **fixed as F12** (5f55b2cec).
- **R6 (low; over F11).** "Pick a range" closing over a one-day range on ANOTHER day (tap 9 Feb from 11 Feb's window): the window
  then acts on 9 Feb while its title says 11 Feb. Fix: on close, a one-day range goes back to the day tapped (`setRange(null)`),
  as "Just this day" did.
- **R7 (low; a gap F5 left).** On an iPhone, words typed on a held bid are lost when the window closes through the ⋯'s panels
  (Give FO, OIL Remove, Post out's or Post in's confirm): that path never runs `flushWords`, and BidPicker has no save on
  unmount for `heldEdit`. Fix: an unmount save for `heldEdit`, as LeaveWords has.
- **R8 (low; new).** `runEnd` matches code, state and remarks; the store's own run (setRequestWords, the approval's join) also
  matches the till tick and the documents — a window's "till" can name a day the save and the approval then leave out. Fix: one
  run rule — the store's key exported and used by `runEnd`.
- **R9 (low; new).** The ⋯'s caught click is dropped after 700 ms: a press held longer still clicks what is under it; a press
  that became a scroll can eat the next tap within 700 ms. Fix: disarm on that press's own click, on pointercancel, or on the
  next pointerdown — not on a timer.

**Checked and found nothing:** every action path of the one-day window runs `flushWords` first; no double save; the list's
savers keyed by record id; the list's Delete of a request harmless; the send-back carries the words; the ⋯ menu's Escape,
outside press, the drag window's cell press and the keyboard; the CSS inside the wrapper, the font lines written out; the
one-day window's state table; `runEnd` over a two-entry day, a refused run and a moved run; nothing else reads the list's
order; the changed tests re-expressed, none weakened; the day line as D1313 / D1314 rule.

## The fixes' own narrow read (§5 — one fresh Opus reader of the eight fix commits, at e89c68b48)

- **N1 (low-medium; R6's fix).** Closing the calendar sends a one-day pick back to the day tapped but leaves a Delete armed for
  the OTHER day: its ask, its award ids, the note, the move error and the confirm stay — the next Delete then skips this day's
  own award's ask and refuses ("Nothing here can be deleted…"), or removes a bid with no ask. Fix: in that close branch also
  `setNote(''); setClearAsked(false); setClearIds([]); setMoveErr(''); setConfirming(null)`. Test: awards on 9 and 11 Feb;
  11 Feb's window, Pick a range, 9 Feb, Delete (armed), close → no note; Delete asks for 11 Feb's award; again → gone.
- **N2 (low; R7's fix).** Through the ⋯'s panels (Give FO, Remove, Post in / Post out confirm) the typed words are saved by the
  unmount save, AFTER the panel's own command — so Undo takes the remark first, the award second. Fix: `flushWords()` first in
  `grantOil`, the Remove button, `pi-confirm`, `po-confirm`; the unmount save stays the backstop. Test: R7's setup, one Undo →
  the award gone, the remark still on the bid.
- **N3 (low; what R3 leaves).** The list's row of a refused bid has no Refuse (pushed only when not refused), so the next button
  slides into its place under a repeated tap — Move picks the refused leave up, or Delete removes it with no ask. D1330: one row
  wherever it opens. Fix: for a role that decides, always draw Refuse — pressed on a refused bid, a tap then doing nothing, as
  the one-day window does. Test: R3's setup, Refuse → the row's second button still Refuse; tapping it leaves both in place.
- **Disposition (host):** N1 and N2 fixed red first (ced9369ec), N3 (836901e05); all three re-walked at both sizes —
  `docs/img/handpass/2026-10-24-lw-r3/rewalk3/`, PASS 8 of 8.
- Negatives: R1's guard keeps the war's own approved half its words row; R2 correct; R7 no double save, no state set on close;
  R9 released by the press's own end; R4 fits (a "ResizeObserver loop" event once per narrowing, harmless, not an app error);
  R8 one key, the approval's join the same; R3's order stable over every change of state; no test weakened.
