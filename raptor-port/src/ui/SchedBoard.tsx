/* The full-screen scheduler board (deep single-day editor). The shell markup
   is 1:1 with the reference; the four panels are filled by the verbatim
   builders in an effect and re-hung on every store change, and the board's
   own delegated handlers are attached to #sbBoard. */
import { useEffect, useRef } from 'react'
import { DAYS } from '../engine/data'
import { HOOKS } from '../engine/hooks'
import { SBDAY, CURPAGE, DPREV, setDayPreview } from '../state/view'
import { daySnapOf, dayVersions, verLabel, alColor } from '../engine/publish'
import { withDaySnap } from './html'
import { notify } from '../state/store'
import { paletteHTML, paletteDay } from './palette-html'
import { sbInputsHTML } from './board-html'
import { boardHTML, boardWarnHTML, dayTabsHTML, boardMbtn, boardChange, boardArmClick, addLine, waveMenu, boardTab, closeScheduler, CXT, cxCommit, CX_QUICK, setCxt, SBWIDE, toggleWide, SORTALL, askSortAll, cancelSortAll, sortAllCommit } from './board'
import { refreshHighlights } from './highlights'
import { wireRowDrag } from './rowdrag'
import { editingText } from './textedit'
import { useVersion } from './useStore'

export function SchedBoard() {
  const version = useVersion()
  const boardRef = useRef<HTMLDivElement>(null)
  const rosterRef = useRef<HTMLDivElement>(null)
  const daysRef = useRef<HTMLDivElement>(null)
  const warnRef = useRef<HTMLDivElement>(null)
  const inputsRef = useRef<HTMLDivElement>(null)
  /* The board's only home page is Edit Schedule — `open` used to be a bare
     `SBDAY != null`, so a nav click while the board was open left the
     modal (position:fixed, inset:0, z-index:400 — the whole viewport)
     fully mounted and painted on top of whatever page the user actually
     navigated to, covering its own nav and edit toggle in the process
     (HANDOFF.md, "board stays open across a page change"). This render
     gate is now belt-and-braces, not the only thing standing between a
     page change and a live board: state/view.ts's setPage clears SBDAY
     itself the moment the page leaves 'editsched' — the "leave SBDAY alone,
     the render gate alone is enough" choice this comment used to describe
     is GONE (reviewer-found blocker, 9 Aug 26): a document-level handler
     elsewhere (Shell.tsx's right-click clear-a-seat) trusted SBDAY!=null on
     its own as proof the board was safely open, which stopped being true
     the instant the render here stopped painting it but the state kept
     living — on View-only Sched with a board left open, a real right-click
     on the now-visible WEEK underneath cleared a seat straight through that
     escape hatch. SBDAY is cleared, full stop, not merely hidden — landing
     back on Edit Schedule does NOT resume a day; a scheduler opens one
     again, the same as any other visit. */
  const open = SBDAY != null && CURPAGE === 'editsched'

  /* the board's own handlers, attached once */
  useEffect(() => {
    const el = boardRef.current!
    el.addEventListener('click', boardMbtn)
    el.addEventListener('click', boardArmClick)
    el.addEventListener('change', boardChange)
    const offDrag = wireRowDrag(el)
    return () => {
      el.removeEventListener('click', boardMbtn); el.removeEventListener('click', boardArmClick)
      el.removeEventListener('change', boardChange); offDrag()
    }
  }, [])

  /* renderScheduler: fill every panel from the verbatim builders. Each panel
     is written ONLY when its markup changed — the reference's setHTML diff
     (B54), which is also what keeps a focused field alive through an
     unrelated panel's change and keeps a board edit inside the phone
     budget. */
  const panelPrev = useRef<any>({})
  useEffect(() => {
    /* Still keyed on a bare `SBDAY == null`, not `!open` (considered and
       reverted, 9 Aug 26 — reviewer had asked for `!open` here as a
       "wasted work only" cleanup, since a board left open on the wrong
       page used to rebuild all four panels into a hidden subtree on every
       repaint). Two things changed that call once setPage (above) clears
       SBDAY itself the moment the page leaves 'editsched': first, the
       wasted work the request was about no longer happens on any path a
       real user can reach — SBDAY IS null on every other page now, so this
       guard already skips the rebuild the ordinary way. Second, and why
       `!open` was reverted rather than kept as extra safety: `SBDAY != null`
       with CURPAGE not yet 'editsched' is now a TEST-ONLY state (`
       window.openScheduler`/`window.setPage` called directly, the
       deliberate pattern this whole suite uses to test a render/role gate
       in isolation without a click path — warnjump.test.tsx, board-
       stores.test.tsx's duty-crew test, the squadron-member e2e test, and
       others), and `!open` made the panels never render AT ALL in that
       state — which does not test the gate, it just makes every assertion
       about what the gate withholds vacuously true, the exact "proves
       nothing" trap this codebase's own comments warn about elsewhere
       (interactions.ts, the squadron-member e2e test). Reverted rather than
       patched further: the performance concern is real but already answered
       by the setPage fix above, and this guard's ONE job is deciding
       whether the panels have a day to render, which SBDAY alone answers
       correctly. */
    if (SBDAY == null) { panelPrev.current = {}; return }
    if (editingText()) return
    const di = SBDAY
    const set = (el: HTMLElement, key: string, html: string) => {
      if (panelPrev.current[key] === html) return
      el.innerHTML = html; panelPrev.current[key] = html
    }
    set(daysRef.current!, 'days', dayTabsHTML(di))
    /* same lazy orphan prune as the edit week */
    if (DPREV.has(di) && !daySnapOf(di, DPREV.get(di))) DPREV.delete(di)
    if (DPREV.has(di)) {
      const ver = DPREV.get(di)
      withDaySnap(di, ver, () => {
        set(boardRef.current!, 'board', '<div class="pv-frozen">' + boardHTML(di, true) + '</div>')
        set(inputsRef.current!, 'inputs', sbInputsHTML(DAYS[di], di))
      })
      /* the live-checks panel becomes the preview banner — a past version is
         never validated, so live warnings against it would be nonsense */
      set(warnRef.current!, 'warn',
        `<div class="dprev-bar"${ver !== 'orig' ? ` style="--alc:${alColor(+ver)}"` : ''}>Viewing <b>${verLabel(ver)}</b> as issued — read-only`
        + `<button class="dbeak dprev-restore" data-restore="${di}" data-rver="${ver}" title="Make this version the live schedule now — later ALs stay available in the dropdown">Restore this version</button></div>`)
    } else {
      set(boardRef.current!, 'board', boardHTML(di))
      set(warnRef.current!, 'warn', boardWarnHTML(di))
      set(inputsRef.current!, 'inputs', sbInputsHTML(DAYS[di], di))
    }
    set(rosterRef.current!, 'roster', paletteHTML(paletteDay(), { head: false }))
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
          {open && dayVersions(SBDAY).length > 1
            ? <select className="dver" aria-label="View this day as it was issued"
                value={String(DPREV.get(SBDAY) ?? 'live')}
                onChange={e => { const v = e.target.value; setDayPreview(SBDAY, v === 'live' ? null : (v === 'orig' ? 'orig' : +v)); notify() }}>
                {dayVersions(SBDAY).map((v: any) => <option key={String(v)} value={String(v)}>{verLabel(v)}</option>)}
              </select>
            : null}
          {/* Sort all — every section on this day at once, not one row like
              every other control here. Gated on HOOKS.editMode() — the same
              flag the grip, the nudge buttons and every per-section ⇅ Auto
              sort already gate on, not the bare role check (review fix, 9
              Aug 26: canEditSched() alone left this button live and enabled
              on a read-only board — an admin who has navigated to View
              sched but still has the board open, per finding #1 — while
              every sibling control on the same row correctly disappeared).
              editMode() is re-checked inside askSortAll and sortAllCommit
              too, so a stale button left over from a role OR page change
              can't open the dialog or act either. Disabled (not hidden)
              while previewing a frozen published version, same idiom as
              +Line/+Wave above. */}
          {open && HOOKS.editMode() && <button className="abtn" id="sbSortAll" disabled={DPREV.has(SBDAY)}
            title="Reorder every section on this day back into its own reading order — one confirm, one undo step"
            onClick={() => { if (SBDAY != null) askSortAll(SBDAY) }}>⇅ Sort all</button>}
          <button className="abtn" id="sbAddLine" disabled={open && DPREV.has(SBDAY)} onClick={() => { if (SBDAY != null) addLine(SBDAY) }}>+ Line</button>
          <button className="abtn" id="sbAddGo" disabled={open && DPREV.has(SBDAY)} onClick={e => { e.stopPropagation(); waveMenu(e.currentTarget as HTMLElement, SBDAY) }}>+ Wave</button>
          <button className="abtn primary" id="sbDone" onClick={() => { HOOKS.toast('Schedule updated'); closeScheduler() }}>Done</button>
          <button className="abtn ghost" id="sbClose" onClick={closeScheduler}>✕ Close</button>
        </div>
      </div>
      <div className="sb-main">
        <div className="sb-boardwrap">
          <div className="sb-board" id="sbBoard" ref={boardRef} />
          <div className="sb-inputs" id="sbInputs" ref={inputsRef} />
        </div>
        {/* ONE WINDOW ON A PHONE (owner, from the deployed site, 8 Aug 26 —
            comp approved before build). The old phone board was three stacked
            zones: panels, a bottom-pinned Live-checks + roster sheet, and a
            drag-grip splitting them. Now the phone matches the edit week:
            .sb-side dissolves (display:contents), the warnings ride at the
            TOP of the one scroller (order:-1), and the roster parks in a
            right-edge AIRCREW drawer — .eroster so the week's tab styling,
            its accent flip and interactions.ts's delegated .ros-tab toggle
            all apply verbatim, and armSlot's isPhone() ros-open means
            tapping any slot slides it open, exactly like the week. The
            desktop column and .sb-wide are unchanged (both restate). */}
        <div className="sb-side" id="sbSide">
          <div className="sb-warn" id="sbWarn" ref={warnRef} />
          <aside className="sb-ros eroster">
            <div className="ros-tab" title="Aircrew palette"><b>AIRCREW</b></div>
            <div className="ros-body">
              <div className="sb-roster" id="sbRoster" ref={rosterRef} />
            </div>
          </aside>
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

/* Sort all's confirmation — same board-level modal shape as CxDialog above,
   because this is the precedent the brief points at rather than a browser
   confirm(): the day it names is read straight off SORTALL (the index
   askSortAll armed), so the prompt can never say the wrong day even if the
   board has since switched tabs underneath it. */
export function SortAllDialog() {
  useVersion()
  const di = SORTALL
  const open = di != null
  const d = open ? DAYS[di] : null
  const close = () => cancelSortAll()
  return (
    <div className="airpop" id="sortAllPop" hidden={!open}
      onClick={e => { if ((e.target as HTMLElement).id === 'sortAllPop') close() }}>
      <div className="airpop-box">
        <div className="airpop-head"><b id="sortAllTitle">Sort all — {d ? d.dow : ''}</b><button className="x" id="sortAllClose" aria-label="Close" onClick={close}>✕</button></div>
        <div className="airpop-body">
          Every section on {d ? d.dow : 'this day'} — flying, duties, sims, ground and the
          overall programme — goes back into its own reading order. Unlike every other
          control on this board, this acts on the WHOLE day at once, not one row; a
          single Undo reverses all of it together.
        </div>
        <div className="airpop-foot">
          <span style={{ flex: 1 }}></span>
          <button className="abtn ghost" id="sortAllCancel" onClick={close}>Cancel</button>
          <button className="abtn primary" id="sortAllConfirm" onClick={() => sortAllCommit()}>Sort all</button>
        </div>
      </div>
    </div>
  )
}
