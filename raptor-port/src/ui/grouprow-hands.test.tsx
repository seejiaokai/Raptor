// @vitest-environment jsdom
/* WHAT A HAND DOES TO THE ONE ROW OF A SHARED INPUT (`[GROUP-INPUT-ONE-ROW]` step 5). His rulings:
   D734 — "on a shared input's row the pucks ARE the input's people: a puck taken off the row takes that man out of the
           input itself, and a puck put on the row adds him to it — the same as doing it in the input's own window";
   D735 — one row, one time; D739 — "14:30 - the input changes", for everyone in it;
   D738 as D744 narrowed it — a man added takes the OIL answer the input carries while everyone in it carries the same
           one: "If an input has multiple people and different answers for OIL. Any subsequent addition the OIL earned
           question will be asked";
   D741 — a man added from the schedule is not marked late; D745 — an ALL AVAIL on the row comes off with the man whose
           place it stood on, and the app says so; D18, D470 — a one-man request's row is unchanged.
   The plan: docs/superpowers/plans/2026-10-10-group-input-one-row-plan.md §4.4 (the shared half), §4.5.

   ONE DOOR (ui/grouprow.ts) is asked by every place that writes a person to a ground row — a drop, an armed place
   filled, a right-click, the store's writers — and a BELT in the engine (slots.ts setSlotVal / fillSlot) refuses a
   write that reaches a member's place without it. Driven here through that door, the store's own writers, the board's
   buttons and the typed box's door, on a real saved store (as state/p6c-requestonread.test.ts is) — and, at the foot,
   through the drop itself (ui/drag.ts applyDrop, on a stand-in element carrying the place's key) and an armed place
   filled by a tap. A real drag and a real right-click are walked in the browser.
   Behaviour register: GI6, GI7, GI8, GI9, GI10, GI11, GI12, GI13, GI15. */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { INPUTS, inpId, isLateInput } from '../engine/inputs'
import { PEOPLE, ID_BY_CS, indexCallsigns } from '../engine/people'
import { DAYS } from '../engine/data'
import { CURWEEK } from '../engine/waves'
import { storeBackend, HOOKS } from '../engine/hooks'
import { stashClear } from '../engine/weekstash'
import { SCHED } from '../engine/publish'
import { ELOG } from '../engine/editlog'
import { setSlotVal, fillSlot, slotVal } from '../engine/slots'
import { applyMove } from '../engine/reorder'
import { groundGroups } from '../engine/grouprows'
import { PLANPUCKS, DAYRMK } from '../state/plan'
import { initStore, weekStashSnap, weekDirty, loadWeek, writeSlot, writeFill } from '../state/store'
import { schedWrite, SCHED_TYPES } from '../state/sched-commit'
import { setSession, setMe, DEFAULT_ME } from '../state/auth'
import { entryRowsOf } from '../state/inputgroup'
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
import { afterSchedMutate, setPage, setBoardDay, toggleLateOff, lateShown } from '../state/view'
import * as view from '../state/view'
import { commitNewInput, commitGroup, draftOf, entryOilAnswer, setInpField, setInpTitle } from './inputedit'
import { reqRowText } from './reqrow'
import { groupPut, groupTake, groupLeaveTo, groupRetarget, groupMove } from './grouprow'
import { boardMbtn, cxCommit } from './board'
import { routeClick } from './interactions'
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
const recs = (di = WED) => INPUTS.filter((x: any) => x.title === TITLE && x.date === (di === SAT ? 'Jul 18' : 'Jul 15')) as any[]
const rec = (p: string, di = WED) => recs(di).find(r => r.person === p)
const people = (di = WED) => recs(di).map(r => r.person).sort()
const ground = (di = WED) => ((DAYS[di] as any).ground || []) as any[]
const riOf = (p: string, di = WED) => { const r = rec(p, di); return r ? ground(di).findIndex((g: any) => g && g.src === String(inpId(r))) : -1 }
const keyOf = (p: string, di = WED) => `g:${di}.${riOf(p, di)}`
const DRAFT = (di = WED, over: any = {}) => ({ ...draftOf({ person: 'bane', type: di === SAT ? 'Duty' : 'Meeting', title: TITLE, date: di === SAT ? 'Jul 18' : 'Jul 15', yr: 2026, allday: false, s: 840, e: 900, remarks: 'Bring your logbook' }), ...over })
const fileGroup = (ppl: string[], di = WED, oil?: Record<string, number>) => expect(commitGroup(null, DRAFT(di), ppl, oil)).toBe(true)
const leadKey = (di = WED) => { const g = groundGroups(DAYS[di])[riOf('bane', di)]!; return `g:${di}.${g.lead}` }
const lines = () => ELOG.rows.length
/* a board button, pressed */
const press = (data: Record<string, string>) => { const b = document.createElement('button'); b.className = 'mbtn'; Object.assign(b.dataset, data); document.body.appendChild(b); boardMbtn({ target: b } as any); b.remove() }

beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(new Date(2026, 5, 1, 9, 0, 0)); resetWorld(); SAID = []; HOOKS.toast = (m: any) => { SAID.push(String(m)) } })
afterEach(() => { HOOKS.toast = toast; _resetTimeline(); vi.useRealTimers(); resetWorld(); setSession(null); setMe(DEFAULT_ME); storeBackend.impl = null })

