/* [DB-READINESS] group A, phase 5b (owner D462, 30 Sep 26 — THE TRACKER ONE PIECE PER THING; D464 — his charts,
   syllabi and every ball's details are KEPT). The Tracker's own records that held several people's or several charts'
   work in one record — a course and chart's student list, the course list, and the charts (their definitions, names,
   order, hidden and deleted marks, and the details typed on each ball) — are stored one row per thing. This file pins
   the ROW DOOR (`app/rows.js`), the one pure module that turns each of those records into its rows and back, so the
   Tracker, the fold and the tests cannot drift apart:
   - a student list → one row per enrolment, `v3:<course>:<chart>:enr:<id>`, with its place (`ord`);
   - the course list and the deleted courses → one row per course, `v3:master:course:<id>` (a deleted one says so);
   - the charts → one row per chart, `v3:master:chart:<id>` — its name, place, hidden / deleted marks and events;
   - the details typed on the balls → one row per chart and ball, `v3:master:info:<chart>:<ball>`.
   A save writes only the rows its own list changed, compared with what THIS client last read — so two people's work on
   two different things never overwrites. */
import { describe, expect, it } from 'vitest'
import { logicalOf, joinRows, splitValue, emptyOf, isRowKey, foldTracker, ROW } from './rows.js'

type Fam = Map<string, string>
const L = (k: string) => { const l = logicalOf(k); if (!l) throw new Error('not a split record: ' + k); return l }
/* apply a split's changes to a family, as storage would */
function apply(fam: Fam, ch: Map<string, string | null>): Fam {
  const out = new Map(fam)
  for (const [k, v] of ch) { if (v === null) out.delete(k); else out.set(k, v) }
  return out
}
const put = (k: string, v: unknown, fam: Fam = new Map()) => { const ch = splitValue(L(k), JSON.stringify(v), fam); expect(ch, 'splittable').not.toBeNull(); return apply(fam, ch!) }
const get = (k: string, fam: Fam) => joinRows(L(k), fam)

const RK = 'v3:c1:sb2026:roster'
const A = { id: 'sAAA', name: 'ALPHA' }, B = { id: 'sBBB', name: 'BRAVO', pid: 'p7' }, C = { id: 'sCCC', name: 'CHARLIE' }

describe('which records are split, and where their rows live', () => {
  it('names the student lists, the course lists and the chart records — nothing else', () => {
    expect(L(RK)).toMatchObject({ kind: 'roster', prefix: 'v3:c1:sb2026:enr:' })
    expect(L('v3:courses')).toMatchObject({ kind: 'courses', prefix: ROW.course })
    expect(L('v3:delcourses')).toMatchObject({ kind: 'delcourses', prefix: ROW.course })
    for (const k of ['sylcat', 'sylorder', 'sylhidden', 'syltomb', 'syls']) expect(L('v3:master:' + k)).toMatchObject({ kind: k, prefix: ROW.chart })
    expect(L('v3:master:eventinfo')).toMatchObject({ kind: 'eventinfo', prefix: ROW.info })
    for (const k of ['v3:c1:sb2026:m:sAAA', 'v3:c1:plan', 'v3:master:lay:sb2026', 'v3:c1:roster', 'v3:courseidmig', 'v3:eventinfo']) expect(logicalOf(k), k).toBeNull()
  })
  it('knows a row key when it sees one', () => {
    expect(isRowKey('v3:c1:sb2026:enr:sAAA')).toBe(true)
    expect(isRowKey('v3:master:course:c1')).toBe(true)
    expect(isRowKey('v3:master:chart:sb2026')).toBe(true)
    expect(isRowKey('v3:master:info:sb2026:ST-01')).toBe(true)
    expect(isRowKey('v3:c1:sb2026:roster')).toBe(false)
  })
  it('an empty record reads as an empty list or table; the details as nothing stored', () => {
    expect(emptyOf(L(RK))).toBe('[]')
    expect(emptyOf(L('v3:master:syltomb'))).toBe('{}')
    expect(emptyOf(L('v3:master:syls'))).toBe('{}')
    expect(emptyOf(L('v3:master:eventinfo'))).toBeNull()
    expect(get(RK, new Map())).toBeNull()
  })
})

