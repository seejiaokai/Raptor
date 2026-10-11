// @vitest-environment jsdom
/* WHAT A HAND DOES TO A ROW THAT CAME FROM AN INPUT ([ALL-AVAIL-AS-MEMBER] step 2 (b) and (c); the plan
   docs/superpowers/plans/2026-10-11-one-rule-plan.md §4.3, §4.4 — its tests T2, T8, T15). His rulings:
   D755 — "a row that came from an input IS the input: whoever stands on it — a named person or ALL AVAIL / ALL, whoever
           put them there, whether the input began with one person or several — is in the input"; (2) "a man dropped on
           the ONLY man's puck replaces him, and the input becomes the new man's"; (4) where it cannot apply the drop
           is refused with its reason;
   D757 — the walk-through; D756 — one record with the list of its people;
   D739, D740 — a time or a remark typed on the row changes the input; D741 — nobody added from the schedule reads late;
   D271 — one person once on a row.
   It replaces ui/grouprow-hands.test.tsx (D734's hands, on a shared input's row alone — one row a man, drawn as one):
   every case of that file that D755 keeps is here on the one record; what D755 changed is here as changed — a one-person
   request's row is the door's too (D18, D46 and D470 as changed by D755), and a placeholder no longer rides one man's
   place (D745 set aside; ALL AVAIL as one of the people is step 3).

   ONE DOOR (ui/reqdoor.ts) is asked by every place that writes a person to a ground row, and a BELT in the engine
   (slots.ts setSlotVal / fillSlot) refuses a raw write that reaches such a row without it. Driven through the door, the
   store's writers, the typed box's door, the drop itself (ui/drag.ts applyDrop, on a stand-in element carrying the
   place's key) and an armed place filled by a tap, on a real saved store. A real drag is walked in the browser. */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { INPUTS, inpId, idsOf, isLateInput, inputLines } from '../engine/inputs'
import { PEOPLE, ID_BY_CS, indexCallsigns } from '../engine/people'
import { DAYS } from '../engine/data'
import { CURWEEK } from '../engine/waves'
import { storeBackend, HOOKS } from '../engine/hooks'
import { stashClear } from '../engine/weekstash'
import { SCHED } from '../engine/publish'
import { ELOG } from '../engine/editlog'
import { setSlotVal, fillSlot, slotVal } from '../engine/slots'
import { rowPeopleDrawn } from '../engine/grouprows'
import { PLANPUCKS, DAYRMK } from '../state/plan'
import { initStore, weekStashSnap, weekDirty, loadWeek, writeSlot, writeFill } from '../state/store'
import { setSession, setMe, DEFAULT_ME } from '../state/auth'
import { hydrate, wirePersist } from '../state/persist'
import { bootStorage } from '../storage/boot'
import { settingsAdapter } from '../storage/adapters'
import { MemoryBackend } from '../storage/memory'
import { SCHEMA_VERSION } from '../storage/reset'
import type { Whiteboard } from '../storage/whiteboard'
import { globalUndo } from '../undo'
import { _resetTimeline } from '../undo/timeline'
import { installGlobalUndo } from '../state/undo-wire'
import { _resetDisclosure } from '../state/disclosure'
import { setPage, setBoardDay } from '../state/view'
import * as view from '../state/view'
import { commitInput, commitNewInput, draftOf, setInpField } from './inputedit'
import { rowPut, rowTake, rowMove, onInputRow, isRowMan } from './reqdoor'
import * as pops from './pops'
import { applyDrop, setDrag } from './drag'
import { pendingLand } from './lift'

const ISNAP = JSON.stringify(INPUTS)
const PSNAP = JSON.stringify(PEOPLE)
const DSNAP = JSON.stringify(DAYS)
const W1 = '13/07/2026'
const WED = 2, SAT = 5
const SAT_ISO = '2026-07-18'
const toast = HOOKS.toast
let SAID: string[] = []

