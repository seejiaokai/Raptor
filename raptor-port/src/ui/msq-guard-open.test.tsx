// @vitest-environment jsdom
/* PART A'S OWN TESTS — ONE ANSWER TO "WHAT IS OPEN" (the guard rail's plan,
   docs/superpowers/plans/2026-11-25-msq-pick-guard-build1.md §3.5; K1a, the first of three passes, chat 198).

   Each window is opened through the app's own opener — the press, or the function the app's own button calls — and
   drawn by its own component (the whole app, ui/App.tsx), never by writing a module flag by hand. The rows of this pass
   are those whose state is a module's own; a row of K1b or K1c is named in TO_COME below, with the test that owes it.
   No door asks the guard yet: A14 and A15 are pins, green on today's code (nothing calls the seam), named so.

   The world: three squadrons (test-support/msq-world.ts withThird — his D2630). Hunter, 142's admin with Plan of 149
   and View of 150, is the one who opens the windows; Wed 15 Jul 26, 09:00. */
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
;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

withThird()

/* what a later pass owes this file (the brief's TO_COME): each test and row, with the pass that owes it */
export const TO_COME: { what: string; pass: 'K1c' | 'K2b' }[] = [
  { what: 'A6\'s "Add a person" half (the form\'s report, addperson)', pass: 'K2b' },
  { what: 'A7\'s Tracker half (a Tracker window behind another tab, then the Tracker no longer offered)', pass: 'K1c' },
  { what: 'A8, A11, A13 — the Tracker (trk, trkask, trkinfo; the bridge\'s behind mark)', pass: 'K1c' },
  { what: 'A14\'s and A15\'s chart-editor and Tracker-details halves', pass: 'K1c' },
]

let page: ReturnType<typeof render> | null = null
afterEach(() => {
  if (page) { page.unmount(); page = null }
  cleanup()
  setInpEdit(null); setDrawer(false); setDayPop(null); setWeekCal(false); setAirKey(null); setDocView(null)
  setAvailWin(null); setChgWin(null); setInsights(false); setOilList(null); setDaysWin(null); setInpSet(false); setSansSet(false)
  setTplEdit(false); setWaveEdit(false); setDayTplEdit(false); setDraftsEdit(null); setMedMove(null); setOilWait(null); setBellList(false)
  closeDayPanel(); closeScheduler(); setLgEdit(false)
  setStorageKept(true); watchSaves(null); _resetFloatWins()
  setGuardAsk(guardAsk); setGuardClose(guardCloseShown)
})

const $ = (sel: string) => document.querySelector(sel) as HTMLElement | null
const tid = (t: string) => $(`[data-testid="${t}"]`)
const settle = async () => { await act(async () => { await Promise.resolve(); await Promise.resolve() }) }
async function press(el: Element | null, what = 'the control') {
  expect(el, `${what} is drawn`).not.toBeNull()
  await act(async () => { fireEvent.pointerDown(el!); fireEvent.mouseDown(el!); fireEvent.mouseUp(el!); fireEvent.click(el!) })
  await settle()
}
/* a tap on a calendar's day: the press and the lift in one moment, then the click a browser sends (inputscal.test.tsx) */
const ptr = (type: string) => new PointerEvent(type, { bubbles: true, cancelable: true, clientX: 10, clientY: 10, pointerId: 1, pointerType: 'touch', isPrimary: true })
async function tap(el: Element | null, what: string) {
  expect(el, `${what} is drawn`).not.toBeNull()
  await act(async () => { el!.dispatchEvent(ptr('pointerdown')); el!.dispatchEvent(ptr('pointerup')); el!.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true })) })
  await settle()
}
async function escape() {
  const at = (document.activeElement as HTMLElement | null) || document.body
  await act(async () => { fireEvent.keyDown(at, { key: 'Escape' }) })
  await settle()
}
const doing = async (f: () => void) => { await act(async () => { f(); notify() }); await settle() }
async function app(who: 'hunter' | 'saber' | 'ranger' = 'hunter') {
  signInAs(who)
  page = render(<App />)
  await settle()
}
async function topPick(u: string) {
  await press($('#sqnMenuBtn'), 'the top bar\'s squadron button')
  await press($(`#sqnMenu .sqm-row[data-unit="${u}"]`), `the row of ${u}`)
}
const row = (id: string): GuardRow => { const r = GUARD_ROWS.find(x => x.id === id); expect(r, `the row ${id}`).toBeTruthy(); return r! }
const named = (): string | null => whatIsOpen()?.row.id ?? null
/* an input of the squadron his Inputs page shows */
const ownInput = () => INPUTS.find((r: any) => r.person && (PEOPLE as any)[r.person] && homeOn(String(r.person), todayIso()) === pageUnit('own')) as any
const rosterMan = (): string => Object.keys(PEOPLE).find(id => { const p = (PEOPLE as any)[id]; return !p.special && !p.archived && homeOn(id, todayIso()) === pageUnit('own') })!
/* a box is DRAWN: on the page, neither it nor anything round it hidden */
const drawnBox = (sel: string): boolean => [...document.querySelectorAll(sel)].some(el => !el.closest('[hidden]'))

async function goLeaveWar() {
  await doing(() => setPage('leavewar'))
  await vi.waitFor(() => expect(tid('settings-open'), 'the Leave War has downloaded').not.toBeNull(), { timeout: 15000, interval: 20 })
  await settle()
}
/* THE LEAVE WAR'S TWO SHOW-ONLY SHEETS (his D2740), each opened by its own door — Ranger's tap (a member: an admin's tap on
   a held day opens the bid window, so more can be added — D1548) on a day not open for him: another man's leave filed on
   the Inputs page ("Leave filed on the Inputs page"), and his own OIL award ("Your OIL award") */
