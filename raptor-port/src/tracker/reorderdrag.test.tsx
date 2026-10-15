// @vitest-environment jsdom
/* [TRK-REORDER-FINGER-DRAG] — the ⇅ Reorder windows' rows drag by finger as well as by mouse (owner D922), built as drawn
   (D924, "All as recommended"): the grip is the app's six dots ⠿; a finger takes a row by its grip only; a mouse drag
   wears the same look — the carried row ringed (`dragging`), ONE landing line in the gap (`dragover`, on the top of the
   row it lands before; `dragover after` only under the last row) — never the old box round the row it would replace;
   and "Drag a row, or use ▲/▼." is gone from all three windows. Written red on the code before it (15 Oct 26).
   jsdom lays nothing out, so each test gives the rows a stack of 40px boxes and answers the hit-test from them. */
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import * as core from './app/core.js'
import { OrdModal } from './components/Modals.jsx'
import { initStore, resetSession } from '../state/store'
import { markLand, pendingLand } from '../ui/lift'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true
const C: any = core
let board: HTMLElement
beforeAll(async () => {
  initStore()
  resetSession({ user: 'ad', role: 'admin' })
  board = document.createElement('div'); board.id = 'board'; document.body.appendChild(board)
  await C.init()
})
afterAll(() => { board.remove() })

const ROW_H = 40, TOP = 100
const origRect = HTMLElement.prototype.getBoundingClientRect
const origEFP = document.elementFromPoint
let host: HTMLElement | null = null
afterEach(async () => {
  HTMLElement.prototype.getBoundingClientRect = origRect
  document.elementFromPoint = origEFP
  markLand('')
  vi.useRealTimers()
  await act(async () => { C.closeOrd() })
  host?.remove(); host = null
})

const rows = () => [...document.querySelectorAll('#ordList .ordrow')] as HTMLElement[]
const names = () => rows().map(r => r.querySelector('.onm')!.textContent)
/* row i spans TOP + i*ROW_H .. +ROW_H; the hit-test answers the row under y */
function layOut() {
  HTMLElement.prototype.getBoundingClientRect = function (this: HTMLElement) {
    if (this.classList.contains('ordrow') && this.parentElement?.id === 'ordList') {
      const i = [...this.parentElement.children].indexOf(this)
      const top = TOP + i * ROW_H
      return { top, bottom: top + ROW_H, left: 0, right: 400, width: 400, height: ROW_H, x: 0, y: top, toJSON() {} } as DOMRect
    }
    if (this.id === 'ordList') {
      const n = this.children.length
      return { top: TOP, bottom: TOP + n * ROW_H, left: 0, right: 400, width: 400, height: n * ROW_H, x: 0, y: TOP, toJSON() {} } as DOMRect
    }
    return origRect.call(this)
  }
  document.elementFromPoint = (_x: number, y: number) => {
    const i = Math.floor((y - TOP) / ROW_H)
    const r = rows()
    return (i >= 0 && i < r.length ? r[i].querySelector('.onm') : document.body) as Element
  }
}
const ptr = (type: string, y: number, kind: 'touch' | 'mouse', x = 20) =>
  new PointerEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y, pointerId: kind === 'touch' ? 7 : 1, pointerType: kind, isPrimary: true, button: 0 })
const win = async (type: string, y: number, kind: 'touch' | 'mouse') => { await act(async () => { window.dispatchEvent(ptr(type, y, kind)) }) }
const yOf = (i: number, frac: number) => TOP + i * ROW_H + ROW_H * frac
async function open(mode: 'syllabus' | 'course' | 'crew' = 'syllabus') {
  await act(async () => { if (mode === 'syllabus') C.openOrd(); else if (mode === 'course') C.openOrdCourse(); else C.openOrdCrew() })
  host = document.createElement('div'); document.body.appendChild(host)
  const root = createRoot(host)
  await act(async () => { root.render(<OrdModal />) })
  layOut()
}
/* a finger takes row `from` by its grip and moves over (row, fraction of its height) */
async function fingerTo(from: number, row: number, frac: number) {
  const grip = rows()[from].querySelector('.grip') as HTMLElement
  await act(async () => { grip.dispatchEvent(ptr('pointerdown', yOf(from, .5), 'touch')) })
  await win('pointermove', yOf(row, frac), 'touch')
}
const lined = () => rows().filter(r => r.classList.contains('dragover'))

