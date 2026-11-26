/* ONE ANSWER TO "WHAT IS OPEN" — the guard rail's table (the guard rail's plan,
   docs/superpowers/plans/2026-11-25-msq-pick-guard-build1.md §3.1, §3.2; his D2403, D2595–D2597, D2627, D2654).

   A pick of another squadron, the switch to or from the member view and a bell line that changes either are refused
   while a window is open (D2403); a window that only shows things closes by itself and the press goes through (D2596,
   D2597). This file answers what is open — one function over one table — and the doors ask it through the seam,
   state/guard.ts, which this file installs itself into as it loads.

   NOT A REGISTRY each window joins and leaves: that would be a second copy of "is it open" beside what the window is
   drawn from, kept true only by a call at every way out — and four frames here do not unmount when they close (the
   veiled dialogs are `hidden`, ALL AVAIL and Changes keep a placeholder, a sign-out clears flags with no component
   told). One missed leave and the guard refuses with nothing open, no way out but a reload. So each row's open() is the
   very predicate its window is drawn from: a function of ui/windrawn.ts that the component itself calls, the order of
   movable windows that are up (ui/winorder.ts winUp), the saver's own state, the Leave War's own count of its sheets.
   Its own fault is the mirror one — a window nobody adds — which the roll-call tests catch by reading the source
   (ui/msq-guard-rollcall.test.ts, R1, R2, R8).

   K1a, the first of three passes of part A: the table for every window whose state is a module's own. No door asks
   yet, nothing closes yet — the app behaves exactly as before. K1b adds the windows and typed work whose state is a
   component's own (Admin's rows, the Inputs list's OIL question, the Calendar family on his E1 answer, Quals' "Add
   qualification", the two edit modes' end, the Leave War's show-only mark); K1c the Tracker. Plain modules only — no
   component is imported, so the test world and the test set-ups can load it. */
import { useEffect, useLayoutEffect, useRef } from 'react'
import { setGuardAsk, setGuardClose, type GuardOpts, type GuardRefusal } from '../state/guard'
import { CURPAGE, SBDAY, OILDAY, ARM, RESTARM, UNPUBARM, SECDEFOFFER, OILBAR } from '../state/view'
import { LGEDIT } from '../state/auth'
import { pageOffered } from '../state/perms'
import { warWindowOpen } from '../state/typing-hold'
import { saveRefused } from '../storage/savewait'
import { closeDayPanel } from '../leavewar/ui/daypanelopen'
import { winUp } from './winorder'
import { availDrawn, chgDrawn, inputDlgDrawn, insightsDrawn, dutyTplDrawn, waveTplDrawn, dayTplDrawn, draftsDrawn, cxDrawn, sortAllDrawn, medMoveDrawn, oilWaitDrawn } from './windrawn'
import { closeAvailWin } from './availopen'
import { closeChanges } from './changesopen'
import { setInsights, AIRKEY, DAYPOP, WEEKCAL, DOCVIEW, BELLLIST, DRAWER } from './pops'
import { notify } from '../state/store'

/* what a row is: a window that refuses, a row being edited (Admin's — K1b), a change not saved, a window that only
   shows things and closes by itself, or 'no' — a list, a menu, a mode, a window that already closes at the press, in
   the table so the list is whole and a reader can see it was considered */
export type GuardCounts = 'window' | 'row' | 'unsaved' | 'closes' | 'no'

/* THE MOVABLE WINDOWS (§3.2 (a) — ui/FloatWindow.tsx FloatWin): id → the page it is drawn on ('any' for one mounted at
   the app's top level, ui/App.tsx, standing over whatever page is shown). One row each, never one for the frame: a
   door's skip, a row's where and the note's where are all about one window. ALL AVAIL and Changes are in the order of
   windows up too, but not here — their rows are their own (b), from their own predicates. */
