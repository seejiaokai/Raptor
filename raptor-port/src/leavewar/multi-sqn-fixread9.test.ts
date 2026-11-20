// @vitest-environment jsdom
/* Fix read 9 (19–20 Nov 26) — the faults the readers found in fix read 8's code (the builder's brief:
   docs/superpowers/briefs/2026-11-19-multi-sqn-b1-fixread9-fixes-brief.md). Each describe is one fault, red first on the
   code the readers read (ae1af3806). Hunter (142's plain admin, `ad2`) files LL for Ranger (142, `us`) on 15 Jul; Saber
   is the master (`ad`); Kestrel and Osprey are 149's (`ad9`, `us9`); Outlaw (`casper`) a 142 man. Harness as
   leavewar/multi-sqn-fixread8.test.ts. */
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { storeBackend, HOOKS, store as settingsStore } from '../engine/hooks'
import { PEOPLE, indexCallsigns } from '../engine/people'
import { initStore as raptorInitStore, notify as raptorNotify, resetSession, writeInputsBatch } from '../state/store'
import { accountsLoad, signIn, sessionFor, setMaster, updateAccount, ACCOUNTS_LIST } from '../state/accounts'
import { initStore as lwInitStore, setPeople, setCell, setBidState, holidayAdd } from './state/store'
import { commitInput, draftOf } from '../ui/inputedit'
import { ownershipViolation } from '../state/perms'
import { deriveActor } from '../command/actor'
import { memoryBackend } from './state/storage'
import { projectPeople } from './state/raptorRoster'
import { wireLeaveWarSync, setWarWorldDoor, postOut, undoPostOut } from './sync'
import { unitsLoad, setGrant, removeGrant, addUnit, unitRows, grantOfOn } from '../state/units'
import { HOME_PFX, GRANT_PFX } from '../state/units-model'
import { INPUTS } from '../engine/inputs'
import { NOTICES, noticesFor, noticeLeftBell, noticeHoliday, type Notice } from '../state/notices'
import { setConflictChecker, onCommit } from '../command'
import { noticeSeenLoad } from '../state/noticeseen'
import { installGlobalUndo } from '../state/undo-wire'
import { _resetTimeline, globalRedo } from '../undo/timeline'
import { globalUndo } from '../undo'
import { deletePerson } from '../state/person-delete'
import { addRosterPerson } from '../state/roster-add'
import { commitSettingsIntent } from '../state/people-settings-commit'

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

const IID = 'ipd-fr9'
const fileFor = (who: string, filer: string, date = 'Jul 25', endDate?: string) => expect(writeInputsBatch(() => { INPUTS.push({ person: who, date, ...(endDate ? { endDate } : {}), yr: 2026, allday: true, type: 'LL', remarks: 'for him', by: filer, at: Date.now(), iid: IID, ord: 99981 } as any) })).toBe(true)
const rmk = (words: string) => expect(writeInputsBatch(() => { (INPUTS.find((x: any) => x.iid === IID) as any).remarks = words })).toBe(true)
const theInput = () => INPUTS.find((x: any) => x.iid === IID) as any
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
/* Ranger (142 member) files a Training for Ace (142) — the input a bare write then touches */
const aceTraining = () => { signInAs('us', 'us'); expect(writeInputsBatch(() => { INPUTS.push({ person: 'dj', date: 'Jul 25', yr: 2026, s: '09:00', e: '10:00', type: 'Training', remarks: 'for Ace', by: 'bane', at: Date.now(), iid: IID, ord: 99981 } as any) })).toBe(true) }
/* the seeded account row: an Undo of its first stored write removes the row (seed mode only), so read it softly */
const hunterAcct = (): any => ACCOUNTS_LIST.find(a => a.id === 'acad2') ?? {}

