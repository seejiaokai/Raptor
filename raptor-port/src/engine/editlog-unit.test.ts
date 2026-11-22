// @vitest-environment jsdom
/* THE CHANGE HISTORY IS EACH SQUADRON'S OWN (the full check of multi-squadron batch 1, 18 Nov 26 — the security read's
   history-cross-sqn proof, red first in its own copy): every line went into one list in memory and one set of saved rows,
   so a 149 admin's change to a 149 man's input remarks showed in a 142 member's changes window on the same browser, and
   "Clear edit history…" in one squadron cleared the other's lines too. Each line now carries the unit it was made in;
   the list in memory holds the unit in view's lines only, read again whenever the unit in view changes. */
import { afterAll, afterEach, beforeEach, describe, expect, it } from 'vitest'
import { storeBackend, store } from './hooks'
import { INPUTS, leadOf } from './inputs'
import { initStore, resetSession, notify, writeInputsBatch } from '../state/store'
import { signIn, sessionFor, accountsLoad } from '../state/accounts'
import { setSession } from '../state/auth'
import { installGlobalUndo } from '../state/undo-wire'
import { _resetTimeline } from '../undo/timeline'
import { setUnitSeeds } from '../state/units'
import { ELOG, elogFlush, elogWeekRows, elogSweep } from './editlog'
import { UNIT } from './unitview'
import { updatePersonField } from '../state/quals-write'
import { PEOPLE } from './people'

const mem: Record<string, string> = {}
const fake = {
  getItem: (k: string) => (k in mem ? mem[k]! : null),
  setItem: (k: string, v: string) => { if (v === 'null') delete mem[k]; else mem[k] = v },
  keys: () => Object.keys(mem),
}
const signInAs = (name: string, pass: string) => { const r = signIn(name, pass); resetSession(sessionFor(r)); notify(); return r }
const has = (rows: any[], s: string) => rows.filter(x => JSON.stringify(x).includes(s)).length
/* the saved rows as the store holds them (the backend itself is written later, by the postman) */
const savedWith = (s: string) => store.keys('elog:').filter(k => JSON.stringify(store.get(k, null)).includes(s)).length

beforeEach(() => {
  Object.keys(mem).forEach(k => delete mem[k])
  storeBackend.impl = fake
  setUnitSeeds(true); initStore(); accountsLoad(); resetSession(null); _resetTimeline(); installGlobalUndo()
})
afterEach(() => { setSession(null); resetSession(null); _resetTimeline() })
afterAll(() => { storeBackend.impl = null })

function heronRemark(text: string) {
  signInAs('ad9', 'a9')
  expect(UNIT).toBe('u149')
  const r: any = INPUTS.find((x: any) => String(leadOf(x)) === 'her9')
  expect(r, 'the 149 seed input').toBeTruthy()
  expect(writeInputsBatch(() => { r.remarks = text })).toBeTruthy()
  elogFlush()
  expect(has(ELOG.rows, text), 'a history line was written in 149').toBeGreaterThan(0)
}

describe('the change history across squadrons', () => {
  it("a 149 remark never reaches a 142 member's changes window", () => {
    heronRemark('Family emergency - private')
    signInAs('us', 'us')
    expect(UNIT).toBe('u142')
    expect(has(ELOG.rows, 'Family emergency')).toBe(0)
    expect(has(elogWeekRows('13/07/2026'), 'Family emergency')).toBe(0)
    /* …and it is still 149's, kept and read back when 149 is in view again */
    expect(savedWith('Family emergency')).toBeGreaterThan(0)
    signInAs('ad9', 'a9')
    expect(has(ELOG.rows, 'Family emergency')).toBeGreaterThan(0)
  })
  it("the master's Quals change to a 149 man, made from 142's view, is 149's line (the fix's blind read, F2)", () => {
    signInAs('ad', 'a')
    expect(UNIT).toBe('u142')
    const q0 = (PEOPLE as any).osp9.q
    expect(updatePersonField('osp9', { cat: 'OCU' })).toBe(null)
    elogFlush()
    const his = store.keys('elog:').map(k => store.get(k, null)).filter((l: any) => l && l.sub === 'osp9')
    expect(his.length).toBeGreaterThan(0)
    expect(his.map((l: any) => l.u)).toEqual(his.map(() => 'u149'))
    expect(ELOG.rows.filter(r => r.sub === 'osp9').length, "not in 142's list").toBe(0)
    signInAs('ad9', 'a9')
    expect(ELOG.rows.filter(r => r.sub === 'osp9').length, "in 149's").toBeGreaterThan(0)
    expect(updatePersonField('osp9', { cat: q0 })).toBe(null)   // put back: PEOPLE is shared across the file's tests
  })
  it("clearing the history in 142 leaves 149's lines alone", () => {
    heronRemark('Kept by 149')
    signInAs('ad2', 'a2')
    expect(UNIT).toBe('u142')
    elogSweep(null, null)
    expect(savedWith('Kept by 149')).toBeGreaterThan(0)
    signInAs('ad9', 'a9')
    expect(has(ELOG.rows, 'Kept by 149')).toBeGreaterThan(0)
  })
})