describe('a puck put on the one row adds the man to the input (D734)', () => {
  it('dropped on a member’s puck, on "+ add" or on an extra: he is IN the input — one more record of the same entry, his own row beside the others — and the man he was dropped on is untouched', async () => {
    for (const where of ['puck', 'add', 'retyped'] as const) {
      resetWorld(); await boot(new MemoryBackend())
      fileGroup(['bane', 'pike'])
      const key = where === 'puck' ? keyOf('pike') : `${leadKey()}.+`
      const before = lines()
      expect(groupPut(key, 'split'), where).toBe('done')
      expect(people(), where).toEqual(['bane', 'pike', 'split'])
      expect(entryRowsOf(INPUTS, rec('bane')).map((r: any) => r.person).sort(), 'one entry — as the Inputs calendar shows it').toEqual(['bane', 'pike', 'split'])
      expect(riOf('split'), 'his own row is on the programme').toBeGreaterThanOrEqual(0)
      expect(groundGroups(DAYS[WED])[riOf('bane')]!.members, 'drawn as one row of three').toHaveLength(3)
      expect(lines() - before, 'one line in the change history').toBe(1)
    }
  })

  it('already in it: refused, in words (D271) — and nothing changes', async () => {
    await boot(new MemoryBackend())
    fileGroup(['bane', 'pike'])
    const was = JSON.stringify(INPUTS)
    expect(groupPut(keyOf('bane'), 'pike')).toBe('refused')
    expect(SAID.join(' ')).toContain(`${cs('pike')} is already on this input`)
    expect(JSON.stringify(INPUTS)).toBe(was)
  })

  it('from a seat elsewhere: he is added, and the seat he came from keeps him (reading R4)', async () => {
    await boot(new MemoryBackend())
    fileGroup(['bane', 'pike'])
    const seat = '2.0.0.0.p', flew = slotVal(seat)
    expect(flew, 'a pilot in a flying seat on the Wednesday').toBeTruthy()
    expect(groupPut(keyOf('bane'), flew)).toBe('done')
    expect(people()).toContain(flew)
    expect(slotVal(seat), 'still in his seat').toBe(flew)
  })

  it('he is never marked late for it (D741) — on an input that was on time, and on one that was already late', async () => {
    await boot(new MemoryBackend())
    fileGroup(['bane', 'pike'])                               // filed on 1 Jun: in good time
    vi.setSystemTime(new Date(2026, 6, 14, 9, 0, 0))          // the day before: long past any cut-off
    expect(groupPut(keyOf('bane'), 'split')).toBe('done')
    expect(isLateInput(rec('split')), 'added to an on-time input').toBe(false)
    expect(isLateInput(rec('bane'))).toBe(false)
    /* an input filed late: its people read LATE, the man the scheduler adds does not */
    resetWorld(); await boot(new MemoryBackend())
    vi.setSystemTime(new Date(2026, 6, 14, 9, 0, 0))
    fileGroup(['bane', 'pike'])
    expect(isLateInput(rec('bane')), 'filed late').toBe(true)
    expect(groupPut(keyOf('bane'), 'split')).toBe('done')
    expect(isLateInput(rec('split')), 'the man added from the schedule is not').toBe(false)
    expect(isLateInput(rec('bane')), 'the others are as they were').toBe(true)
    expect(rec('split').by, 'who placed him is true').toBe('stiff')
  })
})

describe('the OIL answer of a man added from the schedule (D738 as D744 narrowed it)', () => {
  it('entryOilAnswer: everyone the same — "same"; nobody answered — "none"; anything else — "differ"', () => {
    const r = (oil?: any) => ({ person: 'x', type: 'Duty', date: 'Jul 18', yr: 2026, allday: false, s: 840, e: 900, ...(oil ? { oil } : {}) })
    expect(entryOilAnswer([r({ [SAT_ISO]: 0.5 }), r({ [SAT_ISO]: 0.5 })])).toEqual({ kind: 'same', oil: { [SAT_ISO]: 0.5 } })
    expect(entryOilAnswer([r({ [SAT_ISO]: 0 }), r({ [SAT_ISO]: 0 })])).toEqual({ kind: 'same', oil: { [SAT_ISO]: 0 } })
    expect(entryOilAnswer([r(), r()]).kind).toBe('none')
    expect(entryOilAnswer([r({ [SAT_ISO]: 0.5 }), r({ [SAT_ISO]: 0 })]).kind).toBe('differ')
    expect(entryOilAnswer([r({ [SAT_ISO]: 0.5 }), r()]).kind, 'one unanswered among answered').toBe('differ')
    /* a weekday asks nothing: there is no answer to take and nothing to ask */
    expect(entryOilAnswer([{ ...r(), date: 'Jul 15' }]).kind).toBe('none')
  })

  for (const [what, amt] of [['Yes', 0.5], ['No', 0]] as const) {
    it(`everyone ${what}: he takes ${what} — no question on the schedule`, async () => {
      await boot(new MemoryBackend())
      fileGroup(['bane', 'pike'], SAT, { [SAT_ISO]: amt })
      expect(groupPut(keyOf('bane', SAT), 'split')).toBe('done')
      expect(rec('split', SAT).oil).toEqual({ [SAT_ISO]: amt })
      expect(pops.OILASK, 'no sheet').toBeNull()
      expect(pops.INPEDIT).toBeNull()
      expect([rec('bane', SAT).oil, rec('pike', SAT).oil], 'the others’ answers stand').toEqual([{ [SAT_ISO]: amt }, { [SAT_ISO]: amt }])
    })
  }

  it('nobody has answered: he has no answer, and no question opens — it stays with whoever filed it', async () => {
    await boot(new MemoryBackend())
    fileGroup(['bane', 'pike'], SAT)
    expect(groupPut(keyOf('bane', SAT), 'split')).toBe('done')
    expect(rec('split', SAT).oil).toBeUndefined()
    expect(pops.OILASK).toBeNull()
  })

  for (const [what, change] of [['one man has since said No', (r: any) => { r.oil = { [SAT_ISO]: 0 } }], ['one man is unanswered among answered', (r: any) => { delete r.oil }]] as const) {
    it(`${what}: the answers differ — the question opens at once, on HIS record, for his answer alone (D744)`, async () => {
      await boot(new MemoryBackend())
      fileGroup(['bane', 'pike'], SAT, { [SAT_ISO]: 0.5 })
      schedWrite(SCHED_TYPES.mutate, () => { change(rec('pike', SAT)); afterSchedMutate() })
      const others = JSON.stringify([rec('bane', SAT).oil, rec('pike', SAT).oil])
      expect(groupPut(keyOf('bane', SAT), 'split')).toBe('done')
      const his = rec('split', SAT)
      expect(his.oil, 'no answer was given for him').toBeUndefined()
      expect(pops.OILASK, 'the question is asked of his record').toBe(his.iid)
      expect(pops.OILOWN, '…for his answer alone').toBe(true)
      expect(pops.INPEDIT).toBe(his)
      expect(JSON.stringify([rec('bane', SAT).oil, rec('pike', SAT).oil]), 'nobody else’s answer is touched').toBe(others)
    })
  }
})

