// @vitest-environment jsdom
/* A CANCELLED INPUT'S LOOK ([ALL-AVAIL-AS-MEMBER] step 5, 12 Oct 26; the plan
   docs/superpowers/plans/2026-10-11-one-rule-plan.md §4.5, §8 Q2 and Q3). His rulings:
   D760 — "a CX the scheduler puts on a row that came from an input cancels the input itself: the Inputs calendar shows
           it cancelled with its reason" — a cancelled input stays listed; it is not deleted.
   D767 — shown two looks on the pictures page: "as recommended but change something. For the cx I also want u to
           strike through the title and the reason for e.g in this case is cx is red"; "For those areas that have no
           space to show reason it's ok". So: on the CARD and the LIST'S ROW a small red CX tag before the title, the
           title struck through, the reason after it in red; on the MONTH'S BAR the words struck through and the bar
           faded, no tag, no reason. Its readings: (1) the names, the hours, LATE and "By Saber" are untouched and the
           remark follows the reason; (2) an input with no title of its own strikes through its kind's name; (3) the
           schedule's own line under Personal Inputs wears the red CX tag and the struck-through name; (4) where no
           reason was typed the tag stands alone.
   D768 — "it keeps its place in the day's order — not sorted last".

   The design of record: docs/mock/2026-10-12-one-rule/cancelled-B-{desk,phone}-card.png and -list.png (with his two
   changes) and cancelled-A-{desk,phone}-bar.png.

   What says it: ui/inputcard-model.ts cardOf (`cx`, `why`) → ui/InputCard.tsx (the opened day and the phone's list);
   ui/InputsPage.tsx (the desktop list's row); ui/inputscal-model.ts monthItems (`cx`) → ui/InputsCal.tsx (the bar);
   ui/html.ts and ui/board-html.ts (the schedule's lines). */
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { InputsPage } from './InputsPage'
import { InputEditor } from './inputedit'
import { InputCard } from './InputCard'
import { cardOf, cxSays } from './inputcard-model'
import { monthItems, barText } from './inputscal-model'
import { inpCxHTML } from './html'
import { initStore, notify, setSession, writeInputs } from '../state/store'
import { setInpMode, setInpView, setPage, setCalMonth } from '../state/view'
import { setMe } from '../state/auth'
import { INPUTS } from '../engine/inputs'
import { PEOPLE } from '../engine/people'
import { HOOKS, storeBackend } from '../engine/hooks'
import { initStore as lwInitStore, setRole as lwSetRole } from '../leavewar/state/store'
import { memoryBackend } from '../leavewar/state/storage'
import { _resetFloatWins } from './FloatWindow'
import { setInpEdit } from './pops'
;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

let host: HTMLDivElement, root: Root
const seed = JSON.stringify(INPUTS)
const realToast = HOOKS.toast
const realMM = (window as any).matchMedia
const $ = (sel: string) => document.querySelector(sel) as HTMLElement | null
const $$ = (sel: string) => [...document.querySelectorAll(sel)] as HTMLElement[]
const admin = 'stiff', member = 'bane'
const cs = (id: any) => PEOPLE[id].cs as string
const others = () => Object.keys(PEOPLE).filter(id => !PEOPLE[id].archived && !PEOPLE[id].deleted && !PEOPLE[id].special && !PEOPLE[id].san && !PEOPLE[id].pers && id !== admin && id !== member)
const live = (iid: string) => INPUTS.find((r: any) => r.iid === iid) as any
const click = async (el: Element | null) => { expect(el, 'click target').toBeTruthy(); await act(async () => { (el as HTMLElement).click() }) }
let phoneNow = false
const asPhone = (on: boolean) => {
  phoneNow = on
  ;(window as any).matchMedia = (q: string) => ({ get matches() { return phoneNow && /max-width:\s*820px/.test(q) },
    addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} })
}
const T = (d: number, h: number, m: number) => new Date(2026, 9, d, h, m).getTime()
let n = 0
/* one record with its people, as the one-rule build stores it (D756) */
const file = async (over: any = {}, people?: string[]) => {
  const who = people || [others()[0]]
  const row = { iid: 'cx' + (++n), people: who.map(p => ({ p, by: admin, at: T(1, 9, 0) })), type: 'Training', title: 'Range brief', date: 'Oct 20', yr: 2026,
    allday: false, s: 540, e: 600, remarks: 'Bring your kit', mod: '2026-09-01', by: admin, at: T(1, 9, 0), ...over }
  await act(async () => { writeInputs(() => { INPUTS.push(row) }); notify() })
  return live(row.iid)
}
const CX = { cx: true, cxr: 'WX' }
const allDates = async () => { if (!$('#inRangePop')) await click($('#inRangeBtn')); await click($('#inRangeAll')) }
const mount = async (phone: boolean, view: 'table' | 'cal' = 'table') => {
  asPhone(phone)
  setInpView(view)
  if (view === 'cal') setCalMonth({ y: 2026, m: 10 })   // October — the month is counted from 1
  host = document.createElement('div'); document.body.append(host); root = createRoot(host)
  await act(async () => { root.render(<><InputsPage /><InputEditor /></>) })
  if (view === 'table') await allDates()
}

