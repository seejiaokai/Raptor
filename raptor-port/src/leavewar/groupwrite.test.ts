/* ONE SAVE FOR AN INPUT OF SEVERAL PEOPLE — the one writer (`commitInput`), what each save leaves on the ONE record, and
   the check at the inputs door (owner D654, D655, D658, D660 — 7 Oct 26; the build plan
   docs/superpowers/plans/2026-10-07-inputs-sans-redesign-plan.md §3.13 "The writer", "Records", and §3.8's rows 10 to 12).

   RE-EXPRESSED ON THE ONE RECORD (the one-rule build, step 2 — owner D756, 11 Oct 26: "an input is stored as ONE record
   with the list of its people"; the plan docs/superpowers/plans/2026-10-11-one-rule-plan.md §4.1, §4.4 "The writer",
   §4.6, §4.9). Until then a group was one record per man tied by `grp`, saved by `commitGroup`, and this file read "the
   men" as records. An input of several is now ONE record: who is in it is its own list (engine/inputs.ts idsOf,
   peopleOf — each entry saying who put that man in, when, and his own late date), with ONE filing (`by` / `at`), ONE
   late date (`mod`) and ONE OIL answer (`oil`). What each man's day reads of it is one LINE a named person
   (`inputLines`). The assertions keep their substance — one command, one Undo step, who placed it and when, what is
   late, what a refusal says — and say so where a ruling CHANGED the rule itself:
     D762 — one OIL answer for everyone in an input, given by whoever filed it or an admin; no man gives his own;
     D763 — a person in a shared input he did not file adds nobody (he may always take himself out);
     D755 (3) — once a scheduler has put someone in, changing it for everyone is the scheduler's;
     D759 reading 4 — a change to one man's part alone gives him an input of his own (it "left the entry" by itself).

   NOT REPEATED HERE — pinned by the two worked files of that build, leavewar/onerecord-write.test.ts and
   onerecord-perms.test.ts: six people filed as one record in one command with its Undo and Redo; one person as an
   input of one, a name given twice, nobody; a member filing for several as its filer; a man in it taking himself out
   and changing nothing else; "by" staying with a filer who takes himself out of his own filing; a person twice held at
   the door. Through the real doors over both wired stores.

   Saber (`stiff`) is the admin; Ranger (`bane`), Hex (`rocky`) and Outlaw (`casper`) are members. The clock starts at
   15 Jan 26; 10 Feb 26 is a Tuesday, 14 Feb a Saturday. */
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { storeBackend, HOOKS } from '../engine/hooks'
import { PEOPLE, indexCallsigns } from '../engine/people'
import { INPUTS, entryOf, holds, idsOf, inputLines, isLateInput, nowStamp, onlyNamed, peopleOf } from '../engine/inputs'
import { initStore as raptorInitStore, notify as raptorNotify, resetSession, writeInputs } from '../state/store'
import { accountsLoad, signIn, sessionFor } from '../state/accounts'
import { SESSION, ME, setSession, setMe } from '../state/auth'
import { mayDeleteInput, mayEditInput } from '../state/perms'
import { installGlobalUndo } from '../state/undo-wire'
import { commandStream } from '../command'
import { globalUndo, globalRedo } from '../undo'
import { _resetTimeline } from '../undo/timeline'
import { commitInput, commitNewInput, draftOf, removeInput, setInpField } from '../ui/inputedit'
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
const THREE = ['bane', 'rocky', 'casper']
const D = (o: Record<string, any> = {}) => ({
  type: 'Meeting', allday: false, half: '', start: TUE, end: '', sTime: '09:00', eTime: '10:00', remarks: 'brief', sans: null, docIds: [], ...o,
})
const feb = (type = 'Meeting') => INPUTS.filter((r: any) => r.type === type && String(r.date).startsWith('Feb')) as any[]
/* THE input of a kind in the test's month — one record, however many people it holds */
const the = (type = 'Meeting') => { const l = feb(type); expect(l, `one ${type}`).toHaveLength(1); return l[0] }
/* what each man's day reads of it: is his line late? (the late mark of ONE man of several — his entry's own date) */
const late = (r: any): Record<string, boolean> => Object.fromEntries(inputLines([r]).map((l: any) => [l.person, isLateInput(l)]))
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

