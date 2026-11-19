// @vitest-environment jsdom
/* Fix read 12 (20 Nov 26) — the faults the readers found in fix read 11's code (the builder's brief:
   docs/superpowers/briefs/2026-11-20-multi-sqn-b1-fixread12-fixes-brief.md). Each describe is one fault, red first on the
   code the readers read (c2fd83020). Hunter (142's plain admin, `ad2`); Saber the master (`ad`); Ranger (142, `us`,
   account `acus`, person `bane`); Kestrel and Osprey are 149's (`ad9`, `us9`). Harness as
   leavewar/multi-sqn-fixread11.test.ts; the readers' set-ups copied, never imported. */
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { storeBackend, HOOKS, store as settingsStore } from '../engine/hooks'
import { PEOPLE, indexCallsigns } from '../engine/people'
import { initStore as raptorInitStore, notify as raptorNotify, resetSession } from '../state/store'
import { accountsLoad, signIn, sessionFor, updateAccount, ACCOUNTS_LIST, accountOfPid, addAccount, dropAccountOfPid } from '../state/accounts'
import { initStore as lwInitStore, setPeople, getState } from '../leavewar/state/store'
import { ownershipViolation } from '../state/perms'
import { memoryBackend } from '../leavewar/state/storage'
import { projectPeople } from '../leavewar/state/raptorRoster'
import { wireLeaveWarSync, setWarWorldDoor, postOut, runPoOutcomes } from '../leavewar/sync'
import { unitsLoad, setGrant, removeGrant, homeOn, unitRows } from '../state/units'
import { INPUTS } from '../engine/inputs'
import { NOTICES } from '../state/notices'
import { commit, onCommit } from '../command'
import { noticeSeenLoad } from '../state/noticeseen'
import { installGlobalUndo } from '../state/undo-wire'
import { _resetTimeline } from '../undo/timeline'
import { commitSettingsIntent, peopleStore, finishPeopleWrite, settingsStore as settingsCmdStore } from '../state/people-settings-commit'
import { schedStore, schedApplyEnd, resyncBeforeEnlist } from '../state/sched-commit'
import { applyDelete, deletePerson } from '../state/person-delete'

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
/* the harness's own saved copy keeps a removed row as the text 'null' (as fix read 11's); the real browser adapter
   deletes the key (storage/adapters.ts) — fault C's describe uses that one */