beforeEach(async () => {
  INPUTS.splice(0, INPUTS.length)
  const mem = new Map<string, string>()
  storeBackend.impl = { getItem: k => mem.get(k) ?? null, setItem: (k, v) => mem.set(k, v), keys: () => [...mem.keys()] }
  initStore(); INPUTS.splice(0, INPUTS.length)
  setSession({ user: admin, role: 'admin' }); setMe(admin); lwInitStore(memoryBackend()); lwSetRole('admin')
  setPage('inputs'); setInpMode('member'); setInpView('table')
  HOOKS.toast = (() => {}) as any
})
afterEach(async () => {
  if (root) await act(async () => { root.unmount(); setInpEdit(null) })
  HOOKS.toast = realToast; (window as any).matchMedia = realMM
  if (host) host.remove()
  _resetFloatWins(); INPUTS.splice(0, INPUTS.length, ...JSON.parse(seed))
})

describe('what a cancelled input\'s card is told (D760, D767) — ui/inputcard-model.ts', () => {
  const rec = (over: any = {}) => ({ iid: 'k1', people: [{ p: member }], type: 'Training', title: 'Range brief', date: 'Oct 20', yr: 2026, allday: false, s: 540, e: 600, remarks: 'Bring your kit', by: admin, ...over })
  it('a cancelled input says so, with its reason', () => {
    const f = cardOf([rec(CX)])
    expect(f.cx).toBe(true)
    expect(f.why).toBe('WX')
  })
  it('D767 reading 4: cancelled with no reason typed — cancelled, and no reason', () => {
    const f = cardOf([rec({ cx: true })])
    expect(f.cx).toBe(true)
    expect(f.why).toBe('')
    expect(cardOf([rec({ cx: true, cxr: '   ' })]).why, 'a reason of spaces is no reason').toBe('')
  })
  it('an input never cancelled, and one brought back (cx: false — the plan\'s F14), say nothing', () => {
    for (const r of [rec(), rec({ cx: false }), rec({ cx: false, cxr: 'WX' })]) {
      const f = cardOf([r])
      expect(f.cx).toBe(false)
      expect(f.why, 'a reason left on a record that is not cancelled is never shown').toBe('')
    }
  })
  it('D767 reading 1: nothing else of the card changes — the names, the kind, the title, the remark, "By"', () => {
    const { cx: _a, why: _b, ...was } = cardOf([rec()]) as any
    const { cx: _c, why: _d, ...now } = cardOf([rec(CX)]) as any
    expect(now).toEqual(was)
  })
  it('what a reader who cannot see the strike is told: "Cancelled — WX", "Cancelled" where no reason was typed, nothing otherwise', () => {
    expect(cxSays(rec(CX))).toBe('Cancelled — WX')
    expect(cxSays(rec({ cx: true }))).toBe('Cancelled')
    expect(cxSays(rec())).toBe('')
    expect(cxSays(rec({ cx: false, cxr: 'WX' }))).toBe('')
  })
})

