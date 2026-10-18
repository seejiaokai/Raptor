// @vitest-environment jsdom
/* EVERY COPY OF A MAN'S PUCK WEARS HIS SEAT'S CREW-REST RING (owner D1013, D1017 — 18 Oct 26, "as recommended", then his
   approval of the pictures, option A). A man whose day causes tomorrow's crew-rest breach wears the DOTTED ring on his
   seat; his other pucks that day — the Personal Inputs and Unavailable rows, the SANS card, the crew list, on the week and
   the board — printed only the day's own flag, so they rang solid red with an "R", or showed nothing, and read as a breach
   ON that day. A sanctioned late show (the DASHED ring) the same. And an open issues list lights its crew with an outline,
   the very property the dotted and dashed rings are drawn with, so it hid them (option A: they keep their ring).
   Markup-level, as crewrest-ui.test.ts is: jsdom cannot measure a ring, but it proves which class each builder emitted. */
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { DAYS } from '../engine/data'
import { INPUTS, inpId } from '../engine/inputs'
import { validate, WARN } from '../engine/validate'
import { VCONF } from '../engine/rules'
import { parseHM } from '../engine/time'
import { isStandalone } from '../engine/waves'
import { initStore, writeInputsBatch } from '../state/store'
import { setSession } from '../state/auth'
import { setPage } from '../state/view'
import { dayHTML, sansCardsHTML } from './html'
import { boardHTML } from './board'
import { rosterPuck } from './palette-html'

const CREW = 'waldo'
let pristine: any[], inputs0: string
beforeAll(() => {
  initStore()
  setSession({ user: 'ad', role: 'admin' } as any)
  pristine = JSON.parse(JSON.stringify(DAYS))
  inputs0 = JSON.stringify(INPUTS)
})
beforeEach(() => {
  DAYS.length = 0; JSON.parse(JSON.stringify(pristine)).forEach((d: any) => DAYS.push(d))
  INPUTS.length = 0; JSON.parse(inputs0).forEach((i: any) => INPUTS.push(i))
  setPage('editsched')
})

const hhmmOf = (m: number) => { const x = ((m % 1440) + 1440) % 1440; return String(Math.floor(x / 60)).padStart(2, '0') + ':' + String(x % 60).padStart(2, '0') }
const firstForm = (di: number) => {
  const w = (DAYS[di].waves || []).find((x: any) => !isStandalone(x) && (x.formations || []).length)
  return w ? w.formations[0] : null
}
/* the case crewrest-ui.test.ts builds: a late Monday leg that breaks Tuesday's crew rest (Monday wears the DOTTED ring),
   and Tuesday's remarks deciding whether Tuesday's breach is sanctioned (LATE SHOW → the DASHED ring) */
const build = (rmks: string) => {
  const prev: any = firstForm(0)!
  prev.aircraft.push({ p: '', w: CREW, area: '', rmks: '', opts: {} })
  prev.to = '20:00'; prev.ld = hhmmOf(parseHM('01:30')! - VCONF.debrief)
  const today: any = firstForm(1)!
  today.aircraft.push({ p: '', w: CREW, area: '', rmks, opts: {} })
  today.br = '13:00'; today.to = '15:20'; today.ld = '16:45'
  const wave = DAYS[1].waves.find((w: any) => (w.formations || []).includes(today))
  wave.intimes = ['%CS% IN TIME 1200H'.replace('%CS%', today.cs)]
}
/* his copies on Monday: a Personal input of his own (a short meeting, clear of his flight) and a part-day leave in the
   morning (the Unavailable row) — neither clashes with an evening leg, so neither raises a flag of its own */
