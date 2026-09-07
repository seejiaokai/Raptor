# Leave War bulk balance entry — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use subagent-driven-development (recommended) or executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** An admin drags down a run of people in ONE figure column (the closed counter column or any drawer column), keys one amount in a docked bar, and each person's balance moves by it — as a dated, attributed ledger entry, OIL with the tracker's full form.

**Architecture:** Three layers, each reusing what exists. (1) The store's ledger writer `grantOil` becomes the counter-agnostic `grantTo` with a counter-aware rule body; nothing in `balanceOf` changes. (2) The gesture core `wireGesture` gains two backwards-compatible hooks (`nodes`/`mark`, `onArm`) and one fix (the click swallow on any armed teardown), and a third caller `wireFigureSelect` selects a run of people down one column across all three copies of a box, painting an attribute. (3) The OIL tracker's `CreditForm` moves to its own file, generalised by `counter`, and a viewport-docked `BalanceBar` hosts it on the grid.

**Tech Stack:** React 19 + TypeScript (2-space, no semicolons, single quotes in `src/leavewar`), vitest (`leavewar` project, jsdom, fake timers), Playwright (`lw-phone` iPhone 13 emulation on Chromium, `lw-desktop` 1440×900).

Spec: `raptor-port/docs/superpowers/specs/2026-09-06-leavewar-bulk-balance-design.md` (the owner-approved design; its "Mechanics to respect" list is binding).

## Global Constraints

- **Admin only.** The gesture's `enabled()` is `role === 'admin' && !arranging && !moveSel && !eventMoveSel`; the store refuses a member regardless. A member's boxes behave exactly as today. No inert controls, ever.
- **One pool per drag.** The anchor's `data-fig` fixes the pool; the run is people only, roster order, across headings.
- **Numbers:** `2` and `+2` add, `-2` (or `−2`) subtracts; halves only (`0.5` steps) on EVERY pool, the tracker included; `0`, blank, non-numbers refused; the bar's amount box starts EMPTY (the tracker keeps `1`).
- **Reason:** required for `oil` only. Every entry carries `date` (`YYYY-MM-DD`) and `approvedBy`; `givenBy` optional.
- **One writer:** every credit goes through `grantTo(personIds, counter, amount, date, reason, givenBy)`; `grantOil(ids, …)` = `grantTo(ids, 'oil', …)`. One state write per batch → one `persist()` → one undo step. The bar never touches `openings`.
- **The highlight is an ATTRIBUTE** (`data-figsel="1"`), never a class on `.figbox`; imperative during the drag, React-owned (`selected` prop) after release.
- **The gesture binds to `.mx-outer`**; hit = `td.figbox[data-fig][data-person]` whose figure is `selectableFigure` (has a `counter`); `th` cells never.
- **The bar is NOT a `Sheet`.** `position: fixed; left: 12px; bottom: 14px; width: min(880px, calc(100vw - 24px)); z-index: 60`; background `#1d232b`; `border: 1.5px solid var(--accent)`; `box-shadow: 0 0 0 4px rgba(59,198,232,.16), 0 18px 44px rgba(0,0,0,.7)`; `border-radius: 14px`; slides up 160 ms (`animation: none` under `prefers-reduced-motion`). `.mv-banner` shares the recipe (one rule list).
- **The swipe stands down** for a touch during which the figure gesture armed; a quick flick still cycles.
- **With the figures open, only the band's name and heading cells take the pointer** (`.mx-outer.mx-figures .mxband table { pointer-events: none }`, `td.who, td.grphd { pointer-events: auto }`).
- **No new persisted keys, no DOM-ceiling change** (attributes only; the drawer subtree stays 958; the bar ≈ 15 nodes).
- **Copy is production-grade** — no "session-only"/"no server" notes on screen.
- **Every behaviour change lands with a pin.** Never weaken a failing assertion.
- **Commit per task, do NOT push until Task 4.** Commit messages `feat(leavewar): …` / `fix(leavewar): …` / `docs(leavewar): …`, ending with the session's `Co-Authored-By` + `Claude-Session` trailers.
- **Gates from `raptor-port/`:** while iterating only the affected file (`npx vitest run <file>`; `npx playwright test e2e/leavewar.spec.ts --project=<lw-desktop|lw-phone> --grep "<name>"` against a running `npx vite preview --port 4173` of a fresh `npm run build`); the full set ONCE in Task 4. Playwright scripts pass `executablePath: '/opt/pw-browsers/chromium'`.
- **Each UI task ends with the Playwright project that can SEE its change** (observation 97): Task 2 → `lw-desktop` + `lw-phone`; Task 3 → both; Task 4 → everything.

---

## File structure