describe('a puck taken off the one row takes the man out of the input (D734)', () => {
  it('one of the input’s men taken off: his record is gone, the others stand, one Undo brings him back', async () => {
    await boot(new MemoryBackend())
    fileGroup(['bane', 'pike', 'split'])
    expect(groupTake(keyOf('pike'))).toBe('done')
    expect(people()).toEqual(['bane', 'split'])
    expect(groundGroups(DAYS[WED])[riOf('bane')]!.members).toHaveLength(2)
    globalUndo()
    expect(people()).toEqual(['bane', 'pike', 'split'])
    expect(riOf('pike'), 'and his row').toBeGreaterThanOrEqual(0)
  })

  it('THE LAST MAN is not taken off that way — refused, saying how (reading R5)', async () => {
    await boot(new MemoryBackend())
    fileGroup(['bane', 'pike'])
    expect(groupTake(keyOf('pike'))).toBe('done')
    expect(groupTake(keyOf('bane'))).toBe('refused')
    expect(people()).toEqual(['bane'])
    expect(SAID[SAID.length - 1]).toBe(`${cs('bane')} is the last person on this input — use ✕ to take it off the programme, or delete it in its own window`)
    /* …and the row is still a shared input's: a puck dropped on it still joins the input (reading R3) */
    expect(groupPut(keyOf('bane'), 'split')).toBe('done')
    expect(people()).toEqual(['bane', 'split'])
  })

  it('dragged onto another place: he LEAVES the input and is put there in ONE step — one Undo puts back both; the place is named by where it stands AFTER his old row has gone', async () => {
    await boot(new MemoryBackend())
    fileGroup(['bane', 'pike', 'split'])
    expect(commitNewInput(draftOf({ person: 'rocky', type: 'Training', date: 'Jul 15', yr: 2026, allday: false, s: 600, e: 660, remarks: '' }))).toBe(true)
    const target = INPUTS.find((x: any) => x.person === 'rocky' && x.type === 'Training' && x.date === 'Jul 15') as any
    const tri = () => ground().findIndex((g: any) => g && g.src === String(inpId(target)))
    expect(tri(), 'a row BELOW the three').toBeGreaterThan(riOf('split'))
    const toKey = `g:${WED}.${tri()}.+`
    const out = groupLeaveTo(keyOf('pike'), toKey, () => fillSlot(toKey, 'pike'))
    expect(out, 'done').not.toBe('refused')
    expect(people(), 'out of the input').toEqual(['bane', 'split'])
    expect(ground()[tri()].more, 'and on the row he was dropped on').toEqual(['pike'])
    expect((out as any).landed, 'the place, as it stands now').toBe(`g:${WED}.${tri()}.x0`)
    expect(slotVal((out as any).landed)).toBe('pike')
    globalUndo()
    expect(people(), 'ONE Undo: back in the input…').toEqual(['bane', 'pike', 'split'])
    expect(ground()[tri()].more || [], '…and off that row').toEqual([])
  })

  it('a place that refuses him leaves him in the input — nothing is half done', async () => {
    await boot(new MemoryBackend())
    fileGroup(['bane', 'pike'])
    const was = JSON.stringify(INPUTS)
    expect(groupLeaveTo(keyOf('pike'), '2.0.0.0.p', () => false)).toBe('refused')
    expect(JSON.stringify(INPUTS)).toBe(was)
    expect(people()).toEqual(['bane', 'pike'])
  })
})

