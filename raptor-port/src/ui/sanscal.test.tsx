// @vitest-environment jsdom
/* THE SANS CALENDAR — THE MONTH (the build plan docs/superpowers/plans/2026-10-07-inputs-sans-redesign-plan.md §3.5;
   owner D617, D618, D626, D627, D630, D642, D664).

   Each date: its number with a sun (day flying) or a moon (night flying), or the tag that takes their place — NF, or
   the Leave War's own short form for a public holiday or an Off day; the still-needed pair, pilots then WSOs, in the
   day's colour over a soft wash; F, O and A as pairs of the SANS committed. A date with no figure, or outside every
   leave period, shows a dash and no colour.

   The month works nothing out — every figure is the ONE resolver's (leavewar/sync.ts flyMonth) — and it HEARS both
   stores: a commitment or a plan row (the scheduler's signal), a holiday, a bid or a count row (the war's). It has no
   filters and no list (D620). A tap opens the day in a window that does not block the month (D641); a drag, or a
   held finger, picks several days for "+ Commitment" (ui/calpick.ts pins the gestures themselves). */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { storeBackend } from '../engine/hooks'
import { INPUTS } from '../engine/inputs'
import { PEOPLE } from '../engine/people'
import { initStore as raptorInitStore, notify } from '../state/store'
import { DEFAULT_ME, setMe, setSession } from '../state/auth'
import { saveTones, setFlyDays, setFlyRun } from '../state/flyplan'
import { saveCut } from '../state/cutoff'
import { rulesResetMem } from '../engine/rules'
import { CALMONTH, INPREVEAL, SANSHL, requestInpReveal, resetViewState, setCalMonth, setSansHl, clearInpReveal } from '../state/view'
import { initStore as lwInitStore, setRole } from '../leavewar/state/store'
import { memoryBackend } from '../leavewar/state/storage'
import { flyAnswer, holidayAdd } from '../leavewar/sync'
import { INPEDIT, SANSSET, setDaysWin, setInpEdit, setSansSet } from './pops'
import { _resetFloatWins } from './FloatWindow'
import { SansCal } from './SansCal'

const mem = new Map<string, string>()
let sansP: string[] = [], sansW: string[] = [], member = ''
let kept: any[] = []
const WED = '2026-10-07', THU = '2026-10-08', SAT = '2026-10-10'

beforeEach(() => {
  mem.clear()
  storeBackend.impl = { getItem: (k: string) => mem.get(k) ?? null, setItem: (k: string, v: string) => { if (v === 'null') mem.delete(k); else mem.set(k, v) }, keys: () => [...mem.keys()] } as any
  raptorInitStore()
  setSession({ user: 'admin-test', role: 'admin' })
  lwInitStore(memoryBackend())
  setRole('admin')
  const live = (id: string) => !PEOPLE[id].archived && !PEOPLE[id].deleted && !PEOPLE[id].special && !PEOPLE[id].pers
  sansP = Object.keys(PEOPLE).filter(id => live(id) && PEOPLE[id].san && PEOPLE[id].seat === 'FCP')
  sansW = Object.keys(PEOPLE).filter(id => live(id) && PEOPLE[id].san && PEOPLE[id].seat === 'RCP')
  member = Object.keys(PEOPLE).find(id => live(id) && !PEOPLE[id].san && PEOPLE[id].seat === 'FCP')!
  kept = INPUTS.splice(0, INPUTS.length)
  rulesResetMem()
  setCalMonth({ y: 2026, m: 10 }); clearInpReveal(); setSansHl(null)
  ;(document as any).elementFromPoint = undefined
})
afterEach(() => {
  cleanup(); _resetFloatWins(); setDaysWin(null); setSansSet(false); setInpEdit(null); setSession(null); setMe(DEFAULT_ME); clearInpReveal(); setCalMonth(null)
  INPUTS.splice(0, INPUTS.length, ...kept); rulesResetMem(); storeBackend.impl = null
})

