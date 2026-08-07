/* MY PROGRAMME (owner, 7 Aug 26) — the page most of the squadron actually
   logs in for: when do I fly, when do I report, what is flagged on me. One
   vertical column of day cards on a phone, a grid on a desktop; no horizontal
   week scroller, which is the whole point of having a personal page.

   "Me" is the view-as person (ME). There are no per-person accounts — SESSION
   is a role, and ME is set from the topbar select or the drawer chips — so
   the picker is repeated in this page's own header: on a phone the topbar
   select is hidden, and for a scheduler the same control makes this page a
   per-person lens over the week. When real accounts arrive (the server work
   in HANDOFF), the login→ME mapping slots in here untouched.

   Data is all read-made: dayEvents() is validate()'s per-day per-person index
   of the same events the engine checks, personWarns() the warnings naming
   him, traceOf() the cross-day crew-rest mark. Nothing here recomputes a
   rule. React owns this page (it is not a dense surface); JSX interpolation
   escapes every string it prints, which the tests pin with a hostile remark. */
import { DAYS } from '../engine/data'
import { PEOPLE, LEVELNAME } from '../engine/people'
import { hhmm } from '../engine/time'
import { dayEvents, WCODE, SEVWORD, wlbl, traceOf, traceIx } from '../engine/validate'
import { personWarns, personWarnDays } from '../engine/avail'
import { INPUTS, inputCoversDate, inpLabel, isAway } from '../engine/inputs'
import { dayApproved } from '../engine/publish'
import { ME, setMe } from '../state/auth'
import { notify } from '../state/store'
import { useVersion } from './useStore'

/* the kind → left-bar colour class; the names match the CSS section palette */
const KIND = ['fly', 'shift', 'sim', 'duty', 'ground', 'prog']

function FlySub({ e }: any) {
  /* the four times aircrew actually plan around, in the order the day runs.
     A shift has no brief and reports when it starts, so it prints its window
     from the main row alone. */
  return (
    <div className="mpsub">
      report <b>{hhmm(e.report)}</b>
      {e.brief != null && <> · brief <b>{hhmm(e.brief)}</b></>}
      {' '}· T/O <b>{hhmm(e.to)}</b> · land <b>{hhmm(e.ld)}</b>
    </div>
  )
}

function DayCard({ di }: any) {
  const d: any = DAYS[di]
  const evs = [...dayEvents(di, ME)].sort((a: any, b: any) => a.s - b.s)
  const inps = INPUTS.filter((i: any) => i.person === ME && inputCoversDate(i, d.dt))
  const warns = personWarns(di, ME)
  const trace = traceOf(di, ME)
  const tix = trace ? traceIx(trace, ME) : -1
  const off = inps.find((i: any) => isAway(i) && i.allday)
  const ok = dayApproved(di)
  return (
    <div className="mpday">
      <div className="mphead">
        <b>{d.dow}</b>
        <span className="dt">{d.dt}</span>
        <span className={'st ' + (ok ? 'ok' : 'draft')}>{ok ? 'Published' : 'Draft'}</span>
      </div>
      {evs.length === 0 && !off && <div className="dip-none">Nothing tasked{inps.length ? '' : ' — free day'}</div>}
      {off && <div className="dip-none">Away — {inpLabel(off)}{off.remarks ? ` · ${off.remarks}` : ''}</div>}
      {evs.map((e: any, i: number) => (
        <div key={i} className={'mpev ' + (KIND.includes(e.kind) ? e.kind : 'prog')}>
          <span className="t">{hhmm(e.s)}–{hhmm(e.e)}</span>
          <span className="lb">
            {e.label}
            {e.kind === 'fly' && <FlySub e={e} />}
          </span>
        </div>
      ))}
      {inps.filter((i: any) => i !== off).map((i: any, n: number) => (
        <div key={'i' + n} className={'mpinp' + (i.acc ? ' accd' : '')}>
          {inpLabel(i)}{i.allday ? '' : ` ${hhmm(i.s)}–${hhmm(i.e)}`}
          {i.remarks ? ` — ${i.remarks}` : ''}
          <i>{i.acc ? 'actioned' : 'pending'}</i>
        </div>
      ))}
      {(warns.length > 0 || (trace && tix >= 0)) && (
        <div className="dwlist solo mpwl">
          {warns.map(({ w, ix }: any) => (
            <div key={ix} className={'witem ' + w.sev} data-myw={`${di}.${ix}`}
              title="Open the week at this warning">
              <span className="wbar"></span>
              <span>
                <span className="wcode">{SEVWORD[w.sev]} · {wlbl(WCODE[w.code] || w.code)}</span>
                {w.msg}
              </span>
            </div>
          ))}
          {trace && tix >= 0 && (
            <div className="dwtrace">
              <div className="witem hard wtr" data-myw={`${trace.di}.${tix}`}
                title="Open the week at the line on this day that caused it">
                <span className="wbar"></span>
                <span>
                  <span className="wcode">Breaks {trace.dow || 'the next day'}</span>
                  had to leave by <b>{trace.leaveBy}</b>
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function MyProgPage() {
  useVersion()
  const p: any = PEOPLE[ME]
  /* the same list the topbar select offers — archived people stay pickable
     nowhere (Shell.tsx:149) */
  const people = Object.keys(PEOPLE).filter((id: any) => !PEOPLE[id].archived)
  const wk = personWarnDays(ME).length
  return (
    <div className="mypage">
      <div className="mphdr">
        <b className="cs">{p ? p.cs : ME}</b>
        {p && <span className="mprole">{LEVELNAME[p.q] || p.q}</span>}
        {p && p.sxo && <span className="badge">SXO</span>}
        {p && p.san && <span className="badge san">SANS</span>}
        <span className="mpcount">{wk ? `${wk} day${wk === 1 ? '' : 's'} flagged this week` : 'nothing flagged this week ✓'}</span>
        <span className="right sel">
          <label htmlFor="mpViewAs">View as</label>
          <select id="mpViewAs" aria-label="Whose programme to show" value={ME}
            onChange={e => { setMe(e.target.value); notify() }}>
            {people.map((id: any) => <option key={id} value={id}>{PEOPLE[id].cs}</option>)}
          </select>
        </span>
      </div>
      <div className="mpgrid">
        {DAYS.map((_: any, di: number) => <DayCard key={di} di={di} />)}
      </div>
    </div>
  )
}
