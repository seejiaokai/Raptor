// @vitest-environment jsdom
/* [OIL-SEATS-CAN-EARN] — the two things the 22 Sep 26 WALK found, pinned.
   Sheet: docs/handpass/2026-09-22-oil-seats.md §6.

   Neither was findable by reading the code or by running the suite: both are
   about what the screen SAYS beside what it MEANS, and both only appear in a
   state the existing fixtures never built — a crowd whose men all earn but at
   two different amounts, and an exempt kind that has reached the walk.

   1. D37 / D44 — the count chip. `bar` is null in TWO different situations:
      when some of the men earn nothing, and when every one of them earns but at
      different amounts. The wording read them as one, so a chip reading
      "30 of 30 earn" was captioned "Some of these men earn OIL and some do not"
      — two sentences contradicting each other, about money, on the face of a
      published day.

   2. D24 — the item's earn switch. The four exempt kinds "all start OFF". The
      switch had five sentences and two colours, and everything that was not
      switched off BY HAND took the green one, so an AVALON line whose own
      tooltip says "This kind of event earns nothing" was painted in exactly the
      colour that means "this is earning". Step 4 created the case: before it
      these kinds were skipped before the walk and drew no switch at all. */
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { App } from './App'
import { initStore, setSession, notify } from '../state/store'
import { DAYS } from '../engine/data'
import { INPUTS } from '../engine/inputs'
import { HOOKS } from '../engine/hooks'
import { SCHED } from '../engine/publish'
import { ensureRowIds } from '../engine/rowids'
import { rowItemKey } from '../engine/oil'
import { oilSeatDeco } from './html'
import { openScheduler } from './board'
import { setOilDay } from '../state/view'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

const $ = (sel: string) => document.querySelector(sel) as HTMLElement
const $$ = (sel: string) => [...document.querySelectorAll(sel)] as HTMLElement[]
const click = async (el: Element | null) => {
  expect(el, 'click target exists').toBeTruthy()
  await act(async () => { (el as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true })) })
}

let host: HTMLDivElement
let root: Root
const DSNAP = JSON.stringify(DAYS)
const earningDay = HOOKS.oilEarningDay, dayISO = HOOKS.oilDayISO, sentinel = HOOKS.oilSentinel
const SAT = 5
const SAT_ISO = '2026-07-18'
/* two men behind the puck: `bane` also sits on a late duty desk, so his DAY runs
   10:00→18:00 and earns a full one; `stiff` has only the two-hour programme row
   and earns a half. Both EARN — that is the whole point of the case. */
const CROWD = ['bane', 'stiff']

beforeAll(async () => {
  initStore()
  host = document.createElement('div')
  document.body.appendChild(host)
  root = createRoot(host)
  await act(async () => { root.render(<App />) })
  await act(async () => { setSession({ user: 'ad', role: 'admin' }); notify() })
  await click($$('.nav a[data-page]').find(a => a.dataset.page === 'editsched')!)
})
afterAll(async () => {
  await act(async () => { root.unmount() })
  host.remove()
  HOOKS.oilEarningDay = earningDay; HOOKS.oilDayISO = dayISO; HOOKS.oilSentinel = sentinel
})
beforeEach(() => {
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  INPUTS.length = 0
  SCHED.pending = {}; SCHED.changes = {}; SCHED.als = []; SCHED.dayOK = {}
  SCHED.sign = {}; SCHED.signBind = {}; SCHED.orig = {}; SCHED.cur = {}
  setOilDay(null)
  HOOKS.oilEarningDay = (di: number) => di === SAT
  HOOKS.oilDayISO = () => SAT_ISO
  HOOKS.oilSentinel = () => CROWD.slice()
})
afterEach(() => { setOilDay(null) })

/** A crowd on a short programme row, with ONE of its men held late by a duty
 *  desk so the two earn different amounts. Returns the row's item key. */
