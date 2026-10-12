/* A PERSONAL INPUT IS THE SAME AS AN EVENT FOR EVERYTHING ABOUT PEOPLE — AND STILL NOT WORK ([PERSONAL-SEVERAL]; owner
   D776, 12 Oct 26 — "A2 B2": "a Personal input may hold several people, as every other kind of input does … and a puck
   dropped on its row swaps or joins as on any input's"; D778, the same day — *"Personal is not work"* / *"So all avail
   all can go on personal. A member can file a personal input for other as well"*).

   Through the real doors over both wired stores, as onerecord-write.test.ts does: who may file it and for whom, who
   may change who is in it, and that nothing about OIL is asked of anyone. What a Personal input's ROW does when a puck
   is dropped on it is ui/reqdoor.test.tsx and ui/oilpersonalcrowd.test.tsx; what its ALL AVAIL counts and earns is
   engine/oilpersonalcrowd.test.ts.

   Saber (`stiff`) is the admin; Ranger (`bane`), Hex (`rocky`) and Outlaw (`casper`) are members. The clock starts at
   15 Jan 26; 10 Feb 26 is a Tuesday, 14 Feb a Saturday. */
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { storeBackend, HOOKS } from '../engine/hooks'
import { PEOPLE, indexCallsigns } from '../engine/people'
import { INPUTS, idsOf, peopleOf } from '../engine/inputs'
import { initStore as raptorInitStore, notify as raptorNotify, resetSession } from '../state/store'
import { accountsLoad, signIn, sessionFor } from '../state/accounts'
import { mayEditInput, mayFileGroup, mayFileInputFor } from '../state/perms'
import { setMembersFile } from '../state/memberfile'
import { NOTICES } from '../state/notices'
import { installGlobalUndo } from '../state/undo-wire'
import { globalUndo } from '../undo'
import { _resetTimeline } from '../undo/timeline'
import { commitInput, draftOf } from '../ui/inputedit'
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

const TUE = '2026-02-10', WED = '2026-02-11', SAT = '2026-02-14'
const D = (o: Record<string, any> = {}) => ({
  type: 'Personal', allday: false, half: '', start: TUE, end: '', sTime: '09:00', eTime: '10:00', remarks: 'errand', sans: null, docIds: [], ...o,
})
const feb = () => INPUTS.filter((r: any) => r.type === 'Personal' && String(r.date).startsWith('Feb')) as any[]
const the = () => { const l = feb(); expect(l, 'one Personal input').toHaveLength(1); return l[0] }

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

describe('a Personal input holds several people — one record, as every other kind (D776)', () => {
  it('an admin files it for three: ONE record holding the three; a fourth joins the same record; one comes out', () => {
    expect(commitInput(null, D(), ['bane', 'rocky', 'casper']), said.join(' | ')).toBe(true)
    const r = the()
    expect(idsOf(r)).toEqual(['bane', 'rocky', 'casper'])
    expect(r.by).toBe('stiff')
    expect(commitInput(r, draftOf(r), ['bane', 'rocky', 'casper', 'harpoon']), said.join(' | ')).toBe(true)
    expect(idsOf(the())).toEqual(['bane', 'rocky', 'casper', 'harpoon'])
    expect(commitInput(the(), draftOf(the()), ['bane', 'casper', 'harpoon'])).toBe(true)
    expect(idsOf(the())).toEqual(['bane', 'casper', 'harpoon'])
    expect(said.join(' | '), 'the withdrawn sentence is said nowhere').not.toMatch(/one person/i)
  })

  it('…and ALL AVAIL or ALL beside them on a ONE-DAY one (D778); never on one of several days, never both', () => {
    expect(commitInput(null, D(), ['bane', 'allavail']), said.join(' | ')).toBe(true)
    expect(idsOf(the())).toEqual(['bane', 'allavail'])
    said = []
    expect(commitInput(null, D({ start: WED, end: '2026-02-12' }), ['rocky', 'allavail'])).toBe(false)
    expect(said.join(' | ')).toContain('ALL AVAIL is for one day')
    said = []
    expect(commitInput(null, D({ start: WED }), ['rocky', 'allavail', 'all'])).toBe(false)
    expect(said.join(' | ')).toContain('This input already has ALL AVAIL')
    expect(feb()).toHaveLength(1)
  })
})