describe('a placeholder on the one row (D745)', () => {
  it('ALL AVAIL dropped anywhere on the row is the ROW’s own — never a man’s place: it joins the lead’s extras', async () => {
    await boot(new MemoryBackend())
    fileGroup(['bane', 'pike'])
    const key = groupRetarget(keyOf('pike'), 'allavail')
    expect(key).toBe(`${leadKey()}.+`)
    writeFill(key, 'allavail')
    expect(people(), 'nobody was added to the input').toEqual(['bane', 'pike'])
    const lead = ground()[+leadKey().split('.')[1]!]
    expect(lead.more).toEqual(['allavail'])
    /* a real man is never retargeted: he is added to the input instead */
    expect(groupRetarget(keyOf('pike'), 'split')).toBe(keyOf('pike'))
  })

  it('it comes off WITH the man whose place it stood on — and the app says so', async () => {
    await boot(new MemoryBackend())
    fileGroup(['bane', 'pike'])
    writeFill(`${keyOf('pike')}.+`, 'allavail')
    expect(ground()[riOf('pike')].more).toEqual(['allavail'])
    expect(groupTake(keyOf('pike'))).toBe('done')
    expect(ground().some((g: any) => (g.more || []).includes('allavail')), 'gone with his row').toBe(false)
    expect(SAID.join(' · ')).toContain(`ALL AVAIL came off ${TITLE} with ${cs('pike')} — drop it on the row again if it still applies`)
    globalUndo()
    expect(ground()[riOf('pike')].more, 'Undo brings the puck back').toEqual(['allavail'])
  })

  /* Fable's (a), taken with D745: the notice must reach the SCHEDULER, not only whoever did it — a man taking himself out
     in the input's own window cannot drop a puck, and a scheduler on another device sees no passing note. So the fact is
     in the removal's own line of the change history, naming the men whose OIL the scheduler had switched off under it —
     the one thing that is lost (Undo of the removal brings the puck and every switch back). */
  it('the change history’s line for the man who left says the puck came off his row — and names anyone switched off on it', async () => {
    await boot(new MemoryBackend())
    fileGroup(['bane', 'pike'])
    writeFill(`${keyOf('pike')}.+`, 'allavail')
    const iid = String(inpId(rec('pike')))
    schedWrite(SCHED_TYPES.mutate, () => { (DAYS[WED] as any).oild = { people: { [`rocky|i:${iid}`]: 'deny', [`ignite|i:${iid}`]: 'deny' } }; afterSchedMutate() })
    const before = lines()
    /* the man himself, in the input's own window ("Take me out"): the same save a puck taken off the row makes */
    expect(commitGroup({ rows: entryRowsOf(INPUTS, rec('bane')) }, draftOf(rec('bane')), ['bane'])).toBe(true)
    const said = ELOG.rows.slice(before).map((r: any) => String(r.lbl))
    expect(said.filter(l => l.includes('deleted')), 'one line for the man who left').toHaveLength(1)
    expect(said.join(' | ')).toContain(`ALL AVAIL came off his row · switched off on it: ${[cs('ignite'), cs('rocky')].sort().join(', ')}`)
  })
  it('THE CONTROL — a man who leaves with nothing on his row leaves a plain line', async () => {
    await boot(new MemoryBackend())
    fileGroup(['bane', 'pike'])
    const before = lines()
    expect(groupTake(keyOf('pike'))).toBe('done')
    expect(ELOG.rows.slice(before).map((r: any) => String(r.lbl)).join(' | ')).not.toContain('came off his row')
  })
})

