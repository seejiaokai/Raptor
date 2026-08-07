# Stores Configuration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use subagent-driven-development (recommended) or executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the hard-coded stores list (`NAV`, `N/C`, `2 TKS`, `3 TKS`, `TPOD`, `CL`) the squadron's own — add, remove, rename and reorder it from the schedule, persisted across reloads, with the same per-line interface on the Edit Schedule week and the Schedule Board.

**Architecture:** `STORE_CFG` moves from a `const` in `src/ui/html.ts` to a new mutable engine module `src/engine/stores.ts` that owns the list, its four mutators and its `localStorage` persistence (key `stores`, same `store` helper `rules` uses). One popup builder in `src/ui/interactions.ts` serves both surfaces; a pen inside it edits the list. The board gains an `.sb-rcell` wrapper around its remarks input — copying the `.sb-bcell` idiom — so the chips and the `C` button fit without adding a grid column.

**Tech Stack:** TypeScript, React 19, Vite 8, Vitest 4 (jsdom), Playwright 1.62. No new dependencies.

**Spec:** `docs/superpowers/specs/2026-08-07-stores-configuration-design.md`

## Global Constraints

- **Rename changes the label, never the key.** Jets store `a.opts.tk2`. A rename that alters the key silently strips the store from every jet carrying it.
- **Removing a store from the list never touches `a.opts`.** Re-adding the store brings its chips back, exactly as EDIT QUALS does with `p.quals`.
- **Editing the list must never call `markEdit`.** Toggling a store on a jet is a schedule edit (funnel → pending → next AL → undoable); editing the list is a squadron setting (`localStorage`, not schedule history).
- **`C` stays inside `<span class="stores">`, and `.stores` stays last in the remarks cell, closing immediately before its `</div>`.** `html.test.ts`'s `noStores` excision is `/<span class="stores">[\s\S]*?<\/span>(?=<\/div>)/g` — a lazy match that depends on both. Break either and byte-exact reference parity fails.
- **The engine stays DOM-free.** `src/engine/stores.ts` imports only from `./hooks`. It never calls `notify()` or `HOOKS.toast` — mutators return a result and the UI decides what to say.
- **`storeBackend.impl` is null headless.** Engine tests wire a fake backend; they never touch real `localStorage`.
- **Storage is untrusted input.** `storesLoad` validates shape, charset, length and uniqueness — see `rulesLoad`'s scar comment (`isFinite("840")` is `true`).
- Key charset is exactly what `storeKey` can emit: `^[a-z0-9]+$`. No underscores.
- Label cap 16 characters; list cap 24 entries.

---

### Task 1: The engine module and its persistence

**Files:**
- Create: `src/engine/stores.ts`
- Create: `src/engine/stores.test.ts`
- Modify: `src/engine/index.ts` (add one export line)

**Interfaces:**
- Consumes: `store` from `./hooks` (`store.get(k, d)` / `store.set(k, v)`, which prefix keys with `sqn142_`).
- Produces:
  - `STORE_STD: readonly [string,string][]` — the frozen default six
  - `STORE_CFG: [string,string][]` — the live, mutable list
  - `storeKey(name: string): string`
  - `addStore(name: string): string | null` — `null` on success, else the reason
  - `delStore(key: string): boolean`
  - `renameStore(key: string, label: string): string | null`
  - `moveStore(from: number, to: number): boolean`
  - `storesSave(): void`, `storesLoad(): void`, `storesReset(): void`
  - `storesAreStandard(): boolean`

- [ ] **Step 1: Write the failing test**

Create `src/engine/stores.test.ts`:

```ts
import { describe, it, expect, beforeEach } from 'vitest'
import { storeBackend } from './hooks'
import {
  STORE_STD, STORE_CFG, storeKey, addStore, delStore, renameStore, moveStore,
  storesSave, storesLoad, storesReset, storesAreStandard,
} from './stores'

/* storeBackend.impl is null headless, so wire a fake — never real localStorage */
const mem: Record<string, string> = {}
const fake = {
  getItem: (k: string) => (k in mem ? mem[k]! : null),
  setItem: (k: string, v: string) => { mem[k] = v },
}

beforeEach(() => {
  Object.keys(mem).forEach(k => delete mem[k])
  storeBackend.impl = fake
  storesReset()
})

describe('the standard list', () => {
  it('opens on the six the port shipped with, in order', () => {
    expect(STORE_CFG.map(([k]) => k)).toEqual(['nav', 'nc', 'tk2', 'tks3', 'tpod', 'cl'])
    expect(STORE_CFG.map(([, l]) => l)).toEqual(['NAV', 'N/C', '2 TKS', '3 TKS', 'TPOD', 'CL'])
    expect(storesAreStandard()).toBe(true)
  })
  it('STORE_STD cannot be mutated through STORE_CFG', () => {
    addStore('LGB')
    expect(STORE_STD.length).toBe(6)
  })
})

describe('storeKey', () => {
  it('strips every non-alphanumeric, exactly as qualKey does', () => {
    expect(storeKey('2 TKS')).toBe('2tks')
    expect(storeKey('  N/C  ')).toBe('nc')
    expect(storeKey('TPOD')).toBe('tpod')
  })
  it('is empty for a name with nothing alphanumeric in it', () => {
    expect(storeKey('///')).toBe('')
  })
})

describe('adding', () => {
  it('appends with the typed label upper-cased and the derived key', () => {
    expect(addStore('lgb')).toBe(null)
    expect(STORE_CFG[STORE_CFG.length - 1]).toEqual(['lgb', 'LGB'])
    expect(storesAreStandard()).toBe(false)
  })
  it('refuses a name with no letter or number', () => {
    expect(addStore('///')).toBe('A store needs a letter or a number in its name')
    expect(STORE_CFG.length).toBe(6)
  })
  it('refuses a duplicate key', () => {
    expect(addStore('NAV')).toBe('NAV is already on the list')
    expect(STORE_CFG.length).toBe(6)
  })
  it('refuses a label longer than 16 characters', () => {
    expect(addStore('A'.repeat(17))).toBe('A store name is at most 16 characters')
  })
  it('refuses a 25th entry', () => {
    for (let i = 0; i < 18; i++) expect(addStore('x' + i)).toBe(null)
    expect(STORE_CFG.length).toBe(24)
    expect(addStore('toomany')).toBe('The list holds at most 24 stores')
  })
})

describe('renaming — THE key never moves', () => {
  it('changes the label and leaves the key alone', () => {
    expect(renameStore('tk2', '2 TANKS')).toBe(null)
    expect(STORE_CFG.find(([k]) => k === 'tk2')).toEqual(['tk2', '2 TANKS'])
    expect(STORE_CFG.some(([k]) => k === '2tanks')).toBe(false)
  })
  it('refuses an empty label and leaves the old one standing', () => {
    expect(renameStore('tk2', '   ')).toBe('A store needs a name')
    expect(STORE_CFG.find(([k]) => k === 'tk2')).toEqual(['tk2', '2 TKS'])
  })
  it('refuses a label longer than 16 characters', () => {
    expect(renameStore('tk2', 'B'.repeat(17))).toBe('A store name is at most 16 characters')
  })
  it('is false for a key that is not on the list', () => {
    expect(renameStore('nope', 'X')).toBe('nope is not on the list')
  })
})

describe('removing', () => {
  it('drops the entry and reports it', () => {
    expect(delStore('tpod')).toBe(true)
    expect(STORE_CFG.some(([k]) => k === 'tpod')).toBe(false)
  })
  it('is false for a key that is not on the list', () => {
    expect(delStore('nope')).toBe(false)
  })
})

describe('reordering', () => {
  it('moves an entry and shuffles the rest up', () => {
    expect(moveStore(0, 2)).toBe(true)
    expect(STORE_CFG.map(([k]) => k)).toEqual(['nc', 'tk2', 'nav', 'tks3', 'tpod', 'cl'])
  })
  it('refuses an out-of-range index rather than dropping an entry', () => {
    expect(moveStore(0, 99)).toBe(false)
    expect(moveStore(-1, 0)).toBe(false)
    expect(STORE_CFG.length).toBe(6)
  })
})

describe('persistence', () => {
  it('writes nothing while the list is standard', () => {
    storesSave()
    expect(mem['sqn142_stores']).toBe(JSON.stringify(null))
  })
  it('round-trips a customised list, order and labels intact', () => {
    renameStore('tk2', '2 TANKS'); delStore('cl'); addStore('LGB'); moveStore(0, 3)
    const expected = STORE_CFG.map(([k, l]) => [k, l])
    storesSave()
    storesReset()
    expect(storesAreStandard()).toBe(true)
    storesLoad()
    expect(STORE_CFG).toEqual(expected)
  })
  it('reset clears the stored list as well as the live one', () => {
    addStore('LGB'); storesSave()
    storesReset()
    expect(storesAreStandard()).toBe(true)
    storesLoad()
    expect(storesAreStandard()).toBe(true)
  })
})

describe('a hand-edited blob is untrusted — see rulesLoad on isFinite("840")', () => {
  const load = (raw: any) => { mem['sqn142_stores'] = JSON.stringify(raw); storesLoad() }
  it('falls back to standard when the blob is not an array', () => {
    load({ nav: true })
    expect(storesAreStandard()).toBe(true)
  })
  it('drops an entry that is not a two-string pair', () => {
    load([['nav', 'NAV'], ['nc'], ['tk2', 2], 'tpod'])
    expect(STORE_CFG).toEqual([['nav', 'NAV']])
  })
  it('drops a key outside ^[a-z0-9]+$ — including an underscore storeKey cannot emit', () => {
    load([['nav', 'NAV'], ['two_tks', 'X'], ['UP', 'Y'], ['', 'Z']])
    expect(STORE_CFG).toEqual([['nav', 'NAV']])
  })
  it('drops a duplicate key, keeping the first', () => {
    load([['nav', 'NAV'], ['nav', 'AGAIN']])
    expect(STORE_CFG).toEqual([['nav', 'NAV']])
  })
  it('drops an empty or over-long label', () => {
    load([['nav', 'NAV'], ['a', '  '], ['b', 'C'.repeat(17)]])
    expect(STORE_CFG).toEqual([['nav', 'NAV']])
  })
  it('caps the list at 24 entries', () => {
    load(Array.from({ length: 40 }, (_, i) => ['k' + i, 'L' + i]))
    expect(STORE_CFG.length).toBe(24)
  })
  it('falls back to standard when nothing at all survives', () => {
    load([['UP', 'X'], ['', '']])
    expect(storesAreStandard()).toBe(true)
  })
  it('survives a corrupt JSON string without throwing', () => {
    mem['sqn142_stores'] = '{not json'
    expect(() => storesLoad()).not.toThrow()
    expect(storesAreStandard()).toBe(true)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/engine/stores.test.ts`
