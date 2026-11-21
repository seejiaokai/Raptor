/* THE LOCK TABLE (the reshape plan §5.4, Piece C): the one last-admin rule (state/lastadmin.ts) over hand-built rows —
   the dates it judges × admins at home × a Plan-only squadron × a master admin (counted at home, never as a Plan holder)
   × an archived admin × a first admin moving into his new squadron × a new squadron whose first admin has a move saved
   for a later date × a Plan sign-in that is a member at home there × a squadron removed whole × the whole app. Pure: no
   store, no session. Today is Wed 15 Jul 26 throughout. */
import { describe, expect, it } from 'vitest'
import { lastAdminBreach, type LockAccount, type LockWorld } from './lastadmin'
import type { UnitRows, Home, Grant, Unit } from './units-model'

const TODAY = '2026-07-15'
const U = (id: string): Unit => ({ id, num: id.slice(1), kind: 'sqn' })
const rows = (units: string[], homes: Home[], grants: Grant[] = []): UnitRows =>
  ({ units: units.map(U), places: [], unitplaces: [], grants, homes })
const h = (pid: string, unit: string, from = '2000-01-01', id = `h-${pid}-${from}`): Home => ({ id, pid, unit, from })
const g = (account: string, unit: string, level: 'admin' | 'view' = 'admin', from = '2026-07-01', id = `g-${account}-${unit}`): Grant => ({ id, account, unit, level, from })
const acct = (id: string, pid: string, role = 'admin', more: Partial<LockAccount> = {}): LockAccount => ({ id, pid, role, on: true, ...more })
const people: Record<string, any> = { stiff: { cs: 'Saber' }, prowler: { cs: 'Hunter' }, kes9: { cs: 'Kestrel' }, osp9: { cs: 'Osprey' }, bane: { cs: 'Ranger' }, arch: { cs: 'Ghost', archived: true } }
const person = (pid: string) => people[pid]
/* the world a step leaves: `after` changes, the rest as before */
function world(before: { rows: UnitRows; accts: LockAccount[] }, after: { rows?: UnitRows; accts?: LockAccount[]; person?: (pid: string) => any } = {}): LockWorld {
  return {
    rowsB: before.rows, rowsA: after.rows ?? before.rows, acctB: before.accts, acctA: after.accts ?? before.accts,
    personB: person, personA: after.person ?? person, today: TODAY, fallback: null,
  }
}
const without = (l: LockAccount[], id: string) => l.filter(x => x.id !== id)
const off = (l: LockAccount[], id: string) => l.map(x => (x.id === id ? { ...x, on: false } : x))

/* the seeded shape: 142 — Saber (master), Hunter (admin); 149 — Kestrel (admin), Osprey (member) */
const HOMES = [h('stiff', 'u142'), h('prowler', 'u142'), h('bane', 'u142'), h('kes9', 'u149'), h('osp9', 'u149')]
const ACCTS = [acct('acad', 'stiff', 'admin', { master: true }), acct('acad2', 'prowler'), acct('acus', 'bane', 'main'), acct('acad9', 'kes9'), acct('acus9', 'osp9', 'main')]
const SEEDED = { rows: rows(['u142', 'u149'], HOMES), accts: ACCTS }

