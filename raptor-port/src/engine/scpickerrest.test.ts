/* BEFORE A MAN IS PUT ON AN SC SEAT, THE CREW LIST ASKS ABOUT CREW REST THE WAY THE WARNING LIST WILL
   ([SC-PICKER-INTIME-REST], Sol 6.1's read of the crew-rest fix, 6 Oct 26).

   An SC line's B box is its crew's IN-TIME (owner, 24 Aug 26): typed, it is the report the crew-rest rule measures to.
   The crew list's own SC check compared a man's clearance with the shift's START only, and the shared pre-drop
   question (validate.ts restIfPlaced) measured from a sibling event of kind `fly` — which an SC seat never has — so a
   man clear at 12:30 was offered an SC seat with a typed 05:00 in-time without a word, and the breach appeared the
   moment he was placed. With the shift's times cleared (no start to compare with at all) the same.

   What this pins:
     - a MAIN sibling seated, B 05:00, shift 13:00–19:00: the crew list says "crew rest — not clear until 12:30"
       before the drop, and the sentence the question carries is the placed warning's own, word for word;
     - the same with the shift's start and end blank;
     - forward: an SC shift ending late against his early report tomorrow is said before the drop too;
     - THE NEGATIVE CONTROL: an SC SPARE carries no crew rest, and the sibling is found by formation — a spare seat
       must not borrow the MAIN's answer, from the question itself or from the crew list;
     - the half left as it was: the shift-start check (no B typed), and an empty formation still answering nothing
       ([REST-FIRST-CREW-HINT] — no sibling to measure from; the drop still says it). */
import { beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from './data'
import { INPUTS } from './inputs'
import { validate, WARN, restIfPlaced } from './validate'
import { VCONF } from './rules'
import { makeStandalone } from './waves'
import { hm24 } from './time'
import { slotBar } from './avail'

const X = 'split'          // idle across the seed week; SC DAY and NIGHT current, so currency never speaks first
const SIB = 'bullet'       // the man already on the shift
const MON = 0, TUE = 1, WED = 2
const DSNAP = JSON.stringify(DAYS), ISNAP = JSON.stringify(INPUTS)
beforeEach(() => {
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
})

const line = (cs: string, to: string, ld: string, who = X): any =>
  ({ cs, msn: 'BFM', to, ld, aircraft: [{ p: who, w: '', area: '', rmks: '', opts: {} }] })
const add = (di: number, w: any) => { (DAYS[di] as any).waves.push(w); return (DAYS[di] as any).waves.length - 1 }
/* Monday: he lands 22:30; the debrief pad ends his day; twelve hours on is when he is clear on Tuesday */
const LAND = 22 * 60 + 30
const clear = () => LAND + VCONF.debrief + VCONF.crewRest - 1440
const lateMonday = () => add(MON, { label: 'ZM', night: false, intimes: [], traffic: [], formations: [line('ZM', '21:00', '22:30')] })
/* Tuesday: an SC wave; `fi` 0 is the AM line, 1 the PM line; rows 0–1 are MAIN, 2–3 SPARE */
const scWave = (fi: number, to: string, ld: string, br: string, sibling = true) => {
  const w: any = makeStandalone('sc'), f = w.formations[fi]
  f.to = to; f.ld = ld; f.br = br
  if (sibling) f.aircraft[0].w = SIB
  const gi = add(TUE, w)
  return { f, main: `${TUE}.${gi}.${fi}.1.p`, spare: `${TUE}.${gi}.${fi}.2.p`,
    seatMain: () => { f.aircraft[1].p = X }, seatSpare: () => { f.aircraft[2].p = X } }
}
const breach = (di: number) => {
  const g: any = WARN.byDay.find((x: any) => x.di === di)
  return ((g && g.warns) || []).find((w: any) => w.code === 'CREW_REST' && (w.who || []).includes(X))
}
const SAYS = () => `crew rest — not clear until ${hm24(clear())}`

describe('an SC MAIN seat with a typed in-time: said before the drop, in the placed warning\'s own words', () => {
  it('B 05:00, shift 13:00–19:00, a MAIN sibling seated', () => {
    lateMonday(); const sc = scWave(0, '13:00', '19:00', '05:00'); validate()
    expect(clear(), 'the fixture: clear before the shift starts, after the in-time').toBeLessThan(13 * 60)
    const q: any = restIfPlaced(X, sc.main)
    expect(q, 'the question answers for an SC seat').toBeTruthy()
    expect(q.dir).toBe('back')
    expect(q.earliest).toBe(clear())
    expect(slotBar(X, sc.main)).toBe(SAYS())
    sc.seatMain(); validate()
    const placed = breach(TUE)
    expect(placed, 'placing him raises the breach').toBeTruthy()
    expect(placed.msg).toContain(`crew rest clear at ${hm24(clear())}`)
    expect(q.msg, 'the same sentence before and after').toBe(placed.msg)
  })

  it('B 05:00 with the shift\'s start and end blank', () => {
    lateMonday(); const sc = scWave(0, '', '', '05:00'); validate()
    const q: any = restIfPlaced(X, sc.main)
    expect(q && q.dir).toBe('back')
    expect(q.earliest).toBe(clear())
    expect(slotBar(X, sc.main)).toBe(SAYS())
    sc.seatMain(); validate()
    expect(breach(TUE), 'placing him raises the breach').toBeTruthy()
    expect(q.msg).toBe(breach(TUE).msg)
    expect(q.msg).not.toMatch(/NaN|Infinity/)
  })

  it('forward: a shift ending late against his early report tomorrow', () => {
    add(WED, { label: 'ZW', night: false, intimes: [], traffic: [], formations: [line('ZW', '08:00', '09:30')] })
    const sc = scWave(1, '13:00', '23:30', ''); validate()
    expect(breach(WED), 'nothing wrong before he is placed').toBeFalsy()
    const q: any = restIfPlaced(X, sc.main)
    expect(q && q.dir, 'the question looks forward for an SC seat').toBe('fwd')
    expect(q.di).toBe(WED)
    expect(slotBar(X, sc.main)).toMatch(/^crew rest — breaks Wednesday: he must be gone by /)
    sc.seatMain(); validate()
    expect(breach(WED), 'placing him raises it on Wednesday').toBeTruthy()
    expect(q.msg).toBe(breach(WED).msg)
  })
})

describe('THE NEGATIVE CONTROL — an SC SPARE carries no crew rest and borrows none', () => {
  for (const [name, to, ld] of [['shift 13:00–19:00', '13:00', '19:00'], ['shift times blank', '', '']] as any[]) {
    it(`B 05:00, ${name}: the spare seat says nothing about crew rest, before or after`, () => {
      lateMonday(); const sc = scWave(0, to, ld, '05:00'); validate()
      expect(restIfPlaced(X, sc.spare), 'the question itself').toBeNull()
      expect(slotBar(X, sc.spare), 'the crew list').not.toMatch(/crew rest/)
      sc.seatSpare(); validate()
      expect(breach(TUE), 'and nothing after he is placed').toBeFalsy()
    })
  }
})

describe('the half left as it was', () => {
  it('no in-time typed, the shift starts after he is clear: nothing to say', () => {
    lateMonday(); const sc = scWave(0, '13:00', '19:00', ''); validate()
    expect(restIfPlaced(X, sc.main)).toBeNull()
    expect(slotBar(X, sc.main)).toBe('')
    sc.seatMain(); validate()
    expect(breach(TUE)).toBeFalsy()
  })

  it('no in-time typed, the shift starts before he is clear: the shift-start check still says it', () => {
    lateMonday(); const sc = scWave(0, '07:00', '13:00', ''); validate()
    expect(slotBar(X, sc.main)).toBe(SAYS())
    sc.seatMain(); validate()
    expect(breach(TUE)).toBeTruthy()
  })

  it('an in-time later than his clearance is no breach', () => {
    lateMonday(); const sc = scWave(0, '14:00', '19:00', '13:00'); validate()
    expect(restIfPlaced(X, sc.main)).toBeNull()
    expect(slotBar(X, sc.main)).toBe('')
  })

  it('an EMPTY SC formation still has no sibling to measure from — the drop says it instead', () => {
    lateMonday(); const sc = scWave(0, '13:00', '19:00', '05:00', false); validate()
    expect(restIfPlaced(X, sc.main), 'filed as [REST-FIRST-CREW-HINT]').toBeNull()
    sc.seatMain(); validate()
    expect(breach(TUE)).toBeTruthy()
  })

  it('the seat he already holds asks nothing', () => {
    lateMonday(); const sc = scWave(0, '13:00', '19:00', '05:00'); sc.seatMain(); validate()
    expect(restIfPlaced(X, sc.main)).toBeNull()
  })
})
