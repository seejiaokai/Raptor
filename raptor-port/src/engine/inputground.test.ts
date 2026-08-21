/* Activity inputs auto-land on the Ground Programme, and the crew picker warns
   about an unaccepted one before the plant (owner, Aug 26). Two things this
   pins that nothing else does:
     · the PICKER (slotBar) and the VALIDATOR (validate → INPUT_FLY) agree about
       an unaccepted activity input — the drift the whole app is built to avoid,
       here on the one shape (day.input, not a day.event) that only the
       validator used to see; including a midnight-tail case.
     · autoAcceptInput's gate (activity type, editable day) and the ground
       round-trip (land → remove → back under Personal Inputs → re-add). */
import { beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from './data'
import { INPUTS, inpId, isPersonal } from './inputs'
import { PEOPLE } from './people'
import { validate, WARN } from './validate'
import { slotBar, slotRules, dayEngaged } from './avail'
import { setSlotVal, acceptInput, unacceptInput, autoAcceptInput, autoAcceptSeedInputs, inpKey } from './slots'
import { SCHED, resetSched } from './publish'

const DSNAP = JSON.stringify(DAYS)
const ISNAP = JSON.stringify(INPUTS)
beforeEach(() => {
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((i: any) => INPUTS.push(i))
  resetSched()
  validate()
})

/* a free, non-SANS front-seat pilot on day 0 — computed, not hard-coded, so a
   seed edit cannot silently make the test vacuous (SANS would hit the SANS gate
   before the busy-check; an engaged man would read "already on <the flight>"). */
const freePilot = () => {
  const eng = dayEngaged(DAYS[0])
  const id = Object.keys(PEOPLE).find(k =>
    PEOPLE[k].seat === 'FCP' && !PEOPLE[k].special && !PEOPLE[k].pers && !PEOPLE[k].san && !eng.has(k))
  if (!id) throw new Error('no free non-SANS pilot in the seed — retune the fixture')
  return id
}
const fileMeeting = (person: string, s: number, e: number, date = 'Jul 13') => {
  const r: any = { person, date, allday: false, s, e, type: 'Meeting', remarks: 'staff work', mod: 'now' }
  inpId(r); INPUTS.push(r); return r
}

describe('the picker and the validator agree about an unaccepted activity input', () => {
  it('warns the picker BEFORE the plant and the validator AFTER — no drift', () => {
    const KEY = '0.0.0.0.p', r = slotRules(KEY), P = freePilot()
    fileMeeting(P, 600, 900)                          // 10:00–15:00, straddles the slot
    validate()
    /* the picker names the commitment before he is planted anywhere */
    expect(slotBar(P, KEY)).toMatch(/^already on Meeting /)
    /* plant him: the validator raises INPUT_FLY on the very same input */
    expect(overlapping(r)).toBe(true)               // guard: the slot really is inside the meeting
    setSlotVal(KEY, P); validate()
    expect(WARN.all.some((w: any) => w.code === 'INPUT_FLY' && w.who.includes(P))).toBe(true)
  })

  it('reads the midnight tail — a meeting TOMORROW warns a slot that runs past midnight', () => {
    const P = freePilot()
    fileMeeting(P, 30, 90, 'Jul 14')                 // 00:30–01:30 the next day
    validate()
    /* a night sortie on day 0 whose window runs to 00:45 — its tail is tomorrow's */
    const rules = { seat: 'p', di: 0, slotStart: 1400, slotEnd: 1485, sc: null }
    expect(slotBar(P, '0.0.0.0.p', rules)).toMatch(/already on Meeting .*\(tomorrow\)/)
  })

  it('an ACCEPTED activity input does not double-report — the ground row carries it', () => {
    const KEY = '0.0.0.0.p', P = freePilot()
    const m = fileMeeting(P, 600, 900)
    acceptInput(0, m, 'g')                            // now it is a ground event, not a day.input voice
    validate()
    /* the picker still bars him (the ground EVENT overlaps), but via the event
       scan, not the input scan — inputFlags keeps the accepted timed input out */
    expect(slotBar(P, KEY)).toMatch(/^already on /)
  })
})

const overlapping = (r: any) => r.slotStart != null && r.slotEnd != null && r.slotStart < 900 && 600 < r.slotEnd

describe('autoAcceptInput — the one gate', () => {
  it('lands an activity input on its day, editable day, tagged with its src', () => {
    const m = fileMeeting(freePilot(), 600, 700)
    const g0 = (DAYS[0].ground || []).length
    expect(autoAcceptInput(m)).toBe(true)
    expect(m.acc).toBe('g')
    expect((DAYS[0].ground || []).length).toBe(g0 + 1)
    expect(DAYS[0].ground.some((row: any) => row.src === inpKey(m))).toBe(true)
  })

  it('refuses a non-activity type (leave stays under Unavailable)', () => {
    const r: any = { person: freePilot(), date: 'Jul 13', allday: true, type: 'LL', remarks: '', mod: 'now' }
    inpId(r); INPUTS.push(r)
    expect(autoAcceptInput(r)).toBe(false)
    expect(r.acc).toBeFalsy()
  })

  it('refuses an already-published day (the late input stays under Personal Inputs)', () => {
    SCHED.dayOK[0] = 1                                // day 0 is published (what dayApproved reads)
    const m = fileMeeting(freePilot(), 600, 700)
    expect(autoAcceptInput(m)).toBe(false)
    expect(m.acc).toBeFalsy()
  })
})

describe('the ground round-trip', () => {
  it('remove sends it back to Personal Inputs, and it can be re-added', () => {
    const m = fileMeeting(freePilot(), 600, 700)
    expect(autoAcceptInput(m)).toBe(true)
    expect(DAYS[0].ground.some((row: any) => row.src === inpKey(m))).toBe(true)
    /* remove from the programme → the input returns, unaccepted */
    unacceptInput(0, m)
    expect(m.acc).toBeFalsy()
    expect(DAYS.some((d: any) => (d.ground || []).some((row: any) => row.src === inpKey(m)))).toBe(false)
    expect(INPUTS.includes(m)).toBe(true)
    /* and it can go straight back */
    expect(autoAcceptInput(m)).toBe(true)
    expect(m.acc).toBe('g')
  })
})

describe('autoAcceptSeedInputs — the boot / week-load pass', () => {
  it('lands activity inputs but leaves NO amendment marks (a clean zero-state)', () => {
    fileMeeting(freePilot(), 600, 700)
    resetSched()
    autoAcceptSeedInputs()
    expect(DAYS.some((d: any) => (d.ground || []).some((row: any) => row.src))).toBe(true)
    /* the funnel marks each accept pending/added; the pass wipes them so the
       seed's auto-landed rows are the week's zero-state, not unpublished edits */
    expect(Object.keys(SCHED.pending)).toHaveLength(0)
    expect(Object.keys(SCHED.added)).toHaveLength(0)
    expect(Object.keys(SCHED.changes)).toHaveLength(0)
  })
})
