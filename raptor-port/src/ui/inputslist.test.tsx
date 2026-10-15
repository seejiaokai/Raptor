// @vitest-environment jsdom
/* THE INPUTS LIST WITHOUT ITS PENCIL AND CROSS — the card on a phone, the table on a desktop (owner D718, D723, D724 —
   10 Oct 26; `[INPUT-LIST-AS-DAY-CARD]`; the plan docs/superpowers/plans/2026-10-10-input-card-plan.md §2.3).

   D718: "the agreed layout can be used for the input list view too. And seems like the edit and cross is not needed
   because just like how it's working now u can click on it to edit it or delete it."
   D723: on a phone THE SAME CARD as the opened day's, under a slim heading a day ("SAT 18 JUL · 6 inputs"); the desktop
   list keeps its columns and sorting and loses its pencil and cross too.

   The card's own words are pinned on the opened day (ui/inputsday.test.tsx, ui/sharedline.test.tsx,
   ui/inputtitle.test.tsx) and in ui/inputcard-model.test.ts; here they are asked of the LIST's card kind by kind, so a
   list that drew its own would be caught (the roll-call of the plan's §4: two surfaces, one card). */
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { InputsPage } from './InputsPage'
import { InputEditor } from './inputedit'
import { initStore, notify, setSession, writeInputs } from '../state/store'
import { setInpMode, setInpView, setPage } from '../state/view'
import { setMe } from '../state/auth'
import { INPUTS } from '../engine/inputs'
import { PEOPLE } from '../engine/people'
import { HOOKS, storeBackend } from '../engine/hooks'
import { initStore as lwInitStore, setRole as lwSetRole } from '../leavewar/state/store'
import { memoryBackend } from '../leavewar/state/storage'
import { _resetFloatWins } from './FloatWindow'
import { INPEDIT, setInpEdit } from './pops'
;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

let host: HTMLDivElement, root: Root
const seed = JSON.stringify(INPUTS)
const realToast = HOOKS.toast
const realMM = (window as any).matchMedia
const $ = (sel: string) => document.querySelector(sel) as HTMLElement | null
const $$ = (sel: string) => [...document.querySelectorAll(sel)] as HTMLElement[]
const cs = (id: any) => PEOPLE[id].cs as string
const admin = 'stiff', member = 'bane'
const others = () => Object.keys(PEOPLE).filter(id => !PEOPLE[id].archived && !PEOPLE[id].deleted && !PEOPLE[id].special && !PEOPLE[id].san && !PEOPLE[id].pers && id !== admin && id !== member)
const az = (ids: string[]) => [...ids].sort((a, b) => cs(a).localeCompare(cs(b), undefined, { sensitivity: 'base' }))
const live = (iid: string) => INPUTS.find((r: any) => r.iid === iid) as any
const click = async (el: Element | null) => { expect(el, 'click target').toBeTruthy(); await act(async () => { (el as HTMLElement).click() }) }
const key = async (el: Element, k: string) => act(async () => { el.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true })) })
/* the stylesheet's own width for "a phone" — the list asks it as the stylesheet does (ui/usemedia.ts) */
let phoneNow = false
const mqHeard = new Set<() => void>()
const asPhone = (on: boolean) => {
  phoneNow = on; mqHeard.clear()
  ;(window as any).matchMedia = (q: string) => ({ get matches() { return phoneNow && /max-width:\s*820px/.test(q) },
    addEventListener(_: string, f: () => void) { mqHeard.add(f) }, removeEventListener(_: string, f: () => void) { mqHeard.delete(f) }, addListener() {}, removeListener() {} })
}
/* the screen changes width while the page is up — a phone turned, a window narrowed: the browser tells whoever asked */
const turn = async (on: boolean) => act(async () => { phoneNow = on; [...mqHeard].forEach(f => f()) })
const T = (d: number, h: number, m: number) => new Date(2026, 9, d, h, m).getTime()
let n = 0
/* nothing but what a test files: the demo's own inputs are taken away, so a heading's count is the test's own */
const file = async (over: any = {}) => {
  const row = { iid: 'il' + (++n), person: others()[0], type: 'Meeting', date: 'Oct 20', yr: 2026, allday: false, s: 600, e: 660, remarks: '', mod: '2026-09-01', by: others()[0], at: T(1, 9, 0), ...over }
  await act(async () => { writeInputs(() => { INPUTS.push(row) }); notify() })
  return live(row.iid)
}
/* A SHARED INPUT IS ONE RECORD HOLDING ITS PEOPLE, in the order they joined (the one-rule build, step 2 — owner D756,
   D759; the plan docs/superpowers/plans/2026-10-11-one-rule-plan.md §4.1). Until that build this fixture was a record a
   man tied by a group id — which is read, now and for ever, as so many one-person inputs (D759 reading 10): the case
   "OLD-SHAPE records tied by a group id" below keeps that. */
