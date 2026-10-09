// @vitest-environment jsdom
/* A COUNTER ROW CAN SIT ANYWHERE AMONG THE FOUR FIXED ROWS (owner, D674, 8 Oct 26 — "Can rearrange allow newly created
   counter rows be allowed to moved to anywhere in between the fixed blue dot rows? Even to below the 4 as well.").
   `OUTSTANDING.md` `[LW-COUNTERS-AMONG-FIXED]`.

   The store's half: the move, who may make it, that it is saved and undone, and that nothing which READS the four rows
   cares where they sit. The saved list's meaning is engine/fixedrows.test.ts; the screen is ui/countersamong.test.tsx.
   The four readings told to him: (1) the four keep their own order, carry no grip and no cross — only counters move;
   (2) every counter may go anywhere; (3) one order for the squadron, saved, and undone by the app's Undo; (4) a
   squadron that has never moved a counter among them sees what it saw — its counters above the four. */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { storeBackend } from '../engine/hooks'
import { initStore as raptorInitStore } from '../state/store'
import { setSession } from '../state/auth'
import { installGlobalUndo } from '../state/undo-wire'
import { _resetTimeline } from '../undo/timeline'
import { globalRedo, globalUndo } from '../undo'
import { FIXED_ROWS, evaluateDay, type ManningRule } from './engine'
import {
  availRules, deleteManningRule, getState, initStore as lwInitStore, manningBlockOrder, manningRowIds, moveManningRow,
  moveManningRowTo, orderedManningIds, resetManning, saveManningRule, setPeople, setRole,
} from './state/store'
import { memoryBackend } from './state/storage'
import { projectPeople } from './state/raptorRoster'
import { dayFacts } from './sync'

const [RP, RW, AP, AW] = FIXED_ROWS
const TUE = '2026-01-06'
const rule = (id: string, seat: 'pilot' | 'wso'): ManningRule =>
  ({ id, label: id.toUpperCase(), count: { kind: 'people', filter: { seats: [seat] } }, threshold: { amber: 99, red: 98 } })
const three = () => { for (const r of [rule('a', 'pilot'), rule('b', 'wso'), rule('c', 'pilot')]) expect(saveManningRule(r)).toBe(true) }

const mem = new Map<string, string>()
let backend = memoryBackend()
beforeEach(() => {
  mem.clear()
  storeBackend.impl = { getItem: (k: string) => mem.get(k) ?? null, setItem: (k: string, v: string) => { if (v === 'null') mem.delete(k); else mem.set(k, v) }, keys: () => [...mem.keys()] } as any
  raptorInitStore()
  setSession({ user: 'admin-test', role: 'admin' })
  _resetTimeline(); installGlobalUndo()
  backend = memoryBackend()
  lwInitStore(backend)
  setRole('admin')
  setPeople(projectPeople())
  three()
})
afterEach(() => { setSession(null); storeBackend.impl = null; _resetTimeline() })
/** a reload on the same storage */
const reload = () => { lwInitStore(backend); setRole('admin'); setPeople(projectPeople()) }

describe('to start with (reading 4)', () => {
  it('the counters stand above the four, in the order they were made', () => {
    expect(manningBlockOrder()).toEqual(['a', 'b', 'c', RP, RW, AP, AW])
    expect(orderedManningIds()).toEqual(['a', 'b', 'c'])
  })
  it('moving a counter among the other counters saves what it always saved — no fixed row in the list', () => {
    moveManningRowTo('c', 'a')
    expect(manningBlockOrder()).toEqual(['c', 'a', 'b', RP, RW, AP, AW])
    expect(getState().manningOrder).toEqual(['c', 'a', 'b'])
  })
})

describe('a counter dropped among the four (readings 1 and 2)', () => {
  it('before Required W: it sits between Required P and Required W', () => {
    moveManningRowTo('a', RW)
    expect(manningBlockOrder()).toEqual(['b', 'c', RP, 'a', RW, AP, AW])
  })
  it('before Available P, and before Available W: between each pair', () => {
    moveManningRowTo('a', AP); moveManningRowTo('b', AW)
    expect(manningBlockOrder()).toEqual(['c', RP, RW, 'a', AP, 'b', AW])
  })
  it('to the end: below all four', () => {
    moveManningRowTo('a', null)
    expect(manningBlockOrder()).toEqual(['b', 'c', RP, RW, AP, AW, 'a'])
  })
  it('every counter may go — all three below, and one back above', () => {
    moveManningRowTo('a', null); moveManningRowTo('b', null); moveManningRowTo('c', null)
    expect(manningBlockOrder()).toEqual([RP, RW, AP, AW, 'a', 'b', 'c'])
    moveManningRowTo('b', RP)
    expect(manningBlockOrder()).toEqual(['b', RP, RW, AP, AW, 'a', 'c'])
  })
  it('the counters\' own order — what the rest of the app asks for — is the same list with the four left out', () => {
    moveManningRowTo('a', AW); moveManningRowTo('b', null)
    expect(orderedManningIds()).toEqual(manningBlockOrder().filter(id => !(FIXED_ROWS as readonly string[]).includes(id)))
    expect(orderedManningIds()).toEqual(['c', 'a', 'b'])
  })
  it('a fixed row is never moved: the four keep their own order', () => {
    moveManningRowTo('a', RW)
    const was = getState().manningOrder
    moveManningRowTo(RP, null); moveManningRowTo(AW, 'b'); moveManningRowTo(RW, RP)
    expect(getState().manningOrder).toBe(was)
    expect(moveManningRow(RP, 1)).toBe(false); expect(moveManningRow(AW, -1)).toBe(false)
    expect(manningBlockOrder().filter(id => id.startsWith('@'))).toEqual([RP, RW, AP, AW])
  })
  it('dropped "before itself", or before a row that is not there, is as before: nothing, and the end', () => {
    moveManningRowTo('a', RW)
    const was = getState().manningOrder
    moveManningRowTo('a', 'a')
    expect(getState().manningOrder).toBe(was)
    moveManningRowTo('a', 'nobody')
    expect(manningBlockOrder()).toEqual(['b', 'c', RP, RW, AP, AW, 'a'])
  })
  it('a member moves nothing', () => {
    setRole('member')
    moveManningRowTo('a', null); moveManningRowTo('a', RW)
    expect(getState().manningOrder).toEqual([])
    expect(manningBlockOrder()).toEqual(['a', 'b', 'c', RP, RW, AP, AW])
  })
})

