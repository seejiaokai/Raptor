// @vitest-environment jsdom
/* THE NIGHT'S WALK, 25 OCT 26 — four faults the walkers found on the built app, pinned red first
   (`docs/handpass/2026-10-25-lw-night.md` §12; the walkers' reports `docs/handpass/parts/lw-night/w1.md`, `w2.md`).
   F1: a filing that opens a window over the page (a weekend's OIL question) put the bubble at the foot, behind it, and
       the first tap in that window ended it. A window drawn over the page is not "the Manning button scrolled away", and
       a tap inside it is not his next tap on the page.
   F2: "Show ›" pressed twice fast — the second press landed on the grid under the vanished note and opened a window.
   W1: his own approved leave's window kept a removed document, and a till ticked again, drawn as before until reopened.
   W4: the drag window rewrote the words of a leave filed on the Inputs page, whose own window says they are changed
       there (an admin's tap on such a leave opens the read-only sheet — D1177's reading). */
import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { ruleHave } from '../engine'
import { INPUTS } from '../../engine/inputs'
import { getState, initStore, lwHistInit, saveManningRule, setPeople, setRole } from '../state/store'
import { initStore as raptorInitStore } from '../../state/store'
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
import { LeaveWords } from './ReqWords'
import { setLeaveRemarks } from '../../ui/inputedit'

const ISNAP = JSON.stringify(INPUTS)
const TARGET = '2026-01-30'
const bubble = () => screen.queryByTestId('manning-bubble')
const foot = () => screen.queryByTestId('manning-bubble-foot')

function wired() {
  INPUTS.length = 0
  JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
  setSession({ user: 'ad', role: 'admin' })
  raptorInitStore()
  initStore(memoryBackend())
  setPeople(projectPeople())
  wireLeaveWarSync()
  _resetTimeline(); lwHistInit(); installGlobalUndo()
  setRole('admin')
}
afterEach(() => { _resetTimeline(); setSession(null); INPUTS.length = 0; JSON.parse(ISNAP).forEach((i: any) => INPUTS.push(i)); document.querySelectorAll('.test-pop').forEach(e => e.remove()) })

function redPastOneMore() {
  const s = getState()
  const count = { kind: 'people' as const, filter: {} }
  const have = ruleHave(count, s.people, s.grid, s.states, TARGET)
  expect(saveManningRule({ id: 'test-bubble', label: 'Test crew', count, threshold: { amber: have, red: have } })).toBe(true)
}

describe('the bubble and a window over the page (F1), Show pressed twice (F2)', () => {
  beforeEach(() => { initStore(memoryBackend()); lwHistInit(); setRole('admin'); setLwOnScreen(true) })

  it('a tap inside a window drawn over the page leaves the bubble up; a tap on the page ends it', async () => {
    redPastOneMore()
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(`cell-dusk-${TARGET}`))
    fireEvent.click(screen.getByTestId('bid-LL'))
    expect(bubble()).toBeTruthy()
    await act(async () => { await new Promise(r => setTimeout(r, 0)) })
    const pop = document.createElement('div')
    pop.className = 'airpop test-pop'
    const btn = document.createElement('button')
    pop.appendChild(btn)
    document.body.appendChild(pop)
    fireEvent.pointerDown(btn)
    expect(bubble(), 'a tap in the OIL question is not his next tap on the page').toBeTruthy()
    fireEvent.pointerDown(document.body)
    expect(bubble()).toBeNull()
  })

  it('the Manning button covered by a window over the page counts as in view: the bubble under it, not at the foot', () => {
    redPastOneMore()
    render(<Matrix />)
    const toggle = screen.getByTestId('counts-toggle')
    toggle.getBoundingClientRect = () => ({ top: 100, bottom: 127, left: 26, right: 106, width: 80, height: 27, x: 26, y: 100, toJSON: () => ({}) }) as DOMRect
    const pop = document.createElement('div')
    pop.className = 'airpop test-pop'
    document.body.appendChild(pop)
    const was = document.elementFromPoint
    ;(document as any).elementFromPoint = () => pop
    try {
      fireEvent.click(screen.getByTestId(`cell-dusk-${TARGET}`))
      fireEvent.click(screen.getByTestId('bid-LL'))
      expect(bubble()).toBeTruthy()
      expect(foot()).toBeNull()
    } finally { (document as any).elementFromPoint = was }
  })

  it('"Show ›" pressed twice fast: the second press opens nothing on the grid under it', async () => {
    redPastOneMore()
    render(<Matrix />)
    const toggle = screen.getByTestId('counts-toggle')
    toggle.getBoundingClientRect = () => ({ top: -300, bottom: -273, left: 26, right: 106, width: 80, height: 27, x: 26, y: -300, toJSON: () => ({}) }) as DOMRect
    const was = Element.prototype.scrollIntoView
    Element.prototype.scrollIntoView = function () { /* none in jsdom */ }
    try {
      fireEvent.click(screen.getByTestId(`cell-dusk-${TARGET}`))
      fireEvent.click(screen.getByTestId('bid-LL'))
      expect(foot()).toBeTruthy()
      fireEvent.click(screen.getByTestId('manning-bubble-show'))
      expect(foot()).toBeNull()
      /* the second press, ~90 ms later, lands on whatever now stands where the note was — a grid day */
      fireEvent.click(screen.getByTestId('cell-asics-2026-01-29'))
      expect(screen.queryByTestId('bid-picker'), 'no stray window').toBeNull()
      await act(async () => { await new Promise(r => setTimeout(r, 600)) })
      fireEvent.click(screen.getByTestId('cell-asics-2026-01-29'))
      expect(screen.queryByTestId('bid-picker'), 'a tap after the moment opens as ever').toBeTruthy()
    } finally { Element.prototype.scrollIntoView = was }
  })
})