let deletesNull = false
beforeEach(() => {
  vi.setSystemTime(new Date(2026, 6, 15, 9, 0, 0))
  Object.keys(mem).forEach(k => delete mem[k])
  storeBackend.impl = { getItem: (k: string) => (k in mem ? mem[k]! : null), setItem: (k: string, v: string) => { if (deletesNull && v === 'null') delete mem[k]; else mem[k] = v }, keys: () => Object.keys(mem) } as any
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

const on = (d: number, h = 9, m = 0) => { vi.setSystemTime(new Date(2026, 6, d, h, m, 0)); unitsLoad() }
const grantsOf = (id: string) => unitRows().grants.filter(g => g.account === id)
const free = (unit: string, not: string[] = []) => Object.keys(PEOPLE).filter(p => homeOn(p) === unit && !not.includes(p) && !accountOfPid(p)
  && !(PEOPLE as any)[p].deleted && !(PEOPLE as any)[p].archived && !(PEOPLE as any)[p].special)
/* the accounts saved as rows (as after the database step): the first write stores the whole list */
const saveAccounts = () => {
  signInAs('ad', 'a')
  expect(updateAccount('acus', { on: true }) ?? null).toBeNull()
  expect(addAccount('spare142@mail', free('u142', ['osp9'])[0]!, 'main')).toBeNull()
  expect(Object.keys(mem).some(k => k.endsWith('account:acus') && mem[k] !== 'null'), 'his sign-in row is saved').toBe(true)
}
const rowSaved = (aid: string) => { const k = Object.keys(mem).find(x => x.endsWith('account:' + aid)); return !!(k && mem[k] && mem[k] !== 'null') }
/* Kestrel (149's admin) gives Ranger a right in 149 */
const rangerRight = (level: 'view' | 'admin') => {
  signInAs('ad9', 'a9')
  expect(setGrant('acus', 'u149', level, 'bane').ok, 'Kestrel gives Ranger ' + level + ' of 149').toBe(true)
  unitsLoad()
  expect(grantsOf('acus').length).toBe(1)
}
const rangerState = () => {
  accountsLoad(); unitsLoad()
  return { deleted: !!(PEOPLE as any).bane.deleted, account: !!ACCOUNTS_LIST.find(a => a.id === 'acus'), grants: grantsOf('acus').length }
}
const passTypes = () => {
  const seen: string[] = []
  const off = onCommit((e: any) => { seen.push(e.type) })
  try { runPoOutcomes() } finally { off() }
  return seen
}

describe('fault A — the posting pass\'s Delete of a man whose sign-in holds a right in another squadron (O12-2, F12-1, Astra 1)', () => {
  for (const level of ['view', 'admin'] as const) {
    for (const [who, by] of [['the master', ['ad', 'a']], ['his home admin', ['ad2', 'a2']]] as const) {
      it(`scheduled: ${who} posts Ranger out with Delete on 16 Jul; he holds ${level} of 149 — the pass deletes him, his sign-in and the right`, () => {
        rangerRight(level)
        signInAs(by[0], by[1])
        expect(postOut('bane', '2026-07-16', 'delete')).toBe(true)
        on(16)
        const types = passTypes()
        expect(types, 'the pass committed').toContain('lw.postoutRun')
        expect(rangerState()).toEqual({ deleted: true, account: false, grants: 0 })
        expect(getState().postOuts.bane?.poDone ?? 'record gone').not.toBeUndefined()
      })
      it(`immediate (Astra): ${who} posts Ranger out with Delete dated today; his saved sign-in holds ${level} of 149 — done at once`, () => {
        saveAccounts()
        rangerRight(level)
        signInAs(by[0], by[1])
        expect(postOut('bane', '2026-07-15', 'delete'), 'the posting is saved').toBe(true)
        expect(rangerState()).toEqual({ deleted: true, account: false, grants: 0 })
        expect(rowSaved('acus'), 'his sign-in row gone from the saved copy').toBe(false)
      })
    }
  }
  it('(control) immediate, no right elsewhere: done at once', () => {
    saveAccounts()
    signInAs('ad2', 'a2')
    expect(postOut('bane', '2026-07-15', 'delete')).toBe(true)
    expect(rangerState()).toEqual({ deleted: true, account: false, grants: 0 })
  })
  it('(control) scheduled, no right elsewhere: the pass runs', () => {
    signInAs('ad', 'a')
    expect(postOut('bane', '2026-07-16', 'delete')).toBe(true)
    on(16)
    expect(passTypes()).toContain('lw.postoutRun')
    expect(rangerState()).toEqual({ deleted: true, account: false, grants: 0 })
  })
  it('the accounts saved as rows: the pass takes his sign-in row and the right together', () => {
    saveAccounts()
    rangerRight('view')
    signInAs('ad', 'a')
    expect(postOut('bane', '2026-07-16', 'delete')).toBe(true)
    on(16)
    expect(passTypes()).toContain('lw.postoutRun')
    expect(rangerState()).toEqual({ deleted: true, account: false, grants: 0 })
    expect(rowSaved('acus')).toBe(false)
  })
  it('a pass of two postings, one of them this one: both run', () => {
    saveAccounts()
    rangerRight('view')
    signInAs('ad', 'a')
    expect(postOut('bane', '2026-07-16', 'delete')).toBe(true)
    expect(postOut('casper', '2026-07-16', 'sans')).toBe(true)
    on(16)
    expect(passTypes()).toContain('lw.postoutRun')
    expect(rangerState()).toEqual({ deleted: true, account: false, grants: 0 })
    expect((PEOPLE as any).casper.san, 'the other posting ran in the same pass').toBe(true)
  })
  it('an Overseas Sqn posting removes no right: his sign-in is suspended, his right stands', () => {
    saveAccounts()
    rangerRight('view')
    signInAs('ad', 'a')
    expect(postOut('bane', '2026-07-16', 'overseas')).toBe(true)
    on(16)
    expect(passTypes()).toContain('lw.postoutRun')
    accountsLoad(); unitsLoad()
    expect({ archived: !!(PEOPLE as any).bane.archived, on: ACCOUNTS_LIST.find(a => a.id === 'acus')?.on, grants: grantsOf('acus').length })
      .toEqual({ archived: true, on: false, grants: 1 })
  })
  it('a pass that also removes a right of a man it does NOT post out is refused', () => {
    saveAccounts()
    rangerRight('view')
    signInAs('ad', 'a')
    const osp = accountOfPid('osp9')!.id
    expect(setGrant(osp, 'u142', 'view', 'osp9').ok, 'Saber gives Osprey View of 142').toBe(true)
    expect(postOut('bane', '2026-07-16', 'delete')).toBe(true)
    on(16)
    let pass: any = null
    const off = onCommit((e: any) => { if (e.type === 'lw.postoutRun') pass = e })
    try { runPoOutcomes() } finally { off() }
    expect(pass, 'the pass committed').not.toBeNull()
    unitsLoad()
    const g = grantsOf(osp)[0]!
    expect(ownershipViolation(pass), '(control) the pass as it ran').toBeNull()
    const forged = { ...pass, changes: [...pass.changes, { collection: 'settings', id: 'grant:' + g.id, op: 'delete', before: g, after: null }] }
    expect(ownershipViolation(forged)).toMatch(/posting pass may change only/)
  })
  it('a refused command puts the accounts list back: the retry never runs on the refused try\'s list (Opus :136)', () => {
    /* a store that never wrote its accounts; Hunter (142) tries to drop Osprey's (149) sign-in — refused, rolled back */
    const n0 = ACCOUNTS_LIST.length
    signInAs('ad2', 'a2')
    const r: any = commitSettingsIntent('account.update', null, () => { dropAccountOfPid('osp9') })
    expect(r.ok, 'refused').toBe(false)
    expect({ n: ACCOUNTS_LIST.length, osprey: !!ACCOUNTS_LIST.find(a => a.pid === 'osp9'), kestrel: !!ACCOUNTS_LIST.find(a => a.pid === 'kes9') })
      .toEqual({ n: n0, osprey: true, kestrel: true })
  })
})

describe('fault B — a command labelled "person.delete" that deletes nobody (O12-1, F12-2, SEC12-1)', () => {
  /* a 149 man with a sign-in Kestrel made, given Plan of 142 by Saber */
  const planned = () => {
    const p1 = free('u149', ['osp9'])[0]!
    signInAs('ad9', 'a9')
    expect(addAccount('spare1@mail', p1, 'main')).toBeNull()
    const id = accountOfPid(p1)!.id
    signInAs('ad', 'a'); expect(setGrant(id, 'u142', 'admin', p1).ok).toBe(true)
    on(18); signInAs('ad9', 'a9')
    return { p1, id }
  }
  const stands = (p1: string, id: string) => { accountsLoad(); unitsLoad(); return { manStays: !(PEOPLE as any)[p1].deleted, signIn: accountOfPid(p1)?.id ?? null, planOf142: grantsOf(id).length } }
  it('the label alone, no person deleted: refused, the right stands', () => {
    const { p1, id } = planned()
    expect(removeGrant(id, 'u142').ok, '(control) the bare removal is refused').toBe(false)
    const g = grantsOf(id)[0]!
    const r: any = commitSettingsIntent('person.delete', null, () => { settingsStore.set('grant:' + g.id, null); settingsStore.set('account:' + id, null) })
    expect(r.ok).toBe(false)
    expect(stands(p1, id)).toEqual({ manStays: true, signIn: id, planOf142: 1 })
  })
  it('the label alone over the account door (dropAccountOfPid): refused', () => {
    const { p1, id } = planned()
    const r: any = commitSettingsIntent('person.delete', null, () => { dropAccountOfPid(p1) })
    expect(r.ok).toBe(false)
    expect(stands(p1, id)).toEqual({ manStays: true, signIn: id, planOf142: 1 })
  })
  it('the label, his sign-in taken away and a new one for him under a new id in the one command: refused', () => {
    const { p1, id } = planned()
    const g = grantsOf(id)[0]!
    const nid = id + 'x'
    const r: any = commitSettingsIntent('person.delete', null, () => {
      settingsStore.set('grant:' + g.id, null); settingsStore.set('account:' + id, null)
      settingsStore.set('account:' + nid, { id: nid, name: 'spare1@mail', role: 'main', pid: p1, on: true })
    })
    expect(r.ok).toBe(false)
    expect(stands(p1, id)).toEqual({ manStays: true, signIn: id, planOf142: 1 })
  })
  const realCommand = (body: () => void): any => commit({
    type: 'person.delete', scope: { module: 'people' }, meta: null,
    apply: (txn: any) => { resyncBeforeEnlist(); txn.enlist(peopleStore); txn.enlist(settingsCmdStore); txn.enlist(schedStore); body(); finishPeopleWrite(); schedApplyEnd() },
  } as any)
  it('ANOTHER man\'s real delete beside this man\'s sign-in and right taken away: refused', () => {
    const { p1, id } = planned()
    const p2 = free('u149', ['osp9', p1])[0]!
    const r = realCommand(() => { applyDelete(p2, '2026-07-18'); dropAccountOfPid(p1) })
    expect(r.ok).toBe(false)
    expect(stands(p1, id)).toEqual({ manStays: true, signIn: id, planOf142: 1 })
    expect(!!(PEOPLE as any)[p2].deleted, 'the whole command refused').toBe(false)
  })
  it('his real delete, with a new sign-in for him under a new id in the one command: refused', () => {
    const { p1, id } = planned()
    const nid = id + 'x'
    const r = realCommand(() => { applyDelete(p1, '2026-07-18'); settingsStore.set('account:' + nid, { id: nid, name: 'spare1b@mail', role: 'main', pid: p1, on: true }) })
    expect(r.ok).toBe(false)
    expect(stands(p1, id)).toEqual({ manStays: true, signIn: id, planOf142: 1 })
  })
  it('(control) the real Delete on Admin → Users: allowed, the right gone with him', () => {
    const { p1, id } = planned()
    expect(deletePerson(p1)).toBeNull()
    accountsLoad(); unitsLoad()
    expect({ deleted: !!(PEOPLE as any)[p1].deleted, signIn: !!ACCOUNTS_LIST.find(a => a.id === id), planOf142: grantsOf(id).length })
      .toEqual({ deleted: true, signIn: false, planOf142: 0 })
  })
})


describe('fault C — fault H on the accounts\' very first write (F12-3)', () => {
  beforeEach(() => { deletesNull = true })
  afterEach(() => { deletesNull = false })
  const stored = () => Object.keys(mem).filter(k => k.includes('account:')).length
  it('(control) Osprey holds nothing elsewhere: Kestrel deletes him on the first write', () => {
    expect(stored(), 'no account row stored yet').toBe(0)
    signInAs('ad9', 'a9')
    expect(deletePerson('osp9')).toBeNull()
    expect(!!(PEOPLE as any).osp9.deleted).toBe(true)
  })
  it('Saber gave Osprey (seeded sign-in) View of 142; Kestrel deletes Osprey on the first write: allowed, the right gone with him', () => {
    signInAs('ad', 'a')
    const id = accountOfPid('osp9')!.id
    expect(setGrant(id, 'u142', 'view', 'osp9').ok).toBe(true)
    expect(stored(), 'no account row stored yet').toBe(0)
    signInAs('ad9', 'a9')
    const r = deletePerson('osp9')
    accountsLoad(); unitsLoad()
    expect({ refused: r, deleted: !!(PEOPLE as any).osp9.deleted, grants: grantsOf(id).length, acct: !!ACCOUNTS_LIST.find(a => a.id === id) })
      .toEqual({ refused: null, deleted: true, grants: 0, acct: false })
  })
  it('(still refused) Hunter, no admin of 149, cannot delete Osprey on the first write', () => {
    signInAs('ad2', 'a2')
    expect(deletePerson('osp9')).not.toBeNull()
    expect(!!(PEOPLE as any).osp9.deleted).toBe(false)
  })
})

import { writeInputsBatch, tryInputsBatch } from '../state/store'
import { Whiteboard } from '../storage/whiteboard'
import { wireRows, writeSeedRows } from '../state/persist'
import { setStoredRowProbe } from '../state/perms'
import { globalUndo, globalRedo } from '../undo/timeline'
import { systemActor } from '../command'

describe('fault D — a record made up in memory, then changed, is judged as new (SEC12-2)', () => {
  let WB: Whiteboard
  const stored = (coll: 'inputs' | 'notices', id: string): any => { const v = WB.get(coll, id); return v ? JSON.parse(v) : null }
  /* the saved copy as on a built site: the whiteboard with its row writer wired, the seed written (persist.ts wirePersist) */
  beforeEach(() => { WB = new Whiteboard(); wireRows(WB); writeSeedRows(WB) })
  afterEach(() => { setStoredRowProbe(null) })
  const IID = 'ipd-fr12'
  const fileFor = (who: string, filer: string) => expect(writeInputsBatch(() => { INPUTS.push({ person: who, date: 'Jul 25', yr: 2026, allday: true, type: 'LL', remarks: 'for him', by: filer, at: Date.now(), iid: IID, ord: 99961 } as any) })).toBe(true)
  const rmk = (words: string) => expect(writeInputsBatch(() => { (INPUTS.find((x: any) => x.iid === IID) as any).remarks = words })).toBe(true)
  it('(member) Ranger saves his own leave "filed by Kestrel" a month ago, made up in memory: refused, nothing saved', () => {
    signInAs('us', 'us')
    INPUTS.push({ person: 'bane', date: 'Jul 27', yr: 2026, allday: true, type: 'LL', remarks: 'made up', by: 'kes9', at: Date.now() - 30 * 86400000, iid: 'ipd-fab12', ord: 99971 } as any)   // outside every command
    const x: any = INPUTS.find((r: any) => r.iid === 'ipd-fab12')
    const ok = writeInputsBatch(() => { x.remarks = 'now saved' })
    expect({ ok, stored: stored('inputs', 'ipd-fab12') }).toEqual({ ok: false, stored: null })
  })
  it('(control) the same request filed honestly as new in another man\'s name: refused', () => {
    signInAs('us', 'us')
    expect(writeInputsBatch(() => { INPUTS.push({ person: 'bane', date: 'Jul 27', yr: 2026, allday: true, type: 'LL', remarks: 'x', by: 'kes9', at: Date.now(), iid: 'ipd-fab12b', ord: 99970 } as any) })).toBe(false)
  })
  it('(admin, a bell line) Hunter puts a line made up in memory on his own man\'s bell, dated 2099: refused', () => {
    signInAs('ad2', 'a2'); fileFor('bane', 'prowler')
    signInAs('ad', 'a'); rmk('Saber changed it')
    const real = NOTICES.find(n => n.to === 'bane' && n.iid === IID)!
    expect(real, 'a real line to Ranger').toBeDefined()
    signInAs('ad2', 'a2')
    const fake: any = { ...JSON.parse(JSON.stringify(real)), id: 'nfab12', at: new Date(2099, 0, 1).getTime(), by: 'prowler' }
    NOTICES.push(fake)                                                                             // outside every command
    const ok = writeInputsBatch(() => { (INPUTS.find((r: any) => r.iid === IID) as any).remarks = 'Hunter again'; fake.name = String(fake.name) + ' ' })
    expect({ ok, stored: stored('notices', 'nfab12') }).toEqual({ ok: false, stored: null })
  })
  /* the honest paths, each checked */
  it('(honest) a member edits his own seeded request on a built site: allowed', () => {
    signInAs('us', 'us')
    const x: any = INPUTS.find((r: any) => r.person === 'bane' && r.type === 'Appointment')
    expect(x && stored('inputs', String(x.iid)), 'the seed is saved').toBeTruthy()
    expect(writeInputsBatch(() => { x.remarks = 'Medical / PHA (moved)' })).toBe(true)
  })
  it('(honest, writeSeedRows) a saved copy wired but not yet seeded (a store not started): a seeded request edited is not judged as new', () => {
    WB = new Whiteboard(); wireRows(WB)                                                            // no seed rows written
    signInAs('us', 'us')
    const x: any = INPUTS.find((r: any) => r.person === 'bane' && r.type === 'Appointment')
    expect(stored('inputs', String(x.iid)), 'no row yet').toBeNull()
    expect(writeInputsBatch(() => { x.remarks = 'Medical / PHA (moved)' })).toBe(true)
  })
  it('(honest, a remote change) a request that came by a remote change, never written locally, then edited: not judged as new', () => {
    const rec = { person: 'bane', date: 'Jul 28', yr: 2026, allday: true, type: 'LL', remarks: 'from the server', by: 'kes9', at: Date.now() - 86400000, iid: 'ipd-remote12', ord: 99962 }
    expect(ownershipViolation({ type: 'inputs.batch', origin: 'remote', actor: systemActor(), changes: [{ collection: 'inputs', id: rec.iid, op: 'put', before: null, after: rec }] } as any)).toBeNull()
    signInAs('ad', 'a')
    const env: any = { type: 'inputs.batch', origin: 'user', actor: { id: 'acad', role: 'admin', personId: 'stiff', session: null }, changes: [{ collection: 'inputs', id: rec.iid, op: 'put', before: rec, after: { ...rec, remarks: 'Saber' } }] }
    expect(String(ownershipViolation(env) ?? 'allowed')).not.toMatch(/never saved/)
  })
  it('(honest, a restore) an Undo puts back images its step recorded, of a record with no saved row: not judged as new', () => {
    const rec = { person: 'bane', date: 'Jul 29', yr: 2026, allday: true, type: 'LL', remarks: 'before', by: 'kes9', at: Date.now(), iid: 'ipd-restore12', ord: 99963 }
    expect(stored('inputs', rec.iid), 'no row').toBeNull()
    const env = (origin: string): any => ({ type: 'undo', origin, actor: { id: 'acus', role: 'member', personId: 'bane', session: null }, changes: [{ collection: 'inputs', id: rec.iid, op: 'put', before: rec, after: { ...rec, remarks: 'after' } }] })
    expect(String(ownershipViolation(env('restore')) ?? 'allowed')).not.toMatch(/never saved/)
    expect(String(ownershipViolation(env('user')) ?? 'allowed'), 'the same change as a person\'s own command').toMatch(/never saved/)
  })
  it('(honest) a tried save, an Undo and a Redo of an edit: allowed', () => {
    signInAs('ad2', 'a2'); fileFor('bane', 'prowler')
    expect(tryInputsBatch(() => { (INPUTS.find((r: any) => r.iid === IID) as any).remarks = 'tried' }), 'the tried save would pass').toBe(true)
    rmk('edited')
    expect(globalUndo().ok, 'Undo').toBe(true)
    expect(globalRedo().ok, 'Redo').toBe(true)
    expect(stored('inputs', IID)?.remarks).toBe('edited')
  })
})
