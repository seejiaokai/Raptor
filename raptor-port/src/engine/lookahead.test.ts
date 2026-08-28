// @vitest-environment node
import { beforeEach, describe, expect, it } from 'vitest'
import { storeBackend } from './hooks'
import {
  LOOK_CFG, LOOK_MAX, LOOK_MIN, LOOK_STD,
  lookaheadIsStandard, lookaheadLabel, lookaheadLoad, lookaheadParse,
  lookaheadRange, lookaheadReset, setLookahead,
} from './lookahead'

/* A fake storage, the shape `stores-boot.test.ts` uses. */
function fakeBackend() {
  const map = new Map<string, string>()
  storeBackend.impl = {
    getItem: k => map.get(k) ?? null,
    setItem: (k, v) => { map.set(k, v) },
  }
  return map
}

beforeEach(() => { fakeBackend(); lookaheadReset() })

describe('the standard is the fortnight the page always opened on', () => {
  it('is 2 weeks, ending where it lands', () => {
    expect(LOOK_STD).toEqual({ weeks: 2, toSunday: false })
    // Wed 15 Jul 2026 + 14 days = Wed 29 Jul — byte-identical to the old
    // DEFAULT_SPAN_DAYS window, so nothing moves until an admin changes it.
    expect(lookaheadRange(new Date(2026, 6, 15))).toEqual({ from: '2026-07-15', to: '2026-07-29' })
  })
})

describe('the two shapes the owner asked for', () => {
  it('plain weeks: today → today + N weeks', () => {
    setLookahead(3, false)
    expect(lookaheadRange(new Date(2026, 6, 15))).toEqual({ from: '2026-07-15', to: '2026-08-05' })
  })

  it('weeks-to-Sunday: the window runs on to the end of that week', () => {
    setLookahead(2, true)
    // 15 Jul 2026 is a Wednesday; +14 days is Wed 29 Jul; that week's Sunday
    // is 2 Aug — so the window always ends on a week boundary.
    expect(lookaheadRange(new Date(2026, 6, 15))).toEqual({ from: '2026-07-15', to: '2026-08-02' })
  })

  it('adds nothing when the landing day is already a Sunday', () => {
    setLookahead(1, true)
    // Sun 12 Jul 2026 + 7 days = Sun 19 Jul, already the week's end
    expect(lookaheadRange(new Date(2026, 6, 12))).toEqual({ from: '2026-07-12', to: '2026-07-19' })
  })

  it('rolls over a month and a year end without inventing a date', () => {
    setLookahead(3, false)
    expect(lookaheadRange(new Date(2026, 11, 20)).to).toBe('2027-01-10')
    setLookahead(1, false)
    expect(lookaheadRange(new Date(2026, 1, 26)).to).toBe('2026-03-05')   // Feb, non-leap
  })
})

describe('the button says what it will do', () => {
  it('names the span, and the Sunday rule when it is on', () => {
    setLookahead(2, false); expect(lookaheadLabel()).toBe('Next 2 weeks')
    setLookahead(1, false); expect(lookaheadLabel()).toBe('Next 1 week')
    setLookahead(4, true); expect(lookaheadLabel()).toBe('Next 4 weeks, to Sunday')
  })
})

describe('a typed value is bounded, and refused rather than silently clamped', () => {
  it('takes a number in range and rounds it', () => {
    expect(lookaheadParse('3')).toBe(3)
    expect(lookaheadParse(' 4 ')).toBe(4)
    expect(lookaheadParse(2.4)).toBe(2)
  })

  it('refuses nonsense and out-of-range, leaving the setting untouched', () => {
    for (const bad of ['', 'abc', '0', String(LOOK_MAX + 1), '-2']) {
      expect(lookaheadParse(bad), bad).toBeNull()
    }
    expect(lookaheadParse(String(LOOK_MIN))).toBe(LOOK_MIN)
    setLookahead(5, false)
    expect(setLookahead('nope', false)).toBe(false)
    expect(LOOK_CFG.weeks).toBe(5)                       // unchanged
  })
})

describe('storage', () => {
  it('writes nothing while the squadron is on the standard', () => {
    const map = fakeBackend()
    lookaheadReset()
    expect(map.get('sqn142_lookahead')).toBe('null')
    expect(lookaheadIsStandard()).toBe(true)
  })

  it('round-trips a changed setting', () => {
    setLookahead(6, true)
    lookaheadLoad()
    expect(LOOK_CFG).toEqual({ weeks: 6, toSunday: true })
  })

  it('treats storage as untrusted — a silly value leaves the standard', () => {
    const map = fakeBackend()
    map.set('sqn142_lookahead', JSON.stringify({ w: 999, s: 'yes' }))
    lookaheadLoad()
    expect(LOOK_CFG.weeks).toBe(LOOK_STD.weeks)          // out of range → standard
    expect(LOOK_CFG.toSunday).toBe(false)                // only `true` counts
    map.set('sqn142_lookahead', '"garbage"')
    lookaheadLoad()
    expect(LOOK_CFG.weeks).toBe(LOOK_STD.weeks)
  })
})
