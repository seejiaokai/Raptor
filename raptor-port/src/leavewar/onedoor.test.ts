/* [ONE-DOOR] (27 Sep 26) — ARCHIVE AND RESTORE AS ONE DOOR, ON ADMIN → USERS.

   Owner D309 / D310 ("one door as proposed, Quals loses archive"): Admin → Users carries every action on a person —
   Archive (which also suspends his sign-in) and Restore (which brings both back). D322 (the mock-up approved, with the
   agent's calls: Archive one tap; Restore turns the sign-in back on whatever suspended it; no Enable on an archived
   man). D323 (Archive is "posted out from today" on the Leave War, his past kept). D308 (Restore asks the post-in date).
   D320 (the war keeps every stint). D305 (the man himself is told, on his first sign-in after Restore). The plan's
   round-1 review log: Fable F1 / Astra 2 (Restore is the ONE way back from an Admin archive), F3 / A7 (a hidden SANS
   man), F7 (Restore's two modes), F12 / A5 (`back` on every Restore), F13 (a replaced posting), F14 (not an Undo step).
   Its own file, like postout-outcomes.test.ts: the wired sync leaves a live Raptor subscription behind. */
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { storeBackend } from '../engine/hooks'
import { PEOPLE, indexCallsigns } from '../engine/people'
import { initStore as raptorInitStore, notify as raptorNotify, resetSession } from '../state/store'
import { accountsLoad, accountByName, signIn, sessionFor, updateAccount } from '../state/accounts'
import { BACKPROMPT } from '../state/view'
import { onCommit } from '../command'
import { INPUTS } from '../engine/inputs'
import { getState, initStore as lwInitStore, setCell, setPeople } from './state/store'
import { memoryBackend } from './state/storage'
import { projectPeople } from './state/raptorRoster'
import {
  archivePerson, postOut, postOutProblem, restoreArchivedAs, restoreArchivedPerson, restoreProblem, undoPostOut,
  undoPostOutProblem, wireLeaveWarSync,
} from './sync'

const mem: Record<string, string> = {}
let PEOPLE0 = ''
const P = (id: string): any => (PEOPLE as any)[id]
const war = (id: string) => getState().people.find(p => p.id === id)
const signInAs = (name: string, pass = 'x') => { resetSession(sessionFor(signIn(name, pass))); raptorNotify() }

beforeAll(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  PEOPLE0 = JSON.stringify(PEOPLE)
})
afterAll(() => { vi.useRealTimers(); storeBackend.impl = null })
beforeEach(() => {
  vi.setSystemTime(new Date(2026, 6, 15, 9, 0, 0))                      // 15 Jul 26, the demo week
  Object.keys(mem).forEach(k => delete mem[k])
  storeBackend.impl = { getItem: (k: string) => (k in mem ? mem[k]! : null), setItem: (k: string, v: string) => { mem[k] = v } }
  const p0 = JSON.parse(PEOPLE0)
  for (const k of Object.keys(PEOPLE)) delete (PEOPLE as any)[k]
  Object.assign(PEOPLE, p0); indexCallsigns()
  for (let i = INPUTS.length - 1; i >= 0; i--) if (String((INPUTS as any)[i].iid || '').startsWith('ipd')) INPUTS.splice(i, 1)
  lwInitStore(memoryBackend())
  raptorInitStore()
  accountsLoad()
  setPeople(projectPeople())
  wireLeaveWarSync()
  signInAs('ad', 'a')
})
afterEach(() => { resetSession(null); vi.restoreAllMocks() })

