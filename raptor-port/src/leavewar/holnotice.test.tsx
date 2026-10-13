// @vitest-environment jsdom
/* A DAY MADE A HOLIDAY AFTERWARDS: THE ONE LIST, AND THE SCHEDULERS' BELL ([OIL-ASK-NOTIFY] steps 3 and 4 — the plan
   docs/superpowers/plans/2026-10-12-oil-ask-notify-plan.md §3.2, §3.3, §5a). His rulings:
   D780 — "If a holiday is made afterwards the input is there. There should be a notification to the schedulers to award
           oil on those inputs. And should not be silent."
   D781 — the admin declaring it is told at once, and what he answers there notifies nobody — only what is left
           unanswered goes to the schedulers;
   D782 — "can the admin answering all the inputs for oil that day have a consolidated list that's easy to select oil
           yes or no for them? And a yes to all or no to all kinda button";
   D783 — the list opens by itself when the holiday is saved; ONE bell line a holiday, counting only what is left
           unanswered, a tap opening the list (the pictures of record docs/mock/2026-10-12-oil-notify/).
   Until this step nothing told a scheduler: the day became a holiday, the inputs on it gained an OIL question nobody
   had answered, and another scheduler's bell said "Nothing new".

   Both stores live and the sync wired, as the app boots them (the harness of leavewar/holidays.test.ts). The inputs are
   filed through the input's one writer on a WORKING Friday — no OIL question, as the app would file them — and the day
   is then made a holiday through each door there is. The real windows and presses are walked in the browser. */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { HOOKS } from '../engine/hooks'
import { INPUTS, idsOf } from '../engine/inputs'
import { PEOPLE } from '../engine/people'
import { initStore as raptorInitStore, notify, switchRoleView } from '../state/store'
import { setSession, setMe, DEFAULT_ME } from '../state/auth'
import { ACCOUNTS_LIST, addAccount, updateAccount } from '../state/accounts'
import { stashClear, stashPut } from '../engine/weekstash'
import { weekBundle } from '../engine/weeks-data'
import { NOTICES, noticesFor, noticeWords, noticeRun } from '../state/notices'
import { unreadFor, markAllNoticesRead } from '../state/noticeseen'
import { globalRedo, globalUndo } from '../undo'
import { _resetTimeline } from '../undo/timeline'
import { installGlobalUndo } from '../state/undo-wire'
import { setPage } from '../state/view'
import { commitInput, draftOf, oilAnswered, oilGate, oilSignDay, oilUnansweredDay } from '../ui/inputedit'
import { saveOilDay } from '../ui/oilday'
import * as pops from '../ui/pops'
import { bellOn, bellTap, openNotice } from '../ui/topbits'
import { App } from '../ui/App'
import { projectPeople } from './state/raptorRoster'
import {
  addEventBand, addEventType, getState, holidayAdd, holidayChange, holidayRemove, initStore as lwInitStore, lwHistInit,
  setDayEvent, setPeople, setRole, updateEventType,
} from './state/store'
import { memoryBackend } from './state/storage'
import { holidaysIn, oilOpenOn, oilPendingFor, wireLeaveWarSync } from './sync'

const toast = HOOKS.toast
const ISNAP = JSON.stringify(INPUTS)
const FRI = '2026-07-17', THU = '2026-07-16', SAT = '2026-07-18'
const cs = (p: string) => String((PEOPLE as any)[p].cs)
let SAID: string[] = []

beforeEach(() => {
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
  NOTICES.length = 0
  setSession({ user: 'ad', role: 'admin', name: 'ad' }); setMe('stiff')     // Saber, an admin
  raptorInitStore()
  lwInitStore(memoryBackend())
  setPeople(projectPeople())
  wireLeaveWarSync()
  _resetTimeline(); lwHistInit(); installGlobalUndo()
  SAID = []; HOOKS.toast = (m: any) => { SAID.push(String(m)) }
  setRole('admin')
  pops.setOilList(null); pops.setBellList(false); pops.setInpEdit(null); pops.setOilAsk(null)
  /* a second scheduler: Warden, who filed none of what follows */
  expect(addAccount('wd', 'nact', 'admin'), 'a second admin account').toBeNull()
})
afterEach(() => { HOOKS.toast = toast; _resetTimeline(); setSession(null); setMe(DEFAULT_ME); document.body.innerHTML = '' })

/* filed on the working Friday, as its window files it — a weekday asks nothing */
const file = (title: string, type: string, ppl: string[], over: any = {}): string => {
  const d = draftOf({ person: ppl[0], type, title, date: 'Jul 17', yr: 2026, allday: false, s: 540, e: 720, remarks: '', ...over })
  expect(commitInput(null, d, ppl), `filed: ${title}`).toBe(true)
  const r = (title ? INPUTS.find((x: any) => x.title === title) : INPUTS.find((x: any) => x.type === type && idsOf(x).map(String).join() === ppl.join())) as any
  expect(r, title || type).toBeTruthy()
  expect(r.oil, 'a working day: no answer, and none asked').toBeUndefined()
  return String(r.iid)
}
const three = () => ({
  range: file('Range brief', 'Training', ['bane', 'nick']),
  gate: file('Gate duty', 'Duty', ['harpoon'], { allday: true }),
  board: file('Safety board', 'Meeting', ['mamba'], { s: 840, e: 900 }),
})
const ph = (iso: string, name = 'National Day', to = iso) => ({ kind: 'ph' as const, name, from: iso, to })
const hol = (pid: string) => NOTICES.filter(n => n.to === pid && n.what[0] && (n.what[0] as any).k === 'oilhol')
const line = (pid: string) => noticesFor(pid).filter(n => (n.what[0] as any).k === 'oilhol')
const rec = (iid: string) => INPUTS.find((x: any) => String(x.iid) === iid) as any
const yes = (ids: string[]) => Object.fromEntries(ids.map(i => [i, 'y' as const]))

