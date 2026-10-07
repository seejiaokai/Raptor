/* AN INPUT FILED FOR ANOTHER MAN — what a member's command may really change, and his Undo of it (owner D654, D655,
   D658, D660 — 7 Oct 26; the build plan docs/superpowers/plans/2026-10-07-inputs-sans-redesign-plan.md §3.13, "The
   commit gate" and "Undo and Redo").

   Every case goes through the REAL route — the door, the command, the check on what the command changed, the one Undo —
   over both wired stores, never the rule called by hand (that half is state/perms.test.ts). `raw` is a hand-made
   call: it writes the list directly inside an input command, which is what the commit gate exists to judge.

   Runs in the Leave War project: which days ask the OIL question is the war's to say. Ranger (`bane`), Hex (`rocky`)
   and Outlaw (`casper`) are members; Saber (`stiff`) is the admin. 10 Feb 26 is a Tuesday, 14 and 15 Feb a weekend. */
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { storeBackend, HOOKS } from '../engine/hooks'
import { PEOPLE, indexCallsigns } from '../engine/people'
import { INPUTS, dateOrd, nowStamp } from '../engine/inputs'
import { initStore as raptorInitStore, notify as raptorNotify, resetSession, switchRoleView, writeInputs } from '../state/store'
import { accountsLoad, signIn, sessionFor } from '../state/accounts'
import { setMembersFile } from '../state/memberfile'
import { installGlobalUndo } from '../state/undo-wire'
import { schedStore, resyncSchedBaseline } from '../state/sched-commit'
import { commit } from '../command'
import { globalUndo, globalRedo } from '../undo'
import { _resetTimeline } from '../undo/timeline'
import { commitNewInput, commitInputEdit, draftOf, removeInput } from '../ui/inputedit'
import { initStore as lwInitStore, lwHistInit, setPeople } from './state/store'
import { memoryBackend } from './state/storage'
import { projectPeople } from './state/raptorRoster'
import { wireLeaveWarSync } from './sync'

const mem: Record<string, string> = {}
let PEOPLE0 = ''
const ISNAP = JSON.stringify(INPUTS)
const toast = HOOKS.toast
let said: string[] = []

const T = (h: number, day = 15): number => { const d = new Date(2026, 0, day, h, 0, 0); vi.setSystemTime(d); return d.getTime() }
const signInAs = (name: string, pass = 'x') => { resetSession(sessionFor(signIn(name, pass))); raptorNotify() }
const saber = () => signInAs('ad', 'a')        // the admin — person `stiff`
const ranger = () => signInAs('us', 'us')      // a member — person `bane`
const hex = () => signInAs('hex')              // a member — person `rocky`
const outlaw = () => signInAs('outlaw')        // a member — person `casper`
const switchOff = () => { saber(); expect(setMembersFile(false).ok).toBe(true) }
const switchOn = () => { saber(); expect(setMembersFile(true).ok).toBe(true) }
/* the switch flipped by an admin ELSEWHERE - the signed-in person stays signed in, so his Undo steps are kept (they
   clear at a sign-out, D148): the stored setting itself, which every question reads live */
const flipElsewhere = (on: boolean) => { if (on) delete mem['sqn142_memberfile']; else mem['sqn142_memberfile'] = 'false' }

const SAT = '2026-02-14', SUN = '2026-02-15', TUE = '2026-02-10'
const mine = (p: string, type = 'Meeting', mon = 'Feb') => INPUTS.filter((r: any) => r.person === p && r.type === type && String(r.date).startsWith(mon))
  .sort((a: any, b: any) => (dateOrd(a.date, a.yr) as number) - (dateOrd(b.date, b.yr) as number))
