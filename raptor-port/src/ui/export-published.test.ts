// @vitest-environment jsdom
/* [FLAG-EXPORT] (owner, 15 Sep 26): the PDF/CSV export must carry the PUBLISHED
   version of each day — an agency report, not a scheduler's in-progress working
   copy. publishedDays() resolves an approved day to its issued snapshot; an
   unpublished day has no signed version, so it stays its live self. */
import { beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from '../engine/data'
import { signOf, setDayApproved } from '../engine/publish'
import { initStore } from '../state/store'
import { setSession } from '../state/auth'
import { publishedDays } from './export'

beforeEach(() => { initStore(); setSession({ user: 'a', role: 'admin' } as any) })
const sign = (di: number) => { const g = signOf(di); g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump' }

describe('[FLAG-EXPORT] publishedDays', () => {
  it('resolves an approved day to its frozen issued snapshot, not the live working copy', () => {
    sign(0); setDayApproved(0, true)                     // freeze day 0
    ;(DAYS[0] as any).__wip = 'WORKING EDIT'             // diverge the working copy after publish
    const pub = publishedDays()
    expect((pub[0] as any).__wip, 'the published day is the signed snapshot').toBeUndefined()
    expect(pub[0]).not.toBe(DAYS[0])
  })

  it('leaves an unpublished day as its live self (no signed version exists)', () => {
    const pub = publishedDays()
    expect(pub[1]).toBe(DAYS[1])
  })
})
