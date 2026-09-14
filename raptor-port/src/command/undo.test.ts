import { describe, it, expect } from 'vitest'
import { inverseChanges } from './undo'
import { CommandCore } from './core'
import { sameContent } from './equal'
import type { Change, Command, GateView } from './core'

const put = (id: string, after: unknown, baseVersion: number, before: unknown = null): Change =>
  ({ collection: 'inputs', id, op: 'put', before, after, baseVersion })

// a version lookup standing in for the live store at undo time
const view = (versions: Record<string, number>): Pick<GateView, 'currentVersion'> =>
  ({ currentVersion: (c, id) => versions[`${c}/${id}`] ?? 0 })

describe('inverseChanges — the undo inverse table (spec §5)', () => {
  it('inverse of a create is a delete of the created value', () => {
    const inv = inverseChanges([put('i1', { a: 1 }, 0)], view({ 'inputs/i1': 1 }))
    expect(inv).toEqual([{ collection: 'inputs', id: 'i1', op: 'delete', before: { a: 1 }, after: null, baseVersion: 1 }])
  })

  it('inverse of an update restores the previous value', () => {
    const inv = inverseChanges([put('i1', { a: 2 }, 1, { a: 1 })], view({ 'inputs/i1': 2 }))
    expect(inv).toEqual([{ collection: 'inputs', id: 'i1', op: 'put', before: { a: 2 }, after: { a: 1 }, baseVersion: 2 }])
  })

  it('inverse of a delete restores the value that was deleted', () => {
    const inv = inverseChanges([{ collection: 'inputs', id: 'i1', op: 'delete', before: { a: 1 }, after: null, baseVersion: 1 }], view({ 'inputs/i1': 2 }))
    expect(inv).toEqual([{ collection: 'inputs', id: 'i1', op: 'put', before: null, after: { a: 1 }, baseVersion: 2 }])
  })

  it('the inverse precondition is the CURRENT version, never the original (RC4-306)', () => {
    // record created (v1) then edited by someone else (now v2); undo of the create
    // must carry baseVersion 2, so applying it goes through the conflict gate honestly.
    const inv = inverseChanges([put('i1', 'X', 0)], view({ 'inputs/i1': 2 }))
    expect(inv[0].baseVersion).toBe(2)
  })

  it('inverses are returned in REVERSE order of the original changes', () => {
    const inv = inverseChanges([put('a', 1, 0), put('b', 2, 0)], view({ 'inputs/a': 1, 'inputs/b': 1 }))
    expect(inv.map(c => c.id)).toEqual(['b', 'a'])
  })
})

describe('undo seam + derivation — derived side recomputes, not inverted (spec §5/§6)', () => {
  const mirror = (v: GateView): Change[] => {
    const inp = v.read('inputs', 'i1')
    const cur = v.read('leavewar', 'p1/d1')
    if (!inp || inp.deleted) {
      // input gone ⇒ desired: no cell. delete if one exists.
      return cur && !cur.deleted ? [{ collection: 'leavewar', id: 'p1/d1', op: 'delete', before: cur.value, after: null, baseVersion: v.currentVersion('leavewar', 'p1/d1') }] : []
    }
    const want = { from: (inp.value as { person: string }).person }
    if (cur && !cur.deleted && sameContent(cur.value, want)) return []
    return [{ collection: 'leavewar', id: 'p1/d1', op: 'put', before: cur && !cur.deleted ? cur.value : null, after: want, baseVersion: v.currentVersion('leavewar', 'p1/d1') }]
  }
  let n = 0
  const cmd = (changes: Change[]): Command => ({ id: 'c' + ++n, ts: 0, principal: 'p1', origin: 'causal', kind: 't', changes })

  it('undoing the causal input change recomputes the derived cell away (no phantom leftover)', () => {
    const core = new CommandCore()
    core.registerHook(mirror)
    core.commit(cmd([put('i1', { person: 'A' }, 0)]))
    expect(core.read('leavewar', 'p1/d1')!.value).toEqual({ from: 'A' })

    // undo: invert ONLY the causal change (the entry records causalChanges), commit it
    const entry = core.stream().at(-1)!
    const inv = inverseChanges(entry.causalChanges, core)
    const r = core.commit(cmd(inv))
    expect(r.ok).toBe(true)
    expect(core.read('inputs', 'i1')!.deleted).toBe(true)          // input reverted
    expect(core.read('leavewar', 'p1/d1')!.deleted).toBe(true)      // derived cell recomputed away
  })
})