const shared = async (people: string[], over: any = {}) => {
  const iid = 'gI' + (++n)
  const row = { iid, people: people.map(p => ({ p, by: admin, at: T(1, 9, 0) })), type: 'Meeting', date: 'Oct 20', yr: 2026, allday: false, s: 600, e: 660,
    remarks: '', mod: '2026-09-01', by: admin, at: T(1, 9, 0), ...over }
  await act(async () => { writeInputs(() => { INPUTS.push(row) }); notify() })
  return { rows: [live(iid)], first: az(people)[0] }
}
/* …and the same people as the OLD shape kept them: a record a man, tied by a group id */
const oldGroup = async (people: string[], over: any = {}) => {
  const grp = 'gO' + (++n)
  const rows = people.map((p, i) => ({ iid: `${grp}-${i}`, person: p, type: 'Meeting', date: 'Oct 20', yr: 2026, allday: false, s: 600, e: 660,
    remarks: '', mod: '2026-09-01', grp, grpBy: admin, by: admin, at: T(1, 9, 0), ...over }))
  await act(async () => { writeInputs(() => { INPUTS.push(...rows) }); notify() })
  return rows.map(r => live(r.iid))
}
const card = (r: any) => $(`[data-testid="inl-row-${r.iid}"]`)
const part = (r: any, k: string) => card(r)!.querySelector(`[data-testid="inl-${k}"]`) as HTMLElement | null
const tr = (r: any) => $(`#inBody tr[data-iid="${r.iid}"]`)
const allDates = async () => { if (!$('#inRangePop')) await click($('#inRangeBtn')); await click($('#inRangeAll')) }
const as = async (who: 'admin' | 'member') => act(async () => {
  if (who === 'admin') { setSession({ user: admin, role: 'admin' }); setMe(admin) } else { setSession({ user: member, role: 'main' }); setMe(member) }
  notify()
})
const mount = async (phone: boolean) => {
  asPhone(phone)
  host = document.createElement('div'); document.body.append(host); root = createRoot(host)
  await act(async () => { root.render(<><InputsPage /><InputEditor /></>) })
  await allDates()
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
  await act(async () => { root.unmount(); setInpEdit(null) })
  HOOKS.toast = realToast; (window as any).matchMedia = realMM
  host.remove(); _resetFloatWins(); INPUTS.splice(0, INPUTS.length, ...JSON.parse(seed))
})

