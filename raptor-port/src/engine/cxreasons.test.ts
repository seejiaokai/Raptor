import { describe, it, expect, beforeEach } from 'vitest'
import { storeBackend } from './hooks'
import {
  CXR_STD, CXR_CFG, addCxReason, delCxReason, renameCxReason, moveCxReason,
  cxReasonsSave, cxReasonsLoad, cxReasonsReset, cxrAreStandard,
} from './cxreasons'

/* storeBackend.impl is null headless, so wire a fake — never real localStorage.
   Mirrors stores.test.ts: cancel-reason templates are the same persisted-config
   footing (save/load/reset, an untrusted hand-edited blob). */
const mem: Record<string, string> = {}
const fake = {
  getItem: (k: string) => (k in mem ? mem[k]! : null),
  setItem: (k: string, v: string) => { mem[k] = v },
}

beforeEach(() => {
  Object.keys(mem).forEach(k => delete mem[k])
  storeBackend.impl = fake
  cxReasonsReset()
})

describe('the standard list', () => {
  it('opens on the seven the board shipped with', () => {
    expect(CXR_CFG).toEqual(['WX', 'U/S AIRCRAFT', 'CREW SICK', 'NO AIRSPACE', 'TASKING', 'ENGINEERING', 'SLIPPED'])
    expect(cxrAreStandard()).toBe(true)
  })
  it('CXR_STD cannot be mutated through CXR_CFG', () => {
    addCxReason('DIVERTED')
    expect(CXR_STD.length).toBe(7)
  })
})

describe('add / rename / delete / move', () => {
  it('adds a new reason to the end', () => {
    expect(addCxReason('DIVERTED')).toBe(null)
    expect(CXR_CFG[CXR_CFG.length - 1]).toBe('DIVERTED')
    expect(cxrAreStandard()).toBe(false)
  })
  it('trims but keeps the case a squadron types', () => {
    expect(addCxReason('  Ac swap ')).toBe(null)
    expect(CXR_CFG).toContain('Ac swap')
  })
  it('refuses empty text', () => {
    expect(addCxReason('   ')).toBe('A cancel reason needs some text')
  })
  it('refuses a duplicate, folding case', () => {
    expect(addCxReason('wx')).toBe('wx is already on the list')
  })
  it('refuses an over-long reason', () => {
    expect(addCxReason('x'.repeat(25))).toBe('A cancel reason is at most 24 characters')
  })
  it('caps the list at 24', () => {
    for (let i = 0; i < 17; i++) expect(addCxReason('r' + i)).toBe(null)   // 7 + 17 = 24
    expect(addCxReason('toomany')).toBe('The list holds at most 24 reasons')
  })
  it('renames by position, folding case against the OTHERS only', () => {
    expect(renameCxReason(0, 'BAD WX')).toBe(null)
    expect(CXR_CFG[0]).toBe('BAD WX')
    /* re-casing the same row is fine (compares j !== i) */
    expect(renameCxReason(0, 'bad wx')).toBe(null)
    expect(CXR_CFG[0]).toBe('bad wx')
  })
  it('rename refuses a clash with another row and a bad index', () => {
    expect(renameCxReason(0, 'CREW SICK')).toBe('CREW SICK is already on the list')
    expect(renameCxReason(99, 'X')).toBe('99 is not on the list')
    expect(renameCxReason(1, '  ')).toBe('A cancel reason needs some text')
  })
  it('deletes by position and guards the bounds', () => {
    expect(delCxReason(0)).toBe(true)
    expect(CXR_CFG[0]).toBe('U/S AIRCRAFT')
    expect(delCxReason(99)).toBe(false)
  })
  it('moves a row and guards the bounds', () => {
    expect(moveCxReason(0, 2)).toBe(true)
    expect(CXR_CFG.slice(0, 3)).toEqual(['U/S AIRCRAFT', 'CREW SICK', 'WX'])
    expect(moveCxReason(0, 99)).toBe(false)
  })
})

describe('save / load round-trip', () => {
  it('writes null while the list is standard', () => {
    cxReasonsSave()
    expect(mem['sqn142_cxreasons']).toBe(JSON.stringify(null))
  })
  it('round-trips a customised list, order intact', () => {
    addCxReason('DIVERTED'); delCxReason(0); moveCxReason(0, 2)
    const expected = CXR_CFG.slice()
    cxReasonsSave()
    /* diverge the LIVE list WITHOUT touching storage — cxReasonsReset would null
       the blob (that is what reset is for, asserted below), so a load after it
       would test the fallback, not the round trip. */
    addCxReason('DIVERGE')
    expect(CXR_CFG).not.toEqual(expected)
    cxReasonsLoad()
    expect(CXR_CFG).toEqual(expected)
  })
})

describe('a hand-edited blob is untrusted', () => {
  const load = (raw: any) => { mem['sqn142_cxreasons'] = JSON.stringify(raw); cxReasonsLoad() }
  it('falls back to standard when the blob is not an array', () => {
    addCxReason('DIVERGE')
    load({ wx: true })
    expect(cxrAreStandard()).toBe(true)
  })
  it('drops non-string, empty, over-long and case-duplicate rows', () => {
    load(['WX', 2, '  ', 'C'.repeat(25), 'wx', 'TASKING'])
    expect(CXR_CFG).toEqual(['WX', 'TASKING'])
  })
  it('caps a loaded blob at 24', () => {
    load(Array.from({ length: 40 }, (_, i) => 'R' + i))
    expect(CXR_CFG.length).toBe(24)
  })
  it('falls back to standard when nothing survives', () => {
    addCxReason('DIVERGE')
    load([2, '  ', ''])
    expect(cxrAreStandard()).toBe(true)
  })
  it('survives a corrupt JSON string without throwing', () => {
    mem['sqn142_cxreasons'] = '{not json'
    expect(() => cxReasonsLoad()).not.toThrow()
    expect(cxrAreStandard()).toBe(true)
  })
})

describe('reset', () => {
  it('restores the shipped seven and clears storage', () => {
    addCxReason('DIVERTED'); cxReasonsSave()
    cxReasonsReset()
    expect(cxrAreStandard()).toBe(true)
    cxReasonsLoad()                                          // storage cleared → still standard
    expect(cxrAreStandard()).toBe(true)
  })
})
