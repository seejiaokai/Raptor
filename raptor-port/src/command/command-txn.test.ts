/* [ARCH-STACK-4] phase 0 — ONE command's durable writes reach storage as ONE
   all-or-nothing group, and a refused command leaves NOTHING (design §20.1,
   §21.1, §22.1, §22.3, §23.1). Drives the real commit engine with the real
   Whiteboard installed as its transaction wrapper; "storage" is what the
   whiteboard emits (what the postman would send). */
import { describe, it, expect, beforeEach } from 'vitest'
import {
  commit, onCommit, deferEffect, registerGuardedStore, definePermission, anyone,
  installBaselineInvariants, commitProjection, CmdRefused, setTxnWrapper,
} from './index'
import { _resetCommandEngine } from './commit'
import { _resetPermissions } from './permissions'
import { _resetInvariants } from './harness'
import { _resetEffectContexts } from './latch'
import { makeStore } from './_fake'
import { Whiteboard, type Change } from '../storage/whiteboard'
import type { Command } from './types'

let wb: Whiteboard
let groups: Change[][]
beforeEach(() => {
  _resetCommandEngine(); _resetPermissions(); _resetInvariants(); _resetEffectContexts()
  installBaselineInvariants()
  definePermission('test.put', anyone)
  wb = new Whiteboard()
  wb.set('people', 'all', 'P0'); wb.set('inputs', 'all', 'I0')
  groups = []
  wb.subscribe(g => groups.push(g))
  setTxnWrapper(wb)
})

const put = (apply: Command['apply'], type = 'test.put'): Command => ({ type, scope: { module: 'settings' } as any, apply })
const vals = () => ({ people: wb.get('people', 'all'), inputs: wb.get('inputs', 'all'), lw: wb.get('leavewar', 'wars') })

describe('one command = one group', () => {
  it('in-reducer persists, rewrites and phase-8 persists all travel as ONE net group', () => {
    const a = makeStore('A', 'settings'); registerGuardedStore(a.store)
    const r = commit(put(txn => {
      txn.enlist(a.store); a.set('x', 1)
      wb.set('inputs', 'all', 'I1'); wb.set('inputs', 'all', 'I2')   // an inline persist, twice
      deferEffect(() => { wb.set('leavewar', 'wars', 'W1') })       // the phase-8 persist
    }))
    expect((r as any).ok).toBe(true)
    expect(groups).toHaveLength(1)
    expect(groups[0]).toEqual([
      { collection: 'inputs', id: 'all', value: 'I2' },
      { collection: 'leavewar', id: 'wars', value: 'W1' },
    ])
  })

  it('an effect deferring another two levels deep still lands inside the same group', () => {
    const a = makeStore('A', 'settings'); registerGuardedStore(a.store)
    commit(put(txn => {
      txn.enlist(a.store); a.set('x', 1)
      deferEffect(() => {
        wb.set('inputs', 'all', 'L1')
        deferEffect(() => { deferEffect(() => { wb.set('people', 'all', 'L3') }) })
      })
    }))
    expect(groups).toHaveLength(1)
    expect(groups[0].map(e => e.value)).toEqual(['L1', 'L3'])
  })

  it('a projection raised during delivery (drained after) joins the same group', () => {
    const a = makeStore('A', 'settings'); registerGuardedStore(a.store)
    const b = makeStore('B', 'settings'); registerGuardedStore(b.store)
    onCommit(env => {
      if (env.type !== 'test.put') return
      commitProjection({ type: 'test.proj', scope: { module: 'settings' } as any, apply: txn => { txn.enlist(b.store); b.set('y', 1); wb.set('leavewar', 'wars', 'OIL') } })
    })
    commit(put(txn => { txn.enlist(a.store); a.set('x', 1); wb.set('inputs', 'all', 'I1') }))
    expect(groups).toHaveLength(1)
    expect(groups[0].map(e => e.collection)).toEqual(['inputs', 'leavewar'])
  })
})

