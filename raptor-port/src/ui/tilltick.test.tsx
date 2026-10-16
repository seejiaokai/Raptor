// @vitest-environment jsdom
/* THE TILL-DATE TICK AND THE MORNING'S SMALL ANSWERS (owner D949, D950, D951, D953 — 17 Oct 26). Pinned through the doors
   the app uses (the window's two saves, the store's write body, the publish engine) and the builders the screens call:
   · the default: a one-day duty or other commitment prints no "till <date>"; every other input does (D951, D952);
   · a hand tick or untick holds while the dates and the kind keep that default, and is replaced — never brought back —
     when a change flips it (D953 reading 2), through every door that writes an input;
   · unticked, no screen prints the date (reading 3); on a published day a tick change reads "1 pending" (reading 4);
   · the change history says it once (D263);
   · the Ground Programme row's box holds the typed words, its date grey after it (D949 Q3), and a box put back after a
     save or an Escape never gets the date inside it;
   · the board's wave header says "(prev day)" where the wave reports the evening before (D949 Q1). The window's tick is
     pinned in inputs.test.tsx; the words of round 2 (D950) and "rejected" (D949 Q2) in words-r2.test.tsx. */
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from '../engine/data'
import { INPUTS, inpId, tillDefault, tillShown, tillOf, remarksShown, tillSettle, tillTurned } from '../engine/inputs'
import { SCHED, signOf, setDayApproved, dayShownPendCount } from '../engine/publish'
import { acceptInput } from '../engine/slots'
import { validate } from '../engine/validate'
import { ELOG } from '../engine/editlog'
import { initStore, writeInputs, undo, resetSession } from '../state/store'
import { signIn, sessionFor } from '../state/accounts'
import { NOTICES } from '../state/notices'
import { pendListHTML } from './pendlist'
import { setSession } from '../state/auth'
import { setPage, PIOPEN } from '../state/view'
import { dayHTML, reqRmkParts, boxText, refreshWaveReports } from './html'
import { boardHTML } from './board'
import { sbGroundPanel } from './board-html'
import { commitNewInput, commitInputEdit, draftOf } from './inputedit'
import { reqRowText } from './reqrow'

const MON = 0
const el = (html: string) => { const d = document.createElement('div'); d.innerHTML = html; return d }
let pristine: any[] = [], inputs0 = ''
const FOUR: Array<[string, string]> = [['cur', 'ignite'], ['sked', 'bane'], ['plan', 'stiff'], ['appr', 'pump']]
const publishDay = (di: number) => { const g = signOf(di); for (const [r, w] of FOUR) (g as any)[r] = w; setDayApproved(di, true); validate() }
const meeting = (start: string, end = '', remarks = 'Brief') =>
  ({ person: 'bane', type: 'Meeting', allday: false, half: '', start, end, sTime: '09:00', eTime: '10:00', remarks, sans: null, docIds: [] })
const leave = (start: string, end = '', remarks = 'Bangkok') =>
  ({ person: 'bane', type: 'OL', allday: true, half: '', start, end, sTime: '06:00', eTime: '18:00', remarks, sans: null, docIds: [] })
const added = (remarks: string) => INPUTS.find((r: any) => r.remarks === remarks)!

beforeAll(() => {
  initStore()
  setSession({ user: 'ad', role: 'admin' } as any)
  pristine = JSON.parse(JSON.stringify(DAYS))
  inputs0 = JSON.stringify(INPUTS)
})
beforeEach(() => {
  DAYS.length = 0; JSON.parse(JSON.stringify(pristine)).forEach((d: any) => DAYS.push(d))
  INPUTS.length = 0; JSON.parse(inputs0).forEach((i: any) => INPUTS.push(i))
  SCHED.pending = {}; SCHED.changes = {}; SCHED.added = {}; SCHED.als = []
  SCHED.al = 0; SCHED.dayOK = {}; SCHED.sign = {}; SCHED.signBind = {}; SCHED.orig = {}; SCHED.cur = {}
  PIOPEN.clear()
  setPage('editsched')
  validate()
})

