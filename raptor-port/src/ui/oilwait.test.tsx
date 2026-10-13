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
import * as slots from '../engine/slots'
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
import { commitInput, commitInputEdit, draftOf, inputWho } from './inputedit'
import { rowPut, rowMove, rowMark } from './reqdoor'
import * as pops from './pops'
import { applyDrop, setDrag } from './drag'
import { answerOilWait, leaveOilWait, oilBarAgain, oilBarOk, WAIT_WORDS } from './oilwait'
import { markLand, pendingLand } from './lift'
import { commitChipMove } from './caldrag'
import { reassignInput } from './inputedit'
import { routeClick } from './interactions'
import { toast as realToast } from './toast'
import { WARN } from '../engine/validate'
import { warnKey } from '../state/dropflag'

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
      expect(sheet.querySelector('.airpop-head b')!.textContent).toBe(`OIL: ${cs('pike')}, ${TITLE}`)
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

/* THE WIRES THE BREAK TESTS FOUND BARE (the check, 13 Oct 26 — scripts/handpass/on-breaks.mjs: each of these was broken
   once on purpose and no test went red). One case a wire, named for what a person would see go wrong. */
describe('the wires the break tests found bare', () => {
  const fillEl = (key: string) => { const el = document.createElement('div'); el.dataset.fill = key; document.body.appendChild(el); return el }
  const second = () => expect(commitInput(null, DRAFT(SAT, { title: SECOND, sTime: '16:00', eTime: '17:00' }), ['rocky'])).toBe(true)

  it('a change the save itself would refuse is refused in its own words — nobody is asked a question for it first (Fable A2)', async () => {
    await boot()
    file(['bane', 'allavail'], SAT)                    // no answer yet — and it already holds ALL AVAIL
    const was = world()
    expect(rowPut(`${rowKey()}.+`, 'all'), 'ALL beside ALL AVAIL: the save refuses it').toBe('refused')
    expect(view.OILWAIT, 'no question was put for it').toBeNull()
    expect(view.OILBAR).toBeNull()
    expect(world(), 'and nothing was kept of the try').toBe(was)
    expect(SAID.length, 'it said why').toBeGreaterThan(0)
  })
  it('"Answer OIL" after ANOTHER man took the puck: "That row has changed — not swapped", no question for the wrong man, nothing written (Fable A5)', async () => {
    await boot()
    file(['bane'], SAT, { [SAT_ISO]: 0.5 })
    expect(rowPut(rowKey(), 'pike')).toBe('asked')
    leaveOilWait()
    /* meanwhile the input is handed to someone else in its own window */
    expect(commitInput(rec(), draftOf(rec()), ['split'], { oil: { [SAT_ISO]: 1 } })).toBe(true)
    SAID = []
    oilBarAgain()
    expect(view.OILWAIT, 'no question about a swap with a man who was never asked about').toBeNull()
    expect(view.OILBAR).toBeNull()
    expect(SAID.join(' | ')).toContain('That row has changed — not swapped')
    expect(people(), 'and he is untouched').toEqual(['split'])
  })
  it('"Answer OIL" after the man dragged has left the seat he came from: the swap is not offered again — another man sits there now', async () => {
    await boot()
    file(['bane'], SAT, { [SAT_ISO]: 0.5 })
    const { key: seat } = dutySeat()
    setDrag({ kind: 'slot', key: seat })
    expect(applyDrop(seatEl(rowKey()), 0, 0)).toBe(false)
    leaveOilWait()
    const ri = +seat.split('.')[1]!
    schedWrite(SCHED_TYPES.mutate, () => { ground()[ri].who = 'rocky' })
    SAID = []
    oilBarAgain()
    expect(view.OILWAIT, 'no question: the man who sits there now was never part of it').toBeNull()
    expect(SAID.join(' | ')).toContain('That row has changed — not swapped')
    expect(people()).toEqual(['bane']); expect(slotVal(seat)).toBe('rocky')
  })
  it('not answered: BOTH pucks flash where they stand — the one dropped on, and the one he was dragged from (D783 (2))', async () => {
    await boot()
    file(['bane'], SAT, { [SAT_ISO]: 0.5 })
    const { key: seat } = dutySeat()
    const target = seatEl(rowKey()), source = seatEl(seat)
    setDrag({ kind: 'slot', key: seat })
    applyDrop(target, 0, 0)
    expect(target.classList.contains('lift-land'), 'nothing flashes while the question is up').toBe(false)
    leaveOilWait()
    expect(target.classList.contains('lift-land'), 'the puck dropped on').toBe(true)
    expect(source.classList.contains('lift-land'), 'the puck that was dragged').toBe(true)
  })
  it('answered: the landing flash the drag would have made is made then, on where he stands', async () => {
    await boot()
    file(['bane'], SAT, { [SAT_ISO]: 0.5 })
    const { key: seat } = dutySeat()
    markLand('')
    setDrag({ kind: 'slot', key: seat })
    applyDrop(seatEl(rowKey()), 0, 0)
    expect(pendingLand(), 'no landing while it waits').toBeNull()
    expect(answerOilWait({ [SAT_ISO]: 0.5 })).toBe(true)
    expect(pendingLand()?.sel, 'the flash is his, on the row').toContain(`[data-slot="${rowKey()}"]`)
    markLand('')
  })
  it('a puck dragged from one input\'s row onto the ONLY man\'s puck of another: it waits as a MOVE — never as a swap, nothing written', async () => {
    await boot()
    file(['bane', 'pike'], SAT, { [SAT_ISO]: 0.5 }); second()
    const was = world()
    setDrag({ kind: 'slot', key: keyOf('pike') })
    expect(applyDrop(seatEl(rowKey(SAT, SECOND)), 0, 0)).toBe(false)
    expect(world()).toBe(was)
    expect(view.OILWAIT!.kind).toBe('move')
    expect(view.OILWAIT!.lead).toBe(`Moving ${cs('pike')} to ${SECOND}`)
    expect(SAID, 'and nothing is said').toEqual([])
  })
  it('the same onto the second row\'s "+ add": a MOVE that waits — not an add', async () => {
    await boot()
    file(['bane', 'pike'], SAT, { [SAT_ISO]: 0.5 }); second()
    const was = world()
    setDrag({ kind: 'slot', key: keyOf('pike') })
    expect(applyDrop(fillEl(`${rowKey(SAT, SECOND)}.+`), 0, 0)).toBe(false)
    expect(world()).toBe(was)
    expect(view.OILWAIT!.kind).toBe('move')
    expect(SAID).toEqual([])
  })
  it('a man dragged from the crew list onto "+ add" of an unanswered input: the drop ends there — nothing written, no Undo step, nothing said', async () => {
    await boot()
    file(['bane', 'pike'], SAT)
    const was = world()
    setDrag({ kind: 'roster', id: 'split' })
    expect(applyDrop(fillEl(`${rowKey()}.+`), 0, 0)).toBe(false)
    expect(world()).toBe(was)
    expect(view.OILWAIT!.kind).toBe('add')
    expect(SAID).toEqual([])
    /* …and ALL AVAIL the same way (the roll-call's R8): it joins — on an answer */
    view.setOilWait(null)
    setDrag({ kind: 'roster', id: 'allavail' })
    expect(applyDrop(fillEl(`${rowKey()}.+`), 0, 0)).toBe(false)
    expect(world()).toBe(was)
    expect(view.OILWAIT!.lead).toBe(`Adding ${cs('allavail')} to ${TITLE}`)
    expect(answerOilWait({ [SAT_ISO]: 0.5 })).toBe(true)
    expect(people()).toEqual(['bane', 'pike', 'allavail'])
  })
  /* THE WALK'S C2 (13 Oct 26): on the Unavailable row the man dragged from a SEAT kept his seat's puck unlit when the
     question was left — only the row's man flashed. "Both pucks flash" (D783 (2)) is the rule at every door. */
  it('the Unavailable row, dragged onto from a seat: left unanswered, the puck he was dragged from flashes too', async () => {
    await boot()
    expect(commitInput(null, draftOf({ person: 'bane', type: 'OD', date: 'Jul 18', yr: 2026, allday: true, remarks: '' }), ['bane'], { oil: { [SAT_ISO]: 1 } })).toBe(true)
    const od = INPUTS.find((x: any) => x.type === 'OD' && x.date === 'Jul 18' && idsOf(x).map(String).join() === 'bane') as any
    expect(od, 'the overseas duty').toBeTruthy()
    const { key: seat } = dutySeat()
    const row = document.createElement('span'); row.className = 'seat'; row.dataset.inpseat = String(od.iid); document.body.appendChild(row)
    const source = seatEl(seat)
    setDrag({ kind: 'slot', key: seat })
    applyDrop(row, 0, 0)
    expect(view.OILWAIT && view.OILWAIT.kind, 'the question first').toBe('swap')
    leaveOilWait()
    expect(row.classList.contains('lift-land'), 'the man on the row').toBe(true)
    expect(source.classList.contains('lift-land'), 'and the puck that was dragged').toBe(true)
  })

  /* ---- the Unavailable row and the Inputs calendar (ON9) ---- */
  const od = (ppl: string[], oil?: Record<string, number>): string => {
    expect(commitInput(null, draftOf({ person: ppl[0], type: 'OD', date: 'Jul 18', yr: 2026, allday: true, remarks: '' }), ppl, oil ? { oil } : undefined)).toBe(true)
    const r = INPUTS.find((x: any) => x.type === 'OD' && x.date === 'Jul 18' && idsOf(x).map(String).join() === ppl.join()) as any
    expect(r, 'the overseas duty').toBeTruthy()
    return String(r.iid)
  }
  const live = (iid: string) => INPUTS.find((x: any) => String(x.iid) === iid) as any
  it('one man of an overseas duty filed for several, with no answer yet: the swap waits; answered, he is in it WITH the answer — one Undo', async () => {
    await boot()
    const iid = od(['bane', 'pike'])
    const was = world()
    expect(reassignInput(`${iid}~bane`, 'split'), 'nothing handed over yet').toBe(false)
    expect(world()).toBe(was)
    expect(view.OILWAIT!.kind).toBe('swap')
    expect(view.OILWAIT!.lead).toBe(`Putting ${cs('split')} in place of ${cs('bane')}`)
    expect(answerOilWait({ [SAT_ISO]: 1 })).toBe(true)
    expect(idsOf(live(iid)).map(String).sort()).toEqual(['pike', 'split'])
    expect(live(iid).oil, 'the input\'s one answer, given with the swap').toEqual({ [SAT_ISO]: 1 })
    globalUndo()
    expect(idsOf(live(iid)).map(String).sort(), 'ONE Undo').toEqual(['bane', 'pike'])
    expect(live(iid).oil, 'and it is unanswered again').toBeUndefined()
  })
  it('"Answer OIL" after the overseas duty was handed to someone else meanwhile: it says so, and hands nothing over', async () => {
    await boot()
    const iid = od(['bane'], { [SAT_ISO]: 1 })
    expect(reassignInput(iid, 'split')).toBe(false)
    leaveOilWait()
    expect(commitInput(live(iid), draftOf(live(iid)), ['pike'], { oil: { [SAT_ISO]: 1 } })).toBe(true)
    SAID = []
    oilBarAgain()
    expect(view.OILWAIT, 'no question about the man who holds it now').toBeNull()
    expect(SAID.join(' | ')).toContain('That row has changed — not swapped')
    expect(idsOf(live(iid)).map(String)).toEqual(['pike'])
  })
  it('the Inputs calendar: left unanswered the chip flashes where it stands; "Answer OIL" after the input changed meanwhile says so and moves nothing', async () => {
    await boot()
    file(['bane'], SAT, { [SAT_ISO]: 0.5 })
    const iid = String(rec().iid)
    const cal = document.createElement('div'); cal.id = 'inpCal'
    const chip = document.createElement('span'); chip.dataset.iid = iid; cal.appendChild(chip); document.body.appendChild(cal)
    expect(commitChipMove({ kind: 'input', iid }, SAT_ISO, '2026-07-19'), 'nothing moved yet').toBe(false)
    expect(view.OILWAIT!.kind).toBe('move')
    leaveOilWait()
    expect(view.OILBAR!.text).toBe('Not moved — OIL not answered')
    expect(chip.classList.contains('lift-land'), 'the chip flashes where it was').toBe(true)
    /* someone is added to it in its own window meanwhile: it is no longer what the question was asked about */
    expect(commitInput(live(iid), draftOf(live(iid)), ['bane', 'pike'], { oil: { [SAT_ISO]: 0.5 } })).toBe(true)
    SAID = []
    oilBarAgain()
    expect(view.OILWAIT).toBeNull()
    expect(SAID.join(' | ')).toContain('That has changed — not moved')
    expect(live(iid).date, 'not moved').toBe('Jul 18')
  })
  /* THE WALK (C3, A's and D's notes — 13 Oct 26): the passing note ("Input added") is drawn at the foot of the screen,
     where the bar stood — and the bar STAYS, so every note raised while it was up landed on its words and half its
     "Answer OIL" button; the note was then lifted above it. SINCE 14 OCT 26 THE BAR IS NOT AT THE FOOT AT ALL (owner
     D831, D840): it is a band in the top bar's own last line, so a note at the foot cannot land on it and keeps its
     own place whether the bar is up or not. */
  it('a passing note never lands on the bar: the bar is a band in the top bar, and the note keeps its place at the foot while it is up', async () => {
    await boot()
    file(['bane'], SAT, { [SAT_ISO]: 0.5 })
    ;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true
    const host = document.createElement('div'); document.body.appendChild(host)
    const root = createRoot(host)
    const note = () => document.getElementById('toastEl') as HTMLElement
    try {
      await act(async () => { root.render(<App />) })
      realToast('Input added', 'ok')
      expect(note().style.bottom, 'no bar: at the foot, as ever').toBe('26px')
      await act(async () => { expect(rowPut(rowKey(), 'pike')).toBe('asked') })
      await act(async () => { leaveOilWait() })
      const bar = document.querySelector('[data-testid="oilbar"]') as HTMLElement
      expect(bar, 'the bar is up').toBeTruthy()
      /* under the bar in front: the Scheduler Board's own while the board is open (it lies over the top bar), the top
         bar's otherwise — and only ever ONE of the two */
      expect(document.querySelectorAll('[data-testid="oilbar"]'), 'one bar').toHaveLength(1)
      const onBoard = !!bar.closest('.sb-top')
      expect(bar.className, 'a band').toBe(onBoard ? 'oilband' : 'oilband is-top')
      expect(bar.closest('.sb-top, .topbar'), 'inside a bar, never floating at the foot').toBeTruthy()
      expect(document.querySelector('.topbar')!.classList.contains('oil-waiting'), 'the top bar makes room for it only where it carries it').toBe(!onBoard)
      expect(document.querySelector('.secdef-snack.oilbar'), 'nothing of it is left at the foot').toBeNull()
      expect(note().style.bottom, 'the note already showing stays where it was').toBe('26px')
      realToast('Schedule updated', 'ok')
      expect(note().style.bottom, 'and one raised while the bar is up is at the foot too').toBe('26px')
      await act(async () => { oilBarOk() })
      expect(document.querySelector('.topbar')!.classList.contains('oil-waiting'), 'the bar gone, the room goes').toBe(false)
      realToast('Schedule updated', 'ok')
      expect(note().style.bottom, 'the bar gone: the foot again').toBe('26px')
    } finally { await act(async () => { root.unmount() }); const t = note(); if (t) t.remove() }
  })
})

