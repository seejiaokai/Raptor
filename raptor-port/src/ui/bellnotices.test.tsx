// @vitest-environment jsdom
/* THE BELL TELLS HIM ([ALL-AVAIL-AS-MEMBER] step 7, 12 Oct 26 — `[INPUT-CHANGED-TELL]`; the plan
   docs/superpowers/plans/2026-10-11-one-rule-plan.md §4.10, its tests T18 and T19's bell half). His rulings:
   D755 (3) — "the member is told by his bell when the scheduler adds people to his request, swaps him out or changes it".
   D760 — a CX on an input's row cancels the input: "the member is told by his bell".
   D757 — the walk-through in words: "the member is told by his bell".
   D769 — the bell's list uses the SHORTER wording: the input first, in bold, with its date; then what happened and who;
           its age at the right; and a tap on the bell still goes straight to an OIL question, an access request or a
           bug report where one waits, opening the list only otherwise. "Mark all read" at its foot; "Nothing new".
   D148 — Undo reverses only the signed-in person's own changes, and refuses once someone has since changed the same
           thing: so READING a notice never writes to it (Fable F9) — read is each person's own record.
   D762, D711 — an unanswered OIL question still lights the filer's bell, and comes first.

   What is told (the plan's §4.10): every NAMED person in the input before or after the change, and whoever filed it —
   never whoever made the change, never the men behind ALL AVAIL. One notice a person an input a change, written INSIDE
   the command that made the change (state/sched-commit.ts applyEnd → state/notices.ts noticePass), so the maker's Undo
   takes it away with the change and nobody is told "it was undone" (R11).

   Driven through the app's own doors on a real saved store: the input's window (commitInput), the row's door
   (ui/reqdoor.ts), the board's CX button, the delete, the row's ✕. */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { INPUTS, inpId } from '../engine/inputs'
import { PEOPLE, ID_BY_CS, indexCallsigns } from '../engine/people'
import { DAYS } from '../engine/data'
import { CURWEEK } from '../engine/waves'
import { storeBackend, HOOKS } from '../engine/hooks'
import { stashClear } from '../engine/weekstash'
import { SCHED } from '../engine/publish'
import { PLANPUCKS, DAYRMK } from '../state/plan'
import { initStore, weekStashSnap, weekDirty, loadWeek, notify } from '../state/store'
import { setSession, setMe, DEFAULT_ME, SESSION, ME } from '../state/auth'
import { hydrate, wirePersist } from '../state/persist'
import { bootStorage } from '../storage/boot'
import { settingsAdapter } from '../storage/adapters'
import { MemoryBackend } from '../storage/memory'
import { SCHEMA_VERSION } from '../storage/reset'
import { globalUndo, globalRedo, undoState } from '../undo'
import { _resetTimeline } from '../undo/timeline'
import { installGlobalUndo } from '../state/undo-wire'
import { _resetDisclosure } from '../state/disclosure'
import { setPage, setBoardDay } from '../state/view'
import * as view from '../state/view'
import { ownershipViolation } from '../state/perms'
import { commitInput, draftOf, removeInput } from './inputedit'
import { rowPut, rowTake } from './reqdoor'
import { boardMbtn, cxCommit, CXT } from './board'
import * as pops from './pops'
import { useVersion } from './useStore'
import { NOTICES, noticesFor, noticeWords, noticeAge } from '../state/notices'
import { isUnread, unreadFor, markNoticeRead, markAllNoticesRead } from '../state/noticeseen'
import { bellOn, bellTap, bellListOpen, closeBellList, BellButton, BellList } from './topbits'
;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

const ISNAP = JSON.stringify(INPUTS)
const PSNAP = JSON.stringify(PEOPLE)
const DSNAP = JSON.stringify(DAYS)
const W1 = '13/07/2026'
const WED = 2, THU = 3, SAT = 5
const LBL = ['Jul 13', 'Jul 14', 'Jul 15', 'Jul 16', 'Jul 17', 'Jul 18', 'Jul 19']
const toast = HOOKS.toast
let SAID: string[] = []
let BE: MemoryBackend

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
  pops.setInpEdit(null); pops.setOilAsk(null); closeBellList()
  stashClear()
}
const SABER = 'stiff', RANGER = 'bane', HEX = 'rocky', PIKE = 'pike'
const admin = () => { setSession({ user: 'ad', role: 'admin', name: 'ad' }); setMe(SABER) }          // Saber, a scheduler
const member = (id = RANGER) => { setSession({ user: 'us', role: 'main', name: 'us' }); setMe(id) }
/* another person's command while the signed-in person stays signed in — what a second device's command is to this one
   (a sign-in or sign-out clears the Undo steps, D148) */
