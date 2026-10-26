// The remarks editor (owner, 27 Aug 26 — "click on their inputs directly on the leave war and edit the remarks. but
// the admin can also … the same for all"; D418 narrowed by D1177: a member's approved leave offers its remarks at any
// time, the published stage having gone).
//
// A member taps his own approved leave on the grid and edits the note on it (the leave itself he changes on the
// Inputs page — D1166); an admin edits any man's from the day's list. The note lives on the Raptor INPUT the cell derives from (found by
// sync.ts:leaveInputAt — a leave filed on Inputs OR bid in the war and minted
// at publish, both ordinary rows). The save runs through Raptor's ONE commit
// path (inputedit.ts:setLeaveRemarks → commitInputEdit): a remarks-only edit
// leaves the leave's signature untouched, so the war cells and the lw tag do
// not move — only the note the Inputs page reads is rewritten. That commit
// path also carries the member-own / scheduler-any gate, so this sheet's own
// role check and the write path's cannot drift.
//
// ROUND 3's ONE ROW (his D1354, 25 Oct 26 — round 3's Q2 "as recommended"): the window carries the bid windows' one row —
// the dark box that wraps, its till, Document (`ReqWords.tsx LeaveWords`) — saved as it changes, in place of the older
// labelled Document and Remarks rows, the light box and its own Save; words typed and not yet saved go with the closing.
import { displayCell } from '../engine'
import { Sheet } from './Sheet'
import { inputDayLabel } from './dates'
import { LeaveWords } from './ReqWords'

export function RemarksSheet({
  callsign,
  personId,
  row,
  code,
  onClose,
}: {
  callsign: string
  /** whose cell the sheet was opened on — the remark is HIS: where the leave behind the cell holds several people he is
   *  given a leave of his own first (ui/inputedit.tsx setLeaveRemarks) */
  personId: string
  /** the Raptor INPUT the cell derives from (sync.ts:leaveInputAt) */
  row: any
  /** the cell's Leave War code, for the header only */
  code: string
  onClose: () => void
}) {
  /* ITS DOCUMENTS (M3 7.3 — D1150: "added or seen at any time, even after its dates are locked"; D1159: the app's one
     Document button) and its typed words only — the leave's date is printed from its dates (D948): the one row's */
  // The leave's own span, read off the row — a click on any day of a 13–15 Jul
  // run edits the one note for the whole run (owner's example).
  const span = row?.endDate ? `${inputDayLabel(row.date)} → ${inputDayLabel(row.endDate)}` : inputDayLabel(row?.date)   // day-first ([LW-ISO-DATES])
  return (
    <Sheet testid="remarks-sheet" label="Edit the note on this leave" onClose={onClose}>
      <div className="bidsheet-hd">
        <span className="who">{callsign}</span>
        <span className="dt">{span}</span>
        <span className="cur">{displayCell(code)}</span>
        <button className="x" data-testid="remarks-cancel" onClick={onClose} aria-label="Close">✕</button>
      </div>
      <LeaveWords row={row} personId={personId} testPrefix="remarks" />
    </Sheet>
  )
}