describe('on a phone the list is the input card under a heading a day (D718, D723)', () => {
  it('no table is drawn; each day has ONE heading — the day, and how many inputs stand under it — in date order', async () => {
    await mount(true)
    const [a, b, c] = others()
    await file({ person: a, date: 'Oct 22' })
    await file({ person: b, date: 'Oct 20' })
    await file({ person: c, date: 'Oct 20', type: 'LL', allday: true })
    expect($('#intbl'), 'no table on a phone').toBeNull()
    const heads = $$('[data-testid="inl-day"]')
    expect(heads.map(h => h.querySelector('b')!.textContent)).toEqual(['Tue 20 Oct', 'Thu 22 Oct'])
    expect(heads.map(h => h.querySelector('i')!.textContent)).toEqual(['2 inputs', '1 input'])
  })
  it('the cards of a day stand under its heading, before the next heading', async () => {
    await mount(true)
    const [a, b] = others()
    const late = await file({ person: a, date: 'Oct 22' })
    const early = await file({ person: b, date: 'Oct 20' })
    const order = $$('[data-testid="inl-day"], [data-testid^="inl-row-"]').map(el => el.getAttribute('data-testid') === 'inl-day' ? el.querySelector('b')!.textContent : el.getAttribute('data-iid'))
    expect(order).toEqual(['Tue 20 Oct', early.iid, 'Thu 22 Oct', late.iid])
  })
  it('inside a day: an all-day input first, then by the hour it starts', async () => {
    await mount(true)
    const [a, b, c] = others()
    const noon = await file({ person: a, s: 720, e: 780 })
    const allday = await file({ person: b, type: 'LL', allday: true })
    const morning = await file({ person: c, s: 480, e: 540 })
    expect($$('[data-testid^="inl-row-"]').map(el => el.getAttribute('data-iid'))).toEqual([allday.iid, morning.iid, noon.iid])
  })
  it('an input of several days stands under its FIRST day, and its corner says the day it runs till', async () => {
    await mount(true)
    const r = await file({ type: 'LL', allday: true, date: 'Oct 20', endDate: 'Oct 23' })
    expect($$('[data-testid="inl-day"]').map(h => h.querySelector('b')!.textContent)).toEqual(['Tue 20 Oct'])
    expect(part(r, 'when')!.textContent).toBe('till 23 Oct')
  })
  it('a heading in another year than this one carries its year', async () => {
    await mount(true)
    await file({ date: 'Jan 5', yr: 2027 })
    expect($('[data-testid="inl-day"] b')!.textContent).toBe('Tue 5 Jan 2027')
  })
  it('a card carries no pencil, no cross, no OIL chip and no date of its own — the heading says the day', async () => {
    await mount(true)
    const r = await file({ type: 'Duty', date: 'Oct 17', allday: true, oil: { '2026-10-17': 1 } })
    expect(card(r)!.querySelector('[data-edit], [data-inx], [data-oilrev], [data-oilask], .rmx, .red')).toBeNull()
    expect(card(r)!.textContent).not.toMatch(/17 Oct/)
    expect($$('[data-edit], [data-inx], [data-save], [data-cancel]'), 'nowhere on the page').toHaveLength(0)
  })
  it('a tap on the card opens the input’s window — where it is changed or deleted', async () => {
    await mount(true)
    const r = await file()
    await click(card(r))
    expect(INPEDIT && INPEDIT.iid).toBe(r.iid)
    expect($('#inpEditDel'), 'Delete is in the window').toBeTruthy()
    await click($('#inpEditDel'))
    expect(live(r.iid)).toBeUndefined()
    expect(card(r)).toBeNull()
  })
  it('the card’s button opens it by keyboard: Enter, and Space', async () => {
    await mount(true)
    const r = await file()
    await key(part(r, 'open')!, 'Enter')
    expect(INPEDIT && INPEDIT.iid).toBe(r.iid)
    await act(async () => { setInpEdit(null); notify() })
    await key(part(r, 'open')!, ' ')
    expect(INPEDIT && INPEDIT.iid).toBe(r.iid)
  })
  it('the filters narrow the cards, and a day left with none loses its heading', async () => {
    await mount(true)
    const [a, b] = others()
    const mine = await file({ person: a, date: 'Oct 20', remarks: 'findme' })
    const other = await file({ person: b, date: 'Oct 22' })
    const box = $('#inFSearch') as HTMLInputElement
    await act(async () => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(box, 'findme'); box.dispatchEvent(new Event('input', { bubbles: true })) })
    expect(card(mine)).toBeTruthy(); expect(card(other)).toBeNull()
    expect($$('[data-testid="inl-day"]')).toHaveLength(1)
  })
  it('nothing to show says so, as the table did', async () => {
    await mount(true)
    expect($('#inEmpty')!.hidden).toBe(false)
    expect($$('[data-testid="inl-day"]')).toHaveLength(0)
  })
})

