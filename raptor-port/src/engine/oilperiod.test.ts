/* A WEEKEND NO LEAVE WAR PERIOD COVERS — owner's ruling D19 (22 Sep 26):
   "Perhaps indicate that the leave war period doesn't exist, create it."

   What was happening, driven in the app on Sat 13 Feb 27: the day offered OIL
   Earn, drew a full green bar, said "earns a full day of OIL", told the
   scheduler to "publish it before the day is out" — and after he published it
   reported "No conflicts flagged for this day ✓", while the Leave War had no
   cell at all for that date and never could. The app instructed him to do
   something that cannot work and then reported success.

   So the day NAMES the reason, and the reminder that cannot be acted on stays
   quiet. */
import { beforeEach, afterEach, describe, expect, it } from 'vitest'
import { DAYS } from './data'
import { validate, WARN } from './validate'
import { HOOKS } from './hooks'
import { SCHED, signOf, setDayApproved, dayApproved, dayCurVer, daySnapOf } from './publish'

const SAT = 5                                   // the seed Saturday, 18 Jul 26
const warnsOn = (di: number): any[] => {
  const g: any = (WARN.byDay as any)[di] || (WARN.byDay as any).find?.((x: any) => x.di === di)
  return (g && g.warns) || []
}
const codesOn = (di: number) => warnsOn(di).map((w: any) => w.code)
const msgOn = (di: number, code: string) => (warnsOn(di).find((w: any) => w.code === code) || {}).msg || ''

let saved: any
beforeEach(() => {
  saved = { day: HOOKS.oilEarningDay, iso: HOOKS.oilDayISO, none: HOOKS.oilNoPeriod }
  HOOKS.oilEarningDay = (di: number) => di === SAT
  HOOKS.oilDayISO = (di: number) => (di === SAT ? '2027-02-13' : '')
  HOOKS.oilNoPeriod = () => ''
  SCHED.dayOK = {}; SCHED.sign = {}
})
afterEach(() => {
  HOOKS.oilEarningDay = saved.day; HOOKS.oilDayISO = saved.iso; HOOKS.oilNoPeriod = saved.none
  SCHED.dayOK = {}; SCHED.sign = {}
  validate()
})
const publish = (di: number) => { const g = signOf(di); g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump'; setDayApproved(di, true) }

describe('a day whose year has no leave war period says so', () => {
  it('names the missing period instead of promising money (D19) (AM48d)', () => {
    HOOKS.oilNoPeriod = (di: number) => (di === SAT ? '2027' : '')
    validate()
    expect(codesOn(SAT), 'the day says what is wrong').toContain('OIL_NO_PERIOD')
    expect(msgOn(SAT, 'OIL_NO_PERIOD')).toContain('2027')
  })

  it('and the "publish it before the day is out" reminder stays quiet, because publishing cannot help', () => {
    HOOKS.oilNoPeriod = (di: number) => (di === SAT ? '2027' : '')
    validate()
    expect(codesOn(SAT)).not.toContain('OIL_UNPUBLISHED')
  })

  it('it still says so AFTER the day is published, so the day never reads clean', () => {
    HOOKS.oilNoPeriod = (di: number) => (di === SAT ? '2027' : '')
    publish(SAT)
    validate()
    expect(codesOn(SAT)).toContain('OIL_NO_PERIOD')
  })

  it('THE CONTROL — a day a period DOES cover is untouched, and still gets the reminder', () => {
    validate()
    expect(codesOn(SAT)).not.toContain('OIL_NO_PERIOD')
    expect(codesOn(SAT), 'the ordinary reminder is unaffected').toContain('OIL_UNPUBLISHED')
  })

  it('THE OTHER CONTROL — an ordinary weekday says nothing at all', () => {
    HOOKS.oilNoPeriod = () => '2027'
    validate()
    expect(codesOn(1)).not.toContain('OIL_NO_PERIOD')
  })
})

/* FIX 4 — THE MIRROR OF THE ADVISORY THE FORWARD CASE ALREADY HAS (hand pass
   §6 row 4). R-1 says only the issued schedule pays, BOTH directions. The
   forward half already speaks: a day published as an ordinary working day that
   the war LATER calls a holiday keeps its frozen "earns nothing" and says
   "publish it again so the OIL lands". The reverse half said nothing at all: a
   day published as a holiday that later stops being one goes on paying off its
   frozen block, correctly, while the screen contradicts the money and offers no
   way to look. */
describe('a day that stopped being a holiday after it went out says so', () => {
  /* A WEEKDAY, deliberately: a Saturday cannot stop being a weekend, and the
     engine says so in its own words beside the hook. The case this is really
     about is a public holiday the war later takes off — a Tuesday that was a
     holiday when the day went out and is an ordinary working day now. */
  const TUE = 1
  const holiday = () => { HOOKS.oilEarningDay = (di: number) => di === TUE; HOOKS.oilDayISO = (di: number) => (di === TUE ? '2027-01-01' : '') }
  const notAnyMore = () => { HOOKS.oilEarningDay = () => false }

  it('names it, and tells him how to withdraw the OIL', () => {
    holiday()
    publish(TUE)
    notAnyMore()
    validate()
    expect(codesOn(TUE)).toContain('OIL_STALE_HOLIDAY')
    expect(msgOn(TUE, 'OIL_STALE_HOLIDAY')).toMatch(/publish it again/i)
  })

  it('THE CONTROL — a day still a holiday says nothing of the kind', () => {
    holiday()
    publish(TUE)
    validate()
    expect(codesOn(TUE)).not.toContain('OIL_STALE_HOLIDAY')
  })

  it('THE OTHER CONTROL — a published weekday that never earned says nothing', () => {
    publish(2)
    notAnyMore()
    validate()
    expect(codesOn(2)).not.toContain('OIL_STALE_HOLIDAY')
  })

  it('and an UNPUBLISHED day that stopped being a holiday says nothing — nothing was ever frozen', () => {
    holiday()
    notAnyMore()
    validate()
    expect(codesOn(TUE)).not.toContain('OIL_STALE_HOLIDAY')
  })
})
