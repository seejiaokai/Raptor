/* Ported from reference/tfin.js — groups K (time helpers) and F (overlap).
   Source-text pins are re-expressed as behaviour where possible. */
import { describe, expect, it } from 'vitest'
import { parseHM, hhmm, hm24, overlap, win, lgT } from './time'

describe('time helpers (tfin K)', () => {
  it('time helpers round-trip', () => {
    expect(parseHM('12:40')).toBe(760)
    expect(parseHM('0745')).toBe(465)
    expect(hhmm(760)).toBe('12:40')
  })

  it('parseHM rejects junk and strips the H suffix', () => {
    expect(parseHM('')).toBe(null)
    expect(parseHM(null)).toBe(null)
    expect(parseHM('banana')).toBe(null)
    expect(parseHM('0700H')).toBe(420)
  })

  it('hm24 wraps past midnight in both directions', () => {
    expect(hm24(1510)).toBe('01:10')
    expect(hm24(-100)).toBe('22:20')
  })

  /* tfin pins `const overlap=(a1,a2,b1,b2)=>a1<b2&&b1<a2;` in the source —
     asserted here as behaviour: half-open, so abutting windows do not overlap */
  it('abutting windows do NOT overlap', () => {
    expect(overlap(510, 540, 540, 600)).toBe(false) // stand-down ending 09:00 vs 09:00 brief
    expect(overlap(510, 541, 540, 600)).toBe(true)
    expect(overlap(0, 60, 60, 120)).toBe(false)
  })

  it('a window that crosses midnight is rolled forward (win)', () => {
    expect(win(1380, 60)).toEqual([1380, 1500]) // 23:00–01:00
    expect(win(600, 720)).toEqual([600, 720])
    expect(win(null, 600)).toBe(null)
  })

  it('an open-ended row still occupies time (win + openEnd)', () => {
    expect(win(600, null)).toEqual([600, 660])   // VCONF.openEnd = 60
    expect(win(600, null, 90)).toEqual([600, 690])
  })

  it('lgT prints durations the way the Logic tab does', () => {
    expect(lgT(720)).toBe('12h')
    expect(lgT(140)).toBe('2h20')
    expect(lgT(30)).toBe('30 min')
  })
})
