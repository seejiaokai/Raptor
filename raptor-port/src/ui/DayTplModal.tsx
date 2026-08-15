/* The Day-templates manage modal (owner, 15 Aug 26) — opened from the
   day-templates picker's pencil, on either entry point. Mirrors DutyTplModal's
   shape (a store-subscribed component, hidden shell when closed, SELECTED
   template as local view state), with two deliberate differences:
     - no "+ New" tab — a day template is always RECAPTURED off a real day
       (tplFromDay, via the picker's "Save this day as a template"), never
       started blank the way a duty template is, so there is nothing for a
       blank-add button here to create.
     - no row editor — a duty template's rows are hand-typed because that IS
       the whole template; a day template's content is a whole day's worth of
       waves, duties, sims and ground rows, which already has its own editor
       (the board / edit week themselves). Re-editing that content here would
       be a second, narrower copy of surfaces that already exist, so this
       modal only manages the LIBRARY entries — title and lifecycle — and
       shows a read-only summary of what each one holds. */
import { useEffect, useState } from 'react'
import { notify } from '../state/store'
import {
  DAYTPL_CFG, renameDayTpl, delDayTpl, dayTplSave, dayTplReset, dayTplSummary,
} from '../engine/daytpl'
import { DAYTPLEDIT, setDayTplEdit } from './pops'
import { useVersion } from './useStore'

export function DayTplModal() {
  useVersion()
  const [sel, setSel] = useState<string | null>(null)
  /* opened pre-targeted at a specific id (straight off "Save this day as a
     template") seeds the local selection once, the same tick the flag itself
     changes — hooks run every render regardless of the early return below,
     so this stays before it. */
  useEffect(() => {
    if (typeof DAYTPLEDIT === 'string') setSel(DAYTPLEDIT)
  }, [DAYTPLEDIT])
  if (!DAYTPLEDIT) return <div className="modal" id="daytplModal" hidden />

  /* the selected id can go stale — a delete elsewhere, the modal opening for
     the first time, or a library that has nothing in it at all yet */
  const tpl = DAYTPL_CFG.find(t => t.id === sel) || DAYTPL_CFG[0] || null

  const close = () => { setDayTplEdit(false); notify() }
  const save = () => { dayTplSave(); notify() }

  return (
    <div className="modal" id="daytplModal" onClick={e => { if ((e.target as HTMLElement).id === 'daytplModal') close() }}>
      <div className="modal-box" style={{ width: 460 }}>
        <div className="modal-head"><b>Day templates</b><button className="x" id="daytplClose" onClick={close}>✕</button></div>
        <div className="modal-body">
          {DAYTPL_CFG.length
            ? <>
                <div className="tpl-tabs">
                  {DAYTPL_CFG.map(t => (
                    <button key={t.id} className={'tpl-tab' + (t.id === tpl!.id ? ' on' : '')}
                      onClick={() => setSel(t.id)}>{t.title}</button>
                  ))}
                </div>
                <input className="tpl-name" value={tpl!.title} maxLength={24}
                  aria-label="Template name"
                  onChange={e => { renameDayTpl(tpl!.id, e.target.value); save() }} />
                <div className="wm-note" style={{ padding: '6px 0' }}>{dayTplSummary(tpl!)}</div>
              </>
            : <div className="sb-empty" style={{ padding: '14px 0' }}>
                No day templates saved yet — open a day's "Templates" menu and choose
                "Save this day as a template" to start the library.
              </div>}
        </div>
        <div className="modal-foot">
          <button className="abtn danger" style={{ marginRight: 'auto' }} disabled={!DAYTPL_CFG.length} onClick={() => {
            dayTplReset()
            setSel(null)
            notify()
          }}>Reset — delete all</button>
          <button className="abtn danger" disabled={!tpl} onClick={() => {
            if (!tpl) return
            delDayTpl(tpl.id)
            setSel(DAYTPL_CFG[0] ? DAYTPL_CFG[0].id : null)
            save()
          }}>Delete template</button>
          <button className="abtn primary" onClick={close}>Done</button>
        </div>
      </div>
    </div>
  )
}