Expected: FAIL — `Failed to resolve import "./stores"`.

- [ ] **Step 3: Write the implementation**

Create `src/engine/stores.ts`:

```ts
import { store } from './hooks'

/* THE SQUADRON'S STORES LIST (owner, 7 Aug 26). Was a const in ui/html.ts;
   it is persisted state with save/load/reset now — which is what `rules` is —
   so it lives in the engine and html.ts goes back to being a builder library.

   [key,label]: the KEY is what lands in aircraft.opts and must never move
   (a rename that changes it strips the store from every jet carrying it);
   the LABEL is what prints. Order is display-only and drives all three
   places consistently — the chips on the line, the popup, and the CSV.

   Nothing in validate.ts reads a store, so removal carries no hazard and
   needs no arm-before-delete the way EDIT QUALS does. */
export const STORE_STD: readonly [string, string][] = Object.freeze([
  ['nav', 'NAV'], ['nc', 'N/C'], ['tk2', '2 TKS'],
  ['tks3', '3 TKS'], ['tpod', 'TPOD'], ['cl', 'CL'],
] as [string, string][])

export const MAX_STORES = 24, MAX_LABEL = 16

export let STORE_CFG: [string, string][] = STORE_STD.map(p => [p[0], p[1]])

/* same derivation as QualsPage's qualKey — non-alphanumerics stripped, not
   replaced, so the charset a key can hold is exactly ^[a-z0-9]+$ */
export const storeKey = (name: string) => name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '')

const KEY_OK = /^[a-z0-9]+$/

export function storesAreStandard() {
  return STORE_CFG.length === STORE_STD.length
    && STORE_CFG.every(([k, l], i) => k === STORE_STD[i]![0] && l === STORE_STD[i]![1])
}

export function addStore(name: string): string | null {
  const label = name.trim().toUpperCase()
  const k = storeKey(name)
  if (!k) return 'A store needs a letter or a number in its name'
  if (label.length > MAX_LABEL) return `A store name is at most ${MAX_LABEL} characters`
  if (STORE_CFG.some(([x]) => x === k)) return `${label} is already on the list`
  if (STORE_CFG.length >= MAX_STORES) return `The list holds at most ${MAX_STORES} stores`
  STORE_CFG.push([k, label])
  return null
}

export function delStore(key: string): boolean {
  const i = STORE_CFG.findIndex(([k]) => k === key)
  if (i < 0) return false
  STORE_CFG.splice(i, 1)
  return true
}

/* THE KEY NEVER MOVES — see the module note. */
export function renameStore(key: string, label: string): string | null {
  const i = STORE_CFG.findIndex(([k]) => k === key)
  if (i < 0) return `${key} is not on the list`
  const lab = label.trim().toUpperCase()
  if (!lab) return 'A store needs a name'
  if (lab.length > MAX_LABEL) return `A store name is at most ${MAX_LABEL} characters`
  STORE_CFG[i] = [key, lab]
  return null
}

export function moveStore(from: number, to: number): boolean {
  const n = STORE_CFG.length
  if (!Number.isInteger(from) || !Number.isInteger(to)) return false
  if (from < 0 || from >= n || to < 0 || to >= n) return false
  const [row] = STORE_CFG.splice(from, 1)
  STORE_CFG.splice(to, 0, row!)
  return true
}

/* An ordered, renameable list IS its order and its labels, so there is no
   meaningful per-entry diff the way rulesSave has: the whole list is stored,
   and only when it deviates. Standard set → nothing written at all. */
export function storesSave() {
  store.set('stores', storesAreStandard() ? null : STORE_CFG.map(([k, l]) => [k, l]))
}

/* Storage is hand-editable, so it is untrusted input — rulesLoad carries the
   scar comment that explains why (isFinite("840") is true, and a string once
   poisoned the crew-rest maths). Bad entries are dropped; if nothing valid
   survives, the standard six stand. */
export function storesLoad() {
  const raw = store.get('stores', null)
  if (!Array.isArray(raw)) return
  const seen = new Set<string>()
  const out: [string, string][] = []
  for (const row of raw) {
    if (out.length >= MAX_STORES) break
    if (!Array.isArray(row) || row.length !== 2) continue
    const [k, l] = row
    if (typeof k !== 'string' || typeof l !== 'string') continue
    if (!KEY_OK.test(k) || seen.has(k)) continue
    const lab = l.trim()
    if (!lab || lab.length > MAX_LABEL) continue
    seen.add(k)
    out.push([k, lab])
  }
  if (out.length) STORE_CFG = out
}

export function storesReset() {
  STORE_CFG = STORE_STD.map(p => [p[0], p[1]])
  store.set('stores', null)
}
```

Add to `src/engine/index.ts`, after the `./rules` line:

```ts
export * from './stores'
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/engine/stores.test.ts`
Expected: PASS, 26 tests.

