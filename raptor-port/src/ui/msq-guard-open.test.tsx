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
import { GUARD_ROWS, whatIsOpen, closeShown, guardAsk, guardCloseShown, type GuardRow } from './guard'
import { setGuardAsk, setGuardClose } from '../state/guard'
;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

withThird()

/* what a later pass owes this file (the brief's TO_COME): each test and row, with the pass that owes it */
export const TO_COME: { what: string; pass: 'K1b' | 'K1c' }[] = [
  { what: 'A6 — a Users row and the other six Admin forms (useGuardWork reports)', pass: 'K1b' },
  { what: 'A7 — a window on a page out of sight (the Leave War\'s show-only mark, the Tracker\'s window)', pass: 'K1b' },
  { what: 'A12 — the OIL question from a row of the Inputs list (oilrevise)', pass: 'K1b' },
  { what: 'A16 — the Calendar\'s unfinished work on his E1 answer (holimport, holiday, everywd, the settings\' dirty)', pass: 'K1b' },
  { what: 'A17 — Quals\' "Add qualification" box (qualsnew)', pass: 'K1b' },
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
  closeDayPanel(); closeScheduler()
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
  inputsset: {
    open: async () => { await goInputsCal('member'); await doing(() => setInpSet(true)) },
    outs: { '✕': x('win-inputsset-x'), Cancel: x('iset-cancel'), Save: x('iset-save'), Escape: escape },
  },
  sansset: {
    open: async () => { await goInputsCal('sans'); await doing(() => setSansSet(true)) },
    outs: { '✕': x('win-sansset-x'), Cancel: x('sset-cancel'), Save: x('sset-save'), Escape: escape },
  },
  days: {
    open: async () => { await doing(() => setDaysWin('2026-07-01')) },
    outs: { '✕': x('win-days-x'), Escape: escape },
  },
  everywd: {
    open: async () => { await doing(() => setDaysWin('2026-07-01')); await press(tid('days-wd-0'), 'Every Monday…') },
    outs: { '✕': x('win-every-x'), Cancel: x('every-cancel'), Escape: escape },
    under: 'days',
  },
  holiday: {
    open: async () => { await doing(() => setDaysWin('2026-07-01')); await press(tid('hol-add'), 'Add a holiday') },
    outs: { '✕': x('win-holiday-x'), Cancel: x('hol-cancel'), Escape: escape },
    under: 'days',
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
  const counting = GUARD_ROWS.filter(r => r.counts === 'window' || r.counts === 'row' || r.counts === 'unsaved')
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
    await app('hunter')
    await doing(() => { setOilList({ from: '2026-07-18', to: '2026-07-18', name: 'Holiday' }); setDaysWin('2026-07-01') })
    expect(row('oilday').open() && row('days').open(), 'the premise: both up').toBe(true)
    expect(whatIsOpen(['oilday'])?.row.id).toBe('days')
    expect(whatIsOpen(['oilday', 'days'])).toBeNull()
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
  const counting = GUARD_ROWS.filter(r => r.counts === 'window' || r.counts === 'row' || r.counts === 'unsaved')
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