const copies = (di: number) => {
  const plant = (r: any) => writeInputsBatch(() => { inpId(r); INPUTS.unshift(r) })
  plant({ person: CREW, date: DAYS[di].dt, allday: false, s: 480, e: 510, type: 'Meeting', remarks: 'ring copy', mod: 'now' })
  plant({ person: CREW, date: DAYS[di].dt, allday: false, half: 'am', type: 'LL', remarks: '', mod: 'now' })
}
const el = (html: string) => { const d = document.createElement('div'); d.innerHTML = html; return d }
const classesOf = (root: HTMLElement) => [...root.querySelectorAll(`.puck[data-person="${CREW}"]`)].map(p => p.className)
/* the ring a puck wears: which of the three crew-rest boxes its builder emitted */
const ring = (c: string) => ['boxred', 'boxdash', 'boxdot'].filter(k => c.split(/\s+/).includes(k)).join(' ')
/* his flying seat on that day — the puck every copy must match */
const seatOf = (root: HTMLElement) => {
  const p = root.querySelector(`[data-slot] .puck[data-person="${CREW}"]`) as HTMLElement | null
  return p ? p.className : ''
}

describe('D1013, D1017 — the dotted ring of the day that breaks tomorrow is on every copy of him', () => {
  it('Edit Schedule\'s week: every other puck of his that day wears his seat\'s ring', () => {
    build('2A: BFM-5'); copies(0); validate()
    const root = el(dayHTML(0, true))
    expect(seatOf(root), 'the premise: his seat rings dotted').toMatch(/\bboxdot\b/)
    const all = classesOf(root)
    expect(all.length, 'the premise: his seat and his copies are drawn').toBeGreaterThan(2)
    for (const c of all) expect(ring(c), `every puck of his wears the seat's ring — ${c}`).toBe(ring(seatOf(root)))
  })
  it('the Scheduler Board: the same, the Personal Inputs and Unavailable rows included', () => {
    build('2A: BFM-5'); copies(0); validate()
    const root = el(boardHTML(0))
    expect(seatOf(root), 'the premise: his seat rings dotted').toMatch(/\bboxdot\b/)
    const all = classesOf(root)
    expect(all.length).toBeGreaterThan(2)
    for (const c of all) expect(ring(c), c).toBe(ring(seatOf(root)))
  })
  it('the SANS card and the crew list ring dotted too', () => {
    build('2A: BFM-5'); validate()
    const card = sansCardsHTML([{ person: CREW, date: DAYS[0].dt, allday: true, type: 'SANS Availability', sans: { f: true }, mod: 'now' }], 0)
    expect(classesOf(el(card))[0], 'the SANS card').toMatch(/\bboxdot\b/)
    expect(classesOf(el(rosterPuck(CREW, 0, null, null, null, null, null)))[0], 'the crew list').toMatch(/\bboxdot\b/)
  })
  it('the copies print the seat\'s own chip — the trace\'s CR — not a separate one', () => {
    build('2A: BFM-5'); copies(0); validate()
    const chips = [...el(dayHTML(0, true)).querySelectorAll(`.puck[data-person="${CREW}"] .lchip`)].map(c => c.textContent)
    expect(new Set(chips).size, `one chip on every puck of his: ${chips.join(', ')}`).toBe(1)
  })
})

describe('D1013, D1017 — a sanctioned late show rings dashed on every copy', () => {
  it('the crew list and the SANS card carry the seat\'s dash on the day of the late show', () => {
    build('2A: LATE SHOW'); validate()
    const seat = classesOf(el(dayHTML(1, true)))[0]
    expect(seat, 'the premise: the seat rings dashed').toMatch(/\bboxdash\b/)
    expect(classesOf(el(rosterPuck(CREW, 1, null, null, null, null, null)))[0], 'the crew list').toMatch(/\bboxdash\b/)
    const card = sansCardsHTML([{ person: CREW, date: DAYS[1].dt, allday: true, type: 'SANS Availability', sans: { f: true }, mod: 'now' }], 1)
    expect(classesOf(el(card))[0], 'the SANS card').toMatch(/\bboxdash\b/)
  })
})

describe('D1017 option A — an open issues list keeps the dotted and dashed rings', () => {
  const css = readFileSync(join(__dirname, 'scheduler', '08-windows-tools.css'), 'utf8')
  it('a lit puck that wears a dotted ring keeps it dotted; a dashed one keeps it dashed', () => {
    expect(css).toMatch(/\.puck\.wfoc\.boxdot\{[^}]*outline:[^;}]*dotted/)
    expect(css).toMatch(/\.puck\.wfoc\.boxdash\{[^}]*outline:[^;}]*dashed/)
  })
})

void WARN
