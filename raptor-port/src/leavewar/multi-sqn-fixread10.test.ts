// @vitest-environment jsdom
/* Fix read 10 (20 Nov 26) — the faults the readers found in fix read 9's code (the builder's brief:
   docs/superpowers/briefs/2026-11-20-multi-sqn-b1-fixread10-fixes-brief.md). Each describe is one fault, red first on the
   code the readers read (945c6de69). Hunter (142's plain admin, `ad2`) files LL for Ranger (142, `us`) on 15 Jul; Saber
   is the master (`ad`); Kestrel and Osprey are 149's (`ad9`, `us9`); Outlaw (`casper`) a 142 man. Harness as
   leavewar/multi-sqn-fixread9.test.ts. */
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { storeBackend, HOOKS, store as settingsStore } from '../engine/hooks'
import { PEOPLE, indexCallsigns } from '../engine/people'
import { initStore as raptorInitStore, notify as raptorNotify, resetSession, writeInputsBatch } from '../state/store'
import { accountsLoad, signIn, sessionFor, setMaster, updateAccount, ACCOUNTS_LIST, accountOfPid, levelIn } from '../state/accounts'
import { initStore as lwInitStore, setPeople, setCell, setBidState, getState, openDates, worldUnit, holidayAdd, setRole } from './state/store'
import { commitInput, draftOf } from '../ui/inputedit'
import { ownershipViolation } from '../state/perms'
import { deriveActor } from '../command/actor'
import { memoryBackend } from './state/storage'
import { projectPeople } from './state/raptorRoster'
import { wireLeaveWarSync, setWarWorldDoor, postOut, undoPostOut, swapWarWorld } from './sync'
import { unitsLoad, setGrant, removeGrant, addUnit, homeOn, unitRows, grantOfOn } from '../state/units'
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
/* (HIS BELL'S SWITCH — batch 1's second half §7 item 3, §16 D5′; D2198: once a master admin's home is 149, 142's lines not
   about him are off on his bell by default. These tests are about the move's rule, so the old squadron is switched on, as
   he would switch it, before the line is looked for) */
const bellOn = (pid: string, u: string) => { const k = `bellsqn:${pid}`; const v: any = settingsStore.get(k, null) || {}; settingsStore.set(k, { ...v, [u]: true }) }
/* Outlaw (`casper`) as a plain 142 admin — as the gate reads an actor (fix read 7's harness) */
const outlaw = { id: 'acoutlaw', role: 'admin', personId: 'casper', session: null }
const asOutlaw = (changes: any[], type = 'inputs.batch'): any => ({ type, origin: 'user', actor: outlaw, changes })
/* …and made one on his account too, where the gate's unit-row check reads the account list */
const outlawReal = () => { signInAs('ad2', 'a2'); expect(updateAccount('acoutlaw', { role: 'admin' })).toBeNull() }
const put = (n: any) => ({ collection: 'notices', id: n.id, op: 'put', before: null, after: n })
/* A REAL HOLIDAY (fix read 11, fault C — the same as that file's): an input needing an OIL answer in each squadron on the
   working Friday 17 Jul, then that day made a holiday by the Holidays list's own door, whose line tells the schedulers */
/* (`war` — the squadron whose war is loaded to make it, 142's unless named: since the reshape plan's A4, his D2195, a
   holiday is its own squadron's, so a line on 149's admin's bell comes only from 149's own holiday, made in 149's war by
   its admin — the setup the cases that need such a line now use, §9.2) */
const realHoliday = (by: [string, string], name = 'National Day', war?: string) => {
  const fileOn = (pid: string, filer: [string, string], title: string) => {
    signInAs(filer[0], filer[1])
    expect(commitInput(null, draftOf({ person: pid, type: 'Training', title, date: 'Jul 17', yr: 2026, allday: false, s: 540, e: 720, remarks: '' } as any), [pid]), 'filed: ' + title).toBe(true)
  }
  fileOn('osp9', ['ad9', 'a9'], 'Range 149')
  fileOn('bane', ['ad2', 'a2'], 'Range 142')
  signInAs(by[0], by[1])
  if (war) { swapWarWorld(war); setRole('admin'); expect(worldUnit()).toBe(war) }
  expect(holidayAdd({ kind: 'ph', name, from: '2026-07-17', to: '2026-07-17' }).ok).toBe(true)
}
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

