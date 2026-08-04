/* The accept workflow and the per-section scheduler notes (owner request,
   Aug 26). A personal input is what aircrew SUBMITTED; it only becomes part of
   the issued programme when a scheduler accepts it. */
import { beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from './data'
import { INPUTS, isPersonal, isUnavail } from './inputs'
import { collectEvents } from './events'
import { isSpecial } from './people'
import { acceptInput, unacceptInput, inpKey, slotVal, txtGet, txtSet } from './slots'
import { keyDay } from './keys'
import { dayKeys } from './restore'
import { SCHED } from './publish'
import { validate } from './validate'

const DSNAP = JSON.stringify(DAYS)
const ISNAP = JSON.stringify(INPUTS)

beforeEach(() => {
  const d = JSON.parse(DSNAP); DAYS.length = 0; d.forEach((x: any) => DAYS.push(x))
  const i = JSON.parse(ISNAP); INPUTS.length = 0; i.forEach((x: any) => INPUTS.push(x))
  SCHED.pending = {}; SCHED.changes = {}
  validate()
})

const findInp = (t: string) => INPUTS.find((x: any) => x.type === t && x.date === 'Jul 13')

describe('accepting a personal input', () => {
  it('promotes it into the ground programme as a real row', () => {
    const inp = findInp('Meeting')!
    expect(inp).toBeTruthy()
    const before = DAYS[0].ground.length
    expect(acceptInput(0, inp, 'g')).toBe(true)
    expect(DAYS[0].ground.length).toBe(before + 1)
    const row = DAYS[0].ground[DAYS[0].ground.length - 1]
    /* who is the CALLSIGN, like every other ground write — an id would render
       as free text for anyone whose id !== cs.toLowerCase(). Title is the bare
       type; the submitter's remarks travel to the row's own rmks cell. */
    expect(row.who).toBe('Vinci')
    expect(row.prog).toBe('MEETING')
    expect(row.rmks).toBe(inp.remarks)
    expect(row.str).toBe('09:00')            // 540 minutes from midnight
    expect(row.end).toBe('17:00')
    expect(inp.acc).toBe('g')
  })

  /* regression: id and callsign diverge for some people ('haowen' → 'Hao Wen').
     Storing the id made the row render as free text and never validate. */
  it('stores the callsign even when it differs from the id', () => {
    INPUTS.push({ person: 'haowen', date: 'Jul 13', allday: false, s: 600, e: 660, type: 'Appointment', remarks: 'x' })
    const inp = INPUTS[INPUTS.length - 1]
    expect(acceptInput(0, inp, 'g')).toBe(true)
    const ri = DAYS[0].ground.length - 1
    expect(DAYS[0].ground[ri].who).toBe('Hao Wen')
    expect(slotVal(`g:0.${ri}`)).toBe('haowen')
  })

  /* a write that skipped the funnel would be invisible to the amendment
     machinery — not pending, absent from the next AL, never re-validated */
  it('marks the new row pending so it reaches the next AL', () => {
    const inp = findInp('Meeting')!
    acceptInput(0, inp, 'g')
    expect(SCHED.pending[`g:0.${DAYS[0].ground.length - 1}`]).toBe(1)
  })

  it('an all-day input becomes an all-day row, not 00:00–00:00', () => {
    const inp = findInp('Fly')!
    expect(inp.allday).toBe(true)
    acceptInput(0, inp, 'g')
    const row = DAYS[0].ground[DAYS[0].ground.length - 1]
    expect(row.str).toBe('')
    expect(row.end).toBe('')
  })

  it('filing under Unavailable creates no ground row', () => {
    const inp = findInp('Meeting')!
    const before = DAYS[0].ground.length
    expect(acceptInput(0, inp, 'u')).toBe(true)
    expect(DAYS[0].ground.length).toBe(before)
    expect(inp.acc).toBe('u')
  })

  it('accepting twice is a no-op — undo first', () => {
    const inp = findInp('Meeting')!
    acceptInput(0, inp, 'g')
    const n = DAYS[0].ground.length
    expect(acceptInput(0, inp, 'g')).toBe(false)
    expect(DAYS[0].ground.length).toBe(n)
  })

  /* the link back is a content key, not an index: a row deleted ABOVE the one
     accept created would leave an index pointing at the wrong item */
  it('undo removes the row it created, even after the rows above it move', () => {
    const inp = findInp('Meeting')!
    acceptInput(0, inp, 'g')
    const n = DAYS[0].ground.length
    DAYS[0].ground.splice(0, 1)                      // something else deleted meanwhile
    expect(unacceptInput(0, inp)).toBe(true)
    expect(DAYS[0].ground.length).toBe(n - 2)
    expect(DAYS[0].ground.some((r: any) => r.src === inpKey(inp))).toBe(false)
    expect(inp.acc).toBeUndefined()
  })

  it('undo on an un-accepted input does nothing', () => {
    expect(unacceptInput(0, findInp('Meeting')!)).toBe(false)
  })
})

describe('the day blocks split cleanly', () => {
  it('every seeded input lands in exactly one of the two blocks', () => {
    for (const inp of INPUTS)
      expect(isPersonal(inp.type) !== isUnavail(inp.type), inp.type).toBe(true)
  })
})

describe('per-section scheduler notes', () => {
  const KEYS: [string, string][] = [['pn', 'prognotes'], ['dtn', 'dutynotes'],
    ['sn', 'simnotes'], ['gn', 'grndnotes']]

  it('each key round-trips through the mutation funnel', () => {
    for (const [k, field] of KEYS) {
      expect(txtSet(`${k}:2`, 'hand-over text')).toBe(true)
      expect(txtGet(`${k}:2`)).toBe('hand-over text')
      expect(DAYS[2][field]).toBe('hand-over text')
      expect(SCHED.pending[`${k}:2`]).toBe(1)      // pending, so it reaches the AL
    }
  })

  it('the day index resolves, so amendment colouring works on them', () => {
    for (const [k] of KEYS) expect(keyDay(`${k}:3`)).toBe(3)
  })

  it('they ride the version snapshots', () => {
    for (const [k] of KEYS) {
      txtSet(`${k}:0`, 'v1')
      expect(dayKeys(DAYS[0], 0).get(`${k}:0`)).toBe('v1')
    }
  })

  it('writing the same text twice is not a change', () => {
    txtSet('pn:1', 'same')
    expect(txtSet('pn:1', 'same')).toBe(false)
  })
})

/* The validator gate (owner, Aug 26): a personal input is a request until a
   scheduler actions it. Un-actioned → invisible to validate(); accepted to the
   ground programme → its ROW clashes (once, as DOUBLE_BOOK — never doubled by
   INPUT_FLY on the input it came from); filed under Unavailable → the input
   itself clashes. Unavailable-typed inputs never needed accepting. */
describe('the validator gate on personal inputs', () => {
  it('day.input keeps unavailable types, drops un-actioned personal ones', () => {
    const inp0 = collectEvents()[0].input
    expect(inp0.some((x: any) => x.type === 'Downchit')).toBe(true)   // divot / sufa, no acc
    expect(inp0.some((x: any) => isPersonal(x.type))).toBe(false)     // bruise / vinci / yeti gone
  })

  it('accept → one DOUBLE_BOOK from the row; undo → silence; file-u → INPUT_FLY', () => {
    const id = ((collectEvents()[0].fly || []).find((e: any) => !isSpecial(e.id)) || {}).id
    expect(id).toBeTruthy()
    INPUTS.push({ person: id, date: DAYS[0].dt, allday: false, s: 300, e: 1380, type: 'Meeting', remarks: 'staff work', mod: '' })
    const inp = INPUTS[INPUTS.length - 1]
    const hits = (code: string) => validate().all
      .filter((x: any) => x.code === code && (x.who || []).indexOf(id) >= 0).length
    expect(hits('INPUT_FLY')).toBe(0)                  // un-actioned: silent
    const dbBase = hits('DOUBLE_BOOK')
    expect(acceptInput(0, inp, 'g')).toBe(true)
    expect(hits('DOUBLE_BOOK')).toBeGreaterThan(dbBase) // the row clashes…
    expect(hits('INPUT_FLY')).toBe(0)                   // …and only the row
    unacceptInput(0, inp)
    expect(hits('DOUBLE_BOOK')).toBe(dbBase)
    expect(hits('INPUT_FLY')).toBe(0)
    expect(acceptInput(0, inp, 'u')).toBe(true)
    expect(hits('INPUT_FLY')).toBeGreaterThan(0)        // unavailable is real
  })
})
