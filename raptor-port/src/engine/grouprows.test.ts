/* THE ENTRY ON THE ROW — the pure half (`[GROUP-INPUT-ONE-ROW]` step 3; owner D661, D735 — "on the schedule a group input
   is ONE row holding everyone", "the row never splits or joins by itself"; the plan
   docs/superpowers/plans/2026-10-10-group-input-one-row-plan.md §4.1).

   A shared input stays one record a man and one ground row a man. What makes the rows ONE row is a mark the request
   writes on its row — `srcg`, the entry's own identity: the group's id and every shared field, the same test the
   Inputs pages group by (state/inputgroup.ts entriesOf), so the schedule and the Inputs pages cannot disagree about
   who is in one entry. `groundGroups` reads the day's rows and says which are drawn as one — off the ROWS, never the
   live input. An ordinary request's row is byte for byte what it was. */
import { describe, expect, it } from 'vitest'
import { entryIdOf, sharedKey, SHARED_FIELDS } from './inputentry'
import { requestRowFields, srcvOf } from './overlay'
import { groundGroups } from './grouprows'
import { entriesOf, sharedKey as stateSharedKey, SHARED_FIELDS as STATE_FIELDS } from '../state/inputgroup'

const base = { iid: 'a1', person: 'bane', type: 'Training', date: 'Jul 15', yr: 2026, allday: false, s: 660, e: 720, remarks: 'range' }
/* the hash the row's `srcv` was before this build: the six fields the request writes, FNV-1a, base 36 */
const oldSrcv = (f: any) => {
  const s = [f.prog, f.str, f.end, f.who, f.rmks, f.srcType].map((x: any) => String(x ?? '')).join('|')
  let h = 0x811c9dc5
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) }
  return (h >>> 0).toString(36)
}

describe('entryIdOf — the entry’s own identity', () => {
  it('an ordinary input has none; nor has a medical entry or an upchit, whatever group fields it carries', () => {
    expect(entryIdOf(base)).toBe('')
    expect(entryIdOf({ ...base, grp: '' })).toBe('')
    expect(entryIdOf({ ...base, grp: 'g1', type: 'ATT C' })).toBe('')
    expect(entryIdOf({ ...base, grp: 'g1', type: 'Upchit' })).toBe('')
    expect(entryIdOf(null)).toBe('')
  })
  it('the records of one entry share it, whoever they are for — and a blank end date, half or remark reads as none', () => {
    const a = entryIdOf({ ...base, grp: 'g1', grpBy: 'stiff' })
    expect(a).toMatch(/^g1~/)
    expect(entryIdOf({ ...base, iid: 'a2', person: 'pike', grp: 'g1', grpBy: 'stiff', endDate: '', half: '', oil: { x: 1 }, acc: 'g' })).toBe(a)
  })
  it('ANY shared field that differs makes it another entry — a date or a half the row does not even show', () => {
    const one = { ...base, grp: 'g1' }, a = entryIdOf(one)
    for (const change of [{ endDate: 'Jul 16' }, { date: 'Jul 16' }, { s: 600 }, { remarks: 'other' }, { title: 'Range brief' }, { type: 'Meeting' }, { allday: true }, { yr: 2027 }]) {
      expect(entryIdOf({ ...one, ...change }), JSON.stringify(change)).not.toBe(a)
    }
    expect(entryIdOf({ ...one, grp: 'g2' }), 'another group').not.toBe(a)
  })
  it('it is the SAME test the Inputs pages group by — the one sharedKey, moved to the engine and re-exported where it was', () => {
    expect(stateSharedKey).toBe(sharedKey)
    expect(STATE_FIELDS).toBe(SHARED_FIELDS)
    const recs = [
      { ...base, iid: 'a1', person: 'bane', grp: 'g1' }, { ...base, iid: 'a2', person: 'pike', grp: 'g1' },
      { ...base, iid: 'a3', person: 'rocky', grp: 'g1', endDate: 'Jul 16' }, { ...base, iid: 'a4', person: 'split' },
    ]
    const byEntry = entriesOf(recs).map(e => e.rows.map((r: any) => r.iid).sort().join(','))
    const byId = new Map<string, string[]>()
    for (const r of recs) { const k = entryIdOf(r) || `alone:${r.iid}`; byId.set(k, [...(byId.get(k) || []), r.iid]) }
    expect([...byId.values()].map(v => v.sort().join(',')).sort()).toEqual(byEntry.sort())
  })
})

