// @vitest-environment jsdom
/* [OIL-SEATS-CAN-EARN] STEP 3, THE SWITCH — the item mark gains a second value,
   the cycle that can actually write it, and the words for every state it can be
   in. Plan: docs/superpowers/specs/2026-09-22-oil-seats-can-earn-plan.md §4, §5 step 3.

   THREE FINDINGS LIVE IN THIS FILE, all from round 2:

   · Fable R2-2 — "nothing writes the 1". `toggleOilItem` only ever wrote `0` or
     deleted, so once a seat can default OFF, D24's switch would DRAW on an
     AVALON line and do nothing: there was no value that meant "yes, this one
     earned". The cycle below is the fix, and it is deliberately shaped so an
     ORDINARY item never reaches the `1` at all — unset → 0 → unset, exactly as
     today, so nothing a scheduler does on a normal row behaves differently.

   · Fable R2-1 / Codex OSE-R2-01 — the screen and the money must read ONE body.
     `itemDefaultFor` used to answer `true` whenever there was no claim, which
     once a seat defaults off would draw a man GLOWING while the money paid him
     nothing, and make his tap write `deny` for a credit he never had.

   · Codex OSE-R2-01, second half — `toggleOilPerson` compares the wanted state
     against the default and DELETES the override when they match. Under an item
     forced ON the effective default is true, not the seat's own answer, so the
     comparison has to be made against the effective one or taking a man off a
     line the admin switched on would delete his refusal and pay him anyway.

   Fable R2-10 put the WORDING here rather than at step 10: from this step the
   switch has more states than its two old titles can describe, and leaving it
   would have the mode telling an admin an item "earns OIL" about one that does
   not. */
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
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
import { oilEvidence, spanDefault, itemState } from '../engine/oilev'
import { toggleOilItem, toggleOilPerson, oilItemMark, oilItemMasked, oilItemCellHTML, oilPersonOn } from './oilmode'
import { setOilDay } from '../state/view'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

const $$ = (sel: string) => [...document.querySelectorAll(sel)] as HTMLElement[]
const click = async (el: Element | null) => {
  expect(el, 'click target exists').toBeTruthy()
  await act(async () => { (el as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true })) })
}

let host: HTMLDivElement
let root: Root
const DSNAP = JSON.stringify(DAYS)
const SAT = 5, SAT_ISO = '2026-07-18'
const earningDay = HOOKS.oilEarningDay, dayISO = HOOKS.oilDayISO, sentinel = HOOKS.oilSentinel

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
  ensureRowIds(DAYS)
  setOilDay(null)
  HOOKS.oilEarningDay = (di: number) => di === SAT
  HOOKS.oilDayISO = (di: number) => (di === SAT ? SAT_ISO : '2026-07-15')
  HOOKS.oilSentinel = () => ['bane', 'stiff']
})

const groundItem = (who = 'bane') => {
  ;(DAYS[SAT] as any).ground = [{ prog: 'FAMILY DAY', str: '0900', end: '1700', who }]
  ensureRowIds(DAYS)
  return rowItemKey((DAYS[SAT] as any).ground[0].rid)
}
const mark = (item: string, v: 0 | 1) => { (DAYS[SAT] as any).oild = { items: { [item]: v } } }
const title = (html: string) => (html.match(/title="([^"]*)"/) || [, ''])[1]

describe('the cycle — and an ordinary row never behaves differently (Fable R2-2)', () => {
  it('an ordinary item still goes on → off → on, and never reaches the forced-on mark', () => {
    const item = groundItem()
    expect(oilItemMark(SAT, item), 'untouched').toBeUndefined()
    toggleOilItem(SAT, item)
    expect(oilItemMark(SAT, item), 'one tap switches it off, exactly as before').toBe(0)
    toggleOilItem(SAT, item)
    expect(oilItemMark(SAT, item), 'and the next clears the record rather than forcing it on').toBeUndefined()
    expect((DAYS[SAT] as any).oild, 'nothing is left behind').toBeUndefined()
  })

  it('an item already forced ON goes 1 → 0 → nothing', () => {
    const item = groundItem()
    mark(item, 1)
    expect(oilItemMark(SAT, item)).toBe(1)
    toggleOilItem(SAT, item)
    expect(oilItemMark(SAT, item), 'forced on becomes switched off').toBe(0)
    toggleOilItem(SAT, item)
    expect(oilItemMark(SAT, item), 'and then back to no decision at all').toBeUndefined()
  })

  it('the day blanket still refuses the tap outright', () => {
    const item = groundItem()
    ;(DAYS[SAT] as any).oild = { blanket: 1 }
    expect(toggleOilItem(SAT, item), 'refused under the mask').toBe(false)
    expect(oilItemMark(SAT, item), 'and nothing was written beneath it').toBeUndefined()
  })
})

