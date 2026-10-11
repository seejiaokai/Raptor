// @vitest-environment jsdom
/* A PUBLISHED DAY COUNTS A SHARED INPUT ONCE (`[GROUP-INPUT-ONE-ROW]` step 6). His ruling:
   D736 — "on a published day a shared input filed, taken off the programme or re-timed is ONE change waiting — one
           line, naming its people — and one man taken off its row or added to it is one change each";
   with D109, D113, D114 (the unit a person counts in), D98 (back to what was published is nothing waiting), D103 / D45
   (what goes out and the sign-offs are not touched), D93 (a change waiting on a puck wears the hollow tag), D745 (an
   ALL AVAIL comes off with its man, and the line says so). The plan:
   docs/superpowers/plans/2026-10-10-group-input-one-row-plan.md §4.8.

   THE RULE THE COUNT FOLLOWS: the one row counts exactly what a one-man request's row counts for the same act — never
   that, times its people. Underneath a shared input is still a record a man and a row a man, so the comparison with
   the issued version (dayDelta — what goes out, what the sign-offs are bound to) still holds an entry a man; only the
   unit a PERSON counts in folds them (engine/entryfold.ts foldEntries, the last step of publish.ts dayPendingItemsIn).
   Every count reads that one list: the day head, the board's head, the Amendments box, the changes window's title and
   "To go out" tab, the sign-off line, and the published amendment's own item count. "Discard N edits" shares the fold,
   not the number — it counts what a load of the issued version would really put back.

   Driven through the app's own doors on a real saved store, as state/grouprow-entry.test.ts is.
   Behaviour register: GI16, GI17, GI18, GI19, GI20. */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { INPUTS, inpId } from '../engine/inputs'
import { PEOPLE, ID_BY_CS, indexCallsigns } from '../engine/people'
import { DAYS } from '../engine/data'
import { CURWEEK } from '../engine/waves'
import { storeBackend, HOOKS } from '../engine/hooks'
import { stashClear } from '../engine/weekstash'
import { SCHED, signOf, dayShownPendCount, dayPendingItems, dayDiscardCount, dayDelta, alCount, itemCounts } from '../engine/publish'
import { groundGroups } from '../engine/grouprows'
import { ridKey } from '../engine/rowids'
import { oilEvidence } from '../engine/oilev'
import { PLANPUCKS, DAYRMK } from './plan'
import { initStore, weekStashSnap, weekDirty, loadWeek, writeFill, writeSlot } from './store'
import { commitSetDayApproved, commitPublishALDay, commitUnpublish, schedWrite, SCHED_TYPES } from './sched-commit'
import { setSession, setMe, DEFAULT_ME } from './auth'
import { entryRowsOf } from './inputgroup'
import { hydrate, wirePersist } from './persist'
import { bootStorage } from '../storage/boot'
import { settingsAdapter } from '../storage/adapters'
import { MemoryBackend } from '../storage/memory'
import { SCHEMA_VERSION } from '../storage/reset'
import { globalUndo } from '../undo'
import { _resetTimeline } from '../undo/timeline'
import { installGlobalUndo } from './undo-wire'
import { _resetDisclosure } from './disclosure'
import { afterSchedMutate, setPage, setBoardDay } from './view'
import * as view from './view'
import { commitNewInput, commitGroup, draftOf, removeEntry, removeInput } from '../ui/inputedit'
import { reqRowText } from '../ui/reqrow'
import { groupPut, groupTake } from '../ui/grouprow'
import { boardMbtn, cxCommit } from '../ui/board'
import { routeClick } from '../ui/interactions'
import { pendListHTML } from '../ui/pendlist'

