/* RULES-FIRST REVIEW, family 5 — seats, crew pairing, qualifications and placeholders (W54–W61)
   ([ENGINE-RULES-REVIEW], D1983, 11 Nov 26). One test per worklist item, each led by the ruling's own words, on a small
   made-up day through the engine's own doors (validate, slotBar, rowTwice, sentinelSeatOK, setSlotVal, fillSlot, the
   Logic page's lines). Items whose ruled behaviour an existing test already holds whole are named in the review's
   results, not duplicated here. Harness: the same as rulesfirst-3-crew-rest.test.ts (every day emptied, the inputs
   cleared, the book reset, the roster restored). */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from './data'
import { INPUTS } from './inputs'
import { SCHED } from './publish'
import { VCONF } from './rules'
import { PEOPLE } from './people'
import { validate, LIVE_ON_FACE } from './validate'
import { slotBar, rowTwice } from './avail'
import { slotVal, setSlotVal, fillSlot, sentinelSeatOK, SENTINEL_JET_BAR } from './slots'
import { makeStandalone, CURWEEK } from './waves'
import { lgChecks } from '../ui/logic-html'
import { dayHTML } from '../ui/html'
import { hydrateRoles } from '../state/mission-roles'
import { encodeRoleId, resolveMissionRole } from './mission-role'
import { dayIso } from './verid'

const saved = { d: JSON.stringify(DAYS), i: JSON.stringify(INPUTS), book: JSON.stringify(SCHED), v: { ...VCONF }, p: JSON.stringify(PEOPLE) }
const h = (hh: number, mm = 0) => hh * 60 + mm
const MON = 0, TUE = 1
const DT = ['Jul 13', 'Jul 14', 'Jul 15', 'Jul 16', 'Jul 17', 'Jul 18', 'Jul 19']
const day = (di: number): any => DAYS[di]
const add = (di: number, w: any) => { day(di).waves.push(w); return day(di).waves.length - 1 }
const ac = (p = '', w = '', rmks = '') => ({ p, w, rmks, area: '', opts: {} })
const form = (o: any = {}) => ({ cs: 'VL', msn: 'BFM', to: '12:00', ld: '13:00', br: '', rl: '', aircraft: [ac('bane')], ...o })
const wave = (forms: any[] = [form()], o: any = {}) => ({ label: 'WAVE 1', night: false, intimes: [], traffic: [], formations: forms, ...o })
const ground = (di: number, who: string, str: string, end: string, prog = 'BRIEFING') => day(di).ground.push({ prog, str, end, who, more: [] })
const inp = (di: number, person: string, type: string, more: any = {}) => INPUTS.push({ person, date: DT[di], allday: false, type, remarks: '', mod: '', ...more } as any)
const warns = (di: number, code?: string | null, id?: string) => validate().all.filter((x: any) => x.di === di
  && (!code || x.code === code) && (!id || (x.who || []).includes(id)))
const codes = (di: number, id?: string): string[] => [...new Set<string>(warns(di, null, id).map((x: any) => String(x.code)))].sort()
const logicLine = (id: string) => String(lgChecks().flatMap(g => g.items).find(c => c.id === id)!.line())
const P = (id: string) => (PEOPLE as any)[id]

beforeEach(() => {
  Object.assign(VCONF, { briefLead: 140, step: 60, dekit: 30, reportLead: 180, debrief: 120, crewRest: 720, longDay: 720, maxRun: 6, tightTurn: 60 })
  DAYS.forEach((d: any) => Object.assign(d, { waves: [], sims: { amt: [], oft: [] }, ground: [], allhands: [], dutywaves: [] }))
  INPUTS.splice(0); Object.assign(SCHED, { orig: {}, cur: {}, als: [], pending: {}, changes: {}, dayOK: {}, sign: {} })
})
afterEach(() => {
  DAYS.splice(0, DAYS.length, ...JSON.parse(saved.d)); INPUTS.splice(0, INPUTS.length, ...JSON.parse(saved.i))
  Object.keys(SCHED).forEach(k => delete SCHED[k]); Object.assign(SCHED, JSON.parse(saved.book)); Object.assign(VCONF, saved.v)
  const p0 = JSON.parse(saved.p); Object.keys(PEOPLE).forEach(k => { if (!(k in p0)) delete (PEOPLE as any)[k] }); Object.assign(PEOPLE, p0)
  hydrateRoles([])
})

