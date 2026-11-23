// @vitest-environment jsdom
/* A PRESS ON THE CHART NEVER CROSSES A CHANGE OF SQUADRON (the night of 24 Nov 26, the fix list's item 1 — Astra's read,
   finding 1). A drag begun on 142's chart and let go after a pick of 149 used to change and save 149's layout: the bend
   handle's window listeners and its edge pan outlived the move. Every kind of press is held here, by mouse and by finger:
   the move and the lift that come after the pick write nothing into either squadron, leave no unsaved mark and no Undo
   step, and the edge pan stops. Read through the real door, as msq-trk-follows-pick.test.tsx does. */
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
const settle = async () => { for (let i = 0; i < 4; i++) { await C.whenUnitSettled?.(); await C.whenLoaded(); await tick() } }
const pick = async (u: string) => { await act(async () => { await pickSquadron(u); await settle() }) }
const recordsOf = (unit: string): Record<string, unknown> =>
  Object.fromEntries(wb.keys('tracker').filter(k => k.startsWith(unit + '@')).sort().map(k => [k, wb.get('tracker', k)]))

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
    /* jsdom lays nothing out: a board with a size, so a pointer at its edge runs the edge pan */
    board.getBoundingClientRect = () => ({ left: 0, top: 0, right: 800, bottom: 600, width: 800, height: 600, x: 0, y: 0, toJSON() { return {} } }) as DOMRect
    Object.defineProperty(board, 'clientWidth', { configurable: true, get: () => 800 })
    Object.defineProperty(board, 'clientHeight', { configurable: true, get: () => 600 })
    wireTrackerPeople()
    await C.init(); await C.whenLoaded()
  }
  await act(async () => { await settle() })
  if (C.sylDirty) await C.saveChangesClick()
  if (C.arrangeMode) C.toggleArrange()
  if (S.storageUnit() !== 'u142') await pick('u142')
  /* 149 read once, so its first read's upgrade flags are no part of what a test compares */
  await pick('u149'); await pick('u142')
})

const ptr = (type: string, x: number, y: number, kind: string) => {
  const e = new MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y, buttons: 1 })
  Object.defineProperty(e, 'pointerType', { value: kind }); Object.defineProperty(e, 'pointerId', { value: 7 })
  Object.defineProperty(e, 'isPrimary', { value: true })
  return e
}
const $ = (s: string) => document.querySelector('#flowSvg ' + s) as SVGElement
/* a chart event with a link into it, and its link's hit line */
function linked() {
  const c = C.SYL.find((e: any) => (e.prereqs || []).length)!
  return { c: c.id as string, p: c.prereqs[0] as string }
}
function selectLink() {
  const { p, c } = linked()
  const hit = [...document.querySelectorAll('#flowSvg .edgehit')].find(x => (x as HTMLElement).dataset.p === p && (x as HTMLElement).dataset.c === c)!
  hit.dispatchEvent(new MouseEvent('click', { bubbles: true }))
}
/* a drawn line, saved, selected in Edit lines: its end and bend squares are on the chart */
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
  /* a bend put on it, saved: its square is what the press lands on */
  $('.linehit').dispatchEvent(new MouseEvent('dblclick', { bubbles: true, cancelable: true, clientX: 340, clientY: 360 }))
  await C.saveChangesClick()
  if (!C.arrangeMode) C.toggleArrange()
  C.setTool('editlines')
  $('.linehit').dispatchEvent(ptr('pointerdown', 340, 360, 'mouse')); window.dispatchEvent(ptr('pointerup', 340, 360, 'mouse'))
}

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

describe('a press under way when another squadron is picked', () => {
  for (const kind of ['mouse', 'touch']) {
    for (const press of presses) {
      it(`${press.name} (${kind}): its move and lift after the pick change nothing in either squadron`, async () => {
        C.toggleArrange()
        await act(async () => { await press.set() })
        const el = press.on()
        expect(el, 'the press has something to land on').toBeTruthy()
        const was142 = recordsOf('u142'), was149 = recordsOf('u149')
        await act(async () => {
          el.dispatchEvent(ptr('pointerdown', 200, 200, kind))
          /* carried to the board's edge: the edge pan is running */
          el.dispatchEvent(ptr('pointermove', 790, 200, kind)); window.dispatchEvent(ptr('pointermove', 790, 200, kind))
        })
        await pick('u149')
        expect(S.storageUnit()).toBe('u149')
        const view0 = document.getElementById('viewport')?.getAttribute('transform')
        await act(async () => {
          for (const t of [el, document.getElementById('flowSvg'), window]) t?.dispatchEvent(ptr('pointermove', 500, 400, kind))
          await new Promise(r => setTimeout(r, 60))   /* a few frames: an edge pan still alive would move the view */
          for (const t of [el, document.getElementById('flowSvg'), window]) t?.dispatchEvent(ptr('pointerup', 500, 400, kind))
          await settle()
        })
        expect(document.getElementById('viewport')?.getAttribute('transform'), 'no edge pan runs on 149').toBe(view0)
        expect(C.sylDirty, '149 is left clean').toBe(false)
        expect(C.canUndo(), 'no Undo step on 149').toBe(false)
        expect(recordsOf('u149'), '149\'s saved records untouched').toEqual(was149)
        await pick('u142')
        expect(recordsOf('u142'), '142\'s saved records untouched').toEqual(was142)
        expect(C.canUndo(), 'the unfinished press left no Undo step on 142').toBe(false)
        expect(C.sylDirty, '142 is left clean').toBe(false)
      })
    }
  }
})