function resetWorld() {
  if (CURWEEK !== W1) loadWeek(W1)
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
  for (const k of Object.keys(PEOPLE)) delete PEOPLE[k]
  Object.assign(PEOPLE, JSON.parse(PSNAP))
  for (const k of Object.keys(ID_BY_CS)) delete ID_BY_CS[k]
  indexCallsigns()
  PLANPUCKS.length = 0; for (const k of Object.keys(DAYRMK)) delete DAYRMK[k]
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  SCHED.pending = {}; SCHED.changes = {}; SCHED.added = {}; SCHED.als = []
  SCHED.al = 0; SCHED.dayOK = {}; SCHED.sign = {}; SCHED.orig = {}; SCHED.cur = {}
  SCHED.signBind = {}; SCHED.drafts = {}; SCHED.curDraft = {}; SCHED.retired = {}; SCHED.correcting = {}
  view.WARNOFF.clear(); view.disarmSlot()
  pops.setInpEdit(null); pops.setOilAsk(null)
  stashClear()
}
async function boot(be: MemoryBackend): Promise<Whiteboard> {
  if (!be.peek('settings', 'schema')) be.seed({ settings: { schema: JSON.stringify(SCHEMA_VERSION) } })
  const p = bootStorage(be)
  await vi.advanceTimersByTimeAsync(be.latency)
  const { wb } = await p
  storeBackend.impl = settingsAdapter(wb)
  hydrate(wb)
  initStore()
  wirePersist(wb, { weekSnap: weekStashSnap, weekDirty })
  _resetDisclosure()
  _resetTimeline(); installGlobalUndo()
  setSession({ user: 'ad', role: 'admin', name: 'ad' }); setMe('stiff')      // Saber, a scheduler
  setPage('editsched'); setBoardDay(WED)
  return wb
}

const cs = (p: string) => String((PEOPLE as any)[p].cs)
const TITLE = 'Range safety brief'
const dateOf = (di: number) => (di === SAT ? 'Jul 18' : 'Jul 15')
const recs = (di = WED, title = TITLE) => INPUTS.filter((x: any) => x.title === title && x.date === dateOf(di)) as any[]
const rec = (di = WED, title = TITLE) => { const l = recs(di, title); expect(l, 'ONE record').toHaveLength(1); return l[0] }
const people = (di = WED, title = TITLE) => idsOf(rec(di, title)).map(String)
const ground = (di = WED) => ((DAYS[di] as any).ground || []) as any[]
const riOf = (di = WED, title = TITLE) => ground(di).findIndex((g: any) => g && g.src === String(inpId(rec(di, title))))
const rowOf = (di = WED, title = TITLE) => ground(di)[riOf(di, title)]
const rowKey = (di = WED, title = TITLE) => `g:${di}.${riOf(di, title)}`
/* the place a person stands on, on the input's row */
const keyOf = (p: string, di = WED, title = TITLE) => { const r = rowOf(di, title), k = rowKey(di, title); if (r.who === p) return k; const n = (r.more || []).indexOf(p); expect(n, `${p} is on the row`).toBeGreaterThanOrEqual(0); return `${k}.x${n}` }
const onRow = (di = WED, title = TITLE) => [rowOf(di, title).who, ...(rowOf(di, title).more || [])].filter(Boolean)
const DRAFT = (di = WED, over: any = {}) => ({ ...draftOf({ person: 'bane', type: di === SAT ? 'Duty' : 'Meeting', title: TITLE, date: dateOf(di), yr: 2026, allday: false, s: 840, e: 900, remarks: 'Bring your kit' }), ...over })
const file = (ppl: string[], di = WED, oil?: Record<string, number>, over: any = {}) => expect(commitInput(null, DRAFT(di, over), ppl, oil ? { oil } : undefined)).toBe(true)
const lines = () => ELOG.rows.length
const seatEl = (key: string) => { const el = document.createElement('span'); el.className = 'seat'; el.dataset.slot = key; document.body.appendChild(el); return el }
const cellEl = (key: string) => { const row = document.createElement('div'); row.className = 'pl-row'; const c = document.createElement('div'); c.className = 'ppl'; c.dataset.fill = key; row.appendChild(c); document.body.appendChild(row); return c }

beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(new Date(2026, 5, 1, 9, 0, 0)); resetWorld(); SAID = []; HOOKS.toast = (m: any) => { SAID.push(String(m)) } })
afterEach(() => { HOOKS.toast = toast; _resetTimeline(); vi.useRealTimers(); resetWorld(); setSession(null); setMe(DEFAULT_ME); storeBackend.impl = null; document.body.innerHTML = ''; setDrag(null) })

describe('an input is ONE row, a whole copy of the input (D755, D756 — the plan §4.3)', () => {
  it('an input for three lands ONE row: the first to join in the name box, the others under it — drawn A to Z', async () => {
    await boot(new MemoryBackend())
    file(['pike', 'bane', 'split'])
    expect(ground().filter((g: any) => g.src === String(inpId(rec())))).toHaveLength(1)
    expect(onRow()).toEqual(['pike', 'bane', 'split'])
    expect(rowPeopleDrawn(DAYS[WED], WED, riOf()).map(p => cs(p.id)), 'named A to Z by callsign').toEqual(['bane', 'pike', 'split'].map(cs).sort((a, b) => a.localeCompare(b)))
    expect(inputLines([rec()]).map((l: any) => l.person), 'and one line a person for the rules').toEqual(['pike', 'bane', 'split'])
  })
  it('every place of the row is the door\'s — the name box, a place under it, its "+ add" — for an input of ONE person too', async () => {
    await boot(new MemoryBackend())
    expect(commitNewInput(DRAFT())).toBe(true)
    const k = rowKey()
    expect(onInputRow(k)).toBe(true); expect(onInputRow(`${k}.+`)).toBe(true)
    expect(isRowMan(k)).toBe(true); expect(isRowMan(`${k}.+`)).toBe(false)
    expect(onInputRow('2.0.0.0.p'), 'a flying seat is not').toBe(false)
  })
  it('a row made before the build is re-made once, whole: whoever stood on it without being in the input comes off (R6)', async () => {
    await boot(new MemoryBackend())
    expect(commitNewInput(DRAFT())).toBe(true)
    const r = rowOf()
    /* as an old stored day would carry it: a man of the scheduler's under the row, another in its name box, an old hash */
    r.who = 'split'; r.more = ['pike']; r.srcv = 'old'; r.srcg = 'g1'
    view.afterSchedMutate()
    expect(onRow()).toEqual(['bane'])
    expect(rowOf().srcg).toBeUndefined()
    expect(people()).toEqual(['bane'])
  })
})

