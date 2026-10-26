// @vitest-environment jsdom
/* THE BELL TELLS HIM — A SECOND SCENARIO PASS, by a tester who did not write the build ([ALL-AVAIL-AS-MEMBER] step 7,
   12 Oct 26 — `[INPUT-CHANGED-TELL]`; the plan docs/superpowers/plans/2026-10-11-one-rule-plan.md §4.10 and §10
   "Step 7 — the bell tells him"). The builder's own cases are bellnotices.test.tsx; these are what they do not reach.
   His rulings:
   D755 (3) — the member is told by his bell when the scheduler adds people to his request, swaps him out or changes it;
   D760 — a CX on an input's row cancels the input and the member is told by his bell; the red box and "information
          only" go with the input too, shown on the schedule only;
   D769 — the list's shorter wording; a tap on the bell still goes straight to an OIL question, an access request or a
          bug report where one waits, opening the list only otherwise;
   D148 — Undo reverses only the signed-in person's own changes, and refuses once someone else has since changed the
          same thing;
   D763 — a person in a shared input he did not file adds nobody; he may always take himself out;
   D757 — nobody behind ALL AVAIL is told; D737 — the Unavailable list stays a row a man.
   The plan's readings: R11 (an Undo takes its notice away), R12 (the app's own act names nobody), R32–R37.

   SEVEN CASES HERE FAILED WHEN THEY WERE WRITTEN — six product faults, each fixed by the builder the same day (12 Oct 26)
   and kept as its pin; their titles begin "(found a fault, fixed 12 Oct 26)". As the helper wrote it:
   A PRODUCT FAULT IS SHOWN, NEVER PINNED: a case marked "FAULT" in its title states what the rulings / the plan say and
   is left failing where the app does otherwise.

   Driven through the app's real doors on a real saved store, with the harness of bellnotices.test.tsx. */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { INPUTS, inpId, idsOf } from '../engine/inputs'
import { PEOPLE, ID_BY_CS, indexCallsigns } from '../engine/people'
import { DAYS } from '../engine/data'
import { CURWEEK } from '../engine/waves'
import { storeBackend, HOOKS, store } from '../engine/hooks'
import { stashClear } from '../engine/weekstash'
import { SCHED, signOf, dayCurVer } from '../engine/publish'
import { loadVersionToWorkingCopy } from '../engine/drafts'
import { addDayTpl, applyDayTpl } from '../engine/daytpl'
import { PLANPUCKS, DAYRMK } from '../state/plan'
import { initStore, weekStashSnap, weekDirty, loadWeek, notify, resetSession, writeInputs } from '../state/store'
import { setSession, setMe, DEFAULT_ME, SESSION, ME } from '../state/auth'
import { hydrate, wirePersist } from '../state/persist'
import { commitSetDayApproved, commitPublishALDay, schedWrite, SCHED_TYPES } from '../state/sched-commit'
import { commitSettingsIntent } from '../state/people-settings-commit'
import { updatePersonField } from '../state/quals-write'
import { deletePerson } from '../state/person-delete'
import { accountsLoad } from '../state/accounts'
import { bootStorage } from '../storage/boot'
import { settingsAdapter } from '../storage/adapters'
import { MemoryBackend } from '../storage/memory'
import { SCHEMA_VERSION } from '../storage/reset'
import { globalUndo, globalRedo, undoState } from '../undo'
import { _resetTimeline } from '../undo/timeline'
import { installGlobalUndo } from '../state/undo-wire'
import { _resetDisclosure } from '../state/disclosure'
import { setPage, setBoardDay, markBell, CURPAGE } from '../state/view'
import * as view from '../state/view'
import { commitInput, draftOf, removeInput, setInpField, setLeaveRemarks, reassignInput } from './inputedit'
import { rowPut, rowTake, rowMove, rowMark } from './reqdoor'
import { boardMbtn, cxCommit, CXT } from './board'
import * as pops from './pops'
import { useVersion } from './useStore'
import { NOTICES, noticesFor, noticeWords, type Notice } from '../state/notices'
import { isUnread, unreadFor, markNoticeRead, markAllNoticesRead } from '../state/noticeseen'
import { bellOn, bellTap, bellListOpen, closeBellList, openNotice, BellButton, BellList } from './topbits'
import { initStore as lwInitStore, lwHistInit, getState, setPeople, setRole, setCells, setBidStates } from '../leavewar/state/store'
import { memoryBackend } from '../leavewar/state/storage'
import { projectPeople } from '../leavewar/state/raptorRoster'
import { wireLeaveWarSync, postOut, archivePerson, runPoOutcomes } from '../leavewar/sync'
;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

const ISNAP = JSON.stringify(INPUTS)
const PSNAP = JSON.stringify(PEOPLE)
const DSNAP = JSON.stringify(DAYS)
const W1 = '13/07/2026'
const TUE = 1, WED = 2, THU = 3, SAT = 5
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
  view.WARNOFF.clear(); view.disarmSlot(); view.BELLLIT.clear()
  pops.setInpEdit(null); pops.setOilAsk(null); closeBellList()
  stashClear()
}
const SABER = 'stiff', RANGER = 'bane', HEX = 'rocky', PIKE = 'pike'
const admin = () => { setSession({ user: 'ad', role: 'admin', name: 'ad' }); setMe(SABER) }          // Saber, a scheduler
const member = (id = RANGER) => { setSession({ user: 'us', role: 'main', name: 'us' }); setMe(id) }
/* another person's command while the signed-in person stays signed in — what a second device's command is to this one */
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
/* a reload: the same saved store, read again */
async function reload() {
  await vi.advanceTimersByTimeAsync(2000)
  NOTICES.length = 0
  return boot(BE)
}

