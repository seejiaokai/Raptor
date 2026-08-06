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
