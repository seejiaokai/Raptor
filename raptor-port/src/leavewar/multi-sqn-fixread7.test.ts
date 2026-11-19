// @vitest-environment jsdom
/* Fix read 7 (19 Nov 26) — the faults the four readers found in fix read 6's code (the builder's brief:
   docs/superpowers/briefs/2026-11-19-multi-sqn-b1-fixread7-fixes-brief.md). Each describe is one fault, red first on the
   code the readers read. Hunter (142's plain admin, `ad2`) files LL for Ranger (142, `us`) on 15 Jul; Saber is the
   master (`ad`); Kestrel and Osprey are 149's (`ad9`, `us9`). Harness as leavewar/multi-sqn-fixread6-retired.test.ts. */
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { storeBackend, HOOKS } from '../engine/hooks'
import { PEOPLE, indexCallsigns } from '../engine/people'
import { initStore as raptorInitStore, notify as raptorNotify, resetSession, writeInputsBatch } from '../state/store'
import { accountsLoad, signIn, sessionFor } from '../state/accounts'
import { initStore as lwInitStore, setPeople, setCell, setBidState, worldUnit } from './state/store'
import { ownershipViolation, setInputReplayCheck } from '../state/perms'
import { deriveActor } from '../command/actor'
import { memoryBackend } from './state/storage'
import { projectPeople } from './state/raptorRoster'
import { wireLeaveWarSync, setWarWorldDoor, followUpsFor } from './sync'
import { unitsLoad, setGrant } from '../state/units'
import { HOME_PFX, GRANT_PFX } from '../state/units-model'
import { setMaster } from '../state/accounts'
import { INPUTS } from '../engine/inputs'
import { NOTICES, noticesFor, type Notice } from '../state/notices'
import { noticeSeenLoad } from '../state/noticeseen'
import { installGlobalUndo } from '../state/undo-wire'
import { _resetTimeline, globalRedo, verifiedReplay } from '../undo/timeline'
import { globalUndo } from '../undo'

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

const IID = 'ipd-fr7'
const fileFor = (who: string, filer: string, date = 'Jul 25', endDate?: string) => expect(writeInputsBatch(() => { INPUTS.push({ person: who, date, ...(endDate ? { endDate } : {}), yr: 2026, allday: true, type: 'LL', remarks: 'for him', by: filer, at: Date.now(), iid: IID, ord: 99981 } as any) })).toBe(true)
const rmk = (words: string) => expect(writeInputsBatch(() => { (INPUTS.find((x: any) => x.iid === IID) as any).remarks = words })).toBe(true)
const del = () => expect(writeInputsBatch(() => { const i = INPUTS.findIndex((x: any) => x.iid === IID); INPUTS.splice(i, 1) })).toBe(true)
const theInput = () => INPUTS.find((x: any) => x.iid === IID) as any
/* a man's home rows, as state/units.ts setHome saves them: [unit, from] in order (the first covers every day before it) */
const homes = (pid: string, key: string, rows: [string, string][]) => {
  rows.forEach(([unit, from], i) => { mem['sqn142_' + HOME_PFX + key + i] = JSON.stringify({ id: key + i, pid, unit, from }) })
  unitsLoad()
}
const on = (d: number) => { vi.setSystemTime(new Date(2026, 6, d, 9, 0, 0)); unitsLoad() }
const lineTo = (pid: string): Notice | undefined => NOTICES.find(n => n.to === pid && n.iid === IID)
const linesTo = (pid: string): Notice[] => NOTICES.filter(n => n.to === pid && n.iid === IID)
const env = (changes: any[], origin = 'user', type = 'inputs.batch'): any => ({ type, origin, actor: deriveActor(), changes })

