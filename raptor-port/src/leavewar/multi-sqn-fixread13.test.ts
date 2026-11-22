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
import { unitsLoad, setGrant, setHome, unitRows, homeOn, grantOfOn } from '../state/units'
import { HOME_PFX } from '../state/units-model'
import { accountOfPid, updateAccount } from '../state/accounts'
import { commit } from '../command'
import { peopleStore, finishPeopleWrite } from '../state/people-settings-commit'
import { resyncBeforeEnlist } from '../state/sched-commit'
import { deletePerson } from '../state/person-delete'
import { updatePersonField } from '../state/quals-write'
import { placeApproved, inOneWarCommand, setRemarksOn } from '../leavewar/state/store'
import { leaveInputsAt } from '../leavewar/sync'
import { setLeaveRemarks } from '../ui/inputedit'
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
    NOTICES.push({ ...structuredClone(real), id: 'nfab13', at: new Date(2099, 0, 1).getTime(), by: 'prowler' } as any)
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
    st.postOuts[pid] = { ...structuredClone(body), to, poOutcome: 'delete' }   // outside every command
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

/* ITEM C — his D2228: a filer who moved and is again an admin of the man's squadron is told (fix read 9's Q1 — Opus
   O9-2, Fable 3 and 3b, copied). Hunter files Ranger's LL 23–27 Jul on 15 Jul. A man's home rows are written as
   state/units.ts setHome saves them: [unit, from] in order, the first covering every day before it. */
