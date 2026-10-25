/* A COMMITMENT UNDER UNAVAILABLE IS AWAY IN THE CREW LIST (the M3 code read's Q2, 25 Oct 26).
   His D1372 sends a course straight under the schedule's Unavailable list, "as an overseas duty does, so the schedule and
   the Leave War agree", and D1357 has the war count any commitment under Unavailable out. On the Ground Programme a
   course had a row of its own, which faded him in the crew list as already tasked; under Unavailable it has no row, and
   the away check named only leave, medical, overseas duty and an actioned Attach — so a man on a course was drawn in
   full colour as free. The reading: a commitment under Unavailable, not cancelled and not information only, is away for
   its hours, as an Attach there already was. One on the Ground Programme, or taken back out (Reject), is not; and a
   cancelled one is silent everywhere (inputSilent), an Attach included — the warning list ignores it already. */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from './data'
import { dayOff, availByWave, slotBar, dayTasked } from './avail'
import { makeStandalone } from './waves'
import { INPUTS, isAway } from './inputs'
import { validate } from './validate'
import { PEOPLE } from './people'
import { SCHED } from './publish'

const DSNAP = JSON.stringify(DAYS)
const ISNAP = JSON.stringify(INPUTS)
beforeEach(() => {
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  SCHED.pending = {}; SCHED.changes = {}; SCHED.als = []
  validate()
})
afterEach(() => { INPUTS.length = 0; JSON.parse(ISNAP).forEach((i: any) => INPUTS.push(i)) })

/* a man the crew list offers on Monday with nothing of his own filed, so the input is the only thing that can move him */
function freeMan(): string {
  const a = availByWave(DAYS[0])
  const who = a.anyWave.find((id: string) => !INPUTS.some((i: any) => i.person === id && i.date === 'Jul 13'))
  expect(who, 'nobody free on Monday in the seed').toBeTruthy()
  return who as string
}
/* his own cockpit of the first line, so the seat itself never refuses him */
const ownSeat = (who: string) => '0.0.0.0.' + (PEOPLE[who].seat === 'RCP' ? 'w' : 'p')
const offered = (who: string) => { const a = availByWave(DAYS[0]); return a.anyWave.includes(who) || a.byWave.some((b: any) => b.includes(who)) }
const commit = (who: string, type: string, extra: any = {}) =>
  ({ iid: 'ua-' + type + '-' + who, person: who, date: 'Jul 13', allday: true, type, remarks: '', mod: '', ...extra })

describe('a commitment under Unavailable is away in the crew list', () => {
  it('a course filed under Unavailable (D1372) closes his day — off the list, struck from a flying seat', () => {
    const who = freeMan()
    INPUTS.push(commit(who, 'CSE', { acc: 'u' }))
    validate()
    expect(dayOff(DAYS[0]).has(who)).toBe(true)
    expect(offered(who)).toBe(false)
    expect(slotBar(who, ownSeat(who))).toContain('course')
  })

  it('any commitment a scheduler moved → Unavail does the same (D1357) — a Training', () => {
    const who = freeMan()
    INPUTS.push(commit(who, 'Training', { acc: 'u' }))
    validate()
    expect(dayOff(DAYS[0]).has(who)).toBe(true)
    expect(offered(who)).toBe(false)
  })

  it('a half-day one closes only its own half, as a half-day leave does', () => {
    const who = freeMan()
    INPUTS.push(commit(who, 'Other', { acc: 'u', allday: false, s: 240, e: 720, half: 'am' }))
    validate()
    expect(dayOff(DAYS[0]).has(who), 'not off for the whole day').toBe(false)
  })

  it('on the Ground Programme, rejected, never landed: not away (busy, or a request, as before)', () => {
    for (const acc of ['g', 'r', undefined]) {
      expect(isAway({ type: 'CSE', acc }), `CSE acc ${acc}`).toBe(false)
      expect(isAway({ type: 'Training', acc }), `Training acc ${acc}`).toBe(false)
    }
    expect(isAway({ type: 'CSE', acc: 'u' })).toBe(true)
    expect(isAway({ type: 'Event', acc: 'u' })).toBe(true)
  })

  it('a cancelled or information-only one is silent — and so is a cancelled Attach', () => {
    for (const t of ['CSE', 'Other', 'Attach']) {
      expect(isAway({ type: t, acc: 'u', cx: 'weather' }), `${t} cancelled`).toBe(false)
      expect(isAway({ type: t, acc: 'u', info: true }), `${t} information only`).toBe(false)
    }
    const who = freeMan()
    INPUTS.push(commit(who, 'CSE', { acc: 'u', cx: 'cancelled' }))
    validate()
    expect(dayOff(DAYS[0]).has(who)).toBe(false)
    expect(offered(who)).toBe(true)
  })

  it('leave, medical, overseas duty and an actioned Attach keep the answer they had', () => {
    expect(isAway({ type: 'LL' })).toBe(true)
    expect(isAway({ type: 'OML' })).toBe(true)
    expect(isAway({ type: 'OD' })).toBe(true)
    expect(isAway({ type: 'Attach', acc: 'g' })).toBe(true)
    expect(isAway({ type: 'Attach', acc: 'u' })).toBe(true)
    expect(isAway({ type: 'Attach' })).toBe(false)
    expect(isAway({ type: 'SANS Availability' })).toBe(false)
    expect(isAway({ type: 'Upchit' })).toBe(false)
  })

  it('a course under Unavailable still lets him stand an SC SPARE (a local commitment may spare)', () => {
    const who = freeMan()
    INPUTS.push(commit(who, 'CSE', { acc: 'u' }))
    DAYS[0].waves.push(makeStandalone('sc'))
    validate()
    const wi = DAYS[0].waves.length - 1
    const spare = `0.${wi}.0.2.` + (PEOPLE[who].seat === 'RCP' ? 'w' : 'p')   // the shift's SPARE row, his own seat
    expect(slotBar(who, spare)).not.toContain('course')
    expect(slotBar(who, ownSeat(who)), 'and the same man IS struck from a flying seat').toContain('course')
  })
})

