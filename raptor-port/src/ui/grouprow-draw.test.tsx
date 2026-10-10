// @vitest-environment jsdom
/* A SHARED INPUT IS DRAWN AS ONE ROW (`[GROUP-INPUT-ONE-ROW]` step 4; owner D661 — "on the schedule a group input is ONE
   row holding everyone — not a row for each man"; D743 — the ten pictures approved as drawn; D737 — on the Unavailable
   list it stays a row a man; the plan docs/superpowers/plans/2026-10-10-group-input-one-row-plan.md §4.3).

   Underneath, a shared input is still one ground row a man (engine/grouprows.ts says which rows are one). Every builder
   that draws a ground row draws the LEAD and nothing for the other members: Edit Schedule's week, View-only Sched, the
   Scheduler Board (and its OIL Earn mode), the next-week peek. The pucks are every member row's own man, A to Z, then
   each row's extras — and EVERY PUCK KEEPS ITS OWN ROW'S KEY, so its flag, its amendment mark, its OIL bar and switch
   and a tap on it are that man's row's, as before. The one "+ add" place is the lead's.
   Personal Inputs draws an entry of several as one line too, split by where each man's request is filed, so a line
   never claims what is true of only some; its folded heading counts the input once.
   The geometry — two pucks across on a desktop, stacked on a phone, the two times together — is a browser test
   (e2e/grouprow.spec.ts): jsdom has no layout. */
import { beforeEach, afterEach, describe, expect, it } from 'vitest'
import { DAYS } from '../engine/data'
import { INPUTS } from '../engine/inputs'
import { PEOPLE } from '../engine/people'
import { acceptInput, unacceptInput } from '../engine/slots'
import { validate } from '../engine/validate'
import { SCHED } from '../engine/publish'
import { HOOKS } from '../engine/hooks'
import { ensureRowIds } from '../engine/rowids'
import { inputItemKey } from '../engine/oil'
import { groundGroups, drawnPeople } from '../engine/grouprows'
import { entryLines } from '../state/inputgroup'
import { dayHTML, lSeat } from './html'
import { boardHTML } from './board'
import { peekDayHTML } from './peek'
import { leadKeyOf } from './grouprow'
import { setSession } from '../state/auth'
import { setPage, setBoardDay, PIOPEN, setOilDay } from '../state/view'

const DSNAP = JSON.stringify(DAYS), ISNAP = JSON.stringify(INPUTS)
const WED = 2, SAT = 5
const doc = (html: string) => { const d = document.createElement('div'); d.innerHTML = html; return d }
const cs = (id: string) => String((PEOPLE as any)[id].cs)
const az = (ids: string[]) => ids.slice().sort((a, b) => cs(a).localeCompare(cs(b), undefined, { sensitivity: 'base' }))
/* a shared Meeting titled "Range safety brief" for these people, each record landed as a scheduler's Accept lands it */
const group = (people: string[], di = WED, over: any = {}) => people.map(p => {
  const inp: any = { iid: 'gi_' + p, person: p, grp: 'g1', grpBy: 'stiff', date: di === SAT ? 'Jul 18' : 'Jul 15', yr: 2026, allday: false, s: 840, e: 900, type: 'Meeting', title: 'Range safety brief', remarks: 'Bring your logbook', ...over }
  INPUTS.push(inp)
  expect(acceptInput(di, inp, 'g'), p).toBe(true)
  return inp
})
const riOf = (iid: string, di = WED) => DAYS[di].ground.findIndex((g: any) => g.src === iid)
const FOUR = ['split', 'bane', 'vinci', 'pike']                 // filed out of A-to-Z order on purpose
const weekRows = (ed: boolean, di = WED) => [...doc(dayHTML(di, ed)).querySelectorAll('.sec-grnd .pl-row')].filter(r => /RANGE SAFETY BRIEF/.test(r.textContent || '')) as HTMLElement[]
const boardRows = (di = WED) => [...doc(boardHTML(di)).querySelectorAll('.sb-panel.grnd .sb-arow')].filter(r => [...r.querySelectorAll('[data-bfld$=".prog"]')].some(i => (i as HTMLInputElement).value === 'RANGE SAFETY BRIEF' || i.textContent === 'RANGE SAFETY BRIEF') || /RANGE SAFETY BRIEF/.test(r.textContent || '')) as HTMLElement[]
const slots = (row: Element) => [...row.querySelectorAll('.ppl [data-slot]')].map(s => (s as HTMLElement).dataset.slot!)