- [ ] **Step 5: Commit**

```bash
git add src/engine/stores.ts src/engine/stores.test.ts src/engine/index.ts
git commit -m "Stores configuration: the engine module and its persistence

STORE_CFG becomes mutable state with add/remove/rename/reorder and a
localStorage key of its own. Separate from `rules` deliberately: rulesReset
sets that key to null and a test pins 'reset restores the standard exactly',
so sharing the blob would silently wipe the stores list.

The whole list is stored, and only on deviation — an ordered, renameable
list is its order and its labels, so there is no per-entry diff to take.
Loading validates shape, charset, label length, uniqueness and count,
because storage is hand-editable; rulesLoad's isFinite(\"840\") comment is
the precedent."
```

---

### Task 2: Move the three importers off `html.ts`

**Files:**
- Modify: `src/ui/html.ts:266` (delete the `const`, import from the engine)
- Modify: `src/ui/export.ts:6`
- Modify: `src/ui/interactions.ts:17`

**Interfaces:**
- Consumes: `STORE_CFG` from Task 1's `src/engine/stores.ts`, via the barrel `../engine`.
- Produces: nothing new. `html.ts` still exports `storesView`; only the list's home changes.

This is a pure refactor — a behaviour change here is a bug. The existing suite is the test.

- [ ] **Step 1: Run the suite to record the green baseline**

Run: `npm test`
Expected: PASS, 632 tests across 39 files. Write the number down; it must not change in this task.

- [ ] **Step 2: Delete the const from `html.ts` and import instead**

In `src/ui/html.ts`, delete the `export const STORE_CFG:[string,string][]=[...]` line at 266 **and its preceding comment block** (the comment now lives in `engine/stores.ts`). Add `STORE_CFG` to the existing engine import at the top of the file:

```ts
import { STORE_CFG } from '../engine'
```

Leave `storesView` exactly as it is — it reads `STORE_CFG` from the new import without changing a character.

- [ ] **Step 3: Repoint the other two importers**

In `src/ui/export.ts`, change line 6 from `import { STORE_CFG } from './html'` to:

```ts
import { STORE_CFG } from '../engine'
```

In `src/ui/interactions.ts`, change line 17 from `import { STORE_CFG } from './html'` to add `STORE_CFG` to its existing `../engine` import.

Add the new API to `src/probe-bridge.ts` as well. It already republishes the
directly comparable `rulesLoad, rulesSave, rulesReset` off `./engine/rules`, so
the stores equivalents belong beside them by the same reasoning — the bridge
exists so the reference probe sweep can drive the port unchanged, and
`HANDOFF.md` records that it must be kept in sync when engine API is added:

```ts
import { STORE_CFG, STORE_STD, storeKey, addStore, delStore, renameStore, moveStore, storesSave, storesLoad, storesReset, storesAreStandard } from './engine/stores'
```

and add those names to the object the file publishes onto `window`, matching
how the `rules*` names are published there.

- [ ] **Step 4: Run the suite and the build**

Run: `npm test && npm run build`
Expected: PASS, still 632 tests. `tsc -b` clean — a missed importer surfaces here as an unresolved name.

- [ ] **Step 5: Commit**

```bash
git add src/ui/html.ts src/ui/export.ts src/ui/interactions.ts
git commit -m "Stores configuration: move STORE_CFG's importers to the engine

Pure refactor, no behaviour change — 632/39 before and after. html.ts is
the builder library and should not own squadron state now that the list is
persisted."
```

---

### Task 3: Load the persisted list at boot

**Files:**
- Modify: `src/state/store.ts:142-148` (`initStore`)
- Modify: `src/state/store.test.ts` — or, if no such file exists, create `src/state/stores-boot.test.ts`

**Interfaces:**
- Consumes: `storesLoad` from Task 1.
- Produces: nothing. After this task a customised list survives a reload.

- [ ] **Step 1: Write the failing test**

Create `src/state/stores-boot.test.ts`:

```ts
import { describe, it, expect, beforeEach } from 'vitest'
import { storeBackend } from '../engine/hooks'
import { STORE_CFG, storesReset } from '../engine/stores'
import { initStore } from './store'

const mem: Record<string, string> = {}
beforeEach(() => {
  Object.keys(mem).forEach(k => delete mem[k])
  storeBackend.impl = {
    getItem: (k: string) => (k in mem ? mem[k]! : null),
    setItem: (k: string, v: string) => { mem[k] = v },
  }
  storesReset()
})

describe('boot', () => {
  it('initStore picks up a stored stores list', () => {
    mem['sqn142_stores'] = JSON.stringify([['tpod', 'TPOD'], ['nav', 'NAV']])
    initStore()
    expect(STORE_CFG).toEqual([['tpod', 'TPOD'], ['nav', 'NAV']])
  })
  it('initStore leaves the standard six when nothing is stored', () => {
    initStore()
    expect(STORE_CFG.map(([k]) => k)).toEqual(['nav', 'nc', 'tk2', 'tks3', 'tpod', 'cl'])
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/state/stores-boot.test.ts`
Expected: FAIL on the first test — `STORE_CFG` is still the standard six because nothing loads it.

- [ ] **Step 3: Call `storesLoad` in `initStore`**

In `src/state/store.ts`, add the import and the call. It must sit **before** `validate()`, beside `rulesLoad()`:

```ts
export function initStore() {
  wireStore()
  rulesLoad()
  storesLoad()
  validate()
  histInit()
  notify()
}
```

Add `storesLoad` to the existing `../engine` import in that file.

- [ ] **Step 4: Run the tests**

Run: `npx vitest run src/state/stores-boot.test.ts && npm test`
Expected: PASS, both tests; full suite still green.

- [ ] **Step 5: Commit**

```bash
git add src/state/store.ts src/state/stores-boot.test.ts
git commit -m "Stores configuration: load the persisted list at boot

storesLoad() sits beside rulesLoad() in initStore, before the first
validate() so the list is settled before anything renders from it."
```

---

### Task 4: `+` becomes `C` on the week

**Files:**
- Modify: `src/ui/html.ts:607` (the button)
- Modify: `src/ui/interactions.ts:334-335` (the click branch)
- Modify: `src/ui/scheduler.css:760` (the class)
- Modify: `src/ui/interact.test.tsx:200-222`

**Interfaces:**
- Consumes: nothing new.
- Produces: the DOM contract `button.stcfg[data-stcfg="di.gi.li.ai"]`, which Tasks 5, 6, 7 and 8 all address.

**Constraint check for this task:** the button stays inside `<span class="stores">`, which stays last in the remarks cell. `npm test` fails on `html.test.ts` if either slips.

- [ ] **Step 1: Update the existing test to the new contract**

In `src/ui/interact.test.tsx`, rename the describe at line 200 and repoint the selectors. Replace `.stadd[data-stadd]` with `.stcfg[data-stcfg]` and `dataset.stadd` with `dataset.stcfg` throughout the block, and change the two assertion messages:

```ts
describe('stores configs — the C picker (owner, Aug 26; + became C, 7 Aug 26)', () => {
  const editTab = () => $$('.nav a[data-page]').find(a => a.dataset.page === 'editsched')!

  it('the C menu adds a config, marks st: pending, and C stays for more', async () => {
    const { DAYS } = await import('../engine/data')
    const { SCHED } = await import('../engine/publish')
    await click(editTab())
    const add = $('#eWeek .stcfg[data-stcfg]')
    expect(add, 'a C button renders on the edit week').toBeTruthy()
    const [di, gi, li, ai] = add.dataset.stcfg!.split('.')
    const a = DAYS[+di!].waves[+gi!].formations[+li!].aircraft[+ai!]; a.opts = a.opts || {}
    a.opts.cl = false; await act(async () => notify())
    await click($(`#eWeek .stcfg[data-stcfg="${di}.${gi}.${li}.${ai}"]`))
    const item = document.querySelector('.stmenu [data-cfg="cl"]') as HTMLElement
    expect(item, 'the menu offers CL').toBeTruthy()
    await click(item)
    expect(a.opts.cl).toBe(true)
    expect(SCHED.pending[`st:${di}.${gi}.${li}.${ai}`]).toBeTruthy()
    expect($(`#eWeek .stchip[data-store="${di}.${gi}.${li}.${ai}.cl"]`), 'the CL chip now shows').toBeTruthy()
    expect($(`#eWeek .stcfg[data-stcfg="${di}.${gi}.${li}.${ai}"]`), 'C remains').toBeTruthy()
    a.opts.cl = false; await act(async () => notify())
  })
