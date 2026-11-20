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
import { accountsLoad, signIn, sessionFor, setMaster, updateAccount, ACCOUNTS_LIST, accountOfPid, levelIn } from '../state/accounts'
import { initStore as lwInitStore, setPeople, setCell, setBidState, getState, openDates, worldUnit } from '../leavewar/state/store'
import { ownershipViolation } from '../state/perms'
import { deriveActor } from '../command/actor'
import { memoryBackend } from '../leavewar/state/storage'
import { projectPeople } from '../leavewar/state/raptorRoster'
import { wireLeaveWarSync, setWarWorldDoor, postOut, undoPostOut } from '../leavewar/sync'
import { unitsLoad, setGrant, removeGrant, addUnit, homeOn, unitRows, grantOfOn } from '../state/units'
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
    const b = structuredClone(INPUTS.find((r: any) => r.iid === 'ipd-sec11b'))
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

describe('fault E — a right goes with its account, and a new account row under its id is a re-link (SEC11-5)', () => {
  const spares = () => Object.keys(PEOPLE).filter(p => homeOn(p) === 'u149' && p !== 'osp9' && !accountOfPid(p) && !(PEOPLE as any)[p].deleted && !(PEOPLE as any)[p].archived && !(PEOPLE as any)[p].special)
  /* a spare 149 man given a sign-in by Kestrel on 15 Jul, and Plan of 142 on it by Saber */
  const planned = () => {
    const [p1, p2] = spares()
    expect(p2, 'two 149 men with no sign-in').toBeDefined()
    signInAs('ad9', 'a9')
    /* (an admin's sign-in: Plan is an admin's — the Plan audit's PA2; §9.2 of the reshape plan, setup only) */
    expect(addAccount('spare1@mail', p1!, 'admin')).toBeNull()
    const id = accountOfPid(p1!)!.id
    signInAs('ad', 'a'); expect(setGrant(id, 'u142', 'admin', p1!).ok).toBe(true)
    return { p1: p1!, p2: p2!, id }
  }
  const plan = (id: string) => unitRows().grants.find(g => g.account === id && g.unit === 'u142')
  it('(SEC11-5) Kestrel (149) deletes his man whose account holds Plan of 142, then writes a NEW account under that id for another 149 man: Plan of 142 never reaches the new man', () => {
    const { p1, p2, id } = planned()
    on(18)
    signInAs('ad9', 'a9')
    expect(updateAccount(id, { pid: p2 }), 'the door refuses the re-link (fix read 10, fault D)').toMatch(/Only a master admin/)
    deletePerson(p1)
    accountsLoad(); unitsLoad()
    const row = { id, name: 'spare2@mail', role: 'main', pid: p2, on: true }
    commitSettingsIntent('account.add', null, () => { settingsStore.set('account:' + id, row) })
    accountsLoad(); unitsLoad()
    const acct = ACCOUNTS_LIST.find(a => a.id === id)
    expect({ newManHolds142: !!acct && acct.pid === p2 && levelOfAccount(acct as any, 'u142') === 'admin' }).toEqual({ newManHolds142: false })
  })
  /* (the delete's refusal once pinned here — "Kestrel's delete of that man is refused while his sign-in holds Plan of
     142" — is turned round by fault H below: the host's decision, his D2203 read for a delete) */
  /* (a delete is no step of the Undo button — his D350 — so "its Undo puts them back" has nothing to put back: the right goes
     in the delete's own command, all or nothing, as his sign-in does) */
  it('(Admin → Users\' delete) Saber deletes that man: his sign-in and Plan of 142 go in the one command — no right left naming a sign-in that is gone', () => {
    const { p1, id } = planned()
    on(18); signInAs('ad', 'a')
    const seen: string[] = []
    const off = onCommit((e: any) => { if (e.type === 'person.delete') for (const c of e.changes) if (c.collection === 'settings' && (String(c.id) === 'account:' + id || String(c.id).startsWith('grant:'))) seen.push(String(c.id).split(':')[0]!) })
    try { expect(deletePerson(p1)).toBeNull() } finally { off() }
    accountsLoad(); unitsLoad()
    expect({ acct: !!ACCOUNTS_LIST.find(a => a.id === id), plan: !!plan(id), inOneCommand: [...new Set(seen)].sort() }).toEqual({ acct: false, plan: false, inOneCommand: ['account', 'grant'] })
  })
  it('(control) Kestrel deletes his own man who holds nothing elsewhere', () => {
    const [p1] = spares()
    signInAs('ad9', 'a9')
    /* (an admin's sign-in: Plan is an admin's — the Plan audit's PA2; §9.2 of the reshape plan, setup only) */
    expect(addAccount('spare1@mail', p1!, 'admin')).toBeNull()
    expect(deletePerson(p1!)).toBeNull()
    expect(!!(PEOPLE as any)[p1!].deleted).toBe(true)
  })
  it('(the gate) a new account row whose id a standing right names is a re-link: Kestrel refused; Saber only dated today', () => {
    const { p2, id } = planned()
    on(18)
    const row = { id, name: 'spare2@mail', role: 'main', pid: p2, on: true }
    const e = (after: any): any => ({ type: 'account.add', origin: 'user', actor: deriveActor(), changes: [{ collection: 'settings', id: 'account:' + id, op: 'put', before: null, after }] })
    signInAs('ad9', 'a9')
    expect(ownershipViolation(e({ ...row, pidFrom: '2026-07-18' })) ?? 'allowed', 'Kestrel, even dated today').toMatch(/re-linked by one who is not a master/)
    signInAs('ad', 'a')
    expect(ownershipViolation(e(row)) ?? 'allowed', 'Saber, undated').toMatch(/link to its person not dated today/)
    /* (§4.5 of the reshape plan, rewrite 14 — guardrail 1: a sign-in linked to another person carries no right; Saber's
       half reads "dated today, refused while the right stands; allowed with that right removed in the same command") */
    expect(ownershipViolation(e({ ...row, pidFrom: '2026-07-18' })) ?? 'allowed', 'Saber, dated today, the right standing').toMatch(/linked to another person while a right still names it/)
    unitsLoad()
    const g = unitRows().grants.find(x => x.account === id)!
    const withDrop: any = { ...e({ ...row, pidFrom: '2026-07-18' }) }
    withDrop.changes = [...withDrop.changes, { collection: 'settings', id: 'grant:' + g.id, op: 'delete', before: g, after: null }]
    expect(ownershipViolation(withDrop) ?? 'allowed', 'Saber, dated today, the right removed in the same command').toBe('allowed')
  })
  it('(the gate) an account row taken away while a right still names it: refused, even for a master', () => {
    const { id } = planned()
    signInAs('ad', 'a')
    const b = { ...(settingsStore.get('account:' + id, null) as any) }
    const e: any = { type: 'account.update', origin: 'user', actor: deriveActor(), changes: [{ collection: 'settings', id: 'account:' + id, op: 'put', before: b, after: null }] }
    expect(ownershipViolation(e) ?? 'allowed').toMatch(/right still names/)
  })
  it('(control — Add account) Kestrel gives a 149 man a sign-in: saved, its link dated as built', () => {
    const [p1] = spares()
    signInAs('ad9', 'a9')
    /* (an admin's sign-in: Plan is an admin's — the Plan audit's PA2; §9.2 of the reshape plan, setup only) */
    expect(addAccount('spare1@mail', p1!, 'admin')).toBeNull()
    expect(accountOfPid(p1!)?.pid).toBe(p1)
  })
})

