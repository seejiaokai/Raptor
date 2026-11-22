// @vitest-environment jsdom
/* Fix read 6, fault C (19 Nov 26) — the fresh Opus read's F2 and F3 = Astra's 2, and the security read's "not proven": a
   filer's bell line that his D2218 and D2223 retired came back. By D2218 ("on the day a person moves squadron the old
   squadron's bell lines leave his bell, read or unread") a line leaves for good; by D2223 an input's line stays with a man
   only where he is named in it. The read rule (state/notices.ts noticeAboutHim) asked TODAY's input and TODAY's homes:
   the input deleted (an input no longer stored answered "about him"), the filer moving back, or the named man moving
   into the filer's squadron brought a retired line back, an unread one lighting the bell again.
   Hunter (142's admin) files LL for Ranger (142) on 15 Jul; Saber's change that day tells Hunter as its filer; Hunter's
   move to 149 from 16 Jul. Harness as leavewar/multi-sqn-fixread4-bells.test.ts. */
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { storeBackend, HOOKS } from '../engine/hooks'
import { PEOPLE, indexCallsigns } from '../engine/people'
import { initStore as raptorInitStore, notify as raptorNotify, resetSession, writeInputsBatch } from '../state/store'
import { accountsLoad, signIn, sessionFor } from '../state/accounts'
import { initStore as lwInitStore, setPeople } from './state/store'
import { ownershipViolation } from '../state/perms'
import { deriveActor } from '../command/actor'
import { memoryBackend } from './state/storage'
import { projectPeople } from './state/raptorRoster'
import { wireLeaveWarSync, setWarWorldDoor } from './sync'
import { homeOn, unitsLoad } from '../state/units'
import { HOME_PFX } from '../state/units-model'
import { INPUTS } from '../engine/inputs'
import { NOTICES, noticesFor, type Notice } from '../state/notices'
import { unreadFor, noticeSeenLoad } from '../state/noticeseen'
import { installGlobalUndo } from '../state/undo-wire'
import { _resetTimeline } from '../undo/timeline'
import { rosterToday } from '../engine/roster'

const mem: Record<string, string> = {}
let PEOPLE0 = ''
const signInAs = (name: string, pass = 'x') => { resetSession(sessionFor(signIn(name, pass))); raptorNotify() }
let worlds: Record<string, any> = {}

beforeAll(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date(2026, 6, 15, 9, 0, 0))
  PEOPLE0 = JSON.stringify(PEOPLE)
})
afterAll(() => { vi.useRealTimers(); storeBackend.impl = null; setWarWorldDoor(null) })
beforeEach(() => {
  vi.setSystemTime(new Date(2026, 6, 15, 9, 0, 0))
  Object.keys(mem).forEach(k => delete mem[k])
  storeBackend.impl = { getItem: (k: string) => (k in mem ? mem[k]! : null), setItem: (k: string, v: string) => { mem[k] = v }, keys: () => Object.keys(mem) } as any
  const p0 = JSON.parse(PEOPLE0)
  for (const k of Object.keys(PEOPLE)) delete (PEOPLE as any)[k]
  Object.assign(PEOPLE, p0); indexCallsigns()
  for (let i = INPUTS.length - 1; i >= 0; i--) if (String((INPUTS as any)[i].iid || '').startsWith('ipd')) INPUTS.splice(i, 1)
  worlds = { u142: memoryBackend(), u149: memoryBackend() }
  setWarWorldDoor(null)
  lwInitStore(worlds.u142)
  raptorInitStore()
  NOTICES.splice(0)
  accountsLoad()
  noticeSeenLoad()
  setPeople(projectPeople())
  wireLeaveWarSync()
  setWarWorldDoor((u: string) => ({ backend: worlds[u] ?? (worlds[u] = memoryBackend()) }))
  _resetTimeline(); installGlobalUndo()
  vi.spyOn(HOOKS, 'toast').mockImplementation(() => {})
})

