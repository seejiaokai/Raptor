// @vitest-environment jsdom
/* A SHARED INPUT IS ONE LINE — on an opened day and on the List (owner D655, 7 Oct 26: "one shared group input, shown
   and edited as one thing"; the build plan docs/superpowers/plans/2026-10-07-inputs-sans-redesign-plan.md §3.13, "Where
   a shared input shows as ONE thing").

     A day opened: "one line — its people as compact pucks, the kind, the times, the remarks, and 'Placed by Saber for 4
     people · 7 Oct 26, 14:32'; the LATE tag beside a man whose own record is late (a man added later can be late
     alone). Delete on the focused line asks 'Delete this input for all 4 people?' of the filer or an admin, and 'Take
     yourself out of this input?' of a man in it."
     The List: "one line, its Person cell reading 'Saber +3' (the title lists everyone); its ✎ opens the editor window,
     not the row's in-place edit; sorted by its first callsign." */
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { InputsPage } from './InputsPage'
import { InputEditor } from './inputedit'
import { initStore, notify, setSession, undo, writeInputs } from '../state/store'
import { setMe } from '../state/auth'
import { setCalMonth, setInpMode, setInpView, setPage } from '../state/view'
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
const said: string[] = []
const realToast = HOOKS.toast
const $ = (sel: string) => document.querySelector(sel) as HTMLElement | null
const $$ = (sel: string) => [...document.querySelectorAll(sel)] as HTMLElement[]
const tid = (id: string) => $(`[data-testid="${id}"]`)
const cs = (id: any) => PEOPLE[id].cs as string
/* the admin Saber (`stiff`), the member Ranger (`bane`); the others are neither */
const admin = 'stiff', member = 'bane'
const others = () => Object.keys(PEOPLE).filter(id => !PEOPLE[id].archived && !PEOPLE[id].deleted && !PEOPLE[id].special && !PEOPLE[id].san && !PEOPLE[id].pers && id !== admin && id !== member)
const az = (ids: string[]) => [...ids].sort((a, b) => cs(a).localeCompare(cs(b), undefined, { sensitivity: 'base' }))
const of = (grp: string) => INPUTS.filter((r: any) => r.grp === grp) as any[]
const click = async (el: Element | null) => { expect(el, 'click target').toBeTruthy(); await act(async () => { (el as HTMLElement).click() }) }
const key = async (el: Element, k: string) => act(async () => { el.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true })) })
const day = (iso: string) => $(`[data-icday="${iso}"]`)!
const open = async (iso: string) => key(day(iso), 'Enter')
let n = 0
const shared = async (people: string[], over: any = {}, each: Record<string, any> = {}) => {
  const grp = 'gL' + (++n)
  const rows = people.map((p, i) => ({ iid: `${grp}-${i}`, person: p, type: 'Meeting', date: 'Oct 7', yr: 2026, allday: false, s: 600, e: 660,
    remarks: 'range brief', mod: '2026-09-01', grp, grpBy: admin, by: admin, at: new Date(2026, 8, 1, 14, 32).getTime(), ...over, ...(each[p] || {}) }))
  await act(async () => { writeInputs(() => { INPUTS.push(...rows) }); notify() })
  return { grp, first: az(people)[0], line: () => $$('[data-testid^="idy-row-"]').find(el => of(grp).some(r => el.getAttribute('data-popiid') === r.iid))! }
}
const as = async (who: 'admin' | 'member') => act(async () => {
  if (who === 'admin') { setSession({ user: admin, role: 'admin' }); setMe(admin) } else { setSession({ user: member, role: 'main' }); setMe(member) }
  notify()
})

