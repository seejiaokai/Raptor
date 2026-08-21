/* THE RULES STAY FLEXIBLE, AND THE FLEXIBLE ONES REALLY DRIVE THE ENGINE
   (owner, 21 Aug 26 — "could u explore the logic rules and see what can be
   made editable. I don't wanna hard code too many things… make sure it's
   robust and tested"). Two rulings landed the same afternoon:

     simLen   — a sim row with no end time runs this long. Promoted from a
                hard-coded 90 that sat in events.ts AND avail.ts (drift
                seam); now one Logic-tab setting read by both.
     NAAR     — night AAR is the WAVE's call, not the clock's ("make the
                rule for NAAR instead of a time: if the wave is night and
                AAR is mentioned, it's night AAR. Or NAAR is mentioned").
                The landing-after-19:00 clause is REMOVED from both readers
                (a short-lived aarNight setting went with it — don't bring
                a clock back into this rule); refwin.ts:reaar() excises the
                reference's identical clauses so parity holds everywhere.

   What this pins: the sim default reproduces the old behaviour (parity
   rests on it), BOTH readers of each rule agree (validator and picker),
   the loose ruleParse grammar, and save/load/reset round-trips. The UI
   half — the Logic tab boxes — is pinned in ui/logic.test.tsx. */
import { afterEach, describe, expect, it } from 'vitest'
import { DAYS } from './data'
import { validate, WARN, EVD } from './validate'
import { VCONF, RULE_STD, RULE_SPEC, ruleParse, rulesSave, rulesLoad, rulesReset } from './rules'
import { slotRules } from './avail'
import { storeBackend } from './hooks'

const DSNAP = JSON.stringify(DAYS)
afterEach(() => {
  rulesReset()
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  validate()
})

describe('the squadron standard carries the new key', () => {
  it('simLen is 90 by standard — the old literal exactly — and aarNight is gone for good', () => {
    expect(RULE_STD.v.simLen).toBe(90)
    expect(RULE_SPEC.simLen.lo).toBeGreaterThanOrEqual(15)
    /* the owner removed the clock from the NAAR rule the same day it nearly
       became a setting — neither the setting nor the literal may return */
    expect(VCONF.aarNight, 'no aarNight in VCONF').toBeUndefined()
    expect(RULE_SPEC.aarNight, 'no aarNight offered to the Logic tab').toBeUndefined()
  })
  it('showLead is gone the same way — step is the ONE step-timing knob', () => {
    /* owner, 21 Aug 26: "can I confirm this rule will still work if I change
       the rules for step default timing?" It could not, while a second key
       carried the crew-rest late-show line at its own 60 — editing "Step
       before take-off" moved the busy windows and not the breach line. One
       key now; the crew-rest side is exercised in brieftime.test.ts, the
       busy-window side in avail.test.ts, and both read VCONF.step. */
    expect(VCONF.showLead, 'no showLead in VCONF').toBeUndefined()
    expect(RULE_SPEC.showLead, 'no showLead offered to the Logic tab').toBeUndefined()
    expect(RULE_STD.v.step).toBe(60)
  })
})

describe('ruleParse tolerates the spellings a scheduler actually types', () => {
  it('a clock field takes 1900, 19:00, 1900H and 19:00L as the same time', () => {
    expect(ruleParse('scDayTo', '1900')).toBe(1140)
    expect(ruleParse('scDayTo', '19:00')).toBe(1140)
    expect(ruleParse('scDayTo', '1900H')).toBe(1140)
    expect(ruleParse('scDayTo', '19:00L')).toBe(1140)
    expect(ruleParse('scDayFrom', '0700h')).toBe(420)
  })
  it('garbage and impossible clocks come back null, never a number', () => {
    expect(ruleParse('scDayTo', 'abc')).toBeNull()
    expect(ruleParse('scDayTo', '')).toBeNull()
    /* the H strip must not make "H" alone parse */
    expect(ruleParse('scDayTo', 'H')).toBeNull()
  })
  it('a duration field still reads 90, 90 min and 2h alike — and never strips a real digit', () => {
    expect(ruleParse('simLen', '90')).toBe(90)
    expect(ruleParse('simLen', '90 min')).toBe(90)
    expect(ruleParse('simLen', '2h')).toBe(120)
  })
})