describe('fault H — a person delete is never refused for a right he holds in another squadron (the host, D2203 read for a delete)', () => {
  const spares = () => Object.keys(PEOPLE).filter(p => homeOn(p) === 'u149' && p !== 'osp9' && !accountOfPid(p) && !(PEOPLE as any)[p].deleted && !(PEOPLE as any)[p].archived && !(PEOPLE as any)[p].special)
  const planned = () => {
    const [p1, p2] = spares()
    expect(p2, 'two 149 men with no sign-in').toBeDefined()
    signInAs('ad9', 'a9')
    /* (an admin's sign-in: Plan is an admin's — the Plan audit's PA2; §9.2 of the reshape plan, setup only) */
    expect(addAccount('spare1@mail', p1!, 'admin')).toBeNull()
    const id = accountOfPid(p1!)!.id
    signInAs('ad', 'a'); expect(setGrant(id, 'u142', 'admin', p1!).ok).toBe(true)
    return { p1: p1!, p2: p2!, id }
  }
  const grantsOf = (id: string) => unitRows().grants.filter(g => g.account === id)
  it('(the host) Kestrel (149 admin) deletes his man whose sign-in holds Plan of 142: allowed, and no right names the sign-in after it — 142\'s grant rows gone in the delete\'s own command', () => {
    const { p1, id } = planned()
    on(18); signInAs('ad9', 'a9')
    const seen: string[] = []
    const off = onCommit((e: any) => { if (e.type === 'person.delete') for (const c of e.changes) if (c.collection === 'settings' && String(c.id).startsWith('grant:') && c.after == null) seen.push(String(c.id)) })
    let r: unknown
    try { r = deletePerson(p1) } finally { off() }
    accountsLoad(); unitsLoad()
    expect({ refused: r ?? null, deleted: !!(PEOPLE as any)[p1].deleted, grants: grantsOf(id).length, grantRowsRemovedInTheDelete: seen.length })
      .toEqual({ refused: null, deleted: true, grants: 0, grantRowsRemovedInTheDelete: 1 })
  })
  it('(SEC11-5 continued) after it Kestrel writes a NEW account under that id for another 149 man: harmless — saved as a plain new sign-in, and he holds no 142 right', () => {
    const { p1, p2, id } = planned()
    on(18); signInAs('ad9', 'a9')
    expect(deletePerson(p1)).toBeNull()
    accountsLoad(); unitsLoad()
    const row = { id, name: 'spare2@mail', role: 'main', pid: p2, on: true, pidFrom: '2026-07-18' }
    commitSettingsIntent('account.add', null, () => { settingsStore.set('account:' + id, row) })
    accountsLoad(); unitsLoad()
    const acct = ACCOUNTS_LIST.find(a => a.id === id)
    expect({ saved: acct?.pid === p2, holds142: !!acct && levelOfAccount(acct as any, 'u142') === 'admin', grants: grantsOf(id).length })
      .toEqual({ saved: true, holds142: false, grants: 0 })
  })
  it('(control) Kestrel removing that 142 grant by itself — no delete — stays refused', () => {
    const { id } = planned()
    on(18); signInAs('ad9', 'a9')
    expect(removeGrant(id, 'u142').ok).toBe(false)
    unitsLoad()
    expect(grantsOf(id).map(x => x.level)).toEqual(['admin'])
  })
  it('(the gate) a grant removed beside its account row, in a command that is not a person delete: refused for one who is no admin of 142', () => {
    const { id } = planned()
    on(18); signInAs('ad9', 'a9')
    const g = grantsOf(id)[0]!
    const a = { ...(settingsStore.get('account:' + id, null) as any) }
    const gb = { ...(settingsStore.get('grant:' + g.id, null) as any) }
    const e = (type: string): any => ({ type, origin: 'user', actor: deriveActor(), changes: [
      { collection: 'settings', id: 'grant:' + g.id, op: 'put', before: gb, after: null },
      { collection: 'settings', id: 'account:' + id, op: 'put', before: a, after: null }] })
    /* (refused; since the Plan audit's PA1 — D2199 — a Plan taken by one who is not a master admin is refused first, in
       its own words: §9.3 of the reshape plan, rewritten to the ruling's outcome) */
    expect(ownershipViolation(e('account.update')) ?? 'allowed').toMatch(/not an admin of u142|Plan given, changed or taken by one who is not a master admin/)
    /* and a person delete whose command removes the grant but keeps the account row: refused the same */
    const kept: any = { type: 'person.delete', origin: 'user', actor: deriveActor(), changes: [{ collection: 'settings', id: 'grant:' + g.id, op: 'put', before: gb, after: null }] }
    expect(ownershipViolation(kept) ?? 'allowed').toMatch(/not an admin of u142|Plan given, changed or taken by one who is not a master admin/)
  })
  it('(control) Saber (master, 142 admin) deletes a 149 man holding Plan of 142: still works, the grant gone with him', () => {
    const { p1, id } = planned()
    on(18); signInAs('ad', 'a')
    expect(deletePerson(p1)).toBeNull()
    accountsLoad(); unitsLoad()
    expect({ deleted: !!(PEOPLE as any)[p1].deleted, grants: grantsOf(id).length }).toEqual({ deleted: true, grants: 0 })
  })
  /* (the delete's Undo: none exists — his D350, a delete is no step of the Undo button — so nothing to test) */
})

