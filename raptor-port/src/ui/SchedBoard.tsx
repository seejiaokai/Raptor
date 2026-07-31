/* The full-screen scheduler board (deep single-day editor). The shell markup
   is 1:1 with the reference; the four panels are filled by the verbatim
   builders in an effect and re-hung on every store change, and the board's
   own delegated handlers are attached to #sbBoard. */
import { useEffect, useRef } from 'react'
import { DAYS } from '../engine/data'
import { HOOKS } from '../engine/hooks'
import { SBDAY } from '../state/view'
import { notify } from '../state/store'
import { paletteHTML, paletteDay } from './palette-html'
import { sbInputsHTML } from './board-html'
import { boardHTML, boardWarnHTML, dayTabsHTML, boardMbtn, boardChange, boardArmClick, addLine, waveMenu, boardTab, closeScheduler, CXT, cxCommit, CX_QUICK, setCxt, SBWIDE, toggleWide } from './board'
import { refreshHighlights } from './highlights'
import { editingText } from './textedit'
import { useVersion } from './useStore'

/* ---- resize the pinned roster ------------------------------------------------
   On a phone the board and the roster share one screen, and how they split it
   depends on what you are doing: throwing pucks wants a tall roster, reading
   the day wants a tall board. Drag the grip; double-tap it to go back to 40%.
   Kept as a fraction of the viewport so it survives a rotation.              */
const SBSIDE_DEF = 40, SBSIDE_MIN = 14, SBSIDE_MAX = 82
let SBSIDE = SBSIDE_DEF
function sbApplySide() { document.documentElement.style.setProperty('--sbside', SBSIDE + 'vh') }

export function SchedBoard() {
  const version = useVersion()
  const boardRef = useRef<HTMLDivElement>(null)
  const rosterRef = useRef<HTMLDivElement>(null)
  const daysRef = useRef<HTMLDivElement>(null)
  const warnRef = useRef<HTMLDivElement>(null)
  const inputsRef = useRef<HTMLDivElement>(null)
  const gripRef = useRef<HTMLDivElement>(null)
  const open = SBDAY != null

  /* the grip's pointer machine, verbatim — attached once */
  useEffect(() => {
    const grip = gripRef.current!
    let drag: any = null, lastTap = 0
    const vh = () => Math.max(1, window.innerHeight) / 100
    const down = (e: PointerEvent) => {
      drag = { y: e.clientY, start: SBSIDE }
      grip.classList.add('on'); document.body.classList.add('sbresize')
      try { grip.setPointerCapture(e.pointerId) } catch (_) {}
      e.preventDefault(); e.stopPropagation()
    }
    const move = (e: PointerEvent) => {
      if (!drag) return
      /* dragging UP grows the roster, which is the direction the grip moves */
      SBSIDE = Math.min(SBSIDE_MAX, Math.max(SBSIDE_MIN, drag.start + (drag.y - e.clientY) / vh()))
      sbApplySide(); e.preventDefault(); e.stopPropagation()
    }
    const end = (e: any) => {
      if (!drag) return
      const moved = Math.abs(drag.y - (e && e.clientY != null ? e.clientY : drag.y))
      drag = null; grip.classList.remove('on'); document.body.classList.remove('sbresize')
      if (moved < 3) {                       // a tap, not a drag — double-tap resets
        const now = (window.performance && performance.now) ? performance.now() : 0
        if (now - lastTap < 420) { SBSIDE = SBSIDE_DEF; sbApplySide(); HOOKS.toast('Roster height reset') }
        lastTap = now
      }
    }
    const dbl = (e: MouseEvent) => { SBSIDE = SBSIDE_DEF; sbApplySide(); e.preventDefault() }
    grip.addEventListener('pointerdown', down)
    grip.addEventListener('pointermove', move)
    grip.addEventListener('pointerup', end)
    grip.addEventListener('pointercancel', end)
    grip.addEventListener('dblclick', dbl)
    return () => {
      grip.removeEventListener('pointerdown', down)
      grip.removeEventListener('pointermove', move)
      grip.removeEventListener('pointerup', end)
      grip.removeEventListener('pointercancel', end)
      grip.removeEventListener('dblclick', dbl)
    }
  }, [])

  /* the size is re-applied whenever the board opens (openScheduler does
     sbApplyWide();sbApplySide() in the reference) */
  useEffect(() => { if (open) sbApplySide() }, [open])

  /* the board's own handlers, attached once */
  useEffect(() => {
    const el = boardRef.current!
    el.addEventListener('click', boardMbtn)
    el.addEventListener('click', boardArmClick)
    el.addEventListener('change', boardChange)
    return () => { el.removeEventListener('click', boardMbtn); el.removeEventListener('click', boardArmClick); el.removeEventListener('change', boardChange) }
  }, [])

  /* renderScheduler: fill every panel from the verbatim builders. Each panel
     is written ONLY when its markup changed — the reference's setHTML diff
     (B54), which is also what keeps a focused field alive through an
     unrelated panel's change and keeps a board edit inside the phone
     budget. */
  const panelPrev = useRef<any>({})
  useEffect(() => {
    if (SBDAY == null) { panelPrev.current = {}; return }
    if (editingText()) return
    const di = SBDAY
    const set = (el: HTMLElement, key: string, html: string) => {
      if (panelPrev.current[key] === html) return
      el.innerHTML = html; panelPrev.current[key] = html
    }
    set(daysRef.current!, 'days', dayTabsHTML(di))
    set(boardRef.current!, 'board', boardHTML(di))
    set(warnRef.current!, 'warn', boardWarnHTML(di))
    set(rosterRef.current!, 'roster', paletteHTML(paletteDay(), { head: false }))
    set(inputsRef.current!, 'inputs', sbInputsHTML(DAYS[di], di))
    refreshHighlights()
  }, [version])

  const d = open ? DAYS[SBDAY] : null

  return (
    <div className={'schedboard' + (SBWIDE ? ' sb-wide' : '')} id="schedBoard" hidden={!open}>
      <div className="sb-top">
        <div className="sb-title"><b id="sbDay">{d ? d.dow : ''}</b> <span className="mono" id="sbDate">{d ? d.dt + (d.today ? ' · today' : '') : ''}</span> · scheduler board</div>
        <div className="sb-days" id="sbDays" ref={daysRef}
          onClick={e => { const t = (e.target as HTMLElement).closest('[data-sbtab]') as HTMLElement | null; if (t) boardTab(+t.dataset.sbtab!) }} />
        <div className="sb-actions">
          <button className={'abtn sb-widebtn' + (SBWIDE ? ' on' : '')} id="sbWide"
            title={SBWIDE ? 'Back to the stacked phone layout' : 'Show the board in its full desktop layout'}
            onClick={() => { toggleWide(); notify() }}>{SBWIDE ? '📱 Phone layout' : '🖥 Desktop layout'}</button>
          <button className="abtn" id="sbAddLine" onClick={() => { if (SBDAY != null) addLine(SBDAY) }}>+ Line</button>
          <button className="abtn" id="sbAddGo" onClick={e => { e.stopPropagation(); waveMenu(e.currentTarget as HTMLElement, SBDAY) }}>+ Wave</button>
          <button className="abtn primary" id="sbDone" onClick={() => { HOOKS.toast('Schedule updated'); closeScheduler() }}>Done</button>
          <button className="abtn ghost" id="sbClose" onClick={closeScheduler}>✕ Close</button>
        </div>
      </div>
      <div className="sb-main">
        <div className="sb-boardwrap">
          <div className="sb-board" id="sbBoard" ref={boardRef} />
          <div className="sb-inputs" id="sbInputs" ref={inputsRef} />
        </div>
        <div className="sb-side" id="sbSide">
          <div className="sb-grip" id="sbGrip" ref={gripRef} title="Drag to resize · double-tap to reset"><span></span></div>
          <div className="sb-warn" id="sbWarn" ref={warnRef} />
          <div className="sb-roster" id="sbRoster" ref={rosterRef} />
        </div>
      </div>
    </div>
  )
}