describe('the list’s card says what the opened day’s card says — one card, asked kind by kind (D723, D724)', () => {
  it('plain, his own: one line — who, the kind, the hours; no words row — and the same input CANCELLED has one, for its red CX tag (D767)', async () => {
    await mount(true)
    const r = await file({ type: 'Duty' })
    expect(part(r, 'who')!.textContent).toBe(cs(r.person))
    expect(part(r, 'kind')!.textContent).toBe('Duty')
    expect(part(r, 'when')!.textContent).toBe('10:00–11:00')
    expect(card(r)!.querySelector('.icard-words')).toBeNull()
    /* D767 (owner, 12 Oct 26) changed "one line" for a cancelled input: the top line reads as it did — only the kind's
       name, which it goes by, is struck (reading 2) — and a second line holds the tag, alone where no reason was typed
       (reading 4). The look itself: ui/inputcx.test.tsx. */
    const x = await file({ type: 'Duty', person: others()[1], by: others()[1], cx: true })
    expect(part(x, 'who')!.textContent).toBe(cs(x.person))
    expect(part(x, 'kind')!.textContent).toBe('Duty')
    expect(part(x, 'when')!.textContent).toBe('10:00–11:00')
    expect(card(x)!.querySelector('.icard-words')!.textContent).toBe('CX')
  })
  it('titled, with a remark: the kind on the top line, the title on its own row at the left, the remark after it', async () => {
    await mount(true)
    const r = await file({ type: 'Event', title: 'Sports day', remarks: 'bring boots' })
    expect(part(r, 'kind')!.textContent).toBe('Event')
    expect(card(r)!.querySelector('.icard-top')!.textContent).not.toContain('Sports day')
    expect(part(r, 'title')!.textContent).toBe('Sports day')
    expect(part(r, 'rmk')!.textContent).toBe('bring boots')
  })
  it('placed by someone else: "By Saber" — no "for", no day, no time; his own: nothing', async () => {
    await mount(true)
    const [a, b] = others()
    const forHim = await file({ person: a, by: admin })
    const own = await file({ person: b, by: b })
    expect(part(forHim, 'by')!.textContent).toBe(`By ${cs(admin)}`)
    expect(card(forHim)!.textContent).not.toMatch(/Placed|for |1 Oct|09:00/)
    expect(part(own, 'by')).toBeNull()
  })
  it('a shared input: ONE card, every name A to Z, never "+N", no pucks — and who filed it, even where he is one of them (D721, D724)', async () => {
    await mount(true)
    const [a, b] = others()
    const g = await shared([admin, b, a])
    expect($$('[data-testid^="inl-row-"]'), 'one card for the three').toHaveLength(1)
    const c = $$('[data-testid^="inl-row-"]')[0]
    expect(c.querySelector('[data-testid="inl-who"]')!.textContent).toBe(az([admin, a, b]).map(cs).join(', '))
    expect(c.textContent).not.toMatch(/\+\d/)
    expect(c.querySelector('.puck')).toBeNull()
    expect(c.querySelector('[data-testid="inl-by"]')!.textContent).toBe(`By ${cs(admin)}`)
    expect($('[data-testid="inl-day"] i')!.textContent, 'a shared input counts once').toBe('1 input')
    await click(c)
    expect(document.querySelector('[data-testid="win-inputedit"]')!.textContent, 'the tap opens the ENTRY').toContain(`${cs(g.first)} +2`)
  })
  it('OLD-SHAPE records tied by a group id (D759 reading 10): each is its own input — a card a man, his own name on it, each counted', async () => {
    await mount(true)
    const [a, b] = others()
    const rows = await oldGroup([admin, b, a])
    expect($$('[data-testid^="inl-row-"]'), 'a card for each of the three').toHaveLength(3)
    for (const r of rows) expect(part(r, 'who')!.textContent).toBe(cs(r.person))
    expect($('[data-testid="inl-day"] i')!.textContent, 'three inputs, counted as three').toBe('3 inputs')
  })
  it('an input for ALL AVAIL: its own name, and who filed it', async () => {
    await mount(true)
    const r = await file({ person: 'allavail', type: 'Event', title: 'Sports day', by: admin })
    expect(part(r, 'who')!.textContent).toBe('ALL AVAIL')
    expect(part(r, 'by')!.textContent).toBe(`By ${cs(admin)}`)
  })
  it('an absence wears the red square, a commitment the amber one', async () => {
    await mount(true)
    const [a, b] = others()
    const leave = await file({ person: a, type: 'LL', allday: true })
    const duty = await file({ person: b, type: 'Duty' })
    expect(card(leave)!.className).toContain(' red'); expect(card(duty)!.className).toContain(' amb')
  })
  it('a late input wears LATE; pressed, it says the cut-off it missed — and does not open the input', async () => {
    await mount(true)
    const r = await file({ date: 'Oct 21', mod: '2026-10-20' })
    const tag = part(r, 'late')
    expect(tag).toBeTruthy()
    await click(tag)
    expect(part(r, 'latenote')!.textContent).toMatch(/^after the cut-off, \w{3} \d{1,2} \w{3}$/)
    expect(INPEDIT, 'the tag is its own button').toBeNull()
  })
  it('an input on time wears none', async () => {
    await mount(true)
    const r = await file({ date: 'Oct 21', mod: '2026-09-01' })
    expect(part(r, 'late')).toBeNull()
  })
})

