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
   every count of that file is here. Its three ALL AVAIL cases — two of an ALL AVAIL leaving with a man (D745), one of
   a request with ALL AVAIL in its name box made a group — were left out at step 2 and are BACK since step 3 of the build
   (12 Oct 26), each as its ruling stands now: D755 sets D745 aside (nothing comes off with a man) and makes the
   placeholder one of the input's people, so it counts as a person does — ONE each, put in or taken out (D736) — and
   the men behind it ride on the input's change, never a second "what this day earns" line. They are the last block of
   this file, "ALL AVAIL / ALL as one of an input's people", with the counts the brief of that step asks for; each
   case there says which of four it is: (1) the rule survives; (2) a named ruling changed it; (3) old data; (4) its
   subject is gone.

   Driven through the app's own doors on a real saved store. */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { INPUTS, inpId, idsOf } from '../engine/inputs'
import { PEOPLE, ID_BY_CS, indexCallsigns } from '../engine/people'
import { DAYS } from '../engine/data'
import { CURWEEK } from '../engine/waves'
import { storeBackend, HOOKS } from '../engine/hooks'
import { stashClear } from '../engine/weekstash'
import { SCHED, signOf, dayShownPendCount, dayPendingItems, dayDiscardCount, dayDelta, alCount, itemCounts } from '../engine/publish'
import { ridKey, ensureRowIds } from '../engine/rowids'
import { oilEvidence } from '../engine/oilev'
import { inputItemKey } from '../engine/oil'
import { PLANPUCKS, DAYRMK } from './plan'
import { initStore, weekStashSnap, weekDirty, loadWeek } from './store'
import { commitSetDayApproved, commitPublishALDay, commitUnpublish } from './sched-commit'
import { setSession, setMe, DEFAULT_ME } from './auth'
import { hydrate, wirePersist } from './persist'
import { bootStorage } from '../storage/boot'
import { settingsAdapter } from '../storage/adapters'
import { MemoryBackend } from '../storage/memory'
import { SCHEMA_VERSION } from '../storage/reset'
import { globalUndo, globalRedo } from '../undo'
import { _resetTimeline } from '../undo/timeline'
import { installGlobalUndo } from './undo-wire'
import { _resetDisclosure } from './disclosure'
import { setPage, setBoardDay } from './view'
import * as view from './view'
import { commitNewInput, commitInput, draftOf, removeInput, setInpField } from '../ui/inputedit'
import { reqRowText } from '../ui/reqrow'
import { rowPut, rowTake, rowMove } from '../ui/reqdoor'
import { slotVal, setSlotVal } from '../engine/slots'
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

describe('the counts — on a day that earns no OIL (D736; the plan\'s T5) (GI16)', () => {
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
    /* (2) A NAMED RULING CHANGED THE RULE — D760 (built at step 4 of the one-rule build, 12 Oct 26): "a CX the scheduler
       puts on a row that came from an input cancels the INPUT itself". This line was `[1, 1]`: the CX was the ROW's
       own, so a load of the issued version put the un-cancelled row back — one edit discarded. The CX is the input's
       now, and "a load never changes an input" (the plan §4.8, Loads; D759 reading 3): the version's row is installed
       and the next pass re-makes it from the LIVE input, still cancelled. So it is ONE waiting and NONE discarded —
       the very answer a re-time made on the schedule gets in this case's first line, for the same reason. To take the
       CX back the scheduler un-cancels it (or Undo); "Discard" must not promise what a load cannot do. */
    cx()
    expect(rec().cx, 'the input is cancelled').toBe(true)
    expect([waiting(), dayDiscardCount(WED)]).toEqual([1, 0])
  })
  it('a person added since: ONE waiting, NONE discarded — a load never changes who is in an input (D759 reading 3)', async () => {
    await boot(); file(FOUR); publish(WED)
    add('ignite')
    expect([waiting(), dayDiscardCount(WED)]).toEqual([1, 0])
  })
})