async function warAsRanger() {
  /* (jsdom draws no layout: the grid's press timer asks where the finger is, as doubletap-windows.test.tsx stubs it) */
  if (!(document as any).elementFromPoint) (document as any).elementFromPoint = () => null
  signInAs('ranger')
  await doing(() => setPage('leavewar'))
  await vi.waitFor(() => expect(document.querySelector('[data-testid^="cell-"]'), 'the Leave War has downloaded').not.toBeNull(), { timeout: 15000, interval: 20 })
  await settle()
}
async function openLeaveFiled() {
  const who = Object.keys(PEOPLE).find(id => { const p = (PEOPLE as any)[id]; return !p.special && !p.archived && id !== PID.ranger && homeOn(id, todayIso()) === 'u142' })!
  const x: any = { remarks: '', mod: '2026-07-01', yr: 2026, allday: true, s: 0, e: 1439, person: who, type: 'LL', date: 'Jul 20' }
  inpId(x); writeInputs(() => { INPUTS.unshift(x) })
  await warAsRanger()
  await press(tid(`cell-${who}-2026-07-20`), 'the leave\'s day on the grid')
  expect(tid('raptor-sheet'), 'the premise: "Leave filed on the Inputs page" is up').not.toBeNull()
}
async function openOwnAward() {
  signInAs('hunter'); expect(setDayAward(PID.ranger, '2026-07-21', 1, { note: 'Recall', givenBy: 'OC Ops' })).toBeNull()
  await warAsRanger()
  await press(tid(`cell-${PID.ranger}-2026-07-21`), 'his award\'s day on the grid')
  expect(tid('award-sheet'), 'the premise: "Your OIL award" is up').not.toBeNull()
}
async function goInputsCal(mode: 'member' | 'sans') {
  await doing(() => { setPage('inputs'); setInpView('cal'); setInpMode(mode); setCalMonth({ y: 2026, m: 7 }) })
}
async function openBoard() { await doing(() => { setPage('editsched'); setBoardDay(0) }) }
/* a medical moved by the calendar's drag onto another medical — the app's own door (ui/caldrag.ts commitChipMove) puts the
   question up instead of writing it (medmove.test.tsx's world) */
async function medicalClash() {
  const who = rosterMan()
  const plant = (r: any) => { const x: any = { remarks: '', mod: '2026-07-01', yr: 2026, allday: true, s: 0, e: 1439, person: who, ...r }; inpId(x); writeInputs(() => { INPUTS.unshift(x) }); return x }
  plant({ type: 'HL', date: 'Jul 20', endDate: 'Jul 24' })
  const c = plant({ type: 'ATT C', date: 'Jul 27', endDate: 'Jul 28' })
  await doing(() => { commitChipMove({ kind: 'input', iid: c.iid } as any, '2026-07-27', '2026-07-24') })
}
/* the saver's own state, handed over as main.tsx hands the app's postman over (storage/savewait.ts watchSaves) */
const saver = { status: 'idle' as string }

/* ---- K1b's openers: a box typed in, Admin's sections, the Inputs list's OIL question, a holiday sheet read in ---- */
async function typeIn(sel: string, value: string) {
  expect($(sel), `${sel} is drawn`).not.toBeNull()
  await act(async () => { fireEvent.change($(sel)!, { target: { value } }) })
  await settle()
}
/* a man of the page's squadron with a sign-in, never the one signed in (his own row does not open) */
const otherMan = (): string => Object.keys(PEOPLE).find(id => { const p = (PEOPLE as any)[id]; return !p.special && !p.archived && id !== me() && homeOn(id, todayIso()) === pageUnit('own') && !!document.querySelector(`[data-person="${id}"] .acc-tap:not([disabled])`) })!
async function goAdmin(cat: 'Users' | 'Squadrons' = 'Users') {
  await doing(() => setPage('admin'))
  await press([...document.querySelectorAll('.adm-cat')].find(b => b.textContent?.startsWith(cat)) || null, `Admin's ${cat}`)
}
async function openUserRow() {
  await goAdmin()
  await press($(`[data-person="${otherMan()}"]:not([data-archived]) .acc-tap`), 'a man\'s row on Admin → Users')
}
async function openArchRow() {
  /* (the first roster man the archive takes: on 149 the first may be its last admin, whom it refuses) */
  signInAs('hunter')
  const pid = Object.keys(PEOPLE).find(id => { const p = (PEOPLE as any)[id]; return !p.special && !p.archived && homeOn(id, todayIso()) === pageUnit('own') && archivePerson(id).bad === null })
  expect(pid, 'a roster man archived').toBeTruthy()
  await goAdmin()
  await press($('#accArchToggle'), 'Archived')
  await press($(`#accArchList [data-person="${pid}"] .acc-tap`), 'the archived man\'s row')
}
async function openGiveAccess() {
  signInAs('newface@mail'); expect(requestAccess({ cs: 'Newface', ini: 'NF', seat: 'FCP', cat: 'C' }, pageUnit('own'))).toBeNull()
  signInAs('hunter'); await doing(() => {})
  await goAdmin()
  await press($('[data-approve]'), 'Give access')
}
async function asSaber() { signInAs('saber'); await doing(() => {}) }
/* the desktop List's "OIL" chip on an answered weekend Duty — the page's own question, no Input window under it */
async function openOilRevise() {
  const x: any = { remarks: '', mod: '2026-07-01', yr: 2026, allday: true, s: 0, e: 1439, person: rosterMan(), type: 'Duty', date: 'Jul 18', oil: { '2026-07-18': 1 } }
  inpId(x); writeInputs(() => { INPUTS.unshift(x) })
  await doing(() => { setPage('inputs'); setInpView('table'); setInpMode('member') })
  await press($('[data-oilrev]'), 'the row\'s OIL chip')
}
const SHEET = 'From,To,Name,Kind\r\n2026-05-04,,Sheet day A,PH\r\n2026-05-05,,Sheet day B,PH'
async function readSheet(text = SHEET) {
  const f = new File([text], 'holidays-2026.csv', { type: 'text/csv' })
  await act(async () => { fireEvent.change(tid('hol-import-file')!, { target: { files: [f] } }) })
  await vi.waitFor(() => expect(tid('hol-preview'), 'the sheet is read').not.toBeNull(), { timeout: 5000, interval: 10 })
  await settle()
}
async function openHolImport() { await doing(() => setDaysWin('2026-05-01')); await readSheet() }
async function openQualsNew(words = 'LOW LEVEL') {
  await doing(() => setPage('quals'))
  await press($('#qEdit'), 'Quals\' ✎ Edit')
  await press($('#qEditQuals'), 'Edit quals')
  await typeIn('#qNewQual', words)
}

