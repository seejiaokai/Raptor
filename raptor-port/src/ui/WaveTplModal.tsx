/* THE FLYING-WAVES SHEET (owner, 25 Aug 26; unified 30 Aug 26 — "ugly to have the
   settings and edit buttons separate … combine them through 1 button"). One sheet
   opened by ONE button on the "+ Wave" picker (WAVEEDIT in pops.ts): it both EDITS
   the wave templates and manages what shows in the picker. The separate ⚙ Manage
   sheet (the old WaveManageSheet) is retired — its show/hide/delete list folded in
   here, so a wave is edited, shown, hidden or binned all in the one place a wave is
   added from.

   Shape, still the sibling of DutyTplModal: a store-subscribed component that
   returns a hidden shell when closed and the real modal otherwise, with the SELECTED
   template held as local view state.

   Two zones:
     • WAVE TYPES — the four built-in rule-sets (Flying / SC / AVALON / BB). They can
       be hidden from the picker (WAVEHIDE) but never edited or deleted, so SC can't
       be lost for good. An eye per row is their only control.
     • TEMPLATES — the editor proper. A KIND picker (the rule-set the placed wave
       follows, with the same one-line note the "+ Wave" popup shows), a MAIN/SPARE
       flip per line on a standby kind (inert and hidden on Flying), each line a small
       two-tier card (callsign on top, mission/times/role beneath). Each template also
       carries its own show/hide eye beside its name and a Delete in the footer, so a
       template is shown, hidden or removed from the same panel that edits it. */
import { useState, useRef } from 'react'
import { notify } from '../state/store'
import {
  WAVETPL_CFG, WAVE_BUILTIN, MAX_WLINES, kindIsStandby, kindNote,
  addWaveTpl, delWaveTpl, renameWaveTpl, setWaveTplKind, addWaveTplLine,
  delWaveTplLine, setWaveTplLine, moveWaveTplLine, waveTplSave, waveTplReset, waveTime,
  isWaveHidden, setWaveHidden,
} from '../engine/wavetpl'
import type { WaveKind } from '../engine/wavetpl'
import { hmOK } from '../engine/time'
import { canEditSched, SESSION } from '../state/auth'
import { WAVEEDIT, setWaveEdit } from './pops'
import { useVersion } from './useStore'
import { HOOKS } from '../engine/hooks'

/* inline glyphs — crisp at any size and theme-safe (stroke:currentColor), the same
   reason the board's own icons are inline SVG (moved here from WaveManageSheet). */
const EyeOn = () => <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M1.5 12S5 5 12 5s10.5 7 10.5 7S19 19 12 19 1.5 12 1.5 12Z" /><circle cx="12" cy="12" r="3.2" /></svg>
const EyeOff = () => <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9.5 5.4A10.6 10.6 0 0 1 12 5c7 0 10.5 7 10.5 7a18 18 0 0 1-3.2 4M6 7.1A17.6 17.6 0 0 0 1.5 12S5 19 12 19a10.7 10.7 0 0 0 3.4-.55" /><path d="M9.9 9.9a3.2 3.2 0 0 0 4.3 4.3" /><line x1="3" y1="3" x2="21" y2="21" /></svg>

