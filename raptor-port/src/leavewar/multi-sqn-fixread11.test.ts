// @vitest-environment jsdom
/* Fix read 11 (20 Nov 26) — the faults the readers found in fix read 10's code (the builder's brief:
   docs/superpowers/briefs/2026-11-20-multi-sqn-b1-fixread11-fixes-brief.md). Each describe is one fault, red first on the
   code the readers read (eb51fa689). Hunter (142's plain admin, `ad2`) files LL for Ranger (142, `us`) on 15 Jul; Saber
   is the master (`ad`); Kestrel and Osprey are 149's (`ad9`, `us9`); Outlaw (`casper`) a 142 man. Harness as
   leavewar/multi-sqn-fixread10.test.ts. */
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { storeBackend, HOOKS, store as settingsStore } from '../engine/hooks'
import { PEOPLE, indexCallsigns } from '../engine/people'
import { initStore as raptorInitStore, notify as raptorNotify, resetSession, writeInputsBatch } from '../state/store'
import { accountsLoad, signIn, sessionFor, setMaster, updateAccount, ACCOUNTS_LIST, accountOfPid } from '../state/accounts'
import { initStore as lwInitStore, setPeople, setCell, setBidState, getState, openDates, worldUnit } from '../leavewar/state/store'
import { ownershipViolation } from '../state/perms'
import { deriveActor } from '../command/actor'
import { memoryBackend } from '../leavewar/state/storage'
import { projectPeople } from '../leavewar/state/raptorRoster'
import { wireLeaveWarSync, setWarWorldDoor, postOut, undoPostOut } from '../leavewar/sync'
import { unitsLoad, setGrant, removeGrant, addUnit, homeOn, unitRows } from '../state/units'
import { HOME_PFX } from '../state/units-model'
import { INPUTS } from '../engine/inputs'
import { NOTICES, noticesFor, noticeLeftBell, noticeHoliday, noticeWar, noticePosting, noticeAboutHim, type Notice } from '../state/notices'
import { onCommit } from '../command'
import { noticeSeenLoad, markNoticeRead } from '../state/noticeseen'
import { installGlobalUndo } from '../state/undo-wire'
import { _resetTimeline, globalRedo } from '../undo/timeline'
import { globalUndo } from '../undo'
import { addRosterPerson } from '../state/roster-add'
import { commitSettingsIntent } from '../state/people-settings-commit'
import { afterEach } from 'vitest'
import { Whiteboard } from '../storage/whiteboard'
import { wireRows } from '../state/persist'
import { setStoredRowProbe } from '../state/perms'

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

const IID = 'ipd-fr10'
const fileFor = (who: string, filer: string, date = 'Jul 25', endDate?: string) => expect(writeInputsBatch(() => { INPUTS.push({ person: who, date, ...(endDate ? { endDate } : {}), yr: 2026, allday: true, type: 'LL', remarks: 'for him', by: filer, at: Date.now(), iid: IID, ord: 99981 } as any) })).toBe(true)
const rmk = (words: string) => expect(writeInputsBatch(() => { (INPUTS.find((x: any) => x.iid === IID) as any).remarks = words })).toBe(true)
/* a man's home rows, as state/units.ts setHome saves them: [unit, from] in order (the first covers every day before it) */
const homes = (pid: string, key: string, rows: [string, string][]) => {
  rows.forEach(([unit, from], i) => { mem['sqn142_' + HOME_PFX + key + i] = JSON.stringify({ id: key + i, pid, unit, from }) })
  unitsLoad()
}
const on = (d: number, h = 9, m = 0) => { vi.setSystemTime(new Date(2026, 6, d, h, m, 0)); unitsLoad() }
const lineTo = (pid: string): Notice | undefined => NOTICES.find(n => n.to === pid && n.iid === IID)
const shown = (pid: string, id: string) => noticesFor(pid).some(n => n.id === id)
/* Outlaw (`casper`) as a plain 142 admin — as the gate reads an actor (fix read 7's harness) */
const outlaw = { id: 'acoutlaw', role: 'admin', personId: 'casper', session: null }
const asOutlaw = (changes: any[], type = 'inputs.batch'): any => ({ type, origin: 'user', actor: outlaw, changes })
/* …and made one on his account too, where the gate's unit-row check reads the account list */
const outlawReal = () => { signInAs('ad2', 'a2'); expect(updateAccount('acoutlaw', { role: 'admin' })).toBeNull() }
const put = (n: any) => ({ collection: 'notices', id: n.id, op: 'put', before: null, after: n })
/* Hunter files for Ranger; Saber's change on 15 Jul tells him (filer only, marked 142) */
const hunterLine = (): Notice => {
  signInAs('ad2', 'a2'); fileFor('bane', 'prowler')
  signInAs('ad', 'a'); rmk('changed by Saber on the 15th')
  const l = lineTo('prowler')!
  expect(l?.fu, 'Hunter told as its filer').toEqual(['u142'])
  return l
}
const hunterMovesOn16 = () => homes('prowler', 'hc', [['u142', '2026-07-15'], ['u149', '2026-07-16']])
/* the seeded account row: an Undo of its first stored write removes the row (seed mode only), so read it softly */
const hunterAcct = (): any => ACCOUNTS_LIST.find(a => a.id === 'acad2') ?? {}
const kind = (n: Notice | undefined) => (n?.what || [])[0]?.k
const readIt = (pid: string, l: Notice) => { mem['sqn142_noticeseen:' + pid] = JSON.stringify({ upto: 0, ids: [l.id] }); noticeSeenLoad() }


