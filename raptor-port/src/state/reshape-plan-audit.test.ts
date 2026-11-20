// @vitest-environment jsdom
/* THE PLAN AUDIT'S PROOFS ([MSQ-PLAN-AUDIT], his D2242 — chat 126, 20 Nov 26). Each asserts what the rulings require, so
   it FAILS while its fault stands. Kept as text in docs/superpowers/briefs/2026-11-20-msq-plan-audit-repro/; the reshape
   build copies each into its area's real test file, red first (plan §9.1).
   Rulings: D2199, D2211 — Plan is given and taken by a master admin only; D2201 — an admin a master admin gives Plan
   (the agent's reading, told to him: Plan is for an admin — a scheduler is always one, D785). */
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { storeBackend, store } from '../engine/hooks'
import { initStore, resetSession, notify } from '../state/store'
import { signIn, sessionFor, accountsLoad, levelIn, updateAccount, linkablePeople } from '../state/accounts'
import { setSession } from '../state/auth'
import { installGlobalUndo } from '../state/undo-wire'
import { _resetTimeline } from '../undo/timeline'
import { setUnitSeeds, setGrant, removeGrant, unitsLoad, grantsOf, homeOn } from '../state/units'
import { GRANT_PFX } from '../state/units-model'
import { commitSettingsIntent } from '../state/people-settings-commit'

const mem: Record<string, string> = {}
const fake = {
  getItem: (k: string) => (k in mem ? mem[k]! : null),
  setItem: (k: string, v: string) => { if (v === 'null') delete mem[k]; else mem[k] = v },
  keys: () => Object.keys(mem),
}
const signInAs = (name: string, pass: string) => { const r = signIn(name, pass); resetSession(sessionFor(r)); notify(); return r }

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date(2026, 6, 15, 9, 0, 0))
  Object.keys(mem).forEach(k => delete mem[k])
  storeBackend.impl = fake
  setUnitSeeds(true); initStore(); accountsLoad(); resetSession(null); _resetTimeline(); installGlobalUndo()
})
afterEach(() => { setSession(null); resetSession(null); _resetTimeline(); vi.useRealTimers() })
afterAll(() => { storeBackend.impl = null })

/* a grant written past the door, as a forged command would (the gate is the backstop) */
const forgedGrant = (id: string, row: any) => commitSettingsIntent('grant.set', null, () => { store.set(GRANT_PFX + id, row) }) as any

describe('PA1 — Plan is given and taken by a master admin only (D2199, D2211)', () => {
  it('(a) Kestrel, 149\'s admin, gives Hunter Plan of 149 at the door: refused', () => {
    signInAs('ad9', 'a9')
    const r = setGrant('acad2', 'u149', 'admin', 'prowler')
    expect(r.ok, JSON.stringify(r)).toBe(false)
    expect(levelIn('acad2', 'u149')).not.toBe('admin')
  })
  it('(b) the same as a forged command, past the door: refused at the gate', () => {
    signInAs('ad9', 'a9')
    const r = forgedGrant('gx1', { id: 'gx1', account: 'acad2', unit: 'u149', level: 'admin', from: '2026-07-15' })
    unitsLoad()
    expect(r.ok, JSON.stringify(r)).toBe(false)
  })
  it('(c) Saber gives Hunter Plan of 149; Kestrel takes it away: refused', () => {
    signInAs('ad', 'a')
    expect(setGrant('acad2', 'u149', 'admin', 'prowler').ok).toBe(true)
    signInAs('ad9', 'a9')
    const r = removeGrant('acad2', 'u149')
    expect(r.ok, JSON.stringify(r)).toBe(false)
    expect(levelIn('acad2', 'u149')).toBe('admin')
  })
  it('(d) Saber gives Hunter Plan of 149; Kestrel lowers it to View: refused', () => {
    signInAs('ad', 'a')
    expect(setGrant('acad2', 'u149', 'admin', 'prowler').ok).toBe(true)
    signInAs('ad9', 'a9')
    const r = setGrant('acad2', 'u149', 'view', 'prowler')
    expect(r.ok, JSON.stringify(r)).toBe(false)
    expect(levelIn('acad2', 'u149')).toBe('admin')
  })
  it('(e) Hunter, holding Plan of 149, passes Plan of 149 to Ranger: refused', () => {
    signInAs('ad', 'a')
    expect(setGrant('acad2', 'u149', 'admin', 'prowler').ok).toBe(true)
    signInAs('ad2', 'a2')
    const r = setGrant('acus', 'u149', 'admin', 'bane')
    expect(r.ok, JSON.stringify(r)).toBe(false)
  })
  it('(control) Kestrel gives and takes Ranger\'s View of 149; Hunter, holding Plan of 149, may too', () => {
    signInAs('ad9', 'a9')
    expect(setGrant('acus', 'u149', 'view', 'bane').ok).toBe(true)
    expect(removeGrant('acus', 'u149').ok).toBe(true)
    signInAs('ad', 'a')
    expect(setGrant('acad2', 'u149', 'admin', 'prowler').ok).toBe(true)
    signInAs('ad2', 'a2')
    expect(setGrant('acus', 'u149', 'view', 'bane').ok).toBe(true)
    expect(removeGrant('acus', 'u149').ok).toBe(true)
    expect(grantsOf('acus')).toEqual([])
  })
})

describe('PA3 — a sign-in holding Plan is re-linked only by a master admin: the re-link drops the Plan (plan §4.3, guardrail 1), and taking Plan is a master admin\'s (D2199)', () => {
  it('(a) Saber gives Hunter Plan of 149 and Kestrel Plan of 142; Kestrel re-links Hunter\'s sign-in to another 142 man: refused', () => {
    signInAs('ad', 'a')
    expect(setGrant('acad2', 'u149', 'admin', 'prowler').ok).toBe(true)
    expect(setGrant('acad9', 'u142', 'admin', 'kes9').ok).toBe(true)
    const other = linkablePeople().find(p => homeOn(p) === 'u142')!
    expect(other, 'a 142 man with no sign-in').toBeTruthy()
    signInAs('ad9', 'a9')
    const r = updateAccount('acad2', { pid: other })
    const planMoved = levelIn('acad2', 'u149')
    expect(r !== null || planMoved !== 'admin', `re-link ${JSON.stringify(r)}, the sign-in's level in 149 after: ${planMoved}`).toBe(true)
    expect(r, 'refused at the door').not.toBe(null)
  })
})

describe('PA2 — Plan is an admin\'s: a member\'s account holds no admin right in another squadron (D2199, D2201, D785)', () => {
  it('(a) Saber gives Ranger, 142\'s member, Plan of 149: refused', () => {
    signInAs('ad', 'a')
    const r = setGrant('acus', 'u149', 'admin', 'bane')
    expect(r.ok, JSON.stringify(r)).toBe(false)
    expect(levelIn('acus', 'u149')).not.toBe('admin')
  })
  it('(b) Saber gives Hunter Plan of 149, then makes Hunter a member: he is no admin of 149', () => {
    signInAs('ad', 'a')
    expect(setGrant('acad2', 'u149', 'admin', 'prowler').ok).toBe(true)
    expect(updateAccount('acad2', { role: 'main' })).toBe(null)
    expect(levelIn('acad2', 'u142')).toBe('member')
    expect(levelIn('acad2', 'u149')).not.toBe('admin')
  })
})
