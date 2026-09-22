// @vitest-environment jsdom
/* A CLAIM ROW MUST NOT SAY THE OPPOSITE OF THE PUCK BESIDE IT
   (walk find, 22 Sep 26 — hand-pass finding 13).

   On the everything-Saturday, four rows carried BOTH of these at once:

     the name cell   "Nothing on this row can earn OIL, so there is nothing
                      to switch off"
     the puck on it  "Talisman earns half a day — tap to take him off this event"

   The cause is that `oilCapableItems` is derived from the SCHEDULE walk, and a
   request's money never goes through it — the requester is paid from his own
   answer, and D18's extras are each decided on their own puck. So a perfectly
   live claim's item is absent from that set for a reason that has nothing to
   do with being unable to earn, and the row borrowed the inert wording.

   This file asserts the INVARIANT over every row the board draws, not one
   fixture: no row may claim nothing on it can earn while a puck on the same
   row says a man earns. Genuinely inert rows — AVALON, a desk with no times,
   an ⓘ row, a cancelled or withdrawn claim — must KEEP the old wording, and
   that is asserted too, because a fix that simply deleted the sentence would
   pass the first half. */
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { App } from './App'
import { initStore, setSession, notify } from '../state/store'
import { DAYS } from '../engine/data'
import { INPUTS } from '../engine/inputs'
import { PEOPLE } from '../engine/people'
import { SCHED } from '../engine/publish'
import { HOOKS } from '../engine/hooks'
import { ensureRowIds } from '../engine/rowids'
import { setOilDay } from '../state/view'
import { toggleOilMode, oilDayFigures } from './oilmode'
import { openScheduler } from './board'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

const SAT = 5, SAT_ISO = '2026-07-18'
const DSNAP = JSON.stringify(DAYS)
const INERT = /nothing on this row can earn/i
const EARNS = /earns (a full day|half a day)/i
const PER_PERSON = /answered for each person on it/i
let host: HTMLDivElement
let root: Root
const $$ = (sel: string) => [...document.querySelectorAll(sel)] as HTMLElement[]

beforeAll(async () => {
  initStore()
  host = document.createElement('div'); document.body.appendChild(host)
  root = createRoot(host)
  await act(async () => { root.render(<App />) })
  await act(async () => { setSession({ user: 'a', role: 'admin' } as any); notify() })
})
afterAll(async () => { await act(async () => { root.unmount() }); host.remove() })
beforeEach(async () => {
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  INPUTS.length = 0
  SCHED.pending = {}; SCHED.changes = {}; SCHED.als = []; SCHED.dayOK = {}
  SCHED.sign = {}; SCHED.signBind = {}; SCHED.orig = {}; SCHED.cur = {}
  ensureRowIds(DAYS); setOilDay(null)
  HOOKS.oilEarningDay = (di: number) => di === SAT
  HOOKS.oilDayISO = (di: number) => (di === SAT ? SAT_ISO : '2026-07-15')
  HOOKS.oilSentinel = () => ['bane', 'stiff']
})
afterEach(() => { setOilDay(null) })

const addRow = (di: number, r: any) => {
  ;(DAYS[di] as any).ground = (((DAYS[di] as any).ground) || []).concat([r]); ensureRowIds(DAYS)
  const g = (DAYS[di] as any).ground; return g[g.length - 1]
}
const claim = (over: any = {}) => {
  const row: any = { iid: 'cl1', person: 'bane', type: 'Training', date: 'Jul 18',
    acc: 'g', allday: false, s: 9 * 60, e: 17 * 60, remarks: '', mod: 'now', yr: 2026,
    oil: { [SAT_ISO]: 1 }, ...over }
  INPUTS.unshift(row); return row
}
/* every row the board draws that has BOTH a name cell and a puck */
/* the board renders under #sbBoard here and #schedBoard in the shipped shell;
   search the document so this cannot quietly match nothing */
const pairs = () => $$('.sb-arow, .sb-line').map(r => {
  const cell = r.querySelector('.oilitem') as HTMLElement | null
  const pk = r.querySelector('.oilpk') as HTMLElement | null
  /* textContent, not innerText — jsdom has no layout engine and innerText
     comes back empty, which silently turned every "is my row on screen?"
     filter into a no-op that passed by matching nothing. */
  return cell && pk ? { row: (r.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 40),
                        cell: cell.getAttribute('title') || '', puck: pk.getAttribute('title') || '' } : null
}).filter(Boolean) as { row: string; cell: string; puck: string }[]