const mixedCrowd = () => {
  const d = DAYS[SAT] as any
  d.waves = []; d.sims = { oft: [], amt: [] }; d.ground = []
  d.allhands = [{ prog: 'FAMILY DAY', str: '1000', end: '1200', who: 'allavail' }]
  d.dutywaves = [{ label: 'DUTIES', rows: [{ role: 'SDO', str: '1400', end: '1800', id: 'bane' }] }]
  ensureRowIds(DAYS)
  return rowItemKey(d.allhands[0].rid)
}
/** The same crowd, but nobody is held late — so every man earns the SAME amount
 *  and the chip must go back to its plain "all of them earn X" wording. */
const evenCrowd = () => {
  const d = DAYS[SAT] as any
  d.waves = []; d.sims = { oft: [], amt: [] }; d.ground = []; d.dutywaves = []
  d.allhands = [{ prog: 'FAMILY DAY', str: '1000', end: '1200', who: 'allavail' }]
  ensureRowIds(DAYS)
  return rowItemKey(d.allhands[0].rid)
}
const deco = (item: string) => oilSeatDeco(SAT, 'allavail', 'a:' + SAT + '.0', item)

describe('a crowd where EVERY man earns is never told that some of them do not', () => {
  it('the caption matches the number — this is the defect the walk found', () => {
    const c = deco(mixedCrowd()).chip
    expect(c, 'the chip is drawn at all').toBeTruthy()
    const title = /title="([^"]*)"/.exec(c)![1]
    expect(title, 'every one of them earns, so this sentence would be false')
      .not.toContain('some do not')
    expect(title, 'it says what is actually true of them').toContain('All 2 earn')
    expect(title, 'and why the puck carries no single bar').toMatch(/full day.*half a day/)
  })

  it('the number reads as what it is, with no "N of N"', () => {
    const c = deco(mixedCrowd()).chip
    expect(c, '"2 of 2 earn" is redundant and reads like a shortfall').not.toContain('>2 of 2 earn<')
    expect(c).toContain('>All 2 earn<')
  })

  it('it still says SOME when some of them really do earn nothing', () => {
    const item = mixedCrowd()
    /* take one man off the item, so he earns nothing from it while the other
       still does — the genuine mixed case, which must keep its old words */
    ;(DAYS[SAT] as any).oilDec = { [item]: { people: { stiff: 0 } } }
    const title = /title="([^"]*)"/.exec(deco(item).chip)?.[1] || ''
    if (/\d+ of \d+ earn/.test(deco(item).chip)) {
      expect(title, 'this is the case the old sentence was written for').toContain('some do not')
    }
  })

  it('an even crowd is untouched — it still names the one amount they all get', () => {
    const title = /title="([^"]*)"/.exec(deco(evenCrowd()).chip)![1]
    expect(title).toMatch(/All 2 earn (a full day|half a day)/)
    expect(title).not.toContain('some do not')
  })

  it('the chip still says WHICH list it is (D37, step 10) — unchanged', () => {
    const title = /title="([^"]*)"/.exec(deco(mixedCrowd()).chip)![1]
    expect(title).toContain('as things stand now')
  })
})

