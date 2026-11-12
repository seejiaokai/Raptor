/* THE APPROVALS PAGE SCROLLS INSIDE ITSELF ON A PC, AS THE BALANCES PAGE DOES ([APPROVALS-SCROLL-INSIDE] — his D1986, and
   his answers to the drawings, docs/superpowers/specs/2026-11-12-approvals-scroll-drawings.md):
   · on a PC the page fits the screen and only its list scrolls — the title, the chips, Approve all and the column headings
     staying, as Balances does (his D2006, 12 Nov 26); fitted by the Balances page's own rule, the screen's TRUE height
     (BalancesPage.tsx; lesson 31 of the bug-check order);
   · a short list still has its card reach the foot of the screen, empty below the last request, so the card's edge stays
     put when a month is picked (his D2008, 13 Nov 26);
   · on a phone the page stays as it is today — the whole page scrolls — so more requests are seen at once (D2006's phone
     half, his choice B on picture 5). That half is pinned FIRST, against today's page (the order's §8 point 7).
   · the list keeps its own place across "Back to Approvals" (the drawings' finding: today's code restores the window's
     scroll, which a PC's page no longer has); the "New" filter's "Also since you last looked" block scrolls inside the list.
   "A phone" is the Leave War's own `(max-width: 700px)` (ui/phone.ts) — the split both pages already draw by. jsdom has no
   matchMedia, so a test is a PC's unless it stands one up. */
import { act, render, screen } from '@testing-library/react'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { storeBackend, HOOKS } from '../../engine/hooks'
import { PEOPLE, indexCallsigns } from '../../engine/people'
import { INPUTS } from '../../engine/inputs'
import { initStore as raptorInitStore, notify as raptorNotify, resetSession } from '../../state/store'
import { accountsLoad, signIn, sessionFor } from '../../state/accounts'
import { installGlobalUndo } from '../../state/undo-wire'
import { _resetTimeline } from '../../undo/timeline'
import { NOTICES } from '../../state/notices'
import { noticeSeenLoad } from '../../state/noticeseen'
import { clearCells, initStore as lwInitStore, lwHistInit, setCell, setPeople } from '../state/store'
import { memoryBackend } from '../state/storage'
import { projectPeople } from '../state/raptorRoster'
import { wireLeaveWarSync } from '../sync'
import { ApprovalsPage } from './ApprovalsPage'
import { setApprMode } from './lwnav'
import { PHONE_QUERY } from './phone'

const mem: Record<string, string> = {}
let PEOPLE0 = ''
const ISNAP = JSON.stringify(INPUTS)
const toast = HOOKS.toast
const T = (h: number, day = 15): number => { const d = new Date(2026, 6, day, h, 0, 0); vi.setSystemTime(d); return d.getTime() }
const signInAs = (name: string, pass = 'x') => { resetSession(sessionFor(signIn(name, pass))); raptorNotify() }
const saber = () => signInAs('ad', 'a')
const ranger = () => signInAs('us', 'us')
const origMM = window.matchMedia
const asPhone = () => {
  ;(window as any).matchMedia = (q: string) => ({ matches: q === PHONE_QUERY, media: q, onchange: null, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, dispatchEvent() { return false } })
}
/* a phone turned on its side, or a desktop window dragged narrow, crosses the width while the page is up (ui/phone.ts) */
const flippable = (on: boolean) => {
  const fns = new Set<() => void>()
  ;(window as any).matchMedia = (q: string) => ({
    media: q, get matches() { return q === PHONE_QUERY ? on : false },
    addEventListener: (_: string, fn: () => void) => { fns.add(fn) }, removeEventListener: (_: string, fn: () => void) => { fns.delete(fn) },
  })
  return (next: boolean) => { on = next; act(() => { fns.forEach(f => f()) }) }
}

