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
//
// THE ONE DECIDED LOOK (his D2881, 28 Nov 26 — "A, solid + cyan ring", answering his D2880 "Doesn't feel like approved is
// selected"; drawing of record docs/mock/2026-11-27-decide-buttons/img/trio-E3-*.png): wherever the war decides — the bid
// windows, the day's list, the picked-days sheet and Approvals — Approve and Refuse draw their mark from HERE
// (`DecideMark`) and take their state's classes from bidhelpers.ts (`decideLook`), so the four places wear one look.
// Waiting, each shows a drawn tick or cross before its word; decided, the picked one keeps its solid fill and wears the
// window's cyan ring (`dec-ring`), the other turns grey (`dec-off`) and stays pressable. The look is one block of
// bidpicker.css (THE DECIDED LOOK), its keyboard ring too.

/** the drawn tick (Approve) or cross (Refuse) before the word — drawn by the app in the button's own colour, never a
 *  typed ✓ / ✕, which each device's font draws its own way (the one-icon rule, D1134, D1508) */
export function DecideMark({ kind }: { kind: 'approve' | 'refuse' }) {
  return (
    <svg className="dec-ic" data-mark={kind} viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      {kind === 'approve'
        ? <path d="M3 8.5l3.2 3.2L13 4.8" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        : <path d="M4 4l8 8M12 4l-8 8" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />}
    </svg>
  )
}

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
    /* ASKING, ITS WORDS STAND ON TWO LINES INSIDE IT (his D1387, D1395 C — 26 Oct 26: "a button's words always stand inside
       the button"): "Delete —" over "sure?", the button growing a little taller, never wider, so the row beside it never
       moves and an iPhone's wider letters still fit (drawn: lw-m3n-draw.mjs d5, option C) */
    <button className={`dchip del${armed ? ' armed' : ''}`} data-testid={testid} onClick={onClick}>
      {armed ? <><span className="del-l">Delete —</span> <span className="del-l">sure?</span></> : 'Delete'}
    </button>
  )
}
