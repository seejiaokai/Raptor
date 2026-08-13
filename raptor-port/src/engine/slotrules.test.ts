/* Ported from reference/tfin.js — group U, "the palette offers only crew who
   may be planned there". The palette itself is DOM (phase 4); the rule it
   reads — slotRules/slotBar — is the engine's, and is pinned here. */
import { beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from './data'
import { INPUTS } from './inputs'
import { PEOPLE, scQualOK, isInstrPilot } from './people'
import { makeStandalone } from './waves'
import { slotRules, slotBar } from './avail'
import { txtSet } from './slots'
import { validate } from './validate'
import { SCHED } from './publish'

const DSNAP = JSON.stringify(DAYS)
const ISNAP = JSON.stringify(INPUTS)
beforeEach(() => {
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((i: any) => INPUTS.push(i))
  SCHED.pending = {}; SCHED.changes = {}; SCHED.als = []
  validate()
})

const ids = Object.keys(PEOPLE).filter(id => !PEOPLE[id].special)

describe('who may be planned into a slot (tfin U)', () => {
  it('a front seat leaves no WSO selectable, and the reason is the real one', () => {
    const key = '0.0.0.0.p'
    const wsos = ids.filter(id => PEOPLE[id].seat === 'RCP')
    expect(wsos.every(id => /WSO/.test(slotBar(id, key)))).toBe(true)
    const fcps = ids.filter(id => PEOPLE[id].seat === 'FCP')
    expect(fcps.some(id => slotBar(id, key) === '')).toBe(true)
  })

  it('a rear seat leaves only WSOs and instructor pilots (IP / IR / FI)', () => {
    const key = '0.0.0.0.w'
    const plain = ids.filter(id => PEOPLE[id].seat === 'FCP' && !isInstrPilot(PEOPLE[id].q))
    expect(plain.length).toBeGreaterThan(0)
    expect(plain.every(id => /pilot, not an instructor/.test(slotBar(id, key)))).toBe(true)
    const wso = ids.find(id => PEOPLE[id].seat === 'RCP')!
    expect(slotBar(wso, key)).toBe('')
    /* the instructor CATs themselves clear the SEAT rule: neither an IP nor
       the IR examiner is turned away as "not an instructor" (other bars —
       rest, currency — are their own rules and may still apply) */
    expect(/pilot, not an instructor/.test(slotBar('stiff', key))).toBe(false)   // IP
    expect(/pilot, not an instructor/.test(slotBar('dice', key))).toBe(false)    // IR
  })

  it('an SC day shift demands SC DAY, and pushing the crew change past 19:00 demands SC NIGHT', () => {
    DAYS[4].waves.push(makeStandalone('sc'))       // Friday carries no flying
    validate()
    const key = '4.0.0.0.p'
    expect(slotRules(key).sc).toBe('day')
    /* a candidate who is day-only, in the right seat, and clear of Thursday's
       crew rest by the 07:00 shift start — the rest bar is its own rule */
    const dayOnly = ids.find(id => scQualOK(id, 'day') && !scQualOK(id, 'night')
      && PEOPLE[id].seat === 'FCP' && slotBar(id, key) === '')!
    expect(dayOnly, 'no rest-clear day-only pilot in the seed').toBeTruthy()
    txtSet('ff:4.0.0.ld', '21:00'); validate()
    expect(slotRules(key).sc).toBe('night')
    expect(slotBar(dayOnly, key)).toBe('not SC NIGHT current')
  })

  it('a spare slot is marked as one, so the picker can tell', () => {
    DAYS[4].waves.push(makeStandalone('sc'))
    expect(slotRules('4.0.0.2.p').scSpare).toBe(true)   // the first SPARE line
    expect(slotRules('4.0.0.0.p').scSpare).toBe(false)
  })

  it('a spare post forgives LL and OIL but not OL or a downchit', () => {
    DAYS[1].waves.push(makeStandalone('sc'))       // day 1 = Jul 14: nasty LL, shrek OIL
    const gi = DAYS[1].waves.length - 1
    validate()
    /* nasty and shrek are WSOs, so the rear SPARE seat; pike is a pilot */
    expect(slotBar('nasty', `1.${gi}.0.2.w`)).toBe('')  // LL — may still stand SC SPARE
    expect(slotBar('shrek', `1.${gi}.0.2.w`)).toBe('')  // OIL — same
    INPUTS.push({ person: 'pike', date: 'Jul 14', allday: true, type: 'OL', remarks: '', mod: '' })
    expect(slotBar('pike', `1.${gi}.0.2.p`)).toContain('overseas leave')
    expect(slotBar('nasty', `1.${gi}.0.0.w`)).toContain('local leave')   // MAIN is not forgiven
  })

  it('the bar checks leave and downchit for that day', () => {
    /* sufa is ATT C Jul 13–17; a duty key on Monday must report it, in the
       words the type legend uses — ATT C is a downchit that cannot report to
       work at all, so a duty post is barred as surely as a jet is */
    expect(slotBar('sufa', 'd:0.0.0')).toContain('downchit')
    expect(slotBar('sufa', 'd:0.0.0')).toContain('ATT C')
    expect(slotBar('sufa', 'd:0.0.0')).toContain('Medically down till 17 Jul')
  })

  it('an ordinary flying seat carries no shift start, so no rest bar', () => {
    const r = slotRules('0.0.0.0.p')
    expect(r.scStart == null).toBe(true)
    expect(/crew rest/.test(slotBar(ids[0]!, '0.0.0.0.p') || '')).toBe(false)
  })

  it('slotRules reads a sim seat', () => {
    expect(slotRules('s:0.oft.0.p').seat).toBe('p')
    expect(slotRules('s:0.oft.0.w').seat).toBe('w')
    expect(slotRules('s:0.amt.1.pax.3').seat).toBe(null)   // a body in the room, not a seat
  })

  it('a duty slot has no seat rule but still darkens leave', () => {
    const key = 'd:0.0.0'
    expect(slotRules(key).seat).toBe(null)
    const clean = ids.find(id => slotBar(id, key) === '')
    expect(clean).toBeTruthy()
  })
})

/* ---------------------------------------------------------------------------
   THE SLOT'S OWN HOURS, and the half-day absences they make possible
   (owner, 10 Aug 26). Before this, only an SC shift carried a window, so a
   personal input outside SC could only ever be judged against the WHOLE DAY —
   which is why an AM leave used to strike a man out of an evening sortie.
   --------------------------------------------------------------------------- */
describe('slotStart / slotEnd, and half-day absences', () => {
  /* Monday's seed, read off data.ts: VL 12:40–14:05, night VL 19:45–21:10,
     SDO 0700–1300, CAF engagement 0845–1630, SODB 0745–0815, OFT EP-4
     0800–0930. A sortie is PADDED to the step and the dekit, because that is
     the window the validator judges an input against. */
  it('every kind of key reports its own window', () => {
    expect([slotRules('0.0.0.0.p').slotStart, slotRules('0.0.0.0.p').slotEnd]).toEqual([700, 875])
    expect([slotRules('d:0.0.0').slotStart, slotRules('d:0.0.0').slotEnd]).toEqual([420, 780])
    expect([slotRules('g:0.0').slotStart, slotRules('g:0.0').slotEnd]).toEqual([525, 990])
    expect([slotRules('a:0.0').slotStart, slotRules('a:0.0').slotEnd]).toEqual([465, 495])
    expect([slotRules('s:0.oft.0').slotStart, slotRules('s:0.oft.0').slotEnd]).toEqual([480, 570])
  })

  /* an append target and an overflow body hang off a row, so they inherit its
     hours — otherwise dropping a third man on a duty row would judge him
     against the whole day while the row itself was judged against its shift */
  it('.+ and .xN inherit the row they hang off', () => {
    const bare = slotRules('d:0.0.0')
    for (const k of ['d:0.0.0.+', 'd:0.0.0.x1'])
      expect([slotRules(k).slotStart, slotRules(k).slotEnd], k).toEqual([bare.slotStart, bare.slotEnd])
  })

  /* A BB shift is written ['SHIFT','',''] — no times at all. That must read as
     UNKNOWN, never as "clashes with nothing", or a real absence would be
     silently cleared. The consumer falls back to the whole-day answer. */
  it('a shift with no times reports no window, and still bars an absence', () => {
    DAYS[1].waves.push(makeStandalone('bb'))
    const gi = DAYS[1].waves.length - 1
    validate()
    const r = slotRules(`1.${gi}.0.0.p`)
    expect(r.slotStart == null && r.slotEnd == null).toBe(true)
    /* pike is a pilot; give him a MORNING absence on Jul 14 and a slot with no
       window of its own must still refuse him — unknown fails closed */
    INPUTS.push({ person: 'pike', date: 'Jul 14', allday: false, s: 240, e: 720, half: 'am', type: 'LL', remarks: '', mod: '' })
    validate()
    expect(slotBar('pike', `1.${gi}.0.0.p`)).toContain('local leave')
  })

  it('a morning absence frees the evening and only the evening', () => {
    /* nasty is a WSO. Monday wave 0 VL steps 11:40; wave 1 VL steps 18:45. */
    INPUTS.push({ person: 'nasty', date: 'Jul 13', allday: false, s: 240, e: 720, half: 'am', type: 'LL', remarks: '', mod: '' })
    validate()
    expect(slotBar('nasty', '0.0.0.0.w')).toContain('local leave')   // 11:40 step — inside the AM
    expect(slotBar('nasty', '0.0.0.0.w')).toContain('(AM)')          // and it says which half
    expect(slotBar('nasty', '0.1.0.0.w')).toBe('')                   // the night wave is clear
    expect(slotBar('nasty', 'd:0.1.0')).toBe('')                     // 2nd-wave duty 1300–2130
    expect(slotBar('nasty', 'd:0.0.0')).toContain('local leave')     // 1st-wave duty 0700–1300
  })

  it('an afternoon absence frees the morning, the mirror of it', () => {
    INPUTS.push({ person: 'nasty', date: 'Jul 13', allday: false, s: 721, e: 1439, half: 'pm', type: 'LL', remarks: '', mod: '' })
    validate()
    expect(slotBar('nasty', '0.1.0.0.w')).toContain('local leave')   // night wave — inside the PM
    expect(slotBar('nasty', 's:0.oft.0.w')).toBe('')                 // OFT 0800–0930, wholly AM
    /* and the boundary is a real one, not a rounding: the 1st-wave duty post
       runs 0700–1300, so its last hour IS in the afternoon and it stays barred */
    expect(slotBar('nasty', 'd:0.0.0')).toContain('local leave')
  })

  /* ORDER IS LOAD-BEARING: an all-day absence, and one whose record is too
     thin to place, must short-circuit BEFORE any overlap test. Reverse the two
     and every all-day absence starts being judged against a window it does not
     have — which is how a whole week off would quietly stop barring anything. */
  it('an all-day absence bars every slot, whatever the slot hours are', () => {
    INPUTS.push({ person: 'nasty', date: 'Jul 13', allday: true, type: 'LL', remarks: '', mod: '' })
    validate()
    for (const k of ['0.0.0.0.w', '0.1.0.0.w', 'd:0.0.0', 'd:0.1.0', 'g:0.0'])
      expect(slotBar('nasty', k), k).toContain('local leave')
  })

  it('a record with no usable hours bars every slot too', () => {
    INPUTS.push({ person: 'nasty', date: 'Jul 13', type: 'OL', remarks: '', mod: '' })   // no allday, no s/e
    validate()
    for (const k of ['0.0.0.0.w', '0.1.0.0.w', 'd:0.1.0'])
      expect(slotBar('nasty', k), k).toContain('overseas leave')
  })

  /* ATT B is grounded, not absent — the flying seat closes, the desk does not */
  it('ATT B closes the jet and leaves the duty post, the sim and the ground row open', () => {
    INPUTS.push({ person: 'nasty', date: 'Jul 13', allday: true, type: 'ATT B', remarks: '', mod: '' })
    validate()
    expect(slotBar('nasty', '0.0.0.0.w')).toContain('downchit')
    /* asserted as "not the ATT B reason" rather than "no reason at all": the
       picker knows who is busy AT THIS HOUR since 11 Aug 26, and nasty is in a
       sim box that overlaps the duty post. That is a true and unrelated reason;
       what this test is about is that ATT B does not close these three. */
    for (const k of ['d:0.0.0', 's:0.oft.0.w', 'g:0.0'])
      expect(slotBar('nasty', k), k).not.toContain('downchit')
    /* ATT C is the control: it closes the desk as well, or the two codes would
       be indistinguishable */
    INPUTS.pop()
    INPUTS.push({ person: 'nasty', date: 'Jul 13', allday: true, type: 'ATT C', remarks: '', mod: '' })
    validate()
    expect(slotBar('nasty', 'd:0.0.0')).toContain('downchit')
  })

  /* the spare rule, through the picker rather than the warning list */
  it('a spare post is open to local absences and shut to overseas and medical', () => {
    DAYS[1].waves.push(makeStandalone('sc'))
    const gi = DAYS[1].waves.length - 1
    validate()
    const spare = `1.${gi}.0.2.w`
    for (const t of ['LL', 'OIL', 'OFF', 'CCL', 'Training']) {
      INPUTS.push({ person: 'nasty', date: 'Jul 14', allday: true, type: t, remarks: '', mod: '' })
      validate()
      expect(slotBar('nasty', spare), t).toBe('')
      INPUTS.pop()
    }
    for (const t of ['OL', 'OD', 'HL', 'OML', 'ATT B', 'ATT C']) {
      INPUTS.push({ person: 'nasty', date: 'Jul 14', allday: true, type: t, remarks: '', mod: '' })
      validate()
      expect(slotBar('nasty', spare), t).not.toBe('')
      INPUTS.pop()
    }
  })
})

/* "IS HE BUSY AT THIS HOUR?" (owner, 11 Aug 26 — found from the other end: the
   same man planned twice at once raised nothing). The picker knew only "tasked
   somewhere today", a whole-day dimming captioned "you can still plan him", so
   it offered a man mid-sortie for an overlapping sim seat with no reason at all
   and the clash landed the instant he was planted. */
describe('the picker knows who is already committed at this hour', () => {
  it('names the clashing commitment for an overlapping sim seat', () => {
    /* Monday OFT EP-6 runs 1500–1630; 'stuff' is OPS-O on duty 1400–2130 */
    const ri = DAYS[0].sims.oft.findIndex((r: any) => /EP-6\b/.test(r.label || ''))
    expect(ri).toBeGreaterThanOrEqual(0)
    const why = slotBar('stuff', `s:0.oft.${ri}.w`)
    expect(why, why).toContain('already on')
    expect(why).toContain('OPS-O duty')
  })

  it('says nothing about a man whose commitments do not overlap the slot', () => {
    /* 'split' is idle all week, so nothing can overlap */
    const ri = DAYS[0].sims.oft.findIndex((r: any) => /EP-6\b/.test(r.label || ''))
    expect(slotBar('split', `s:0.oft.${ri}.w`)).toBe('')
  })

  it('a SWAP is silent — the seat being planned into is not counted', () => {
    /* he is already in this very seat, so re-planting him there is not a clash */
    const f = DAYS[0].waves[0].formations[0]
    f.aircraft[0].p = 'split'
    validate()
    expect(slotBar('split', '0.0.0.0.p')).toBe('')
  })

  it('but the OTHER seat of the same jet is a clash — one man, two seats', () => {
    const f = DAYS[0].waves[0].formations[0]
    f.aircraft[0].p = 'split'
    validate()
    const why = slotBar('split', '0.0.0.1.p')
    expect(why, why).toContain('already on')
  })

  it('an SC SPARE is exempt — standing by is not being tasked', () => {
    const w = makeStandalone('sc')
    DAYS[0].waves.push(w)
    const wi = DAYS[0].waves.length - 1
    const f = DAYS[0].waves[wi].formations[0]
    /* the spare line; a spare is deliberately free for anything else */
    const spare = f.aircraft.length - 1
    DAYS[0].dutywaves[0].rows.push({ role: 'SDO', id: 'split', str: '0000', end: '2359' })
    validate()
    expect(slotBar('split', `${0}.${wi}.0.${spare}.p`)).not.toContain('already on')
  })
})
