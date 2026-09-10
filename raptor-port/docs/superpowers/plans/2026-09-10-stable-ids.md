# Stable ids — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use subagent-driven-development (recommended) or executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tracker students are keyed by an opaque enrolment id (the name becomes a label); every schedule row carries a stable `rid`; nothing a screen shows changes.

**Architecture:** Tracker: one pure converter (`app/ids.js` `upgradeCourseBlock`) turns a course's name-keyed block into an id-keyed one; `core.js` uses it once per course at load (`migrateIds`) and on every import (`applyStudents`), and every per-student key/map/undo entry takes the id. Scheduler: one walk (`engine/rowids.ts` `ensureRowIds`) mints missing/duplicate `rid`s and runs before every baseline and snapshot (store boot, week load, `histInit`, `histPush`); addressing stays positional.

**Tech Stack:** Vite + React 19 + TypeScript (engine/state/ui), plain JS/JSX Tracker (`allowJs`), Vitest (jsdom), Playwright smoke (`scripts/tracker/smoke.mjs`, port 4179).

## Context

The Dataverse handover (`docs/handover-dataverse.md`) promises the table designer stable ids on our side first. Owner, 10 Sep 26: scope option 1 — Tracker fully re-keyed, schedule rows given an id carried alongside, addressing unchanged; no student rename control. Spec (approved): `raptor-port/docs/superpowers/specs/2026-09-10-stable-ids-design.md`. Explorers mapped ~40 name-keyed sites in `core.js`, the name in undo/file/DOM, and the scheduler's positional key machinery (left alone).

## Global Constraints

- Run everything from `raptor-port/`. Iterate with `npx vitest run <file>`; the full gates ONCE in Task 8: `npm run build`, `node reference/tfin.js` (728/0), `npm test`, `npm run test:e2e`, `npm run smoke:tracker`.
- `src/engine/` bodies are verbatim-port style (compressed, semicolons, `:any`) — match it; `src/state/`, `src/ui/` ordinary TS (2-space, no semicolons, single quotes); Tracker files keep their own style (semicolons, 2-space).
- Comments explain WHY, in prose, above the code. Never weaken a failing assertion — rewrite it to the new truth.
- The Tracker never imports the engine; nothing under `tracker/app` or `tracker/components` imports `src/engine` (`tracker.test.tsx` guards it).
- `rid` is never printed and never compared for equality by the amendment machinery (length-only diffs — checked).
- Public repo: placeholder names only in tests/fixtures.
- Commit after each task (`feat(tracker): …` / `feat(engine): …` / `test(...)`); do not push until Task 8. Model IDs never in commits.
- Kill stray servers by PORT only: `lsof -ti :4179 | xargs -r kill`.

---

### Task 0: Put the plan in the repo

- [ ] Copy this file to `raptor-port/docs/superpowers/plans/2026-09-10-stable-ids.md` (drop the plan-mode note), commit `docs(plan): the stable-ids implementation plan`.

---

### Task 1: `engine/rowids.ts` — mint and ensure row ids

**Files:**
- Create: `src/engine/rowids.ts`
- Test: `src/engine/rowids.test.ts`

**Interfaces:**
- Produces: `mintRowId(): string`, `ensureRowIds(days: any[]): number` (count minted), `rowsOf(day: any): any[]` (every row object of a day, in walk order).

- [ ] **Step 1: failing test**

```ts
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
    expect(rows.every(r => typeof r.rid === 'string' && r.rid.startsWith('r'))).toBe(true)
    expect(new Set(rows.map(r => r.rid)).size).toBe(rows.length)
    expect(ensureRowIds(days)).toBe(0)
  })
  it('walks waves, formations, seats, duty blocks and rows, sims, programme and ground rows', () => {
    const d: any = { waves: [{ formations: [{ aircraft: [{}] }] }], dutywaves: [{ rows: [{}] }],
      sims: { amt: [{}], oft: [{}] }, allhands: [{}], ground: [{}] }
    expect(rowsOf(d).length).toBe(10)
  })
  it('re-mints a duplicate — a copied row is a new row — and leaves the first copy alone', () => {
    const days = clone(DAYS); ensureRowIds(days)
    const w = clone(days[0].waves[0]); days[1].waves.push(w)
    const before = days[0].waves[0].rid
    expect(ensureRowIds(days)).toBe(rowsOf({ waves: [w] } as any).length)
    expect(days[0].waves[0].rid).toBe(before)
    expect(days[1].waves[days[1].waves.length - 1].rid).not.toBe(before)
    const rows = days.flatMap(rowsOf)
    expect(new Set(rows.map(r => r.rid)).size).toBe(rows.length)
  })
  it('a missing or empty section is tolerated', () => {
    expect(ensureRowIds([{ waves: [] }, {}] as any)).toBe(0)
  })
  it('mintRowId is opaque and unique', () => {
    const a = mintRowId(), b = mintRowId()
    expect(a).toMatch(/^r[0-9a-z]+$/); expect(a).not.toBe(b)
  })
})
```

- [ ] **Step 2:** `npx vitest run src/engine/rowids.test.ts` → FAIL (module not found).

- [ ] **Step 3: implementation**

```ts
// src/engine/rowids.ts
/* STABLE ROW IDS (10 Sep 26, the stable-ids round). A schedule row — a wave,
   a Go, a seat pair, a duty block or desk, a sim row, a programme or ground
   row — is addressed by its POSITION (the slot-key grammar, keys.ts), and
   deleting a row renumbers the ones after it. The shared database wants a
   key that survives that, the way `iid` gives an input one. So every row
   carries `rid`: opaque, minted at creation, never printed (html.ts builds
   every key from the loop index — parity stays byte-identical), never used
   for addressing this round. Random rather than a counter so two browsers
   never mint the same id.
   ONE walk mints them, and it runs before every baseline and snapshot
   (store.ts initStore/loadWeek, history.ts histInit/histPush), so nothing
   is rendered or saved before a row has its id — inputs.ts's lesson that an
   id minted later than the snapshot it should be in is worse than none. A
   DUPLICATE is re-minted: a day template, a duplicated wave, a draft copy a
   row by JSON, and the copy is a new row; the first one seen keeps its id. */
export function mintRowId(){return 'r'+Date.now().toString(36)+Math.random().toString(36).slice(2,8);}
/* every row object of one day, parents before children, in section order */
export function rowsOf(d:any):any[]{
  const out:any[]=[];
  (d.allhands||[]).forEach((r:any)=>out.push(r));
  (d.waves||[]).forEach((w:any)=>{out.push(w);(w.formations||[]).forEach((f:any)=>{out.push(f);(f.aircraft||[]).forEach((a:any)=>out.push(a));});});
  const s=d.sims||{};(s.amt||[]).forEach((r:any)=>out.push(r));(s.oft||[]).forEach((r:any)=>out.push(r));
  (d.dutywaves||[]).forEach((b:any)=>{out.push(b);(b.rows||[]).forEach((r:any)=>out.push(r));});
  (d.ground||[]).forEach((r:any)=>out.push(r));
  return out;
}
/* mint a missing rid, re-mint a duplicate; returns how many were minted */
export function ensureRowIds(days:any[]):number{
  const seen=new Set<string>();let n=0;
  for(const d of days||[])for(const r of rowsOf(d||{})){
    if(!r||typeof r!=='object')continue;
    if(typeof r.rid!=='string'||!r.rid||seen.has(r.rid)){r.rid=mintRowId();n++;}
    seen.add(r.rid);
  }
  return n;
}
```

