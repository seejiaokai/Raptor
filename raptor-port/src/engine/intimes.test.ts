/* THE IN-TIME LINE'S GRAMMAR (owner, 21 Aug 26 — "can u accept any form of
   combination of numbers and words... if it's just intime with no callsign...
   it applies to all formation in the wave... if there is a call sign written
   ... it will be specific to the formation with that callsign").

   What this pins:
     - intimeTime reads every spelling the owner listed — 0900, 09:00, 0900H,
       09:00H, 0900L, 09:00L — takes the FIRST valid clock time in the line,
       and never misreads glued tokens (FL240) or impossible clocks (2590);
     - intimeMap scopes each line by the WAVE'S OWN formation callsigns: a
       named formation gets that line, an unnamed line covers every formation
       without one of its own, and a specific line beats a wide one whatever
       the typing order;
     - waveInTime reads the same grammar (one detector, two readers — a line
       must never set a report time the wave windows cannot see);
     - the SEED's own lines resolve exactly as the reference's stricter
       "<CS> IN TIME" grammar resolves them, which is what keeps parity
       untouched where data exercises it. */
import { describe, expect, it } from 'vitest'
import { intimeTime, intimeFold, intimeMap, waveInTime } from './events'
import { DAYS } from './data'

const wave = (intimes: string[], css: string[] = ['VL', 'RU']) => ({
  intimes,
  formations: css.map(cs => ({ cs, to: '12:00', ld: '13:00', aircraft: [] })),
})

describe('intimeTime — the spellings', () => {
  it('reads every form the owner listed', () => {
    for (const s of ['0900', '09:00', '0900H', '09:00H', '0900L', '09:00L', '0900h', '09:00l'])
      expect(intimeTime(`${s}: IN TIME + WX/NOTAMS`), s).toBe(9 * 60)
  })
  it('reads a 3-digit compact time and a time mid-line', () => {
    expect(intimeTime('900 IN TIME')).toBe(9 * 60)
    expect(intimeTime('SHOW AT 1745H FOR WX')).toBe(17 * 60 + 45)
  })
  it('the FIRST valid time in the line wins', () => {
    expect(intimeTime('0900H: RU IN TIME, BRIEF 1000H')).toBe(9 * 60)
  })
  it('never misreads glued tokens or impossible clocks', () => {
    expect(intimeTime('FL240 D15R IN TIME')).toBe(null)
    expect(intimeTime('2590: IN TIME')).toBe(null)
    expect(intimeTime('12:75 IN TIME')).toBe(null)
    expect(intimeTime('IN TIME + WX/NOTAMS')).toBe(null)
    /* an impossible clock is SKIPPED, not fatal — the next valid one reads */
    expect(intimeTime('2590 THEN 0900 IN TIME')).toBe(9 * 60)
  })
})

describe('intimeMap — callsign scoping', () => {
  it('a line naming a formation is that formation\'s alone', () => {
    const m = intimeMap(wave(['0900H: RU IN TIME']))
    expect(m.RU).toBe(9 * 60)
    expect(m.VL).toBeUndefined()
  })
  it('the callsign is detected anywhere in the line, not only as "<CS> IN TIME"', () => {
    expect(intimeMap(wave(['RU 0900'])).RU).toBe(9 * 60)
    expect(intimeMap(wave(['0900 RU show'])).RU).toBe(9 * 60)
    expect(intimeMap(wave(['ru in at 09:00'])).RU).toBe(9 * 60)
  })
  it('a line with NO callsign covers every formation in the wave', () => {
    const m = intimeMap(wave(['0900H: IN TIME + WX/NOTAMS']))
    expect(m.VL).toBe(9 * 60)
    expect(m.RU).toBe(9 * 60)
  })
  it('a specific line beats the wide one, whatever the order', () => {
    for (const lines of [['0900: IN TIME', '1000H: RU IN TIME'], ['1000H: RU IN TIME', '0900: IN TIME']]) {
      const m = intimeMap(wave(lines))
      expect(m.RU, lines.join(' / ')).toBe(10 * 60)
      expect(m.VL, lines.join(' / ')).toBe(9 * 60)
    }
  })
  it('several wide lines: the earliest is the show', () => {
    const m = intimeMap(wave(['1000 IN TIME', '0930 SPARES IN TIME']))
    expect(m.VL).toBe(9 * 60 + 30)
  })
  it('a callsign that is not glued into a longer word', () => {
    /* "TRUE" contains RU but is not the RU line */
    const m = intimeMap(wave(['0900H: TRUE AIRSPEED BRIEF']))
    expect(m.RU).toBe(9 * 60)   // no formation named → wide
    expect(m.VL).toBe(9 * 60)
  })
  it('the seed\'s own lines resolve exactly as the old grammar resolved them', () => {
    DAYS.forEach((d: any) => (d.waves || []).forEach((w: any) => {
      const m = intimeMap(w)
      ;(w.intimes || []).forEach((line: string) => {
        const old = line.match(/\b([A-Z]{2})\s+IN\s+TIME/i)
        if (old) {
          const t = line.match(/(\d{3,4})\s*H/)
          if (t) expect(m[old[1].toUpperCase()], line).toBe(Math.floor(+t[1] / 100) * 60 + (+t[1] % 100))
        }
      })
    }))
  })
})

describe('waveInTime — same grammar', () => {
  it('reads the new spellings for the wave windows too', () => {
    expect(waveInTime(wave(['09:00L stand-to', '1000H: RU IN TIME']))).toBe(9 * 60)
  })
  it('still falls back to the earliest take-off when no line carries a time', () => {
    const w: any = wave(['IN TIME TBD'])
    w.formations[0].to = '11:30'
    expect(waveInTime(w)).toBe(11 * 60 + 30)
  })
})

/* THE COMMIT-TIME FOLD (owner, 30 Aug 26 — every time reads 08:00, and a
   hand-typed line gains its colon on its own). One grammar with intimeTime:
   the fold may only reformat a token the reader accepts, never change what a
   line means. */
describe('intimeFold — the colon appears, the words stay', () => {
  it('folds every spelling the reader accepts, keeping the suffix', () => {
    expect(intimeFold('0900: IN TIME + WX/NOTAMS')).toBe('09:00: IN TIME + WX/NOTAMS')
    expect(intimeFold('0900H: IN TIME')).toBe('09:00H: IN TIME')
    expect(intimeFold('0900l stand-to')).toBe('09:00l stand-to')
    expect(intimeFold('900 show')).toBe('09:00 show')
    expect(intimeFold('9:00 show')).toBe('09:00 show')
    expect(intimeFold('RU 0845, VL 0915H')).toBe('RU 08:45, VL 09:15H')
  })
  it('a token the reader skips is left exactly as typed', () => {
    expect(intimeFold('FL240 block')).toBe('FL240 block')          // glued to letters
    expect(intimeFold('2590: bad clock')).toBe('2590: bad clock')  // out of range
    expect(intimeFold('IN TIME TBD')).toBe('IN TIME TBD')
    expect(intimeFold('')).toBe('')
    expect(intimeFold(null)).toBe('')
  })
  it('what the reader sees never moves across the fold', () => {
    for (const s of ['0900H: IN TIME', 'RU 0845, VL 0915H', '900 show', 'FL240 at 1030'])
      expect(intimeTime(intimeFold(s)), s).toBe(intimeTime(s))
  })
})
