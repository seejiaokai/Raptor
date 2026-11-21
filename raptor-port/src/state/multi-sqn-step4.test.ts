// @vitest-environment jsdom
/* MULTI-SQUADRON BATCH 1, STEP 4 — the demo's second squadron, and what step 3 left open (the plan
   docs/superpowers/plans/2026-11-17-multi-sqn-build-batches.md §3.4, "refined as built, step 4").
   1. The 149 seed: its own people on its own Home rows, never on 142's roster; its admin and member, and a second 142
      admin, sign in to their own squadron (the three seeded accounts — never printed on the sign-in card).
   2. A squadron's blue/red answers are its own: the rows of the other squadron are never read into the one in view.
   Red first: before step 4 nobody was 149's (homeUnitOf fell back to 142 for every man), the three sign-ins were refused,
   and the answers were read from the bare `missionrole:` rows whoever's schedule was in view. */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { initStore, resetSession, notify } from './store'
import { setSession } from './auth'
import { accountsLoad, signIn, sessionFor } from './accounts'
import { myUnit } from './perms'
import { homeUnitOf, rosterOf, rosterToday } from '../engine/roster'
import { PEOPLE } from '../engine/people'
import { hydrateRolesFor } from './persist'
import { roleStore } from './mission-roles'
import type { Whiteboard } from '../storage/whiteboard'

const signInAs = (name: string, pass: string) => { const r = signIn(name, pass); resetSession(sessionFor(r)); notify(); return r }

beforeEach(() => { initStore(); accountsLoad(); resetSession(null) })
afterEach(() => { setSession(null); resetSession(null) })

describe('the 149 seed', () => {
  it('149\'s people are 149\'s, never on 142\'s roster, and each squadron has its own', () => {
    expect(homeUnitOf('kes9', rosterToday()), '149\'s admin').toBe('u149')
    expect(homeUnitOf('osp9', rosterToday()), '149\'s member').toBe('u149')
    expect(homeUnitOf('prowler', rosterToday()), 'the second 142 admin').toBe('u142')
    const r142 = rosterOf('u142', rosterToday()), r149 = rosterOf('u149', rosterToday())
    expect(r142.length).toBeGreaterThan(0)
    expect(r149.length).toBeGreaterThan(0)
    /* the two placeholder pucks (ALL / ALL AVAIL) are every squadron's — they stand for whoever is free there */
    expect(r142.filter(id => r149.includes(id) && !(PEOPLE as any)[id]?.special), 'no man on both').toEqual([])
    expect(r149).toContain('kes9')
    expect(r142).not.toContain('kes9')
  })

  it('the three seeded accounts sign in, each to his own squadron and role', () => {
    for (const [name, pass, unit, admin] of [['ad9', 'a9', 'u149', true], ['us9', 'us9', 'u149', false], ['ad2', 'a2', 'u142', true]] as const) {
      const r = signInAs(name, pass)
      expect((r as any).ok ?? !!r, name + ' signs in').toBeTruthy()
      expect(myUnit(rosterToday()), name + '\'s squadron').toBe(unit)
      const s = sessionFor(r) as any
      expect(s?.role === 'admin', name + (admin ? ' is an admin' : ' is a member')).toBe(admin)
    }
  })
})

describe('a squadron\'s blue/red answers are its own', () => {
  it('only the rows of the squadron asked for are read into memory', () => {
    const rows: Record<string, string> = {
      'u142@missionrole:w1~2026-07-13~f1~ds': JSON.stringify({ side: 'blue' }),
      'u149@missionrole:w1~2026-07-13~f1~ds': JSON.stringify({ side: 'red' }),
      'u149@missionrole:w1~2026-07-14~f2~ds': JSON.stringify({ side: 'red' }),
    }
    const wb = { keys: (c: string) => (c === 'settings' ? Object.keys(rows) : []), get: (_c: string, k: string) => rows[k] ?? null } as unknown as Whiteboard
    hydrateRolesFor(wb, 'u142')
    expect(JSON.parse(roleStore.capture() as string)).toEqual([['w1~2026-07-13~f1~ds', { side: 'blue' }]])
    hydrateRolesFor(wb, 'u149')
    expect(JSON.parse(roleStore.capture() as string)).toEqual([
      ['w1~2026-07-13~f1~ds', { side: 'red' }],
      ['w1~2026-07-14~f2~ds', { side: 'red' }],
    ])
  })
})