describe('fault A — an Undo or Redo that turns a right on dates it today (his D2218, D2223; Fable 1, Opus O9-2)', () => {
  it('(Fable F1) the mark set and undone on 15 Jul, Hunter moves 16 Jul, Redo on 17 Jul: dated the 17th, the retired line stays off', () => {
    const l = hunterLine()
    signInAs('ad', 'a'); expect(setMaster('acad2', true).ok).toBe(true)
    expect(globalUndo().ok, 'Undo of the mark').toBe(true)
    expect(hunterAcct().master).not.toBe(true)
    hunterMovesOn16(); on(17)
    expect(shown('prowler', l.id), 'retired by his move').toBe(false)
    const r = globalRedo(); expect(r.ok, 'Redo of the mark: ' + JSON.stringify(r)).toBe(true)
    expect(hunterAcct().master).toBe(true)
    expect(hunterAcct().masterFrom, 'the mark given back today is dated today').toBe('2026-07-17')
    expect(shown('prowler', l.id), 'a mark given back on the 17th must not bring the retired line back (D2218)').toBe(false)
  })
  it('(Fable F1b) the mark on, then off, on 15 Jul; Hunter moves; the Undo of taking it off on 17 Jul: the line stays off', () => {
    signInAs('ad', 'a'); expect(setMaster('acad2', true).ok).toBe(true)
    const l = hunterLine()
    signInAs('ad', 'a'); expect(setMaster('acad2', false).ok).toBe(true)
    hunterMovesOn16(); on(17)
    expect(shown('prowler', l.id), 'retired by his move').toBe(false)
    const u = globalUndo(); expect(u.ok, 'Undo of taking the mark off: ' + JSON.stringify(u)).toBe(true)
    expect(hunterAcct().master).toBe(true)
    expect(shown('prowler', l.id), 'still off (D2218)').toBe(false)
  })
  it('(Opus O9-2) the mark set and taken off on 15 Jul, Hunter moves, Saber undoes the taking-off on 18 Jul: dated the 18th, the line stays off', () => {
    const l = hunterLine()
    signInAs('ad', 'a')
    expect(setMaster('acad2', true).ok).toBe(true)
    expect(setMaster('acad2', false).ok).toBe(true)
    hunterMovesOn16(); on(18)
    expect(shown('prowler', l.id)).toBe(false)
    const r = globalUndo(); expect(r.ok, JSON.stringify(r)).toBe(true)
    expect(hunterAcct().master, 'the mark is back').toBe(true)
    expect(hunterAcct().masterFrom).toBe('2026-07-18')
    expect(shown('prowler', l.id), 'he held no mark on his move day — the line stays retired (fault D)').toBe(false)
  })
  /* (§4.5 of the reshape plan, rewrite 8 — guardrail 2: the Undo of the removal after his move puts nothing back that
     holds; "the line stays retired" kept. Until helper "undo & roles" wires the leave-out the press writes the recorded
     row, which holds nothing; the step's blocked words are that helper's test) */
  it('(a grant) Plan of 149 given and removed on 15 Jul, Hunter moves to a third squadron on 16 Jul, the Undo of the removal on 17 Jul: nothing of 149 holds, the line stays off', () => {
    signInAs('ad', 'a'); const u150 = addUnit('150', 'p1', 'acad9' /* a bystander first admin — §9.2, Piece C */); expect(u150.ok, JSON.stringify(u150)).toBe(true)
    signInAs('ad', 'a'); expect(setGrant('acad2', 'u149', 'admin', 'prowler').ok).toBe(true)
    signInAs('ad2', 'a2'); fileFor('osp9', 'prowler')
    signInAs('ad', 'a'); rmk('changed by Saber on the 15th')
    const l = lineTo('prowler')!
    expect(l?.fu, 'Hunter told through Plan of 149').toEqual(['u149'])
    expect(removeGrant('acad2', 'u149').ok).toBe(true)
    homes('prowler', 'hc', [['u142', '2026-07-15'], [String((u150 as any).id), '2026-07-16']]); on(17)
    expect(shown('prowler', l.id), 'retired by his move: no Plan of 149 on the 16th').toBe(false)
    globalUndo(); unitsLoad()
    expect(grantOfOn({ id: 'acad2', pid: 'prowler', pidFrom: undefined }, 'u149', '2026-07-17'), 'nothing of 149 holds for him after his move').toBeUndefined()
    expect(shown('prowler', l.id), 'the line stays retired').toBe(false)
  })
  it('(control) an Undo that leaves the mark on keeps its day', () => {
    signInAs('ad', 'a'); expect(setMaster('acad2', true).ok).toBe(true)
    expect(updateAccount('acad2', { name: 'ad2x' })).toBeNull()
    on(17)
    const u = globalUndo(); expect(u.ok, 'Undo of the rename: ' + JSON.stringify(u)).toBe(true)
    expect(hunterAcct().name).toBe('ad2')
    expect(hunterAcct().masterFrom, 'the mark stood throughout: its own day').toBe('2026-07-15')
  })
  it('(control) a fresh setMaster and setGrant are dated today, as before', () => {
    hunterMovesOn16(); on(18)
    signInAs('ad', 'a')
    expect(setGrant('acad2', 'u142', 'admin', 'prowler').ok).toBe(true)
    expect(unitRows().grants.find(g => g.account === 'acad2')?.from).toBe('2026-07-18')
    expect(setMaster('acad2', true).ok).toBe(true)
    expect(hunterAcct().masterFrom).toBe('2026-07-18')
  })
})

