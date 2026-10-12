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
import { initStore as raptorInitStore, notify } from '../state/store'
import { setSession, setMe, DEFAULT_ME } from '../state/auth'
import { addAccount } from '../state/accounts'
import { NOTICES, noticesFor, noticeWords, noticeRun } from '../state/notices'
import { unreadFor, markAllNoticesRead } from '../state/noticeseen'
import { globalRedo, globalUndo } from '../undo'
import { _resetTimeline } from '../undo/timeline'
import { installGlobalUndo } from '../state/undo-wire'
import { setPage } from '../state/view'
import { commitInput, draftOf } from '../ui/inputedit'
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
import { holidaysIn, oilOpenOn, wireLeaveWarSync } from './sync'

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
  it('an input that runs past the holiday lists only its days IN the run — and says the day it runs till', () => {
    const long = file('Det prep', 'Duty', ['pike'], { endDate: 'Jul 18', allday: true })
    /* filed across the Friday and the Saturday: the Saturday asked at once — answered here as its window would */
    rec(long).oil = { [SAT]: 1 }
    expect(holidayAdd(ph(FRI)).ok).toBe(true)
    expect(oilOpenOn(FRI, FRI).find(o => o.iid === long)).toMatchObject({ days: [FRI], last: SAT })
  })
})

describe('the Save — the picked answers in ONE command (D782) (ON11)', () => {
  it('Yes writes the input\'s own amount and No writes 0, on its unanswered days of the run only; one Undo takes the lot back', () => {
    const m = three()
    const long = file('Det prep', 'Duty', ['pike'], { endDate: 'Jul 18', allday: true })
    rec(long).oil = { [SAT]: 0 }
    holidayAdd(ph(FRI))
    expect(saveOilDay(FRI, FRI, { [m.range]: 'y', [m.gate]: 'n', [long]: 'y' }), 'three inputs answered').toBe(3)
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
