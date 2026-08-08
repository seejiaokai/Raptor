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
  it('opens on the six the port shipped with, in the owner\'s order (8 Aug 26)', () => {
    expect(STORE_CFG.map(([k]) => k)).toEqual(['tpod', 'tk2', 'nav', 'nc', 'tks3', 'cl'])
    expect(STORE_CFG.map(([, l]) => l)).toEqual(['TPOD', '2 TKS', 'NAV', 'N/C', '3 TKS', 'CL'])
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

/* storeKey('2 TKS')==='2tks', but the entry STORE_STD ships is keyed 'tk2'
   (ditto '3 TKS'/'tks3'); every jet's config lives under the SHIPPED key.
   Re-adding by name has to land back on that key, not a fresh derivation,
   or the chips on every jet still carrying the old key become permanently
   unreachable from the UI — see the comment on addStore. */
describe('re-adding a deleted standard store lands on its shipped key', () => {
  it('2 TKS: delStore then addStore reuses tk2, not 2tks', () => {
    expect(delStore('tk2')).toBe(true)
    expect(addStore('2 TKS')).toBe(null)
    expect(STORE_CFG.find(([k]) => k === 'tk2')).toEqual(['tk2', '2 TKS'])
    expect(STORE_CFG.some(([k]) => k === '2tks')).toBe(false)
  })
  it('3 TKS: delStore then addStore reuses tks3, not 3tks', () => {
    expect(delStore('tks3')).toBe(true)
    expect(addStore('3 TKS')).toBe(null)
    expect(STORE_CFG.find(([k]) => k === 'tks3')).toEqual(['tks3', '3 TKS'])
    expect(STORE_CFG.some(([k]) => k === '3tks')).toBe(false)
  })
  it('a jet holding the shipped key shows the chip again after delete+re-add', () => {
    const opts: Record<string, boolean> = { tk2: true }
    delStore('tk2')
    expect(STORE_CFG.filter(([k]) => opts[k]).length, 'orphaned while deleted').toBe(0)
    addStore('2 TKS')
    const on = STORE_CFG.filter(([k]) => opts[k])
    expect(on, 'the chip is reachable again, under the same key the jet holds').toEqual([['tk2', '2 TKS']])
  })
  it('typing a standard name while it is already on the list is refused as a duplicate, not appended under a second key', () => {
    // tk2/'2 TKS' is on the list from the start (storesReset() in beforeEach)
    expect(addStore('2 TKS')).toBe('2 TKS is already on the list')
    expect(STORE_CFG.filter(([, l]) => l === '2 TKS').length).toBe(1)
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
    expect(STORE_CFG.map(([k]) => k)).toEqual(['tk2', 'nav', 'tpod', 'nc', 'tks3', 'cl'])
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
    /* diverge the LIVE list first — storesReset() in beforeEach already
       leaves it standard, so without this the assertion below would pass
       whether or not storesLoad falls back to anything at all. Same move
       as the round-trip test above, and for the same reason. */
    addStore('DIVERGE')
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
    addStore('DIVERGE')
    load([['UP', 'X'], ['', '']])
    expect(storesAreStandard()).toBe(true)
  })
  it('survives a corrupt JSON string without throwing', () => {
    addStore('DIVERGE')
    mem['sqn142_stores'] = '{not json'
    expect(() => storesLoad()).not.toThrow()
    expect(storesAreStandard()).toBe(true)
  })
})
