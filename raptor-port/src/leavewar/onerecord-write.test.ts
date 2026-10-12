/* ONE RECORD FOR EVERY INPUT — the write half of step 2 (a) ([ALL-AVAIL-AS-MEMBER]; the plan
   docs/superpowers/plans/2026-10-11-one-rule-plan.md §4.1, §4.4 "The writer", §4.6, §4.9 and §5 step 2 (a) — Fable F3,
   F4, F5).

   Owner, D756 (11 Oct 26): "an input is stored as ONE record with the list of its people". D762: "one OIL answer for
   everyone in an input, given by whoever filed it or an admin". D755 (3): a person in it "may always withdraw himself".
   D655: "the man himself, whoever filed it and an admin may change or delete it".

   The one writer `commitInput` files, changes and re-peoples the ONE record in ONE command; `ownInputOf` gives one man
   of a shared input an input of his own; the check at the inputs door holds the record's shape; a member's command is
   judged on the one record (`ownPart`); the bell's OIL question goes to whoever answers for the input. Through the real
   doors over both wired stores, as groupwrite.test.ts does.

   Saber (`stiff`) is the admin; Ranger (`bane`), Hex (`rocky`) and Outlaw (`casper`) are members. The clock starts at
   15 Jan 26; 10 Feb 26 is a Tuesday, 14 Feb a Saturday. */
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { storeBackend, HOOKS } from '../engine/hooks'
import { PEOPLE, indexCallsigns } from '../engine/people'
import { INPUTS, idsOf, peopleOf, inputLines } from '../engine/inputs'
import { ownInputOf } from '../engine/inputown'
import { initStore as raptorInitStore, notify as raptorNotify, resetSession, writeInputs } from '../state/store'
import { accountsLoad, signIn, sessionFor } from '../state/accounts'
import { mayEditInput, mayDeleteInput } from '../state/perms'
import { NOTICES, noticeWords } from '../state/notices'
import { installGlobalUndo } from '../state/undo-wire'
import { commandStream } from '../command'
import { globalUndo, globalRedo } from '../undo'
import { _resetTimeline } from '../undo/timeline'
import { commitInput, draftOf, setLeaveRemarks } from '../ui/inputedit'
import { initStore as lwInitStore, lwHistInit, setPeople } from './state/store'
import { memoryBackend } from './state/storage'
import { projectPeople } from './state/raptorRoster'
import { oilPendingFor, wireLeaveWarSync } from './sync'

const mem: Record<string, string> = {}
let PEOPLE0 = ''
const ISNAP = JSON.stringify(INPUTS)
const toast = HOOKS.toast
let said: string[] = []

const T = (h: number, day = 15): number => { const d = new Date(2026, 0, day, h, 0, 0); vi.setSystemTime(d); return d.getTime() }
const signInAs = (name: string, pass = 'x') => { resetSession(sessionFor(signIn(name, pass))); raptorNotify() }
const saber = () => signInAs('ad', 'a')
const ranger = () => signInAs('us', 'us')
const hex = () => signInAs('hex')
const outlaw = () => signInAs('outlaw')

const TUE = '2026-02-10', SAT = '2026-02-14'
const SIX = ['bane', 'stiff', 'rocky', 'casper', 'harpoon', 'razer']
const D = (o: Record<string, any> = {}) => ({
  type: 'Meeting', allday: false, half: '', start: TUE, end: '', sTime: '09:00', eTime: '10:00', remarks: 'brief', sans: null, docIds: [], ...o,
})
const feb = (type = 'Meeting') => INPUTS.filter((r: any) => r.type === type && String(r.date).startsWith('Feb')) as any[]
const the = (type = 'Meeting') => { const l = feb(type); expect(l, `one ${type}`).toHaveLength(1); return l[0] }
const copy = (x: any) => JSON.parse(JSON.stringify(x))
const cmds = () => commandStream().length

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