const ISNAP = JSON.stringify(INPUTS)
const PSNAP = JSON.stringify(PEOPLE)
const DSNAP = JSON.stringify(DAYS)
const W1 = '13/07/2026'
const WED = 2, SAT = 5
const sign = (di: number) => { const g = signOf(di); g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump' }
const toast = HOOKS.toast, earning = HOOKS.oilEarningDay, sentinel = HOOKS.oilSentinel, dayISO = HOOKS.oilDayISO
/* THE OIL SIDE OF A DAY, SWITCHED ON FOR A TEST: the Leave War hands the engine a day's date, whether it earns and who
   stands behind a placeholder (leavewar/sync.ts installs the three); with none of them the day has no OIL block at
   all, and a test of "what the day earns" would be comparing nothing with nothing (ui/pendcrowd-request.test.ts) */
const ISO = ['2026-07-13', '2026-07-14', '2026-07-15', '2026-07-16', '2026-07-17', '2026-07-18', '2026-07-19']
const oilOn = (earns: number[], crowd: string[] = []) => {
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
  stashClear()
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
  setSession({ user: 'ad', role: 'admin', name: 'ad' }); setMe('stiff')      // Saber, a scheduler
  setPage('editsched'); setBoardDay(WED)
}

const cs = (p: string) => String((PEOPLE as any)[p].cs)
const TITLE = 'Range safety brief'
const dOf = (di: number) => (di === SAT ? 'Jul 18' : 'Jul 15')
const recs = (di = WED) => INPUTS.filter((x: any) => x.title === TITLE && x.date === dOf(di)) as any[]
const rec = (p: string, di = WED) => recs(di).find(r => r.person === p)
const ground = (di = WED) => ((DAYS[di] as any).ground || []) as any[]
const riOf = (p: string, di = WED) => { const r = rec(p, di); return r ? ground(di).findIndex((g: any) => g && g.src === String(inpId(r))) : -1 }
const keyOf = (p: string, di = WED) => `g:${di}.${riOf(p, di)}`
const DRAFT = (di = WED, over: any = {}) => ({ ...draftOf({ person: 'bane', type: di === SAT ? 'Duty' : 'Meeting', title: TITLE, date: dOf(di), yr: 2026, allday: false, s: 840, e: 900, remarks: 'Bring your logbook' }), ...over })
const fileGroup = (ppl: string[], di = WED) => expect(commitGroup(null, DRAFT(di), ppl)).toBe(true)
const fileOne = (p: string, di = WED) => expect(commitNewInput(DRAFT(di, { person: p }))).toBe(true)
const leadRi = (di = WED) => groundGroups(DAYS[di])[riOf(recs(di)[0].person, di)]!.lead
const publish = (di: number) => { sign(di); commitSetDayApproved(di, true) }
const press = (data: Record<string, string>) => { const b = document.createElement('button'); b.className = 'mbtn'; Object.assign(b.dataset, data); document.body.appendChild(b); boardMbtn({ target: b } as any); b.remove() }
const FOUR = ['bane', 'pike', 'split', 'rocky']
/* THE count — and every reader of it agrees: the list's own length, the day head's number, the Amendments box's total */
const waiting = (di = WED): number => {
  const n = dayPendingItems(di).length
  expect(dayShownPendCount(di), 'the day head reads the same list').toBe(n)
  expect(itemCounts(dayPendingItems(di)).total, 'the Amendments box').toBe(n)
  expect(n === 0, 'never zero while something would go out, never something while nothing would').toBe(dayDelta(di).length === 0)
  return n
}
/* the acts, as a scheduler makes them */
const retime = (di = WED) => expect(reqRowText(`gr:${di}.${leadRi(di)}.str`, '1430')).toBe('saved')
const takeOffWhole = (di = WED) => { setBoardDay(di); press({ grdel: `${di}.${leadRi(di)}` }) }
const cx = (di = WED) => { setBoardDay(di); press({ grcx: `${di}.${leadRi(di)}` }); cxCommit(true, 'WX') }
const deleteWhole = (di = WED) => expect(removeEntry(entryRowsOf(INPUTS, recs(di)[0]))).toBe(true)

beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(new Date(2026, 6, 13, 9, 0, 0)); resetWorld(); HOOKS.toast = () => {} })
afterEach(() => { HOOKS.toast = toast; HOOKS.oilEarningDay = earning; HOOKS.oilSentinel = sentinel; HOOKS.oilDayISO = dayISO; _resetTimeline(); vi.useRealTimers(); resetWorld(); setSession(null); setMe(DEFAULT_ME); storeBackend.impl = null })

