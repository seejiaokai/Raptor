// The sheet a DRAG-SELECTION opens (owner, 27 Aug 26). One selection, many
// cells across many people; this acts on the whole block at once. It is the
// BidPicker's sibling — same Sheet chassis, same `bidsheet-*` / chip classes,
// same portion+leave+medical+PO vocabulary — just batched, so it reads as the
// multi-cell version of the thing the squadron already knows.
//
// Sections are CONTEXTUAL to role and stage, the same gates the single-cell
// path uses: everyone fills while the war is open (admin any stage); medical
// and PO are the admin's; Decide (Pending/Approve/Refuse) is the admin's once
// bidding has closed. Delete and Move act on whatever editable bids the
// selection holds.
//
// The negative-balance confirm the single sheet shows is deliberately NOT
// carried here: it is per-person, and a block spanning ten people asking ten
// "are you sure" questions would be worse than the workbook running negative,
// which the owner allows. The single-cell path keeps the confirm.

import { useState } from 'react'
import { displayCell, formatCell, LEAVE_TYPES, MEDICAL_TYPES, type BidState, type Portion } from '../engine'
import { clearCells, setBidStates, setCells } from '../state/store'
import { Sheet } from './Sheet'
import { shortSpan } from './dates'
import type { Selection } from './select'
import './bidpicker.css'

const PORTIONS: { portion: Portion; label: string; testid: string }[] = [
  { portion: 'full', label: 'Whole day', testid: 'sel-portion-full' },
  { portion: 'am', label: 'Morning', testid: 'sel-portion-am' },
  { portion: 'pm', label: 'Afternoon', testid: 'sel-portion-pm' },
]

