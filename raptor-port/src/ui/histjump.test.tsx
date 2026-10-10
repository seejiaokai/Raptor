// @vitest-environment jsdom
/* [HIST-JUMP-EMPTY-SEAT] — A TAP ON A CHANGE WHOSE SEAT IS EMPTY NOW LANDS ON ITS ROW (the owner's find, 10 Oct 26, on
   his iPhone: "It says the detail is shown on the scheduler board. But when I go to the schedule board and click the
   same thing it says the detail is shown on the week, not on the board").

   A "moved in / moved out" line names ONE place: the seat on its row. A row that lists its people draws a seat only
   while someone is in it, so an emptied seat is drawn on neither page — and the tap, finding the row still standing,
   concluded the detail was on the OTHER page and said so. Each page sent him to the other.

   THE ROLL-CALL IS THE LOOP (docs/bug-check-order.md §8.1): every kind of seat a change line can name, emptied, on
   BOTH pages that edit — and the read-only page beside them. Driven through the changes window's own lines, by the
   engine's own writers (the drop's fillSlot, the tap-off's setSlotVal).

   What this file cannot prove: jsdom has no layout, so the scroll is a no-op here — that the landing is brought on
   screen, on a phone too, is measured in e2e/geometry.spec.ts. */
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { App } from './App'
import { initStore, setSession, notify } from '../state/store'
import { setSlotVal, slotVal, fillSlot, lastFilled, txtSet } from '../engine/slots'
import { DAYS } from '../engine/data'
import { makeStandalone } from '../engine/waves'
import { PEOPLE } from '../engine/people'
import { ridKey, ensureRowIds } from '../engine/rowids'
import { elogClear } from '../engine/editlog'
import { SCHED, signOf, setDayApproved } from '../engine/publish'
import { moveProgRow } from '../engine/reorder'
import { HOOKS } from '../engine/hooks'
import * as view from '../state/view'
import { openScheduler, closeScheduler } from './board'
import { hideHistBub, HIST_CELLS, histKeyOf, onlyOn } from './histbubble'
import { jumpToChange } from './interactions'
import { toggleOilMode, oilModeOn } from './oilmode'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

const $ = (s: string) => document.querySelector(s) as HTMLElement
const $$ = (s: string) => [...document.querySelectorAll(s)] as HTMLElement[]
const click = async (el: Element | null | undefined) => {
  expect(el, 'click target exists').toBeTruthy()
  await act(async () => { (el as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true })) })
}
/* the jump acts on the repainted page one task later */
const settle = async () => act(async () => { await new Promise(r => setTimeout(r, 20)) })

type Surf = 'board' | 'week'
const SURFS: Surf[] = ['board', 'week']
const DI = 0
const day = (): any => (DAYS as any)[DI]
const goto = async (s: Surf) => act(async () => { if (s === 'board') openScheduler(DI); else closeScheduler(); notify() })
const rootOf = (s: Surf) => (s === 'board' ? $('.sb-boardwrap') : $(`#eWeek .day[data-day="${DI}"]`))
/* the one changes window, every change of the week — by the board's History button, or the admin's clock on the week */
const openList = async (s: Surf) => {
  if (!document.querySelector('.chgwin:not([hidden])')) await click($(s === 'board' ? '#sbHist' : '#histBtn'))
  await click($$('.chgwin .win-tab').find(b => /All changes/.test(b.textContent || '')))
  await click($$('.chgwin .cw-day').find(b => b.textContent === 'Week'))
}
const lineFor = (key: string) => $$('.chgwin button.cw-l').find(l => l.dataset.cwkey === String(ridKey(key, DAYS)))
/* tap a line (or hand the jump a place), and hear what the page said */
async function tapped(go: () => Promise<void> | void) {
  const said: string[] = []
  const real = HOOKS.toast
  HOOKS.toast = ((m: any) => { said.push(String(m)) }) as any
  try { await go(); await settle() } finally { HOOKS.toast = real }
  return { said: said.join(' | '), lit: document.querySelector('.chgflash') as HTMLElement | null }
}
const WRONG = /shown on the (scheduler board|week)|no longer on this day|not shown/