describe('what the list holds — every input of the day that needs an OIL answer, read live (D782) (ON10)', () => {
  it('a working day lists nothing; made a holiday, it lists each input on the programme with no answer — one line an input, its unanswered days and its own amount', () => {
    const m = three()
    expect(oilOpenOn(FRI, FRI), 'a working Friday').toEqual([])
    expect(holidayAdd(ph(FRI)).ok).toBe(true)
    const open = oilOpenOn(FRI, FRI)
    const mine = open.filter(o => Object.values(m).includes(o.iid))
    expect(mine.map(o => o.iid).sort(), 'all three, once each').toEqual(Object.values(m).sort())
    expect(open.find(o => o.iid === m.range), 'an input of several is ONE line (D762); three hours is half a day').toMatchObject({ days: [FRI], amt: 0.5, last: FRI })
    expect(open.find(o => o.iid === m.gate), 'all day is a full day').toMatchObject({ days: [FRI], amt: 1 })
    /* an answered one, one taken off the programme and a kind that never asks are not listed */
    rec(m.board).oil = { [FRI]: 0 }
    rec(m.gate).acc = 'r'
    const leave = file('', 'LL', ['split'], { allday: true })
    const now = oilOpenOn(FRI, FRI).map(o => o.iid)
    expect(now).toContain(m.range)
    expect(now).not.toContain(m.board); expect(now).not.toContain(m.gate); expect(now).not.toContain(leave)
  })
  /* A CANCELLED INPUT IS NEVER ASKED, AND AN INFORMATION-ONLY ONE NEITHER (owner D814, 13 Oct 26 — "Canceled input
     doesn't need to ask OIL"): it can earn nothing (D760), so it stands in no list, wears no "OIL?" sign, lights no
     bell and no door prices a question for it. All worked out live: the mark off, every one of them is back. */
  it('(D814) a cancelled input and an information-only one are not listed, wear no "OIL?" sign, light no bell and are priced no question — the mark off again, all four are back', () => {
    const m = three()
    expect(holidayAdd(ph(FRI)).ok).toBe(true)
    const listed = () => oilOpenOn(FRI, FRI).map(o => o.iid)
    const bell = (pid: string) => oilPendingFor(pid).map(x => x.iid)
    const asks = (iid: string) => oilGate(draftOf(rec(iid)), rec(iid)).kind
    for (const iid of [m.gate, m.board]) {
      expect(listed(), 'the premise: listed').toContain(iid)
      expect(oilUnansweredDay(rec(iid)), 'the premise: an unanswered day').toBe(FRI)
      expect(oilSignDay(rec(iid)), 'the premise: the "OIL?" sign for a scheduler').toBe(FRI)
      expect(asks(iid), 'the premise: a door would ask').toBe('ask')
    }
    expect(bell('harpoon'), 'the premise: his own input lights his bell').toContain(m.gate)
    rec(m.gate).cx = true; rec(m.board).info = true
    expect(listed(), 'the one that is neither stays').toContain(m.range)
    for (const iid of [m.gate, m.board]) {
      expect(listed(), 'not in the one list').not.toContain(iid)
      expect(oilUnansweredDay(rec(iid)), 'no unanswered day').toBe('')
      expect(oilSignDay(rec(iid)), 'no "OIL?" sign').toBe('')
      expect(asks(iid), 'no door asks').toBe('none')
    }
    expect(bell('harpoon'), 'no bell').not.toContain(m.gate)
    delete rec(m.gate).cx; delete rec(m.board).info
    for (const iid of [m.gate, m.board]) {
      expect(listed(), 'the mark off: listed again').toContain(iid)
      expect(oilSignDay(rec(iid)), 'and its sign').toBe(FRI)
      expect(asks(iid), 'and a door asks').toBe('ask')
    }
    expect(bell('harpoon')).toContain(m.gate)
  })
  it('(D814) an answer given before the input was cancelled stays on the record, and the "change my answer" button goes with the mark', () => {
    const m = three()
    expect(holidayAdd(ph(FRI)).ok).toBe(true)
    rec(m.gate).oil = { [FRI]: 1 }
    expect(oilAnswered(rec(m.gate)), 'the premise: an answer to change').toBe(true)
    rec(m.gate).cx = true
    expect(rec(m.gate).oil, 'the answer is kept').toEqual({ [FRI]: 1 })
    expect(oilAnswered(rec(m.gate)), 'nothing to revise while it is cancelled').toBe(false)
    expect(oilGate(draftOf(rec(m.gate)), rec(m.gate), true).kind, 'and the revise door prices nothing').toBe('none')
  })
  /* (the narrow read of D814's fix, 13 Oct 26 — no test held it) */
  it('(D814) a day made a holiday when every unanswered input on it is cancelled or information-only tells nobody and opens no list', () => {
    const m = three()
    /* EVERY input in the world (the demo week has its own on that Friday), half by each mark */
    ;(INPUTS as any[]).forEach((r, i) => { if (i % 2) r.cx = true; else r.info = true })
    expect(rec(m.range).cx || rec(m.range).info, 'the premise: the three are marked too').toBe(true)
    expect(holidayAdd(ph(FRI)).ok).toBe(true)
    expect(oilOpenOn(FRI, FRI), 'nothing is listed').toEqual([])
    expect(hol('nact'), 'no scheduler is told').toHaveLength(0)
    expect(pops.OILLIST, 'and no list opens').toBeNull()
  })
  it('an input that runs past the holiday lists only its days IN the run — and says the day it runs till', () => {
    const long = file('Det prep', 'Duty', ['pike'], { endDate: 'Jul 18', allday: true })
    /* filed across the Friday and the Saturday: the Saturday asked at once — answered here as its window would */
    rec(long).oil = { [SAT]: 1 }
    expect(holidayAdd(ph(FRI)).ok).toBe(true)
    expect(oilOpenOn(FRI, FRI).find(o => o.iid === long)).toMatchObject({ days: [FRI], last: SAT })
  })
  /* the break tests of 13 Oct 26 found the next two wires bare */
  it('an input with an UNANSWERED day outside the holiday is listed for its days in the run only — and the list answers only those', () => {
    const long = file('Det prep', 'Duty', ['pike'], { endDate: 'Jul 18', allday: true })      // its Saturday has no answer either
    expect(holidayAdd(ph(FRI)).ok).toBe(true)
    expect(oilOpenOn(FRI, FRI).find(o => o.iid === long)!.days, 'the Friday alone').toEqual([FRI])
    expect(saveOilDay(FRI, FRI, { [long]: 'y' })).toBe(1)
    expect(rec(long).oil, 'its Saturday is not answered from the Friday holiday’s list').toEqual({ [FRI]: 1 })
  })
  it('a day of a week the app holds locked is never listed, and making it a holiday tells nobody (its answer could not be written)', () => {
    const next = file('Next week duty', 'Duty', ['pike'], { date: 'Jul 24', allday: true })
    stashPut('20/07/2026', JSON.stringify({ d: weekBundle('20/07/2026').days, o: { 0: { d: {}, c: {} } }, cv: { 0: 'orig' } }))
    try {
      expect(holidayAdd(ph('2026-07-24', 'Locked Friday')).ok).toBe(true)
      expect(oilOpenOn('2026-07-24', '2026-07-24').map(o => o.iid), 'not listed').not.toContain(next)
      expect(hol('nact'), 'nobody told').toHaveLength(0)
      expect(pops.OILLIST, 'no list').toBeNull()
    } finally { stashClear() }
    expect(oilOpenOn('2026-07-24', '2026-07-24').map(o => o.iid), 'THE CONTROL — the lock gone, it is listed').toContain(next)
  })
})

