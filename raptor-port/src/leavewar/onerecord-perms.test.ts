/* WHO MAY CHANGE THE ONE RECORD — step 2 (f) of the one-rule build ([ALL-AVAIL-AS-MEMBER]; the plan
   docs/superpowers/plans/2026-10-11-one-rule-plan.md §4.9, §4.5 "By Saber" — its tests T9, T13, T19; Fable F4, F5, F12,
   F13). His rulings:
   D655 — "the man himself, whoever filed it and an admin may change or delete it";
   D755 (3) — the member "may always withdraw himself, and changing it for everyone, once the scheduler has added others,
              is the scheduler's";
   D762 — one OIL answer for everyone in an input, given by whoever filed it or an admin;
   D763 — "who is in an input is changed only by whoever filed it or by a scheduler: a person who is in a shared input he
           did not file does not add anyone to it — he may always take himself out";
   D759 reading 7 — "by Ranger" passes to the scheduler who takes him out.

   THE TABLE (§4.9), row by row:
     change it for everyone (its fields, its people, its OIL answer, delete it) — an admin; its ONLY named person, in
       full, whoever filed it; its filer, while every entry of its list was put in by him — and, where it holds anyone
       but himself, only a kind a member may file for others, with the members' switch on;
     take himself out — anyone in it, always; nothing else is his;
     the check on what a member's command really changed says the same of a hand-made write.

   Through the real doors over both wired stores, as onerecord-write.test.ts does. Saber (`stiff`) is the admin; Ranger
   (`bane`), Hex (`rocky`) and Outlaw (`casper`) are members. 10 Feb 26 is a Tuesday, 14 Feb a Saturday. */
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { storeBackend, HOOKS } from '../engine/hooks'
import { PEOPLE, indexCallsigns } from '../engine/people'
import { INPUTS, idsOf, peopleOf } from '../engine/inputs'
import { initStore as raptorInitStore, notify as raptorNotify, resetSession, writeInputs } from '../state/store'
import { accountsLoad, signIn, sessionFor } from '../state/accounts'
import { mayEditInput, mayDeleteInput } from '../state/perms'
import { installGlobalUndo } from '../state/undo-wire'
import { globalUndo } from '../undo'
import { _resetTimeline } from '../undo/timeline'
import { commitInput, draftOf, removeInput, sharedRefusal } from '../ui/inputedit'
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
const flipElsewhere = (on: boolean) => { if (on) delete mem['sqn142_memberfile']; else mem['sqn142_memberfile'] = 'false' }

const TUE = '2026-02-10', SAT = '2026-02-14'
const D = (o: Record<string, any> = {}) => ({
  type: 'Meeting', allday: false, half: '', start: TUE, end: '', sTime: '09:00', eTime: '10:00', remarks: 'brief', sans: null, docIds: [], ...o,
})
const feb = (type = 'Meeting') => INPUTS.filter((r: any) => r.type === type && String(r.date).startsWith('Feb')) as any[]
const the = (type = 'Meeting') => { const l = feb(type); expect(l, `one ${type}`).toHaveLength(1); return l[0] }
const copy = (x: any) => JSON.parse(JSON.stringify(x))
const change = (over: any, people?: string[], opts?: any) => commitInput(the(over.type0 || 'Meeting'), { ...draftOf(the(over.type0 || 'Meeting')), ...over }, people || idsOf(the(over.type0 || 'Meeting')), opts)

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

