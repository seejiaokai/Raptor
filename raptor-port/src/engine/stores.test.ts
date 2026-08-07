import { describe, it, expect, beforeEach } from 'vitest'
import { storeBackend } from './hooks'
import {
  STORE_STD, STORE_CFG, storeKey, addStore, delStore, renameStore, moveStore,
  storesSave, storesLoad, storesReset, storesAreStandard,
} from './stores'

/* storeBackend.impl is null headless, so wire a fake — never real localStorage */
const mem: Record<string, string> = {}
const fake = {
  getItem: (k: string) => (k in mem ? mem[k]! : null),
  setItem: (k: string, v: string) => { mem[k] = v },
}

beforeEach(() => {
  Object.keys(mem).forEach(k => delete mem[k])
  storeBackend.impl = fake
  storesReset()
})

describe('the standard list', () => {
  it('opens on the six the port shipped with, in order', () => {
    expect(STORE_CFG.map(([k]) => k)).toEqual(['nav', 'nc', 'tk2', 'tks3', 'tpod', 'cl'])
    expect(STORE_CFG.map(([, l]) => l)).toEqual(['NAV', 'N/C', '2 TKS', '3 TKS', 'TPOD', 'CL'])
    expect(storesAreStandard()).toBe(true)
  })
  it('STORE_STD cannot be mutated through STORE_CFG', () => {
    addStore('LGB')
    expect(STORE_STD.length).toBe(6)
  })
})

describe('storeKey', () => {
  it('strips every non-alphanumeric, exactly as qualKey does', () => {
    expect(storeKey('2 TKS')).toBe('2tks')
    expect(storeKey('  N/C  ')).toBe('nc')
    expect(storeKey('TPOD')).toBe('tpod')
  })
  it('is empty for a name with nothing alphanumeric in it', () => {
    expect(storeKey('///')).toBe('')
  })
})

describe('adding', () => {
  it('appends with the typed label upper-cased and the derived key', () => {
    expect(addStore('lgb')).toBe(null)
    expect(STORE_CFG[STORE_CFG.length - 1]).toEqual(['lgb', 'LGB'])
    expect(storesAreStandard()).toBe(false)
  })
  it('refuses a name with no letter or number', () => {
    expect(addStore('///')).toBe('A store needs a letter or a number in its name')
    expect(STORE_CFG.length).toBe(6)
  })
  it('refuses a duplicate key', () => {
    expect(addStore('NAV')).toBe('NAV is already on the list')
    expect(STORE_CFG.length).toBe(6)
  })
  it('refuses a label longer than 16 characters', () => {
    expect(addStore('A'.repeat(17))).toBe('A store name is at most 16 characters')
  })
  it('refuses a 25th entry', () => {
    for (let i = 0; i < 18; i++) expect(addStore('x' + i)).toBe(null)
    expect(STORE_CFG.length).toBe(24)
    expect(addStore('toomany')).toBe('The list holds at most 24 stores')
  })
})

describe('renaming — THE key never moves', () => {
  it('changes the label and leaves the key alone', () => {
    expect(renameStore('tk2', '2 TANKS')).toBe(null)
    expect(STORE_CFG.find(([k]) => k === 'tk2')).toEqual(['tk2', '2 TANKS'])
    expect(STORE_CFG.some(([k]) => k === '2tanks')).toBe(false)
  })
  it('refuses an empty label and leaves the old one standing', () => {
    expect(renameStore('tk2', '   ')).toBe('A store needs a name')
    expect(STORE_CFG.find(([k]) => k === 'tk2')).toEqual(['tk2', '2 TKS'])
  })
  it('refuses a label longer than 16 characters', () => {
    expect(renameStore('tk2', 'B'.repeat(17))).toBe('A store name is at most 16 characters')
  })
  it('is false for a key that is not on the list', () => {
    expect(renameStore('nope', 'X')).toBe('nope is not on the list')
  })
})

