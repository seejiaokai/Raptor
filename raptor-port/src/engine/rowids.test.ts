// src/engine/rowids.test.ts
/* Every schedule row carries a stable `rid` (stable-ids, 10 Sep 26): minted
   by ONE walk that runs before every baseline and snapshot. Pinned here: a
   missing id is minted, a duplicate (a copied row) is re-minted, an existing
   id is never touched, and the walk covers every row kind. */
import { describe, expect, it } from 'vitest'
import { ensureRowIds, mintRowId, rowsOf } from './rowids'
import { DAYS } from './data'

const clone = (v: any) => JSON.parse(JSON.stringify(v))

describe('ensureRowIds', () => {
  it('mints a rid on every row of the seed week, once', () => {
    const days = clone(DAYS)
    const n = ensureRowIds(days)
    const rows = days.flatMap(rowsOf)
    expect(n).toBe(rows.length)
    expect(rows.every((r: any) => typeof r.rid === 'string' && r.rid.startsWith('r'))).toBe(true)
    expect(new Set(rows.map((r: any) => r.rid)).size).toBe(rows.length)
    expect(ensureRowIds(days)).toBe(0)
  })
  it('walks waves, formations, seats, duty blocks and rows, sims, programme and ground rows', () => {
    const d: any = { waves: [{ formations: [{ aircraft: [{}] }] }], dutywaves: [{ rows: [{}] }],
      sims: { amt: [{}], oft: [{}] }, allhands: [{}], ground: [{}] }
    expect(rowsOf(d).length).toBe(9)
  })
  it('re-mints a duplicate — a copied row is a new row — and leaves the first copy alone', () => {
    const days = clone(DAYS); ensureRowIds(days)
    const w = clone(days[0].waves[0]); days[1].waves.push(w)
    const before = days[0].waves[0].rid
    expect(ensureRowIds(days)).toBe(rowsOf({ waves: [w] } as any).length)
    expect(days[0].waves[0].rid).toBe(before)
    expect(days[1].waves[days[1].waves.length - 1].rid).not.toBe(before)
    const rows = days.flatMap(rowsOf)
    expect(new Set(rows.map((r: any) => r.rid)).size).toBe(rows.length)
  })
  it('a missing or empty section is tolerated', () => {
    expect(ensureRowIds([{ waves: [] }, {}] as any)).toBe(0)
  })
  it('mintRowId is opaque and unique', () => {
    const a = mintRowId(), b = mintRowId()
    expect(a).toMatch(/^r[0-9a-z]+$/); expect(a).not.toBe(b)
  })
})

describe('the walk runs before every baseline and snapshot', () => {
  it('after boot every row has a rid, the pristine week is NOT dirty, and the first snapshot carries the ids', async () => {
    const { initStore, weekDirty } = await import('../state/store')
    const { HIST } = await import('../state/history')
    initStore()
    const rows = DAYS.flatMap(rowsOf)
    expect(rows.every(r => typeof r.rid === 'string')).toBe(true)
    expect(weekDirty()).toBe(false)                       // the mint ran BEFORE the baseline
    const snap = JSON.parse(HIST.stack[0])
    expect(snap.d.flatMap(rowsOf).every((r: any) => typeof r.rid === 'string')).toBe(true)
  })
  it('a row added by any path has a rid after the mutation epilogue; its neighbours keep theirs', async () => {
    const { initStore } = await import('../state/store')
    const { HOOKS } = await import('./hooks')
    const { makeStandalone } = await import('./waves')
    const { DUTYTPL_CFG, blockFromTpl } = await import('./dutytpl')
    initStore()
    const d = DAYS[0]
    /* rowsOf(d) BEFORE the mutation returns the actual row OBJECTS (rowsOf
       never copies), so holding these references — not their flat POSITION —
       is what "neighbours keep theirs" has to mean: a formation pushed into
       waves[0] shifts every later row's flat index (the brief's original
       slice-by-position check was arithmetically wrong for exactly that
       reason, on a seed day with more than one wave — fixed here to compare
       by identity instead of position). */
    const beforeRows = rowsOf(d); const before = beforeRows.map(r => r.rid)
    d.waves[0].formations.push({ cs: '', msn: '', to: '', ld: '', aircraft: [{ p: '', w: '', area: '', rmks: '', opts: {} }] })
    d.waves.push(makeStandalone('sc')); d.dutywaves.push(blockFromTpl(DUTYTPL_CFG[0].id))
    d.sims.amt.push({ label: 'X', str: '', end: '' }); d.ground.push({ prog: 'G', str: '', end: '' }); d.allhands.push({ prog: 'A', str: '', end: '' })
    HOOKS.histPush()
    const rows = rowsOf(d)
    expect(rows.every(r => typeof r.rid === 'string')).toBe(true)
    expect(new Set(rows.map(r => r.rid)).size).toBe(rows.length)
    expect(beforeRows.map(r => r.rid)).toEqual(before)
  })
  it('deleting a row leaves every other row\'s rid unchanged, and undo brings the same ids back', async () => {
    const { initStore, undo } = await import('../state/store')
    const { HOOKS } = await import('./hooks')
    initStore()
    const d = DAYS[0]; const gone = d.waves[0].formations[0].rid
    const keep = rowsOf(d).map(r => r.rid).filter(x => x !== gone)
    d.waves[0].formations.splice(0, 1); HOOKS.histPush()
    expect(rowsOf(d).map(r => r.rid).filter(x => keep.includes(x))).toEqual(keep.filter(x => rowsOf(d).some(r => r.rid === x)))
    expect(rowsOf(d).some(r => r.rid === gone)).toBe(false)
    undo()
    expect(DAYS[0].waves[0].formations[0].rid).toBe(gone)
  })
  it('a day restored from a snapshot without ids gets them at the epilogue', async () => {
    const { initStore } = await import('../state/store')
    const { HOOKS } = await import('./hooks')
    const { SCHED, alIssue, markEdit } = await import('./publish')
    const { restoreDayVersion } = await import('./restore')
    initStore()
    /* the brief's own text restored 'orig' — SCHED.orig[di] is only stamped by
       setDayApproved, which this day never goes through (it isn't signed off),
       so SCHED.orig[0] stays undefined and the test cannot reach it. alIssue
       freezes its OWN per-day snapshot (rec.snap) regardless of approval, so
       that is the snapshot this case can actually restore from — fixed to
       match the true value, same as Task 1's miscount. */
    markEdit('dn:0.0'); alIssue(1, ['dn:0.0'])
    rowsOf(SCHED.als[0].snap[0].d).forEach((r: any) => { delete r.rid })   // an amendment book written by a pre-change browser
    /* restoreDayVersion returns `false` only when the snapshot can't be
       found, otherwise the count of pending marks it dropped — a plain
       `.toBe(true)` fails here because there is nothing pending left to drop
       on day 0 (alIssue already cleared it), so the true success value is
       "didn't come back false", not the literal boolean true. */
    expect(restoreDayVersion(0, 1)).not.toBe(false)
    /* pin the RED case, not just the GREEN one: without this, a restore that
       never actually installed the id-less snapshot would still pass the
       final assertion (DAYS[0] was already fully minted from initStore) —
       a vacuous pass. This proves the live day really is missing ids right
       after the restore, before the epilogue below puts them back. */
    expect(rowsOf(DAYS[0]).some(r => r.rid === undefined)).toBe(true)
    HOOKS.histPush()
    expect(rowsOf(DAYS[0]).every(r => typeof r.rid === 'string')).toBe(true)
  })
})
