// @vitest-environment jsdom
/* THE MARKS ON AN INPUT'S ROW ARE THE INPUT'S ([ALL-AVAIL-AS-MEMBER] step 4, 12 Oct 26; the plan
   docs/superpowers/plans/2026-10-11-one-rule-plan.md §4.1, §4.2, §4.3, §4.4, §4.7, §4.8 — its test T20). His ruling:
   D760 — "a CX the scheduler puts on a row that came from an input cancels the input itself: the Inputs calendar shows
           it cancelled with its reason, the member is told by his bell, and it goes with the input if it moves; the red
           box and 'information only' go with the input too, shown on the schedule only" — and its readings: (1) a
           cancelled input earns nobody OIL and is not checked against the rules, as a cancelled row today; taking the CX
           off brings it back; (2) only a scheduler puts a CX on or takes it off; (3) on a published day a CX put on or
           taken off reads as a change waiting; (5) a mark on the scheduler's OWN rows is unchanged.
   It changes D468 for an input's row: nothing the scheduler put on it stays behind on the old day.
   D755 — the row is a whole copy of the input; D736, D114, D98 — the count; D756 — one record.

   UNTIL THIS STEP the three marks were the ROW's own: written on the day (ui/board.ts), kept by the re-make, left
   behind when the request moved (D468). Now the board's three buttons, on a row that came from an input, go through the
   row's door (ui/reqdoor.ts rowMark) and write the INPUT; the row follows as the copy it is. (The Inputs calendar's
   own look of a cancelled input was step 5 — BUILT since, D767 and D768: ui/inputcx.test.tsx and
   ui/inputcx-scenarios.test.tsx hold it, with the schedule's own Personal Inputs and Unavailable lines; the bell's
   line is step 7.)

   Driven through the board's own buttons (ui/board.ts boardMbtn, cxCommit) on a real saved store. */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { INPUTS, inpId, idsOf, inpDetailKey } from '../engine/inputs'
import { PEOPLE, ID_BY_CS, indexCallsigns } from '../engine/people'
import { DAYS } from '../engine/data'
import { CURWEEK } from '../engine/waves'
import { storeBackend, HOOKS } from '../engine/hooks'
import { stashClear } from '../engine/weekstash'
import { SCHED, signOf, dayPendingItems, dayShownPendCount, itemCounts, dayDelta } from '../engine/publish'
import { ELOG } from '../engine/editlog'
import { oilEvidence, oilEarnedWork } from '../engine/oilev'
import { ensureRowIds } from '../engine/rowids'
import { WARN } from '../engine/validate'
import { PLANPUCKS, DAYRMK } from '../state/plan'
import { initStore, weekStashSnap, weekDirty, loadWeek } from '../state/store'
import { commitSetDayApproved } from '../state/sched-commit'
import { setSession, setMe, DEFAULT_ME } from '../state/auth'
import { hydrate, wirePersist } from '../state/persist'
import { bootStorage } from '../storage/boot'
import { settingsAdapter } from '../storage/adapters'
import { MemoryBackend } from '../storage/memory'
import { SCHEMA_VERSION } from '../storage/reset'
import { globalUndo, globalRedo } from '../undo'
import { _resetTimeline } from '../undo/timeline'
import { installGlobalUndo } from '../state/undo-wire'
import { _resetDisclosure } from '../state/disclosure'
import { setPage, setBoardDay } from '../state/view'
import * as view from '../state/view'
import { commitInput, draftOf, saveBatchX } from './inputedit'
import { acceptInput, unacceptInput } from '../engine/slots'
import { schedWrite, SCHED_TYPES } from '../state/sched-commit'
import { rowMark } from './reqdoor'
import { boardMbtn, cxCommit, CXT } from './board'
import * as pops from './pops'