const IID = 'ipd-fr6-ret'
const fileFor = (who: string, filer: string) => expect(writeInputsBatch(() => { INPUTS.push({ person: who, date: 'Jul 25', yr: 2026, allday: true, type: 'LL', remarks: 'for him', by: filer, at: Date.now(), iid: IID, ord: 99971 } as any) })).toBe(true)
const rmk = (words: string) => expect(writeInputsBatch(() => { (INPUTS.find((x: any) => x.iid === IID) as any).remarks = words })).toBe(true)
const del = () => expect(writeInputsBatch(() => { const i = INPUTS.findIndex((x: any) => x.iid === IID); INPUTS.splice(i, 1) })).toBe(true)
/* a man's home rows, as state/units.ts setHome saves them: [unit, from] in order (the first covers every day before it) */
const homes = (pid: string, key: string, rows: [string, string][]) => {
  rows.forEach(([unit, from], i) => { mem['sqn142_' + HOME_PFX + key + i] = JSON.stringify({ id: key + i, pid, unit, from }) })
  unitsLoad()
}
const on = (d: number) => { vi.setSystemTime(new Date(2026, 6, d, 9, 0, 0)); unitsLoad() }
const readIt = (pid: string, l: Notice) => { mem[`sqn142_noticeseen:${pid}`] = JSON.stringify({ upto: 0, ids: [l.id] }); noticeSeenLoad() }
const shown = (pid: string, id: string) => noticesFor(pid).some(n => n.id === id)
/* Hunter files for Ranger; Saber's change on 15 Jul tells him (filer only); answers that line */
const hunterLine = (): Notice => {
  signInAs('ad2', 'a2'); fileFor('bane', 'prowler')
  signInAs('ad', 'a'); rmk('changed by Saber on the 15th')
  const l = NOTICES.find(n => n.to === 'prowler' && n.iid === IID)!
  expect(l, 'Hunter told as its filer').toBeDefined()
  return l
}

describe('fault C — a retired filer line stays retired', () => {
  for (const read of [false, true]) {
    const rd = read ? 'read' : 'unread'
    it(`(Opus P2, ${rd}) the input deleted after his move: the line stays off, his unread count stays 0`, () => {
      const l = hunterLine(); if (read) readIt('prowler', l)
      homes('prowler', 'hc', [['u142', '2026-07-15'], ['u149', '2026-07-16']]); on(17)
      signInAs('ad2', 'a2')
      expect(shown('prowler', l.id), 'off his bell on the 17th').toBe(false)
      expect(unreadFor('prowler')).toBe(0)
      signInAs('ad', 'a'); del()
      expect(NOTICES.some(n => n.to === 'prowler' && n.iid === IID && n.id !== l.id), 'not told of the delete').toBe(false)
      signInAs('ad2', 'a2')
      expect(shown('prowler', l.id), 'still off after the delete').toBe(false)
      expect(unreadFor('prowler'), 'the bell stays dark').toBe(0)
    })
    it(`(Opus P3, ${rd}) away to 149 and back to 142: the line stays off`, () => {
      const l = hunterLine(); if (read) readIt('prowler', l)
      homes('prowler', 'hc', [['u142', '2026-07-15'], ['u149', '2026-07-16'], ['u142', '2026-07-17']])
      on(16); signInAs('ad2', 'a2'); expect(shown('prowler', l.id), 'off on his move day').toBe(false)
      on(17); expect(homeOn('prowler', rosterToday())).toBe('u142')
      expect(shown('prowler', l.id), 'still off, back home').toBe(false)
      expect(unreadFor('prowler')).toBe(0)
    })
    it(`(Astra, ${rd}) two round trips: the line stays off`, () => {
      const l = hunterLine(); if (read) readIt('prowler', l)
      homes('prowler', 'hc', [['u142', '2026-07-15'], ['u149', '2026-07-16'], ['u142', '2026-07-17'], ['u149', '2026-07-18'], ['u142', '2026-07-19']])
      on(19); signInAs('ad2', 'a2'); expect(homeOn('prowler', rosterToday())).toBe('u142')
      expect(shown('prowler', l.id)).toBe(false)
      expect(unreadFor('prowler')).toBe(0)
    })
    it(`(security, ${rd}) the named man moves into the filer's squadron after the line retired: it stays off`, () => {
      const l = hunterLine(); if (read) readIt('prowler', l)
      homes('prowler', 'hc', [['u142', '2026-07-15'], ['u149', '2026-07-16']])
      homes('bane', 'hb', [['u142', '2026-07-15'], ['u149', '2026-07-17']])
      on(17); signInAs('ad2', 'a2'); expect(homeOn('bane', rosterToday())).toBe('u149')
      expect(shown('prowler', l.id)).toBe(false)
      expect(unreadFor('prowler')).toBe(0)
    })
  }
})

