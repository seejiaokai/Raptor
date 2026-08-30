/* THE ADMIN-SET DEFAULT ARRANGEMENT (owner, 29 Aug 26 pt.2 — "allow the default
   arrangement of a schedule to be configured in admin … even to the arrangement of
   the waves under display"). Two global defaults:
   • Section order — a fallback for secOrder (engine/order.ts): an un-arranged day
     renders in the admin's house order; a day with its own secOrder still wins. It
     is DISPLAY only, so setting it changes NOTHING the validator reads — pinned by
     the rules-safety guard below (the owner's "don't corrupt the rules" line).
   • Flying-wave order — the order a NEW wave is placed by (engine/reorder.ts
     waveInsertSlot, applied in ui/board.ts addWave). Off by default: unset ⇒ a new
     wave appends, exactly as before.
   Backend shim + DAYS snapshot/restore follow wavetpl.test.ts / secorder.test.ts so
   nothing leaks between tests. */
import { beforeEach, describe, expect, it } from 'vitest'
import { store, storeBackend } from './hooks'
import { DAYS } from './data'
import { SCHED } from './publish'
import { validate, WARN } from './validate'
import {
  SECTIONS, secOrder, secDefault, setSecDefault, moveSecDefault,
  secDefaultSave, secDefaultLoad, secDefaultReset,
} from './order'
import {
  waveDefault, waveDefaultView, setWaveDefault, moveWaveDefault,
  waveDefaultSave, waveDefaultLoad, waveDefaultReset, waveInsertSlot, waveKindOf,
} from './reorder'
import { makeStandalone } from './waves'

const mem: Record<string, string> = {}
const fake = {
  getItem: (k: string) => (k in mem ? mem[k]! : null),
  setItem: (k: string, v: string) => { mem[k] = v },
}
const DSNAP = JSON.stringify(DAYS)
beforeEach(() => {
  Object.keys(mem).forEach(k => delete mem[k])
  storeBackend.impl = fake
  secDefaultReset(); waveDefaultReset()
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  SCHED.pending = {}; SCHED.changes = {}; SCHED.added = {}; SCHED.als = []
})

describe('the default SECTION order', () => {
  it('defaults to the canonical five', () => {
    expect(secDefault()).toEqual(['prog', 'waves', 'duty', 'sims', 'ground'])
    expect(secDefault()).toEqual(SECTIONS)
  })

  it('nudges up and down, clamped at the ends', () => {
    expect(moveSecDefault('ground', -1)).toBe(true)   // ground up one
    expect(secDefault()).toEqual(['prog', 'waves', 'duty', 'ground', 'sims'])
    expect(moveSecDefault('prog', -1)).toBe(false)    // already top — no-op
    expect(moveSecDefault('sims', 1)).toBe(false)     // already bottom — no-op
    expect(moveSecDefault('nope', -1)).toBe(false)    // unknown key — no-op
  })

  it('setSecDefault drops junk and completes a partial list to the full five', () => {
    setSecDefault(['ground', 'ground', 'junk', 'prog'])   // repeat + unknown, missing waves/duty/sims
    expect(secDefault()).toEqual(['ground', 'prog', 'waves', 'duty', 'sims'])
  })

  it('an un-arranged day follows the house default; a day with its own order wins', () => {
    setSecDefault(['ground', 'prog', 'waves', 'duty', 'sims'])
    const plain = { waves: [], ground: [] }                 // no secOrder of its own
    expect(secOrder(plain)).toEqual(['ground', 'prog', 'waves', 'duty', 'sims'])
    const arranged = { secOrder: ['sims', 'prog'] }         // explicitly arranged
    // its own picks lead, then the HOUSE default fills the rest (not raw canonical)
    expect(secOrder(arranged)).toEqual(['sims', 'prog', 'ground', 'waves', 'duty'])
  })

  it('persists only when it differs from canonical, and sanitises a hand-edited value', () => {
    secDefaultSave()
    expect(store.get('secdefault', 'X')).toBe(null)          // canonical writes nothing
    setSecDefault(['duty', 'prog', 'waves', 'sims', 'ground'])
    secDefaultSave()
    expect(store.get('secdefault', null)).toEqual(['duty', 'prog', 'waves', 'sims', 'ground'])
    secDefaultReset(); secDefaultLoad()                      // reload the saved value
    expect(secDefault()).toEqual(['duty', 'prog', 'waves', 'sims', 'ground'])
    mem['sqn142_secdefault'] = JSON.stringify(['junk', 42, 'ground'])   // garbage in storage
    secDefaultLoad()
    expect(secDefault()).toEqual(['ground', 'prog', 'waves', 'duty', 'sims'])  // salvaged + completed
  })

  it('RULES-SAFETY: changing the house default cannot move a single validate() warning', () => {
    validate()
    const warnBefore = JSON.stringify(WARN)
    setSecDefault(['ground', 'sims', 'duty', 'waves', 'prog'])   // a wholly reversed house order
    validate()
    expect(JSON.stringify(WARN), 'section order is display-only — the rules read the same').toBe(warnBefore)
  })
})

