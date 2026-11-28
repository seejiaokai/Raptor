// D2747 FOR A MAN THE WAR SHOWS NO ROW FOR (a SANS man while "+ SANS" is off — the spec §4): his figures are counted with
// HIS OWN stored posting record laid on the hidden identity (store.ts withStored), so a leave before his post-in date is
// never deducted there either. Both scenario designers of [LW-POSTIN-BALANCE] (27 Nov 26) found the count read the bare
// projection, whose post-in date is null.
import { beforeEach, describe, expect, it } from 'vitest'
import type { Person } from '../engine'
import { setMemberTodayForTests } from '../engine'
import {
  getState, initStore, leaveFiguresOf, setCell, setHiddenIdentityLookup, setPeople, setPostIn, setRole, setTypedBalance,
} from './store'
import { memoryBackend } from './storage'

const man: Person = { id: 'kite', callsign: 'KITE', seat: 'wso', band: 'ops', sxo: false, from: null, to: null } as Person

beforeEach(() => {
  initStore(memoryBackend()); setRole('admin'); setMemberTodayForTests('2026-12-10')
})

describe('D2747 — a man with no row on the war', () => {
  it('his leave before his post-in date is not deducted when he is counted from the hidden identity', () => {
    setPeople([...getState().people, man])
    expect(setPostIn('kite', '2026-12-07')).toBe(true)
    expect(setTypedBalance('kite', 'LVE', 24)).toBe(true)
    expect(setCell('kite', '2026-12-02', 'LL')).toBe(true)
    /* the bid approved through the war's own door is the leave; with a man on the roster it is simply not deducted */
    const shown = leaveFiguresOf('kite').kinds.LVE.war
    expect(shown).toBe(24)
    /* now hidden: off the roster, the hidden lookup handing the bare projection (no dates), as sync.ts does */
    setPeople(getState().people.filter(p => p.id !== 'kite'))
    setHiddenIdentityLookup(id => (id === 'kite' ? { ...man } : null))
    try {
      expect(leaveFiguresOf('kite').kinds.LVE.war).toBe(24)
    } finally { setHiddenIdentityLookup(null) }
  })
})
