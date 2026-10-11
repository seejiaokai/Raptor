// @vitest-environment jsdom
/* A "PERSONAL" REQUEST'S ROW HOLDS NO PLACEHOLDER — ON SCREEN ([ALL-AVAIL-AS-MEMBER] step 2, the one-rule build; the plan
   docs/superpowers/plans/2026-10-11-one-rule-plan.md §4.1, §4.4). Owner, D755 (4): "a Personal input is one person's
   own"; D712: ALL / ALL AVAIL is not offered for a Personal input; D755: a row that came from an input IS the input.

   ITS HISTORY, IN TWO LINES. Until 12 Oct 26 this file was [OIL-PERSONAL-PLACEHOLDER] on screen ([DB-READINESS] group A,
   phase 7): ALL / ALL AVAIL dropped under a member's Personal request wore its count and opened the window, OIL Earn
   off and on, every man behind it drawn as earning nothing "because a personal request earns no OIL" (D27, D37, D43).
   That subject cannot exist any more: the placeholder is one of an input's own people, a Personal input never holds
   one, and every door refuses the drop — so there is no crowd to count, list or switch on such a row.

   WHAT IS TRUE NOW, AND PINNED: ALL AVAIL dropped on a Personal request's row — by the drop itself (ui/drag.ts
   applyDrop, on a stand-in element carrying the place's key, as ui/reqdoor.test.tsx does) and by the store's writer
   (state/store.ts writeFill) — changes nothing and says why; the row draws no count chip, on the board and on the edit
   week; and inside OIL Earn the requester's own puck still says why it earns nothing.

   STEP 3 OF THAT BUILD (12 Oct 26 — owner D750, D753, D755) made ALL AVAIL / ALL one of an input's own people on the
   six kinds that may hold one. NOTHING OF THIS FILE'S RULE MOVED — a Personal input still holds none — but two things
   around it did, and the cases say so: the refusal's SENTENCE is the plan's shorter one (§4.4's table: "ALL AVAIL is
   for Training, Meeting, Appointment, Duty, Event and Other" — D726, D765; it read "… can be filed only for … or
   Other"), and the refusal is now about the KIND alone, never about standing beside a man — so a control drops the
   same puck on the same man's Training row, where it joins.

   jsdom has no layout engine: this proves the markup and the wiring; a real drag is walked in the browser. */
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { App } from './App'
import { initStore, setSession, notify, writeFill } from '../state/store'
import { DAYS } from '../engine/data'
import { INPUTS, inpId, idsOf, placeholderOf } from '../engine/inputs'
import { PEOPLE } from '../engine/people'
import { HOOKS } from '../engine/hooks'
import { SCHED } from '../engine/publish'
import { ensureRowIds } from '../engine/rowids'
import { fillSlot, setSlotVal } from '../engine/slots'
import { openScheduler, closeScheduler } from './board'
import { setOilDay } from '../state/view'
import { setAvailWin } from './pops'
import { commitInput, draftOf } from './inputedit'
import { rowPut } from './reqdoor'
import { applyDrop, setDrag } from './drag'

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
const earningDay = HOOKS.oilEarningDay, dayISO = HOOKS.oilDayISO, sentinel = HOOKS.oilSentinel, toast = HOOKS.toast
const SAT = 5, TUE = 1, SAT_ISO = '2026-07-18', TUE_ISO = '2026-07-14'
const CROWD = ['stiff', 'plasma']
const cs = (p: string) => String((PEOPLE as any)[p].cs)
let SAID: string[] = []
let STAND: HTMLElement[] = []

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
  for (const di of [SAT, TUE]) (DAYS[di] as any).ground = []
  ensureRowIds(DAYS)
  setOilDay(null)
  HOOKS.oilEarningDay = (di: number) => di === SAT
  HOOKS.oilDayISO = (di: number) => (di === SAT ? SAT_ISO : di === TUE ? TUE_ISO : '2026-07-15')
  HOOKS.oilSentinel = () => CROWD.slice()
  SAID = []; HOOKS.toast = (m: any) => { SAID.push(String(m)) }
})
afterEach(async () => {
  HOOKS.toast = toast
  for (const el of STAND) el.remove()
  STAND = []; setDrag(null)
  await act(async () => { setOilDay(null); setAvailWin(null); closeScheduler(); notify() })
})

