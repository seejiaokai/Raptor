// @vitest-environment jsdom
/* THE "OIL EARN" MODE ON THE BOARD, AND THE GREEN EDGE ON THE PUCK
   [OIL-AUTO-REMOVE] §2.1, §2.10, §7.6 — owner, 21 Sep 26.
   Spec: docs/superpowers/specs/2026-09-21-oil-auto-remove-decisions.md.

   jsdom has no layout engine, so what this file proves is the markup and the
   wiring — the button appears only where the day can earn, a tap takes a man
   off one event and leaves his others alone, an item's name is its own switch,
   a sentinel opens into real pucks, the figure rides each puck, and the green
   bar is emitted on the issued schedule and on no other day. What it LOOKS
   like painted is the live-view pass in the running app. */
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { App } from './App'
import { initStore, setSession, notify } from '../state/store'
import { DAYS } from '../engine/data'
import { INPUTS } from '../engine/inputs'
import { HOOKS } from '../engine/hooks'
import { SCHED, signOf, setDayApproved } from '../engine/publish'
import { ensureRowIds } from '../engine/rowids'
import { rowItemKey, inputItemKey } from '../engine/oil'
import { elogClear } from '../engine/editlog'
import { validate } from '../engine/validate'
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
const SAT = 5, SAT_ISO = '2026-07-18'

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

beforeEach(async () => {
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  INPUTS.length = 0
  SCHED.pending = {}; SCHED.changes = {}; SCHED.als = []; SCHED.dayOK = {}
  SCHED.sign = {}; SCHED.signBind = {}; SCHED.orig = {}; SCHED.cur = {}
  ensureRowIds(DAYS)
  elogClear()
  setOilDay(null)
  HOOKS.oilEarningDay = (di: number) => di === SAT
  HOOKS.oilDayISO = (di: number) => (di === SAT ? SAT_ISO : '2026-07-15')
  HOOKS.oilSentinel = () => ['bane', 'stiff']
})
afterEach(() => { setOilDay(null) })

const open = async (di: number) => { await act(async () => { openScheduler(di); notify() }) }
const oilBtn = () => $('#sbBoard [data-oilmode]')
const rows = (di: number) => DAYS[di].ground as any[]
const addRow = (di: number, r: any) => { DAYS[di].ground = (rows(di) || []).concat([r]); ensureRowIds(DAYS); return rows(di)[rows(di).length - 1] }
/* by POSITION in the panel, not by data-move: the mode makes the board
   read-only, and a read-only row carries no move address. The Ground Programme
   renders time-sorted, and every fixture below is written in time order. */
const groundRowEl = (ri: number) => $$('#sbBoard .sb-panel.grnd .sb-arow.c6r')[ri]

describe('the button is drawn only where a day can earn (§2.8)', () => {
  it('a weekend day offers it, an ordinary weekday does not', async () => {
    await open(SAT)
    expect(oilBtn(), 'the Saturday offers OIL Earn').toBeTruthy()
    await open(1)
    expect(oilBtn(), 'Tuesday is unchanged — five days a week the board is the same').toBeFalsy()
  })
})