- [ ] **Step 4:** run → PASS. **Step 5:** `git add src/engine/rowids.ts src/engine/rowids.test.ts && git commit -m "feat(engine): rowids — mint a stable rid on every schedule row, one walk, duplicates re-minted"`.

---

### Task 2: Wire the walk, declare the field, pin every path

**Files:**
- Modify: `src/state/history.ts:44-47` (histInit, histPush)
- Modify: `src/state/store.ts:615` (initStore, before `weekBaseline`), and `loadWeek` where its baseline is set (after `applyWeekModel(v)` at :459 — find `weekBaseline = weekStashSnap()` inside loadWeek and insert before it)
- Modify: `src/engine/schema.ts` (eight row types)
- Modify: `src/engine/schema.test.ts:98-112, 226-242, 254-271`
- Modify: `src/engine/parity.test.ts:34-39, 87` ONLY if red (see Step 5)
- Test: `src/engine/rowids.test.ts` (second describe)

**Interfaces:** consumes `ensureRowIds`, `rowsOf` from Task 1.

- [ ] **Step 1: failing tests** — append to `rowids.test.ts`:

```ts
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
    const d = DAYS[0]; const before = rowsOf(d).map(r => r.rid)
    d.waves[0].formations.push({ cs: '', msn: '', to: '', ld: '', aircraft: [{ p: '', w: '', area: '', rmks: '', opts: {} }] })
    d.waves.push(makeStandalone('sc')); d.dutywaves.push(blockFromTpl(DUTYTPL_CFG[0].id))
    d.sims.amt.push({ label: 'X', str: '', end: '' }); d.ground.push({ prog: 'G', str: '', end: '' }); d.allhands.push({ prog: 'A', str: '', end: '' })
    HOOKS.histPush()
    const rows = rowsOf(d)
    expect(rows.every(r => typeof r.rid === 'string')).toBe(true)
    expect(new Set(rows.map(r => r.rid)).size).toBe(rows.length)
    expect(rows.map(r => r.rid).slice(0, before.length).filter((x, i) => before[i] && x !== before[i])).toEqual([])
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
    markEdit('dn:0.0'); alIssue(1, ['dn:0.0'])
    rowsOf(SCHED.orig[0].d).forEach((r: any) => { delete r.rid })   // an amendment book written by a pre-change browser
    restoreDayVersion(0, 'orig'); HOOKS.histPush()
    expect(rowsOf(DAYS[0]).every(r => typeof r.rid === 'string')).toBe(true)
  })
})
```
(If `undo` is not exported from store, use `histApply(HIST.ix - 1)` from `../state/history`.)

- [ ] **Step 2:** run → FAIL (no rids after boot / dirty week).

- [ ] **Step 3: wire it.** `history.ts`:
```ts
import { ensureRowIds } from '../engine/rowids'
…
/* the stable-ids walk (engine/rowids.ts) runs before EVERY snapshot so undo
   never hands back an id-less row */
export function histInit(){ensureRowIds(DAYS);HIST.stack=[histSnap()];HIST.ix=0;syncHistBtns();}
export function histPush(){
  if(HIST.lock)return;
  ensureRowIds(DAYS);
  const s=histSnap();
```
`store.ts` initStore — insert before line 615:
```ts
  /* stable row ids (engine/rowids.ts) BEFORE the baseline: the walk mutates
     DAYS, and a mint after the yardstick would make the pristine seed week
     read as edited and get persisted — the trap weekstash.ts documents */
  ensureRowIds(DAYS)
  weekBaseline = weekStashSnap()
```
`store.ts` loadWeek — same line before ITS `weekBaseline = weekStashSnap()` (after `applyWeekModel`). Import `ensureRowIds` from `'../engine/rowids'`.

`schema.ts` — add to `AllhandsRow`, `AircraftSeat`, `Formation`, `Wave`, `SimRow`, `DutyRow`, `DutyBlock` (GroundRow inherits):
```ts
  /** Stable row id — engine (rowids.ts); minted before the first baseline, never printed, optional only in a seed literal. */
  rid?: string
```
`schema.test.ts` — add `rid: 'string?'` to `ALLHANDS`, `SEAT`, `FORMATION`, `WAVE`, `SIM`, `DUTYROW`, `DUTYBLOCK` (GROUND spreads ALLHANDS). In `after boot` add:
```ts
    const { rowsOf } = await import('./rowids')
    DAYS.forEach((d, i) => rowsOf(d).forEach((r: any, j) => expect(typeof r.rid, `DAYS[${i}] row ${j} rid`).toBe('string')))
```
In `after edits`, the three mint cases: after `conform(...)`, also `ensureRowIds([{ waves: [w] }])`-style is unnecessary — instead add one case:
```ts
  it('a minted wave, template wave and duty block carry rids once the walk has run', async () => {
    const { ensureRowIds, rowsOf } = await import('./rowids')
    const d: any = { waves: [makeStandalone('sc'), waveFromTpl(WAVETPL_CFG[0].id)], dutywaves: [blockFromTpl(DUTYTPL_CFG[0].id)] }
    ensureRowIds([d])
    expect(rowsOf(d).every((r: any) => typeof r.rid === 'string')).toBe(true)
    conform(d.waves[0], WAVE, 'sc+rid'); conform(d.dutywaves[0], DUTYBLOCK, 'block+rid')
  })
```
placed BEFORE the issued-amendment case (nothing may follow it).

- [ ] **Step 4:** `npx vitest run src/engine/rowids.test.ts src/engine/schema.test.ts` → PASS.

- [ ] **Step 5: parity and byte-compare.** `npx vitest run src/engine/parity.test.ts src/ui/html.test.ts src/state/persist.test.ts src/state/weekstash.test.ts src/engine/restore.test.ts src/engine/drafts.test.ts src/engine/keys.test.ts src/engine/audit-d-keyspace.test.ts`. Expected PASS (the parity file never boots; html prints no row field). If `parity.test.ts:87` is red on `rid`, extend `stripKeys` to drop `'rid'` too and wrap that line's port side in it, with a comment in the same idiom as `key`.

- [ ] **Step 6:** `npm run build` (typecheck). Commit `feat(engine): every schedule row carries a stable rid — walked before every baseline and snapshot, declared and pinned`.

---

### Task 3: `tracker/app/ids.js` — the pure converter

**Files:**
- Create: `src/tracker/app/ids.js`
- Test: `src/tracker/app/ids.test.ts`

**Interfaces:**
- Produces: `mintId(): string` (prefix `s`), `isEntry(e): boolean`, `upgradeCourseBlock(block, links) → { block, ids }` where `block = { plan?, bySyllabus: { [syl]: { roster, marks, dates } }, lulls, pace }`, `links = { [studentName]: personId } | null`, `ids = { [name]: id }`.

- [ ] **Step 1: failing test**