beforeEach(async () => {
  INPUTS.splice(0, INPUTS.length, ...JSON.parse(seed))
  const mem = new Map<string, string>()
  storeBackend.impl = { getItem: k => mem.get(k) ?? null, setItem: (k, v) => mem.set(k, v), keys: () => [...mem.keys()] }
  initStore(); setSession({ user: admin, role: 'admin' }); setMe(admin); lwInitStore(memoryBackend()); lwSetRole('admin')
  setPage('inputs'); setInpMode('member'); setInpView('cal'); setCalMonth({ y: 2026, m: 10 })
  said.length = 0; HOOKS.toast = ((m: any) => { said.push(String(m)) }) as any
  host = document.createElement('div'); document.body.append(host); root = createRoot(host)
  await act(async () => { root.render(<><InputsPage /><InputEditor /></>) })
  await act(async () => { setCalMonth({ y: 2026, m: 10 }); notify() })
})
afterEach(async () => {
  await act(async () => { root.unmount(); setInpEdit(null) })
  HOOKS.toast = realToast
  host.remove(); _resetFloatWins()
})

describe('a day opened: a shared input is one line', () => {
  it('one line, not one a man — its people as the schedule’s pucks, A to Z; the kind, the hours, who placed it for how many', async () => {
    const [a, b, c] = others()
    const g = await shared([a, b, c])
    await open('2026-10-07')
    const lines = $$('[data-testid^="idy-row-"]').filter(el => of(g.grp).some(r => el.getAttribute('data-popiid') === r.iid))
    expect(lines, 'one line').toHaveLength(1)
    const pucks = [...lines[0].querySelectorAll('[data-testid="idy-people"] .puck')].map(p => p.getAttribute('data-person'))
    expect(pucks).toEqual(az([a, b, c]))
    expect(lines[0].textContent).toContain('Meeting')
    expect(lines[0].querySelector('[data-testid="idy-when"]')!.textContent).toContain('10:00')
    expect(lines[0].querySelector('[data-testid="idy-placed"]')!.textContent).toContain(`Placed by ${cs(admin)} for 3 people`)
    expect(tid('idy-count')!.textContent).toBe('1 input')
  })
  it('LATE stands beside the man whose own record is late — not on the others', async () => {
    const [a, b, c] = others()
    const g = await shared([a, b, c], {}, { [c]: { mod: '2026-10-06' } })
    await open('2026-10-07')
    const line = g.line()
    expect(line, 'still one line: the late date is each man’s own').toBeTruthy()
    expect(line.querySelector(`[data-testid="idy-late-${c}"]`), cs(c)).toBeTruthy()
    expect(line.querySelector(`[data-testid="idy-late-${a}"]`)).toBeNull()
    expect(line.querySelector(`[data-testid="idy-late-${b}"]`)).toBeNull()
  })
  it('a press on the line opens the ENTRY in the editor window', async () => {
    const g = await shared(others().slice(0, 3))
    await open('2026-10-07')
    await click(g.line().querySelector('[data-testid="idy-open"]'))
    expect(tid('win-inputedit')!.textContent).toContain(`${cs(g.first)} +2`)
  })
  it('Delete, for an admin: "Delete this input for all 3 people?" — and Delete takes them all, in one step', async () => {
    const g = await shared(others().slice(0, 3))
    await open('2026-10-07')
    await key(g.line().querySelector('[data-testid="idy-open"]')!, 'Delete')
    expect(tid('idy-ask')!.textContent).toContain('Delete this input for all 3 people?')
    expect(of(g.grp)).toHaveLength(3)
    await click(tid('idy-del-yes'))
    expect(of(g.grp)).toHaveLength(0)
    await act(async () => { undo(); notify() })
    expect(of(g.grp), 'one Undo').toHaveLength(3)
  })
  it('Delete, for a man in it who did not file it: "Take yourself out of this input?" — his record alone', async () => {
    const [a, b] = others()
    const g = await shared([a, member, b])
    await as('member')
    await open('2026-10-07')
    await key(g.line().querySelector('[data-testid="idy-open"]')!, 'Delete')
    expect(tid('idy-ask')!.textContent).toContain('Take yourself out of this input?')
    expect(tid('idy-del-yes')!.textContent).toBe('Take me out')
    await click(tid('idy-del-yes'))
    expect(of(g.grp).map(r => String(r.person)).sort()).toEqual([a, b].sort())
  })
  it('Delete, for anyone else: nothing is asked — it says who can', async () => {
    const g = await shared(others().slice(0, 3))
    await as('member')
    await open('2026-10-07')
    await key(g.line().querySelector('[data-testid="idy-open"]')!, 'Delete')
    expect(tid('idy-ask')).toBeNull()
    expect(said.join(' | ')).toContain(`Only ${cs(admin)} — who filed it — or an admin can delete this for everyone`)
    expect(of(g.grp)).toHaveLength(3)
  })
})

