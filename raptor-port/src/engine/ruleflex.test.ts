/* THE PROMOTED SETTINGS REALLY DRIVE THE ENGINE (owner, 21 Aug 26 — "could u
   explore the logic rules and see what can be made editable. I don't wanna
   hard code too many things and have no flexibility… make sure it's robust
   and tested"). Two literals became VCONF settings in this pass:

     aarNight — a bare AAR reads as NIGHT when the sortie lands after this
                (was a hard-coded 19:00, in TWO places: the validator's
                collectEvents and the crew picker's slotRules — a drift seam
                exactly of the kind the owner warned about);
     simLen   — a sim row with no end time runs this long (was a hard-coded
                90, in events.ts AND avail.ts's personBusy/slotRules).

   What this pins, per setting: the default reproduces the old behaviour
   byte-for-byte (reference parity rests on this), BOTH readers move when
   the setting moves (validator and picker stay in sync), and the loose
   ruleParse grammar plus save/load/reset round-trips cover the new keys.
   The UI half — the Logic tab boxes — is pinned in ui/logic.test.tsx. */
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

describe('the squadron standard carries the new keys', () => {
  it('aarNight is 19:00 and simLen 90 by standard — the old literals exactly', () => {
    expect(RULE_STD.v.aarNight).toBe(19 * 60)
    expect(RULE_STD.v.simLen).toBe(90)
    /* and both are offered to the Logic tab with sane bounds */
    expect(RULE_SPEC.aarNight.u).toBe('time')
    expect(RULE_SPEC.simLen.lo).toBeGreaterThanOrEqual(15)
  })
})

describe('ruleParse tolerates the spellings a scheduler actually types', () => {
  it('a clock field takes 1900, 19:00, 1900H and 19:00L as the same time', () => {
    expect(ruleParse('aarNight', '1900')).toBe(1140)
    expect(ruleParse('aarNight', '19:00')).toBe(1140)
    expect(ruleParse('aarNight', '1900H')).toBe(1140)
    expect(ruleParse('aarNight', '19:00L')).toBe(1140)
    expect(ruleParse('scDayFrom', '0700h')).toBe(420)
  })
  it('garbage and impossible clocks come back null, never a number', () => {
    expect(ruleParse('aarNight', 'abc')).toBeNull()
    expect(ruleParse('aarNight', '')).toBeNull()
    /* the H strip must not make "H" alone parse */
    expect(ruleParse('aarNight', 'H')).toBeNull()
  })
  it('a duration field still reads 90, 90 min and 2h alike — and never strips a real digit', () => {
    expect(ruleParse('simLen', '90')).toBe(90)
    expect(ruleParse('simLen', '90 min')).toBe(90)
    expect(ruleParse('simLen', '2h')).toBe(120)
  })
})

describe('aarNight drives BOTH readers of the day/night call', () => {
  /* fantom is a CAT D pilot: DAAR current, NAAR not (people.ts grants naar
     only to instructors and CAT A/B). Put him on a bare AAR landing 19:30 —
     night at the standard 19:00, so AAR_QUAL fires; move the night line to
     20:00 and the same sortie reads DAAR, which he holds, and it clears. */
  const plantAAR = () => {
    const w: any = (DAYS[0] as any).waves.find((x: any) => (x.formations || []).length)
    const f = w.formations[0]
    w.night = false
    /* colon format — the model stores '12:40' and toMin() reads nothing else
       (the board's 4-digit entry is normalised at the write path) */
    f.to = '18:00'; f.ld = '19:30'
    f.aircraft[0].p = 'fantom'; f.aircraft[0].w = ''; f.aircraft[0].rmks = 'AAR'
    const gi = (DAYS[0] as any).waves.indexOf(w)
    return `0.${gi}.0.0.p`
  }
  const aarWarn = () => ((WARN.byDay.find((g: any) => g.di === 0) || {}).warns || [])
    .some((w: any) => w.code === 'AAR_QUAL' && (w.who || []).includes('fantom'))

  it('the validator: lands 19:30 → NAAR wanted at standard (warning), DAAR once night starts at 20:00 (clear)', () => {
    plantAAR(); validate()
    expect(aarWarn(), 'NAAR asked of a DAAR-only pilot').toBe(true)
    VCONF.aarNight = 20 * 60; validate()
    expect(aarWarn(), 'the same sortie is day AAR now, and he is current').toBe(false)
  })

  it('the crew picker reads the SAME setting — no second 19:00 left to drift', () => {
    const key = plantAAR(); validate()
    expect(slotRules(key).aar).toBe('NAAR')
    VCONF.aarNight = 20 * 60; validate()
    expect(slotRules(key).aar).toBe('DAAR')
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
  it('an off-standard aarNight survives the round trip; reset restores 19:00', () => {
    const mem: any = {}
    const was = storeBackend.impl
    storeBackend.impl = { getItem: (k: string) => (k in mem ? mem[k] : null), setItem: (k: string, v: string) => { mem[k] = v } }
    try {
      VCONF.aarNight = 20 * 60; VCONF.simLen = 120
      rulesSave()
      VCONF.aarNight = 19 * 60; VCONF.simLen = 90        // simulate a fresh boot
      rulesLoad()
      expect(VCONF.aarNight).toBe(20 * 60)
      expect(VCONF.simLen).toBe(120)
      rulesReset()
      expect(VCONF.aarNight).toBe(19 * 60)
      expect(VCONF.simLen).toBe(90)
      /* reset also cleared the stored overrides — a reload stays standard */
      rulesLoad()
      expect(VCONF.aarNight).toBe(19 * 60)
    } finally { storeBackend.impl = was }
  })

  it('a poisoned store — strings, out-of-bounds — cannot reach the engine', () => {
    const was = storeBackend.impl
    storeBackend.impl = {
      getItem: (k: string) => k === 'sqn142_rules' ? JSON.stringify({ v: { aarNight: '1200', simLen: 9999 } }) : null,
      setItem: () => {},
    }
    try {
      rulesLoad()
      expect(VCONF.aarNight, 'string refused').toBe(19 * 60)
      expect(VCONF.simLen, 'out of bounds refused').toBe(90)
    } finally { storeBackend.impl = was }
  })
})
