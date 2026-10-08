// @vitest-environment jsdom
/* THE INPUTS MONTH, DRAWN (the build plan docs/superpowers/plans/2026-10-07-inputs-sans-redesign-plan.md §3.6).

   Owner, D626 (7 Oct 26): "I like bars the way Google calendar does" — an input is ONE bar across the days it covers.
   D632 / D639: a desktop shows seven a day before "+N more". D653 / D664: on a phone the lines are what the screen's
   height gives, never fewer than three, re-fitted when the height changes. D627: a public holiday, an Off day and a
   no-fly day wear their tag; the sun and the moon are the SANS calendar's alone. D621 / D626: several days are picked
   by a mouse drag, or a finger held and then dragged — the "Select dates" button is gone. D620: no SANS availability.
   D655: a group filing is ONE bar. D629 / D632: a desktop bar's tooltip says who placed it.

   Which bar sits on which line is the pure half's (ui/inputscal-model.test.ts); these pin that the SCREEN draws what
   it says and that a press does what the ruling says. */
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { InputsPage } from './InputsPage'
import { InputEditor } from './inputedit'
import { initStore, notify, setSession } from '../state/store'
import { CALMONTH, revealInput, setCalMonth, setInpMode, setInpView, setPage } from '../state/view'
import { INPUTS } from '../engine/inputs'
import { PEOPLE } from '../engine/people'
import { storeBackend } from '../engine/hooks'
import { setFlyDays } from '../state/flyplan'
import { initStore as lwInitStore, setRole as lwSetRole } from '../leavewar/state/store'
import { memoryBackend } from '../leavewar/state/storage'
import { _resetFloatWins } from './FloatWindow'
import { PICK_HOLD } from './calpick'
import { saveCut } from '../state/cutoff'
import { cutSentence } from './sanscal-model'
import { INPEDIT, setInpEdit } from './pops'
;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

let host: HTMLDivElement, root: Root
const seed = JSON.stringify(INPUTS)
const $ = (sel: string) => host.querySelector(sel) as HTMLElement | null
const $$ = (sel: string) => Array.from(host.querySelectorAll(sel)) as HTMLElement[]
const day = (iso: string) => $(`[data-icday="${iso}"]`)!
const bars = (iid: string) => $$(`.ib-bar[data-iid="${iid}"]`)
const crew = () => Object.keys(PEOPLE).filter(id => !PEOPLE[id].archived && !PEOPLE[id].deleted && !PEOPLE[id].special && !PEOPLE[id].san && !PEOPLE[id].pers)
const cs = (id: string) => PEOPLE[id].cs
let n = 0
const file = async (over: any) => {
  const row = { iid: 'mon' + (++n), person: crew()[0], type: 'LL', date: 'Oct 7', yr: 2026, allday: true, s: 360, e: 1080, ...over }
  await act(async () => { INPUTS.push(row); notify() })
  return row as any
}
const ptr = (type: string, x: number, y: number, kind = 'touch') =>
  new PointerEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y, pointerId: 1, pointerType: kind, isPrimary: true, button: 0 })
/* a tap is ONE moment: the press, the lift and the click a browser sends after them, with no timer between */
const tap = async (el: Element) => act(async () => {
  el.dispatchEvent(ptr('pointerdown', 10, 10)); el.dispatchEvent(ptr('pointerup', 10, 10))
  el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
})
/* what lies under the pointer, top first — jsdom lays nothing out, so the test says */
const under = (...els: (Element | null)[]) => { (document as any).elementsFromPoint = () => els.filter(Boolean) }
const phone = (on: boolean) => { (window as any).matchMedia = (q: string) => ({ matches: on && /max-width:\s*820px/.test(q), media: q, addEventListener() {}, removeEventListener() {} }) }
const height = async (h: number) => act(async () => { (window as any).innerHeight = h; window.dispatchEvent(new Event('resize')) })