describe('one order for the squadron, saved, and undone by the app\'s Undo (reading 3)', () => {
  it('a counter between two fixed rows and one below all four are there after a reload', () => {
    moveManningRowTo('a', RW); moveManningRowTo('b', null)
    const was = manningBlockOrder()
    expect(was).toEqual(['c', RP, 'a', RW, AP, AW, 'b'])
    reload()
    expect(manningBlockOrder()).toEqual(was)
  })
  it('an order saved before D674 — counters only — opens as those counters, then the four (nothing stored is converted)', () => {
    backend.write('manningorder', JSON.stringify(['c', 'a', 'b']))
    reload()
    expect(manningBlockOrder()).toEqual(['c', 'a', 'b', RP, RW, AP, AW])
    expect(getState().manningOrder).toEqual(['c', 'a', 'b'])
  })
  it('Undo takes a move among the four back, and Redo makes it again', () => {
    moveManningRowTo('a', AP)
    expect(manningBlockOrder()).toEqual(['b', 'c', RP, RW, 'a', AP, AW])
    expect(globalUndo().ok).toBe(true)
    expect(manningBlockOrder()).toEqual(['a', 'b', 'c', RP, RW, AP, AW])
    expect(globalRedo().ok).toBe(true)
    expect(manningBlockOrder()).toEqual(['b', 'c', RP, RW, 'a', AP, AW])
  })
  it('a counter deleted from between two fixed rows leaves the rest where they were — and Undo puts it back between them', () => {
    moveManningRowTo('a', RW); moveManningRowTo('b', null)
    expect(deleteManningRule('a')).toBe(true)
    expect(manningBlockOrder()).toEqual(['c', RP, RW, AP, AW, 'b'])
    expect(globalUndo().ok).toBe(true)
    expect(manningBlockOrder()).toEqual(['c', RP, 'a', RW, AP, AW, 'b'])
  })
  it('a counter made afterwards appears just above Required P, as a new counter always has', () => {
    moveManningRowTo('a', null); moveManningRowTo('b', AW)
    expect(saveManningRule(rule('d', 'wso'))).toBe(true)
    expect(manningBlockOrder()).toEqual(['c', 'd', RP, RW, AP, 'b', AW, 'a'])
  })
  it('"Reset" puts the counters back above the four', () => {
    moveManningRowTo('a', null)
    resetManning()
    expect(manningBlockOrder()).toEqual(['a', 'b', 'c', RP, RW, AP, AW])
  })
})

describe('the step-wise move (no screen calls it) keeps its meaning', () => {
  it('swaps a counter with the next COUNTER, across any fixed rows between them, and stops at the ends', () => {
    moveManningRowTo('a', RW)                                   // b c RP a RW AP AW
    expect(moveManningRow('c', 1)).toBe(true)                   // c and a change places
    expect(manningBlockOrder()).toEqual(['b', 'a', RP, 'c', RW, AP, AW])
    expect(moveManningRow('c', 1)).toBe(false)                  // c is the last counter
    expect(moveManningRow('b', -1)).toBe(false)                 // b is the first
    expect(manningBlockOrder()).toEqual(['b', 'a', RP, 'c', RW, AP, AW])
  })
})

describe('what reads the four rows does not care where they sit', () => {
  it('the Available rows count the same, and are found by their own ids — the SANS calendar and the Calendar window read these', () => {
    const facts = JSON.stringify(dayFacts(TUE)), rules = JSON.stringify(availRules())
    expect(dayFacts(TUE).availP).toBeGreaterThan(0)
    moveManningRowTo('a', AP); moveManningRowTo('b', null); moveManningRowTo('c', RW)
    expect(JSON.stringify(dayFacts(TUE))).toBe(facts)
    expect(JSON.stringify(availRules())).toBe(rules)
  })
  it('no day is judged by a fixed row, and the counters are judged as before: the order is drawing only', () => {
    const verdict = () => { const s = getState(); return JSON.stringify(evaluateDay(s.people, s.grid, s.states, s.requirements, TUE, s.views)) }
    const was = verdict()
    moveManningRowTo('a', AP); moveManningRowTo('b', null)
    expect(verdict()).toBe(was)
    expect(manningRowIds()).toEqual(['a', 'b', 'c'])
    expect(getState().requirements.default.rules.map(r => r.id)).toEqual(['a', 'b', 'c'])
  })
})
