import { describe, it, expect } from 'vitest'
import { CommandCore } from './core'
import { inverseChanges } from './undo'
import type { GateView } from './core'
import type { Change, Command } from './types'

let n = 0
const cmd = (changes: Change[], over: Partial<Command> = {}): Command =>
  ({ id: 'c' + ++n, ts: 0, principal: 'p1', origin: 'causal', kind: 't', changes, ...over })
const put = (id: string, after: unknown, baseVersion: number, before: unknown = null): Change =>
  ({ collection: 'inputs', id, op: 'put', before, after, baseVersion })

describe('F2 — a throwing subscriber does not fail the commit or starve others', () => {
  it('commit succeeds, other subscribers still fire, error is routed to the handler', () => {
    const core = new CommandCore()
    const errors: unknown[] = []
    core.setSubscriberErrorHandler((e) => errors.push(e))
    let bSaw = false
    core.subscribe(() => { throw new Error('boom') })
    core.subscribe(() => { bSaw = true })
    const r = core.commit(cmd([put('i1', 1, 0)]))
    expect(r.ok).toBe(true)      // the throw did not fail the commit
    expect(bSaw).toBe(true)      // the second subscriber still ran
    expect(errors).toHaveLength(1)
  })
})

describe('F6 — a re-entrant commit from a hook is rejected, outer state untouched', () => {
  it('a hook that calls commit gets reason:reentrant; the outer command still succeeds', () => {
    const core = new CommandCore()
    let inner: unknown
    core.registerHook((v: GateView) => {
      inner = core.commit(cmd([put('SNEAKY', 1, 0)]))
      return v.read('inputs', 'i1') ? [] : []
    }, ['leavewar'])
    const r = core.commit(cmd([put('i1', 1, 0)]))
    expect(r.ok).toBe(true)
    expect((inner as { reason?: string }).reason).toBe('reentrant')
    expect(core.read('inputs', 'SNEAKY')).toBeNull() // the re-entrant write did nothing
  })
})

describe('F7 — before is taken from the store, so undo restores correctly even if the caller lied', () => {
  it('a put with a wrong before:null on an existing record still undoes to the real prior value', () => {
    const core = new CommandCore()
    core.commit(cmd([put('i1', { a: 1 }, 0)]))            // v1 = {a:1}
    core.commit(cmd([put('i1', { a: 2 }, 1, null)]))       // caller LIES: before:null on an update
    const entry = core.stream().at(-1)!
    expect(entry.causalChanges[0].before).toEqual({ a: 1 }) // core overrode it authoritatively
    const inv = inverseChanges(entry.causalChanges, core)
    expect('changes' in inv).toBe(true)
    if ('changes' in inv) core.commit(cmd(inv.changes))
    expect(core.read('inputs', 'i1')!.value).toEqual({ a: 1 }) // restored, NOT deleted
    expect(core.read('inputs', 'i1')!.deleted).toBe(false)
  })
})

describe('F8 — deleting a record that never existed / already deleted is a no-op', () => {
  it('delete of a ghost mints no tombstone', () => {
    const core = new CommandCore()
    const r = core.commit(cmd([{ collection: 'inputs', id: 'ghost', op: 'delete', before: { fake: 1 }, after: null, baseVersion: 0 }]))
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.noop).toBe(true)
    expect(core.read('inputs', 'ghost')).toBeNull() // no phantom tombstone
  })
  it('delete of an already-deleted record is a no-op', () => {
    const core = new CommandCore()
    core.commit(cmd([put('i1', 1, 0)]))
    core.commit(cmd([{ collection: 'inputs', id: 'i1', op: 'delete', before: 1, after: null, baseVersion: 1 }])) // v2 tombstone
    const r = core.commit(cmd([{ collection: 'inputs', id: 'i1', op: 'delete', before: null, after: null, baseVersion: 2 }]))
    expect(r.ok && r.noop).toBe(true)
    expect(core.currentVersion('inputs', 'i1')).toBe(2) // unchanged
  })
})

describe('F9 — a derived change outside the hook declared collections fails the command', () => {
  it('a hook allowed only leavewar cannot write people', () => {
    const core = new CommandCore()
    core.registerHook(() => [{ collection: 'people', id: 'p1', op: 'put', before: null, after: 'x', baseVersion: 0 }], ['leavewar'])
    const r = core.commit(cmd([put('i1', 1, 0)]))
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.reason).toBe('derivation')
    expect(core.read('inputs', 'i1')).toBeNull()   // atomic
    expect(core.read('people', 'p1')).toBeNull()
  })
})

describe('F5 — the core stamps the derived baseVersion, so a hook wrong version is not a spurious conflict', () => {
  it('a hook returning a bogus baseVersion still commits (core uses the overlay version)', () => {
    const core = new CommandCore()
    core.registerHook((v: GateView) => {
      const inp = v.read('inputs', 'i1')
      if (!inp || inp.deleted) return []
      return [{ collection: 'leavewar', id: 'c1', op: 'put', before: null, after: 'ok', baseVersion: 999 }] // wrong on purpose
    }, ['leavewar'])
    const r = core.commit(cmd([put('i1', 1, 0)]))
    expect(r.ok).toBe(true)
    expect(core.read('leavewar', 'c1')!.value).toBe('ok')
  })
})