describe('fault U — a member’s Undo of his own step on an input someone else filed for him', () => {
  it('(Opus F1, Fable 1) Ranger deletes the LL Hunter filed for him, then Undo and Redo: both go through', () => {
    signInAs('ad2', 'a2'); fileFor('bane', 'prowler')
    signInAs('us', 'us'); del()
    const l = lineTo('prowler')!
    expect(l, 'Hunter told it was deleted').toBeDefined()
    expect(l.fu).toEqual(['u142'])
    const u = globalUndo(); expect(u.ok, 'Undo: ' + JSON.stringify(u)).toBe(true)
    expect(theInput(), 'the leave is back').toBeDefined()
    expect(NOTICES.some(n => n.id === l.id), 'the line went with it').toBe(false)
    const r = globalRedo(); expect(r.ok, 'Redo: ' + JSON.stringify(r)).toBe(true)
    expect(theInput(), 'deleted again').toBeUndefined()
    expect(NOTICES.find(n => n.id === l.id)?.fu, 'the line back, its mark with it').toEqual(['u142'])
  })
  it('(Opus F2) Ranger changes its remark, Hunter moves to 149 from 16 Jul, on 16 Jul Ranger’s Undo and Redo go through', () => {
    signInAs('ad2', 'a2'); fileFor('bane', 'prowler')
    signInAs('us', 'us'); rmk('Ranger words')
    const l = lineTo('prowler')!
    expect(l, 'Hunter told as its filer').toBeDefined()
    homes('prowler', 'hu', [['u142', '2026-07-15'], ['u149', '2026-07-16']]); on(16)
    const u = globalUndo(); expect(u.ok, 'Undo: ' + JSON.stringify(u)).toBe(true)
    expect(theInput().remarks).toBe('for him')
    const r = globalRedo(); expect(r.ok, 'Redo: ' + JSON.stringify(r)).toBe(true)
    expect(theInput().remarks).toBe('Ranger words')
  })
  it('(control) a restore the timeline does not vouch for may not take Ranger’s line to Hunter away', () => {
    signInAs('ad2', 'a2'); fileFor('bane', 'prowler')
    signInAs('us', 'us'); rmk('Ranger words')
    const l = lineTo('prowler')!
    homes('prowler', 'hu', [['u142', '2026-07-15'], ['u149', '2026-07-16']]); on(16)
    /* the same two changes his Undo would make, but never made by his timeline: the remark put back, the line taken */
    const now = { ...theInput() }
    const forged = env([
      { collection: 'inputs', id: IID, op: 'put', before: now, after: { ...now, remarks: 'for him' } },
      { collection: 'notices', id: l.id, op: 'delete', before: { ...l }, after: null },
    ], 'restore', 'undo.restore')
    expect(ownershipViolation(forged) ?? 'allowed').toMatch(/not his own change/)
    /* …nor anyone else's line (one Hunter made to Ranger, say), timeline or not */
    const other = { ...l, id: 'nfr7-u', to: 'bane', by: 'prowler' }
    expect(ownershipViolation(env([forged.changes[0], { collection: 'notices', id: other.id, op: 'delete', before: other, after: null }], 'restore', 'undo.restore')) ?? 'allowed').toMatch(/not his own change/)
  })
})

/* Outlaw (`casper`) made a plain 142 admin — as the gate reads an actor (the security read's SEC7-1; the same actor
   multi-sqn-fixread3-retract-moved.test.ts uses) */
const outlaw = { id: 'acoutlaw', role: 'admin', personId: 'casper', session: null }
const asOutlaw = (changes: any[]): any => ({ type: 'inputs.batch', origin: 'user', actor: outlaw, changes })
/* his remark change of the LL, as a change of the input */
const remarkChange = (words = 'Outlaw words') => { const now = { ...theInput() }; return { collection: 'inputs', id: IID, op: 'put', before: now, after: { ...now, remarks: words } } }

