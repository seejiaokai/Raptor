/* THE OIL ASK (owner, 28 Aug 26 — "it will ask the user if the duty and
   commitment deserves an applicable OIL"). A duty-&-commitments input whose
   span covers a weekend or public holiday is NEVER credited silently: every
   editor that can save one opens this sheet BEFORE anything is written, and
   the answer rides the same writeInputsBatch as the save — one undo step.
   Cancel writes nothing. No default where the decision is real (the
   UpchitConfirm doctrine): Save stays disabled until a choice is made, and
   an unanswered day credits nothing at all.

   The content comes from leavewar/sync.ts:oilAskPlan — the same body the
   credit pass reads — so what this sheet offers and what the wire then
   posts cannot disagree. The suggested amount is the INPUT's own standing
   (all-day = FO, ≤6h = HO, >6h = FO); the cell finally posted may still
   upgrade where published schedule work stretches the same day's
   start-to-finish envelope (owner, 29 Aug 26).

   A single-day plan is a plain Yes / No. A multi-day plan offers All days /
   Only some days… / No OIL — "some" opens a month grid (the RangeCal
   arithmetic, copied the way WeekCal copied it) where only the applicable
   days are tappable; tap to select, tap again to deselect (owner's exact
   ask), then Save. */
import { useEffect, useMemo, useState } from 'react'

