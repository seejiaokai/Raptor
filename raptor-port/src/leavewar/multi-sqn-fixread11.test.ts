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
import { INPUTS, onlyNamed } from '../engine/inputs'
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

describe('fault B — no command is passed over for its label (F11-3, SEC11-3)', () => {
  wired()
  it('(Fable F11-3) SEC10-2 again, the command merely typed sched.load: the stored line is not overwritten', () => {
    hunterLine()
    const real = NOTICES.find(n => n.to === 'bane' && n.iid === IID && n.by === 'stiff')!
    expect(real?.by, 'Saber told Ranger').toBe('stiff')
    outlawReal(); signInAs('outlaw', 'x')
    const ix = NOTICES.findIndex(x => x.id === real.id); NOTICES.splice(ix, 1)
    let threw = ''
    try {
      commitInputs('sched.load', () => {
        (INPUTS.find((x: any) => x.iid === IID) as any).remarks = 'Outlaw words'
        NOTICES.push({ ...real, by: 'casper', at: Date.now(), what: [{ k: 'rmk' }] } as any)
      })
    } catch (e: any) { threw = String(e?.message ?? e) }
    expect({ threw, stored: stored('notices', real.id)?.by }).toEqual({ threw: expect.any(String), stored: 'stiff' })
  })
  it('(SEC11-3) a command labelled "sched.load" is asked as any other: the same "new" line under a saved id is refused', () => {
    signInAs('ad2', 'a2')
    expect(writeInputsBatch(() => { INPUTS.push({ person: 'bane', date: 'Jul 25', yr: 2026, allday: true, type: 'LL', remarks: 'for him', by: 'prowler', at: Date.now(), iid: 'ipd-sec11b', ord: 99984 } as any) })).toBe(true)
    signInAs('ad', 'a')
    expect(writeInputsBatch(() => { (INPUTS.find((r: any) => r.iid === 'ipd-sec11b') as any).remarks = 'Saber changed it' })).toBe(true)
    const real = NOTICES.find(n => n.to === 'bane' && n.iid === 'ipd-sec11b' && n.by === 'stiff')!
    expect(real, 'Saber told Ranger').toBeDefined()
    outlawReal(); signInAs('outlaw', 'x')
    const b = JSON.parse(JSON.stringify(INPUTS.find((r: any) => r.iid === 'ipd-sec11b')))
    const forged = { ...real, by: 'casper', at: Date.now(), what: [{ k: 'rmk' }] }
    const env = (type: string): any => ({ type, origin: 'user', actor: deriveActor(), changes: [
      { collection: 'inputs', id: 'ipd-sec11b', op: 'put', before: b, after: { ...b, remarks: 'Outlaw words' } },
      { collection: 'notices', id: real.id, op: 'put', before: null, after: forged }] })
    const asInput = ownershipViolation(env('inputs.batch')) ?? 'allowed'
    const asLoad = ownershipViolation(env('sched.load')) ?? 'allowed'
    NOTICES.splice(NOTICES.findIndex(n => n.id === real.id), 1)                           // a bare drop
    expect(writeInputsBatch(() => {})).toBe(true)                                          // any command takes the drop up
    let ok: any
    try { ok = commitSchedValue('sched.load', () => { (INPUTS.find((r: any) => r.iid === 'ipd-sec11b') as any).remarks = 'Outlaw words'; NOTICES.push(forged as any); return true }) } catch (e) { ok = String(e) }
    expect({ asInput, asLoad, ok, storedBy: stored('notices', real.id)?.by }).toEqual({ asInput: expect.stringMatching(/already written/), asLoad: expect.stringMatching(/./), ok: expect.anything(), storedBy: 'stiff' })
  })
  it('(the gate) a person\'s command labelled sched.load is refused whatever it holds — nothing in the app raises one', () => {
    signInAs('ad2', 'a2')
    expect(ownershipViolation({ type: 'sched.load', origin: 'user', actor: deriveActor(), changes: [] } as any) ?? 'allowed').toMatch(/sched\.load/)
  })
  it('(Fable, control) the input case under the same label: the stored request is still Osprey\'s', () => {
    signInAs('ad9', 'a9')
    expect(writeInputsBatch(() => { INPUTS.push({ person: 'osp9', date: 'Jul 25', yr: 2026, allday: true, type: 'LL', remarks: 'Osprey leave', by: 'kes9', at: Date.now(), iid: 'ipd-sec10', ord: 99982 } as any) })).toBe(true)
    outlawReal(); signInAs('outlaw', 'x')
    const ix = INPUTS.findIndex((x: any) => x.iid === 'ipd-sec10'); INPUTS.splice(ix, 1)
    try { commitInputs('sched.load', () => { INPUTS.push({ person: 'bane', date: 'Jul 26', yr: 2026, allday: true, type: 'Training', remarks: 'x', by: 'casper', at: Date.now(), iid: 'ipd-sec10', ord: 99982 } as any) }) } catch { /* refused */ }
    writeInputsBatch(() => { const r: any = INPUTS.find((x: any) => x.iid === 'ipd-sec10'); if (r) r.remarks = 'y' })
    expect(stored('inputs', 'ipd-sec10')?.person).toBe('osp9')
  })
})

