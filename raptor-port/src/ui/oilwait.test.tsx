// @vitest-environment jsdom
/* THE OIL QUESTION FIRST, THE WRITE ONLY ON AN ANSWER ([OIL-ASK-NOTIFY] step 1 — the plan
   docs/superpowers/plans/2026-10-12-oil-ask-notify-plan.md §3.1). His rulings:
   D780 — "When a swap is made, maybe u shouldn't allow the person to cancel the oil question until answered?";
   D781 — a swap's or an add's OIL question cannot be left open;
   D783 — "Yes to all": a swap or an add that raises the question is NOT MADE until it is answered — nothing moves; not
          answered, both pucks flash and a bar stays until tapped ("Not swapped — OIL not answered" · Answer OIL · OK);
          a person ADDED with no answer yet is treated the same ("Not added — …"); a MOVE from one input's row to
          another's waits the same way; nobody else is told.
   Until this step the door (ui/reqdoor.ts) made the change and THEN opened the question over the input's window, and a
   Cancel left the change made with nobody having answered (ui/reqdoor.test.tsx pinned that: "the question opens at
   once"). Driven here through the door, the drop (ui/drag.ts applyDrop on a stand-in element), the armed tap and the
   store's writers, on a real saved store — the harness of ui/reqdoor.test.tsx. The real drag, the sheet and the bar on
   screen are walked in the browser (e2e/oilwait.spec.ts). */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { INPUTS, inpId, idsOf } from '../engine/inputs'
import { PEOPLE, ID_BY_CS, indexCallsigns } from '../engine/people'
import { DAYS } from '../engine/data'
import { CURWEEK } from '../engine/waves'
import { storeBackend, HOOKS } from '../engine/hooks'
import { stashClear } from '../engine/weekstash'
import { SCHED, signOf, dayPendingItems } from '../engine/publish'
import { ELOG } from '../engine/editlog'
import { slotVal } from '../engine/slots'
import { PLANPUCKS, DAYRMK } from '../state/plan'
import { NOTICES } from '../state/notices'
import { initStore, weekStashSnap, weekDirty, loadWeek, writeFill, resetSession } from '../state/store'
import { setSession, setMe, DEFAULT_ME } from '../state/auth'
import { hydrate, wirePersist } from '../state/persist'
import { bootStorage } from '../storage/boot'
import { settingsAdapter } from '../storage/adapters'
import { MemoryBackend } from '../storage/memory'
import { SCHEMA_VERSION } from '../storage/reset'
import { globalUndo, undoState } from '../undo'
import { _resetTimeline } from '../undo/timeline'
import { installGlobalUndo } from '../state/undo-wire'
import { _resetDisclosure } from '../state/disclosure'
import { commitSetDayApproved, schedWrite, SCHED_TYPES } from '../state/sched-commit'
import { setPage, setBoardDay } from '../state/view'
import * as view from '../state/view'
import { commitInput, draftOf } from './inputedit'
import { rowPut, rowMove } from './reqdoor'
import * as pops from './pops'
import { applyDrop, setDrag } from './drag'
import { answerOilWait, leaveOilWait, oilBarAgain, oilBarOk, WAIT_WORDS } from './oilwait'

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
  NOTICES.length = 0
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  SCHED.pending = {}; SCHED.changes = {}; SCHED.added = {}; SCHED.als = []
  SCHED.al = 0; SCHED.dayOK = {}; SCHED.sign = {}; SCHED.orig = {}; SCHED.cur = {}
  SCHED.signBind = {}; SCHED.drafts = {}; SCHED.curDraft = {}; SCHED.retired = {}; SCHED.correcting = {}
  view.WARNOFF.clear(); view.disarmSlot()
  view.setOilWait(null); view.setOilBar(null)
  pops.setInpEdit(null); pops.setOilAsk(null)
  stashClear()
}
async function boot(be = new MemoryBackend()) {
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
  setPage('editsched'); setBoardDay(SAT)
  return wb
}

