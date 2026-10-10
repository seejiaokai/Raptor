// @vitest-environment jsdom
/* THE DESIGN VET'S CHANGES TO THE INPUTS CALENDAR AND LIST, AS DRAWN FOR HIM AND APPROVED (owner D726 — "I don't like too
   wordy interface"; D727 — "A."; D728 — "1 now, 2 later"; D729 — "Yes to all"; 10 Oct 26. The plan
   docs/superpowers/plans/2026-10-10-inputs-vet-plan.md; the drawings docs/mock/inputs-vet.html and card-questions.html).

   What is pinned HERE is what a screen draws that no other file already pins:
     · D728  the card of the opened day and of the phone's list leaves the automatic "till <date>" out of its remark —
             and ONLY the card: the desktop list's Remarks column, the input's window and the record keep it whole.
     · D727  the desktop list keeps the kind's pill, and names everyone (the names themselves: ui/sharedline.test.tsx).
     · V1    the row the list has just been shown is LIT — one added through "+ Input", one changed, one put back by Undo.
     · V5    the table's last column "Changed"; the empty list's short line; no words over the three filter boxes.
   The rest have their own files: the form's removal and its doors (ui/inputs.test.tsx, windowdoors.test.tsx, and every
   file that drove the form), "By Saber" on the desktop row (placedshown.test.tsx, sharedline.test.tsx), the window's
   instructions (groupeditor.test.tsx, inputs-calendar-flow.test.tsx), the month's bars (inputscal-model.test.ts,
   inputsmonth.test.tsx), the settings' and the fold's words (inputssettings.test.tsx, inputsmonth.test.tsx), and the
   pure rule of "till said once" (inputcard-model.test.ts). */
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { InputsPage, rangeWords } from './InputsPage'
import { InputEditor } from './inputedit'
import { initStore, notify, setSession, writeInputs } from '../state/store'
import { installGlobalUndo } from '../state/undo-wire'
import { _resetTimeline } from '../undo/timeline'
import { globalUndo } from '../undo'
import { setCalMonth, setInpMode, setInpView, setPage } from '../state/view'
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
const cs = (id: any) => PEOPLE[id].cs as string
const admin = 'stiff'
const others = () => Object.keys(PEOPLE).filter(id => !PEOPLE[id].archived && !PEOPLE[id].deleted && !PEOPLE[id].special && !PEOPLE[id].san && !PEOPLE[id].pers && id !== admin)
const live = (iid: string) => INPUTS.find((r: any) => r.iid === iid) as any
const click = async (el: Element | null) => { expect(el, 'click target').toBeTruthy(); await act(async () => { (el as HTMLElement).click() }) }
const type = async (sel: string, v: string) => {
  const el = $(sel) as HTMLInputElement
  expect(el, sel).toBeTruthy()
  await act(async () => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(el, v); el.dispatchEvent(new Event('input', { bubbles: true })) })
}
/* the stylesheet's own width for "a phone" — the list asks it as the stylesheet does (ui/usemedia.ts) */
const asPhone = (on: boolean) => {
  ;(window as any).matchMedia = (q: string) => ({ matches: on && /max-width:\s*820px/.test(q), addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} })
}
const T = (d: number, h: number, m: number) => new Date(2026, 9, d, h, m).getTime()
let n = 0
/* nothing but what a test files: the demo's own inputs are taken away */
const file = async (over: any = {}) => {
  const row = { iid: 'iv' + (++n), person: others()[0], type: 'Meeting', date: 'Oct 20', yr: 2026, allday: false, s: 600, e: 660, remarks: '', mod: '2026-09-01', by: others()[0], at: T(1, 9, 0), ...over }
  await act(async () => { writeInputs(() => { INPUTS.push(row) }); notify() })
  return live(row.iid)
}
const shared = async (people: string[], over: any = {}) => {
  const grp = 'gV' + (++n)
  const rows = people.map((p, i) => ({ iid: `${grp}-${i}`, person: p, type: 'Meeting', date: 'Oct 20', yr: 2026, allday: false, s: 600, e: 660,
    remarks: '', mod: '2026-09-01', grp, grpBy: admin, by: admin, at: T(1, 9, 0), ...over }))
  await act(async () => { writeInputs(() => { INPUTS.push(...rows) }); notify() })
  return { grp, rows: rows.map(r => live(r.iid)) }
}
const tr = (r: any) => $(`#inBody tr[data-iid="${r.iid}"]`)
/* a shared input's ONE row — it stands under its first record, A to Z, whichever that is */
const trOf = (rows: any[]) => $$('#inBody tr[data-iid]').find(x => rows.some(r => r.iid === x.getAttribute('data-iid')))!
const allDates = async () => { if (!$('#inRangePop')) await click($('#inRangeBtn')); await click($('#inRangeAll')) }
const mount = async (phone: boolean, view: 'table' | 'cal' = 'table') => {
  asPhone(phone)
  setInpView(view); setCalMonth({ y: 2026, m: 10 })
  host = document.createElement('div'); document.body.append(host); root = createRoot(host)
  await act(async () => { root.render(<><InputsPage /><InputEditor /></>) })
  if (view === 'table') await allDates()
}
const openDay = async (iso: string) => act(async () => { $(`[data-icday="${iso}"]`)!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })) })