/* `under`: the window a row is opened FROM, which stays up when it closes — Every Monday and a holiday open from the
   Calendar, so after either closes the Calendar is what counts, never nothing */
type Opener = { open: () => Promise<void>; outs: Record<string, () => Promise<void>>; under?: string }
const x = (t: string) => () => press(tid(t), t)
const sel = (s: string) => () => press($(s), s)
/* EVERY ROW THAT COUNTS — its opener and each of its ways out (A2: a row with no entry here fails) */
const OPEN: Record<string, Opener> = {
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
}

describe('A1 — nothing open', () => {
  it('an admin at home', async () => { await app('hunter'); expect(whatIsOpen()).toBeNull() })
  it('an admin by Plan on 149', async () => { await app('hunter'); await topPick('u149'); expect(UNIT).toBe('u149'); expect(whatIsOpen()).toBeNull() })
  it('a master admin', async () => { await app('saber'); expect(whatIsOpen()).toBeNull() })
  it('a member with View, on 149', async () => { await app('ranger'); await topPick('u149'); expect(UNIT).toBe('u149'); expect(whatIsOpen()).toBeNull() })
})

describe('A2 — every row that counts is seen, and gone when it closes', () => {
  /* (every row that can refuse — a window, a row, a change not saved, and since K1b a window that refuses only once changed) */
  const counting = GUARD_ROWS.filter(rowRefuses)
  it('every counting row has its opener and its ways out here (a row with no entry fails)', () => {
    expect(counting.filter(r => !OPEN[r.id]).map(r => r.id)).toEqual([])
    expect(counting.filter(r => OPEN[r.id] && !Object.keys(OPEN[r.id]!.outs).length).map(r => r.id), 'each row has a way out').toEqual([])
  })
  for (const r of counting) {
    const o = OPEN[r.id]
    if (!o) continue
    for (const [how, out] of Object.entries(o.outs)) {
      it(`${r.id} — opened, it is named; ${how} → nothing open`, async () => {
        await app('hunter')
        await o.open()
        expect(named(), `${r.id} opened`).toBe(r.id)
        await out()
        expect(named(), `${r.id} after ${how}`).toBe(o.under ?? null)
      })
    }
  }
})

describe('A3 — what does not count, and what closes', () => {
  /* the "no" rows whose state is a module's own, each opened by what the app calls (the lists, menus and modes held in a
     component's own state, and H13's typing, are "no" rows too — nothing of them can be named) */
  const NO_OPEN: Record<string, () => Promise<void>> = {
    daypop: async () => { await doing(() => { setPage('viewsched'); setDayPop(0) }) },
    weekcal: async () => { await doing(() => { setPage('viewsched'); setWeekCal('view') }) },
    docview: async () => { await doing(() => setDocView({ row: { person: rosterMan(), type: 'OML', date: 'Jul 10' }, up: false })) },
    belllist: async () => { await press($('#notifyBell'), 'the bell') },
    drawer: async () => { await doing(() => setDrawer(true)) },
    board: async () => { await openBoard() },
    lgedit: async () => { await doing(() => setPage('logic')); await press($('#lgEdit'), 'Logic\'s ✎ Edit') },
    qedit: async () => { await doing(() => setPage('quals')); await press($('#qEdit'), 'Quals\' ✎ Edit') },
  }
  for (const [id, open] of Object.entries(NO_OPEN)) {
    it(`"${id}" (a "no" row) opened → nothing open`, async () => {
      expect(row(id).counts).toBe('no')
      await app('hunter')
      await open()
      expect(whatIsOpen()).toBeNull()
    })
  }
  it('every "no" row carries its reason', () => {
    for (const r of GUARD_ROWS.filter(x => x.counts === 'no')) expect(r.why, r.id).toBeTruthy()
  })

  const avail = () => setAvailWin({ di: 0, item: 'x', ver: '', name: 'x', when: '', tab: 'who' } as any)
  /* each "closes" row: opened by its door, its box, and how to read that it is closed */
  const SHOWN: Record<string, { open: () => Promise<void>; box: string; shut: () => boolean }> = {
    avail: { open: async () => { await doing(() => { setPage('editsched'); avail() }) }, box: '.availwin', shut: () => !AVAILWIN },
    chg: { open: async () => { await doing(() => { setPage('editsched'); openChanges('week', 'all') }) }, box: '.chgwin', shut: () => !CHGWIN },
    insights: { open: async () => { await doing(() => setInsights(true)) }, box: '#insightModal', shut: () => !INSIGHTS },
    sansday: { open: async () => { await goInputsCal('sans'); await tap(tid('sc-day-2026-07-15'), 'the 15th on the SANS calendar') }, box: '[data-testid="win-sansday"]', shut: () => !tid('win-sansday') },
    lwday: { open: async () => { await goLeaveWar(); await doing(() => openDayPanel('2026-07-15')) }, box: '[data-testid="win-lwday"]', shut: () => dayPanelDate() === null },
    /* K1b, on his answers: the Calendar and the two settings windows with nothing changed (D2654 E1); the two Leave War
       sheets that only show things, each opened by its own door (D2740) */
    days: { open: async () => { await doing(() => setDaysWin('2026-07-01')) }, box: '[data-testid="win-days"]', shut: () => !DAYSWIN },
    inputsset: { open: async () => { await goInputsCal('member'); await doing(() => setInpSet(true)) }, box: '[data-testid="win-inputsset"]', shut: () => !INPSET },
    sansset: { open: async () => { await goInputsCal('sans'); await doing(() => setSansSet(true)) }, box: '[data-testid="win-sansset"]', shut: () => !SANSSET },
    lwshow: { open: openLeaveFiled, box: '[data-testid="raptor-sheet"]', shut: () => !tid('raptor-sheet') },
  }
  it('every "closes" row has its opener here', () => {
    expect(GUARD_ROWS.filter(r => r.counts === 'closes' && !SHOWN[r.id]).map(r => r.id)).toEqual([])
  })
  for (const [id, s] of Object.entries(SHOWN)) {
    it(`${id} — opened, it is never named; closeShown() closes it by its own closer, its box gone`, async () => {
      expect(row(id).counts).toBe('closes')
      await app('hunter')
      await s.open()
      expect(drawnBox(s.box), `the premise: ${id} is drawn`).toBe(true)
      expect(row(id).open(), `${id}'s row reads it open`).toBe(true)
      expect(whatIsOpen(), 'a window that only shows things never refuses').toBeNull()
      await act(async () => { closeShown() })
      await settle()
      expect(s.shut(), `${id} closed`).toBe(true)
      expect(drawnBox(s.box), `${id}'s box gone`).toBe(false)
      expect(row(id).open()).toBe(false)
    })
  }
  it('closeShown() closes the show-only windows and leaves an Input window beside them as it was', async () => {
    await app('hunter')
    const inp = ownInput()
    await doing(() => { setPage('editsched'); avail(); openChanges('week', 'all'); setInsights(true); setInpEdit(inp) })
    expect(named(), 'the Input dialog is what counts').toBe('inputdlg')
    await act(async () => { closeShown() })
    await settle()
    expect([!!AVAILWIN, !!CHGWIN, INSIGHTS]).toEqual([false, false, false])
    expect(named(), 'the Input dialog stays').toBe('inputdlg')
    expect(drawnBox('#inpEditPop')).toBe(true)
  })
  it('Changes folded to its bar (the phone\'s "Hide"): closed the same', async () => {
    await app('hunter')
    await doing(() => { setPage('editsched'); openChanges('week', 'all') })
    await doing(() => setChgWin({ ...CHGWIN!, bar: true } as any))
    expect(row('chg').open()).toBe(true)
    await act(async () => { closeShown() })
    expect(CHGWIN).toBeNull()
  })
  it('with nothing open closeShown() does nothing', async () => {
    await app('hunter')
    await act(async () => { closeShown() })
    expect(whatIsOpen()).toBeNull()
  })
})

