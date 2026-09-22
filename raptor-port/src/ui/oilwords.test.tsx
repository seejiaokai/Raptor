// @vitest-environment jsdom
/* [OIL-SEATS-CAN-EARN] STEPS 10 AND 11 — the wording pass, read side by side.
   Plan: docs/superpowers/specs/2026-09-22-oil-seats-can-earn-plan.md §5 steps
   10 and 11; backlog item [OIL-UNDO-WORDS].

   D37 — the count reads as WHAT IT IS, and now it must also say WHICH ANSWER it
   is. Since step 9 the same puck can show two different numbers: the list the
   day went out with, and the list as things stand today. A number with no idea
   which of the two it is would be worse than no number, because the scheduler
   cannot tell whether he is looking at a record or at a live count.

   D31 — a seat the rules cannot measure says WHY, and it has to say it in the
   squadron's words. "This row has no identity yet" is the app talking to
   itself about its own data.

   [OIL-UNDO-WORDS] — found by driving the app on 22 Sep 26. Inside the earn
   mode the first presses of Undo correctly reverse the OIL decisions, and each
   one said "Undid: a change to the schedule". Taking a man off an event is not
   a schedule change — the mode exists precisely because the schedule must not
   move while OIL is being decided — so the words contradicted the screen they
   appeared on. */
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { App } from './App'
import { initStore, setSession, notify } from '../state/store'
import { DAYS } from '../engine/data'
import { INPUTS } from '../engine/inputs'
import { HOOKS } from '../engine/hooks'
import { SCHED, setSign, setDayApproved, dayCurVer } from '../engine/publish'
import { ensureRowIds } from '../engine/rowids'
import { rowItemKey } from '../engine/oil'
import { undoState } from '../undo'
import { oilSeatDeco, withDaySnap } from './html'
import { oilSentinelList, oilItemCellHTML } from './oilmode'
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

beforeEach(async () => {
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  INPUTS.length = 0
  SCHED.pending = {}; SCHED.changes = {}; SCHED.als = []; SCHED.dayOK = {}
  SCHED.sign = {}; SCHED.signBind = {}; SCHED.orig = {}; SCHED.cur = {}
  ;(DAYS[SAT] as any).ground = []
  ensureRowIds(DAYS)
  setOilDay(null)
  HOOKS.oilEarningDay = (di: number) => di === SAT
  HOOKS.oilDayISO = (di: number) => (di === SAT ? SAT_ISO : '2026-07-15')
  HOOKS.oilSentinel = () => CROWD.slice()
})
afterEach(() => { setOilDay(null) })

const open = async (di: number) => { await act(async () => { openScheduler(di); notify() }) }
const puckRow = (di: number) => {
  ;(DAYS[di] as any).ground = [{ prog: 'FAMILY DAY', str: '0900', end: '1700', who: 'allavail' }]
  ensureRowIds(DAYS)
  return rowItemKey((DAYS[di] as any).ground[0].rid)
}
const publish = (di: number) => {
  for (const [role, who] of [['cur', 'ignite'], ['sked', 'bane'], ['plan', 'stiff'], ['appr', 'pump']]) setSign(di, role, who)
  setDayApproved(di, true)
}

describe('the count says WHICH list it is (D37, step 10)', () => {
  it('on the working copy it is today\'s answer', () => {
    puckRow(SAT)
    const chip = oilSeatDeco(SAT, 'allavail', `g:${SAT}.0`).chip
    expect(chip, 'the scheduler is looking at a live count').toContain('as things stand now')
  })

  it('on an ISSUED page it is the list the day went out with', () => {
    const item = puckRow(SAT)
    publish(SAT)
    const ver = dayCurVer(SAT)
    const chip = withDaySnap(SAT, ver, () => oilSeatDeco(SAT, 'allavail', `g:${SAT}.0`).chip)
    expect(chip, 'this is a record, not a live count').toContain('when this day was issued')
    expect(chip).not.toContain('as things stand now')
    const said = withDaySnap(SAT, ver, () => oilSentinelList(SAT, item))
    expect(said, 'and the tap says the same thing, in the same words').toContain('when this day was issued')
  })

  it('the chip and its tap use ONE vocabulary, not two', () => {
    const item = puckRow(SAT)
    const chip = oilSeatDeco(SAT, 'allavail', `g:${SAT}.0`).chip
    const said = oilSentinelList(SAT, item)
    expect(chip).toContain('as things stand now')
    expect(said).toContain('as things stand now')
  })
})

describe('a seat that cannot be marked says why in the squadron\'s words (D31, step 10)', () => {
  it('a row the app has not saved yet does not talk about its own data', () => {
    const cell = oilItemCellHTML(SAT, '', 'FAMILY DAY', 'ain')
    expect(cell.toLowerCase(), 'no talk of identities').not.toContain('identity')
    expect(cell, 'it says what to do about it').toContain('saved')
  })
})

/* [OIL-UNDO-WORDS] — step 11 — lives in `src/undo/oilundo.test.ts`, where the
   undo timeline can be installed against the real stores. Proving the LABEL
   here would have proved nothing: this harness never installs the timeline, so
   there is no entry to read. */
