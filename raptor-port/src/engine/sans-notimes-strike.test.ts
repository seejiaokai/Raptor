/* HIS D2573 (25 Nov 26, round A's question 1 — "Q1 & 2 as recommended"): a SANS man with nothing filed is struck on the
   crew list for a seat on a flight with no times typed yet, with the same reason as a timed seat, so the crew list agrees
   with his own reminder, which already counts that seat (D2568). A man who has filed something is unchanged: with no
   times there is still nothing to hold his offer against. Standby seats stay as they are (the carve-out the crew list
   and the warning list already share — and SC MAIN, SC SPARE, BB and AVALON need no SANS availability at all, his
   D2576, D2578, so no new strike reaches them). A sim row with no times is left as it is until he answers whether it
   counts too (D2611: a case his ruling does not name is put to him first). Nothing new on the warning list — the amber
   line for nothing filed is D2579's own job, drawn first. */
import { beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from './data'
import { INPUTS, inpId } from './inputs'
import { PEOPLE } from './people'
import { validate } from './validate'
import { slotBar, slotRules } from './avail'
import { SCHED } from './publish'
import { makeStandalone } from './waves'

const DSNAP = JSON.stringify(DAYS)
const ISNAP = JSON.stringify(INPUTS)
beforeEach(() => {
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((i: any) => INPUTS.push(i))
  SCHED.pending = {}; SCHED.changes = {}; SCHED.als = []
  validate()
})

const NONE = 'SANS — no availability filed for today'
const ID = 'ipman'          // a SANS pilot of the seed, nothing filed for Mon 13 Jul
const fileSans = (person: string, sans: any) => {
  const r: any = { person, date: 'Jul 13', endDate: undefined, allday: true, type: 'SANS Availability', sans, mod: 'now' }
  inpId(r); INPUTS.push(r); return r
}
/* a new flying line on Monday, nothing typed yet: no callsign, no take-off, no landing */
const blankLine = (label = 'ZB', extra: any = {}) => {
  const f: any = { cs: '', msn: '', to: '', ld: '', aircraft: [{ p: '', w: '', area: '', rmks: '', opts: {} }] }
  DAYS[0].waves.push({ label, night: false, intimes: [], traffic: [], formations: [f], ...extra })
  const gi = DAYS[0].waves.length - 1
  return { f, key: `0.${gi}.0.0.p`, gi }
}

describe('D2573 — a seat on a flight with no times yet', () => {
  it('the premise: ipman is SANS, nothing is filed for Monday, and the seat has no times', () => {
    expect(PEOPLE[ID] && PEOPLE[ID].san).toBeTruthy()
    expect(INPUTS.some((i: any) => i.type === 'SANS Availability' && (i.person === ID))).toBe(false)
    const { key } = blankLine()
    const r = slotRules(key)
    expect(r.slotStart, 'no take-off typed').toBeNull()
    expect(r.slotEnd).toBeNull()
  })

  it('nothing filed: struck with the same words as a timed seat', () => {
    const { key } = blankLine()
    expect(slotBar(ID, key)).toBe(NONE)
  })

  it('the same words once the times are typed — one reason, before and after', () => {
    const { f, key } = blankLine()
    const before = slotBar(ID, key)
    f.to = '13:00'; f.ld = '14:00'; validate()          // every edit re-checks the day, as the app does
    expect(slotBar(ID, key)).toBe(NONE)
    expect(before).toBe(NONE)
  })

  it('a man who has filed something is unchanged: Fly offered, or only OFT offered, raises nothing yet', () => {
    const { key } = blankLine()
    const fly = fileSans(ID, { f: true })
    expect(slotBar(ID, key), 'Fly offered').not.toMatch(/^SANS/)
    INPUTS.splice(INPUTS.indexOf(fly), 1)
    fileSans(ID, { o: true })
    expect(slotBar(ID, key), 'OFT only: no times to judge against — unchanged (the mismatch words are D2575s, drawn first)').not.toMatch(/^SANS/)
  })

  it('a man who is not SANS is never asked', () => {
    const { key } = blankLine()
    const reg = Object.keys(PEOPLE).find(id => PEOPLE[id] && PEOPLE[id].seat === 'FCP' && !PEOPLE[id].san && !PEOPLE[id].special && !PEOPLE[id].pers)!
    expect(slotBar(reg, key)).not.toMatch(/^SANS/)
  })

  it('standby lines stay as they are: an SC, AVALON or BB line with no times strikes nobody for SANS', () => {
    /* the app's own standby waves (waves.ts makeStandalone), their times cleared: every MAIN and SPARE seat */
    for (const kind of ['sc', 'avalon', 'bb']) {
      const w: any = makeStandalone(kind)
      w.formations.forEach((f: any) => { f.to = ''; f.ld = '' })
      DAYS[0].waves.push(w); const gi = DAYS[0].waves.length - 1; validate()
      w.formations[0].aircraft.forEach((a: any, ai: number) => {
        const key = `0.${gi}.0.${ai}.p`
        expect(slotRules(key).slotStart, `${kind} seat ${ai} has no times`).toBeNull()
        expect(slotBar(ID, key), `${kind} ${a.spare ? 'SPARE' : 'MAIN'} seat ${ai}`).not.toMatch(/^SANS/)
      })
    }
  })

  it('the warning list is unchanged — no new line for nothing filed (that is D2579, drawn first)', () => {
    const { f } = blankLine()
    f.aircraft[0].p = ID
    expect(validate().all.filter((w: any) => (w.who || []).includes(ID) && /SANS/.test(w.code + ' ' + w.msg))).toEqual([])
  })
})