```ts
// src/tracker/app/ids.test.ts
/* The one converter from name keys to enrolment ids (stable-ids, 10 Sep 26):
   used once per course at load (core.js migrateIds) and on every import
   (applyStudents), so the two paths cannot drift. */
import { describe, expect, it } from 'vitest'
import { isEntry, mintId, upgradeCourseBlock } from './ids.js'

const legacy = () => ({
  plan: { sylName: 'A' },
  bySyllabus: {
    A: { roster: ['STUDENT A', 'STUDENT B'], marks: { 'STUDENT A': { 'ST-01': { g: 'dco' } } }, dates: { 'STUDENT B': { lastSyll: '2026-01-01' } } },
    B: { roster: ['STUDENT A'], marks: { 'STUDENT A': { 'ST-02': { g: 'dpco' } } }, dates: {} },
  },
  lulls: { 'STUDENT A': [{ start: '2026-02-01', end: '2026-02-03' }] },
  pace: { 'STUDENT B': { epw: '3' } },
})

describe('upgradeCourseBlock', () => {
  it('turns string rosters into entries — the same name on two syllabi is ONE id — and re-keys every map', () => {
    const { block, ids } = upgradeCourseBlock(legacy(), { 'STUDENT A': 'p1' })
    const a = ids['STUDENT A'], b = ids['STUDENT B']
    expect(a).toMatch(/^s[0-9a-z]+$/); expect(b).toMatch(/^s[0-9a-z]+$/); expect(a).not.toBe(b)
    expect(block.bySyllabus.A.roster).toEqual([{ id: a, name: 'STUDENT A', pid: 'p1' }, { id: b, name: 'STUDENT B' }])
    expect(block.bySyllabus.B.roster).toEqual([{ id: a, name: 'STUDENT A', pid: 'p1' }])
    expect(block.bySyllabus.A.marks).toEqual({ [a]: { 'ST-01': { g: 'dco' } } })
    expect(block.bySyllabus.A.dates).toEqual({ [b]: { lastSyll: '2026-01-01' } })
    expect(block.bySyllabus.B.marks).toEqual({ [a]: { 'ST-02': { g: 'dpco' } } })
    expect(block.lulls).toEqual({ [a]: [{ start: '2026-02-01', end: '2026-02-03' }] })
    expect(block.pace).toEqual({ [b]: { epw: '3' } })
    expect(block.plan).toEqual({ sylName: 'A' })
  })
  it('an entry already an object is kept as it is, its id reused for the same name elsewhere', () => {
    const src: any = legacy(); src.bySyllabus.A.roster[0] = { id: 'sfixed', name: 'STUDENT A' }
    const { block, ids } = upgradeCourseBlock(src, null)
    expect(ids['STUDENT A']).toBe('sfixed')
    expect(block.bySyllabus.B.roster[0]).toEqual({ id: 'sfixed', name: 'STUDENT A' })
    expect(block.bySyllabus.B.marks).toEqual({ sfixed: { 'ST-02': { g: 'dpco' } } })
  })
  it('a link for a name not on any roster is ignored; a non-string entry is dropped', () => {
    const src: any = legacy(); src.bySyllabus.A.roster.push(7)
    const { block } = upgradeCourseBlock(src, { NOBODY: 'p9' })
    expect(block.bySyllabus.A.roster.length).toBe(2)
    expect(block.bySyllabus.A.roster.some((r: any) => r.pid)).toBe(false)
  })
  it('does not mutate its input', () => {
    const src = legacy(); const copy = JSON.parse(JSON.stringify(src))
    upgradeCourseBlock(src, null); expect(src).toEqual(copy)
  })
  it('isEntry and mintId', () => {
    expect(isEntry({ id: 'x', name: 'N' })).toBe(true); expect(isEntry('N')).toBe(false); expect(isEntry({ id: '', name: 'N' })).toBe(false)
    expect(mintId()).not.toBe(mintId())
  })
})
```

- [ ] **Step 2:** run → FAIL. **Step 3: implementation**

```js
// src/tracker/app/ids.js
/* ENROLMENT IDS (10 Sep 26, the stable-ids round). A student used to BE
   their typed name: the roster was a string array and the name was a segment
   of every storage key. Now a roster entry is { id, name, pid? } — an opaque
   id minted when the student is added, the name a label, the person id from
   Raptor's roster when they were picked off it — and every per-student record
   files under the id. This module is the ONE converter from the old shape to
   the new, pure (no storage, no core.js), so the once-per-course migration at
   load and the import of an older file cannot drift apart.
   Random rather than a counter so two browsers never mint the same id. */
export function mintId() { return 's' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }
export const isEntry = e => !!e && typeof e === 'object' && !Array.isArray(e) && typeof e.id === 'string' && !!e.id && typeof e.name === 'string';

/* One course's block in the file shape — { plan, bySyllabus: { syl: { roster,
   marks, dates } }, lulls, pace } — name-keyed in, id-keyed out. The same name
   on two syllabi is one student (pace and lulls are per course), so one map
   of name → id spans the block; an entry already an object keeps its id and
   lends it to the same name elsewhere. `links` is the course's old
   { name: personId } map, folded into `pid`. Returns the new block and the
   name → id map (the caller moves the course-level keys the block does not
   carry: last-edit, lastStudent, the per-browser lastCrew pref). */
export function upgradeCourseBlock(block, links) {
  const ids = {};
  const src = block || {};
  const syls = src.bySyllabus || {};
  for (const syl in syls) for (const e of (syls[syl].roster || [])) if (isEntry(e) && !ids[e.name]) ids[e.name] = e.id;
  const idFor = name => ids[name] || (ids[name] = mintId());
  const rekey = m => { const o = {}; for (const k in (m || {})) o[ids[k] || k] = m[k]; return o; };
  const bySyllabus = {};
  for (const syl in syls) {
    const sv = syls[syl] || {};
    const roster = [];
    for (const e of (sv.roster || [])) {
      if (isEntry(e)) { roster.push({ ...e }); continue; }
      if (typeof e !== 'string' || !e) continue;
      const entry = { id: idFor(e), name: e };
      const pid = links && links[e];
      if (typeof pid === 'string' && pid) entry.pid = pid;
      roster.push(entry);
    }
    bySyllabus[syl] = { ...sv, roster, marks: rekey(sv.marks), dates: rekey(sv.dates) };
  }
  const out = { ...src, bySyllabus, lulls: rekey(src.lulls), pace: rekey(src.pace) };
  return { block: JSON.parse(JSON.stringify(out)), ids };
}
```

- [ ] **Step 4:** PASS. **Step 5:** commit `feat(tracker): ids.js — the one converter from name-keyed student records to enrolment ids`.

---

### Task 4: `fileFormat.js` — both roster shapes, no colon rule on students

**Files:**
- Modify: `src/tracker/app/fileFormat.js:4-18, 109-142`
- Test: `src/tracker/app/fileFormat.test.ts`

