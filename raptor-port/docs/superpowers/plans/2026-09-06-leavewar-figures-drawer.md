# Leave War Figures Drawer — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use subagent-driven-development (recommended) or executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the thirteen-figure single counter column with eight two-line figures (balance over used, colour-coded), and add a drawer that pops out beside the names showing all of them at once — closed column and drawer sharing one renderer.

**Architecture:** The engine (`engine/counters.ts`) owns the eight figures with their used-lines metadata, title words and pop-up text — one source for every surface. The store gains an admin show/hide list on the `manningHidden` pattern. The grid's closed column and the phone's frozen overlay render a shared `<FigureCell>`; the drawer is a second overlay table (`<FiguresDrawer>`) drawn once outside the sideways scroller, positioned at the roster header and height-synced row by row like the existing `.mxband` overlay. The picker, person sheet, breakdown sheet and page Legend read the same figure metadata.

**Tech Stack:** Vite + React 19 + TypeScript, Vitest (jsdom, project `leavewar`), Playwright e2e (projects `lw-phone` 390×664 touch, `lw-desktop` 1440×900), plain CSS nested under `#page-leavewar` (matrix.css / chrome.css / bidpicker.css).

## Global Constraints

- Design spec (owner-approved 6 Sep 26): `docs/superpowers/specs/2026-09-06-leavewar-figures-drawer-design.md`. Product copy is the spec's; do not invent labels.
- Run everything from `raptor-port/`. While iterating run only the affected test file (`npx vitest run <file>`); the full gates ONCE at the end (Task 6): `npm test`, `npm run build`, `node reference/tfin.js` (728/0), `npm run test:e2e`.
- Never weaken a failing assertion — understand it, then rewrite it to the new truth with the value you measured.
- CSS lives INSIDE the `#page-leavewar { … }` nesting wrapper in each file (a rule appended after its closing brace loses to the wrapper's id specificity). `@keyframes` go at the file's TOP LEVEL, outside the wrapper (see `lwx-follow` at the foot of matrix.css).
- Never set a CSS custom property on `.mx-outer` or any grid ancestor from JS per frame; a class toggled on open/close is fine (one restyle).
- Every row of `table.mx` keeps identical cells; the drawer is an OVERLAY, never extra cells in the real table.
- Comments explain WHY, prose, above the code — match the density of the surrounding files. UI copy reads production (no "session-only", "demo").
- Colours: balance `var(--ink)` (#F1F4F7), amber `var(--adv)` (#E5A83B), red `var(--hard)` (#F0555F), accent `var(--accent)` (#3BC6E8). Panel `var(--panel)`, header panel `var(--panel-2)`.
- Commit after each task with a `feat(leavewar): …` / `test(leavewar): …` message; do not push (the orchestrator pushes once).

---

### Task 1: The eight figures in the engine

**Files:**
- Modify: `src/leavewar/engine/counters.ts` (the `Figure` interface at ~252, `balParts`/`typeParts` ~283, `FIGURES` ~324, `DEFAULT_FIGURE_ID` ~356)
- Modify: `src/leavewar/engine/index.ts` (re-export the new names if it re-exports by name; check first)
- Test: `src/leavewar/engine/counters.test.ts`

**Interfaces:**
- Consumes: `balanceOf`, `takenOf`, `lveConOf`, `medConOf`, `oilLedgerOf`, `grantedTo`, `earnedOil`, `FigureCtx`, `FigurePart` (all already in counters.ts).
- Produces (used by every later task):
  ```ts
  export type Tone = 'white' | 'amber' | 'red'
  export interface UsedLine { type: string; label: string; tone: Tone }
  export interface TitleWord { text: string; tone: Tone }
  export interface Figure {
    id: string; label: string; title: string; kind: 'bal' | 'tot'
    counter?: CounterName; used: readonly UsedLine[]; desc: string; legend?: string
    value: (ctx: FigureCtx, personId: string) => number
    parts?: (ctx: FigureCtx, personId: string) => FigurePart[]
  }
  export interface FigureLines { top: number; used: { label: string; tone: Tone; value: number }[] }
  export function figureLines(f: Figure, ctx: FigureCtx, personId: string): FigureLines
  export function titleLines(f: Figure): TitleWord[][]
  export function figureForLeave(type: string): string | null
  export const DEFAULT_FIGURE_ID = 'lve'
  ```
  Figure ids, in catalogue order: `lve, oil, ccl, fcl, cl, pl, lvetot, medtot`.

- [ ] **Step 1: Write the failing tests** — append to `counters.test.ts` (keep every existing `describe` except `FIGURES and orderedFigures`, which you rewrite as below):

```ts
import { figureForLeave, figureLines, titleLines } from './counters'

describe('FIGURES — the owner\'s eight (6 Sep 26)', () => {
  it('is the eight figures, balances first, then the two totals', () => {
    expect(FIGURES.map(f => f.id)).toEqual(['lve', 'oil', 'ccl', 'fcl', 'cl', 'pl', 'lvetot', 'medtot'])
    expect(FIGURES.map(f => f.label)).toEqual(['LVE', 'OIL', 'CCL', 'FCL', 'CL', 'PL', 'LVE TOT', 'MED TOT'])
  })
  it('opens on LVE', () => {
    expect(DEFAULT_FIGURE_ID).toBe('lve')
    expect(DEFAULT_FIGURE_ORDER).toEqual(FIGURES.map(f => f.id))
  })
  it('signs every title: + for a balance, − for a total', () => {
    expect(FIGURES.filter(f => f.kind === 'bal').map(f => f.title)).toEqual(['+LVE', '+OIL', '+CCL', '+FCL', '+CL', '+PL'])
    expect(FIGURES.filter(f => f.kind === 'tot').map(f => f.title)).toEqual(['−LVE TOT', '−MED TOT'])
  })
  it('names what each balance draws from, LL amber and OL red under LVE', () => {
    const lve = FIGURES.find(f => f.id === 'lve')!
    expect(lve.counter).toBe('annual')
    expect(lve.used).toEqual([{ type: 'LL', label: 'LL', tone: 'amber' }, { type: 'OL', label: 'OL', tone: 'red' }])
    const oil = FIGURES.find(f => f.id === 'oil')!
    expect(oil.used).toEqual([{ type: 'OIL', label: 'OIL', tone: 'red' }])
    for (const id of ['ccl', 'fcl', 'cl', 'pl']) {
      const f = FIGURES.find(x => x.id === id)!
      expect(f.counter).toBe(id)
      expect(f.used).toEqual([{ type: id.toUpperCase(), label: id.toUpperCase(), tone: 'red' }])
    }
    expect(FIGURES.find(f => f.id === 'lvetot')!.used).toEqual([])
  })
  it('says what each column counts, in the owner\'s words', () => {
    const desc = Object.fromEntries(FIGURES.map(f => [f.id, f.desc]))
    expect(desc.lve).toBe('Balance of local + overseas leave: opening + granted − LL − OL')
    expect(desc.oil).toBe("The OIL tracker's balance: earned by weekend/PH work + granted − taken − expired")
    expect(desc.ccl).toBe('Child care leave balance: opening + granted − taken')
    expect(desc.fcl).toBe('Family care leave balance: opening + granted − taken')
    expect(desc.cl).toBe('Compassionate leave balance: opening + granted − taken')
    expect(desc.pl).toBe('Paternity leave balance: opening + granted − taken')
    expect(desc.lvetot).toBe('All leave taken: LL + OL + OIL + CCL + FCL + CL + PL')
    expect(desc.medtot).toBe('Medical days: ATT C + HL + OML')
  })
  it('lays the title out: one line, or two when a balance has two used lines', () => {
    const lve = FIGURES.find(f => f.id === 'lve')!
    expect(titleLines(lve)).toEqual([[{ text: '+LVE', tone: 'white' }], [{ text: '−LL', tone: 'amber' }, { text: '−OL', tone: 'red' }]])
    const oil = FIGURES.find(f => f.id === 'oil')!
    expect(titleLines(oil)).toEqual([[{ text: '+OIL', tone: 'white' }, { text: '−OIL', tone: 'red' }]])
    const tot = FIGURES.find(f => f.id === 'medtot')!
    expect(titleLines(tot)).toEqual([[{ text: '−MED TOT', tone: 'red' }]])
  })
  it('refuses to be reordered by a caller mutating the exported array', () => {
    expect(() => (FIGURES as Figure[]).reverse()).toThrow()
  })
  it('heals a stale saved order (old ids dropped, new ids appended)', () => {
    expect(orderedFigures(['lvebal', 'medtot', 'oil']).map(f => f.id)).toEqual(['medtot', 'oil', 'lve', 'ccl', 'fcl', 'cl', 'pl', 'lvetot'])
  })
})

describe('figureLines — the two-line box', () => {
  const grid: Grid = { ramp: { '2026-03-02': 'LL', '2026-03-03': 'LL', '2026-03-04': 'OL', '2026-03-10': 'OIL' } }
  const states: States = {
    ramp: { '2026-03-02': approved(), '2026-03-03': approved(), '2026-03-04': approved(), '2026-03-10': pending },
  }
  const openings: Openings = { ramp: { annual: 12, oil: 3 } }
  const ledger: Ledger = []
  const ctx = { openings, ledger, sources: [{ grid, states }] }

  it('reads the balance on top and each used line under it, LL then OL', () => {
    const lve = FIGURES.find(f => f.id === 'lve')!
    expect(figureLines(lve, ctx, 'ramp')).toEqual({
      top: 9,
      used: [{ label: 'LL', tone: 'amber', value: 2 }, { label: 'OL', tone: 'red', value: 1 }],
    })
  })
  it('a total has no used lines', () => {
    const tot = FIGURES.find(f => f.id === 'lvetot')!
    expect(figureLines(tot, ctx, 'ramp')).toEqual({ top: 4, used: [] })
  })
  it('an LVE breakdown splits LL from OL and still sums to the balance', () => {
    const lve = FIGURES.find(f => f.id === 'lve')!
    const parts = figureParts(lve, ctx, 'ramp')
    expect(parts.map(p => p.label)).toEqual(['opening figure', 'granted', 'LL taken', 'OL taken'])
    expect(parts.reduce((s, p) => s + p.value, 0)).toBe(lve.value(ctx, 'ramp'))
  })
})

describe('figureForLeave — which balance a leave comes off', () => {
  it('maps every leave code to the balance it draws from, medical to MED TOT', () => {
    expect(figureForLeave('LL')).toBe('lve')
    expect(figureForLeave('OL')).toBe('lve')
    expect(figureForLeave('OIL')).toBe('oil')
    expect(figureForLeave('CCL')).toBe('ccl')
    expect(figureForLeave('FCL')).toBe('fcl')
    expect(figureForLeave('CL')).toBe('cl')
    expect(figureForLeave('PL')).toBe('pl')
    expect(figureForLeave('ATTC')).toBe('medtot')
    expect(figureForLeave('HL')).toBe('medtot')
    expect(figureForLeave('OML')).toBe('medtot')
  })
  it('EL has a pool but no figure, and an unknown code maps to nothing', () => {
    expect(figureForLeave('EL')).toBeNull()
    expect(figureForLeave('ATTB')).toBeNull()
    expect(figureForLeave('FO')).toBeNull()
  })
})
```

Check the existing test file's `ctx` shape first (some `describe`s build a `FigureCtx` with `sources: [{ grid, states }]`) and match it exactly; the three grid dates above are Monday–Wednesday (2, 3, 4 Mar 2026 are Mon/Tue/Wed) and 10 Mar is a Tuesday, so the weekend/PH rule excuses nothing.

- [ ] **Step 2: Run the file to see the new tests fail**

Run: `npx vitest run src/leavewar/engine/counters.test.ts`
Expected: FAIL — `figureForLeave`/`figureLines`/`titleLines` not exported; the old thirteen-figure `describe` (delete it) fails on ids.

- [ ] **Step 3: Implement** — in `counters.ts`, replace the `Figure` interface, the `FIGURES` array, `DEFAULT_FIGURE_ID`, and add the helpers. Keep `balanceOf`, `takenOf`, `medConOf`, `lveConOf`, `figureParts`, `orderedFigures`, `DEFAULT_FIGURE_ORDER`, `FIGURE_BY_ID` as they are. Delete the old `balParts`/`typeParts` only if nothing else imports them (they are module-private).

```ts
/** Which colour a number wears: the balance white, LL amber, everything else
 *  used (OL, OIL, CCL…, a total) red. A balance below zero is red too — the
 *  renderer decides that from the sign, not from here. */
export type Tone = 'white' | 'amber' | 'red'

/** One leave TYPE a balance is drawn down by, and the colour its number wears
 *  under the balance. LVE has two (LL amber, OL red); every other pool one. */
export interface UsedLine { type: string; label: string; tone: Tone }

/** A word of a column title, with its colour — the title IS the legend
 *  (owner, 6 Sep 26): "+LVE" white over "−LL −OL" amber and red. */
export interface TitleWord { text: string; tone: Tone }

export interface Figure {
  /** Stable id — the persisted display order and hidden list are lists of
   *  these, so renaming one silently drops it from a saved order. Don't. */
  id: string
  /** The plain name for sheets and the legend: 'LVE', 'LVE TOT'. */
  label: string
  /** The signed title word for a column: '+LVE' (a balance), '−LVE TOT' (a
   *  total) — the owner's own shorthand, + meaning balance and − meaning used. */
  title: string
  kind: 'bal' | 'tot'
  /** For a balance: the counter it reads — what lets the person sheet offer an
   *  admin a Set button on every plain-sum balance and hand OIL to the tracker. */
  counter?: CounterName
  /** The types drawn from this balance, in the order their numbers stack under
   *  it. A total has none. */
  used: readonly UsedLine[]
  /** What the column counts, in the owner's words — the title pop-up, the
   *  picker caption and the page Legend all read this one string. */
  desc: string
  /** Kept for the sheets' "= …" caption on a total. */
  legend?: string
  value: (ctx: FigureCtx, personId: string) => number
  /** The per-person breakdown, SIGNED so the parts always sum to `value`. */
  parts?: (ctx: FigureCtx, personId: string) => FigurePart[]
}

export interface FigurePart { label: string; value: number }

const PART_LABEL: Record<string, string> = { ATTC: 'ATT C', ATTB: 'ATT B' }
const typeParts = (types: readonly string[]) => (c: FigureCtx, p: string): FigurePart[] =>
  types.map(t => ({ label: PART_LABEL[t] ?? t, value: takenOf(c.sources, p, t, c) }))

/** A balance's parts, with the taken side split PER TYPE (LVE reads "LL taken
 *  −3 · OL taken −2", owner 6 Sep 26) — the per-type draws sum to the pool's
 *  draw because both read the one charged-days map (charge.ts). `0 - x`, not
 *  `-x`: a person whose every leave day is excused draws 0, and `-0` would
 *  print as a minus sign on some paths. */
const balParts = (counter: CounterName, types: readonly string[], earns: boolean) => (c: FigureCtx, p: string): FigurePart[] => {
  const parts: FigurePart[] = [
    { label: 'opening figure', value: c.openings[p]?.[counter] ?? 0 },
    { label: 'granted', value: grantedTo(c.ledger, p, counter) },
  ]
  if (earns) parts.push({ label: 'earned by weekend/PH work', value: earnedOil(c.sources, p) })
  for (const t of types) parts.push({ label: `${PART_LABEL[t] ?? t} taken`, value: 0 - takenOf(c.sources, p, t, c) })
  if (counter === 'oil') {
    const expired = oilLedgerOf(c, p).expired
    if (expired) parts.push({ label: 'expired', value: -expired })
  }
  return parts
}

const used = (type: string, tone: Tone): UsedLine => ({ type, label: PART_LABEL[type] ?? type, tone })
const plainBal = (counter: CounterName) => (c: FigureCtx, p: string) => balanceOf(c.openings, c.ledger, c.sources, p, counter, c)

/**
 * The eight figures (owner, 6 Sep 26 — replacing the thirteen): six balances,
 * each drawn on its own leave types, then the two totals. Balances first
 * because a balance is what a bidder holds in their head; the totals close
 * the list. Frozen for the same reason `COUNTERS` is.
 */
export const FIGURES: readonly Figure[] = Object.freeze([
  { id: 'lve', label: 'LVE', title: '+LVE', kind: 'bal', counter: 'annual', used: [used('LL', 'amber'), used('OL', 'red')],
    desc: 'Balance of local + overseas leave: opening + granted − LL − OL',
    value: plainBal('annual'), parts: balParts('annual', ['LL', 'OL'], false) },
  { id: 'oil', label: 'OIL', title: '+OIL', kind: 'bal', counter: 'oil', used: [used('OIL', 'red')],
    desc: "The OIL tracker's balance: earned by weekend/PH work + granted − taken − expired",
    value: (c, p) => oilLedgerOf(c, p).balance, parts: balParts('oil', ['OIL'], true) },
  { id: 'ccl', label: 'CCL', title: '+CCL', kind: 'bal', counter: 'ccl', used: [used('CCL', 'red')],
    desc: 'Child care leave balance: opening + granted − taken', value: plainBal('ccl'), parts: balParts('ccl', ['CCL'], false) },
  { id: 'fcl', label: 'FCL', title: '+FCL', kind: 'bal', counter: 'fcl', used: [used('FCL', 'red')],
    desc: 'Family care leave balance: opening + granted − taken', value: plainBal('fcl'), parts: balParts('fcl', ['FCL'], false) },
  { id: 'cl', label: 'CL', title: '+CL', kind: 'bal', counter: 'cl', used: [used('CL', 'red')],
    desc: 'Compassionate leave balance: opening + granted − taken', value: plainBal('cl'), parts: balParts('cl', ['CL'], false) },
  { id: 'pl', label: 'PL', title: '+PL', kind: 'bal', counter: 'pl', used: [used('PL', 'red')],
    desc: 'Paternity leave balance: opening + granted − taken', value: plainBal('pl'), parts: balParts('pl', ['PL'], false) },
  { id: 'lvetot', label: 'LVE TOT', title: '−LVE TOT', kind: 'tot', used: [],
    desc: 'All leave taken: LL + OL + OIL + CCL + FCL + CL + PL', legend: 'LL + OL + OIL + CCL + FCL + CL + PL',
    value: (c, p) => lveConOf(c.sources, p, c), parts: typeParts(LVE_CON_TYPES) },
  { id: 'medtot', label: 'MED TOT', title: '−MED TOT', kind: 'tot', used: [],
    desc: 'Medical days: ATT C + HL + OML', legend: 'ATT C + HL + OML',
    value: (c, p) => medConOf(c.sources, p, c), parts: typeParts(MED_CON_TYPES) },
])

/** The figure the column opens on: how much leave is left. */
export const DEFAULT_FIGURE_ID = 'lve'

/** The numbers a two-line box shows: the figure's own number on top, and each
 *  used line's days under it. One reader for the closed column, the frozen
 *  overlay and the drawer, so the three cannot disagree. */
export function figureLines(f: Figure, ctx: FigureCtx, personId: string): FigureLines {
  return {
    top: f.value(ctx, personId),
    used: f.used.map(u => ({ label: u.label, tone: u.tone, value: takenOf(ctx.sources, personId, u.type, ctx) })),
  }
}
export interface FigureLines { top: number; used: { label: string; tone: Tone; value: number }[] }

/** The column title as coloured words, one line per row: "+OIL −OIL" on one
 *  line; LVE, with two used types, takes two ("+LVE" over "−LL −OL"). */
export function titleLines(f: Figure): TitleWord[][] {
  const head: TitleWord = { text: f.title, tone: f.kind === 'bal' ? 'white' : 'red' }
  const rest = f.used.map(u => ({ text: `−${u.label}`, tone: u.tone }))
  if (rest.length === 0) return [[head]]
  if (rest.length === 1) return [[head, rest[0]!]]
  return [[head], rest]
}

/** The figure the column switches to when a leave of this TYPE is entered —
 *  the balance it comes off (owner, 6 Sep 26: "switches to LVE BAL in view"),
 *  medical to the MED total. EL keeps a pool but has no figure; ATT B feeds
 *  no total. Null = don't switch. */
const LEAVE_FIGURE: Record<string, string> = {
  LL: 'lve', OL: 'lve', OIL: 'oil', CCL: 'ccl', FCL: 'fcl', CL: 'cl', PL: 'pl', ATTC: 'medtot', HL: 'medtot', OML: 'medtot',
}
export function figureForLeave(type: string): string | null {
  return LEAVE_FIGURE[type] ?? null
}
```

Then fix the two places in this file that referenced the old shape (`figureParts` fallback: `f.kind === 'bal' ? 'balance' : 'days taken'` stays valid). Check `src/leavewar/engine/index.ts` — if it re-exports counters by name, add `figureLines, titleLines, figureForLeave, type Tone, type UsedLine, type TitleWord, type FigureLines`.

- [ ] **Step 4: Run the engine test file — green**

Run: `npx vitest run src/leavewar/engine/counters.test.ts`
Expected: PASS. Then `npx tsc --noEmit -p .` (or `npm run build`) — expect type errors ONLY in UI files that compare `kind === 'con'` or read `f.legend` on figures; note them, they are Tasks 3 and 5. If `index.ts` re-exports fail, fix them here.

- [ ] **Step 5: Commit**

```bash
git add src/leavewar/engine/counters.ts src/leavewar/engine/counters.test.ts src/leavewar/engine/index.ts
git commit -m "feat(leavewar): the eight figures — balances with their used lines, two totals, signed titles"
```

---

### Task 2: The admin show/hide list in the store

**Files:**
- Modify: `src/leavewar/state/store.ts` — the `State` interface (beside `manningHidden` ~187), the initial state (~292), the boot read (~795), `persist()` (~897), the undo snapshot (~967) and its key union (~1024), `resetFigureOrder` (~2282), a new `toggleFigure` beside `toggleManningRow` (~2360).
- Test: `src/leavewar/ui/counters.test.tsx` — a new `describe('hiding a figure')` (the file already imports `getState`, `initStore`, `memoryBackend`, `setRole`).

**Interfaces:**
- Produces:
  ```ts
  // State
  figureHidden: string[]            // figure ids an admin has hidden; persisted 'fighidden'
  export function toggleFigure(id: string): boolean   // admin-gated; refuses to hide the last shown one
  export function visibleFigures(): Figure[]           // orderedFigures(order) minus hidden
  ```
- Consumes: `orderedFigures`, `DEFAULT_FIGURE_ORDER` from the engine.

- [ ] **Step 1: Write the failing tests** — append to `counters.test.tsx`:

```ts
import { toggleFigure, visibleFigures } from '../state/store'

describe('hiding a figure (owner, 6 Sep 26 — "admin should also be able to customise")', () => {
  it('lets an admin hide a figure, and the visible list drops it', () => {
    setRole('admin')
    expect(visibleFigures().map(f => f.id)).toEqual(['lve', 'oil', 'ccl', 'fcl', 'cl', 'pl', 'lvetot', 'medtot'])
    expect(toggleFigure('fcl')).toBe(true)
    expect(getState().figureHidden).toEqual(['fcl'])
    expect(visibleFigures().map(f => f.id)).toEqual(['lve', 'oil', 'ccl', 'cl', 'pl', 'lvetot', 'medtot'])
    expect(toggleFigure('fcl')).toBe(true)
    expect(visibleFigures()).toHaveLength(8)
  })
  it('refuses a member', () => {
    setRole('member')
    expect(toggleFigure('fcl')).toBe(false)
    expect(getState().figureHidden).toEqual([])
  })
  it('never hides the last figure showing', () => {
    setRole('admin')
    for (const id of ['oil', 'ccl', 'fcl', 'cl', 'pl', 'lvetot', 'medtot']) toggleFigure(id)
    expect(visibleFigures().map(f => f.id)).toEqual(['lve'])
    expect(toggleFigure('lve')).toBe(false)
    expect(visibleFigures().map(f => f.id)).toEqual(['lve'])
  })
  it('persists the hidden list and reads it back', () => {
    const backend = memoryBackend()
    initStore(backend)
    setRole('admin')
    toggleFigure('pl')
    expect(JSON.parse(backend.read('fighidden')!)).toEqual(['pl'])
    initStore(backend)
    expect(getState().figureHidden).toEqual(['pl'])
  })
  it('Reset puts the order back AND shows everything again', () => {
    setRole('admin')
    toggleFigure('pl')
    moveFigure('medtot', -1)
    resetFigureOrder()
    expect(getState().figureHidden).toEqual([])
    expect(getState().figureOrder).toEqual([...DEFAULT_FIGURE_ORDER])
  })
})
```
Add `DEFAULT_FIGURE_ORDER` to the test's engine import (`from '../engine'` or `'../engine/counters'`, whichever the file already uses for figure names).

- [ ] **Step 2: Run to see them fail**

Run: `npx vitest run src/leavewar/ui/counters.test.tsx -t "hiding a figure"`
Expected: FAIL — `toggleFigure`/`visibleFigures` not exported.

- [ ] **Step 3: Implement** — in `store.ts`, mirror `manningHidden` at every point it appears:

```ts
  /** The figures an admin has hidden from the column's cycle and the drawer
   *  (owner, 6 Sep 26 — "admin should also be able to customise"). Persisted
   *  under `fighidden`, ADMIN-gated at the write path like `figureOrder`; read
   *  leniently (unknown ids are ignored by `visibleFigures`). At least one
   *  figure always stays visible — the column cannot show nothing. */
  figureHidden: string[]
```
Initial state: `figureHidden: [],`. Boot: `const figureHidden = readStored('fighidden', readIdList) ?? []` and pass it into the `withCurrent({...})` call beside `manningHidden`. Persist: `backend.write('fighidden', JSON.stringify(state.figureHidden))`. Undo snapshot: add `figureHidden: s.figureHidden,` where `manningHidden: s.manningHidden,` is built, and `'figureHidden'` to the `Pick<State, …>` key union. Then:

```ts
/** The figures the column cycles and the drawer shows: the admin's order,
 *  less the hidden ones. Every surface that lists figures reads this, so a
 *  hidden figure disappears from all of them at once. */
export function visibleFigures(): Figure[] {
  const hidden = new Set(state.figureHidden)
  const shown = orderedFigures(state.figureOrder).filter(f => !hidden.has(f.id))
  // A stale hidden list naming every figure would leave nothing to show —
  // fall back to the whole order rather than an empty column.
  return shown.length ? shown : orderedFigures(state.figureOrder)
}

/** Hide or show one figure. ADMIN-gated, and the last visible figure cannot
 *  be hidden — returns whether anything changed. */
export function toggleFigure(id: string): boolean {
  if (state.role !== 'admin') return false
  const hidden = new Set(state.figureHidden)
  if (hidden.has(id)) hidden.delete(id)
  else {
    if (visibleFigures().length <= 1) return false
    hidden.add(id)
  }
  state = withCurrent({ ...state, figureHidden: [...hidden] })
  persist()
  notify()
  return true
}
```
And in `resetFigureOrder`: `state = withCurrent({ ...state, figureOrder: [...DEFAULT_FIGURE_ORDER], figureHidden: [] })`. Import `Figure` type from the engine if not already imported.

- [ ] **Step 4: Run the tests**

Run: `npx vitest run src/leavewar/ui/counters.test.tsx -t "hiding a figure"`
Expected: PASS (the rest of that file is still red from Task 1's label changes — Task 3 and 5 fix it; do not touch those tests here).

- [ ] **Step 5: Commit**

```bash
git add src/leavewar/state/store.ts src/leavewar/ui/counters.test.tsx
git commit -m "feat(leavewar): admin show/hide per figure (fighidden), reset shows all"
```

---

### Task 3: The closed column — the two-line box, the balance switch, the flash

**Files:**
- Create: `src/leavewar/ui/FigureCell.tsx`
- Modify: `src/leavewar/ui/Matrix.tsx` — `PersonRow` cell (~340-351) and its `title`/`suffix` (~277), the band copy (~3209-3214), `figures` (~580: use `visibleFigures()`), the header chip `.cname` (~1752), `onWrote` (~3511-3518), the `FigureBreakdownSheet` fallback (~3372).
- Modify: `src/leavewar/ui/matrix.css` — `.mx .bal` block (~229-248) and a top-level `@keyframes`.
- Modify: `src/leavewar/ui/CounterSheet.tsx` — `FigureBreakdownSheet` header (`figure.kind === 'bal' ? 'balance left' : 'days taken'` is still valid; change nothing else here — Task 5 does the sheets).
- Test: `src/leavewar/ui/counters.test.tsx` (rewrite the assertions the new figures change), `src/leavewar/ui/frozencols.test.tsx` (any `bal-` text assertion).

**Interfaces:**
- Produces: `<FigureCell figure lines flashKey testid? onClick />` — `lines: FigureLines`; renders `<span class="fb">top</span><span class="fu">…</span>`; adds class `flash` for ~700 ms when the SAME figure's top value changes for the same person.
- Consumes: `figureLines`, `figureForLeave`, `visibleFigures` from Tasks 1–2.

- [ ] **Step 1: Write the failing tests** — in `counters.test.tsx` rewrite the affected assertions and add the new ones:

```ts
/** The top number of a person's counter box — the balance (or total). */
const top = (id: string) => screen.getByTestId(`bal-${id}`).querySelector('.fb')!.textContent
/** The used numbers under it, in order. */
const usedOf = (id: string) => [...screen.getByTestId(`bal-${id}`).querySelectorAll('.fu b')].map(b => b.textContent)

describe('the counter column', () => {
  it('shows one counter at a time, not one column per counter', () => {  /* unchanged */ })
  it('opens on the leave balance, which is the one people ask about', () => {
    render(<Matrix />)
    expect(screen.getByTestId('counter-name').textContent).toBe('+LVE')
  })
  it('shows the leave balance on top: opening plus grants less what the grid has drawn', () => {
    render(<Matrix />)
    expect(top('ramp')).toBe('26')
  })
  it('stacks the days taken under the balance, LL amber then OL red, no minus, nothing for zero', () => {
    setRole('admin')
    setCell('ramp', '2026-03-02', 'LL')
    setCell('ramp', '2026-03-03', 'LL')
    setCell('ramp', '2026-03-04', 'OL')
    render(<Matrix />)
    expect(top('ramp')).toBe('23')
    const used = screen.getByTestId('bal-ramp').querySelectorAll('.fu b')
    expect([...used].map(b => b.textContent)).toEqual(['2', '1'])
    expect(used[0]!.className).toBe('amber')
    expect(used[1]!.className).toBe('red')
    // a person with nothing taken shows no used line at all
    expect(screen.getByTestId('bal-tata').querySelectorAll('.fu b')).toHaveLength(0)
  })
  it('changes every row at once when the figure changes', () => {
    render(<Matrix />)
    const before = getState().people.map(p => top(p.id))
    pick('oil')
    expect(screen.getByTestId('counter-name').textContent).toBe('+OIL')
    const after = getState().people.map(p => top(p.id))
    expect(after).not.toEqual(before)
  })
  it('offers every figure, in order, each a single tap away', () => {
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('counter-pick'))
    expect([...screen.getByTestId('counter-sheet').querySelectorAll('.crow .cn')].map(e => e.textContent))
      .toEqual(['LVE', 'OIL', 'CCL', 'FCL', 'CL', 'PL', 'LVE TOT', 'MED TOT'])
    fireEvent.click(screen.getByTestId('counter-lvetot'))
    expect(screen.getByTestId('counter-name').textContent).toBe('−LVE TOT')
    pick('lve')
    expect(screen.getByTestId('counter-name').textContent).toBe('+LVE')
  })
  it('paints a negative balance red, with its minus, and never a used number with one', () => {
    setRole('admin')
    setCell('cross', '2026-03-02', 'LL')   // cross opens at −12 annual (seed)
    render(<Matrix />)
    const box = screen.getByTestId('bal-cross')
    expect(box.querySelector('.fb')!.textContent).toBe('-13')
    expect(box.querySelector('.fb')!.classList.contains('neg')).toBe(true)
    expect(usedOf('cross')).toEqual(['1'])
  })
})

describe('the counter follows the leave just entered — to the balance it comes off (6 Sep 26)', () => {
  it('switches to LVE for LL and OL, OIL for OIL, MED TOT for a medical mark', () => {
    setRole('admin')
    render(<Matrix />)
    pick('medtot')
    fireEvent.click(screen.getByTestId('cell-ramp-2026-03-02'))
    fireEvent.click(screen.getByTestId('bid-LL'))
    expect(screen.getByTestId('counter-name').textContent).toBe('+LVE')
    fireEvent.click(screen.getByTestId('cell-ramp-2026-03-03'))
    fireEvent.click(screen.getByTestId('bid-OIL'))
    expect(screen.getByTestId('counter-name').textContent).toBe('+OIL')
  })
  it('flashes the changed box once, and only that box', () => {
    setRole('admin')
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('cell-ramp-2026-03-02'))
    fireEvent.click(screen.getByTestId('bid-LL'))
    expect(screen.getByTestId('bal-ramp').classList.contains('flash')).toBe(true)
    expect(screen.getByTestId('bal-tata').classList.contains('flash')).toBe(false)
    fireEvent.animationEnd(screen.getByTestId('bal-ramp'))
    expect(screen.getByTestId('bal-ramp').classList.contains('flash')).toBe(false)
  })
})
```
Read the existing `describe('the counter follows the leave just entered')` for the real cell/code testids (`cell-<id>-<date>`, the code chips inside the bid sheet) and the seed's people (`ramp`, `tata`, `cross`); use exactly those. Keep the "never paints a consumed figure red" idea as "never a used number with a minus". Delete tests that assert the thirteen labels or `OFF`. In `frozencols.test.tsx`, any assertion on a band `.bal` `textContent` must read `.fb` instead.

- [ ] **Step 2: Run the file — red**

Run: `npx vitest run src/leavewar/ui/counters.test.tsx`
Expected: the new assertions FAIL on `.fb` missing / labels.

- [ ] **Step 3: Create `FigureCell.tsx`**

```tsx
// The two-line figure box (owner, 6 Sep 26): the figure's own number on top —
// a balance white, red with its minus below zero; a total red — and under it
// the days taken from that balance, LL amber and OL red on one line, no minus
// (the column title carries the minus and the colour says the rest). One
// component for the real cell, the phone's frozen copy and the drawer's boxes,
// so the three cannot drift. It fits today's 22px row: two 11px lines.
//
// The FLASH: when the same figure's top number changes for this person — a
// leave entered, decided, or set — the box fades from the accent tint once
// (~700ms, matrix.css `lw-figflash`). Keyed by figure id so switching the
// column to another figure never flashes every row. The first render never
// flashes: there is nothing "changed" about a number just appearing.
import { memo, useEffect, useRef, useState, type MouseEvent } from 'react'
import type { Figure, FigureLines } from '../engine'

const show = (n: number) => String(Math.round(n * 10) / 10)

export const FigureCell = memo(function FigureCell({
  figure, lines, personId, testid, title, onClick, extraClass,
}: {
  figure: Figure
  lines: FigureLines
  personId: string
  testid?: string
  title?: string
  onClick?: (e: MouseEvent) => void
  /** Extra classes on the cell (`bal act`, `bal fig` …). */
  extraClass: string
}) {
  const prev = useRef<{ id: string; person: string; top: number } | null>(null)
  const [flash, setFlash] = useState(false)
  useEffect(() => {
    const p = prev.current
    if (p && p.id === figure.id && p.person === personId && p.top !== lines.top) setFlash(true)
    prev.current = { id: figure.id, person: personId, top: lines.top }
  }, [figure.id, personId, lines.top])
  const neg = lines.top < 0
  const shownUsed = lines.used.filter(u => u.value !== 0)
  return (
    <td
      className={`${extraClass}${flash ? ' flash' : ''}`}
      data-testid={testid}
      title={title}
      onClick={onClick}
      onAnimationEnd={() => setFlash(false)}
    >
      <span className={`fb${figure.kind === 'tot' ? ' red' : neg ? ' neg' : ''}`}>{show(lines.top)}</span>
      {shownUsed.length > 0 && (
        <span className="fu">
          {shownUsed.map(u => <b key={u.label} className={u.tone}>{show(u.value)}</b>)}
        </span>
      )}
    </td>
  )
})
```

- [ ] **Step 4: Wire it into `Matrix.tsx`**

In `PersonRow`: replace the `v`/`suffix`/`<td className="bal …">` block with
```tsx
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const lines = useMemo(() => figureLines(shown, figureCtx, p.id), [shown, figureCtx, p.id, version])
  …
      <FigureCell
        figure={shown}
        lines={lines}
        personId={p.id}
        extraClass="bal act"
        testid={`bal-${p.id}`}
        title={`${p.callsign}: ${shown.label} ${show(lines.top)} ${shown.kind === 'bal' ? 'left' : 'taken'}. Tap for the breakdown`}
        onClick={() => api.current.setBalOpen({ person: p.id, figureId: shown.id })}
      />
```
In the band copy (~3209): the same `FigureCell` with `extraClass="bal act"` and NO testid (the overlay never answers a testid). `figures` (~580): `const figures = visibleFigures()` — but this is store state, so read it through the same `version`-driven path the file uses for `figureOrder` (find where `figureOrder` is destructured from `getState()`/`useVersion` and add `figureHidden` there; `visibleFigures()` reads the live store, fine inside the render). If `shownId` names a now-hidden figure, fall back: `const shown = figures.find(f => f.id === shownId) ?? figures[0]!` (find the existing `shown`/`shownIx` derivation and keep `shownIx` consistent). Header chip: `<span className="cname">{shown.title}</span>` (was `shown.label`). `onWrote`: replace the type→id block with
```tsx
            if (cell) {
              const id = figureForLeave(cell.type)
              if (id && figures.some(f => f.id === id)) setShownId(id)
            }
```
and the admin OIL branch's `setShownId('oilbal')` → `setShownId('oil')`. Imports: `figureLines, figureForLeave` from `'../engine'`, `visibleFigures` from the store, `FigureCell` from `'./FigureCell'`. Remove the now-unused `show`-suffix code in PersonRow if nothing else uses it.

- [ ] **Step 5: CSS** — in `matrix.css` inside the `#page-leavewar` wrapper, after the `.mx .bal.neg` rule:

```css
/* The two-line figure box (owner, 6 Sep 26). Two 11px lines fill the 22px
   cell — the balance, then the days taken under it. Tabular digits so a
   column of numbers lines up; the colours are the legend (matrix.css
   `.fu b`), the title above says which is which. */
.mx td.bal {
  vertical-align: top;
  padding: 0 1px;
  font-variant-numeric: tabular-nums;
  line-height: 11px;
}
.mx td.bal .fb {
  display: block;
  height: 11px;
  font-size: 10.5px;
  font-weight: 700;
  color: var(--ink);
}
.mx td.bal .fb.neg,
.mx td.bal .fb.red { color: var(--hard); }
.mx td.bal .fu {
  display: block;
  height: 11px;
  font-size: 9.5px;
  font-weight: 700;
  white-space: nowrap;
}
.mx td.bal .fu b { font-weight: 700; }
.mx td.bal .fu b + b { margin-left: 3px; }
.mx td.bal .fu b.amber { color: var(--adv); }
.mx td.bal .fu b.red { color: var(--hard); }
/* One authored motion: a box whose number just changed fades from the accent
   tint, once. Off under reduced motion. */
.mx td.bal.flash { animation: lw-figflash 700ms ease-out 1; }
@media (prefers-reduced-motion: reduce) { .mx td.bal.flash { animation: none; } }
```
Remove `font-size: 10.5px` / `font-weight: 700` / `color` from the shared `.mx .bal` rule ONLY if they now conflict (the header `th.bal` still relies on that rule's sticky/width parts — keep those). Keep `.mx .bal.neg { color: #FFAAB0 }` harmless or delete it once nothing sets `.neg` on the td. At the file's TOP LEVEL (beside `@keyframes lwx-follow`):
```css
@keyframes lw-figflash {
  from { background-color: rgba(59, 198, 232, .38); }
  to { background-color: transparent; }
}
```
The viewer's-row tint rule `.mx tbody tr.me .bal { background: #14333E }` must still win at rest: the animation only paints while running.

- [ ] **Step 6: Run the UI suites**

Run: `npx vitest run src/leavewar/ui/counters.test.tsx src/leavewar/ui/frozencols.test.tsx`
Expected: PASS except tests that belong to Task 5 (picker legend text, the person sheet's row count, the breakdown parts). List those in the commit message rather than editing sheet code here.

- [ ] **Step 7: Commit**

```bash
git add src/leavewar/ui/FigureCell.tsx src/leavewar/ui/Matrix.tsx src/leavewar/ui/matrix.css src/leavewar/ui/counters.test.tsx src/leavewar/ui/frozencols.test.tsx
git commit -m "feat(leavewar): the two-line figure box in the column, switch to the balance a leave comes off, flash on change"
```

---

### Task 4: The drawer — pops out beside the names, over the days

**Files:**
- Create: `src/leavewar/ui/FiguresDrawer.tsx`
- Modify: `src/leavewar/ui/Matrix.tsx` — state beside `picking` (~582), `bracketRow` corner cell (~1718), `headerRow` (add a `drawer` variant for the stuck mirror), the mirror's frozen copy width (~3143), the `.mx-outer` className (~2836), the `syncBandHeights` effect (generalise), render the drawer beside `.mxband` (~3221).
- Modify: `src/leavewar/ui/matrix.css`
- Test: `src/leavewar/ui/figdrawer.test.tsx` (new), `e2e/leavewar.spec.ts` (new tests; see Task 6 for the measured numbers)

**Interfaces:**
- Consumes: `visibleFigures`, `figureLines`, `titleLines`, `FigureCell`, `rosterSequence()` (Matrix-local), `figureCtx`, `zoom`/`zoomStyle`, `rosterBodyRef`, `headRef`, `mxOuterRef`, `setBalOpen`.
- Produces: `<FiguresDrawer figures ctx sequence zoom headRef bodyRef outerRef onBox onTitle />` rendering `div.mxdrawer[data-testid=figdrawer]`; the corner toggle `button.figbar[data-testid=figures-toggle][aria-expanded]`; a title pop-up `div.figpop[data-testid=figpop]`.

- [ ] **Step 1: Write the failing unit tests** — `figdrawer.test.tsx`:

```tsx
import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { getState, initStore, setRole, toggleFigure } from '../state/store'
import { memoryBackend } from '../state/storage'
import { Matrix } from './Matrix'

beforeEach(() => initStore(memoryBackend()))

// jsdom has no matchMedia, so the drawer opens CLOSED here (a real desktop
// browser opens it open — the e2e pins that); every test opens it by the bar.
const open = () => fireEvent.click(screen.getByTestId('figures-toggle'))

describe('the figures drawer (owner, 6 Sep 26)', () => {
  it('is closed at first, and the corner bar opens and closes it', () => {
    render(<Matrix />)
    const bar = screen.getByTestId('figures-toggle')
    expect(bar.textContent).toBe('▸ FIGURES')
    expect(bar.getAttribute('aria-expanded')).toBe('false')
    expect(screen.queryByTestId('figdrawer')).toBeNull()
    open()
    expect(screen.getByTestId('figdrawer')).toBeTruthy()
    expect(bar.textContent).toBe('▾ FIGURES')
    expect(bar.getAttribute('aria-expanded')).toBe('true')
    open()
    expect(screen.queryByTestId('figdrawer')).toBeNull()
  })
  it('shows every visible figure as a column, in the picker\'s order, titles coloured', () => {
    render(<Matrix />)
    open()
    const heads = [...screen.getByTestId('figdrawer').querySelectorAll('th.fig')]
    expect(heads.map(h => h.getAttribute('data-fig'))).toEqual(['lve', 'oil', 'ccl', 'fcl', 'cl', 'pl', 'lvetot', 'medtot'])
    const lve = heads[0]!.querySelectorAll('.rot')
    expect([...lve].map(l => l.textContent)).toEqual(['+LVE', '−LL −OL'])
    expect(lve[1]!.querySelector('b.amber')!.textContent).toBe('−LL')
    expect(lve[1]!.querySelector('b.red')!.textContent).toBe('−OL')
    expect(heads[1]!.querySelector('.rot')!.textContent).toBe('+OIL −OIL')
    expect(heads[6]!.querySelector('.rot b.red')!.textContent).toBe('−LVE TOT')
  })
  it('draws one box per person per figure, the same numbers the column shows', () => {
    render(<Matrix />)
    open()
    const box = screen.getByTestId('figdrawer').querySelector('[data-fig="lve"][data-person="ramp"] .fb')!
    expect(box.textContent).toBe(screen.getByTestId('bal-ramp').querySelector('.fb')!.textContent)
    expect(screen.getByTestId('figdrawer').querySelectorAll('td.fig[data-person="ramp"]')).toHaveLength(8)
  })
  it('a box opens that person\'s breakdown of THAT figure', () => {
    render(<Matrix />)
    open()
    fireEvent.click(screen.getByTestId('figdrawer').querySelector('[data-fig="medtot"][data-person="ramp"]')!)
    const sheet = screen.getByTestId('figure-breakdown')
    expect(sheet.textContent).toContain('MED TOT')
    expect(sheet.querySelector('.bidsheet-hd .who')!.textContent).toBe(getState().people.find(p => p.id === 'ramp')!.callsign)
  })
  it('a title opens a pop-up saying what the column counts, closed by an outside tap or Escape', () => {
    render(<Matrix />)
    open()
    fireEvent.click(screen.getByTestId('figdrawer').querySelector('th.fig[data-fig="lvetot"] button')!)
    expect(screen.getByTestId('figpop').textContent).toContain('All leave taken: LL + OL + OIL + CCL + FCL + CL + PL')
    fireEvent.pointerDown(document.body)
    expect(screen.queryByTestId('figpop')).toBeNull()
    fireEvent.click(screen.getByTestId('figdrawer').querySelector('th.fig[data-fig="lve"] button')!)
    expect(screen.getByTestId('figpop').textContent).toContain('opening + granted − LL − OL')
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByTestId('figpop')).toBeNull()
  })
  it('a hidden figure leaves the drawer', () => {
    setRole('admin')
    toggleFigure('fcl')
    render(<Matrix />)
    open()
    const heads = [...screen.getByTestId('figdrawer').querySelectorAll('th.fig')]
    expect(heads.map(h => h.getAttribute('data-fig'))).not.toContain('fcl')
    expect(heads).toHaveLength(7)
  })
  it('leaves the real table alone — one cell per row, the same as closed', () => {
    render(<Matrix />)
    const cells = document.querySelectorAll('.mx-wrap table.mx [data-testid="row-ramp"] > td').length
    open()
    expect(document.querySelectorAll('.mx-wrap table.mx [data-testid="row-ramp"] > td').length).toBe(cells)
    expect(screen.getAllByTestId(/^counter-head$/)).toHaveLength(1)
  })
})
```
Fix the callsign assertion to the seed's real callsign for `ramp` (read `engine/seed.ts`); the breakdown sheet's header prints the callsign and the figure label.

- [ ] **Step 2: Run — red**

Run: `npx vitest run src/leavewar/ui/figdrawer.test.tsx`
Expected: FAIL — no `figures-toggle`.

- [ ] **Step 3: Create `FiguresDrawer.tsx`**

```tsx
// THE FIGURES DRAWER (owner, 6 Sep 26): every figure for everyone, popped out
// to the right of the names OVER the day columns, from the roster header
// down. The manning rows, the month strip and the top controls do not move;
// the days keep working beside it.
//
// It is an OVERLAY, drawn once, like the phone's frozen `.mxband` — a second
// table outside the sideways scroller (`.mx-wrap`), absolutely positioned in
// `.mx-outer`, never a set of extra cells in the real table (every real row
// keeps identical cells — the owner's iPhone is the gate). Its rows copy the
// real rows' MEASURED heights (`syncOverlayHeights` in Matrix.tsx), for the
// same reason the band does: two independently laid out tables agree on
// nothing you have not measured.
//
// Titles are sideways, one line per column — "+OIL −OIL" — each word in the
// colour of the number under it; LVE takes two lines. The title IS the legend.
// Tapping a title opens a small pop-up with what the column counts; tapping a
// box opens that person's breakdown of that figure.
import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react'
import { figureLines, titleLines, type Figure, type FigureCtx, type Person } from '../engine'
import { FigureCell } from './FigureCell'

export type DrawerRow =
  | { kind: 'group'; key: string; label: string; n: number; colour?: string; folded: boolean }
  | { kind: 'catsub'; key: string; cat: string }
  | { kind: 'person'; key: string; p: Person; me: boolean }
  | { kind: 'blank'; key: string }   // an event row: name column + an empty box across the block

export function FiguresDrawer({
  figures, ctx, rows, zoom, top, left, headH, onBox,
}: {
  figures: Figure[]
  ctx: FigureCtx
  /** The rows to draw, in grid order, each keyed to the real row's testid
   *  (`row-<id>`, `group-<g>`, `subcat-<g>-<cat>`, `event-<n>`) so heights can
   *  be copied across. */
  rows: DrawerRow[]
  zoom: number
  /** The real header row's top and the names column's right edge, in `.mx-outer`
   *  pixels (measured by Matrix); null until laid out (jsdom: hidden). */
  top: number | null
  left: number
  /** The real header row's height in CSS px (the drawer's title row matches it). */
  headH: number
  onBox: (personId: string, figureId: string) => void
}) {
  const [pop, setPop] = useState<{ id: string; x: number; y: number } | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  // The title pop-up closes on an outside press or Escape (the app's click-open
  // popup rule, CLAUDE.md 4 Sep 26); a press on its own title toggles it.
  useEffect(() => {
    if (!pop) return
    const down = (e: PointerEvent) => {
      const t = e.target as HTMLElement | null
      if (t?.closest('.figpop') || t?.closest(`[data-fig="${pop.id}"] button`)) return
      setPop(null)
    }
    const key = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      const pg = document.getElementById('page-leavewar')
      if (pg && !pg.classList.contains('on')) return
      e.stopPropagation()
      setPop(null)
    }
    document.addEventListener('pointerdown', down, true)
    document.addEventListener('keydown', key, true)
    return () => { document.removeEventListener('pointerdown', down, true); document.removeEventListener('keydown', key, true) }
  }, [pop])

  const first = figures[0]?.id
  const last = figures[figures.length - 1]?.id
  const cls = (id: string) => `bal fig${id === first ? ' first' : ''}${id === last ? ' last' : ''}`
  return (
    <div
      className="mxdrawer"
      data-testid="figdrawer"
      ref={rootRef}
      style={{ top: top ?? 0, left, ...(top == null ? { visibility: 'hidden' as const } : null) }}
    >
      <table className="mx" style={zoom !== 1 ? ({ zoom, '--lwz': zoom } as import('react').CSSProperties) : undefined}>
        <tbody className="mxhead">
          <tr data-drawer-key="head" style={{ height: headH }}>
            {figures.map(f => (
              <th key={f.id} className={cls(f.id)} data-fig={f.id}>
                <button
                  className="figtitle"
                  aria-label={`${f.label} — what this column counts`}
                  aria-expanded={pop?.id === f.id}
                  onClick={e => {
                    const r = (e.currentTarget as HTMLElement).getBoundingClientRect()
                    setPop(p => (p?.id === f.id ? null : { id: f.id, x: r.left, y: r.bottom + 4 }))
                  }}
                >
                  {titleLines(f).map((line, i) => (
                    <span key={i} className="rot">
                      {line.map((w, j) => <b key={j} className={w.tone}>{j ? ' ' : ''}{w.text}</b>)}
                    </span>
                  ))}
                </button>
              </th>
            ))}
          </tr>
        </tbody>
        <tbody className="mxbody">
          {rows.map(r => {
            if (r.kind === 'group') return (
              <tr key={r.key} data-drawer-key={r.key} className={`grp${r.folded ? ' folded' : ''}`}>
                <td className="figfill" colSpan={figures.length} />
              </tr>
            )
            if (r.kind === 'catsub') return (
              <tr key={r.key} data-drawer-key={r.key} className="catsub"><td className="figfill" colSpan={figures.length} /></tr>
            )
            if (r.kind === 'blank') return (
              <tr key={r.key} data-drawer-key={r.key}><td className="figfill" colSpan={figures.length} /></tr>
            )
            return (
              <tr key={r.key} data-drawer-key={r.key} className={r.me ? 'me' : undefined}>
                {figures.map(f => (
                  <FigureCell
                    key={f.id}
                    figure={f}
                    lines={figureLines(f, ctx, r.p.id)}
                    personId={r.p.id}
                    extraClass={`${cls(f.id)} act`}
                    onClick={() => onBox(r.p.id, f.id)}
                    // data-fig / data-person ride through: FigureCell must spread
                    // `data` attributes — add `dataFig`/`dataPerson` props there.
                    dataFig={f.id}
                    dataPerson={r.p.id}
                  />
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
      {pop && (() => {
        const f = figures.find(x => x.id === pop.id)
        if (!f) return null
        return (
          <div className="figpop" data-testid="figpop" role="tooltip" style={{ left: pop.x, top: pop.y }}>
            <div className="figpop-hd">{f.label}</div>
            <div className="figpop-t">{f.desc}</div>
          </div>
        )
      })()}
    </div>
  )
}
```
Add to `FigureCell` two optional props `dataFig?: string; dataPerson?: string` rendered as `data-fig` / `data-person` on the `<td>`.

- [ ] **Step 4: Wire it into `Matrix.tsx`**

State (beside `picking`):
```tsx
  // The figures DRAWER (owner, 6 Sep 26): open on a desktop, closed on a phone
  // — a view preference, session-only, either role. Decided once at mount from
  // the same width query the phone flag uses; jsdom (no matchMedia) opens
  // closed so the unit suite sees the grid it always saw.
  const [figuresOpen, setFiguresOpen] = useState(() =>
    typeof window.matchMedia === 'function' && !window.matchMedia('(max-width: 700px)').matches)
  // Where the drawer sits: the real header row's top inside `.mx-outer` and the
  // names column's right edge, measured — never guessed — like `bandTop`.
  const [drawerAt, setDrawerAt] = useState<{ top: number; left: number; headH: number } | null>(null)
```
Corner cell in `bracketRow`:
```tsx
      <th className="brakhd" colSpan={2}>
        {/* The drawer's switch (owner, 6 Sep 26): the one empty frozen cell
            above CS/Name, sitting right above the column it unfolds; the stuck
            mirror draws the same copy so it is reachable however far down the
            roster has scrolled. */}
        <button
          className={`figbar${figuresOpen ? ' on' : ''}`}
          data-testid={testids ? 'figures-toggle' : undefined}
          aria-expanded={figuresOpen}
          title={figuresOpen ? 'Hide the figures' : 'Show every figure'}
          onClick={() => setFiguresOpen(o => !o)}
        >
          {figuresOpen ? '▾' : '▸'} FIGURES
        </button>
      </th>
```
`.mx-outer` className: append `${figuresOpen ? ' mx-figures' : ''}`. Measuring, in a `useLayoutEffect` that runs when `figuresOpen`, `zoom`, `visWindow`, `period.id`, `drawnDates.length`, `countsOpen`, `folded`, `figures.length` change (mirror the band's effect, including its `ResizeObserver` on `mxOuterRef` and the `resize` listener):
```tsx
    if (!figuresOpen) { setDrawerAt(null); return }
    const outer = mxOuterRef.current, head = headRef.current
    if (!outer || !head) return
    const headRow = head.querySelector<HTMLElement>('tr:last-child')
    const who = headRow?.querySelector<HTMLElement>('th.who')
    if (!headRow || !who) return
    const hr = headRow.getBoundingClientRect(), o = outer.getBoundingClientRect()
    if (hr.height === 0) { setDrawerAt(null); return }   // jsdom / not laid out
    setDrawerAt({ top: hr.top - o.top, left: who.getBoundingClientRect().right - o.left, headH: hr.height / zoom })
    syncOverlayHeights(drawerRef.current, rosterBodyRef.current, 'data-drawer-key')
```
Generalise `syncBandHeights` into `syncOverlayHeights(overlay, body, keyAttr)`: for each `tbody.mxbody > tr[keyAttr]` in the overlay, find `body.querySelector('[data-testid="<key>"]')` (the real row; for event rows use the `EventRows` rows' testids — read `EventRows.tsx` for them, e.g. `event-1`; if they have none, add `data-testid={`event-${line}`}` there) and copy `getBoundingClientRect().height / zoom` as the row's inline height. Keep the band calling it with `'data-band-key'`. Call it for the drawer in the same "every render" layout effect the band uses (`useLayoutEffect(() => { if (bandActive) …; if (figuresOpen) … })`).

The rows: build `drawerRows` from `rosterSequence()` — `group` → `{kind:'group', key:`group-${g}`, …}`, `catsub` → `{kind:'catsub', key:`subcat-${g}-${cat}`}`, `person` → `{kind:'person', key:`row-${p.id}`, p, me: p.id === viewer}` — prefixed by one `blank` row per event line (`key: `event-${n}``, n from 1..eventRows). Render, right after the `.mxband` block inside `.mx-outer`:
```tsx
        {figuresOpen && (
          <FiguresDrawer
            figures={figures}
            ctx={figureCtx}
            rows={drawerRows}
            zoom={zoom}
            top={drawerAt?.top ?? null}
            left={drawerAt?.left ?? 0}
            headH={drawerAt?.headH ?? 40}
            onBox={(person, figureId) => setBalOpen({ person, figureId })}
          />
        )}
```
with a `drawerRef` on it (pass a `ref` through `FiguresDrawer`'s `rootRef` via `forwardRef` or a `rootRef` prop). The stuck mirror: when `figuresOpen`, the frozen copy's width is the drawer's right edge — `style={{ width: figuresOpen && drawerAt ? drawerAt.left + drawerW : (s.cols[0] || 0) + (s.cols[1] || 0) }}` where `drawerW` is the drawer root's measured `offsetWidth` (store it in `drawerAt` as `width`); and `headerRow(false, true)` renders, in place of the `th.bal` chip, the drawer's title cells (`figures.map(f => <th className="bal fig" …>{titleLines…}</th>`) — extract the title-cell JSX into a small `FigureTitle` component exported from `FiguresDrawer.tsx` and use it in both. The mirror's `<colgroup>` then needs the drawer's column widths: `cols` = `[whoW, firstW, ...restW]` measured from the drawer's own header cells (`drawerRef.current.querySelectorAll('th.fig')`) — measure them in the same effect and keep them in `drawerAt.cols`.

- [ ] **Step 5: CSS** — inside the `#page-leavewar` wrapper in `matrix.css`:

```css
/* ---- THE FIGURES DRAWER (owner, 6 Sep 26) ---------------------------------
   An overlay beside the names, over the days — see FiguresDrawer.tsx. */
.mxdrawer {
  position: absolute;
  z-index: 5;            /* above the frozen band (4), below the sheets (79) */
}
.mxdrawer table.mx {
  width: auto;
  table-layout: fixed;
  background: var(--panel);
  box-shadow: 6px 0 14px rgba(0, 0, 0, .5);
}
/* Column widths: the first is the closed column (so the box does not move
   when the drawer opens), the rest as narrow as two digits and a half. */
.mxdrawer .mx .fig {
  position: static;
  left: auto;
  width: var(--figw); min-width: var(--figw); max-width: var(--figw);
  box-shadow: none;
  background: var(--panel);
}
.mxdrawer .mx .fig.first { width: var(--bal-w); min-width: var(--bal-w); max-width: var(--bal-w); }
.mxdrawer .mx .fig.last { box-shadow: inset -1px 0 0 var(--edge-2); }
.mxdrawer .mx .figfill { background: var(--panel); }
.mxdrawer .mx tbody tr.me td { background: #14333E; }
.mxdrawer .mx .mxhead th.fig {
  position: static;
  background: var(--panel-2);
  vertical-align: bottom;
  padding: 0;
}
.mxdrawer .figtitle,
.mxfixed .figtitle {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: 4px 0 5px;
  background: transparent;
  border: 0;
  color: inherit;
  font: inherit;
  cursor: pointer;
}
/* Sideways titles: bottom-to-top, one line per row, each word its colour. */
.mx .fig .rot {
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  display: inline-block;
  margin: 0 1px;
  font-size: 8.5px;
  font-weight: 700;
  letter-spacing: .06em;
  line-height: 1;
  white-space: nowrap;
  color: var(--ink-2);
}
.mx .fig .rot b { font-weight: inherit; }
.mx .fig .rot b.white { color: var(--ink); }
.mx .fig .rot b.amber { color: var(--adv); }
.mx .fig .rot b.red { color: var(--hard); }
/* While the drawer is open the real header row grows to the titles' height
   (62px), so the drawer's rows and the day rows beside it stay level; the
   mirror's frozen copy grows with it. Rows themselves do not grow. */
.mx-outer.mx-figures .mxhead tr:last-child > th { height: calc(62px / var(--lwz, 1)); }
.mx-outer.mx-figures .mxband td.bal { visibility: hidden; }  /* the drawer's first column covers it */
/* The switch in the corner above CS/Name — the archive bar's scale (HEM). */
.mx .mxhead th.brakhd .figbar {
  display: block;
  width: 100%;
  text-align: left;
  padding: 0 2px;
  background: transparent;
  border: 0;
  font: inherit;
  font-size: 9.5px;
  letter-spacing: .08em;
  font-weight: 700;
  color: var(--ink-3);
  line-height: 15px;
  white-space: nowrap;
  cursor: pointer;
}
.mx .mxhead th.brakhd .figbar.on { color: var(--accent); }
/* The title pop-up: what a column counts. Screen-fixed so the frozen columns
   cannot clip it; closes on an outside press (FiguresDrawer.tsx). */
.figpop {
  position: fixed;
  z-index: 71;
  max-width: 260px;
  padding: 8px 10px;
  background: var(--panel);
  border: 1px solid var(--edge-2);
  border-radius: 8px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, .45);
}
.figpop-hd { font-size: 9.5px; letter-spacing: .1em; text-transform: uppercase; color: var(--ink-3); font-weight: 700; margin-bottom: 3px; }
.figpop-t { font-size: 11.5px; color: var(--ink); line-height: 1.35; }
```
Widths: set `--figw: 36px` on `.mx-outer` in the desktop block and `--figw: 28px` in the `@media (max-width: 430px)` block, beside `--bal-w`. The drawer's `.rot` on a phone sits in a 28px column: two words of the LVE title (`+LVE` / `−LL −OL`) side by side need ≥ 20px — fine in the 44px first column.

- [ ] **Step 6: Run the unit tests**

Run: `npx vitest run src/leavewar/ui/figdrawer.test.tsx src/leavewar/ui/counters.test.tsx src/leavewar/ui/frozencols.test.tsx`
Expected: PASS.

- [ ] **Step 7: Build and look**

Run: `npm run build && (npx vite preview --port 4173 --strictPort &)` then a Playwright script (executablePath `/opt/pw-browsers/chromium`, `chromiumSandbox: false`, no proxy) that logs in `ad`/`a`, `window.go('leavewar')`, waits for `[data-testid="row-slipway"]`, and screenshots at iPhone 13 (390×1040, DPR 2) closed and open (click `figures-toggle`) and at 1440×900 open. LOOK at the screenshots: the drawer's rows level with the days beside it, titles coloured, the corner bar lit, the first column not moving. Fix what you see before committing.

- [ ] **Step 8: Commit**

```bash
git add src/leavewar/ui/FiguresDrawer.tsx src/leavewar/ui/FigureCell.tsx src/leavewar/ui/Matrix.tsx src/leavewar/ui/EventRows.tsx src/leavewar/ui/matrix.css src/leavewar/ui/figdrawer.test.tsx
git commit -m "feat(leavewar): the figures drawer — every figure beside the names, over the days, with sideways +/− titles"
```

---

### Task 5: The picker, the person sheet, the breakdown, the page Legend

**Files:**
- Modify: `src/leavewar/ui/CounterSheet.tsx` (all three sheets), `src/leavewar/ui/bidpicker.css` (the `.clegend` key), `src/leavewar/ui/Chrome.tsx` (the Legend pop-out, ~457), `src/leavewar/ui/chrome.css`
- Test: `src/leavewar/ui/counters.test.tsx` (the picker/person/breakdown describes), `src/leavewar/ui/chrome.test.tsx` or wherever the Legend is tested (grep `legend-open`)

**Interfaces:**
- Consumes: `visibleFigures`, `orderedFigures`, `toggleFigure`, `figureLines`, `titleLines`, `Figure.desc`.
- Produces: picker rows `counter-<id>` for the eight; admin eye `figeye-<id>` (`aria-pressed` = hidden); the key `counter-legend` reads `+ balance · − used · LL amber · OL red`; person sheet rows `pfig-<id>` ×8 with `Set` on `lve`, `ccl`, `fcl`, `cl`, `pl`; Legend section `legend-figures`.

- [ ] **Step 1: Write the failing tests** — in `counters.test.tsx` replace the affected assertions:

```ts
it('states the key once and each column\'s meaning under its row', () => {
  render(<Matrix />)
  fireEvent.click(screen.getByTestId('counter-pick'))
  expect(screen.getByTestId('counter-legend').textContent).toBe('+ balance left · − days used · LL amber · OL red')
  expect(screen.getByTestId('figsub-lvetot').textContent).toBe('All leave taken: LL + OL + OIL + CCL + FCL + CL + PL')
  expect(screen.getByTestId('figsub-lve').textContent).toBe('Balance of local + overseas leave: opening + granted − LL − OL')
})
it('shows the viewing person\'s box on each row — balance and used', () => {
  setViewer('ramp')
  render(<Matrix />)
  fireEvent.click(screen.getByTestId('counter-pick'))
  expect(screen.getByTestId('counter-lve').querySelector('.fb')!.textContent).toBe('26')
})
it('offers an admin an eye per figure; hiding one drops it from the column\'s cycle', () => {
  setRole('admin')
  render(<Matrix />)
  fireEvent.click(screen.getByTestId('counter-pick'))
  fireEvent.click(screen.getByTestId('figeye-pl'))
  expect(screen.getByTestId('figeye-pl').getAttribute('aria-pressed')).toBe('true')
  expect(getState().figureHidden).toEqual(['pl'])
  fireEvent.click(screen.getByTestId('counter-cancel'))
  // the column cycles seven now
  expect(screen.getByTestId('counter-head').querySelectorAll('.cdot')).toHaveLength(7)
})
it('offers a member no eye', () => {
  render(<Matrix />)
  fireEvent.click(screen.getByTestId('counter-pick'))
  expect(screen.queryByTestId('figeye-pl')).toBeNull()
})
// the person sheet
it('lists the eight with that person\'s numbers, Set on every plain balance', () => {
  setRole('admin')
  render(<Matrix />)
  fireEvent.click(screen.getByTestId('person-ramp'))
  const sheet = screen.getByTestId('person-figures')
  expect(sheet.querySelectorAll('.crow-wrap')).toHaveLength(8)
  for (const id of ['lve', 'ccl', 'fcl', 'cl', 'pl']) expect(screen.getByTestId(`${id}-edit`)).toBeTruthy()
  expect(screen.queryByTestId('oil-edit')).toBeNull()   // OIL is the tracker's
})
// the breakdown
it('breaks LVE into opening, granted, LL taken and OL taken, summing to the balance', () => {
  setRole('admin')
  setCell('ramp', '2026-03-02', 'LL')
  setCell('ramp', '2026-03-04', 'OL')
  render(<Matrix />)
  fireEvent.click(screen.getByTestId('bal-ramp'))
  const rows = [...screen.getByTestId('figure-breakdown').querySelectorAll('.crow-top .cn')].map(e => e.textContent)
  expect(rows).toEqual(['opening figure', 'granted', 'LL taken', 'OL taken', 'Total'])
  expect(screen.getByTestId('breakdown-total').textContent).toContain('24')
})
```
And for the Legend (find the existing Legend test by `legend-open`; add):
```ts
it('explains the figures — the colours and each column', () => {
  render(<Chrome … />)   // as the existing legend test renders it
  fireEvent.click(screen.getByTestId('legend-open'))
  const sec = screen.getByTestId('legend-figures')
  expect(sec.textContent).toContain('white')
  expect(sec.textContent).toContain('amber')
  expect(sec.textContent).toContain('+LVE')
  expect(sec.textContent).toContain('Medical days: ATT C + HL + OML')
})
```
Delete the old assertions on thirteen rows, `'OIL USED'`, `figsub-med`, `figsub-lvecon`, `USED = days taken`.

- [ ] **Step 2: Run — red**

Run: `npx vitest run src/leavewar/ui/counters.test.tsx`
Expected: FAIL on the new picker/person/breakdown assertions.

- [ ] **Step 3: Implement the picker** — `CounterSheet` in `CounterSheet.tsx`:
  - `const figures = orderedFigures(figureOrder)` (the picker lists ALL, hidden ones dimmed with the eye pressed; the COLUMN and DRAWER use `visibleFigures()`).
  - Header `dt`: `arranging ? ' · tap a figure · ▲▼ to reorder · eye to hide' : ' · tap a figure to show it in the column'`.
  - Key: `<div className="clegend" data-testid="counter-legend"><b>+</b> balance left · <b>−</b> days used · <b className="amber">LL</b> amber · <b className="red">OL</b> red</div>` — the test reads the textContent exactly `'+ balance left · − days used · LL amber · OL red'`; make the markup produce that text.
  - Each row: `.cn` = `f.label`; the value cell becomes a mini box: `me ? <span className="ct fbox"><span className="fb">{show(lines.top)}</span>{used…}</span> : '—'` using `figureLines(f, ctx, me.id)` — reuse the `.fb`/`.fu` classes from matrix.css by giving the span the same structure and adding matching rules in bidpicker.css (`.crow .fbox .fb { color: var(--ink); font-weight: 700 } .crow .fbox .fu b.amber { color: var(--adv) } .crow .fbox .fu b.red { color: var(--hard) } .crow .fbox .fb.neg, .crow .fbox .fb.red { color: var(--hard) }`).
  - Caption `.csub` (`figsub-<id>`) = `f.desc` on every row (the owner's words are the legend now).
  - Admin: beside ▲▼ add `<button className="cmv figeye" data-testid={`figeye-${f.id}`} aria-pressed={hidden.has(f.id)} aria-label={hidden.has(f.id) ? `Show ${f.label}` : `Hide ${f.label}`} onClick={() => toggleFigure(f.id)}>{hidden.has(f.id) ? '⊘' : '👁'}</button>` — use the same glyph the manning rows' eye uses (grep `mrow-tools` in CountRows.tsx and copy it); a hidden row gets class `crow-wrap hidden` (dim it: `.crow-wrap.hidden .crow { opacity: .45 }`). "Reset order" → "Reset" (it now shows everything too).
  - `onPick` on a hidden figure: show it first (`toggleFigure`) is NOT done silently — instead a hidden row's tap is a no-op for a member and, for an admin, un-hides then picks. Keep it simple: `onClick={() => { if (hidden.has(f.id) && !arranging) return; if (hidden.has(f.id)) toggleFigure(f.id); onPick(f.id); onClose() }}`.

- [ ] **Step 4: The person sheet** — `PersonFiguresSheet`: `const figures = visibleFigures()`; row value = the same mini box (`figureLines(f, ctx, person.id)`); `toOil = f.id === 'oil' && !!onOpenOil`; `settable = !!f.counter && f.counter !== 'oil' && !!onSetBalance` (this already yields Set on lve/ccl/fcl/cl/pl); caption: `toOil ? 'tap to open the OIL tracker · oldest credit is used first' : settable ? `set by admin · ${f.used.map(u => u.label).join(' and ')} deduct${f.used.length === 1 ? 's' : ''} from it` : f.desc`; the key line under the header: the same `+ balance left · − days used · LL amber · OL red`. Store's `setBalance` already accepts any counter — no store change.

- [ ] **Step 5: The breakdown** — `FigureBreakdownSheet`: the `cur` line `figure.kind === 'bal' ? 'balance left' : 'days taken'` still reads right; the rows come from `figureParts` (Task 1 already splits LL/OL). Nothing else.

- [ ] **Step 6: The page Legend** — in `Chrome.tsx` after the half-day section and before `CODE_GLOSSARY`:

```tsx
              {/* The figures (owner, 6 Sep 26): the colours the boxes and the
                  column titles wear, then what each column counts — read off
                  the figure catalogue so this can never drift from the grid. */}
              <div data-testid="legend-figures">
                <div className="leg-sec">The figures — the colours</div>
                <div className="leg-row"><span className="leg-sw plain figw">26</span><span className="leg-t">white — balance left (+ in the title)</span></div>
                <div className="leg-row"><span className="leg-sw plain figa">3</span><span className="leg-t">amber — local leave (LL) taken</span></div>
                <div className="leg-row"><span className="leg-sw plain figr">2</span><span className="leg-t">red — overseas leave (OL) taken, days used, or a total (− in the title)</span></div>
                <div className="leg-row"><span className="leg-sw plain figr">−4</span><span className="leg-t">red with a minus — a balance below zero</span></div>
                <div className="leg-sec">The figures — each column</div>
                {FIGURES.map(f => (
                  <div key={f.id} className="leg-row"><span className={`leg-sw plain ${f.kind === 'bal' ? 'figw' : 'figr'}`}>{f.title}</span><span className="leg-t">{f.desc}</span></div>
                ))}
              </div>
```
Import `FIGURES` from the engine. In `chrome.css` beside the other `.leg-sw` colours: `.leg-sw.figw { color: var(--ink); } .leg-sw.figa { color: var(--adv); } .leg-sw.figr { color: var(--hard); }`. The `LEGEND_WIDTH` constant may need +40px if `−MED TOT` wraps — check the screenshot.

- [ ] **Step 7: Run the suites**

Run: `npx vitest run src/leavewar/ui/counters.test.tsx src/leavewar/ui/figdrawer.test.tsx src/leavewar/ui/frozencols.test.tsx src/leavewar/ui/chrome.test.tsx`
Expected: PASS. Then `npx vitest run --project leavewar` (whole project) — fix any other file that named the old figure ids/labels (`oiltracker.test.tsx`, `settingssheet.test.tsx`, `wars.test.tsx`…), rewriting each assertion to the new truth.

- [ ] **Step 8: Commit**

```bash
git add src/leavewar/ui/CounterSheet.tsx src/leavewar/ui/bidpicker.css src/leavewar/ui/Chrome.tsx src/leavewar/ui/chrome.css src/leavewar/ui/*.test.tsx
git commit -m "feat(leavewar): picker, person sheet and Legend speak the eight figures; admin eye per figure"
```

---

### Task 6: e2e, ceilings, docs, the gates

**Files:**
- Modify: `e2e/leavewar.spec.ts` — every test naming `LVE BAL`/`OIL USED`/thirteen rows/`bal-*` text (read the top line via `.fb`), plus the new drawer tests below; `probes/perf-port.cjs` only if a Leave War ceiling lives there (it does not today — the ceilings are in the e2e `sane DOM size` test).
- Modify docs: `docs/ui-contracts.md` (a new section "The figures drawer and the two-line box (owner, 6 Sep 26)"), `docs/leavewar/known-gaps.md` (§The counter column is figures — rewrite to the eight), `docs/feature-impact.md` (a "Leave War figures" entry: surfaces = column, drawer, picker, person sheet, breakdown, Legend, OIL tracker's BAL, the snap on entry, the Set; drift-seam = the figure catalogue is the ONE source), `HANDOFF.md` (the PR bullet + the iPhone-unverified list), `BUG-TESTING.md` (a new row), `.claude/skill-observations/log.md` (the orchestrator appends).

- [ ] **Step 1: Write the e2e tests** (both projects unless gated):

```ts
// ---- the figures drawer (owner, 6 Sep 26) ----
const isPhone2 = () => test.info().project.name === 'lw-phone'

test('the drawer opens closed on a phone and open on a desktop', async ({ page }) => {
  const bar = page.locator('[data-testid="figures-toggle"]')
  await expect(bar).toHaveAttribute('aria-expanded', isPhone2() ? 'false' : 'true')
  if (isPhone2()) expect(await page.locator('[data-testid="figdrawer"]').count()).toBe(0)
  else await expect(page.locator('[data-testid="figdrawer"]')).toBeVisible()
})

test('the drawer sits beside the names, its rows level with the days, and closing restores the header', async ({ page }) => {
  const bar = page.locator('[data-testid="figures-toggle"]')
  const headBefore = (await page.locator('.mx-wrap .mxhead tr:last-child').boundingBox())!
  if ((await bar.getAttribute('aria-expanded')) === 'false') await bar.click()
  const drawer = page.locator('[data-testid="figdrawer"]')
  await expect(drawer).toBeVisible()
  const who = (await frozen(page, 'slipway', '.who').boundingBox())!
  const d = (await drawer.boundingBox())!
  expect(Math.abs(d.x - (who.x + who.width))).toBeLessThan(1.5)
  // level rows: the drawer's copy of a row and the real row share a top edge
  const real = (await page.locator('[data-testid="row-slipway"]').boundingBox())!
  const copy = (await drawer.locator('[data-drawer-key="row-slipway"]').boundingBox())!
  expect(Math.abs(copy.y - real.y)).toBeLessThan(1.5)
  expect(Math.abs(copy.height - real.height)).toBeLessThan(1.5)
  // eight columns, titles coloured
  await expect(drawer.locator('th.fig')).toHaveCount(8)
  await expect(drawer.locator('th.fig[data-fig="lve"] .rot')).toHaveCount(2)
  const amber = await drawer.locator('th.fig[data-fig="lve"] b.amber').evaluate(el => getComputedStyle(el).color)
  expect(amber).toBe('rgb(229, 168, 59)')
  // and the days are still there beside it
  if (isPhone2()) {
    const wrap = (await page.locator('.mx-wrap').boundingBox())!
    const day = (await page.locator('.mx-wrap .mxhead th.day').first().boundingBox())!
    expect((wrap.x + wrap.width - (d.x + d.width)) / day.width).toBeGreaterThan(4)
  }
  await bar.click()
  expect(await drawer.count()).toBe(0)
  const headAfter = (await page.locator('.mx-wrap .mxhead tr:last-child').boundingBox())!
  expect(Math.abs(headAfter.height - headBefore.height)).toBeLessThan(1.5)
})

test('a drawer box opens that person\'s breakdown of that figure; a title says what it counts', async ({ page }) => {
  const bar = page.locator('[data-testid="figures-toggle"]')
  if ((await bar.getAttribute('aria-expanded')) === 'false') await bar.click()
  const drawer = page.locator('[data-testid="figdrawer"]')
  await drawer.locator('td.fig[data-fig="medtot"][data-person="slipway"]').click()
  await expect(page.locator('[data-testid="figure-breakdown"]')).toContainText('MED TOT')
  await page.locator('[data-testid="breakdown-close"]').click()
  await drawer.locator('th.fig[data-fig="lvetot"] button').click()
  await expect(page.locator('[data-testid="figpop"]')).toContainText('All leave taken')
  await page.keyboard.press('Escape')
  expect(await page.locator('[data-testid="figpop"]').count()).toBe(0)
})

test('the stuck header carries the drawer titles and the switch once the roster has scrolled', async ({ page }) => {
  const bar = page.locator('[data-testid="figures-toggle"]')
  if ((await bar.getAttribute('aria-expanded')) === 'false') await bar.click()
  await page.evaluate(() => window.scrollBy(0, 700))
  await page.waitForTimeout(300)
  const mirror = page.locator('[data-testid="sticky-head"]')
  await expect(mirror).toBeVisible()
  await expect(mirror.locator('.figbar').first()).toContainText('FIGURES')
  await expect(mirror.locator('th.fig').first()).toBeVisible()
})

test('the column follows the leave just entered to the balance it comes off', async ({ page }) => {
  await lwRole(page, 'admin')
  await pickCounter(page, 'medtot')
  await page.locator('[data-testid="cell-slipway-2026-03-02"]').click()
  await page.locator('[data-testid="bid-LL"]').click()
  await expect(page.locator('[data-testid="counter-name"]')).toHaveText('+LVE')
})
```
Then update the existing tests: `'LVE BAL'` → `'+LVE'`; `pickCounter(page, 'oil')` expectations → `'+OIL'`; `bal-*` text reads → `.fb`; `person-figures` `.crow-wrap` 13 → 8; the `sane DOM size` test gains a second measurement with the drawer open — measure it first on both projects, write the number and a ceiling with ~10% headroom, in the same comment style the test already carries. The three swipe tests gated on `'phone'` — fix the gate to `'lw-phone'` so they run (they were never running), and make their expectations the new titles.

- [ ] **Step 2: Run the e2e** (builds and serves itself): `npx playwright test e2e/leavewar.spec.ts --project=lw-phone` then `--project=lw-desktop`. Fix what fails by understanding it (a level-rows failure is a real bug in the height sync, not a tolerance to widen).

- [ ] **Step 3: The docs** — write each entry in the file's own voice (owner + date, the WHY, the load-bearing bits): `ui-contracts.md` gets the geometry contract (drawer left = names' right edge; rows level; header 62px while open; widths 44/28 phone, 72/36 desktop; the corner bar; the stuck mirror's copy; the pop-up rule; the flash — one motion, reduced-motion off); `known-gaps.md` rewrites §The counter column is figures to the eight (drop the thirteen list, keep the history in one line, note CCL/FCL/PL balances now surfaced and settable); `feature-impact.md` gets the entry; `HANDOFF.md` the bullet (unmerged PR, iPhone-unverified: the overlay heights on WebKit, the stuck mirror width while open, the flash paint) and the file map rows for `FigureCell.tsx` / `FiguresDrawer.tsx`; `BUG-TESTING.md` a row "#NNN Leave War figures drawer" with the owner's checklist (opens closed on the phone, ▸ FIGURES, eight columns, colours, tap a title, tap a box, close and the days are where they were, the column follows a leave, the box flashes).

- [ ] **Step 4: The gates, once** — from `raptor-port/`: `npm test`, `npm run build`, `node reference/tfin.js` (728/0), `npm run test:e2e`; then `npm run build && npx vite preview --port 4173` and `npm run probes:adapted`, `npm run perf`; then the impeccable detector once: `node /home/user/Raptor/.claude/skills/impeccable/scripts/detect.mjs --json src/leavewar/ui/FiguresDrawer.tsx src/leavewar/ui/FigureCell.tsx src/leavewar/ui/matrix.css src/leavewar/ui/CounterSheet.tsx` — act on real findings.

- [ ] **Step 5: Commit**

```bash
git add e2e/leavewar.spec.ts docs HANDOFF.md BUG-TESTING.md
git commit -m "test+docs(leavewar): the figures drawer — e2e at both widths, contracts, impact map, handoff"
```