describe('a student list: one row per enrolment, with its place', () => {
  it('round-trips exactly — order, every field — and each row names one student', () => {
    const fam = put(RK, [A, B, C])
    expect([...fam.keys()].sort()).toEqual(['v3:c1:sb2026:enr:sAAA', 'v3:c1:sb2026:enr:sBBB', 'v3:c1:sb2026:enr:sCCC'])
    expect(JSON.parse(fam.get('v3:c1:sb2026:enr:sBBB')!)).toMatchObject({ id: 'sBBB', name: 'BRAVO', pid: 'p7' })
    expect(get(RK, fam)).toBe(JSON.stringify([A, B, C]))
  })
  it('adding one student writes ONE row; the others are not touched', () => {
    const fam = put(RK, [A, B])
    const ch = splitValue(L(RK), JSON.stringify([A, B, C]), fam)!
    expect([...ch.keys()]).toEqual(['v3:c1:sb2026:enr:sCCC'])
    expect(get(RK, apply(fam, ch))).toBe(JSON.stringify([A, B, C]))
  })
  it('a student put at the TOP writes one row, placed above the first', () => {
    const fam = put(RK, [A, B])
    const ch = splitValue(L(RK), JSON.stringify([C, A, B]), fam)!
    expect([...ch.keys()]).toEqual(['v3:c1:sb2026:enr:sCCC'])
    expect(get(RK, apply(fam, ch))).toBe(JSON.stringify([C, A, B]))
  })
  it('a student moved writes only that row', () => {
    const fam = put(RK, [A, B, C])
    const ch = splitValue(L(RK), JSON.stringify([B, C, A]), fam)!
    expect([...ch.keys()]).toEqual(['v3:c1:sb2026:enr:sAAA'])
    expect(get(RK, apply(fam, ch))).toBe(JSON.stringify([B, C, A]))
  })
  it('a student renamed writes only that row; a student removed removes only that row', () => {
    const fam = put(RK, [A, B, C])
    const ren = splitValue(L(RK), JSON.stringify([A, { ...B, name: 'BRAVO TWO' }, C]), fam)!
    expect([...ren.keys()]).toEqual(['v3:c1:sb2026:enr:sBBB'])
    const rm = splitValue(L(RK), JSON.stringify([A, C]), fam)!
    expect([...rm.entries()]).toEqual([['v3:c1:sb2026:enr:sBBB', null]])
  })
  it('a row this client never read is NEVER removed by its save (another person added it meanwhile)', () => {
    const mine = put(RK, [A, B])                                    // what this client read
    const theirs = put(RK, [A, B, C])                               // another client added CHARLIE
    const ch = splitValue(L(RK), JSON.stringify([A]), mine)!        // this client removes BRAVO, never having seen CHARLIE
    const stored = apply(theirs, ch)
    expect(JSON.parse(get(RK, stored)!).map((e: any) => e.name)).toEqual(['ALPHA', 'CHARLIE'])
  })
  it('two people adding one student each at the same moment: both remain, read in the same order everywhere', () => {
    const start = put(RK, [A])
    const one = splitValue(L(RK), JSON.stringify([A, B]), start)!
    const two = splitValue(L(RK), JSON.stringify([A, C]), start)!
    const stored = apply(apply(start, one), two)
    const read = JSON.parse(get(RK, stored)!).map((e: any) => e.id)
    expect(read).toEqual(['sAAA', 'sBBB', 'sCCC'])                  // same place: the tie is broken by the id
    expect(JSON.parse(get(RK, apply(apply(start, two), one))!).map((e: any) => e.id)).toEqual(read)
  })
  it('a row that cannot be read is kept as it is: never read, never removed', () => {
    const fam = put(RK, [A, B])
    fam.set('v3:c1:sb2026:enr:sBAD', '{not json')
    expect(JSON.parse(get(RK, fam)!).map((e: any) => e.id)).toEqual(['sAAA', 'sBBB'])
    const ch = splitValue(L(RK), JSON.stringify([A]), fam)!
    expect(ch.has('v3:c1:sb2026:enr:sBAD')).toBe(false)
  })
  it('an old list that is not all students with ids (names only, a doubled id, a colon in an id) is not split', () => {
    expect(splitValue(L(RK), JSON.stringify(['ALPHA', 'BRAVO']), new Map())).toBeNull()
    expect(splitValue(L(RK), JSON.stringify([A, A]), new Map())).toBeNull()
    expect(splitValue(L(RK), JSON.stringify([{ id: 's:1', name: 'X' }]), new Map())).toBeNull()
    expect(splitValue(L(RK), '{not json', new Map())).toBeNull()
  })
})