describe('night AAR is the wave, or the word — never the clock', () => {
  /* fantom is a CAT D pilot: DAAR current, NAAR not (people.ts grants naar
     only to instructors and CAT A/B). His bare AAR lands 19:30 — under the
     removed clock rule that was night; under the owner's rule it is DAY,
     because the wave is a day wave. Flip the wave to night, or write NAAR
     outright, and the night check fires. */
  const plantAAR = (rmks = 'AAR') => {
    const w: any = (DAYS[0] as any).waves.find((x: any) => (x.formations || []).length)
    const f = w.formations[0]
    w.night = false
    /* colon format — the model stores '12:40' and toMin() reads nothing else
       (the board's 4-digit entry is normalised at the write path) */
    f.to = '18:00'; f.ld = '19:30'
    f.aircraft[0].p = 'fantom'; f.aircraft[0].w = ''; f.aircraft[0].rmks = rmks
    return { w, key: `0.${(DAYS[0] as any).waves.indexOf(w)}.0.0.p` }
  }
  const aarWarn = () => ((WARN.byDay.find((g: any) => g.di === 0) || {}).warns || [])
    .some((w: any) => w.code === 'AAR_QUAL' && (w.who || []).includes('fantom'))

  it('a bare AAR landing 19:30 on a DAY wave is day AAR — no clock tips it', () => {
    plantAAR(); validate()
    expect(aarWarn(), 'he holds DAAR, so a day read stays silent').toBe(false)
  })

  it('the same sortie on a NIGHT wave is night AAR, and the currency check fires', () => {
    const { w } = plantAAR(); w.night = true; validate()
    expect(aarWarn(), 'NAAR asked of a DAAR-only pilot').toBe(true)
  })

  it('writing NAAR outright asks for night whatever the wave says', () => {
    plantAAR('NAAR'); validate()
    expect(aarWarn(), 'the word overrides the day wave').toBe(true)
  })

  it('the crew picker reads the SAME rule — no clock clause left to drift', () => {
    const { w, key } = plantAAR(); validate()
    expect(slotRules(key).aar).toBe('DAAR')
    w.night = true; validate()
    expect(slotRules(key).aar).toBe('NAAR')
  })
})

describe('simLen drives the window of an open-ended sim row', () => {
  /* waldo sims at 10:00 with no end written and has a meeting-shaped ground
     event 11:15–12:00. At the standard 90 the sim runs to 11:30 and the two
     collide; at 60 it ends 11:00 clear. The warning must follow the rule. */
  const plant = () => {
    const d: any = DAYS[0]
    d.sims = d.sims || {}; d.sims.oft = d.sims.oft || []
    d.sims.oft.push({ label: 'BFM-9', str: '1000', end: '', p: '', w: 'waldo', rmks: '' })
    d.ground = d.ground || []
    d.ground.push({ prog: 'MTG', str: '1115', end: '1200', who: 'waldo' })
  }
  const clash = () => ((WARN.byDay.find((g: any) => g.di === 0) || {}).warns || [])
    .some((w: any) => w.code === 'DOUBLE_BOOK' && (w.who || []).includes('waldo'))

  it('the clash appears at 90 and clears at 60, live', () => {
    plant(); validate()
    expect(clash(), 'sim 10:00–11:30 against 11:15 meeting').toBe(true)
    VCONF.simLen = 60; validate()
    expect(clash(), 'sim 10:00–11:00 is clear of it').toBe(false)
  })
})

