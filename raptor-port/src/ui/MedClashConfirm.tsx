/* THE MEDICAL CLASH SHEET (owner, 27 Aug 26 — "ask at save time"). A new
   medical entry that overlaps a DIFFERENT-type one never resolves silently:
   before anything is written, every clash is put to the filer — does the new
   entry take the shared days (the old status is cut back around it), or does
   the existing status keep them (the new entry is filed around IT instead)?
   NO default, per the upchit sheet's precedent: Save stays disabled until
   every clash has an answer, so the record always holds exactly one status
   per person per day and nobody chose it by accident. Cancel writes nothing.

   The list comes from engine/medical.ts:medClashes — the same body the trim
   planner selects by — and the choices resolve through medKeptSegments /
   mintMedSegments (ui/inputedit.tsx), so what this sheet asks and what the
   save then does cannot disagree. Reuses the upconf-* recipe: one visual
   language for the two medical confirms. */
import { useEffect, useState } from 'react'
import { ordLabel } from '../engine/medical'

export function MedClashConfirm({ who, newType, span, clashes, onSave, onCancel }: {
  who: string
  newType: string
  span: string                       // the new entry's dates, as typed
  clashes: any[]                     // {row, loOrd, hiOrd} from medClashes
  onSave: (choices: string[]) => void
  onCancel: () => void
}) {
  /* keyed by clash index — the forced choice, unset until the filer picks */
  const [choice, setChoice] = useState<Record<number, 'new' | 'old'>>({})
  const ready = clashes.every((_: any, i: number) => !!choice[i])
  const rowSpan = (r: any) => r.date + (r.endDate ? ' – ' + r.endDate : '')
  const win = (c: any) => ordLabel(c.loOrd, c.row.yr) + (c.hiOrd > c.loOrd ? ' – ' + ordLabel(c.hiOrd, c.row.yr) : '')
  /* its own Escape = cancel THIS sheet only; a parent dialog's handler
     branches on the sheet being open (the upchit sheet's idiom) */
  useEffect(() => {
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.stopPropagation(); onCancel() } }
    document.addEventListener('keydown', esc, true)
    return () => document.removeEventListener('keydown', esc, true)
  })
  return (
    <div className="airpop upconf-pop" data-testid="medclash"
      onClick={e => { if ((e.target as HTMLElement).classList.contains('upconf-pop')) onCancel() }}>
      <div className="airpop-box upconf-box">
        <div className="airpop-head"><b>{newType} — {who}, {span}</b>
          <button className="x" aria-label="Close" onClick={onCancel}>✕</button></div>
        <div className="airpop-body upconf-body">
          <div className="upconf-h">Days covered by another status — choose who holds them</div>
          {clashes.map((c: any, i: number) => (
            <div className="upconf-left medclash-row" key={i} data-testid={`medclash-${i}`}>
              <span>{c.row.type} {rowSpan(c.row)} · both cover <b>{win(c)}</b></span>
              <span className="seg">
                <button className={'upconf-seg' + (choice[i] === 'new' ? ' on-keep' : '')}
                  onClick={() => setChoice(ch => ({ ...ch, [i]: 'new' }))}>{newType} takes them</button>
                <button className={'upconf-seg' + (choice[i] === 'old' ? ' on-keep' : '')}
                  onClick={() => setChoice(ch => ({ ...ch, [i]: 'old' }))}>{c.row.type} keeps them</button>
              </span>
            </div>))}
          <div className="upconf-none">The days each status keeps stay exactly as chosen — every day holds one
            status, and the new entry is filed around whatever you keep.</div>
        </div>
        <div className="airpop-foot upconf-foot">
          {!ready && <span className="upconf-need">Choose for each clash above</span>}
          <span style={{ flex: 1 }}></span>
          <button className="abtn ghost" onClick={onCancel}>Cancel</button>
          <button className="abtn primary" data-testid="medclash-save" disabled={!ready}
            onClick={() => onSave(clashes.map((_: any, i: number) => choice[i]))}>Save</button>
        </div>
      </div>
    </div>
  )
}
