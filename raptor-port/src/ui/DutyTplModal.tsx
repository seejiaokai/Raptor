/* The Duty-templates editor (owner, 13 Aug 26) — opened from the "+ Block"
   picker's pencil (TPLEDIT in pops.ts). Mirrors UserModal's shape exactly:
   a store-subscribed component that returns a hidden shell when closed, and
   the real modal otherwise. The SELECTED template is local view state, not
   schedule state — same reasoning pops.ts gives for TPLEDIT itself. */
import { useState, useRef } from 'react'
import { notify } from '../state/store'
import { DUTY_PICK } from '../engine/waves'
import {
  DUTYTPL_CFG, MAX_ROWS, addTpl, delTpl, renameTpl, addTplRow, delTplRow,
  setTplRow, moveTplRow, dutyTplSave, dutyTplReset, tplTime,
} from '../engine/dutytpl'
import { hmOK } from '../engine/time'
import { TPLEDIT, setTplEdit } from './pops'
import { useVersion } from './useStore'
import { HOOKS } from '../engine/hooks'

export function DutyTplModal() {
  useVersion()
  const [sel, setSel] = useState<string | null>(null)
  /* the value a time cell held when it was focused, so a rejected commit can
     put it back rather than clear it (only one cell is focused at a time) */
  const timeBuf = useRef('')
  if (!TPLEDIT) return <div className="modal" id="tplModal" hidden />

  /* the selected id can go stale — a delete elsewhere, or the modal opening
     for the first time — so every render falls back to the first template
     rather than trusting the id survived */
  const tpl = DUTYTPL_CFG.find(t => t.id === sel) || DUTYTPL_CFG[0]!

  const close = () => { setTplEdit(false); notify() }
  const save = () => { dutyTplSave(); notify() }

  /* A time cell takes a clock time or nothing, the same rule txtSet enforces on
     the schedule (owner, 16 Aug 26 — "no guard rails on duty templates
     timings"). Validated on COMMIT (blur), not per keystroke: onChange writes
     the raw value so the controlled input reflects typing, and this refuses a
     malformed one only once the field is left — a toast on a rejected commit,
     never on a keystroke (the audit's §5 line the rest of this modal holds).
     A bad value reverts to what the cell held on focus; a good one normalises
     0700 → 07:00. */
  const commitTime = (id: string, ri: number, field: 'str' | 'end', raw: string) => {
    const v = raw.trim()
    if (v && !hmOK(v)) {
      HOOKS.toast(`${v} is not a time — try 0900 or 09:00`, 'warn')
      setTplRow(id, ri, field, timeBuf.current)
    } else {
      setTplRow(id, ri, field, tplTime(v))
    }
    save()
  }

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
              <input className="tm" value={row.str} inputMode="numeric" placeholder="0700"
                onFocus={e => { timeBuf.current = e.target.value }}
                onChange={e => { setTplRow(tpl.id, ri, 'str', e.target.value); save() }}
                onBlur={e => commitTime(tpl.id, ri, 'str', e.target.value)} />
              <input className="tm" value={row.end} inputMode="numeric" placeholder="1300"
                onFocus={e => { timeBuf.current = e.target.value }}
                onChange={e => { setTplRow(tpl.id, ri, 'end', e.target.value); save() }}
                onBlur={e => commitTime(tpl.id, ri, 'end', e.target.value)} />
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
          {/* the two DESTRUCTIVE actions on this modal toast (owner audit — this
             whole editor had zero); the per-row edits above stay silent on
             purpose, the same line the rest of the app draws (§5 of the audit:
             don't toast a keystroke) */}
          <button className="abtn danger" style={{ marginRight: 'auto' }} onClick={() => {
            dutyTplReset()
            setSel(DUTYTPL_CFG[0]!.id)
            notify()
            HOOKS.toast('Duty templates reset to defaults', 'ok')
          }}>Reset to defaults</button>
          <button className="abtn danger" onClick={() => {
            const title = tpl.title || 'Untitled'
            delTpl(tpl.id)
            /* the library is never left empty — the last delete re-seeds one
               so a later render always has a first template to fall back to */
            if (!DUTYTPL_CFG.length) addTpl()
            setSel(DUTYTPL_CFG[0]!.id)
            save()
            HOOKS.toast(`"${title}" template deleted`, 'ok')
          }}>Delete template</button>
          <button className="abtn primary" onClick={close}>Done</button>
        </div>
      </div>
    </div>
  )
}
