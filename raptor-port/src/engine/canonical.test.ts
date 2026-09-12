/* CANONICAL DAY CONTENT — Phase 1a of the amendment-engine core build
   (docs/superpowers/specs/2026-09-12-amendment-core-build-plan.md §Phase 1).

   The §5.0 keystone: ONE canonical representation of a day's issued content,
   used identically by snapshot (what publish freezes), diff (highlighting /
   rebase) and the signature digest. This pins two contracts:

   (1) COMPLETENESS — every field of `engine/schema.ts`'s `Day` is classified
       canonical | excluded, so a future field cannot escape unclassified.
   (2) VISIBILITY — mutating ANY canonical field yields a different digest
       (a publishable diff); mutating an excluded field yields NO phantom diff.

   Ordinary TS style (this is a new file, not a ported engine body). */
import { describe, it, expect } from 'vitest'
import { DAYS } from './data'
import { WEEK2_DAYS } from './week2'
import { DAY_CANONICAL_FIELDS, DAY_EXCLUDED_FIELDS, canonicalContent, digest } from './canonical'

const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v))

/* Mirror of engine/schema.ts `Day` top-level keys. If `Day` grows a field this
   list and the classification in canonical.ts must both be updated — schema.ts's
   DAY spec (schema.test.ts) is the other mirror and goes red first. */
const ALL_DAY_KEYS = [
  'dow', 'dt', 'wc', 'today', 'notes', 'allhands', 'waves', 'sims', 'dutywaves',
  'ground', 'simnotes', 'prognotes', 'dutynotes', 'grndnotes', 'secOrder', 'gman',
].sort()

/* A controlled day with every content structure present, so the visibility
   cases below are deterministic rather than hostage to what seed[0] happens to
   carry. Person-valued cells use real-looking ids; canonicalContent folds them
   the same way dayKeys does. */
const fixture = () => ({
  dow: 'Monday', dt: 'Jul 13', wc: '4 X 4 X 0', today: true,
  notes: ['overall note'],
  allhands: [{ prog: 'SQN BRIEF', str: '0800', end: '0830', who: 'EXT', rmks: 'r' }],
  waves: [{
    label: 'WAVE 1', night: false, intimes: ['0700'], traffic: [], standalone: false, noconf: false,
    formations: [{
      cs: 'VIPER', msn: 'CAP', to: '08:00', ld: '09:00',
      aircraft: [{ p: 'p1', w: 'p2', area: 'NORTH', rmks: '', opts: {} }],
    }],
  }],
  sims: { amt: [{ label: 'AMT 1', str: '1000', end: '1100' }], oft: [] as any[] },
  dutywaves: [{ label: 'DUTIES', rows: [{ role: 'SOF', id: 'p1', str: '0800', end: '1700' }] }],
  ground: [{ prog: 'GND EVT', str: '', end: '', who: '' }],
  simnotes: '', prognotes: '', dutynotes: '', grndnotes: '',
}) as any

describe('canonical day schema — completeness (§5.0)', () => {
  it('canonical ∪ excluded == every Day field, with no field classified twice', () => {
    const union = [...DAY_CANONICAL_FIELDS, ...DAY_EXCLUDED_FIELDS]
    expect([...union].sort()).toEqual(ALL_DAY_KEYS)
    expect(new Set(union).size).toBe(union.length)
  })
  it('every top-level key present in any seed day is classified', () => {
    const classified = new Set<string>([...DAY_CANONICAL_FIELDS, ...DAY_EXCLUDED_FIELDS])
    const seen = new Set<string>()
    ;[...DAYS, ...WEEK2_DAYS].forEach((d: any) => Object.keys(d).forEach(k => seen.add(k)))
    expect([...seen].filter(k => !classified.has(k))).toEqual([])
  })
})

describe('digest — visibility of canonical vs excluded changes', () => {
  const di = 0
  const h0 = digest(fixture(), di)

  it('identical content ⇒ identical digest', () => {
    expect(digest(fixture(), di)).toBe(h0)
  })

  it('excluded fields produce no phantom diff', () => {
    const muts: Array<[string, (d: any) => void]> = [
      ['dow', d => { d.dow = 'XDAY' }],
      ['dt', d => { d.dt = 'X 99' }],
      ['wc', d => { d.wc = '9 X 9 X 9' }],
      ['today', d => { d.today = !d.today }],
      ['secOrder', d => { d.secOrder = ['ground', 'waves'] }],
      ['gman', d => { d.gman = true }],
    ]
    for (const [name, mut] of muts) {
      const d = fixture(); mut(d)
      expect(digest(d, di), `excluded ${name} must not change the digest`).toBe(h0)
    }
  })

  it('a row rid change produces no phantom diff (rid is a join key, not content)', () => {
    const d = fixture(); d.waves[0].formations[0].rid = 'zzz-test'
    expect(digest(d, di)).toBe(h0)
  })

  it('each canonical change is visible — including fields dayKeys omitted', () => {
    const changes: Array<[string, (d: any) => void]> = [
      ['notes', d => { d.notes = [...d.notes, 'new'] }],
      ['simnotes', d => { d.simnotes = 'x' }],
      ['prognotes', d => { d.prognotes = 'x' }],
      ['dutynotes', d => { d.dutynotes = 'x' }],
      ['grndnotes', d => { d.grndnotes = 'x' }],
      ['allhands.prog', d => { d.allhands[0].prog += '!' }],
      ['waves.label', d => { d.waves[0].label += '!' }],
      ['formation.cs', d => { d.waves[0].formations[0].cs += '!' }],
      ['aircraft.p', d => { d.waves[0].formations[0].aircraft[0].p = 'p9' }],
      ['sim.label', d => { d.sims.amt[0].label += '!' }],
      ['dutyrow.role', d => { d.dutywaves[0].rows[0].role += '!' }],
      ['ground.prog', d => { d.ground[0].prog += '!' }],
      // fields the old dayKeys projection OMITTED — must now be captured:
      ['wave.standalone', d => { d.waves[0].standalone = true }],
      ['wave.noconf', d => { d.waves[0].noconf = true }],
      ['formation.shift', d => { d.waves[0].formations[0].shift = 'AM' }],
      ['formation.cxr', d => { d.waves[0].formations[0].cx = true; d.waves[0].formations[0].cxr = 'weather' }],
      ['dutyblock.sa', d => { d.dutywaves[0].sa = 'sc' }],
      ['dutyblock.noconf', d => { d.dutywaves[0].noconf = true }],
      ['dutyrow.cxr', d => { d.dutywaves[0].rows[0].cx = true; d.dutywaves[0].rows[0].cxr = 'wx' }],
      // Phase 2 additions — dayKeys packed these into composites (ar:/at:) or
      // omitted them (ground src); canonicalContent must surface each on its own:
      ['ground.src', d => { d.ground[0].src = 'inp99' }],
      ['aircraft.area', d => { d.waves[0].formations[0].aircraft[0].area = 'SOUTH' }],
      ['aircraft.atime', d => { d.waves[0].formations[0].aircraft[0].atime = '08:00-09:00' }],
      ['formation.area', d => { d.waves[0].formations[0].area = 'EAST' }],
      ['formation.atime', d => { d.waves[0].formations[0].atime = '10:00-11:00' }],
    ]
    for (const [name, mut] of changes) {
      const d = fixture(); mut(d)
      expect(digest(d, di), `canonical ${name} change must alter the digest`).not.toBe(h0)
    }
  })
})
