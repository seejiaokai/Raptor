/* FIX B — computeInsights() used to walk every wave/formation/aircraft with
   no isStandalone/f.cx/a.cx check, while waves.ts dayCount() (the precedent
   these tests mirror) filters all three. Snapshot/restore pattern lifted
   from engine/avail.test.ts, so mutating DAYS here cannot leak into any
   other test file. 'waldo' is confirmed idle across the whole live week
   (baseline computeInsights().idle), so planting him ONLY on the cancelled/
   standalone lines added below proves he is excluded for the RIGHT reason —
   not just absent by coincidence. */
import { beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from './data'
import { computeInsights } from './insights'
import { makeStandalone } from './waves'
import { EVD, WARN, validate, workSpan } from './validate'
import { VCONF } from './rules'

const DSNAP = JSON.stringify(DAYS)
beforeEach(() => {
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
})

describe('computeInsights excludes cancelled and standalone lines (FIX B, mirrors waves.ts dayCount)', () => {
  it('a cancelled aircraft is not a sortie, and its only flyer stays idle', () => {
    const before = computeInsights()
    DAYS[0].waves[0].formations[0].aircraft.push({ p: 'waldo', w: '', area: '', rmks: '', cx: true, opts: {} })
    const after = computeInsights()
    expect(after.sorties).toBe(before.sorties)
    expect(after.flyers.some((x: any) => x.id === 'waldo')).toBe(false)
    expect(after.idle).toContain('waldo')
  })

  it('a cancelled formation is not a sortie or a form, and its only flyer stays idle', () => {
    const before = computeInsights()
    DAYS[0].waves[0].formations.push({
      cs: 'CX', msn: 'TEST', to: '10:00', ld: '11:00', cx: true,
      aircraft: [{ p: 'waldo', w: '', area: '', rmks: '', opts: {} }],
    })
    const after = computeInsights()
    expect(after.sorties).toBe(before.sorties)
    expect(after.forms).toBe(before.forms)
    expect(after.flyers.some((x: any) => x.id === 'waldo')).toBe(false)
    expect(after.idle).toContain('waldo')
  })

  it('a standalone wave (SC/AVALON/BB) is not sorties or forms, and its only flyer stays idle', () => {
    const before = computeInsights()
    const w = makeStandalone('sc')
    w.formations[0].aircraft[0].p = 'waldo'
    DAYS[0].waves.push(w)
    const after = computeInsights()
    expect(after.sorties).toBe(before.sorties)
    expect(after.forms).toBe(before.forms)
    expect(after.flyers.some((x: any) => x.id === 'waldo')).toBe(false)
    expect(after.idle).toContain('waldo')
  })

  it('an ordinary flying line is still counted', () => {
    const r = computeInsights()
    expect(r.sorties).toBeGreaterThan(0)
    expect(r.forms).toBeGreaterThan(0)
    expect(r.flyers.some((x: any) => x.id === 'stiff')).toBe(true)
  })

  it('seeded together — a cancelled aircraft, a cancelled formation and a standalone wave all excluded at once, an ordinary line unaffected', () => {
    const before = computeInsights()
    DAYS[0].waves[0].formations[0].aircraft.push({ p: 'waldo', w: '', area: '', rmks: '', cx: true, opts: {} })
    DAYS[0].waves[0].formations.push({
      cs: 'CX', msn: 'TEST', to: '10:00', ld: '11:00', cx: true,
      aircraft: [{ p: 'waldo', w: '', area: '', rmks: '', opts: {} }],
    })
    const w = makeStandalone('avalon')
    w.formations[0].aircraft[0].p = 'waldo'
    DAYS[0].waves.push(w)
    const after = computeInsights()
    expect(after.sorties).toBe(before.sorties)
    expect(after.forms).toBe(before.forms)
    expect(after.flyers.some((x: any) => x.id === 'waldo')).toBe(false)
    expect(after.idle).toContain('waldo')
    expect(after.flyers.some((x: any) => x.id === 'stiff')).toBe(true)
  })
})

/* WORK HOURS FOR THE WEEK (owner, 20 Aug 26 — "perhaps have a section to show
   everyone's work hours in the insights for the week").

   The thing worth pinning is not the arithmetic — it is that the total and the
   long-work-day note are the SAME rule. They were one block of code until this
   was built; splitting a definition in two and letting the copies drift is
   this repo's most repeated bug (docs/feature-impact.md §drift-seams), so the
   test that matters is the one that puts the two numbers side by side. */
describe('work hours for the week', () => {
  it('lists everyone with a scheduled hour, longest first', () => {
    const I = computeInsights()
    expect(I.hours.length, 'somebody works this week').toBeGreaterThan(0)
    for (let i = 1; i < I.hours.length; i++)
      expect(I.hours[i - 1].mins, 'sorted longest first').toBeGreaterThanOrEqual(I.hours[i].mins)
    expect(I.hours.every((w: any) => w.mins > 0 && w.days > 0), 'nobody is listed with nothing').toBe(true)
  })

  it("a person's week is the sum of their own days, and days counts the days they are on", () => {
    const I = computeInsights()
    const w = I.hours[0]
    let mins = 0, days = 0
    DAYS.forEach((_: any, di: number) => {
      const sp = workSpan((EVD[di] || {})[w.id])
      if (sp) { mins += sp.span; days++ }
    })
    expect(w.mins).toBe(mins)
    expect(w.days).toBe(days)
  })

  /* THE ONE THAT GUARDS THE SEAM. A LONGDAY note prints the day's span in
     words; that same span has to be inside the person's week total, or the
     panel and the note are measuring different things. */
  it('the long-work-day note and the work-hours total are the same rule', () => {
    validate()
    const ld = WARN.all.find((x: any) => x.code === 'LONGDAY')
    expect(ld, 'the seed week raises at least one long-day note').toBeTruthy()
    const id = ld.who[0]
    const di = WARN.byDay.findIndex((g: any) => g && g.warns && g.warns.includes(ld))
    const sp = workSpan((EVD[di] || {})[id])!
    expect(sp, 'the note names a day the person is actually on').toBeTruthy()
    expect(sp.span, 'and it is long by the configured rule').toBeGreaterThan(VCONF.longDay)
    /* the note prints that span in its own words — matched on the HOUR count
       rather than the whole string, because the note pads its minutes ("12h00")
       where lgT drops them ("12h"), and an exact-hour span would fail a
       full-string compare for a formatting reason and nothing else. */
    expect(ld.msg, 'the note is about that very span').toContain(`${Math.floor(sp.span / 60)}h`)
    const mine = computeInsights().hours.find((x: any) => x.id === id)!
    expect(mine, 'and that person appears in the work-hours list').toBeTruthy()
    expect(mine.mins, "whose week is at least that one day's span").toBeGreaterThanOrEqual(sp.span)
  })
})