/* the CX-with-a-reason dialog */
export function CxDialog() {
  useVersion()
  const inRef = useRef<HTMLInputElement>(null)
  const open = CXT != null
  const on = open && !!CXT.o.cx
  const what = open ? (CXT.label || 'this line') : ''
  useEffect(() => { if (open && inRef.current) { inRef.current.value = (CXT.o.cxr || ''); inRef.current.focus() } }, [open])
  const close = () => { setCxt(null); notify() }
  return (
    <div className="airpop" id="cxPop" hidden={!open}
      onClick={e => { if ((e.target as HTMLElement).id === 'cxPop') close() }}>
      <div className="airpop-box cxbox">
        <div className="airpop-head"><b id="cxTitle">{on ? (what.charAt(0).toUpperCase() + what.slice(1)) + ' is cancelled — reason' : 'Cancel ' + what}</b><button className="x" id="cxClose" aria-label="Close" onClick={close}>✕</button></div>
        <div className="cxbody">
          <label className="cxlead" htmlFor="cxReason">CX DUE</label>
          <input id="cxReason" ref={inRef} placeholder="WX / U-S AIRCRAFT / CREW SICK…" autoComplete="off" aria-label="Reason for cancellation"
            onKeyDown={e => { if (e.key === 'Enter') cxCommit(true, (e.target as HTMLInputElement).value); if (e.key === 'Escape') close() }} />
          <div className="cxhint">Reads <b>CX DUE &lt;reason&gt;</b> on the line. Leave it blank for a plain CX.</div>
          <div className="cxquick" id="cxQuick">
            {CX_QUICK.map(q => <button key={q} type="button" data-cxq={q} onClick={() => { if (inRef.current) inRef.current.value = q }}>{q}</button>)}
          </div>
        </div>
        <div className="airpop-foot">
          <button className="abtn danger" id="cxUn" hidden={!on} onClick={() => cxCommit(false, '')}>Un-cancel</button>
          <span style={{ flex: 1 }}></span>
          <button className="abtn primary" id="cxSave" onClick={() => cxCommit(true, inRef.current ? inRef.current.value : '')}>{on ? 'Save reason' : 'Cancel line'}</button>
        </div>
      </div>
    </div>
  )
}
