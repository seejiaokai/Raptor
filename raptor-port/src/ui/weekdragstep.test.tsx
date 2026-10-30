// @vitest-environment jsdom
/* A MAN HELD AT THE WEEK'S SIDE STEPS THE WEEK A DAY (owner D1529, 31 Oct 26 — "A — a day at a time"; the backlog item
   [WEEK-DRAG-EDGE-PAN]). On Edit Schedule a mouse drag held in the app's mouse edge band at the week's left or right side
   waits about half a second, then steps the week one day as one press of ‹ / › does, and again while held; a name only
   passing through moves nothing; it stops at Monday and Sunday, never carrying the man into another week. jsdom has no
   layout, so the week's box, its days and what sits under the pointer are told by hand; the frames and the clock are
   fake, so "held half a second" is exact. */
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { App } from './App'
import { initStore, setSession, notify, loadWeek } from '../state/store'
import { CURWEEK } from '../engine/waves'
import { DRAG } from './drag'
import { WEEK_STEP_WAIT } from './drag'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

let host: HTMLDivElement
let root: Root
const $ = (sel: string) => document.querySelector(sel) as HTMLElement
const $$ = (sel: string) => [...document.querySelectorAll(sel)] as HTMLElement[]
const click = async (el: Element) => { await act(async () => { (el as HTMLElement).click() }) }

const HAS_PE = typeof (globalThis as any).PointerEvent === 'function'
const ptr = (type: string, x: number, y: number, o: { kind?: string, id?: number } = {}) => {
  const { kind = 'mouse', id = 1 } = o
  if (HAS_PE) return new PointerEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y, pointerId: id, pointerType: kind, isPrimary: true, button: 0 })
  const e: any = new MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y, button: 0 })
  Object.defineProperty(e, 'pointerId', { value: id }); Object.defineProperty(e, 'pointerType', { value: kind }); Object.defineProperty(e, 'isPrimary', { value: true })
  return e
}

/* his PC's layout, measured on the built app (31 Oct 26): the week from 0 to 1259 wide, the crew panel to its right,
   the days 564 apart, three to a screen */
const STEP = 564, RIGHT = 1259
let under: Element | null = null
let landed: number[] = []
const efp = (document as any).elementFromPoint
const OFFSET_LEFT = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetLeft')!
const crew = () => $('#eRoster .rpuck[data-person]')
const week = () => $('#eWeek')

beforeAll(async () => {
  initStore()
  host = document.createElement('div')
  document.body.appendChild(host)
  root = createRoot(host)
  await act(async () => { root.render(<App />) })
  await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
  await click($$('.nav a[data-page]').find(a => a.dataset.page === 'editsched')!)
  ;(document as any).elementFromPoint = () => under
})
afterAll(async () => {
  ;(document as any).elementFromPoint = efp
  await act(async () => { root.unmount() })
  host.remove()
})

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'requestAnimationFrame', 'cancelAnimationFrame', 'Date'] })
  const w = week()
  /* on the prototype, not each day: picking a man up off a seat redraws the week's days */
  Object.defineProperty(HTMLElement.prototype, 'offsetLeft', { configurable: true, get(this: HTMLElement) { return this.matches && this.matches('#eWeek .day[data-day]') ? +this.dataset.day! * STEP : 0 } })
  Object.defineProperty(w, 'scrollWidth', { value: 9000, configurable: true })
  Object.defineProperty(w, 'clientWidth', { value: RIGHT, configurable: true })
  w.getBoundingClientRect = () => ({ left: 0, right: RIGHT, top: 200, bottom: 3000, width: RIGHT, height: 2800, x: 0, y: 200, toJSON() {} }) as DOMRect
  landed = []
  /* the week glides to where it is sent, as the browser's smooth scroll does — it arrives a quarter second later */
  ;(w as any).scrollTo = (o: any) => { landed.push(o.left); setTimeout(() => { (w as any).scrollLeft = o.left }, 250) }
  w.scrollLeft = 0
  /* drop any arrow burst an earlier test left: a wheel pan is pan.ts's own reset */
  w.dispatchEvent(new WheelEvent('wheel', { deltaX: 1, bubbles: true }))
  w.scrollLeft = 0
  under = null
})
afterEach(() => {
  Object.defineProperty(HTMLElement.prototype, 'offsetLeft', OFFSET_LEFT)
  document.body.dispatchEvent(new Event('blur'))
  window.dispatchEvent(new Event('blur'))
  vi.useRealTimers()
})

/* pick a man up from the crew panel and carry him to (x, y); `over` is what the pointer is over there */
const carry = (x: number, y: number, over: Element | null) => {
  crew().dispatchEvent(ptr('pointerdown', 1300, 400))
  under = $('#eRoster')
  document.body.dispatchEvent(ptr('pointermove', 1290, 400))
  expect(DRAG, 'the man is picked up').toBeTruthy()
  under = over
  document.body.dispatchEvent(ptr('pointermove', x, y))
}
const hold = (ms: number) => { vi.advanceTimersByTime(ms) }
const aDay = () => $('#eWeek .day[data-day="1"]')

