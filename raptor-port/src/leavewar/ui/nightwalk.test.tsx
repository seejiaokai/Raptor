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
import { docAdd, rowDocIds } from '../../state/docs'

const ISNAP = JSON.stringify(INPUTS)
const TARGET = '2026-01-30'
const bubble = () => screen.queryByTestId('manning-bubble')
/* since D1358 the one note is at the foot always; its Show › stands only while the Manning rows are out of view */
const show = () => screen.queryByTestId('manning-bubble-show')

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
    fireEvent.pointerDown(btn); fireEvent.pointerUp(btn)
    expect(bubble(), 'a tap in the OIL question is not his next tap on the page').toBeTruthy()
    fireEvent.keyDown(btn, { key: 'Enter' })
    expect(bubble(), 'nor a key pressed in it (the code read, R5)').toBeTruthy()
    fireEvent.pointerDown(document.body); fireEvent.pointerUp(document.body)   // a tap: pressed and lifted where it went down (W1 8)
    expect(bubble()).toBeNull()
  })

  it('the Manning button covered by a window over the page counts as in view: the note with no Show (D1358)', () => {
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
      expect(show()).toBeNull()
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
      expect(show()).toBeTruthy()
      fireEvent.click(screen.getByTestId('manning-bubble-show'))
      expect(bubble()).toBeNull()
      /* a key's click (detail 0) on the Manning button at once goes through (the code read, R6) */
      const before = toggle.getAttribute('aria-expanded')
      fireEvent.click(toggle)
      expect(toggle.getAttribute('aria-expanded'), 'the key press folds the rows').not.toBe(before)
      /* the second press, ~90 ms later, lands on whatever now stands where the note was — a grid day */
      fireEvent.click(screen.getByTestId('cell-asics-2026-01-29'), { detail: 1 })   // a finger's or a mouse's click
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
    const docA = docAdd(new Blob(['x'], { type: 'image/png' }) as any).id   // a REAL document: a made-up id was dropped at the save, so nothing was ever there to remove
    expect(docA, 'the document was kept').toBeTruthy()
    expect(setLeaveRemarks(row, 'Bali', 'dusk', [docA])).toBe(true)
    const live = () => INPUTS.find((r: any) => r.iid === row.iid)
    render(<LeaveWords row={live()} personId="dusk" testPrefix="w" />)
    /* THE REMOVAL IS ASKED, NEVER SKIPPED (Astra's read of pull request 845, finding 3, 25 Nov 26): this stood behind
       "if the ✕ is found" after an assertion that the row's text holds '' — with no ✕ found the test passed and proved
       nothing about a document removed */
    expect(rowDocIds(live()), 'the document is on his leave').toEqual([docA])
    const chipX = screen.getByTestId('w-doc-row').querySelector('.docchip .docdel, button[aria-label^="Remove"], .chip-x') as HTMLElement | null   // the ✕ — the chip's name is a button of its own since D1292 (it opens the file)
    expect(chipX, 'the document\'s chip wears its ✕').toBeTruthy()
    fireEvent.click(chipX!)
    expect(rowDocIds(live()), 'saved without it').toHaveLength(0)
    expect(screen.getByTestId('w-doc-row').querySelector('.docchip, .chip'), 'drawn without it').toBeNull()
    const tick = screen.getByTestId('w-till') as HTMLInputElement
    const on0 = tick.checked
    fireEvent.click(tick)
    expect((screen.getByTestId('w-till') as HTMLInputElement).checked).toBe(!on0)
    fireEvent.click(screen.getByTestId('w-till'))
    expect((screen.getByTestId('w-till') as HTMLInputElement).checked, 'ticked again, drawn ticked').toBe(on0)
  })
})

/* CHAT 170'S NIGHT WALK, W3 (25 Nov 26) — the same address on the war's side: the window on one man's cell of a leave
   filed for several keeps the leave it was opened on. Its first save gives him a leave of his own (setLeaveRemarks); the
   window then re-read the SHARED leave by its id — now only the other man's — and drew HIS remark box from it, and its
   next save went there too. It reads and saves his own leave now (inputedit.tsx rowInputOf). */
describe('the window on one man\'s cell of a shared leave follows him to his own leave (chat 170\'s night walk, W3)', () => {
  beforeEach(wired)
  it('two saves with the window open: both on his own leave; the box shows his words, the other man keeps none', async () => {
    const { commitInput } = await import('../../ui/inputedit')
    const D = { type: 'LL', allday: true, half: '', start: '2026-02-10', end: '', sTime: '', eTime: '', remarks: '', sans: null, docIds: [] }
    expect(commitInput(null, D, ['dusk', 'rocky'])).toBe(true)
    const shared = INPUTS.find((r: any) => r.type === 'LL' && r.date === 'Feb 10' && (r.people || []).length === 2) as any
    expect(shared).toBeTruthy()
    render(<LeaveWords row={shared} personId="dusk" testPrefix="w" />)
    const box = () => screen.getByTestId('w-remarks') as HTMLTextAreaElement
    const words = () => INPUTS.filter((r: any) => r.type === 'LL' && r.date === 'Feb 10').map((r: any) => `${(r.people || []).map((e: any) => e.p).join('+')} "${r.remarks || ''}"`).sort()
    fireEvent.change(box(), { target: { value: 'Dental' } }); fireEvent.blur(box())
    expect(words(), 'his first save: a leave of his own').toEqual(['dusk "Dental"', 'rocky ""'])
    expect(box().value, 'the box shows HIS words, never the other man\'s').toBe('Dental')
    fireEvent.change(box(), { target: { value: 'Dental, then gym' } }); fireEvent.blur(box())
    expect(words(), 'his second save reaches his own leave').toEqual(['dusk "Dental, then gym"', 'rocky ""'])
    expect(box().value).toBe('Dental, then gym')
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
