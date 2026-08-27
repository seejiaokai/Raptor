/* THE MEDICAL VIEW (owner, 27 Aug 26) — who is medically down, who owes an
   upchit, who upchitted. A full-screen view of the Inputs page, the
   calendar-view chassis (.inpcal overlay, INPVIEW routing), because it is a
   status dashboard over the SAME records the table lists — not a page of its
   own.

   Everything on it is DERIVED (engine/medical.ts) from INPUTS and one as-of
   date, so it can never disagree with the table: a downchit expiring moves
   its puck to Pending Upchit by arithmetic, not by anything stored moving.

   THE AS-OF DATE defaults to the app's notional today (weeknav.TODAY — the
   one literal; the device clock would read the whole demo week as ancient
   history) and the header's calendar picks any other date to answer "who
   was down THEN" (owner: "u can click on a calendar view to view the
   history as per that selected date"). Pending Upchit and Upchit Complete
   follow the same as-of, so the three sections always describe one moment.

   A card tap opens the DOCUMENT — every account may view every document
   (owner) — and the viewer's footer carries the gated actions: edit for
   your own puck or an admin, and on a Pending card the Upchit path itself.
   This view deliberately ignores the table's filter bar: it is the
   squadron's medical state, not a filtered list (docs/ui-contracts.md). */
import { useState } from 'react'
import { PEOPLE, byCrew } from '../engine/people'
import { inpType } from '../engine/inputs'
import { medDownAsOf, pendingUpchits, upchitsWithin } from '../engine/medical'
import { MEDASOF, setMedAsOf } from '../state/view'
import { notify } from '../state/store'
import { setDocView } from './pops'
import { useVersion } from './useStore'
import { puck } from './html'
import { fmtDay, unfmt } from './inputedit'
import { monthCells } from './InputsCal'
import { TODAY, keyToIso } from './weeknav'
import { CalIcon } from './icons'

const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DOW = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const isoOrd = (iso: string) => +iso.slice(0, 4) * 10000 + +iso.slice(5, 7) * 100 + +iso.slice(8, 10)
/* a record label ('Jul 12', row-anchored) → the day-first voice this page
   speaks ('12 Jul') — through the row's own yr so cross-year stays honest */
const lblDay = (lbl: any, yr: any) => fmtDay(unfmt(lbl, yr)) || String(lbl || '')

/* one section's card: puck + what the section says about him + his remarks.
   The puck sits inside the row-direction top line and the texts are its
   SIBLINGS — the sanscard flex contract (scheduler.css), where nesting them
   in the puck's own box is the documented trap. */
function Card({ e, line, up, onOpen }: { e: any, line: string, up?: boolean, onOpen: (row: any, up?: boolean) => void }) {
  const r = e.row
  return (
    <button type="button" className="medcard" data-medcard={r.iid || ''}
      title="Tap to view the document"
      onClick={() => onOpen(r, up)}>
      <span className="medcard-top">
        <span className="seat" dangerouslySetInnerHTML={{ __html: puck(r.person, 0, true, '') }} />
        <span className="medcard-type">{inpType(r.type)}</span>
      </span>
      <span className="medcard-t">{line}</span>
      {r.remarks ? <span className="medcard-r" title={r.remarks}>{r.remarks}</span> : null}
    </button>
  )
}

