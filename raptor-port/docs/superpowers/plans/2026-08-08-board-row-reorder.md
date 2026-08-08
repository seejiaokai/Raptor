# Board Row Reorder Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use subagent-driven-development (recommended) or executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let a scheduler reorder every list on the scheduler board — by dragging a grip at the far left on desktop, or tapping ▲/▼ on a phone — without any amendment mark, pending edit or issued AL losing track of the row it was always about.

**Architecture:** One engine primitive (`permuteKeys`) rewrites the index-addressed amendment key space for an arbitrary reordering; `moveKeys` is a thin wrapper for the single-row case. A new `engine/reorder.ts` holds one mover per list, plus `applyMove(fromAddr, toAddr)`, which parses the `mv:` addresses the markup carries and refuses any move that crosses a container. The UI is two thin callers into that one entry point: a small pointer machine (`ui/rowdrag.ts`, modelled on the qual-heading drag — `drag.ts` stays scoped to pucks) and a `▲/▼` branch in the board's existing delegated `.mbtn` handler.

**Tech Stack:** TypeScript, React 18, Vite, Vitest + jsdom, Playwright.

## Global Constraints

- Spec: `docs/superpowers/specs/2026-08-08-board-row-reorder-design.md`. Read it before starting.
- Run every command from `raptor-port/`, never the repo root.
- `src/engine/` bodies are **verbatim ports** — compressed one-line style, semicolons, `:any` annotations. New engine code matches that style. `src/ui/` and `src/state/` are ordinary TS/React: 2-space indent, no semicolons, single quotes.
- **Every schedule write goes through the mutation funnel.** A mover ends with `markEdit(<key>)` then `afterSchedMutate()`. Never write to `DAYS` from the UI directly.
- **`drag.ts` stays scoped to pucks** (owner, Aug 26). Do not add row drop targets to it.
- `reference/` is **read-only**.
- Four gates must be green before the PR: `npm test`, `npm run build`, `node reference/tfin.js` (must stay **728/0**), `npm run test:e2e`. Plus, because this is UI work: `npm run probes:adapted` (6/6) and `npm run perf` (9/0), each needing `npx vite preview --port 4173` running first.
- `parity.test.ts` must stay **byte-exact**. If it goes red, stop and report — that is a decision point about diverging from the reference, not something to patch around.
- Keep `../HANDOFF.md` true in the same PR.
- While iterating run only the affected test file (`npx vitest run <file>`); the full gates once, before the PR.

---

### Task 1: `permuteKeys` and `moveKeys` — the amendment key remap

The amendment machinery addresses rows by index (`dn:0.2`, `ap:0.3.prog`, `fr:0.1.0.3`, the bare flying key `0.1.0.3.p`). `shiftKeys()` already handles a **delete**. This adds the reorder sibling. It is the part that fails silently, so it is built and tested alone, before anything calls it.

**Files:**
- Modify: `src/engine/keys.ts` (append after `shiftKeys`, before `shiftAircraft` at line 40)
- Test: `src/engine/keys.test.ts` (append)

**Interfaces:**
- Consumes: `SCHED` from `./publish` (already imported by `keys.ts`).
- Produces:
  - `permuteKeys(head:any, pos:any, oldOf:number[]):void` — `oldOf[newIndex] = oldIndex`, the same shape `groundOrder` returns. Rewrites `SCHED.pending`, `SCHED.changes` and every `SCHED.als[].keys`.
  - `moveKeys(head:any, pos:any, from:any, to:any, len:any):void` — moves one index, `to` being the destination index after removal (plain splice-out / splice-in).

- [ ] **Step 1: Write the failing tests**

Append to `src/engine/keys.test.ts`:

```ts
describe('permuteKeys / moveKeys reordering', () => {
  it('moveKeys carries a mark down with its row and slides the ones it passes', () => {
    SCHED.changes = { 'dn:0.0': 'a', 'dn:0.1': 'b', 'dn:0.2': 'c', 'dn:0.3': 'd' }
    moveKeys('dn:0.', 0, 3, 1, 4)          // row 3 lands at index 1
    expect(SCHED.changes).toEqual({ 'dn:0.0': 'a', 'dn:0.1': 'd', 'dn:0.2': 'b', 'dn:0.3': 'c' })
  })

  it('moveKeys works upward as well as downward', () => {
    SCHED.changes = { 'dn:0.0': 'a', 'dn:0.1': 'b', 'dn:0.2': 'c', 'dn:0.3': 'd' }
    moveKeys('dn:0.', 0, 1, 3, 4)          // row 1 lands at index 3
    expect(SCHED.changes).toEqual({ 'dn:0.0': 'a', 'dn:0.1': 'c', 'dn:0.2': 'd', 'dn:0.3': 'b' })
  })

  /* the property that separates this from shiftKeys: a delete DROPS a key,
     a move must never lose one. A vanished mark is an AL that silently
     forgets an amendment. */
  it('drops nothing and collides nothing — it is a bijection', () => {
    const before: any = {}
    for (let i = 0; i < 6; i++) before['dn:0.' + i] = 'v' + i
    SCHED.changes = { ...before }
    moveKeys('dn:0.', 0, 4, 0, 6)
    expect(Object.keys(SCHED.changes).length).toBe(6)
    expect(Object.values(SCHED.changes).sort()).toEqual(Object.values(before).sort())
  })

  it('rewrites pending and every issued AL, not just changes', () => {
    SCHED.pending = { 'dn:0.2': 1 }
    SCHED.changes = { 'dn:0.0': 1 }
    SCHED.als = [{ n: 1, keys: ['dn:0.2', 'dn:0.0'], sign: {} }]
    moveKeys('dn:0.', 0, 2, 0, 3)
    expect(SCHED.pending['dn:0.0']).toBe(1)
    expect(SCHED.changes['dn:0.1']).toBe(1)
    expect(SCHED.als[0].keys).toEqual(['dn:0.0', 'dn:0.1'])
  })

  it('leaves a different key space alone', () => {
    SCHED.changes = { 'dn:0.0': 1, 'dn:1.0': 2, 'ap:0.0.prog': 3 }
    moveKeys('dn:0.', 0, 0, 1, 2)
    expect(SCHED.changes['dn:1.0']).toBe(2)
    expect(SCHED.changes['ap:0.0.prog']).toBe(3)
  })

  it('keeps the tail of a longer key intact', () => {
    SCHED.changes = { 'ap:0.0.prog': 1, 'ap:0.1.sub': 2 }
    moveKeys('ap:0.', 0, 0, 1, 2)
    expect(SCHED.changes).toEqual({ 'ap:0.1.prog': 1, 'ap:0.0.sub': 2 })
  })

  it('a no-op move and an out-of-range index change nothing', () => {
    const c = { 'dn:0.0': 1, 'dn:0.1': 2 }
    SCHED.changes = { ...c }
    moveKeys('dn:0.', 0, 1, 1, 2)
    moveKeys('dn:0.', 0, 9, 0, 2)
    moveKeys('', 0, 0, 1, 2)
    expect(SCHED.changes).toEqual(c)
  })

  it('an index outside the permutation is left alone rather than dropped', () => {
    SCHED.changes = { 'dn:0.0': 1, 'dn:0.7': 2 }
    permuteKeys('dn:0.', 0, [1, 0])
    expect(SCHED.changes).toEqual({ 'dn:0.1': 1, 'dn:0.7': 2 })
  })

  it('permuteKeys applies an arbitrary reordering, not just a single move', () => {
    SCHED.changes = { 'g:0.0': 'a', 'g:0.1': 'b', 'g:0.2': 'c' }
    permuteKeys('g:0.', 0, [2, 0, 1])      // new 0 was old 2, new 1 was old 0, new 2 was old 1
    expect(SCHED.changes).toEqual({ 'g:0.0': 'c', 'g:0.1': 'a', 'g:0.2': 'b' })
  })
})
```

Update the import at the top of the file from `import { keyDay, shiftKeys } from './keys'` to:

```ts
import { keyDay, shiftKeys, permuteKeys, moveKeys } from './keys'
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/engine/keys.test.ts`
Expected: FAIL — `permuteKeys is not a function` / `moveKeys is not a function`.

- [ ] **Step 3: Implement**

In `src/engine/keys.ts`, insert after `shiftKeys` (which ends at line 38) and before the `/* every key space that carries an AIRCRAFT index */` comment:

```ts
/* ---------------------------------------------------------------------------
   REORDERING A LIST RENUMBERS IT TOO — and unlike a delete, nothing may be lost
   shiftKeys() above handles a splice: marks ON the cut row are dropped, marks
   after it move down one. A reorder is the other shape — every row survives and
   simply changes address, so the remap must be a BIJECTION. Drop a key here and
   an issued AL silently forgets an amendment; collide two and one amendment
   permanently re-labels itself as being about a different sortie. Neither shows
   on screen, which is why this is tested on its own before anything calls it.
   `oldOf[newIndex] = oldIndex` — the same shape groundOrder() already returns,
   so freezing a rendered order and moving one row are the same operation.
   An index outside the permutation is left ALONE rather than dropped: a stale
   key from a longer list is inert, a vanished one is a lost record.
   --------------------------------------------------------------------------- */
export function permuteKeys(head:any,pos:any,oldOf:any){
  if(!head||!Array.isArray(oldOf))return;
  const newOf:any={}; oldOf.forEach((o:any,n:any)=>{newOf[o]=n;});
  const move=(k:any)=>{
    if(String(k).indexOf(head)!==0)return k;            // a different key space
    const a=k.slice(head.length).split('.');
    const n=+a[pos];
    if(!isFinite(n)||!(n in newOf))return k;
    a[pos]=String(newOf[n]);
    return head+a.join('.');
  };
  const remap=(o:any)=>{const out:any={}; Object.keys(o||{}).forEach((k:any)=>{out[move(k)]=o[k];}); return out;};
  SCHED.pending=remap(SCHED.pending);
  SCHED.changes=remap(SCHED.changes);
  (SCHED.als||[]).forEach((a:any)=>{a.keys=(a.keys||[]).map(move);});
}
/* one row moving to another position, `to` being its index AFTER removal —
   plain splice-out / splice-in, the same arithmetic the model array does. */
export function moveKeys(head:any,pos:any,from:any,to:any,len:any){
  if(!isFinite(from)||!isFinite(to)||from===to)return;
  if(!isFinite(len)||from<0||to<0||from>=len||to>=len)return;
  const oldOf=[]; for(let i=0;i<len;i++)oldOf.push(i);
  oldOf.splice(to,0,oldOf.splice(from,1)[0]);
  permuteKeys(head,pos,oldOf);
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run src/engine/keys.test.ts`
Expected: PASS, all tests in the file (the existing `shiftKeys` and `keyDay` ones included).

- [ ] **Step 5: Commit**

```bash
git add src/engine/keys.ts src/engine/keys.test.ts
git commit -m "Keys: permuteKeys/moveKeys — the bijective sibling of shiftKeys"
```

