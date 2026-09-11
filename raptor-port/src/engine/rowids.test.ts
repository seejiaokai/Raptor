// src/engine/rowids.test.ts
/* Every schedule row carries a stable `rid` (stable-ids, 10 Sep 26): minted
   by ONE walk that runs before every baseline and snapshot. Pinned here: a
   missing id is minted, a duplicate (a copied row) is re-minted, an existing
   id is never touched, and the walk covers every row kind. */
import { describe, expect, it } from 'vitest'
import { ensureRowIds, mintRowId, rowsOf, ridKey, posKey, migrateBookKeys, ridWriteKey, isRowKey } from './rowids'
import { DAYS } from './data'
import { dayKeys } from './restore'
import { keyDay } from './keys'
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

describe('ridKey / posKey / migrateBookKeys — addressing by rid (addressing-by-rid, 10 Sep 26)', () => {
  const seed = () => { const d = clone(DAYS); ensureRowIds(d); return d }

  it('round-trips EVERY key of the grammar: positional → rid → positional', () => {
    /* dayKeys is the executable slot-key grammar (engine/restore.ts): its key
       set is every prefix the app addresses. A rid round-trip that returns the
       exact positional key for all of them is the completeness proof. */
    const days = seed()
    const keys = [...dayKeys(days[0], 0).keys()]
    expect(keys.length).toBeGreaterThan(20)                   // the grammar is wide — a stubbed day would fail loud
    const bad = keys.filter(k => posKey(ridKey(k, days), days) !== k)
    expect(bad, bad.join('  ')).toEqual([])
  })

  it('a row-addressing key actually CHANGES under ridKey (the round-trip is not vacuous)', () => {
    const days = seed()
    const di = days.findIndex((d: any) => (d.waves || []).length > 0)
    const w0 = days[di].waves[0].rid
    expect(ridKey(`wl:${di}.0`, days)).toBe(`wl:${di}.${w0}`)
    // a deep one: the bare flying seat collapses wave.formation.aircraft all to rids
    const f0 = days[di].waves[0].formations[0], a0 = f0.aircraft[0]
    expect(ridKey(`${di}.0.0.0.p`, days)).toBe(`${di}.${w0}.${f0.rid}.${a0.rid}.p`)
  })

  it('a day-level / synthetic key is passed through untouched, both directions', () => {
    const days = seed()
    for (const k of ['dn:0.2', 'sn:0', 'pn:0', 'del:0.1.wave', 'mov:0.2.duty', 'inp:0.abc']) {
      expect(ridKey(k, days)).toBe(k)
      expect(posKey(k, days)).toBe(k)
    }
  })

  it('a row without a rid falls back to its positional key (never invents one)', () => {
    const days = seed()
    delete days[0].waves[0].rid                                // a legacy / pristine row
    expect(ridKey('wl:0.0', days)).toBe('wl:0.0')             // no id here → unchanged
    // all-or-nothing: a formation under an id-less wave stays positional too
    expect(ridKey('ff:0.0.0.cs', days)).toBe('ff:0.0.0.cs')
  })

  it('a deleted rid resolves to null; a survivor keeps its stored key and re-resolves to its NEW position', () => {
    const days = seed()
    const di = days.findIndex((d: any) => (d.waves || []).length >= 2)
    expect(di).toBeGreaterThanOrEqual(0)
    const survivor = days[di].waves[1].rid
    const stored = `wl:${di}.${survivor}`                     // the book stores the rid form
    expect(posKey(stored, days)).toBe(`wl:${di}.1`)           // resolves to the live cell
    const goneRid = days[di].waves[0].rid
    days[di].waves.splice(0, 1)                                // delete wave 0 — NOTHING renumbers the book
    expect(posKey(`wl:${di}.${goneRid}`, days)).toBe(null)   // the deleted row's key is now dead
    /* THE WHOLE POINT: the survivor's stored key string never changed, and it
       now resolves to the row's NEW positional address — no shiftKeys, no
       renumber, so a second client's copy of this key is never disturbed. */
    expect(posKey(stored, days)).toBe(`wl:${di}.0`)
  })

  it('migrateBookKeys rewrites a positional book to rid form, idempotently, leaving unresolvable keys positional', () => {
    const days = seed()
    const di = days.findIndex((d: any) => (d.waves || []).length >= 2)
    const w0 = days[di].waves[0].rid, w1 = days[di].waves[1].rid
    /* the snapshot's wave-at-1 carries a DIFFERENT id than the live wave-at-1,
       so a snap.c key resolving to 'rSNAPW1' proves it was translated against
       snap.d (its own rows) and NOT the live day (bug caught in review: a row
       that moved after issue would otherwise map onto the wrong id). */
    const snapDay = clone(days[di]); snapDay.waves[1].rid = 'rSNAPW1'
    const sched: any = {
      pending: { [`wl:${di}.1`]: 1 },
      changes: { [`wl:${di}.0`]: 2 },
      added: {},
      als: [{ n: 1, keys: [`wl:${di}.0`, 'dn:0.0'], adds: [], structAdds: [], snap: { [di]: { d: snapDay, c: { [`wl:${di}.1`]: 1 } } } }],
    }
    const n = migrateBookKeys(sched, days)
    expect(n).toBeGreaterThan(0)
    expect(sched.pending[`wl:${di}.${w1}`]).toBe(1)
    expect(sched.changes[`wl:${di}.${w0}`]).toBe(2)
    expect(sched.als[0].keys).toEqual([`wl:${di}.${w0}`, 'dn:0.0'])   // the note key stays positional (no rid)
    expect(sched.als[0].snap[di].c['wl:' + di + '.rSNAPW1']).toBe(1)  // snap.c → snap.d's id
    expect(sched.als[0].snap[di].c[`wl:${di}.${w1}`]).toBeUndefined() // NOT the live wave's id
    expect(migrateBookKeys(sched, days)).toBe(0)                       // already rid form → a no-op
  })

  /* ---- Fable review pins (10 Sep 26) ---------------------------------- */
  it('keyDay still reads the day off a rid-form key — prefixed and the bare seat', () => {
    /* every per-day filter, snapshot slice and AL day-list rides keyDay; a rid
       is base36 (no "." / ":") so the day stays the first component */
    const days = seed()
    const di = days.findIndex((d: any) => (d.waves || []).length > 0)
    expect(keyDay(ridKey(`wl:${di}.0`, days))).toBe(di)
    expect(keyDay(ridKey(`${di}.0.0.0.p`, days))).toBe(di)
    expect(keyDay(ridKey(`s:${di}.amt.0.label`, days))).toBe(di)
  })

  it('iu:<iid> (an input, no day component) passes through BOTH ways — never read as a deleted row', () => {
    const days = seed()
    expect(ridKey('iu:abc123', days)).toBe('iu:abc123')
    expect(posKey('iu:abc123', days)).toBe('iu:abc123')           // was null before the guard
  })

  it('a malformed/short rid-form key is null, and never matches a row that merely lacks a rid', () => {
    const days = seed()
    delete days[0].waves[0].formations[0].rid                    // an id-less formation lurking at index 0
    /* 'ff:0.<wave rid>' is missing its formation slot — the old findIndex on an
       undefined slot matched that id-less row and returned 'ff:0.0.0' */
    const short = `ff:0.${days[0].waves[0].rid}`
    expect(posKey(short, days)).toBe(null)
  })

  it('a ".+" append tail rides through ridKey literally (it is never a position slot)', () => {
    const days = seed()
    const di = days.findIndex((d: any) => (d.allhands || []).length > 0)
    const r = days[di].allhands[0].rid
    expect(ridKey(`a:${di}.0.+`, days)).toBe(`a:${di}.${r}.+`)
  })
})

