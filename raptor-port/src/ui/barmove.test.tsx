// @vitest-environment jsdom
/* A BAR MOVED (the build plan docs/superpowers/plans/2026-10-07-inputs-sans-redesign-plan.md §3.6, §5 "A bar moved").

   "Drag-to-move is re-made for bars, not inherited: today's handler takes the starting date from the chip's enclosing
   day cell and a spanning bar has none. The handler resolves the date UNDER THE POINTER at the press — on a bar's
   first week or on a continuation — and at the drop, both from the day grid's geometry; the move is by that
   difference (a Monday-to-Friday input grabbed on its Wednesday and dropped on a Friday moves two days), the length
   kept; the landing flash finds the moved bar, not a chip in a cell. Permissions, the medical questions and the
   swallowed release-click stay as they are."

   A bare month in the shape the Inputs calendar draws (ui/InputsCal.tsx): a week's dates in one layer, its bars in
   another, a bar inside no date. jsdom lays nothing out, so each test says what lies under the pointer, top first —
   exactly what the machine asks of a real page (ui/caldays.ts). The older chip-in-a-cell cases stay in
   ui/caldrag.test.tsx; a real mouse and a real finger are e2e/inputs-calendar.spec.ts. */
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { histInit, initStore, setSession, undo } from '../state/store'
import { setMe } from '../state/auth'
import { INPUTS, idsOf, inpId, inputLines, mintInpIds } from '../engine/inputs'
import { HOOKS } from '../engine/hooks'
import { initCalDrag } from './caldrag'
import { markLand, pendingLand } from './lift'

const ptr = (type: string, x: number, y: number, kind = 'mouse') =>
  new PointerEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y, pointerId: 1, pointerType: kind, isPrimary: true })
let UNDER: Element[] = []
const under = (...els: (Element | null)[]) => { UNDER = els.filter(Boolean) as Element[] }
beforeAll(() => { initStore(); (document as any).elementsFromPoint = () => UNDER })

const SNAP = JSON.stringify(INPUTS)
let said: string[] = []
const realToast = HOOKS.toast
let off: () => void = () => {}
let taps: any[] = []
beforeEach(() => {
  INPUTS.length = 0; JSON.parse(SNAP).forEach((i: any) => INPUTS.push(i))
  mintInpIds()
  setSession({ user: 'a', role: 'admin' } as any); setMe('bane')
  said = []; taps = []
  HOOKS.toast = ((m: any) => { said.push(String(m)) }) as any
  histInit()
  document.body.innerHTML = ''
  UNDER = []; markLand('')
})
afterEach(() => { off(); off = () => {}; HOOKS.toast = realToast; vi.useRealTimers() })

/* two weeks of July 2026 (Mon 6 – Sun 19) and one input's bar — a second piece of it in the next week where it runs on */
function month(iid: string, second = false) {
  const days = (from: number) => Array.from({ length: 7 }, (_, i) => `<div class="ib-day" data-icday="2026-07-${String(from + i).padStart(2, '0')}"></div>`).join('')
  document.body.innerHTML = `<div id="root">
    <div class="ib-week"><div class="ib-cells">${days(6)}</div><div class="ib-lanes"><div class="ib-bar" data-icdrag data-iid="${iid}">bar</div></div></div>
    <div class="ib-week"><div class="ib-cells">${days(13)}</div><div class="ib-lanes">${second ? `<div class="ib-bar is-cont" data-icdrag data-iid="${iid}">bar</div>` : ''}</div></div>
  </div>`
  const root = document.getElementById('root')!
  off = initCalDrag(root, { onTap: e => taps.push(e) })
  const bars = [...root.querySelectorAll('.ib-bar')] as HTMLElement[]
  return { root, bars, day: (d: number) => root.querySelector(`[data-icday="2026-07-${String(d).padStart(2, '0')}"]`) as HTMLElement }
}
const input = (over: any) => { const row: any = { person: 'bane', type: 'LL', date: 'Jul 6', endDate: 'Jul 10', allday: true, remarks: '', mod: 'now', ...over }; inpId(row); INPUTS.unshift(row); return row }
/* a mouse: press on the bar over one date, carry it to another, let go */
function drag(bar: HTMLElement, from: HTMLElement, to: HTMLElement | null) {
  under(bar, from); bar.dispatchEvent(ptr('pointerdown', 10, 10))
  bar.dispatchEvent(ptr('pointermove', 20, 10))                 // past the mouse's slop: it lifts
  under(to); bar.dispatchEvent(ptr('pointermove', 200, 10))
  bar.dispatchEvent(ptr('pointerup', 200, 10))
}
const ghost = () => document.querySelector('.ic-ghost')

