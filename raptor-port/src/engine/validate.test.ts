/* Ported from reference/tfin.js — group F (validation engine), the B53 #8
   offer exemption, the T-group SC-currency flow and the X-group shift
   behaviour. Source-text pins are re-expressed against the live objects. */
import { beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from './data'
import { INPUTS } from './inputs'
import { PEOPLE, isSpecial, scQualOK } from './people'
import { VCONF, SHIFT_HARD } from './rules'
import { validate, WARN, WCODE, CHIP_LABEL, CHIP_TEXT, chipText, RANK, SEVWORD, REST, restClear } from './validate'
import { collectEvents } from './events'
import { makeStandalone } from './waves'
import { setSlotVal, txtSet } from './slots'
import { SCHED } from './publish'

const DSNAP = JSON.stringify(DAYS)
const ISNAP = JSON.stringify(INPUTS)
beforeEach(() => {
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((i: any) => INPUTS.push(i))
  SCHED.pending = {}; SCHED.changes = {}; SCHED.als = []
  validate()
})

describe('validation engine (tfin F)', () => {
  it('validate returns WARN shape', () => {
    const W = validate()
    expect(W && Array.isArray(W.all) && Array.isArray(W.byDay) && !!W.sev && !!W.chip).toBe(true)
    expect(WARN).toBe(W)
  })

  it('byDay covers every day', () => {
    expect(validate().byDay.length).toBe(DAYS.length)
  })

  const SEV = ['hard', 'adv', 'note']
  const CODES = ['DOUBLE_BOOK', 'DNIF_FLY', 'LEAVE_FLY', 'INPUT_FLY', 'TURN', 'ILLEGAL_CREW', 'CREW_SOLO', 'CO_APPROVAL', 'OCU_NO_IP', 'CREW_REST', 'QUAL',
    'NO_BRIEF', 'DEBRIEF', 'SIM_BRIEF', 'SIM_DEBRIEF', 'CREW_TIGHT', 'LONGDAY', 'DT_SUM', 'NO_IR']

  it('every warning has a known tier', () => {
    const W = validate()
    expect(W.all.every((x: any) => SEV.includes(x.sev)), [...new Set(W.all.map((x: any) => x.sev))].join(',')).toBe(true)
  })

  it('every warning has a known code', () => {
    const W = validate()
    const bad = [...new Set(W.all.map((x: any) => x.code))].filter(c => !CODES.includes(c as string) && c !== 'SC_QUAL' && c !== 'AAR_QUAL' && c !== 'SHIFT_SOFT')
    expect(bad, bad.join(',')).toEqual([])
  })

  it('WCODE covers all 19 codes', () => {
    expect(CODES.filter(c => !WCODE[c]), CODES.filter(c => !WCODE[c]).join(',')).toEqual([])
    expect(Object.keys(WCODE)).toContain('SC_QUAL')
    expect(Object.keys(WCODE)).toContain('AAR_QUAL')
    expect(Object.keys(WCODE)).toContain('SHIFT_SOFT')
  })

  it('CHIP_LABEL covers all 10 chips', () => {
    const chips = ['DT', 'TT', 'C', 'CR', 'Q', 'NB', 'DB', 'SB', 'SD', 'LD']
    expect(chips.filter(c => !CHIP_LABEL[c])).toEqual([])
  })

  it('chip glyphs print short (CHIP_TEXT)', () => {
    expect(chipText('CR')).toBe('R')
    expect(chipText('NB')).toBe('B'); expect(chipText('SB')).toBe('B')
    expect(chipText('DB')).toBe('D'); expect(chipText('SD')).toBe('D')
    expect(chipText('LD')).toBe('L')
    expect(CHIP_TEXT.DT).toBe('DT')
  })

  it('runtime tiers agree with the source', () => {
    /* NO_BRIEF, SIM_BRIEF and DT_SUM are amber (owner, 4 Aug 26) — the clash
       itself carries the red; the eaten window and the double-turn count are
       advice on top of it */
    const WANT: any = { TURN: 'adv', DOUBLE_BOOK: 'hard', NO_BRIEF: 'adv', DEBRIEF: 'adv', SIM_BRIEF: 'adv', SIM_DEBRIEF: 'adv',
      DT_SUM: 'adv', LONGDAY: 'note', CREW_REST: 'hard', CREW_TIGHT: 'adv', ILLEGAL_CREW: 'hard', CREW_SOLO: 'adv', CO_APPROVAL: 'adv', QUAL: 'hard', OCU_NO_IP: 'adv', NO_IR: 'hard' }
    const bad = validate().all.filter((x: any) => WANT[x.code] && WANT[x.code] !== x.sev)
    expect(bad, bad.map((x: any) => x.code + '=' + x.sev).join(',')).toEqual([])
  })

  it('SEVWORD is Warning/Advisory/Note', () => {
    expect(SEVWORD).toEqual({ hard: 'Warning', adv: 'Advisory', note: 'Note' })
  })

  it('VCONF thresholds unchanged', () => {
    const VC: any = { briefLead: 140, dur: 85, step: 60, dekit: 30, minTurn: 20, tightTurn: 120, crewRest: 720, debrief: 120,
      reportLead: 180, longDay: 720, epBrief: 15, simDebrief: 30, amtDebrief: 30 }
    const vbad = Object.keys(VC).filter(k => VCONF[k] !== VC[k])
    expect(vbad, vbad.join(',')).toEqual([])
  })

  it('a cockpit or a duty post beats a shift; ground and programme only advise (SHIFT_HARD)', () => {
    expect(SHIFT_HARD).toEqual({ fly: true, sim: true, duty: true, shift: true, ground: false, prog: false })
  })

  it('day warnings sorted hard → adv → note', () => {
    const W = validate()
    expect(W.byDay.every((g: any) => {
      if (!g || !g.warns) return true; const o: any = { hard: 0, adv: 1, note: 2 }
      return g.warns.every((x: any, i: number) => i === 0 || o[g.warns[i - 1].sev] <= o[x.sev])
    })).toBe(true)
  })

  it('sev index keyed by day then person', () => {
    const W = validate()
    expect(Object.keys(W.sev).every(k => /^\d+$/.test(k) && typeof W.sev[k] === 'object')).toBe(true)
  })

  it('ALL AVAIL sentinels never raise warnings', () => {
    const W = validate()
    const bad = W.all.filter((x: any) => (x.who || []).some((id: any) => isSpecial(id)))
    expect(bad, bad.map((x: any) => x.code).join(',')).toEqual([])
  })

  it('at least one warning of each tier in the seed', () => {
    const W = validate()
    expect(SEV.filter(s => !W.all.some((x: any) => x.sev === s))).toEqual([])
  })

  it('collectEvents skips cancelled lines', () => {
    const f = DAYS[0].waves[0].formations[0]
    const before = collectEvents()[0].fly.filter((e: any) => e.id === f.aircraft[0].p).length
    f.aircraft[0].cx = true
    const midway = collectEvents()[0].fly.filter((e: any) => e.id === f.aircraft[0].p).length
    f.cx = true
    const after = collectEvents()[0].fly.length
    expect(before).toBeGreaterThan(0)
    expect(midway).toBeLessThan(before)
    expect(after).toBeLessThan(collectEvents()[1].fly.length + before)
  })

  it('validate publishes when rest expires, per day per person (REST)', () => {
    validate()
    expect(REST[0]).toEqual({})              // Monday has no previous day
    expect(typeof REST[1]).toBe('object')
    expect(restClear(0, 'nobody')).toBe(null)
  })
})

/* Was "an offer is not a commitment (tfin B53 #8)". The offer exemption is gone
   (owner decision, Aug 26) and the reference assertion no longer describes the
   port: a man who says he is flying elsewhere is not available for this sortie,
   so Fly now costs exactly what a Meeting costs. */
describe('personal inputs flag only once actioned (owner, Aug 26)', () => {
  it('un-actioned Fly/Meeting are invisible; filed under Unavailable, Fly clashes exactly as a Meeting does', () => {
    const d = DAYS[0], ce = collectEvents()[0]
    const id = ((ce.fly || []).find((e: any) => !isSpecial(e.id)) || {}).id
    expect(id).toBeTruthy()
    const n = (t: string, acc?: string) => {
      INPUTS.push({ person: id, date: d.dt, allday: false, s: 300, e: 1380, type: t, remarks: '', mod: '', ...(acc ? { acc } : {}) })
      const c = validate().all.filter((x: any) => (x.who || []).indexOf(id) >= 0
        && (x.code === 'NO_BRIEF' || x.code === 'DEBRIEF')).length
      INPUTS.pop(); return c
    }
    const base = validate().all.filter((x: any) => (x.who || []).indexOf(id) >= 0
      && (x.code === 'NO_BRIEF' || x.code === 'DEBRIEF')).length
    /* a submitted-but-unactioned personal input is a request, not a
       commitment — the validator must not see it at all */
    expect(n('Fly')).toBe(base)
    expect(n('Meeting')).toBe(base)
    /* filed under Unavailable it is real, and Fly gets no offer exemption */
    const fly = n('Fly', 'u'), meeting = n('Meeting', 'u')
    validate()
    expect(fly).toBeGreaterThan(base)
    expect(fly).toBe(meeting)
  })
})

describe('SC currency, staffed live (tfin T)', () => {
  const hits = () => validate().all.filter((x: any) => x.code === 'SC_QUAL')
  const ids = Object.keys(PEOPLE).filter(id => !PEOPLE[id].special)
  const dayOnly = ids.find(id => scQualOK(id, 'day') && !scQualOK(id, 'night'))
  const both = ids.find(id => scQualOK(id, 'day') && scQualOK(id, 'night'))

  it('the roster holds a day-only and a both-current body', () => {
    expect(!!dayOnly && !!both, 'dayOnly=' + dayOnly + ' both=' + both).toBe(true)
  })

  it('an empty SC raises nothing, and staffing follows the shift window', () => {
    DAYS[0].waves.push(makeStandalone('sc'))
    const gi = DAYS[0].waves.length - 1
    expect(hits(), hits().map((x: any) => x.msg).join(' | ')).toEqual([])
    const k = `0.${gi}.0.0.p`
    setSlotVal(k, both!)
    expect(hits()).toEqual([])                       // a both-current body is fine on the day shift
    setSlotVal(k, dayOnly!)
    expect(hits()).toEqual([])                       // a day-current body is fine on the day shift
    /* move the crew change past 19:00 — the same body is now on a night shift */
    txtSet(`ff:0.${gi}.0.ld`, '21:00')
    const h = hits()
    expect(h.length === 0 || h.every((x: any) => /SC NIGHT/.test(x.msg)),
      h.map((x: any) => x.msg).join(' | ')).toBe(true)
    expect(h.length).toBeGreaterThan(0)              // dayOnly is, by construction, not night-current
  })

  it('the AM and PM shifts abut and do not overlap (tfin X)', () => {
    DAYS[0].waves.push(makeStandalone('sc'))
    const forms = collectEvents()[0].forms.filter((f: any) => f.sc)
    const am = forms[forms.length - 2], pm = forms[forms.length - 1]
    expect(!!am && am.s === 7 * 60 && am.e === 13 * 60, am ? am.s + '-' + am.e : 'none').toBe(true)
    expect(!!pm && pm.s === 13 * 60 && pm.e === 19 * 60, pm ? pm.s + '-' + pm.e : 'none').toBe(true)
    expect(!(am.s < pm.e && pm.s < am.e)).toBe(true)
  })
})

describe('a downchit or OL closes an SC SPARE (tfin B53 #10)', () => {
  it('LL/OIL still leaves the spare slot open; a downchit closes it', () => {
    /* day 1 is Jul 14: nasty is on LL, shrek on OIL; sufa is downchit 13–17 */
    DAYS[1].waves.push(makeStandalone('sc'))
    const gi = DAYS[1].waves.length - 1
    const spare = DAYS[1].waves[gi].formations[0].aircraft[2]  // first SPARE line
    expect(spare.spare).toBe(true)
    spare.p = 'nasty'                                          // LL — may still stand SC SPARE
    let bad = validate().all.filter((x: any) => (x.who || []).includes('nasty')
      && (x.code === 'LEAVE_FLY' || x.code === 'DNIF_FLY'))
    expect(bad, bad.map((x: any) => x.msg).join(' | ')).toEqual([])
    spare.p = 'sufa'                                           // downchit — cannot
    bad = validate().all.filter((x: any) => (x.who || []).includes('sufa')
      && x.code === 'DNIF_FLY' && /SPARE/.test(x.msg))
    expect(bad.length).toBeGreaterThan(0)
  })
})

/* ---- NO_IR: an IRT needs an IR examiner in the crew (owner, Aug 5 '26) ----
   Dice is the seed's only IR. The seed schedules no IRT, so the rule fires
   nothing until a test writes one in — which is also what keeps the parity
   suite byte-exact. */
describe('an IRT needs an IR examiner (NO_IR)', () => {
  it('IRT in the formation msn without an IR flags the whole crew, red', () => {
    const chipBefore = (validate().chip[0] || {}).stiff
    txtSet('ff:0.0.0.msn', 'IRT')                    // VL BFM → VL IRT; crew stiff/freak + bane/wolf
    const W = validate()
    const hits = W.all.filter((x: any) => x.code === 'NO_IR')
    expect(hits.length).toBe(1)
    expect(hits[0].sev).toBe('hard')
    expect([...hits[0].who].sort()).toEqual(['bane', 'freak', 'stiff', 'wolf'])
    /* Hard ring on the whole crew, and since 5 Aug 26 a chip to go with it:
       NO_IR is a crew-pairing rule, so it marks CPH. Stiff is the case
       where that is NOT what shows — he is already carrying a conflict, and C
       outranks CPH deliberately (a man in two places at once is the harder
       stop). So his flag is unchanged, while a crew member with nothing else
       against him now shows the pairing flag instead of a bare ring. */
    expect(W.sev[0].stiff).toBe('hard')
    expect((W.chip[0] || {}).stiff).toBe(chipBefore)
    expect((W.chip[0] || {}).wolf, 'the rest of the crew get the CP flag').toBe('CPH')
  })

  /* Bug (owner scenario run, 5 Aug 26): crewAll used to be `.filter(Boolean)`,
     so the ALL AVAIL sentinel — a special PEOPLE record standing in for an
     unfilled seat, never a real body — flowed straight through into who/
     ring/chip. A red ring + CPH landed on the sentinel itself whenever it
     filled a seat on an IRT line with no IR examiner. The detection must
     stay exactly as sensitive — only the sentinel's own marking goes away. */
  it('an ALL AVAIL sentinel filling a seat is never named, ringed or chipped', () => {
    /* RU/slipway+divot (0.0.1.0) is otherwise clean on Monday — no other
       booking to fight CPH for RANK, unlike stiff/bane in the VL formation
       above, so the "still ringed and chipped" half of this pin is unambiguous */
    setSlotVal('0.0.1.1.p', '')                       // clear pump/dirty — isolate the flagged crew
    setSlotVal('0.0.1.1.w', '')
    setSlotVal('0.0.1.0.w', 'allavail')                // sentinel fills the WSO seat, slipway stays FCP
    txtSet('ff:0.0.1.msn', 'IRT')
    const W = validate()
    const hits = W.all.filter((x: any) => x.code === 'NO_IR')
    expect(hits.length).toBe(1)
    expect(hits[0].who).not.toContain('allavail')
    expect(hits[0].who).toContain('slipway')
    expect((W.sev[0] || {}).allavail, 'the sentinel gets no ring').toBeUndefined()
    expect((W.chip[0] || {}).allavail, 'the sentinel gets no chip').toBeUndefined()
    expect((W.sev[0] || {}).slipway).toBe('hard')
    expect((W.chip[0] || {}).slipway).toBe('CPH')
  })

  it('seating the IR examiner anywhere in the formation clears it', () => {
    txtSet('ff:0.0.0.msn', 'IRT')
    setSlotVal('0.0.0.1.p', 'dice')                  // dice replaces bane in the second aircraft
    const hits = validate().all.filter((x: any) => x.code === 'NO_IR')
    expect(hits, hits.map((x: any) => x.msg).join(' | ')).toEqual([])
  })

  it('IRT in one aircraft\'s remarks wants the IR in THAT aircraft', () => {
    txtSet('fr:0.0.0.0', 'IRT')                      // remarks of the stiff/freak jet
    setSlotVal('0.0.0.1.p', 'dice')                  // the IR sits in the OTHER aircraft
    const hits = validate().all.filter((x: any) => x.code === 'NO_IR')
    expect(hits.length).toBe(1)
    expect([...hits[0].who].sort()).toEqual(['freak', 'stiff'])
    setSlotVal('0.0.0.0.p', 'dice')                  // now the IR is aboard the flagged jet
    expect(validate().all.filter((x: any) => x.code === 'NO_IR')).toEqual([])
  })

  it('a word containing IRT does not trip it', () => {
    txtSet('ff:0.0.0.msn', 'DIRTY')                  // \bIRT\b must not match inside a word
    expect(validate().all.filter((x: any) => x.code === 'NO_IR')).toEqual([])
  })
})

/* ---- the combination matrix (F-15SG Table 1.5-2, owner Aug 5 '26) ---------
   Front seat CAT A–D or OCU vs back seat CAT A–D or OCU; instructors clear
   it outright and mis-seated bodies belong to the QUAL rules. Unlike NO_IR
   this DOES fire on the seed week — refwin patches the same rule into the
   in-memory reference, and the seed gradings are pinned here so the parity
   patch can never drift from the engine unnoticed. */
describe('the crew combination matrix (Table 1.5-2)', () => {
  const crew = (p: any, w: any) => { setSlotVal('0.0.0.0.p', p); setSlotVal('0.0.0.0.w', w); return validate() }
  const at = (W: any, code: any, p: any, w: any) =>
    W.all.filter((x: any) => x.code === code && x.who.includes(p) && x.who.includes(w))

  it('the seed week carries the matrix gradings', () => {
    const W = validate()
    /* Monday bapster+nick: the crew-solo advisory, where the old two-OCU rule
       said hard — the matrix supersedes it */
    const solo = at(W, 'CREW_SOLO', 'bapster', 'nick')
    expect(solo.length).toBe(1); expect(solo[0].sev).toBe('adv'); expect(solo[0].di).toBe(0)
    expect(solo[0].msg).toMatch(/Basic Course Syllabus/)
    expect(W.all.filter((x: any) => x.code === 'ILLEGAL_CREW' && x.di === 0)).toEqual([])
    // Wednesday krait+wrangler (D+D) and pike+badger (C front, D WSO): CO approval
    expect(at(W, 'CO_APPROVAL', 'krait', 'wrangler').length).toBe(1)
    const co = at(W, 'CO_APPROVAL', 'pike', 'badger')
    expect(co.length).toBe(1); expect(co[0].sev).toBe('adv'); expect(co[0].msg).toMatch(/CO approval required/)
    // Thursday bapster+badger (OCU pilot, D WSO): not an authorised combination
    const ill = at(W, 'ILLEGAL_CREW', 'bapster', 'badger')
    expect(ill.length).toBe(1); expect(ill[0].sev).toBe('hard'); expect(ill[0].di).toBe(3)
    expect(ill[0].msg).toMatch(/not an authorised combination/)
  })

  it('an OCU pilot with a CAT A–D WSO is a Warning', () => {
    ;['cards', 'pain', 'rocky', 'wrangler'].forEach((w: any) => {   // A, B, C, D WSOs
      const W = crew('prism', w)
      const hits = at(W, 'ILLEGAL_CREW', 'prism', w)
      expect(hits.length, 'prism+' + w).toBe(1)
      expect(hits[0].sev).toBe('hard')
      expect(W.sev[0].prism).toBe('hard')                           // red ring, no chip of its own
    })
  })

  it('an OCU WSO with a CAT A–D pilot is a Warning', () => {
    ;['slipway', 'romeo', 'ignite', 'fantom'].forEach((p: any) => { // A, B, C, D pilots
      const hits = at(crew(p, 'bullet'), 'ILLEGAL_CREW', p, 'bullet')
      expect(hits.length, p + '+bullet').toBe(1)
      expect(hits[0].sev).toBe('hard')
    })
  })

  it('OCU pilot with OCU WSO is the crew-solo advisory, not the old hard rule', () => {
    const W = crew('prism', 'bullet')
    const hits = at(W, 'CREW_SOLO', 'prism', 'bullet')
    expect(hits.length).toBe(1); expect(hits[0].sev).toBe('adv')
    expect(hits[0].msg).toMatch(/a crew solo, only allowed under the Basic Course Syllabus/)
    expect(at(W, 'ILLEGAL_CREW', 'prism', 'bullet')).toEqual([])
  })

  it('D+C, C+D and D+D want CO approval; every other CAT pairing is clean', () => {
    const FP: any = { A: 'slipway', B: 'romeo', C: 'ignite', D: 'fantom' }
    const BW: any = { A: 'cards', B: 'pain', C: 'rocky', D: 'wrangler' }
    const want = new Set(['D+C', 'C+D', 'D+D'])
    for (const f of ['A', 'B', 'C', 'D']) for (const b of ['A', 'B', 'C', 'D']) {
      const W = crew(FP[f], BW[b]), tag = f + '+' + b
      const co = at(W, 'CO_APPROVAL', FP[f], BW[b])
      if (want.has(tag)) { expect(co.length, tag).toBe(1); expect(co[0].sev).toBe('adv') }
      else expect(co, tag).toEqual([])
      expect(at(W, 'ILLEGAL_CREW', FP[f], BW[b]), tag).toEqual([])
    }
  })

  it('an instructor in either seat clears the matrix', () => {
    const a = crew('stiff', 'bullet')                               // IP forward, OCU WSO aft
    expect(at(a, 'ILLEGAL_CREW', 'stiff', 'bullet')).toEqual([])
    expect(at(a, 'CREW_SOLO', 'stiff', 'bullet')).toEqual([])
    const b = crew('prism', 'freak')                                // OCU pilot, IW aft
    expect(at(b, 'ILLEGAL_CREW', 'prism', 'freak')).toEqual([])
    expect(at(b, 'CREW_SOLO', 'prism', 'freak')).toEqual([])
  })
})

/* ---- the IW-in-FCP guard: a hand-edited record, not a UI path -------------
   The Quals-page dropdowns never offer IW to a pilot, so this state can only
   be written by hand — and the validator still refuses to seat it forward. */
describe('CAT IW is a WSO category (data-inconsistency guard)', () => {
  it('an IW record whose seat says FCP is flagged in a front seat', () => {
    const rocky = PEOPLE.rocky, was = { seat: rocky.seat, q: rocky.q }
    try {
      rocky.seat = 'FCP'; rocky.q = 'IW'
      setSlotVal('0.0.0.0.p', 'rocky')
      const hits = validate().all.filter((x: any) => x.code === 'QUAL' && /CAT IW/.test(x.msg))
      expect(hits.length).toBeGreaterThan(0)
      expect(hits[0].sev).toBe('hard')
    } finally { rocky.seat = was.seat; rocky.q = was.q; validate() }
  })
})

/* ---- the crew-pairing chip (renamed from CC, owner ask 5 Aug 26) ----------
   The pairing rules used to ring the puck and caption nothing, which left
   them the one warning family with nowhere to click. They now all mark a
   chip: CP where the pairing needs approval, CPH where it is not authorised.
   Two codes, one printed flag — the colour carries the severity. */
describe('CP — crew pairing', () => {
  const chipFor = (di: any, id: any) => validate().chip[di]?.[id]

  it('both codes print the same two letters', () => {
    expect(chipText('CP')).toBe('CP')
    expect(chipText('CPH')).toBe('CP')
  })

  it('every crew-pairing code is ranked', () => {
    /* markChip compares RANK[new] > RANK[current]. An unranked code still wins
       the FIRST write (there is nothing to beat) and loses every one after, so
       a missing entry here does not fail loudly — it silently freezes the flag
       on whichever pairing happened to validate first. */
    for (const c of ['CP', 'CPH']) expect(typeof RANK[c], `${c} is in RANK`).toBe('number')
    expect(RANK.CPH, 'the hard pairing outranks the advisory one').toBeGreaterThan(RANK.CP)
    expect(RANK.CPH, 'but an illegal SEAT still outranks an illegal pairing').toBeLessThan(RANK.Q)
  })

  it('the seed week chips every pairing it flags', () => {
    validate()
    /* Mon crew solo and Wed CO approval are advisories → amber CP */
    for (const [di, id] of [[0, 'bapster'], [0, 'nick'], [2, 'krait'], [2, 'wrangler'], [2, 'badger']] as any)
      expect(chipFor(di, id), `${id} on day ${di}`).toBe('CP')
    /* Thu bapster+badger is not an authorised combination → red CPH */
    for (const id of ['bapster', 'badger']) expect(chipFor(3, id), `${id} on day 3`).toBe('CPH')
  })

  it('no pairing is left ringed but uncaptioned', () => {
    /* the gap this closes: a puck with a warning ring and no chip has nothing
       to click, so its warning is unreachable from the puck itself */
    const W = validate()
    const orphans: string[] = []
    W.byDay.forEach((g: any, di: number) => {
      if (!g || !g.warns) return
      const ids = new Set<string>()
      g.warns.forEach((w: any) => (w.who || []).forEach((i: string) => ids.add(i)))
      ids.forEach(id => { if (W.sev[di]?.[id] && !W.chip[di]?.[id]) orphans.push(`${id}@${di}`) })
    })
    expect(orphans, 'every ringed puck carries a chip').toEqual([])
  })

  it('an instructor in either seat clears the chip too', () => {
    /* the matrix only grades a non-instructor pair, so the chip has to follow
       it — an IP forward must leave no crew-pairing flag behind */
    setSlotVal('0.0.0.0.p', 'stiff'); setSlotVal('0.0.0.0.w', 'bullet')
    const W = validate()
    expect(W.chip[0]?.stiff).not.toBe('CP')
    expect(W.chip[0]?.stiff).not.toBe('CPH')
    expect(W.chip[0]?.bullet).not.toBe('CP')
    expect(W.chip[0]?.bullet).not.toBe('CPH')
  })
})