describe('one input, one record — filed in one command (D756; the plan §4.1, §4.4)', () => {
  it('six people: ONE record holding the six in the order picked, each put in by the filer — one command, one Undo, Redo', () => {
    const n = cmds(), t = T(9)
    expect(commitInput(null, D(), SIX)).toBe(true)
    expect(cmds() - n, 'ONE command').toBe(1)
    const r = the()
    expect(idsOf(r)).toEqual(SIX)
    expect(r.person, 'no person of its own').toBeUndefined()
    expect(r.grp).toBeUndefined(); expect(r.grpBy).toBeUndefined()
    expect(r).toMatchObject({ type: 'Meeting', date: 'Feb 10', s: 540, e: 600, remarks: 'brief', by: 'stiff', at: t, modBy: 'stiff', modAt: t })
    for (const e of peopleOf(r)) expect(e, e.p).toMatchObject({ by: 'stiff', at: t })
    expect(inputLines([r]).map((l: any) => l.person), 'one line a person, for the rules about one man\'s day').toEqual(SIX)
    const was = copy(r)
    expect(globalUndo().ok).toBe(true)
    expect(feb(), 'one Undo takes the input back').toHaveLength(0)
    expect(globalRedo().ok).toBe(true)
    expect(copy(the()), 'and Redo puts it back as recorded').toEqual(was)
  })
  it('one person is an input of one — a name given twice is one person, nobody is nothing', () => {
    expect(commitInput(null, D(), ['rocky', 'rocky'])).toBe(true)
    const r = the()
    expect(idsOf(r)).toEqual(['rocky'])
    expect(r.by).toBe('stiff')
    expect(commitInput(null, D({ type: 'Duty' }), [])).toBe(false)
    expect(feb('Duty')).toHaveLength(0)
  })
  it('a person added later joins the SAME record; the others\' entries and the late date are left alone', () => {
    T(9); expect(commitInput(null, D(), ['bane', 'rocky'])).toBe(true)
    const r = the(), was = copy(r)
    const n = cmds(), t2 = T(11, 20)
    expect(commitInput(r, draftOf(r), ['bane', 'rocky', 'casper'])).toBe(true)
    expect(cmds() - n).toBe(1)
    const now = the()
    expect(now.iid).toBe(was.iid)
    expect(idsOf(now)).toEqual(['bane', 'rocky', 'casper'])
    expect(peopleOf(now).slice(0, 2), 'the two who were there are untouched').toEqual(was.people)
    expect(peopleOf(now)[2]).toMatchObject({ p: 'casper', by: 'stiff', at: t2 })
    expect(now.mod, 'the input\'s own late date did not move').toBe(was.mod)
    expect(now.by).toBe('stiff'); expect(now.at).toBe(was.at)
    expect(globalUndo().ok).toBe(true)
    expect(copy(the())).toEqual(was)
  })
  it('a person taken out leaves the record with the rest; the last one cannot be taken out this way', () => {
    expect(commitInput(null, D(), ['bane', 'rocky', 'casper'])).toBe(true)
    const r = the()
    expect(commitInput(r, draftOf(r), ['bane', 'casper'])).toBe(true)
    expect(idsOf(the())).toEqual(['bane', 'casper'])
    expect(commitInput(the(), draftOf(the()), [])).toBe(false)
    expect(idsOf(the())).toEqual(['bane', 'casper'])
  })
  it('what it says is changed once, for everyone — one record, one change', () => {
    expect(commitInput(null, D(), ['bane', 'rocky', 'casper'])).toBe(true)
    const r = the(), n = cmds()
    expect(commitInput(r, { ...draftOf(r), sTime: '13:00', eTime: '14:00', remarks: 'moved' }, ['bane', 'rocky', 'casper'])).toBe(true)
    expect(cmds() - n).toBe(1)
    expect(the()).toMatchObject({ s: 780, e: 840, remarks: 'moved' })
    expect(idsOf(the())).toEqual(['bane', 'rocky', 'casper'])
    expect(feb()).toHaveLength(1)
  })
  it('ONE OIL answer on the record, for everyone in it (D762)', () => {
    expect(commitInput(null, D({ start: SAT }), ['bane', 'rocky'], { oil: { [SAT]: 0.5 } })).toBe(true)
    const r = the()
    expect(r.oil).toEqual({ [SAT]: 0.5 })
    for (const e of peopleOf(r)) expect('oil' in e, 'no answer of a man\'s own').toBe(false)
  })
})