- [ ] **Step 1: tests.** In `fileFormat.test.ts` REPLACE the `'a crew member on a roster, or filed under marks or dates'` case with:
```ts
  it('a crew member MAY contain a colon — the name is a label now, not a key (stable ids, 10 Sep 26)', () => {
    const s = people('26ABSG', '2026', 'A: B'); (s.byCourse['26ABSG'] as any).pace = { 'P:Q': {} }
    expect(() => readFile(file({ students: s }))).not.toThrow()
  })
```
and ADD a describe:
```ts
describe('the roster shape (stable ids, 10 Sep 26)', () => {
  const entries = (course: string, syl: string, roster: any[]) => ({
    courses: [course], byCourse: { [course]: { plan: {}, bySyllabus: { [syl]: { roster, marks: {}, dates: {} } } } },
  })
  it('a legacy string roster still reads', () => {
    expect(() => readFile(file({ students: entries('C', 'S', ['STUDENT A']) }))).not.toThrow()
  })
  it('an entry roster reads — id and name strings, pid optional', () => {
    expect(() => readFile(file({ students: entries('C', 'S', [{ id: 's1', name: 'STUDENT A' }, { id: 's2', name: 'STUDENT B', pid: 'p2' }]) }))).not.toThrow()
  })
  it('a damaged entry is refused, naming the syllabus', () => {
    for (const bad of [{ id: '', name: 'X' }, { id: 's1' }, { name: 'X' }, 5, null])
      expect(() => readFile(file({ students: entries('C', 'S', [bad]) })), JSON.stringify(bad)).toThrow(/crew list for “S”/)
  })
  it('a roster mixing strings and entries is refused', () => {
    expect(() => readFile(file({ students: entries('C', 'S', ['STUDENT A', { id: 's1', name: 'B' }]) }))).toThrow(/crew list for “S”/)
  })
})
```
- [ ] **Step 2:** run → FAIL (colon refused / mixed accepted).
- [ ] **Step 3:** in `fileFormat.js` replace lines 126-128 with:
```js
      /* two roster shapes (stable ids, 10 Sep 26): the legacy string list, or
         entries { id, name, pid? } — one or the other, never a mix, so the
         reader cannot half-upgrade a file */
      const rs = sv.roster || [];
      const isEntry = e => !!e && typeof e === 'object' && !Array.isArray(e) && typeof e.id === 'string' && !!e.id && typeof e.name === 'string' && (e.pid == null || (typeof e.pid === 'string' && !!e.pid));
      const allStr = rs.every(n => typeof n === 'string'), allEntry = rs.every(isEntry);
      if (sv.roster != null && (!Array.isArray(sv.roster) || !(allStr || allEntry)))
        throw new Error('The crew list for “' + syl + '” on course “' + course + '” is damaged, so that file has not been opened.');
```
delete line 128 (`noColon('crew member' …)` on the roster), line 132 (marks/dates keys) and line 139 (lulls/pace keys); keep course/syllabus/chart checks. Update the header comment (lines 4-18): `roster: string[] | {id,name,pid?}[]`, marks/dates/lulls/pace keyed by the entry id (legacy: by name), `links` legacy-only (read, never written since 10 Sep 26). Keep `checkLinks` and `buildFile`'s `links` param (legacy round trip).
- [ ] **Step 4:** PASS. **Step 5:** commit `feat(tracker): the file format reads both roster shapes; a student name is a label, not a key`.

---

### Task 5: `core.js` + components — students keyed by id, migration, file plumbing

**Files:**
- Modify: `src/tracker/app/core.js` (sites listed below), `src/tracker/components/Header.jsx:183-185`, `SidePanel.jsx:65-93, 157-183, 254-260, 266`, `Pop.jsx:19, 29`, `ShowAllPanel.jsx:81-86`, `Modals.jsx:218`
- Test: `src/tracker/tracker.test.tsx` (existing tests updated + new)

**Interfaces:**
- Consumes: `mintId`, `isEntry`, `upgradeCourseBlock` from `./ids.js`.
- Produces (exports on core): `roster: {id,name,pid?}[]`, `nameOf(id)`, `pidOf(id)`, `byName(name)`, `linkedPerson(id)`, `mintId`; `active`, `failLog`, `lullCopy.from/picked`, undo `who` are ids; `collectStudents()` id-keyed; `applyStudents(students, links?)`; `window.__coreForTests` gains `rosterNow: () => roster`, `nameOf`, `byName`, loses `collectLinks/applyLinks/loadLinks`.

- [ ] **Step 1: the two headline tests first** (append to `tracker.test.tsx` inside the existing people/link describe that has `C`, `P`, `storage` helpers — reuse its setup):
```ts
  it('existing data converts once per course: names become entries, records re-file under the id, links fold into pid, old keys go', async () => {
    const c = 'MIGR'
    await storage.set('v3:courses', JSON.stringify([c]))
    await storage.set('v3:' + c + ':rostermig', '1')
    await storage.set('v3:' + c + ':plan', JSON.stringify({ sylName: '2026', custom: false }))
    await storage.set('v3:' + c + ':2026:roster', JSON.stringify(['ALPHA', 'BRAVO']))
    await storage.set('v3:' + c + ':2026:m:ALPHA', JSON.stringify({ 'ST-01': { g: 'dco' } }))
    await storage.set('v3:' + c + ':2026:d:BRAVO', JSON.stringify({ lastSyll: '2026-01-02', lastCurr: null }))
    await storage.set('v3:' + c + ':pace:ALPHA', JSON.stringify({ epw: '4' }))
    await storage.set('v3:' + c + ':lulls:ALPHA', JSON.stringify([{ start: '2026-03-01', end: '2026-03-02' }]))
    await storage.set('v3:' + c + ':last:ALPHA', JSON.stringify({ syl: '2026', event: 'ST-01' }))
    await storage.set('v3:' + c + ':lastStudent', 'ALPHA')
    await storage.set('v3:links', JSON.stringify({ [c]: { ALPHA: 'p1' } }))
    await C.loadCourse(c); await C.whenLoaded()
    const a = C.byName('ALPHA')!, b = C.byName('BRAVO')!
    expect(a).toEqual({ id: expect.stringMatching(/^s/), name: 'ALPHA', pid: 'p1' }); expect(b).toEqual({ id: expect.stringMatching(/^s/), name: 'BRAVO' })
    expect(C.gradeOf(a.id, 'ST-01')).toBe('dco'); expect(C.dates[b.id].lastSyll).toBe('2026-01-02')
    expect(C.paceOf(a.id).epw).toBe('4'); expect(C.lulls[a.id].length).toBe(1)
    expect((await storage.get('v3:' + c + ':2026:m:' + a.id))!.value).toContain('dco')
    for (const k of ['2026:m:ALPHA', '2026:d:BRAVO', 'pace:ALPHA', 'lulls:ALPHA', 'last:ALPHA']) expect(await storage.get('v3:' + c + ':' + k), k).toBeNull()
    expect((await storage.get('v3:' + c + ':lastStudent'))!.value).toBe(a.id)
    expect((await storage.get('v3:' + c + ':idmig'))!.value).toBe('1')
    expect(JSON.parse((await storage.get('v3:links'))?.value || '{}')[c]).toBeUndefined()
    expect(C.active).toBe(a.id)
  })
  it('+ Add mints an entry: a typed name has no pid, a picked person carries theirs; same name or same person is not added twice', async () => {
    setPeople(P)                                   // P[0] = { id: 'p1', cs: 'Ranger', … } as the file's other tests use
    let p = C.addStudent(); C.dlgClose({ pick: 'p1' }); await p; await C.whenLoaded()
    const r = C.byName('RANGER')!
    expect(r).toEqual({ id: expect.stringMatching(/^s/), name: 'RANGER', pid: 'p1' })
    expect(C.active).toBe(r.id); expect(C.linkedPerson(r.id)).toEqual(P[0])
    p = C.addStudent(); C.dlgClose('solo'); await p; await C.whenLoaded()
    expect(C.byName('SOLO')).toEqual({ id: expect.stringMatching(/^s/), name: 'SOLO' })
    const n = C.roster.length
    p = C.addStudent(); C.dlgClose({ pick: 'p1' }); await p; await C.whenLoaded()
    p = C.addStudent(); C.dlgClose('SOLO'); await p; await C.whenLoaded()
    expect(C.roster.length).toBe(n)
    expect((await storage.get('v3:' + C.course + ':' + C.curSyl() + ':m:' + r.id))!.value).toBe('{}')
    expect(await storage.get('v3:' + C.course + ':' + C.curSyl() + ':m:RANGER')).toBeNull()
  })
```
(Dialog helpers as the file already uses them: `C.dlgClose(value)` answers the open dialog synchronously — `{ pick: 'p1' }` for a roster pick, a string for typed text, `true` for a confirm; `answer(v)` for the async prompt flow; `P` is the two-person bridge fixture `[{ id: 'p1', cs: 'Ranger', … }, { id: 'p2', cs: 'Bravo', … }]`; `until(fn)` waits on a condition. `delSyl` in Task 6 confirms through `answer(true)` — check its dialog in `core.js` and drive it the same way the existing syllabus tests do.)
- [ ] **Step 2:** run the file → the two new tests FAIL; many existing tests still pass.

