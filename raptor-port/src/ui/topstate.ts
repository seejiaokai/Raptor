/* THE TOP BAR'S SHARED STATE AND WHAT ITS CONTROLS DO — the Sync chip's one state, the bell's tap and its list's
   open-state, the two undo engines ([UNDO-TOPBAR], owner D347–D349). Moved whole, word for word, out of ui/topbits.tsx
   (3 Nov 26 — React Doctor's only-export-components: a file of screen parts that also hands out plain functions cannot
   be swapped in place while the app is being built), which now holds the four drawn parts alone — the Sync chip, the
   bell, its list and the Undo / Redo pair — and reads all of this from here. Nothing in it changed. */
import { useSyncExternalStore } from 'react'
import { notify, setPage } from '../state/store'
import { bellLit, clearBell } from '../state/view'
import { HOOKS } from '../engine/hooks'
import { globalUndo, globalRedo, undoState } from '../undo'
import { editingText } from './textedit'
import { oilUndoBoundary } from './oilmode'
import { accessAlert, waitingCount } from '../state/accounts'
import { bugAlert, unseenReports } from '../state/reports'
import { openAdminUsers } from './adminopen'
import { oilPendingFor, openWarAt } from '../leavewar/sync'
import { inpById } from '../engine/inputs'
import { setOilAsk, setInpEdit, BELLLIST, setBellList, setOilList } from './pops'
import { me } from '../state/perms'
import { holidayLineOn, noticeSpan, isWarNotice, type Notice } from '../state/notices'
import { unreadFor, markNoticeRead } from '../state/noticeseen'
import { trackerUndoApi, onTrackerUndo, trackerUndoVersion } from '../tracker/undo-bridge.js'

/* ---- the Sync chip (a demonstration toggle — there is no server yet; the one state for both bars) ---- */
let FASTSYNC = false
export const fastSync = (): boolean => FASTSYNC
export function toggleFastSync(): void { FASTSYNC = !FASTSYNC; notify() }

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
  /* A LEAVE WAR LINE (the overhaul's M4, 9.6): the Leave War at that day — where a move took it, at its new days — his
     cell ringed; a bidding line, the stretch's first day */
  if (isWarNotice(n)) {
    markNoticeRead(n.id)
    setBellList(false)
    const p: any = (n.what || [])[0]
    const day = p.k === 'lw' && p.to ? String(p.to) : String(p.a)
    openWarAt(day, p.k === 'lwopen' || (p.k === 'lwback' && (p.d === 'open' || p.d === 'close')) ? null : n.to)
    notify(); return
  }
  const row = inpById(n.iid)
  markNoticeRead(n.id)
  if (!row) { HOOKS.toast('That input is gone'); notify(); return }
  setBellList(false)
  setInpEdit(row)
  setPage('inputs'); notify()
}

/* ---- the Undo / Redo pair: its two engines ---- */
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
/* …AND IT NEVER RUNS UNDER A CARET (the narrow read of the D994 batch's fix round, round 2, 19 Oct 26 — older than the
   batch). A tap on Undo on Safari does not move the focus, so Undo ran with the caret still in a box whose block is held
   for it; an In-time line there kept the address it had before the Undo, and leaving it wrote it over the line Undo had
   just brought back (one line lost, another doubled). The press first lets the caret go — what was typed in the box is
   saved as its own change, as a desktop click on the button already does — and runs once that save and its backstop
   have run (timers of 0 run in order), so the paint after it is the ordinary one and every line has its true place. */
const offCaret = (body: () => void) => {
  const a = typeof document === 'undefined' ? null : document.activeElement as HTMLElement | null
  if (a && a !== document.body && editingText()) { a.blur(); setTimeout(body, 0); return }
  body()
}
export function globalUndoEngine(): UndoEngine {
  const us = undoState()
  return {
    canUndo: us.canUndo,
    canRedo: us.canRedo,
    undoTitle: us.undoLabel ? `Undo — ${us.undoLabel}` : (us.undoWhy || 'Undo'),
    redoTitle: us.redoLabel ? `Redo — ${us.redoLabel}` : (us.redoWhy || 'Redo'),
    undo: () => offCaret(() => {
      /* (owner D838 + D839, 14 Oct 26: "without undoing" — a reader could not tell whether the undo had been done; this
         press closes the mode and undoes nothing) */
      if (oilUndoBoundary()) { HOOKS.toast('Left OIL Earn without undoing. The next undo would change the day itself.', 'ok'); notify(); return }
      const r = globalUndo(); if (!r.ok && r.reason) HOOKS.toast(r.reason, 'warn'); notify()
    }),
    redo: () => offCaret(() => { const r = globalRedo(); if (!r.ok && r.reason) HOOKS.toast(r.reason, 'warn'); notify() }),
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
