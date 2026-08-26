/* THE MAIN/SPARE TOGGLE × THE RULES ENGINE (owner, 24 Aug 26 — asked to verify
   after the badge landed in #317: "sc rules concerning spare are like no
   overseas etc and the rest are not checked like conflicts etc even if on LL u
   still can be spare etc. while main is being checked, including crew rest").

   sarole.test.tsx pins the badge and the scSpare flag flip; THIS file pins what
   the flip actually changes downstream — which warnings fire on each side of
   the toggle. The contract, per row on an SC line:

     SPARE — exempt from every cross-check (double-book, input clash, crew
             rest), because he is standing by, not tasked. Two things still
             reach him: canSpare (on the island and fit — overseas and the
             medical group bar him, local leave and local commitments do not)
             and SC currency (his own qualification, not a clash).
     MAIN  — checked like any tasking: double-book against sorties/sims/duties,
             leave and medical close his day, crew rest runs off the shift
             start — or off the typed B, which on SC is the crew's IN-TIME
             (scintime.test.ts) and must swing with the toggle: inert while the
             row is SPARE, live the moment it flips MAIN.

   Everything runs on the seed Tuesday: nasty's LL and the VL BFM morning wave
   are the seed's own, so the cases read the way the owner stated them. */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from './data'
import { INPUTS } from './inputs'
import { PEOPLE } from './people'
import { validate } from './validate'
import { makeStandalone } from './waves'

const TUE = 1
const DSNAP = JSON.stringify(DAYS)
const ISNAP = JSON.stringify(INPUTS)
let sc: any

beforeEach(() => {
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((i: any) => INPUTS.push(i))
  sc = makeStandalone('sc')
  ;(DAYS[TUE] as any).waves.push(sc)
})
afterEach(() => { validate() })

/* rows 0–1 are MAIN, 2–3 SPARE (saCrewRow); the toggle flips spare+role
   together, exactly what the data-sarole handler does */
const AM = () => sc.formations[0]
const seat = (ai: number, key: 'p' | 'w', id: string) => { AM().aircraft[ai][key] = id }
const flipMain = (ai: number) => { AM().aircraft[ai].spare = false; AM().aircraft[ai].role = 'MAIN' }
const tueWarns = (id: string) =>
  validate().all.filter((x: any) => x.di === TUE && (x.who || []).includes(id))
const hardOrAdv = (id: string) => tueWarns(id).filter((x: any) => x.sev !== 'note')

describe('SC SPARE — stood by, not cross-checked', () => {
  it('local leave (LL) leaves a SPARE clean; the same man seated MAIN flags hard', () => {
    seat(2, 'w', 'nasty')                       // seed: nasty is on LL this Tuesday
    expect(hardOrAdv('nasty'), 'LL can still stand by').toEqual([])
    seat(2, 'w', ''); seat(0, 'w', 'nasty')
    const w = tueWarns('nasty').find((x: any) => x.code === 'LEAVE_FLY')
    expect(w, 'MAIN on leave is a hard flag').toBeTruthy()
    expect(w.sev).toBe('hard')
    /* since the per-type grading (owner, 26 Aug 26) a shift has ONE voice —
       the graded events loop — so this reads "but tasked", no longer the
       sortie loop's "but planned to fly" beside it */
    expect(w.msg).toContain('On leave but tasked — SC AM')
    expect(tueWarns('nasty').filter((x: any) => x.code === 'LEAVE_FLY').length, 'and only one voice').toBe(1)
  })

  it('overseas leave bars even the SPARE — he cannot be reached', () => {
    INPUTS.push({ person: 'split', date: 'Jul 14', allday: true, type: 'OL', remarks: '', mod: '' })
    seat(2, 'p', 'split')
    const w = tueWarns('split').find((x: any) => x.code === 'LEAVE_FLY')
    expect(w, 'OL vs SC SPARE must flag').toBeTruthy()
    expect(w.sev).toBe('hard')
    expect(w.msg).toContain('standing SC SPARE — overseas')
  })

  it('medically down (ATT C) bars the SPARE too', () => {
    INPUTS.push({ person: 'split', date: 'Jul 14', allday: true, type: 'ATT C', remarks: '', mod: '' })
    seat(2, 'p', 'split')
    const w = tueWarns('split').find((x: any) => x.code === 'DNIF_FLY')
    expect(w, 'a downchit cannot stand by').toBeTruthy()
    expect(w.sev).toBe('hard')
    expect(w.msg).toContain('medically down')
  })

  it('a local commitment overlapping the shift leaves the SPARE clean', () => {
    INPUTS.push({ person: 'split', date: 'Jul 14', allday: false, s: 480, e: 540, type: 'Meeting', remarks: '', mod: '' })
    seat(2, 'p', 'split')
    expect(hardOrAdv('split'), 'a meeting does not bar standing by').toEqual([])
  })

  it('a SPARE double-planned into a sortie raises nothing; flipped MAIN it is a hard clash', () => {
    seat(2, 'w', 'glass')                       // glass flies VL BFM 08:40–10:05, inside SC AM
    expect(tueWarns('glass').filter((x: any) =>
      x.code === 'DOUBLE_BOOK' || x.code === 'SHIFT_SOFT'),
      'the SC copy of a spare is invisible to the clash engine').toEqual([])
    flipMain(2)
    const w = tueWarns('glass').find((x: any) => x.code === 'DOUBLE_BOOK')
    expect(w, 'MAIN vs his own sortie is a hard double-book').toBeTruthy()
    expect(w.sev).toBe('hard')
    expect(w.msg).toContain('SC AM')
    expect(w.msg).toContain('VL BFM')
  })

  it('SC currency is checked for the SPARE — his own qualification, not a clash', () => {
    const q = PEOPLE.split.quals.scDay
    try {
      PEOPLE.split.quals.scDay = false
      seat(2, 'p', 'split')
      const w = tueWarns('split').find((x: any) => x.code === 'SC_QUAL')
      expect(w, 'the spare exemption does not cover currency').toBeTruthy()
      expect(w.sev).toBe('hard')
      expect(w.msg).toContain('SC DAY currency needed')
    } finally { PEOPLE.split.quals.scDay = q }
  })

  it('no crew rest for the SPARE — he reports nowhere', () => {
    seat(2, 'p', 'stuff')                       // stuff stands OPS-O until 21:30 Monday
    expect(tueWarns('stuff').filter((x: any) => x.code === 'CREW_REST'),
      'the breach scintime.test.ts pins for MAIN must not fire for SPARE').toEqual([])
  })
})

describe('the typed B (the SC in-time) follows the toggle', () => {
  it('inert while the row is SPARE, the crew-rest anchor the moment it flips MAIN', () => {
    AM().br = '05:00'
    seat(2, 'p', 'stuff')
    expect(tueWarns('stuff').filter((x: any) => x.code === 'CREW_REST'),
      'an in-time cannot breach a man who is only standing by').toEqual([])
    flipMain(2)
    const w = tueWarns('stuff').find((x: any) => x.code === 'CREW_REST')
    expect(w, 'flipped MAIN, the 05:00 in-time is his report time').toBeTruthy()
    expect(w.sev).toBe('hard')
    expect(w.msg).toContain('SC AM starts 05:00')
  })
})
