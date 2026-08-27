/* THE UPCHIT SAVE-TIME SUMMARY (owner, 27 Aug 26 — "ask at save time").
   Every editor that can save an upchit opens this sheet BEFORE anything is
   written: it says exactly what the upchit will shorten or remove, and it
   puts every medical entry dated AFTER the upchit — the tail of a split
   entry, or a separately filed future one — to the filer as an explicit
   Keep / Remove, one by one. There is NO default on those (owner: "if the
   owner doesn't select … can't move forward"): Save stays disabled until
   each has an answer, so a planned future entry is never silently kept OR
   deleted. Cancel writes nothing.

   The content comes from engine/medical.ts:upchitEffects — the same body
   the write path's trims run off — so what this sheet shows and what the
   save then does cannot disagree. Callers own the actual write (each keeps
   its own commit + removals inside ONE writeInputsBatch); this component
   only collects the decision. */
import { useEffect, useState } from 'react'
import { ordLabel } from '../engine/medical'

export function UpchitConfirm({ who, dateLabel, effects, onSave, onCancel }: {
  who: string
  dateLabel: string
  effects: { plan: any[]; leftovers: any[] }
  onSave: (removals: any[]) => void
  onCancel: () => void
}) {
  /* keyed by leftover index — the forced choice, unset until the filer picks */
  const [choice, setChoice] = useState<Record<number, 'keep' | 'remove'>>({})
  const ready = effects.leftovers.every((_: any, i: number) => !!choice[i])
  const span = (r: any) => r.date + (r.endDate ? ' – ' + r.endDate : '')
  /* its own Escape = cancel THIS sheet only — capture, added after any parent
     dialog's own listener, and the parent's (InputEditor) branches on the
     sheet being open, so neither closes the dialog underneath */
  useEffect(() => {
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.stopPropagation(); onCancel() } }
    document.addEventListener('keydown', esc, true)
    return () => document.removeEventListener('keydown', esc, true)
  })
  return (
    <div className="airpop upconf-pop" data-testid="upconf"
      onClick={e => { if ((e.target as HTMLElement).classList.contains('upconf-pop')) onCancel() }}>
      <div className="airpop-box upconf-box">
        <div className="airpop-head"><b>Upchit — {who}, {dateLabel}</b>
          <button className="x" aria-label="Close" onClick={onCancel}>✕</button></div>
        <div className="airpop-body upconf-body">
          <div className="upconf-h">Saving this upchit will</div>
          {effects.plan.length
            ? <ul className="upconf-list" data-testid="upconf-plan">{effects.plan.map((p: any, i: number) => (
              <li key={i}>{p.action === 'trim'
                ? <>{p.row.type} {span(p.row)} → now ends <b>{ordLabel(p.newEndOrd, p.row.yr)}</b></>
                : <>{p.row.type} {span(p.row)} → <b>removed</b> — it would only cover fit days</>}</li>))}
            </ul>
            : <div className="upconf-none">Close the pending medical-down period — no current entry needs shortening.</div>}
          <div className="upconf-fit">Fit for full duty from {dateLabel}.</div>
          {effects.leftovers.length > 0 && <>
            <div className="upconf-h">Still on file after it — choose for each</div>
            {effects.leftovers.map((r: any, i: number) => (
              <div className="upconf-left" key={i} data-testid={`upconf-left-${i}`}>
                <span>{r.type} {span(r)}</span>
                <span className="seg">
                  <button className={'upconf-seg' + (choice[i] === 'keep' ? ' on-keep' : '')}
                    onClick={() => setChoice(c => ({ ...c, [i]: 'keep' }))}>Keep</button>
                  <button className={'upconf-seg' + (choice[i] === 'remove' ? ' on-rem' : '')}
                    onClick={() => setChoice(c => ({ ...c, [i]: 'remove' }))}>Remove</button>
                </span>
              </div>))}
          </>}
        </div>
        <div className="airpop-foot upconf-foot">
          {!ready && <span className="upconf-need">Choose Keep or Remove for each entry above</span>}
          <span style={{ flex: 1 }}></span>
          <button className="abtn ghost" onClick={onCancel}>Cancel</button>
          <button className="abtn primary" data-testid="upconf-save" disabled={!ready}
            onClick={() => onSave(effects.leftovers.filter((_: any, i: number) => choice[i] === 'remove'))}>Save upchit</button>
        </div>
      </div>
    </div>
  )
}