const cs = (p: string) => String((PEOPLE as any)[p].cs)
const TITLE = 'Range safety brief', SECOND = 'Hangar open day'
const dateOf = (di: number) => (di === SAT ? 'Jul 18' : 'Jul 15')
const rec = (di = SAT, title = TITLE) => { const l = INPUTS.filter((x: any) => x.title === title && x.date === dateOf(di)) as any[]; expect(l, 'ONE record').toHaveLength(1); return l[0] }
const people = (di = SAT, title = TITLE) => idsOf(rec(di, title)).map(String)
const ground = (di = SAT) => ((DAYS[di] as any).ground || []) as any[]
const riOf = (di = SAT, title = TITLE) => ground(di).findIndex((g: any) => g && g.src === String(inpId(rec(di, title))))
const rowKey = (di = SAT, title = TITLE) => `g:${di}.${riOf(di, title)}`
const keyOf = (p: string, di = SAT, title = TITLE) => { const r = ground(di)[riOf(di, title)], k = rowKey(di, title); if (r.who === p) return k; const n = (r.more || []).indexOf(p); expect(n, `${p} is on the row`).toBeGreaterThanOrEqual(0); return `${k}.x${n}` }
const DRAFT = (di = SAT, over: any = {}) => ({ ...draftOf({ person: 'bane', type: 'Duty', title: TITLE, date: dateOf(di), yr: 2026, allday: false, s: 840, e: 900, remarks: '' }), ...over })
/* filed straight through the save — with its answer, or with none: the state a day made a holiday afterwards leaves */
const file = (ppl: string[], di = SAT, oil?: Record<string, number>, over: any = {}) => expect(commitInput(null, DRAFT(di, over), ppl, oil ? { oil } : undefined)).toBe(true)
const seatEl = (key: string) => { const el = document.createElement('span'); el.className = 'seat'; el.dataset.slot = key; document.body.appendChild(el); return el }
/* a seat that is not a row of an input: a plain programme row of Saturday with Scope on it — written through the
   schedule's own command, so it is a committed part of the day before the drop */
const dutySeat = (): { key: string; who: string } => {
  schedWrite(SCHED_TYPES.mutate, () => { (DAYS[SAT] as any).ground.push({ prog: 'SQN PT', str: '07:00', end: '08:00', who: 'split', rmks: '' }) })
  const ri = ground().findIndex((g: any) => g && g.prog === 'SQN PT')
  expect(ri, 'the plain row').toBeGreaterThanOrEqual(0)
  return { key: `g:${SAT}.${ri}`, who: 'split' }
}
/* everything a change would move, as one string: the inputs, the day, the change history, the bell, the Undo step */
const world = () => JSON.stringify([INPUTS, DAYS[SAT], DAYS[WED], ELOG.rows.length, NOTICES.length, undoState().undoLabel || '', SCHED.pending])
const sign = (di: number) => { const g = signOf(di); g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump' }

beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(new Date(2026, 5, 1, 9, 0, 0)); resetWorld(); SAID = []; HOOKS.toast = (m: any) => { SAID.push(String(m)) } })
afterEach(() => { HOOKS.toast = toast; _resetTimeline(); vi.useRealTimers(); resetWorld(); setSession(null); setMe(DEFAULT_ME); storeBackend.impl = null; document.body.innerHTML = ''; setDrag(null) })

