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
import { updatePersonField, OWN_ROW_ONLY, RENAME_ADMIN_ONLY, MGMT_ADMIN_ONLY, type QualsOp } from './quals-write'
import { commitPeopleEdit } from './people-settings-commit'
import { defineInvariant } from '../command'
import { HOOKS } from '../engine/hooks'

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
]
/* the callsign is the admin's to change (D218, narrowing D149) — its own tests below */
const CALLSIGN: [string, (id: string) => QualsOp, (id: string) => any] = ['the callsign', () => ({ callsign: 'Zulu9' }), id => PEOPLE[id].cs]

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

describe('D218 — on Quals only an admin changes a callsign; a member keeps every other column of his row', () => {
  const [, op, read] = CALLSIGN
  it('a member on his own row — refused, with its reason; nothing changes', () => {
    asMember('bane')
    const before = read('bane')
    expect(updatePersonField('bane', op('bane'))).toBe(RENAME_ADMIN_ONLY)
    expect(read('bane')).toBe(before)
  })
  it('an admin, on any row — renamed', () => {
    asAdmin()
    expect(updatePersonField('bane', op('bane'))).toBe(null)
    expect(read('bane')).toBe('Zulu9')
  })
})

/* D1510 (29 Oct 26, his "All as recommended" — narrowing D149 as D218 did): on Quals only an admin ticks the Management
   column. The Leave War draws its Management group from this tick (D1502), so a member who ticked his own would move
   himself into the group the war puts first. Refused at the screen, this write and the commit gate alike. */
describe('D1510 — on Quals only an admin ticks Management; a member keeps every other column of his row', () => {
  const mgmt = (id: string) => !!(PEOPLE as any)[id].quals.mgmt
  it('a member on his own row — refused, with its reason; nothing changes', () => {
    asMember('bane')
    const said: string[] = []; const t = HOOKS.toast
    HOOKS.toast = (m: any) => { said.push(String(m)) }
    try {
      const before = mgmt('bane')
      expect(updatePersonField('bane', { tick: 'mgmt' })).toBe(MGMT_ADMIN_ONLY)
      expect(mgmt('bane')).toBe(before)
      expect(said).toContain(MGMT_ADMIN_ONLY)
    } finally { HOOKS.toast = t }
  })
  it('a member already ticked by the admin cannot untick himself either', () => {
    asAdmin()
    expect(updatePersonField('bane', { tick: 'mgmt' })).toBe(null)
    expect(mgmt('bane')).toBe(true)
    asMember('bane')
    expect(updatePersonField('bane', { tick: 'mgmt' })).toBe(MGMT_ADMIN_ONLY)
    expect(mgmt('bane')).toBe(true)
  })
  it('an admin, on any row — ticked and unticked', () => {
    asAdmin()
    const before = mgmt('bane')
    expect(updatePersonField('bane', { tick: 'mgmt' })).toBe(null)
    expect(mgmt('bane')).toBe(!before)
    expect(updatePersonField('bane', { tick: 'mgmt' })).toBe(null)
    expect(mgmt('bane')).toBe(before)
  })
  it('the member still ticks the columns beside it (SXO, a qualification)', () => {
    asMember('bane')
    expect(updatePersonField('bane', { tick: 'sxo' })).toBe(null)
    expect(updatePersonField('bane', { tick: 'imc' })).toBe(null)
  })
})

/* the commit gate is the last lock (perms.ts ownershipViolation, the database step's rule): a member's own-row command
   that changes what his row's admin owns — Management (D1510), the callsign (D218), the archive mark and the placeholder
   mark (data-model.md §11) — rolls back whole, even when it skips the Quals write */
