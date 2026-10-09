/* "EVERY <WEEKDAY>" — the window a weekday's heading opens on Days' month (the build plan
   docs/superpowers/plans/2026-10-07-inputs-sans-redesign-plan.md §3.4).

   Owner, D631 (7 Oct 26): "no-fly days can repeat — every Thursday from a date onward, with no end." D638: "a weekday's
   heading sets repeating days." There is no "normal week" screen (D633): this is how "Thursdays are no-fly from 5 Nov"
   is said ONCE. A single Thursday can still be set by itself on the month — it then wears the dot.

   A window on the windows shell (D641): it blocks neither the page nor Days behind it, so the month repaints under it.
   Save is one `fly.rule.set` command, Remove one `fly.rule.remove` — one Undo step each (state/flyplan.ts). A second
   rule for the same weekday and the same start REPLACES the first there, so the form never has to ask "which one".

   THE FORM CHECKS WHAT ONLY IT KNOWS — that a start is chosen, that "A date" has its date, that the end is not before
   the start — each with its own short sentence; the command still checks the whole rule, and its refusal is shown too. */
import { useState } from 'react'
import { FloatWin } from './FloatWindow'
import { MoonIcon, SunIcon } from './icons'
import { getFlyPlan, removeFlyRule, setFlyRule, type FlySave } from '../state/flyplan'
import { validIso, type FlyCls, type FlyRule } from '../state/flyplan-model'
import { WD_LONG, sayDateY } from './daysfmt'

type Cls = 'day' | 'night' | 'nf'
/* a rule is never "no flying set" from this form: a Saturday has none until he says otherwise, and a rule that said
   "none" would be a rule that says nothing — he removes the rule instead */
const CHOICES: Array<{ cls: Cls; label: string }> = [
  { cls: 'day', label: 'Day' }, { cls: 'night', label: 'Night' }, { cls: 'nf', label: 'NF · no fly' },
]
/* as the summary sentence says it ("… is a no-fly day"), and as a listed rule leads with it */
const A_DAY: Record<Cls, string> = { day: 'a day-flying day', night: 'a night-flying day', nf: 'a no-fly day' }
const LEAD: Record<FlyCls, string> = { day: 'Day flying', night: 'Night flying', nf: 'No fly', none: 'No flying set' }

export function EveryWeekday({ wd, from: from0, onClose }: {
  /** 0 = Monday … 6 = Sunday */
  wd: number
  /** the start the form opens on — the first such day on screen that is not in the past (Days works it out) */
  from: string
  onClose: () => void
}) {
  const name = WD_LONG[wd]
  /* what changes something: a weekday is day flying already, so no fly is the likely ask; a Saturday or Sunday has no
     flying set, so day flying is */
  const [cls, setCls] = useState<Cls>(wd >= 5 ? 'day' : 'nf')
  const [from, setFrom] = useState(from0)
  const [ends, setEnds] = useState(false)
  const [until, setUntil] = useState('')
  const [err, setErr] = useState('')
  /* any change to the form takes the last complaint down — it was about what the form held then */
  const edit = <T,>(set: (v: T) => void) => (v: T) => { setErr(''); set(v) }

  /* this weekday's rules, in date order (the plan keeps its rules sorted by start). Read at every paint: this window is
     drawn by Days, which repaints on the scheduler's signal — so the list follows a Remove, an Undo, a Save */
  const mine = getFlyPlan().rules.filter(r => r.wd === wd)
  const said = (r: FlyRule) => `${LEAD[r.cls]} · from ${sayDateY(r.from)} · ${r.until ? 'until ' + sayDateY(r.until) : 'no end'}`

  const done = (then: () => void) => (r: FlySave) => { if (r.ok) then(); else setErr(r.message || 'This change could not be saved.') }
  const run = (r: FlySave, then: () => void) => { if (r.pending) void r.pending.then(done(then)); else done(then)(r) }
  const save = () => {
    if (!validIso(from)) { setErr('Choose the date it starts.'); return }
    if (ends && !validIso(until)) { setErr('Choose the date it ends, or pick No end.'); return }
    if (ends && until < from) { setErr('It cannot end before it starts.'); return }
    run(setFlyRule(ends ? { wd, cls, from, until } : { wd, cls, from }), onClose)
  }

  const fromSaid = validIso(from) ? sayDateY(from) : '…'
  const untilSaid = validIso(until) ? sayDateY(until) : '…'
  return (
    <FloatWin id="everywd" title={`Every ${name}`} testid="win-every" className="everywin" onClose={onClose}>
      <div className="every-lab" id="everyClsLab">Flying</div>
      <div className="every-seg" role="group" aria-labelledby="everyClsLab">
        {CHOICES.map(c => (
          <button
            key={c.cls}
            type="button"
            className={'every-opt c-' + c.cls + (cls === c.cls ? ' lit' : '')}
            data-testid={`every-cls-${c.cls}`}
            aria-pressed={cls === c.cls}
            onClick={() => edit(setCls)(c.cls)}
          >
            {c.cls === 'day' ? <SunIcon /> : c.cls === 'night' ? <MoonIcon /> : null}{c.label}
          </button>
        ))}
      </div>

      <label className="every-lab" htmlFor="everyFrom">From</label>
      <input type="date" id="everyFrom" className="every-date" data-testid="every-from" value={from} onChange={e => edit(setFrom)(e.target.value)} />

      <div className="every-lab" id="everyUntilLab">Until</div>
      <div className="every-seg two" role="group" aria-labelledby="everyUntilLab">
        <button type="button" className={'every-opt' + (!ends ? ' lit' : '')} data-testid="every-until-none" aria-pressed={!ends} onClick={() => edit(setEnds)(false)}>No end</button>
        <button type="button" className={'every-opt' + (ends ? ' lit' : '')} data-testid="every-until-date" aria-pressed={ends} onClick={() => edit(setEnds)(true)}>A date</button>
      </div>
      {ends && (
        <input type="date" className="every-date" data-testid="every-until" aria-label="The date it ends" min={validIso(from) ? from : undefined} value={until} onChange={e => edit(setUntil)(e.target.value)} />
      )}

      <p className="every-says" data-testid="every-says">
        {ends
          ? `Every ${name} from ${fromSaid} to ${untilSaid} is ${A_DAY[cls]}. A single ${name} can still be set by itself.`
          : `Every ${name} from ${fromSaid} onward is ${A_DAY[cls]}, until you change it here. A single ${name} can still be set by itself.`}
      </p>
      {err && <p className="every-err" data-testid="every-err" role="alert">{err}</p>}
      <div className="every-acts">
        <button type="button" className="abtn" data-testid="every-cancel" onClick={onClose}>Cancel</button>
        <button type="button" className="abtn primary" data-testid="every-save" onClick={save}>Save</button>
      </div>

      {mine.length > 0 && (
        <div className="every-list" data-testid="every-list">
          <div className="every-lab">Already set for {name}s</div>
          {mine.map(r => (
            <div key={r.id} className="every-rule">
              <span className="every-rule-txt">{said(r)}</span>
              <button
                type="button"
                className="abtn"
                data-testid={`every-remove-${r.id}`}
                aria-label={`Remove: ${LEAD[r.cls]} from ${sayDateY(r.from)}`}
                onClick={() => run(removeFlyRule(r.id), () => setErr(''))}
              >Remove</button>
            </div>
          ))}
        </div>
      )}
    </FloatWin>
  )
}