describe('the card — the opened day and the phone\'s list (D767: look B with his two changes)', () => {
  const draw = async (facts: any) => {
    host = document.createElement('div'); document.body.append(host); root = createRoot(host)
    await act(async () => { root.render(<InputCard id="k1" facts={facts} when="09:00–10:00" late="Filed after the cut-off" tid="idy" onOpen={() => {}} />) })
  }
  const base = { names: 'Hex, Ranger', kind: 'Training', title: 'Range brief', remark: 'Bring your kit', by: 'Saber', tone: 'amb' as const }
  const part = (k: string) => $(`[data-testid="idy-${k}"]`)

  it('a small red CX tag BEFORE the title, the title struck through, the reason AFTER it, then the remark', async () => {
    await draw({ ...base, cx: true, why: 'WX' })
    const tag = part('cx')!, title = part('title')!, why = part('why')!, rmk = part('rmk')!
    expect(tag.textContent).toBe('CX')
    expect(tag.classList.contains('icx'), 'the red tag').toBe(true)
    expect(title.textContent, 'the title\'s own words are untouched').toBe('Range brief')
    expect(title.classList.contains('is-cx'), 'the title is struck through').toBe(true)
    expect(why.textContent).toBe('WX')
    expect(why.classList.contains('icx-why'), 'the reason is the red one').toBe(true)
    /* the order on the words row: tag, title, reason, remark */
    const order = [...$('.icard-text')!.querySelectorAll('[data-testid]')].map(e => e.getAttribute('data-testid'))
    expect(order).toEqual(['idy-cx', 'idy-title', 'idy-why', 'idy-rmk'])
    expect(rmk.textContent).toBe('Bring your kit')
    expect(rmk.classList.contains('icx-why'), 'the remark keeps its ordinary grey').toBe(false)
    expect($('.icard-text')!.textContent, 'as his picture reads: the reason, a dot, the remark').toBe('CXRange briefWX · Bring your kit')
  })
  it('D767 reading 1: the names, the kind, LATE, the hours and "By Saber" are as on any card — none struck', async () => {
    await draw({ ...base, cx: true, why: 'WX' })
    expect(part('who')!.textContent).toBe('Hex, Ranger')
    expect(part('kind')!.textContent).toBe('Training')
    expect(part('late')!.textContent).toBe('LATE')
    expect(part('when')!.textContent).toBe('09:00–10:00')
    expect(part('by')!.textContent).toBe('By Saber')
    for (const k of ['who', 'kind', 'late', 'when', 'by', 'rmk']) expect(part(k)!.classList.contains('is-cx'), k + ' is not struck').toBe(false)
  })
  it('D767 reading 4: no reason typed — the tag stands alone, and no dot leads the remark\'s place twice', async () => {
    await draw({ ...base, cx: true, why: '' })
    expect(part('cx')!.textContent).toBe('CX')
    expect(part('why')).toBeNull()
    expect($('.icard-text')!.textContent).toBe('CXRange brief · Bring your kit')
  })
  it('D767 reading 2: an input with no title of its own — its KIND\'s name is struck through; the tag and the reason lead the words row', async () => {
    await draw({ ...base, title: '', cx: true, why: 'WX' })
    expect(part('title'), 'it has no title row of its own').toBeNull()
    expect(part('kind')!.classList.contains('is-cx'), 'the kind\'s name is what it goes by — struck').toBe(true)
    expect($('.icard-text')!.textContent).toBe('CXWX · Bring your kit')
  })
  it('…with no title, no remark and no reason the card still says CX — a words row with the tag alone', async () => {
    await draw({ ...base, title: '', remark: '', by: '', cx: true, why: '' })
    expect(part('cx')!.textContent).toBe('CX')
    expect(part('kind')!.classList.contains('is-cx')).toBe(true)
  })
  it('a reader who cannot see a strike is told: the card\'s button says "cancelled" and the reason', async () => {
    await draw({ ...base, cx: true, why: 'WX' })
    expect(part('open')!.getAttribute('aria-label')).toContain('cancelled — WX')
  })
  it('an input that is not cancelled draws exactly what it drew: no tag, no reason, nothing struck', async () => {
    await draw({ ...base, cx: false, why: '' })
    expect(part('cx')).toBeNull()
    expect(part('why')).toBeNull()
    expect($$('.is-cx').length).toBe(0)
    expect($('.icard-text')!.textContent).toBe('Range brief · Bring your kit')
    expect(part('open')!.getAttribute('aria-label')).not.toContain('cancelled')
  })
})