describe('A3 (K1b) — the Leave War\'s two show-only sheets, and the two edit modes\' end', () => {
  for (const [name, open, box] of [['Leave filed on the Inputs page', openLeaveFiled, 'raptor-sheet'], ['Your OIL award', openOwnAward, 'award-sheet']] as const) {
    it(`"${name}", opened by its own door: never named; closeShown() closes it by its own closer`, async () => {
      await app('hunter')
      await open()
      expect(row('lwshow').open() && !row('lwsheet').open(), 'the premise: the show-only row reads it, the refusing row does not').toBe(true)
      expect(whatIsOpen(), 'a sheet that only shows things never refuses (D2740)').toBeNull()
      await act(async () => { closeShown() })
      await settle()
      expect(tid(box), 'closed').toBeNull()
      expect(row('lwshow').open()).toBe(false)
    })
  }
  it('an unmarked sheet beside a show-only one: the unmarked one is named, and closeShown() leaves it as it was', async () => {
    await app('hunter')
    await openLeaveFiled()
    await press(tid(`person-${PID.ranger}`), 'his own name on the grid')
    expect(tid('person-window') && tid('raptor-sheet'), 'the premise: both up').toBeTruthy()
    expect(named()).toBe('lwsheet')
    await act(async () => { closeShown() })
    await settle()
    expect(tid('raptor-sheet'), 'the show-only sheet closed').toBeNull()
    expect(tid('person-window'), 'his window as it was').not.toBeNull()
    expect(named()).toBe('lwsheet')
  })
  it('closeShown() ends Logic\'s edit mode, a value still waiting its beat written first, to the squadron it was typed for', async () => {
    await app('hunter')
    await doing(() => setPage('logic'))
    await press($('#lgEdit'), 'Logic\'s ✎ Edit')
    const box = $('input[data-lgset]') as HTMLInputElement
    expect(box, 'a setting\'s box').not.toBeNull()
    const k = box.dataset.lgset!
    const spec = RULE_SPEC[k]!, was = VCONF[k]
    const want = was === spec.hi ? spec.lo : spec.hi
    /* typed and left (its change raised), then a door's last step in the same moment — before its beat */
    vi.mocked(HOOKS.toast).mockClear()
    act(() => { box.value = ruleFmt(k, want); fireEvent.change(box); expect(VCONF[k], 'the premise: still waiting').toBe(was); closeShown()
      /* §18.1: at a door the squadron changes straight after closeShown(), so the value must be written NOW — the page's
         own late write (a timer, a beat later) would land on the squadron picked */
      expect(VCONF[k], 'written at once, before any timer').toBe(want) })
    await settle()
    expect(VCONF[k], 'written before the mode ended').toBe(want)
    expect(!!LGEDIT, 'the mode off').toBe(false)
    expect($('#lgEdit')?.hidden, '✎ Edit back').toBe(false)
    expect(HOOKS.toast, 'nothing said: Logic\'s Done says nothing, and a door ending the mode neither').not.toHaveBeenCalled()
  })
  it('closeShown() ends Quals\' edit mode — editing, Edit quals and an armed ✕ — and never says "Quals saved"', async () => {
    await app('hunter')
    await doing(() => setPage('quals'))
    await press($('#qEdit'), 'Quals\' ✎ Edit')
    await press($('#qEditQuals'), 'Edit quals')
    expect(row('qedit').open(), 'the premise: the mode handed over').toBe(true)
    await act(async () => { closeShown() })
    await settle()
    expect($('#qEdit')?.hidden, '✎ Edit back').toBe(false)
    expect($('#qSave')?.hidden, 'no Done').toBe(true)
    expect($('#qQualBar'), 'Edit quals off').toBeNull()
    expect(row('qedit').open()).toBe(false)
    expect(HOOKS.toast).not.toHaveBeenCalledWith('Quals saved')
  })
  it('with neither mode on, closeShown() ends nothing', async () => {
    await app('hunter')
    await doing(() => setPage('logic'))
    await act(async () => { closeShown() })
    expect(!!LGEDIT).toBe(false)
  })
})

