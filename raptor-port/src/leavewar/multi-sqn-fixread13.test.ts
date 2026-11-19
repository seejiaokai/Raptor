// @vitest-environment jsdom
/* Fix read 13 (20 Nov 26) — the faults the readers found in fix read 12's code, and his D2228 (the builder's brief:
   docs/superpowers/briefs/2026-11-20-multi-sqn-b1-fixread13-fixes-brief.md). Each describe is one item, red first on the
   code the readers read (3d9743036). Hunter (142's plain admin, `ad2`, person `prowler`); Saber the master (`ad`, person
   `stiff`); Ranger (142, `us`, account `acus`, person `bane`); Kestrel and Osprey are 149's (`ad9`, `us9`). Harness as
   leavewar/multi-sqn-fixread12.test.ts; the readers' set-ups copied, never imported. */
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { storeBackend, HOOKS } from '../engine/hooks'
import { PEOPLE, indexCallsigns } from '../engine/people'
import { initStore as raptorInitStore, notify as raptorNotify, resetSession, writeInputsBatch } from '../state/store'
import { accountsLoad, signIn, sessionFor, ACCOUNTS_LIST } from '../state/accounts'
import { initStore as lwInitStore, setPeople, getState } from '../leavewar/state/store'
import { memoryBackend } from '../leavewar/state/storage'
import { projectPeople } from '../leavewar/state/raptorRoster'
import { wireLeaveWarSync, setWarWorldDoor, postOut, runPoOutcomes, undoPostOut } from '../leavewar/sync'
import { unitsLoad, setGrant, unitRows } from '../state/units'
import { INPUTS } from '../engine/inputs'
import { NOTICES, noticesFor, filerVia } from '../state/notices'
import { onCommit } from '../command'
import { noticeSeenLoad } from '../state/noticeseen'
import { installGlobalUndo } from '../state/undo-wire'
import { _resetTimeline, globalUndo } from '../undo/timeline'
import { commitInputsWith } from '../state/sched-commit'
import { Whiteboard } from '../storage/whiteboard'
import { wireRows, writeSeedRows } from '../state/persist'
import { setStoredRowProbe, setStoredRowsWhole, ownershipViolation } from '../state/perms'

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

const on = (d: number, h = 9, m = 0) => { vi.setSystemTime(new Date(2026, 6, d, h, m, 0)); unitsLoad() }
const grantsOf = (id: string) => unitRows().grants.filter(g => g.account === id)
const passTypes = () => {
  const seen: string[] = []
  const off = onCommit((e: any) => { seen.push(e.type) })
  try { runPoOutcomes() } finally { off() }
  return seen
}

/* ITEM A — a record made up in memory still reached the saved copy through a delete (O13-1, F13-1, SEC13-2). The saved
   copy as on a built site: wired and seeded (fix read 12's fault D set-up). */