describe('the counts — on a day that earns no OIL (D736)', () => {
  it('FILED for four since the day went out: ONE change waiting — and still one after a man is taken off before it goes out', async () => {
    await boot(); publish(WED)
    fileGroup(FOUR)
    expect(waiting()).toBe(1)
    expect(dayDelta(WED).length, 'what goes out is untouched: an entry a man, as before').toBe(12)
    expect(groupTake(keyOf('pike'))).toBe('done')
    expect(waiting(), 'three people now — still the one filing').toBe(1)
    expect(dayPendingItems(WED)[0]!.people!.slice().sort()).toEqual(['bane', 'rocky', 'split'])
  })

  it('issued for four — ONE MAN taken off is one; TWO are two; ONE ADDED is one; two added are two', async () => {
    await boot(); fileGroup(FOUR); publish(WED)
    expect(waiting()).toBe(0)
    expect(groupTake(keyOf('pike'))).toBe('done')
    expect(waiting()).toBe(1)
    expect(groupTake(keyOf('split'))).toBe('done')
    expect(waiting(), 'one man taken off is one each').toBe(2)
    globalUndo(); globalUndo()
    expect(waiting(), 'back to what was published').toBe(0)
    expect(groupPut(keyOf('bane'), 'ignite')).toBe('done')
    expect(waiting()).toBe(1)
    expect(groupPut(keyOf('bane'), 'taipan')).toBe('done')
    expect(waiting(), 'one man added is one each').toBe(2)
  })

  it('RE-TIMED: one — and re-timed with one man added: two', async () => {
    await boot(); fileGroup(FOUR); publish(WED)
    retime()
    expect(waiting()).toBe(1)
    expect(dayDelta(WED).length, 'the record still holds every man’s entry').toBe(8)
    expect(dayPendingItems(WED)[0]!.mates, 'the other three ride on the first').toHaveLength(3)
    expect(groupPut(keyOf('bane'), 'ignite')).toBe('done')
    expect(waiting(), 'the re-time, and the man added').toBe(2)
  })

  it('TAKEN OFF THE PROGRAMME whole: one. DELETED whole: one. A CX on the one row: one', async () => {
    await boot(); fileGroup(FOUR); publish(WED)
    takeOffWhole()
    expect(recs().map(r => r.acc)).toEqual(['r', 'r', 'r', 'r'])
    expect(waiting(), 'taken off whole').toBe(1)
    globalUndo()
    expect(waiting()).toBe(0)
    cx()
    expect(waiting(), 'a CX on the one row').toBe(1)
    globalUndo()
    expect(waiting()).toBe(0)
    deleteWhole()
    expect(waiting(), 'deleted whole').toBe(1)
  })

  it('ALL FOUR taken off one by one — the last in its own window: the input is gone, and that is ONE change (D98: the count is the difference from what was issued)', async () => {
    await boot(); fileGroup(FOUR); publish(WED)
    for (const p of ['pike', 'split', 'rocky']) expect(groupTake(keyOf(p))).toBe('done')
    expect(waiting(), 'three taken off, one by one, the input going on: three').toBe(3)
    expect(removeInput(rec('bane'))).toBe(true)
    expect(waiting(), 'the whole input gone').toBe(1)
  })

  it('a SHARED LEAVE filed for four on the Unavailable list is one change waiting too (reading R6) — the list itself still a row a man', async () => {
    await boot(); publish(WED)
    expect(commitGroup(null, draftOf({ person: 'bane', type: 'OD', date: 'Jul 15', yr: 2026, allday: true, remarks: 'Exercise X' }), ['bane', 'split', 'rocky', 'ignite'])).toBe(true)
    expect(waiting()).toBe(1)
    expect(dayPendingItems(WED)[0]!.people).toHaveLength(4)
  })

  it('an ORDINARY request with ALL AVAIL in its name box, made a group of two: ONE — the man added; its own man going back to its name box rides with him', async () => {
    await boot()
    fileOne('bane')
    const solo = rec('bane')
    schedWrite(SCHED_TYPES.mutate, () => { ground().find((g: any) => g.src === String(inpId(solo))).who = 'allavail'; afterSchedMutate() })
    publish(WED)
    expect(waiting()).toBe(0)
    expect(commitGroup({ rows: [solo] }, DRAFT(), ['bane', 'pike'])).toBe(true)
    const row = ground().find((g: any) => g.src === String(inpId(rec('bane'))))
    expect([row.who, row.more], 'its own man in the name box, the puck among its extras').toEqual(['bane', ['allavail']])
    expect(waiting(), 'one man added — and nothing more').toBe(1)
    /* …but a hand that then takes the puck off that row is its own change, never swallowed */
    writeSlot(`${keyOf('bane')}.x0`, '')
    expect(waiting()).toBe(2)
  })

  it('THE CONTROL — two one-man requests that merely look alike are two changes, as ever', async () => {
    await boot(); publish(WED)
    fileOne('bane'); fileOne('pike')
    expect(waiting()).toBe(2)
  })
})

