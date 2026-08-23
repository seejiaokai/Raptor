/* @vitest-environment jsdom */
/* THE BOARD DAY CHIPS STRIP ANY MONTH, NOT JUST JULY (owner-scale bug, 24 Aug
   26). The scheduler board is continuous across weeks now, so its seven day
   chips routinely land in August, September and beyond. The strip used to cut
   the literal 'Jul ' off each date, so a non-July week showed the whole "Mon
   Aug 17" instead of the intended "Mon 17". This pins the fix to a real
   non-July week. */
import { beforeEach, describe, expect, it } from 'vitest'
import { initStore, loadWeek } from '../state/store'
import { DAYS } from '../engine/data'
import { dayTabsHTML } from './board'

beforeEach(() => { initStore() })

describe('dayTabsHTML day chips', () => {
  it('shows only the day number on a July week', () => {
    loadWeek('13/07/2026')
    const html = dayTabsHTML(0)
    expect(DAYS[0].dt).toBe('Jul 13')
    expect(html).toContain('>Mon 13<')     // chip reads "Mon 13", not "Mon Jul 13"
    expect(html).not.toContain('Jul')
  })

  it('strips the month on a non-July week too (Aug)', () => {
    loadWeek('17/08/2026')                  // a Monday five weeks on
    const html = dayTabsHTML(0)
    expect(DAYS[0].dt).toBe('Aug 17')
    // the whole strip must carry no month name at all — the old 'Jul '-only cut
    // left August dates showing "Mon Aug 17"
    expect(html).not.toContain('Aug')
    expect(html).toContain('>Mon 17<')
    expect(html).toContain('>Sun 23<')      // the far end of the same week
  })
})