const one = (p: string, type = 'Meeting', mon = 'Feb') => { const l = mine(p, type, mon); expect(l, `${p} has one ${type}`).toHaveLength(1); return l[0] }
const none = (p: string, type = 'Meeting') => expect(mine(p, type), `${p} has no ${type}`).toHaveLength(0)
/* the editor's own save for a new input: a timed hour, 09:00 to 10:00 */
const add = (person: string, type: string, iso: string, end = '', extra: Record<string, any> = {}) => commitNewInput({
  person, type, allday: false, half: '', start: iso, end, sTime: '09:00', eTime: '10:00', remarks: '', sans: null, docIds: [], ...extra,
})
const edit = (r: any, patch: Record<string, any>) => commitInputEdit(r, { ...draftOf(r), ...patch })
/* a record as a hand-made call would write it */
let seq = 0
const rec = (person: string, o: Record<string, any> = {}) => ({
  iid: `zz${++seq}`, person, type: 'Meeting', date: 'Feb 10', yr: 2026, allday: false, s: 540, e: 600, remarks: '', mod: nowStamp(), ...o,
})
const raw = (fn: () => void): boolean => writeInputs(fn)
const has = (iid: string) => INPUTS.some((r: any) => r.iid === iid)
const byId = (iid: string) => INPUTS.find((r: any) => r.iid === iid) as any
const copy = (r: any) => JSON.parse(JSON.stringify(r))
/* a hand-made change to ONE record, found afresh each time: a refused command puts the list back as new objects */
const chg = (iid: string, fn: (r: any) => void): boolean => raw(() => { fn(byId(iid)) })
const drop = (iid: string): boolean => raw(() => { INPUTS.splice(INPUTS.findIndex((r: any) => r.iid === iid), 1) })

beforeAll(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  PEOPLE0 = JSON.stringify(PEOPLE)
})
afterAll(() => { vi.useRealTimers(); storeBackend.impl = null })
beforeEach(() => {
  T(8)
  Object.keys(mem).forEach(k => delete mem[k])
  storeBackend.impl = { getItem: (k: string) => (k in mem ? mem[k]! : null), setItem: (k: string, v: string) => { if (v === 'null') delete mem[k]; else mem[k] = v }, keys: () => Object.keys(mem) } as any
  const p0 = JSON.parse(PEOPLE0)
  for (const k of Object.keys(PEOPLE)) delete (PEOPLE as any)[k]
  Object.assign(PEOPLE, p0); indexCallsigns()
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
  lwInitStore(memoryBackend())
  raptorInitStore()
  accountsLoad()
  setPeople(projectPeople())
  wireLeaveWarSync()
  _resetTimeline(); lwHistInit(); installGlobalUndo()
  said = []; HOOKS.toast = (m: any) => { said.push(String(m)) }
  saber()
})
afterEach(() => { HOOKS.toast = toast; _resetTimeline(); resetSession(null) })

