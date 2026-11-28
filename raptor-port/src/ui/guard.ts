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

   K1a, the first of three passes of part A: the table for every window whose state is a module's own. K1b, the
   second: the windows and typed work whose state is a component's own — Admin's six rows and forms, the Inputs list's
   OIL question, a holiday sheet read in, Quals' "Add qualification" (each a `useGuardWork` report); the Calendar family
   in his E1 shape (D2654: the Calendar and an unchanged settings window close at the press, a half-done form refuses);
   the two edit modes' end() (D2627 A4, §18.1); the Leave War's two show-only sheets (D2740). K1c, the third: the Tracker's
   windows, read on its bridge (tracker/role.js) from its own table, tracker/app/core.js TRK_WINDOWS. K3: what a refusal
   says — the two tables of words, guardWords, below — read by ui/guardnote.ts, which raises it by the control pressed
   (loaded by the shell, never from here). No door
   asks yet, so the app still behaves as before. Plain modules only — no component is imported, so the test world and
   the test set-ups can load it. */
import { useEffect, useLayoutEffect, useRef } from 'react'
import { setGuardAsk, setGuardClose, warSheetOpen, warShowOpen, closeWarShown, type GuardOpts, type GuardRefusal } from '../state/guard'
import { CURPAGE, SBDAY, OILDAY, ARM, RESTARM, UNPUBARM, SECDEFOFFER, OILBAR } from '../state/view'
import { LGEDIT, setLgEdit } from '../state/auth'
import { pageOffered } from '../state/perms'
import { saveRefused } from '../storage/savewait'
import { closeDayPanel } from '../leavewar/ui/daypanelopen'
import { winUp, winAbove } from './winorder'
import { phoneLayout } from './floatwin'
import { unitById } from '../state/units'
import { availDrawn, chgDrawn, inputDlgDrawn, insightsDrawn, dutyTplDrawn, waveTplDrawn, dayTplDrawn, draftsDrawn, cxDrawn, sortAllDrawn, medMoveDrawn, oilWaitDrawn } from './windrawn'
import { closeAvailWin } from './availopen'
import { closeChanges } from './changesopen'
import { setInsights, setDaysWin, setInpSet, setSansSet, AIRKEY, DAYPOP, WEEKCAL, DOCVIEW, BELLLIST, DRAWER } from './pops'
import { notify } from '../state/store'
import { trackerCover } from '../state/typing-hold'
import { trackerWindowsOpen, trackerAsking, trackerCloseShown } from '../tracker/role.js'

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
  | 'lwsheet' | 'lwshow'
  | 'trk' | 'trkask' | 'trkinfo' | 'trkpop' | 'trkdown' | 'trkfail'
  | 'oilrevise' | 'holimport' | 'qualsnew'
  | 'userrow' | 'archrow' | 'giveaccess' | 'addperson' | 'newsqn' | 'sqnmove' | 'placeedit'
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
  /* a row its component reports (useGuardWork(id, on) — typed work no module flag holds): open() is workOn(id), and the
     roll-call reads that its frame makes that very call (R1) */
  report?: true
  /* E1's shape (his D2654, §3.1): the window refuses only while dirty() — something in it differs from how it opened, or
     a form in it is half done. A 'closes' row with `dirty` is closed by closeShown() while it is not; a 'window' row
     with `dirty` (a form of the Calendar) counts nothing while it is not, and goes with the window that opened it */
  dirty?: () => boolean
  /* a 'closes' row only: while holds() a form of it holds something not saved, so closeShown() leaves it open — that form
     refuses by its own row, and is named first (the Calendar: its two forms and a holiday sheet read in) */
  holds?: () => boolean
  /* a 'no' row only — a mode (§18.1): how closeShown() ends it at a door's last step, a refusal ending nothing */
  end?: () => void
}

/* THE TRACKER'S WINDOWS, READ ON ITS BRIDGE (§3.1 "The Tracker's windows", §3.2 (g) — K1c): the Tracker is a third app
   with its own store that this file may not import (tracker/role.js's head), so tracker/app/core.js hands over what is open
   from its read-only table TRK_WINDOWS. `trk` — a window of it that refuses is open, the page's own cover not up
   (state/typing-hold.ts trackerCover: in the member view, while it holds his unsaved chart edits, nothing of the Tracker
   is shown or can be reached), its question box left out while that box is the unsaved-edits question, which is
   `trkask`'s: drawn over whatever page he is on (TrackerPage.tsx TrkAskOnly), so neither the page nor the cover gates it.
   Each window that only shows things is a row of its own, closed by the bridge's one closer by its id, so R8's list names
   each with his ruling. Exported for the roll-call (R1: a row's open() reads the Tracker's bridge). */