describe('the Save — the picked answers in ONE command (D782) (ON11)', () => {
  it('Yes writes the input\'s own amount and No writes 0, on its unanswered days of the run only; one Undo takes the lot back', () => {
    const m = three()
    const long = file('Det prep', 'Duty', ['pike'], { endDate: 'Jul 18', allday: true })
    rec(long).oil = { [SAT]: 0 }
    holidayAdd(ph(FRI))
    const untouched = rec(m.board).modAt
    setMe('nact')                                       // answered by the OTHER scheduler: the stamp must name him
    expect(saveOilDay(FRI, FRI, { [m.range]: 'y', [m.gate]: 'n', [long]: 'y' }), 'three inputs answered').toBe(3)
    expect(rec(m.range).modBy, 'stamped as the window’s own answer is: who answered').toBe('nact')
    expect(rec(m.range).modAt, '…and when').toBeTruthy()
    expect(rec(m.board).modAt, 'an input not picked is not stamped').toBe(untouched)
    expect(rec(m.range).oil).toEqual({ [FRI]: 0.5 })
    expect(rec(m.gate).oil, 'a No is an answer').toEqual({ [FRI]: 0 })
    expect(rec(long).oil, 'its Saturday answer is not touched').toEqual({ [SAT]: 0, [FRI]: 1 })
    expect(rec(m.board).oil, 'not picked: left as it was').toBeUndefined()
    expect(oilOpenOn(FRI, FRI).map(o => o.iid), 'the answered ones leave the list').not.toContain(m.range)
    expect(SAID.join(' | ')).toContain('OIL answered for 3 inputs')
    globalUndo()
    expect(rec(m.range).oil, 'ONE Undo').toBeUndefined()
    expect(rec(m.gate).oil).toBeUndefined()
    expect(rec(long).oil).toEqual({ [SAT]: 0 })
  })
  it('only a scheduler saves from it; nothing picked writes nothing', () => {
    const m = three()
    holidayAdd(ph(FRI))
    expect(saveOilDay(FRI, FRI, {})).toBe(0)
    setSession({ user: 'us', role: 'main', name: 'us' }); setMe('bane')
    expect(saveOilDay(FRI, FRI, yes([m.range])), 'a member').toBe(-1)
    expect(rec(m.range).oil).toBeUndefined()
    expect(SAID.join(' | '), 'and it says why').toContain('Only a scheduler answers from this list')
  })
})

