// src/tracker/app/sylIds.migration.test.ts
/* THE SYLLABUS-ID MIGRATION ([TRK-CSID] 1B-ii) — the KEEP/RESET payload-journal
   conversion, driven directly against a seeded store (no DOM / full init). It
   mirrors how courseIds.test.ts pins the pure converter, but here exercises the
   in-core migrateSylIds: the global chart catalogue is converted IN PLACE (the
   hand-drawn charts + layouts + order/prefs, KEPT) and the per-(course,syllabus)
   student layer is RESET.

   INVARIANT HARNESS (SEQ-001), classified:
   - HARD  built-ins get their deterministic sb… ids; a custom gets an sc… id;
           the catalogue index is written; both flags land; the student layer is
           gone; plan re-points by id; a moved built-in box (layout) survives.
   - HARD  the run is idempotent — a second pass is a no-op.
   - FROZEN the built-in ids never change (records file under them). */
import { beforeEach, describe, expect, it } from 'vitest'
import * as core from './core.js'
import { useStorageImpl, storage } from '../storage.js'
import { isSylId, isBuiltinSylId, builtinIdByName } from './sylIds.js'

/* a Map-backed store so a seed is deterministic and isolated from localStorage */
function makeStore(seed: Record<string, any>) {
  const m = new Map<string, string>()
  for (const [k, v] of Object.entries(seed)) m.set(k, typeof v === 'string' ? v : JSON.stringify(v))
  useStorageImpl({ get: (k: string) => (m.has(k) ? m.get(k)! : null), set: (k: string, v: string) => { m.set(k, v) }, remove: (k: string) => { m.delete(k) }, keys: () => [...m.keys()] })
  return m
}
const get = async (k: string) => { const r = await storage.get(k); return r ? r.value : null }
const getJSON = async (k: string) => { const v = await get(k); return v == null ? null : JSON.parse(v) }

/* a realistic POST-Phase-1 store (courses id-keyed) that is still syllabus-NAME
   -keyed: a custom chart, a moved built-in box, name-keyed prefs, a course whose
   plan points at a built-in by name and whose student layer is name-keyed. */
const seed = () => ({
  'v3:courses': [{ id: 'cx1', name: '26ABSG' }],       // id-keyed courses, but courseidmig NOT set so migrateCourseIds fills COURSES
  'v3:cx1:plan': { sylName: '2026', custom: false, epw: 3, lulls: [{ start: 'x', end: 'y' }], target: '2026-12-01' },
  'v3:cx1:rostermig': '1',
  'v3:cx1:idmig': '1',
  'v3:cx1:2026:roster': [{ id: 'sA', name: 'ALPHA' }],
  'v3:cx1:2026:m:sA': { 'ST-01': { g: 'dco' } },
  'v3:cx1:pace:sA': { epw: 5 },
  'v3:master:syls': { 'MY CHART': [{ id: 'X-1', type: 'acad', prereqs: [] }] },   // a custom chart (name-keyed)
  'v3:master:lay:2026': { 'ST-01': { x: 5, y: 6 } },                              // a moved built-in box
  'v3:master:lay:MY CHART': { 'X-1': { x: 1, y: 2 } },
  'v3:master:sylorder': ['2024', '2026', 'Tx 2026', 'A/G - A/A 2026', 'MY CHART'],
  'v3:master:sylhidden': [],
  'v3:master:syltomb': {},
  'v3:master:sylalias': { 'FG JUL 26': '2026' },      // a retired pref — must be purged
})