describe('admins at home — today', () => {
  it('one of two admins at home switched off: no lock', () => {
    expect(lastAdminBreach(world(SEEDED, { accts: off(ACCTS, 'acad2') }))).toBeNull()
  })
  it("149's only admin at home switched off: 149 on today, Kestrel the one taken", () => {
    expect(lastAdminBreach(world(SEEDED, { accts: off(ACCTS, 'acad9') }))).toEqual({ unit: 'u149', date: TODAY, gone: 'acad9', cause: null })
  })
  it('demoted counts as taken (the role is no longer admin)', () => {
    const accts = ACCTS.map(x => (x.id === 'acad9' ? { ...x, role: 'main' } : x))
    expect(lastAdminBreach(world(SEEDED, { accts }))).toMatchObject({ unit: 'u149', gone: 'acad9' })
  })
  it('a master admin counts at home in his own squadron: Hunter switched off, Saber still keeps 142', () => {
    const accts = ACCTS.filter(x => x.id !== 'acad9' && x.id !== 'acus9')
    const r = rows(['u142'], HOMES.filter(x => x.unit === 'u142'))
    expect(lastAdminBreach(world({ rows: r, accts }, { accts: off(accts, 'acad2') }))).toBeNull()
  })
  it('an archived admin is no admin who can sign in: Kestrel off with Ghost (archived, his account on) at home in 149 — locked', () => {
    const before = { rows: rows(['u142', 'u149'], [...HOMES, h('arch', 'u149')]), accts: [...ACCTS, acct('acarch', 'arch')] }
    expect(lastAdminBreach(world(before, { accts: off(before.accts, 'acad9') }))).toMatchObject({ unit: 'u149', gone: 'acad9' })
  })
  it('the whole app: every admin switched off — "app"', () => {
    const accts = ACCTS.map(x => ({ ...x, on: false }))
    expect(lastAdminBreach(world(SEEDED, { accts }))).toBe('app')
  })
})

describe('the dates — every home row and right from today on, either side', () => {
  /* Osprey a second 149 admin, his move to 142 saved for Thu 16 Jul */
  const accts = ACCTS.map(x => (x.id === 'acus9' ? { ...x, role: 'admin' } : x))
  const before = { rows: rows(['u142', 'u149'], [...HOMES, h('osp9', 'u142', '2026-07-16')]), accts }
  it('Kestrel switched off: 149 has Osprey today, none from Thu 16 Jul — locked on the 16th, Osprey the one whose move makes it', () => {
    expect(lastAdminBreach(world(before, { accts: off(accts, 'acad9') })))
      .toEqual({ unit: 'u149', date: '2026-07-16', gone: 'acad9', cause: { pid: 'osp9', to: 'u142' } })
  })
  it('(control) with no move saved, Kestrel off leaves Osprey: no lock', () => {
    const b = { rows: rows(['u142', 'u149'], HOMES), accts }
    expect(lastAdminBreach(world(b, { accts: off(accts, 'acad9') }))).toBeNull()
  })
  it("Kestrel's own move away is the step: the date is the move's, the cause none (the plain words)", () => {
    const after = rows(['u142', 'u149'], [...HOMES, h('kes9', 'u142', '2026-07-16')])
    expect(lastAdminBreach(world(SEEDED, { rows: after }))).toEqual({ unit: 'u149', date: '2026-07-16', gone: 'acad9', cause: null })
  })
})

