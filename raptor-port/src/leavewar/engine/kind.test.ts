/* LOOK F'S TWO READINGS OF A CODE, AND ACK'S LAST TRACE IN THE READER — pinned on their own.
   - `kindOf` (D1175): a box's colour is its KIND — local leave, overseas leave, an OIL taken (OIL), an OIL given (FO / HO — D1291, D1323), the other leave
     (CCL FCL PL CL EL), a course, overseas duty, medical (B C OML HL); an unknown code reads as overseas-duty grey.
   - `boxText` (D1160, D1145): the letters a box prints — the code bare, its half said by where the box sits, never by
     an arrow; ATT B / ATT C as the owner's B / C; an app-credited OIL keeps its star.
   - the reader (D1158 — Ack goes): a STORED 'acknowledged' request, or a notice whose replaced bid `was` acknowledged,
     still loads, and reads as pending (D401 — an old shape still loads, nothing converted; D56 — it is demo data). */
import { describe, expect, it } from 'vitest'
import { boxText, kindOf } from './codes'
import { readRec, readRecs } from './warrecs'

describe('kindOf — a box’s colour is its kind (D1175)', () => {
  it('every code family, whole and half', () => {
    const cases: Array<[string, string]> = [
      ['LL', 'll'], ['*LL', 'll'], ['LL*', 'll'],
      ['OL', 'ol'], ['*OL', 'ol'],
      // an OIL taken is its own kind, apart from the OIL given (FO, HO) — his D1291, D1323 (24 Oct 26)
      ['OIL', 'oilt'], ['OIL*', 'oilt'], ['*OIL', 'oilt'], ['FO', 'oil'], ['HO', 'oil'],
      ['CCL', 'care'], ['FCL', 'care'], ['PL', 'care'], ['CL', 'care'], ['EL', 'care'], ['*CCL', 'care'],
      ['CSE', 'cse'],
      ['OD', 'od'],
      ['ATTB', 'med'], ['ATTC', 'med'], ['B', 'med'], ['C', 'med'], ['*C', 'med'], ['OML', 'med'], ['HL', 'med'],
    ]
    for (const [code, kind] of cases) expect(kindOf(code), code).toBe(kind)
  })
  it('an unknown code reads as overseas-duty grey', () => {
    expect(kindOf('XYZ')).toBe('od')
    expect(kindOf('')).toBe('od')
  })
})

describe('boxText — the letters a box prints (D1160)', () => {
  it('the code bare: no half arrow, no asterisk', () => {
    expect(boxText('LL')).toBe('LL')
    expect(boxText('*LL')).toBe('LL')
    expect(boxText('LL*')).toBe('LL')
    expect(boxText('*OIL')).toBe('OIL')
    expect(boxText('CCL*')).toBe('CCL')
    for (const c of ['*LL', 'LL*', '*OL', 'OIL*']) expect(boxText(c)).not.toMatch(/[<>*]/)
  })
  it('ATT B and ATT C print as the owner’s B and C, a half too', () => {
    expect(boxText('ATTB')).toBe('B')
    expect(boxText('ATTC')).toBe('C')
    expect(boxText('*ATTC')).toBe('C')
    expect(boxText('OML')).toBe('OML')
    expect(boxText('HL')).toBe('HL')
  })
  it('an app-credited OIL keeps its star; a hand-given one has none', () => {
    expect(boxText('FO', true)).toBe('FO*')
    expect(boxText('HO', true)).toBe('HO*')
    expect(boxText('FO')).toBe('FO')
  })
})

describe('the reader — a stored Ack loads as pending (D1158)', () => {
  it('a request stored as acknowledged reads as pending', () => {
    expect(readRec({ id: 'r1', kind: 'request', code: '*LL', state: 'acknowledged' })).toMatchObject({ id: 'r1', kind: 'request', code: '*LL', state: 'pending' })
  })
  it('the other states read as they were stored', () => {
    expect(readRec({ id: 'r2', kind: 'request', code: 'LL', state: 'pending' })).toMatchObject({ state: 'pending' })
    expect(readRec({ id: 'r3', kind: 'request', code: 'LL', state: 'refused' })).toMatchObject({ state: 'refused' })
  })
  it('a notice whose replaced bid was acknowledged loads, its bid read as pending', () => {
    const n = readRec({ id: 'n1', kind: 'notice', code: 'LL', was: 'acknowledged', byType: 'ATT C', byWho: 'RAMP', seq: 1, at: '2026-01-05T09:00:00Z' })
    expect(n).toMatchObject({ id: 'n1', kind: 'notice', code: 'LL', was: 'pending', byType: 'ATT C', byWho: 'RAMP' })
  })
  it('a whole stored war carrying an Ack loads, nothing dropped', () => {
    const recs = readRecs({ asics: { '2026-02-24': [{ id: 's1', kind: 'request', code: 'OIL', state: 'acknowledged' }] } })
    expect(recs?.asics?.['2026-02-24']).toEqual([expect.objectContaining({ id: 's1', code: 'OIL', state: 'pending' })])
  })
})