describe('"Discard N edits" shares the fold, not the number', () => {
  it('a re-time made on the schedule: ONE waiting, NONE discarded (a load re-makes the row from the request); a whole take-off: one and one', async () => {
    await boot(); fileGroup(FOUR); publish(WED)
    retime()
    expect([waiting(), dayDiscardCount(WED)]).toEqual([1, 0])
    globalUndo()
    takeOffWhole()
    expect([waiting(), dayDiscardCount(WED)]).toEqual([1, 1])
    globalUndo()
    deleteWhole()
    expect([waiting(), dayDiscardCount(WED)], 'deleted whole: the load puts the version’s rows back — one edit').toEqual([1, 1])
    globalUndo()
    cx()
    expect([waiting(), dayDiscardCount(WED)]).toEqual([1, 1])
  })
})

describe('what goes out is not touched — only the unit a person counts in', () => {
  it('the published amendment’s own item count is the count the day head showed; its record still holds every entry', async () => {
    await boot(); fileGroup(FOUR); publish(WED)
    retime()
    expect(groupPut(keyOf('bane'), 'ignite')).toBe('done')
    const n = waiting(), delta = dayDelta(WED).length
    expect(n).toBe(2)
    sign(WED)
    commitPublishALDay(WED)
    const al: any = SCHED.als[SCHED.als.length - 1]
    expect(al && +al.di).toBe(WED)
    expect(alCount(al), 'the amendment reads the two changes').toBe(2)
    expect((al.diff || []).length, 'and stores the whole difference').toBe(delta)
    expect(waiting(), 'gone out').toBe(0)
  })
})

describe('the whole input moved from one published day to another, and an amendment taken back', () => {
  const THU = 3
  /* a shared input covering two days: its one row stands on the first; ✕ there, then Accept on the second day's line */
  const twoDays = () => expect(commitGroup(null, DRAFT(WED, { end: '2026-07-16' }), FOUR)).toBe(true)
  const acceptOn = (di: number) => { const b = document.createElement('button'); b.dataset.acc = 'g'; b.dataset.accd = String(di); b.dataset.acck = String(inpId(recs()[0])); document.body.appendChild(b); routeClick({ target: b, stopPropagation() {} } as any); b.remove() }
  it('ONE change waiting on each day — the rows gone from the first, the rows arrived on the second; Undo of both: nothing', async () => {
    await boot(); twoDays(); publish(WED); publish(THU)
    expect(ground(THU).filter((g: any) => g.srcg), 'its rows stand on the first day').toHaveLength(0)
    expect([waiting(WED), waiting(THU)]).toEqual([0, 0])
    takeOffWhole(WED)
    acceptOn(THU)
    expect(ground(THU).filter((g: any) => g.srcg), 'the one row is on the Thursday now').toHaveLength(4)
    expect(recs().map(r => r.acc)).toEqual(['g', 'g', 'g', 'g'])
    expect([waiting(WED), waiting(THU)], 'one on each').toEqual([1, 1])
    globalUndo(); globalUndo()
    expect([waiting(WED), waiting(THU)], 'back as published').toEqual([0, 0])
  })
  it('an amendment that went out with the one change, then UNPUBLISHED: the change is waiting again, as one (D101)', async () => {
    await boot(); fileGroup(FOUR); publish(WED)
    takeOffWhole()
    expect(waiting()).toBe(1)
    sign(WED); commitPublishALDay(WED)
    expect(waiting(), 'gone out as AL1').toBe(0)
    commitUnpublish(WED)
    expect(waiting(), 'AL1 withdrawn: its change is waiting again — one').toBe(1)
  })
})

describe('the line: one line, naming its people (D736, D663)', () => {
  it('"Range safety brief · 4 people", the names under it A to Z, then what changed — with no man’s name in front', async () => {
    await boot(); fileGroup(FOUR); publish(WED)
    retime()
    const html = pendListHTML(WED)
    expect(html).toContain('1 change<')
    expect(html).toContain(`${TITLE} · 4 people`)
    const names = FOUR.map(cs).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' })).join(', ')
    expect(html).toContain(`<span class="pl-names">${names}</span>`)
    expect(html).toContain('14:00–15:00')
    expect(html).toContain('14:30–15:00')
    expect(html, 'a tap goes to the one row').toMatch(/<button class="pl-item" data-plix="0"/)
    expect(html, 'never one man’s name in front of the input’s').not.toContain(`${cs('bane')} · ${TITLE}`)
  })
  it('ONE man taken off the row is his own line, naming him', async () => {
    await boot(); fileGroup(FOUR); publish(WED)
    expect(groupTake(keyOf('pike'))).toBe('done')
    const html = pendListHTML(WED)
    expect(html).toContain(`${cs('pike')} · ${TITLE}`)
    expect(html).toContain('taken out')
    expect(html).not.toContain('pl-names')
  })
})

