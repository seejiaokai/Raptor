// @vitest-environment jsdom
/* [POST-OUT-OUTCOMES] (27 Sep 26) — A DELETE (Part A: the schedule, the stash, the plans, the inputs, the account).
   Owner D287 (his account and his person go), D290 (kept underneath — a hidden mark), D297 (every day he already flew
   keeps his puck; days still to come lose him), D299 (the past keeps its record; today and the future lose him). ONE
   clock (the plan's Round 2): the cutoff is the later of the delete's date and the calendar date — the clock is FIXED here
   at 15 Jul 26, inside the demo week (13–19 Jul), so the 13th and 14th are days he flew and the 15th on are days to come.
   Tests loop over the roll-call of slot KINDS (bug-check order §8.1). Register lines PO4, PO5, PO6, PO7. */
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { storeBackend } from '../engine/hooks'
import { PEOPLE, nameToId, indexCallsigns, archivedHolders } from '../engine/people'
import { DAYS } from '../engine/data'
import { CURWEEK } from '../engine/waves'
import { INPUTS } from '../engine/inputs'
import { setSlotVal, slotVal, acceptInput } from '../engine/slots'
import { SCHED, setSign, setDayApproved, dayDelta, daySnapOf, dayCurVer } from '../engine/publish'
import { stashPut, stashGet, stashDrop } from '../engine/weekstash'
import { initStore, resetSession, notify, weekStashSnap, weekDirty, writeInputs } from './store'
import { Whiteboard } from '../storage/whiteboard'
import { wirePersist } from './persist'
import { schedWrite, SCHED_TYPES } from './sched-commit'
import { HOOKS } from '../engine/hooks'
import { accountsLoad, accountByName, signIn, sessionFor, ACCOUNTS_LIST } from './accounts'
import { PLANPUCKS, addPuckRow } from './plan'
import { newPersonProblem } from './roster-add'
import { deletePerson, deleteCutoff, personKeysOnDay, effectiveToday, deletedRestoreProblem } from './person-delete'
import { loadVersionToWorkingCopy, ROWSLEFT, rowsLeftSaid } from '../engine/drafts'

const mem: Record<string, string> = {}
let PEOPLE0 = ''
const signInAs = (name: string, pass = 'x') => { resetSession(sessionFor(signIn(name, pass))); notify() }
const HIM = 'rocky'                                  // Hex — the seeded `hex` member account
const PAST = 0, PAST2 = 1, TODAY_DI = 2, TO_COME = 4 // 13, 14 | 15 (today) | 17 Jul
const clone = (x: any) => JSON.parse(JSON.stringify(x))

/* publish a day as the app does: the four sign-offs, then Publish (a day that is not signed does not publish) */
function publish(di: number) {
  const signers = ['stiff', 'harpoon', 'razer', 'yeti']
  ;(['cur', 'sked', 'plan', 'appr'] as const).forEach((r, i) => setSign(di, r, signers[i]))
  setDayApproved(di, true)
  expect(dayCurVer(di), `day ${di} is published`).toBeTruthy()
}
/* every KIND of slot on a day, found on the demo day itself, and his id planted in each (the funnel) — returns the keys */
function plantEveryKind(di: number): string[] {
  const d: any = (DAYS as any)[di]; const keys: string[] = []
  const w = (d.waves || []).findIndex((w: any) => w && (w.formations || []).some((f: any) => (f.aircraft || []).length))
  if (w >= 0) { const li = d.waves[w].formations.findIndex((f: any) => (f.aircraft || []).length); keys.push(`${di}.${w}.${li}.0.w`) }
  const dw = (d.dutywaves || []).findIndex((x: any) => x && (x.rows || []).length)
  if (dw >= 0) keys.push(`d:${di}.${dw}.0`, `d:${di}.${dw}.0.x0`)
  const kind = Object.keys(d.sims || {}).find(k => (d.sims[k] || []).length)
  if (kind) { const r = d.sims[kind][0]; keys.push(Array.isArray(r.pax) ? `s:${di}.${kind}.0.pax.0` : `s:${di}.${kind}.0.p`, `s:${di}.${kind}.0.x0`) }
  const g = (d.ground || []).findIndex((r: any) => r && !r.src)
  if (g >= 0) keys.push(`g:${di}.${g}`, `g:${di}.${g}.x0`)
  if ((d.allhands || []).length) keys.push(`a:${di}.0.0`, `a:${di}.0.x0`)
  for (const k of keys) setSlotVal(k, HIM)
  return keys
}