describe("item C — D2228: a moved filer who is again an admin of the named man's squadron is told", () => {
  const IID = 'ipd-fr13c'
  const fileFor = (who: string, filer: string, date: string, endDate?: string) => expect(writeInputsBatch(() => { INPUTS.push({ person: who, date, ...(endDate ? { endDate } : {}), yr: 2026, allday: true, type: 'LL', remarks: 'for him', by: filer, at: Date.now(), iid: IID, ord: 99983 } as any) })).toBe(true)
  const rmk = (words: string) => expect(writeInputsBatch(() => { (INPUTS.find((x: any) => x.iid === IID) as any).remarks = words })).toBe(true)
  const homes = (pid: string, key: string, rows: [string, string][]) => {
    rows.forEach(([unit, from], i) => { mem['sqn142_' + HOME_PFX + key + i] = JSON.stringify({ id: key + i, pid, unit, from }) })
    unitsLoad()
  }
  const linesTo = (pid: string) => NOTICES.filter(n => n.to === pid && n.iid === IID)
  const shown = (pid: string, id: string) => noticesFor(pid).some(n => n.id === id)

  it("(F3) Hunter and Ranger both move to 149 on 16 Jul, Hunter an admin there: Kestrel's change on 17 Jul tells him; his 15 Jul line stays gone", () => {
    signInAs('ad2', 'a2'); fileFor('bane', 'prowler', 'Jul 23', 'Jul 27')
    signInAs('ad', 'a'); rmk('Saber on the 15th')
    const before = linesTo('prowler')
    expect(before.map(n => n.fu), 'told on the 15th as its filer, through his home 142').toEqual([['u142']])
    homes('prowler', 'hc', [['u142', '2026-07-15'], ['u149', '2026-07-16']])
    homes('bane', 'hr',[['u142', '2026-07-15'], ['u149', '2026-07-16']])
    on(17)
    expect(shown('prowler', before[0]!.id), 'the line from before his move left his bell on the move day (D2218)').toBe(false)
    signInAs('ad9', 'a9'); expect(updateAccount('acad2', { role: 'admin' }), 'setup (K3, D2160): he joined as a member — made an admin of his new squadron first').toBeNull(); rmk('Kestrel on the 17th')
    const now = linesTo('prowler').filter(n => n.id !== before[0]!.id)
    expect(now.map(n => n.fu), "Hunter, an admin of Ranger's squadron again, told — through 149").toEqual([['u149']])
    expect(shown('prowler', now[0]!.id), 'on his bell').toBe(true)
    expect(shown('prowler', before[0]!.id), 'nothing from before the move comes back').toBe(false)
  })
  it("(F3b) Hunter moves to 149 on 16 Jul and back to 142 on 18 Jul: Saber's change on 19 Jul tells him", () => {
    signInAs('ad2', 'a2'); fileFor('bane', 'prowler', 'Jul 23', 'Jul 27')
    homes('prowler', 'hc', [['u142', '2026-07-15'], ['u149', '2026-07-16'], ['u142', '2026-07-18']])
    on(19)
    signInAs('ad', 'a'); expect(updateAccount('acad2', { role: 'admin' }), 'setup (K3, D2160): he joined as a member — made an admin of his new squadron first').toBeNull(); rmk('Saber on the 19th')
    const l = linesTo('prowler')
    expect(l.map(n => n.fu), "Hunter, Ranger's admin again, told through 142").toEqual([['u142']])
    expect(shown('prowler', l[0]!.id)).toBe(true)
  })
  it('(O9-2) a Plan holder of 149 who moves into 149, its admin there: still told of the LL he filed for Osprey', () => {
    const inp = { person: 'osp9', date: 'Jul 25', yr: 2026, allday: true, type: 'LL', by: 'prowler', at: new Date(2026, 6, 15, 9).getTime(), iid: 'ipd-o92' }
    signInAs('ad', 'a'); expect(setGrant('acad2', 'u149', 'admin', 'prowler').ok).toBe(true)
    expect(filerVia('prowler', [inp]), 'told through Plan of 149 before his move').toEqual(['u149'])
    signInAs('ad', 'a'); const mv = setHome('prowler', 'u149'); expect(mv.ok, JSON.stringify(mv)).toBe(true)
    on(17)
    /* (§4.5 of the reshape plan, rewrite 2 — his D2243, Q4: the move deletes no row now; "his Plan went with his move"
       reads that no right of his holds on the 17th) */
    expect(grantsOf('acad2').filter(g => grantOfOn({ id: 'acad2', pid: 'prowler', pidFrom: undefined }, g.unit, '2026-07-17')?.id === g.id), 'his Plan went with his move (D2203)').toEqual([])
    signInAs('ad', 'a'); expect(updateAccount('acad2', { role: 'admin' }), 'setup (K3, D2160): he joined as a member — made an admin of his new squadron first').toBeNull()
    expect(filerVia('prowler', [inp]), "now 149's own admin — still Osprey's admin").toEqual(['u149'])
  })
  it("(control, D2223) Hunter moves to 149 alone, Ranger stays 142's: no admin of Ranger's squadron, not told", () => {
    signInAs('ad2', 'a2'); fileFor('bane', 'prowler', 'Jul 23', 'Jul 27')
    homes('prowler', 'hc', [['u142', '2026-07-15'], ['u149', '2026-07-16']])
    on(17)
    signInAs('ad', 'a'); rmk('Saber on the 17th')
    expect(linesTo('prowler'), 'a moved admin of another squadron is not told').toEqual([])
  })
  it('(control, D2223) Hunter moves to 149 with Ranger but is a member there: not told', () => {
    signInAs('ad2', 'a2'); fileFor('bane', 'prowler', 'Jul 23', 'Jul 27')
    homes('prowler', 'hc', [['u142', '2026-07-15'], ['u149', '2026-07-16']])
    homes('bane', 'hr',[['u142', '2026-07-15'], ['u149', '2026-07-16']])
    on(17)
    const acct = ACCOUNTS_LIST.find(a => a.pid === 'prowler') as any
    const was = acct.role
    acct.role = 'member'
    try {
      expect(filerVia('prowler', [INPUTS.find((x: any) => x.iid === IID)]), 'a moved member is told only through a right').toBeNull()
    } finally { acct.role = was }
  })
  it("(control, D2225) Hunter never moves; Ranger is 149's from 16 Jul, every day of the leave 149's: not told", () => {
    signInAs('ad2', 'a2'); fileFor('bane', 'prowler', 'Jul 23', 'Jul 27')
    homes('bane', 'hr',[['u142', '2026-07-15'], ['u149', '2026-07-16']])
    on(17)
    signInAs('ad9', 'a9'); rmk('Kestrel on the 17th')
    expect(linesTo('prowler'), "no day of the input still his squadron's").toEqual([])
  })
})

/* ITEM D (1) — Astra's lead: "a command can revive a deleted person" (D350: a delete is never undone; D290, D297: his
   row stays, marked deleted, never erased). Astra's own set-up copied: a person command that clears the mark. */