const mount = async () => {
  host = document.createElement('div'); document.body.append(host); root = createRoot(host)
  await act(async () => { root.render(<><InputsPage /><InputEditor /></>) })
  await act(async () => { setCalMonth({ y: 2026, m: 10 }); notify() })
}
beforeEach(async () => {
  INPUTS.splice(0, INPUTS.length, ...JSON.parse(seed))
  const mem = new Map<string, string>()
  storeBackend.impl = { getItem: k => mem.get(k) ?? null, setItem: (k, v) => mem.set(k, v), keys: () => [...mem.keys()] }
  initStore(); setSession({ user: 'a', role: 'admin' }); lwInitStore(memoryBackend()); lwSetRole('admin')
  setPage('inputs'); setInpMode('member'); setInpView('cal'); setCalMonth({ y: 2026, m: 10 })
  phone(false); (window as any).innerHeight = 900
  await mount()
})
afterEach(async () => {
  await act(async () => { root.unmount(); setInpEdit(null) })
  vi.useRealTimers()
  delete (document as any).elementsFromPoint; delete (window as any).matchMedia
  host.remove(); _resetFloatWins(); setSession(null); storeBackend.impl = null
})

describe('an input is one bar across its days (D626)', () => {
  it('five days, Monday to Friday: ONE bar from the first column to the fifth, saying the callsign and the kind', async () => {
    const r = await file({ date: 'Oct 5', endDate: 'Oct 9' })
    expect(bars(r.iid)).toHaveLength(1)
    const bar = bars(r.iid)[0]
    expect(bar.textContent).toBe(`${cs(r.person)} · LL`)
    expect(bar.style.gridColumn).toBe('1 / 6')
    expect(bar.classList.contains('red'), 'an absence is red').toBe(true)
    expect(bar.closest('[data-icday]'), 'a bar lies across the dates, inside none of them').toBeNull()
  })
  it('a bar running past Sunday is cut there and carried on in the next week', async () => {
    const r = await file({ date: 'Oct 9', endDate: 'Oct 13' })
    const [first, second] = bars(r.iid)
    expect(bars(r.iid)).toHaveLength(2)
    expect(first.style.gridColumn).toBe('5 / 8'); expect(second.style.gridColumn).toBe('1 / 3')
    expect(first.classList.contains('is-on'), 'the first piece runs on').toBe(true)
    expect(second.classList.contains('is-cont'), 'the second is a continuation').toBe(true)
  })
  it('a duty or a commitment is amber', async () => {
    const r = await file({ type: 'Meeting', allday: false, s: 600, e: 660 })
    expect(bars(r.iid)[0].classList.contains('amb')).toBe(true)
  })
  it('SANS availability is on no bar (D620)', async () => {
    const sans = Object.keys(PEOPLE).find(id => PEOPLE[id].san && !PEOPLE[id].archived)!
    const r = await file({ person: sans, type: 'SANS Availability', sans: { f: true } })
    expect(bars(r.iid)).toHaveLength(0)
  })
  it('a group filing is ONE bar: the first callsign A to Z, how many more, the kind (D655)', async () => {
    const four = crew().slice(0, 4)
    const rows: any[] = []
    for (const p of four) rows.push(await file({ person: p, type: 'Meeting', date: 'Oct 8', allday: false, s: 600, e: 660, grp: 'g-test', grpBy: four[0] }))
    const drawn = $$('.ib-bar').filter(b => rows.some(r => r.iid === b.dataset.iid))
    expect(drawn).toHaveLength(1)
    const first = four.map(cs).sort((a, b) => a.localeCompare(b))[0]
    expect(drawn[0].textContent).toBe(`${first} +3 · Meeting`)
    for (const p of four) expect(drawn[0].title, 'its tooltip lists everyone').toContain(cs(p))
  })
  it('a desktop bar’s tooltip says its dates and who placed it (D629, D632); a record with no filer says no such line', async () => {
    const filer = crew()[1]
    const a = await file({ date: 'Oct 5', endDate: 'Oct 6', by: filer, at: new Date(2026, 9, 2, 9, 10).getTime(), modBy: filer, modAt: new Date(2026, 9, 2, 9, 10).getTime() })
    const b = await file({ date: 'Oct 12' })
    expect(bars(a.iid)[0].title).toContain(`Placed by ${cs(filer)} for ${cs(a.person)} · 2 Oct 26, 09:10`)
    expect(bars(a.iid)[0].title).toContain('5 Oct')
    expect(bars(b.iid)[0].title).not.toContain('Placed by')
  })
})

