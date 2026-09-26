// @vitest-environment jsdom
/* ONE MAN, ONCE PER ROW — THE DOORS (owner, D271, 27 Sep 26 — "Q1 refused", to the five-flags mock-up's Question 1).
   A man put on a row he is already on is refused: nothing is written, the row keeps its one copy, nothing reads pending,
   and the app says why ("Ranger — already on FLIGHT SAFETY STAND-DOWN 08:30–09:00 · not added twice").

   The engine half (the question, the words, the append writer's belt) is engine/crowdself.test.ts. This file walks the
   DOORS, the oilseat-refusal.test.tsx shape: a rule that exists in the engine and is not wired to a door is the class
   of defect the bug-check order was written after. THE DOORS, from the roll-call: the armed palette tap on a crowd's
   "+ add" and on an empty seat of a row he is on (state/view placeArmed) · a drag from the crew list onto the "+ add"
   cell, and onto ANOTHER man's place in a crowd he is already in (his reading (3)) · a drag of a puck from another row
   onto that crowd (a move, and a swap whose OTHER end would be the second copy — both ends judged before either write)
   (ui/drag applyDrop). And the halves that must NOT change: a swap inside one crowd (his reading (2), D274 item 3), a
   move to the end of his own crowd, and a man on two DIFFERENT rows — still planted, still only warned (reading (1)). */
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { App } from './App'
import { initStore, setSession, notify } from '../state/store'
import { DAYS } from '../engine/data'
import { INPUTS } from '../engine/inputs'
import { HOOKS } from '../engine/hooks'
import { SCHED } from '../engine/publish'
import { ensureRowIds } from '../engine/rowids'
import { slotVal, whoArr } from '../engine/slots'
import * as view from '../state/view'
import { applyDrop, setDrag } from './drag'
import { elogClear, elogRows } from '../engine/editlog'
import { validate } from '../engine/validate'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

const $$ = (sel: string) => [...document.querySelectorAll(sel)] as HTMLElement[]
const click = async (el: Element | null) => {
  expect(el, 'click target exists').toBeTruthy()
  await act(async () => { (el as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true })) })
}

let host: HTMLDivElement
let root: Root
const DSNAP = JSON.stringify(DAYS)
const ISNAP = JSON.stringify(INPUTS)
let toasts: string[] = []
const origToast = HOOKS.toast

beforeAll(async () => {
  initStore()
  host = document.createElement('div')
  document.body.appendChild(host)
  root = createRoot(host)
  await act(async () => { root.render(<App />) })
  await act(async () => { setSession({ user: 'ad', role: 'admin' }); notify() })
  await click($$('.nav a[data-page]').find(a => a.dataset.page === 'editsched')!)
  HOOKS.toast = (m: any) => { toasts.push(String(m)) }
})
afterAll(async () => {
  HOOKS.toast = origToast
  await act(async () => { root.unmount() })
  host.remove()
})
beforeEach(async () => {
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
  SCHED.pending = {}; SCHED.changes = {}; SCHED.added = {}; SCHED.dayOK = {}
  ensureRowIds(DAYS)
  elogClear()
  toasts = []
  view.DPREV.clear()          // a day in the preview registry is read-only and would refuse every arm for its own reason
  await act(async () => { view.disarmSlot(); notify() })
})
afterEach(async () => { await act(async () => { view.disarmSlot() }) })

/* Monday's FLIGHT SAFETY STAND-DOWN, 08:30–09:00, with Ranger (bane) on it in the seed */
const FS = 2
const crowd = () => whoArr((DAYS[0] as any).allhands[FS])
const RANGER_TWICE = 'Ranger — already on FLIGHT SAFETY STAND-DOWN 08:30–09:00 · not added twice'
/* nothing written anywhere: the row, the pending marks, the history */
const untouched = (row: string) => {
  expect(JSON.stringify(crowd()), 'the crowd is as it was').toBe(row)
  expect(Object.keys(SCHED.pending).length, 'nothing reads pending').toBe(0)
  expect(elogRows(0).length, 'and no history step').toBe(0)
}
/* the drop hit-tests a live element carrying the address, the same way a finger does */
const dropOn = async (attr: 'data-slot' | 'data-fill', key: string) => {
  const el = document.createElement('div')
  if (attr === 'data-slot') el.className = 'seat'          // applyDrop hit-tests '.sb-slot,.seat[data-slot]'
  el.setAttribute(attr, key)
  document.body.appendChild(el)
  let ok: any
  await act(async () => { ok = applyDrop(el, 0, 0) })
  el.remove()
  return ok
}

