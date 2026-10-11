// @vitest-environment jsdom
/* [OIL-SEATS-CAN-EARN] STEP 6, ON SCREEN — a placeholder on an accepted
   request's row opens into the real people it stands for, and each of them can
   be tapped.
   Plan: docs/superpowers/specs/2026-09-22-oil-seats-can-earn-plan.md §5 step 6.

   The credit half is engine/oilclaimcrowd.test.ts. This file exists because the
   two have been out of step on this exact row before: a man the credit was
   crediting from a landed request was drawn INERT in the mode — "nothing
   measurable to earn from here" — with no switch to change it, because the
   screen asked the day's work walk and the walk skips every request row whole.
   The screen contradicting the credit about a man's entitlement, with no door.
   That was found by opening the app, not by reading code, and it is the reason
   a green engine suite is not enough here.

   RE-BUILT ON THE ONE RULE ([ALL-AVAIL-AS-MEMBER] step 2; the plan
   docs/superpowers/plans/2026-10-11-one-rule-plan.md §4.3, §4.4, §4.7). Owner, D755: "a row that came from an input
   IS the input: whoever stands on it … is in the input"; D762: ONE OIL answer an input, for everyone in it. So nothing
   here writes a person or a placeholder straight onto a request's row any more — the re-make would sweep it off and the
   engine's belt refuses it. Every row below is made the way the app makes it: the input is FILED for the people it
   holds (ui/inputedit.tsx commitInput) and its row lands from it; a hand on the row goes through its door
   (ui/reqdoor.ts).

   WHAT WAITS FOR THE NEXT STEP OF THE BUILD (D753): a placeholder BESIDE named people on one row. In this step the
   doors still refuse it — "ALL AVAIL is filed on its own" — so the crowd's drawing, counting and tapping are proven
   here on the nearest thing that is true now, an input filed for ALL AVAIL alone; "the requester keeps his puck on the
   row beside the placeholder" comes back with step 3.

   jsdom has no layout engine, so what this proves is the markup and the wiring;
   what it LOOKS like is the walk of the running app. */
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { App } from './App'
import { initStore, setSession, notify } from '../state/store'
import { DAYS } from '../engine/data'
import { INPUTS, inpId, idsOf } from '../engine/inputs'
import { HOOKS } from '../engine/hooks'
import { SCHED } from '../engine/publish'
import { ensureRowIds } from '../engine/rowids'
import { inputItemKey } from '../engine/oil'
import { openScheduler } from './board'
import { setOilDay } from '../state/view'
import { commitInput, draftOf } from './inputedit'
import { rowPut } from './reqdoor'
import { setOilAsk, setInpEdit } from './pops'

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
const CROWD = ['stiff', 'plasma']

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
  /* the Ground Programme is emptied so the request's row is the only one in the
     panel and can be addressed without counting */
  ;(DAYS[SAT] as any).ground = []
  ensureRowIds(DAYS)
  setOilDay(null)
  HOOKS.oilEarningDay = (di: number) => di === SAT
  HOOKS.oilDayISO = (di: number) => (di === SAT ? SAT_ISO : '2026-07-15')
  HOOKS.oilSentinel = () => CROWD.slice()
})
/* (a man put on the only man's puck opens the OIL question again, in the input's window — closed here) */
afterEach(async () => { await act(async () => { setOilDay(null); setOilAsk(null); setInpEdit(null) }) })

const open = async (di: number) => { await act(async () => { openScheduler(di); notify() }) }
const oilBtn = () => $('#sbBoard [data-oilmode]')
const groundRowEl = () => $$('#sbBoard .sb-panel.grnd .sb-arow.c6r')[0]
/* the one input of the test, and the address its people's switches are kept under */
const rec = () => { expect(INPUTS, 'ONE input').toHaveLength(1); return INPUTS[0] as any }
const item = () => inputItemKey(String(inpId(rec())))
/* the input's row on the Saturday, as the landing made it, and its name box's address */
const rowIx = () => ((DAYS[SAT] as any).ground || []).findIndex((g: any) => g && g.src === String(inpId(rec())))
const rowOf = () => (DAYS[SAT] as any).ground[rowIx()]
const rowKey = () => `g:${SAT}.${rowIx()}`
const YES = { [SAT_ISO]: 1 }

