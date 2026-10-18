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
   only collects the decision.

   AND BEFORE AN UPCHIT IS DELETED (owner D1022, 18 Oct 26 — "the save sheet says so before anything changes"), where the
   delete gives a downchit its days back (`deleting`): the same sheet says what the delete will give back
   (engine/medical.ts upchitDeletePlan — the body the delete runs), with no fit line and nothing to choose, and its button
   deletes. A delete that gives nothing back asks nothing (D792). */
import { useEffect, useState, useRef } from 'react'
import { ordLabel } from '../engine/medical'
import { clickedSurround } from './outside'
import { useSheetFocus } from './sheetfocus'

export function UpchitConfirm({ who, dateLabel, effects, onSave, onCancel, deleting }: {
  who: string
  dateLabel: string
  effects: { plan: any[]; leftovers: any[] }
  onSave: (removals: any[]) => void
  onCancel: () => void
  /** the question before the upchit is DELETED (D1022), not saved */
  deleting?: boolean
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
  /* the sheet takes the keyboard when it opens (W12 — ui/sheetfocus.ts) */
  const boxRef = useRef<HTMLDivElement>(null)
  useSheetFocus(boxRef)
  return (
    <div className="airpop upconf-pop" data-testid="upconf"
      onClick={e => { if (clickedSurround(e, 'upconf-pop')) onCancel() }}>
      <div className="airpop-box upconf-box" ref={boxRef} tabIndex={-1} style={{ outline: 'none' }}>
        <div className="airpop-head"><b>Upchit — {who}, {dateLabel}</b>
          <button className="x" aria-label="Close" onClick={onCancel}>✕</button></div>
        <div className="airpop-body upconf-body">
          <div className="upconf-h">{deleting ? 'Deleting this upchit will' : 'Saving this upchit will'}</div>
          {effects.plan.length
            ? <ul className="upconf-list" data-testid="upconf-plan">{effects.plan.map((p: any, i: number) => (
              <li key={i}>{p.action === 'trim'
                ? <>{p.row.type} {span(p.row)} → now ends <b>{ordLabel(p.newEndOrd, p.row.yr)}</b></>
                : p.action === 'grow'
                /* D999: the days a later upchit gives back, said before anything changes */
                ? <>{p.row.type} {span(p.row)} → now ends <b>{ordLabel(p.newEndOrd, p.row.yr)}</b>, its days given back</>
                : <>{p.row.type} {span(p.row)} → <b>removed</b> — it would only cover fit days</>}</li>))}
            </ul>
            : <div className="upconf-none">Close the pending medical-down period — no current entry needs shortening.</div>}
          {!deleting && <div className="upconf-fit">Fit for full duty from {dateLabel}.</div>}
          {effects.leftovers.length > 0 && <>
            <div className="upconf-h">Still on file after it — choose for each</div>
            {effects.leftovers.map((r: any, i: number) => (
              <div className="upconf-left" key={i} data-testid={`upconf-left-${i}`}>
                <span>{r.type} {span(r)}</span>
                {/* flat, in a wrapper of the sheet's own: `.seg` is the week strip's rule too, and gave these its darker patch
                    and its line underneath (owner D849, 14 Oct 26 — "3 yes"; L1's fix, on the sheets D830's list did not hold) */}
                <span className="upconf-ans">
                  <button className={'upconf-seg' + (choice[i] === 'keep' ? ' on-keep' : '')}
                    onClick={() => setChoice(c => ({ ...c, [i]: 'keep' }))}>Keep</button>
                  <button className={'upconf-seg' + (choice[i] === 'remove' ? ' on-rem' : '')}
                    onClick={() => setChoice(c => ({ ...c, [i]: 'remove' }))}>Remove</button>
                </span>
              </div>))}
          </>}
        </div>
        <div className="airpop-foot upconf-foot">
          {/* (no "Choose Keep or Remove for each entry above" here — owner D848, 14 Oct 26, by D846's rule: the heading over
              the entries already says "choose for each", Keep / Remove stand right there, and the button below is dimmed
              until each has an answer) */}
          <span style={{ flex: 1 }}></span>
          <button className="abtn ghost" onClick={onCancel}>Cancel</button>
          <button className={'abtn ' + (deleting ? 'danger' : 'primary')} data-testid="upconf-save" disabled={!ready}
            onClick={() => onSave(effects.leftovers.filter((_: any, i: number) => choice[i] === 'remove'))}>{deleting ? 'Delete upchit' : 'Save upchit'}</button>
        </div>
      </div>
    </div>
  )
}