import { placeApproved, holidayAdd } from '../leavewar/state/store'
import { commitInputs, commitSchedValue } from '../state/sched-commit'
import { deletePerson } from '../state/person-delete'
import { addAccount } from '../state/accounts'
import { levelOfAccount } from '../state/units'
import { loadWeek } from '../state/store'
import { commitInput, draftOf } from '../ui/inputedit'
import { warLinesOwed } from '../leavewar/sync'

/* the saved copy: the app's whiteboard with its row writer wired (persist.ts wireRows), as on a built site */
let WB: Whiteboard
const stored = (coll: 'inputs' | 'notices', id: string): any => { const v = WB.get(coll, id); return v ? JSON.parse(v) : null }
const wired = () => { beforeEach(() => { WB = new Whiteboard(); wireRows(WB) }); afterEach(() => { setStoredRowProbe(null) }) }
/* A REAL HOLIDAY (fault C): an input needing an OIL answer in each squadron on the working Friday 17 Jul, then that day made
   a holiday by the Holidays list's own door (leavewar/state/store.ts holidayAdd) — its line tells the schedulers of each
   squadron with an input to answer (leavewar/sync.ts tellHoliday). Every line in this file that stands for "the holiday's
   own line" is made so, never by calling noticeHoliday bare. */
const FRI = '2026-07-17'
const fileOnFri = (pid: string, filer: [string, string], title: string) => {
  signInAs(filer[0], filer[1])
  expect(commitInput(null, draftOf({ person: pid, type: 'Training', title, date: 'Jul 17', yr: 2026, allday: false, s: 540, e: 720, remarks: '' } as any), [pid]), 'filed: ' + title).toBe(true)
}
const realHoliday = (by: [string, string], name = 'National Day') => {
  fileOnFri('osp9', ['ad9', 'a9'], 'Range 149')
  fileOnFri('bane', ['ad2', 'a2'], 'Range 142')
  signInAs(by[0], by[1])
  expect(holidayAdd({ kind: 'ph', name, from: FRI, to: FRI }).ok).toBe(true)
}
const holTo = (name = 'National Day') => NOTICES.filter(n => n.name === name && kind(n) === 'oilhol').map(n => n.to).sort()