describe('an input for several people, filed in one command (§3.13 "The writer"; §3.8 row 10)', () => {
  it('a member\'s LEAVE for several, and anything filed for others with the switch off, are refused with a sentence — nothing written, nobody substituted', () => {
    ranger()
    expect(commitInput(null, D({ type: 'LL', allday: true }), ['bane', 'rocky'])).toBe(false)
    expect(said.join(' ')).toMatch(/only for yourself/)
    expect(feb('LL')).toHaveLength(0)
    flipElsewhere(false)
    said = []
    expect(commitInput(null, D(), ['bane', 'rocky'])).toBe(false)
    expect(said.join(' ')).toMatch(/switched off/)
    expect(feb(), 'not even his own half').toHaveLength(0)
    expect(commitInput(null, D(), ['bane']), 'for himself alone it is an ordinary input').toBe(true)
    expect(onlyNamed(the())).toBe('bane')
  })
  /* THE SENTENCE CHANGED with the rule's home (the one-rule plan §4.1, §4.4): "one person at a time" was the group
     save's own wording; a medical entry for two is now refused by what ONE RECORD may hold (engine/inputs.ts
     shapeProblem), in the words every door says — "… is one person's — each needs its own document". */
  it('an admin\'s input for several takes any kind but the medical ones and the upchit (D655 reading 4)', () => {
    expect(commitInput(null, D({ type: 'LL', allday: true }), ['bane', 'rocky'])).toBe(true)
    expect(idsOf(the('LL')), 'ONE record of the leave, both in it').toEqual(['bane', 'rocky'])
    expect(inputLines(feb('LL')).map((l: any) => l.person), 'and the Leave War reads a line of it for each man').toEqual(['bane', 'rocky'])
    for (const type of ['ATT C', 'OML']) {
      said = []
      expect(commitInput(null, D({ type, allday: true }), ['casper', 'harpoon']), type).toBe(false)
      expect(said.join(' '), type).toMatch(/A medical entry is one person’s — each needs its own document/)
      expect(feb(type), type).toHaveLength(0)
    }
    /* THE UPCHIT, asked where each man HAS something to upchit: every refusal a one-person input can meet is asked for
       each person before what one record may hold, so with no downchit on either man the save says THAT first ("There
       is no medical-down entry to upchit") — true, and not the rule under test here. */
    for (const p of ['casper', 'harpoon']) expect(commitNewInput({ ...D({ type: 'ATT C', allday: true, start: '2026-02-09', end: '2026-02-12' }), person: p }), p).toBe(true)
    said = []
    expect(commitInput(null, D({ type: 'Upchit', allday: true }), ['casper', 'harpoon']), 'Upchit').toBe(false)
    expect(said.join(' ')).toMatch(/An upchit is one person’s — each needs its own document/)
    expect(feb('Upchit')).toHaveLength(0)
    expect(feb('ATT C').map(r => idsOf(r)), 'and neither man\'s downchit was cut').toEqual([['harpoon'], ['casper']])
  })
  it('an admin files SANS availability for several SANS people; a man who is not SANS refuses the whole, by name (D658)', () => {
    const sansD = D({ type: 'SANS Availability', allday: true, sans: { f: true } })
    expect(commitInput(null, sansD, ['vinci', 'yeti'])).toBe(true)
    expect(idsOf(the('SANS Availability')), 'one record, the two SANS men in it').toEqual(['vinci', 'yeti'])
    said = []
    expect(commitInput(null, D({ type: 'SANS Availability', allday: true, start: '2026-02-11', sans: { f: true } }), ['ipman', 'bane', 'romeo'])).toBe(false)
    expect(said.join(' '), 'the sentence names him').toMatch(/Ranger/)
    expect(feb('SANS Availability'), 'and nothing was written for the two SANS men either').toHaveLength(1)
    hex()
    said = []
    /* (on a day nobody has filed for: on the 10th the save meets "a SANS availability is already filed for one of these
       days" for each man first — the per-person refusals are asked before who may) */
    expect(commitInput(null, { ...sansD, start: '2026-02-12' }, ['vinci', 'yeti']), 'a member never files another man\'s').toBe(false)
    expect(said.join(' ')).toMatch(/You can file SANS availability only for yourself/)
    expect(feb('SANS Availability')).toHaveLength(1)
  })
})

