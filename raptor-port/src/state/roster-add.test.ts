// @vitest-environment jsdom
/* [ACCOUNTS-NEW-PERSON] (26 Sep 26) — THE ONE ADD: the only place a person is created
   (D214 "the same add the Quals page uses"; D217 "one door: Admin → Users"). The Quals
   form's rules moved here unchanged — the PID-01 callsign guard, personnel with no CAT —
   and gained D225 (initials asked, never required) and D226 (14 letters, refused and said,
   never cut). Register lines NP1, NP2, NP3, NP8 (docs/superpowers/specs/2026-09-26-
   accounts-behaviour-register.md). */
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { storeBackend, HOOKS } from '../engine/hooks'
import { PEOPLE, ID_BY_CS, indexCallsigns } from '../engine/people'
import { initStore, resetSession, notify } from './store'
import { signIn, sessionFor } from './accounts'
import { commandStream, commit } from '../command'
import { peopleStore, commitPeopleIntent } from './people-settings-commit'
import {
  SEATS, catsFor, MAX_CS, MAX_INITIALS, CALLSIGN_LABEL, SIGNUP_CALLSIGN_LABEL,
  newPersonProblem, putNewPerson, addRosterPerson, type NewPerson,
} from './roster-add'

const mem: Record<string, string> = {}
const signInAs = (name: string, pass = 'x') => { resetSession(sessionFor(signIn(name, pass))); notify() }
const np = (o: Partial<NewPerson> = {}): NewPerson => ({ cs: 'Blaze', ini: 'rtk', seat: 'RCP', cat: 'D', ...o })
const idOf = (cs: string) => Object.keys(PEOPLE).find(k => (PEOPLE as any)[k].cs === cs)

beforeEach(() => {
  Object.keys(mem).forEach(k => delete mem[k])
  storeBackend.impl = { getItem: (k: string) => (k in mem ? mem[k]! : null), setItem: (k: string, v: string) => { mem[k] = v } }
  /* a person an earlier test added is taken back off the roster (behind the command
     layer, then re-baselined by initStore) so every test starts from the seed */
  for (const cs of ['Blaze', 'Gecko', 'Zephyr', 'Crew Chief Tan']) {
    const id = idOf(cs); if (id) { delete (PEOPLE as any)[id]; delete (ID_BY_CS as any)[cs.toLowerCase()] }
  }
  initStore()
  resetSession(null)
})
afterAll(() => { storeBackend.impl = null })

describe('NP7 — one list of seats, CATs, limits and words (D219, D220, D222, D226)', () => {
  it('the seat choice reads Pilot, WSO, Personnel (ground crew) — no (FCP)/(RCP)', () => {
    expect(SEATS.map(s => s.l)).toEqual(['Pilot', 'WSO', 'Personnel (ground crew)'])
    expect(SEATS.map(s => s.v)).toEqual(['FCP', 'RCP', 'GND'])
  })
  it('the CAT lists are the Quals page\'s: a pilot has no IW, a WSO no IP/IR', () => {
    expect(catsFor('FCP')).toContain('IP'); expect(catsFor('FCP')).not.toContain('IW')
    expect(catsFor('RCP')).toContain('IW'); expect(catsFor('RCP')).not.toContain('IP'); expect(catsFor('RCP')).not.toContain('IR')
  })
  it('personnel, a blank seat and a made-up one hold NO CAT (26 Aug 26) — the list is empty, so a CAT picked for a pilot cannot ride through Personnel (Astra read #2)', () => {
    expect(catsFor('GND')).toEqual([])
    expect(catsFor('')).toEqual([])
    expect(catsFor(undefined)).toEqual([])
    expect(catsFor('XYZ')).toEqual([])
  })
  it('the words and the limits', () => {
    expect(CALLSIGN_LABEL).toBe('Callsign/Name')
    expect(SIGNUP_CALLSIGN_LABEL).toBe('Displayed callsign/name')
    expect(MAX_CS).toBe(14); expect(MAX_INITIALS).toBe(12)
  })
})

