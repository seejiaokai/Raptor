// @vitest-environment jsdom
/* ADMIN → USERS BY SQUADRON (batch 1's second half, plan §4 item 1 — 7a, R-O4, R3, 5b; O3): the list is the page's
   squadron's — its people on the roster that day, the men of other squadrons holding Plan of it (6b's "· also plans
   149"), its archived men; the heading counts its own people only; a search also finds a man of another squadron (to
   give him View). Linking a sign-in offers the page's squadron's men only. Red first on the code before the model. */
import { describe, it, expect } from 'vitest'
import { useMsqWorld, signInAs, PID, ACCT } from '../test-support/msq-world'
import { usersListOf } from './userslist-model'
import { linkablePeople, saveAccess } from '../state/accounts'
import { homeOn, todayIso } from '../state/units'
import { PEOPLE } from '../engine/people'

useMsqWorld()

const today = () => todayIso()

describe('the list is the page\'s squadron\'s', () => {
  it('142\'s list holds 142\'s people and none of 149\'s; its heading counts them', () => {
    signInAs('hunter')
    const l = usersListOf('u142', today(), '')
    expect(l.own).toContain(PID.hunter)
    expect(l.own).toContain(PID.ranger)
    expect(l.own).not.toContain(PID.kestrel)
    expect(l.own).not.toContain(PID.osprey)
    expect(l.own.every(pid => homeOn(pid, today()) === 'u142')).toBe(true)
    expect(l.count).toBe(l.own.length)
    expect(l.planners).toEqual([])
    expect(l.found).toEqual([])
  })
  it('149\'s list holds 149\'s people, A to Z', () => {
    signInAs('kestrel')
    const l = usersListOf('u149', today(), '')
    expect(l.own).toContain(PID.kestrel)
    expect(l.own).toContain(PID.osprey)
    expect(l.own).not.toContain(PID.hunter)
    const css = l.own.map(pid => String((PEOPLE as any)[pid].cs))
    expect(css).toEqual([...css].sort((a, b) => a.localeCompare(b)))
  })
  it('a Plan holder of 149 is on 149\'s list, beside its own people and not counted with them (R-O4)', () => {
    signInAs('saber')
    expect(saveAccess(ACCT.hunter, { grants: { u149: 'plan' } })).toBeNull()
    signInAs('kestrel')
    const l = usersListOf('u149', today(), '')
    expect(l.planners).toEqual([PID.hunter])
    expect(l.own).not.toContain(PID.hunter)
    expect(l.count).toBe(l.own.length)
    /* View is not Plan: a View holder is not listed */
    signInAs('saber')
    expect(saveAccess(ACCT.hunter, { grants: { u149: 'view' } })).toBeNull()
    expect(usersListOf('u149', today(), '').planners).toEqual([])
  })
  it('a search finds a man of another squadron, apart from the squadron\'s own (5b — to give him View)', () => {
    signInAs('hunter')
    const cs = String((PEOPLE as any)[PID.osprey].cs).toLowerCase()
    const l = usersListOf('u142', today(), cs)
    expect(l.found).toContain(PID.osprey)
    expect(l.own).not.toContain(PID.osprey)
    /* the search narrows the squadron's own too */
    expect(l.own.every(pid => String((PEOPLE as any)[pid].cs).toLowerCase().includes(cs))).toBe(true)
    /* no search: nobody of another squadron */
    expect(usersListOf('u142', today(), '').found).toEqual([])
  })
  it('an archived man is in his own squadron\'s Archived group only', () => {
    ;(PEOPLE as any)[PID.osprey].archived = true
    expect(usersListOf('u149', today(), '').archived).toContain(PID.osprey)
    expect(usersListOf('u149', today(), '').own).not.toContain(PID.osprey)
    expect(usersListOf('u142', today(), '').archived).not.toContain(PID.osprey)
    expect(usersListOf('u142', today(), 'osp').found).not.toContain(PID.osprey)
  })
})

describe('linking a sign-in offers the page\'s squadron\'s men only', () => {
  it('Hunter on 142\'s page is offered no 149 man; Kestrel on 149\'s is offered no 142 man', () => {
    signInAs('hunter')
    const h = linkablePeople()
    expect(h.length).toBeGreaterThan(0)
    expect(h.every(pid => homeOn(pid, today()) === 'u142')).toBe(true)
    signInAs('kestrel')
    const k = linkablePeople()
    expect(k.length).toBeGreaterThan(0)
    expect(k.every(pid => homeOn(pid, today()) === 'u149')).toBe(true)
  })
  it('the one already linked is kept, whatever his squadron', () => {
    signInAs('hunter')
    expect(linkablePeople(PID.osprey)).toContain(PID.osprey)
  })
})