export function WaveTplModal() {
  useVersion()
  const [sel, setSel] = useState<string | null>(null)
  const timeBuf = useRef('')
  /* GATE THE WHOLE EDITOR ON THE ROLE, not just the two admin-gated openers
     (bug hunt, 31 Aug 26 — point-2 authority sweep). The + Wave ⚙ and the Admin
     button both refuse a member, but the flag they set (WAVEEDIT) is NOT cleared
     by toggleRole's admin→member "View as member" peek, so an admin who opened
     this sheet and then flipped to member view kept a fully live template editor
     on screen — the preview lying about what a member can do, and every store
     mutator below (addWaveTpl/setWaveTplLine/delWaveTpl/waveTplReset) ungated at
     the write. Self-hiding here is the write-path gate the doctrine asks for: a
     non-admin sees the sheet as closed, exactly as a member (who can never open
     it) does. notify() on the role flip re-renders this, so the peek closes it.
     The test is `SESSION && role !== 'admin'`, NOT `!canEditSched()`, so a
     sessionless test/boot context is not mistaken for a member (the same idiom
     the archive and inputedit write-path backstops use). */
  if (!WAVEEDIT || (SESSION && SESSION.role !== 'admin')) return <div className="modal" id="waveTplModal" hidden />

  const canEdit = canEditSched()
  /* the selected id can go stale (a delete, or first open), so fall back to the
     first template every render rather than trusting it survived */
  const tpl = WAVETPL_CFG.find(t => t.id === sel) || WAVETPL_CFG[0] || null
  const close = () => { setWaveEdit(false); notify() }
  const save = () => { waveTplSave(); notify() }
  const addNew = () => { const t = addWaveTpl(); if (t) setSel(t.id); save() }
  const toggleHide = (key: string) => { if (!canEdit) return; setWaveHidden(key, !isWaveHidden(key)); save() }

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

  const tplHidden = tpl ? isWaveHidden(tpl.id) : false

  return (
    <div className="modal" id="waveTplModal" onClick={e => { if ((e.target as HTMLElement).id === 'waveTplModal') close() }}>
      <div className="modal-box" style={{ width: 480 }}>
        <div className="modal-head"><b>Flying waves</b><button className="x" id="waveTplClose" onClick={close}>✕</button></div>
        <div className="modal-body">
          {/* WAVE TYPES — show / hide the four built-in rule-sets (folded in from the
              retired Manage sheet). Hidden is one tap from coming back, right here. */}
          <div className="wtpl-types">
            <h5 className="wtpl-h">Wave types</h5>
            <p className="wtpl-hint">Show or hide what appears in <b>+ Wave</b>. Built-in types can be hidden but not deleted.</p>
            <ul className="wvmng-list">
              {WAVE_BUILTIN.map(b => {
                const hidden = isWaveHidden(b.key)
                return (
                  <li className={'wvmng-row' + (hidden ? ' off' : '')} key={b.key} data-wvrow={b.key}>
                    <span className="wvmng-name">{b.label}<span className="wvmng-sub">Built-in type</span></span>
                    <div className="wvmng-acts">
                      <button className={'wvmng-eye' + (hidden ? ' off' : '')} disabled={!canEdit} data-wveye={b.key}
                        aria-pressed={!hidden}
                        title={hidden ? 'Hidden from + Wave — tap to show' : 'Shown in + Wave — tap to hide'}
                        onClick={() => toggleHide(b.key)}>{hidden ? <EyeOff /> : <EyeOn />}<span>{hidden ? 'Hidden' : 'Shown'}</span></button>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>

          <h5 className="wtpl-h wtpl-h-tpl">Templates</h5>
          <div className="tpl-tabs">
            {WAVETPL_CFG.map(t => (
              <button key={t.id} className={'tpl-tab' + (tpl && t.id === tpl.id ? ' on' : '') + (isWaveHidden(t.id) ? ' hid' : '')}
                title={isWaveHidden(t.id) ? 'Hidden from + Wave' : undefined}
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
              {/* name + this template's own show/hide eye, side by side */}
              <div className="tpl-namerow">
                <input className="tpl-name" value={tpl.title} maxLength={24} placeholder="Template name"
                  onChange={e => { renameWaveTpl(tpl.id, e.target.value); save() }} />
                <button className={'wvmng-eye' + (tplHidden ? ' off' : '')} disabled={!canEdit} data-wveye={tpl.id}
                  aria-pressed={!tplHidden}
                  title={tplHidden ? 'Hidden from + Wave — tap to show' : 'Shown in + Wave — tap to hide'}
                  onClick={() => toggleHide(tpl.id)}>{tplHidden ? <EyeOff /> : <EyeOn />}<span>{tplHidden ? 'Hidden' : 'Shown'}</span></button>
              </div>

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
