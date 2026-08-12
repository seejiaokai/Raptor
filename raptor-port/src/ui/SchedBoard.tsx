/* The full-screen scheduler board (deep single-day editor). The shell markup
   is 1:1 with the reference; the four panels are filled by the verbatim
   builders in an effect and re-hung on every store change, and the board's
   own delegated handlers are attached to #sbBoard. */
import { useEffect, useRef } from 'react'
import { DAYS } from '../engine/data'
import { HOOKS } from '../engine/hooks'
import { SBDAY, CURPAGE, DPREV, setDayPreview, HISTMODE, toggleHistMode } from '../state/view'
import { closeHistList } from './pops'
import { wireHistBubble, hideHistBub } from './histbubble'
import { daySnapOf, dayVersions, verLabel, alColor } from '../engine/publish'
import { withDaySnap } from './html'
import { notify } from '../state/store'
import { paletteHTML, paletteDay } from './palette-html'
import { sbInputsHTML } from './board-html'
import { boardHTML, boardWarnHTML, dayTabsHTML, boardMbtn, boardChange, boardArmClick, waveMenu, boardTab, closeScheduler, CXT, cxCommit, CX_QUICK, setCxt, SBWIDE, toggleWide, SORTALL, askSortAll, cancelSortAll, sortAllCommit, setSortAll, boardDayStep, wireDayDots, wireParkedRosScroll } from './board'
import { refreshHighlights } from './highlights'
import { wireRowDrag } from './rowdrag'
import { editingText } from './textedit'
import { useBoardVersion, useVersion } from './useStore'
import { HIST } from '../state/history'
import { undo, redo } from '../state/store'