describe('NP2 — the one add keeps the one callsign rule (D214, PID-01)', () => {
  it('a blank callsign/name is refused', () => {
    expect(newPersonProblem(np({ cs: '   ' }))).toBe('Type the callsign or name')
  })
  it('D226: 15 letters is refused with its reason, never cut', () => {
    expect(newPersonProblem(np({ cs: 'Christopher Tan' }))).toMatch(/at most 14 letters/)
    expect(newPersonProblem(np({ cs: 'Crew Chief Tan' }))).toBe(null)          // exactly 14
  })
  it('a live callsign is taken — any case', () => {
    expect(newPersonProblem(np({ cs: 'ranger' }))).toBe('ranger is already taken — callsigns must be unique')
  })
  it('PID-01: a callsign that is someone\'s hidden id is taken (the add back-door, 14 Sep 26)', () => {
    /* 'Bane' is nobody's callsign, but it IS the hidden id of the person whose callsign is Ranger */
    expect(PEOPLE.bane.cs).toBe('Ranger')
    expect(newPersonProblem(np({ cs: 'Bane' }))).toMatch(/already taken/)
  })
  it('a placeholder (ALL, ALL AVAIL) is taken — never "restore them" (Fable F4)', () => {
    expect(newPersonProblem(np({ cs: 'ALL' }))).toBe('ALL is already taken — callsigns must be unique')
    expect(newPersonProblem(np({ cs: 'all avail' }))).toMatch(/already taken/)
  })
  /* D286 (26 Sep 26, [POST-OUT-OUTCOMES]) REPLACED "a real archived person points at Restore on Quals": an archived
     man's callsign may go to a new person — the one add allows it (the approve note says who holds it) */
  it('D286: a callsign only an archived man holds is FREE — a new person may take it', () => {
    const id = 'casper'; const was = PEOPLE[id].archived
    PEOPLE[id].archived = true; indexCallsigns()
    try { expect(newPersonProblem(np({ cs: PEOPLE[id].cs }))).toBe(null) }
    finally { PEOPLE[id].archived = was; indexCallsigns() }
  })
  it('the sign-up never asks the roster (a person not yet let in may not read it)', () => {
    expect(newPersonProblem(np({ cs: 'Ranger' }), { roster: false })).toBe(null)
  })
})

describe('NP4 — initials, seat and CAT (D225, the robustness doctrine)', () => {
  it('D225: initials are asked but never required', () => {
    expect(newPersonProblem(np({ ini: '' }))).toBe(null)
  })
  it('initials past 12 are refused, never cut', () => {
    expect(newPersonProblem(np({ ini: 'ABCDEFGHIJKLM' }))).toBe('Initials are at most 12 letters')
  })
  it('a missing seat or CAT fails closed, with its reason', () => {
    expect(newPersonProblem(np({ seat: '' }))).toBe('Pick pilot, WSO or personnel')
    expect(newPersonProblem(np({ seat: 'XYZ' }))).toBe('Pick pilot, WSO or personnel')
    expect(newPersonProblem(np({ cat: '' }))).toBe('Pick the CAT')
    expect(newPersonProblem(np({ seat: 'FCP', cat: 'IW' }))).toBe('Pick the CAT')   // not a pilot's CAT
  })
  it('personnel hold no CAT, so none is asked', () => {
    expect(newPersonProblem(np({ seat: 'GND', cat: '' }))).toBe(null)
  })
})