describe('a swap that raises the OIL question is NOT MADE until it is answered (D783 (1)) (ON1)', () => {
  it('dragged from a seat onto the only person\'s puck: nothing moves, the question waits with the swap\'s own words — and no window of the input opens', async () => {
    await boot()
    file(['bane'], SAT, { [SAT_ISO]: 0.5 })
    const { key: seat, who } = dutySeat()
    const was = world()
    setDrag({ kind: 'slot', key: seat })
    expect(applyDrop(seatEl(rowKey()), 0, 0), 'the drop made nothing').toBe(false)
    expect(world(), 'NOTHING moved: the inputs, the day, the history, the bell, Undo').toBe(was)
    expect(people()).toEqual(['bane']); expect(slotVal(seat)).toBe(who)
    const w = view.OILWAIT!
    expect(w, 'the question waits').toBeTruthy()
    expect(w.kind).toBe('swap')
    expect(w.lead).toBe(`Swapping ${cs(who)} and ${cs('bane')}`)
    expect(w.gate.plan).toEqual([{ iso: SAT_ISO, amt: 0.5 }])
    expect(w.gate.who, 'asked of the man who would hold it').toBe(cs(who))
    expect(pops.INPEDIT, 'no window of the input behind it').toBeNull()
    expect(pops.OILASK).toBeNull()
    expect(SAID, 'and nothing is said yet').toEqual([])
  })
  it('(ON2) answered: the swap AND the answer are ONE step — one Undo puts both men back, and the first man\'s answer with them', async () => {
    await boot()
    file(['bane'], SAT, { [SAT_ISO]: 0.5 })
    const { key: seat, who } = dutySeat()
    setDrag({ kind: 'slot', key: seat })
    applyDrop(seatEl(rowKey()), 0, 0)
    expect(answerOilWait({ [SAT_ISO]: 0 })).toBe(true)
    expect(view.OILWAIT).toBeNull(); expect(view.OILBAR).toBeNull()
    expect(people()).toEqual([who])
    expect(slotVal(seat), 'the man replaced took the seat').toBe('bane')
    expect(rec().oil, 'the answer given with the swap — a No is an answer').toEqual({ [SAT_ISO]: 0 })
    expect(rec().by, 'by Saber now').toBe('stiff')
    expect(SAID.join(' | ')).toContain(`${cs(who)} and ${cs('bane')} swapped`)
    globalUndo()
    expect(people(), 'ONE Undo').toEqual(['bane'])
    expect(slotVal(seat)).toBe(who)
    expect(rec().oil, 'and his own answer is back').toEqual({ [SAT_ISO]: 0.5 })
  })
  it('a man from the crew list put on the only person\'s puck waits the same way, in the swap\'s words', async () => {
    await boot()
    file(['bane'], SAT, { [SAT_ISO]: 0.5 })
    const was = world()
    expect(rowPut(rowKey(), 'pike')).toBe('asked')
    expect(world()).toBe(was)
    expect(view.OILWAIT!.kind).toBe('swap')
    expect(view.OILWAIT!.lead).toBe(`Putting ${cs('pike')} in place of ${cs('bane')}`)
    expect(answerOilWait({ [SAT_ISO]: 0.5 })).toBe(true)
    expect(people()).toEqual(['pike'])
    expect(rec().oil).toEqual({ [SAT_ISO]: 0.5 })
    globalUndo()
    expect(people(), 'ONE Undo').toEqual(['bane'])
  })
  it('(ON5) on a working day nothing asks: the swap is made at once, as before', async () => {
    await boot()
    file(['bane'], WED, undefined, { type: 'Meeting' })
    expect(rowPut(rowKey(WED), 'pike')).toBe('done')
    expect(people(WED)).toEqual(['pike'])
    expect(view.OILWAIT).toBeNull()
  })
})

