/* A DAY OPENED ON THE SANS CALENDAR (the build plan docs/superpowers/plans/2026-10-07-inputs-sans-redesign-plan.md §3.5).

   Owner, D617 (7 Oct 26): still needed = the Leave War's required figure, less those it shows available, less the SANS
   committed to fly — for pilots and WSOs each. D626: the opened day shows its working, and the row reads "Available"
   with nothing after it. D648: "lists everyone and scrolls — no '+ more' line; it does not open full screen, but on a
   phone it can be pulled up by its top bar to nearly the full screen and back down." D647 / D649 / D651: each person is
   the SCHEDULE'S OWN puck — "the chip attached … just like the pucks used for the schedule. All same size" — wearing
   the SANS purple edge. D629: who placed each and when, in small print. D646: a LATE tag, pressed, says the cut-off it
   missed. D675: the admin's button into the window that sets each date's flying reads "Calendar…".

   A WINDOW ON THE SHELL (ui/FloatWindow.tsx): it is dragged about and the calendar behind it still works (D641) — so
   tapping another date re-points this same window, and a commitment saved behind it shows in it at once.

   IT WORKS NOTHING OUT. The working is the ONE resolver's answer (leavewar/sync.ts flyAnswer → state/flyplan-model.ts
   planFor) with the two figures it was worked from (dayFacts — who is available; sansCommittedOn — the SANS committed);
   the list is ui/sanscal-model.ts sansDayGroups. It repaints on the scheduler's signal (a commitment, a plan row) and
   on the war's (`useWarFacts` — a bid decided, a holiday declared, a count row re-defined).

   THE PUCK is ui/html.ts puck() itself — never a look-alike — so the seat's colour, the CAT chip and the SANS edge are
   the schedule's by construction (a test asserts the edge's class is there). Only its tab stop is taken off: the line
   it stands on is the button. */
import { useState } from 'react'
import { PEOPLE } from '../engine/people'
import { isAdmin } from '../state/perms'
import { notify } from '../state/store'
import { sansCommittedOn } from '../state/flyplan'
import { dayFacts, flyAnswer, useWarFacts } from '../leavewar/sync'
import { FloatWin, bringForward } from './FloatWindow'
import { puck } from './html'
import { setDaysWin, setInpEdit } from './pops'
import { maySansAdd, openSansAdd } from './sansadd'
import { dayWord, sansDayGroups, type SansEntry } from './sanscal-model'
import { useVersion } from './useStore'

/** what kind of day it is, in words — the window's second line */
function kindWord(iso: string): string {
  const a = flyAnswer(iso)
  if (a.kind) {
    const name = dayFacts(iso).name
    const word = a.kind === 'ph' ? 'Public holiday' : 'Off day'
    /* its own name where it has one that says more than the kind does ("National Day") */
    return name && !/^(ph|off day|off)$/i.test(name.trim()) ? `${word} · ${name}` : word
  }
  return a.cls === 'day' ? 'Day flying' : a.cls === 'night' ? 'Night flying' : a.cls === 'nf' ? 'No fly' : 'No flying set'
}

const SEATS = ['p', 'w'] as const