export const FLOAT_WHERE = {
  inputedit: 'inputs',   // the Input window on the Inputs page (ui/InputWindow.tsx)
  inputsday: 'inputs',   // a day opened on the Inputs calendar (ui/InputsCal.tsx)
  sansday: 'inputs',     // a SANS day (ui/SansDay.tsx, opened from ui/SansCal.tsx)
  inputsset: 'any',      // Inputs calendar settings (ui/InputsSettings.tsx) — from the gear or Logic's row
  sansset: 'any',        // SANS calendar settings (ui/SansSettings.tsx) — the same
  days: 'any',           // the Calendar (ui/DaysWindow.tsx)
  everywd: 'any',        // "Every Monday" (ui/EveryWeekday.tsx), opened from the Calendar
  holiday: 'any',        // Add / Change a holiday (ui/HolidaysPanel.tsx), opened from the Calendar
  oilday: 'any',         // the OIL list (ui/OilDayList.tsx)
  lwday: 'leavewar',     // the Leave War's day panel (leavewar/ui/DayPanel.tsx) — its page stays mounted out of sight
} as const
export type FloatId = keyof typeof FLOAT_WHERE

export type GuardRowId =
  | FloatId
  | 'avail' | 'chg'
  | 'inputdlg' | 'insights' | 'dutytpl' | 'wavetpl' | 'daytpl' | 'drafts' | 'cxdlg' | 'sortall'
  | 'airpop' | 'daypop' | 'weekcal' | 'docview'
  | 'medmove' | 'oilwait'
  | 'lwsheet'
  | 'belllist' | 'sqnlist' | 'drawer' | 'insmenu' | 'boardmenus' | 'datecal' | 'medcal' | 'icpick'
  | 'board' | 'oilearn' | 'arm' | 'restarm' | 'unpubarm' | 'lgedit' | 'qedit' | 'secdef' | 'oilbar' | 'welcome'
  | 'unsaved'
  | 'daynote' | 'helpbug' | 'calnote' | 'balfig' | 'logicsearch' | 'qualsfilter'

export type GuardRow = {
  id: GuardRowId
  /* what a person calls it — the note's name for it is K3's, never read from here */
  name: string
  /* the file that draws it (the roll-call reads it: a windrawn predicate must be imported and called there) */
  frame: string
  /* the page it is drawn on, 'any' for one drawn over every page (§3.3) */
  where: string
  /* is it open — the very predicate its window is drawn from */
  open: () => boolean
  /* the selector of the window's own box — read by tests only (A10, the browser tests); production never decides by
     the page's nodes */
  sel: string
  counts: GuardCounts
  /* the module flags it reads (ui/pops.ts, state/view.ts, state/auth.ts) — R1's roll-call of flags */
  flags?: string[]
  /* a 'closes' row only: its component's own way of closing it */
  close?: () => void
  /* a 'no' row only: why it does not count */
  why?: string
}

/* THE CLOSERS A COMPONENT HANDS OVER, for a 'closes' window whose state is its own (useGuardCloses, below) */
const CLOSERS = new Map<GuardRowId, () => void>()