export const trackerWindowUp = (): boolean =>
  !trackerCover() && trackerWindowsOpen().some(w => w.counts === 'window' && !(w.id === 'dlg' && trackerAsking()))
const trkShows = (id: string) => (): boolean => trackerWindowsOpen().some(w => w.id === id)
export const TRACKER_SHOWS = { bubble: trkShows('bubble'), pop: trkShows('pop'), downLog: trkShows('downLog'), failLog: trkShows('failLog') } as const
const trkClose = (id: keyof typeof TRACKER_SHOWS) => (): void => { trackerCloseShown(id) }

/* THE CLOSERS A COMPONENT HANDS OVER, for a 'closes' window whose state is its own (useGuardCloses, below) */
const CLOSERS = new Map<GuardRowId, () => void>()

const FLOAT_ROW: Record<FloatId, Omit<GuardRow, 'id' | 'where' | 'open'>> = {
  inputedit: { name: 'the Input window', frame: 'ui/InputWindow.tsx', sel: '[data-testid="win-inputedit"]', counts: 'window', flags: ['INPEDIT'] },
  /* a day opened on the Inputs calendar stays a plain 'window' row (§3.2 (a)): it is not of the Calendar family E1 shaped */
  inputsday: { name: 'a day on the Inputs calendar', frame: 'ui/InputsCal.tsx', sel: '[data-testid="win-inputsday"]', counts: 'window' },
  sansday: { name: 'a SANS day', frame: 'ui/SansDay.tsx', sel: '[data-testid="win-sansday"]', counts: 'closes', close: () => CLOSERS.get('sansday')?.() },
  /* THE CALENDAR FAMILY IN HIS E1 SHAPE (D2654 — "the Calendar closes at a pick unless a form of it is half done, an
     unchanged settings window beside it closing too"; §3.2 (a)). The two settings windows close by their own setters while
     nothing in them differs from how they opened (their component's report, `dirty`), and refuse once something does; the
     Calendar closes by its own setter while none of its forms and no sheet read in holds something not saved (`holds`) —
     each of those refuses by its own row, named ahead of it (GUARD_ORDER); Every Monday and a holiday refuse once
     something in them is pressed or typed, and otherwise go with the Calendar */
  inputsset: { name: 'Inputs calendar settings', frame: 'ui/InputsSettings.tsx', sel: '[data-testid="win-inputsset"]', counts: 'closes', flags: ['INPSET'], dirty: () => workOn('inputsset'), close: () => { setInpSet(false); notify() } },
  sansset: { name: 'SANS calendar settings', frame: 'ui/SansSettings.tsx', sel: '[data-testid="win-sansset"]', counts: 'closes', flags: ['SANSSET'], dirty: () => workOn('sansset'), close: () => { setSansSet(false); notify() } },
  days: { name: 'the Calendar', frame: 'ui/DaysWindow.tsx', sel: '[data-testid="win-days"]', counts: 'closes', flags: ['DAYSWIN'], holds: () => workOn('holiday') || workOn('everywd') || workOn('holimport'), close: () => { setDaysWin(null); notify() } },
  everywd: { name: 'Every Monday', frame: 'ui/EveryWeekday.tsx', sel: '[data-testid="win-every"]', counts: 'window', dirty: () => workOn('everywd') },
  holiday: { name: 'a holiday', frame: 'ui/HolidaysPanel.tsx', sel: '[data-testid="win-holiday"]', counts: 'window', dirty: () => workOn('holiday') },
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
  /* the OIL question raised from a row of the Inputs list — the page's own state (`oilConf`), no Input window under it */
  { id: 'oilrevise', name: 'the OIL question', frame: 'ui/InputsPage.tsx', where: 'inputs', open: () => workOn('oilrevise'), sel: '[data-testid="oilconf"]', counts: 'window', report: true },
  /* typed work no frame holds (§3.1): a holiday sheet read in and not yet added (the Holidays list's own state, inside
     the Calendar — counted on his E1 answer, a form of the Calendar half done); words in Quals' "Add qualification",
     counted only while the box is drawn — edit mode on — and holds words (D2729 Q2) */
  { id: 'holimport', name: 'a holiday sheet read in', frame: 'ui/HolidaysPanel.tsx', where: 'any', open: () => workOn('holimport'), sel: '[data-testid="hol-preview"]', counts: 'window', report: true },
  { id: 'qualsnew', name: 'the new qualification', frame: 'ui/QualsPage.tsx', where: 'quals', open: () => workOn('qualsnew'), sel: '#qNewQual', counts: 'row', report: true },
  /* (h) Admin's rows and forms — a component's own state, each its own report, counted once anything differs from how it
     opened (D2595, D2598; a squadron's move and a place being edited by the same rule — §3.2 (h)). The Admin page hides
     the section not shown, so a row counts while another section shows (D2627 A6), and unmounts when its tab is left */
  { id: 'userrow', name: 'the open row', frame: 'ui/UsersPanel.tsx', where: 'admin', open: () => workOn('userrow'), sel: '[data-editing]', counts: 'row', report: true },
  { id: 'archrow', name: 'the open row', frame: 'ui/UsersPanel.tsx', where: 'admin', open: () => workOn('archrow'), sel: '[data-restoring]', counts: 'row', report: true },
  { id: 'giveaccess', name: 'Give access', frame: 'ui/UsersPanel.tsx', where: 'admin', open: () => workOn('giveaccess'), sel: '[data-approving]', counts: 'row', report: true },
  /* "Add a person" (K2b — §18.3, D2598): the form under the page's top row, counted while it is open and anything in it
     differs from how a fresh form opens; Cancel and Escape empty it as they fold it, so a fold never hides typing */
  { id: 'addperson', name: 'Add a person', frame: 'ui/UsersPanel.tsx', where: 'admin', open: () => workOn('addperson'), sel: '#accAddBlock', counts: 'row', report: true },
  { id: 'newsqn', name: 'the new squadron', frame: 'ui/SquadronsPanel.tsx', where: 'admin', open: () => workOn('newsqn'), sel: '[data-new-sqn]', counts: 'row', report: true },
  { id: 'sqnmove', name: 'the open row', frame: 'ui/SquadronsPanel.tsx', where: 'admin', open: () => workOn('sqnmove'), sel: '[data-moving]', counts: 'row', report: true },
  { id: 'placeedit', name: 'the open row', frame: 'ui/SquadronsPanel.tsx', where: 'admin', open: () => workOn('placeedit'), sel: '[data-placing]', counts: 'row', report: true },
  /* (f) the Leave War: its one list of open sheets, read two ways (his D2740). Two sheets only show things and close by
     themselves — a leave filed on the Inputs page (the sheet that also reads "OIL the app credited") and an OIL award —
     each opened with the `showOnly` mark; every other sheet ("Open for bidding", a person's window and "OIL TRACKER"
     among them) refuses, as before */
  { id: 'lwsheet', name: 'a Leave War window', frame: 'leavewar/ui/Sheet.tsx', where: 'leavewar', open: warSheetOpen, sel: '.bidsheet', counts: 'window' },
  { id: 'lwshow', name: 'a Leave War window', frame: 'leavewar/ui/Sheet.tsx', where: 'leavewar', open: warShowOpen, sel: '.bidsheet', counts: 'closes', close: closeWarShown },
  /* (g) the Tracker (K1c): its windows that refuse, its unsaved-edits question, and the four that only show things — an
     event's details, the ⓘ bubble (D2597); the marking window (D2654 E2); Down days and Failures, in sight or behind the
     phone's Flow chart tab (D2654 E4). Its modes (Edit chart layout, Details mode, the tools set) are 'no' in its own
     table, never counted here */
  { id: 'trk', name: 'a Tracker window', frame: 'tracker/App.jsx', where: 'tracker', open: trackerWindowUp, sel: '#page-tracker .modal, #trkFlexWin, #showAllPanel, #lullCal, #lullCopy', counts: 'window' },
  { id: 'trkask', name: 'the Tracker\'s question', frame: 'tracker/TrackerPage.tsx', where: 'any', open: trackerAsking, sel: '#dlgModal', counts: 'window' },
  { id: 'trkinfo', name: 'an event\'s details', frame: 'tracker/app/core.js', where: 'tracker', open: TRACKER_SHOWS.bubble, sel: '#detailBubble[style*="display: block"]', counts: 'closes', close: trkClose('bubble') },
  { id: 'trkpop', name: 'the marking window', frame: 'tracker/components/Pop.jsx', where: 'tracker', open: TRACKER_SHOWS.pop, sel: '#pop', counts: 'closes', close: trkClose('pop') },
  { id: 'trkdown', name: 'Down days', frame: 'tracker/components/SidePanel.jsx', where: 'tracker', open: TRACKER_SHOWS.downLog, sel: '#downLog', counts: 'closes', close: trkClose('downLog') },
  { id: 'trkfail', name: 'Failures', frame: 'tracker/components/SidePanel.jsx', where: 'tracker', open: TRACKER_SHOWS.failLog, sel: '#failLog', counts: 'closes', close: trkClose('failLog') },
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
  /* THE TWO EDIT MODES END AT A DOOR'S LAST STEP (D2627 A4 — §18.1): 'no' rows, since every change in either is saved as
     it is made, each carrying the end() closeShown() runs. Logic's is handed over by its page — a value typed and still
     waiting a beat (LogicPage.tsx flushRuleApply) written first, to the squadron it was typed for, then the mode off —
     and, with the page not mounted (LGEDIT outlives it), the mode simply off: nothing can be waiting then. Quals' is the
     page's own state, handed over while the mode is on; it never clears the "Add qualification" words, whose own row
     (`qualsnew`) refuses the press while they stand. Neither says Done's own toast. */
  { ...no('lgedit', 'Logic\'s edit mode', 'ui/LogicPage.tsx', 'a mode — every change in it is saved as made; a door ends it (D2627 A4)', () => !!LGEDIT, ['LGEDIT']), end: () => { const f = CLOSERS.get('lgedit'); if (f) f(); else { setLgEdit(false); notify() } } },
  { ...no('qedit', 'Edit quals', 'ui/QualsPage.tsx', 'a mode, the page\'s own state — every change saved as made; a door ends it (D2627 A4)', () => CLOSERS.has('qedit')), end: () => CLOSERS.get('qedit')?.() },
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

/* THE ORDER THE ROWS ARE ASKED IN — the first open one names the note. What lies on top first (the question sheets; the
   Calendar's forms, a holiday sheet read in among them, ahead of the Calendar and the settings windows — §17 reading 6,
   his, and D2729 Q4: a half-done holiday is named before changed settings), then the windows, then the rows being edited
   (one reason at a time — window, row, Retry: D2627), then the change not saved, which a window open beside it outranks
   (A4). */
export const GUARD_ORDER: readonly GuardRowId[] = [
  'trkask',
  'medmove', 'oilwait', 'oilrevise',
  'inputedit', 'inputdlg',
  'holiday', 'everywd', 'holimport', 'days', 'inputsset', 'sansset', 'inputsday', 'oilday',
  'dutytpl', 'wavetpl', 'daytpl', 'drafts', 'cxdlg', 'sortall',
  'lwsheet', 'trk',
  'avail', 'chg', 'insights', 'sansday', 'lwday', 'lwshow', 'trkinfo', 'trkpop', 'trkdown', 'trkfail',
  'userrow', 'archrow', 'giveaccess', 'addperson', 'newsqn', 'sqnmove', 'placeedit', 'qualsnew',
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
    if (!rowRefuses(row)) continue
    if (!row.open() || !rowReachable(row)) continue
    if (row.dirty && !row.dirty()) continue
    return { reason: row.counts === 'row' || row.counts === 'unsaved' ? row.counts : 'window', row }
  }
  return null
}
/** a row that can refuse a press: a window, a row being edited, a change not saved — or a window that closes by itself
 *  only while nothing in it is changed (E1's `dirty`) */
