/* THE GUARD RAIL'S TEST OPENERS, SHARED (step K3, chat 204 — moved whole out of ui/msq-guard-open.test.tsx, not one
   assertion changed): each window and typed work opened through the app's own opener, so ui/msq-guard-note.test.tsx raises
   each lead of the note from its real state with the very openers part A's tests use — one set, never a second that can
   drift. A test file that uses them calls withThird() itself (R9) and hands guardTeardown to its own afterEach.
   A plain .ts file on purpose (the app drawn by createElement): it exports helpers, never a component, and the code
   check reads a .tsx file as a component file (26 Nov 26). */
import { createElement } from 'react'
import { describe, it, expect, afterEach, vi } from 'vitest'
import { render, act, fireEvent, cleanup } from '@testing-library/react'
import { withThird, third, signInAs, PID, ACCT, moveMan, pastMidnight } from '../test-support/msq-world'
import { App } from './App'
import { INPUTS, inpId } from '../engine/inputs'
import { PEOPLE } from '../engine/people'
import { notify, resetSession, writeInputs } from '../state/store'
import { pageUnit, switchRoleInForce } from '../state/perms'
import { saveAccess } from '../state/accounts'
import { homeOn, todayIso } from '../state/units'
import { CURPAGE, setPage, setInpView, setInpMode, setCalMonth, setAvailWin, AVAILWIN, CHGWIN, setChgWin, setBoardDay, setOilWait } from '../state/view'
import { setInpEdit, setDayPop, setWeekCal, setAirKey, setDocView, setDrawer, setTplEdit, setWaveEdit, setDayTplEdit, setDraftsEdit, setDaysWin, setInpSet, setSansSet, setOilList, setInsights, INSIGHTS, setMedMove, setBellList } from './pops'
import { openChanges } from './changesopen'
import { closeScheduler } from './board'
import { commitChipMove } from './caldrag'
import { openDayPanel, dayPanelDate, closeDayPanel } from '../leavewar/ui/daypanelopen'
import { setStorageKept } from './savestatus-source'
import { watchSaves } from '../storage/savewait'
import { _resetFloatWins } from './winorder'
import { UNIT } from '../engine/unitview'
import { GUARD_ROWS, whatIsOpen, closeShown, guardAsk, guardCloseShown, rowRefuses, workOn, type GuardRow } from './guard'
import { setGuardAsk, setGuardClose } from '../state/guard'
import { DAYSWIN, INPSET, SANSSET } from './pops'
import { LGEDIT, setLgEdit } from '../state/auth'
import { switchRoleView } from '../state/store'
import { requestAccess } from '../state/accounts'
import { archivePerson } from '../leavewar/sync'
import { setDayAward } from '../leavewar/state/store'
import { NEW_PLACE } from './squadrons-model'
import { VCONF, RULE_SPEC, ruleFmt } from '../engine/rules'
import { holidayAdd } from '../leavewar/sync'
import { me } from '../state/perms'
import { HOOKS } from '../engine/hooks'
/* K2b — "Add a person": its date box, and the day the post-in date opens on */
import { boxValue, pickDate } from './datecal-testkit'
import { effectiveToday } from '../state/person-delete'
/* K1c — the Tracker: its engine (the same module the page's lazy chunk loads), its bridge, the guard's view of it */
import * as TRK from '../tracker/app/core.js'
import { endTrackerSession, trackerWindowsOpen, trackerAsking } from '../tracker/role.js'
import { getPeople } from '../tracker/people.js'
import { pageOffered, setTrkUnitProbe } from '../state/perms'
import { trackerCover } from '../state/typing-hold'
import { rowReachable } from './guard'
import { setStorageMaker, storageUnit } from '../tracker/storage.js'
import { Whiteboard } from '../storage/whiteboard'
import { trackerTarget } from '../storage/adapters'
;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