describe('D309 / D310 / D323 — Archive on Admin → Users', () => {
  it('D323: archived and his sign-in suspended in one step; on the war posted out from today, his past kept', () => {
    expect(archivePerson('rocky').bad).toBeNull()
    expect(P('rocky').archived).toBe(true)
    expect(P('rocky').archivedBy).toBe('admin')
    expect(accountByName('hex')!.on).toBe(false)
    const w = war('rocky')!
    expect(w).toBeDefined()
    expect(w.to).toBe('2026-07-14')
    expect(w.poOutcome).toBe('overseas')
    expect(w.poDone).toBe('2026-07-15')
  })

  it('D310: refused for yourself, a deleted man, a placeholder and a man already archived — nothing changes', () => {
    expect(archivePerson('stiff').bad).toMatch(/can't archive yourself/)
    expect(P('stiff').archived).toBeFalsy()
    expect(archivePerson('allavail').bad).toBeTruthy()
    archivePerson('rocky')
    expect(archivePerson('rocky').bad).toMatch(/already archived/)
  })

  it('D310: a member cannot archive anyone', () => {
    signInAs('us', 'us')
    expect(archivePerson('rocky').bad).toBeTruthy()
    expect(P('rocky').archived).toBeFalsy()
  })

  it('Fable F13: a posting still to come is replaced, and the message names it', () => {
    expect(postOut('rocky', '2026-10-14', 'delete')).toBe(true)
    const r = archivePerson('rocky')
    expect(r.bad).toBeNull()
    expect(r.said).toMatch(/posting out on 14 Oct.*Delete.*replaced/i)
    expect(war('rocky')!.to).toBe('2026-07-14')
  })

  it('Fable F14: Archive is not a step of the Undo button — its command writes the war\'s posting record', () => {
    const seen: string[] = []
    const off = onCommit(env => { if (env.type === 'person.archive') seen.push(...env.changes.map(c => c.collection)) })
    archivePerson('rocky')
    off()
    expect(seen).toContain('lw.postouts')
  })

  it('Fable F3 / Astra 7: a SANS man hidden from the war (Show SANS off) with a past keeps his row, closed yesterday', () => {
    expect(setCell('rocky', '2026-07-01', 'LL')).toBe(true)              // a record from the months he was here
    P('rocky').san = true; P('rocky').quals = { ...(P('rocky').quals || {}), san: true }
    raptorNotify()
    expect(war('rocky')).toBeUndefined()                                   // hidden while Show SANS is off
    expect(archivePerson('rocky').bad).toBeNull()
    raptorNotify()
    const w = war('rocky')
    expect(w, 'kept on the war — his months here keep their record').toBeDefined()
    expect(w!.to).toBe('2026-07-14')
  })
})

describe('D308 / D320 / D322 — Restore with a post-in date', () => {
  it('D320: back from a later date — a new stint; the months between read away; archive lifted; sign-in on', () => {
    archivePerson('rocky')
    expect(restoreArchivedPerson('rocky', '2026-09-01')).toBe(true)
    expect(P('rocky').archived).toBe(false)
    expect(accountByName('hex')!.on).toBe(true)
    const w = war('rocky')!
    expect(w.past).toEqual([{ from: null, to: '2026-07-14' }])
    expect(w.from).toBe('2026-09-01')
    expect(w.to).toBeNull()
  })

  it('Fable F5: back the same day — the stint reopens, no boundary', () => {
    archivePerson('rocky')
    expect(restoreArchivedPerson('rocky', '2026-07-15')).toBe(true)
    const w = war('rocky')!
    expect(w.past ?? []).toEqual([])
    expect(w.to).toBeNull()
  })

  it('D308: a post-in on or before the day he left is refused, with the reason', () => {
    archivePerson('rocky')
    expect(restoreProblem('rocky', '2026-07-10')).toMatch(/posted out from 15 Jul 26/i)
    expect(restoreArchivedPerson('rocky', '2026-07-10')).toBe(false)
    expect(P('rocky').archived).toBe(true)
  })

  it('D322: Restore turns his sign-in on even when it was suspended by hand before the archive', () => {
    expect(updateAccount('achex', { on: false })).toBeNull()
    archivePerson('rocky')
    restoreArchivedPerson('rocky', '2026-07-15')
    expect(accountByName('hex')!.on).toBe(true)
  })

  it('D305 / Fable F12 / Astra 5: Restore sets his welcome note, with or without an account; the admin is prompted too', () => {
    archivePerson('rocky')
    restoreArchivedPerson('rocky', '2026-07-15')
    expect(P('rocky').back).toBe(true)
    expect(BACKPROMPT).toContain('rocky')
    const nobody = Object.keys(PEOPLE).find(id => !P(id).special && !P(id).archived && !['stiff', 'bane', 'casper', 'rocky'].includes(id))!
    archivePerson(nobody)
    restoreArchivedPerson(nobody, '2026-07-15')
    expect(P(nobody).back).toBe(true)
  })

  it('D295 / D286: his callsign held by a man on the roster — Restore refuses; Restore as does both', () => {
    archivePerson('rocky')
    P('bane').cs = 'Hex'; indexCallsigns()
    expect(restoreArchivedPerson('rocky', '2026-07-15')).toBe(false)
    expect(restoreArchivedAs('rocky', 'Hex 2', '2026-07-15')).toBeNull()
    expect(P('rocky').cs).toBe('Hex 2')
    expect(P('rocky').archived).toBe(false)
  })
})

describe('Fable F1 / Astra 2 — Restore is the ONE way back from an Admin archive', () => {
  it('the Leave War\'s Undo post out and a posting write are refused on him, and nothing changes', () => {
    archivePerson('rocky')
    expect(undoPostOutProblem('rocky')).toMatch(/Admin → Users/)
    expect(undoPostOut('rocky')).toBe(false)
    expect(postOutProblem('rocky', 'overseas')).toMatch(/Admin → Users/)
    expect(postOut('rocky', '2026-08-01', 'overseas')).toBe(false)
    raptorNotify()
    expect(P('rocky').archived).toBe(true)
    expect(war('rocky')!.to).toBe('2026-07-14')
  })

  it('D322: Enable on an archived man is refused at the write path', () => {
    archivePerson('rocky')
    expect(updateAccount('achex', { on: true })).toMatch(/archived — restore him on Admin → Users/)
    expect(accountByName('hex')!.on).toBe(false)
  })
})

describe('Fable F7 — the Undo post out mode is unchanged (a POSTING\'s archive)', () => {
  it('same stint continues, the posting\'s suspension lifted, no welcome note', () => {
    expect(postOut('bane', '2026-07-15', 'overseas')).toBe(true)
    expect(P('bane').archivedBy).toBe('po')
    expect(undoPostOut('bane')).toBe(true)
    expect(P('bane').archived).toBe(false)
    expect(war('bane')!.to).toBeNull()
    expect(war('bane')!.past ?? []).toEqual([])
    expect(P('bane').back).toBeFalsy()
    expect(accountByName('us')!.on).toBe(true)
  })
})
