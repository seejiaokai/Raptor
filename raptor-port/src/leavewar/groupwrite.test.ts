/* ONE SAVE FOR A WHOLE GROUP — the writer `commitGroup`, the check at the inputs door, and who placed each record
   (owner D654, D655, D658, D660 — 7 Oct 26; the build plan docs/superpowers/plans/2026-10-07-inputs-sans-redesign-plan.md
   §3.13 "The writer", "Records", and §3.8's rows 10 to 12).

   A group is one record per man tied by `grp`; the writer makes "one shared input" true at the save: ONE command files,
   changes or trims every record of the entry alike — all or nothing — by running the per-record bodies a single input
   already uses, so every rule a single input obeys runs for each man. Through the real doors over both wired stores.

   Saber (`stiff`) is the admin; Ranger (`bane`), Hex (`rocky`) and Outlaw (`casper`) are members. The clock starts at
   15 Jan 26; 10 Feb 26 is a Tuesday, 14 Feb a Saturday. */
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { storeBackend, HOOKS } from '../engine/hooks'
import { PEOPLE, indexCallsigns } from '../engine/people'
import { INPUTS, dateOrd, isLateInput, nowStamp } from '../engine/inputs'
import { initStore as raptorInitStore, notify as raptorNotify, resetSession, writeInputs } from '../state/store'
import { accountsLoad, signIn, sessionFor } from '../state/accounts'
import { SESSION, ME, setSession, setMe } from '../state/auth'
import { entriesOf } from '../state/inputgroup'
import { installGlobalUndo } from '../state/undo-wire'
import { commandStream } from '../command'
import { globalUndo, globalRedo } from '../undo'
import { _resetTimeline } from '../undo/timeline'
import { commitGroup, commitNewInput, removeInput, setInpField } from '../ui/inputedit'
import { initStore as lwInitStore, lwHistInit, setPeople } from './state/store'
import { memoryBackend } from './state/storage'
import { projectPeople } from './state/raptorRoster'
import { oilPendingFor, runOilPass, wireLeaveWarSync } from './sync'
import { setDayApproved, signOf } from '../engine/publish'

const mem: Record<string, string> = {}
let PEOPLE0 = ''
const ISNAP = JSON.stringify(INPUTS)
const toast = HOOKS.toast
let said: string[] = []

/* the clock: `day` of January 2026 (a day past 31 runs on into February) at `h` o'clock */
const T = (h: number, day = 15): number => { const d = new Date(2026, 0, day, h, 0, 0); vi.setSystemTime(d); return d.getTime() }
const signInAs = (name: string, pass = 'x') => { resetSession(sessionFor(signIn(name, pass))); raptorNotify() }
const saber = () => signInAs('ad', 'a')
const ranger = () => signInAs('us', 'us')
const hex = () => signInAs('hex')
const outlaw = () => signInAs('outlaw')
const flipElsewhere = (on: boolean) => { if (on) delete mem['sqn142_memberfile']; else mem['sqn142_memberfile'] = 'false' }

const TUE = '2026-02-10', SAT = '2026-02-14'
const SIX = ['bane', 'stiff', 'rocky', 'casper', 'harpoon', 'razer']
const D = (o: Record<string, any> = {}) => ({
  type: 'Meeting', allday: false, half: '', start: TUE, end: '', sTime: '09:00', eTime: '10:00', remarks: 'brief', sans: null, docIds: [], ...o,
})
const feb = (type = 'Meeting') => INPUTS.filter((r: any) => r.type === type && String(r.date).startsWith('Feb'))
const of = (p: string, type = 'Meeting') => feb(type).filter((r: any) => r.person === p)
  .sort((a: any, b: any) => (dateOrd(a.date, a.yr) as number) - (dateOrd(b.date, b.yr) as number))