export const rowRefuses = (row: GuardRow): boolean =>
  row.counts === 'window' || row.counts === 'row' || row.counts === 'unsaved' || (row.counts === 'closes' && !!row.dirty)

/** closes every 'closes' window that is open, each by its own closer — but one changed (`dirty`) or holding a form half
 *  done (`holds`), which refuses instead — and ends the two edit modes (§18.1); called by a door only once nothing can
 *  still stop its change (§4.2 step 6); a refusal, a Stay and a change he did not make close nothing */
export function closeShown(): void {
  for (const id of GUARD_ORDER) {
    const row = BY_ID.get(id)!
    if (row.counts === 'closes' && row.close && row.open() && !row.dirty?.() && !row.holds?.()) row.close()
    else if (row.end && row.open()) row.end()
  }
}

/* TYPED WORK THAT LIVES INSIDE A COMPONENT (Admin's rows and forms — no module flag exists; K1b's reports): the id counts
   while `on`, and React's own unmount is the leave, so no way out can miss it.
   …AND WHAT THE NOTE MUST SAY OF IT (K3 — the third argument, `say`): a short value the reporting component hands over with
   its report, kept beside the count and cleared with it, read by the note's words only (guardLead, below). Exactly two
   components hand one over, each the only place the fact lives: the holiday form ('new' | 'changed' | 'noleave' — a new one
   refused because no leave period covers it and kept waiting) and "Every <weekday>" (the window's own title, "Every
   Tuesday"). Never read from the page's markup. */
