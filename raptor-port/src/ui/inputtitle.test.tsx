// @vitest-environment jsdom
/* AN INPUT'S OWN TITLE — THE DOORS THAT WRITE ONE AND THE SCREENS THAT SHOW IT (`[INPUT-OWN-TITLE]`; owner D715, D716,
   D717 — 9 Oct 26; the plan docs/superpowers/plans/2026-10-09-input-own-title-plan.md §3.4, §3.5).

   His words: "select the type of input and it gives the user the option to change the name of the input … if event Is
   selected, event shows as the title which can be edited" (D715); "Kind kept in sight" (D717).

   The engine's pins are engine/inputtitle.test.ts. Here each door is pressed through the app's own controls: the
   window (new and edit), the List's form and its pencil editor, a shared input — and each screen that draws the name
   is read for the title and for the kind kept small beside it. */
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { InputsPage } from './InputsPage'
import { InputEditor, oilGate, draftOf } from './inputedit'
import { inputRows, csvText } from './export'
import { oilRequestName } from './oilmode'
import { dayEntries } from './InputsCal'
import { initStore, notify, setSession, undo, writeInputs } from '../state/store'
import { setCalMonth, setInpMode, setInpView, setPage } from '../state/view'
import { setMe } from '../state/auth'
import { me } from '../state/perms'
import { INPUTS, INPUT_TYPES, titledKind } from '../engine/inputs'
import { PEOPLE } from '../engine/people'
import { HOOKS, storeBackend } from '../engine/hooks'
import { ELOG } from '../engine/editlog'
import { initStore as lwInitStore, setRole as lwSetRole } from '../leavewar/state/store'
import { memoryBackend } from '../leavewar/state/storage'
import { _resetFloatWins } from './FloatWindow'
import { setInpEdit } from './pops'
;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

let host: HTMLDivElement, root: Root
const seed = JSON.stringify(INPUTS)
const said: string[] = []
const realToast = HOOKS.toast
const $ = (sel: string) => document.querySelector(sel) as HTMLElement | null
const win = () => $('[data-testid="win-inputedit"]')
const admin = 'stiff', member = 'bane'
const live = (iid: string) => INPUTS.find((r: any) => r.iid === iid) as any
const click = async (el: Element | null) => { expect(el, 'click target').toBeTruthy(); await act(async () => { (el as HTMLElement).click() }) }
const type = async (sel: string, v: string) => {
  const el = $(sel) as HTMLInputElement
  expect(el, sel).toBeTruthy()
  await act(async () => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(el, v); el.dispatchEvent(new Event('input', { bubbles: true })) })
}
const choose = async (sel: string, v: string) => {
  const el = $(sel) as HTMLSelectElement
  expect(el, sel).toBeTruthy()
  await act(async () => { el.value = v; el.dispatchEvent(new Event('change', { bubbles: true })) })
}
const box = () => $('#inpEditTitle') as HTMLInputElement | null
/* Tue 13 Oct 2026 — a working day, so no OIL question */
const openNew = async (over: any = {}) => act(async () => {
  setInpEdit({ _new: true, _calendar: true, _ctx: 'i', person: me(), type: 'Meeting', date: 'Oct 13', allday: false, s: 600, e: 660, ...over }); notify()
})
const openOn = async (r: any) => act(async () => { setInpEdit(live(r.iid)); notify() })
let n = 0
const filed = async (over: any = {}) => {
  const row = { iid: 'tt' + (++n), person: admin, by: admin, at: '2026-09-01T08:00:00.000Z', type: 'Event', date: 'Oct 13', yr: 2026,
    allday: false, s: 600, e: 660, remarks: '', mod: '2026-09-01', ...over }
  let ok = false
  await act(async () => { ok = writeInputs(() => { INPUTS.push(row) }); notify() })
  expect(ok, 'the fixture itself is a legal record').toBe(true)
  return live(row.iid)
}
/* the record a save just added: the one that was not there when the test began (the demo's own records are) */
let had = new Set<string>()
const newest = () => INPUTS.find((r: any) => !had.has(String(r.iid))) as any