export const C: any = TRK
export const MM = (window as any).matchMedia
/* THE TRACKER WIRED AS THE APP'S BOOT WIRES IT (src/boot.ts): one door per squadron over one whiteboard, bound to his own
   pages' squadron when it first loads, and the commit gate and the pick told which squadron it stands on — so a pick moves
   it, and its unsaved-edits question is asked, exactly as in the app (state/pick.ts movesTrackerAway) */
export const TRK_WB = new Whiteboard()
setStorageMaker((u: string) => trackerTarget(TRK_WB, u), () => pageUnit('own', todayIso()))
export const bootTrkProbe = () => setTrkUnitProbe(() => storageUnit())
bootTrkProbe()

let page: ReturnType<typeof render> | null = null
export async function guardTeardown() {
  /* the Tracker's module state outlives the page: its question answered Stay, its windows and modes ended as a sign-out
     ends them (the session's end), an unsaved chart edit saved so no later pick asks; the phone width put back */
  if (C.dlg) await act(async () => { C.dlgClose(C.dlg.input ? null : false); await Promise.resolve() })
  ;(window as any).matchMedia = MM
  if (C.ready && C.sylDirty) { signInAs('hunter'); await act(async () => { await C.saveChangesClick() }) }
  act(() => { endTrackerSession() })
  if (page) { page.unmount(); page = null }
  cleanup()
  setInpEdit(null); setDrawer(false); setDayPop(null); setWeekCal(false); setAirKey(null); setDocView(null)
  setAvailWin(null); setChgWin(null); setInsights(false); setOilList(null); setDaysWin(null); setInpSet(false); setSansSet(false)
  setTplEdit(false); setWaveEdit(false); setDayTplEdit(false); setDraftsEdit(null); setMedMove(null); setOilWait(null); setBellList(false)
  closeDayPanel(); closeScheduler(); setLgEdit(false)
  setStorageKept(true); watchSaves(null); _resetFloatWins()
  setGuardAsk(guardAsk); setGuardClose(guardCloseShown)
}

export const $ = (sel: string) => document.querySelector(sel) as HTMLElement | null
export const tid = (t: string) => $(`[data-testid="${t}"]`)
export const settle = async () => { await act(async () => { await Promise.resolve(); await Promise.resolve() }) }
export async function press(el: Element | null, what = 'the control') {
  expect(el, `${what} is drawn`).not.toBeNull()
  await act(async () => { fireEvent.pointerDown(el!); fireEvent.mouseDown(el!); fireEvent.mouseUp(el!); fireEvent.click(el!) })
  await settle()
}
/* a tap on a calendar's day: the press and the lift in one moment, then the click a browser sends (inputscal.test.tsx) */
export const ptr = (type: string) => new PointerEvent(type, { bubbles: true, cancelable: true, clientX: 10, clientY: 10, pointerId: 1, pointerType: 'touch', isPrimary: true })
export async function tap(el: Element | null, what: string) {
  expect(el, `${what} is drawn`).not.toBeNull()
  await act(async () => { el!.dispatchEvent(ptr('pointerdown')); el!.dispatchEvent(ptr('pointerup')); el!.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true })) })
  await settle()
}
export async function escape() {
  const at = (document.activeElement as HTMLElement | null) || document.body
  await act(async () => { fireEvent.keyDown(at, { key: 'Escape' }) })
  await settle()
}
export const doing = async (f: () => void) => { await act(async () => { f(); notify() }); await settle() }
export async function app(who: 'hunter' | 'saber' | 'ranger' = 'hunter') {
  signInAs(who)
  page = render(createElement(App))
  await settle()
}
export async function topPick(u: string) {
  await press($('#sqnMenuBtn'), 'the top bar\'s squadron button')
  await press($(`#sqnMenu .sqm-row[data-unit="${u}"]`), `the row of ${u}`)
}
export const row = (id: string): GuardRow => { const r = GUARD_ROWS.find(x => x.id === id); expect(r, `the row ${id}`).toBeTruthy(); return r! }
export const named = (): string | null => whatIsOpen()?.row.id ?? null
/* an input of the squadron his Inputs page shows */
export const ownInput = () => INPUTS.find((r: any) => r.person && (PEOPLE as any)[r.person] && homeOn(String(r.person), todayIso()) === pageUnit('own')) as any
export const rosterMan = (): string => Object.keys(PEOPLE).find(id => { const p = (PEOPLE as any)[id]; return !p.special && !p.archived && homeOn(id, todayIso()) === pageUnit('own') })!
/* a box is DRAWN: on the page, neither it nor anything round it hidden */
export const drawnBox = (sel: string): boolean => [...document.querySelectorAll(sel)].some(el => !el.closest('[hidden]'))