describe('fault B — every command that brings the scheduler up to memory before enlisting takes the bell’s image again (Opus O9-1, Fable 2)', () => {
  const newby = () => {
    expect(addRosterPerson({ cs: 'Newby', ini: '', seat: 'FCP', cat: 'C' } as any, '2026-07-20')).toBeNull()
    raptorNotify()
    return Object.keys(PEOPLE).find(k => (PEOPLE as any)[k].cs === 'Newby' && !(PEOPLE as any)[k].deleted)!
  }
  it('(Fable F2) after a bare write, Saber’s Delete of Outlaw (unrelated) saves and tells nobody of the bare write', () => {
    aceTraining(); signInAs('ad', 'a')
    ;(theInput() as any).remarks = 'bare words'                 // outside every command
    expect(deletePerson('casper'), 'the delete saves').toBeNull()
    expect(NOTICES.filter(n => n.iid === IID && n.what.some((p: any) => p.k === 'rmk')).length, 'nobody told of the bare write').toBe(0)
  })
  it('(Opus O9-1) after a bare write, the delete of Newby saves, and no line about the bare-written input rides it', () => {
    aceTraining(); signInAs('ad', 'a')
    const id = newby()
    const seen: any[] = []; const off = onCommit((e: any) => { seen.push(e) })
    ;(theInput() as any).remarks = 'bare words'                  // outside every command
    let r: string | null = 'not run'
    try { r = deletePerson(id) } finally { off() }
    expect(r, 'the delete of Newby').toBeNull()
    const lines = seen.flatMap(e => e.changes).filter((c: any) => c.collection === 'notices' && c.after?.iid === IID)
    expect(lines.length, 'no line about the bare write').toBe(0)
  })
  it('(Opus O9-1) after a bare write, the posting sheet’s Undo post out goes through, no line about the bare write in it', () => {
    aceTraining(); signInAs('ad', 'a')
    expect(postOut('casper', '2026-07-15', 'overseas')).toBe(true)
    raptorNotify()
    ;(theInput() as any).remarks = 'bare words'                  // outside every command
    let captured: any[] = []
    setConflictChecker((ch) => { if (ch.some((c: any) => c.collection === 'notices')) captured = ch; return null })
    let ok: boolean | string = 'not run'
    try { ok = undoPostOut('casper') } finally { setConflictChecker(null) }
    expect(ok, 'Undo post out goes through').toBe(true)
    expect(captured.find((c: any) => c.collection === 'notices' && c.after?.iid === IID) ?? null, 'a line about the bare write').toBeNull()
  })
  it('(control) with no bare write: the delete of Outlaw, the delete of Newby and Undo post out save', () => {
    aceTraining(); signInAs('ad', 'a')
    expect(deletePerson(newby())).toBeNull()
    expect(postOut('casper', '2026-07-15', 'overseas')).toBe(true)
    raptorNotify()
    expect(undoPostOut('casper')).toBe(true)
    expect(deletePerson('casper')).toBeNull()
  })
})