const one = (p: string, type = 'Meeting') => { const l = of(p, type); expect(l, `${p} has one ${type}`).toHaveLength(1); return l[0] }
/* the entry a man's record belongs to, as the Inputs page will read it */
const entryOf = (p: string, type = 'Meeting') => entriesOf(INPUTS).find(e => e.rows.some((r: any) => r.person === p && r.type === type && String(r.date).startsWith('Feb')))!
const who = (e: { rows: any[] }) => e.rows.map(r => r.person)
const copy = (x: any) => JSON.parse(JSON.stringify(x))
const stamps = (r: any) => ({ by: r.by, at: r.at, modBy: r.modBy, modAt: r.modAt })
const raw = (fn: () => void): boolean => writeInputs(fn)
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

describe('a group filed in one command (§3.13 "The writer"; §3.8 row 10)', () => {
  it('six people: six records, one group, one filer, one moment — one command, one Undo step, Redo', () => {
    const n = cmds(), t = T(9)
    expect(commitGroup(null, D(), SIX)).toBe(true)
    expect(cmds() - n, 'ONE command').toBe(1)
    const rows = feb()
    expect(rows).toHaveLength(6)
    expect(new Set(rows.map((r: any) => r.grp)).size, 'one group id').toBe(1)
    expect(rows[0].grp).toBeTruthy()
    for (const r of rows) {
      expect(r, r.person).toMatchObject({ grpBy: 'stiff', type: 'Meeting', date: 'Feb 10', s: 540, e: 600, remarks: 'brief' })
      expect(stamps(r), r.person).toEqual({ by: 'stiff', at: t, modBy: 'stiff', modAt: t })
      expect(r.mod).toBe(nowStamp())
    }
    expect(new Set(rows.map((r: any) => r.iid)).size, 'each man his own record').toBe(6)
    const e = entryOf('bane')
    expect(who(e), 'one entry, its people A to Z by callsign').toEqual([...SIX].sort((a, b) => PEOPLE[a].cs.localeCompare(PEOPLE[b].cs)))
    const was = copy(rows)
    expect(globalUndo().ok).toBe(true)
    expect(feb(), 'one Undo takes all six back').toHaveLength(0)
    expect(globalRedo().ok).toBe(true)
    expect(copy(feb()).sort((a: any, b: any) => a.iid.localeCompare(b.iid)), 'and Redo puts them back as recorded').toEqual(was.sort((a: any, b: any) => a.iid.localeCompare(b.iid)))
  })
  it('one person is an ordinary input: no group at all', () => {
    expect(commitGroup(null, D(), ['rocky'])).toBe(true)
    const r = one('rocky')
    expect(r.grp).toBeUndefined(); expect(r.grpBy).toBeUndefined()
    expect(r.by).toBe('stiff')
  })
  it('nobody picked, or a man named twice, files nothing', () => {
    expect(commitGroup(null, D(), [])).toBe(false)
    expect(commitGroup(null, D(), ['rocky', 'rocky'])).toBe(true)
    expect(feb(), 'a name given twice is one man').toHaveLength(1)
  })
  it('a member files a duty for several people — and is its filer', () => {
    ranger()
    const t = T(9)
    expect(commitGroup(null, D(), ['bane', 'rocky', 'casper'])).toBe(true)
    for (const p of ['bane', 'rocky', 'casper']) expect(one(p), p).toMatchObject({ grpBy: 'bane', by: 'bane', at: t })
    expect(globalUndo().ok, 'his own step, though two of the records are other men\'s').toBe(true)
    expect(feb()).toHaveLength(0)
  })
  it('a member\'s group LEAVE, and one filed with the switch off, are refused with a sentence — nothing written, nobody substituted', () => {
    ranger()
    expect(commitGroup(null, D({ type: 'LL', allday: true }), ['bane', 'rocky'])).toBe(false)
    expect(said.join(' ')).toMatch(/only for yourself/)
    expect(feb('LL')).toHaveLength(0)
    flipElsewhere(false)
    said = []
    expect(commitGroup(null, D(), ['bane', 'rocky'])).toBe(false)
    expect(said.join(' ')).toMatch(/switched off/)
    expect(feb(), 'not even his own half').toHaveLength(0)
    expect(commitGroup(null, D(), ['bane']), 'for himself alone it is an ordinary input').toBe(true)
  })
  it('an admin\'s group takes any kind but the medical ones and the upchit (D655 reading 4)', () => {
    expect(commitGroup(null, D({ type: 'LL', allday: true }), ['bane', 'rocky'])).toBe(true)
    expect(feb('LL')).toHaveLength(2)
    for (const type of ['ATT C', 'OML', 'Upchit']) {
      said = []
      expect(commitGroup(null, D({ type, allday: true }), ['casper', 'harpoon']), type).toBe(false)
      expect(said.join(' '), type).toMatch(/one person at a time/)
      expect(feb(type), type).toHaveLength(0)
    }
  })
  it('an admin files SANS availability for several SANS people; a man who is not SANS refuses the whole, by name (D658)', () => {
    const sansD = D({ type: 'SANS Availability', allday: true, sans: { f: true } })
    expect(commitGroup(null, sansD, ['vinci', 'yeti'])).toBe(true)
    expect(feb('SANS Availability')).toHaveLength(2)
    said = []
    expect(commitGroup(null, D({ type: 'SANS Availability', allday: true, start: '2026-02-11', sans: { f: true } }), ['ipman', 'bane', 'romeo'])).toBe(false)
    expect(said.join(' '), 'the sentence names him').toMatch(/Ranger/)
    expect(feb('SANS Availability'), 'and nothing was written for the two SANS men either').toHaveLength(2)
    hex()
    said = []
    expect(commitGroup(null, sansD, ['vinci', 'yeti']), 'a member never files another man\'s').toBe(false)
    expect(said.join(' ')).toMatch(/only for yourself/)
  })
})

