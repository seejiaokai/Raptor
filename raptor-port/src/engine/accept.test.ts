/* The accept workflow and the per-section scheduler notes (owner request,
   Aug 26). A personal input is what aircrew SUBMITTED; it only becomes part of
   the issued programme when a scheduler accepts it. */
import { beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from './data'
import { INPUTS, isPersonal, isUnavail, inpLabel } from './inputs'
import { collectEvents } from './events'
import { isSpecial } from './people'
import { acceptInput, unacceptInput, inpKey, slotVal, txtGet, txtSet } from './slots'
import { keyDay } from './keys'
import { dayKeys } from './restore'
import { SCHED } from './publish'
import { makeStandalone } from './waves'
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

/* The validator gate, REVERSED on 10 Aug 26 (owner: "all will automatically go
   in"). A personal input used to be a request that blocked nothing until a
   scheduler actioned it. Now EVERY input counts the moment it is typed, and
   the scheduler's job is to edit or remove it, not to admit it.
   One carve-out survives, and it is about double-printing rather than
   admission: an input promoted to a ground row that can carry the clash defers
   to that row, so a scheduler reads it once. An ALL-DAY promotion makes a
   TIME-LESS row, which never becomes an event and so can carry nothing — that
   one stays visible on the input itself. Unavailable-typed inputs are still
   never promotable: leave does not belong on the Ground Programme. */
describe('the validator gate on personal inputs', () => {
  it('day.input keeps every type now, actioned or not', () => {
    const inp0 = collectEvents()[0].input
    expect(inp0.some((x: any) => x.type === 'OML')).toBe(true)        // divot, no acc
    expect(inp0.some((x: any) => isPersonal(x.type))).toBe(true)      // bruise / vinci / yeti count
  })

  it('an un-actioned personal input clashes at once; promoting it moves the voice to the row', () => {
    const id = ((collectEvents()[0].fly || []).find((e: any) => !isSpecial(e.id)) || {}).id
    expect(id).toBeTruthy()
    INPUTS.push({ person: id, date: DAYS[0].dt, allday: false, s: 300, e: 1380, type: 'Meeting', remarks: 'staff work', mod: '' })
    const inp = INPUTS[INPUTS.length - 1]
    const hits = (code: string) => validate().all
      .filter((x: any) => x.code === code && (x.who || []).indexOf(id) >= 0).length
    /* THE REVERSAL: this was 0 before 10 Aug 26 */
    expect(hits('INPUT_FLY')).toBeGreaterThan(0)
    const dbBase = hits('DOUBLE_BOOK')
    expect(acceptInput(0, inp, 'g')).toBe(true)
    expect(hits('DOUBLE_BOOK')).toBeGreaterThan(dbBase) // the row now carries it…
    expect(hits('INPUT_FLY')).toBe(0)                   // …and it is not said twice
    unacceptInput(0, inp)
    expect(hits('DOUBLE_BOOK')).toBe(dbBase)
    expect(hits('INPUT_FLY')).toBeGreaterThan(0)        // back on the input
    expect(acceptInput(0, inp, 'u')).toBe(true)
    expect(hits('INPUT_FLY')).toBeGreaterThan(0)
  })

  /* regression (owner report, 4 Aug 26): an ALL-DAY Fly accepted to Ground made
     a time-less row, a time-less row never becomes an event, and the inputFlags
     gate hid the input itself — so a man flying with another squadron all day
     could sit planted in a sortie with nothing said about it. Still pinned: an
     all-day promotion keeps its voice on the input, and the time-less row adds
     nothing on top, so the clash prints exactly once either way. */
  it('an all-day Fly accepted to Ground still flags the planted sortie, exactly once', () => {
    const inp = findInp('Fly')!                        // bruise, all-day, flies Jul 13 in the seed
    const hits = () => validate().all
      .filter((x: any) => x.code === 'INPUT_FLY' && (x.who || []).indexOf('bruise') >= 0)
    expect(hits().length).toBeGreaterThan(0)           // counts from the moment it is typed
    expect(acceptInput(0, inp, 'g')).toBe(true)
    const after = hits()
    expect(after.length).toBeGreaterThan(0)
    expect(after[0].sev).toBe('hard')
    /* and the time-less row adds no DOUBLE_BOOK on top */
    expect(validate().all.filter((x: any) => x.code === 'DOUBLE_BOOK'
      && (x.who || []).indexOf('bruise') >= 0).length).toBe(0)
    unacceptInput(0, inp)
    expect(hits().length).toBeGreaterThan(0)
  })

  it('accept refuses unavailable types — leave does not go on the Ground Programme', () => {
    const inp = INPUTS.find((x: any) => x.type === 'OML' && x.date === 'Jul 13')!
    const before = DAYS[0].ground.length
    expect(acceptInput(0, inp, 'g')).toBe(false)
    expect(acceptInput(0, inp, 'u')).toBe(false)
    expect(DAYS[0].ground.length).toBe(before)
    expect(inp.acc).toBeUndefined()
  })
})

/* "Unavailable" guards everything, not just the jets (owner, 4 Aug 26): a
   Detachment, or a personal input actioned to Unavailable, used to warn
   against a sortie but let a sim seat, a duty post or a ground row through
   silently. The one carve-out: ordinary personal types stay quiet against an
   SC shift, where the accepted row's soft SHIFT_SOFT advisory is the designed
   voice — leave, downchits and detachments still hard-flag a shift. */
describe('inputs clash with every kind of tasking', () => {
  const tasked = (id: string, code: string) => validate().all
    .filter((x: any) => x.code === code && / but tasked /.test(x.msg) && (x.who || []).indexOf(id) >= 0)

  it('a Detachment bars a duty post and a ground row, not only flying', () => {
    /* pike is on detachment Jul 15–17 and flies only on Monday */
    DAYS[2].dutywaves[0].rows.push({ role: 'TEST', id: 'pike', str: '1000', end: '1100' })
    DAYS[2].ground.push({ prog: 'ESCORT VISIT', str: '1300', end: '1400', who: 'pike' })
    const w = tasked('pike', 'INPUT_FLY')
    expect(w.length).toBe(2)
    expect(w.every((x: any) => x.sev === 'hard')).toBe(true)
    expect(w.map((x: any) => x.msg).join('|')).toMatch(/TEST duty/)
    expect(w.map((x: any) => x.msg).join('|')).toMatch(/ESCORT VISIT/)
  })

  it('a Meeting actioned to Unavailable bars a duty; abutting it does not', () => {
    const inp = findInp('Meeting')!                    // vinci, 09:00–17:00
    acceptInput(0, inp, 'u')
    DAYS[0].dutywaves[0].rows.push({ role: 'TEST', id: 'vinci', str: '1700', end: '1800' })
    expect(tasked('vinci', 'INPUT_FLY').length).toBe(0)   // half-open: abutting is clean
    DAYS[0].dutywaves[0].rows[DAYS[0].dutywaves[0].rows.length - 1].str = '1630'
    expect(tasked('vinci', 'INPUT_FLY').length).toBe(1)   // overlapping is not
  })

  it('an ordinary input stays quiet against an SC shift; overseas duty does not', () => {
    /* vinci's Meeting (09:00–17:00) actioned to Unavailable, vinci on SC AM
       07:00–13:00: the accepted row's SHIFT_SOFT is the designed voice there,
       the raw input must not shout over it */
    const sc0: any = makeStandalone('sc')!
    sc0.formations[0].aircraft[0].p = 'vinci'
    DAYS[0].waves.push(sc0)
    acceptInput(0, findInp('Meeting')!, 'u')
    expect(validate().all.filter((x: any) =>
      /Meeting but tasked — SC AM/.test(x.msg)).length).toBe(0)
    /* pike's overseas duty closes the day outright — an SC shift included */
    const sc2: any = makeStandalone('sc')!
    sc2.formations[0].aircraft[0].p = 'pike'
    DAYS[2].waves.push(sc2)
    expect(validate().all.filter((x: any) =>
      /OD but tasked — SC AM/.test(x.msg)).length).toBe(1)
  })

  /* ATT B is the one type that comes apart along this axis (owner, 10 Aug 26):
     grounded, but at his desk. The flying rule still catches him in a jet; a
     duty post, a sim seat and a ground row must all stay silent. Nothing else
     in the app distinguishes the two, so this is the pin for the whole axis. */
  it('ATT B bars the jet and nothing else', () => {
    const d = DAYS[0]
    const id = ((collectEvents()[0].fly || []).find((e: any) => !isSpecial(e.id)) || {}).id
    expect(id).toBeTruthy()
    INPUTS.push({ person: id, date: d.dt, allday: true, type: 'ATT B', remarks: 'grounded', mod: '' })
    const mine = (code: string) => validate().all
      .filter((x: any) => x.code === code && (x.who || []).indexOf(id) >= 0)
    /* in a jet: still a hard warning, and it names the reason */
    const fly = mine('DNIF_FLY')
    expect(fly.length).toBeGreaterThan(0)
    expect(fly.some((x: any) => /planned to fly/.test(x.msg))).toBe(true)
    /* at a desk: silent. Put him on a duty post, a ground row and a sim seat
       and none of the three may raise an input clash against him. */
    d.dutywaves[0].rows[0].id = id
    d.ground.push({ prog: 'ADMIN', who: id, str: '0900', end: '1000' })
    expect(mine('DNIF_FLY').filter((x: any) => /but tasked/.test(x.msg)).length).toBe(0)
    expect(mine('LEAVE_FLY').length + mine('INPUT_FLY').length).toBe(0)
  })

  /* the same man on ATT C — medically down and NOT able to report — must bar
     all four, or the two codes would be indistinguishable */
  it('ATT C bars the desk as well as the jet', () => {
    const d = DAYS[0]
    const id = ((collectEvents()[0].fly || []).find((e: any) => !isSpecial(e.id)) || {}).id
    INPUTS.push({ person: id, date: d.dt, allday: true, type: 'ATT C', remarks: 'down', mod: '' })
    d.dutywaves[0].rows[0].id = id
    expect(validate().all.filter((x: any) => x.code === 'DNIF_FLY'
      && (x.who || []).indexOf(id) >= 0 && /but tasked/.test(x.msg)).length).toBeGreaterThan(0)
  })
})

/* "Other" says nothing on its own, so what the person typed IS the name of the
   thing (owner, Aug 26) — in the lists and on the row accept creates. */
describe('an Other input reads by its remarks', () => {
  it('labels by remarks, and the accepted ground row takes that as its title', () => {
    INPUTS.push({ person: 'vinci', date: 'Jul 13', allday: false, s: 600, e: 660, type: 'Other', remarks: 'Range clearance run' })
    const inp = INPUTS[INPUTS.length - 1]
    expect(inpLabel(inp)).toBe('Range clearance run')
    expect(acceptInput(0, inp, 'g')).toBe(true)
    const row = DAYS[0].ground[DAYS[0].ground.length - 1]
    expect(row.prog).toBe('RANGE CLEARANCE RUN')
    expect(row.rmks).toBe('Range clearance run')
  })

  it('falls back to the bare type while the remarks box is still empty', () => {
    expect(inpLabel({ type: 'Other', remarks: '' })).toBe('Other')
    expect(inpLabel({ type: 'Other' })).toBe('Other')
  })

  it('every other type still reads by its type, remarks or not', () => {
    expect(inpLabel({ type: 'Meeting', remarks: 'Desk / staff work' })).toBe('Meeting')
    expect(inpLabel({ type: 'LL', remarks: 'Local leave' })).toBe('LL')
  })
})

/* THE CONTENT KEY IS NOT UNIQUE (11 Aug 26). inpKey is person|date|type|start,
   so two inputs agreeing on all four mint the same `src`. acceptedDay and
   unacceptInput both resolve a row by the FIRST match, so a second row carrying
   an existing key makes the link ambiguous — unaccepting one input would remove
   the other's row, and re-accepting would duplicate rather than restore. */
describe('a second accept that would mint a duplicate content key', () => {
  const twin = () => ({ person: 'pike', date: 'Jul 13', allday: false, s: 540, e: 600,
                        type: 'Appointment', remarks: '', mod: '' } as any)

  it('is refused rather than minting an ambiguous link', () => {
    const a = twin(), b = twin()
    b.e = 700                                  // a genuinely different input...
    INPUTS.push(a); INPUTS.push(b)
    expect(inpKey(a)).toBe(inpKey(b))          // ...that nonetheless shares the key
    expect(acceptInput(0, a, 'g')).toBe(true)
    expect(acceptInput(0, b, 'g')).toBe(false)
    expect(b.acc).toBeFalsy()
    expect((DAYS[0].ground || []).filter((r: any) => r.src === inpKey(a)).length).toBe(1)
  })

  it('and the first input can still be unaccepted cleanly afterwards', () => {
    const a = twin(), b = twin(); b.e = 700
    INPUTS.push(a); INPUTS.push(b)
    acceptInput(0, a, 'g'); acceptInput(0, b, 'g')
    expect(unacceptInput(0, a)).toBe(true)
    expect((DAYS[0].ground || []).filter((r: any) => r.src === inpKey(a)).length).toBe(0)
  })

  it('a different start minute is a different key, and both are accepted', () => {
    const a = twin(), b = twin(); b.s = 541
    INPUTS.push(a); INPUTS.push(b)
    expect(inpKey(a)).not.toBe(inpKey(b))
    expect(acceptInput(0, a, 'g')).toBe(true)
    expect(acceptInput(0, b, 'g')).toBe(true)
  })
})