const FLOAT_ROW: Record<FloatId, Omit<GuardRow, 'id' | 'where' | 'open'>> = {
  inputedit: { name: 'the Input window', frame: 'ui/InputWindow.tsx', sel: '[data-testid="win-inputedit"]', counts: 'window', flags: ['INPEDIT'] },
  /* inputsday, inputsset, sansset, days, everywd and holiday are plain 'window' rows in K1a, the refusing side: K1b gives
     the Calendar family its E1 shape (his D2654 — 'closes' unless a form of it is half done, a settings window with
     `dirty`) in the commit that cites his answer (R8) */
  inputsday: { name: 'a day on the Inputs calendar', frame: 'ui/InputsCal.tsx', sel: '[data-testid="win-inputsday"]', counts: 'window' },
  sansday: { name: 'a SANS day', frame: 'ui/SansDay.tsx', sel: '[data-testid="win-sansday"]', counts: 'closes', close: () => CLOSERS.get('sansday')?.() },
  inputsset: { name: 'Inputs calendar settings', frame: 'ui/InputsSettings.tsx', sel: '[data-testid="win-inputsset"]', counts: 'window', flags: ['INPSET'] },
  sansset: { name: 'SANS calendar settings', frame: 'ui/SansSettings.tsx', sel: '[data-testid="win-sansset"]', counts: 'window', flags: ['SANSSET'] },
  days: { name: 'the Calendar', frame: 'ui/DaysWindow.tsx', sel: '[data-testid="win-days"]', counts: 'window', flags: ['DAYSWIN'] },
  everywd: { name: 'Every Monday', frame: 'ui/EveryWeekday.tsx', sel: '[data-testid="win-every"]', counts: 'window' },
  holiday: { name: 'a holiday', frame: 'ui/HolidaysPanel.tsx', sel: '[data-testid="win-holiday"]', counts: 'window' },
  oilday: { name: 'the OIL list', frame: 'ui/OilDayList.tsx', sel: '[data-testid="win-oilday"]', counts: 'window', flags: ['OILLIST'] },
  lwday: { name: 'the Leave War\'s day panel', frame: 'leavewar/ui/DayPanel.tsx', sel: '[data-testid="win-lwday"]', counts: 'closes', close: closeDayPanel },
}
const floatRows: GuardRow[] = (Object.keys(FLOAT_WHERE) as FloatId[]).map(id => ({ id, where: FLOAT_WHERE[id], open: () => winUp(id), ...FLOAT_ROW[id] }))

/* a 'no' row: it never counts, whatever its open() says — kept so the list is whole (§3.2 (d), (i), (k)) */
const no = (id: GuardRowId, name: string, frame: string, why: string, open: () => boolean = () => false, flags?: string[]): GuardRow =>
  ({ id, name, frame, where: 'any', open, sel: '', counts: 'no', why, ...(flags ? { flags } : {}) })
const H13 = 'H13 — typing in no window: group B, after Build 1 (D2636)'

