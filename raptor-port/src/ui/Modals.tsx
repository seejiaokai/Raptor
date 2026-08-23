/* The day-details panel (read-only on purpose), the week Insights modal and
   the airspace/traffic popup. Content strings are the reference's, verbatim.
   The Manage-users modal moved to the Admin page whole (23 Aug 26) —
   ui/AdminPage.tsx. */
import { useEffect, useRef } from 'react'
import { DAYS } from '../engine/data'
import { PEOPLE } from '../engine/people'
import { dayCount } from '../engine/waves'
import { lgT } from '../engine/time'
import { validate, WARN, WCODE, wlbl } from '../engine/validate'
import { computeInsights } from '../engine/insights'
import { markEdit } from '../engine/publish'
import { esc, afterSchedMutate } from '../state/view'
import { SESSION } from '../state/auth'
import { notify } from '../state/store'
import { dayInfoHTML } from './html'
import { DAYPOP, setDayPop, INSIGHTS, setInsights, AIRKEY, setAirKey } from './pops'
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
  /* WORK HOURS (owner, 20 Aug 26 — "perhaps have a section to show everyone's
     work hours in the insights for the week"). Beside the flying load on
     purpose: the two answer the same question from opposite ends — who is
     flying the most sorties, and who is at work the longest, which are
     regularly not the same man (a duty stander flies nothing and is there all
     day). Everyone with a scheduled hour is listed rather than a top 12: the
     ask was everyone's, the number that matters may be at the bottom, and the
     modal already scrolls.
     The heading states the definition, because "work hours" would otherwise
     read as hours airborne — it is report through debrief for a flying day and
     start to end for everything else, the same span the long-work-day note is
     raised from (engine/validate.ts `workSpan`). */
  const maxW = I.hours.length ? I.hours[0].mins : 1
  h += `<div class="isec-h">Work hours · report to debrief, this week</div>`
  if (!I.hours.length) h += `<div style="color:var(--ink-3);font-size:12px">Nothing scheduled this week.</div>`
  I.hours.forEach((w: any) => {
    const p = PEOPLE[w.id]
    h += `<div class="ibar"><span class="nm" title="${esc((p && p.name) || '')}">${esc((p && p.cs) || w.id)}</span>` +
      `<span class="track"><span class="fill" style="width:${Math.round(w.mins / maxW * 100)}%"></span></span>` +
      `<span class="v" title="${w.days} day${w.days > 1 ? 's' : ''} on the programme">${esc(lgT(w.mins))}</span></div>`
  })
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

/* ---- airspace / traffic popup — renderAir + airEdit verbatim. Traffic is a
   scheduled airspace booking like any other field on the board, so it has to
   earn an amendment mark and a history step (the tr: funnel). ---- */
function findGo(key: any) { const [di, gi] = key.split('|'); return DAYS[+di] && DAYS[+di].waves[+gi] }
/* THE LIST AS IT STOOD, kept here rather than read back at commit time. The
   three handlers below all write `traffic` in place BEFORE airEdit runs — the
   typing one has to, because a React-controlled list would repaint under the
   caret — so by the time the commit happens the old value is already gone and
   the edit log had nothing to diff. Taken when the popup opens and refreshed
   on every commit, which is exactly the window a "before" has to span. */
