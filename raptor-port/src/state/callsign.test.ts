// @vitest-environment jsdom
/* [POST-OUT-OUTCOMES] (27 Sep 26) — THE CALLSIGN RULE. Owner D286 (26 Sep 26): an archived man's callsign may be given
   to a new person; a typed callsign finds the person on the roster, never the archived one; restoring him while his
   callsign is in use needs one of the two renamed (D295: right on the Archived list, or on the spot by Restore).
   Astra's plan read A3 took "never the archived one" literally: the index holds the roster and the placeholders only,
   and the archived holders are looked up apart (many may hold one callsign). Fable F11: the one refusal carries D226's
   14 letters. Register line PO10. */
import { afterAll, beforeEach, describe, expect, it } from 'vitest'
import { storeBackend } from '../engine/hooks'
import { PEOPLE, ID_BY_CS, nameToId, whoId, indexCallsigns, archivedHolders, callsignTakenBy } from '../engine/people'
import { renameCallsign } from '../engine/slots'
import { initStore, resetSession } from './store'
import { commitPeopleEdit, persistPeople } from './people-settings-commit'
import { callsignProblem, newPersonProblem } from './roster-add'

const mem: Record<string, string> = {}
const saved: Record<string, any> = {}
/* the people a test changes are put back exactly (their archived / deleted marks and callsigns) */
const keep = (...ids: string[]) => ids.forEach(id => { if (!(id in saved)) saved[id] = JSON.parse(JSON.stringify((PEOPLE as any)[id])) })

beforeEach(() => {
  Object.keys(mem).forEach(k => delete mem[k])
  storeBackend.impl = { getItem: (k: string) => (k in mem ? mem[k]! : null), setItem: (k: string, v: string) => { mem[k] = v } }
  for (const id of Object.keys(saved)) { (PEOPLE as any)[id] = saved[id]; delete saved[id] }
  indexCallsigns()
  initStore()
  resetSession(null)
})
afterAll(() => { for (const id of Object.keys(saved)) (PEOPLE as any)[id] = saved[id]; indexCallsigns(); storeBackend.impl = null })

const cs = (id: string) => String((PEOPLE as any)[id].cs)

describe('PO10 — the callsign index holds the roster and the placeholders only (D286 (2))', () => {
  it('a man on the roster is found by his callsign, any case', () => {
    expect(nameToId(cs('bane').toUpperCase())).toBe('bane')
    expect(ID_BY_CS[cs('bane').toLowerCase()]).toBe('bane')
  })
  it('the ALL / ALL AVAIL placeholders are in it', () => {
    expect(nameToId('ALL')).toBeTruthy()
    expect(nameToId('all avail')).toBeTruthy()
  })
  it('an ARCHIVED man is never found by a typed callsign — his callsign resolves to nobody', () => {
    keep('casper')
    const c = cs('casper')
    ;(PEOPLE as any).casper.archived = true; indexCallsigns()
    expect(nameToId(c)).toBeUndefined()
    expect(ID_BY_CS[c.toLowerCase()]).toBeUndefined()
  })
  it('a stored ID still resolves to its own man, archived or not (every schedule row keeps pointing at him)', () => {
    keep('casper')
    ;(PEOPLE as any).casper.archived = true; indexCallsigns()
    expect(whoId('casper')).toBe('casper')
  })
  it('a DELETED man is never in it (D290 — kept underneath, invisible)', () => {
    keep('casper')
    Object.assign((PEOPLE as any).casper, { deleted: true, deletedFrom: '2026-10-14', archived: true }); indexCallsigns()
    expect(nameToId(cs('casper'))).toBeUndefined()
  })
})

describe('PO10 — "taken" is one rule (D286, PID-01, D226)', () => {
  it('taken by a man on the roster, by a placeholder, or by any person\'s id', () => {
    expect(callsignTakenBy(cs('bane'))).toBe('bane')
    expect(callsignTakenBy('ALL')).toBeTruthy()
    expect(callsignTakenBy('Bane')).toBe('bane')          // 'bane' is the hidden id of the man called Ranger (PID-01)
  })
  it('a callsign only an archived man holds is FREE', () => {
    keep('casper')
    const c = cs('casper')
    ;(PEOPLE as any).casper.archived = true; indexCallsigns()
    expect(callsignTakenBy(c)).toBe(null)
    expect(callsignProblem(c)).toBe(null)
    expect(archivedHolders(c)).toEqual(['casper'])
  })
  it('a deleted man\'s callsign is free, but his id never is (ids are never reused)', () => {
    keep('casper')
    Object.assign((PEOPLE as any).casper, { deleted: true, deletedFrom: '2026-10-14', archived: true }); indexCallsigns()
    expect(callsignTakenBy(cs('casper'))).toBe(null)
    expect(callsignTakenBy('casper')).toBe('casper')
    expect(archivedHolders(cs('casper')), 'a deleted man is no archived holder').toEqual([])
  })
  it('the one refusal: blank, then 14 letters (never cut — D226), then taken', () => {
    expect(callsignProblem('  ')).toBe('Type the callsign or name')
    expect(callsignProblem('Christopher Tan')).toMatch(/at most 14 letters/)
    expect(callsignProblem(cs('bane'))).toMatch(/already taken/)
    expect(callsignProblem(cs('bane'), 'bane'), 'his own callsign is not taken from himself').toBe(null)
  })
  it('two archived men and a new man on the roster may share one callsign; typed, it means the roster man', () => {
    keep('casper', 'pike')
    const c = cs('casper')
    ;(PEOPLE as any).casper.archived = true
    ;(PEOPLE as any).pike.archived = true; (PEOPLE as any).pike.cs = c
    indexCallsigns()
    expect(archivedHolders(c).sort()).toEqual(['casper', 'pike'])
    expect(newPersonProblem({ cs: c, ini: '', seat: 'FCP', cat: 'C' }), 'the add allows it').toBe(null)
    /* a roster man renamed onto it (the rename's own rule — renameCallsign, the Quals write's) */
    keep('bane')
    expect(renameCallsign('bane', c)).toBe(true)
    expect(nameToId(c)).toBe('bane')
    expect(whoId('casper')).toBe('casper')
    expect(whoId('pike')).toBe('pike')
  })
})

describe('PO10 — the index follows every roster command (advancePeople)', () => {
  it('archiving through a people command frees the callsign; restoring takes it back', () => {
    keep('casper')
    const c = cs('casper')
    ;(PEOPLE as any).casper.archived = true; persistPeople()
    expect(nameToId(c), 'archived: free').toBeUndefined()
    commitPeopleEdit(() => { (PEOPLE as any).casper.archived = false })
    expect(nameToId(c), 'restored: his again').toBe('casper')
  })
  it('renaming an ARCHIVED man onto a free callsign is allowed; onto a roster man\'s is refused', () => {
    keep('casper')
    ;(PEOPLE as any).casper.archived = true; indexCallsigns()
    expect(renameCallsign('casper', 'Casper 2')).toBe(true)
    expect(renameCallsign('casper', cs('bane'))).toBe(false)
  })
})
