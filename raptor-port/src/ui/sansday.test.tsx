// @vitest-environment jsdom
/* A DAY OPENED ON THE SANS CALENDAR (the build plan docs/superpowers/plans/2026-10-07-inputs-sans-redesign-plan.md §3.5;
   owner D617, D626, D629, D641, D646–D651, D675).

   A window on the windows shell — it does not block the calendar behind it (D641). It shows the day's WORKING, both
   seats (required, available, SANS committed to fly, still needed — the ONE resolver's own answer, never worked out
   here), then EVERYONE who has committed (D648), each man as the schedule's own puck with his CAT and the SANS edge
   (D647, D649, D651), his letters, his hours, the LATE tag that says the cut-off it missed (D646), and who placed it
   and when (D629). "+ Commitment" for a SANS man or an admin; for an admin, a button that opens the Calendar window
   (Days — D675) on that month. */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { storeBackend } from '../engine/hooks'
import { INPUTS } from '../engine/inputs'
import { PEOPLE } from '../engine/people'
import { VCONF } from '../engine/rules'
import { initStore as raptorInitStore, notify } from '../state/store'
import { DEFAULT_ME, setMe, setSession } from '../state/auth'
import { setFlyDays } from '../state/flyplan'
import { initStore as lwInitStore, setRole } from '../leavewar/state/store'
import { memoryBackend } from '../leavewar/state/storage'
import { dayFacts, flyAnswer } from '../leavewar/sync'
import { DAYSWIN, INPEDIT, setDaysWin, setInpEdit } from './pops'
import { _resetFloatWins } from './FloatWindow'
import { SansDay } from './SansDay'
import { maySansAdd, openSansAdd } from './sansadd'

const mem = new Map<string, string>()
const realMM = window.matchMedia
const asPhone = (on: boolean) => { (window as any).matchMedia = (q: string) => ({ matches: on && /max-width:\s*620px/.test(q), addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} }) }
const WED = '2026-10-07'
let sansP: string[] = [], sansW: string[] = [], member = ''
let kept: any[] = []

beforeEach(() => {
  mem.clear()
  storeBackend.impl = { getItem: (k: string) => mem.get(k) ?? null, setItem: (k: string, v: string) => { if (v === 'null') mem.delete(k); else mem.set(k, v) }, keys: () => [...mem.keys()] } as any
  raptorInitStore()
  setSession({ user: 'admin-test', role: 'admin' })
  lwInitStore(memoryBackend())
  setRole('admin')
  asPhone(false)
  const live = (id: string) => !PEOPLE[id].archived && !PEOPLE[id].deleted && !PEOPLE[id].special && !PEOPLE[id].pers
  sansP = Object.keys(PEOPLE).filter(id => live(id) && PEOPLE[id].san && PEOPLE[id].seat === 'FCP')
  sansW = Object.keys(PEOPLE).filter(id => live(id) && PEOPLE[id].san && PEOPLE[id].seat === 'RCP')
  member = Object.keys(PEOPLE).find(id => live(id) && !PEOPLE[id].san && PEOPLE[id].seat === 'FCP')!
  kept = INPUTS.splice(0, INPUTS.length)                 // the day starts with no commitment of the demo's
})
afterEach(() => {
  cleanup(); _resetFloatWins(); setDaysWin(null); setInpEdit(null); setSession(null); setMe(DEFAULT_ME)
  INPUTS.splice(0, INPUTS.length, ...kept); storeBackend.impl = null; (window as any).matchMedia = realMM
})

let n = 0
const commit = (person: string, extra: Record<string, unknown> = {}) => {
  const r = { iid: 't' + (++n), person, type: 'SANS Availability', date: 'Oct 7', yr: 2026, sans: { f: true }, allday: true, mod: '2026-09-01', ...extra }
  INPUTS.push(r)
  return r
}
const t = (id: string) => screen.getByTestId(id)
const q = (id: string) => screen.queryByTestId(id)
const show = (iso = WED, hi: string | null = null) => render(<SansDay iso={iso} hi={hi} onClose={() => {}} />)

describe('the window', () => {
  it('is a window that does not take the page away, named by its day and what kind of day it is', () => {
    show()
    expect(t('win-sansday').getAttribute('aria-modal')).toBe('false')
    expect(t('win-sansday').querySelector('.win-ttl')!.textContent).toBe('Wed 7 OctDay flying')
  })
  it('says night flying, no fly, and a holiday by its own name', () => {
    act(() => { setFlyDays([{ iso: WED, cls: 'night' }]) })
    const v = show()
    expect(t('win-sansday').querySelector('.win-ttl small')!.textContent).toBe('Night flying')
    v.unmount()
    act(() => { setFlyDays([{ iso: WED, cls: 'nf' }]) })
    show()
    expect(t('win-sansday').querySelector('.win-ttl small')!.textContent).toBe('No fly')
  })
  it('✕ asks to be closed', () => {
    let closed = 0
    render(<SansDay iso={WED} hi={null} onClose={() => { closed += 1 }} />)
    fireEvent.click(t('win-sansday-x'))
    expect(closed).toBe(1)
  })
})

