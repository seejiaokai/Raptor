// @vitest-environment jsdom
/* THE FOUR ROWS UNDER THE EVENT ROWS — Required P, Required W, Available P, Available W (the build plan
   docs/superpowers/plans/2026-10-07-inputs-sans-redesign-plan.md §3.3; owner D617, D626, D637, D640).

   What each cell shows for each kind of day, for an admin and a member — this file is the rows as they are READ; the
   typing and the picking are their own files. A Required cell shows the one resolver's figure (sync.ts flyAnswer),
   "NF" on a no-fly day, or a dash; the day a running figure starts wears a corner mark. An Available cell shows the
   war's own count (never a SANS man), red where it is under its Required; a tap on it opens the working — required,
   available, SANS committed to fly, still needed — for everyone. The rows hear BOTH stores: a figure typed in the
   scheduler's records and a bid on the war each repaint them, with no reload. */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { storeBackend } from '../../engine/hooks'
import { initStore as raptorInitStore } from '../../state/store'
import { setSession } from '../../state/auth'
import { saveFlyNames, setFlyDays, setFlyRun } from '../../state/flyplan'
import { getState, initStore as lwInitStore, setCell, setPeople, setRole } from '../state/store'
import { memoryBackend } from '../state/storage'
import { projectPeople } from '../state/raptorRoster'
import { dayFacts, flyAnswer } from '../sync'
import { Matrix } from './Matrix'
import { FLY_ROW_KEYS } from './FlyRows'

const mem = new Map<string, string>()
beforeEach(() => {
  mem.clear()
  storeBackend.impl = { getItem: (k: string) => mem.get(k) ?? null, setItem: (k: string, v: string) => { if (v === 'null') mem.delete(k); else mem.set(k, v) }, keys: () => [...mem.keys()] } as any
  raptorInitStore()
  setSession({ user: 'admin-test', role: 'admin' })
  lwInitStore(memoryBackend())
  setRole('admin')
  setPeople(projectPeople())
})
afterEach(() => { cleanup(); setSession(null); storeBackend.impl = null })

/* the demo year: Thu 1 Jan is a public holiday; Mon 5 – Fri 9 Jan are plain weekdays; Sat 10 a weekend */
const PH = '2026-01-01', MON = '2026-01-05', TUE = '2026-01-06', WED = '2026-01-07', THU = '2026-01-08', SAT = '2026-01-10'
const cell = (row: 'req-p' | 'req-w' | 'avail-p' | 'avail-w', iso: string) => screen.getByTestId(`${row}-${iso}`)
const txt = (row: Parameters<typeof cell>[0], iso: string) => cell(row, iso).textContent
const show = (n: number | null) => (n == null ? '–' : String(Math.round(n * 10) / 10))

describe('where they sit (D665, 8 Oct 26 — at the foot of the Manning block, not under the Event rows)', () => {
  const ROWS = ['fly-row-req-p', 'fly-row-req-w', 'fly-row-avail-p', 'fly-row-avail-w']
  it('the four are the LAST rows of the Manning block, under the squadron’s own counts, each with a cell for every drawn day', () => {
    render(<Matrix />)
    const block = screen.getByTestId('fly-row-req-p').parentElement!
    expect(block.tagName).toBe('TBODY')
    expect(block.className).toBe('counts')
    const ids = [...block.querySelectorAll(':scope > tr')].map(tr => tr.getAttribute('data-testid') ?? '')
    expect(ids.slice(-4)).toEqual(ROWS)
    expect(ids.length).toBeGreaterThan(4)
    expect(ids.slice(0, -4).every(id => id.startsWith('count-'))).toBe(true)
    const cells = (tid: string) => screen.getByTestId(tid).children.length
    for (const id of ROWS) expect(cells(id)).toBe(cells(ids[0]!))
  })
  it('the Event rows’ block holds the Event rows and nothing else', () => {
    render(<Matrix />)
    const block = screen.getByTestId('event-row-0').parentElement!
    expect([...block.querySelectorAll('tr')].map(tr => tr.getAttribute('data-testid'))).toEqual(['event-row-0', 'event-row-1'])
  })
  it('they fold away with the Manning button, as the other counts do, and come back with it', () => {
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('counts-toggle'))
    expect(screen.queryByTestId('fly-row-req-p')).toBeNull()
    expect(screen.queryByTestId('count-sets')).toBeNull()
    fireEvent.click(screen.getByTestId('counts-toggle'))
    expect(screen.getByTestId('fly-row-avail-w')).toBeTruthy()
  })
  it('in Rearrange they stay put: no grip to drag one by, no eye to hide one with — and the Archive opens BELOW them', () => {
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('roster-arrange'))
    for (const id of ROWS) expect(screen.getByTestId(id).querySelector('button, [data-testid^="manning-drag-"], [data-testid^="manning-hide-"]')).toBeNull()
  })
  it('the Figures drawer needs no box for them: it starts at the dates, below the Manning block', () => {
    expect(FLY_ROW_KEYS).toEqual(ROWS)
  })
  it('never wears a prefix the grid’s drag code hit-tests', () => {
    render(<Matrix />)
    const mine = [...document.querySelectorAll('[data-testid^="fly-row-"] td')].map(td => td.getAttribute('data-testid') ?? '')
    expect(mine.some(t => /^(event-|cell-|count-)/.test(t))).toBe(false)
  })
})