beforeAll(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date(2026, 6, 15, 9, 0, 0))
  PEOPLE0 = JSON.stringify(PEOPLE)
})
afterAll(() => { vi.useRealTimers(); storeBackend.impl = null })
beforeEach(() => {
  Object.keys(mem).forEach(k => delete mem[k])
  storeBackend.impl = { getItem: (k: string) => (k in mem ? mem[k]! : null), setItem: (k: string, v: string) => { if (v === 'null') delete mem[k]; else mem[k] = v }, keys: () => Object.keys(mem) }
  const p0 = JSON.parse(PEOPLE0)
  for (const k of Object.keys(PEOPLE)) delete (PEOPLE as any)[k]
  Object.assign(PEOPLE, p0); indexCallsigns()
  for (const v of ['20/07/2026', '06/07/2026', '27/07/2026']) stashDrop(v)
  PLANPUCKS.length = 0
  for (let i = INPUTS.length - 1; i >= 0; i--) if (String((INPUTS as any)[i].iid || '').startsWith('ipd')) INPUTS.splice(i, 1)
  initStore(); accountsLoad()
  signInAs('ad', 'a')
})
afterEach(() => { resetSession(null) })

describe('PO6 — the cutoff: the later of its date and today, on ONE clock (the plan, Round 2)', () => {
  it('today is the calendar date; a date to come stands; a date already past becomes today', () => {
    expect(effectiveToday()).toBe('2026-07-15')
    expect(deleteCutoff()).toBe('2026-07-15')
    expect(deleteCutoff('2026-10-14')).toBe('2026-10-14')
    expect(deleteCutoff('2026-07-01')).toBe('2026-07-15')
  })
})

describe('PO6 — days he flew keep his puck; every day from the cutoff loses him — every KIND of slot', () => {
  it('the loaded week: every slot kind on a day to come emptied; the same kinds on the days he flew untouched', () => {
    expect(CURWEEK).toBe('13/07/2026')
    const pastKeys = plantEveryKind(PAST)
    const comeKeys = plantEveryKind(TO_COME)
    expect(pastKeys.length, 'the demo day carries every kind of slot (flying, desk + extras, sim + extras, ground + extras, programme + extras)').toBeGreaterThanOrEqual(9)
    expect(deletePerson(HIM)).toBe(null)
    for (const k of comeKeys) expect(slotVal(k), `${k} (a day to come)`).toBe('')
    for (const k of pastKeys) expect(slotVal(k), `${k} (a day he flew)`).toBe(HIM)
    expect(personKeysOnDay(TO_COME, HIM)).toEqual([])
    expect(personKeysOnDay(TODAY_DI, HIM), 'today is "to come" (D299: today and the future)').toEqual([])
    expect(personKeysOnDay(PAST, HIM).length).toBeGreaterThanOrEqual(pastKeys.length)
  })
  it('his sign-off boxes: cleared on a day to come, kept on a day he flew', () => {
    setSign(PAST2, 'cur', HIM); setSign(TO_COME, 'cur', HIM)
    expect(deletePerson(HIM)).toBe(null)
    expect(SCHED.sign[TO_COME].cur).toBe('')
    expect(SCHED.sign[PAST2].cur).toBe(HIM)
  })
  it('a parked plan of a day to come loses him too (its day and its sign-offs)', () => {
    const d = clone((DAYS as any)[TO_COME]); d.ground = [{ who: HIM, str: '0900', end: '1000' }]
    SCHED.drafts = SCHED.drafts || {}
    ;(SCHED.drafts as any)[TO_COME] = [{ id: 'pdraft', name: 'Plan B', d, sign: { cur: HIM, sked: '', plan: '', appr: '' }, signBind: { cur: { x: 1 } } }]
    expect(deletePerson(HIM)).toBe(null)
    const t = (SCHED.drafts as any)[TO_COME][0]
    expect(JSON.stringify(t.d)).not.toContain(`"${HIM}"`)
    expect(t.sign.cur).toBe('')
    expect(t.signBind.cur).toBeUndefined()
  })
  it('a STASHED week to come is swept (its days, sign boxes, parked plans); a stashed week before the cutoff is not', () => {
    const day = clone((DAYS as any)[PAST]); day.ground = [{ who: HIM, str: '0900', end: '1000' }]
    const blob = (plans: boolean) => JSON.stringify({ d: [0, 1, 2, 3, 4, 5, 6].map(() => clone(day)), sg: { 1: { cur: HIM } }, sb: { 1: { cur: { x: 1 } } },
      dr: plans ? { 2: [{ id: 'q', name: 'Q', d: clone(day), sign: { cur: HIM }, signBind: {} }] } : {} })
    stashPut('20/07/2026', blob(true))          // 20–26 Jul: every day to come
    stashPut('06/07/2026', blob(false))         // 6–12 Jul: all before the cutoff
    expect(deletePerson(HIM)).toBe(null)
    const after = stashGet('20/07/2026')!
    expect(after).not.toContain(`"${HIM}"`)
    expect(stashGet('06/07/2026')).toContain(`"${HIM}"`)
  })
  /* the calendar's rows carry their day as `date` (state/plan.ts addPuckRow) — the fixture below once wrote `iso`, the
     field the delete read, so the delete never took him off a real calendar row ([DB-READINESS] group A, phase 2) */
  it('the planning calendar: his puck gone from a day to come (a gap — the others keep their places), kept on a day he flew', () => {
    PLANPUCKS.push({ id: 'pp1', date: '2026-07-17', kind: 'pucks', ids: ['bane', HIM, 'pike'] }, { id: 'pp0', date: '2026-07-13', kind: 'pucks', ids: [HIM] })
    expect(deletePerson(HIM)).toBe(null)
    expect(PLANPUCKS.find(e => e.id === 'pp1').ids).toEqual(['bane', '', 'pike'])
    expect(PLANPUCKS.find(e => e.id === 'pp0').ids).toEqual([HIM])
  })
  it('…a pucks row made on the calendar itself (its own door) loses him from a day to come', () => {
    expect(writeInputs(() => { addPuckRow('2026-07-18', ['bane', HIM]) })).toBe(true)
    const row = PLANPUCKS.find((e: any) => e.date === '2026-07-18' && e.kind === 'pucks')
    expect(row.ids).toEqual(['bane', HIM])
    expect(deletePerson(HIM)).toBe(null)
    expect(PLANPUCKS.find((e: any) => e.id === row.id).ids).toEqual(['bane'])
  })
})