describe('on a desktop the table stays, without the pencil and the cross (D723)', () => {
  it('its columns and its sorting are there; no cards are drawn', async () => {
    await mount(false)
    await file()
    expect($('#intbl')).toBeTruthy()
    expect($$('#intbl thead th.insort').map(th => th.getAttribute('data-sort'))).toEqual(['name', 'start', 'end', 'type', 'remarks', 'mod'])
    expect($$('[data-testid^="inl-row-"]')).toHaveLength(0)
    expect($$('[data-testid="inl-day"]')).toHaveLength(0)
  })
  it('no row carries a pencil or a cross — an admin’s, a member’s own, or a shared one’s', async () => {
    await mount(false)
    const [a] = others()
    await file({ person: a })
    await file({ person: member, by: member })
    await shared([a, member])
    expect($$('#inBody tr')).toHaveLength(3)
    expect($$('#inBody [data-edit], #inBody [data-inx], #inBody [data-save], #inBody [data-cancel], #inBody .rmx'), 'admin').toHaveLength(0)
    await as('member')
    expect($$('#inBody [data-edit], #inBody [data-inx], #inBody .rmx'), 'member').toHaveLength(0)
  })
  it('the Name is a button that opens the input’s window; so is a click anywhere else on the row', async () => {
    await mount(false)
    const r = await file()
    const name = tr(r)!.querySelector('button[data-testid="in-open"]') as HTMLElement
    expect(name.textContent).toBe(cs(r.person))
    await click(name)
    expect(INPEDIT && INPEDIT.iid).toBe(r.iid)
    await act(async () => { setInpEdit(null); notify() })
    await click(tr(r)!.querySelector('td[data-label="Remarks"]'))
    expect(INPEDIT && INPEDIT.iid).toBe(r.iid)
  })
  it('another man’s row opens for a member too — read only, as on the day (D364)', async () => {
    await mount(false)
    const r = await file()
    await as('member')
    await click(tr(r)!.querySelector('button[data-testid="in-open"]'))
    expect(INPEDIT && INPEDIT.iid).toBe(r.iid)
    expect($('#inpEditSave'), 'nothing offered that he cannot use').toBeNull()
  })
  it('the OIL chips stay on the row, and a press on one answers OIL — it does not open the window', async () => {
    await mount(false)
    const answered = await file({ type: 'Duty', date: 'Oct 17', allday: true, oil: { '2026-10-17': 1 } })
    const open = await file({ person: others()[1], type: 'Duty', date: 'Oct 17', allday: true })
    expect(tr(answered)!.querySelector('[data-oilrev]')).toBeTruthy()
    expect(tr(open)!.querySelector('[data-oilask]')).toBeTruthy()
    await click(tr(open)!.querySelector('[data-oilask]'))
    expect($$('[data-testid="oilconf"]')).toHaveLength(1)
    expect(INPEDIT, 'the chip is its own control').toBeNull()
  })
  it('a shared input is one row, and opens as the entry', async () => {
    await mount(false)
    const [a, b] = others()
    const g = await shared([a, b, member])
    expect($$('#inBody tr')).toHaveLength(1)
    await click($('#inBody tr button[data-testid="in-open"]'))
    expect(document.querySelector('[data-testid="win-inputedit"]')!.textContent).toContain(`${cs(g.first)} +2`)
  })
})

describe('the list follows the screen’s width while the page is up', () => {
  it('a desktop table sorted by NAME, then narrowed to a phone: the cards are in DATE order all the same — and widened again, the table is back', async () => {
    await mount(false)
    const [a, b] = az(others()).slice(0, 2)
    const late = await file({ person: a, date: 'Oct 22' })
    const early = await file({ person: b, date: 'Oct 20' })
    await click($('#intbl thead th[data-sort="name"]'))
    expect($$('#inBody tr').map(tr => tr.getAttribute('data-iid')), 'by name: the later date first').toEqual([late.iid, early.iid])
    await turn(true)
    expect($('#intbl'), 'no table once it is a phone').toBeNull()
    const order = $$('[data-testid="inl-day"], [data-testid^="inl-row-"]').map(el => el.getAttribute('data-testid') === 'inl-day' ? el.querySelector('b')!.textContent : el.getAttribute('data-iid'))
    expect(order).toEqual(['Tue 20 Oct', early.iid, 'Thu 22 Oct', late.iid])
    await turn(false)
    expect($('#intbl')).toBeTruthy(); expect($$('[data-testid^="inl-row-"]')).toHaveLength(0)
  })
})