let n = 0
const commit = (person: string, extra: Record<string, unknown> = {}) => {
  const r = { iid: 'c' + (++n), person, type: 'SANS Availability', date: 'Oct 7', yr: 2026, sans: { f: true }, allday: true, mod: '2026-09-01', ...extra }
  INPUTS.push(r)
  return r
}
const t = (id: string) => screen.getByTestId(id)
const q = (id: string) => screen.queryByTestId(id)
const day = (iso: string) => t('sc-day-' + iso)
const show = () => render(<SansCal />)
/* a tap: what the pointer machine reads as one */
const tap = (iso: string) => {
  const el = day(iso)
  const opts = { clientX: 10, clientY: 10, pointerId: 1, pointerType: 'mouse', isPrimary: true, button: 0 }
  fireEvent.pointerDown(el, opts); fireEvent.pointerUp(window, opts)
  fireEvent.click(el)                                                   // the click a browser sends after it
}

describe('the month', () => {
  it('names its month, and ‹ › and Today turn it', () => {
    show()
    expect(t('sc-month').textContent).toBe('October 2026')
    fireEvent.click(t('sc-next')); expect(t('sc-month').textContent).toBe('November 2026')
    fireEvent.click(t('sc-prev')); fireEvent.click(t('sc-prev')); expect(t('sc-month').textContent).toBe('September 2026')
    fireEvent.click(t('sc-today'))
    const now = new Date()
    expect(CALMONTH).toEqual({ y: now.getFullYear(), m: now.getMonth() + 1 })
  })
  it('draws every date of the month once, Monday first', () => {
    show()
    expect(document.querySelectorAll('[data-icday]').length).toBe(31)
    expect([...t('sc-dow').children].map(c => c.textContent)).toEqual(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'])
    /* 1 Oct 2026 is a Thursday: three empty places before it */
    expect(t('sc-grid').querySelector('.sc-week')!.querySelectorAll('.sc-x').length).toBe(3)
  })
  it('has no filter and no list of its own (D620)', () => {
    show()
    expect(document.querySelector('select,input[type="search"]')).toBeNull()
  })
})

describe('a date', () => {
  it('a day-flying day wears the sun, a night-flying day the moon', () => {
    act(() => { setFlyDays([{ iso: THU, cls: 'night' }]) })
    show()
    expect(day(WED).querySelector('[data-icon="day"]')).toBeTruthy(); expect(day(WED).querySelector('[data-icon="night"]')).toBeNull()
    expect(day(THU).querySelector('[data-icon="night"]')).toBeTruthy()
  })
  it('a no-fly day says NF and reads 0 and 0; a blank Saturday shows neither sun nor tag, and a dash', () => {
    act(() => { setFlyDays([{ iso: WED, cls: 'nf', p: 16, w: 16 }]) })
    show()
    expect(t('sc-tag-' + WED).textContent).toBe('NF'); expect(day(WED).querySelector('[data-icon]')).toBeNull()
    expect(t('sc-need-' + WED).textContent).toBe('00')
    expect(day(SAT).querySelector('[data-icon]')).toBeNull(); expect(q('sc-tag-' + SAT)).toBeNull()
    expect(t('sc-need-' + SAT).textContent).toBe('–')
  })
  it('a public holiday wears the Leave War’s short form in green’s class, an Off day in grey’s — and no sun', () => {
    act(() => { holidayAdd({ kind: 'ph', name: 'National Day', short: 'ND', from: WED, to: WED }); holidayAdd({ kind: 'off', name: 'Off day', from: THU, to: THU }) })
    show()
    expect(t('sc-tag-' + WED).textContent).toBe('ND'); expect(day(WED).className).toContain('is-ph')
    expect(t('sc-tag-' + THU).textContent).toBe('OFF'); expect(day(THU).className).toContain('is-off')
    expect(day(WED).querySelector('[data-icon]')).toBeNull()
  })
  it('the pair is the resolver’s, pilots then WSOs, and the day wears its colour', () => {
    act(() => { setFlyDays([{ iso: WED, p: 60, w: 60 }]) })
    show()
    const a = flyAnswer(WED)
    expect(t('sc-need-' + WED).textContent).toBe(`${a.need.p}${a.need.w}`)
    expect(a.tone).toBe('red'); expect(day(WED).className).toContain('t-red')
    expect(day(THU).className).not.toMatch(/\bt-(yellow|amber|red)\b/)
  })
  it('F, O and A are pairs of the SANS committed — each man once, whatever is typed in any box elsewhere', () => {
    commit(sansP[0]); commit(sansP[0], { sans: { f: true, o: true } }); commit(sansW[0], { sans: { o: true, a: true } }); commit(sansW[1])
    show()
    expect(t('sc-f-' + WED).textContent).toBe('F11')
    expect(t('sc-o-' + WED).textContent).toBe('O11')
    expect(t('sc-a-' + WED).textContent).toBe('A01')
    expect(t('sc-f-' + THU).textContent).toBe('F00')
  })
  it('says itself whole to a screen reader', () => {
    act(() => { setFlyDays([{ iso: WED, p: 60, w: 60 }]) })
    commit(sansP[0])
    show()
    const a = flyAnswer(WED)
    expect(day(WED).getAttribute('aria-label')).toBe(`Wed 7 Oct, day flying. Still needed: ${a.need.p} pilots, ${a.need.w} WSOs. SANS committed: fly 1 and 0, OFT 0 and 0, AMT 0 and 0.`)
    expect(day(SAT).getAttribute('aria-label')).toMatch(/^Sat 10 Oct, no flying set\. No required figure\./)
  })
})

describe('the line that says what the colours mean', () => {
  /* owner D697 (9 Oct 26): on a phone the key shares the fold's line, as the Inputs calendar's does — its words are
     the short ones there, and the full words stay on the key for a pointer and a screen reader */
  it('on a phone reads "Still needed:" and keeps its full words as its name (D697)', () => {
    const mm = window.matchMedia
    window.matchMedia = ((q: string) => ({ matches: /max-width:\s*820px/.test(q), media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} })) as any
    try {
      show()
      expect(t('sc-legend').textContent).toBe('Still needed:1–23–45+')
      expect(t('sc-legend').getAttribute('aria-label')).toBe('Pilots, then WSOs, still needed to fly')
    } finally { window.matchMedia = mm }
  })
  it('on a desktop keeps the full words on the key itself (D697)', () => {
    show()
    expect(t('sc-legend').querySelector('.sc-legend-w')!.textContent).toBe('Pilots · WSOs still needed:')
    expect(t('sc-legend').getAttribute('aria-label')).toBe('Pilots, then WSOs, still needed to fly')
  })
  it('is there for everyone, written from the three figures as they are set (D618)', () => {
    const v = show()
    expect(t('sc-legend').textContent).toBe('Pilots · WSOs still needed:1–23–45+')
    v.unmount()
    act(() => { saveTones({ yellowFrom: 2, amberFrom: 3, redFrom: 8 }) })
    setSession({ user: 'us', role: 'member' }); setMe(member)
    show()
    expect(t('sc-legend').textContent).toBe('Pilots · WSOs still needed:23–78+')
  })
})