describe('the mode itself (§2.1)', () => {
  beforeEach(async () => {
    addRow(SAT, { prog: 'MORNING BRIEF', str: '0700', end: '0800', who: 'bane' })
    addRow(SAT, { prog: 'FAMILY DAY', str: '0900', end: '1700', who: 'bane' })
    await open(SAT)
  })

  it('pressing it lights the button and stops the ordinary schedule edits', async () => {
    expect($$('#sbBoard .sb-panel.grnd [data-bfld]').length, 'editable boxes before').toBeGreaterThan(0)
    await click(oilBtn())
    expect(oilBtn().classList.contains('on')).toBe(true)
    expect($$('#sbBoard .sb-panel.grnd [data-oilitem]').length, 'every item is now a switch').toBeGreaterThan(0)
    expect($$('#sbBoard .sb-panel.grnd .lctl .mbtn.del').length, 'and the row controls are gone').toBe(0)
    await click(oilBtn())
    expect(oilBtn().classList.contains('on'), 'and it toggles back off').toBe(false)
  })

  it('every puck that earns glows and wears the man\'s figure for the DAY, not the event', async () => {
    await click(oilBtn())
    const pucks = $$('#sbBoard .sb-panel.grnd .seat.oilpk .puck')
    expect(pucks.length, 'both of his rows draw him').toBe(2)
    expect(pucks.every(p => p.classList.contains('oilglow')), 'both glow').toBe(true)
    /* 07:00 to 17:00 is a ten-hour day, so BOTH pucks read FO — the same figure
       twice, because it is the man's day, not what each event earned */
    expect($$('#sbBoard .sb-panel.grnd .role.oilamt').map(e => e.textContent)).toEqual(['FO', 'FO'])
  })

  it('tapping a puck takes him off THAT event, his others keep counting, and the figure follows', async () => {
    await click(oilBtn())
    /* take him off the long event: only his one morning hour is left, so the
       figure on the remaining puck drops to a half day — the mitigation the
       owner insisted on, because this is exactly the change a scheduler cannot
       predict from the row he tapped */
    const long = groundRowEl(1).querySelector('.seat.oilpk') as HTMLElement
    await click(long)
    expect(groundRowEl(1).querySelector('.puck')!.classList.contains('oildim'), 'the tapped puck goes dim').toBe(true)
    expect(groundRowEl(0).querySelector('.puck')!.classList.contains('oilglow'), 'his other event still counts').toBe(true)
    expect(groundRowEl(0).querySelector('.role.oilamt')!.textContent, 'and it is a half day now').toBe('HO')
    const dec = (DAYS[SAT] as any).oild
    expect(dec.people[`bane|${rowItemKey(rows(SAT)[1].rid)}`]).toBe('deny')
    /* tap it again and the override is REMOVED, not flipped to allow — the
       ordinary rule already said yes */
    await click(groundRowEl(1).querySelector('.seat.oilpk'))
    expect((DAYS[SAT] as any).oild, 'nothing is left behind on the record').toBeUndefined()
  })

  it('tapping an item\'s NAME stops the whole item earning, whoever is added later', async () => {
    await click(oilBtn())
    await click(groundRowEl(1).querySelector('[data-oilitem]'))
    const item = rowItemKey(rows(SAT)[1].rid)
    expect((DAYS[SAT] as any).oild.items[item]).toBe(0)
    expect(groundRowEl(1).querySelector('[data-oilitem]')!.classList.contains('off')).toBe(true)
    expect(groundRowEl(0).querySelector('.role.oilamt')!.textContent, 'his day is a half now').toBe('HO')
  })

  it('the day blanket stops everything, and says the marks underneath are kept', async () => {
    await click(oilBtn())
    await click(groundRowEl(1).querySelector('.seat.oilpk'))       // a person mark underneath
    await click($('#sbBoard [data-oilblank]'))
    expect((DAYS[SAT] as any).oild.blanket).toBe(1)
    expect($$('#sbBoard .sb-panel.grnd .puck.oilglow').length, 'nothing glows').toBe(0)
    expect($('#sbBoard .oilnote').textContent).toContain('kept')
    await click($('#sbBoard [data-oilblank]'))
    expect((DAYS[SAT] as any).oild.blanket).toBeUndefined()
    expect((DAYS[SAT] as any).oild.people, 'the person mark survived underneath').toBeTruthy()
  })

  it('a sentinel opens into REAL pucks inside the mode, or its people cannot be tapped at all', async () => {
    addRow(SAT, { prog: 'ALL HANDS', str: '1000', end: '1600', who: 'allavail' })
    await open(SAT)
    await click(oilBtn())
    const el = groundRowEl(2)
    expect(el.querySelector('.puck.allavail'), 'the sentinel itself is gone in the mode').toBeFalsy()
    expect([...el.querySelectorAll('.seat.oilpk')].length, 'the men behind it are drawn').toBe(2)
  })

  it('a man with nothing measurable to earn from is drawn inert, not tappable', async () => {
    addRow(SAT, { prog: 'NO TIMES', str: '', end: '', who: 'plasma' })
    await open(SAT)
    await click(oilBtn())
    const inert = $$('#sbBoard .sb-panel.grnd .seat.oilpk.inert')
    expect(inert.length, 'the blank-times row offers no switch').toBe(1)
    expect(inert[0].dataset.oilp, 'and carries no tap target').toBeUndefined()
  })
})