const ISNAP = JSON.stringify(INPUTS)
const PSNAP = JSON.stringify(PEOPLE)
const DSNAP = JSON.stringify(DAYS)
const W1 = '13/07/2026'
const WED = 2, THU = 3, SAT = 5, SUN = 6
const ISO = ['2026-07-13', '2026-07-14', '2026-07-15', '2026-07-16', '2026-07-17', '2026-07-18', '2026-07-19']
const LBL = ['Jul 13', 'Jul 14', 'Jul 15', 'Jul 16', 'Jul 17', 'Jul 18', 'Jul 19']
const toast = HOOKS.toast, earning = HOOKS.oilEarningDay, sentinel = HOOKS.oilSentinel, dayISO = HOOKS.oilDayISO
let SAID: string[] = []
const oilOn = (earns: number[], crowd: string[] = []) => {
  for (const di of earns) Object.assign(DAYS[di] as any, { waves: [], dutywaves: [], sims: {}, ground: [], allhands: [], oild: undefined })
  ensureRowIds(DAYS)
  HOOKS.oilDayISO = (di: number) => ISO[di] as string
  HOOKS.oilEarningDay = (di: number) => earns.includes(di)
  HOOKS.oilSentinel = () => crowd.slice()
}

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
const admin = () => { setSession({ user: 'ad', role: 'admin', name: 'ad' }); setMe('stiff') }      // Saber, a scheduler
const member = (id: string) => { setSession({ user: 'us', role: 'main', name: 'us' }); setMe(id) }
async function boot() {
  const be = new MemoryBackend()
  be.seed({ settings: { schema: JSON.stringify(SCHEMA_VERSION) } })
  const p = bootStorage(be)
  await vi.advanceTimersByTimeAsync(be.latency)
  const { wb } = await p
  storeBackend.impl = settingsAdapter(wb)
  hydrate(wb)
  initStore()
  wirePersist(wb, { weekSnap: weekStashSnap, weekDirty })
  _resetDisclosure()
  _resetTimeline(); installGlobalUndo()
  admin()
  setPage('editsched'); setBoardDay(WED)
}

const TITLE = 'Range safety brief'
const recs = (title = TITLE) => INPUTS.filter((x: any) => x.title === title) as any[]
const rec = (title = TITLE) => { const l = recs(title); expect(l, 'ONE record').toHaveLength(1); return l[0] }
const ground = (di = WED) => ((DAYS[di] as any).ground || []) as any[]
const riOf = (di = WED, title = TITLE) => ground(di).findIndex((g: any) => g && g.src === String(inpId(rec(title))))
const rowOf = (di = WED, title = TITLE) => ground(di)[riOf(di, title)]
const DRAFT = (di = WED, over: any = {}) => ({ ...draftOf({ person: 'bane', type: di >= SAT ? 'Duty' : 'Meeting', title: TITLE, date: LBL[di], yr: 2026, allday: false, s: 840, e: 900, remarks: 'Bring your kit' }), ...over })
const file = (ppl: string[], di = WED, oil?: Record<string, number>, over: any = {}) => expect(commitInput(null, DRAFT(di, over), ppl, oil ? { oil } : undefined), 'filed').toBe(true)
/* the board's own buttons, as a scheduler presses them */
const press = (data: Record<string, string>) => { const b = document.createElement('button'); b.className = 'mbtn'; Object.assign(b.dataset, data); document.body.appendChild(b); boardMbtn({ target: b } as any); b.remove() }
const cx = (di = WED, reason = 'WX', title = TITLE) => { setBoardDay(di); press({ grcx: `${di}.${riOf(di, title)}` }); expect(CXT, 'the reason is asked').toBeTruthy(); cxCommit(true, reason) }
const uncx = (di = WED, title = TITLE) => { setBoardDay(di); press({ grcx: `${di}.${riOf(di, title)}` }); cxCommit(false, '') }
const redBox = (di = WED, title = TITLE) => { setBoardDay(di); press({ grflag: `${di}.${riOf(di, title)}` }) }
const infoOnly = (di = WED, title = TITLE) => { setBoardDay(di); press({ grinfo: `${di}.${riOf(di, title)}` }) }
const marks = (x: any) => ({ cx: !!x.cx, cxr: x.cx ? String(x.cxr || '') : '', flag: !!x.flag, info: !!x.info })
const sign = (di: number) => { const g = signOf(di); g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump' }
const publish = (di: number) => { sign(di); commitSetDayApproved(di, true) }
const waiting = (di: number): number => {
  const n = dayPendingItems(di).length
  expect(dayShownPendCount(di), 'the day head reads the same list').toBe(n)
  expect(itemCounts(dayPendingItems(di)).total, 'the Amendments box').toBe(n)
  expect(n === 0, 'never zero while something would go out, never something while nothing would').toBe(dayDelta(di).length === 0)
  return n
}
const paid = (di: number) => Object.keys(oilEarnedWork(DAYS[di], oilEvidence(di))).sort()

beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(new Date(2026, 5, 1, 9, 0, 0)); resetWorld(); SAID = []; HOOKS.toast = (m: any) => { SAID.push(String(m)) } })
afterEach(() => {
  HOOKS.toast = toast; HOOKS.oilEarningDay = earning; HOOKS.oilSentinel = sentinel; HOOKS.oilDayISO = dayISO
  _resetTimeline(); vi.useRealTimers(); resetWorld(); setSession(null); setMe(DEFAULT_ME); storeBackend.impl = null; document.body.innerHTML = ''
})