describe('fault M — an input line not as the pass writes it', () => {
  /* Hunter files LL for Ranger; Saber's change of its remark tells Hunter (its filer), the line marked ['u142'] */
  const honest = (): Notice => {
    signInAs('ad2', 'a2'); fileFor('bane', 'prowler')
    signInAs('ad', 'a'); rmk('Saber words')
    const l = lineTo('prowler')!
    expect(l.fu).toEqual(['u142'])
    return l
  }
  it('(SEC7-1 nsec7a) an unmarked line to the filer riding the change is refused', () => {
    honest()
    const n = { id: 'nsec7a', to: 'prowler', by: 'casper', at: Date.now(), iid: IID, name: 'LL', day: '2026-07-25', what: [{ k: 'rmk' }] }
    expect(ownershipViolation(asOutlaw([remarkChange(), { collection: 'notices', id: n.id, op: 'put', before: null, after: n }])) ?? 'allowed').toMatch(/not as the pass writes it/)
  })
  it('(SEC7-1 nsec7b) a line naming an input the command does not change is refused', () => {
    honest()
    const n = { id: 'nsec7b', to: 'prowler', by: 'casper', at: Date.now(), iid: 'ipd-nowhere', name: 'LL', day: '2026-07-25', what: [{ k: 'rmk' }], fu: ['u142'] }
    expect(ownershipViolation(asOutlaw([remarkChange(), { collection: 'notices', id: n.id, op: 'put', before: null, after: n }])) ?? 'allowed').toMatch(/not as the pass writes it/)
  })
  it('(Astra A1) the honest line’s mark deleted, widened or emptied is refused, with or without a change of the input', () => {
    const l = honest()
    const { fu: _fu, ...bare } = l
    for (const after of [bare, { ...l, fu: ['u142', 'u149'] }, { ...l, fu: [] }] as Notice[]) {
      const w = { collection: 'notices', id: l.id, op: 'put', before: { ...l }, after }
      expect(ownershipViolation(asOutlaw([w])) ?? 'allowed', JSON.stringify(after.fu)).toMatch(/not as the pass writes it/)
      expect(ownershipViolation(asOutlaw([remarkChange(), w])) ?? 'allowed', JSON.stringify(after.fu)).toMatch(/not as the pass writes it/)
    }
    /* …and its reader, input or time moved */
    for (const after of [{ ...l, to: 'casper' }, { ...l, iid: 'ipd-nowhere' }, { ...l, at: l.at - 1000 }]) {
      expect(ownershipViolation(asOutlaw([remarkChange(), { collection: 'notices', id: l.id, op: 'put', before: { ...l }, after }])) ?? 'allowed').toMatch(/not as the pass writes it/)
    }
  })
  it('(control) the pass’s own line to his own man is accepted, and its exact copy at the gate passes too', () => {
    const l = honest()
    /* Outlaw writing the very line the pass writes, beside his change */
    const n = { ...l, id: 'nfr7-ok', by: 'casper', at: Date.now() }
    expect(ownershipViolation(asOutlaw([remarkChange(), { collection: 'notices', id: n.id, op: 'put', before: null, after: n }]))).toBeNull()
    /* Saber's real second change tells Hunter again */
    signInAs('ad', 'a'); rmk('Saber again')
    expect(linesTo('prowler').length).toBe(2)
  })
})

const readIt = (pid: string, l: Notice) => { mem[`sqn142_noticeseen:${pid}`] = JSON.stringify({ upto: 0, ids: [l.id] }); noticeSeenLoad() }
const shown = (pid: string, id: string) => noticesFor(pid).some(n => n.id === id)
/* Hunter files for Ranger; Saber's change on 15 Jul tells him (filer only, marked 142) — as fixread6-retired's */
const hunterLine = (): Notice => {
  signInAs('ad2', 'a2'); fileFor('bane', 'prowler')
  signInAs('ad', 'a'); rmk('changed by Saber on the 15th')
  const l = lineTo('prowler')!
  expect(l?.fu, 'Hunter told as its filer').toEqual(['u142'])
  return l
}
/* Hunter moves to 149 from 16 Jul; on the 17th the line his move retired is off his bell */
const hunterMoves = (l: Notice) => {
  homes('prowler', 'hc', [['u142', '2026-07-15'], ['u149', '2026-07-16']]); on(17)
  expect(shown('prowler', l.id), 'retired by his move').toBe(false)
}