- [ ] **Step 3: core.js.** Edits, in file order:
  1. Import: `import { mintId, isEntry, upgradeCourseBlock } from './ids.js';` Export `mintId` (`export { mintId }`).
  2. `:167-171` comment: `roster = []` is `[{ id, name, pid? }]`; the maps key by id.
  3. After `:258` add `const kIdMig = c => 'v3:' + c + ':idmig';  /* one-shot name → id migration flag */`.
  4. Replace the LINK block `:391-427` with:
```js
/* THE PERSON ON THE ENTRY (10 Sep 26, stable ids — replaces the v3:links
   record of 9 Sep 26): a roster entry { id, name, pid? } carries the Raptor
   PEOPLE id it was picked with; a typed student has none. app/ids.js is the
   converter; migrateIds below folds an old links record in once per course. */
const kLinks = 'v3:links';   /* legacy record, read by migrateIds only */
export function nameOf(id) { const r = roster.find(x => x.id === id); return r ? r.name : ''; }
export function pidOf(id) { const r = roster.find(x => x.id === id); return (r && r.pid) || null; }
export function byName(name) { return roster.find(x => x.name === name) || null; }
/* The bridge person a student on the CURRENT course is linked to, or null —
   null too when the pid names somebody Raptor no longer offers. */
export function linkedPerson(id) { const pid = pidOf(id); if (!pid) return null; return getPeople().find(p => p.id === pid) || null; }
```
     keep `onPeople(() => notify());` and `seatWord`. Delete `LINKS`, `loadLinks`, `saveLinks`, `linkOf`.
  5. `refuseColon` stays (courses/syllabi). Remove the call at `:2616` (addStudent) only.
  6. After `migrateRosters` add:
```js
/* Name keys → enrolment ids, once per course (stable ids, 10 Sep 26). Reads
   the course into the file-shaped block, converts through the one converter,
   writes the id-keyed records, deletes the name-keyed ones, moves the
   course-level extras the block does not carry, folds the old links record
   in. Every move is read-then-write-then-delete, so a throw mid-way leaves
   the flag unset and the next load finds either the old key or the new. */
async function migrateIds(c) {
  try {
    if (await sGet(kIdMig(c))) return;
    const { block: old, names } = await readCourseBlock(c, true);
    const links = sParse(await sGet(kLinks), {}, 'object')[c] || null;
    const { block, ids } = upgradeCourseBlock(old, links);
    await writeCourseBlock(c, block);
    for (const syl in old.bySyllabus) for (const n of names) {
      if (!ids[n] || ids[n] === n) continue;
      await delKey(kMarksFor(c, syl, n)); await delKey(kDatesFor(c, syl, n));
    }
    for (const n of names) {
      const id = ids[n]; if (!id) continue;
      await delKey(kLulls(c, n)); await delKey(kPace(c, n));
      const le = await sGet(kLast(c, n)); if (le) { await sSet(kLast(c, id), le); await delKey(kLast(c, n)); }
      const od = await sGet(kDatesOld(c, n)); if (od) { await sSet(kDatesOld(c, id), od); await delKey(kDatesOld(c, n)); }
    }
    const ls = await sGet(kLastStudent(c)); if (ls && ids[ls]) await sSet(kLastStudent(c), ids[ls]);
    const lc = prefGet('lastCrew:' + c); if (lc && ids[lc]) prefSet('lastCrew:' + c, ids[lc]);
    if (links) { const all = sParse(await sGet(kLinks), {}, 'object'); delete all[c]; if (Object.keys(all).length) await sSet(kLinks, JSON.stringify(all)); else await delKey(kLinks); }
    await sSet(kIdMig(c), '1');
  } catch (_) {}
}
/* One course as the file-shaped block { plan, bySyllabus: { syl: { roster,
   marks, dates } }, lulls, pace } — collectStudents and migrateIds read it,
   applyStudents and migrateIds write it. `withNames` also returns every
   string entry seen, for the migration's key deletes. */
async function readCourseBlock(c, withNames) {
  const bySyllabus = {}, names = new Set();
  for (const n of orderedSylNames()) {
    const roster = sParse(await sGet(kRosterFor(c, n)), [], 'array');
    if (!roster.length) continue;
    const marks = {}, dates = {};
    for (const e of roster) {
      const s = isEntry(e) ? e.id : (typeof e === 'string' ? e : null); if (!s) continue;
      if (typeof e === 'string') names.add(e);
      const m = await sGet(kMarksFor(c, n, s)); if (m) { try { marks[s] = JSON.parse(m); } catch (_) {} }
      const d = await sGet(kDatesFor(c, n, s)); if (d) { try { dates[s] = JSON.parse(d); } catch (_) {} }
    }
    bySyllabus[n] = { roster, marks, dates };
  }
  let plan = {}; try { const p = await sGet(kPlan(c)); if (p) plan = JSON.parse(p); } catch (_) {}
  const lulls = {}, pace = {};
  for (const n in bySyllabus) for (const e of bySyllabus[n].roster) {
    const s = isEntry(e) ? e.id : e; if (lulls[s] || pace[s]) continue;
    const l = await sGet(kLulls(c, s)); if (l) { try { lulls[s] = JSON.parse(l); } catch (_) {} }
    const pc = await sGet(kPace(c, s)); if (pc) { try { pace[s] = JSON.parse(pc); } catch (_) {} }
  }
  return { block: { plan, lulls, pace, bySyllabus }, names: withNames ? [...names] : [] };
}
async function writeCourseBlock(c, block) {
  if (block.plan && Object.keys(block.plan).length) await sSet(kPlan(c), JSON.stringify(block.plan));
  for (const s in (block.lulls || {})) await sSet(kLulls(c, s), JSON.stringify(block.lulls[s]));
  for (const s in (block.pace || {})) await sSet(kPace(c, s), JSON.stringify(block.pace[s]));
  for (const n in (block.bySyllabus || {})) {
    const b = block.bySyllabus[n];
    await sSet(kRosterFor(c, n), JSON.stringify(b.roster || []));
    for (const s in (b.marks || {})) await sSet(kMarksFor(c, n, s), JSON.stringify(b.marks[s]));
    for (const s in (b.dates || {})) await sSet(kDatesFor(c, n, s), JSON.stringify(b.dates[s]));
  }
}
```
     `readCourseBlock` must be defined before `orderedSylNames` is CALLED, not declared — hoisting covers function declarations; fine anywhere.
  7. `loadCourseNow`: after `await migrateRosters(c);` (`:543`) add `await migrateIds(c);`. `:545` → `roster = sParse(rr, [], 'array').filter(isEntry);`. `:550-552`:
```js
  const __myS = prefGet('lastCrew:' + c);
  const has = id => !!id && roster.some(r => r.id === id);
  active = has(__myS) ? __myS : (has(__lastS) ? __lastS : (roster[0] ? roster[0].id : null));
```
     `:558` `for (const s of roster)` → `for (const { id: s } of roster)`.
  8. `loadStudent` `:595` → `for (const { id: s } of roster) {`.
  9. `markHtml` `:705-706`: `escapeId(s)` → `escapeId(nameOf(s))`.
  10. `ballGroup` `:764` → `const s = roster[i] ? roster[i].id : null; const g = gradeOf(s, ev.id);`; `:786` → `const ai = roster.findIndex(r => r.id === active);`.
  11. Undo `:1462` → `' for ' + nameOf(u.who)`; `applyMarkHist` unchanged.
  12. `renderKeyBall` `:2270` → `const r = roster[i]; const on = !!r && r.id === active;`; `:2275` → `escapeId(r ? r.name : '')`.
  13. `ballTap` `:2313-2314` → `const r = roster[+w.dataset.wi]; if (r && r.id !== active) { setActive(r.id, { land: false }); return; }`.
  14. `addStudent` `:2616-2626`:
```js
  await onChain(async () => {
    /* the same name on this chart, or the same person, is the student already
       here — picked again with a link, an unlinked entry gains the pid */
    let r = roster.find(x => x.name === v) || (link ? roster.find(x => x.pid === link) : null);
    if (!r) {
      r = { id: mintId(), name: v }; if (link) r.pid = link;
      roster.push(r); marks[r.id] = {}; dates[r.id] = { lastSyll: null, lastCurr: null };
      await saveRoster(); await saveMarks(r.id); await saveDates(r.id);
    } else if (link && !r.pid) { r.pid = link; await saveRoster(); }
    active = r.id; refreshActive(); renderBoard(); renderSide();
  });
```
      (drop the `refuseColon(v)` line and the `LINKS` line.)
  15. `removeStudent(v)` `:2629`: `'Remove ' + nameOf(v) + ' from '`. `removeStudentNow(v)`: `:2633` → `roster = roster.filter(x => x.id !== v);`; `:2652` → `if (sParse(rr, [], 'array').some(x => isEntry(x) && x.id === v))`; delete `:2655-2657` (the LINKS lines); `:2660` → `if (active === v) active = roster[0] ? roster[0].id : null;`.
  16. `saveCrewOrder` `:2819-2823`:
```js
export async function saveCrewOrder(list) {
  await onChain(async () => {
    /* the modal lists names; rank the entries by them, anyone it did not
       name (added meanwhile) keeps their place after */
    const byN = new Map(roster.map(r => [r.name, r]));
    const ranked = list.map(n => byN.get(n)).filter(Boolean);
    roster = [...ranked, ...roster.filter(r => !ranked.includes(r))];
    await saveRoster();
  });
```
  17. `moveSylData` `:2739-2748`: build `const ids = new Set(); const add = arr => (arr || []).forEach(e => { if (isEntry(e)) ids.add(e.id); });` — `add(sParse(rr, [], 'array'))`; drop the `kRoster(c)` legacy merge line `:2741`; `if (c === course && …) add(roster);` then `for (const s of ids)`.
  18. `renCourse` `:2863-2896`: add `await move(kIdMig(old), kIdMig(v));` after `:2867`; `:2870-2876` → `const rs = sParse(await sGet(kRosterFor(old, sn)), [], 'array').filter(isEntry).map(e => e.id); const ids = sn === plan.sylName ? [...new Set([...rs, ...roster.map(r => r.id)])] : rs; for (const s of ids) { … }`; `:2878` → `for (const { id: s } of roster)`; `:2883-2886` → `const everyone = new Set(roster.map(r => r.id)); … .filter(isEntry).forEach(e => everyone.add(e.id))`; delete `:2895-2896` (LINKS).
  19. `dupSyl` `:2977-2980` → `for (const { id: s } of roster) {`.
  20. `collectStudents` `:3325-3360` →
```js
export async function collectStudents() {
  const byCourse = {};
  for (const c of COURSES) byCourse[c] = (await readCourseBlock(c, false)).block;
  return { courses: COURSES.slice(), byCourse };
}
```
      Delete `collectLinks` `:3362-3374`.
  21. `applyStudents(students, links)` `:3419-3444`:
```js
export async function applyStudents(students, links) {
  const courses = (students && students.courses) || [];
  for (const c of courses) {
    const cs = (students.byCourse || {})[c] || {};
    /* an older file is name-keyed and may carry a links block; the converter
       lands both as entries with pids — the same path the store's own data took */
    const { block } = upgradeCourseBlock({ plan: cs.plan, lulls: cs.lulls, pace: cs.pace, bySyllabus: cs.bySyllabus }, (links || {})[c] || null);
    await writeCourseBlock(c, block);
    await sSet(kIdMig(c), '1');
  }
  … (the merge of COURSES and reloadFromStore unchanged)
```
      Delete `applyLinks` `:3446-3469`.
  22. Export `:3518-3521`: drop the `links:` line. Import `:3555` → `const { charts, students, links } = FMT.readFile(obj);` stays; `:3582` → `if (people) await applyStudents(students, links);`.
  23. `init` `:3604`: delete `await loadLinks();`. `:3640-3641` → `window.__coreForTests = { layoutSnapshotFor, collectCharts, collectStudents, applyCharts, applyStudents, whenLoaded, SYLLABI, DEFAULT_LAYOUTS, rosterNow: () => roster, nameOf, byName };`.
  24. Anywhere else `linkOf(` or `LINKS` remains: `grep -n "linkOf\|LINKS\b\|saveLinks\|loadLinks\|collectLinks\|applyLinks" src/tracker/app/core.js` must return nothing.