describe('the gear (D618, D635)', () => {
  it('an admin has it, and it asks for the settings window; it is the app’s own cog, not a drawing', () => {
    show()
    expect(t('sc-gear').getAttribute('aria-label')).toBe('SANS calendar settings')
    expect(t('sc-gear').textContent).toBe('⚙')                      // the glyph the Leave War's settings button carries
    expect(t('sc-gear').querySelector('svg')).toBeNull()
    expect(SANSSET).toBe(false)
    fireEvent.click(t('sc-gear'))
    expect(SANSSET).toBe(true)
  })
  it('a member has no gear — only the line saying what the colours mean', () => {
    setSession({ user: 'us', role: 'member' }); setMe(member)
    show()
    expect(q('sc-gear')).toBeNull(); expect(t('sc-legend')).toBeTruthy()
  })
})

describe('it hears both stores, mounted, with no reload', () => {
  it('a commitment added behind it moves the date’s figures', () => {
    act(() => { setFlyDays([{ iso: WED, p: 60, w: 60 }]) })
    show()
    const before = flyAnswer(WED).need.p!
    act(() => { commit(sansP[0]); notify() })
    expect(t('sc-f-' + WED).textContent).toBe('F10')
    expect(t('sc-need-' + WED).textContent!.startsWith(String(before - 1))).toBe(true)
  })
  it('a holiday declared on the Leave War re-tags the date', () => {
    show()
    expect(q('sc-tag-' + WED)).toBeNull()
    act(() => { holidayAdd({ kind: 'ph', name: 'PH', from: WED, to: WED }) })
    expect(t('sc-tag-' + WED).textContent).toBe('PH')
  })
  it('a figure that began running months before the drawn month moves its dates', () => {
    show()
    expect(t('sc-need-' + WED).textContent).toBe('–')
    act(() => { setFlyRun('2026-07-06', { p: 60, w: 60 }) })
    expect(t('sc-need-' + WED).textContent).not.toBe('–')
  })
})

