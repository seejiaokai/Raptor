// @vitest-environment jsdom
/* THE NEIGHBOUR-WEEK SEED CACHE IS KEPT PER UNIT (the full check of multi-squadron batch 1, 18 Nov 26 — the blind Opus
   read's F5, red first in its own copy): weekctx keyed its cache of a never-edited week by the bare week and the year, so
   a week read while 142 was in view (the boot validates 142's week before anyone signs in) was served again once a 149
   sign-in switched the unit on the same page — 149's crew-rest edge read 142's next Monday. */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { initStore, resetSession, switchUnit } from '../state/store'
import { stashClear, stashHas } from './weekstash'
import { nextMondayDay } from './weekctx'
import { weekBundle } from './weeks-data'
import { UNIT, BOOT_UNIT } from './unitview'

beforeEach(() => { initStore(); resetSession(null) })
afterEach(() => { if (UNIT !== BOOT_UNIT) switchUnit(BOOT_UNIT) })

describe('the neighbour-week seed cache', () => {
  it("149's next Monday is 149's, not the 142 copy read before the switch", () => {
    stashClear()
    const m142 = JSON.stringify(nextMondayDay('13/07/2026'))
    switchUnit('u149')
    expect(stashHas('20/07/2026')).toBe(false)
    const own = JSON.stringify(weekBundle('u149@20/07/2026').days[0])
    expect(own === m142, "the two units' seeds differ").toBe(false)
    expect(JSON.stringify(nextMondayDay('13/07/2026'))).toBe(own)
  })
})
