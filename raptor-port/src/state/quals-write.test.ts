// @vitest-environment jsdom
/* D149 — on the Quals page a member edits his OWN row only, and every column of it (owner,
   24 Sep 26: "member can only edit their own row and SXO and scheduler also does no harm. so
   they can edit anything in their own row"). One test per column, through the ONE Quals write
   (state/quals-write.ts updatePersonField), for an admin, a member on his own row, a member on
   another's, a guest, a pending person and no session. Register line AC8. */
import { beforeEach, afterEach, describe, expect, it } from 'vitest'
import { PEOPLE, ID_BY_CS } from '../engine/people'
import { setSession, setMe } from './auth'
import { initStore, resetSession } from './store'
import { updatePersonField, OWN_ROW_ONLY, type QualsOp } from './quals-write'
import { commitPeopleEdit } from './people-settings-commit'

const PSNAP = JSON.stringify(PEOPLE)
const restorePeople = () => {
  const snap = JSON.parse(PSNAP)
  for (const k of Object.keys(PEOPLE)) if (!(k in snap)) delete (PEOPLE as any)[k]
  for (const k of Object.keys(snap)) (PEOPLE as any)[k] = snap[k]
  for (const k of Object.keys(ID_BY_CS)) delete (ID_BY_CS as any)[k]
  for (const id of Object.keys(PEOPLE)) (ID_BY_CS as any)[String((PEOPLE as any)[id].cs).toLowerCase()] = id
}
beforeEach(() => { restorePeople(); initStore(); resetSession(null) })
afterEach(() => { restorePeople(); resetSession(null) })

const asMember = (pid = 'bane') => resetSession({ user: 'acus', role: 'main', pid, name: 'us' })
const asAdmin = () => resetSession({ user: 'acad', role: 'admin', pid: 'stiff', name: 'ad' })

/* every column of a row, and what proves it changed */
const COLUMNS: [string, (id: string) => QualsOp, (id: string) => any][] = [
  ['a qualification tick (IMC)', () => ({ tick: 'imc' }), id => PEOPLE[id].quals.imc],
  ['SXO', () => ({ tick: 'sxo' }), id => PEOPLE[id].sxo],
  ['SCHEDULER', () => ({ tick: 'sched' }), id => PEOPLE[id].quals.sched],
  ['SANS', () => ({ tick: 'san' }), id => PEOPLE[id].san],
  ['CAT', () => ({ cat: 'A' }), id => PEOPLE[id].q],
  ['initials', () => ({ initials: 'zz' }), id => PEOPLE[id].initials],
  ['flight', () => ({ flight: 'q' }), id => PEOPLE[id].flight],
  ['the callsign', () => ({ callsign: 'Zulu9' }), id => PEOPLE[id].cs],
]

describe('D149 — a member edits his own Quals row, every column; never another\'s', () => {
  for (const [col, op, read] of COLUMNS) {
    it(`${col}: member on his own row — done`, () => {
      asMember('bane')
      const before = JSON.stringify(read('bane'))
      expect(updatePersonField('bane', op('bane'))).toBe(null)
      expect(JSON.stringify(read('bane'))).not.toBe(before)
    })
    it(`${col}: member on ANOTHER's row — refused, nothing changes`, () => {
      asMember('bane')
      const before = JSON.stringify(read('stiff'))
      expect(updatePersonField('stiff', op('stiff'))).toBe(OWN_ROW_ONLY)
      expect(JSON.stringify(read('stiff'))).toBe(before)
    })
    it(`${col}: admin on any row — done`, () => {
      asAdmin()
      const before = JSON.stringify(read('bane'))
      expect(updatePersonField('bane', op('bane'))).toBe(null)
      expect(JSON.stringify(read('bane'))).not.toBe(before)
    })
    it(`${col}: a guest, a pending person — refused`, () => {
      for (const role of ['guest', 'pending']) {
        resetSession({ user: 'principal:x', role, pid: null, name: 'x@mail' })
        const before = JSON.stringify(read('bane'))
        expect(updatePersonField('bane', op('bane'))).toBe(OWN_ROW_ONLY)
        expect(JSON.stringify(read('bane'))).toBe(before)
      }
    })
  }
  it('a personnel row\'s remarks: his own only', () => {
    const pers = Object.keys(PEOPLE).find(id => (PEOPLE as any)[id].pers)!
    asMember(pers)
    expect(updatePersonField(pers, { remarks: 'on course' })).toBe(null)
    expect((PEOPLE as any)[pers].remarks).toBe('on course')
    asMember('bane')
    expect(updatePersonField(pers, { remarks: 'x' })).toBe(OWN_ROW_ONLY)
  })
  it('no session (the headless page tests): unchanged — allowed', () => {
    setSession(null); setMe('bane')
    expect(updatePersonField('stiff', { initials: 'hh' })).toBe(null)
    expect(PEOPLE.stiff.initials).toBe('HH')
  })
})

describe('the callsign goes through renameCallsign — unique, the index kept (Astra R3-5)', () => {
  it('a taken callsign is refused and nothing moves', () => {
    asMember('bane')
    const cs = PEOPLE.bane.cs, taken = PEOPLE.stiff.cs
    expect(updatePersonField('bane', { callsign: taken })).toMatch(/already taken/)
    expect(PEOPLE.bane.cs).toBe(cs)
    expect(ID_BY_CS[taken.toLowerCase()]).toBe('stiff')
  })
  it('a rename moves the index with it', () => {
    asMember('bane')
    expect(updatePersonField('bane', { callsign: 'Nomad7' })).toBe(null)
    expect(ID_BY_CS['nomad7']).toBe('bane')
  })
})

describe('a member\'s command that changes someone else\'s row rolls back (the ownership invariant)', () => {
  it('even when the command names his own row as its owner', () => {
    asMember('bane')
    const r: any = commitPeopleEdit(() => { PEOPLE.stiff.initials = 'HACK' }, { owner: 'bane' })
    expect(r.ok).toBe(false)
    expect(PEOPLE.stiff.initials).not.toBe('HACK')
  })
  it('two rows at once roll back whole', () => {
    asMember('bane')
    const r: any = commitPeopleEdit(() => { PEOPLE.bane.initials = 'MINE'; PEOPLE.stiff.initials = 'HACK' }, { owner: 'bane' })
    expect(r.ok).toBe(false)
    expect(PEOPLE.bane.initials).not.toBe('MINE')
  })
})
