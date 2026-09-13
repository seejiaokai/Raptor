// src/tracker/app/sylIds.test.ts
/* The pure syllabus-id converter ([TRK-CSID] 1B-ii): used by the once-per-browser
   migration (core.js migrateSylIds) and by file import (normalizeImport), so the
   two cannot drift. Mirrors app/courseIds.test.ts.

   INVARIANT HARNESS (SEQ-001), classified:
   - FROZEN   the built-in ids in BUILTIN_SYL never change (records file under them).
   - HARD     grammar keeps sb…/sc… apart and out of a global namespace; a built-in
              always resolves by its deterministic id; a historical-alias-with-def
              stays custom; the store id wins on a name reconcile; conflicts refuse.
   - ADVISORY sylcat labels/base round-trip; base is authoritative from the table. */
import { describe, expect, it } from 'vitest'
import {
  BUILTIN_SYL, mintSylId, isSylId, isBuiltinSylId, isCustomSylId, isSylEntry,
  builtinIdByName, builtinIdByAlias, builtinBaseOf, classifyDefinedName,
  upgradeSyllabi, buildUnionSylcat, reconcileSylIds,
} from './sylIds.js'

describe('BUILTIN_SYL table (FROZEN ids)', () => {
  it('ships the four built-ins with permanent sb ids and the 2026 aliases', () => {
    expect(BUILTIN_SYL.map(b => b.id)).toEqual(['sb2024', 'sb2026', 'sbtx2026', 'sbagaa2026'])
    expect(BUILTIN_SYL.map(b => b.name)).toEqual(['2024', '2026', 'Tx 2026', 'A/G - A/A 2026'])
    const y26 = BUILTIN_SYL.find(b => b.id === 'sb2026')!
    expect(y26.aliases).toEqual(['FG JUL 26', 'Default July 26'])
  })
  it('every built-in id passes the grammar and is legible as a built-in', () => {
    for (const b of BUILTIN_SYL) { expect(isSylId(b.id)).toBe(true); expect(isBuiltinSylId(b.id)).toBe(true); expect(isCustomSylId(b.id)).toBe(false) }
  })
})

describe('mintSylId / grammar (HARD)', () => {
  it('mints an sc-prefixed base36 id that is a custom id', () => {
    const id = mintSylId()
    expect(id).toMatch(/^sc[0-9a-z]+$/); expect(isSylId(id)).toBe(true); expect(isCustomSylId(id)).toBe(true); expect(isBuiltinSylId(id)).toBe(false)
  })
  it('rejects ids with a separator or the wrong shape', () => {
    expect(isSylId('master:lay')).toBe(false)   // would clobber v3:master:lay:*
    expect(isSylId('2026')).toBe(false)          // a NAME is not an id
    expect(isSylId('sa123')).toBe(false)         // only sb… / sc…
    expect(isSylId('sbABC')).toBe(false)         // upper-case not in base36 lowercase
    expect(isSylId('')).toBe(false)
  })
})

describe('built-in lookups (HARD)', () => {
  it('resolves canonical names and historical aliases to their id', () => {
    expect(builtinIdByName('2026')).toBe('sb2026')
    expect(builtinIdByName('Tx 2026')).toBe('sbtx2026')
    expect(builtinIdByName('Instructor Edition')).toBeNull()   // a relabel is not a canonical name
    expect(builtinIdByAlias('FG JUL 26')).toBe('sb2026')
    expect(builtinIdByAlias('Default July 26')).toBe('sb2026')
    expect(builtinIdByAlias('2026')).toBeNull()                // canonical, not an alias
  })
  it('base is authoritative from the table', () => {
    expect(builtinBaseOf('sb2026')).toBe('2026')
    expect(builtinBaseOf('sbtx2026')).toBe('Tx 2026')
    expect(builtinBaseOf('scWhatever')).toBeNull()
  })
})

describe('classifyDefinedName — CLASSIFY only, def present (HARD)', () => {
  it('a current canonical name is the built-in', () => {
    expect(classifyDefinedName('2026')).toEqual({ builtin: true, id: 'sb2026', base: '2026' })
    expect(classifyDefinedName('A/G - A/A 2026')).toEqual({ builtin: true, id: 'sbagaa2026', base: 'A/G - A/A 2026' })
  })
  it('a historical alias WITH a def is a CUSTOM, never folded onto the built-in (CSID2-R2-02)', () => {
    expect(classifyDefinedName('FG JUL 26')).toEqual({ builtin: false })
  })
  it('an ordinary name with a def is a custom', () => {
    expect(classifyDefinedName('Training')).toEqual({ builtin: false })
  })
})