describe('A6 — a Users row, and Admin\'s other forms (D2595, D2598)', () => {
  it('a man\'s row: opened → nothing; a letter typed in Sign-in → row; put back → nothing', async () => {
    await app('hunter')
    await openUserRow()
    expect(whatIsOpen(), 'opened, nothing changed').toBeNull()
    const box = $('#accEdName, #accGiveName') as HTMLInputElement
    const was = box.value
    await typeIn('#accEdName, #accGiveName', was + 'x')
    expect(whatIsOpen()).toMatchObject({ reason: 'row', row: { id: 'userrow' } })
    await typeIn('#accEdName, #accGiveName', was)
    expect(whatIsOpen(), 'put back as it was').toBeNull()
  })
  it('the Role changed alone → row; put back → nothing', async () => {
    await app('hunter')
    await openUserRow()
    const role = $('#accEdRole, #accGiveRole') as HTMLSelectElement
    const was = role.value
    await typeIn('#accEdRole, #accGiveRole', was === 'admin' ? 'main' : 'admin')
    expect(named()).toBe('userrow')
    await typeIn('#accEdRole, #accGiveRole', was)
    expect(named()).toBeNull()
  })
  it('a squadron\'s line changed alone → row', async () => {
    await app('hunter')
    await openUserRow()
    const line = [...document.querySelectorAll<HTMLButtonElement>('.od-row-on [data-line]')].find(b => !b.disabled && b.getAttribute('aria-pressed') !== 'true')
    expect(line, 'the premise: a line he may change').toBeTruthy()
    await press(line!, 'a squadron\'s line')
    expect(named()).toBe('userrow')
  })
  it('changed, then another Admin section shown: still the row (D2627 A6); then the Inputs tab: nothing (the page unmounts)', async () => {
    await app('hunter')
    await openUserRow()
    await typeIn('#accEdName, #accGiveName', 'someone.else@mail')
    await press([...document.querySelectorAll('.adm-cat')].find(b => b.textContent?.startsWith('Squadrons')) || null, 'Squadrons')
    expect(named(), 'the section hidden, not removed').toBe('userrow')
    await doing(() => setPage('inputs'))
    expect(whatIsOpen()).toBeNull()
  })
  it('an archived man\'s row: opened → nothing; the callsign changed → row; the post-in date moved → row', async () => {
    await app('hunter')
    await openArchRow()
    expect(whatIsOpen()).toBeNull()
    await typeIn('#accArCs', 'Zed')
    expect(named()).toBe('archrow')
    await press($('#accArCancel'), 'Cancel')
    expect(whatIsOpen()).toBeNull()
  })
  it('Give access: opened, nothing changed → nothing; a word typed → row', async () => {
    await app('hunter')
    await openGiveAccess()
    expect(whatIsOpen()).toBeNull()
    await typeIn('#apvRole', 'admin')
    expect(named()).toBe('giveaccess')
  })
  it('"+ New squadron": opened, nothing in it → nothing; a number typed → row', async () => {
    await app('hunter')
    await asSaber()
    await goAdmin('Squadrons')
    await press($('#sqNew'), '+ New squadron')
    expect(whatIsOpen()).toBeNull()
    await typeIn('#sqNewNum', '151')
    expect(named()).toBe('newsqn')
    await typeIn('#sqNewNum', '')
    expect(whatIsOpen(), 'emptied again').toBeNull()
  })
  it('a squadron\'s move and a place being edited (a reading — §3.2 (h)): opened → nothing; a change → row', async () => {
    await app('hunter')
    await asSaber()
    await goAdmin('Squadrons')
    await press($('#sqList [data-unit="u142"] .acc-tap'), '142\'s row')
    expect(whatIsOpen()).toBeNull()
    await typeIn('#sqPlace', NEW_PLACE)
    expect(named()).toBe('sqnmove')
    await press($('#sqMoveCancel'), 'Cancel')
    await press($('#sqPlaces [data-place] .acc-tap'), 'the place\'s row')
    expect(whatIsOpen()).toBeNull()
    await typeIn('#plName', 'Home base two')
    expect(named()).toBe('placeedit')
  })
})

describe('A7 (the Leave War\'s half) — a window on a page out of sight', () => {
  it('pin — a person\'s window behind the Inputs tab: the war\'s row still answers, its tab offered; his Plan of 149 lowered to View: taken home to 142, the window still refuses', async () => {
    await app('hunter')
    await topPick('u149')
    await goLeaveWar()
    await press(document.querySelector(`[data-testid^="person-"]:not([data-testid="person-window"])`), 'a name on the grid')
    expect(tid('person-window'), 'the premise: his window is up').not.toBeNull()
    await doing(() => setPage('inputs'))
    expect(whatIsOpen()).toMatchObject({ reason: 'window', row: { id: 'lwsheet', where: 'leavewar' } })
    signInAs('saber'); expect(saveAccess(ACCT.hunter, { grants: { u149: 'view' } })).toBeNull(); signInAs('hunter')
    await doing(() => {})
    /* (today a Plan lowered while he is on that squadron takes him home — K0's finding, pinned at K0 — so the plan's "149 now
       offers View-only Sched and Help alone" cannot be reached here: he is on 142, whose Leave War he may open, and the
       window left up behind the Inputs tab still refuses (D2627: "unless the squadron picked no longer offers it" — it does).
       Pinned as today's behaviour; the difference is named in K1b's report) */
    expect({ unit: UNIT, open: whatIsOpen()?.row.id ?? null, sheet: !!tid('person-window') }).toEqual({ unit: 'u142', open: 'lwsheet', sheet: true })
  })
  it('pin — a person\'s window on his own Leave War, then a squadron he only views picked by today\'s door: TODAY the window stays up and still refuses (not the plan\'s "no longer offered, nothing open")', async () => {
    /* (Hunter holds View of 150 in withThird(). No door asks the guard yet, so today's pick goes through with the window
       up. The plan expected 150 to offer View-only Sched and Help alone (D2381), the war's window then out of reach and
       uncounted (D2627 "unless the squadron picked no longer offers it"). Today the window stays up and the lwsheet row
       still answers — pinned as it is, a difference named in K1b's report, not bent.
       K4 RE-POINTS THIS: the pick will then be refused with the window open, and the state stays reachable only by a
       change he did not make — his right lowered, his move — which this pin will then be rewritten to use) */
    await app('hunter')
    await goLeaveWar()
    await press(document.querySelector(`[data-testid^="person-"]:not([data-testid="person-window"])`), 'a name on the grid')
    expect(tid('person-window'), 'the premise: his window is up').not.toBeNull()
    expect(named()).toBe('lwsheet')
    await topPick(third.u150)
    expect({ unit: UNIT, sheetOpen: row('lwsheet').open(), drawn: !!tid('person-window'), page: CURPAGE, open: whatIsOpen()?.row.id ?? null })
      .toEqual({ unit: third.u150, sheetOpen: true, drawn: true, page: 'leavewar', open: 'lwsheet' })
  })
  it('pin — the day panel left open behind the Inputs tab: never counted (D2597)', async () => {
    await app('hunter')
    await goLeaveWar()
    await doing(() => openDayPanel('2026-07-15'))
    await doing(() => setPage('inputs'))
    expect(row('lwday').open(), 'the premise: still open').toBe(true)
    expect(whatIsOpen()).toBeNull()
  })
})