describe('a person put on the row JOINS the input (D755)', () => {
  it('on "+ add", on a puck where the row holds several, on a place under it: he is IN the input — the same record, the same row', async () => {
    for (const where of ['add', 'puck', 'under'] as const) {
      resetWorld(); await boot(new MemoryBackend())
      file(['bane', 'pike'])
      const id = String(inpId(rec())), rid = rowOf().rid
      const key = where === 'add' ? `${rowKey()}.+` : where === 'puck' ? keyOf('bane') : keyOf('pike')
      const before = lines()
      expect(rowPut(key, 'split'), where).toBe('done')
      expect(people(), where).toEqual(['bane', 'pike', 'split'])
      expect(String(inpId(rec())), 'the same record').toBe(id)
      expect(rowOf().rid, 'the same row').toBe(rid)
      expect(onRow(), where).toEqual(['bane', 'pike', 'split'])
      expect(lines() - before, 'one line in the change history').toBe(1)
      expect(SAID.join(' | ')).toContain(`${cs('split')} added to ${TITLE}`)
      expect(isLateInput(rec()), 'nobody reads late for it (D741)').toBe(false)
      globalUndo()
      expect(people(), 'ONE Undo').toEqual(['bane', 'pike'])
      expect(onRow()).toEqual(['bane', 'pike'])
    }
  })
  it('on a one-person input\'s "+ add" he joins it — the input holds two, and the Inputs pages will say so', async () => {
    await boot(new MemoryBackend())
    expect(commitNewInput(DRAFT())).toBe(true)
    expect(rowPut(`${rowKey()}.+`, 'pike')).toBe('done')
    expect(people()).toEqual(['bane', 'pike'])
    expect(onRow()).toEqual(['bane', 'pike'])
  })
  it('already in it: refused, in words (D271) — and nothing changes', async () => {
    await boot(new MemoryBackend())
    file(['bane', 'pike'])
    const was = JSON.stringify(INPUTS)
    expect(rowPut(keyOf('bane'), 'pike')).toBe('refused')
    expect(SAID.join(' ')).toContain(`${cs('pike')} is already on this input`)
    expect(JSON.stringify(INPUTS)).toBe(was)
  })
  it('he follows the input\'s ONE OIL answer: nothing is written for him; a No says he is not counted; no answer opens the question for the input (D755 (1), D762)', async () => {
    await boot(new MemoryBackend())
    file(['bane', 'pike'], SAT, { [SAT_ISO]: 0.5 })
    expect(rowPut(`${rowKey(SAT)}.+`, 'split')).toBe('done')
    expect(rec(SAT).oil).toEqual({ [SAT_ISO]: 0.5 })
    expect(rec(SAT).people.every((e: any) => !('oil' in e))).toBe(true)
    expect(pops.OILASK, 'answered: no question').toBeFalsy()
    resetWorld(); await boot(new MemoryBackend()); SAID = []
    file(['bane', 'pike'], SAT, { [SAT_ISO]: 0 })
    expect(rowPut(`${rowKey(SAT)}.+`, 'split')).toBe('done')
    expect(SAID.join(' | ')).toContain(`${cs('split')} added to ${TITLE} — not counted for OIL`)
    resetWorld(); await boot(new MemoryBackend())
    file(['bane', 'pike'], SAT)
    expect(rowPut(`${rowKey(SAT)}.+`, 'split')).toBe('done')
    expect(pops.OILASK, 'no answer yet: the question opens at once, for the input').toBe(String(inpId(rec(SAT))))
  })
})

describe('a person put on the ONLY person\'s puck replaces him (D755 (2); the plan\'s T15 — Fable F7, F8)', () => {
  it('from the crew list: the input becomes the new man\'s — "by" passes to whoever did it, the OIL answer is void and asked again', async () => {
    await boot(new MemoryBackend())
    setSession({ user: 'us', role: 'main', name: 'us' }); setMe('bane')
    expect(commitNewInput(DRAFT(SAT))).toBe(true)
    rec(SAT).oil = { [SAT_ISO]: 0.5 }
    setSession({ user: 'ad', role: 'admin', name: 'ad' }); setMe('stiff')
    const id = String(inpId(rec(SAT)))
    expect(rowPut(rowKey(SAT), 'pike')).toBe('done')
    expect(people(SAT)).toEqual(['pike'])
    expect(String(inpId(rec(SAT))), 'the same input').toBe(id)
    expect(rec(SAT).by, 'by Saber now').toBe('stiff')
    expect(rec(SAT).oil, 'the answer was the first man\'s own').toBeUndefined()
    expect(pops.OILASK, 'and the question opens at once').toBe(id)
    expect(SAID.join(' | ')).toContain(`${cs('pike')} is on ${TITLE} instead of ${cs('bane')}`)
    expect(onRow(SAT)).toEqual(['pike'])
    globalUndo()
    expect(people(SAT), 'ONE Undo').toEqual(['bane'])
  })
  it('dragged from a flying seat: the two change places in ONE step — and a seat that refuses the man replaced refuses both', async () => {
    await boot(new MemoryBackend())
    expect(commitNewInput(DRAFT())).toBe(true)
    const seat = '2.0.0.0.p', flew = String(slotVal(seat))
    expect(flew && flew !== 'bane').toBeTruthy()
    setDrag({ kind: 'slot', key: seat })
    expect(applyDrop(seatEl(rowKey()), 0, 0)).toBe(true)
    expect(people()).toEqual([flew])
    expect(slotVal(seat), 'the man replaced took the seat').toBe('bane')
    expect(SAID.join(' | ')).toContain(`${cs(flew)} and ${cs('bane')} swapped`)
    globalUndo()
    expect(people(), 'ONE Undo puts both back').toEqual(['bane'])
    expect(slotVal(seat)).toBe(flew)
  })
  it('where the row holds SEVERAL a person dropped on a puck joins — nobody is replaced (the plan\'s R1)', async () => {
    await boot(new MemoryBackend())
    file(['bane', 'pike'])
    setDrag({ kind: 'roster', id: 'split' })
    expect(applyDrop(seatEl(keyOf('pike')), 0, 0)).toBe(true)
    expect(people()).toEqual(['bane', 'pike', 'split'])
    expect(pendingLand()!.sel, 'the landing flash is on HIS place').toContain(`[data-slot="${keyOf('split')}"]`)
  })
})