describe('item A — a record made up in memory, removed as if saved, never reaches the saved copy (O13-1, F13-1, SEC13-2)', () => {
  let WB: Whiteboard
  const stored = (coll: 'inputs' | 'notices', id: string): any => { const v = WB.get(coll, id); return v ? JSON.parse(v) : null }
  beforeEach(() => { WB = new Whiteboard(); wireRows(WB); writeSeedRows(WB) })
  afterEach(() => { setStoredRowProbe(null); setStoredRowsWhole(false) })

  /* Opus O13-1 (o13-d-undo.test.ts :77): his leave "filed by" Kestrel or himself a month ago, pushed into memory, deleted,
     then Undo — the Undo used to save the made-up record */
  for (const by of ['kes9', 'bane']) {
    it(`O13-1: Ranger's made-up leave (filed by ${by} a month ago) deleted, then Undo: the delete refused, nothing saved`, () => {
      signInAs('us', 'us')
      INPUTS.push({ person: 'bane', date: 'Jul 27', yr: 2026, allday: true, type: 'LL', remarks: 'made up', by, at: Date.now() - 30 * 86400000, iid: 'ipd-o13' + by, ord: 99951 } as any)
      const ok = writeInputsBatch(() => { const ix = INPUTS.findIndex((r: any) => r.iid === 'ipd-o13' + by); INPUTS.splice(ix, 1) })
      if (ok) globalUndo()
      expect({ del: ok, saved: stored('inputs', 'ipd-o13' + by) }).toEqual({ del: false, saved: null })
    })
  }
  /* O13-1 (:88): his own SAVED request rewritten in memory (filed by Kestrel a month ago), deleted, then Undo */
  it('O13-1: his own saved request rewritten in memory, deleted, then Undo — the saved row comes back as it was saved', () => {
    signInAs('us', 'us')
    const x: any = INPUTS.find((r: any) => r.person === 'bane' && r.type === 'Appointment')
    const iid = String(x.iid)
    const was = stored('inputs', iid)
    expect(was, 'the seed is saved').toBeTruthy()
    x.by = 'kes9'; x.at = Date.now() - 30 * 86400000                                              // outside every command
    expect(writeInputsBatch(() => { INPUTS.splice(INPUTS.indexOf(x), 1) }), 'his honest delete of his own saved request').toBe(true)
    expect(stored('inputs', iid)).toBeNull()
    expect(globalUndo().ok).toBe(true)
    const s = stored('inputs', iid)
    expect({ by: s?.by, at: s?.at }).toEqual({ by: was.by, at: was.at })
  })
  /* O13-1 (:100): a made-up bell line dated 2099 removed with its (real) request, then Undo */
  it('O13-1: Hunter removes a made-up bell line dated 2099 with his real request: refused, the line never saved', () => {
    const IID = 'ipd-o13n'
    signInAs('ad2', 'a2')
    expect(writeInputsBatch(() => { INPUTS.push({ person: 'bane', date: 'Jul 25', yr: 2026, allday: true, type: 'LL', remarks: 'for him', by: 'prowler', at: Date.now(), iid: IID, ord: 99941 } as any) })).toBe(true)
    signInAs('ad', 'a'); expect(writeInputsBatch(() => { (INPUTS.find((x: any) => x.iid === IID) as any).remarks = 'Saber' })).toBe(true)
    const real = NOTICES.find(n => n.to === 'bane' && n.iid === IID)!
    expect(real).toBeDefined()
    signInAs('ad2', 'a2')
    NOTICES.push({ ...JSON.parse(JSON.stringify(real)), id: 'nfab13', at: new Date(2099, 0, 1).getTime(), by: 'prowler' } as any)
    const ok = writeInputsBatch(() => { const ix = INPUTS.findIndex((r: any) => r.iid === IID); INPUTS.splice(ix, 1); const j = NOTICES.findIndex(n => n.id === 'nfab13'); if (j >= 0) NOTICES.splice(j, 1) })
    if (ok) globalUndo()
    expect({ del: ok, saved: stored('notices', 'nfab13') }).toEqual({ del: false, saved: null })
  })

  /* Fable F13-1 (f13-1-delete-door.test.ts :118, :124): the delete alone puts a saved line on the "filer's" bell */
  const fab = (over: any = {}) => ({ person: 'bane', date: 'Jul 27', yr: 2026, allday: true, type: 'LL', remarks: 'made up', by: 'prowler', at: Date.now() - 30 * 86400000, iid: 'ipd-fab13', ord: 99971, ...over })
  const delFab = () => writeInputsBatch(() => { const ix = INPUTS.findIndex((r: any) => r.iid === 'ipd-fab13'); INPUTS.splice(ix, 1) })
  const linesAbout = () => NOTICES.filter(n => n.iid === 'ipd-fab13').map(n => ({ to: n.to, by: n.by, saved: !!stored('notices', String(n.id)), shown: noticesFor(String(n.to)).some(x => x.id === n.id) }))
  it('F13-1: Ranger makes up his own leave "filed by Hunter" in memory and deletes it: refused, no line on Hunter\'s bell', () => {
    signInAs('us', 'us')
    INPUTS.push(fab() as any)
    expect({ ok: delFab(), lines: linesAbout() }).toEqual({ ok: false, lines: [] })
  })
  it('F13-1: the same "filed by Saber", a Training with a title of his choosing: refused, no line on the master\'s bell', () => {
    signInAs('us', 'us')
    INPUTS.push(fab({ by: 'stiff', type: 'Training', title: 'SEE ME AT ONCE - CO', allday: false, s: 540, e: 600 }) as any)
    expect({ ok: delFab(), lines: linesAbout() }).toEqual({ ok: false, lines: [] })
  })
  it('(control) the same made-up record EDITED is still refused — fix read 12\'s fault D', () => {
    signInAs('us', 'us')
    INPUTS.push(fab() as any)
    expect(writeInputsBatch(() => { (INPUTS.find((r: any) => r.iid === 'ipd-fab13') as any).remarks = 'x' })).toBe(false)
    expect(linesAbout()).toEqual([])
  })
  it('(control) a REAL request Hunter filed for Ranger, deleted by Ranger: allowed, Hunter told', () => {
    signInAs('ad2', 'a2')
    expect(writeInputsBatch(() => { INPUTS.push(fab({ at: Date.now() }) as any) })).toBe(true)
    expect(stored('inputs', 'ipd-fab13'), 'saved').toBeTruthy()
    signInAs('us', 'us')
    expect(delFab()).toBe(true)
    expect(linesAbout().filter(l => l.to === 'prowler' && l.by === 'bane' && l.saved).length).toBe(1)
  })
  it('(control) a member deletes his own saved request and Undoes it: the row back exactly as saved', () => {
    signInAs('us', 'us')
    const x: any = INPUTS.find((r: any) => r.person === 'bane' && r.type === 'Appointment')
    const iid = String(x.iid)
    const was = WB.get('inputs', iid)
    expect(writeInputsBatch(() => { INPUTS.splice(INPUTS.indexOf(x), 1) })).toBe(true)
    expect(globalUndo().ok).toBe(true)
    /* (`acc`, the week's landing mark, is worked out again on a restore — sched-commit.ts strips it — never compared) */
    const { acc: _a, ...back } = stored('inputs', iid) ?? {}
    const { acc: _b, ...saved } = JSON.parse(was!)
    expect(back).toEqual(saved)
  })

  /* the security read's SEC13-2 (sec13-deleted-madeup.test.ts :123, :129): deleted in one command with the telling line */
  const forge = (who: string, iid: string, filer: string) => {
    const rec: any = { person: who, date: 'Jul 27', yr: 2026, allday: true, type: 'LL', remarks: 'made up', by: filer, at: Date.now() - 30 * 86400000, iid, ord: 99981 }
    INPUTS.push(rec)
    return rec
  }
  const line = (lid: string, to: string, by: string, rec: any) =>
    ({ id: lid, to, by, at: Date.now(), iid: rec.iid, name: 'LL 27 Jul', day: '2026-07-27', what: [{ k: 'del' }], fu: filerVia(to, [rec]) ?? undefined } as any)
  const run = (fn: () => void): string => { const r: any = commitInputsWith([], 'inputs.batch', fn); return r.ok === false ? String(r.message) : 'saved' }
  it('SEC13-2: Ranger deletes a request made up "filed by Hunter", with the telling line to Hunter: refused, never saved', () => {
    signInAs('us', 'us')
    const rec = forge('bane', 'ipd-s13a', 'prowler')
    const res = run(() => { INPUTS.splice(INPUTS.indexOf(rec), 1); NOTICES.push(line('n-s13a', 'prowler', 'bane', rec)) })
    expect({ res, line: WB.get('notices', 'n-s13a') }).toEqual({ res: expect.stringMatching(/never saved/), line: null })
  })
  it('SEC13-2: Hunter deletes a request made up for his man "filed by Saber", line to Saber: refused, never saved', () => {
    signInAs('ad2', 'a2')
    const rec = forge('bane', 'ipd-s13b', 'stiff')
    const res = run(() => { INPUTS.splice(INPUTS.indexOf(rec), 1); NOTICES.push(line('n-s13b', 'stiff', 'prowler', rec)) })
    expect({ res, line: WB.get('notices', 'n-s13b') }).toEqual({ res: expect.stringMatching(/never saved/), line: null })
  })
  it('(control) a filer in 149 (Kestrel, no right in 142): still refused', () => {
    signInAs('us', 'us')
    const rec = forge('bane', 'ipd-s13d', 'kes9')
    const res = run(() => { INPUTS.splice(INPUTS.indexOf(rec), 1); NOTICES.push(line('n-s13d', 'kes9', 'bane', rec)) })
    expect({ refused: res !== 'saved', line: WB.get('notices', 'n-s13d') }).toEqual({ refused: true, line: null })
  })
})