describe('opening a day', () => {
  it('a tap opens the day’s window; a tap on another date re-points it; ✕ closes it', () => {
    show()
    expect(q('win-sansday')).toBeNull()
    tap(WED)
    expect(t('win-sansday').querySelector('.win-ttl')!.textContent).toMatch(/^Wed 7 Oct/)
    expect(day(WED).className).toContain('is-open')
    tap(THU)
    expect(t('win-sansday').querySelector('.win-ttl')!.textContent).toMatch(/^Thu 8 Oct/)
    expect(document.querySelectorAll('[data-testid="win-sansday"]').length).toBe(1)
    fireEvent.click(t('win-sansday-x'))
    expect(q('win-sansday')).toBeNull()
  })
  it('Enter on a date opens it too', () => {
    show()
    fireEvent.keyDown(day(WED), { key: 'Enter' })
    expect(q('win-sansday')).toBeTruthy()
  })
  it('a commitment just saved opens its own day, on its own month — once (the saved-row reveal)', () => {
    setCalMonth({ y: 2026, m: 8 })
    const r = commit(sansP[0], { date: 'Oct 23' })
    const v = show()
    act(() => { requestInpReveal(r); notify() })
    expect(t('sc-month').textContent).toBe('October 2026')
    expect(t('win-sansday').querySelector('.win-ttl')!.textContent).toMatch(/^Fri 23 Oct/)
    fireEvent.click(t('win-sansday-x'))
    expect(INPREVEAL).toBeNull()                                         // spent: it must not open by itself again
    v.unmount()
    show()
    expect(q('win-sansday')).toBeNull()
  })
})