describe('fault A — a war line only as the war\'s own change owes it (SEC10-1, Fable F10-1, F10-2, Astra)', () => {
  it('(SEC10-1) Outlaw calls noticeWar inside an ordinary input command: a made-up "your leave refused" line on Hunter is not saved', () => {
    hunterMovesOn16(); outlawReal(); on(15, 10)
    signInAs('outlaw', 'x')
    const ok = writeInputsBatch(() => { noticeWar(['prowler'], 'casper', { k: 'lw', c: 'LL', d: 'refused', a: '2026-07-25', b: '2026-07-25' } as any) })
    const n = NOTICES.find(x => x.to === 'prowler' && kind(x) === 'lw')
    on(17)
    expect({ saved: ok && !!n, shownOn17: !!n && shown('prowler', n.id) }).toEqual({ saved: false, shownOn17: false })
  })
  it('(SEC10-1) …and noticePosting: a made-up "Ace posted overseas" line to 142\'s admins is not saved', () => {
    outlawReal(); signInAs('outlaw', 'x')
    const ok = writeInputsBatch(() => { noticePosting(['ad2x', 'prowler'], 'dj', 'overseas' as any, '2026-07-15', false) })
    const n = NOTICES.find(x => x.to === 'prowler' && kind(x) === 'po')
    expect({ saved: ok && !!n }).toEqual({ saved: false })
  })
  it('(Fable F10-1) a line with no parts and no input, in Outlaw\'s own words on Hunter: not saved, not shown after his move', () => {
    hunterMovesOn16(); outlawReal(); on(15, 10)
    signInAs('outlaw', 'x')
    const n: any = { id: 'nf10-e', to: 'prowler', by: 'casper', at: Date.now(), iid: '', name: '149: report to Kestrel 0600 Sat', day: '2026-07-25', what: [] }
    const ok = writeInputsBatch(() => { NOTICES.push(n) })
    on(17)
    expect({ saved: ok && NOTICES.some(x => x.id === n.id), shownOn17: shown('prowler', n.id) }).toEqual({ saved: false, shownOn17: false })
  })
  it('(Fable F10-1) the gate refuses a line whose one part is null, and such a line is not about its reader', () => {
    hunterMovesOn16(); outlawReal(); on(15, 10)
    const n: any = { id: 'nf10-n', to: 'prowler', by: 'casper', at: Date.now(), iid: '', name: 'x', day: '2026-07-25', what: [null] }
    expect(ownershipViolation(asOutlaw([put(n)])) ?? 'allowed').not.toBe('allowed')
    expect(noticeAboutHim(n)).toBe(false)
  })
  it('(Fable F10-2) an lw part riding the telling door on a line naming the input the command changes: refused', () => {
    outlawReal(); signInAs('outlaw', 'x')
    expect(writeInputsBatch(() => { INPUTS.push({ person: 'prowler', date: 'Jul 15', yr: 2026, allday: true, type: 'LL', remarks: 'x', by: 'casper', at: Date.now(), iid: IID, ord: 99981 } as any) })).toBe(true)
    hunterMovesOn16(); on(15, 10)
    signInAs('outlaw', 'x')
    const n: any = { id: 'nf10-w', to: 'prowler', by: 'casper', at: Date.now(), iid: IID, name: 'Your leave', day: '2026-12-01', what: [{ k: 'lw', c: 'OL', a: '2026-12-01', b: '2026-12-31', d: 'refused' }] }
    const ok = writeInputsBatch(() => { (INPUTS.find((x: any) => x.iid === IID) as any).remarks = 'y'; NOTICES.push(n) })
    on(17)
    expect({ saved: ok && NOTICES.some(x => x.id === n.id), shownOn17: shown('prowler', n.id) }).toEqual({ saved: false, shownOn17: false })
  })
  it('(Fable F10-2, gate) the same line put beside a change of that input: refused', () => {
    outlawReal(); signInAs('outlaw', 'x')
    expect(writeInputsBatch(() => { INPUTS.push({ person: 'prowler', date: 'Jul 15', yr: 2026, allday: true, type: 'LL', remarks: 'x', by: 'casper', at: Date.now(), iid: IID, ord: 99981 } as any) })).toBe(true)
    on(15, 10)
    const b = structuredClone(INPUTS.find((x: any) => x.iid === IID))
    const n: any = { id: 'nf10-w', to: 'prowler', by: 'casper', at: Date.now(), iid: IID, name: 'Your leave', day: '2026-12-01', what: [{ k: 'lw', c: 'OL', a: '2026-12-01', b: '2026-12-31', d: 'refused' }] }
    expect(ownershipViolation(asOutlaw([{ collection: 'inputs', id: IID, op: 'put', before: b, after: { ...b, remarks: 'y' } }, put(n)])) ?? 'allowed').not.toBe('allowed')
  })
  it('(control) a real decision on Ranger\'s leave tells him', () => {
    signInAs('ad2', 'a2')
    expect(setCell('bane', '2026-07-25', 'LL')).toBe(true)
    setBidState('bane', '2026-07-25', 'refused')
    const l = NOTICES.find(n => n.to === 'bane' && kind(n) === 'lw')
    expect(l, 'Ranger told of the refusal').toBeDefined()
    expect((l!.what[0] as any).d).toBe('refused')
  })
  it('(control) bidding opened tells the war\'s people; read, its Undo says "taken back" and its Redo tells it again', () => {
    signInAs('ad2', 'a2')
    const day = getState().period.end
    expect(openDates(day, day)).toBe('set')
    const l = NOTICES.find(n => n.to === 'bane' && kind(n) === 'lwopen')
    expect(l, 'Ranger told bidding opened').toBeDefined()
    readIt('bane', l!)
    expect(globalUndo().ok).toBe(true)
    expect(NOTICES.some(n => n.to === 'bane' && kind(n) === 'lwback' && (n.what[0] as any).ref === l!.id), 'taken back').toBe(true)
    const r = globalRedo(); expect(r.ok, JSON.stringify(r)).toBe(true)
    expect(NOTICES.filter(n => n.to === 'bane' && kind(n) === 'lwopen').length, 'told again').toBeGreaterThanOrEqual(1)
  })
  it('(control) a decision read, its Undo says "taken back", its Redo "again"', () => {
    signInAs('ad2', 'a2')
    expect(setCell('bane', '2026-07-25', 'LL')).toBe(true)
    setBidState('bane', '2026-07-25', 'refused')
    const l = NOTICES.find(n => n.to === 'bane' && kind(n) === 'lw')!
    readIt('bane', l)
    expect(globalUndo().ok).toBe(true)
    expect(NOTICES.some(n => n.to === 'bane' && kind(n) === 'lwback' && (n.what[0] as any).ref === l.id), 'taken back').toBe(true)
    const r = globalRedo(); expect(r.ok, JSON.stringify(r)).toBe(true)
    expect(NOTICES.some(n => n.to === 'bane' && kind(n) === 'lw' && (n.what[0] as any).again === true && (n.what[0] as any).ref === l.id), 'again').toBe(true)
  })
  it('(control) a posting run today tells the admins, and its Undo post out says "taken back" to one who read it', () => {
    signInAs('ad', 'a')
    expect(postOut('bane', '2026-07-15', 'sans')).toBe(true)
    const l = NOTICES.find(n => n.to === 'prowler' && kind(n) === 'po' && (n.what[0] as any).who === 'bane')
    expect(l, 'Hunter told of the posting').toBeDefined()
    signInAs('ad2', 'a2'); expect(markNoticeRead(l!.id)).toBe(true)
    signInAs('ad', 'a')
    expect(undoPostOut('bane')).toBe(true)
    expect(NOTICES.some(n => n.id === l!.id), 'its line gone').toBe(false)
    expect(NOTICES.filter(n => n.to === 'prowler' && kind(n) === 'poback').length, 'Hunter told "taken back"').toBe(1)
  })
})

