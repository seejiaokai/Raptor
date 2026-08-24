/* THE DEMO SANS AVAILABILITY SEED (state/demoseed.ts) — pins that seedDemoSans,
   wired into initStore() ahead of mintInpIds, does exactly what it claims:
   files the six demo records with iids, never doubles them on a second boot,
   raises zero SANS_AVAIL (and no other new warning) against its own week, and
   actually shows up in the real card-grid builder the week draws from.
   This is a state/ test, not an engine/ one, because the seed only exists
   once initStore() has run — every reference-parity test (sansavail.test.ts
   included) reads INPUTS pristine and never sees it. */
import { beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from '../engine/data'
import { INPUTS, sansAvailOn, sansWindow, sansLetters } from '../engine/inputs'
import { validate } from '../engine/validate'
import { initStore } from './store'
import { dayHTML, sansSectionHTML } from '../ui/html'

const DSNAP = JSON.stringify(DAYS)
const ISNAP = JSON.stringify(INPUTS)
beforeEach(() => {
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((i: any) => INPUTS.push(i))
})

const sansRows = () => INPUTS.filter((i: any) => i.type === 'SANS Availability')
const cardCount = (html: string) => (html.match(/class="sanscard"/g) || []).length

describe('seedDemoSans, wired through initStore()', () => {
  it('files the six records, each with the settled flags/window and a minted iid', () => {
    initStore()
    const rows = sansRows()
    expect(rows.length).toBe(6)
    rows.forEach((r: any) => expect(typeof r.iid).toBe('string'))

    const nick = rows.find((r: any) => r.person === 'nick')
    expect(nick.date).toBe('Jul 13')
    expect(nick.half).toBe('pm')
    expect(nick.s).toBe(721); expect(nick.e).toBe(1439)    // explicit, matches the real add() shape
    expect(sansLetters(nick)).toBe('F')
    expect(sansWindow(nick)).toEqual([721, 1439])          // PM: 12:01–23:59

    const romeo = rows.find((r: any) => r.person === 'romeo')
    expect(romeo.date).toBe('Jul 14')
    expect(romeo.allday).toBe(true)
    expect(sansLetters(romeo)).toBe('F')

    const vinci = rows.find((r: any) => r.person === 'vinci')
    expect(vinci.date).toBe('Jul 15')
    expect(vinci.endDate).toBe('Jul 16')
    expect(vinci.allday).toBe(true)
    expect(sansLetters(vinci)).toBe('F')
    // one span record answers for BOTH covered days
    expect(sansAvailOn('vinci', 'Jul 15')).toBe(vinci)
    expect(sansAvailOn('vinci', 'Jul 16')).toBe(vinci)

    const waldo = rows.find((r: any) => r.person === 'waldo')
    expect(waldo.date).toBe('Jul 15')
    expect(waldo.half).toBe('am')
    expect(waldo.s).toBe(0); expect(waldo.e).toBe(720)     // explicit, matches the real add() shape
    expect(sansLetters(waldo)).toBe('O')
    expect(sansWindow(waldo)).toEqual([0, 720])            // AM: 00:00–12:00

    const krait = rows.find((r: any) => r.person === 'krait')
    expect(krait.date).toBe('Jul 15')
    expect(krait.allday).toBe(true)
    expect(sansLetters(krait)).toBe('F')

    const bullet = rows.find((r: any) => r.person === 'bullet')
    expect(bullet.date).toBe('Jul 14')
    expect(bullet.allday).toBe(true)
    expect(sansLetters(bullet)).toBe('F/O/A')
  })

  it('a second initStore() call does not double-file a person+date pair', () => {
    initStore()
    const first = sansRows().length
    expect(first).toBe(6)
    initStore()                                            // same INPUTS array, no reset in between
    expect(sansRows().length).toBe(first)
    // and every seeded person still has exactly one record on their day
    ;['nick', 'romeo', 'waldo', 'krait', 'bullet'].forEach(p =>
      expect(sansRows().filter((r: any) => r.person === p).length).toBe(1))
    expect(sansRows().filter((r: any) => r.person === 'vinci').length).toBe(1)
  })

  it('validate() after boot raises zero SANS_AVAIL, and no warning set grows for these six people', () => {
    const before = validate()                              // pristine week, no seed at all
    const beforeCodes = new Set(before.all.map((w: any) => w.code))
    const people = ['nick', 'romeo', 'vinci', 'waldo', 'krait', 'bullet']
    const named = (list: any[]) => list.filter((w: any) => (w.who || []).some((id: string) => people.includes(id)))
    const beforeNamed = named(before.all)

    initStore()
    const after = validate()

    expect(after.all.filter((w: any) => w.code === 'SANS_AVAIL')).toEqual([])
    const newCodes = [...new Set(after.all.map((w: any) => w.code))].filter(c => !beforeCodes.has(c))
    expect(newCodes).toEqual([])
    expect(named(after.all).length).toBe(beforeNamed.length)
  })

  it("the week's edit-mode day HTML for a seeded day (Jul 14: romeo + bullet) renders the SANS card grid", () => {
    initStore()
    const di = 1                                           // DAYS[1].dt === 'Jul 14'
    expect(DAYS[di].dt).toBe('Jul 14')

    const day = dayHTML(di, true)
    expect(day).toContain('sec-sans')
    expect(day).toContain('class="sanscards"')
    expect(cardCount(day)).toBe(2)

    // and through the shared builder directly, the same call sanscards.test.tsx makes
    const section = sansSectionHTML(DAYS[di], di, true)
    expect(section).toContain('SANS Avail')
    expect(cardCount(section)).toBe(2)
  })

  it('view-only day HTML never draws the section, even with records filed (ed=false)', () => {
    initStore()
    const day = dayHTML(1, false)
    expect(day).not.toContain('sec-sans')
  })
})