describe('a Required cell', () => {
  it('with nothing set: a dash, on a weekday, a weekend and a holiday alike', () => {
    render(<Matrix />)
    for (const iso of [MON, SAT, PH]) { expect(txt('req-p', iso)).toBe('–'); expect(txt('req-w', iso)).toBe('–') }
  })
  it('a figure typed for the date', () => {
    setFlyDays([{ iso: TUE, p: 18, w: 16 }])
    render(<Matrix />)
    expect(txt('req-p', TUE)).toBe('18')
    expect(txt('req-w', TUE)).toBe('16')
    expect(cell('req-p', TUE).className).toContain('set')
    expect(cell('req-p', TUE).className).not.toContain('runstart')
  })
  it('a running figure: every flying day from its start, a corner mark on the day it starts, weekends and holidays skipped', () => {
    setFlyRun(TUE, { p: 16 })
    render(<Matrix />)
    expect(txt('req-p', TUE)).toBe('16')
    expect(cell('req-p', TUE).className).toContain('runstart')
    expect(cell('req-p', TUE).getAttribute('title')).toBe('16 from Tue 6 Jan onward')
    expect(txt('req-p', WED)).toBe('16')
    expect(cell('req-p', WED).className).not.toContain('runstart')
    expect(txt('req-p', MON)).toBe('–')
    expect(txt('req-p', SAT)).toBe('–')
    expect(txt('req-w', TUE)).toBe('–')          // pilots and WSOs run apart
  })
  it('a no-fly day reads NF whatever is typed under it, and says where to change it', () => {
    setFlyRun(TUE, { p: 16, w: 16 })
    setFlyDays([{ iso: WED, cls: 'nf', p: 20 }])
    render(<Matrix />)
    expect(txt('req-p', WED)).toBe('NF')
    expect(txt('req-w', WED)).toBe('NF')
    expect(cell('req-p', WED).className).toContain('nf')
    expect(cell('req-p', WED).getAttribute('title')).toMatch(/no-fly day/i)
  })
  it('a figure typed on a weekend or a holiday holds', () => {
    setFlyDays([{ iso: SAT, p: 4 }, { iso: PH, w: 2 }])
    render(<Matrix />)
    expect(txt('req-p', SAT)).toBe('4')
    expect(txt('req-w', PH)).toBe('2')
  })
  it('agrees with the one resolver on every drawn day of the month', () => {
    setFlyRun(TUE, { p: 16, w: 15 })
    setFlyDays([{ iso: THU, cls: 'nf' }, { iso: '2026-01-12', p: 9 }])
    render(<Matrix />)
    for (let d = 1; d <= 31; d++) {
      const iso = `2026-01-${String(d).padStart(2, '0')}`
      const a = flyAnswer(iso)
      for (const s of ['p', 'w'] as const) expect(txt(`req-${s}`, iso), `${iso} ${s}`).toBe(a.reqFrom[s] === 'nf' ? 'NF' : show(a.req[s]))
    }
  })
})

describe('an Available cell', () => {
  it('shows the war’s own count for the seat', () => {
    render(<Matrix />)
    for (const iso of [MON, TUE, SAT]) {
      expect(txt('avail-p', iso)).toBe(show(dayFacts(iso).availP))
      expect(txt('avail-w', iso)).toBe(show(dayFacts(iso).availW))
    }
  })
  it('is red where it is under its Required, and only there', () => {
    const f = dayFacts(TUE)
    setFlyDays([{ iso: TUE, p: f.availP! + 3, w: Math.floor(f.availW!) }])
    render(<Matrix />)
    expect(cell('avail-p', TUE).className).toContain('under')
    expect(cell('avail-w', TUE).className).not.toContain('under')
    expect(cell('avail-p', WED).className).not.toContain('under')   // no figure, nothing to be under
  })
  it('a no-fly day needs nobody: never red', () => {
    setFlyDays([{ iso: TUE, cls: 'nf', p: 99 }])
    render(<Matrix />)
    expect(cell('avail-p', TUE).className).not.toContain('under')
  })
})