describe('fault B — a new holiday line passes as the holiday\'s own only where noticeHoliday made it (O10-2, SEC10-3)', () => {
  it('(Opus O10-2) Outlaw puts a made-up holiday line on Kestrel\'s (149) bell, signed as Kestrel: refused, not saved', () => {
    outlawReal(); signInAs('outlaw', 'x')
    const n: any = { id: 'nforge-hol', to: 'kes9', by: 'kes9', at: Date.now(), iid: '', name: '149: all leave cancelled, report 0600', day: '2026-07-25', what: [{ k: 'oilhol', a: '2026-07-25', b: '2026-07-25' }] }
    const v = ownershipViolation(asOutlaw([put(n)]))
    const ok = writeInputsBatch(() => { NOTICES.push(n) })
    expect({ gate: v ?? 'allowed', saved: ok && NOTICES.some(x => x.id === n.id) }).toEqual({ gate: expect.stringMatching(/./), saved: false })
  })
  it('(Opus O10-2) …and on a 142 member who is no scheduler, signed as Saber: refused', () => {
    outlawReal(); signInAs('outlaw', 'x')
    const n: any = { id: 'nforge-hol2', to: 'bane', by: 'ad', at: Date.now(), iid: '', name: 'made-up words', day: '2026-07-25', what: [{ k: 'oilhol', a: '2026-07-25', b: '2026-07-25' }] }
    expect(ownershipViolation(asOutlaw([put(n)])) ?? 'allowed').not.toBe('allowed')
  })
  it('(SEC10-3) Outlaw puts a holiday line on Osprey (a 149 member) signed as Kestrel: refused', () => {
    outlawReal()
    const n: any = { id: 'nsec10-h', to: 'us9', by: 'kes9', at: Date.now(), iid: '', name: '149 stand-down', day: '2026-08-09', what: [{ k: 'oilhol', a: '2026-08-09', b: '2026-08-09' }] }
    expect(ownershipViolation(asOutlaw([put(n)])) ?? 'allowed').not.toBe('allowed')
  })
  /* (made by the Holidays list's own door since fix read 11, fault C: a bare noticeHoliday in an input command no longer
     passes as the holiday's own — only the command that makes the holiday owes its line) */
  /* REWRITTEN TO D2195 in the reshape (the plan §7, A4; §9.3): it asserted that Saber's 142 holiday told 149's scheduler
     too (kes9) — a holiday now tells its own squadron's schedulers only */
  it('(control) a real holiday made by Saber tells his own squadron\'s schedulers, and its Undo and Redo go through', () => {
    realHoliday(['ad', 'a'])
    const told = () => NOTICES.filter(x => x.name === 'National Day').map(x => x.to).sort()
    const was = told()
    expect(was).toEqual(expect.arrayContaining(['prowler']))
    expect(was, '149’s scheduler is not told of 142’s holiday (D2195)').not.toContain('kes9')
    expect(globalUndo().ok).toBe(true)
    expect(told()).toEqual([])
    const r = globalRedo(); expect(r.ok, JSON.stringify(r)).toBe(true)
    expect(told()).toEqual(was)
  })
})