---

### Task 2: Move `groundOrder` into the engine and give it a manual mode

`moveGroundRow` (Task 3) must freeze the currently rendered order into the model, so it needs `groundOrder`. That function lives in `src/ui/html.ts` today, and the engine must stay DOM-free and must never import from `ui/`. It is pure (`parseHM` only), so it moves.

**Files:**
- Create: `src/engine/order.ts`
- Modify: `src/ui/html.ts` (delete `groundOrder` at lines 444-450; import it from `../engine` instead)
- Modify: `src/ui/board-html.ts:11` (import `groundOrder` from `../engine`, not `./html`)
- Modify: `src/engine/index.ts` (add the barrel line)
- Test: `src/engine/order.test.ts`

**Interfaces:**
- Produces: `groundOrder(grd:any[], man?:any):{row:any,ri:number}[]` — with `man` truthy it returns model order, `[{row,ri:0},{row,ri:1},…]`, unsorted.

- [ ] **Step 1: Check nothing else imports it**

Run: `grep -rn "groundOrder" src/ e2e/ probes/`
Expected: exactly three hits — the definition in `html.ts`, the use at `html.ts:683`, and the import at `board-html.ts:11`. If there are more, update every one of them in Step 3.

- [ ] **Step 2: Write the failing test**

Create `src/engine/order.test.ts`:

```ts
/* groundOrder moved out of ui/html.ts so engine/reorder.ts can freeze a
   rendered order without the engine importing from ui/. The `man` argument is
   new: a day whose ground list has been reordered by hand stops time-sorting. */
import { describe, expect, it } from 'vitest'
import { groundOrder } from './order'

const ROWS = [{ prog: 'C', str: '1000' }, { prog: 'A', str: '0800' }, { prog: 'B', str: '0900' }]

describe('groundOrder', () => {
  it('sorts by start time and reports each row\'s model index', () => {
    expect(groundOrder(ROWS).map(x => x.row.prog)).toEqual(['A', 'B', 'C'])
    expect(groundOrder(ROWS).map(x => x.ri)).toEqual([1, 2, 0])
  })

  it('puts rows with no start time last, in model order', () => {
    const r = [{ prog: 'X' }, { prog: 'A', str: '0800' }, { prog: 'Y' }]
    expect(groundOrder(r).map(x => x.row.prog)).toEqual(['A', 'X', 'Y'])
  })

  it('ties break on model index, so equal times keep their typed order', () => {
    const r = [{ prog: 'P', str: '0800' }, { prog: 'Q', str: '0800' }]
    expect(groundOrder(r).map(x => x.row.prog)).toEqual(['P', 'Q'])
  })

  it('man returns model order untouched', () => {
    expect(groundOrder(ROWS, true).map(x => x.row.prog)).toEqual(['C', 'A', 'B'])
    expect(groundOrder(ROWS, true).map(x => x.ri)).toEqual([0, 1, 2])
  })

  it('survives an empty or missing list', () => {
    expect(groundOrder([])).toEqual([])
    expect(groundOrder(undefined as any)).toEqual([])
  })
})
```

- [ ] **Step 3: Run it to verify it fails**

Run: `npx vitest run src/engine/order.test.ts`
Expected: FAIL — cannot resolve `./order`.

- [ ] **Step 4: Create the engine module**

Create `src/engine/order.ts`:

```ts
import { parseHM } from './time'
/* Render-time ordering for the day's Ground Programme. It lived in ui/html.ts
   until the board learned to reorder rows (8 Aug 26): engine/reorder.ts has to
   freeze the order a scheduler can SEE before it moves anything within it, and
   the engine must not import from ui/. Pure — parseHM and nothing else.
   `man`: this day's list has been reordered by hand, so the time sort stands
   down and the model order IS the order (owner, 8 Aug 26). */
export function groundOrder(grd:any[],man?:any){
  const rows=grd||[];
  const ix=rows.map((row:any,ri:number)=>({row,ri}));
  if(man)return ix;
  return ix.sort((a:any,b:any)=>{
    const ta=parseHM(a.row.str), tb=parseHM(b.row.str)
    if(ta==null||tb==null)return ta==null&&tb==null?a.ri-b.ri:(ta==null?1:-1)
    return (ta-tb)||(a.ri-b.ri)
  })
}
```

Add to `src/engine/index.ts`, after the `./keys` line:

```ts
export * from './order'
```

- [ ] **Step 5: Delete the old copy and repoint its callers**

In `src/ui/html.ts`, delete the `groundOrder` function (lines 444-450) and add `groundOrder` to the existing import from `../engine`. Check the top of the file for how `../engine` is already imported and extend that import rather than adding a second one.

In `src/ui/board-html.ts:11`, remove `groundOrder` from `import { puck, rowCls, accCtl, groundOrder } from './html'` and add it to the `../engine` imports at the top of that file.

- [ ] **Step 6: Run the tests**

Run: `npx vitest run src/engine/order.test.ts && npx vitest run src/engine/parity.test.ts && npm run build`
Expected: all PASS. Parity must stay byte-exact — this task changes no rendered output, only where the function lives.

- [ ] **Step 7: Commit**

```bash
git add src/engine/order.ts src/engine/order.test.ts src/engine/index.ts src/ui/html.ts src/ui/board-html.ts
git commit -m "Ground order moves into the engine and learns a manual mode"
```

---

### Task 3: The movers — `engine/reorder.ts`

One function per list, each reusing the exact key-space heads the matching `shift*` helper already proved correct.

**Files:**
- Create: `src/engine/reorder.ts`
- Modify: `src/engine/index.ts`
- Modify: `src/probe-bridge.ts`
- Test: `src/engine/reorder.test.ts`

**Interfaces:**
- Consumes: `permuteKeys`, `moveKeys` (Task 1); `groundOrder` (Task 2); `DAYS` from `./data`; `markEdit` from `./publish`; `HOOKS` from `./hooks`.
- Produces, every one returning `true` if it moved anything and `false` otherwise:
  - `moveFormation(di:any,gi:any,from:any,to:any):boolean`
  - `moveAircraft(di:any,gi:any,li:any,from:any,to:any):boolean`
  - `moveDutyRow(di:any,wi:any,from:any,to:any):boolean`
  - `moveSimRow(di:any,kind:any,from:any,to:any):boolean`
  - `moveGroundRow(di:any,from:any,to:any):boolean`
  - `moveProgRow(di:any,from:any,to:any):boolean`
  - `moveNote(di:any,from:any,to:any):boolean`
  - `applyMove(fromAddr:any,toAddr:any):boolean` — parses two `mv:` addresses and dispatches.