const open = async (di: number) => { await act(async () => { openScheduler(di); notify() }) }
const oilBtn = () => $('#sbBoard [data-oilmode]')
const groundRowEl = () => $$('#sbBoard .sb-panel.grnd .sb-arow.c6r')[0]
const rec = () => { expect(INPUTS, 'ONE input').toHaveLength(1); return INPUTS[0] as any }
const rowIx = (di: number) => ((DAYS[di] as any).ground as any[]).findIndex(g => g && g.src === String(inpId(rec())))
const rowOf = (di: number) => (DAYS[di] as any).ground[rowIx(di)]
const rowKey = (di: number) => `g:${di}.${rowIx(di)}`
/* a place of the row as the drop finds it: a puck's seat, or the people cell that is its "+ add" */
const seatEl = (key: string) => { const el = document.createElement('span'); el.className = 'seat'; el.dataset.slot = key; document.body.appendChild(el); STAND.push(el); return el }
const cellEl = (key: string) => { const r = document.createElement('div'); r.className = 'pl-row'; const c = document.createElement('div'); c.className = 'ppl'; c.dataset.fill = key; r.appendChild(c); document.body.appendChild(r); STAND.push(r); return c }

/* Ignite's Personal request, FILED for him — its row lands on the day from it (D755) */
const filed = async (di: number) => {
  await act(async () => {
    expect(commitInput(null, draftOf({ person: 'ignite', type: 'Personal', date: di === SAT ? 'Jul 18' : 'Jul 14', yr: 2026,
      allday: false, s: 9 * 60, e: 17 * 60, remarks: '' }), ['ignite']), 'filed').toBe(true)
    notify()
  })
  expect(rowOf(di), 'its row stands on the day').toBeTruthy()
}
/* nothing moved: the input holds its one man and no placeholder, and its row is as the landing made it */
const asItWas = (di: number, was: { inputs: string; row: string }) => {
  expect(JSON.stringify(INPUTS), 'the input is as it was').toBe(was.inputs)
  expect(JSON.stringify(rowOf(di)), 'and so is its row').toBe(was.row)
  expect(idsOf(rec()).map(String)).toEqual(['ignite'])
  expect(placeholderOf(rec()), 'no placeholder in it').toBeFalsy()
  expect([rowOf(di).who, rowOf(di).more], 'nor on its row').toEqual(['ignite', undefined])
}
const snap = (di: number) => ({ inputs: JSON.stringify(INPUTS), row: JSON.stringify(rowOf(di)) })

