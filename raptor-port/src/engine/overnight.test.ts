/* THE GENERAL MIDNIGHT TAIL + THE AVALON RULE (owner, 11 Aug 26). Spec is
   docs/session-state.md's "Unfinished" section, confirmed verbatim by the
   owner. Two things, one file:
     - any timed window that runs past minute 1440 must judge its tail
       against TOMORROW's inputs, everywhere day.input is read;
     - AVALON stays noconf except one new check: a jet seat (MAIN and SPARE
       alike) bars canSpare-failing types, a duty desk bars the same but lets
       canWork (ATT B) through. BB is untouched on purpose.
   Person ids below are picked by inspecting people.ts and data.ts for men
   with nothing on Mon (Jul 13) or Tue (Jul 14) and no seed INPUTS row, so a
   test's own mutation is the only thing driving the result. Assertions are
   filtered by code + who + a message regex throughout — the robust pattern —
   rather than asserting the whole warning list, because the seed week keeps
   producing its own unrelated warnings underneath. */
import { beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from './data'
import { INPUTS } from './inputs'
import { validate } from './validate'
import { collectEvents } from './events'
import { makeStandalone, waveDutyBlock } from './waves'
import { slotBar } from './avail'
import { PEOPLE, scQualOK } from './people'
import { dayHTML } from '../ui/html'
import { SCHED } from './publish'

const DSNAP = JSON.stringify(DAYS)
const ISNAP = JSON.stringify(INPUTS)
beforeEach(() => {
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((i: any) => INPUTS.push(i))
  SCHED.pending = {}; SCHED.changes = {}; SCHED.als = []
  validate()
})

const hits = (code: string, id: string) =>
  validate().all.filter((x: any) => x.code === code && (x.who || []).includes(id))

describe('the general midnight tail (day.input, every consumer)', () => {
  it('an overnight duty row 1900-0700 sees TOMORROW leave on its tail half', () => {
    DAYS[0].dutywaves[0].rows.push({ role: 'SDO', id: 'split', str: '1900', end: '0700' })
    INPUTS.push({ person: 'split', date: 'Jul 14', allday: true, type: 'OL', remarks: '' })
    const h = hits('LEAVE_FLY', 'split')
    expect(h.length, JSON.stringify(h)).toBeGreaterThan(0)
    expect(h.some((x: any) => x.di === 0)).toBe(true)
    expect(h.some((x: any) => /On leave but tasked/.test(x.msg))).toBe(true)
  })

  it('a window that dies exactly at midnight has no tail to check (half-open)', () => {
    DAYS[0].dutywaves[0].rows.push({ role: 'SDO', id: 'split', str: '1900', end: '2400' })
    INPUTS.push({ person: 'split', date: 'Jul 14', allday: true, type: 'OL', remarks: '' })
    expect(hits('LEAVE_FLY', 'split')).toEqual([])
    expect(hits('DNIF_FLY', 'split')).toEqual([])
  })

  it('the split point: a timed tomorrow input inside the tail flags, one minute short is quiet', () => {
    DAYS[0].dutywaves[0].rows.push({ role: 'SDO', id: 'split', str: '1900', end: '0700' })
    INPUTS.push({ person: 'split', date: 'Jul 14', allday: false, s: 240, e: 360, type: 'OML', remarks: '' })
    const h = hits('DNIF_FLY', 'split')
    expect(h.length, JSON.stringify(h)).toBeGreaterThan(0)
  })

  it('the split point, quiet side: tail dies 0400, input starts 0400', () => {
    DAYS[0].dutywaves[0].rows.push({ role: 'SDO', id: 'split', str: '1900', end: '0400' })
    INPUTS.push({ person: 'split', date: 'Jul 14', allday: false, s: 240, e: 360, type: 'OML', remarks: '' })
    expect(hits('DNIF_FLY', 'split')).toEqual([])
  })

  it('a night sortie landing after midnight sees tomorrow leave too', () => {
    const f = DAYS[0].waves[0].formations[0]
    f.ld = '00:30'                                    // to stays earlier — lands after midnight
    f.aircraft[0].p = 'split'
    INPUTS.push({ person: 'split', date: 'Jul 14', allday: true, type: 'OL', remarks: '' })
    const h = hits('LEAVE_FLY', 'split')
    expect(h.length, JSON.stringify(h)).toBeGreaterThan(0)
    expect(h.some((x: any) => /planned to fly/.test(x.msg))).toBe(true)
  })

  it('TODAY input still clashes unchanged — the evening half against today', () => {
    DAYS[0].dutywaves[0].rows.push({ role: 'SDO', id: 'split', str: '1900', end: '0700' })
    INPUTS.push({ person: 'split', date: 'Jul 13', allday: true, type: 'OL', remarks: '' })
    const h = hits('LEAVE_FLY', 'split')
    expect(h.length, JSON.stringify(h)).toBeGreaterThan(0)
    expect(h.every((x: any) => x.di === 0)).toBe(true)
  })
})

describe('the AVALON rule — jet seats', () => {
  const pushAvalon = () => {
    const w = makeStandalone('avalon')
    DAYS[0].waves.push(w)
    const wi = DAYS[0].waves.length - 1
    DAYS[0].dutywaves = DAYS[0].dutywaves || []
    DAYS[0].dutywaves.push(waveDutyBlock(w))
    const dwi = DAYS[0].dutywaves.length - 1
    return { w, wi, dwi, f: DAYS[0].waves[wi].formations[0] }
  }

  it('jet MAIN with OL today — hard LEAVE_FLY, "but on AVALON" and "overseas"', () => {
    const { f } = pushAvalon()
    f.aircraft[0].p = 'badger'                        // MAIN
    INPUTS.push({ person: 'badger', date: 'Jul 13', allday: true, type: 'OL', remarks: '' })
    const h = hits('LEAVE_FLY', 'badger')
    expect(h.length, JSON.stringify(h)).toBeGreaterThan(0)
    expect(h.some((x: any) => /but on AVALON/.test(x.msg) && /overseas/.test(x.msg))).toBe(true)
  })

  it('jet SPARE with ATT B today — hard DNIF_FLY (spare is still a jet seat)', () => {
    const { f } = pushAvalon()
    f.aircraft[2].p = 'wrangler'                       // first SPARE line
    INPUTS.push({ person: 'wrangler', date: 'Jul 13', allday: true, type: 'ATT B', remarks: '' })
    const h = hits('DNIF_FLY', 'wrangler')
    expect(h.length, JSON.stringify(h)).toBeGreaterThan(0)
  })

  it('jet with LL today — no AVALON warning (local leave is fine, the whole point)', () => {
    const { f } = pushAvalon()
    f.aircraft[0].w = 'bullet'
    INPUTS.push({ person: 'bullet', date: 'Jul 13', allday: true, type: 'LL', remarks: '' })
    const bad = validate().all.filter((x: any) => (x.who || []).includes('bullet') && /AVALON/.test(x.msg))
    expect(bad, JSON.stringify(bad)).toEqual([])
  })
})

describe('the AVALON rule — duty desk (canWork carve-out)', () => {
  const pushAvalon = () => {
    const w = makeStandalone('avalon')
    DAYS[0].waves.push(w)
    DAYS[0].dutywaves = DAYS[0].dutywaves || []
    DAYS[0].dutywaves.push(waveDutyBlock(w))
    const dw = DAYS[0].dutywaves[DAYS[0].dutywaves.length - 1]
    dw.rows[0].id = 'xray'
    return dw
  }

  it('ATT B mans the desk fine — no AVALON warning', () => {
    // by CODE, not by message: the desk's warnings are labelled "SXO duty",
    // so a /AVALON/ message filter could never catch a broken carve-out
    pushAvalon()
    INPUTS.push({ person: 'xray', date: 'Jul 13', allday: true, type: 'ATT B', remarks: '' })
    expect(hits('DNIF_FLY', 'xray')).toEqual([])
    expect(hits('LEAVE_FLY', 'xray')).toEqual([])
  })

  it('ATT C bars the desk — hard DNIF_FLY', () => {
    pushAvalon()
    INPUTS.push({ person: 'xray', date: 'Jul 13', allday: true, type: 'ATT C', remarks: '' })
    expect(hits('DNIF_FLY', 'xray').length).toBeGreaterThan(0)
  })

  it('OL bars the desk — hard LEAVE_FLY', () => {
    pushAvalon()
    INPUTS.push({ person: 'xray', date: 'Jul 13', allday: true, type: 'OL', remarks: '' })
    expect(hits('LEAVE_FLY', 'xray').length).toBeGreaterThan(0)
  })

  it('LL does not bar the desk — quiet', () => {
    pushAvalon()
    INPUTS.push({ person: 'xray', date: 'Jul 13', allday: true, type: 'LL', remarks: '' })
    expect(hits('LEAVE_FLY', 'xray')).toEqual([])
    expect(hits('DNIF_FLY', 'xray')).toEqual([])
  })
})

describe('the AVALON rule reaches the tail too, and stays exempt from everything else', () => {
  const pushAvalon = () => {
    const w = makeStandalone('avalon')
    DAYS[0].waves.push(w)
    DAYS[0].dutywaves = DAYS[0].dutywaves || []
    DAYS[0].dutywaves.push(waveDutyBlock(w))
    return DAYS[0].waves[DAYS[0].waves.length - 1].formations[0]
  }

  it('clean today, OL all-day tomorrow — hard, the morning half', () => {
    const f = pushAvalon()
    f.aircraft[0].p = 'plasma'
    INPUTS.push({ person: 'plasma', date: 'Jul 14', allday: true, type: 'OL', remarks: '' })
    expect(hits('LEAVE_FLY', 'plasma').length).toBeGreaterThan(0)
  })

  it('OML tomorrow 0800-1000 is after the 0700 shift end — quiet', () => {
    const f = pushAvalon()
    f.aircraft[0].p = 'plasma'
    INPUTS.push({ person: 'plasma', date: 'Jul 14', allday: false, s: 480, e: 600, type: 'OML', remarks: '' })
    expect(hits('DNIF_FLY', 'plasma')).toEqual([])
    expect(hits('LEAVE_FLY', 'plasma')).toEqual([])
  })

  it('the exemption stands: an AVALON jet man also on a same-evening ground row raises nothing', () => {
    const f = pushAvalon()
    f.aircraft[0].p = 'badger'
    DAYS[0].ground.push({ prog: 'STAND-DOWN BRIEF', str: '2000', end: '2100', who: 'Pixel' })
    const bad = validate().all.filter((x: any) => (x.who || []).includes('badger')
      && (x.code === 'DOUBLE_BOOK' || x.code === 'SHIFT_SOFT'))
    expect(bad, JSON.stringify(bad)).toEqual([])
  })

  it('BB is untouched: a BB seat with OL today raises nothing new', () => {
    const w = makeStandalone('bb')
    DAYS[0].waves.push(w)
    const f = w.formations[0]
    // typed hours, or the blank BB seed would make this pass vacuously —
    // an unparseable window checks nothing whatever kind the wave is
    f.to = '19:00'; f.ld = '07:00'
    f.aircraft[0].p = 'waldo'
    INPUTS.push({ person: 'waldo', date: 'Jul 13', allday: true, type: 'OL', remarks: '' })
    expect(hits('LEAVE_FLY', 'waldo')).toEqual([])
    expect(hits('DNIF_FLY', 'waldo')).toEqual([])
  })
})

describe('the AVALON puck wears its ring (11 Aug 26, owner’s first live use)', () => {
  /* the engine flagged the man and the puck stayed clean — html.ts's chk gate
     ("a line the engine isn't checking shows no ring") predates AVALON being
     checked at all. The assertion anchors on the seat's data-slot key, and on
     nothing looser: the same man also renders a DECORATED puck in the day's
     Unavailable block the moment the input exists, so matching by person
     finds a ring whichever way the gate is set — that copy made the first
     cut of this test pass against the unfixed gate. */
  const slotPuckClass = (html: string, key: string) => {
    const m = html.match(new RegExp('data-slot="' + key.replace(/\./g, '\\.') + '"[^>]*><span class="(puck[^"]*)"'))
    return m ? m[1] : null
  }

  it('an AVALON jet man with a barred input rings red on the AVALON line', () => {
    const w = makeStandalone('avalon')
    DAYS[0].waves.push(w)
    const wi = DAYS[0].waves.length - 1
    DAYS[0].dutywaves.push(waveDutyBlock(w))
    w.formations[0].aircraft[0].w = 'badger'
    INPUTS.push({ person: 'badger', date: 'Jul 13', allday: true, type: 'OL', remarks: '' })
    validate()
    const cls = slotPuckClass(dayHTML(0, false), `0.${wi}.0.0.w`)
    expect(cls, 'AVALON seat renders a puck').toBeTruthy()
    expect(/warn hard/.test(cls!) && /boxred/.test(cls!), cls!).toBe(true)
  })

  it('BB stays clean even when the man carries a warning of his own', () => {
    const w = makeStandalone('bb')
    DAYS[0].waves.push(w)
    const wi = DAYS[0].waves.length - 1
    w.formations[0].aircraft[0].p = 'split'
    DAYS[0].waves[0].formations[0].aircraft[0].p = 'split'      // an ordinary seat too
    INPUTS.push({ person: 'split', date: 'Jul 13', allday: true, type: 'ATT C', remarks: '' })
    validate()
    const html = dayHTML(0, false)
    expect(/warn hard/.test(slotPuckClass(html, '0.0.0.0.p') || ''), 'ordinary copy rings').toBe(true)
    const bb = slotPuckClass(html, `0.${wi}.0.0.p`)
    expect(bb, 'BB seat renders a puck').toBeTruthy()
    expect(/warn/.test(bb!), 'BB copy stays clean: ' + bb).toBe(false)
  })

  it('an SC SPARE with a barred input rings red on the spare line too (owner, 11 Aug 26, second pass)', () => {
    const w = makeStandalone('sc')
    DAYS[0].waves.push(w)
    const wi = DAYS[0].waves.length - 1
    const ai = w.formations[0].aircraft.findIndex((a: any) => a.spare)
    w.formations[0].aircraft[ai].w = 'plasma'
    INPUTS.push({ person: 'plasma', date: 'Jul 13', allday: true, type: 'OD', remarks: '' })
    expect(hits('LEAVE_FLY', 'plasma').length).toBeGreaterThan(0)
    const cls = slotPuckClass(dayHTML(0, false), `0.${wi}.0.${ai}.w`)
    expect(cls, 'spare seat renders a puck').toBeTruthy()
    expect(/warn hard/.test(cls!) && /boxred/.test(cls!), cls!).toBe(true)
  })

  it('…but never bleeds: a spare warned only ELSEWHERE stays clean on the spare line', () => {
    const w = makeStandalone('sc')
    DAYS[0].waves.push(w)
    const wi = DAYS[0].waves.length - 1
    const ai = w.formations[0].aircraft.findIndex((a: any) => a.spare)
    w.formations[0].aircraft[ai].w = 'plasma'
    DAYS[0].waves[0].formations[0].aircraft[1].w = 'plasma'      // an ordinary sortie too
    INPUTS.push({ person: 'plasma', date: 'Jul 13', allday: false, s: 600, e: 900, type: 'Meeting', remarks: '' })
    validate()
    const html = dayHTML(0, false)
    expect(/warn/.test(slotPuckClass(html, '0.0.0.1.w') || ''), 'the sortie copy rings').toBe(true)
    const sp = slotPuckClass(html, `0.${wi}.0.${ai}.w`)
    expect(sp, 'spare seat renders a puck').toBeTruthy()
    expect(/warn/.test(sp!), 'spare copy stays clean: ' + sp).toBe(false)
  })

  it('…and AVALON does not bleed either: warned only elsewhere, the AVALON copy stays clean', () => {
    const w = makeStandalone('avalon')
    DAYS[0].waves.push(w)
    const wi = DAYS[0].waves.length - 1
    w.formations[0].aircraft[0].w = 'badger'
    DAYS[0].waves[0].formations[0].aircraft[0].w = 'badger'      // an ordinary sortie too
    INPUTS.push({ person: 'badger', date: 'Jul 13', allday: false, s: 600, e: 900, type: 'Meeting', remarks: '' })
    validate()
    const html = dayHTML(0, false)
    expect(/warn/.test(slotPuckClass(html, '0.0.0.0.w') || ''), 'the sortie copy rings').toBe(true)
    const av = slotPuckClass(html, `0.${wi}.0.0.w`)
    expect(av, 'AVALON seat renders a puck').toBeTruthy()
    expect(/warn/.test(av!), 'AVALON copy stays clean: ' + av).toBe(false)
  })

  it('SC currency is the spare line’s other own rule: a non-current spare rings Q', () => {
    const w = makeStandalone('sc')
    DAYS[0].waves.push(w)
    const wi = DAYS[0].waves.length - 1
    const ai = w.formations[0].aircraft.findIndex((a: any) => a.spare)
    const nc = Object.keys(PEOPLE).find(id =>
      !PEOPLE[id].special && PEOPLE[id].seat === 'RCP' && !scQualOK(id, 'day'))
    expect(nc, 'seed has a non-SC-current WSO').toBeTruthy()
    w.formations[0].aircraft[ai].w = nc
    expect(hits('SC_QUAL', nc!).length).toBeGreaterThan(0)
    const cls = slotPuckClass(dayHTML(0, false), `0.${wi}.0.${ai}.w`)
    expect(cls, 'spare seat renders a puck').toBeTruthy()
    expect(/warn hard/.test(cls!), cls!).toBe(true)
  })

  it('the badge tells the truth per wave: AVALON names its one check, BB stays wholly exempt', () => {
    DAYS[0].waves.push(makeStandalone('avalon'))
    DAYS[0].waves.push(makeStandalone('bb'))
    const html = dayHTML(0, false)
    expect(html).toContain('availability check only')
    expect(html).toContain('not cross-checked')
  })
})

describe('positive pins for the parity excision (port-only additions)', () => {
  it('day 0 input carries a shifted, nx-marked copy of tomorrow (nasty, LL, Jul 14)', () => {
    const ev = collectEvents()
    expect(ev[0].input).toContainEqual(
      expect.objectContaining({ id: 'nasty', s: 1440, e: 2879, type: 'LL', nx: true }))
  })

  it('sacrew is empty on the bare seed and non-empty (1140-1860) once AVALON is crewed', () => {
    expect(collectEvents()[0].sacrew).toEqual([])
    const w = makeStandalone('avalon')
    DAYS[0].waves.push(w)
    w.formations[0].aircraft[0].p = 'badger'
    const sc = collectEvents()[0].sacrew
    expect(sc.length).toBeGreaterThan(0)
    expect(sc.some((x: any) => x.id === 'badger' && x.s === 1140 && x.e === 1860)).toBe(true)
  })
})

describe('slotBar agrees with the validator (picker parity)', () => {
  const pushAvalon = () => {
    const w = makeStandalone('avalon')
    DAYS[0].waves.push(w)
    const wi = DAYS[0].waves.length - 1
    DAYS[0].dutywaves = DAYS[0].dutywaves || []
    DAYS[0].dutywaves.push(waveDutyBlock(w))
    const dwi = DAYS[0].dutywaves.length - 1
    return { wi, dwi }
  }

  it('AVALON jet key: LL clear, OL bars with "overseas", ATT B bars', () => {
    // plasma is RCP — the rear seat, .w — so the seat rule stays out of the way
    const { wi } = pushAvalon()
    INPUTS.push({ person: 'plasma', date: 'Jul 13', allday: true, type: 'LL', remarks: '' })
    validate()
    expect(slotBar('plasma', `0.${wi}.0.0.w`)).toBe('')
    INPUTS.length = 0; JSON.parse(ISNAP).forEach((i: any) => INPUTS.push(i))
    INPUTS.push({ person: 'plasma', date: 'Jul 13', allday: true, type: 'OL', remarks: '' })
    validate()
    expect(/overseas/.test(slotBar('plasma', `0.${wi}.0.0.w`))).toBe(true)
    INPUTS.length = 0; JSON.parse(ISNAP).forEach((i: any) => INPUTS.push(i))
    INPUTS.push({ person: 'plasma', date: 'Jul 13', allday: true, type: 'ATT B', remarks: '' })
    validate()
    expect(slotBar('plasma', `0.${wi}.0.0.w`)).toBeTruthy()
  })

  it('AVALON desk key: ATT B clear, ATT C bars, LL clear, OL bars', () => {
    const { dwi } = pushAvalon()
    validate()
    expect(slotBar('xray', `d:0.${dwi}.0`)).toBe('')     // nobody planted yet, no input either
    INPUTS.push({ person: 'xray', date: 'Jul 13', allday: true, type: 'ATT B', remarks: '' })
    validate()
    expect(slotBar('xray', `d:0.${dwi}.0`)).toBe('')
    INPUTS.length = 0; JSON.parse(ISNAP).forEach((i: any) => INPUTS.push(i))
    INPUTS.push({ person: 'xray', date: 'Jul 13', allday: true, type: 'ATT C', remarks: '' })
    validate()
    expect(slotBar('xray', `d:0.${dwi}.0`)).toBeTruthy()
    INPUTS.length = 0; JSON.parse(ISNAP).forEach((i: any) => INPUTS.push(i))
    INPUTS.push({ person: 'xray', date: 'Jul 13', allday: true, type: 'LL', remarks: '' })
    validate()
    expect(slotBar('xray', `d:0.${dwi}.0`)).toBe('')
    INPUTS.length = 0; JSON.parse(ISNAP).forEach((i: any) => INPUTS.push(i))
    INPUTS.push({ person: 'xray', date: 'Jul 13', allday: true, type: 'OL', remarks: '' })
    validate()
    expect(slotBar('xray', `d:0.${dwi}.0`)).toBeTruthy()
  })

  it('an ordinary overnight duty row (non-noconf): tomorrow OL bars ending "(tomorrow)"; today only stays same-day', () => {
    DAYS[0].dutywaves[0].rows.push({ role: 'SDO', id: 'waldo', str: '1900', end: '0700' })
    const dwi = 0, ri = DAYS[0].dutywaves[0].rows.length - 1
    INPUTS.push({ person: 'waldo', date: 'Jul 14', allday: true, type: 'OL', remarks: '' })
    validate()
    const bar = slotBar('waldo', `d:0.${dwi}.${ri}`)
    expect(bar, bar).toMatch(/\(tomorrow\)$/)
    INPUTS.length = 0; JSON.parse(ISNAP).forEach((i: any) => INPUTS.push(i))
    INPUTS.push({ person: 'waldo', date: 'Jul 13', allday: true, type: 'OL', remarks: '' })
    validate()
    const bar2 = slotBar('waldo', `d:0.${dwi}.${ri}`)
    expect(bar2, bar2).toBeTruthy()
    expect(bar2.endsWith('(tomorrow)')).toBe(false)
  })
})

/* THE TAIL RUNS BOTH WAYS (11 Aug 26). The block above pins the FORWARD half —
   a window running past minute 1440 judging itself against tomorrow. This one
   pins the mirror: a window that opens BEFORE minute 0. A small-hours take-off
   does that on its own, with no overnight row involved, because the brief lead
   (140), the step (60) and the report lead (180) are all subtracted from the
   T/O — so a 00:30 launch briefs at 22:10 the previous evening. Before this,
   yesterday's inputs were unreachable from today's day.input and the clash was
   silent, while the identical case forwards flagged correctly. */
describe('the midnight tail, backwards (a small-hours take-off)', () => {
  /* Tuesday's first line, moved to a 00:30 launch; 'split' is idle all week. */
  const smallHours = () => {
    const f = DAYS[1].waves[0].formations[0]
    f.to = '00:30'; f.ld = '02:00'; f.br = ''
    f.aircraft[0].p = 'split'
    return f
  }

  it('a YESTERDAY-evening meeting clashes with a 0030 take-off', () => {
    smallHours()
    /* 22:00–23:45. The occupied window opens at the STEP, 23:30 the night
       before, so this genuinely overlaps it by 15 minutes. */
    INPUTS.push({ person: 'split', date: 'Jul 13', allday: false, s: 1320, e: 1425, type: 'Meeting', remarks: 'evening before' })
    const h = hits('INPUT_FLY', 'split')
    expect(h.length, JSON.stringify(h)).toBeGreaterThan(0)
    expect(h.some((x: any) => x.di === 1)).toBe(true)
  })

  /* the half-open boundary holds backwards exactly as it does forwards: a
     meeting ending at 23:30 ABUTS a step of 23:30 and must stay quiet. This
     caught a test of its own that was written one boundary out. */
  it('a meeting ending exactly at the step time does not clash', () => {
    smallHours()
    INPUTS.push({ person: 'split', date: 'Jul 13', allday: false, s: 1260, e: 1410, type: 'Meeting', remarks: 'abuts the step' })
    const h = hits('INPUT_FLY', 'split').filter((x: any) => x.di === 1)
    expect(h.length, JSON.stringify(h)).toBe(0)
  })

  it('a YESTERDAY all-day leave clashes with a 0030 take-off', () => {
    smallHours()
    INPUTS.push({ person: 'split', date: 'Jul 13', allday: true, type: 'OL', remarks: '' })
    const h = hits('LEAVE_FLY', 'split')
    expect(h.length, JSON.stringify(h)).toBeGreaterThan(0)
    expect(h.some((x: any) => x.di === 1)).toBe(true)
  })

  it('a yesterday-MORNING commitment does NOT reach a 0030 take-off', () => {
    smallHours()
    INPUTS.push({ person: 'split', date: 'Jul 13', allday: false, s: 540, e: 660, type: 'Meeting', remarks: 'morning before' })
    const h = hits('INPUT_FLY', 'split').filter((x: any) => x.di === 1)
    expect(h.length, JSON.stringify(h)).toBe(0)
  })

  it('an ORDINARY daytime sortie is untouched by the backward tail', () => {
    const f = DAYS[1].waves[0].formations[0]      // left at its seeded daytime hours
    f.aircraft[0].p = 'split'
    INPUTS.push({ person: 'split', date: 'Jul 13', allday: true, type: 'OL', remarks: '' })
    const h = hits('LEAVE_FLY', 'split').filter((x: any) => x.di === 1)
    expect(h.length, JSON.stringify(h)).toBe(0)
  })

  it("collectEvents marks yesterday's shifted copies pv, in negative minutes", () => {
    INPUTS.push({ person: 'split', date: 'Jul 13', allday: true, type: 'OL', remarks: '' })
    const pv = collectEvents()[1].input.filter((i: any) => i.pv && i.id === 'split')
    expect(pv.length).toBe(1)
    expect(pv[0].s).toBe(-1440)
    expect(pv[0].e).toBe(-1)
    /* an all-day copy still spans exactly 1439 minutes, so validate's
       timedInput filter treats it exactly as it treats the forward copy */
    expect(pv[0].e - pv[0].s).toBe(1439)
  })

  it('day 0 has no yesterday, and does not crash reaching for one', () => {
    expect(collectEvents()[0].input.some((i: any) => i.pv)).toBe(false)
  })

  it('the PICKER agrees with the warning list on a small-hours take-off', () => {
    const f = smallHours()
    f.aircraft[0].p = ''                                  // leave the seat open to ask about it
    INPUTS.push({ person: 'split', date: 'Jul 13', allday: true, type: 'OL', remarks: '' })
    const bar = slotBar('split', '1.0.0.0.p')
    expect(bar, bar).toBeTruthy()
    expect(bar.endsWith('(yesterday)')).toBe(true)
  })

  it('the picker does NOT say yesterday for an ordinary daytime seat', () => {
    DAYS[1].waves[0].formations[0].aircraft[0].p = ''
    INPUTS.push({ person: 'split', date: 'Jul 13', allday: true, type: 'OL', remarks: '' })
    const bar = slotBar('split', '1.0.0.0.p')
    expect(String(bar).endsWith('(yesterday)')).toBe(false)
  })
})

/* AN ABSENCE THAT CROSSES MIDNIGHT (owner, 11 Aug 26). Personal inputs were the
   one row type that could not be typed across midnight — both entry paths
   refused an end before the start, and mapInp was the one event build that did
   not route its window through a roll, so such a record matched nothing even if
   it arrived some other way. Now it rolls through inpWin like everything else,
   and the two tails carry its second half onto the neighbouring day. */
describe('an overnight personal absence', () => {
  it('rolls into a single forward window rather than an inverted one', () => {
    INPUTS.push({ person: 'split', date: 'Jul 13', allday: false, s: 1320, e: 120, type: 'Meeting', remarks: 'overnight' })
    const mine = collectEvents()[0].input.filter((i: any) => i.id === 'split' && !i.nx && !i.pv)
    expect(mine.length).toBe(1)
    expect(mine[0].s).toBe(1320)
    expect(mine[0].e).toBe(1560)          // 02:00 the next day, not 120
  })

  it('clashes with a night sortie it genuinely overlaps', () => {
    const f = DAYS[0].waves[0].formations[0]
    f.to = '23:00'; f.ld = '00:45'; f.br = ''
    f.aircraft[0].p = 'split'
    INPUTS.push({ person: 'split', date: 'Jul 13', allday: false, s: 1320, e: 120, type: 'Meeting', remarks: 'overnight' })
    const h = hits('INPUT_FLY', 'split')
    expect(h.length, JSON.stringify(h)).toBeGreaterThan(0)
  })

  it('its after-midnight half reaches the NEXT day through the backward tail', () => {
    INPUTS.push({ person: 'split', date: 'Jul 13', allday: false, s: 1320, e: 120, type: 'Meeting', remarks: 'overnight' })
    /* on Tuesday the same record arrives shifted −1440, so its 00:00–02:00 half
       lands on Tuesday's own early minutes */
    const pv = collectEvents()[1].input.filter((i: any) => i.pv && i.id === 'split')
    expect(pv.length).toBe(1)
    expect(pv[0].s).toBe(-120)
    expect(pv[0].e).toBe(120)
  })

  it('the picker agrees — an overnight absence bars an early Tuesday duty', () => {
    DAYS[1].dutywaves[0].rows.push({ role: 'SDO', id: '', str: '0100', end: '0300' })
    const ri = DAYS[1].dutywaves[0].rows.length - 1
    INPUTS.push({ person: 'split', date: 'Jul 13', allday: false, s: 1320, e: 120, type: 'OD', remarks: 'overnight' })
    const bar = slotBar('split', `d:1.0.${ri}`)
    expect(bar, bar).toBeTruthy()
  })
})