describe('the keyboard (D621)', () => {
  it('arrows move from date to date, and past the month’s end they turn the month', () => {
    show()
    day(WED).focus()
    fireEvent.keyDown(day(WED), { key: 'ArrowRight' }); expect(document.activeElement).toBe(day(THU))
    fireEvent.keyDown(day(THU), { key: 'ArrowDown' }); expect(document.activeElement).toBe(day('2026-10-15'))
    fireEvent.keyDown(day('2026-10-15'), { key: 'ArrowLeft' }); expect(document.activeElement).toBe(day('2026-10-14'))
    fireEvent.keyDown(day('2026-10-14'), { key: 'ArrowUp' }); expect(document.activeElement).toBe(day(WED))
    day('2026-10-31').focus()
    fireEvent.keyDown(day('2026-10-31'), { key: 'ArrowRight' })
    expect(t('sc-month').textContent).toBe('November 2026')
    expect(document.activeElement).toBe(day('2026-11-01'))
  })
  it('Shift and arrows stretch a run, Enter files for it, and nothing is written until the form is saved', () => {
    show()
    const before = INPUTS.length
    day('2026-10-12').focus()
    fireEvent.keyDown(day('2026-10-12'), { key: 'ArrowLeft', shiftKey: true })
    fireEvent.keyDown(day('2026-10-11'), { key: 'ArrowLeft', shiftKey: true })
    fireEvent.keyDown(day('2026-10-10'), { key: 'ArrowLeft', shiftKey: true })
    for (const d of ['2026-10-09', '2026-10-10', '2026-10-11', '2026-10-12']) expect(day(d).className).toContain('is-picked')
    expect(day('2026-10-08').className).not.toContain('is-picked')
    fireEvent.keyDown(day('2026-10-09'), { key: 'Enter' })
    expect(INPEDIT).toMatchObject({ _new: true, type: 'SANS Availability', date: 'Oct 9', endDate: 'Oct 12', allday: true, sans: { f: true } })
    expect(INPUTS.length).toBe(before)
    expect(document.querySelector('.is-picked')).toBeNull()
  })
  it('someone who may not add stretches no run with Shift — the arrows still move him', () => {
    setSession({ user: 'us', role: 'member' }); setMe(member)
    show()
    day(WED).focus()
    fireEvent.keyDown(day(WED), { key: 'ArrowRight', shiftKey: true })
    expect(document.activeElement).toBe(day(THU)); expect(document.querySelector('.is-picked')).toBeNull()
    fireEvent.keyDown(day(THU), { key: 'Enter' })
    expect(INPEDIT).toBeNull(); expect(q('win-sansday')).toBeTruthy()      // Enter opens the day, as for anyone
  })
  it('an arrow without Shift lets the run go and simply moves on', () => {
    show()
    day(WED).focus()
    fireEvent.keyDown(day(WED), { key: 'ArrowRight', shiftKey: true })
    expect(day(THU).className).toContain('is-picked')
    fireEvent.keyDown(day(THU), { key: 'ArrowRight' })
    expect(document.querySelector('.is-picked')).toBeNull()
    fireEvent.keyDown(day('2026-10-09'), { key: 'Enter' })
    expect(INPEDIT).toBeNull(); expect(q('win-sansday')).toBeTruthy()      // Enter now opens the day; no run is filed
  })
  it('Escape lets a run go; with none, it closes the open day', () => {
    show()
    day(WED).focus()
    fireEvent.keyDown(day(WED), { key: 'ArrowRight', shiftKey: true })
    expect(day(THU).className).toContain('is-picked')
    fireEvent.keyDown(day(THU), { key: 'Escape' })
    expect(document.querySelector('.is-picked')).toBeNull()
    fireEvent.keyDown(day(THU), { key: 'Enter' }); expect(q('win-sansday')).toBeTruthy()
    /* the keyboard is back ON THE MONTH (a click on a date puts it there): the window leaves Escape to the page behind
       it, so it is the date that closes the day (found by the strictness proof — with the keyboard still in the
       window, the window closed itself and this line proved nothing) */
    day(THU).focus()
    fireEvent.keyDown(day(THU), { key: 'Escape' }); expect(q('win-sansday')).toBeNull()
  })
})

describe('picking several days with the pointer', () => {
  const dragAcross = (from: string, to: string) => {
    ;(document as any).elementFromPoint = (x: number) => (x < 100 ? day(from) : day(to))
    const base = { pointerId: 1, pointerType: 'mouse', isPrimary: true, button: 0 }
    fireEvent.pointerDown(day(from), { ...base, clientX: 10, clientY: 10 })
    fireEvent.pointerMove(window, { ...base, clientX: 200, clientY: 10 })
    return () => { fireEvent.pointerUp(window, { ...base, clientX: 200, clientY: 10 }); fireEvent.click(day(to)) }
  }
  it('a drag lights the run and, let go, opens "+ Commitment" for it', () => {
    show()
    const release = dragAcross('2026-10-13', '2026-10-15')
    for (const d of ['2026-10-13', '2026-10-14', '2026-10-15']) expect(day(d).className).toContain('is-picked')
    release()
    expect(INPEDIT).toMatchObject({ _new: true, type: 'SANS Availability', date: 'Oct 13', endDate: 'Oct 15' })
    expect(document.querySelector('.is-picked')).toBeNull()
  })
  it('a member who is not SANS picks nothing by dragging', () => {
    setSession({ user: 'us', role: 'member' }); setMe(member)
    show()
    dragAcross('2026-10-13', '2026-10-15')()
    expect(INPEDIT).toBeNull(); expect(document.querySelector('.is-picked')).toBeNull()
  })
})