```

Leave the other two `it` blocks in that describe (`clicking an on-chip removes that config`, and the bombs test) untouched — they address `.stchip` and `data-bombs`, which are not changing.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/ui/interact.test.tsx -t "the C menu adds a config"`
Expected: FAIL — `a C button renders on the edit week` is falsy.

- [ ] **Step 3: Rename the button**

In `src/ui/html.ts:607`, change:

```ts
+`<button class="stadd" data-stadd="${key}" title="Add a config">+</button>`
```

to:

```ts
+`<button class="stcfg" data-stcfg="${key}" title="Stores configuration">C</button>`
```

In `src/ui/interactions.ts`, change the branch at 334-335:

```ts
  /* C opens the stores popup — a body-level box mirroring waveMenu */
  const stCfg = t.closest('[data-stcfg]') as HTMLElement | null
  if (stCfg && HOOKS.editMode()) { openStoresMenu(stCfg, stCfg.dataset.stcfg!); e.stopPropagation(); return }
```

In `src/ui/scheduler.css`, rename the two selectors at 760-761 from `.stadd` to `.stcfg`. The declarations are unchanged.

- [ ] **Step 4: Run the tests**

Run: `npm test`
Expected: PASS, 632 tests. `html.test.ts`'s byte-exact parity must be green — if it is not, the button has escaped `.stores`.

- [ ] **Step 5: Commit**

```bash
git add src/ui/html.ts src/ui/interactions.ts src/ui/scheduler.css src/ui/interact.test.tsx
git commit -m "Stores configuration: the week's + becomes C

Owner's call — C reads as the button it is about to become on both
surfaces, where + read as 'add one more'. It stays inside .stores, which
stays last in the remarks cell, so html.test.ts's noStores excision still
matches and reference parity costs nothing."
```

---

### Task 5: The popup lists every store as a toggle

**Files:**
- Modify: `src/ui/interactions.ts:72-97` (`openStoresMenu`)
- Modify: `src/ui/interact.test.tsx` (one new `it` in the Task 4 describe)

**Interfaces:**
- Consumes: `STORE_CFG` from the engine; the `data-stcfg` contract from Task 4.
- Produces: the popup DOM — `.stmenu` containing one `button[data-cfg="<key>"]` per store, carrying class `on` when that store is on this jet. Task 6 adds the pen to this same box.

**Why this changes:** today the picker offers only stores *not* yet on. That works beside the week's inline chips but says nothing standalone — and the board's popup has to be self-contained.

- [ ] **Step 1: Write the failing test**

Add to the describe in `src/ui/interact.test.tsx`:

```ts
  it('the popup lists EVERY store, marking the ones already on this jet', async () => {
    const { DAYS } = await import('../engine/data')
    const { STORE_CFG } = await import('../engine/stores')
    await click(editTab())
    const add = $('#eWeek .stcfg[data-stcfg]')
    const [di, gi, li, ai] = add.dataset.stcfg!.split('.')
    const a = DAYS[+di!].waves[+gi!].formations[+li!].aircraft[+ai!]; a.opts = a.opts || {}
    a.opts.nav = true; a.opts.cl = false; await act(async () => notify())
    await click($(`#eWeek .stcfg[data-stcfg="${di}.${gi}.${li}.${ai}"]`))
    const items = Array.from(document.querySelectorAll('.stmenu [data-cfg]')) as HTMLElement[]
    expect(items.length, 'every store is offered, not only the unticked').toBe(STORE_CFG.length)
    expect(items.find(b => b.dataset.cfg === 'nav')!.classList.contains('on')).toBe(true)
    expect(items.find(b => b.dataset.cfg === 'cl')!.classList.contains('on')).toBe(false)
  })

  it('clicking a lit row in the popup takes that store OFF the jet', async () => {
    const { DAYS } = await import('../engine/data')
    await click(editTab())
    const add = $('#eWeek .stcfg[data-stcfg]')
    const [di, gi, li, ai] = add.dataset.stcfg!.split('.')
    const a = DAYS[+di!].waves[+gi!].formations[+li!].aircraft[+ai!]; a.opts = a.opts || {}
    a.opts.nav = true; await act(async () => notify())
    await click($(`#eWeek .stcfg[data-stcfg="${di}.${gi}.${li}.${ai}"]`))
    await click(document.querySelector('.stmenu [data-cfg="nav"]') as HTMLElement)
    expect(a.opts.nav).toBe(false)
  })
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/ui/interact.test.tsx -t "the popup lists EVERY store"`
Expected: FAIL — the popup renders only the unticked stores, so the count is short.

- [ ] **Step 3: Rewrite the popup's normal state**

Replace the body of `openStoresMenu` in `src/ui/interactions.ts` (lines 72-97) with:

```ts
/* The stores popup — a body-level box anchored to the C button, built the
   way board.ts builds waveMenu: outside the React tree, removing itself on
   any outside click. It lists EVERY store, lit where the jet carries it, so
   the box is self-contained — the board has no inline chips to read.
   Toggling goes through the funnel (markEdit → pending → next AL). */
function openStoresMenu(anchor: HTMLElement, key: string) {
  document.querySelectorAll('.stmenu').forEach(x => x.remove())
  const [di, gi, li, ai] = key.split('.')
  const a = DAYS[+di!].waves[+gi!].formations[+li!].aircraft[+ai!]
  a.opts = a.opts || {}
  const box = document.createElement('div')
  box.className = 'stmenu wavemenu'
  const paint = () => {
    box.innerHTML = `<h5>Stores configuration</h5><div class="wm-row">`
      + STORE_CFG.map(([k, lab]) =>
        `<button class="wm${a.opts[k] ? ' on' : ''}" data-cfg="${k}">${lab}</button>`).join('')
      + `</div>`
  }
  paint()
  document.body.appendChild(box)
  const r = anchor.getBoundingClientRect()
  box.style.left = Math.max(8, Math.min(window.innerWidth - box.offsetWidth - 8, Math.round(r.left))) + 'px'
  box.style.top = Math.min(window.innerHeight - box.offsetHeight - 8, Math.round(r.bottom + 6)) + 'px'
  box.addEventListener('click', (ev: any) => {
    ev.stopPropagation()
    const b = ev.target.closest('[data-cfg]'); if (!b) return
    const k = b.dataset.cfg
    a.opts[k] = !a.opts[k]
    markEdit(`st:${di}.${gi}.${li}.${ai}`)
    paint()
    notify()
  })
  setTimeout(() => document.addEventListener('click', function off() { box.remove(); document.removeEventListener('click', off) }, { once: true }), 0)
}
```

Note the box now **repaints and stays open** after a toggle rather than removing itself — you can set three stores in one visit.

- [ ] **Step 4: Run the tests**

Run: `npm test`
Expected: PASS, 634 tests (632 + the two new). The Task 4 test still passes because `[data-cfg="cl"]` is still present — it is simply unlit rather than absent.

- [ ] **Step 5: Commit**

```bash
git add src/ui/interactions.ts src/ui/interact.test.tsx
git commit -m "Stores configuration: the popup lists every store as a toggle