export async function goLeaveWar() {
  await doing(() => setPage('leavewar'))
  await vi.waitFor(() => expect(tid('settings-open'), 'the Leave War has downloaded').not.toBeNull(), { timeout: 15000, interval: 20 })
  await settle()
}
/* THE LEAVE WAR'S TWO SHOW-ONLY SHEETS (his D2740), each opened by its own door — Ranger's tap (a member: an admin's tap on
   a held day opens the bid window, so more can be added — D1548) on a day not open for him: another man's leave filed on
   the Inputs page ("Leave filed on the Inputs page"), and his own OIL award ("Your OIL award") */
export async function warAsRanger() {
  /* (jsdom draws no layout: the grid's press timer asks where the finger is, as doubletap-windows.test.tsx stubs it) */
  if (!(document as any).elementFromPoint) (document as any).elementFromPoint = () => null
  signInAs('ranger')
  await doing(() => setPage('leavewar'))
  await vi.waitFor(() => expect(document.querySelector('[data-testid^="cell-"]'), 'the Leave War has downloaded').not.toBeNull(), { timeout: 15000, interval: 20 })
  await settle()
}
export async function openLeaveFiled() {
  const who = Object.keys(PEOPLE).find(id => { const p = (PEOPLE as any)[id]; return !p.special && !p.archived && id !== PID.ranger && homeOn(id, todayIso()) === 'u142' })!
  const x: any = { remarks: '', mod: '2026-07-01', yr: 2026, allday: true, s: 0, e: 1439, person: who, type: 'LL', date: 'Jul 20' }
  inpId(x); writeInputs(() => { INPUTS.unshift(x) })
  await warAsRanger()
  await press(tid(`cell-${who}-2026-07-20`), 'the leave\'s day on the grid')
  expect(tid('raptor-sheet'), 'the premise: "Leave filed on the Inputs page" is up').not.toBeNull()
}
export async function openOwnAward() {
  signInAs('hunter'); expect(setDayAward(PID.ranger, '2026-07-21', 1, { note: 'Recall', givenBy: 'OC Ops' })).toBeNull()
  await warAsRanger()
  await press(tid(`cell-${PID.ranger}-2026-07-21`), 'his award\'s day on the grid')
  expect(tid('award-sheet'), 'the premise: "Your OIL award" is up').not.toBeNull()
}
export async function goInputsCal(mode: 'member' | 'sans') {
  await doing(() => { setPage('inputs'); setInpView('cal'); setInpMode(mode); setCalMonth({ y: 2026, m: 7 }) })
}
export async function openBoard() { await doing(() => { setPage('editsched'); setBoardDay(0) }) }
/* a medical moved by the calendar's drag onto another medical — the app's own door (ui/caldrag.ts commitChipMove) puts the
   question up instead of writing it (medmove.test.tsx's world) */
export async function medicalClash() {
  const who = rosterMan()
  const plant = (r: any) => { const x: any = { remarks: '', mod: '2026-07-01', yr: 2026, allday: true, s: 0, e: 1439, person: who, ...r }; inpId(x); writeInputs(() => { INPUTS.unshift(x) }); return x }
  plant({ type: 'HL', date: 'Jul 20', endDate: 'Jul 24' })
  const c = plant({ type: 'ATT C', date: 'Jul 27', endDate: 'Jul 28' })
  await doing(() => { commitChipMove({ kind: 'input', iid: c.iid } as any, '2026-07-27', '2026-07-24') })
}
/* the saver's own state, handed over as main.tsx hands the app's postman over (storage/savewait.ts watchSaves) */
export const saver = { status: 'idle' as string }

