/* @vitest-environment jsdom */
/* [REQ-ORPHAN-ROW] (28 Sep 26) — A REQUEST'S ROW OUTLIVING THE REQUEST, AND ONE REQUEST WITH TWO ROWS ACROSS WEEKS.
   D175 (one request, one row) was kept for the LOADED week only: a request covering Sun 19 – Mon 20 Jul landed on Sunday
   keeps its one row in week 1, and with week 2 loaded Monday's card offered Accept and made a second row (Fable's G3).
   The readers of "is its row somewhere else?" now ask ONE read-only body (engine/weekstash.ts rowElsewhere); the filing
   stays week-local (Astra 02), so a week change never moves a published day's count. Pinned here through the real week
   switch (loadWeek) and the real doors; the card and the refusals are pinned in their own words. */
import { beforeEach, describe, expect, it } from 'vitest'
import { initStore, loadWeek } from './store'
import { setSession } from './auth'
import { DAYS } from '../engine/data'
import { INPUTS } from '../engine/inputs'
import { acceptInput, unacceptInput, acceptedDay, relandInputs } from '../engine/slots'
import { inpId } from '../engine/inputs'
import { stashClear, stashPut, rowElsewhere } from '../engine/weekstash'
import { rowsLeftOut } from '../engine/publish'
import { rowsLeftSaid } from '../engine/drafts'
import { removeInput } from '../ui/inputedit'
import { accCtl } from '../ui/html'

const rowsOf = (inp: any) => DAYS.map((d: any, i: number) => ((d && d.ground) || []).some((g: any) => g && g.src === inpId(inp)) ? i : -1).filter(i => i >= 0)
const W1 = '13/07/2026', W2 = '20/07/2026'
beforeEach(() => {
  stashClear()
  for (let i = INPUTS.length - 1; i >= 0; i--) if ((INPUTS[i] as any)._t) INPUTS.splice(i, 1)
  setSession({ user: 'ad', role: 'admin' })
  initStore()
  loadWeek(W1)
})
/* a Meeting for Divot covering Sunday 19 (week 1) and Monday 20 Jul (week 2) */
const boundary = () => {
  const inp: any = { person: 'divot', type: 'Meeting', date: 'Jul 19', endDate: 'Jul 20', s: 540, e: 600, remarks: '', mod: 'now', yr: 2026, _t: 1 }
  INPUTS.push(inp); return inp
}

describe('one request, one row — across a week boundary', () => {
  it('landed on Sunday (week 1): on week 2 Monday takes NO second row, and its card says where the row is', () => {
    const inp = boundary()
    expect(acceptInput(6, inp, 'g'), 'accepted onto Sunday').toBe(true)
    loadWeek(W2)
    expect(rowsOf(inp), 'week 2 carries no row of it').toEqual([])
    expect(acceptInput(0, inp, 'g'), 'Accept on Monday is refused — its row is on Sunday').toBe(false)
    expect(rowsOf(inp), 'still no second row').toEqual([])
    expect(accCtl(0, inp), 'the card names the day its row is on, in place of Accept').toContain('On Sun 19 Jul')
    expect(accCtl(0, inp)).not.toContain('data-acc="g"')
    loadWeek(W1)
    expect(rowsOf(inp), 'back on week 1: the one row, on Sunday').toEqual([6])
  })
  it('the other order: landed on Monday (week 2) first — Sunday on week 1 refuses a second row', () => {
    const inp = boundary()
    loadWeek(W2)
    expect(acceptInput(0, inp, 'g')).toBe(true)
    loadWeek(W1)
    expect(acceptInput(6, inp, 'g'), 'refused on Sunday — its row is on Monday').toBe(false)
    expect(rowsOf(inp)).toEqual([])
    expect(accCtl(6, inp)).toContain('On Mon 20 Jul')
  })
  it('the filing stays THIS week\'s: a week change never files it as landed from the other week (Astra 02)', () => {
    const inp = boundary()
    acceptInput(6, inp, 'g')
    loadWeek(W2)
    expect(inp.acc, 'on week 2 it is not landed here — nothing moves a published Monday\'s filing by navigation').toBeFalsy()
  })
  it('a saved week that cannot be read refuses a second row for a request that covers it — and only for one that does', () => {
    const inp = boundary()
    loadWeek(W2)
    stashPut(W1, 'not a saved week')                 // week 1 is saved but unreadable
    expect(rowElsewhere(inpId(inp), inp), 'the request covers week 1: unknown').toBe('unreadable')
    expect(acceptInput(0, inp, 'g'), 'never a second row on an unknown').toBe(false)
    const other: any = { person: 'bane', type: 'Meeting', date: 'Jul 21', s: 540, e: 600, remarks: '', mod: 'now', yr: 2026, _t: 1 }
    INPUTS.push(other)
    expect(rowElsewhere(inpId(other), other), 'a request that covers no day of week 1 is not held up by it').toBe(null)
    expect(acceptInput(1, other, 'g'), 'so it lands as ever').toBe(true)
  })
  it('a load or plan switch leaves out a row whose request stands on ANOTHER week, and says which day', () => {
    const inp = boundary()
    acceptInput(6, inp, 'g')
    loadWeek(W2)
    /* a version of Monday that carried a row of this request (as a version loaded after a re-accept would) */
    const incoming = JSON.parse(JSON.stringify(DAYS[0])); incoming.ground = [...(incoming.ground || []), { prog: 'MEETING', src: inpId(inp), who: 'divot' }]
    const left = rowsLeftOut(0, incoming)
    expect(left.map(x => x.id)).toEqual([inpId(inp)])
    expect(left[0]!.away, 'named by its day').toBe('2026-07-19')
  })
})