describe('removing', () => {
  it('drops the entry and reports it', () => {
    expect(delStore('tpod')).toBe(true)
    expect(STORE_CFG.some(([k]) => k === 'tpod')).toBe(false)
  })
  it('is false for a key that is not on the list', () => {
    expect(delStore('nope')).toBe(false)
  })
})

describe('reordering', () => {
  it('moves an entry and shuffles the rest up', () => {
    expect(moveStore(0, 2)).toBe(true)
    expect(STORE_CFG.map(([k]) => k)).toEqual(['nc', 'tk2', 'nav', 'tks3', 'tpod', 'cl'])
  })
  it('refuses an out-of-range index rather than dropping an entry', () => {
    expect(moveStore(0, 99)).toBe(false)
    expect(moveStore(-1, 0)).toBe(false)
    expect(STORE_CFG.length).toBe(6)
  })
})

describe('persistence', () => {
  it('writes nothing while the list is standard', () => {
    storesSave()
    expect(mem['sqn142_stores']).toBe(JSON.stringify(null))
  })
  it('round-trips a customised list, order and labels intact', () => {
    renameStore('tk2', '2 TANKS'); delStore('cl'); addStore('LGB'); moveStore(0, 3)
    const expected = STORE_CFG.map(([k, l]) => [k, l])
    storesSave()
    /* diverge the LIVE list WITHOUT touching storage. storesReset() cannot be
       used here: it nulls the saved blob — which is exactly what reset is for,
       and is asserted by the next test — so loading afterwards would find
       nothing and this would test the fallback instead of the round trip. */
    addStore('DIVERGE')
    expect(STORE_CFG).not.toEqual(expected)
    storesLoad()
    expect(STORE_CFG).toEqual(expected)
  })
  it('reset clears the stored list as well as the live one', () => {
    addStore('LGB'); storesSave()
    storesReset()
    expect(storesAreStandard()).toBe(true)
    storesLoad()
    expect(storesAreStandard()).toBe(true)
  })
})

describe('a hand-edited blob is untrusted — see rulesLoad on isFinite("840")', () => {
  const load = (raw: any) => { mem['sqn142_stores'] = JSON.stringify(raw); storesLoad() }
  it('falls back to standard when the blob is not an array', () => {
    load({ nav: true })
    expect(storesAreStandard()).toBe(true)
  })
  it('drops an entry that is not a two-string pair', () => {
    load([['nav', 'NAV'], ['nc'], ['tk2', 2], 'tpod'])
    expect(STORE_CFG).toEqual([['nav', 'NAV']])
  })
  it('drops a key outside ^[a-z0-9]+$ — including an underscore storeKey cannot emit', () => {
    load([['nav', 'NAV'], ['two_tks', 'X'], ['UP', 'Y'], ['', 'Z']])
    expect(STORE_CFG).toEqual([['nav', 'NAV']])
  })
  it('drops a duplicate key, keeping the first', () => {
    load([['nav', 'NAV'], ['nav', 'AGAIN']])
    expect(STORE_CFG).toEqual([['nav', 'NAV']])
  })
  it('drops an empty or over-long label', () => {
    load([['nav', 'NAV'], ['a', '  '], ['b', 'C'.repeat(17)]])
    expect(STORE_CFG).toEqual([['nav', 'NAV']])
  })
  it('caps the list at 24 entries', () => {
    load(Array.from({ length: 40 }, (_, i) => ['k' + i, 'L' + i]))
    expect(STORE_CFG.length).toBe(24)
  })
  it('falls back to standard when nothing at all survives', () => {
    load([['UP', 'X'], ['', '']])
    expect(storesAreStandard()).toBe(true)
  })
  it('survives a corrupt JSON string without throwing', () => {
    mem['sqn142_stores'] = '{not json'
    expect(() => storesLoad()).not.toThrow()
    expect(storesAreStandard()).toBe(true)
  })
})