describe('a CX on a row that came from an input cancels THE INPUT (D760)', () => {
  it('the board\'s CX: the input carries it with its reason, the row is the copy of it, and one Undo takes both back', async () => {
    await boot()
    file(['bane', 'pike'])
    const steps = ELOG.rows.length
    cx(WED, 'WX')
    expect(marks(rec())).toEqual({ cx: true, cxr: 'WX', flag: false, info: false })
    expect(marks(rowOf()), 'the row says what its input says').toEqual({ cx: true, cxr: 'WX', flag: false, info: false })
    expect(idsOf(rec()).map(String), 'and its people are untouched').toEqual(['bane', 'pike'])
    expect(ELOG.rows.length, 'one line of the change history').toBe(steps + 1)
    expect(globalUndo()).toBeTruthy()
    expect(marks(rec()).cx).toBe(false); expect(marks(rowOf()).cx).toBe(false)
    expect(globalRedo()).toBeTruthy()
    expect(marks(rec())).toEqual({ cx: true, cxr: 'WX', flag: false, info: false })
    expect(marks(rowOf()).cx).toBe(true)
  })
  it('Un-cancel brings it back — and leaves no trace of the reason', async () => {
    await boot()
    file(['bane'])
    cx(); uncx()
    expect(marks(rec())).toEqual({ cx: false, cxr: '', flag: false, info: false })
    expect(rec().cxr).toBeUndefined()
    expect(marks(rowOf())).toEqual({ cx: false, cxr: '', flag: false, info: false })
  })
  it('the reason changed on a row already cancelled changes the input\'s', async () => {
    await boot()
    file(['bane'])
    cx(WED, 'WX'); cx(WED, 'Range closed')
    expect(rec().cxr).toBe('Range closed'); expect(rowOf().cxr).toBe('Range closed')
  })
  it('the red box and "information only" are the input\'s too — each press one Undo step', async () => {
    await boot()
    file(['bane', 'pike'])
    redBox()
    expect(marks(rec()).flag).toBe(true); expect(marks(rowOf()).flag).toBe(true)
    infoOnly()
    expect(marks(rec())).toEqual({ cx: false, cxr: '', flag: true, info: true })
    expect(marks(rowOf())).toEqual({ cx: false, cxr: '', flag: true, info: true })
    expect(globalUndo()).toBeTruthy()
    expect(marks(rec())).toEqual({ cx: false, cxr: '', flag: true, info: false })
    redBox()
    expect(marks(rec()).flag).toBe(false); expect(marks(rowOf()).flag).toBe(false)
  })
  it('the door answers for an input\'s row only: a scheduler\'s own row keeps its marks as before, and no input is touched (D760 reading 5)', async () => {
    await boot()
    ;(DAYS[WED] as any).ground.push({ prog: 'SQN PT', str: '07:00', end: '08:00', who: 'pike', rmks: '' })
    ensureRowIds(DAYS)
    const ri = ground().length - 1, was = JSON.stringify(INPUTS)
    expect(rowMark(`g:${WED}.${ri}`, 'cx', true, 'WX')).toBe('none')
    setBoardDay(WED); press({ grcx: `${WED}.${ri}` }); cxCommit(true, 'WX')
    expect([ground()[ri].cx, ground()[ri].cxr]).toEqual([true, 'WX'])
    press({ grflag: `${WED}.${ri}` }); press({ grinfo: `${WED}.${ri}` })
    expect([ground()[ri].flag, ground()[ri].info]).toEqual([true, true])
    expect(JSON.stringify(INPUTS)).toBe(was)
  })
})