describe('PO6 — a published day: the one he flew never reads pending; one to come keeps its issued face and reads pending', () => {
  it('a published day he flew: nothing pending after the delete (his roster attributes are not compared — F8)', () => {
    setSlotVal(`d:${PAST}.0.0`, HIM)
    publish(PAST)
    const before = dayDelta(PAST).length
    expect(deletePerson(HIM)).toBe(null)
    expect(dayDelta(PAST).length, 'the delete adds nothing to a day he flew').toBe(before)
  })
  it('a published day to come: the working copy loses him — a pending change; the issued version still holds him', () => {
    const keys = plantEveryKind(TO_COME)
    publish(TO_COME)
    const issued = JSON.stringify(daySnapOf(TO_COME, dayCurVer(TO_COME)))
    expect(issued).toContain(`"${HIM}"`)
    expect(dayDelta(TO_COME).length).toBe(0)
    expect(deletePerson(HIM)).toBe(null)
    for (const k of keys) expect(slotVal(k)).toBe('')
    expect(dayDelta(TO_COME).length, 'it reads pending').toBeGreaterThan(0)
    expect(JSON.stringify(daySnapOf(TO_COME, dayCurVer(TO_COME))), 'the issued version is a record — never rewritten').toBe(issued)
  })
})

/* THE LOAD BELT (the plan's Round 2 — D297): the issued version of a day to come still holds him (a record, never
   rewritten), so "Load onto working copy" would put him straight back. It never does, and its message says why. A day he
   flew is left alone — loading its version there puts back exactly what was issued. Register PO6. */
describe('PO6 — loading a published version never brings a deleted man back on a day from his cutoff', () => {
  it('a day to come: loaded, he stays off and the message names him; a day he flew: loaded as issued', () => {
    const toCome = plantEveryKind(TO_COME)
    const flown = plantEveryKind(PAST)
    publish(TO_COME); publish(PAST)
    expect(deletePerson(HIM)).toBe(null)
    expect(loadVersionToWorkingCopy(TO_COME, dayCurVer(TO_COME))).toBeTruthy()
    for (const k of toCome) expect(slotVal(k), `${k} after the load (a day to come)`).toBe('')
    expect(ROWSLEFT.some(x => x.dead && x.who === 'Hex')).toBe(true)
    expect(rowsLeftSaid(ROWSLEFT)).toContain('Hex left out — he has been deleted')
    expect(loadVersionToWorkingCopy(PAST, dayCurVer(PAST))).toBeTruthy()
    for (const k of flown) expect(slotVal(k), `${k} after the load (a day he flew)`).toBe(HIM)
    expect(ROWSLEFT.some(x => x.dead), 'nothing to leave out on a day he flew').toBe(false)
  })
})