describe('a member files for another man — a duty or a commitment, and nothing else (D655, D658)', () => {
  it('a Meeting for another man is filed: his record, placed by the filer', () => {
    ranger()
    const t = T(9)
    expect(add('rocky', 'Meeting', TUE)).toBe(true)
    const r = one('rocky')
    expect(r).toMatchObject({ person: 'rocky', by: 'bane', at: t, modBy: 'bane', modAt: t })
    none('bane')
  })
  it('a leave, each medical kind, an upchit and a SANS availability are refused — with a sentence, nothing written, nothing re-pointed at himself', () => {
    ranger()
    const n = INPUTS.length
    for (const type of ['LL', 'OL', 'ATT C', 'ATT B', 'OML', 'HL', 'Upchit']) {
      said = []
      expect(add('rocky', type, TUE, '', { allday: true }), type).toBe(false)
      expect(said.join(' '), type).toMatch(/only for yourself/)
    }
    said = []
    expect(add('vinci', 'SANS Availability', TUE, '', { allday: true, sans: { f: true } })).toBe(false)
    expect(said.join(' ')).toMatch(/only for yourself/)
    expect(INPUTS.length, 'nothing was filed for him instead').toBe(n)
  })
  it('the same by a hand-made call is rolled back by the check on what the command changed', () => {
    ranger()
    for (const type of ['LL', 'ATT C', 'Upchit', 'SANS Availability', 'no such kind']) {
      const r = rec('rocky', { type, by: 'bane', at: 1, modBy: 'bane', modAt: 1 })
      expect(raw(() => { INPUTS.unshift(r) }), type).toBe(false)
      expect(has(r.iid), type).toBe(false)
    }
    const ok = rec('rocky', { by: 'bane', at: 1, modBy: 'bane', modAt: 1 })
    expect(raw(() => { INPUTS.unshift(ok) })).toBe(true)
    expect(has(ok.iid)).toBe(true)
  })
  it('his own input is his as before: any kind, by any door', () => {
    ranger()
    expect(add('bane', 'LL', TUE, '', { allday: true })).toBe(true)
    expect(add('bane', 'Meeting', '2026-02-11')).toBe(true)
    expect(edit(one('bane'), { remarks: 'moved to the crew room' })).toBe(true)
    expect(removeInput(one('bane'))).toBe(true)
  })
  it('with the switch OFF he files for himself only — and what he had filed for another man is no longer his to change', () => {
    ranger()
    expect(add('rocky', 'Meeting', TUE)).toBe(true)
    const id = one('rocky').iid, was = copy(one('rocky'))
    switchOff()
    ranger()
    said = []
    expect(add('rocky', 'Meeting', '2026-02-11')).toBe(false)
    expect(said.join(' ')).toMatch(/switched off/)
    expect(edit(byId(id), { remarks: 'x' }), 'the door').toBe(false)
    expect(removeInput(byId(id)), 'the door').toBe(false)
    expect(chg(id, r => { r.remarks = 'x' }), 'a hand-made change').toBe(false)
    expect(drop(id), 'a hand-made delete').toBe(false)
    expect(copy(one('rocky')), 'nothing already filed is removed or altered').toEqual(was)
    hex()
    expect(edit(one('rocky'), { remarks: 'mine now' }), 'the man still changes it').toBe(true)
    saber()
    expect(removeInput(one('rocky')), 'and an admin').toBe(true)
  })
  it('he changes and deletes what he filed', () => {
    ranger()
    add('rocky', 'Meeting', TUE)
    const r = one('rocky')
    T(10)
    expect(edit(r, { sTime: '13:00', eTime: '14:00', remarks: 'afternoon' })).toBe(true)
    expect(one('rocky')).toMatchObject({ s: 780, e: 840, remarks: 'afternoon', by: 'bane', modBy: 'bane' })
    expect(removeInput(one('rocky'))).toBe(true)
    none('rocky')
  })
  it('a record he did not file is not his: filed by an admin, by another member, or before filers were recorded', () => {
    add('rocky', 'Meeting', TUE)                         // Saber files it
    outlaw(); add('rocky', 'Meeting', '2026-02-11')     // Outlaw files another
    saber(); const old = rec('rocky', { date: 'Feb 12' }); raw(() => { INPUTS.unshift(old) })   // no `by` at all
    ranger()
    for (const { iid, date } of mine('rocky').map((r: any) => ({ iid: r.iid, date: r.date }))) {
      const was = copy(byId(iid))
      expect(edit(byId(iid), { remarks: 'x' }), `the door — ${date}`).toBe(false)
      expect(removeInput(byId(iid)), `the door — ${date}`).toBe(false)
      expect(chg(iid, r => { r.remarks = 'x' }), `a hand-made change — ${date}`).toBe(false)
      expect(drop(iid), `a hand-made delete — ${date}`).toBe(false)
      expect(copy(byId(iid))).toEqual(was)
    }
    hex()
    expect(edit(byId(old.iid), { remarks: 'the man himself' }), 'no filer recorded: the man').toBe(true)
  })
  it('he cannot retype what he filed to a leave, nor move it to another man', () => {
    ranger()
    add('rocky', 'Meeting', TUE)
    const id = one('rocky').iid, was = copy(one('rocky'))
    said = []
    expect(edit(byId(id), { type: 'LL', allday: true }), 'the door: a leave').toBe(false)
    expect(said.join(' ')).toMatch(/only for yourself/)
    expect(edit(byId(id), { person: 'casper' }), 'the door: another man').toBe(false)
    expect(chg(id, r => { r.type = 'LL' }), 'a hand-made retype').toBe(false)
    expect(chg(id, r => { r.person = 'casper' }), 'a hand-made move').toBe(false)
    expect(chg(id, r => { r.person = 'bane' }), 'not even onto himself — a move is a scheduler\'s').toBe(false)
    expect(copy(one('rocky'))).toEqual(was)
  })
  it('a guest, a pending person and an account switched off change nothing', () => {
    for (const s of [{ user: 'principal:g', role: 'guest', pid: null, name: 'g' }, { user: 'principal:p', role: 'pending', pid: null, name: 'p' }, { user: 'principal:o', role: 'off', pid: null, name: 'o' }]) {
      resetSession(s as any)
      const r = rec('rocky', { by: 'bane' })
      expect(raw(() => { INPUTS.unshift(r) }), s.role).toBe(false)
      expect(has(r.iid), s.role).toBe(false)
      expect(add('rocky', 'Meeting', TUE), s.role).toBe(false)
    }
    none('rocky')
  })
  it('the admin\'s member view is judged as a member', () => {
    switchRoleView()
    expect(add('rocky', 'LL', TUE, '', { allday: true })).toBe(false)
    expect(add('rocky', 'Meeting', TUE)).toBe(true)
    expect(one('rocky').by).toBe('stiff')
    switchRoleView()
    expect(add('rocky', 'LL', '2026-02-17', '', { allday: true })).toBe(true)
  })
})