describe('the List: a shared input is one line', () => {
  /* the List opens on today onward — a date the demo's today has not passed */
  const LATER = { date: 'Oct 14' }
  const listUp = async () => act(async () => { setInpView('table'); notify() })
  const rowsOf = (grp: string) => $$('#inBody tr[data-iid]').filter(tr => of(grp).some(r => r.iid === tr.getAttribute('data-iid')))
  it('one row, its Name reading the first callsign and how many more — the title lists everyone', async () => {
    const [a, b, c] = others()
    const g = await shared([a, b, c], LATER)
    await listUp()
    const rows = rowsOf(g.grp)
    expect(rows).toHaveLength(1)
    const name = rows[0].querySelector('[data-label="Name"]')!
    expect(name.textContent).toBe(`${cs(g.first)} +2`)
    expect(name.querySelector('[title]')!.getAttribute('title')).toBe(az([a, b, c]).map(cs).join(', '))
    expect(rows[0].querySelector('[data-testid="in-placed"]')!.textContent).toContain('for 3 people')
  })
  it('its ✎ opens the editor window on the entry — never the row’s edit in place', async () => {
    const g = await shared(others().slice(0, 3), LATER)
    await listUp()
    await click(rowsOf(g.grp)[0].querySelector('[data-edit]'))
    expect($('#inBody tr.ined')).toBeNull()
    expect(tid('win-inputedit')!.textContent).toContain(`${cs(g.first)} +2`)
  })
  it('its row has no ✕ and no OIL chip of one man’s: deleting it, and its OIL answer, are in its window — for everyone', async () => {
    const g = await shared(others().slice(0, 3), { type: 'Duty', date: 'Oct 17', allday: true, s: 0, e: 1439, oil: { '2026-10-17': 1 } })
    await listUp()
    const row = rowsOf(g.grp)[0]
    expect(row.querySelector('.rmx')).toBeNull()
    expect(row.querySelector('.roil')).toBeNull()
    expect(row.querySelector('[data-edit]')).toBeTruthy()
  })
  it('a man who may change nothing of it still opens it, to read', async () => {
    const g = await shared(others().slice(0, 3), LATER)
    await as('member')
    await listUp()
    await click(rowsOf(g.grp)[0].querySelector('[data-edit]'))
    expect(tid('inped-ro')).toBeTruthy()
  })
  it('filtered to ONE of its people the line still shows — as the whole entry', async () => {
    const [a, b, c] = others()
    const g = await shared([a, b, c], LATER)
    await listUp()
    const last = az([a, b, c])[2]
    const sel = $('#inFPerson') as HTMLSelectElement
    expect(sel, 'the List’s person filter').toBeTruthy()
    await act(async () => { sel.value = last; sel.dispatchEvent(new Event('change', { bubbles: true })) })
    const rows = rowsOf(g.grp)
    expect(rows).toHaveLength(1)
    expect(rows[0].querySelector('[data-label="Name"]')!.textContent).toBe(`${cs(g.first)} +2`)
  })
  it('an ordinary input keeps its row as it was — ✎ in place, ✕, its own name', async () => {
    const a = others()[0]
    await act(async () => { writeInputs(() => { INPUTS.push({ iid: 'solo1', person: a, type: 'Meeting', date: 'Oct 8', yr: 2026, allday: false, s: 600, e: 660, remarks: 'solo', mod: '2026-09-01' }) }); notify() })
    await listUp()
    const row = $('#inBody tr[data-iid="solo1"]')!
    expect(row.querySelector('[data-label="Name"]')!.textContent).toBe(cs(a))
    expect(row.querySelector('.rmx')).toBeTruthy()
    await click(row.querySelector('[data-edit]'))
    expect($('#inBody tr.ined')).toBeTruthy()
    expect(tid('win-inputedit')).toBeNull()
  })
})