describe('the default (D951, D952)', () => {
  it('a one-day duty or other commitment prints no date; more than a day, a leave, a medical input do', () => {
    expect(tillDefault({ type: 'Meeting', date: 'Jul 13' })).toBe(false)
    expect(tillDefault({ type: 'Meeting', date: 'Jul 13', endDate: 'Jul 13' }), 'a range that ends where it starts').toBe(false)
    expect(tillDefault({ type: 'OD', date: 'Jul 13' }), 'overseas duty is in the group').toBe(false)
    expect(tillDefault({ type: 'Meeting', date: 'Jul 13', endDate: 'Jul 14' })).toBe(true)
    expect(tillDefault({ type: 'OL', date: 'Jul 13' }), 'a one-day leave keeps it').toBe(true)
    expect(tillDefault({ type: 'OML', date: 'Jul 13' }), 'a one-day medical input keeps it').toBe(true)
    expect(tillOf({ type: 'Meeting', date: 'Jul 13', remarks: 'Brief' })).toBe('')
    expect(remarksShown({ type: 'Meeting', date: 'Jul 13', remarks: 'Brief' })).toBe('Brief')
    expect(remarksShown({ type: 'OL', date: 'Jul 13', remarks: 'Bangkok' })).toBe('Bangkok till 13 Jul')
  })
  it('a hand choice is read where it differs from the default; one equal to it is no choice, and settles away', () => {
    expect(tillShown({ type: 'Meeting', date: 'Jul 13', till: true })).toBe(true)
    expect(tillOf({ type: 'Meeting', date: 'Jul 13', till: true })).toBe('till 13 Jul')
    expect(tillOf({ type: 'OL', date: 'Jul 13', endDate: 'Jul 15', till: false }), 'unticked: no screen prints it').toBe('')
    const stale: any = { type: 'Meeting', date: 'Jul 13', till: false }
    expect(tillSettle(stale)).toBe(true); expect('till' in stale).toBe(false)
    const kept: any = { type: 'Meeting', date: 'Jul 13', till: true }
    expect(tillSettle(kept)).toBe(false); expect(kept.till).toBe(true)
  })
})

describe('a date or kind change that flips the default replaces the hand choice (D953 reading 2)', () => {
  it('ticked by hand on one day, stretched to two, then cut back: the default each time — the tick never comes back', () => {
    expect(commitNewInput({ ...meeting('2026-07-13'), till: true } as any)).toBe(true)
    const r = added('Brief')
    expect(r.till, 'a one-day meeting ticked by hand').toBe(true)
    expect(remarksShown(r)).toBe('Brief till 13 Jul')
    expect(commitInputEdit(r, { ...draftOf(r), end: '2026-07-14' })).toBeTruthy()
    expect('till' in r, 'stretched: the default (on) replaces the hand choice').toBe(false)
    expect(remarksShown(r)).toBe('Brief till 14 Jul')
    expect(commitInputEdit(r, { ...draftOf(r), end: '' })).toBeTruthy()
    expect(remarksShown(r), 'cut back to one day: the default (off), the old tick gone for good').toBe('Brief')
  })
  it('a change that keeps the default keeps the hand choice: an unticked leave moved stays unticked', () => {
    expect(commitNewInput({ ...leave('2026-07-13', '2026-07-15'), till: false } as any)).toBe(true)
    const r = added('Bangkok')
    expect(r.till).toBe(false)
    expect(commitInputEdit(r, { ...draftOf(r), start: '2026-07-14', end: '2026-07-17' })).toBeTruthy()
    expect(r.till, 'still more than a day: his untick holds').toBe(false)
    expect(remarksShown(r)).toBe('Bangkok')
  })
  it('a kind moved into the group flips it too: an unticked one-day leave retyped to a meeting takes the meeting\'s default', () => {
    expect(commitNewInput({ ...leave('2026-07-13'), till: false } as any)).toBe(true)
    const r = added('Bangkok')
    expect(commitInputEdit(r, { ...draftOf(r), type: 'Meeting', allday: false, sTime: '09:00', eTime: '10:00' })).toBeTruthy()
    expect('till' in r).toBe(false)
    expect(tillShown(r)).toBe(false)
  })
  it('every door: a write made outside the window (the store\'s write body) drops a choice the dates overtook', () => {
    expect(commitNewInput({ ...meeting('2026-07-13'), till: true } as any)).toBe(true)
    const r = added('Brief')
    expect(writeInputs(() => { r.endDate = 'Jul 15' })).toBe(true)
    expect('till' in r).toBe(false)
  })
  it('a save that states no tick leaves the record\'s own', () => {
    expect(commitNewInput({ ...leave('2026-07-13', '2026-07-15'), till: false } as any)).toBe(true)
    const r = added('Bangkok')
    const d: any = { ...draftOf(r), remarks: 'Phuket' }; delete d.till
    expect(commitInputEdit(r, d)).toBeTruthy()
    expect(r.till).toBe(false)
  })
})