/* A SAVED WEEK THE REQUEST COVERS THAT CANNOT BE READ FAILS CLOSED AT EVERY DOOR (Astra's final read #1, 28 Sep 26 — the
   plan's §9: the resolver fails closed). The load's leave-out read the unknown and kept the incoming row — the one door
   that was open (red on the old code). The edit, the delete and the week switch's re-filing were already refused by the
   older lock on an unreadable week (quarantine.ts: every unreadable saved week is PROTECTED, and inputProtected refuses
   or skips an input covering it) — pinned here as they stand, the door's own fail-closed check now a second guard behind
   it. The control (a request covering no day of that week is not held up) is the test above. */
describe('a saved week that cannot be read — every door fails closed', () => {
  const unreadableW1 = () => { const inp = boundary(); loadWeek(W2); stashPut(W1, 'not a saved week'); return inp }
  it('a load or plan switch leaves the incoming row OUT, and says the week could not be read', () => {
    const inp = unreadableW1()
    const incoming = JSON.parse(JSON.stringify(DAYS[0])); incoming.ground = [...(incoming.ground || []), { prog: 'MEETING', src: inpId(inp), who: 'divot' }]
    const left = rowsLeftOut(0, incoming)
    expect(left.map(x => x.id), 'left out on the unknown').toEqual([inpId(inp)])
    expect(left[0]!.away).toBe('unreadable')
    expect(rowsLeftSaid([{ who: 'Ranger', what: 'Meeting', days: [], unknown: true }]), 'the load names the unknown, never an empty day')
      .toBe(' · Ranger · Meeting left out — it may be on another week that could not be read; load that week, then accept it here if it is not')
  })
  it('the delete refuses, and says why', async () => {
    const inp = unreadableW1()
    const { HOOKS } = await import('../engine/hooks')
    const said: string[] = [], keep = HOOKS.toast
    HOOKS.toast = (m: any) => { said.push(String(m)) }
    try { expect(removeInput(inp), 'refused').toBe(false) } finally { HOOKS.toast = keep }
    expect(INPUTS.includes(inp), 'the request stays').toBe(true)
    expect(said.join(' | '), 'refused with a reason — the lock on the unreadable week, or the door\'s own').toMatch(/This week is locked|Can't tell whether this input has a row on another week/)
  })
  it('the edit refuses too', async () => {
    const inp = unreadableW1()
    const { commitInputEdit } = await import('../ui/inputedit')
    const before = JSON.stringify(inp)
    expect(commitInputEdit(inp, { ...inp, remarks: 'changed' }), 'refused').toBe(false)
    expect(JSON.stringify(inp), 'unchanged').toBe(before)
  })
  it('the week switch does not re-park it as "taken off" on the unknown', () => {
    const inp = unreadableW1()
    relandInputs(new Set([inpId(inp)]))
    expect(inp.acc, 'not silenced — its row may be on the week that could not be read').not.toBe('r')
  })
})

describe('the delete\'s refusal reads the right weeks', () => {
  it('its row on ANOTHER week: refused, and the refusal names that day', () => {
    const inp = boundary()
    acceptInput(6, inp, 'g')
    loadWeek(W2)
    expect(removeInput(inp), 'Load the week of Sun 19 Jul first').toBe(false)
    expect(INPUTS.includes(inp)).toBe(true)
  })
  it('the LOADED week\'s own saved copy is stale and never read: a request taken off since deletes (Fable/Astra 1b)', () => {
    const inp: any = { person: 'divot', type: 'Meeting', date: 'Jul 15', s: 540, e: 600, remarks: '', mod: 'now', yr: 2026, _t: 1 }
    INPUTS.push(inp)
    expect(acceptInput(2, inp, 'g')).toBe(true)
    loadWeek(W2); loadWeek(W1)                        // week 1's saved copy now holds the row…
    expect(unacceptInput(2, inp), 'taken off on the live week').toBe(true)
    expect(rowsOf(inp)).toEqual([])
    expect(removeInput(inp), '…but that copy is stale: the delete goes through').toBe(true)
    expect(INPUTS.includes(inp)).toBe(false)
  })
})

describe('a "taken off" request whose own row stands again (a plan switched in) — [REQ-ORPHAN-ROW] 3', () => {
  /* the state a plan switch leaves: the request dormant ('r'), its own row back on the day */
  const dormantWithRow = () => {
    const inp: any = { person: 'divot', type: 'Meeting', date: 'Jul 15', s: 540, e: 600, remarks: '', mod: 'now', yr: 2026, _t: 1 }
    INPUTS.push(inp)
    acceptInput(2, inp, 'g')
    const row = DAYS[2].ground.find((g: any) => g.src === inpId(inp))
    unacceptInput(2, inp)                             // 'r', row gone
    DAYS[2].ground.push(row)                          // …the plan brings its copy of the row back
    return inp
  }
  it('Accept adopts that row — on the programme again, no second row', () => {
    const inp = dormantWithRow()
    expect(inp.acc).toBe('r')
    expect(acceptInput(2, inp, 'g'), 'Accept is no longer a dead button').toBe(true)
    expect(inp.acc).toBe('g')
    expect(rowsOf(inp), 'still one row').toEqual([2])
    expect(acceptedDay(inp)).toBe(2)
  })
  it('a delete takes that row with the request — no dead row left on the programme', () => {
    const inp = dormantWithRow()
    expect(removeInput(inp)).toBe(true)
    expect(rowsOf(inp), 'the row went with it').toEqual([])
  })
  it('the week switch does not re-park a request as "taken off" while its row stands on another week', () => {
    const inp = boundary()
    loadWeek(W2)
    acceptInput(0, inp, 'g'); unacceptInput(0, inp)  // taken off on Monday: week 2 remembers it as taken off
    loadWeek(W1)
    expect(acceptInput(6, inp, 'g')).toBe(true)   // landed on Sunday since
    loadWeek(W2)
    expect(inp.acc, 'not silenced as "taken off" — it is on Sunday\'s programme').not.toBe('r')
    expect(accCtl(0, inp)).toContain('On Sun 19 Jul')
    relandInputs(new Set([inpId(inp)]))
    expect(inp.acc).not.toBe('r')
  })
})

/* [REQ-DOOR-WORDS] 2 (28 Sep 26 — Fable's F5 on D175's branch): a request covering two days is drawn on both, but its one
   row stands on ONE; the other day's card offered a plain "Undo" that removed that row with nothing saying where. */
describe('the Undo on a request\'s card names the day its row is on', () => {
  it('Monday\'s card of a Mon–Tue request landed on Tuesday reads "Undo · Tue", and its press says Tuesday', async () => {
    const inp: any = { person: 'divot', type: 'Meeting', date: 'Jul 13', endDate: 'Jul 14', s: 540, e: 600, remarks: '', mod: 'now', yr: 2026, _t: 1 }
    INPUTS.push(inp)
    expect(acceptInput(1, inp, 'g')).toBe(true)                       // its row on Tuesday
    const mon = accCtl(0, inp), tue = accCtl(1, inp)
    expect(mon, 'Monday: the day its row is on').toContain('Undo · Tue')
    expect(mon).toContain("takes its row off Tuesday's ground programme")
    expect(tue, 'Tuesday (its own day): the plain Undo, as before').toContain('>Undo<')
    const { HOOKS } = await import('../engine/hooks')
    const { routeClick } = await import('../ui/interactions')
    const said: string[] = [], keep = HOOKS.toast
    HOOKS.toast = (m: any) => { said.push(String(m)) }
    try {
      const b = document.createElement('button')
      b.dataset.acc = 'x'; b.dataset.accd = '0'; b.dataset.acck = inpId(inp)
      document.body.appendChild(b)
      routeClick({ target: b, stopPropagation() {}, preventDefault() {} } as any)
      b.remove()
    } finally { HOOKS.toast = keep }
    expect(said.join(' ')).toContain("Accept undone — its row came off Tuesday's programme")
    expect(rowsOf(inp)).toEqual([])
  })
})
