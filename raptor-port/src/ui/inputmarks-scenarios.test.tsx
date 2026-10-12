// @vitest-environment jsdom
/* THE MARKS ON AN INPUT'S ROW ARE THE INPUT'S — THE SECOND SCENARIO PASS ([ALL-AVAIL-AS-MEMBER] step 4, 12 Oct 26; the
   plan docs/superpowers/plans/2026-10-11-one-rule-plan.md §4.1–§4.4, §4.7, §4.8). Written by a helper who did not write
   the build, beside the builder's own ui/inputmarks.test.tsx — which holds the rule itself; this file holds the cases
   that one does not. His rulings:
   D760 — "a CX the scheduler puts on a row that came from an input cancels the input itself … and it goes with the
           input if it moves; the red box and 'information only' go with the input too", and its readings: (1) a
           cancelled input earns nobody OIL and is not checked against the rules, taking the CX off brings it back;
           (2) only a scheduler puts a CX on or takes it off; (3) on a published day a CX put on or taken off reads as a
           change waiting; (5) a mark on the scheduler's OWN rows is unchanged. It changes D468: nothing stays behind.
   D755 — the row is a whole copy of the input; D736 — an input cancelled or un-cancelled is ONE change waiting, a
           person added or taken out ONE EACH; D114 — ✕ is one; D98 — back to what was published is nothing waiting;
   D103 — any change that shows as pending wipes the sign-offs; D178, D45 — the issued face keeps what it went out with;
   D142, D48 — a day's OIL comes from its latest published version; D363, D175 — a load never changes an input;
   D148 — Undo reverses only the signed-in person's own changes, and refuses where someone has since changed the same
           thing; D763 — a person in an input may always take himself out.

   What is here: the three marks on a row holding several people and ALL AVAIL; a CX and then a person added, taken
   out, swapped; a published day — cancelled, republished, brought back — the count each time and what the issued face
   keeps; a cancelled input moved onto, and off, a published day; the sign-offs; information only and OIL on a published
   Saturday; a version loaded and a saved plan switched in over a cancelled input; a member's own cancelled input;
   Undo and Redo, and whose Undo may touch a mark; the change history's line for each mark; the row's ✕ on a cancelled
   row; the late mark (D741, D742); an all-day input and the rules; another week opened, and a move to next week; OIL
   Earn on a cancelled row.

   Driven through the board's own buttons (ui/board.ts boardMbtn, cxCommit) and the row's door (ui/reqdoor.ts) on a
   real saved store, as ui/inputmarks.test.tsx is. */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { INPUTS, inpId, idsOf, isLateInput } from '../engine/inputs'
import { WARN, RUNLEN, validate, officialWarn } from '../engine/validate'
import { seedRunIn } from '../engine/weekctx'
import { VCONF } from '../engine/rules'
import { PEOPLE, ID_BY_CS, indexCallsigns, isScheduler } from '../engine/people'
import { DAYS } from '../engine/data'
import { CURWEEK } from '../engine/waves'
import { storeBackend, HOOKS } from '../engine/hooks'
import { stashClear } from '../engine/weekstash'
import { SCHED, setSign, dayPendingItems, dayShownPendCount, itemCounts, dayDelta, daySigned, dayCurVer, daySnapOf, dayDiscardCount } from '../engine/publish'
import { ELOG } from '../engine/editlog'
import { oilEvidence, oilEvidenceOf, oilEarnedWork } from '../engine/oilev'
import { ensureRowIds } from '../engine/rowids'
import { loadVersionToWorkingCopy, draftDup, draftSelect, dayDrafts, curDraftId } from '../engine/drafts'
import { acceptInput } from '../engine/slots'
import { PLANPUCKS, DAYRMK } from '../state/plan'
import { initStore, weekStashSnap, weekDirty, loadWeek } from '../state/store'
import { commitSetDayApproved, commitPublishALDay, schedWrite, SCHED_TYPES } from '../state/sched-commit'
import { setSession, setMe, DEFAULT_ME, SESSION, ME } from '../state/auth'
import { hydrate, wirePersist } from '../state/persist'
import { bootStorage } from '../storage/boot'
import { settingsAdapter } from '../storage/adapters'
import { MemoryBackend } from '../storage/memory'
import { SCHEMA_VERSION } from '../storage/reset'
import { globalUndo, globalRedo } from '../undo'
import { _resetTimeline } from '../undo/timeline'
import { installGlobalUndo } from '../state/undo-wire'
import { _resetDisclosure } from '../state/disclosure'
import { setPage, setBoardDay, setOilDay } from '../state/view'
import * as view from '../state/view'
import { commitInput, draftOf, saveBatchX, removeInput } from './inputedit'
import { reqRowText } from './reqrow'
import { rowMark, rowPut, rowTake } from './reqdoor'
import { boardMbtn, cxCommit, CXT, boardHTML } from './board'
import * as pops from './pops'
import { dayHTML } from './html'

const ISNAP = JSON.stringify(INPUTS)
const PSNAP = JSON.stringify(PEOPLE)
const DSNAP = JSON.stringify(DAYS)
const W1 = '13/07/2026'
const WED = 2, THU = 3, SAT = 5
const ISO = ['2026-07-13', '2026-07-14', '2026-07-15', '2026-07-16', '2026-07-17', '2026-07-18', '2026-07-19']
const LBL = ['Jul 13', 'Jul 14', 'Jul 15', 'Jul 16', 'Jul 17', 'Jul 18', 'Jul 19']
const toast = HOOKS.toast, earning = HOOKS.oilEarningDay, sentinel = HOOKS.oilSentinel, dayISO = HOOKS.oilDayISO
let SAID: string[] = []
/* an earning day, stripped of the seed's own work so "who earns" is the input's people alone */
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
  view.WARNOFF.clear(); view.disarmSlot(); setOilDay(null)
  pops.setInpEdit(null); pops.setOilAsk(null)
  stashClear()
}
const admin = () => { setSession({ user: 'ad', role: 'admin', name: 'ad' }); setMe('stiff') }      // Saber, a scheduler
const member = (id: string) => { setSession({ user: 'us', role: 'main', name: 'us' }); setMe(id) }
/* ANOTHER PERSON'S COMMAND WHILE THE SIGNED-IN PERSON STAYS SIGNED IN (as leavewar/groupwrite.test.ts does it): a
   sign-in or sign-out clears the Undo steps (D148), so "someone else has since changed it" swaps the session for the
   length of `fn` and puts it back — what a second device's command is to this one. */