/* HIGHLIGHT ONE SANS PERSON (owner D619, 7 Oct 26: "a cyan ring around the days … it shows all the days he committed
   to"; D626: no second chooser for F, O or A — the ring, and the letters he offered underlined; D647 / D649: the list
   shows each man as his puck with his CAT). A way of LOOKING: nothing is hidden, no count changes, nothing is saved. */
describe('Highlight', () => {
  const pick = (id: string | null) => {
    fireEvent.click(t('sc-hl'))
    fireEvent.click(t(id ? 'sc-hl-' + id : 'sc-hl-none'))
  }
  it('lists "No highlight" first, then every SANS man on the roster as his puck — and nobody else', () => {
    show()
    expect(q('sc-hl-menu')).toBeNull()
    fireEvent.click(t('sc-hl'))
    const items = [...t('sc-hl-menu').querySelectorAll('[data-testid^="sc-hl-"]')].map(b => b.getAttribute('data-testid'))
    expect(items[0]).toBe('sc-hl-none')
    expect(items.slice(1).sort()).toEqual([...sansP, ...sansW].map(id => 'sc-hl-' + id).sort())
    expect(q('sc-hl-' + member)).toBeNull()
    const puck = t('sc-hl-' + sansW[0]).querySelector('.puck')!
    expect(puck.className).toMatch(/\bsan\b/); expect(puck.querySelector('.nm')!.textContent).toBe(PEOPLE[sansW[0]].cs)
    /* A to Z, so a name is found */
    const names = items.slice(1).map(i => PEOPLE[i!.slice(6)].cs)
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)))
  })
  it('rings every day he committed to, underlines the letters he offered there, and names him on the button', () => {
    commit(sansW[0], { sans: { f: true, o: true } }); commit(sansW[0], { date: 'Oct 12', sans: { a: true } }); commit(sansP[0], { date: 'Oct 13' })
    show()
    expect(t('sc-hl').textContent).toBe('Highlight')
    pick(sansW[0])
    expect(q('sc-hl-menu')).toBeNull()                                   // a pick closes the list
    expect(t('sc-hl').textContent).toBe(PEOPLE[sansW[0]].cs)
    expect(day(WED).className).toContain('is-hi'); expect(day('2026-10-12').className).toContain('is-hi')
    expect(day('2026-10-13').className).not.toContain('is-hi')           // another man's day
    expect(day(THU).className).not.toContain('is-hi')
    expect(t('sc-f-' + WED).className).toContain('is-mine'); expect(t('sc-o-' + WED).className).toContain('is-mine')
    expect(t('sc-a-' + WED).className).not.toContain('is-mine')
    expect(t('sc-a-2026-10-12').className).toContain('is-mine'); expect(t('sc-f-2026-10-12').className).not.toContain('is-mine')
    expect(day(WED).getAttribute('aria-label')).toMatch(new RegExp(`${PEOPLE[sansW[0]].cs} committed: fly, OFT\.$`))
  })
  it('changes no figure, and "No highlight" takes it off again', () => {
    commit(sansW[0]); commit(sansP[0])
    show()
    const before = t('sc-grid').textContent
    pick(sansW[0])
    expect(t('sc-grid').textContent).toBe(before)
    pick(null)
    expect(document.querySelector('.is-hi')).toBeNull(); expect(document.querySelector('.is-mine')).toBeNull()
    expect(t('sc-hl').textContent).toBe('Highlight')
  })
  it('marks his lines in the opened day', () => {
    const mine = commit(sansW[0]), other = commit(sansP[0])
    show()
    pick(sansW[0]); tap(WED)
    expect(t('sd-row-' + mine.iid).className).toContain('is-hi'); expect(t('sd-row-' + other.iid).className).not.toContain('is-hi')
  })
  it('the list closes on Escape and on a press outside it, picking nobody — a small menu, not a window', () => {
    show()
    fireEvent.click(t('sc-hl')); fireEvent.keyDown(document, { key: 'Escape' })
    expect(q('sc-hl-menu')).toBeNull()
    fireEvent.click(t('sc-hl')); fireEvent.pointerDown(t('sc-month'))
    expect(q('sc-hl-menu')).toBeNull()
    fireEvent.click(t('sc-hl')); fireEvent.pointerDown(t('sc-hl-menu'))
    expect(q('sc-hl-menu')).toBeTruthy()                                 // a press inside it is not outside
    expect(SANSHL).toBeNull()
  })
  it('is this sitting’s own: a sign-out takes it off, and it is saved nowhere', () => {
    show()
    pick(sansP[0])
    expect(SANSHL).toBe(sansP[0])
    expect([...mem.keys()].some(k => mem.get(k)!.includes('SANSHL') || /hl/i.test(k))).toBe(false)
    resetViewState('session')
    expect(SANSHL).toBeNull()
  })
  it('a man who is no longer SANS is not left highlighted', () => {
    commit(sansP[0])
    show()
    pick(sansP[0])
    act(() => { PEOPLE[sansP[0]].san = false; notify() })
    try {
      expect(t('sc-hl').textContent).toBe('Highlight'); expect(document.querySelector('.is-hi')).toBeNull()
    } finally { PEOPLE[sansP[0]].san = true }
  })
})


