// @vitest-environment jsdom
/* [OIL-SEATS-CAN-EARN] STEP 6, ON SCREEN — a placeholder on an accepted
   request's row opens into the real people it stands for, and each of them can
   be tapped.
   Plan: docs/superpowers/specs/2026-09-22-oil-seats-can-earn-plan.md §5 step 6.

   The money half is engine/oilclaimcrowd.test.ts. This file exists because the
   two have been out of step on this exact row before: a man the credit was
   paying from a landed request was drawn INERT in the mode — "nothing
   measurable to earn from here" — with no switch to change it, because the
   screen asked the day's work walk and the walk skips every request row whole.
   The screen contradicting the money about a man's entitlement, with no door.
   That was found by opening the app, not by reading code, and it is the reason
   a green engine suite is not enough here.

   jsdom has no layout engine, so what this proves is the markup and the wiring;
   what it LOOKS like is the walk of the running app. */
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
import { openScheduler } from './board'
import { setOilDay } from '../state/view'

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
  /* the Ground Programme is emptied so the request's row is the only one in the
     panel and can be addressed without counting */
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

/* bane's Training request, accepted and landed on the Saturday, with a
   placeholder standing under it */
const landed = (over: any = {}, row: any = {}) => {
  INPUTS.unshift({ iid: 'rq1', person: 'bane', type: 'Training', date: 'Jul 18', yr: 2026,
    acc: 'g', allday: false, s: 9 * 60, e: 17 * 60, remarks: '', mod: 'now',
    oil: { [SAT_ISO]: 1 }, ...over })
  ;(DAYS[SAT] as any).ground = [{ prog: 'Training', str: '0900', end: '1700', who: 'bane', src: 'rq1', more: ['allavail'], ...row }]
  ensureRowIds(DAYS)
}

describe('the crowd on a request row is drawn, and every man in it is tappable', () => {
  /* [ALL-AVAIL-WINDOW] (D38) — the crowd behind a placeholder moved OUT of the
     row and into the window. A REQUEST ROW is its own seat kind and gets its own
     mark in the roll-call: the requester keeps his puck on the row where he
     always was, the placeholder beside him keeps its counter, and the counter is
     the door to the men it stands for. */
  it('the requester stays on the row; the placeholder keeps its counter', async () => {
    landed()
    await open(SAT)
    await click(oilBtn())
    const el = groundRowEl()
    expect(el.querySelector('.puck.allavail'), 'the placeholder STAYS a placeholder now').toBeTruthy()
    const seats = [...el.querySelectorAll('.seat.oilpk')] as HTMLElement[]
    expect(seats.map(s => s.dataset.oilp), 'the man who filed it keeps his own puck').toEqual(['bane'])
    expect(seats.filter(s => s.classList.contains('inert')).length,
      'and he may not be inert — the money is paying him').toBe(0)
    const chip = el.querySelector('.oilcount') as HTMLElement
    expect(chip, 'the placeholder has a counter — this IS the door').toBeTruthy()
    await click(chip)
    const w = $('.availwin')
    expect(w, 'and it opens the window').toBeTruthy()
    const inWin = ([...w.querySelectorAll('.seat.oilpk')] as HTMLElement[])
    expect(inWin.map(s => s.dataset.oilp).sort(), 'the two he stands beside').toEqual(['plasma', 'stiff'])
    expect(inWin.filter(s => s.classList.contains('inert')).length,
      'NONE of them may be inert — the money is paying them').toBe(0)
  })

  it('the row does not claim nothing on it can earn', async () => {
    landed()
    await open(SAT)
    await click(oilBtn())
    const cell = groundRowEl().querySelector('.oilitem') as HTMLElement
    expect(cell.title, 'a request is answered per person, not by a row switch').toContain('tap a puck on this row')
    expect(cell.title).not.toContain('Nothing on this row can earn')
  })

  it('tapping one man in the window takes HIM off and leaves the rest alone', async () => {
    landed()
    await open(SAT)
    await click(oilBtn())
    await click(groundRowEl().querySelector('.oilcount'))
    const inWin = () => ([...$('.availwin').querySelectorAll('.seat.oilpk')] as HTMLElement[])
    await click(inWin().find(s => s.dataset.oilp === 'plasma')!.querySelector('.puck'))
    expect((DAYS[SAT] as any).oild.people[`plasma|${ITEM}`], 'a decision about that one man').toBe('deny')
    expect(inWin().find(s => s.dataset.oilp === 'plasma')!.classList.contains('off'), 'he is off').toBe(true)
    expect(inWin().find(s => s.dataset.oilp === 'stiff')!.classList.contains('on'), 'the other man is untouched').toBe(true)
    /* and the REQUESTER, who is on the row rather than in the window, is
       untouched too — D18 says he earns from his own landed request */
    const onRow = ([...groundRowEl().querySelectorAll('.seat.oilpk')] as HTMLElement[])
    expect(onRow.find(s => s.dataset.oilp === 'bane')!.classList.contains('on'), 'and so is the requester').toBe(true)
  })

  it('AN ALL-DAY REQUEST still reaches its crowd — the row carries no times at all', async () => {
    landed({ allday: true, s: 0, e: 0 }, { str: '', end: '' })
    await open(SAT)
    await click(oilBtn())
    await click(groundRowEl().querySelector('.oilcount'))
    const inWin = ([...$('.availwin').querySelectorAll('.seat.oilpk')] as HTMLElement[])
    expect(inWin.map(s => s.dataset.oilp).sort(), 'the REQUEST window resolves the crowd, not the row window')
      .toEqual(['plasma', 'stiff'])
  })

  it('THE CONTROL: a request row with no placeholder is drawn exactly as before', async () => {
    landed({}, { more: ['divot'] })
    await open(SAT)
    await click(oilBtn())
    const seats = [...groundRowEl().querySelectorAll('.seat.oilpk')] as HTMLElement[]
    expect(seats.map(s => s.dataset.oilp).sort()).toEqual(['bane', 'divot'])
  })
})
