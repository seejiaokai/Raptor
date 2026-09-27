// THE ONE MOVE AND THE ONE DELETE (owner, 27 Sep 26 — D264 "There should be a standardised format and look"; D330 /
// D334 the Move button; D332 the word Delete). The one-day sheet, the drag-selection sheet and the day's list all draw
// their Move and Delete from HERE, so the three can never drift into three looks again (the drag sheet's "Move…" wore
// the browser's own button face while the one-day sheet's was a grey chip — his pictures of 27 Sep 26).
//
//   Move — the sheet's grey chip with a teal arrow before the word ("⇄ Move", D334, option B of the mock-up
//          docs/mock/lw-move-standard.html §7). Grey, so it never reads as a CHOSEN chip (those are teal-FILLED — Just
//          this day, Whole day); the arrow in the move mode's teal (the move banner's edge, its Confirm, the landing
//          outline), the colour of what it opens.
//   Delete — the dashed grey edge, never red: on the day's list Delete sits beside Refuse, and two red buttons side by
//          side read as the same act (Refuse keeps the bid as history; Delete takes the record away).
//
// The look lives in bidpicker.css (`.dchip.move .mvarr`, `.dchip.del`); what each press DOES stays with its sheet.

export function MoveChip({ testid, onClick, title = 'Pick this up and put it on another day' }: {
  testid: string
  onClick: () => void
  title?: string
}) {
  return (
    <button className="dchip move" data-testid={testid} title={title} onClick={onClick}>
      <span className="mvarr" aria-hidden="true">⇄</span>Move
    </button>
  )
}

export function DeleteChip({ testid, onClick, armed = false }: {
  testid: string
  onClick: () => void
  /** the second tap of a Delete that asks first (a block, an award it names) */
  armed?: boolean
}) {
  return (
    <button className="dchip del" data-testid={testid} onClick={onClick}>
      {armed ? 'Delete — sure?' : 'Delete'}
    </button>
  )
}
