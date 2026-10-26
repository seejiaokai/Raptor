// @vitest-environment jsdom
/* THE REQUIRED ROWS' NAMES AND THE FOUR ROWS' LOOK (the Leave War overhaul, batch 3).

   D1193 (21 Oct 26, narrowing D668): Required P and Required W may be renamed — the name only; their figures stay typed
   in their cells. An admin's tap on the row's name opens a small window (drawn r7-27); a phone's short form ("Req P")
   shows only while the name is the one it started with; every window that names the row reads its name.
   D1194: the Required / Available pairs are tinted faintly — the pilots' pair one tint, the WSOs' another — and a counter
   standing among them (D674) wears none.
   D1190, D1191, D1202: an Available figure is amber under its amber point and red under its red point, each that day's
   Required plus or minus the row's own number; red wins where both hold. */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { storeBackend } from '../../engine/hooks'
import { initStore as raptorInitStore } from '../../state/store'
import { setSession } from '../../state/auth'
import { setFlyDays } from '../../state/flyplan'
import { AVAIL_P, AVAIL_W } from '../engine'
import { getState, initStore as lwInitStore, moveManningRowTo, setAvailPoints, setPeople, setReqName, setRole } from '../state/store'
import { memoryBackend } from '../state/storage'
import { projectPeople } from '../state/raptorRoster'
import { elevenCounters } from '../testkit'
import { dayFacts, warFactsVersion } from '../sync'
import { Matrix } from './Matrix'

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

const TUE = '2026-01-06', WED = '2026-01-07'
const who = (row: string) => screen.getByTestId(`fly-row-${row}`).querySelector('.who')!
const q = (id: string) => screen.queryByTestId(id)

describe('renaming a Required row (D1193)', () => {
  it('an admin’s tap on its name opens the window with the name in it; Save renames the row, which repaints', () => {
    render(<Matrix />)
    const v = warFactsVersion()
    fireEvent.click(screen.getByTestId('fly-name-req-p'))
    const box = screen.getByTestId('reqname-name') as HTMLInputElement
    expect(box.value).toBe('Required P')
    fireEvent.change(box, { target: { value: 'Pilots to fly' } })
    fireEvent.click(screen.getByTestId('reqname-save'))
    expect(q('req-name-form')).toBeNull()
    expect(getState().reqNames).toEqual({ p: 'Pilots to fly' })
    expect(warFactsVersion()).toBeGreaterThan(v)
    /* a name of his own shows as typed at every width — no short form */
    expect(who('req-p').textContent).toBe('Pilots to fly')
    expect(who('req-p').querySelector('.frl-short')).toBeNull()
    expect(screen.getByTestId('fly-name-req-p').getAttribute('title')).toBe('Rename Pilots to fly')
    /* the other row keeps its name, and its phone short form */
    expect(who('req-w').querySelector('.frl-short')!.textContent).toBe('Req W')
  })
  it('a rename made anywhere repaints the rows, with no reload', () => {
    render(<Matrix />)
    act(() => { setReqName('w', 'WSOs to fly') })
    expect(who('req-w').textContent).toBe('WSOs to fly')
  })
  it('blank, or the original typed back, puts the original back — and with it the short form', () => {
    setReqName('p', 'Pilots to fly')
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('fly-name-req-p'))
    fireEvent.change(screen.getByTestId('reqname-name'), { target: { value: '  ' } })
    fireEvent.click(screen.getByTestId('reqname-save'))
    expect(getState().reqNames).toEqual({})
    expect(who('req-p').querySelector('.frl-long')!.textContent).toBe('Required P')
    expect(who('req-p').querySelector('.frl-short')!.textContent).toBe('Req P')
  })
  it('Cancel changes nothing; Enter saves', () => {
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('fly-name-req-w'))
    fireEvent.change(screen.getByTestId('reqname-name'), { target: { value: 'Nope' } })
    fireEvent.click(screen.getByTestId('reqname-cancel'))
    expect(getState().reqNames).toEqual({})
    fireEvent.click(screen.getByTestId('fly-name-req-w'))
    fireEvent.change(screen.getByTestId('reqname-name'), { target: { value: 'WSOs to fly' } })
    fireEvent.keyDown(screen.getByTestId('reqname-name'), { key: 'Enter' })
    expect(getState().reqNames).toEqual({ w: 'WSOs to fly' })
  })
  it('a member sees the name as plain text: nothing to press', () => {
    setReqName('p', 'Pilots to fly')
    setRole('member')
    render(<Matrix />)
    expect(q('fly-name-req-p')).toBeNull()
    fireEvent.click(who('req-p'))
    expect(q('req-name-form')).toBeNull()
    expect(who('req-p').textContent).toBe('Pilots to fly')
  })
  it('the box that types a Required figure names the row by its own name', () => {
    setReqName('p', 'Pilots to fly')
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(`req-p-${TUE}`))
    expect(screen.getByTestId('fly-edit-input').getAttribute('aria-label')).toBe('Pilots to fly, Tue 6 Jan')
    expect(screen.getByTestId('fly-edit-strip').textContent).toContain('Pilots to fly')
  })
})

describe('the pairs tinted faintly (D1194)', () => {
  it('Required P with Available P one tint, the W pair the other', () => {
    render(<Matrix />)
    for (const r of ['req-p', 'avail-p']) expect(screen.getByTestId(`fly-row-${r}`).classList.contains('pair-p'), r).toBe(true)
    for (const r of ['req-w', 'avail-w']) expect(screen.getByTestId(`fly-row-${r}`).classList.contains('pair-w'), r).toBe(true)
  })
  it('a counter standing among the four wears no tint', () => {
    elevenCounters()
    moveManningRowTo('ip', '@avail-p')                                // between Required W and Available P (D674)
    render(<Matrix />)
    const row = screen.getByTestId('count-ip')
    expect(row.previousElementSibling!.getAttribute('data-testid')).toBe('fly-row-req-w')
    expect(row.className).not.toMatch(/pair-/)
  })
})

describe('an Available figure at its amber and red points', () => {
  it('amber under Required + amber, red under Required + red — red wins where both hold', () => {
    const p = dayFacts(TUE).availP!, w = dayFacts(WED).availW!
    setFlyDays([{ iso: TUE, p: p - 1 }, { iso: WED, p: p + 5, w: w + 1 }])
    setAvailPoints(AVAIL_P, { amber: 2, red: 0 })
    render(<Matrix />)
    const cls = (row: string, iso: string) => screen.getByTestId(`${row}-${iso}`).className
    expect(cls('avail-p', TUE)).toContain('amb')                        // one to spare: amber
    expect(cls('avail-p', TUE)).not.toContain('under')
    expect(cls('avail-p', WED)).toContain('under')                      // short: red, not amber too
    expect(cls('avail-p', WED)).not.toContain('amb')
    expect(cls('avail-w', WED)).toContain('under')                      // no points of its own: today's rule
  })
  it('a point changed while the grid is up repaints the row', () => {
    const p = dayFacts(TUE).availP!
    setFlyDays([{ iso: TUE, p: p - 1 }])
    render(<Matrix />)
    const cell = () => screen.getByTestId(`avail-p-${TUE}`).className
    expect(cell()).not.toContain('amb')
    act(() => { setAvailPoints(AVAIL_P, { amber: 2, red: 0 }) })
    expect(cell()).toContain('amb')
    act(() => { setAvailPoints(AVAIL_P, { red: 2 }) })
    expect(cell()).toContain('under')
    act(() => { setAvailPoints(AVAIL_W, { amber: 9, red: 0 }) })      // the other row's point leaves this one alone
    expect(cell()).toContain('under')
  })
})