describe('W54 — the placeholder pucks are refused on flying lines only, both cockpit seats of EVERY flying line, at every door; everywhere else they land (D33, D47)', () => {
  it('every standby kind — SC MAIN and SPARE, AVALON, BB — refuses ALL and ALL AVAIL in both seats, a row that FLIES too; a named WSO is still narrowed off a front seat', () => {
    const keys: string[] = []
    for (const kind of ['sc', 'avalon', 'bb']) {
      const w: any = makeStandalone(kind); const gi = add(TUE, w)
      w.formations.forEach((f: any, li: number) => f.aircraft.forEach((_a: any, ai: number) => keys.push(`${TUE}.${gi}.${li}.${ai}.p`, `${TUE}.${gi}.${li}.${ai}.w`)))
    }
    const sc = day(TUE).waves[0]; sc.formations[0].rl = '06:00'               // the SC AM shift now flies, every row (D1044)
    const av = day(TUE).waves[1]; av.formations[0].aircraft[0].fly = true     // an AVALON row ticked Flies by hand (D1061)
    const gi = add(TUE, wave([form({ aircraft: [ac()] })])); keys.push(`${TUE}.${gi}.0.0.p`, `${TUE}.${gi}.0.0.w`)
    expect(keys.length).toBeGreaterThan(8)
    for (const k of keys) for (const id of ['all', 'allavail']) {
      expect(sentinelSeatOK(k, id), `${id} on ${k}`).toBe(false)
      expect(slotBar(id, k), 'the reason, on screen').toBe(SENTINEL_JET_BAR)
      expect(setSlotVal(k, id), 'the belt writes nothing').toBe(false)
      expect(slotVal(k), 'the seat stays empty').toBe('')
    }
    expect(slotBar('freak', `${TUE}.${gi}.0.0.p`), 'tapping an empty cockpit seat still narrows the crew list').toBe('WSO — cannot fly front seat')
    expect(slotBar('bane', `${TUE}.${gi}.0.0.p`), 'a named pilot passes').toBe('')
  })
  it('lands on a ground row and its extras, the Common Programme, a sim\'s own seats and its passengers — and is silent there (no seat or pairing check reads it)', () => {
    ground(TUE, '', '0900', '1000')
    day(TUE).allhands.push({ prog: 'STAND-DOWN', str: '1400', end: '1500', who: [] })
    day(TUE).sims.oft.push({ label: 'EP-1', str: '1000', end: '1100', p: '', w: '', pax: [], rmks: '' })
    for (const k of [`g:${TUE}.0`, `g:${TUE}.0.+`, `a:${TUE}.0.+`, `s:${TUE}.oft.0.p`, `s:${TUE}.oft.0.w`, `s:${TUE}.oft.0.pax.+`])
      expect(sentinelSeatOK(k, 'allavail'), k).toBe(true)
    expect(setSlotVal(`g:${TUE}.0`, 'allavail')).toBe(true)
    expect(fillSlot(`a:${TUE}.0.+`, 'all')).toBe(true)
    expect(setSlotVal(`s:${TUE}.oft.0.p`, 'allavail')).toBe(true)
    expect(day(TUE).sims.oft[0].p).toBe('allavail')
    expect(warns(TUE).filter((x: any) => (x.who || []).some((id: string) => P(id)?.special)), 'a placeholder raises nothing anywhere').toEqual([])
    expect(warns(TUE, 'QUAL'), 'no "illegal seat" for a placeholder in a sim front seat').toEqual([])
  })
})