beforeEach(async () => {
  INPUTS.splice(0, INPUTS.length, ...JSON.parse(seed))
  const mem = new Map<string, string>()
  storeBackend.impl = { getItem: k => mem.get(k) ?? null, setItem: (k, v) => mem.set(k, v), keys: () => [...mem.keys()] }
  initStore()
  setSession({ user: admin, role: 'admin' }); setMe(admin)
  lwInitStore(memoryBackend()); lwSetRole('admin')
  setPage('inputs'); setInpMode('member'); setInpView('cal'); setCalMonth({ y: 2026, m: 10 })
  said.length = 0; HOOKS.toast = ((m: any) => { said.push(String(m)) }) as any
  host = document.createElement('div'); document.body.append(host); root = createRoot(host)
  await act(async () => { root.render(<><InputsPage /><InputEditor /></>) })
  await act(async () => { setCalMonth({ y: 2026, m: 10 }); notify() })
  had = new Set(INPUTS.map((r: any) => String(r.iid)))
})
afterEach(async () => {
  await act(async () => { root.unmount(); setInpEdit(null) })
  HOOKS.toast = realToast
  host.remove(); _resetFloatWins()
})

describe('the window — a Title box under Type (D715)', () => {
  it('is drawn for every kind that takes a title and for no other', async () => {
    await openNew()
    for (const t of INPUT_TYPES.filter((x: string) => x !== 'SANS Availability')) {
      await choose('#inpEditType', t)
      expect(!!box(), t).toBe(titledKind(t))
    }
  })

  it('sits straight under Type and above the dates, with its own label', async () => {
    await openNew({ type: 'Event' })
    const rows = [...win()!.querySelectorAll('.inped-f')]
    const iType = rows.findIndex(r => r.querySelector('#inpEditType')), iTitle = rows.findIndex(r => r.querySelector('#inpEditTitle'))
    expect(iTitle).toBe(iType + 1)
    expect(rows[iTitle].querySelector('.inped-k')!.textContent).toBe('Title')
    expect(box()!.getAttribute('aria-label')).toBe('Title')
    expect(box()!.maxLength).toBe(40)
  })

  it('choosing the kind fills it in with the kind’s own name — "if event is selected, event shows as the title"', async () => {
    await openNew({ type: 'Meeting' })
    expect(box()!.value).toBe('Meeting')
    await choose('#inpEditType', 'Event')
    expect(box()!.value).toBe('Event')
    await choose('#inpEditType', 'Fly with')
    expect(box()!.value).toBe('Fly with')
  })

  it('a typed title is kept when the kind changes to another that takes one, and dropped for one that does not', async () => {
    await openNew({ type: 'Event' })
    await type('#inpEditTitle', 'Sports day')
    await choose('#inpEditType', 'Duty')
    expect(box()!.value).toBe('Sports day')
    await choose('#inpEditType', 'LL')
    expect(box()).toBeNull()
    await choose('#inpEditType', 'Event')
    expect(box()!.value, 'back on a titled kind: the kind’s name, not a title a leave never had').toBe('Event')
  })

  it('saved untouched, the record carries NO title — it is the record it always was', async () => {
    await openNew({ type: 'Event' })
    await click($('#inpEditSave'))
    expect(win()).toBeNull()
    const r = newest()
    expect(r.type).toBe('Event')
    expect('title' in r).toBe(false)
  })

  it('a typed title is saved, trimmed; Remarks is left alone', async () => {
    await openNew({ type: 'Event' })
    await type('#inpEditTitle', '  Sports   day ')
    await type('#inpEditRmk', 'bring boots')
    await click($('#inpEditSave'))
    const r = newest()
    expect(r.title).toBe('Sports day')
    expect(r.remarks).toBe('bring boots')
    expect(r.type).toBe('Event')
  })

  it('a title typed back to the kind’s own name, or emptied, stores nothing', async () => {
    const r = await filed({ title: 'Sports day' })
    await openOn(r)
    expect(box()!.value).toBe('Sports day')
    await type('#inpEditTitle', 'event')
    await click($('#inpEditSave'))
    expect('title' in live(r.iid)).toBe(false)
    await openOn(r)
    expect(box()!.value).toBe('Event')
    await type('#inpEditTitle', 'Open house')
    await click($('#inpEditSave'))
    expect(live(r.iid).title).toBe('Open house')
    await openOn(r)
    await type('#inpEditTitle', '   ')
    await click($('#inpEditSave'))
    expect('title' in live(r.iid)).toBe(false)
  })

  it('an edit of the title alone IS a change: saved, one history line, and Undo takes it back', async () => {
    const r = await filed()
    const log = ELOG.rows.length
    await openOn(r)
    await type('#inpEditTitle', 'Sports day')
    await click($('#inpEditSave'))
    expect(win(), 'saved: the window has closed').toBeNull()
    expect(live(r.iid).title).toBe('Sports day')
    expect(ELOG.rows.length).toBeGreaterThan(log)
    await act(async () => { undo(); notify() })
    expect('title' in live(r.iid)).toBe(false)
  })

  it('a kind changed to one that takes no title drops the stored title', async () => {
    const r = await filed({ title: 'Sports day' })
    await openOn(r)
    await choose('#inpEditType', 'LL')
    await click($('#inpEditSave'))
    const now = live(r.iid) || INPUTS.find((x: any) => x.person === admin && x.type === 'LL' && x.date === 'Oct 13')
    expect(now, 'the retyped record').toBeTruthy()
    expect('title' in now).toBe(false)
  })

  it('an emptied box stays empty for him to type in — it does not snap back to the kind’s name — and shows the kind as its hint', async () => {
    await openNew({ type: 'Event' })
    await type('#inpEditTitle', '')
    expect(box()!.value).toBe('')
    expect(box()!.placeholder).toBe('Event')
    await choose('#inpEditType', 'Duty')
    expect(box()!.value).toBe('')
    expect(box()!.placeholder).toBe('Duty')
  })

  it('"Other" takes the same box; its remarks stay remarks (D716 (3))', async () => {
    await openNew({ type: 'Other' })
    expect(box()!.value).toBe('Other')
    await type('#inpEditTitle', 'Dentist run')
    await type('#inpEditRmk', 'back by 1400')
    await click($('#inpEditSave'))
    const r = newest()
    expect([r.type, r.title, r.remarks]).toEqual(['Other', 'Dentist run', 'back by 1400'])
  })

  it('another member’s titled input, opened read only: the title is shown, and nothing in the window can be typed in or saved', async () => {
    const other = Object.keys(PEOPLE).find(id => !PEOPLE[id].special && !PEOPLE[id].archived && !PEOPLE[id].deleted && id !== admin && id !== member)!
    const r = await filed({ person: other, by: other, title: 'Sports day' })
    await act(async () => { setSession({ user: member, role: 'main' }); setMe(member); notify() })
    await openOn(r)
    /* the read-only window keeps its fields and makes the whole body inert (D364: drawn as values, nothing to press) */
    expect(box()!.value).toBe('Sports day')
    expect(box()!.closest('[inert]'), 'inside the inert body').toBeTruthy()
    expect($('#inpEditSave')).toBeNull()
  })

  it('a title is user text: markup in it is printed as text everywhere the window draws it', async () => {
    const r = await filed({ title: '<b>x</b>"' })
    await openOn(r)
    expect(box()!.value).toBe('<b>x</b>"')
    expect(win()!.querySelector('b')).toBeNull()
  })
})