describe('seven a day on a desktop, then "+N more" (D632, D639)', () => {
  it('nine inputs on one day: seven bars and "+2 more", which opens the day with all nine', async () => {
    const nine = crew().slice(0, 9)
    const rows: any[] = []
    for (const p of nine) rows.push(await file({ person: p, date: 'Oct 21' }))
    const drawn = $$('.ib-bar').filter(b => rows.some(r => r.iid === b.dataset.iid))
    expect(drawn).toHaveLength(7)
    const more = $('[data-icmore="2026-10-21"]')!
    expect(more.textContent).toBe('+2 more')
    await act(async () => { more.click() })
    expect($$('[data-popiid]').filter(el => rows.some(r => r.iid === el.dataset.popiid))).toHaveLength(9)
  })
})

describe('the tag a date wears (D627)', () => {
  it('a no-fly day says NF; a night-flying day wears nothing — no sun and no moon on this calendar', async () => {
    await act(async () => { setFlyDays([{ iso: '2026-10-07', cls: 'nf' }, { iso: '2026-10-08', cls: 'night' }]) })
    expect($('[data-testid="ib-tag-2026-10-07"]')!.textContent).toBe('NF')
    expect(day('2026-10-07').classList.contains('k-nf')).toBe(true)
    expect($('[data-testid="ib-tag-2026-10-08"]')).toBeNull()
    expect($('#inpCal [data-icon]'), 'the sun and the moon are the SANS calendar’s alone').toBeNull()
  })
  it('a date says itself whole to a screen reader: the day, what it is, how many inputs', async () => {
    await act(async () => { setFlyDays([{ iso: '2026-10-07', cls: 'nf' }]) })
    await file({ date: 'Oct 7' }); await file({ date: 'Oct 6', endDate: 'Oct 8', person: crew()[1] })
    expect(day('2026-10-07').getAttribute('aria-label')).toBe('Wed 7 Oct, no-fly day, 2 inputs')
    expect(day('2026-10-09').getAttribute('aria-label')).toBe('Fri 9 Oct, no inputs')
  })
})