export const GUARD_ROWS: readonly GuardRow[] = [
  ...floatRows,
  /* (b) the two older movable windows: each closes by itself (D2596), as a pick and the view switch close it today */
  { id: 'avail', name: 'ALL AVAIL', frame: 'ui/AvailWindow.tsx', where: 'any', open: availDrawn, sel: '.availwin', counts: 'closes', flags: ['AVAILWIN'], close: closeAvailWin },
  { id: 'chg', name: 'Changes', frame: 'ui/ChangesWindow.tsx', where: 'any', open: chgDrawn, sel: '.chgwin', counts: 'closes', flags: ['CHGWIN'], close: closeChanges },
  /* (c) the schedule's veiled dialogs — shaded, so only a door reached by the keys meets them */
  { id: 'inputdlg', name: 'the Input window', frame: 'ui/InputWindow.tsx', where: 'any', open: inputDlgDrawn, sel: '#inpEditPop', counts: 'window', flags: ['INPEDIT'] },
  { id: 'insights', name: 'Insights', frame: 'ui/Modals.tsx', where: 'any', open: insightsDrawn, sel: '#insightModal', counts: 'closes', flags: ['INSIGHTS'], close: () => { setInsights(false); notify() } },
  { id: 'dutytpl', name: 'Duty templates', frame: 'ui/DutyTplModal.tsx', where: 'any', open: dutyTplDrawn, sel: '#tplModal', counts: 'window', flags: ['TPLEDIT'] },
  { id: 'wavetpl', name: 'Flying waves', frame: 'ui/WaveTplModal.tsx', where: 'any', open: waveTplDrawn, sel: '#waveTplModal', counts: 'window', flags: ['WAVEEDIT'] },
  { id: 'daytpl', name: 'Day templates', frame: 'ui/DayTplModal.tsx', where: 'any', open: dayTplDrawn, sel: '#daytplModal', counts: 'window', flags: ['DAYTPLEDIT'] },
  { id: 'drafts', name: 'Plans', frame: 'ui/DraftsModal.tsx', where: 'editsched', open: draftsDrawn, sel: '#draftsModal', counts: 'window', flags: ['DRAFTSEDIT'] },
  /* the board's two: told on his page's A3, with either up "there is nothing to press and nothing to decide" */
  { id: 'cxdlg', name: 'the cancel reason', frame: 'ui/SchedBoard.tsx', where: 'any', open: cxDrawn, sel: '#cxPop', counts: 'window' },
  { id: 'sortall', name: 'Sort all', frame: 'ui/SchedBoard.tsx', where: 'any', open: sortAllDrawn, sel: '#sortAllPop', counts: 'window' },
  /* (d) the four that leave the bar free: any press on the bar but Undo and Redo closes them first (ui/barfree.ts), so
     by the time a door's own handler runs they are shut (D2627 A1) */
  no('airpop', 'Traffic', 'ui/Modals.tsx', 'closes itself at the press on the bar, as today (D2627 A1; ui/barfree.ts)', () => AIRKEY != null, ['AIRKEY']),
  no('daypop', 'Day details', 'ui/Modals.tsx', 'closes itself at the press on the bar, as today (D2627 A1; ui/barfree.ts)', () => DAYPOP != null, ['DAYPOP']),
  no('weekcal', 'Jump to a date', 'ui/WeekCal.tsx', 'closes itself at the press on the bar, as today (D2627 A1; ui/barfree.ts)', () => !!WEEKCAL, ['WEEKCAL']),
  no('docview', 'the document viewer', 'ui/DocViewer.tsx', 'closes itself at the press on the bar, as today (D2627 A1; ui/barfree.ts)', () => !!DOCVIEW, ['DOCVIEW']),
  /* (e) the question sheets that are windows of their own (the others stand over a window already counted) */
  { id: 'medmove', name: 'the medical question', frame: 'ui/MedMoveConfirm.tsx', where: 'any', open: medMoveDrawn, sel: '[data-testid="medclash"], .upconf-pop', counts: 'window', flags: ['MEDMOVE'] },
  { id: 'oilwait', name: 'the OIL question', frame: 'ui/OilWaitSheet.tsx', where: 'any', open: oilWaitDrawn, sel: '[data-testid="oilconf"]', counts: 'window', flags: ['OILWAIT'] },
  /* (f) the Leave War: one row in K1a, every sheet refusing — the show-only mark and its row `lwshow` (his D2740) are
     K1b's, with leavewar/ui/Sheet.tsx */
  { id: 'lwsheet', name: 'a Leave War window', frame: 'leavewar/ui/Sheet.tsx', where: 'leavewar', open: warWindowOpen, sel: '.bidsheet', counts: 'window' },
  /* (i) lists, menus and modes */
  no('belllist', 'the bell\'s list', 'ui/topbits.tsx', 'a list — a press outside closes it', () => BELLLIST, ['BELLLIST']),
  no('sqnlist', 'the Schedules list', 'ui/SquadronMenu.tsx', 'a list — the component\'s own state; the pick is pressed in it'),
  no('drawer', 'the ☰ menu', 'ui/Drawer.tsx', 'a menu — the squadron list inside it is a door', () => DRAWER, ['DRAWER']),
  no('insmenu', 'the Schedule Insights menu', 'ui/Shell.tsx', 'a menu — a press outside closes it'),
  no('boardmenus', 'the board\'s small menus', 'ui/board.ts', 'menus (.wavemenu, .stmenu, #sbMoreMenu) — a press outside closes them'),
  no('datecal', 'a date box\'s calendar', 'ui/DateBox.tsx', 'a picker — a press outside closes it'),
  no('medcal', 'the Medical page\'s "as of" calendar', 'ui/MedicalView.tsx', 'a picker — a press outside closes it'),
  no('icpick', 'the Add-people picker', 'ui/InputsCal.tsx', 'a picker inside the Inputs calendar\'s day, counted with that day'),
  no('board', 'the Scheduler Board', 'ui/SchedBoard.tsx', 'not a window (D2627 A3): its own bell and ✓ Done are its doors', () => SBDAY != null, ['SBDAY']),
  no('oilearn', 'OIL Earn', 'ui/SchedBoard.tsx', 'a mode — it lives only on the board', () => OILDAY != null, ['OILDAY']),
  no('arm', 'an armed slot', 'ui/board.ts', 'a mode — a pick drops it, as today', () => ARM != null, ['ARM']),
  no('restarm', 'an armed "Discard N edits & load"', 'ui/board.ts', 'a two-tap control, armed — no window', () => RESTARM != null, ['RESTARM']),
  no('unpubarm', 'an armed Withdraw', 'ui/board.ts', 'a two-tap control, armed — no window', () => UNPUBARM != null, ['UNPUBARM']),
  /* the two edit modes end at a pick (D2627 A4 — §18.1): their end() is K1b's */
  no('lgedit', 'Logic\'s edit mode', 'ui/LogicPage.tsx', 'a mode — every change in it is saved as made; its end at a pick is K1b\'s (D2627 A4)', () => !!LGEDIT, ['LGEDIT']),
  no('qedit', 'Edit quals', 'ui/QualsPage.tsx', 'a mode, the page\'s own state — every change saved as made; its end at a pick is K1b\'s (D2627 A4)'),
  no('secdef', 'the "Set as default?" bar', 'ui/SecDefaultSnackbar.tsx', 'a bar shown for a while — no window', () => SECDEFOFFER != null, ['SECDEFOFFER']),
  no('oilbar', 'the "Not swapped" bar', 'ui/OilWaitSheet.tsx', 'a bar shown for a while — no window', () => !!OILBAR, ['OILBAR']),
  no('welcome', 'the welcome-back card', 'ui/WelcomeBack.tsx', 'a card — it is shown at home only (§18.5)'),
  /* (j) a change not saved: the saver's state 'failed', the band "Not saved" with Retry; it stays 'failed' through a
     Retry in flight. "Not kept" is no row: it never blocks (D2594) */
  { id: 'unsaved', name: 'a change not saved', frame: 'storage/savewait.ts', where: 'any', open: saveRefused, sel: '.savestat.failed', counts: 'unsaved' },
  /* (k) typing in no window — not in Build 1 (H13, group B: D2636) */
  no('daynote', 'a day\'s note', 'ui/board.ts', H13),
  no('helpbug', 'Help\'s bug box', 'ui/HelpPage.tsx', H13),
  no('calnote', 'a calendar\'s "+ Note"', 'ui/InputsCal.tsx', H13),
  no('balfig', 'a Balances figure box', 'leavewar/ui/BalancesPage.tsx', H13),
  no('logicsearch', 'the Logic search box', 'ui/LogicPage.tsx', H13),
  no('qualsfilter', 'the Quals filter box', 'ui/QualsPage.tsx', H13),
]

