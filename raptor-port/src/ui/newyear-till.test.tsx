// @vitest-environment jsdom
/* THE WEEK THAT SPANS NEW YEAR, AND THE YEAR PRINTED AFTER A DATE ([TILL-NEXT-YEAR]; owner D1095, D1096 — "All 27 instead";
   the fresh read of 20 Oct 26, F1). A schedule row prints its input's remark with "till <its last day>", the year in two
   digits where it is not the year of the week the row stands in (engine/inputs.ts tillOf; overlay.ts viewOfWeek writes
   each week's rows in that week's own year). Three things pinned, through the app's own doors:
   · the row reads the same whichever week is on screen — so a published neighbour week read for the cross-week checks
     never differs from its issued self by the year alone, and the official check is not run twice (weekctx.ts
     windowDiverges — the read reproduced it true before the fix);
   · the published days read nothing pending and stay signed, before and after a trip to the next week;
   · only what is PRINTED drops the century: the label an input keeps still carries four digits, so a leave across New Year
     covers its days, and a printed date is never read back as one (his question, "Like 2127"). */
import { beforeAll, describe, expect, it } from 'vitest'
import { DAYS } from '../engine/data'
import { INPUTS, holds, remarksShown, dateOrd, inputCoversDate, shortYear } from '../engine/inputs'
import { signOf, setSign, setDayApproved, daySigned, dayPendingItems } from '../engine/publish'
import { validate } from '../engine/validate'
import { initStore, loadWeek } from '../state/store'
import { setSession } from '../state/auth'
import { PEOPLE } from '../engine/people'
import { commitNewInput, fmt } from './inputedit'
import { windowDiverges } from '../engine/weekctx'
import { stashDays } from '../engine/weekstash'
import { VCONF } from '../engine/rules'
import { CURWEEK } from '../engine/waves'
import { dayHTML } from './html'
import { setPage } from '../state/view'

const FOUR: Array<[string, string]> = [['cur', 'ignite'], ['sked', 'bane'], ['plan', 'stiff'], ['appr', 'pump']]
const publish = (di: number) => { const g: any = signOf(di); for (const [r, w] of FOUR) g[r] = w; setDayApproved(di, true); validate(); for (const [r, w] of FOUR) setSign(di, r, w) }
const draft = (person: string, type: string, start: string, end: string, remarks: string) =>
  ({ person, type, allday: true, half: '', start, end, sTime: '06:00', eTime: '18:00', remarks, sans: null, docIds: [] })
const free = (n: number) => Object.keys(PEOPLE).filter((id: string) => !(PEOPLE as any)[id].special && !(PEOPLE as any)[id].pers && !(PEOPLE as any)[id].archived
  && !JSON.stringify(DAYS).includes(`"${id}"`) && !INPUTS.some((r: any) => holds(r, id))).slice(0, n)
const groundRmks = (days: any[], di: number) => ((days[di].ground || []) as any[]).map((g: any) => g.rmks)

describe('the week of 28 Dec 2026 — a course running to 8 Jan 2027, its Wednesday to Friday published', () => {
  let cse: any
  beforeAll(() => {
    initStore()
    setSession({ user: 'a', role: 'admin' } as any)
    loadWeek('28/12/2026'); validate()
    const [a] = free(1)
    expect(commitNewInput(draft(a, 'CSE', '2026-12-30', '2027-01-08', 'Course'))).toBe(true)
    validate()
    cse = INPUTS.find((r: any) => r.remarks === 'Course')!
    for (const di of [2, 3, 4]) publish(di)
  })

  it('its row prints the last day with a two-digit year, and the published days read nothing pending', () => {
    expect(groundRmks(DAYS, 2)).toContain('Course till 8 Jan 27')
    for (const di of [2, 3, 4]) {
      expect(dayPendingItems(di).length, `day ${di}`).toBe(0)
      expect(daySigned(di), `day ${di}`).toBe(true)
    }
  })

  it('from the week of 4 Jan 2027 the December week reads as it went out — no cross-week divergence, the check runs once', () => {
    loadWeek('04/01/2027'); validate()
    expect(remarksShown(cse), 'in a 2027 week the same input prints no year').toBe('Course till 8 Jan')
    expect(groundRmks(stashDays('28/12/2026')!.days, 2), 'the December row, read from 2027, in its own year').toContain('Course till 8 Jan 27')
    expect(windowDiverges(CURWEEK, VCONF.maxRun)).toBe(false)
  })

  it('back in December: still nothing pending, still signed', () => {
    loadWeek('28/12/2026'); validate()
    for (const di of [2, 3, 4]) {
      expect(dayPendingItems(di).length, `day ${di}`).toBe(0)
      expect(daySigned(di), `day ${di}`).toBe(true)
    }
  })

  it('only what is printed drops the century: the kept labels keep four digits, and the course covers New Year', () => {
    expect(fmt('2027-01-08'), 'a stored label of another year').toBe('Jan 8 2027')
    expect(String(cse.endDate)).toMatch(/2027$/)
    const jan1 = DAYS.find((d: any) => /^Jan 1\b/.test(d.dt))!
    expect(jan1.dt, "the week's own day key").toBe('Jan 1 2027')
    expect(inputCoversDate(cse, jan1.dt)).toBe(true)
    expect(shortYear(jan1.dt), 'printed').toBe('Jan 1 27')
    /* …and printed so on the week's own day heading (Edit Schedule and View-only Sched) */
    const head = (ed: boolean) => { setPage(ed ? 'editsched' : 'viewsched'); const el = document.createElement('div'); el.innerHTML = dayHTML(DAYS.indexOf(jan1), ed, ed); return el.querySelector('.day-head .dt')!.textContent || '' }
    for (const ed of [true, false]) { expect(head(ed), ed ? 'Edit Schedule' : 'View-only Sched').toContain('Jan 1 27'); expect(head(ed)).not.toContain('2027') }
    expect(dateOrd('Jan 1 27'), 'why a printed date is never read back: "27" is the year 27').not.toBe(dateOrd('Jan 1 2027'))
  })
})