describe('the row’s own boxes and buttons act for everyone on it', () => {
  it('14:30 typed on the one row: EVERY record reads 14:30 (D739) — one Undo, nobody late, still one row', async () => {
    await boot(new MemoryBackend())
    fileGroup(['bane', 'pike', 'split'])
    vi.setSystemTime(new Date(2026, 6, 14, 9, 0, 0))
    expect(reqRowText(`gr:${WED}.${leadKey().split('.')[1]}.str`, '1430')).toBe('saved')
    expect(recs().map(r => r.s)).toEqual([870, 870, 870])
    expect(recs().some(r => isLateInput(r))).toBe(false)
    expect(groundGroups(DAYS[WED])[riOf('bane')]!.members, 'one row still').toHaveLength(3)
    expect(reqRowText(`gr:${WED}.${leadKey().split('.')[1]}.rmks`, 'Bring your ID')).toBe('saved')
    expect(recs().map(r => r.remarks)).toEqual(['Bring your ID', 'Bring your ID', 'Bring your ID'])
    globalUndo(); globalUndo()
    expect(recs().map(r => [r.s, r.remarks])).toEqual([[840, 'Bring your logbook'], [840, 'Bring your logbook'], [840, 'Bring your logbook']])
  })

  it('a box typed on the one LINE under Personal Inputs is the entry’s too — the time, the remark and the name, one Undo each', async () => {
    await boot(new MemoryBackend())
    fileGroup(['bane', 'pike', 'split'])
    expect(setInpField(rec('pike'), 'end', '1545')).toBe(true)
    expect(recs().map(r => r.e), 'typed on any man’s record of the line: everyone’s').toEqual([945, 945, 945])
    expect(setInpField(rec('bane'), 'rmks', 'Room 2')).toBe(true)
    expect(recs().map(r => r.remarks)).toEqual(['Room 2', 'Room 2', 'Room 2'])
    expect(setInpTitle(rec('split'), 'Range brief')).toBe(true)
    const now = INPUTS.filter((x: any) => x.title === 'Range brief') as any[]
    expect(now.map(r => r.person).sort(), 'the name is the entry’s: still one shared input of three').toEqual(['bane', 'pike', 'split'])
    expect(entryRowsOf(INPUTS, now[0])).toHaveLength(3)
    globalUndo(); globalUndo(); globalUndo()
    expect(recs().map(r => [r.e, r.remarks])).toEqual([[900, 'Bring your logbook'], [900, 'Bring your logbook'], [900, 'Bring your logbook']])
  })

  it('ON THE UNAVAILABLE LIST a typed box changes that ONE man’s record, as built (D737; reading R7) — the list stays a row a man', async () => {
    await boot(new MemoryBackend())
    expect(commitGroup(null, { ...draftOf({ person: 'bane', type: 'OD', date: 'Jul 15', yr: 2026, allday: true, remarks: 'Exercise' }) }, ['bane', 'split'])).toBe(true)
    const od = () => INPUTS.filter((x: any) => x.type === 'OD' && x.date === 'Jul 15' && (x.person === 'bane' || x.person === 'split')) as any[]
    expect(od(), 'a shared overseas duty: two records').toHaveLength(2)
    const his = od().find(r => r.person === 'split')
    expect(setInpField(his, 'rmks', 'Back early')).toBe(true)
    expect(od().map(r => [r.person, r.remarks]).sort()).toEqual([['bane', 'Exercise'], ['split', 'Back early']])
  })

  it('✕ takes the WHOLE input off the programme — every record reads "taken off", one Undo puts them all back', async () => {
    await boot(new MemoryBackend())
    fileGroup(['bane', 'pike', 'split'])
    press({ grdel: `${WED}.${leadKey().split('.')[1]}` })
    expect(recs().map(r => r.acc)).toEqual(['r', 'r', 'r'])
    expect(ground().filter((g: any) => g.srcg)).toHaveLength(0)
    globalUndo()
    expect(recs().map(r => r.acc)).toEqual(['g', 'g', 'g'])
    expect(groundGroups(DAYS[WED])[riOf('bane')]!.members).toHaveLength(3)
  })

  it('the red box and information-only are set alike on every row of it — so it stays one row; one Undo each', async () => {
    await boot(new MemoryBackend())
    fileGroup(['bane', 'pike', 'split'])
    const at = () => `${WED}.${leadKey().split('.')[1]}`
    press({ grflag: at() })
    expect(['bane', 'pike', 'split'].map(p => !!ground()[riOf(p)].flag)).toEqual([true, true, true])
    press({ grinfo: at() })
    expect(['bane', 'pike', 'split'].map(p => !!ground()[riOf(p)].info)).toEqual([true, true, true])
    expect(groundGroups(DAYS[WED])[riOf('bane')]!.members).toHaveLength(3)
    globalUndo()
    expect(['bane', 'pike', 'split'].map(p => !!ground()[riOf(p)].info)).toEqual([false, false, false])
    expect(['bane', 'pike', 'split'].map(p => !!ground()[riOf(p)].flag), 'the red box is its own step').toEqual([true, true, true])
  })

  it('CX: one question, one reason — written on every row of it', async () => {
    await boot(new MemoryBackend())
    fileGroup(['bane', 'pike', 'split'])
    press({ grcx: `${WED}.${leadKey().split('.')[1]}` })
    cxCommit(true, 'WX')
    expect(['bane', 'pike', 'split'].map(p => [ground()[riOf(p)].cx, ground()[riOf(p)].cxr])).toEqual([[true, 'WX'], [true, 'WX'], [true, 'WX']])
    expect(groundGroups(DAYS[WED])[riOf('bane')]!.members).toHaveLength(3)
  })

  it('Personal Inputs: the line’s Undo and Accept act on every record of it', async () => {
    await boot(new MemoryBackend())
    fileGroup(['bane', 'pike', 'split'])
    const tap = (dest: string) => { const b = document.createElement('button'); b.dataset.acc = dest; b.dataset.accd = String(WED); b.dataset.acck = String(inpId(rec('bane'))); document.body.appendChild(b); routeClick({ target: b, stopPropagation() {} } as any); b.remove() }
    tap('x')
    expect(recs().map(r => r.acc), 'Undo: all three taken off').toEqual(['r', 'r', 'r'])
    tap('g')
    expect(recs().map(r => r.acc), 'Accept: all three back').toEqual(['g', 'g', 'g'])
    expect(groundGroups(DAYS[WED])[riOf('bane')]!.members).toHaveLength(3)
  })

  it('the row dragged to a new place takes ALL its rows with it, together', async () => {
    await boot(new MemoryBackend())
    expect(commitNewInput(draftOf({ person: 'rocky', type: 'Training', date: 'Jul 15', yr: 2026, allday: false, s: 840, e: 900, remarks: 'first' }))).toBe(true)
    fileGroup(['bane', 'pike', 'split'])
    expect(commitNewInput(draftOf({ person: 'ignite', type: 'Training', date: 'Jul 15', yr: 2026, allday: false, s: 840, e: 900, remarks: 'last' }))).toBe(true)
    const names = () => ground().filter((g: any) => g.src).map((g: any) => String(g.rmks || g.who))
    schedWrite(SCHED_TYPES.mutate, () => { (DAYS[WED] as any).gman = true; afterSchedMutate() })
    const idx = (rmk: string) => ground().findIndex((g: any) => g.rmks === rmk)
    const lead = +leadKey().split('.')[1]!
    schedWrite(SCHED_TYPES.mutate, () => { expect(applyMove(`mv:g.${WED}.${lead}`, `mv:g.${WED}.${idx('first')}`)).toBe(true); afterSchedMutate() })
    expect(names().slice(0, 3), 'the three moved above the first row, side by side').toEqual(['Bring your logbook', 'Bring your logbook', 'Bring your logbook'])
    expect(names().slice(3)).toEqual(['first', 'last'])
    expect(groundGroups(DAYS[WED])[riOf('bane')]!.members).toHaveLength(3)
  })

  it('the LATE mark of the line is dropped and restored for every late record of it', async () => {
    await boot(new MemoryBackend())
    vi.setSystemTime(new Date(2026, 6, 14, 9, 0, 0))
    fileGroup(['bane', 'pike'])
    expect(recs().every(r => isLateInput(r))).toBe(true)
    const chip = document.createElement('button'); chip.setAttribute('data-lateoff', String(inpId(rec('bane')))); document.body.appendChild(chip)
    routeClick({ target: chip, stopPropagation() {} } as any)
    expect(recs().map(r => lateShown(r)), 'hidden for both').toEqual([false, false])
    routeClick({ target: chip, stopPropagation() {} } as any)
    expect(recs().map(r => lateShown(r)), 'and shown again').toEqual([true, true])
    chip.remove()
    void toggleLateOff
  })
})