const WORK = new Map<GuardRowId, number>()
const SAYS = new Map<GuardRowId, string>()
export const workOn = (id: GuardRowId): boolean => (WORK.get(id) ?? 0) > 0
/** what the component reporting `id` said of it, while it counts */
export const workSay = (id: GuardRowId): string | undefined => (workOn(id) ? SAYS.get(id) : undefined)
export function useGuardWork(id: GuardRowId, on: boolean, say?: string): void {
  useEffect(() => {
    if (!on) return
    WORK.set(id, (WORK.get(id) ?? 0) + 1)
    if (say !== undefined) SAYS.set(id, say)
    return () => { const n = (WORK.get(id) ?? 1) - 1; if (n > 0) WORK.set(id, n); else { WORK.delete(id); SAYS.delete(id) } }
  }, [id, on, say])
}
/* WHICH ADMIN SECTION IS IN SIGHT (the orchestrator's review of K3): his "save or cancel the open row on Users" (D2627 A6)
   is said while a Users row is open and another section shows; since his D2814 (step K3b) the section is named for
   "Add a person" and Give access on Users, and for "+ New squadron", a squadron's row and a place's row on Squadrons, each
   only while its section is not the one showing. The section is the Admin page's own state, which hands each list only
   `shown` (in sight: chosen, and on a phone drilled in), so the list reports it here, in the family of useGuardWork —
   kept while it is mounted, gone with it. Read by the note's words only. */
