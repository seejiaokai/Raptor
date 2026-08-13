/* The Duty-templates editor (owner, 13 Aug 26) — opened from the "+ Block"
   picker's pencil (TPLEDIT in pops.ts). Mirrors UserModal's shape exactly:
   a store-subscribed component that returns a hidden shell when closed, and
   the real modal otherwise. The SELECTED template is local view state, not
   schedule state — same reasoning pops.ts gives for TPLEDIT itself. */
import { useState } from 'react'
import { notify } from '../state/store'
import { DUTY_PICK } from '../engine/waves'
import {
  DUTYTPL_CFG, MAX_ROWS, addTpl, delTpl, renameTpl, addTplRow, delTplRow,
  setTplRow, moveTplRow, dutyTplSave, dutyTplReset,
} from '../engine/dutytpl'
import { TPLEDIT, setTplEdit } from './pops'
import { useVersion } from './useStore'

export function DutyTplModal() {
  useVersion()
  const [sel, setSel] = useState<string | null>(null)
  if (!TPLEDIT) return <div className="modal" id="tplModal" hidden />

  /* the selected id can go stale — a delete elsewhere, or the modal opening
     for the first time — so every render falls back to the first template
     rather than trusting the id survived */
  const tpl = DUTYTPL_CFG.find(t => t.id === sel) || DUTYTPL_CFG[0]!

  const close = () => { setTplEdit(false); notify() }
  const save = () => { dutyTplSave(); notify() }

  return (
    <div className="modal" id="tplModal" onClick={e => { if ((e.target as HTMLElement).id === 'tplModal') close() }}>
      <div className="modal-box" style={{ width: 460 }}>
        <div className="modal-head"><b>Duty templates</b><button className="x" id="tplClose" onClick={close}>✕</button></div>
        <div className="modal-body">
          <div className="tpl-tabs">
            {DUTYTPL_CFG.map(t => (
              <button key={t.id} className={'tpl-tab' + (t.id === tpl.id ? ' on' : '')}
                onClick={() => setSel(t.id)}>{t.title}</button>
            ))}
            <button className="tpl-tab new" onClick={() => {
              const t = addTpl()
              if (t) setSel(t.id)
              save()
            }}>+ New</button>
          </div>
          <input className="tpl-name" value={tpl.title} maxLength={24}
            onChange={e => { renameTpl(tpl.id, e.target.value); save() }} />
          <div className="tcols"><span></span><span>Role</span><span>Start</span><span>End</span><span></span></div>
          {tpl.rows.map((row, ri) => (
            <div className="trow" key={ri}>
              <span className="grip">
                <button className="tnudge" disabled={ri === 0}
                  onClick={() => { if (ri > 0) { moveTplRow(tpl.id, ri, ri - 1); save() } }}>▲</button>
                <button className="tnudge" disabled={ri === tpl.rows.length - 1}
                  onClick={() => { if (ri < tpl.rows.length - 1) { moveTplRow(tpl.id, ri, ri + 1); save() } }}>▼</button>
              </span>
              <input list="dutyRoles" value={row.role}
                onChange={e => { setTplRow(tpl.id, ri, 'role', e.target.value); save() }} />
              <input className="tm" value={row.str}
                onChange={e => { setTplRow(tpl.id, ri, 'str', e.target.value); save() }} />
              <input className="tm" value={row.end}
                onChange={e => { setTplRow(tpl.id, ri, 'end', e.target.value); save() }} />
              <button className="del" onClick={() => { delTplRow(tpl.id, ri); save() }}>✕</button>
            </div>
          ))}
          <datalist id="dutyRoles">
            {DUTY_PICK.map(r => <option key={r} value={r} />)}
          </datalist>
          {tpl.rows.length < MAX_ROWS &&
            <button className="addrow" onClick={() => { addTplRow(tpl.id); save() }}>+ Add role</button>}
        </div>
        <div className="modal-foot">
          <button className="abtn danger" style={{ marginRight: 'auto' }} onClick={() => {
            dutyTplReset()
            setSel(DUTYTPL_CFG[0]!.id)
            notify()
          }}>Reset to defaults</button>
          <button className="abtn danger" onClick={() => {
            delTpl(tpl.id)
            /* the library is never left empty — the last delete re-seeds one
               so a later render always has a first template to fall back to */
            if (!DUTYTPL_CFG.length) addTpl()
            setSel(DUTYTPL_CFG[0]!.id)
            save()
          }}>Delete template</button>
          <button className="abtn primary" onClick={close}>Done</button>
        </div>
      </div>
    </div>
  )
}