describe('its filer changes it for everyone while every entry of its list is his (D655; the plan §4.9)', () => {
  it('a member who filed a duty for two others: he re-times it, adds a third, takes one out, answers its OIL, deletes it', () => {
    ranger()
    expect(commitInput(null, D({ start: SAT }), ['rocky', 'casper'])).toBe(true)
    expect(mayEditInput(the())).toBe(true); expect(mayDeleteInput(the())).toBe(true)
    expect(change({ sTime: '13:00', eTime: '14:00' })).toBe(true)
    expect(change({}, ['rocky', 'casper', 'harpoon'])).toBe(true)
    expect(change({}, ['rocky', 'harpoon'])).toBe(true)
    expect(change({}, undefined, { oil: { [SAT]: 0.5 } })).toBe(true)
    expect(the()).toMatchObject({ s: 780, e: 840, by: 'bane', oil: { [SAT]: 0.5 } })
    expect(idsOf(the())).toEqual(['rocky', 'harpoon'])
    expect(removeInput(the())).toBe(true)
    expect(feb()).toHaveLength(0)
  })
  it('never a leave for others, and nothing for others with the members\' switch off — he is told which', () => {
    ranger()
    expect(commitInput(null, D({ type: 'LL', allday: true }), ['rocky', 'casper'])).toBe(false)
    expect(said.join(' ')).toMatch(/only for yourself/)
    expect(commitInput(null, D(), ['rocky', 'casper'])).toBe(true)
    flipElsewhere(false)
    expect(mayEditInput(the()), 'the switch off: his right over what he filed for others ends').toBe(false)
    said = []
    expect(change({ remarks: 'late' })).toBe(false)
    expect(said.join(' ')).toMatch(/switched off/i)
    flipElsewhere(true)
    expect(change({ remarks: 'late' })).toBe(true)
  })
})

describe('once a scheduler has put someone in, changing it for everyone is the scheduler\'s (D755 (3))', () => {
  it('Ranger files for himself; Saber adds Tally: Ranger may no longer change it for everyone — he may still take himself out', () => {
    ranger()
    expect(commitInput(null, D(), ['bane'])).toBe(true)
    saber()
    expect(change({}, ['bane', 'casper'])).toBe(true)
    ranger()
    expect(mayEditInput(the())).toBe(false); expect(mayDeleteInput(the())).toBe(false)
    said = []
    expect(change({ remarks: 'mine again' })).toBe(false)
    expect(said.join(' '), 'he is told who can').toMatch(/A scheduler has changed who is in this — ask an admin to change it for everyone/)
    expect(sharedRefusal([the()], 'change this for everyone')).toMatch(/A scheduler has changed who is in this/)
    expect(change({}, ['casper']), 'he takes himself out').toBe(true)
    expect(idsOf(the())).toEqual(['casper'])
  })
  it('Ranger files for two others; Saber adds a third: the same — and a hand-made write is rolled back', () => {
    ranger()
    expect(commitInput(null, D(), ['rocky', 'casper'])).toBe(true)
    saber()
    expect(change({}, ['rocky', 'casper', 'harpoon'])).toBe(true)
    ranger()
    const was = copy(the())
    expect(mayEditInput(the())).toBe(false)
    expect(writeInputs(() => { the().remarks = 'forged' })).toBe(false)
    expect(writeInputs(() => { the().people = the().people.filter((e: any) => e.p !== 'harpoon') })).toBe(false)
    expect(copy(the())).toEqual(was)
  })
})

describe('"by" passes on when the filer leaves, so the OIL question still reaches someone who can answer (Fable F13; T19)', () => {
  it('the filer takes HIMSELF out of an input a scheduler has put someone in: "by" passes to whoever put in the newest entry that is not his', () => {
    ranger()
    expect(commitInput(null, D({ start: SAT, type: 'Duty' }), ['bane'])).toBe(true)
    saber()
    expect(commitInput(the('Duty'), draftOf(the('Duty')), ['bane', 'casper'])).toBe(true)
    expect(the('Duty').by, 'still Ranger\'s filing').toBe('bane')
    ranger()
    expect(commitInput(the('Duty'), draftOf(the('Duty')), ['casper'])).toBe(true)
    expect(the('Duty').by, 'by Saber now').toBe('stiff')
    expect(oilPendingFor('casper').map(x => x.iid), 'an input of one person asks that person').toEqual([the('Duty').iid])
    /* his own Undo puts him back, and the filing is his again (the Undo list is his sign-in's — he has not signed out) */
    expect(globalUndo().ok).toBe(true)
    expect(idsOf(the('Duty'))).toEqual(['bane', 'casper'])
    expect(the('Duty').by).toBe('bane')
  })
  it('where every remaining entry is his own filing, "by" stays his — he filed it for others and may still change it', () => {
    ranger()
    expect(commitInput(null, D(), ['bane', 'rocky', 'casper'])).toBe(true)
    expect(change({}, ['rocky', 'casper'])).toBe(true)
    expect(the().by).toBe('bane')
    expect(mayEditInput(the())).toBe(true)
  })
  it('a scheduler who takes the filer out of his own input becomes its filer (D759 reading 7)', () => {
    ranger()
    expect(commitInput(null, D({ start: SAT, type: 'Duty' }), ['bane', 'rocky'])).toBe(true)
    saber()
    expect(commitInput(the('Duty'), draftOf(the('Duty')), ['rocky'])).toBe(true)
    expect(the('Duty').by).toBe('stiff')
  })
})