describe('the holiday tells the schedulers — never silent (D780), one notice a scheduler, made inside the holiday\'s own command', () => {
  it('(ON12) the Holidays list: every scheduler gets ONE notice for the holiday — the one who made it too; a member gets none; and the one list opens by itself', () => {
    const m = three()
    expect(holidayAdd(ph(FRI)).ok).toBe(true)
    for (const pid of ['stiff', 'nact']) {
      expect(hol(pid), `${pid}: one notice`).toHaveLength(1)
      expect(hol(pid)[0]).toMatchObject({ by: 'stiff', iid: '', name: 'National Day', day: FRI, what: [{ k: 'oilhol', a: FRI, b: FRI }] })
    }
    for (const pid of ['bane', 'nick', 'harpoon', 'mamba']) expect(hol(pid), `${pid}: a member is told by his own OIL question, never by this`).toHaveLength(0)
    const n = oilOpenOn(FRI, FRI).length
    expect(n).toBeGreaterThanOrEqual(Object.keys(m).length)
    expect(noticeWords(line('nact')[0]!), 'the line counts what is left — it stores no number').toEqual({ name: 'National Day', day: 'Fri 17 Jul', what: `${n} inputs need an OIL answer`, who: cs('stiff') })
    expect(pops.OILLIST, 'the list opens by itself, saying the day is now a holiday').toEqual({ from: FRI, to: FRI, name: 'National Day', fresh: true })
  })
  /* THE WALK'S E1 (13 Oct 26). A holiday made with the Leave War's "PH" button carries no name of its own — it is saved
     under the preset's own word — and the list said "PH is now a public holiday." under "Public holiday · PH". A
     holiday with no name of its own is named by its DAY in the list, and "Public holiday" on the bell's line. */
  it('a holiday with no name of its own: the list says "Fri 17 Jul is now a public holiday." and the bell’s line "Public holiday" — never "PH is now a public holiday."', async () => {
    three()
    expect(holidayAdd({ kind: 'ph', name: '', from: FRI, to: FRI }).ok).toBe(true)
    expect(pops.OILLIST, 'opened with no name').toEqual({ from: FRI, to: FRI, name: '', fresh: true })
    expect(hol('nact')[0]!.name, 'the notice keeps no name that is only the preset’s word').toBe('')
    expect(noticeWords(line('nact')[0]!).name, 'the bell’s line').toBe('Public holiday')
    ;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true
    const host = document.createElement('div'); document.body.appendChild(host)
    const root = createRoot(host)
    const tid = (t: string) => document.querySelector(`[data-testid="${t}"]`) as HTMLElement | null
    try {
      await act(async () => { root.render(<App />) })
      expect(tid('odl-lead')!.textContent).toBe('Fri 17 Jul is now a public holiday.')
      expect(tid('win-oilday')!.textContent, 'its second line is the kind alone').not.toContain('Public holiday ·')
      /* a run of days with no name */
      await act(async () => { pops.setOilList({ from: THU, to: FRI, name: '', fresh: true }); notify() })
      expect(tid('odl-lead')!.textContent).toBe('Thu 16 – Fri 17 Jul are now public holidays.')
    } finally { await act(async () => { root.unmount() }) }
  })
  it('an admin whose sign-in is switched off is not told (the break tests, 13 Oct 26)', () => {
    three()
    const wd = ACCOUNTS_LIST.find(a => String(a.pid) === 'nact')!
    expect(updateAccount(wd.id, { on: false }), 'Warden’s sign-in switched off').toBeNull()
    expect(holidayAdd(ph(FRI)).ok).toBe(true)
    expect(hol('nact'), 'no notice for a sign-in that is off').toHaveLength(0)
    expect(hol('stiff')).toHaveLength(1)
  })
  it('(ON13) a holiday with nothing to answer tells nobody and opens nothing; so does an Off day, and a holiday on a Saturday', () => {
    three()
    expect(holidayAdd(ph('2026-05-01')).ok, 'a day no input stands on').toBe(true)
    expect(holidayAdd({ kind: 'off', name: '', from: THU, to: THU }).ok, 'an Off day earns no OIL (D21)').toBe(true)
    file('Sat duty', 'Duty', ['pike'], { date: 'Jul 18' }); (INPUTS.find((x: any) => x.title === 'Sat duty') as any).oil = undefined
    expect(holidayAdd(ph(SAT, 'Founders day')).ok, 'a Saturday was no working day before').toBe(true)
    expect(NOTICES.filter(n => (n.what[0] as any).k === 'oilhol')).toEqual([])
    expect(pops.OILLIST).toBeNull()
  })
  it('(ON13) the Leave War\'s own doors tell the same way: a word typed on the Event row, a band, an event type re-tagged as a holiday', () => {
    three()
    /* (1) the Event row — a word of a holiday kind on the day */
    expect(setDayEvent(FRI, 0, 'National Day', 'off')).toBe(true)
    expect(hol('nact'), 'the Event row').toHaveLength(1)
    expect(pops.OILLIST, 'and the list opens from this door too').toMatchObject({ from: FRI, fresh: true })
    /* (2) a band over two working days, each with an input standing */
    NOTICES.length = 0; pops.setOilList(null)
    file('Mon brief', 'Training', ['pike'], { date: 'Jul 20' }); file('Tue brief', 'Training', ['pike'], { date: 'Jul 21' })
    expect(addEventBand(1, '2026-07-20', '2026-07-21', 'Stand down', 'off')).toBe('set')
    expect(hol('nact'), 'ONE notice for the run — one line a holiday (D783 (6))').toHaveLength(1)
    expect(hol('nact')[0]!.what).toEqual([{ k: 'oilhol', a: '2026-07-20', b: '2026-07-21' }])
    expect(noticeRun('2026-07-20', '2026-07-21')).toBe('Mon 20 – Tue 21 Jul')
    /* (3) an event TYPE made a holiday: every day wearing its word becomes one */
    NOTICES.length = 0; pops.setOilList(null)
    expect(addEventType('Tasking', 'work')).toBeNull()
    file('Wed brief', 'Training', ['pike'], { date: 'Jul 22' })
    expect(setDayEvent('2026-07-22', 0, 'Tasking')).toBe(true)
    expect(hol('nact'), 'a work day: nothing to tell').toHaveLength(0)
    const ix = getState().eventDefs.findIndex(d => d.name === 'Tasking')
    expect(updateEventType(ix, { kind: 'off' })).toBeNull()
    expect(hol('nact'), 're-tagged: the day is a holiday now, and the schedulers are told').toHaveLength(1)
    expect(hol('nact')[0]!.day).toBe('2026-07-22')
  })
  it('(ON13) a holiday MOVED onto new dates tells for the new dates', () => {
    three()
    expect(holidayAdd(ph('2026-05-01', 'May Day')).ok).toBe(true)
    expect(hol('nact')).toHaveLength(0)
    const h = holidaysIn(2026).find(x => x.from === '2026-05-01')!
    expect(holidayChange(h, ph(FRI, 'May Day')).ok).toBe(true)
    expect(hol('nact').map(n => [n.name, n.day])).toEqual([['May Day', FRI]])
  })
  it('(ON14) the holiday\'s Undo takes the notices with it, and its Redo brings them back — unread again', () => {
    three()
    holidayAdd(ph(FRI))
    const ids = hol('nact').map(n => n.id)
    expect(ids).toHaveLength(1)
    setMe('nact'); markAllNoticesRead(); expect(unreadFor('nact')).toBe(0); setMe('stiff')
    globalUndo()
    expect(holidaysIn(2026).some(h => h.from === FRI), 'the holiday is gone').toBe(false)
    expect(hol('nact'), 'and its notices with it').toHaveLength(0)
    expect(hol('stiff')).toHaveLength(0)
    globalRedo()
    expect(hol('nact').map(n => n.id), 'back, the same notices').toEqual(ids)
  })
})

