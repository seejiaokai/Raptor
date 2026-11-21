// @vitest-environment jsdom
/* Fix read 6, fault A (19 Nov 26) — the security read's SEC6-A = the fresh Opus read's F1 = Astra's 3: an ALL AVAIL input
   (one that names nobody) told, and let a forger reach, a man of another squadron. An input naming nobody HAS a squadron —
   the gate's 7c gives it the placeholder's filer's (else the input's filer's) home on the input's own date — but the
   filer's test (state/notices.ts filerTold) answered "told" whenever nobody was named, the gate's list of who a change
   may tell (state/perms.ts toldBy) took the filer from the after-image a forger writes, and the door never asked who
   signed the line. By his D2223 ("the filer is told only while he is still that man's admin or in the input") and D2194
   (no bell line about one squadron's own business reaches the other's people).
   Harness as leavewar/multi-sqn-fixread4-bells.test.ts. */
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { storeBackend, HOOKS } from '../engine/hooks'
import { PEOPLE, indexCallsigns } from '../engine/people'
import { initStore as raptorInitStore, notify as raptorNotify, resetSession, writeInputsBatch } from '../state/store'
import { accountsLoad, signIn, sessionFor, updateAccount } from '../state/accounts'
import { initStore as lwInitStore, setPeople } from './state/store'
import { ownershipViolation } from '../state/perms'
import { deriveActor } from '../command/actor'
import { memoryBackend } from './state/storage'
import { projectPeople } from './state/raptorRoster'
import { wireLeaveWarSync, setWarWorldDoor } from './sync'
import { homeOn, unitsLoad, setGrant } from '../state/units'
import { HOME_PFX } from '../state/units-model'
import { INPUTS } from '../engine/inputs'
import { NOTICES, noticesFor } from '../state/notices'
import { noticeSeenLoad } from '../state/noticeseen'
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

const IID = 'ipd-fr6-aa'
/* a Meeting for ALL AVAIL on `date`, filed by `filer` (the placeholder carries the same filer, as the window files it) */
const fileAA = (filer: string, date = 'Jul 15') => expect(writeInputsBatch(() => {
  INPUTS.push({ iid: IID, person: 'allavail', people: [{ p: 'allavail', by: filer, at: Date.now() }], type: 'Meeting', date, yr: 2026, allday: true, remarks: 'brief', by: filer, at: Date.now(), ord: 99961 } as any)
})).toBe(true)
const rmk = (words: string) => expect(writeInputsBatch(() => { (INPUTS.find((x: any) => x.iid === IID) as any).remarks = words })).toBe(true)
const toWho = (pid: string) => NOTICES.filter(n => n.to === pid && n.iid === IID)
/* a move as state/units.ts setHome saves one for a man with no row of his own: 142 first, 149 from 16 Jul */
const move = (pid: string, key: string) => {
  mem['sqn142_' + HOME_PFX + key + 'a'] = JSON.stringify({ id: key + 'a', pid, unit: 'u142', from: '2026-07-15' })
  mem['sqn142_' + HOME_PFX + key] = JSON.stringify({ id: key, pid, unit: 'u149', from: '2026-07-16' })
  unitsLoad()
}
const day17 = () => { vi.setSystemTime(new Date(2026, 6, 17, 9, 0, 0)); unitsLoad() }
/* Outlaw, made a plain 142 admin by the master */
const asOutlawAdmin = () => { signInAs('ad', 'a'); expect(updateAccount('acoutlaw', { role: 'admin' })).toBeNull(); signInAs('outlaw') }
const line = (id: string, to: string, by: string, what: any[] = [{ k: 'rmk' }]) => ({ id, to, by, at: Date.now(), iid: IID, name: 'Meeting', day: '2026-07-20', what })
const env = (changes: any[]): any => ({ type: 'inputs.batch', origin: 'user', actor: deriveActor(), changes })