describe('a person ADDED where the input has no answer yet waits the same way (D783 (3)) (ON3)', () => {
  it('on "+ add" of an unanswered input: not added; answered, he is in it and the input has its one answer — one Undo', async () => {
    await boot()
    file(['bane', 'pike'], SAT)
    const was = world()
    expect(rowPut(`${rowKey()}.+`, 'split')).toBe('asked')
    expect(world()).toBe(was)
    expect(view.OILWAIT!.kind).toBe('add')
    expect(view.OILWAIT!.lead).toBe(`Adding ${cs('split')} to ${TITLE}`)
    expect(answerOilWait({ [SAT_ISO]: 0.5 })).toBe(true)
    expect(people()).toEqual(['bane', 'pike', 'split'])
    expect(rec().oil).toEqual({ [SAT_ISO]: 0.5 })
    expect(SAID.join(' | ')).toContain(`${cs('split')} added to ${TITLE}`)
    globalUndo()
    expect(people(), 'ONE Undo').toEqual(['bane', 'pike'])
    expect(rec().oil, 'and it is unanswered again').toBeUndefined()
  })
  it('where the input IS answered — Yes or No — he is added at once, as before (a No says "not counted")', async () => {
    await boot()
    file(['bane', 'pike'], SAT, { [SAT_ISO]: 0 })
    expect(rowPut(`${rowKey()}.+`, 'split')).toBe('done')
    expect(people()).toEqual(['bane', 'pike', 'split'])
    expect(view.OILWAIT).toBeNull()
    expect(SAID.join(' | ')).toContain('not counted for OIL')
  })
  it('(ON5) the armed tap and the store\'s own writer reach the same wait: nothing written, the place stays armed', async () => {
    await boot()
    file(['bane', 'pike'], SAT)
    const was = world()
    view.armSlot(`${rowKey()}.+`)
    expect(view.placeArmed('split')).toBe(false)
    expect(world()).toBe(was)
    expect(view.armedKey(), 'still armed').toBe(`${rowKey()}.+`)
    expect(view.OILWAIT!.kind).toBe('add')
    expect(answerOilWait({ [SAT_ISO]: 0.5 })).toBe(true)
    expect(people()).toEqual(['bane', 'pike', 'split'])
    expect(view.armedKey(), 'the arm is put down once he is in').toBeFalsy()
    globalUndo(); view.setOilWait(null)
    writeFill(`${rowKey()}.+`, 'split')
    expect(people(), 'the writer wrote nothing').toEqual(['bane', 'pike'])
    expect(view.OILWAIT!.kind).toBe('add')
  })
})

describe('a MOVE from one input\'s row to another\'s waits on the second input\'s question (D783, reading) (ON4)', () => {
  it('nothing moves; answered, he is out of the first and in the second with its answer — one Undo', async () => {
    await boot()
    file(['bane', 'pike'], SAT, { [SAT_ISO]: 0.5 })
    expect(commitInput(null, DRAFT(SAT, { title: SECOND, sTime: '16:00', eTime: '17:00' }), ['rocky'])).toBe(true)
    const was = world()
    expect(rowMove(keyOf('pike'), `${rowKey(SAT, SECOND)}.+`)).toBe('asked')
    expect(world()).toBe(was)
    expect(view.OILWAIT!.kind).toBe('move')
    expect(view.OILWAIT!.lead).toBe(`Moving ${cs('pike')} to ${SECOND}`)
    expect(answerOilWait({ [SAT_ISO]: 0.5 })).toBe(true)
    expect(people()).toEqual(['bane'])
    expect(people(SAT, SECOND)).toEqual(['rocky', 'pike'])
    expect(rec(SAT, SECOND).oil).toEqual({ [SAT_ISO]: 0.5 })
    globalUndo()
    expect(people(), 'ONE Undo').toEqual(['bane', 'pike'])
    expect(people(SAT, SECOND)).toEqual(['rocky'])
    expect(rec(SAT, SECOND).oil).toBeUndefined()
  })
})

