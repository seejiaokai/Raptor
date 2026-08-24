/* SC's B box is the crew's IN-TIME (owner, 24 Aug 26 — "only if the brief time
   is filled in then u will use that as the in time for the warnings and
   advisories. But we will hardly have a brief time"). A standalone briefs
   nothing, so the value typed into an SC line's B is not a brief at all — it is
   the report time, usually earlier than the shift start, and it moves the crew-
   rest anchor when (and only when) it is filled in.

   What this pins, off the seed's own late duty (stuff stands OPS-O until 21:30
   on the Monday, so crew rest clears at 09:30):
     - a blank B leaves SC anchored on its 07:00 shift start, exactly as before;
     - a typed early B (05:00) pulls the report — and the breach — onto it;
     - a typed B LATER than the shift start is ignored, because the watch still
       begins at 07:00 whatever the crew wrote.
   The engine reads f.br only for w.kind==='sc'; AVALON/BB never reach the fly
   collector (saExempt), and an ordinary flying line's B is a brief as always —
   both covered by brieftime.test.ts, so this file stays purely about SC. */
import { afterEach, describe, expect, it } from 'vitest'
import { DAYS } from './data'
import { validate, WARN } from './validate'
import { makeStandalone } from './waves'

const TUE = 1

/* append an SC wave to the Tuesday and seat stuff on its AM MAIN line. stuff is
   free of Tuesday's flying seed, so nothing else of his competes for the anchor;
   his 12:00 OPS-O duty that day is later than any in-time under test. */
const addSC = (br?: string) => {
  const w: any = makeStandalone('sc')
  if (br != null) w.formations[0].br = br
  w.formations[0].aircraft[0].p = 'stuff'
  ;(DAYS[TUE] as any).waves.push(w)
  validate()
}

afterEach(() => { (DAYS[TUE] as any).waves.pop(); validate() })

const scBreach = () => {
  const g: any = WARN.byDay.find((x: any) => x.di === TUE)
  return ((g && g.warns) || []).find((w: any) =>
    w.code === 'CREW_REST' && (w.who || []).includes('stuff'))
}

describe('an SC line reads its B box as the in-time', () => {
  it('a blank B keeps the anchor on the 07:00 shift start (9h30 rest, unchanged)', () => {
    addSC()
    const cr = scBreach()
    expect(cr, 'the shift start alone still breaches after a 21:30 duty').toBeTruthy()
    expect(cr.sev).toBe('hard')
    expect(cr.msg).toContain('SC AM starts 07:00')
    expect(cr.msg).toContain('9h30 rest')
  })

  it('a typed early B (05:00) pulls the report onto it (7h30 rest)', () => {
    addSC('05:00')
    const cr = scBreach()
    expect(cr, 'the earlier in-time deepens the breach').toBeTruthy()
    expect(cr.sev).toBe('hard')
    expect(cr.msg).toContain('SC AM starts 05:00')
    expect(cr.msg).toContain('7h30 rest')
  })

  it('a typed B later than the shift start is ignored — the watch still begins 07:00', () => {
    addSC('08:00')
    const cr = scBreach()
    expect(cr, 'a later B cannot push the report past the shift start').toBeTruthy()
    expect(cr.msg).toContain('SC AM starts 07:00')
    expect(cr.msg).not.toContain('starts 08:00')
  })
})