describe('an ALL AVAIL that leaves with its man (D745)', () => {
  it('is ONE change waiting, its line naming both — on a day that earns nothing, where the crowd behind the puck goes too', async () => {
    await boot()
    oilOn([], ['ignite', 'taipan'])
    fileGroup(FOUR)
    writeFill(`${keyOf('pike')}.+`, 'allavail')
    publish(WED)
    expect(waiting()).toBe(0)
    const crowdKey = `i:${inpId(rec('pike'))}`
    expect((oilEvidence(WED).sent || {})[crowdKey], 'the puck on his place stands for two men, frozen with the day (D44)').toEqual(['ignite', 'taipan'])
    expect(groupTake(keyOf('pike'))).toBe('done')
    expect(dayDelta(WED).some((e: any) => String(e.addr).startsWith('oil:')), 'the record holds the crowd’s going as its own entry').toBe(true)
    expect(waiting(), 'the man and the puck that stood on his place: one act, one change').toBe(1)
    const html = pendListHTML(WED)
    expect(html).toContain(`${cs('pike')} · ${TITLE}`)
    expect(html).toContain('ALL AVAIL came off with him')
    expect(html, 'never the nameless line').not.toContain('A placeholder')
  })
  it('THE SAME for ✕ on a ONE-MAN request’s row that carries the puck: one change, as the act is one', async () => {
    await boot()
    oilOn([], ['ignite', 'taipan'])
    fileOne('bane')
    writeFill(`${keyOf('bane')}.+`, 'allavail')
    publish(WED)
    setBoardDay(WED); press({ grdel: `${WED}.${riOf('bane')}` })
    expect(rec('bane').acc).toBe('r')
    expect(dayDelta(WED).some((e: any) => String(e.addr).startsWith('oil:')), 'the record holds the crowd’s going').toBe(true)
    expect(waiting()).toBe(1)
    expect(pendListHTML(WED)).toContain('ALL AVAIL came off with him')
  })
})

describe('the man added to a row the issued day already had wears his mark on his puck (D93)', () => {
  const tag = (p: string) => !!SCHED.pending[ridKey(keyOf(p), DAYS)]
  it('added: the hollow tag is on HIS puck; the others wear none', async () => {
    await boot(); fileGroup(FOUR); publish(WED)
    expect(groupPut(keyOf('bane'), 'ignite')).toBe('done')
    expect(tag('ignite'), 'his puck is marked').toBe(true)
    expect(FOUR.map(tag), 'nobody else’s').toEqual([false, false, false, false])
  })
  it('re-time then add, and add then re-time: he keeps his tag either way', async () => {
    for (const first of ['retime', 'add'] as const) {
      resetWorld(); await boot(); fileGroup(FOUR); publish(WED)
      if (first === 'retime') { retime(); expect(groupPut(keyOf('bane'), 'ignite')).toBe('done') }
      else { expect(groupPut(keyOf('bane'), 'ignite')).toBe('done'); retime() }
      expect(tag('ignite'), first).toBe(true)
    }
  })
  it('THE CONTROL — a whole new one row filed since wears the mark a new row wears, once, on its name — no tag a puck', async () => {
    await boot(); publish(WED)
    fileGroup(FOUR)
    expect(FOUR.map(tag)).toEqual([false, false, false, false])
  })
})

describe('on a day that EARNS, the one row counts what a one-man request’s row counts for the same act — never more', () => {
  for (const [what, act] of [['re-timed', retime], ['taken off the programme', takeOffWhole], ['cancelled (CX)', cx], ['deleted', deleteWhole]] as const) {
    it(`${what}: the same number for one man and for four`, async () => {
      const run = async (ppl: string[]) => {
        resetWorld(); await boot()
        oilOn([SAT])
        if (ppl.length > 1) fileGroup(ppl, SAT); else fileOne(ppl[0]!, SAT)
        publish(SAT)
        expect(waiting(SAT), 'clean').toBe(0)
        act(SAT)
        return waiting(SAT)
      }
      const one = await run(['bane'])
      expect(one).toBeGreaterThan(0)
      expect(await run(FOUR), 'for four').toBe(one)
    })
  }
})
