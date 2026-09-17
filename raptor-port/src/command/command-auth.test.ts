/* [ARCH-STACK] Step 2 — authorization at the gate (design §3.5, property e). */
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
  commit, isOk, definePermission, anyone, adminOnly, ownOrAdmin,
  installBaselineInvariants,
} from './index'
import { _resetCommandEngine } from './commit'
import { _resetPermissions } from './permissions'
import { _resetInvariants } from './harness'
import { _resetEffectContexts } from './latch'
import { systemActor } from './actor'
import { setSession, setMe } from '../state/auth'

beforeEach(() => {
  _resetCommandEngine(); _resetPermissions(); _resetInvariants(); _resetEffectContexts()
  installBaselineInvariants()
})
afterEach(() => { setSession(null); setMe('bane') })

const cmd = (type: string, meta?: any) => ({ type, scope: { module: 'settings' } as const, meta, apply: () => {} })

describe('actor derivation', () => {
  it('the system/headless actor has an undefined personId', () => {
    expect(systemActor().personId).toBeUndefined()
    expect(systemActor().role).toBe('system')
  })
})

describe('permission at the gate', () => {
  it('a member cannot run an admin-only command; an admin can', () => {
    definePermission('sq.publish', adminOnly)
    setSession({ user: 'us', role: 'main' }) // member (main -> member)
    const denied = commit(cmd('sq.publish'))
    expect(isOk(denied)).toBe(false)
    expect((denied as any).reason).toBe('unauthorized')

    setSession({ user: 'ad', role: 'admin' })
    expect(isOk(commit(cmd('sq.publish')))).toBe(true)
  })

  it('ownOrAdmin lets a member act on their own record only', () => {
    definePermission('inp.edit', ownOrAdmin((m) => m.owner))
    setSession({ user: 'us', role: 'main' }); setMe('bane')
    expect(isOk(commit(cmd('inp.edit', { owner: 'bane' })))).toBe(true)
    expect(isOk(commit(cmd('inp.edit', { owner: 'someone-else' })))).toBe(false)
  })

  it('an unregistered command type is refused for a real user', () => {
    setSession({ user: 'us', role: 'main' })
    const r = commit(cmd('never.registered'))
    expect(isOk(r)).toBe(false)
    expect((r as any).reason).toBe('unauthorized')
  })

  it('the system actor (headless) passes even an unregistered type — keeps 728/0', () => {
    // no session => deriveActor returns systemActor, which short-circuits auth
    expect(isOk(commit({ ...cmd('anything'), apply: () => {} }))).toBe(true)
  })

  it('anyone-permitted commands run for a member', () => {
    definePermission('note.set', anyone)
    setSession({ user: 'us', role: 'main' })
    expect(isOk(commit(cmd('note.set')))).toBe(true)
  })
})
