/* THE TOP BAR'S SHARED CONTROLS — the Sync chip, the bell and the Undo / Redo pair ([UNDO-TOPBAR], owner D347–D349,
   28 Sep 26). The scheduler board covers the whole screen, top bar included, so its own bar carries the SAME group —
   Undo · Redo · History · Sync · the bell — then ✓ Done (D349 (3)). Each control is ONE component, drawn in both bars,
   so the two can never drift (the plan's §11.10, Astra's red team 8): the Sync chip's state is module state (ui/topstate.ts), not
   a component's (a board chip set to "1 s" and a top-bar chip still reading "slow" would be two answers to one
   question), and the bell's tap is one body.

   The Undo / Redo pair (D347 — "all undo and redo buttons should be at the top bar … standardised … like how the edit
   schedule is") is presentational: it draws the two buttons in Edit Schedule's look and is handed an ENGINE — the one
   undo (every page but the Tracker) or the Tracker's own history through its no-import bridge — never both, so the
   Tracker's pair can never reach the one undo, nor the one undo's OIL Earn stop the Tracker (Astra's red team 3). */
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { notify } from '../state/store'
import { BELLLIST, BELLAT } from './pops'
import { me } from '../state/perms'
import { noticesFor, noticeWords, noticeAge } from '../state/notices'
import { isUnread, unreadFor, markAllNoticesRead } from '../state/noticeseen'
import { useVersion } from './useStore'
import { holdPageScroll } from './floatwin'
import { fixedOrigin } from './kbscroll'
import { fastSync, toggleFastSync, bellOn, bellTap, closeBellList, openNotice, type UndoEngine } from './topstate'

/* ---- the Sync chip (its one state for both bars, and its toggle: ui/topstate.ts) ---- */
export function SyncChip({ id, lblId }: { id: string; lblId: string }) {
  const on = fastSync()
  return (
    /* aria-pressed (round 2's blind read, 21 Oct 26): where only the dot shows (821–1599, D1126, D1130) its colour was the
       only sign of on / off — a screen reader is told too */
    <button className={'fastsync' + (on ? ' on' : '')} id={id} aria-pressed={on} title="Toggle 1-second sync (for publishing / meetings)"
      onClick={toggleFastSync}><span className="dot"></span><span id={lblId} className="synclbl">{on ? 'Sync · 1 s' : 'Sync · slow'}</span></button>
  )
}