describe('what one record may hold is held at the inputs door (the plan §4.1)', () => {
  const rec = (people: string[], over: any = {}) => ({ iid: 'zz1', type: 'Meeting', date: 'Feb 10', yr: 2026, allday: false, s: 540, e: 600, remarks: '', mod: '2026-01-15',
    by: 'stiff', at: 1, people: people.map(p => ({ p, by: 'stiff', at: 1 })), ...over })
  it('a person twice, nobody, two people on a medical entry or a Personal input: refused whole, with the sentence', () => {
    for (const bad of [rec(['bane', 'bane']), rec([]), rec(['bane', 'rocky'], { type: 'OML', allday: true }), rec(['bane', 'rocky'], { type: 'Personal' })]) {
      said = []
      expect(writeInputs(() => { INPUTS.unshift(bad) }), JSON.stringify(idsOf(bad)) + bad.type).toBe(false)
      expect(INPUTS.some((r: any) => r.iid === 'zz1')).toBe(false)
      expect(said.join(' | ')).toMatch(/already on this input|at least one person|one person/i)
    }
    expect(writeInputs(() => { INPUTS.unshift(rec(['bane', 'rocky'])) })).toBe(true)
  })
})

describe('one man\'s part of a shared input — an input of his own (ownInputOf; the plan §4.6)', () => {
  it('where he is alone it is the input itself; else a new record of him, every field copied, and he is out of the first', () => {
    expect(commitInput(null, D({ start: SAT }), ['bane', 'rocky', 'casper'], { oil: { [SAT]: 0.5 } })).toBe(true)
    const r = the(), was = copy(r)
    let own: any = null
    expect(writeInputs(() => { own = ownInputOf(r, 'rocky') })).toBe(true)
    expect(feb()).toHaveLength(2)
    expect(own.iid).not.toBe(was.iid)
    expect(idsOf(own)).toEqual(['rocky'])
    expect(own).toMatchObject({ type: 'Meeting', date: was.date, s: was.s, e: was.e, remarks: was.remarks, by: was.by, at: was.at, oil: was.oil })
    expect(peopleOf(own)[0]).toEqual(was.people[1])
    expect(idsOf(INPUTS.find((x: any) => x.iid === was.iid))).toEqual(['bane', 'casper'])
    let again: any = null
    expect(writeInputs(() => { again = ownInputOf(own, 'rocky') })).toBe(true)
    expect(again, 'alone already: the input itself').toBe(INPUTS.find((x: any) => x.iid === own.iid))
    expect(feb()).toHaveLength(2)
  })
})

