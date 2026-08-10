/* Cleared to INSTRUCT AAR from the back seat (owner, 10 Aug 26).

   "For pilot instructors — IP, IR or FI pilots — they need to be qualified to
   instruct from the backseat. If not they can't instruct from the backseat to
   someone who is not qualified. But they can still sit in the backseat for
   normal AAR if the front seat is qualified."

   Two halves, and the SUPPRESSION half is the one that matters most: an
   unqualified pilot flying AAR under a qualified instructor is how the
   qualification gets earned, and the app used to flag that legal sortie as a
   fault. So every test below that asserts a warning has DISAPPEARED is
   load-bearing, not padding.

   Counted, never merely detected — the seed week already carries warnings, so
   "the day has a warning" would pass for the wrong reason. Everything here is
   measured as a delta against the same day's baseline.

   Snapshot/restore pattern lifted from brieftime.test.ts, so mutating DAYS and
   PEOPLE here cannot leak into another test file. */
import { beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from './data'
import { PEOPLE, aarInstrOK, aarOK, aarNeed } from './people'
import { validate, WARN } from './validate'
import { isStandalone } from './waves'

const DSNAP = JSON.stringify(DAYS)
const QSNAP = JSON.stringify(Object.keys(PEOPLE).reduce((a: any, id) => (a[id] = PEOPLE[id].quals, a), {}))
beforeEach(() => {
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  const q = JSON.parse(QSNAP); Object.keys(q).forEach(id => { PEOPLE[id].quals = q[id] })
  validate()
})

/* the first ordinary (non-standalone) formation of a day, and its first jet */
const firstAc = (di: number) => {
  const w = (DAYS[di].waves || []).find((x: any) => !isStandalone(x) && (x.formations || []).length)
  return w!.formations[0].aircraft[0]
}
const codes = (di: number, code: string) => WARN.byDay[di].warns.filter((x: any) => x.code === code)
const nWarn = (di: number) => WARN.byDay[di].warns.length

/* Day 0's first jet, crewed to order. `front` is never AAR-current (its quals
   are stripped), so the remarks alone decide whether anything fires.

   It returns the day's warning count taken with the SAME crew aboard but a
   remark asking for no AAR — not the untouched seed's count. That distinction
   is the whole reliability of the counts below: moving a body into a jet
   stirs up unrelated warnings (crew rest, the combination matrix), so a
   seed-week baseline would drift by a constant and every delta would be a
   lie. Holding the crew fixed and changing only the remark leaves the AAR
   rule as the single variable. */
const setup = (front: string, back: string, rmks = '1A: AAR') => {
  const ac = firstAc(0)
  ac.p = front; ac.w = back
  PEOPLE[front].quals.daar = false; PEOPLE[front].quals.naar = false
  ac.rmks = '2A: BFM-5'; validate()
  const base = nWarn(0)
  ac.rmks = rmks; validate()
  return base
}

/* Fixtures, and the seats matter more than the callsigns: PILOT must be a
   real PILOT (seat FCP), or planting him in the front seat raises the seat
   QUAL rule and lands a stray Q chip that has nothing to do with AAR — which
   is exactly how the first draft of this file passed for the wrong reason. */
const PILOT = 'ignite'      // CAT C, seat FCP — a pilot, not an instructor
const IP = 'boosh'          // CAT IP, seat FCP — an instructor pilot
const WSO = 'wolf'          // CAT IW, seat RCP — a WSO, cannot instruct a pilot

describe('the qualification itself', () => {
  it('reads the I off the AAR column, day or night', () => {
    PEOPLE[IP].quals.daar = 'I'; PEOPLE[IP].quals.naar = true
    expect(aarInstrOK(IP, 'DAAR')).toBe(true)
    expect(aarInstrOK(IP, 'NAAR'), 'a plain tick is not an instructor mark').toBe(false)
    PEOPLE[IP].quals.naar = 'I'
    expect(aarInstrOK(IP, 'NAAR')).toBe(true)
  })

  it('is TRUTHY, so the man is current on what he can teach', () => {
    /* the whole reason the state is the string 'I' rather than a separate
       field: every existing reader asks "does he hold this?" and must keep
       getting the right answer without being taught a new shape. */
    PEOPLE[IP].quals.daar = 'I'
    expect(aarOK(IP, 'DAAR'), 'cleared to teach it implies current on it').toBe(true)
  })

  it('says no for a blank, a plain tick, an unknown man and no need', () => {
    PEOPLE[IP].quals.daar = false
    expect(aarInstrOK(IP, 'DAAR')).toBe(false)
    PEOPLE[IP].quals.daar = true
    expect(aarInstrOK(IP, 'DAAR')).toBe(false)
    expect(aarInstrOK('nobody-at-all', 'DAAR')).toBe(false)
    expect(aarInstrOK(IP, null), 'no AAR asked for is not a licence to teach').toBe(false)
  })
})

describe('the warning', () => {
  it('fires on the BACK-SEATER when the instructor cannot teach it', () => {
    PEOPLE[IP].quals.daar = true                 // current, but not cleared to teach
    const base = setup(PILOT, IP)
    const w = codes(0, 'AAR_INSTR')
    expect(w.length, 'exactly one, on this jet').toBe(1)
    expect(w[0].sev).toBe('hard')
    expect(w[0].who, 'the back-seater leads — the message opens with his name').toEqual([IP, PILOT])
    expect(String(w[0].key), 'and it anchors on his seat').toMatch(/\.w$/)
    expect(WARN.chip[0][IP], 'red Q on the instructor').toBe('Q')
    expect(WARN.sev[0][IP]).toBe('hard')
    /* the pilot being taught wears it too: the JET is illegal, not just one
       seat, and he is the man actually flying an AAR he is not current for */
    expect(WARN.chip[0][PILOT], 'and on the pilot as well').toBe('Q')
    expect(WARN.sev[0][PILOT]).toBe('hard')
    expect(codes(0, 'AAR_QUAL'), 'and NOT the front-seat code — one fault, one warning').toEqual([])
    expect(nWarn(0), 'the day gained exactly one').toBe(base + 1)
  })

  it('DISAPPEARS when he is cleared to teach it — the point of the ask', () => {
    PEOPLE[IP].quals.daar = 'I'
    const base = setup(PILOT, IP)
    expect(codes(0, 'AAR_INSTR')).toEqual([])
    expect(codes(0, 'AAR_QUAL'), 'the front seat is excused too — he is supervised').toEqual([])
    expect(nWarn(0), 'the day is back to its baseline, counted not guessed').toBe(base)
    /* not `toBeUndefined`: planting a body into a jet stirs up unrelated
       warnings of its own, and this man picks up an ordinary conflict chip.
       What matters is that it is not a Q — Q outranks everything, so if
       either AAR rule had fired it would be showing here instead. */
    expect(WARN.chip[0][PILOT], 'no Q left on the man being taught').not.toBe('Q')
    expect(WARN.chip[0][IP], 'nor on the instructor teaching him').not.toBe('Q')
  })

  it('still fires on the FRONT seat when nobody aboard could teach him', () => {
    for (const [back, why] of [['', 'an empty back seat'], [WSO, 'a WSO'], [PILOT, 'a pilot who is not an instructor']] as const) {
      DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
      const front = 'nact'
      setup(front, back)
      const w = codes(0, 'AAR_QUAL')
      expect(w.length, why).toBe(1)
      expect(w[0].who, why).toEqual([front])
      expect(String(w[0].key), why).toMatch(/\.p$/)
      expect(codes(0, 'AAR_INSTR'), why).toEqual([])
    }
  })

  it('grades day and night separately', () => {
    /* a man cleared to teach DAY refuelling is not thereby cleared to teach
       NIGHT refuelling, and the remark decides which is being asked for */
    PEOPLE[IP].quals.daar = 'I'; PEOPLE[IP].quals.naar = true
    setup(PILOT, IP, '1A: NAAR')
    expect(codes(0, 'AAR_INSTR').length, 'the day mark does not cover a night sortie').toBe(1)
    PEOPLE[IP].quals.naar = 'I'
    validate()
    expect(codes(0, 'AAR_INSTR'), 'with the night mark it clears').toEqual([])
  })

  it('says nothing at all when the front seat is already current', () => {
    /* "they can still sit in the backseat for normal AAR if the front seat is
       qualified" — the back-seater's clearance is irrelevant here, because
       nobody is being taught. */
    PEOPLE[IP].quals.daar = true
    const base = setup(PILOT, IP)
    PEOPLE[PILOT].quals.daar = true               // current: no instruction needed
    validate()
    expect(codes(0, 'AAR_INSTR')).toEqual([])
    expect(codes(0, 'AAR_QUAL')).toEqual([])
    expect(nWarn(0)).toBe(base)
  })

  it('says nothing when the remarks ask for no AAR, and NO AAR still silences it', () => {
    PEOPLE[IP].quals.daar = true                  // would fail if anything fired
    const base = setup(PILOT, IP, '2A: BFM-5')
    expect(nWarn(0), 'an ordinary remark asks for nothing').toBe(base)
    setup(PILOT, IP, '1A: NO AAR')
    expect(aarNeed('1A: NO AAR', false), 'sanity: the parser already handles it').toBe(null)
    expect(codes(0, 'AAR_INSTR'), 'NO AAR reaches the new rule as no need at all').toEqual([])
    expect(codes(0, 'AAR_QUAL')).toEqual([])
    expect(nWarn(0)).toBe(base)
  })
})

describe('what it deliberately does NOT do', () => {
  it('leaves the seed week untouched — no AAR is asked for anywhere in it', () => {
    /* this is the parity guarantee stated as a test: the seed's only AAR
       string is `1A: NO AAR`, so neither the new code nor the suppression can
       move WARN on days 0-4, which is why src/testing/refwin.ts needs no
       patch for any of this. If someone later writes an AAR remark into the
       seed, this goes red FIRST and explains why parity.test.ts followed. */
    validate()
    expect(WARN.all.filter((x: any) => x.code === 'AAR_INSTR')).toEqual([])
    expect(WARN.all.filter((x: any) => x.code === 'AAR_QUAL')).toEqual([])
  })
})
