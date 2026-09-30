// src/storage/seal.test.ts
/* [DB-READINESS] group A, phase 4.1 (plan §2.7, §8 P4-BATCH-ID) — THE WHITEBOARD'S SEAL AND THE TABLE EACH ROW BELONGS
   TO. One saved group = one user action with its causal children = one `ChangeBatch`. The whiteboard hands every
   transaction's net change to ONE sealer just before it is sent, and the sealer's entries (the batch row, and any old
   batch it purges) ride in the SAME group — so a batch never reaches storage apart from the rows it names. A group
   written outside a transaction is never sealed (the named exempt writers — phase 4.1's list). */
import { describe, it, expect } from 'vitest'
import { Whiteboard, type Change } from './whiteboard'
import { tableOf } from './tables'

describe('the seal', () => {
  it('a transaction group carries what the sealer adds, in the same group, and the map holds it', () => {
    const wb = new Whiteboard()
    const got: Change[][] = []
    wb.subscribe(g => got.push(g))
    const seen: Change[][] = []
    wb.setSealer(g => { seen.push(g.slice()); return [{ collection: 'changes', id: 'b1', value: JSON.stringify({ n: g.length }) }] })
    const tx = wb.transaction()
    wb.set('inputs', 'i1', 'a')
    wb.set('inputs', 'i2', 'b')
    tx.commit()
    expect(seen).toHaveLength(1)
    expect(seen[0]!.map(c => c.id)).toEqual(['i1', 'i2'])
    expect(got).toHaveLength(1)
    expect(got[0]!.map(c => `${c.collection}/${c.id}`)).toEqual(['inputs/i1', 'inputs/i2', 'changes/b1'])
    expect(wb.get('changes', 'b1')).toBe(JSON.stringify({ n: 2 }))
  })

  it('a sealer may remove an old row in the same group (the purge)', () => {
    const wb = new Whiteboard()
    wb.fill({ settings: {}, weeks: {}, inputs: {}, people: {}, plan: {}, leavewar: {}, tracker: {}, changes: { old: '{}' } })
    const got: Change[][] = []
    wb.subscribe(g => got.push(g))
    wb.setSealer(() => [{ collection: 'changes', id: 'new', value: '{}' }, { collection: 'changes', id: 'old', value: null }])
    const tx = wb.transaction()
    wb.set('people', 'p', 'x')
    tx.commit()
    expect(got[0]!.map(c => `${c.collection}/${c.id}=${c.value}`)).toEqual(['people/p=x', 'changes/new={}', 'changes/old=null'])
    expect(wb.has('changes', 'old')).toBe(false)
  })

  it('an empty net change is never sealed — nothing is sent', () => {
    const wb = new Whiteboard()
    const got: Change[][] = []
    wb.subscribe(g => got.push(g))
    let calls = 0
    wb.setSealer(() => { calls++; return [{ collection: 'changes', id: 'x', value: '{}' }] })
    const tx = wb.transaction()
    wb.set('inputs', 'i1', 'a')
    wb.delete('inputs', 'i1')          // back where it started: no net change
    tx.commit()
    expect(calls).toBe(0)
    expect(got).toHaveLength(0)
  })

  it('an aborted transaction is never sealed; a nested one seals only with the outermost', () => {
    const wb = new Whiteboard()
    const got: Change[][] = []
    wb.subscribe(g => got.push(g))
    let calls = 0
    wb.setSealer(() => { calls++; return [{ collection: 'changes', id: 'b' + calls, value: '{}' }] })
    const a = wb.transaction(); wb.set('inputs', 'i', 'a'); a.abort()
    expect(calls).toBe(0)
    const outer = wb.transaction()
    const inner = wb.transaction(); wb.set('inputs', 'i', 'b'); inner.commit()
    expect(calls).toBe(0)
    outer.commit()
    expect(calls).toBe(1)
    expect(got).toHaveLength(1)
  })

  it('a write outside any transaction is its own group and is never sealed', () => {
    const wb = new Whiteboard()
    const got: Change[][] = []
    wb.subscribe(g => got.push(g))
    let calls = 0
    wb.setSealer(() => { calls++; return [] })
    wb.set('tracker', 'v3:seedstamp', '1')
    expect(calls).toBe(0)
    expect(got).toEqual([[{ collection: 'tracker', id: 'v3:seedstamp', value: '1' }]])
  })

  it('a sealer that answers nothing adds nothing', () => {
    const wb = new Whiteboard()
    const got: Change[][] = []
    wb.subscribe(g => got.push(g))
    wb.setSealer(() => null)
    const tx = wb.transaction(); wb.set('inputs', 'i', 'a'); tx.commit()
    expect(got).toEqual([[{ collection: 'inputs', id: 'i', value: 'a' }]])
  })
})

