/* THE TOP BAR'S SHARED CONTROLS — the Sync chip, the bell and the Undo / Redo pair ([UNDO-TOPBAR], owner D347–D349,
   28 Sep 26). The scheduler board covers the whole screen, top bar included, so its own bar carries the SAME group —
   Undo · Redo · History · Sync · the bell — then ✓ Done (D349 (3)). Each control is ONE component, drawn in both bars,
   so the two can never drift (the plan's §11.10, Astra's red team 8): the Sync chip's state is module state here, not
   a component's (a board chip set to "1 s" and a top-bar chip still reading "slow" would be two answers to one
   question), and the bell's tap is one body.

   The Undo / Redo pair (D347 — "all undo and redo buttons should be at the top bar … standardised … like how the edit
   schedule is") is presentational: it draws the two buttons in Edit Schedule's look and is handed an ENGINE — the one
   undo (every page but the Tracker) or the Tracker's own history through its no-import bridge — never both, so the
   Tracker's pair can never reach the one undo, nor the one undo's OIL Earn stop the Tracker (Astra's red team 3). */
import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react'
import { notify, setPage } from '../state/store'
import { bellLit, clearBell } from '../state/view'
import { HOOKS } from '../engine/hooks'
import { globalUndo, globalRedo, undoState } from '../undo'
import { oilUndoBoundary } from './oilmode'
import { accessAlert, waitingCount } from '../state/accounts'
import { bugAlert, unseenReports } from '../state/reports'
import { openAdminUsers } from './adminopen'
import { oilPendingFor } from '../leavewar/sync'
import { inpById } from '../engine/inputs'
import { setOilAsk, setInpEdit, BELLLIST, BELLAT, setBellList, setOilList } from './pops'
import { me } from '../state/perms'
import { noticesFor, noticeWords, noticeAge, holidayLineOn, noticeSpan, type Notice } from '../state/notices'
import { isUnread, unreadFor, markNoticeRead, markAllNoticesRead } from '../state/noticeseen'
import { useVersion } from './useStore'
import { trackerUndoApi, onTrackerUndo, trackerUndoVersion } from '../tracker/undo-bridge.js'

/* ---- the Sync chip (a demonstration toggle — there is no server yet; the one state for both bars) ---- */
let FASTSYNC = false
export const fastSync = (): boolean => FASTSYNC
export function toggleFastSync(): void { FASTSYNC = !FASTSYNC; notify() }
export function SyncChip({ id, lblId }: { id: string; lblId: string }) {
  return (
    <button className={'fastsync' + (FASTSYNC ? ' on' : '')} id={id} title="Toggle 1-second sync (for publishing / meetings)"
      onClick={toggleFastSync}><span className="dot"></span><span id={lblId} className="synclbl">{FASTSYNC ? 'Sync · 1 s' : 'Sync · slow'}</span></button>
  )
}

/* ---- the bell (Shell.tsx's comment beside its first copy holds the four triggers' history) ----
   ONE tap body for both bars. A tap that goes somewhere (Admin → Users, Help, Inputs) goes through setPage, which
   closes the board when it leaves Edit Schedule (state/view.ts) — so the board's bell never navigates UNDER the board
   (the plan's B10.5). A tap that only clears the view's alert leaves the board where it is. */
/* THE BELL'S LIST OF NOTICES (the one-rule build's step 7, 12 Oct 26 — owner D755 (3), D760, D769; the plan §4.10;
   the pictures of record docs/mock/2026-10-12-one-rule/bell-{desk,phone}-list-shorter.png). "The member is told by his
   bell": someone else changed an input he is in — a notice (state/notices.ts), unread until he reads it
   (state/noticeseen.ts — his own record, never a write to the notice). An unread one lights the bell.
   D769: "a tap on the bell still goes straight to an OIL question, an access request or a bug report where one waits,
   opening the list only otherwise" — so the four things the bell did before come first, exactly as before, and the
   tap that used to say "No new notifications for this view" opens the list instead (it says "Nothing new" itself).
   ONE open-state for both bars, like the Sync chip's: the list is drawn once (Shell) and hangs under whichever bell is
   on screen. */
/* (open or not, and under which bell: ui/pops.ts BELLLIST / BELLAT — with every other window's flag, so a sign-out
   closes it) */