export function SansDay({ iso, hi, onClose }: {
  iso: string
  /** the man picked in Highlight, if any — his lines are marked */
  hi: string | null
  onClose: () => void
}) {
  useVersion()
  useWarFacts()
  /* which late commitment's note is showing (its input id) */
  const [lateOpen, setLateOpen] = useState<string | null>(null)
  const a = flyAnswer(iso), facts = dayFacts(iso), com = sansCommittedOn(iso), g = sansDayGroups(iso)
  const canAdd = maySansAdd()
  const avail = { p: facts.availP, w: facts.availW }

  const reqText = (s: 'p' | 'w') => a.reqFrom[s] === 'nf' ? 'NF' : a.req[s] === null ? '–' : String(a.req[s])
  const dash = (v: number | null) => v === null ? '–' : String(v)
  const open = (r: any) => { setInpEdit(r); notify() }

  const line = (e: SansEntry & { why?: string }) => {
    const iid = String(e.r.iid)
    return (
      /* THE LINE'S BUTTON is the puck and the letters — what a keyboard and a screen reader meet. A press anywhere else
         on the line opens the commitment too (a finger aims at the line, not at a word in it); the LATE tag is a
         button of its own beside it, so it can never be a button inside a button. */
      <div key={iid} className={'sd-row' + (hi && hi === e.id ? ' is-hi' : '')} data-testid={'sd-row-' + iid} data-popiid={iid}
        onClick={ev => { if (!(ev.target as HTMLElement).closest('button')) open(e.r) }}>
        <button type="button" className="sd-open" data-testid="sd-open" aria-label={`${PEOPLE[e.id] ? PEOPLE[e.id].cs : e.id}, ${e.letters || 'no activity'}, ${e.hours}`}
          onClick={() => open(e.r)}>
          <span className="sd-puck" aria-hidden="true" dangerouslySetInnerHTML={{ __html: puck(e.id, false, true, false).replace(' tabindex="0"', '') }} />
          <span className="sd-letters" data-testid="sd-letters">{e.letters || '—'}</span>
        </button>
        {e.late ? (
          <button type="button" className="sd-late" data-testid="sd-late" aria-expanded={lateOpen === iid} title={e.late}
            onClick={() => setLateOpen(o => (o === iid ? null : iid))}>LATE</button>
        ) : <span />}
        <span className="sd-hours" data-testid="sd-hours">{e.hours}</span>
        {e.late && lateOpen === iid && <span className="sd-latenote" data-testid="sd-latenote" role="status">{e.late}</span>}
        {e.why && <span className="sd-why" data-testid="sd-why">{e.why}</span>}
        {e.r.remarks && <span className="sd-rmk">{e.r.remarks}</span>}
        {e.placed && <span className="sd-placed" data-testid="sd-placed">{e.placed}</span>}
      </div>
    )
  }
  const group = (key: 'w' | 'p' | 'other' | 'out', head: string, list: Array<SansEntry & { why?: string }>) => list.length > 0 && (
    <section key={key} className="sd-group">
      <h3 className="sd-gh" data-testid={'sd-group-' + key}>{head}</h3>
      {list.map(line)}
    </section>
  )
  const outN = new Set(g.out.map(e => e.id)).size
  const any = g.w.length + g.p.length + g.other.length + g.out.length > 0

  return (
    <FloatWin id="sansday" title={dayWord(iso)} sub={kindWord(iso)} testid="win-sansday" className="sansday" rests tallFirst onClose={onClose}>
      {/* PINNED: the working and "+ Commitment" stay while the names scroll under them (D648) */}
      <div className="sd-top">
        <table className="sd-work" data-testid="sd-work">
          <thead><tr><th scope="col"><span className="sd-vh">Figure</span></th><th scope="col">Pilots</th><th scope="col">WSOs</th></tr></thead>
          <tbody>
            <tr><th scope="row">Required to fly</th>{SEATS.map(s => <td key={s} data-testid={'sd-req-' + s}>{reqText(s)}</td>)}</tr>
            <tr><th scope="row">Available</th>{SEATS.map(s => <td key={s} data-testid={'sd-avail-' + s}>{dash(avail[s])}</td>)}</tr>
            <tr><th scope="row">SANS committed to fly</th>{SEATS.map(s => <td key={s} data-testid={'sd-sans-' + s}>{com.f[s].length}</td>)}</tr>
            <tr className="sd-needrow"><th scope="row">Still needed</th>{SEATS.map(s => (
              <td key={s} data-testid={'sd-need-' + s} className={a.need[s] === null ? '' : a.need[s] === 0 ? 'is-zero' : 't-' + a.tone}>{dash(a.need[s])}</td>
            ))}</tr>
          </tbody>
        </table>
        {!facts.covered && <p className="sd-note" data-testid="sd-nocover">No leave period covers this date, so who is available is not known.</p>}
        <div className="sd-acts">
          <button type="button" className="abtn primary sd-add" data-testid="sd-add" disabled={!canAdd} onClick={() => { openSansAdd(iso) }}>+ Commitment</button>
          {isAdmin() && (
            <button type="button" className="abtn sd-days" data-testid="sd-days" title="Set this month’s day, night and no-fly days, and the year’s holidays"
              onClick={() => { setDaysWin(iso); notify(); bringForward('days') }}>Calendar…</button>
          )}
        </div>
        {!canAdd && <p className="sd-note" data-testid="sd-addwhy">SANS aircrew add their availability here.</p>}
      </div>
      <div className="sd-list" data-testid="sd-list">
        {!any && <p className="sd-empty" data-testid="sd-empty">No commitments yet.</p>}
        {group('w', `WSOs · ${g.flyW} to fly`, g.w)}
        {group('p', `Pilots · ${g.flyP} to fly`, g.p)}
        {group('other', `OFT or AMT only · ${g.otherN}`, g.other)}
        {group('out', `Not counted · ${outN}`, g.out)}
      </div>
    </FloatWin>
  )
}
