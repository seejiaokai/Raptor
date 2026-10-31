import { describe, it, expect } from 'vitest'
import { parseAmount } from './creditamount'

/* THE CREDIT FORM'S NUMBER (owner, 6 Sep 26) — the OIL tracker's form reads its amount through this one parser. Moved
   whole from balancebar.test.tsx when the grid's balance bar went (D1491, 28 Oct 26): the bar is gone, the parser is
   the tracker's still. */
describe('parseAmount — 2 and +2 add, -2 subtracts (owner, 6 Sep 26)', () => {
  it.each([
    ['2', 1, 2], ['+2', 1, 2], ['-2', 1, -2], ['−2', 1, -2], ['2.5', 1, 2.5], ['.5', 1, 0.5],
    ['2', -1, -2], ['+2', -1, 2], ['-2', -1, -2],   // a typed sign beats the chip
    ['', 1, null], ['abc', 1, null], ['2-', 1, null], ['1,5', 1, null],
  ])('%s with sign %s → %s', (raw, sign, want) => {
    expect(parseAmount(raw as string, sign as 1 | -1)).toBe(want)
  })
})