describe('the course list and the deleted courses: one row per course', () => {
  const C1 = { id: 'c1aaa', name: '26ABSG' }, C2 = { id: 'c2bbb', name: '27B' }, C3 = { id: 'c3ccc', name: 'OLD' }
  it('both lists round-trip from ONE family of course rows; a deleted course says so', () => {
    let fam = put('v3:courses', [C1, C2])
    fam = put('v3:delcourses', [C3], fam)
    expect(get('v3:courses', fam)).toBe(JSON.stringify([C1, C2]))
    expect(get('v3:delcourses', fam)).toBe(JSON.stringify([C3]))
    expect(JSON.parse(fam.get(ROW.course + 'c3ccc')!)).toMatchObject({ id: 'c3ccc', name: 'OLD', deleted: true })
  })
  it('deleting a course moves ONE row across (the live list, then the deleted list, in one save)', () => {
    let fam = put('v3:courses', [C1, C2])
    const a = splitValue(L('v3:courses'), JSON.stringify([C1]), fam)!
    fam = apply(fam, a)
    const b = splitValue(L('v3:delcourses'), JSON.stringify([C2]), fam)!
    const both = apply(fam, b)
    expect(get('v3:courses', both)).toBe(JSON.stringify([C1]))
    expect(get('v3:delcourses', both)).toBe(JSON.stringify([C2]))
    expect(both.size).toBe(2)
  })
  it('saving one list never touches the other list\'s rows', () => {
    let fam = put('v3:courses', [C1])
    fam = put('v3:delcourses', [C3], fam)
    const ch = splitValue(L('v3:courses'), JSON.stringify([C1, C2]), fam)!
    expect([...ch.keys()]).toEqual([ROW.course + 'c2bbb'])
  })
  it('a course renamed is one row; the old list of bare names is not split', () => {
    const fam = put('v3:courses', [C1, C2])
    expect([...splitValue(L('v3:courses'), JSON.stringify([C1, { ...C2, name: '27BB' }]), fam)!.keys()]).toEqual([ROW.course + 'c2bbb'])
    expect(splitValue(L('v3:courses'), JSON.stringify(['26ABSG']), new Map())).toBeNull()
  })
})