describe('the default FLYING-WAVE order', () => {
  const fly = (label: string) => ({ label, formations: [] })    // ordinary wave — kind 'fly'

  it('is OFF by default; the panel shows the canonical kinds as a starting point', () => {
    expect(waveDefault()).toEqual([])
    expect(waveDefaultView()).toEqual(['fly', 'sc', 'avalon', 'bb'])
  })

  it('waveKindOf reads a standalone by its kind and an ordinary wave as fly', () => {
    expect(waveKindOf(makeStandalone('sc'))).toBe('sc')
    expect(waveKindOf(makeStandalone('avalon'))).toBe('avalon')
    expect(waveKindOf(fly('WAVE 1'))).toBe('fly')
    expect(waveKindOf({})).toBe('fly')
  })

  it('nudging materialises the house order from the canonical view', () => {
    expect(waveDefault()).toEqual([])
    expect(moveWaveDefault('sc', -1)).toBe(true)               // SC up one
    expect(waveDefault()).toEqual(['sc', 'fly', 'avalon', 'bb'])
    expect(moveWaveDefault('sc', -1)).toBe(false)              // now at top
  })

  it('setWaveDefault keeps only known kinds and stays empty for pure junk', () => {
    setWaveDefault(['sc', 'sc', 'junk', 'fly'])
    expect(waveDefault()).toEqual(['sc', 'fly'])               // dedup + drop unknown, NOT auto-completed
    setWaveDefault(['nonsense', 7])
    expect(waveDefault()).toEqual([])                          // all junk ⇒ stays unset
  })

  it('waveInsertSlot places a new wave by kind without disturbing the existing order', () => {
    setWaveDefault(['sc', 'fly', 'avalon', 'bb'])
    const sc = makeStandalone('sc')
    // SC added to two flying waves lands on top
    expect(waveInsertSlot([fly('1'), fly('2')], 'sc')).toBe(0)
    // a new flying wave appends after the existing flying waves (below the SC)
    expect(waveInsertSlot([sc, fly('1')], 'fly')).toBe(2)
    // a second SC groups after the first SC, above the flying waves
    expect(waveInsertSlot([sc, fly('1'), fly('2')], 'sc')).toBe(1)
    // an AVALON (ranks after fly) appends past a lone flying wave
    expect(waveInsertSlot([fly('1')], 'avalon')).toBe(1)
  })

  it('with no house order set, a new wave always appends (unchanged behaviour)', () => {
    expect(waveInsertSlot([fly('1'), fly('2')], 'sc')).toBe(2)
    expect(waveInsertSlot([], 'fly')).toBe(0)
  })

  it('persists only when set, and sanitises a hand-edited value', () => {
    waveDefaultSave()
    expect(store.get('wavedefault', 'X')).toBe(null)           // unset writes nothing
    setWaveDefault(['sc', 'fly'])
    waveDefaultSave()
    expect(store.get('wavedefault', null)).toEqual(['sc', 'fly'])
    waveDefaultReset(); waveDefaultLoad()
    expect(waveDefault()).toEqual(['sc', 'fly'])
    mem['sqn142_wavedefault'] = JSON.stringify(['bb', 'junk', 'sc'])
    waveDefaultLoad()
    expect(waveDefault()).toEqual(['bb', 'sc'])                // salvaged, unknown dropped
  })
})