describe('a MEMBER files a Personal input for other people, under the same switch as an Event (D778)', () => {
  it('with the switch on: he may, for one man and for several; he is who filed it, and each of them is told by his bell', () => {
    ranger()
    expect(mayFileInputFor('rocky', 'Personal'), 'for another man').toBe(true)
    expect(mayFileGroup('Personal'), 'for several at once').toBe(true)
    const told = NOTICES.length
    expect(commitInput(null, D(), ['rocky', 'casper']), said.join(' | ')).toBe(true)
    const r = the()
    expect(idsOf(r)).toEqual(['rocky', 'casper'])
    expect(r.by).toBe('bane')
    for (const e of peopleOf(r)) expect(e.by, e.p).toBe('bane')
    expect(mayEditInput(r), 'its filer may change it').toBe(true)
    expect(NOTICES.length - told, 'the two he filed it for are told').toBeGreaterThanOrEqual(1)
    expect(globalUndo().ok, 'and his own Undo takes it back').toBe(true)
    expect(feb()).toHaveLength(0)
  })

  it('…and for ALL AVAIL, on one day (D702: members may choose it too)', () => {
    ranger()
    expect(commitInput(null, D(), ['bane', 'allavail']), said.join(' | ')).toBe(true)
    expect(idsOf(the())).toEqual(['bane', 'allavail'])
  })

  it('with the switch OFF: his own Personal input only — for another man, or for several, it is refused and nothing is filed', () => {
    saber(); expect(setMembersFile(false).ok).toBe(true)
    ranger()
    expect(mayFileInputFor('rocky', 'Personal')).toBe(false)
    expect(mayFileGroup('Personal')).toBe(false)
    expect(commitInput(null, D(), ['rocky', 'casper'])).toBe(false)
    expect(feb()).toHaveLength(0)
    expect(commitInput(null, D(), ['bane']), 'his own, as always').toBe(true)
    expect(idsOf(the())).toEqual(['bane'])
  })

  it('a man IN it who did not file it takes himself out and adds nobody (D763) — as on any shared input', () => {
    ranger()
    expect(commitInput(null, D(), ['bane', 'rocky', 'casper'])).toBe(true)
    hex()
    const r = the()
    expect(mayEditInput(r), 'not his to change for everyone').toBe(false)
    expect(commitInput(r, draftOf(r), ['bane', 'rocky', 'casper', 'harpoon']), 'he adds nobody').toBe(false)
    expect(idsOf(the())).toEqual(['bane', 'rocky', 'casper'])
    expect(commitInput(the(), draftOf(the()), ['bane', 'casper']), `he takes himself out: ${said.join(' | ')}`).toBe(true)
    expect(idsOf(the())).toEqual(['bane', 'casper'])
  })
})

describe('…and it is still NOT WORK: nobody is asked the OIL question, by any bell (D778)', () => {
  it('a Saturday Personal input for three, and one holding ALL AVAIL: no question waits on its filer, its people or an admin', () => {
    ranger()
    expect(commitInput(null, D({ start: SAT }), ['bane', 'rocky', 'casper']), said.join(' | ')).toBe(true)
    expect(commitInput(null, D({ start: SAT, sTime: '13:00', eTime: '14:00' }), ['bane', 'allavail']), said.join(' | ')).toBe(true)
    for (const r of feb()) expect(r.oil, 'no answer was asked for at the save').toBeUndefined()
    for (const p of ['bane', 'rocky', 'casper']) expect(oilPendingFor(p), p).toEqual([])
    saber()
    expect(oilPendingFor('stiff')).toEqual([])
  })

  it('THE CONTROL: the same filing as an EVENT does ask its filer', () => {
    ranger()
    expect(commitInput(null, D({ type: 'Event', start: SAT }), ['bane', 'rocky', 'casper']), said.join(' | ')).toBe(true)
    expect(oilPendingFor('bane').length, 'an Event is work (D713)').toBe(1)
  })
})
