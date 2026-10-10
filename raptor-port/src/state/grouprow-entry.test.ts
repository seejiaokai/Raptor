// @vitest-environment jsdom
/* THE ENTRY ON THE ROW, KEPT AS THE ENTRY'S ROWS (`[GROUP-INPUT-ONE-ROW]` step 3; owner D661 — "on the schedule a group
   input is ONE row holding everyone", D735 — "the row never splits or joins by itself", D450 — a day is saved only by its
   holder; the plan docs/superpowers/plans/2026-10-10-group-input-one-row-plan.md §4.1, §4.2).

   A shared input is still one record a man and one ground row a man. This step makes those rows KNOWN as one entry and
   keeps them alike, in the view — never by a write to the day:
   - every row of one entry carries one mark, `srcg`, and a man added later lands straight after the last of them
     with their CX and its reason, red box and information-only — by landing AND by a scheduler's Accept;
   - a row put BACK where a published version had it goes back there (no reorder waiting);
   - a grouped row's name box is its own man's: whoever stood there when the request became part of a group moves to
     that row's extras — and, if he is himself made one of the people, comes off it and stands on his own row, a
     scheduler's refusal of his OIL carried with him;
   - an armed place is put down when a row lands above it;
   - a saved day template takes one row for the one row.
   Driven through the app's own doors on a real saved store, as state/p6c-requestonread.test.ts is; a "reload" is a
   second boot from the same store. */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { INPUTS, inpId } from '../engine/inputs'
import { PEOPLE, ID_BY_CS, indexCallsigns } from '../engine/people'
import { DAYS } from '../engine/data'
import { CURWEEK } from '../engine/waves'
import { storeBackend, HOOKS } from '../engine/hooks'
import { stashClear } from '../engine/weekstash'
import { SCHED, signOf, dayShownPendCount } from '../engine/publish'
import { acceptInput, unacceptInput } from '../engine/slots'
import { entryIdOf } from '../engine/inputentry'
import { groundGroups } from '../engine/grouprows'
import { tplFromDay } from '../engine/daytpl'
import { PLANPUCKS, DAYRMK } from './plan'
import { initStore, weekStashSnap, weekDirty, loadWeek, writeSlot, writeFill } from './store'
import { commitSetDayApproved, schedWrite, SCHED_TYPES } from './sched-commit'
import { setSession, setMe, DEFAULT_ME } from './auth'
import { hydrate, wirePersist } from './persist'
import { bootStorage } from '../storage/boot'
import { settingsAdapter } from '../storage/adapters'
import { MemoryBackend } from '../storage/memory'
import { SCHEMA_VERSION } from '../storage/reset'
import type { Whiteboard } from '../storage/whiteboard'
import { globalUndo } from '../undo'
import { _resetTimeline } from '../undo/timeline'
import { installGlobalUndo } from './undo-wire'
import { _resetDisclosure } from './disclosure'
import { afterSchedMutate, setPage } from './view'
import * as view from './view'
import { commitNewInput, commitGroup, draftOf } from '../ui/inputedit'

const ISNAP = JSON.stringify(INPUTS)
const PSNAP = JSON.stringify(PEOPLE)
const DSNAP = JSON.stringify(DAYS)
const W1 = '13/07/2026'
const WED = 2                                            // Wed 15 Jul
const sign = (di: number) => { const g = signOf(di); g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump' }
const toast = HOOKS.toast

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
  setPage('editsched')
  return wb
}
async function reload(be: MemoryBackend): Promise<Whiteboard> { await vi.advanceTimersByTimeAsync(1000); resetWorld(); return boot(be) }

