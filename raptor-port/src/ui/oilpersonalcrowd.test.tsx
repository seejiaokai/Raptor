// @vitest-environment jsdom
/* ALL AVAIL / ALL ON A "PERSONAL" INPUT'S ROW — ON SCREEN: IT JOINS, IT IS COUNTED, AND NOBODY EARNS (owner D778, 12 Oct
   26: "Personal is not work" / "So all avail all can go on personal"; D776: "a Personal input may hold several people
   … and a puck dropped on its row swaps or joins as on any input's").

   ITS HISTORY. [OIL-PERSONAL-PLACEHOLDER] ([DB-READINESS] group A, phase 7, 1 Oct 26): ALL / ALL AVAIL dropped under a
   member's Personal request wore its count and opened the window, OIL Earn off and on, every man behind it drawn as
   earning nothing "because a personal request earns no OIL" (D27, D37, D43). The one-rule build (12 Oct 26, D755 (4),
   D712) made that row impossible — a Personal input was one person's own and held no placeholder — and this file
   pinned the refusal at every door. D776 and D778, the same day, withdrew that: a Personal input is the same as an
   Event for everything about people. So phase 7's cases are back, each made through the app's own doors on the one
   record (the input is FILED, the puck is DROPPED on its row — ui/drag.ts applyDrop on a stand-in element carrying the
   place's key, as ui/reqdoor.test.tsx does), and the refusals are gone.

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
import { fillSlot } from '../engine/slots'
import { openScheduler, closeScheduler } from './board'
import { setOilDay } from '../state/view'
import { setAvailWin, OILASK } from './pops'
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
/* ALL AVAIL (or ALL) dropped on the row's "+ add" — the scheduler's own gesture */
const dropOn = async (di: number, ph: string, el?: HTMLElement) => {
  setDrag({ kind: 'roster', id: ph })
  let took: boolean | undefined
  await act(async () => { took = applyDrop(el || cellEl(`${rowKey(di)}.+`), 0, 0); notify() })
  return took
}

describe('ALL AVAIL / ALL dropped on a Personal input\'s row joins the input, as on any input\'s (D776, D778)', () => {
  for (const ph of ['allavail', 'all']) {
    it(`${ph} — THE DROP on its "+ add": it is one of the input's people, stands on its row, and nothing more is said (D854)`, async () => {
      await filed(TUE)
      expect(await dropOn(TUE, ph), 'the drop is taken').not.toBe(false)
      expect(idsOf(rec()).map(String), 'beside the man who filed it').toEqual(['ignite', ph])
      expect(String(placeholderOf(rec()).p)).toBe(ph)
      expect([rowOf(TUE).who, rowOf(TUE).more]).toEqual(['ignite', [ph]])
      expect(SAID.join(' | '), 'the puck is the sign: no note (owner D854)').not.toContain('added to')
      expect(SAID.join(' | '), 'no refusal of any kind').not.toMatch(/is for|one person/)
    })

    it(`${ph} — THE STORE'S WRITER (writeFill) and the row's door put it in too; a raw write past the door is still refused by the belt`, async () => {
      await filed(TUE)
      await act(async () => { writeFill(`${rowKey(TUE)}.+`, ph); notify() })
      expect(idsOf(rec()).map(String), 'the store\'s writer goes through the row\'s door').toEqual(['ignite', ph])
      await act(async () => {
        expect(rowPut(`${rowKey(TUE)}.+`, ph), 'a second time: already in it').toBe('refused')
        expect(fillSlot(`${rowKey(TUE)}.+`, 'pump'), 'a raw write to its "+ add" is not the input\'s door').toBe(false)
        notify()
      })
      expect(idsOf(rec()).map(String)).toEqual(['ignite', ph])
    })
  }

  it('ON the lone man\'s puck a NAMED man replaces him, as on any input\'s row (D776 "B2") — a placeholder dropped there joins', async () => {
    await filed(TUE)
    expect(await dropOn(TUE, 'pump', seatEl(rowKey(TUE))), 'a named man on the only person\'s puck').not.toBe(false)
    expect(idsOf(rec()).map(String), 'the input is his now').toEqual(['pump'])
    expect(SAID.join(' | ')).not.toMatch(/one person/)
    expect(await dropOn(TUE, 'allavail', seatEl(rowKey(TUE))), 'the placeholder never replaces anyone').not.toBe(false)
    expect(idsOf(rec()).map(String)).toEqual(['pump', 'allavail'])
  })

  it('a second NAMED man dropped on its "+ add" joins too — a Personal input of two', async () => {
    await filed(TUE)
    expect(await dropOn(TUE, 'pump'), 'taken').not.toBe(false)
    expect(idsOf(rec()).map(String)).toEqual(['ignite', 'pump'])
    expect([rowOf(TUE).who, rowOf(TUE).more]).toEqual(['ignite', ['pump']])
  })
})