function asOther(who: () => void, fn: () => void): void {
  const s = SESSION, m = ME
  who()
  try { fn() } finally { setSession(s); setMe(m) }
}
async function boot(be?: MemoryBackend) {
  BE = be || new MemoryBackend()
  if (!be) BE.seed({ settings: { schema: JSON.stringify(SCHEMA_VERSION) } })
  const p = bootStorage(BE)
  await vi.advanceTimersByTimeAsync(BE.latency)
  const { wb } = await p
  storeBackend.impl = settingsAdapter(wb)
  hydrate(wb)
  initStore()
  wirePersist(wb, { weekSnap: weekStashSnap, weekDirty })
  _resetDisclosure()
  _resetTimeline(); installGlobalUndo()
  admin()
  setPage('editsched'); setBoardDay(WED)
  return wb
}

const TITLE = 'Range brief'
const cs = (id: string) => String(PEOPLE[id].cs)
const rec = (title = TITLE) => { const l = INPUTS.filter((x: any) => x.title === title) as any[]; expect(l, 'ONE record').toHaveLength(1); return l[0] }
const ground = (di = WED) => ((DAYS[di] as any).ground || []) as any[]
const riOf = (di = WED, title = TITLE) => ground(di).findIndex((g: any) => g && g.src === String(inpId(rec(title))))
const rowKey = (di = WED) => `g:${di}.${riOf(di)}`
const DRAFT = (di = WED, over: any = {}) => ({ ...draftOf({ person: RANGER, type: 'Training', title: TITLE, date: LBL[di], yr: 2026, allday: false, s: 540, e: 600, remarks: 'Bring your kit' }), ...over })
const file = (ppl: string[], di = WED, over: any = {}) => expect(commitInput(null, DRAFT(di, over), ppl), 'filed').toBe(true)
const press = (data: Record<string, string>) => { const b = document.createElement('button'); b.className = 'mbtn'; Object.assign(b.dataset, data); document.body.appendChild(b); boardMbtn({ target: b } as any); b.remove() }
const cx = (di = WED, reason = 'WX') => { setBoardDay(di); press({ grcx: `${di}.${riOf(di)}` }); expect(CXT, 'the reason is asked').toBeTruthy(); cxCommit(true, reason) }
const uncx = (di = WED) => { setBoardDay(di); press({ grcx: `${di}.${riOf(di)}` }); cxCommit(false, '') }
/* what one person's bell lists, newest first, as its words */
const told = (pid: string) => noticesFor(pid).map(n => { const w = noticeWords(n); return `${w.name} · ${w.day} — ${w.what}${w.who ? ' · ' + w.who : ''}` })
/* test-only: start a case's count from nothing. Never done by the app — and a list emptied outside a command is taken
   up by the NEXT command as its own removal, so a case that goes on to press Undo does not use it. */
const clear = () => { NOTICES.length = 0 }
const tick = (ms = 60_000) => vi.advanceTimersByTime(ms)

beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(new Date(2026, 5, 1, 9, 0, 0)); resetWorld(); SAID = []; HOOKS.toast = (m: any) => { SAID.push(String(m)) } })
afterEach(() => {
  HOOKS.toast = toast
  _resetTimeline(); vi.useRealTimers(); resetWorld(); setSession(null); setMe(DEFAULT_ME); storeBackend.impl = null; document.body.innerHTML = ''
})