describe('the working', () => {
  it('prints the resolver’s own figures for both seats: required, available, SANS committed to fly, still needed', () => {
    act(() => { setFlyDays([{ iso: WED, p: 60, w: 60 }]) })
    commit(sansP[0]); commit(sansW[0]); commit(sansW[1], { sans: { o: true } })
    show()
    const a = flyAnswer(WED), f = dayFacts(WED)
    expect(a.need.p).toBeGreaterThan(0)                               // the demo roster is well under sixty a seat
    const cell = (row: string, seat: 'p' | 'w') => t(`sd-${row}-${seat}`).textContent
    expect(cell('req', 'p')).toBe('60'); expect(cell('req', 'w')).toBe('60')
    expect(cell('avail', 'p')).toBe(String(f.availP)); expect(cell('avail', 'w')).toBe(String(f.availW))
    expect(cell('sans', 'p')).toBe('1'); expect(cell('sans', 'w')).toBe('1')   // the OFT-only man is not committed to fly
    expect(cell('need', 'p')).toBe(String(a.need.p)); expect(cell('need', 'w')).toBe(String(a.need.w))
    expect(t('sd-need-p').className).toContain('t-' + a.tone)
  })
  it('a day with no required figure shows dashes — never a nought', () => {
    show()
    expect(t('sd-req-p').textContent).toBe('–'); expect(t('sd-need-w').textContent).toBe('–')
  })
  it('a no-fly day reads NF for what is required and needs nobody', () => {
    act(() => { setFlyDays([{ iso: WED, cls: 'nf', p: 16, w: 16 }]) })
    show()
    expect(t('sd-req-p').textContent).toBe('NF'); expect(t('sd-need-p').textContent).toBe('0'); expect(t('sd-need-w').textContent).toBe('0')
    /* nobody needed is said in the 'all is well' green, never in a shortage colour */
    expect(t('sd-need-p').className).toBe('is-zero')
  })
  it('a date no leave period covers says so, and shows no availability', () => {
    show('2031-03-05')
    expect(t('sd-avail-p').textContent).toBe('–')
    expect(t('sd-nocover').textContent).toMatch(/No leave period covers this date/)
  })
  it('moves when a commitment is added behind it — no reload, no reopening', () => {
    act(() => { setFlyDays([{ iso: WED, p: 60, w: 60 }]) })
    show()
    expect(t('sd-sans-p').textContent).toBe('0')
    act(() => { commit(sansP[0]); notify() })
    expect(t('sd-sans-p').textContent).toBe('1')
  })
})