describe('W55 — one man in both seats of one jet stays a warning (the red "two events at once"), not a refusal; "once per row" covers rows of people\'s places (D276, D271)', () => {
  it('both seats of one jet: every engine door lets him in, and the list raises the red DOUBLE_BOOK; the same man twice on a ground row is refused', () => {
    const gi = add(TUE, wave([form({ aircraft: [ac()] })]))
    const fk = `${TUE}.${gi}.0.0`
    expect(setSlotVal(`${fk}.p`, 'split')).toBe(true)
    expect(rowTwice('split', `${fk}.w`), 'a flying line is not one of D271\'s rows').toBe('')
    expect(slotBar('split', `${fk}.w`), 'nothing refuses him in the crew list').toBe('')
    expect(setSlotVal(`${fk}.w`, 'split')).toBe(true)
    expect(slotVal(`${fk}.w`)).toBe('split')
    const db = warns(TUE, 'DOUBLE_BOOK', 'split')
    expect(db.map((x: any) => x.sev), 'the red "two events at once"').toEqual(['hard'])
    expect(db[0].msg).toMatch(/two seats on VL BFM at once/)
    ground(TUE, 'split', '1500', '1600')
    expect(fillSlot(`g:${TUE}.0.+`, 'split'), 'D271: one man, once per row').toBe(false)
    expect(rowTwice('split', `g:${TUE}.0.+`)).toMatch(/not added twice/)
    expect(fillSlot(`g:${TUE}.0.+`, 'allavail') && fillSlot(`g:${TUE}.0.+`, 'allavail'), 'D278: a placeholder may stand twice').toBe(true)
  })
})

describe('W56 — a flying line with only its front seat filled works as fully as a two-seat line; the single-seat rules are new rules, designed later (D1099, D1100, D1101) — not built, [SINGLE-SEAT]', () => {
  it('as built: the front seat alone is checked as a two-seat jet with an empty back seat — AAR reads "nobody behind can supervise", an OCU alone is the OCU-without-IP advisory, no pairing check runs', () => {
    add(TUE, wave([form({ aircraft: [ac('bapster', '', 'AAR')] })]))          // an OCU pilot, alone, an AAR line
    P('bapster').quals = { ...(P('bapster').quals || {}), daar: false }
    expect(codes(TUE, 'bapster')).toEqual(['AAR_QUAL', 'OCU_NO_IP'])
    expect(warns(TUE, 'AAR_QUAL')[0].msg).toMatch(/not DAAR current/)
  })
})

describe('W57 — no red mark is added to the schedule\'s lines for the mission role (D519)', () => {
  it('a formation answered RED draws byte-for-byte as it did unanswered — the role lives in Insights only', () => {
    const f = form({ rid: 'r5-role', msn: 'ACM', aircraft: [ac('bane', '', 'DS for EAGLE')] })
    add(TUE, wave([f]))
    const before = dayHTML(TUE, false)
    expect(before, 'the line is drawn').toContain('DS for EAGLE')
    const context = resolveMissionRole(f).context
    const id = encodeRoleId({ weekKey: CURWEEK, dayISO: dayIso(CURWEEK, TUE), formationRid: 'r5-role', context })
    hydrateRoles([[id, { weekKey: CURWEEK, dayISO: dayIso(CURWEEK, TUE), formationRid: 'r5-role', context, format: 1, contextVersion: 1, side: 'red' }]])
    expect(dayHTML(TUE, false)).toBe(before)
  })
})