describe('a just-saved input the filters would hide still shows — on a phone, first, under its own day', () => {
  it('filed through the window while a search hides it: its card stands first, under its day’s heading', async () => {
    await mount(true)
    const [a] = others()
    await file({ person: a, date: 'Oct 20', remarks: 'findme' })
    const box = $('#inFSearch') as HTMLInputElement
    await act(async () => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(box, 'findme'); box.dispatchEvent(new Event('input', { bubbles: true })) })
    const hidden = await file({ person: others()[1], date: 'Oct 26', remarks: 'elsewhere' })
    expect(card(hidden), 'the search hides it').toBeNull()
    /* opened and saved through the window: the save reveals it (ui/inputedit.tsx revealInput) */
    await act(async () => { setInpEdit(hidden); notify() })
    await click($('#inpEditSave'))
    const order = $$('[data-testid="inl-day"], [data-testid^="inl-row-"]').map(el => el.getAttribute('data-testid') === 'inl-day' ? el.querySelector('b')!.textContent : el.getAttribute('data-iid'))
    expect(order[0]).toBe('Mon 26 Oct'); expect(order[1]).toBe(hidden.iid)
    expect(order.slice(2), 'then the days the search leaves').toEqual(['Tue 20 Oct', expect.any(String)])
  })
  /* SOL'S READ of the code (10 Oct 26): a just-saved input kept in view stood under a heading of its own, so a day that
     also held an input the filters show was drawn TWICE — "Tue 20 Oct · 1 input", and "Tue 20 Oct · 1 input" again.
     One heading a day: the day that holds the just-saved input comes first, whole, that input first inside it. */
  it('a just-saved input on a day the list already shows: ONE heading for that day, its count the two together, the saved one first — and that day first', async () => {
    await mount(true)
    const [a, b, c] = others()
    const earlier = await file({ person: a, date: 'Oct 19', remarks: 'findme early' })
    const shown = await file({ person: b, date: 'Oct 20', remarks: 'findme' })
    const box = $('#inFSearch') as HTMLInputElement
    await act(async () => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(box, 'findme'); box.dispatchEvent(new Event('input', { bubbles: true })) })
    const hidden = await file({ person: c, date: 'Oct 20', s: 900, e: 960, remarks: 'elsewhere' })
    expect(card(hidden), 'the search hides it').toBeNull()
    await act(async () => { setInpEdit(hidden); notify() })
    await click($('#inpEditSave'))
    const heads = $$('[data-testid="inl-day"]').map(h => [h.querySelector('b')!.textContent, h.querySelector('i')!.textContent])
    expect(heads).toEqual([['Tue 20 Oct', '2 inputs'], ['Mon 19 Oct', '1 input']])
    expect($$('[data-testid^="inl-row-"]').map(el => el.getAttribute('data-iid'))).toEqual([hidden.iid, shown.iid, earlier.iid])
  })
})

/* THE "OIL?" SIGN (owner D777, 12 Oct 26 — "Oil pictures looks good": the pictures of record are
   docs/mock/2026-10-12-oil-ask/). On an input's CARD — the List on a phone, here; the opened day, ui/inputsday.test.tsx —
   a small outlined "OIL?" tag on the top line, left of the hours, where nobody has answered its OIL question: a mark,
   not a button (a tap opens the input, where "Answer…" is). And the DESKTOP List's "OIL?" button shows for an input of
   SEVERAL people too. Shown to whoever may answer the question (the agent's reading, told to him): the same test the
   input's own window puts on "Answer…" — state/perms.ts mayEditInput. 17 Oct 26 is a Saturday. */
