/* [ARCH-STACK] Step 2 — the record-oriented door + conflict contract (§3.6, SEQ-003). */
import { describe, it, expect, beforeEach } from 'vitest'
import {
  commit, isOk, setConflictChecker, registerGuardedStore,
  definePermission, anyone, installBaselineInvariants, MemoryDoor,
} from './index'
import { _resetCommandEngine } from './commit'
import { _resetPermissions } from './permissions'
import { _resetInvariants } from './harness'
import { _resetEffectContexts } from './latch'
import { makeStore } from './_fake'

beforeEach(() => {
  _resetCommandEngine(); _resetPermissions(); _resetInvariants(); _resetEffectContexts()
  installBaselineInvariants(); definePermission('test.put', anyone)
})

describe('MemoryDoor', () => {
  it('rejects a stale versioned put (412) and reports the current version', () => {
    const d = new MemoryDoor()
    expect(d.put('settings', 'k', { v: 1 })).toEqual({ ok: true, version: 1 })
    expect(d.put('settings', 'k', { v: 2 }, 0)).toEqual({ ok: false, reason: 'conflict', current: 1 })
    expect(d.put('settings', 'k', { v: 2 }, 1)).toEqual({ ok: true, version: 2 })
    expect(d.get('settings', 'k')).toMatchObject({ value: { v: 2 }, version: 2 })
  })

  it('failNext forces one conflict, modelling a competing writer', () => {
    const d = new MemoryDoor()
    d.put('settings', 'k', { v: 1 })
    d.failNext = true
    expect(d.put('settings', 'k', { v: 2 }, 1).ok).toBe(false)
    expect(d.put('settings', 'k', { v: 2 }, 1).ok).toBe(true) // fault cleared after one
  })

  it('notifies subscribers of puts and deletes', () => {
    const d = new MemoryDoor()
    const seen: any[] = []
    d.subscribe(r => seen.push(r))
    d.put('settings', 'k', { v: 1 })
    d.delete('settings', 'k', 1)
    expect(seen[0]).toMatchObject({ id: 'k', version: 1 })
    expect(seen[1]).toMatchObject({ deleted: true, id: 'k' })
  })
})

describe('the commit-gate conflict check (SEQ-003)', () => {
  it('refuses and rolls back atomically when the conflict checker rejects', () => {
    const a = makeStore('A', 'settings'); a.set('x', 1)
    setConflictChecker(() => 'stale')
    const r = commit({ type: 'test.put', scope: { module: 'settings' }, apply: (txn) => { txn.enlist(a.store); a.set('x', 2) } })
    expect(isOk(r)).toBe(false)
    expect((r as any).reason).toBe('conflict')
    expect(a.get('x')).toBe(1)
    setConflictChecker(null)
  })
})