/* ---- K1b's openers: a box typed in, Admin's sections, the Inputs list's OIL question, a holiday sheet read in ---- */
export async function typeIn(sel: string, value: string) {
  expect($(sel), `${sel} is drawn`).not.toBeNull()
  await act(async () => { fireEvent.change($(sel)!, { target: { value } }) })
  await settle()
}
/* a man of the page's squadron with a sign-in, never the one signed in (his own row does not open) */
export const otherMan = (): string => Object.keys(PEOPLE).find(id => { const p = (PEOPLE as any)[id]; return !p.special && !p.archived && id !== me() && homeOn(id, todayIso()) === pageUnit('own') && !!document.querySelector(`[data-person="${id}"] .acc-tap:not([disabled])`) })!
export async function goAdmin(cat: 'Users' | 'Squadrons' = 'Users') {
  await doing(() => setPage('admin'))
  await press([...document.querySelectorAll('.adm-cat')].find(b => b.textContent?.startsWith(cat)) || null, `Admin's ${cat}`)
}
export async function openUserRow() {
  await goAdmin()
  await press($(`[data-person="${otherMan()}"]:not([data-archived]) .acc-tap`), 'a man\'s row on Admin → Users')
}
export async function openArchRow() {
  /* (the first roster man the archive takes: on 149 the first may be its last admin, whom it refuses) */
  signInAs('hunter')
  const pid = Object.keys(PEOPLE).find(id => { const p = (PEOPLE as any)[id]; return !p.special && !p.archived && homeOn(id, todayIso()) === pageUnit('own') && archivePerson(id).bad === null })
  expect(pid, 'a roster man archived').toBeTruthy()
  await goAdmin()
  await press($('#accArchToggle'), 'Archived')
  await press($(`#accArchList [data-person="${pid}"] .acc-tap`), 'the archived man\'s row')
}
export async function openGiveAccess() {
  signInAs('newface@mail'); expect(requestAccess({ cs: 'Newface', ini: 'NF', seat: 'FCP', cat: 'C' }, pageUnit('own'))).toBeNull()
  signInAs('hunter'); await doing(() => {})
  await goAdmin()
  await press($('[data-approve]'), 'Give access')
}
/* K2b — "Add a person" opened by its own button in the page's top row, then a callsign typed */
export async function openAddForm() {
  await goAdmin()
  await press($('#accAddOpen'), '+ Add a person')
  expect($('#accAddBlock'), 'the premise: the form is open').not.toBeNull()
}
export async function openAddPerson() { await openAddForm(); await typeIn('#accAddCs', 'Nova') }
export async function asSaber() { signInAs('saber'); await doing(() => {}) }
/* the desktop List's "OIL" chip on an answered weekend Duty — the page's own question, no Input window under it */
export async function openOilRevise() {
  const x: any = { remarks: '', mod: '2026-07-01', yr: 2026, allday: true, s: 0, e: 1439, person: rosterMan(), type: 'Duty', date: 'Jul 18', oil: { '2026-07-18': 1 } }
  inpId(x); writeInputs(() => { INPUTS.unshift(x) })
  await doing(() => { setPage('inputs'); setInpView('table'); setInpMode('member') })
  await press($('[data-oilrev]'), 'the row\'s OIL chip')
}
export const SHEET = 'From,To,Name,Kind\r\n2026-05-04,,Sheet day A,PH\r\n2026-05-05,,Sheet day B,PH'
export async function readSheet(text = SHEET) {
  const f = new File([text], 'holidays-2026.csv', { type: 'text/csv' })
  await act(async () => { fireEvent.change(tid('hol-import-file')!, { target: { files: [f] } }) })
  await vi.waitFor(() => expect(tid('hol-preview'), 'the sheet is read').not.toBeNull(), { timeout: 5000, interval: 10 })
  await settle()
}
export async function openHolImport() { await doing(() => setDaysWin('2026-05-01')); await readSheet() }
/* K3 — a new holiday no leave period covers, Save pressed: refused and kept waiting (moved whole out of A16's test of it,
   ui/msq-guard-open.test.tsx, which now calls it; its premise and its assertion stay in that test) */