**The `mv:` address grammar** (emitted by Task 5's markup, parsed only here):

| list | address |
|---|---|
| flying row | `mv:ac.<di>.<gi>.<li>.<ai>` |
| duty row | `mv:d.<di>.<wi>.<ri>` |
| sim row | `mv:s.<di>.<kind>.<ri>` |
| ground row | `mv:g.<di>.<ri>` |
| programme row | `mv:p.<di>.<ri>` |
| note row | `mv:n.<di>.<ni>` |

- [ ] **Step 1: Write the failing tests**

Create `src/engine/reorder.test.ts`:

```ts
/* The reorder movers. The model half is the easy half; the half that fails
   SILENTLY is the amendment bookkeeping, so every mover is asserted against a
   pending mark, a changes entry and an ISSUED AL at once. Snapshot/restore of
   DAYS follows engine/insights.test.ts so mutations cannot leak between files. */
import { beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from './data'
import { SCHED } from './publish'
import {
  moveFormation, moveAircraft, moveDutyRow, moveSimRow,
  moveGroundRow, moveProgRow, moveNote, applyMove,
} from './reorder'
import { groundOrder } from './order'

const DSNAP = JSON.stringify(DAYS)
beforeEach(() => {
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  SCHED.pending = {}; SCHED.changes = {}; SCHED.als = []
})

describe('moveFormation', () => {
  it('reorders the wave and takes every jet with it, in order', () => {
    const w = DAYS[0].waves[0]
    if (w.formations.length < 2) throw new Error('seed day 0 wave 0 needs two formations')
    const was = w.formations.map((f: any) => f.cs)
    const jets = w.formations[1].aircraft.map((a: any) => a.p)
    expect(moveFormation(0, 0, 1, 0)).toBe(true)
    expect(w.formations.map((f: any) => f.cs)).toEqual([was[1], was[0], ...was.slice(2)])
    expect(w.formations[0].aircraft.map((a: any) => a.p)).toEqual(jets)
  })

  it('carries a pending mark, a changes entry and an issued AL key with the row', () => {
    SCHED.pending = { 'ff:0.0.1.cs': 1 }
    SCHED.changes = { 'fr:0.0.1.0': 1, '0.0.1.0.p': 1 }
    SCHED.als = [{ n: 1, keys: ['st:0.0.1.0', 'at:0.0.1'], sign: {} }]
    moveFormation(0, 0, 1, 0)
    expect(SCHED.pending['ff:0.0.0.cs']).toBe(1)
    expect(SCHED.changes['fr:0.0.0.0']).toBe(1)
    expect(SCHED.changes['0.0.0.0.p']).toBe(1)
    expect(SCHED.als[0].keys).toEqual(['st:0.0.0.0', 'at:0.0.0'])
  })

  it('marks the moved row at its NEW address so the day goes out amended', () => {
    moveFormation(0, 0, 1, 0)
    expect(SCHED.pending['ff:0.0.0.cs']).toBe(1)
  })

  it('refuses an out-of-range index and a no-op, changing nothing', () => {
    const was = JSON.stringify(DAYS[0].waves[0].formations)
    expect(moveFormation(0, 0, 0, 0)).toBe(false)
    expect(moveFormation(0, 0, 9, 0)).toBe(false)
    expect(moveFormation(0, 0, 0, 9)).toBe(false)
    expect(moveFormation(9, 0, 0, 1)).toBe(false)
    expect(JSON.stringify(DAYS[0].waves[0].formations)).toBe(was)
  })
})

describe('moveAircraft', () => {
  it('resequences the jets inside one formation and keeps their seats', () => {
    const f = DAYS[0].waves[0].formations.find((x: any) => x.aircraft.length > 1)
    if (!f) throw new Error('seed day 0 wave 0 needs a multi-jet formation')
    const li = DAYS[0].waves[0].formations.indexOf(f)
    const was = f.aircraft.map((a: any) => a.p + '/' + a.w)
    expect(moveAircraft(0, 0, li, 1, 0)).toBe(true)
    expect(f.aircraft.map((a: any) => a.p + '/' + a.w)).toEqual([was[1], was[0], ...was.slice(2)])
  })

  it('moves the seat keys with the jet', () => {
    const f = DAYS[0].waves[0].formations.find((x: any) => x.aircraft.length > 1)!
    const li = DAYS[0].waves[0].formations.indexOf(f)
    SCHED.changes = { [`0.0.${li}.1.p`]: 1, [`fr:0.0.${li}.1`]: 2 }
    moveAircraft(0, 0, li, 1, 0)
    expect(SCHED.changes[`0.0.${li}.0.p`]).toBe(1)
    expect(SCHED.changes[`fr:0.0.${li}.0`]).toBe(2)
  })
})

describe('moveDutyRow / moveSimRow / moveProgRow / moveNote', () => {
  it('a duty row moves inside its block and takes its keys', () => {
    const rows = DAYS[0].dutywaves[0].rows
    const was = rows.map((r: any) => r.role)
    SCHED.changes = { 'd:0.0.2': 1, 'dr:0.0.2.role': 2 }
    expect(moveDutyRow(0, 0, 2, 0)).toBe(true)
    expect(rows.map((r: any) => r.role)).toEqual([was[2], was[0], was[1]])
    expect(SCHED.changes['d:0.0.0']).toBe(1)
    expect(SCHED.changes['dr:0.0.0.role']).toBe(2)
  })

  it('a sim row moves inside its own kind and leaves the other kind alone', () => {
    const di = DAYS.findIndex((d: any) => ((d.sims || {}).amt || []).length > 1)
    if (di < 0) throw new Error('seed week needs a day with two AMT rows')
    const amt = DAYS[di].sims.amt
    const oft = JSON.stringify(DAYS[di].sims.oft || [])
    const was = amt.map((r: any) => r.label)
    SCHED.changes = { [`s:${di}.amt.1`]: 1, [`sr:${di}.oft.0.label`]: 9 }
    expect(moveSimRow(di, 'amt', 1, 0)).toBe(true)
    expect(amt.map((r: any) => r.label)).toEqual([was[1], was[0], ...was.slice(2)])
    expect(SCHED.changes[`s:${di}.amt.0`]).toBe(1)
    expect(SCHED.changes[`sr:${di}.oft.0.label`]).toBe(9)
    expect(JSON.stringify(DAYS[di].sims.oft || [])).toBe(oft)
  })

  it('a programme item moves and carries both its key spaces', () => {
    const di = DAYS.findIndex((d: any) => (d.allhands || []).length > 1)
    if (di < 0) throw new Error('seed week needs a day with two programme items')
    const was = DAYS[di].allhands.map((x: any) => x.prog)
    SCHED.changes = { [`ap:${di}.1.prog`]: 1, [`a:${di}.1.0`]: 2 }
    expect(moveProgRow(di, 1, 0)).toBe(true)
    expect(DAYS[di].allhands.map((x: any) => x.prog)).toEqual([was[1], was[0], ...was.slice(2)])
    expect(SCHED.changes[`ap:${di}.0.prog`]).toBe(1)
    expect(SCHED.changes[`a:${di}.0.0`]).toBe(2)
  })

  it('a note line moves and carries its key', () => {
    DAYS[0].notes = ['one', 'two', 'three']
    SCHED.changes = { 'dn:0.2': 1 }
    expect(moveNote(0, 2, 0)).toBe(true)
    expect(DAYS[0].notes).toEqual(['three', 'one', 'two'])
    expect(SCHED.changes['dn:0.0']).toBe(1)
  })
})

describe('moveGroundRow freezes the visible order first', () => {
  it('the first move pins the order you can SEE, then moves within it', () => {
    DAYS[0].ground = [
      { prog: 'C', str: '1000' }, { prog: 'A', str: '0800' }, { prog: 'B', str: '0900' },
    ]
    /* rendered A,B,C. Dragging C (model 0) onto A (model 1) must leave C above
       A — a naive model-index move would produce A,C,B and read as no change
       at all on the row the scheduler grabbed. */
    expect(moveGroundRow(0, 0, 1)).toBe(true)
    expect(DAYS[0].gman).toBe(true)
    expect(groundOrder(DAYS[0].ground, DAYS[0].gman).map(x => x.row.prog)).toEqual(['C', 'A', 'B'])
  })

  it('the freeze permutation moves the keys too', () => {
    DAYS[0].ground = [
      { prog: 'C', str: '1000' }, { prog: 'A', str: '0800' }, { prog: 'B', str: '0900' },
    ]
    SCHED.changes = { 'g:0.0': 'C', 'g:0.1': 'A', 'g:0.2': 'B' }
    moveGroundRow(0, 0, 1)
    expect(SCHED.changes['g:0.0']).toBe('C')
    expect(SCHED.changes['g:0.1']).toBe('A')
    expect(SCHED.changes['g:0.2']).toBe('B')
  })

  it('once manual, a later move is a plain model move', () => {
    DAYS[0].ground = [{ prog: 'A', str: '0800' }, { prog: 'B', str: '0900' }]
    DAYS[0].gman = true
    expect(moveGroundRow(0, 0, 1)).toBe(true)
    expect(DAYS[0].ground.map((r: any) => r.prog)).toEqual(['B', 'A'])
  })

  it('a no-op move does NOT switch the sort off', () => {
    DAYS[0].ground = [{ prog: 'A', str: '0800' }, { prog: 'B', str: '0900' }]
    expect(moveGroundRow(0, 1, 1)).toBe(false)
    expect(DAYS[0].gman).toBeFalsy()
  })
})

describe('applyMove parses addresses and enforces the containers', () => {
  it('two jets in one formation resequence', () => {
    const f = DAYS[0].waves[0].formations.find((x: any) => x.aircraft.length > 1)!
    const li = DAYS[0].waves[0].formations.indexOf(f)
    const was = f.aircraft.map((a: any) => a.p)
    expect(applyMove(`mv:ac.0.0.${li}.1`, `mv:ac.0.0.${li}.0`)).toBe(true)
    expect(f.aircraft.map((a: any) => a.p)).toEqual([was[1], was[0], ...was.slice(2)])
  })

  it('a jet dropped on another formation moves the whole formation instead', () => {
    const w = DAYS[0].waves[0]
    const was = w.formations.map((f: any) => f.cs)
    const jets = w.formations[1].aircraft.length
    expect(applyMove('mv:ac.0.0.1.0', 'mv:ac.0.0.0.0')).toBe(true)
    expect(w.formations.map((f: any) => f.cs)).toEqual([was[1], was[0], ...was.slice(2)])
    expect(w.formations[0].aircraft.length).toBe(jets)
  })

  it('a drop into another Go is refused', () => {
    const was = JSON.stringify(DAYS[0].waves)
    expect(applyMove('mv:ac.0.0.0.0', 'mv:ac.0.1.0.0')).toBe(false)
    expect(JSON.stringify(DAYS[0].waves)).toBe(was)
  })

  it('a drop into another day, another duty block or another sim kind is refused', () => {
    expect(applyMove('mv:d.0.0.0', 'mv:d.0.1.0')).toBe(false)
    expect(applyMove('mv:s.0.amt.0', 'mv:s.0.oft.0')).toBe(false)
    expect(applyMove('mv:g.0.0', 'mv:g.1.0')).toBe(false)
  })

  it('mismatched kinds and junk are refused', () => {
    expect(applyMove('mv:g.0.0', 'mv:p.0.1')).toBe(false)
    expect(applyMove('nonsense', 'mv:g.0.1')).toBe(false)
    expect(applyMove('mv:g.0.0', '')).toBe(false)
    expect(applyMove(null as any, null as any)).toBe(false)
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run src/engine/reorder.test.ts`
Expected: FAIL — cannot resolve `./reorder`.

- [ ] **Step 3: Implement**

Create `src/engine/reorder.ts`:

```ts
import { DAYS } from './data'
import { markEdit } from './publish'
import { permuteKeys, moveKeys } from './keys'
import { groundOrder } from './order'
/* ---------------------------------------------------------------------------
   REORDERING A BOARD LIST (owner, 8 Aug 26)
   Every list on the board is drawn in model order and a new row lands at the
   bottom, so the only way to resequence used to be delete-and-retype.
   Each mover here is the same three beats: splice the model, remap the
   amendment key space with the SAME heads the matching shift* helper in
   keys.ts uses, then mark the moved row at its NEW address.
   Why a key at all, when a DELETE marks nothing: a delete must not re-mark the
   address it just removed, but a move's row still exists and its position IS
   the change — marking it is what puts the day into the next AL, which is what
   "a move counts as an amendment" (owner) has to mean mechanically. Same idiom
   every add already uses.
   `to` is the destination index AFTER removal — plain splice-out/splice-in.
   --------------------------------------------------------------------------- */
const ok=(a:any,from:any,to:any)=>Array.isArray(a)&&isFinite(from)&&isFinite(to)&&from!==to
  &&from>=0&&to>=0&&from<a.length&&to<a.length;
const slide=(a:any,from:any,to:any)=>{a.splice(to,0,a.splice(from,1)[0]);};
const done=(key:any)=>{markEdit(key); return true;};

export function moveFormation(di:any,gi:any,from:any,to:any){
  const w=(DAYS[di]||{}).waves&&DAYS[di].waves[gi]; if(!w||!ok(w.formations,from,to))return false;
  slide(w.formations,from,to);
  [`ff:${di}.${gi}.`,`fr:${di}.${gi}.`,`st:${di}.${gi}.`,`ar:${di}.${gi}.`,`at:${di}.${gi}.`,`${di}.${gi}.`]
    .forEach((h:any)=>moveKeys(h,0,from,to,w.formations.length));
  return done(`ff:${di}.${gi}.${to}.cs`);
}
export function moveAircraft(di:any,gi:any,li:any,from:any,to:any){
  const w=(DAYS[di]||{}).waves&&DAYS[di].waves[gi]; const f=w&&w.formations&&w.formations[li];
  if(!f||!ok(f.aircraft,from,to))return false;
  slide(f.aircraft,from,to);
  [`fr:${di}.${gi}.${li}.`,`st:${di}.${gi}.${li}.`,`${di}.${gi}.${li}.`]
    .forEach((h:any)=>moveKeys(h,0,from,to,f.aircraft.length));
  return done(`fr:${di}.${gi}.${li}.${to}`);
}
export function moveDutyRow(di:any,wi:any,from:any,to:any){
  const dw=(DAYS[di]||{}).dutywaves&&DAYS[di].dutywaves[wi]; if(!dw||!ok(dw.rows,from,to))return false;
  slide(dw.rows,from,to);
  [`d:${di}.${wi}.`,`dr:${di}.${wi}.`].forEach((h:any)=>moveKeys(h,0,from,to,dw.rows.length));
  return done(`dr:${di}.${wi}.${to}.role`);
}
export function moveSimRow(di:any,kind:any,from:any,to:any){
  const rows=((DAYS[di]||{}).sims||{})[kind]; if(!ok(rows,from,to))return false;
  slide(rows,from,to);
  [`s:${di}.${kind}.`,`sr:${di}.${kind}.`].forEach((h:any)=>moveKeys(h,0,from,to,rows.length));
  return done(`sr:${di}.${kind}.${to}.label`);
}
export function moveProgRow(di:any,from:any,to:any){
  const rows=(DAYS[di]||{}).allhands; if(!ok(rows,from,to))return false;
  slide(rows,from,to);
  [`ap:${di}.`,`a:${di}.`].forEach((h:any)=>moveKeys(h,0,from,to,rows.length));
  return done(`ap:${di}.${to}.prog`);
}
export function moveNote(di:any,from:any,to:any){
  const rows=(DAYS[di]||{}).notes; if(!ok(rows,from,to))return false;
  slide(rows,from,to);
  moveKeys(`dn:${di}.`,0,from,to,rows.length);
  return done(`dn:${di}.${to}`);
}
/* Ground is the one list rendered in a SORTED order (by start time, on the week
   and the board alike), so a move expressed in model indices would be undone by
   the very next redraw — and the first move in particular would read as doing
   nothing at all: drag the 1000 line above the 0800 line and a naive model move
   puts it at model index 1, where the sort still prints it last.
   So the first manual move FREEZES the order on screen into the model — a whole
   permutation, keys and all — sets gman, translates the caller's model indices
   into that frozen order, and only then does the ordinary move. The way back is
   Undo: histSnap() serialises DAYS, so gman rolls back with the order and no
   second control is needed (owner, 8 Aug 26). */
export function moveGroundRow(di:any,from:any,to:any){
  const d=DAYS[di]; const rows=d&&d.ground; if(!ok(rows,from,to))return false;
  let f=from,t=to;
  if(!d.gman){
    const oldOf=groundOrder(rows).map((x:any)=>x.ri);
    const newOf:any={}; oldOf.forEach((o:any,n:any)=>{newOf[o]=n;});
    const frozen=oldOf.map((o:any)=>rows[o]);
    rows.length=0; frozen.forEach((r:any)=>rows.push(r));
    [`g:${di}.`,`gr:${di}.`].forEach((h:any)=>permuteKeys(h,0,oldOf));
    d.gman=true; f=newOf[from]; t=newOf[to];
  }
  if(!ok(rows,f,t))return false;
  slide(rows,f,t);
  [`g:${di}.`,`gr:${di}.`].forEach((h:any)=>moveKeys(h,0,f,t,rows.length));
  return done(`gr:${di}.${t}.prog`);
}
/* ---- the one entry point the UI calls -------------------------------------
   Addresses are `mv:<kind>.<container…>.<index>`. For every kind but `ac`, two
   rows may exchange places IFF their addresses match on everything but the last
   component — one test that enforces every containment rule at once (a duty row
   cannot change block, an AMT row cannot become an OFT row) with no per-kind
   special casing.
   `ac` is the one address with two meanings, because a flying row is one JET but
   the owner asked for both a formation that travels as a block and jets that
   resequence inside it, and there is only one grip. The DROP decides: land on a
   sibling jet and the jets resequence; land on another formation in the same Go
   and the whole formation travels; land in another Go and it is refused. That is
   the only reading consistent with "a jet may never leave its formation" — a
   drag ending outside the formation cannot mean "move this jet there". */
export function applyMove(fromAddr:any,toAddr:any){
  const A=String(fromAddr||''), B=String(toAddr||'');
  if(A.indexOf('mv:')!==0||B.indexOf('mv:')!==0||A===B)return false;
  const a=A.slice(3).split('.'), b=B.slice(3).split('.');
  if(a[0]!==b[0]||a.length!==b.length||a.length<3)return false;
  const kind=a[0], n=(s:any)=>{const v=parseInt(s,10); return Number.isFinite(v)?v:-1;};
  /* the container is everything but the last component */
  const sameBut=(k:number)=>a.slice(1,k).join('.')===b.slice(1,k).join('.');
  if(kind==='ac'){
    if(a.length!==5)return false;
    const di=n(a[1]), gi=n(a[2]);
    if(!sameBut(3))return false;                       // different day or Go
    if(a[3]===b[3])return moveAircraft(di,gi,n(a[3]),n(a[4]),n(b[4]));
    return moveFormation(di,gi,n(a[3]),n(b[3]));
  }
  if(!sameBut(a.length-1))return false;
  if(kind==='d')return moveDutyRow(n(a[1]),n(a[2]),n(a[3]),n(b[3]));
  if(kind==='s')return moveSimRow(n(a[1]),a[2],n(a[3]),n(b[3]));
  if(kind==='g')return moveGroundRow(n(a[1]),n(a[2]),n(b[2]));
  if(kind==='p')return moveProgRow(n(a[1]),n(a[2]),n(b[2]));
  if(kind==='n')return moveNote(n(a[1]),n(a[2]),n(b[2]));
  return false;
}
```

Add to `src/engine/index.ts`, after the `./order` line:

```ts
export * from './reorder'
```

In `src/probe-bridge.ts`, extend the `./engine/keys` import at line 21 and the assignment at line 78:

```ts
import { keyDay, shiftKeys, shiftAircraft, shiftFormation, shiftWave, uniqDays, permuteKeys, moveKeys } from './engine/keys'
import { applyMove } from './engine/reorder'
```

```ts
  w.keyDay = keyDay; w.shiftKeys = shiftKeys; w.shiftAircraft = shiftAircraft
  w.permuteKeys = permuteKeys; w.moveKeys = moveKeys; w.applyMove = applyMove
```

- [ ] **Step 4: Run the tests**

Run: `npx vitest run src/engine/reorder.test.ts`
Expected: PASS. If a test throws one of the `seed week needs …` errors, the seed data has changed since this plan was written — find a day that does satisfy the shape and use its index, do not weaken the assertion.

- [ ] **Step 5: Run the neighbours that could have been disturbed**

Run: `npx vitest run src/engine/keys.test.ts src/engine/parity.test.ts src/engine/publish.test.ts && npm run build`
Expected: all PASS, parity byte-exact.

- [ ] **Step 6: Commit**

```bash
git add src/engine/reorder.ts src/engine/reorder.test.ts src/engine/index.ts src/probe-bridge.ts
git commit -m "Engine: one mover per board list, behind a single applyMove"
```

---

### Task 4: Duties print in the scheduler's order

The week reprinted duties in a fixed role order (`dutySort`) while the board showed model order, so a reorder would have stuck on the board and never reached the issued programme. **(owner: the scheduler's order wins everywhere.)**

The seed's duty rows are re-laid into the order they already print, so deleting the sort produces byte-identical markup and `parity.test.ts` stays byte-exact against the reference (which still sorts) with **no `refwin.ts` patch**.

**Files:**
- Modify: `src/engine/data.ts` (lines 28-29, 52-53, 77, 100-101, 109 — the seven `dutywaves` blocks)
- Modify: `src/ui/html.ts:639-640` (drop `dutySort`, take `ri` from the loop)
- Test: `src/engine/parity.test.ts` is the test — it must stay byte-exact.

**Interfaces:**
- Produces: nothing new. `dutySort` and `DUTY_ORDER` stay exported from `html.ts` — `DUTY_ORDER` may still be wanted for a future sort control, and deleting exports is not this task's job.

- [ ] **Step 1: Re-lay the seed duty rows**

`DUTY_ORDER` is `SDO:0, SXO:1, OPS-O:2`, so each block is rewritten SDO → SXO → OPS-O, contents unchanged. Make exactly these edits in `src/engine/data.ts`:

Line 28-29 (Monday):
```ts
  dutywaves:[{label:'1st wave',rows:[{role:'SDO',id:'mamba',str:'0700',end:'1300'},{role:'SXO',id:'razer',str:'0600',end:'1300'},{role:'OPS-O',id:'glass',str:'0600',end:'1400'}]},
             {label:'2nd wave',rows:[{role:'SDO',id:'chaps',str:'1300',end:'2130'},{role:'SXO',id:'yeti',str:'1300',end:'2130'},{role:'OPS-O',id:'stuff',str:'1400',end:'2130'}]}],
```

Line 52-53 (Tuesday):
```ts
  dutywaves:[{label:'1st wave',rows:[{role:'SDO',id:'boosh',str:'0530',end:'1200'},{role:'SXO',id:'snap',str:'0500',end:'1200'},{role:'OPS-O',id:'wolf',str:'0500',end:'1200'}]},
             {label:'2nd wave',rows:[{role:'SDO',id:'beams',str:'1200',end:'1700'},{role:'SXO',id:'razer',str:'1200',end:'1700'},{role:'OPS-O',id:'stuff',str:'1200',end:'1700'}]}],
```

Line 77 (Wednesday):
```ts
  dutywaves:[{label:'1st wave',rows:[{role:'SDO',id:'mamba',str:'0800',end:'1400'},{role:'SXO',id:'shaft',str:'0800',end:'1400'},{role:'OPS-O',id:'divot',str:'0800',end:'1400'}]}],
```

Line 100-101 (Thursday):
```ts
  dutywaves:[{label:'1st wave',rows:[{role:'SDO',id:'razer',str:'0800',end:'1400'},{role:'SXO',id:'shaft',str:'0800',end:'1400'},{role:'OPS-O',id:'divot',str:'0800',end:'1400'}]},
             {label:'2nd wave',rows:[{role:'SDO',id:'beams',str:'1400',end:'1900'},{role:'SXO',id:'chaps',str:'1400',end:'1900'},{role:'OPS-O',id:'spaceman',str:'1400',end:'1900'}]}],
```

Line 109 (Friday):
```ts
  dutywaves:[{label:'Duty',rows:[{role:'SDO',id:'yeti',str:'0730',end:'1730'},{role:'SXO',id:'razer',str:'0730',end:'1730'}]}],
```

Lines 122 and 129 (Saturday, Sunday) are a single `SDO` row each — leave them alone.

- [ ] **Step 2: Drop the sort from the week's render**

In `src/ui/html.ts`, replace lines 639-640:

```ts
        dutySort(dwv.rows).forEach((r:any)=>{
          const ri=dwv.rows.indexOf(r), key=`d:${di}.${wi}.${ri}`;
```

with:

```ts
        /* MODEL order, not dutySort (owner, 8 Aug 26): the board can reorder
           duty rows now, and a fixed role order here would have swallowed the
           change — a scheduler would move a row and the issued week would keep
           printing the old sequence. The board already rendered model order, so
           the two surfaces agree for the first time. The seed's rows were
           re-laid into the order the sort used to produce, so this prints
           identically until somebody actually drags one — which is also what
           keeps parity.test.ts byte-exact against the still-sorting reference,
           with no refwin patch. */
        (dwv.rows||[]).forEach((r:any,ri:any)=>{
          const key=`d:${di}.${wi}.${ri}`;
```

- [ ] **Step 3: Run parity — this is the gate for this task**

Run: `npx vitest run src/engine/parity.test.ts`
Expected: PASS, byte-exact.

**If it fails: stop and report.** Do not patch `refwin.ts` and do not weaken the assertion. A red parity here means the re-lay does not reproduce what the sort produced, and diverging from the reference is an owner decision, not an implementation one. Diff the two markup strings and report which duty row differs.

- [ ] **Step 4: Run the wider suite and the reference gate**

Run: `npm test && node reference/tfin.js`
Expected: vitest green; the reference stays **728/0**.

Some tests hard-code a duty row index (`d:0.0.0` and friends) and will now name a different row. Update those tests to the new index — the assertion is about the mechanism, not about which person happens to sit at index 0. Do not weaken any assertion to make it pass.

- [ ] **Step 5: Commit**

```bash
git add src/engine/data.ts src/ui/html.ts src/engine/*.test.ts
git commit -m "Duties print in the scheduler's order, not a fixed role order"
```

---

### Task 5: The grip and the ▲/▼ buttons in the board's markup

Both are always in the markup; **CSS decides which is visible at which width** (Task 8). Rendering conditionally on viewport would make the panel string-diff depend on window size and would not survive a resize.

**Files:**
- Modify: `src/ui/board.ts` (the flying line in `boardHTML`, lines 68 and 83-111)
- Modify: `src/ui/board-html.ts` (`sbNotesPanel`, `sbProgPanel`, `sbDutyPanel`, `sbSimRowsPanel`, `sbGroundPanel`, and the `C6` header constant)
- Test: `src/ui/board.test.tsx` (append)

**Interfaces:**
- Consumes: `applyMove` is not called here; this task only emits addresses.
- Produces: markup contract — every movable row carries, as its **first** child, `<span class="sb-grip" data-move="<mv:…>" title="Drag to move this row">⠿</span>`, and inside its existing `.lctl` a pair of `<button class="mbtn nudge" data-mvup="<mv:…>">▲</button><button class="mbtn nudge" data-mvdn="<mv:…>">▼</button>`. Column-header rows (`.sb-lcols`, `.sb-acols`) gain a leading empty `<span></span>` so their columns still line up.

- [ ] **Step 1: Write the failing test**

Append to `src/ui/board.test.tsx` (match the existing imports and render helper in that file — read its top 30 lines first):

```tsx
describe('reorder grips and nudge buttons (owner, 8 Aug 26)', () => {
  it('every flying row carries its full aircraft address', () => {
    const h = boardHTML(0)
    expect(h).toContain('data-move="mv:ac.0.0.0.0"')
    expect(h).toContain('data-mvup="mv:ac.0.0.0.0"')
    expect(h).toContain('data-mvdn="mv:ac.0.0.0.0"')
  })

  it('the duty, sim, ground, programme and note rows all carry one', () => {
    const h = boardHTML(0)
    expect(h).toContain('data-move="mv:d.0.0.0"')
    expect(h).toContain('data-move="mv:g.0.0"')
    expect(h).toContain('data-move="mv:p.0.0"')
    expect(h).toContain('data-move="mv:n.0.0"')
    expect(boardHTML(1)).toMatch(/data-move="mv:s\.1\.(amt|oft)\.0"/)
  })

  /* a ground row's address must be its MODEL index, not its position in the
     time-sorted render — engine/reorder.ts translates model indices itself */
  it('a ground address is the model index, not the rendered position', () => {
    const h = boardHTML(0)
    const order = [...h.matchAll(/data-move="mv:g\.0\.(\d+)"/g)].map(m => +m[1])
    expect(order.length).toBe(DAYS[0].ground.length)
    expect([...order].sort((a, b) => a - b)).toEqual(order.map((_, i) => i))
  })

  it('the column headers gain a matching empty cell so the grid still lines up', () => {
    const h = boardHTML(0)
    expect(h).toContain('<div class="sb-lcols"><span></span><span>CS</span>')
    expect(h).toContain('<div class="sb-acols c6r"><span></span><span>Item</span>')
  })

  /* the board is a modal that survives a page change, so a bare CURPAGE test
     would hand live controls to a duty crew who still has a board open — the
     same reason the stores chips use editMode() (board.ts's stoRO) */
  it('a published-version preview renders no grip and no nudge buttons', () => {
    const h = boardHTML(0, true)
    expect(h).not.toContain('data-move=')
    expect(h).not.toContain('data-mvup=')
  })

  it('read-only mode renders no grip and no nudge buttons', () => {
    HOOKS.editMode = () => false
    try { expect(boardHTML(0)).not.toContain('data-move=') }
    finally { HOOKS.editMode = () => true }
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run src/ui/board.test.tsx`
Expected: FAIL — none of the `data-move` attributes are present.

- [ ] **Step 3: Add the shared builders**

At the top of `src/ui/board-html.ts`, after the imports, add:

```ts
/* ---- reorder grip + nudge buttons (owner, 8 Aug 26) -----------------------
   A grip at the far left on desktop, ▲/▼ in the row's own control cluster on a
   phone, where a tall multi-strip flying block and a scrolling finger make a
   drag the wrong gesture. BOTH are always emitted and CSS picks: rendering by
   viewport would make the panel string-diff depend on window size and would not
   survive a resize.
   `mv:<kind>.<container…>.<index>` — parsed only by engine/reorder.ts. */
export function sbGrip(addr:any,ro?:any){
  return ro?'':`<span class="sb-grip" data-move="${addr}" title="Drag to move this row">⠿</span>`;
}
export function sbNudge(addr:any,ro?:any){
  return ro?'':`<button class="mbtn nudge" data-mvup="${addr}" title="Move up">▲</button>`
    +`<button class="mbtn nudge" data-mvdn="${addr}" title="Move down">▼</button>`;
}
```

The `ro` (read-only) argument is the caller's existing `pv` **or** `!HOOKS.editMode()`. `board-html.ts` does not import `HOOKS` today, so pass the resolved flag down from `board.ts` instead: in `boardHTML`, the existing `const stoRO = pv || !HOOKS.editMode()` already computes exactly this. Rename it to `roMove` is **not** wanted — leave `stoRO` alone and add beside it:

```ts
  /* same gate as the stores chips: pv OR not in edit mode. A duty crew who
     still has a board open after navigating away must not get live controls. */
  const mvRO = stoRO
```

and thread `mvRO` into every panel call. Change the panel signatures in `board-html.ts` from `(d:any,di:any,pv?:any)` to `(d:any,di:any,pv?:any,ro?:any)` for `sbNotesPanel`, `sbProgPanel`, `sbDutyPanel`, `sbSimRowsPanel` and `sbGroundPanel`, and pass `mvRO` as the fourth argument from `board.ts`. `sbInputsGroupPanel` and `sbUnavailPanel` take no grip — those rows are aircrew inputs, not schedule data, and have no funnel keys.

- [ ] **Step 4: Emit them on every movable row**

**Flying rows** — in `src/ui/board.ts`, line 68, change the column header to:

```ts
    fly += `<div class="sb-lcols"><span></span><span>CS</span><span>MSN</span><span>B</span><span>TO</span><span>LD</span><span>FCP</span><span>RCP</span><span>Notes</span><span></span></div>`
```

and in the `<div class="sb-line…">` template at line 83, insert the grip as the first child, immediately after the opening tag and before `<input class="lin"`:

```ts
        ${sbGrip(`mv:ac.${key}`, mvRO)}
```

(`key` is already `${di}.${gi}.${li}.${ai}`, so `mv:ac.${key}` is the full address.)

Inside the `<span class="lctl">` block at line 105, add the nudges as the **first** two buttons, before the `CX` button:

```ts
          ${sbNudge(`mv:ac.${key}`, mvRO)}
```

Import both helpers in `board.ts` by extending the existing `./board-html` import.

**Duty rows** — in `sbDutyPanel`, change the `C6` header constant to carry a leading empty span. `C6` is shared by the duty, sim and ground panels, so change it once:

```ts
const C6=`<div class="sb-acols c6r"><span></span><span>Item</span><span>Start</span><span>End</span><span>People</span><span>Rmks</span><span></span></div>`;
```

and in the duty row template insert `sbGrip(\`mv:d.${di}.${wi}.${ri}\`,ro)` immediately after `<div class="sb-arow c6r${rowCls(r)}">`, and pass `sbNudge` into `sbRowCtl`. Give `sbRowCtl` a sixth parameter:

```ts
function sbRowCtl(pv:any,o:any,addr:any,pre:any,what:any,mv?:any){
  return pv?'':`<span class="lctl">`+(mv||'')
    +`<button class="mbtn${o.cx?' on':''}" data-${pre}cx="${addr}" title="${o.cx?'Restore '+what:'Cancel '+what+' (CX)'}">CX</button>`
    +`<button class="mbtn red${o.flag?' on':''}" data-${pre}flag="${addr}" title="${o.flag?'Clear the red box':'Red box — flag for the next scheduler'}">■</button>`
    +`<button class="mbtn del" data-${pre}del="${addr}" title="Remove ${what}">✕</button></span>`;
}
```

and call it as `sbRowCtl(pv,r,`${di}.${wi}.${ri}`,'dr','this duty',sbNudge(`mv:d.${di}.${wi}.${ri}`,ro))`.

**Sim rows** — same shape: grip `mv:s.${di}.${kind}.${ri}`, nudge through `sbRowCtl`'s new sixth argument.

**Ground rows** — same shape, grip `mv:g.${di}.${ri}` using the loop's `ri` (the **model** index that `groundOrder` reports, not the rendered position).

**Programme rows** — `sbProgPanel` builds its own `.lctl` inline rather than through `sbRowCtl`. Insert `sbGrip(\`mv:p.${di}.${ri}\`,ro)` right after `<div class="sb-arow${rowCls(x)}">` and `sbNudge(\`mv:p.${di}.${ri}\`,ro)` as the first thing inside `<span class="lctl">`. Its header is `<div class="sb-acols">` (the 6-column form, not `c6r`) — give it a leading `<span></span>` too.

**Note rows** — `sbNotesPanel`'s `.sb-nrow` is `<span class="nx">`, `<input class="nin">`, `<button class="mbtn del">`. Insert the grip before `.nx`, and the nudges before the del button:

```ts
  n.forEach((t:any,ni:any)=>{ s+=`<div class="sb-nrow">`+sbGrip(`mv:n.${di}.${ni}`,ro)+`<span class="nx">${ni+1}.</span>`
    +`<input class="nin" data-bfld="dn:${di}.${ni}"${alAttr(`dn:${di}.${ni}`)}${pv?' disabled':''} value="${esc(t)}" placeholder="e.g. EP OF THE WEEK — ENGINE FIRE ON GROUND">`
    +(pv?'':sbNudge(`mv:n.${di}.${ni}`,ro)+`<button class="mbtn del" data-ndel="${di}.${ni}" title="Remove this note">✕</button>`)+`</div>`; });
```

- [ ] **Step 5: Run the test**

Run: `npx vitest run src/ui/board.test.tsx`
Expected: PASS.

- [ ] **Step 6: Run the suites this markup change can disturb**

Run: `npx vitest run src/ui/ && npx vitest run src/engine/parity.test.ts && npm run build`
Expected: all PASS. Parity covers the **week**, which this task does not touch, so it must stay byte-exact.

- [ ] **Step 7: Commit**

```bash
git add src/ui/board.ts src/ui/board-html.ts src/ui/board.test.tsx
git commit -m "Board: a reorder grip and nudge buttons on every movable row"
```

---

### Task 6: The ▲/▼ handler

A nudge moves a row one place **as rendered**, so the target address is read off the neighbouring row in the DOM, not computed from an index. That is what makes it correct for the ground list, where the render is sorted.

**Files:**
- Modify: `src/ui/board.ts` (`boardMbtn`, a new branch before the `ds.lcx` branch)
- Test: `src/ui/interact.test.tsx` (append)

**Interfaces:**
- Consumes: `applyMove` from `../engine/reorder` (Task 3).
- Produces: nothing further.

- [ ] **Step 1: Write the failing test**

Append to `src/ui/interact.test.tsx` (read the file's existing render/dispatch helpers first and reuse them):

```tsx
describe('the nudge buttons move a row one place as rendered', () => {
  it('▼ on the first programme item swaps it with the second', () => {
    const di = DAYS.findIndex((d: any) => (d.allhands || []).length > 1)
    const was = DAYS[di].allhands.map((x: any) => x.prog)
    mountBoard(di)
    clickAttr(`[data-mvdn="mv:p.${di}.0"]`)
    expect(DAYS[di].allhands.map((x: any) => x.prog)).toEqual([was[1], was[0], ...was.slice(2)])
  })

  it('▲ on the first row is a no-op rather than an error', () => {
    const di = DAYS.findIndex((d: any) => (d.allhands || []).length > 1)
    const was = JSON.stringify(DAYS[di].allhands)
    mountBoard(di)
    clickAttr(`[data-mvup="mv:p.${di}.0"]`)
    expect(JSON.stringify(DAYS[di].allhands)).toBe(was)
  })

  /* the ground list renders time-sorted, so "one place down" is a question
     about the DOM, not about model indices */
  it('▼ on a ground row moves it past the row rendered below it', () => {
    DAYS[0].ground = [
      { prog: 'C', str: '1000' }, { prog: 'A', str: '0800' }, { prog: 'B', str: '0900' },
    ]
    mountBoard(0)
    clickAttr('[data-mvdn="mv:g.0.1"]')     // model 1 is 'A', rendered first
    expect(DAYS[0].gman).toBe(true)
    expect(DAYS[0].ground.map((r: any) => r.prog)).toEqual(['B', 'A', 'C'])
  })

  it('a member cannot nudge', () => {
    setSession({ user: 'user', role: 'member' } as any)
    const di = DAYS.findIndex((d: any) => (d.allhands || []).length > 1)
    const was = JSON.stringify(DAYS[di].allhands)
    mountBoard(di)
    clickAttr(`[data-mvdn="mv:p.${di}.0"]`)
    expect(JSON.stringify(DAYS[di].allhands)).toBe(was)
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run src/ui/interact.test.tsx`
Expected: FAIL — the buttons exist but nothing handles them.

- [ ] **Step 3: Implement**

In `src/ui/board.ts`, add to the imports:

```ts
import { applyMove } from '../engine/reorder'
```

and insert this branch in `boardMbtn`, immediately after the `const ds = t.dataset` line and before the `ds.lcx` branch:

```ts
  /* ▲/▼ — the phone's reorder gesture. The target is read off the NEIGHBOURING
     ROW IN THE DOM rather than computed as index±1, because one list (Ground)
     renders time-sorted: "one place down" is a question about what the
     scheduler can see, and engine/reorder.ts translates the model indices. */
  if (ds.mvup != null || ds.mvdn != null) {
    if (!canEditSched()) return
    const up = ds.mvup != null
    const row = t.closest('[data-move]') as HTMLElement | null
    if (!row) return
    const rows = [...(row.parentElement ? row.parentElement.children : [])]
      .filter(x => (x as HTMLElement).dataset && (x as HTMLElement).dataset.move) as HTMLElement[]
    const i = rows.indexOf(row), j = up ? i - 1 : i + 1
    if (i < 0 || j < 0 || j >= rows.length) return
    if (applyMove(row.dataset.move, rows[j].dataset.move)) { afterSchedMutate(); notify() }
    return
  }
```

Note the existing `if (view.DPREV.has(view.SBDAY as any)) return` guard at the top of `boardMbtn` already covers the frozen-preview case, so this branch needs only the role check.

`row.parentElement.children` is the right scope for every list: flying rows are siblings inside a `.sb-go`, and the panel rows are siblings inside a `.sb-pb`. The `[data-move]` filter drops headers, sub-headers and the scheduler-notes box.

- [ ] **Step 4: Run the test**

Run: `npx vitest run src/ui/interact.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/ui/board.ts src/ui/interact.test.tsx
git commit -m "Board: the nudge buttons, targeting the neighbouring rendered row"
```

---

### Task 7: The drag machine — `ui/rowdrag.ts`

Its own small pointer machine, modelled on the qual-heading drag in `QualsPage.tsx:310-355`. **`drag.ts` stays scoped to pucks** (owner, Aug 26) — a board row is not a puck, and the no-drag-to-section decision is not reopened.

**Files:**
- Create: `src/ui/rowdrag.ts`
- Modify: `src/ui/SchedBoard.tsx:29-35` (attach and detach it in the existing handlers effect)
- Test: `src/ui/rowdrag.test.tsx`

**Interfaces:**
- Consumes: `applyMove` (Task 3); `canEditSched` from `../state/auth`; `view.DPREV`, `view.SBDAY`, `afterSchedMutate` from `../state/view`; `notify` from `../state/store`.
- Produces: `wireRowDrag(el:HTMLElement):() => void` — attaches the machine to a container and returns its own teardown.

- [ ] **Step 1: Write the failing test**

Create `src/ui/rowdrag.test.tsx`:

```tsx
/* The row-drag pointer machine. jsdom has no layout, so this proves the STATE
   machine — which row was picked up, which one it was dropped on, and that a
   refused move leaves the model alone. Whether the drop bar is drawn in the
   right place is a geometry question and lives in e2e/geometry.spec.ts. */
import { beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from '../engine/data'
import { wireRowDrag } from './rowdrag'
import { setSession } from '../state/auth'

const DSNAP = JSON.stringify(DAYS)
let host: HTMLElement, off: () => void

function rowsHTML(addrs: string[]) {
  return addrs.map(a => `<div class="sb-arow" data-move="${a}"><span class="sb-grip" data-move="${a}">⠿</span></div>`).join('')
}
function down(el: Element) { el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 1 })) }
function over(el: Element) { el.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, pointerId: 1 })) }
function up() { document.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerId: 1 })) }

beforeEach(() => {
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  setSession({ user: 'a', role: 'admin' } as any)
  document.body.innerHTML = '<div id="host"></div>'
  host = document.getElementById('host')!
  off?.(); off = wireRowDrag(host)
})

describe('wireRowDrag', () => {
  it('drops a programme row onto another and moves it', () => {
    const di = DAYS.findIndex((d: any) => (d.allhands || []).length > 1)
    const was = DAYS[di].allhands.map((x: any) => x.prog)
    host.innerHTML = rowsHTML([`mv:p.${di}.0`, `mv:p.${di}.1`])
    const [a, b] = [...host.querySelectorAll('.sb-grip')]
    down(a); over(b); up()
    expect(DAYS[di].allhands.map((x: any) => x.prog)).toEqual([was[1], was[0], ...was.slice(2)])
  })

  it('marks the row it is carrying and the row it is over, and clears both on drop', () => {
    host.innerHTML = rowsHTML(['mv:p.0.0', 'mv:p.0.1'])
    const [a, b] = [...host.querySelectorAll('.sb-grip')]
    down(a); over(b)
    expect(host.querySelectorAll('.rowdrag').length).toBe(1)
    expect(host.querySelectorAll('.rowdrop').length).toBe(1)
    up()
    expect(host.querySelectorAll('.rowdrag,.rowdrop').length).toBe(0)
  })

  it('a drag that starts anywhere but the grip is ignored', () => {
    const di = DAYS.findIndex((d: any) => (d.allhands || []).length > 1)
    const was = JSON.stringify(DAYS[di].allhands)
    host.innerHTML = rowsHTML([`mv:p.${di}.0`, `mv:p.${di}.1`])
    const rows = [...host.querySelectorAll('.sb-arow')]
    down(rows[0]); over(rows[1]); up()
    expect(JSON.stringify(DAYS[di].allhands)).toBe(was)
  })

  it('a drop that crosses a container is refused and leaves no marks behind', () => {
    const was = JSON.stringify(DAYS[0].waves)
    host.innerHTML = rowsHTML(['mv:ac.0.0.0.0', 'mv:ac.0.1.0.0'])
    const [a, b] = [...host.querySelectorAll('.sb-grip')]
    down(a); over(b); up()
    expect(JSON.stringify(DAYS[0].waves)).toBe(was)
    expect(host.querySelectorAll('.rowdrag,.rowdrop').length).toBe(0)
  })

  it('a member cannot pick a row up at all', () => {
    setSession({ user: 'user', role: 'member' } as any)
    const di = DAYS.findIndex((d: any) => (d.allhands || []).length > 1)
    const was = JSON.stringify(DAYS[di].allhands)
    host.innerHTML = rowsHTML([`mv:p.${di}.0`, `mv:p.${di}.1`])
    const [a, b] = [...host.querySelectorAll('.sb-grip')]
    down(a); over(b); up()
    expect(JSON.stringify(DAYS[di].allhands)).toBe(was)
  })

  it('a pointer that lifts outside the container still ends the drag', () => {
    host.innerHTML = rowsHTML(['mv:p.0.0', 'mv:p.0.1'])
    const [a] = [...host.querySelectorAll('.sb-grip')]
    down(a); up()
    expect(host.querySelectorAll('.rowdrag').length).toBe(0)
  })
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run src/ui/rowdrag.test.tsx`
Expected: FAIL — cannot resolve `./rowdrag`.

- [ ] **Step 3: Implement**

Create `src/ui/rowdrag.ts`:

```ts
import { applyMove } from '../engine/reorder'
import { canEditSched } from '../state/auth'
import * as view from '../state/view'
import { notify } from '../state/store'

/* ---- dragging a board row to reorder it (owner, 8 Aug 26) ------------------
   Its own little machine, deliberately: `drag.ts` stays scoped to pucks (owner,
   Aug 26) and a board row is not a puck. Same shape as the qual-heading drag in
   QualsPage.tsx, for the same three reasons:

   - Pointer events rather than HTML5 drag-and-drop, so a finger works.
   - The implicit pointer capture a touch gets is RELEASED on the way down,
     because without it every pointermove keeps reporting the row the drag began
     on and the row can never find a new home.
   - The carried row and the drop bar are written STRAIGHT ONTO THE DOM instead
     of through state: every board panel is an innerHTML string that a re-render
     rebuilds, and rebuilding it under a moving pointer would drop the drag.
     Only the drop itself changes state.

   Delegated on the board wrap and attached once, so it survives every panel
   repaint underneath it. */
export function wireRowDrag(el: HTMLElement) {
  let from = ''
  let carry: HTMLElement | null = null
  let over: HTMLElement | null = null

  const clear = () => {
    if (carry) carry.classList.remove('rowdrag')
    if (over) over.classList.remove('rowdrop')
    carry = null; over = null; from = ''
  }
  const rowOf = (t: EventTarget | null) =>
    (t as HTMLElement)?.closest?.('[data-move]') as HTMLElement | null

  const onDown = (e: any) => {
    if (!canEditSched()) return
    if (view.DPREV.has(view.SBDAY as any)) return
    /* the GRIP only — a press on the row itself is a click on a field, and a
       row full of inputs has almost no blank space to spare */
    const grip = (e.target as HTMLElement).closest?.('.sb-grip[data-move]') as HTMLElement | null
    if (!grip) return
    const row = rowOf(grip); if (!row) return
    from = row.dataset.move!
    try { grip.releasePointerCapture?.(e.pointerId) } catch { /* mouse: nothing to release */ }
    carry = row; row.classList.add('rowdrag')
    e.preventDefault()
  }
  const onMove = (e: any) => {
    if (!from) return
    const row = rowOf(e.target)
    if (!row || row === carry || row.dataset.move === from) return
    if (row !== over) {
      if (over) over.classList.remove('rowdrop')
      over = row; row.classList.add('rowdrop')
    }
  }
  const onUp = () => {
    const to = over?.dataset.move
    const src = from
    clear()
    if (src && to && applyMove(src, to)) { view.afterSchedMutate(); notify() }
  }

  el.addEventListener('pointerdown', onDown)
  el.addEventListener('pointermove', onMove)
  /* on the document, not the container: a finger that lifts off the edge of the
     board must still end the drag rather than leave it armed */
  document.addEventListener('pointerup', onUp)
  document.addEventListener('pointercancel', onUp)
  return () => {
    el.removeEventListener('pointerdown', onDown)
    el.removeEventListener('pointermove', onMove)
    document.removeEventListener('pointerup', onUp)
    document.removeEventListener('pointercancel', onUp)
  }
}
```

- [ ] **Step 4: Wire it into the board**

In `src/ui/SchedBoard.tsx`, extend the existing handlers effect (lines 29-35):

```tsx
  /* the board's own handlers, attached once */
  useEffect(() => {
    const el = boardRef.current!
    el.addEventListener('click', boardMbtn)
    el.addEventListener('click', boardArmClick)
    el.addEventListener('change', boardChange)
    const offDrag = wireRowDrag(el)
    return () => {
      el.removeEventListener('click', boardMbtn); el.removeEventListener('click', boardArmClick)
      el.removeEventListener('change', boardChange); offDrag()
    }
  }, [])
```

and add `import { wireRowDrag } from './rowdrag'` to its imports.

- [ ] **Step 5: Run the tests**

Run: `npx vitest run src/ui/rowdrag.test.tsx && npx vitest run src/ui/ && npm run build`
Expected: all PASS.

- [ ] **Step 6: Commit**

```bash
git add src/ui/rowdrag.ts src/ui/rowdrag.test.tsx src/ui/SchedBoard.tsx
git commit -m "Board: the row-drag pointer machine, its own, scoped to the grip"
```

---

### Task 8: The stylesheet, and the geometry the stylesheet has to hold

The grip takes a column of its own on desktop. On a phone it is `display:none`, so it creates no grid item and the phone templates need no new track — **but it is still a DOM child, so every `nth-child()` rule in the board's phone block shifts by one.** That re-indexing is the most breakage-prone edit in this change, and vitest cannot see any of it: jsdom loads no stylesheet and reports every rect as 0×0.

**Files:**
- Modify: `src/ui/scheduler.css` (six regions, listed below)
- Test: `e2e/geometry.spec.ts` (append)

**Interfaces:**
- Consumes: the markup contract from Task 5.
- Produces: nothing consumed by later tasks.

- [ ] **Step 1: Add the grip's own styling**

Append to the board section of `src/ui/scheduler.css`, next to `.sb-line .lctl` (around line 1821):

```css
/* ---- the reorder grip (owner, 8 Aug 26) ---------------------------------
   18px is the narrowest track that still centres a ⠿ against the 5px row
   padding without shifting the CS box off the 64px track it has always had.
   touch-action:none is required, not cosmetic: without it the browser claims
   the gesture for scrolling and pointermove stops firing mid-drag. */
.sb-grip{display:flex;align-items:center;justify-content:center;height:100%;
  color:var(--ink-3);font-size:13px;line-height:1;letter-spacing:-1.5px;
  cursor:grab;user-select:none;touch-action:none;border-radius:4px}
.sb-grip:hover{color:var(--accent);background:rgba(59,198,232,.09)}
.rowdrag{background:var(--raised);outline:1px solid var(--accent);outline-offset:-1px;
  border-radius:6px;box-shadow:0 6px 18px rgba(0,0,0,.55)}
.rowdrag .sb-grip{color:var(--accent);cursor:grabbing}
/* the landing mark is a border on the row being dropped ONTO, not an inserted
   element: the panels are innerHTML strings and inserting a node under a moving
   pointer would change the very child indices the nth-child rules below count */
.rowdrop{box-shadow:inset 0 2px 0 0 var(--accent)}
/* ▲/▼ are the phone's gesture; the grip is the desktop's. Both are always in
   the markup — see board-html.ts's sbGrip/sbNudge for why. */
.mbtn.nudge{display:none;padding:2px 4px;font-size:9px}
```

- [ ] **Step 2: Add the grip track to the three desktop templates**

`src/ui/scheduler.css:1635` — `.sb-lcols,.sb-line` base template. This is superseded by line 1820, but leave the two consistent so a later edit that removes 1820 does not silently lose the track:

```css
.sb-lcols,.sb-line{display:grid;grid-template-columns:18px 64px 74px 52px 52px 1fr 1fr 1.2fr;gap:8px;align-items:center;padding:5px 11px}
```

Line 1820 — the live desktop template:

```css
.sb-lcols,.sb-line{grid-template-columns:18px 64px 74px 52px 52px 52px 1fr 1fr 1.2fr 92px}
```

Line 1879 — `.sb-acols,.sb-arow`:

```css
.sb-acols,.sb-arow{display:grid;grid-template-columns:18px 1.5fr 1.1fr 52px 52px minmax(96px,1.1fr) 92px;
```
(keep the rest of that rule's declarations exactly as they are)

Line 1896 — `.sb-acols.c6r,.sb-arow.c6r`:

```css
.sb-acols.c6r,.sb-arow.c6r{grid-template-columns:18px 1.3fr 52px 52px minmax(96px,1.2fr) 1fr 92px}
```

Line 1873 — `.sb-nrow`:

```css
.sb-nrow{display:grid;grid-template-columns:18px 22px 1fr 62px;gap:7px;align-items:center;margin-bottom:5px}
```
(62px, not 30px: the notes row now carries ▲ ▼ ✕ rather than ✕ alone.)

- [ ] **Step 3: Re-index the phone block and swap which control shows**

Inside `@media (max-width:820px){` at line 1915, make exactly these changes:

```css
  /* the grip is display:none here, so it takes no grid track — but it is still
     a DOM child, so every nth-child index below counts it (8 Aug 26) */
  .sb-grip{display:none}
  .mbtn.nudge{display:inline-flex}
  .sb-lcols>:nth-child(4),.sb-lcols>:nth-child(7),.sb-lcols>:nth-child(8),
  .sb-lcols>:nth-child(9),.sb-lcols>:nth-child(10){display:none}
  .sb-acols>:nth-child(3),.sb-acols>:nth-child(6),.sb-acols>:nth-child(7){display:none}
  .sb-acols.c6r>:nth-child(3){display:revert}
  .sb-acols.c6r>:nth-child(5){display:none}
```

The header rows also need their first cell hidden so their columns still line up with the bodies:

```css
  .sb-lcols>:nth-child(1),.sb-acols>:nth-child(1){display:none}
```

Leave `.sb-lcols,.sb-line{grid-template-columns:54px 1fr 52px 52px…}`, `.sb-acols,.sb-arow`, `.sb-acols.c6r,.sb-arow.c6r` and every `grid-column:1 / -1` rule in that block **unchanged** — with the grip hidden the phone track counts are exactly what they were.

- [ ] **Step 4: Re-index the `.sb-wide` block**

`.sb-wide` is the desktop layout forced on a phone, and it restates the desktop templates and reverts the hidden columns. Every one of those needs the same +1. Around lines 2055-2071:

```css
.schedboard.sb-wide .sb-grip{display:flex}
.schedboard.sb-wide .mbtn.nudge{display:none}
.schedboard.sb-wide .sb-lcols>:nth-child(1),.schedboard.sb-wide .sb-acols>:nth-child(1){display:revert}
.schedboard.sb-wide .sb-lcols,.schedboard.sb-wide .sb-line{grid-template-columns:18px 64px 74px 54px 54px 54px 1fr 1fr 92px 92px;font-size:11.5px}
.schedboard.sb-wide .sb-lcols>:nth-child(4),.schedboard.sb-wide .sb-lcols>:nth-child(7),
.schedboard.sb-wide .sb-lcols>:nth-child(8),.schedboard.sb-wide .sb-lcols>:nth-child(9),
.schedboard.sb-wide .sb-lcols>:nth-child(10){display:revert}
.schedboard.sb-wide .sb-acols,.schedboard.sb-wide .sb-arow{grid-template-columns:18px 120px 54px 54px 1fr 1fr 1fr;gap:8px}
.schedboard.sb-wide .sb-acols>:nth-child(3),.schedboard.sb-wide .sb-acols>:nth-child(6),
.schedboard.sb-wide .sb-acols>:nth-child(7){display:revert}
.schedboard.sb-wide .sb-acols.c6r,.schedboard.sb-wide .sb-arow.c6r{grid-template-columns:18px 150px 54px 54px 1fr 1fr 92px}
.schedboard.sb-wide .sb-acols.c6r>:nth-child(5){display:revert}
```

Keep every other declaration in that block as it stands.

- [ ] **Step 5: Write the geometry tests**

Append to `e2e/geometry.spec.ts`, following the file's existing `test(...)` style and importing `login`, `go`, `clickHere` from `./app` as the neighbouring tests do:

```ts
test('the grip shows on desktop and the nudge buttons on a phone', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  await login(page); await go(page, 'editsched')
  await page.evaluate(() => (window as any).openScheduler(0))
  await page.waitForSelector('#sbBoard .sb-line [data-move]')
  const wide = await page.evaluate(() => {
    const g = document.querySelector('#sbBoard .sb-line .sb-grip') as HTMLElement
    const n = document.querySelector('#sbBoard .sb-line .mbtn.nudge') as HTMLElement
    return { grip: getComputedStyle(g).display, nudge: getComputedStyle(n).display, w: g.getBoundingClientRect().width }
  })
  expect(wide.grip).not.toBe('none')
  expect(wide.nudge).toBe('none')
  expect(Math.round(wide.w)).toBe(18)

  await page.setViewportSize({ width: 390, height: 780 })
  const narrow = await page.evaluate(() => {
    const g = document.querySelector('#sbBoard .sb-line .sb-grip') as HTMLElement
    const n = document.querySelector('#sbBoard .sb-line .mbtn.nudge') as HTMLElement
    return { grip: getComputedStyle(g).display, nudge: getComputedStyle(n).display }
  })
  expect(narrow.grip).toBe('none')
  expect(narrow.nudge).not.toBe('none')
})

/* the nth-child re-index is the breakage-prone half of this change and jsdom
   cannot see it: the phone board must keep the SAME column layout it had */
test('the phone board keeps its column layout after the grip is added', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 780 })
  await login(page); await go(page, 'editsched')
  await page.evaluate(() => (window as any).openScheduler(0))
  await page.waitForSelector('#sbBoard .sb-arow.c6r')
  const m = await page.evaluate(() => {
    const row = document.querySelector('#sbBoard .sb-arow.c6r') as HTMLElement
    const item = row.querySelector('.ain') as HTMLElement
    const hdr = document.querySelector('#sbBoard .sb-acols.c6r') as HTMLElement
    return {
      tracks: getComputedStyle(row).gridTemplateColumns.split(' ').length,
      item: item.getBoundingClientRect().width,
      hdrTracks: getComputedStyle(hdr).gridTemplateColumns.split(' ').length,
    }
  })
  expect(m.tracks).toBe(3)
  expect(m.hdrTracks).toBe(3)
  /* the 6 Aug regression: the ITEM column collapsed to a 14px stub */
  expect(m.item).toBeGreaterThan(150)
})

test('dragging a grip reorders the wave and keeps a pair together', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  await login(page); await go(page, 'editsched')
  await page.evaluate(() => (window as any).openScheduler(0))
  await page.waitForSelector('#sbBoard .sb-line [data-move]')
  const before = await page.evaluate(() =>
    [...document.querySelectorAll('#sbBoard .sb-line .lin')].map(i => (i as HTMLInputElement).value))
  const grips = page.locator('#sbBoard .sb-go').first().locator('.sb-line .sb-grip')
  const last = await grips.count() - 1
  const a = await grips.nth(last).boundingBox()
  const b = await grips.nth(0).boundingBox()
  await page.mouse.move(a!.x + a!.width / 2, a!.y + a!.height / 2)
  await page.mouse.down()
  await page.mouse.move(b!.x + b!.width / 2, b!.y + b!.height / 2, { steps: 12 })
  await page.mouse.up()
  const after = await page.evaluate(() =>
    [...document.querySelectorAll('#sbBoard .sb-line .lin')].map(i => (i as HTMLInputElement).value))
  expect(after).not.toEqual(before)
  /* a formation's rows stay adjacent — a callsign must never appear twice in
     two places in one Go */
  const runs = after.filter((v, i) => i === 0 || v !== after[i - 1])
  expect(new Set(runs).size).toBe(runs.length)
})

test('a phone nudge moves a row and the board still reads correctly', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 780 })
  await login(page); await go(page, 'editsched')
  await page.evaluate(() => (window as any).openScheduler(0))
  await page.waitForSelector('#sbBoard .sb-arow [data-mvdn]')
  const first = () => page.evaluate(() =>
    (document.querySelector('#sbBoard .sb-panel.prog .sb-arow .ain') as HTMLInputElement)?.value)
  const was = await first()
  await clickHere(page, '#sbBoard .sb-panel.prog .sb-arow [data-mvdn]')
  expect(await first()).not.toBe(was)
})

test('a squadron member gets no grip and no nudge buttons', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  await login(page, 'user')
  const n = await page.evaluate(() => document.querySelectorAll('[data-move],[data-mvup]').length)
  expect(n).toBe(0)
})
```

- [ ] **Step 6: Run the geometry gate**

Run: `npm run test:e2e`
Expected: PASS, all tests including the pre-existing 40.

If the phone-layout test fails, the `nth-child` re-index is wrong — read the failing track count against the rules in Step 3 rather than adjusting the assertion.

- [ ] **Step 7: Look at it yourself**

Run: `npm run build && npx vite preview --port 4173`, then drive it with Playwright per `CLAUDE.md` §Build & verify (`executablePath:'/opt/pw-browsers/chromium'`). Log in as `a`/`a`, open the board, screenshot a Go block at 1280 and at 390, and **look at both**. Watch for console errors and 4xx responses. The grip must sit clear of the CS box at desktop width, and the phone board must look exactly as it did before this change apart from the two new buttons.

- [ ] **Step 8: Commit**

```bash
git add src/ui/scheduler.css e2e/geometry.spec.ts
git commit -m "Board: the grip's column, the phone nth-child re-index, and the geometry that pins both"
```

---

### Task 9: Re-measure the board's DOM ceiling

Three nodes per movable row (grip + two buttons). The recorded ceiling is **810** against a last measurement of **767**, so this will very likely need raising. Raising a ceiling is a deliberate, argued edit in the PR that adds the nodes — never a silent one.

**Files:**
- Modify: `probes/perf-port.cjs:218` (only if the measurement demands it)
- Modify: `docs/probe-sweep.md` (§The performance gate)

- [ ] **Step 1: Measure**

Run, in one shell: `npm run build && npx vite preview --port 4173 &` then `npm run perf`

Read the reported board node count. Record the **actual number**, not an estimate.

- [ ] **Step 2: Raise the ceiling if, and only if, the measurement demands it**

If the count is at or under 810, change nothing and skip to Step 3.

If it is over, set `DOM_CEILING.board` in `probes/perf-port.cjs:218` to the measured count rounded up to the next 10, and add a line to `docs/probe-sweep.md` §The performance gate in the style of the existing stores entry:

> **The board's DOM ceiling was raised 810 → NNN**, measured NNN nodes (was 767 before this feature) — the reorder grip and the two nudge buttons on every movable row, `probes/perf-port.cjs`'s `DOM_CEILING`.

- [ ] **Step 3: Confirm the per-node budget still holds**

Run: `npm run perf`
Expected: **9/0**. The per-node budget is what catches a real slowdown; a ceiling only catches a DOM explosion. If a per-node figure is red, re-run once before believing it — `docs/probe-sweep.md` records this estimator swinging on a busy container.

- [ ] **Step 4: Commit**

```bash
git add probes/perf-port.cjs docs/probe-sweep.md
git commit -m "Perf: re-measure the board's DOM ceiling for the reorder controls"
```

---

### Task 10: Documentation, then the gates and the PR

`HANDOFF.md` must be true in the same PR, and the living contracts live in `engine-rules.md` and `ui-contracts.md` — the spec is a historical record of *why*, not the contract.

**Files:**
- Modify: `docs/engine-rules.md`
- Modify: `docs/ui-contracts.md`
- Modify: `../HANDOFF.md`

- [ ] **Step 1: Write the engine rules**

Add a §Reordering a board list to `docs/engine-rules.md` covering: the `mv:` address grammar; the containment rules and the two meanings of a flying row's address; that a move marks the moved row at its **new** address (and why, against the delete rule that marks nothing); `permuteKeys`/`moveKeys` and the bijection property; the Ground `gman` flag, the freeze-then-move sequence and Undo as the way back; and that duties now print in model order on both surfaces.

- [ ] **Step 2: Write the UI contracts**

Add a §Reordering rows on the board to `docs/ui-contracts.md` covering: grip on desktop, ▲/▼ below 820px, both always in the markup with CSS choosing; the grip's 18px track and the phone `nth-child` shift; `.rowdrag`/`.rowdrop` and why the landing mark is a border rather than an inserted node; that the nudge targets the neighbouring **rendered** row; and the three gates (render on `editMode()`, gesture on `canEditSched()` plus the `DPREV` guard, engine on range).

- [ ] **Step 3: Update HANDOFF.md**

Add a bullet to §Known issues / open work in the house style, and add `src/engine/order.ts`, `src/engine/reorder.ts` and `src/ui/rowdrag.ts` to the file map. Note the two behaviour changes a future session must not mistake for bugs: Ground stops time-sorting on a day once a row is moved there, and duties no longer print in role order.

- [ ] **Step 4: Run all four gates, plus the two local-only ones**

```bash
npm test
npm run build
node reference/tfin.js
npm run test:e2e
npx vite preview --port 4173 &   # probes:adapted and perf do NOT serve themselves
npm run probes:adapted
npm run perf
```

Expected: vitest green; build clean; reference **728/0**; e2e all green; probes **6/6**; perf **9/0**.

- [ ] **Step 5: Check the deployed-bundle behaviour one last time**

Build, `vite preview`, log in, and drive the real board at both widths: drag a formation, drag a jet inside a formation, nudge a ground row, then Undo each one and confirm it goes back — including the Ground list returning to time order. Screenshot and look.

- [ ] **Step 6: Commit and open the PR**

```bash
git add docs/ ../HANDOFF.md
git commit -m "Docs: reordering rows on the board"
git push -u origin claude/read-handoff-docs-ipaox0
```

Open a PR to `main`. The four gates run on the PR; nothing merges red.

---

## Self-Review

**Spec coverage.** Every section of the spec maps to a task: the move primitive → Task 1; the movers and `applyMove` → Task 3; Ground's manual mode → Tasks 2 and 3; the duty re-lay → Task 4; rendering → Task 5; the nudge handler → Task 6; the drag machine → Task 7; the stylesheet and geometry → Task 8; perf → Task 9; documentation → Task 10. The spec's write-path guards appear in Tasks 5 (render), 6 and 7 (gesture) and 3 (engine range checks).

**One thing the spec did not anticipate**, found while planning and folded in: nudging a Ground row cannot be a plain model-index move, because the list renders time-sorted — the first nudge would have moved the row to a model index the sort immediately undid, and the scheduler would see nothing happen. `moveGroundRow` therefore freezes the rendered order into the model first, which is a whole permutation rather than a single move. That is why `permuteKeys` is the primitive and `moveKeys` is a wrapper over it, rather than the other way round as the spec described. The spec's `moveKeys` signature also gained a `len` argument for the same reason.

**Placeholders.** None — every code step carries the actual code, every command carries its expected result, and every "if it fails" branch says what to do rather than "handle the error".

**Type consistency.** `applyMove(fromAddr, toAddr)` is named identically in Tasks 3, 6 and 7. `groundOrder(grd, man)` keeps one signature across Tasks 2, 3 and 5. `sbGrip(addr, ro)` / `sbNudge(addr, ro)` are used with the same argument order in Task 5's four call sites. `wireRowDrag(el)` returns a teardown in both Task 7's implementation and its SchedBoard wiring. The `mv:` grammar table in Task 3 matches every address emitted in Task 5 and asserted in Tasks 6, 7 and 8.