describe('W58 — the CAT ladder and crew pairing: the matrix (ILLEGAL_CREW, CREW_SOLO, CO_APPROVAL), OCU_NO_IP, NO_IR, the illegal seat; the Qualification flag live on a published face, the pairing frozen (5 Aug, 7 Sep 26; D185, D188)', () => {
  const pair = (p: string, w: string, o: any = {}) => { DAYS[TUE].waves = []; add(TUE, wave([form({ aircraft: [ac(p, w)], ...o })])); return codes(TUE) }
  it('the matrix as the table says, an instructor in either seat clears it, a pilot riding the back is no pairing, ALL AVAIL behind is never named', () => {
    expect(pair('bapster', 'pain'), 'OCU pilot + CAT B WSO').toContain('ILLEGAL_CREW')
    expect(pair('fantom', 'nick'), 'CAT D pilot + OCU WSO').toContain('ILLEGAL_CREW')
    expect(pair('bapster', 'nick'), 'OCU + OCU').toContain('CREW_SOLO')
    expect(pair('fantom', 'rocky'), 'D + C').toContain('CO_APPROVAL')
    expect(pair('ignite', 'wrangler'), 'C + D').toContain('CO_APPROVAL')
    expect(pair('fantom', 'wrangler'), 'D + D').toContain('CO_APPROVAL')
    expect(pair('ignite', 'rocky'), 'C + C: nothing').toEqual([])
    expect(pair('bapster', 'freak'), 'an IW behind an OCU pilot clears the matrix and supervises').toEqual([])
    expect(pair('bane', 'nick'), 'an IP in front clears it').toEqual([])
    expect(pair('bapster', 'ignite'), 'a CAT C pilot riding the back of an OCU pilot: not a pairing the matrix grades').toEqual(['OCU_NO_IP'])
    expect(pair('freak', 'pain'), 'a WSO in the front seat').toContain('QUAL')
    expect(pair('ignite', 'freak'), 'any pilot may ride the back; an IW behind is legal').toEqual([])
    const oc = pair('bapster', 'allavail')
    expect(oc, 'ALL AVAIL behind supervises nothing').toEqual(['OCU_NO_IP'])
    expect(warns(TUE, 'OCU_NO_IP')[0].who, 'and is never named').toEqual(['bapster'])
    expect(pair('fantom', 'rocky', { msn: 'IRT' }), 'IRT with no IR').toContain('NO_IR')
    expect(pair('dice', 'rocky', { msn: 'IRT' }), 'an IR aboard').not.toContain('NO_IR')
  })
  it('the published face: QUAL, SC_QUAL, AAR_QUAL, AAR_INSTR live; the crew-pairing codes frozen', () => {
    for (const c of ['QUAL', 'SC_QUAL', 'AAR_QUAL', 'AAR_INSTR']) expect(LIVE_ON_FACE.has(c), c).toBe(true)
    for (const c of ['ILLEGAL_CREW', 'CREW_SOLO', 'CO_APPROVAL', 'OCU_NO_IP', 'NO_IR', 'PAX_CREW']) expect(LIVE_ON_FACE.has(c), c).toBe(false)
  })
})