describe('a puck taken off the row takes that person out of the input (D755)', () => {
  it('dragged to nowhere, right-clicked, written blank: he leaves; the others and the row stay', async () => {
    await boot(new MemoryBackend())
    file(['bane', 'pike', 'split'])
    const rid = rowOf().rid
    expect(rowTake(keyOf('pike'))).toBe('done')
    expect(people()).toEqual(['bane', 'split'])
    expect(rowOf().rid).toBe(rid)
    expect(SAID.join(' | ')).toContain(`${cs('pike')} taken out of ${TITLE}`)
    /* the first to join leaves: the next takes the name box */
    expect(rowTake(keyOf('bane'))).toBe('done')
    expect(onRow()).toEqual(['split'])
    globalUndo(); globalUndo()
    expect(people()).toEqual(['bane', 'pike', 'split'])
  })
  it('the LAST one is refused, saying how (D757) — from the door, the drop and the store\'s writer alike', async () => {
    await boot(new MemoryBackend())
    expect(commitNewInput(DRAFT())).toBe(true)
    const was = JSON.stringify(INPUTS)
    expect(rowTake(rowKey())).toBe('refused')
    expect(SAID.join(' ')).toContain(`${cs('bane')} is the last on this input — use ✕ to take it off the programme, or delete it in its own window`)
    setDrag({ kind: 'slot', key: rowKey() })
    expect(applyDrop(document.body, 0, 0)).toBe(false)
    writeSlot(rowKey(), '')
    expect(JSON.stringify(INPUTS)).toBe(was)
    expect(onRow()).toEqual(['bane'])
  })
  it('dragged onto a flying seat: OUT of the input and IN the seat, one step; refused whole where he is the last', async () => {
    await boot(new MemoryBackend())
    file(['bane', 'pike', 'split'])
    const seat = '2.0.0.0.p', flew = String(slotVal(seat))
    setDrag({ kind: 'slot', key: keyOf('pike') })
    expect(applyDrop(seatEl(seat), 0, 0)).toBe(true)
    expect(people()).toEqual(['bane', 'split'])
    expect(slotVal(seat)).toBe('pike')
    globalUndo()
    expect(people(), 'one Undo puts back both').toEqual(['bane', 'pike', 'split'])
    expect(slotVal(seat)).toBe(flew)
  })
})

describe('a person dragged from one input\'s row onto another\'s MOVES — he is never in both', () => {
  it('out of the first, into the second, ONE command; refused whole where he is the first\'s last or already in the second', async () => {
    await boot(new MemoryBackend())
    file(['bane', 'pike'])
    expect(commitInput(null, DRAFT(WED, { title: 'Second brief', sTime: '16:00', eTime: '17:00' }), ['rocky'])).toBe(true)
    const k2 = () => rowKey(WED, 'Second brief')
    expect(rowMove(keyOf('pike'), `${k2()}.+`)).toBe('done')
    expect(people()).toEqual(['bane'])
    expect(people(WED, 'Second brief')).toEqual(['rocky', 'pike'])
    globalUndo()
    expect(people(), 'ONE Undo').toEqual(['bane', 'pike'])
    expect(people(WED, 'Second brief')).toEqual(['rocky'])
    /* the last of the first: refused, he stays */
    expect(rowTake(keyOf('pike'))).toBe('done')
    expect(rowMove(keyOf('bane'), `${k2()}.+`)).toBe('refused')
    expect(people()).toEqual(['bane'])
    expect(people(WED, 'Second brief')).toEqual(['rocky'])
  })
})