const ground = () => ((DAYS[WED] as any).ground || []) as any[]
const riOf = (iid: string) => ground().findIndex((g: any) => g && g.src === iid)
const rowOf = (iid: string) => ground().find((g: any) => g && g.src === iid)
const rec = (p: string, type = 'Training') => INPUTS.find((x: any) => x.person === p && x.type === type && x.date === 'Jul 15') as any
const iidOf = (p: string, type = 'Training') => String(inpId(rec(p, type)))
/* the row order of the day's requests, by who they are for — hand-built rows of the seed are left out */
const order = () => ground().filter((g: any) => g && g.src).map((g: any) => String(g.who))
const DRAFT = () => draftOf({ person: 'bane', type: 'Training', date: 'Jul 15', yr: 2026, allday: false, s: 660, e: 720, remarks: 'range safety brief' })
/* a shared input filed for these people, in this order — the Inputs calendar's own save */
const fileGroup = (people: string[]) => expect(commitGroup(null, DRAFT(), people)).toBe(true)
const entry = (p: string) => ({ rows: INPUTS.filter((x: any) => x.grp && x.grp === rec(p).grp && x.type === 'Training') })
const setPeople = (of: string, people: string[]) => expect(commitGroup(entry(of), DRAFT(), people)).toBe(true)
/* an ordinary one-man request beside it */
const fileOne = (p: string, type = 'Meeting') => expect(commitNewInput(draftOf({ person: p, type, date: 'Jul 15', yr: 2026, allday: false, s: 840, e: 900, remarks: '' }))).toBe(true)
const mark = (iids: string[], o: any) => schedWrite(SCHED_TYPES.mutate, () => { for (const id of iids) Object.assign(rowOf(id), o); afterSchedMutate() })
const publish = (di: number) => { sign(di); commitSetDayApproved(di, true) }
const off = (p: string) => schedWrite(SCHED_TYPES.mutate, () => { expect(unacceptInput(WED, rec(p))).toBe(true); afterSchedMutate() })
const on = (p: string) => schedWrite(SCHED_TYPES.mutate, () => { expect(acceptInput(WED, rec(p), 'g')).toBe(true); afterSchedMutate() })

beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(new Date(2026, 6, 13, 9, 0, 0)); resetWorld(); HOOKS.toast = () => {} })
afterEach(() => { HOOKS.toast = toast; _resetTimeline(); vi.useRealTimers(); resetWorld(); setSession(null); setMe(DEFAULT_ME); storeBackend.impl = null })

describe('the rows of one shared input carry one mark and stand together (D661)', () => {
  it('a group filed for three: three rows, one `srcg` — the entry’s own — side by side, and read as ONE row', async () => {
    const be = new MemoryBackend()
    await boot(be)
    fileGroup(['rocky', 'bane', 'pike'])
    const ids = ['rocky', 'bane', 'pike'].map(p => iidOf(p))
    const marks = ids.map(id => rowOf(id).srcg)
    expect(marks[0], 'the entry’s own identity').toBe(entryIdOf(rec('bane')))
    expect(new Set(marks).size).toBe(1)
    const at = ids.map(riOf).sort((a, b) => a - b)
    expect(at[2]! - at[0]!, 'side by side').toBe(2)
    const g = groundGroups(DAYS[WED])[at[0]!]!
    expect(g.members.slice().sort((a, b) => a - b)).toEqual(at)
    await reload(be)
    expect(['rocky', 'bane', 'pike'].map(p => rowOf(iidOf(p)).srcg), 'after a reload').toEqual(marks)
  })

  it('an ordinary request’s row carries no such mark', async () => {
    await boot(new MemoryBackend())
    fileOne('bane')
    expect('srcg' in rowOf(iidOf('bane', 'Meeting'))).toBe(false)
  })

  it('a man whose own record is changed alone is his own row again — the rows are honestly drawn apart (D735)', async () => {
    await boot(new MemoryBackend())
    fileGroup(['bane', 'pike'])
    const a = rowOf(iidOf('bane')).srcg
    expect(commitGroup({ rows: [rec('pike')] }, { ...DRAFT(), end: '2026-07-16' }, ['pike']), 'his record alone, another last day').toBe(true)
    const pk = INPUTS.find((x: any) => x.person === 'pike' && x.type === 'Training') as any
    const row = ground().find((g: any) => g && g.src === String(inpId(pk)))
    expect(row.srcg, 'another entry of the same group').not.toBe(a)
    expect([row.prog, row.str, row.end], 'though the row shows the same name and times').toEqual(['TRAINING', '11:00', '12:00'])
    const groups = groundGroups(DAYS[WED])
    expect(groups[riOf(iidOf('bane'))]!.members).toHaveLength(1)
    expect(groups[ground().indexOf(row)]!.members).toHaveLength(1)
  })
})