beforeAll(() => { vi.useFakeTimers({ toFake: ['Date'] }); PEOPLE0 = JSON.stringify(PEOPLE) })
afterAll(() => { vi.useRealTimers(); storeBackend.impl = null })
beforeEach(() => {
  T(8)
  Object.keys(mem).forEach(k => delete mem[k])
  storeBackend.impl = { getItem: (k: string) => (k in mem ? mem[k]! : null), setItem: (k: string, v: string) => { mem[k] = v }, keys: () => Object.keys(mem) }
  const p0 = JSON.parse(PEOPLE0)
  for (const k of Object.keys(PEOPLE)) delete (PEOPLE as any)[k]
  Object.assign(PEOPLE, p0); indexCallsigns()
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
  NOTICES.length = 0
  lwInitStore(memoryBackend())
  raptorInitStore()
  accountsLoad()
  noticeSeenLoad()
  setPeople(projectPeople())
  wireLeaveWarSync()
  _resetTimeline(); lwHistInit(); installGlobalUndo()
  HOOKS.toast = () => {}
  saber()
})
afterEach(() => {
  HOOKS.toast = toast; setApprMode('off'); _resetTimeline(); resetSession(null)
  ;(window as any).matchMedia = origMM
  document.body.classList.remove('lw-appr-on')
})

const MON = '2026-02-09', TUE = '2026-02-10', WED = '2026-02-11', THU = '2026-02-12'
/* three of Ranger's requests, so the list has lines */
const threeLines = () => { ranger(); for (const d of [MON, TUE, WED]) expect(setCell('bane', d, d === TUE ? 'OL' : 'LL')).toBe(true); saber() }
/* "Also since you last looked": Saber looked at 08:00; at 10:00 Ranger withdrew a bid placed at 09:00, and placed one more —
   so under "New" the list holds the new request and the block holds the withdrawal (sync.ts alsoSince) */
const withAlso = () => {
  const first = render(<ApprovalsPage shown={true} />); first.unmount()      // Saber opened Approvals at 08:00
  T(9); ranger(); expect(setCell('bane', TUE, 'LL')).toBe(true); expect(setCell('bane', THU, 'LL')).toBe(true)
  T(10); expect(clearCells([{ personId: 'bane', date: TUE }])).toBeTruthy()
  T(11); saber()
}
const page = () => screen.getByTestId('approvals-page')
const card = () => page().querySelector<HTMLElement>('.appr-card')!

/* the screen and the page's top, as a real browser reports them (jsdom measures nothing) */
const measured = (inner: number, vv: { height: number; scale: number } | undefined, top: number) => {
  const ih = Object.getOwnPropertyDescriptor(window, 'innerHeight')
  const v = Object.getOwnPropertyDescriptor(window, 'visualViewport')
  Object.defineProperty(window, 'innerHeight', { configurable: true, get: () => inner })
  Object.defineProperty(window, 'visualViewport', { configurable: true, get: () => vv })
  const spy = vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (this: Element) {
    const h = this.matches('[data-testid="approvals-page"]') ? 2000 : 0
    return { left: 0, top: h ? top : 0, right: 0, bottom: h ? top + h : 0, width: 0, height: h, x: 0, y: h ? top : 0, toJSON() {} } as DOMRect
  })
  return () => {
    spy.mockRestore()
    if (ih) Object.defineProperty(window, 'innerHeight', ih); else delete (window as any).innerHeight
    if (v) Object.defineProperty(window, 'visualViewport', v); else delete (window as any).visualViewport
  }
}

/* ---------------------------------------------------------------------------------------------- the phone: as today */
describe('on a phone the Approvals page stays as it is today — the whole page scrolls (D2006, his choice B)', () => {
  beforeEach(() => { asPhone() })

  it('the page is as tall as its list: no fitted height, and the window keeps its bottom pad', () => {
    threeLines()
    const restore = measured(734, { height: 733.6, scale: 1 }, 120)
    try {
      render(<ApprovalsPage shown={true} />)
      expect(page().style.height, 'no height fitted to the screen').toBe('')
      expect(document.body.classList.contains('lw-appr-on'), 'the window keeps its pad, so the page scrolls as today').toBe(false)
    } finally { restore() }
  })

  it('the list stands in the card as today, no scrolling box of its own; the column headings inside it, its first part', () => {
    threeLines()
    render(<ApprovalsPage shown={true} />)
    expect(page().querySelector('[data-testid="appr-scroll"]'), 'no list box scrolling inside the page').toBeNull()
    const list = card().querySelector(':scope > .appr-list')
    expect(list, 'the list a part of the card itself').not.toBeNull()
    expect(list!.firstElementChild!.classList.contains('appr-cols'), 'the phone\'s headings, at the list\'s top').toBe(true)
    expect(list!.querySelectorAll('[data-testid="appr-line-bane"]')).toHaveLength(3)
  })

  it('"Also since you last looked" stands in the card under the list, as today', () => {
    withAlso()
    render(<ApprovalsPage shown={true} />)
    act(() => { screen.getByTestId('appr-new').click() })
    const also = screen.getByTestId('appr-also')
    expect(also.parentElement, 'a part of the card itself').toBe(card())
    expect(also.previousElementSibling?.classList.contains('appr-list'), 'right under the list').toBe(true)
  })

  it('Pick dates… opens its calendar in the card between the chips and the list, as today', () => {
    threeLines()
    render(<ApprovalsPage shown={true} />)
    act(() => { screen.getByTestId('appr-pick').click() })
    const pop = page().querySelector<HTMLElement>('.appr-pickpop')!
    expect(pop.parentElement, 'a part of the card itself').toBe(card())
    expect(pop.previousElementSibling?.classList.contains('appr-filters'), 'right under the chips').toBe(true)
    expect(pop.nextElementSibling?.classList.contains('appr-list'), 'the list right under it').toBe(true)
  })
})

