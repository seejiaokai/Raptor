/* [DB-READINESS] group A, phase 4.3 / 4.4 (plan §2.6) — THE ONE-TIME CONVERSION of an old browser's whole-list settings
   records into one row per thing. A browser that saved the change history as ONE record (`settings/elog`), everyone's
   "seen" as one (`changeseen`), the accounts as one (`accounts`) and the requests as one (`accessreqs`, each carrying
   which admins had seen it) is turned, at the fold, into the rows this build reads — nothing lost, each old record
   removed in the same group, and the old line NUMBERS turned into POSITIONS in the history's order (F2-02):
   - every line keeps its order: its `lineId` is minted from its old number, so lines made in the same millisecond keep
     the order they had;
   - a person's "seen up to line N" becomes "up to line N's position"; a line marked seen one by one keeps its id;
   - an account's `seenFrom` N (the history's next number when it was made — every line from N on is news to him)
     becomes the position of the last line before N;
   - which admins had each request on screen becomes each admin's own row of the requests he has seen.
   Each converter writes only its own records; a record that will not read is left for the reader to ignore (never a
   thrown boot). */
import { describe, it, expect } from 'vitest'
import { emptySnapshot } from '../storage/backend'
import { elogConverter, accountsConverter, lineIdOfSeq } from './settingsrows'

const snapWith = (settings: Record<string, unknown>) => {
  const s = emptySnapshot()
  for (const [k, v] of Object.entries(settings)) s.settings[k] = JSON.stringify(v)
  return s
}
const out = (entries: { collection: string; id: string; value: string | null }[]) =>
  Object.fromEntries(entries.map(e => [`${e.collection}/${e.id}`, e.value == null ? null : JSON.parse(e.value)]))

const LINES = [
  { seq: 1, t: 100, who: 'Saber', pid: 'stiff', di: 0, date: '2026-07-13', key: '', lbl: 'one', from: '', to: '' },
  { seq: 2, t: 100, who: 'Ranger', pid: 'bane', di: 0, date: '2026-07-13', key: '', lbl: 'two', from: '', to: '' },
  { seq: 5, t: 300, who: 'Saber', pid: 'stiff', di: 1, date: '2026-07-14', key: 'dn:1.0', lbl: 'five', from: 'a', to: 'b' },
]

describe('the change history and everyone\'s seen', () => {
  it('each line becomes its own row, its order kept, its number gone; the old record removed', () => {
    const o = out(elogConverter.convert(snapWith({ elog: { v: 1, next: 6, rows: LINES } })))
    expect(o['settings/elog']).toBeNull()
    const rows = Object.entries(o).filter(([k]) => k.startsWith('settings/elog:')).map(([k, v]) => ({ k, v: v as any }))
    expect(rows).toHaveLength(3)
    for (const { k, v } of rows) { expect(k).toBe(`settings/elog:${v.lineId}`); expect('seq' in v).toBe(false) }
    /* the same order as their numbers — (at, lineId), ties by the minted id */
    const sorted = rows.map(r => r.v).sort((a, b) => a.t - b.t || (a.lineId < b.lineId ? -1 : 1))
    expect(sorted.map(r => r.lbl)).toEqual(['one', 'two', 'five'])
    expect(lineIdOfSeq(1) < lineIdOfSeq(2) && lineIdOfSeq(2) < lineIdOfSeq(10)).toBe(true)
  })

  it('a person\'s seen becomes his own row, as positions', () => {
    const o = out(elogConverter.convert(snapWith({
      elog: { v: 1, next: 6, rows: LINES },
      changeseen: { bane: { upto: 1, extra: [5] }, stiff: { upto: 4, extra: [] } },
    })))
    expect(o['settings/changeseen']).toBeNull()
    expect(o['settings/seen:bane']).toEqual({ upto: { at: 100, lineId: lineIdOfSeq(1) }, extra: [lineIdOfSeq(5)] })
    /* "up to 4": the last line at or before it is line 2 */
    expect(o['settings/seen:stiff']).toEqual({ upto: { at: 100, lineId: lineIdOfSeq(2) }, extra: [] })
  })

  it('a store holding neither writes nothing; a record that will not read is left as it is', () => {
    expect(elogConverter.convert(snapWith({}))).toEqual([])
    const s = emptySnapshot(); s.settings.elog = '{not json'
    expect(elogConverter.convert(s)).toEqual([])
  })
})

describe('the accounts and the requests', () => {
  it('each account its own row; seenFrom a position; the old record removed', () => {
    const o = out(accountsConverter.convert(snapWith({
      elog: { v: 1, next: 6, rows: LINES },
      accounts: [
        { id: 'acad', name: 'ad', role: 'admin', pid: 'stiff', on: true },
        { id: 'acw', name: 'wren@mail', role: 'main', pid: 'dj', on: true, seenFrom: 5 },
        { id: 'ace', name: 'early@mail', role: 'main', pid: 'nact', on: false, offBy: 'po', seenFrom: 1 },
      ],
    })))
    expect(o['settings/accounts']).toBeNull()
    expect(o['settings/account:acad']).toEqual({ id: 'acad', name: 'ad', role: 'admin', pid: 'stiff', on: true })
    /* every line from 5 on is news to him: he has seen up to line 2, the last before it */
    expect(o['settings/account:acw'].seenFrom).toEqual({ at: 100, lineId: lineIdOfSeq(2) })
    /* from line 1 on — nothing before it: every line is news */
    expect(o['settings/account:ace']).toEqual({ id: 'ace', name: 'early@mail', role: 'main', pid: 'nact', on: false, offBy: 'po', seenFrom: { at: 0, lineId: '' } })
  })

  it('each request its own row, without who has seen it; each admin\'s seen his own row', () => {
    const o = out(accountsConverter.convert(snapWith({
      accessreqs: [
        { id: 'r1', name: 'kite@mail', cs: 'Kite', ini: '', seat: 'FCP', cat: 'C', at: 1, seenBy: ['acad', 'acb'] },
        { id: 'r2', name: 'lark@mail', cs: 'Lark', ini: 'L', seat: 'GND', cat: '', at: 2, seenBy: ['acad'] },
      ],
    })))
    expect(o['settings/accessreqs']).toBeNull()
    expect(o['settings/accessreq:r1']).toEqual({ id: 'r1', name: 'kite@mail', cs: 'Kite', ini: '', seat: 'FCP', cat: 'C', at: 1 })
    expect(o['settings/reqseen:acad']).toEqual({ userId: 'acad', seenRequestIds: ['r1', 'r2'] })
    expect(o['settings/reqseen:acb']).toEqual({ userId: 'acb', seenRequestIds: ['r1'] })
  })

  it('no accounts record (the seeded list) writes no account row', () => {
    expect(accountsConverter.convert(snapWith({}))).toEqual([])
  })
})