/* "HOW THIS WORKS" (owner D646, 7 Oct 26: "Abit wordy … seems like that isn't needed right" — five short lines; the
   cut-off line "only states the rule as it is set", with no worked date and no "later is marked LATE"; D628: it
   "always states the cut-off as it is set — it changes when the setting changes"). */
describe('How this works', () => {
  it('is folded away until asked for, and opens to five short lines — for a member as for an admin', () => {
    setSession({ user: 'us', role: 'member' }); setMe(member)
    show()
    expect(t('sc-how').getAttribute('aria-expanded')).toBe('false'); expect(q('sc-how-list')).toBeNull()
    fireEvent.click(t('sc-how'))
    expect(t('sc-how').getAttribute('aria-expanded')).toBe('true')
    const lines = [...t('sc-how-list').querySelectorAll('li')].map(li => li.textContent)
    expect(lines).toEqual([
      'Tap a day to see who has committed, and to add or change yours.',
      'The coloured pair is how many more are needed to fly: pilots, then WSOs.',
      'F fly · O OFT · A AMT: the SANS who have committed.',
      'NF is a no-fly day. Green is a public holiday. Grey is an Off day.',
      'Commit by the end of the Wednesday two weeks before the week.',   // "One commitment a day each." removed on his word (D704)
    ])
    fireEvent.click(t('sc-how'))
    expect(q('sc-how-list')).toBeNull()
  })
  it('states the cut-off as it is SET, and changes when the setting does — no worked date, no "LATE" (D646)', () => {
    show()
    fireEvent.click(t('sc-how'))
    const last = () => t('sc-how-cut').textContent
    act(() => { saveCut('sans', { mode: 1, wd: 4, weeks: 1, lead: 14 }) })
    expect(last()).toBe('Commit by the end of the Friday of the week before.')
    /* the cut-off itself is in bold, whatever the setting says (D691) */
    const bold = () => [...t('sc-how-cut').querySelectorAll('b')].map(b => b.textContent)
    expect(bold()).toEqual(['the end of the Friday of the week before'])
    act(() => { saveCut('sans', { mode: 0, lead: 10, wd: 0, weeks: 1 }) })
    expect(last()).toBe('Commit at least 10 days before the week starts.')
    expect(bold()).toEqual(['at least 10 days before'])
    act(() => { saveCut('sans', { mode: 0, lead: 1, wd: 0, weeks: 1 }) })
    expect(last()).toBe('Commit at least 1 day before the week starts.')
    act(() => { saveCut('sans', { mode: 0, lead: 0, wd: 0, weeks: 1 }) })
    expect(last()).toBe('Commit by the end of the Monday the week starts.')
    expect(bold()).toEqual(['the end of the Monday the week starts'])
    expect(t('sc-how-list').textContent).not.toMatch(/LATE|For the week of/)
  })
})