describe('ridWriteKey / isRowKey — the self-healing write-in translate (addressing-by-rid task 2)', () => {
  it('isRowKey tells a row prefix (and the bare seat) from a note / synthetic / unknown one', () => {
    expect(isRowKey('ff:0.0.0.cs')).toBe(true)
    expect(isRowKey('0.0.0.0.p')).toBe(true)        // bare flying seat
    expect(isRowKey('wl:0.0')).toBe(true)
    expect(isRowKey('dn:0.0')).toBe(false)          // note — NONROW
    expect(isRowKey('del:0.1.line')).toBe(false)    // synthetic
    expect(isRowKey('iu:abc')).toBe(false)
    expect(isRowKey('zz:0.0')).toBe(false)          // unknown prefix — no keyLevels
  })

  it('mints the rid a row lacks, then anchors the key — where ridKey alone cannot', () => {
    const days = clone(DAYS)                          // NO ensureRowIds: rows carry no rid yet
    const k = 'ff:0.0.0.cs'
    expect(ridKey(k, days)).toBe(k)                   // ridKey cannot anchor an id-less row
    const out = ridWriteKey(k, days)
    expect(out).not.toBe(k)                           // it self-healed: minted, then anchored
    expect(posKey(out, days)).toBe(k)                 // and the result round-trips back
    expect(days[0].waves[0].formations[0].rid).toMatch(/^r/)
  })

  it('leaves a NONROW / note key positional and does not walk (no wasted mint)', () => {
    const days = clone(DAYS)
    expect(ridWriteKey('dn:0.0', days)).toBe('dn:0.0')
    expect(days[0].waves[0].rid).toBeUndefined()      // never minted anything
  })

  it('is idempotent on a key that already carries its rids', () => {
    const days = clone(DAYS); ensureRowIds(days)
    const rk = ridKey('wl:0.0', days)
    expect(ridWriteKey(rk, days)).toBe(rk)
    expect(ridWriteKey('wl:0.0', days)).toBe(rk)
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
  it('a duplicated day KEEPS its ids across every draft (keep-ids); only a genuinely new row mints a fresh one', async () => {
    const { initStore } = await import('../state/store'); const { HOOKS } = await import('./hooks')
    const { draftDup, draftSelect, dayDrafts } = await import('./drafts')
    initStore()
    const a = ids(DAYS[1])
    /* a leaked week-2 day would read every id array as [] and pass VACUOUSLY;
       pin that the day actually has rows so a future leak fails LOUD here */
    expect(a.length).toBeGreaterThan(0)
    const t = draftDup(1)!; HOOKS.histPush()
    /* DRAFTS KEEP THEIR IDS (11 Sep 26, addressing-by-rid). A parked draft is
       an alternate VERSION of the same day, not an independent copy, so it
       shares the day's rids — one rid-space across the live day, its drafts and
       its issued snapshots, which is what lets a switch install a blob that
       already resolves against every frozen amendment (no adopt, no gate). */
    expect(ids(DAYS[1])).toEqual(a)                 // the live day is untouched
    expect(ids(t.d)).toEqual(a)                     // Draft 2's blob shares its ids
    const [d1] = dayDrafts(1)
    expect(ids(d1.d)).toEqual(a)                    // and so does the parked Draft 1
    /* switching just installs the blob — the shared ids ride along either way,
       and no re-mint fires (a parked draft never coexists in DAYS) */
    draftSelect(1, d1.id); HOOKS.histPush(); expect(ids(DAYS[1])).toEqual(a)
    draftSelect(1, t.id); HOOKS.histPush(); expect(ids(DAYS[1])).toEqual(a)
    /* but a genuinely NEW row added inside a draft mints a FRESH id, so a real
       add is never mistaken for a survivor */
    DAYS[1].waves[0].formations.push({ cs: '', msn: '', to: '', ld: '', aircraft: [{ p: '', w: '', area: '', rmks: '', opts: {} }] })
    HOOKS.histPush()
    const added = DAYS[1].waves[0].formations.slice(-1)[0].rid
    expect(typeof added).toBe('string')
    expect(a.includes(added)).toBe(false)
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