describe('fault A — the security read’s three proofs (a plain 142 admin, a forged ALL AVAIL input, a line to 149’s Osprey)', () => {
  it('1: a NEW ALL AVAIL input whose filer field says Osprey (the placeholder’s says Outlaw), a line to Osprey in the same command — refused', () => {
    asOutlawAdmin()
    const forged = { iid: IID, person: 'allavail', people: [{ p: 'allavail', by: 'casper', at: 1 }], type: 'Meeting', date: 'Jul 20', yr: 2026, allday: true, remarks: 'x', by: 'osp9', at: 1, ord: 99961 }
    const e = env([{ collection: 'inputs', id: IID, op: 'put', before: null, after: forged }, { collection: 'notices', id: 'nf6a1', op: 'put', before: null, after: line('nf6a1', 'osp9', 'casper', [{ k: 'in' }]) }])
    expect(ownershipViolation(e) ?? 'allowed').toMatch(/bell line of another squadron/)
    /* …and through the app's own command: the line never reaches Osprey's bell */
    writeInputsBatch(() => { INPUTS.push({ ...forged } as any); NOTICES.push(line('nf6a1', 'osp9', 'casper', [{ k: 'in' }]) as any) })
    expect(NOTICES.some(n => n.id === 'nf6a1'), 'not on Osprey’s bell').toBe(false)
  })
  it('2: an existing 142 ALL AVAIL input whose filer Outlaw changes to Osprey — the line to Osprey refused', () => {
    signInAs('ad', 'a'); fileAA('stiff', 'Jul 20')
    asOutlawAdmin()
    const r = INPUTS.find((x: any) => x.iid === IID) as any
    const e = env([{ collection: 'inputs', id: IID, op: 'put', before: { ...r }, after: { ...r, by: 'osp9', remarks: 'by Outlaw' } }, { collection: 'notices', id: 'nf6a2', op: 'put', before: null, after: line('nf6a2', 'osp9', 'casper') }])
    /* (fix read 2, 22 Nov 26: the filer written onto 149's man is now refused in itself, before the line is judged —
       perms.ts inputWhoProblem; refused either way) */
    expect(ownershipViolation(e) ?? 'allowed').toMatch(/bell line of another squadron|an input of another squadron \(u149\)/)
  })
  it('3: a line signed by another man (`by: kes9`, posing as 149’s admin) — refused, though its reader is one the change may tell', () => {
    /* the master, Saber, filed a 142 ALL AVAIL input and has since moved to 149: he is still told (an admin everywhere),
       so a line to him rides Outlaw's change — but only as Outlaw's own line, never signed by 149's admin */
    signInAs('ad', 'a'); fileAA('stiff')
    move('stiff', 'hfr6s'); day17()
    expect(homeOn('stiff', rosterToday())).toBe('u149')
    asOutlawAdmin()
    const r = INPUTS.find((x: any) => x.iid === IID) as any
    const ch = { collection: 'inputs', id: IID, op: 'put', before: { ...r }, after: { ...r, remarks: 'by Outlaw' } }
    expect(ownershipViolation(env([ch, { collection: 'notices', id: 'nf6a3', op: 'put', before: null, after: line('nf6a3', 'stiff', 'kes9') }])) ?? 'allowed').toMatch(/bell line of another squadron/)
    /* (the forged-filer line of proof 2, signed kes9, likewise) */
    const ch2 = { ...ch, after: { ...r, by: 'osp9', remarks: 'by Outlaw' } }
    expect(ownershipViolation(env([ch2, { collection: 'notices', id: 'nf6a4', op: 'put', before: null, after: line('nf6a4', 'osp9', 'kes9') }])) ?? 'allowed').toMatch(/bell line of another squadron|an input of another squadron \(u149\)/)
    /* control: the same line to Saber signed by Outlaw himself rides as the pass writes it — told only as its filer, so
       marked with the input's squadron, 142 (fault C, Notice.fu) */
    expect(ownershipViolation(env([ch, { collection: 'notices', id: 'nf6a5', op: 'put', before: null, after: { ...line('nf6a5', 'stiff', 'casper'), fu: ['u142'] } }]))).toBeNull()
  })
  it('control: the same forged input naming a 142 man (Ranger) is refused, as today', () => {
    asOutlawAdmin()
    const forged = { iid: IID, person: 'bane', people: [{ p: 'bane', by: 'casper', at: 1 }], type: 'Meeting', date: 'Jul 20', yr: 2026, allday: true, remarks: 'x', by: 'osp9', at: 1, ord: 99961 }
    const e = env([{ collection: 'inputs', id: IID, op: 'put', before: null, after: forged }, { collection: 'notices', id: 'nf6a6', op: 'put', before: null, after: line('nf6a6', 'osp9', 'casper', [{ k: 'rmk' }]) }])
    expect(ownershipViolation(e) ?? 'allowed').toMatch(/bell line of another squadron/)
  })
})