/* a Training on the Saturday, FILED for the people it holds — its row lands from it (D755). `people` is whoever it is
   for: named people, or ALL AVAIL alone */
const filed = async (people: string[], over: any = {}, oil: Record<string, number> | null = YES) => {
  await act(async () => {
    expect(commitInput(null, draftOf({ person: people[0], type: 'Training', date: 'Jul 18', yr: 2026,
      allday: false, s: 9 * 60, e: 17 * 60, remarks: '', ...over }), people, oil ? { oil } : undefined), 'filed').toBe(true)
    notify()
  })
}

describe('the crowd on a request row is drawn, and every man in it is tappable', () => {
  /* [ALL-AVAIL-WINDOW] (D38) — the crowd behind a placeholder moved OUT of the
     row and into the window. A REQUEST ROW is its own seat kind and gets its own
     mark in the roll-call: the placeholder keeps its puck on the row with its
     counter, and the counter is the door to the men it stands for.
     (Until step 3 of the one-rule build the placeholder stands on such a row ALONE — an input filed for ALL AVAIL;
     "the requester stays on the row beside it" needs the next step, see the head of this file.) */
  it('ALL AVAIL filed on its own keeps its puck and its counter on the row — and the counter is the door (beside a named requester: the next step)', async () => {
    await filed(['allavail'])
    await open(SAT)
    await click(oilBtn())
    const el = groundRowEl()
    expect(el.querySelector('.puck.allavail'), 'the placeholder STAYS a placeholder now').toBeTruthy()
    const seats = [...el.querySelectorAll('.seat.oilpk')] as HTMLElement[]
    expect(seats.map(s => s.dataset.oilp).filter(Boolean), 'nobody is named in it: no man\'s switch on the row').toEqual([])
    const chip = el.querySelector('.oilcount') as HTMLElement
    expect(chip, 'the placeholder has a counter — this IS the door').toBeTruthy()
    await click(chip)
    const w = $('.availwin')
    expect(w, 'and it opens the window').toBeTruthy()
    const inWin = ([...w.querySelectorAll('.seat.oilpk')] as HTMLElement[])
    expect(inWin.map(s => s.dataset.oilp).sort(), 'the two it stands for').toEqual(['plasma', 'stiff'])
    expect(inWin.filter(s => s.classList.contains('inert')).length,
      'NONE of them may be inert — the credit pass is crediting them').toBe(0)
  })

  it('the row does not claim nothing on it can earn', async () => {
    await filed(['bane'])
    await open(SAT)
    await click(oilBtn())
    const cell = groundRowEl().querySelector('.oilitem') as HTMLElement
    expect(cell.title, 'a request is answered per person, not by a row switch').toContain('tap a puck on this row')
    expect(cell.title).not.toContain('Nothing on this row can earn')
  })

  it('tapping one man in the window takes HIM off and leaves the rest alone', async () => {
    await filed(['allavail'])
    await open(SAT)
    await click(oilBtn())
    await click(groundRowEl().querySelector('.oilcount'))
    const inWin = () => ([...$('.availwin').querySelectorAll('.seat.oilpk')] as HTMLElement[])
    await click(inWin().find(s => s.dataset.oilp === 'plasma')!.querySelector('.puck'))
    expect((DAYS[SAT] as any).oild.people[`plasma|${item()}`], 'a decision about that one man').toBe('deny')
    expect(inWin().find(s => s.dataset.oilp === 'plasma')!.classList.contains('off'), 'he is off').toBe(true)
    expect(inWin().find(s => s.dataset.oilp === 'stiff')!.classList.contains('on'), 'the other man is untouched').toBe(true)
    expect(Object.keys((DAYS[SAT] as any).oild.people), 'and nothing was written about anybody else').toEqual([`plasma|${item()}`])
    /* (the REQUESTER on the row beside the placeholder, untouched by a tap in the window, needs the next step: no door
       stands a named man beside ALL AVAIL yet) */
  })

  it('AN ALL-DAY REQUEST still reaches its crowd — the row carries no times at all', async () => {
    await filed(['allavail'], { allday: true, s: 0, e: 0 })
    expect([rowOf().str, rowOf().end], 'an all-day request lands a row with no times').toEqual(['', ''])
    await open(SAT)
    await click(oilBtn())
    await click(groundRowEl().querySelector('.oilcount'))
    const inWin = ([...$('.availwin').querySelectorAll('.seat.oilpk')] as HTMLElement[])
    expect(inWin.map(s => s.dataset.oilp).sort(), 'the REQUEST window resolves the crowd, not the row window')
      .toEqual(['plasma', 'stiff'])
  })

  /* THE CONTROL, under the one rule: the second man is not "the scheduler's extra" on bane's row — he is IN the input
     (D755), and both follow its one answer (D762). The row draws a switch a person and no counter. */
  it('THE CONTROL: a request row with no placeholder draws a switch for each person in the input, and no counter', async () => {
    await filed(['bane', 'divot'])
    await open(SAT)
    await click(oilBtn())
    const seats = [...groundRowEl().querySelectorAll('.seat.oilpk')] as HTMLElement[]
    expect(seats.map(s => s.dataset.oilp).sort()).toEqual(['bane', 'divot'])
    expect(seats.filter(s => s.classList.contains('inert')).length,
      'neither may be inert — the credit pass is crediting them on the input\'s Yes').toBe(0)
    expect(seats.every(s => s.classList.contains('on')), 'one answer, Yes, for everyone in it (D762)').toBe(true)
    expect(groundRowEl().querySelector('.oilcount'), 'no placeholder, no counter').toBeNull()
  })
})