export function MedicalView({ onClose }: { onClose: () => void }) {
  useVersion()
  const todayIso = keyToIso(TODAY)
  const asOf = MEDASOF || todayIso
  const ord = isoOrd(asOf)
  const [calOpen, setCalOpen] = useState(false)
  const [cal, setCal] = useState({ y: +asOf.slice(0, 4), m: +asOf.slice(5, 7) })

  /* byCrew assumes roster members; a record restored for a body since
     removed from the roster must still LIST, not crash the page — it sorts
     to the tail by name (fail open for display, the missing-input doctrine) */
  const crew = (a: any, b: any) => (PEOPLE[a.person] && PEOPLE[b.person])
    ? byCrew(a.person, b.person)
    : String(a.person).localeCompare(String(b.person))
  const down = medDownAsOf(ord).sort(crew)
  const pend = pendingUpchits(ord).sort(crew)
  const done = upchitsWithin(ord, 30)          // newest first, its own order

  const open = (row: any, up?: boolean) => { setDocView({ row, up: !!up }); notify() }
  const pick = (iso: string) => { setMedAsOf(iso === todayIso ? null : iso); setCalOpen(false); notify() }

  return (
    <div className="inpcal medview" id="medView">
      <div className="ic-head">
        <b className="med-title">Medical</b>
        {/* the as-of control: which day the three sections describe. A pick
            answers "who was down then"; Today returns the view to now. */}
        <button type="button" className={'abtn' + (calOpen ? ' on' : '')} id="medCalBtn"
          title="See the medical state as of another date"
          onClick={() => { setCal({ y: +asOf.slice(0, 4), m: +asOf.slice(5, 7) }); setCalOpen(o => !o) }}>
          <CalIcon /> as of {fmtDay(asOf)}
        </button>
        {MEDASOF && <button type="button" className="abtn" id="medToday" onClick={() => pick(todayIso)}>Today</button>}
        <span style={{ flex: 1 }}></span>
        <button type="button" className="abtn" id="medClose" onClick={onClose}>✕ List</button>
      </div>
      {calOpen && <div className="med-cal" role="dialog" aria-label="Pick the as-of date">
        <div className="med-cal-head">
          <button type="button" className="abtn" id="medCalPrev" aria-label="Previous month"
            onClick={() => setCal(c => c.m === 1 ? { y: c.y - 1, m: 12 } : { y: c.y, m: c.m - 1 })}>‹</button>
          <span className="ic-mon">{MON[cal.m - 1]} {cal.y}</span>
          <button type="button" className="abtn" id="medCalNext" aria-label="Next month"
            onClick={() => setCal(c => c.m === 12 ? { y: c.y + 1, m: 1 } : { y: c.y, m: c.m + 1 })}>›</button>
        </div>
        <div className="med-cal-dow">{DOW.map(d => <span key={d}>{d}</span>)}</div>
        <div className="med-cal-grid">
          {monthCells(cal.y, cal.m).map((iso, i) => iso
            ? <button type="button" key={iso} data-medday={iso}
              className={'med-cal-d' + (iso === asOf ? ' on' : '') + (iso === todayIso ? ' today' : '')}
              onClick={() => pick(iso)}>{+iso.slice(8, 10)}</button>
            : <span key={'x' + i} className="med-cal-x" />)}
        </div>
      </div>}
      <div className="med-body">
        <section className="medsec med-down">
          <div className="medsec-h">Medically Down<span className="medsec-n">{down.length}</span>
            <span className="medsec-sub">cannot fly as of {fmtDay(asOf)}</span></div>
          {down.length
            ? <div className="medcards">{down.map((e: any, i: number) =>
              <Card key={(e.row.iid || '') + i} e={e} onOpen={open}
                line={`till ${lblDay(e.row.endDate || e.row.date, e.row.yr)}`} />)}</div>
            : <div className="med-empty">Nobody is medically down on this date.</div>}
        </section>
        <section className="medsec med-pend">
          <div className="medsec-h">Pending Upchit<span className="medsec-n">{pend.length}</span>
            <span className="medsec-sub">the down period has ended — the upchit document is still owed</span></div>
          {pend.length
            ? <div className="medcards">{pend.map((e: any, i: number) =>
              <Card key={(e.row.iid || '') + i} e={e} up onOpen={open}
                line={`was down till ${lblDay(e.row.endDate || e.row.date, e.row.yr)}`} />)}</div>
            : <div className="med-empty">Nobody is owing an upchit.</div>}
        </section>
        <section className="medsec med-done">
          <div className="medsec-h">Upchit Complete<span className="medsec-n">{done.length}</span>
            <span className="medsec-sub">the past 30 days, newest first</span></div>
          {done.length
            ? <div className="medcards">{done.map((e: any, i: number) =>
              <Card key={(e.row.iid || '') + i} e={e} onOpen={open}
                line={`upchitted ${lblDay(e.row.date, e.row.yr)}`} />)}</div>
            : <div className="med-empty">No upchits in the past 30 days.</div>}
        </section>
      </div>
    </div>
  )
}
