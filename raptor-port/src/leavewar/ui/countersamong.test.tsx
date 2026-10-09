// @vitest-environment jsdom
/* IN REARRANGE A COUNTER ROW CAN BE DROPPED ANYWHERE AMONG THE FOUR FIXED ROWS (owner, D674, 8 Oct 26 — "Can rearrange
   allow newly created counter rows be allowed to moved to anywhere in between the fixed blue dot rows? Even to below
   the 4 as well. When I try to drag and drop them"). `OUTSTANDING.md` `[LW-COUNTERS-AMONG-FIXED]`.

   The SCREEN's half: the block draws its rows in the one order, each of the four is a place to drop while an admin
   rearranges, and the four themselves carry no grip and no cross (reading 1). The order's meaning is
   engine/fixedrows.test.ts; the store's move, its saving and its Undo are ../countersamong.test.ts; the drag in a real
   browser — a mouse and a finger — is e2e/leavewar.spec.ts "a counter row is dragged between the fixed rows…". */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { storeBackend } from '../../engine/hooks'
import { initStore as raptorInitStore } from '../../state/store'
import { setSession } from '../../state/auth'
import { installGlobalUndo } from '../../state/undo-wire'
import { _resetTimeline } from '../../undo/timeline'
import { globalUndo } from '../../undo'
import { FIXED_ROWS, type ManningRule } from '../engine'
import { initStore as lwInitStore, manningBlockOrder, moveManningRowTo, saveManningRule, setPeople, setRole } from '../state/store'
import { memoryBackend } from '../state/storage'
import { projectPeople } from '../state/raptorRoster'
import { Matrix } from './Matrix'

const [RP, RW, AP, AW] = FIXED_ROWS
const TUE = '2026-01-06'
const rule = (id: string, seat: 'pilot' | 'wso'): ManningRule =>
  ({ id, label: id.toUpperCase(), count: { kind: 'people', filter: { seats: [seat] } }, threshold: { amber: 99, red: 98 } })

const mem = new Map<string, string>()
const origEFP = document.elementFromPoint
beforeEach(() => {
  mem.clear()
  storeBackend.impl = { getItem: (k: string) => mem.get(k) ?? null, setItem: (k: string, v: string) => { if (v === 'null') mem.delete(k); else mem.set(k, v) }, keys: () => [...mem.keys()] } as any
  raptorInitStore()
  setSession({ user: 'admin-test', role: 'admin' })
  _resetTimeline(); installGlobalUndo()
  lwInitStore(memoryBackend())
  setRole('admin')
  setPeople(projectPeople())
  for (const r of [rule('a', 'pilot'), rule('b', 'wso'), rule('c', 'pilot')]) saveManningRule(r)
})
afterEach(() => { cleanup(); document.elementFromPoint = origEFP; setSession(null); storeBackend.impl = null; _resetTimeline() })

const REQ_P = 'fly-row-req-p', REQ_W = 'fly-row-req-w', AV_P = 'fly-row-avail-p', AV_W = 'fly-row-avail-w'
/** the rows of the Manning block, top to bottom, by their own ids */
const rowsOfBlock = () => [...document.querySelector('tbody.counts')!.querySelectorAll(':scope > tr')].map(tr => tr.getAttribute('data-testid') ?? '')
const arrange = () => { render(<Matrix />); fireEvent.click(screen.getByTestId('roster-arrange')) }