describe('the marks go where the input goes, and stay with it (D760 — D468 as changed)', () => {
  it('a cancelled, red-boxed input moved to another day arrives there cancelled, with its reason — nothing stays behind', async () => {
    await boot()
    file(['bane', 'pike'])
    cx(WED, 'WX'); redBox()
    expect(commitInput(rec(), { ...draftOf(rec()), start: ISO[THU], end: ISO[THU] }, ['bane', 'pike'])).toBe(true)
    expect(riOf(WED), 'no row left on the old day').toBe(-1)
    expect(marks(rowOf(THU))).toEqual({ cx: true, cxr: 'WX', flag: true, info: false })
  })
  it('taken off the programme with ✕ and put back: its marks were the input\'s all along', async () => {
    await boot()
    file(['bane'])
    cx(WED, 'WX'); infoOnly()
    schedWrite(SCHED_TYPES.mutate, () => { expect(unacceptInput(WED, rec())).toBe(true); view.afterSchedMutate() })
    expect(riOf()).toBe(-1)
    expect(marks(rec())).toEqual({ cx: true, cxr: 'WX', flag: false, info: true })
    schedWrite(SCHED_TYPES.mutate, () => { expect(acceptInput(WED, rec(), 'g')).toBe(true); view.afterSchedMutate() })
    expect(marks(rowOf())).toEqual({ cx: true, cxr: 'WX', flag: false, info: true })
  })
  it('a row made before the build is re-made once: a mark a scheduler had put on the ROW alone comes off, the input never carried it (R6\'s twin)', async () => {
    await boot()
    file(['bane'])
    const r = rowOf()
    r.cx = true; r.cxr = 'old'; r.flag = true; r.srcv = 'old'
    view.afterSchedMutate()
    expect(marks(rowOf())).toEqual({ cx: false, cxr: '', flag: false, info: false })
  })
  it('a person added afterwards joins a cancelled input: still cancelled, still one row', async () => {
    await boot()
    file(['bane'])
    cx(WED, 'WX')
    expect(commitInput(rec(), draftOf(rec()), ['bane', 'pike'], { sched: true })).toBe(true)
    expect(marks(rec()).cx).toBe(true)
    expect(marks(rowOf())).toEqual({ cx: true, cxr: 'WX', flag: false, info: false })
    expect([rowOf().who, rowOf().more]).toEqual(['bane', ['pike']])
  })
})

describe('only a scheduler sets them (D760 reading 2)', () => {
  it('a member\'s press does nothing, and a member\'s command that changes a mark on his own input is refused at the save', async () => {
    await boot()
    member('bane'); file(['bane'])
    const was = JSON.stringify(INPUTS)
    expect(rowMark(`g:${WED}.${riOf()}`, 'cx', true, 'WX')).toBe('refused')
    expect(rowMark(`g:${WED}.${riOf()}`, 'flag', true)).toBe('refused')
    expect(JSON.stringify(INPUTS)).toBe(was)
    /* …and behind the door, the commit gate: he may change everything his own input SAYS — never these */
    for (const set of [(r: any) => { r.cx = true; r.cxr = 'I am not coming' }, (r: any) => { r.flag = true }, (r: any) => { r.info = true }]) {
      const out = saveBatchX(() => { set(rec()); return true })
      expect(out.ok, 'refused').toBe(false)
      expect(JSON.stringify(INPUTS), 'and nothing kept').toBe(was)
    }
  })
  it('a member may still change what his own cancelled input says, and take it away — the marks ride along untouched', async () => {
    await boot()
    member('bane'); file(['bane']); admin()
    cx(WED, 'WX')
    member('bane')
    expect(commitInput(rec(), { ...draftOf(rec()), remarks: 'Understood' }, ['bane'])).toBe(true)
    expect(rec().remarks).toBe('Understood')
    expect(marks(rec())).toEqual({ cx: true, cxr: 'WX', flag: false, info: false })
  })
})