describe('THE BELT in the engine, and the doors that reach the input (the plan\'s T8)', () => {
  it('a raw write to ANY place of an input\'s row is refused: nothing written, no mark', async () => {
    await boot(new MemoryBackend())
    file(['bane', 'pike'])
    const marks = JSON.stringify(SCHED.pending), rows = JSON.stringify(ground())
    expect(setSlotVal(keyOf('pike'), 'split'), 'another person into a place').toBe(false)
    expect(setSlotVal(keyOf('pike'), ''), 'a place emptied').toBe(false)
    expect(setSlotVal(rowKey(), 'split'), 'the name box').toBe(false)
    expect(fillSlot(`${rowKey()}.+`, 'split'), 'a person on "+ add"').toBe(false)
    expect(fillSlot(`${rowKey()}.+`, 'allavail'), 'a placeholder on "+ add"').toBe(false)
    expect(JSON.stringify(ground())).toBe(rows)
    expect(JSON.stringify(SCHED.pending)).toBe(marks)
  })
  it('the store\'s own writers go through the door: written to "+ add" he JOINS; a place emptied takes that person out', async () => {
    await boot(new MemoryBackend())
    file(['bane', 'pike'])
    writeFill(`${rowKey()}.+`, 'split')
    expect(people()).toEqual(['bane', 'pike', 'split'])
    writeSlot(keyOf('pike'), '')
    expect(people()).toEqual(['bane', 'split'])
  })
  it('an armed "+ add" filled by a tap adds him; someone already in it is refused and the place stays armed', async () => {
    await boot(new MemoryBackend())
    file(['bane', 'pike'])
    view.armSlot(`${rowKey()}.+`)
    expect(view.placeArmed('split')).toBe(true)
    expect(people()).toEqual(['bane', 'pike', 'split'])
    view.armSlot(`${rowKey()}.+`)
    expect(view.placeArmed('pike')).toBe(false)
    expect(view.armedKey()).toBe(`${rowKey()}.+`)
    view.disarmSlot()
  })
  it('a row nobody filed is written as any ground row is — the door answers "none"', async () => {
    await boot(new MemoryBackend())
    ;(DAYS[WED] as any).ground.push({ prog: 'SQN PT', str: '07:00', end: '08:00', who: '', rmks: '' })
    const k = `g:${WED}.${ground().length - 1}`
    expect(onInputRow(k)).toBe(false)
    expect(rowPut(k, 'pike')).toBe('none')
    expect(setSlotVal(k, 'pike')).toBe(true)
    expect(fillSlot(`${k}.+`, 'allavail')).toBe(true)
    expect([ground()[ground().length - 1].who, ground()[ground().length - 1].more]).toEqual(['pike', ['allavail']])
  })
  it('ALL AVAIL on an input\'s row is refused with the input\'s own sentence until it may be one of the people (step 3)', async () => {
    await boot(new MemoryBackend())
    file(['bane', 'pike'])
    const was = JSON.stringify(INPUTS)
    setDrag({ kind: 'roster', id: 'allavail' })
    expect(applyDrop(cellEl(`${rowKey()}.+`), 0, 0)).toBe(false)
    expect(JSON.stringify(INPUTS)).toBe(was)
    expect(SAID.join(' ')).toMatch(/filed on its own/i)
  })
})

describe('a box typed on the row changes the input — one record, for everyone in it (D739, D740)', () => {
  it('a time typed: the one record moves, everyone on it with it, and nobody reads late', async () => {
    await boot(new MemoryBackend())
    file(['bane', 'pike', 'split'])
    expect(setInpField(rec(), 'str', '13:00')).toBe(true)
    expect(rec().s).toBe(780)
    expect(people()).toEqual(['bane', 'pike', 'split'])
    expect(rowOf().str).toBe('13:00')
    expect(isLateInput(rec())).toBe(false)
  })
})