function asOther(who: () => void, fn: () => void): void {
  const s = SESSION, m = ME
  who()
  try { fn() } finally { setSession(s); setMe(m) }
}
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
const rowKey = (di = WED, title = TITLE) => `g:${di}.${riOf(di, title)}`
const keyOf = (p: string, di = WED) => { const r = rowOf(di), k = rowKey(di); if (r.who === p) return k; const n = (r.more || []).indexOf(p); expect(n, `${p} is on the row`).toBeGreaterThanOrEqual(0); return `${k}.x${n}` }
const onRow = (di = WED) => [rowOf(di).who, ...(rowOf(di).more || [])].filter(Boolean)
const DRAFT = (di = WED, over: any = {}) => ({ ...draftOf({ person: 'bane', type: di >= SAT ? 'Duty' : 'Meeting', title: TITLE, date: LBL[di], yr: 2026, allday: false, s: 840, e: 900, remarks: 'Bring your kit' }), ...over })
const file = (ppl: string[], di = WED, oil?: Record<string, number>, over: any = {}) => expect(commitInput(null, DRAFT(di, over), ppl, oil ? { oil } : undefined), 'filed').toBe(true)
/* the board's own buttons, as a scheduler presses them */
const press = (data: Record<string, string>) => { const b = document.createElement('button'); b.className = 'mbtn'; Object.assign(b.dataset, data); document.body.appendChild(b); boardMbtn({ target: b } as any); b.remove() }
const cx = (di = WED, reason = 'WX') => { setBoardDay(di); press({ grcx: `${di}.${riOf(di)}` }); expect(CXT, 'the reason is asked').toBeTruthy(); cxCommit(true, reason) }
const uncx = (di = WED) => { setBoardDay(di); press({ grcx: `${di}.${riOf(di)}` }); cxCommit(false, '') }
const redBox = (di = WED) => { setBoardDay(di); press({ grflag: `${di}.${riOf(di)}` }) }
const infoOnly = (di = WED) => { setBoardDay(di); press({ grinfo: `${di}.${riOf(di)}` }) }
const rowX = (di = WED) => { setBoardDay(di); press({ grdel: `${di}.${riOf(di)}` }) }
const marks = (x: any) => ({ cx: !!x.cx, cxr: x.cx ? String(x.cxr || '') : '', flag: !!x.flag, info: !!x.info })
const NONE = { cx: false, cxr: '', flag: false, info: false }
/* the four sign-offs, made as the app makes them (publish.ts setSign — it records what was signed FOR, which is what
   "sign again" is measured against; a bare write to the record would read as never signed) */
const sign = (di: number) => schedWrite(SCHED_TYPES.mutate, () => {
  const sk = Object.keys(PEOPLE).filter(isScheduler)           // SKED CK, PLANNED BY and APPROVED BY are a scheduler's to sign
  expect(sk.length, 'the roster has schedulers to sign').toBeGreaterThanOrEqual(3)
  setSign(di, 'cur', 'ignite'); setSign(di, 'sked', sk[0]); setSign(di, 'plan', sk[1]); setSign(di, 'appr', sk[2])
  view.afterSchedMutate()
})
const publish = (di: number) => { sign(di); commitSetDayApproved(di, true) }
const republish = (di: number) => { sign(di); commitPublishALDay(di) }
/* THE count — and every reader of it agrees: the list's own length, the day head's number, the Amendments box */
const waiting = (di: number): number => {
  const n = dayPendingItems(di).length
  expect(dayShownPendCount(di), 'the day head reads the same list').toBe(n)
  expect(itemCounts(dayPendingItems(di)).total, 'the Amendments box').toBe(n)
  expect(n === 0, 'never zero while something would go out, never something while nothing would').toBe(dayDelta(di).length === 0)
  return n
}
/* what went OUT: the input's row on the day's latest published version */
const issued = (di: number) => { const s: any = daySnapOf(di, dayCurVer(di)); return (s.d.ground || []).find((g: any) => g && g.src === String(inpId(rec()))) }
const paid = (di: number) => Object.keys(oilEarnedWork(DAYS[di], oilEvidence(di))).sort()
/* who the OIL credit names — off the ISSUED version, which is what a published day's OIL comes from (D142) */
const issuedPaid = (di: number) => { const s: any = daySnapOf(di, dayCurVer(di)); return Object.keys(oilEarnedWork(s.d, oilEvidenceOf(di, s.d))).sort() }
const lastLine = () => ELOG.rows[ELOG.rows.length - 1]!

beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(new Date(2026, 5, 1, 9, 0, 0)); resetWorld(); SAID = []; HOOKS.toast = (m: any) => { SAID.push(String(m)) } })
afterEach(() => {
  HOOKS.toast = toast; HOOKS.oilEarningDay = earning; HOOKS.oilSentinel = sentinel; HOOKS.oilDayISO = dayISO
  _resetTimeline(); vi.useRealTimers(); resetWorld(); setSession(null); setMe(DEFAULT_ME); storeBackend.impl = null; document.body.innerHTML = ''
})

describe('the three marks on a row holding several people and ALL AVAIL (D760, D755)', () => {
  it('each is the INPUT\'s, each press one line of the change history and one Undo step — and nobody on the row moves', async () => {
    await boot()
    file(['bane', 'allavail', 'pike'])
    const steps = ELOG.rows.length
    cx(WED, 'WX'); redBox(); infoOnly()
    expect(marks(rec())).toEqual({ cx: true, cxr: 'WX', flag: true, info: true })
    expect(marks(rowOf()), 'the row says what its input says').toEqual({ cx: true, cxr: 'WX', flag: true, info: true })
    expect(idsOf(rec()).map(String), 'its people, the placeholder among them, untouched').toEqual(['bane', 'allavail', 'pike'])
    expect([rowOf().who, rowOf().more]).toEqual(['bane', ['allavail', 'pike']])
    expect(ELOG.rows.length, 'three presses, three lines').toBe(steps + 3)
    expect(ground().filter((g: any) => g && g.src === String(inpId(rec()))), 'ONE row').toHaveLength(1)
    expect(globalUndo().ok).toBe(true)
    expect(marks(rec()), 'the last press back').toEqual({ cx: true, cxr: 'WX', flag: true, info: false })
    expect(globalUndo().ok).toBe(true)
    expect(marks(rec())).toEqual({ cx: true, cxr: 'WX', flag: false, info: false })
    expect(globalUndo().ok).toBe(true)
    expect(marks(rec())).toEqual(NONE)
    expect(marks(rowOf()), 'and the row with it').toEqual(NONE)
    expect(globalRedo().ok).toBe(true); expect(globalRedo().ok).toBe(true); expect(globalRedo().ok).toBe(true)
    expect(marks(rec()), 'Redo, three times').toEqual({ cx: true, cxr: 'WX', flag: true, info: true })
    expect(marks(rowOf())).toEqual({ cx: true, cxr: 'WX', flag: true, info: true })
    expect(idsOf(rec()).map(String)).toEqual(['bane', 'allavail', 'pike'])
  })

  it('a CX pressed on ANY place of the row is the same act: there is one button a row, and no puck of it is cancelled apart (D735)', async () => {
    await boot()
    file(['bane', 'allavail', 'pike'])
    expect(rowMark(`${rowKey()}.x0`, 'cx', true, 'WX'), 'asked by the placeholder\'s own place').toBe('done')
    expect(marks(rec()), 'the INPUT is cancelled — for everyone on it').toEqual({ cx: true, cxr: 'WX', flag: false, info: false })
    expect(idsOf(rec()).map(String)).toEqual(['bane', 'allavail', 'pike'])
  })
})