describe('fault C — a holiday line only as the command\'s own holiday owes it (F11-1, SEC11-4)', () => {
  it('(SEC11-4) Outlaw (142) calls noticeHoliday inside his own input command for 149\'s admin and a 149 member: refused', () => {
    outlawReal(); signInAs('outlaw', 'x')
    const n0 = NOTICES.length
    const ok = writeInputsBatch(() => { noticeHoliday(['kes9', 'osp9'], 'casper', '149: all leave cancelled, report 0600 Sat', '2026-08-09', '2026-08-09') })
    const made = NOTICES.slice(n0).map(n => n.to).sort()
    expect({ ok, made }).toEqual({ ok: false, made: [] })
  })
  it('(Fable F11-1) a holiday line with no holiday, signed by the caller himself: not on Kestrel\'s bell nor on Osprey\'s', () => {
    outlawReal(); signInAs('outlaw', 'x')
    const words = '149: all leave cancelled, report 0600 Sat'
    const ok = writeInputsBatch(() => { noticeHoliday(['kes9', 'osp9'], 'casper', words, '2026-07-25', '2026-07-25') })
    const got = NOTICES.filter(x => x.name === words).map(x => x.to).sort()
    expect({ saved: ok && got.length > 0, onBells: ok ? got : [], shownToKestrel: ok && noticesFor('kes9').some(x => x.name === words), shownToOsprey: ok && noticesFor('osp9').some(x => x.name === words) })
      .toEqual({ saved: false, onBells: [], shownToKestrel: false, shownToOsprey: false })
  })
  it('(a holiday already made) Saber makes National Day on 17 Jul; Outlaw then writes its line again for Kestrel in an input command: refused — only the command that made the holiday owes it', () => {
    realHoliday(['ad', 'a'])
    outlawReal(); signInAs('outlaw', 'x')
    const ok = writeInputsBatch(() => { noticeHoliday(['kes9'], 'casper', 'National Day', FRI, FRI) })
    expect({ ok, byOutlaw: NOTICES.filter(n => n.name === 'National Day' && n.by === 'casper').length }).toEqual({ ok: false, byOutlaw: 0 })
  })
  it('(control) Saber makes the holiday: each squadron\'s schedulers with an input to answer are told, and its Undo and Redo go through', () => {
    realHoliday(['ad', 'a'])
    const told = holTo()
    expect(told).toEqual(expect.arrayContaining(['kes9', 'prowler']))
    expect(globalUndo().ok).toBe(true)
    expect(holTo()).toEqual([])
    const r = globalRedo(); expect(r.ok, JSON.stringify(r)).toBe(true)
    expect(holTo()).toEqual(told)
  })
  it('(control) Outlaw, a plain 142 admin, makes it: his lines reach both squadrons\' schedulers, and his Undo and Redo go through', () => {
    outlawReal()
    realHoliday(['outlaw', 'x'])
    const mine = () => NOTICES.filter(x => x.name === 'National Day' && x.by === 'casper').map(x => x.to).sort()
    const told = mine()
    expect(told).toEqual(expect.arrayContaining(['kes9', 'prowler']))
    const u = globalUndo(); expect(u.ok, 'Undo: ' + JSON.stringify(u)).toBe(true)
    expect(mine()).toEqual([])
    const r = globalRedo(); expect(r.ok, 'Redo: ' + JSON.stringify(r)).toBe(true)
    expect(mine()).toEqual(told)
  })
})

