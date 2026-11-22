// @vitest-environment jsdom
/* Multi-squadron batch 1 — the second fix read's (18 Nov 26) faults that live on the Leave War's side, each reproduced
   red first in a world with two wars, one per squadron (the app's own swap on sign-in, leavewar/sync.ts swapWarWorld).
   Astra 4: a new 149 man lost his post-in date — every writer called the war's post-in before his home was written, so
   the projection (149's) did not have him and the war half returned in silence. */
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { storeBackend, HOOKS } from '../engine/hooks'
import { PEOPLE, indexCallsigns } from '../engine/people'
import { initStore as raptorInitStore, notify as raptorNotify, resetSession } from '../state/store'
import { accountsLoad, signIn, sessionFor, addPersonAndAccount, requestAccess, approveRequestNew, ACCESS_REQS, updateAccount, accountById } from '../state/accounts'
import { addRosterPerson } from '../state/roster-add'
import { getState, initStore as lwInitStore, setPeople, worldUnit, setRole, setPostOut, grantOil, setCell } from '../leavewar/state/store'
import { memoryBackend } from '../leavewar/state/storage'
import { projectPeople } from '../leavewar/state/raptorRoster'
import { wireLeaveWarSync, setWarWorldDoor, swapWarWorld, postOut, postOutProblem, runPoOutcomes } from '../leavewar/sync'
import { ownershipViolation } from '../state/perms'
import { INPUTS } from '../engine/inputs'

const mem: Record<string, string> = {}
let PEOPLE0 = ''
const signInAs = (name: string, pass = 'x') => { resetSession(sessionFor(signIn(name, pass))); raptorNotify() }
const pidOf = (cs: string): string => Object.keys(PEOPLE).find(k => (PEOPLE as any)[k].cs === cs) || ''
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
  accountsLoad()
  setPeople(projectPeople())
  wireLeaveWarSync()
  setWarWorldDoor((u: string) => ({ backend: worlds[u] ?? (worlds[u] = memoryBackend()) }))
  vi.spyOn(HOOKS, 'toast').mockImplementation(() => {})
})

const NP = (cs: string) => ({ cs, ini: 'FJ', seat: 'FCP', cat: 'D' }) as any

describe('Astra 4 — a new 149 man keeps his post-in date on 149’s war', () => {
  it('Admin → Users, New person with a sign-in', () => {
    signInAs('ad9', 'a9')
    expect(worldUnit()).toBe('u149')
    expect(addPersonAndAccount('join149', NP('FixJoin'), 'main', '2026-12-01')).toBeNull()
    const pid = pidOf('FixJoin')
    expect(pid).not.toBe('')
    expect(getState().postOuts[pid]?.from, 'the war counts him from his post-in date').toBe('2026-12-01')
  })
  it('Admin → Users, New person with a blank sign-in (roster only)', () => {
    signInAs('ad9', 'a9')
    expect(addRosterPerson(NP('FixRoster'), '2026-12-01')).toBeNull()
    expect(getState().postOuts[pidOf('FixRoster')]?.from).toBe('2026-12-01')
  })
  it('approving an access request as New person', () => {
    signInAs('joinreq@mail')
    expect(requestAccess(NP('FixReq'))).toBeNull()
    signInAs('ad9', 'a9')
    const rq = ACCESS_REQS.find(r => r.name === 'joinreq@mail')
    expect(rq).toBeTruthy()
    expect(approveRequestNew(rq!.id, NP('FixReq'), 'main', '2026-12-01')).toBeNull()
    expect(getState().postOuts[pidOf('FixReq')]?.from).toBe('2026-12-01')
  })
  it('control: 142’s admin adds a 142 man — his date kept, as before', () => {
    signInAs('ad', 'a')
    expect(worldUnit()).toBe('u142')
    expect(addPersonAndAccount('join142', NP('FixHome'), 'main', '2026-12-01')).toBeNull()
    expect(getState().postOuts[pidOf('FixHome')]?.from).toBe('2026-12-01')
  })
})

/* SECURITY H2 — 142's plain admin (Hunter) loaded 149's war (the app's own swap — the console can call it) and set a
   posting for 149's Osprey dated tomorrow; the posting pass, running as the app, carried it out the next day. A war record's
   id names no unit, so the gate never asked which squadron's war it was (Fable's plan C3). Now the war tells the gate
   (perms.ts section 7b), the posting sheet says the squadron sentence first, and the pass carries out only its own men. */