describe('the commitments', () => {
  it('lists WSOs to fly, pilots to fly, then OFT or AMT only — each heading with its head-count', () => {
    commit(sansP[0]); commit(sansW[0]); commit(sansW[1]); commit(sansP[1], { sans: { o: true, a: true } })
    show()
    expect(t('sd-group-w').textContent).toBe('WSOs · 2 to fly')
    expect(t('sd-group-p').textContent).toBe('Pilots · 1 to fly')
    expect(t('sd-group-other').textContent).toBe('OFT or AMT only · 1')
    const heads = [...t('sd-list').querySelectorAll('[data-testid^="sd-group-"]')].map(h => h.getAttribute('data-testid'))
    expect(heads).toEqual(['sd-group-w', 'sd-group-p', 'sd-group-other'])
  })
  it('with nobody committed it says so, and shows no empty heading', () => {
    show()
    expect(t('sd-empty').textContent).toBe('No commitments yet.')
    expect(q('sd-group-w')).toBeNull(); expect(q('sd-group-other')).toBeNull()
  })
  it('each man is the schedule’s own puck — his CAT chip attached, the SANS edge on it (D649, D651)', () => {
    const r = commit(sansW[0])
    show()
    const row = t('sd-row-' + r.iid)
    const puck = row.querySelector('.puck')!
    expect(puck.className).toMatch(/\bsm\b/)                           // the one fixed size
    expect(puck.className).toMatch(/\bsan\b/)                          // the purple edge comes from the builder
    expect(puck.className).toMatch(/\br\b/)                            // a WSO's green
    expect(puck.querySelector('.nm')!.textContent).toBe(PEOPLE[sansW[0]].cs)
    if (PEOPLE[sansW[0]].q) expect(puck.querySelector('.role')!.textContent).toBe(PEOPLE[sansW[0]].q)
  })
  it('each line carries his letters, his hours, and who placed it and when', () => {
    const at = new Date(2026, 8, 28, 9, 14).getTime()
    const r = commit(sansW[0], { sans: { f: true, o: true }, allday: false, s: 600, e: 900, by: sansW[0], at, modBy: sansW[0], modAt: at })
    show()
    const row = within(t('sd-row-' + r.iid))
    expect(row.getByTestId('sd-letters').textContent).toBe('F · O')
    expect(row.getByTestId('sd-hours').textContent).toBe('10:00–15:00')
    expect(row.getByTestId('sd-placed').textContent).toBe(`Placed by ${PEOPLE[sansW[0]].cs} · 28 Sep 26, 09:14`)
  })
  it('a record that never recorded who placed it shows no small-print line', () => {
    const r = commit(sansW[0])
    show()
    expect(within(t('sd-row-' + r.iid)).queryByTestId('sd-placed')).toBeNull()
  })
  it('a tap on a line opens that commitment in the editor', () => {
    const r = commit(sansW[0])
    show()
    fireEvent.click(within(t('sd-row-' + r.iid)).getByTestId('sd-open'))
    expect(INPEDIT).toBe(r)
  })
  it('the highlighted man’s lines are marked', () => {
    const a = commit(sansW[0]), b = commit(sansP[0])
    show(WED, sansW[0])
    expect(t('sd-row-' + a.iid).className).toContain('is-hi')
    expect(t('sd-row-' + b.iid).className).not.toContain('is-hi')
  })
  it('a commitment the count leaves out is listed apart, with the reason', () => {
    const r = commit(member)
    show()
    expect(t('sd-group-out').textContent).toBe('Not counted · 1')
    expect(within(t('sd-row-' + r.iid)).getByTestId('sd-why').textContent).toBe('no longer SANS')
  })
})

describe('the LATE tag', () => {
  const keep: Record<string, unknown> = {}
  beforeEach(() => { for (const k of ['sansCutMode', 'sansCutWd', 'sansCutWeeks']) keep[k] = (VCONF as any)[k]; Object.assign(VCONF, { sansCutMode: 1, sansCutWd: 2, sansCutWeeks: 2 }) })
  afterEach(() => { Object.assign(VCONF, keep) })
  it('shows on a late commitment only, and pressed says the cut-off it missed — without opening the editor (D646)', () => {
    const late = commit(sansW[0], { date: 'Oct 21', mod: '2026-10-08' }), ok = commit(sansW[1], { date: 'Oct 21', mod: '2026-10-07' })
    show('2026-10-21')
    expect(within(t('sd-row-' + ok.iid)).queryByTestId('sd-late')).toBeNull()
    const tag = within(t('sd-row-' + late.iid)).getByTestId('sd-late')
    expect(tag.textContent).toBe('LATE')
    expect(within(t('sd-row-' + late.iid)).queryByTestId('sd-latenote')).toBeNull()
    fireEvent.click(tag)
    expect(within(t('sd-row-' + late.iid)).getByTestId('sd-latenote').textContent).toBe('after the cut-off, Wed 7 Oct')
    expect(INPEDIT).toBeNull()
  })
})