describe('fault A — the honest flow: Hunter files ALL AVAIL on 15 Jul, moves to 149 from 16 Jul', () => {
  it('17 Jul, Outlaw (a plain 142 admin) changes it: no line to Hunter, and a forged one is refused', () => {
    signInAs('ad2', 'a2'); fileAA('prowler')
    move('prowler', 'hfr6h'); day17()
    expect(homeOn('prowler', rosterToday())).toBe('u149')
    asOutlawAdmin(); rmk('changed by Outlaw')
    expect(toWho('prowler').length, 'no 142 line about a 142 input to the moved filer').toBe(0)
    const r = INPUTS.find((x: any) => x.iid === IID) as any
    const e = env([{ collection: 'inputs', id: IID, op: 'put', before: { ...r }, after: { ...r, remarks: 'again' } }, { collection: 'notices', id: 'nf6h', op: 'put', before: null, after: line('nf6h', 'prowler', 'casper') }])
    expect(ownershipViolation(e) ?? 'allowed').toMatch(/bell line of another squadron/)
  })
  it('his line from before the move (Saber’s change on 15 Jul) leaves his bell on his move day', () => {
    signInAs('ad2', 'a2'); fileAA('prowler')
    signInAs('ad', 'a'); rmk('changed by Saber on the 15th')
    expect(toWho('prowler').length, 'told before the move').toBe(1)
    move('prowler', 'hfr6h'); day17()
    signInAs('ad2', 'a2')
    expect(noticesFor('prowler').some(n => n.iid === IID), 'off his bell').toBe(false)
  })
})

describe('fault A — controls: still told', () => {
  it('a filer never moved: Hunter files ALL AVAIL, Saber changes it — Hunter told', () => {
    signInAs('ad2', 'a2'); fileAA('prowler')
    day17()
    signInAs('ad', 'a'); rmk('changed by Saber')
    expect(toWho('prowler').length).toBe(1)
  })
  it('a master filer: Saber files ALL AVAIL, moves to 149, Hunter changes it — Saber told', () => {
    signInAs('ad', 'a'); fileAA('stiff')
    move('stiff', 'hfr6s'); day17()
    expect(homeOn('stiff', rosterToday())).toBe('u149')
    signInAs('ad2', 'a2'); rmk('changed by Hunter')
    expect(toWho('stiff').length).toBe(1)
  })
  it('a Plan holder: Hunter files ALL AVAIL, moves to 149, is given Plan of 142 — Outlaw’s change tells him', () => {
    signInAs('ad2', 'a2'); fileAA('prowler')
    move('prowler', 'hfr6h'); day17()
    signInAs('ad', 'a'); expect(updateAccount('acad2', { role: 'admin' }), 'setup (K3, D2160): he joined as a member — made an admin of his new squadron first').toBeNull(); expect(setGrant('acad2', 'u142', 'admin', 'prowler').ok).toBe(true)
    asOutlawAdmin(); rmk('changed by Outlaw')
    expect(toWho('prowler').length).toBe(1)
  })
})