describe('what a press does', () => {
  it('a tap on a bar opens that input', async () => {
    const r = await file({ date: 'Oct 5', endDate: 'Oct 9' })
    under(bars(r.iid)[0], day('2026-10-07'))
    await tap(bars(r.iid)[0])
    expect(INPEDIT && INPEDIT.iid).toBe(r.iid)
  })
  it('a tap on a date opens the day, listing what covers it', async () => {
    const r = await file({ date: 'Oct 5', endDate: 'Oct 9' })
    under(day('2026-10-07'))
    await tap(day('2026-10-07'))
    expect($(`[data-popiid="${r.iid}"]`), 'the opened day lists the input that runs across it').toBeTruthy()
    expect(INPEDIT).toBeNull()
  })
  it('a mouse dragged across dates lights them, and letting go opens "+ Input" for the run — nothing is written yet', async () => {
    const before = INPUTS.length
    under(day('2026-10-13'))
    await act(async () => { day('2026-10-13').dispatchEvent(ptr('pointerdown', 10, 10, 'mouse')) })
    under(day('2026-10-15'))
    await act(async () => { window.dispatchEvent(ptr('pointermove', 200, 10, 'mouse')) })
    expect($$('.ib-day.is-picked').map(d => d.dataset.icday)).toEqual(['2026-10-13', '2026-10-14', '2026-10-15'])
    await act(async () => { window.dispatchEvent(ptr('pointerup', 200, 10, 'mouse')) })
    expect(INPEDIT).toMatchObject({ _new: true, date: 'Oct 13', endDate: 'Oct 15' })
    expect(INPEDIT.type, 'and never SANS availability').not.toBe('SANS Availability')
    expect(INPUTS.length).toBe(before)
    expect($$('.ib-day.is-picked')).toHaveLength(0)
  })
  it('the run carries on while the pointer crosses a BAR (the date under it is asked of the page, not of the bar)', async () => {
    const r = await file({ date: 'Oct 14', endDate: 'Oct 16' })
    under(day('2026-10-13'))
    await act(async () => { day('2026-10-13').dispatchEvent(ptr('pointerdown', 10, 10, 'mouse')) })
    under(bars(r.iid)[0], day('2026-10-15'))
    await act(async () => { window.dispatchEvent(ptr('pointermove', 200, 40, 'mouse')) })
    expect($$('.ib-day.is-picked').map(d => d.dataset.icday)).toEqual(['2026-10-13', '2026-10-14', '2026-10-15'])
    await act(async () => { window.dispatchEvent(ptr('pointercancel', 200, 40, 'mouse')) })
  })
  it('a finger held still on a date, then let go, opens "+ Input" for that day; a quick tap does not', async () => {
    vi.useFakeTimers()
    under(day('2026-10-20'))
    await act(async () => { day('2026-10-20').dispatchEvent(ptr('pointerdown', 10, 10)) })
    await act(async () => { vi.advanceTimersByTime(PICK_HOLD + 10) })
    expect(day('2026-10-20').classList.contains('is-picked'), 'the day lights to say the hold has taken').toBe(true)
    await act(async () => { window.dispatchEvent(ptr('pointerup', 10, 10)) })
    expect(INPEDIT).toMatchObject({ _new: true, date: 'Oct 20' })
    expect(INPEDIT.endDate).toBeUndefined()
  })
  it('a finger slid sideways turns the month', async () => {
    under(day('2026-10-20'))
    await act(async () => { day('2026-10-20').dispatchEvent(ptr('pointerdown', 200, 10)) })
    await act(async () => { window.dispatchEvent(ptr('pointermove', 120, 12)); window.dispatchEvent(ptr('pointerup', 120, 12)) })
    expect(CALMONTH).toEqual({ y: 2026, m: 11 })
  })
})

