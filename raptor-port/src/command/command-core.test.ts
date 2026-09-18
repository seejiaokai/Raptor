/* [ARCH-STACK] Step 2 — the command-layer property tests (design §7).
   Covers: (a) reducer throws => full rollback of model + latched effects;
   the suppression-token re-application; (b) causal child = ONE envelope, and a
   phase-5 failure rolls parent + child back; (d) subscriber-raised commit is
   enqueued + drained (never nested), envelopes in order; (f) a projection on a
   different record does not bump the user record's revision; the whole-world
   guard; remote emit:false. */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  commit, onCommit, commandStream, revisionOf, deferEffect,
  registerGuardedStore, isOk, isQueued, definePermission, anyone,
  registerEffectContext, installBaselineInvariants, defineInvariant,
  commitProjection, isInReducer, commitPhase, CmdRefused,
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
    // [CMDL-FINISH] §2.1(2) / C10 — a USER commit raised from a reaction is its
    // OWN undo entry, independent; it is NOT folded into the cause's closure. (A
    // projection reaction DOES chain — the separate test below.)
    expect(commandStream()[1].causedBy).toBeUndefined()
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

/* ==== [CMDL-FINISH] P1 — command-core enabling changes (§2.1) ============== */

describe('causalSeq — phase-8/9 causal chaining (§2.1(1))', () => {
  it('a PROJECTION raised at phase 8 chains to the causing commit', () => {
    const a = makeStore('A', 'settings'); a.set('x', 0)
    const b = makeStore('B', 'people')
    const r = commit(put({ module: 'settings' }, (txn) => {
      txn.enlist(a.store); a.set('x', 1)
      // a legacy effect (like the LW notify) wakes a reconciler at phase 8
      deferEffect(() => {
        commitProjection({ type: 'proj', scope: { module: 'people' }, apply: (t) => { t.enlist(b.store); b.set('p1', { n: 'x' }) } })
      })
    }))
    expect(isOk(r)).toBe(true)
    const parentSeq = (r as any).envelope.seq
    const stream = commandStream()
    expect(stream.length).toBe(2)
    expect(stream[1].origin).toBe('projection')
    expect(stream[1].causedBy).toBe(parentSeq) // chained — one causal closure
  })

  it('a no-op projection that raises a changing projection: the changing one still chains to N (R2-009)', () => {
    const a = makeStore('A', 'settings'); a.set('x', 0)
    const b = makeStore('B', 'people')
    const c = makeStore('C', 'lw.war')
    const r = commit(put({ module: 'settings' }, (txn) => {
      txn.enlist(a.store); a.set('x', 1)
      deferEffect(() => {
        // a NO-OP projection (enlists, changes nothing → never finalizes, keeps
        // the cause N it inherited) that itself raises a CHANGING projection
        commitProjection({ type: 'noop', scope: { module: 'people' }, apply: (t) => {
          t.enlist(b.store)
          deferEffect(() => {
            commitProjection({ type: 'real', scope: { module: 'lw', warId: 'w' }, apply: (t2) => { t2.enlist(c.store); c.set('w1', { on: true }) } })
          })
        } })
      })
    }))
    const parentSeq = (r as any).envelope.seq
    const real = commandStream().find(e => e.type === 'real')!
    expect(real).toBeDefined()
    expect(real.causedBy).toBe(parentSeq)
    // the no-op projection recorded NOTHING
    expect(commandStream().some(e => e.type === 'noop')).toBe(false)
  })

  it('drains the queue even when a subscriber throws after enqueuing (C6)', () => {
    const a = makeStore('A', 'settings'); a.set('x', 0)
    const b = makeStore('B', 'people')
    let drained = false
    let firstDelivery = true
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    onCommit(() => {
      if (firstDelivery) {
        firstDelivery = false
        commitProjection({ type: 'q', scope: { module: 'people' }, apply: (t) => { t.enlist(b.store); b.set('p', 1); drained = true } })
        throw new Error('subscriber boom')
      }
    })
    expect(() => commit(put({ module: 'settings' }, (txn) => { txn.enlist(a.store); a.set('x', 1) }))).toThrow('subscriber boom')
    expect(drained).toBe(true)      // the queued projection ran despite the throw
    expect(b.get('p')).toBe(1)
    errSpy.mockRestore()
  })

  it('re-installs the suppression context captured at ENQUEUE time on the drained pipeline (CMDLF-002)', () => {
    let lock = false
    const observed: boolean[] = []
    registerEffectContext({
      key: 'LK', capture: () => lock,
      install: (snap) => { const prev = lock; lock = snap as boolean; return () => { lock = prev } },
    })
    const a = makeStore('A', 'settings'); a.set('x', 0)
    const b = makeStore('B', 'people')
    commit(put({ module: 'settings' }, (txn) => {
      txn.enlist(a.store); a.set('x', 1)
      lock = true                       // a lock-wrapped region
      deferEffect(() => {
        // runs at phase 8 with lock re-installed to the captured true; the
        // projection enqueues, capturing lock=true as ITS context
        commitProjection({ type: 'q', scope: { module: 'people' }, apply: (t) => { t.enlist(b.store); b.set('p', 1); observed.push(lock) } })
      })
      lock = false                      // region ends; live lock is false at drain
    }))
    // drainQueue runs AFTER the phase-8 install was restored (live lock false), so
    // the projection seeing lock=true proves it re-installed its OWN captured ctx.
    expect(observed).toEqual([true])
  })
})

