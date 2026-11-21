// @vitest-environment jsdom
/* TRKSAVE (the reshape walk RS, item (b), 22 Nov 26) — AFTER A REFUSED CHART MOVE, THE TRACKER'S UNDO MUST NOT LIGHT
   "✓ Save changes" FOR NOTHING, AND THE CORNER MUST NEVER READ "saved" FOR IT.
   The walk, Ranger moving 142 → 149 from Thu 16, at 23:56 in Edit chart layout: ACG-06 dragged (saved); past midnight
   ACG-05 dragged — refused, "This change could not be saved." said; a DCO on ACG-05 refused likewise; then the Tracker's
   Undo, and "✓ Save changes" came up; pressed, the corner read "● saved" with nothing stored.
   The refusal is the gate's own (state/perms.ts trkUnitViolation, the Tracker's squadron probe answering 149's while
   Hunter, 142's admin, is signed in), as in msq-warfix-trk-refused.test.tsx. The drag is the real one: pointer events
   on the ball, by mouse (desktop) and by finger (phone). Its own file so the Tracker engine boots fresh. */
import { beforeAll, afterAll, afterEach, describe, expect, it } from 'vitest'
import * as core from './app/core.js'
import { storeBackend } from '../engine/hooks'
import { initStore, resetSession, notify } from '../state/store'
import { accountsLoad, signIn, sessionFor } from '../state/accounts'
import { setUnitSeeds, unitsLoad } from '../state/units'
import { setTrkUnitProbe } from '../state/perms'

const C: any = core
const NOT_SAVED = 'This change could not be saved.'
const tick = () => new Promise(r => setTimeout(r, 0))
const until = async (f: () => any) => { for (let i = 0; i < 500; i++) { if (f()) return; await tick() } throw new Error('timed out waiting for a dialog') }
async function said(v: any = true) { await until(() => C.dlg); const m = C.dlg.msg; C.dlgClose(v); await tick(); return m }
const mem: Record<string, string> = {}
const signInAs = (name: string, pass: string) => { resetSession(sessionFor(signIn(name, pass))); notify() }

const ball = (id: string) => [...document.querySelectorAll('#flowSvg .ball')].find(x => (x as HTMLElement).dataset.id === id) as SVGGElement
/* a drag on a ball by pointer events, as a mouse or a finger sends them (a finger is also heard by the board) */
function drag(id: string, dx: number, kind: 'mouse' | 'touch', pid: number) {
  const g = ball(id)
  const ev = (type: string, x: number, y: number) => {
    const e = new MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y })
    Object.defineProperty(e, 'pointerType', { value: kind }); Object.defineProperty(e, 'pointerId', { value: pid })
    Object.defineProperty(e, 'isPrimary', { value: true })
    return e
  }
  g.dispatchEvent(ev('pointerdown', 100, 100))
  g.dispatchEvent(ev('pointermove', 100 + dx / 2, 100))
  g.dispatchEvent(ev('pointermove', 100 + dx, 100))
  g.dispatchEvent(ev('pointerup', 100 + dx, 100))
}
/* what is stored for the chart's layout, as the store holds it */
const storedLayout = () => { const k = Object.keys(mem).filter(x => /:lay:/.test(x)); return k.map(x => mem[x]).join('|') }

let board: HTMLElement
beforeAll(async () => {
  storeBackend.impl = { getItem: (k: string) => (k in mem ? mem[k]! : null), setItem: (k: string, v: string) => { if (v === 'null') delete mem[k]; else mem[k] = v }, keys: () => Object.keys(mem) } as any
  setUnitSeeds(true)
  initStore(); accountsLoad(); unitsLoad()
  signInAs('ad2', 'a2')                                     // Hunter, 142's admin
  board = document.createElement('div'); board.id = 'board'; document.body.appendChild(board)
  await C.init()
  await C.whenLoaded()
  if (C.sylDirty) await C.saveChangesClick()
})
afterEach(async () => {
  setTrkUnitProbe(null)
  while (C.dlg) { C.dlgClose(true); await tick() }
  if (C.sylDirty) await C.saveChangesClick()
  while (C.dlg) { C.dlgClose(true); await tick() }
  if (C.arrangeMode) C.toggleArrange()
})
afterAll(() => { board.remove(); setTrkUnitProbe(null); storeBackend.impl = null })

async function walk(kind: 'mouse' | 'touch') {
  if (!C.arrangeMode) C.toggleArrange()
  C.setTool('move'); C.renderBoard(); await tick()
  const [a, b] = C.SYL.filter((e: any) => ball(e.id)).slice(kind === 'mouse' ? 2 : 4).map((e: any) => e.id)
  /* before midnight: a ball moved in his own squadron's Tracker saves */
  drag(a, 40, kind, 1); await tick(); await tick()
  expect(C.dlg, 'his own move: no box').toBeNull()
  const stored = storedLayout()
  const undoLen = C.canUndo()
  expect(undoLen, 'his own move is a step').toBe(true)
  /* past midnight: the Tracker is no longer his squadron's */
  setTrkUnitProbe(() => 'u149')
  drag(b, 40, kind, 2)
  expect(await said(), 'the refused move is said').toBe(NOT_SAVED)
  await tick()
  expect(storedLayout(), 'nothing stored for the refused move').toBe(stored)
  expect(C.sylDirty, 'a refused move lights no "✓ Save changes"').toBe(false)
  /* a DCO on the refused ball's event, refused and said (the walk's next press) */
  C.openPop(b, { clientX: 5, clientY: 5 }); const g = C.popGrade('dco')
  expect(await said(), 'the refused DCO is said').toBe(NOT_SAVED)
  await g; await tick()
  /* the Tracker's Undo now: the refused move left no step behind, so the step it takes back is his own move — refused
     too in this Tracker, and said */
  const p = C.doUndo()
  expect(await said(), 'the Undo takes back his own move, which is refused here, and said').toBe(NOT_SAVED)
  expect(await p).toBe(false)
  await tick()
  expect(C.sylDirty, 'no "✓ Save changes" after the Undo').toBe(false)
  expect(storedLayout()).toBe(stored)
  /* and were "✓ Save changes" pressed now, the corner never reads "saved" for a chart nobody changed */
  await C.saveChangesClick(); await tick()
  expect(C.saveWords().text, 'the corner never reads "saved"').not.toMatch(/ saved$/)
}

describe('TRKSAVE — a refused chart move leaves no step behind, and "✓ Save changes" never says saved for nothing', () => {
  it('by mouse (desktop)', async () => { await walk('mouse') })
  it('by finger (phone)', async () => { await walk('touch') })
})