describe('a man added later joins the rows where they stand, with what the scheduler set on them (the plan §4.2)', () => {
  it('BY LANDING: he lands straight after the last of them — above a row filed since — with their CX and its reason, red box and information-only; after a reload too', async () => {
    const be = new MemoryBackend()
    await boot(be)
    fileGroup(['bane', 'pike'])
    fileOne('rocky')                                      // a row below the two
    expect(order()).toEqual(['bane', 'pike', 'rocky'])
    mark([iidOf('bane'), iidOf('pike')], { cx: true, cxr: 'WX', flag: true, info: true })
    setPeople('bane', ['bane', 'pike', 'split'])
    expect(order(), 'after the last of his entry, not at the end').toEqual(['bane', 'pike', 'split', 'rocky'])
    const row = rowOf(iidOf('split'))
    expect({ cx: row.cx, cxr: row.cxr, flag: row.flag, info: row.info }).toEqual({ cx: true, cxr: 'WX', flag: true, info: true })
    expect(groundGroups(DAYS[WED])[riOf(iidOf('bane'))]!.members, 'so the three are still one row').toHaveLength(3)
    await reload(be)
    expect(order(), 'after a reload').toEqual(['bane', 'pike', 'split', 'rocky'])
    const again = rowOf(iidOf('split'))
    expect({ cx: again.cx, cxr: again.cxr, flag: again.flag, info: again.info }).toEqual({ cx: true, cxr: 'WX', flag: true, info: true })
  })

  it('BY ACCEPT: a man taken off the programme and accepted again goes back after the last of them, with their marks', async () => {
    await boot(new MemoryBackend())
    fileGroup(['bane', 'pike', 'split'])
    fileOne('rocky')
    off('pike')
    expect(order()).toEqual(['bane', 'split', 'rocky'])
    mark([iidOf('bane'), iidOf('split')], { flag: true })
    on('pike')
    expect(order()).toEqual(['bane', 'split', 'pike', 'rocky'])
    expect(rowOf(iidOf('pike')).flag).toBe(true)
  })

  for (const hand of [false, true]) {
    it(`a whole group filed out of A-to-Z order, published, taken off and accepted again${hand ? ' — on a hand-ordered list' : ''}: nothing is waiting (D98) — each row is back where the published version had it`, async () => {
      await boot(new MemoryBackend())
      fileOne('ignite')
      fileGroup(['rocky', 'bane', 'pike'])
      fileOne('split')
      if (hand) schedWrite(SCHED_TYPES.mutate, () => { (DAYS[WED] as any).gman = true; afterSchedMutate() })
      const was = order()
      publish(WED)
      expect(dayShownPendCount(WED)).toBe(0)
      for (const p of ['rocky', 'bane', 'pike']) off(p)
      expect(dayShownPendCount(WED), 'taken off: something is waiting').toBeGreaterThan(0)
      for (const p of ['pike', 'rocky', 'bane']) on(p)      // put back in another order than it was issued in
      expect(order(), 'the published order').toEqual(was)
      expect(dayShownPendCount(WED), 'back to what was published').toBe(0)
    })
  }
})

