// @vitest-environment jsdom
// THE LEAVE WAR'S OWN DOCUMENT CHIPS OPEN WHAT THEY HOLD (his D1292, 24 Oct 26 — "After I upload the document. I should be able
// to click on the image to preview what I uploaded"; [LW-DOCFIELD-CHIP-OPENS], found 2 Nov 26 by the viewer's Close walk): the
// read-only chips (a held day's line, the day's list, the person window, Approvals) opened the viewer since M4, but the chips of
// a window's own Document row — the bid window, the drag window, the day's list, the closed day, an approved leave's row — did
// nothing when tapped. Now a tap on the chip's name opens the app's document viewer on that file, straight after it is added
// (nothing saved yet) as well as later, the window under it as it was; its ✕ still only takes it off.
import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { INPUTS } from '../../engine/inputs'
import { initStore, lwHistInit, setPeople, setRole } from '../state/store'
import { initStore as raptorInitStore, notify } from '../../state/store'
import { setSession } from '../../state/auth'
import { projectPeople } from '../state/raptorRoster'
import { wireLeaveWarSync } from '../sync'
import { _resetTimeline } from '../../undo/timeline'
import { installGlobalUndo } from '../../state/undo-wire'
import { setLwOnScreen } from '../state/screen'
import { memoryBackend } from '../state/storage'
import { fileAbsence } from '../testkit'
import { Matrix } from './Matrix'
import { SelectSheet } from './SelectSheet'
import { LeaveWords, ReqWordsRows } from './ReqWords'
import { setLeaveRemarks } from '../../ui/inputedit'
import { DocViewer } from '../../ui/DocViewer'
import { DOCVIEW, setDocView } from '../../ui/pops'
import { docAdd } from '../../state/docs'

const ISNAP = JSON.stringify(INPUTS)
const $ = (sel: string) => document.querySelector(sel) as HTMLElement
const file = (name: string) => new File(['x'], name, { type: 'image/png' })
const pick = (input: HTMLInputElement, name: string) => {
  Object.defineProperty(input, 'files', { configurable: true, value: [file(name)] })
  fireEvent.change(input)
}
const chipName = (scope: HTMLElement, i = 0) => scope.querySelectorAll<HTMLElement>('.docchip .docname')[i]!

beforeAll(() => {
  ;(URL as any).createObjectURL = vi.fn(() => 'blob:stub')
  ;(URL as any).revokeObjectURL = vi.fn()
})
function wired() {
  INPUTS.length = 0
  JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
  setSession({ user: 'ad', role: 'admin' })
  raptorInitStore()
  initStore(memoryBackend())
  setPeople(projectPeople())
  wireLeaveWarSync()
  _resetTimeline(); lwHistInit(); installGlobalUndo()
  setRole('admin'); setLwOnScreen(true)
  act(() => { setDocView(null); notify() })
}
afterEach(() => { act(() => { setDocView(null) }); _resetTimeline(); setSession(null); INPUTS.length = 0; JSON.parse(ISNAP).forEach((i: any) => INPUTS.push(i)) })

describe('the bid window’s own Document chip (the grid tapped)', () => {
  beforeEach(() => { initStore(memoryBackend()); lwHistInit(); setRole('admin'); setLwOnScreen(true); act(() => { setDocView(null); notify() }) })

  it('the bid window on an empty day: a file just added opens over the window; the window stays', () => {
    render(<><Matrix /><DocViewer /></>)
    fireEvent.click(screen.getByTestId('cell-dusk-2026-01-30'))
    const row = screen.getByTestId('bid-doc-row')
    pick(row.querySelector('input[type=file]') as HTMLInputElement, 'leave-note.png')
    act(() => { fireEvent.click(chipName(screen.getByTestId('bid-doc-row'))) })
    expect(DOCVIEW, 'the viewer opened on the file not yet placed').toBeTruthy()
    expect(DOCVIEW.readOnly).toBe(true)
    expect(String(DOCVIEW.row.person)).toBe('dusk')
    expect(($('#docViewPop') as any).hidden).toBe(false)
    expect($('#docViewTitle').textContent, 'whose and which day').toMatch(/· Bid · Jan 30$/)
    act(() => { fireEvent.click($('#docViewClose')) })
    expect(DOCVIEW).toBeNull()
    expect(screen.getByTestId('bid-picker'), 'the bid window under it as it was').toBeTruthy()
    expect(screen.getByTestId('bid-doc-row').querySelectorAll('.docchip')).toHaveLength(1)
  })

  it('the bid window: its ✕ takes the file off and opens nothing', () => {
    render(<><Matrix /><DocViewer /></>)
    fireEvent.click(screen.getByTestId('cell-dusk-2026-01-30'))
    pick(screen.getByTestId('bid-doc-row').querySelector('input[type=file]') as HTMLInputElement, 'leave-note.png')
    fireEvent.click(screen.getByTestId('bid-doc-row').querySelector('.docchip .docdel') as HTMLElement)
    expect(screen.getByTestId('bid-doc-row').querySelectorAll('.docchip')).toHaveLength(0)
    expect(DOCVIEW).toBeNull()
  })
})

describe('a Leave War window’s own Document chip opens the file', () => {
  beforeEach(wired)

  it('a held bid’s row opens its own file, its kind named', () => {
    const id = docAdd(file('held.png') as any).id
    render(<><ReqWordsRows compact who={{ personId: 'dusk', code: 'LL' }} value={{ remarks: 'Bali', docIds: [id] }} onChange={() => {}} start="2026-02-10" end="2026-02-11" /><DocViewer /></>)
    act(() => { fireEvent.click(chipName(screen.getByTestId('bid-doc-row'))) })
    expect(DOCVIEW?.docId).toBe(id)
    expect($('#docViewTitle').textContent).toMatch(/· LL · Feb 10 → Feb 11$/)
  })

  it('the drag window (one person): a file just added opens', () => {
    const P = 'dusk'
    render(<><SelectSheet sel={{ people: [P], from: '2026-02-12', to: '2026-02-13', cells: [{ personId: P, date: '2026-02-12' }, { personId: P, date: '2026-02-13' }] } as any}
      people={() => 'Dusk'} role="admin" canDecide onDone={() => {}} onMove={() => {}} onClose={() => {}} onPostOut={() => undefined} /><DocViewer /></>)
    pick(screen.getByTestId('sel-doc-row').querySelector('input[type=file]') as HTMLInputElement, 'range.png')
    act(() => { fireEvent.click(chipName(screen.getByTestId('sel-doc-row'))) })
    expect(DOCVIEW, 'opened').toBeTruthy()
    expect(String(DOCVIEW.row.person)).toBe(P)
    expect($('#docViewTitle').textContent).toMatch(/Feb 12 → Feb 13$/)
  })

  it('an approved leave’s own row opens the leave’s file', () => {
    const row = fileAbsence('dusk', 'LL', '2026-02-10', '2026-02-10', { lw: true, remarks: 'Bali' })
    const id = docAdd(file('approval.png') as any).id
    expect(setLeaveRemarks(row, 'Bali', 'dusk', [id])).toBe(true)
    render(<><LeaveWords row={INPUTS.find((r: any) => r.iid === row.iid)} personId="dusk" testPrefix="w" /><DocViewer /></>)
    act(() => { fireEvent.click(chipName(screen.getByTestId('w-doc-row'))) })
    expect(DOCVIEW?.docId).toBe(id)
    expect(DOCVIEW.readOnly).toBe(true)
    expect($('#docViewTitle').textContent).toContain('· LL · Feb 10')
  })
})