describe('the man himself — the only person of an input someone else filed (Fable F4; T13)', () => {
  it('an input an admin filed for Ranger alone: Ranger re-times it, re-words it, answers its OIL and deletes it', () => {
    expect(commitInput(null, D({ start: SAT, type: 'Duty' }), ['bane'])).toBe(true)
    ranger()
    const r = the('Duty')
    expect(commitInput(r, { ...draftOf(r), sTime: '13:00', eTime: '15:00', remarks: 'moved' }, ['bane'])).toBe(true)
    expect(commitInput(the('Duty'), draftOf(the('Duty')), ['bane'], { oil: { [SAT]: 0.5 } })).toBe(true)
    expect(the('Duty')).toMatchObject({ s: 780, e: 900, remarks: 'moved', oil: { [SAT]: 0.5 } })
    expect(removeInput(the('Duty'))).toBe(true)
  })
})

describe('what a member\'s command really changed — nobody\'s entry is forged (the plan §4.9, the commit gate)', () => {
  const rec = (people: Array<{ p: string; by?: string }>, over: any = {}) => ({ iid: 'zz1', type: 'Meeting', date: 'Feb 10', yr: 2026, allday: false, s: 540, e: 600, remarks: '', mod: '2026-01-15',
    by: 'bane', at: 1, people: people.map(e => ({ at: 1, ...e })), ...over })
  it('a member files a shared input only in his own name, every entry put in by him', () => {
    ranger()
    expect(writeInputs(() => { INPUTS.unshift(rec([{ p: 'rocky', by: 'bane' }, { p: 'casper', by: 'bane' }])) })).toBe(true)
    INPUTS.splice(INPUTS.findIndex((r: any) => r.iid === 'zz1'), 1)
    expect(writeInputs(() => { INPUTS.unshift(rec([{ p: 'rocky', by: 'bane' }, { p: 'casper', by: 'stiff' }])) }), 'an entry stamped as someone else\'s').toBe(false)
    expect(writeInputs(() => { INPUTS.unshift(rec([{ p: 'rocky', by: 'bane' }], { by: 'stiff' })) }), 'the filing in someone else\'s name').toBe(false)
    expect(INPUTS.some((r: any) => r.iid === 'zz1')).toBe(false)
  })
  it('he adds nobody in another\'s name, and re-stamps nobody\'s entry', () => {
    ranger()
    expect(commitInput(null, D(), ['rocky', 'casper'])).toBe(true)
    const was = copy(the())
    expect(writeInputs(() => { the().people.push({ p: 'harpoon', by: 'stiff', at: 5 }) })).toBe(false)
    expect(writeInputs(() => { the().people[0].by = 'stiff' })).toBe(false)
    expect(copy(the())).toEqual(was)
    expect(writeInputs(() => { the().people.push({ p: 'harpoon', by: 'bane', at: 5 }) }), 'in his own name: his to add').toBe(true)
  })
  it('a person in it who did not file it adds nobody (D763), by the door or past it', () => {
    expect(commitInput(null, D(), ['bane', 'rocky'])).toBe(true)
    hex()
    const was = copy(the())
    expect(commitInput(the(), draftOf(the()), ['bane', 'rocky', 'casper'])).toBe(false)
    expect(writeInputs(() => { the().people.push({ p: 'casper', by: 'rocky', at: 5 }) })).toBe(false)
    outlaw()
    expect(writeInputs(() => { the().people.push({ p: 'casper', by: 'casper', at: 5 }) }), 'nor does someone outside it add himself').toBe(false)
    expect(copy(the())).toEqual(was)
    expect(peopleOf(the()).length).toBe(2)
  })
})