/* someone real, who is not on that row already (a man goes on a row once — D271) */
const men = () => Object.keys(PEOPLE).filter(k => !(PEOPLE as any)[k].special && !(PEOPLE as any)[k].pers && !(PEOPLE as any)[k].archived)
function addTo(base: string): { key: string; man: string } {
  for (const man of men()) { if (fillSlot(base + '.+', man) && lastFilled()) return { key: String(lastFilled()), man } }
  throw new Error('nobody could be added to ' + base)
}
function seat(key: string): { key: string; man: string } {
  const man = men().find(m => m !== slotVal(key))!
  setSlotVal(key, man)
  return { key, man }
}

/* EVERY KIND OF SEAT A CHANGE LINE CAN NAME, on Monday's own rows. `base` is the row; `put` puts a man on it the way a
   drop does and answers the place he took. Where a page draws the seat EMPTY (`emptyDrawn` — a flying seat's "+ FCP"
   on both, a sim's seats and passengers on the board), the tap lands on the seat itself and nothing is said. Where a
   page draws no people on the row at all (`nameOnly` — the board's AMT brief row), it lands on the row's name. */
type Kind = { name: string; base: () => string | null; put: (base: string) => { key: string; man: string }; emptyDrawn?: Surf[]; nameOnly?: Surf[] }
const first = (arr: any[] | undefined, ok: (r: any) => boolean = () => true) => { const i = (arr || []).findIndex(ok); return i < 0 ? null : i }
const briefRow = (r: any) => /^\s*BRIEF|DEBRIEF/i.test(r.label || '')
const simRow = (ok: (r: any, kind: string) => boolean) => { for (const k of ['oft', 'amt']) { const i = first(day().sims?.[k], r => ok(r, k)); if (i != null) return `s:${DI}.${k}.${i}` } return null }
const twoSeat = () => simRow(r => !Array.isArray(r.pax) && !briefRow(r))
const fillBoth = (b: string) => { if (!slotVal(b + '.p')) seat(b + '.p'); if (!slotVal(b + '.w')) seat(b + '.w') }
const KINDS: Kind[] = [
  { name: 'a Common Programme row', base: () => { const i = first(day().allhands); return i == null ? null : `a:${DI}.${i}` }, put: addTo },
  { name: 'a duty desk', base: () => (first(day().dutywaves?.[0]?.rows) == null ? null : `d:${DI}.0.0`), put: seat },
  { name: "a duty desk's extra people", base: () => (first(day().dutywaves?.[0]?.rows) == null ? null : `d:${DI}.0.0`), put: b => { if (!slotVal(b)) seat(b); return addTo(b) } },
  { name: "a sim's passengers", base: () => simRow(r => Array.isArray(r.pax)), put: b => addTo(b + '.pax'), emptyDrawn: ['board'] },
  { name: "a sim's seat", base: twoSeat, put: b => seat(b + '.p'), emptyDrawn: ['board'] },
  /* a sim row always shows one spare seat on the board, even when it is full (D50) */
  { name: "a sim's extra people", base: twoSeat, put: b => { fillBoth(b); return addTo(b) }, emptyDrawn: ['board'] },
  { name: 'an AMT brief row', base: () => simRow((r, k) => k === 'amt' && !Array.isArray(r.pax) && briefRow(r)), put: b => seat(b + '.p'), nameOnly: ['board'] },
  { name: 'a ground row', base: () => { const i = first(day().ground, r => !r.src); return i == null ? null : `g:${DI}.${i}` }, put: seat },
  { name: "a ground row's extra people", base: () => { const i = first(day().ground, r => !r.src); return i == null ? null : `g:${DI}.${i}` }, put: b => { if (!slotVal(b)) seat(b); return addTo(b) } },
  { name: 'a flying seat', base: () => `${DI}.0.0.0`, put: b => seat(b + '.p'), emptyDrawn: ['board', 'week'] },
]
/* the row a place sits on, as the people box of both pages names it — and its name box */
const rowOf = (key: string) => key.replace(/\.pax\.\d+$/, '').replace(/\.x\d+$/, '').replace(/^(a:\d+\.\d+)\.\d+$/, '$1').replace(/^(s:\d+\.\w+\.\d+)\.[pw]$/, '$1')
const nameOf = (row: string) => ({ a: 'ap', d: 'dr', s: 'sr', g: 'gr' } as any)[row[0]!] + row.slice(1) + '.' + ({ a: 'prog', d: 'role', s: 'label', g: 'prog' } as any)[row[0]!]