describe('D924 — the grip and the words', () => {
  it('every row of all three windows carries the six-dot grip ⠿, not ☰', async () => {
    for (const mode of ['syllabus', 'course', 'crew'] as const) {
      await open(mode)
      expect(rows().length, mode + ': rows drawn').toBeGreaterThan(0)     // the test world holds one course
      for (const r of rows()) expect(r.querySelector('.grip')!.textContent, mode).toBe('⠿')
      await act(async () => { C.closeOrd() }); host!.remove(); host = null
    }
  })
  it('"Drag a row, or use ▲/▼." is gone from all three windows; each one\'s own sentence stays', async () => {
    const kept = { syllabus: 'This sets the order of the Syllabus dropdown for every course.', course: 'This sets the order of the Course dropdown', crew: 'which slice of every ball belongs to whom' }
    for (const mode of ['syllabus', 'course', 'crew'] as const) {
      await open(mode)
      const note = document.querySelector('#ordModal .mini')!.textContent!
      expect(note, mode).not.toMatch(/Drag a row/)
      expect(note, mode).toContain(kept[mode])
      await act(async () => { C.closeOrd() }); host!.remove(); host = null
    }
  })
  it('no row is a browser drag any more — the old box (`over`) has no way to appear', async () => {
    await open()
    for (const r of rows()) expect(r.getAttribute('draggable'), 'native drag gone').toBeNull()
  })
})

describe('D922 / D924 — a finger drags a row by its grip', () => {
  it('carried down: the row is ringed, ONE line on the top of the row it lands before; let go, it lands there', async () => {
    await open()
    const before = names()
    await fingerTo(0, 2, .25)                                   // over the third row's upper half
    expect(rows()[0].classList.contains('dragging'), 'the carried row wears the lift ring').toBe(true)
    expect(lined(), 'one line').toEqual([rows()[2]])
    expect(rows()[2].classList.contains('after'), 'on its top edge').toBe(false)
    await win('pointerup', yOf(2, .25), 'touch')
    expect(names(), 'landed just above the third row').toEqual([before[1], before[0], before[2], ...before.slice(3)])
    expect(rows().some(r => r.classList.contains('dragging') || r.classList.contains('dragover')), 'nothing left marked').toBe(false)
  })
  it('one line a gap: the lower half of a row draws the SAME line as the upper half of the row below', async () => {
    await open()
    await fingerTo(0, 1, .75)                                   // second row, lower half
    expect(lined(), 'drawn on the third row, not the second\'s foot').toEqual([rows()[2]])
    expect(rows()[2].classList.contains('after')).toBe(false)
    await win('pointermove', yOf(2, .25), 'touch')              // third row, upper half — the same gap
    expect(lined()).toEqual([rows()[2]])
    await win('pointercancel', 0, 'touch')
  })
  it('under the last row the line is on its foot, and the row goes last', async () => {
    await open()
    const before = names(), n = before.length
    await fingerTo(0, n - 1, .75)
    expect(lined()).toEqual([rows()[n - 1]])
    expect(rows()[n - 1].classList.contains('after'), 'on the last row\'s foot').toBe(true)
    await win('pointerup', yOf(n - 1, .75), 'touch')
    expect(names(), 'went last').toEqual([...before.slice(1), before[0]])
  })
  it('carried up works too', async () => {
    await open()
    const before = names(), n = before.length
    await fingerTo(n - 1, 0, .25)
    expect(lined()).toEqual([rows()[0]])
    await win('pointerup', yOf(0, .25), 'touch')
    expect(names(), 'went first').toEqual([before[n - 1], ...before.slice(0, n - 1)])
  })
  it('let go on its own place, or in the gap just under itself: nothing moves, no line drawn there', async () => {
    await open()
    const before = names()
    await fingerTo(1, 1, .25)
    expect(lined(), 'no line over the row itself').toEqual([])
    await win('pointermove', yOf(0, .75), 'touch')              // the gap just above it = where it already stands
    expect(lined(), 'no line in the gap it already fills').toEqual([])
    await win('pointerup', yOf(0, .75), 'touch')
    expect(names()).toEqual(before)
  })
  it('a finger elsewhere on the row (its name) does not take it — that finger scrolls the list', async () => {
    await open()
    const before = names()
    const name = rows()[0].querySelector('.onm') as HTMLElement
    await act(async () => { name.dispatchEvent(ptr('pointerdown', yOf(0, .5), 'touch')) })
    await win('pointermove', yOf(2, .25), 'touch')
    expect(rows().some(r => r.classList.contains('dragging')), 'not carried').toBe(false)
    await win('pointerup', yOf(2, .25), 'touch')
    expect(names()).toEqual(before)
  })
  it('a cancelled touch, or Escape, puts it all back and leaves the window open', async () => {
    await open()
    const before = names()
    await fingerTo(0, 2, .25)
    await win('pointercancel', yOf(2, .25), 'touch')
    expect(names()).toEqual(before)
    expect(lined()).toEqual([])
    await fingerTo(0, 2, .25)
    await act(async () => { window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })) })
    expect(rows().some(r => r.classList.contains('dragging') || r.classList.contains('dragover')), 'the drag is off').toBe(false)
    expect(document.querySelector('#ordModal'), 'Escape ended the drag, not the window').not.toBeNull()
    await win('pointerup', yOf(2, .25), 'touch')
    expect(names(), 'and the release after it moves nothing').toEqual(before)
  })
  it('the row that moved flashes where it landed (the app\'s landing mark)', async () => {
    await open()
    const before = names()
    await fingerTo(0, 2, .25)
    await win('pointerup', yOf(2, .25), 'touch')
    const landed = rows().find(r => r.querySelector('.onm')!.textContent === before[0])!
    expect(landed.classList.contains('lift-land'), 'it flashes').toBe(true)
    expect(pendingLand() === null || landed.classList.contains('lift-land')).toBe(true)
  })
})

