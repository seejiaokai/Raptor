/* THE OPUS TRIAL READ'S CLAIMS, EACH REPRODUCED THROUGH THE REAL DOORS ([ALL-AVAIL-AS-MEMBER], the one-rule job's check,
   12 Oct 26 — the report docs/superpowers/briefs/2026-10-12-reads/one-rule-code-opus-trial.md; the evidence sheet
   docs/handpass/2026-10-12-one-rule.md §10b).

   The read ran nothing: "every claim is to be reproduced as a failing test before it is believed". Each case here was
   written to the RIGHT behaviour, run against the code as the read saw it, and the sheet says which were red. The
   harness is onerecord-write.test.ts's: both wired stores, the real sign-ins, the real inputs door.

   Saber (`stiff`) is the admin; Ranger (`bane`), Hex (`rocky`) and Outlaw (`casper`) are members. The clock starts at
   15 Jan 26; 9 Feb 26 is a Monday, 14 Feb a Saturday. */
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { storeBackend, HOOKS } from '../engine/hooks'
import { PEOPLE, indexCallsigns } from '../engine/people'
import { INPUTS, idsOf } from '../engine/inputs'
import { initStore as raptorInitStore, notify as raptorNotify, resetSession } from '../state/store'
import { accountsLoad, signIn, sessionFor } from '../state/accounts'
import { installGlobalUndo } from '../state/undo-wire'
import { _resetTimeline } from '../undo/timeline'
import { commandStream } from '../command'
import { NOTICES } from '../state/notices'
import { commitInput, draftOf, setInpField, setLeaveRemarks, reassignInput } from '../ui/inputedit'
import { deletePerson } from '../state/person-delete'
import { initStore as lwInitStore, lwHistInit, setPeople, setCell, setBidStates, movableRecords } from './state/store'
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
const saber = () => signInAs('ad', 'a')

const MON = '2026-02-09', TUE = '2026-02-10', WED = '2026-02-11', FRI = '2026-02-13'
const D = (o: Record<string, any> = {}) => ({
  type: 'Meeting', allday: false, half: '', start: TUE, end: '', sTime: '09:00', eTime: '10:00', remarks: 'brief', sans: null, docIds: [], ...o,
})
const feb = (type: string) => INPUTS.filter((r: any) => r.type === type && String(r.date).startsWith('Feb')) as any[]

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

/* CLAIM 2 — "a person added to one piece of a cut leave is also added to its other pieces": the pieces of a cut leave
   were shallow copies of one record (sync.ts sliceInput), so they shared ONE list of people, and putting a person in
   pushed onto that list in place (engine/inputown.ts putPerson). */
describe('the pieces of a cut leave each hold their own people (the trial read, claim 2)', () => {
  const leave = (who: string[]) => commitInput(null, D({ type: 'LL', allday: true, start: MON, end: FRI, sTime: '', eTime: '', remarks: '' }), who)
  const sick = (who: string) => commitInput(null, D({ type: 'ATT C', allday: true, start: WED, end: '', sTime: '', eTime: '', remarks: '' }), [who])
  it('a medical cuts Hex\'s leave in two; Outlaw added to the first piece is NOT in the second', () => {
    expect(leave(['rocky']), said.join(' | ')).toBe(true)
    expect(sick('rocky'), said.join(' | ')).toBe(true)
    const pieces = feb('LL').filter(r => idsOf(r).includes('rocky'))
    expect(pieces.map(r => [r.date, r.endDate]), 'Mon–Tue and Thu–Fri').toEqual([['Feb 9', 'Feb 10'], ['Feb 12', 'Feb 13']])
    const [a, b] = pieces
    expect(commitInput(a, draftOf(a), ['rocky', 'casper']), said.join(' | ')).toBe(true)
    const after = feb('LL').filter(r => idsOf(r).includes('rocky'))
    expect(idsOf(after.find(r => r.iid === a.iid)), 'the piece he was added to').toEqual(['rocky', 'casper'])
    expect(idsOf(after.find(r => r.iid === b.iid)), 'the other piece is nobody\'s business').toEqual(['rocky'])
    expect(feb('LL').filter(r => idsOf(r).includes('casper')).map(r => [r.date, r.endDate]), 'Outlaw is on leave Mon–Tue only').toEqual([['Feb 9', 'Feb 10']])
  })
})