describe('on a published day a tick change reads pending (D953 reading 4)', () => {
  it('unticking a published leave\'s date is one change waiting; ticking it back is none', () => {
    expect(commitNewInput(leave('2026-07-13', '2026-07-14', 'PUBTICK'))).toBe(true)
    validate(); publishDay(MON)
    expect(dayShownPendCount(MON)).toBe(0)
    const r = added('PUBTICK')
    expect(commitInputEdit(r, { ...draftOf(r), till: false })).toBeTruthy(); validate()
    expect(dayShownPendCount(MON), 'the printed words changed').toBe(1)
    expect(commitInputEdit(r, { ...draftOf(r), till: undefined })).toBeTruthy(); validate()
    expect(dayShownPendCount(MON), 'back to what was published').toBe(0)
  })
})

describe('the change history says a tick once (D263)', () => {
  it('a tick is a "till date" line; a stretch that flips the default writes the dates line alone', () => {
    expect(commitNewInput(leave('2026-07-13', '2026-07-14', 'HIST'))).toBe(true)
    const r = added('HIST')
    const n0 = ELOG.next
    expect(commitInputEdit(r, { ...draftOf(r), till: false })).toBeTruthy()
    const lines = ELOG.rows.filter((e: any) => e.seq >= n0).map((e: any) => `${e.lbl} ${e.from}→${e.to}`)
    expect(lines.some(l => /· till date shown→hidden$/.test(l)), lines.join(' | ')).toBe(true)
    expect(commitNewInput(meeting('2026-07-15', '', 'HIST2'))).toBe(true)
    const m = added('HIST2'), n1 = ELOG.next
    expect(commitInputEdit(m, { ...draftOf(m), end: '2026-07-16' })).toBeTruthy()
    const l2 = ELOG.rows.filter((e: any) => e.seq >= n1).map((e: any) => String(e.lbl))
    expect(l2.some(l => / · dates$/.test(l))).toBe(true)
    expect(l2.some(l => /till date/.test(l)), 'no second line for one change').toBe(false)
  })
})