describe('a cancelled input stays cancelled as its people change (D760 — the CX is the input\'s, not a person\'s)', () => {
  it('a person added on the row, ALL AVAIL added, a person taken out: still cancelled, with its reason, on the same one row', async () => {
    await boot()
    file(['bane'])
    cx(WED, 'WX'); redBox()
    const rid = rowOf().rid
    const still = { cx: true, cxr: 'WX', flag: true, info: false }
    expect(rowPut(`${rowKey()}.+`, 'pike'), 'a person put on the cancelled row').toBe('done')
    expect([marks(rec()), marks(rowOf())]).toEqual([still, still])
    expect(rowPut(`${rowKey()}.+`, 'allavail'), 'ALL AVAIL put on it').toBe('done')
    expect([marks(rec()), marks(rowOf())]).toEqual([still, still])
    expect(onRow()).toEqual(['bane', 'pike', 'allavail'])
    expect(rowTake(keyOf('pike')), 'a person taken out').toBe('done')
    expect([marks(rec()), marks(rowOf())]).toEqual([still, still])
    expect(rowTake(keyOf('bane')), 'the first to join taken out: ALL AVAIL holds the name box').toBe('done')
    expect(onRow()).toEqual(['allavail'])
    expect([marks(rec()), marks(rowOf())], 'the CX did not go with the man').toEqual([still, still])
    expect(rowOf().rid, 'the same row throughout').toBe(rid)
  })

  it('the only person SWAPPED for another: the input is the new person\'s — and still cancelled, its red box with it', async () => {
    await boot()
    file(['bane'])
    cx(WED, 'WX'); redBox()
    expect(rowPut(rowKey(), 'pike'), 'dropped on the only person\'s puck').toBe('done')
    expect(idsOf(rec()).map(String), 'he replaces him (D755 (2))').toEqual(['pike'])
    expect(marks(rec()), 'the marks are the input\'s: the swap leaves them').toEqual({ cx: true, cxr: 'WX', flag: true, info: false })
    expect(marks(rowOf())).toEqual({ cx: true, cxr: 'WX', flag: true, info: false })
  })

  it('a time typed on the cancelled row re-times the input — and it is still cancelled', async () => {
    await boot()
    file(['bane', 'pike'])
    cx(WED, 'WX')
    expect(reqRowText(`gr:${WED}.${riOf()}.str`, '1330')).toBe('saved')
    expect([rec().s, rowOf().str]).toEqual([13 * 60 + 30, '13:30'])
    expect([marks(rec()).cx, marks(rowOf()).cx, rowOf().cxr]).toEqual([true, true, 'WX'])
  })
})

describe('a published day: cancelled, republished, brought back — the count each time, and what went out is kept (D736, D98, D178, D103)', () => {
  it('cancel — 1, and sign-offs already given fall; republish — 0, the issued row cancelled with its reason; bring back — 1, the issued face still cancelled; republish — 0', async () => {
    await boot()
    file(['bane', 'pike'])
    publish(WED)
    expect(waiting(WED), 'published clean').toBe(0)
    /* the four sign the day for its next version; a CX made AFTER they signed is a change they did not sign for */
    sign(WED)
    expect(daySigned(WED), 'the control: signed').toBe(true)
    cx(WED, 'WX')
    expect(waiting(WED), 'ONE — the input, not the input and its row').toBe(1)
    expect(daySigned(WED), 'something is waiting that was not signed for: sign again (D103)').toBe(false)
    expect(marks(issued(WED)), 'the issued face keeps what it went out with (D178)').toEqual(NONE)
    republish(WED)
    expect(waiting(WED), 'gone out').toBe(0)
    expect(marks(issued(WED)), 'the amendment carries the CX and its reason').toEqual({ cx: true, cxr: 'WX', flag: false, info: false })
    sign(WED)
    expect(daySigned(WED)).toBe(true)
    uncx(WED)
    expect(marks(rec()).cx).toBe(false)
    expect(waiting(WED), 'un-cancelled against a version that went out cancelled: ONE').toBe(1)
    expect(daySigned(WED), 'taking the CX off falls the sign-offs too').toBe(false)
    expect(marks(issued(WED)), 'the issued face is still the cancelled one').toEqual({ cx: true, cxr: 'WX', flag: false, info: false })
    republish(WED)
    expect(waiting(WED)).toBe(0)
    expect(marks(issued(WED))).toEqual(NONE)
  })

  it('back to what was published is nothing waiting (D98): cancelled again with the SAME reason — 0; with ANOTHER reason — 1', async () => {
    await boot()
    file(['bane'])
    cx(WED, 'WX')
    publish(WED)
    expect(waiting(WED), 'published cancelled').toBe(0)
    uncx(WED)
    expect(waiting(WED)).toBe(1)
    cx(WED, 'WX')
    expect(waiting(WED), 'as it went out').toBe(0)
    cx(WED, 'Range closed')
    expect(waiting(WED), 'the reason is part of what it says').toBe(1)
    cx(WED, 'WX')
    expect(waiting(WED)).toBe(0)
  })

  it('cancelled AND re-timed is still ONE (one input, one item); cancelled and a person added is TWO (D736 — a person is one each)', async () => {
    await boot()
    file(['bane', 'pike'])
    publish(WED)
    cx(WED, 'WX')
    expect(reqRowText(`gr:${WED}.${riOf()}.str`, '1330')).toBe('saved')
    expect(waiting(WED), 'cancelled and re-timed').toBe(1)
    expect(rowPut(`${rowKey()}.+`, 'split')).toBe('done')
    expect(waiting(WED), '…and a person added').toBe(2)
  })

  it('the red box on a published day: ONE waiting and the sign-offs fall — the row\'s content moved, though what the input SAYS did not', async () => {
    await boot()
    file(['bane', 'allavail'])
    publish(WED)
    sign(WED)
    expect(daySigned(WED), 'the control: signed for the next version').toBe(true)
    redBox(WED)
    expect(waiting(WED)).toBe(1)
    expect(daySigned(WED), 'a change is waiting that was not signed for (D103)').toBe(false)
    expect(issued(WED).flag, 'the issued face has no red box').toBeFalsy()
    republish(WED)
    expect([waiting(WED), !!issued(WED).flag]).toEqual([0, true])
  })
})

