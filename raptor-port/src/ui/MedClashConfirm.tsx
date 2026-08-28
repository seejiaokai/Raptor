/* THE MEDICAL CLASH SHEET (owner, 27 Aug 26 — "ask at save time"). A new
   medical entry that overlaps a DIFFERENT-type one never resolves silently:
   before anything is written, every clash is put to the filer — does the new
   entry take the shared days (the old status is cut back around it), or does
   the existing status keep them (the new entry is filed around IT instead)?
   NO default on that choice, per the upchit sheet's precedent: Save stays
   disabled until every clash has an answer, so the record always holds exactly
   one status per person per day and nobody chose it by accident. Cancel writes
   nothing.

   THE ONE EXCEPTION to "no default" (owner, 28 Aug 26 — "no ATT C keeps them
   button"): a clash whose row covers the WHOLE new entry is FORCED to 'new'.
   Keeping that status whole would swallow the new entry completely — the old
   "nothing left to file" dead end, reached only after the filer had already
   picked the unworkable answer. A choice with one possible answer is not a
   choice, so the sheet shows just the pre-lit "<new> replaces" pill and the
   real decision moves to the leftover Remove/Keep below it. Multi-clash
   combinations can still jointly swallow the entry, so the commit-side
   refusal stays as the backstop.

   THE LEFTOVER (owner, 28 Aug 26). When the new entry takes the shared days of
   a status that ran PAST it — ATT C 10–15, a new ATT B 12–13 → an ATT C tail
   14–15 — that tail used to be kept silently. Now it is a second, explicit
   question under that clash: Remove those days (the default the owner chose —
   a status filed mid-way usually means the old plan changed) or Keep them. It
   carries a default so a straight Save works, but the removal is shown plainly
   before it happens — never silent. This is the ONE choice on this sheet that
   has a default; the who-holds-them choice above still forces an answer.

   The clash list comes from engine/medical.ts:medClashes, the leftover from the
   same file's medTailBeyond — the very body the trim planner mints from — so
   what this sheet asks and what the save then does cannot disagree. The choices
   resolve through medKeptSegments / mintMedSegments / the newMedTrimPlan
   keepTail list (ui/inputedit.tsx). Reuses the upconf-* recipe: one visual
   language for the two medical confirms. */
import { useEffect, useState } from 'react'
import { ordLabel, medTailBeyond } from '../engine/medical'

