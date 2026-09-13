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
function makeStore(seed: Record<string, any>, failOnce?: string) {
  const m = new Map<string, string>()
  for (const [k, v] of Object.entries(seed)) m.set(k, typeof v === 'string' ? v : JSON.stringify(v))
  let failed = false
  useStorageImpl({
    get: (k: string) => (m.has(k) ? m.get(k)! : null),
    /* failOnce: swallow the FIRST write to this key (the way sSet drops a "local
       only" failure) so a resumability test can interrupt a specific step */
    set: (k: string, v: string) => { if (failOnce && k === failOnce && !failed) { failed = true; return } m.set(k, v) },
    remove: (k: string) => { m.delete(k) },
    keys: () => [...m.keys()],
  })
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

  it('FAILS CLOSED when two layout keys collide onto one event with DIFFERING values (review CSID-REV-02)', async () => {
    /* the old id ST-1 pads to ST-01, which the layout ALSO holds under a
       different position — a silent first-wins keep would lose one, so the
       migration must refuse (bootError) and leave the source intact. */
    makeStore({
      'v3:courses': [{ id: 'cx1', name: '26ABSG' }],
      'v3:master:lay:2026': { 'ST-1': { x: 1, y: 1 }, 'ST-01': { x: 9, y: 9 } },
    })
    expect(await core.migrateCourseIds()).toBe(true)
    expect(await core.migrateSylIds(), 'the differing collision fails closed').toBe(false)
    expect(core.bootError, 'a fail-closed boot error is set').toBeTruthy()
    expect(await get('v3:sylcatmig'), 'nothing was stamped').toBeNull()
    expect(await get('v3:master:lay:2026'), 'the source layout is left intact').toBeTruthy()
  })

  it('RESET sweeps a syllabus literally named "plan" but keeps the exact plan key (review CSID-REV-07)', async () => {
    makeStore({
      'v3:courses': [{ id: 'cx1', name: '26ABSG' }],
      'v3:cx1:plan': { sylName: '2026', epw: 2 },
      'v3:cx1:rostermig': '1', 'v3:cx1:idmig': '1',
      'v3:cx1:plan:m:sZ': { 'ST-01': { g: 'dco' } },   /* a syllabus NAMED 'plan' — a student record, not the plan */
      'v3:cx1:plan:roster': [{ id: 'sZ', name: 'ZED' }],
    })
    expect(await core.migrateCourseIds()).toBe(true)
    expect(await core.migrateSylIds()).toBe(true)
    expect(await get('v3:cx1:plan:m:sZ'), 'the plan-named syllabus student record is swept').toBeNull()
    expect(await get('v3:cx1:plan:roster'), 'and its roster').toBeNull()
    const plan = await getJSON('v3:cx1:plan')
    expect(plan && plan.sylId, 'the real plan survives, converted to a sylId').toBe('sb2026')
  })

  it('a course pointing at a vanished chart repairs to a LIVE non-tombstoned id, never a deleted default (review CSID-04)', async () => {
    makeStore({
      'v3:courses': [{ id: 'cx1', name: '26ABSG' }],
      'v3:master:syltomb': { '2026': 1 },                 /* the default built-in is DELETED */
      'v3:cx1:plan': { sylName: 'VANISHED CHART' },       /* points at a chart that no longer exists */
      'v3:cx1:rostermig': '1', 'v3:cx1:idmig': '1',
    })
    expect(await core.migrateCourseIds()).toBe(true)
    expect(await core.migrateSylIds()).toBe(true)
    const cat = await getJSON('v3:master:sylcat')
    const liveIds = new Set(cat.map((e: any) => e.id))
    expect(liveIds.has('sb2026'), 'the tombstoned default is NOT in the catalogue').toBe(false)
    const plan = await getJSON('v3:cx1:plan')
    expect(liveIds.has(plan.sylId), 'the plan repaired to a live syllabus').toBe(true)
    expect(plan.sylId, 'not the deleted default').not.toBe('sb2026')
  })

  it('a plan.custom course keeps its OWN hand-drawn layout on its edited chart (review CSID-IR-01)', async () => {
    /* a legacy plan.custom course: an edited def under v3:<c>:syl and the course's
       own hand-drawn layout under v3:lay:<c>:<sylName>. The layout name collides
       with the built-in name '2026'; routing it by name would hang it on sb2026 and
       DROP the edited chart's positions. It must land on the minted edited id. */
    makeStore({
      'v3:courses': [{ id: 'cx1', name: '26ABSG' }],
      'v3:cx1:plan': { sylName: '2026', custom: true, epw: 2 },
      'v3:cx1:rostermig': '1', 'v3:cx1:idmig': '1',
      'v3:cx1:syl': [{ id: 'X-1', type: 'acad', prereqs: [] }],   /* the plan.custom single legacy def */
      'v3:lay:cx1:2026': { 'X-1': { x: 7, y: 8 } },               /* the course's OWN hand-drawn layout */
    })
    expect(await core.migrateCourseIds()).toBe(true)
    expect(await core.migrateSylIds()).toBe(true)
    expect(core.bootError, 'no fail-closed boot').toBeNull()
    const cat = await getJSON('v3:master:sylcat')
    const edited = cat.find((e: any) => e.name === '2026 (edited)')
    expect(edited && isSylId(edited.id) && !isBuiltinSylId(edited.id), 'the edited chart got an sc… id').toBe(true)
    /* the KEY assertion: the hand-drawn layout is kept, on the EDITED chart's id */
    expect(await getJSON(`v3:master:lay:${edited.id}`)).toEqual({ 'X-1': { x: 7, y: 8 } })
    /* NOT misfiled onto the built-in the sylName spells */
    expect(await get('v3:master:lay:sb2026'), 'the edited layout did not leak onto the built-in').toBeNull()
    expect(await get('v3:lay:cx1:2026'), 'the source layout key is purged').toBeNull()
    const plan = await getJSON('v3:cx1:plan')
    expect(plan.sylId, 'the course points at its own edited chart').toBe(edited.id)
  })

  it('RESET sweeps records under a DELETED course namespace, not just the visible index (review CSID-IR-02)', async () => {
    /* delCourse drops a course from v3:courses but keeps its records. A deleted
       legacy course still holds name-keyed student data; the migration must sweep
       it too, or a later re-import would surface the stale marks. */
    makeStore({
      'v3:courses': [{ id: 'cx1', name: '26ABSG' }],
      'v3:cx1:plan': { sylName: '2026', epw: 2 },
      'v3:cx1:rostermig': '1', 'v3:cx1:idmig': '1',
      /* cx2: a DELETED course — absent from the index, records retained */
      'v3:cx2:2026:roster': [{ id: 'sD', name: 'DELTA' }],
      'v3:cx2:2026:m:sD': { 'ST-01': { g: 'dco' } },
      'v3:cx2:2026:d:sD': { 'ST-01': '2026-01-01' },
    })
    expect(await core.migrateCourseIds()).toBe(true)
    expect(await core.migrateSylIds()).toBe(true)
    expect(await get('v3:cx2:2026:roster'), 'the deleted course roster is swept').toBeNull()
    expect(await get('v3:cx2:2026:m:sD'), 'its marks are swept').toBeNull()
    expect(await get('v3:cx2:2026:d:sD'), 'its dates are swept').toBeNull()
    /* the deleted course is NOT re-added to the visible index */
    const courses = await getJSON('v3:courses')
    expect(courses.some((c: any) => c.id === 'cx2'), 'the deleted course stays out of the index').toBe(false)
  })

  it('an interrupted flag write keeps the journal and resumes cleanly (review CSID-01)', async () => {
    /* the RESET flag write is swallowed once (a "local only" drop); migrateSylIds
       must NOT report success or delete the journal, so the next run finishes. */
    makeStore(seed(), 'v3:sylreset')
    expect(await core.migrateCourseIds()).toBe(true)
    expect(await core.migrateSylIds(), 'the interrupted run does not claim success').toBe(false)
    expect(await get('v3:syljournal'), 'the journal survives for the resume').toBeTruthy()
    expect(await get('v3:sylreset'), 'the reset flag never landed').toBeNull()
    /* the store is fresh (no failOnce) for the resume */
    const m2 = new Map<string, string>()
    for (const k of (await storage.list()).keys) { const v = await get(k); if (v != null) m2.set(k, v) }
    useStorageImpl({ get: (k: string) => (m2.has(k) ? m2.get(k)! : null), set: (k: string, v: string) => { m2.set(k, v) }, remove: (k: string) => { m2.delete(k) }, keys: () => [...m2.keys()] })
    expect(await core.migrateSylIds(), 'the resume completes').toBe(true)
    expect(await get('v3:sylreset')).toBe('1')
    expect(await get('v3:syljournal'), 'journal retired once both flags verified').toBeNull()
    const plan = await getJSON('v3:cx1:plan')
    expect(plan.sylId).toBe('sb2026')
  })

  /* ---- second-provider review (Fable, 14 Sep 26): the migration must preserve
     what the OLD READER showed, not what the identity model says the data meant.
     The old app hid/tombstoned a built-in ONLY by its CURRENT shipped name and
     adopted a v3:master:syls def into CUSTOMS unconditionally. ---- */

  it('an alias-era hidden/tomb NAME does not hide or delete the live built-in (Fable finding 1)', async () => {
    /* 'FG JUL 26' is a retired shipped name for the 2026 built-in. The old
       reader hid a built-in only by its CURRENT name ('2026'), so this stale
       alias entry was DEAD — the chart showed. A shipped rename even UN-deleted
       such a built-in. Folding the alias onto sb2026 would wrongly hide+delete a
       chart the owner was using. */
    makeStore({
      'v3:courses': [{ id: 'cx1', name: '26ABSG' }],
      'v3:cx1:plan': { sylName: '2026', epw: 2 },
      'v3:cx1:rostermig': '1', 'v3:cx1:idmig': '1',
      'v3:master:sylhidden': ['FG JUL 26'],
      'v3:master:syltomb': { 'FG JUL 26': 1 },
    })
    expect(await core.migrateCourseIds()).toBe(true)
    expect(await core.migrateSylIds()).toBe(true)
    const cat = await getJSON('v3:master:sylcat')
    expect(cat.some((e: any) => e.id === 'sb2026'), '2026 is still catalogued').toBe(true)
    expect(await getJSON('v3:master:sylhidden'), 'the dead alias hides nothing').toEqual([])
    expect(await getJSON('v3:master:syltomb'), 'and tombstones nothing').toEqual({})
    expect((await getJSON('v3:cx1:plan')).sylId, 'the course still opens on 2026').toBe('sb2026')
  })

  it('a def under a DELETED canonical name stays a SHOWN custom; the built-in stays tombstoned (Fable finding 2)', async () => {
    /* the old app deleted the built-in '2026' (hidden+tomb) and then let a
       custom chart also named '2026' live in v3:master:syls, shown
       unconditionally as CUSTOMS['2026']. Classifying that def onto sb2026 would
       make it a hidden built-in override — a chart the owner sees would vanish. */
    makeStore({
      'v3:courses': [{ id: 'cx1', name: '26ABSG' }],
      'v3:cx1:plan': { sylName: '2026', epw: 2 },
      'v3:cx1:rostermig': '1', 'v3:cx1:idmig': '1',
      'v3:master:syls': { '2026': [{ id: 'Q-1', type: 'acad', prereqs: [] }] },
      'v3:master:sylhidden': ['2026'],
      'v3:master:syltomb': { '2026': 1 },
    })
    expect(await core.migrateCourseIds()).toBe(true)
    expect(await core.migrateSylIds()).toBe(true)
    const cat = await getJSON('v3:master:sylcat')
    const custom = cat.find((e: any) => e.name === '2026')
    expect(custom && isSylId(custom.id) && !isBuiltinSylId(custom.id), 'the def is an independent custom, not the built-in override').toBe(true)
    expect(cat.some((e: any) => e.id === 'sb2026'), 'the shipped built-in is NOT re-added').toBe(false)
    const defs = await getJSON('v3:master:syls')
    expect(defs[custom.id], 'the def is filed under the custom id').toEqual([{ id: 'Q-1', type: 'acad', prereqs: [] }])
    expect(defs['sb2026'], 'nothing under the built-in id').toBeUndefined()
    expect((await getJSON('v3:master:sylhidden')).includes(custom.id), 'the shown custom is not hidden').toBe(false)
    expect((await getJSON('v3:cx1:plan')).sylId, 'the course points at the shown custom').toBe(custom.id)
  })

  it('FAILS CLOSED when two courses hold DIFFERING own layouts for one chart with no master (Fable finding 3, §14 CSID2-03)', async () => {
    /* per-course own layouts pre-dated the global catalogue; two courses each
       hand-drew '2026' differently and neither was opened since. Both rank
       'own' — a silent first-wins would throw one hand-drawn layout away, the
       exact "keep charts" loss. It must fail closed with both sources intact. */
    makeStore({
      'v3:courses': [{ id: 'cx1', name: '26ABSG' }, { id: 'cx2', name: '27ABSG' }],
      'v3:cx1:plan': { sylName: '2026', epw: 2 }, 'v3:cx2:plan': { sylName: '2026', epw: 2 },
      'v3:cx1:rostermig': '1', 'v3:cx1:idmig': '1', 'v3:cx2:rostermig': '1', 'v3:cx2:idmig': '1',
      'v3:lay:cx1:2026': { 'ST-01': { x: 1, y: 1 } },
      'v3:lay:cx2:2026': { 'ST-01': { x: 9, y: 9 } },
    })
    expect(await core.migrateCourseIds()).toBe(true)
    expect(await core.migrateSylIds(), 'the differing same-rank layouts fail closed').toBe(false)
    expect(core.bootError, 'a fail-closed boot error is set').toBeTruthy()
    expect(await get('v3:sylcatmig'), 'nothing was stamped').toBeNull()
    expect(await get('v3:lay:cx1:2026'), 'both source layouts are left intact').toBeTruthy()
    expect(await get('v3:lay:cx2:2026')).toBeTruthy()
  })

  it('two courses with the SAME own layout for one chart converts cleanly (finding 3 is differing-only)', async () => {
    makeStore({
      'v3:courses': [{ id: 'cx1', name: '26ABSG' }, { id: 'cx2', name: '27ABSG' }],
      'v3:cx1:plan': { sylName: '2026', epw: 2 }, 'v3:cx2:plan': { sylName: '2026', epw: 2 },
      'v3:cx1:rostermig': '1', 'v3:cx1:idmig': '1', 'v3:cx2:rostermig': '1', 'v3:cx2:idmig': '1',
      'v3:lay:cx1:2026': { 'ST-01': { x: 5, y: 5 } },
      'v3:lay:cx2:2026': { 'ST-01': { x: 5, y: 5 } },
    })
    expect(await core.migrateCourseIds()).toBe(true)
    expect(await core.migrateSylIds(), 'identical layouts do not conflict').toBe(true)
    expect(await getJSON('v3:master:lay:sb2026')).toEqual({ 'ST-01': { x: 5, y: 5 } })
  })
})