describe('the "OIL?" sign where nobody has answered an input’s OIL question (D777)', () => {
  const SAT = { type: 'Duty', date: 'Oct 17', allday: false, s: 540, e: 720 }
  const tag = (r: any) => card(r)!.querySelector('[data-testid="inl-oil"]') as HTMLElement | null

  it('a phone’s card of ONE person: the tag on the top line, left of the hours — a mark, not a button; a tap on it opens the input', async () => {
    await mount(true)
    const r = await file(SAT)
    const t = tag(r)!
    expect(t, 'the card wears it').toBeTruthy()
    expect(t.textContent).toBe('OIL?')
    expect(t.tagName, 'a mark, not a button').not.toBe('BUTTON')
    expect(t.title).toMatch(/17 Oct/)
    const corner = card(r)!.querySelector('.icard-corner')!
    expect([...corner.children].map(c => c.className), 'the corner: the tag, then the hours').toEqual(['oiltag', 'icard-hrs'])
    expect(part(r, 'open')!.getAttribute('aria-label'), 'and the card says so to a screen reader').toMatch(/OIL question not answered/)
    await click(t)
    expect(INPEDIT && INPEDIT.iid, 'the tap opens the input').toBe(r.iid)
    expect($$('[data-testid="oilconf"]'), 'not the question itself').toHaveLength(0)
  })

  it('with LATE beside it: LATE, then OIL?, then the hours', async () => {
    await mount(true)
    const r = await file({ ...SAT, mod: '2026-10-16' })
    const corner = card(r)!.querySelector('.icard-corner')!
    expect([...corner.children].map(c => c.className)).toEqual(['sd-late', 'oiltag', 'icard-hrs'])
  })

  it('an input of SEVERAL wears it too — on a phone’s card, and on the desktop row as the button that answers for everyone', async () => {
    await mount(true)
    const [a, b] = others()
    const g = await shared([a, b], SAT)
    const r = g.rows[0]
    expect(tag(r), 'the card of an input of several').toBeTruthy()
    await turn(false)
    const btn = tr(r)!.querySelector('[data-oilask]') as HTMLElement
    expect(btn, 'the desktop row of an input of several (it wore nothing before D777)').toBeTruthy()
    expect(btn.textContent).toBe('OIL?')
    expect(btn.className).toBe('roil ask')
    await click(btn)
    expect($$('[data-testid="oilconf"]'), 'it opens the question').toHaveLength(1)
    expect(INPEDIT, 'and not the input’s window').toBeNull()
    /* …headed for EVERYONE the one answer is written for — the words of the input's own window ("Ace +1"), never the
       one man the record happens to lead with (the second re-walk, RX2-2 in passing: it read "OIL — Tally, …") */
    expect($('[data-testid="oilconf"]')!.textContent, 'its heading').toContain(`${cs(az([a, b])[0])} +1`)
  })

  it('answered — a Yes or a No — the sign goes: no tag on the card, no button on the row of an input of several', async () => {
    await mount(true)
    const [a, b] = others()
    const yes = (await shared([a, b], { ...SAT, oil: { '2026-10-17': 1 } })).rows[0]
    const no = await file({ ...SAT, s: 780, e: 840, oil: { '2026-10-17': 0 } })
    expect(tag(yes)).toBeNull()
    expect(tag(no)).toBeNull()
    await turn(false)
    expect(tr(yes)!.querySelector('[data-oilask]')).toBeNull()
    expect(tr(yes)!.querySelector('[data-oilrev]'), 'an input of several still has no chip to change its answer here — its window does (D762)').toBeNull()
  })

  it('shown only to whoever may answer: a man IN it who did not file it sees none; nor does its filer once a scheduler has put someone in — the admin does (the walk’s A8)', async () => {
    await mount(true)
    const [a] = others()
    /* filed by the admin for the member and another man */
    const byAdmin = (await shared([member, a], SAT)).rows[0]
    /* filed by the member for himself; the admin then put another man in */
    const a8 = await file({ ...SAT, s: 780, e: 840, iid: 'a8', person: undefined, by: member,
      people: [{ p: member, by: member, at: T(1, 9, 0) }, { p: a, by: admin, at: T(2, 9, 0) }] })
    expect(tag(byAdmin), 'the admin may answer').toBeTruthy()
    expect(tag(a8), 'the admin may answer').toBeTruthy()
    await as('member')
    expect(card(byAdmin), 'he still sees the input').toBeTruthy()
    expect(tag(byAdmin), 'a man in it has no answer of his own to give (D762)').toBeNull()
    expect(tag(a8), 'its filer can no longer answer once someone else changed who is in it').toBeNull()
    await turn(false)
    expect(tr(a8)!.querySelector('[data-oilask]')).toBeNull()
    await as('admin')
    expect(tr(a8)!.querySelector('[data-oilask]'), 'so the admin’s List says it — the sign the walk found missing').toBeTruthy()
  })

  it('nothing where no question waits: a weekday, a kind that never asks (Personal — D778), a request taken off the programme', async () => {
    await mount(true)
    const weekday = await file({ ...SAT, date: 'Oct 20' })
    const personal = await file({ ...SAT, type: 'Personal', person: others()[1] })
    const off = await file({ ...SAT, person: others()[2], acc: 'r' })
    for (const r of [weekday, personal, off]) expect(tag(r), r.iid).toBeNull()
  })
})

/* ON A PHONE THE LIST'S TWO BUTTONS STAND IN THE TOP ROW (owner D907, D910, 15 Oct 26 — "Why don't u move these 2 buttons
   up and align them with the row above? And same height"; drawn by scripts/handpass/mock-inputs-toolbar.mjs, approved
   as drawn). Where the Calendar's arrows stand, beside the switch, the filter and the gear — one row of controls, not
   two; the desktop keeps them on their own row under the tabs. What they measure is the browser's to say
   (e2e/inputs-calendar.spec.ts, e2e/inputs-batch2.spec.ts); here: which row draws them, and the dates button's words. */