export async function openHolidayNoLeave() {
  /* (2031: a year nothing in the demo world reaches — holidayspanel.test.tsx's FREE; the holiday calendar is walked to
     its month by its arrows, and a day is picked by tapping it twice, as that file's goTo() and pick() do) */
  await doing(() => setDaysWin('2031-03-01'))
  await press(tid('hol-add'), 'Add a holiday')
  await typeIn('[data-testid="hol-name"]', 'Far day')
  const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
  const calAt = () => { const [m, y] = tid('holcal-title')!.querySelector('.dcal-my')!.textContent!.trim().split(/\s+/); return +y * 12 + MONTHS.indexOf(m.toLowerCase()) }
  for (let d = 2031 * 12 + 2 - calAt(); d !== 0; d += d > 0 ? -1 : 1) await press(tid(d > 0 ? 'holcal-next' : 'holcal-prev'), 'the calendar\'s arrow')
  await press(tid('holcal-day-2031-03-09'), 'a day on its calendar')
  await press(tid('holcal-day-2031-03-09'), 'the same day again')
  await press(tid('hol-save'), 'Save')
}
/* K3 — a holiday already on the year's list, opened from it and its name changed (the form's "Change a holiday") */
export async function openHolidayChanged() {
  await doing(() => setDaysWin('2026-07-01'))
  await press($('[data-testid="hol-list"] .hol-line'), 'a holiday on the year\'s list')
  expect(tid('win-holiday'), 'the premise: "Change a holiday" is up').not.toBeNull()
  await typeIn('[data-testid="hol-name"]', 'Renamed day')
}
export async function openQualsNew(words = 'LOW LEVEL') {
  await doing(() => setPage('quals'))
  await press($('#qEdit'), 'Quals\' ✎ Edit')
  await press($('#qEditQuals'), 'Edit quals')
  await typeIn('#qNewQual', words)
}

/* ---- K1c's openers: the Tracker (its page downloaded and drawn, then each window by the function its own control calls) ---- */
export async function goTracker() {
  await doing(() => setPage('tracker'))
  await vi.waitFor(() => expect(C.ready && !!document.querySelector('#page-tracker #board'), 'the Tracker has downloaded and drawn its chart').toBe(true), { timeout: 20000, interval: 20 })
  await settle()
}
export const trkDo = async (f: () => unknown) => { await act(async () => { f() }); await settle() }
export const ev0 = (): string => C.SYL[0].id
/* an unsaved chart edit: a new event in Edit chart layout, the editor left (tracker/msq-trk-follows-pick.test.tsx's) */
let edits = 0
export async function chartEdit() {
  await act(async () => {
    if (!C.arrangeMode) C.toggleArrange()
    const p = C.addModule('acad')
    await vi.waitFor(() => expect(C.dlg, 'the new event\'s name is asked').toBeTruthy(), { timeout: 5000, interval: 5 })
    C.dlgClose('K1CEV' + (++edits)); await p
    C.toggleArrange()
  })
  await settle()
  expect(C.sylDirty, 'the premise: an unsaved chart edit').toBe(true)
}
/* THE UNSAVED-EDITS QUESTION RAISED BY A PICK WHILE ANOTHER PAGE SHOWS (core.js onBeforeTrackerSwitch): drawn over that page */
export async function openTrkAsk() {
  await goTracker()
  await chartEdit()
  await doing(() => setPage('inputs'))
  await topPick(UNIT === 'u149' ? 'u142' : 'u149')
  await vi.waitFor(() => expect(C.dlg?.msg, 'the premise: the question is asked').toContain('Save them before switching'), { timeout: 5000, interval: 10 })
  await settle()
}
/* a student on the course who is a man on the roster (Down days count only for one — core.js downDaysOf), added once by
   "+ Add" with a roster pick, as trk-down-days.test.tsx adds one; his course start is today, so the window opens */