describe('the rows hear both stores, with no reload', () => {
  it('a figure typed in the plan', () => {
    render(<Matrix />)
    expect(txt('req-p', TUE)).toBe('–')
    act(() => { setFlyDays([{ iso: TUE, p: 18 }]) })
    expect(txt('req-p', TUE)).toBe('18')
    act(() => { setFlyRun(WED, { w: 12 }) })
    expect(txt('req-w', THU)).toBe('12')
  })
  it('leave on the war', () => {
    render(<Matrix />)
    const pilot = getState().people.find(p => p.seat === 'pilot' && !p.pers && !p.san)!
    const before = dayFacts(TUE).availP!
    act(() => { setCell(pilot.id, TUE, 'LL') })
    expect(dayFacts(TUE).availP).toBe(before - 1)
    expect(txt('avail-p', TUE)).toBe(show(before - 1))
  })
})

describe('their names', () => {
  it('start as Required P / W and Available P / W, each with the short form a phone shows', () => {
    render(<Matrix />)
    const name = (id: string) => screen.getByTestId(`fly-row-${id}`).querySelector('.who')!
    expect(name('req-p').querySelector('.frl-long')!.textContent).toBe('Required P')
    expect(name('req-p').querySelector('.frl-short')!.textContent).toBe('Req P')
    expect(name('req-w').querySelector('.frl-short')!.textContent).toBe('Req W')
    expect(name('avail-p').querySelector('.frl-long')!.textContent).toBe('Available P')
    expect(name('avail-w').querySelector('.frl-short')!.textContent).toBe('Avail W')
  })
  it('a name of his own shows as typed, at every width', () => {
    saveFlyNames({ p: 'Pilots to fly', w: 'Required W' })
    render(<Matrix />)
    const who = screen.getByTestId('fly-row-req-p').querySelector('.who')!
    expect(who.textContent).toBe('Pilots to fly')
    expect(who.querySelector('.frl-short')).toBeNull()
    expect(screen.getByTestId('fly-row-req-w').querySelector('.frl-short')!.textContent).toBe('Req W')
  })
})

describe('a member', () => {
  it('sees all four rows with the same figures, and nothing to edit', () => {
    setFlyRun(TUE, { p: 16, w: 16 })
    setRole('member')
    render(<Matrix />)
    expect(txt('req-p', TUE)).toBe('16')
    expect(txt('avail-w', TUE)).toBe(show(dayFacts(TUE).availW))
    expect(cell('req-p', TUE).className).not.toContain('editable')
  })
})

describe('the working, on a tap of an Available cell', () => {
  const open = (row: 'avail-p' | 'avail-w', iso: string) => { fireEvent.click(cell(row, iso)); return screen.getByTestId('fly-working') }
  const line = (id: string) => screen.getByTestId(`fly-working-${id}`).textContent
  it('required, available, SANS committed to fly, still needed — the resolver’s own numbers', () => {
    const f = dayFacts(TUE)
    setFlyDays([{ iso: TUE, p: f.availP! + 3 }])
    render(<Matrix />)
    const box = open('avail-p', TUE)
    expect(box.textContent).toContain('Tue 6 Jan')
    expect(box.textContent).toContain('Pilots')
    expect(line('req')).toBe(`Required${f.availP! + 3}`)
    expect(line('avail')).toBe(`Available${show(f.availP)}`)
    expect(line('sans')).toBe('SANS committed to fly0')
    expect(line('need')).toBe('Still needed3')
  })
  it('with no figure set: dashes, never a made-up need', () => {
    render(<Matrix />)
    open('avail-w', TUE)
    expect(screen.getByTestId('fly-working').textContent).toContain('WSOs')
    expect(line('req')).toBe('Required–')
    expect(line('need')).toBe('Still needed–')
  })
  it('for a member too, read only', () => {
    setRole('member')
    render(<Matrix />)
    expect(open('avail-p', TUE)).toBeTruthy()
    expect(screen.getByTestId('fly-working').querySelector('button, input')).toBeNull()
  })
  it('a small menu: a press outside, Escape and a scroll close it; a second tap on its cell too', () => {
    render(<Matrix />)
    open('avail-p', TUE); fireEvent.pointerDown(screen.getByTestId('event-0-2026-01-08'))
    expect(screen.queryByTestId('fly-working')).toBeNull()
    open('avail-p', TUE); fireEvent.keyDown(window, { key: 'Escape' })
    expect(screen.queryByTestId('fly-working')).toBeNull()
    open('avail-p', TUE); fireEvent.scroll(window)
    expect(screen.queryByTestId('fly-working')).toBeNull()
    open('avail-p', TUE); fireEvent.pointerDown(cell('avail-p', TUE)); fireEvent.click(cell('avail-p', TUE))
    expect(screen.queryByTestId('fly-working')).toBeNull()
  })
})
