/* The long-work-day note spells out the debrief pad baked into its end (owner,
   15 Aug 26 — the same "state the assumption" as crew rest, extended to every
   timing warning). When a sortie closes the day its end is the landing plus the
   assumed 2h debrief, so the note prints the real landing and flags the pad; a
   scheduler who knows a crew leaves fast can discount it. A non-flying finish is
   a fixed clock time, so it stays bare — nothing to assume. */
import { beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from './data'
import { INPUTS } from './inputs'
import { validate, WARN } from './validate'
import { isStandalone } from './waves'
import { VCONF } from './rules'

const DSNAP = JSON.stringify(DAYS)
const ISNAP = JSON.stringify(INPUTS)
beforeEach(() => {
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((i: any) => INPUTS.push(i))
})

const longdays = () =>
  (WARN.byDay || []).flatMap((d: any) => (d?.warns || []).filter((w: any) => w.code === 'LONGDAY'))

describe('the long-work-day note names the debrief assumption on a flying end', () => {
  it('the seed cases print the landing and flag the 2h debrief pad', () => {
    validate()
    const msgs = longdays().map((w: any) => w.msg)
    /* Wolf and Stiff both finish on a sortie, so both spell the end out */
    const wolf = msgs.find((m: string) => /^Wolf /.test(m))!
    expect(wolf, 'Wolf files a long day').toBeTruthy()
    expect(wolf, 'the real landing is named').toContain('last landing 16:05')
    expect(wolf, 'and the pad is flagged as an assumption').toContain('+ 2h debrief assumed')
    expect(wolf, 'the day still reads start → end').toMatch(/05:00 → 18:05/)
  })

  it('a non-flying long day keeps a bare end — nothing to assume', () => {
    /* a single all-day GROUND commitment over the 12h bar: its end is a fixed
       clock time, so no debrief clause is appended */
    const gday = DAYS[0]
    gday.ground = gday.ground || []
    gday.ground.push({ prog: 'HANGAR', str: '0500', end: '1900', who: 'torque' })
    validate()
    const g = longdays().find((w: any) => (w.who || []).includes('torque'))!
    expect(g, 'torque files a 14h ground day').toBeTruthy()
    expect(g.msg, 'the hours are stated plainly').toMatch(/05:00 → 19:00/)
    expect(g.msg, 'with no debrief clause on a non-flying end').not.toContain('debrief assumed')
  })

  it('the pad follows VCONF.debrief, not a hardcoded "2h" — a smaller pad reprints the note', () => {
    /* the note text is built from lgT(VCONF.debrief) (validate.ts), not the
       literal string "2h" — no existing test moves VCONF.debrief off its
       default, so a regression that hardcoded "2h" back in would pass every
       other test in this file and go unnoticed */
    const was = VCONF.debrief
    try {
      VCONF.debrief = 90                                  // 1h30 instead of the default 2h
      validate()
      const wolf = longdays().map((w: any) => w.msg).find((m: string) => /^Wolf /.test(m))!
      expect(wolf, 'Wolf still files a long day at the smaller pad').toBeTruthy()
      expect(wolf, 'the real landing is still named').toContain('last landing 16:05')
      expect(wolf, 'the smaller pad is named as the assumption').toContain('+ 1h30 debrief assumed')
      expect(wolf, 'the default 2h wording is gone').not.toContain('+ 2h debrief assumed')
      expect(wolf, 'the end reflects landing + the smaller pad').toMatch(/05:00 → 17:35/)
    } finally { VCONF.debrief = was }
  })
})