describe('upgradeSyllabi (v1/v2 name-keyed charts → id-keyed + sylcat)', () => {
  const v2 = () => ({
    order: ['2026', 'Training', 'FG JUL 26'],
    syllabi: { '2026': [{ id: 'ST-01' }], 'Training': [{ id: 'X-1' }], 'FG JUL 26': [{ id: 'Y-1' }] },
    layouts: { '2026': { 'ST-01': { x: 1, y: 2 } }, 'Training': {}, 'FG JUL 26': {} },
  })
  it('classifies each chart name and re-keys syllabi/layouts/order, building a sylcat', () => {
    const { charts, map } = upgradeSyllabi(v2())
    expect(map['2026']).toBe('sb2026')                 // canonical → built-in
    expect(map['Training']).toMatch(/^sc/)             // custom
    expect(map['FG JUL 26']).toMatch(/^sc/)            // historical alias WITH def → custom
    expect(map['Training']).not.toBe(map['FG JUL 26'])
    expect(charts.syllabi['sb2026']).toEqual([{ id: 'ST-01' }])
    expect(charts.layouts['sb2026']).toEqual({ 'ST-01': { x: 1, y: 2 } })
    expect(charts.order).toEqual(['sb2026', map['Training'], map['FG JUL 26']])
    const y = charts.sylcat.find((e: any) => e.id === 'sb2026')
    expect(y).toEqual({ id: 'sb2026', name: '2026', base: '2026' })
    const t = charts.sylcat.find((e: any) => e.id === map['Training'])
    expect(t).toEqual({ id: map['Training'], name: 'Training' })   // custom: no base
  })
  it('does not mutate its input', () => {
    const src = v2(); const copy = JSON.parse(JSON.stringify(src))
    upgradeSyllabi(src); expect(src).toEqual(copy)
  })
})

describe('buildUnionSylcat (validated union carrying userNamed)', () => {
  it('unions charts + students catalogues and dedupes by id', () => {
    const u = buildUnionSylcat(
      [{ id: 'sb2026', name: '2026' }],
      [{ id: 'sc1', name: 'Training' }],
    )
    expect(u).toEqual([{ id: 'sb2026', name: '2026', base: '2026' }, { id: 'sc1', name: 'Training' }])
  })
  it('makes base authoritative from the table and preserves userNamed (OR of the two)', () => {
    const u = buildUnionSylcat(
      [{ id: 'sb2026', name: 'Instructor Edition', base: 'wrong', userNamed: true }],
      [{ id: 'sb2026', name: 'Instructor Edition' }],
    )
    expect(u).toEqual([{ id: 'sb2026', name: 'Instructor Edition', base: '2026', userNamed: true }])
  })
  it('rejects an unknown sb id (CSID2-R3-03)', () => {
    expect(() => buildUnionSylcat([{ id: 'sbnope', name: 'x' }], null)).toThrow(/ships/)
  })
  it('refuses overlapping ids that disagree on identity, and a label used by two ids', () => {
    expect(() => buildUnionSylcat([{ id: 'sc1', name: 'A' }], [{ id: 'sc1', name: 'B' }])).toThrow(/two different ways/)
    expect(() => buildUnionSylcat([{ id: 'sc1', name: 'Dup' }, { id: 'sc2', name: 'Dup' }], null)).toThrow(/two different/)
  })
})

describe('reconcileSylIds (store id wins; built-ins by deterministic id)', () => {
  const store = [{ id: 'sb2026', name: '2026', base: '2026' }, { id: 'scSTORE', name: 'Training' }]
  it('a file custom whose NAME matches the store adopts the store id', () => {
    const { remapped, conflicts } = reconcileSylIds([{ id: 'scFILE', name: 'Training' }], store)
    expect(conflicts).toEqual([]); expect(remapped).toEqual({ scFILE: 'scSTORE' })
  })
  it('a built-in id is authoritative and never remapped, even under a different store label', () => {
    const store2 = [{ id: 'sb2026', name: 'Instructor Edition', base: '2026' }]
    const { remapped, conflicts } = reconcileSylIds([{ id: 'sb2026', name: '2026', base: '2026' }], store2)
    expect(remapped).toEqual({}); expect(conflicts).toEqual([])
  })
  it('a name matching a store syllabus under a DIFFERENT id is a conflict', () => {
    const { conflicts } = reconcileSylIds([{ id: 'scOTHER', name: 'Training' }, { id: 'scOTHER2', name: 'Training' }], store)
    // scOTHER adopts scSTORE; scOTHER2's name 'Training' now resolves to a taken id → conflict
    expect(conflicts.length).toBe(1); expect(conflicts[0].name).toBe('Training')
  })
  it('two file customs cannot map onto one store id', () => {
    const { remapped } = reconcileSylIds([{ id: 'scF1', name: 'Training' }, { id: 'scF2', name: 'Training' }], store)
    const dests = [remapped['scF1'] || 'scF1', remapped['scF2'] || 'scF2']
    expect(new Set(dests).size).toBe(2)   // no two share a destination id
  })
})
