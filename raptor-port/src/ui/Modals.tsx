/* The day-details panel (read-only on purpose) and the week Insights modal.
   Content strings are the reference's, verbatim. */
import { DAYS } from '../engine/data'
import { PEOPLE } from '../engine/people'
import { dayCount } from '../engine/waves'
import { validate, WARN, WCODE, wlbl } from '../engine/validate'
import { computeInsights } from '../engine/insights'
import { esc } from '../state/view'
import { notify } from '../state/store'
import { dayInfoHTML } from './html'
import { DAYPOP, setDayPop, INSIGHTS, setInsights } from './pops'
import { useVersion } from './useStore'

export function DayPop() {
  useVersion()
  if (DAYPOP == null) return <div className="airpop" id="dayPop" hidden />
  const d = DAYS[DAYPOP]
  validate()
  const wc = dayCount(d)
  const close = () => { setDayPop(null); notify() }
  return (
    <div className="airpop" id="dayPop" onClick={e => { if ((e.target as HTMLElement).id === 'dayPop') close() }}>
      <div className="airpop-box" style={{ width: 520 }}>
        <div className="airpop-head"><b id="dayPopTitle">{`${d.dow} · ${d.dt}` + (wc ? ` · ${wc}` : '')}</b><button className="x" id="dayPopClose" onClick={close}>✕</button></div>
        <div className="airpop-body" id="dayPopBody" style={{ maxHeight: '62vh' }}
          dangerouslySetInnerHTML={{ __html: dayInfoHTML(DAYPOP) }} />
        <div className="airpop-foot"><span style={{ flex: 1 }}></span><button className="abtn primary" id="dayPopDone" onClick={close}>Close</button></div>
      </div>
    </div>
  )
}

/* openInsights' body, verbatim strings, as a pure builder */
function insightsHTML() {
  const I = computeInsights(), hard = WARN.all.filter((w: any) => w.sev === 'hard').length, maxN = I.flyers.length ? I.flyers[0].n : 1
  let h = `<div class="itiles">
    <div class="itile"><div class="n">${I.sorties}</div><div class="l">Sorties</div></div>
    <div class="itile"><div class="n">${I.forms}</div><div class="l">Formations</div></div>
    <div class="itile"><div class="n">${I.flyers.length}</div><div class="l">Aircrew flying</div></div>
    <div class="itile ${hard ? 'hard' : ''}"><div class="n">${WARN.all.length}</div><div class="l">${hard} warning</div></div></div>`
  h += `<div class="isec-h">Flying load · sorties this week</div>`
  I.flyers.slice(0, 12).forEach((f: any) => {
    const p = PEOPLE[f.id]
    h += `<div class="ibar"><span class="nm" title="${esc(p.name || '')}">${esc(p.cs)}</span><span class="track"><span class="fill" style="width:${Math.round(f.n / maxN * 100)}%"></span></span><span class="v">${f.n}</span></div>`
  })
  if (I.flyers.length > 12) h += `<div style="color:var(--ink-3);font-size:11px;margin-top:4px">+ ${I.flyers.length - 12} more flying</div>`
  h += `<div class="isec-h">Not on the flying programme · ${I.idle.length} available</div><div class="ichips">` +
    (I.idle.length ? I.idle.map((id: any) => `<span class="ichip">${esc(PEOPLE[id].cs)}</span>`).join('') : '<span style="color:var(--ink-3)">everyone is scheduled</span>') + `</div>`
  const types = Object.keys(I.byType)
  h += `<div class="isec-h">Conflicts by type</div>`
  h += types.length ? types.sort((a, b) => I.byType[b] - I.byType[a]).map(t => `<div class="irow"><span>${esc(wlbl(WCODE[t] || t))}</span><span>${I.byType[t]}</span></div>`).join('')
    : '<div style="color:var(--ok);font-size:12px">No conflicts flagged. ✓</div>'
  h += `<div class="isec-h">By day</div>`
  I.dayStats.forEach((s: any) => h += `<div class="irow"><span>${s.dow}</span><span style="color:var(--ink-3)">${s.ac} sorties · ${s.forms} formations · ${s.warns ? `<span style="color:${s.hard ? 'var(--hard)' : 'var(--adv)'}">${s.warns} issue${s.warns > 1 ? 's' : ''}</span>` : '<span style="color:var(--ok)">clear</span>'}</span></div>`)
  return h
}

export function InsightsModal() {
  useVersion()
  if (!INSIGHTS) return <div className="modal" id="insightModal" hidden />
  const close = () => { setInsights(false); notify() }
  return (
    <div className="modal" id="insightModal" onClick={e => { if ((e.target as HTMLElement).id === 'insightModal') close() }}>
      <div className="modal-box" style={{ width: 600 }}>
        <div className="modal-head"><b>Week insights · 13–17 Jul</b><button className="x" id="insightClose" onClick={close}>✕</button></div>
        <div className="modal-body" id="insightBody" dangerouslySetInnerHTML={{ __html: insightsHTML() }} />
      </div>
    </div>
  )
}
