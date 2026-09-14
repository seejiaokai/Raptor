import { describe, it, expect } from 'vitest'
import { inverseChanges } from './undo'
import { CommandCore } from './core'
import { sameContent } from './equal'
import type { GateView } from './core'
import type { Change, Command, RecordState } from './types'

const put = (id: string, after: unknown, baseVersion: number, before: unknown = null): Change =>
  ({ collection: 'inputs', id, op: 'put', before, after, baseVersion })

// a view whose read() reports each record still holding the given value (so the
// content precondition passes) — for the pure shape tests.
const viewHolding = (records: Record<string, { value: unknown; version: number; deleted?: boolean }>): GateView => ({
  read: (c, id) => {
    const r = records[`${c}/${id}`]
    return r ? ({ value: r.value, version: r.version, deleted: !!r.deleted } as RecordState) : null
  },
  currentVersion: (c, id) => records[`${c}/${id}`]?.version ?? 0,
})

let n = 0
const cmd = (changes: Change[], over: Partial<Command> = {}): Command =>
  ({ id: 'c' + ++n, ts: 0, principal: 'p1', origin: 'causal', kind: 't', changes, ...over })

describe('inverseChanges — inverse table (spec §5)', () => {
  it('inverse of a create is a delete of the created value', () => {
    const r = inverseChanges([put('i1', { a: 1 }, 0)], viewHolding({ 'inputs/i1': { value: { a: 1 }, version: 1 } }))
    expect('changes' in r && r.changes).toEqual([{ collection: 'inputs', id: 'i1', op: 'delete', before: { a: 1 }, after: null, baseVersion: 1 }])
  })
  it('inverse of an update restores the previous value', () => {
    const r = inverseChanges([put('i1', { a: 2 }, 1, { a: 1 })], viewHolding({ 'inputs/i1': { value: { a: 2 }, version: 2 } }))
    expect('changes' in r && r.changes).toEqual([{ collection: 'inputs', id: 'i1', op: 'put', before: { a: 2 }, after: { a: 1 }, baseVersion: 2 }])
  })
  it('inverse of a delete restores the deleted value', () => {
    const r = inverseChanges([{ collection: 'inputs', id: 'i1', op: 'delete', before: { a: 1 }, after: null, baseVersion: 1 }], viewHolding({ 'inputs/i1': { value: null, version: 2, deleted: true } }))
    expect('changes' in r && r.changes).toEqual([{ collection: 'inputs', id: 'i1', op: 'put', before: null, after: { a: 1 }, baseVersion: 2 }])
  })
  it('inverses are returned in REVERSE order', () => {
    const r = inverseChanges([put('a', 1, 0), put('b', 2, 0)], viewHolding({ 'inputs/a': { value: 1, version: 1 }, 'inputs/b': { value: 2, version: 1 } }))
    expect('changes' in r && r.changes.map(c => c.id)).toEqual(['b', 'a'])
  })
})

describe('undo BLOCKS a later edit — never clobbers (F1/INC1-001)', () => {
  it('refuses to undo a create once someone else has edited the record', () => {
    const core = new CommandCore()
    core.commit(cmd([put('i1', 'X', 0)]))             // p1 creates (v1)
    core.commit(cmd([put('i1', 'Y', 1)], { principal: 'p2' })) // p2 edits (v2)
    const entry = core.stream()[0]                    // p1's create
    const r = inverseChanges(entry.causalChanges, core)
    expect('blocked' in r).toBe(true)                 // undo refused
    expect(core.read('inputs', 'i1')!.value).toBe('Y') // p2's edit stands
  })

  it('allows a LIFO undo chain (undo the last, then the previous, on the same record)', () => {
    const core = new CommandCore()
    core.commit(cmd([put('r', 'X', 0)]))  // e0 create -> v1
    core.commit(cmd([put('r', 'Y', 1)]))  // e1 update -> v2
    // undo e1
    const inv1 = inverseChanges(core.stream()[1].causalChanges, core)
    expect('changes' in inv1).toBe(true)
    if ('changes' in inv1) expect(core.commit(cmd(inv1.changes)).ok).toBe(true)
    expect(core.read('inputs', 'r')!.value).toBe('X')
    // now undo e0 — still valid because r currently holds X (what e0 left)
    const inv0 = inverseChanges(core.stream()[0].causalChanges, core)
    expect('changes' in inv0).toBe(true)
    if ('changes' in inv0) expect(core.commit(cmd(inv0.changes)).ok).toBe(true)
    expect(core.read('inputs', 'r')!.deleted).toBe(true)
  })
})

describe('undo + derivation — derived side recomputes (spec §5/§6)', () => {
  const mirror = (v: GateView): Change[] => {
    const inp = v.read('inputs', 'i1')
    const cur = v.read('leavewar', 'p1/d1')
    if (!inp || inp.deleted) return cur && !cur.deleted ? [{ collection: 'leavewar', id: 'p1/d1', op: 'delete', before: cur.value, after: null, baseVersion: v.currentVersion('leavewar', 'p1/d1') }] : []
    const want = { from: (inp.value as { person: string }).person }
    if (cur && !cur.deleted && sameContent(cur.value, want)) return []
    return [{ collection: 'leavewar', id: 'p1/d1', op: 'put', before: cur && !cur.deleted ? cur.value : null, after: want, baseVersion: v.currentVersion('leavewar', 'p1/d1') }]
  }
  it('undoing the causal input recomputes the derived cell away', () => {
    const core = new CommandCore()
    core.registerHook(mirror, ['leavewar'])
    core.commit(cmd([put('i1', { person: 'A' }, 0)]))
    expect(core.read('leavewar', 'p1/d1')!.value).toEqual({ from: 'A' })
    const r = inverseChanges(core.stream().at(-1)!.causalChanges, core)
    expect('changes' in r).toBe(true)
    if ('changes' in r) expect(core.commit(cmd(r.changes)).ok).toBe(true)
    expect(core.read('inputs', 'i1')!.deleted).toBe(true)
    expect(core.read('leavewar', 'p1/d1')!.deleted).toBe(true)
  })
})
