// @vitest-environment jsdom
/* C4 (Opus F1 = Fable F3a): the day panel's "free all day" (availByWave -> rosterShown -> rosterIds) and the roster a
   published day freezes (publish.ts freezeWarn snap.ros = rosterIds()) read the squadron on TODAY, not on the day drawn.
   Correct: a day's people are the unit's on that day (rosterOf(unit, iso); D327 the crowd read by stints; D2119 a move
   counts from the next day) — the same list as the crew palette beside it.
   Copied word for word from docs/superpowers/briefs/2026-11-20-multi-sqn-b1-repro/c-c04-free-all-day-reads-today.test.ts.txt
   — only the harness changed (test-support/msq-world.ts; its world boots itself, so the proof's `boot()` goes) and the
   one call the reshape renames: `rosterIds()` takes the day it means (the reshape plan §3.3 C4, §0), Friday's. The
   last case (not in the proof) reads the frozen roster off a real publish of Friday. */
import { useMsqWorld, at, signInAs } from '../test-support/msq-world'
import { describe, expect, it } from 'vitest'
import { DAYS } from '../engine/data'
import { availByWave } from '../engine/avail'
import { rosterIds } from '../engine/faceattrs'
import { rosterOf } from '../engine/roster'
import { UNIT } from '../engine/unitview'
import { CURWEEK } from '../engine/waves'
import { dayIso } from '../engine/verid'
import { SCHED, setDayApproved, signOf } from '../engine/publish'
import '../engine/validate'   // lends publish.ts the issued-warning body, so a publish freezes its roster (freezeWarn)
import { setHome, homeOn } from '../state/units'

useMsqWorld()

describe('C4 — free all day on a day after a move', () => {
  it("142's Friday 17 Jul does not count a man who is 149's from 15 Jul", () => {
    at('2026-07-14')
    signInAs('ad', 'a')
    expect(UNIT).toBe('u142')
    const fri = DAYS[4] as any
    const free0 = availByWave(fri).anyWave as string[]
    const x = free0.find(id => id !== 'all' && id !== 'allavail')
    expect(x, 'someone free all day on Friday before the move').toBeTruthy()
    expect(setHome(x!, 'u149').ok).toBe(true)
    expect(homeOn(x!, '2026-07-17')).toBe('u149')
    expect(rosterOf('u142', '2026-07-17'), 'control: the crew list of Friday leaves him out').not.toContain(x)
    expect(availByWave(fri).anyWave, "Friday's free all day leaves him out too").not.toContain(x)
  })
  it("the roster a 142 day published now freezes (snap.ros = rosterIds()) leaves out a man who is 149's on that day", () => {
    at('2026-07-14')
    signInAs('ad', 'a')
    expect(setHome('bane', 'u149').ok).toBe(true)            // 149's from 15 Jul
    expect(rosterOf('u142', '2026-07-17')).not.toContain('bane')
    expect(rosterIds(dayIso(String(CURWEEK), 4)), "Friday's frozen roster").not.toContain('bane')
  })
  it("…and so does the roster a real publish of Friday freezes, while Tuesday's (his last 142 day) keeps him", () => {
    at('2026-07-14')
    signInAs('ad', 'a')
    expect(setHome('bane', 'u149').ok).toBe(true)            // 149's from 15 Jul
    const sign = (di: number) => { const g = signOf(di); g.cur = 'ignite'; g.sked = 'stiff'; g.plan = 'stiff'; g.appr = 'pump' }
    sign(1); setDayApproved(1, true); sign(4); setDayApproved(4, true)
    expect((SCHED.orig as any)[1]?.ros, "Tuesday's frozen roster").toContain('bane')
    expect((SCHED.orig as any)[4]?.ros, "Friday's frozen roster").not.toContain('bane')
  })
})