describe('the charts: one row per chart — its name, place, hidden and deleted marks, and its events', () => {
  const cat = [{ id: 'sb2024', name: '2024', base: '2024' }, { id: 'sb2026', name: '2026', base: '2026' }, { id: 'sc1abc', name: 'MY CHART', userNamed: true }]
  const defs = { sb2026: [{ id: 'ST-01', type: 'flight', seq: 1, prereqs: [], phase: 'P' }], sc1abc: [{ id: 'X-1', type: 'sim', seq: 0, prereqs: [], phase: 'Q' }] }
  function world() {
    let fam = put('v3:master:syls', defs)
    fam = put('v3:master:sylcat', cat, fam)
    fam = put('v3:master:sylorder', ['sc1abc', 'sb2026', 'sb2024'], fam)
    fam = put('v3:master:sylhidden', ['sb2024'], fam)
    fam = put('v3:master:syltomb', { sbtx2026: 1 }, fam)
    return fam
  }
  it('every chart record reads back as it was saved', () => {
    const fam = world()
    expect(JSON.parse(get('v3:master:syls', fam)!)).toEqual(defs)
    expect(JSON.parse(get('v3:master:sylorder', fam)!)).toEqual(['sc1abc', 'sb2026', 'sb2024'])
    expect(JSON.parse(get('v3:master:sylhidden', fam)!)).toEqual(['sb2024'])
    expect(JSON.parse(get('v3:master:syltomb', fam)!)).toEqual({ sbtx2026: 1 })
    const back = JSON.parse(get('v3:master:sylcat', fam)!)
    expect([...back].sort((a: any, b: any) => a.id < b.id ? -1 : 1)).toEqual([...cat].sort((a, b) => a.id < b.id ? -1 : 1))
  })
  it('one row per chart id: a deleted built-in has a row of its own (its deleted mark), nothing else', () => {
    const fam = world()
    expect([...fam.keys()].sort()).toEqual(['sb2024', 'sb2026', 'sbtx2026', 'sc1abc'].map(i => ROW.chart + i))
    expect(JSON.parse(fam.get(ROW.chart + 'sbtx2026')!)).toEqual({ id: 'sbtx2026', tomb: 1 })
    expect(JSON.parse(fam.get(ROW.chart + 'sc1abc')!)).toMatchObject({ id: 'sc1abc', name: 'MY CHART', userNamed: true, def: defs.sc1abc })
  })
  it('a chart\'s events edited is ONE row; renaming another chart is ONE row', () => {
    const fam = world()
    const edit = splitValue(L('v3:master:syls'), JSON.stringify({ ...defs, sc1abc: [...defs.sc1abc, { id: 'X-2', type: 'sim', seq: 1, prereqs: ['X-1'], phase: 'Q' }] }), fam)!
    expect([...edit.keys()]).toEqual([ROW.chart + 'sc1abc'])
    const ren = splitValue(L('v3:master:sylcat'), JSON.stringify(cat.map(e => e.id === 'sb2026' ? { ...e, name: '2026 NEW', userNamed: true } : e)), fam)!
    expect([...ren.keys()]).toEqual([ROW.chart + 'sb2026'])
  })
  it('two people editing two different charts at once: both remain', () => {
    const start = world()
    const one = splitValue(L('v3:master:syls'), JSON.stringify({ ...defs, sc1abc: [] }), start)!
    const two = splitValue(L('v3:master:syls'), JSON.stringify({ ...defs, sb2026: [...defs.sb2026, { id: 'ST-02', type: 'flight', seq: 2, prereqs: [], phase: 'P' }] }), start)!
    const stored = apply(apply(start, one), two)
    const read = JSON.parse(get('v3:master:syls', stored)!)
    expect(read.sc1abc).toEqual([])
    expect(read.sb2026.map((e: any) => e.id)).toEqual(['ST-01', 'ST-02'])
  })
  it('a chart whose last part goes (a custom deleted outright) loses its row', () => {
    let fam = world()
    fam = apply(fam, splitValue(L('v3:master:syls'), JSON.stringify({ sb2026: defs.sb2026 }), fam)!)
    fam = apply(fam, splitValue(L('v3:master:sylcat'), JSON.stringify(cat.filter(e => e.id !== 'sc1abc')), fam)!)
    fam = apply(fam, splitValue(L('v3:master:sylorder'), JSON.stringify(['sb2026', 'sb2024']), fam)!)
    expect(fam.has(ROW.chart + 'sc1abc')).toBe(false)
  })
  it('the old name-keyed records (before chart ids) are not split', () => {
    expect(splitValue(L('v3:master:syls'), JSON.stringify({ '2026': [] }), new Map())).toBeNull()
    expect(splitValue(L('v3:master:sylorder'), JSON.stringify(['2026', 'Tx 2026']), new Map())).toBeNull()
    expect(splitValue(L('v3:master:sylhidden'), JSON.stringify(['Tx 2026']), new Map())).toBeNull()
  })
})

describe('the details typed on each ball: one row per chart and ball (D126, D464)', () => {
  const info = { sb2026: { 'ST-01': { name: 'Start', fmt: 'Lecture' }, 'A:B%C': { hrs: '1.5' } }, sc1abc: { 'X-1': { crew: '2' } } }
  it('round-trip: every detail on every ball of every chart, a ball code with a colon or a % included', () => {
    const fam = put('v3:master:eventinfo', info)
    expect(fam.size).toBe(3)
    expect([...fam.keys()].every(k => k.startsWith(ROW.info))).toBe(true)
    expect(JSON.parse(get('v3:master:eventinfo', fam)!)).toEqual(info)
  })
  it('a detail typed on one ball writes ONE row; two people on two balls of one chart both remain', () => {
    const start = put('v3:master:eventinfo', info)
    const one = splitValue(L('v3:master:eventinfo'), JSON.stringify({ ...info, sb2026: { ...info.sb2026, 'ST-01': { name: 'Begin' } } }), start)!
    const two = splitValue(L('v3:master:eventinfo'), JSON.stringify({ ...info, sb2026: { ...info.sb2026, 'ST-09': { fmt: 'Sim' } } }), start)!
    expect(one.size).toBe(1); expect(two.size).toBe(1)
    const read = JSON.parse(get('v3:master:eventinfo', apply(apply(start, one), two))!)
    expect(read.sb2026['ST-01']).toEqual({ name: 'Begin' })
    expect(read.sb2026['ST-09']).toEqual({ fmt: 'Sim' })
    expect(read.sb2026['A:B%C']).toEqual({ hrs: '1.5' })
  })
})