describe('THE BELT in the engine, and what it leaves alone', () => {
  it('a raw write to a member’s place, and a real man on the row’s "+ add", are refused: nothing written, no mark', async () => {
    await boot(new MemoryBackend())
    fileGroup(['bane', 'pike'])
    const marks = JSON.stringify(SCHED.pending), rows = JSON.stringify(ground())
    expect(setSlotVal(keyOf('pike'), 'split'), 'another man into a member’s place').toBe(false)
    expect(setSlotVal(keyOf('pike'), ''), 'a member’s place emptied').toBe(false)
    expect(fillSlot(`${keyOf('pike')}.+`, 'split'), 'a real man on "+ add"').toBe(false)
    expect(JSON.stringify(ground())).toBe(rows)
    expect(JSON.stringify(SCHED.pending)).toBe(marks)
    expect(fillSlot(`${keyOf('pike')}.+`, 'allavail'), 'a placeholder is the row’s own (D46)').toBe(true)
    expect(ground()[riOf('pike')].more).toEqual(['allavail'])
  })

  it('the store’s own writers go through the door: a man written to a member’s place is ADDED; a member’s place emptied takes him out', async () => {
    await boot(new MemoryBackend())
    fileGroup(['bane', 'pike'])
    writeSlot(keyOf('pike'), 'split')
    expect(people()).toEqual(['bane', 'pike', 'split'])
    writeSlot(keyOf('pike'), '')
    expect(people()).toEqual(['bane', 'split'])
    writeFill(`${keyOf('bane')}.+`, 'rocky')
    expect(people()).toEqual(['bane', 'rocky', 'split'])
  })

  it('A ONE-MAN REQUEST’S ROW IS UNCHANGED (D18, D470): a man in its name box and a man added under it are the row’s own — the request stays one man’s', async () => {
    await boot(new MemoryBackend())
    expect(commitNewInput(draftOf({ person: 'bane', type: 'Training', date: 'Jul 15', yr: 2026, allday: false, s: 600, e: 660, remarks: 'solo' }))).toBe(true)
    const solo = INPUTS.find((x: any) => x.remarks === 'solo') as any
    const ri = ground().findIndex((g: any) => g.src === String(inpId(solo)))
    expect(groupPut(`g:${WED}.${ri}`, 'pike'), 'the door leaves it alone').toBe('none')
    expect(groupTake(`g:${WED}.${ri}`)).toBe('none')
    writeFill(`g:${WED}.${ri}.+`, 'pike')
    writeSlot(`g:${WED}.${ri}`, 'split')
    const row = ground().find((g: any) => g.src === String(inpId(solo)))
    expect([row.who, row.more]).toEqual(['split', ['pike']])
    expect(INPUTS.filter((x: any) => x.remarks === 'solo')).toHaveLength(1)
    expect(solo.grp).toBeUndefined()
  })
})

