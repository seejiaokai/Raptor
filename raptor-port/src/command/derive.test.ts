import { describe, it, expect } from 'vitest'
import { CommandCore } from './core'
import { sameContent } from './equal'
import type { GateView } from './core'
import type { Change, Command } from './types'

let n = 0
const cmd = (changes: Change[], over: Partial<Command> = {}): Command => ({
  id: 'c' + ++n, ts: 0, principal: 'p1', origin: 'causal', kind: 'test', changes, ...over,
})
const put = (collection: string, id: string, after: unknown, baseVersion: number, before: unknown = null): Change =>
  ({ collection, id, op: 'put', before, after, baseVersion })

// A toy "sync" hook: mirror inputs/i1 into a leavewar cell — a proper desired−actual
// projection, so it reaches a fixed point after one pass.
const mirrorHook = (view: GateView): Change[] => {
  const inp = view.read('inputs', 'i1')
  if (!inp || inp.deleted) return []
  const want = { from: (inp.value as { person: string }).person }
  const cur = view.read('leavewar', 'p1/d1')
  if (cur && !cur.deleted && sameContent(cur.value, want)) return []
  return [{ collection: 'leavewar', id: 'p1/d1', op: 'put', before: cur && !cur.deleted ? cur.value : null, after: want, baseVersion: view.currentVersion('leavewar', 'p1/d1') }]
}

describe('derivation hooks — inside the causal transaction (spec §2.4 step 2)', () => {
  it('a hook adds a derived change that commits atomically with the causal one', () => {
    const core = new CommandCore()
    core.registerHook(mirrorHook)
    const r = core.commit(cmd([put('inputs', 'i1', { person: 'ALPHA' }, 0)]))
    expect(r.ok).toBe(true)
    expect(core.read('inputs', 'i1')!.value).toEqual({ person: 'ALPHA' })
    expect(core.read('leavewar', 'p1/d1')!.value).toEqual({ from: 'ALPHA' }) // derived, same command
    // both are in the single stream entry
    if (r.ok && r.seq) expect(core.stream().at(-1)!.command.changes.length).toBe(2)
  })

  it('a well-behaved projection reaches a fixed point (second dry-run pass is empty)', () => {
    const core = new CommandCore()
    core.registerHook(mirrorHook)
    expect(core.commit(cmd([put('inputs', 'i1', { person: 'A' }, 0)])).ok).toBe(true)
    // re-committing an unrelated record still converges (mirror is a no-op the 2nd time)
    const r = core.commit(cmd([put('inputs', 'i2', { person: 'B' }, 0)]))
    expect(r.ok).toBe(true)
  })

  it('a non-converging hook (never a fixed point) fails the whole command; nothing applied', () => {
    const core = new CommandCore()
    let k = 0
    core.registerHook((view) => {
      // always wants a NEW value → the dry-run pass is never empty
      return [{ collection: 'derived', id: 'x', op: 'put', before: null, after: ++k, baseVersion: view.currentVersion('derived', 'x') }]
    })
    const r = core.commit(cmd([put('inputs', 'i1', 1, 0)]))
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.reason).toBe('derivation')
    expect(core.read('inputs', 'i1')).toBeNull() // causal change rolled back too
  })

  it('a hook that must refuse (throws) fails the whole command atomically', () => {
    const core = new CommandCore()
    core.registerHook(() => { throw new Error('input lands on a quarantined week') })
    const r = core.commit(cmd([put('inputs', 'i1', 1, 0)]))
    expect(r.ok).toBe(false)
    if (!r.ok) { expect(r.reason).toBe('derivation'); expect(r.message).toContain('quarantined') }
    expect(core.read('inputs', 'i1')).toBeNull()
  })

  it('a derived change is still subject to the frozen boundary', () => {
    const core = new CommandCore()
    core.registerFrozen((c) => c === 'leavewar')
    core.registerHook(mirrorHook)
    const r = core.commit(cmd([put('inputs', 'i1', { person: 'A' }, 0)]))
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.reason).toBe('frozen')
    expect(core.read('inputs', 'i1')).toBeNull() // atomic: causal not applied either
  })

  it('a hook may not change a record the command already targets (one change per record)', () => {
    const core = new CommandCore()
    core.registerHook((view) => [put('inputs', 'i1', { person: 'HIJACK' }, view.currentVersion('inputs', 'i1'))])
    const r = core.commit(cmd([put('inputs', 'i1', { person: 'A' }, 0)]))
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.reason).toBe('derivation')
  })
})