describe('who may change the one record (the plan §4.9 — Fable F4, F5; D655, D755 (3))', () => {
  it('a member files a duty for three and is its filer; his own Undo takes it back', () => {
    ranger()
    const t = T(9)
    expect(commitInput(null, D(), ['bane', 'rocky', 'casper'])).toBe(true)
    const r = the()
    expect(r).toMatchObject({ by: 'bane', at: t })
    expect(mayEditInput(r)).toBe(true)
    expect(globalUndo().ok, 'his own step').toBe(true)
    expect(feb()).toHaveLength(0)
  })
  it('the man himself — the ONLY person of an input an admin filed for him — may change and delete it (F4)', () => {
    expect(commitInput(null, D(), ['bane'])).toBe(true)
    ranger()
    const r = the()
    expect(mayEditInput(r)).toBe(true); expect(mayDeleteInput(r)).toBe(true)
    expect(commitInput(r, { ...draftOf(r), remarks: 'mine' }, ['bane'])).toBe(true)
    expect(the().remarks).toBe('mine')
  })
  /* SINCE THE BELL'S NOTICES (the one-rule build's step 7, 12 Oct 26 — owner D755 (3); the plan §4.10; R11): his step
     also TELLS the two left in it and whoever filed it, each a notice made inside his own command — so his Undo and his
     Redo carry those notices through the member's commit gate (state/perms.ts, the `notices` case), which this case
     now says out loud.
     ITS FIXTURE IS A FEBRUARY INPUT, OFF THE WEEK ON SCREEN — and that is the only reason the Undo passes: the same
     Undo of an input that has a row on the loaded week is REFUSED (the gate reads the row's landing mark as a change —
     state/perms.ts saysSame). Shown, left failing, in ui/bellnotices-scenarios.test.tsx "FAULT: …the same Undo where the
     input has a row on the week ON SCREEN". */
  it('a man IN a shared input he did not file takes himself out — and his own Undo puts him back (F5, T14); the others are told, and untold, with it (D755 (3), R11)', () => {
    expect(commitInput(null, D(), ['bane', 'rocky', 'casper'])).toBe(true)
    hex()
    const r = the(), was = copy(r)
    const had = new Set(NOTICES.map(n => n.id)), told = () => NOTICES.filter(n => !had.has(n.id))
    expect(mayEditInput(r), 'not his to change for everyone').toBe(false)
    expect(commitInput(r, draftOf(r), ['bane', 'casper'])).toBe(true)
    expect(idsOf(the())).toEqual(['bane', 'casper'])
    expect(told().map(n => `${n.to} by ${n.by}: ${noticeWords(n).what}`).sort(), 'the two left in it and its filer, by Hex').toEqual(
      ['bane', 'casper', 'stiff'].map(p => `${p} by rocky: ${PEOPLE.rocky.cs} taken off`).sort())
    expect(globalUndo().ok, 'his own step, though the record is not his alone').toBe(true)
    expect(copy(the())).toEqual(was)
    expect(told(), 'the Undo took the notices with it').toEqual([])
    expect(globalRedo().ok).toBe(true)
    expect(idsOf(the())).toEqual(['bane', 'casper'])
    expect(told().map(n => n.to).sort(), 'the Redo tells them again').toEqual(['bane', 'casper', 'stiff'])
  })
  it('he changes nothing else of it, and someone who is not in it changes nothing at all', () => {
    expect(commitInput(null, D(), ['bane', 'rocky', 'casper'])).toBe(true)
    hex()
    const r = the(), was = copy(r)
    expect(commitInput(r, { ...draftOf(r), remarks: 'hex was here' }, ['bane', 'rocky', 'casper'])).toBe(false)
    expect(commitInput(r, draftOf(r), ['rocky', 'casper']), 'nor takes another man out').toBe(false)
    /* a hand-made write past the door is rolled back by the check on what a member's command really changed */
    expect(writeInputs(() => { the().remarks = 'forged' })).toBe(false)
    expect(writeInputs(() => { the().people = the().people.filter((e: any) => e.p !== 'bane') })).toBe(false)
    outlaw()
    expect(writeInputs(() => { the().people = the().people.filter((e: any) => e.p !== 'rocky') })).toBe(false)
    expect(copy(the())).toEqual(was)
  })
})

describe('the bell\'s OIL question goes to whoever answers for the input (D762, D711 (4); the plan §4.5, §4.7)', () => {
  const weekendOn = () => { /* 14 Feb 26 is a Saturday: it asks by itself */ }
  it('an input of one person asks that person, whoever filed it', () => {
    weekendOn()
    expect(commitInput(null, D({ start: SAT, type: 'Duty' }), ['bane'])).toBe(true)
    const r = the('Duty')
    expect(oilPendingFor('bane').map(x => x.iid)).toEqual([r.iid])
    expect(oilPendingFor('stiff').map(x => x.iid)).toEqual([])
  })
  it('an input of several asks its FILER, and none of the people in it', () => {
    ranger()
    expect(commitInput(null, D({ start: SAT, type: 'Duty' }), ['rocky', 'casper'])).toBe(true)
    const r = the('Duty')
    expect(oilPendingFor('bane').map(x => x.iid), 'the filer').toEqual([r.iid])
    hex()
    expect(oilPendingFor('rocky').map(x => x.iid), 'a man in it has no answer of his own to give').toEqual([])
    ranger()
    expect(commitInput(r, draftOf(r), ['rocky', 'casper'], { oil: { [SAT]: 0 } })).toBe(true)
    expect(oilPendingFor('bane').map(x => x.iid), 'answered — a No is an answer').toEqual([])
  })
})