const TITLE = 'Range brief'
const cs = (id: string) => String(PEOPLE[id].cs)
const rec = (title = TITLE) => { const l = INPUTS.filter((x: any) => x.title === title) as any[]; expect(l, `ONE record called ${title}`).toHaveLength(1); return l[0] }
const ground = (di = WED) => ((DAYS[di] as any).ground || []) as any[]
const riOf = (di = WED, title = TITLE) => ground(di).findIndex((g: any) => g && g.src === String(inpId(rec(title))))
const rowKey = (di = WED, title = TITLE) => `g:${di}.${riOf(di, title)}`
/* the place one of its people stands on, on its row */
const placeOf = (pid: string, di = WED, title = TITLE) => { const row = ground(di)[riOf(di, title)]; return row.who === pid ? rowKey(di, title) : `${rowKey(di, title)}.x${(row.more || []).indexOf(pid)}` }
const DRAFT = (di = WED, over: any = {}) => ({ ...draftOf({ person: RANGER, type: 'Training', title: TITLE, date: LBL[di], yr: 2026, allday: false, s: 540, e: 600, remarks: 'Bring your kit' }), ...over })
const file = (ppl: string[], di = WED, over: any = {}) => expect(commitInput(null, DRAFT(di, over), ppl), 'filed').toBe(true)
const press = (data: Record<string, string>) => { const b = document.createElement('button'); b.className = 'mbtn'; Object.assign(b.dataset, data); document.body.appendChild(b); boardMbtn({ target: b } as any); b.remove() }
const cx = (di = WED, reason = 'WX', title = TITLE) => { setBoardDay(di); press({ grcx: `${di}.${riOf(di, title)}` }); expect(CXT, 'the reason is asked').toBeTruthy(); cxCommit(true, reason) }
const line = (n: Notice) => { const w = noticeWords(n); return `${w.name} · ${w.day} — ${w.what}${w.who ? ' · ' + w.who : ''}` }
/* what one person's bell lists, newest first, as its words */
const told = (pid: string) => noticesFor(pid).map(line)
/* what a stretch of work told, and to whom — the notices made since a mark (never by emptying the list: a list emptied
   outside a command is taken up by the next command as its own removal) */
const mark = () => new Set(NOTICES.map(n => n.id))
const since = (m: Set<string>) => NOTICES.filter(n => !m.has(n.id))
const sinceTo = (m: Set<string>, pid: string) => since(m).filter(n => n.to === pid).map(line)
const tick = (ms = 60_000) => vi.advanceTimersByTime(ms)
const ppl = (title = TITLE) => idsOf(rec(title)).map(String)

beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(new Date(2026, 5, 1, 9, 0, 0)); resetWorld(); SAID = []; HOOKS.toast = (m: any) => { SAID.push(String(m)) } })
afterEach(() => {
  HOOKS.toast = toast
  _resetTimeline(); vi.useRealTimers(); resetWorld(); setSession(null); setMe(DEFAULT_ME); storeBackend.impl = null; document.body.innerHTML = ''
})