let TRWAS: string[] = []
function trText(g: any) { return (((g && g.traffic) || []) as any[]).join(' · ') }
function airEdit() {
  if (!AIRKEY) return; const [di, gi] = String(AIRKEY).split('|')
  const now = trText(findGo(AIRKEY))
  markEdit(`tr:${+di!}.${+gi!}`, TRWAS.join(' · '), now)
  TRWAS = (((findGo(AIRKEY) || {}).traffic || []) as any[]).slice()
  afterSchedMutate(); notify()
}
export function AirPop() {
  useVersion()
  const bodyRef = useRef<HTMLDivElement>(null)
  const open = AIRKEY != null
  const g = open ? findGo(AIRKEY) : null
  /* the opening snapshot for the edit log. Keyed on AIRKEY, NOT on every
     render: the effect below deliberately has no dependency list, and
     re-snapshotting on an unrelated repaint would quietly adopt the half-typed
     value as the "before". */
  useEffect(() => { TRWAS = (((g || {}).traffic || []) as any[]).slice() }, [AIRKEY])
  /* renderAir: innerHTML + delegated input/focusout, exactly as the reference
     wires #airBody (a React-controlled list would repaint under the caret) */
  useEffect(() => {
    if (!g) return
    g.traffic = g.traffic || []
    const admin = SESSION && SESSION.role === 'admin', body = bodyRef.current!
    if (admin) {
      body.innerHTML = g.traffic.map((a: any, i: number) => `<div class="airrow"><span class="adot"></span>
      <input value="${esc(a)}" data-airi="${i}" aria-label="Airspace line ${i + 1}"><button class="del" data-airdel="${i}">✕</button></div>`).join('')
        || `<div style="color:var(--ink-3);font-size:12px">No traffic booked yet — add a row.</div>`
    } else {
      /* esc() as the admin branch above does: a traffic line is admin-typed
         free text and airspace shorthand really does contain bare `<`
         ("<090 inbound"), which silently swallowed the rest of the list for
         every member reading it */
      body.innerHTML = `<div class="airview">` + (g.traffic.length ? g.traffic.map((a: any) => `<div><span class="adot"></span>${esc(a)}</div>`).join('') : '<span style="color:var(--ink-3)">No traffic booked.</span>') + `</div>`
    }
  })
  if (!open) return <div className="airpop" id="airpop" hidden />
  const close = () => { setAirKey(null); notify() }
  const admin = SESSION && SESSION.role === 'admin'
  return (
    <div className="airpop" id="airpop" onClick={e => { if ((e.target as HTMLElement).id === 'airpop') close() }}>
      <div className="airpop-box">
        <div className="airpop-head"><b id="airTitle">{`Traffic · ${g.label || ''}`}</b><button className="x" id="airClose" onClick={close}>✕</button></div>
        <div className="airpop-body" id="airBody" ref={bodyRef}
          onInput={e => { const i = (e.target as HTMLElement).closest('[data-airi]') as HTMLInputElement | null; if (!i) return; findGo(AIRKEY).traffic[+i.dataset.airi!] = i.value }}
          onBlur={e => { if ((e.target as HTMLElement).closest('[data-airi]')) airEdit() }}
          onClick={e => {
            const del = (e.target as HTMLElement).closest('[data-airdel]') as HTMLElement | null
            if (del) { const gg = findGo(AIRKEY); gg.traffic.splice(+del.dataset.airdel!, 1); airEdit() }
          }} />
        {admin && <div className="airpop-foot" data-admin="">
          <button className="abtn" id="airAdd" onClick={() => { const gg = findGo(AIRKEY); gg.traffic = gg.traffic || []; gg.traffic.push('1 X … / … / … / …'); airEdit() }}>Add row</button>
          <button className="abtn primary" id="airDone" onClick={close}>Done</button>
        </div>}
      </div>
    </div>
  )
}

export function InsightsModal() {
  useVersion()
  if (!INSIGHTS) return <div className="modal" id="insightModal" hidden />
  const close = () => { setInsights(false); notify() }
  return (
    <div className="modal" id="insightModal" onClick={e => { if ((e.target as HTMLElement).id === 'insightModal') close() }}>
      <div className="modal-box" style={{ width: 600 }}>
        <div className="modal-head"><b>Week insights · {DAYS[0].dt} – {DAYS[DAYS.length - 1].dt}</b><button className="x" id="insightClose" onClick={close}>✕</button></div>
        <div className="modal-body" id="insightBody" dangerouslySetInnerHTML={{ __html: insightsHTML() }} />
      </div>
    </div>
  )
}
