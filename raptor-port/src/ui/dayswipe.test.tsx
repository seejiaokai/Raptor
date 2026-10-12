// @vitest-environment jsdom
/* THE SWIPE IN THE CALENDAR WINDOW — [CAL-PHONE-SWIPE-FIT]; the design of record
   docs/superpowers/specs/2026-10-13-one-date-calendar.md §The swipe.

   Owner, D786 (13 Oct 26), with two pictures of the Calendar window on his iPhone: "allow me to swipe as well on the
   phone to go between months. Likewise for the holidays page to swipe between years." D795: "Yes, as described" — the
   swipe is the Inputs calendar's (50px and more sideways than up-and-down; left = the next, right = the last), it works
   anywhere on the month or the Holidays list, and "never presses a date's button". The arrows and "Today" stay.

   Pinned here: the gesture by itself (ui/sideswipe.ts), then the window (ui/DaysWindow.tsx) — the month, the year, what
   a swipe that begins on a date's button does NOT do, and that a mouse is untouched. That a real finger on the built
   app turns the page is a browser test (e2e/dayswipe.spec.ts) and, on an iPhone, his own look. */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { storeBackend } from '../engine/hooks'
import { initStore as raptorInitStore, notify } from '../state/store'
import { setSession } from '../state/auth'
import { installGlobalUndo } from '../state/undo-wire'
import { _resetTimeline } from '../undo/timeline'
import { commandStream } from '../command'
import { initStore as lwInitStore, setRole } from '../leavewar/state/store'
import { memoryBackend } from '../leavewar/state/storage'
import { flyAnswer } from '../leavewar/sync'
import { setDaysWin } from './pops'
import { _resetFloatWins } from './FloatWindow'
import { DaysWindow } from './DaysWindow'
import { SWIPE_MIN } from './calpick'
import { initSideSwipe } from './sideswipe'

/* a finger: a touch that lands at one point and lifts at another. A touch's later events go to the element it landed
   on, so both are sent there. */
const touch = (type: string, el: Element, x: number, y: number, fingers = 1) => {
  const e = new Event(type, { bubbles: true, cancelable: true })
  const pts = Array.from({ length: fingers }, () => ({ clientX: x, clientY: y, target: el }))
  Object.defineProperty(e, 'touches', { value: type === 'touchend' || type === 'touchcancel' ? [] : pts })
  Object.defineProperty(e, 'changedTouches', { value: pts })
  act(() => { el.dispatchEvent(e) })
}
const swipe = (el: Element, dx: number, dy = 0) => { touch('touchstart', el, 200, 300); touch('touchend', el, 200 + dx, 300 + dy) }

describe('the gesture (ui/sideswipe.ts)', () => {
  let host: HTMLDivElement, inner: HTMLButtonElement, off: () => void
  const seen: Array<{ dir: number; from: Element | null }> = []
  beforeEach(() => {
    seen.length = 0
    host = document.createElement('div'); inner = document.createElement('button'); host.appendChild(inner); document.body.appendChild(host)
    off = initSideSwipe(host, (dir, from) => { seen.push({ dir, from }) })
  })
  afterEach(() => { off(); host.remove() })

  it('a finger slid left is "the next", slid right "the last" — and it tells where the finger landed', () => {
    swipe(inner, -80); swipe(host, 80)
    expect(seen).toEqual([{ dir: 1, from: inner }, { dir: -1, from: host }])
  })
  it('needs the Inputs calendar’s own distance — 50px — and no less', () => {
    expect(SWIPE_MIN).toBe(50)
    swipe(inner, -(SWIPE_MIN - 1)); swipe(inner, SWIPE_MIN - 1)
    expect(seen).toEqual([])
    swipe(inner, -SWIPE_MIN)
    expect(seen).toHaveLength(1)
  })
  it('a move more up-and-down than sideways is the page being scrolled, not a swipe', () => {
    swipe(inner, -80, 90); swipe(inner, 80, -81)
    expect(seen).toEqual([])
    swipe(inner, -80, 79)
    expect(seen).toHaveLength(1)
  })
  it('two fingers are never a swipe, nor is a touch the browser took away', () => {
    touch('touchstart', inner, 200, 300, 2); touch('touchend', inner, 100, 300)
    touch('touchstart', inner, 200, 300); touch('touchcancel', inner, 100, 300); touch('touchend', inner, 100, 300)
    expect(seen).toEqual([])
  })
  it('the click that could follow a swipe is swallowed — once, and a later press is its own', () => {
    const clicked = vi.fn()
    inner.addEventListener('click', clicked)
    swipe(inner, -80)
    inner.click()
    expect(clicked).not.toHaveBeenCalled()
    inner.click()
    expect(clicked).toHaveBeenCalledTimes(1)
    /* a swipe whose click never comes must not eat the next real press */
    swipe(inner, -80)
    inner.dispatchEvent(new Event('pointerdown', { bubbles: true }))
    inner.click()
    expect(clicked).toHaveBeenCalledTimes(2)
  })
  it('a finger that did not swipe leaves its click alone', () => {
    const clicked = vi.fn()
    inner.addEventListener('click', clicked)
    swipe(inner, -10)
    inner.click()
    expect(clicked).toHaveBeenCalledTimes(1)
  })
  it('hears nothing once it is taken off', () => {
    off()
    swipe(inner, -80)
    expect(seen).toEqual([])
  })
})

