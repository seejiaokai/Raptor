// @vitest-environment jsdom
/* THE WORDS PASS, ROUND 1b (owner D945, D947, 16 Oct 26 — his notes on round 1's preview). Each pinned through the
   builders the screens call:
   · the Scheduler Board's wave header no longer carries "In-time / Rally 09:40 · 4 ac" — the "+ In-time / Rally" button stays;
   · the button on an accepted input's row reads "Reject" (it read "Undo"), "Reject · Tue" where its row is on another day,
     its hover text starting with its verb; what it does is unchanged;
   · under the Ground Programme's heading one line says where an input is taken off — only where an input stands on it,
     only where it can be done (the board and Edit Schedule's week, never View-only Sched);
   · on a phone an accepted input's button rides its puck's line on the board (one puck, plain Reject only) and sits
     under its name on the week — the CSS rules pinned here, their geometry measured on the built app
     (scripts/handpass/words-r1b-measure.mjs). */
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from '../engine/data'
import { PEOPLE } from '../engine/people'
import { INPUTS, inpId, peopleOf } from '../engine/inputs'
import { SCHED } from '../engine/publish'
import { acceptInput, unacceptInput } from '../engine/slots'
import { validate } from '../engine/validate'
import { initStore } from '../state/store'
import { setSession } from '../state/auth'
import { setPage, PIOPEN } from '../state/view'
import { dayHTML, viewDayHTML, accCtl, GP_TAKEOFF_NOTE } from './html'
import { boardHTML } from './board'
import { sbGroundPanel, sbInputsGroupPanel } from './board-html'
import { readSchedulerCss } from '../testing/scheduler-css'

const MON = 0
const el = (html: string) => { const d = document.createElement('div'); d.innerHTML = html; return d }
let pristine: any[] = [], inputs0 = ''

beforeAll(() => {
  initStore()
  setSession({ user: 'ad', role: 'admin' } as any)
  pristine = JSON.parse(JSON.stringify(DAYS))
  inputs0 = JSON.stringify(INPUTS)
})
beforeEach(() => {
  DAYS.length = 0; JSON.parse(JSON.stringify(pristine)).forEach((d: any) => DAYS.push(d))
  INPUTS.length = 0; JSON.parse(inputs0).forEach((i: any) => INPUTS.push(i))
  SCHED.pending = {}; SCHED.changes = {}; SCHED.added = {}
  PIOPEN.clear()
  setPage('editsched')
  validate()
})

/* a Meeting on Monday, landed on Monday's Ground Programme (the demo boot may already have landed it) */
const landed = () => {
  const inp = INPUTS.find((x: any) => x.type === 'Meeting' && x.date === 'Jul 13')!
  if (inp.acc !== 'g') { if (inp.acc) unacceptInput(MON, inp); expect(acceptInput(MON, inp, 'g')).toBe(true) }
  return inp
}

describe('the board\'s wave header (D947 question 1)', () => {
  it('carries no "In-time / Rally · N ac" note, and keeps its "+ In-time / Rally" button', () => {
    const b = el(boardHTML(MON))
    const heads = [...b.querySelectorAll('.sb-go-h')]
    expect(heads.length).toBeGreaterThan(0)
    expect(b.querySelectorAll('.sb-go-h .asd').length, 'no header note').toBe(0)
    expect(heads.map(h => h.textContent).join(' ')).not.toMatch(/\d+ ac\b/)
    expect(b.querySelector('.sb-go-h [data-itadd]'), 'the + In-time / Rally button stays').toBeTruthy()
  })
})

describe('the input\'s button reads Reject (D945)', () => {
  it('an accepted input on the programme: "Reject", its hover saying what it takes off', () => {
    const inp = landed()
    const b = el(accCtl(MON, inp)).querySelector('button')!
    expect(b.textContent).toBe('Reject')
    expect(b.title).toBe('Take its row off the ground programme')
    expect(b.dataset.acc, 'what it does is unchanged').toBe('x')
  })
  it('an input filed under Unavailable: "Reject", its hover saying it goes back to Personal Inputs', () => {
    const inp = landed(); unacceptInput(MON, inp); expect(acceptInput(MON, inp, 'u')).toBe(true)
    const b = el(accCtl(MON, inp)).querySelector('button')!
    expect(b.textContent).toBe('Reject')
    expect(b.title).toBe('Take it back out of Unavailable, into Personal Inputs')
  })
  it('no "Undo" is left on any input row of the board or the week', () => {
    landed()
    PIOPEN.add(MON)
    const words = [el(boardHTML(MON)), el(dayHTML(MON, true, true))].flatMap(r => [...r.querySelectorAll('.accb')].map(b => b.textContent || ''))
    expect(words.length).toBeGreaterThan(0)
    expect(words.filter(w => /Undo/.test(w))).toEqual([])
  })
})