/* ---------------------------------------------------------------------------------------------- a PC */
describe('on a PC the page fits the screen and only its list scrolls, as Balances does (D2006)', () => {
  it('fitted to the screen\'s TRUE height: 733.6 that the browser calls 734 ends the page at 733 (lesson 31)', () => {
    threeLines()
    const restore = measured(734, { height: 733.6, scale: 1 }, 120)
    try {
      render(<ApprovalsPage shown={true} />)
      expect(page().style.height).toBe(`${733 - 120}px`)
    } finally { restore() }
  })

  it('never taller than the rounded figure, and a screen made shorter by something else (a keyboard) does not shrink it', () => {
    threeLines()
    let restore = measured(734, { height: 734.4, scale: 1 }, 120)
    try { const r = render(<ApprovalsPage shown={true} />); expect(page().style.height).toBe(`${734 - 120}px`); r.unmount() } finally { restore() }
    restore = measured(734, { height: 400, scale: 1 }, 120)
    try { render(<ApprovalsPage shown={true} />); expect(page().style.height).toBe(`${734 - 120}px`) } finally { restore() }
  })

  it('the page\'s top is read in the page\'s measure: opened with the window scrolled, the page is not made taller by it', () => {
    threeLines()
    const restore = measured(900, { height: 900, scale: 1 }, 120 - 300)
    const sy = Object.getOwnPropertyDescriptor(window, 'scrollY')
    Object.defineProperty(window, 'scrollY', { configurable: true, get: () => 300 })
    try {
      render(<ApprovalsPage shown={true} />)
      expect(page().style.height).toBe(`${900 - 120}px`)
    } finally { restore(); if (sy) Object.defineProperty(window, 'scrollY', sy); else delete (window as any).scrollY }
  })

  it('a short list keeps the same height: the card reaches the foot of the screen, empty below its last request (D2008)', () => {
    ranger(); expect(setCell('bane', MON, 'LL')).toBe(true); saber()
    const restore = measured(734, { height: 733.6, scale: 1 }, 120)
    try {
      render(<ApprovalsPage shown={true} />)
      expect(page().style.height, 'one request, the page the screen\'s height all the same').toBe(`${733 - 120}px`)
    } finally { restore() }
  })

  it('the window keeps no pad below the page while it is up — and gets it back when the page is hidden behind the grid or closed', () => {
    threeLines()
    const r = render(<ApprovalsPage shown={true} />)
    expect(document.body.classList.contains('lw-appr-on')).toBe(true)
    r.rerender(<ApprovalsPage shown={false} />)
    expect(document.body.classList.contains('lw-appr-on'), 'the slim bar up, the grid showing: its pad back').toBe(false)
    r.rerender(<ApprovalsPage shown={true} />)
    expect(document.body.classList.contains('lw-appr-on'), 'Back to Approvals').toBe(true)
    r.unmount()
    expect(document.body.classList.contains('lw-appr-on'), 'Approvals left').toBe(false)
  })

  it('the title, the chips, Approve all and the column headings stand outside the box that scrolls; the lines inside it', () => {
    threeLines()
    render(<ApprovalsPage shown={true} />)
    const sc = screen.getByTestId('appr-scroll')
    expect(sc.parentElement, 'the box that scrolls is the card\'s own').toBe(card())
    for (const sel of ['.appr-head', '.appr-filters', '[data-testid="appr-approve-all"]']) {
      expect(sc.querySelector(sel), `${sel} stays — outside the list`).toBeNull()
      expect(card().querySelector(sel), `${sel} in the card`).not.toBeNull()
    }
    /* the headings pin at the box's own top (sticky), so they are its first part, never inside a line's list */
    expect(sc.firstElementChild!.classList.contains('appr-cols'), 'the column headings, the box\'s first part').toBe(true)
    expect(sc.querySelectorAll('[data-testid="appr-line-bane"]'), 'every line scrolls inside it').toHaveLength(3)
    expect(sc.querySelector('[role="list"] .appr-cols'), 'no heading row inside the list itself').toBeNull()
  })

  it('"Also since you last looked" scrolls inside the list, under the new requests', () => {
    withAlso()
    render(<ApprovalsPage shown={true} />)
    act(() => { screen.getByTestId('appr-new').click() })
    const sc = screen.getByTestId('appr-scroll')
    expect(sc.contains(screen.getByTestId('appr-also')), 'inside the box that scrolls').toBe(true)
    expect(screen.getAllByTestId('appr-line-bane'), 'the new request listed above it').toHaveLength(1)
  })

  it('"Nothing here for these dates" stands in the same box, so the card keeps its height', () => {
    threeLines()
    render(<ApprovalsPage shown={true} />)
    act(() => { screen.getByTestId('appr-m-2026-03').click() })
    const sc = screen.getByTestId('appr-scroll')
    expect(sc.textContent).toContain('Nothing here for these dates.')
  })

  /* THE WALK'S FINDING (W3, 13 Nov 26): the date calendar stood between the chips and the box that scrolls, in a card now
     fixed to the screen's height — on a short PC window it squeezed the list to 28px and the card cut off its last weeks,
     which nothing could scroll to (on main the window scrolled to them). It opens at the top of the box that scrolls
     instead, as on main it pushed the list down the page: on any height the wheel reaches its last day and the list under it. */
  it('Pick dates… opens its calendar at the top of the box that scrolls, brought into view, so a short window reaches all of it', () => {
    threeLines()
    render(<ApprovalsPage shown={true} />)
    const sc = screen.getByTestId('appr-scroll')
    sc.scrollTop = 200                                                  // he had wheeled down the list
    act(() => { screen.getByTestId('appr-pick').click() })
    const pop = page().querySelector<HTMLElement>('.appr-pickpop')!
    expect(pop, 'the calendar is open').not.toBeNull()
    expect(pop.parentElement, 'inside the box that scrolls').toBe(sc)
    expect(sc.firstElementChild, 'its first part, above the column headings').toBe(pop)
    expect(sc.scrollTop, 'brought into view: the box back at its top').toBe(0)
  })

  it('the list keeps its own place across "Back to Approvals", even where the browser forgot it while hidden', () => {
    threeLines()
    const r = render(<ApprovalsPage shown={true} />)
    const sc = () => screen.getByTestId('appr-scroll')
    sc().scrollTop = 300
    act(() => { sc().dispatchEvent(new Event('scroll')) })
    r.rerender(<ApprovalsPage shown={false} />)                        // a request's dates tapped: the grid, the slim bar
    sc().scrollTop = 0                                                 // a hidden box may lose its place (display: none)
    act(() => { sc().dispatchEvent(new Event('scroll')) })             // …and say so while hidden: not his place
    r.rerender(<ApprovalsPage shown={true} />)                         // Back ▴
    expect(sc().scrollTop, 'the place he left').toBe(300)
  })

  it('a window dragged narrow to a phone\'s width while the page is up takes the phone\'s page; back wide, the PC\'s again', () => {
    threeLines()
    const flip = flippable(false)
    const restore = measured(734, { height: 733.6, scale: 1 }, 120)
    try {
      render(<ApprovalsPage shown={true} />)
      expect(page().style.height).toBe(`${733 - 120}px`)
      flip(true)
      expect(page().style.height, 'the phone\'s page is as tall as its list').toBe('')
      expect(document.body.classList.contains('lw-appr-on')).toBe(false)
      expect(page().querySelector('[data-testid="appr-scroll"]')).toBeNull()
      flip(false)
      expect(page().style.height).toBe(`${733 - 120}px`)
      expect(document.body.classList.contains('lw-appr-on')).toBe(true)
    } finally { restore() }
  })
})