describe('the Inputs list (D767)', () => {
  it('on a phone the list\'s card is the same card: tag, struck title, reason', async () => {
    await mount(true)
    const r = await file(CX)
    const card = $(`[data-testid="inl-row-${r.iid}"]`)!
    expect(card.querySelector('[data-testid="inl-cx"]')!.textContent).toBe('CX')
    expect(card.querySelector('[data-testid="inl-title"]')!.classList.contains('is-cx')).toBe(true)
    expect(card.querySelector('[data-testid="inl-why"]')!.textContent).toBe('WX')
  })
  it('on a desktop the row\'s Type cell: the tag before the title, the title struck through, the reason after it; the kind keeps its pill (D727)', async () => {
    await mount(false)
    const r = await file(CX)
    const cell = $(`#inBody tr[data-iid="${r.iid}"] td[data-label="Type"]`)!
    const tag = cell.querySelector('[data-testid="in-cx"]')!, title = cell.querySelector('[data-testid="in-title"]')!, why = cell.querySelector('[data-testid="in-why"]')!
    expect(tag.textContent).toBe('CX')
    expect(title.textContent).toBe('Range brief')
    expect(title.classList.contains('is-cx')).toBe(true)
    expect(why.textContent).toBe('WX')
    expect(tag.compareDocumentPosition(title) & Node.DOCUMENT_POSITION_FOLLOWING, 'the tag is before the title').toBeTruthy()
    expect(title.compareDocumentPosition(why) & Node.DOCUMENT_POSITION_FOLLOWING, 'the reason is after the title').toBeTruthy()
    const pill = cell.querySelector('.intag')!
    expect(pill.textContent, 'the pill is the kind, whole — what the sort and the export read').toBe('Training')
    expect(pill.classList.contains('is-cx'), 'the title is what it goes by, so the pill is not struck').toBe(false)
  })
  it('D767 reading 2, on the desktop row: no title of its own — the kind\'s pill is struck, the tag and reason stand before it', async () => {
    await mount(false)
    const r = await file({ ...CX, title: undefined })
    const cell = $(`#inBody tr[data-iid="${r.iid}"] td[data-label="Type"]`)!
    expect(cell.querySelector('[data-testid="in-title"]')).toBeNull()
    expect(cell.querySelector('[data-testid="in-cx"]')!.textContent).toBe('CX')
    expect(cell.querySelector('[data-testid="in-why"]')!.textContent).toBe('WX')
    expect(cell.querySelector('.intag')!.classList.contains('is-cx')).toBe(true)
    expect(cell.querySelector('.intag')!.textContent).toBe('Training')
  })
  it('D767 reading 1, on the desktop row: the name, the dates, the remark, LATE and "By" read as before', async () => {
    await mount(false)
    const a = await file()
    const b = await file(CX)
    const cells = (r: any, skip: string) => $$(`#inBody tr[data-iid="${r.iid}"] td`).filter(td => td.getAttribute('data-label') !== skip).map(td => td.textContent)
    expect(cells(b, 'Type')).toEqual(cells(a, 'Type'))
  })
  it('a row that is not cancelled, and one brought back, carry no tag', async () => {
    await mount(false)
    const a = await file()
    const b = await file({ cx: false })
    for (const r of [a, b]) {
      const cell = $(`#inBody tr[data-iid="${r.iid}"] td[data-label="Type"]`)!
      expect(cell.querySelector('[data-testid="in-cx"]')).toBeNull()
      expect(cell.querySelector('.is-cx')).toBeNull()
    }
  })
  it('D760: a cancelled input stays LISTED — the list counts it as it did', async () => {
    await mount(true)
    await file()
    await file(CX)
    expect($('[data-testid="inl-day"] i')!.textContent).toBe('2 inputs')
  })
})

