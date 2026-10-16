// @vitest-environment jsdom
/* AN INPUT FILED FOR ALL / ALL AVAIL STANDS ON THE COMMON PROGRAMME (owner D954, D955, D957 — 17 Oct 26). Pinned through the
   builders every screen calls — the week (Edit Schedule and View-only Sched), the board, the next-week peek, the ⓘ panel:
   · one rule (D955 (2)): with ALL or ALL AVAIL among its people the input's row is drawn on the Common Programme, among its
     own rows by start time; without them on the Ground Programme — and back;
   · it is the Ground Programme's row it always was underneath (its keys, its record): nothing moves in the data, so a
     published day reads nothing pending (D955 (4) — "only its place changes");
   · no reorder grip there (D955 (1));
   · the Ground Programme's Reject line stands under the Common Programme's heading where such an input stands (D957) —
     on the board and Edit Schedule's week, never View-only Sched. */
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from '../engine/data'
import { INPUTS, inpId } from '../engine/inputs'
import { SCHED, signOf, setDayApproved, dayShownPendCount } from '../engine/publish'
import { acceptInput } from '../engine/slots'
import { validate } from '../engine/validate'
import { initStore, writeInputs } from '../state/store'
import { setSession } from '../state/auth'
import { setPage, NOTEPUB, slotTitle } from '../state/view'
import { dayHTML, dayInfoHTML, onCommon, commonOrder, GP_TAKEOFF_NOTE, accCtl } from './html'
import { sbGroundPanel, sbProgPanel } from './board-html'
import { peekDayHTML } from './peek'
import { pendListHTML } from './pendlist'

const MON = 0
const el = (html: string) => { const d = document.createElement('div'); d.innerHTML = html; return d }
let pristine: any[] = [], inputs0 = ''
const FOUR: Array<[string, string]> = [['cur', 'ignite'], ['sked', 'bane'], ['plan', 'stiff'], ['appr', 'pump']]
const publishDay = (di: number) => { const g = signOf(di); for (const [r, w] of FOUR) (g as any)[r] = w; setDayApproved(di, true); validate() }

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
  setPage('editsched')
  validate()
})

/* a one-day Meeting on Monday at 13:00 for ALL AVAIL, landed on the day */
const allAvailMeeting = (remarks = 'Squadron brief') => {
  const inp: any = { people: [{ p: 'allavail' }], type: 'Meeting', date: 'Jul 13', allday: false, s: 780, e: 840, remarks, mod: 'now', yr: 2026 }
  INPUTS.unshift(inp); inpId(inp)
  expect(acceptInput(MON, inp, 'g')).toBe(true); validate()
  const ri = DAYS[MON].ground.findIndex((g: any) => g && g.src === inp.iid)
  expect(ri, 'its row is a Ground Programme record underneath').toBeGreaterThanOrEqual(0)
  return { inp, ri }
}
const text = (e: Element | null | undefined) => (e?.textContent || '').replace(/\s+/g, ' ').trim()

describe('the one rule (D955)', () => {
  it('onCommon: an input\'s row holding ALL or ALL AVAIL; never a hand-made row, never named people alone', () => {
    expect(onCommon({ src: 'i1', who: 'allavail' })).toBe(true)
    expect(onCommon({ src: 'i1', who: 'bane', more: ['all'] })).toBe(true)
    expect(onCommon({ src: 'i1', who: 'bane' })).toBe(false)
    expect(onCommon({ who: 'allavail' }), 'a ground item nobody filed stays on the Ground Programme').toBe(false)
  })
  it('commonOrder: placed before the first of the programme\'s own rows that starts later; equal starts the item first; no start last; its own untimed row keeps its place', () => {
    const ah = [{ prog: 'SODB', str: '07:45' }, { prog: 'MET', str: '13:00' }, { prog: 'OPEN', str: '' }, { prog: 'PT', str: '15:00' }]
    const g = [{ src: 'a', who: 'allavail', str: '14:00' }, { src: 'b', who: 'allavail', str: '13:00' }, { src: 'c', who: 'all', str: '' }, { src: 'd', who: 'bane', str: '08:00' }]
    expect(commonOrder(ah, g).map(e => e.k === 'a' ? e.x.prog : e.x.src)).toEqual(['SODB', 'MET', 'OPEN', 'b', 'a', 'PT', 'c'])   // a row of its own with no time keeps its place
  })
})