describe('all or nothing (§3.13)', () => {
  it('an admin\'s group leave where one man already has leave is refused whole, naming him', () => {
    expect(commitNewInput({ ...D({ type: 'LL', allday: true }), person: 'rocky' })).toBe(true)
    const n = cmds()
    said = []
    expect(commitGroup(null, D({ type: 'LL', allday: true }), ['bane', 'rocky', 'casper'])).toBe(false)
    expect(said, 'ONE sentence').toHaveLength(1)
    expect(said[0]).toMatch(/Hex/)
    expect(said[0]).toMatch(/nothing was saved/i)
    expect(of('bane', 'LL').length + of('casper', 'LL').length, 'nothing for the others').toBe(0)
    expect(of('rocky', 'LL'), 'his own leave as it was').toHaveLength(1)
    expect(cmds(), 'no command was kept').toBe(n)
  })
  it('a shared refusal (no end time) says so once and writes nothing', () => {
    expect(commitGroup(null, D({ sTime: '09:00', eTime: '09:00' }), ['bane', 'rocky'])).toBe(false)
    expect(said).toHaveLength(1)
    expect(feb()).toHaveLength(0)
  })
  it('a group leave where one man is recorded as working is FILED for all and flagged, in one note that names him', () => {
    /* recorded work has to be real: the seed Saturday (18 Jul 26) is published, and the OIL pass credits the man who
       stands its duty desk - Fable (`plasma`) - exactly as the running app does */
    const g = signOf(5)
    g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump'
    setDayApproved(5, true)
    runOilPass()
    const jul = () => INPUTS.filter((r: any) => r.type === 'LL' && r.date === 'Jul 18' && ['plasma', 'harpoon', 'razer'].includes(r.person))
    const had = jul().length
    said = []
    expect(commitGroup(null, D({ type: 'LL', allday: true, start: '2026-07-18' }), ['plasma', 'harpoon', 'razer'])).toBe(true)
    expect(jul().length - had, 'filed for all three').toBe(3)
    const notes = said.filter(m => m.includes('recorded as working'))
    expect(notes, 'one note').toHaveLength(1)
    expect(notes[0]).toMatch(/Fable/)
    expect(notes[0]).toMatch(/flagged for someone to resolve/)
  })
})