beforeEach(() => {
  const d = JSON.parse(DSNAP); DAYS.length = 0; d.forEach((x: any) => DAYS.push(x))
  const i = JSON.parse(ISNAP); INPUTS.length = 0; i.forEach((x: any) => INPUTS.push(x))
  SCHED.pending = {}; SCHED.changes = {}; SCHED.added = {}; SCHED.als = []; SCHED.dayOK = {}; SCHED.sign = {}; SCHED.orig = {}; SCHED.cur = {}; SCHED.al = 0
  setSession({ user: 'stiff', role: 'admin' }); setPage('editsched'); setBoardDay(WED)
  validate()
})
const HK = { earn: HOOKS.oilEarningDay, iso: HOOKS.oilDayISO }
afterEach(() => { PIOPEN.delete(WED); PIOPEN.delete(SAT); setOilDay(null); HOOKS.oilEarningDay = HK.earn; HOOKS.oilDayISO = HK.iso })

describe('drawnPeople — the pucks of a drawn row, the one answer every builder reads', () => {
  it('each member row’s own man in A-to-Z order of callsign, then each row’s extras — every puck with ITS OWN row’s key', () => {
    group(FOUR)
    DAYS[WED].ground[riOf('gi_bane')].more = ['allavail']
    const g = groundGroups(DAYS[WED])[riOf('gi_split')]!
    expect(g.members).toHaveLength(4)
    const ppl = drawnPeople(DAYS[WED], WED, g)
    expect(ppl.map(p => p.id)).toEqual([...az(FOUR), 'allavail'])
    for (const p of ppl.slice(0, 4)) expect(p.key).toBe(`g:${WED}.${riOf('gi_' + p.id)}`)
    expect(ppl[4]!.key).toBe(`g:${WED}.${riOf('gi_bane')}.x0`)
  })
})

describe('Edit Schedule’s week', () => {
  it('ONE row for the four — its pucks A to Z, each addressed by its own row; one "+ add", the lead’s', () => {
    group(FOUR); validate()
    const rows = weekRows(true)
    expect(rows).toHaveLength(1)
    const row = rows[0]!
    expect(slots(row)).toEqual(az(FOUR).map(p => `g:${WED}.${riOf('gi_' + p)}`))
    const lead = groundGroups(DAYS[WED])[riOf('gi_split')]!.lead
    expect(row.querySelector('.ppl')!.getAttribute('data-fill')).toBe(`g:${WED}.${lead}.+`)
    expect(row.querySelectorAll('.addz')).toHaveLength(1)
    expect(row.querySelector('.ppl')!.classList.contains('one'), 'several pucks: not the one-puck cell').toBe(false)
    /* the row's own boxes are the lead's */
    expect(row.querySelector('[data-txt$=".prog"]')!.getAttribute('data-txt')).toBe(`gr:${WED}.${lead}.prog`)
    expect(row.querySelector('.nm-kind')!.textContent, 'the kind kept in sight under the title (D717)').toBe('Meeting')
  })
  it('each puck is the very puck its own row would draw — so a man on leave that day is flagged on the one row (D605)', () => {
    group(FOUR)
    INPUTS.push({ iid: 'lv1', person: 'vinci', type: 'LL', date: 'Jul 15', yr: 2026, allday: true, remarks: '' })
    validate()
    const html = weekRows(true)[0]!.outerHTML
    for (const p of FOUR) expect(html, cs(p)).toContain(doc(lSeat(WED, p, `g:${WED}.${riOf('gi_' + p)}`, true)).innerHTML)
    expect(doc(lSeat(WED, 'vinci', `g:${WED}.${riOf('gi_vinci')}`, true)).querySelector('.puck')!.className, 'the man on leave wears his flag').toMatch(/\bhard\b|\bwarn\b|\bsoft\b|flag|sev/)
  })
  it('ten people: one row, ten pucks', () => {
    const ten = Object.keys(PEOPLE).filter(id => !(PEOPLE as any)[id].special && !(PEOPLE as any)[id].archived).slice(0, 10)
    group(ten); validate()
    const rows = weekRows(true)
    expect(rows).toHaveLength(1)
    expect(slots(rows[0]!)).toHaveLength(10)
  })
  it('an extra on a member’s row — a placeholder — is drawn after the people, with its own place’s key', () => {
    group(FOUR)
    DAYS[WED].ground[riOf('gi_pike')].more = ['allavail']; validate()
    const s = slots(weekRows(true)[0]!)
    expect(s).toHaveLength(5)
    expect(s[4]).toBe(`g:${WED}.${riOf('gi_pike')}.x0`)
  })
  it('rows whose marks differ are drawn apart: a CX on one man’s row alone is his own row', () => {
    group(FOUR)
    DAYS[WED].ground[riOf('gi_bane')].cx = true; validate()
    const rows = weekRows(true)
    expect(rows.map(r => slots(r).length).sort()).toEqual([1, 3])
  })
  it('an ordinary request beside it is the row it always was', () => {
    group(FOUR)
    const one: any = { iid: 'solo', person: 'ignite', date: 'Jul 15', yr: 2026, allday: false, s: 600, e: 660, type: 'Training', remarks: '' }
    INPUTS.push(one); expect(acceptInput(WED, one, 'g')).toBe(true); validate()
    const row = [...doc(dayHTML(WED, true)).querySelectorAll('.sec-grnd .pl-row')].find(r => /TRAINING/.test(r.textContent || ''))!
    expect(slots(row)).toEqual([`g:${WED}.${riOf('solo')}`])
    expect(row.querySelector('.ppl')!.classList.contains('one')).toBe(true)
  })
})