/* THE TWO CODE READS OF THE FINISHED CODE (13 Oct 26 — Fable, and a fresh Opus reader beside it: D788, D789). Each claim
   was written here as a case of the RIGHT behaviour and run against the code as it stood; every one below was red. */
describe('the two code reads — each claim reproduced before it was believed', () => {
  const warns = () => (WARN.all as any[]).map(warnKey).sort().join(' || ')
  const od = (ppl: string[], oil?: Record<string, number>): string => {
    expect(commitInput(null, draftOf({ person: ppl[0], type: 'OD', date: 'Jul 18', yr: 2026, allday: true, remarks: '' }), ppl, oil ? { oil } : undefined)).toBe(true)
    const r = INPUTS.find((x: any) => x.type === 'OD' && x.date === 'Jul 18' && idsOf(x).map(String).join() === ppl.join()) as any
    expect(r, 'the overseas duty').toBeTruthy()
    return String(r.iid)
  }
  const inpSeat = (iid: string) => { const el = document.createElement('span'); el.className = 'seat'; el.dataset.inpseat = iid; document.body.appendChild(el); return el }
  afterEach(() => { view.setOilDay(null) })

  /* Opus F1. The door's save is TRIED and thrown away — and the rules run inside it, on the tried world; the rollback
     put the schedule back but not what the rules had found, so behind the question, and for as long as the bar stood,
     the day's warnings and the rings on the pucks were those of a change that was never made. */
  it('nothing moves — and the warnings say so: behind the question and after "Don’t swap" they are those of the day as it STANDS', async () => {
    await boot()
    const iid = od(['bane'], { [SAT_ISO]: 1 })
    const { who } = dutySeat()                         // a man at work on Saturday: handed the overseas duty he would be "away but tasked"
    const was = warns()
    expect(reassignInput(iid, who), 'the hand-over waits').toBe(false)
    expect(view.OILWAIT, 'on its question').toBeTruthy()
    expect(warns(), 'behind the question: the warnings of the day as it stands').toBe(was)
    leaveOilWait()
    expect(warns(), 'and after "Don’t swap"').toBe(was)
  })

  /* Opus F2. "Answer OIL" asks the door afresh — and the door worked the KIND of change out again from the row as it
     then stood: with a second man added meanwhile the waiting SWAP became an ADD, the input was answered, and he was
     added at once with no question, keeping his seat. */
  it('"Answer OIL" never makes a different change from the one that was waiting: a second man added meanwhile → "That row has changed — not swapped"', async () => {
    await boot()
    file(['bane'], SAT, { [SAT_ISO]: 0.5 })
    const { key: seat, who } = dutySeat()
    setDrag({ kind: 'slot', key: seat })
    expect(applyDrop(seatEl(rowKey()), 0, 0)).toBe(false)
    leaveOilWait()
    expect(commitInput(rec(), draftOf(rec()), ['bane', 'pike'], { oil: { [SAT_ISO]: 0.5 } }), 'someone is added in its own window').toBe(true)
    SAID = []
    oilBarAgain()
    expect(people(), 'the man who was to swap is NOT added').toEqual(['bane', 'pike'])
    expect(slotVal(seat)).toBe(who)
    expect(view.OILWAIT).toBeNull(); expect(view.OILBAR).toBeNull()
    expect(SAID.join(' | ')).toContain('That row has changed — not swapped')
  })

  /* Opus F5. The bar's "Answer OIL" still made its change with OIL Earn switched on — the mode in which "the day
     underneath does not move" (every drop is refused there). */
  it('OIL Earn switched on takes the waiting change and its bar away — nothing is made inside the mode', async () => {
    await boot()
    file(['bane'], SAT, { [SAT_ISO]: 0.5 })
    expect(rowPut(rowKey(), 'pike')).toBe('asked')
    leaveOilWait()
    expect(view.OILBAR).toBeTruthy()
    view.setOilDay(SAT)
    expect(view.OILBAR, 'the bar goes with the mode').toBeNull()
    expect(view.OILWAIT).toBeNull()
    view.setOilDay(null)
    expect(rowPut(rowKey(), 'pike'), 'and a question still up when the mode comes on goes too').toBe('asked')
    view.setOilDay(SAT)
    expect(view.OILWAIT).toBeNull()
    view.setOilDay(null)
  })

  /* Opus F6 (first half). A man dragged from a SEAT onto a row's open place ("+ add") is an add, and he keeps his seat:
     left unanswered only the row's box flashed — the puck that was dragged did not ("both pucks flash", D783 (2)). */
  it('an add dragged from a seat onto "+ add": left unanswered, the puck that was dragged flashes too', async () => {
    await boot()
    file(['bane', 'pike'], SAT)
    const { key: seat } = dutySeat()
    const cell = document.createElement('div'); cell.dataset.fill = `${rowKey()}.+`; document.body.appendChild(cell)
    const source = seatEl(seat)
    setDrag({ kind: 'slot', key: seat })
    expect(applyDrop(cell, 0, 0)).toBe(false)
    expect(view.OILWAIT!.kind).toBe('add')
    leaveOilWait()
    expect(source.classList.contains('lift-land'), 'the puck that was dragged').toBe(true)
  })

  /* Fable F3 / Opus F6 (second half). On the Unavailable row the seat he was dragged from is handed to the wait by the
     drag; "Answer OIL" builds the wait again through a door that knows no seat — and a second "Don’t swap" flashed the
     row's man alone. */
  it('the Unavailable row, "Answer OIL" then "Don’t swap" again: BOTH pucks flash the second time too', async () => {
    await boot()
    const iid = od(['bane'], { [SAT_ISO]: 1 })
    const { key: seat } = dutySeat()
    const row = inpSeat(iid), source = seatEl(seat)
    setDrag({ kind: 'slot', key: seat })
    applyDrop(row, 0, 0)
    leaveOilWait()
    row.classList.remove('lift-land'); source.classList.remove('lift-land')
    oilBarAgain()
    expect(view.OILWAIT, 'the question again').toBeTruthy()
    leaveOilWait()
    expect(row.classList.contains('lift-land'), 'the man on the row').toBe(true)
    expect(source.classList.contains('lift-land'), 'and the puck that was dragged, again').toBe(true)
  })
})

