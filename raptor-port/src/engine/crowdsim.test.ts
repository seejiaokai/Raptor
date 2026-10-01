/* [CROWD-SIM-BRIEF] — an event a man stands BEHIND A PLACEHOLDER on, sitting inside his own SIM brief or debrief, is
   flagged ([DB-READINESS] group A, phase 7; plan docs/superpowers/plans/2026-10-01-db-readiness-phase7-plan.md §1.2).

   D36 keeps the availability window narrow on purpose: a man on the OFT at 10:00 is busy for the box itself and FREE for
   the quarter-hour before it, so he is rightly in the crowd behind a 09:50 ops brief — and D38 says the app's job is to
   FLAG that the brief sits inside his sim brief, not to drop him. `crowdClashes` said it for a FLIGHT brief and debrief
   only; his sim windows were read nowhere outside the warning pass.

   ONE BODY FOR THE WORDS: the sentences asserted here are the warning list's own (validate.ts simBriefSays /
   simDebriefSays), which the pass itself now calls — the second describe pins that the list still says them. */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from './data'
import { INPUTS } from './inputs'
import { collectEvents } from './events'
import { validate, crowdClashes, simBriefSays, simDebriefSays } from './validate'
import { ensureRowIds } from './rowids'

const DSNAP = JSON.stringify(DAYS)
const ISNAP = JSON.stringify(INPUTS)
const TUE = 1
const SIMMER = 'bane'      // on the sim
const OTHER = 'harpoon'    // not on it
const hm = (h: number, m = 0) => h * 60 + m

beforeEach(() => {
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  INPUTS.length = 0
  Object.assign(DAYS[TUE] as any, { waves: [], dutywaves: [], sims: { amt: [], oft: [] }, ground: [], allhands: [] })
})
afterEach(() => { INPUTS.length = 0; JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r)) })

/* an OFT EP box 10:00–11:00: it briefs 15 minutes before and debriefs 30 after */
const oftDay = () => {
  ;(DAYS[TUE] as any).sims = { amt: [], oft: [{ label: 'EP-1', str: '1000', end: '1100', p: SIMMER, w: 'freak', rmks: '' }] }
  ensureRowIds(DAYS); validate()
}
/* the AMT block: its own BRIEF row 11:00, the box 11:30–12:30, its DEBRIEF row 12:30 (30 minutes when the end is blank) */
const amtDay = () => {
  ;(DAYS[TUE] as any).sims = { oft: [], amt: [
    { label: 'BRIEF', str: '1100', end: '' },
    { label: 'BOX', str: '1130', end: '1230', pax: [SIMMER, 'drill'] },
    { label: 'DEBRIEF', str: '1230', end: '' },
  ] }
  ensureRowIds(DAYS); validate()
}
const says = (id: string, s: number, e: number) => crowdClashes(TUE, id, s, e, 'OPS BRIEF').map(w => w.msg)