describe('the line counts what is LEFT, and goes when nothing is (D781: what the admin answers tells nobody; D783 (6)) (ON15)', () => {
  it('answered in the list, the count falls for every scheduler; all answered, the line is gone and no bell is lit by it', () => {
    const m = three()
    holidayAdd(ph(FRI))
    const all = () => oilOpenOn(FRI, FRI).map(o => o.iid)
    const n = all().length
    setMe('nact')
    expect(unreadFor('nact'), 'an unread line lights his bell').toBe(1)
    expect(bellOn()).toBe(true)
    setMe('stiff')
    expect(saveOilDay(FRI, FRI, yes([m.range, m.gate]))).toBe(2)
    expect(noticeWords(line('nact')[0]!).what).toBe(n - 2 === 1 ? '1 input needs an OIL answer' : `${n - 2} inputs need an OIL answer`)
    expect(saveOilDay(FRI, FRI, yes(all()))).toBe(n - 2)
    expect(all()).toEqual([])
    expect(line('nact'), 'nothing left: no line').toEqual([])
    expect(line('stiff')).toEqual([])
    expect(hol('nact'), 'the record stays — only the list leaves it out').toHaveLength(1)
    setMe('nact')
    expect(unreadFor('nact'), 'and it is not unread: it lights no bell').toBe(0)
  })
  it('one input left says "1 input needs an OIL answer"', () => {
    file('Only one', 'Training', ['pike'], { date: 'Aug 4' })
    holidayAdd(ph('2026-08-04', 'Unit day'))
    expect(oilOpenOn('2026-08-04', '2026-08-04')).toHaveLength(1)
    expect(noticeWords(line('nact')[0]!).what).toBe('1 input needs an OIL answer')
  })
  it('the holiday taken away leaves no line; made again, there is ONE line — never two for one holiday', () => {
    three()
    holidayAdd(ph(FRI))
    holidayRemove(holidaysIn(2026).find(h => h.from === FRI)!)
    expect(line('nact'), 'a working day again: nothing to answer, no line').toEqual([])
    holidayAdd(ph(FRI))
    expect(hol('nact'), 'two records, one per making').toHaveLength(2)
    expect(line('nact'), 'ONE line').toHaveLength(1)
    setMe('nact')
    expect(unreadFor('nact'), 'and one unread — the older record counts for nothing').toBe(1)
  })
})