describe('D910 — on a phone the List’s "+ Input" and dates button stand in the top row', () => {
  const top = () => $('.inputs-top')!
  it('a phone: both are drawn in the row of the switch, the filter and the gear, and the row of their own is hidden', async () => {
    await mount(true)
    expect(top().querySelector('#inNew'), '"+ Input" in the top row').toBeTruthy()
    expect(top().querySelector('#inRangeBtn'), 'the dates button in the top row').toBeTruthy()
    expect(top().querySelector('#inListBtn') && top().querySelector('#inGear'), 'beside the switch and the gear').toBeTruthy()
    expect($('.inputs-listtools')!.hidden, 'no second row').toBe(true)
    expect($$('#inNew').length + $$('#inRangeBtn').length, 'each drawn once').toBe(2)
  })
  it('a phone: the dates pop-up opens from the button in the top row, and "All dates" still closes it', async () => {
    await mount(true)
    await click($('#inRangeBtn'))
    expect(top().querySelector('#inRangePop'), 'the pop-up hangs under the top row').toBeTruthy()
    await click($('#inRangeAll'))
    expect($('#inRangePop')).toBeNull()
    expect($('#inRangeBtn')!.textContent).toContain('All dates')
  })
  it('a desktop: they keep their own row under the tabs, as before (D910)', async () => {
    await mount(false)
    expect(top().querySelector('#inNew')).toBeNull()
    expect($('.inputs-listtools #inNew') && $('.inputs-listtools #inRangeBtn')).toBeTruthy()
    expect($('.inputs-listtools')!.hidden).toBe(false)
  })
  it('the screen narrowed to a phone while the List is up moves them into the top row; widened, back', async () => {
    await mount(false)
    await turn(true)
    expect(top().querySelector('#inNew')).toBeTruthy()
    await turn(false)
    expect(top().querySelector('#inNew')).toBeNull()
    expect($('.inputs-listtools #inNew')).toBeTruthy()
  })
  it('a "+ Input" pressed from the top row opens the input’s window, as from its old row', async () => {
    await mount(true)
    await click(top().querySelector('#inNew'))
    expect($('[data-testid="win-inputedit"]'), 'the window the calendar opens').toBeTruthy()
  })
})

/* THE NARROWEST PHONES (under 390 — an iPhone SE or mini at 375): the row runs out of room, the switch, the filter and the
   gear keep their size, so the dates button says the same dates in fewer letters (D910). */
describe('D910 — on the narrowest phones the dates button’s words are shorter, the dates the same', () => {
  const narrow = (tight: boolean) => {
    ;(window as any).matchMedia = (q: string) => ({ matches: /max-width:\s*820px/.test(q) || (tight && /max-width:\s*389px/.test(q)),
      addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} })
  }
  const open = async (tight: boolean) => {
    host = document.createElement('div'); document.body.append(host); root = createRoot(host)
    narrow(tight)
    await act(async () => { root.render(<><InputsPage /><InputEditor /></>) })
  }
  const pick = async (isos: string[]) => {
    if (!$('#inRangePop')) await click($('#inRangeBtn'))
    for (const iso of isos) {
      for (let i = 0; i < 24 && !$(`#inRangePop [data-iso="${iso}"]`); i++) {
        const at = $('#inRangePop [data-testid="inRangeCal"]')!.getAttribute('data-month')!
        await click($(`#inRangePop [data-testid="inRangeCal-${at < iso.slice(0, 7) ? 'next' : 'prev'}"]`))
      }
      await click($(`#inRangePop [data-iso="${iso}"]`))
    }
  }
  it('one month: "15–29 Oct", where a wider phone reads "15 Oct → 29 Oct"', async () => {
    await open(true)
    await pick(['2026-10-15', '2026-10-29'])
    expect($('#inRangeBtn')!.textContent!.trim()).toBe('📅 15–29 Oct')
    await act(async () => { root.unmount() }); host.remove()
    await open(false)
    await pick(['2026-10-15', '2026-10-29'])
    expect($('#inRangeBtn')!.textContent!.trim()).toBe('📅 15 Oct → 29 Oct')
  })
  it('across two months both are named: "28 Sep–12 Oct"', async () => {
    await open(true)
    await pick(['2026-09-28', '2026-10-12'])
    expect($('#inRangeBtn')!.textContent!.trim()).toBe('📅 28 Sep–12 Oct')
  })
  it('a date in another year keeps its year — never merged into the other date’s month', async () => {
    await open(true)
    await pick(['2026-12-28', '2027-01-04'])
    expect($('#inRangeBtn')!.textContent!.trim()).toBe('📅 28 Dec–4 Jan 2027')
  })
  it('"All dates" reads the same at every width', async () => {
    await open(true)
    if (!$('#inRangePop')) await click($('#inRangeBtn'))
    await click($('#inRangeAll'))
    expect($('#inRangeBtn')!.textContent!.trim()).toBe('📅 All dates')
  })
})