describe('fault P — a right given after the move never brings a retired line back', () => {
  for (const read of [false, true]) {
    it(`(Fable 2, Astra A2) Plan of 142 given on the 18th: the ${read ? 'read' : 'unread'} line stays off`, () => {
      const l = hunterLine(); if (read) readIt('prowler', l)
      hunterMoves(l)
      on(18); signInAs('ad', 'a')
      expect(setGrant('acad2', 'u142', 'admin', 'prowler').ok).toBe(true)
      signInAs('ad2', 'a2')
      expect(shown('prowler', l.id), 'still off after the Plan grant').toBe(false)
    })
    it(`(Fable 2, step 3) made master on the 18th: the ${read ? 'read' : 'unread'} line stays off`, () => {
      const l = hunterLine(); if (read) readIt('prowler', l)
      hunterMoves(l)
      on(18); signInAs('ad', 'a')
      expect(setMaster('acad2', true).ok).toBe(true)
      signInAs('ad2', 'a2')
      expect(shown('prowler', l.id), 'still off after the master mark').toBe(false)
    })
  }
  it('(control) Plan of 142 held before the move keeps the line; so does one stored with no day (D56)', () => {
    const l = hunterLine()
    /* a grant row as setGrant writes it, given on the 15th (Hunter's move set after it) */
    mem['sqn142_' + GRANT_PFX + 'gfr7'] = JSON.stringify({ id: 'gfr7', account: 'acad2', unit: 'u142', level: 'admin', from: '2026-07-15' })
    homes('prowler', 'hc', [['u142', '2026-07-15'], ['u149', '2026-07-16']]); on(17)
    expect(shown('prowler', l.id), 'an admin of 142 on his move day: still told').toBe(true)
    mem['sqn142_' + GRANT_PFX + 'gfr7'] = JSON.stringify({ id: 'gfr7', account: 'acad2', unit: 'u142', level: 'admin' })
    unitsLoad()
    expect(shown('prowler', l.id), 'a grant stored before its day was kept counts from always').toBe(true)
    /* …and the grant setGrant writes carries its day */
    on(18); signInAs('ad', 'a')
    mem['sqn142_' + GRANT_PFX + 'gfr7'] = JSON.stringify({ id: 'gfr7', account: 'acad2', unit: 'u142', level: 'view', from: '2026-07-15' }); unitsLoad()
    expect(setGrant('acad2', 'u142', 'admin', 'prowler').ok).toBe(true)
    expect(JSON.parse(mem['sqn142_' + GRANT_PFX + 'gfr7']!).from).toBe('2026-07-18')
  })
})

describe('fault T — a line dated in the future never leaves the bell', () => {
  const AHEAD = new Date(2099, 0, 1).getTime()
  it('(SEC7-2 P2a) an admin’s line to Hunter dated 2099, riding a change of the input, is refused', () => {
    hunterLine()
    const n = { id: 'nsec7t', to: 'prowler', by: 'casper', at: AHEAD, iid: IID, name: 'LL', day: '2026-07-25', what: [{ k: 'rmk' }], fu: ['u142'] }
    expect(ownershipViolation(asOutlaw([remarkChange(), { collection: 'notices', id: n.id, op: 'put', before: null, after: n }])) ?? 'allowed').toMatch(/not dated now/)
    /* …nor dated long ago */
    const old = { ...n, id: 'nsec7t0', at: Date.now() - 24 * 3600 * 1000 }
    expect(ownershipViolation(asOutlaw([remarkChange(), { collection: 'notices', id: old.id, op: 'put', before: null, after: old }])) ?? 'allowed').toMatch(/not dated now/)
  })
  it('(SEC7-2 P2b) Ranger’s own change carrying his line to Hunter dated 2099 is refused', () => {
    signInAs('ad2', 'a2'); fileFor('bane', 'prowler')
    signInAs('us', 'us')
    const n = { id: 'nsec7tm', to: 'prowler', by: 'bane', at: AHEAD, iid: IID, name: 'LL', day: '2026-07-25', what: [{ k: 'rmk' }], fu: ['u142'] }
    const now = { ...theInput() }
    const ch = { collection: 'inputs', id: IID, op: 'put', before: now, after: { ...now, remarks: 'Ranger words' } }
    expect(ownershipViolation(env([ch, { collection: 'notices', id: n.id, op: 'put', before: null, after: n }])) ?? 'allowed').toMatch(/not dated now/)
    /* (control) the same line dated now rides his change */
    expect(ownershipViolation(env([ch, { collection: 'notices', id: n.id, op: 'put', before: null, after: { ...n, at: Date.now() } }]))).toBeNull()
  })
  it('(backstop) a line already held dated 2099 leaves Hunter’s bell on his move like any other', () => {
    const l = hunterLine()
    NOTICES.push({ ...l, id: 'nsec7tb', at: AHEAD })
    hunterMoves(l)
    expect(shown('prowler', 'nsec7tb'), 'the line dated ahead left too').toBe(false)
  })
})