describe('the armed palette tap (state/view placeArmed)', () => {
  it("Ranger on his own crowd's armed \"+ add\": refused, said why, nothing written, still armed", async () => {
    const row = JSON.stringify(crowd())
    let took = true, still = ''
    await act(async () => { view.armSlot(`a:0.${FS}.+`); took = view.placeArmed('bane'); still = view.armedKey() })
    expect(took).toBe(false)
    expect(toasts.at(-1)).toBe(RANGER_TWICE)
    untouched(row)
    expect(still, 'the "+ add" stays armed for the next man').toBe(`a:0.${FS}.+`)
  })
  it('another man on the same armed "+ add" still plants — the door is shut only to the man already there', async () => {
    let took = false
    await act(async () => { view.armSlot(`a:0.${FS}.+`); took = view.placeArmed('boosh') })
    expect(took).toBe(true)
    expect(crowd()).toEqual(['bane', 'boosh'])
  })
  it("an armed EMPTY seat of a row he is on — a sim's rear seat, he in its front — is refused the same way", async () => {
    const d: any = DAYS[0]
    d.sims.oft.push({ label: 'X', str: '1500', end: '1600', p: 'boosh', w: '' }); const r = d.sims.oft.length - 1
    ensureRowIds(DAYS); validate()   // a row added the way the app adds one is validated before anyone is asked about it
    let took = true
    await act(async () => { view.armSlot(`s:0.oft.${r}.w`); took = view.placeArmed('boosh') })
    expect(took).toBe(false)
    expect(slotVal(`s:0.oft.${r}.w`), 'the rear seat stays empty').toBe('')
    expect(toasts.at(-1)).toBe('Havoc — already on Sim X 15:00–16:00 · not added twice')
  })
})