export function SelectSheet({
  sel,
  people,
  role,
  canDecide,
  medical,
  onDone,
  onMove,
  onPostOut,
  onClose,
}: {
  sel: Selection
  /** callsign per person id, for the header when the selection is small */
  people: (id: string) => string
  role: 'admin' | 'member'
  /** admin && closed — the batch Decide row */
  canDecide: boolean
  /** admin — the medical markers */
  medical: boolean
  /** report counts back so the matrix can snap the counter column + close */
  onDone: (changed: boolean) => void
  /** enter move-mode (the matrix owns the ghost + the drop) */
  onMove: (sel: Selection) => void
  /** admin, single-person selections only: post that one person out */
  onPostOut?: (personId: string, fromDate: string, archive: boolean) => void
  onClose: () => void
}) {
  const [portion, setPortion] = useState<Portion>('full')
  const [note, setNote] = useState('')
  const [confirmDel, setConfirmDel] = useState(false)
  const [poOpen, setPoOpen] = useState(false)
  const [poDate, setPoDate] = useState(sel.from)
  const [poArchive, setPoArchive] = useState(true)

  const nPeople = sel.people.length
  const nDays = new Set(sel.cells.map(c => c.date)).size
  const who = nPeople === 1
    ? people(sel.people[0])
    : nPeople <= 3
      ? sel.people.map(people).join(', ')
      : `${nPeople} people`
  const span = sel.from === sel.to ? sel.from : shortSpan(sel.from, sel.to)

  const skipNote = (verb: string, written: number, skipped: number) =>
    written === 0
      ? `Nothing could be ${verb} — those cells are locked, owned by Raptor, or outside the window.`
      : `${written} ${verb}. ${skipped} skipped — locked, owned by Raptor, or outside the window.`

  const fill = (code: string) => {
    const { written, skipped } = code ? setCells(sel.cells, code) : clearCells(sel.cells)
    if (skipped === 0) { onDone(written > 0); return }
    setNote(skipNote(code ? 'written' : 'cleared', written, skipped))
    if (written > 0) onDone(true) // refresh counts but keep the sheet to show the note
  }

  const del = () => {
    if (!confirmDel) { setConfirmDel(true); setNote(`Delete ${nDays === 1 ? 'this day' : `${nDays} days`} for ${who}? Tap Delete again.`); return }
    const { written, skipped } = clearCells(sel.cells)
    if (skipped === 0) return onDone(written > 0)
    setNote(skipNote('deleted', written, skipped))
    if (written > 0) onDone(true)
  }

  const decide = (bid: BidState) => {
    const { decided, skipped } = setBidStates(sel.cells, bid)
    if (skipped === 0) return onDone(decided > 0)
    setNote(decided === 0
      ? 'None of those could be decided — a decision needs a bid that is not Raptor-owned.'
      : `${decided} decided. ${skipped} skipped (no bid, or Raptor-owned).`)
    if (decided > 0) onDone(true)
  }

  const canFill = role === 'admin' || !canDecide // members fill while open; the sheet only opens for them then

  return (
    <Sheet testid="select-sheet" label="Selected days" onClose={onClose}>
      <div className="bidsheet-hd">
        <span className="who" data-testid="sel-who">{who}</span>
        <span className="dt" data-testid="sel-span">{span} · {nDays} day{nDays === 1 ? '' : 's'}</span>
        <button className="x" data-testid="sel-cancel" onClick={onClose} aria-label="Cancel">✕</button>
      </div>

      {canFill && (
        <>
          <div className="bidsheet-row">
            <span className="lab">How much</span>
            {PORTIONS.map(p => (
              <button key={p.portion} data-testid={p.testid}
                className={`pchip${portion === p.portion ? ' on' : ''}`}
                aria-pressed={portion === p.portion}
                onClick={() => setPortion(p.portion)}>
                {p.label}
              </button>
            ))}
          </div>

          <div className="bidsheet-row">
            <span className="lab">Which leave</span>
            {LEAVE_TYPES.map(t => (
              <button key={t.type} data-testid={`sel-${t.type}`} className="tchip" title={t.label}
                onClick={() => fill(formatCell({ type: t.type, portion }))}>
                {formatCell({ type: t.type, portion })}
              </button>
            ))}
          </div>

          {medical && (
            <div className="bidsheet-row">
              <span className="lab">Medical</span>
              {MEDICAL_TYPES.map(t => (
                <button key={t.type} data-testid={`sel-${t.type}`} className="tchip med" title={t.label}
                  onClick={() => fill(formatCell({ type: t.type, portion }))}>
                  {displayCell(formatCell({ type: t.type, portion }))}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {canDecide && (
        <div className="bidsheet-row">
          <span className="lab">Decide</span>
          <button className="dchip ack" data-testid="sel-pending" onClick={() => decide('acknowledged')}>Pending</button>
          <button className="dchip approve" data-testid="sel-approve" onClick={() => decide('approved')}>Approve</button>
          <button className="dchip refuse" data-testid="sel-refuse" onClick={() => decide('refused')}>Refuse</button>
        </div>
      )}

      {/* Delete + Move act on the editable bids the selection holds. Delete
          confirms on a second tap (no undo here); Move hands off to the
          matrix's ghost/tap-to-place mode. */}
      <div className="bidsheet-row">
        <span className="lab">Selected</span>
        <button className="dchip refuse" data-testid="sel-delete" onClick={del}>
          {confirmDel ? 'Delete — sure?' : 'Delete'}
        </button>
        <button className="dchip" data-testid="sel-move" onClick={() => { onClose(); onMove(sel) }}>Move…</button>
      </div>

      {/* PO only for a single person (posting several out from one drag is too
          heavy an act for one tap; the PO flow picks its own date anyway) */}
      {onPostOut && nPeople === 1 && !poOpen && (
        <div className="bidsheet-row postout">
          <button className="dchip po" data-testid="sel-postout" onClick={() => setPoOpen(true)}>Post out (PO)…</button>
        </div>
      )}
      {onPostOut && nPeople === 1 && poOpen && (
        <>
          <div className="bidsheet-row postout">
            <span className="lab">PO from</span>
            <input type="date" data-testid="sel-po-date" value={poDate} onChange={e => setPoDate(e.target.value)} />
            <label className="poarch">
              <input type="checkbox" data-testid="sel-po-archive" checked={poArchive} onChange={e => setPoArchive(e.target.checked)} />
              Archive on PO date
            </label>
          </div>
          <div className="bidsheet-row postout">
            <button className="dchip po" data-testid="sel-po-confirm"
              onClick={() => { onPostOut(sel.people[0], poDate, poArchive); onDone(true) }}>
              Confirm post-out
            </button>
          </div>
        </>
      )}

      {note && <div className="bidsheet-row"><span className="note warn" data-testid="sel-note">{note}</span></div>}
    </Sheet>
  )
}