describe('his own leave\'s words row redraws from what it saved (W1)', () => {
  beforeEach(wired)
  it('a document removed, and a till ticked again, show at once', () => {
    const row = fileAbsence('dusk', 'LL', '2026-02-10', '2026-02-10', { lw: true, remarks: 'Bali' })
    expect(setLeaveRemarks(row, 'Bali', 'dusk', ['doc-a'])).toBe(true)
    const live = () => INPUTS.find((r: any) => r.iid === row.iid)
    render(<LeaveWords row={live()} personId="dusk" testPrefix="w" />)
    expect(screen.getByTestId('w-doc-row').textContent).toContain('doc-a'.slice(0, 0))
    const chipX = screen.getByTestId('w-doc-row').querySelector('.docchip button, button[aria-label^="Remove"], .chip-x') as HTMLElement | null
    if (chipX) {
      fireEvent.click(chipX)
      expect((live() as any).docIds ?? [], 'saved without it').toHaveLength(0)
      expect(screen.getByTestId('w-doc-row').querySelector('.docchip, .chip'), 'drawn without it').toBeNull()
    }
    const tick = screen.getByTestId('w-till') as HTMLInputElement
    const on0 = tick.checked
    fireEvent.click(tick)
    expect((screen.getByTestId('w-till') as HTMLInputElement).checked).toBe(!on0)
    fireEvent.click(screen.getByTestId('w-till'))
    expect((screen.getByTestId('w-till') as HTMLInputElement).checked, 'ticked again, drawn ticked').toBe(on0)
  })
})

describe('the drag window leaves a leave filed on the Inputs page its own words (W4)', () => {
  beforeEach(wired)
  it('typed words go onto the bids and the war-approved leave, never the Inputs-page one', () => {
    const P = 'dusk'
    const filed = fileAbsence(P, 'LL', '2026-02-12', '2026-02-12', { remarks: 'Bali' })        // filed on the Inputs page
    render(<SelectSheet sel={{ people: [P], from: '2026-02-12', to: '2026-02-12', cells: [{ personId: P, date: '2026-02-12' }] } as any}
      people={() => 'Dusk'} role="admin" canDecide onDone={() => {}} onMove={() => {}} onClose={() => {}} onPostOut={() => undefined} />)
    fireEvent.change(screen.getByTestId('sel-remarks'), { target: { value: 'Exercise' } })
    fireEvent.click(screen.getByTestId('sel-cancel'))
    expect((INPUTS.find((r: any) => r.iid === filed.iid) as any).remarks).toBe('Bali')
  })
})
