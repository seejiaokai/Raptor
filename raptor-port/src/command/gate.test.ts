import { describe, it, expect } from 'vitest'
import { CommandCore } from './core'
import type { Change, Command } from './types'

let n = 0
const cmd = (changes: Change[], over: Partial<Command> = {}): Command => ({
  id: 'c' + ++n, ts: 0, principal: 'p1', origin: 'causal', kind: 'test', changes, ...over,
})
const put = (collection: string, id: string, after: unknown, baseVersion: number, before: unknown = null): Change =>
  ({ collection, id, op: 'put', before, after, baseVersion })

describe('gate — authorization policy', () => {
  it('with no policy registered, a collection is permitted (the core is mechanism, not policy)', () => {
    const core = new CommandCore()
    expect(core.commit(cmd([put('inputs', 'i1', 1, 0)])).ok).toBe(true)
  })

  it('a per-collection policy can refuse a change, rejecting the whole command with its reason', () => {
    const core = new CommandCore()
    // members may only write their OWN input (ownership read from before/after)
    core.registerPolicy('inputs', (ch, c) => {
      const owner = (ch.after as { person?: string } | null)?.person
      return c.principal === 'admin' || owner === c.principal ? true : 'not your input'
    })
    const mine = core.commit(cmd([put('inputs', 'i1', { person: 'p1' }, 0)], { principal: 'p1' }))
    expect(mine.ok).toBe(true)
    const theirs = core.commit(cmd([put('inputs', 'i2', { person: 'p2' }, 0)], { principal: 'p1' }))
    expect(theirs.ok).toBe(false)
    if (theirs.ok) return
    expect(theirs.reason).toBe('unauthorized')
    expect(theirs.message).toBe('not your input')
    expect(core.read('inputs', 'i2')).toBeNull() // nothing applied
  })

  it('the policy sees the read-only view (ownership can be read from the existing record)', () => {
    const core = new CommandCore()
    core.commit(cmd([put('inputs', 'i1', { person: 'p2' }, 0)])) // owned by p2
    core.registerPolicy('inputs', (ch, c, view) => {
      const existing = view.read('inputs', ch.id)?.value as { person?: string } | undefined
      return !existing || existing.person === c.principal || c.principal === 'admin' ? true : 'not owner'
    })
    const r = core.commit(cmd([put('inputs', 'i1', { person: 'p2', x: 1 }, 1)], { principal: 'p1' }))
    expect(r.ok).toBe(false) // p1 cannot edit p2's existing input
  })
})

describe('gate — frozen record boundary', () => {
  it('refuses any change to a frozen record; mutable records are unaffected', () => {
    const core = new CommandCore()
    core.commit(cmd([put('amendments', 'w1/AL1', { issued: true }, 0)]))
    // issued amendments are frozen; live rows are not
    core.registerFrozen((collection) => collection === 'amendments')
    const frozen = core.commit(cmd([put('amendments', 'w1/AL1', { issued: false }, 1)]))
    expect(frozen.ok).toBe(false)
    if (!frozen.ok) expect(frozen.reason).toBe('frozen')
    const live = core.commit(cmd([put('weeks', 'w1/live/r1', { v: 1 }, 0)]))
    expect(live.ok).toBe(true)
  })

  it('a delete of a frozen record is also refused', () => {
    const core = new CommandCore()
    core.commit(cmd([put('amendments', 'a1', { x: 1 }, 0)]))
    core.registerFrozen((c) => c === 'amendments')
    const r = core.commit(cmd([{ collection: 'amendments', id: 'a1', op: 'delete', before: { x: 1 }, after: null, baseVersion: 1 }]))
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.reason).toBe('frozen')
    expect(core.read('amendments', 'a1')!.deleted).toBe(false) // untouched
  })
})

describe('gate — structural: one change per record per command', () => {
  it('rejects a command with two changes to the same (collection,id)', () => {
    const core = new CommandCore()
    const r = core.commit(cmd([put('inputs', 'i1', 1, 0), put('inputs', 'i1', 2, 0)]))
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.reason).toBe('duplicate-record')
  })
})