const SECTIONS = new Map<string, boolean>()
export function useGuardSection(id: 'users' | 'squadrons', shown: boolean): void {
  useEffect(() => {
    SECTIONS.set(id, shown)
    return () => { SECTIONS.delete(id) }
  }, [id, shown])
}
/** Admin → Users is mounted and not the section in sight */
export const usersOutOfSight = (): boolean => SECTIONS.get('users') === false
/** Admin → Squadrons is mounted and not the section in sight (D2814) */
export const squadronsOutOfSight = (): boolean => SECTIONS.get('squadrons') === false

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

/* WHAT THE NOTE SAYS (K3 — the plan §4.6; the words table of docs/superpowers/briefs/2026-11-26-msq-s1-k3-brief.md, which
   replaces §4.6's "Status" column). "Blocked: " + a lead + ", then " + an ending. EVERY WORD BELOW IS HIS RULING'S OR WAS
   SHOWN TO HIM ON A DRAWING (lesson 32: a builder's reading never passes as his rule) — a lead or ending he has not seen is
   never drafted here: a state with no words of its own takes the plain lead, and is listed in the step's report under
   "Words owed". The tests read every lead and ending from these two tables, so a change of words moves no test. */
export const GUARD_LEADS = {
  window: 'close the open window',                                           // D2590
  windowOnLeaveWar: 'close the open window on the Leave War',                // D2627 A7
  windowOnTracker: 'close the open window on the Tracker',                   // D2627 A7
  windowOnTrackerInfo: 'close the open window on the Tracker’s Info tab',    // D2813
  row: 'save or cancel the open row',                                        // D2627 A6
  rowOnUsers: 'save or cancel the open row on Users',                        // D2627 A6
  rowOnSquadrons: 'save or cancel the open row on Squadrons',                // D2814
  giveAccess: 'finish or cancel giving access',                              // D2627 A6
  giveAccessOnUsers: 'finish or cancel giving access on Users',              // D2814
  newSquadron: 'save or cancel the new squadron',                            // D2627 A6
  newSquadronOnSquadrons: 'save or cancel the new squadron on Squadrons',    // D2814
  addPerson: 'add or cancel the new person',                                 // D2655 D1, seen again (D2729)
  addPersonOnUsers: 'add or cancel the new person on Users',                 // D2814
  newQual: 'add or clear the new qualification',                             // D2729 Q2
  holidayNew: 'save or cancel the new holiday',                              // D2729 (the section page, group 4)
  holidayChanged: 'save or cancel the changed holiday',                      // D2729
  holidayNoLeave: 'cancel the new holiday, or create its leave period',      // D2729
  /* the open window's own weekday, in the curly quote marks — "Every Monday", "Every Tuesday" … (D2729) */
  everyWeekday: (title: string): string => `save or cancel “${title}”`,
  sheetHolidays: 'add or cancel the sheet’s holidays',                       // D2729
  inputsSettings: 'save or cancel Inputs calendar settings',                 // D2729 Q3
  inputsSettingsUnderCal: 'close the Calendar, save or cancel Inputs calendar settings',   // D2729 Q3
  sansSettings: 'save or cancel SANS calendar settings',                     // D2741 (card 9)
  sansSettingsUnderCal: 'close the Calendar, save or cancel SANS calendar settings',       // D2741 (card 9)
  retry: 'press Retry to save your changes',                                 // D2627 A13
} as const
export type GuardLeadKey = keyof typeof GUARD_LEADS
/* the ending — what he pressed. Still left open: D2627 A18's "try again." (a card of the OIL list, the page door) and a
   Redo's — neither stands on the section page nor in the sections' words review, so neither is built (the K8 report) */