describe('the List — its form, its rows, its pencil editor, its search', () => {
  const $$ = (sel: string) => [...document.querySelectorAll(sel)] as HTMLElement[]
  const toList = async () => {
    await act(async () => { setInpView('table'); notify() })
    if (!$('#inRangePop')) await click($('#inRangeBtn'))
    await click($('#inRangeAll'))
  }
  const rowOf = (r: any) => $$('#inBody tr').find(tr => tr.querySelector(`[data-edit="${INPUTS.indexOf(r)}"],[data-save="${INPUTS.indexOf(r)}"]`))!
  const pickDay = async () => { await click($('#inCal [data-cal]')); await click($('#inCal [data-cal]')) }

  it('the form: a Title box beside Type for a titled kind, filled from the kind; none for leave', async () => {
    await toList()
    await choose('#inType', 'Event')
    expect(($('#inTitle') as HTMLInputElement).value).toBe('Event')
    await choose('#inType', 'Duty')
    expect(($('#inTitle') as HTMLInputElement).value).toBe('Duty')
    await choose('#inType', 'LL')
    expect($('#inTitle')).toBeNull()
  })

  it('the form: a typed title is saved with the input; an untouched box saves none; the box is cleared for the next one', async () => {
    await toList()
    await choose('#inType', 'Meeting')
    await pickDay()
    await type('#inTitle', 'Open house')
    await click($('#inAdd'))
    const a = newest()
    expect([a.type, a.title]).toEqual(['Meeting', 'Open house'])
    expect(($('#inTitle') as HTMLInputElement).value, 'the box is back to the kind’s name').toBe('Meeting')
    had.add(String(a.iid))
    await choose('#inType', 'Training')
    await click($('#inAdd'))
    const b = newest()
    expect(b.type).toBe('Training')
    expect('title' in b).toBe(false)
  })

  it('a row reads by its title with its kind kept beside it; an untitled row looks as it always did', async () => {
    const t = await filed({ title: 'Sports day' }), u = await filed({ type: 'Duty', date: 'Oct 14' })
    await toList()
    const cell = rowOf(t).querySelector('[data-label="Type"]')!
    expect(cell.querySelector('[data-testid="in-title"]')!.textContent).toBe('Sports day')
    expect(cell.querySelector('.intag')!.textContent).toBe('Event')
    const plain = rowOf(u).querySelector('[data-label="Type"]')!
    expect(plain.querySelector('[data-testid="in-title"]')).toBeNull()
    expect(plain.textContent).toBe('Duty')
  })

  it('the pencil editor: the title is edited in the row, and saved', async () => {
    const t = await filed({ title: 'Sports day' })
    await toList()
    await click(rowOf(t).querySelector('[data-edit]'))
    const ed = $('#inBody tr.ined')!
    const tb = ed.querySelector('input[data-ed="title"]') as HTMLInputElement
    expect(tb.value).toBe('Sports day')
    await act(async () => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(tb, 'Open house'); tb.dispatchEvent(new Event('input', { bubbles: true })) })
    await click(ed.querySelector('[data-save]'))
    expect(live(t.iid).title).toBe('Open house')
  })

  it('the pencil editor: retyped to a leave, the Title box goes and the saved record keeps no title', async () => {
    const t = await filed({ title: 'Sports day' })
    await toList()
    await click(rowOf(t).querySelector('[data-edit]'))
    const ed = $('#inBody tr.ined')!
    const sel = ed.querySelector('select[data-ed="type"]') as HTMLSelectElement
    await act(async () => { sel.value = 'Duty'; sel.dispatchEvent(new Event('change', { bubbles: true })) })
    expect((ed.querySelector('input[data-ed="title"]') as HTMLInputElement).value, 'kept across titled kinds').toBe('Sports day')
    await act(async () => { sel.value = 'Personal'; sel.dispatchEvent(new Event('change', { bubbles: true })) })
    expect(ed.querySelector('input[data-ed="title"]')).toBeTruthy()
  })

  it('the search finds an input by its title', async () => {
    const t = await filed({ title: 'Regatta', remarks: '' })
    await toList()
    await type('#inFSearch', 'regat')
    const shown = $$('#inBody tr').filter(tr => tr.querySelector('[data-edit]'))
    expect(shown.length).toBe(1)
    expect(shown[0]).toBe(rowOf(t))
  })
})