describe('fault C — a right that changes hands keeps no old day (SEC9-1)', () => {
  const kestrelPlan = () => {
    signInAs('ad', 'a'); expect(setGrant('acad9', 'u142', 'admin', 'kes9').ok).toBe(true)
    const g: any = { ...unitRows().grants.find(x => x.account === 'acad9' && x.unit === 'u142')! }
    expect(g.from).toBe('2026-07-15')
    return g
  }
  it('(SEC9-1, the gate) Kestrel’s Plan of 142 re-pointed to Hunter, its 15 Jul day kept: refused', () => {
    const l = hunterLine(); const g = kestrelPlan()
    outlawReal(); hunterMovesOn16(); on(18)
    expect(shown('prowler', l.id), 'retired by his move').toBe(false)
    const after = { ...g, account: 'acad2' }
    const v = ownershipViolation(asOutlaw([{ collection: 'settings', id: GRANT_PFX + g.id, op: 'put', before: g, after }], 'grant.set')) ?? 'allowed'
    expect(v, 'a right re-pointed must be dated today').toMatch(/not dated today/)
    /* (control) …dated today, a plain admin is now refused all the same: Plan is a master admin's to give or pass on
       (D2199, D2211 — the Plan audit's PA1; §9.3 of the reshape plan, rewritten to the ruling's outcome) */
    expect(ownershipViolation(asOutlaw([{ collection: 'settings', id: GRANT_PFX + g.id, op: 'put', before: g, after: { ...after, from: '2026-07-18' } }], 'grant.set'))).toMatch(/Plan given, changed or taken by one who is not a master admin/)
  })
  it('(SEC9-1, end to end) Outlaw, signed in, re-points it through a real command: refused, the line stays off', () => {
    const l = hunterLine(); const g = kestrelPlan()
    outlawReal(); hunterMovesOn16(); on(18)
    signInAs('outlaw', 'x')
    const r: any = commitSettingsIntent('grant.set', null, () => { settingsStore.set(GRANT_PFX + g.id, { ...g, account: 'acad2' }) })
    unitsLoad()
    expect({ ok: r.ok, from: unitRows().grants.find(x => x.account === 'acad2')?.from, back: shown('prowler', l.id) })
      .toEqual({ ok: false, from: undefined, back: false })
  })
  it('(the master mark) a mark moved to another man by changing the row’s person keeps no old day', () => {
    signInAs('ad', 'a'); expect(setMaster('acad2', true).ok).toBe(true)
    on(18)
    const b = { ...hunterAcct() }
    const e = { type: 'account.update', origin: 'user', actor: deriveActor(), changes: [{ collection: 'settings', id: 'account:acad2', op: 'put', before: b, after: { ...b, pid: 'dj' } }] }
    expect(ownershipViolation(e as any) ?? 'allowed').toMatch(/not dated today/)
  })
})