/* THE ORDER THE ROWS ARE ASKED IN — the first open one names the note. What lies on top first (a question over a window,
   the Calendar's forms ahead of the Calendar and the settings windows — §17 reading 6, his), then the windows, then the
   change not saved, which a window open beside it outranks (A4). */
export const GUARD_ORDER: readonly GuardRowId[] = [
  'medmove', 'oilwait',
  'inputedit', 'inputdlg',
  'holiday', 'everywd', 'days', 'inputsset', 'sansset', 'inputsday', 'oilday',
  'dutytpl', 'wavetpl', 'daytpl', 'drafts', 'cxdlg', 'sortall',
  'lwsheet',
  'avail', 'chg', 'insights', 'sansday', 'lwday',
  'airpop', 'daypop', 'weekcal', 'docview',
  'belllist', 'sqnlist', 'drawer', 'insmenu', 'boardmenus', 'datecal', 'medcal', 'icpick',
  'board', 'oilearn', 'arm', 'restarm', 'unpubarm', 'lgedit', 'qedit', 'secdef', 'oilbar', 'welcome',
  'daynote', 'helpbug', 'calnote', 'balfig', 'logicsearch', 'qualsfilter',
  'unsaved',
]
const BY_ID = new Map(GUARD_ROWS.map(r => [r.id, r]))