describe('a refused command leaves nothing in storage', () => {
  it('a deliberate refusal after an inline persist: every value byte-equal, ZERO groups', () => {
    const a = makeStore('A', 'settings'); registerGuardedStore(a.store)
    const before = vals()
    const r = commit(put(txn => {
      txn.enlist(a.store); a.set('x', 1)
      wb.set('inputs', 'all', 'I1'); wb.set('leavewar', 'wars', 'NEW')
      deferEffect(() => { wb.set('people', 'all', 'NEVER') })
      throw new CmdRefused('locked week')
    }))
    expect((r as any).ok).toBe(false)
    expect(vals()).toEqual(before)
    expect(wb.has('leavewar', 'wars')).toBe(false)
    expect(groups).toEqual([])
  })

  it('a stale expectedRevs refusal: ZERO groups', () => {
    const a = makeStore('A', 'settings'); registerGuardedStore(a.store)
    const before = vals()
    const r = commit({ ...put(txn => { txn.enlist(a.store); a.set('x', 1); wb.set('inputs', 'all', 'I1') }), expectedRevs: { 'settings/x': 7 } })
    expect((r as any).reason).toBe('conflict')
    expect(vals()).toEqual(before)
    expect(groups).toEqual([])
  })

  it('a missing enlist caught by the whole-world guard: ZERO groups', () => {
    const a = makeStore('A', 'settings'); registerGuardedStore(a.store)
    const before = vals()
    const r = commit(put(() => { a.set('x', 1); wb.set('inputs', 'all', 'I1') }))
    expect((r as any).reason).toBe('invalid')
    expect(vals()).toEqual(before)
    expect(groups).toEqual([])
  })
})

describe('savepoints per pipeline (§22.1) and the refusal discriminator (§23.1)', () => {
  const rig = (projApply: Command['apply']) => {
    const a = makeStore('A', 'settings'); registerGuardedStore(a.store)
    const b = makeStore('B', 'settings'); registerGuardedStore(b.store)
    onCommit(env => {
      if (env.type !== 'test.put') return
      commitProjection({ type: 'test.proj', scope: { module: 'settings' } as any, apply: txn => { txn.enlist(b.store); b.set('y', 1); projApply(txn) } })
    })
    return a
  }

  it('a parent that succeeded + a drained pipeline REFUSED on the same key: the group carries the parent’s value', () => {
    const a = rig(() => { wb.set('people', 'all', 'CHILD'); throw new CmdRefused('no') })
    commit(put(txn => { txn.enlist(a.store); a.set('x', 1); wb.set('people', 'all', 'PARENT') }))
    expect(wb.get('people', 'all')).toBe('PARENT')
    expect(groups).toEqual([[{ collection: 'people', id: 'all', value: 'PARENT' }]])
  })

  it('… and on a different key: the refused pipeline’s key never travels', () => {
    const a = rig(() => { wb.set('leavewar', 'wars', 'CHILD'); throw new CmdRefused('no') })
    commit(put(txn => { txn.enlist(a.store); a.set('x', 1); wb.set('people', 'all', 'PARENT') }))
    expect(wb.has('leavewar', 'wars')).toBe(false)
    expect(groups).toEqual([[{ collection: 'people', id: 'all', value: 'PARENT' }]])
  })

  it('a drained pipeline whose PHASE-8 effect throws happened: its keys stay in the group', () => {
    const a = rig(() => { wb.set('leavewar', 'wars', 'CHILD'); deferEffect(() => { throw new Error('effect boom') }) })
    const orig = console.error; console.error = () => {}
    try { commit(put(txn => { txn.enlist(a.store); a.set('x', 1); wb.set('people', 'all', 'PARENT') })) } finally { console.error = orig }
    expect(groups).toHaveLength(1)
    expect(groups[0].map(e => e.value).sort()).toEqual(['CHILD', 'PARENT'])
  })
})

describe('without a wrapper (headless tests, the parity harness)', () => {
  it('writes emit one group per key, exactly as before', () => {
    setTxnWrapper(null)
    const a = makeStore('A', 'settings'); registerGuardedStore(a.store)
    commit(put(txn => { txn.enlist(a.store); a.set('x', 1); wb.set('inputs', 'all', 'I1'); wb.set('people', 'all', 'P1') }))
    expect(groups).toHaveLength(2)
  })
})