describe('the Ground Programme says where an input is taken off (D943, D947 question 2)', () => {
  it('the board and the week show the one line where an input stands on the programme', () => {
    landed()
    expect(GP_TAKEOFF_NOTE).toBe('To take an input off, press Reject on it in Personal Inputs below.')
    expect(el(sbGroundPanel(DAYS[MON], MON)).querySelector('.sb-pinote')?.textContent).toBe(GP_TAKEOFF_NOTE)
    expect(el(dayHTML(MON, true, true)).querySelector('.sec-grnd .pl-inpnote')?.textContent).toBe(GP_TAKEOFF_NOTE)
  })
  it('not where no input stands on it, not on a read-only board, not on View-only Sched', () => {
    landed()
    const bare = { ...DAYS[MON], ground: (DAYS[MON].ground || []).filter((x: any) => !x.src) }
    expect(el(sbGroundPanel(bare, MON)).querySelector('.sb-pinote'), 'no input on it').toBeNull()
    expect(el(sbGroundPanel(DAYS[MON], MON, true, true)).querySelector('.sb-pinote'), 'read-only board').toBeNull()
    setPage('viewsched')
    try { expect(el(viewDayHTML(MON)).textContent).not.toContain(GP_TAKEOFF_NOTE) } finally { setPage('editsched') }
  })
})

describe('on a phone the button rides its puck\'s line (D944, D947 question 3)', () => {
  it('the board marks a one-puck accepted row, and only that', () => {
    const inp = landed()
    PIOPEN.add(MON)
    const rows = [...el(sbInputsGroupPanel(DAYS[MON], MON)).querySelectorAll('.sb-arow.inprow')]
    const mine = rows.find(r => r.querySelector(`[data-acck="${inpId(inp)}"]`))!
    expect(mine.classList.contains('accup')).toBe(true)
    /* a row not accepted keeps its Accept buttons on their own line */
    unacceptInput(MON, inp)
    const again = [...el(sbInputsGroupPanel(DAYS[MON], MON)).querySelectorAll('.sb-arow.inprow')].find(r => r.querySelector(`[data-acck="${inpId(inp)}"]`))!
    expect(again.classList.contains('accup')).toBe(false)
  })
  it('a line of two people keeps the button under them', () => {
    const inp = landed()
    const p0 = peopleOf(inp)[0].p
    const p1 = Object.keys(PEOPLE).find((k: string) => k !== p0)!
    inp.people = [...peopleOf(inp), { p: p1, by: p0 }]
    PIOPEN.add(MON)
    const row = [...el(sbInputsGroupPanel(DAYS[MON], MON)).querySelectorAll('.sb-arow.inprow')].find(r => r.querySelector(`[data-acck="${inpId(inp)}"]`))!
    expect(row.querySelectorAll('.ppl .seat').length).toBe(2)
    expect(row.classList.contains('accup')).toBe(false)
  })
  it('"Reject · Tue" (its row on another day) keeps its own line: too wide beside a puck on a small phone', () => {
    const inp: any = { person: 'divot', type: 'Meeting', date: 'Jul 13', endDate: 'Jul 14', s: 540, e: 600, remarks: '', mod: 'now', yr: 2026, _t: 1 }
    INPUTS.push(inp)
    expect(acceptInput(1, inp, 'g')).toBe(true)
    PIOPEN.add(MON)
    const row = [...el(sbInputsGroupPanel(DAYS[MON], MON)).querySelectorAll('.sb-arow.inprow')].find(r => r.querySelector(`[data-acck="${inpId(inp)}"]`))!
    expect(row.querySelector('.accb')?.textContent).toBe('Reject · Tue')
    expect(row.classList.contains('accup')).toBe(false)
  })
  it('the phone rules: the board\'s, outside its desktop layout; the week\'s under the name', () => {
    const css = readSchedulerCss().replace(/\/\*[\s\S]*?\*\//g, '')
    expect(css).toContain('.schedboard:not(.sb-wide) .sb-arow.c6r.inprow.accup>.lctl{grid-column:2 / 3;grid-row:2;justify-self:end;align-self:center}')
    expect(css).toContain('.schedboard:not(.sb-wide) .sb-arow.c6r.inprow.accup>.ppl,.schedboard:not(.sb-wide) .sb-arow.c6r.inprow.accup>.rmkin{grid-row:2}')
    expect(css).toContain('.plist .pl-row.accd>.accs{grid-column:1;grid-row:2;align-self:end;justify-self:start;margin-left:0}')
  })
})