describe('who placed it is never forged — on his own records too, with the switch on or off (the plan\'s finding G2)', () => {
  for (const on of [true, false]) {
    it(`a record he creates names him as its filer, or nobody — switch ${on ? 'on' : 'off'}`, () => {
      if (!on) switchOff()
      ranger()
      const forged = rec('bane', { by: 'casper', at: 1 })
      expect(raw(() => { INPUTS.unshift(forged) }), 'his own record, another man named as its filer').toBe(false)
      expect(has(forged.iid)).toBe(false)
      const plain = rec('bane')
      expect(raw(() => { INPUTS.unshift(plain) }), 'his own record with no filer named gives nobody a right').toBe(true)
      const true1 = rec('bane', { date: 'Feb 11', by: 'bane', at: 1 })
      expect(raw(() => { INPUTS.unshift(true1) })).toBe(true)
    })
    it(`a record he changes keeps who placed it and when — switch ${on ? 'on' : 'off'}`, () => {
      add('bane', 'Meeting', TUE)                        // Saber files it for Ranger
      if (!on) switchOff()
      ranger()
      const id = one('bane').iid, was = copy(one('bane'))
      expect(chg(id, r => { r.by = 'casper' }), 'another man named').toBe(false)
      expect(chg(id, r => { r.by = 'bane' }), 'himself named').toBe(false)
      expect(chg(id, r => { delete r.by }), 'the name taken off').toBe(false)
      expect(chg(id, r => { r.at = 5 }), 'the moment').toBe(false)
      expect(copy(one('bane'))).toEqual(was)
      expect(chg(id, r => { r.remarks = 'his own change' })).toBe(true)
    })
  }
  it('for ANOTHER man a record must name him — a filing with no name on it is refused', () => {
    ranger()
    const hidden = rec('rocky', { grp: 'gH', grpBy: 'bane' })
    expect(raw(() => { INPUTS.unshift(hidden) })).toBe(false)
    expect(has(hidden.iid)).toBe(false)
  })
  it('the group\'s filer is never forged either: his to take when he makes a group, never another man\'s name', () => {
    ranger()
    const forged = rec('bane', { by: 'bane', at: 1, grp: 'gF', grpBy: 'casper' })
    expect(raw(() => { INPUTS.unshift(forged) }), 'a new group naming another man as its filer').toBe(false)
    const half = rec('bane', { date: 'Feb 11', by: 'bane', at: 1, grpBy: 'bane' })
    expect(raw(() => { INPUTS.unshift(half) }), 'a filer with no group').toBe(false)
    const own = rec('bane', { date: 'Feb 12', by: 'bane', at: 1, grp: 'gO', grpBy: 'bane' })
    expect(raw(() => { INPUTS.unshift(own) }), 'his own new group').toBe(true)
    expect(chg(own.iid, r => { r.grpBy = 'casper' }), 'the filer changed').toBe(false)
    expect(chg(own.iid, r => { r.grp = 'gOther' }), 'the group changed').toBe(false)
    expect(chg(own.iid, r => { delete r.grp; delete r.grpBy }), 'the group taken off').toBe(false)
    expect(byId(own.iid)).toMatchObject({ grp: 'gO', grpBy: 'bane' })
  })
  it('a single input becomes a group in the hand of the member who makes it one — his admin-filed own input included', () => {
    add('bane', 'Meeting', TUE)                          // Saber files it for Ranger
    ranger()
    const id = one('bane').iid
    expect(chg(id, r => { r.grp = 'gM'; r.grpBy = 'casper' }), 'never in another man\'s name').toBe(false)
    expect(chg(id, r => { r.grp = 'gM'; r.grpBy = 'bane' })).toBe(true)
    expect(one('bane')).toMatchObject({ by: 'stiff', grp: 'gM', grpBy: 'bane' })
  })
  it('a man added to an entry that was there before takes that entry\'s filer and the adder\'s own name', () => {
    outlaw()
    const a = rec('casper', { by: 'casper', at: 1, grp: 'gE', grpBy: 'casper' })
    expect(raw(() => { INPUTS.unshift(a) })).toBe(true)
    ranger()
    const b = rec('rocky', { by: 'bane', at: 2, grp: 'gE', grpBy: 'casper' })
    expect(raw(() => { INPUTS.unshift(b) }), 'Ranger adds Hex to Outlaw\'s entry').toBe(true)
    outlaw()
    expect(edit(byId(b.iid), { remarks: 'Outlaw filed the entry: the whole of it is his to change' })).toBe(true)
  })
})

