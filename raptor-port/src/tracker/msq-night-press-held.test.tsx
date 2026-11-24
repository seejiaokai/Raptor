// @vitest-environment jsdom
/* MORE OF A PRESS THAT OUTLIVES ITS GESTURE, AND PICKS LEFT ON DISCARDED BALLS (the night of 24 Nov 26, the blind Opus
   read of the nine fixes — F2, F3).
   F2: a drag held through the switch to the member view. The Tracker is held on 149 for his chart work and covered, but
   the drag stayed alive: its lift saved the layout, the gate refused it (the door on 149, his pages on 142), and "This
   change could not be saved." went up inside the hidden Tracker — unseen, with Logout and every pick dead behind it. The
   hold ends the press, as a pick does.
   F3: Discard from + Add course / + Add syllabus / Rename course keeps him in Edit chart layout (the night's fix 8) but
   kept Connect's first ball, the merge's first line, a half-drawn line and the selections — pointing at balls just
   dropped. The next click made the dropped ball a prerequisite. They go with the discarded edits.
   The harness is msq-night-gestures.test.tsx's. */
import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest'
import { act } from '@testing-library/react'
import { switchRoleView } from '../state/store'
import { isAdmin } from '../state/perms'
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

const recordsOf = (unit: string): Record<string, unknown> =>
  Object.fromEntries(wb.keys('tracker').filter(k => k.startsWith(unit + '@')).sort().map(k => [k, wb.get('tracker', k)]))

describe('a drag held through the switch to the member view (F2)', () => {
  for (const press of presses.filter(p => /drawn line|a ball|group/.test(p.name))) {
    it(`${press.name}: its lift raises no unseen box and saves nothing`, async () => {
      await pick('u149')
      C.toggleArrange()
      await act(async () => { await press.set() })
      const el = press.on()
      expect(el, 'the press has something to land on').toBeTruthy()
      const was149 = recordsOf('u149')
      await act(async () => {
        el.dispatchEvent(ptr('pointerdown', 200, 200, 'mouse'))
        el.dispatchEvent(ptr('pointermove', 260, 240, 'mouse')); window.dispatchEvent(ptr('pointermove', 260, 240, 'mouse'))
      })
      await act(async () => { switchRoleView(); await tick() })
      expect(isAdmin(), 'the premise: the member view').toBe(false)
      expect(S.storageUnit(), 'the premise: the Tracker held on 149').toBe('u149')
      await act(async () => {
        for (const t of [el, document.getElementById('flowSvg'), window]) t?.dispatchEvent(ptr('pointerup', 260, 240, 'mouse'))
        await tick(); await tick()
      })
      expect(C.dlg ?? null, 'no box goes up inside the hidden Tracker').toBeNull()
      expect(recordsOf('u149'), '149\'s saved records untouched').toEqual(was149)
      await act(async () => { switchRoleView(); await settle() })
      expect(C.dlg ?? null).toBeNull()
      expect(C.sylDirty, 'the unfinished press left nothing unsaved').toBe(false)
      if (C.arrangeMode) C.toggleArrange()
      await pick('u142')
    })
  }
})

describe('Discard that keeps him in Edit chart layout drops its picks with the edits (F3)', () => {
  const discardThrough = async (start: () => Promise<unknown>) => {
    await act(async () => {
      const p = start()
      await until(() => C.dlg)
      expect(C.dlg.msg).toContain('unsaved flow edits')
      C.dlgClose(true)   /* Discard */
      for (let i = 0; i < 400 && (!C.dlg || C.dlg.msg.includes('unsaved flow edits')); i++) await tick()
      C.dlgClose(null)   /* the name asked next, cancelled */
      await p
      await settle()
    })
  }
  for (const [what, start] of [
    ['+ Add course', () => C.addCourse()],
    ['+ Add syllabus', () => C.addSyl()],
    ['Rename course', () => C.renCourse()],
  ] as [string, () => Promise<unknown>][]) {
    it(`${what}: Connect armed on a ball then discarded — the next ball clicked gains no prerequisite`, async () => {
      C.toggleArrange()
      await addBall('F3-DROP')
      C.setTool('connect')
      const x = C.byid['F3-DROP'].id as string
      await act(async () => { (document.querySelector(`#flowSvg .ball[data-id="${x}"]`) as SVGElement).dispatchEvent(new MouseEvent('click', { bubbles: true })) })
      await discardThrough(start)
      expect(C.arrangeMode, 'the premise: still in Edit chart layout').toBe(true)
      expect(C.byid['F3-DROP'], 'the premise: the edit is gone').toBeFalsy()
      const other = C.SYL[0]
      const before = JSON.stringify(other.prereqs || [])
      await act(async () => { (document.querySelector(`#flowSvg .ball[data-id="${other.id}"]`) as SVGElement).dispatchEvent(new MouseEvent('click', { bubbles: true })) })
      expect(JSON.stringify(C.byid[other.id].prereqs || []), 'no prerequisite on a ball that was dropped').toBe(before)
      expect(C.sylDirty, 'nothing unsaved by that click').toBe(false)
      C.setTool('move')
    })
  }
})