/* THE NARROW READ OF THE Q2 FIXES (25 Oct 26) — R1: across an SC MAIN shift a Meeting is the warning list's amber advisory
   (a soft kind, inputs.ts shiftHard), so the crew list must not cross him out for one under Unavailable; a course stays
   struck (hard, as the validator says). R2: the day panel's "Aircrew tasked" and the free-crew strip read the same
   tasked set as the crew list (dayTasked) — a course with hours under Unavailable counts him tasked, as its Ground row did. */
describe('the narrow read of the Q2 fixes', () => {
  it('R1: an SC MAIN seat — a Meeting under Unavailable inside the shift is not struck; a course is', () => {
    const who = freeMan()
    DAYS[0].waves.push(makeStandalone('sc'))
    const wi = DAYS[0].waves.length - 1
    const main = `0.${wi}.0.0.` + (PEOPLE[who].seat === 'RCP' ? 'w' : 'p')
    INPUTS.push(commit(who, 'Meeting', { acc: 'u', allday: false, s: 540, e: 600 }))
    validate()
    expect(slotBar(who, main)).not.toMatch(/meeting/i)
    INPUTS.pop(); INPUTS.push(commit(who, 'CSE', { acc: 'u', allday: false, s: 540, e: 600 }))
    validate()
    expect(slotBar(who, main)).toMatch(/course/i)
  })
  it('R2: a course with hours under Unavailable is in the day’s tasked set; one on no day’s list is not', () => {
    const who = freeMan()
    expect(dayTasked(DAYS[0]).has(who)).toBe(false)
    INPUTS.push(commit(who, 'CSE', { acc: 'u', allday: false, s: 360, e: 1080 }))
    validate()
    expect(dayTasked(DAYS[0]).has(who)).toBe(true)
    expect(dayTasked(DAYS[0], true).has(who)).toBe(true)
  })
  it('R2: on a day with no waves he is not "free all day" while a course with hours holds him', () => {
    const di = DAYS.findIndex((d: any) => !(d.waves || []).length)
    expect(di, 'a day with no waves in the seed').toBeGreaterThanOrEqual(0)
    const d = DAYS[di]
    const who = availByWave(d).anyWave.find((id: string) => !INPUTS.some((i: any) => i.person === id && i.date === d.dt))!
    expect(who).toBeTruthy()
    INPUTS.push({ ...commit(who, 'CSE', { acc: 'u', allday: false, s: 360, e: 1080 }), date: d.dt })
    validate()
    expect(availByWave(d).anyWave).not.toContain(who)
  })
})