describe('the month and the opened day — the title, and the kind kept in sight (D717)', () => {
  const openDay = async (iso: string) => {
    const cell = $(`#inpCal [data-icday="${iso}"]`)
    expect(cell, 'the day on the month').toBeTruthy()
    await act(async () => { cell!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })) })
  }
  it('the month’s bar is named by the title; its tip says the title AND the kind', async () => {
    const t = await filed({ title: 'Sports day' })
    const bar = $(`#inpCal .ib-bar[data-iid="${t.iid}"]`)!
    expect(bar.textContent).toContain('Sports day')
    expect(bar.textContent).not.toContain('Event')
    expect(bar.getAttribute('title')!.split(String.fromCharCode(10))[0]).toMatch(/· Sports day · Event · /)
  })
  it('an untitled input’s bar and tip are as they always were', async () => {
    const u = await filed()
    const bar = $(`#inpCal .ib-bar[data-iid="${u.iid}"]`)!
    expect(bar.getAttribute('title')!.split(String.fromCharCode(10))[0]).toMatch(/· Event · 13 Oct/)
    expect(bar.getAttribute('title')!.split(String.fromCharCode(10))[0]).not.toMatch(/Event · Event/)
  })
  it('the day’s card: the title as its name, the kind small on its small-print line, before the remark and the placed-by print', async () => {
    const t = await filed({ title: 'Sports day', remarks: 'bring boots' })
    await openDay('2026-10-13')
    const card = $(`[data-testid="idy-row-${t.iid}"]`)!
    expect(card.querySelector('.idy-kind')!.textContent).toBe('Sports day')
    const foot = card.querySelector('.sd-foot')!
    const tag = foot.querySelector('[data-testid="idy-kindtag"]')!
    expect(tag.textContent).toBe('Event')
    expect(foot.firstElementChild).toBe(tag)
    expect(foot.querySelector('.sd-rmk')!.textContent).toBe('bring boots')
    expect(card.querySelector('[data-testid="idy-open"]')!.getAttribute('aria-label')).toMatch(/Sports day, Event,/)
  })
  it('an untitled input’s card carries no kind label — it looks as it does today', async () => {
    const u = await filed({ remarks: 'bring boots' })
    await openDay('2026-10-13')
    const card = $(`[data-testid="idy-row-${u.iid}"]`)!
    expect(card.querySelector('.idy-kind')!.textContent).toBe('Event')
    expect(card.querySelector('[data-testid="idy-kindtag"]')).toBeNull()
  })
  it('an "Other" with a remark and no title: named Other, its remark said under the line (D716 (3))', async () => {
    const o = await filed({ type: 'Other', remarks: 'dentist run' })
    await openDay('2026-10-13')
    const card = $(`[data-testid="idy-row-${o.iid}"]`)!
    expect(card.querySelector('.idy-kind')!.textContent).toBe('Other')
    expect(card.querySelector('.sd-rmk')!.textContent).toBe('dentist run')
  })
})

