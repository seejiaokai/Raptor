// @vitest-environment jsdom
/* Multi-squadron batch 1 — A3 (the second fix read, Astra's A3; Fable's design A, 19 Nov 26 —
   docs/superpowers/briefs/2026-11-18-multi-sqn-b1-fixplan-fable-a3.md). The master admin, Saber, acts on Admin → Users
   with 142's Leave War loaded; Archive, Restore, Restore as and Delete of a 149 man used to act on 142's war — the war
   loaded — so 149's war never heard of it (Restore even said "That did not save"). Each now writes the man's OWN
   squadron's stored war, through the second store (leavewar/state/foreign.ts), never by swapping the war in view. */
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { storeBackend, HOOKS } from '../engine/hooks'
import { PEOPLE, indexCallsigns } from '../engine/people'
import { INPUTS } from '../engine/inputs'
import { initStore as raptorInitStore, notify as raptorNotify, resetSession } from '../state/store'
import { accountsLoad, signIn, sessionFor } from '../state/accounts'
import { addRosterPerson } from '../state/roster-add'
import { deletePerson } from '../state/person-delete'
import { ownershipViolation } from '../state/perms'
import { installGlobalUndo } from '../state/undo-wire'
import { globalUndo, undoState } from '../undo'
import { _resetTimeline } from '../undo/timeline'
import { onCommit, setConflictChecker, deriveActor } from '../command'
import { getState, initStore as lwInitStore, setPeople, worldUnit, setCell, grantOil, lwHistInit } from './state/store'
import { memoryBackend, type StorageBackend } from './state/storage'
import { projectPeople } from './state/raptorRoster'
import { wireLeaveWarSync, setWarWorldDoor, swapWarWorld, archivePerson, restoreArchivedPerson, restoreArchivedAs, restoreProblem } from './sync'

const mem: Record<string, string> = {}
let PEOPLE0 = ''
let ISNAP = ''
const signInAs = (name: string, pass = 'x') => { resetSession(sessionFor(signIn(name, pass))); raptorNotify() }
const saber = () => { signInAs('ad', 'a'); expect(worldUnit()).toBe('u142') }
const kestrel = () => { signInAs('ad9', 'a9'); expect(worldUnit()).toBe('u149') }
const pidOf = (cs: string): string => Object.keys(PEOPLE).find(k => (PEOPLE as any)[k].cs === cs) || ''
let worlds: Record<string, StorageBackend> = {}
/* a squadron's whole stored war, byte for byte */
const dump = (u: string): string => { const b = worlds[u]!; return JSON.stringify(b.keys().sort().map(k => [k, b.read(k)])) }
const profile = (u: string, pid: string): any => { const v = worlds[u]!.read('profile:' + pid); return v ? JSON.parse(v) : null }
/* his stored war records' dates (each `rec:` row carries its person and date) */
const recDates = (u: string, pid: string): string[] => worlds[u]!.keys().filter(k => k.startsWith('rec:'))
  .map(k => JSON.parse(worlds[u]!.read(k)!)).filter(r => r.pid === pid).map(r => String(r.date)).sort()
const awardDates = (u: string, pid: string): string[] => worlds[u]!.keys().filter(k => k.startsWith('ledger:'))
  .map(k => JSON.parse(worlds[u]!.read(k)!)).filter(e => e.personId === pid && e.counter === 'oil' && e.amount > 0).map(e => String(e.date)).sort()

beforeAll(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  PEOPLE0 = JSON.stringify(PEOPLE)
  ISNAP = JSON.stringify(INPUTS)
})
afterAll(() => { vi.useRealTimers(); storeBackend.impl = null; setWarWorldDoor(null) })
beforeEach(() => {
  vi.setSystemTime(new Date(2026, 6, 15, 9, 0, 0))                       // Wed 15 Jul 26
  Object.keys(mem).forEach(k => delete mem[k])
  storeBackend.impl = { getItem: (k: string) => (k in mem ? mem[k]! : null), setItem: (k: string, v: string) => { mem[k] = v }, keys: () => Object.keys(mem) } as any
  const p0 = JSON.parse(PEOPLE0)
  for (const k of Object.keys(PEOPLE)) delete (PEOPLE as any)[k]
  Object.assign(PEOPLE, p0); indexCallsigns()
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
  worlds = { u142: memoryBackend(), u149: memoryBackend() }
  setWarWorldDoor(null)
  lwInitStore(worlds.u142)
  raptorInitStore()
  accountsLoad()
  setPeople(projectPeople())
  wireLeaveWarSync()
  setWarWorldDoor((u: string) => ({ backend: worlds[u] ?? (worlds[u] = memoryBackend()) }))
  _resetTimeline(); lwHistInit(); installGlobalUndo()
  vi.spyOn(HOOKS, 'toast').mockImplementation(() => {})
})
afterEach(() => { setConflictChecker(null); _resetTimeline(); resetSession(null); vi.restoreAllMocks() })