/* ITEM B — a Delete posting made up in memory was carried out by the posting pass in a member's browser (SEC13-1). The
   security read's set-ups (sec13-forged-posting.test.ts :111, :121, :135), copied. */
describe('item B — a posting made up in memory is never carried out by the posting pass (SEC13-1)', () => {
  const forgePosting = (pid: string, to: string) => {
    const st: any = getState()
    const body = st.people.find((p: any) => p.id === pid) ?? (st.postOuts && st.postOuts[pid])
    st.postOuts[pid] = { ...JSON.parse(JSON.stringify(body)), to, poOutcome: 'delete' }   // outside every command
  }
  const state = (pid: string, aid: string) => {
    accountsLoad(); unitsLoad()
    return { deleted: !!(PEOPLE as any)[pid].deleted, account: !!ACCOUNTS_LIST.find(a => a.id === aid), grants: grantsOf(aid).length }
  }
  afterEach(() => { setStoredRowProbe(null); setStoredRowsWhole(false) })
  it('(:111) Ranger (142 member) makes up a Delete posting for Hunter (142 admin, View of 149); the pass in his browser does nothing', () => {
    signInAs('ad9', 'a9')
    expect(setGrant('acad2', 'u149', 'view', 'prowler').ok, 'Kestrel gives Hunter View of 149').toBe(true)
    on(16)
    signInAs('us', 'us')
    forgePosting('prowler', '2026-07-14')
    const types = passTypes()
    expect({ pass: types.includes('lw.postoutRun'), ...state('prowler', 'acad2') })
      .toEqual({ pass: false, deleted: false, account: true, grants: 1 })
    expect(getState().postOuts.prowler ?? null, 'the made-up posting is gone from memory').toBeNull()
  })
  it('(:121, the saved copy wired and seeded as at start-up) the same: Hunter never saved as deleted', () => {
    const WB = new Whiteboard(); wireRows(WB); writeSeedRows(WB)
    signInAs('ad9', 'a9')
    expect(setGrant('acad2', 'u149', 'view', 'prowler').ok).toBe(true)
    on(16)
    signInAs('us', 'us')
    expect(getState().postOuts.prowler?.to ?? null, 'no posting set for Hunter by anyone').toBeNull()
    forgePosting('prowler', '2026-07-14')
    passTypes()
    const row = WB.get('people', 'prowler')
    expect({ savedDeleted: !!(row && JSON.parse(row).deleted), grants: state('prowler', 'acad2').grants }).toEqual({ savedDeleted: false, grants: 1 })
  })
  it('(:135, the older half) Ranger makes up a Delete posting for Casper, a 142 man holding nothing elsewhere: nothing happens', () => {
    on(16)
    signInAs('us', 'us')
    forgePosting('casper', '2026-07-14')
    const types = passTypes()
    expect({ pass: types.includes('lw.postoutRun'), deleted: !!(PEOPLE as any).casper.deleted }).toEqual({ pass: false, deleted: false })
  })
  it('(control) no posting at all: the pass does nothing', () => {
    on(16)
    signInAs('us', 'us')
    expect(passTypes()).not.toContain('lw.postoutRun')
    expect(state('prowler', 'acad2').deleted).toBe(false)
  })
  /* (b) the gate: the pass's own change of a posting must start from the war's SAVED posting row, its date and outcome
     kept — a pass envelope carrying a posting with no saved row, or one rewritten, is refused once the saved copy is wired */
  const passEnv = (changes: any[]): any => ({ seq: 1, at: '', actor: { id: 'system', role: 'system', session: null }, origin: 'projection', scope: { module: 'people' }, type: 'lw.postoutRun', changes, emit: true })
  const delPerson = (id: string) => ({ op: 'put', collection: 'people', id, before: { cs: id }, after: { cs: id, deleted: true, deletedFrom: '2026-07-15', archived: true, archivedBy: 'del' } })
  it('(gate, saved copy wired) a Delete posting with no saved row, or no before-image, rides no pass', () => {
    const WB = new Whiteboard(); wireRows(WB); writeSeedRows(WB)
    const body: any = { id: 'casper', callsign: 'CASPER', from: '2026-01-01', to: '2026-07-14', poOutcome: 'delete' }
    expect(ownershipViolation(passEnv([delPerson('casper'), { op: 'put', collection: 'lw.postouts', id: 'casper', before: null, after: { ...body, poDone: '2026-07-15' } }])))
      .toMatch(/posting pass may change only/)
    expect(ownershipViolation(passEnv([delPerson('casper'), { op: 'put', collection: 'lw.postouts', id: 'casper', before: body, after: { ...body, poDone: '2026-07-15' } }])))
      .toMatch(/posting pass may change only/)
    expect(ownershipViolation(passEnv([delPerson('casper'), { op: 'delete', collection: 'lw.postouts', id: 'casper', before: body, after: null }])))
      .toMatch(/posting pass may change only/)
  })
  it('(control) a real posting set by an admin runs on its date, and its Undo post out works', () => {
    const WB = new Whiteboard(); wireRows(WB); writeSeedRows(WB)
    signInAs('ad2', 'a2')
    expect(postOut('casper', '2026-07-20', 'overseas'), 'Hunter posts Casper out to an Overseas Sqn from 20 Jul').toBe(true)
    expect(!!(PEOPLE as any).casper.archived, 'not before its date').toBe(false)
    on(20)
    const seen: string[] = []
    const off = onCommit((e: any) => { seen.push(e.type) })
    try { signInAs('us', 'us'); runPoOutcomes() } finally { off() }   // the sign-in's own notify wakes the pass
    expect(seen, 'the pass runs in a member\'s browser on its date').toContain('lw.postoutRun')
    expect(!!(PEOPLE as any).casper.archived, 'Casper archived by his posting').toBe(true)
    expect(JSON.parse(WB.get('people', 'casper')!).archived, 'saved archived').toBe(true)
    signInAs('ad2', 'a2')
    expect(undoPostOut('casper'), 'Undo post out').toBe(true)
    expect(!!(PEOPLE as any).casper.archived, 'Casper back').toBe(false)
  })
})