describe('the filer answers the OIL question for the man — and only a well-formed answer (D660)', () => {
  const duty = (): string => { ranger(); expect(add('rocky', 'Meeting', SAT)).toBe(true); return one('rocky').iid }
  const oil = (id: string, v: Record<string, number> | null) => chg(id, r => { if (v) r.oil = v; else delete r.oil })
  it('he claims the half day the hours price, declines it, and clears it', () => {
    const id = duty()
    expect(oil(id, { [SAT]: 0.5 }), 'claimed').toBe(true)
    expect(byId(id).oil).toEqual({ [SAT]: 0.5 })
    expect(oil(id, { [SAT]: 0 }), 'declined').toBe(true)
    expect(oil(id, null), 'cleared').toBe(true)
    expect(byId(id).oil).toBeUndefined()
  })
  it('never an amount the hours do not give', () => {
    const id = duty()
    expect(oil(id, { [SAT]: 1 }), 'a full day for an hour').toBe(false)
    expect(oil(id, { [SAT]: 0.25 }), 'an amount that is none').toBe(false)
    expect(oil(id, { [SAT]: -1 })).toBe(false)
    expect(one('rocky').oil).toBeUndefined()
  })
  it('never for a day the record does not cover, or one that asks no question', () => {
    const id = duty()
    expect(oil(id, { [SUN]: 0.5 }), 'the day after').toBe(false)
    expect(oil(id, { [SAT]: 0.5, [TUE]: 0.5 }), 'a working day').toBe(false)
    expect(one('rocky').oil).toBeUndefined()
    expect(edit(byId(id), { start: '2026-02-13', end: SUN }), 'Friday to Sunday').toBe(true)
    expect(oil(id, { [SAT]: 0.5, [SUN]: 0 }), 'both days of the weekend').toBe(true)
    expect(oil(id, { [SAT]: 0.5, [SUN]: 0, '2026-02-13': 0.5 }), 'the Friday asks nothing').toBe(false)
  })
  it('an answer already standing rides a change he makes to something else — a change of date keeps it', () => {
    const id = duty()
    oil(id, { [SAT]: 0.5 })
    expect(edit(byId(id), { start: '2026-02-21' }), 'moved to the next Saturday').toBe(true)
    expect(one('rocky').oil, 'kept, as the save keeps it').toEqual({ [SAT]: 0.5 })
    expect(edit(one('rocky'), { remarks: 'room 2' })).toBe(true)
  })
  it('hours he changes void a claim exactly as the app\'s own rule does — he cannot keep it', () => {
    const id = duty()
    oil(id, { [SAT]: 0.5 })
    expect(edit(byId(id), { allday: true }), 'stretched to the whole day').toBe(true)
    expect(one('rocky').oil, 'the half-day claim is gone').toBeUndefined()
    expect(oil(id, { [SAT]: 1 }), 'the whole day now prices a full day').toBe(true)
    expect(chg(id, r => { r.allday = false; r.s = 540; r.e = 600 }), 'hours cut by hand, the full-day claim kept').toBe(false)
    expect(byId(id)).toMatchObject({ allday: true, oil: { [SAT]: 1 } })
  })
  it('a record filed WITH answers is judged the same way', () => {
    ranger()
    const good = rec('rocky', { date: 'Feb 14', by: 'bane', at: 1, oil: { [SAT]: 0.5 } })
    expect(raw(() => { INPUTS.unshift(good) })).toBe(true)
    const bad = rec('casper', { date: 'Feb 14', by: 'bane', at: 1, oil: { [SAT]: 1 } })
    expect(raw(() => { INPUTS.unshift(bad) })).toBe(false)
    expect(has(bad.iid)).toBe(false)
  })
  it('one bad answer rolls back everything the command wrote', () => {
    ranger()
    const a = rec('rocky', { date: 'Feb 14', by: 'bane', at: 1, oil: { [SAT]: 0.5 } })
    const b = rec('casper', { date: 'Feb 14', by: 'bane', at: 1, oil: { [SUN]: 0.5 } })
    expect(raw(() => { INPUTS.unshift(a); INPUTS.unshift(b) })).toBe(false)
    expect(has(a.iid) || has(b.iid)).toBe(false)
  })
  it('the man still changes his own answer afterwards; another member never does', () => {
    const id = duty()
    oil(id, { [SAT]: 0.5 })
    hex()
    expect(oil(id, { [SAT]: 0 }), 'the man').toBe(true)
    outlaw()
    expect(oil(id, { [SAT]: 0.5 }), 'a stranger').toBe(false)
    expect(byId(id).oil).toEqual({ [SAT]: 0 })
  })
})