describe('the bell (D769 as it stands, D782, D783 (6)) (ON16)', () => {
  it('a tap on the line opens the ONE list — not fresh — closes the bell\'s list and reads the line', () => {
    three()
    holidayAdd(ph(FRI))
    pops.setOilList(null)
    setMe('nact')
    const n = line('nact')[0]!
    pops.setBellList(true)
    openNotice(n)
    expect(pops.OILLIST).toEqual({ from: FRI, to: FRI, name: 'National Day', fresh: false })
    expect(pops.BELLLIST).toBe(false)
    expect(unreadFor('nact')).toBe(0)
    expect(SAID.join(' | '), 'never "That input is gone"').not.toMatch(/gone/)
  })
  it('a scheduler whose own unanswered input the holiday line covers is taken to the bell\'s list, not to that one input\'s question', () => {
    /* Saber filed for two others: its OIL question is his to answer (D762) — and it stands on the holiday */
    three()
    holidayAdd(ph(FRI))
    pops.setOilList(null); pops.setInpEdit(null); pops.setOilAsk(null)
    setPage('inputs')
    bellTap(null)
    expect(pops.OILASK, 'not straight to one input').toBeNull()
    expect(pops.INPEDIT).toBeNull()
    expect(pops.BELLLIST, 'the bell\'s list, which carries the holiday\'s line').toBe(true)
  })
  it('the holiday’s line covers ITS dates only: a scheduler’s own unanswered input on another day still takes the tap, as D769 has it (the break tests, 13 Oct 26)', () => {
    three()
    const sat = file('Saturday duty', 'Duty', ['stiff'], { date: 'Jul 18', allday: true })      // his own, on a day the line does not cover
    holidayAdd(ph(FRI))
    pops.setOilList(null); pops.setInpEdit(null); pops.setOilAsk(null); pops.setBellList(false)
    setPage('inputs')
    bellTap(null)
    expect(pops.OILASK, 'straight to his own Saturday question').toBe(sat)
    expect(pops.BELLLIST).toBe(false)
  })
  it('a member\'s bell is as it was: straight to his own input\'s question', () => {
    const own = file('My duty', 'Duty', ['bane'], { allday: true })
    setSession({ user: 'us', role: 'main', name: 'us' }); setMe('bane')
    /* (the holiday is the admin's to make) */
    setSession({ user: 'ad', role: 'admin', name: 'ad' }); setMe('stiff'); setRole('admin')
    holidayAdd(ph(FRI))
    setSession({ user: 'us', role: 'main', name: 'us' }); setMe('bane')
    pops.setOilList(null); pops.setBellList(false)
    bellTap(null)
    expect(pops.OILASK, 'his own question').toBe(own)
    expect(pops.BELLLIST).toBe(false)
  })
  /* THE WALK'S E8 (13 Oct 26). With the admin's own "view as member" switch on (D292) the bell still listed the holiday's
     line and stayed lit by it, and a tap on the line closed the bell's list and opened nothing — the one list is a
     scheduler's and refused him. His word, D785's reading as told to him: the member view is a member for as long as
     it is on. So the line is a scheduler's line: not listed, not unread, and never in the way of his own question. */
  it('the admin’s own member view is a member while it is on: no holiday line, no bell lit by it, a tap goes to his own input’s question — and the line is back, still unread, when he switches back (D292, D785)', () => {
    three()                                             // Saber filed these for others: each question is his to answer
    holidayAdd(ph(FRI)); pops.setOilList(null)
    expect(line('stiff'), 'as the admin: his line').toHaveLength(1)
    expect(unreadFor('stiff')).toBe(1)
    setSession({ user: 'ad', role: 'admin', name: 'ad', acct: 'admin' } as any)   // a real admin account: the switch is his
    switchRoleView()                                    // the top bar's switch: the same person, a member's rights
    expect(line('stiff'), 'the member view: no holiday line').toHaveLength(0)
    expect(unreadFor('stiff'), 'and nothing unread of it — the bell is not lit by a line he cannot open').toBe(0)
    pops.setBellList(false); pops.setOilAsk(null); pops.setInpEdit(null)
    setPage('inputs')
    bellTap(null)
    expect(pops.OILASK, 'straight to his own input’s question, as any member’s bell').toBeTruthy()
    expect(pops.OILLIST, 'never the one list').toBeNull()
    switchRoleView()
    expect(line('stiff'), 'back as the admin: the line again').toHaveLength(1)
    expect(unreadFor('stiff'), 'still unread').toBe(1)
  })
  /* The plan's A6: "a line at 0 is not listed and not unread" sits in ONE place the list, the unread count and Mark all
     read share. Mark all read still took every notice of his, shown or not — so a holiday's line with nothing left,
     read without ever being seen, came back already read when something was left again. */
  it('"Mark all read" reads only the lines that are shown: a holiday’s line with nothing left comes back UNREAD when an input on it needs an answer again', () => {
    three()
    file('Thursday brief', 'Training', ['pike'], { date: 'Jul 16' })
    holidayAdd(ph(FRI)); holidayAdd(ph(THU, 'Founders Day')); pops.setOilList(null)
    expect(saveOilDay(FRI, FRI, yes(oilOpenOn(FRI, FRI).map(o => o.iid)))).toBeGreaterThan(0)
    setMe('nact')
    expect(line('nact').map(n => n.day), 'only Thursday’s line is left').toEqual([THU])
    expect(markAllNoticesRead()).toBe(true)
    expect(unreadFor('nact')).toBe(0)
    /* a new input on the Friday holiday, left unanswered: the Friday line counts one again */
    setMe('stiff')
    expect(commitInput(null, draftOf({ person: 'split', type: 'Duty', title: 'Late duty', date: 'Jul 17', yr: 2026, allday: true, remarks: '' }), ['split'])).toBe(true)
    setMe('nact')
    expect(line('nact').map(n => n.day).sort(), 'both lines now').toEqual([THU, FRI].sort())
    expect(unreadFor('nact'), 'and the Friday one is news: it was never shown to him to be read').toBe(1)
  })
})

