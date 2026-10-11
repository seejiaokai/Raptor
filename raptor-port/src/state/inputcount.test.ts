// @vitest-environment jsdom
/* WHAT A PUBLISHED DAY COUNTS FOR AN INPUT ([ALL-AVAIL-AS-MEMBER] step 2 (e); the plan
   docs/superpowers/plans/2026-10-11-one-rule-plan.md §4.8 — its tests T5 and T16, Fable F6). His rulings:
   D736 — "on a published day a shared input filed, taken off the programme or re-timed is ONE change waiting — one line,
           naming its people — and one man taken off its row or added to it is ONE CHANGE EACH";
   D113 — "a replacement in one seat is one pending change"; D114 — taking an accepted request off is one, not two;
   D109, D98 (back to what was published is nothing waiting), D103 / D45 (what goes out and the sign-offs are not
   touched), D93 (a change waiting on a puck wears the hollow tag), D756 (one record with its people).

   An input is ONE record and ONE row now, so nothing is folded back to one: the unit a person counts in is worked out
   from the PEOPLE THEMSELVES — the issued copy's list against the live one (publish.ts dayPendingItemsIn, the people
   step) — and the row's own person units ride on it, never counted twice. Every count reads that one list: the day
   head, the Amendments box, the changes window, the sign-off line and the published amendment's own item count.

   It replaces state/grouprow-count.test.ts (the same rulings, on one record a man and one row a man folded to one):
   every count of that file is here; its two cases of an ALL AVAIL leaving with a man (D745) are gone with that rule —
   D755 sets it aside, and ALL AVAIL as one of an input's people is step 3 of the build.

   Driven through the app's own doors on a real saved store. */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { INPUTS, inpId, idsOf } from '../engine/inputs'
import { PEOPLE, ID_BY_CS, indexCallsigns } from '../engine/people'
import { DAYS } from '../engine/data'
import { CURWEEK } from '../engine/waves'
import { storeBackend, HOOKS } from '../engine/hooks'
import { stashClear } from '../engine/weekstash'
import { SCHED, signOf, dayShownPendCount, dayPendingItems, dayDiscardCount, dayDelta, alCount, itemCounts } from '../engine/publish'
import { ridKey } from '../engine/rowids'
import { PLANPUCKS, DAYRMK } from './plan'
import { initStore, weekStashSnap, weekDirty, loadWeek } from './store'
import { commitSetDayApproved, commitPublishALDay, commitUnpublish } from './sched-commit'
import { setSession, setMe, DEFAULT_ME } from './auth'
import { hydrate, wirePersist } from './persist'
import { bootStorage } from '../storage/boot'
import { settingsAdapter } from '../storage/adapters'
import { MemoryBackend } from '../storage/memory'
import { SCHEMA_VERSION } from '../storage/reset'
import { globalUndo } from '../undo'
import { _resetTimeline } from '../undo/timeline'
import { installGlobalUndo } from './undo-wire'
import { _resetDisclosure } from './disclosure'
import { setPage, setBoardDay } from './view'
import * as view from './view'
import { commitNewInput, commitInput, draftOf, removeInput } from '../ui/inputedit'
import { reqRowText } from '../ui/reqrow'
import { rowPut, rowTake } from '../ui/reqdoor'
import { boardMbtn, cxCommit } from '../ui/board'
import { routeClick } from '../ui/interactions'
import { pendListHTML } from '../ui/pendlist'