/* a new 142 man with no sign-in, added on 10 Jul (Fable's harness) */
const newby = () => {
  expect(addRosterPerson({ cs: 'Newby', ini: '', seat: 'FCP', cat: 'C' } as any, '2026-07-10')).toBeNull()
  raptorNotify()
  return Object.keys(PEOPLE).find(k => (PEOPLE as any)[k].cs === 'Newby' && !(PEOPLE as any)[k].deleted)!
}
describe('fault F — an older Undo of the same account row keeps the link\'s day as it stands (F11-4)', () => {
  it('(Fable F11-4) Hunter holds Plan of 149 (13 Jul) and is told as filer; 15 Jul Saber renames his sign-in, then links it to Newby; Hunter moves 16 Jul without it; 17 Jul Saber undoes the link, then the rename: the line his move retired stays off', () => {
    on(13); signInAs('ad', 'a'); const u150 = addUnit('150', 'p1', 'acad9' /* a bystander first admin — §9.2, Piece C */); expect(u150.ok).toBe(true)
    const nb = newby()
    expect(setGrant('acad2', 'u149', 'admin', 'prowler').ok).toBe(true)
    on(15)
    signInAs('ad2', 'a2'); fileFor('osp9', 'prowler')
    signInAs('ad', 'a'); rmk('changed by Saber on the 15th')
    const l = lineTo('prowler')!
    expect(l?.fu).toEqual(['u149'])
    expect(updateAccount('acad2', { name: 'hunter.one' }), '(a first stored write of the seeded row, so an Undo below does not remove the row)').toBeNull()
    expect(updateAccount('acad2', { name: 'hunter.two' }), 'the rename').toBeNull()
    expect(updateAccount('acad2', { pid: nb }), 'the link to Newby').toBeNull()
    homes('prowler', 'hc', [['u142', '2026-07-12'], [String((u150 as any).id), '2026-07-16']]); on(17)
    expect(shown('prowler', l.id), 'retired by his move: the sign-in holding Plan of 149 was Newby that day').toBe(false)
    const u1 = globalUndo(); expect(u1.ok, JSON.stringify(u1)).toBe(true)
    expect({ pid: hunterAcct().pid, link: hunterAcct().pidFrom, shown: shown('prowler', l.id) }, 'the link undone: his again from 17 Jul').toEqual({ pid: 'prowler', link: '2026-07-17', shown: false })
    const u2 = globalUndo(); expect(u2.ok, JSON.stringify(u2)).toBe(true)
    expect({ name: hunterAcct().name === 'hunter.two', link: hunterAcct().pidFrom, shown: shown('prowler', l.id) }, 'the rename undone').toEqual({ name: false, link: '2026-07-17', shown: false })
  })
})