export async function linkedStudent(): Promise<string> {
  const have = C.roster.find((r: any) => r.pid)
  if (have) return have.id
  const free = getPeople().find((p: any) => !C.roster.some((r: any) => r.pid === p.id))
  if (!free) throw new Error('no person left to enrol on the Tracker')
  const pid = free.id
  await act(async () => {
    const p = C.addStudent()
    await vi.waitFor(() => expect(C.dlg, '"+ Add" is up').toBeTruthy(), { timeout: 5000, interval: 5 })
    C.dlgClose({ pick: pid }); await p
  })
  await settle()
  const s = C.roster.find((r: any) => r.pid === pid)
  expect(s, 'the premise: a roster man added to the course').toBeTruthy()
  return s.id
}
/* each window state of the Tracker's own table (core.js TRK_WINDOWS), opened by what its control calls */
export const TRK_OPENERS: Record<string, () => Promise<void>> = {
  dlg: () => trkDo(() => { void C.addCourse() }),
  pop: () => trkDo(() => C.openPop(ev0(), { clientX: 5, clientY: 5 })),
  bubble: () => trkDo(() => C.showEventBubble(ev0(), $('#board'))),
  infoId: async () => { await trkDo(() => C.openPop(ev0(), { clientX: 5, clientY: 5 })); await press($('#popEditInfo'), 'the marking window\'s ✎ Edit details') },
  editId: () => trkDo(() => C.openEdit(ev0())),
  sylModalOpen: () => trkDo(() => C.openModal()),
  ordMode: () => trkDo(() => C.openOrdCrew()),
  copyOpen: () => trkDo(() => { void C.openCopy() }),
  flexWinOpen: () => press($('#flexBtn'), 'the flex settings gear'),
  showAllOpen: () => press($('#showAllTab'), 'Show All'),
  downLog: async () => { const s = await linkedStudent(); await trkDo(() => C.openDownLog(s)) },
  failLog: () => trkDo(() => C.openFailLog(C.active)),
  lullPick: () => trkDo(() => C.openLullPicker(C.active)),
  lullCopy: () => trkDo(() => C.openLullCopy(C.active)),
}
/* the phone layout: the stylesheet's own width (tracker.css `@media(max-width:1050px)`), as the browser answers it */
export function phoneWidth() {
  ;(window as any).matchMedia = (q: string) => ({ matches: /max-width:\s*1050px/.test(q), media: q, onchange: null, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, dispatchEvent: () => false })
}
export const trkOpen = (id: string) => trackerWindowsOpen().find((w: any) => w.id === id) ?? null

/* `under`: the window a row is opened FROM, which stays up when it closes — Every Monday and a holiday open from the
   Calendar, so after either closes the Calendar is what counts, never nothing */