describe('someone leaves, or is swapped (D755 (3), D763; the plan §4.10 "who is told")', () => {
  it('a member takes HIMSELF out of an input a scheduler filed for two: the other man and the filer are told "Ranger taken off", by Ranger — Ranger is told nothing', async () => {
    await boot()
    file([RANGER, HEX]); tick()
    member(RANGER)
    const m = mark()
    expect(commitInput(rec(), draftOf(rec()), [HEX]), 'he may always take himself out (D763)').toBe(true)
    expect(ppl()).toEqual([HEX])
    expect(sinceTo(m, HEX)).toEqual([`${TITLE} · Wed 15 Jul — ${cs(RANGER)} taken off · ${cs(RANGER)}`])
    expect(sinceTo(m, SABER), 'whoever filed it, though he is not in it (R35)').toEqual([`${TITLE} · Wed 15 Jul — ${cs(RANGER)} taken off · ${cs(RANGER)}`])
    expect(sinceTo(m, RANGER), 'never whoever made the change').toEqual([])
  })
  /* his own Undo and Redo, with the notices riding them through the member's commit gate (state/perms.ts — "his own Undo
     of that change takes away the notices it made; a Redo puts them back the same way") */
  const undoRedo = async (over: any) => {
    await boot()
    file([RANGER, HEX], WED, over); tick()
    member(RANGER)
    _resetTimeline(); installGlobalUndo()                      // a sign-in starts his own list of steps (D148)
    const m = mark()
    expect(commitInput(rec(), draftOf(rec()), [HEX])).toBe(true)
    expect(since(m)).toHaveLength(2)
    const u = globalUndo()
    expect(u.ok, 'a member\'s Undo of his own change — ' + String((u as any).reason || '')).toBe(true)
    expect(ppl()).toEqual([RANGER, HEX])
    expect(since(m), 'the notices went with the change (R11)').toEqual([])
    const r = globalRedo()
    expect(r.ok, 'and his Redo — ' + String((r as any).reason || '')).toBe(true)
    expect(ppl()).toEqual([HEX])
    expect(since(m).map(n => n.to).sort(), 'a Redo tells them again').toEqual([HEX, SABER].sort())
  }
  it('…and his own Undo passes the commit gate and takes both notices back; his Redo tells them again (R11) — an input on a week that is not on screen', async () => {
    await undoRedo({ start: '2026-08-05', end: '2026-08-05' })
  })
  /* A PRODUCT FAULT WHEN THIS WAS WRITTEN — FIXED 12 Oct 26, the case kept as its pin — not the notices' (they pass the gate, above): the member's Undo is refused with "That
     couldn't be completed just now" whenever the input has a row on the week ON SCREEN. state/perms.ts ownPart →
     saysSame compares the row's landing mark (`acc: 'g'`) as something the input "says"; a restore strips that mark
     (state/sched-commit.ts schedWriteRecords — "strip the DERIVED 'g' landing on a restore"), so before and after
     differ and the gate answers "another person's input". The older case that covers this very Undo
     (leavewar/onerecord-write.test.ts "a man IN a shared input he did not file takes himself out — and his own Undo puts
     him back (F5, T14)") passes only because its input is in February, off the loaded week. D148; D763. */
  it('(found a fault, fixed 12 Oct 26) …the same Undo where the input has a row on the week ON SCREEN (D148 — he undoes his own change; D763 — he may always take himself out)', async () => {
    await undoRedo({})
  })
  it('the FILER steps out of his own input for three: the two left are told by him; a scheduler\'s later CX still reaches him as its filer', async () => {
    await boot()
    member(RANGER)
    file([RANGER, HEX, PIKE], WED, { type: 'Duty' })
    const m = mark()
    expect(commitInput(rec(), draftOf(rec()), [HEX, PIKE])).toBe(true)
    expect(sinceTo(m, HEX)).toEqual([`${TITLE} · Wed 15 Jul — ${cs(RANGER)} taken off · ${cs(RANGER)}`])
    expect(sinceTo(m, PIKE)).toEqual([`${TITLE} · Wed 15 Jul — ${cs(RANGER)} taken off · ${cs(RANGER)}`])
    expect(sinceTo(m, RANGER)).toEqual([])
    expect(String(rec().by), 'every entry left is his own filing: it is still filed by him').toBe(RANGER)
    tick()
    const m2 = mark()
    asOther(admin, () => cx(WED, 'WX'))
    expect(sinceTo(m2, RANGER), 'the filer, no longer in it').toEqual([`${TITLE} · Wed 15 Jul — Cancelled — WX · ${cs(SABER)}`])
  })
  it('the ONLY person of an input replaced on its row: the man replaced is told he was taken off, the man put in that he was added — and it is now filed by the scheduler', async () => {
    await boot()
    member(RANGER)
    file([RANGER])
    admin()
    const iid = String(inpId(rec()))
    const m = mark()
    expect(rowPut(rowKey(), PIKE)).toBe('done')
    expect(ppl()).toEqual([PIKE])
    expect(String(inpId(rec())), 'the same input').toBe(iid)
    expect(String(rec().by), 'who filed it passes to whoever did this (D759 reading 7)').toBe(SABER)
    expect(sinceTo(m, RANGER)).toEqual([`${TITLE} · Wed 15 Jul — You were taken off · ${cs(SABER)}`])
    expect(sinceTo(m, PIKE)).toEqual([`${TITLE} · Wed 15 Jul — You were added · ${cs(SABER)}`])
    expect(sinceTo(m, SABER)).toEqual([])
    expect(since(m)).toHaveLength(2)
  })
  it('…and where a third man had filed it for him, that filer is told who went and who came', async () => {
    await boot()
    member(HEX)
    file([RANGER], WED, { type: 'Duty' })                      // Hex files a duty for Ranger (D655)
    admin()
    const m = mark()
    expect(rowPut(rowKey(), PIKE)).toBe('done')
    expect(sinceTo(m, HEX)).toEqual([`${TITLE} · Wed 15 Jul — ${cs(PIKE)} added, ${cs(RANGER)} taken off · ${cs(SABER)}`])
    expect(sinceTo(m, RANGER)).toEqual([`${TITLE} · Wed 15 Jul — You were taken off · ${cs(SABER)}`])
    expect(sinceTo(m, PIKE)).toEqual([`${TITLE} · Wed 15 Jul — You were added · ${cs(SABER)}`])
  })
  it('a man dragged from one input\'s row to another\'s (D109 — one move): told once for each input; the men of both are told; ONE Undo takes all of it back', async () => {
    await boot()
    file([RANGER, HEX]); file([PIKE], WED, { title: 'Kit check', sTime: '13:00', eTime: '14:00' }); tick()
    const m = mark()
    expect(rowMove(placeOf(HEX), `${rowKey(WED, 'Kit check')}.+`)).toBe('done')
    expect(ppl()).toEqual([RANGER]); expect(ppl('Kit check')).toEqual([PIKE, HEX])
    expect(sinceTo(m, HEX).sort()).toEqual([`Kit check · Wed 15 Jul — You were added · ${cs(SABER)}`, `${TITLE} · Wed 15 Jul — You were taken off · ${cs(SABER)}`].sort())
    expect(sinceTo(m, RANGER)).toEqual([`${TITLE} · Wed 15 Jul — ${cs(HEX)} taken off · ${cs(SABER)}`])
    expect(sinceTo(m, PIKE)).toEqual([`Kit check · Wed 15 Jul — ${cs(HEX)} added · ${cs(SABER)}`])
    expect(since(m)).toHaveLength(4)
    const u = globalUndo()
    expect(u.ok, String((u as any).reason || '')).toBe(true)
    expect(ppl()).toEqual([RANGER, HEX]); expect(ppl('Kit check')).toEqual([PIKE])
    expect(since(m), 'one Undo, all four gone').toEqual([])
  })
  it('ALL AVAIL taken off the row: the people in it are told "ALL AVAIL taken off" — nobody else', async () => {
    await boot()
    file([RANGER])
    expect(rowPut(`${rowKey()}.+`, 'allavail')).toBe('done')
    tick()
    const m = mark()
    expect(rowTake(placeOf('allavail'))).toBe('done')
    expect(sinceTo(m, RANGER)).toEqual([`${TITLE} · Wed 15 Jul — ALL AVAIL taken off · ${cs(SABER)}`])
    expect(since(m).map(n => n.to)).toEqual([RANGER])
  })
  it('an input filed FOR ALL AVAIL alone names nobody, so nobody is told — until someone else changes it, and then its filer is', async () => {
    await boot()
    member(RANGER)
    expect(commitInput(null, DRAFT(WED, { type: 'Duty' }), ['allavail']), 'a member may file for ALL AVAIL (D702)').toBe(true)
    expect(NOTICES, 'nobody behind the puck is told (D757)').toHaveLength(0)
    tick()
    asOther(admin, () => cx(WED, 'WX'))
    expect(NOTICES.map(line)).toEqual([`${TITLE} · Wed 15 Jul — Cancelled — WX · ${cs(SABER)}`])
    expect(NOTICES.map(n => n.to)).toEqual([RANGER])
  })
  it('D760: the red box and "information only" are shown on the schedule only — they tell nobody', async () => {
    await boot()
    file([RANGER, HEX]); tick()
    const m = mark()
    expect(rowMark(rowKey(), 'flag', true)).toBe('done')
    expect(rowMark(rowKey(), 'info', true)).toBe('done')
    expect(rec().flag).toBe(true); expect(rec().info).toBe(true)
    expect(since(m)).toEqual([])
  })
})