/* CLAIM 4 — "a refused time typed on one man's Unavailable row still splits him out of the shared input": the one-man
   branch gave him an input of his own FIRST and saved the typed box on it second, inside one batch; a save refused
   there answered false, and a batch whose body merely answers false is still committed — only a throw rolls it back. */
describe('a refused box on one man\'s row of a shared absence changes nothing (the trial read, claim 4)', () => {
  const timed = () => commitInput(null, D({ type: 'LL', allday: false, start: TUE, end: '', sTime: '08:00', eTime: '12:00', remarks: '' }), ['bane', 'rocky', 'casper'])
  it('a start typed equal to the end is refused — and the leave is still ONE input of three: no command, no notice', () => {
    expect(timed(), said.join(' | ')).toBe(true)
    const r = feb('LL').find(x => idsOf(x).length === 3)
    const n = commandStream().length, told = NOTICES.length
    said = []
    expect(setInpField(r, 'str', '12:00', 'casper')).toBe(false)
    expect(said.join(' | '), 'the refusal is said').toMatch(/not the same time/i)
    expect(feb('LL').map(x => idsOf(x)), 'still one leave of three').toEqual([['bane', 'rocky', 'casper']])
    expect(commandStream().length - n, 'nothing was saved, so there is no Undo step').toBe(0)
    expect(NOTICES.length - told, 'and nobody is told anything').toBe(0)
  })
  it('a good time still gives him a leave of his own (R5) — the fix did not close the door', () => {
    expect(timed()).toBe(true)
    const r = feb('LL').find(x => idsOf(x).length === 3)
    expect(setInpField(r, 'str', '09:00', 'casper'), said.join(' | ')).toBe(true)
    expect(feb('LL').map(x => [idsOf(x), x.s]).sort((a: any, b: any) => a[1] - b[1])).toEqual([[['bane', 'rocky'], 480], [['casper'], 540]])
  })
  it('the Leave War\'s remark on one man\'s cell: a refused save leaves the leave whole too (the same shape)', () => {
    expect(commitInput(null, D({ type: 'LL', allday: true, start: TUE, end: '', sTime: '', eTime: '', remarks: '' }), ['bane', 'rocky', 'casper'])).toBe(true)
    const r = feb('LL').find(x => idsOf(x).length === 3)
    const n = commandStream().length
    /* Hex, a member who is in it and did not file it, writes on OUTLAW's cell: not his to change */
    signInAs('hex')
    expect(setLeaveRemarks(r, 'Dental', 'casper')).toBe(false)
    expect(feb('LL').map(x => idsOf(x)), 'refused: still one leave of three').toEqual([['bane', 'rocky', 'casper']])
    expect(commandStream().length - n).toBe(0)
  })
})

/* CLAIM 5 — "a second person can be added to a war-approved leave; the Leave War can then no longer act on it": the
   war finds the leave behind a cell only where the cell's man is its ONE person (sync.ts warLeaveRow), and nothing
   held "a leave approved on the Leave War is one person's" at the write. */
