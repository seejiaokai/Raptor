/* The Flying-wave-templates editor (owner, 25 Aug 26) — opened from the "+ Wave"
   picker's pencil (WAVEEDIT in pops.ts), the sibling of DutyTplModal. Same shape:
   a store-subscribed component that returns a hidden shell when closed and the
   real modal otherwise, with the SELECTED template held as local view state.

   Two things the duty editor does not have. A KIND picker — the rule-set the placed
   wave follows (Flying / SC / AVALON / BB), with the same one-line note the "+ Wave"
   popup shows — and, on a standby kind, a MAIN/SPARE flip per line (it is inert and
   hidden on Flying, where every line is a plain MAIN). A wave line also carries more
   fields than a duty row, too many for one phone row, so each line is a small
   two-tier card: callsign on top, mission/times/role beneath. */
import { useState, useRef } from 'react'
import { notify } from '../state/store'
import {
  WAVETPL_CFG, WAVE_BUILTIN, MAX_WLINES, kindIsStandby, kindNote,
  addWaveTpl, delWaveTpl, renameWaveTpl, setWaveTplKind, addWaveTplLine,
  delWaveTplLine, setWaveTplLine, moveWaveTplLine, waveTplSave, waveTplReset, waveTime,
} from '../engine/wavetpl'
import type { WaveKind } from '../engine/wavetpl'
import { hmOK } from '../engine/time'
import { WAVEEDIT, setWaveEdit } from './pops'
import { useVersion } from './useStore'
import { HOOKS } from '../engine/hooks'