describe('a man added, a man taken off, the hours changed — one command each (§3.8 rows 11 and 12)', () => {
  const file = () => { const t = T(9); expect(commitGroup(null, D(), ['bane', 'rocky', 'casper'])).toBe(true); return t }
  it('a man added later: his record is placed by whoever added him, now — the others untouched', () => {
    const t1 = file(), before = copy(entryOf('bane').rows)
    outlaw()
    const t2 = T(11), n = cmds()
    expect(commitGroup(entryOf('bane'), D(), ['bane', 'rocky', 'casper', 'harpoon'])).toBe(true)
    expect(cmds() - n).toBe(1)
    expect(one('harpoon')).toMatchObject({ grp: one('bane').grp, grpBy: 'stiff', by: 'casper', at: t2, modBy: 'casper', modAt: t2 })
    expect(copy(entryOf('bane').rows.filter((r: any) => r.person !== 'harpoon')), 'nobody else was re-saved').toEqual(before)
    expect(one('bane').at).toBe(t1)
    expect(who(entryOf('bane'))).toHaveLength(4)
    expect(globalUndo().ok).toBe(true)
    expect(of('harpoon')).toHaveLength(0)
    expect(copy(entryOf('bane').rows)).toEqual(before)
  })
  it('a man taken off: his record goes, the others untouched', () => {
    file()
    const before = copy(entryOf('bane').rows.filter((r: any) => r.person !== 'rocky'))
    T(11)
    const n = cmds()
    expect(commitGroup(entryOf('bane'), D(), ['bane', 'casper'])).toBe(true)
    expect(cmds() - n).toBe(1)
    expect(of('rocky')).toHaveLength(0)
    expect(copy(entryOf('bane').rows)).toEqual(before)
    expect(globalUndo().ok).toBe(true)
    expect(who(entryOf('bane'))).toHaveLength(3)
  })
  it('the shared input changed for everyone: who placed each is kept, who changed it is on each, now', () => {
    const t1 = file()
    hex(); T(10)                                        // nothing of Hex's own; just not the filer
    saber()
    const t2 = T(12), n = cmds()
    expect(commitGroup(entryOf('bane'), D({ sTime: '13:00', eTime: '15:00', remarks: 'moved' }), ['bane', 'rocky', 'casper'])).toBe(true)
    expect(cmds() - n).toBe(1)
    for (const p of ['bane', 'rocky', 'casper']) {
      expect(one(p), p).toMatchObject({ s: 780, e: 900, remarks: 'moved' })
      expect(stamps(one(p)), p).toEqual({ by: 'stiff', at: t1, modBy: 'stiff', modAt: t2 })
    }
    expect(who(entryOf('bane')), 'still one entry').toHaveLength(3)
    expect(globalUndo().ok).toBe(true)
    for (const p of ['bane', 'rocky', 'casper']) expect(stamps(one(p)), `undone: ${p}`).toEqual({ by: 'stiff', at: t1, modBy: 'stiff', modAt: t1 })
  })
  it('all three in one Save: one command, one Undo step', () => {
    file()
    const before = copy(feb())
    T(12)
    const n = cmds()
    expect(commitGroup(entryOf('bane'), D({ eTime: '11:00' }), ['bane', 'casper', 'harpoon'])).toBe(true)
    expect(cmds() - n).toBe(1)
    expect(who(entryOf('bane')).sort()).toEqual(['bane', 'casper', 'harpoon'])
    for (const p of ['bane', 'casper', 'harpoon']) expect(one(p).e, p).toBe(660)
    expect(of('rocky')).toHaveLength(0)
    expect(globalUndo().ok).toBe(true)
    expect(copy(feb()).sort((a: any, b: any) => a.iid.localeCompare(b.iid))).toEqual(before.sort((a: any, b: any) => a.iid.localeCompare(b.iid)))
  })
  it('a Save that changes nothing makes no command', () => {
    file()
    const n = cmds()
    expect(commitGroup(entryOf('bane'), D(), ['bane', 'rocky', 'casper'])).toBe(true)
    expect(cmds()).toBe(n)
  })
  it('a man added after the cut-off: he alone is late — the others\' late date and stamps untouched, through Undo and Redo', () => {
    file()
    const before = copy(entryOf('bane').rows)
    T(9, 36)                                            // 5 Feb: past the cut-off for the 10th
    expect(commitGroup(entryOf('bane'), D(), ['bane', 'rocky', 'casper', 'harpoon'])).toBe(true)
    expect(isLateInput(one('harpoon'))).toBe(true)
    for (const p of ['bane', 'rocky', 'casper']) expect(isLateInput(one(p)), p).toBe(false)
    expect(copy(entryOf('bane').rows.filter((r: any) => r.person !== 'harpoon'))).toEqual(before)
    expect(globalUndo().ok).toBe(true)
    expect(copy(entryOf('bane').rows)).toEqual(before)
    expect(globalRedo().ok).toBe(true)
    expect(isLateInput(one('harpoon'))).toBe(true)
    for (const p of ['bane', 'rocky', 'casper']) expect(isLateInput(one(p)), `redone: ${p}`).toBe(false)
  })
  it('a man taken off after the cut-off marks nobody late', () => {
    file()
    T(9, 36)
    expect(commitGroup(entryOf('bane'), D(), ['bane', 'casper'])).toBe(true)
    for (const p of ['bane', 'casper']) expect(isLateInput(one(p)), p).toBe(false)
  })
})