describe('Edit Schedule\'s week and View-only Sched', () => {
  it('drawn on the Common Programme, in the programme\'s row shape, not on the Ground Programme; its keys its own', () => {
    const { ri } = allAvailMeeting()
    const day = el(dayHTML(MON, true, true))
    const cp = day.querySelector('.sec-prog')!, gp = day.querySelector('.sec-grnd')
    const row = cp.querySelector(`[data-txt="gr:${MON}.${ri}.prog"]`)?.closest('.ah-row')
    expect(row, 'an .ah-row on the Common Programme').toBeTruthy()
    expect(text(row)).toContain('Squadron brief')
    expect(gp?.querySelector(`[data-txt="gr:${MON}.${ri}.prog"]`) ?? null, 'not on the Ground Programme').toBeNull()
    expect(text(cp.querySelector('.pl-inpnote')), 'the Reject line under the Common Programme (D957)').toBe(GP_TAKEOFF_NOTE)
  })
  it('View-only Sched draws it there too, with no Reject line', () => {
    allAvailMeeting()
    setPage('viewsched')
    const day = el(dayHTML(MON, false))
    expect(text(day.querySelector('.sec-prog'))).toContain('Squadron brief')
    expect(text(day.querySelector('.sec-grnd'))).not.toContain('Squadron brief')
    expect(day.querySelector('.sec-prog .pl-inpnote')).toBeNull()
  })
  it('ALL AVAIL taken off, named people left: back on the Ground Programme; put back on, up again (D955 (2))', () => {
    const { inp, ri } = allAvailMeeting()
    expect(writeInputs(() => { inp.people = [{ p: 'bane' }] })).toBe(true); validate()
    let day = el(dayHTML(MON, true, true))
    expect(text(day.querySelector('.sec-grnd'))).toContain('Squadron brief')
    expect(text(day.querySelector('.sec-prog'))).not.toContain('Squadron brief')
    expect(day.querySelector('.sec-prog .pl-inpnote'), 'no input stands on the Common Programme: no line').toBeNull()
    expect(writeInputs(() => { inp.people = [{ p: 'bane' }, { p: 'allavail' }] })).toBe(true); validate()
    day = el(dayHTML(MON, true, true))
    expect(text(day.querySelector('.sec-prog'))).toContain('Squadron brief')
    expect(DAYS[MON].ground[ri]?.src, 'the same record underneath throughout').toBe(inp.iid)
  })
  it('the ⓘ panel counts it as squadron-wide, not as a ground item', () => {
    const before = el(dayInfoHTML(MON)).textContent || ''
    const num = (t: string, k: string) => +((new RegExp(k + '\\s*(\\d+)')).exec(t)?.[1] ?? -1)
    allAvailMeeting()
    const after = el(dayInfoHTML(MON)).textContent || ''
    expect(num(after, 'Squadron-wide')).toBe(num(before, 'Squadron-wide') + 1)
    expect(num(after, 'Ground items')).toBe(num(before, 'Ground items'))
  })
  it('a published day reads nothing pending: only where it is drawn changed', () => {
    allAvailMeeting()
    publishDay(MON)
    expect(dayShownPendCount(MON)).toBe(0)
  })
})

describe('the Scheduler Board', () => {
  it('drawn in the Common Programme panel with no reorder grip; the Ground Programme panel does not draw it', () => {
    const { ri } = allAvailMeeting()
    const cp = el(sbProgPanel(DAYS[MON], MON))
    const box = cp.querySelector(`[data-bfld="gr:${MON}.${ri}.prog"]`)
    expect(box, 'its name box, on its own key').toBeTruthy()
    expect(box!.closest('.sb-arow')!.hasAttribute('data-move'), 'no drag address — its place is its time').toBe(false)
    expect(text(cp.querySelector('.sb-pinote')), 'the Reject line (D957)').toBe(GP_TAKEOFF_NOTE)
    expect(el(sbGroundPanel(DAYS[MON], MON)).querySelector(`[data-bfld="gr:${MON}.${ri}.prog"]`)).toBeNull()
  })
  it('a read-only board draws it, with no Reject line', () => {
    allAvailMeeting()
    const cp = el(sbProgPanel(DAYS[MON], MON, true, true))
    expect(text(cp)).toContain('MEETING')
    expect(cp.querySelector('.sb-pinote')).toBeNull()
  })
})