const openMode = async () => {
  await act(async () => { openScheduler(SAT); notify() })
  await act(async () => { toggleOilMode(SAT); notify() })
}

describe('a claim row and the puck beside it agree about money', () => {
  it('NO row says nothing here can earn while a puck on it says a man earns', async () => {
    claim()
    addRow(SAT, { prog: 'TRAINING', str: '0900', end: '1700', who: 'bane', src: 'cl1' })
    await openMode()
    const rows = pairs()
    expect(rows.length, 'the board drew rows carrying both a name cell and a puck').toBeGreaterThan(0)
    const bad = rows.filter(r => INERT.test(r.cell) && EARNS.test(r.puck))
    expect(bad, 'these rows contradict themselves: ' + JSON.stringify(bad)).toEqual([])
  })

  it('a LIVE claim row says the decision is per person, and points at the pucks', async () => {
    claim()
    addRow(SAT, { prog: 'TRAINING', str: '0900', end: '1700', who: 'bane', src: 'cl1' })
    await openMode()
    const mine = pairs().filter(r => EARNS.test(r.puck) && /TRAINING/i.test(r.row))
    expect(mine.length, 'the landed claim row is on screen with an earning puck').toBeGreaterThan(0)
    mine.forEach(r => expect(r.cell, r.row).toMatch(PER_PERSON))
  })

  it('a CANCELLED claim keeps the ordinary inert wording — it is true there', async () => {
    claim()
    addRow(SAT, { prog: 'TRAINING', str: '0900', end: '1700', who: 'bane', src: 'cl1', cx: true })
    await openMode()
    const mine = pairs().filter(r => /TRAINING/i.test(r.row))
    expect(mine.length, 'the cancelled claim row is on screen').toBeGreaterThan(0)
    mine.forEach(r => {
      expect(r.cell, 'it does not borrow the per-person sentence').not.toMatch(PER_PERSON)
      expect(r.puck, 'and its puck agrees nothing is earned').not.toMatch(EARNS)
    })
  })

  /* D18's SECOND MAN — the money pays him and the mode said he earns nothing.
     Walk find, 22 Sep 26: Cobra earned NOTHING on the Saturday, was dragged
     onto Talisman's landed Training row through the row's own drop zone, and
     the day then paid him HO — so job 8's engine half works. His puck in the
     mode was drawn INERT, titled "Cobra — nothing measurable to earn from
     here", carrying no item and no switch. The screen contradicted the money
     about a man's entitlement AND offered no way to change it.

     The cause is two bodies: the money moved to `oilEarnedWork` (oilev.ts,
     where D18 was built) while `oilEligible` still asked `dayOilWork`, whose
     ground walk skips every `src` row whole. */
  it('D18 — a second man on a claim row is drawn earning, not inert', async () => {
    claim()
    addRow(SAT, { prog: 'TRAINING', str: '0900', end: '1700', who: 'bane', src: 'cl1', more: ['stiff'] })
    await openMode()
    expect(oilDayFigures(SAT)['stiff'], 'the money pays the second man').toBeTruthy()
    /* by his DISPLAYED name, derived — an inert puck carries no data-oilp at
       all, which is half the defect, so the id cannot be the only handle */
    const name = (PEOPLE as any)['stiff'].cs
    const his = $$('.oilpk').filter(p =>
      p.getAttribute('data-oilp') === 'stiff' ||
      (p.getAttribute('title') || '').startsWith(name))
    expect(his.length, 'his puck is on the row').toBeGreaterThan(0)
    const inert = his.filter(p => p.className.includes('inert'))
    expect(inert.map(p => p.getAttribute('title')), 'none of his pucks is inert').toEqual([])
    expect(his.some(p => (p.getAttribute('title') || '').match(EARNS)), 'and one of them says he earns').toBe(true)
  })

  it('an ⓘ row keeps it too', async () => {
    addRow(SAT, { prog: 'ADMIN', str: '0900', end: '1000', who: 'bane', info: true })
    await openMode()
    const mine = pairs().filter(r => /ADMIN/i.test(r.row))
    expect(mine.length, 'the info row is on screen').toBeGreaterThan(0)
    mine.forEach(r => expect(r.cell, r.row).toMatch(INERT))
  })
})