describe('A3 — the master archives a 149 man with 142’s war loaded', () => {
  it('1. 149’s stored war closes his stint yesterday as a posting that ran; 142’s war is untouched; 149 then shows his months', () => {
    kestrel()
    expect(setCell('osp9', '2026-07-08', 'LL')).toBe(true)              // a record from his months here
    saber()
    const was142 = dump('u142')
    const r = archivePerson('osp9')
    expect(r.bad).toBeNull()
    const p = profile('u149', 'osp9')
    expect(p?.post?.to, 'his stint closed yesterday, on 149’s war').toBe('2026-07-14')
    expect(p.post.poArchive).toBe(true)
    expect(p.post.poDone, 'the posting has run, so the pass never runs it again').toBe('2026-07-15')
    expect(dump('u142'), '142’s war is not written').toBe(was142)
    expect(swapWarWorld('u149')).toBe(true)
    const st = getState()
    expect(st.postOuts.osp9?.to).toBe('2026-07-14')
    expect(st.postOuts.osp9?.poDone, 'the posting pass did not run him again').toBe('2026-07-15')
    expect((PEOPLE as any).osp9.archivedBy, 'still archived by the admin, not by a posting').toBe('admin')
    expect(st.people.some(p2 => p2.id === 'osp9'), 'his row stays for the months he was here').toBe(true)
    expect(recDates('u149', 'osp9')).toEqual(['2026-07-08'])
  })
  it('1b. on a 149 war nobody has opened yet, the first open keeps what the archive wrote', () => {
    saber()
    expect(archivePerson('osp9').bad).toBeNull()
    expect(profile('u149', 'osp9')?.post?.to).toBe('2026-07-14')
    expect(swapWarWorld('u149')).toBe(true)
    expect(getState().wars.length, 'the seeded leave periods still came').toBeGreaterThan(0)
    expect(getState().postOuts.osp9?.to).toBe('2026-07-14')
    expect(profile('u149', 'osp9')?.post?.to).toBe('2026-07-14')
  })
})

describe('A3 — the master restores a 149 man with 142’s war loaded', () => {
  const archivedBy149 = () => { kestrel(); expect(archivePerson('osp9').bad).toBeNull(); expect(profile('u149', 'osp9')?.post?.to).toBe('2026-07-14') }
  it('2. Restore with a post-in date: the old stint kept, a new one opens on 149’s stored war — no “That did not save”', () => {
    archivedBy149()
    saber()
    const was142 = dump('u142')
    expect(restoreProblem('osp9', '2026-07-20')).toBeNull()
    expect(restoreArchivedPerson('osp9', '2026-07-20')).toBe(true)
    const p = profile('u149', 'osp9').post
    expect({ from: p.from, to: p.to }).toEqual({ from: '2026-07-20', to: null })
    expect(p.past).toEqual([{ from: null, to: '2026-07-14' }])
    expect(p.poArchive).toBeUndefined()
    expect((PEOPLE as any).osp9.archived).toBe(false)
    expect(dump('u142')).toBe(was142)
  })
  it('2b. Restore as another callsign: the same', () => {
    archivedBy149()
    saber()
    expect(restoreArchivedAs('osp9', 'Ospry', '2026-07-20')).toBeNull()
    const p = profile('u149', 'osp9').post
    expect({ from: p.from, to: p.to }).toEqual({ from: '2026-07-20', to: null })
    expect((PEOPLE as any).osp9.cs).toBe('Ospry')
  })
  it('3. a post-in on or before the day his stint closed is refused in Restore’s own words; nothing is written', () => {
    archivedBy149()
    saber()
    const was149 = dump('u149')
    expect(restoreProblem('osp9', '2026-07-10')).toBe('Posted out from 15 Jul 26 — the post-in has to be on or after that day.')
    expect(restoreArchivedPerson('osp9', '2026-07-10')).toBe(false)
    expect(restoreArchivedAs('osp9', 'Osprey', '2026-07-10')).toBe('Posted out from 15 Jul 26 — the post-in has to be on or after that day.')
    expect(dump('u149')).toBe(was149)
    expect((PEOPLE as any).osp9.archived).toBe(true)
  })
})