describe('A12 — the OIL question from a row of the Inputs list', () => {
  it('the row\'s own OIL chip pressed, no Input window anywhere: the oilrevise row; then Cancel → nothing', async () => {
    await app('hunter')
    await openOilRevise()
    expect(drawnBox('#inpEditPop') || !!tid('win-inputedit'), 'no Input window').toBe(false)
    expect(whatIsOpen()).toMatchObject({ reason: 'window', row: { id: 'oilrevise', where: 'inputs' } })
    await press(tid('oilconf-cancel'), 'Back')
    expect(whatIsOpen()).toBeNull()
  })
  it('behind another page — the question up, then View-only Sched: the page unmounts, nothing', async () => {
    await app('hunter')
    await openOilRevise()
    await doing(() => setPage('viewsched'))
    expect(tid('oilconf')).toBeNull()
    expect(whatIsOpen()).toBeNull()
  })
})

describe('A16 — the Calendar\'s unfinished work, on his E1 answer (D2654)', () => {
  it('the Calendar open, nothing pending: nothing open, and closeShown() closes it', async () => {
    await app('hunter')
    await doing(() => setDaysWin('2026-07-01'))
    expect(whatIsOpen()).toBeNull()
    await act(async () => { closeShown() })
    await settle()
    expect(DAYSWIN).toBeNull()
  })
  it('a holiday sheet read in, its preview waiting for Add: the holimport row; closeShown() leaves the Calendar open; Add → nothing', async () => {
    await app('hunter')
    await openHolImport()
    expect(whatIsOpen()).toMatchObject({ reason: 'window', row: { id: 'holimport' } })
    await act(async () => { closeShown() })
    await settle()
    expect(DAYSWIN, 'the Calendar kept for the sheet').not.toBeNull()
    expect(tid('hol-preview'), 'the preview kept').not.toBeNull()
    if ((tid('hol-pv-add') as HTMLButtonElement).disabled) return   // (no line the war can take: Add is greyed — Cancel is the way out, A2)
    await press(tid('hol-pv-add'), 'Add n holidays')
    expect(whatIsOpen()).toBeNull()
  })
  it('an Add that fails — a holiday added behind the preview: still the row', async () => {
    await app('hunter')
    await openHolImport()
    if ((tid('hol-pv-add') as HTMLButtonElement).disabled) return
    act(() => { holidayAdd({ kind: 'ph', name: 'Sheet day A', from: '2026-05-04', to: '2026-05-04' }) })
    await press(tid('hol-pv-add'), 'Add n holidays')
    expect(tid('hol-pv-err'), 'the premise: refused, read again').not.toBeNull()
    expect(named()).toBe('holimport')
  })
  it('a file whose reading finishes after the Calendar has closed: nothing set, nothing counted', async () => {
    await app('hunter')
    await doing(() => setDaysWin('2026-05-01'))
    const f = new File([SHEET], 'late.csv', { type: 'text/csv' })
    await act(async () => { fireEvent.change(tid('hol-import-file')!, { target: { files: [f] } }); setDaysWin(null); notify() })
    await settle(); await settle()
    expect(DAYSWIN).toBeNull()
    expect(whatIsOpen()).toBeNull()
    expect(workOn('holimport')).toBe(false)
  })
  it('a new holiday: opened → nothing; a name typed → the holiday row; closeShown() leaves the Calendar and the form open', async () => {
    await app('hunter')
    await doing(() => setDaysWin('2026-07-01'))
    await press(tid('hol-add'), 'Add a holiday')
    expect(whatIsOpen(), 'opened, nothing typed').toBeNull()
    await typeIn('[data-testid="hol-name"]', 'Founders')
    expect(whatIsOpen()).toMatchObject({ reason: 'window', row: { id: 'holiday' } })
    await act(async () => { closeShown() })
    await settle()
    expect(tid('win-holiday') && tid('win-days'), 'both kept').toBeTruthy()
  })
  it('an untouched form goes with the Calendar: Every Monday opened and nothing pressed, or "Add a holiday" opened and nothing typed — nothing open, and closeShown() closes the Calendar and the form with it', async () => {
    await app('hunter')
    await doing(() => setDaysWin('2026-07-01'))
    await press(tid('days-wd-0'), 'Every Monday…')
    expect(whatIsOpen(), 'Every Monday, nothing pressed').toBeNull()
    await act(async () => { closeShown() })
    await settle()
    expect({ days: DAYSWIN, win: !!tid('win-days'), every: !!tid('win-every'), open: row('everywd').open() }, 'Every Monday').toEqual({ days: null, win: false, every: false, open: false })
    await doing(() => setDaysWin('2026-07-01'))
    await press(tid('hol-add'), 'Add a holiday')
    expect(whatIsOpen(), 'Add a holiday, nothing typed').toBeNull()
    await act(async () => { closeShown() })
    await settle()
    expect({ days: DAYSWIN, win: !!tid('win-days'), holiday: !!tid('win-holiday'), open: row('holiday').open() }, 'Add a holiday').toEqual({ days: null, win: false, holiday: false, open: false })
  })
  it('a new holiday no leave period covers, refused and kept waiting: still counted', async () => {
    await app('hunter')
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
    expect(tid('hol-err'), 'the premise: refused').not.toBeNull()
    expect(named()).toBe('holiday')
  })
  it('Every Monday opened with one choice lit: nothing; one choice pressed: the everywd row (E9m)', async () => {
    await app('hunter')
    await doing(() => setDaysWin('2026-07-01'))
    await press(tid('days-wd-0'), 'Every Monday…')
    expect(whatIsOpen(), 'as it opens').toBeNull()
    await press(tid('every-cls-day'), 'Day')
    expect(named()).toBe('everywd')
  })
  it('Inputs settings beside the Calendar: nothing changed → nothing, both closed by closeShown(); a setting changed → its row, neither closed', async () => {
    await app('hunter')
    await goInputsCal('member')
    await doing(() => setInpSet(true))
    await press(tid('iset-days'), 'Calendar…')
    expect(whatIsOpen()).toBeNull()
    await act(async () => { closeShown() })
    await settle()
    expect([INPSET, DAYSWIN]).toEqual([false, null])
    await doing(() => setInpSet(true))
    await press(tid('iset-days'), 'Calendar…')
    await press(tid('iset-memberfile'), 'Members may file duties for others')
    expect(named()).toBe('inputsset')
    await act(async () => { closeShown() })
    await settle()
    expect(INPSET, 'changed: kept').toBe(true)
    await press(tid('iset-memberfile'), 'put back')
    expect(whatIsOpen(), 'put back as it opened').toBeNull()
  })
  it('SANS settings: a figure changed → its row; put back → nothing', async () => {
    await app('hunter')
    await goInputsCal('sans')
    await doing(() => setSansSet(true))
    const was = ($('[data-testid="sset-yellow"]') as HTMLInputElement).value
    await typeIn('[data-testid="sset-yellow"]', '2')
    expect(named()).toBe('sansset')
    await typeIn('[data-testid="sset-yellow"]', was)
    expect(whatIsOpen()).toBeNull()
  })
})