describe('all or nothing (§3.13)', () => {
  it('an admin\'s leave for several where one man already has leave is refused whole, naming him', () => {
    expect(commitNewInput({ ...D({ type: 'LL', allday: true }), person: 'rocky' })).toBe(true)
    const his = copy(the('LL'))
    const n = cmds()
    said = []
    expect(commitInput(null, D({ type: 'LL', allday: true }), THREE)).toBe(false)
    expect(said, 'ONE sentence').toHaveLength(1)
    expect(said[0]).toMatch(/Hex/)
    expect(said[0]).toMatch(/nothing was saved/i)
    expect(inputLines(feb('LL')).map((l: any) => l.person), 'nothing for the others').toEqual(['rocky'])
    expect(copy(the('LL')), 'his own leave as it was').toEqual(his)
    expect(cmds(), 'no command was kept').toBe(n)
  })
  it('a shared refusal (no end time) says so once and writes nothing', () => {
    expect(commitInput(null, D({ sTime: '09:00', eTime: '09:00' }), ['bane', 'rocky'])).toBe(false)
    expect(said).toHaveLength(1)
    expect(feb()).toHaveLength(0)
  })
  it('a leave for several where one man is recorded as working is FILED for all and flagged, in one note that names him', () => {
    /* recorded work has to be real: the seed Saturday (18 Jul 26) is published, and the OIL pass credits the man who
       stands its duty desk - Fable (`plasma`) - exactly as the running app does */
    const g = signOf(5)
    g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump'
    setDayApproved(5, true)
    runOilPass()
    const WHO = ['plasma', 'harpoon', 'razer']
    const jul = () => inputLines(INPUTS.filter((r: any) => r.type === 'LL' && r.date === 'Jul 18')).filter((l: any) => WHO.includes(l.person))
    const had = jul().length
    said = []
    expect(commitInput(null, D({ type: 'LL', allday: true, start: '2026-07-18' }), WHO)).toBe(true)
    expect(jul().length - had, 'filed for all three: a line of the leave for each').toBe(3)
    expect(INPUTS.filter((r: any) => r.type === 'LL' && r.date === 'Jul 18' && WHO.every(p => holds(r, p))), 'in ONE record').toHaveLength(1)
    const notes = said.filter(m => m.includes('recorded as working'))
    expect(notes, 'one note').toHaveLength(1)
    expect(notes[0]).toMatch(/Fable/)
    expect(notes[0]).toMatch(/flagged for someone to resolve/)
  })
})

