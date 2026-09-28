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
import { useSyncExternalStore } from 'react'
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
import { setOilAsk, setInpEdit } from './pops'
import { me } from '../state/perms'
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
export function bellOn(): boolean {
  const mine = me()
  return bellLit() || bugAlert() || (mine ? oilPendingFor(mine).length > 0 : false) || accessAlert()
}
export function bellTap(): void {
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
  const oilHit = mine ? oilPendingFor(mine)[0] : null
  if (oilHit) {
    const row = inpById(oilHit.iid)
    if (row) {
      HOOKS.toast('Weekend/PH work — confirm your OIL')
      setOilAsk(oilHit.iid)
      setInpEdit(row)
      setPage('inputs'); notify(); return
    }
  }
  const was = bellLit(); clearBell(); HOOKS.toast(was ? 'Notifications cleared' : 'No new notifications for this view'); notify()
}
export function BellButton({ id }: { id: string }) {
  return (
    <button className={'bellbtn' + (bellOn() ? ' on' : '')} id={id} aria-label="Notifications" title="Notifications" onClick={bellTap}>
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