/* AN INPUT PUT BACK ON THE PROGRAMME WAITS ON ITS OIL QUESTION TOO (owner D793, 13 Oct 26 — "Yes it should wait on it";
   `[OIL-ACCEPT-BACK-UNASKED]`, found by the Opus read of [OIL-ASK-NOTIFY]). An input is taken off the programme; its day
   is then made a holiday, or it never had an answer; a scheduler puts it back with "Accept" on its card or line. It now
   needs an OIL answer — and the Accept asked nothing. D783's rule at one more door: the question FIRST, the put-back
   only on an answer; not answered, it is not put back and the bar says so. An Undo of the take-off asks nothing — an
   Undo never asks a question (D793's reading 3). The button is pressed here the way the page presses it: through the
   click router, on a button carrying the card's own three marks. */
describe('an input put BACK on the programme where it needs an OIL answer is NOT put back until it is answered (D793) (ON9)', () => {
  const press = (dest: 'g' | 'x' | 'u', di = SAT, title = TITLE) => {
    const b = document.createElement('button')
    b.dataset.acc = dest; b.dataset.accd = String(di); b.dataset.acck = String(inpId(rec(di, title)))
    document.body.appendChild(b)
    try { routeClick({ target: b, stopPropagation() {}, preventDefault() {} } as any) } finally { b.remove() }
  }
  /* on the programme with no answer (the state a day made a holiday afterwards leaves), then taken off by a scheduler */
  const takenOff = (oil?: Record<string, number>, di = SAT) => {
    file(['bane'], di, oil)
    expect(riOf(di), 'the premise: it is on the programme').toBeGreaterThanOrEqual(0)
    press('x', di)
    expect(rec(di).acc, 'the premise: taken off').toBe('r'); expect(riOf(di)).toBe(-1)
    SAID = []
  }

  it('Accept on an input with no answer: nothing is put back, and the question waits with its own words', async () => {
    await boot()
    takenOff()
    const was = world()
    press('g')
    expect(world(), 'NOTHING moved: the inputs, the day, the history, the bell, Undo').toBe(was)
    expect(riOf(), 'not on the programme').toBe(-1)
    const w = view.OILWAIT!
    expect(w, 'the question waits').toBeTruthy()
    expect(w.kind).toBe('back')
    expect(w.lead).toBe(`Putting ${cs('bane')}'s ${TITLE} back on the programme`)
    expect(w.gate.plan).toEqual([{ iso: SAT_ISO, amt: 0.5 }])
    expect(pops.INPEDIT, 'no window of the input behind it').toBeNull()
    expect(SAID, 'and nothing is said yet').toEqual([])
  })

  it('answered: it is back on the programme WITH its answer — one step, and one Undo takes both away', async () => {
    await boot()
    takenOff()
    press('g')
    expect(answerOilWait({ [SAT_ISO]: 0.5 })).toBe(true)
    expect(view.OILWAIT).toBeNull(); expect(view.OILBAR).toBeNull()
    expect(riOf(), 'on the programme again').toBeGreaterThanOrEqual(0)
    expect(rec().acc).toBe('g')
    expect(rec().oil, 'the answer given with the put-back').toEqual({ [SAT_ISO]: 0.5 })
    expect(SAID.join(' | ')).toContain(`${cs('bane')}'s ${TITLE} added to the ground programme`)
    globalUndo()
    expect(riOf(), 'ONE Undo: off the programme again').toBe(-1)
    expect(rec().acc).toBe('r')
    expect(rec().oil || {}, 'and unanswered again').toEqual({})
  })

  it('a No is an answer: it is put back, and counted for nothing', async () => {
    await boot()
    takenOff()
    press('g')
    expect(answerOilWait({ [SAT_ISO]: 0 })).toBe(true)
    expect(riOf()).toBeGreaterThanOrEqual(0)
    expect(rec().oil).toEqual({ [SAT_ISO]: 0 })
  })

  it('not answered: it is NOT put back; the bar says so; "Answer OIL" brings the question back; "OK" only closes', async () => {
    await boot()
    takenOff()
    const was = world()
    press('g')
    leaveOilWait()
    expect(world(), 'nothing made, nobody told').toBe(was)
    expect(view.OILWAIT).toBeNull()
    expect(view.OILBAR!.text).toBe('Not put back — OIL not answered')
    expect(WAIT_WORDS.back).toEqual({ no: 'Don’t put back', yes: 'Put back', not: 'Not put back — OIL not answered' })
    oilBarAgain()
    expect(view.OILBAR, 'the bar goes while the question is up').toBeNull()
    expect(view.OILWAIT!.kind).toBe('back')
    expect(answerOilWait({ [SAT_ISO]: 0.5 }), 'and answered from there it is put back').toBe(true)
    expect(riOf()).toBeGreaterThanOrEqual(0)
    press('x'); press('g'); leaveOilWait(); oilBarOk()
    expect(view.OILBAR).toBeNull(); expect(view.OILWAIT).toBeNull()
  })

  it('where nothing is to be asked — it is answered already, or the day is a working day — Accept puts it back at once, as before', async () => {
    await boot()
    takenOff({ [SAT_ISO]: 0 })
    press('g')
    expect(view.OILWAIT, 'answered already (a No is an answer): no question').toBeNull()
    expect(riOf()).toBeGreaterThanOrEqual(0)
    expect(SAID.join(' | ')).toContain('added to the ground programme')
    takenOff(undefined, WED)
    press('g', WED)
    expect(view.OILWAIT, 'a working day: no question').toBeNull()
    expect(riOf(WED)).toBeGreaterThanOrEqual(0)
  })

  /* "→ UNAVAIL" WAITS ON THE QUESTION TOO (owner D804, 13 Oct 26 — "As long as leave and medical they don't earn oil.
     For others just ask the OIL question, it may or may not credit OIL"; it replaced D803 of the same morning). An
     input of kind Other filed under Unavailable is still one of the kinds that asks, and earns on its Yes — so the
     button that files it there no longer files it with nobody asked (this test read "asks nothing" until then: D793's
     words were "on the programme"). The same door, the same rule: the question first, the filing only on an answer. */
  const otherOff = (oil?: Record<string, number>, di = SAT) => {
    file(['bane'], di, oil, { type: 'Other' })
    press('x', di)
    expect(rec(di).acc, 'the premise: an Other lands on the programme and was taken off').toBe('r')
    SAID = []
  }
  it('(D804) "→ Unavail" on an Other with no answer: nothing is filed, and the question waits with its own words', async () => {
    await boot()
    otherOff()
    const was = world()
    press('u')
    expect(world(), 'NOTHING moved: the inputs, the day, the history, the bell, Undo').toBe(was)
    expect(rec().acc, 'not filed under Unavailable').toBe('r')
    const w = view.OILWAIT!
    expect(w, 'the question waits').toBeTruthy()
    expect(w.kind).toBe('file')
    expect(w.lead).toBe(`Filing ${cs('bane')}'s ${TITLE} under Unavailable`)
    expect(w.gate.plan).toEqual([{ iso: SAT_ISO, amt: 0.5 }])
    expect(pops.INPEDIT, 'no window of the input behind it').toBeNull()
    expect(SAID, 'and nothing is said yet').toEqual([])
  })

  it('(D804) answered: it is filed under Unavailable WITH its answer — one step, and one Undo takes both away', async () => {
    await boot()
    otherOff()
    press('u')
    expect(answerOilWait({ [SAT_ISO]: 0.5 })).toBe(true)
    expect(view.OILWAIT).toBeNull(); expect(view.OILBAR).toBeNull()
    expect(rec().acc, 'filed under Unavailable').toBe('u')
    expect(riOf(), 'and not on the programme').toBe(-1)
    expect(rec().oil, 'the answer given with the filing').toEqual({ [SAT_ISO]: 0.5 })
    expect(SAID.join(' | ')).toContain(`${cs('bane')}'s ${TITLE} filed under Unavailable`)
    globalUndo()
    expect(rec().acc, 'ONE Undo: taken off again, not filed').toBe('r')
    expect(rec().oil || {}, 'and unanswered again').toEqual({})
  })

  it('(D804) a No is an answer: it is filed, and counted for nothing', async () => {
    await boot()
    otherOff()
    press('u')
    expect(answerOilWait({ [SAT_ISO]: 0 })).toBe(true)
    expect(rec().acc).toBe('u')
    expect(rec().oil).toEqual({ [SAT_ISO]: 0 })
  })

  it('(D804) not answered: it is NOT filed; the bar says so in its own words; "Answer OIL" brings the question back; "OK" only closes', async () => {
    await boot()
    otherOff()
    const was = world()
    press('u')
    leaveOilWait()
    expect(world(), 'nothing made, nobody told').toBe(was)
    expect(view.OILWAIT).toBeNull()
    expect(view.OILBAR!.text).toBe('Not filed — OIL not answered')
    expect(WAIT_WORDS.file).toEqual({ no: 'Don’t file', yes: 'File', not: 'Not filed — OIL not answered' })
    oilBarOk()
    expect(view.OILBAR).toBeNull(); expect(view.OILWAIT).toBeNull()
    expect(world(), 'OK only closes: nothing filed').toBe(was)
    press('u'); leaveOilWait(); oilBarAgain()
    expect(view.OILBAR, 'the bar goes while the question is up').toBeNull()
    expect(view.OILWAIT!.kind).toBe('file')
    expect(answerOilWait({ [SAT_ISO]: 0.5 }), 'and answered from there it is filed').toBe(true)
    expect(rec().acc).toBe('u')
    press('x'); press('u')
    expect(view.OILWAIT, 'taken out and filed again: it is answered now, so nothing is asked').toBeNull()
    expect(rec().acc).toBe('u')
  })

  it('(D804) where nothing is to be asked — it is answered already, or the day is a working day — "→ Unavail" files it at once, as before', async () => {
    await boot()
    otherOff({ [SAT_ISO]: 0 })
    press('u')
    expect(view.OILWAIT, 'answered already (a No is an answer): no question').toBeNull()
    expect(rec().acc).toBe('u')
    expect(SAID.join(' | ')).toContain('filed under Unavailable')
    otherOff(undefined, WED)
    press('u', WED)
    expect(view.OILWAIT, 'a working day: no question').toBeNull()
    expect(rec(WED).acc).toBe('u')
  })

  it('(D804) "Answer OIL" after it was put on the programme another way says so in the filing\'s words and asks nothing', async () => {
    await boot()
    otherOff()
    press('u'); leaveOilWait()
    globalUndo()                                   // the take-off undone: it is on the programme again
    expect(riOf()).toBeGreaterThanOrEqual(0)
    SAID = []
    const was = world()
    oilBarAgain()
    expect(view.OILWAIT, 'no question for a filing that is no longer one').toBeNull()
    expect(world(), 'and nothing written').toBe(was)
    expect(SAID.join(' | ')).toMatch(/has changed — not filed/)
  })

  it('(D804) taking it back OUT of Unavailable asks nothing, and its answer stays on the record', async () => {
    await boot()
    otherOff()
    press('u')
    expect(answerOilWait({ [SAT_ISO]: 0.5 })).toBe(true)
    SAID = []
    press('x')
    expect(view.OILWAIT, 'a take-off never asks').toBeNull()
    expect(rec().acc).toBe('r')
    expect(rec().oil, 'the answer is the input\'s: it stays').toEqual({ [SAT_ISO]: 0.5 })
    expect(SAID.join(' | ')).toContain('taken out of Unavailable')
  })

  /* A CANCELLED INPUT IS NEVER ASKED (owner D814, 13 Oct 26 — "Canceled input doesn't need to ask OIL"; found by both
     reads of the change above: every door priced the question from the input's dates and kind alone, so a cancelled
     input — which earns nobody OIL, D760 — was still asked at the put-back and the filing). Information-only the same:
     it earns nothing either. The mark is the INPUT's (D760), put on by the board's own door (ui/reqdoor.ts rowMark). */
  for (const [what, name] of [['cx', 'cancelled'], ['info', 'information-only']] as const) {
    it(`(D814) a ${name} input put back with Accept is asked nothing — it can earn nothing: it goes back at once`, async () => {
      await boot()
      file(['bane'], SAT)
      expect(rowMark(rowKey(), what, true, 'weather')).toBe('done')
      expect(rec()[what], `the premise: the input itself is ${name} (D760)`).toBe(true)
      press('x')
      expect(rec().acc).toBe('r')
      SAID = []
      press('g')
      expect(view.OILWAIT, 'no question').toBeNull(); expect(view.OILBAR).toBeNull()
      expect(riOf(), 'on the programme again').toBeGreaterThanOrEqual(0)
      expect(rec().oil || {}, 'and no answer was written for it').toEqual({})
    })
    it(`(D814) a ${name} Other filed with "→ Unavail" is asked nothing: it is filed at once`, async () => {
      await boot()
      file(['bane'], SAT, undefined, { type: 'Other' })
      expect(rowMark(rowKey(), what, true, 'weather')).toBe('done')
      press('x'); SAID = []
      press('u')
      expect(view.OILWAIT, 'no question').toBeNull(); expect(view.OILBAR).toBeNull()
      expect(rec().acc).toBe('u')
      expect(SAID.join(' | ')).toContain('filed under Unavailable')
    })
  }
  it('(D814) the mark taken off again, the input needs its answer again: the next put-back asks', async () => {
    await boot()
    file(['bane'], SAT)
    expect(rowMark(rowKey(), 'cx', true, 'weather')).toBe('done')
    expect(rowMark(rowKey(), 'cx', false)).toBe('done')
    expect(!!rec().cx, 'the premise: no longer cancelled').toBe(false)
    press('x'); SAID = []
    press('g')
    expect(view.OILWAIT, 'the question is back').toBeTruthy()
    expect(view.OILWAIT!.kind).toBe('back')
    expect(riOf(), 'and nothing is put back until it is answered').toBe(-1)
  })

  it('an Undo of the take-off puts the input back as it was and asks nothing (D793, reading 3)', async () => {
    await boot()
    takenOff()
    globalUndo()
    expect(riOf(), 'back on the programme').toBeGreaterThanOrEqual(0)
    expect(view.OILWAIT, 'an Undo never asks a question').toBeNull()
    expect(view.OILBAR).toBeNull()
  })

  it('"Answer OIL" after it was put back another way says so and asks nothing', async () => {
    await boot()
    takenOff()
    press('g'); leaveOilWait()
    globalUndo()                                   // the take-off undone: it is on the programme again
    expect(riOf()).toBeGreaterThanOrEqual(0)
    SAID = []
    const was = world()
    oilBarAgain()
    expect(view.OILWAIT, 'no question for a put-back that is no longer one').toBeNull()
    expect(world(), 'and nothing written').toBe(was)
    expect(SAID.join(' | ')).toMatch(/has changed — not put back/)
  })

  it('a put-back the save itself would refuse is refused in its own words — nobody is asked a question for it first', async () => {
    await boot()
    takenOff()
    const was = world()
    /* the card of a day the app does not hold: the save refuses it */
    const b = document.createElement('button')
    b.dataset.acc = 'g'; b.dataset.accd = '99'; b.dataset.acck = String(inpId(rec()))
    document.body.appendChild(b)
    try { routeClick({ target: b, stopPropagation() {}, preventDefault() {} } as any) } finally { b.remove() }
    expect(view.OILWAIT, 'no question was put for it').toBeNull()
    expect(view.OILBAR).toBeNull()
    expect(world(), 'and nothing was kept of the try').toBe(was)
    expect(SAID.join(' | '), 'it said why').toMatch(/can't be changed here right now/)
  })

  /* THE READS OF THE FINISHED CODE (13 Oct 26 — a fresh, blind Opus reader and Fable; docs/handpass/parts/ib/). Each
     claim below was written as a test first, and failed first. */
  it('(the Opus read, F1) put back WITH its answer on a published day that went out with the row: the row is as issued again — no "goes out" mark is left on it', async () => {
    await boot()
    file(['bane'], SAT)
    sign(SAT); commitSetDayApproved(SAT, true)
    press('x')
    expect(dayPendingItems(SAT).length, 'the premise: the take-off waits to go out').toBeGreaterThan(0)
    press('g')
    expect(answerOilWait({ [SAT_ISO]: 0.5 })).toBe(true)
    expect(riOf()).toBeGreaterThanOrEqual(0)
    expect(Object.keys(SCHED.pending).filter(k => /^gr:/.test(k)), 'no mark on a row that is exactly what was issued').toEqual([])
  })

  it('(the Opus read, F2) the question for an input of several is headed for everyone its one answer is written for', async () => {
    await boot()
    file(['pike', 'bane', 'split'], SAT)
    press('x')
    press('g')
    expect(view.OILWAIT!.gate.who).toBe(inputWho(rec()))
    expect(view.OILWAIT!.lead).toBe(`Putting 3 people's ${TITLE} back on the programme`)
  })

  it('(the Opus read, F4) the put-back that is tried and thrown away leaves no "just added" flash behind it', async () => {
    await boot()
    takenOff()
    view.FRESHADD.clear()                          // what the filing itself lit, long ago
    press('g')
    expect(view.OILWAIT!.kind).toBe('back')
    expect([...view.FRESHADD], 'nothing was added — nothing flashes as added').toEqual([])
  })

  it('(the Opus read, F5) "Answer OIL" after the input was moved to a day this card is not of: it says the input has changed, and puts nothing back', async () => {
    await boot()
    takenOff()
    press('g'); leaveOilWait()
    const r = rec()
    expect(commitInputEdit(r, { ...draftOf(r), start: '2026-07-25', end: '' }, undefined, undefined, { oil: { '2026-07-25': 0 } }), 'the premise: moved to the next Saturday, answered there').toBe(true)
    const moved = INPUTS.find((x: any) => x.title === TITLE) as any
    expect(moved.acc, 'the premise: still taken off').toBe('r')
    SAID = []
    oilBarAgain()
    expect(SAID.join(' | ')).toMatch(/has changed — not put back/)
    expect((INPUTS.find((x: any) => x.title === TITLE) as any).acc, 'left as it was').toBe('r')
    expect(ground().some((g: any) => g && g.src), 'no row written on a day the input no longer covers').toBe(false)
  })

  it('(the walk, seen in passing) a note from the step before does not sit over the question: it is taken down when the question is put', async () => {
    await boot()
    takenOff()
    realToast('Ground item removed — back under Personal Inputs', 'ok')
    const el = document.getElementById('toastEl') as HTMLElement
    expect(el && el.style.opacity, 'the premise: a note is up').toBe('1')
    press('g')
    expect(view.OILWAIT!.kind).toBe('back')
    expect(el.style.opacity, 'the note is taken down — on a phone on its side it lay over the question’s two buttons').toBe('0')
  })

  /* Fable's read of the finished code, F1 (13 Oct 26): the answer is written first and the put-back second, in one
     batch — and a batch whose body only ANSWERS false is still committed. A put-back refused at that moment (the
     world changed under the question) left the answer written and nothing put back: half of the one step. */
  it('a put-back refused AFTER the answer was given keeps nothing — not the answer either — and says why', async () => {
    await boot()
    takenOff()
    press('g')
    expect(view.OILWAIT!.kind).toBe('back')
    const was = world()
    const spy = vi.spyOn(slots, 'acceptInput').mockReturnValue(false)
    try { expect(answerOilWait({ [SAT_ISO]: 0.5 }), 'not made').toBe(false) } finally { spy.mockRestore() }
    expect(rec().oil || {}, 'no answer was kept without its put-back').toEqual({})
    expect(rec().acc).toBe('r')
    expect(world(), 'nothing was kept of the refused step').toBe(was)
    expect(SAID.length, 'it said why — once').toBe(1)
  })

  /* written for the break tests: the ANSWER (not the bar's "Answer OIL") arriving after the input was put back another
     way — the page works under the question's sheet from the keyboard, and another door can land it */
  it('an answer given after the input was put back another way makes nothing and says the input has changed', async () => {
    await boot()
    takenOff()
    press('g')
    expect(view.OILWAIT!.kind).toBe('back')
    expect(slots.acceptInput(SAT, rec(), 'g'), 'the premise: put back by another door').toBe(true)
    view.afterSchedMutate()
    expect(view.OILWAIT, 'the premise: the question is still up').toBeTruthy()
    SAID = []
    expect(answerOilWait({ [SAT_ISO]: 0.5 })).toBe(false)
    expect(SAID.join(' | ')).toMatch(/has changed — not put back/)
    expect(rec().oil || {}, 'no answer written for a put-back that was not made').toEqual({})
  })

  it('on a PUBLISHED day nothing waits to go out until the answer is given', async () => {
    await boot()
    takenOff()
    sign(SAT); commitSetDayApproved(SAT, true)
    expect(dayPendingItems(SAT).length, 'the premise: nothing pending').toBe(0)
    press('g')
    expect(view.OILWAIT!.kind).toBe('back')
    expect(dayPendingItems(SAT).length, 'asked: still nothing pending').toBe(0)
    expect(answerOilWait({ [SAT_ISO]: 0.5 })).toBe(true)
    expect(dayPendingItems(SAT).length, 'answered: the put-back waits to go out').toBeGreaterThan(0)
  })

  /* THE FILING'S OWN PINS (the two reads of D804, 13 Oct 26 — both probed these on scratch tests and found them right;
     nothing held them for the "file" kind) */
  it('(D804, the reads) "→ Unavail" on a PUBLISHED day: nothing waits to go out and no sign-off falls until the answer is given; one Undo puts it all back', async () => {
    await boot()
    otherOff()
    sign(SAT); commitSetDayApproved(SAT, true)
    const signed = JSON.stringify(SCHED.sign[SAT])
    expect(dayPendingItems(SAT).length, 'the premise: nothing pending').toBe(0)
    press('u')
    expect(view.OILWAIT!.kind).toBe('file')
    expect(dayPendingItems(SAT).length, 'asked: still nothing pending').toBe(0)
    expect(JSON.stringify(SCHED.sign[SAT]), 'and the four sign-offs stand').toBe(signed)
    expect(answerOilWait({ [SAT_ISO]: 0.5 })).toBe(true)
    expect(rec().acc).toBe('u')
    expect(dayPendingItems(SAT).length, 'answered: the filing waits to go out').toBeGreaterThan(0)
    globalUndo()
    expect(rec().acc, 'ONE Undo').toBe('r')
    expect(dayPendingItems(SAT).length, 'nothing pending again').toBe(0)
  })
  it('(D804, the reads) an Other of several filed with "→ Unavail": the question is headed for everyone, and ONE answer is written on the one record', async () => {
    await boot()
    file(['pike', 'bane', 'split'], SAT, undefined, { type: 'Other' })
    press('x')
    press('u')
    expect(view.OILWAIT!.gate.who).toBe(inputWho(rec()))
    expect(view.OILWAIT!.lead).toBe(`Filing 3 people's ${TITLE} under Unavailable`)
    expect(answerOilWait({ [SAT_ISO]: 0.5 })).toBe(true)
    expect(rec().acc).toBe('u')
    expect(rec().oil, 'one answer, on the input').toEqual({ [SAT_ISO]: 0.5 })
    expect(people(), 'and its people are as they were').toEqual(['pike', 'bane', 'split'])
  })
})
