/* Ported from reference/tfin.js — group K (key parsing) and the B48 shiftKeys
   renumbering check (originally run through w.eval because SCHED is scoped). */
import { beforeEach, describe, expect, it } from 'vitest'
import { keyDay, shiftKeys } from './keys'
import { SCHED } from './publish'

beforeEach(() => {
  SCHED.pending = {}; SCHED.changes = {}; SCHED.als = []
})

describe('slot / text key parsing (tfin K)', () => {
  it('keyDay resolves the day for every prefix', () => {
    const cases: [string, number][] = [['0.1.0.0.p', 0], ['ar:0.1.0', 0], ['at:3.1.0', 3], ['st:2.1.0.0', 2], ['it:4.1', 4],
      ['d:0.0.1', 0], ['s:1.amt.1.pax.3', 1], ['g:2.2', 2], ['a:3.4', 3],
      ['dn:1.0', 1], ['sn:2', 2], ['ap:0.1.k', 0], ['wl:4.1', 4], ['ff:2.1.0.k', 2],
      ['fr:3.1.0.0', 3], ['dl:1.1', 1], ['dr:0.1.2.k', 0], ['sr:2.amt.1.k', 2], ['gr:1.2.k', 1]]
    const kbad = cases.filter(c => keyDay(c[0]) !== c[1])
    expect(kbad, kbad.map(c => c[0] + '→' + keyDay(c[0])).join(' ')).toEqual([])
  })

  it('keyDay rejects junk', () => {
    expect(keyDay('nonsense')).toBe(-1)
    expect(keyDay('xx:zz')).toBe(-1)
  })
})

describe('shiftKeys renumbering (tfin B48)', () => {
  it('drops the deleted row, shifts the rest, leaves the earlier ones', () => {
    SCHED.pending = {}
    SCHED.changes = { 'dn:0.0': 1, 'dn:0.1': 1, 'dn:0.3': 2 }
    SCHED.als = [{ n: 1, keys: ['dn:0.1', 'dn:0.3'], sign: {} }]
    shiftKeys('dn:0.', 0, 1)
    const c = SCHED.changes
    expect(c['dn:0.0']).toBe(1)
    expect(c['dn:0.1']).toBeUndefined()
    expect(c['dn:0.2']).toBe(2)
    expect(SCHED.als[0].keys.join(',')).toBe('dn:0.2')
  })

  it('a different key space is left alone', () => {
    SCHED.pending = { 'dn:1.0': 1, 'ap:0.1.prog': 1 }
    shiftKeys('dn:0.', 0, 0)
    expect(Object.keys(SCHED.pending).sort()).toEqual(['ap:0.1.prog', 'dn:1.0'])
  })
})