const ISNAP = JSON.stringify(INPUTS)
const PSNAP = JSON.stringify(PEOPLE)
const DSNAP = JSON.stringify(DAYS)
const W1 = '13/07/2026'
const WED = 2, THU = 3, SAT = 5
const sign = (di: number) => { const g = signOf(di); g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump' }
const toast = HOOKS.toast, earning = HOOKS.oilEarningDay, sentinel = HOOKS.oilSentinel, dayISO = HOOKS.oilDayISO
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
const rec = (di = WED) => { const l = recs(di); expect(l, 'ONE record').toHaveLength(1); return l[0] }
const ground = (di = WED) => ((DAYS[di] as any).ground || []) as any[]
const riOf = (di = WED, on = di) => ground(on).findIndex((g: any) => g && g.src === String(inpId(rec(di))))
const rowKey = (di = WED) => `g:${di}.${riOf(di)}`
const keyOf = (p: string, di = WED) => { const r = ground(di)[riOf(di)], k = rowKey(di); if (r.who === p) return k; const n = (r.more || []).indexOf(p); expect(n, `${p} is on the row`).toBeGreaterThanOrEqual(0); return `${k}.x${n}` }
const DRAFT = (di = WED, over: any = {}) => ({ ...draftOf({ person: 'bane', type: di === SAT ? 'Duty' : 'Meeting', title: TITLE, date: dOf(di), yr: 2026, allday: false, s: 840, e: 900, remarks: 'Bring your logbook' }), ...over })
const file = (ppl: string[], di = WED, over: any = {}) => expect(commitInput(null, DRAFT(di, over), ppl)).toBe(true)
const fileOne = (p: string, di = WED) => expect(commitNewInput(DRAFT(di, { person: p }))).toBe(true)
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
const take = (p: string, di = WED) => expect(rowTake(keyOf(p, di)), `${p} taken out`).toBe('done')
const add = (p: string, di = WED) => expect(rowPut(`${rowKey(di)}.+`, p), `${p} added`).toBe('done')
const retime = (di = WED) => expect(reqRowText(`gr:${di}.${riOf(di)}.str`, '1430')).toBe('saved')
const takeOffWhole = (di = WED) => { setBoardDay(di); press({ grdel: `${di}.${riOf(di)}` }) }
const cx = (di = WED) => { setBoardDay(di); press({ grcx: `${di}.${riOf(di)}` }); cxCommit(true, 'WX') }
const deleteWhole = (di = WED) => expect(removeInput(rec(di))).toBe(true)

beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(new Date(2026, 6, 13, 9, 0, 0)); resetWorld(); HOOKS.toast = () => {} })
afterEach(() => { HOOKS.toast = toast; HOOKS.oilEarningDay = earning; HOOKS.oilSentinel = sentinel; HOOKS.oilDayISO = dayISO; _resetTimeline(); vi.useRealTimers(); resetWorld(); setSession(null); setMe(DEFAULT_ME); storeBackend.impl = null })

describe('the counts — on a day that earns no OIL (D736; the plan\'s T5)', () => {
  it('FILED for four since the day went out: ONE change waiting — and still one after a person is taken out before it goes out', async () => {
    await boot(); publish(WED)
    file(FOUR)
    expect(waiting()).toBe(1)
    take('pike')
    expect(waiting(), 'three people now — still the one filing').toBe(1)
    expect(dayPendingItems(WED)[0]!.people!.slice().sort()).toEqual(['bane', 'rocky', 'split'])
  })

  it('issued for four — ONE person taken out is one; TWO are two; ONE ADDED is one; two added are two', async () => {
    await boot(); file(FOUR); publish(WED)
    expect(waiting()).toBe(0)
    take('pike')
    expect(waiting()).toBe(1)
    take('split')
    expect(waiting(), 'one person taken out is one each').toBe(2)
    globalUndo(); globalUndo()
    expect(waiting(), 'back to what was published').toBe(0)
    add('ignite')
    expect(waiting()).toBe(1)
    add('taipan')
    expect(waiting(), 'one person added is one each').toBe(2)
  })

  it('THE FIRST PERSON leaves — the next takes the name box: ONE, and nothing more', async () => {
    await boot(); file(['bane', 'pike', 'split']); publish(WED)
    take('bane')
    expect(ground()[riOf()].who, 'the next to have joined stands in the name box').toBe('pike')
    expect(waiting()).toBe(1)
  })

  it('THE SWAP of the only person — one out, one in, nobody else — is ONE (D113)', async () => {
    await boot(); fileOne('bane'); publish(WED)
    expect(rowPut(rowKey(), 'pike')).toBe('done')
    expect(idsOf(rec())).toEqual(['pike'])
    expect(waiting()).toBe(1)
    globalUndo()
    expect(waiting()).toBe(0)
  })

  it('RE-TIMED: one — and re-timed with one person added: two', async () => {
    await boot(); file(FOUR); publish(WED)
    retime()
    expect(waiting()).toBe(1)
    add('ignite')
    expect(waiting(), 'the re-time, and the person added').toBe(2)
  })

  it('TAKEN OFF THE PROGRAMME whole: one. DELETED whole: one. A CX on the row: one', async () => {
    await boot(); file(FOUR); publish(WED)
    takeOffWhole()
    expect(rec().acc).toBe('r')
    expect(waiting(), 'taken off whole').toBe(1)
    globalUndo()
    expect(waiting()).toBe(0)
    cx()
    expect(waiting(), 'a CX on the row').toBe(1)
    globalUndo()
    expect(waiting()).toBe(0)
    deleteWhole()
    expect(waiting(), 'deleted whole').toBe(1)
  })

  it('THREE of four taken out one by one: three — then the input deleted: the input is gone, and that is ONE (D98: the count is the difference from what was issued)', async () => {
    await boot(); file(FOUR); publish(WED)
    for (const p of ['pike', 'split', 'rocky']) take(p)
    expect(waiting(), 'three taken out, the input going on: three').toBe(3)
    deleteWhole()
    expect(waiting(), 'the whole input gone').toBe(1)
  })

  it('a LEAVE filed for four on the Unavailable list is one change waiting too', async () => {
    await boot(); publish(WED)
    expect(commitInput(null, draftOf({ person: 'bane', type: 'OD', date: 'Jul 15', yr: 2026, allday: true, remarks: 'Exercise X' }), ['bane', 'split', 'rocky', 'ignite'])).toBe(true)
    expect(waiting()).toBe(1)
    expect(dayPendingItems(WED)[0]!.people).toHaveLength(4)
  })

  it('A SEVERAL-DAY INPUT: a person added reads one on EVERY published day it covers, its row standing on the first alone', async () => {
    await boot(); file(['bane', 'pike'], WED, { end: '2026-07-16' }); publish(WED); publish(THU)
    expect(ground(THU).filter((g: any) => g.src === String(inpId(rec()))), 'its row stands on its first day').toHaveLength(0)
    expect([waiting(WED), waiting(THU)]).toEqual([0, 0])
    add('split')
    expect([waiting(WED), waiting(THU)], 'one there too').toEqual([1, 1])
  })

  it('THE CONTROL — two one-person requests that merely look alike are two changes, as ever', async () => {
    await boot(); publish(WED)
    fileOne('bane'); fileOne('pike')
    expect(waiting()).toBe(2)
  })
})

