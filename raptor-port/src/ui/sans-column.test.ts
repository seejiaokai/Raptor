/* HIS D2581 / D2582 (25 Nov 26) and D2750 / D2751 (26 Nov 26), the crew list's SANS section as drawn
   (docs/mock/2026-11-25-sans-d2588/, scene `col`, pictures col-new-*, col-nopick-*, col-wrap-*): the small F / O / A letters
   of what a SANS man offered stand in ONE column down the section, straight after the widest reason; his offered hours
   beside the letter are never cut — with a place picked they stand on a second line under the letter, with none picked
   the badge reads as today, "A · 08:00–10:00". What is drawn (the column's place, the hours under the letter) only a
   real browser can measure — e2e/sans-unfiled-wrap.spec.ts (its "letters and hours" part); this file pins the markup that layout rests on: the section is one
   grid whose rows share its columns, the letters and the remarks each in their own column, and the badge split into
   its letter and its hours only once a place is picked. String assertions only (jsdom draws nothing). */
import { beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from '../engine/data'
import { INPUTS, inpId } from '../engine/inputs'
import { dayEngaged, dayOff, dayStandby, slotRules } from '../engine/avail'
import { validate } from '../engine/validate'
import { SCHED } from '../engine/publish'
import { sansAvailHTML } from './palette-html'

const DSNAP = JSON.stringify(DAYS)
const ISNAP = JSON.stringify(INPUTS)
beforeEach(() => {
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((i: any) => INPUTS.push(i))
  SCHED.pending = {}; SCHED.changes = {}; SCHED.als = []
  validate()
})

/* Jester's own case (D2750): AMT offered 08:00–10:00 on Monday */
const fileJester = () => {
  const r: any = { person: 'ipman', date: 'Jul 13', allday: false, s: 480, e: 600, type: 'SANS Availability', sans: { a: true }, mod: 'now' }
  inpId(r); INPUTS.push(r); validate()
}
const section = (armKey: string) => sansAvailHTML(0, armKey, dayEngaged(DAYS[0]), dayOff(DAYS[0]), dayStandby(DAYS[0]), armKey ? slotRules(armKey) : null)
const rowFor = (html: string, id: string) => html.split('<div class="rsans-row">').find(r => r.includes(`data-person="${id}"`))

describe('D2581 / D2582 — one column for the letters', () => {
  it('the section keeps its markup (the grid is its own class, .rall.rsans — the readers that find it by its markup unchanged)', () => {
    fileJester()
    const html = section('0.0.0.0.p')
    expect(html.startsWith('<div class="rall rsans"><div class="rh2">')).toBe(true)
    expect(rowFor(html, 'ipman')).toBeTruthy()
  })
})

describe('D2750 / D2751 — his hours never cut', () => {
  it('no place picked: the badge reads as today, one line — "A · 08:00–10:00"', () => {
    fileJester()
    const row = rowFor(section(''), 'ipman')!
    expect(row).toContain('<span class="rsans-b">A · 08:00–10:00</span>')
  })
  it('a place picked: the letter, then the hours on a line of their own under it, the " · " gone', () => {
    fileJester()
    const row = rowFor(section('0.0.0.0.p'), 'ipman')!
    expect(row).toContain('<span class="rsans-b rsans-b2"><span class="rsans-l">A</span><span class="rsans-h">08:00–10:00</span></span>')
    expect(row).not.toContain('A · 08:00')
  })
  it('a place picked, a man who offered all day: the letters alone, nothing split', () => {
    const r: any = { person: 'ipman', date: 'Jul 13', allday: true, type: 'SANS Availability', sans: { f: true, o: true }, mod: 'now' }
    inpId(r); INPUTS.push(r); validate()
    const row = rowFor(section('0.0.0.0.p'), 'ipman')!
    expect(row).toMatch(/<span class="rsans-b">F\/O<\/span>/)
  })
  it('a place picked, a half day: "AM" goes under the letters as the hours do', () => {
    const r: any = { person: 'ipman', date: 'Jul 13', allday: false, half: 'am', s: 0, e: 720, type: 'SANS Availability', sans: { f: true }, mod: 'now' }
    inpId(r); INPUTS.push(r); validate()
    const row = rowFor(section('0.0.0.0.p'), 'ipman')!
    expect(row).toContain('<span class="rsans-b rsans-b2"><span class="rsans-l">F</span><span class="rsans-h">AM</span></span>')
  })
})