describe('what a request writes on its row', () => {
  it('AN ORDINARY REQUEST: the six fields and the `srcv` it always had — byte for byte, so no ordinary row is re-made by this build', () => {
    const f: any = requestRowFields(base)
    expect(Object.keys(f)).toEqual(['prog', 'str', 'end', 'who', 'rmks', 'srcType'])
    expect(srcvOf(base)).toBe(oldSrcv(f))
  })
  it('A GROUPED RECORD: a seventh, `srcg` — and a `srcv` that moves with any shared field', () => {
    const g = { ...base, grp: 'g1' }
    const f: any = requestRowFields(g)
    expect(f.srcg).toBe(entryIdOf(g))
    expect(srcvOf(g)).not.toBe(srcvOf(base))
    expect(srcvOf({ ...g, endDate: 'Jul 16' }), 'a shared field the row does not show').not.toBe(srcvOf(g))
  })
})

describe('groundGroups — which rows of a day are drawn as one', () => {
  const row = (rid: string, o: any = {}) => ({ prog: 'TRAINING', str: '11:00', end: '12:00', who: rid, rmks: '', rid, ...o })
  const shape = (d: any) => groundGroups(d).map(g => `${g.lead}:${g.members.join('+')}`)
  it('rows carrying the same entry mark are one row — wherever they stand; every row answers with its lead and its members', () => {
    const d = { ground: [row('a', { src: 'i1', srcg: 'g1~x' }), row('z'), row('b', { src: 'i2', srcg: 'g1~x' })] }
    expect(shape(d)).toEqual(['0:0+2', '1:1', '0:0+2'])
  })
  it('a row nobody filed, a row with no entry mark, and a dead `kept` row are each their own', () => {
    const d = { ground: [row('a', { src: 'i1' }), row('b', { src: 'i2' }), row('c', { src: 'i3', srcg: 'g1~x', kept: true }), row('d', { src: 'i4', srcg: 'g1~x' }), row('e', { srcg: 'g1~x' })] }
    expect(shape(d)).toEqual(['0:0', '1:1', '2:2', '3:3', '4:4'])
  })
  it('rows whose scheduler’s marks differ are honestly drawn apart — CX and its reason, the red box, information only', () => {
    const m = (o: any) => ({ ground: [row('a', { src: 'i1', srcg: 'g' }), row('b', { src: 'i2', srcg: 'g', ...o })] })
    for (const o of [{ cx: true }, { cx: true, cxr: 'WX' }, { flag: true }, { info: true }]) expect(shape(m(o)), JSON.stringify(o)).toEqual(['0:0', '1:1'])
    const same = { ground: [row('a', { src: 'i1', srcg: 'g', cx: true, cxr: 'WX', flag: true }), row('b', { src: 'i2', srcg: 'g', cx: true, cxr: 'WX', flag: true })] }
    expect(shape(same)).toEqual(['0:0+1', '0:0+1'])
  })
  it('the LEAD is the first member in the day’s own display order — by start time, or by hand where the list is hand-ordered', () => {
    const rows = [row('late', { str: '14:00', src: 'i1', srcg: 'g' }), row('early', { str: '09:00' }), row('late2', { str: '14:00', src: 'i2', srcg: 'g' })]
    expect(shape({ ground: rows })[0]).toBe('0:0+2')
    /* two entries: the members follow display order too */
    const two = { ground: [row('b', { str: '14:00', src: 'i2', srcg: 'g' }), row('a', { str: '10:00', src: 'i1', srcg: 'g' })] }
    expect(shape(two), 'timed order: the 10:00 row leads').toEqual(['1:1+0', '1:1+0'])
    expect(shape({ ...two, gman: true }), 'hand order: the first in the list leads').toEqual(['0:0+1', '0:0+1'])
  })
  it('a day with no ground rows answers with nothing', () => {
    expect(groundGroups({})).toEqual([])
    expect(groundGroups(null)).toEqual([])
  })
})