export const GUARD_ENDINGS = {
  pick: (num: string): string => `pick ${num}.`,                            // D2590
  toMember: 'switch to the member view.',                                    // D2590
  toAdmin: 'switch back to the admin view.',                                 // D2590
  line: 'press this line again.',                                            // D2590
  bell: 'press the bell again.',                                             // D2627 A8
  undo: 'press Undo again.',                                                 // D2729 (the section page, group 5)
} as const
/* THE UNDO ENDING TAKES ONLY THE LEADS THAT ADD NO UNDO STEP (§4.6; the second words review's gap 2a): "save or cancel the
   open row, then press Undo again" is untrue if he saves — the save is the newest step, and Undo then takes back the save,
   not what he pressed Undo for. So with this ending a row's or a form's lead offers its Cancel half alone — each its
   ruled lead with "save or" / "add or" / "finish or" taken off (the sections' words review, kept; "cancel the new
   holiday" drawn on the section page, group 5 — D2729). "close the open window" and the Retry lead join as they are: a
   window closed and a Retry landed add no step (a Retry re-sends the change already made — ui/savestatus-source.ts
   retrySaves). A lead with no Cancel half shown to him takes the plain lead for its kind, and is listed in the K8 report
   for a fresh Fable and his look (guardUndoLead below). */
export const GUARD_UNDO_LEADS = {
  row: 'cancel the open row',                                                // the words review (kept)
  giveAccess: 'cancel giving access',                                        // the words review (kept)
  newSquadron: 'cancel the new squadron',                                    // the words review (kept)
  addPerson: 'cancel the new person',                                        // the words review (kept)
  holidayNew: 'cancel the new holiday',                                      // D2729 (group 5's phone drawing)
} as const
export type GuardDoor = keyof typeof GUARD_ENDINGS

/* THE CONTROLS EACH LEAD NAMES — beside the words, by the selectors the app already has (no new mark on any component):
   on a phone the note never stands over a control its words point to (§4.6's first paragraph; ui/toast.ts placeNote).
   "close the open window" names the window's ✕, which ui/toast.ts NOTE_X already keeps the note off at every place; a
   window on a page out of sight names nothing on screen */
const T = (id: string) => `[data-testid="${id}"]`
const ROW_NAMES: Partial<Record<GuardRowId, string>> = {
  userrow: '#accEdSave, #accEdCancel',
  archrow: '#accArSave, #accArCancel',
  sqnmove: '#sqMoveSave, #sqMoveCancel',
  placeedit: '#plSave, #plCancel',
}
/* (a lead naming the section — D2814 — names the same controls as the plain lead of its state, as "…the open row on Users"
   does through ROW_NAMES: never the section's own button) */
const LEAD_NAMES: Record<Exclude<GuardLeadKey, 'row' | 'rowOnUsers' | 'rowOnSquadrons'>, string> = {
  window: '', windowOnLeaveWar: '', windowOnTracker: '', windowOnTrackerInfo: '',
  giveAccess: '#apvGo, #apvCancel',
  giveAccessOnUsers: '#apvGo, #apvCancel',
  newSquadron: '#sqNewSave, #sqNewCancel',
  newSquadronOnSquadrons: '#sqNewSave, #sqNewCancel',
  addPerson: '#accAdd, #accAddCancel',
  addPersonOnUsers: '#accAdd, #accAddCancel',
  newQual: '#qAddQualBtn',
  holidayNew: `${T('hol-save')}, ${T('hol-save-more')}, ${T('hol-cancel')}`,
  holidayChanged: `${T('hol-save')}, ${T('hol-cancel')}`,
  /* "create its leave period": the waiting form's "Create the 2028 leave period" (or, for a run inside a year,
     "Add a leave period for …") */
  holidayNoLeave: `${T('hol-cancel')}, ${T('hol-wait-create')}, ${T('hol-wait-period')}`,
  everyWeekday: `${T('every-save')}, ${T('every-cancel')}`,
  sheetHolidays: `${T('hol-pv-add')}, ${T('hol-pv-cancel')}`,
  inputsSettings: `${T('iset-save')}, ${T('iset-cancel')}`,
  inputsSettingsUnderCal: `${T('win-days-x')}, ${T('iset-save')}, ${T('iset-cancel')}`,
  sansSettings: `${T('sset-save')}, ${T('sset-cancel')}`,
  sansSettingsUnderCal: `${T('win-days-x')}, ${T('sset-save')}, ${T('sset-cancel')}`,
  retry: '.savestat.failed button',
}