describe('the filer\'s Undo and Redo — his own step, though the record is another man\'s (the plan\'s finding G3)', () => {
  it('of a filing', () => {
    ranger()
    add('rocky', 'Meeting', TUE)
    const was = copy(one('rocky'))
    expect(globalUndo().ok).toBe(true)
    none('rocky')
    expect(globalRedo().ok).toBe(true)
    expect(copy(one('rocky')), 'back as recorded — stamps and all').toEqual(was)
  })
  it('of a change', () => {
    ranger()
    add('rocky', 'Meeting', TUE)
    const was = copy(one('rocky'))
    T(10)
    edit(one('rocky'), { sTime: '13:00', eTime: '14:00' })
    const now = copy(one('rocky'))
    expect(globalUndo().ok).toBe(true)
    expect(copy(one('rocky'))).toEqual(was)
    expect(globalRedo().ok).toBe(true)
    expect(copy(one('rocky'))).toEqual(now)
  })
  it('of a deletion of a record someone ELSE placed and answered — Undo puts back exactly what was there', () => {
    /* Ranger's entry; Saber added Hex to it, and Hex answered his own OIL question */
    ranger()
    const mineRec = rec('bane', { date: 'Feb 14', by: 'bane', at: 1, grp: 'gU', grpBy: 'bane' })
    raw(() => { INPUTS.unshift(mineRec) })
    saber()
    const his = rec('rocky', { date: 'Feb 14', by: 'stiff', at: 2, modBy: 'stiff', modAt: 2, grp: 'gU', grpBy: 'bane' })
    raw(() => { INPUTS.unshift(his) })
    hex()
    raw(() => { byId(his.iid).oil = { [SAT]: 0.5 } })
    const was = copy(byId(his.iid))
    ranger()
    expect(removeInput(byId(his.iid)), 'the entry\'s filer takes him off').toBe(true)
    expect(has(his.iid)).toBe(false)
    expect(globalUndo().ok, 'and takes that back').toBe(true)
    expect(copy(byId(his.iid)), 'placed by Saber, answered by Hex — as recorded').toEqual(was)
    expect(globalRedo().ok).toBe(true)
    expect(has(his.iid)).toBe(false)
  })
  it('of a change of hours that had voided the man\'s answer — the answer comes back', () => {
    ranger()
    add('rocky', 'Meeting', SAT)
    hex()
    raw(() => { one('rocky').oil = { [SAT]: 0.5 } })
    const was = copy(one('rocky'))
    ranger()
    expect(edit(one('rocky'), { allday: true })).toBe(true)
    expect(one('rocky').oil).toBeUndefined()
    expect(globalUndo().ok).toBe(true)
    expect(copy(one('rocky'))).toEqual(was)
  })
  it('is refused while the switch is off, in words — and is his again when it is turned back on', () => {
    ranger()
    add('rocky', 'Meeting', TUE)
    flipElsewhere(false)
    const u = globalUndo()
    expect(u.ok).toBe(false)
    expect(u.reason).toMatch(/switched off/)
    expect(globalUndo().reason, 'every press says so - never passed over for an older step').toMatch(/switched off/)
    expect(one('rocky')).toBeTruthy()
    flipElsewhere(true)
    expect(globalUndo().ok).toBe(true)
    none('rocky')
    flipElsewhere(false)
    const r = globalRedo()
    expect(r.ok, 'Redo the same').toBe(false)
    expect(r.reason).toMatch(/switched off/)
    none('rocky')
    flipElsewhere(true)
    expect(globalRedo().ok).toBe(true)
    expect(one('rocky').by).toBe('bane')
  })
  it('another member has no such step: his Undo passes it by', () => {
    ranger()
    add('rocky', 'Meeting', TUE)
    outlaw()
    expect(globalUndo().ok).toBe(false)
    expect(one('rocky')).toBeTruthy()
    hex()
    expect(globalUndo().ok, 'nor the man it was filed for').toBe(false)
    expect(one('rocky')).toBeTruthy()
  })
  it('the man\'s own change to a record filed for him is his own step, as ever', () => {
    ranger()
    add('rocky', 'Meeting', TUE)
    hex()
    edit(one('rocky'), { remarks: 'noted' })
    expect(globalUndo().ok).toBe(true)
    expect(one('rocky').remarks).toBe('')
  })
  it('a hand-made command that calls itself an Undo gains nothing: it is judged as any other', () => {
    ranger()
    /* a record for Outlaw naming Saber as the one who placed it - exactly what a true Undo may put back, and a
       forward command never may */
    const forged = rec('casper', { by: 'stiff', at: 2, grp: 'gZ', grpBy: 'bane' })
    const r: any = commit({
      type: 'undo.restore', scope: { module: 'inputs' },
      apply: (txn: any) => { txn.enlist(schedStore); INPUTS.unshift(forged); resyncSchedBaseline() },
    })
    expect(r.ok).toBe(false)
    expect(has(forged.iid)).toBe(false)
    /* and the same record under his own name is an ordinary filing */
    const fair = rec('casper', { by: 'bane', at: 2, grp: 'gZ', grpBy: 'bane' })
    const r2: any = commit({
      type: 'undo.restore', scope: { module: 'inputs' },
      apply: (txn: any) => { txn.enlist(schedStore); INPUTS.unshift(fair); resyncSchedBaseline() },
    })
    expect(r2.ok).toBe(true)
    expect(has(fair.iid)).toBe(true)
  })
})