describe('whose entry it is (§3.13 "Who the entry\'s filer is")', () => {
  it('an admin adds a man to a member\'s entry — and that member still changes, and deletes, the whole of it', () => {
    ranger()
    expect(commitGroup(null, D(), ['bane', 'rocky'])).toBe(true)
    saber()
    expect(commitGroup(entryOf('bane'), D(), ['bane', 'rocky', 'casper'])).toBe(true)
    expect(one('casper')).toMatchObject({ by: 'stiff', grpBy: 'bane' })
    ranger()
    expect(commitGroup(entryOf('bane'), D({ remarks: 'room 2' }), ['bane', 'rocky', 'casper']), 'the whole entry is still his').toBe(true)
    for (const p of ['bane', 'rocky', 'casper']) expect(one(p).remarks, p).toBe('room 2')
    expect(one('casper').by, 'who placed Outlaw\'s record is still Saber').toBe('stiff')
    for (const r of [...entryOf('bane').rows]) expect(removeInput(r), r.person).toBe(true)
    expect(feb()).toHaveLength(0)
  })
  it('a single input made a group by an admin keeps the member who filed it as its filer', () => {
    ranger()
    expect(commitGroup(null, D(), ['rocky'])).toBe(true)          // Ranger files for Hex alone
    saber()
    expect(commitGroup(entryOf('rocky'), D(), ['rocky', 'casper'])).toBe(true)
    expect(one('rocky')).toMatchObject({ by: 'bane', grpBy: 'bane' })
    expect(one('casper')).toMatchObject({ by: 'stiff', grpBy: 'bane' })
    expect(one('rocky').grp).toBe(one('casper').grp)
  })
  it('…and one with no filer recorded becomes that admin\'s', () => {
    raw(() => { INPUTS.unshift({ iid: 'zzold', person: 'rocky', type: 'Meeting', date: 'Feb 10', yr: 2026, allday: false, s: 540, e: 600, remarks: 'brief', mod: nowStamp() }) })
    expect(commitGroup(entryOf('rocky'), D(), ['rocky', 'casper'])).toBe(true)
    expect(one('rocky')).toMatchObject({ grpBy: 'stiff' })
    expect(one('rocky').by).toBeUndefined()
  })
  it('a member makes his admin-filed input a group: he is the entry\'s filer; who placed his own record is unchanged', () => {
    expect(commitGroup(null, D(), ['bane'])).toBe(true)           // Saber files for Ranger
    ranger()
    expect(commitGroup(entryOf('bane'), D(), ['bane', 'rocky'])).toBe(true)
    expect(one('bane')).toMatchObject({ by: 'stiff', grpBy: 'bane' })
    expect(one('rocky')).toMatchObject({ by: 'bane', grpBy: 'bane' })
  })
  it('a group taken back to one man reads and edits as an ordinary input', () => {
    expect(commitGroup(null, D(), ['bane', 'rocky'])).toBe(true)
    expect(commitGroup(entryOf('bane'), D(), ['bane'])).toBe(true)
    expect(who(entryOf('bane'))).toEqual(['bane'])
    expect(commitGroup(entryOf('bane'), D({ remarks: 'alone' }), ['bane'])).toBe(true)
    expect(one('bane').remarks).toBe('alone')
  })
  it('the entry\'s filer taken off its people can still change it', () => {
    ranger()
    expect(commitGroup(null, D(), ['bane', 'rocky', 'casper'])).toBe(true)
    expect(commitGroup(entryOf('bane'), D(), ['rocky', 'casper']), 'he takes himself out').toBe(true)
    expect(of('bane')).toHaveLength(0)
    expect(commitGroup(entryOf('rocky'), D({ remarks: 'still mine to change' }), ['rocky', 'casper'])).toBe(true)
    expect(one('casper').remarks).toBe('still mine to change')
  })
  it('a man in it who did not file it takes himself out, and changes nothing for the others', () => {
    expect(commitGroup(null, D(), ['bane', 'rocky', 'casper'])).toBe(true)
    hex()
    said = []
    expect(commitGroup(entryOf('rocky'), D({ remarks: 'mine' }), ['bane', 'rocky', 'casper']), 'the whole entry is not his').toBe(false)
    expect(said.join(' ')).toMatch(/who filed it|admin/i)
    expect(one('bane').remarks).toBe('brief')
    expect(commitGroup(entryOf('rocky'), D(), ['bane', 'casper']), 'take me out').toBe(true)
    expect(of('rocky')).toHaveLength(0)
    expect(who(entryOf('bane')).sort()).toEqual(['bane', 'casper'])
  })
})