describe('THE DROP ITSELF goes through the door (ui/drag.ts applyDrop) — one drop, one Undo step', () => {
  /* a stand-in for the drawn place: applyDrop reads only the key off the element it is let go on */
  const seatEl = (key: string) => { const el = document.createElement('span'); el.className = 'seat'; el.dataset.slot = key; document.body.appendChild(el); return el }
  const cellEl = (key: string) => { const row = document.createElement('div'); row.className = 'pl-row'; const c = document.createElement('div'); c.className = 'ppl'; c.dataset.fill = key; row.appendChild(c); document.body.appendChild(row); return c }
  afterEach(() => { document.body.innerHTML = ''; setDrag(null) })

  it('a name from the crew list dropped on a man’s puck, and on the row’s "+ add": he is IN the input — the flash is on HIS OWN place, and one Undo takes him out again', async () => {
    for (const where of ['puck', 'add'] as const) {
      resetWorld(); await boot(new MemoryBackend())
      fileGroup(['bane', 'pike'])
      setDrag({ kind: 'roster', id: 'split' })
      expect(applyDrop(where === 'puck' ? seatEl(keyOf('pike')) : cellEl(`${leadKey()}.+`), 0, 0), where).toBe(true)
      expect(people(), where).toEqual(['bane', 'pike', 'split'])
      expect(ground()[riOf('pike')].who, 'the man he was dropped on keeps his place').toBe('pike')
      expect(pendingLand()!.sel, 'the landing flash').toContain(`[data-slot="${keyOf('split')}"]`)
      globalUndo()
      expect(people(), 'ONE Undo').toEqual(['bane', 'pike'])
    }
  })

  it('a puck dragged from a flying seat onto the row: he is added, and the seat he came from keeps him (reading R4)', async () => {
    await boot(new MemoryBackend())
    fileGroup(['bane', 'pike'])
    const seat = '2.0.0.0.p', flew = slotVal(seat)
    setDrag({ kind: 'slot', key: seat })
    expect(applyDrop(seatEl(keyOf('bane')), 0, 0)).toBe(true)
    expect(people()).toContain(flew)
    expect(slotVal(seat), 'still in his seat').toBe(flew)
    expect(ground()[riOf('bane')].who, 'nobody was swapped out of the input').toBe('bane')
  })

  it('one of the input’s men dragged onto a flying seat: OUT of the input and IN the seat, in one step — the man who sat there comes off, never into the input; one Undo puts back both', async () => {
    await boot(new MemoryBackend())
    fileGroup(['bane', 'pike', 'split'])
    const seat = '2.0.0.0.p', flew = slotVal(seat)
    expect(flew && flew !== 'pike').toBeTruthy()
    setDrag({ kind: 'slot', key: keyOf('pike') })
    expect(applyDrop(seatEl(seat), 0, 0)).toBe(true)
    expect(people()).toEqual(['bane', 'split'])
    expect(slotVal(seat)).toBe('pike')
    expect(people(), 'the man he replaced is not in the input').not.toContain(flew)
    expect(pendingLand()!.sel).toContain(`[data-slot="${seat}"]`)
    globalUndo()
    expect([people(), slotVal(seat)], 'ONE Undo: back in the input, and the seat its own man’s').toEqual([['bane', 'pike', 'split'], flew])
  })

  it('dragged onto the "+ add" of a ground row BELOW his own, with another row under that: the flash names the place AS IT STANDS once his old row has gone', async () => {
    await boot(new MemoryBackend())
    fileGroup(['bane', 'pike', 'split'])
    expect(commitNewInput(draftOf({ person: 'rocky', type: 'Training', date: 'Jul 15', yr: 2026, allday: false, s: 600, e: 660, remarks: 'below' }))).toBe(true)
    expect(commitNewInput(draftOf({ person: 'ignite', type: 'Training', date: 'Jul 15', yr: 2026, allday: false, s: 600, e: 660, remarks: 'under it' }))).toBe(true)
    const at = (rmk: string) => ground().findIndex((g: any) => g.rmks === rmk)
    expect(at('below'), 'below the three').toBeGreaterThan(riOf('split'))
    expect(at('under it')).toBeGreaterThan(at('below'))
    const before = at('below')
    setDrag({ kind: 'slot', key: keyOf('pike') })
    expect(applyDrop(cellEl(`g:${WED}.${before}.+`), 0, 0)).toBe(true)
    expect(at('below'), 'his old row has gone: the row moved up one').toBe(before - 1)
    expect(ground()[at('below')].more).toEqual(['pike'])
    expect(ground()[at('under it')].more || [], 'never the row under it').toEqual([])
    expect(pendingLand()!.sel).toContain(`[data-slot="g:${WED}.${at('below')}.x0"]`)
    expect(people()).toEqual(['bane', 'split'])
  })

  it('let go on nothing: he leaves the input — and THE LAST MAN is refused and stays', async () => {
    await boot(new MemoryBackend())
    fileGroup(['bane', 'pike'])
    setDrag({ kind: 'slot', key: keyOf('pike') })
    expect(applyDrop(document.body, 0, 0)).toBe(true)
    expect(people()).toEqual(['bane'])
    setDrag({ kind: 'slot', key: keyOf('bane') })
    expect(applyDrop(document.body, 0, 0)).toBe(false)
    expect(people()).toEqual(['bane'])
    expect(ground()[riOf('bane')].who, 'his name box is never left empty').toBe('bane')
    expect(SAID[SAID.length - 1]).toContain('is the last person on this input')
  })

  it('a placeholder dropped on a man’s puck goes to the row’s "+ add" — never into his place; and dragged off again onto a man elsewhere, that man is NOT carried back onto the row', async () => {
    await boot(new MemoryBackend())
    fileGroup(['bane', 'pike'])
    setDrag({ kind: 'roster', id: 'allavail' })
    expect(applyDrop(seatEl(keyOf('pike')), 0, 0)).toBe(true)
    const lead = () => ground()[+leadKey().split('.')[1]!]
    expect(lead().more).toEqual(['allavail'])
    expect([ground()[riOf('bane')].who, ground()[riOf('pike')].who]).toEqual(['bane', 'pike'])
    expect(people()).toEqual(['bane', 'pike'])
    /* a duty desk with a man on it: the placeholder moves there, he comes off — he is not put among the row's extras */
    const desk = `d:${WED}.0.0`, man = slotVal(desk)
    expect(man, 'a named man on a duty desk').toBeTruthy()
    setDrag({ kind: 'slot', key: `${leadKey()}.x0` })
    expect(applyDrop(seatEl(desk), 0, 0)).toBe(true)
    expect(slotVal(desk)).toBe('allavail')
    expect(lead().more || [], 'nobody was swapped onto the shared row').toEqual([])
    expect(people()).toEqual(['bane', 'pike'])
  })

  it('an armed place on the row, filled by a tap on a name: he is added to the input, the place is put down — one Undo', async () => {
    await boot(new MemoryBackend())
    fileGroup(['bane', 'pike'])
    view.armSlot(`${leadKey()}.+`)
    expect(view.armedKey()).toBe(`${leadKey()}.+`)
    expect(view.placeArmed('split')).toBe(true)
    expect(people()).toEqual(['bane', 'pike', 'split'])
    expect(view.armedKey()).toBe('')
    /* already in it: refused, and the place stays armed for the next name */
    view.armSlot(`${leadKey()}.+`)
    expect(view.placeArmed('pike')).toBe(false)
    expect(view.armedKey()).toBe(`${leadKey()}.+`)
    view.disarmSlot()
    globalUndo()
    expect(people()).toEqual(['bane', 'pike'])
  })
})