describe('a man added, a man taken off, the hours changed — one command each (§3.8 rows 11 and 12)', () => {
  const file = () => { const t = T(9); expect(commitInput(null, D(), THREE)).toBe(true); return t }
  /* THE RULE CHANGED (owner D763, 11 Oct 26: "who is in an input is changed only by whoever filed it or by a scheduler: a
     person who is in a shared input he did not file does not add anyone to it"). This case had Outlaw — in Saber's
     input, not its filer — add Harpoon, and pass. He is refused now; the rule that survives is asked of a scheduler
     who did not file it: the man he adds is put in by HIM, now, and nothing else of the input moves. */
  it('a man added later by a scheduler who did not file it: his entry is placed by whoever added him, now — the filing and the others untouched; a member in it who did not file it adds nobody (D763)', () => {
    ranger()
    const t1 = T(9)
    expect(commitInput(null, D(), THREE)).toBe(true)
    const was = copy(the())
    outlaw()
    T(10)
    said = []
    const n0 = cmds()
    expect(commitInput(the(), D(), [...THREE, 'harpoon']), 'Outlaw is in it, and did not file it').toBe(false)
    expect(said.join(' '), 'he is told who can').toMatch(/Only Ranger — who filed it — or an admin can change this for everyone/)
    expect(cmds(), 'no command').toBe(n0)
    expect(copy(the())).toEqual(was)
    saber()
    const t2 = T(11), n = cmds()
    expect(commitInput(the(), D(), [...THREE, 'harpoon'])).toBe(true)
    expect(cmds() - n).toBe(1)
    expect(feb(), 'still ONE record').toHaveLength(1)
    expect(entryOf(the(), 'harpoon')).toMatchObject({ p: 'harpoon', by: 'stiff', at: t2 })
    expect(peopleOf(the()).slice(0, 3), 'nobody else\'s entry was re-saved').toEqual(was.people)
    expect(the(), 'the filing is still Ranger\'s, at the moment he filed it; the late date did not move').toMatchObject({ iid: was.iid, by: 'bane', at: t1, mod: was.mod, modBy: 'stiff', modAt: t2 })
    expect(globalUndo().ok).toBe(true)
    expect(copy(the()), 'one Undo: Harpoon is out and the record reads as before').toEqual(was)
  })
  it('a man taken off: his entry goes, the others\' untouched', () => {
    const t1 = file()
    const was = copy(the())
    const t2 = T(11), n = cmds()
    expect(commitInput(the(), D(), ['bane', 'casper'])).toBe(true)
    expect(cmds() - n).toBe(1)
    expect(idsOf(the())).toEqual(['bane', 'casper'])
    expect(peopleOf(the())).toEqual([was.people[0], was.people[2]])
    expect(inputLines([the()]).map((l: any) => l.person), 'Hex\'s day no longer reads it').toEqual(['bane', 'casper'])
    expect(the()).toMatchObject({ iid: was.iid, by: 'stiff', at: t1, mod: was.mod, modBy: 'stiff', modAt: t2 })
    expect(globalUndo().ok).toBe(true)
    expect(copy(the())).toEqual(was)
  })
  it('the shared input changed for everyone: who placed it and who put each man in are kept, who changed it is on it, now', () => {
    ranger()
    const t1 = T(9)
    expect(commitInput(null, D(), THREE)).toBe(true)
    const was = copy(the())
    saber()
    const t2 = T(12), n = cmds()
    expect(commitInput(the(), D({ sTime: '13:00', eTime: '15:00', remarks: 'moved' }), THREE)).toBe(true)
    expect(cmds() - n).toBe(1)
    expect(feb(), 'still one input').toHaveLength(1)
    expect(stamps(the())).toEqual({ by: 'bane', at: t1, modBy: 'stiff', modAt: t2 })
    expect(peopleOf(the()), 'each man put in by Ranger, at the filing').toEqual(was.people)
    for (const l of inputLines([the()])) expect(l, `what ${l.person}'s day reads`).toMatchObject({ s: 780, e: 900, remarks: 'moved' })
    expect(globalUndo().ok).toBe(true)
    expect(stamps(the()), 'undone').toEqual({ by: 'bane', at: t1, modBy: 'bane', modAt: t1 })
    expect(copy(the())).toEqual(was)
  })
  it('all three in one Save: one command, one Undo step', () => {
    file()
    const was = copy(the())
    T(12)
    const n = cmds()
    expect(commitInput(the(), D({ eTime: '11:00' }), ['bane', 'casper', 'harpoon'])).toBe(true)
    expect(cmds() - n).toBe(1)
    expect(idsOf(the())).toEqual(['bane', 'casper', 'harpoon'])
    expect(inputLines([the()]).map((l: any) => [l.person, l.e])).toEqual([['bane', 660], ['casper', 660], ['harpoon', 660]])
    expect(globalUndo().ok).toBe(true)
    expect(copy(feb())).toEqual([was])
  })
  it('a Save that changes nothing makes no command', () => {
    file()
    const n = cmds(), was = copy(the())
    expect(commitInput(the(), D(), THREE)).toBe(true)
    expect(cmds()).toBe(n)
    expect(copy(the()), 'not even who changed it last').toEqual(was)
  })
  it('a man added after the cut-off: he alone is late — the input\'s late date and the others\' entries untouched, through Undo and Redo', () => {
    file()
    const was = copy(the())
    expect(was.mod, 'the input\'s late date is the day it was filed').toBe(nowStamp())
    T(9, 36)                                            // 5 Feb: past the cut-off for the 10th
    expect(commitInput(the(), D(), [...THREE, 'harpoon'])).toBe(true)
    expect(late(the())).toEqual({ bane: false, rocky: false, casper: false, harpoon: true })
    expect(entryOf(the(), 'harpoon').mod, 'his own late date rides his entry').toBe(nowStamp())
    expect(the().mod, 'the input\'s own did not move').toBe(was.mod)
    expect(isLateInput(the()), 'so the input itself is not late').toBe(false)
    expect(peopleOf(the()).slice(0, 3)).toEqual(was.people)
    expect(globalUndo().ok).toBe(true)
    expect(copy(the())).toEqual(was)
    expect(globalRedo().ok).toBe(true)
    expect(late(the()), 'redone').toEqual({ bane: false, rocky: false, casper: false, harpoon: true })
  })
  it('a man taken off after the cut-off marks nobody late', () => {
    file()
    const mod = the().mod
    T(9, 36)
    expect(commitInput(the(), D(), ['bane', 'casper'])).toBe(true)
    expect(late(the())).toEqual({ bane: false, casper: false })
    expect(the().mod).toBe(mod)
  })
})