let host: HTMLDivElement
let root: Root
let DAYS0 = '', SCHED0 = ''
beforeAll(async () => {
  initStore()
  ensureRowIds(DAYS)
  DAYS0 = JSON.stringify(DAYS)
  SCHED0 = JSON.stringify(SCHED)
  HOOKS.isPhone = () => false
  host = document.createElement('div')
  document.body.appendChild(host)
  root = createRoot(host)
  await act(async () => { root.render(<App />) })
  await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
  await click($$('.nav a[data-page]').find(a => a.dataset.page === 'editsched'))
})
/* unmount before the file ends — a render task left queued would fire after jsdom is torn down (histlist.test.tsx) */
afterAll(async () => {
  await act(async () => { root.unmount() })
  host.remove()
})
beforeEach(async () => {
  JSON.parse(DAYS0).forEach((d: any, i: number) => { (DAYS as any)[i] = d })
  /* a test that published Monday, or looked at an older version of it, leaves neither behind */
  Object.assign(SCHED, JSON.parse(SCHED0)); view.DPREV.clear()
  elogClear(); hideHistBub()
  $$('.chgflash').forEach(e => e.classList.remove('chgflash'))
  await act(async () => { view.setChgWin(null); closeScheduler(); notify() })
})

describe('Monday carries every kind of row the roll-call names', () => {
  it.each(KINDS.map(k => [k.name, k] as const))('%s', (_n, k) => {
    expect(k.base(), 'the demo Monday has one').toBeTruthy()
  })
})

describe.each(SURFS)('a change whose seat is EMPTY now — tapped on the %s', s => {
  it.each(KINDS.map(k => [k.name, k] as const))('%s: the tap lands on its row, and sends him to no other page', async (_n, k) => {
    await goto(s)
    const base = k.base()!
    let key = ''
    await act(async () => { key = k.put(base).key; setSlotVal(key, ''); notify() })
    expect(slotVal(key), 'the seat is empty again').toBe('')
    await openList(s)
    const line = lineFor(key)
    expect(line, 'his move is a line that can be tapped').toBeTruthy()
    const { said, lit } = await tapped(() => click(line))
    expect(said, 'no sentence about another page, a missing row or a hidden detail').not.toMatch(WRONG)
    expect(lit, 'something on the page is marked').toBeTruthy()
    expect(rootOf(s).contains(lit), 'and it is on this page, on Monday').toBe(true)
    const own = lit!.dataset.slot === key
    if (k.emptyDrawn && k.emptyDrawn.includes(s)) {
      /* a seat drawn empty is the place itself: nothing more to say */
      expect(own, 'the empty seat itself').toBe(true)
      expect(said).toBe('')
      return
    }
    expect(own, 'the seat is not drawn while empty').toBe(false)
    const row = rowOf(key)
    if (k.nameOnly && k.nameOnly.includes(s)) expect(histKeyOf(lit!), `the mark is on the name of ${row}`).toBe(nameOf(row))
    else expect(lit!.dataset.fill, `the mark is on the people box of ${row}`).toBe(row + '.+')
    expect(said, 'one short sentence says why').toBe('That seat is empty now')
  })
})

describe('a man who IS in his seat, on a row the board draws no people on', () => {
  it('the tap lands on his row\'s name, and does not call the seat empty', async () => {
    await goto('board')
    const k = KINDS.find(x => x.name === 'an AMT brief row')!
    let key = ''
    await act(async () => { key = k.put(k.base()!).key; notify() })
    expect(slotVal(key)).toBeTruthy()
    await openList('board')
    const { said, lit } = await tapped(() => click(lineFor(key)))
    expect(said).toBe('')
    expect(lit && histKeyOf(lit), 'the name of his row').toBe(nameOf(rowOf(key)))
  })
})

