// @vitest-environment jsdom
/* UNDO AND REDO PRESSED WITH THE CARET STILL IN A BOX LET IT GO FIRST (ui/topbits.tsx globalUndoEngine — the narrow read
   of the D994 batch's fix round, round 2, 19 Oct 26, its F1; older than the batch, reproduced on the built app).
   An In-time line emptied, the caret moved on to the next line, Undo pressed WITHOUT the focus moving (a tap on Safari
   never moves it; the button is clicked here as jsdom clicks, the focus staying put), then that line left: the held line
   still carried its address from before the Undo, and leaving it wrote it over the line Undo had brought back — one line
   lost, another doubled. The page's and the board's Undo are pressed through the DOM, on the real one undo (the wiring
   below is oilundo-button.test.tsx's). */
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { App } from './App'
import { DAYS } from '../engine/data'
import { INPUTS } from '../engine/inputs'
import { SCHED } from '../engine/publish'
import { ensureRowIds } from '../engine/rowids'
import { initStore, wireStore, weekstashStore, notify } from '../state/store'
import { setSession } from '../state/auth'
import { schedStore, schedPostRestore } from '../state/sched-commit'
import { setPage } from '../state/view'
import { installUndo, registerUndoStore, setCutoverModules, setUndoHooks } from '../undo'
import { _resetTimeline } from '../undo/timeline'
import { openScheduler } from './board'
import { txtGet } from '../engine/slots'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

const SCHED_COLLS = ['days', 'sched.book', 'sched.mutes', 'sched.week', 'sched.issuance', 'sched.retraction', 'inputs', 'plan', 'notices', 'weekstash']
const DSNAP = JSON.stringify(DAYS)
const editableDescriptor = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'isContentEditable')
let host: HTMLDivElement
let root: Root
const $ = (sel: string) => { const el = document.querySelector(sel) as HTMLElement | null; expect(el, sel).toBeTruthy(); return el! }
const tick = () => act(async () => { await new Promise(r => setTimeout(r, 15)) })
const focus = (el: HTMLElement) => act(async () => { el.focus() })
const press = async (sel: string) => {
  const b = $(sel) as HTMLButtonElement
  expect(b.disabled, `${sel} is not greyed out`).toBe(false)
  await act(async () => { b.click() }); await tick(); await tick()
}
const lines = () => [...(DAYS[0].waves[0] as any).intimes]

beforeAll(() => {
  // jsdom does not implement this browser property (as schedule-tab.test.tsx supplies it)
  Object.defineProperty(HTMLElement.prototype, 'isContentEditable', { configurable: true, get() {
    let el: HTMLElement | null = this
    while (el) { if (el.hasAttribute('contenteditable')) return el.getAttribute('contenteditable') !== 'false'; el = el.parentElement }
    return false
  } })
  host = document.createElement('div'); document.body.appendChild(host)
  root = createRoot(host)
})
afterAll(async () => {
  await act(async () => { root.unmount() }); host.remove()
  if (editableDescriptor) Object.defineProperty(HTMLElement.prototype, 'isContentEditable', editableDescriptor)
  else delete (HTMLElement.prototype as any).isContentEditable
})
beforeEach(async () => {
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  /* before the store and the one undo take their baseline — the lines are the day as it stood, not a change */
  ;(DAYS[0].waves[0] as any).intimes = ['A 07:00H', 'B 07:30H', 'C 08:00H']
  INPUTS.length = 0
  SCHED.pending = {}; SCHED.changes = {}; SCHED.added = {}; SCHED.als = []
  SCHED.al = 0; SCHED.dayOK = {}; SCHED.sign = {}; SCHED.orig = {}; SCHED.cur = {}
  setSession({ user: 'ad', role: 'admin' } as any)
  wireStore(); initStore(); ensureRowIds(DAYS)
  _resetTimeline(); installUndo()
  setUndoHooks({ postRestore: schedPostRestore })
  registerUndoStore(schedStore, SCHED_COLLS)
  registerUndoStore(weekstashStore, ['weekstash'])
  setCutoverModules(['sched', 'inputs', 'plan'])
  await act(async () => { root.render(<App />) })
  await act(async () => { setPage('editsched'); notify() })
})
afterEach(async () => { await act(async () => { (document.activeElement as HTMLElement)?.blur?.() }); await tick(); _resetTimeline() })

describe('Undo pressed with the caret still in a box lets it go first', () => {
  it('the week: an In-time line emptied, the caret on the next, Undo — every line back, none doubled', async () => {
    const a = $('#eWeek [data-itline="0|0|0"]'), b = $('#eWeek [data-itline="0|0|1"]')
    await focus(a); a.textContent = ''
    await focus(b); await tick()
    expect(lines(), 'A gone when it was left empty').toEqual(['B 07:30H', 'C 08:00H'])
    await press('#undoBtn')
    await act(async () => { (document.activeElement as HTMLElement)?.blur() }); await tick()
    expect(lines(), 'all three back, in order').toEqual(['A 07:00H', 'B 07:30H', 'C 08:00H'])
  })
  it('the Scheduler Board: the same', async () => {
    await act(async () => { openScheduler(0); notify() }); await tick()
    const a = $('#sbBoard [data-itline="0|0|0"]'), b = $('#sbBoard [data-itline="0|0|1"]')
    await focus(a); a.textContent = ''
    await focus(b); await tick()
    expect(lines()).toEqual(['B 07:30H', 'C 08:00H'])
    await press('#sbUndo')
    await act(async () => { (document.activeElement as HTMLElement)?.blur() }); await tick()
    expect(lines(), 'all three back, in order').toEqual(['A 07:00H', 'B 07:30H', 'C 08:00H'])
  })
  it('a time typed and not yet left, then Undo: the typing is what is taken back, and Redo puts it back', async () => {
    const br = () => $('#eWeek .day[data-day="0"] [data-txt="ff:0.0.0.br"]')
    // a first time, saved, so there is an Undo on offer
    await focus(br()); br().textContent = '0815'; await act(async () => { br().blur() }); await tick()
    expect(txtGet('ff:0.0.0.br')).toBe('08:15')
    // a second time typed and NOT left, then Undo: the press saves it, then takes it back
    await focus(br()); br().textContent = '0830'
    await press('#undoBtn')
    expect(txtGet('ff:0.0.0.br'), 'the typing just done is what is undone').toBe('08:15')
    expect(br().textContent, 'and the box shows it').toBe('08:15')
    await press('#redoBtn')
    expect(txtGet('ff:0.0.0.br'), 'Redo puts it back').toBe('08:30')
  })
})