describe('View-only Sched and the next-week peek', () => {
  it('View-only Sched: one row, the four pucks A to Z, nothing to type in', () => {
    group(FOUR); validate(); setPage('sched')
    const rows = weekRows(false)
    expect(rows).toHaveLength(1)
    expect([...rows[0]!.querySelectorAll('.ppl .puck')].map(p => p.querySelector('.nm')!.textContent)).toEqual(az(FOUR).map(cs))
    expect(rows[0]!.querySelector('[contenteditable]')).toBeNull()
  })
  it('the next-week peek: one row for the four, read off the rows alone', () => {
    group(FOUR)
    const d = JSON.parse(JSON.stringify(DAYS[WED]))
    INPUTS.length = 0                                      // the peek never looks an input up
    const rows = [...doc(peekDayHTML(d, WED, false)).querySelectorAll('.pl-row')].filter(r => /RANGE SAFETY BRIEF/.test(r.textContent || ''))
    expect(rows).toHaveLength(1)
    expect(rows[0]!.querySelectorAll('.puck')).toHaveLength(4)
  })
})

describe('the Scheduler Board', () => {
  it('ONE row: one name box, one pair of time boxes, one remark box, one set of buttons, one grip — and the four pucks, each on its own key', () => {
    group(FOUR); validate()
    const rows = boardRows()
    expect(rows).toHaveLength(1)
    const row = rows[0]!
    const lead = groundGroups(DAYS[WED])[riOf('gi_split')]!.lead
    expect([...row.querySelectorAll('[data-bfld]')].map(b => (b as HTMLElement).dataset.bfld)).toEqual(['prog', 'str', 'end', 'rmks'].map(f => `gr:${WED}.${lead}.${f}`))
    expect(slots(row)).toEqual(az(FOUR).map(p => `g:${WED}.${riOf('gi_' + p)}`))
    expect(row.querySelectorAll('[data-grdel]')).toHaveLength(1)
    expect(row.querySelector('[data-grdel]')!.getAttribute('data-grdel')).toBe(`${WED}.${lead}`)
    expect(row.querySelectorAll('.sb-grip')).toHaveLength(1)
    expect(row.querySelector('.ppl')!.getAttribute('data-fill')).toBe(`g:${WED}.${lead}.+`)
  })
  it('in OIL Earn each puck is switched alone, under ITS OWN request — never the lead’s for everyone', () => {
    /* the Saturday earns (in the app the Leave War says so — here the two hooks it answers through) */
    HOOKS.oilEarningDay = (di: number) => di === SAT
    HOOKS.oilDayISO = (di: number) => (di === SAT ? '2026-07-18' : '2026-07-15')
    group(FOUR, SAT, { type: 'Duty', title: 'Range safety brief', oil: { '2026-07-18': 0.5 } }); ensureRowIds(DAYS); validate()
    setBoardDay(SAT); setOilDay(SAT)
    const row = [...doc(boardHTML(SAT)).querySelectorAll('.sb-panel.grnd .sb-arow')].find(r => /RANGE SAFETY BRIEF/.test(r.textContent || ''))!
    expect(row, 'the one row, in the mode').toBeTruthy()
    const taps = [...row.querySelectorAll('[data-oilp]')] as HTMLElement[]
    expect(taps.map(t => t.dataset.oilp)).toEqual(az(FOUR))
    expect(taps.map(t => t.dataset.oilitem)).toEqual(az(FOUR).map(p => inputItemKey('gi_' + p)))
  })
})