describe('a man held at the week\'s side steps the week a day (D1529)', () => {
  it('held at the right side: after the wait the week steps one day, and again while he is held', () => {
    carry(RIGHT - 10, 450, aDay())
    hold(WEEK_STEP_WAIT - 100)
    expect(landed, 'not before the wait').toEqual([])
    hold(200)
    expect(landed, 'one day, as one press of ›').toEqual([STEP])
    hold(WEEK_STEP_WAIT + 50)
    expect(landed, 'held on: the next day').toEqual([STEP, 2 * STEP])
  })

  it('held at the left side steps back a day', () => {
    week().scrollLeft = 3 * STEP
    carry(10, 450, aDay())
    hold(WEEK_STEP_WAIT + 50)
    expect(landed, 'one day back, as one press of ‹').toEqual([2 * STEP])
  })

  it('a name only passing through the side moves nothing', () => {
    carry(RIGHT - 10, 450, aDay())
    hold(WEEK_STEP_WAIT - 150)
    document.body.dispatchEvent(ptr('pointermove', 700, 450))
    hold(WEEK_STEP_WAIT * 3)
    expect(landed, 'left the side before the wait ran out').toEqual([])
    document.body.dispatchEvent(ptr('pointermove', RIGHT - 10, 450))
    hold(WEEK_STEP_WAIT - 150)
    expect(landed, 'coming back starts the wait again from nothing').toEqual([])
  })

  it('over the crew panel the week does not move', () => {
    carry(RIGHT + 30, 450, $('#eRoster'))
    hold(WEEK_STEP_WAIT * 3)
    expect(landed).toEqual([])
  })

  it('above or below the week, at its side, the week does not move', () => {
    carry(RIGHT - 10, 150, aDay())
    hold(WEEK_STEP_WAIT * 3)
    expect(landed, 'above the week\'s top').toEqual([])
  })

  it('it stops at Monday and at Sunday — never into another week', async () => {
    const wk = CURWEEK
    carry(10, 450, aDay())
    hold(WEEK_STEP_WAIT * 4)
    expect(landed, 'Monday at the front: nothing further back').toEqual([])
    expect(CURWEEK, 'no crossing to the week before').toBe(wk)
    document.body.dispatchEvent(ptr('pointermove', 700, 450))
    week().scrollLeft = 6 * STEP
    document.body.dispatchEvent(ptr('pointermove', RIGHT - 10, 450))
    hold(WEEK_STEP_WAIT * 4)
    expect(landed, 'Sunday at the front: nothing further on').toEqual([])
    expect(CURWEEK, 'no crossing to the next week').toBe(wk)
    await act(async () => { loadWeek(wk) })
  })

  it('a man picked up inside the side band moves nothing until he has left it', () => {
    const seat = $$('#eWeek [data-drag="1"]')[0]
    expect(seat, 'a man on a seat in the week').toBeTruthy()
    under = seat
    seat.dispatchEvent(ptr('pointerdown', 12, 450))
    document.body.dispatchEvent(ptr('pointermove', 18, 452))
    expect(DRAG, 'picked up').toBeTruthy()
    week().scrollLeft = 2 * STEP        // Wednesday at the front (set after the pick-up, which redraws the week)
    hold(WEEK_STEP_WAIT * 3)
    expect(landed, 'the band he was picked up in is dead').toEqual([])
    document.body.dispatchEvent(ptr('pointermove', 400, 452))
    hold(50)                            // a hand takes a few frames to leave and come back
    document.body.dispatchEvent(ptr('pointermove', 12, 452))
    hold(WEEK_STEP_WAIT + 50)
    expect(landed, 'back into it after leaving: it steps').toEqual([STEP])
  })

  it('the drop after a step lands on what is under the pointer then', () => {
    carry(RIGHT - 10, 450, aDay())
    hold(WEEK_STEP_WAIT + 50)
    expect(landed).toEqual([STEP])
    const later = $('#eWeek .day[data-day="2"] [data-fill]')
    expect(later, 'a cell on the day that slid in').toBeTruthy()
    under = later                       // the glide is still on its way
    hold(300)
    expect(later.classList.contains('dragover'), 'the cell the week brought under him is marked while he holds').toBe(true)
  })

  it('a finger\'s drag is unchanged — the side does not step the week', () => {
    under = crew()
    crew().dispatchEvent(ptr('pointerdown', 1300, 400, { kind: 'touch', id: 9 }))
    hold(200)
    under = aDay()
    document.body.dispatchEvent(ptr('pointermove', RIGHT - 10, 450, { kind: 'touch', id: 9 }))
    hold(WEEK_STEP_WAIT * 3)
    expect(landed).toEqual([])
    document.body.dispatchEvent(ptr('pointerup', RIGHT - 10, 450, { kind: 'touch', id: 9 }))
  })
})