/* "LYING UNDER THE CALENDAR" (D2729 Q3, D2741) is asked of the Calendar's own full-screen rule, never a second width test of
   the guard's: the windows' shell lays every window across the screen on a phone (ui/floatwin.ts phoneLayout — the
   stylesheet's 22-float-windows.css `@media (max-width:620px)`), and the Calendar's month then fills it; the settings window
   is under it when the Calendar was brought forward after it (ui/winorder.ts — the order of the windows up). On a desktop,
   where both stand in sight, never. */
export const calendarOver = (id: 'inputsset' | 'sansset'): boolean => phoneLayout() && winUp('days') && winAbove('days', id)
/* A TRACKER WINDOW BEHIND THE PHONE'S FLOW CHART TAB (his D2654 E4 — the bridge's `behind: 'info'`, K1c). Carried to the
   words: such a window takes his "…on the Tracker’s Info tab" (D2813, his answer to question 19) */
export const trackerBehindInfo = (): boolean =>
  trackerWindowsOpen().some(w => w.counts === 'window' && w.behind === 'info' && !(w.id === 'dlg' && trackerAsking()))

/** what the words read beyond the row — each live by default, handed in by a test to name a state directly */
export type GuardWordsAt = {
  /** the page shown (state/view.ts CURPAGE) */
  page?: string
  /** what the reporting component said of the row (workSay) */
  say?: string
  /** the settings window lies under the Calendar (calendarOver) */
  underCal?: boolean
  /** Admin → Users is not the section shown (usersOutOfSight — the Users list's own report of its `shown`) */
  usersOut?: boolean
  /** Admin → Squadrons is not the section shown (squadronsOutOfSight — the Squadrons list's own report of its `shown`) */
  squadronsOut?: boolean
  /** a Tracker window behind the phone's Flow chart tab (trackerBehindInfo) */
  trkBehindInfo?: boolean
}
const live = (row: GuardRow, at: GuardWordsAt): Required<Omit<GuardWordsAt, 'say'>> & { say?: string } => ({
  page: at.page ?? CURPAGE,
  say: 'say' in at ? at.say : workSay(row.id),
  underCal: at.underCal ?? ((row.id === 'inputsset' || row.id === 'sansset') && calendarOver(row.id)),
  usersOut: at.usersOut ?? ((row.id === 'userrow' || row.id === 'archrow' || row.id === 'addperson' || row.id === 'giveaccess') && usersOutOfSight()),
  squadronsOut: at.squadronsOut ?? ((row.id === 'newsqn' || row.id === 'sqnmove' || row.id === 'placeedit') && squadronsOutOfSight()),
  trkBehindInfo: at.trkBehindInfo ?? (row.id === 'trk' && trackerBehindInfo()),
})
/** which lead a refusing row takes, and the words of it */
export function guardLead(row: GuardRow, at: GuardWordsAt = {}): { key: GuardLeadKey; words: string; names: string } {
  const c = live(row, at)
  const k = (key: GuardLeadKey, words: string = GUARD_LEADS[key] as string, names?: string) =>
    ({ key, words, names: names ?? ROW_NAMES[row.id] ?? (key === 'row' || key === 'rowOnUsers' || key === 'rowOnSquadrons' ? '' : LEAD_NAMES[key]) })
  switch (row.id) {
    case 'unsaved': return k('retry')
    case 'userrow': case 'archrow': return k(c.usersOut ? 'rowOnUsers' : 'row')
    /* Admin's unfinished work with its section not the one showing names the section (D2814); in sight, the plain lead.
       A place's own row takes the open row's words — the words review's reading 1 (a place's row is a row of the
       Squadrons section), not his rule */
    case 'sqnmove': case 'placeedit': return k(c.squadronsOut ? 'rowOnSquadrons' : 'row')
    case 'giveaccess': return k(c.usersOut ? 'giveAccessOnUsers' : 'giveAccess')
    case 'newsqn': return k(c.squadronsOut ? 'newSquadronOnSquadrons' : 'newSquadron')
    case 'addperson': return k(c.usersOut ? 'addPersonOnUsers' : 'addPerson')
    case 'qualsnew': return k('newQual')
    case 'holiday': return k(c.say === 'noleave' ? 'holidayNoLeave' : c.say === 'changed' ? 'holidayChanged' : 'holidayNew')
    /* (the window's own title, as it reports it; "Every Monday" — its first ruled words — only if none was handed over) */
    case 'everywd': return k('everyWeekday', GUARD_LEADS.everyWeekday(c.say || 'Every Monday'))
    case 'holimport': return k('sheetHolidays')
    case 'inputsset': return k(c.underCal ? 'inputsSettingsUnderCal' : 'inputsSettings')
    case 'sansset': return k(c.underCal ? 'sansSettingsUnderCal' : 'sansSettings')
    /* the Tracker's unsaved-edits question is drawn over whatever page he is on — in sight wherever he is: never "on the
       Tracker" (its being called a window is question 21 to him) */
    case 'trkask': return k('window')
  }
  /* a window on a page out of sight (D2627 A7 — §3.3: exactly when the row's page is not the page shown); a Tracker window
     behind its Flow chart tab takes the Info tab's words (D2813) — on another page too, where both are true: they still
     name the Tracker (the orchestrator's reading of D2813, and the words review's, not his rule) */
  if (row.id === 'lwsheet' && row.where !== c.page) return k('windowOnLeaveWar')
  if (row.id === 'trk' && c.trkBehindInfo) return k('windowOnTrackerInfo')
  if (row.id === 'trk' && row.where !== c.page) return k('windowOnTracker')
  /* any other row on a page out of sight has no words of its own: the plain lead (listed under "Words owed") */
  return k(row.counts === 'row' ? 'row' : 'window')
}
/** the lead an Undo's refusal takes: only a lead that adds no Undo step (GUARD_UNDO_LEADS above). By the lead the row
 *  takes for any other press:
 *  - the window's and the Retry lead: as they are;
 *  - a row or a form with its Cancel half shown to him: that half — "…on Users" / "…on Squadrons" (D2814) dropped, since
 *    no Cancel half naming the section was shown (listed);
 *  - "cancel the new holiday, or create its leave period": its Cancel half, the new holiday's shown words (the agent's
 *    reading — creating the leave period would add a step);
 *  - any other: the plain lead for its kind, a window's "close the open window" (closing it adds no step) — listed; the
 *    new qualification, the one row lead with neither a Cancel half nor a window, keeps its own words (listed) */