describe.each(SURFS)('a change whose seat ANOTHER man has since taken (D733) — tapped on the %s', s => {
  it('lands on that place, whoever stands there now, and says nothing', async () => {
    await goto(s)
    const base = KINDS[0]!.base()!
    let key = '', other = ''
    await act(async () => {
      const a = addTo(base); key = a.key
      other = men().find(m => m !== a.man && fillSlot(base + '.+', m) && !!lastFilled())!
      /* the second man moves into the first man's place: the first leaves, the second is dropped on his seat */
      const k2 = String(lastFilled()); setSlotVal(k2, ''); setSlotVal(key, other); notify()
    })
    expect(slotVal(key)).toBe(other)
    await openList(s)
    const { said, lit } = await tapped(() => click(lineFor(key)))
    expect(said).toBe('')
    expect(lit && lit.dataset.slot, 'the place itself').toBe(key)
  })
})

describe.each(SURFS)('a change whose ROW has since been deleted — tapped on the %s', s => {
  it('keeps today\'s words: "no longer on this day"', async () => {
    await goto(s)
    const base = KINDS[0]!.base()!
    let key = ''
    await act(async () => { key = addTo(base).key; notify() })
    await openList(s)
    const line = lineFor(key)
    expect(line).toBeTruthy()
    /* the row goes, straight out of the model — the delete itself is not what is under test */
    await act(async () => { day().allhands.splice(+base.split('.')[1]!, 1); notify() })
    const { said, lit } = await tapped(() => click(line))
    expect(said).toContain('no longer on this day')
    expect(lit).toBeNull()
  })
})

/* "SHOWN ON THE SCHEDULER BOARD" / "SHOWN ON THE WEEK" ARE SAID ONLY WHERE THEY ARE TRUE — decided from the kind of box
   (histbubble.ts onlyOn), never from "not found here". The proof is the roll-call of the boxes themselves: every text
   box either page draws, on every day of the demo week, set against what the other page draws. */
describe('a box said to be on the other page really is there, and only there', () => {
  const textKeys = (root: ParentNode | null) => {
    const s = new Set<string>()
    if (root) [...root.querySelectorAll(HIST_CELLS)].forEach(e => {
      const k = histKeyOf(e as HTMLElement), p = k.slice(0, Math.max(0, k.indexOf(':')))
      /* seats and inputs' rows are places, not boxes: an empty one is the row's business, above */
      if (k && p && !['a', 'd', 's', 'g', 'iu'].includes(p)) s.add(k)
    })
    return s
  }
  it('every box one page draws and the other does not is named by onlyOn — and no box both draw is', async () => {
    const week = new Set<string>(), board = new Set<string>()
    /* the demo week flies no standby wave, and the two pages print one differently: Tuesday gets all three kinds */
    await act(async () => { for (const k of ['sc', 'avalon', 'bb']) (DAYS as any)[1].waves.push(makeStandalone(k)); ensureRowIds(DAYS); closeScheduler(); notify() })
    $$('#eWeek .day[data-day]').forEach(d => textKeys(d).forEach(k => week.add(k)))
    for (let di = 0; di < 7; di++) {
      await act(async () => { openScheduler(di); notify() })
      textKeys($('.sb-boardwrap')).forEach(k => board.add(k))
    }
    expect(week.size, 'the week drew its boxes').toBeGreaterThan(50)
    expect(board.size, 'the board drew its boxes').toBeGreaterThan(50)
    const wrong: string[] = []
    for (const k of new Set([...week, ...board])) {
      const truth = week.has(k) && board.has(k) ? null : week.has(k) ? 'week' : 'board'
      if (onlyOn(k) !== truth) wrong.push(`${k}: drawn on ${truth || 'both'}, said ${onlyOn(k) || 'both'}`)
    }
    expect(wrong).toEqual([])
  })
  it('on the board, a change to a box only the week draws says "shown on the week"', async () => {
    const i = first(day().allhands)!
    const key = `ap:${DI}.${i}.sub`
    expect(onlyOn(key)).toBe('week')
    await goto('board')
    await act(async () => { txtSet(key, 'IN THE HANGAR'); notify() })
    const { said, lit } = await tapped(() => { jumpToChange(key, DI) })
    expect(said).toBe('That detail is shown on the week, not on the board')
    expect(lit).toBeNull()
  })
})

