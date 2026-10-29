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
    expect(JSON.parse(s.m.get('sqn142_qualcols')!)).toHaveLength(12)
    resetQualCols()
    expect(qualCols()).toHaveLength(11)
    qualColsLoad()
    expect(qualCols().map(c => c.k)).toContain('tst')
    expect(qualCols()[11]).toEqual({ k: 'tst', h: 'Test qual', lav: true })
    expect(setQualCols([...DEFAULT_QUAL_COLS])).toBe(true)
    expect(s.m.get('sqn142_qualcols')).toBe('null')
  })

  it('the same list is not rewritten', () => {
    const s = fakeStore(); storeBackend.impl = s
    expect(setQualCols([...DEFAULT_QUAL_COLS])).toBe(false)
    expect(s.m.has('sqn142_qualcols')).toBe(false)
  })

  it('an unusable record falls back to the default list', () => {
    const s = fakeStore(); storeBackend.impl = s
    s.setItem('sqn142_qualcols', JSON.stringify([{ k: 'ok', h: 'OK' }, { h: 'no key' }]))
    qualColsLoad()
    expect(qualCols()).toBe(DEFAULT_QUAL_COLS)
    s.setItem('sqn142_qualcols', '{not json')
    qualColsLoad()
    expect(qualCols()).toBe(DEFAULT_QUAL_COLS)
  })

  /* [STORE-READER-SWEEP] ([DB-READINESS] group A, phase 7): a list EMPTIED through the app's own control is a decision
     — the writer stores `[]` — and the reader took an empty list for "nothing saved" and put the standard set back at
     the next load. A stored empty list now reads back empty; anything unusable still falls back. */
  /* (this file used to pin a stored `[]` as "unusable" beside the two cases above — but `[]` is exactly what the Quals
     page's own column delete writes once the last column is removed, so that assertion pinned the defect) */
  /* (since D1502, 29 Oct 26, Management cannot be removed: "every column" is every column but Management, which the
     Leave War reads — a stored empty list reads back as Management alone) */
  it('every column removed on the Quals page stays removed after a reload', () => {
    const s = fakeStore(); storeBackend.impl = s
    expect(setQualCols([])).toBe(true)
    expect(JSON.parse(s.m.get('sqn142_qualcols')!), 'the writer keeps Management').toEqual([MGMT])
    resetQualCols()
    expect(qualCols()).toHaveLength(11)
    s.setItem('sqn142_qualcols', '[]')
    qualColsLoad()
    expect(qualCols(), 'the default ten do not come back; Management does').toEqual([MGMT])
  })
})

/* MANAGEMENT IS ALREADY ON QUALS (owner D1502, 29 Oct 26 — "All as recommended"): every squadron starts with an empty
   Management tick column beside SXO; it cannot be deleted, because the Leave War reads it by its key to draw the
   Management group first; a squadron's stored list gains it at load. */
const MGMT = { k: 'mgmt', h: 'Management', lav: true }
describe('the Management column (D1502)', () => {
  it('is in the default list, beside SXO, under its own key', () => {
    const ks = DEFAULT_QUAL_COLS.map(c => c.k)
    expect(ks.indexOf('mgmt'), 'right after SXO').toBe(ks.indexOf('sxo') + 1)
    expect(DEFAULT_QUAL_COLS.find(c => c.k === 'mgmt')).toEqual(MGMT)
  })

  it("a squadron's stored list without it gains it after SXO at load — nothing written", () => {
    const s = fakeStore(); storeBackend.impl = s
    const old = [{ k: 'san', h: 'SANS', lav: true }, { k: 'sxo', h: 'SXO', lav: true }, { k: 'tf', h: 'TF', lav: true }]
    s.setItem('sqn142_qualcols', JSON.stringify(old))
    qualColsLoad()
    expect(qualCols().map(c => c.k)).toEqual(['san', 'sxo', 'mgmt', 'tf'])
    expect(JSON.parse(s.m.get('sqn142_qualcols')!), 'the load writes nothing').toEqual(old)
  })

  it('with no SXO column it stands first', () => {
    const s = fakeStore(); storeBackend.impl = s
    s.setItem('sqn142_qualcols', JSON.stringify([{ k: 'tf', h: 'TF', lav: true }]))
    qualColsLoad()
    expect(qualCols().map(c => c.k)).toEqual(['mgmt', 'tf'])
  })

  it('a stored list that has it moved keeps it where it was moved', () => {
    const s = fakeStore(); storeBackend.impl = s
    s.setItem('sqn142_qualcols', JSON.stringify([{ k: 'tf', h: 'TF' }, MGMT, { k: 'sxo', h: 'SXO' }]))
    qualColsLoad()
    expect(qualCols().map(c => c.k)).toEqual(['tf', 'mgmt', 'sxo'])
  })

  it('the writer puts it back where a caller leaves it out (the break test of the page refusing its ✕)', () => {
    const s = fakeStore(); storeBackend.impl = s
    expect(setQualCols(DEFAULT_QUAL_COLS.filter(c => c.k !== 'mgmt' && c.k !== 'tf'))).toBe(true)
    const ks = qualCols().map(c => c.k)
    expect(ks.indexOf('mgmt'), 'back after SXO').toBe(ks.indexOf('sxo') + 1)
    /* leaving it out of the default list writes the default list: nothing to store */
    expect(setQualCols(DEFAULT_QUAL_COLS.filter(c => c.k !== 'mgmt'))).toBe(true)
    expect(s.m.get('sqn142_qualcols')).toBe('null')
  })
})