describe('a cancelled input moved between days goes there cancelled, and each published day counts ONE (D760 — D468 as changed; D736)', () => {
  it('moved ONTO a published day: one waiting there — it arrives cancelled, with its reason and red box', async () => {
    await boot()
    file(['bane', 'pike'])
    cx(WED, 'WX'); redBox()
    publish(THU)
    expect(waiting(THU)).toBe(0)
    expect(commitInput(rec(), { ...draftOf(rec()), start: ISO[THU], end: ISO[THU] }, ['bane', 'pike'])).toBe(true)
    expect(riOf(WED), 'no row left on the old day').toBe(-1)
    expect(marks(rowOf(THU))).toEqual({ cx: true, cxr: 'WX', flag: true, info: false })
    expect(waiting(THU), 'an input filed onto the day: one').toBe(1)
  })

  it('moved OFF a published day it went out cancelled on: one waiting on the day it left, nothing left behind on it', async () => {
    await boot()
    file(['bane', 'pike'])
    cx(WED, 'WX')
    publish(WED)
    expect(commitInput(rec(), { ...draftOf(rec()), start: ISO[THU], end: ISO[THU] }, ['bane', 'pike'])).toBe(true)
    expect(riOf(WED)).toBe(-1)
    expect(waiting(WED), 'the input left the day: one').toBe(1)
    expect(marks(rowOf(THU)), 'and it is cancelled where it went').toEqual({ cx: true, cxr: 'WX', flag: false, info: false })
    /* brought back before the day is published again: nothing waiting (D98) */
    expect(commitInput(rec(), { ...draftOf(rec()), start: ISO[WED], end: ISO[WED] }, ['bane', 'pike'])).toBe(true)
    expect(marks(rowOf(WED))).toEqual({ cx: true, cxr: 'WX', flag: false, info: false })
    expect(waiting(WED)).toBe(0)
  })
})

describe('information only and OIL on a published Saturday (D760 reading 1; D142, D48)', () => {
  it('marked information only: ONE waiting; nobody earns on the working copy, and the PUBLISHED OIL stands until the day is published again', async () => {
    oilOn([SAT], ['stiff', 'plasma']); await boot()
    file(['bane', 'allavail'], SAT, { [ISO[SAT] as string]: 0.5 })
    publish(SAT)
    expect(issuedPaid(SAT), 'the control: it went out earning — its person and the men behind ALL AVAIL').toEqual(['bane', 'plasma', 'stiff'])
    infoOnly(SAT)
    expect(waiting(SAT), 'one — the input; "what this day earns" rides on it, not beside it').toBe(1)
    expect(paid(SAT), 'the working copy: nobody earns').toEqual([])
    expect(issuedPaid(SAT), 'what went out still earns (D142: a day\'s OIL comes from its latest PUBLISHED version)').toEqual(['bane', 'plasma', 'stiff'])
    republish(SAT)
    expect(waiting(SAT)).toBe(0)
    expect(issuedPaid(SAT), 'published information-only: nobody').toEqual([])
    infoOnly(SAT)
    expect(waiting(SAT), 'the mark taken off: one').toBe(1)
    expect(paid(SAT), 'and everyone would earn again').toEqual(['bane', 'plasma', 'stiff'])
    expect(issuedPaid(SAT), 'but not until it goes out').toEqual([])
  })
})

/* A PRODUCT FAULT, REPORTED — this case FAILS on the build as it stands (step 4, 12 Oct 26) and is left failing for the
   builder. D760 reading 1: "a cancelled input earns nobody OIL … taking the CX off brings it back". The CX is the
   input's, so it must hold wherever the input is filed. The steps, all a scheduler's own buttons: cancel a weekend
   Duty on its row; ✕ the row (the input is off the programme, still cancelled — the plan §4.4); on its line under
   Personal Inputs press "→ Unavail". The input now sits on the Unavailable list, cancelled — and it EARNS again:
   engine/oilev.ts landedStanding answers 'unlanded' for a request filed under Unavailable BEFORE it looks at the
   input's own CX, and an unlanded request stands on its own answer. Nothing on the Unavailable list shows the CX or
   can take it off. (The engine-level twin is in engine/oilev.test.ts.) */
describe('a cancelled input earns nobody OIL wherever it is filed (D760 reading 1)', () => {
  it('cancelled on its row, taken off with ✕ and filed under Unavailable: still nobody earns — on the working copy and once published', async () => {
    oilOn([SAT]); await boot()
    file(['bane'], SAT, { [ISO[SAT] as string]: 0.5 })
    expect(paid(SAT), 'the control: it earns').toEqual(['bane'])
    cx(SAT, 'WX')
    expect(paid(SAT), 'cancelled').toEqual([])
    rowX(SAT)
    expect([rec().acc, marks(rec()).cx], 'off the programme, still cancelled').toEqual(['r', true])
    expect(paid(SAT), 'off the programme').toEqual([])
    schedWrite(SCHED_TYPES.mutate, () => { expect(acceptInput(SAT, rec(), 'u'), '→ Unavail').toBe(true); view.afterSchedMutate() })
    expect([rec().acc, marks(rec()).cx], 'under Unavailable, and the input is still cancelled').toEqual(['u', true])
    expect(paid(SAT), 'a cancelled input earns nobody').toEqual([])
    publish(SAT)
    expect(issuedPaid(SAT), 'nor on the published day').toEqual([])
  })
})

describe('a version loaded, a saved plan switched in: the row is re-made from the LIVE input — a load never changes an input (D363, D175, D98; the plan §4.8)', () => {
  const load = (di: number) => schedWrite(SCHED_TYPES.mutate, () => { loadVersionToWorkingCopy(di, dayCurVer(di)); view.afterSchedMutate() })
  it('the issued version (not cancelled) loaded over an input cancelled since: the input is still cancelled, so is its row — one waiting, none discarded', async () => {
    await boot()
    file(['bane', 'pike'])
    publish(WED)
    cx(WED, 'WX'); redBox(WED)
    expect(waiting(WED)).toBe(1)
    expect(dayDiscardCount(WED), '"Discard" promises nothing a load cannot do').toBe(0)
    load(WED)
    expect(marks(rec()), 'the load did not touch the input').toEqual({ cx: true, cxr: 'WX', flag: true, info: false })
    expect(marks(rowOf()), 'and its row is the copy of it').toEqual({ cx: true, cxr: 'WX', flag: true, info: false })
    expect(ground().filter((g: any) => g && g.src === String(inpId(rec()))), 'one row').toHaveLength(1)
    expect(waiting(WED), 'still waiting to go out').toBe(1)
  })

  it('a version that went out CANCELLED loaded over an input brought back since: still not cancelled — one waiting', async () => {
    await boot()
    file(['bane', 'pike'])
    cx(WED, 'WX')
    publish(WED)
    uncx(WED)
    expect(waiting(WED)).toBe(1)
    load(WED)
    expect(marks(rec()).cx, 'the load did not cancel it again').toBe(false)
    expect(marks(rowOf())).toEqual(NONE)
    expect(waiting(WED)).toBe(1)
  })

  it('a saved plan parked before the CX, switched in after it: its row comes in cancelled — the plan holds the day, the input holds the mark', async () => {
    await boot()
    file(['bane', 'allavail'])
    schedWrite(SCHED_TYPES.mutate, () => { draftDup(WED); view.afterSchedMutate() })      // the plan as it was, parked
    const parked = dayDrafts(WED).find((x: any) => x.id !== curDraftId(WED))
    expect(parked, 'a second plan, parked').toBeTruthy()
    expect((parked.d.ground || []).filter((g: any) => g && g.src === String(inpId(rec())) && !g.cx), 'it holds the row, not cancelled').toHaveLength(1)
    cx(WED, 'WX'); infoOnly()
    expect((parked.d.ground || []).some((g: any) => g && g.src === String(inpId(rec())) && g.cx), 'the parked copy itself was not written').toBe(false)
    let switched: any = null
    schedWrite(SCHED_TYPES.mutate, () => { switched = draftSelect(WED, parked.id); view.afterSchedMutate() })
    expect(switched, 'the plan is switched in').toBeTruthy()
    expect(curDraftId(WED)).toBe(parked.id)
    expect(marks(rec()), 'the switch did not touch the input').toEqual({ cx: true, cxr: 'WX', flag: false, info: true })
    expect(marks(rowOf()), 'and the plan\'s row is re-made from it').toEqual({ cx: true, cxr: 'WX', flag: false, info: true })
    expect(onRow()).toEqual(['bane', 'allavail'])
  })
})