/* the saved copy: the app's whiteboard with its row writer wired (persist.ts wireRows), as on a built site — the harness
   above saves only settings, so without it nothing is "already written" */
let WB: Whiteboard
const storedLine = (id: string): any => { const v = WB.get('notices', id); return v ? JSON.parse(v) : null }
describe('fault C — a record dropped from memory, then "new" under the same id, never overwrites the stored one (SEC10-2)', () => {
  beforeEach(() => { WB = new Whiteboard(); wireRows(WB) })
  afterEach(() => { setStoredRowProbe(null) })
  it('(SEC10-2d) Kestrel files LL for Osprey (149); Outlaw (142) drops it from memory and files an input of the same id for his own man: refused', () => {
    signInAs('ad9', 'a9')
    expect(writeInputsBatch(() => { INPUTS.push({ person: 'osp9', date: 'Jul 25', yr: 2026, allday: true, type: 'LL', remarks: 'Osprey leave', by: 'kes9', at: Date.now(), iid: 'ipd-sec10', ord: 99982 } as any) })).toBe(true)
    outlawReal(); signInAs('outlaw', 'x')
    const seen: any[] = []
    const off = onCommit((e: any) => { for (const c of e.changes) if (c.collection === 'inputs' && String(c.id).includes('ipd-sec10')) seen.push({ op: c.op, before: c.before ?? null, person: c.after?.person }) })
    const ix = INPUTS.findIndex((x: any) => x.iid === 'ipd-sec10'); INPUTS.splice(ix, 1)
    const ok = writeInputsBatch(() => { INPUTS.push({ person: 'bane', date: 'Jul 26', yr: 2026, allday: true, type: 'Training', remarks: 'x', by: 'casper', at: Date.now(), iid: 'ipd-sec10', ord: 99982 } as any) })
    off()
    expect({ ok, seen }).toEqual({ ok: false, seen: [] })
  })
  it('(SEC10-2, his own squadron) Outlaw drops Saber\'s line to Ranger from memory, then tells Ranger under its id in his own words: refused, the stored line stands', () => {
    hunterLine()
    const real = NOTICES.find(n => n.to === 'bane' && n.iid === IID && n.by === 'stiff')!
    expect(real?.by, 'Saber told Ranger').toBe('stiff')
    outlawReal(); signInAs('outlaw', 'x')
    const ix = NOTICES.findIndex(x => x.id === real.id); NOTICES.splice(ix, 1)
    const ok = writeInputsBatch(() => {
      (INPUTS.find((x: any) => x.iid === IID) as any).remarks = 'Outlaw words'
      NOTICES.push({ ...real, by: 'casper', at: Date.now(), what: [{ k: 'rmk' }] } as any)
    })
    expect({ ok, stored: storedLine(real.id)?.by }).toEqual({ ok: false, stored: 'stiff' })
  })
  it('(SEC10-2, SEC10-2b) another squadron\'s holiday line dropped, then re-added rewritten or re-addressed: refused', () => {
    /* (the line made by the holiday's own door — fix read 11, fault C; since D2195 Kestrel's line is 149's own holiday's,
       made by him in 149's war — the reshape plan §9.2, setup only) */
    realHoliday(['ad9', 'a9'], 'National Day', 'u149')
    const real = NOTICES.find(x => x.to === 'kes9' && x.name === 'National Day')!
    expect(real, 'Kestrel told of the holiday').toBeDefined()
    outlawReal(); signInAs('outlaw', 'x')
    let ix = NOTICES.findIndex(x => x.id === real.id); NOTICES.splice(ix, 1)
    expect(writeInputsBatch(() => { NOTICES.push({ ...real, name: '149: OIL cancelled, ignore', by: 'kes9' } as any) })).toBe(false)
    ix = NOTICES.findIndex(x => x.id === real.id); if (ix >= 0) NOTICES.splice(ix, 1)
    expect(writeInputsBatch(() => { NOTICES.push({ id: real.id, to: 'casper', by: 'casper', at: Date.now(), iid: '', name: 'x', day: '2026-08-09', what: [{ k: 'del' }] } as any) })).toBe(false)
    expect(storedLine(real.id)?.to).toBe('kes9')
  })
  it('(control) an honest new input and its new bell line still save', () => {
    signInAs('ad2', 'a2'); fileFor('bane', 'prowler')
    const l = NOTICES.find(n => n.to === 'bane' && n.iid === IID)
    expect(l, 'Ranger told').toBeDefined()
    expect(storedLine(l!.id)?.to).toBe('bane')
    expect(WB.has('inputs', IID)).toBe(true)
  })
})