describe('a grouped row’s name box is its own man’s (the plan §4.2)', () => {
  it('a one-man request with ALL AVAIL in its name box, made a group: its man is in the name box, ALL AVAIL among its extras, nothing dropped', async () => {
    const be = new MemoryBackend()
    await boot(be)
    expect(commitNewInput(DRAFT())).toBe(true)
    const iid = iidOf('bane')
    writeSlot(`g:${WED}.${riOf(iid)}`, 'allavail')
    expect(rowOf(iid).who, 'the placeholder stands in the name box (D46)').toBe('allavail')
    schedWrite(SCHED_TYPES.mutate, () => { (DAYS[WED] as any).oild = { people: { [`comet|i:${iid}`]: 'deny' } }; afterSchedMutate() })
    expect(commitGroup({ rows: [rec('bane')] }, DRAFT(), ['bane', 'pike'])).toBe(true)
    const row = rowOf(iid)
    expect(row.who, 'its own man').toBe('bane')
    expect(row.more, 'the placeholder moved to the row’s extras').toEqual(['allavail'])
    expect((DAYS[WED] as any).oild.people, 'the switches made under it are where they were').toEqual({ [`comet|i:${iid}`]: 'deny' })
    expect(order(), 'and the man added stands beside him').toEqual(['bane', 'pike'])
    await reload(be)
    expect([rowOf(iid).who, rowOf(iid).more]).toEqual(['bane', ['allavail']])
  })

  /* the scheduler's man (D470) stands in the name box of Ranger's request, his OIL refused there; he is then made one of
     the input's people in its own window */
  const refusedThenAdded = () => {
    expect(commitNewInput(DRAFT())).toBe(true)
    const iid = iidOf('bane')
    writeSlot(`g:${WED}.${riOf(iid)}`, 'pike')
    schedWrite(SCHED_TYPES.mutate, () => { (DAYS[WED] as any).oild = { people: { [`pike|i:${iid}`]: 'deny' } }; afterSchedMutate() })
    expect(commitGroup({ rows: [rec('bane')] }, DRAFT(), ['bane', 'pike'])).toBe(true)
    return iid
  }
  const onHisOwnRow = (iid: string) => {
    const his = iidOf('pike')
    expect(rowOf(iid).who, 'the request’s own man is back in his name box').toBe('bane')
    expect(rowOf(iid).more || [], 'and the other man is not kept on it a second time (D271)').toEqual([])
    expect(rowOf(his).who).toBe('pike')
    expect((DAYS[WED] as any).oild.people[`pike|i:${his}`], 'the refusal went with him').toBe('deny')
  }
  it('a scheduler’s man in the name box, his OIL refused, then made one of the people: he stands on his OWN row — still refused, under his own request; a reload agrees', async () => {
    const be = new MemoryBackend()
    await boot(be)
    const iid = refusedThenAdded()
    onHisOwnRow(iid)
    await reload(be)
    onHisOwnRow(iid)
  })

  it('…and Undo of that save puts everything back: the scheduler’s man in the name box, his refusal where it was made', async () => {
    await boot(new MemoryBackend())
    const iid = refusedThenAdded()
    globalUndo()
    expect(rowOf(iid).who).toBe('pike')
    expect((DAYS[WED] as any).oild.people).toEqual({ [`pike|i:${iid}`]: 'deny' })
    expect(order(), 'one row again').toEqual(['pike'])
  })

  it('a man standing among a member’s extras who is made one of the people comes off the extras — one man, once on the row (D271)', async () => {
    await boot(new MemoryBackend())
    fileGroup(['bane', 'split'])
    writeFill(`g:${WED}.${riOf(iidOf('bane'))}.+`, 'allavail')
    schedWrite(SCHED_TYPES.mutate, () => { rowOf(iidOf('bane')).more = ['allavail', 'pike']; afterSchedMutate() })
    setPeople('bane', ['bane', 'split', 'pike'])
    expect(rowOf(iidOf('bane')).more, 'the placeholder stays; the man now in the input does not stand twice').toEqual(['allavail'])
    expect(order()).toEqual(['bane', 'split', 'pike'])
  })
})

describe('what stands around the rows', () => {
  it('an armed place BELOW is put down when a row lands above it — the next tap on a name must not plant into another row; one above stays armed', async () => {
    await boot(new MemoryBackend())
    fileGroup(['bane', 'pike'])
    fileOne('rocky')
    view.armSlot(`g:${WED}.${riOf(iidOf('rocky', 'Meeting'))}.+`)
    expect(view.ARM, 'armed').toBeTruthy()
    setPeople('bane', ['bane', 'pike', 'split'])
    expect(view.ARM, 'put down: its row moved').toBeNull()
    view.armSlot(`g:${WED}.${riOf(iidOf('bane'))}.+`)
    setPeople('bane', ['bane', 'pike', 'split', 'ignite'])
    expect(view.ARM && view.ARM.key, 'a place above the new row is the same row still').toBe(`g:${WED}.${riOf(iidOf('bane'))}.+`)
  })

  it('a day template saved from a day with a one row takes ONE row for it — and nothing of the request', async () => {
    await boot(new MemoryBackend())
    const before = tplFromDay(WED, 't').d.ground.length
    fileGroup(['bane', 'pike', 'split'])
    fileOne('rocky')
    const t = tplFromDay(WED, 't').d.ground
    expect(t.length, 'one for the shared input, one for the ordinary request').toBe(before + 2)
    expect(t.filter((r: any) => r.prog === 'TRAINING')).toHaveLength(1)
    expect(t.some((r: any) => 'srcg' in r || 'src' in r || 'srcv' in r)).toBe(false)
  })
})