- [ ] **Step 4: components.**
  - `Header.jsx:184` → `{core.roster.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}`.
  - `SidePanel.jsx:68` → `const others = core.roster.filter(r => r.id !== c.from);`; `:74` and `:85` → `{core.nameOf(c.from)}`; `:78-82` → `key={r.id}`, `value={r.id}`, `checked={c.picked.includes(r.id)}`, `onChange={e => core.toggleLullCopy(r.id, e.target.checked)}`, text `{r.name}`.
  - `SidePanel.jsx:159` → `const list = core.roster.some(r => r.id === s) ? core.failList(s) : [];`; `:165` → `Failures — {core.nameOf(s)}`; `:178` → `for {core.nameOf(s)}`.
  - `SidePanel.jsx:254-259` → `const p = core.linkedPerson(r.id); … <span key={r.id} …> <b>{i + 1}</b> {r.name} <span className="x" data-rm={r.id} onClick={() => core.removeStudent(r.id)}>×</span>`.
  - `SidePanel.jsx:266` → `— {core.nameOf(s)}`.
  - `Pop.jsx:29` → `{p.id}  ·  {core.nameOf(s)}`.
  - `ShowAllPanel.jsx:86` → `` title={`${core.nameOf(core.active)}: ${label || 'not done'}`} ``.
  - `Modals.jsx:218` → `read: () => core.roster.map(r => r.name),`.

- [ ] **Step 5: bring the existing tests to the new truth** (`tracker.test.tsx`, ~32 sites; `npx vitest run src/tracker/tracker.test.tsx` and fix each red by these rules, never by deleting a check):
  - `expect(C.roster).toContain('X')` → `expect(C.roster.map(r => r.name)).toContain('X')`; `C.roster as string[]` → names.
  - `C.linkOf(C.course, 'X')` → `C.pidOf(C.byName('X')!.id)`; `C.linkedPerson('X')` → `C.linkedPerson(C.byName('X')!.id)`.
  - Assertions on the `v3:links` record → assert the entry's `pid` instead (`C.byName('X')!.pid`), and that `storage.get('v3:links')` is null after the course loads.
  - Storage keys built with a name (`:m:STUDENT Z`, `pace:…`) → build with `C.byName('STUDENT Z')!.id`.
  - The course-rename link test (~:805-816) → the moved keys carry the id; `pid` survives the rename.
  - The export/import tests (~:884): `exported.links` is gone; `students.byCourse[c].bySyllabus[s].roster[0].pid` carries it; a LEGACY file (string roster + `links` block) imported through `applyStudents(students, links)` lands entries with `pid`.
  - The colon test (~:760): student name with a colon is now ACCEPTED (`C.byName('A:B')` exists); course and syllabus refusals unchanged. The undo tooltip pins (`for STUDENT Z`) stay as they are — they read the NAME.
  - `openLullCopy('STUDENT A')` (:75) → `openLullCopy(C.byName('STUDENT A')!.id)`, expected `from` the id.
  - `resetSession`/render tests that count `#activeSel option` by value → by text.
- [ ] **Step 6:** whole file green: `npx vitest run src/tracker`. Also `npx vitest run src/tracker/tracker.test.tsx -t "imports the engine"`-style guard still green (no engine import added).
- [ ] **Step 7:** commit `feat(tracker): students keyed by enrolment id — migration once per course, the link folded into the entry, every surface reads the name off the entry`.

---

### Task 6: The remaining pins (undo, remove, renames, duplicate, legacy import, second load)

**Files:** `src/tracker/tracker.test.tsx` (append to the same describe).

- [ ] **Step 1: tests** (each may already pass — they PIN):
```ts
  it('a mark files under the id, never the name; undo carries the id and the tooltip reads the name', async () => {
    const r = C.byName('SOLO') || (await (async () => { const p = C.addStudent(); C.dlgClose('solo'); await p; await C.whenLoaded(); return C.byName('SOLO')! })())
    C.setActive(r.id); C.openPop('ST-01', { clientX: 0, clientY: 0 }); await C.popGrade('dco')
    expect(C.gradeOf(r.id, 'ST-01')).toBe('dco')
    expect(JSON.parse((await storage.get('v3:' + C.course + ':' + C.curSyl() + ':m:' + r.id))!.value)['ST-01'].g).toBe('dco')
    expect(await storage.get('v3:' + C.course + ':' + C.curSyl() + ':m:SOLO')).toBeNull()
    expect(C.undoWhat()).toMatch(/for SOLO$/)
    await C.doUndo(); expect(C.gradeOf(r.id, 'ST-01')).toBe(0)
  })
  it('removing a student drops the id-keyed records and prunes their undo steps', async () => {
    const r = C.byName('SOLO')!; C.setActive(r.id); C.openPop('ST-01', { clientX: 0, clientY: 0 }); await C.popGrade('dco')
    const p = C.removeStudent(r.id); C.dlgClose(true); await p; await C.whenLoaded()
    expect(C.byName('SOLO')).toBeNull(); expect(C.marks[r.id]).toBeUndefined()
    for (const k of [C.curSyl() + ':m:' + r.id, C.curSyl() + ':d:' + r.id, 'pace:' + r.id, 'lulls:' + r.id, 'last:' + r.id]) expect(await storage.get('v3:' + C.course + ':' + k), k).toBeNull()
    expect(C.canUndo()).toBe(false)
  })
  it('a course rename and a syllabus duplicate move and copy the id-keyed records; the pid rides along', async () => {
    let p: Promise<any> = C.addStudent(); C.dlgClose({ pick: 'p2' }); await p; await C.whenLoaded()
    const b = C.byName('BRAVO')!; C.setActive(b.id)
    C.openPop('ST-01', { clientX: 0, clientY: 0 }); await C.popGrade('dco')
    const old = C.course, syl = C.curSyl()
    p = C.renCourse(); await answer('IDTEST'); await p; await C.whenLoaded()
    expect(C.course).toBe('IDTEST')
    expect(C.byName('BRAVO')).toEqual(b)                                   // same id, same pid, on the renamed course
    expect(C.gradeOf(b.id, 'ST-01')).toBe('dco')
    expect((await storage.get('v3:IDTEST:' + syl + ':m:' + b.id))!.value).toContain('dco')
    expect(await storage.get('v3:' + old + ':' + syl + ':m:' + b.id)).toBeNull()
    expect((await storage.get('v3:IDTEST:idmig'))!.value).toBe('1')
    p = C.dupSyl(); await answer(syl + ' copy'); await p; await C.whenLoaded()
    expect(C.curSyl()).toBe(syl + ' copy')
    expect(C.byName('BRAVO')).toEqual(b); expect(C.gradeOf(b.id, 'ST-01')).toBe('dco')
    expect((await storage.get('v3:IDTEST:' + syl + ' copy:m:' + b.id))!.value).toContain('dco')
    p = C.delSyl(); await answer(true); await p; await C.whenLoaded()      // back to the source chart
    p = C.renCourse(); await answer(old); await p; await C.whenLoaded()
    expect(C.course).toBe(old); expect(C.byName('BRAVO')).toEqual(b)
  })
  it('the migration is a no-op on a second load, and an entry roster written by an import is left alone', async () => {
    const before = JSON.stringify(C.roster); await C.loadCourse(C.course); await C.whenLoaded()
    expect(JSON.stringify(C.roster)).toBe(before)
  })
  it('a legacy export (string roster + links block) imports as entries with pids; a new export carries no links block', async () => {
    await C.applyStudents({ courses: ['LEG'], byCourse: { LEG: { plan: { sylName: '2026' }, lulls: {}, pace: {}, bySyllabus: { '2026': { roster: ['ALPHA'], marks: { ALPHA: { 'ST-01': { g: 'dco' } } }, dates: {} } } } } }, { LEG: { ALPHA: 'p1' } })
    await C.loadCourse('LEG'); await C.whenLoaded()
    const a = C.byName('ALPHA')!; expect(a.pid).toBe('p1'); expect(C.gradeOf(a.id, 'ST-01')).toBe('dco')
    const out = await C.collectStudents()
    expect(out.byCourse.LEG.bySyllabus['2026'].roster[0]).toEqual(a)
    expect(Object.keys(out.byCourse.LEG.bySyllabus['2026'].marks)).toEqual([a.id])
    expect(FMT.buildFile({ students: out, savedAt: 'x' }).contains.links).toBe(false)
  })
```
  Fill the rename/duplicate case from the existing rename test's mechanics (it is in the file at ~:800-816); no placeholder may remain.
