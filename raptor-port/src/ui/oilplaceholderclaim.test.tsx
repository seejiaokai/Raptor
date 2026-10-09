// @vitest-environment jsdom
/* OIL EARN, ON SCREEN, FOR AN INPUT FILED FOR "ALL AVAIL" — each man's switch starts where his credit does, and says why
   (`[INPUT-ALL-AVAIL]`; owner D702, D711 (1), 9 Oct 26: "the filer answers the OIL question once and the scheduler may
   switch any one man").

   The credit half is engine/oilplaceholderclaim.test.ts. THIS file exists because of what both first-round readers of
   the plan found: changing the credit alone would have left every crowd man's switch reading "on by default" over the
   filer's No — so the first tap wrote a REFUSAL of a credit he never had, the second tap removed it, and NEITHER
   granted him anything. The admin could not override (against D28). So here the switches are pressed for real, in the
   window where they live (D38), after a No, after no answer and after a Yes, and the credit is read after each press.

   jsdom has no layout engine: this proves the markup, the wiring and the words; what it LOOKS like is the walk. */
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { App } from './App'
import { initStore, setSession, notify } from '../state/store'
import { DAYS } from '../engine/data'
import { INPUTS } from '../engine/inputs'
import { HOOKS } from '../engine/hooks'
import { SCHED } from '../engine/publish'
import { ensureRowIds } from '../engine/rowids'
import { inputItemKey } from '../engine/oil'
import { oilEvidence, oilEarnedWork } from '../engine/oilev'
import { openScheduler } from './board'
import { setOilDay } from '../state/view'
import { setOilBlanket } from './oilmode'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

const $ = (sel: string) => document.querySelector(sel) as HTMLElement
const $$ = (sel: string) => [...document.querySelectorAll(sel)] as HTMLElement[]
const click = async (el: Element | null) => {
  expect(el, 'click target exists').toBeTruthy()
  await act(async () => { (el as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true })) })
}

let host: HTMLDivElement
let root: Root
const DSNAP = JSON.stringify(DAYS)
const earningDay = HOOKS.oilEarningDay, dayISO = HOOKS.oilDayISO, sentinel = HOOKS.oilSentinel
const SAT = 5, SAT_ISO = '2026-07-18'
const CROWD = ['stiff', 'plasma']
const ITEM = inputItemKey('rq1')
const YES = { [SAT_ISO]: 0.5 }, NO = { [SAT_ISO]: 0 }

beforeAll(async () => {
  initStore()
  host = document.createElement('div')
  document.body.appendChild(host)
  root = createRoot(host)
  await act(async () => { root.render(<App />) })
  await act(async () => { setSession({ user: 'ad', role: 'admin' }); notify() })
  await click($$('.nav a[data-page]').find(a => a.dataset.page === 'editsched')!)
})
afterAll(async () => {
  await act(async () => { root.unmount() })
  host.remove()
  HOOKS.oilEarningDay = earningDay; HOOKS.oilDayISO = dayISO; HOOKS.oilSentinel = sentinel
})

beforeEach(async () => {
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  INPUTS.length = 0
  SCHED.pending = {}; SCHED.changes = {}; SCHED.als = []; SCHED.dayOK = {}
  SCHED.sign = {}; SCHED.signBind = {}; SCHED.orig = {}; SCHED.cur = {}
  ;(DAYS[SAT] as any).ground = []
  ensureRowIds(DAYS)
  setOilDay(null)
  HOOKS.oilEarningDay = (di: number) => di === SAT
  HOOKS.oilDayISO = (di: number) => (di === SAT ? SAT_ISO : '2026-07-15')
  HOOKS.oilSentinel = () => CROWD.slice()
})
afterEach(() => { setOilDay(null) })

const open = async (di: number) => { await act(async () => { openScheduler(di); notify() }) }
const oilBtn = () => $('#sbBoard [data-oilmode]')
const groundRowEl = () => $$('#sbBoard .sb-panel.grnd .sb-arow.c6r')[0]
const inWin = () => ([...$('.availwin').querySelectorAll('.seat.oilpk')] as HTMLElement[])
const seatOf = (id: string) => inWin().find(s => s.dataset.oilp === id)!
/* who earns FROM THIS REQUEST — the seed Saturday carries flying and duty work of its own, so a man may earn elsewhere */
const paid = () => Object.entries(oilEarnedWork(DAYS[SAT], oilEvidence(SAT)))
  .filter(([, spans]) => (spans as any[]).some(w => String(w.item || '') === ITEM)).map(([p]) => p).sort()