describe('scoped expectedRevs conflict guard (§3, F8)', () => {
  const bump = (a: ReturnType<typeof makeStore>) =>
    commit(put({ module: 'settings' }, (txn) => { txn.enlist(a.store); a.set('x', { v: 2 }) }))

  it('commits when expectedRevs match the current revision', () => {
    const a = makeStore('A', 'settings'); a.set('x', { v: 1 })
    bump(a)
    expect(revisionOf('settings', 'x')).toBe(1)
    const r = commit({
      type: 'test.put', scope: { module: 'settings' }, expectedRevs: { 'settings/x': 1 },
      apply: (txn) => { txn.enlist(a.store); a.set('x', { v: 3 }) },
    })
    expect(isOk(r)).toBe(true)
    expect(a.get('x')).toEqual({ v: 3 })
  })

  it('rejects and rolls back when an expectedRev is stale', () => {
    const a = makeStore('A', 'settings'); a.set('x', { v: 1 })
    bump(a)                                // revision now 1
    const r = commit({
      type: 'test.put', scope: { module: 'settings' }, expectedRevs: { 'settings/x': 0 },
      apply: (txn) => { txn.enlist(a.store); a.set('x', { v: 9 }) },
    })
    expect(isOk(r)).toBe(false)
    expect((r as any).reason).toBe('conflict')
    expect(a.get('x')).toEqual({ v: 2 })   // rolled back, the v:9 never landed
    expect(commandStream().length).toBe(1) // only the bump emitted
  })

  it('rejects when a JOINED CHILD has a stale expectedRev (CMDLF-012)', () => {
    const a = makeStore('A', 'settings'); a.set('x', { v: 1 })
    bump(a)                                // settings/x revision now 1
    const b = makeStore('B', 'people'); b.set('p1', { n: 'a' })
    const child: Command = {
      type: 'test.put', scope: { module: 'settings' }, expectedRevs: { 'settings/x': 0 }, // stale base
      apply: (txn) => { txn.enlist(a.store); a.set('x', { v: 5 }) },
    }
    const r = commit({
      type: 'test.put', scope: { module: 'people' },
      apply: (txn) => { txn.enlist(b.store); b.set('p1', { n: 'z' }); commit(child) }, // child joins
    })
    expect(isOk(r)).toBe(false)
    expect((r as any).reason).toBe('conflict')   // the child's stale rev fails the whole txn
    expect(a.get('x')).toEqual({ v: 2 })         // child write rolled back
    expect(b.get('p1')).toEqual({ n: 'a' })      // parent write rolled back too
  })
})

describe('CmdRefused — a silent deliberate refusal (§6)', () => {
  it('maps to reason "refused", rolls back, and logs no bug', () => {
    const a = makeStore('A', 'settings'); a.set('x', 1)
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const r = commit(put({ module: 'settings' }, (txn) => {
      txn.enlist(a.store); a.set('x', 2); throw new CmdRefused('protected week')
    }))
    expect(isOk(r)).toBe(false)
    expect((r as any).reason).toBe('refused')
    expect(a.get('x')).toBe(1)             // rolled back
    expect(errSpy).not.toHaveBeenCalled()  // silent — not a bug-shaped console.error
    errSpy.mockRestore()
  })
})

describe('phase introspection + commitProjection (§2.1(5))', () => {
  it('isInReducer/commitPhase report the current phase and reset after', () => {
    expect(commitPhase()).toBe('idle')
    expect(isInReducer()).toBe(false)
    const a = makeStore('A', 'settings')
    let phaseInside = ''
    let reducerFlag = false
    commit(put({ module: 'settings' }, (txn) => {
      txn.enlist(a.store); a.set('x', 1); phaseInside = commitPhase(); reducerFlag = isInReducer()
    }))
    expect(phaseInside).toBe('reducer')
    expect(reducerFlag).toBe(true)
    expect(commitPhase()).toBe('idle')
    expect(isInReducer()).toBe(false)
  })

  it('commitProjection emits a projection-origin envelope as the system actor (no permission needed)', () => {
    const a = makeStore('A', 'lw.war')
    const r = commitProjection({ type: 'unregistered.proj', scope: { module: 'lw', warId: 'w' }, apply: (t) => { t.enlist(a.store); a.set('w1', 1) } })
    expect(isOk(r)).toBe(true)
    const env = commandStream()[0]
    expect(env.origin).toBe('projection')
    expect(env.actor.role).toBe('system')
  })
})