describe('"Discard N edits" counts what a load of the issued version would really put back', () => {
  it('a re-time made on the schedule: ONE waiting, NONE discarded (a load re-makes the row from the request); a whole take-off: one and one', async () => {
    await boot(); file(FOUR); publish(WED)
    retime()
    expect([waiting(), dayDiscardCount(WED)]).toEqual([1, 0])
    globalUndo()
    takeOffWhole()
    expect([waiting(), dayDiscardCount(WED)]).toEqual([1, 1])
    globalUndo()
    deleteWhole()
    expect([waiting(), dayDiscardCount(WED)], 'deleted whole: the load puts the version\'s row back — one edit').toEqual([1, 1])
    globalUndo()
    cx()
    expect([waiting(), dayDiscardCount(WED)]).toEqual([1, 1])
  })
  it('a person added since: ONE waiting, NONE discarded — a load never changes who is in an input (D759 reading 3)', async () => {
    await boot(); file(FOUR); publish(WED)
    add('ignite')
    expect([waiting(), dayDiscardCount(WED)]).toEqual([1, 0])
  })
})

describe('what goes out is the count the day head showed', () => {
  it('the published amendment\'s own item count; its record holds the whole difference', async () => {
    await boot(); file(FOUR); publish(WED)
    retime()
    add('ignite')
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
  const twoDays = () => file(FOUR, WED, { end: '2026-07-16' })
  const acceptOn = (di: number) => { const b = document.createElement('button'); b.dataset.acc = 'g'; b.dataset.accd = String(di); b.dataset.acck = String(inpId(rec())); document.body.appendChild(b); routeClick({ target: b, stopPropagation() {} } as any); b.remove() }
  it('ONE change waiting on each day — the row gone from the first, arrived on the second, its people with it; Undo of both: nothing', async () => {
    await boot(); twoDays(); publish(WED); publish(THU)
    expect([waiting(WED), waiting(THU)]).toEqual([0, 0])
    takeOffWhole(WED)
    acceptOn(THU)
    const row = ground(THU).find((g: any) => g.src === String(inpId(rec())))
    expect(row, 'the row is on the Thursday now').toBeTruthy()
    expect([row.who, ...(row.more || [])], 'everyone in it arrived with it').toEqual(FOUR)
    expect(rec().acc).toBe('g')
    expect([waiting(WED), waiting(THU)], 'one on each').toEqual([1, 1])
    globalUndo(); globalUndo()
    expect([waiting(WED), waiting(THU)], 'back as published').toEqual([0, 0])
  })
  it('an amendment that went out with the one change, then UNPUBLISHED: the change is waiting again, as one (D101)', async () => {
    await boot(); file(FOUR); publish(WED)
    takeOffWhole()
    expect(waiting()).toBe(1)
    sign(WED); commitPublishALDay(WED)
    expect(waiting(), 'gone out as AL1').toBe(0)
    commitUnpublish(WED)
    expect(waiting(), 'AL1 withdrawn: its change is waiting again — one').toBe(1)
  })
})

describe('the line: one line, naming its people (D736, D663)', () => {
  it('"Range safety brief · 4 people", the names under it A to Z, then what changed — with no person\'s name in front', async () => {
    await boot(); file(FOUR); publish(WED)
    retime()
    const html = pendListHTML(WED)
    expect(html).toContain('1 change<')
    expect(html).toContain(`${TITLE} · 4 people`)
    const names = FOUR.map(cs).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' })).join(', ')
    expect(html).toContain(`<span class="pl-names">${names}</span>`)
    expect(html).toContain('14:00–15:00')
    expect(html).toContain('14:30–15:00')
    expect(html, 'a tap goes to the row').toMatch(/<button class="pl-item" data-plix="0"/)
    expect(html, 'never one person\'s name in front of the input\'s').not.toContain(`${cs('bane')} · ${TITLE}`)
  })
  it('ONE person taken out is his own line, naming him; one added, his', async () => {
    await boot(); file(FOUR); publish(WED)
    take('pike')
    let html = pendListHTML(WED)
    expect(html).toContain(`${cs('pike')} · ${TITLE}`)
    expect(html).toContain('taken out')
    expect(html).not.toContain('pl-names')
    add('ignite')
    html = pendListHTML(WED)
    expect(html).toContain('2 changes<')
    expect(html).toContain(`${cs('ignite')} · ${TITLE}`)
    expect(html).toContain('added')
  })
  it('a swap of the only person says who for whom', async () => {
    await boot(); fileOne('bane'); publish(WED)
    expect(rowPut(rowKey(), 'pike')).toBe('done')
    const html = pendListHTML(WED)
    expect(html).toContain('1 change<')
    expect(html).toContain(cs('bane'))
    expect(html).toContain(cs('pike'))
  })
})

describe('a person added to a row the issued day already had wears his mark on his puck (D93)', () => {
  const tag = (p: string) => !!SCHED.pending[ridKey(keyOf(p), DAYS)]
  it('added: the hollow tag is on HIS puck; the others wear none', async () => {
    await boot(); file(FOUR); publish(WED)
    add('ignite')
    expect(tag('ignite'), 'his puck is marked').toBe(true)
    expect(FOUR.map(p => tag(p)), 'nobody else\'s').toEqual([false, false, false, false])
  })
  it('re-time then add, and add then re-time: he keeps his tag either way', async () => {
    for (const first of ['retime', 'add'] as const) {
      resetWorld(); await boot(); file(FOUR); publish(WED)
      if (first === 'retime') { retime(); add('ignite') } else { add('ignite'); retime() }
      expect(tag('ignite'), first).toBe(true)
    }
  })
  it('THE CONTROL — a whole new row filed since wears the mark a new row wears, once, on its name — no tag a puck', async () => {
    await boot(); publish(WED)
    file(FOUR)
    expect(FOUR.map(p => tag(p))).toEqual([false, false, false, false])
  })
})

describe('on a day that EARNS, an input of four counts what an input of one counts for the same act — never more (the plan\'s T16)', () => {
  for (const [what, act] of [['re-timed', retime], ['taken off the programme', takeOffWhole], ['cancelled (CX)', cx], ['deleted', deleteWhole]] as const) {
    it(`${what}: the same number for one person and for four`, async () => {
      const run = async (ppl: string[]) => {
        resetWorld(); await boot()
        oilOn([SAT])
        if (ppl.length > 1) file(ppl, SAT); else fileOne(ppl[0]!, SAT)
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
  it('a person added on a day that earns is ONE — what the day earns moves with him, not beside him', async () => {
    await boot(); oilOn([SAT])
    expect(commitInput(null, DRAFT(SAT), ['bane', 'pike'], { oil: { [ISO[SAT]!]: 0.5 } })).toBe(true)
    publish(SAT)
    expect(waiting(SAT)).toBe(0)
    add('split', SAT)
    expect(waiting(SAT)).toBe(1)
  })
  it('the swap of the only person on a day that earns is ONE', async () => {
    await boot(); oilOn([SAT])
    fileOne('bane', SAT)
    publish(SAT)
    expect(rowPut(rowKey(SAT), 'pike')).toBe('done')
    expect(waiting(SAT)).toBe(1)
  })
})
