/* THE WAVE MANAGE SHEET (owner, 29 Aug 26 pt.3 — "make flying wave templates more
   intuitive with the functions to hide/delete and remove it in admin"). Managing a
   wave's VISIBILITY now happens where a wave is added — the + Wave menu opens this —
   instead of on a separate Admin screen, and a hidden wave is one tap from coming
   back, right where its absence is noticed (the "N hidden · Manage" line in the
   picker). It lists every built-in kind and every saved template:
     • an EYE toggles show/hide (engine WAVEHIDE — setWaveHidden + waveTplSave), the
       same flag the picker filters on (shownBuiltins / shownTemplates);
     • a TRASH deletes a SAVED TEMPLATE (delWaveTpl), behind a "can't be undone"
       confirm. Built-in kinds (Flying wave / SC / AVALON / BB) can be hidden but
       NEVER deleted, so SC can't be lost for good.
   Admin-only at the write, like the + Wave menu itself (canEditSched === admin), so
   this is the same gate the retired Admin list had — no permission widened.
   Store-subscribed modal shell like DutyTplModal / WaveTplModal: a hidden `.modal`
   when closed (WAVEMANAGE null), the real sheet otherwise. */
import { useState } from 'react'
import { WAVE_BUILTIN, WAVETPL_CFG, isWaveHidden, setWaveHidden, waveTplSave, delWaveTpl, kindLabel } from '../engine/wavetpl'
import { HOOKS } from '../engine/hooks'
import { notify } from '../state/store'
import { canEditSched } from '../state/auth'
import { WAVEMANAGE, setWaveManage } from './pops'
import { useVersion } from './useStore'

/* small inline glyphs — crisp at any size and theme-safe (stroke:currentColor),
   the same reason the board's own icons are inline SVG. */
const EyeOn = () => <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M1.5 12S5 5 12 5s10.5 7 10.5 7S19 19 12 19 1.5 12 1.5 12Z" /><circle cx="12" cy="12" r="3.2" /></svg>
const EyeOff = () => <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9.5 5.4A10.6 10.6 0 0 1 12 5c7 0 10.5 7 10.5 7a18 18 0 0 1-3.2 4M6 7.1A17.6 17.6 0 0 0 1.5 12S5 19 12 19a10.7 10.7 0 0 0 3.4-.55" /><path d="M9.9 9.9a3.2 3.2 0 0 0 4.3 4.3" /><line x1="3" y1="3" x2="21" y2="21" /></svg>
const Trash = () => <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 6h17M9 6V4.2A1.2 1.2 0 0 1 10.2 3h3.6A1.2 1.2 0 0 1 15 4.2V6M6.5 6l1 13.2a1.5 1.5 0 0 0 1.5 1.4h6a1.5 1.5 0 0 0 1.5-1.4L18 6" /></svg>

export function WaveManageSheet() {
  useVersion()
  /* which template id is mid-delete-confirm — inline on its own row, not a second
     modal, so the list stays put behind the question */
  const [confirm, setConfirm] = useState<string | null>(null)
  if (!WAVEMANAGE) return <div className="modal" id="wvMngModal" hidden />
  const close = () => { setWaveManage(false); setConfirm(null); notify() }
  const canEdit = canEditSched()
  const items = [
    ...WAVE_BUILTIN.map(b => ({ key: b.key as string, label: b.label, sub: 'Built-in type', tpl: false })),
    ...WAVETPL_CFG.map(t => ({ key: t.id, label: t.title || 'Untitled', sub: `Template · ${kindLabel(t.kind)}`, tpl: true })),
  ]
  const toggle = (key: string) => { if (!canEdit) return; setWaveHidden(key, !isWaveHidden(key)); waveTplSave(); notify() }
  const del = (id: string, title: string) => { delWaveTpl(id); waveTplSave(); setConfirm(null); notify(); HOOKS.toast(`"${title}" deleted`, 'ok') }
  return (
    <div className="modal wvmng" id="wvMngModal" onClick={e => { if ((e.target as HTMLElement).id === 'wvMngModal') close() }}>
      <div className="modal-box">
        <div className="modal-head"><b>Manage waves</b><button className="x" id="wvMngClose" aria-label="Close" onClick={close}>✕</button></div>
        <div className="modal-body">
          <div className="wvmng-intro">Show, hide or delete what appears in <b>+ Wave</b>. Hiding just tucks a wave away — bring it back here anytime. Built-in types can be hidden but not deleted.</div>
          <ul className="wvmng-list" id="wvMngList">
            {items.map(it => {
              const hidden = isWaveHidden(it.key)
              if (it.tpl && confirm === it.key) return (
                <li className="wvmng-row confirm" key={it.key} data-wvrow={it.key}>
                  <div className="wvmng-cmsg">Delete <b>{it.label}</b>? <span>This can’t be undone.</span></div>
                  <div className="wvmng-cacts">
                    <button className="abtn sm ghost" onClick={() => setConfirm(null)}>Cancel</button>
                    <button className="abtn sm danger" onClick={() => del(it.key, it.label)}>Delete</button>
                  </div>
                </li>
              )
              return (
                <li className={'wvmng-row' + (hidden ? ' off' : '')} key={it.key} data-wvrow={it.key}>
                  <span className="wvmng-name">{it.label}<span className="wvmng-sub">{it.sub}</span></span>
                  <div className="wvmng-acts">
                    <button className={'wvmng-eye' + (hidden ? ' off' : '')} disabled={!canEdit} data-wveye={it.key}
                      aria-pressed={!hidden}
                      title={hidden ? 'Hidden from + Wave — tap to show' : 'Shown in + Wave — tap to hide'}
                      onClick={() => toggle(it.key)}>{hidden ? <EyeOff /> : <EyeOn />}<span>{hidden ? 'Hidden' : 'Shown'}</span></button>
                    {it.tpl && <button className="wvmng-trash" disabled={!canEdit} data-wvtrash={it.key}
                      aria-label={`Delete ${it.label}`} title="Delete this template" onClick={() => setConfirm(it.key)}><Trash /></button>}
                  </div>
                </li>
              )
            })}
            {items.length === 0 && <li className="wvmng-empty">No waves to manage.</li>}
          </ul>
        </div>
        <div className="modal-foot"><button className="abtn primary" id="wvMngDone" onClick={close}>Done</button></div>
      </div>
    </div>
  )
}