describe('D924 — a mouse drag wears the same look', () => {
  it('a mouse takes a row anywhere on it, and draws the ring and one line — no box', async () => {
    await open()
    const before = names()
    const name = rows()[0].querySelector('.onm') as HTMLElement
    await act(async () => { name.dispatchEvent(ptr('pointerdown', yOf(0, .5), 'mouse')) })
    await win('pointermove', yOf(2, .25), 'mouse')
    expect(rows()[0].classList.contains('dragging')).toBe(true)
    expect(lined()).toEqual([rows()[2]])
    expect(rows().some(r => r.classList.contains('over')), 'never the old box').toBe(false)
    await win('pointerup', yOf(2, .25), 'mouse')
    expect(names()).toEqual([before[1], before[0], before[2], ...before.slice(3)])
  })
  it('a mouse click (no move) is not a drag, and ▲ ▼ still move a row', async () => {
    await open()
    const before = names()
    const down = rows()[0].querySelector('button[title="Move down"]') as HTMLButtonElement
    await act(async () => { down.dispatchEvent(ptr('pointerdown', yOf(0, .5), 'mouse')) })
    await win('pointerup', yOf(0, .5), 'mouse')
    expect(rows().some(r => r.classList.contains('dragging')), 'a click is no drag').toBe(false)
    await act(async () => { down.click() })
    expect(names()).toEqual([before[1], before[0], ...before.slice(2)])
  })
  it('a drop is not saved until Save order — Cancel leaves the dropdown as it was', async () => {
    await open()
    const saved = C.orderedSylNames()
    await fingerTo(0, 2, .25)
    await win('pointerup', yOf(2, .25), 'touch')
    expect(C.orderedSylNames(), 'nothing saved by the drop itself').toEqual(saved)
  })
})