describe('a member\'s own cancelled input (D760 reading 2; D763)', () => {
  it('he may re-time it, move it to another day and take himself out of a shared one — the marks ride along; he may delete his own', async () => {
    await boot()
    member('bane'); file(['bane']); admin()
    cx(WED, 'WX'); redBox(); infoOnly()
    const all = { cx: true, cxr: 'WX', flag: true, info: true }
    member('bane')
    expect(commitInput(rec(), { ...draftOf(rec()), sTime: '15:00', eTime: '16:00' }, ['bane']), 'his own re-time').toBe(true)
    expect(rec().s).toBe(15 * 60)
    expect([marks(rec()), marks(rowOf())]).toEqual([all, all])
    expect(commitInput(rec(), { ...draftOf(rec()), start: ISO[THU], end: ISO[THU] }, ['bane']), 'his own move to Thursday').toBe(true)
    expect(riOf(WED)).toBe(-1)
    expect([marks(rec()), marks(rowOf(THU))], 'it arrives as the scheduler marked it').toEqual([all, all])
    expect(removeInput(rec()), 'and he may delete it').toBe(true)
    expect(recs()).toHaveLength(0)
    expect(ground(THU).some((g: any) => g && g.prog === TITLE.toUpperCase()), 'its row goes with it').toBe(false)
  })

  it('a person in a cancelled input someone else filed takes himself out: allowed, and it stays cancelled for the others', async () => {
    await boot()
    file(['pike', 'bane', 'split'])                          // filed by Saber, the scheduler
    cx(WED, 'WX')
    member('bane')
    expect(commitInput(rec(), draftOf(rec()), ['pike', 'split']), 'Ranger takes himself out').toBe(true)
    expect(idsOf(rec()).map(String)).toEqual(['pike', 'split'])
    expect([marks(rec()), marks(rowOf())]).toEqual([{ cx: true, cxr: 'WX', flag: false, info: false }, { cx: true, cxr: 'WX', flag: false, info: false }])
  })

  it('he can take NO mark off, and change no reason — by the door or behind it', async () => {
    await boot()
    member('bane'); file(['bane']); admin()
    cx(WED, 'WX'); redBox(); infoOnly()
    member('bane')
    const was = JSON.stringify(INPUTS)
    expect(rowMark(rowKey(), 'cx', false), 'un-cancel').toBe('refused')
    expect(rowMark(rowKey(), 'cx', true, 'I am coming anyway'), 'another reason').toBe('refused')
    expect(rowMark(rowKey(), 'flag', false)).toBe('refused')
    expect(rowMark(rowKey(), 'info', false)).toBe('refused')
    for (const set of [(r: any) => { r.cx = false; delete r.cxr }, (r: any) => { r.cxr = 'I am coming anyway' }, (r: any) => { delete r.flag }, (r: any) => { delete r.info }]) {
      const out = saveBatchX(() => { set(rec()); return true })
      expect(out.ok, 'refused at the save').toBe(false)
      expect(JSON.stringify(INPUTS), 'and nothing kept').toBe(was)
    }
  })
})

describe('whose Undo may touch a mark (D148; D760 reading 2)', () => {
  it('the red box: Undo takes it off, Redo puts it back — the input and its row together', async () => {
    await boot()
    file(['bane', 'pike'])
    redBox()
    expect(globalUndo().ok).toBe(true)
    expect([marks(rec()).flag, marks(rowOf()).flag]).toEqual([false, false])
    expect(globalRedo().ok).toBe(true)
    expect([marks(rec()).flag, marks(rowOf()).flag]).toEqual([true, true])
  })

  it('a MEMBER\'s Undo of his own change never takes a scheduler\'s CX off: the scheduler cancelled it since, so his Undo is refused and the input stays cancelled', async () => {
    await boot()
    member('bane'); file(['bane'])
    expect(commitInput(rec(), { ...draftOf(rec()), remarks: 'I will bring the card' }, ['bane'])).toBe(true)
    asOther(admin, () => { expect(rowMark(rowKey(), 'cx', true, 'WX'), 'Saber cancels it, from another device').toBe('done') })
    const u = globalUndo()
    expect(marks(rec()), 'whatever his Undo did, the scheduler\'s mark stands').toEqual({ cx: true, cxr: 'WX', flag: false, info: false })
    expect(marks(rowOf()).cx).toBe(true)
    expect(u.ok, 'and it did nothing: someone has since changed the same input (D148)').toBe(false)
    expect(rec().remarks).toBe('I will bring the card')
  })

  it('a SCHEDULER\'s Undo of his CX never throws away what the member changed since: refused, both changes stand', async () => {
    await boot()
    asOther(() => member('bane'), () => file(['bane']))
    cx(WED, 'WX')
    asOther(() => member('bane'), () => { expect(commitInput(rec(), { ...draftOf(rec()), remarks: 'Understood' }, ['bane'])).toBe(true) })
    const u = globalUndo()
    expect(rec().remarks, 'the member\'s remark is not lost').toBe('Understood')
    expect(u.ok, 'refused (D148)').toBe(false)
    expect(marks(rec()).cx, 'so the CX stands — he takes it off with the button').toBe(true)
  })
})