describe('who is told, and in what words (D755 (3), D760, D769 — the plan §4.10)', () => {
  it('an input a scheduler files for two people: each is told he was added; the scheduler who filed it is told nothing', async () => {
    await boot()
    file([RANGER, HEX])
    expect(told(RANGER)).toEqual([`${TITLE} · Wed 15 Jul — You were added · ${cs(SABER)}`])
    expect(told(HEX)).toEqual([`${TITLE} · Wed 15 Jul — You were added · ${cs(SABER)}`])
    expect(told(SABER), 'never whoever made the change').toEqual([])
    expect(NOTICES).toHaveLength(2)
  })
  it('a man who files his OWN input tells nobody', async () => {
    await boot()
    member(RANGER)
    file([RANGER])
    expect(NOTICES).toHaveLength(0)
  })
  it('the scheduler puts Pike on the input\'s row on the schedule: Pike is told he was added; the two already in it are told "Pike added"', async () => {
    await boot()
    file([RANGER, HEX]); clear()
    expect(rowPut(`${rowKey()}.+`, PIKE)).toBe('done')
    expect(told(PIKE)).toEqual([`${TITLE} · Wed 15 Jul — You were added · ${cs(SABER)}`])
    expect(told(RANGER)).toEqual([`${TITLE} · Wed 15 Jul — ${cs(PIKE)} added · ${cs(SABER)}`])
    expect(told(HEX)).toEqual([`${TITLE} · Wed 15 Jul — ${cs(PIKE)} added · ${cs(SABER)}`])
  })
  it('the scheduler takes Hex off the row: Hex is told he was taken off; Ranger is told "Hex taken off"', async () => {
    await boot()
    file([RANGER, HEX]); clear()
    const r = rec(), row = ground()[riOf()]
    const key = row.who === HEX ? rowKey() : `${rowKey()}.x${(row.more || []).indexOf(HEX)}`
    expect(rowTake(key)).toBe('done')
    expect(r.people.map((e: any) => e.p)).toEqual([RANGER])
    expect(told(HEX)).toEqual([`${TITLE} · Wed 15 Jul — You were taken off · ${cs(SABER)}`])
    expect(told(RANGER)).toEqual([`${TITLE} · Wed 15 Jul — ${cs(HEX)} taken off · ${cs(SABER)}`])
  })
  it('ALL AVAIL dropped on the row: the people in it are told "ALL AVAIL added" — nobody behind the puck is told anything (D757)', async () => {
    await boot()
    file([RANGER]); clear()
    expect(rowPut(`${rowKey()}.+`, 'allavail')).toBe('done')
    expect(told(RANGER)).toEqual([`${TITLE} · Wed 15 Jul — ALL AVAIL added · ${cs(SABER)}`])
    expect(NOTICES.map(n => n.to), 'one notice, to the one named person').toEqual([RANGER])
  })
  it('D760: a CX on its row — everyone in it is told "Cancelled — WX"; brought back, "Un-cancelled"', async () => {
    await boot()
    file([RANGER, HEX]); clear()
    cx(WED, 'WX')
    expect(told(RANGER)).toEqual([`${TITLE} · Wed 15 Jul — Cancelled — WX · ${cs(SABER)}`])
    expect(told(HEX)).toEqual([`${TITLE} · Wed 15 Jul — Cancelled — WX · ${cs(SABER)}`])
    tick(); uncx(WED)
    expect(told(RANGER)[0]).toBe(`${TITLE} · Wed 15 Jul — Un-cancelled · ${cs(SABER)}`)
    expect(told(RANGER)).toHaveLength(2)
  })
  it('a CX with no reason reads "Cancelled"', async () => {
    await boot()
    file([RANGER]); clear()
    cx(WED, '')
    expect(told(RANGER)).toEqual([`${TITLE} · Wed 15 Jul — Cancelled · ${cs(SABER)}`])
  })
  it('re-timed in its window: "Now 10:00–11:00"; moved to another day: "Now Thu 16 Jul", the line dated by the new day', async () => {
    await boot()
    file([RANGER, HEX]); clear()
    expect(commitInput(rec(), { ...draftOf(rec()), sTime: '10:00', eTime: '11:00' }, [RANGER, HEX])).toBe(true)
    expect(told(RANGER)).toEqual([`${TITLE} · Wed 15 Jul — Now 10:00–11:00 · ${cs(SABER)}`])
    clear(); tick()
    expect(commitInput(rec(), { ...draftOf(rec()), start: '2026-07-16', end: '2026-07-16' }, [RANGER, HEX])).toBe(true)
    expect(told(HEX)).toEqual([`${TITLE} · Thu 16 Jul — Now Thu 16 Jul · ${cs(SABER)}`])
  })
  it('its title or its remark changed: "Renamed — was Range brief", "Remark changed"', async () => {
    await boot()
    file([RANGER]); clear()
    expect(commitInput(rec(), { ...draftOf(rec()), title: 'Kit check' }, [RANGER])).toBe(true)
    expect(told(RANGER)).toEqual([`Kit check · Wed 15 Jul — Renamed — was ${TITLE} · ${cs(SABER)}`])
    clear(); tick()
    expect(commitInput(rec('Kit check'), { ...draftOf(rec('Kit check')), remarks: 'Bring boots' }, [RANGER])).toBe(true)
    expect(told(RANGER)).toEqual([`Kit check · Wed 15 Jul — Remark changed · ${cs(SABER)}`])
  })
  it('deleted: everyone who was in it is told "Deleted"', async () => {
    await boot()
    file([RANGER, HEX]); clear()
    removeInput(rec())
    expect(INPUTS.some((x: any) => x.title === TITLE)).toBe(false)
    expect(told(RANGER)).toEqual([`${TITLE} · Wed 15 Jul — Deleted · ${cs(SABER)}`])
    expect(told(HEX)).toEqual([`${TITLE} · Wed 15 Jul — Deleted · ${cs(SABER)}`])
  })
  it('taken off the programme by the row\'s ✕, and put back: said in those words', async () => {
    await boot()
    file([RANGER]); tick()
    setBoardDay(WED); press({ grdel: `${WED}.${riOf()}` })
    expect(rec().acc, 'off the programme').toBe('r')
    expect(told(RANGER)).toEqual([`${TITLE} · Wed 15 Jul — Taken off the programme · ${cs(SABER)}`, `${TITLE} · Wed 15 Jul — You were added · ${cs(SABER)}`])
    tick()
    const u = globalUndo()
    expect(u.ok, 'the scheduler\'s own Undo puts it back — ' + String((u as any).reason || '')).toBe(true)
    expect(told(RANGER), 'an Undo takes the notice away with the change — nobody is told "it was undone" (R11)').toEqual([`${TITLE} · Wed 15 Jul — You were added · ${cs(SABER)}`])
  })
  it('whoever FILED it is told too, when he is not in it — and a member\'s change to an input he filed for others tells them, not him', async () => {
    await boot()
    member(RANGER)
    file([HEX, PIKE])                                                  // Ranger files for two others (a duty or commitment — D655)
    expect(told(HEX)).toEqual([`${TITLE} · Wed 15 Jul — You were added · ${cs(RANGER)}`])
    expect(told(RANGER)).toEqual([])
    clear()
    asOther(admin, () => cx(WED, 'WX'))
    expect(told(RANGER), 'the filer is told, though he is not in it').toEqual([`${TITLE} · Wed 15 Jul — Cancelled — WX · ${cs(SABER)}`])
    expect(told(HEX)).toHaveLength(1)
    expect(told(PIKE)).toHaveLength(1)
  })
  it('several things changed in one save are ONE notice a person — what touches HIM first', async () => {
    await boot()
    file([RANGER, HEX]); clear()
    expect(commitInput(rec(), { ...draftOf(rec()), sTime: '10:00', eTime: '11:00' }, [RANGER, PIKE])).toBe(true)   // Hex out, Pike in, re-timed
    expect(noticesFor(HEX)).toHaveLength(1)
    expect(noticeWords(noticesFor(HEX)[0]!).what).toBe('You were taken off')
    expect(noticesFor(PIKE)).toHaveLength(1)
    expect(noticeWords(noticesFor(PIKE)[0]!).what).toBe('You were added')
    expect(noticesFor(RANGER)).toHaveLength(1)
    expect(noticeWords(noticesFor(RANGER)[0]!).what, 'the first two things, in the order that matters to a reader').toBe(`Now 10:00–11:00, ${cs(PIKE)} added`)
  })
  it('a change that says nothing new tells nobody: the same save again', async () => {
    await boot()
    file([RANGER, HEX]); clear()
    commitInput(rec(), draftOf(rec()), [RANGER, HEX])
    expect(NOTICES).toHaveLength(0)
  })
})

