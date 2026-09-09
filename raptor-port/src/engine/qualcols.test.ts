/* The LoX column list is saved with the settings (8 Sep 26 bug pass): the
   ticks beside it persist since the storage seam, so a column that vanished
   on reload left orphaned ticks under a key no heading named. */
import { afterEach, describe, expect, it } from 'vitest'
import { storeBackend } from './hooks'
import { DEFAULT_QUAL_COLS, qualCols, qualColsLoad, resetQualCols, setQualCols } from './qualcols'

function fakeStore() {
  const m = new Map<string, string>()
  return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => { m.set(k, v) }, m }
}
afterEach(() => { storeBackend.impl = null; resetQualCols() })

describe('qualcols persistence', () => {
  it('an added column is written, comes back on load, and the default list is stored as null', () => {
    const s = fakeStore(); storeBackend.impl = s
    expect(setQualCols([...DEFAULT_QUAL_COLS, { k: 'tst', h: 'Test qual', lav: true }])).toBe(true)
    expect(JSON.parse(s.m.get('sqn142_qualcols')!)).toHaveLength(11)
    resetQualCols()
    expect(qualCols()).toHaveLength(10)
    qualColsLoad()
    expect(qualCols().map(c => c.k)).toContain('tst')
    expect(qualCols()[10]).toEqual({ k: 'tst', h: 'Test qual', lav: true })
    expect(setQualCols([...DEFAULT_QUAL_COLS])).toBe(true)
    expect(s.m.get('sqn142_qualcols')).toBe('null')
  })

  it('the same list is not rewritten', () => {
    const s = fakeStore(); storeBackend.impl = s
    expect(setQualCols([...DEFAULT_QUAL_COLS])).toBe(false)
    expect(s.m.has('sqn142_qualcols')).toBe(false)
  })

  it('an unusable record falls back to the default ten', () => {
    const s = fakeStore(); storeBackend.impl = s
    s.setItem('sqn142_qualcols', JSON.stringify([{ k: 'ok', h: 'OK' }, { h: 'no key' }]))
    qualColsLoad()
    expect(qualCols()).toBe(DEFAULT_QUAL_COLS)
    s.setItem('sqn142_qualcols', '{not json')
    qualColsLoad()
    expect(qualCols()).toBe(DEFAULT_QUAL_COLS)
    s.setItem('sqn142_qualcols', '[]')
    qualColsLoad()
    expect(qualCols()).toBe(DEFAULT_QUAL_COLS)
  })
})