const decision = (id: string) => (((DAYS[SAT] as any).oild || {}).people || {})[`${id}|${ITEM}`]

/* a weekend Duty filed by Saber for ALL AVAIL, landed on the Saturday 0900–1200 */
const landed = (over: any = {}, row: any = {}) => {
  INPUTS.unshift({ iid: 'rq1', person: 'allavail', by: 'saber', type: 'Duty', date: 'Jul 18', yr: 2026,
    acc: 'g', allday: false, s: 9 * 60, e: 12 * 60, remarks: '', mod: 'now', oil: YES, ...over })
  ;(DAYS[SAT] as any).ground = [{ prog: 'Duty', str: '0900', end: '1200', who: 'allavail', src: 'rq1', ...row }]
  ensureRowIds(DAYS)
}
const openWindow = async () => {
  await open(SAT)
  await click(oilBtn())
  await click(groundRowEl().querySelector('.oilcount'))
}

describe('the row itself — the placeholder is never a switch', () => {
  it('the ALL AVAIL puck stands in the name box with its count; it is offered no OIL switch of its own', async () => {
    landed()
    await open(SAT)
    await click(oilBtn())
    const el = groundRowEl()
    expect(el.querySelector('.puck.allavail'), 'the placeholder puck').toBeTruthy()
    expect(el.querySelector('.oilcount'), 'its count — the door to the people behind it').toBeTruthy()
    expect([...el.querySelectorAll('.seat.oilpk')].map((s: any) => s.dataset.oilp), 'no man\'s switch is drawn for the placeholder').not.toContain('allavail')
  })

  it('the row\'s name says where the switches are — not "tap a puck on this row", which has none', async () => {
    landed()
    await open(SAT)
    await click(oilBtn())
    const cell = groundRowEl().querySelector('.oilitem') as HTMLElement
    expect(cell.dataset.oilitem, 'a request offers no whole-row switch').toBeUndefined()
    expect(cell.title).toContain('follows the answer of whoever filed it')
    expect(cell.title).toContain('tap the count')
    expect(cell.title).not.toContain('tap a puck on this row')
    expect(cell.title).not.toContain('Nothing on this row can earn')
  })

  it('a man the scheduler typed under the row is ON whatever the filer answered, and is his own switch', async () => {
    landed({ oil: NO }, { more: ['divot'] })
    await open(SAT)
    await click(oilBtn())
    const seat = () => ([...groundRowEl().querySelectorAll('.seat.oilpk')] as HTMLElement[]).find(s => s.dataset.oilp === 'divot')!
    expect(seat().classList.contains('on'), 'typed there by name: default yes').toBe(true)
    await click(seat().querySelector('.puck'))
    expect(decision('divot')).toBe('deny')
    expect(paid()).toEqual([])
  })
})

describe('after the filer answered NO — a tap GRANTS, a second tap takes the grant away', () => {
  it('every crowd man starts OFF, a real switch, and is told whose No it is', async () => {
    landed({ oil: NO })
    await openWindow()
    expect(inWin().map(s => s.dataset.oilp).sort()).toEqual(['plasma', 'stiff'])
    for (const s of inWin()) {
      expect(s.classList.contains('inert'), `${s.dataset.oilp} is not inert — he can be credited`).toBe(false)
      expect(s.classList.contains('off'), `${s.dataset.oilp} starts off`).toBe(true)
      expect(s.title).toContain('whoever filed this Duty answered No')
      expect(s.title).toContain('tap to credit him anyway')
      expect(s.title, 'never the words for an AVALON line').not.toContain('this kind of event earns nothing')
    }
    expect(paid()).toEqual([])
  })

  it('the first tap writes an ALLOW and he is credited; the second removes it and he is not', async () => {
    landed({ oil: NO })
    await openWindow()
    await click(seatOf('stiff').querySelector('.puck'))
    expect(decision('stiff'), 'a grant, not a refusal').toBe('allow')
    expect(seatOf('stiff').classList.contains('on')).toBe(true)
    expect(paid(), 'the credit follows the tap').toEqual(['stiff'])
    expect(seatOf('plasma').classList.contains('off'), 'the other man is untouched').toBe(true)
    await click(seatOf('stiff').querySelector('.puck'))
    expect(decision('stiff'), 'back to the filer\'s answer: nothing stored').toBeUndefined()
    expect(seatOf('stiff').classList.contains('off')).toBe(true)
    expect(paid()).toEqual([])
  })

  it('the window\'s hint says the question was answered No, and how to credit one man', async () => {
    landed({ oil: NO })
    await openWindow()
    const hint = $('.availwin').textContent || ''
    expect(hint).toContain('answered No')
    expect(hint).toContain('Tap a puck to credit')
    expect(hint).not.toContain('Tap a puck to stop a man earning')
  })
})

