/* ARRANGE SECTIONS (owner, 29 Aug 26 — "allow me to arrange the order in which
   the schedule shows in edit schedule and scheduler board … the template saved
   will remember the order too"). A small per-day sheet that re-orders the day's
   big section panels — Programme, Flying waves, Duties, Sims, Ground Programme —
   the same order both Edit Schedule (ui/html.ts dayHTML) and the Scheduler Board
   (ui/board.ts boardHTML) render them in.

   It is DISPLAY order only: engine/order.ts secOrder never enters a slot key,
   SCHED.*, or an AL, so re-arranging cannot corrupt the rules (that is the whole
   design — see order.ts). One button on each surface opens this; the store's
   moveSection / applySecOrderToWeek are the write paths (histPush, no markEdit),
   so a re-arrange is one undo step and rides the day template. Mirrors
   DutyTplModal's store-subscribed shell: a hidden `.modal` when closed, the real
   sheet otherwise. */
import { DAYS } from '../engine/data'
import { secOrder, SECTIONS } from '../engine'
import { moveSection, applySecOrderToWeek, notify } from '../state/store'
import { ARRANGESEC, setArrangeSec } from './pops'
import { useVersion } from './useStore'

/* the on-screen name of each section — matches the panel headers a scheduler
   already reads on both surfaces. Keyed by the engine's section keys. */
const SEC_LABEL: Record<string, string> = {
  prog: 'Programme', waves: 'Flying waves', duty: 'Duties', sims: 'Sims', ground: 'Ground Programme',
}

export function ArrangeSections() {
  useVersion()
  if (ARRANGESEC == null) return <div className="modal" id="arrSecModal" hidden />
  const di = ARRANGESEC
  const d = DAYS[di]
  const close = () => { setArrangeSec(null); notify() }
  /* the day could have gone (a week switch under an open sheet) — fail safe */
  if (!d) { return <div className="modal" id="arrSecModal" hidden /> }
  const order = secOrder(d)

  return (
    <div className="modal" id="arrSecModal" onClick={e => { if ((e.target as HTMLElement).id === 'arrSecModal') close() }}>
      <div className="modal-box" style={{ width: 380 }}>
        <div className="modal-head"><b>Arrange sections</b><span className="arrsec-day">{d.dow} {d.dt}</span><button className="x" id="arrSecClose" onClick={close}>✕</button></div>
        <div className="modal-body">
          <div className="arrsec-hint">Move a section up or down to change the order it shows in — on Edit Schedule and the Scheduler Board alike.</div>
          <div className="arrsec-list">
            {order.map((key, i) => (
              <div className="arrsec-row" key={key} data-arrsecrow={key}>
                <span className="grip">
                  <button className="tnudge" aria-label={`Move ${SEC_LABEL[key] || key} up`} disabled={i === 0}
                    onClick={() => { if (i > 0) moveSection(di, key, -1) }}>▲</button>
                  <button className="tnudge" aria-label={`Move ${SEC_LABEL[key] || key} down`} disabled={i === order.length - 1}
                    onClick={() => { if (i < order.length - 1) moveSection(di, key, 1) }}>▼</button>
                </span>
                <span className="arrsec-name">{SEC_LABEL[key] || key}</span>
                <span className="arrsec-pos">{i + 1}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="modal-foot">
          {/* set the whole week to this day's order in one step, so the owner
              arranges once rather than day by day (store.applySecOrderToWeek). */}
          <button className="abtn" id="arrSecAll" onClick={() => applySecOrderToWeek(di)}
            title="Give every day of this week the same section order">Apply to all days</button>
          <button className="abtn primary" id="arrSecDone" onClick={close}>Done</button>
        </div>
      </div>
    </div>
  )
}

/* re-exported for the tests, so a spec can assert the sheet lists exactly the
   canonical sections without reaching into the engine module directly. */
export const ARRSEC_KEYS = SECTIONS