describe('whose input it is (§3.13 "Who the entry\'s filer is" — one filing, `by`, on the one record)', () => {
  /* THE RULE CHANGED (owner D755 (3), 11 Oct 26: "changing it for everyone, once the scheduler has added others, is the
     scheduler's"). This case ended with the member who filed it still changing and DELETING the whole of it after an
     admin had added a man; he no longer may. (His change refused, and what he is told: onerecord-perms.test.ts. Kept
     here: the delete, by its own door, and the admin's entry staying the admin's.) */
  it('an admin adds a man to a member\'s input — the member who filed it no longer deletes the whole of it (D755 (3)); the admin\'s entry is the admin\'s', () => {
    ranger()
    expect(commitInput(null, D(), ['bane', 'rocky'])).toBe(true)
    saber()
    expect(commitInput(the(), D(), THREE)).toBe(true)
    expect(the().by, 'still Ranger\'s filing').toBe('bane')
    expect(entryOf(the(), 'casper').by, 'who put Outlaw in is Saber').toBe('stiff')
    ranger()
    const was = copy(the())
    expect(mayDeleteInput(the())).toBe(false)
    said = []
    expect(removeInput(the()), 'the Delete door').toBe(false)
    expect(said.join(' ')).toMatch(/You can only delete your own inputs/)
    expect(raw(() => { INPUTS.splice(INPUTS.indexOf(the()), 1) }), 'nor by a hand-made call').toBe(false)
    expect(copy(the())).toEqual(was)
    saber()
    expect(removeInput(the()), 'an admin deletes it for everyone').toBe(true)
    expect(feb()).toHaveLength(0)
  })
  it('an input of one made an input of several by an admin keeps the member who filed it as its filer', () => {
    ranger()
    const t1 = T(9)
    expect(commitInput(null, D(), ['rocky'])).toBe(true)          // Ranger files for Hex alone
    const was = copy(the())
    saber()
    const t2 = T(10)
    expect(commitInput(the(), D(), ['rocky', 'casper'])).toBe(true)
    expect(the(), 'the same record, still filed by Ranger then').toMatchObject({ iid: was.iid, by: 'bane', at: t1 })
    expect(peopleOf(the())[0], 'Hex\'s entry as it was').toEqual(was.people[0])
    expect(entryOf(the(), 'casper')).toMatchObject({ by: 'stiff', at: t2 })
  })
  /* THE OLD SHAPE NAMED NO FILER FOR A RECORD FILED BEFORE FILERS WERE RECORDED, and gave the GROUP one when an admin
     made it a group ("…becomes that admin's": `grpBy`). There is one filing on the one record now (`by` IS the filer —
     the one-rule plan §4.1), and nothing invents one: the record is rewritten with its list, the man who was there
     keeps an entry with no name to it, the man added is put in by the admin — and the input has no filer, so it is an
     admin's alone to change for everyone. Stored data only (D56): every record filed since carries who filed it. */
  it('…and one with no filer recorded (stored before the build) is rewritten with its list — the man added is the admin\'s, and no filer is invented', () => {
    raw(() => { INPUTS.unshift({ iid: 'zzold', person: 'rocky', type: 'Meeting', date: 'Feb 10', yr: 2026, allday: false, s: 540, e: 600, remarks: 'brief', mod: nowStamp() }) })
    expect(idsOf(the()), 'it reads as a one-person input').toEqual(['rocky'])
    const t2 = T(10)
    expect(commitInput(the(), D(), ['rocky', 'casper'])).toBe(true)
    expect(the().iid, 'the same record').toBe('zzold')
    expect(peopleOf(the())).toMatchObject([{ p: 'rocky' }, { p: 'casper', by: 'stiff', at: t2 }])
    expect('by' in peopleOf(the())[0], 'who put Hex in was never recorded, and is not made up').toBe(false)
    for (const k of ['person', 'grp', 'grpBy']) expect(k in the(), `the old shape's \`${k}\` is gone`).toBe(false)
    expect(the().by, 'no filer invented').toBeUndefined()
    expect(the()).toMatchObject({ modBy: 'stiff', modAt: t2 })
    hex()
    expect(mayEditInput(the()), 'nobody filed it: not Hex\'s to change for everyone').toBe(false)
  })
  /* HIS OWN REQUEST, WHOEVER FILED IT (owner D655; D763 reading 2: "the one person of a one-person input may always
     change it, whoever filed it — that is his own request"; the one-rule plan §4.9: the ONLY named person of an input
     changes it "in full … its fields, its people, its OIL answer"). The old shape made him the GROUP's filer (`grpBy`)
     and left who placed his own record as it was; on the one record the man he adds is put in under his name, and his
     own entry — put in by Saber — is untouched. (The same by a hand-made call: groupinput.test.ts.) */
  it('a member makes his admin-filed input an input of several: the man he adds is put in by him; his own entry is unchanged', () => {
    expect(commitInput(null, D(), ['bane'])).toBe(true)           // Saber files for Ranger
    const was = copy(the())
    ranger()
    expect(mayEditInput(the()), 'his own request, whoever filed it').toBe(true)
    const t2 = T(10)
    said = []
    expect(commitInput(the(), D(), ['bane', 'rocky']), said.join(' | ')).toBe(true)
    expect(the().iid).toBe(was.iid)
    expect(idsOf(the())).toEqual(['bane', 'rocky'])
    expect(peopleOf(the())[0], 'his own entry as it was — put in by Saber').toEqual(was.people[0])
    expect(entryOf(the(), 'rocky')).toMatchObject({ by: 'bane', at: t2 })
  })
  it('an input of several taken back to one man reads and edits as an input of one', () => {
    expect(commitInput(null, D(), ['bane', 'rocky'])).toBe(true)
    const iid = the().iid
    expect(commitInput(the(), D(), ['bane'])).toBe(true)
    expect(idsOf(the())).toEqual(['bane'])
    expect(onlyNamed(the()), 'his own request again').toBe('bane')
    expect(the().iid, 'the same record').toBe(iid)
    expect(commitInput(the(), D({ remarks: 'alone' }), ['bane'])).toBe(true)
    expect(the().remarks).toBe('alone')
    ranger()
    expect(mayEditInput(the()), 'and the man himself may change it, as any input of one').toBe(true)
  })
})