describe('the Manning block draws its rows in the one order', () => {
  it('to start with: the counters, then the four (reading 4)', () => {
    render(<Matrix />)
    expect(rowsOfBlock()).toEqual(['count-a', 'count-b', 'count-c', REQ_P, REQ_W, AV_P, AV_W])
  })
  it('a counter between each pair of fixed rows, and one below all four — for an admin, in Rearrange, and for a member', () => {
    moveManningRowTo('a', RW); moveManningRowTo('b', AW); moveManningRowTo('c', null)
    const want = [REQ_P, 'count-a', REQ_W, AV_P, 'count-b', AV_W, 'count-c']
    render(<Matrix />)
    expect(rowsOfBlock()).toEqual(want)
    fireEvent.click(screen.getByTestId('roster-arrange'))
    expect(rowsOfBlock()).toEqual(want)
    cleanup()
    setRole('member')
    render(<Matrix />)
    expect(rowsOfBlock()).toEqual(want)
  })
  it('the screen follows a move at once, and its Undo', () => {
    render(<Matrix />)
    act(() => { moveManningRowTo('b', AP) })
    expect(rowsOfBlock()).toEqual(['count-a', 'count-c', REQ_P, REQ_W, 'count-b', AV_P, AV_W])
    act(() => { expect(globalUndo().ok).toBe(true) })
    expect(rowsOfBlock()).toEqual(['count-a', 'count-b', 'count-c', REQ_P, REQ_W, AV_P, AV_W])
  })
  it('each row is drawn once, and the four keep their cells: a figure is still read where a counter sits between', () => {
    moveManningRowTo('a', RW); moveManningRowTo('b', null)
    render(<Matrix />)
    for (const id of ['count-a', 'count-b', 'count-c', REQ_P, REQ_W, AV_P, AV_W]) expect(screen.getAllByTestId(id).length, id).toBe(1)
    for (const r of ['req-p', 'req-w', 'avail-p', 'avail-w']) expect(screen.getByTestId(`${r}-${TUE}`).closest('tr')!.getAttribute('data-testid')).toBe(`fly-row-${r}`)
    expect(Number(screen.getByTestId(`avail-p-${TUE}`).textContent)).toBeGreaterThan(0)
    expect(screen.getByTestId(`count-a-${TUE}`).closest('tr')!.getAttribute('data-testid')).toBe('count-a')
  })
  it('the Manning button folds the whole block away — the counters below the four with it — and brings it back as it was', () => {
    moveManningRowTo('a', null)
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('counts-toggle'))
    expect(document.querySelector('tbody.counts')).toBeNull()
    fireEvent.click(screen.getByTestId('counts-toggle'))
    expect(rowsOfBlock()).toEqual(['count-b', 'count-c', REQ_P, REQ_W, AV_P, AV_W, 'count-a'])
  })
})

describe('in Rearrange (reading 1)', () => {
  it('each of the four is a place to drop — and carries no grip and no cross, wherever the counters sit', () => {
    moveManningRowTo('a', RW); moveManningRowTo('b', null)
    arrange()
    const tokens: Record<string, string> = { [REQ_P]: RP, [REQ_W]: RW, [AV_P]: AP, [AV_W]: AW }
    for (const [tid, token] of Object.entries(tokens)) {
      const tr = screen.getByTestId(tid)
      expect(tr.getAttribute('data-mrow'), tid).toBe(token)
      expect(tr.querySelector('.drag, .mrow-btn, [data-testid^="manning-drag-"], [data-testid^="manning-delete-"]'), tid).toBeNull()
    }
    /* the counters keep theirs — the one between two fixed rows and the one below all four too */
    for (const id of ['a', 'b', 'c']) {
      expect(screen.getByTestId(`count-${id}`).getAttribute('data-mrow')).toBe(id)
      expect(screen.getByTestId(`manning-drag-${id}`)).toBeTruthy(); expect(screen.getByTestId(`manning-delete-${id}`)).toBeTruthy()
    }
  })
  it('outside Rearrange, and for a member, no row is a place to drop', () => {
    render(<Matrix />)
    expect(document.querySelector('tbody.counts [data-mrow]')).toBeNull()
    cleanup()
    setRole('member')
    render(<Matrix />)
    expect(document.querySelector('tbody.counts [data-mrow]')).toBeNull()
    expect(screen.queryByTestId('roster-arrange')).toBeNull()
  })
  it('an Available row\'s name still opens its form, and a Required cell is still a Required cell, with a counter between them', () => {
    moveManningRowTo('a', AP)
    arrange()
    expect(screen.getByTestId('fly-name-avail-p')).toBeTruthy()
    expect(screen.getByTestId(`req-w-${TUE}`).className).toMatch(/\breq\b/)
  })
})