describe('the age at the line\'s right (D769)', () => {
  const at = new Date(2026, 5, 10, 12, 0, 0).getTime()
  const n = (ms: number) => ({ at: at - ms } as any)
  it('now · minutes · hours · yesterday · days', () => {
    expect(noticeAge(n(20_000), at)).toBe('now')
    expect(noticeAge(n(2 * 60_000), at)).toBe('2 min')
    expect(noticeAge(n(59 * 60_000), at)).toBe('59 min')
    expect(noticeAge(n(60 * 60_000), at)).toBe('1 h')
    expect(noticeAge(n(11 * 3600_000), at)).toBe('11 h')
    expect(noticeAge(n(20 * 3600_000), at), 'the calendar day before').toBe('yesterday')
    expect(noticeAge(n(2 * 86400_000), at)).toBe('2 d')
    expect(noticeAge(n(40 * 86400_000), at)).toBe('40 d')
  })
})

describe('T18 — the notice and Undo (Fable F9; D148): reading is each person\'s own record, never a write to the notice', () => {
  it('Saber adds Pike; Ranger reads the notice; Saber\'s Undo still goes through and the notice is gone', async () => {
    await boot()
    file([RANGER, HEX]); clear(); tick()
    expect(rowPut(`${rowKey()}.+`, PIKE)).toBe('done')
    const mine = noticesFor(RANGER)
    expect(mine).toHaveLength(1)
    const before = JSON.stringify(mine[0])
    asOther(() => member(RANGER), () => {
      expect(isUnread(mine[0]!, RANGER)).toBe(true)
      expect(markNoticeRead(mine[0]!.id)).toBe(true)
      expect(isUnread(mine[0]!, RANGER)).toBe(false)
    })
    expect(JSON.stringify(noticesFor(RANGER)[0]), 'the notice itself is never rewritten').toBe(before)
    const r = globalUndo()
    expect(r.ok, 'the maker\'s Undo is not refused by a reader — ' + String((r as any).reason || '')).toBe(true)
    expect(rec().people.map((e: any) => e.p)).toEqual([RANGER, HEX])
    expect(noticesFor(RANGER), 'the notice went with the change').toEqual([])
    expect(noticesFor(PIKE)).toEqual([])
    expect(globalRedo().ok).toBe(true)
    expect(noticesFor(PIKE).map(n => noticeWords(n).what), 'a Redo tells them again').toEqual(['You were added'])
  })
  it('"Mark all read" is never an Undo step, and survives a reload', async () => {
    const wb = await boot()
    file([RANGER, HEX]); tick()
    cx(WED, 'WX')
    member(RANGER)
    expect(unreadFor(RANGER)).toBe(2)
    const steps = undoState()
    expect(markAllNoticesRead()).toBe(true)
    expect(unreadFor(RANGER)).toBe(0)
    expect(undoState().canUndo, 'marking read gave him nothing to undo').toBe(steps.canUndo)
    expect(unreadFor(HEX), 'Hex\'s are his own to read').toBe(2)
    /* a reload: the same store, read again */
    await vi.advanceTimersByTimeAsync(2000)
    void wb
    NOTICES.length = 0
    await boot(BE)
    member(RANGER)
    expect(noticesFor(RANGER), 'the notices are saved').toHaveLength(2)
    expect(unreadFor(RANGER), 'and so is what he has read').toBe(0)
    expect(unreadFor(HEX)).toBe(2)
  })
  it('a notice made after "Mark all read" is unread', async () => {
    await boot()
    file([RANGER]); tick()
    asOther(() => member(RANGER), () => { markAllNoticesRead() })
    tick(); cx(WED, 'WX')
    expect(unreadFor(RANGER)).toBe(1)
  })
})