It used to offer only the stores not yet on, which reads fine beside the
week's inline chips and says nothing standalone. The box has to be
self-contained to serve the board too. It also stays open across a toggle
now, so three stores take one visit rather than three."
```

---

### Task 6: The pen — editing the list itself

**Files:**
- Modify: `src/ui/interactions.ts` (`openStoresMenu` — the pen state)
- Modify: `src/ui/scheduler.css` (pen-state rules, after the `.stmenu` block at 762)
- Create: `src/ui/stores-edit.test.tsx`

**Interfaces:**
- Consumes: `addStore`, `delStore`, `renameStore`, `moveStore`, `storesSave` from Task 1; the popup from Task 5.
- Produces: the pen DOM — `button.st-pen` in the box header; in pen state, one `.st-erow[data-k="<key>"]` per store, each carrying `input.st-lab`, `button.st-up`, `button.st-dn`, `button.st-del`; plus `input.st-new` and `button.st-add`.

**The two constraints this task exists to honour:**
- Editing the list must not call `markEdit` — a rename is not a schedule edit.
- The outside-click auto-dismiss must be suspended while the pen is open, or a click into a rename field kills the box.

- [ ] **Step 1: Write the failing test**

Create `src/ui/stores-edit.test.tsx`:

```tsx
// @vitest-environment jsdom
/* There is NO shared UI test helper in this repo — every *.test.tsx defines
   its own $ / $$ / click and boots the app in beforeAll. This preamble is
   src/ui/interact.test.tsx:16-32 verbatim, plus the fake storeBackend the
   engine needs headless. Do not extract a helper module for this. */
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { initStore, setSession, notify } from '../state/store'
import { storeBackend } from '../engine/hooks'
import { STORE_CFG, storesReset } from '../engine/stores'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

let host: HTMLDivElement
const $ = (sel: string) => host.querySelector(sel) as HTMLElement
const $$ = (sel: string) => [...host.querySelectorAll(sel)] as HTMLElement[]
const click = async (el: Element | null) => {
  expect(el, 'click target exists').toBeTruthy()
  await act(async () => { (el as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true })) })
}

const mem: Record<string, string> = {}
const editTab = () => $$('.nav a[data-page]').find(a => a.dataset.page === 'editsched')!
const openPen = async () => {
  await click(editTab())
  await click($('#eWeek .stcfg[data-stcfg]'))
  await click(document.querySelector('.stmenu .st-pen') as HTMLElement)
}

beforeAll(async () => {
  storeBackend.impl = {
    getItem: (k: string) => (k in mem ? mem[k]! : null),
    setItem: (k: string, v: string) => { mem[k] = v },
  }
  initStore()
  host = document.createElement('div')
  document.body.appendChild(host)
  await act(async () => { createRoot(host).render(<App />) })
  await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
})

/* the list is module state, so each test starts from the standard six —
   and any open popup is dropped, or the next openPen finds two */
beforeEach(async () => {
  Object.keys(mem).forEach(k => delete mem[k])
  document.querySelectorAll('.stmenu').forEach(x => x.remove())
  storesReset()
  await act(async () => notify())
})