describe('fault C — controls: lines that stay', () => {
  it('a named man’s own line survives his move, the deletion and the round trip', () => {
    hunterLine()
    const own = NOTICES.find(n => n.to === 'bane' && n.iid === IID)!
    expect(own, 'Ranger told, named in it').toBeDefined()
    homes('bane', 'hb', [['u142', '2026-07-15'], ['u149', '2026-07-16'], ['u142', '2026-07-17']])
    on(16); signInAs('us', 'us'); expect(shown('bane', own.id), 'after his move').toBe(true)
    signInAs('ad2', 'a2'); del()
    signInAs('us', 'us'); expect(shown('bane', own.id), 'after the delete').toBe(true)
    on(17); expect(shown('bane', own.id), 'back home').toBe(true)
  })
  it('a master filer’s line stays: Saber files, Hunter changes it, Saber moves to 149, the input is deleted', () => {
    signInAs('ad', 'a'); fileFor('bane', 'stiff')
    signInAs('ad2', 'a2'); rmk('changed by Hunter')
    const l = NOTICES.find(n => n.to === 'stiff' && n.iid === IID)!
    expect(l).toBeDefined()
    homes('stiff', 'hs', [['u142', '2026-07-15'], ['u149', '2026-07-16']])
    on(17); signInAs('ad', 'a'); expect(shown('stiff', l.id)).toBe(true)
    signInAs('ad2', 'a2'); del()
    signInAs('ad', 'a'); expect(shown('stiff', l.id)).toBe(true)
  })
  it('a never-moved filer’s line stays, through the deletion', () => {
    const l = hunterLine()
    on(17); signInAs('ad', 'a'); del()
    signInAs('ad2', 'a2'); expect(shown('prowler', l.id)).toBe(true)
  })
})

describe('fault C — the gate: a filer-only line carries its mark', () => {
  const env = (changes: any[]): any => ({ type: 'inputs.batch', origin: 'user', actor: deriveActor(), changes })
  it('Hunter (a plain 142 admin) changes the input Saber (master, moved to 149) filed for Ranger: the line to Saber must be marked, with 142', () => {
    signInAs('ad', 'a'); fileFor('bane', 'stiff')
    homes('stiff', 'hs', [['u142', '2026-07-15'], ['u149', '2026-07-16']]); on(17)
    signInAs('ad2', 'a2')
    const r = INPUTS.find((x: any) => x.iid === IID) as any
    const ch = { collection: 'inputs', id: IID, op: 'put', before: { ...r }, after: { ...r, remarks: 'by Hunter' } }
    const ln = (extra: any) => ({ collection: 'notices', id: 'nf6c', op: 'put', before: null, after: { id: 'nf6c', to: 'stiff', by: 'prowler', at: Date.now(), iid: IID, name: 'LL', day: '2026-07-25', what: [{ k: 'rmk' }], ...extra } })
    /* unmarked, a forger's line would never leave his bell */
    expect(ownershipViolation(env([ch, ln({})])) ?? 'allowed').toMatch(/bell line of another squadron/)
    expect(ownershipViolation(env([ch, ln({ fu: ['u149'] })])) ?? 'allowed').toMatch(/bell line of another squadron/)
    /* (…and stamped with the input's squadron, as the pass stamps it — batch 1's second half, §7 item 1) */
    expect(ownershipViolation(env([ch, ln({ fu: ['u142'], u: 'u142' })]))).toBeNull()
    /* …and the pass writes it so */
    rmk('by Hunter, for real')
    const l: any = NOTICES.find(n => n.to === 'stiff' && n.iid === IID)
    expect(l?.fu).toEqual(['u142'])
  })
})