describe('the drag door (ui/drag applyDrop)', () => {
  it('from the crew list onto the crowd\'s "+ add" cell: refused, said why, nothing written', async () => {
    const row = JSON.stringify(crowd())
    setDrag({ kind: 'roster', id: 'bane' })
    expect(await dropOn('data-fill', `a:0.${FS}.+`)).toBe(false)
    expect(toasts.at(-1)).toBe(RANGER_TWICE)
    untouched(row)
  })
  it("from the crew list onto ANOTHER man's place in the crowd he is in: refused — that man is not replaced (reading 3)", async () => {
    await act(async () => { view.armSlot(`a:0.${FS}.+`); view.placeArmed('beams') })   // Comet joins: [Ranger, Comet]
    SCHED.pending = {}; elogClear(); toasts = []
    const row = JSON.stringify(crowd())
    setDrag({ kind: 'roster', id: 'bane' })
    expect(await dropOn('data-slot', `a:0.${FS}.1`)).toBe(false)
    expect(toasts.at(-1)).toBe(RANGER_TWICE)
    untouched(row)
    expect(crowd()).toEqual(['bane', 'beams'])
  })
  it("a puck from ANOTHER row onto the crowd he is already in — its cell or a place in it: refused, both rows as they were", async () => {
    const d: any = DAYS[0]
    d.ground.push({ prog: 'ROW A', str: '1300', end: '1400', who: 'bane' }); const g = d.ground.length - 1
    await act(async () => { view.armSlot(`a:0.${FS}.+`); view.placeArmed('beams') })
    SCHED.pending = {}; elogClear(); toasts = []
    const row = JSON.stringify(crowd())
    for (const [attr, key] of [['data-fill', `a:0.${FS}.+`], ['data-slot', `a:0.${FS}.1`]] as const) {
      setDrag({ kind: 'slot', key: `g:0.${g}`, id: 'bane' })
      expect(await dropOn(attr, key), `${attr} ${key}`).toBe(false)
      expect(toasts.at(-1)).toBe(RANGER_TWICE)
      expect(slotVal(`g:0.${g}`), 'the ground row keeps Ranger').toBe('bane')
      untouched(row)
    }
  })
  it("a SWAP whose OTHER end would be the second copy is refused whole — neither end written", async () => {
    /* Comet is on the crowd AND on ROW A; Ranger is on the crowd. Dragging ROW A's Comet onto Ranger's place would swap
       Ranger onto ROW A (fine) and Comet into the crowd — a SECOND Comet there. Judged at both ends before either write. */
    const d: any = DAYS[0]
    d.ground.push({ prog: 'ROW A', str: '1300', end: '1400', who: 'beams' }); const g = d.ground.length - 1
    await act(async () => { view.armSlot(`a:0.${FS}.+`); view.placeArmed('beams') })   // [Ranger, Comet]
    SCHED.pending = {}; elogClear(); toasts = []
    const row = JSON.stringify(crowd())
    setDrag({ kind: 'slot', key: `g:0.${g}`, id: 'beams' })
    expect(await dropOn('data-slot', `a:0.${FS}.0`)).toBe(false)
    expect(toasts.at(-1)).toBe('Comet — already on FLIGHT SAFETY STAND-DOWN 08:30–09:00 · not added twice')
    expect(slotVal(`g:0.${g}`), 'ROW A keeps Comet').toBe('beams')
    untouched(row)
  })
  it("…and the swap's OTHER end: the man swapped OUT would land on a row he is already on — refused whole", async () => {
    /* ROW A: Comet its primary, Ranger an extra. Dragging Comet onto Ranger's place in the crowd moves Comet in (fine —
       he is not in the crowd) and would swap Ranger onto ROW A's primary, where he already stands as the extra. */
    const d: any = DAYS[0]
    d.ground.push({ prog: 'ROW A', str: '1300', end: '1400', who: 'beams', more: ['bane'] }); const g = d.ground.length - 1
    ensureRowIds(DAYS); validate()
    const row = JSON.stringify(crowd())
    setDrag({ kind: 'slot', key: `g:0.${g}`, id: 'beams' })
    expect(await dropOn('data-slot', `a:0.${FS}.0`)).toBe(false)
    expect(toasts.at(-1)).toBe('Ranger — already on ROW A 13:00–14:00 · not added twice')
    expect(d.ground[g].who, 'ROW A keeps Comet').toBe('beams')
    expect(d.ground[g].more, 'and Ranger once, as its extra').toEqual(['bane'])
    untouched(row)
  })
  it('a swap of two men INSIDE one crowd still works, and says nothing about "twice" (reading 2, D274 item 3)', async () => {
    await act(async () => { view.armSlot(`a:0.${FS}.+`); view.placeArmed('beams') })   // [Ranger, Comet]
    toasts = []
    setDrag({ kind: 'slot', key: `a:0.${FS}.0`, id: 'bane' })
    expect(await dropOn('data-slot', `a:0.${FS}.1`)).toBe(true)
    expect(crowd()).toEqual(['beams', 'bane'])
    expect(toasts.join(' | ')).not.toMatch(/twice|already on FLIGHT SAFETY/)
  })
  it('his own puck dropped on the "+ add" of his own crowd moves him to its end — one copy', async () => {
    await act(async () => { view.armSlot(`a:0.${FS}.+`); view.placeArmed('beams') })   // [Ranger, Comet]
    toasts = []
    setDrag({ kind: 'slot', key: `a:0.${FS}.0`, id: 'bane' })
    expect(await dropOn('data-fill', `a:0.${FS}.+`)).toBe(true)
    expect(crowd().filter(Boolean)).toEqual(['beams', 'bane'])
    expect(toasts.join(' | ')).not.toMatch(/twice/)
  })
  it("a ground row's extras: the crew list's man already its primary is refused at the cell", async () => {
    const d: any = DAYS[0]
    d.ground.push({ prog: 'ROW A', str: '1300', end: '1400', who: 'boosh' }); const g = d.ground.length - 1
    ensureRowIds(DAYS); validate()   // a row added the way the app adds one is validated before anyone is asked about it
    setDrag({ kind: 'roster', id: 'boosh' })
    expect(await dropOn('data-fill', `g:0.${g}.+`)).toBe(false)
    expect(toasts.at(-1)).toBe('Havoc — already on ROW A 13:00–14:00 · not added twice')
    expect(d.ground[g].more || [], 'no extra written').toEqual([])
  })
  it(`arm the "+ add", then DRAG: Ranger's refused drop leaves the arm; Havoc's drop lands and puts the arm down (Fable S-23)`, async () => {
    await act(async () => { view.armSlot(`a:0.${FS}.+`) })
    setDrag({ kind: 'roster', id: 'bane' })
    expect(await dropOn('data-fill', `a:0.${FS}.+`)).toBe(false)
    expect(view.armedKey(), 'a refusal is not a placement').toBe(`a:0.${FS}.+`)
    setDrag({ kind: 'roster', id: 'boosh' })
    expect(await dropOn('data-fill', `a:0.${FS}.+`)).toBe(true)
    expect(crowd()).toEqual(['bane', 'boosh'])
    expect(view.armedKey(), "the drop did the arm's job").toBe('')
  })
  it('a man on two DIFFERENT rows at once is still planted and only warned, as today (reading 1)', async () => {
    ;(DAYS[0] as any).allhands[1].end = '0845'                                    // MET + NOTAM now overlaps the stand-down
    setDrag({ kind: 'roster', id: 'nact' })
    expect(await dropOn('data-fill', `a:0.${FS}.+`)).toBe(true)
    expect(crowd()).toContain('nact')
    expect(toasts.join(' | ')).not.toMatch(/twice/)
  })
})