describe('fault D — a war line only from the war’s own writers (SEC9-2; data-model §11)', () => {
  const lwLine = (id: string, what: any[]) => ({ id, to: 'prowler', by: 'casper', at: Date.now(), iid: '', name: '149: report to Kestrel 0600 Sat', day: '2026-07-25', what })
  it('(SEC9-2, the gate) Outlaw’s own words as a war line to Hunter: refused — an `lw`, a `po` and an `lwback` line', () => {
    hunterMovesOn16(); outlawReal(); on(15, 10)
    expect(ownershipViolation(asOutlaw([put(lwLine('nfr9-lw', [{ k: 'lw', code: 'LL', d: 'refused' }]))])) ?? 'allowed').toMatch(/war line/)
    expect(ownershipViolation(asOutlaw([put(lwLine('nfr9-po', [{ k: 'po', who: 'prowler', o: 'overseas' }]))])) ?? 'allowed').toMatch(/war line/)
    expect(ownershipViolation(asOutlaw([put(lwLine('nfr9-bk', [{ k: 'lwback', a: '2026-07-25', b: '2026-07-25', d: 'approved', ref: 'nx' }]))])) ?? 'allowed').toMatch(/war line/)
  })
  it('(SEC9-2, end to end) Outlaw, signed in, saves that line with an ordinary input command: not saved, not on Hunter’s 149 bell', () => {
    hunterMovesOn16(); outlawReal(); on(15, 10)
    signInAs('outlaw', 'x')
    const n: any = lwLine('nfr9-lw2', [{ k: 'lw', code: 'LL', d: 'refused' }])
    const ok = writeInputsBatch(() => { NOTICES.push(n) })
    on(17)
    expect({ saved: ok && NOTICES.some(x => x.id === n.id), shownOn17: shown('prowler', n.id) }).toEqual({ saved: false, shownOn17: false })
  })
  it('(control) a real decision on Ranger’s leave tells him, and its Undo and Redo go through', () => {
    signInAs('ad', 'a')
    expect(setCell('bane', '2026-07-25', 'LL')).toBe(true)
    setBidState('bane', '2026-07-25', 'approved')
    const l = NOTICES.find(n => n.to === 'bane' && (n.what[0] as any)?.k === 'lw')
    expect(l, 'Ranger told of the decision').toBeDefined()
    const u = globalUndo(); expect(u.ok, 'Undo: ' + JSON.stringify(u)).toBe(true)
    const r = globalRedo(); expect(r.ok, 'Redo: ' + JSON.stringify(r)).toBe(true)
  })
  it('(control) a real posting today tells the admins, and its Undo post out takes it back', () => {
    signInAs('ad', 'a')
    expect(postOut('casper', '2026-07-15', 'overseas')).toBe(true)
    expect(NOTICES.some(n => (n.what[0] as any)?.k === 'po' && (n.what[0] as any).who === 'casper'), 'the posting’s lines').toBe(true)
    raptorNotify()
    expect(undoPostOut('casper')).toBe(true)
  })
})