describe('the one-time conversion of a browser\'s old records (the fold\'s `tracker` converter — D464: every chart, layout and detail kept)', () => {
  it('turns every old record into its rows, removes the old record, and leaves everything else exactly as it is', () => {
    const old: Record<string, string> = {
      'v3:courses': JSON.stringify([{ id: 'c1aaa', name: '26ABSG' }, { id: 'c2bbb', name: '27B' }]),
      'v3:delcourses': JSON.stringify([{ id: 'c3ccc', name: 'OLD' }]),
      'v3:c1aaa:sb2026:roster': JSON.stringify([A, B]),
      'v3:c2bbb:sc1abc:roster': JSON.stringify([C]),
      'v3:master:syls': JSON.stringify({ sc1abc: [{ id: 'X-1', type: 'sim', seq: 0, prereqs: [], phase: 'Q' }] }),
      'v3:master:sylcat': JSON.stringify([{ id: 'sb2026', name: '2026', base: '2026' }, { id: 'sc1abc', name: 'MY CHART', userNamed: true }]),
      'v3:master:sylorder': JSON.stringify(['sc1abc', 'sb2026']),
      'v3:master:sylhidden': JSON.stringify([]),
      'v3:master:syltomb': JSON.stringify({ sbtx2026: 1 }),
      'v3:master:eventinfo': JSON.stringify({ sb2026: { 'ST-01': { name: 'Start' } } }),
      'v3:master:lay:sc1abc': JSON.stringify({ 'X-1': { x: 10, y: 20 }, __font: { 'X-1': 9 } }),
      'v3:c1aaa:sb2026:m:sAAA': JSON.stringify({ 'ST-01': { g: 'dco' } }),
      'v3:c1aaa:plan': JSON.stringify({ sylId: 'sb2026', lulls: [] }),
      'v3:sylcatmig': '1',
    }
    const out = foldTracker(old)
    const after = new Map(Object.entries(old))
    for (const e of out) { if (e.value === null) after.delete(e.id); else after.set(e.id, e.value) }
    for (const k of ['v3:courses', 'v3:delcourses', 'v3:c1aaa:sb2026:roster', 'v3:c2bbb:sc1abc:roster', 'v3:master:syls', 'v3:master:sylcat',
      'v3:master:sylorder', 'v3:master:sylhidden', 'v3:master:syltomb', 'v3:master:eventinfo']) expect(after.has(k), k + ' removed').toBe(false)
    const fam = (pre: string) => new Map([...after].filter(([k]) => k.startsWith(pre)))
    expect(get('v3:courses', fam(ROW.course))).toBe(old['v3:courses'])
    expect(get('v3:delcourses', fam(ROW.course))).toBe(old['v3:delcourses'])
    expect(get('v3:c1aaa:sb2026:roster', fam('v3:c1aaa:sb2026:enr:'))).toBe(old['v3:c1aaa:sb2026:roster'])
    expect(get('v3:c2bbb:sc1abc:roster', fam('v3:c2bbb:sc1abc:enr:'))).toBe(old['v3:c2bbb:sc1abc:roster'])
    for (const k of ['v3:master:syls', 'v3:master:sylorder', 'v3:master:syltomb', 'v3:master:eventinfo'])
      expect(JSON.parse(get(k, fam(k === 'v3:master:eventinfo' ? ROW.info : ROW.chart)) ?? 'null'), k).toEqual(JSON.parse(old[k]!))
    /* the catalogue's own list order is not kept — it reads in the charts' display order (the one order a chart row
       carries, `sylorder`'s); every entry, field for field, is */
    const byId = (l: any[]) => [...l].sort((a, b) => (a.id < b.id ? -1 : 1))
    expect(byId(JSON.parse(get('v3:master:sylcat', fam(ROW.chart))!))).toEqual(byId(JSON.parse(old['v3:master:sylcat']!)))
    /* the layout, the marks, the plan and the flags: untouched, byte for byte */
    for (const k of ['v3:master:lay:sc1abc', 'v3:c1aaa:sb2026:m:sAAA', 'v3:c1aaa:plan', 'v3:sylcatmig']) expect(after.get(k), k).toBe(old[k])
    /* and the details' conversion is marked done, so an older one-table record is never read again */
    expect(after.get('v3:eventinfomig')).toBe('1')
  })
  it('an old record it cannot split (names only, from before the ids) is left exactly as it is', () => {
    const old = { 'v3:courses': JSON.stringify(['26ABSG']), 'v3:26ABSG:2026:roster': JSON.stringify(['ALPHA']) }
    expect(foldTracker(old)).toEqual([])
  })
  it('a store with nothing of the Tracker\'s converts nothing', () => {
    expect(foldTracker({})).toEqual([])
  })
})