describe('the OIL question — ONE answer for everyone in the input, given by whoever filed it or an admin (D660, D762)', () => {
  const sat = (o: Record<string, any> = {}) => D({ start: SAT, ...o })
  const bell = (p: string) => oilPendingFor(p).filter(x => x.iid === the().iid)
  /* THE RULE CHANGED (owner D762, 11 Oct 26: "for an input with several people the OIL question has one answer, for
     everyone in it: whoever filed it, or an admin, gives it; no man in it gives an answer of his own"). The answer was
     written on each man's record (D660), and an unanswered one lit each man's OWN bell; it is one answer on the one
     record now, and an unanswered one waits on the FILER's bell alone. */
  it('a weekend duty filed for six: answered at the save, the one answer is on the record and no bell is lit — the filer\'s or any man\'s (D762)', () => {
    expect(commitInput(null, sat(), SIX, { oil: { [SAT]: 0.5 } })).toBe(true)
    expect(the().oil).toEqual({ [SAT]: 0.5 })
    for (const e of peopleOf(the())) expect('oil' in e, `${e.p}: no answer of his own`).toBe(false)
    for (const p of SIX) expect(bell(p), `${p}'s bell`).toEqual([])
  })
  it('filed with no answer given, the input is left unanswered — the save never invents one — and the question waits on the FILER\'s bell, no man\'s own (D762)', () => {
    ranger()
    expect(commitInput(null, sat(), ['bane', 'rocky'])).toBe(true)
    expect(the().oil).toBeUndefined()
    expect(bell('bane'), 'Ranger filed it').toHaveLength(1)
    hex()
    expect(bell('rocky'), 'Hex is in it: he has no answer to give').toEqual([])
  })
  it('the hours changed: a claim the new hours no longer price is voided — and the filer\'s fresh answer lands, for everyone', () => {
    expect(commitInput(null, sat(), THREE, { oil: { [SAT]: 0.5 } })).toBe(true)
    expect(commitInput(the(), sat({ allday: true }), THREE)).toBe(true)
    expect(the().oil, 'voided').toBeUndefined()
    expect(commitInput(the(), sat({ allday: true, remarks: 'all day' }), THREE, { oil: { [SAT]: 1 } })).toBe(true)
    expect(the().oil, 'answered again').toEqual({ [SAT]: 1 })
    expect(feb()).toHaveLength(1)
  })
  /* THE RULE CHANGED (D762). "One man then changes his own answer; the others' are untouched" — a man in a shared input
     has no answer of his own to change: his write is refused and the input's one answer stands. */
  it('a man in it gives no answer of his own: his change to the input\'s answer is refused, and it stands for everyone (D762)', () => {
    expect(commitInput(null, sat(), THREE, { oil: { [SAT]: 0.5 } })).toBe(true)
    hex()
    const was = copy(the())
    expect(raw(() => { the().oil = { [SAT]: 0 } }), 'a hand-made write').toBe(false)
    said = []
    expect(commitInput(the(), sat(), THREE, { oil: { [SAT]: 0 } }), 'the door').toBe(false)
    expect(said.join(' ')).toMatch(/Only Saber — who filed it — or an admin can change this for everyone/)
    expect(copy(the())).toEqual(was)
    expect(the().oil).toEqual({ [SAT]: 0.5 })
  })
  /* THE RULE CHANGED (D763, D762). "A man added later by someone who did not file it is answered for at that save —
     nobody else's answer moves": a member in it who did not file it adds nobody now, with an answer or without; a
     SCHEDULER who did not file it may, and the man he adds follows the input's answer — nothing is written for him. An
     answer the admin gives with the add is the input's one answer, for everyone (D762: "whoever filed it, or an
     admin, gives it"). */
  it('a man added later by a scheduler who did not file it follows the input\'s answer; one the admin gives then is the input\'s, for everyone — a member in it adds nobody and answers nothing (D762, D763)', () => {
    ranger()
    expect(commitInput(null, sat(), ['bane', 'rocky'], { oil: { [SAT]: 0.5 } })).toBe(true)
    hex()
    const was = copy(the())
    expect(commitInput(the(), sat(), ['bane', 'rocky', 'harpoon'], { oil: { [SAT]: 0 } }), 'Hex is in it, and did not file it').toBe(false)
    expect(copy(the())).toEqual(was)
    saber()
    expect(commitInput(the(), sat(), ['bane', 'rocky', 'harpoon'])).toBe(true)
    expect(the().oil, 'Harpoon follows the answer the input carries').toEqual({ [SAT]: 0.5 })
    expect('oil' in entryOf(the(), 'harpoon'), 'nothing is written for him').toBe(false)
    expect(commitInput(the(), sat(), ['bane', 'rocky', 'harpoon', 'razer'], { oil: { [SAT]: 0 } })).toBe(true)
    expect(the().oil, 'the admin\'s answer is the input\'s').toEqual({ [SAT]: 0 })
    expect(idsOf(the())).toEqual(['bane', 'rocky', 'harpoon', 'razer'])
  })
  /* THE RULE CHANGED (D762 changed D682). D682: "whoever filed a shared duty and answers its OIL question again answers
     for everyone in it, replacing a person's own earlier No". There is no "own earlier No" to replace any more — the
     filer's new answer replaces the input's ONE answer, a No included, in the same command that adds the man. */
  it('the FILER adds a man and answers again: the input\'s one answer is replaced — an earlier No included — in one command, one Undo (D682, D762)', () => {
    expect(commitInput(null, sat(), ['bane', 'rocky'], { oil: { [SAT]: 0 } })).toBe(true)
    const was = copy(the())
    const n = cmds()
    expect(commitInput(the(), sat(), ['bane', 'rocky', 'harpoon'], { oil: { [SAT]: 0.5 } })).toBe(true)
    expect(cmds() - n, 'one command').toBe(1)
    expect(the().oil).toEqual({ [SAT]: 0.5 })
    expect(idsOf(the())).toEqual(['bane', 'rocky', 'harpoon'])
    expect(globalUndo().ok).toBe(true)
    expect(copy(the()), 'one Undo: the No is back and Harpoon is out').toEqual(was)
  })
  it('...and with NO answer given (the question cancelled) the input\'s answer does not move — the man added follows it', () => {
    expect(commitInput(null, sat(), ['bane', 'rocky'], { oil: { [SAT]: 0.5 } })).toBe(true)
    expect(commitInput(the(), sat(), ['bane', 'rocky', 'harpoon'])).toBe(true)
    expect(the().oil).toEqual({ [SAT]: 0.5 })
    expect(idsOf(the())).toEqual(['bane', 'rocky', 'harpoon'])
  })
  it('the filer revises the answer: nothing else changed, the new answer is the input\'s — an OIL answer alone (§3.8 row 4)', () => {
    const t1 = T(9)
    expect(commitInput(null, sat(), THREE, { oil: { [SAT]: 0.5 } })).toBe(true)
    const was = copy(the())
    const t2 = T(9, 40), n = cmds()                     // weeks later, past the cut-off
    expect(commitInput(the(), sat(), THREE, { oil: { [SAT]: 0 } })).toBe(true)
    expect(cmds() - n).toBe(1)
    expect(the().oil).toEqual({ [SAT]: 0 })
    expect(stamps(the())).toEqual({ by: 'stiff', at: t1, modBy: 'stiff', modAt: t2 })
    expect(the().mod, 'an answer alone never moves the late date').toBe(was.mod)
    expect(late(the()), 'nor any man\'s').toEqual({ bane: false, rocky: false, casper: false })
    expect(peopleOf(the())).toEqual(was.people)
    expect(globalUndo().ok).toBe(true)
    expect(the().oil, 'undone').toEqual({ [SAT]: 0.5 })
  })
  it('a member filer\'s answer for the others is held to what the hours give — a bad one rolls the whole filing back', () => {
    ranger()
    said = []
    expect(commitInput(null, sat(), THREE, { oil: { [SAT]: 1 } })).toBe(false)
    expect(feb(), 'nothing filed for anyone').toHaveLength(0)
    expect(said.join(' '), 'and it says so').toMatch(/not saved|nothing was saved/i)
    expect(commitInput(null, sat(), THREE, { oil: { [SAT]: 0.5 } })).toBe(true)
    expect(idsOf(the())).toEqual(THREE)
  })
})