describe('a leave approved on the Leave War stays one person\'s (the trial read, claim 5)', () => {
  const one = (p: string, d: string) => [{ personId: p, date: d }]
  const approved = () => {
    expect(setCell('rocky', TUE, 'LL')).toBe(true)
    setBidStates(one('rocky', TUE), 'approved')
    const row = INPUTS.find((r: any) => r.lw && idsOf(r).includes('rocky') && r.date === 'Feb 10') as any
    expect(row, 'the war wrote the leave').toBeTruthy()
    return row
  }
  it('a second person is refused at the save, with the sentence; the leave is as it was and the war can still move it', () => {
    const row = approved()
    said = []
    expect(commitInput(row, draftOf(row), ['rocky', 'casper'])).toBe(false)
    expect(said.join(' | ')).toMatch(/approved on the Leave War is one person/i)
    const now = INPUTS.find((r: any) => r.iid === row.iid) as any
    expect(idsOf(now)).toEqual(['rocky'])
    expect(now.lw, 'still the war\'s').toBeTruthy()
    expect(movableRecords(one('rocky', TUE)).length, 'the war still finds it').toBeGreaterThan(0)
  })
  it('the same leave filed on the Inputs page (no war behind it) still takes a second person', () => {
    expect(commitInput(null, D({ type: 'LL', allday: true, start: WED, end: '', sTime: '', eTime: '', remarks: '' }), ['rocky'])).toBe(true)
    const r = feb('LL').find(x => x.date === 'Feb 11')
    expect(commitInput(r, draftOf(r), ['rocky', 'casper']), said.join(' | ')).toBe(true)
  })
})

/* CLAIM 9 — "'By' does not pass on at three doors that take the filer out". He was told (D759 reading 7): "'by Ranger'
   stays while Ranger is in it and passes to the scheduler who takes him out". The input's own window and the row's
   door do that (ui/inputedit.tsx commitInput); a delete of the man, and the Unavailable row's swap, did not. */
describe('who filed an input passes to the scheduler who takes its filer out — at every door (the trial read, claim 9)', () => {
  const ranger = () => signInAs('us', 'us')
  const duty = (over: any = {}) => commitInput(null, D({ type: 'Duty', ...over }), ['bane', 'rocky', 'casper'])
  it('the filer DELETED: he is out of the input he filed for three, and it reads "By Saber" — the admin who deleted him', () => {
    ranger()
    expect(duty(), said.join(' | ')).toBe(true)
    expect(feb('Duty')[0].by).toBe('bane')
    saber()
    expect(deletePerson('bane')).toBeNull()
    const r = feb('Duty')[0]
    expect(idsOf(r)).toEqual(['rocky', 'casper'])
    expect(r.by, 'never left filed by a man who is gone').toBe('stiff')
  })
  it('…and where the input SPANS the day he goes: his own part keeps "By Ranger", the others\' passes on', () => {
    ranger()
    expect(duty({ start: '2026-01-14', end: '2026-01-20' }), said.join(' | ')).toBe(true)
    saber()
    expect(deletePerson('bane')).toBeNull()
    const all = INPUTS.filter((x: any) => x.type === 'Duty' && String(x.date) === 'Jan 14') as any[]
    const his = all.find(x => idsOf(x).includes('bane')), theirs = all.find(x => idsOf(x).includes('rocky'))
    expect(his && idsOf(his)).toEqual(['bane'])
    expect(his.by, 'the days he was there are his own record').toBe('bane')
    expect(idsOf(theirs)).toEqual(['rocky', 'casper'])
    expect(theirs.by).toBe('stiff')
  })
  it('the filer SWAPPED OUT on his row of the Unavailable list: "By" passes to the scheduler who did it', () => {
    ranger()
    expect(commitInput(null, D({ type: 'OD', allday: true, sTime: '', eTime: '', remarks: 'Exercise' }), ['bane', 'rocky']), said.join(' | ')).toBe(true)
    const r0 = feb('OD')[0]
    expect(r0.by).toBe('bane')
    saber()
    expect(reassignInput(`${r0.iid}~bane`, 'casper'), said.join(' | ')).toBe(true)
    const r = feb('OD')[0]
    expect(idsOf(r)).toEqual(['casper', 'rocky'])
    expect(r.by).toBe('stiff')
  })
  it('THE CONTROL: someone who is NOT its filer swapped out leaves "By" alone', () => {
    ranger()
    expect(commitInput(null, D({ type: 'OD', allday: true, sTime: '', eTime: '', remarks: 'Exercise' }), ['bane', 'rocky'])).toBe(true)
    const r0 = feb('OD')[0]
    saber()
    expect(reassignInput(`${r0.iid}~rocky`, 'casper')).toBe(true)
    expect(feb('OD')[0].by).toBe('bane')
  })
})