describe('A3 — the master deletes a 149 man with 142’s war loaded', () => {
  it('4. his records from today go from 149’s stored war, the past ones stay; his stint closes yesterday, marked gone', () => {
    kestrel()
    expect(setCell('osp9', '2026-06-10', 'LL')).toBe(true)
    expect(setCell('osp9', '2026-08-10', 'LL')).toBe(true)
    expect(grantOil(['osp9'], 1, '2026-06-03', 'past')).toBeNull()
    expect(grantOil(['osp9'], 1, '2026-08-03', 'future')).toBeNull()
    saber()
    const was142 = dump('u142')
    expect(deletePerson('osp9')).toBeNull()
    expect(recDates('u149', 'osp9')).toEqual(['2026-06-10'])
    expect(awardDates('u149', 'osp9')).toEqual(['2026-06-03'])
    const p = profile('u149', 'osp9').post
    expect(p.to).toBe('2026-07-14')
    expect(p.gone).toBe(true)
    expect(dump('u142')).toBe(was142)
  })
  it('4b. a 149 man who never arrived: his stored profile goes', () => {
    kestrel()
    expect(addRosterPerson({ cs: 'Newby', ini: 'NB', seat: 'FCP', cat: 'D' } as any, '2026-12-01')).toBeNull()
    const id = pidOf('Newby')
    expect(profile('u149', id)?.post?.from).toBe('2026-12-01')
    saber()
    expect(deletePerson(id)).toBeNull()
    expect(profile('u149', id)).toBeNull()
  })
})

describe('A3 — refused whole', () => {
  it('5. a command refused after the war half ran writes nothing to 149’s war', () => {
    saber()
    const was149 = dump('u149')
    setConflictChecker(() => 'forced for the test')
    expect(archivePerson('osp9').bad).toBeTruthy()
    setConflictChecker(null)
    expect(dump('u149')).toBe(was149)
    expect((PEOPLE as any).osp9.archived).toBeFalsy()
  })
  it('5b. the last-admin lock: archiving Kestrel, 149’s only admin, is refused and 149’s war is untouched', () => {
    saber()
    const was149 = dump('u149')
    expect(archivePerson('kes9').bad).toMatch(/149's last admin/)
    expect(dump('u149')).toBe(was149)
  })
})

describe('A3 — the gate on the new records', () => {
  const env = (collection: string, id: string): any => ({ seq: 1, at: '', origin: 'local', scope: { module: 'people' }, type: 'person.archive', actor: deriveActor(),
    changes: [{ op: 'put', collection, id, before: null, after: { id: 'osp9', from: null, to: '2026-07-14' } }] })
  it('6. Hunter (142’s plain admin) may not write 149’s stored war; a member may not write any', () => {
    signInAs('ad2', 'a2')
    expect(ownershipViolation(env('lwx.profile', 'u149@osp9'))).toMatch(/another unit's records \(u149\)/)
    expect(ownershipViolation(env('lwx.rec', 'u149@w1:r1'))).toMatch(/another unit's records \(u149\)/)
    signInAs('us9', 'us9')
    expect(ownershipViolation(env('lwx.profile', 'u149@osp9'))).toMatch(/an admin's record/)
    expect(ownershipViolation(env('lwx.ledger', 'u149@l1'))).toMatch(/an admin's record/)
    saber()
    expect(ownershipViolation(env('lwx.profile', 'u149@osp9')), 'control: the master').toBeNull()
  })
})

describe('A3 — Undo and the home path', () => {
  it('7. the master’s Archive is no Undo step, and his earlier 142 change still undoes cleanly', () => {
    saber()
    expect(setCell('bane', '2026-07-22', 'LL')).toBe(true)
    expect(archivePerson('osp9').bad).toBeNull()
    expect(undoState().canUndo).toBe(true)
    expect(globalUndo().ok).toBe(true)
    expect(getState().wars.some(w => Object.keys(w.recs?.bane || {}).includes('2026-07-22')), 'the bid undone').toBe(false)
    expect((PEOPLE as any).osp9.archived, 'the archive stays').toBe(true)
    expect(profile('u149', 'osp9')?.post?.to).toBe('2026-07-14')
  })
  it('8. Kestrel, with 149 loaded, archives Osprey through the loaded war, as before', () => {
    kestrel()
    const seen: string[] = []
    const off = onCommit(e => { if (e.type === 'person.archive') seen.push(...e.changes.map(c => c.collection)) })
    expect(archivePerson('osp9').bad).toBeNull()
    off()
    expect(seen).toContain('lw.postouts')
    expect(seen.some(c => c.startsWith('lwx.'))).toBe(false)
    expect(getState().postOuts.osp9?.to).toBe('2026-07-14')
    expect(profile('u149', 'osp9')?.post?.to).toBe('2026-07-14')
  })
})