describe('on View-only Sched, where a row has no box to add to', () => {
  const toView = async () => { await click($$('.nav a[data-page]').find(a => a.dataset.page === 'viewsched')) }
  const toEdit = async () => { await click($$('.nav a[data-page]').find(a => a.dataset.page === 'editsched')) }
  it('an emptied seat on a row that still holds someone lands on that row\'s people', async () => {
    const base = KINDS[0]!.base()!
    let key = ''
    await act(async () => { if (!slotVal(base + '.0')) addTo(base); key = addTo(base).key; setSlotVal(key, ''); notify() })
    await toView()
    try {
      const { said, lit } = await tapped(() => { jumpToChange(key, DI) })
      expect(said).toBe('That seat is empty now')
      expect(lit, 'the row\'s people are marked').toBeTruthy()
      expect(lit!.classList.contains('ppl')).toBe(true)
      expect(lit!.querySelector(`[data-slot^="${base}."]`), 'and it is the right row').toBeTruthy()
    } finally { await toEdit() }
  })
  it('an emptied seat on a row with nobody left still says the truth, and names no other page', async () => {
    const base = KINDS.find(k => k.name === 'a ground row')!.base()!
    await act(async () => { seat(base); setSlotVal(base, ''); day().ground[+base.split('.')[1]!].more = []; notify() })
    await toView()
    try {
      const { said } = await tapped(() => { jumpToChange(base, DI) })
      expect(said).toBe('That seat is empty now')
    } finally { await toEdit() }
  })
})

/* ---- A BOX NEITHER PAGE DRAWS (the break test's own find, 10 Oct 26: cutting "only where it is true" out of the jump
   turned no test red — the traffic line is typed into a window and has no box on any page) ---- */
describe.each(SURFS)('a detail no page draws — tapped on the %s', s => {
  it('says only that it is not shown here, and sends him to no other page', async () => {
    await goto(s)
    const { said, lit } = await tapped(() => { jumpToChange(`tr:${DI}.0`, DI) })
    expect(said).toBe('That detail is not shown on this page')
    expect(lit).toBeNull()
  })
})