export function guardUndoLead(row: GuardRow, at: GuardWordsAt = {}): { key: GuardLeadKey | keyof typeof GUARD_UNDO_LEADS; words: string; names: string } {
  const l = guardLead(row, at)
  const u = (key: keyof typeof GUARD_UNDO_LEADS) => ({ key, words: GUARD_UNDO_LEADS[key] as string, names: l.names })
  switch (l.key) {
    case 'window': case 'retry': case 'newQual': return l
    case 'row': case 'rowOnUsers': case 'rowOnSquadrons': return u('row')
    case 'giveAccess': case 'giveAccessOnUsers': return u('giveAccess')
    case 'newSquadron': case 'newSquadronOnSquadrons': return u('newSquadron')
    case 'addPerson': case 'addPersonOnUsers': return u('addPerson')
    case 'holidayNew': case 'holidayNoLeave': return u('holidayNew')
    default: return { key: 'window', words: GUARD_LEADS.window, names: l.names }
  }
}
/** the ending for a door — null for a door with no ruled ending yet (a card, the page door, a Redo: the K8 report) */
export function guardEnding(door: string, to: string): string | null {
  switch (door) {
    case 'pick': { const num = unitById(to)?.num; return num ? GUARD_ENDINGS.pick(String(num)) : null }
    case 'toMember': return GUARD_ENDINGS.toMember
    case 'toAdmin': return GUARD_ENDINGS.toAdmin
    case 'line': return GUARD_ENDINGS.line
    case 'bell': return GUARD_ENDINGS.bell
    case 'undo': return GUARD_ENDINGS.undo
    default: return null
  }
}
/** the whole note: "Blocked: <lead>, then <ending>" — null where the door has no ending of his yet */
/*  (the reason is the row's own — `unsaved` is the Retry row — so the row decides the lead; the reason is taken as the seam
    hands it over, the plan's shape. The Undo's ending takes its own leads — guardUndoLead) */
export function guardWords(_reason: GuardRefusal['reason'], row: GuardRow, door: string, to: string, at: GuardWordsAt = {}): string | null {
  const end = guardEnding(door, to)
  if (!end) return null
  return `Blocked: ${(door === 'undo' ? guardUndoLead(row, at) : guardLead(row, at)).words}, then ${end}`
}
/** a row of the table by its id (the note's way from the seam's refusal back to the row) */
export const guardRow = (id: string): GuardRow | undefined => BY_ID.get(id as GuardRowId)

/* INSTALLED INTO THE SEAM AS THIS FILE LOADS — the doors' one way to ask (no door asks yet: K4–K6) */
export const guardAsk = (_door: string, _to: string, opts: GuardOpts): GuardRefusal | null => {
  const w = whatIsOpen(opts.skip)
  return w ? { reason: w.reason, id: w.row.id, where: w.row.where } : null
}
export const guardCloseShown = (): void => closeShown()
setGuardAsk(guardAsk)
setGuardClose(guardCloseShown)