describe('the other places that name an input (both reads of the plan)', () => {
  it('the OIL question names it by its title — "OIL — Saber, Sports day" — and asks exactly what it asked before', async () => {
    /* Sat 17 Oct 2026: a weekend, so an Event asks */
    const plain = oilGate({ ...draftOf({ person: admin, type: 'Event', date: 'Oct 17', yr: 2026, allday: false, s: 600, e: 900, remarks: '' }) }, null) as any
    const titled = oilGate({ ...draftOf({ person: admin, type: 'Event', title: 'Sports day', date: 'Oct 17', yr: 2026, allday: false, s: 600, e: 900, remarks: '' }) }, null) as any
    expect(plain.kind).toBe('ask'); expect(titled.kind).toBe('ask')
    expect(plain.typeLabel).toBe('Event')
    expect(titled.typeLabel).toBe('Sports day')
    expect(titled.plan).toEqual(plain.plan)
  })
  it('a title cannot dodge an OIL rule, nor earn one: an Event titled "Personal" is still asked; a Personal titled "Duty" is still not', async () => {
    const d = (type: string, title: string) => draftOf({ person: admin, type, title, date: 'Oct 17', yr: 2026, allday: false, s: 600, e: 900, remarks: '' })
    expect((oilGate(d('Event', 'Personal'), null) as any).kind).toBe('ask')
    expect((oilGate(d('Personal', 'Duty'), null) as any).kind).toBe('none')
    expect((oilGate(d('Duty', 'Personal'), null) as any).plan).toEqual((oilGate(d('Duty', ''), null) as any).plan)
  })
  it('the OIL history calls a titled request by its title; an untitled one keeps the kind’s long name', async () => {
    const t = await filed({ title: 'Sports day' }), u = await filed({ date: 'Oct 14' })
    expect(oilRequestName('i:' + t.iid)).toBe('Sports day')
    expect(oilRequestName('i:' + u.iid)).toBe('event')
  })
  it('the Inputs export keeps Type and adds Title — the title, or the kind where it has none; a formula-like title is neutralised', async () => {
    const t = await filed({ title: 'Sports day' }), u = await filed({ date: 'Oct 14' }), f = await filed({ date: 'Oct 15', title: '=SUM(A1)' })
    const rows = inputRows([t, u, f])
    expect(rows[0]).toEqual(['Name', 'From', 'To', 'Start', 'End', 'Type', 'Title', 'Remarks'])
    expect([rows[1][5], rows[1][6]]).toEqual(['Event', 'Sports day'])
    expect([rows[2][5], rows[2][6]]).toEqual(['Event', 'Event'])
    const csv = csvText(rows)
    expect(csv).toContain('Sports day')
    expect(csv, 'never a live formula').not.toMatch(/(^|,)=SUM/m)
  })
  it('the opened day finds an input by its title, as the month’s bar does', async () => {
    const t = await filed({ title: 'Regatta', remarks: '' })
    const hit = dayEntries('2026-10-13', { fPerson: 'all', fType: 'all', fSearch: 'regat' })
    expect(hit.inputs.map((r: any) => r.iid)).toEqual([t.iid])
  })
})