describe('the count shows on a Personal input\'s row, OIL Earn off (D27, D37)', () => {
  it('THE BOARD, on a weekday: the chip says how many, and opens the window on them', async () => {
    await filed(TUE)
    await dropOn(TUE, 'allavail')
    await open(TUE)
    const chip = groundRowEl().querySelector('.oilcount') as HTMLElement
    expect(chip, 'the placeholder wears its count').toBeTruthy()
    expect((chip.textContent || '').trim()).toBe('2')
    await click(chip)
    const w = $('.availwin')
    expect(w && !w.hidden, 'the window opens').toBe(true)
    expect(([...w.querySelectorAll('[data-awp]')] as HTMLElement[]).map(r => r.dataset.awp).sort()).toEqual(['plasma', 'stiff'])
    expect(w.querySelector('.win-lost'), 'and it does not say the row has no puck').toBeNull()
  })

  it('THE EDIT WEEK draws the same chip on the same row', async () => {
    await filed(TUE)
    await dropOn(TUE, 'allavail')
    const chips = $$(`#eWeek .oilcount[data-oilsent="i:${inpId(rec())}"]`)
    expect(chips.length, 'one chip, on the input\'s row').toBe(1)
    expect((chips[0]!.textContent || '').trim()).toBe('2')
  })

  it('THE CONTROL: a Personal row of named people only wears no chip', async () => {
    await filed(TUE)
    await dropOn(TUE, 'pump')
    await open(TUE)
    expect(groundRowEl().querySelector('.oilcount')).toBeNull()
  })
})

describe('inside OIL Earn, on a Saturday: counted, and nobody earns — said with its reason (D778: "Personal is not work")', () => {
  it('every man behind the puck is drawn as earning nothing, because a personal request earns no OIL', async () => {
    await filed(SAT)
    await dropOn(SAT, 'allavail')
    await open(SAT)
    await click(oilBtn())
    const chip = groundRowEl().querySelector('.oilcount') as HTMLElement
    expect((chip.textContent || '').trim(), 'the plain count — nobody earns, so no "n of m earn"').toBe('2')
    await click(chip)
    const seats = [...$('.availwin').querySelectorAll('.seat.oilpk')] as HTMLElement[]
    expect(seats.length).toBe(2)
    for (const s of seats) {
      expect(s.classList.contains('inert'), 'no switch: there is nothing to switch').toBe(true)
      expect(s.title).toContain('a personal request earns no OIL')
      expect(s.title).not.toContain('nothing measurable')
    }
    await click($('.availwin').querySelector('.seat.oilpk .puck'))
    expect((DAYS[SAT] as any).oild, 'a tap on a man who cannot earn writes nothing').toBeUndefined()
  })

  it('the men NAMED in it say the same — the one who filed it and one added beside him', async () => {
    await filed(SAT)
    await dropOn(SAT, 'pump')
    await open(SAT)
    await click(oilBtn())
    const seats = [...groundRowEl().querySelectorAll('.seat.oilpk')] as HTMLElement[]
    expect(seats.length, 'both pucks').toBe(2)
    for (const own of seats) {
      expect(own.classList.contains('inert')).toBe(true)
      expect(own.title).toContain('a personal request earns no OIL')
    }
    await click(seats[0]!.querySelector('.puck'))
    expect((DAYS[SAT] as any).oild, 'a tap on a man who cannot earn writes nothing').toBeUndefined()
  })

  it('and the drop on a Saturday asks NO OIL question — a Personal input never asks', async () => {
    await filed(SAT)
    await dropOn(SAT, 'allavail')
    expect(rec().oil, 'no answer was asked for or written').toBeUndefined()
    expect(OILASK, 'no question was opened (ui/pops.ts — the flag the OIL sheet opens on)').toBeNull()
  })
})