/* ---- ASTRA'S SCENARIO READ (10 Oct 26 — docs/superpowers/briefs/2026-10-10-hist-jump-empty-seat-scenarios.md) ---- */
const EMPTY = 'That seat is empty now'
const publishMon = () => { const g = signOf(DI); g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump'; setDayApproved(DI, true) }
const bubble = () => document.querySelector('.histbub')
const toGoOut = async (s: Surf) => {
  if (!document.querySelector('.chgwin:not([hidden])')) await click($(s === 'board' ? '#sbHist' : '#histBtn'))
  await click($$('.chgwin .cw-day').find(b => /^Mon/.test(b.textContent || '')))
  await click($$('.chgwin .win-tab').find(b => /To go out/.test(b.textContent || '')))
}
const outLine = (words: string) => $$('.chgwin [data-pltarget], .chgwin [data-plix]').find(e => (e.textContent || '').includes(words))

/* ASTRA 1 — a To go out line carries several places to try in order (canonical.ts placeJump: the place's first cell,
   its main seat, its row's name). The jump tried every one of them as a CELL first, so an extra man taken off a desk
   landed on the desk's own man and pinned HIS history; a programme row's only man taken off pinned the row name's. The
   emptied seat's own row comes before the next place on the list. */
describe.each(SURFS)('a To go out line about an emptied seat (a published day) — tapped on the %s', s => {
  it('an extra man taken off a desk: the desk\'s people box, the sentence, and no History bubble of its own man', async () => {
    const desk = `d:${DI}.0.0`
    let key = ''
    await act(async () => { if (!slotVal(desk)) seat(desk); key = addTo(desk).key; publishMon(); notify() })
    await act(async () => { setSlotVal(key, ''); notify() })
    expect(slotVal(desk), 'the desk keeps its own man').toBeTruthy()
    await goto(s)
    await toGoOut(s)
    const line = outLine(String(day().dutywaves[0].rows[0].role))
    expect(line, 'the removal waits to go out').toBeTruthy()
    const { said, lit } = await tapped(() => click(line))
    expect(said).toBe(EMPTY)
    expect(lit && lit.dataset.fill, 'the people box of the desk').toBe(desk + '.+')
    expect(bubble(), 'no History bubble').toBeNull()
  })
  it('a programme row\'s only man taken off: the row\'s people box — not the History of its name', async () => {
    const i = (day().allhands as any[]).findIndex(r => !Array.isArray(r.who) && r.who && (PEOPLE as any)[r.who])
    expect(i, 'Monday has a programme row with one man').toBeGreaterThanOrEqual(0)
    const key = `a:${DI}.${i}.0`
    await act(async () => { publishMon(); notify() })
    await act(async () => { setSlotVal(key, ''); notify() })
    await goto(s)
    await toGoOut(s)
    const line = outLine(String(day().allhands[i].prog))
    expect(line).toBeTruthy()
    const { said, lit } = await tapped(() => click(line))
    expect(said).toBe(EMPTY)
    expect(lit && lit.dataset.fill).toBe(`a:${DI}.${i}.+`)
    expect(bubble()).toBeNull()
  })
})

/* ASTRA 2 — a look at an older version (a saved plan, an issued version) draws no live place to land on. The week left
   the look before finding the place; the board did not, so the tap said the seat was empty while the board went on
   showing the man in it. */
describe('the board is showing an older version of the day', () => {
  it('the tap goes back to the working copy first, then lands', async () => {
    const base = KINDS[0]!.base()!
    let key = ''
    await act(async () => { key = addTo(base).key; publishMon(); notify() })
    await act(async () => { setSlotVal(key, ''); notify() })
    await goto('board')
    await openList('board')
    const line = lineFor(key)
    expect(line).toBeTruthy()
    await act(async () => { view.setDayPreview(DI, (SCHED as any).orig[DI].id); notify() })
    expect(document.querySelector('#schedBoard .pv-frozen'), 'the board shows the day as it went out').toBeTruthy()
    const { said, lit } = await tapped(() => click(line))
    expect(view.DPREV.has(DI), 'the look is left').toBe(false)
    expect(document.querySelector('#schedBoard .pv-frozen')).toBeNull()
    expect(said).toBe(EMPTY)
    expect(lit && lit.dataset.fill).toBe(base + '.+')
  })
})

/* Astra's scenario 14 — a bubble already open on another detail does not stay to tell the row's landing a wrong story */
describe('a History bubble is already open on another detail', () => {
  it('the tap on an emptied seat closes it, and opens none', async () => {
    await goto('board')
    const fly = `${DI}.0.0.0.w`, base = KINDS[0]!.base()!
    let key = ''
    await act(async () => { seat(fly); key = addTo(base).key; setSlotVal(key, ''); notify() })
    await openList('board')
    await tapped(() => click(lineFor(fly)))
    expect(bubble(), 'the flying seat\'s own bubble is up').toBeTruthy()
    $$('.chgflash').forEach(e => e.classList.remove('chgflash'))
    const { said, lit } = await tapped(() => click(lineFor(key)))
    expect(said).toBe(EMPTY)
    expect(lit && lit.dataset.fill).toBe(base + '.+')
    expect(bubble()).toBeNull()
  })
})

/* Astra's scenario 11 — the placeholders are not people, and stand in a seat like one (D43) */
describe.each(SURFS)('a placeholder (ALL AVAIL) put on a row and taken off — tapped on the %s', s => {
  it('lands on the row while its place is empty; on the place itself once the other placeholder stands there (D733)', async () => {
    await goto(s)
    const base = KINDS[0]!.base()!
    let key = ''
    await act(async () => { expect(fillSlot(base + '.+', 'allavail')).toBe(true); key = String(lastFilled()); setSlotVal(key, ''); notify() })
    await openList(s)
    let r = await tapped(() => click(lineFor(key)))
    expect(r.said).toBe(EMPTY)
    expect(r.lit && r.lit.dataset.fill).toBe(base + '.+')
    $$('.chgflash').forEach(e => e.classList.remove('chgflash'))
    await act(async () => { setSlotVal(key, 'all'); notify() })
    expect(slotVal(key)).toBe('all')
    r = await tapped(() => click(lineFor(key)))
    expect(r.said).toBe('')
    expect(r.lit && r.lit.dataset.slot).toBe(key)
  })
})

/* Astra's scenario 8 — a line follows its ROW, not the place the row used to stand in */
describe.each(SURFS)('the row has been moved since — tapped on the %s', s => {
  it('lands on the same row where it stands now, not on the row that slid into its old place', async () => {
    await goto(s)
    const i = +KINDS[0]!.base()!.split('.')[1]!
    let key = ''
    await act(async () => { key = addTo(`a:${DI}.${i}`).key; setSlotVal(key, ''); notify() })
    await openList(s)
    const rk = String(ridKey(key, DAYS)), rid = day().allhands[i].rid
    expect(lineFor(key)).toBeTruthy()
    await act(async () => { moveProgRow(DI, i, i + 2); notify() })
    const now = (day().allhands as any[]).findIndex(r => r.rid === rid)
    expect(now, 'the row moved').not.toBe(i)
    const line = $$('.chgwin button.cw-l').find(l => l.dataset.cwkey === rk)
    expect(line, 'its line is still a button').toBeTruthy()
    const { said, lit } = await tapped(() => click(line))
    expect(said).toBe(EMPTY)
    expect(lit && lit.dataset.fill).toBe(`a:${DI}.${now}.+`)
  })
})

/* ASTRA 3 — OIL EARN MODE draws a row's people and its name as OIL switches, and none of them is a history cell: a tap
   on a change about a man who stood there in plain sight said "not shown on this page" (found by driving it, 10 Oct
   26). Each switch carries its row's own item, so the tap has somewhere true to go — and it only marks: it presses
   nothing, so nobody's OIL moves. */
describe('OIL Earn is on (the board, a Saturday)', () => {
  const SAT = 5
  const sat = (): any => (DAYS as any)[SAT]
  const open = async () => {
    await act(async () => { openScheduler(SAT); notify() })
    await act(async () => { if (!oilModeOn(SAT)) toggleOilMode(SAT); notify() })
    expect(oilModeOn(SAT), 'OIL Earn came on').toBe(true)
    if (!document.querySelector('.chgwin:not([hidden])')) await click($('#sbHist'))
    await click($$('.chgwin .win-tab').find(b => /All changes/.test(b.textContent || '')))
    await click($$('.chgwin .cw-day').find(b => b.textContent === 'Week'))
  }
  const off = async () => act(async () => { if (oilModeOn(SAT)) toggleOilMode(SAT); closeScheduler(); notify() })
  const desk = `d:${SAT}.0.0`
  const under = (): { key: string; man: string } => { for (const man of men()) { if (man !== slotVal(desk) && fillSlot(desk + '.+', man) && lastFilled()) return { key: String(lastFilled()), man } } throw new Error('nobody could be added') }
  it('a man who IS on the row: the tap lands on his own puck, says nothing, and his OIL does not move', async () => {
    expect(slotVal(desk), 'Saturday has a duty desk with a man on it').toBeTruthy()
    let key = '', man = ''
    await act(async () => { const a = under(); key = a.key; man = a.man; notify() })
    try {
      await open()
      const before = JSON.stringify(sat())
      const { said, lit } = await tapped(() => click(lineFor(key)))
      expect(said).toBe('')
      const pk = lit && (lit.matches('[data-person]') ? lit : lit.querySelector('[data-person]')) as HTMLElement | null
      expect(pk && pk.dataset.person, 'his own puck').toBe(man)
      expect(lit!.closest('.sb-arow')!.querySelector('[data-oilitem]')!.getAttribute('data-oilitem'), 'on his own row').toBe('r:' + sat().dutywaves[0].rows[0].rid)
      expect(JSON.stringify(sat()), 'nothing was written').toBe(before)
    } finally { await off() }
  })
  it('an emptied seat: the tap lands on the name of its row and says so', async () => {
    let key = ''
    await act(async () => { key = under().key; setSlotVal(key, ''); notify() })
    try {
      await open()
      const { said, lit } = await tapped(() => click(lineFor(key)))
      expect(said).toBe(EMPTY)
      expect(lit && lit.dataset.oilitem, 'the row').toBe('r:' + sat().dutywaves[0].rows[0].rid)
      expect(lit && lit.dataset.oilp, 'its name, not a man').toBeUndefined()
    } finally { await off() }
  })
})