describe('migrateSylIds — KEEP the catalogue, RESET the student layer', () => {
  beforeEach(() => { try { core.clearBootError() } catch (_) {} })

  it('converts the global catalogue in place and clears the student layer', async () => {
    makeStore(seed())
    expect(await core.migrateCourseIds(), 'course layer settles first (fills COURSES)').toBe(true)
    expect(await core.migrateSylIds(), 'the syllabus migration succeeds').toBe(true)
    expect(core.bootError, 'no fail-closed boot').toBeNull()

    /* both flags landed, journal cleared */
    expect(await get('v3:sylcatmig')).toBe('1')
    expect(await get('v3:sylreset')).toBe('1')
    expect(await get('v3:syljournal'), 'the journal is gone once done').toBeNull()

    /* the catalogue index: 4 built-ins under their deterministic ids + the custom */
    const cat = await getJSON('v3:master:sylcat')
    const byName: any = Object.fromEntries(cat.map((e: any) => [e.name, e]))
    expect(byName['2026'].id).toBe('sb2026')
    expect(byName['2026'].base).toBe('2026')
    expect(byName['2024'].id).toBe('sb2024')
    expect(byName['Tx 2026'].id).toBe('sbtx2026')
    const my = cat.find((e: any) => e.name === 'MY CHART')
    expect(my && isSylId(my.id) && !isBuiltinSylId(my.id), 'the custom got an sc… id').toBe(true)

    /* definitions re-keyed by id; the custom def under its id, name key gone */
    const defs = await getJSON('v3:master:syls')
    expect(Object.keys(defs).every(isSylId), 'the def store is id-keyed').toBe(true)
    expect(defs[my.id]).toEqual([{ id: 'X-1', type: 'acad', prereqs: [] }])
    expect(defs['MY CHART'], 'nothing left under the name').toBeUndefined()

    /* the MOVED BUILT-IN BOX survived, re-keyed onto the built-in id (its event
       key ST-01 already matches the shipped id, so it is carried verbatim) */
    expect(await getJSON('v3:master:lay:sb2026')).toEqual({ 'ST-01': { x: 5, y: 6 } })
    expect(await getJSON(`v3:master:lay:${my.id}`)).toEqual({ 'X-1': { x: 1, y: 2 } })
    expect(await get('v3:master:lay:2026'), 'the name-keyed layout key is purged').toBeNull()
    expect(await get('v3:master:lay:MY CHART')).toBeNull()

    /* the prefs are id-forms; the retired alias pref is purged */
    const order = await getJSON('v3:master:sylorder')
    expect(order.every(isSylId), 'order is ids').toBe(true)
    expect(order).toContain('sb2026'); expect(order).toContain(my.id)
    expect(await get('v3:master:sylalias'), 'the retired alias pref is gone').toBeNull()

    /* RESET: the student layer under the course is cleared; the plan re-points
       by id and its legacy pace fallbacks are zeroed (epw kept as a default) */
    expect(await get('v3:cx1:2026:roster'), 'the name-keyed roster is gone').toBeNull()
    expect(await get('v3:cx1:2026:m:sA'), 'the marks are gone').toBeNull()
    expect(await get('v3:cx1:pace:sA'), 'per-student pace is gone').toBeNull()
    const plan = await getJSON('v3:cx1:plan')
    expect(plan.sylId).toBe('sb2026')            // '2026' mapped to its built-in id
    expect(plan.sylName, 'the legacy name pointer is dropped').toBeUndefined()
    expect(plan.lulls).toEqual([]); expect(plan.target).toBeNull()
    expect(plan.epw, 'epw kept as a course default').toBe(3)
    expect(await get('v3:cx1:rostermig')).toBe('1')
    expect(await get('v3:cx1:idmig')).toBe('1')
  })

  it('is idempotent — a second run changes nothing', async () => {
    makeStore(seed())
    await core.migrateCourseIds(); await core.migrateSylIds()
    const cat1 = await get('v3:master:sylcat'), defs1 = await get('v3:master:syls'), lay1 = await get('v3:master:lay:sb2026')
    expect(await core.migrateSylIds(), 'a second pass is a no-op success').toBe(true)
    expect(await get('v3:master:sylcat')).toBe(cat1)
    expect(await get('v3:master:syls')).toBe(defs1)
    expect(await get('v3:master:lay:sb2026')).toBe(lay1)
  })

  it('a fresh store (no charts, no students) still builds the built-in catalogue', async () => {
    makeStore({ 'v3:courses': [{ id: 'cx1', name: '26ABSG' }] })
    expect(await core.migrateCourseIds()).toBe(true)
    expect(await core.migrateSylIds()).toBe(true)
    const cat = await getJSON('v3:master:sylcat')
    expect(cat.map((e: any) => e.id).sort()).toEqual(['sb2024', 'sb2026', 'sbagaa2026', 'sbtx2026'])
    expect(builtinIdByName('2026')).toBe('sb2026')
  })
})