export function SchedBoard() {
  const version = useVersion()
  const boardVersion = useBoardVersion()
  const boardRef = useRef<HTMLDivElement>(null)
  const rosterRef = useRef<HTMLDivElement>(null)
  const daysRef = useRef<HTMLDivElement>(null)
  const warnRef = useRef<HTMLDivElement>(null)
  const inputsRef = useRef<HTMLDivElement>(null)
  const mainRef = useRef<HTMLDivElement>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const topRef = useRef<HTMLDivElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  /* The board's only home page is Edit Schedule — `open` used to be a bare
     `SBDAY != null`, so a nav click while the board was open left the
     modal (position:fixed, inset:0, z-index:400 — the whole viewport)
     fully mounted and painted on top of whatever page the user actually
     navigated to, covering that page's own nav in the process
     (docs/ui-contracts.md §The scheduler board's panels). This render
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

  /* LOCK THE PAGE WHILE THE BOARD IS OPEN (owner-reported, 11 Aug 26 — "I
     could scroll and see the edit schedule board leaking into it, and in the
     end I was controlling the edit schedule board view at the bottom").
     The board is position:fixed over the whole viewport, but the shell behind
     it stayed a live scrolling document, so a drag that started anywhere
     outside .sb-main went to the WEEK. Measured before the fix: 2400px of page
     scrolled away under an open board, at 390px — and the same on the build
     before History, so this is an old fault that a lot of scrolling on a phone
     finally surfaced, not something History introduced.
     The scroll position is captured and put back by hand. `overflow:hidden`
     keeps it in Chrome and Safari today, but it is not guaranteed to, and
     landing the scheduler back on a week scrolled to the top after every visit
     to the board would be a worse bug than the one being fixed. Restoring a
     value that never moved is a no-op, so this costs nothing where the browser
     already does the right thing. */
  useEffect(() => {
    if (!open) return
    const el = document.scrollingElement || document.documentElement
    const y = el.scrollTop, x = el.scrollLeft
    document.body.classList.add('sb-lock')
    return () => {
      document.body.classList.remove('sb-lock')
      el.scrollTop = y; el.scrollLeft = x
    }
  }, [open])

  /* wires HOOKS.closeBoardDialogs — state/view.ts's closeBoardState() calls
     it, but the board's own dialog state (CXT, SORTALL) lives here, in the
     one component that owns it, not in state/ (see the doorway comment on
     closeBoardState itself). Raw setters, not the askCx/cancelSortAll
     "commands" — those call notify() themselves, which closeBoardState has
     no business doing mid-close; the caller (setPage) already gets its own
     notify() from whoever calls it. Wired once, like store.ts's wireStore()
     wires HOOKS.editMode/render* once at boot. */
  useEffect(() => {
    /* the changes list and any bubble go with them: both are opened from the
       board's own bar, so a page change that closes the board must not leave
       either painting over whatever the user navigated to */
    HOOKS.closeBoardDialogs = () => { setCxt(null); setSortAll(null); closeHistList(); hideHistBub() }
    return () => { HOOKS.closeBoardDialogs = () => {} }
  }, [])

  /* the board's own handlers, attached once */
  useEffect(() => {
    const el = boardRef.current!
    el.addEventListener('click', boardMbtn)
    el.addEventListener('click', boardArmClick)
    el.addEventListener('change', boardChange)
    const offDrag = wireRowDrag(el)
    /* the dots are a scrub bar as well as seven tap targets (owner, 11 Aug
       26) — press and slide along them to run through the week */
    const offDots = wireDayDots(daysRef.current!)
    /* the parked aircrew handle hands its vertical drag back to the board
       (owner, 11 Aug 26) — a fixed element's scroll goes to the viewport,
       which cannot scroll here, so it went nowhere */
    const offRos = wireParkedRosScroll(mainRef.current!)
    /* the History bubble rides on the WRAP, one level up from #sbBoard: the
       personal-inputs panel is #sbBoard's sibling inside it, and both are
       re-hung by their own string diffs, so a listener on either child would
       be thrown away with it. Same reason wireRowDrag delegates here. Its
       click handler is registered after the board's own two above, and never
       stops propagation — with History on, a tap still arms and still edits
       (histbubble.ts). */
    const offHist = wireHistBubble(wrapRef.current!)
    return () => {
      el.removeEventListener('click', boardMbtn); el.removeEventListener('click', boardArmClick)
      el.removeEventListener('change', boardChange); offDrag(); offDots(); offRos(); offHist()
    }
  }, [])

  /* THE DRAWER HAS TO CLEAR THE BAR (owner, 11 Aug 26 — "the aircrew tab
     shouldn't be blocked by the bar at the top area"). Opened, it was
     top:0/bottom:0 against the viewport and painted straight over the day,
     the undo pair and ✕ Close.
     The drawer stays pinned to the viewport (it must — .sb-main, the only
     box that sits below the bar, is also the phone board's scroller, so
     anchoring to it makes the drawer scroll away with the day), which means
     CSS needs the bar's height as a number. An OBSERVER rather than a read
     in this render effect: measured once per render it came out 5px short,
     because the effect runs before the bar's final reflow — the observer
     fires again on that reflow and on anything else that changes the bar's
     height later, such as the version dropdown appearing on a day that has
     published versions. */
  useEffect(() => {
    const root = rootRef.current, top = topRef.current
    if (!root || !top || typeof ResizeObserver === 'undefined') return
    const publish = () => root.style.setProperty('--sb-topH', top.offsetHeight + 'px')
    publish()
    const ro = new ResizeObserver(publish)
    ro.observe(top)
    return () => ro.disconnect()
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
  }, [version, boardVersion])

  const d = open ? DAYS[SBDAY] : null

  return (
    <div className={'schedboard' + (SBWIDE ? ' sb-wide' : '')} id="schedBoard" ref={rootRef} hidden={!open}>
      {/* ONE ROW ON A PHONE (owner, 11 Aug 26 — comp approved before build).
          The bar was four stacked rows and 166px of a 780px screen: title, the
          seven Mon–Sun chips, then six buttons wrapping onto two lines. It is
          43px now. Three moves got it there, and each is the owner's own ask:
          the day chips become dots and the day is reached by SWIPING (the
          gesture the view week already uses), `+ Line` goes entirely because
          every wave header already carries one, and every remaining control
          shows only its icon.
          The labels are still in the DOM — `.bl` is display:none under 820px,
          not removed — so desktop is untouched, the accessible name of each
          button is still its words, and nothing here needs a second markup
          path to maintain. */}
      <div className="sb-top" ref={topRef}>
        <div className="sb-title">
          <b id="sbDay">{d ? d.dow : ''}</b> <span className="mono" id="sbDate">{d ? d.dt : ''}</span>
          {d && d.today ? <i className="sb-today" title="today" /> : null}
          <span className="bl"> · scheduler board</span>
        </div>
        {/* ARROWS AT THE EDGES, AND NO SWIPE (owner, 12 Aug 26 — "remove the
            swipe for the mobile scheduler board too. Just put arrows at the
            edges of the bar at the top to navigate left and right between
            days.")
            They flank the DAY STRIP rather than sitting at the two ends of the
            bar's first line, and that is the only liberty taken with the ask:
            the first line is the title plus eight 30px buttons and has 6px of
            slack at 390px, so a pair of arrows there could only come out of the
            day name — which is down to ~107px and is the one thing the bar must
            keep (the 11 Aug rule: nothing joins this bar without something
            leaving it). The day strip is the row that is ABOUT choosing a day,
            it is 21px of mostly empty width, and arrows at its two ends put
            them at the screen's edges under the thumbs, which is what was
            asked for. `.sb-nav` is display:contents above 820px and the arrows
            are hidden there, so the desktop bar is untouched — it still has all
            seven days on it as chips, which is why it never needed a swipe or
            an arrow in the first place.
            The dots stay between them: they are the only thing that says WHICH
            day of the seven you are on, and they are still a scrub bar. */}
        <div className="sb-nav">
          <button className="abtn sb-arrow" id="sbPrevDay" title="Previous day"
            disabled={SBDAY == null || SBDAY <= 0}
            onClick={() => boardDayStep(-1)}><span className="bi">‹</span><span className="bl"> Previous day</span></button>
          {/* the same seven buttons on both surfaces — CSS makes them chips on a
              desktop and dots on a phone, so there is one list, one click
              handler, and a tap on a dot still jumps straight to that day */}
          <div className="sb-days" id="sbDays" ref={daysRef}
            onClick={e => { const t = (e.target as HTMLElement).closest('[data-sbtab]') as HTMLElement | null; if (t) boardTab(+t.dataset.sbtab!) }} />
          <button className="abtn sb-arrow" id="sbNextDay" title="Next day"
            disabled={SBDAY == null || SBDAY >= DAYS.length - 1}
            onClick={() => boardDayStep(1)}><span className="bi">›</span><span className="bl"> Next day</span></button>
        </div>
        <div className="sb-actions">
          <button className={'abtn sb-widebtn' + (SBWIDE ? ' on' : '')} id="sbWide"
            title={SBWIDE ? 'Back to the stacked phone layout' : 'Show the board in its full desktop layout'}
            onClick={() => { toggleWide(); notify() }}>
            <span className="bi">{SBWIDE ? '📱' : '🖥'}</span><span className="bl"> {SBWIDE ? 'Phone layout' : 'Desktop layout'}</span></button>
          {/* Undo / redo on the board itself (owner, 11 Aug 26). The board is
              a full-screen modal over the shell, so the shell's own pair is
              unreachable while it is open — every board edit had to be undone
              after closing it. Same two calls and the same disabled tests as
              Shell.tsx's pair; HIST is global, so this undoes the last edit
              wherever it was made, which is what Undo has always meant here. */}
          <button className="abtn hbtn" id="sbUndo" title="Undo" disabled={HIST.ix <= 0}
            onClick={() => { undo(); notify() }}><span className="bi">↶</span><span className="bl"> Undo</span></button>
          <button className="abtn hbtn" id="sbRedo" title="Redo" disabled={HIST.ix >= HIST.stack.length - 1}
            onClick={() => { redo(); notify() }}><span className="bi">↷</span><span className="bl"> Redo</span></button>
          {/* HISTORY (owner, 11 Aug 26) — a VIEW mode, so unlike Sort all and
              + Wave it carries no editMode() gate: reading who changed a
              detail is not editing it, and a scheduler looking at a read-only
              board has more reason to ask than one who made the change
              himself. Toggling it repaints (notify) and drops any bubble
              already up, which would otherwise hang over a board that has
              stopped explaining itself.
              The list is the SECOND button. It was nearly a chevron inside
              this one, and is not, because the two are genuinely separate
              things to want — "mark up what I'm looking at" and "show me
              everything that happened" — and a split control on a 30px phone
              button gives each half a 15px target, under the 28px the
              geometry gate holds every control on this bar to.
              THE LIST IS NOT A SECOND BUTTON, and that is measured, not
              taste: two more controls took this bar from 70px to 92px on a
              390px screen — the title wrapped onto a line of its own and the
              geometry gate caught it, which is exactly the failure HANDOFF's
              "do not add a control back to this bar without taking one off"
              was written after. Rather than take an existing control off for
              a new one, the list opens from the day's own checks panel, and
              only while History is on — which is also the owner's own phrasing
              for it ("when I enable history, there is also an option to view
              the history of all edits"). See boardWarnHTML in board.ts. */}
          <button className={'abtn' + (HISTMODE ? ' on' : '')} id="sbHist"
            aria-pressed={HISTMODE}
            title={HISTMODE ? 'Stop showing who changed each detail' : 'Show who changed each detail, and when — hover it, or tap it on a phone'}
            onClick={() => { toggleHistMode(); hideHistBub(); notify() }}>
            <span className="bi">🕘</span><span className="bl"> History</span></button>
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
            title="Reorder every section on this day back into its own reading order, waves and duty blocks included — one confirm, one undo step"
            onClick={() => { if (SBDAY != null) askSortAll(SBDAY) }}><span className="bi">⇅</span><span className="bl"> Sort all</span></button>}
          {/* + Wave — matched to Sort all's own gate (coordinator review, 9
              Aug 26): it carried no editMode() gate of its own here, so it
              still rendered enabled on a read-only board (a session that may
              not edit it, board still open on its own page) — genuinely inert
              because addWave already refuses underneath (board.ts), but that
              is exactly the shape Sort all was fixed for three lines above.
              Hidden, not merely disabled, same as Sort all.
              `+ LINE IS GONE FROM HERE` (owner, 11 Aug 26 — "there will be no
              +line at the top, because each section I can already add rows").
              It was the only control on this bar that duplicated one already
              sitting inside the section it acts on: every wave header carries
              its own `+ Line`, next to the wave it adds to, where the top-bar
              copy had to guess (`addLine` appends to the LAST wave of the day,
              which on a two-wave day is a coin flip). `+ Wave` stays because
              nothing else on the board can create a wave. */}
          {open && HOOKS.editMode() && <button className="abtn" id="sbAddGo" disabled={DPREV.has(SBDAY)} onClick={e => { e.stopPropagation(); waveMenu(e.currentTarget as HTMLElement, SBDAY) }}><span className="bi">+</span><span className="bl"> Wave</span></button>}
          <button className="abtn primary" id="sbDone" onClick={() => { HOOKS.toast('Schedule updated'); closeScheduler() }}><span className="bi">✓</span><span className="bl"> Done</span></button>
          <button className="abtn ghost" id="sbClose" onClick={closeScheduler}><span className="bi">✕</span><span className="bl"> Close</span></button>
        </div>
      </div>
      <div className="sb-main" ref={mainRef}>
        <div className={'sb-boardwrap' + (HISTMODE ? ' hist-on' : '')} ref={wrapRef}>
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
          overall programme — goes back into its own reading order, and the flying waves
          and duty blocks themselves move into take-off and start-time order. Unlike every
          other control on this board, this acts on the WHOLE day at once, not one row; a
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