describe('one man once an input — held at the write (§3.13 "Records", finding G5)', () => {
  it('the writer never puts a man in twice: asked to add one who is already in it, it changes nothing', () => {
    expect(commitInput(null, D(), ['bane', 'rocky'])).toBe(true)
    const n = cmds()
    expect(commitInput(the(), D(), ['bane', 'rocky', 'rocky'])).toBe(true)
    expect(cmds()).toBe(n)
    expect(idsOf(the())).toEqual(['bane', 'rocky'])
  })
  /* THE RULE CHANGED WITH THE SHAPE (owner D759 reading 4: "a change to one man's part alone gives him an input of his
     own"; D737 — the Unavailable list stays one row a man; the one-rule plan §4.6). Until the build a record changed
     alone "left the entry" by no longer matching it, and came BACK when it matched again — so "the same man added again,
     then the first changed back" made him twice on one entry, and was refused at the write. One man's part changed alone
     now gives him an input of HIS OWN, in the same command, with him out of the first: the two never join again, so the
     same steps end in two sound inputs and nothing is refused. (An overseas duty — it stands on the Unavailable list,
     where a box typed on one man's row is his part alone.) */
  it('one man\'s part changed alone gives him an input of his own; added to the first again and his own changed back, he is in two inputs — nothing to refuse (D759 reading 4)', () => {
    const od = D({ type: 'OD', allday: true, remarks: 'det' })
    expect(commitInput(null, od, ['bane', 'rocky'])).toBe(true)
    const first = the('OD').iid
    const n = cmds()
    expect(setInpField(the('OD'), 'rmks', 'det, late flight', 'rocky'), 'a remark typed on Hex\'s own Unavailable row').toBe(true)
    expect(cmds() - n, 'one command').toBe(1)
    const two = feb('OD')
    expect(two, 'two inputs now').toHaveLength(2)
    const shared = two.find(r => r.iid === first), own = two.find(r => r.iid !== first)
    expect(idsOf(shared), 'Hex is out of the first').toEqual(['bane'])
    expect(shared.remarks).toBe('det')
    expect(idsOf(own)).toEqual(['rocky'])
    expect(own).toMatchObject({ remarks: 'det, late flight', by: 'stiff' })
    expect(commitInput(shared, draftOf(shared), ['bane', 'rocky']), 'the same man added to the first again').toBe(true)
    said = []
    expect(setInpField(feb('OD').find(r => r.iid === own.iid), 'rmks', 'det'), 'his own changed back — it says what the first says').toBe(true)
    expect(said.join(' ')).not.toMatch(/already on this input/)
    expect(feb('OD').map(r => idsOf(r)).sort((a, b) => b.length - a.length), 'two inputs, never joined again').toEqual([['bane', 'rocky'], ['rocky']])
    expect(inputLines(feb('OD')).filter((l: any) => l.person === 'rocky'), 'and Hex\'s day reads both').toHaveLength(2)
  })
  it('the board\'s typed cell on a shared input changes the ONE record — for everyone in it — or nothing (D739)', () => {
    expect(commitInput(null, D(), ['bane', 'rocky'])).toBe(true)
    expect(setInpField(the(), 'end', '11:00'), 'the scheduler types on the one row').toBe(true)
    expect(the().e).toBe(660)
    expect(inputLines([the()]).map((l: any) => [l.person, l.e]), 'still one shared input, and each man\'s day reads the new end').toEqual([['bane', 660], ['rocky', 660]])
    /* a man in it who did not file it cannot change it for everyone through that cell either — nothing is written */
    hex()
    said = []
    expect(setInpField(the(), 'end', '12:00')).toBe(false)
    expect(the().e).toBe(660)
    expect(said.join(' ')).toMatch(/can change this for everyone/)
  })
  /* THE RULE CHANGED WITH THE SHAPE (D756; D759 reading 9 — "Undo's conflict test stays per record, which is now per
     input"). "By Undo alike" was a step that would put a stray record back INTO its entry beside a second record of the
     same man. There is one record now, so the same danger is one man put in twice by an Undo: Hex takes himself out, a
     scheduler puts him back since, and Hex's Undo — which would restore the list with him in it — is refused before
     anything is written: a later change touches the same input (D148). (`asSaberElsewhere` lands Saber's command in
     this same list of steps, so the refusal is the list's own sentence; a change that arrives from another device is
     refused by name — undo/timeline.ts.) */
  it('…and by Undo alike: a man who took himself out, put back by a scheduler since, is not put in twice — his Undo is refused, a later change touching the same input (D148)', () => {
    expect(commitInput(null, D(), ['bane', 'rocky'])).toBe(true)
    hex()
    expect(commitInput(the(), D(), ['bane']), 'Hex takes himself out').toBe(true)
    asSaberElsewhere(() => { expect(commitInput(the(), D(), ['bane', 'rocky']), 'Saber puts Hex in again').toBe(true) })
    const was = copy(the())
    const u = globalUndo()
    expect(u.ok).toBe(false)
    expect(u.reason).toMatch(/A later change touches the same thing/)
    expect(copy(the()), 'the input as Saber left it').toEqual(was)
    expect(idsOf(the()), 'Hex in it once').toEqual(['bane', 'rocky'])
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
