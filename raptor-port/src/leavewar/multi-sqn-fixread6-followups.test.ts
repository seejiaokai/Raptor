// @vitest-environment jsdom
/* Fix read 6, fault B (19 Nov 26) — the security read's SEC6-B = Astra's 1: a genuine Undo or Redo carried ANY "taken back"
   or "again" lines. His D2222 lets the verified replay of an admin's own war step reach a moved man's bell with the one
   follow-up line the Undo / Redo writes (leavewar/sync.ts warNoticesReversed) — but the gate (state/perms.ts followUpOf)
   checked only the part's kind, its `ref` and its reader, never what it said, its name, day or input, nor how many named
   one line. Kestrel (149) decides Osprey's LL of 15 Jul; Osprey reads it; Osprey's move to 142 from 16 Jul; on 16 Jul
   Kestrel's Undo (and Redo). Harness as leavewar/multi-sqn-fixread4-bells.test.ts. */
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { storeBackend, HOOKS } from '../engine/hooks'
import { PEOPLE, indexCallsigns } from '../engine/people'
import { initStore as raptorInitStore, notify as raptorNotify, resetSession } from '../state/store'
import { accountsLoad, signIn, sessionFor } from '../state/accounts'
import { getState, initStore as lwInitStore, setPeople, worldUnit, placeApproved, setCell, setBidState } from './state/store'
import { memoryBackend } from './state/storage'
import { projectPeople } from './state/raptorRoster'
import { wireLeaveWarSync, setWarWorldDoor } from './sync'
import { homeOn, unitsLoad } from '../state/units'
import { HOME_PFX } from '../state/units-model'
import { INPUTS } from '../engine/inputs'
import { NOTICES, noticesFor, type Notice } from '../state/notices'
import { noticeSeenLoad } from '../state/noticeseen'
import { installGlobalUndo } from '../state/undo-wire'
import { _resetTimeline, globalRedo } from '../undo/timeline'
import { globalUndo } from '../undo'
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

const D = '2026-07-15'
const nextDay = () => { vi.setSystemTime(new Date(2026, 6, 16, 9, 0, 0)); unitsLoad() }
const moveOsprey = () => { mem['sqn142_' + HOME_PFX + 'hfr6b'] = JSON.stringify({ id: 'hfr6b', pid: 'osp9', unit: 'u142', from: '2026-07-16' }); unitsLoad() }
const readIt = (l: Notice) => { mem['sqn142_noticeseen:osp9'] = JSON.stringify({ upto: 0, ids: [l.id] }); noticeSeenLoad() }
const ownLine = (n: Notice) => n.to === 'osp9' && (n.what || [])[0]?.k === 'lw' && !(n.what[0] as any).again
const backLines = (ref: string) => NOTICES.filter(n => (n.what || [])[0]?.k === 'lwback' && (n.what[0] as any).ref === ref)
const againLines = (ref: string) => NOTICES.filter(n => (n.what || [])[0]?.k === 'lw' && (n.what[0] as any).again === true && (n.what[0] as any).ref === ref)
/* Kestrel (149) decides Osprey's LL of 15 Jul; Osprey reads the line; his move to 142 from 16 Jul; it is 16 Jul */
const decided = (d: 'approved' | 'refused'): Notice => {
  signInAs('ad9', 'a9')
  expect(worldUnit()).toBe('u149')
  if (d === 'approved') expect(placeApproved([{ personId: 'osp9', date: D }], 'LL').approved).toBe(1)
  else { expect(setCell('osp9', D, 'LL')).toBe(true); setBidState('osp9', D, 'refused') }
  const l = NOTICES.find(ownLine)!
  expect(l, 'Osprey told').toBeDefined()
  readIt(l)
  moveOsprey(); nextDay()
  expect(homeOn('osp9', rosterToday())).toBe('u142')
  return l
}
/* RIDE THE REAL FOLLOW-UP (the security read's (b)): while the Undo or Redo writes its follow-up, every line it pushes
   brings `extra` lines with it into the same command — as a hooked list's push would */
const riding = <T>(extra: (n: Notice) => Notice[], run: () => T): T => {
  const proto = Array.prototype.push
  ;(NOTICES as any).push = function (...xs: Notice[]) {
    const r = proto.apply(this, xs)
    for (const x of xs) for (const e of extra(x)) proto.call(this, e)
    return r
  }
  try { return run() } finally { delete (NOTICES as any).push }
}
const isBack = (n: Notice) => (n.what || [])[0]?.k === 'lwback'
const isAgain = (n: Notice) => (n.what || [])[0]?.k === 'lw' && (n.what[0] as any).again === true
const forged = (n: Notice, i: number, part: any, to = n.to): Notice => ({ ...n, id: `${n.id}~f${i}`, to, what: [{ ...part, ref: (n.what[0] as any).ref }] })