describe('the Ground Programme row\'s box: typed words, the date grey after it (D949 Q3)', () => {
  const landedLeave = () => {
    const inp: any = { person: 'bane', type: 'Training', date: 'Jul 13', endDate: 'Jul 14', s: 540, e: 600, remarks: 'Sim refresher', mod: 'now', yr: 2026 }
    INPUTS.push(inp); inpId(inp)
    expect(acceptInput(MON, inp, 'g')).toBe(true); validate()
    const ri = DAYS[MON].ground.findIndex((x: any) => x.src && x.rmks === 'Sim refresher till 14 Jul')
    expect(ri, 'its row stands on Monday').toBeGreaterThanOrEqual(0)
    return { inp, ri }
  }
  it('the week and the board draw the box with the typed words and the date after it; a read-only face prints it whole', () => {
    const { ri } = landedLeave()
    const wk = el(dayHTML(MON, true, true)).querySelector(`[data-txt="gr:${MON}.${ri}.rmks"]`)!
    expect(wk.textContent).toBe('Sim refresher')
    expect(wk.nextElementSibling?.className).toBe('rk-till')
    expect(wk.nextElementSibling?.textContent).toBe('till 14 Jul')
    const bd = el(sbGroundPanel(DAYS[MON], MON)).querySelector(`[data-bfld="gr:${MON}.${ri}.rmks"]`) as HTMLTextAreaElement
    expect(bd.value.trim()).toBe('Sim refresher')
    expect(bd.closest('.rmkt')?.querySelector('.rk-till')?.textContent).toBe('till 14 Jul')
    setPage('viewsched')
    expect(el(dayHTML(MON, false)).textContent).toContain('Sim refresher till 14 Jul')
  })
  it('one answer for every box put back: the typed words; a Tab through it writes nothing', () => {
    const { inp, ri } = landedLeave()
    const p = `gr:${MON}.${ri}.rmks`
    expect(boxText(p)).toBe('Sim refresher')
    expect(reqRmkParts(DAYS[MON], DAYS[MON].ground[ri])).toEqual({ typed: 'Sim refresher', till: 'till 14 Jul' })
    const before = JSON.stringify(inp)
    expect(reqRowText(p, 'Sim refresher'), 'the box left as it reads').toBe('refused')
    expect(JSON.stringify(inp)).toBe(before)
    expect(reqRowText(p, 'Sim refresher B')).toBe('saved')
    expect(inp.remarks).toBe('Sim refresher B')
  })
  it('unticked, the row prints the typed words alone and its box has no date after it', () => {
    const { inp } = landedLeave()
    expect(commitInputEdit(inp, { ...draftOf(inp), till: false })).toBeTruthy(); validate()
    const ri = DAYS[MON].ground.findIndex((x: any) => x.src && x.rmks === 'Sim refresher')
    expect(ri).toBeGreaterThanOrEqual(0)
    const wk = el(dayHTML(MON, true, true)).querySelector(`[data-txt="gr:${MON}.${ri}.rmks"]`)!
    expect(wk.textContent).toBe('Sim refresher')
    expect(wk.nextElementSibling).toBeNull()
  })
})

describe('the board\'s wave header says "(prev day)" where the wave reports the evening before (D949 Q1)', () => {
  const firstFly = () => DAYS[MON].waves.findIndex((w: any) => (w.formations || []).length && !w.kind)
  it('drawn where its in-time / rally is the evening before, and put in and taken out by the refresh', () => {
    const gi = firstFly(); expect(gi).toBeGreaterThanOrEqual(0)
    const w = DAYS[MON].waves[gi]
    w.intimes = ['22:30H IN TIME']
    const host = el(boardHTML(MON))
    const head = () => host.querySelector(`[data-move="mv:w.${MON}.${gi}"] > .sb-go-h`)!
    expect(head().querySelector('.sb-prevday')?.textContent).toBe('(prev day)')
    w.intimes = ['07:00H IN TIME']
    refreshWaveReports(host)
    expect(head().querySelector('.sb-prevday'), 'the refresh took it out').toBeNull()
    w.intimes = ['22:30H IN TIME']
    refreshWaveReports(host)
    expect(head().querySelector('.sb-prevday')?.textContent, 'and put it back').toBe('(prev day)')
  })
})