describe('a shared input and the List’s own OIL question', () => {
  it('a shared input’s title is typed once, in its window, and reaches every man’s record; typed back, every record loses it', async () => {
    const [x, y] = Object.keys(PEOPLE).filter(id => !PEOPLE[id].special && !PEOPLE[id].archived && !PEOPLE[id].deleted && !PEOPLE[id].san && !PEOPLE[id].pers && id !== admin && id !== member)
    const a = await filed({ person: x, grp: 'gT1', grpBy: admin }), b = await filed({ person: y, grp: 'gT1', grpBy: admin })
    await openOn(a)
    expect(box(), 'the shared window carries the Title box').toBeTruthy()
    await type('#inpEditTitle', 'Team day')
    await click($('#inpEditSave'))
    expect(win(), 'saved: the window has closed').toBeNull()
    expect([live(a.iid).title, live(b.iid).title]).toEqual(['Team day', 'Team day'])
    await openOn(a)
    expect(box()!.value).toBe('Team day')
    await type('#inpEditTitle', 'Event')
    await click($('#inpEditSave'))
    expect(['title' in live(a.iid), 'title' in live(b.iid)]).toEqual([false, false])
  })

  it('the List’s Add form on a weekend: the OIL question is headed by the typed title', async () => {
    await act(async () => { setInpView('table'); notify() })
    if (!$('#inRangePop')) await click($('#inRangeBtn'))
    await click($('#inRangeAll'))
    await choose('#inType', 'Event')
    /* a Saturday of the month the form's own calendar is showing */
    const sat = [...document.querySelectorAll('#inCal [data-cal]')].find(c => new Date(c.getAttribute('data-cal') + 'T12:00:00').getDay() === 6 && !(c as HTMLButtonElement).disabled) as HTMLElement
    expect(sat, 'Saturday on the form’s calendar').toBeTruthy()
    await click(sat); await click(sat)
    await type('#inTitle', 'Weekend exercise')
    await click($('#inAdd'))
    const head = document.querySelector('[data-testid="oilconf"] .airpop-head')
    expect(head, 'the OIL question is up').toBeTruthy()
    expect(head!.textContent).toContain('Weekend exercise')
    expect(head!.textContent).not.toContain('Event')
  })
})