describe('W59 — AAR currency off the remarks (AAR_QUAL), an AAR instructor not cleared (AAR_INSTR), SC currency by the shift (SC_QUAL) (10 Aug 26)', () => {
  const aar = (behind: string, rmks = 'AAR') => { DAYS[TUE].waves = []; add(TUE, wave([form({ aircraft: [ac('fantom', behind, rmks)] })])); return codes(TUE) }
  beforeEach(() => { P('fantom').quals = { ...P('fantom').quals, daar: false, naar: false } })
  it('not current: an IP behind holding I clears it, an IP behind without I is AAR_INSTR on both, anyone else behind leaves AAR_QUAL; a B: segment and NO AAR ask nothing', () => {
    P('bane').quals = { ...P('bane').quals, daar: 'I' }
    expect(aar('bane')).not.toContain('AAR_QUAL')
    expect(aar('bane')).not.toContain('AAR_INSTR')
    P('bane').quals = { ...P('bane').quals, daar: true }
    expect(aar('bane')).toContain('AAR_INSTR')
    expect(warns(TUE, 'AAR_INSTR')[0].who).toEqual(['bane', 'fantom'])
    expect(aar('rocky'), 'a WSO behind').toContain('AAR_QUAL')
    expect(aar('allavail'), 'ALL AVAIL behind').toContain('AAR_QUAL')
    expect(aar('', 'B: AAR'), 'the rear seat holds no AAR currency').not.toContain('AAR_QUAL')
    expect(aar('', 'NO AAR'), 'NO AAR').not.toContain('AAR_QUAL')
    P('fantom').quals = { ...P('fantom').quals, daar: true }
    expect(aar(''), 'current: nothing').toEqual([])
  })
  it('SC currency is asked on every seat of an SC shift, MAIN and SPARE, and on a flying AVALON row; a quals edit after seating shows at once', () => {
    const w: any = makeStandalone('sc'); add(TUE, w)
    const am = w.formations[0]                                               // SC AM — a day shift
    am.aircraft[0].p = 'ignite'; am.aircraft[am.aircraft.length - 1].p = 'yeti'
    P('ignite').quals = { ...P('ignite').quals, scDay: true }; P('yeti').quals = { ...P('yeti').quals, scDay: true }
    expect(warns(TUE, 'SC_QUAL')).toEqual([])
    P('yeti').quals = { ...P('yeti').quals, scDay: false }                    // edited on Quals after he was seated
    expect(warns(TUE, 'SC_QUAL', 'yeti').length, 'the SPARE seat is checked as a MAIN').toBe(1)
    const av: any = makeStandalone('avalon'); add(TUE, av)
    av.formations[0].aircraft[0].p = 'vinci'; av.formations[0].aircraft[0].fly = true
    P('vinci').quals = { ...P('vinci').quals, scNight: false }
    expect(warns(TUE, 'SC_QUAL', 'vinci').length, 'a flying AVALON row asks SC NIGHT').toBe(1)
  })
  // RULES-FIRST FINDING 5.1 (11 Nov 26, [ENGINE-RULES-REVIEW]): the Logic line says "an instructor without the mark is flagged instead", but an IW (an instructor on the same page's own list) behind leaves the front seat's AAR_QUAL and flags nobody behind — untrue of a real case (D932); flip to it() when fixed.
  // FIXED by the words job ([RULES-CHECK-FIXES] job 3, the report's F11 words): the line says "instructor pilot (IP, IR or FI)".
  it('D932: the AAR_INSTR Logic line is true for an instructor WSO behind — either he is flagged instead, or the line says "instructor pilot"', () => {
    const got = aar('freak')                                                 // CAT IW behind a pilot who is not DAAR current
    const flaggedInstead = got.includes('AAR_INSTR') && !got.includes('AAR_QUAL')
    const lineNarrow = /instructor pilot/i.test(logicLine('aarinstr'))
    expect(flaggedInstead || lineNarrow).toBe(true)
  })
})

describe('W60 — two sorties at once are a CONFLICT, not a turn: the airborne window decides (11 Aug 26)', () => {
  it('airborne overlap by a minute is the red DOUBLE_BOOK with no tight turn; landing at the other\'s take-off is a turn, never a conflict', () => {
    add(TUE, wave([form({ cs: 'VL', to: '09:00', ld: '10:00', aircraft: [ac('split')] }), form({ cs: 'RX', to: '09:59', ld: '11:00', aircraft: [ac('split')] })]))
    expect(warns(TUE, 'DOUBLE_BOOK', 'split').map((x: any) => x.sev)).toEqual(['hard'])
    expect(warns(TUE, 'TURN', 'split'), 'no negative-minute tight turn').toEqual([])
    day(TUE).waves[0].formations[1].to = '10:00'                               // the equal-time edge
    expect(warns(TUE, 'DOUBLE_BOOK', 'split'), 'touching is no conflict').toEqual([])
    expect(warns(TUE, 'TURN', 'split').length, 'it is a tight turn').toBe(1)
  })
  it('the edges: a flying AVALON row against a sortie at once is red too; one man in both seats of an SC SPARE row is red; as built, two lines with no times typed raise no conflict (nothing to compare), only the two-sorties note', () => {
    const av: any = makeStandalone('avalon'); add(TUE, av)
    const f0 = av.formations[0]; f0.aircraft[0].p = 'split'; f0.aircraft[0].fly = true    // 19:00–07:00, flies by hand
    add(TUE, wave([form({ to: '20:00', ld: '21:00', aircraft: [ac('split')] })]))
    expect(warns(TUE, 'DOUBLE_BOOK', 'split').map((x: any) => x.sev)).toEqual(['hard'])
    const sc: any = makeStandalone('sc'); add(MON, sc)
    const am = sc.formations[0], sp = am.aircraft[am.aircraft.length - 1]; sp.p = 'pike'; sp.w = 'pike'
    expect(warns(MON, 'DOUBLE_BOOK', 'pike').map((x: any) => x.sev), 'D276 on a standby row that only stands by').toEqual(['hard'])
    DAYS[MON].waves = []
    add(MON, wave([form({ cs: 'VL', to: '', ld: '', aircraft: [ac('split')] }), form({ cs: 'RX', to: '', ld: '', aircraft: [ac('split')] })]))
    expect(codes(MON, 'split'), 'as built').toEqual(['DT_SUM'])
  })
})