describe('fault E — another squadron’s holiday line is not deleted or rewritten (SEC9-3)', () => {
  const hol: any = { id: 'nfr9-hol', to: 'kes9', by: 'kes9', at: new Date(2026, 6, 15, 9).getTime(), iid: '', name: 'National Day', day: '2026-08-09', what: [{ k: 'oilhol', a: '2026-08-09', b: '2026-08-09' }] }
  it('(SEC9-3) Outlaw (142) deletes the holiday line on Kestrel’s (149) bell: refused', () => {
    outlawReal()
    expect(ownershipViolation(asOutlaw([{ collection: 'notices', id: hol.id, op: 'delete', before: hol }])) ?? 'allowed').toMatch(/another squadron/)
  })
  for (const [field, val] of [['what', [{ k: 'oilhol', a: '2026-08-10', b: '2026-08-10' }]], ['name', '142 words'], ['by', 'casper']] as const) {
    it(`(SEC9-3) …nor rewrites its ${field}`, () => {
      outlawReal()
      expect(ownershipViolation(asOutlaw([{ collection: 'notices', id: hol.id, op: 'put', before: hol, after: { ...hol, [field]: val } }])) ?? 'allowed').toMatch(/another squadron/)
    })
  }
  it('(control) a new line in the holiday’s shape that noticeHoliday did not mint in the command takes the ordinary checks (fix read 10, fault B)', () => {
    /* (the app's own line, minted by noticeHoliday, still passes to both squadrons: the control below, through Outlaw's
       real command) */
    const n: any = { ...hol, id: 'nfr9-holok', by: 'casper', at: Date.now() }
    expect(ownershipViolation(asOutlaw([put(n)])) ?? 'allowed').toMatch(/another squadron/)
    expect(ownershipViolation(asOutlaw([put({ ...n, id: 'nfr9-holok2', to: 'prowler' })])) ?? 'allowed').toMatch(/a war line no war command wrote/)
  })
  /* (through the Holidays list's own door since fix read 11, fault C: a bare noticeHoliday in an input command no longer
     passes as the holiday's own — only the command that makes the holiday owes its line) */
  it('(control) the app\'s own holiday line to both squadrons, written by Outlaw\'s real command: his Undo takes both away, his Redo puts them back', () => {
    outlawReal()
    const fileOn = (pid: string, filer: [string, string], title: string) => {
      signInAs(filer[0], filer[1])
      expect(commitInput(null, draftOf({ person: pid, type: 'Training', title, date: 'Jul 17', yr: 2026, allday: false, s: 540, e: 720, remarks: '' } as any), [pid]), 'filed: ' + title).toBe(true)
    }
    fileOn('osp9', ['ad9', 'a9'], 'Range 149')
    fileOn('bane', ['ad2', 'a2'], 'Range 142')
    signInAs('outlaw', 'x')
    expect(holidayAdd({ kind: 'ph', name: 'National Day', from: '2026-07-17', to: '2026-07-17' }).ok).toBe(true)
    const mine = () => NOTICES.filter(x => x.name === 'National Day' && x.by === 'casper').map(x => x.to).sort()
    const told = mine()
    expect(told).toEqual(expect.arrayContaining(['kes9', 'prowler']))
    const u = globalUndo(); expect(u.ok, 'Undo: ' + JSON.stringify(u)).toBe(true)
    expect(mine()).toEqual([])
    const r = globalRedo(); expect(r.ok, 'Redo: ' + JSON.stringify(r)).toBe(true)
    expect(mine()).toEqual(told)
  })
})

describe('fault F — a line dated a few minutes ahead is read as written today (Opus O9-4, Fable 4)', () => {
  it('(Fable F4) a 149 bidding line to moved Hunter, 10 minutes ahead on 20 Jul, stays on his bell', () => {
    hunterMovesOn16(); on(20)
    const open: any = { id: 'ny', to: 'prowler', by: 'kes9', at: Date.now() + 10 * 60 * 1000, iid: '', name: 'JAN - DEC 26', day: '2026-07-25', what: [{ k: 'lwopen', a: '2026-08-01', b: '2026-08-31' }] }
    expect(noticeLeftBell(open), 'a 149 bidding line, written after his move').toBe(false)
  })
  it('(Opus O9-4) a 149 line written on 18 Jul, the clock 10 minutes behind it, stays; 4 minutes too', () => {
    hunterMovesOn16(); on(18)
    const mk = (min: number): any => ({ id: 'n-o94-' + min, to: 'prowler', by: 'kes9', at: new Date(2026, 6, 18, 9, min).getTime(), iid: '', name: '', day: '2026-08-01', what: [{ k: 'lwopen', a: '2026-08-01', b: '2026-08-31', open: true }] })
    expect(noticeLeftBell(mk(4)), 'control: 4 minutes ahead stays').toBe(false)
    expect(noticeLeftBell(mk(10)), 'written after his move, in his new squadron — no move retires it (D2218)').toBe(false)
  })
  it('(control) a line of his old squadron’s dated more than a day ahead still leaves on his move', () => {
    hunterMovesOn16(); on(18)
    const n: any = { id: 'nz2', to: 'prowler', by: 'stiff', at: Date.now() + 2 * 24 * 3600 * 1000, iid: '', name: '', day: '2026-08-01', what: [{ k: 'lwopen', a: '2026-08-01', b: '2026-08-31', open: true }] }
    expect(noticeLeftBell(n)).toBe(true)
  })
})