/* D470 AS D755 CHANGED IT (owner, 11 Oct 26 — D755 (2): "a man dropped on the ONLY man's puck replaces him, and the input
   becomes the new man's"). D470 (1 Oct 26, [OIL-REQ-NAMEBOX]) had a named man the scheduler put in the request row's
   NAME BOX earn beside the member who filed it, default yes. There is no "beside" in the name box any more: put there
   through the door (ui/reqdoor.ts rowPut) he IS the input's one person, the first man's OIL answer is void with him
   (D762 reading 1) and the question is asked again. What D470 was FOR still holds, and is what this pins: his puck on
   the row is a real switch — never the inert "nothing measurable to earn from here" — it glows once the input's
   question is answered Yes, and a tap is a decision about him alone. */
describe('a named man put in the request row\'s NAME BOX takes the input over, and is his own switch (D470 as changed by D755 (2), D762)', () => {
  it('his puck is a switch from the start — OFF until the question is answered again, ON after a Yes; a tap takes HIM off and writes a decision about him alone', async () => {
    await filed(['bane'])
    await act(async () => { expect(rowPut(rowKey(), 'stiff'), 'dropped on the only man\'s puck').toBe('done'); notify() })
    expect(idsOf(rec()).map(String), 'the input is his now').toEqual(['stiff'])
    expect(rec().oil, 'the answer was the first man\'s own — void').toBeUndefined()
    await open(SAT)
    await click(oilBtn())
    const seat = () => ([...groundRowEl().querySelectorAll('.seat.oilpk')] as HTMLElement[]).find(s => s.dataset.oilp === 'stiff')!
    expect(seat(), 'the man in the box is drawn as a switch').toBeTruthy()
    expect(seat().classList.contains('inert'), 'not inert — he can earn').toBe(false)
    expect(seat().classList.contains('off'), 'nobody has answered for him yet').toBe(true)
    expect(seat().title, 'his own input: the words are his').toContain('has not answered the OIL question')
    expect(([...groundRowEl().querySelectorAll('.seat.oilpk')] as HTMLElement[]).map(s => s.dataset.oilp), 'the man replaced is off the row').not.toContain('bane')
    /* the question answered Yes, by the input's one writer */
    await act(async () => { expect(commitInput(rec(), draftOf(rec()), ['stiff'], { oil: YES })).toBe(true); notify() })
    expect(seat().classList.contains('inert'), 'not inert — he earns').toBe(false)
    expect(seat().classList.contains('on')).toBe(true)
    expect(seat().title).toContain('earns')
    await click(seat().querySelector('.puck'))
    expect((DAYS[SAT] as any).oild.people[`stiff|${item()}`]).toBe('deny')
    expect(seat().classList.contains('off')).toBe(true)
    expect(Object.keys((DAYS[SAT] as any).oild.people), 'nobody else was touched').toEqual([`stiff|${item()}`])
  })
})