const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const iso = (y: number, m: number, d: number) =>
  `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
const dLabel = (v: string) => `${+v.slice(8, 10)} ${MON[+v.slice(5, 7) - 1]}`

/* the multi-select month grid — only `days` are live, everything else inert */
function OilDayCal({ days, sel, onToggle }: {
  days: string[], sel: Set<string>, onToggle: (d: string) => void
}) {
  const first = days[0]
  const [view, setView] = useState({ y: +first.slice(0, 4), m: +first.slice(5, 7) - 1 })
  const ask = useMemo(() => new Set(days), [days])
  const f = new Date(Date.UTC(view.y, view.m, 1))
  const lead = (f.getUTCDay() + 6) % 7                       // Monday-first
  const nDays = new Date(Date.UTC(view.y, view.m + 1, 0)).getUTCDate()
  const cells: (number | null)[] = []
  for (let i = 0; i < lead; i++) cells.push(null)
  for (let d = 1; d <= nDays; d++) cells.push(d)
  while (cells.length % 7) cells.push(null)
  const step = (n: number) => {
    const m = view.m + n
    setView({ y: view.y + Math.floor(m / 12), m: ((m % 12) + 12) % 12 })
  }
  return (
    <div className="rangecal oilcal" data-testid="oilcal">
      <div className="rc-h">
        <button type="button" className="rc-nav" aria-label="Previous month" onClick={() => step(-1)}>‹</button>
        <span className="rc-mon">{MON[view.m]} {view.y}</span>
        <button type="button" className="rc-nav" aria-label="Next month" onClick={() => step(1)}>›</button>
      </div>
      <div className="rc-dow">{['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(d => <span key={d}>{d}</span>)}</div>
      <div className="rc-grid">
        {cells.map((d, i) => {
          if (d == null) return <span key={i} className="rc-x" />
          const v = iso(view.y, view.m, d)
          if (!ask.has(v)) return <span key={i} className="rc-d oc-off">{d}</span>
          return (
            <button type="button" key={i} data-oilday={v}
              className={'rc-d oc-ask' + (sel.has(v) ? ' sel' : '')}
              aria-label={`${d} ${MON[view.m]} ${view.y}${sel.has(v) ? ' — selected' : ''}`}
              onClick={() => onToggle(v)}>{d}</button>
          )
        })}
      </div>
    </div>
  )
}

export function OilConfirm({ who, typeLabel, plan, prev, onSave, onCancel }: {
  who: string
  typeLabel: string
  plan: { iso: string, amt: 0.5 | 1 }[]
  prev: Record<string, number>
  onSave: (decisions: Record<string, number>) => void
  onCancel: () => void
}) {
  const multi = plan.length > 1
  const amt = plan[0].amt                                    // one window → one standing for every day
  const amtWord = amt === 1 ? 'FO — a full day' : 'HO — half a day'
  /* the forced choice — unset until the filer picks, even on a re-ask; the
     prior answers only pre-seed WHICH days "some" starts from */
  const [mode, setMode] = useState<'' | 'yes' | 'no' | 'all' | 'some' | 'none'>('')
  const [sel, setSel] = useState<Set<string>>(
    () => new Set(plan.filter(p => (prev[p.iso] ?? 0) > 0).map(p => p.iso)))
  const ready = mode !== ''
  const toggle = (d: string) => setSel(s => {
    const n = new Set(s); n.has(d) ? n.delete(d) : n.add(d); return n
  })
  const save = () => {
    const dec: Record<string, number> = {}
    for (const p of plan) {
      const yes = mode === 'yes' || mode === 'all' || (mode === 'some' && sel.has(p.iso))
      dec[p.iso] = yes ? p.amt : 0
    }
    onSave(dec)
  }
  /* its own Escape = cancel THIS sheet only — the UpchitConfirm idiom */
  useEffect(() => {
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.stopPropagation(); onCancel() } }
    document.addEventListener('keydown', esc, true)
    return () => document.removeEventListener('keydown', esc, true)
  })
  const seg = (k: typeof mode, label: string, tid: string) => (
    <button className={'upconf-seg' + (mode === k ? ' on-keep' : '')} data-testid={tid}
      onClick={() => setMode(k)}>{label}</button>
  )
  return (
    <div className="airpop upconf-pop oilconf-pop" data-testid="oilconf"
      onClick={e => { if ((e.target as HTMLElement).classList.contains('upconf-pop')) onCancel() }}>
      <div className="airpop-box upconf-box">
        <div className="airpop-head"><b>OIL — {who}, {typeLabel}</b>
          <button className="x" aria-label="Close" onClick={onCancel}>✕</button></div>
        <div className="airpop-body upconf-body">
          {multi ? <>
            <div className="upconf-h">This input covers {plan.length} non-working days (weekend / PH)</div>
            <div className="oilconf-what">Each confirmed day earns <b>{amtWord}</b> of OIL. Which days does it deserve?</div>
            <div className="upconf-left oilconf-modes">
              <span className="seg">
                {seg('all', 'All days', 'oil-all')}
                {seg('some', 'Only some days…', 'oil-some')}
                {seg('none', 'No OIL', 'oil-none')}
              </span>
            </div>
            {mode === 'some' && <>
              <OilDayCal days={plan.map(p => p.iso)} sel={sel} onToggle={toggle} />
              <div className="oilconf-count" data-testid="oil-count">
                {sel.size ? `${sel.size} of ${plan.length} days selected — tap a day to change it` : 'No days selected — tap the highlighted days to credit them'}
              </div>
            </>}
          </> : <>
            <div className="upconf-h">This input falls on a non-working day — {dLabel(plan[0].iso)} (weekend / PH)</div>
            <div className="oilconf-what">Does it deserve <b>{amtWord}</b> of OIL?</div>
            <div className="upconf-left oilconf-modes">
              <span className="seg">
                {seg('yes', `Yes — credit ${amt === 1 ? 'FO' : 'HO'}`, 'oil-yes')}
                {seg('no', 'No OIL', 'oil-no')}
              </span>
            </div>
          </>}
          <div className="oilconf-note">The credit lands on the Leave War as {amt === 1 ? 'an FO' : 'an HO'} cell and moves the OIL balance. Hours count start to finish for the whole day, so published schedule work on the same day can raise it.</div>
        </div>
        <div className="airpop-foot upconf-foot">
          {!ready && <span className="upconf-need">Choose an option above</span>}
          <span style={{ flex: 1 }}></span>
          <button className="abtn ghost" onClick={onCancel}>Cancel</button>
          <button className="abtn primary" data-testid="oilconf-save" disabled={!ready} onClick={save}>Save</button>
        </div>
      </div>
    </div>
  )
}