describe('NOT ANSWERED: nothing is made, and a bar stays that says so (D783 (2), (4)) (ON6)', () => {
  it('the words of each kind', () => {
    expect(WAIT_WORDS.swap).toEqual({ no: 'Don’t swap', yes: 'Swap', not: 'Not swapped — OIL not answered' })
    expect(WAIT_WORDS.add).toEqual({ no: 'Don’t add', yes: 'Add', not: 'Not added — OIL not answered' })
    expect(WAIT_WORDS.move).toEqual({ no: 'Don’t move', yes: 'Move', not: 'Not moved — OIL not answered' })
  })
  it('left unanswered: nothing changed, nobody told; the bar says it; "Answer OIL" brings the question back; "OK" only closes', async () => {
    await boot()
    file(['bane'], SAT, { [SAT_ISO]: 0.5 })
    const was = world()
    expect(rowPut(rowKey(), 'pike')).toBe('asked')
    leaveOilWait()
    expect(world(), 'nothing made, nobody told').toBe(was)
    expect(view.OILWAIT).toBeNull()
    expect(view.OILBAR!.text).toBe('Not swapped — OIL not answered')
    oilBarAgain()
    expect(view.OILBAR, 'the bar goes while the question is up').toBeNull()
    expect(view.OILWAIT!.kind).toBe('swap')
    leaveOilWait()
    expect(view.OILBAR!.text).toBe('Not swapped — OIL not answered')
    oilBarOk()
    expect(view.OILBAR).toBeNull(); expect(view.OILWAIT).toBeNull()
    expect(world()).toBe(was)
  })
  it('(ON7) "Answer OIL" after the row changed underneath says so and asks nothing', async () => {
    await boot()
    file(['bane', 'pike'], SAT)
    expect(rowPut(`${rowKey()}.+`, 'split')).toBe('asked')
    leaveOilWait()
    /* someone else is put in his place meanwhile: the input is answered and he is already on it */
    expect(commitInput(rec(), draftOf(rec()), ['bane', 'pike', 'split'], { oil: { [SAT_ISO]: 0 } })).toBe(true)
    SAID = []
    oilBarAgain()
    expect(view.OILWAIT, 'no stale question').toBeNull()
    expect(view.OILBAR).toBeNull()
    expect(SAID.join(' | ')).toContain(`${cs('split')} is already on this input`)
  })
  it('(ON7) the waiting question and the bar end with the week, the page and the sign-in', async () => {
    await boot()
    file(['bane'], SAT, { [SAT_ISO]: 0.5 })
    for (const end of [() => loadWeek('20/07/2026'), () => setPage('inputs'), () => resetSession({ user: 'ad', role: 'admin', name: 'ad' })]) {
      if (CURWEEK !== W1) loadWeek(W1)
      setPage('editsched'); setMe('stiff')
      expect(rowPut(rowKey(), 'pike')).toBe('asked')
      end()
      expect(view.OILWAIT, 'the question').toBeNull()
      if (CURWEEK !== W1) loadWeek(W1)
      setPage('editsched'); setMe('stiff')
      expect(rowPut(rowKey(), 'pike')).toBe('asked'); leaveOilWait()
      expect(view.OILBAR).toBeTruthy()
      end()
      expect(view.OILBAR, 'the bar').toBeNull()
    }
  })
})

describe('on a PUBLISHED day nothing waits to go out, and no sign-off falls, until the answer is given (D103) (ON8)', () => {
  it('asked: 0 pending, the four sign-offs stand; answered: the change waits and they fall', async () => {
    await boot()
    file(['bane'], SAT, { [SAT_ISO]: 0.5 })
    sign(SAT); commitSetDayApproved(SAT, true)
    expect(dayPendingItems(SAT)).toHaveLength(0)
    const signed = JSON.stringify(signOf(SAT))
    expect(rowPut(rowKey(), 'pike')).toBe('asked')
    expect(dayPendingItems(SAT), 'nothing waiting').toHaveLength(0)
    expect(JSON.stringify(signOf(SAT)), 'the sign-offs stand').toBe(signed)
    leaveOilWait()
    expect(dayPendingItems(SAT)).toHaveLength(0)
    expect(JSON.stringify(signOf(SAT))).toBe(signed)
    oilBarAgain()
    expect(answerOilWait({ [SAT_ISO]: 0.5 })).toBe(true)
    expect(dayPendingItems(SAT).length, 'now it waits to go out').toBeGreaterThan(0)
  })
})