describe('fault F — a genuine Undo / Redo carries only a follow-up line that is owed', () => {
  const D = '2026-07-15'
  /* Kestrel (149) refuses Osprey's LL of 15 Jul; Osprey does NOT read it; Osprey moves to 142 from 16 Jul; it is 16 Jul
     (as leavewar/multi-sqn-fixread6-followups.test.ts) */
  const refusedUnread = (): Notice => {
    signInAs('ad9', 'a9')
    expect(worldUnit()).toBe('u149')
    expect(setCell('osp9', D, 'LL')).toBe(true); setBidState('osp9', D, 'refused')
    const l = NOTICES.find(n => n.to === 'osp9' && (n.what || [])[0]?.k === 'lw')!
    expect(l, 'Osprey told').toBeDefined()
    homes('osp9', 'hf7', [['u149', '2026-07-15'], ['u142', '2026-07-16']]); on(16)
    return l
  }
  /* the genuine restore's envelope and the timeline's own word on it, as the commit gate was handed them (m4sec 1b) */
  const caught = (run: () => any): { env: any; fn: (c: any) => boolean } => {
    let got: { env: any; fn: (c: any) => boolean } | null = null
    setInputReplayCheck(e => { const fn = verifiedReplay(e); if (fn && !got) got = { env: e, fn }; return fn })
    try { const r = run(); expect(r.ok, JSON.stringify(r)).toBe(true) } finally { setInputReplayCheck(verifiedReplay) }
    expect(got, 'the gate asked the timeline').not.toBeNull()
    return got!
  }
  /* the same envelope with one more line, the follow-up line exactly as the writer would make it — judged with the
     timeline's word as it was */
  const withLine = (g: { env: any; fn: (c: any) => boolean }, dir: 'undo' | 'redo', l: Notice): string | null => {
    const f = followUpsFor([dir === 'undo' ? { collection: 'notices', op: 'delete', before: l } : { collection: 'notices', op: 'put', after: l }], dir)[0]!
    expect(f, 'the writer would word one').toBeDefined()
    const n = { id: 'nf7f-' + dir, to: f.to, by: 'kes9', at: Date.now(), iid: f.iid, name: f.name, day: f.day, what: f.what }
    setInputReplayCheck(() => g.fn)
    try { return ownershipViolation({ ...g.env, changes: [...g.env.changes, { collection: 'notices', id: n.id, op: 'put', before: null, after: n }] }) } finally { setInputReplayCheck(verifiedReplay) }
  }
  it('(Astra A3) Kestrel’s Undo of a refusal Osprey never read, with a "taken back" line injected: refused', () => {
    const l = refusedUnread()
    const g = caught(() => globalUndo())
    expect(NOTICES.some(n => (n.what || [])[0]?.k === 'lwback'), 'the writer owed none').toBe(false)
    expect(withLine(g, 'undo', l) ?? 'allowed').toMatch(/another squadron/)
  })
  it('(Astra A3) Kestrel’s Redo with no "taken back" to answer, with an "again" line injected: refused', () => {
    const l = refusedUnread()
    expect(globalUndo().ok).toBe(true)
    const g = caught(() => globalRedo())
    expect(NOTICES.some(n => (n.what || [])[0]?.k === 'lw' && (n.what[0] as any).again), 'the writer owed none').toBe(false)
    expect(withLine(g, 'redo', l) ?? 'allowed').toMatch(/another squadron/)
  })
  it('(control) read before the Undo: the "taken back" line is written and its exact twin is owed at the gate', () => {
    const l = refusedUnread()
    readIt('osp9', l)
    const g = caught(() => globalUndo())
    expect(NOTICES.filter(n => (n.what || [])[0]?.k === 'lwback').length, 'the writer owed one').toBe(1)
    /* (the real one already rides the envelope; a second naming the same line is one too many — fault B (2)) */
    const real = g.env.changes.filter((c: any) => c.collection === 'notices' && c.op === 'put' && c.after?.what?.[0]?.k === 'lwback')
    expect(real.length).toBe(1)
    setInputReplayCheck(() => g.fn)
    try { expect(ownershipViolation(g.env)).toBeNull() } finally { setInputReplayCheck(verifiedReplay) }
  })
})