export function WaveTplModal() {
  useVersion()
  const [sel, setSel] = useState<string | null>(null)
  const timeBuf = useRef('')
  if (!WAVEEDIT) return <div className="modal" id="waveTplModal" hidden />

  /* the selected id can go stale (a delete, or first open), so fall back to the
     first template every render rather than trusting it survived */
  const tpl = WAVETPL_CFG.find(t => t.id === sel) || WAVETPL_CFG[0] || null
  const close = () => { setWaveEdit(false); notify() }
  const save = () => { waveTplSave(); notify() }
  const addNew = () => { const t = addWaveTpl(); if (t) setSel(t.id); save() }

  /* a time cell takes a clock time or nothing, validated on COMMIT (blur), the
     same rule the duty editor and the schedule cells enforce: onChange writes raw
     so typing shows, blur refuses a malformed value with a toast and reverts to
     what the cell held on focus, and normalises a good one (0700 → 07:00). */
  const commitTime = (id: string, li: number, field: 'to' | 'ld', raw: string) => {
    const v = raw.trim()
    if (v && !hmOK(v)) {
      HOOKS.toast(`${v} is not a time — try 0900 or 09:00`, 'warn')
      setWaveTplLine(id, li, field, timeBuf.current)
    } else {
      setWaveTplLine(id, li, field, waveTime(v))
    }
    save()
  }

  return (
    <div className="modal" id="waveTplModal" onClick={e => { if ((e.target as HTMLElement).id === 'waveTplModal') close() }}>
      <div className="modal-box" style={{ width: 480 }}>
        <div className="modal-head"><b>Flying-wave templates</b><button className="x" id="waveTplClose" onClick={close}>✕</button></div>
        <div className="modal-body">
          <div className="tpl-tabs">
            {WAVETPL_CFG.map(t => (
              <button key={t.id} className={'tpl-tab' + (tpl && t.id === tpl.id ? ' on' : '')}
                onClick={() => setSel(t.id)}>{t.title || 'Untitled'}</button>
            ))}
            <button className="tpl-tab new" onClick={addNew}>+ New</button>
          </div>

          {!tpl ? (
            <div className="wtpl-empty">
              <p>No wave templates yet.</p>
              <p className="sub">Build a wave you set up often — a package of flying lines, or a standby shift — save it here, and it appears in <b>+ Wave</b> to drop onto any day in one tap.</p>
              <button className="abtn primary" onClick={addNew}>+ New wave template</button>
            </div>
          ) : (
            <>
              <input className="tpl-name" value={tpl.title} maxLength={24} placeholder="Template name"
                onChange={e => { renameWaveTpl(tpl.id, e.target.value); save() }} />

              <div className="wkind" role="group" aria-label="Rule-set">
                {WAVE_BUILTIN.map(b => (
                  <button key={b.key} className={'wkind-btn' + (tpl.kind === b.key ? ' on' : '')}
                    onClick={() => { setWaveTplKind(tpl.id, b.key as WaveKind); save() }}>{b.label}</button>
                ))}
              </div>
              <p className="wknote">{kindNote(tpl.kind)}</p>

              {tpl.lines.map((l, li) => (
                <div className="wline" key={li}>
                  <div className="wline-top">
                    <span className="grip">
                      <button className="tnudge" disabled={li === 0}
                        onClick={() => { if (li > 0) { moveWaveTplLine(tpl.id, li, li - 1); save() } }}>▲</button>
                      <button className="tnudge" disabled={li === tpl.lines.length - 1}
                        onClick={() => { if (li < tpl.lines.length - 1) { moveWaveTplLine(tpl.id, li, li + 1); save() } }}>▼</button>
                    </span>
                    <input className="wcs" value={l.cs} maxLength={12} placeholder="Callsign"
                      onChange={e => { setWaveTplLine(tpl.id, li, 'cs', e.target.value); save() }} />
                    <button className="del" title="Remove this line"
                      onClick={() => { delWaveTplLine(tpl.id, li); save() }}>✕</button>
                  </div>
                  <div className="wline-grid">
                    <input className="wmsn" value={l.msn} maxLength={24} placeholder="Mission"
                      onChange={e => { setWaveTplLine(tpl.id, li, 'msn', e.target.value); save() }} />
                    <input className="tm" value={l.to} inputMode="numeric" placeholder="T/O"
                      onFocus={e => { timeBuf.current = e.target.value }}
                      onChange={e => { setWaveTplLine(tpl.id, li, 'to', e.target.value); save() }}
                      onBlur={e => commitTime(tpl.id, li, 'to', e.target.value)} />
                    <input className="tm" value={l.ld} inputMode="numeric" placeholder="LD"
                      onFocus={e => { timeBuf.current = e.target.value }}
                      onChange={e => { setWaveTplLine(tpl.id, li, 'ld', e.target.value); save() }}
                      onBlur={e => commitTime(tpl.id, li, 'ld', e.target.value)} />
                    {kindIsStandby(tpl.kind)
                      ? <button className={'wrole' + (l.spare ? ' spare' : '')}
                          title="Switch this line between MAIN and SPARE"
                          onClick={() => { setWaveTplLine(tpl.id, li, 'spare', !l.spare); save() }}>{l.spare ? 'SPARE' : 'MAIN'}</button>
                      : <span className="wrole-off" aria-hidden="true" />}
                  </div>
                </div>
              ))}
              {tpl.lines.length < MAX_WLINES &&
                <button className="addrow" onClick={() => { addWaveTplLine(tpl.id); save() }}>+ Add line</button>}
            </>
          )}
        </div>
        <div className="modal-foot">
          <button className="abtn danger" style={{ marginRight: 'auto' }} onClick={() => {
            waveTplReset()
            setSel(null)
            notify()
            HOOKS.toast('Wave templates cleared', 'ok')
          }}>Clear all</button>
          {tpl &&
            <button className="abtn danger" onClick={() => {
              const title = tpl.title || 'Untitled'
              delWaveTpl(tpl.id)
              setSel(WAVETPL_CFG[0]?.id || null)
              save()
              HOOKS.toast(`"${title}" template deleted`, 'ok')
            }}>Delete template</button>}
          <button className="abtn primary" onClick={close}>Done</button>
        </div>
      </div>
    </div>
  )
}