describe('Security H2 — a squadron’s Leave War by its own people only', () => {
  const hunter = () => {
    signInAs('ad', 'a')
    expect(updateAccount('acad2', { role: 'admin' })).toBeNull()   // Hunter, 142's plain admin
    signInAs('ad2', 'a2')
    expect(worldUnit()).toBe('u142')
  }
  const warNow = () => JSON.stringify({ recs: getState().wars.map(w => w.recs), ledger: getState().ledger, po: getState().postOuts })
  it('Hunter in 149’s war: a posting for Osprey (Overseas Sqn) is refused, nothing stored', () => {
    hunter()
    expect(swapWarWorld('u149')).toBe(true); setRole('admin')
    const was = warNow()
    expect(postOutProblem('osp9', 'overseas')).toBe("He is 149's. Only an admin of 149 can change him.")
    expect(postOut('osp9', '2026-07-16', 'overseas')).toBe(false)
    expect(warNow()).toBe(was)
  })
  it('…a Delete posting the same, and the next day the pass changes nothing', () => {
    hunter()
    swapWarWorld('u149'); setRole('admin')
    expect(postOut('osp9', '2026-07-16', 'delete')).toBe(false)
    vi.setSystemTime(new Date(2026, 6, 16, 9, 0, 0))
    runPoOutcomes()
    expect({ deleted: !!(PEOPLE as any).osp9.deleted, archived: !!(PEOPLE as any).osp9.archived, acct: accountById('acus9')?.on }).toEqual({ deleted: false, archived: false, acct: true })
  })
  it('…straight past the sheet, at the gate: a posting, an OIL grant and a bid for Osprey are refused', () => {
    hunter()
    swapWarWorld('u149'); setRole('admin')
    const was = warNow()
    setPostOut('osp9', '2026-07-16', 'overseas')   // the store's own write answers true; the gate takes it back
    grantOil(['osp9'], 1, '2026-07-20', 'forged')
    setCell('osp9', '2026-08-03', 'LL')
    expect(warNow()).toBe(was)
  })
  it('control: Kestrel, 149’s admin, posts out his own man in 149’s war', () => {
    signInAs('ad9', 'a9')
    expect(worldUnit()).toBe('u149')
    expect(postOut('osp9', '2026-07-16', 'overseas')).toBe(true)
    expect(getState().postOuts.osp9?.to).toBeTruthy()
  })
  it('control: Hunter in his own war posts out a 142 man', () => {
    hunter()
    const pid = pidOf('Ranger')
    expect(postOut(pid, '2026-07-16', 'none')).toBe(true)
    expect(getState().postOuts[pid]?.to).toBeTruthy()
  })
  /* the war keeps no posting for a man off its roster (setPostOut refuses one), so this is the gate's own backstop, asked
     directly: the pass's command, run on 142's war, carrying out a posting for 149's Osprey */
  it('the pass carries out only its own squadron’s men (the gate asked directly)', () => {
    signInAs('ad', 'a')
    expect(worldUnit()).toBe('u142')
    vi.setSystemTime(new Date(2026, 6, 16, 9, 0, 0))
    const run = (pid: string): any => ({
      seq: 1, at: '', origin: 'local', scope: 'leavewar', type: 'lw.postoutRun', actor: { id: 'system', role: 'system' },
      changes: [{ op: 'put', collection: 'lw.postouts', id: pid, before: { id: pid, to: '2026-07-15', poOutcome: 'none' }, after: { id: pid, to: '2026-07-15', poOutcome: 'none', poDone: '2026-07-16' } }],
    })
    expect(ownershipViolation(run('osp9'))).toMatch(/another squadron's man/)
    expect(ownershipViolation(run(pidOf('Ranger'))), 'control: a 142 man in 142’s war').toBeNull()
  })
})

/* D2205 — a posting that would suspend or delete a master admin: an Overseas Sqn posting only by a master (it suspends
   his account on its date, and the pass runs as the app), a Delete posting by no one */
describe('D2205 — a master’s posting', () => {
  it('Hunter, a plain admin, cannot set an Overseas Sqn posting for Saber, the master — at the sheet or at the gate', () => {
    signInAs('ad', 'a')
    expect(updateAccount('acad2', { role: 'admin' })).toBeNull()
    signInAs('ad2', 'a2')
    const saber = pidOf('Saber')
    expect(postOutProblem(saber, 'overseas')).toBe('Only a master admin can do that')
    setPostOut(saber, '2026-07-16', 'overseas')   // the store's own write answers true; the gate takes it back
    expect(getState().postOuts[saber]?.to).toBeFalsy()
    expect(postOut(saber, '2026-07-16', 'sans')).toBe(true)   // SANS changes no account: any admin of his squadron
  })
})
