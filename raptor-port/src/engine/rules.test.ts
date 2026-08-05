/* Ported from reference/tfin.js — the B50/B52 editable-rules group and the
   B53 #7 / #22 guards. DOM evals over the Logic page are re-expressed
   against the live engine objects wherever the contract is the engine's. */
import { afterEach, describe, expect, it } from 'vitest'
import { VCONF, SHIFT_HARD, RULE_STD, RULE_SPEC, ruleParse, ruleOff, kindOff, rulesOffCount, rulesLoad, rulesReset } from './rules'
import { RANK, CHIP_LABEL, wlbl } from './validate'
import { validate } from './validate'
import { store } from './hooks'

afterEach(() => { rulesReset() })

describe('editable rules (tfin B52)', () => {
  it('the squadron standard is captured before anything can touch it', () => {
    expect(typeof RULE_STD).toBe('object')
    expect(Object.isFrozen(RULE_STD)).toBe(true)
    expect(RULE_STD.v.crewRest).toBe(720)
  })

  it('every editable setting is bounded and named', () => {
    const k = Object.keys(RULE_SPEC)
    expect(k.length).toBeGreaterThanOrEqual(14)
    expect(k.every(x => RULE_SPEC[x].t && isFinite(RULE_SPEC[x].lo) && isFinite(RULE_SPEC[x].hi) && (x in VCONF))).toBe(true)
  })

  it('and every VCONF setting is editable — none is stranded', () => {
    expect(Object.keys(VCONF).every(k => k in RULE_SPEC)).toBe(true)
  })

  it('a change reaches the ENGINE, not just the page', () => {
    const was = VCONF.crewRest
    const n = () => validate().all.filter((x: any) => x.code === 'CREW_REST').length
    const a = n(); VCONF.crewRest = 840; const b = n(); VCONF.crewRest = was; validate()
    expect(b).toBeGreaterThan(a)
  })

  it('a value outside its bounds is refused', () => {
    const spec = RULE_SPEC.crewRest, v = ruleParse('crewRest', '3h')
    expect(v).toBe(180)
    expect(v! < spec.lo).toBe(true)         // the Logic tab refuses it on these bounds
  })

  it('the formats a scheduler would type all parse', () => {
    expect(ruleParse('crewRest', '12h')).toBe(720)
    expect(ruleParse('briefLead', '2h20')).toBe(140)
    expect(ruleParse('tightTurn', '90')).toBe(90)
    expect(ruleParse('tightTurn', '90 min')).toBe(90)
    expect(ruleParse('scDayFrom', '0700')).toBe(420)
    expect(ruleParse('crewRest', 'banana')).toBe(null)
  })

  it('reset restores the standard exactly', () => {
    VCONF.crewRest = 600; SHIFT_HARD.ground = true; rulesReset()
    expect(VCONF.crewRest).toBe(720)
    expect(SHIFT_HARD.ground).toBe(false)
    expect(rulesOffCount()).toBe(0)
  })

  it('ruleOff / kindOff notice a drift from standard', () => {
    expect(ruleOff('crewRest')).toBe(false)
    VCONF.crewRest = 600
    expect(ruleOff('crewRest')).toBe(true)
    SHIFT_HARD.ground = true
    expect(kindOff('ground')).toBe(true)
    expect(rulesOffCount()).toBe(2)
  })
})

describe('a stored override is untrusted input (tfin B53 #22)', () => {
  it('a hand-edited string never reaches VCONF', () => {
    const was = VCONF.crewRest, wasB = VCONF.briefLead, g = store.get
    ;(store as any).get = (k: any, d: any) => k === 'rules' ? { v: { crewRest: '840', briefLead: 99999, dekit: 20 }, s: {} } : g(k, d)
    rulesLoad()
    ;(store as any).get = g
    expect(VCONF.crewRest).toBe(was)         // a string, refused
    expect(VCONF.briefLead).toBe(wasB)       // out of bounds, refused
    expect(VCONF.dekit).toBe(20)             // a sane number, accepted
    VCONF.dekit = RULE_STD.v.dekit
  })
})

describe('a label may not hard-code a threshold (tfin B53 #7)', () => {
  it('an edited crew rest changes what the label says', () => {
    const was = VCONF.crewRest; VCONF.crewRest = 600
    const a = wlbl(CHIP_LABEL.CR); VCONF.crewRest = was
    expect(/10h/.test(a)).toBe(true)
    expect(/12h/.test(wlbl(CHIP_LABEL.CR))).toBe(true)
  })
})

describe('the flag order is read from RANK, at module scope (tfin B50)', () => {
  it('RANK carries the squadron ordering', () => {
    /* Codes get INSERTED into this table as rules gain flags — RUN above crew
       rest, then CC/CCH for crew composition (owner, 5 Aug 26) — and each
       insertion renumbers everything above it. So pin the ORDER, which is the
       squadron's actual contract, rather than the indices, which are an
       accident of how many codes happen to sit below. */
    expect(Object.keys(RANK).sort((a: any, b: any) => RANK[a] - RANK[b]))
      .toEqual(['LD', 'DT', 'TT', 'A', 'SD', 'SB', 'DB', 'NB', 'CC', 'CR', 'RUN', 'CCH', 'C', 'Q'])
    /* the pairwise rules that insertion must never disturb */
    expect(RANK.RUN).toBeGreaterThan(RANK.CR)
    expect(RANK.C).toBeGreaterThan(RANK.RUN)
    expect(RANK.Q).toBeGreaterThan(RANK.C)
    /* an illegal pairing is graver than one needing a signature, and a man
       double-booked is graver still */
    expect(RANK.CCH).toBeGreaterThan(RANK.CC)
    expect(RANK.C).toBeGreaterThan(RANK.CCH)
  })
})

describe('a stored override survives a fresh boot (audit2 probe #6)', () => {
  it('initStore reloads the persisted diff before the first validate', async () => {
    /* the reference calls rulesLoad() at module scope, before bootApp — the
       port must reload inside initStore, or an edited threshold silently
       reverts to standard on every page load */
    const { initStore } = await import('../state/store')
    const was = VCONF.crewRest, g = store.get
    ;(store as any).get = (k: any, d: any) => k === 'rules' ? { v: { crewRest: 600 }, s: {} } : g(k, d)
    VCONF.crewRest = RULE_STD.v.crewRest       // simulate the pre-boot default
    initStore()
    ;(store as any).get = g
    expect(VCONF.crewRest).toBe(600)
    VCONF.crewRest = was; rulesLoad()
  })
})
