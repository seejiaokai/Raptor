// @vitest-environment jsdom
/* A PRESS THAT OUTLIVES ITS GESTURE (the night of 24 Nov 26, the two blind reads of the nine fixes — Opus F1, Astra 2; one
   root). A press on the chart notes the chart and both Undo lists as they stood (core.js notePress), to be put back if the
   press is cancelled by a pick or a question. Undo or Redo pressed with the mouse still down did not end the press:
   - a ball's, a group's and the selection box's listeners died with the redraw, their stop never ran, and every later
     press kept the old note;
   - a line handle's listeners (on the window) lived on.
   A later "Save them" on a pick's question — or the squadron move itself — then cancelled that "press" and laid the old
   note over everything done since: the chart of before the Undo was what got saved, the later edits gone without a word.
   Undo and Redo end the press first (it never happened, as at a pick), and a redraw ends a press whose element it removes.
   Red first: the stored chart held the step that was undone and lacked the ball added after it.
   The harness is msq-night-gestures.test.tsx's. */
import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest'
import { act } from '@testing-library/react'
import { useMsqWorld, signInAs, ACCT } from '../test-support/msq-world'
import * as core from './app/core.js'
import * as st from './storage.js'
import { Whiteboard } from '../storage/whiteboard'
import { trackerTarget } from '../storage/adapters'
import { saveAccess } from '../state/accounts'
import { todayIso } from '../state/units'
import { pageUnit, setTrkUnitProbe } from '../state/perms'
import { pickSquadron } from '../state/pick'
import { wireTrackerPeople } from './peoplewire'

const C: any = core
const S: any = st
const wb = new Whiteboard()
const tick = () => new Promise(r => setTimeout(r, 0))
const until = async (f: () => any) => { for (let i = 0; i < 800; i++) { if (f()) return; await tick() } throw new Error('timed out waiting') }
const settle = async () => { for (let i = 0; i < 4; i++) { await C.whenUnitSettled?.(); await C.whenLoaded(); await tick() } }
const pick = async (u: string) => { await act(async () => { await pickSquadron(u); await settle() }) }
const storedHas = (unit: string, needle: string) => wb.keys('tracker')
  .filter(k => k.startsWith(unit + '@') && !k.includes(':lay')).some(k => String(wb.get('tracker', k)).includes(needle))

let board: HTMLElement | null = null
beforeAll(() => {
  S.setStorageMaker((u: string) => trackerTarget(wb, u), () => pageUnit('own', todayIso()))
  setTrkUnitProbe(() => S.storageUnit())
})
useMsqWorld()
afterAll(() => { board?.remove(); setTrkUnitProbe(null); S.setStorageMaker(null, null); S.setStorageImpl(null) })

beforeEach(async () => {
  signInAs('saber')
  expect(saveAccess(ACCT.hunter, { grants: { u149: 'plan' } })).toBeNull()
  signInAs('hunter')
  if (!board) {
    board = document.createElement('div'); board.id = 'board'; document.body.appendChild(board)
    board.getBoundingClientRect = () => ({ left: 0, top: 0, right: 800, bottom: 600, width: 800, height: 600, x: 0, y: 0, toJSON() { return {} } }) as DOMRect
    Object.defineProperty(board, 'clientWidth', { configurable: true, get: () => 800 })
    Object.defineProperty(board, 'clientHeight', { configurable: true, get: () => 600 })
    wireTrackerPeople()
    await C.init(); await C.whenLoaded()
  }
  await act(async () => { await settle() })
  if (C.dlg) await act(async () => { C.dlgClose(false); await settle() })
  if (C.sylDirty) await C.saveChangesClick()
  if (C.arrangeMode) C.toggleArrange()
  if (S.storageUnit() !== 'u142') await pick('u142')
  await pick('u149'); await pick('u142')
})