describe('the OIL question, answered once for all by whoever files (D660)', () => {
  const sat = (o: Record<string, any> = {}) => D({ start: SAT, ...o })
  it('a weekend duty filed for six: the one answer is on all six records — no bell lit for any of them', () => {
    expect(commitGroup(null, sat(), SIX, { [SAT]: 0.5 })).toBe(true)
    for (const p of SIX) {
      expect(one(p).oil, p).toEqual({ [SAT]: 0.5 })
      expect(oilPendingFor(p).filter(x => x.iid === one(p).iid), `${p}'s bell`).toEqual([])
    }
    const a = one('bane').oil, b = one('rocky').oil
    expect(a, 'each record its own copy of the answer').not.toBe(b)
  })
  it('filed with no answer given, every man is left unanswered — the save itself never invents one', () => {
    expect(commitGroup(null, sat(), ['bane', 'rocky'])).toBe(true)
    for (const p of ['bane', 'rocky']) expect(one(p).oil, p).toBeUndefined()
    expect(oilPendingFor('bane').some(x => x.iid === one('bane').iid)).toBe(true)
  })
  it('the hours changed: every claim the new hours no longer price is voided on every record — and the filer\'s fresh answer lands on all', () => {
    expect(commitGroup(null, sat(), ['bane', 'rocky', 'casper'], { [SAT]: 0.5 })).toBe(true)
    expect(commitGroup(entryOf('bane'), sat({ allday: true }), ['bane', 'rocky', 'casper'])).toBe(true)
    for (const p of ['bane', 'rocky', 'casper']) expect(one(p).oil, `voided: ${p}`).toBeUndefined()
    expect(commitGroup(entryOf('bane'), sat({ allday: true, remarks: 'all day' }), ['bane', 'rocky', 'casper'], { [SAT]: 1 })).toBe(true)
    for (const p of ['bane', 'rocky', 'casper']) expect(one(p).oil, `answered again: ${p}`).toEqual({ [SAT]: 1 })
  })
  it('one man then changes his own answer; the others\' are untouched', () => {
    expect(commitGroup(null, sat(), ['bane', 'rocky', 'casper'], { [SAT]: 0.5 })).toBe(true)
    hex()
    expect(raw(() => { one('rocky').oil = { [SAT]: 0 } })).toBe(true)
    expect(one('rocky').oil).toEqual({ [SAT]: 0 })
    for (const p of ['bane', 'casper']) expect(one(p).oil, p).toEqual({ [SAT]: 0.5 })
    expect(who(entryOf('bane')), 'his answer is his own: still one entry').toHaveLength(3)
  })
  /* by a man who may ADD somebody but did not file the entry: he answers for the man he adds, and nobody else's
     answer is his to replace (unchanged by D682, which is about whoever FILED it) */
  it('a man added later by someone who did not file it is answered for at that save — nobody else\'s answer moves', () => {
    expect(commitGroup(null, sat(), ['bane', 'rocky'], { [SAT]: 0.5 })).toBe(true)
    outlaw()
    expect(commitGroup(entryOf('bane'), sat(), ['bane', 'rocky', 'harpoon'], { [SAT]: 0 })).toBe(true)
    expect(one('harpoon').oil).toEqual({ [SAT]: 0 })
    for (const p of ['bane', 'rocky']) expect(one(p).oil, p).toEqual({ [SAT]: 0.5 })
  })
  /* HIS RULING D682 (9 Oct 26: "whoever filed a shared duty and answers its OIL question again answers for everyone in
     it, replacing a person's own earlier No" — "yes that's what I want"). Adding a man brings the question back for
     "X +2"; the FILER's answer went on the added man alone, while a man's own earlier No stood (Sol's read of the
     date door, 9 Oct 26 — seen failing here first). */
  it('the FILER adds a man and answers again: the answer is on every record — a man\'s own earlier No replaced (D682)', () => {
    expect(commitGroup(null, sat(), ['bane', 'rocky'], { [SAT]: 0.5 })).toBe(true)
    expect(raw(() => { one('rocky').oil = { [SAT]: 0 } })).toBe(true)
    const n = cmds()
    expect(commitGroup(entryOf('bane'), sat(), ['bane', 'rocky', 'harpoon'], { [SAT]: 0.5 })).toBe(true)
    expect(cmds() - n, 'one command').toBe(1)
    for (const p of ['bane', 'rocky', 'harpoon']) expect(one(p).oil, p).toEqual({ [SAT]: 0.5 })
    expect(globalUndo().ok).toBe(true)
    expect(one('rocky').oil, 'one Undo: his own No is back').toEqual({ [SAT]: 0 })
    expect(of('harpoon')).toHaveLength(0)
  })
  it('...and with NO answer given (the question cancelled) nobody\'s answer moves', () => {
    expect(commitGroup(null, sat(), ['bane', 'rocky'], { [SAT]: 0.5 })).toBe(true)
    expect(commitGroup(entryOf('bane'), sat(), ['bane', 'rocky', 'harpoon'])).toBe(true)
    expect(one('harpoon').oil).toBeUndefined()
    for (const p of ['bane', 'rocky']) expect(one(p).oil, p).toEqual({ [SAT]: 0.5 })
  })
  it('the filer revises the answer for all: nothing else changed, the new answer is on every record — an OIL answer alone (§3.8 row 4)', () => {
    const t1 = T(9)
    expect(commitGroup(null, sat(), ['bane', 'rocky', 'casper'], { [SAT]: 0.5 })).toBe(true)
    const mods = ['bane', 'rocky', 'casper'].map(p => one(p).mod)
    const t2 = T(9, 40), n = cmds()                     // weeks later, past the cut-off
    expect(commitGroup(entryOf('bane'), sat(), ['bane', 'rocky', 'casper'], { [SAT]: 0 })).toBe(true)
    expect(cmds() - n).toBe(1)
    for (const p of ['bane', 'rocky', 'casper']) {
      expect(one(p).oil, p).toEqual({ [SAT]: 0 })
      expect(stamps(one(p)), p).toEqual({ by: 'stiff', at: t1, modBy: 'stiff', modAt: t2 })
    }
    expect(['bane', 'rocky', 'casper'].map(p => one(p).mod), 'an answer alone never moves the late date').toEqual(mods)
    expect(globalUndo().ok).toBe(true)
    for (const p of ['bane', 'rocky', 'casper']) expect(one(p).oil, `undone: ${p}`).toEqual({ [SAT]: 0.5 })
  })
  it('a member filer\'s answer for the others is held to what the hours give — a bad one rolls the whole group back', () => {
    ranger()
    said = []
    expect(commitGroup(null, sat(), ['bane', 'rocky', 'casper'], { [SAT]: 1 })).toBe(false)
    expect(feb(), 'nothing filed for anyone').toHaveLength(0)
    expect(said.join(' '), 'and it says so').toMatch(/not saved|nothing was saved/i)
    expect(commitGroup(null, sat(), ['bane', 'rocky', 'casper'], { [SAT]: 0.5 })).toBe(true)
    expect(feb()).toHaveLength(3)
  })
})

