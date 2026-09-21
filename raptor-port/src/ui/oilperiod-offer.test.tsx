// @vitest-environment jsdom
/* THE WAY OUT SITS BESIDE THE REASON — owner's ruling D19 (22 Sep 26):
   "Perhaps indicate that the leave war period doesn't exist, create it."
   The day naming the missing period is half an answer; the other half is the
   control that makes it, without sending the scheduler off to find the Leave
   War and work out what to build there. It lands in DRAFT and hands him over
   to set the bidding window, because opening a period for bidding is his act. */
import { beforeEach, afterEach, describe, expect, it } from 'vitest'
import { dayWarnHTML } from './html'
import { routeClick } from './interactions'
import { HOOKS } from '../engine/hooks'
import { validate, WARN } from '../engine/validate'
import { SCHED } from '../engine/publish'
import { initStore, setSession, notify } from '../state/store'
import * as view from '../state/view'
import { initStore as lwInitStore, getState, setRole } from '../leavewar/state/store'
import { memoryBackend } from '../leavewar/state/storage'

const SAT = 5
let saved: any
let host: HTMLDivElement

beforeEach(() => {
  initStore()
  lwInitStore(memoryBackend())
  setSession({ user: 'a', role: 'admin' } as any); notify()
  saved = { day: HOOKS.oilEarningDay, iso: HOOKS.oilDayISO, none: HOOKS.oilNoPeriod, toast: HOOKS.toast }
  HOOKS.oilEarningDay = (di: number) => di === SAT
  HOOKS.oilDayISO = (di: number) => (di === SAT ? '2028-02-12' : '')
  HOOKS.oilNoPeriod = (di: number) => (di === SAT ? '2028' : '')
  HOOKS.toast = () => {}
  SCHED.dayOK = {}; SCHED.sign = {}
  view.DWOPEN.add(SAT)
  validate()
  host = document.createElement('div')
  document.body.appendChild(host)
  host.addEventListener('click', e => routeClick(e as MouseEvent))
})
afterEach(() => {
  HOOKS.oilEarningDay = saved.day; HOOKS.oilDayISO = saved.iso
  HOOKS.oilNoPeriod = saved.none; HOOKS.toast = saved.toast
  view.DWOPEN.delete(SAT); host.remove(); validate()
})

const draw = () => { host.innerHTML = dayWarnHTML(SAT); return host }
const offer = () => host.querySelector('[data-mkperiod]') as HTMLButtonElement | null

describe('the day offers to create the leave war period it says is missing', () => {
  it('the offer is drawn, and it names the year', () => {
    draw()
    expect(WARN.byDay[SAT].warns.map((w: any) => w.code), 'the reason is there').toContain('OIL_NO_PERIOD')
    expect(offer(), 'and so is the way out').toBeTruthy()
    expect(offer()!.textContent).toContain('2028')
  })

  it('pressing it creates the period, in draft, and moves to the Leave War', () => {
    setRole('admin')
    draw()
    offer()!.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    const w = getState().wars.find(x => x.period.start === '2028-01-01')
    expect(w, 'the period exists now').toBeTruthy()
    expect(w!.period.stage, 'in draft — opening it for bidding stays his act').toBe('draft')
    expect(view.CURPAGE, 'and he is taken there to set the bidding window').toBe('leavewar')
  })

  it('THE CONTROL — a member sees the reason but is offered no button', () => {
    setSession({ user: 'u', role: 'main' } as any); notify()
    draw()
    expect(host.textContent, 'he is still told why nothing can be paid').toContain('no leave war period')
    expect(offer(), 'but creating one is not his to do').toBeNull()
  })

  it('THE OTHER CONTROL — no button on a day whose period exists', () => {
    HOOKS.oilNoPeriod = () => ''
    validate()
    draw()
    expect(offer()).toBeNull()
  })
})
