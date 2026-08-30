/* Ported from reference/tfin.js — groups K (time helpers) and F (overlap).
   Source-text pins are re-expressed as behaviour where possible. */
import { describe, expect, it } from 'vitest'
import { parseHM, hhmm, hm24, minus, overlap, win, lgT, fmtHM } from './time'

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

  /* minus() feeds the board's B column and the CSV's Brief field. It used to
     call fromMin, which does not wrap a negative, so a brief lead subtracted
     from an early T/O printed "-2:-20" rather than the previous evening. */
  it('minus wraps back past midnight rather than printing a negative clock', () => {
    expect(minus('01:00', 140)).toBe('22:40')
    expect(minus('02:00', 140)).toBe('23:40')
    expect(minus('00:10', 140)).toBe('21:50')
    /* the boundary: exactly 02:20 lands on midnight, and anything later is
       an ordinary same-day subtraction that must be untouched by the wrap */
    expect(minus('02:20', 140)).toBe('00:00')
    expect(minus('08:40', 140)).toBe('06:20')
    expect(minus('12:45', 140)).toBe('10:25')
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

/* fmtHM — the ONE display fold (owner, 30 Aug 26, every time reads 08:00). It
   takes a stored time in EITHER form and prints the single hh:mm, blanking a
   non-time so an empty cell stays empty. Adversarial pins because it now wraps
   every board time cell — a regression here mixes the clock formats again. */
describe('fmtHM — the one display fold', () => {
  it('folds a compact or colon time to hh:mm', () => {
    expect(fmtHM('0900')).toBe('09:00')
    expect(fmtHM('09:00')).toBe('09:00')   // idempotent — already-colon in, same out
    expect(fmtHM('900')).toBe('09:00')     // 3-digit
    expect(fmtHM('0000')).toBe('00:00')
    expect(fmtHM('0745H')).toBe('07:45')   // strips the H suffix like parseHM
  })
  it('blanks a non-time rather than printing 00:00 or NaN', () => {
    for (const junk of ['', '   ', 'borked', null, undefined, '9:5', 'FL240'])
      expect(fmtHM(junk), JSON.stringify(junk)).toBe('')
  })
  it('preserves the stored minute for every readable time (display never shifts the clock)', () => {
    for (const s of ['0900', '09:00', '2400', '0000', '0745', '1959', '900'])
      expect(parseHM(fmtHM(s)), s).toBe(parseHM(s))
  })
})