describe('with NO ANSWER yet — the same switches, and the true reason', () => {
  it('every crowd man starts off and is told the question has not been answered; a tap credits him', async () => {
    landed({ oil: {} })
    await openWindow()
    for (const s of inWin()) {
      expect(s.classList.contains('off')).toBe(true)
      expect(s.title).toContain('has not been answered yet')
      expect(s.title).toContain('tap to credit him')
    }
    expect($('.availwin').textContent || '').toContain('has not been answered')
    await click(seatOf('plasma').querySelector('.puck'))
    expect(decision('plasma')).toBe('allow')
    expect(paid()).toEqual(['plasma'])
  })
})

describe('after the filer answered YES — a tap refuses, a second tap clears it', () => {
  it('every crowd man starts ON; a tap writes a DENY; a second tap removes it', async () => {
    landed({ oil: YES })
    await openWindow()
    for (const s of inWin()) expect(s.classList.contains('on'), `${s.dataset.oilp} starts on`).toBe(true)
    expect(paid()).toEqual(['plasma', 'stiff'])
    /* read before any tap: a tapped man's own line then takes the hint's place */
    expect($('.availwin').textContent || '').toContain('Tap a puck to stop a man earning')
    await click(seatOf('plasma').querySelector('.puck'))
    expect(decision('plasma')).toBe('deny')
    expect(paid()).toEqual(['stiff'])
    await click(seatOf('plasma').querySelector('.puck'))
    expect(decision('plasma')).toBeUndefined()
    expect(paid()).toEqual(['plasma', 'stiff'])
  })

  it('a scheduler\'s switch outlives a fresh answer from the filer', async () => {
    landed({ oil: NO })
    await openWindow()
    await click(seatOf('stiff').querySelector('.puck'))
    expect(decision('stiff')).toBe('allow')
    await act(async () => { INPUTS[0].oil = YES; notify() })
    expect(decision('stiff'), 'the scheduler\'s own word stays on the day').toBe('allow')
    expect(paid()).toEqual(['plasma', 'stiff'])
  })
})

describe('under the day blanket nothing is written', () => {
  it('a tap on a crowd man is refused and stores no decision', async () => {
    landed({ oil: NO })
    await openWindow()
    await act(async () => { setOilBlanket(SAT, true); notify() })
    expect(inWin().length).toBe(2)
    for (const s of inWin()) {
      expect(s.classList.contains('inert'), 'under a mask the puck is not a control').toBe(true)
      await click(s.querySelector('.puck'))
    }
    expect(((DAYS[SAT] as any).oild || {}).people, 'no decision about any man was stored').toBeUndefined()
    expect(paid()).toEqual([])
  })
})

describe('THE CONTROL — a named man\'s request with ALL AVAIL under it reads exactly as before (D46)', () => {
  it('the crowd starts ON over the holder\'s own No, with the old words', async () => {
    INPUTS.unshift({ iid: 'rq1', person: 'bane', type: 'Training', date: 'Jul 18', yr: 2026, acc: 'g', allday: false,
      s: 9 * 60, e: 12 * 60, remarks: '', mod: 'now', oil: NO })
    ;(DAYS[SAT] as any).ground = [{ prog: 'Training', str: '0900', end: '1200', who: 'bane', src: 'rq1', more: ['allavail'] }]
    ensureRowIds(DAYS)
    await openWindow()
    for (const s of inWin()) expect(s.classList.contains('on')).toBe(true)
    const cell = groundRowEl().querySelector('.oilitem') as HTMLElement
    expect(cell.title).toContain('tap a puck on this row')
    expect($('.availwin').textContent || '').toContain('Tap a puck to stop a man earning')
  })
})
