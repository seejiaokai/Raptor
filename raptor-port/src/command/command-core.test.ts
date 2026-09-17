/* [ARCH-STACK] Step 2 — the command-layer property tests (design §7).
   Covers: (a) reducer throws => full rollback of model + latched effects;
   the suppression-token re-application; (b) causal child = ONE envelope, and a
   phase-5 failure rolls parent + child back; (d) subscriber-raised commit is
   enqueued + drained (never nested), envelopes in order; (f) a projection on a
   different record does not bump the user record's revision; the whole-world
   guard; remote emit:false. */
import { describe, it, expect, beforeEach } from 'vitest'
import {
  commit, onCommit, commandStream, revisionOf, deferEffect,
  registerGuardedStore, isOk, isQueued, definePermission, anyone,
  registerEffectContext, installBaselineInvariants, defineInvariant,
} from './index'
import { commitAs, _resetCommandEngine } from './commit'
import { systemActor } from './actor'
import { _resetPermissions } from './permissions'
import { _resetInvariants } from './harness'
import { _resetEffectContexts } from './latch'
import { makeStore } from './_fake'
import type { Command } from './types'

beforeEach(() => {
  _resetCommandEngine()
  _resetPermissions()
  _resetInvariants()
  _resetEffectContexts()
  installBaselineInvariants()
  definePermission('test.put', anyone)
})

const put = (scope: any, apply: Command['apply'], type = 'test.put'): Command => ({ type, scope, apply })

describe('rollback (property a)', () => {
  it('rolls back the model and discards latched effects when the reducer throws', () => {
    const a = makeStore('A', 'settings')
    a.set('x', { v: 1 })
    registerGuardedStore(a.store)
    let effectRan = false
    const r = commit(put({ module: 'settings' }, (txn) => {
      txn.enlist(a.store)
      a.set('x', { v: 2 })
      deferEffect(() => { effectRan = true })
      throw new Error('boom')
    }))
    expect(isOk(r)).toBe(false)
    expect((r as any).reason).toBe('invalid')
    expect(a.get('x')).toEqual({ v: 1 }) // model rolled back
    expect(effectRan).toBe(false)        // latched effect discarded
    expect(commandStream().length).toBe(0)
  })

  it('rolls back atomically when the conflict/invariant check rejects (SEQ-003)', () => {
    defineInvariant({ id: 'no-two', cls: 'hard', check: (e) => e.changes.some(c => (c.after as any)?.v === 2) ? 'no v=2' : null })
    const a = makeStore('A', 'settings'); a.set('x', { v: 1 })
    const r = commit(put({ module: 'settings' }, (txn) => { txn.enlist(a.store); a.set('x', { v: 2 }) }))
    expect(isOk(r)).toBe(false)
    expect((r as any).reason).toBe('invalid')
    expect(a.get('x')).toEqual({ v: 1 })
  })
})

describe('suppression-context token (Codex R4-001 / Fable R4-2)', () => {
  it('re-applies the token captured at defer time when the latched effect runs', () => {
    let lock = false
    const seen: boolean[] = []
    registerEffectContext({
      key: 'HIST',
      capture: () => lock,
      install: (snap) => { const prev = lock; lock = snap as boolean; return () => { lock = prev } },
    })
    const a = makeStore('A', 'settings'); a.set('x', 1)
    commit(put({ module: 'settings' }, (txn) => {
      txn.enlist(a.store)
      a.set('x', 2)
      lock = true                              // a lock-wrapped forward batch
      deferEffect(() => { seen.push(lock) })   // captures lock=true
      lock = false                             // batch ends before phase-8 release
    }))
    expect(seen).toEqual([true])  // the effect saw the captured token, not live (false)
    expect(lock).toBe(false)      // ambient state restored after each effect
  })

  it('runs latched effects once each, in order, only on success', () => {
    const a = makeStore('A', 'settings'); a.set('x', 1)
    const order: string[] = []
    commit(put({ module: 'settings' }, (txn) => {
      txn.enlist(a.store); a.set('x', 2)
      deferEffect(() => order.push('notify'))
      deferEffect(() => order.push('persist'))
    }))
    expect(order).toEqual(['notify', 'persist'])
  })
})

describe('causal child join (property b)', () => {
  it('a child raised inside the reducer adds its changes to the ONE parent envelope', () => {
    const a = makeStore('A', 'inputs'); a.set('i1', { p: 'x' })
    const b = makeStore('B', 'lw.cell')
    const child = put({ module: 'inputs' }, (txn) => { txn.enlist(b.store); b.set('c1', { on: false }) }, 'test.child')
    const r = commit(put({ module: 'inputs' }, (txn) => {
      txn.enlist(a.store); a.del('i1')
      commit(child) // raised inside reducer => joins
    }))
    expect(isOk(r)).toBe(true)
    const env = (r as any).envelope
    expect(env.changes.map((c: any) => c.collection + ':' + c.op).sort()).toEqual(['inputs:delete', 'lw.cell:put'])
    expect(commandStream().length).toBe(1) // ONE envelope
  })

  it('a phase-5 failure rolls back the parent AND its joined child', () => {
    defineInvariant({ id: 'no-c1', cls: 'hard', check: (e) => e.changes.some(c => c.id === 'c1') ? 'c1 forbidden' : null })
    const a = makeStore('A', 'inputs'); a.set('i1', { p: 'x' })
    const b = makeStore('B', 'lw.cell')
    const child = put({ module: 'inputs' }, (txn) => { txn.enlist(b.store); b.set('c1', { on: false }) }, 'test.child')
    const r = commit(put({ module: 'inputs' }, (txn) => {
      txn.enlist(a.store); a.del('i1'); commit(child)
    }))
    expect(isOk(r)).toBe(false)
    expect(a.get('i1')).toEqual({ p: 'x' }) // parent rolled back
    expect(b.get('c1')).toBeUndefined()      // child rolled back too
    expect(commandStream().length).toBe(0)
  })
})