/* ---- the bell (what a tap does, the list's open-state and the history of the four triggers: ui/topstate.ts) ---- */
export function BellList() {
  useVersion()
  const ref = useRef<HTMLDivElement>(null)
  const [at, setAt] = useState<{ top: number; right: number; wide: boolean } | null>(null)
  const open = BELLLIST
  /* under the bell that is on screen (the top bar's, or the board's); on a phone a panel as wide as the screen, under
     the bar — as drawn */
  useLayoutEffect(() => {
    if (!open) { setAt(null); return }
    const place = () => {
      const bell = (BELLAT ? document.getElementById(BELLAT) : null)
        || [...document.querySelectorAll<HTMLElement>('.bellbtn')].find(b => b.offsetParent !== null) || document.querySelector<HTMLElement>('.bellbtn')
      if (!bell) return
      /* in the screen's own measure, not the slid one (his keyboard readout — kbscroll.ts fixedOrigin) */
      const b = bell.getBoundingClientRect(), o = fixedOrigin()
      const wide = typeof window.matchMedia === 'function' && window.matchMedia('(max-width:820px)').matches
      setAt({ top: Math.round(b.bottom - o.top + 6), right: Math.max(8, Math.round(window.innerWidth - b.right)), wide })
    }
    place()
    window.addEventListener('resize', place)
    return () => window.removeEventListener('resize', place)
  }, [open])
  /* a click-open popup closes on a press outside it (the standing rule, 4 Sep 26) — a press on the bell is the bell's
     own to answer — and on Escape */
  useEffect(() => {
    if (!open) return
    const down = (e: Event) => {
      const t = e.target as HTMLElement | null
      if (t && t.closest && (t.closest('.bell-list') || t.closest('.bellbtn'))) return
      closeBellList()
    }
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') closeBellList() }
    document.addEventListener('pointerdown', down, true)
    document.addEventListener('keydown', key)
    return () => { document.removeEventListener('pointerdown', down, true); document.removeEventListener('keydown', key) }
  }, [open])
  /* A FINGER ON THE BELL NEVER SCROLLS THE PAGE BEHIND IT (owner D686; the fixes' M8 — the re-walk's B-F1): its lines
     scroll inside it, but a finger that began on its foot ("↓ 3 more", Mark all read) and dragged moved the page behind
     it. The one body every window holds a finger with (floatwin.ts holdPageScroll), on the whole bell, its foot included. */
  const placed = !!at   // the list is drawn once it has a place: the element to hold is there from then on
  useEffect(() => {
    const n = ref.current
    if (!open || !n) return
    return holdPageScroll(n)
  }, [open, placed])
  /* A LONG LIST KEEPS ITS FOOT IN SIGHT AND SAYS WHAT IS BELOW (the walk's C-F4, 27 Oct 26): the lines scroll inside
     the list, "Mark all read" stands under them, and "↓ 3 more" counts the lines not wholly in view below — the Leave
     War day panel's cue (D1295) — gone once the list is at its end */
  const scroller = useRef<HTMLDivElement>(null)
  const [below, setBelow] = useState(0)
  const countBelow = () => {
    const s = scroller.current
    if (!s) return
    const bottom = s.getBoundingClientRect().bottom + 1
    let n = 0
    for (const l of Array.from(s.querySelectorAll<HTMLElement>('.bl-line'))) if (l.getBoundingClientRect().bottom > bottom) n++
    setBelow(n)
  }
  useLayoutEffect(() => { if (open && at) countBelow() })
  if (!open) return null
  const mine = me()
  const list = noticesFor(mine)
  /* "Mark all read" while ANY of his is unread — not only among the thirty listed: an unread one older than those
     would otherwise keep the bell lit with no way to put it out (found by the older tests re-expressed, 12 Oct 26) */
  const unread = unreadFor(mine) > 0
  const now = Date.now()
  return (
    <div className={'bell-list' + (at && at.wide ? ' wide' : '')} ref={ref} role="menu" aria-label="Notifications" data-testid="bell-list"
      style={at ? (at.wide ? { top: at.top } : { top: at.top, right: at.right }) : { visibility: 'hidden' }}>
      <div className="bl-scroll" ref={scroller} onScroll={countBelow}>
      {list.length === 0 && <div className="bl-empty" data-testid="bell-empty">Nothing new</div>}
      {list.map(n => {
        const w = noticeWords(n), fresh = isUnread(n, mine)
        return (
          <button type="button" role="menuitem" key={n.id} className={'bl-line' + (fresh ? ' unread' : '')} data-testid={`bell-line-${n.id}`}
            onClick={() => openNotice(n)}>
            <span className="bl-dot" aria-hidden="true" />
            <span className="bl-main">
              <span className="bl-t"><b className="bl-name">{w.name}</b><i className="bl-day">{w.day}</i></span>
              <span className="bl-what">{w.what}{w.who ? ` · ${w.who}` : ''}</span>
            </span>
            <span className="bl-ago">{noticeAge(n, now)}</span>
          </button>
        )
      })}
      </div>
      {(unread || below > 0) && <div className="bl-foot">
        {below > 0 && <span className="bl-more" data-testid="bell-more">↓ {below} more</span>}
        {unread && <button type="button" className="abtn sm ghost" data-testid="bell-markall"
          onClick={() => { markAllNoticesRead(); notify() }}>Mark all read</button>}
      </div>}
    </div>
  )
}
export function BellButton({ id }: { id: string }) {
  /* the bell redraws itself on every change — a bar that does not redraw must not leave it lit, or saying "closed",
     after the list was read (step 7's look: it stayed lit after "Mark all read") */
  useVersion()
  return (
    <button className={'bellbtn' + (bellOn() ? ' on' : '')} id={id} aria-label="Notifications" title="Notifications" aria-haspopup="menu"
      aria-expanded={BELLLIST && (!BELLAT || BELLAT === id)} onClick={e => bellTap(e.currentTarget)}>
      <svg className="bellglyph" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a6 6 0 0 0-6 6c0 3.5-1.2 5.4-2.2 6.5-.5.6-.1 1.5.7 1.5h15c.8 0 1.2-.9.7-1.5C19.2 13.4 18 11.5 18 8a6 6 0 0 0-6-6Zm0 20a2.6 2.6 0 0 0 2.5-2h-5a2.6 2.6 0 0 0 2.5 2Z" fill="currentColor" /></svg>
      <span className="belldot" aria-hidden="true"></span>
    </button>
  )
}

/* ---- the Undo / Redo pair (its two engines, the one undo's and the Tracker's: ui/topstate.ts) ---- */
/* aria-label (round 2's blind read, 21 Oct 26): from 821 to 1599 the word is hidden (D1126, D1130) and the button's
   name would be the arrow alone — "Undo" / "Redo" is said whatever the width; the title stays the hover's detail */
export function UndoPair({ eng, ids }: { eng: UndoEngine; ids: [string, string] }) {
  return (
    <>
      <button className="abtn hbtn" id={ids[0]} aria-label="Undo" title={eng.undoTitle} disabled={!eng.canUndo} onClick={() => eng.undo()}>
        <span className="bi">↶</span><span className="bl"> Undo</span></button>
      <button className="abtn hbtn" id={ids[1]} aria-label="Redo" title={eng.redoTitle} disabled={!eng.canRedo} onClick={() => eng.redo()}>
        <span className="bi">↷</span><span className="bl"> Redo</span></button>
    </>
  )
}