describe('ON SCREEN — the question\'s own sheet with the waiting change\'s words, and the bar that stays (the pictures of record, docs/mock/2026-10-12-oil-notify/)', () => {
  it('the sheet: what is waiting, "Don’t swap" / "Swap" with Swap greyed until an answer is picked, no window of the input behind it; left: the bar, its two buttons', async () => {
    await boot()
    file(['bane'], SAT, { [SAT_ISO]: 0.5 })
    ;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true
    const host = document.createElement('div')
    document.body.appendChild(host)
    const root = createRoot(host)
    const $ = (sel: string) => document.querySelector(sel) as HTMLElement | null
    const tid = (t: string) => $(`[data-testid="${t}"]`)
    const click = async (el: HTMLElement | null) => { expect(el, 'the control is drawn').toBeTruthy(); await act(async () => { el!.click() }) }
    try {
      await act(async () => { root.render(<App />) })
      expect(tid('oilconf'), 'no question to start with').toBeNull()
      await act(async () => { expect(rowPut(rowKey(), 'pike')).toBe('asked') })
      const sheet = tid('oilconf')!
      expect(sheet, 'the question is up').toBeTruthy()
      expect(sheet.querySelector('.airpop-head b')!.textContent).toBe(`OIL — ${cs('pike')}, ${TITLE}`)
      expect(tid('oilconf-lead')!.textContent, 'a statement of what is waiting').toBe(`Putting ${cs('pike')} in place of ${cs('bane')}`)
      expect(tid('oilconf-cancel')!.textContent).toBe('Don’t swap')
      expect(tid('oilconf-save')!.textContent).toBe('Swap')
      expect((tid('oilconf-save') as HTMLButtonElement).disabled, 'greyed until an answer is picked').toBe(true)
      expect(pops.INPEDIT, 'no window of the input stands behind it').toBeNull()
      expect($('#inpEditPop:not([hidden])')).toBeNull()
      expect(tid('oilbar')).toBeNull()
      /* left unanswered: the bar */
      await click(tid('oilconf-cancel'))
      expect(tid('oilconf')).toBeNull()
      expect(tid('oilbar-text')!.textContent).toBe('Not swapped — OIL not answered')
      expect(tid('oilbar-answer')!.textContent).toBe('Answer OIL')
      expect(tid('oilbar-ok')!.textContent).toBe('OK')
      expect(people(), 'nothing was made').toEqual(['bane'])
      /* it stays: no timer takes it away */
      await act(async () => { await vi.advanceTimersByTimeAsync(60_000) })
      expect(tid('oilbar'), 'still there a minute later').toBeTruthy()
      /* Answer OIL: the question again, the bar gone while it is up; Escape leaves it again */
      await click(tid('oilbar-answer'))
      expect(tid('oilconf')).toBeTruthy(); expect(tid('oilbar')).toBeNull()
      await act(async () => { document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })) })
      expect(tid('oilconf')).toBeNull(); expect(tid('oilbar')).toBeTruthy()
      /* …and answered this time: Yes, then Swap */
      await click(tid('oilbar-answer'))
      await click(tid('oil-yes'))
      expect((tid('oilconf-save') as HTMLButtonElement).disabled).toBe(false)
      await click(tid('oilconf-save'))
      expect(tid('oilconf')).toBeNull(); expect(tid('oilbar')).toBeNull()
      expect(people()).toEqual(['pike'])
      expect(rec().oil).toEqual({ [SAT_ISO]: 0.5 })
      /* OK only closes */
      await act(async () => { globalUndo() })
      await act(async () => { expect(rowPut(rowKey(), 'pike')).toBe('asked') })
      await click(tid('oilconf-cancel'))
      await click(tid('oilbar-ok'))
      expect(tid('oilbar')).toBeNull(); expect(tid('oilconf')).toBeNull()
      expect(people()).toEqual(['bane'])
    } finally { await act(async () => { root.unmount() }) }
  })
})