describe('the new keys ride save / load / reset like every other rule', () => {
  it('an off-standard simLen survives the round trip; reset restores 90', () => {
    const mem: any = {}
    const was = storeBackend.impl
    storeBackend.impl = { getItem: (k: string) => (k in mem ? mem[k] : null), setItem: (k: string, v: string) => { mem[k] = v } }
    try {
      VCONF.simLen = 120
      rulesSave()
      VCONF.simLen = 90                                  // simulate a fresh boot
      rulesLoad()
      expect(VCONF.simLen).toBe(120)
      rulesReset()
      expect(VCONF.simLen).toBe(90)
      /* reset also cleared the stored overrides — a reload stays standard */
      rulesLoad()
      expect(VCONF.simLen).toBe(90)
    } finally { storeBackend.impl = was }
  })

  it('a poisoned store — strings, out-of-bounds, dead keys — cannot reach the engine', () => {
    const was = storeBackend.impl
    storeBackend.impl = {
      getItem: (k: string) => k === 'sqn142_rules' ? JSON.stringify({ v: { simLen: 9999, crewRest: '840', aarNight: 1200, showLead: 45 } }) : null,
      setItem: () => {},
    }
    try {
      rulesLoad()
      expect(VCONF.simLen, 'out of bounds refused').toBe(90)
      expect(VCONF.crewRest, 'string refused').toBe(720)
      /* a stored override for a REMOVED key must not resurrect it — aarNight
         and showLead both died this way (21 Aug 26) */
      expect(VCONF.aarNight, 'a dead key stays dead').toBeUndefined()
      expect(VCONF.showLead, 'showLead stays dead too').toBeUndefined()
    } finally { storeBackend.impl = was }
  })
})

describe('rules that lean on each other survive ANY legal combination', () => {
  /* The owner's standing worry (21 Aug 26 — "check if I manually change the
     rules and for rules that depend on one another's assumption, will it
     break and have a bug"). The Logic tab only admits values inside each
     rule's RULE_SPEC bounds, so the space a user can actually reach is every
     combination of those bounds — including the ones that invert an
     assumption: a brief lead of 0, a step wider than the brief lead, an SC
     day window that closes before it opens, crew rest at a full 24 hours.
     The engine must stay COHERENT under all of them: never throw, and never
     print a message with a hole in it (NaN, undefined, Infinity — each one a
     real failure mode of minute arithmetic on a half-set rule). Rules with
     a stated interdependence handle it explicitly — the tight turn already
     takes max(tightTurn, dekit+step) — and this sweep is the net under
     everything else. */
  const sweep = (pick: (k: string, i: number) => number) => {
    Object.keys(RULE_SPEC).forEach((k: any, i: number) => { VCONF[k] = pick(k, i) })
    const W = validate()
    const msgs: string[] = []
    W.byDay.forEach((g: any) => (g.warns || []).forEach((w: any) => msgs.push(String(w.msg))))
    msgs.forEach(m => {
      expect(m, 'no half-computed time in any warning').not.toMatch(/NaN|undefined|Infinity/)
    })
    return msgs.length
  }
  it('every rule at its LOWEST legal value', () => {
    expect(sweep((k: any) => RULE_SPEC[k].lo)).toBeGreaterThanOrEqual(0)
  })
  it('every rule at its HIGHEST legal value', () => {
    expect(sweep((k: any) => RULE_SPEC[k].hi)).toBeGreaterThanOrEqual(0)
  })
  it('alternating extremes — the combinations that invert assumptions', () => {
    /* even keys low, odd keys high on one pass; flipped on the second. Both
       orders, because "step wider than briefLead" and "briefLead wider than
       step" break different assumptions. */
    sweep((k: any, i: number) => i % 2 ? RULE_SPEC[k].hi : RULE_SPEC[k].lo)
    sweep((k: any, i: number) => i % 2 ? RULE_SPEC[k].lo : RULE_SPEC[k].hi)
  })
})