describe('fault A — a saved request or bell line rewritten in memory, then changed by a command, is judged as saved (O11-1, SEC11-1, SEC11-2)', () => {
  wired()
  it('(SEC11-1) Outlaw (142) rewrites Osprey\'s (149) stored request IN PLACE in memory, then edits "his" input: refused, the stored request stands', () => {
    signInAs('ad9', 'a9')
    expect(writeInputsBatch(() => { INPUTS.push({ person: 'osp9', date: 'Jul 25', yr: 2026, allday: true, type: 'LL', remarks: 'Osprey leave', by: 'kes9', at: Date.now(), iid: 'ipd-sec11', ord: 99983 } as any) })).toBe(true)
    expect(stored('inputs', 'ipd-sec11')?.person).toBe('osp9')
    outlawReal(); signInAs('outlaw', 'x')
    const x: any = INPUTS.find((r: any) => r.iid === 'ipd-sec11')
    Object.assign(x, { person: 'bane', type: 'Training', remarks: 'x', by: 'casper' })      // a bare write, outside every command
    const ok = writeInputsBatch(() => { x.remarks = 'y' })
    expect({ ok, storedPerson: stored('inputs', 'ipd-sec11')?.person }).toEqual({ ok: false, storedPerson: 'osp9' })
  })
  it('(SEC11-2) Outlaw re-addresses Osprey\'s stored line to himself in memory, then clears it from "his" bell: refused, the stored line stands', () => {
    signInAs('ad9', 'a9')
    expect(writeInputsBatch(() => { INPUTS.push({ person: 'osp9', date: 'Jul 25', yr: 2026, allday: true, type: 'LL', remarks: 'Osprey leave', by: 'kes9', at: Date.now(), iid: 'ipd-sec11', ord: 99983 } as any) })).toBe(true)
    signInAs('ad', 'a')
    expect(writeInputsBatch(() => { (INPUTS.find((r: any) => r.iid === 'ipd-sec11') as any).remarks = 'Saber changed it' })).toBe(true)
    const real = NOTICES.find(n => n.to === 'osp9' && n.iid === 'ipd-sec11')!
    expect(real, 'Osprey told').toBeDefined()
    expect(stored('notices', real.id)?.to).toBe('osp9')
    outlawReal(); signInAs('outlaw', 'x')
    ;(real as any).to = 'casper'                                                              // a bare write
    const ok = writeInputsBatch(() => { NOTICES.splice(NOTICES.findIndex(n => n.id === real.id), 1) })
    expect({ ok, stored: stored('notices', real.id)?.to ?? 'gone' }).toEqual({ ok: false, stored: 'osp9' })
  })
  it('(Opus O11-1) Kestrel files LL for Osprey (149); Outlaw (142) rewrites it in memory to name his own man, then edits it: the stored 149 request stands', () => {
    signInAs('ad9', 'a9')
    expect(writeInputsBatch(() => { INPUTS.push({ person: 'osp9', date: 'Jul 25', yr: 2026, allday: true, type: 'LL', remarks: 'Osprey leave', by: 'kes9', at: Date.now(), iid: 'ipd-o11c', ord: 99983 } as any) })).toBe(true)
    outlawReal(); signInAs('outlaw', 'x')
    const r: any = INPUTS.find((x: any) => x.iid === 'ipd-o11c'); r.person = 'bane'; r.by = 'casper'; r.type = 'Training'; r.remarks = 'x'
    const ok = writeInputsBatch(() => { (INPUTS.find((x: any) => x.iid === 'ipd-o11c') as any).remarks = 'Outlaw words' })
    expect({ ok, stored: stored('inputs', 'ipd-o11c')?.person, by: stored('inputs', 'ipd-o11c')?.by }).toEqual({ ok: false, stored: 'osp9', by: 'kes9' })
  })
  it('(Opus O11-1) …and deleting the rewritten record: the stored 149 request is not deleted', () => {
    signInAs('ad9', 'a9')
    expect(writeInputsBatch(() => { INPUTS.push({ person: 'osp9', date: 'Jul 25', yr: 2026, allday: true, type: 'LL', remarks: 'Osprey leave', by: 'kes9', at: Date.now(), iid: 'ipd-o11d', ord: 99984 } as any) })).toBe(true)
    outlawReal(); signInAs('outlaw', 'x')
    const r: any = INPUTS.find((x: any) => x.iid === 'ipd-o11d'); r.person = 'bane'; r.by = 'casper'
    const ok = writeInputsBatch(() => { const ix = INPUTS.findIndex((x: any) => x.iid === 'ipd-o11d'); INPUTS.splice(ix, 1) })
    expect({ ok, stored: stored('inputs', 'ipd-o11d')?.person }).toEqual({ ok: false, stored: 'osp9' })
  })
  it('(Opus O11-1) …and a holiday line on 149\'s admin\'s bell, re-addressed in memory to Outlaw, then deleted by a command: the stored line stands', () => {
    realHoliday(['ad', 'a'])
    const real = NOTICES.find(x => x.to === 'kes9' && x.name === 'National Day')!
    expect(real, 'Kestrel told of the holiday').toBeDefined()
    outlawReal(); signInAs('outlaw', 'x')
    const m: any = NOTICES.find(x => x.id === real.id); m.to = 'casper'; m.by = 'casper'
    const ok = writeInputsBatch(() => { const ix = NOTICES.findIndex(x => x.id === real.id); NOTICES.splice(ix, 1) })
    expect({ ok, stored: stored('notices', real.id)?.to }).toEqual({ ok: false, stored: 'kes9' })
  })
  it('(control) after a week load lands a request (its landing mark in memory, never saved), its own member and his admin still change and delete it', () => {
    signInAs('us', 'us')
    expect(writeInputsBatch(() => { INPUTS.push({ person: 'bane', date: 'Jul 16', yr: 2026, allday: false, s: 540, e: 720, type: 'Training', title: 'Sim prep', remarks: 'mine', by: 'bane', at: Date.now(), iid: 'ipd-f11w', ord: 99970 } as any) })).toBe(true)
    loadWeek('20/07/2026'); loadWeek('13/07/2026')
    const rec = (): any => INPUTS.find((x: any) => x.iid === 'ipd-f11w')
    expect(rec().acc, 'landed by the load, in memory').toBe('g')
    expect(stored('inputs', 'ipd-f11w')?.acc, 'never saved').toBeUndefined()
    expect(writeInputsBatch(() => { rec().remarks = 'still mine' }), 'his own change').toBe(true)
    expect(stored('inputs', 'ipd-f11w')?.remarks).toBe('still mine')
    signInAs('ad2', 'a2')
    expect(writeInputsBatch(() => { rec().remarks = 'Hunter\'s words' }), 'his admin\'s change').toBe(true)
    signInAs('us', 'us')
    expect(writeInputsBatch(() => { INPUTS.splice(INPUTS.findIndex((x: any) => x.iid === 'ipd-f11w'), 1) }), 'his own delete').toBe(true)
    expect(WB.has('inputs', 'ipd-f11w')).toBe(false)
  })
})