describe('A17 — Quals\' "Add qualification" box (D2729 Q2)', () => {
  it('in edit mode, "LOW LEVEL" typed: the qualsnew row; Add → nothing', async () => {
    await app('hunter')
    await openQualsNew()
    expect(whatIsOpen()).toMatchObject({ reason: 'row', row: { id: 'qualsnew', where: 'quals' } })
    await press($('#qAddQualBtn'), 'Add')
    expect(whatIsOpen()).toBeNull()
  })
  it('only spaces typed: nothing', async () => {
    await app('hunter')
    await openQualsNew('   ')
    expect(whatIsOpen()).toBeNull()
  })
  it('pin — Done with words in the box: the box gone, nothing counted; Edit and Edit quals again on the same squadron: the words come back, counted again (as today)', async () => {
    await app('hunter')
    await openQualsNew()
    await press($('#qSave'), 'Done')
    expect($('#qNewQual'), 'the box hidden').toBeNull()
    expect(whatIsOpen()).toBeNull()
    await press($('#qEdit'), '✎ Edit')
    await press($('#qEditQuals'), 'Edit quals')
    expect(($('#qNewQual') as HTMLInputElement).value).toBe('LOW LEVEL')
    expect(named()).toBe('qualsnew')
  })
  it('a closeShown() with words in the box leaves them, never empties the box (end() runs only with it empty — the row refuses first)', async () => {
    await app('hunter')
    await openQualsNew()
    await act(async () => { closeShown() })
    await settle()
    await press($('#qEdit'), '✎ Edit')
    await press($('#qEditQuals'), 'Edit quals')
    expect(($('#qNewQual') as HTMLInputElement).value).toBe('LOW LEVEL')
  })
})

describe('the one behaviour change of K1b — words left hidden in "Add qualification" after Done (§21.1 "K0 — done")', () => {
  it('dropped when the squadron in view changes: typed for 142, hidden by Done, 149 picked — 149\'s box is empty', async () => {
    await app('hunter')
    await openQualsNew()
    await press($('#qSave'), 'Done')
    await topPick('u149')
    expect(UNIT).toBe('u149')
    await press($('#qEdit'), '✎ Edit')
    await press($('#qEditQuals'), 'Edit quals')
    expect(($('#qNewQual') as HTMLInputElement).value, '142\'s words never in 149\'s box').toBe('')
    expect(whatIsOpen()).toBeNull()
  })
  it('…and back on 142 they do not come back either (they went with the change)', async () => {
    await app('hunter')
    await openQualsNew()
    await press($('#qSave'), 'Done')
    await topPick('u149')
    await topPick('u142')
    await press($('#qEdit'), '✎ Edit')
    await press($('#qEditQuals'), 'Edit quals')
    expect(($('#qNewQual') as HTMLInputElement).value).toBe('')
  })
})

describe('B18 (pin, once step 1 exists) — no road to "switch back" with a row open', () => {
  it('pin — a row changed on Admin → Users, then the member view: the Admin page is not drawn, and no row of Admin\'s counts', async () => {
    await app('hunter')
    await openUserRow()
    await typeIn('#accEdName, #accGiveName', 'someone.else@mail')
    expect(named(), 'the premise').toBe('userrow')
    await doing(() => { switchRoleView() })
    expect($('#admUsers'), 'the Admin page not drawn').toBeNull()
    for (const id of ['userrow', 'archrow', 'giveaccess', 'newsqn', 'sqnmove', 'placeedit'] as const) expect(workOn(id), id).toBe(false)
  })
})

describe('A4 — two open', () => {
  it('an Input window and a failed save: the window\'s row; closed → unsaved; saved → nothing', async () => {
    await app('hunter')
    await OPEN.unsaved!.open()
    await OPEN.inputedit!.open()
    expect(named()).toBe('inputedit')
    expect(whatIsOpen()!.reason).toBe('window')
    await press(tid('win-inputedit-x'), 'the Input window\'s ✕')
    expect(named()).toBe('unsaved')
    expect(whatIsOpen()!.reason).toBe('unsaved')
    await OPEN.unsaved!.outs['Retry landed']!()
    expect(named()).toBeNull()
  })
  it('the OIL list and a second movable window: with the OIL list left out, the second is named', async () => {
    /* (K1b: the Calendar now closes by itself on his E1 answer, D2654 — so the second window is SANS settings with a
       figure changed, which still refuses) */
    await app('hunter')
    await OPEN.sansset!.open()
    await doing(() => { setOilList({ from: '2026-07-18', to: '2026-07-18', name: 'Holiday' }) })
    expect(row('oilday').open() && row('sansset').open(), 'the premise: both up').toBe(true)
    expect(whatIsOpen(['oilday'])?.row.id).toBe('sansset')
    expect(whatIsOpen(['oilday', 'sansset'])).toBeNull()
  })
})