/* a new 142 man with no sign-in, added on 10 Jul (Fable's harness) */
const newby = () => {
  expect(addRosterPerson({ cs: 'Newby', ini: '', seat: 'FCP', cat: 'C' } as any, '2026-07-10')).toBeNull()
  raptorNotify()
  return Object.keys(PEOPLE).find(k => (PEOPLE as any)[k].cs === 'Newby' && !(PEOPLE as any)[k].deleted)!
}
describe('fault D — a right that changes hands through the account row is a right given that day (O10-4, F10-3, F10-4)', () => {
  it('(O10-4) Kestrel (149) swaps the persons of Osprey\'s account (Plan of 142 from 15 Jul) and Hunter\'s on 18 Jul: refused, his retired line stays off', () => {
    const l = hunterLine()
    /* (Osprey's sign-in made an admin's first: Plan is an admin's — the Plan audit's PA2; §9.2 of the reshape plan, setup only) */
    signInAs('ad', 'a'); expect(updateAccount('acus9', { role: 'admin' })).toBeNull()
    expect(setGrant('acus9', 'u142', 'admin', 'osp9').ok).toBe(true)
    outlawReal()
    hunterMovesOn16(); on(18)
    expect(shown('prowler', l.id), 'retired by his move').toBe(false)
    signInAs('ad9', 'a9')
    const row = (id: string) => ({ ...(settingsStore.get('account:' + id, null) as any) })
    const o = row('acus9'), h = row('acad2')
    const r: any = commitSettingsIntent('account.update', null, () => {
      settingsStore.set('account:acus9', { ...o, pid: 'prowler' })
      settingsStore.set('account:acad2', { ...h, pid: 'osp9' })
    })
    accountsLoad(); unitsLoad()
    expect({ ok: r.ok, back: shown('prowler', l.id) }).toEqual({ ok: false, back: false })
  })
  it('(O10-4b) the same through Admin → Users (updateAccount): Kestrel may re-link Hunter\'s sign-in, never Osprey\'s holding Plan of 142', () => {
    const l = hunterLine()
    /* (Osprey's sign-in made an admin's first: Plan is an admin's — the Plan audit's PA2; §9.2 of the reshape plan, setup only) */
    signInAs('ad', 'a'); expect(updateAccount('acus9', { role: 'admin' })).toBeNull()
    expect(setGrant('acus9', 'u142', 'admin', 'osp9').ok).toBe(true)
    hunterMovesOn16(); on(18)
    const spare = Object.keys(PEOPLE).find(p => homeOn(p, rosterToday()) === 'u149' && !accountOfPid(p) && !(PEOPLE as any)[p].deleted && !(PEOPLE as any)[p].archived && !(PEOPLE as any)[p].special)
    expect(spare, 'a 149 man with no sign-in').toBeDefined()
    signInAs('ad9', 'a9')
    const r1 = updateAccount('acad2', { pid: spare! })
    const r2 = updateAccount('acus9', { pid: 'prowler' })
    accountsLoad(); unitsLoad()
    expect({ r1, r2, back: shown('prowler', l.id) }).toEqual({ r1: null, r2: 'This sign-in holds a right in 142. Only a master admin can link it to another person.', back: false })
    expect(hunterAcct().pidFrom, 'the re-link dated today').toBe('2026-07-18')
  })
  it('(F10-4) Saber re-links Kestrel\'s account (Plan of 142 from 15 Jul) to Hunter on 18 Jul: allowed, dated 18 Jul, the retired line stays off — and through its Undo and Redo', () => {
    const l = hunterLine()
    signInAs('ad', 'a'); const nb = newby()
    expect(setGrant('acad9', 'u142', 'admin', 'kes9').ok).toBe(true)
    hunterMovesOn16(); on(18)
    expect(shown('prowler', l.id), 'retired by his move').toBe(false)
    signInAs('ad', 'a')
    expect(updateAccount('acad2', { pid: nb }), 'Hunter\'s own account re-linked away').toBeNull()
    expect(updateAccount('acad9', { pid: 'prowler' })).toBeNull()
    expect({ from: ACCOUNTS_LIST.find(a => a.id === 'acad9')?.pidFrom, back: shown('prowler', l.id) }).toEqual({ from: '2026-07-18', back: false })
    on(19)
    expect(globalUndo().ok).toBe(true)
    expect(ACCOUNTS_LIST.find(a => a.id === 'acad9')?.pid).toBe('kes9')
    const r = globalRedo(); expect(r.ok, JSON.stringify(r)).toBe(true)
    const k = ACCOUNTS_LIST.find(a => a.id === 'acad9')
    expect({ pid: k?.pid, from: k?.pidFrom, back: shown('prowler', l.id) }, 'a Redo re-links today').toEqual({ pid: 'prowler', from: '2026-07-19', back: false })
  })
  it('(F10-3) Saber re-links Hunter\'s account (master since 15 Jul) to Newby on 18 Jul: allowed, the mark and the link dated that day', () => {
    signInAs('ad', 'a'); const nb = newby()
    expect(setMaster('acad2', true).ok).toBe(true)
    on(18); signInAs('ad', 'a')
    expect(updateAccount('acad2', { pid: nb })).toBeNull()
    expect({ pid: hunterAcct().pid, master: hunterAcct().masterFrom, link: hunterAcct().pidFrom }).toEqual({ pid: nb, master: '2026-07-18', link: '2026-07-18' })
  })
  it('(F10-3, control) the same on the day the mark was set', () => {
    signInAs('ad', 'a'); const nb = newby()
    expect(setMaster('acad2', true).ok).toBe(true)
    expect(updateAccount('acad2', { pid: nb })).toBeNull()
  })
  it('(F10-3, the gate) a re-link written with the old days is refused, in words that say so; dated today it passes', () => {
    signInAs('ad', 'a')
    expect(setMaster('acad2', true).ok).toBe(true)
    on(18); signInAs('ad', 'a')
    const b = { ...hunterAcct() }
    const e = (after: any) => ({ type: 'account.update', origin: 'user', actor: deriveActor(), changes: [{ collection: 'settings', id: 'account:acad2', op: 'put', before: b, after }] })
    expect(ownershipViolation(e({ ...b, pid: 'dj' }) as any)).toMatch(/link to its person not dated today/)
    expect(ownershipViolation(e({ ...b, pid: 'dj', pidFrom: '2026-07-18' }) as any)).toMatch(/master mark not dated today/)
    /* (batch 1's second half, §16 D1′ — rewritten to the ruling's outcome: a re-link begins the role and the mark now, so
       their moments are now too) */
    expect(ownershipViolation(e({ ...b, pid: 'dj', pidFrom: '2026-07-18', masterFrom: '2026-07-18' }) as any) ?? 'allowed').toMatch(/not dated now/)
    expect(ownershipViolation(e({ ...b, pid: 'dj', pidFrom: '2026-07-18', masterFrom: '2026-07-18', adminAt: Date.now(), masterAt: Date.now() }) as any) ?? 'allowed').toBe('allowed')
  })
})

