// @vitest-environment jsdom
/* THE WORDS PASS, ROUND 2 (owner D950, 17 Oct 26) AND "REJECTED" (owner D949 Q2). Each pinned through the builder the
   screen calls, as drawn by scripts/handpass/words-r2.mjs:
   · R1 — View-only Sched's unpublished day loses its boxed "Draft"; its DRAFT title tag stays;
   · R2 — the next-week peek reads "Next week: click a day to load it" (his B: every word kept, the dash a colon);
   · R3 — "· accepted" once a row, after the name; the marker after the remark and its date goes;
   · R4 — the crew panel's "Placeholders · drag in" reads "Placeholders";
   · Q2 — a rejected input is "rejected", never "removed": the Personal Inputs note, a rejected row's hover, its marker. */
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from '../engine/data'
import { INPUTS } from '../engine/inputs'
import { SCHED } from '../engine/publish'
import { validate } from '../engine/validate'
import { initStore } from '../state/store'
import { setSession } from '../state/auth'
import { setPage, PIOPEN } from '../state/view'
import { dayHTML, dormRowTitle } from './html'
import { peekDayHTML } from './peek'
import { specialRowHTML } from './palette-html'
import { sbInputsGroupPanel } from './board-html'
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
  SCHED.pending = {}; SCHED.changes = {}; SCHED.added = {}; SCHED.dayOK = {}
  PIOPEN.clear()
  setPage('editsched')
  validate()
})

describe('round 2 (D950)', () => {
  it('R1: View-only Sched\'s unpublished day says Draft once — its DRAFT tag; the boxed "Draft" is gone', () => {
    setPage('viewsched')
    const head = el(dayHTML(MON, false)).querySelector('.day-head')!
    expect([...head.querySelectorAll('.dbeak')].map(b => b.textContent), 'no Draft stamp').toEqual([])
    expect(head.querySelector('.verchip.draft'), 'the DRAFT tag stays').toBeTruthy()
  })
  it('R2: the peek\'s line keeps every word, the dash a colon', () => {
    const p = el(peekDayHTML(DAYS[MON], 0, true)).querySelector('.peek-nextwk')!
    expect(p.textContent).toBe('Next week: click a day to load it')
  })
  it('R3: "· accepted" and "· rejected" after the name only — no marker after the remark or its date', () => {
    const css = readSchedulerCss().replace(/\/\*[\s\S]*?\*\//g, '')
    expect(css).toContain(".pl-row.accd .nm .ntx::after{content:' · accepted'")
    expect(css).toContain(".pl-row.inp-dorm .nm .ntx::after{content:' · rejected'")
    expect(css).not.toMatch(/\.rk-till::after/)
    expect(css).not.toMatch(/\.pl-row\.accd \.ntx::after/)
    expect(css).not.toContain('· removed')
  })
  it('R4: the crew panel\'s placeholders heading reads "Placeholders"', () => {
    expect(el(specialRowHTML(MON)).querySelector('.rh2')?.textContent).toBe('Placeholders')
  })
})

describe('a rejected input is "rejected" (D949 Q2)', () => {
  it('the Personal Inputs note on the week and the board, and a rejected row\'s hover', () => {
    const inp = INPUTS.find((x: any) => x.type === 'Meeting' && x.date === 'Jul 13')!
    inp.acc = 'r'
    PIOPEN.add(MON)
    expect(dormRowTitle(inp)).toBe(' title="Rejected from the day — flags nothing until accepted again"')
    const note = 'A rejected input flags nothing until accepted again. Delete it here if it should go entirely.'
    expect([...el(sbInputsGroupPanel(DAYS[MON], MON)).querySelectorAll('.sb-pinote')].map(n => n.textContent)).toContain(note)
    expect([...el(dayHTML(MON, true, true)).querySelectorAll('.pl-inpnote')].map(n => n.textContent)).toContain(note)
  })
})