describe('who may write a notice (the plan §4.10 — state/perms.ts ownershipViolation; docs/data-model.md §11)', () => {
  const env = (changes: any[], type = 'inputs.write', origin = 'user') => ({ seq: 1, at: '', actor: { id: 'us', role: 'member', personId: RANGER, session: null }, origin, scope: {}, type, changes } as any)
  const inp = { iid: 'i1', people: [{ p: RANGER, by: RANGER }, { p: HEX, by: RANGER }], type: 'Training', date: 'Jul 15', yr: 2026, by: RANGER }
  const note = (over: any = {}) => ({ id: 'n1', to: HEX, by: RANGER, at: 1, iid: 'i1', name: 'Training', day: '2026-07-15', what: [{ k: 'in' }], ...over })
  it('a member\'s notice rides his own change to that input, names him as its maker, and is addressed to someone else', () => {
    const ok = env([{ op: 'put', collection: 'inputs', id: 'i1', after: inp }, { op: 'put', collection: 'notices', id: 'n1', after: note() }])
    expect(ownershipViolation(ok)).toBeNull()
  })
  it('refused: a notice with no change to its input beside it; one addressed to himself; one that names another maker; one rewritten', () => {
    expect(ownershipViolation(env([{ op: 'put', collection: 'notices', id: 'n1', after: note() }]))).toMatch(/notice/)
    const withInput = (n: any) => env([{ op: 'put', collection: 'inputs', id: 'i1', after: inp }, n])
    expect(ownershipViolation(withInput({ op: 'put', collection: 'notices', id: 'n1', after: note({ to: RANGER }) }))).toMatch(/notice/)
    expect(ownershipViolation(withInput({ op: 'put', collection: 'notices', id: 'n1', after: note({ by: SABER }) }))).toMatch(/notice/)
    expect(ownershipViolation(withInput({ op: 'put', collection: 'notices', id: 'n1', before: note(), after: note({ what: [{ k: 'del' }] }) }))).toMatch(/notice/)
    expect(ownershipViolation(withInput({ op: 'delete', collection: 'notices', id: 'n1', before: note() }))).toMatch(/notice/)
  })
  it('his own Undo takes away the notices his own change made — and no one else\'s', () => {
    const undo = (n: any) => env([{ op: 'put', collection: 'inputs', id: 'i1', before: inp, after: { ...inp, people: [inp.people[0]] } }, n], 'undo', 'restore')
    expect(ownershipViolation(undo({ op: 'delete', collection: 'notices', id: 'n1', before: note() }))).toBeNull()
    expect(ownershipViolation(undo({ op: 'delete', collection: 'notices', id: 'n1', before: note({ by: SABER }) }))).toMatch(/notice/)
  })
  it('what he has read is his own record, written by "notices.seen" alone', () => {
    const seen = (id: string, type = 'notices.seen') => env([{ op: 'put', collection: 'settings', id, after: { upto: 1, ids: [] } }], type)
    expect(ownershipViolation(seen(`noticeseen:${RANGER}`))).toBeNull()
    expect(ownershipViolation(seen(`noticeseen:${HEX}`))).toMatch(/another person/)
    expect(ownershipViolation(seen(`noticeseen:${RANGER}`, 'inputs.write'))).toBeTruthy()
  })
})