describe('one man\'s part of a shared input on the Unavailable list (D737; the plan §4.6, §10 step 7 item 5)', () => {
  const LEAVE = 'SCN leave'
  const lrec = () => INPUTS.filter((x: any) => x.type === 'LL' && String(x.remarks || '').includes(LEAVE)) as any[]
  const split = async () => {
    await boot()
    expect(commitInput(null, draftOf({ person: RANGER, type: 'LL', date: LBL[WED], yr: 2026, allday: true, remarks: LEAVE }), [RANGER, HEX, PIKE]), 'an admin files a leave for three').toBe(true)
    expect(lrec()).toHaveLength(1)
    tick()
    const m = mark()
    expect(setInpField(lrec()[0], 'str', '10:00', HEX)).toBe(true)
    expect(lrec().map(r => idsOf(r).map(String)).sort((a, b) => b.length - a.length), 'the two, and his own').toEqual([[RANGER, PIKE], [HEX]])
    return m
  }
  it('a time typed on HIS row of a leave for three: he is told what changed for him — once, never "taken off" and "added"', async () => {
    const m = await split()
    expect(sinceTo(m, HEX)).toEqual([`LL · Wed 15 Jul — Now 10:00–23:59 · ${cs(SABER)}`])
  })
  /* A PRODUCT FAULT WHEN THIS WAS WRITTEN — FIXED 12 Oct 26, the case kept as its pin: the two left in the leave are told NOTHING. state/sched-commit.ts tellPass takes "each
     input as it stood before the command" from the lagging baseline at its FIRST run — but this door (ui/inputedit.tsx
     saveFromRow) cuts his part out in the outer save and then saves it through a NESTED input command, and every input
     command begins by moving the baseline to the live world (commitInputsWith → resyncSchedBaseline). So the "before"
     the pass reads already has him cut out: nothing changed for the other two. The plan §4.10 — "what tells: someone
     else … took out anyone else"; §10 step 7 item 5. */
  it('(found a fault, fixed 12 Oct 26) …and the other two, still in the leave, are told he was taken off (the plan §4.10 "took out anyone else")', async () => {
    const m = await split()
    expect(sinceTo(m, RANGER)).toEqual([`LL · Wed 15 Jul — ${cs(HEX)} taken off · ${cs(SABER)}`])
    expect(sinceTo(m, PIKE)).toEqual([`LL · Wed 15 Jul — ${cs(HEX)} taken off · ${cs(SABER)}`])
    expect(since(m)).toHaveLength(3)
  })
  it('another man dropped on HIS row of that leave (the swap of one of several): the man out and the man in are each told; the others are told who went and who came', async () => {
    await boot()
    expect(commitInput(null, draftOf({ person: RANGER, type: 'LL', date: LBL[WED], yr: 2026, allday: true, remarks: LEAVE }), [RANGER, HEX, PIKE])).toBe(true)
    tick()
    const m = mark(), GRIT = 'harpoon'
    expect(reassignInput(`${lrec()[0].iid}~${HEX}`, GRIT)).toBe(true)
    expect(lrec().map(r => idsOf(r).map(String))).toEqual([[RANGER, GRIT, PIKE]])
    expect(sinceTo(m, HEX)).toEqual([`LL · Wed 15 Jul — You were taken off · ${cs(SABER)}`])
    expect(sinceTo(m, GRIT)).toEqual([`LL · Wed 15 Jul — You were added · ${cs(SABER)}`])
    expect(sinceTo(m, RANGER)).toEqual([`LL · Wed 15 Jul — ${cs(GRIT)} added, ${cs(HEX)} taken off · ${cs(SABER)}`])
    expect(since(m)).toHaveLength(4)
  })
})

describe('the app\'s own act (R12; the plan §4.10 "two consequences", §10 step 7 item 6)', () => {
  it('a man DELETED from the roster: the others in his input are told he was taken off, with NO name after it — and he is told nothing', async () => {
    await boot()
    accountsLoad()
    file([RANGER, HEX, PIKE]); tick()
    const m = mark()
    expect(deletePerson(HEX), 'the admin\'s delete').toBe(null)
    expect(ppl(), 'the input carries on for the other two').toEqual([RANGER, PIKE])
    expect(sinceTo(m, RANGER)).toEqual([`${TITLE} · Wed 15 Jul — ${cs(HEX)} taken off`])
    expect(sinceTo(m, PIKE)).toEqual([`${TITLE} · Wed 15 Jul — ${cs(HEX)} taken off`])
    expect(since(m).every(n => n.by === null), 'the app did it: no name').toBe(true)
    expect(sinceTo(m, HEX), 'the man himself is not told').toEqual([])
    expect(sinceTo(m, SABER), 'nor the admin who deleted him').toEqual([])
  })
})