describe('fault B — a genuine Undo carries only the "taken back" line it owes', () => {
  it('(security a) "taken back" lines put into the bell list before the Undo, naming his line: none saved, none on his bell', () => {
    const l = decided('approved')
    for (let i = 0; i < 3; i++) NOTICES.push({ id: `nf6b-a${i}`, to: 'osp9', by: 'kes9', at: Date.now(), iid: '', name: 'Your leave', day: '2026-09-01', what: [{ k: 'lwback', c: 'OIL', a: '2026-09-01', b: '2026-09-30', d: 'approved', ref: l.id }] } as any)
    globalUndo()
    signInAs('us9', 'us9')
    expect(noticesFor('osp9').filter(n => n.id.startsWith('nf6b-a')).length, 'no invented line on his bell').toBe(0)
    expect(Object.keys(mem).filter(k => k.includes('nf6b-a')).length, 'none saved').toBe(0)
  })
  it('(security b) three extra "taken back" lines ride the real one: none saved', () => {
    const l = decided('approved')
    riding(n => (isBack(n) && !n.id.includes('~f') ? [0, 1, 2].map(i => forged(n, i, { k: 'lwback', c: 'OIL', a: '2026-09-01', b: '2026-09-30', d: 'approved' })) : []), () => globalUndo())
    expect(backLines(l.id).filter(n => n.id.includes('~f')).length, 'no invented "taken back" line').toBe(0)
    expect(backLines(l.id).length, 'at most the one it owes').toBeLessThanOrEqual(1)
  })
  it('(security b) an exact copy of the real "taken back" line rides it: at most one per line', () => {
    const l = decided('approved')
    riding(n => (isBack(n) && !n.id.includes('~f') ? [forged(n, 0, n.what[0])] : []), () => globalUndo())
    expect(backLines(l.id).length, 'one "taken back" line a line').toBeLessThanOrEqual(1)
  })
  it('(Astra) an "OL 1–31 Dec 2027 approved" follow-up in Kestrel’s Undo of a refusal of LL 15 Jul: refused', () => {
    const l = decided('refused')
    riding(n => (isBack(n) && !n.id.includes('~f') ? [forged(n, 0, { k: 'lwback', c: 'OL', a: '2027-12-01', b: '2027-12-31', d: 'approved' })] : []), () => globalUndo())
    expect(NOTICES.some(n => isBack(n) && (n.what[0] as any).c === 'OL'), 'no false "taken back" line').toBe(false)
  })
  it('(Astra, control) the same follow-up to Ranger (another 142 man) is refused, as before', () => {
    const l = decided('refused')
    riding(n => (isBack(n) && !n.id.includes('~f') ? [forged(n, 0, n.what[0], 'bane')] : []), () => globalUndo())
    expect(NOTICES.some(n => n.to === 'bane' && isBack(n))).toBe(false)
    expect(l).toBeDefined()
  })
})

describe('fault B — a genuine Redo carries only the "again" line it owes', () => {
  /* Undo first (he had read it: "taken back"), then the Redo writes "again" over it */
  const undone = (d: 'approved' | 'refused'): Notice => {
    const l = decided(d)
    const u = globalUndo(); expect(u.ok, JSON.stringify(u)).toBe(true)
    expect(backLines(l.id).length).toBe(1)
    return l
  }
  it('(security b) two extra "again" lines ride the real one, "deleted" 1–31 Aug: none saved', () => {
    const l = undone('approved')
    riding(n => (isAgain(n) && !n.id.includes('~f') ? [0, 1].map(i => forged(n, i, { k: 'lw', c: 'LL', a: '2026-08-01', b: '2026-08-31', d: 'deleted', again: true })) : []), () => globalRedo())
    expect(againLines(l.id).filter(n => n.id.includes('~f')).length, 'no invented "again" line').toBe(0)
    expect(againLines(l.id).length).toBeLessThanOrEqual(1)
  })
  it('(Astra) an "OL 1–31 Dec 2027 approved again" in Kestrel’s Redo: refused', () => {
    const l = undone('refused')
    riding(n => (isAgain(n) && !n.id.includes('~f') ? [forged(n, 0, { k: 'lw', c: 'OL', a: '2027-12-01', b: '2027-12-31', d: 'approved', again: true })] : []), () => globalRedo())
    expect(againLines(l.id).some(n => (n.what[0] as any).c === 'OL'), 'no false "again" line').toBe(false)
  })
})

describe('fault B — controls: D2222 as built (Undo → Redo → Undo, read and unread, approved and refused)', () => {
  for (const d of ['approved', 'refused'] as const) {
    for (const read of [false, true]) {
      it(`${d}, ${read ? 'read' : 'unread'}`, () => {
        signInAs('ad9', 'a9')
        if (d === 'approved') expect(placeApproved([{ personId: 'osp9', date: D }], 'LL').approved).toBe(1)
        else { expect(setCell('osp9', D, 'LL')).toBe(true); setBidState('osp9', D, 'refused') }
        const l = NOTICES.find(ownLine)!
        if (read) readIt(l)
        moveOsprey(); nextDay()
        const u = globalUndo(); expect(u.ok, JSON.stringify(u)).toBe(true)
        expect(backLines(l.id).length).toBe(read ? 1 : 0)
        if (read) expect((backLines(l.id)[0]!.what[0] as any).d).toBe((l.what[0] as any).d)
        const r = globalRedo(); expect(r.ok, 'Redo: ' + JSON.stringify(r)).toBe(true)
        expect(NOTICES.some(n => n.id === l.id)).toBe(true)
        expect(againLines(l.id).length).toBe(read ? 1 : 0)
        const u2 = globalUndo(); expect(u2.ok, 'Undo again: ' + JSON.stringify(u2)).toBe(true)
        expect(NOTICES.some(n => n.id === l.id)).toBe(false)
        expect(getState()).toBeDefined()
      })
    }
  }
})
