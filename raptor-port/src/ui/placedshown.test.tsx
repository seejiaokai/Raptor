// @vitest-environment jsdom
/* WHO PLACED IT, AND WHEN — SHOWN WHEREVER AN ENTRY IS LISTED OR OPENED (the build plan
   docs/superpowers/plans/2026-10-07-inputs-sans-redesign-plan.md §3.8; owner D629, 7 Oct 26: "Can u also show who placed
   that input at what time and day? A small one.").

   "Shown in small print in an opened day, in the List, at the foot of the editor, on a Medical card and in the document
   viewer for the input whose document is showing." The opened days are pinned with their windows (ui/sansday.test.tsx,
   ui/inputsday.test.tsx); these are the other four. ONE body writes the line (ui/placedline.ts), so each place is
   asked only that it shows that line for ITS record — and nothing for a record that never recorded a filer (D56). */
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { InputsPage } from './InputsPage'
import { InputEditor } from './inputedit'
import { MedicalView } from './MedicalView'
import { DocViewer } from './DocViewer'
import { initStore, notify, setSession } from '../state/store'
import { setCalMonth, setInpMode, setInpView, setMedAsOf, setPage } from '../state/view'
import { INPUTS } from '../engine/inputs'
import { PEOPLE } from '../engine/people'
import { storeBackend } from '../engine/hooks'
import { docAdd } from '../state/docs'
import { initStore as lwInitStore, setRole as lwSetRole } from '../leavewar/state/store'
import { memoryBackend } from '../leavewar/state/storage'
import { _resetFloatWins } from './FloatWindow'
import { placedLine } from './placedline'
import { setDocView, setInpEdit } from './pops'
;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

let host: HTMLDivElement, root: Root
const seed = JSON.stringify(INPUTS)
const $ = (sel: string) => document.querySelector(sel) as HTMLElement | null
const crew = () => Object.keys(PEOPLE).filter(id => !PEOPLE[id].archived && !PEOPLE[id].deleted && !PEOPLE[id].special && !PEOPLE[id].san && !PEOPLE[id].pers)
const T = (d: number, h: number, m: number) => new Date(2026, 6, d, h, m).getTime()
const stamps = (by: string, changedBy?: string) => ({ by, at: T(2, 9, 10), modBy: changedBy || by, modAt: changedBy ? T(4, 8, 5) : T(2, 9, 10) })
const click = async (el: Element | null) => { expect(el, 'click target').toBeTruthy(); await act(async () => { (el as HTMLElement).click() }) }
const mount = async (node: React.ReactNode) => {
  host = document.createElement('div'); document.body.append(host); root = createRoot(host)
  await act(async () => { root.render(node) })
}

beforeEach(() => {
  INPUTS.splice(0, INPUTS.length, ...JSON.parse(seed))
  const mem = new Map<string, string>()
  storeBackend.impl = { getItem: k => mem.get(k) ?? null, setItem: (k, v) => mem.set(k, v), keys: () => [...mem.keys()] }
  ;(URL as any).createObjectURL = vi.fn(() => 'blob:stub'); (URL as any).revokeObjectURL = vi.fn()
  initStore(); setSession({ user: 'a', role: 'admin' }); lwInitStore(memoryBackend()); lwSetRole('admin')
  setPage('inputs'); setInpMode('member'); setInpView('table'); setCalMonth({ y: 2026, m: 7 })
})
afterEach(async () => {
  await act(async () => { setInpEdit(null); setDocView(null); root.unmount() })
  host.remove(); _resetFloatWins(); setMedAsOf(null as any); setSession(null); storeBackend.impl = null
})

describe('in the List', () => {
  it('a small line under the row’s remark says who placed it and when; a record with no filer has none', async () => {
    const [a, b] = crew()
    const withLine: any = { iid: 'ps-1', person: b, type: 'Meeting', date: 'Jul 14', yr: 2026, allday: false, s: 600, e: 660, remarks: 'Bring the folder', mod: '2026-07-04', ...stamps(a, b) }
    const without: any = { iid: 'ps-2', person: a, type: 'Meeting', date: 'Jul 14', yr: 2026, allday: false, s: 600, e: 660, remarks: '', mod: '2026-07-02' }
    INPUTS.push(withLine, without)
    await mount(<InputsPage />)
    await click($('#inRangeBtn')); await click($('#inRangeAll'))
    const line = $(`#inBody [data-iid="ps-1"] [data-testid="in-placed"]`)
    expect(line!.textContent).toBe(placedLine(withLine))
    expect(line!.textContent).toBe(`Placed by ${PEOPLE[a].cs} for ${PEOPLE[b].cs} · 2 Jul 26, 09:10 · changed by ${PEOPLE[b].cs} · 4 Jul 26, 08:05`)
    expect(line!.closest('td')!.getAttribute('data-label'), 'under the remark, where there is room for it').toBe('Remarks')
    expect($(`#inBody [data-iid="ps-2"] [data-testid="in-placed"]`)).toBeNull()
  })
})