/* the bar as the Shell draws it: redrawn on every change, the list drawn once beside the bell */
function Bar() { useVersion(); return <><BellButton id="bell" /><BellList /></> }

describe('the bell and its list (D769 — the pictures docs/mock/2026-10-12-one-rule/bell-{desk,phone}-list-shorter.png)', () => {
  let host: HTMLDivElement, root: Root
  const $ = (sel: string) => document.querySelector(sel) as HTMLElement | null
  const $$ = (sel: string) => [...document.querySelectorAll(sel)] as HTMLElement[]
  const draw = async () => {
    host = document.createElement('div'); document.body.append(host); root = createRoot(host)
    await act(async () => { root.render(<Bar />) })
  }
  const redraw = async () => act(async () => { notify() })
  const tap = async (el: Element | null) => { expect(el, 'tap target').toBeTruthy(); await act(async () => { (el as HTMLElement).click() }) }
  afterEach(async () => { if (root) await act(async () => { root.unmount() }) })

  it('an unread notice lights the bell; nothing unread, it is dark', async () => {
    await boot()
    member(RANGER)
    expect(bellOn()).toBe(false)
    asOther(admin, () => file([RANGER, HEX]))
    expect(bellOn()).toBe(true)
    markAllNoticesRead()
    expect(bellOn()).toBe(false)
  })
  it('a tap opens the list: the input in bold with its date, what happened and who under it, its age at the right — newest first', async () => {
    await boot()
    file([RANGER, HEX]); tick(60 * 60_000)
    cx(WED, 'WX'); tick(2 * 60_000)
    member(RANGER)
    await draw()
    expect($('[data-testid="bell-list"]'), 'closed until tapped').toBeNull()
    await tap($('#bell'))
    expect(bellListOpen()).toBe(true)
    expect($('#bell')!.getAttribute('aria-expanded')).toBe('true')
    const lines = $$('[data-testid^="bell-line-"]')
    expect(lines).toHaveLength(2)
    const part = (l: HTMLElement, k: string) => l.querySelector(`.bl-${k}`)!.textContent
    expect(part(lines[0]!, 'name')).toBe(TITLE)
    expect(lines[0]!.querySelector('.bl-name')!.tagName, 'the input is the bold part').toBe('B')
    expect(part(lines[0]!, 'day')).toBe('Wed 15 Jul')
    expect(part(lines[0]!, 'what')).toBe(`Cancelled — WX · ${cs(SABER)}`)
    expect(part(lines[0]!, 'ago')).toBe('2 min')
    expect(part(lines[1]!, 'what')).toBe(`You were added · ${cs(SABER)}`)
    expect(part(lines[1]!, 'ago')).toBe('1 h')
    expect(lines.every(l => l.classList.contains('unread')), 'both unread: bright, with a dot').toBe(true)
    expect($('[data-testid="bell-markall"]')!.textContent).toBe('Mark all read')
  })
  it('a tap on a line opens the input and marks that line read; the other stays unread', async () => {
    await boot()
    file([RANGER, HEX]); tick(60_000)
    cx(WED, 'WX')
    member(RANGER)
    await draw(); await tap($('#bell'))
    const first = $$('[data-testid^="bell-line-"]')[0]!
    await tap(first)
    expect(pops.INPEDIT, 'the input\'s own window').toBe(rec())
    expect(bellListOpen(), 'the list closes behind it').toBe(false)
    expect(unreadFor(RANGER)).toBe(1)
    await tap($('#bell'))
    const lines = $$('[data-testid^="bell-line-"]')
    expect(lines.map(l => l.classList.contains('unread'))).toEqual([false, true])
  })
  it('a line whose input has since been deleted says so and is marked read', async () => {
    await boot()
    file([RANGER]); tick(60_000)
    removeInput(rec())
    member(RANGER)
    await draw(); await tap($('#bell'))
    const lines = $$('[data-testid^="bell-line-"]')
    expect(lines[0]!.querySelector('.bl-what')!.textContent).toBe(`Deleted · ${cs(SABER)}`)
    SAID = []
    await tap(lines[0]!)
    expect(SAID.join(' | ')).toContain('That input is gone')
    expect(pops.INPEDIT).toBeNull()
    expect(isUnread(noticesFor(RANGER)[0]!, RANGER)).toBe(false)
  })
  it('"Mark all read": every line goes quiet, the bell goes dark, the list stays open', async () => {
    await boot()
    file([RANGER, HEX]); tick(60_000); cx(WED, 'WX')
    member(RANGER)
    await draw(); await tap($('#bell'))
    await tap($('[data-testid="bell-markall"]'))
    expect($$('[data-testid^="bell-line-"]').some(l => l.classList.contains('unread'))).toBe(false)
    expect($('#bell')!.classList.contains('on')).toBe(false)
    expect(bellListOpen()).toBe(true)
    expect($('[data-testid="bell-markall"]'), 'nothing left to mark').toBeNull()
  })
  it('nothing to list: "Nothing new"', async () => {
    await boot()
    member(RANGER)
    await draw(); await tap($('#bell'))
    expect($('[data-testid="bell-empty"]')!.textContent).toBe('Nothing new')
    expect($$('[data-testid^="bell-line-"]')).toHaveLength(0)
    expect($('[data-testid="bell-markall"]')).toBeNull()
  })
  it('the list closes on a press outside it, on Escape, and on a second tap of the bell (the standing rule for a click-open popup)', async () => {
    await boot()
    member(RANGER)
    await draw()
    await tap($('#bell')); expect(bellListOpen()).toBe(true)
    await act(async () => { document.body.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true })) })
    expect(bellListOpen()).toBe(false)
    await tap($('#bell')); expect(bellListOpen()).toBe(true)
    await act(async () => { document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })) })
    expect(bellListOpen()).toBe(false)
    await tap($('#bell')); await tap($('#bell'))
    expect(bellListOpen()).toBe(false)
  })
  it('D769: an OIL question still comes FIRST — the tap goes straight to it and opens no list, though a notice waits too', async () => {
    await boot()
    HOOKS.oilEarningDay = ((di: number) => di === SAT) as any
    member(RANGER)
    expect(commitInput(null, DRAFT(SAT, { type: 'Duty' }), [RANGER]), 'his own Saturday duty, its OIL question unanswered').toBe(true)
    pops.setOilAsk(null); pops.setInpEdit(null)
    asOther(admin, () => file([RANGER, HEX], THU, { title: 'Kit check' }))
    expect(unreadFor(RANGER)).toBe(1)
    await redraw()
    bellTap()
    expect(bellListOpen(), 'no list').toBe(false)
    expect(pops.OILASK, 'the OIL question, as today').toBeTruthy()
  })
})