describe('what is nobody\'s act tells nobody, and never takes a notice away', () => {
  const ids = () => NOTICES.map(n => n.id).sort()
  it('loading another week and coming back', async () => {
    await boot()
    file([RANGER, HEX]); tick()
    cx(WED, 'WX')
    const before = ids()
    expect(before).toHaveLength(4)
    loadWeek('20/07/2026')
    expect(ids(), 'still there on the other week — the bell is not the week\'s').toEqual(before)
    loadWeek(W1)
    expect(ids()).toEqual(before)
  })
  it('…with an input that was taken off the programme: the week coming back does not say "Back on the programme"', async () => {
    await boot()
    file([RANGER]); tick()
    setBoardDay(WED); press({ grdel: `${WED}.${riOf()}` })
    expect(rec().acc).toBe('r')
    const before = ids()
    loadWeek('20/07/2026'); loadWeek(W1)
    expect(NOTICES.map(line).filter(l => /Back on the programme/.test(l))).toEqual([])
    expect(ids()).toEqual(before)
  })
  it('publishing a day, amending it, and loading its published version back onto the working copy', async () => {
    await boot()
    file([RANGER, HEX]); tick()
    const sign = () => schedWrite(SCHED_TYPES.text, () => { const g = signOf(WED); g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump' })
    sign(); commitSetDayApproved(WED, true)
    expect(dayCurVer(WED), 'published').toBeTruthy()
    const afterPublish = ids()
    expect(afterPublish, 'publishing told nobody').toHaveLength(2)
    const orig = dayCurVer(WED)
    tick()
    expect(rowPut(`${rowKey()}.+`, PIKE)).toBe('done')         // a change on the published day — it tells (3 more)
    const afterAdd = ids()
    expect(afterAdd).toHaveLength(5)
    sign(); commitPublishALDay(WED)
    expect(ids(), 'the amendment going out told nobody').toEqual(afterAdd)
    tick()
    schedWrite(SCHED_TYPES.text, () => { loadVersionToWorkingCopy(WED, orig); view.afterSchedMutate() })
    expect(ppl(), 'the row keeps the added man — the input is not the day\'s (Fable 10)').toEqual([RANGER, HEX, PIKE])
    expect(ids(), 'the load told nobody and took nothing away').toEqual(afterAdd)
  })
  it('a day template applied over a day that carries an input\'s row', async () => {
    await boot()
    file([RANGER, HEX]); tick()
    const before = ids()
    let tpl: any = null
    schedWrite(SCHED_TYPES.text, () => { tpl = addDayTpl(THU, 'scn') })
    expect(tpl, 'a template made from Thursday').toBeTruthy()
    schedWrite(SCHED_TYPES.text, () => { expect(applyDayTpl(WED, tpl.id)).toBe(true); view.afterSchedMutate() })
    expect(ids()).toEqual(before)
    expect(ppl()).toEqual([RANGER, HEX])
  })
  it('R37: an OIL answer given, and changed, by whoever may', async () => {
    await boot()
    HOOKS.oilEarningDay = ((di: number) => di === SAT) as any
    file([RANGER, HEX], SAT, { type: 'Duty' })
    pops.setOilAsk(null); pops.setInpEdit(null); tick()
    const m = mark()
    const iso = '2026-07-18'
    expect(commitInput(rec(), draftOf(rec()), [RANGER, HEX], { oil: { [iso]: 0.5 } } as any)).toBe(true)
    expect(rec().oil, 'the answer is on the input').toMatchObject({ [iso]: 0.5 })
    expect(commitInput(rec(), draftOf(rec()), [RANGER, HEX], { oil: { [iso]: 0 } } as any)).toBe(true)
    expect(since(m)).toEqual([])
  })
  it('the same time typed again on its row, and the same remark', async () => {
    await boot()
    file([RANGER, HEX]); tick()
    const m = mark()
    setInpField(rec(), 'str', '09:00')
    setInpField(rec(), 'rmks', 'Bring your kit')
    expect(since(m)).toEqual([])
  })
})

describe('the words keep up with today, and keep what the input was (state/notices.ts — "kept on the notice")', () => {
  it('a renamed person reads by his callsign of today — as the man added, and as who did it', async () => {
    await boot()
    file([RANGER]); tick()
    expect(rowPut(`${rowKey()}.+`, PIKE)).toBe('done')
    expect(told(RANGER)[0]).toBe(`${TITLE} · Wed 15 Jul — ${cs(PIKE)} added · ${cs(SABER)}`)
    expect(updatePersonField(PIKE, { callsign: 'Zzyx' } as any)).toBeNull()
    expect(updatePersonField(SABER, { callsign: 'Sabrex' } as any)).toBeNull()
    expect(told(RANGER)[0]).toBe(`${TITLE} · Wed 15 Jul — Zzyx added · Sabrex`)
  })
  it('an input since renamed, moved and deleted: each line still says what it was called and when, at the time', async () => {
    await boot()
    file([RANGER]); tick()
    expect(commitInput(rec(), { ...draftOf(rec()), title: 'Kit check' }, [RANGER])).toBe(true); tick()
    expect(commitInput(rec('Kit check'), { ...draftOf(rec('Kit check')), start: '2026-07-16', end: '2026-07-16' }, [RANGER])).toBe(true); tick()
    removeInput(rec('Kit check'))
    expect(told(RANGER)).toEqual([
      `Kit check · Thu 16 Jul — Deleted · ${cs(SABER)}`,
      `Kit check · Thu 16 Jul — Now Thu 16 Jul · ${cs(SABER)}`,
      `Kit check · Wed 15 Jul — Renamed — was ${TITLE} · ${cs(SABER)}`,
      `${TITLE} · Wed 15 Jul — You were added · ${cs(SABER)}`,
    ])
  })
  it('a date across the year\'s end: the day of the week is the new year\'s', async () => {
    await boot()
    expect(commitInput(null, { ...DRAFT(WED), start: '2026-12-31', end: '2026-12-31' }, [RANGER])).toBe(true)
    expect(told(RANGER)).toEqual([`${TITLE} · Thu 31 Dec — You were added · ${cs(SABER)}`])
    tick()
    expect(commitInput(rec(), { ...draftOf(rec()), start: '2027-01-01', end: '2027-01-01' }, [RANGER])).toBe(true)
    expect(told(RANGER)[0]).toBe(`${TITLE} · Fri 1 Jan — Now Fri 1 Jan · ${cs(SABER)}`)
  })
})

/* the bar as the Shell draws it: BOTH bells — the top bar's and the Scheduler Board's — and the list drawn once */
function Bars() { useVersion(); return <><BellButton id="notifyBell" /><BellButton id="sbBell" /><BellList /></> }

describe('the list (D769; the plan §4.10 "the bell", §10 step 7 item 8)', () => {
  let host: HTMLDivElement, root: Root | null = null
  const $ = (sel: string) => document.querySelector(sel) as HTMLElement | null
  const $$ = (sel: string) => [...document.querySelectorAll(sel)] as HTMLElement[]
  const draw = async () => { host = document.createElement('div'); document.body.append(host); root = createRoot(host); await act(async () => { root!.render(<Bars />) }) }
  const redraw = async () => act(async () => { notify() })
  const tap = async (el: Element | null) => { expect(el, 'tap target').toBeTruthy(); await act(async () => { (el as HTMLElement).click() }) }
  const lines = () => $$('[data-testid^="bell-line-"]')
  afterEach(async () => { if (root) await act(async () => { root!.unmount() }); root = null })
  /* thirty-two notices for Ranger: filed, then re-timed thirty-one times, a minute apart */
  const many = (n: number) => {
    file([RANGER]); tick()
    for (let i = 1; i < n; i++) { expect(commitInput(rec(), { ...draftOf(rec()), sTime: i % 2 ? '10:00' : '09:00', eTime: i % 2 ? '11:00' : '10:00' }, [RANGER])).toBe(true); tick() }
  }

  it('more than thirty: the list shows his newest thirty, the count of unread counts them all, and "Mark all read" reads them all', async () => {
    await boot()
    many(32)
    member(RANGER)
    expect(NOTICES.filter(n => n.to === RANGER), 'nothing is pruned').toHaveLength(32)
    expect(noticesFor(RANGER)).toHaveLength(30)
    expect(unreadFor(RANGER)).toBe(32)
    await draw(); await tap($('#notifyBell'))
    expect(lines()).toHaveLength(30)
    await tap($('[data-testid="bell-markall"]'))
    expect(unreadFor(RANGER)).toBe(0)
    expect($('#notifyBell')!.classList.contains('on')).toBe(false)
  })
  it('(found a fault, fixed 12 Oct 26) more than thirty, read one line at a time: once the thirty shown are read, a lit bell must still offer a way to put it out (the plan §4.10 — "the bell lights while he has one unread; a tap opens a short list … Mark all read")', async () => {
    await boot()
    many(31)
    member(RANGER)
    for (const n of noticesFor(RANGER)) expect(markNoticeRead(n.id)).toBe(true)   // a tap on each of the thirty lines
    expect(unreadFor(RANGER), 'one older notice is still unread').toBe(1)
    await draw()
    expect($('#notifyBell')!.classList.contains('on'), 'so the bell is lit').toBe(true)
    await tap($('#notifyBell'))
    const shownUnread = lines().some(l => l.classList.contains('unread'))
    const canMarkAll = !!$('[data-testid="bell-markall"]')
    expect(shownUnread || canMarkAll, 'the list shows the unread line, or offers "Mark all read" — else the bell can never be put out').toBe(true)
  })
  it('two notices made in the same instant are both listed', async () => {
    await boot()
    file([RANGER, HEX]); file([PIKE], WED, { title: 'Kit check', sTime: '13:00', eTime: '14:00' })
    const m = mark()
    expect(rowMove(placeOf(HEX), `${rowKey(WED, 'Kit check')}.+`)).toBe('done')
    const his = since(m).filter(n => n.to === HEX)
    expect(his).toHaveLength(2)
    expect(his[0]!.at, 'the same millisecond').toBe(his[1]!.at)
    expect(his[0]!.id).not.toBe(his[1]!.id)
    expect(noticesFor(HEX).filter(n => !m.has(n.id))).toHaveLength(2)
  })
  it('one person\'s read never changes another\'s: Ranger taps his line, Hex\'s same change stays unread — and Hex\'s "Mark all read" leaves Ranger\'s other line unread', async () => {
    await boot()
    file([RANGER, HEX]); tick(); cx(WED, 'WX')
    member(RANGER)
    expect(markNoticeRead(noticesFor(RANGER)[0]!.id)).toBe(true)
    expect(unreadFor(RANGER)).toBe(1); expect(unreadFor(HEX)).toBe(2)
    expect(markNoticeRead(noticesFor(HEX)[0]!.id), 'he cannot read another man\'s notice for him').toBe(false)
    expect(unreadFor(HEX)).toBe(2)
    member(HEX)
    expect(markAllNoticesRead()).toBe(true)
    expect(unreadFor(HEX)).toBe(0); expect(unreadFor(RANGER)).toBe(1)
  })
  it('a hand-made write of ANOTHER person\'s read record is refused at the gate, and nothing is kept', async () => {
    await boot()
    file([RANGER, HEX])
    member(RANGER)
    const res: any = commitSettingsIntent('notices.seen', { owner: HEX }, () => { store.set('noticeseen:' + HEX, { upto: Date.now() + 1e9, ids: [] }) })
    expect(res.ok, 'refused').toBeFalsy()
    expect(store.get('noticeseen:' + HEX, null)).toBeNull()
    expect(unreadFor(HEX)).toBe(1)
  })
  it('a person with no person behind the sign-in (a guest): the bell is dark, a tap says "Nothing new", and nothing breaks', async () => {
    await boot()
    file([RANGER, HEX])
    setSession({ user: 'guest', role: 'guest', name: 'guest' }); setMe(null)
    expect(bellOn()).toBe(false)
    await draw(); await tap($('#notifyBell'))
    expect($('[data-testid="bell-empty"]')!.textContent).toBe('Nothing new')
    expect(lines()).toHaveLength(0)
  })
  it('the Scheduler Board\'s bell and the top bar\'s are one list: it says "open" on the bell that was tapped, and only on that one', async () => {
    await boot()
    file([RANGER, HEX])
    member(RANGER)
    await draw()
    await tap($('#sbBell'))
    expect(bellListOpen()).toBe(true)
    expect($$('[data-testid="bell-list"]'), 'ONE list').toHaveLength(1)
    expect($('#sbBell')!.getAttribute('aria-expanded')).toBe('true')
    expect($('#notifyBell')!.getAttribute('aria-expanded')).toBe('false')
    expect($('#sbBell')!.classList.contains('on') && $('#notifyBell')!.classList.contains('on'), 'both lit').toBe(true)
    await tap($('[data-testid="bell-markall"]'))
    expect($('#sbBell')!.classList.contains('on') || $('#notifyBell')!.classList.contains('on'), 'both dark').toBe(false)
  })
  it('a tap on a line of an input he may only read (he is in it, he did not file it): it opens, and the line is read', async () => {
    await boot()
    file([RANGER, HEX]); tick()
    member(HEX)
    await draw(); await tap($('#notifyBell'))
    await tap(lines()[0]!)
    expect(pops.INPEDIT, 'the input\'s own window').toBe(rec())
    expect(unreadFor(HEX)).toBe(0)
    expect(CURPAGE).toBe('inputs')
  })
  it('D769 / step 7 item 7: the view\'s own alert still comes before the list — the first tap says "Notifications cleared" and opens nothing; the next opens the list', async () => {
    await boot()
    file([RANGER, HEX])
    member(RANGER)
    setPage('viewsched'); markBell('viewsched', RANGER)
    await draw()
    SAID = []
    await tap($('#notifyBell'))
    expect(SAID).toContain('Notifications cleared')
    expect(bellListOpen()).toBe(false)
    expect($('#notifyBell')!.classList.contains('on'), 'his unread notice still lights it').toBe(true)
    await tap($('#notifyBell'))
    expect(bellListOpen()).toBe(true)
    expect(lines()).toHaveLength(1)
  })
  it('D769: once the OIL question is answered the next tap opens the list', async () => {
    await boot()
    HOOKS.oilEarningDay = ((di: number) => di === SAT) as any
    member(RANGER)
    expect(commitInput(null, DRAFT(SAT, { type: 'Duty' }), [RANGER])).toBe(true)
    pops.setOilAsk(null); pops.setInpEdit(null)
    asOther(admin, () => file([RANGER, HEX], THU, { title: 'Kit check' }))
    bellTap()
    expect(bellListOpen()).toBe(false); expect(pops.OILASK).toBeTruthy()
    pops.setOilAsk(null); pops.setInpEdit(null)
    expect(commitInput(rec(), draftOf(rec()), [RANGER], { oil: { '2026-07-18': 0 } } as any), 'he answers No').toBe(true)
    setPage('viewsched')
    bellTap()
    expect(pops.OILASK, 'no question left').toBeNull()
    expect(bellListOpen()).toBe(true)
  })
  it('(found a fault, fixed 12 Oct 26) a sign-out closes the list — the next person to sign in does not find it standing open', async () => {
    await boot()
    file([RANGER, HEX])
    member(RANGER)
    bellTap()
    expect(bellListOpen()).toBe(true)
    resetSession(null)
    expect(bellListOpen(), 'a click-open popup does not outlive the sign-in it was opened in').toBe(false)
  })
  it('a line whose input is gone, tapped: said, read, and the list stays where it is', async () => {
    await boot()
    file([RANGER]); tick(); removeInput(rec())
    member(RANGER)
    await draw(); await tap($('#notifyBell'))
    SAID = []
    openNotice(noticesFor(RANGER)[1]!)                          // the older line — "You were added" — its input is gone too
    await redraw()
    expect(SAID).toContain('That input is gone')
    expect(bellListOpen()).toBe(true)
    expect(unreadFor(RANGER)).toBe(1)
  })
})

describe('Undo, Redo and reading (D148; Fable F9; R11)', () => {
  it('the maker\'s Undo after TWO readers have read — one by a tap, one by "Mark all read" — still goes through, and both notices go', async () => {
    await boot()
    file([RANGER, HEX]); tick()
    const m = mark()
    expect(rowPut(`${rowKey()}.+`, PIKE)).toBe('done')
    tick()
    asOther(() => member(RANGER), () => { expect(markNoticeRead(since(m).find(n => n.to === RANGER)!.id)).toBe(true) })
    asOther(() => member(HEX), () => { expect(markAllNoticesRead()).toBe(true) })
    const u = globalUndo()
    expect(u.ok, 'not refused by two readers — ' + String((u as any).reason || '')).toBe(true)
    expect(since(m)).toEqual([])
    expect(ppl()).toEqual([RANGER, HEX])
  })
  it('a reload between the change and the Undo: the notices and what was read are saved; the steps are the sign-in\'s, so there is nothing to undo', async () => {
    await boot()
    file([RANGER, HEX]); tick()
    expect(rowPut(`${rowKey()}.+`, PIKE)).toBe('done')
    asOther(() => member(RANGER), () => { expect(markNoticeRead(noticesFor(RANGER)[0]!.id)).toBe(true) })
    const before = NOTICES.map(n => JSON.stringify(n)).sort()
    await reload()
    expect(NOTICES.map(n => JSON.stringify(n)).sort(), 'every notice, as it was').toEqual(before)
    expect(undoState().canUndo).toBe(false)
    expect(unreadFor(RANGER), 'the line he tapped is still read').toBe(1)
    expect(unreadFor(PIKE)).toBe(1)
  })
  it('D148: once another scheduler has changed the same input, the maker\'s Undo is refused — and the notices it made stay', async () => {
    await boot()
    file([RANGER, HEX]); tick()
    const m = mark()
    expect(rowPut(`${rowKey()}.+`, PIKE)).toBe('done')
    tick()
    asOther(() => { setSession({ user: 'ad2', role: 'admin', name: 'ad2' }); setMe('harpoon') }, () => { expect(commitInput(rec(), { ...draftOf(rec()), sTime: '10:00', eTime: '11:00' }, [RANGER, HEX, PIKE])).toBe(true) })
    const all = since(m).map(n => n.id).sort()
    expect(all, 'three for the add; four for the new time — the three in it, and Saber who filed it').toHaveLength(7)
    const u = globalUndo()
    expect(u.ok, 'refused').toBe(false)
    /* (which sentence — "Trident changed this after your action" for a change that arrived from another device, "a later
       change touches the same thing" for one made in this browser — is the Undo's own business, undo/timeline.ts) */
    expect(String((u as any).reason || ''), 'and it says why').not.toBe('')
    expect(since(m).map(n => n.id).sort(), 'nothing taken back').toEqual(all)
    expect(ppl()).toEqual([RANGER, HEX, PIKE])
  })
  it('a member cannot forge a notice, nor take one out of his own list, by a hand-made write: refused whole at the commit gate', async () => {
    await boot()
    file([RANGER, HEX]); tick()
    member(RANGER)
    const before = JSON.stringify(NOTICES)
    /* (found again by its id each time: a refused command puts the list back as new objects) */
    const mineId = noticesFor(RANGER)[0]!.id
    const mine = () => { const n = NOTICES.find(x => x.id === mineId); expect(n, 'his notice').toBeTruthy(); return n! }
    expect(writeInputs(() => { NOTICES.push({ id: 'nforged', to: HEX, by: SABER, at: Date.now(), iid: String(inpId(rec())), name: TITLE, day: '2026-07-15', what: [{ k: 'cx' }] }) }), 'a notice in another man\'s name').toBe(false)
    expect(writeInputs(() => { NOTICES.push({ id: 'nforged2', to: HEX, by: RANGER, at: Date.now(), iid: String(inpId(rec())), name: TITLE, day: '2026-07-15', what: [{ k: 'cx' }] }) }), 'a notice with no change of his to the input it names').toBe(false)
    expect(writeInputs(() => { NOTICES.splice(NOTICES.indexOf(mine()), 1) }), 'a notice taken away').toBe(false)
    expect(writeInputs(() => { (mine().what as any) = [{ k: 'del' }] }), 'a notice rewritten').toBe(false)
    expect(JSON.stringify(NOTICES), 'rolled back, every time').toBe(before)
  })
  it('(found a fault, fixed 12 Oct 26) Saber adds Pike, undoes it, and Redoes it AFTER Ranger pressed "Mark all read" on something newer: Ranger never saw that Pike was added — he must still be told (D755 (3))', async () => {
    await boot()
    file([RANGER, HEX]); file([RANGER], THU, { title: 'Kit check' }); tick()
    const m = mark()
    expect(rowPut(`${rowKey()}.+`, PIKE)).toBe('done')          // told: "Pike added" — unread
    tick()
    expect(globalUndo().ok).toBe(true)                          // gone before Ranger looked
    expect(sinceTo(m, RANGER)).toEqual([])
    tick()
    /* a second scheduler changes Ranger's OTHER input, so a newer notice stands; then Ranger reads everything — "Mark all
       read" keeps a time ("everything up to my newest"), and the notice a Redo puts back carries its first time */
    asOther(() => { setSession({ user: 'ad2', role: 'admin', name: 'ad2' }); setMe('harpoon') }, () => { expect(commitInput(rec('Kit check'), { ...draftOf(rec('Kit check')), remarks: 'new' }, [RANGER], { sched: true } as any)).toBe(true) })
    asOther(() => member(RANGER), () => { expect(markAllNoticesRead()).toBe(true); expect(unreadFor(RANGER)).toBe(0) })
    tick()
    const r = globalRedo()
    expect(r.ok, 'Saber\'s Redo — ' + String((r as any).reason || '')).toBe(true)
    expect(ppl(), 'Pike is in Ranger\'s input').toEqual([RANGER, HEX, PIKE])
    expect(sinceTo(m, RANGER).some(l => l.includes(`${cs(PIKE)} added`)), 'the notice is back').toBe(true)
    expect(unreadFor(RANGER), 'and it is UNREAD — he has never seen it').toBe(1)
  })
})

/* ---- WITH THE LEAVE WAR WIRED, as the running app always is (leavewar/sync.ts) — last in the file: the wired sync
   leaves a live subscription behind ---- */
describe('with the Leave War wired: a posting, an archive, a leave the war approved, sick leave cutting one man\'s part', () => {
  async function bootLW() {
    await boot()
    lwInitStore(memoryBackend())
    accountsLoad()
    setPeople(projectPeople())
    wireLeaveWarSync()
    _resetTimeline(); lwHistInit(); installGlobalUndo()
    admin(); setRole('admin')
  }
  /* A PRODUCT FAULT WHEN THIS WAS WRITTEN — FIXED 12 Oct 26, the case kept as its pin. The plan §4.10: "when the APP takes a man out (a posting on its date, a delete) the
     others in the input are told in plain words with no name"; §10 step 7 item 6 names the two commands
     (state/sched-commit.ts APP_ACTS: 'person.delete', 'lw.postoutRun'). The posting's pass (leavewar/sync.ts
     runPoOutcomes) is committed as a PROJECTION — and tellPass tells only for origin 'user' — so run on its date, by
     itself, it tells NOBODY; `APP_ACTS.has('lw.postoutRun')` can never be reached. */
  it('(found a fault, fixed 12 Oct 26) a posting out that DELETES a man, run by the calendar reaching its date: the others in his input are told he was taken off, with no name (the plan §4.10; R12)', async () => {
    await bootLW()
    file([RANGER, HEX, PIKE]); tick()
    const m = mark()
    expect(postOut(HEX, '2026-06-05', 'delete'), 'a posting still to come').toBe(true)
    expect(PEOPLE[HEX].deleted, 'it waits for its date').toBeFalsy()
    expect(since(m)).toEqual([])
    vi.setSystemTime(new Date(2026, 5, 5, 9, 0, 0))
    runPoOutcomes()
    expect(PEOPLE[HEX].deleted, 'the posting ran').toBe(true)
    expect(ppl(), 'he left the input; it carries on').toEqual([RANGER, PIKE])
    expect(sinceTo(m, RANGER)).toEqual([`${TITLE} · Wed 15 Jul — ${cs(HEX)} taken off`])
    expect(sinceTo(m, PIKE)).toEqual([`${TITLE} · Wed 15 Jul — ${cs(HEX)} taken off`])
    expect(sinceTo(m, HEX)).toEqual([])
  })
  /* …and where the posting's date is TODAY the pass runs inside the admin's own "Post out" (a child of `lw.postout`,
     which is not one of APP_ACTS): the others ARE told, but with the admin's name after it — where the admin's own
     Delete of the same man (above, 'person.delete') says no name. R12 gives the posting no name. */
  it('(found a fault, fixed 12 Oct 26) …and a posting dated today tells them the same way — with no name, as the admin\'s own Delete does (R12)', async () => {
    await bootLW()
    file([RANGER, HEX, PIKE]); tick()
    const m = mark()
    expect(postOut(HEX, '2026-06-01', 'delete'), 'posted out today, with Delete').toBe(true)
    expect(PEOPLE[HEX].deleted, 'the posting ran').toBe(true)
    expect(ppl()).toEqual([RANGER, PIKE])
    expect(sinceTo(m, RANGER)).toEqual([`${TITLE} · Wed 15 Jul — ${cs(HEX)} taken off`])
    expect(sinceTo(m, PIKE)).toEqual([`${TITLE} · Wed 15 Jul — ${cs(HEX)} taken off`])
    expect(sinceTo(m, HEX)).toEqual([])
  })
  it('an ARCHIVED man is never told: a change to an input he is still in tells the others only', async () => {
    await bootLW()
    file([RANGER, HEX, PIKE]); tick()
    archivePerson(PIKE)
    expect(PEOPLE[PIKE].archived).toBe(true)
    expect(ppl(), 'an archive leaves him in the input (only a delete takes him out)').toEqual([RANGER, HEX, PIKE])
    tick()
    const m = mark()
    cx(WED, 'WX')
    expect(since(m).map(n => n.to).sort(), 'nothing addressed to the archived man').toEqual([RANGER, HEX].sort())
    expect(sinceTo(m, RANGER)).toEqual([`${TITLE} · Wed 15 Jul — Cancelled — WX · ${cs(SABER)}`])
  })
  it('R36: a leave the war approves lights no bell here — and a later change to that leave by someone else does tell him', async () => {
    await bootLW()
    const day = String(getState().period.open[0]?.from ?? getState().period.start)
    const m = mark()
    setCells([{ personId: RANGER, date: day }], 'LL')
    /* the admin decides at any time — no stage to move first (D1177, D418) */
    setBidStates([{ personId: RANGER, date: day }], 'approved')
    const leave = INPUTS.find((x: any) => x.lw && idsOf(x).map(String).includes(RANGER)) as any
    expect(leave, 'the approved leave is an input').toBeTruthy()
    expect(since(m), 'approved on the war: no notice').toEqual([])
    tick()
    expect(setLeaveRemarks(leave, 'Bali')).toBe(true)
    expect(sinceTo(m, RANGER).map(l => l.split(' — ')[1])).toEqual([`Remark changed · ${cs(SABER)}`])
  })
  it('sick leave a man files himself cuts HIS part out of a leave for three: the other two and the filer are told he was taken off — he is told nothing, and nobody is told "added"', async () => {
    await bootLW()
    const LEAVE = 'SCN shared'
    expect(commitInput(null, { ...draftOf({ person: RANGER, type: 'LL', date: 'Jul 14', yr: 2026, allday: true, remarks: LEAVE }), end: '2026-07-16' }, [RANGER, HEX, PIKE])).toBe(true)
    tick()
    member(RANGER); setRole('member')
    const m = mark()
    expect(commitInput(null, draftOf({ person: RANGER, type: 'ATT C', date: 'Jul 15', yr: 2026, allday: true, remarks: 'flu' }), [RANGER]), 'his own sick leave on the Wednesday').toBe(true)
    const shared = INPUTS.filter((x: any) => x.type === 'LL' && String(x.remarks || '').includes(LEAVE) && idsOf(x).length > 1) as any[]
    expect(shared.map(r => idsOf(r).map(String)), 'the leave carries on for the other two').toEqual([[HEX, PIKE]])
    expect(sinceTo(m, RANGER), 'his own act: he is told nothing').toEqual([])
    expect(since(m).filter(n => n.to === HEX).map(n => noticeWords(n).what)).toEqual([`${cs(RANGER)} taken off`])
    expect(since(m).filter(n => n.to === PIKE).map(n => noticeWords(n).what)).toEqual([`${cs(RANGER)} taken off`])
    expect(since(m).filter(n => n.to === SABER).map(n => noticeWords(n).what), 'its filer').toEqual([`${cs(RANGER)} taken off`])
    expect(since(m).some(n => noticeWords(n).what.includes('added'))).toBe(false)
  })
})