describe('the month\'s bar (D767: look A — struck through and faded, no tag, no reason)', () => {
  const F = { fType: 'all', fPerson: 'all', fSearch: '' } as any
  it('the bar\'s item says it is cancelled; its words are what they were — no "CX", no reason', () => {
    const p = others()[0]
    const rec = (over: any = {}) => ({ iid: 'b1', people: [{ p }], type: 'Training', title: 'Range brief', date: 'Oct 20', yr: 2026, allday: false, s: 540, e: 600, ...over })
    const [was] = monthItems([rec()], F), [now] = monthItems([rec(CX)], F)
    expect(was.cx).toBe(false)
    expect(now.cx).toBe(true)
    for (const narrow of [false, true]) expect(barText(now, narrow)).toBe(barText(was, narrow))
    expect(monthItems([rec({ cx: false })], F)[0].cx, 'brought back').toBe(false)
  })
  it('D768: it keeps its place in the day\'s order — cancelling an input moves nothing', () => {
    const [a, b, c, d] = others()
    const day = (cxOn: string) => [
      { iid: 'o1', people: [{ p: a }], type: 'LL', date: 'Oct 20', yr: 2026, allday: true },
      { iid: 'o2', people: [{ p: b }], type: 'Meeting', date: 'Oct 20', yr: 2026, allday: false, s: 480, e: 540 },
      { iid: 'o3', people: [{ p: c }], type: 'Training', date: 'Oct 20', yr: 2026, allday: false, s: 540, e: 600 },
      { iid: 'o4', people: [{ p: d }], type: 'Duty', date: 'Oct 20', yr: 2026, allday: false, s: 600, e: 660 },
    ].map(r => (r.iid === cxOn ? { ...r, ...CX } : r))
    const order = (cxOn: string) => monthItems(day(cxOn), F).map(i => i.key)
    const plain = order('')
    for (const id of ['o1', 'o2', 'o3', 'o4']) expect(order(id), `cancelling ${id} moves nothing`).toEqual(plain)
  })
  it('drawn: the bar wears the cancelled class and says what it said; another input\'s bar does not', async () => {
    await mount(false, 'cal')
    const a = await file()
    const b = await file({ ...CX, date: 'Oct 21' })
    const bar = (r: any) => $(`.ib-bar[data-iid="${r.iid}"]`)!
    expect(bar(b), 'the cancelled input still has its bar (D760)').toBeTruthy()
    expect(bar(b).classList.contains('is-cx')).toBe(true)
    expect(bar(a).classList.contains('is-cx')).toBe(false)
    expect(bar(b).textContent, 'no tag and no reason on a bar').toBe(`${cs(others()[0])} · Range brief`)
    expect(bar(b).getAttribute('title'), 'hovered, it says why').toContain('Cancelled — WX')
    expect(bar(a).getAttribute('title')).not.toContain('Cancelled')
  })
})

describe('the schedule\'s own line of a cancelled input (D767 reading 3) — ui/html.ts inpCxHTML', () => {
  it('the schedule\'s red CX tag, with the reason riding in it as on its Ground Programme row', () => {
    const h = inpCxHTML({ cx: true, cxr: 'WX' })
    host = document.createElement('div'); host.innerHTML = h; document.body.append(host)
    const tag = host.querySelector('.cxtag')!
    expect(tag.textContent).toBe('CX DUE WX')
  })
  it('nothing for an input that is not cancelled', () => {
    expect(inpCxHTML({})).toBe('')
    expect(inpCxHTML({ cx: false, cxr: 'WX' })).toBe('')
  })
})