describe('fault D — a war line only in its writer\'s own hand, owed only where the leave itself changed (F11-2)', () => {
  it('(Fable F11-2) Outlaw changes only the remarks of Ranger\'s war-approved LL and calls noticeWar signed as Saber, saying refused: not saved, not on his bell after his move', () => {
    signInAs('ad2', 'a2')
    placeApproved([{ personId: 'bane', date: '2026-07-27' }], 'LL')
    expect(NOTICES.some(x => x.to === 'bane' && kind(x) === 'lw'), '(control) a plain admin placing approved leave tells him').toBe(true)
    /* (his own: the seeded world carries other men's war-approved leave — Fable's proof took the first of them) */
    const leave: any = INPUTS.find((x: any) => x.lw && onlyNamed(x) === 'bane')
    expect(leave, 'the war wrote his approved leave as an input').toBeDefined()
    outlawReal(); signInAs('outlaw', 'x')
    const ok = writeInputsBatch(() => {
      leave.remarks = 'touched'
      noticeWar(['bane'], 'stiff', { k: 'lw', c: 'LL', d: 'refused', a: '2026-07-27', b: '2026-07-27' } as any)
    })
    const n = NOTICES.find(x => x.to === 'bane' && kind(x) === 'lw' && (x.what[0] as any).d === 'refused')
    homes('bane', 'hb', [['u142', '2026-07-15'], ['u149', '2026-07-16']]); on(17)
    expect({ saved: ok && !!n, signedAs: n?.by, onHisBellAfterHisMove: !!n && shown('bane', n.id) }).toEqual({ saved: false, signedAs: undefined, onHisBellAfterHisMove: false })
  })
  it('(the owed lines) a change of a war-approved leave\'s remarks alone owes no line; its coming, going, person, dates, type or mark does', () => {
    const b = { person: 'bane', date: 'Jul 27', yr: 2026, allday: true, type: 'LL', lw: 'y2026', iid: 'ipd-x', remarks: '' }
    const ch = (before: any, after: any, op = 'put') => [{ collection: 'inputs', id: 'ipd-x', op, before, after }]
    const lw = (cs: any[]) => warLinesOwed(cs).filter(o => o.k === 'lw').length
    expect({
      remarks: lw(ch(b, { ...b, remarks: 'touched' })), came: lw(ch(null, b)), went: lw(ch(b, null, 'delete')),
      person: lw(ch(b, { ...b, person: 'nick' })), dates: lw(ch(b, { ...b, date: 'Jul 28' })), type: lw(ch(b, { ...b, type: 'OL' })),
      mark: lw(ch({ ...b, lw: undefined }, b)),
    }).toEqual({ remarks: 0, came: 1, went: 1, person: 2, dates: 1, type: 1, mark: 1 })
  })
  it('(held) the same, his own remarks line signed as himself: refused', () => {
    signInAs('ad2', 'a2')
    placeApproved([{ personId: 'bane', date: '2026-07-27' }], 'LL')
    const leave: any = INPUTS.find((x: any) => x.lw && onlyNamed(x) === 'bane')
    outlawReal(); signInAs('outlaw', 'x')
    const ok = writeInputsBatch(() => {
      leave.remarks = 'touched'
      noticeWar(['bane'], 'casper', { k: 'lw', c: 'LL', d: 'refused', a: '2026-07-27', b: '2026-07-27' } as any)
    })
    expect({ ok, saved: NOTICES.some(x => x.to === 'bane' && kind(x) === 'lw' && (x.what[0] as any).d === 'refused') }).toEqual({ ok: false, saved: false })
  })
  it('(held) Outlaw moves Ranger\'s war-approved leave a day in his own input command and tells him in Saber\'s name: refused', () => {
    signInAs('ad2', 'a2')
    placeApproved([{ personId: 'bane', date: '2026-07-27' }], 'LL')
    const leave: any = INPUTS.find((x: any) => x.lw && onlyNamed(x) === 'bane')
    outlawReal(); signInAs('outlaw', 'x')
    const ok = writeInputsBatch(() => {
      leave.date = 'Jul 28'
      noticeWar(['bane'], 'stiff', { k: 'lw', c: 'LL', d: 'refused', a: '2026-07-28', b: '2026-07-28' } as any)
    })
    expect({ ok, saved: NOTICES.some(x => x.to === 'bane' && kind(x) === 'lw' && x.by === 'stiff' && (x.what[0] as any).d === 'refused') }).toEqual({ ok: false, saved: false })
  })
  it('(Fable F11-A1, held) a made-up refusal beside a new input marked lw for Hunter: not saved, not on his bell after his move', () => {
    hunterMovesOn16(); outlawReal(); on(15, 10)
    signInAs('outlaw', 'x')
    const ok = writeInputsBatch(() => {
      INPUTS.push({ person: 'prowler', date: 'Jul 25', yr: 2026, allday: true, type: 'LL', remarks: '', by: 'casper', at: Date.now(), iid: 'ipd-f11a', ord: 99977, lw: true } as any)
      noticeWar(['prowler'], 'casper', { k: 'lw', c: 'LL', d: 'refused', a: '2026-07-25', b: '2026-07-25' } as any)
    })
    const n = NOTICES.find(x => x.to === 'prowler' && kind(x) === 'lw')
    on(17)
    expect({ saved: ok && !!n, shownOn17: !!n && shown('prowler', n.id) }).toEqual({ saved: false, shownOn17: false })
  })
  it('(control) Hunter places approved leave for Ranger: Ranger told, and its Undo and Redo go through', () => {
    signInAs('ad2', 'a2')
    placeApproved([{ personId: 'bane', date: '2026-07-27' }], 'LL')
    expect(NOTICES.filter(x => x.to === 'bane' && kind(x) === 'lw').length).toBe(1)
    const u = globalUndo(); expect(u.ok, JSON.stringify(u)).toBe(true)
    const r = globalRedo(); expect(r.ok, JSON.stringify(r)).toBe(true)
    expect(NOTICES.some(x => x.to === 'bane' && kind(x) === 'lw')).toBe(true)
  })
})
