/* AN ABSENCE THAT COVERS THE WHOLE DAY DOES NOT NEED THE SEAT'S TIMES ([BLANK-TIMES-ABSENCE], owner D605, 6 Oct 26 —
   "4 yes as recommended": a man who is on leave or grounded for the whole day is flagged the moment he is seated
   anywhere that day, on a line or row with no times yet too; a part-day absence against a seat with no times stays
   silent — nothing to compare).

   Every absence check asked whether the absence OVERLAPS the seat's hours. "+ Line", "+ Wave", a new duty, sim, ground
   or programme row and a BB shift all come up with no hours, a comparison with a time that is not there is false, and
   so the day's list said nothing — the struck name in the crew list was the only warning — until a time was typed.

   What this pins, one kind of seat at a time (the roll-call is the SEATS table below — a test of this rule walks every
   kind by name, never one fixture):
     - THE SAME ANSWER WITH AND WITHOUT TIMES, for every one of the app's input types on every kind of seat: the codes a
       whole-day input raises against a seat with no times are exactly the codes it raises once times are typed. That
       one loop is what keeps each kind's exemptions as they were — a local leave on a standby SPARE, ATT B at a desk,
       a Meeting's amber voice on an SC MAIN, an upchit and a SANS offer saying nothing;
     - the half left as it was: a PART-day absence against a seat with no times is silent on every kind; so is
       tomorrow's or yesterday's whole-day absence; an info-only row, a cancelled row and a placeholder puck;
     - an all-day request already put on the programme is not flagged against its OWN row (that row has no times by
       construction — inputs.ts inputFlags), while a second man on that row with his own leave is;
     - the sentence: no clock that is not there, and "this line" / "this duty row" (sim, ground) where the seat has no
       name yet either — each kind its own words, so a man on three unnamed rows is three lines.

   The blank shapes are the app's own: board.ts addLine for the flying line, waves.ts makeStandalone for SC and BB (BB
   comes up with no shift times), dutytpl.ts blockFromTpl for the BB desk. The browser test drives the real buttons
   (e2e/blankabsence.spec.ts). Snapshot / restore of DAYS and INPUTS follows restblank.test.ts. */
import { beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from './data'
import { INPUTS, INPUT_TYPES, isAway, canSpare } from './inputs'
import { validate, WARN, chipOf } from './validate'
import { makeStandalone } from './waves'
import { PEOPLE } from './people'
import { slotBar } from './avail'
import { acceptInput, unacceptInput } from './slots'
import { addTpl, delTpl, setTplWave, setTplRow, blockFromTpl } from './dutytpl'

const X = 'split'          // idle across the seed week, no input of his own, SC DAY and NIGHT current, not SANS
const Y = 'bullet'         // the other idle man
const MON = 0, TUE = 1, WED = 2
const DT: any = {}
const DSNAP = JSON.stringify(DAYS), ISNAP = JSON.stringify(INPUTS)
beforeEach(() => {
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
  DT[MON] = (DAYS[MON] as any).dt; DT[TUE] = (DAYS[TUE] as any).dt; DT[WED] = (DAYS[WED] as any).dt
})
const day = (): any => DAYS[TUE]

/* the three absence sentences, and the amber voice a Meeting has on an SC MAIN */
const OURS = ['LEAVE_FLY', 'DNIF_FLY', 'INPUT_FLY', 'SHIFT_SOFT']
const abs = (id = X) => validate().all.filter((w: any) => w.di === TUE && (w.who || []).includes(id) && OURS.includes(w.code))
const codes = (id = X) => abs(id).map((w: any) => `${w.sev}:${w.code}`).sort()
const file = (type: string, more: any = {}, who = X, di = TUE) => {
  const r: any = { person: who, date: DT[di], allday: true, type, remarks: '', mod: '', ...more }
  INPUTS.push(r); return r
}

/* ---- THE ROLL-CALL: every kind of seat a man can be put on, each minted with NO times -------------------------------
   `make` builds the empty seat and answers its key; `seat` puts a man in it; `time` types hours on it. */
type Seat = { key: string, seat: (id?: string) => void, time: () => void, row?: any }
const flyLine = (cs = '', msn = ''): Seat => {
  const f: any = { cs, msn, to: '', ld: '', aircraft: [{ p: '', w: '', area: '', rmks: '', opts: {} }] }
  day().waves.push({ label: 'ZB', night: false, intimes: [], traffic: [], formations: [f] })
  const gi = day().waves.length - 1
  return { key: `${TUE}.${gi}.0.0.p`, seat: (id = X) => { f.aircraft[0].p = id }, time: () => { f.to = '14:00'; f.ld = '15:30' }, row: f }
}
const standalone = (kind: 'sc' | 'bb', ai: number): Seat => {
  const w: any = makeStandalone(kind), f = w.formations[0]
  f.to = ''; f.ld = ''                                    // SC is minted 07:00–13:00 — cleared; BB is minted blank
  day().waves.push(w); const gi = day().waves.length - 1
  return { key: `${TUE}.${gi}.0.${ai}.p`, seat: (id = X) => { f.aircraft[ai].p = id },
    time: () => { f.to = kind === 'sc' ? '07:00' : '20:00'; f.ld = kind === 'sc' ? '13:00' : '04:00' }, row: f }
}
const bbDesk = (): Seat => {
  const t = addTpl('BB desk')!
  setTplWave(t.id, 'bb'); setTplRow(t.id, 0, 'role', 'SXO'); setTplRow(t.id, 0, 'str', ''); setTplRow(t.id, 0, 'end', '')
  const blk: any = blockFromTpl(t.id)
  delTpl(t.id)                                            // the library is capped; the block is what the day keeps
  blk.rows[0].str = ''; blk.rows[0].end = ''
  day().dutywaves.push(blk); const dwi = day().dutywaves.length - 1
  return { key: `d:${TUE}.${dwi}.0`, seat: (id = X) => { blk.rows[0].id = id }, time: () => { blk.rows[0].str = '20:00'; blk.rows[0].end = '04:00' }, row: blk.rows[0] }
}
const dutyRow = (extra = false): Seat => {
  const r: any = { role: 'SDO', id: '', str: '', end: '' }
  day().dutywaves.push({ label: '3rd wave', rows: [r] }); const dwi = day().dutywaves.length - 1
  return { key: `d:${TUE}.${dwi}.0`, seat: (id = X) => { if (extra) { r.id = 'boosh'; r.more = [id] } else r.id = id },
    time: () => { r.str = '17:00'; r.end = '19:00' }, row: r }
}
const simSeat = (extra = false): Seat => {
  const s: any = { label: 'EP-9', str: '', end: '', p: '', w: '' }
  day().sims.oft.push(s); const ri = day().sims.oft.length - 1
  return { key: `s:${TUE}.oft.${ri}.p`, seat: (id = X) => { if (extra) s.more = [id]; else s.p = id },
    time: () => { s.str = '16:00'; s.end = '17:30' }, row: s }
}
const groundRow = (extra = false, prog = 'RANGE SWEEP'): Seat => {
  const g: any = { prog, str: '', end: '', who: '' }
  day().ground.push(g); const ri = day().ground.length - 1
  return { key: `g:${TUE}.${ri}`, seat: (id = X) => { if (extra) g.more = [id]; else g.who = id },
    time: () => { g.str = '15:00'; g.end = '16:00' }, row: g }
}
const progRow = (): Seat => {
  const a: any = { prog: 'DINING-IN', str: '', end: '', who: [] }
  day().allhands.push(a); const ri = day().allhands.length - 1
  return { key: `a:${TUE}.${ri}`, seat: (id = X) => { a.who = [id] }, time: () => { a.str = '18:00'; a.end = '19:00' }, row: a }
}
const SEATS: Record<string, () => Seat> = {
  'a flying line ("+ Line")': () => flyLine(),
  'an SC MAIN seat': () => standalone('sc', 0),
  'an SC SPARE seat': () => standalone('sc', 2),
  'a BB MAIN seat': () => standalone('bb', 0),
  'a BB SPARE seat': () => standalone('bb', 2),
  'a BB desk': bbDesk,
  'a duty desk': () => dutyRow(),
  'a duty desk, added under the row': () => dutyRow(true),
  'a sim seat': () => simSeat(),
  'a sim row, added under the row': () => simSeat(true),
  'a ground row': () => groundRow(),
  'a ground row, added under the row': () => groundRow(true),
  'a Common Programme row': progRow,
}

describe('the fixtures are the seats they claim to be', () => {
  it('every seat with times typed is flagged for a whole-day overseas leave (so the timed half of each comparison is real)', () => {
    for (const [name, make] of Object.entries(SEATS)) {
      DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
      INPUTS.length = 0; JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
      const s = make(); s.seat(); s.time(); file('OL')
      expect(codes(), name).toEqual(['hard:LEAVE_FLY'])
    }
  })
})

describe('D605 — a whole-day absence is flagged on a seat with no times, exactly as it is once times are typed', () => {
  for (const [name, make] of Object.entries(SEATS)) {
    it(`${name}: every input type raises the same codes with and without times`, () => {
      for (const type of INPUT_TYPES) {
        DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
        INPUTS.length = 0; JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
        const s = make(); s.seat()
        file(type, type === 'SANS Availability' ? { sans: { f: true, o: true, a: true } } : {})
        const blank = codes()
        s.time()
        expect(blank, `${name} · ${type} — no times, against times typed`).toEqual(codes())
      }
    })
  }

  it('a leave, a downchit and an overseas duty each say so on a blank flying line — the red line, the ring, the C chip', () => {
    for (const [type, code, words] of [['LL', 'LEAVE_FLY', 'On leave but planned to fly this line'],
      ['OL', 'LEAVE_FLY', 'On leave but planned to fly this line'], ['ATT C', 'DNIF_FLY', 'Downchit but planned to fly this line'],
      ['ATT B', 'DNIF_FLY', 'Downchit but planned to fly this line'], ['OD', 'INPUT_FLY', 'OD clashes with this line']] as any[]) {
      DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
      INPUTS.length = 0; JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
      const s = flyLine(); s.seat(); file(type)
      const a = abs()
      expect(a.length, type).toBe(1)
      expect(a[0].code, type).toBe(code)
      expect(a[0].sev, type).toBe('hard')
      expect(a[0].msg, type).toBe(words)
      expect(a[0].key, `${type} — a tap on the warning goes to his seat`).toBe(s.key)
      expect(WARN.sev[TUE] && WARN.sev[TUE][X], `${type} — the red ring`).toBe('hard')
      expect(chipOf(TUE, X), `${type} — the C chip`).toBe('C')
    }
  })
})

/* THE EXACT ANSWER, not only "the same with and without times" — two equally wrong answers would pass that loop
   (Astra's scenario read, S16 and its finding F1: an Upchit was flagged on a timed seat AND on a blank one, so the
   comparison agreed). One row per group of input types, one column per family of seat; every cell is asked of a seat
   with no times and again once times are typed. */
describe('the oracle — what each input type says on each kind of seat, with no times and with times', () => {
  const FLY = ['a flying line ("+ Line")'], MAIN = ['an SC MAIN seat'], SPARE = ['an SC SPARE seat']
  const BBJ = ['a BB MAIN seat', 'a BB SPARE seat'], DESK = ['a BB desk']
  const WORK = ['a duty desk', 'a duty desk, added under the row', 'a sim seat', 'a sim row, added under the row', 'a ground row', 'a ground row, added under the row', 'a Common Programme row']
  const L = ['hard:LEAVE_FLY'], M = ['hard:DNIF_FLY'], I = ['hard:INPUT_FLY'], SOFT = ['adv:SHIFT_SOFT'], NONE: string[] = []
  type Row = [string[], string[], string[], string[], string[], string[], string[]]       // types · fly · SC MAIN · SC SPARE · BB jet · other work · BB desk
  const ORACLE: Row[] = [
    [['LL', 'OIL', 'CCL', 'PL', 'FCL', 'EL', 'CL'], L, L, NONE, NONE, L, NONE],            // local leave: may stand a standby place
    [['OL'], L, L, L, L, L, L],                                                            // overseas: nothing
    [['HL', 'OML', 'ATT C'], M, M, M, M, M, M],                                            // medically down: nothing
    [['ATT B'], M, M, M, M, NONE, NONE],                                                   // grounded, not absent: no jet seat, any desk
    [['OD'], I, I, L, L, I, L],                                                            // overseas duty: out of reach (a standby place words it as its own look does)
    [['Training', 'CSE', 'Fly with', 'Personal', 'Appointment', 'Duty', 'Event', 'Other'], I, I, NONE, NONE, I, NONE],   // Event joined 9 Oct 26 (D713, D714): red, as these
    [['Meeting'], I, SOFT, NONE, NONE, I, NONE],                                           // the one soft type on an SC MAIN
    [['SANS Availability'], NONE, NONE, NONE, NONE, NONE, NONE],                           // an offer, not an absence
    [['Upchit'], NONE, NONE, NONE, NONE, NONE, NONE],                                      // a paperwork record: fit again
  ]
  it('the table names every input type the app has', () => {
    expect(ORACLE.flatMap(r => r[0]).sort()).toEqual([...INPUT_TYPES].sort())
  })
  const COLS: Array<[string, string[], number]> = [['a flying line', FLY, 1], ['an SC MAIN seat', MAIN, 2], ['an SC SPARE seat', SPARE, 3], ['an AVALON / BB jet seat', BBJ, 4], ['a desk, a sim, a ground or programme row', WORK, 5], ['an AVALON / BB desk', DESK, 6]]
  for (const [col, seats, ix] of COLS) {
    it(`${col}: every input type, on a seat with no times and with times`, () => {
      for (const name of seats) for (const row of ORACLE) for (const type of row[0]) {
        DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
        INPUTS.length = 0; JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
        const s = SEATS[name](); s.seat()
        file(type, type === 'SANS Availability' ? { sans: { f: true, o: true, a: true } } : {})
        expect(codes(), `${name} · ${type} — no times`).toEqual(row[ix])
        s.time()
        expect(codes(), `${name} · ${type} — times typed`).toEqual(row[ix])
      }
    })
  }
})

describe('the puck — on every kind of seat the man wears the red ring and the C chip', () => {
  for (const [name, make] of Object.entries(SEATS)) {
    it(`${name}: a whole-day downchit rings him red, before any time is typed`, () => {
      const s = make(); s.seat(); validate()
      expect(WARN.sev[TUE] && WARN.sev[TUE][X], 'the fixture: nothing on him before the absence').toBeFalsy()
      file('ATT C'); validate()
      expect(abs().length, name).toBe(1)
      expect(WARN.sev[TUE] && WARN.sev[TUE][X], `${name} — the red ring`).toBe('hard')
      expect(chipOf(TUE, X), `${name} — the C chip`).toBe('C')
    })
  }
})

describe('the sentence — nothing printed that is not there', () => {
  it('a line with a callsign and no times is named, and the sentence does not change when times are typed', () => {
    const s = flyLine('ZB', 'BFM'); s.seat(); file('LL', { remarks: 'Wedding' })
    const before = abs()
    expect(before.map((w: any) => w.msg)).toEqual(['On leave but planned to fly ZB BFM — reason: Wedding'])
    s.time()
    expect(abs().map((w: any) => w.msg), 'said once, in the same words').toEqual(before.map((w: any) => w.msg))
  })

  it('a landing typed with no take-off is still a line with nothing to compare — he is flagged', () => {
    const s = flyLine(); s.seat(); s.row.ld = '15:00'; file('ATT C')
    expect(codes()).toEqual(['hard:DNIF_FLY'])
  })

  it('a row with no name yet reads "this ground row"; with a name, its name', () => {
    const g = groundRow(false, ''); g.seat(); file('LL')
    expect(abs().map((w: any) => w.msg)).toEqual(['On leave but tasked — this ground row'])
    g.row.prog = 'RANGE SWEEP'
    expect(abs().map((w: any) => w.msg)).toEqual(['On leave but tasked — RANGE SWEEP'])
    expect(abs()[0].key).toBe(g.key)
  })

  it('one man on three brand-new rows — a duty row, a sim row, a ground item, no names, no times — is THREE lines', () => {
    /* walkers A (H-02) and B: the list folds identical sentences into one line, so "this row" three times was one
       line for three places (all three pucks ringed, the count rose by one) — and adding the second row made the
       first one's line seem to go. Each kind names itself. */
    const d = dutyRow(); d.row.role = ''; d.seat(); const s = simSeat(); s.row.label = ''; s.seat(); const g = groundRow(false, ''); g.seat()
    file('OL')
    expect(abs().map((w: any) => w.msg).sort()).toEqual(['On leave but tasked — this duty row', 'On leave but tasked — this ground row', 'On leave but tasked — this sim row'])
    expect(abs().map((w: any) => w.key).sort(), 'each line goes to its own row').toEqual([d.key, g.key, s.key.replace(/\.p$/, '')].sort())
  })

  it('a row REALLY named "Sim" or "duty" keeps its name — two rows, two lines, each to its own row', () => {
    /* Sol 6.1's read, F2: the fallback took the bare words "Sim" and "duty" for "no name" on EVERY kind of row, so a
       Ground Programme item titled "Sim" and another titled "duty" both read "this ground row" — and the list folded
       the two into one line. Only a SIM row's bare "Sim" and a DUTY row's bare "duty" are the engine's own padding. */
    const g1 = groundRow(false, 'Sim'); g1.seat(); const g2 = groundRow(false, 'duty'); g2.seat()
    file('LL')
    expect(abs().map((w: any) => w.msg).sort()).toEqual(['On leave but tasked — Sim', 'On leave but tasked — duty'])
    expect(abs().map((w: any) => w.key).sort()).toEqual([g1.key, g2.key].sort())
    g1.row.str = '09:00'; g1.row.end = '10:00'; g2.row.str = '11:00'; g2.row.end = '12:00'
    expect(abs().map((w: any) => w.msg).sort(), 'with hours typed').toEqual(['On leave but tasked — Sim', 'On leave but tasked — duty'])
    expect(abs().map((w: any) => w.key).sort()).toEqual([g1.key, g2.key].sort())
  })

  it('…the same on the Common Programme', () => {
    const p1 = progRow(); p1.row.prog = 'Sim'; p1.seat(); const p2 = progRow(); p2.row.prog = 'duty'; p2.seat()
    file('OL')
    expect(abs().map((w: any) => w.msg).sort()).toEqual(['On leave but tasked — Sim', 'On leave but tasked — duty'])
    p1.time(); p2.row.str = '20:00'; p2.row.end = '21:00'
    expect(abs().map((w: any) => w.msg).sort(), 'with hours typed').toEqual(['On leave but tasked — Sim', 'On leave but tasked — duty'])
  })

  it('a sim row and a duty row with no name yet say which row — not "Sim " or " duty" — with and without times', () => {
    /* Astra's scenario read, F4: the engine builds these labels as 'Sim ' + its name and its role + ' duty', so an
       unnamed row's label was not empty and the hole was printed. A new row comes up with no name AND no times. */
    const d = dutyRow(); d.row.role = ''; d.seat(); const s = simSeat(); s.row.label = ''; s.seat(Y)
    file('LL'); file('ATT C', {}, Y)
    expect(abs().map((w: any) => w.msg)).toEqual(['On leave but tasked — this duty row'])
    expect(abs(Y).map((w: any) => w.msg)).toEqual(['Downchit but tasked — this sim row'])
    d.time(); s.time()
    expect(abs().map((w: any) => w.msg), 'the same sentence once times are typed').toEqual(['On leave but tasked — this duty row'])
    expect(abs(Y).map((w: any) => w.msg)).toEqual(['Downchit but tasked — this sim row'])
  })

  it('an AVALON / BB desk with no role yet reads "this duty row" as well — never "on  duty"', () => {
    /* walker A, H-01: a BB desk made from a template with no role typed printed "OL but on  duty — overseas", with
       hours and without (the standby look had its own sentence, outside the fallback) */
    const d = bbDesk(); d.row.role = ''; d.seat(); file('OL')
    expect(abs().map((w: any) => w.msg)).toEqual(['OL but on this duty row — overseas'])
    d.time()
    expect(abs().map((w: any) => w.msg), 'the same sentence with its hours typed').toEqual(['OL but on this duty row — overseas'])
    d.row.role = 'SXO'
    expect(abs().map((w: any) => w.msg)).toEqual(['OL but on SXO duty — overseas'])
  })

  it('a duty desk, a sim seat and a Common Programme row use the words their timed rows use', () => {
    const d = dutyRow(); d.seat(); const s = simSeat(); s.seat(Y); const p = progRow(); p.seat()
    file('ATT C'); file('LL', {}, Y)
    expect(abs().map((w: any) => w.msg).sort()).toEqual(['Downchit but tasked — DINING-IN', 'Downchit but tasked — SDO duty'])
    expect(abs(Y).map((w: any) => w.msg)).toEqual(['On leave but tasked — Sim EP-9'])
  })

  it('an SC MAIN with its shift times cleared: a Meeting keeps its amber voice and prints no clock', () => {
    const s = standalone('sc', 0); s.seat(); file('Meeting')
    const a = abs()
    expect(a.map((w: any) => `${w.sev}:${w.code}`)).toEqual(['adv:SHIFT_SOFT'])
    expect(a[0].msg).toBe(`${PEOPLE[X].cs} is on SC AM and also down for Meeting`)
  })

  it('the standby lines keep their own words: an SC SPARE, a BB seat, a BB desk', () => {
    const sp = standalone('sc', 2); sp.seat(); file('OL')
    expect(abs().map((w: any) => w.msg)).toEqual(['OL but standing SC SPARE — overseas, SC AM'])
    const b = standalone('bb', 0); b.seat(Y); const d = bbDesk(); d.seat(Y); file('ATT C', {}, Y)
    expect(abs(Y).map((w: any) => w.msg).sort()).toEqual(['ATT C but on BB SHIFT — medically down', 'ATT C but on SXO duty — medically down'])
  })

  it('no sentence of these rules prints a clock that is not there, on any kind of seat', () => {
    for (const [name, make] of Object.entries(SEATS)) for (const type of ['LL', 'OL', 'ATT C', 'ATT B', 'OD', 'CSE', 'Meeting']) {
      DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
      INPUTS.length = 0; JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
      const s = make(); s.seat(); file(type)
      abs().forEach((w: any) => expect(w.msg, `${name} · ${type}`).not.toMatch(/NaN|Infinity|undefined/))
    }
  })
})

describe('the half left as it was — nothing to compare stays silent', () => {
  for (const [name, make] of Object.entries(SEATS)) {
    it(`${name}: a morning-only leave, and a whole-day leave on the day before or after, raise nothing`, () => {
      const s = make(); s.seat()
      file('OL', { allday: false, half: 'am', s: 0, e: 720 })
      expect(codes(), 'AM half').toEqual([])
      INPUTS.pop(); file('ATT C', { allday: false, s: 600, e: 720 })
      expect(codes(), 'two hours').toEqual([])
      INPUTS.pop(); file('OL', {}, X, WED)
      expect(codes(), "tomorrow's whole day").toEqual([])
      INPUTS.pop(); file('OL', {}, X, MON)
      expect(codes(), "yesterday's whole day").toEqual([])
    })
  }

  it('an absence typed 00:00–23:59 by hand covers the whole day and is flagged like the All day tick', () => {
    const s = flyLine(); s.seat(); file('LL', { allday: false, s: 0, e: 1439 })
    expect(codes()).toEqual(['hard:LEAVE_FLY'])
  })

  it('an info-only row, a cancelled row and a cancelled line are still never checked', () => {
    const g = groundRow(); g.seat(); g.row.info = true
    const p = progRow(); p.seat(); p.row.cx = true
    const f = flyLine(); f.seat(); f.row.cx = true
    const d = dutyRow(); d.seat(); d.row.cx = true
    file('OL')
    expect(codes()).toEqual([])
  })

  it('a placeholder puck is nobody — ALL AVAIL on a blank row raises nothing for anyone', () => {
    const p = progRow(); p.seat('allavail'); const g = groundRow(); g.seat('all')
    file('OL')
    expect(validate().all.filter((w: any) => w.di === TUE && OURS.includes(w.code) && /DINING-IN|RANGE SWEEP/.test(w.msg))).toEqual([])
  })

  it('a row with a start and no end already had hours (the open-ended default) — its answer is unchanged', () => {
    const g = groundRow(); g.seat(); g.row.str = '15:00'; file('LL', { allday: false, s: 600, e: 720 })
    expect(codes(), 'a morning absence against a 15:00 row').toEqual([])
    INPUTS.pop(); file('LL', { allday: false, s: 900, e: 960 })
    expect(codes(), 'an absence across its start').toEqual(['hard:LEAVE_FLY'])
  })

  it('a standby line with no shift times still asks nothing about currency or two places — only the whole-day absence speaks', () => {
    const b = standalone('bb', 0); b.seat(); b.row.aircraft[2].p = X
    const before = validate().all.filter((w: any) => w.di === TUE && (w.who || []).includes(X))
    expect(before, 'no absence filed: nothing at all').toEqual([])
    file('OL')
    const after = validate().all.filter((w: any) => w.di === TUE && (w.who || []).includes(X))
    expect(after.map((w: any) => w.code), 'one line for the two seats — the same words').toEqual(['LEAVE_FLY'])
  })
})

/* Astra's scenario read, F1 — found by reading, reproduced, OLD (the same on the live app for a seat WITH times): an
   Upchit says the man is fit AGAIN, yet it reached the day's inputs through the accepted-row fall-through of
   events.ts inpShow (inputFlags turns it away; "no landed row" then let it back in) and read "Upchit clashes with …" /
   "Upchit but tasked — …" on the very day he was cleared. D605 would have carried that to every seat with no times. */
describe('an Upchit is a paperwork record, never an absence — on no seat, with times or without', () => {
  it('the day he is cleared fit: nothing on a timed flying line, a blank one, a timed ground row, a blank one', () => {
    const f = flyLine('ZL', 'BFM'); f.seat(); f.time(); const g = groundRow(); g.seat(); g.time()
    const f2 = flyLine(); f2.seat(); const g2 = groundRow(false, 'ADMIN'); g2.seat()
    file('Upchit', { remarks: 'fit' })
    expect(validate().all.filter((w: any) => w.di === TUE && (w.who || []).includes(X) && /Upchit/.test(w.msg))).toEqual([])
    expect(codes()).toEqual([])
  })
})

/* Astra's scenario read, F2 — a request typed 00:00–23:59 (or to 24:00) instead of the All day tick, then put on the
   Ground Programme, defers to its landed row (events.ts inpShow — a TIMED accept speaks as its row, so a clash is said
   once). A seat with no hours cannot be clashed with by that row, so the whole-day request went silent against it the
   moment it was accepted — where the All day tick kept its voice. A seat with no hours asks the undeferred list. */
describe('a whole-day request put on the programme still counts against his OTHER seat with no times', () => {
  for (const [name, e] of [['00:00–23:59', 1439], ['00:00–24:00', 1440]] as Array<[string, number]>) {
    it(`Training typed ${name}, accepted onto the Ground Programme: flagged on a blank flying line, desk, sim and SC MAIN — before and after`, () => {
      for (const seat of ['a flying line ("+ Line")', 'a duty desk', 'a sim seat', 'an SC MAIN seat', 'a Common Programme row']) {
        DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
        INPUTS.length = 0; JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
        const inp = file('Training', { allday: false, s: 0, e, remarks: 'CRM' })
        const s = SEATS[seat](); s.seat()
        expect(codes(), `${seat} — before it is accepted`).toEqual(['hard:INPUT_FLY'])
        expect(acceptInput(TUE, inp, 'g'), 'the request lands').toBe(true)
        expect(codes(), `${seat} — after it is accepted`).toEqual(['hard:INPUT_FLY'])
        /* taken off the programme it is dormant, and says nothing anywhere */
        expect(unacceptInput(TUE, inp), 'taken off').toBeTruthy()
        expect(codes(), `${seat} — taken off`).toEqual([])
      }
    })
  }

  it('…and never against its OWN landed row — with the row\'s hours as landed, and with them cleared', () => {
    const inp = file('Training', { allday: false, s: 0, e: 1439, remarks: 'CRM' })
    expect(acceptInput(TUE, inp, 'g')).toBe(true)
    const row: any = day().ground[day().ground.length - 1]
    expect(row.str, 'a timed request lands a row with its hours').toBeTruthy()
    expect(codes(), 'his own request, on its own row').toEqual([])
    row.str = ''; row.end = ''
    expect(codes(), 'the row\'s hours cleared: still his own request').toEqual([])
  })

  it('a Meeting typed 00:00–23:59 and accepted keeps its amber voice on a blank SC MAIN', () => {
    const inp = file('Meeting', { allday: false, s: 0, e: 1439 })
    const s = standalone('sc', 0); s.seat()
    expect(acceptInput(TUE, inp, 'g')).toBe(true)
    expect(codes()).toEqual(['adv:SHIFT_SOFT'])
  })
})

describe('a request already on the programme is not flagged against its own row', () => {
  it('an all-day Training put on the Ground Programme: its own man is not "Training but tasked" on its own time-less row', () => {
    const inp = file('Training', { remarks: 'CRM refresher' })
    expect(acceptInput(TUE, inp, 'g'), 'the request lands').toBe(true)
    const row: any = day().ground[day().ground.length - 1]
    expect(row.str || '', 'an all-day request makes a row with no times').toBe('')
    expect(codes(), 'his own request, on its own row').toEqual([])
    /* a second man the scheduler adds under that row, on leave all day himself, IS flagged */
    row.more = [Y]; file('LL', {}, Y)
    expect(codes(Y)).toEqual(['hard:LEAVE_FLY'])
    /* and a different whole-day absence of the first man is one too */
    file('ATT C')
    expect(codes()).toEqual(['hard:DNIF_FLY'])
  })
})

/* BEFORE AND AFTER HE IS SEATED. The crew list reads a seat with no hours as UNKNOWN and fails closed: any ABSENCE that
   day — a leave, a medical downchit, an overseas duty: the types that strike a name — strikes it (avail.ts slotBar,
   "unknown is not never-clashes"; pinned in slotrules.test.ts). So the promise that holds is one-way and about those
   types: NO MAN THE LIST FLAGS FOR AN ABSENCE WAS OFFERED CLEAN. For every seat that is not a standby place the two
   agree exactly on a whole-day absence. (A whole-day ACTIVITY — a course, a meeting — is another matter, pinned in the
   last test of this block: the crew list only ever advised against one where the seat has hours, so on a seat with
   none it says nothing before and the list flags after. Astra's read, F2; filed as [BLANK-SEAT-ACTIVITY-HINT].) On a standby place with no shift times the crew list is stricter than the
   rule: it strikes a man on LOCAL leave, whom the warning list — with hours or without — lets stand by. That is the
   crew list's own old reading of a blank shift (it tells standby places apart by their hours), left as it was here
   and filed as [BLANK-STANDBY-STRIKE]; a part-day absence is the same shape by his ruling (struck before, silent
   after — nothing to compare). */
describe('the crew list and the warning list on a seat with no times', () => {
  const STANDBY = ['an SC SPARE seat', 'a BB MAIN seat', 'a BB SPARE seat']
  for (const [name, make] of Object.entries(SEATS)) {
    it(`${name}: a man the list flags for a whole-day absence was struck in the crew list before he was seated`, () => {
      for (const type of ['LL', 'OL', 'HL', 'OML', 'ATT C', 'ATT B', 'OD', 'OIL']) {
        DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
        INPUTS.length = 0; JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
        const s = make(); const r = file(type); validate()
        expect(isAway(r), `${type} is an absence`).toBe(true)
        const struck = slotBar(X, s.key) !== ''
        s.seat()
        const flagged = abs().length > 0
        if (flagged) expect(struck, `${name} · ${type} — flagged after, so struck before`).toBe(true)
        if (STANDBY.includes(name) && canSpare(type)) {
          expect([struck, flagged], `${name} · ${type} — the filed gap: struck before, nothing after`).toEqual([true, false])
          s.time(); validate()
          expect(abs(), `${name} · ${type} — and nothing once the hours are typed`).toEqual([])
        } else expect(flagged, `${name} · ${type} — struck before (${struck}), flagged after`).toBe(struck)
      }
    })
  }

  it('a whole-day ACTIVITY (a course) on a seat with no times: the crew list says nothing before — the list flags after (the filed gap)', () => {
    const s = flyLine(); const r = file('Training'); validate()
    expect(isAway(r), 'a course is a commitment, not an absence').toBe(false)
    expect(slotBar(X, s.key), 'the crew list: no reason against him').toBe('')
    s.seat()
    expect(codes(), 'the day\'s list, the moment he is seated').toEqual(['hard:INPUT_FLY'])
    /* with hours on the seat the crew list does advise ("already on Training") — the difference is the missing hours */
    s.row.aircraft[0].p = ''; s.time(); validate()
    expect(slotBar(X, s.key)).toMatch(/already on Training/)
  })
})
