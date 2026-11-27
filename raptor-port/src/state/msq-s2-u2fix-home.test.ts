// @vitest-environment jsdom
/* U2 FIX ROUND 1, FIX 3 (Astra 1 — the brief docs/superpowers/briefs/2026-11-27-msq-s2-u2fix-brief.md): an unreadable
   home fails closed for a master admin too. R1 says every reader answers no for a home that cannot be read; the one
   body (units-model.ts mayGivePlanAt) answered yes for a master admin before reading his. Copied from Astra's proof-1
   (pure — the world is set up only so every U2 fix test runs in the three squadrons), with the own-admin branch held. */
import { expect, it } from 'vitest'
import { withThird } from '../test-support/msq-world'
import { homeUnitOn, mayGivePlanAt, type LevelAccount, type UnitRows } from './units-model'

withThird()

const day = '2026-07-15'
const rows: UnitRows = {
  units: [{ id: 'u142', num: '142', kind: 'sqn' } as any, { id: 'u149', num: '149', kind: 'sqn' } as any],
  places: [], unitplaces: [], grants: [], homes: [],
}

it('a master admin cannot give Plan when his home cannot be read', () => {
  const saber: LevelAccount & { on: boolean } = { id: 'acad', pid: 'stiff', pidFrom: undefined, role: 'admin', master: true, on: true }
  const person = { cs: 'Saber' }
  /* a shared store has no demo fallback home */
  expect(homeUnitOn(rows, saber.pid, day, null)).toBeNull()
  const readable: UnitRows = { ...rows, homes: [{ id: 'hsaber', pid: saber.pid, unit: 'u142', from: '2026-07-01' } as any] }
  expect(mayGivePlanAt(saber, person, 'u149', day, readable, null)).toBe(true)
  expect(mayGivePlanAt(saber, person, 'u149', day, rows, null), 'an unreadable home must fail closed, including for a master admin').toBe(false)
})

it('held: a master admin in the member view gives nothing, his home readable; his own squadron\'s admin still gives Plan of it', () => {
  const readable: UnitRows = { ...rows, homes: [
    { id: 'hsaber', pid: 'stiff', unit: 'u142', from: '2026-07-01' } as any,
    { id: 'hkes', pid: 'kes9', unit: 'u149', from: '2026-07-01' } as any,
  ] }
  const kestrel = { id: 'acad9', pid: 'kes9', pidFrom: undefined, role: 'admin', on: true }
  expect(mayGivePlanAt({ id: 'acad', pid: 'stiff', pidFrom: undefined, role: 'main', master: true, on: true }, { cs: 'Saber' }, 'u149', day, readable, null)).toBe(false)
  expect(mayGivePlanAt(kestrel, { cs: 'Kestrel' }, 'u149', day, readable, null)).toBe(true)
  expect(mayGivePlanAt(kestrel, { cs: 'Kestrel' }, 'u142', day, readable, null)).toBe(false)
})
