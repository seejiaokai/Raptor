// src/engine/rowids.test.ts
/* Every schedule row carries a stable `rid` (stable-ids, 10 Sep 26): minted
   by ONE walk that runs before every baseline and snapshot. Pinned here: a
   missing id is minted, a duplicate (a copied row) is re-minted, an existing
   id is never touched, and the walk covers every row kind. */
import { describe, expect, it } from 'vitest'
import { ensureRowIds, mintRowId, rowsOf } from './rowids'
import { DAYS } from './data'
import { WEEKS, CURWEEK } from './waves'

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

describe('identity rules — a copy is a new row, a move/undo/restore is the same row', () => {
  const ids = (d: any) => rowsOf(d).map(r => r.rid)
  it('a day template carries no rids; applied to an EARLIER day the original keeps its ids and the copy gets fresh ones', async () => {
    const { initStore } = await import('../state/store'); const { HOOKS } = await import('./hooks')
    const { addDayTpl, applyDayTpl, dayTplReset } = await import('./daytpl')
    initStore()
    const src = ids(DAYS[3])
    const t = addDayTpl(3, 'T')!
    expect(rowsOf(t.d).some((r: any) => 'rid' in r)).toBe(false)
    expect(applyDayTpl(0, t.id)).toBe(true); HOOKS.histPush()
    expect(ids(DAYS[3])).toEqual(src)
    const copy = ids(DAYS[0])
    expect(copy.every(x => typeof x === 'string' && !src.includes(x))).toBe(true)
    expect(new Set(copy).size).toBe(copy.length)
    dayTplReset()
  })
  it('a template applied on ANOTHER week carries none of the first week\'s ids', async () => {
    const { initStore, loadWeek } = await import('../state/store'); const { HOOKS } = await import('./hooks')
    const { addDayTpl, applyDayTpl, dayTplReset } = await import('./daytpl')
    /* the brief's `import { WEEKS } from './data'` doesn't exist — the week-key
       list `loadWeek`'s callers actually pass lives in `./waves` (WEEKS/CURWEEK,
       see state/store.ts's own imports and weekstash.test.ts's wkFor helper) */
    initStore()
    /* capture the SEED week's own key (CURWEEK, live-binding import from
       ./waves) rather than assuming a WEEKS[] index — WEEKS[0].v is
       '29/06/2026', a blank/generic week, NOT the authored seed week
       ('13/07/2026'); an earlier version of this fix restored to WEEKS[0]
       and left every later test in this file on a near-empty week, which is
       exactly the kind of silent-vacuous-pass this whole describe exists to
       rule out (caught by "a move keeps every id" throwing on undefined
       waves rather than passing quietly, which is the one upside of picking
       a day by `.find` instead of a fixed index). */
    const seedWeek = CURWEEK
    const t = addDayTpl(0, 'X')!; const wk1 = DAYS.flatMap(ids)
    expect(wk1.length).toBeGreaterThan(0)
    try {
      loadWeek(WEEKS[1].v)
      expect(applyDayTpl(0, t.id)).toBe(true); HOOKS.histPush()
      expect(ids(DAYS[0]).some(x => wk1.includes(x))).toBe(false)
    } finally {
      /* reviewer finding (Important 2 / Minor 3): leaving CURWEEK parked on
         another week leaks into every later test in this file — initStore()
         only rebuilds DAYS from the seed when the CURRENT week has never
         been stashed, so once this test moves off the seed week, every later
         test's DAYS[0]/[1]/[3] would silently address the other week's own
         (much sparser) days instead of the seed content they were written
         against. Restore before this test ends, in a finally, so a failed
         assertion above still leaves the file on the seed week for
         everything after it. */
      loadWeek(seedWeek)
      dayTplReset()
    }
  })
  it('a move keeps every id', async () => {
    const { initStore } = await import('../state/store'); const { HOOKS } = await import('./hooks')
    const { moveWave } = await import('./reorder')
    initStore()
    const d = DAYS.find(x => x.waves.length >= 2)!; const di = DAYS.indexOf(d)
    const before = ids(d).slice().sort()
    expect(before.length).toBeGreaterThan(0)   // a leaked week-2 day would read this as [] (Minor 3)
    const w0 = d.waves[0].rid                  // reviewer Minor 4: the old line compared a value to itself
    moveWave(di, 0, 1); HOOKS.histPush()
    expect(ids(d).slice().sort()).toEqual(before)
    expect(d.waves[1].rid).toBe(w0)            // the wave that WAS at 0 is now at 1, carrying the same id
  })
  it('a duplicated draft is live from the moment it is made: Draft 1 is the frozen original and keeps its ids, the new draft IS the live day and mints fresh ones in place; switching A→B→A returns each their own', async () => {
    const { initStore } = await import('../state/store'); const { HOOKS } = await import('./hooks')
    const { draftDup, draftSelect, dayDrafts } = await import('./drafts')
    initStore()
    const a = ids(DAYS[1])
    /* a leaked week-2 day (Important 2 — the previous version of this test
       ran on whatever week the file's earlier tests left CURWEEK pointed at)
       would read every id array in this test as [], and every `toEqual`
       below would then pass VACUOUSLY — proving nothing. Week 1 is restored
       by the template test above before this one runs; this still pins that
       the day actually has rows, so a future leak fails LOUD, here. */
    expect(a.length).toBeGreaterThan(0)
    const t = draftDup(1)!; HOOKS.histPush()
    /* controller ruling: the brief had this backwards. draftDup's own model
       is that DAYS[di] IS the working copy of the SELECTED draft — so the
       NEW draft (`t`) is the live day itself, re-minted fresh IN PLACE, and
       Draft 1 is the STOW of the ORIGINAL, frozen with the original's ids.
       `b` is therefore read off the LIVE day right after the dup, not off
       `t.d` — the two must still agree (t.d is a clone taken after the
       re-mint), which the next assertion checks. */
    const b = ids(DAYS[1])
    expect(b.every(x => typeof x === 'string' && !a.includes(x))).toBe(true)
    expect(ids(t.d)).toEqual(b)                     // t.d agrees with the live day it was cloned from
    const [d1] = dayDrafts(1)
    expect(ids(d1.d)).toEqual(a)                    // Draft 1 is the frozen original, unchanged
    draftSelect(1, d1.id); HOOKS.histPush(); expect(ids(DAYS[1])).toEqual(a)
    draftSelect(1, t.id); HOOKS.histPush(); expect(ids(DAYS[1])).toEqual(b)
    draftSelect(1, d1.id); HOOKS.histPush(); expect(ids(DAYS[1])).toEqual(a)
  })
  it('restoring an issued version twice returns the same ids; undo and redo return the same ids', async () => {
    const { initStore, undo, redo } = await import('../state/store'); const { HOOKS } = await import('./hooks')
    const { alIssue, markEdit } = await import('./publish'); const { restoreDayVersion } = await import('./restore')
    initStore()
    const orig = ids(DAYS[0])
    expect(orig.length).toBeGreaterThan(0)   // a leaked week-2 day would read this as [] (Minor 3)
    /* the brief's own text restores 'orig' — SCHED.orig[di] is only stamped by
       setDayApproved, which this day never goes through (see rowids.test.ts's
       own earlier fix, same file, same reason), so SCHED.orig[0] stays
       undefined and daySnapOf(0,'orig') resolves nothing. alIssue freezes its
       OWN per-day snapshot (AL1's rec.snap) regardless of approval, so version
       1 is the snapshot this case can actually restore from. */
    markEdit('dn:0.0'); alIssue(1, ['dn:0.0'])
    DAYS[0].waves[0].formations.push({ cs: '', msn: '', to: '', ld: '', aircraft: [{ p: '', w: '', area: '', rmks: '', opts: {} }] }); HOOKS.histPush()
    restoreDayVersion(0, 1); HOOKS.histPush(); const r1 = ids(DAYS[0])
    DAYS[0].notes.push('x'); HOOKS.histPush()
    restoreDayVersion(0, 1); HOOKS.histPush(); const r2 = ids(DAYS[0])
    expect(r1).toEqual(orig); expect(r2).toEqual(orig)
    undo(); expect(ids(DAYS[0])).toEqual(orig); redo(); expect(ids(DAYS[0])).toEqual(orig)
  })
  it('an amendment book written before ids existed is backfilled once: same address → the live id, a snapshot-only row → a minted one, idempotent, and it persists', async () => {
    const { initStore, weekStashSnap } = await import('../state/store'); const { HOOKS } = await import('./hooks')
    const { SCHED, alIssue, markEdit } = await import('./publish'); const { restoreDayVersion } = await import('./restore')
    const { backfillSnapshotIds, pathsOf } = await import('./rowids')
    initStore()
    markEdit('dn:0.0'); alIssue(1, ['dn:0.0'])
    /* same substitution as the test above: AL1's own snap stands in for
       SCHED.orig[0], which this unapproved day never gets */
    const snapDay = SCHED.als[0].snap[0].d
    expect(DAYS[0].waves[0].formations.length).toBeGreaterThan(1)   // a leaked week-2 day would fail this (Minor 3)
    rowsOf(snapDay).forEach((r: any) => { delete r.rid })                           // the pre-change book
    DAYS[0].waves[0].formations.splice(0, 1); HOOKS.histPush()                       // one issued row is gone live
    const n = backfillSnapshotIds(SCHED, DAYS)
    expect(n).toBe(rowsOf(snapDay).length)
    const live = new Map(pathsOf(DAYS[0])), snapPaths = pathsOf(snapDay)
    /* reviewer Minor 6: the old `p !== 'waves.0.formations.0'` exclusion was
       dead — the backfill pairs BY ADDRESS, not content, so that address (now
       occupied by the formation that used to sit at .1, shifted down into the
       gap) is paired exactly like every other surviving address, and the
       check holds there for the same reason it holds everywhere else. Assert
       it unconditionally instead of carving out a corner that never differed. */
    for (const [p, r] of snapPaths) { if (live.has(p)) expect(r.rid, p).toBe(live.get(p).rid) }
    /* reviewer Minor 5: `expect(typeof x.every(...)).toBe('boolean')` asserts
       nothing — `typeof` always returns a string. The real claim is that
       every snapshot row now carries an actual id. */
    expect(rowsOf(snapDay).every((r: any) => typeof r.rid === 'string')).toBe(true)
    /* reviewer Minor 5, second half: the one snapshot address the splice
       actually erased from live (out of range once the array shrank) gets a
       MINTED id, not a copied one — and that fresh id appears nowhere among
       the live day's own ids, because no live row was ever given it. */
    const missing = snapPaths.find(([p]) => !live.has(p))!
    expect(missing).toBeTruthy()
    const liveIds = new Set(rowsOf(DAYS[0]).map((r: any) => r.rid))
    expect(liveIds.has(missing[1].rid)).toBe(false)
    expect(backfillSnapshotIds(SCHED, DAYS)).toBe(0)
    expect(JSON.parse(weekStashSnap()).a[0].snap[0].d.waves[0].rid).toBe(snapDay.waves[0].rid)
    restoreDayVersion(0, 1); HOOKS.histPush(); const r1 = ids(DAYS[0])
    DAYS[0].notes.push('y'); HOOKS.histPush()
    restoreDayVersion(0, 1); HOOKS.histPush(); expect(ids(DAYS[0])).toEqual(r1)
  })
})
