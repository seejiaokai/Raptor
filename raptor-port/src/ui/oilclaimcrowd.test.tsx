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

   A PLACEHOLDER BESIDE NAMED PEOPLE ON ONE ROW — BACK SINCE STEP 3 OF THAT BUILD (12 Oct 26; owner D750, D753, D755,
   D757). In step 2 the doors still refused it ("ALL AVAIL is filed on its own" — a sentence that is gone), so the
   crowd's drawing, counting and tapping were proven on the nearest thing then true, an input filed for ALL AVAIL
   alone, and three cases said "the requester beside the placeholder needs the next step". The doors make that row
   now, so each of those cases is back on the row it was written for — "the requester keeps his puck on the row beside
   the placeholder", "a tap in the window leaves the requester untouched", the all-day request — the fixture rebuilt
   through the input's own writer; the stand-in cases for ALL AVAIL alone are kept beside them, because they are true
   too. What did change under them is WHY the crowd earns: no longer "by default yes" (D46) but on the input's ONE
   answer (D753, D762) — said where a case leans on it.

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
import { SCHED, signOf, dayApproved, dayCurVer, daySnapOf, dayPendingItems } from '../engine/publish'
import { ensureRowIds } from '../engine/rowids'
import { inputItemKey } from '../engine/oil'
import { oilEvidence, oilEvidenceOf, oilEarnedWork } from '../engine/oilev'
import { commitSetDayApproved } from '../state/sched-commit'
import { openScheduler } from './board'
import { setOilDay, afterSchedMutate } from '../state/view'
import { commitInput, draftOf } from './inputedit'
import { rowPut, rowTake } from './reqdoor'
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
/* who earns FROM THIS INPUT on the working copy — the seed Saturday carries flying and duty work of its own */
const paid = () => Object.entries(oilEarnedWork(DAYS[SAT], oilEvidence(SAT)))
  .filter(([, spans]) => (spans as any[]).some(w => String(w.item || '') === item())).map(([p]) => p).sort()

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
     mark in the roll-call: the requester keeps his puck on the row where he
     always was, the placeholder beside him keeps its counter, and the counter is
     the door to the men it stands for. */
  /* CHOICE 1 — THE RULE SURVIVES; the fixture is rebuilt. On main this was "the requester stays on the row; the
     placeholder keeps its counter", on a row written by hand (bane's request, ALL AVAIL in its extras). In step 2 no
     door could make that row and the case shrank to ALL AVAIL alone (kept, next). Since step 3 the input is FILED for
     the two (D750, D755) and the case is whole again. What moved under it: the crowd is lit because the input's ONE
     answer is Yes (D753, D762), no longer by default (D46). */
  it('the requester stays on the row; the placeholder beside him keeps its counter — and the counter is the door', async () => {
    await filed(['bane', 'allavail'])
    expect([rowOf().who, rowOf().more], 'the row is the input, whole (D755)').toEqual(['bane', ['allavail']])
    await open(SAT)
    await click(oilBtn())
    const el = groundRowEl()
    expect(el.querySelector('.puck.allavail'), 'the placeholder STAYS a placeholder now').toBeTruthy()
    const seats = [...el.querySelectorAll('.seat.oilpk')] as HTMLElement[]
    expect(seats.map(s => s.dataset.oilp).filter(Boolean), 'the man who filed it keeps his own puck — and his is the only man\'s switch on the row').toEqual(['bane'])
    const own = seats.find(s => s.dataset.oilp === 'bane')!
    expect(own.classList.contains('inert'), 'and he may not be inert — the credit pass is crediting him').toBe(false)
    expect(own.classList.contains('on'), 'the input\'s Yes is his').toBe(true)
    const chip = el.querySelector('.oilcount') as HTMLElement
    expect(chip, 'the placeholder has a counter — this IS the door').toBeTruthy()
    expect((chip.textContent || '').trim(), 'it counts the men behind the puck — never the requester beside it').toBe('2')
    await click(chip)
    const w = $('.availwin')
    expect(w, 'and it opens the window').toBeTruthy()
    const inWin = ([...w.querySelectorAll('.seat.oilpk')] as HTMLElement[])
    expect(inWin.map(s => s.dataset.oilp).sort(), 'the two he stands beside').toEqual(['plasma', 'stiff'])
    expect(inWin.filter(s => s.classList.contains('inert')).length,
      'NONE of them may be inert — the credit pass is crediting them').toBe(0)
    expect(w.textContent || '', 'the window counts the crowd alone').toContain('2 of 2')
  })

  /* (step 2's stand-in for the case above — true then and true now, so it stays: an input filed for ALL AVAIL alone) */
  it('ALL AVAIL filed on its own keeps its puck and its counter on the row — and the counter is the door', async () => {
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

  /* CHOICE 1 — THE RULE SURVIVES. On main this was asked of the row holding the requester AND the placeholder; step 2
     could only ask it of a one-man request. Both are asked now: neither row may say nothing on it can earn, and each
     points at the puck there is to tap. (What the name says of the COUNT on a row holding both is not pinned here —
     reported with this re-expression, not ruled.) */
  for (const ppl of [['bane', 'allavail'], ['bane']]) {
    it(`the row does not claim nothing on it can earn (${ppl.length > 1 ? 'the requester and ALL AVAIL' : 'a one-man request'})`, async () => {
      await filed(ppl)
      await open(SAT)
      await click(oilBtn())
      const cell = groundRowEl().querySelector('.oilitem') as HTMLElement
      expect(cell.title, 'a request is switched person by person, not by a row switch').toContain('tap a puck on this row')
      expect(cell.dataset.oilitem, 'a request offers no whole-row switch').toBeUndefined()
      expect(cell.title).not.toContain('Nothing on this row can earn')
    })
  }

  /* CHOICE 1 — THE RULE SURVIVES; the fixture is rebuilt, and the half that waited for step 3 is back: the REQUESTER,
     who is on the row rather than in the window, is untouched by a tap in the window. */
  it('tapping one man in the window takes HIM off and leaves the rest alone — the requester on the row too', async () => {
    await filed(['bane', 'allavail'])
    await open(SAT)
    await click(oilBtn())
    await click(groundRowEl().querySelector('.oilcount'))
    const inWin = () => ([...$('.availwin').querySelectorAll('.seat.oilpk')] as HTMLElement[])
    await click(inWin().find(s => s.dataset.oilp === 'plasma')!.querySelector('.puck'))
    expect((DAYS[SAT] as any).oild.people[`plasma|${item()}`], 'a decision about that one man').toBe('deny')
    expect(inWin().find(s => s.dataset.oilp === 'plasma')!.classList.contains('off'), 'he is off').toBe(true)
    expect(inWin().find(s => s.dataset.oilp === 'stiff')!.classList.contains('on'), 'the other man is untouched').toBe(true)
    expect(Object.keys((DAYS[SAT] as any).oild.people), 'and nothing was written about anybody else').toEqual([`plasma|${item()}`])
    /* and the REQUESTER, who is on the row rather than in the window, is untouched too — he earns from the input he
       is named in, on its answer (D762) */
    const onRow = ([...groundRowEl().querySelectorAll('.seat.oilpk')] as HTMLElement[])
    expect(onRow.find(s => s.dataset.oilp === 'bane')!.classList.contains('on'), 'and so is the requester').toBe(true)
    expect(paid(), 'the credit says the same').toEqual(['bane', 'stiff'])
    /* …and the other way: the requester tapped on the ROW is a decision about him alone — the window does not move */
    await click(onRow.find(s => s.dataset.oilp === 'bane')!.querySelector('.puck'))
    expect((DAYS[SAT] as any).oild.people[`bane|${item()}`]).toBe('deny')
    expect(inWin().find(s => s.dataset.oilp === 'stiff')!.classList.contains('on'), 'the crowd man still on').toBe(true)
    expect(paid()).toEqual(['stiff'])
  })

  /* (step 2's stand-in, kept: the same tap where ALL AVAIL stands alone) */
  it('…and where ALL AVAIL was filed on its own: one man off, nobody else written about', async () => {
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
  })

  /* CHOICE 1 — THE RULE SURVIVES; on main this was bane's all-day request with ALL AVAIL under it, and it is again */
  for (const ppl of [['bane', 'allavail'], ['allavail']]) {
    it(`AN ALL-DAY REQUEST still reaches its crowd — the row carries no times at all (${ppl.length > 1 ? 'a named man and ALL AVAIL' : 'ALL AVAIL alone'})`, async () => {
      await filed(ppl, { allday: true, s: 0, e: 0 })
      expect([rowOf().str, rowOf().end], 'an all-day request lands a row with no times').toEqual(['', ''])
      await open(SAT)
      await click(oilBtn())
      await click(groundRowEl().querySelector('.oilcount'))
      const inWin = ([...$('.availwin').querySelectorAll('.seat.oilpk')] as HTMLElement[])
      expect(inWin.map(s => s.dataset.oilp).sort(), 'the REQUEST window resolves the crowd, not the row window')
        .toEqual(['plasma', 'stiff'])
    })
  }

  /* A CROWD CHANGE ON A ROW HOLDING BOTH (waiting for step 3 — the plan §10). Who stands behind the puck is worked out
     live (D702): a man of the crowd who becomes busy drops out of it. On a row that holds the requester AND the
     placeholder that moves the counter and the window, and nothing else — the requester is in the input by name, and
     is no part of the crowd that changed. */
  it('a man drops out of the crowd on a row holding the requester and ALL AVAIL: the counter and the window follow; the requester does not move', async () => {
    await filed(['bane', 'allavail'])
    await open(SAT)
    await click(oilBtn())
    const chip = () => groundRowEl().querySelector('.oilcount') as HTMLElement
    await click(chip())
    const inWin = () => ([...$('.availwin').querySelectorAll('.seat.oilpk')] as HTMLElement[])
    expect((chip().textContent || '').trim()).toBe('2')
    await act(async () => { HOOKS.oilSentinel = () => ['stiff']; afterSchedMutate(); notify() })
    expect((chip().textContent || '').trim(), 'the counter').toBe('1')
    expect(inWin().map(s => s.dataset.oilp), 'the window').toEqual(['stiff'])
    const own = ([...groundRowEl().querySelectorAll('.seat.oilpk')] as HTMLElement[]).find(s => s.dataset.oilp === 'bane')!
    expect(own.classList.contains('on'), 'the requester is still on, on the row').toBe(true)
    expect(paid()).toEqual(['bane', 'stiff'])
    /* …and the requester HIMSELF becoming free changes nothing: he is in the input as himself, never in its crowd */
    await act(async () => { HOOKS.oilSentinel = () => ['bane', 'stiff', 'plasma']; afterSchedMutate(); notify() })
    expect((chip().textContent || '').trim(), 'counted behind the puck: the two who are not named in it').toBe('2')
    expect(inWin().map(s => s.dataset.oilp).sort()).toEqual(['plasma', 'stiff'])
    expect($$('#sbBoard .sb-panel.grnd [data-oilp="bane"]'), 'one switch for him — on the row').toHaveLength(1)
    const work = oilEarnedWork(DAYS[SAT], oilEvidence(SAT))
    expect((work.bane || []).filter((w: any) => String(w.item) === item()), 'and one credit').toHaveLength(1)
  })

  /* HIS WALK-THROUGH, STEP 4, ON SCREEN (owner D757, 11 Oct 26 — design note §7: "The scheduler drags Ranger off.
     Schedule: [Tally] [ALL AVAIL 35] … ALL AVAIL STAYS, its switch-offs intact; Ranger is free now, so the count rises
     by one"). Until the one-rule build ALL AVAIL came off WITH Ranger (D745, set aside by D755). */
  it('D757 step 4 — the requester dragged off a row holding him, another man and ALL AVAIL: ALL AVAIL stays, its switch-off intact, and the count rises by one', async () => {
    /* Ranger is free on the Saturday when nothing holds him */
    HOOKS.oilSentinel = () => ['bane', 'stiff', 'plasma']
    await filed(['bane', 'divot', 'allavail'])
    await open(SAT)
    await click(oilBtn())
    const chip = () => groundRowEl().querySelector('.oilcount') as HTMLElement
    const inWin = () => ([...$('.availwin').querySelectorAll('.seat.oilpk')] as HTMLElement[])
    await click(chip())
    await click(inWin().find(s => s.dataset.oilp === 'plasma')!.querySelector('.puck'))
    expect((chip().textContent || '').trim(), 'two behind the puck, one switched off').toBe('1 of 2 earn')
    /* dragged off: his puck leaves the input (ui/reqdoor.ts rowTake) */
    await act(async () => { expect(rowTake(rowKey()), 'Ranger, in the name box').toBe('done'); notify() })
    expect(idsOf(rec()).map(String), 'ALL AVAIL stays when anyone leaves').toEqual(['divot', 'allavail'])
    expect(groundRowEl().querySelector('.puck.allavail'), 'its puck is still on the row').toBeTruthy()
    expect(inWin().map(s => s.dataset.oilp).sort(), 'Ranger is free now: he is one of the people behind it').toEqual(['bane', 'plasma', 'stiff'])
    expect((chip().textContent || '').trim(), 'the count rises by one').toBe('2 of 3 earn')
    expect(inWin().find(s => s.dataset.oilp === 'plasma')!.classList.contains('off'), 'its switch-off is intact').toBe(true)
    expect((DAYS[SAT] as any).oild.people[`plasma|${item()}`]).toBe('deny')
    expect(([...groundRowEl().querySelectorAll('.seat.oilpk')] as HTMLElement[]).map(s => s.dataset.oilp).filter(Boolean), 'the other named man keeps his switch on the row').toEqual(['divot'])
    expect(paid()).toEqual(['bane', 'divot', 'stiff'])
  })

  /* …AND ON A DAY THAT HAS GONE OUT the crowd is frozen (D44): the same change reads as a change WAITING, the issued
     face keeps the people — and the OIL — it went out with (D45, D142). */
  it('the same crowd change after the Saturday was published: a change waiting; the issued day still credits the man who dropped out', async () => {
    await filed(['bane', 'allavail'])
    await act(async () => {
      const g = signOf(SAT); g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump'
      commitSetDayApproved(SAT, true); notify()
    })
    expect(dayApproved(SAT)).toBe(true)
    expect(dayPendingItems(SAT), 'nothing waiting').toHaveLength(0)
    const issued = () => { const d = (daySnapOf(SAT, dayCurVer(SAT)) as any).d; return { ev: oilEvidenceOf(SAT, d), d } }
    const issuedPaid = () => { const { ev, d } = issued(); return Object.entries(oilEarnedWork(d, ev)).filter(([, sp]) => (sp as any[]).some(w => String(w.item) === item())).map(([p]) => p).sort() }
    expect(issuedPaid()).toEqual(['bane', 'plasma', 'stiff'])
    await act(async () => { HOOKS.oilSentinel = () => ['stiff']; afterSchedMutate(); notify() })
    expect(dayPendingItems(SAT).length, 'who stands behind the puck changed: it waits for the scheduler').toBe(1)
    expect(issued().ev.sent[item()], 'the issued day keeps the people it went out with').toEqual(['stiff', 'plasma'])
    expect(issuedPaid(), 'and their OIL').toEqual(['bane', 'plasma', 'stiff'])
    expect(paid(), 'the working copy shows today\'s answer').toEqual(['bane', 'stiff'])
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