describe('fault A, controls — Fable\'s honest paths with the saved copy wired, as on a built site (F11-C2)', () => {
  wired()
  const step = (what: string, r: any) => expect(r && (r.ok ?? r), what + ' ' + JSON.stringify(r)).toBeTruthy()
  it('an input filed, changed, deleted; the delete undone and redone', () => {
    signInAs('ad2', 'a2'); fileFor('bane', 'prowler'); rmk('second words')
    expect(writeInputsBatch(() => { const ix = INPUTS.findIndex((x: any) => x.iid === IID); INPUTS.splice(ix, 1) })).toBe(true)
    expect(WB.has('inputs', IID)).toBe(false)
    step('undo delete', globalUndo()); expect(WB.has('inputs', IID)).toBe(true)
    step('redo delete', globalRedo()); expect(WB.has('inputs', IID)).toBe(false)
    step('undo delete again', globalUndo())
    step('undo change', globalUndo()); step('undo file', globalUndo()); step('redo file', globalRedo()); step('redo change', globalRedo())
  })
  it('a decision, read, its Undo, Redo, Undo, Redo', () => {
    signInAs('ad2', 'a2')
    expect(setCell('bane', '2026-07-25', 'LL')).toBe(true)
    setBidState('bane', '2026-07-25', 'refused')
    const l = NOTICES.find(n => n.to === 'bane' && kind(n) === 'lw')!
    expect(l).toBeDefined()
    readIt('bane', l)
    step('undo', globalUndo()); step('redo', globalRedo()); step('undo2', globalUndo()); step('redo2', globalRedo())
  })
  it('a bid approved (the war writes the leave), its Undo and Redo twice', () => {
    signInAs('ad2', 'a2')
    expect(setCell('bane', '2026-07-27', 'LL')).toBe(true)
    setBidState('bane', '2026-07-27', 'approved')
    const l = NOTICES.find(n => n.to === 'bane' && kind(n) === 'lw')
    expect(l, 'told approved').toBeDefined()
    step('undo', globalUndo()); step('redo', globalRedo()); step('undo2', globalUndo()); step('redo2', globalRedo())
  })
  it('bidding opened, read, Undo, Redo, Undo, Redo', () => {
    signInAs('ad2', 'a2')
    const day = getState().period.end
    expect(openDates(day, day)).toBe('set')
    const l = NOTICES.find(n => n.to === 'bane' && kind(n) === 'lwopen')!
    readIt('bane', l)
    step('undo', globalUndo()); step('redo', globalRedo()); step('undo2', globalUndo()); step('redo2', globalRedo())
  })
  it('a posting and its Undo post out, then posted again', () => {
    signInAs('ad', 'a')
    expect(postOut('bane', '2026-07-15', 'sans')).toBe(true)
    const l = NOTICES.find(n => n.to === 'prowler' && kind(n) === 'po')!
    signInAs('ad2', 'a2'); expect(markNoticeRead(l.id)).toBe(true)
    signInAs('ad', 'a')
    expect(undoPostOut('bane')).toBe(true)
    expect(postOut('bane', '2026-07-15', 'sans')).toBe(true)
    expect(undoPostOut('bane')).toBe(true)
  })
  it('a holiday made by the Holidays list (its lines), Undo, Redo, Undo, Redo', () => {
    realHoliday(['ad', 'a'])
    expect(holTo()).toContain('kes9')
    step('undo', globalUndo()); expect(holTo()).toEqual([])
    step('redo', globalRedo()); expect(holTo()).toContain('kes9')
    step('undo2', globalUndo()); step('redo2', globalRedo())
  })
})