describe('what goes out is the count the day head showed (GI17)', () => {
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

describe('the line: one line, naming its people (D736, D663) (GI18)', () => {
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

describe('a person added to a row the issued day already had wears his mark on his puck (D93) (GI20)', () => {
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

/* ==== ALL AVAIL / ALL AS ONE OF AN INPUT'S PEOPLE (step 3 of the one-rule build, 12 Oct 26; the plan §4.8, T16). His
   rulings: D736 — "one man taken off its row or added to it is ONE CHANGE EACH" — and a placeholder is one of the
   input's people (D755: "a named person or ALL AVAIL / ALL, whoever put them there"; D750: tied to no man), so it
   counts as a person does; D113 — a replacement of the only one is ONE; D114 — ✕ is one; D98 — back to what went out
   is nothing; D757 — "ALL AVAIL stays when anyone leaves"; D44 / D45 — who stands behind the puck is frozen with the
   day, and a change to it is acknowledged. The men behind a placeholder that arrives with, or leaves with, its
   input's change are THAT change — never a second line, "what this day earns", beside it; on a weekday too (the day
   freezes who was behind the puck whether it earns or not).
   On a weekday and on a Saturday that earns. `bane` is one of the men ALL AVAIL would stand for, on purpose: put in the
   input by name he LEAVES its crowd, taken out he JOINS it — the one act must still count one (Fable F6 (a) and its
   mirror). Every reader of the count agrees, by `waiting`. ==== */
describe('ALL AVAIL / ALL as one of an input\'s people — what a published day counts (D736, D755; the plan §4.8)', () => {
  const A = 'allavail'
  const CROWD = ['bane', 'stiff', 'plasma']
  /* the seed Saturday carries flying, duty and sim work of its own, which would earn by itself: stripped BEFORE the
     store boots, so the saved week is the stripped one */
  const world = async (di: number) => {
    Object.assign(DAYS[SAT] as any, { waves: [], dutywaves: [], sims: {}, ground: [], allhands: [], oild: undefined })
    ensureRowIds(DAYS)
    oilOn([SAT], CROWD)
    await boot(); setBoardDay(di)
  }
  /* a 14:00–15:00 duty is a half day by its hours: Yes is that amount */
  const fileP = (ppl: string[], di: number, over: any = {}) => expect(commitInput(null, DRAFT(di, over), ppl, di === SAT ? { oil: { [ISO[SAT]!]: 0.5 } } : undefined), 'filed').toBe(true)
  const people = (di: number) => idsOf(rec(di)).map(String)
  const behind = (di: number) => ((oilEvidence(di) as any).sent || {})[inputItemKey(String(inpId(rec(di))))]
  const acceptOn = (di: number) => { const b = document.createElement('button'); b.dataset.acc = 'g'; b.dataset.accd = String(di); b.dataset.acck = String(inpId(rec(di))); document.body.appendChild(b); routeClick({ target: b, stopPropagation() {} } as any); b.remove() }
  const undo = () => expect(globalUndo(), 'Undo').toBeTruthy()
  const redo = () => expect(globalRedo(), 'Redo').toBeTruthy()

  for (const di of [WED, SAT]) {
    const day = di === SAT ? 'a Saturday that earns' : 'a weekday'

    it(`${day}: ALL AVAIL added to an input — 1, not "and what this day earns" beside it; Undo — 0; Redo — 1; taken off again by hand — 0 (D98)`, async () => {
      await world(di); fileP(['pike', 'split'], di); publish(di)
      expect(waiting(di)).toBe(0)
      add(A, di)
      expect(waiting(di)).toBe(1)
      expect(behind(di), 'the men behind it came with it').toEqual(CROWD)
      undo()
      expect([waiting(di), people(di)]).toEqual([0, ['pike', 'split']])
      redo()
      expect([waiting(di), people(di)]).toEqual([1, ['pike', 'split', A]])
      take(A, di)
      expect(waiting(di), 'back to what was published').toBe(0)
    })

    it(`${day}: ALL AVAIL taken off an input that went out with it — 1; Undo — 0`, async () => {
      await world(di); fileP(['pike', A], di); publish(di)
      expect(waiting(di)).toBe(0)
      take(A, di)
      expect(waiting(di)).toBe(1)
      undo()
      expect(waiting(di)).toBe(0)
    })

    it(`${day}: ALL AVAIL added and a man added — 2; each Undo takes one back`, async () => {
      await world(di); fileP(['pike'], di); publish(di)
      add(A, di); add('split', di)
      expect(waiting(di)).toBe(2)
      undo()
      expect(waiting(di)).toBe(1)
      undo()
      expect(waiting(di)).toBe(0)
    })

    it(`${day}: a man added to an input that carries ALL AVAIL — he leaves its crowd — 1 (Fable F6 (a)); Undo — 0`, async () => {
      await world(di); fileP(['pike', A], di); publish(di)
      expect(behind(di)).toEqual(CROWD)
      add('bane', di)
      expect(behind(di), 'named now, so no longer one of the men behind it').toEqual(['stiff', 'plasma'])
      expect(waiting(di)).toBe(1)
      undo()
      expect(waiting(di)).toBe(0)
    })

    /* (2) grouprow-count: "an ALL AVAIL that leaves with its man (D745) is ONE change waiting, its line naming both
       ('ALL AVAIL came off with him')". D755 sets D745 aside and D757 says it STAYS: the man's leaving is still ONE —
       and he JOINS the men behind the puck he stood beside (D757 step 4: "Ranger is free now, so the count rises by
       one"), which is his own change and no second line. His line names him and says nothing of ALL AVAIL. */
    it(`${day}: the only NAMED man taken off, leaving ALL AVAIL — it stays, he joins its crowd — 1, his own line; Undo — 0 (D757; D745 set aside by D755)`, async () => {
      await world(di); fileP(['bane', A], di); publish(di)
      expect(behind(di), 'named: not one of the men behind it').toEqual(['stiff', 'plasma'])
      take('bane', di)
      expect(people(di), 'ALL AVAIL stays').toEqual([A])
      expect(behind(di), 'free now: one of the men behind it').toEqual(CROWD)
      expect(waiting(di), 'the man taken out: one act, one change').toBe(1)
      const html = pendListHTML(di)
      expect(html).toContain(`${cs('bane')} · ${TITLE}`)
      expect(html).toContain('taken out')
      expect(html).not.toMatch(/came off/i)
      expect(html, 'never the nameless line').not.toContain('A placeholder')
      undo()
      expect([waiting(di), people(di)]).toEqual([0, ['bane', A]])
    })

    /* D113 — "a replacement in one seat is one pending change"; the plan §4.8 — "a swap of the only person (one out,
       one in, nobody else) is ONE". No hand on the SCHEDULE swaps a man for a placeholder (dropped on him it joins —
       it never replaces); the input's own window does, in one save: its person un-picked and ALL AVAIL picked. */
    it(`${day}: the only person and ALL AVAIL swapped in ONE save of the input's window — 1, either way round (D113); Undo — 0`, async () => {
      for (const [was, now] of [[['bane'], [A]], [[A], ['bane']]] as const) {
        resetWorld(); await world(di); fileP(was.slice(), di); publish(di)
        expect(waiting(di)).toBe(0)
        expect(commitInput(rec(di), draftOf(rec(di)), now.slice()), 'the one save').toBe(true)
        expect(people(di)).toEqual(now)
        expect(waiting(di), `${was} → ${now}`).toBe(1)
        undo()
        expect([waiting(di), people(di)], `${was} → ${now}: Undo`).toEqual([0, was])
      }
    })

    /* (A CX on such a row is NOT counted here, on purpose. The CX is still the ROW's mark — making it the input's own
       is D760, step 4 of the build — so there is no change of the input for the men behind ALL AVAIL to ride on, and
       the day reads the CX and "who it stands for" apart, as it does on a row of the scheduler's own that holds ALL
       AVAIL. The plan's §4.8 says a cancelled input is ONE; that count is step 4's to pin, with the CX on the input.) */
    it(`${day}: an input holding ALL AVAIL re-timed — 1; ✕ off the programme — 1, and put back — 0 (D114, D98); deleted — 1; Undo of each — 0`, async () => {
      await world(di); fileP(['pike', A], di); publish(di)
      retime(di)
      expect(waiting(di), 're-timed').toBe(1)
      undo()
      expect(waiting(di)).toBe(0)
      takeOffWhole(di)
      expect(rec(di).acc).toBe('r')
      expect(people(di), 'its people stay IN the input').toEqual(['pike', A])
      expect(waiting(di), '✕: the input and the men behind its ALL AVAIL go as one').toBe(1)
      acceptOn(di)
      expect(rec(di).acc).toBe('g')
      expect(waiting(di), 'accepted again: back to what was published').toBe(0)
      takeOffWhole(di)
      expect(waiting(di)).toBe(1)
      undo()
      expect(waiting(di), 'Undo of the ✕').toBe(0)
      deleteWhole(di)
      expect(waiting(di), 'deleted whole').toBe(1)
      undo()
      expect(waiting(di)).toBe(0)
    })

    it(`${day}: filed after the day went out — for ALL AVAIL alone, and for a man and ALL AVAIL — 1 each (D736: "one line, naming its people")`, async () => {
      for (const ppl of [[A], ['pike', A]]) {
        resetWorld(); await world(di); publish(di)
        expect(waiting(di)).toBe(0)
        fileP(ppl, di)
        expect(waiting(di), ppl.join('+')).toBe(1)
        undo()
        expect(waiting(di), `${ppl.join('+')}: Undo`).toBe(0)
      }
    })

    /* (2) grouprow-count: "an ORDINARY request with ALL AVAIL in its name box, made a group of two: ONE — the man
       added … but a hand that then takes the puck off that row is its own change, never swallowed". Then the puck was
       the row's own (D46) and stood in the name box in its man's place; D755: it is one of the input's people, beside
       him. What the case pinned survives: a man added is ONE, and the puck taken off afterwards is its OWN change. */
    it(`${day}: a one-person input that went out with ALL AVAIL beside its man: a man added — 1; ALL AVAIL then taken off — 2, never swallowed`, async () => {
      await world(di); fileP(['pike'], di); add(A, di); publish(di)
      expect(waiting(di)).toBe(0)
      add('split', di)
      expect(waiting(di), 'one man added — and nothing more').toBe(1)
      take(A, di)
      expect(waiting(di), 'the puck taken off is its own change').toBe(2)
    })
  }

  /* (2) grouprow-count: "THE SAME for ✕ on a ONE-MAN request's row that carries the puck: one change, as the act is
     one" (D745), "on a day that earns nothing, where the crowd behind the puck goes too". The COUNT survives, on
     D755's footing: the input is taken off the programme with everyone in it, ALL AVAIL among them, and the men
     behind it go with the input — one act, one change. The day's frozen record still holds the crowd's going as its
     own entry — it is what goes out — though the count reads one. */
  it('✕ on the row of an input that holds a man and ALL AVAIL, on a weekday: ONE change, one line for the input, naming its people — and the record still holds the crowd\'s going', async () => {
    await world(WED); fileP(['pike', A], WED); publish(WED)
    expect(behind(WED), 'frozen with the day, though it earns nothing (D44)').toEqual(CROWD)
    takeOffWhole(WED)
    expect(dayDelta(WED).some((e: any) => String(e.addr).startsWith('oil:')), 'the record holds the crowd\'s going').toBe(true)
    expect(waiting(WED)).toBe(1)
    const html = pendListHTML(WED)
    expect(html).toContain('1 change<')
    expect(html).toContain(`${TITLE} · 2 people`)
    expect(html, 'never the nameless line').not.toContain('A placeholder')
    expect(html, 'no second line for the men behind it').not.toContain('who it stands for')
  })
  /* …AND ITS WORDS. That old case also pinned the line's tail, "ALL AVAIL came off with him" — D745's sentence, for a
     puck that rode one man's place and came off with HIM. A NAMED RULING CHANGED THE RULE (2): D755 sets D745 aside
     ("nothing comes off with a man") and D750 ties the puck to no man; it is one of the input's own people, and the
     line already names it among them ("Range safety brief · 2 people — ALL AVAIL, Nomad"). So the line says the input
     was taken off, and says the same whichever of the two joined first.
     ** A PRODUCT FAULT, REPORTED AND LEFT FAILING (12 Oct 26): the To go out line still ends "· ALL AVAIL came off with
     him" where the placeholder joined AFTER a person (ui/pendlist.ts `wentWith` reads the row's places under the name
     box), and not where it joined first — one input, two sentences, and a "him" the input no longer has. ** */
  it('…and that line says the input was taken off — never "ALL AVAIL came off with him" (D745, set aside by D755), and the same whichever of them joined first', async () => {
    const line = async (ppl: string[]) => {
      resetWorld(); await world(WED); fileP(ppl, WED); publish(WED)
      takeOffWhole(WED)
      expect(waiting(WED)).toBe(1)
      const d = document.createElement('div'); d.innerHTML = pendListHTML(WED)
      return (d.querySelector('.pl-chg') as HTMLElement).textContent
    }
    const manFirst = await line(['pike', A]), puckFirst = await line([A, 'pike'])
    expect(manFirst).not.toMatch(/came off/i)
    expect(puckFirst).not.toMatch(/came off/i)
    expect(manFirst, 'one input, one sentence').toBe(puckFirst)
  })

  /* THE SAME SENTENCE'S SECOND HOME — the men behind the puck listed on a line of their own. That happens when they
     cannot ride on the input's change: here another puck's crowd (a row of the scheduler's own) changed by itself in
     the same breath, so the day reads TWO — the input taken off, and "who they stand for" — which is right (D44, D45).
     Under that second line the input's row is named for the men who went with it.
     ** THE SAME PRODUCT FAULT, REPORTED AND LEFT FAILING (12 Oct 26): it is worded "RANGE SAFETY BRIEF · the puck on
     <whoever joined first> place … came off with <him>" (ui/pendlist.ts crowdChange — D745's words). For an input
     filed for ALL AVAIL alone, or one ALL AVAIL joined first, that reads "the puck on ALL AVAIL place … came off with
     ALL AVAIL". D750: the puck is tied to no man; D755: nothing comes off with a man. ** */
  it('…nor, where the men behind it are listed on their own line, "the puck on <someone> place … came off with <him>" — for an input of a man and ALL AVAIL, and for one filed for ALL AVAIL alone', async () => {
    for (const ppl of [['pike', A], [A, 'pike'], [A]]) {
      resetWorld(); await world(WED); fileP(ppl, WED)
      ground(WED).push({ prog: 'SQN PT', str: '07:00', end: '08:00', who: A, rmks: '' }); view.afterSchedMutate()
      publish(WED)
      expect(waiting(WED)).toBe(0)
      takeOffWhole(WED)
      CROWD.splice(CROWD.indexOf('plasma'), 1)                // …and a man drops out of every crowd, for a reason that is no input
      try {
        view.afterSchedMutate()
        expect(waiting(WED), `${ppl.join('+')}: the input taken off, and who the other puck stands for`).toBe(2)
        const d = document.createElement('div'); d.innerHTML = pendListHTML(WED)
        const said = d.textContent || ''
        expect(said, ppl.join('+')).toContain('SQN PT · who it stands for')
        expect(said, ppl.join('+')).not.toMatch(/came off with/i)
        expect(said, ppl.join('+')).not.toMatch(/the puck on .* place/i)
      } finally { CROWD.push('plasma') }
    }
  })

  /* FROM ONE INPUT'S ROW TO ANOTHER'S (the plan §4.4: "he MOVES: leaves the first, joins the second, ONE command"). The
     unit is D736's — taken out of one input, added to the other — and whatever that comes to, a placeholder counts
     what a person counts for the same drag, and Undo takes all of it back. (The NUMBER is pinned in
     ui/phmember.test.tsx: ONE. D109 governs — "a man (or a placeholder puck) taken off one place and put on another
     place of the SAME day pairs into one move"; he asked on 12 Oct 26 whether two was consistent with the rest of the
     app, and it was not. D736's "one each" is a person put into or taken out of ONE input.) */
  it('ALL AVAIL dragged from one input\'s row to another\'s counts what a person counts for the same drag — on a weekday and on a Saturday that earns; Undo — 0', async () => {
    for (const di of [WED, SAT]) {
      const moved = async (who: string) => {
        resetWorld(); await world(di)
        fileP(['pike', who], di)
        expect(commitInput(null, DRAFT(di, { title: 'Second brief' }), ['rocky'], di === SAT ? { oil: { [ISO[SAT]!]: 0.5 } } : undefined)).toBe(true)
        publish(di)
        expect(waiting(di)).toBe(0)
        const r2 = INPUTS.find((x: any) => x.title === 'Second brief') as any
        const ri2 = ground(di).findIndex((g: any) => g && g.src === String(inpId(r2)))
        expect(rowMove(keyOf(who, di), `g:${di}.${ri2}.+`), `${who} moved`).toBe('done')
        const n = waiting(di)
        undo()
        expect(waiting(di), `${who}: ONE Undo takes the whole move back`).toBe(0)
        return n
      }
      const person = await moved('split')
      expect(person).toBeGreaterThan(0)
      expect(await moved(A), di === SAT ? 'a Saturday that earns' : 'a weekday').toBe(person)
    }
  })

  for (const di of [WED, SAT]) {
    const day = di === SAT ? 'a Saturday that earns' : 'a weekday'
    it(`${day}: a man put on the row of an input that holds ALL AVAIL alone — 1; a man dropped ON A PUCK beside ALL AVAIL joins — 1; a second placeholder refused — nothing more waiting`, async () => {
      await world(di); fileP([A], di); publish(di)
      add('bane', di)
      expect(waiting(di), 'he is named now, and leaves the men behind it: one').toBe(1)
      resetWorld(); await world(di); fileP(['pike', A], di); publish(di)
      expect(rowPut(keyOf('pike', di), 'bane'), 'on a man\'s puck: nobody is replaced').toBe('done')
      expect(people(di)).toEqual(['pike', A, 'bane'])
      expect(waiting(di)).toBe(1)
      expect(rowPut(`${rowKey(di)}.+`, 'all'), 'ALL beside ALL AVAIL (D753)').toBe('refused')
      expect(waiting(di), 'a refusal is nothing waiting').toBe(1)
    })
    /* D101 — after an Unpublish the withdrawn amendment's changes stay on the working copy as pending */
    it(`${day}: an amendment that went out with ALL AVAIL added, then UNPUBLISHED: it is waiting again — one (D101)`, async () => {
      await world(di); fileP(['pike', 'split'], di); publish(di)
      add(A, di)
      expect(waiting(di)).toBe(1)
      sign(di); commitPublishALDay(di)
      expect(waiting(di), 'gone out as AL1').toBe(0)
      commitUnpublish(di)
      expect(waiting(di), 'AL1 withdrawn').toBe(1)
      expect(pendListHTML(di)).toContain(`ALL AVAIL · ${TITLE}`)
    })
  }

  it('the line: ALL AVAIL put in or taken out is its own line, led by its name and the input\'s — "added", "taken out"', async () => {
    await world(WED); fileP(['pike', 'split'], WED); publish(WED)
    add(A, WED)
    let html = pendListHTML(WED)
    expect(html).toContain('1 change<')
    expect(html).toContain(`ALL AVAIL · ${TITLE}`)
    expect(html).toContain('added')
    expect(html, 'no second line for the men behind it').not.toContain('who it stands for')
    expect(html, 'a tap goes to its puck').toMatch(/<button class="pl-item" data-plix="0"/)
    sign(WED); commitPublishALDay(WED)
    expect(waiting(WED), 'gone out').toBe(0)
    take(A, WED)
    html = pendListHTML(WED)
    expect(html).toContain('1 change<')
    expect(html).toContain(`ALL AVAIL · ${TITLE}`)
    expect(html).toContain('taken out')
    expect(html).not.toContain('who it stands for')
  })

  /* A MAN GIVEN HIS OWN PART OF A SHARED ABSENCE ON A PUBLISHED DAY IS NOT "TAKEN OUT" (Fable's read of the finished code,
     finding 3 — 12 Oct 26; the plan §4.6, R5, F6 (c)). A time typed on ONE man's row of the Unavailable list gives him an
     input of his own (engine/inputown.ts ownInputOf). The count was right — one change — but the line read "Rocky · OD —
     taken out": he is still away, at another time. The words name what it is. */
  it('the line for a man given his own part of a shared absence says so — never "taken out" — and it is ONE change', async () => {
    await world(WED)
    expect(commitInput(null, { ...DRAFT(WED), type: 'OD', title: '', allday: true, sTime: '', eTime: '' }, ['rocky', 'split'])).toBe(true)
    const od = () => INPUTS.filter((x: any) => x.type === 'OD' && x.date === dOf(WED) && idsOf(x).includes('rocky')) as any[]
    expect(od()).toHaveLength(1)
    publish(WED)
    expect(waiting(WED)).toBe(0)
    expect(setInpField(od()[0], 'str', '10:00', 'rocky')).toBe(true)
    expect(od().map(x => idsOf(x)), 'his own input now').toEqual([['rocky']])
    expect(waiting(WED), 'one change waiting').toBe(1)
    const html = pendListHTML(WED)
    expect(html).toContain('1 change<')
    expect(html).toContain(cs('rocky'))
    expect(html, 'said as what it is').toContain('his own now')
    expect(html).toContain('10:00')
    expect(html, 'he was not taken out of the day').not.toContain('taken out')
  })

  it('what goes out is the count the day head showed: re-timed, ALL AVAIL added and a man added — 3, on a Saturday that earns', async () => {
    await world(SAT); fileP(['pike'], SAT); publish(SAT)
    retime(SAT); add(A, SAT); add('split', SAT)
    const n = waiting(SAT), delta = dayDelta(SAT).length
    expect(n).toBe(3)
    sign(SAT)
    commitPublishALDay(SAT)
    const al: any = SCHED.als[SCHED.als.length - 1]
    expect(al && +al.di).toBe(SAT)
    expect(alCount(al), 'the amendment reads the three changes').toBe(3)
    expect((al.diff || []).length, 'and stores the whole difference').toBe(delta)
    expect(waiting(SAT), 'gone out').toBe(0)
  })

  it('"Discard N edits": ALL AVAIL added since — ONE waiting, NONE discarded: a load never changes who is in an input (D759 reading 3)', async () => {
    await world(WED); fileP(['pike', 'split'], WED); publish(WED)
    add(A, WED)
    expect([waiting(WED), dayDiscardCount(WED)]).toEqual([1, 0])
  })

  /* D93 — the hollow tag is on the puck that changed: the placeholder's, as a person's (GI20) */
  it('added on a published day it wears the mark on ITS puck; the people beside it wear none', async () => {
    await world(WED); fileP(['pike', 'split'], WED); publish(WED)
    add(A, WED)
    const tag = (p: string) => !!SCHED.pending[ridKey(keyOf(p, WED), DAYS)]
    expect([tag(A), tag('pike'), tag('split')]).toEqual([true, false, false])
  })

  /* THE CONTROL (D44, D45): who stands behind the puck changing BY ITSELF — nobody's input moved — is still its own
     change to acknowledge. Folding the crowd into an input's change must never swallow that. */
  it('THE CONTROL: a man behind the puck who drops out for a reason that is no input is still its own change, beside a man added', async () => {
    await world(WED); fileP(['pike', A], WED); publish(WED)
    add('split', WED)
    expect(waiting(WED)).toBe(1)
    CROWD.splice(CROWD.indexOf('plasma'), 1)
    try {
      view.afterSchedMutate()
      expect(waiting(WED), 'the man added, and who the puck stands for').toBe(2)
    } finally { CROWD.push('plasma') }
  })
})

/* THE OPUS TRIAL READ'S THREE CLAIMS ABOUT THE COUNT, EACH DRIVEN THROUGH THE REAL DOORS (the one-rule job's check,
   12 Oct 26 — docs/superpowers/briefs/2026-10-12-reads/one-rule-code-opus-trial.md, claims 6, 7, 8; the evidence sheet
   §10b says which were red). Written to the RIGHT behaviour before any fix. */
describe('the trial read\'s claims about what a published day counts', () => {
  it('claim 6 — the FIRST to have joined is taken out and put back: the day is back to what was published — 0 waiting (D98; D755: two routes to the same people give the same row)', async () => {
    await boot(); file(['bane', 'pike', 'split']); publish(WED)
    expect(waiting()).toBe(0)
    take('bane')
    expect(waiting()).toBe(1)
    add('bane')
    expect(idsOf(rec()).slice().sort()).toEqual(['bane', 'pike', 'split'])
    expect(dayPendingItems(WED).map((x: any) => pendListHTML(WED)).slice(0, 1).join(''), 'what would go out').not.toMatch(/order/i)
    expect(waiting(), 'the same three people as went out').toBe(0)
  })

  it('claim 7 — a swap from a FLYING SEAT: the input\'s change is one, and the jet\'s crew change is its own line — 2 (D113 is one seat; D109 one man moved)', async () => {
    await boot(); fileOne('bane'); publish(WED)
    const seat = `${WED}.0.0.0.p`
    const flyer = String(slotVal(seat) || '')
    expect(flyer, 'a man sits in the first jet on Wednesday').not.toBe('')
    expect(flyer).not.toBe('bane')
    expect(rowPut(rowKey(), flyer, (was: string) => setSlotVal(seat, was))).toBe('done')
    expect(idsOf(rec())).toEqual([flyer])
    expect(String(slotVal(seat)), 'Ranger sits in the jet now').toBe('bane')
    const lines = pendListHTML(WED)
    expect(lines, 'the list names the jet\'s change').toMatch(new RegExp(cs('bane')))
    expect(waiting(), 'the input, and the jet').toBe(2)
  })

  it('claim 8 — a man taken out of a shared leave, then a NEW leave filed for him with other hours: two changes, and the new leave has its line', async () => {
    await boot()
    expect(commitInput(null, draftOf({ person: 'bane', type: 'LL', date: 'Jul 15', yr: 2026, allday: true, remarks: '' }), ['bane', 'split', 'rocky'])).toBe(true)
    publish(WED)
    expect(waiting()).toBe(0)
    const shared = INPUTS.find((x: any) => x.type === 'LL' && x.date === 'Jul 15' && idsOf(x).length === 3) as any
    expect(commitInput(shared, draftOf(shared), ['bane', 'split'])).toBe(true)
    expect(waiting(), 'Hex taken out').toBe(1)
    vi.setSystemTime(new Date(2026, 6, 13, 11, 0, 0))
    expect(commitInput(null, draftOf({ person: 'rocky', type: 'LL', date: 'Jul 15', yr: 2026, allday: false, s: 480, e: 720, remarks: 'morning only' }), ['rocky'])).toBe(true)
    expect(waiting(), 'taken out, and a new leave of his own filed').toBe(2)
    expect(pendListHTML(WED), 'the new leave has a line of its own').toContain('<b>filed</b>')
  })
})

/* FABLE'S THIRD READ, FINDING 1 (12 Oct 26) — the eighth fix above ("only a real piece pairs": the frozen copy's `by` and
   `at`) and the list's words (ui/pendlist.ts: the LIVE record's `by`) asked "is this a piece?" of two different
   filers. Once "who filed it" has passed on — a scheduler took the filer out (D759 reading 7) — a man then given his
   own part carries the LIVE filer, so the count called his piece a filing of its own while the words called it "his
   own now": three lines where there are two changes, two of them about the same act. */
describe('a man given his own part AFTER "who filed it" has passed on is still ONE change (Fable\'s third read, finding 1)', () => {
  const asMember = (pid: string) => { setSession({ user: 'us', role: 'main', name: 'us' }); setMe(pid) }
  const asAdmin = () => { setSession({ user: 'ad', role: 'admin', name: 'ad' }); setMe('stiff') }
  it('a member files an OD for three; published; the admin takes the FILER out, then types a time on another man\'s row: 2 waiting — "taken out", and "his own now" — never "filed"', async () => {
    await boot()
    asMember('bane')
    expect(commitInput(null, { ...DRAFT(WED), type: 'OD', title: '', allday: true, sTime: '', eTime: '' }, ['bane', 'rocky', 'split'])).toBe(true)
    asAdmin()
    /* (the demo holds an OD of its own that day: this one is the OD Split is in; Hex's own, once he has one, apart) */
    const all = () => INPUTS.filter((x: any) => x.type === 'OD' && x.date === dOf(WED) && (idsOf(x).includes('split') || idsOf(x).includes('rocky'))) as any[]
    const od = () => all().filter(x => idsOf(x).includes('split'))
    expect(od()).toHaveLength(1)
    expect(od()[0].by, 'filed by the member').toBe('bane')
    publish(WED)
    expect(waiting(WED)).toBe(0)
    vi.setSystemTime(new Date(2026, 6, 13, 11, 0, 0))
    expect(commitInput(od()[0], draftOf(od()[0]), ['rocky', 'split'])).toBe(true)
    expect(od()[0].by, 'who filed it passed to the admin who took him out (D759 reading 7)').toBe('stiff')
    expect(waiting(WED), 'the filer taken out').toBe(1)
    expect(setInpField(od()[0], 'str', '10:00', 'rocky')).toBe(true)
    expect(all().map(x => idsOf(x)).sort(), 'the input for one, and his own').toEqual([['rocky'], ['split']])
    const html = pendListHTML(WED)
    expect(html, 'his own part is said as what it is').toContain('his own now')
    expect(html, 'and is not ALSO a filing of its own').not.toContain('<b>filed</b>')
    expect(waiting(WED), 'two changes: the filer taken out, and one man\'s own part').toBe(2)
  })
})

/* THE SECOND RE-WALK'S RX3-2 (12 Oct 26) — a leftover of claim 6's fix. A man taken off a published row and put back
   left the day reading nothing pending (right) but the input's list in a new order; the row was written in the issued
   order only while its people were EXACTLY the issued ones, so the moment a fourth man was added it fell back to the
   joined order — and the hollow "goes out as AL1" tag stood on all four pucks, where only the new man's is a change
   (D93, D736). The control beside it — the same add with nobody taken out and back — is the case above ("added: the
   hollow tag is on HIS puck"). */
describe('the tag is on the new man alone, whatever order the others left and came back in (the second re-walk, RX3-2)', () => {
  const tag = (p: string) => !!SCHED.pending[ridKey(keyOf(p), DAYS)]
  it('issued for three; the first to join taken out and put back; a fourth added: 1 waiting, the tag on HIS puck only', async () => {
    await boot(); file(['bane', 'pike', 'split']); publish(WED)
    take('bane'); add('bane')
    expect(waiting(), 'back to what was published').toBe(0)
    add('ignite')
    expect(waiting()).toBe(1)
    expect(tag('ignite'), 'the new man is marked').toBe(true)
    expect(['bane', 'pike', 'split'].map(p => tag(p)), 'the three who went out with the day wear none').toEqual([false, false, false])
    expect([ground()[riOf()].who, ...(ground()[riOf()].more || [])], 'the issued three in the places they went out in, the new man after them').toEqual(['bane', 'pike', 'split', 'ignite'])
    take('ignite')
    expect(waiting(), 'and taken off again: nothing').toBe(0)
  })
  it('the MIDDLE man taken out and put back, then one of the three taken out for good: 1 waiting — "taken out" — and nobody added reads as moved', async () => {
    await boot(); file(['bane', 'pike', 'split']); publish(WED)
    take('pike'); add('pike')
    expect(waiting()).toBe(0)
    take('split')
    expect(waiting()).toBe(1)
    expect([ground()[riOf()].who, ...(ground()[riOf()].more || [])], 'the two left stand in their issued order').toEqual(['bane', 'pike'])
    expect(pendListHTML(WED)).toContain('taken out')
  })
})