export function MedClashConfirm({ who, newType, span, clashes, aOrd, bOrd, onSave, onCancel }: {
  who: string
  newType: string
  span: string                       // the new entry's dates, as typed
  clashes: any[]                     // {row, loOrd, hiOrd} from medClashes
  aOrd: any                          // the new entry's START ordinal — with bOrd, decides when keeping is even possible
  bOrd: any                          // the new entry's END ordinal — the leftover starts the day after
  onSave: (choices: string[], keepTail: any[]) => void
  onCancel: () => void
}) {
  /* keyed by clash index — the forced who-holds-them choice, unset until picked */
  const [choice, setChoice] = useState<Record<number, 'new' | 'old'>>({})
  /* keyed by clash index — the leftover's Remove/Keep, DEFAULT 'remove' (unset reads as remove) */
  const [tail, setTail] = useState<Record<number, 'remove' | 'keep'>>({})
  /* the old row covers the whole new entry — its overlap window IS the entry.
     Keeping it whole would leave nothing to file, so the choice is forced to
     'new' and the keep button is not offered (the header comment's exception) */
  const forced = (c: any) => c.loOrd === aOrd && c.hiOrd === bOrd
  const choiceOf = (i: number) => forced(clashes[i]) ? 'new' : choice[i]
  const ready = clashes.every((_: any, i: number) => !!choiceOf(i))
  const rowSpan = (r: any) => r.date + (r.endDate ? ' – ' + r.endDate : '')
  const win = (c: any) => ordLabel(c.loOrd, c.row.yr) + (c.hiOrd > c.loOrd ? ' – ' + ordLabel(c.hiOrd, c.row.yr) : '')
  /* the keep button's label, the owner's wording — the date names what "keep"
     leaves standing, since the kept status always survives to its own end */
  const keepLabel = (r: any) => 'Keep ' + r.type + (r.endDate ? ' till ' + r.endDate : '')
  /* the leftover span past the new entry, only when the new entry takes the days */
  const leftover = (c: any, i: number) => choiceOf(i) === 'new' ? medTailBeyond(c.row, bOrd) : null
  const tailLabel = (c: any, tl: any) => ordLabel(tl.startOrd, c.row.yr) + (tl.endOrd > tl.startOrd ? ' – ' + ordLabel(tl.endOrd, c.row.yr) : '')
  /* its own Escape = cancel THIS sheet only; a parent dialog's handler
     branches on the sheet being open (the upchit sheet's idiom) */
  useEffect(() => {
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.stopPropagation(); onCancel() } }
    document.addEventListener('keydown', esc, true)
    return () => document.removeEventListener('keydown', esc, true)
  })
  const save = () => onSave(
    clashes.map((_: any, i: number) => choiceOf(i)),
    /* the rows the filer chose to KEEP the tail for — everything else has its
       leftover removed (the default), so keepTail carries only the exceptions */
    clashes.filter((c: any, i: number) => leftover(c, i) && (tail[i] || 'remove') === 'keep').map((c: any) => c.row))
  return (
    <div className="airpop upconf-pop" data-testid="medclash"
      onClick={e => { if ((e.target as HTMLElement).classList.contains('upconf-pop')) onCancel() }}>
      <div className="airpop-box upconf-box">
        <div className="airpop-head"><b>{newType} — {who}, {span}</b>
          <button className="x" aria-label="Close" onClick={onCancel}>✕</button></div>
        <div className="airpop-body upconf-body">
          <div className="upconf-h">Days covered by another status — choose who holds them</div>
          {clashes.map((c: any, i: number) => {
            const tl = leftover(c, i)
            const tchoice = tail[i] || 'remove'
            return (
              <div key={i}>
                <div className="upconf-left medclash-row" data-testid={`medclash-${i}`}>
                  <span>{c.row.type} {rowSpan(c.row)} · both cover <b>{win(c)}</b></span>
                  <span className="seg">
                    <button className={'upconf-seg' + (choiceOf(i) === 'new' ? ' on-keep' : '')}
                      onClick={() => setChoice(ch => ({ ...ch, [i]: 'new' }))}>{newType} replaces</button>
                    {!forced(c) &&
                      <button className={'upconf-seg' + (choiceOf(i) === 'old' ? ' on-keep' : '')}
                        onClick={() => setChoice(ch => ({ ...ch, [i]: 'old' }))}>{keepLabel(c.row)}</button>}
                  </span>
                </div>
                {tl && (
                  <div className="upconf-left medclash-tail" data-testid={`medclash-tail-${i}`}>
                    <span>Left over after it: <b>{c.row.type} {tailLabel(c, tl)}</b>
                      {tchoice === 'remove'
                        ? <em className="medclash-tailnote"> — will be removed</em>
                        : <em className="medclash-tailnote"> — kept on file</em>}</span>
                    <span className="seg">
                      <button className={'upconf-seg' + (tchoice === 'remove' ? ' on-rem' : '')}
                        onClick={() => setTail(t => ({ ...t, [i]: 'remove' }))}>Remove those days</button>
                      <button className={'upconf-seg' + (tchoice === 'keep' ? ' on-keep' : '')}
                        onClick={() => setTail(t => ({ ...t, [i]: 'keep' }))}>Keep them</button>
                    </span>
                  </div>)}
              </div>)
          })}
          <div className="upconf-none">The days each status keeps stay exactly as chosen — every day holds one
            status, and the new entry is filed around whatever you keep.</div>
        </div>
        <div className="airpop-foot upconf-foot">
          {!ready && <span className="upconf-need">Choose for each clash above</span>}
          <span style={{ flex: 1 }}></span>
          <button className="abtn ghost" onClick={onCancel}>Cancel</button>
          <button className="abtn primary" data-testid="medclash-save" disabled={!ready}
            onClick={save}>Save</button>
        </div>
      </div>
    </div>
  )
}