/* THE DELETE IS SAVED (found by the walk, 27 Sep 26 — every unit test here read the live model, none the saved copy):
   the loaded week is filed without him on the days from the cutoff, so a reload does not put him back. */
describe('PO6 — the delete is saved: the loaded week filed without him', () => {
  it('after the delete the saved copy of the week on screen no longer holds him on a day to come; a day he flew still does', () => {
    const wb = new Whiteboard()
    wirePersist(wb, { weekSnap: weekStashSnap, weekDirty })
    /* planted the way the app writes — inside a schedule command, whose rows are the save */
    /* a day is saved only when its command CHANGES it (the group-wide walk's H3 — no first save of all seven days): the
       tests above may already have planted him here, so each day also takes a note of this test's own */
    schedWrite(SCHED_TYPES.mutate, () => {
      plantEveryKind(TO_COME); plantEveryKind(PAST)
      for (const di of [TO_COME, PAST]) (DAYS as any)[di].notes.push({ t: 'PO6 SAVED ' + di })
    })
    /* the week is saved as one row per day ([DB-READINESS] group A, phase 1 — state/weekrows.ts) */
    const day = (di: number) => JSON.parse(wb.get('weeks', `13-07-2026#${di}`)!).d
    expect(JSON.stringify(day(TO_COME)), 'the fixture is saved').toContain(`"${HIM}"`)
    expect(deletePerson(HIM)).toBe(null)
    expect(JSON.stringify(day(TO_COME)), 'a day to come, as saved').not.toContain(`"${HIM}"`)
    expect(JSON.stringify(day(PAST)), 'a day he flew, as saved').toContain(`"${HIM}"`)
  })
})

/* FABLE'S CODE READ 1 (27 Sep 26): a request that SPANS the cutoff, its row landed on a day from the cutoff — un-landing
   that row must not leave the kept part "taken off" (dormant) on the days before the cutoff it still covers. */
describe('PO7 — a request spanning the cutoff, landed on a day to come, stays accepted for the days before', () => {
  it('its row leaves the day to come; it ends the day before, still accepted (\u2018g\u2019), its till tail written', () => {
    const inp: any = { iid: 'ipdL', person: HIM, date: 'Jul 14', endDate: 'Jul 17', yr: 2026, allday: false, s: '09:00', e: '11:00', type: 'TRNG', remarks: 'Training', mod: '2026-07-01' }
    INPUTS.push(inp)
    acceptInput(TO_COME, inp, 'g')
    expect(inp.acc).toBe('g')
    expect(JSON.stringify((DAYS as any)[TO_COME].ground || []), 'its row is on the day to come').toContain(String(inp.iid))
    expect(deletePerson(HIM)).toBe(null)
    expect(JSON.stringify((DAYS as any)[TO_COME].ground || []), 'the row left the day to come').not.toContain(String(inp.iid))
    expect(inp.acc, 'the kept part is still accepted — never "taken off"').toBe('g')
    expect(inp.endDate === undefined || inp.endDate === 'Jul 14', 'it ends the day before the cutoff').toBe(true)
    expect(INPUTS.includes(inp)).toBe(true)
  })
})

describe('PO7 — his inputs: before the cutoff kept; spanning it ended the day before; from it gone', () => {
  it('three inputs, three outcomes', () => {
    INPUTS.push(
      { iid: 'ipd1', person: HIM, date: 'Jul 10', yr: 2026, allday: true, type: 'LL', remarks: 'Local leave', mod: '2026-07-01' },
      { iid: 'ipd2', person: HIM, date: 'Jul 14', endDate: 'Jul 18', yr: 2026, allday: true, type: 'LL', remarks: 'Local leave till 18 Jul', mod: '2026-07-01' },
      { iid: 'ipd3', person: HIM, date: 'Jul 20', yr: 2026, allday: true, type: 'LL', remarks: 'Local leave', mod: '2026-07-01' },
    )
    expect(deletePerson(HIM)).toBe(null)
    const find = (iid: string) => INPUTS.find((r: any) => r.iid === iid) as any
    expect(find('ipd1')).toMatchObject({ date: 'Jul 10', remarks: 'Local leave' })
    const two = find('ipd2')
    expect(two.endDate === undefined || two.endDate === 'Jul 14').toBe(true)
    expect(two.remarks).toMatch(/till 14 Jul|on 14 Jul|^Local leave$/)
    expect(find('ipd3'), 'an input starting on or after the cutoff is gone').toBeUndefined()
  })
})