describe('ONE body decides the default, on the screen as well as in the money', () => {
  it('the mode\'s answer for a man is the span default the money uses', () => {
    const item = groundItem()
    const ev = oilEvidence(SAT)
    expect(oilPersonOn(SAT, 'bane', item)).toBe(spanDefault(DAYS[SAT], ev, 'bane', item))
  })

  it('a member who answered No on his own request draws OFF, not glowing (§2.2)', () => {
    INPUTS.unshift({ iid: 'c1', person: 'bane', type: 'Duty', date: 'Jul 18', allday: true,
      s: 0, e: 1439, remarks: '', mod: 'now', yr: 2026, oil: { [SAT_ISO]: 0 } } as any)
    expect(oilPersonOn(SAT, 'bane', 'i:c1'), 'his own word is the default').toBe(false)
  })
})

describe('the person toggle compares against the EFFECTIVE default (Codex OSE-R2-01)', () => {
  it('taking a man off an item FORCED ON records the refusal instead of deleting it', () => {
    /* the half-migration this pins: the writer deletes an override whenever the
       wanted state equals the default. Compared against the SEAT's default that
       is wrong under a forced-on item — the refusal would be dropped and the
       `1` would pay him again the same instant. */
    const item = groundItem()
    mark(item, 1)
    expect(oilPersonOn(SAT, 'bane', item), 'the line is forced on, so he earns').toBe(true)
    toggleOilPerson(SAT, 'bane', item)
    expect(((DAYS[SAT] as any).oild.people || {})[`bane|${item}`], 'his refusal is recorded').toBe('deny')
    expect(oilPersonOn(SAT, 'bane', item), 'and it actually takes him off').toBe(false)
    toggleOilPerson(SAT, 'bane', item)
    expect(((DAYS[SAT] as any).oild.people || {})[`bane|${item}`], 'tapping back removes it').toBeUndefined()
    expect(oilPersonOn(SAT, 'bane', item)).toBe(true)
  })

  it('on an ordinary item the old behaviour is untouched', () => {
    const item = groundItem()
    toggleOilPerson(SAT, 'bane', item)
    expect(((DAYS[SAT] as any).oild.people || {})[`bane|${item}`]).toBe('deny')
    toggleOilPerson(SAT, 'bane', item)
    expect((DAYS[SAT] as any).oild, 'and the record goes back to empty').toBeUndefined()
  })
})

describe('the switch says which of its states it is in (Fable R2-10, S8)', () => {
  it('every state has its own sentence, and none of them is shared', () => {
    const item = groundItem()
    const said: Record<string, string> = {}
    said.unsetOn = title(oilItemCellHTML(SAT, item, 'FAMILY DAY', 'x'))
    mark(item, 0); said.off = title(oilItemCellHTML(SAT, item, 'FAMILY DAY', 'x'))
    mark(item, 1); said.forcedOn = title(oilItemCellHTML(SAT, item, 'FAMILY DAY', 'x'))
    ;(DAYS[SAT] as any).oild = { blanket: 1 }
    said.blanket = title(oilItemCellHTML(SAT, item, 'FAMILY DAY', 'x'))
    const all = Object.values(said)
    expect(all.every(t => t.length > 10), 'each one is a real sentence').toBe(true)
    expect(new Set(all).size, 'and no two states share a sentence').toBe(all.length)
  })

  it('an item switched off invites the tap that puts it back', () => {
    const item = groundItem()
    mark(item, 0)
    expect(title(oilItemCellHTML(SAT, item, 'FAMILY DAY', 'x'))).toMatch(/earn again|let it earn/i)
  })

  it('the state itself is readable as on, off or mixed', () => {
    const item = groundItem()
    const ev = oilEvidence(SAT)
    expect(itemState(DAYS[SAT], ev, item)).toBe('on')
    expect(oilItemMasked(SAT, item)).toBe(false)
  })
})