describe('fault S — an unsigned line rides only the pass’s own telling, never a command’s label', () => {
  /* Saber (master) files for Ranger, then is 149's (from 16 Jul); on 16 Jul Outlaw, a plain 142 admin, changes it */
  const saberMoved = () => {
    signInAs('ad', 'a'); fileFor('bane', 'stiff')
    homes('stiff', 'hs7', [['u142', '2026-07-15'], ['u149', '2026-07-16']]); on(16)
  }
  const noMaker = (over: any = {}) => ({ id: 'nsec7s', to: 'stiff', at: Date.now(), iid: IID, name: 'LL', day: '2026-07-25', what: [{ k: 'out' }], fu: ['u142'], ...over })
  const asType = (type: string, n: any): any => ({ type, origin: 'user', actor: outlaw, changes: [remarkChange(), { collection: 'notices', id: n.id, op: 'put', before: null, after: n }] })
  it('(SEC7-3 P3) a no-maker line to Saber in a command labelled lw.postout is refused', () => {
    saberMoved()
    expect(ownershipViolation(asType('lw.postout', noMaker())) ?? 'allowed').toMatch(/another squadron/)
    /* (as it was already under inputs.batch, and signed by another man) */
    expect(ownershipViolation(asType('inputs.batch', noMaker())) ?? 'allowed').toMatch(/another squadron/)
    expect(ownershipViolation(asType('lw.postout', noMaker({ by: 'kes9' }))) ?? 'allowed').toMatch(/another squadron/)
  })
})

describe('fault Q — a filer who never moved stays told for the input’s days still his squadron’s (his D2225)', () => {
  /* Ranger (142) moves to 149 from 25 Jul; on 26 Jul Saber (master) changes the remark of the leave filed for him */
  const rangerMoved = () => homes('bane', 'hrq',[['u142', '2026-07-15'], ['u149', '2026-07-25']])
  it('(Q17) Hunter files Ranger’s LL 23–27 Jul; Ranger moves to 149 from 25 Jul; Saber’s remark tells Hunter', () => {
    signInAs('ad2', 'a2'); fileFor('bane', 'prowler', 'Jul 23', 'Jul 27')
    rangerMoved(); on(26)
    signInAs('ad', 'a'); rmk('Saber words')
    const l = lineTo('prowler')
    expect(l, 'Hunter told: 23 and 24 Jul are still 142’s').toBeDefined()
    /* told only as its filer, the mark naming the squadrons his telling was judged by — and the gate let it ride */
    expect([...l!.fu!].sort()).toEqual(['u142', 'u149'])
  })
  it('(Q16, control) Ranger, a 142 member, files a Training for Ace; nobody moved; Saber’s remark tells Ranger', () => {
    signInAs('us', 'us'); expect(writeInputsBatch(() => { INPUTS.push({ person: 'dj', date: 'Jul 25', yr: 2026, s: '09:00', e: '10:00', type: 'Training', remarks: 'for Ace', by: 'bane', at: Date.now(), iid: IID, ord: 99981 } as any) })).toBe(true)
    signInAs('ad', 'a'); rmk('Saber words')
    expect(lineTo('bane'), 'Ranger told as its filer').toBeDefined()
  })
  it('(control, D2223) a filer who moved is still not told: Hunter 149’s from 16 Jul', () => {
    signInAs('ad2', 'a2'); fileFor('bane', 'prowler', 'Jul 23', 'Jul 27')
    homes('prowler', 'hq', [['u142', '2026-07-15'], ['u149', '2026-07-16']]); on(16)
    signInAs('ad', 'a'); rmk('Saber words')
    expect(lineTo('prowler'), 'Hunter not told').toBeUndefined()
  })
  it('(control) Hunter is not told where none of the input’s days is still 142’s (LL 25–27, Ranger 149’s from 25 Jul)', () => {
    signInAs('ad2', 'a2'); fileFor('bane', 'prowler', 'Jul 25', 'Jul 27')
    rangerMoved(); on(26)
    signInAs('ad', 'a'); rmk('Saber words')
    expect(lineTo('prowler'), 'Hunter not told').toBeUndefined()
  })
})