describe('D1510 / D218 — the commit gate refuses a member\'s own-row change of what the admin owns', () => {
  /* [what, the write, what proves it, the gate's own words — so the test proves THIS rule refused (the code read)] */
  const cases: [string, () => void, () => any, string][] = [
    ['Management', () => { (PEOPLE as any).bane.quals.mgmt = !(PEOPLE as any).bane.quals.mgmt }, () => !!(PEOPLE as any).bane.quals.mgmt, 'his Management tick'],
    ['the callsign', () => { (PEOPLE as any).bane.cs = 'Zulu9' }, () => (PEOPLE as any).bane.cs, 'his callsign'],
    ['the archive mark', () => { (PEOPLE as any).bane.archived = true }, () => !!(PEOPLE as any).bane.archived, 'his archive mark'],
    ['the placeholder mark', () => { (PEOPLE as any).bane.special = true }, () => !!(PEOPLE as any).bane.special, 'his placeholder mark'],
    /* the security read (29 Oct 26): deleting a person is the admin's too (§11), and so are its marks and the archive's */
    ['the delete mark', () => { (PEOPLE as any).bane.deleted = true }, () => !!(PEOPLE as any).bane.deleted, 'his delete mark'],
    ['the delete date', () => { (PEOPLE as any).bane.deletedFrom = '2026-01-05' }, () => String((PEOPLE as any).bane.deletedFrom ?? ''), 'his delete mark'],
    ['the archive date', () => { (PEOPLE as any).bane.archivedOn = '2026-01-05' }, () => String((PEOPLE as any).bane.archivedOn ?? ''), 'who archived him'],
    ['who archived him', () => { (PEOPLE as any).bane.archivedBy = 'po' }, () => String((PEOPLE as any).bane.archivedBy ?? ''), 'who archived him'],
    /* …and a callsign of another shape that prints the same is still a change (the security read's finding 4) */
    ['the callsign\'s shape', () => { (PEOPLE as any).bane.cs = [(PEOPLE as any).bane.cs] }, () => JSON.stringify((PEOPLE as any).bane.cs), 'his callsign'],
  ]
  for (const [what, write, read, said] of cases) {
    it(`${what}: rolled back`, () => {
      asMember('bane')
      const before = read()
      const r: any = commitPeopleEdit(write, { owner: 'bane' })
      expect(r.ok).toBe(false)
      expect(String(r.message)).toBe(`member-writes-own: ${said} (people/bane)`)
      expect(read()).toBe(before)
    })
    it(`${what}: an admin's command stands`, () => {
      asAdmin()
      const before = read()
      const r: any = commitPeopleEdit(write, { owner: 'bane' })
      expect(r.ok).not.toBe(false)
      expect(read()).not.toBe(before)
    })
  }
  it('his own initials in the same kind of command still pass', () => {
    asMember('bane')
    const r: any = commitPeopleEdit(() => { (PEOPLE as any).bane.initials = 'MINE' }, { owner: 'bane' })
    expect(r.ok).not.toBe(false)
    expect((PEOPLE as any).bane.initials).toBe('MINE')
  })
})

describe('the callsign goes through renameCallsign — unique, the index kept (Astra R3-5)', () => {
  it('a taken callsign is refused and nothing moves', () => {
    asAdmin()
    const cs = PEOPLE.bane.cs, taken = PEOPLE.stiff.cs
    expect(updatePersonField('bane', { callsign: taken })).toMatch(/already taken/)
    expect(PEOPLE.bane.cs).toBe(cs)
    expect(ID_BY_CS[taken.toLowerCase()]).toBe('stiff')
  })
  it('a rename moves the index with it', () => {
    asAdmin()
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

/* Fable's scenario read (26 Sep 26): any rollback used to say "You can only edit your own
   row" — an admin refused for another reason was told something untrue. A switchable test
   rule (inert unless switched on) stands in for "another reason". */
let refuseForTest = false
defineInvariant({ id: 'test-quals-other-reason', cls: 'hard', check: () => (refuseForTest ? 'refused for another reason' : null) })
describe('a refusal says "your own row" only when that is the reason', () => {
  it('an admin whose edit rolls back for another reason is told it did not save', () => {
    resetSession({ user: 'acad', role: 'admin', pid: 'stiff', name: 'ad' })
    const said: string[] = []; const t = HOOKS.toast
    HOOKS.toast = (m: any) => { said.push(String(m)) }
    refuseForTest = true
    try {
      const msg = updatePersonField('stiff', { initials: 'ZZ' } as QualsOp)
      expect(msg).toBe('That did not save')
      expect(said).not.toContain(OWN_ROW_ONLY)
    } finally { refuseForTest = false; HOOKS.toast = t }
  })
  it("a member on another person's row is still told \"your own row\"", () => {
    asMember('bane')
    expect(updatePersonField('stiff', { initials: 'ZZ' } as QualsOp)).toBe(OWN_ROW_ONLY)
  })
})