describe('fault G — three Undo cases keep the line the man kept (F11-5a, F11-5b, F11-6)', () => {
  it('(Fable F11-5a) master since 10 Jul; the mark taken off and undone on 11 Jul; he moves 12 Jul as the master; on 13 Jul the Redo by mistake and its Undo at once: his day and his line come back', () => {
    on(10)
    signInAs('ad', 'a'); expect(setMaster('acad2', true).ok).toBe(true)
    const l = hunterLine()
    on(11); signInAs('ad', 'a')
    expect(setMaster('acad2', false).ok).toBe(true)
    expect(globalUndo().ok).toBe(true)
    expect(hunterAcct().masterFrom, 'undone at once: 10 Jul').toBe('2026-07-10')
    homes('prowler', 'hc', [['u142', '2026-07-10'], ['u149', '2026-07-12']])
    on(13)
    expect(shown('prowler', l.id), 'kept through his 12 Jul move: he was the master that day').toBe(true)
    const r = globalRedo(); expect(r.ok, JSON.stringify(r)).toBe(true)
    expect(hunterAcct().master).toBeFalsy()
    const u = globalUndo(); expect(u.ok, JSON.stringify(u)).toBe(true)
    expect({ from: hunterAcct().masterFrom, shown: shown('prowler', l.id) }).toEqual({ from: '2026-07-10', shown: true })
  })
  it('(Fable F11-5a, a move since the Redo) the same, but he moves on 14 Jul after the Redo of 13 Jul, and the Undo is pressed on 15 Jul: a right given today', () => {
    on(10)
    signInAs('ad', 'a'); expect(setMaster('acad2', true).ok).toBe(true)
    on(11); signInAs('ad', 'a')
    expect(setMaster('acad2', false).ok).toBe(true)
    expect(globalUndo().ok).toBe(true)
    on(13)
    const r = globalRedo(); expect(r.ok, JSON.stringify(r)).toBe(true)
    homes('prowler', 'hc', [['u142', '2026-07-10'], ['u149', '2026-07-14']]); on(15)
    const u = globalUndo(); expect(u.ok, JSON.stringify(u)).toBe(true)
    expect(hunterAcct().masterFrom).toBe('2026-07-15')
  })
  /* (§4.5 of the reshape plan, rewrite 6 — as rewrite 5 in fix read 10: what it tests kept, an Undo of a right's lowering
     with no move since it began puts it back at its level with its OWN day; the Plan given after the move, in his new
     squadron; the old line half spent by D2203/D2243 — a line retires only on a move, and a move now ends the Plan (the
     agent's reading, chat 127 — named for the fix read)) */
  it('(Fable F11-5b) moved to 150 on 16 Jul; Plan of 149 from 17 Jul; on 18 Jul set to View and undone: Plan back with its own day', () => {
    on(13); signInAs('ad', 'a'); const u150 = addUnit('150', 'p1', 'acad9' /* a bystander first admin — §9.2, Piece C */); expect(u150.ok).toBe(true)
    homes('prowler', 'hc', [['u142', '2026-07-12'], [String((u150 as any).id), '2026-07-16']]); on(17)
    signInAs('ad', 'a'); expect(setGrant('acad2', 'u149', 'admin', 'prowler').ok).toBe(true)
    on(18); signInAs('ad', 'a')
    expect(setGrant('acad2', 'u149', 'view', 'prowler').ok).toBe(true)
    expect(levelIn('acad2', 'u149'), 'lowered').toBe('view')
    const u = globalUndo(); expect(u.ok, JSON.stringify(u)).toBe(true)
    unitsLoad()
    const g = grantOfOn({ id: 'acad2', pid: 'prowler', pidFrom: undefined }, 'u149', '2026-07-18')
    expect({ level: g?.level, from: g?.from }).toEqual({ level: 'admin', from: '2026-07-17' })
  })
  /* (§4.5 of the reshape plan, rewrite 12 — guardrail 2: no restore puts back a right whose man has moved since its start;
     the Undo puts nothing back, and nothing of 149 holds for him again — Fable 7. Until helper "undo & roles" wires the
     leave-out, the press writes the recorded row, which holds nothing; the step's blocked words are that helper's test) */
  it('(Fable F11-5b, a move between) Plan set to View on 15 Jul, he moves 16 Jul, the Undo on 17 Jul: nothing of 149 holds again', () => {
    on(13); signInAs('ad', 'a'); const u150 = addUnit('150', 'p1', 'acad9' /* a bystander first admin — §9.2, Piece C */); expect(u150.ok).toBe(true)
    expect(setGrant('acad2', 'u149', 'admin', 'prowler').ok).toBe(true)
    on(15); signInAs('ad', 'a')
    expect(setGrant('acad2', 'u149', 'view', 'prowler').ok).toBe(true)
    homes('prowler', 'hc', [['u142', '2026-07-12'], [String((u150 as any).id), '2026-07-16']]); on(17)
    globalUndo(); unitsLoad()
    expect(levelIn('acad2', 'u149'), '17 Jul, after the Undo').toBeNull()
  })
  it('(Fable F11-6) Hunter master since 10 Jul, moved 12 Jul; on 15 Jul Saber links his sign-in to Newby by mistake and presses Undo: his mark day and his line come back', () => {
    on(10)
    signInAs('ad', 'a'); expect(setMaster('acad2', true).ok).toBe(true)
    const l = hunterLine()
    homes('prowler', 'hc', [['u142', '2026-07-10'], ['u149', '2026-07-12']])
    on(15); signInAs('ad', 'a')
    const nb = newby()
    expect(shown('prowler', l.id), 'kept through his move').toBe(true)
    expect(updateAccount('acad2', { pid: nb })).toBeNull()
    const u = globalUndo(); expect(u.ok, JSON.stringify(u)).toBe(true)
    expect({ pid: hunterAcct().pid, from: hunterAcct().masterFrom, link: hunterAcct().pidFrom, shown: shown('prowler', l.id) })
      .toEqual({ pid: 'prowler', from: '2026-07-10', link: undefined, shown: true })
  })
  it('(Fable F11-6, a move between) linked to Newby on 15 Jul, Hunter moves 16 Jul, the Undo on 17 Jul: the link and the mark dated today', () => {
    on(10)
    signInAs('ad', 'a'); expect(setMaster('acad2', true).ok).toBe(true)
    on(15); signInAs('ad', 'a')
    const nb = newby()
    expect(updateAccount('acad2', { pid: nb })).toBeNull()
    homes('prowler', 'hc', [['u142', '2026-07-10'], ['u149', '2026-07-16']]); on(17)
    const u = globalUndo(); expect(u.ok, JSON.stringify(u)).toBe(true)
    expect({ pid: hunterAcct().pid, from: hunterAcct().masterFrom, link: hunterAcct().pidFrom }).toEqual({ pid: 'prowler', from: '2026-07-17', link: '2026-07-17' })
  })
  it('(control — Fable F11-D2) a 149 admin links a 149 admin\'s sign-in to a 142 man: refused', () => {
    const man = Object.keys(PEOPLE).find(p => homeOn(p) === 'u142' && !accountOfPid(p) && !(PEOPLE as any)[p].deleted && !(PEOPLE as any)[p].archived && !(PEOPLE as any)[p].special)!
    expect(man).toBeDefined()
    signInAs('ad9', 'a9')
    const r0 = updateAccount('acus9', { role: 'admin' })
    const r = updateAccount('acus9', { pid: man })
    expect({ r0, refused: r != null, pid: ACCOUNTS_LIST.find(a => a.id === 'acus9')?.pid }).toEqual({ r0: null, refused: true, pid: 'osp9' })
  })
})