describe('a cancelled or information-only input earns nobody OIL and is not checked against the rules (D760 reading 1)', () => {
  it('OIL: nobody in it earns while it is cancelled — the men behind ALL AVAIL neither — and all earn again when it is brought back', async () => {
    oilOn([SAT], ['stiff', 'plasma']); await boot()
    file(['bane', 'allavail'], SAT, { [ISO[SAT] as string]: 0.5 })
    expect(paid(SAT)).toEqual(['bane', 'plasma', 'stiff'])
    cx(SAT, 'WX')
    expect(paid(SAT)).toEqual([])
    uncx(SAT)
    expect(paid(SAT)).toEqual(['bane', 'plasma', 'stiff'])
    infoOnly(SAT)
    expect(paid(SAT), 'information only: nobody earns').toEqual([])
  })
  it('OIL on EVERY day it covers: a two-day input cancelled on its row earns nobody on the second day either', async () => {
    oilOn([SAT, SUN]); await boot()
    file(['bane'], SAT, { [ISO[SAT] as string]: 0.5, [ISO[SUN] as string]: 0.5 }, { end: ISO[SUN] })
    expect(paid(SAT)).toEqual(['bane']); expect(paid(SUN)).toEqual(['bane'])
    cx(SAT, 'WX')
    expect(paid(SAT)).toEqual([]); expect(paid(SUN), 'the input is cancelled, not one day\'s row').toEqual([])
  })
  it('the rules: a man double-booked by it is flagged; cancelled, he is not; brought back, he is again', async () => {
    await boot()
    /* a second commitment for bane over the same hour, on the scheduler's own row */
    ;(DAYS[WED] as any).ground.push({ prog: 'SQN PT', str: '14:00', end: '15:00', who: 'bane', rmks: '' })
    ensureRowIds(DAYS)
    file(['bane'])
    const clash = () => ((WARN as any).all as any[]).some(w => w && w.di === WED && (w.who || []).map(String).includes('bane') && /TWO|CLASH|DOUBLE|same time|at once/i.test(String(w.code || '') + ' ' + String(w.msg || '')))
    view.afterSchedMutate()
    expect(clash(), 'the control: he IS double-booked while it stands').toBe(true)
    cx(WED, 'WX')
    expect(clash(), 'cancelled: nothing to clash with').toBe(false)
    uncx(WED)
    expect(clash()).toBe(true)
    infoOnly(WED)
    expect(clash(), 'information only is not checked either').toBe(false)
  })
})

describe('on a published day a CX on an input is ONE change waiting — and none once it is taken off again (D736, D98; T20, Fable F14)', () => {
  for (const di of [WED, SAT]) {
    const day = di === SAT ? 'a Saturday that earns' : 'a weekday'
    it(`${day}: cancel — 1; bring back — nothing waiting, though the record now says cx:false where it said nothing`, async () => {
      oilOn(di === SAT ? [SAT] : [], ['stiff', 'plasma']); await boot()
      file(['bane', 'pike'], di, di === SAT ? { [ISO[SAT] as string]: 0.5 } : undefined)
      publish(di)
      expect(waiting(di)).toBe(0)
      cx(di, 'WX')
      expect(waiting(di), 'one — not the row AND the input').toBe(1)
      uncx(di)
      expect(waiting(di)).toBe(0)
      expect(inpDetailKey(rec()), 'what it says is what it said').toBe(inpDetailKey({ ...rec(), cx: undefined, cxr: undefined }))
    })
    it(`${day}: an input holding ALL AVAIL cancelled — still 1 (the men behind it ride on it)`, async () => {
      oilOn(di === SAT ? [SAT] : [], ['stiff', 'plasma']); await boot()
      file(['bane', 'allavail'], di, di === SAT ? { [ISO[SAT] as string]: 0.5 } : undefined)
      publish(di)
      cx(di, 'WX')
      expect(waiting(di)).toBe(1)
    })
    it(`${day}: information only — 1; the red box — 1 (it rides the row's content, as before)`, async () => {
      oilOn(di === SAT ? [SAT] : []); await boot()
      file(['bane'], di, di === SAT ? { [ISO[SAT] as string]: 0.5 } : undefined)
      publish(di)
      infoOnly(di)
      expect(waiting(di)).toBe(1)
      infoOnly(di)
      expect(waiting(di)).toBe(0)
      redBox(di)
      expect(waiting(di)).toBe(1)
      redBox(di)
      expect(waiting(di)).toBe(0)
    })
  }
  it('a CX on a two-day input reads as a change waiting on EVERY published day it covers (the plan\'s R10)', async () => {
    await boot()
    file(['bane'], WED, undefined, { end: ISO[THU] })
    publish(WED); publish(THU)
    cx(WED, 'WX')
    expect(waiting(WED)).toBe(1)
    expect(waiting(THU), 'the second day too: the input is cancelled there as well').toBe(1)
    uncx(WED)
    expect(waiting(WED)).toBe(0); expect(waiting(THU)).toBe(0)
  })
})