describe('ON SCREEN — the one list as drawn (docs/mock/2026-10-12-oil-notify/*-hol-2-notice.png, *-hol-3-list.png)', () => {
  it('opens by itself with the holiday\'s line; the count, Yes to all / No to all, a pick un-picked; Save greyed until a pick; Save closes it and writes; Later writes nothing; a member is shown none', async () => {
    const m = three()
    ;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true
    const host = document.createElement('div'); document.body.appendChild(host)
    const root = createRoot(host)
    const tid = (t: string) => document.querySelector(`[data-testid="${t}"]`) as HTMLElement | null
    const click = async (el: HTMLElement | null) => { expect(el, 'the control is drawn').toBeTruthy(); await act(async () => { el!.click() }) }
    try {
      await act(async () => { root.render(<App />) })
      expect(tid('win-oilday')).toBeNull()
      await act(async () => { expect(holidayAdd(ph(FRI)).ok).toBe(true); notify() })
      const win = tid('win-oilday')!
      expect(win, 'the list is up').toBeTruthy()
      const n = oilOpenOn(FRI, FRI).length
      expect(win.querySelector('.win-ttl')!.textContent).toContain('OIL — Fri 17 Jul')
      expect(win.textContent).toContain('Public holiday · National Day')
      expect(tid('odl-lead')!.textContent).toBe('National Day is now a public holiday.')
      expect(tid('odl-count')!.textContent).toBe(`${n} to answer`)
      expect(win.querySelectorAll('.icard')).toHaveLength(n)
      expect(win.querySelector('.oiltag'), 'no "OIL?" tag inside the list').toBeNull()
      /* in the DAY's own order, as drawn — all-day before timed, then by start — not the order they were filed in */
      const order = [...win.querySelectorAll('[data-testid^="odl-yes-"]')].map(b => b.getAttribute('data-testid')!.slice(8)).filter(i => Object.values(m).includes(i))
      expect(order, 'Gate duty (all day), Range brief (09:00), Safety board (14:00)').toEqual([m.gate, m.range, m.board])
      expect(tid(`odl-yes-${m.range}`)!.textContent, 'three hours: half a day').toBe('Yes · HO')
      expect(tid(`odl-yes-${m.gate}`)!.textContent, 'all day: a full day').toBe('Yes · FO')
      expect(tid('odl-left')!.textContent).toBe('What is left goes to the schedulers’ bells')
      expect((tid('odl-save') as HTMLButtonElement).disabled, 'greyed until something is picked').toBe(true)
      /* one pick, and the same button again un-picks it */
      await click(tid(`odl-no-${m.board}`))
      expect(tid(`odl-no-${m.board}`)!.getAttribute('aria-pressed')).toBe('true')
      expect(tid('odl-count')!.textContent).toBe(`1 of ${n} answered`)
      expect((tid('odl-save') as HTMLButtonElement).disabled).toBe(false)
      await click(tid(`odl-no-${m.board}`))
      expect(tid('odl-count')!.textContent).toBe(`${n} to answer`)
      /* a tap on a card's name opens that input's own window — where everything else about it is */
      await click(tid(`odl-row-${m.gate}`)!.querySelector('[data-testid="odl-open"]') as HTMLElement)
      expect(pops.INPEDIT && String((pops.INPEDIT as any).iid), 'the input’s own window').toBe(m.gate)
      await act(async () => { pops.setInpEdit(null); notify() })
      /* Later: nothing written, the window gone */
      await click(tid('odl-yesall'))
      expect(tid('odl-count')!.textContent).toBe(`${n} of ${n} answered`)
      expect(tid('odl-left')!.textContent, 'nothing is left to go to the bells').toBe('')
      await click(tid('odl-later'))
      expect(tid('win-oilday')).toBeNull()
      expect(rec(m.range).oil, 'Later wrote nothing').toBeUndefined()
      /* from the bell's line: no "is now a public holiday" line; No to all, one switched to Yes, Save */
      await act(async () => { pops.setOilList({ from: FRI, to: FRI, name: 'National Day', fresh: false }); notify() })
      expect(tid('odl-lead')).toBeNull()
      await click(tid('odl-noall'))
      await click(tid(`odl-yes-${m.gate}`))
      await click(tid('odl-save'))
      expect(tid('win-oilday'), 'Save closes it').toBeNull()
      expect(rec(m.gate).oil).toEqual({ [FRI]: 1 })
      expect(rec(m.range).oil).toEqual({ [FRI]: 0 })
      expect(idsOf(rec(m.range)).map(String), 'the input itself is as it was').toEqual(['bane', 'nick'])
      /* asked for by a member: it draws nothing and is not left asked for */
      await act(async () => { setSession({ user: 'us', role: 'main', name: 'us' }); setMe('bane'); pops.setOilList({ from: FRI, to: FRI, name: 'National Day', fresh: false }); notify() })
      expect(tid('win-oilday')).toBeNull()
      expect(pops.OILLIST).toBeNull()
    } finally { await act(async () => { root.unmount() }) }
  })
})