describe('the Calendar window', () => {
  const mem = new Map<string, string>()
  const realMM = window.matchMedia
  /* a phone: one stepping button a date (820px and under) and the two parts as tabs (under 1510px) */
  const asPhone = () => { (window as any).matchMedia = (q: string) => ({ matches: /max-width:\s*(820|1509)px/.test(q), addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} }) }
  const asWide = () => { (window as any).matchMedia = (_q: string) => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} }) }
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(2026, 10, 3, 12, 0, 0))
    mem.clear()
    storeBackend.impl = { getItem: (k: string) => mem.get(k) ?? null, setItem: (k: string, v: string) => { if (v === 'null') mem.delete(k); else mem.set(k, v) }, keys: () => [...mem.keys()] } as any
    raptorInitStore()
    setSession({ user: 'admin-test', role: 'admin' })
    _resetTimeline(); installGlobalUndo()
    lwInitStore(memoryBackend())
    setRole('admin')
    asPhone()
  })
  afterEach(() => { cleanup(); _resetFloatWins(); setDaysWin(null); setSession(null); storeBackend.impl = null; _resetTimeline(); (window as any).matchMedia = realMM; vi.useRealTimers() })

  const t = (id: string) => screen.getByTestId(id)
  const q = (id: string) => screen.queryByTestId(id)
  const open = () => { render(<DaysWindow />); act(() => { setDaysWin('2026-11-02'); notify() }) }
  const month = () => t('days-month').textContent
  const steps = () => commandStream().length
  /* a real press: the finger goes down before the click it makes (the guard after a swipe is retired by that press) */
  const press = (el: Element) => { fireEvent.pointerDown(el); fireEvent.click(el) }

  it('a swipe left on the month goes to the next month, a swipe right to the last', () => {
    open()
    expect(month()).toBe('November 2026')
    swipe(t('days-grid'), -80); expect(month()).toBe('December 2026')
    swipe(t('days-grid'), -80); expect(month()).toBe('January 2027')
    swipe(t('days-grid'), 80); swipe(t('days-grid'), 80); swipe(t('days-grid'), 80)
    expect(month()).toBe('October 2026')
  })
  it('a swipe that begins on a date’s button turns the page and presses nothing', () => {
    open()
    const before = steps()
    const btn = t('days-step-2026-11-05')
    swipe(btn, -80)
    /* the click a browser may send after the lift */
    act(() => { btn.isConnected ? btn.click() : undefined })
    expect(month()).toBe('December 2026')
    expect(steps()).toBe(before)
    expect(flyAnswer('2026-11-05').cls).toBe('day')
  })
  it('a swipe that begins on a weekday’s heading opens no "Every …" window', () => {
    open()
    const wd = t('days-wd-3')
    swipe(wd, 80)
    act(() => { wd.click() })
    expect(month()).toBe('October 2026')
    expect(q('win-every')).toBeNull()
  })
  it('a tap is still a tap: a date’s button steps its day, and the page does not turn', () => {
    open()
    const before = steps()
    swipe(t('days-step-2026-11-05'), -6)
    fireEvent.click(t('days-step-2026-11-05'))
    expect(month()).toBe('November 2026')
    expect(steps()).toBe(before + 1)
    expect(flyAnswer('2026-11-05').cls).toBe('night')
  })
  it('it works anywhere on the part — the room under a short month, the head and the hint too', () => {
    open()
    swipe(t('days-parts'), -80); expect(month()).toBe('December 2026')
    swipe(t('days-part-month').querySelector('.days-hint')!, 80); expect(month()).toBe('November 2026')
    swipe(t('days-month'), 80); expect(month()).toBe('October 2026')
  })
  it('the arrows and Today stay, and still work', () => {
    open()
    swipe(t('days-grid'), -80)
    press(t('days-next')); expect(month()).toBe('January 2027')
    press(t('days-prev')); expect(month()).toBe('December 2026')
    press(t('days-today')); expect(month()).toBe('November 2026')
  })
  it('on the Holidays list a swipe left goes to the next year, a swipe right to the last — anywhere on it', () => {
    open()
    fireEvent.click(t('days-tab-holidays'))
    expect(t('hol-year').textContent).toBe('2026')
    swipe(t('days-part-holidays'), -80); expect(t('hol-year').textContent).toBe('2027')
    swipe(t('days-parts'), 80); swipe(t('hol-year'), 80)
    expect(t('hol-year').textContent).toBe('2025')
    /* and the month it left is where it was */
    press(t('days-tab-month'))
    expect(month()).toBe('November 2026')
  })
  it('a swipe that begins on a holiday’s line turns the year and opens no form', () => {
    open()
    fireEvent.click(t('days-tab-holidays'))
    const add = t('hol-add')
    swipe(add, -80)
    act(() => { add.click() })
    expect(t('hol-year').textContent).toBe('2027')
    expect(q('win-holiday')).toBeNull()
  })
  it('with both parts side by side, the part under the finger decides — month or year', () => {
    asWide()
    open()
    swipe(t('days-grid'), -80)
    expect(month()).toBe('December 2026'); expect(t('hol-year').textContent).toBe('2026')
    swipe(t('days-part-holidays'), -80)
    expect(month()).toBe('December 2026'); expect(t('hol-year').textContent).toBe('2027')
    /* the gap between the two is neither */
    swipe(t('days-parts'), -80)
    expect(month()).toBe('December 2026'); expect(t('hol-year').textContent).toBe('2027')
  })
  it('a mouse is untouched: a drag across the month turns nothing', () => {
    open()
    const g = t('days-grid')
    fireEvent.pointerDown(g, { pointerType: 'mouse', clientX: 300, clientY: 300 })
    fireEvent.mouseDown(g, { clientX: 300, clientY: 300 }); fireEvent.mouseMove(g, { clientX: 150, clientY: 300 }); fireEvent.mouseUp(g, { clientX: 150, clientY: 300 })
    fireEvent.pointerUp(g, { pointerType: 'mouse', clientX: 150, clientY: 300 })
    expect(month()).toBe('November 2026')
  })
})