describe('a Plan-only squadron — 150 has no admin at home, Hunter holds its Plan', () => {
  const before = { rows: rows(['u142', 'u149', 'u150'], HOMES, [g('acad2', 'u150')]), accts: ACCTS }
  it('his Plan taken away: 150 locked today, Hunter the one taken', () => {
    expect(lastAdminBreach(world(before, { rows: rows(['u142', 'u149', 'u150'], HOMES) }))).toEqual({ unit: 'u150', date: TODAY, gone: 'acad2', cause: null })
  })
  it('his Plan lowered to View: locked (View is no admin)', () => {
    expect(lastAdminBreach(world(before, { rows: rows(['u142', 'u149', 'u150'], HOMES, [g('acad2', 'u150', 'view')]) }))).toMatchObject({ unit: 'u150', gone: 'acad2' })
  })
  it('Hunter switched off: locked in 150 (not 142 — Saber is at home there)', () => {
    expect(lastAdminBreach(world(before, { accts: off(ACCTS, 'acad2') }))).toMatchObject({ unit: 'u150', gone: 'acad2' })
  })
  it('a second Plan holder (Kestrel) left: his Plan taken away — no lock', () => {
    const b = { rows: rows(['u142', 'u149', 'u150'], HOMES, [g('acad2', 'u150'), g('acad9', 'u150')]), accts: ACCTS }
    expect(lastAdminBreach(world(b, { rows: rows(['u142', 'u149', 'u150'], HOMES, [g('acad9', 'u150')]) }))).toBeNull()
  })
  it('a master admin is never counted as a Plan holder: Saber\'s Plan of 150 left alone does not keep it', () => {
    const b = { rows: rows(['u142', 'u149', 'u150'], HOMES, [g('acad2', 'u150'), g('acad', 'u150')]), accts: ACCTS }
    expect(lastAdminBreach(world(b, { rows: rows(['u142', 'u149', 'u150'], HOMES, [g('acad', 'u150')]) }))).toMatchObject({ unit: 'u150', gone: 'acad2' })
  })
  it("a Plan sign-in that is a member at home there counts as the member he is: Osprey's sign-in (a member, at home in 150) holding 150's Plan does not keep it", () => {
    const homes = [...HOMES.filter(x => x.pid !== 'osp9'), h('osp9', 'u150')]
    const b = { rows: rows(['u142', 'u149', 'u150'], homes, [g('acad2', 'u150'), g('acus9', 'u150')]), accts: ACCTS }
    expect(lastAdminBreach(world(b, { rows: rows(['u142', 'u149', 'u150'], homes, [g('acus9', 'u150')]) }))).toMatchObject({ unit: 'u150', gone: 'acad2' })
  })
  it('Hunter, its first admin, moves into 150 on Thu 16 Jul: never without an admin (his Plan holds until his move day, then he is at home) — no lock', () => {
    const after = rows(['u142', 'u149', 'u150'], [...HOMES, h('prowler', 'u150', '2026-07-16')], [g('acad2', 'u150')])
    expect(lastAdminBreach(world(before, { rows: after }))).toBeNull()
  })
  it("once Hunter is at home in 150, its rule is the home rule: a Plan holder alone does not keep it", () => {
    const homes = [...HOMES.filter(x => x.pid !== 'prowler'), h('prowler', 'u150')]
    const b = { rows: rows(['u142', 'u149', 'u150'], homes, [g('acad9', 'u150')]), accts: ACCTS }
    expect(lastAdminBreach(world(b, { accts: off(ACCTS, 'acad2') }))).toMatchObject({ unit: 'u150', gone: 'acad2' })
  })
})

describe('a squadron new in this step — needs one on every judged date', () => {
  it('"+ New squadron" with no first admin: 150 locked today, nobody taken', () => {
    expect(lastAdminBreach(world(SEEDED, { rows: rows(['u142', 'u149', 'u150'], HOMES) }))).toEqual({ unit: 'u150', date: TODAY, gone: null, cause: null })
  })
  it('with Hunter as its first admin (Plan from today): no lock', () => {
    expect(lastAdminBreach(world(SEEDED, { rows: rows(['u142', 'u149', 'u150'], HOMES, [g('acad2', 'u150', 'admin', TODAY)]) }))).toBeNull()
  })
  it('with the master as its first admin: locked (a master counts only at home)', () => {
    expect(lastAdminBreach(world(SEEDED, { rows: rows(['u142', 'u149', 'u150'], HOMES, [g('acad', 'u150', 'admin', TODAY)]) }))).toMatchObject({ unit: 'u150', date: TODAY })
  })
  it('its first admin with a move to 149 saved for Mon 27 Jul: locked from that date', () => {
    const homes = [...HOMES, h('prowler', 'u149', '2026-07-27')]
    const b = { rows: rows(['u142', 'u149'], homes), accts: ACCTS }
    expect(lastAdminBreach(world(b, { rows: rows(['u142', 'u149', 'u150'], homes, [g('acad2', 'u150', 'admin', TODAY)]) }))).toMatchObject({ unit: 'u150', date: '2026-07-27' })
  })
  it('a squadron the step removes whole is not judged (the Undo of "+ New squadron")', () => {
    const b = { rows: rows(['u142', 'u149', 'u150'], HOMES, [g('acad2', 'u150', 'admin', TODAY)]), accts: ACCTS }
    expect(lastAdminBreach(world(b, { rows: rows(['u142', 'u149'], HOMES) }))).toBeNull()
  })
})