describe('the pen edits the LIST, not the schedule', () => {
  it('renaming changes the label and never the key', async () => {
    await openPen()
    const row = document.querySelector('.stmenu .st-erow[data-k="tk2"] .st-lab') as HTMLInputElement
    row.value = '2 TANKS'
    await act(async () => { row.dispatchEvent(new Event('change', { bubbles: true })) })
    expect(STORE_CFG.find(([k]) => k === 'tk2')).toEqual(['tk2', '2 TANKS'])
    expect(STORE_CFG.some(([k]) => k === '2tanks')).toBe(false)
  })

  it('a rename never reaches the amendment list', async () => {
    const { SCHED } = await import('../engine/publish')
    const before = Object.keys(SCHED.pending).length
    await openPen()
    const row = document.querySelector('.stmenu .st-erow[data-k="tk2"] .st-lab') as HTMLInputElement
    row.value = 'RENAMED'
    await act(async () => { row.dispatchEvent(new Event('change', { bubbles: true })) })
    expect(Object.keys(SCHED.pending).length, 'editing the list is not a schedule edit').toBe(before)
  })

  it('removing a store leaves the jets that carry it untouched', async () => {
    const { DAYS } = await import('../engine/data')
    const a = DAYS[0].waves[0].formations[0].aircraft[0]
    a.opts = a.opts || {}; a.opts.tk2 = true
    await openPen()
    await click(document.querySelector('.stmenu .st-erow[data-k="tk2"] .st-del') as HTMLElement)
    expect(STORE_CFG.some(([k]) => k === 'tk2')).toBe(false)
    expect(a.opts.tk2, 'the jet keeps it — add the store back and the chip returns').toBe(true)
  })

  it('adding appends and persists', async () => {
    await openPen()
    const box = document.querySelector('.stmenu .st-new') as HTMLInputElement
    box.value = 'LGB'
    await act(async () => { box.dispatchEvent(new Event('change', { bubbles: true })) })
    await click(document.querySelector('.stmenu .st-add') as HTMLElement)
    expect(STORE_CFG[STORE_CFG.length - 1]).toEqual(['lgb', 'LGB'])
    expect(JSON.parse(mem['sqn142_stores']!).pop()).toEqual(['lgb', 'LGB'])
  })

  it('the up arrow reorders and persists', async () => {
    await openPen()
    await click(document.querySelector('.stmenu .st-erow[data-k="tk2"] .st-up') as HTMLElement)
    expect(STORE_CFG.map(([k]) => k)).toEqual(['nav', 'tk2', 'nc', 'tks3', 'tpod', 'cl'])
    expect(JSON.parse(mem['sqn142_stores']!).map((r: any) => r[0]))
      .toEqual(['nav', 'tk2', 'nc', 'tks3', 'tpod', 'cl'])
  })

  it('a click inside the open pen does not dismiss the box', async () => {
    await openPen()
    const lab = document.querySelector('.stmenu .st-erow[data-k="tk2"] .st-lab') as HTMLElement
    await click(lab)
    expect(document.querySelector('.stmenu'), 'the box survives an in-box click').toBeTruthy()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/ui/stores-edit.test.tsx`
Expected: FAIL — `.st-pen` does not exist, so `openPen` throws on a null element.

- [ ] **Step 3: Implement the pen**

In `src/ui/interactions.ts`, extend `openStoresMenu`. Add `let pen = false` beside the existing locals, add the pen button to the header, branch `paint()` on `pen`, and suspend the dismiss while it is open:

```ts
  let pen = false
  const paint = () => {
    box.innerHTML = `<h5>Stores configuration`
      + `<button class="st-pen${pen ? ' on' : ''}" title="${pen ? 'Done editing the list' : 'Edit the list'}">✎</button></h5>`
      + (pen
        ? `<div class="st-elist">`
          + STORE_CFG.map(([k, lab], i) =>
            `<div class="st-erow" data-k="${k}">`
            + `<input class="st-lab" value="${esc(lab)}" maxlength="16" aria-label="Name for ${esc(lab)}">`
            + `<button class="st-up" ${i === 0 ? 'disabled' : ''} title="Move up">↑</button>`
            + `<button class="st-dn" ${i === STORE_CFG.length - 1 ? 'disabled' : ''} title="Move down">↓</button>`
            + `<button class="st-del" title="Remove ${esc(lab)} from the list">✕</button></div>`).join('')
          + `</div><div class="st-addrow">`
          + `<input class="st-new" placeholder="e.g. LGB" maxlength="16" aria-label="New store name">`
          + `<button class="st-add">Add</button></div>`
          + `<div class="wm-note">The list is the squadron's, not this jet's — it survives a reload. Removing one keeps every jet that carries it.</div>`
        : `<div class="wm-row">`
          + STORE_CFG.map(([k, lab]) =>
            `<button class="wm${a.opts[k] ? ' on' : ''}" data-cfg="${k}">${esc(lab)}</button>`).join('')
          + `</div>`)
  }
```

Then extend the box's click handler. Note **no `markEdit` anywhere in this branch** — that is the point of the task:

```ts
  box.addEventListener('click', (ev: any) => {
    ev.stopPropagation()
    const T = ev.target as HTMLElement

    if (T.closest('.st-pen')) { pen = !pen; paint(); return }

    if (pen) {
      const row = T.closest('.st-erow') as HTMLElement | null
      const k = row?.dataset.k
      if (k && T.closest('.st-del')) {
        const lab = STORE_CFG.find(([x]) => x === k)?.[1] || k
        delStore(k); storesSave(); paint(); notify()
        HOOKS.toast(`${lab} removed from the list — every jet carrying it keeps it. Add it back and the chips return.`)
        return
      }
      if (k && (T.closest('.st-up') || T.closest('.st-dn'))) {
        const i = STORE_CFG.findIndex(([x]) => x === k)
        if (moveStore(i, i + (T.closest('.st-up') ? -1 : 1))) { storesSave(); paint(); notify() }
        return
      }
      if (T.closest('.st-add')) {
        const box2 = box.querySelector('.st-new') as HTMLInputElement
        const why = addStore(box2.value)
        if (why) return HOOKS.toast(why)
        storesSave(); paint(); notify()
        return
      }
      return
    }

    const b = T.closest('[data-cfg]') as HTMLElement | null; if (!b) return
    const key2 = b.dataset.cfg!
    a.opts[key2] = !a.opts[key2]
    markEdit(`st:${di}.${gi}.${li}.${ai}`)
    paint(); notify()
  })

  /* rename commits on change, so a click away inside the box is enough */
  box.addEventListener('change', (ev: any) => {
    const inp = (ev.target as HTMLElement).closest('.st-lab') as HTMLInputElement | null
    if (!inp) return
    const k = (inp.closest('.st-erow') as HTMLElement).dataset.k!
    const why = renameStore(k, inp.value)
    if (why) { paint(); return HOOKS.toast(why) }
    storesSave(); paint(); notify()
  })
```

Finally, suspend the dismiss. Replace the trailing `setTimeout(...)` with a handler that checks the pen:

```ts
  /* The box removes itself on an outside click — but NOT while the pen is
     open: a drag past the box edge, or a click into a rename field that
     bubbles to document, would otherwise kill it mid-edit. */
  setTimeout(() => document.addEventListener('click', function off(ev: any) {
    if (box.contains(ev.target)) return
    if (pen) return
    box.remove(); document.removeEventListener('click', off)
  }), 0)
```

Note this handler is no longer `{once: true}` — it must survive clicks it declines to act on. Add a matching `document.removeEventListener('click', off)` where the box is removed elsewhere, so the listener does not leak.

Add the imports `addStore, delStore, renameStore, moveStore, storesSave` to the `../engine` import in `interactions.ts`, and `esc` from `./html` if it is not already imported.

Add to `src/ui/scheduler.css`, after line 763:

```css
.stmenu h5{display:flex;align-items:center;justify-content:space-between;gap:8px}
.st-pen{font-size:11px;line-height:1;padding:2px 5px;border-radius:4px;border:1px solid var(--edge-2);background:transparent;color:var(--ink-3);cursor:pointer}
.st-pen:hover,.st-pen.on{border-color:var(--accent);color:var(--accent)}
.st-elist{display:flex;flex-direction:column;gap:3px;margin:4px 0}
.st-erow{display:grid;grid-template-columns:1fr 22px 22px 22px;gap:3px;align-items:center}
.st-erow .st-lab{background:var(--bg);border:1px solid var(--edge);border-radius:5px;color:var(--ink);font-size:11px;padding:4px 6px;width:100%;box-sizing:border-box}
.st-erow button{font-size:10px;line-height:1;padding:4px 0;border-radius:4px;border:1px solid var(--edge-2);background:transparent;color:var(--ink-3);cursor:pointer}
.st-erow button:hover:not(:disabled){border-color:var(--accent);color:var(--accent)}
.st-erow button:disabled{opacity:.3;cursor:default}
.st-addrow{display:grid;grid-template-columns:1fr auto;gap:3px;margin-top:5px}
.st-addrow .st-new{background:var(--bg);border:1px solid var(--edge);border-radius:5px;color:var(--ink);font-size:11px;padding:4px 6px;width:100%;box-sizing:border-box}
.st-addrow .st-add{font-size:10px;font-weight:800;padding:4px 9px;border-radius:4px;border:1px solid var(--edge-2);background:transparent;color:var(--ink-2);cursor:pointer}
.st-addrow .st-add:hover{border-color:var(--accent);color:var(--accent)}
```

- [ ] **Step 4: Run the tests**

Run: `npx vitest run src/ui/stores-edit.test.tsx && npm test`
Expected: PASS, 6 new tests; full suite green.

- [ ] **Step 5: Commit**

```bash
git add src/ui/interactions.ts src/ui/scheduler.css src/ui/stores-edit.test.tsx
git commit -m "Stores configuration: the pen edits the list itself

Reorder, rename, add, remove — persisted on every change. Two things this
task exists to hold: a list edit never calls markEdit, so a rename cannot
land in the amendment list; and the outside-click dismiss is suspended
while the pen is open, or a click into a rename field kills the box.

Rename changes the label and never the key. Removal never touches a.opts,
so a jet carrying a removed store keeps it and re-adding brings the chip
back — the EDIT QUALS guarantee, same reasoning."
```

---

### Task 7: The board gets the week's interface

**Files:**
- Modify: `src/ui/board.ts:69` (wrap the remarks input)
- Modify: `src/ui/scheduler.css` (`.sb-rcell`, and the phone override at 1887)
- Create: `src/ui/board-stores.test.tsx`

**Interfaces:**
- Consumes: `STORE_CFG`, `storesView` and the `data-store` / `data-stcfg` contracts from Tasks 4-6. The board reuses the *same* click routing in `interactions.ts` — no new handlers.
- Produces: `.sb-rcell` wrapping the board's remarks input, chips and `C`.

**The constraint this task exists to honour:** the board's flying line is a nine-column grid (`scheduler.css:1776`) with a six-column phone override (1885). `.sb-rcell` must be **exactly one grid item**, the way `.sb-bcell` already is — see the comment at 1778.

- [ ] **Step 1: Write the failing test**

Create `src/ui/board-stores.test.tsx`:

```tsx
// @vitest-environment jsdom
/* Same preamble as src/ui/stores-edit.test.tsx — there is no shared helper
   module in this repo; each *.test.tsx defines its own. */
import { beforeAll, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { initStore, setSession, notify } from '../state/store'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

let host: HTMLDivElement
const $ = (sel: string) => host.querySelector(sel) as HTMLElement
const $$ = (sel: string) => [...host.querySelectorAll(sel)] as HTMLElement[]
const click = async (el: Element | null) => {
  expect(el, 'click target exists').toBeTruthy()
  await act(async () => { (el as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true })) })
}

beforeAll(async () => {
  initStore()
  host = document.createElement('div')
  document.body.appendChild(host)
  await act(async () => { createRoot(host).render(<App />) })
  await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
})

const openBoard = async () => {
  await click($$('.nav a[data-page]').find(a => a.dataset.page === 'editsched')!)
  await click($('.sb-open'))
}

describe('the board carries the week\'s stores interface', () => {
  it('a flying line has exactly one remarks cell, and the chips live inside it', async () => {
    const { DAYS } = await import('../engine/data')
    const a = DAYS[0].waves[0].formations[0].aircraft[0]
    a.opts = a.opts || {}; a.opts.tk2 = true
    await openBoard(); await act(async () => notify())
    const cell = $('#schedBoard .sb-line .sb-rcell')
    expect(cell, 'the remarks input is wrapped in a cell').toBeTruthy()
    expect(cell.querySelector('.nts'), 'the remarks input is inside it').toBeTruthy()
    expect(cell.querySelector('.stores'), 'so are the stores').toBeTruthy()
    expect(cell.querySelector('.stcfg'), 'and so is C').toBeTruthy()
  })

  it('C on the board opens the same popup the week opens', async () => {
    await openBoard()
    await click($('#schedBoard .sb-line .stcfg[data-stcfg]'))
    expect(document.querySelector('.stmenu'), 'one popup builder, both surfaces').toBeTruthy()
    expect(document.querySelectorAll('.stmenu [data-cfg]').length).toBeGreaterThan(0)
  })

  it('view-only mode shows the chips and no C', async () => {
    const { DAYS } = await import('../engine/data')
    const a = DAYS[0].waves[0].formations[0].aircraft[0]
    a.opts = a.opts || {}; a.opts.tk2 = true
    await click($$('.nav a[data-page]').find(x => x.dataset.page === 'viewsched')!)
    await click($('.sb-open')); await act(async () => notify())
    expect($('#schedBoard .sb-line .stores'), 'a duty crew sees what the jet carries').toBeTruthy()
    expect(document.querySelector('#schedBoard .sb-line .stcfg'), 'but cannot edit it').toBeFalsy()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/ui/board-stores.test.tsx`
Expected: FAIL — `.sb-rcell` is null; the board renders a bare `.nts` input.

- [ ] **Step 3: Wrap the board's remarks input**

In `src/ui/board.ts`, replace line 69:

```ts
        <input class="nts" data-bfld="fr:${key}"${alAttr(`fr:${key}`)}${dis} value="${esc(a.rmks || '')}">
```

with:

```ts
        <div class="sb-rcell">
          <input class="nts" data-bfld="fr:${key}"${alAttr(`fr:${key}`)}${dis} value="${esc(a.rmks || '')}">
          ${pv
            ? storesView(a.opts)
            : `<span class="stores">`
              + STORE_CFG.filter(([k]: any) => (a.opts || {})[k]).map(([k, lab]: any) =>
                  `<span class="stchip on" data-store="${key}.${k}" title="Remove ${lab}">${lab}</span>`).join('')
              + `<button class="stcfg" data-stcfg="${key}" title="Stores configuration">C</button>`
              + `<span class="bombs" contenteditable="true" data-bombs="${key}">${esc((a.opts || {}).bombs || '')}</span></span>`}
        </div>
```

Add `STORE_CFG` and `storesView` to this file's imports (`../engine` and `./html` respectively).

In `src/ui/scheduler.css`, add beside `.sb-bcell` at 1781 — **the same one-grid-item reasoning**:

```css
/* the remarks cell wraps the input, the stores chips and C so the line keeps
   exactly the same grid-item count it had when remarks was a bare input —
   same move as .sb-bcell above, and the reason the nine-column template and
   the phone override below did not have to change. */
.sb-rcell{display:flex;flex-direction:column;justify-content:center;gap:2px;min-width:0}
.sb-rcell .stores{margin-left:0}
#schedBoard .stchip{cursor:default}
#schedBoard.editing .stchip{cursor:pointer}
#schedBoard.editing .stchip:hover{border-color:var(--accent)}
```

And change the phone override at line 1887 from:

```css
  .sb-line .nts{grid-column:1 / -1}
```

to:

```css
  .sb-line .sb-rcell{grid-column:1 / -1}
```

- [ ] **Step 4: Run the tests and the build**

Run: `npx vitest run src/ui/board-stores.test.tsx && npm test && npm run build`
Expected: PASS. `board.test.tsx` must stay green — if it fails on a selector, it addressed `.nts` positionally and needs the cell in its path.

- [ ] **Step 5: Commit**

```bash
git add src/ui/board.ts src/ui/scheduler.css src/ui/board-stores.test.tsx
git commit -m "Stores configuration: the board gets the week's interface

Owner's requirement — the per-line interface is identical on both surfaces,
following the week. The week already puts stores in the remarks CELL, so
the board's bare remarks input becomes one.

No new grid column: .sb-rcell is exactly one grid item, the same move
.sb-bcell made for the B suggestion ghost, so the nine-column template is
untouched and the phone override changes one selector. That matters
because .sb-arow.c6r's specificity bug came out of exactly this area.

View-only sees the chips and gets no C."
```

---

### Task 8: The four things vitest structurally cannot see

**Files:**
- Modify: `e2e/geometry.spec.ts`

**Interfaces:**
- Consumes: `login`, `go`, `clickHere` from `e2e/app.ts`; every DOM contract from Tasks 4-7.
- Produces: nothing consumed downstream.

**Why:** every rect vitest reports is 0×0, so it can confirm which classes were emitted and nothing about where anything sits. These four are the ones most likely to ship broken — the pattern this repo already learned from the dashed-ring and `.sb-arow.c6r` bugs.

- [ ] **Step 1: Write the four failing tests**

Append to `e2e/geometry.spec.ts`. Follow the file's existing `test(...)` idiom and its `login`/`go` helpers:

```ts
test('board: the flying line keeps its grid-item count with stores present', async ({ page }) => {
  await login(page); await go(page, 'editsched')
  await page.click('.sb-open')
  const n = await page.$$eval('#schedBoard .sb-line:first-of-type > *', els => els.length)
  expect(n, 'nine grid items — .sb-rcell must be exactly one').toBe(9)
})

test('board at 390px: the remarks cell drops to its own full-width strip', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 780 })
  await login(page); await go(page, 'editsched')
  await page.click('.sb-open')
  const line = await page.locator('#schedBoard .sb-line').first().boundingBox()
  const cell = await page.locator('#schedBoard .sb-line .sb-rcell').first().boundingBox()
  expect(cell!.width, 'full width, like .nts was').toBeGreaterThan(line!.width - 30)
  const cfg = await page.locator('#schedBoard .sb-line .stcfg').first().boundingBox()
  expect(cfg!.width, 'C is reachable, not collapsed to a stub').toBeGreaterThan(10)
})

test('the pen reorders, and the popup survives a click into a rename field', async ({ page }) => {
  await login(page); await go(page, 'editsched')
  await clickHere(page, '#eWeek .stcfg[data-stcfg]')
  await page.click('.stmenu .st-pen')
  await page.click('.stmenu .st-erow[data-k="tk2"] .st-lab')
  await expect(page.locator('.stmenu'), 'an in-box click must not dismiss it').toBeVisible()
  const first = () => page.locator('.stmenu .st-erow').first().getAttribute('data-k')
  expect(await first()).toBe('nav')
  await page.click('.stmenu .st-erow[data-k="nc"] .st-up')
  expect(await first(), 'the up arrow really reorders').toBe('nc')
})

test('a renamed store keeps its chip on every jet that carries it', async ({ page }) => {
  await login(page); await go(page, 'editsched')
  await clickHere(page, '#eWeek .stcfg[data-stcfg]')
  await page.click('.stmenu .st-pen')
  await page.fill('.stmenu .st-erow[data-k="tk2"] .st-lab', '2 TANKS')
  await page.locator('.stmenu .st-erow[data-k="tk2"] .st-lab').blur()
  await page.keyboard.press('Escape')
  const chip = page.locator('#eWeek .stchip[data-store$=".tk2"]').first()
  await expect(chip, 'the key survived the rename').toBeVisible()
  await expect(chip).toHaveText('2 TANKS')
})
```

- [ ] **Step 2: Run to verify they fail**

Run: `npm run test:e2e -- -g "grid-item count"`
Expected: FAIL before Task 7's CSS is in place; after Task 7 it should pass — run all four and confirm each fails for the right reason if you reach this task out of order.

- [ ] **Step 3: Fix whatever they catch**

No new production code is planned here. If a test fails, the defect is real and belongs to Task 6 or 7 — fix it there rather than loosening the assertion. Record what it caught in the commit message; per `CLAUDE.md`'s live-view rule, this is the gate that has caught this class of bug before.

- [ ] **Step 4: Run the full e2e gate**

Run: `npm run test:e2e`
Expected: PASS, 29 tests (25 + 4).

- [ ] **Step 5: Commit**

```bash
git add e2e/geometry.spec.ts
git commit -m "Stores configuration: gate the four things vitest cannot see

Every rect vitest reports is 0x0, so it can only confirm which classes were
emitted. Measured in a real browser instead: the board line keeping exactly
nine grid items with .sb-rcell in it, the 390px layout where C must stay
reachable, the pen's reorder actually reordering, and the popup surviving a
click into a rename field — which jsdom cannot judge, because it cannot
tell an inside click from an outside one by geometry."
```

---

### Task 9: Raise the board's DOM ceiling, deliberately

**Files:**
- Modify: `probes/perf-port.cjs:215`

**Interfaces:**
- Consumes: nothing.
- Produces: nothing.

**Why this is its own task:** `perf-port.cjs:31` says exceeding a ceiling *"is a prompt to look at the time and then raise the ceiling deliberately, in the PR that adds the nodes."* The board is capped at **770** and renders **699**; Task 7 adds a wrapper, a `C`, a `bombs` span and one chip per store carried to every flying line. A red `npm run perf` here is expected, not a regression.

- [ ] **Step 1: Measure**

Run: `npm run perf`
Record the board's reported node count and whether the per-node timing assertions passed. **The timing assertions must still pass** — only the DOM ceiling may move. If a timing budget is red, re-run before believing it: `HANDOFF.md` records the one-day-edit budget swinging 1.01×–1.28× on identical code on a busy container.

- [ ] **Step 2: Raise the ceiling to the measured number plus headroom**

In `probes/perf-port.cjs`, edit line 215. Use the measured count rounded up to the next 10, plus 40 of headroom — matching the ~10% margin the existing 770-over-699 carries:

```js
  const DOM_CEILING = { week: 5530, board: <measured, rounded up, +40> }
```

Add a one-line comment above it naming what raised it, in the file's own idiom:

```js
  /* board raised from 770 on 7 Aug 26: stores came to the flying line
     (.sb-rcell + chips + C + bombs, per line) — see the stores-configuration
     spec. Measured at <N> before this margin was added. */
```

- [ ] **Step 3: Re-run**

Run: `npm run perf`
Expected: 9/0.

- [ ] **Step 4: Confirm the week did not move**

The week ceiling (5530) must be untouched — Task 4 renamed a button on the week and added no nodes. If the week count moved, something in Task 4 or 6 leaked extra markup into `dayHTML`; investigate rather than raising it.

- [ ] **Step 5: Commit**

```bash
git add probes/perf-port.cjs
git commit -m "Stores configuration: raise the board DOM ceiling for the new per-line markup

perf-port.cjs line 31 prescribes exactly this — a ceiling is raised
deliberately in the PR that adds the nodes, never quietly. Stores came to
the board's flying line in the previous commit. The week ceiling is
untouched; the per-node timing budgets still pass."
```

---

### Task 10: The three documents

**Files:**
- Modify: `docs/ui-contracts.md` (new §Stores configuration)
- Modify: `docs/engine-rules.md` (new §Stores configuration)
- Modify: `../HANDOFF.md` (a bullet under *Known issues / open work*)

**Interfaces:**
- Consumes: the finished behaviour.
- Produces: nothing.

**Why this is a task and not a footnote:** `HANDOFF.md` is what the next session reads, and the spec named these three merges. A feature that ships undocumented here is a feature the next session re-derives.

- [ ] **Step 1: Write the UI contract**

Add a §Stores configuration to `docs/ui-contracts.md` covering: the `C` button on both surfaces and its `data-stcfg` key; the popup listing every store lit-or-not and staying open across a toggle; the pen's four rules (rename keeps the key, removal keeps `a.opts`, single ✕ because nothing reads a store, dismiss suspended while open); view-only showing chips and no `C`; and the `.sb-rcell` one-grid-item contract with a pointer to `.sb-bcell` as its precedent.

- [ ] **Step 2: Write the engine rule**

Add a §Stores configuration to `docs/engine-rules.md` beside the persistence material: the `stores` key and why it is separate from `rules` (`rulesReset` would wipe it); whole-list-on-deviation and why there is no per-entry diff; and the load validation list — array shape, `^[a-z0-9]+$` keys, 16-character labels, no duplicates, 24 max, fall back to standard when nothing survives.

- [ ] **Step 3: Update HANDOFF**

Add a bullet under *Known issues / open work* stating what shipped, plus the two accepted limitations verbatim from the spec — a customised list freezes against future default changes, and a frozen day preview renders with the current list. Note the raised board ceiling with its new number. If `docs/probe-sweep.md` quotes the old 770, update it there too.

- [ ] **Step 4: Run every gate**

Run: `npm test && node reference/tfin.js && npm run build && npm run test:e2e && npm run probes:adapted && npm run perf`
Expected: all green. State the numbers you actually saw — `HANDOFF.md` asks that these be re-stated only after being re-run.

- [ ] **Step 5: Commit**

```bash
git add docs/ui-contracts.md docs/engine-rules.md ../HANDOFF.md docs/probe-sweep.md
git commit -m "Stores configuration: contracts, rules and HANDOFF

The two accepted limitations are recorded so they are not rediscovered as
bugs: a customised list freezes against a future change to the default set,
and a frozen day preview renders with the current list rather than the list
as it was — rules already behaves the second way."
```

---

## Self-review

**Spec coverage.** Every section of the spec maps to a task: the C button and both line interfaces (Tasks 4, 7); the popup and the pen with all four rules (Tasks 5, 6); `STORE_CFG`'s move to the engine and the three importers (Tasks 1, 2); the `stores` key, deviation-only save and hostile-input load (Task 1); boot loading (Task 3); vitest coverage (Tasks 1, 4–7); the four e2e measurements (Task 8); the perf ceiling (Task 9); the three doc merges (Task 10). The spec's *Deferred: the accounts admin page* section is deliberately unimplemented and correctly has no task.

**Naming consistency, checked across tasks.** `data-stcfg` / `.stcfg` (Tasks 4, 7, 8); `.st-pen`, `.st-erow[data-k]`, `.st-lab`, `.st-up`, `.st-dn`, `.st-del`, `.st-new`, `.st-add` (Tasks 6, 8); `addStore`/`delStore`/`renameStore`/`moveStore`/`storesSave`/`storesLoad`/`storesReset`/`storesAreStandard`/`storeKey` (Tasks 1, 3, 6). `.sb-rcell` (Tasks 7, 8). The pre-existing `data-store` and `data-bombs` are unchanged throughout.

**Two assumptions checked against the code rather than left to the implementer.**

*There is no shared UI-test helper module.* An earlier draft of Tasks 6 and 7 imported `$`, `$$`, `click` and `boot` from `./test-helpers`, which does not exist — every `*.test.tsx` in this repo defines its own and boots the app in `beforeAll` with `initStore()` → `createRoot(host).render(<App/>)` → `setSession({user:'a',role:'admin'})`. Both test files now carry that preamble in full, copied from `interact.test.tsx:16-32`. Do not extract a helper: matching the house pattern matters more than removing the duplication.

*`src/probe-bridge.ts` does need the new API.* It already republishes `rulesLoad`, `rulesSave` and `rulesReset` — the directly comparable surface — so the stores functions belong beside them. This is now a concrete step in Task 2 rather than a question.

**One thing the implementer must still discover**, because it cannot be known before the code exists: the board's node count after Task 7, which sets the new DOM ceiling in Task 9. The plan says how to measure it and how much headroom to leave; it deliberately does not guess the number.