describe('item D (1) — a deleted person is never brought back by a command', () => {
  const forgeRestore = (pid: string, was: any) => commit({
    type: 'person.restore', scope: { module: 'people' },
    apply: (txn: any) => {
      resyncBeforeEnlist(); txn.enlist(peopleStore)
      Object.assign((PEOPLE as any)[pid], was)
      for (const k of ['deleted', 'deletedFrom', 'archived', 'archivedBy']) delete (PEOPLE as any)[pid][k]
      finishPeopleWrite()
    },
  } as any)
  it("(Astra) Kestrel deletes a 149 man, then a person command clears his delete mark: refused, he stays deleted", () => {
    signInAs('ad9', 'a9')
    const pid = Object.keys(PEOPLE).find(p => homeOn(p, rosterToday()) === 'u149' && !accountOfPid(p) && !(PEOPLE as any)[p].special && !(PEOPLE as any)[p].archived && !(PEOPLE as any)[p].deleted)!
    const was = structuredClone((PEOPLE as any)[pid])
    expect(deletePerson(pid), 'Kestrel deletes him').toBeNull()
    expect((PEOPLE as any)[pid].deleted).toBe(true)
    const r: any = forgeRestore(pid, was)
    expect({ ok: r.ok, deleted: !!(PEOPLE as any)[pid].deleted }, 'a deletion stays final').toEqual({ ok: false, deleted: true })
  })
  it('(the master too) Saber deletes a 142 man and clears the mark by a command: refused', () => {
    signInAs('ad', 'a')
    const was = structuredClone((PEOPLE as any).casper)
    expect(deletePerson('casper')).toBeNull()
    const r: any = forgeRestore('casper', was)
    expect({ ok: r.ok, deleted: !!(PEOPLE as any).casper.deleted }).toEqual({ ok: false, deleted: true })
  })
  it('(Undo, the app\'s own button) a Quals change, then his delete, then Undo: he stays deleted', () => {
    signInAs('ad', 'a')
    expect(updatePersonField('casper', { flight: 'B' })).toBeNull()
    expect(deletePerson('casper')).toBeNull()
    globalUndo(); globalUndo()
    expect(!!(PEOPLE as any).casper.deleted, 'no Undo takes a delete back (D350)').toBe(true)
  })
  it('(control) a person command on a man never deleted still saves', () => {
    signInAs('ad', 'a')
    expect(updatePersonField('casper', { flight: 'B' })).toBeNull()
    expect((PEOPLE as any).casper.flight).toBe('B')
  })
})

/* ITEM D (2) — Astra's lead: "the Leave War's dragged-selection remark editor omits an eligible filer's notification".
   Hunter places Ranger's LL approved on the war (he is its filer); Saber drags over its day and types new words — the
   drag window's own calls (leavewar/ui/SelectSheet.tsx keepWords), inside the one war command. */
describe("item D (2) — the drag window's remark tells the leave's filer, as its own window does", () => {
  const placeForRanger = () => {
    signInAs('ad2', 'a2')
    const old = new Set(INPUTS.map((r: any) => r.iid))
    expect(placeApproved([{ personId: 'bane', date: '2026-07-27' }], 'LL', { remarks: 'before' }).approved).toBe(1)
    const row: any = INPUTS.find((r: any) => !old.has(r.iid) && r.lw)
    expect(row.by, 'Hunter its filer').toBe('prowler')
    return row
  }
  const newLines = (ids: Set<string>, iid: string) => NOTICES.filter(n => !ids.has(n.id) && n.iid === iid)
  it("(drag window) Saber's words over Ranger's war-approved leave: Ranger and Hunter, its filer, both told", () => {
    const row = placeForRanger()
    signInAs('ad', 'a')
    const ids = new Set(NOTICES.map(n => n.id))
    let ok = false
    inOneWarCommand('lw.reqmeta', () => {
      setRemarksOn([{ personId: 'bane', date: '2026-07-27' }], { remarks: 'changed' })
      for (const r of leaveInputsAt('bane', '2026-07-27')) if ((r as any).lw) ok = setLeaveRemarks(r, 'changed', 'bane')
    })
    expect(ok).toBe(true)
    expect(row.remarks).toBe('changed')
    const sent = newLines(ids, String(row.iid))
    expect(sent.map(n => [n.to, n.fu ?? null]).sort(), 'the man, and its filer marked with his squadron').toEqual([['bane', null], ['prowler', ['u142']]])
  })
  it('(control) the same words from the leave\'s own window, outside a war command: both told', () => {
    const row = placeForRanger()
    signInAs('ad', 'a')
    const ids = new Set(NOTICES.map(n => n.id))
    expect(setLeaveRemarks(row, 'changed', 'bane')).toBe(true)
    expect(newLines(ids, String(row.iid)).map(n => n.to).sort()).toEqual(['bane', 'prowler'])
  })
  it('(control) Hunter changes the words himself in the drag window: Ranger told, Hunter never told of his own act', () => {
    const row = placeForRanger()
    const ids = new Set(NOTICES.map(n => n.id))
    inOneWarCommand('lw.reqmeta', () => { for (const r of leaveInputsAt('bane', '2026-07-27')) if ((r as any).lw) setLeaveRemarks(r, 'his words', 'bane') })
    expect(newLines(ids, String(row.iid)).map(n => n.to)).toEqual(['bane'])
  })
})