/* THE LEAVE WAR'S REMARKS SHEET ON ONE MAN'S CELL OF A SHARED LEAVE (Fable's read of the finished code, finding 1 — 12 Oct
   26; the plan §4.6 names setLeaveRemarks as a caller of ownInputOf; owner D737 — an absence for several is one row a
   man; R5 — a change to one man's part gives him an input of his own; D755 (3)). The sheet is opened on ONE man's cell
   (leavewar/ui/RemarksSheet.tsx, handed whatever leave stands behind it — sync.ts leaveInputAt), so its remark is HIS:
   before the one-rule build a shared leave was a record a man and the remark landed on him alone; built on the one
   record it rewrote the remark for everyone in the leave and refused the man himself. */
describe('a remark saved on one man’s cell of a leave filed for several is his alone (the war’s remarks sheet)', () => {
  const WED = '2026-02-11', THU = '2026-02-12'
  const leave = () => commitInput(null, D({ type: 'LL', allday: true, start: TUE, end: THU, sTime: '', eTime: '', remarks: '' }), ['bane', 'rocky', 'casper'])
  const lls = () => INPUTS.filter((r: any) => r.type === 'LL' && String(r.date).startsWith('Feb')) as any[]
  const of = (p: string) => lls().filter(r => idsOf(r).includes(p))
  it('as an admin: Hex gets a leave of his own carrying it; the other two keep theirs untouched; one Undo puts the three back as one', () => {
    expect(leave()).toBe(true)
    expect(lls()).toHaveLength(1)
    const r = lls()[0], was = copy(r)
    expect(setLeaveRemarks(r, 'Dental', 'rocky')).toBe(true)
    expect(lls(), 'the leave for two, and his own').toHaveLength(2)
    expect(of('rocky').map(x => idsOf(x)), 'his own, of him alone').toEqual([['rocky']])
    expect(String(of('rocky')[0].remarks)).toContain('Dental')
    expect(of('bane').map(x => idsOf(x))).toEqual([['bane', 'casper']])
    expect(String(of('bane')[0].remarks), 'the others never read his note').not.toContain('Dental')
    expect([of('bane')[0].date, of('bane')[0].endDate, of('rocky')[0].date, of('rocky')[0].endDate]).toEqual([was.date, was.endDate, was.date, was.endDate])
    expect(globalUndo().ok).toBe(true)
    expect(lls()).toHaveLength(1)
    expect(copy(lls()[0])).toEqual(was)
    void WED
  })
  it('as the man himself (a member, not its filer): saved, and his own', () => {
    expect(leave()).toBe(true)
    hex()
    const r = lls()[0]
    expect(setLeaveRemarks(r, 'Dental', 'rocky'), said.join(' | ')).toBe(true)
    expect(of('rocky').map(x => idsOf(x))).toEqual([['rocky']])
    expect(String(of('rocky')[0].remarks)).toContain('Dental')
    expect(String(of('bane')[0].remarks)).not.toContain('Dental')
  })
  it('a leave of ONE person is written as before — no second record', () => {
    expect(commitInput(null, D({ type: 'LL', allday: true, start: TUE, end: THU, sTime: '', eTime: '', remarks: '' }), ['rocky'])).toBe(true)
    expect(setLeaveRemarks(lls()[0], 'Dental', 'rocky')).toBe(true)
    expect(lls()).toHaveLength(1)
    expect(String(lls()[0].remarks)).toContain('Dental')
  })
})