describe('a bar moves by the days between where it was grabbed and where it is dropped', () => {
  it('Monday to Friday, grabbed on its WEDNESDAY and dropped on Friday: it moves two days, its length kept', () => {
    const row = input({ date: 'Jul 6', endDate: 'Jul 10' })
    const m = month(row.iid)
    drag(m.bars[0], m.day(8), m.day(10))
    expect([row.date, row.endDate]).toEqual(['Jul 8', 'Jul 12'])
    expect(said).toContain('Moved to 8 Jul')
  })
  it('grabbed on its CONTINUATION in the next week: the date is the one under the pointer there, not the bar’s first', () => {
    const row = input({ date: 'Jul 10', endDate: 'Jul 14' })
    const m = month(row.iid, true)
    drag(m.bars[1], m.day(13), m.day(15))
    expect([row.date, row.endDate]).toEqual(['Jul 12', 'Jul 16'])
  })
  it('moved earlier just the same', () => {
    const row = input({ date: 'Jul 8', endDate: 'Jul 10' })
    const m = month(row.iid)
    drag(m.bars[0], m.day(9), m.day(7))
    expect([row.date, row.endDate]).toEqual(['Jul 6', 'Jul 8'])
  })
  it('a one-day input keeps no end date', () => {
    const row = input({ date: 'Jul 8', endDate: undefined })
    const m = month(row.iid)
    drag(m.bars[0], m.day(8), m.day(16))
    expect(row.date).toBe('Jul 16'); expect(row.endDate).toBeUndefined()
  })
  it('by a finger: held still until it lifts, then carried — the same move', () => {
    vi.useFakeTimers()
    const row = input({ date: 'Jul 6', endDate: 'Jul 10' })
    const m = month(row.iid)
    under(m.bars[0], m.day(8)); m.bars[0].dispatchEvent(ptr('pointerdown', 10, 10, 'touch'))
    expect(ghost(), 'a finger does not lift a bar at once').toBeNull()
    vi.advanceTimersByTime(200)
    expect(ghost(), 'held still, it lifts').toBeTruthy()
    under(m.day(10)); m.bars[0].dispatchEvent(ptr('pointermove', 200, 10, 'touch'))
    m.bars[0].dispatchEvent(ptr('pointerup', 200, 10, 'touch'))
    expect([row.date, row.endDate]).toEqual(['Jul 8', 'Jul 12'])
  })
  /* A RED CHECK RUN WITH EVERY TEST PASSED (GitHub, 13 Oct 26 — "ReferenceError: document is not defined", from this
     file). Every drag that ends leaves a 350ms timer behind it, to retire the guard that eats the drag's own release
     click; a test file that ends inside those 350ms has its page taken away first, and the timer then reached for a
     page that was gone. On a real page it can never happen — but the run goes red, now and then, for nothing. */
  it('the timer that retires a drag’s click guard does nothing once the page is gone', () => {
    vi.useFakeTimers()
    const row = input({ date: 'Jul 6', endDate: 'Jul 10' })
    const m = month(row.iid)
    drag(m.bars[0], m.day(8), m.day(10))
    const doc = globalThis.document
    try {
      ;(globalThis as any).document = undefined
      expect(() => vi.advanceTimersByTime(400)).not.toThrow()
    } finally { (globalThis as any).document = doc }
  })
  it('one move is one Undo step, and Undo puts it back whole', () => {
    const row = input({ date: 'Jul 6', endDate: 'Jul 10' })
    histInit()
    const m = month(row.iid)
    drag(m.bars[0], m.day(8), m.day(10))
    undo()
    const back: any = INPUTS.find((r: any) => r.iid === row.iid)
    expect([back.date, back.endDate]).toEqual(['Jul 6', 'Jul 10'])
  })
})