describe('NP1 / NP8 — the roster-only add (a blank sign-in, D217): admin only, one person.add', () => {
  it('an admin adds a pilot: the Quals add\'s record, one command, the callsign index, kept', () => {
    signInAs('ad', 'a')
    const before = commandStream().length
    expect(addRosterPerson(np({ cs: 'Gecko', ini: 'gk', seat: 'FCP', cat: 'OCU' }))).toBe(null)
    const id = idOf('Gecko')!
    expect(id).toMatch(/^p/)
    expect(PEOPLE[id]).toMatchObject({ cs: 'Gecko', initials: 'GK', seat: 'FCP', q: 'OCU', flight: '-' })
    expect(PEOPLE[id].quals, 'deriveQuals ran').toBeTruthy()
    expect(ID_BY_CS.gecko).toBe(id)
    const envs = commandStream().slice(before)
    expect(envs.map(e => e.type)).toEqual(['person.add'])
    expect(envs[0].changes.map(c => `${c.collection}/${c.id}`)).toEqual([`people/${id}`])
    /* the baseline advanced inside the command: the next people command diffs from here
       (a reload keeping him is walked on the built app — the unit store has no whiteboard) */
    expect(JSON.parse(peopleStore.capture() as string)[id]).toMatchObject({ cs: 'Gecko' })
  })
  it('personnel land with no CAT, a Remarks cell, flight "-" (26 Aug 26)', () => {
    signInAs('ad', 'a')
    expect(addRosterPerson(np({ cs: 'Zephyr', ini: '', seat: 'GND', cat: 'C' }))).toBe(null)
    const id = idOf('Zephyr')!
    expect(PEOPLE[id]).toMatchObject({ cs: 'Zephyr', initials: '', seat: 'GND', pers: true, q: '', flight: '-', remarks: '' })
  })
  it('a member and a pending person add nobody — refused with the reason', () => {
    for (const who of [() => signInAs('us', 'us'), () => signInAs('nobody@mail')]) {
      who()
      expect(addRosterPerson(np({ cs: 'Blaze' }))).toBe('Only an admin can add someone')
      expect(idOf('Blaze')).toBeUndefined()
    }
  })
  it('the add refuses what the check refuses — nothing is minted', () => {
    signInAs('ad', 'a')
    const n = Object.keys(PEOPLE).length
    expect(addRosterPerson(np({ cs: 'Ranger' }))).toMatch(/already taken/)
    expect(addRosterPerson(np({ cat: '' }))).toBe('Pick the CAT')
    expect(Object.keys(PEOPLE).length).toBe(n)
  })
})

describe('NP3 — inside the command the add re-checks, and a refusal there is silent and said (Fable F3)', () => {
  it('putNewPerson refuses a taken callsign with CmdRefused: rolled back, no console error, the reason kept', () => {
    signInAs('ad', 'a')
    const err = vi.spyOn(console, 'error').mockImplementation(() => {})
    const n = Object.keys(PEOPLE).length
    try {
      const r: any = commitPeopleIntent('person.add', null, () => { putNewPerson(np({ cs: 'Ranger' })) })
      expect(r).toMatchObject({ ok: false, reason: 'refused', message: 'Ranger is already taken — callsigns must be unique' })
      expect(err).not.toHaveBeenCalled()
      expect(Object.keys(PEOPLE).length).toBe(n)
      expect(ID_BY_CS.ranger).toBe('bane')
    } finally { err.mockRestore() }
  })
  it('a throw after the person is written rolls him back — the roster, the index and the baseline', () => {
    signInAs('ad', 'a')
    const err = vi.spyOn(console, 'error').mockImplementation(() => {})
    const base = peopleStore.capture()
    try {
      const r: any = commitPeopleIntent('person.add', null, () => { putNewPerson(np({ cs: 'Blaze' })); throw new Error('boom') })
      expect(r.ok).toBe(false)
      expect(idOf('Blaze')).toBeUndefined()
      expect(ID_BY_CS.blaze).toBeUndefined()
      expect(peopleStore.capture()).toBe(base)
    } finally { err.mockRestore() }
  })
  it('putNewPerson outside a command is a programming error, never a silent write', () => {
    expect(() => putNewPerson(np({ cs: 'Blaze' }))).toThrow()
    expect(idOf('Blaze')).toBeUndefined()
    void commit; void HOOKS
  })
})