describe('A5 — "Not kept" never counts (D2594)', () => {
  it('setStorageKept(false): nothing open', async () => {
    setStorageKept(false)
    await app('hunter')
    expect($('.savestat.nokeep'), 'the premise: the band is up').not.toBeNull()
    expect(whatIsOpen()).toBeNull()
  })
})

describe('A9 — nothing stale after a sign-out or an unmount', () => {
  it('a sign-out with five windows open: nothing open', async () => {
    await app('hunter')
    await doing(() => { setPage('editsched'); setTplEdit(true); setDaysWin('2026-07-01'); setOilList({ from: '2026-07-18', to: '2026-07-18', name: 'Holiday' }); setInpSet(true); setInsights(true) })
    expect(named(), 'the premise: something open').not.toBeNull()
    await act(async () => { resetSession(null); notify() })
    await settle()
    expect(whatIsOpen()).toBeNull()
  })
  it('a movable window whose page unmounts without its ✕: nothing open', async () => {
    await app('hunter')
    await OPEN.inputsday!.open()
    expect(named()).toBe('inputsday')
    await doing(() => setPage('viewsched'))
    expect(whatIsOpen()).toBeNull()
  })
})

describe('A10 — counted means drawn', () => {
  /* the changes he did not make that the test world can make, each from a fresh open */
  const CHANGES: Record<string, { setup?: () => void; onPick?: string; change: () => Promise<void> }> = {
    'his right in the squadron lowered to View': {
      onPick: 'u149',
      change: async () => {
        signInAs('saber')
        expect(saveAccess(ACCT.hunter, { grants: { u149: 'view' } })).toBeNull()
        signInAs('hunter')
        await doing(() => {})
      },
    },
    'the role in force changed': { change: async () => { await doing(() => { switchRoleInForce('main') }) } },
    'his move at midnight': {
      setup: () => { signInAs('saber'); expect(moveMan(PID.hunter, third.u150).ok).toBe(true) },
      change: async () => { await act(async () => { pastMidnight() }); await settle() },
    },
    'the page changed by a landing': { change: async () => { await doing(() => setPage(CURPAGE === 'inputs' ? 'viewsched' : 'inputs')) } },
    'the board closed under its dialog': { change: async () => { await doing(() => closeScheduler()) } },
  }
  const counting = GUARD_ROWS.filter(rowRefuses)
  for (const r of counting) {
    for (const [what, c] of Object.entries(CHANGES)) {
      it(`${r.id}, then ${what}: not named, or its box is on the page`, async () => {
        c.setup?.()
        await app('hunter')
        if (c.onPick) await topPick(c.onPick)
        await OPEN[r.id]!.open()
        expect(named(), `the premise: ${r.id} open`).toBe(r.id)
        expect(r.counts === 'unsaved' || drawnBox(r.sel), `the premise: ${r.id}'s box ${r.sel} is drawn`).toBe(true)
        await c.change()
        const still = whatIsOpen()?.row.id === r.id || r.open()
        if (still && r.counts !== 'unsaved') expect(drawnBox(r.sel), `${r.id} still counts after "${what}" — its box ${r.sel} must be on the page`).toBe(true)
      })
    }
  }
  it('the worked case: Duty templates under a lowered Plan — the flag still set, no dialog, nothing open', async () => {
    await app('hunter')
    await topPick('u149')
    await OPEN.dutytpl!.open()
    expect(named()).toBe('dutytpl')
    await CHANGES['his right in the squadron lowered to View']!.change()
    expect(drawnBox('#tplModal'), 'no dialog').toBe(false)
    expect(whatIsOpen()).toBeNull()
  })
})

describe('A14 (pin — no door asks the guard yet) — the guard is not asked on a change he did not make', () => {
  it('pin: his own move at midnight, then a right ended, under an Input window and a Leave War window: never asked', async () => {
    const ask = vi.fn(guardAsk)
    setGuardAsk(ask)
    signInAs('saber'); expect(moveMan(PID.hunter, third.u150).ok).toBe(true)
    await app('hunter')
    await topPick('u149')
    await OPEN.lwsheet!.open()
    await OPEN.inputedit!.open()
    expect(named(), 'the premise: something counts').not.toBeNull()
    await act(async () => { pastMidnight() }); await settle()
    signInAs('saber'); expect(saveAccess(ACCT.hunter, { grants: { u149: 'none' } })).toBeNull(); signInAs('hunter')
    await doing(() => {})
    expect(ask).not.toHaveBeenCalled()
  })
})

describe('A15 (pin — nothing closes yet) — nothing closes at a change he did not make', () => {
  it('pin: ALL AVAIL, Insights, a SANS day and the Leave War\'s day panel open, then his move at midnight, then a right ended: closeShown never called; ALL AVAIL closes and Insights stays, as K0 pinned (P18)', async () => {
    const shut = vi.fn(guardCloseShown)
    setGuardClose(shut)
    signInAs('saber'); expect(moveMan(PID.hunter, third.u150).ok).toBe(true)
    await app('hunter')
    await goLeaveWar(); await doing(() => openDayPanel('2026-07-15'))
    await goInputsCal('sans'); await tap(tid('sc-day-2026-07-15'), 'the 15th on the SANS calendar')
    await doing(() => { setPage('editsched'); setAvailWin({ di: 0, item: 'x', ver: '', name: 'x', when: '', tab: 'who' } as any); setInsights(true) })
    expect([!!AVAILWIN, INSIGHTS, dayPanelDate()], 'the premise').toEqual([true, true, '2026-07-15'])
    await act(async () => { pastMidnight() }); await settle()
    expect(homeOn(PID.hunter, todayIso())).toBe(third.u150)
    expect({ avail: !!AVAILWIN, insights: INSIGHTS }, 'as P18 recorded it').toEqual({ avail: false, insights: true })
    signInAs('saber'); expect(saveAccess(ACCT.hunter, { grants: { u149: 'none' } })).toBeNull(); signInAs('hunter')
    await doing(() => {})
    expect(shut).not.toHaveBeenCalled()
  })
})
