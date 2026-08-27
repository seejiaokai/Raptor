// The published-stage remarks editor (owner, 27 Aug 26 — "after the leave war
// is published … click on their inputs directly on the leave war and edit the
// remarks. but the admin can also … the same for all").
//
// A published war is read-only for the squadron EXCEPT this: a member taps
// their own approved leave and edits the note on it; an admin does it for
// anyone. The note lives on the Raptor INPUT the cell derives from (found by
// sync.ts:leaveInputAt — a leave filed on Inputs OR bid in the war and minted
// at publish, both ordinary rows). The save runs through Raptor's ONE commit
// path (inputedit.ts:setLeaveRemarks → commitInputEdit): a remarks-only edit
// leaves the leave's signature untouched, so the war cells and the lw tag do
// not move — only the note the Inputs page reads is rewritten. That commit
// path also carries the member-own / scheduler-any gate, so this sheet's own
// role check and the write path's cannot drift.
import { useState } from 'react'
import { Sheet } from './Sheet'
import { setLeaveRemarks } from '../../ui/inputedit'

export function RemarksSheet({
  callsign,
  row,
  code,
  onClose,
}: {
  callsign: string
  /** the Raptor INPUT the cell derives from (sync.ts:leaveInputAt) */
  row: any
  /** the cell's Leave War code, for the header only */
  code: string
  onClose: () => void
}) {
  const [remarks, setRemarks] = useState<string>(row?.remarks ?? '')
  // The leave's own span, read off the row — a click on any day of a 13–15 Jul
  // run edits the one note for the whole run (owner's example).
  const span = row?.endDate ? `${row.date} → ${row.endDate}` : row?.date
  const save = () => { if (setLeaveRemarks(row, remarks)) onClose() }
  return (
    <Sheet testid="remarks-sheet" label="Edit the note on this leave" onClose={onClose}>
      <div className="bidsheet-hd">
        <span className="who">{callsign}</span>
        <span className="dt">{span}</span>
        <span className="cur">{code}</span>
        <button className="x" data-testid="remarks-cancel" onClick={onClose} aria-label="Close">✕</button>
      </div>
      <div className="bidsheet-row rmk-row">
        <span className="lab">Remarks</span>
        <textarea
          className="rmk-field"
          data-testid="remarks-field"
          maxLength={200}
          value={remarks}
          placeholder="Where you are, why — read on the Inputs page"
          onChange={e => setRemarks(e.target.value)}
        />
      </div>
      <div className="bidsheet-row rmk-actions">
        <button className="dchip approve" data-testid="remarks-save" onClick={save}>Save</button>
      </div>
    </Sheet>
  )
}