| File | Responsibility |
|---|---|
| `raptor-port/src/leavewar/state/store.ts` | `grantTo` (the one credit writer), counter-aware `ledgerProblem` (half-step, reason rule), `reasonRequired`, `HALF_STEP_MSG`; `grantOil` delegates; `updateLedgerEntry` passes the entry's counter |
| `raptor-port/src/leavewar/engine/counters.ts` | `selectableFigure` (the one predicate), `grantsFor` (a person's entries on a pool, oldest first) |
| `raptor-port/src/leavewar/ui/select.ts` | `GestureSpec.nodes`/`mark`/`onArm`, the swallow on any armed teardown, `wireFigureSelect` + `FigureSelectCtx` + `FigureSelection` + `FIGSEL_ATTR` |
| `raptor-port/src/leavewar/ui/FigureCell.tsx` | `selected` prop → `data-figsel` |
| `raptor-port/src/leavewar/ui/FiguresDrawer.tsx` | `DrawerPersonRow` takes `selFig` and marks its cells |
| `raptor-port/src/leavewar/ui/Matrix.tsx` | the gesture bound on `.mx-outer`; `figSel` state, its clears, the swipe stand-down; `data-fig`/`data-person` on the real cell and the band copy; the bar mount, outside-tap and Escape |
| `raptor-port/src/leavewar/ui/CreditForm.tsx` (new) | `CreditForm` (moved from OilTracker, generalised by `counter`, sign chip, `initialAmount`, `onCancel`), `DayChip` (moved), `parseAmount` |
| `raptor-port/src/leavewar/ui/BalanceBar.tsx` (new) | the docked bar + `useDockAboveKeyboard` |
| `raptor-port/src/leavewar/ui/OilTracker.tsx` | imports `CreditForm`/`DayChip` from the new file; otherwise unchanged |
| `raptor-port/src/leavewar/ui/CounterSheet.tsx` | the breakdown itemises grants under "granted" |
| `raptor-port/src/leavewar/ui/matrix.css` | `[data-figsel]` highlight, `.mx-outer.selecting` brightening, the band pointer rule, the shared dock recipe (`.mv-banner, .balbar`) |
| `raptor-port/src/leavewar/ui/bidpicker.css` | `.bdgrants` lines in the breakdown |
| tests | `state/store.test.ts`, `engine/counters.test.ts`, `ui/select.test.ts`, `ui/figselect.test.tsx` (new), `ui/balancebar.test.tsx` (new), `ui/counters.test.tsx`, `ui/oiltracker.test.tsx` (the amount input is text now), `e2e/leavewar.spec.ts` |
| docs | `docs/ui-contracts.md`, `docs/leavewar/known-gaps.md`, `docs/feature-impact.md`, `HANDOFF.md`, `BUG-TESTING.md` (#373) |

---

### Task 1: The store writer and the engine predicates

**Files:**
- Modify: `raptor-port/src/leavewar/state/store.ts` (the block at ~2143–2223: `ledgerProblem`, `grantOil`, `updateLedgerEntry`)
- Modify: `raptor-port/src/leavewar/engine/counters.ts` (after `figureLines`, ~396)
- Test: `raptor-port/src/leavewar/state/store.test.ts`, `raptor-port/src/leavewar/engine/counters.test.ts`

**Interfaces:**
- Consumes: `LedgerEntry`/`Ledger` (counters.ts:66–80), `counterLabel(counter)` (counters.ts:59), `approverName()`, `ledgerSeq()`, `ISO_DAY`, `MAX_REASON`, `MAX_GIVEN_BY`, `withCurrent`/`persist`/`notify` (store.ts).
- Produces: `grantTo(personIds: string[], counter: CounterName, amount: number, date: string, reason: string, givenBy?: string): string | null`; `reasonRequired(counter: CounterName): boolean`; `HALF_STEP_MSG: string`; `selectableFigure(f: Figure | undefined): f is Figure & { counter: CounterName }`; `grantsFor(ledger: Ledger, personId: string, counter: CounterName): LedgerEntry[]`. `grantOil`'s signature is unchanged.

- [ ] **Step 1: Write the failing store tests**

Append to `store.test.ts` (import `grantTo`, `reasonRequired`, `HALF_STEP_MSG`, `lwUndo`, `updateLedgerEntry` beside the existing `grantOil` import; `balanceOf` from `../engine/counters`; `figureCtxOf`, `getState` are already imported there — check and reuse):

```ts
// A dated +/− on ANY pool from the figures (owner, 6 Sep 26 — "if it shows 7
// and I add 3 it reads 10; −3 gives 4"; "reason only for OIL"). One writer,
// grantTo; grantOil is the OIL case of it. The rules live in ONE body.
describe('grantTo — a dated credit on any pool', () => {
  const bal = (id: string, counter: CounterName) => {
    const s = getState()
    return balanceOf(s.openings, s.ledger, s.wars, id, counter, figureCtxOf())
  }
  it('refuses a member and names the pool', () => {
    setRole('member')
    expect(grantTo(['ramp'], 'ccl', 2, '2026-09-06', '')).toBe('Only an admin can credit CCL')
  })
  it('adds to the balance with no reason on a plain pool, stamped with who and when', () => {
    setRole('admin')
    const before = bal('ramp', 'ccl')
    expect(grantTo(['ramp'], 'ccl', 2, '2026-09-06', '')).toBeNull()
    expect(bal('ramp', 'ccl')).toBe(before + 2)
    const e = getState().ledger.filter(x => x.personId === 'ramp' && x.counter === 'ccl').at(-1)!
    expect(e).toMatchObject({ amount: 2, date: '2026-09-06', reason: '', approvedBy: 'admin' })
    expect(e.id).toMatch(/^ol-\d+$/)
  })
  it('subtracts with a negative amount — a correction, not a second mechanism', () => {
    setRole('admin')
    const before = bal('dusk', 'fcl')
    expect(grantTo(['dusk'], 'fcl', -3, '2026-09-06', '')).toBeNull()
    expect(bal('dusk', 'fcl')).toBe(before - 3)
  })
  it('still demands a reason for OIL — the tracker\'s rule, unchanged', () => {
    setRole('admin')
    expect(reasonRequired('oil')).toBe(true)
    expect(reasonRequired('ccl')).toBe(false)
    expect(grantTo(['ramp'], 'oil', 1, '2026-09-06', '')).toBe('Give a reason')
    expect(grantTo(['ramp'], 'oil', 1, '2026-09-06', 'Det recovery')).toBeNull()
  })
  it('takes halves only, on every pool — the tracker included', () => {
    setRole('admin')
    expect(grantTo(['ramp'], 'ccl', 1.25, '2026-09-06', '')).toBe(HALF_STEP_MSG)
    expect(grantOil(['ramp'], 0.3, '2026-09-06', 'x')).toBe(HALF_STEP_MSG)
    expect(grantTo(['ramp'], 'ccl', 1.5, '2026-09-06', '')).toBeNull()
    expect(grantTo(['ramp'], 'ccl', -0.5, '2026-09-06', '')).toBeNull()
  })
  it('keeps every other refusal: no people, zero, a bad date, an unknown person', () => {
    setRole('admin')
    expect(grantTo([], 'ccl', 1, '2026-09-06', '')).toBe('Pick at least one person')
    expect(grantTo(['nobody'], 'ccl', 1, '2026-09-06', '')).toBe('Pick at least one person')
    expect(grantTo(['ramp'], 'ccl', 0, '2026-09-06', '')).toBe('The amount must be a number other than 0')
    expect(grantTo(['ramp'], 'ccl', 1, '6 Sep', '')).toBe('Pick a date')
  })
  it('writes N people in ONE undo step', () => {
    setRole('admin')
    const n = getState().ledger.length
    expect(grantTo(['ramp', 'dusk', 'miles', 'dusk'], 'pl', 1, '2026-09-06', '')).toBeNull()
    expect(getState().ledger.length).toBe(n + 3)
    lwUndo()
    expect(getState().ledger.length).toBe(n)
  })
  it('an edit keeps the pool\'s own reason rule', () => {
    setRole('admin')
    grantTo(['ramp'], 'ccl', 2, '2026-09-06', 'top-up')
    const ccl = getState().ledger.filter(x => x.personId === 'ramp' && x.counter === 'ccl').at(-1)!
    expect(updateLedgerEntry(ccl.id, { reason: '' })).toBeNull()
    grantOil(['ramp'], 1, '2026-09-06', 'weekend')
    const oil = getState().ledger.filter(x => x.personId === 'ramp' && x.counter === 'oil').at(-1)!
    expect(updateLedgerEntry(oil.id, { reason: '' })).toBe('Give a reason')
    expect(updateLedgerEntry(oil.id, { amount: 0.75 })).toBe(HALF_STEP_MSG)
  })
})
```

Append to `counters.test.ts`:

```ts
describe('selectableFigure and grantsFor (the figures bar, 6 Sep 26)', () => {
  it('selects every balance, OIL included, and never a total', () => {
    const by = Object.fromEntries(FIGURES.map(f => [f.id, selectableFigure(f)]))
    expect(by).toEqual({ lve: true, oil: true, ccl: true, fcl: true, cl: true, pl: true, lvetot: false, medtot: false })
    expect(selectableFigure(undefined)).toBe(false)
  })
  it('lists a person\'s entries on one pool, oldest first, and no other pool\'s', () => {
    const ledger: Ledger = [
      { id: 'ol-2', personId: 'a', counter: 'ccl', amount: 1, date: '2026-03-02', reason: '', approvedBy: 'admin' },
      { id: 'ol-1', personId: 'a', counter: 'ccl', amount: 2, date: '2026-01-05', reason: 'x', approvedBy: 'admin' },
      { id: 'ol-3', personId: 'a', counter: 'oil', amount: 1, date: '2026-01-01', reason: 'y', approvedBy: 'admin' },
      { id: 'ol-4', personId: 'b', counter: 'ccl', amount: 1, date: '2026-01-01', reason: '', approvedBy: 'admin' },
    ]
    expect(grantsFor(ledger, 'a', 'ccl').map(e => e.id)).toEqual(['ol-1', 'ol-2'])
    expect(grantsFor(ledger, 'a', 'fcl')).toEqual([])
  })
})
```

- [ ] **Step 2: Run them — they must fail on the missing exports**

Run: `cd raptor-port && npx vitest run src/leavewar/state/store.test.ts src/leavewar/engine/counters.test.ts`
Expected: FAIL — `grantTo`/`reasonRequired`/`HALF_STEP_MSG`/`selectableFigure`/`grantsFor` are not exported.

- [ ] **Step 3: Implement the store side**

In `store.ts`, replace `ledgerProblem` and `grantOil` (keep every comment that still holds; add the why):

```ts
/** Days come in HALVES — a half day (HO) is the smallest thing the grid ever
 *  charges, so a credit of 0.3 could never be drawn against. One rule for every
 *  pool, the tracker's included (owner, 6 Sep 26). */
const isHalfStep = (n: number) => Math.abs(n * 2 - Math.round(n * 2)) < 1e-9
export const HALF_STEP_MSG = 'Days come in halves — 1, 1.5, 2 …'

/** Which pools NEED a reason on a credit. OIL keeps the tracker's rule — a
 *  credit with no reason is the untraceable free text the ledger replaced;
 *  the other pools take a bare number from the grid (owner, 6 Sep 26 —
 *  "reason only for OIL"). ONE predicate: the writer, the edit path and the
 *  credit form all read it. */
export const reasonRequired = (counter: CounterName): boolean => counter === 'oil'

/** The sentence that stops a bad ledger write, or null. Stricter than the
 *  boot reader (which tolerates any string date and a zero amount, so an
 *  older stored ledger still loads): a NEW entry with no date or nothing in
 *  it is a mistake worth telling the admin about. */
function ledgerProblem(counter: CounterName, amount: number, date: string, reason: string, givenBy = ''): string | null {
  if (!Number.isFinite(amount) || amount === 0) return 'The amount must be a number other than 0'
  if (!isHalfStep(amount)) return HALF_STEP_MSG
  if (!ISO_DAY.test(date)) return 'Pick a date'
  const clean = reason.trim()
  if (!clean && reasonRequired(counter)) return 'Give a reason'
  if (clean.length > MAX_REASON) return `A reason is at most ${MAX_REASON} characters`
  if (givenBy.trim().length > MAX_GIVEN_BY) return `Given by is at most ${MAX_GIVEN_BY} characters`
  return null
}

/**
 * Credit a pool to one or many people at once — the tracker's "credit N
 * people" (owner: "drag and select all WSOs to put OIL, date and reason"),
 * and since 6 Sep 26 the figures bar's "+2 for everyone I dragged" on ANY
 * balance. A NEGATIVE amount is a correction, not a second mechanism
 * (§Counters). Returns the error sentence for the form, or null on success.
 * One state write for the whole batch → one persist, one undo step.
 */
export function grantTo(personIds: string[], counter: CounterName, amount: number, date: string, reason: string, givenBy = ''): string | null {
  if (state.role !== 'admin') return `Only an admin can credit ${counterLabel(counter)}`
  const ids = [...new Set(personIds)].filter(id => state.people.some(p => p.id === id))
  if (!ids.length) return 'Pick at least one person'
  const problem = ledgerProblem(counter, amount, date, reason, givenBy)
  if (problem) return problem
  const approvedBy = approverName()
  const by = givenBy.trim()
  let n = ledgerSeq()
  const entries: Ledger = ids.map(personId => ({
    id: `ol-${++n}`, personId, counter, amount, date, reason: reason.trim(), approvedBy,
    ...(by ? { givenBy: by } : {}),
  }))
  state = withCurrent({ ...state, ledger: [...state.ledger, ...entries] })
  persist()
  notify()
  return null
}

/** The OIL case of `grantTo` — kept so the tracker and its tests read as they
 *  always did. */
export function grantOil(personIds: string[], amount: number, date: string, reason: string, givenBy = ''): string | null {
  return grantTo(personIds, 'oil', amount, date, reason, givenBy)
}
```

In `updateLedgerEntry` change the call to `ledgerProblem(cur.counter, amount, date, reason, givenBy)`. Import `counterLabel` from `../engine/counters` if it is not already imported. `readLedger` needs no change — it already accepts any string reason (note this in a one-line comment beside its `reason` check: "a blank reason is a plain-pool credit from the grid since 6 Sep 26").

- [ ] **Step 4: Implement the engine side**

In `counters.ts` after `figureLines`:

```ts
/** A figure an admin can credit from the grid: every balance that names a
 *  counter — OIL included, whose grant is the tracker's own record. Totals
 *  (and headers, which are not figures) never. ONE predicate: the gesture, the
 *  bar and their tests read it, never a literal list of ids. Deliberately NOT
 *  the person sheet's `settable` (that excludes OIL, because SET moves an
 *  opening figure and OIL's opening belongs to the tracker). */
export const selectableFigure = (f: Figure | undefined): f is Figure & { counter: CounterName } => !!f?.counter

/** The entries behind a person's "granted" line on one pool, oldest first —
 *  the breakdown itemises them, so a +2 keyed from the grid is explained (who,
 *  when, and the reason when one was given). Ties (one batch = one date) keep
 *  their written order by id. */
export function grantsFor(ledger: Ledger, personId: string, counter: CounterName): LedgerEntry[] {
  return ledger
    .filter(e => e.personId === personId && e.counter === counter)
    .sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id, undefined, { numeric: true }))
}
```

- [ ] **Step 5: Run the two files, then the whole leavewar project**

Run: `npx vitest run src/leavewar/state/store.test.ts src/leavewar/engine/counters.test.ts` → PASS. Then `npx vitest run --project leavewar` → every existing test still green (the tracker's own tests go through `grantOil`, whose messages are unchanged; if any existing test credited a non-half amount, that test was asserting a value the owner has now ruled out — report it, do not weaken it without saying so).

- [ ] **Step 6: Commit**

```bash
git add raptor-port/src/leavewar/state/store.ts raptor-port/src/leavewar/state/store.test.ts raptor-port/src/leavewar/engine/counters.ts raptor-port/src/leavewar/engine/counters.test.ts
git commit -m "feat(leavewar): grantTo credits any pool — one writer, halves only, a reason for OIL alone"
```

---

### Task 2: The figure selection gesture

**Files:**
- Modify: `raptor-port/src/leavewar/ui/select.ts` (`GestureSpec` 138–159, `clearPaint`/`paintIds` 177–186, `arm` 266–300, `finish` 331–344, `onCancel` 375–378; append `wireFigureSelect` after `wireRowSelect`)
- Modify: `raptor-port/src/leavewar/ui/FigureCell.tsx` (props + the `td`)
- Modify: `raptor-port/src/leavewar/ui/FiguresDrawer.tsx` (`DrawerPersonRow` 91–117, its call at 249)
- Modify: `raptor-port/src/leavewar/ui/Matrix.tsx` (`PersonRow` props/FigureCell 345–353; the band copy 3435–3441; the swipe 803–818; a new bind beside 828–840; the live ctx beside 2900–2919; the clears at 849; `drawerRows`/`FiguresDrawer` mount 3454–3467)
- Modify: `raptor-port/src/leavewar/ui/matrix.css` (after `.mx-wrap.selecting .mx td.selcell` ~1015; after the `.mx-figures .mxband` rules ~2143–2152)
- Test: `raptor-port/src/leavewar/ui/select.test.ts`, new `raptor-port/src/leavewar/ui/figselect.test.tsx`, `raptor-port/e2e/leavewar.spec.ts`

**Interfaces:**
- Consumes: `wireGesture`, `rowRun` (select.ts:491), `selectableFigure` (Task 1), `visibleFigures()`/`figures` (Matrix.tsx:589), `rosterSequence()` (Matrix), `lwHistEpoch` (store), `FigureCell`'s `dataFig`/`dataPerson`.
- Produces: `wireFigureSelect(outer: HTMLElement, ctx: FigureSelectCtx): () => void`; `FigureSelectCtx { order, selectable, enabled, onArm?, onSelect }`; `FigureSelection = { fig: string; ids: string[] }`; `FIGSEL_ATTR = 'data-figsel'`; `FigureCell` prop `selected?: boolean`; `DrawerPersonRow` prop `selFig: string | null`; Matrix state `figSel: FigureSelection | null` + `setFigSel` (Task 3 mounts the bar on it).

- [ ] **Step 1: Write the failing gesture tests**

Append to `select.test.ts` (it already imports `vi`, `wireSelect`; add `wireFigureSelect`, `FIGSEL_ATTR`):

```ts
// The click swallow after an ARMED drag that the browser CANCELLED (6 Sep 26).
// An iOS system gesture — an edge swipe, a notification — cutting a hold short
// fires pointercancel; the trailing click then reached the cell's own onClick
// and opened a sheet over a selection the user thought they had.
describe('wireSelect swallows the click after a cancelled armed drag', () => {
  let wrap: HTMLElement, cell: HTMLElement, teardown: () => void
  const origEFP = document.elementFromPoint
  beforeEach(() => {
    vi.useFakeTimers()
    document.elementFromPoint = () => null
    wrap = document.createElement('div')
    cell = document.createElement('div')
    cell.setAttribute('data-testid', 'cell-ramp-2026-01-06')
    wrap.appendChild(cell)
    document.body.appendChild(wrap)
    teardown = wireSelect(wrap, { order: () => ['ramp'], dates: () => ['2026-01-06'], enabled: () => true, onSelect: () => {} })
  })
  afterEach(() => { teardown(); wrap.remove(); document.elementFromPoint = origEFP; vi.useRealTimers() })
  const press = () => cell.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 1, pointerType: 'touch', clientX: 5, clientY: 5, button: 0 }))
  const cancel = () => cell.dispatchEvent(new PointerEvent('pointercancel', { bubbles: true, pointerId: 1, pointerType: 'touch' }))
  const click = () => { const ev = new MouseEvent('click', { bubbles: true, cancelable: true }); cell.dispatchEvent(ev); return ev.defaultPrevented }

  it('swallows exactly one click after an armed drag is cancelled', () => {
    const seen = vi.fn()
    cell.addEventListener('click', seen)
    press()
    vi.advanceTimersByTime(200)   // the hold armed
    cancel()
    expect(click()).toBe(true)
    expect(seen).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1)     // the one-shot is gone
    expect(click()).toBe(false)
    expect(seen).toHaveBeenCalledTimes(1)
  })
  it('lets the click through when an UN-armed press is cancelled — a plain tap interrupted', () => {
    press()
    cancel()
    expect(click()).toBe(false)
  })
})

// FIGURE SELECT (owner, 6 Sep 26): a run of people down ONE figure column.
// jsdom cannot hit-test, so elementFromPoint answers by y: one row of boxes per
// 20px, three copies of nothing — the point is the run, the anchor's pool and
// the ATTRIBUTE paint.
describe('wireFigureSelect', () => {
  let outer: HTMLElement, teardown: () => void
  const origEFP = document.elementFromPoint
  const order = ['a', 'b', 'c', 'd']
  const box = (fig: string, person: string, y: number) => {
    const td = document.createElement('td')
    td.className = 'bal figbox'
    td.setAttribute('data-fig', fig); td.setAttribute('data-person', person)
    td.dataset.y = String(y)
    return td
  }
  let cells: HTMLElement[]
  const selected = vi.fn()
  beforeEach(() => {
    vi.useFakeTimers()
    selected.mockReset()
    outer = document.createElement('div')
    const table = document.createElement('table'), tb = document.createElement('tbody')
    cells = []
    order.forEach((p, i) => {
      const tr = document.createElement('tr')
      for (const fig of ['lve', 'ccl', 'lvetot']) { const c = box(fig, p, 10 + i * 20); tr.appendChild(c); cells.push(c) }
      tb.appendChild(tr)
      if (i === 1) { const h = document.createElement('tr'); const f = document.createElement('td'); f.className = 'figfill'; h.appendChild(f); tb.appendChild(h) }
    })
    const th = document.createElement('th'); th.className = 'bal fig'; th.setAttribute('data-fig', 'ccl'); tb.appendChild(th)
    table.appendChild(tb); outer.appendChild(table); document.body.appendChild(outer)
    // Rows sit at y = 10 (a), 30 (b), 50 (c), 70 (d); x picks the column. A
    // point within 5px of a row's centre is that row's box in that column;
    // the band between b and c (y 31–49) is the heading — its figfill has no
    // person, which is what hold-last-focus must ride over.
    document.elementFromPoint = (x: number, y: number) => {
      const fig = x < 50 ? 'lve' : x < 100 ? 'ccl' : 'lvetot'
      const hit = cells.find(c => c.getAttribute('data-fig') === fig && Math.abs(Number(c.dataset.y) - y) <= 5)
      return hit ?? (y > 30 && y < 50 ? outer.querySelector('.figfill') : null)
    }
    teardown = wireFigureSelect(outer, {
      order: () => order,
      selectable: id => id !== 'lvetot',
      enabled: () => true,
      onSelect: selected,
    })
  })
  afterEach(() => { teardown(); outer.remove(); document.elementFromPoint = origEFP; vi.useRealTimers() })
  const at = (fig: string, p: string) => cells.find(c => c.getAttribute('data-fig') === fig && c.getAttribute('data-person') === p)!
  const down = (el: Element, x: number, y: number) => el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 1, pointerType: 'mouse', clientX: x, clientY: y, button: 0 }))
  const move = (x: number, y: number) => window.dispatchEvent(new PointerEvent('pointermove', { pointerId: 1, pointerType: 'mouse', clientX: x, clientY: y }))
  const up = () => window.dispatchEvent(new PointerEvent('pointerup', { pointerId: 1, pointerType: 'mouse', button: 0 }))
  const marked = () => cells.filter(c => c.hasAttribute(FIGSEL_ATTR)).map(c => `${c.getAttribute('data-fig')}:${c.getAttribute('data-person')}`)

  it('a mouse drag down the CCL column paints the run as an ATTRIBUTE and hands the pool + people over', () => {
    down(at('ccl', 'a'), 60, 10)
    move(60, 16)                    // past MOUSE_SLOP → armed
    move(60, 70)                    // over d, crossing the heading band
    expect(marked()).toEqual(['ccl:a', 'ccl:b', 'ccl:c', 'ccl:d'])
    up()
    expect(selected).toHaveBeenCalledWith({ fig: 'ccl', ids: ['a', 'b', 'c', 'd'] })
    expect(marked()).toEqual([])   // the gesture's own marks are gone; React owns it now
  })
  it('a pointer straying sideways stays in the anchor\'s pool — one pool per drag', () => {
    down(at('lve', 'b'), 20, 30)
    move(20, 36)                    // armed; no row within 5px, so the run is still b
    move(120, 50)                   // over the TOTAL column's x, on c's row: c is the focus, the pool stays lve
    expect(marked()).toEqual(['lve:b', 'lve:c'])
  })
  it('crossing a heading holds the last person, and the next row extends the run past it', () => {
    down(at('ccl', 'a'), 60, 10)
    move(60, 16); move(60, 30)      // b
    move(60, 40)                    // the heading band: no person under the pointer
    expect(marked()).toEqual(['ccl:a', 'ccl:b'])
    move(60, 50)                    // c
    expect(marked()).toEqual(['ccl:a', 'ccl:b', 'ccl:c'])
  })
  it('a total, a header and a name no longer on the list start nothing', () => {
    down(at('lvetot', 'a'), 120, 10); move(120, 16); move(120, 70); up()
    expect(selected).not.toHaveBeenCalled()
    down(outer.querySelector('th')!, 60, 200); move(60, 206); up()
    expect(selected).not.toHaveBeenCalled()
  })
  it('a finger: the hold arms, locks the page scroll on the outer, and onArm fires', () => {
    const onArm = vi.fn()
    teardown()
    teardown = wireFigureSelect(outer, { order: () => order, selectable: () => true, enabled: () => true, onArm, onSelect: selected })
    at('ccl', 'a').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 2, pointerType: 'touch', clientX: 60, clientY: 10, button: 0 }))
    expect(onArm).not.toHaveBeenCalled()
    vi.advanceTimersByTime(200)
    expect(onArm).toHaveBeenCalledTimes(1)
    expect(outer.style.touchAction).toBe('none')
    expect(outer.classList.contains('selecting')).toBe(true)
  })
  it('the mark survives a className rewrite — the reason it is an attribute', () => {
    down(at('ccl', 'a'), 60, 10); move(60, 16)
    at('ccl', 'a').className = 'bal figbox flash'   // what a React re-render does mid-drag
    expect(at('ccl', 'a').hasAttribute(FIGSEL_ATTR)).toBe(true)
  })
})
```

- [ ] **Step 2: Run it — must fail on the missing export**

Run: `npx vitest run src/leavewar/ui/select.test.ts`
Expected: FAIL — `wireFigureSelect`/`FIGSEL_ATTR` not exported; the swallow test fails on `click()` being `false` after a cancel.

- [ ] **Step 3: The core changes in select.ts**

`GestureSpec` (replace `node`/`cls` docs, add three optional members):

```ts
  /** The node an id paints on, inside `wrap` — or, for a thing drawn in more
   *  than one place (a figure box has a real cell, the band's copy and a
   *  drawer box), `nodes`: every copy. Either one. */
  node?: (id: string) => Element | null
  nodes?: (id: string) => Element[]
  /** The class a painted node wears. `mark` replaces it when the node's
   *  className is React's to rewrite on every render (FigureCell rebuilds
   *  `wide`/`flash` on every store change): an attribute React never rendered
   *  survives that rewrite; a class painted from outside does not. */
  cls: string
  mark?: (el: Element, on: boolean) => void
  /** Fires the moment the drag ARMS (a finger's hold landed, a mouse crossed
   *  the slop): a caller's chance to tell a sibling gesture to stand down. */
  onArm?: () => void
```

Painting:

```ts
  const nodesOf = (id: string): Element[] => {
    if (spec.nodes) return spec.nodes(id)
    const n = spec.node?.(id)
    return n ? [n] : []
  }
  const markEl = (el: Element, on: boolean) => { if (spec.mark) spec.mark(el, on); else el.classList.toggle(spec.cls, on) }
  const clearPaint = () => {
    for (const id of painted) for (const el of nodesOf(id)) markEl(el, false)
    painted = new Set()
  }
  const paintIds = (ids: string[]) => {
    const want = new Set(ids)
    for (const id of painted) if (!want.has(id)) for (const el of nodesOf(id)) markEl(el, false)
    for (const id of want) if (!painted.has(id)) for (const el of nodesOf(id)) markEl(el, true)
    painted = want
  }
```

`arm()`: after `repaint()` add `spec.onArm?.()`.

The swallow, lifted out of `finish` so a cancelled armed drag gets it too:

```ts
  // Swallow the click the browser fires on the anchor after this pointer
  // ends: after a COMMITTED drag (its single-cell onClick would open the
  // wrong sheet) and, since 6 Sep 26, after a CANCELLED armed one — an iOS
  // system gesture cutting a hold short fires pointercancel, and the trailing
  // click then opened a breakdown over a selection the user thought they had.
  // One-shot AND a 0ms sweep, so a drag that produces no trailing click never
  // leaves a listener to eat the next real one.
  const swallowNextClick = () => {
    const swallow = (ev: Event) => { ev.stopPropagation(); ev.preventDefault() }
    document.addEventListener('click', swallow, { capture: true, once: true })
    setTimeout(() => document.removeEventListener('click', swallow, true), 0)
  }
  const finish = (commit: boolean) => {
    const wasArmed = armed
    // Read the selection BEFORE teardown nulls the anchor.
    const s = commit && armed && anchor !== null ? current() : null
    teardown()
    if (wasArmed) swallowNextClick()
    if (s) spec.onSelect(s.payload)
    clearPaint()
  }
  const onCancel = (e: PointerEvent) => {
    if (e.pointerId !== pid) return   // a second pointer's cancel is not ours
    const wasArmed = armed
    teardown(); clearPaint()
    if (wasArmed) swallowNextClick()
  }
```

Then append the third caller:

```ts
/* ---- FIGURE SELECT (the counter column and the figures drawer, owner 6 Sep
   26 — "drag as many as I like and key one number into them all") ----------
   A run of PEOPLE down ONE figure column. The anchor's figure fixes the pool
   (the run never widens sideways — one pool per drag, the owner's call); the
   focus is whichever person's box is under the pointer, in any of a box's
   three copies (the real cell, the band's copy, a drawer box), all addressed
   by `data-fig` + `data-person`. Bound on `.mx-outer`, the one ancestor of all
   three. Painted as an ATTRIBUTE (`data-figsel`), never a class — FigureCell
   rebuilds its className on every store change, which is exactly the moment
   Save lands. A heading, a sub-heading or an event row under the pointer
   holds the last person (`lastFocus`), the grid's own rule. */
export interface FigureSelectCtx {
  order: () => string[]                     // person ids, top → bottom, people only
  selectable: (figId: string) => boolean    // a balance with a counter; a total never
  enabled: () => boolean
  onArm?: () => void
  onSelect: (sel: FigureSelection) => void
}
export type FigureSelection = { fig: string; ids: string[] }
type FigAnchor = { fig: string; person: string }
export const FIGSEL_ATTR = 'data-figsel'
const FIGBOX = 'td.figbox[data-fig][data-person]'

const figBoxOf = (el: Element | null | undefined): FigAnchor | null => {
  const box = el?.closest?.(FIGBOX)
  return box ? { fig: box.getAttribute('data-fig')!, person: box.getAttribute('data-person')! } : null
}
const figBoxAt = (x: number, y: number) => figBoxOf(document.elementFromPoint(x, y))

export function wireFigureSelect(outer: HTMLElement, ctx: FigureSelectCtx): () => void {
  let lastFocus: string | null = null
  return wireGesture<FigAnchor, FigureSelection>(outer, {
    enabled: ctx.enabled,
    cls: 'figsel',   // unused — `mark` paints the attribute
    nodes: id => {
      const i = id.indexOf(':')
      return Array.from(outer.querySelectorAll(`td.figbox[data-fig="${id.slice(0, i)}"][data-person="${id.slice(i + 1)}"]`))
    },
    mark: (el, on) => { if (on) el.setAttribute(FIGSEL_ATTR, '1'); else el.removeAttribute(FIGSEL_ATTR) },
    reset: () => { lastFocus = null },
    onArm: ctx.onArm,
    hit: el => {
      const box = figBoxOf(el)
      return box && ctx.selectable(box.fig) && ctx.order().includes(box.person) ? box : null
    },
    current: (anchor, x, y) => {
      const hit = figBoxAt(x, y)
      if (hit && ctx.order().includes(hit.person)) lastFocus = hit.person
      const run = rowRun(ctx.order(), anchor.person, lastFocus ?? anchor.person)
      return run ? { ids: run.map(p => `${anchor.fig}:${p}`), payload: { fig: anchor.fig, ids: run } } : null
    },
    onSelect: ctx.onSelect,
  })
}
```

Update the file's header comment (the "two callers" sentence at ~133–137) to say three.

- [ ] **Step 4: Run the gesture tests — PASS; then the whole file**

Run: `npx vitest run src/leavewar/ui/select.test.ts` → every test green, the old ones included (the `node`-based callers are untouched by `nodesOf`).

- [ ] **Step 5: FigureCell renders the committed selection**

In `FigureCell.tsx` add the prop and the attribute:

```ts
  /** The committed selection (Matrix `figSel`) — rendered as `data-figsel` so
   *  the highlight survives this cell's own re-render. Mid-drag the gesture
   *  writes the SAME attribute imperatively; React leaves it alone because this
   *  prop has not changed, and takes it over the moment the drag commits. */
  selected?: boolean
```

and on the `<td>`: `data-figsel={selected ? '1' : undefined}`.

`FiguresDrawer.tsx`: `DrawerPersonRow` gains `selFig: string | null` (the selected figure's id when this person is in the selection, else null) and passes `selected={selFig === f.id}` to each `FigureCell`; `FiguresDrawer` gains `selFor: (personId: string) => string | null` and calls `<DrawerPersonRow … selFig={selFor(r.p.id)} />`. Keep the memo honest: `selFig` is a primitive, so only rows whose value flips re-render.

- [ ] **Step 6: Matrix — addressing, the bind, the state, the clears, the swipe stand-down**

1. The real cell (Matrix.tsx:345–353) and the band copy (3435–3441) pass `dataFig={shown.id} dataPerson={p.id}` and `selected={…}`. `PersonRow` gets a new prop `figSel: string | null` (this row's selected figure id or null), threaded from the roster map where `PersonRow` is rendered (grep `<PersonRow`); the band copy reads the same value inline.
2. State + bind, beside the existing `selCtxRef` block (828–840):

```ts
  // FIGURE SELECT (owner, 6 Sep 26): a run of people down one figure column,
  // for the docked balance bar (BalanceBar). Bound on `.mx-outer` — the one
  // ancestor of the real column, the band's copy and the drawer — so a drag
  // works on whichever copy of a box the finger is on. Live state through a
  // ref, like the day grid's; the committed selection is React state so the
  // highlight survives the re-render Save causes.
  const [figSel, setFigSel] = useState<FigureSelection | null>(null)
  const figSelCtxRef = useRef<FigureSelectCtx | null>(null)
  // Set the instant a figure drag ARMS during a touch: the counter column's
  // swipe-to-cycle (onTouchEnd) must stand down for that touch, or a slow
  // hold-and-drag that travelled 40px sideways would flip the column under
  // the selection it just made.
  const figArmed = useRef(false)
  useEffect(() => {
    const o = mxOuterRef.current
    if (!o) return
    return wireFigureSelect(o, {
      order: () => figSelCtxRef.current?.order() ?? [],
      selectable: id => figSelCtxRef.current?.selectable(id) ?? false,
      enabled: () => figSelCtxRef.current?.enabled() ?? false,
      onArm: () => { figArmed.current = true },
      onSelect: s => figSelCtxRef.current?.onSelect(s),
    })
  }, [])
```

(`mxOuterRef` is declared at 855 — move the declaration above this effect, or place the effect after it; the effect runs after mount either way.)

3. The live ctx, beside `selCtxRef.current = {…}` (2900–2919):

```ts
  figSelCtxRef.current = {
    order: () => rosterSequence().filter(r => r.kind === 'person').map(r => (r as { p: Person }).p.id),
    selectable: id => selectableFigure(figures.find(f => f.id === id)),
    enabled: () => role === 'admin' && !arranging && !moveSel && !eventMoveSel,
    // A second drag in the SAME pool adds to the selection; one in another pool
    // starts over (owner, 6 Sep 26 — one pool per drag).
    onSelect: s => setFigSel(prev => (prev && prev.fig === s.fig ? { fig: s.fig, ids: [...new Set([...prev.ids, ...s.ids])] } : s)),
  }
  // The selection in roster order, and its figure — the bar's two inputs. A
  // figure hidden after the drag, or a person gone from the roster, drops out.
  const figSelFigure = figSel ? figures.find(f => f.id === figSel.fig) : undefined
  const figSelIds = figSel ? figSelCtxRef.current.order().filter(id => figSel.ids.includes(id)) : []
```

4. Clears: extend the effect at 849 to also `setFigSel(null)`, and add `figuresOpen` to its deps in a SEPARATE effect (the existing one must keep its own dep list — a drawer toggle must not drop a day selection): `useEffect(() => { setFigSel(null) }, [period.stage, period.id, histEpoch, figuresOpen])`.
5. The swipe: `onTouchStart` sets `figArmed.current = false` first; `onTouchEnd`, right after reading `swipe.current`, adds:

```ts
    // A hold-and-drag that ARMED a figure selection during this touch is not a
    // swipe, however far the finger travelled: the select owns it (6 Sep 26).
    if (figArmed.current) { figArmed.current = false; return }
```

6. Drawer mount (3454–3467): pass `selFor={id => (figSel && figSel.ids.includes(id) ? figSel.fig : null)}`. The rows: `figSel={figSel && figSel.fig === shown.id && figSel.ids.includes(p.id) ? shown.id : null}` for the real cell and the band copy (the closed column shows ONE figure, so only a selection on that figure lights it).

Imports: `wireFigureSelect, type FigureSelectCtx, type FigureSelection` from `./select`; `selectableFigure` from `../engine/counters`.

- [ ] **Step 7: CSS**

After `.mx-wrap.selecting .mx td.selcell` (matrix.css ~1015):

```css
/* The FIGURE selection (owner, 6 Sep 26) — the day grid's recipe, keyed on an
   ATTRIBUTE: the box's className is React's (rebuilt from `wide`/`flash` on
   every store change), so a class painted by the gesture would be wiped at
   the very moment Save re-renders the row. `.mx-outer.selecting` is the
   armed-drag brightening, the same beat the day grid's `.mx-wrap.selecting`
   carries — a phone user must SEE the hold land. */
.mx td.figbox[data-figsel] {
  background: rgba(59, 198, 232, .22);
  box-shadow: inset 0 0 0 1px rgba(59, 198, 232, .6);
}
.mx-outer.selecting .mx td.figbox[data-figsel] {
  background: rgba(59, 198, 232, .34);
  box-shadow: inset 0 0 0 2px rgba(59, 198, 232, .95);
}
```

After `.mx-outer.mx-figures .mxband { z-index: 6; }` (~2152):

```css
/* With the figures open the band stands ABOVE the drawer (z-index 6 over 5,
   for the heading labels) and, once the grid has scrolled sideways, takes the
   pointer — so its hidden `td.bal` column's ROW answered a press meant for the
   drawer's first column (6 Sep 26). Only the band's names and headings take
   the pointer while the figures are open; everything else lets it through to
   the drawer box underneath. The band root's inline pointer-events (Matrix
   onWrapScroll) is untouched — this rules its table. */
.mx-outer.mx-figures .mxband table { pointer-events: none; }
.mx-outer.mx-figures .mxband td.who,
.mx-outer.mx-figures .mxband td.grphd { pointer-events: auto; }
```

- [ ] **Step 8: The Matrix-level unit test**

New `figselect.test.tsx` (model the harness on `ui/counters.test.tsx`: `initStore(memoryBackend())`, `setRole`, render `<Matrix …>` the way that file does; stub `document.elementFromPoint` to answer the closed column's cells by y from their `getBoundingClientRect` — jsdom returns zeros, so key the stub on a `data-y` you set on the two cells under test, as in `select.test.ts`). Cases:

1. **admin drag down the closed column commits a selection** — pointerdown on `[data-testid="bal-<first>"]` (mouse), two moves, pointerup; afterwards the two real cells carry `data-figsel="1"` (React-owned) and `lwHistEpoch` is unchanged (nothing written yet).
2. **a member's drag does nothing** — `setRole('member')`, same drag, no `[data-figsel]`.
3. **Undo, a stage change and the drawer toggle clear it** — after (1), `lwUndo()` → no `[data-figsel]`; re-select, click `[data-testid="figures-toggle"]` → cleared.
4. **the swipe stands down for an armed touch** — fake timers; touchstart on a `.bal` cell + pointerdown (touch) on the same cell; `advanceTimersByTime(200)`; pointerup; touchend 60px to the right → the column header still reads the same figure (`[data-testid="counter-pick"]` text unchanged); then the plain quick swipe (touchstart + touchend, no hold) still cycles.
5. **a store write mid-selection keeps the highlight** — after (1), `setBalance(<first>, 'annual', 9)` (an unrelated admin write that re-renders every row) → the two cells still carry `data-figsel`.

Run: `npx vitest run src/leavewar/ui/figselect.test.tsx` → PASS. Then `npx vitest run --project leavewar`.

- [ ] **Step 9: The e2e that can SEE it**

In `e2e/leavewar.spec.ts`, beside the drawer tests (~1230+), add a helper and three tests:

```ts
/** A mouse drag from one figure box to another (a run down one column). The
 *  boxes are addressed by figure + person on every copy (the real column, the
 *  band's copy, the drawer). */
async function dragFigures(page: Page, from: Locator, to: Locator) {
  const a = (await from.boundingBox())!
  const b = (await to.boundingBox())!
  await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2)
  await page.mouse.down()
  await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2 + 6)   // past MOUSE_SLOP
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 6 })
  await page.mouse.up()
}
```

1. `'a drag down a drawer column lights the run, on that pool only'` (desktopOnly): `lwRole(page, 'admin')`, `openDrawer(page)`, drag from `figdrawer td.figbox[data-fig="ccl"][data-person="<p1>"]` to `[data-person="<p3>"]` (three consecutive people from the seed roster — read `[data-testid^="row-"]` order in the page to pick them); expect `figdrawer td[data-figsel]` count 3 and every one `[data-fig="ccl"]`; `window.scrollY` unchanged.
2. `'a drag on a total, or by a member, lights nothing'` (desktopOnly): the same drag on `[data-fig="lvetot"]` → 0; `lwRole(page, 'member')` then the CCL drag → 0 and the breakdown sheet did NOT open (`[data-testid="figure-breakdown"]` count 0 — the click after a non-drag is a plain click; assert it opens for a plain click instead: `click()` on a box → the sheet).
3. `'the band lets a press through to the drawer once the grid has scrolled'` (phone only, `test.skip(!isPhone())`): `lwRole('admin')`, `openDrawer`, scroll `.mx-wrap` to `scrollLeft = 300` and `settleGrid`; take the drawer's first column box for `<p1>` and its centre point; `page.evaluate(([x, y]) => document.elementFromPoint(x, y)?.closest('.mxdrawer td.figbox')?.getAttribute('data-person'), [x, y])` → `<p1>`.
4. `'a finger's hold-and-drag down the drawer lights the run and does not scroll the page'` (phone only): CDP —

```ts
  const cdp = await page.context().newCDPSession(page)
  const a = (await from.boundingBox())!, b = (await to.boundingBox())!
  const x = a.x + a.width / 2
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y: a.y + a.height / 2 }] })
  await page.waitForTimeout(260)   // past HOLD
  for (let i = 1; i <= 6; i++) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: a.y + a.height / 2 + ((b.y - a.y) * i) / 6 }] })
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
```

then expect `[data-figsel]` count ≥ 2 and `window.scrollY` unchanged. **If this cannot arm in headless Chromium**, prove it first on a bare page (a `pointerdown` listener logging `pointerType` for a CDP touch), then keep the test as `test.fixme(<reason>)` with the probe's finding in its comment, and say so in the report — the live drive and the owner's iPhone carry it (Task 4 records it in known-gaps and BUG-TESTING #373). Never let it pass by asserting nothing.

Run (against a fresh build + preview): `npx playwright test e2e/leavewar.spec.ts --project=lw-desktop --grep "drawer column|lights nothing"` and `--project=lw-phone --grep "band lets|hold-and-drag"`. Then the whole drawer block on both projects (`--grep "drawer|figure"`).

- [ ] **Step 10: Commit**

```bash
git add raptor-port/src/leavewar/ui/select.ts raptor-port/src/leavewar/ui/select.test.ts raptor-port/src/leavewar/ui/FigureCell.tsx raptor-port/src/leavewar/ui/FiguresDrawer.tsx raptor-port/src/leavewar/ui/Matrix.tsx raptor-port/src/leavewar/ui/matrix.css raptor-port/src/leavewar/ui/figselect.test.tsx raptor-port/e2e/leavewar.spec.ts
git commit -m "feat(leavewar): a drag down one figure column selects a run of people, on every copy of the box"
```

---

### Task 3: The docked balance bar

**Files:**
- Create: `raptor-port/src/leavewar/ui/CreditForm.tsx` (moved `DayChip` 151–179 and `CreditForm` 181–240 from OilTracker.tsx, generalised)
- Create: `raptor-port/src/leavewar/ui/BalanceBar.tsx`
- Modify: `raptor-port/src/leavewar/ui/OilTracker.tsx` (imports; the `CreditForm` call at 797 passes `counter="oil"` and `who`)
- Modify: `raptor-port/src/leavewar/ui/Matrix.tsx` (mount beside the `SelectSheet` at 3523; the outside-tap/Escape effect)
- Modify: `raptor-port/src/leavewar/ui/CounterSheet.tsx` (`FigureBreakdownSheet` 214–261)
- Modify: `raptor-port/src/leavewar/ui/matrix.css` (`.mv-banner` 1975–1989 → the shared recipe), `raptor-port/src/leavewar/ui/bidpicker.css` (`.bdgrants`)
- Test: new `raptor-port/src/leavewar/ui/balancebar.test.tsx`, `raptor-port/src/leavewar/ui/counters.test.tsx`, `raptor-port/src/leavewar/ui/oiltracker.test.tsx` (if a test types into `oil-amt` as a number input, it now types text — same values), `raptor-port/e2e/leavewar.spec.ts`

**Interfaces:**
- Consumes: `grantTo`, `reasonRequired`, `HALF_STEP_MSG`, `MAX_REASON`, `MAX_GIVEN_BY`, `figureCtxOf` (store), `grantsFor`, `selectableFigure`, `Figure` (counters), `figSel`/`figSelFigure`/`figSelIds`/`setFigSel` (Task 2), `shortDate` (`./dates`), `RangePicker`; `today` is `figureCtxOf().asOf!` exactly as `OilTracker.tsx:257` reads it.
- Produces: `CreditForm({ counter, ids, who, today, initialAmount?, autoFocus?, onDone, onCancel? })`, `DayChip` (unchanged API), `parseAmount(raw: string, sign?: 1 | -1): number | null`; `BalanceBar({ figure, ids, onDone, onClose })` with `data-testid="balance-bar"`.

- [ ] **Step 1: Failing tests for the parser and the bar**

New `balancebar.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { initStore, memoryBackend, setRole, getState } from '../state/store'
import { FIGURES } from '../engine/counters'
import { parseAmount } from './CreditForm'
import { BalanceBar } from './BalanceBar'

describe('parseAmount — 2 and +2 add, -2 subtracts (owner, 6 Sep 26)', () => {
  it.each([
    ['2', 1, 2], ['+2', 1, 2], ['-2', 1, -2], ['−2', 1, -2], ['2.5', 1, 2.5], ['.5', 1, 0.5],
    ['2', -1, -2], ['+2', -1, 2], ['-2', -1, -2],   // a typed sign beats the chip
    ['', 1, null], ['abc', 1, null], ['2-', 1, null], ['1,5', 1, null],
  ])('%s with sign %s → %s', (raw, sign, want) => {
    expect(parseAmount(raw, sign as 1 | -1)).toBe(want)
  })
})

describe('BalanceBar', () => {
  beforeEach(() => { initStore(memoryBackend()); setRole('admin') })
  const ccl = FIGURES.find(f => f.id === 'ccl')! as any
  const oil = FIGURES.find(f => f.id === 'oil')! as any

  it('names the count and the pool, opens EMPTY, and writes one entry per person on Save', () => {
    const onDone = vi.fn()
    render(<BalanceBar figure={ccl} ids={['ramp', 'dusk']} onDone={onDone} onClose={() => {}} />)
    expect(screen.getByTestId('oil-credit-who').textContent).toBe('2 people · +CCL')
    const amt = screen.getByTestId('oil-amt') as HTMLInputElement
    expect(amt.value).toBe('')
    expect(screen.queryByTestId('oil-reason')).toBeNull()   // a plain pool: the number only
    fireEvent.change(amt, { target: { value: '2' } })
    fireEvent.click(screen.getByTestId('oil-credit-save'))
    expect(onDone).toHaveBeenCalledTimes(1)
    const mine = getState().ledger.filter(e => e.counter === 'ccl' && ['ramp', 'dusk'].includes(e.personId))
    expect(mine.map(e => e.amount)).toEqual([2, 2])
  })
  it('refuses and KEEPS the selection: empty, zero, a quarter day', () => {
    const onDone = vi.fn()
    render(<BalanceBar figure={ccl} ids={['ramp']} onDone={onDone} onClose={() => {}} />)
    const amt = screen.getByTestId('oil-amt')
    fireEvent.click(screen.getByTestId('oil-credit-save'))
    expect(screen.getByTestId('oil-credit-err').textContent).toMatch(/days/i)
    fireEvent.change(amt, { target: { value: '0' } }); fireEvent.click(screen.getByTestId('oil-credit-save'))
    expect(screen.getByTestId('oil-credit-err').textContent).toBe('The amount must be a number other than 0')
    fireEvent.change(amt, { target: { value: '1.25' } }); fireEvent.click(screen.getByTestId('oil-credit-save'))
    expect(screen.getByTestId('oil-credit-err').textContent).toBe('Days come in halves — 1, 1.5, 2 …')
    expect(onDone).not.toHaveBeenCalled()
    expect(screen.getByTestId('balance-bar')).toBeTruthy()
  })
  it('the sign chip subtracts on a phone keypad that has no minus', () => {
    render(<BalanceBar figure={ccl} ids={['ramp']} onDone={() => {}} onClose={() => {}} />)
    fireEvent.click(screen.getByTestId('oil-sign'))
    fireEvent.change(screen.getByTestId('oil-amt'), { target: { value: '1' } })
    fireEvent.keyDown(screen.getByTestId('oil-amt'), { key: 'Enter' })
    expect(getState().ledger.filter(e => e.counter === 'ccl' && e.personId === 'ramp').at(-1)!.amount).toBe(-1)
  })
  it('OIL brings the tracker\'s full form and its rules', () => {
    render(<BalanceBar figure={oil} ids={['ramp']} onDone={() => {}} onClose={() => {}} />)
    expect(screen.getByTestId('oil-date')).toBeTruthy()
    expect(screen.getByTestId('oil-reason')).toBeTruthy()
    expect(screen.getByTestId('oil-given')).toBeTruthy()
    fireEvent.change(screen.getByTestId('oil-amt'), { target: { value: '1' } })
    fireEvent.click(screen.getByTestId('oil-credit-save'))
    expect(screen.getByTestId('oil-credit-err').textContent).toBe('Give a reason')
  })
  it('✕ closes without writing, and Escape in the amount box does the same', () => {
    const onClose = vi.fn()
    render(<BalanceBar figure={ccl} ids={['ramp']} onDone={() => {}} onClose={onClose} />)
    fireEvent.click(screen.getByTestId('oil-credit-cancel'))
    fireEvent.keyDown(screen.getByTestId('oil-amt'), { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(2)
    expect(getState().ledger.some(e => e.counter === 'ccl' && e.personId === 'ramp')).toBe(false)
  })
})
```

In `counters.test.tsx`, add one case to the breakdown block: as admin, `grantTo(['ramp'], 'ccl', 2, '2026-09-06', '')` then open ramp's CCL breakdown (the way the existing tests open `figure-breakdown`) → `[data-testid="breakdown-grants"]` lists one `[data-testid^="grant-ol-"]` reading `+2 · 6 Sep 26 · by admin`; and an OIL grant with a reason shows the reason.

Extend `figselect.test.tsx` case (1): after the commit the bar is up (`balance-bar` visible, `oil-credit-who` = `2 people · +LVE`); a `pointerdown` on `document.body` (capture) clears both the bar and the marks; a pointerdown on a `td.figbox` does not.

- [ ] **Step 2: Run — fail on the missing modules**

Run: `npx vitest run src/leavewar/ui/balancebar.test.tsx src/leavewar/ui/counters.test.tsx src/leavewar/ui/figselect.test.tsx` → FAIL (`./CreditForm`, `./BalanceBar` missing; no grants list; no bar).

- [ ] **Step 3: `CreditForm.tsx`**

Move `DayChip` verbatim (export it) and rewrite `CreditForm`:

```tsx
/**
 * The typed days, signed: `2` and `+2` add, `-2` (or `−2`) subtracts (owner,
 * 6 Sep 26 — "if I put 2 or +2 it means the same thing, only minus is −2").
 * With no sign typed the `sign` chip decides — a phone's decimal keypad has no
 * minus key, so the chip is the phone's way to a correction. Null for anything
 * that is not a plain number; the STORE rules the rest (non-zero, halves) so
 * this form, the tracker and any future caller cannot disagree with it.
 */
export function parseAmount(raw: string, sign: 1 | -1 = 1): number | null {
  const t = raw.trim().replace(/^−/, '-')
  if (!/^[+-]?\d*\.?\d+$/.test(t)) return null
  const n = Number(t)
  return /^[+-]/.test(t) ? n : n * sign
}

/**
 * The credit form — one amount, a date, a reason, an optional "given by", for
 * one or many people — on OIL (the tracker, and the figures bar's OIL column)
 * and, since 6 Sep 26, on ANY pool from the figures bar, where a plain pool
 * takes the number alone (`reasonRequired`, the store's own predicate — the
 * date is today, the approver is stamped). Its own component so its draft
 * state resets with the people it is for (the caller keys it).
 */
export function CreditForm({ counter, ids, who, today, initialAmount = '1', autoFocus = false, onDone, onCancel }: {
  counter: CounterName
  ids: string[]
  who: ReactNode
  today: string
  /** The tracker opens on `1`; the grid's bar opens EMPTY — a missing number
   *  fails closed, so an idle Enter can never add a day. */
  initialAmount?: string
  autoFocus?: boolean
  onDone: () => void
  /** Present on the grid's bar (its ✕ and Escape); the tracker clears its
   *  selection by an outside tap instead. */
  onCancel?: () => void
}) {
  const full = reasonRequired(counter)
  const [amt, setAmt] = useState(initialAmount)
  const [sign, setSign] = useState<1 | -1>(1)
  const [date, setDate] = useState(today)
  const [reason, setReason] = useState('')
  const [given, setGiven] = useState('')
  const [err, setErr] = useState('')
  const save = () => {
    const n = parseAmount(amt, sign)
    const problem = n === null ? 'Type the days — 2 adds, -2 subtracts' : grantTo(ids, counter, n, date, reason, given)
    if (problem) { setErr(problem); return }
    onDone()
  }
  const keys = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === 'Enter') save()
    if (e.key === 'Escape' && onCancel) { e.stopPropagation(); onCancel() }
  }
  return (
    <div className={`oil-bar form${full ? '' : ' plain'}`} data-testid="oil-credit-panel">
      <b className="oil-who" data-testid="oil-credit-who">{who}</b>
      <button
        className="tchip sign"
        data-testid="oil-sign"
        aria-pressed={sign < 0}
        aria-label={sign < 0 ? 'Subtracting — tap to add instead' : 'Adding — tap to subtract instead'}
        onClick={() => setSign(s => (s < 0 ? 1 : -1))}
      >{sign < 0 ? '−' : '+'}</button>
      <input
        type="text"
        inputMode="decimal"
        className="oil-num"
        data-testid="oil-amt"
        value={amt}
        placeholder="days"
        autoFocus={autoFocus}
        aria-label="Days — 2 or +2 adds, -2 subtracts"
        onChange={e => setAmt(e.target.value)}
        onKeyDown={keys}
      />
      {full && <DayChip testid="oil-date" pickerId="oildate" value={date} today={today} onPick={setDate} />}
      {full && (
        <input className="oil-text" data-testid="oil-reason" maxLength={MAX_REASON} value={reason} placeholder="reason" aria-label="Reason" onChange={e => setReason(e.target.value)} onKeyDown={keys} />
      )}
      {full && (
        <input className="oil-text given" data-testid="oil-given" maxLength={MAX_GIVEN_BY} value={given} placeholder="given by (optional)" aria-label="Given by" onChange={e => setGiven(e.target.value)} onKeyDown={keys} />
      )}
      <button className="dchip approve" data-testid="oil-credit-save" onClick={save}>Save</button>
      {onCancel && <button className="dchip cancel" data-testid="oil-credit-cancel" aria-label="Cancel" onClick={onCancel}>✕</button>}
      {err && <span className="note warn" data-testid="oil-credit-err">{err}</span>}
    </div>
  )
}
```

`OilTracker.tsx`: delete the two moved components, `import { CreditForm, DayChip } from './CreditForm'`, and at 797 pass `counter="oil"` and `who={`OIL credits · ${namesOf(selIds)}`}` (the `names` prop is gone). The `oil-sign` chip now also appears in the tracker's bar — the tracker's CSS for `.tchip` already applies; give `.oil-bar .tchip.sign { min-width: 32px; font-weight: 800 }` in `oiltracker.css` beside the other `.oil-bar` rules.

- [ ] **Step 4: `BalanceBar.tsx`**

```tsx
/**
 * The docked bar after a drag down a figure column (owner, 6 Sep 26): "N
 * people · +CCL", the credit form, Save, ✕. NOT a Sheet — a Sheet's touch
 * shield would swallow presses on the very boxes being selected, and its
 * popup family dismisses on scroll. This is a viewport-docked panel in the
 * move banner's slot and recipe (matrix.css `.balbar`), so it stays up while
 * the grid scrolls under it and sits above a phone's keyboard.
 */
export function BalanceBar({ figure, ids, onDone, onClose }: {
  figure: Figure & { counter: CounterName }
  ids: string[]
  onDone: () => void
  onClose: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  useDockAboveKeyboard(ref)
  // Autofocus the number on a computer only: on a phone the keyboard would
  // cover half the run that was just selected before the person has looked.
  const fine = typeof window.matchMedia === 'function' && window.matchMedia('(pointer: fine)').matches
  const n = ids.length
  return (
    <div className="balbar" data-testid="balance-bar" role="group" aria-label={`${figure.label}: ${n} ${n === 1 ? 'person' : 'people'}`} ref={ref}>
      <CreditForm
        key={`${figure.id}|${ids.join('|')}`}
        counter={figure.counter}
        ids={ids}
        who={<>{n} {n === 1 ? 'person' : 'people'} · <b className="pool">{figure.title}</b></>}
        today={figureCtxOf().asOf!}
        initialAmount=""
        autoFocus={fine}
        onDone={onDone}
        onCancel={onClose}
      />
    </div>
  )
}

/** Keep the bar above the phone's keyboard. A `position: fixed; bottom` panel
 *  is anchored to the LAYOUT viewport, which iOS does not shrink for the
 *  keyboard — the visual viewport does, so the bar's bottom follows that gap
 *  while a keyboard is up. The same threshold as Sheet's own hook, so a URL
 *  bar showing or hiding does not move it. */
function useDockAboveKeyboard(ref: { current: HTMLDivElement | null }) {
  useEffect(() => {
    const vv = window.visualViewport
    const el = ref.current
    if (!vv || !el) return
    const KEY = 120, GAP = 14
    const place = () => {
      const covered = window.innerHeight - vv.height - vv.offsetTop
      el.style.bottom = window.innerHeight - vv.height > KEY ? `${Math.max(0, covered) + GAP}px` : ''
    }
    place()
    vv.addEventListener('resize', place)
    vv.addEventListener('scroll', place)
    return () => { vv.removeEventListener('resize', place); vv.removeEventListener('scroll', place) }
  }, [ref])
}
```

`today` is `figureCtxOf().asOf!` — the tracker's own line (`OilTracker.tsx:257`, `const today = ctx.asOf!`); import `figureCtxOf` from `../state/store`. Do not hand-roll a date.

- [ ] **Step 5: Matrix mounts it; outside tap and Escape clear**

Beside the `SelectSheet` mount (3523):

```tsx
      {/* The balance bar — a drag down one figure column, one number for the
          run (owner, 6 Sep 26). Up while the selection lives; Save writes ONE
          ledger batch (grantTo) and the changed boxes flash on their own. */}
      {figSel && selectableFigure(figSelFigure) && figSelIds.length > 0 && (
        <BalanceBar figure={figSelFigure} ids={figSelIds} onDone={() => setFigSel(null)} onClose={() => setFigSel(null)} />
      )}
```

The clears (beside the `figSel` effects of Task 2):

```ts
  // A press outside the bar and the boxes drops the selection (the tracker's
  // own rule, owner 2 Sep 26 — no Deselect button); a press ON a box is the
  // next drag or a tap for the breakdown, and is left alone. Escape clears it
  // too, unless a sheet is up — the sheet's own Escape goes first.
  useEffect(() => {
    if (!figSel) return
    const onDown = (e: PointerEvent) => {
      const t = e.target as HTMLElement | null
      if (t?.closest('[data-testid="balance-bar"]') || t?.closest('td.figbox[data-fig][data-person]')) return
      setFigSel(null)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || document.querySelector('.bidsheet')) return
      e.stopPropagation()
      setFigSel(null)
    }
    document.addEventListener('pointerdown', onDown, true)
    window.addEventListener('keydown', onKey, true)
    return () => { document.removeEventListener('pointerdown', onDown, true); window.removeEventListener('keydown', onKey, true) }
  }, [figSel])
```

- [ ] **Step 6: The breakdown itemises grants**

In `FigureBreakdownSheet`, compute `const grants = figure.counter ? grantsFor(ctx.ledger, person.id, figure.counter) : []` and, inside the `parts.map`, under the row whose `p.label === 'granted'` when `grants.length > 0`:

```tsx
                {p.label === 'granted' && grants.length > 0 && (
                  <span className="bdgrants" data-testid="breakdown-grants">
                    {grants.map(g => (
                      <span key={g.id} className="bdgrant" data-testid={`grant-${g.id}`}>
                        <b className={g.amount < 0 ? 'neg' : ''}>{g.amount < 0 ? '−' : '+'}{show(Math.abs(g.amount))}</b>
                        {' · '}{shortDate(g.date)}{' · by '}{g.approvedBy}{g.givenBy ? ` (${g.givenBy})` : ''}{g.reason ? ` · ${g.reason}` : ''}
                      </span>
                    ))}
                  </span>
                )}
```

`bidpicker.css`: `.bidsheet .bdgrants { display: flex; flex-direction: column; gap: 2px; padding: 2px 0 4px 12px; font-size: 11px; color: var(--ink-2); } .bidsheet .bdgrant b { color: var(--ink); } .bidsheet .bdgrant b.neg { color: var(--hard); }`.

- [ ] **Step 7: The shared dock recipe**

Replace `.mv-banner { … }` (matrix.css 1975–1989) with the shared rule and keep its children's rules as they are:

```css
/* The two docked panels (the move-mode banner, 27 Aug 26; the balance bar,
   6 Sep 26): pinned to the foot of the viewport so they are reachable while
   the grid scrolls, and LOUD enough to read as a panel that popped up — the
   first cut of the bar "visually blended in with the background" (owner,
   6 Sep 26): a raised ground, a solid accent ring and a glow, and a short
   slide up on entry. One recipe, so the two never drift. */
.mv-banner,
.balbar {
  position: fixed;
  left: 12px;
  bottom: 14px;
  width: min(880px, calc(100vw - 24px));
  box-sizing: border-box;
  z-index: 60;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  padding: 12px 14px;
  background: #1d232b;
  border: 1.5px solid var(--accent);
  border-radius: 14px;
  box-shadow: 0 0 0 4px rgba(59, 198, 232, .16), 0 18px 44px rgba(0, 0, 0, .7);
  animation: lw-dockin 160ms ease-out;
}
@keyframes lw-dockin { from { transform: translateY(12px); opacity: 0; } to { transform: none; opacity: 1; } }
@media (prefers-reduced-motion: reduce) { .mv-banner, .balbar { animation: none; } }
/* The bar hosts the tracker's credit form, whose own rules draw it as a
   strip under a grid (a top rule, a panel ground): inside the bar those go. */
.balbar .oil-bar { border-top: 0; background: transparent; padding: 0; width: 100%; }
.balbar .oil-who { font-size: 13px; font-weight: 800; white-space: nowrap; }
.balbar .oil-who .pool { color: var(--accent); }
.balbar .oil-bar .oil-num { width: 70px; }
.balbar .oil-bar .oil-text { flex: 1 1 150px; min-width: 120px; }
.balbar .oil-bar .oil-text.given { flex: 1 1 130px; min-width: 110px; }
.balbar .dchip.approve { margin-left: auto; }
.balbar .dchip { padding: 7px 16px; border-radius: 999px; font-size: 12px; font-weight: 800; font-family: inherit; }
.balbar .dchip.approve { background: var(--accent); color: #0b1116; border: 0; }
.balbar .dchip.cancel { background: transparent; border: 1px solid var(--edge-2); color: var(--ink-2); width: 30px; height: 30px; padding: 0; }
.balbar .tchip.sign { min-width: 32px; font-weight: 800; }
```

(`.mv-banner .mv-msg`, `.mv-banner .dchip…` rules stay. `.mv-banner`'s old `right: 12px` is replaced by the width — say so in the commit.) `.mv-banner` gains `gap: 8px` where it had 12 — acceptable; re-check the move banner in the live drive.

- [ ] **Step 8: Run the unit files, then the project**

`npx vitest run src/leavewar/ui/balancebar.test.tsx src/leavewar/ui/counters.test.tsx src/leavewar/ui/figselect.test.tsx src/leavewar/ui/oiltracker.test.tsx` → PASS; `npx vitest run --project leavewar` → green.

- [ ] **Step 9: The e2e that can see the bar**

Add to the Task 2 block:

1. `'the bar takes one number for the run and one Undo takes it all back'` (desktopOnly): admin, `openDrawer`, CCL drag over three people → `balance-bar` visible with `oil-credit-who` `3 people · +CCL`; read each box's top number (`.fb` text) before; type `2` in `oil-amt`, press Enter → the bar is gone, each of the three boxes reads +2 and wears `.flash` at some point (poll `[data-fig="ccl"][data-person=…].flash` within 700 ms — assert at least one was seen, or assert the numbers only if the flash is too quick for the poll and say so); click `[data-testid="lw-undo"]` (the grid's own Undo, as the existing undo tests do) → the three numbers are back.
2. `'-1.5 subtracts; 0, abc and 1.25 are refused and the run stays'` (desktopOnly): as above with `-1.5` → numbers −1.5; then a fresh drag, `0` → `oil-credit-err` "…other than 0" and `[data-figsel]` count unchanged; `abc` → the parse message; `1.25` → the halves message.
3. `'OIL from the grid is the tracker's own credit'` (desktopOnly): drag over two people in the OIL column → the bar shows `oil-date`, `oil-reason`, `oil-given`; type `1`, reason `Det`, Save → click `[data-testid="oil-tracker"]` (the top-row button) → a credit box reading `+1` and `Det` for one of them.
4. `'a tap outside clears the bar; putting the drawer away clears it; the bar survives a sideways scroll'` (desktopOnly): drag → bar; `page.mouse.click` on a day cell far right → bar gone (and no bid sheet? a click on a day cell opens the single-cell sheet as ever — assert the bar is gone, then close the sheet with Escape); drag again → click `figures-toggle` → gone; drag again → `scrollTo('.mx-wrap', 600)` + `settleGrid` → the bar is still visible.
5. `'a member never sees the bar'` (both projects): `lwRole('member')`, a drag on the closed column → no bar, no `[data-figsel]`.
6. Phone (`isPhone()`): after the CDP hold-drag of Task 2 (if it arms) → the bar is visible and its `getBoundingClientRect().bottom <= innerHeight`.

Run each with `--grep`, then the whole `figure|drawer|balance` set on both projects.

- [ ] **Step 10: Commit**

```bash
git add raptor-port/src/leavewar/ui/CreditForm.tsx raptor-port/src/leavewar/ui/BalanceBar.tsx raptor-port/src/leavewar/ui/OilTracker.tsx raptor-port/src/leavewar/ui/Matrix.tsx raptor-port/src/leavewar/ui/CounterSheet.tsx raptor-port/src/leavewar/ui/matrix.css raptor-port/src/leavewar/ui/bidpicker.css raptor-port/src/leavewar/ui/oiltracker.css raptor-port/src/leavewar/ui/balancebar.test.tsx raptor-port/src/leavewar/ui/counters.test.tsx raptor-port/src/leavewar/ui/figselect.test.tsx raptor-port/src/leavewar/ui/oiltracker.test.tsx raptor-port/e2e/leavewar.spec.ts
git commit -m "feat(leavewar): the balance bar — one number for the run, the tracker's form for OIL, docked and loud"
```

---

### Task 4: Docs, ceilings, the full gates, the live drive, the push

**Files:**
- Modify: `raptor-port/docs/ui-contracts.md` (a new `## Bulk balance entry from the figures (owner, 6 Sep 26)` right after `## The figures drawer and the two-line box`), `raptor-port/docs/leavewar/known-gaps.md` (§What balances do not yet do — the OIL-precedent paragraph now covers every pool; add the slow-drag-vs-swipe line and, if Task 2's CDP hold could not arm, the "phone hold is device-verified" line), `raptor-port/docs/feature-impact.md` (one entry beside the FIGURES one: the surfaces touched, the two drift seams — `grantTo` and `selectableFigure` — and the undo-through-one-write rule), `HANDOFF.md` (§In flight: one 1–3-line bullet pointing at the contract docs and BUG-TESTING #373; the file map rows for `CreditForm.tsx`/`BalanceBar.tsx`; the `select.ts` row gains "three callers"), `BUG-TESTING.md` (row #373, plain language, ⬜)
- Verify only: `raptor-port/e2e/leavewar.spec.ts` DOM ceilings (413–539) — re-measure with the drawer open + the bar up; the numbers must still sit under 31700 / 31900 / 1100 — if the bar's ~15 nodes cross a line, raise it deliberately with the reason in the assertion's comment.

- **Also covered here, from Tasks 3 and 5 (added 6 Sep 26):** `known-gaps.md` gains, beside the balances section, "a credit on a plain pool (LVE/CCL/FCL/CL/PL) cannot be edited or deleted afterwards — correct it with a negative entry; the tracker's edit/delete covers OIL entries only"; `BUG-TESTING.md` gets TWO rows — #373 the bar (drag a run, the number, Save, Undo, OIL's form, the breakdown's new lines, on phone and computer) and #374 the seven phone fixes (drag a manning row with the grid scrolled — the label stays solid and the row glows; your own row's tint; the Rearrange switch on/off; OIL from the bid picker stays on the grid and warns once at nothing left; the drag scrolls left at the counter and at the drawer's edge); `HANDOFF.md`'s In-flight bullet names the bar AND the batch in 1–3 lines with pointers, its file map gains `ui/CreditForm.tsx` and `ui/BalanceBar.tsx` and the `select.ts` row reads "three callers, `leftEdge`"; `feature-impact.md`'s entry names three drift seams — `grantTo` (the one credit writer), `selectableFigure` (the one "can be credited" predicate) and `leftEdge`/`frozenWidth` (the drag's left band and the month-jump math read the same frozen width); `ui-contracts.md`: after writing the bulk section, READ the five paragraphs Task 5 amended in place (the OIL write, the dragged row, the "View as" row, the Rearrange switch, the drag's edge bands) and make them read as one voice with the new section. The live drive (Step 4) adds the phone MOVE banner in its new dress (Task 3's reviewer could not see it — no phone e2e covers it) and the Rearrange switch after a second tap.

- [ ] **Step 1: Write the contract** (`ui-contracts.md`, in the house voice — what the surface promises, measured, with the pins named): the gesture (bound on `.mx-outer`; three copies; one pool per drag; hold/slop constants unchanged; the attribute paint and why; the swipe stand-down; the band pointer rule), the bar (not a Sheet; the dock recipe shared with the move banner; the sign chip; the amount rule; the empty start; Escape/outside tap/Undo/drawer toggle clears), the record (`grantTo`; reason for OIL only; halves; approver stamp; the breakdown's itemised lines), what stays (Set, the tracker, members). Cross-link the spec.
- [ ] **Step 2: known-gaps, feature-impact, HANDOFF, BUG-TESTING** as listed. HANDOFF stays SHORT — pointers, not restatement.
- [ ] **Step 3: The full gates, from `raptor-port/`, in this order** — `npm test` (both projects; the raptor project's exit code has wandered before with every test green: if so re-run ONCE and say so) · `npm run build` · `node reference/tfin.js` (728/0) · `npm run test:e2e` (all three projects) · `npm run build && npx vite preview --port 4173` then `npm run probes:adapted` and `npm run perf` against it (read the printed timings; the drawer-open engine cost was 25.7 ms at the last measure — it must not have grown) · the impeccable detector over the touched UI files (`node .claude/skills/impeccable/scripts/detect.mjs --json <files>` from the repo root).
- [ ] **Step 4: The live drive** (the CLAUDE.md Playwright recipe, `executablePath: '/opt/pw-browsers/chromium'`, `chromiumSandbox: false`, no proxy): admin at phone and desktop widths — a drag down a drawer column and the bar (plain and OIL), the highlight brightening while armed, Save and the flash, the breakdown's itemised line, the move banner in its new dress; screenshot each and LOOK; report what you saw, including anything off beyond the change (UI faults, openings — the standing UI axis).
- [ ] **Step 5: Commit the docs, push ONCE, hand over the Vercel link**

```bash
git add raptor-port/docs/ui-contracts.md raptor-port/docs/leavewar/known-gaps.md raptor-port/docs/feature-impact.md HANDOFF.md BUG-TESTING.md raptor-port/e2e/leavewar.spec.ts
git commit -m "docs(leavewar): bulk balance entry — the contract, the gaps, the tracker row"
git push -u origin claude/read-handoff-docs-15o14q
```

The open PR (#371) accumulates it; the Vercel preview for the branch is the owner's link. Do not merge.

---

### Task 5: Batch B — seven fixes from the owner's iPhone (6 Sep 26), taken BEFORE Task 4's gates

Owner's notes and screenshots, 6 Sep 26 (his answers: OIL with no balance = warn once, the second tap writes it and the balance goes red; "the glow of the selected row" = what lights when he taps/holds a row — make it clearly stronger). Every item below was traced to its cause first; the cause is named so the fix is at it.

**Files:**
- Modify: `raptor-port/src/leavewar/ui/matrix.css` (the `.dragging` rules ~1662–1663 and ~1488; the `.dragover` bars ~1660–1661 and ~1489/1492; `tr.me` ~1350–1371 and the drawer's copy ~2081–2087; the `.rtbtn` block ~1378–1403)
- Modify: `raptor-port/src/leavewar/ui/select.ts` (`GestureBase` — add `leftEdge?`; `bandsAt` ~243–250 and `edgeScroll` ~261–286 read it for the LEFT band only; `SelectCtx` + `wireSelect` thread it)
- Modify: `raptor-port/src/leavewar/ui/Matrix.tsx` (`selCtxRef.current` gains `leftEdge`; the `onWrote` handler ~3867–3886 no longer opens the OIL tracker)
- Modify: `raptor-port/docs/ui-contracts.md` (the OIL-write paragraph that says the tracker opens; the Rearrange drag paragraph; the "View as" row paragraph — each amended in place, dated)
- Test: `raptor-port/src/leavewar/ui/select.test.ts`, `raptor-port/src/leavewar/ui/oiltracker.test.tsx` (the "admin writes OIL → tracker opens" case flips honestly), `raptor-port/src/leavewar/ui/bidding.test.tsx` (the warn-once pin), a CSS-contract test in the style of `ui/arrangepaint.test.ts` (read `matrix.css` off disk), `raptor-port/e2e/leavewar.spec.ts`

**Interfaces:**
- Consumes: `frozenWidth(wrap)` (Matrix.tsx ~1242–1247 — already drawer-aware), `wrapRef`, `figuresOpen`, `drawerRef`; `wouldLeave`/`confirming` in `ui/BidPicker.tsx` (100–132, already warns once and writes on the second tap — unchanged); `showFigure`.
- Produces: `GestureBase.leftEdge?: () => number` and `SelectCtx.leftEdge?: () => number` (client-x where the day area begins; absent = the wrap's own left edge, so every existing caller and test is untouched).

- [ ] **Step 1: The CSS-contract test (failing first)** — new `raptor-port/src/leavewar/ui/rowglow.test.ts`, modelled on `arrangepaint.test.ts`: reads `matrix.css`, asserts (a) no rule sets `opacity` on the bare selectors `.mx tbody tr.dragging .who`, `.mx tbody tr.dragging .bal` or `.mx tbody tr.grp.dragging` (the sticky cells must stay opaque); (b) the `> *` content-fade rules exist; (c) `.rtbtn:focus` resolves to `outline: none` and `.rtbtn:focus-visible` is defined; (d) `.rtbtn.on` carries a `box-shadow` (the glow). Run: `npx vitest run src/leavewar/ui/rowglow.test.ts` → FAIL.

- [ ] **Step 2: The drag bleed + the picked-up row + the drop bar** (matrix.css). Replace the two `.dragging` opacity rules with:

```css
/* A dragged row (Rearrange) keeps its FROZEN cells opaque — they are sticky
   and paint over the scrolling day cells, so fading them let the numbers bleed
   through the label ("19FL P9 18", the owner's iPhone, 6 Sep 26 — the same
   failure the archived rows had, see .mrow-hidden). Only the CONTENT fades. */
.mx tbody tr.dragging .who > *,
.mx tbody tr.dragging .bal > * { opacity: .5; }
/* The picked-up row reads as LIFTED, not merely dimmed (owner, 6 Sep 26 —
   "make the glow of the selected row more obvious"): an accent ring on its
   frozen cells, a glow past them, and accent lines the width of the row. The
   lines are box-shadows so a day cell's own state colour still shows. */
.mx tbody tr.dragging .who,
.mx tbody tr.dragging .bal {
  box-shadow: inset 0 0 0 2px var(--accent), 0 0 12px rgba(59, 198, 232, .6);
  z-index: 3;
}
.mx tbody tr.dragging td:not(.who):not(.bal) {
  box-shadow: inset 0 2px 0 rgba(59, 198, 232, .65), inset 0 -2px 0 rgba(59, 198, 232, .65);
}
/* The landing bar runs the WHOLE row, 3px, with a glow — the previous 2px on
   the frozen cell alone was easy to miss under a thumb. */
.mx tbody tr.dragover td { box-shadow: inset 0 3px 0 var(--accent); }
.mx tbody tr.dragover.after td { box-shadow: inset 0 -3px 0 var(--accent); }
.mx tbody tr.dragover .who { box-shadow: inset 0 3px 0 var(--accent), 0 -1px 10px rgba(59, 198, 232, .55); }
.mx tbody tr.dragover.after .who { box-shadow: inset 0 -3px 0 var(--accent), 0 1px 10px rgba(59, 198, 232, .55); }
```

Group headings: READ the heading row's markup (Matrix.tsx, the `tr.grp` render — `td.grphd` with `.grphd-in` inside, and whatever cell(s) follow it) and replace `.mx tbody tr.grp.dragging { opacity: .5; }` with rules that keep `td.grphd` opaque (fade `td.grphd > .grphd-in` and the non-sticky cell(s) by their real class) and give `td.grphd` the same ring/glow as `.who` above; the heading's `.dragover` bars (~1489/1492) take the same 3px + glow. Delete the old rules — no duplicates. Keep the existing `.mrow-hidden` block as is.

- [ ] **Step 3: The "View as" row, stronger** (matrix.css `tr.me`, both copies):

```css
.mx tbody tr.me .who,
.mx tbody tr.me .bal { background: #173C4A; }
.mx tbody tr.me td {
  background-color: rgba(59, 198, 232, .07);
  box-shadow: inset 0 1px 0 rgba(59, 198, 232, .55), inset 0 -1px 0 rgba(59, 198, 232, .55);
}
.mx tbody tr.me .who { color: var(--accent); }
.mx tbody tr.me .who .whoedit .cs { box-shadow: inset 0 0 0 1px var(--accent), 0 0 8px rgba(59, 198, 232, .55); }
.mxdrawer .mx tbody tr.me td {
  background: #173C4A;
  box-shadow: inset 0 1px 0 rgba(59, 198, 232, .55), inset 0 -1px 0 rgba(59, 198, 232, .55);
}
```

Check in the browser that a day cell's leave chips and the weekend/blocked shading still read on the viewer's row (the wash is 7% — it must sit UNDER state colours); if any state colour is a `td` background that the wash would override, drop the `background-color` line and keep the lines/glow. Update the comment above the block (why: owner, 6 Sep 26 — "make the glow of the view as user row a bit more obvious in the grids").

- [ ] **Step 4: The Rearrange switch** (matrix.css `.rtbtn` block):

```css
/* A real <button>, so iOS leaves it FOCUSED after a tap and paints its own
   ring — which read as "still on" after the second tap turned Rearrange off
   (owner, 6 Sep 26). Keyboard focus keeps a ring via :focus-visible (the house
   idiom, see .grphd/.catchip); a tap gets none. ON now GLOWS, not just tints. */
.rtbtn { -webkit-tap-highlight-color: transparent; }
.rtbtn:focus { outline: none; }
.rtbtn:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
.rtbtn.on {
  background: var(--raised);
  border-color: var(--accent);
  color: var(--accent);
  box-shadow: 0 0 0 3px rgba(59, 198, 232, .18), 0 0 12px rgba(59, 198, 232, .5);
}
```

(`.rtbtn.on` replaces the existing rule at ~1391.) Run Step 1's test → PASS.

- [ ] **Step 5: OIL from the bid picker never opens the tracker.** In Matrix.tsx `onWrote` (~3867–3886) the admin branch that calls `close()` + `setOilTracker({ person, focus })` goes; what stays: the snap of the column to the figure the leave comes off (`figureForLeave`), and for an EARNING cell (FO/HO) `showFigure('oil')` so the grown balance is the one on screen. Rewrite the comment: the tracker is one tap away (the OIL button); a write on the grid keeps the admin on the grid (owner, 6 Sep 26 — "it should never bring me to the oil tracker page"). The warn-once rule already lives in `BidPicker.write` (100–132) — unchanged. Tests: in `oiltracker.test.tsx` (~374–387) the case "admin writes OIL → tracker opens, day lit" flips to "an admin's OIL write does NOT open the tracker; the column snaps to +OIL; a member's write neither" — an honest rewrite of a behaviour the owner reversed, say so in its comment. In `bidding.test.tsx` add the pin the flow never had: as admin, a person whose OIL balance is 0 — tapping OIL shows the note containing "Tap the same leave again" and writes nothing; tapping OIL again writes the cell and the OIL figure reads −1 (red); the same shape once for CCL at 0 (the rule is per counter). Amend `docs/ui-contracts.md` where it says the tracker opens on an admin's OIL write.

- [ ] **Step 6: Auto-scroll LEFT at the frozen block's edge** (select.ts + Matrix.tsx). Add to `GestureBase`:

```ts
  /** Client-x where the CONTENT begins, past whatever frozen thing stands in
   *  front of the wrap's own left edge — the frozen name/counter columns, or
   *  the figures drawer while it is open. The left edge band starts there, so
   *  a finger approaching the visible days' left edge auto-scrolls (owner,
   *  6 Sep 26 — "let me auto scroll left when my drag is approaching the edge
   *  of the expanded counters … likewise the counter on the left"). Absent =
   *  the wrap's own left edge: every existing caller and test is untouched. */
  leftEdge?: () => number
```

In `bandsAt` and `edgeScroll`, the LEFT band's origin becomes `const left = spec.leftEdge ? spec.leftEdge() : r.left` (both the `x < left + w` test and the touch `intoL = (left + TOUCH_EDGE) - lastX` / mouse `lastX < left + EDGE` reads); the RIGHT band keeps `r.right`. `SelectCtx` gains `leftEdge?: () => number`; `wireSelect` passes `leftEdge: ctx.leftEdge`. Matrix supplies, in `selCtxRef.current`:

```ts
    // The days begin past the frozen block — the name/counter pair, or the
    // drawer while it is open (frozenWidth is already drawer-aware).
    leftEdge: () => { const w = wrapRef.current; return w ? w.getBoundingClientRect().left + frozenWidth(w) : 0 },
```

Pins: `select.test.ts` — in the edge-auto-scroll block, a case that supplies `leftEdge: () => r.left + 120` and shows a mouse at `r.left + 130` scrolls left (`scrollLeft` decreases per frame) while one at `r.left + 200` does not, and that the held-band rule still applies from the new edge; the existing cases untouched. e2e (`lw-desktop`): drag-select from a day cell leftward and park the mouse 20px right of the counter column's right edge for ~400 ms → `.mx-wrap` `scrollLeft` decreased; then the same with the drawer OPEN, parked 20px right of the drawer's right edge → decreased. (`lw-phone`, via the CDP hold used in Task 2: the drawer open, a hold on a day beside it, a slow drag to 20px right of the drawer's edge, held ~400 ms → `scrollLeft` decreased.) The "page stays put" assertion at ~875 must still hold — run it.

- [ ] **Step 7: Unit + both projects' tests for what changed**: `npx vitest run --project leavewar`; `npx playwright test e2e/leavewar.spec.ts --project=lw-desktop --grep "auto-scroll|drawer|drag-select|OIL|Rearrange"` and the same for `lw-phone`. Drive the built bundle at phone width: Rearrange ON, hold a manning row's grip with the grid scrolled sideways — screenshot the dragged row and the landing bar; the viewer's row; the switch on and off; a drag toward the counter column with a scroll happening. Say what you saw.

- [ ] **Step 8: Commit** — `fix(leavewar): the phone batch — an opaque dragged label, a lit picked-up row and viewer row, a switch that glows only while on, OIL stays on the grid, and the drag scrolls left at the frozen edge` (+ trailers). Do not push.
