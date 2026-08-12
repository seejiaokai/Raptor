/* AUDIT C — BUG PIN (expected RED until fixed).
   inputFlags' ground-row deferral is PER-INPUT, but the row an accept creates
   lives on ONE day. A TIMED input spanning several days, accepted onto one of
   them, therefore goes silent on every OTHER day it covers: the input is
   filtered out of day.input (acc==='g' && !allday) and no row exists there to
   carry the clash. Accepting an input REMOVES real warnings.

   Contract violated: engine-rules §Validation, "The validator gate" — the
   deferral exists so "a clash surfaces exactly once, as DOUBLE_BOOK … on the
   ROW"; on a covered day with no row it surfaces ZERO times. Measured 12 Aug
   26: before accept, di2 = [INPUT_FLY, NO_BRIEF]; after accepting onto di3,
   di2 = [] while di3 = [DOUBLE_BOOK].

   The first two tests assert the CORRECT behaviour and FAIL today — that is
   the finding. The last test passes and shows the accepted day itself is fine,
   so a fix must not disturb it. */
import { beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from './data'
import { INPUTS } from './inputs'
import { validate } from './validate'
import { acceptInput } from './slots'
import { SCHED } from './publish'

const DSNAP = JSON.stringify(DAYS)
const ISNAP = JSON.stringify(INPUTS)
beforeEach(() => {
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((i: any) => INPUTS.push(i))
  SCHED.pending = {}; SCHED.changes = {}; SCHED.als = []
  validate()
})

const codes = (id: string, di: number) =>
  validate().all.filter((x: any) => (x.who || []).includes(id) && x.di === di).map((x: any) => x.code)

const seed = () => {
  // a timed Meeting covering Wed–Fri, and the man flying WEDNESDAY inside it
  INPUTS.push({ person: 'fantom', date: 'Jul 15', endDate: 'Jul 17', allday: false, s: 600, e: 660, type: 'Meeting', remarks: '', mod: '' })
  DAYS[2].waves[0].formations[0].aircraft[0].p = 'fantom'
  return INPUTS[INPUTS.length - 1]
}

describe('BUG: accepting a multi-day timed input silences its other days', () => {
  it('the Wednesday clash must survive an accept made onto THURSDAY', () => {
    const r = seed()
    expect(codes('fantom', 2)).toContain('INPUT_FLY')      // the clash is real before the accept
    expect(acceptInput(3, r, 'g')).toBe(true)              // accepted onto Jul 16 — a different day
    // EXPECTED (red today): the Thursday row cannot carry Wednesday's clash,
    // so the input must keep its voice on Wednesday
    expect(codes('fantom', 2), 'accept on Thu must not erase the Wed warning').toContain('INPUT_FLY')
  })

  it('the eaten brief window on Wednesday must survive it too', () => {
    const r = seed()
    expect(codes('fantom', 2)).toContain('NO_BRIEF')
    acceptInput(3, r, 'g')
    expect(codes('fantom', 2), 'accept on Thu must not erase the Wed brief squeeze').toContain('NO_BRIEF')
  })

  it('the accepted day itself is fine — the row carries the clash there (passes today)', () => {
    const r = seed()
    DAYS[3].waves[0].formations[0].aircraft[0].p = 'fantom'  // flying Thursday too, same hours
    acceptInput(3, r, 'g')
    expect(codes('fantom', 3)).toContain('DOUBLE_BOOK')      // the ROW clashes, exactly once
  })
})