describe('at the foot of the editor', () => {
  it('an input opened shows its line; a new input, and a record with no filer, show none', async () => {
    const [a] = crew()
    const row: any = { iid: 'ps-3', person: a, type: 'Meeting', date: 'Jul 14', yr: 2026, allday: false, s: 600, e: 660, remarks: '', mod: '2026-07-02', ...stamps(a) }
    const bare: any = { iid: 'ps-4', person: a, type: 'Meeting', date: 'Jul 15', yr: 2026, allday: false, s: 600, e: 660, remarks: '', mod: '2026-07-02' }
    INPUTS.push(row, bare)
    await mount(<InputEditor />)
    await act(async () => { setInpEdit(row); notify() })
    expect($('[data-testid="inped-placed"]')!.textContent).toBe(`Placed by ${PEOPLE[a].cs} · 2 Jul 26, 09:10`)
    await act(async () => { setInpEdit(bare); notify() })
    expect($('[data-testid="inped-placed"]')).toBeNull()
    await act(async () => { setInpEdit({ _new: true, _ctx: 'i', person: a, type: 'Meeting', date: 'Jul 16', allday: false, s: 600, e: 660 }); notify() })
    expect($('[data-testid="inped-placed"]')).toBeNull()
  })
})

describe('on a Medical card', () => {
  it('the card of a man who is down shows the stamp of that input', async () => {
    const down: any = INPUTS.find((r: any) => r.type === 'ATT C' && r.date === 'Jul 13')
    expect(down, 'the seeded ATT C of 13 Jul').toBeTruthy()
    Object.assign(down, stamps(crew()[0]))
    await act(async () => { setMedAsOf('2026-07-14') })
    await mount(<MedicalView />)
    const card = $(`.medcard[data-medcard="${down.iid}"]`)
    expect(card, 'his card').toBeTruthy()
    expect(card!.querySelector('[data-testid="medcard-placed"]')!.textContent).toBe(placedLine(down))
  })
  it('a card whose input never recorded a filer shows no such line', async () => {
    const down: any = INPUTS.find((r: any) => r.type === 'ATT C' && r.date === 'Jul 13')
    delete down.by; delete down.at; delete down.modBy; delete down.modAt
    await act(async () => { setMedAsOf('2026-07-14') })
    await mount(<MedicalView />)
    expect($(`.medcard[data-medcard="${down.iid}"] [data-testid="medcard-placed"]`)).toBeNull()
  })
})

describe('in the document viewer', () => {
  it('it shows the stamp of the input whose document is showing, and changes with it as an episode’s documents are paged', async () => {
    const [a, b] = crew()
    const d1 = docAdd(new Blob(['x'], { type: 'image/png' }) as any).id, d2 = docAdd(new Blob(['y'], { type: 'image/png' }) as any).id
    const first: any = { iid: 'ps-5', person: b, type: 'ATT C', date: 'Jul 10', endDate: 'Jul 13', yr: 2026, docId: d1, ...stamps(b) }
    const second: any = { iid: 'ps-6', person: b, type: 'OML', date: 'Jul 14', yr: 2026, docId: d2, ...stamps(a, b) }
    await mount(<DocViewer />)
    await act(async () => { setDocView({ rows: [{ row: first }, { row: second }], idx: 0 }); notify() })
    expect($('[data-testid="docview-placed"]')!.textContent).toBe(placedLine(first))
    await click($('#docViewNext'))
    expect($('[data-testid="docview-placed"]')!.textContent).toBe(placedLine(second))
    expect(placedLine(second)).not.toBe(placedLine(first))
    await click($('#docViewPrev'))
    expect($('[data-testid="docview-placed"]')!.textContent).toBe(placedLine(first))
  })
  it('an entry with no filer on record shows none', async () => {
    await mount(<DocViewer />)
    await act(async () => { setDocView({ row: { person: crew()[0], type: 'OML', date: 'Jul 10', yr: 2026 } }); notify() })
    expect($('#docViewPop')).toBeTruthy()
    expect($('[data-testid="docview-placed"]')).toBeNull()
  })
})