describe('the green edge on the issued schedule (§2.10, §7.6)', () => {
  const publish = (di: number) => {
    const g = signOf(di); g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump'
    setDayApproved(di, true)
  }

  it('a man who earns wears a bar; on a weekday nothing is emitted at all', async () => {
    addRow(SAT, { prog: 'ALL DAY', str: '0800', end: '1700', who: 'bane' })
    addRow(1, { prog: 'ALL DAY', str: '0800', end: '1700', who: 'bane' })
    await open(SAT)
    expect($$('#sbBoard .puck.oilbar-fo').length, 'his full day shows on the Saturday').toBeGreaterThan(0)
    await open(1)
    expect($$('#sbBoard .puck.oilbar').length, 'and the Tuesday is byte-identical to before').toBe(0)
  })

  it('a half day is a different bar from a full one', async () => {
    addRow(SAT, { prog: 'HALF', str: '0800', end: '1100', who: 'stiff' })
    await open(SAT)
    const pk = $$('#sbBoard .sb-panel.grnd .puck.oilbar')
    expect(pk.length).toBe(1)
    expect(pk[0].classList.contains('oilbar-ho'), 'three hours is a half day').toBe(true)
  })

  it('a SENTINEL wears a bar only when the people behind it agree, and a count chip either way', async () => {
    addRow(SAT, { prog: 'ALL HANDS', str: '0800', end: '1700', who: 'allavail' })
    await open(SAT)
    const chip = $('#sbBoard .sb-panel.grnd .oilcount')
    expect(chip, 'the count chip is drawn beside the puck').toBeTruthy()
    expect(chip.textContent, 'both behind it earn the same full day').toBe('2')
    expect($('#sbBoard .sb-panel.grnd .puck.allavail').classList.contains('oilbar-fo')).toBe(true)
    /* now make them DISAGREE — one of the two is taken off the item */
    ;(DAYS[SAT] as any).oild = { people: { [`stiff|${rowItemKey(rows(SAT)[0].rid)}`]: 'deny' } }
    await open(SAT)
    expect($('#sbBoard .sb-panel.grnd .puck.allavail').classList.contains('oilbar'), 'a mixed puck wears no bar').toBe(false)
    const mixed = $('#sbBoard .sb-panel.grnd .oilcount')
    expect(mixed.classList.contains('some'), 'the chip carries the mixed case instead').toBe(true)
    expect(mixed.textContent).toBe('1 of 2 earn')
  })

  it('the bar reads the ISSUED evidence on a published day, not the live draft', async () => {
    addRow(SAT, { prog: 'ALL DAY', str: '0800', end: '1700', who: 'bane' })
    await open(SAT)
    publish(SAT)
    await act(async () => { notify() })
    expect($$('#sbBoard .puck.oilbar-fo').length).toBeGreaterThan(0)
  })
})

describe('the publish reminder (§2.3)', () => {
  it('an unpublished weekend day with somebody down to earn says so', async () => {
    addRow(SAT, { prog: 'ALL DAY', str: '0800', end: '1700', who: 'bane' })
    /* the strip is DERIVED state: in the app every edit ends in
       afterSchedMutate, which re-validates. The fixture writes DAYS directly,
       so it runs the same pass by hand. */
    await act(async () => { validate(); notify() })
    await open(SAT)
    const said = $$('#sbWarn .wln .wln-t').map(e => e.textContent || '').join(' | ')
    expect(said, 'the day says nobody earns until it is published').toContain('not published yet')
  })
})

describe('input-derived items keep the member\'s word, and the admin can overrule it', () => {
  it('a claim the member answered NO to draws a dim puck the admin can light', async () => {
    INPUTS.unshift({ iid: 'c1', person: 'bane', type: 'Duty', date: 'Jul 18', yr: 2026, allday: true, s: 0, e: 1439, remarks: '', mod: 'now', oil: { [SAT_ISO]: 0 } })
    addRow(SAT, { prog: 'TRAINING', str: '0900', end: '1700', who: 'bane', src: 'c1' })
    await open(SAT)
    await click(oilBtn())
    const seat = groundRowEl(0).querySelector('.seat.oilpk') as HTMLElement
    expect(seat.dataset.oilitem, 'addressed by the INPUT, never the row').toBe(inputItemKey('c1'))
    expect(seat.querySelector('.puck')!.classList.contains('oildim'), 'his own No is the default').toBe(true)
    await click(seat)
    expect((DAYS[SAT] as any).oild.people[`bane|${inputItemKey('c1')}`], 'the admin says yes over it').toBe('allow')
    expect(INPUTS[0].oil, 'and his own answer is untouched').toEqual({ [SAT_ISO]: 0 })
  })
})
