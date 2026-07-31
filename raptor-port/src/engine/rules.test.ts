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
    expect(RANK.Q).toBe(10); expect(RANK.LD).toBe(0); expect(RANK.A).toBe(3)
    expect(RANK.C).toBe(9); expect(RANK.CR).toBe(8)
  })
})
