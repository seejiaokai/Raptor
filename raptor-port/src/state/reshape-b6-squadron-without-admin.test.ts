// @vitest-environment jsdom
/* B6 (Opus B3): a squadron can start with no admin, and its first admin can be taken away, leaving it with none.
   D2191: "A master admin makes squadrons, names each new squadron's first admin". D2184 Q10: a step that would leave a
   squadron with no admin is refused at once — "and so is any later step that would cause it, such as removing another
   admin". Plan O2 / §3.4: "a squadron is never left with no admin". The new squadron's first admin is only a GRANT admin
   (units.ts addUnit), and every lock counts only admins at home there.
   Copied word for word from docs/superpowers/briefs/2026-11-20-multi-sqn-b1-repro/b-b06-squadron-without-admin.test.ts.txt
   — only the harness changed (test-support/msq-world.ts, the same world). Red on the core before Piece C, green after. */
import { describe, expect, it } from 'vitest'
import { useMsqWorld as useWorld, signInAs } from '../test-support/msq-world'
import { addUnit, removeGrant, unitRows } from '../state/units'
import { ACCOUNTS_LIST, levelIn, isMasterAccount } from '../state/accounts'

useWorld()

/* the non-master accounts that are an admin of the unit today, however (home role or a grant) */
const adminsOf = (unit: string) => ACCOUNTS_LIST.filter(a => !isMasterAccount(a.id) && a.on && levelIn(a.id, unit) === 'admin').map(a => a.id)

describe('B6 — a squadron is never left with no admin', () => {
  it('"+ New squadron" with no first admin is refused', () => {
    signInAs('ad', 'a')
    const r = addUnit('150', 'p1')
    expect(r.ok, 'a squadron made with no admin').toBe(false)
  })
  it("the master takes away the new squadron's only admin (Hunter, named first admin of 151): refused", () => {
    signInAs('ad', 'a')
    const r = addUnit('151', 'p1', 'acad2')
    expect(r.ok).toBe(true)
    expect(adminsOf(r.id!)).toEqual(['acad2'])
    const rm = removeGrant('acad2', r.id!)
    expect(adminsOf(r.id!).length === 0 ? rm.ok : false, '151 left with no admin').toBe(false)
  })
  it("Hunter, 152's only admin, takes his own right away: refused", () => {
    signInAs('ad', 'a')
    const r = addUnit('152', 'p1', 'acad2')
    expect(r.ok).toBe(true)
    signInAs('ad2', 'a2')
    const rm = removeGrant('acad2', r.id!)
    expect(rm.ok, '152 left with no admin').toBe(false)
    expect(unitRows().grants.some(g => g.unit === r.id && g.account === 'acad2')).toBe(true)
  })
})