/* THE TWO CODE READS OF THE FINISHED CODE (13 Oct 26 — Fable F1; the Opus read F3, F4). "One bell line a holiday" (D783
   (6)) held only while a holiday's dates never changed: a notice kept the run of dates that BECAME non-working when it
   was made, and two notices folded only where those dates were identical. Each case below was red. */
describe('one bell line a holiday, whatever is done to its dates (the two code reads)', () => {
  const MON = '2026-07-20'
  const lines = (pid: string) => line(pid).map(n => noticeWords(n).day)
  const hline = (from: string) => holidaysIn(2026).find(h => h.from === from)!
  it('LENGTHENED by a day: one line, for the whole holiday — never a second line for the day added', () => {
    three()
    file('Thursday brief', 'Training', ['pike'], { date: 'Jul 16' })
    expect(holidayAdd(ph(FRI)).ok).toBe(true)
    expect(holidayChange(hline(FRI), ph(THU, 'National Day', FRI)).ok).toBe(true)
    expect(lines('nact'), 'ONE line, Thu to Fri').toEqual(['Thu 16 – Fri 17 Jul'])
    expect(noticeWords(line('nact')[0]!).what).toBe(`${oilOpenOn(THU, FRI).length} inputs need an OIL answer`)
    expect(pops.OILLIST, 'and the list opens for the whole holiday').toMatchObject({ from: THU, to: FRI })
  })
  it('SHORTENED: the one line, and the list it opens, name the days that are still a holiday', () => {
    three()
    expect(holidayAdd(ph(THU, 'National Day', FRI)).ok).toBe(true)
    expect(lines('nact')).toEqual(['Thu 16 – Fri 17 Jul'])
    expect(holidayChange(hline(THU), ph(FRI)).ok).toBe(true)
    expect(lines('nact'), 'Thursday is a working day again').toEqual(['Fri 17 Jul'])
    setMe('nact'); pops.setOilList(null)
    openNotice(line('nact')[0]!)
    expect(pops.OILLIST).toMatchObject({ from: FRI, to: FRI })
  })
  it('taken away and made again over OTHER dates: still one line — not the old one come back to life beside the new', () => {
    three()
    expect(holidayAdd(ph(THU, 'National Day', FRI)).ok).toBe(true)
    holidayRemove(hline(THU))
    expect(lines('nact'), 'gone with the holiday').toEqual([])
    expect(holidayAdd(ph(FRI)).ok).toBe(true)
    expect(lines('nact')).toEqual(['Fri 17 Jul'])
  })
  it('ONE holiday that runs across a weekend is one line and one list — Friday to Monday', () => {
    three()
    const mon = file('Monday brief', 'Training', ['pike'], { date: 'Jul 20' })
    expect(holidayAdd(ph(FRI, 'Long weekend', MON)).ok).toBe(true)
    expect(hol('nact'), 'one notice').toHaveLength(1)
    expect(lines('nact')).toEqual(['Fri 17 – Mon 20 Jul'])
    expect(pops.OILLIST, 'the list is for the whole of it').toMatchObject({ from: FRI, to: MON })
    expect(oilOpenOn(FRI, MON).map(o => o.iid), 'and holds Monday’s input too').toContain(mon)
  })
  it('RENAMED: the line and the list it opens say the holiday’s name as it is NOW (Fable’s read, F1 — the name was read at the telling only)', () => {
    three()
    expect(holidayAdd(ph(FRI)).ok).toBe(true)
    expect(holidayChange(hline(FRI), ph(FRI, 'Founders Day')).ok).toBe(true)
    expect(noticeWords(line('nact')[0]!).name).toBe('Founders Day')
    expect(lines('nact'), 'still one line').toEqual(['Fri 17 Jul'])
    setMe('nact'); pops.setOilList(null)
    openNotice(line('nact')[0]!)
    expect(pops.OILLIST).toMatchObject({ from: FRI, to: FRI, name: 'Founders Day' })
  })
  it('a live holiday line is never one of the lines the bell cuts: with forty newer notices it is still listed, and the tap still reaches it', () => {
    three()
    expect(holidayAdd(ph(FRI)).ok).toBe(true)
    const at = Date.now() + 1000
    for (let k = 0; k < 40; k++) NOTICES.push({ id: `zz${String(k).padStart(2, '0')}`, to: 'nact', by: 'stiff', at: at + k, iid: 'gone', name: 'Some input', day: FRI, what: [{ k: 'rmk' }] } as any)
    expect(line('nact'), 'still listed').toHaveLength(1)
    expect(noticesFor('nact').length, 'thirty of the others, and the holiday’s').toBe(31)
  })
})