describe('PO5 — kept underneath, gone from every list; his callsign free; his account gone', () => {
  it('the hidden mark, the callsign, the account and his next sign-in', () => {
    const cs = PEOPLE[HIM].cs
    expect(deletePerson(HIM)).toBe(null)
    expect(PEOPLE[HIM]).toMatchObject({ deleted: true, deletedFrom: '2026-07-15', archived: true, archivedBy: 'del' })
    expect(nameToId(cs), 'his callsign is free').toBeUndefined()
    expect(archivedHolders(cs), 'not an archived holder either').toEqual([])
    expect(newPersonProblem({ cs, ini: '', seat: 'FCP', cat: 'C' }), 'a new person may take it').toBe(null)
    expect(accountByName('hex'), 'his account is gone').toBeUndefined()
    expect(signIn('hex', 'x').kind, 'signing in again asks for access afresh (D280 (3), D287 (4))').toBe('new')
  })
})

/* B4 of the change-recording re-test (28 Sep 26) — a DELETE IS FINAL for the man and his account too (D287). Once the one
   Undo takes roster and settings steps ([UNDO-ROSTER-SETTINGS]), an older step whose image holds him un-deleted, or an
   accounts list holding his account, would put him back; a delete of a man the war does not hold writes no posting record,
   so nothing else would keep it dead (Fable's red team 10 — built BEFORE the cutover). */
describe('B4 — undo and redo never put a deleted man, or his account, back', () => {
  /* one row per account since [DB-READINESS] group A, phase 4.4: a step holds a change per account ROW */
  const rowsOf = (list: any[]) => list.map(a => ({ op: 'put', collection: 'settings', id: `account:${a.id}`, after: clone(a) }))
  it('a roster image of him un-deleted, and an account row of his, are refused; his deleted image is not', () => {
    const before = clone((PEOPLE as any)[HIM])
    const accts = clone(ACCOUNTS_LIST)
    expect(deletePerson(HIM)).toBe(null)
    expect(deletedRestoreProblem([{ op: 'put', collection: 'people', id: HIM, after: before }])).toMatch(/Hex has been deleted/)
    expect(deletedRestoreProblem(rowsOf(accts))).toMatch(/Hex has been deleted/)
    expect(deletedRestoreProblem([{ op: 'put', collection: 'people', id: HIM, after: clone((PEOPLE as any)[HIM]) }])).toBe(null)
    expect(deletedRestoreProblem(rowsOf(ACCOUNTS_LIST))).toBe(null)
  })
  it('a step leaving NO account row is the SEEDED list — and it holds Ranger’s account (Fable’s final read, F5)', () => {
    expect(deletePerson('bane')).toBe(null)
    const stored = Object.keys(mem).filter(k => k.startsWith('sqn142_account:')).map(k => k.slice('sqn142_'.length))
    expect(stored.length, 'the delete stored the accounts it left').toBeGreaterThan(0)
    expect(deletedRestoreProblem(stored.map(id => ({ op: 'delete', collection: 'settings', id })))).toMatch(/Ranger has been deleted/)
  })
})

describe('PO4 — the refusals: never oneself, never a placeholder, never twice, only an admin; a refusal changes nothing', () => {
  it('his own person / account', () => {
    expect(deletePerson('stiff')).toMatch(/can't delete your own account|can't delete yourself/)
    expect((PEOPLE as any).stiff.deleted).toBeFalsy()
  })
  it('a placeholder, and a man already deleted', () => {
    expect(deletePerson('all')).toBe('That is not a person')
    expect(deletePerson(HIM)).toBe(null)
    expect(deletePerson(HIM)).toMatch(/already deleted/)
  })
  it('a member cannot', () => {
    signInAs('us', 'us')
    expect(deletePerson(HIM)).toBe('Only an admin can delete someone')
    expect((PEOPLE as any)[HIM].deleted).toBeFalsy()
  })
  it('a stored week to come that cannot be read refuses the WHOLE delete — nothing moves (Astra A1)', () => {
    setSlotVal(`d:${TO_COME}.0.0`, HIM)
    stashPut('27/07/2026', 'not a week')
    expect(deletePerson(HIM)).toMatch(/can't be read — the delete was not made/)
    expect((PEOPLE as any)[HIM].deleted).toBeFalsy()
    expect(accountByName('hex')).toBeTruthy()
    expect(slotVal(`d:${TO_COME}.0.0`)).toBe(HIM)
  })
})