describe('an event inside a crowd man\'s OWN sim brief or debrief is flagged (D36 + D38)', () => {
  it('inside the OFT brief — the quarter-hour before the box', () => {
    oftDay()
    const got = crowdClashes(TUE, SIMMER, hm(9, 50), hm(9, 58), 'OPS BRIEF')
    expect(got.map(w => w.msg)).toEqual(['No time for the OFT EP-1 brief — OPS BRIEF sits inside 09:45–10:00'])
    expect(got[0].sev, 'amber, as the warning list has it').toBe('adv')
  })

  it('inside the OFT debrief — the half hour after it', () => {
    oftDay()
    expect(says(SIMMER, hm(11, 5), hm(11, 25))).toEqual(['No time for the OFT EP-1 debrief — OPS BRIEF sits inside 11:00–11:30'])
  })

  it('an event that only TOUCHES the window flags nothing — 09:30–09:45 ends as the brief begins', () => {
    oftDay()
    expect(says(SIMMER, hm(9, 30), hm(9, 45))).toEqual([])
    expect(says(SIMMER, hm(11, 30), hm(12, 0)), 'and one that starts as the debrief ends').toEqual([])
  })

  it('a man who is NOT on the sim is listed clean — the flag is about HIS sim', () => {
    oftDay()
    expect(says(OTHER, hm(9, 50), hm(9, 58))).toEqual([])
  })

  it('the AMT block: its BRIEF row is the hard line, its DEBRIEF row the debrief', () => {
    amtDay()
    expect(says(SIMMER, hm(11, 10), hm(11, 20))).toEqual(['No time for the AMT brief — OPS BRIEF sits inside 11:00–11:30'])
    expect(says(SIMMER, hm(12, 40), hm(12, 50))).toEqual(['No time for the AMT debrief — OPS BRIEF sits inside 12:30–13:00'])
    expect(says('drill', hm(11, 10), hm(11, 20)).length, 'everyone on the box, not only the first').toBe(1)
  })

  it('ground crew carry no sim brief of their own to lose — the exemption the warning pass makes (Astra, scenario 19)', () => {
    ;(DAYS[TUE] as any).sims = { amt: [], oft: [{ label: 'EP-1', str: '1000', end: '1100', p: SIMMER, w: 'freak', more: ['torque'], rmks: '' }] }
    ensureRowIds(DAYS); validate()
    expect(says('torque', hm(9, 50), hm(9, 58)), 'a ground crewman riding the box').toEqual([])
    expect(says(SIMMER, hm(9, 50), hm(9, 58)).length, 'the aircrew beside him still are').toBe(1)
  })

  it('a cancelled sim row has no brief to lose', () => {
    ;(DAYS[TUE] as any).sims = { amt: [], oft: [{ label: 'EP-1', str: '1000', end: '1100', p: SIMMER, w: 'freak', rmks: '', cx: 1 }] }
    ensureRowIds(DAYS); validate()
    expect(says(SIMMER, hm(9, 50), hm(9, 58))).toEqual([])
  })

  it('the flight half is unchanged beside it — a man with a sortie AND a sim wears both', () => {
    ;(DAYS[TUE] as any).waves = [{ label: 'WAVE 1', night: false, intimes: [], traffic: [], formations: [
      { cs: 'VL', msn: 'BFM', to: '13:30', ld: '15:00', aircraft: [{ p: SIMMER, w: 'freak', area: '', rmks: '', opts: {} }] }] }]
    oftDay()
    const got = says(SIMMER, hm(15, 30), hm(16, 30))
    expect(got.length).toBe(1)
    expect(got[0]).toContain('Not enough time to attend the VL BFM debrief')
  })
})

describe('WHICH WORLD\'S sim windows — the record\'s own, when the caller hands them in', () => {
  it('reads the windows it is given, never today\'s, and today\'s when given none', () => {
    oftDay()
    const record = (collectEvents()[TUE] as any).simwin        // the day as issued, with the sim
    ;(DAYS[TUE] as any).sims = { amt: [], oft: [] }             // today the sim is gone
    validate()
    expect(says(SIMMER, hm(9, 50), hm(9, 58)), 'the working copy: no sim, no flag').toEqual([])
    expect(crowdClashes(TUE, SIMMER, hm(9, 50), hm(9, 58), 'OPS BRIEF', [], record).map(w => w.msg), 'the record: flagged')
      .toEqual(['No time for the OFT EP-1 brief — OPS BRIEF sits inside 09:45–10:00'])
    expect(crowdClashes(TUE, SIMMER, hm(9, 50), hm(9, 58), 'OPS BRIEF', [], []).length, 'an EMPTY record is an answer too').toBe(0)
  })
})

describe('ONE BODY for the words — the warning list still says exactly what it said', () => {
  it('a named man\'s own clash with his sim brief reads the shared sentence', () => {
    ;(DAYS[TUE] as any).ground = [{ prog: 'HQ VISIT', str: '0950', end: '0958', who: SIMMER }]
    oftDay()
    const w = validate().all.filter((x: any) => x.di === TUE && x.code === 'SIM_BRIEF')
    expect(w.length).toBe(1)
    const sw = (collectEvents()[TUE] as any).simwin[0]
    expect(w[0].msg).toBe(simBriefSays(sw, 'HQ VISIT'))
    expect(w[0].msg).toBe('No time for the OFT EP-1 brief — HQ VISIT sits inside 09:45–10:00')
  })

  it('…and his debrief', () => {
    ;(DAYS[TUE] as any).ground = [{ prog: 'HQ VISIT', str: '1105', end: '1125', who: SIMMER }]
    oftDay()
    const w = validate().all.filter((x: any) => x.di === TUE && x.code === 'SIM_DEBRIEF')
    expect(w.length).toBe(1)
    expect(w[0].msg).toBe(simDebriefSays((collectEvents()[TUE] as any).simwin[0], 'HQ VISIT'))
  })
})
