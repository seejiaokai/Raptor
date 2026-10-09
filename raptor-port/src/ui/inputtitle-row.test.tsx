// @vitest-environment jsdom
/* AN INPUT'S OWN TITLE ON THE SCHEDULE — THE ROW'S NAME, AND THE KIND KEPT IN SIGHT (`[INPUT-OWN-TITLE]`; owner D716 (2),
   D717 — 9 Oct 26: "Kind kept in sight"; the plan docs/superpowers/plans/2026-10-09-input-own-title-plan.md §3.5).

   The row a request lands on the Ground Programme is named by the input's title, in capitals. Where that name is not
   the kind's own, the kind is drawn small with it — read OFF THE ROW (`srcType` against `prog`), so an issued face
   draws what was issued, a row whose request has since been deleted still says its kind, and a row the scheduler
   renamed by hand says it too. Three builders draw that row — Edit Schedule's week, View-only Sched, the Scheduler
   Board — and each is read here. A row named by its kind is byte-for-byte what it was. */
import { beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from '../engine/data'
import { INPUTS } from '../engine/inputs'
import { acceptInput } from '../engine/slots'
import { validate } from '../engine/validate'
import { SCHED } from '../engine/publish'
import { dayHTML, rowKindTag } from './html'
import { boardHTML } from './board'
import { setSession } from '../state/auth'
import { setPage, setBoardDay, PIOPEN, setOilDay } from '../state/view'
import { sharedKey, entriesOf } from '../state/inputgroup'

const DSNAP = JSON.stringify(DAYS), ISNAP = JSON.stringify(INPUTS)
const WED = 2
const doc = (html: string) => { const d = document.createElement('div'); d.innerHTML = html; return d }
/* an Event for a named man on the loaded Wednesday, landed on the Ground Programme as a scheduler's Accept does */
const landed = (over: any = {}) => {
  const inp: any = { iid: 'tt1', person: 'split', date: 'Jul 15', yr: 2026, allday: false, s: 600, e: 660, type: 'Event', remarks: '', ...over }
  INPUTS.push(inp)
  expect(acceptInput(WED, inp, 'g')).toBe(true)
  validate()
  return { inp, row: DAYS[WED].ground.find((g: any) => g.src === inp.iid) }
}
const weekRow = (ed: boolean, iid: string) => {
  const d = doc(dayHTML(WED, ed))
  const rows = [...d.querySelectorAll('.pl-row.gr-frominput')]
  const ri = DAYS[WED].ground.findIndex((g: any) => g.src === iid)
  return rows.find(r => (r.innerHTML.includes(`gr:${WED}.${ri}.`)) || (!ed && r.textContent!.includes(String(DAYS[WED].ground[ri].prog)))) as HTMLElement
}

beforeEach(() => {
  const d = JSON.parse(DSNAP); DAYS.length = 0; d.forEach((x: any) => DAYS.push(x))
  const i = JSON.parse(ISNAP); INPUTS.length = 0; i.forEach((x: any) => INPUTS.push(x))
  SCHED.pending = {}; SCHED.changes = {}; SCHED.added = {}; SCHED.als = []; SCHED.dayOK = {}; SCHED.sign = {}; SCHED.orig = {}; SCHED.cur = {}; SCHED.al = 0
  setSession({ user: 'stiff', role: 'admin' }); setPage('editsched')
  validate()
})

describe('rowKindTag — the one answer for a row', () => {
  it('a row from a titled input: its kind, small', () => {
    expect(rowKindTag({ src: 'i1', srcType: 'Event', prog: 'SPORTS DAY' })).toBe('<span class="nm-kind">Event</span>')
  })
  it('a row named by its kind — in any case — carries nothing', () => {
    expect(rowKindTag({ src: 'i1', srcType: 'Event', prog: 'EVENT' })).toBe('')
    expect(rowKindTag({ src: 'i1', srcType: 'Fly with', prog: 'fly with' })).toBe('')
  })
  it('a row nobody filed (typed by the scheduler) carries nothing, whatever it is called', () => {
    expect(rowKindTag({ prog: 'SPORTS DAY' })).toBe('')
    expect(rowKindTag({ prog: 'SPORTS DAY', srcType: 'Event' })).toBe('')
    expect(rowKindTag(null)).toBe('')
  })
  it('a row with no name yet carries nothing', () => {
    expect(rowKindTag({ src: 'i1', srcType: 'Event', prog: '' })).toBe('')
  })
  it('the kind is escaped like any text from a record', () => {
    expect(rowKindTag({ src: 'i1', srcType: '<b>', prog: 'X' })).toBe('<span class="nm-kind">&lt;b&gt;</span>')
  })
})

describe('Edit Schedule’s week', () => {
  it('the row of a titled input is named by the title; the kind sits in the name cell after it, outside the editable name', () => {
    const { inp, row } = landed({ title: 'Sports day' })
    expect(row.prog).toBe('SPORTS DAY')
    const el = weekRow(true, inp.iid)
    const nm = el.querySelector(':scope > .nm')!
    const name = nm.querySelector('.ntx')!
    expect(name.textContent).toBe('SPORTS DAY')
    const tag = nm.querySelector('.nm-kind')!
    expect(tag.textContent).toBe('Event')
    expect(name.contains(tag), 'never inside the cell that is typed in').toBe(false)
    expect(tag.hasAttribute('contenteditable')).toBe(false)
    expect(tag.hasAttribute('data-txt')).toBe(false)
  })
  it('the row of an untitled input has no kind label — the markup it always had', () => {
    const { inp } = landed()
    const el = weekRow(true, inp.iid)
    expect(el.querySelector('.nm-kind')).toBeNull()
    expect(el.querySelector(':scope > .nm .ntx')!.textContent).toBe('EVENT')
  })
  it('a row the scheduler renamed by hand says its kind too', () => {
    const { inp, row } = landed()
    row.prog = 'OPEN HOUSE'
    expect(weekRow(true, inp.iid).querySelector('.nm-kind')!.textContent).toBe('Event')
  })
  it('a row whose request has since been deleted still says its kind (it is read off the row)', () => {
    const { inp } = landed({ title: 'Sports day' })
    INPUTS.splice(INPUTS.indexOf(inp), 1)
    const d = doc(dayHTML(WED, true))
    const tag = [...d.querySelectorAll('.pl-row .nm-kind')].find(t => t.closest('.pl-row')!.textContent!.includes('SPORTS DAY'))
    expect(tag!.textContent).toBe('Event')
  })
})

describe('View-only Sched', () => {
  it('draws the same label, read only', () => {
    const { inp } = landed({ title: 'Sports day' })
    setPage('sched')
    const d = doc(dayHTML(WED, false))
    const row = [...d.querySelectorAll('.pl-row')].find(r => r.textContent!.includes('SPORTS DAY'))!
    expect(row, inp.iid).toBeTruthy()
    expect(row.querySelector('.nm-kind')!.textContent).toBe('Event')
  })
})

describe('the Scheduler Board', () => {
  it('the row of a titled input carries its kind beside the name box; an untitled one does not', () => {
    const a = landed({ title: 'Sports day' })
    const b = landed({ iid: 'tt2', person: 'vinci', s: 720, e: 780 })
    setBoardDay(WED)
    const d = doc(boardHTML(WED))
    const rows = [...d.querySelectorAll('.sb-arow')]
    const named = (r: Element, v: string) => [...r.querySelectorAll('[data-bfld$=".prog"]')].some(i => ((i as HTMLInputElement).value || i.textContent) === v)
    const ra = rows.find(r => named(r, 'SPORTS DAY'))!
    expect(ra, a.inp.iid).toBeTruthy()
    expect(ra.querySelector('.nm-kind')!.textContent).toBe('Event')
    /* the label rides inside the name's own cell: the row has exactly as many cells as an untitled row */
    const rb = rows.find(r => r !== ra && named(r, 'EVENT'))!
    expect(rb, b.inp.iid).toBeTruthy()
    expect(rb.querySelector('.nm-kind')).toBeNull()
    expect(ra.children.length).toBe(rb.children.length)
    expect(ra.children[1].classList.contains('sb-nmk')).toBe(true)
    expect(ra.children[1].querySelector('[data-bfld$=".prog"]')).toBeTruthy()
  })
})

describe('an input’s own card — Personal Inputs on the week and on the board', () => {
  it('the week: the card is named by the title, its kind small after the name; an untitled card has no label', () => {
    const a = landed({ title: 'Sports day' }), b = landed({ iid: 'tt2', person: 'vinci', s: 720, e: 780 })
    PIOPEN.add(WED)
    try {
      const d = doc(dayHTML(WED, true))
      const card = (iid: string) => [...d.querySelectorAll(`[data-inpedit="${iid}"]`)].map(x => x.closest('.nm')!).find(Boolean) as HTMLElement
      const ca = card(a.inp.iid), cb = card(b.inp.iid)
      expect(ca, 'the titled card').toBeTruthy(); expect(cb, 'the untitled card').toBeTruthy()
      expect(ca.querySelector('.inpedit')!.textContent).toBe('Sports day')
      expect(ca.querySelector('.nm-kind')!.textContent).toBe('Event')
      expect(ca.querySelector('.inpedit')!.contains(ca.querySelector('.nm-kind')), 'the label is not part of the button that opens the input').toBe(false)
      expect(cb.querySelector('.inpedit')!.textContent).toBe('Event')
      expect(cb.querySelector('.nm-kind')).toBeNull()
    } finally { PIOPEN.delete(WED) }
  })
  it('the board: the same card, the same label, riding the item cell', () => {
    const a = landed({ title: 'Sports day' }), b = landed({ iid: 'tt2', person: 'vinci', s: 720, e: 780 })
    setBoardDay(WED); PIOPEN.add(WED)
    try {
      const d = doc(boardHTML(WED))
      const card = (iid: string) => d.querySelector(`.inprow [data-inpedit="${iid}"]`)?.closest('.inprow') as HTMLElement
      const ca = card(a.inp.iid), cb = card(b.inp.iid)
      expect(ca, 'the titled card').toBeTruthy(); expect(cb, 'the untitled card').toBeTruthy()
      expect(ca.querySelector('.inpedit')!.textContent).toBe('Sports day')
      expect(ca.querySelector('.itemcell .nm-kind')!.textContent).toBe('Event')
      expect(cb.querySelector('.nm-kind')).toBeNull()
      expect(ca.children.length, 'the card has as many cells as an untitled one').toBe(cb.children.length)
    } finally { PIOPEN.delete(WED) }
  })
})

describe('a shared input shares its title (state/inputgroup.ts SHARED_FIELDS)', () => {
  const rec = (person: string, over: any = {}) => ({ iid: 'g' + person, person, grp: 'g1', grpBy: 'stiff', type: 'Event', date: 'Jul 15', yr: 2026, allday: false, s: 600, e: 660, remarks: '', ...over })
  it('records of one group with one title are one entry; a record titled differently is not part of it', () => {
    expect(sharedKey(rec('split', { title: 'Sports day' }))).toBe(sharedKey(rec('vinci', { title: 'Sports day' })))
    expect(sharedKey(rec('split', { title: 'Sports day' }))).not.toBe(sharedKey(rec('vinci', { title: 'Open house' })))
    expect(sharedKey(rec('split'))).toBe(sharedKey(rec('vinci', { title: '' })))
    const one = entriesOf([rec('split', { title: 'Sports day' }), rec('vinci', { title: 'Sports day' })], x => x)
    expect(one.length).toBe(1); expect(one[0].rows.length).toBe(2)
    const two = entriesOf([rec('split', { title: 'Sports day' }), rec('vinci', { title: 'Open house' })], x => x)
    expect(two.length).toBe(2)
  })
})

/* THE WALK'S FINDS (walker C, 9 Oct 26 — docs/handpass/2026-10-09-input-title-check.md §5.3) */
describe('the board in OIL Earn keeps the kind in sight (W1)', () => {
  it('the titled row’s name cell is the item’s own switch — and its kind still stands under it', () => {
    const SAT = 5
    const inp: any = { iid: 'ttS', person: 'split', date: 'Jul 18', yr: 2026, allday: false, s: 600, e: 660, type: 'Event', title: 'Sports day', remarks: '', oil: { '2026-07-18': 0.5 } }
    INPUTS.push(inp); expect(acceptInput(SAT, inp, 'g')).toBe(true); validate()
    setBoardDay(SAT); setOilDay(SAT)
    try {
      const d = doc(boardHTML(SAT))
      const row = [...d.querySelectorAll('.sb-arow.c6r')].find(r => /SPORTS DAY/.test(r.textContent || ''))!
      expect(row, 'the row, in the mode').toBeTruthy()
      expect(row.querySelector('.oilitem'), 'the name cell is the switch').toBeTruthy()
      expect(row.querySelector('.sb-nmk .nm-kind')!.textContent).toBe('Event')
    } finally { setOilDay(null) }
  })
})