describe('while it is carried, and where it lands', () => {
  it('the date under it lights, and stops lighting when the bar moves on', () => {
    const row = input({})
    const m = month(row.iid)
    under(m.bars[0], m.day(8)); m.bars[0].dispatchEvent(ptr('pointerdown', 10, 10)); m.bars[0].dispatchEvent(ptr('pointermove', 20, 10))
    under(m.day(10)); m.bars[0].dispatchEvent(ptr('pointermove', 200, 10))
    expect(m.day(10).classList.contains('ic-over')).toBe(true)
    under(m.day(15)); m.bars[0].dispatchEvent(ptr('pointermove', 200, 90))
    expect(m.day(10).classList.contains('ic-over')).toBe(false); expect(m.day(15).classList.contains('ic-over')).toBe(true)
    m.bars[0].dispatchEvent(ptr('pointercancel', 200, 90))
    expect(m.day(15).classList.contains('ic-over'), 'a cancelled drag leaves nothing lit').toBe(false)
    expect(ghost()).toBeNull()
  })
  it('the landing is marked by the bar’s OWN id, as a bar — it is inside no date to be looked for in, and the hidden List’s row has the same id', () => {
    const row = input({})
    const m = month(row.iid)
    drag(m.bars[0], m.day(8), m.day(10))
    expect(pendingLand()!.sel).toBe(`.ib-bar[data-iid="${row.iid}"]`)
  })
  it('dropped back on the date it was grabbed on: nothing changes, nothing is said, no Undo step — and it flashes where it stands', () => {
    const row = input({ date: 'Jul 6', endDate: 'Jul 10' })
    histInit()
    const before = JSON.stringify(INPUTS)
    const m = month(row.iid)
    drag(m.bars[0], m.day(8), m.day(8))
    expect(JSON.stringify(INPUTS)).toBe(before)
    expect(said).toEqual([])
    expect(pendingLand(), 'nothing is marked — nothing will be rebuilt').toBeNull()
    expect(m.bars[0].classList.contains('lift-land'), 'it lands where it stands').toBe(true)
    undo()
    expect(JSON.stringify(INPUTS), 'there was no step to take back').toBe(before)
  })
  it('let go over no date at all: nothing moves and nothing flashes', () => {
    const row = input({})
    const m = month(row.iid)
    drag(m.bars[0], m.day(8), null)
    expect([row.date, row.endDate]).toEqual(['Jul 6', 'Jul 10'])
    expect(pendingLand()).toBeNull(); expect(m.bars[0].classList.contains('lift-land')).toBe(false)
  })
  it('a press where the page can name no date under the bar starts nothing', () => {
    const row = input({})
    const m = month(row.iid)
    under(m.bars[0]); m.bars[0].dispatchEvent(ptr('pointerdown', 10, 10)); m.bars[0].dispatchEvent(ptr('pointermove', 30, 10))
    expect(ghost()).toBeNull()
    m.bars[0].dispatchEvent(ptr('pointerup', 30, 10))
    expect(taps).toEqual([])
  })
})

describe('who may move a bar', () => {
  beforeEach(() => { setSession({ user: 'user', role: 'main' } as any) })
  it('a member moves his own', () => {
    const row = input({ person: 'bane' })
    const m = month(row.iid)
    drag(m.bars[0], m.day(8), m.day(10))
    expect(row.date).toBe('Jul 8')
  })
  it('another man’s bar does not lift for him — no ghost, no date lit, nothing moved; a tap still opens it', () => {
    const row = input({ person: 'stiff' })
    const m = month(row.iid)
    drag(m.bars[0], m.day(8), m.day(10))
    expect(ghost()).toBeNull()
    expect(m.day(10).classList.contains('ic-over')).toBe(false)
    expect([row.date, row.endDate]).toEqual(['Jul 6', 'Jul 10'])
    under(m.bars[0], m.day(8))
    m.bars[0].dispatchEvent(ptr('pointerdown', 10, 10)); m.bars[0].dispatchEvent(ptr('pointerup', 10, 10))
    expect(taps.map(t => t.iid)).toEqual([row.iid])
  })
})

/* A SHARED INPUT'S BAR (owner D655: "one shared group input, shown and edited as one thing"; the plan §3.13: "Dragging
   the bar moves the whole entry in one command — for the filer and an admin; for anyone else it does not lift").
   RE-EXPRESSED ON THE ONE RECORD (the one-rule build, step 2 — owner D756, D759; the plan
   docs/superpowers/plans/2026-10-11-one-rule-plan.md §4.5): a shared input is ONE stored record with the list of its
   people, so the bar is that record's and the move is that record's. "Every man's day moved" is read the way the rules
   read one man's day — one line a named person (engine/inputs.ts inputLines). */