beforeEach(async () => {
  INPUTS.splice(0, INPUTS.length)
  const mem = new Map<string, string>()
  storeBackend.impl = { getItem: k => mem.get(k) ?? null, setItem: (k, v) => mem.set(k, v), keys: () => [...mem.keys()] }
  initStore(); INPUTS.splice(0, INPUTS.length)
  setSession({ user: admin, role: 'admin' }); setMe(admin); lwInitStore(memoryBackend()); lwSetRole('admin')
  setPage('inputs'); setInpMode('member'); setInpView('table')
  /* the app's own Undo, wired as the app wires it — it is what asks a screen to show what it put back */
  _resetTimeline(); installGlobalUndo()
  HOOKS.toast = (() => {}) as any
})
afterEach(async () => {
  await act(async () => { root.unmount(); setInpEdit(null) })
  HOOKS.toast = realToast; (window as any).matchMedia = realMM
  host.remove(); _resetFloatWins(); INPUTS.splice(0, INPUTS.length, ...JSON.parse(seed))
})

describe('"till <date>" is said ONCE on an input’s card — the corner says it (D728)', () => {
  const SEVERAL = { type: 'ATT C', allday: true, date: 'Oct 20', endDate: 'Oct 23', remarks: 'Medically down till 23 Oct' }
  it('the phone list’s card: the corner says "till 23 Oct", and the remark is "Medically down"', async () => {
    await mount(true)
    const r = await file(SEVERAL)
    const card = $(`[data-testid="inl-row-${r.iid}"]`)!
    expect(card.querySelector('[data-testid="inl-when"]')!.textContent).toBe('till 23 Oct')
    expect(card.querySelector('[data-testid="inl-rmk"]')!.textContent).toBe('Medically down')
    expect(card.textContent!.match(/till 23 Oct/g), 'said once on the whole card').toHaveLength(1)
  })
  it('a remark that was only the automatic words: the card has no words row at all — one line', async () => {
    await mount(true)
    const r = await file({ ...SEVERAL, type: 'LL', remarks: 'till 23 Oct' })
    const card = $(`[data-testid="inl-row-${r.iid}"]`)!
    expect(card.querySelector('[data-testid="inl-rmk"]')).toBeNull()
    expect(card.querySelector('.icard-words'), 'no second row').toBeNull()
    expect(card.querySelector('[data-testid="inl-when"]')!.textContent).toBe('till 23 Oct')
  })
  it('a typed remark is untouched, and a title keeps its place', async () => {
    await mount(true)
    const r = await file({ type: 'Duty', allday: true, date: 'Oct 20', endDate: 'Oct 22', title: 'Range week', remarks: 'bring ID card till 22 Oct' })
    const card = $(`[data-testid="inl-row-${r.iid}"]`)!
    expect(card.querySelector('[data-testid="inl-title"]')!.textContent).toBe('Range week')
    expect(card.querySelector('[data-testid="inl-rmk"]')!.textContent).toBe('bring ID card')
  })
  it('the opened day’s card says it the same way — on a day in the middle of the input too', async () => {
    await mount(false, 'cal')
    const r = await file(SEVERAL)
    for (const iso of ['2026-10-20', '2026-10-21']) {
      await openDay(iso)
      const card = $(`[data-testid="idy-row-${r.iid}"]`)!
      expect(card, iso).toBeTruthy()
      expect(card.querySelector('[data-testid="idy-when"]')!.textContent, iso).toBe('till 23 Oct')
      expect(card.querySelector('[data-testid="idy-rmk"]')!.textContent, iso).toBe('Medically down')
    }
  })
  it('…and on its LAST day, where the corner says "All day", the remark is whole — nothing else says the date there', async () => {
    await mount(false, 'cal')
    const r = await file(SEVERAL)
    await openDay('2026-10-23')
    const card = $(`[data-testid="idy-row-${r.iid}"]`)!
    expect(card.querySelector('[data-testid="idy-when"]')!.textContent).toBe('All day')
    expect(card.querySelector('[data-testid="idy-rmk"]')!.textContent).toBe('Medically down till 23 Oct')
  })
  it('ONLY the card: the desktop list’s Remarks column, the input’s window and the record itself keep the whole remark', async () => {
    await mount(false)
    const r = await file(SEVERAL)
    expect(tr(r)!.querySelector('[data-label="Remarks"]')!.textContent).toContain('Medically down till 23 Oct')
    await click(tr(r)!.querySelector('[data-testid="in-open"]'))
    expect(($('#inpEditRmk') as HTMLInputElement).value).toBe('Medically down till 23 Oct')
    expect(live(r.iid).remarks, 'the record is not changed by being shown').toBe('Medically down till 23 Oct')
  })
})