/* THE DRAG ITSELF, as far as jsdom can carry it: there is no layout, so the pointer's row is answered for it and a
   zero-height row reads as "its upper half" (Matrix.tsx startRowDrag). The real thing is the browser test. */
describe('the drag lands a counter among the four', () => {
  const over = (tid: string) => { document.elementFromPoint = () => screen.getByTestId(tid).querySelector('td.who') as Element }
  const press = (id: string) => fireEvent.pointerDown(screen.getByTestId(`manning-drag-${id}`), { button: 0 })
  const moveTo = (y = 0) => act(() => { window.dispatchEvent(new MouseEvent('pointermove', { clientX: 5, clientY: y, bubbles: true })) })
  const lift = () => act(() => { window.dispatchEvent(new MouseEvent('pointerup', { bubbles: true })) })

  it('over the upper half of Required W: the landing bar shows on that row, and the counter lands between Required P and Required W', () => {
    arrange()
    press('a'); over(REQ_W); moveTo()
    expect(screen.getByTestId(REQ_W).className).toMatch(/\bdragover\b/)
    expect(screen.getByTestId(REQ_W).className).not.toMatch(/\bafter\b/)
    expect(screen.getByTestId(REQ_P).className).not.toMatch(/\bdragover\b/)
    lift()
    expect(manningBlockOrder()).toEqual(['b', 'c', RP, 'a', RW, AP, AW])
    expect(rowsOfBlock()).toEqual(['count-b', 'count-c', REQ_P, 'count-a', REQ_W, AV_P, AV_W])
    expect(screen.getByTestId(REQ_W).className).not.toMatch(/\bdragover\b/)        // the bar is gone with the drop
  })
  it('over the LOWER half of Available W — the last row: the bar shows under it, and the counter lands below all four', () => {
    arrange()
    const last = screen.getByTestId(AV_W)
    last.getBoundingClientRect = () => ({ top: 100, bottom: 120, left: 0, right: 300, width: 300, height: 20, x: 0, y: 100, toJSON() {} }) as DOMRect
    press('b'); over(AV_W); moveTo(118)
    expect(screen.getByTestId(AV_W).className).toMatch(/\bdragover after\b/)
    lift()
    expect(manningBlockOrder()).toEqual(['a', 'c', RP, RW, AP, AW, 'b'])
    expect(rowsOfBlock()).toEqual(['count-a', 'count-c', REQ_P, REQ_W, AV_P, AV_W, 'count-b'])
  })
  it('over the lower half of Required P: "after it" is "before the row that follows it" — between Required P and Required W', () => {
    arrange()
    const row = screen.getByTestId(REQ_P)
    row.getBoundingClientRect = () => ({ top: 40, bottom: 60, left: 0, right: 300, width: 300, height: 20, x: 0, y: 40, toJSON() {} }) as DOMRect
    press('c'); over(REQ_P); moveTo(58)
    lift()
    expect(manningBlockOrder()).toEqual(['a', 'b', RP, 'c', RW, AP, AW])
  })
  it('a counter below the four is dragged back above them', () => {
    moveManningRowTo('a', null)
    arrange()
    press('a'); over(REQ_P); moveTo()
    lift()
    expect(manningBlockOrder()).toEqual(['b', 'c', 'a', RP, RW, AP, AW])
  })
  it('a fixed row cannot be picked up: it has nothing to press, and a drop on itself moves nothing', () => {
    arrange()
    expect(document.querySelector('[data-testid^="manning-drag-@"]')).toBeNull()
    press('a'); over('count-a'); moveTo()
    lift()
    expect(manningBlockOrder()).toEqual(['a', 'b', 'c', RP, RW, AP, AW])
  })
})