describe('the filters are the List’s own', () => {
  it('a person picked: his bars stay, the others go', async () => {
    const [a, b] = crew()
    const mine = await file({ person: a, date: 'Oct 6' }), his = await file({ person: b, date: 'Oct 6' })
    const sel = $('#inFPerson') as unknown as HTMLSelectElement
    await act(async () => { Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value')!.set!.call(sel, a); sel.dispatchEvent(new Event('change', { bubbles: true })) })
    expect(bars(mine.iid)).toHaveLength(1); expect(bars(his.iid)).toHaveLength(0)
  })
})

describe('on a phone the lines are what the screen’s height gives (D653, D664)', () => {
  const fill = async () => { const rows: any[] = []; for (const p of crew().slice(0, 9)) rows.push(await file({ person: p, date: 'Oct 21' })); return rows }
  const shown = (rows: any[]) => $$('.ib-bar').filter(b => rows.some(r => r.iid === b.dataset.iid)).length
  it('a short screen shows three lines and counts the rest; a taller one shows more — and it re-fits when the height changes', async () => {
    await act(async () => { root.unmount() }); host.remove()
    phone(true); (window as any).innerHeight = 380
    await mount()
    const rows = await fill()
    expect(shown(rows), 'never fewer than three').toBe(3)
    expect($('[data-icmore="2026-10-21"]')!.textContent).toBe('+6 more')
    await height(700)
    expect(shown(rows), 'the browser’s bars slide away: more lines').toBeGreaterThan(3)
    expect(shown(rows) + Number($('[data-icmore="2026-10-21"]')?.textContent?.match(/\d+/)?.[0] || 0)).toBe(9)
    await height(380)
    expect(shown(rows)).toBe(3)
  })
  it('a one-day bar says the callsign alone there, and the month’s name is three letters', async () => {
    await act(async () => { root.unmount() }); host.remove()
    phone(true); (window as any).innerHeight = 844
    await mount()
    const r = await file({ date: 'Oct 6' })
    expect(bars(r.iid)[0].textContent).toBe(cs(r.person))
    expect($('.ic-mon')!.textContent).toBe('Oct 2026')
  })
})

/* A SAVED INPUT, OR ONE BROUGHT BACK BY UNDO, IS SHOWN WHERE IT IS (the saved-row reveal, kept from the first calendar —
   the plan §3.10). Owner D672 (8 Oct 26): "if it's already in view, undo/redo don't need to snap to view. Unless it's
   outside the screen view then it's ok to snap into view." On the month an input is a BAR he can see: it flashes where
   it stands and nothing opens over the month. Only an input with no bar on the month — behind "+N more", or let
   through by no filter — opens its day, where it is listed. */
describe('a saved or brought-back input is shown where it is (D672)', () => {
  const reveal = async (row: any) => act(async () => { revealInput(INPUTS.find((r: any) => r.iid === row.iid)); notify() })
  it('its bar is on the month: the bar flashes, and no day opens over the month', async () => {
    const r = await file({ date: 'Oct 5', endDate: 'Oct 9' })
    await reveal(r)
    expect(bars(r.iid)[0].classList.contains('lift-land'), 'the bar flashes where it stands').toBe(true)
    expect($('.ib-day.is-open'), 'no day opens').toBeNull()
    expect($(`[data-popiid="${r.iid}"]`)).toBeNull()
  })
  it('it is in another month: the month turns to it, and its bar flashes there', async () => {
    const r = await file({ date: 'Dec 8' })
    await reveal(r)
    expect(CALMONTH).toEqual({ y: 2026, m: 12 })
    expect(bars(r.iid)[0].classList.contains('lift-land')).toBe(true)
    expect($('.ib-day.is-open')).toBeNull()
  })
  /* THE CALENDAR JOB'S BUG CHECK, 8 Oct 26 (walker E, P5-11): an input running 29 Oct to 3 Nov, the month on NOVEMBER with
     its last three days in view - an Undo of its move turned the month back to October, where it STARTS. D672: the
     screen moves only when what changed is out of view. */
  it('part of it is on the month shown: the month stays, and the part in view flashes', async () => {
    const r = await file({ date: 'Oct 29', endDate: 'Nov 3' })
    await act(async () => { setCalMonth({ y: 2026, m: 11 }); notify() })
    expect(bars(r.iid).length, 'its November days are drawn').toBeGreaterThan(0)
    await reveal(r)
    expect(CALMONTH, 'the month he was looking at').toEqual({ y: 2026, m: 11 })
    expect(bars(r.iid)[0].classList.contains('lift-land')).toBe(true)
    expect($('.ib-day.is-open')).toBeNull()
  })
  it('it has no bar — behind "+N more": its day opens and lists it', async () => {
    const rows: any[] = []
    for (const p of crew().slice(0, 9)) rows.push(await file({ person: p, date: 'Oct 21' }))
    const hidden = rows.find(r => !bars(r.iid).length)!
    expect(hidden, 'two of the nine have no line').toBeTruthy()
    await reveal(hidden)
    expect(day('2026-10-21').classList.contains('is-open')).toBe(true)
    expect($(`[data-popiid="${hidden.iid}"]`)).toBeTruthy()
  })
  it('a day is already open (he saved from its "+ Input"): the day shows the saved input, as before', async () => {
    under(day('2026-10-07'))
    await tap(day('2026-10-07'))
    const r = await file({ date: 'Oct 7' })
    await reveal(r)
    expect(day('2026-10-07').classList.contains('is-open')).toBe(true)
    expect($(`[data-popiid="${r.iid}"]`)).toBeTruthy()
    expect(bars(r.iid).some(b => b.classList.contains('lift-land')), 'the day shows it; the bar behind does not flash too').toBe(false)
  })
})

/* "HOW THIS WORKS" AND THE LEGEND (owner D646, 7 Oct 26: the fold was "abit wordy" — five short lines, "the same on the
   Inputs calendar"; the cut-off line "only states the rule as it is set", with no worked date and no "later than that
   is marked LATE"; D628: it changes when the setting changes). The legend says what the two colours of a bar mean, for
   everyone. */
describe('"How this works" and the legend (D646, D628)', () => {
  const press = async (el: HTMLElement) => act(async () => { el.click() })
  it('folded away until asked for; opened, it is five short lines', async () => {
    const how = $('[data-testid="ib-how"]')!
    expect(how.getAttribute('aria-expanded')).toBe('false'); expect($('[data-testid="ib-how-list"]')).toBeNull()
    await press(how)
    expect(how.getAttribute('aria-expanded')).toBe('true')
    expect($$('[data-testid="ib-how-list"] li')).toHaveLength(5)
    await press(how)
    expect($('[data-testid="ib-how-list"]')).toBeNull()
  })
  it('its last line states the late cut-off AS IT IS SET — and follows the setting, with no worked date and no word of LATE', async () => {
    await press($('[data-testid="ib-how"]')!)
    const line = () => $('[data-testid="ib-how-cut"]')!.textContent
    expect(line()).toBe('File at least 14 days before the week starts.')
    await act(async () => { saveCut('inputs', { mode: 1, lead: 14, wd: 2, weeks: 2 }) })
    expect(line()).toBe(cutSentence('inputs', 'File'))
    expect(line()).toMatch(/Wednesday/)
    expect($('[data-testid="ib-how-list"]')!.textContent).not.toMatch(/LATE|\d{1,2} (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/)
    await act(async () => { saveCut('inputs', { mode: 0, lead: 14, wd: 2, weeks: 2 }) })
  })
  it('the lines say what this calendar does — a tap, a bar, several days, the three tags', async () => {
    await press($('[data-testid="ib-how"]')!)
    const t = $('[data-testid="ib-how-list"]')!.textContent || ''
    for (const word of ['Tap a day', 'bar', 'several days', 'NF', 'public holiday', 'Off day']) expect(t, word).toContain(word)
    expect(t, 'SANS availability is not this calendar’s').not.toMatch(/SANS|committed|to fly/i)
  })
  it('the legend names the two colours of a bar, for a member too', async () => {
    const legend = () => $('[data-testid="ib-legend"]')!.textContent
    expect(legend()).toMatch(/absence/); expect(legend()).toMatch(/duty or commitment/)
    await act(async () => { setSession({ user: 'b', role: 'member' }); notify() })
    expect(legend()).toMatch(/absence/)
  })
})

describe('the month is part of the page', () => {
  it('it does not lock the page’s scroll, has no close cross, and the tabs sit in its own top row', () => {
    expect(document.body.classList.contains('sb-lock')).toBe(false)
    expect($('#icClose')).toBeNull()
    expect($('#inpCal [role="tablist"]')).toBeTruthy()
  })
  it('Escape on the month leaves the calendar where it is (it is a tab’s screen, not a layer to close)', async () => {
    await act(async () => { document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })) })
    expect($('#inpCal')).toBeTruthy()
  })
})