describe('one man once an entry, one filer a group — held at the write (§3.13 "Records", finding G5)', () => {
  it('a hand-made write of the same man twice is refused, naming him', () => {
    expect(commitGroup(null, D(), ['bane', 'rocky'])).toBe(true)
    const g = one('bane').grp
    said = []
    expect(raw(() => { INPUTS.unshift({ ...copy(one('rocky')), iid: 'zzdup' }) })).toBe(false)
    expect(said.join(' ')).toMatch(/Hex is already on this input/)
    expect(of('rocky')).toHaveLength(1)
    expect(raw(() => { INPUTS.unshift({ ...copy(one('rocky')), iid: 'zzother', person: 'casper', grpBy: 'casper' }) }), 'a second filer').toBe(false)
    expect(of('casper')).toHaveLength(0)
    expect(one('bane').grp).toBe(g)
  })
  it('the writer never files a man twice: asked to add one who is already on it, it changes nothing', () => {
    expect(commitGroup(null, D(), ['bane', 'rocky'])).toBe(true)
    const n = cmds()
    expect(commitGroup(entryOf('bane'), D(), ['bane', 'rocky', 'rocky'])).toBe(true)
    expect(cmds()).toBe(n)
    expect(of('rocky')).toHaveLength(1)
  })
  it('a record changed alone, the same man added again, the first changed back — refused at the last step, by the board\'s cell', () => {
    expect(commitGroup(null, D(), ['bane', 'rocky'])).toBe(true)
    const stray = one('rocky')
    expect(setInpField(stray, 'end', '11:00'), 'Hex\'s record changed alone').toBe(true)
    expect(who(entryOf('bane')), 'it reads as his own input now').toEqual(['bane'])
    expect(commitGroup(entryOf('bane'), D(), ['bane', 'rocky']), 'the same man added to the entry again').toBe(true)
    expect(of('rocky')).toHaveLength(2)
    said = []
    expect(setInpField(INPUTS.find((r: any) => r.iid === stray.iid), 'end', '10:00'), 'the first changed back').toBe(false)
    expect(said.join(' ')).toMatch(/Hex is already on this input/)
    expect(INPUTS.find((r: any) => r.iid === stray.iid).e, 'and it stays as it was').toBe(660)
  })
  it('…and by Undo alike: the step that would put the first record back is refused with the same sentence', () => {
    expect(commitGroup(null, D(), ['bane', 'rocky'])).toBe(true)
    hex()
    const strayId = one('rocky').iid
    expect(setInpField(one('rocky'), 'end', '11:00'), 'Hex changes his own record').toBe(true)
    asSaberElsewhere(() => { expect(commitGroup(entryOf('bane'), D(), ['bane', 'rocky']), 'Saber adds Hex to the entry again').toBe(true) })
    expect(of('rocky')).toHaveLength(2)
    said = []
    const u = globalUndo()
    expect(u.ok).toBe(false)
    expect(u.reason).toMatch(/Hex is already on this input/)
    expect(INPUTS.find((r: any) => r.iid === strayId).e).toBe(660)
  })
})

/* ANOTHER PERSON'S COMMAND WHILE THE SIGNED-IN PERSON STAYS SIGNED IN. A sign-in or sign-out clears the Undo steps
   (D148), so a test of "someone else has since changed something" cannot sign anyone out: the session and the person
   are swapped for the length of `fn` and put back, which is what a second device's command is to this one. */
function asSaberElsewhere(fn: () => void): void {
  const s = SESSION, m = ME
  setSession({ user: 'acad', role: 'admin', pid: 'stiff', name: 'ad', acct: 'admin' }); setMe('stiff')
  try { fn() } finally { setSession(s); setMe(m) }
}