describe('an exempt kind is not painted in the colour that means "earning" (D24)', () => {
  /* AN AVALON DUTY DESK — the shape the everything-Saturday actually carries,
     copied off it rather than guessed. `sa:'avalon'` is what makes the block
     exempt; without it the row is an ordinary desk and the case never arises,
     which is how the first draft of this test passed while proving nothing. */
  const avalonDay = () => {
    const d = DAYS[SAT] as any
    d.waves = []; d.sims = { oft: [], amt: [] }; d.ground = []; d.allhands = []
    d.dutywaves = [{ label: 'AVALON', sa: 'avalon', rows: [{ role: 'SXO', str: '0900', end: '1200', id: 'bane' }] }]
    ensureRowIds(DAYS)
  }
  const switches = () => $$('#sbBoard .oilitem').map(e => ({
    txt: (e.textContent || '').trim(),
    on: e.classList.contains('on'),
    dflt: e.classList.contains('dflt'),
    title: e.getAttribute('title') || '',
  }))

  it('the exempt switch is DRAWN at all — without this the rest proves nothing', async () => {
    avalonDay()
    await act(async () => { openScheduler(SAT); setOilDay(SAT); notify() })
    const ex = switches().filter(s => /This kind of event earns nothing/.test(s.title))
    expect(ex.length, 'step 4 brought the exempt kinds into the walk so they could offer a switch').toBeGreaterThan(0)
  })

  it('a switch that says it earns nothing is not drawn as one that earns', async () => {
    avalonDay()
    await act(async () => { openScheduler(SAT); setOilDay(SAT); notify() })
    const bad = switches().filter(s => /earns nothing/.test(s.title) && s.on)
    expect(bad.map(s => s.txt + ' :: ' + s.title),
      'green is the one thing the colour exists to say').toEqual([])
  })

  it('it wears the off-by-default face instead, and is still a control', async () => {
    avalonDay()
    await act(async () => { openScheduler(SAT); setOilDay(SAT); notify() })
    const ex = switches().filter(s => /This kind of event earns nothing/.test(s.title))
    for (const s of ex) {
      expect(s.dflt, `${s.txt} should read as off by default`).toBe(true)
      expect(s.on, `${s.txt} must not read as earning`).toBe(false)
    }
  })

  it('an ordinary earning item keeps the green — the fix is narrow', async () => {
    mixedCrowd()
    await act(async () => { openScheduler(SAT); setOilDay(SAT); notify() })
    const earners = switches().filter(s => /Earns OIL/.test(s.title))
    expect(earners.length, 'the programme row earns').toBeGreaterThan(0)
    for (const s of earners) expect(s.on, `${s.txt} earns, so it stays green`).toBe(true)
  })

  it('AN EMPTY exempt row does not claim it earns — the walk found both faces', async () => {
    /* the AVALON desk's other rows, with nobody on them. Counting the men there
       gives zero on and zero off, which used to fall through to "Earns OIL". */
    const d = DAYS[SAT] as any
    d.waves = []; d.sims = { oft: [], amt: [] }; d.ground = []; d.allhands = []
    d.dutywaves = [{ label: 'AVALON', sa: 'avalon', rows: [
      { role: 'SXO', str: '0900', end: '1200', id: 'bane' },
      { role: 'RUNNER', str: '0900', end: '1200' },
      { role: 'LOG CELL', str: '0900', end: '1200' }] }]
    ensureRowIds(DAYS)
    await act(async () => { openScheduler(SAT); setOilDay(SAT); notify() })
    const rows = switches().filter(s => /RUNNER|LOG CELL/.test(s.txt))
    expect(rows.length, 'both empty rows draw a switch').toBe(2)
    for (const r of rows) {
      expect(r.title, `${r.txt} is on an exempt block, so it earns nothing`).toContain('earns nothing')
      expect(r.on, `${r.txt} must not be painted as earning`).toBe(false)
    }
  })

  it('an empty ORDINARY row still reads as earning — put a man there and he does', async () => {
    const d = DAYS[SAT] as any
    d.waves = []; d.sims = { oft: [], amt: [] }; d.ground = []; d.allhands = []
    d.dutywaves = [{ label: 'DUTIES', rows: [{ role: 'SDO', str: '0900', end: '1700' }] }]
    ensureRowIds(DAYS)
    await act(async () => { openScheduler(SAT); setOilDay(SAT); notify() })
    const sdo = switches().find(s => /SDO/.test(s.txt))
    expect(sdo, 'the row is there').toBeTruthy()
    expect(sdo!.title, 'OIL7 — the switch covers men added later').toContain('Earns OIL')
    expect(sdo!.on).toBe(true)
  })
})