describe('the change history\'s line for each mark (the plan §4.4 — one line of the change history per thing that changed)', () => {
  it('CX on, its reason changed, CX off; the red box; information only — one line each, the input\'s own, in plain words', async () => {
    await boot()
    file(['bane', 'allavail', 'pike'])
    let n = ELOG.rows.length
    const one = (what: string) => { expect(ELOG.rows.length, `${what}: ONE line`).toBe(n + 1); n = ELOG.rows.length; return lastLine() }
    cx(WED, 'WX')
    let l = one('CX')
    expect(l.lbl).toMatch(/ · CX$/)
    expect([l.from, l.to]).toEqual(['not cancelled', 'cancelled — WX'])
    cx(WED, 'Range closed')
    l = one('the reason changed')
    expect([l.from, l.to]).toEqual(['cancelled — WX', 'cancelled — Range closed'])
    uncx(WED)
    l = one('un-cancelled')
    expect([l.from, l.to]).toEqual(['cancelled — Range closed', 'not cancelled'])
    redBox()
    l = one('the red box')
    expect(l.lbl).toMatch(/ · red box$/)
    expect([l.from, l.to]).toEqual(['off', 'on'])
    infoOnly()
    l = one('information only')
    expect(l.lbl).toMatch(/ · information only$/)
    expect([l.from, l.to]).toEqual(['no', 'yes'])
    infoOnly(); redBox()
    expect(ELOG.rows.length, 'each taken off: a line each').toBe(n + 2)
    for (const r of ELOG.rows.slice(-7)) {
      expect(`${r.lbl}|${r.from}|${r.to}`, 'no stray word in any of them').not.toMatch(/undefined|null|\[object|NaN/)
      expect(r.lbl, 'the line names the input by what it is').toContain(TITLE)
    }
  })

  it('a CX with no reason given reads "cancelled", never a dangling dash', async () => {
    await boot()
    file(['bane'])
    expect(rowMark(rowKey(), 'cx', true, ''), 'no reason typed').toBe('done')
    expect([lastLine().from, lastLine().to]).toEqual(['not cancelled', 'cancelled'])
    expect([rec().cx, rowOf().cx]).toEqual([true, true])
  })
})

describe('the row\'s ✕ on a cancelled row (D114; the plan §4.4 — "its people and marks stay IN the input")', () => {
  it('✕ takes the input off the programme, cancelled as it is; Undo brings the very row back cancelled; Accept does too', async () => {
    await boot()
    file(['bane', 'allavail'])
    cx(WED, 'WX'); infoOnly()
    const rid = rowOf().rid
    rowX()
    expect([rec().acc, riOf()], 'off the programme').toEqual(['r', -1])
    expect(marks(rec()), 'its marks stay in the input').toEqual({ cx: true, cxr: 'WX', flag: false, info: true })
    expect(globalUndo().ok).toBe(true)
    expect([rowOf().rid, marks(rowOf())], 'Undo: the very row, as it was').toEqual([rid, { cx: true, cxr: 'WX', flag: false, info: true }])
    rowX()
    schedWrite(SCHED_TYPES.mutate, () => { expect(acceptInput(WED, rec(), 'g')).toBe(true); view.afterSchedMutate() })
    expect(marks(rowOf()), 'Accept: made from the input, cancelled').toEqual({ cx: true, cxr: 'WX', flag: false, info: true })
    expect(onRow()).toEqual(['bane', 'allavail'])
  })

  it('on a published day: cancelled and then ✕ is ONE waiting, never two; a row that went out cancelled, ✕ and accepted again — nothing waiting', async () => {
    await boot()
    file(['bane', 'pike'])
    publish(WED)
    cx(WED, 'WX')
    expect(waiting(WED)).toBe(1)
    rowX(WED)
    expect(waiting(WED), 'one input, one line').toBe(1)
    expect(globalUndo().ok).toBe(true)                        // the ✕ back
    republish(WED)                                           // …and out it goes, cancelled
    expect(waiting(WED)).toBe(0)
    rowX(WED)
    expect(waiting(WED), 'taken off: one').toBe(1)
    schedWrite(SCHED_TYPES.mutate, () => { expect(acceptInput(WED, rec(), 'g')).toBe(true); view.afterSchedMutate() })
    expect(marks(rowOf())).toEqual({ cx: true, cxr: 'WX', flag: false, info: false })
    expect(waiting(WED), 'back as it went out (D98)').toBe(0)
  })
})

describe('the mark is made on the schedule, so nobody reads LATE for it (D741, D742)', () => {
  it('a CX, a red box and information-only put on an on-time input after its cut-off leave it on time — where the member\'s own change then does make it late', async () => {
    await boot()
    member('bane'); file(['bane'])                           // filed on 1 Jun: on time for 15 Jul
    expect(isLateInput(rec())).toBe(false)
    vi.setSystemTime(new Date(2026, 6, 14, 9, 0, 0))         // the day before: long past any cut-off
    admin()
    cx(WED, 'WX'); redBox(); infoOnly()
    expect(marks(rec())).toEqual({ cx: true, cxr: 'WX', flag: true, info: true })
    expect(isLateInput(rec()), 'the scheduler\'s marks do not make the member\'s input late').toBe(false)
    uncx(WED); redBox(); infoOnly()
    expect(isLateInput(rec()), 'nor does taking them off').toBe(false)
    /* the control: the same day, the member's own change in the input's window IS late */
    member('bane')
    expect(commitInput(rec(), { ...draftOf(rec()), remarks: 'changed the day before' }, ['bane'])).toBe(true)
    expect(isLateInput(rec()), 'the control').toBe(true)
  })
})

describe('a cancelled input is not checked against the rules — an ALL-DAY one too, which speaks for itself, not through its row (D760 reading 1)', () => {
  it('an all-day Training for a person who flies that day is flagged; cancelled — silent; brought back — flagged; information only — silent', async () => {
    await boot()
    const flyer = String((DAYS[WED] as any).waves[0].formations[0].aircraft[0].p)
    const flags = () => { validate(); return ((WARN as any).all as any[]).filter(w => w && w.di === WED && (w.who || []).map(String).includes(flyer)).map(w => String(w.code)).sort() }
    const base = flags()
    expect(commitInput(null, DRAFT(WED, { allday: true }), [flyer]), 'filed all day').toBe(true)
    const withIt = flags()
    expect(withIt.length, 'the control: the all-day input IS flagged against his flying').toBeGreaterThan(base.length)
    cx(WED, 'WX')
    expect(flags(), 'cancelled: as if it were not there').toEqual(base)
    uncx(WED)
    expect(flags(), 'brought back').toEqual(withIt)
    infoOnly(WED)
    expect(flags(), 'information only').toEqual(base)
  })
})

describe('…nor on the PUBLISHED face, nor from another week (D760 reading 1 — "not checked against the rules, as a cancelled row today")', () => {
  const flyerOf = (di: number) => String((DAYS[di] as any).waves[0].formations[0].aircraft[0].p)
  it('published CANCELLED: the published day\'s own warnings do not flag it either; published and cancelled since: the published face keeps the flag it went out with (D179)', async () => {
    await boot()
    const flyer = flyerOf(WED)
    const official = () => { validate(); return ((officialWarn() as any).all as any[]).filter(w => w && w.di === WED && (w.who || []).map(String).includes(flyer)).map(w => String(w.code)).sort() }
    const working = () => { validate(); return ((WARN as any).all as any[]).filter(w => w && w.di === WED && (w.who || []).map(String).includes(flyer)).map(w => String(w.code)).sort() }
    const base = working()
    expect(commitInput(null, DRAFT(WED, { allday: true }), [flyer])).toBe(true)
    const withIt = working()
    expect(withIt.length, 'the control: flagged while it stands').toBeGreaterThan(base.length)
    publish(WED)
    expect(official(), 'the control: the published face flags it as the working copy does').toEqual(withIt)
    cx(WED, 'WX')
    expect(working(), 'cancelled on the working copy: silent').toEqual(base)
    expect(official(), 'the published face keeps what it went out with until the next amendment').toEqual(withIt)
    republish(WED)
    expect(official(), 'published cancelled: the published face is silent too').toEqual(base)
  })

  /* A PRODUCT FAULT, REPORTED — this case FAILS on the build as it stands (step 4, 12 Oct 26) and is left failing for
     the builder. The count of days worked walking INTO a week (engine/weekctx.ts workedSet, which feeds the seven-day
     run warning) adds every person of an activity input on a day of the week before, unless the input is off the
     programme — it does not ask whether the input is CANCELLED. Until this step it could not: the CX was the row's.
     The CX is the input's now (D760), and reading 1 says a cancelled input "is not checked against the rules"; the
     function's own comment says "a cancelled/unlanded activity must never be counted off its input". So a Sunday
     Training the scheduler cancelled still counts as a day the man worked when next week is on screen. */
  it('a cancelled input on the Sunday before does not count as a day worked when next week is opened — the seven-day run starts fresh', async () => {
    const SUN = 6, W2 = '20/07/2026'
    await boot()
    const idle = Object.keys(PEOPLE).find(id => PEOPLE[id] && !JSON.stringify(DAYS[SUN]).includes(`"${id}"`) && !['allavail', 'all'].includes(id))!
    expect(idle, 'someone with nothing on the Sunday').toBeTruthy()
    /* read as the app reads it: with NEXT week on screen, this week behind it */
    const run = () => { loadWeek(W2); const n = (seedRunIn(W2, VCONF.maxRun) as any)[idle] || 0; loadWeek(W1); return n }
    expect(run(), 'the control: he walks into next week with no run').toBe(0)
    expect(commitInput(null, DRAFT(SUN, { allday: true }), [idle])).toBe(true)
    expect(run(), 'the control: the Sunday input is a day worked').toBe(1)
    cx(SUN, 'WX')
    expect(marks(rowOf(SUN)).cx, 'cancelled, on the Sunday').toBe(true)
    expect(run(), 'cancelled: it did not happen').toBe(0)
    uncx(SUN)
    expect(run(), 'brought back: a day worked again').toBe(1)
  })

  /* A PRODUCT FAULT, REPORTED — this case FAILS on the build as it stands (step 4, 12 Oct 26) and is left failing for
     the builder. The same gap as the case above, in the other reader that looks across the week boundary: Monday's
     crew rest is worked out against the Sunday before, and that read takes a Sunday input as it is filed
     (engine/events.ts — the cross-week read answers before `inputFlags`, the one place that asks "cancelled or
     information only?"). So a late Sunday input the scheduler CANCELLED still raises the red crew-rest warning on the
     man's early Monday. D760 reading 1: a cancelled input "is not checked against the rules". */
  it('a late Sunday input cancelled on its row does not break crew rest for an early Monday next week', async () => {
    const SUN = 6, W2 = '20/07/2026'
    await boot()
    const idle = Object.keys(PEOPLE).find(id => PEOPLE[id] && !JSON.stringify(DAYS[SUN]).includes(`"${id}"`) && !['allavail', 'all'].includes(id))!
    /* his early Monday next week: a scheduler's own ground row */
    loadWeek(W2)
    schedWrite(SCHED_TYPES.mutate, () => { (DAYS[0] as any).ground = ((DAYS[0] as any).ground || []).concat([{ prog: 'EARLY BRIEF', str: '05:00', end: '06:00', who: idle, rmks: '' }]); ensureRowIds(DAYS); view.afterSchedMutate() })
    const monday = () => { loadWeek(W2); validate(); const c = ((WARN as any).all as any[]).filter(w => w && w.di === 0 && (w.who || []).map(String).includes(idle)).map(w => String(w.code)).sort(); loadWeek(W1); return c }
    const base = monday()
    expect(commitInput(null, DRAFT(SUN, { sTime: '21:00', eTime: '23:30' }), [idle]), 'a late Sunday Duty').toBe(true)
    const withIt = monday()
    expect(withIt.length, 'the control: the late Sunday breaks his rest before the early Monday').toBeGreaterThan(base.length)
    cx(SUN, 'WX')
    expect(monday(), 'cancelled: Monday is as if the Sunday input were not there').toEqual(base)
    uncx(SUN)
    expect(monday(), 'brought back').toEqual(withIt)
  })
})

describe('the marks are saved with the input and follow it across weeks (D760 — "it goes with the input if it moves")', () => {
  const W2 = '20/07/2026'
  it('another week opened and this one opened again: the row is back cancelled, red-boxed — one row', async () => {
    await boot()
    file(['bane', 'pike'])
    cx(WED, 'WX'); redBox()
    loadWeek(W2); loadWeek(W1)
    expect(ground().filter((g: any) => g && g.src === String(inpId(rec())))).toHaveLength(1)
    expect([marks(rec()), marks(rowOf())]).toEqual([{ cx: true, cxr: 'WX', flag: true, info: false }, { cx: true, cxr: 'WX', flag: true, info: false }])
  })

  it('moved to a day of NEXT week: nothing of it is left on this week, and it lands there cancelled when that week is opened', async () => {
    await boot()
    file(['bane', 'pike'])
    cx(WED, 'WX'); redBox()
    expect(commitInput(rec(), { ...draftOf(rec()), start: '2026-07-22', end: '2026-07-22' }, ['bane', 'pike'])).toBe(true)
    expect(riOf(WED), 'gone from this week').toBe(-1)
    expect(marks(rec()), 'the input carries its marks away with it').toEqual({ cx: true, cxr: 'WX', flag: true, info: false })
    loadWeek(W2)
    expect(riOf(WED), 'on next week\'s Wednesday').toBeGreaterThanOrEqual(0)
    expect(marks(rowOf(WED))).toEqual({ cx: true, cxr: 'WX', flag: true, info: false })
    expect([rowOf(WED).who, rowOf(WED).more]).toEqual(['bane', ['pike']])
  })
})

describe('OIL Earn on a cancelled input\'s row: no switch that earns, and the reason said (D760 reading 1; D31)', () => {
  it('each person\'s puck is inert while it is cancelled, and says so; brought back, each is a switch again', async () => {
    oilOn([SAT]); await boot()
    file(['bane', 'pike'], SAT, { [ISO[SAT] as string]: 0.5 })
    setBoardDay(SAT); setOilDay(SAT)
    const row = () => { const d = document.createElement('div'); d.innerHTML = boardHTML(SAT); return [...d.querySelectorAll('.sb-panel.grnd .sb-arow')].find(r => r.outerHTML.includes(TITLE.toUpperCase())) as HTMLElement }
    expect([...row().querySelectorAll('[data-oilp]')].map(t => (t as HTMLElement).dataset.oilp).sort(), 'the control: a switch a person').toEqual(['bane', 'pike'])
    cx(SAT, 'WX'); setOilDay(SAT)
    expect(paid(SAT)).toEqual([])
    const r = row()
    expect(r.classList.contains('cx'), 'the row is drawn cancelled').toBe(true)
    expect(r.querySelectorAll('[data-oilp]'), 'no puck is a switch').toHaveLength(0)
    const inert = [...r.querySelectorAll('.oilpk.inert')] as HTMLElement[]
    expect(inert.length, 'both pucks are inert').toBe(2)
    for (const p of inert) expect(p.getAttribute('title') || '', 'and each says why').toMatch(/cancel/i)
    uncx(SAT); setOilDay(SAT)
    expect([...row().querySelectorAll('[data-oilp]')].map(t => (t as HTMLElement).dataset.oilp).sort(), 'brought back').toEqual(['bane', 'pike'])
    expect(paid(SAT)).toEqual(['bane', 'pike'])
  })
})

/* STEP 5 (12 Oct 26) — his look at the pictures, D767 reading 3: "the schedule's own line of a cancelled input under
   Personal Inputs wears the same red CX tag and struck-through name". Until this step that line showed nothing of the
   CX while the input's own row on the Ground Programme, two sections up, read "CX DUE WX" (the plan §10, step 4, "Not
   settled"). The week and the board each have a builder for it (ui/html.ts inGrp, ui/board-html.ts sbInpRow). */
describe('the schedule\'s own Personal Inputs line of a cancelled input (D767 reading 3; D760)', () => {
  const dom = (html: string) => { const d = document.createElement('div'); d.innerHTML = html; return d }
  const weekLine = (di = WED) => { view.PIOPEN.add(di); return [...dom(dayHTML(di, true)).querySelectorAll('.sec-inp .pl-row')].find(r => (r.textContent || '').includes(TITLE)) as HTMLElement }
  const boardLine = (di = WED) => { view.PIOPEN.add(di); setBoardDay(di); return [...dom(boardHTML(di)).querySelectorAll('.sb-panel.pinp .sb-arow')].find(r => r.outerHTML.includes(TITLE)) as HTMLElement }
  afterEach(() => { view.PIOPEN.clear() })

  it('on Edit Schedule\'s week: the red CX tag with its reason before the name, and the name struck through; brought back, neither', async () => {
    await boot()
    file(['bane', 'pike'])
    expect(weekLine(), 'the control: the line is drawn').toBeTruthy()
    expect(weekLine().querySelector('.cxtag'), 'the control: no tag on a live input').toBeNull()
    expect(weekLine().querySelector('.inp-cx')).toBeNull()
    cx(WED, 'WX')
    const line = weekLine()
    const tag = line.querySelector('.nm .cxtag') as HTMLElement
    expect(tag, 'the schedule\'s own tag, in the name\'s cell').toBeTruthy()
    expect(tag.textContent).toBe('CX DUE WX')
    const name = line.querySelector('.nm .inp-cx') as HTMLElement
    expect(name, 'the name is the struck one').toBeTruthy()
    expect(name.textContent).toBe(TITLE)
    expect(tag.compareDocumentPosition(name) & Node.DOCUMENT_POSITION_FOLLOWING, 'the tag leads').toBeTruthy()
    expect(line.querySelectorAll('.puck').length, 'its people are still on the line').toBe(2)
    uncx(WED)
    expect(weekLine().querySelector('.cxtag')).toBeNull()
    expect(weekLine().querySelector('.inp-cx')).toBeNull()
  })
  it('on the Scheduler Board: the same tag and struck name, inside the row\'s ONE item cell — its seven columns are not moved', async () => {
    await boot()
    file(['bane', 'pike'])
    const kids = (r: HTMLElement) => [...r.children].map(c => c.className.split(' ')[0])
    const before = kids(boardLine())
    expect(boardLine().querySelector('.cxtag')).toBeNull()
    cx(WED, 'WX')
    const line = boardLine()
    const tag = line.querySelector('.itemcell .cxtag') as HTMLElement
    expect(tag, 'the tag rides the item cell').toBeTruthy()
    expect(tag.textContent).toBe('CX DUE WX')
    expect(line.querySelector('.itemcell .inp-cx')!.textContent).toBe(TITLE)
    expect(kids(line).length, 'the row has as many columns as before').toBe(before.length)
    uncx(WED)
    expect(boardLine().querySelector('.cxtag')).toBeNull()
  })
  it('a cancelled input with no reason: the tag reads "CX"', async () => {
    await boot()
    file(['bane'])
    cx(WED, '')
    expect(weekLine().querySelector('.nm .cxtag')!.textContent).toBe('CX')
    expect(boardLine().querySelector('.itemcell .cxtag')!.textContent).toBe('CX')
  })
})

/* STEP 5 (12 Oct 26) — he asked whether a cancelled input still counts toward the seven-day run. Step 4 pinned the
   count walking INTO a week (the case "a cancelled input on the Sunday before…", above); this is the count INSIDE the
   week, from the day's own events (engine/validate.ts RUNLEN). D760 reading 1; the plan's R24. */
describe('a cancelled input is not a day worked INSIDE the week either (D760 reading 1 — the seven-day run)', () => {
  it('his only event of the day is the input: filed it is a day worked, cancelled it is not, brought back it is again', async () => {
    await boot()
    const idle = Object.keys(PEOPLE).find(id => PEOPLE[id] && !PEOPLE[id].special && !JSON.stringify(DAYS[WED]).includes(`"${id}"`) && !JSON.stringify(DAYS[WED - 1]).includes(`"${id}"`)
      && !INPUTS.some((r: any) => idsOf(r).includes(id)) && !['allavail', 'all'].includes(id))!
    expect(idle, 'someone with nothing on the Wednesday, nor the Tuesday before').toBeTruthy()
    const run = () => { validate(); return (RUNLEN[WED] || {})[idle] || 0 }
    expect(run(), 'the control: no run on the Wednesday').toBe(0)
    expect(commitInput(null, DRAFT(WED), [idle])).toBe(true)
    expect(run(), 'the control: the input makes it a day worked').toBe(1)
    cx(WED, 'WX')
    expect(run(), 'cancelled: it did not happen').toBe(0)
    uncx(WED)
    expect(run(), 'brought back: a day worked again').toBe(1)
  })
})