/* FROM ONE SHARED INPUT'S ROW ONTO ANOTHER'S (Fable's read of the job's code, F1 — 11 Oct 26; reading R4, D734: "a man
   dragged from the one row onto another place LEAVES the input and is put there, in one step"). The drop asked the
   TARGET's door first, whose rule for a man from a seat elsewhere is "the seat he came from keeps him" — right for a
   flying seat, wrong for a member's own place on another shared row: he was added to the second input and STAYED in
   the first, booked twice at the same hour. He moves: out of the first, into the second, one command, one Undo. */
describe('one of an input’s men dragged onto ANOTHER shared input’s row moves — he is never in both (Fable F1)', () => {
  const seatEl = (key: string) => { const el = document.createElement('span'); el.className = 'seat'; el.dataset.slot = key; document.body.appendChild(el); return el }
  const cellEl = (key: string) => { const row = document.createElement('div'); row.className = 'pl-row'; const c = document.createElement('div'); c.className = 'ppl'; c.dataset.fill = key; row.appendChild(c); document.body.appendChild(row); return c }
  afterEach(() => { document.body.innerHTML = ''; setDrag(null) })
  const T2 = 'Second brief'
  const second = () => expect(commitGroup(null, DRAFT(WED, { title: T2 }), ['rocky', 'ignite'])).toBe(true)
  const recs2 = () => INPUTS.filter((x: any) => x.title === T2 && x.date === 'Jul 15') as any[]
  const people2 = () => recs2().map(r => r.person).sort()
  const key2 = (p: string) => `g:${WED}.${ground().findIndex((g: any) => g && g.src === String(inpId(recs2().find(r => r.person === p))))}`

  for (const where of ['puck', 'add'] as const) {
    it(`dropped on the other row’s ${where === 'puck' ? 'puck' : '"+ add"'}: out of the first input, in the second — one Undo puts back both`, async () => {
      await boot(new MemoryBackend())
      fileGroup(['bane', 'pike', 'split']); second()
      setDrag({ kind: 'slot', key: keyOf('pike') })
      expect(applyDrop(where === 'puck' ? seatEl(key2('rocky')) : cellEl(`${key2('rocky')}.+`), 0, 0)).toBe(true)
      expect(people(), 'he has LEFT the first').toEqual(['bane', 'split'])
      expect(people2(), 'and is in the second').toEqual(['ignite', 'pike', 'rocky'])
      globalUndo()
      expect([people(), people2()], 'ONE Undo').toEqual([['bane', 'pike', 'split'], ['ignite', 'rocky']])
    })
  }
  it('the door itself: the LAST man of the first input is refused and joins nothing; a man already in the second is refused and leaves nothing', async () => {
    await boot(new MemoryBackend())
    fileGroup(['bane', 'pike']); second()
    expect(groupTake(keyOf('pike'))).toBe('done')
    expect(groupMove(keyOf('bane'), key2('rocky')), 'the last man stays').toBe('refused')
    expect([people(), people2()]).toEqual([['bane'], ['ignite', 'rocky']])
    expect(groupPut(key2('rocky'), 'bane')).toBe('done')              // from the crew list: in both, as a name from the list is
    expect(groupPut(keyOf('bane'), 'split')).toBe('done')
    expect(groupMove(keyOf('bane'), key2('rocky')), 'already in the second').toBe('refused')
    expect(people(), 'and he has not left the first').toEqual(['bane', 'split'])
    expect(groupMove(keyOf('bane'), keyOf('split')), 'the same input: not this door’s').toBe('none')
  })
})