describe('the next-week peek', () => {
  it('draws it on the Common Programme, not the Ground Programme', () => {
    const d = JSON.parse(JSON.stringify(DAYS[MON]))
    d.ground = [...(d.ground || []), { prog: 'MEETING', str: '13:00', end: '14:00', who: 'allavail', rmks: 'Peek brief', src: 'ipeek' }]
    const day = el(peekDayHTML(d, 0, false))
    expect(text(day.querySelector('.sec-prog'))).toContain('Peek brief')
    expect(text(day.querySelector('.sec-grnd'))).not.toContain('Peek brief')
  })
})

/* THE SCENARIO DESIGNER'S FINDS (job 2, 17 Oct 26) */
describe('the scenario designer\'s finds', () => {
  it('2: a day whose only Ground Programme row went to the Common Programme still shows the Ground Programme\'s public note on View-only Sched', () => {
    allAvailMeeting()
    DAYS[MON].ground = DAYS[MON].ground.filter((g: any) => onCommon(g))     // its only row: the ALL AVAIL input's
    DAYS[MON].grndnotes = 'Range closed after 1500'
    NOTEPUB.add(`gn:${MON}`)
    try {
      setPage('viewsched')
      const day = el(dayHTML(MON, false))
      expect(text(day.querySelector('.sec-grnd'))).toContain('Range closed after 1500')
      expect(day.querySelector('.sec-grnd .pl-cols'), 'no rows to head').toBeNull()
    } finally { NOTEPUB.clear() }
  })
  it('3: the week draws its row with the "came from an input" class there too', () => {
    const { ri } = allAvailMeeting()
    const row = el(dayHTML(MON, true, true)).querySelector(`.sec-prog [data-txt="gr:${MON}.${ri}.prog"]`)!.closest('.ah-row')!
    expect(row.classList.contains('gr-frominput')).toBe(true)
  })
})

/* THE FRESH CODE READ'S FINDING (job 2, 17 Oct 26) */
describe('the fresh code read: a retime of such a row on a published day', () => {
  it('waits as its own time change — no "order changed" on the Ground Programme, where it is not drawn', () => {
    const { inp } = allAvailMeeting()
    publishDay(MON)
    expect(dayShownPendCount(MON)).toBe(0)
    expect(writeInputs(() => { inp.s = 1380; inp.e = 1410 })).toBe(true); validate()
    expect(dayShownPendCount(MON), 'its time change waits').toBe(1)
    const txt = el(pendListHTML(MON)).textContent || ''
    expect(txt, txt.slice(0, 400)).not.toMatch(/order changed/i)
  })
})

/* HIS ANSWER TO Q1 (D958, 17 Oct 26): "Yes. Short word Common is fine" */
describe('the three words that named such a row "Ground" say "Common" (D958)', () => {
  it('the phone banner for a place on its row; a row on the Ground Programme keeps "Ground"', () => {
    const { inp, ri } = allAvailMeeting()
    expect(slotTitle(`g:${MON}.${ri}.0`)).toMatch(/^Common · /)
    expect(writeInputs(() => { inp.people = [{ p: 'bane' }] })).toBe(true); validate()
    expect(slotTitle(`g:${MON}.${ri}.0`)).toMatch(/^Ground · /)
  })
  it('Personal Inputs\' button for an Other filed for ALL AVAIL reads "→ Common"; for named people "→ Ground"', () => {
    const o: any = { people: [{ p: 'allavail' }], type: 'Other', date: 'Jul 13', allday: false, s: 600, e: 660, remarks: 'x', mod: 'now', yr: 2026 }
    INPUTS.unshift(o); inpId(o)
    expect(el(accCtl(MON, o)).textContent).toContain('→ Common')
    o.people = [{ p: 'bane' }]
    expect(el(accCtl(MON, o)).textContent).toContain('→ Ground')
  })
})
