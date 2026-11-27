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
import { rosterToday } from '../engine/roster'

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

/* RE-POINTED AT U2 (the brief docs/superpowers/briefs/2026-11-27-msq-s2-u2-brief.md §8): his D2626 (25 Nov 26) replaces
   PA1's "a master admin only" — Plan of 149 is given, lowered and taken by 149's OWN admins or a master admin, never by a
   Plan holder. (a)–(d) were refusals of Kestrel, 149's own admin; each now goes through. (e) stands. */
describe('PA1 — Plan is given and taken by that squadron\'s own admins or a master admin (D2626, replacing D2199\'s "a master admin only")', () => {
  it('(a) Kestrel, 149\'s own admin, gives Hunter Plan of 149 at the door: saved', () => {
    signInAs('ad9', 'a9')
    const r = setGrant('acad2', 'u149', 'admin', 'prowler')
    expect(r.ok, JSON.stringify(r)).toBe(true)
    unitsLoad()
    expect(levelIn('acad2', 'u149', rosterToday())).toBe('admin')
  })
  it('(b) the same as a forged command, past the door: saved at the gate', () => {
    signInAs('ad9', 'a9')
    const r = forgedGrant('gx1', { id: 'gx1', account: 'acad2', unit: 'u149', level: 'admin', from: '2026-07-15', fromAt: Date.now() })
    unitsLoad()
    expect(r.ok, JSON.stringify(r)).toBe(true)
  })
  it('(c) Saber gives Hunter Plan of 149; Kestrel takes it away: saved', () => {
    signInAs('ad', 'a')
    expect(setGrant('acad2', 'u149', 'admin', 'prowler').ok).toBe(true)
    signInAs('ad9', 'a9')
    const r = removeGrant('acad2', 'u149')
    expect(r.ok, JSON.stringify(r)).toBe(true)
    unitsLoad()
    expect(levelIn('acad2', 'u149', rosterToday())).toBeNull()
  })
  it('(d) Saber gives Hunter Plan of 149; Kestrel lowers it to View: saved', () => {
    signInAs('ad', 'a')
    expect(setGrant('acad2', 'u149', 'admin', 'prowler').ok).toBe(true)
    signInAs('ad9', 'a9')
    const r = setGrant('acad2', 'u149', 'view', 'prowler')
    expect(r.ok, JSON.stringify(r)).toBe(true)
    unitsLoad()
    expect(levelIn('acad2', 'u149', rosterToday())).toBe('view')
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

/* RE-POINTED AT U2 (the brief §8; his D2730 Q12, Q8, D2626, D2806): a sign-in holding Plan of 149 is re-linked by one who
   may END that Plan — 149's own admins or a master admin — no longer a master admin alone, so Kestrel's Plan answer
   passes; but the re-link leaves another 142 man an admin of 142, which only 142's own admins or a master admin may make
   (Q8), so Kestrel, holding only Plan of 142, is still refused — now in D2806's sentence for 142. */
describe('PA3 — a sign-in holding Plan is re-linked only by one who may end that Plan, and a re-link making an admin only by one who may make him (plan §4.3, guardrail 1; D2730 Q12, Q8)', () => {
  it('(a) Saber gives Hunter Plan of 149 and Kestrel Plan of 142; Kestrel re-links Hunter\'s sign-in to another 142 man: refused, in D2806\'s words for 142', () => {
    signInAs('ad', 'a')
    expect(setGrant('acad2', 'u149', 'admin', 'prowler').ok).toBe(true)
    expect(setGrant('acad9', 'u142', 'admin', 'kes9').ok).toBe(true)
    const other = linkablePeople().find(p => homeOn(p, rosterToday()) === 'u142')!
    expect(other, 'a 142 man with no sign-in').toBeTruthy()
    signInAs('ad9', 'a9')
    const r = updateAccount('acad2', { pid: other })
    unitsLoad()
    const planMoved = levelIn('acad2', 'u149', rosterToday())
    expect(r, 'refused at the door').toBe('Only 142\'s own admins or a master admin can make an admin of 142.')
    expect(planMoved, 'Hunter\'s sign-in keeps its Plan of 149').toBe('admin')
  })
})

describe('PA2 — Plan is an admin\'s: a member\'s account holds no admin right in another squadron (D2199, D2201, D785)', () => {
  it('(a) Saber gives Ranger, 142\'s member, Plan of 149: refused', () => {
    signInAs('ad', 'a')
    const r = setGrant('acus', 'u149', 'admin', 'bane')
    expect(r.ok, JSON.stringify(r)).toBe(false)
    expect(levelIn('acus', 'u149', rosterToday())).not.toBe('admin')
  })
  it('(b) Saber gives Hunter Plan of 149, then makes Hunter a member: he is no admin of 149', () => {
    signInAs('ad', 'a')
    expect(setGrant('acad2', 'u149', 'admin', 'prowler').ok).toBe(true)
    expect(updateAccount('acad2', { role: 'main' })).toBe(null)
    expect(levelIn('acad2', 'u142', rosterToday())).toBe('member')
    expect(levelIn('acad2', 'u149', rosterToday())).not.toBe('admin')
  })
})
