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
   place (D745 set aside by D755).

   ALL AVAIL / ALL AS ONE OF THE PEOPLE (step 3 of the build, 12 Oct 26 — owner D750, D753, D755, D757). Until that step
   this file pinned "ALL AVAIL on an input's row is refused with the input's own sentence" ("… is filed on its own …" —
   a sentence the app no longer has); that pin is flipped where it stood, and the four ALL AVAIL cases of
   grouprow-hands.test.tsx that step 2 dropped are back, each as its ruling stands now — the last block of this file,
   "ALL AVAIL / ALL on an input's row — every hand". Each case there says which of four it is: the rule survives; a
   named ruling changed it; old data; or its subject is gone. (The first pass through the doors, the refusals' words,
   OIL and the published count are the builder's own file, ui/phmember.test.tsx; this is the second pass, hand by hand.)

   ONE DOOR (ui/reqdoor.ts) is asked by every place that writes a person to a ground row, and a BELT in the engine
   (slots.ts setSlotVal / fillSlot) refuses a raw write that reaches such a row without it. Driven through the door, the
   store's writers, the typed box's door, the drop itself (ui/drag.ts applyDrop, on a stand-in element carrying the
   place's key), an armed place filled by a tap and the right-click on the mounted app, on a real saved store. A real
   drag is walked in the browser. */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { INPUTS, inpId, idsOf, isLateInput, inputLines } from '../engine/inputs'
import { PEOPLE, ID_BY_CS, indexCallsigns } from '../engine/people'
import { DAYS } from '../engine/data'
import { CURWEEK } from '../engine/waves'
import { storeBackend, HOOKS } from '../engine/hooks'
import { stashClear } from '../engine/weekstash'
import { SCHED } from '../engine/publish'
import { ELOG, elogFlush, elogClear, elogLoad } from '../engine/editlog'
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
import { globalUndo, globalRedo } from '../undo'
import { _resetTimeline } from '../undo/timeline'
import { installGlobalUndo } from '../state/undo-wire'
import { _resetDisclosure } from '../state/disclosure'
import { schedWrite, SCHED_TYPES } from '../state/sched-commit'
import { setPage, setBoardDay } from '../state/view'
import * as view from '../state/view'
import { refreshHistDots, storyOf } from './histbubble'
import { commitInput, commitNewInput, draftOf, setInpField } from './inputedit'
import { rowPut, rowTake, rowMove, onInputRow, isRowMan } from './reqdoor'
import { answerOilWait } from './oilwait'
import * as pops from './pops'
import { applyDrop, setDrag } from './drag'
import { pendingLand } from './lift'
import { boardMbtn, cxCommit } from './board'
import { routeClick } from './interactions'
import { addDayTpl, applyDayTpl, dayTplReset } from '../engine/daytpl'
import { applyMove } from '../engine/reorder'
import { groundOrder } from '../engine/order'

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
  view.setOilWait(null); view.setOilBar(null)
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

describe('an input is ONE row, a whole copy of the input (D755, D756 — the plan §4.3) (GI13)', () => {
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

describe('a person put on the row JOINS the input (D755) (GI6)', () => {
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
      expect(isLateInput(rec()), 'nobody reads late for it (D741) (GI8)').toBe(false)
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
  /* A NAMED RULING CHANGED THE LAST HALF OF THIS CASE (owner D783, 12 Oct 26): it pinned "no answer yet: the question
     opens at once, for the input" — AFTER the add was made. Now an add that raises the question is not made until it
     is answered (the whole of that is ui/oilwait.test.tsx); here, that he is NOT in it and no window of the input opens. */
  it('he follows the input\'s ONE OIL answer: nothing is written for him; a No says he is not counted; with NO answer the add waits on the question (D755 (1), D762, D783)', async () => {
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
    expect(rowPut(`${rowKey(SAT)}.+`, 'split'), 'no answer yet: the add waits on the question').toBe('asked')
    expect(people(SAT), 'and he is not in it').toEqual(['bane', 'pike'])
    expect(view.OILWAIT!.kind).toBe('add')
    expect(pops.OILASK, 'no window of the input is opened for it').toBeFalsy()
  })
})

describe('a person put on the ONLY person\'s puck replaces him (D755 (2); the plan\'s T15 — Fable F7, F8)', () => {
  /* A NAMED RULING CHANGED THIS CASE (owner D783): it pinned the replacement made at once, "the OIL answer is void and
     asked again" over the input's window. Now the question is put FIRST and the replacement is made with its answer —
     the first man's own answer still does not pass to the new man. */
  it('from the crew list: the question first; answered, the input becomes the new man\'s — "by" passes to whoever did it, and its OIL answer is the one just given, never the first man\'s', async () => {
    await boot(new MemoryBackend())
    setSession({ user: 'us', role: 'main', name: 'us' }); setMe('bane')
    expect(commitNewInput(DRAFT(SAT))).toBe(true)
    rec(SAT).oil = { [SAT_ISO]: 0.5 }
    setSession({ user: 'ad', role: 'admin', name: 'ad' }); setMe('stiff')
    const id = String(inpId(rec(SAT)))
    expect(rowPut(rowKey(SAT), 'pike')).toBe('asked')
    expect(people(SAT), 'nothing moved').toEqual(['bane'])
    expect(answerOilWait({ [SAT_ISO]: 0 })).toBe(true)
    expect(people(SAT)).toEqual(['pike'])
    expect(String(inpId(rec(SAT))), 'the same input').toBe(id)
    expect(rec(SAT).by, 'by Saber now').toBe('stiff')
    expect(rec(SAT).oil, 'the answer was the first man\'s own — the new man\'s is the one given with the swap').toEqual({ [SAT_ISO]: 0 })
    expect(pops.OILASK, 'and no question is left standing').toBeFalsy()
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
  /* A PERSONAL INPUT'S ROW IS A ROW LIKE ANY INPUT'S (owner D776, 12 Oct 26 — "A2 B2": it may hold several people, and
     a puck dropped on its row swaps or joins as on any input's). A NAMED RULING CHANGED THIS CASE: after the job's walk
     (share B, B8) it pinned "a man dropped ON its one person's puck is refused — A Personal input is one person's own"
     (D755 (4), D757), the refusal that walk had added. It is withdrawn, and what every other kind does is pinned here
     for this one: from the crew list he replaces the only person; from a seat the two swap; on "+ add" he joins. */
  it('a Personal input: a man dropped ON its one person\'s puck replaces him; from a seat the two swap; on "+ add" he joins (D776)', async () => {
    await boot(new MemoryBackend())
    file(['bane'], WED, undefined, { type: 'Personal' })
    expect(rowPut(rowKey(), 'pike'), 'from the crew list').toBe('done')
    expect(people()).toEqual(['pike'])
    expect(SAID.join(' | ')).not.toMatch(/one person/)
    const seat = '2.0.0.0.p', flew = String(slotVal(seat))
    expect(flew && flew !== 'pike').toBeTruthy()
    SAID = []
    setDrag({ kind: 'slot', key: seat })
    applyDrop(seatEl(rowKey()), 0, 0)
    expect(people(), 'from a seat: the swap').toEqual([flew])
    expect(slotVal(seat), 'and the man replaced took the seat').toBe('pike')
    expect(SAID.join(' | ')).toContain(`${cs(flew)} and ${cs('pike')} swapped`)
    expect(rowPut(`${rowKey()}.+`, 'split'), 'on "+ add"').toBe('done')
    expect(people(), 'a Personal input of two').toEqual([flew, 'split'])
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

describe('a puck taken off the row takes that person out of the input (D755) (GI9)', () => {
  /* THE CHANGE HISTORY'S LINE FOR ONE PERSON PUT IN OR TAKEN OUT IS MARKED AS HIS — in the SAVED line (the one-rule job's
     walk, shares C and J — C11, J2 — 12 Oct 26). The changes window keeps his name on such a line, and History tells it
     on HIS row alone, by a mark on the line (`one`) — which the history's writer never stored (engine/editlog.ts
     logAction copied a fixed list of fields and `one` was not on it). Every test that pinned those readers built its
     line by hand WITH the mark, so they passed while the running app read "Range brief 15 Jul · added" — nobody named
     — and showed one man's line on every man's row. Through the real door, on the real saved line: */
  it('the saved history line of a person put in, and of one taken out, carries his id and the mark that it is his', async () => {
    await boot(new MemoryBackend())
    file(['bane', 'pike'])
    const before = lines()
    expect(rowPut(`${rowKey()}.+`, 'split')).toBe('done')
    expect(rowTake(keyOf('pike'))).toBe('done')
    const made = (ELOG.rows as any[]).slice(before)
    const added = made.find(r => / · added/.test(r.lbl)), out = made.find(r => / · taken out/.test(r.lbl))
    expect(added && added.lbl, 'a line for the man put in, naming him').toContain(cs('split'))
    expect([added.sub, added.one], 'filed under him, marked as his').toEqual(['split', 1])
    expect(out && out.lbl).toContain(cs('pike'))
    expect([out.sub, out.one]).toEqual(['pike', 1])
    /* …AND THE MARK COMES BACK FROM STORAGE (Fable's second read, finding 1 — 12 Oct 26): the line was saved whole, but
       the reader at start-up (engine/editlog.ts elogLoad) rebuilds each line from a fixed list of fields and the mark
       was not on it — so after a reload the changes window dropped the man's name again and History told his line on
       every man's row. The saved history, read back as a boot reads it: */
    elogFlush()
    const n = ELOG.rows.length
    elogClear(); elogLoad()
    expect(ELOG.rows.length, 'the history came back').toBe(n)
    const back = (ELOG.rows as any[]).filter(r => r.one)
    expect(back.map(r => r.sub).sort(), 'both lines still marked as one man\'s, each under him').toEqual(['pike', 'split'])
  })
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
    expect(SAID.join(' ')).toContain(`${cs('bane')} is the last on this input — take the input off the programme, or delete it in its own window`)
    setDrag({ kind: 'slot', key: rowKey() })
    expect(applyDrop(document.body, 0, 0)).toBe(false)
    writeSlot(rowKey(), '')
    expect(JSON.stringify(INPUTS)).toBe(was)
    expect(onRow()).toEqual(['bane'])
  })
  it('dragged onto a flying seat: OUT of the input and IN the seat, one step; refused whole where he is the last (GI10)', async () => {
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

describe('THE BELT in the engine, and the doors that reach the input (the plan\'s T8) (GI15)', () => {
  it('a raw write to ANY place of an input\'s row is refused: nothing written, no mark', async () => {
    await boot(new MemoryBackend())
    file(['bane', 'pike'])
    const marks = JSON.stringify(SCHED.pending), rows = JSON.stringify(ground())
    expect(setSlotVal(keyOf('pike'), 'split'), 'another person into a place').toBe(false)
    expect(setSlotVal(keyOf('pike'), ''), 'a place emptied').toBe(false)
    expect(setSlotVal(rowKey(), 'split'), 'the name box').toBe(false)
    expect(fillSlot(`${rowKey()}.+`, 'split'), 'a person on "+ add"').toBe(false)
    /* (the rule survives step 3: a placeholder is one of the INPUT's people now, so it goes in by the input's door like
       anyone — never by a raw write. Until the one-rule build this line read `true`: "a placeholder is the row's own",
       D46, which D755 changed for an input's row) */
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
  /* A NAMED RULING CHANGED THE RULE (2). Until step 3 this case read "ALL AVAIL on an input's row is refused with the
     input's own sentence until it may be one of the people" — the drop answered false and said "ALL AVAIL is filed on
     its own — it already stands for whoever is free". D750, D753 and D755 lift that: it is one of the input's own
     people, and the same drop JOINS. The sentence is gone from the app; nothing says it. */
  it('ALL AVAIL dropped on an input\'s row JOINS the input — it is one of the people now, and nothing says "filed on its own" (D750, D755)', async () => {
    await boot(new MemoryBackend())
    file(['bane', 'pike'])
    setDrag({ kind: 'roster', id: 'allavail' })
    expect(applyDrop(cellEl(`${rowKey()}.+`), 0, 0)).toBe(true)
    expect(people()).toEqual(['bane', 'pike', 'allavail'])
    expect(onRow(), 'and the row says what its input says').toEqual(['bane', 'pike', 'allavail'])
    expect(SAID).toEqual([`ALL AVAIL added to ${TITLE}`])
    expect(SAID.join(' ')).not.toMatch(/filed on its own/i)
  })
})

describe('a box typed on the row changes the input — one record, for everyone in it (D739, D740) (GI12)', () => {
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

/* ==== ALL AVAIL / ALL ON AN INPUT'S ROW — EVERY HAND (step 3 of the one-rule build, 12 Oct 26). His rulings:
   D750 — "'Several people' takes ALL AVAIL / ALL, so the puck is one of the input's own people and is tied to no man";
   D753 — one day only; ALL or ALL AVAIL, never both; D755 — whoever stands on the row, "a named person or ALL AVAIL /
   ALL, whoever put them there", is in the input; (4) a drop that cannot apply is refused with its reason;
   D757 — "ALL AVAIL stays when anyone leaves"; D33 / D47 — a placeholder never crews a jet; D271 / D278 — once on a row.
   The plan's table of hands (§4.4): put anywhere it JOINS, never replaces; taken off it LEAVES; the last on the row is
   refused; from one input's row to another's it MOVES; from a seat that is not an input's row it joins and that seat
   keeps it.
   EACH CASE SAYS WHICH OF FOUR IT IS — (1) the rule survives, on a rebuilt fixture; (2) a named ruling changed the
   rule, and the case pins what the ruling says now; (3) old data; (4) the subject is gone, and what is true now is
   pinned. The four ALL AVAIL cases of ui/grouprow-hands.test.tsx (as it stood on main) are among them. ==== */
describe('ALL AVAIL / ALL on an input\'s row — every hand (D750, D753, D755, D757; the plan §4.4)', () => {
  const A = 'allavail'
  const K2 = 'Second brief'
  const both = () => JSON.stringify([INPUTS, DAYS])
  const drop = (from: any, el: Element) => { setDrag(from); return applyDrop(el, 0, 0) }
  const fromList = (id: string) => ({ kind: 'roster', id })
  const fromSeat = (key: string) => ({ kind: 'slot', key })
  const second = (ppl: string[], over: any = {}) => expect(commitInput(null, DRAFT(WED, { title: K2, sTime: '16:00', eTime: '17:00', ...over }), ppl)).toBe(true)
  /* a row of the scheduler's own — nobody filed it — written by its holder, as any hand-built row is */
  const ownRow = (who: string) => {
    schedWrite(SCHED_TYPES.mutate, () => { ground().push({ prog: 'SQN PT', str: '07:00', end: '08:00', who, rmks: '' }); view.afterSchedMutate() })
    const ri = ground().findIndex((g: any) => g && g.prog === 'SQN PT' && !g.src)
    expect(ri).toBeGreaterThanOrEqual(0)
    return `g:${WED}.${ri}`
  }
  const member = (id: string) => { setSession({ user: 'us', role: 'main', name: 'us' }); setMe(id) }

  /* A SWAP THE SEAT REFUSES SAYS WHY (the job's walk, share B, B3; Fable's read of the finished code, finding 4 — 12 Oct
     26). The man replaced must take the seat the newcomer came from; where he cannot (he is already on that row — D271)
     the whole swap is refused, and it said only "Not saved — that change was refused, and nothing was kept". */
  describe('a swap the seat refuses says why', () => {
    it('the man replaced is already on the row the newcomer came from: refused whole, naming both and the reason', async () => {
      await boot(new MemoryBackend())
      file(['bane'])
      const own = ownRow('pike')
      expect(fillSlot(`${own}.+`, 'bane'), 'both men on the scheduler\'s own row').toBe(true)
      SAID = []
      const was = JSON.stringify([rec(), ground()])
      drop(fromSeat(own), seatEl(rowKey()))
      expect(people(), 'nobody replaced').toEqual(['bane'])
      expect(JSON.stringify([rec(), ground()]), 'nothing moved').toBe(was)
      const said = SAID.join(' | ')
      expect(said).toContain('already on')
      expect(said).toContain(cs('bane'))
      expect(said).toContain(cs('pike'))
      expect(said, 'never the bare refusal').not.toContain('Not saved')
    })
  })

  describe('from the crew list', () => {
    /* (2) grouprow-hands: "ALL AVAIL dropped anywhere on the row is the ROW's own — never a man's place: it joins the
       lead's extras … nobody was added to the input" (D46, D745). D755: it is IN the input. What survives of the old
       case is "never a man's place" — it never replaces anyone. */
    it('dropped ON A MAN\'S PUCK it joins the input beside him — never into his place; one line of the history, one Undo, one Redo', async () => {
      await boot(new MemoryBackend())
      file(['bane', 'pike'])
      const before = lines()
      expect(drop(fromList(A), seatEl(keyOf('pike')))).toBe(true)
      expect(people(), 'in the input, after the people who were there').toEqual(['bane', 'pike', A])
      expect(onRow()).toEqual(['bane', 'pike', A])
      expect(lines() - before, 'one line in the change history').toBe(1)
      expect(pendingLand()!.sel, 'the landing flash is on ITS place, not on the man it was dropped on').toContain(`[data-slot="${keyOf(A)}"]`)
      expect(globalUndo()).toBeTruthy()
      expect([people(), onRow()], 'ONE Undo').toEqual([['bane', 'pike'], ['bane', 'pike']])
      expect(globalRedo()).toBeTruthy()
      expect([people(), onRow()], 'ONE Redo').toEqual([['bane', 'pike', A], ['bane', 'pike', A]])
    })
    /* (2) D278 — "a placeholder may stand on a row twice" — is narrowed on an input's row by D753: "an input takes ALL
       or ALL AVAIL, never both", and the same one never twice. On a row nobody filed D278 stands (the control). */
    it('a second one is refused in words — the same again, or ALL beside ALL AVAIL (D753); on a row nobody filed it may still stand twice (D278)', async () => {
      await boot(new MemoryBackend())
      file(['bane', A])
      const was = both()
      SAID = []
      expect(drop(fromList(A), cellEl(`${rowKey()}.+`))).toBe(false)
      expect(drop(fromList('all'), seatEl(keyOf('bane')))).toBe(false)
      expect(SAID).toEqual(['This input already has ALL AVAIL', 'This input already has ALL AVAIL'])
      expect(both(), 'nothing changed').toBe(was)
      const k = ownRow(A)
      writeFill(`${k}.+`, A)
      const own = ground()[+k.split('.')[1]!]
      expect([own.who, own.more], 'THE CONTROL: the scheduler\'s own row').toEqual([A, [A]])
    })
  })

  describe('from a seat elsewhere on the schedule', () => {
    /* (1) the plan's row "dragged from a seat that is NOT an input's row onto the row: joins; the seat it came from
       keeps it" (reading R4 of the shared-row plan), which a named person follows — a placeholder too. */
    it('from a row of the scheduler\'s own: it joins the input and the row it came from KEEPS it — on "+ add", on a puck of several, and on the ONLY person\'s puck (no swap: it never replaces)', async () => {
      for (const where of ['add', 'puck', 'only'] as const) {
        resetWorld(); await boot(new MemoryBackend())
        file(where === 'only' ? ['bane'] : ['bane', 'pike'])
        const k = ownRow(A)
        expect(isRowMan(k), 'not an input\'s row').toBe(false)
        const target = where === 'add' ? cellEl(`${rowKey()}.+`) : seatEl(keyOf('bane'))
        expect(drop(fromSeat(k), target), where).toBe(true)
        const now = where === 'only' ? ['bane', A] : ['bane', 'pike', A]
        expect(people(), where).toEqual(now)
        expect(onRow(), where).toEqual(now)
        expect(slotVal(k), `${where}: the seat it came from keeps it`).toBe(A)
        expect(rec().by, 'and the input stays whose it was').toBe('stiff')
        globalUndo()
        expect([people(), slotVal(k)], `${where}: ONE Undo takes it out of the input, and its own row is untouched`).toEqual([now.slice(0, -1), A])
      }
    })
    /* (1) D755 (2) is about a PERSON on the only person's puck. A man dragged from a cockpit onto an input that holds
       ALL AVAIL alone must not be a swap — the placeholder would be handed his seat, and it can never crew a jet
       (D33). He joins beside it and the seat he came from keeps him. */
    it('a man dragged from a flying seat onto the puck of an input that holds ALL AVAIL alone JOINS beside it — never a swap that would seat ALL AVAIL in a jet (D33)', async () => {
      await boot(new MemoryBackend())
      file([A])
      const seat = '2.0.0.0.p', flew = String(slotVal(seat))
      expect(flew).toBeTruthy()
      expect(drop(fromSeat(seat), seatEl(rowKey()))).toBe(true)
      expect(people()).toEqual([A, flew])
      expect(slotVal(seat), 'the seat he came from keeps him').toBe(flew)
      expect(SAID.join(' | ')).toContain(`${cs(flew)} added to ${TITLE}`)
      globalUndo()
      expect([people(), slotVal(seat)]).toEqual([[A], flew])
    })
  })

  describe('dragged off the input\'s row', () => {
    /* (1) the plan's refusal for D33 — and the reason the brief asks for it: a puck that is refused must STAY. */
    it('onto a flying seat: refused with the cockpit\'s own reason — and it STAYS in the input, the pilot in his seat', async () => {
      await boot(new MemoryBackend())
      file(['bane', A])
      const seat = '2.0.0.0.p', flew = String(slotVal(seat))
      const was = both()
      SAID = []
      expect(drop(fromSeat(keyOf(A)), seatEl(seat))).toBe(false)
      expect(SAID).toEqual(['ALL AVAIL — cannot crew a jet; name the people flying it'])
      expect(both(), 'nothing changed').toBe(was)
      expect(people()).toEqual(['bane', A])
      expect(onRow()).toEqual(['bane', A])
      expect(slotVal(seat)).toBe(flew)
    })
    /* (2) grouprow-hands: "a placeholder … dragged off again onto a man elsewhere, that man is NOT carried back onto
       the row". Then the puck was the row's own extra and simply moved; D755: it is one of the input's people, so it
       LEAVES the input and is put there, one command. What survives: the man it lands on comes off — he is never
       swapped INTO the input. */
    it('onto a duty desk that holds a man: it leaves the input and takes the desk, ONE step — the man comes off, and is not carried onto the input\'s row', async () => {
      await boot(new MemoryBackend())
      file(['bane', 'pike', A])
      const desk = `d:${WED}.0.0`, man = String(slotVal(desk))
      expect(man && man !== A, 'a named man on a duty desk').toBeTruthy()
      expect(drop(fromSeat(keyOf(A)), seatEl(desk))).toBe(true)
      expect(slotVal(desk)).toBe(A)
      expect(people(), 'out of the input; nobody was swapped into it').toEqual(['bane', 'pike'])
      expect(onRow()).toEqual(['bane', 'pike'])
      expect(globalUndo()).toBeTruthy()
      expect([people(), slotVal(desk)], 'ONE Undo puts back both').toEqual([['bane', 'pike', A], man])
      expect(globalRedo()).toBeTruthy()
      expect([people(), slotVal(desk)], 'ONE Redo').toEqual([['bane', 'pike'], A])
    })
    /* (1) D757 step 4 — "the scheduler drags Ranger off … ALL AVAIL STAYS" — by the drag itself: the only NAMED person
       is not the last on the row while ALL AVAIL stands on it, so he may be dragged to a seat. */
    it('the only NAMED person dragged from beside ALL AVAIL onto a flying seat: he is out of the input and in the seat, ALL AVAIL stays — one Undo puts back both', async () => {
      await boot(new MemoryBackend())
      file(['bane', A])
      const seat = '2.0.0.0.p', flew = String(slotVal(seat))
      expect(drop(fromSeat(keyOf('bane')), seatEl(seat))).toBe(true)
      expect([people(), onRow(), slotVal(seat)]).toEqual([[A], [A], 'bane'])
      globalUndo()
      expect([people(), slotVal(seat)], 'ONE Undo').toEqual([['bane', A], flew])
    })
    /* (1) D271 / D753 on the row itself: a puck of the row dropped on its neighbour is no second copy and no swap —
       the row is drawn A to Z whatever the order they joined in, so there is nothing to re-order */
    it('dropped on a neighbour\'s puck on its OWN row, either way round: refused in words, nothing changes', async () => {
      await boot(new MemoryBackend())
      file(['bane', A])
      const was = both()
      SAID = []
      expect(drop(fromSeat(keyOf(A)), seatEl(keyOf('bane')))).toBe(false)
      expect(drop(fromSeat(keyOf('bane')), seatEl(keyOf(A)))).toBe(false)
      expect(SAID).toEqual(['This input already has ALL AVAIL', `${cs('bane')} is already on this input`])
      expect(both()).toBe(was)
    })
    it('onto a row of the scheduler\'s own: out of the input and onto that row, ONE step', async () => {
      await boot(new MemoryBackend())
      file(['bane', A])
      const k = ownRow('rocky')
      expect(drop(fromSeat(keyOf(A)), cellEl(`${k}.+`))).toBe(true)
      const own = () => ground()[+k.split('.')[1]!]
      expect([people(), own().who, own().more]).toEqual([['bane'], 'rocky', [A]])
      globalUndo()
      expect([people(), own().who, own().more || []], 'ONE Undo').toEqual([['bane', A], 'rocky', []])
    })
    /* (1) "a puck taken off … dragged to nowhere … LEAVES the input"; "the LAST entry … REFUSED" — a placeholder is an
       entry like any other. */
    it('let go on nothing: it leaves the input, in words, with one Undo and one Redo; ALONE on the row it is the last — refused, saying how, and it stays', async () => {
      await boot(new MemoryBackend())
      file(['bane', A])
      SAID = []
      expect(drop(fromSeat(keyOf(A)), document.body)).toBe(true)
      expect(SAID).toEqual([`ALL AVAIL taken out of ${TITLE}`])
      expect([people(), onRow()]).toEqual([['bane'], ['bane']])
      globalUndo()
      expect([people(), onRow()], 'Undo').toEqual([['bane', A], ['bane', A]])
      globalRedo()
      expect([people(), onRow()], 'Redo').toEqual([['bane'], ['bane']])
      second([A])
      const was = both()
      SAID = []
      expect(drop(fromSeat(rowKey(WED, K2)), document.body)).toBe(false)
      expect(SAID).toEqual(['ALL AVAIL is the last on this input — take the input off the programme, or delete it in its own window'])
      expect(both()).toBe(was)
      expect(onRow(WED, K2)).toEqual([A])
    })
  })

  describe('from one input\'s row onto another\'s — it MOVES, never in both', () => {
    it('by a real drop, onto the second\'s "+ add" and onto one of its pucks: out of the first, into the second, ONE Undo, ONE Redo', async () => {
      for (const where of ['add', 'puck'] as const) {
        resetWorld(); await boot(new MemoryBackend())
        file(['bane', A])
        second(['rocky'])
        const target = where === 'add' ? cellEl(`${rowKey(WED, K2)}.+`) : seatEl(keyOf('rocky', WED, K2))
        expect(drop(fromSeat(keyOf(A)), target), where).toBe(true)
        expect([people(), people(WED, K2)], where).toEqual([['bane'], ['rocky', A]])
        expect([onRow(), onRow(WED, K2)], `${where}: each row says what its input says`).toEqual([['bane'], ['rocky', A]])
        expect(SAID.join(' | ')).toContain(`ALL AVAIL moved to ${K2}`)
        expect(globalUndo()).toBeTruthy()
        expect([people(), people(WED, K2)], `${where}: ONE Undo`).toEqual([['bane', A], ['rocky']])
        expect(globalRedo()).toBeTruthy()
        expect([people(), people(WED, K2)], `${where}: ONE Redo`).toEqual([['bane'], ['rocky', A]])
      }
    })
    it('refused WHOLE — it stays in the first — where the second cannot take it: it already has one, it runs longer than a day, or it is the first\'s last', async () => {
      await boot(new MemoryBackend())
      file(['bane', A])
      second(['rocky', 'all'])
      let was = both()
      SAID = []
      expect(drop(fromSeat(keyOf(A)), cellEl(`${rowKey(WED, K2)}.+`)), 'the second already has ALL').toBe(false)
      expect(SAID).toEqual(['This input already has ALL'])
      expect(both()).toBe(was)
      resetWorld(); await boot(new MemoryBackend())
      file(['bane', A])
      second(['rocky', 'pike'], { end: '2026-07-17' })
      was = both()
      SAID = []
      expect(drop(fromSeat(keyOf(A)), cellEl(`${rowKey(WED, K2)}.+`)), 'the second runs three days').toBe(false)
      expect(SAID).toEqual(['ALL AVAIL is for one day'])
      expect(both()).toBe(was)
      expect(people(), 'still in the first').toEqual(['bane', A])
      resetWorld(); await boot(new MemoryBackend())
      file([A])
      second(['rocky'])
      was = both()
      SAID = []
      expect(drop(fromSeat(rowKey()), cellEl(`${rowKey(WED, K2)}.+`)), 'the first\'s last').toBe(false)
      expect(SAID.join(' | ')).toContain('ALL AVAIL is the last on this input')
      expect(both()).toBe(was)
    })
    it('a NAMED person dragged onto the puck of ALL AVAIL on another input\'s row moves there and stands beside it', async () => {
      await boot(new MemoryBackend())
      file(['bane', 'pike'])
      second([A])
      expect(drop(fromSeat(keyOf('pike')), seatEl(rowKey(WED, K2)))).toBe(true)
      expect([people(), people(WED, K2)]).toEqual([['bane'], [A, 'pike']])
    })
  })

  describe('an armed place, the store\'s writers and the belt', () => {
    it('an armed "+ add" filled by a tap on ALL AVAIL: it joins and the place is put down; a second placeholder tapped is refused and the place stays armed; a man tapped onto ITS armed puck joins beside it', async () => {
      await boot(new MemoryBackend())
      file(['bane', 'pike'])
      view.armSlot(`${rowKey()}.+`)
      expect(view.placeArmed(A)).toBe(true)
      expect(people()).toEqual(['bane', 'pike', A])
      expect(view.armedKey(), 'put down').toBe('')
      view.armSlot(`${rowKey()}.+`)
      SAID = []
      expect(view.placeArmed('all')).toBe(false)
      expect(view.placeArmed(A)).toBe(false)
      expect(SAID).toEqual(['This input already has ALL AVAIL', 'This input already has ALL AVAIL'])
      expect(view.armedKey(), 'a refusal is not a placement: still armed').toBe(`${rowKey()}.+`)
      view.disarmSlot()
      view.armSlot(keyOf(A))
      expect(view.placeArmed('split'), 'a man tapped onto the placeholder\'s own puck').toBe(true)
      expect(people(), 'he joins; nobody is replaced').toEqual(['bane', 'pike', A, 'split'])
      globalUndo(); globalUndo()
      expect(people(), 'two acts, two Undos').toEqual(['bane', 'pike'])
    })
    it('the store\'s writers reach the door: written to "+ add" it joins; its place written blank it leaves; written INTO a man\'s place it joins beside him; a man written into ITS place joins beside it', async () => {
      await boot(new MemoryBackend())
      file(['bane', 'pike'])
      writeFill(`${rowKey()}.+`, A)
      expect(people()).toEqual(['bane', 'pike', A])
      writeSlot(keyOf(A), '')
      expect(people()).toEqual(['bane', 'pike'])
      writeSlot(keyOf('pike'), A)
      expect(people(), 'the man it was written over is still in the input').toEqual(['bane', 'pike', A])
      writeSlot(keyOf(A), 'split')
      expect(people(), 'and the placeholder a man was written over is too').toEqual(['bane', 'pike', A, 'split'])
      expect(onRow()).toEqual(people())
      /* each write was the door's ONE command: four Undos walk back through them, four Redos forward again */
      const seen: string[][] = []
      for (let i = 0; i < 4; i++) { expect(globalUndo()).toBeTruthy(); seen.push(people()) }
      expect(seen).toEqual([['bane', 'pike', A], ['bane', 'pike'], ['bane', 'pike', A], ['bane', 'pike']])
      for (let i = 0; i < 4; i++) expect(globalRedo()).toBeTruthy()
      expect([people(), onRow()], 'Redo of each').toEqual([['bane', 'pike', A, 'split'], ['bane', 'pike', A, 'split']])
    })
    /* (1) the belt of step 2, on a row that HOLDS a placeholder: the placeholder's place is the input's like any other */
    it('THE BELT: a raw write to the placeholder\'s place, or of a placeholder to any place of the row, is refused — nothing written, no mark', async () => {
      await boot(new MemoryBackend())
      file(['bane', A])
      const marks = JSON.stringify(SCHED.pending), was = both()
      expect(setSlotVal(keyOf(A), ''), 'its place emptied').toBe(false)
      expect(setSlotVal(keyOf(A), 'pike'), 'a man into its place').toBe(false)
      expect(setSlotVal(keyOf(A), 'all'), 'the other placeholder into its place').toBe(false)
      expect(setSlotVal(keyOf('bane'), A), 'it into a man\'s place').toBe(false)
      expect(fillSlot(`${rowKey()}.+`, 'all'), 'a second placeholder on "+ add"').toBe(false)
      expect(fillSlot(`${rowKey()}.+`, A), 'the same one again').toBe(false)
      expect(both()).toBe(was)
      expect(JSON.stringify(SCHED.pending)).toBe(marks)
    })
  })

  /* (1) "a puck taken off — … right-click …" (the plan's table): the real right-click, on the mounted app's own
     listener (ui/Shell.tsx), on the puck Edit Schedule's week drew for the placeholder's place. */
  it('THE RIGHT-CLICK on its puck, on the mounted Edit Schedule: it leaves the input; right-clicked where it is the last, it is refused and stays', async () => {
    await boot(new MemoryBackend())
    file(['bane', A])
    second([A])
    ;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true
    const host = document.createElement('div')
    document.body.appendChild(host)
    const root = createRoot(host)
    try {
      await act(async () => { root.render(<App />) })
      const puck = (key: string) => host.querySelector(`#eWeek .seat[data-slot="${key}"]`) as HTMLElement
      const rightClick = async (key: string) => { expect(puck(key), `the week draws a puck on ${key}`).toBeTruthy(); await act(async () => { puck(key).dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true })) }) }
      SAID = []
      await rightClick(keyOf(A))
      expect(people()).toEqual(['bane'])
      expect(SAID).toEqual([`ALL AVAIL taken out of ${TITLE}`])
      SAID = []
      await rightClick(rowKey(WED, K2))
      expect(people(WED, K2), 'the last on its input: it stays').toEqual([A])
      expect(SAID).toEqual(['ALL AVAIL is the last on this input — take the input off the programme, or delete it in its own window'])
      await act(async () => { globalUndo() })
      expect(people(), 'Undo of the right-click').toEqual(['bane', A])
    } finally {
      await act(async () => { root.unmount() })
      host.remove()
      ;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = false
    }
  })

  /* D763: "who is in an input is changed only by whoever filed it or by a scheduler". Every hand on the schedule is a
     scheduler's: a member's reaches nothing — by the door, the drop, the store's writers or an armed place. */
  it('A MEMBER — not a scheduler — changes nothing by any of these hands, though he is in the input himself (D763)', async () => {
    await boot(new MemoryBackend())
    file(['bane', 'pike', A])
    second(['rocky'])
    member('pike')
    const was = both()
    const k2 = rowKey(WED, K2)
    expect(rowPut(`${k2}.+`, A), 'put on another input').toBe('refused')
    expect(rowTake(keyOf(A)), 'taken off').toBe('refused')
    expect(rowMove(keyOf(A), `${k2}.+`), 'moved').toBe('refused')
    expect(drop(fromList('all'), cellEl(`${k2}.+`)), 'dropped from the crew list').toBe(false)
    expect(drop(fromSeat(keyOf(A)), document.body), 'dragged off').toBe(false)
    expect(drop(fromSeat(keyOf(A)), cellEl(`${k2}.+`)), 'dragged to another input').toBe(false)
    writeFill(`${k2}.+`, A)
    writeSlot(keyOf(A), '')
    view.armSlot(`${k2}.+`)
    expect(view.placeArmed(A), 'an armed place').toBe(false)
    view.disarmSlot()
    expect(both(), 'nothing changed').toBe(was)
  })

  describe('ALL AVAIL is tied to no man (D750) — D745 is set aside by D755', () => {
    /* (2) grouprow-hands: "it comes off WITH the man whose place it stood on — and the app says so" ("ALL AVAIL came
       off <input> with <him> — drop it on the row again if it still applies"; D745). D755 sets D745 aside and D757
       says "ALL AVAIL stays when anyone leaves": the very man it was dropped on leaves, and it stays. */
    it('dropped on a man\'s puck, and that man then taken off: ALL AVAIL STAYS — nothing "comes off with him"; Undo brings back the man', async () => {
      await boot(new MemoryBackend())
      file(['bane', 'pike'])
      expect(rowPut(keyOf('pike'), A)).toBe('done')
      SAID = []
      expect(rowTake(keyOf('pike'))).toBe('done')
      expect([people(), onRow()]).toEqual([['bane', A], ['bane', A]])
      expect(SAID).toEqual([`${cs('pike')} taken out of ${TITLE}`])
      expect(SAID.join(' ')).not.toMatch(/came off/i)
      globalUndo()
      expect([people(), onRow()]).toEqual([['bane', 'pike', A], ['bane', 'pike', A]])
    })
    /* (4) grouprow-hands: "the change history's line for the man who left says the puck came off his row — and names
       anyone switched off on it" (Fable's (a), taken with D745). THE SUBJECT IS GONE: nothing comes off with him, so
       there is nothing for his line to say about the puck, and the switches made under it are untouched (the OIL
       half is ui/phmember.test.tsx: "a NAMED person leaving does not touch the crowd's switches"). What is true now:
       his leaving — here by his own "Take me out", the same save a puck taken off the row makes — is ONE plain line. */
    it('the change history\'s line for the man who left is his alone — one line, and it says nothing of ALL AVAIL', async () => {
      await boot(new MemoryBackend())
      file(['bane', 'pike', A])
      const before = lines()
      member('pike')
      expect(commitInput(rec(), draftOf(rec()), ['bane', A]), 'he takes himself out (D763: "he may always take himself out")').toBe(true)
      const said = ELOG.rows.slice(before).map((r: any) => String(r.lbl))
      expect(said, 'one line').toHaveLength(1)
      expect(said[0]).toContain(cs('pike'))
      expect(said[0]).not.toMatch(/ALL AVAIL|came off/i)
      expect(people(), 'and ALL AVAIL is still in it').toEqual(['bane', A])
    })
  })
})

/* ==== THE DOORS THAT USED TO ASK "WHICH ROWS ARE ONE ROW" — the second pass after the dead code went out (step 6 of the
   one-rule build, 12 Oct 26). Until step 2 a shared input was a row a man DRAWN as one, and five bodies asked
   engine/grouprows.ts `groundGroups` so that a hand on the one row reached every row of it: a day template took the
   lead's row only, a drag moved the rows together, the row's ✕ took every man's request off in one press, and CX, the
   red box and "information only" were set alike on every row. An input is ONE row now (D755, D756), `groundGroups` and
   every "…as one" branch are gone, and nothing a person sees should have moved. Each case here is that hand, through
   the app's own door, on a real saved store — on an input of several, and on the scheduler's OWN row beside it (which
   the removed branches also passed through). ==== */
describe('after the dead code went out — one row, one hand (D755, D756; D661 as it stands; D736, D760)', () => {
  const THU = 3
  const UP = TITLE.toUpperCase()
  const press = (data: Record<string, string>) => { const b = document.createElement('button'); b.className = 'mbtn'; Object.assign(b.dataset, data); document.body.appendChild(b); boardMbtn({ target: b } as any); b.remove() }
  /* Accept / "→ Unavail" / Undo on the input's line under Personal Inputs — the one control, as the week and the board draw it */
  const acc = (dest: 'g' | 'u' | 'x', di = WED) => { const b = document.createElement('button'); b.dataset.acc = dest; b.dataset.accd = String(di); b.dataset.acck = String(inpId(rec())); document.body.appendChild(b); routeClick({ target: b, stopPropagation() {}, preventDefault() {} } as any); b.remove() }
  const named = (rows: any[]) => (rows || []).filter((g: any) => g && g.prog === UP)
  const rids = (di = WED) => ground(di).map((g: any) => g.rid)
  beforeEach(() => { dayTplReset() })
  afterEach(() => { dayTplReset() })

  describe('a day template', () => {
    it('taken from a day holding an input of four: ONE row for it — its name and times, nobody on it, nothing tying it to the input; applied to another day it is the scheduler\'s own row, and the input is untouched', async () => {
      await boot(new MemoryBackend())
      file(['pike', 'bane', 'split', 'rocky'])
      const was = JSON.stringify(rec())
      const t = addDayTpl(WED, 'Wed')!
      expect(named(t.d.ground), 'one row in the template — not a row a person').toHaveLength(1)
      const tr: any = named(t.d.ground)[0]
      expect([tr.str, tr.end], 'the shape of the day: its times').toEqual(['14:00', '15:00'])
      expect([tr.who, ...(tr.more || [])].filter(Boolean), 'a template names nobody').toEqual([])
      for (const k of ['src', 'srcv', 'srcg', 'kept', 'rid']) expect(k in tr, `no \`${k}\`: a template's row is nobody's request`).toBe(false)
      expect(t.d.ground, 'and it took no row away: one a row of the day').toHaveLength(ground().length)
      expect(named(ground(THU)), 'Thursday has no such row yet').toHaveLength(0)
      expect(applyDayTpl(THU, t.id)).toBe(true); view.afterSchedMutate()
      const on = named(ground(THU))
      expect(on, 'ONE row on the day it is applied to').toHaveLength(1)
      const ri = ground(THU).indexOf(on[0])
      expect(onInputRow(`g:${THU}.${ri}`), 'the scheduler\'s own row — no input stands behind it').toBe(false)
      expect(rowPeopleDrawn(DAYS[THU], THU, ri), 'nobody is drawn on it').toEqual([])
      expect([on[0].str, on[0].end]).toEqual(['14:00', '15:00'])
      expect(JSON.stringify(rec()), 'the input itself is not touched').toBe(was)
      expect(onRow(), 'and its own row still stands on Wednesday, everyone on it').toEqual(['pike', 'bane', 'split', 'rocky'])
      expect(INPUTS.filter((x: any) => x.title === TITLE), 'no second input was made').toHaveLength(1)
    })
    it('…and one with ALL AVAIL among its people is one row too, with nobody and no placeholder on it', async () => {
      await boot(new MemoryBackend())
      file(['pike', 'allavail', 'bane'])
      const t = addDayTpl(WED, 'Wed')!
      expect(named(t.d.ground)).toHaveLength(1)
      const tr: any = named(t.d.ground)[0]
      expect([tr.who, ...(tr.more || [])].filter(Boolean)).toEqual([])
    })
  })

  describe('a drag to reorder on the board', () => {
    it('the row of an input of four dragged onto another row\'s place is ONE move — the row whole, everyone still on it, the other rows in their order — and ONE Undo puts it back', async () => {
      await boot(new MemoryBackend())
      const FOUR = ['pike', 'bane', 'split', 'rocky']
      file(FOUR)
      expect(ground().length, 'the day has other ground rows to move among').toBeGreaterThanOrEqual(3)
      expect(rids().every(Boolean), 'every row has its hidden id').toBe(true)
      const was = rids(), mine = rowOf().rid, recWas = JSON.stringify(rec())
      /* the order the board draws them in (by start time until a hand orders the list) — what the drag is seen against */
      const shown = groundOrder(ground()).map((x: any) => x.row.rid)
      const f = shown.indexOf(mine), t = f === 0 ? shown.length - 1 : 0
      const want = shown.slice(); want.splice(f, 1); want.splice(t, 0, mine)
      const target = ground().findIndex((g: any) => g.rid === shown[t])
      expect(applyMove(`mv:g.${WED}.${riOf()}`, `mv:g.${WED}.${target}`), 'the drop').toBe(true); view.afterSchedMutate()
      expect(rids(), 'the one row took the place it was dropped on; nothing else changed places').toEqual(want)
      expect(ground().filter((g: any) => g.src === String(inpId(rec()))), 'still ONE row of the input').toHaveLength(1)
      expect(onRow(), 'everyone still on it, as they joined').toEqual(FOUR)
      expect(rowPeopleDrawn(DAYS[WED], WED, riOf()).map(p => p.key).sort(), 'its pucks are on the keys of the row where it stands NOW').toEqual([rowKey(), `${rowKey()}.x0`, `${rowKey()}.x1`, `${rowKey()}.x2`])
      for (const p of FOUR) expect(slotVal(keyOf(p)), `${p}'s place answers for him`).toBe(p)
      expect(JSON.stringify(rec()), 'a move is the schedule\'s: the input is not changed').toBe(recWas)
      globalUndo()
      expect(rids(), 'ONE Undo: the whole day\'s order as it was').toEqual(was)
      expect(onRow()).toEqual(FOUR)
    })
    it('another row dragged ONTO the input\'s row lands in its place, and the input\'s row slides one place whole', async () => {
      await boot(new MemoryBackend())
      file(['pike', 'bane', 'split'])
      const mine = rowOf().rid
      const shown = groundOrder(ground()).map((x: any) => x.row.rid)
      const t = shown.indexOf(mine), f = t === 0 ? shown.length - 1 : 0
      const want = shown.slice(); const [moved] = want.splice(f, 1); want.splice(t, 0, moved)
      const from = ground().findIndex((g: any) => g.rid === shown[f])
      expect(applyMove(`mv:g.${WED}.${from}`, `mv:g.${WED}.${riOf()}`)).toBe(true); view.afterSchedMutate()
      expect(rids()).toEqual(want)
      expect(onRow()).toEqual(['pike', 'bane', 'split'])
      for (const p of ['pike', 'bane', 'split']) expect(slotVal(keyOf(p))).toBe(p)
    })
  })

  describe('the row\'s ✕', () => {
    /* D736 — "a shared input … taken off the programme … is ONE change waiting — one line, naming its people"; D663:
       named by its name and HOW MANY people. Until step 2 of the build the ✕ said "… — RANGE SAFETY BRIEF,
       14:00–15:00, 3 people". */
    it('on an input of three: the WHOLE input comes off the programme in one press — everyone with it, back under Personal Inputs — one note, one line of history, ONE Undo', async () => {
      await boot(new MemoryBackend())
      file(['pike', 'bane', 'split'])
      SAID = []
      const before = lines()
      setBoardDay(WED); press({ grdel: `${WED}.${riOf()}` })
      expect(riOf(), 'no row of it is left on the programme').toBe(-1)
      expect(ground().some((g: any) => g.prog === UP), 'not even a row a man').toBe(false)
      expect(rec().acc, 'taken off — for everyone at once').toBe('r')
      expect(people(), 'nobody was taken out of the input').toEqual(['pike', 'bane', 'split'])
      expect(SAID, 'ONE note for the one press').toHaveLength(1)
      expect(SAID[0]).toMatch(/^Ground item removed — back under Personal Inputs — /)
      expect(lines() - before, 'one act, one change (D114)').toBe(1)
      globalUndo()
      expect(onRow(), 'ONE Undo brings the one row back, everyone on it').toEqual(['pike', 'bane', 'split'])
      expect(rec().acc).not.toBe('r')
    })
    /* THE WORDS OF THAT NOTE — a product fault, reported and NOT pinned (the two cases below fail until it is fixed). The
       app says "…, Nomad +2": the first to join and a count of "the rest" — the shorthand of a scheduler's own row —
       where an input of several is named by HOW MANY people it holds (D663, D736), as the same take-off says from the
       Personal Inputs line ("3 people's Range safety brief taken off the programme"); and it counts ALL AVAIL as one of
       "the rest". The sentence that said it lived in the branch for "the rows drawn as one", which stopped being
       reached at step 2 (b) of the build and was deleted with the dead code at step 6. */
    it('…and the note says HOW MANY people: "…, 3 people"', async () => {
      await boot(new MemoryBackend())
      file(['pike', 'bane', 'split'])
      SAID = []
      setBoardDay(WED); press({ grdel: `${WED}.${riOf()}` })
      expect(SAID, 'one note, naming how many').toEqual([`Ground item removed — back under Personal Inputs — ${UP}, 14:00–15:00, 3 people`])
    })
    it('with ALL AVAIL in it the count is of the PEOPLE: "2 people and ALL AVAIL"', async () => {
      await boot(new MemoryBackend())
      file(['pike', 'allavail', 'bane'])
      SAID = []
      setBoardDay(WED); press({ grdel: `${WED}.${riOf()}` })
      expect(riOf()).toBe(-1)
      expect(people()).toEqual(['pike', 'allavail', 'bane'])
      expect(SAID).toEqual([`Ground item removed — back under Personal Inputs — ${UP}, 14:00–15:00, 2 people and ALL AVAIL`])
    })
    it('THE CONTROL — on an input of ONE person the note names him', async () => {
      await boot(new MemoryBackend())
      file(['pike'])
      SAID = []
      setBoardDay(WED); press({ grdel: `${WED}.${riOf()}` })
      expect(SAID).toEqual([`Ground item removed — back under Personal Inputs — ${UP}, 14:00–15:00, ${cs('pike')}`])
    })
  })

  describe('CX, the red box and "information only" on a row the scheduler made himself', () => {
    it('each is written to THAT row, one Undo each — and the input\'s row beside it, and the input, are not touched', async () => {
      await boot(new MemoryBackend())
      file(['pike', 'bane', 'split'])
      setBoardDay(WED)
      press({ gradd: String(WED) })
      const n = ground().length - 1, own = () => ground()[n]
      expect(onInputRow(`g:${WED}.${n}`), 'his own row: no input behind it').toBe(false)
      expect(writeSlot(`g:${WED}.${n}`, 'rocky'), 'and a man put on it is the row\'s').not.toBe(false)
      const recWas = JSON.stringify(rec())
      const clean = () => { expect([rowOf().cx, rowOf().flag, rowOf().info].map(Boolean), 'the input\'s row').toEqual([false, false, false]); expect(JSON.stringify(rec()), 'the input').toBe(recWas) }

      SAID = []
      press({ grflag: `${WED}.${n}` })
      expect(!!own().flag, 'the red box is on his row').toBe(true)
      expect(SAID).toEqual(['Red box — flagged for the next scheduler'])
      clean()
      globalUndo(); expect(!!own().flag, 'one Undo').toBe(false)

      SAID = []
      press({ grinfo: `${WED}.${n}` })
      expect(!!own().info).toBe(true)
      expect(SAID).toEqual(['Info only — this item is no longer checked against the rules, and earns nobody any OIL'])
      clean()
      globalUndo(); expect(!!own().info, 'one Undo').toBe(false)

      press({ grcx: `${WED}.${n}` }); cxCommit(true, 'WX')
      expect([!!own().cx, own().cxr], 'the CX and its reason are on his row').toEqual([true, 'WX'])
      expect(own().who, 'his man is still on it').toBe('rocky')
      clean()
      globalUndo(); expect(!!own().cx, 'one Undo').toBe(false)
    })
  })

  describe('Accept, "→ Unavail" and Undo on the line of an input of several under Personal Inputs', () => {
    it('Undo takes the WHOLE input off the programme in one press, and Accept puts it back — one row, everyone on it; each is one step of the top bar\'s Undo; the note says how many', async () => {
      await boot(new MemoryBackend())
      file(['pike', 'bane', 'split'])
      SAID = []
      const before = lines()
      acc('x')
      expect([riOf(), rec().acc], 'off for everyone').toEqual([-1, 'r'])
      expect(SAID).toEqual([`3 people's ${TITLE} taken off the programme`])
      /* ONE line of history for the one act (D114, D736) — the input's, filed under its first to join: the place the
         changes window's tap is sent to (ui/histjump.test.tsx) */
      const hist = ELOG.rows.slice(before) as any[]
      expect(hist.map(r => [r.iid, r.sub]), 'one line, the input\'s').toEqual([[String(inpId(rec())), 'pike']])
      SAID = []
      acc('g')
      expect(ground().filter((g: any) => g.src === String(inpId(rec()))), 'ONE row again').toHaveLength(1)
      expect(onRow()).toEqual(['pike', 'bane', 'split'])
      expect(SAID).toEqual([`3 people's ${TITLE} added to the ground programme`])
      globalUndo()
      expect([riOf(), rec().acc], 'one Undo: the Accept alone').toEqual([-1, 'r'])
      globalUndo()
      expect(onRow(), 'a second: the take-off').toEqual(['pike', 'bane', 'split'])
    })
    it('"→ Unavail" files the one input under Unavailable for everyone in it, in one press — and its Undo takes all of them back out', async () => {
      await boot(new MemoryBackend())
      file(['pike', 'bane', 'split'])
      acc('x')
      SAID = []
      acc('u')
      expect(rec().acc, 'ONE filing, for all three').toBe('u')
      expect(riOf(), 'no row on the programme').toBe(-1)
      expect(SAID).toEqual([`3 people's ${TITLE} filed under Unavailable`])
      expect(people()).toEqual(['pike', 'bane', 'split'])
      SAID = []
      acc('x')
      expect(rec().acc).toBe('r')
      expect(SAID).toEqual([`3 people's ${TITLE} taken out of Unavailable`])
    })
    it('with ALL AVAIL in it the note counts the people: "2 people and ALL AVAIL\'s …"', async () => {
      await boot(new MemoryBackend())
      file(['pike', 'allavail', 'bane'])
      SAID = []
      acc('x')
      expect(SAID).toEqual([`2 people and ALL AVAIL's ${TITLE} taken off the programme`])
    })
  })
})

/* HISTORY'S GOLD DOT ON AN INPUT'S ROW OF THE PROGRAMME (`[HIST-DOT-INPUT-ROW]` — the one-rule job's walk, share L, L13,
   12 Oct 26). With History on, a man added to an input by a drop on its row left no gold dot anywhere on that row: the
   changes window listed the act and a tap landed on his puck, but the puck itself wore nothing and its bubble said
   nothing. His line is the INPUT's (filed by its id, marked as his); the dot's painter marked a programme seat only for
   a line filed under that seat's own key. A seat of a row that came from an input now answers for the input's lines
   about the person standing on it — the dot and the bubble's story alike, so the two cannot disagree. */
describe('History: the puck of a man put on an input’s row wears the gold dot, and its bubble tells his line ([HIST-DOT-INPUT-ROW])', () => {
  const seat = (key: string) => { const el = document.createElement('span'); el.dataset.slot = key; return el }
  const page = (...keys: string[]) => { const root = document.createElement('div'); const els = keys.map(seat); els.forEach(e => root.appendChild(e)); document.body.appendChild(root); return { root, els } }
  afterEach(() => { view.setHistMode(false) })

  it('the man put in: his puck is dotted and its story is his line; the man beside him, who was filed with the input, wears none', async () => {
    await boot(new MemoryBackend())
    file(['bane', 'pike'])
    expect(rowPut(`${rowKey()}.+`, 'split')).toBe('done')
    await Promise.resolve()
    const { root, els } = page(keyOf('split'), keyOf('bane'), keyOf('pike'))
    view.setHistMode(true)
    refreshHistDots(root)
    expect(els.map(e => e.hasAttribute('data-histdot')), 'split — put in — and only he').toEqual([true, false, false])
    const told = storyOf(els[0]!)
    expect(told.map((r: any) => r.lbl).join(' | '), 'the bubble tells the line that put him in').toMatch(new RegExp(`${cs('split')} · .* · added`))
    expect(storyOf(els[1]!), 'a man who was only ever filed with it has no line of his own').toEqual([])
    /* a dot and a bubble never disagree */
    for (const e of els) expect(e.hasAttribute('data-histdot')).toBe(storyOf(e).length > 0)
    view.setHistMode(false); refreshHistDots(root)
    expect(root.querySelectorAll('[data-histdot]').length, 'History off: every dot goes').toBe(0)
    root.remove()
  })

  /* the other way of putting a man on the row: dropped on its ONLY person he REPLACES him (D755), and the line reads
     "whose: Ranger → Tally" — no line "added". His puck wore no dot either (the Opus read of this change, F3). */
  it('a man who REPLACED the input’s only person wears the dot too, and his bubble tells the hand-over', async () => {
    await boot(new MemoryBackend())
    file(['bane'])
    expect(rowPut(rowKey(), 'split')).toBe('done')
    await Promise.resolve()
    const { root, els } = page(keyOf('split'))
    view.setHistMode(true)
    refreshHistDots(root)
    expect(els[0]!.hasAttribute('data-histdot')).toBe(true)
    expect(storyOf(els[0]!).map((r: any) => r.lbl).join(' | ')).toMatch(/whose/)
    root.remove()
  })

  it('a plain programme row beside it is untouched: a seat is dotted only for its own lines', async () => {
    await boot(new MemoryBackend())
    file(['bane'])
    expect(rowPut(`${rowKey()}.+`, 'split')).toBe('done')
    await Promise.resolve()
    /* a seat address on ANOTHER row of that day, where split does not stand */
    const other = `g:${WED}.${riOf() + 40}`
    const { root, els } = page(other)
    view.setHistMode(true)
    refreshHistDots(root)
    expect(els[0]!.hasAttribute('data-histdot')).toBe(false)
    root.remove()
  })
})