describe('post-commit queue (property d)', () => {
  it('enqueues a subscriber-raised commit and drains it after, envelopes in order', () => {
    const a = makeStore('A', 'settings'); a.set('x', 0)
    const order: number[] = []
    let reacted = false
    onCommit((env) => {
      order.push(env.seq)
      if (!reacted) {
        reacted = true
        const r = commit(put({ module: 'settings' }, (txn) => { txn.enlist(a.store); a.set('y', 1) }))
        expect(isQueued(r)).toBe(true) // raised during delivery => enqueued, not nested
      }
    })
    const r = commit(put({ module: 'settings' }, (txn) => { txn.enlist(a.store); a.set('x', 1) }))
    expect(isOk(r)).toBe(true)
    expect(order).toEqual([0, 1])
    expect(commandStream().map(e => e.seq)).toEqual([0, 1])
    expect(commandStream()[1].causedBy).toBe(0) // reaction tagged to its cause
  })

  it('a queued commit resolves its handle by the time the outer commit returns (Fable R4-5)', async () => {
    const a = makeStore('A', 'settings'); a.set('x', 0)
    let handle: any
    let reacted = false
    onCommit(() => {
      if (!reacted) {
        reacted = true
        handle = commit(put({ module: 'settings' }, (txn) => { txn.enlist(a.store); a.set('y', 1) }))
      }
    })
    commit(put({ module: 'settings' }, (txn) => { txn.enlist(a.store); a.set('x', 1) }))
    expect(isQueued(handle)).toBe(true)
    const done = await handle.done
    expect(isOk(done)).toBe(true) // already resolved
  })
})

describe('per-record revision (property f)', () => {
  it('a projection on a different record does not bump the user record revision', () => {
    const a = makeStore('A', 'settings'); a.set('x', 1); a.set('y', 10)
    commit(put({ module: 'settings' }, (txn) => { txn.enlist(a.store); a.set('x', 2) }))
    expect(revisionOf('settings', 'x')).toBe(1)
    commitAs(put({ module: 'settings' }, (txn) => { txn.enlist(a.store); a.set('y', 20) }),
      { actor: systemActor(), origin: 'projection' })
    expect(revisionOf('settings', 'y')).toBe(1)
    expect(revisionOf('settings', 'x')).toBe(1) // unchanged — a later undo of x stays safe
  })
})

describe('the whole-world debug guard', () => {
  it('fails the commit when an un-enlisted registered store changes', () => {
    const a = makeStore('A', 'settings'); a.set('x', 1)
    const b = makeStore('B', 'people'); b.set('p1', { n: 'a' })
    registerGuardedStore(a.store); registerGuardedStore(b.store)
    const r = commit(put({ module: 'settings' }, (txn) => {
      txn.enlist(a.store); a.set('x', 2)
      b.set('p1', { n: 'b' }) // mutated WITHOUT enlisting B — the bug the guard catches
    }))
    expect(isOk(r)).toBe(false)
    expect((r as any).message).toMatch(/un-enlisted store/)
    expect(a.get('x')).toBe(1) // the enlisted store IS rolled back
    expect(b.get('p1')).toEqual({ n: 'a' }) // Codex-1: the OFFENDING un-enlisted store is restored too
  })
})

describe('an exception in a released effect does not wedge the engine (Fable-1)', () => {
  it('a throwing subscriber still lets the NEXT commit apply and notify run', () => {
    const a = makeStore('A', 'settings')
    registerGuardedStore(a.store)
    let boom = true
    onCommit(() => { if (boom) throw new Error('subscriber boom') })
    // first commit: the subscriber throws AFTER the edit applied + emitted
    expect(() => commit(put({ module: 'settings' }, (txn) => { txn.enlist(a.store); a.set('x', 1) }))).toThrow('subscriber boom')
    expect(a.get('x')).toBe(1) // the edit stuck (the throw was post-facto)
    boom = false
    // the engine is NOT wedged in 'post' — the next commit applies normally
    const r = commit(put({ module: 'settings' }, (txn) => { txn.enlist(a.store); a.set('y', 2) }))
    expect(isOk(r)).toBe(true)
    expect(a.get('y')).toBe(2)
  })

  it('a throwing deferred effect (histPush/notify) still lets the next commit apply', () => {
    const a = makeStore('A', 'settings')
    registerGuardedStore(a.store)
    let boom = true
    const effect = () => { if (boom) throw new Error('deferred boom') }
    expect(() => commit(put({ module: 'settings' }, (txn) => { txn.enlist(a.store); a.set('x', 1); deferEffect(effect) }))).toThrow('deferred boom')
    boom = false
    const r = commit(put({ module: 'settings' }, (txn) => { txn.enlist(a.store); a.set('y', 2) }))
    expect(isOk(r)).toBe(true)
    expect(a.get('y')).toBe(2)
  })
})

describe('origin taxonomy', () => {
  it('marks remote-origin envelopes emit:false (applies silently, no echo)', () => {
    const a = makeStore('A', 'lw.cell')
    const seen: any[] = []
    onCommit(e => seen.push(e))
    commitAs(put({ module: 'lw', warId: 'w1' }, (txn) => { txn.enlist(a.store); a.set('c', 1) }),
      { actor: systemActor(), origin: 'remote' })
    expect(seen[0].emit).toBe(false)
  })
})