/* A SHARED INPUT SHOWN ALTHOUGH A FILTER HIDES IT IS STILL THE WHOLE ENTRY (Sol's read of the code, 10 Oct 26 — finding 1;
   older than this build). An opened day lists the input just saved even where the search lets nothing through — but it
   listed the ONE record it had been shown: a meeting for three read as one man's, and its Delete took that man's
   record alone, the other two left behind out of sight. */
describe('a just-saved shared input on a day whose filter hides it is listed whole', () => {
  it('all its people on ONE card; Delete asks for everyone and removes every record', async () => {
    await mount(false, 'cal')
    await type('#inFSearch', 'ZZZ-no-match')
    await openDay('2026-10-20')
    await click($('#icPopAdd'))
    await click($('[data-testid="win-inputedit"] [data-testid="pp-several"]'))
    const [b, c] = others()
    for (const p of [b, c]) await click($(`[data-testid="win-inputedit"] [data-pp="${p}"]`))
    await type('#inpEditRmk', 'range brief')
    const had = new Set(INPUTS.map((r: any) => r.iid))
    await click($('#inpEditSave'))
    const made = INPUTS.filter((r: any) => !had.has(r.iid)) as any[]
    expect(made, 'three records').toHaveLength(3)
    const cards = $$('[data-testid="win-inputsday"] [data-testid^="idy-row-"]')
    expect(cards, 'one card on the day').toHaveLength(1)
    const names = cards[0].querySelector('[data-testid="idy-who"]')!.textContent!.split(', ')
    expect(names.sort(), 'every one of its people').toEqual([admin, b, c].map(cs).sort())
    /* its Delete is the entry's */
    await act(async () => { cards[0].querySelector('[data-testid="idy-open"]')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Delete', bubbles: true, cancelable: true })) })
    const ask = $('[data-testid="idy-ask"]')
    expect(ask, 'the question').toBeTruthy()
    expect(ask!.textContent, 'for all three').toMatch(/all 3 people/)
    await click($('[data-testid="idy-del-yes"]'))
    expect(INPUTS.filter((r: any) => made.some(m => m.iid === r.iid)), 'every record gone').toHaveLength(0)
  })
})

describe('the desktop list after the vet (D727, D729)', () => {
  it('the kind KEEPS its pill — on a one-person row and on a shared one (D727: drawing A)', async () => {
    await mount(false)
    const one = await file()
    const g = await shared(others().slice(1, 5))
    for (const row of [tr(one)!, trOf(g.rows)]) {
      const tag = row.querySelector('[data-label="Type"] .intag')
      expect(tag, 'the pill').toBeTruthy()
      expect(tag!.textContent).toBe('Meeting')
    }
    expect(trOf(g.rows).querySelector('[data-label="Name"]')!.textContent!.split(', ')).toHaveLength(4)
  })
  it('the last column is "Changed" — not "Last modified" (V5)', async () => {
    await mount(false)
    const heads = $$('#intbl thead th').map(th => (th.textContent || '').replace(/[▲▼]/g, '').trim())
    expect(heads.slice(0, 6)).toEqual(['Name', 'Start', 'End', 'Type', 'Remarks', 'Changed'])
    expect($('#intbl thead th[data-sort="mod"]')!.getAttribute('title')).toBe('Sort by changed')
    expect($('#intbl')!.textContent).not.toMatch(/last modified/i)
  })
  it('the three filter boxes carry no words over them, and each keeps its name for a screen reader (V5)', async () => {
    await mount(false)
    expect($$('#inFilters label > span'), 'no "Person", "Type", "Search" over the boxes').toHaveLength(0)
    expect($('#inFPerson')!.getAttribute('aria-label')).toBe('Person')
    expect($('#inFType')!.getAttribute('aria-label')).toBe('Type')
    expect($('#inFSearch')!.getAttribute('aria-label')).toBe('Search inputs')
    expect(($('#inFSearch') as HTMLInputElement).placeholder).toBe('Search inputs')
    expect(($('#inFPerson') as HTMLSelectElement).options[0].textContent).toBe('Everyone')
    expect(($('#inFType') as HTMLSelectElement).options[0].textContent).toBe('All types')
  })
})

describe('the empty list says which dates, in few words (V5)', () => {
  it('rangeWords: two days of one month share the month; otherwise each says its own; a day outside this year keeps its year', () => {
    expect(rangeWords('2026-10-10', '2026-10-24')).toBe('10–24 Oct')
    expect(rangeWords('2026-10-28', '2026-11-03')).toBe('28 Oct – 3 Nov')
    expect(rangeWords('2026-12-28', '2027-01-03')).toBe('28 Dec – 3 Jan 2027')
    expect(rangeWords('2027-01-03', '2027-01-09')).toBe('3 Jan 2027 – 9 Jan 2027')
    expect(rangeWords('2026-10-10', '2026-10-10')).toBe('10–10 Oct')
    expect(rangeWords('2026-10-10', '')).toBe('from 10 Oct')
  })
  it('a list with nothing in its dates: "No inputs 5–9 Jul. Try All dates." — and the way out is one press', async () => {
    await mount(false)
    await file({ date: 'Oct 20' })
    await click($('#inRangeBtn'))
    /* the dates picker opens on July 2026 while no dates are set */
    await click($('#inRangeCal [data-cal="2026-07-05"]')); await click($('#inRangeCal [data-cal="2026-07-09"]'))
    expect($('#inEmpty')!.hidden).toBe(false)
    expect($('#inEmpty')!.textContent).toBe('No inputs 5–9 Jul. Try All dates.')
    expect($('#inRangeAll')!.textContent, 'the button it names').toBe('All dates')
    await click($('#inRangeAll'))
    expect($('#inEmpty')!.hidden).toBe(true)
  })
  it('all dates and nothing matches the filters: "No inputs match."', async () => {
    await mount(false)
    await file()
    await type('#inFSearch', 'NOBODY_HAS_THIS_REMARK')
    expect($('#inEmpty')!.textContent).toBe('No inputs match.')
  })
})

describe('the row the list has just been shown is LIT (V1 — the form’s light, given by the list itself)', () => {
  const lit = () => $$('#inBody tr.innew').map(x => x.getAttribute('data-iid'))
  it('added through "+ Input": lit, and kept at the top though the search hides it', async () => {
    await mount(false)
    await file({ remarks: 'something else' })
    await type('#inFSearch', 'something')
    await click($('#inNew'))
    await click($('#inpEdCal [data-cal="2026-07-14"]'))
    await type('#inpEditRmk', 'a quiet one')
    const had = new Set(INPUTS.map((r: any) => r.iid))
    await click($('#inpEditSave'))
    const made = INPUTS.find((r: any) => !had.has(r.iid)) as any
    expect(made, 'filed').toBeTruthy()
    expect($$('#inBody tr')[0].getAttribute('data-iid'), 'first in the list, though the search does not match it').toBe(String(made.iid))
    expect(lit(), 'and it alone is lit').toEqual([String(made.iid)])
  })
  it('changed through its window: lit', async () => {
    await mount(false)
    const r = await file({ remarks: 'before' })
    expect(lit()).toEqual([])
    await click(tr(r)!.querySelector('[data-testid="in-open"]'))
    await type('#inpEditRmk', 'after')
    await click($('#inpEditSave'))
    expect(live(r.iid).remarks).toBe('after')
    expect(lit()).toEqual([r.iid])
  })
  it('put back by Undo: lit — as the month’s bar has always flashed', async () => {
    await mount(false)
    const r = await file({ remarks: 'to be deleted' })
    await click(tr(r)!.querySelector('[data-testid="in-open"]'))
    await click($('#inpEditDel'))
    expect(live(r.iid), 'deleted').toBeUndefined()
    expect(tr(r)).toBeNull()
    await act(async () => { globalUndo(); notify() })
    expect(live(r.iid), 'back').toBeTruthy()
    expect(lit()).toEqual([r.iid])
  })
  /* THE LIGHT FOLLOWS THE ENTRY, NOT ONE MAN'S RECORD (the host's own find, opening the walk's pictures, 10 Oct 26 — and
     Astra's first-ranked scenario, 29). The page is shown ONE record of a shared input — whichever the save happened to
     make first — while the desktop row stands under the entry's first record A to Z. Lit by that one record, the row of
     a shared input just added stayed dark unless the two happened to be the same man (the phone's card already asked
     every record of the entry). */
  it('a shared input ADDED through "+ Input" lights its one row — whichever of its people the save made first', async () => {
    await mount(false)
    const sorted = [...others()].sort((a, b) => cs(a).localeCompare(cs(b), undefined, { sensitivity: 'base' }))
    const first = sorted[0], last = sorted[sorted.length - 1]
    for (const order of [[first, last], [last, first]]) {
      const had = new Set(INPUTS.map((r: any) => r.iid))
      await click($('#inNew'))
      await click($('[data-testid="win-inputedit"] [data-testid="pp-several"]'))
      for (const p of order) await click($(`[data-testid="win-inputedit"] [data-pp="${p}"]`))
      await click($('#inpEdCal [data-cal="2026-07-16"]'))
      await click($('#inpEditSave'))
      const made = INPUTS.filter((r: any) => !had.has(r.iid)) as any[]
      expect(made, 'three records, one entry').toHaveLength(3)
      const row = trOf(made)
      expect(row, 'its one row').toBeTruthy()
      expect(row.classList.contains('innew'), `lit, picked ${order.map(cs).join(' then ')}`).toBe(true)
      expect(lit(), 'and it alone — the row before it has let go or is the same entry').toContain(row.getAttribute('data-iid'))
      await act(async () => { await new Promise(r => setTimeout(r, 6200)) })
      expect(lit(), 'settled').toEqual([])
    }
  }, 20000)
  /* …AND IS BROUGHT INTO VIEW (Astra's read of the code, 10 Oct 26 — finding 2; older than this build, and the List's
     one door now). The page looked for the element of the ONE record it had been shown; a shared input's row answers
     to its first record A to Z, so for any other man the look-up found nothing: the row was lit, pinned — and never
     scrolled to, with the reader left wherever he was on a long list. */
  it('a shared input ADDED through "+ Input" is scrolled to — its row, whichever record the save made first', async () => {
    await mount(false)
    const sorted = [...others()].sort((a, b) => cs(a).localeCompare(cs(b), undefined, { sensitivity: 'base' }))
    const calls: Element[] = []
    const orig = (Element.prototype as any).scrollIntoView
    ;(Element.prototype as any).scrollIntoView = function () { calls.push(this) }
    try {
      const had = new Set(INPUTS.map((r: any) => r.iid))
      await click($('#inNew'))
      await click($('[data-testid="win-inputedit"] [data-testid="pp-several"]'))
      for (const p of [sorted[0], sorted[sorted.length - 1]]) await click($(`[data-testid="win-inputedit"] [data-pp="${p}"]`))
      await click($('#inpEdCal [data-cal="2026-07-16"]'))
      await click($('#inpEditSave'))
      const made = INPUTS.filter((r: any) => !had.has(r.iid)) as any[]
      const row = trOf(made)
      expect(made[0].iid, 'the premise: the record the save made first is NOT the one the row stands under').not.toBe(row.getAttribute('data-iid'))
      expect(calls, 'the shared row itself was brought into view').toContain(row)
    } finally { (Element.prototype as any).scrollIntoView = orig }
  })
  it('a shared input changed through its window lights its ONE row', async () => {
    await mount(false)
    const g = await shared(others().slice(0, 3), { remarks: 'range brief' })
    const row = trOf(g.rows)
    await click(row.querySelector('[data-testid="in-open"]'))
    await type('#inpEditRmk', 'range brief, room 2')
    await click($('#inpEditSave'))
    expect(lit()).toEqual([row.getAttribute('data-iid')])
  })
})

/* WHAT THE SAVE ITSELF SAID IS NOT COVERED BY "Input added" (found by the gate run of this build, 10 Oct 26 — five browser
   tests of the Leave War's inputs door). The app has ONE passing note whose words are replaced by the next. A filing
   can say something of its own as it is saved — "Ammo's LL replaces the LL bid on 11 Feb", "the leave is cut for the
   ATT C". The List's own add form said nothing after a one-person add, so that sentence stood and was read; the
   window says "Input added" straight after the save — and with the form gone (D729, V1) it would have covered the
   sentence on every filing. So the window's save and its own word are said TOGETHER, as one note (the publish
   command's way — engine/hooks.ts toastBatch). */
describe('the window’s "Input added" is said together with whatever the save itself said (V1)', () => {
  const wire = () => {
    const seen: Array<[string, boolean]> = []
    let depth = 0
    const realBatch = HOOKS.toastBatch
    HOOKS.toast = ((m: any) => { seen.push([String(m), depth > 0]) }) as any
    HOOKS.toastBatch = ((fn: () => any) => { depth++; try { return fn() } finally { depth-- } }) as any
    return { seen, done: () => { HOOKS.toastBatch = realBatch } }
  }
  it('a new input: "Input added" is raised INSIDE the save’s one note, never after it', async () => {
    await mount(false)
    const w = wire()
    try {
      await click($('#inNew'))
      await click($('#inpEdCal [data-cal="2026-07-14"]'))
      await click($('#inpEditSave'))
      expect(w.seen.map(x => x[0])).toContain('Input added')
      expect(w.seen.filter(x => !x[1]), 'nothing said outside the save’s one note').toEqual([])
    } finally { w.done() }
  })
  it('a saved input changed, and a shared one filed — each inside one note', async () => {
    await mount(false)
    const r = await file({ remarks: 'before' })
    const w = wire()
    try {
      await click(tr(r)!.querySelector('[data-testid="in-open"]'))
      await type('#inpEditRmk', 'after')
      await click($('#inpEditSave'))
      expect(w.seen.map(x => x[0])).toContain('Input updated')
      await click($('#inNew'))
      await click($('[data-testid="win-inputedit"] [data-testid="pp-several"]'))
      await click($(`[data-testid="win-inputedit"] [data-pp="${others()[2]}"]`))
      await click($('#inpEdCal [data-cal="2026-07-15"]'))
      await click($('#inpEditSave'))
      expect(w.seen.map(x => x[0])).toContain('Input added for 2 people')
      expect(w.seen.filter(x => !x[1])).toEqual([])
    } finally { w.done() }
  })
  it('a refusal says its own sentence alone — "Input added" is never joined to a save that did not happen', async () => {
    await mount(false)
    const w = wire()
    try {
      await click($('#inNew'))
      await click($('#inpEditSave'))
      expect(w.seen.map(x => x[0])).toEqual(['Pick a start date on the calendar first'])
    } finally { w.done() }
  })
})

/* THE "?" IS NOT DRAWN WHERE IT CANNOT BE PRESSED (Astra's scenario design, 10 Oct 26 — "Help while reading an uneditable
   input needs the walk"). The form of an input its reader may not change is inert: a "?" inside it is a button that
   can be seen and does nothing. A reader chooses no kind; the card is one press away under "+ Input". */
describe('the "?" beside Type is offered only where it can be pressed', () => {
  it('a member reading another man’s input: no "?"; his own input and a new one: the "?" is there and opens', async () => {
    await mount(false)
    const mine = await file({ person: 'bane', by: 'bane', remarks: 'mine' })
    const his = await file({ person: others()[3], by: others()[3], remarks: 'his' })
    await act(async () => { setSession({ user: 'bane', role: 'main' }); setMe('bane'); notify() })
    await act(async () => { const s = $('#inFPerson') as HTMLSelectElement; s.value = 'all'; s.dispatchEvent(new Event('change', { bubbles: true })) })
    await click(tr(his)!.querySelector('[data-testid="in-open"]'))
    expect($('[data-testid="inped-ro"]'), 'read only').toBeTruthy()
    expect($('#inTypeHelp'), 'no dead "?" in a form he cannot use').toBeNull()
    await click($('#inpEditCancel'))
    await click(tr(mine)!.querySelector('[data-testid="in-open"]'))
    expect($('#inTypeHelp'), 'his own input').toBeTruthy()
    await click($('#inTypeHelp'))
    expect($('#inTypePop')).toBeTruthy()
    await click($('#inpEditCancel'))
    await click($('#inNew'))
    expect($('#inTypeHelp'), 'and a new one').toBeTruthy()
    await click($('#inTypeHelp'))
    expect($('#inTypePop')!.textContent).toContain('What each type means')
  })
  /* THE CARD GIVES WAY TO A QUESTION (Astra's read, finding 4). Add pressed from the keyboard leaves the card open (no
     press closes it); the document question then stood over the window while the CARD took the first Escape. A
     question that must be answered owns the keyboard: the card closes as it opens, and Escape is the question's. */
  it('a question opened over the window closes the "?" card, and Escape then answers the question — not the card', async () => {
    await mount(false)
    await click($('#inNew'))
    await act(async () => { const s = $('#inpEditType') as HTMLSelectElement; s.value = 'ATT C'; s.dispatchEvent(new Event('change', { bubbles: true })) })
    await click($('#inpEdCal [data-cal="2026-07-14"]'))
    await click($('#inTypeHelp'))
    expect($('#inTypePop'), 'the card is open').toBeTruthy()
    await click($('#inpEditSave'))                 // as the keyboard does it: no press anywhere closes the card first
    expect($('[data-testid="docconf"]'), 'the document question').toBeTruthy()
    expect($('#inTypePop'), 'the card has given way').toBeNull()
    await act(async () => { document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })) })
    expect($('[data-testid="docconf"]'), 'Escape answered the question').toBeNull()
    expect($('[data-testid="win-inputedit"]'), 'and the window, with what he chose, is still there').toBeTruthy()
    expect(($('#inpEditType') as HTMLSelectElement).value).toBe('ATT C')
  })
})

describe('the phone’s list has the same one button (V1)', () => {
  it('"+ Input" opens the new input’s window there too, and no form stands before the cards', async () => {
    await mount(true)
    const r = await file()
    expect($('.inbar'), 'no form').toBeNull()
    expect($(`[data-testid="inl-row-${r.iid}"]`), 'the cards').toBeTruthy()
    await click($('#inNew'))
    expect($('[data-testid="win-inputedit"]')).toBeTruthy()
    expect($('#inpEditPop .rc-read')!.textContent).toBe('pick a start date')
    expect(($('#inpEditPerson') as HTMLSelectElement).selectedOptions[0].textContent, 'filed for whoever is signed in').toBe(cs(admin))
  })
})