/* a collection's keys are listed from its own index (the settings store's guard lists its rows on every command) — the
   index follows every write: a set, a delete, an abort, a savepoint rolled back, the seal's own entries, a fill */
describe('the keys of a collection', () => {
  it('follow every kind of write', () => {
    const wb = new Whiteboard()
    wb.fill({ settings: { a: '1', 'elog:x': '2' }, weeks: {}, inputs: { i1: 'v' }, people: {}, plan: {}, leavewar: {}, tracker: {}, changes: {} })
    expect(wb.keys('settings').sort()).toEqual(['a', 'elog:x'])
    wb.set('settings', 'b', '3'); wb.delete('settings', 'a')
    expect(wb.keys('settings').sort()).toEqual(['b', 'elog:x'])
    const tx = wb.transaction(); wb.set('settings', 'c', '4'); wb.delete('settings', 'b'); tx.abort()
    expect(wb.keys('settings').sort()).toEqual(['b', 'elog:x'])
    const t2 = wb.transaction(); const sp = t2.savepoint(); wb.set('inputs', 'i2', 'w'); t2.rollbackTo(sp); t2.commit()
    expect(wb.keys('inputs')).toEqual(['i1'])
    wb.setSealer(() => [{ collection: 'changes', id: 'b1', value: '{}' }])
    const t3 = wb.transaction(); wb.set('inputs', 'i3', 'z'); t3.commit()
    expect(wb.keys('changes')).toEqual(['b1'])
    expect(wb.keys('inputs').sort()).toEqual(['i1', 'i3'])
    wb.fill({ settings: {}, weeks: {}, inputs: {}, people: {}, plan: {}, leavewar: {}, tracker: {}, changes: {} })
    expect(wb.keys('inputs')).toEqual([])
  })
})

/* every stored row names ONE table of the design (plan §2.5's matrix) — what a batch's item says */
describe('the table each stored row belongs to', () => {
  const cases: Array<[string, string, string]> = [
    ['weeks', '13-07-2026', 'ScheduleWeek'],
    ['weeks', '13-07-2026#3', 'ScheduleDay'],
    /* P1-ISSUANCE-KEY (F3-09): a version id carries `#`, so `:is:` / `:rx:` are read before it */
    ['weeks', '13-07-2026:is:2026-07-13#ORIG~0', 'Amendment'],
    ['weeks', '13-07-2026:rx:2026-07-13#AL1~0', 'AmendmentRetraction'],
    ['inputs', 'i123', 'Input'],
    ['people', 'bane', 'Person'],
    ['plan', 'pp:pp123', 'PlanningPuck'],
    ['plan', 'dm:2026-07-13', 'DayRemark'],
    ['leavewar', 'war:w1', 'LeaveWar'],
    ['leavewar', 'rec:w1:r9', 'LeaveBid'],
    ['leavewar', 'ledger:l1', 'LeaveLedger'],
    ['leavewar', 'opening:bane:ll', 'LeaveOpening'],
    ['leavewar', 'profile:bane', 'LeavePersonProfile'],
    ['leavewar', 'groupcolors', 'Setting'],
    ['settings', 'schema', 'SchemaVersion'],
    ['settings', 'elog:c1.00001', 'EditLog'],
    ['settings', 'seen:bane', 'EditLogSeen'],
    ['settings', 'account:acad', 'User'],
    ['settings', 'accessreq:rq1', 'AccessRequest'],
    ['settings', 'reqseen:acad', 'AccessRequestSeen'],
    ['settings', 'rules', 'Setting'],
    ['changes', 'c1-4', 'ChangeBatch'],
    /* the Tracker's per-student records, each its own table (data-model.md §5 — the group-A final read, Astra 3) */
    ['tracker', 'v3:c1:sb2026:m:e7', 'Attempt'],
    ['tracker', 'v3:c1:sb2026:d:e7', 'Enrolment'],
    ['tracker', 'v3:c1:d:e7', 'Enrolment'],
    ['tracker', 'v3:c1:pace:e7', 'CoursePlan'],
    ['tracker', 'v3:c1:lulls:e7', 'CoursePlan'],
    ['tracker', 'v3:c1:plan', 'CoursePlan'],
    ['tracker', 'v3:c1:sb2026:enr:e7', 'Enrolment'],
    ['tracker', 'v3:master:course:c1', 'Course'],
    ['tracker', 'v3:master:chart:sb2026', 'Syllabus'],
    /* a ball's code may spell a word the later checks look for — its details row is read first */
    ['tracker', 'v3:master:info:sb2026:m', 'TrainingEvent'],
  ]
  for (const [c, id, t] of cases) it(`${c}/${id} → ${t}`, () => { expect(tableOf(c as any, id)).toBe(t) })
})