- [ ] **Step 2:** run; any red is a Task 5 bug — fix in core.js, not the test. Commit `test(tracker): pins for the id-keyed records — undo, remove, rename, duplicate, legacy import`.

---

### Task 7: The smoke suite

**Files:** `scripts/tracker/smoke.mjs` (helpers `:1885-1953`, `:1117-1119`, `:2067`, `:2623-2658`, `:3875`, and every `#activeSel option … o.value` read).

- [ ] **Step 1:** helpers:
  - `addStudent`: wait on `o.textContent === n`, not `o.value`.
  - `rosterNow` and every `[...querySelectorAll('#activeSel option')].map(o => o.value)` → `.map(o => o.textContent)`; `pg.selectOption('#activeSel', roster0[0])` → `{ label: roster0[0] }`.
  - chip removal `.x[data-rm="${n}"]` → `pg.locator('.c-students .chip', { hasText: n }).locator('.x').click()`; same at `:2648`.
  - direct key reads (`:1117-1119`, `:639-640`, `:2623-2658`): resolve the id first — `const id = window.__coreForTests.byName(name).id` — and build `…:m:` + id / `pace:` + id / `lulls:` + id. Where a key is SEEDED before load (`:2623`, `:2641`), seed by id after the course loads, or seed the legacy name form and let the migration move it (assert on the id key after).
  - `:1940-1943` (export links) → assert `exported.students.byCourse[courseNow].bySyllabus[syl].roster.find(r => r.name === picked).pid === first.key` and no `exported.links`.
- [ ] **Step 2: one new check** after the link block: seed a legacy-shape course in localStorage (`raptor:tracker/v3:LEGACY:2026:roster` = `["OLD A"]`, a mark under the name, `v3:links` = `{LEGACY:{"OLD A":"<first.key>"}}`, `v3:courses` including LEGACY, `rostermig` flag), `pg.reload()`, pick course LEGACY, and `ok(...)` that the option text reads OLD A, the chip is `.linked`, the id-keyed mark key exists and the name-keyed one is gone.
- [ ] **Step 3:** `npm run smoke:tracker` → all green (expect ≥ 417 + the new checks). Commit `test(tracker): the smoke suite reads students by label and resolves ids; a legacy store converts on load`.

---

### Task 8: Documents, gates, drive, push

**Files:** `docs/data-schema.md`, `docs/data-model.md`, `docs/handover-dataverse.md`, `CLAUDE.md`, `../HANDOFF.md`, `docs/tracker/known-gaps.md`, `docs/feature-impact.md`.

- [ ] **Docs** (each a few lines, per the spec's Part D): data-schema (roster `{id,name,pid?}`, id-keyed records, `v3:<c>:idmig`, `v3:links` legacy, rows carry `rid`, loose spots 1 & 3 rewritten as "done: id; addressing still positional"); data-model (§Enrolment "from today" maps the entry id; §ScheduleRow migration key is `rid`; stage-2 row: the two halves done, the addressing rewrite and `Attempt` left); handover (item 1 done: "a student is `{id,name,pid?}`, a row carries `rid`"); CLAUDE.md (Tracker paragraph: keyed by id, links gone, colon rule = course/syllabus only; slot-key grammar: "every row also carries `rid` — identity for the database, never an address"); HANDOFF (follow-ups: `EditLog.rowId`, course/syllabus ids, the addressing rewrite); known-gaps + feature-impact (the Tracker export row).
- [ ] **Gates**, from `raptor-port/`, in this order: `npm run build` · `node reference/tfin.js` (728/0) · `npm test` · `npm run test:e2e` · `npm run smoke:tracker`. All green before the drive.
- [ ] **Drive the built bundle** (`npm run build && npx vite preview --port 4173`, Playwright with `executablePath:'/opt/pw-browsers/chromium'`, `chromiumSandbox:false`, no proxy): login `ad`/`a` → `window.go('tracker')` → + Add picks a roster person → the chip is linked → grade a ball → reload → the same student is selected and graded → Export carries entries. Watch console/page errors. Screenshot the Students card.
- [ ] Commit docs `docs(stable-ids): …`, push `git push -u origin claude/read-handoff-docs-wuftw9`, open a DRAFT PR (no open PR exists — #378 merged), `unsubscribe_pr_activity` at once, hand the owner the Vercel preview link, `send_later` ~14 min to read CI. HOLD — no merge until "merge live".

---

## Verification (end to end)

- Unit: `npx vitest run src/engine/rowids.test.ts src/engine/schema.test.ts src/tracker src/tracker/app` green; full `npm test` green.
- Parity: `node reference/tfin.js` 728/0; `src/ui/html.test.ts` and `src/engine/parity.test.ts` unchanged and green.
- Browser: `npm run smoke:tracker` green with the legacy-store check; the built-bundle drive above shows the picker, the linked chip, a mark surviving a reload under the same student.
- Persisted-data safety: `rowids.test` "pristine week NOT dirty" and `persist.test.ts` green (no pristine week persisted by the mint); `tracker.test` migration case (old keys gone, new keys present, flag set, second load a no-op).

## Self-review (done)

- Spec coverage: A1-A5 → Tasks 3-5; A3 migration → Task 5 step 3.6; A4 → Task 4 + 5.20-22; B1-B3 → Tasks 1-2; C → Tasks 2, 3, 4, 5, 6, 7; D → Task 8. Not in scope items untouched.
- Type/name consistency: `mintId`/`isEntry`/`upgradeCourseBlock` (ids.js) · `nameOf`/`pidOf`/`byName`/`linkedPerson(id)` (core) · `readCourseBlock(c, withNames)`/`writeCourseBlock(c, block)` · `kIdMig` · `mintRowId`/`ensureRowIds`/`rowsOf` (rowids.ts) — used with the same names throughout.
- Placeholder scan: none. Test helpers named as the existing file names them (`dlgClose`, `answer`, `until`, `P`).
- Boot-order risk closed: the mint runs before `weekBaseline` in `initStore` and `loadWeek` (a pristine week must not read as edited) and inside `histInit`/`histPush`; pinned by the "NOT dirty" case in Task 2.