export const bellListOpen = (): boolean => BELLLIST
export function closeBellList(): void { if (BELLLIST) { setBellList(false); notify() } }
export function bellOn(): boolean {
  const mine = me()
  return bellLit() || bugAlert() || (mine ? oilPendingFor(mine).length > 0 || unreadFor(mine) > 0 : false) || accessAlert()
}
export function bellTap(from?: HTMLElement | null): void {
  if (accessAlert()) {
    const n = waitingCount()
    HOOKS.toast(`${n} waiting for access — opening Admin → Users`)
    openAdminUsers(); return
  }
  if (bugAlert()) {
    const n = unseenReports()
    HOOKS.toast(`${n} new bug report${n === 1 ? '' : 's'}`)
    setPage('help'); notify(); return
  }
  const mine = me()
  /* A SCHEDULER'S OWN UNANSWERED INPUT ON A DAY A HOLIDAY'S LINE ALREADY COVERS DOES NOT TAKE THE TAP ([OIL-ASK-NOTIFY] —
     owner D782: "the admin answers a day's open OIL questions from ONE list"; D783 (6)). Left to this branch, an admin
     who made a day a holiday with three inputs he had filed for others on it would be walked through three single
     questions, one tap each, and never meet the list. For him those are the list's: the tap falls through to the
     bell's own list, whose line opens it. Every other question of his own — and every member's — goes straight to
     it, as D769 has it. */
  /* (a member has no such line, and neither has the admin's own member view while it is on: a holiday's line is live
     for a scheduler only — state/notices.ts noticeLive, the one body; the break tests of 13 Oct 26 showed a second
     test of it here decided nothing) */
  const oilHit = mine ? oilPendingFor(mine).find(h => !holidayLineOn(mine, h.iso)) || null : null
  if (oilHit) {
    const row = inpById(oilHit.iid)
    if (row) {
      HOOKS.toast('Weekend/PH work — confirm your OIL')
      setOilAsk(oilHit.iid)
      setInpEdit(row)
      setPage('inputs'); notify(); return
    }
  }
  /* the view's own alert, as before */
  if (bellLit()) { clearBell(); HOOKS.toast('Notifications cleared'); notify(); return }
  setBellList(!BELLLIST, from && from.id ? from.id : '')
  notify()
}
/* a tap on a line: the input's own window — or, where it has since been deleted, the words; either way that line is read */
export function openNotice(n: Notice): void {
  /* a holiday's line opens the ONE list for its dates ([OIL-ASK-NOTIFY], owner D783 (6): "a tap opening the list") — it
     is about no single input, so it is asked before any input is looked for (Fable's read of the plan, A6) */
  const hol: any = (n.what || [])[0]
  if (hol && hol.k === 'oilhol') {
    markNoticeRead(n.id)
    setBellList(false)
    /* (for the days that are a holiday NOW — a holiday shortened since its notice was made opens the list for what is
       left of it: state/notices.ts noticeSpan) */
    const span = noticeSpan(n) || { a: String(hol.a), b: String(hol.b || hol.a) }
    setOilList({ from: span.a, to: span.b, name: span.name != null ? span.name : n.name, fresh: false })
    notify(); return
  }
  const row = inpById(n.iid)
  markNoticeRead(n.id)
  if (!row) { HOOKS.toast('That input is gone'); notify(); return }
  setBellList(false)
  setInpEdit(row)
  setPage('inputs'); notify()
}
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
      const b = bell.getBoundingClientRect()
      const wide = typeof window.matchMedia === 'function' && window.matchMedia('(max-width:820px)').matches
      setAt({ top: Math.round(b.bottom + 6), right: Math.max(8, Math.round(window.innerWidth - b.right)), wide })
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
      {unread && <div className="bl-foot"><button type="button" className="abtn sm ghost" data-testid="bell-markall"
        onClick={() => { markAllNoticesRead(); notify() }}>Mark all read</button></div>}
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

/* ---- the Undo / Redo pair ---- */
export interface UndoEngine {
  canUndo: boolean
  canRedo: boolean
  undoTitle: string
  redoTitle: string
  undo(): void
  redo(): void
}
/* THE ONE UNDO — every page but the Tracker. UNDO STOPS AT THE DOOR OF OIL EARN (fix 5, 22 Sep 26): inside the mode Undo
   walks back OIL decisions freely, but the press that would reach past the point the mode was opened at closes the mode
   instead of changing the schedule underneath a screen that says it cannot be changed; the next press behaves normally.
   Every door asks it, since there is one pair (oilundo-button.test.tsx presses both bars through the DOM). */
export function globalUndoEngine(): UndoEngine {
  const us = undoState()
  return {
    canUndo: us.canUndo,
    canRedo: us.canRedo,
    undoTitle: us.undoLabel ? `Undo — ${us.undoLabel}` : (us.undoWhy || 'Undo'),
    redoTitle: us.redoLabel ? `Redo — ${us.redoLabel}` : (us.redoWhy || 'Redo'),
    undo: () => {
      if (oilUndoBoundary()) { HOOKS.toast('Left OIL Earn — the next undo would change the day itself', 'ok'); notify(); return }
      const r = globalUndo(); if (!r.ok && r.reason) HOOKS.toast(r.reason, 'warn'); notify()
    },
    redo: () => { const r = globalRedo(); if (!r.ok && r.reason) HOOKS.toast(r.reason, 'warn'); notify() },
  }
}
/* THE TRACKER'S OWN HISTORY (D349 (2): "the Tracker's own Undo and Redo move to the top bar too", still taking back the
   Tracker's own changes), through the no-import bridge core.js registers at the end of its init — so a Raptor visit
   never downloads the chart engine. Before the Tracker has loaded there is nothing to take back: both greyed. */
export function useTrackerUndoVersion(): number { return useSyncExternalStore(onTrackerUndo, trackerUndoVersion) }
export function trackerUndoEngine(): UndoEngine {
  const t: any = trackerUndoApi()
  const cu = !!(t && t.canUndo()), cr = !!(t && t.canRedo())
  return {
    canUndo: cu,
    canRedo: cr,
    undoTitle: cu ? `Undo ${t.undoWhat()} (Ctrl+Z)` : 'Nothing to undo',
    redoTitle: cr ? `Redo ${t.redoWhat()} (Ctrl+Y)` : 'Nothing to redo',
    undo: () => { if (t) t.doUndo() },
    redo: () => { if (t) t.doRedo() },
  }
}
export function UndoPair({ eng, ids }: { eng: UndoEngine; ids: [string, string] }) {
  return (
    <>
      <button className="abtn hbtn" id={ids[0]} title={eng.undoTitle} disabled={!eng.canUndo} onClick={() => eng.undo()}>
        <span className="bi">↶</span><span className="bl"> Undo</span></button>
      <button className="abtn hbtn" id={ids[1]} title={eng.redoTitle} disabled={!eng.canRedo} onClick={() => eng.redo()}>
        <span className="bi">↷</span><span className="bl"> Redo</span></button>
    </>
  )
}