/* A ROW ON A PAGE OUT OF REACH DOES NOT COUNT (D2627 A7, §3.3): its page out of sight with a tab leading back to it, it
   refuses and the note says where; its page one the squadron in view no longer offers, nothing could close it, so it
   does not count */
export function rowReachable(row: GuardRow): boolean {
  return row.where === 'any' || row.where === CURPAGE || pageOffered(row.where)
}

/** what refuses a door's press — the first open row, in GUARD_ORDER, that counts and can be reached; `skip` names the
 *  rows a door leaves out (the window it was pressed in). null: nothing open. */
export function whatIsOpen(skip: readonly string[] = []): { reason: 'window' | 'row' | 'unsaved'; row: GuardRow } | null {
  for (const id of GUARD_ORDER) {
    if (skip.includes(id)) continue
    const row = BY_ID.get(id)!
    if (row.counts !== 'window' && row.counts !== 'row' && row.counts !== 'unsaved') continue
    if (!row.open() || !rowReachable(row)) continue
    return { reason: row.counts, row }
  }
  return null
}

/** closes every 'closes' window that is open, each by its own closer — called by a door only once nothing can still
 *  stop its change (§4.2 step 6); a refusal, a Stay and a change he did not make close nothing. (The two edit modes'
 *  end — §18.1 — joins in K1b.) */
export function closeShown(): void {
  for (const id of GUARD_ORDER) {
    const row = BY_ID.get(id)!
    if (row.counts === 'closes' && row.close && row.open()) row.close()
  }
}

/* TYPED WORK THAT LIVES INSIDE A COMPONENT (Admin's rows and forms — no module flag exists; K1b's reports): the id counts
   while `on`, and React's own unmount is the leave, so no way out can miss it */
const WORK = new Map<GuardRowId, number>()
export const workOn = (id: GuardRowId): boolean => (WORK.get(id) ?? 0) > 0
export function useGuardWork(id: GuardRowId, on: boolean): void {
  useEffect(() => {
    if (!on) return
    WORK.set(id, (WORK.get(id) ?? 0) + 1)
    return () => { const n = (WORK.get(id) ?? 1) - 1; if (n > 0) WORK.set(id, n); else WORK.delete(id) }
  }, [id, on])
}
/* THE CLOSER OF A 'closes' WINDOW WHOSE STATE IS ITS COMPONENT'S OWN (the SANS day — ui/SansCal.tsx's dayIso): handed
   over for exactly as long as the component is mounted with it open; the latest closer is used, so it never closes
   over a render that has passed */
export function useGuardCloses(id: GuardRowId, on: boolean, close: () => void): void {
  const ref = useRef(close)
  useLayoutEffect(() => { ref.current = close })
  useEffect(() => {
    if (!on) return
    const f = () => ref.current()
    CLOSERS.set(id, f)
    return () => { if (CLOSERS.get(id) === f) CLOSERS.delete(id) }
  }, [id, on])
}

/* INSTALLED INTO THE SEAM AS THIS FILE LOADS — the doors' one way to ask (no door asks yet: K4–K6) */
export const guardAsk = (_door: string, _to: string, opts: GuardOpts): GuardRefusal | null => {
  const w = whatIsOpen(opts.skip)
  return w ? { reason: w.reason, id: w.row.id, where: w.row.where } : null
}
export const guardCloseShown = (): void => closeShown()
setGuardAsk(guardAsk)
setGuardClose(guardCloseShown)
