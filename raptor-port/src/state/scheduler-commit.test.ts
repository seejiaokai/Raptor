/* [ARCH-STACK] Step 2 phase 2 — the scheduler routed through the command gate.
   Proves the ADDITIVE wiring: every scheduler write now emits a record-level
   envelope (property c: every durable writer yields >=1 Change), a no-op emits
   nothing, and a throwing write rolls the model back (atomicity, property a) —
   all while the existing suite (run separately) stays byte-identical (property g). */
import { beforeEach, afterEach, describe, expect, it } from 'vitest'
import { DAYS } from '../engine/data'
import { INPUTS, baseYear } from '../engine/inputs'
import { SCHED } from '../engine/publish'
import { CURWEEK } from '../engine/waves'
import { initStore, writeSlot, writeText, writeDelete, writeInputs, moveSection } from './store'
import { slotVal } from '../engine/slots'
import { secOrder } from '../engine/order'
import { setSession } from './auth'
import * as view from './view'
import { onCommit, commandStream } from '../command'
import type { CommitEnvelope } from '../command'

const DSNAP = JSON.stringify(DAYS)
const ISNAP = JSON.stringify(INPUTS)

let caught: CommitEnvelope[] = []
let unsub: () => void

beforeEach(() => {
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((i: any) => INPUTS.push(i))
  SCHED.pending = {}; SCHED.changes = {}; SCHED.added = {}; SCHED.als = []
  SCHED.al = 0; SCHED.dayOK = {}; SCHED.sign = {}; SCHED.orig = {}
  setSession({ user: 'ad', role: 'admin' })
  view.selDrop(); view.armDrop()
  initStore()
  caught = []
  unsub = onCommit(e => caught.push(e))
})
afterEach(() => { unsub() })

const cols = (e: CommitEnvelope) => e.changes.map(c => c.collection)

describe('every scheduler write emits a record-level envelope (property c)', () => {
  it('writeSlot -> ONE envelope carrying a day change', () => {
    writeSlot('0.0.0.0.p', 'casper')
    expect(caught.length).toBe(1)
    expect(caught[0].type).toBe('sched.slot')
    expect(caught[0].scope).toEqual({ module: 'sched', weekId: CURWEEK })
    expect(cols(caught[0])).toContain('days')
    expect(caught[0].changes.some(c => c.collection === 'days' && c.id === `${CURWEEK}#0`)).toBe(true)
  })

  it('writeText -> a day change', () => {
    writeText('fr:0.0.0.0', 'NEW REMARK')
    expect(caught.length).toBe(1)
    expect(cols(caught[0])).toContain('days')
  })

  it('writeDelete -> a day change', () => {
    const wave = (DAYS[0].waves || []).find((w: any) => w.lines && w.lines.length)
    if (!wave) return
    writeDelete(() => { wave.lines.splice(0, 1) })
    expect(caught.length).toBe(1)
    expect(caught[0].type).toBe('sched.delete')
    expect(cols(caught[0])).toContain('days')
  })

  it('moveSection -> a day change (secOrder), display-only', () => {
    const di = 0
    // pick a real reorder the model will accept
    const order = secOrder(DAYS[di])
    if (order.length < 2) return
    moveSection(di, order[1], -1)
    expect(caught.length).toBe(1)
    expect(caught[0].type).toBe('sched.section.move')
    expect(cols(caught[0])).toContain('days')
  })

  it('writeInputs -> an inputs change', () => {
    writeInputs(() => { INPUTS.push({ person: 'bane', type: 'leave', date: 'Jul 13', yr: baseYear() }) })
    expect(caught.length).toBe(1)
    expect(caught[0].scope).toEqual({ module: 'inputs' })
    expect(cols(caught[0])).toContain('inputs')
  })
})

describe('no-op and atomicity', () => {
  it('a no-op writeSlot emits nothing', () => {
    const key = '0.0.0.0.p'
    const v = slotVal(key)
    writeSlot(key, v)
    expect(caught.length).toBe(0)
  })

  it('a throwing scheduler write rolls the model back and emits nothing (atomicity)', () => {
    const before = JSON.stringify(DAYS)
    const n0 = commandStream().length
    expect(() => writeDelete(() => { DAYS[0].waves = []; throw new Error('boom') }, 0, 'programme')).not.toThrow()
    expect(JSON.stringify(DAYS)).toBe(before) // model restored
    expect(caught.length).toBe(0)             // nothing emitted
    expect(commandStream().length).toBe(n0)   // stream unchanged
  })
})