export type Opener = { open: () => Promise<void>; outs: Record<string, () => Promise<void>>; under?: string }
export const x = (t: string) => () => press(tid(t), t)
export const sel = (s: string) => () => press($(s), s)
/* EVERY ROW THAT COUNTS — its opener and each of its ways out (A2: a row with no entry here fails) */
export const OPEN: Record<string, Opener> = {
  inputedit: {
    open: async () => { await doing(() => { setPage('inputs'); setInpView('table'); setInpEdit(ownInput()) }) },
    outs: { '✕': x('win-inputedit-x'), Cancel: sel('#inpEditCancel'), Escape: escape },
  },
  inputsday: {
    open: async () => { await goInputsCal('member'); await tap($('[data-icday="2026-07-15"]'), 'the 15th on the Inputs calendar') },
    outs: { '✕': x('win-inputsday-x'), Escape: escape },
  },
  /* THE CALENDAR FAMILY ON HIS E1 ANSWER (D2654 — K1b): the settings windows and the Calendar's two forms count only once
     something in them is changed, so each opener changes one thing; the Calendar itself only closes (A3, A16) */
  inputsset: {
    open: async () => { await goInputsCal('member'); await doing(() => setInpSet(true)); await press(tid('iset-memberfile'), 'Members may file duties for others') },
    outs: { '✕': x('win-inputsset-x'), Cancel: x('iset-cancel'), Save: x('iset-save'), Escape: escape },
  },
  sansset: {
    open: async () => { await goInputsCal('sans'); await doing(() => setSansSet(true)); await typeIn('[data-testid="sset-yellow"]', '2') },
    outs: { '✕': x('win-sansset-x'), Cancel: x('sset-cancel'), Save: x('sset-save'), Escape: escape },
  },
  everywd: {
    open: async () => { await doing(() => setDaysWin('2026-07-01')); await press(tid('days-wd-0'), 'Every Monday…'); await press(tid('every-cls-day'), 'Day') },
    outs: { '✕': x('win-every-x'), Cancel: x('every-cancel'), Escape: escape },
  },
  holiday: {
    open: async () => { await doing(() => setDaysWin('2026-07-01')); await press(tid('hol-add'), 'Add a holiday'); await typeIn('[data-testid="hol-name"]', 'Founders') },
    outs: { '✕': x('win-holiday-x'), Cancel: x('hol-cancel'), Escape: escape },
  },
  holimport: {
    open: openHolImport,
    outs: { Cancel: x('hol-pv-cancel'), 'the Calendar\'s ✕': x('win-days-x') },
  },
  oilrevise: {
    open: openOilRevise,
    /* (Save waits greyed until an answer is picked: the first answer pressed, then Save) */
    outs: { Cancel: x('oilconf-cancel'), Save: async () => { await press($('.oilconf-answers .upconf-seg'), 'an answer'); await x('oilconf-save')() }, Escape: escape, 'the tab left': async () => { await doing(() => setPage('viewsched')) } },
  },
  qualsnew: {
    open: () => openQualsNew(),
    outs: {
      Add: sel('#qAddQualBtn'),
      Enter: async () => { await act(async () => { fireEvent.keyDown($('#qNewQual')!, { key: 'Enter' }) }); await settle() },
      'the box cleared': () => typeIn('#qNewQual', ''),
    },
  },
  /* ADMIN'S ROWS AND FORMS (D2595, D2598): each opened, then one thing changed */
  userrow: {
    open: async () => { await openUserRow(); await typeIn('#accEdName, #accGiveName', 'someone.else@mail') },
    outs: { Cancel: sel('#accEdCancel'), Escape: escape, 'a second tap on the name': sel('.od-row-on .acc-tap'), Save: sel('#accEdSave') },
  },
  archrow: {
    open: async () => { await openArchRow(); await typeIn('#accArCs', 'Zed') },
    outs: { Cancel: sel('#accArCancel'), Escape: escape },
  },
  giveaccess: {
    open: async () => { await openGiveAccess(); await typeIn('#apvRole', 'admin') },
    outs: { Cancel: sel('#apvCancel'), 'put back as it was': () => typeIn('#apvRole', 'main') },
  },
  newsqn: {
    open: async () => { await asSaber(); await goAdmin('Squadrons'); await press($('#sqNew'), '+ New squadron'); await typeIn('#sqNewNum', '151') },
    outs: { Cancel: sel('#sqNewCancel') },
  },
  sqnmove: {
    open: async () => { await goAdmin('Squadrons'); await press($('#sqList [data-unit="u142"] .acc-tap'), '142\'s row'); await typeIn('#sqPlace', NEW_PLACE) },
    outs: { Cancel: sel('#sqMoveCancel'), Escape: escape },
  },
  placeedit: {
    open: async () => { await asSaber(); await goAdmin('Squadrons'); await press($('#sqPlaces [data-place] .acc-tap'), 'the place\'s row'); await typeIn('#plName', 'Home base two') },
    outs: { Cancel: sel('#plCancel'), Escape: escape },
  },
  /* K2b — "Add a person" (§18.3): opened by its button, a callsign typed; every way out empties it or puts it back */
  addperson: {
    open: openAddPerson,
    outs: {
      Cancel: sel('#accAddCancel'),
      Escape: escape,
      'put back as it opened': () => typeIn('#accAddCs', ''),
      'an add that lands': async () => { await typeIn('#accAddSeat', 'FCP'); await typeIn('#accAddCat', 'B'); await press($('#accAdd'), 'Add person') },
    },
  },
  oilday: {
    open: async () => { await doing(() => setOilList({ from: '2026-07-18', to: '2026-07-18', name: 'Holiday' })) },
    outs: { '✕': x('win-oilday-x'), 'Close or Later': async () => press(tid('odl-close') || tid('odl-later'), 'Close or Later'), Escape: escape },
  },
  inputdlg: {
    open: async () => { await doing(() => { setPage('editsched'); setInpEdit(ownInput()) }) },
    outs: { '✕': sel('#inpEditClose'), Cancel: sel('#inpEditCancel'), Escape: escape },
  },
  dutytpl: {
    open: async () => { await doing(() => { setPage('editsched'); setTplEdit(true) }) },
    outs: { '✕': sel('#tplClose'), Escape: escape },
  },
  wavetpl: {
    open: async () => { await doing(() => { setPage('editsched'); setWaveEdit(true) }) },
    outs: { '✕': sel('#waveTplClose'), Escape: escape },
  },
  daytpl: {
    open: async () => { await doing(() => { setPage('editsched'); setDayTplEdit(true) }) },
    outs: { '✕': sel('#daytplClose'), Escape: escape },
  },
  drafts: {
    open: async () => { await doing(() => { setPage('editsched'); setDraftsEdit({ di: 0 }) }) },
    outs: { '✕': sel('#draftsClose'), Escape: escape },
  },
  cxdlg: {
    open: async () => { await openBoard(); await press($('#sbBoard [data-lcx="0.0.0.0"]'), 'the board\'s CX on its first line') },
    outs: { '✕': sel('#cxPop .x'), Escape: escape },
  },
  sortall: {
    open: async () => { await openBoard(); await press($('#sbSortAll'), 'Sort all') },
    outs: { '✕': sel('#sortAllClose'), Cancel: sel('#sortAllCancel'), Escape: escape },
  },
  medmove: {
    open: medicalClash,
    outs: { '✕': sel('[data-testid="medclash"] .x'), Cancel: async () => press([...document.querySelectorAll('[data-testid="medclash"] button')].find(b => b.textContent === 'Cancel') || null, 'Cancel'), Escape: escape },
  },
  oilwait: {
    /* the question a weekend change raises before it is written: set by the door (state/view.ts setOilWait) */
    open: async () => {
      await doing(() => setOilWait({ kind: 'add', lead: 'Earn OIL for this?', gate: { who: 'Viper', typeLabel: 'Training', plan: [{ iso: '2026-07-18', amt: 1 }], prev: {} }, redo: () => 'none', ask: () => 'none', places: [] }))
    },
    outs: { Cancel: x('oilconf-cancel'), Escape: escape },
  },
  lwsheet: {
    open: async () => { await goLeaveWar(); await press(tid('settings-open'), 'the Leave War\'s gear') },
    outs: { '✕': x('settings-close'), Escape: escape },
  },
  unsaved: {
    open: async () => { saver.status = 'failed'; await doing(() => watchSaves(saver as any)) },
    outs: { 'Retry landed': async () => { saver.status = 'idle'; await doing(() => {}) } },
  },
  /* K1c, the Tracker: a window of it that refuses (Show All — the reading: never put to him singly), and the unsaved-edits
     question raised by a pick over another page */
  trk: {
    open: async () => { await goTracker(); await press($('#showAllTab'), 'Show All') },
    outs: { Close: sel('#saClose'), Escape: escape, 'a press on its shade': sel('#saOverlay') },
  },
  trkask: {
    open: openTrkAsk,
    outs: { Stay: sel('#dlgCancel'), Escape: escape },
  },
}