const ptr = (type: string, x: number, y: number, kind: string) => {
  const e = new MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y, buttons: 1 })
  Object.defineProperty(e, 'pointerType', { value: kind }); Object.defineProperty(e, 'pointerId', { value: 7 })
  Object.defineProperty(e, 'isPrimary', { value: true })
  return e
}
const $ = (s: string) => document.querySelector('#flowSvg ' + s) as SVGElement
function selectLink() {
  const c = C.SYL.find((e: any) => (e.prereqs || []).length)!
  const hit = [...document.querySelectorAll('#flowSvg .edgehit')].find(x => (x as HTMLElement).dataset.p === c.prereqs[0] && (x as HTMLElement).dataset.c === c.id)!
  hit.dispatchEvent(new MouseEvent('click', { bubbles: true }))
}
async function drawnLine() {
  C.setTool('line')
  const svg = document.getElementById('flowSvg')!
  svg.dispatchEvent(ptr('pointerdown', 300, 300, 'mouse')); svg.dispatchEvent(ptr('pointerup', 300, 300, 'mouse'))
  document.getElementById('flowSvg')!.dispatchEvent(ptr('pointerdown', 420, 420, 'mouse'))
  document.getElementById('flowSvg')!.dispatchEvent(ptr('pointerup', 420, 420, 'mouse'))
  await C.saveChangesClick()
  if (!C.arrangeMode) C.toggleArrange()
  C.setTool('editlines')
  const hit = $('.linehit'); hit.dispatchEvent(ptr('pointerdown', 300, 360, 'mouse')); window.dispatchEvent(ptr('pointerup', 300, 360, 'mouse'))
  $('.linehit').dispatchEvent(new MouseEvent('dblclick', { bubbles: true, cancelable: true, clientX: 340, clientY: 360 }))
  await C.saveChangesClick()
  if (!C.arrangeMode) C.toggleArrange()
  C.setTool('editlines')
  $('.linehit').dispatchEvent(ptr('pointerdown', 340, 360, 'mouse')); window.dispatchEvent(ptr('pointerup', 340, 360, 'mouse'))
}
const addBall = async (name: string) => { await act(async () => { const p = C.addModule('acad'); await until(() => C.dlg); C.dlgClose(name); await p; await settle() }) }

type Press = { name: string, set: () => void | Promise<void>, on: () => Element }
const presses: Press[] = [
  { name: 'a ball', set: () => { C.setTool('move') }, on: () => $('.ball') },
  { name: 'a selected group', set: () => { C.setTool('select') }, on: () => $('.ball') },
  { name: 'a selection box', set: () => { C.setTool('select') }, on: () => document.getElementById('flowSvg')! },
  { name: 'a link\'s bend handle', set: () => { C.setTool('editlines'); selectLink() }, on: () => $('.linehandle') },
  { name: 'a link\'s end handle', set: () => { C.setTool('editlines'); selectLink() }, on: () => $('.endhandle') },
  { name: 'a drawn line\'s bend', set: drawnLine, on: () => $('.lvert') },
  { name: 'a drawn line\'s end', set: drawnLine, on: () => $('.lend') },
]

describe('Undo pressed with a press still held: the press ends there, and nothing later is laid over by its note', () => {
  presses.forEach((press, i) => {
    it(`${press.name}: the Undo stands, the ball added after it is saved by "Save them"`, async () => {
      const STEP = `PU${i}-STEP`, LATER = `PU${i}-LATER`
      C.toggleArrange()
      await act(async () => { await press.set() })
      await addBall(STEP)
      const el = press.on()
      expect(el, 'the press has something to land on').toBeTruthy()
      await act(async () => { el.dispatchEvent(ptr('pointerdown', 200, 200, 'mouse')) })
      await act(async () => { await C.doUndo(); await settle() })
      expect(C.byid[STEP], 'the premise: the Undo took the step back').toBeFalsy()
      expect(C.canRedo(), 'and Redo offers it').toBe(true)
      /* no lift: he carries on */
      await addBall(LATER)
      await act(async () => { const p = pickSquadron('u149'); await until(() => C.dlg); C.dlgClose(true); await p; await settle() })
      expect(S.storageUnit()).toBe('u149')
      expect(storedHas('u142', LATER), 'the ball added after the Undo is saved').toBe(true)
      expect(storedHas('u142', STEP), 'the step undone is not brought back').toBe(false)
      /* the lift, late: nothing more */
      await act(async () => { for (const t of [el, document.getElementById('flowSvg'), window]) t?.dispatchEvent(ptr('pointerup', 200, 200, 'mouse')); await settle() })
      expect(C.sylDirty, '149 is left clean').toBe(false)
      await pick('u142')
      expect(C.byid[LATER], 'back on 142: the later ball is there').toBeTruthy()
      expect(C.byid[STEP]).toBeFalsy()
    })
  })
  it('Redo the same: a ball held through Redo, then "Save them" — the redone step and the later ball are saved', async () => {
    C.toggleArrange(); C.setTool('move')
    await addBall('PR-STEP')
    await act(async () => { await C.doUndo(); await settle() })
    const el = $('.ball')
    await act(async () => { el.dispatchEvent(ptr('pointerdown', 200, 200, 'mouse')) })
    await act(async () => { await C.doRedo(); await settle() })
    expect(C.byid['PR-STEP'], 'the premise: redone').toBeTruthy()
    await addBall('PR-LATER')
    await act(async () => { const p = pickSquadron('u149'); await until(() => C.dlg); C.dlgClose(true); await p; await settle() })
    expect(storedHas('u142', 'PR-STEP')).toBe(true)
    expect(storedHas('u142', 'PR-LATER')).toBe(true)
  })
})