describe('+ Commitment, and the admin’s way to the Calendar window', () => {
  it('an admin’s "+ Commitment" opens a new SANS availability for that day', () => {
    show()
    fireEvent.click(t('sd-add'))
    expect(INPEDIT).toMatchObject({ _new: true, type: 'SANS Availability', date: 'Oct 7' })
    expect(PEOPLE[INPEDIT.person].san).toBe(true)                     // for a SANS man — an admin who is not one picks whose
  })
  it('a SANS member’s is his own — not the first SANS man on the roster', () => {
    const first = Object.keys(PEOPLE).find(id => PEOPLE[id].san && !PEOPLE[id].archived && !PEOPLE[id].deleted && !PEOPLE[id].special)
    const mine = [...sansP, ...sansW].find(id => id !== first)!
    setSession({ user: 'us', role: 'member' }); setMe(mine)
    show()
    fireEvent.click(t('sd-add'))
    expect(INPEDIT).toMatchObject({ _new: true, person: mine, type: 'SANS Availability' })
  })
  it('the door itself refuses someone who may not add, whatever called it', () => {
    setSession({ user: 'us', role: 'member' }); setMe(member)
    expect(maySansAdd()).toBe(false); expect(openSansAdd(WED)).toBe(false); expect(INPEDIT).toBeNull()
    setMe(sansP[0])
    expect(openSansAdd(WED, '2026-10-05')).toBe(true)                  // a run given back to front is put in order
    expect(INPEDIT).toMatchObject({ date: 'Oct 5', endDate: 'Oct 7', sans: { f: true } })
  })
  it('a member who is not SANS cannot add one, and is told who can', () => {
    setSession({ user: 'us', role: 'member' }); setMe(member)
    show()
    expect((t('sd-add') as HTMLButtonElement).disabled).toBe(true)
    expect(t('sd-addwhy').textContent).toBe('SANS aircrew add their availability here.')
    fireEvent.click(t('sd-add'))
    expect(INPEDIT).toBeNull()
  })
  it('on a no-fly day a new commitment starts with no activity ticked — flying is not on offer (D642)', () => {
    act(() => { setFlyDays([{ iso: WED, cls: 'nf' }]) })
    show()
    fireEvent.click(t('sd-add'))
    expect(INPEDIT.sans).toEqual({})
  })
  it('an admin gets "Calendar…", which opens that window on the day’s month; a member does not (D647, D675)', () => {
    const v = show()
    expect(t('sd-days').textContent).toBe('Calendar…')
    fireEvent.click(t('sd-days'))
    expect(DAYSWIN).toBe(WED)
    v.unmount(); setDaysWin(null)
    setSession({ user: 'us', role: 'member' }); setMe(sansP[0])
    show()
    expect(q('sd-days')).toBeNull()
  })
})

describe('on a phone: two rest heights (D648)', () => {
  it('opens at its lower height; a tap on its top bar pulls it up, and another puts it back', () => {
    asPhone(true)
    show()
    const win = t('win-sansday'), bar = win.querySelector('.win-bar')!
    expect(win.className).not.toContain('is-tall')
    const tapBar = (y: number) => { fireEvent.pointerDown(bar, { clientX: 100, clientY: y, pointerId: 1 }); fireEvent.pointerUp(bar, { clientX: 100, clientY: y, pointerId: 1 }) }
    /* the height changes on the CLICK, not on the release — a panel that moved under the finger first would hand the
       click to whatever arrived there (it pressed "+ Commitment" in the running build) */
    tapBar(300)
    expect(win.className).not.toContain('is-tall')
    fireEvent.click(bar)
    expect(win.className).toContain('is-tall')
    tapBar(20); fireEvent.click(bar)
    expect(win.className).not.toContain('is-tall')
    /* ✕ is never a tap on the bar */
    fireEvent.click(win.querySelector('.win-x')!)
    expect(win.className).not.toContain('is-tall')
  })
  it('dragged up by its bar it stays up; dragged back down it comes down', () => {
    asPhone(true)
    Object.defineProperty(window, 'innerHeight', { value: 800, configurable: true })
    show()
    const win = t('win-sansday'), bar = win.querySelector('.win-bar')!
    win.getBoundingClientRect = () => ({ top: 270, left: 12, right: 378, bottom: 788, width: 366, height: 518, x: 12, y: 270, toJSON() {} }) as DOMRect
    fireEvent.pointerDown(bar, { clientX: 100, clientY: 280, pointerId: 1 })
    fireEvent.pointerMove(bar, { clientX: 100, clientY: 60, pointerId: 1 })
    fireEvent.pointerUp(bar, { clientX: 100, clientY: 60, pointerId: 1 })
    expect(win.className).toContain('is-tall')
    fireEvent.click(bar)                                               // the click a mouse sends after a drag is not a tap
    expect(win.className).toContain('is-tall')
    win.getBoundingClientRect = () => ({ top: 8, left: 12, right: 378, bottom: 788, width: 366, height: 780, x: 12, y: 8, toJSON() {} }) as DOMRect
    fireEvent.pointerDown(bar, { clientX: 100, clientY: 20, pointerId: 1 })
    fireEvent.pointerMove(bar, { clientX: 100, clientY: 300, pointerId: 1 })
    fireEvent.pointerUp(bar, { clientX: 100, clientY: 300, pointerId: 1 })
    expect(win.className).not.toContain('is-tall')
  })
  it('on a desktop its bar moves it as every window’s does — it is never made tall', () => {
    show()
    const win = t('win-sansday'), bar = win.querySelector('.win-bar')!
    fireEvent.pointerDown(bar, { clientX: 100, clientY: 300, pointerId: 1 }); fireEvent.pointerUp(bar, { clientX: 100, clientY: 300, pointerId: 1 }); fireEvent.click(bar)
    expect(win.className).not.toContain('is-tall')
  })
})