describe('W61 — ground crew (Personnel): a rear seat (an incentive ride) and ground work, never a front seat; the flying rules off; ALL / ALL AVAIL never include them (Aug 26; D52)', () => {
  it('a front seat, flying or sim, is the hard QUAL and the crew list refuses it; the rear seat is the amber PAX_CREW, with no pairing, crew-rest or turn check', () => {
    add(TUE, wave([form({ aircraft: [ac('torque', 'bane')] })]))
    expect(codes(TUE, 'torque')).toEqual(['QUAL'])
    expect(slotBar('torque', `${TUE}.0.0.0.p`)).toBe('ground crew — rear seat only, cannot fly front seat')
    DAYS[TUE].waves = []
    ground(MON, 'torque', '1000', '2200')                                     // Monday ends 22:00 — an aircrewman would be red
    add(TUE, wave([form({ to: '09:00', ld: '10:00', aircraft: [ac('ignite', 'torque')] })], { intimes: ['06:00 IN TIME'] }))
    expect(codes(TUE, 'torque')).toEqual(['PAX_CREW'])
    expect(warns(TUE, 'PAX_CREW')[0].sev).toBe('adv')
    day(TUE).sims.oft.push({ label: 'EP-1', str: '1400', end: '1500', p: 'torque', w: '', pax: [], rmks: '' })
    expect(codes(TUE, 'torque')).toContain('QUAL')
  })
  it('the three that apply: the conflict, the long day, the run of days', () => {
    ground(TUE, 'torque', '0600', '1900'); ground(TUE, 'torque', '1800', '2000')
    expect(codes(TUE, 'torque')).toEqual(['DOUBLE_BOOK', 'LONGDAY'])
    for (let di = 0; di < 7; di++) ground(di, 'spanner', '0900', '1000')
    expect(validate().all.filter((x: any) => x.code === 'DAYS_RUN' && (x.who || []).includes('spanner')).length).toBeGreaterThan(0)
  })
  it('as built: an absence still reads against him — a ground crewman on leave, seated on a ground row, is "On leave + planned" (named so by D2009)', () => {
    inp(TUE, 'torque', 'LL', { allday: true })
    ground(TUE, 'torque', '0900', '1000')
    expect(codes(TUE, 'torque')).toEqual(['LEAVE_FLY'])
  })
  // RULES-FIRST FINDING 5.2 (11 Nov 26, [ENGINE-RULES-REVIEW]): the Logic line says "Ground crew are checked only for clashes, the long day and days in a row", yet a front seat raises QUAL and an absence raises LEAVE_FLY on him — untrue of a real case (D932); flip to it() when fixed.
  // FIXED by the words job ([RULES-CHECK-FIXES] job 3, D1992; the report's F10 words): the line names their own absences and the front seat too.
  it('D932: the Personnel Logic line is true — no check beyond the three it names fires on a ground crewman', () => {
    inp(TUE, 'torque', 'LL', { allday: true })
    ground(TUE, 'torque', '0900', '1000')
    const fired = codes(TUE, 'torque')
    const claimsOnly = /checked only for clashes, the long day and days in a row/.test(logicLine('paxcrew'))
    expect(claimsOnly && fired.some((c: string) => !['DOUBLE_BOOK', 'LONGDAY', 'DAYS_RUN', 'PAX_CREW'].includes(c))).toBe(false)
  })
})