/* THE SCENARIO DESIGNER'S FINDS (17 Oct 26), each pinned where it was fixed */
describe('the scenario designer\'s finds', () => {
  it('2: a published leave with no typed words, unticked: the pending list says "(no remarks)", never empty quotes', () => {
    expect(commitNewInput(leave('2026-07-13', '2026-07-14', ''))).toBe(true)
    const r = INPUTS[0]                                       // the one just filed
    expect([r.type, r.remarks, r.date]).toEqual(['OL', '', 'Jul 13'])
    validate(); publishDay(MON)
    expect(commitInputEdit(r, { ...draftOf(r), till: false })).toBeTruthy(); validate()
    const txt = el(pendListHTML(MON)).textContent || ''
    expect(txt).toContain('“till 14 Jul”')
    expect(txt).toContain('(no remarks)')
    expect(txt).not.toContain('“”')
  })
  it('3: a one-day meeting ticked by hand, stretched AND unticked in one save: the dates line and the till-date line', () => {
    expect(commitNewInput({ ...meeting('2026-07-15', '', 'STR'), till: true } as any)).toBe(true)
    const m = added('STR'), n = ELOG.next
    expect(commitInputEdit(m, { ...draftOf(m), end: '2026-07-16', till: false })).toBeTruthy()
    expect(m.till).toBe(false)
    const l = ELOG.rows.filter((e: any) => e.seq >= n).map((e: any) => `${e.lbl} ${e.from}→${e.to}`)
    expect(l.some(x => / · dates /.test(x)), l.join(' | ')).toBe(true)
    expect(l.some(x => /· till date shown→hidden$/.test(x)), l.join(' | ')).toBe(true)
  })
  it('5: a scheduler unticking a member\'s input tells him: "Remark changed"', () => {
    resetSession(sessionFor(signIn('ad', 'a') as any))       // a scheduler with a name: a notice says who
    expect(commitNewInput(leave('2026-07-13', '2026-07-15', 'BELL'))).toBe(true)
    const r = added('BELL'), n = NOTICES.length
    expect(commitInputEdit(r, { ...draftOf(r), till: false })).toBeTruthy()
    const mine = NOTICES.slice(n).filter(x => x.to === 'bane')
    expect(mine.some(x => x.what.some((p: any) => p.k === 'rmk')), JSON.stringify(mine)).toBe(true)
  })
  it('9: a kind that carries no date keeps no hidden tick (SANS availability, an upchit)', () => {
    const s: any = { type: 'SANS Availability', date: 'Jul 13', endDate: 'Jul 15', till: false }
    expect(tillSettle(s)).toBe(true); expect('till' in s).toBe(false)
  })
  it('undo: a stretch that replaced a hand tick, undone, brings the tick back with its dates', () => {
    expect(commitNewInput({ ...meeting('2026-07-13', '', 'UNDO'), till: true } as any)).toBe(true)
    const r = added('UNDO')
    expect(commitInputEdit(r, { ...draftOf(r), end: '2026-07-14' })).toBeTruthy()
    expect('till' in r).toBe(false)
    undo()
    const back = added('UNDO')
    expect([back.endDate ?? '', back.till]).toEqual(['', true])
  })
})

/* THE FRESH CODE READ'S FINDING (17 Oct 26): a retype into a kind that carries no date turned no tick anyone reads */
describe('the fresh code read: a retype into SANS availability or an upchit is no tick change', () => {
  it('tillTurned answers no for either side a kind without a date; yes for a plain untick', () => {
    const ol = { type: 'OL', date: 'Jul 13', endDate: 'Jul 15', till: false }
    expect(tillTurned(ol, { type: 'SANS Availability', date: 'Jul 13', endDate: 'Jul 15' })).toBe(false)
    expect(tillTurned({ type: 'SANS Availability', date: 'Jul 13', endDate: 'Jul 15' }, ol)).toBe(false)
    expect(tillTurned({ type: 'OL', date: 'Jul 13', endDate: 'Jul 15' }, ol)).toBe(true)
  })
})