describe('Personal Inputs — one line for the entry, split by where each request is filed', () => {
  it('entryLines: the records of one entry in one filing state are one line, A to Z; an ordinary input is its own', () => {
    const recs = group(FOUR)
    const solo: any = { iid: 'solo', person: 'ignite', date: 'Jul 15', yr: 2026, allday: false, s: 600, e: 660, type: 'Training', remarks: '' }
    const lines = entryLines([...recs, solo])
    expect(lines.map(l => l.map((r: any) => r.person))).toEqual([az(FOUR), ['ignite']])
    expect(unacceptInput(WED, recs.find(r => r.person === 'bane'))).toBe(true)        // one man taken off the programme
    const split = entryLines([...recs, solo]).map(l => l.map((r: any) => r.person))
    expect(split, 'a line never claims "accepted" for a man who is not').toEqual([az(FOUR.filter(p => p !== 'bane')), ['bane'], ['ignite']])
  })
  it('the week: ONE line with every man’s puck, its title, kind, times and remark, one Undo — and folded it reads "1 input · 1 on programme"', () => {
    const count = () => { const h = doc(dayHTML(WED, true)).querySelector('.sub-h.pl-fold .pl-hint'); const m = h && /(\d+) inputs?(?: · (\d+) on programme)?/.exec(h.textContent || ''); return m ? [+m[1]!, +(m[2] || 0)] : [0, 0] }
    const [n0, g0] = count()
    group(FOUR); validate()
    expect(count(), 'the four records count as ONE input, once on the programme').toEqual([n0 + 1, g0 + 1])
  })
  it('the week, opened: one line, four pucks, one Undo', () => {
    group(FOUR); validate(); PIOPEN.add(WED)
    const lines = [...doc(dayHTML(WED, true)).querySelectorAll('.pl-row[data-inprow]')].filter(r => /Range safety brief/.test(r.textContent || ''))
    expect(lines).toHaveLength(1)
    expect([...lines[0]!.querySelectorAll('.ppl .puck')].map(p => p.querySelector('.nm')!.textContent)).toEqual(az(FOUR).map(cs))
    expect(lines[0]!.querySelector('.ppl')!.classList.contains('one')).toBe(false)
    expect(lines[0]!.querySelectorAll('[data-acc]')).toHaveLength(1)
  })
  it('the board, opened: one line, four pucks, one Undo', () => {
    group(FOUR); validate(); PIOPEN.add(WED)
    const lines = [...doc(boardHTML(WED)).querySelectorAll('.sb-panel.pinp .inprow')].filter(r => /Range safety brief/.test(r.textContent || ''))
    expect(lines).toHaveLength(1)
    expect(lines[0]!.querySelectorAll('.ppl .puck')).toHaveLength(4)
    expect(lines[0]!.querySelectorAll('[data-acc]')).toHaveLength(1)
  })
})

describe('the Unavailable list is left as it is — a row a man (D737)', () => {
  it('a shared overseas duty for three is three rows there, on the week and on the board', () => {
    for (const p of ['bane', 'pike', 'vinci']) INPUTS.push({ iid: 'od_' + p, person: p, grp: 'g2', grpBy: 'stiff', type: 'OD', date: 'Jul 15', yr: 2026, allday: true, remarks: 'det' })
    validate()
    const week = [...doc(dayHTML(WED, true)).querySelectorAll('.pl-row[data-inprow^="od_"]')]
    expect(week).toHaveLength(3)
    const board = [...doc(boardHTML(WED)).querySelectorAll('[data-inprow^="od_"]')]
    expect(board).toHaveLength(3)
  })
})

describe('leadKeyOf — a place on a row that is not drawn resolves to the one row', () => {
  it('a member row’s text box and its "+ add" go to the lead’s; a puck keeps its own key; anything else is left alone', () => {
    group(FOUR)
    const lead = groundGroups(DAYS[WED])[riOf('gi_split')]!.lead
    const other = riOf('gi_pike') === lead ? riOf('gi_bane') : riOf('gi_pike')
    expect(leadKeyOf(`gr:${WED}.${other}.str`)).toBe(`gr:${WED}.${lead}.str`)
    expect(leadKeyOf(`g:${WED}.${other}.+`)).toBe(`g:${WED}.${lead}.+`)
    expect(leadKeyOf(`g:${WED}.${other}`), 'a puck is drawn under its own key').toBe(`g:${WED}.${other}`)
    expect(leadKeyOf(`g:${WED}.${other}.x0`)).toBe(`g:${WED}.${other}.x0`)
    expect(leadKeyOf('fr:0.0.0.0')).toBe('fr:0.0.0.0')
    expect(leadKeyOf(`gr:${WED}.99.str`)).toBe(`gr:${WED}.99.str`)
  })
  it('a line under Personal Inputs: any of its people’s inputs resolves to the line’s first', () => {
    group(FOUR)
    const first = az(FOUR)[0]!
    for (const p of FOUR) expect(leadKeyOf(`iu:gi_${p}`)).toBe(`iu:gi_${first}`)
    expect(leadKeyOf('iu:nobody')).toBe('iu:nobody')
  })
})