describe('ALL AVAIL / ALL dropped on a Personal request\'s row changes nothing (D755 (4), D712)', () => {
  for (const ph of ['allavail', 'all']) {
    /* CHOICE 1 — THE RULE SURVIVES (D755 (4), D712: a Personal input holds no placeholder). Only its sentence changed,
       with step 3: the one body (engine/inputs.ts placeholderProblem) says the plan's shorter words (§4.4; D726, D765)
       — "ALL AVAIL is for …", where it said "ALL AVAIL can be filed only for … or Other". Said ONCE, and nothing else. */
    it(`${ph} — THE DROP, on its "+ add" and on the man's own puck: refused, saying why`, async () => {
      await filed(TUE)
      const was = snap(TUE)
      for (const el of [cellEl(`${rowKey(TUE)}.+`), seatEl(rowKey(TUE))]) {
        SAID = []
        setDrag({ kind: 'roster', id: ph })
        let took: boolean | undefined
        await act(async () => { took = applyDrop(el, 0, 0); notify() })
        expect(took, 'the drop is refused').toBe(false)
        expect(SAID, 'with the reason on screen — the one sentence, once').toEqual([`${cs(ph)} is for Training, Meeting, Appointment, Duty, Event and Other`])
        expect(SAID.join(' '), 'never the sentence step 3 retired').not.toMatch(/filed on its own|can be filed only/)
        asItWas(TUE, was)
      }
    })

    it(`${ph} — THE STORE'S WRITER (writeFill), the row's door and the engine's belt: nothing is written by any of them`, async () => {
      await filed(TUE)
      const was = snap(TUE)
      await act(async () => {
        writeFill(`${rowKey(TUE)}.+`, ph)
        expect(rowPut(`${rowKey(TUE)}.+`, ph), 'the door').toBe('refused')
        expect(fillSlot(`${rowKey(TUE)}.+`, ph), 'a raw write to its "+ add"').toBe(false)
        expect(setSlotVal(rowKey(TUE), ph), 'a raw write to its name box').toBe(false)
        notify()
      })
      asItWas(TUE, was)
      expect(JSON.stringify(SCHED.pending), 'and no mark was raised').toBe('{}')
    })
  }

  /* THE CONTROL, NEW WITH STEP 3 (D750, D753, D755): it is the KIND that refuses — the same puck, dropped the same way
     on the same man's row, joins where the input is one of the six kinds. Without this the refusals above would pass
     just as well on a build that still refused every placeholder beside a man. */
  for (const ph of ['allavail', 'all']) {
    it(`${ph} — THE CONTROL: the same drop on the same man's TRAINING row joins the input, and its row wears the count`, async () => {
      await act(async () => {
        expect(commitInput(null, draftOf({ person: 'ignite', type: 'Training', date: 'Jul 14', yr: 2026,
          allday: false, s: 9 * 60, e: 17 * 60, remarks: '' }), ['ignite']), 'filed').toBe(true)
        notify()
      })
      setDrag({ kind: 'roster', id: ph })
      let took: boolean | undefined
      await act(async () => { took = applyDrop(cellEl(`${rowKey(TUE)}.+`), 0, 0); notify() })
      expect(took, 'the drop is taken').not.toBe(false)
      expect(idsOf(rec()).map(String), 'it is one of the input\'s people now, beside him').toEqual(['ignite', ph])
      expect(String(placeholderOf(rec()).p)).toBe(ph)
      expect([rowOf(TUE).who, rowOf(TUE).more], 'and stands on its row').toEqual(['ignite', [ph]])
      expect(SAID.join(' | ')).toContain(`${cs(ph)} added to`)
      await open(TUE)
      expect(groundRowEl().querySelector('.oilcount'), 'the board: the count chip, on a weekday too (D27)').toBeTruthy()
    })
  }
})

describe('so a Personal request\'s row draws no count chip (was D27, D37 on this row)', () => {
  it('THE BOARD and THE EDIT WEEK, on a weekday, after the drop was tried: the man\'s puck, no placeholder, no chip, no window', async () => {
    await filed(TUE)
    setDrag({ kind: 'roster', id: 'allavail' })
    await act(async () => { expect(applyDrop(cellEl(`${rowKey(TUE)}.+`), 0, 0)).toBe(false); writeFill(`${rowKey(TUE)}.+`, 'allavail'); notify() })
    expect($$(`#eWeek .oilcount[data-oilsent="i:${inpId(rec())}"]`), 'the edit week: no chip on the request\'s row').toHaveLength(0)
    await open(TUE)
    const el = groundRowEl()
    expect(el.querySelector('.oilcount'), 'the board: no chip').toBeNull()
    expect(el.querySelector('.puck.allavail'), 'and no placeholder puck').toBeNull()
    expect(el.querySelector('.puck'), 'the requester\'s own puck stands on it').toBeTruthy()
    const w = $('.availwin')
    expect(!w || w.hidden, 'nothing to open a window on').toBe(true)
  })

  it('INSIDE OIL EARN, on a Saturday: still no chip — and the requester\'s own puck says why it earns nothing', async () => {
    await filed(SAT)
    await open(SAT)
    await click(oilBtn())
    expect(groundRowEl().querySelector('.oilcount')).toBeNull()
    const own = ([...groundRowEl().querySelectorAll('.seat.oilpk')] as HTMLElement[]).find(s => (s.title || '').includes('Ignite'))
      || (groundRowEl().querySelector('.seat.oilpk') as HTMLElement)
    expect(own.classList.contains('inert')).toBe(true)
    expect(own.title).toContain('a personal request earns no OIL')
    await click(own.querySelector('.puck'))
    expect((DAYS[SAT] as any).oild, 'a tap on a man who cannot earn writes nothing').toBeUndefined()
  })
})
