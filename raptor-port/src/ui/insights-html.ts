/* The week Insights window's body, as a pure builder — moved whole out of ui/Modals.tsx (8 Nov 26, React Doctor's
   only-export-components: a file of screen parts exports only screen parts). Modals.tsx's Insights window draws it; the
   insights tests read it. */
import { PEOPLE } from '../engine/people'
import { lgT } from '../engine/time'
import { WCODE, wlbl } from '../engine/validate'
import { computeInsights } from '../engine/insights'
import { esc } from '../state/view'
import { INSIGHTS_ALL } from './pops'

/* openInsights' body, verbatim strings, as a pure builder */
export function insightsHTML() {
  /* every figure from ONE computation — each day's latest published version, the working copy only for a day not yet
     published (owner D477, D478, 1 Oct 26; engine/insights.ts). The issues tile used to be counted here, off the working
     copy's list: it now reads the same world as the lists under it. A hidden warning is not counted (D472). */
  const I = computeInsights(), hard = I.hard, maxN = I.flyers.length ? I.flyers[0].n : 1
  let h = `<div class="itiles">
    <div class="itile"><div class="n">${I.sorties}</div><div class="l">Sorties</div></div>
    <div class="itile"><div class="n">${I.forms}</div><div class="l">Formations</div></div>
    <div class="itile"><div class="n">${I.flyers.length}</div><div class="l">Aircrew flying</div></div>
    <div class="itile ${hard ? 'hard' : ''}"><div class="n">${I.issues}</div><div class="l">${hard} warning</div></div></div>`
  h += `<div class="isec-h">Flying load · sorties this week</div>`
  if(I.tracking) h+=`<div class="insights-legend"><span class="mix-blue">Blue</span><span class="mix-red">Red</span></div><p class="insights-explain">Total-only rows include unanswered mission roles.</p>`
  I.flyers.slice(0, INSIGHTS_ALL ? I.flyers.length : 12).forEach((f: any) => {
    const p = PEOPLE[f.id]
    const mix=f.roleMix, split=I.tracking && mix && !mix.unresolved
    const bar=split?`<span class="mix-segments" style="width:${f.n/maxN*100}%"><span class="mix-blue" style="width:${mix.blue/f.n*100}%"></span><span class="mix-red" style="width:${mix.red/f.n*100}%"></span>${mix.standby ? `<span class="mix-standby" title="Standby rows that flew" style="width:${mix.standby/f.n*100}%"></span>` : ''}</span>`:`<span class="fill" style="width:${f.n/maxN*100}%"></span>`
    h += `<div class="ibar${I.tracking?' mission-mix-row':''}"><span class="nm" title="${esc(p?.name || '')}">${esc(p?.cs || f.id)}</span><span class="track">${bar}</span><span class="mix-numbers">${split?`<span class="mix-count-blue">${mix.blue}</span><span class="mix-count-red">${mix.red}</span>`:''}<span class="v">${f.n}</span></span></div>`
  })
  if (I.flyers.length > 12) h += `<button type="button" class="abtn insights-show-all" data-insights-all>${INSIGHTS_ALL?'Show less ↑':`Show all ${I.flyers.length} ↓`}</button>`
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