describe('a shared input’s bar moves the whole entry', () => {
  const team = (people: string[], over: any = {}) => {
    const by = over.by ?? 'stiff'
    const row: any = { people: people.map(p => ({ p, by, at: 1 })), type: 'Meeting', date: 'Jul 8', allday: false, s: 600, e: 660, remarks: 'brief', mod: 'now', by, at: 1, ...over }
    inpId(row); INPUTS.unshift(row); return row
  }
  /* each man's date as the app holds it now: the people still in the input, in the order they joined, and the date on
     each one's own line — so a man dropped from it, or one left behind on the old date, fails here */
  const dates = (row: any) => {
    const live: any = INPUTS.find((x: any) => x.iid === row.iid)
    return idsOf(live).map((p: any) => [p, inputLines([live]).find((l: any) => l.person === p)!.date])
  }
  const all = (people: string[], date: string) => people.map(p => [p, date])
  /* pressed, lifted and carried over another date — and still held */
  const carry = (bar: HTMLElement, from: HTMLElement, to: HTMLElement) => {
    under(bar, from); bar.dispatchEvent(ptr('pointerdown', 10, 10)); bar.dispatchEvent(ptr('pointermove', 20, 10))
    under(to); bar.dispatchEvent(ptr('pointermove', 200, 10))
  }
  it('an admin drags it two days on: it moves for every man in it, and one Undo puts them all back', () => {
    const who = ['stiff', 'bane', 'casper']
    const row = team(who)
    histInit()
    const n = INPUTS.length
    const m = month(row.iid)
    drag(m.bars[0], m.day(8), m.day(10))
    expect(dates(row)).toEqual(all(who, 'Jul 10'))
    expect(INPUTS.length, 'still the one record — nobody was split out of it').toBe(n)
    expect(said.join(' | ')).toContain('Moved to')
    undo()
    expect(dates(row), 'one step').toEqual(all(who, 'Jul 8'))
  })
  it('the member who filed it drags it: it moves for everyone', () => {
    setSession({ user: 'user', role: 'main' } as any)
    const who = ['bane', 'stiff', 'casper']
    const row = team(who, { by: 'bane' })
    const n = INPUTS.length
    const m = month(row.iid)
    drag(m.bars[0], m.day(8), m.day(9))
    expect(dates(row)).toEqual(all(who, 'Jul 9'))
    expect(INPUTS.length, 'still the one record').toBe(n)
  })
  it('a man in it who did not file it: the bar does not lift, and nothing moves — his own day included', () => {
    setSession({ user: 'user', role: 'main' } as any)
    const who = ['bane', 'stiff', 'casper']
    const row = team(who)
    const before = JSON.stringify(INPUTS)
    const m = month(row.iid)
    carry(m.bars[0], m.day(8), m.day(10))
    expect(ghost(), 'while it is held').toBeNull()
    m.bars[0].dispatchEvent(ptr('pointerup', 200, 10))
    expect(dates(row)).toEqual(all(who, 'Jul 8'))
    expect(JSON.stringify(INPUTS), 'nothing was written — he was not split out into an input of his own').toBe(before)
  })
  it('anyone else: it does not lift', () => {
    setSession({ user: 'user', role: 'main' } as any)
    const who = ['stiff', 'casper']
    const row = team(who)
    const m = month(row.iid)
    carry(m.bars[0], m.day(8), m.day(10))
    expect(ghost(), 'while it is held').toBeNull()
    m.bars[0].dispatchEvent(ptr('pointerup', 200, 10))
    expect(dates(row)).toEqual(all(who, 'Jul 8'))
  })
  /* THE OLD SHAPE, STILL READ (owner D759 reading 10 — "shared inputs saved before this build are read as one-person
     inputs"; stored data only, D56): records tied by the old group id are each an input of their own, so each has a bar
     of its own and a drag moves that one alone. */
  it('OLD-SHAPE records tied by a group id (D759 reading 10): each is its own input — an admin’s drag moves the one bar grabbed, never the others', () => {
    const rows = ['stiff', 'bane', 'casper'].map(p =>
      input({ person: p, type: 'Meeting', date: 'Jul 8', endDate: undefined, allday: false, s: 600, e: 660, remarks: 'brief', grp: 'gB', grpBy: 'stiff', by: 'stiff' }))
    const m = month(rows[2].iid)
    drag(m.bars[0], m.day(8), m.day(10))
    expect(rows.map(r => INPUTS.find((x: any) => x.iid === r.iid)!.date)).toEqual(['Jul 8', 'Jul 8', 'Jul 10'])
  })
})