describe('fault E — a right taken off after a move and put back by its Undo or Redo, with no move since, keeps its day (O10-1, F10-5)', () => {
  it('(O10-1) master since 10 Jul, moved 12 Jul, the mark taken off by mistake 15 Jul and undone at once: its day and his line come back', () => {
    bellOn('prowler', 'u142')
    on(10)
    signInAs('ad', 'a'); expect(setMaster('acad2', true).ok).toBe(true)
    expect(hunterAcct().masterFrom).toBe('2026-07-10')
    const l = hunterLine()
    homes('prowler', 'hc', [['u142', '2026-07-10'], ['u149', '2026-07-12']])
    on(15)
    expect(shown('prowler', l.id), 'kept through his 12 Jul move: he was the master that day').toBe(true)
    signInAs('ad', 'a'); expect(setMaster('acad2', false).ok).toBe(true)
    const u = globalUndo(); expect(u.ok, JSON.stringify(u)).toBe(true)
    expect(hunterAcct().master).toBe(true)
    expect({ from: hunterAcct().masterFrom, shown: shown('prowler', l.id) }).toEqual({ from: '2026-07-10', shown: true })
  })
  /* (§4.5 of the reshape plan, rewrite 5 — what it tests kept: an Undo of a right's removal, with no move since the right
     began, puts it back with its OWN day. The Plan is given after the move, in his new squadron, since his D2203/D2243 end
     every right held before it. Its old line half — a line his move retired, kept through the move by Plan — is spent by
     the same rulings: a line retires only on a move, and a move now ends the Plan (the agent's reading, chat 127 — named
     for the fix read)) */
  it('(F10-5) moved to 150 on 16 Jul; Plan of 149 from 17 Jul; on 18 Jul taken off and undone: the Plan back with its own day', () => {
    on(13); signInAs('ad', 'a'); const u150 = addUnit('150', 'p1', 'acad9' /* a bystander first admin — §9.2, Piece C */); expect(u150.ok).toBe(true)
    homes('prowler', 'hc', [['u142', '2026-07-12'], [String((u150 as any).id), '2026-07-16']]); on(17)
    signInAs('ad', 'a'); expect(updateAccount('acad2', { role: 'admin' }), 'setup (K3, D2160): he joined as a member — made an admin of his new squadron first').toBeNull(); expect(setGrant('acad2', 'u149', 'admin', 'prowler').ok).toBe(true)
    on(18); signInAs('ad', 'a')
    expect(removeGrant('acad2', 'u149').ok).toBe(true)
    expect(levelIn('acad2', 'u149', rosterToday()), 'gone with its removal').toBeNull()
    const u = globalUndo(); expect(u.ok, JSON.stringify(u)).toBe(true)
    unitsLoad()
    expect(levelIn('acad2', 'u149', rosterToday()), 'the Undo put the Plan back').toBe('admin')
    expect(grantOfOn({ id: 'acad2', pid: 'prowler', pidFrom: undefined }, 'u149', '2026-07-18')?.from, 'with its own day').toBe('2026-07-17')
  })
  /* (the reshape plan §4.5, rewrite 9 — guardrail 2: as given, Plan of 149 from 13 Jul across his 16 Jul move, it held a right
     across a move, which D2203 ends at the move; rewritten as rewrites 5–6 are: the Plan given after the move, in his new
     squadron, its Undo and Redo the next day — written at the commit that wires the leave-out, helper "undo & roles") */
  it('(Redo, no move since its Undo) he moves 16 Jul; Plan of 149 given 17 Jul; on 18 Jul its Undo and Redo: the Redo puts back 17 Jul', () => {
    on(13); signInAs('ad', 'a'); const u150 = addUnit('150', 'p1', 'acad9' /* a bystander first admin — §9.2, Piece C */); expect(u150.ok).toBe(true)
    homes('prowler', 'hc', [['u142', '2026-07-12'], [String((u150 as any).id), '2026-07-16']]); on(17)
    expect(updateAccount('acad2', { role: 'admin' }), 'setup (K3, D2160): he joined as a member — made an admin of his new squadron first').toBeNull(); expect(setGrant('acad2', 'u149', 'admin', 'prowler').ok).toBe(true)
    on(18)
    const g = () => unitRows().grants.find(x => x.account === 'acad2' && x.unit === 'u149')
    const u = globalUndo(); expect(u.ok, JSON.stringify(u)).toBe(true)
    expect(g(), 'undone: off').toBeFalsy()
    const r = globalRedo(); expect(r.ok, JSON.stringify(r)).toBe(true)
    expect(g()?.from, 'off only since this morning\'s Undo, no move since').toBe('2026-07-17')
  })
  /* (§4.5 of the reshape plan, rewrites 10 and 11 — guardrail 2: a Redo or an Undo after his move puts nothing back that
     holds. Until helper "undo & roles" wires the leave-out the press writes the recorded row, which holds nothing; the
     step's blocked words are that helper's test) */
  const plan149 = () => grantOfOn({ id: 'acad2', pid: 'prowler', pidFrom: undefined }, 'u149', '2026-07-17')
  it('(Redo, a move since its Undo) Plan of 149 given 13 Jul and undone 15 Jul; he moves 16 Jul; the Redo on 17 Jul: nothing of 149 holds', () => {
    on(13); signInAs('ad', 'a'); const u150 = addUnit('150', 'p1', 'acad9' /* a bystander first admin — §9.2, Piece C */); expect(u150.ok).toBe(true)
    expect(setGrant('acad2', 'u149', 'admin', 'prowler').ok).toBe(true)
    on(15)
    const u = globalUndo(); expect(u.ok, JSON.stringify(u)).toBe(true)
    homes('prowler', 'hc', [['u142', '2026-07-12'], [String((u150 as any).id), '2026-07-16']]); on(17)
    globalRedo(); unitsLoad()
    expect(plan149(), 'the Redo after his move').toBeUndefined()
  })
  it('(control — a move between) the Plan taken off 15 Jul, he moves 16 Jul, the Undo on 17 Jul: nothing of 149 holds', () => {
    on(13); signInAs('ad', 'a'); const u150 = addUnit('150', 'p1', 'acad9' /* a bystander first admin — §9.2, Piece C */); expect(u150.ok).toBe(true)
    expect(setGrant('acad2', 'u149', 'admin', 'prowler').ok).toBe(true)
    on(15); signInAs('ad', 'a')
    expect(removeGrant('acad2', 'u149').ok).toBe(true)
    homes('prowler', 'hc', [['u142', '2026-07-12'], [String((u150 as any).id), '2026-07-16']]); on(17)
    globalUndo(); unitsLoad()
    expect(plan149(), 'the Undo after his move').toBeUndefined()
  })
})
