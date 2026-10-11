// @vitest-environment jsdom
/* AN INPUT'S ONE ROW, KEPT AS THE INPUT CHANGES ([ALL-AVAIL-AS-MEMBER] step 2 (b), (c); the plan
   docs/superpowers/plans/2026-10-11-one-rule-plan.md §4.3, §4.4). His rulings:
   D755 — "a row that came from an input IS the input: whoever stands on it … is in the input";
   D756 — an input is ONE record with the list of its people, so its row is ONE ground row, a whole copy of it;
   D734 widened — a puck put on the row adds that person to the input, a puck taken off takes him out — on EVERY
           input's row now, an input of one person included;
   D98 — a day back to what was published has nothing waiting; D114 — ✕ takes the input off the programme;
   D271 — one person once on a row; D450 — a day is saved only by its holder (the row is worked out on read).

   What this file holds, on the one record and the one row:
   - an input filed for several lands ONE row — the first to join in its name box, the rest under it — and no row
     carries an entry mark;
   - a person added later is on the SAME row (the same row id, the same place in the list), under the people already
     there, and the row keeps what the scheduler set on it; a person taken out leaves the row standing;
   - Accept after ✕ brings the row back with everyone on it; on a published day it goes back where the published
     version had it, so nothing is waiting (D98);
   - a row made before the build, carrying someone who is not in its input — a scheduler's man, a placeholder — is
     re-made once, whole, without him (the plan's R6: stored demo rows only, D56 — told to the owner);
   - an armed place is put down when a row lands or goes above it; a saved day template takes one row for the input's
     row and nothing of the request.

   IT REPLACES the `[GROUP-INPUT-ONE-ROW]` step 3 file of this name (D661, D735 — one record a man and one ground row a
   man, known as one entry by a mark `srcg` and kept alike in the view). RETIRED, each because D755 / D756 took its
   subject away — there is one record and one row, so there are no sibling rows to place, mark or part:
   - "a group filed for three: three rows, one `srcg` … side by side, and read as ONE row" — the ENTRY MARK: here as
     one row, and no mark;
   - "BY LANDING: he lands straight after the last of them … with their CX and its reason, red box and
     information-only" and "BY ACCEPT: a man taken off the programme and accepted again goes back after the last of
     them" — SIBLING PLACEMENT: a person added stands on the row itself, and one man is never taken off the programme
     alone (one input, one filing); here as "the SAME row" and "Accept after ✕";
   - "a man whose own record is changed alone is his own row again — the rows are honestly drawn apart" (D735) — there
     is no record of his own to change;
   - "a one-man request with ALL AVAIL in its name box, made a group: … ALL AVAIL among its extras, nothing dropped"
     (D46, D745) — a placeholder no longer rides one man's place: D745 is set aside by D755. Here TWICE since step 3 of
     the build (12 Oct 26; D750, D753, D755, D757), which makes ALL AVAIL one of an input's own people: as R6 for a row
     STORED BEFORE the build whose placeholder is not in its input (old data — it comes off), and, in the block "ALL
     AVAIL / ALL is one of the people the row follows", as the rule stands now for one that IS in the input — it is
     kept, whoever joins or leaves beside it;
   - "a scheduler's man in the name box, his OIL refused, then made one of the people: he stands on his OWN row" and
     "…and Undo of that save" (D470 as changed by D755) — there is no row of his own: here he joins the one row, once;
   - "a man standing among a member's extras who is made one of the people comes off the extras" — the row has no
     extras of its own: here as "the row is exactly the input's people".
   Driven through the app's own doors on a real saved store, as state/p6c-requestonread.test.ts is; a "reload" is a
   second boot from the same store.
   Behaviour register: GI4. */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { INPUTS, inpId, idsOf } from '../engine/inputs'
import { PEOPLE, ID_BY_CS, indexCallsigns } from '../engine/people'
import { DAYS } from '../engine/data'
import { CURWEEK } from '../engine/waves'
import { storeBackend, HOOKS } from '../engine/hooks'
import { stashClear } from '../engine/weekstash'
import { SCHED, signOf, dayShownPendCount } from '../engine/publish'
import { acceptInput, unacceptInput } from '../engine/slots'
import { tplFromDay } from '../engine/daytpl'
import { PLANPUCKS, DAYRMK } from './plan'
import { initStore, weekStashSnap, weekDirty, loadWeek } from './store'
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
import { commitNewInput, commitInput, draftOf } from '../ui/inputedit'
import { rowPut, rowTake } from '../ui/reqdoor'
import * as pops from '../ui/pops'

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
  setPage('editsched')
  return wb
}
async function reload(be: MemoryBackend): Promise<Whiteboard> { await vi.advanceTimersByTimeAsync(1000); resetWorld(); return boot(be) }

const TITLE = 'Range safety brief'
const ground = () => ((DAYS[WED] as any).ground || []) as any[]
const rec = (title = TITLE) => { const l = INPUTS.filter((x: any) => x.title === title && x.date === 'Jul 15') as any[]; expect(l, `ONE record: ${title}`).toHaveLength(1); return l[0] }
const iidOf = (title = TITLE) => String(inpId(rec(title)))
const people = (title = TITLE) => idsOf(rec(title)).map(String)
const riOf = (title = TITLE) => ground().findIndex((g: any) => g && g.src === iidOf(title))
const rowOf = (title = TITLE) => ground()[riOf(title)]
const rowKey = (title = TITLE) => `g:${WED}.${riOf(title)}`
/* who stands on the input's row: its name box, then the places under it */
const onRow = (title = TITLE) => [rowOf(title).who, ...(rowOf(title).more || [])].filter(Boolean)
/* the place a person stands on, on the input's row */
const keyOf = (p: string, title = TITLE) => { const r = rowOf(title), k = rowKey(title); if (r.who === p) return k; const n = (r.more || []).indexOf(p); expect(n, `${p} is on the row`).toBeGreaterThanOrEqual(0); return `${k}.x${n}` }
/* the day's rows that came from an input, in the list's order, by the input's name — hand-built rows of the seed are left out */
const order = () => ground().filter((g: any) => g && g.src).map((g: any) => String(g.prog))
const DRAFT = (title = TITLE, over: any = {}) => ({ ...draftOf({ person: 'bane', type: 'Training', title, date: 'Jul 15', yr: 2026, allday: false, s: 660, e: 720, remarks: 'bring your kit' }), ...over })
/* ONE input filed for these people, in this order — the one writer (ui/inputedit.tsx commitInput) */
const file = (ppl: string[], title = TITLE) => expect(commitInput(null, DRAFT(title), ppl)).toBe(true)
/* …and who it holds changed in its own window */
const setPeople = (ppl: string[], title = TITLE) => expect(commitInput(rec(title), draftOf(rec(title)), ppl)).toBe(true)
/* an input of one person beside it, by its own title */
const fileOne = (p: string, title: string) => expect(commitNewInput({ ...DRAFT(title, { sTime: '14:00', eTime: '15:00' }), person: p, type: 'Meeting' })).toBe(true)
const mark = (o: any, title = TITLE) => schedWrite(SCHED_TYPES.mutate, () => { Object.assign(rowOf(title), o); afterSchedMutate() })
const marksOf = (title = TITLE) => { const r = rowOf(title); return { cx: r.cx, cxr: r.cxr, flag: r.flag, info: r.info } }
const publish = (di: number) => { sign(di); commitSetDayApproved(di, true) }
/* ✕ on the row — the input off the programme — and a scheduler's Accept */
const off = (title = TITLE) => schedWrite(SCHED_TYPES.mutate, () => { expect(unacceptInput(WED, rec(title))).toBe(true); afterSchedMutate() })
const on = (title = TITLE) => schedWrite(SCHED_TYPES.mutate, () => { expect(acceptInput(WED, rec(title), 'g')).toBe(true); afterSchedMutate() })
/* a row as a day stored before the build carries it: people on it who are not in its input, the old hash, the old
   entry mark — written by its holder, as that day was */
const asStoredBefore = (who: string, more: string[], title = TITLE) => schedWrite(SCHED_TYPES.mutate, () => {
  const r = rowOf(title)
  r.who = who; if (more.length) r.more = more; else delete r.more
  r.srcv = 'old'; r.srcg = 'g1~old'
  afterSchedMutate()
})

beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(new Date(2026, 6, 13, 9, 0, 0)); resetWorld(); HOOKS.toast = () => {} })
afterEach(() => { HOOKS.toast = toast; _resetTimeline(); vi.useRealTimers(); resetWorld(); setSession(null); setMe(DEFAULT_ME); storeBackend.impl = null })

describe('an input is ONE row — a whole copy of the input (D755, D756; the plan §4.3)', () => {
  it('an input filed for three: ONE row — the first to join in the name box, the others under it, no entry mark — and the same row after a reload', async () => {
    const be = new MemoryBackend()
    await boot(be)
    file(['rocky', 'bane', 'pike'])
    expect(INPUTS.filter((x: any) => x.title === TITLE), 'one record').toHaveLength(1)
    expect(ground().filter((g: any) => g && g.src === iidOf()), 'one row').toHaveLength(1)
    expect(people()).toEqual(['rocky', 'bane', 'pike'])
    expect([rowOf().who, rowOf().more]).toEqual(['rocky', ['bane', 'pike']])
    expect('srcg' in rowOf()).toBe(false)
    const rid = rowOf().rid
    expect(rid, 'the row has its id').toBeTruthy()
    await reload(be)
    expect([rowOf().who, rowOf().more, rowOf().rid], 'after a reload').toEqual(['rocky', ['bane', 'pike'], rid])
    expect('srcg' in rowOf()).toBe(false)
  })

  it('an input of one person: one row, nobody under it — and no entry mark either', async () => {
    await boot(new MemoryBackend())
    fileOne('bane', 'Solo check')
    const row = rowOf('Solo check')
    expect(row.who).toBe('bane')
    expect('more' in row, 'no key where there is nobody to put in it').toBe(false)
    expect('srcg' in row).toBe(false)
  })
})

describe('the row follows who is in the input — the same row, never another (D755; D734 widened)', () => {
  it('a person added later — in the input’s own window, or put on the row — is on the SAME row, under the people already there, with what the scheduler set on it; after a reload too', async () => {
    const be = new MemoryBackend()
    await boot(be)
    file(['bane', 'pike'])
    fileOne('rocky', 'Filed since')                        // a row below it
    expect(order()).toEqual([TITLE.toUpperCase(), 'FILED SINCE'])
    mark({ cx: true, cxr: 'WX', flag: true, info: true })
    const rid = rowOf().rid, at = riOf()
    setPeople(['bane', 'pike', 'split'])
    expect(onRow(), 'under the people already there').toEqual(['bane', 'pike', 'split'])
    expect(rowPut(`${rowKey()}.+`, 'ignite'), 'and one put on the row’s "+ add"').toBe('done')
    expect(people()).toEqual(['bane', 'pike', 'split', 'ignite'])
    expect(onRow()).toEqual(['bane', 'pike', 'split', 'ignite'])
    expect([rowOf().rid, riOf()], 'the same row, where it stood').toEqual([rid, at])
    expect(order(), 'no second row; the row filed since still below it').toEqual([TITLE.toUpperCase(), 'FILED SINCE'])
    expect(marksOf(), 'CX and its reason, the red box, information only: the row’s, kept').toEqual({ cx: true, cxr: 'WX', flag: true, info: true })
    await reload(be)
    expect(onRow(), 'after a reload').toEqual(['bane', 'pike', 'split', 'ignite'])
    expect([rowOf().rid, riOf()]).toEqual([rid, at])
    expect(marksOf()).toEqual({ cx: true, cxr: 'WX', flag: true, info: true })
    expect(order()).toEqual([TITLE.toUpperCase(), 'FILED SINCE'])
  })

  it('a person taken out leaves the row standing — the others in their order; the first to join gone, the next takes the name box', async () => {
    const be = new MemoryBackend()
    await boot(be)
    file(['bane', 'pike', 'split', 'rocky'])
    mark({ flag: true })
    const rid = rowOf().rid, at = riOf()
    expect(rowTake(keyOf('pike')), 'his puck taken off the row').toBe('done')
    expect(people()).toEqual(['bane', 'split', 'rocky'])
    expect(onRow()).toEqual(['bane', 'split', 'rocky'])
    setPeople(['split', 'rocky'])                          // the first to join, taken out in the input’s own window
    expect([rowOf().who, rowOf().more]).toEqual(['split', ['rocky']])
    expect(rowTake(keyOf('rocky'))).toBe('done')
    expect(rowOf().who).toBe('split')
    expect('more' in rowOf(), 'down to one: nothing is kept under the name box').toBe(false)
    expect([rowOf().rid, riOf(), rowOf().flag], 'the same row throughout, its red box kept').toEqual([rid, at, true])
    expect(ground().filter((g: any) => g && g.src === iidOf())).toHaveLength(1)
    await reload(be)
    expect([onRow(), rowOf().rid]).toEqual([['split'], rid])
  })

  it('Accept after ✕ brings the row back with everyone on it; Undo of a ✕ brings back the very row, with what the scheduler set on it', async () => {
    await boot(new MemoryBackend())
    file(['bane', 'pike', 'split'])
    off()
    expect(riOf(), '✕: the row goes').toBe(-1)
    expect(people(), 'and its people stay in the input').toEqual(['bane', 'pike', 'split'])
    on()
    expect(ground().filter((g: any) => g && g.src === iidOf()), 'one row again').toHaveLength(1)
    expect(onRow(), 'everyone on it, in the order they joined').toEqual(['bane', 'pike', 'split'])
    mark({ flag: true })
    const rid = rowOf().rid
    off()
    expect(riOf()).toBe(-1)
    globalUndo()
    expect(onRow(), 'Undo: everyone on it').toEqual(['bane', 'pike', 'split'])
    expect([rowOf().rid, rowOf().flag], 'the very row, its red box with it').toEqual([rid, true])
  })

  for (const hand of [false, true]) {
    it(`an input for three filed between two others, published, taken off and accepted again${hand ? ' — on a hand-ordered list' : ''}: nothing is waiting (D98) — its row is back where the published version had it, everyone on it`, async () => {
      await boot(new MemoryBackend())
      fileOne('ignite', 'Filed before')
      file(['rocky', 'bane', 'pike'])                      // out of A-to-Z order on purpose
      fileOne('split', 'Filed after')
      if (hand) schedWrite(SCHED_TYPES.mutate, () => { (DAYS[WED] as any).gman = true; afterSchedMutate() })
      const was = order()
      expect(was).toEqual(['FILED BEFORE', TITLE.toUpperCase(), 'FILED AFTER'])
      publish(WED)
      expect(dayShownPendCount(WED)).toBe(0)
      off()
      expect(dayShownPendCount(WED), 'taken off: something is waiting').toBeGreaterThan(0)
      on()
      expect(order(), 'the published order').toEqual(was)
      expect(onRow(), 'everyone on it, as published').toEqual(['rocky', 'bane', 'pike'])
      expect(dayShownPendCount(WED), 'back to what was published').toBe(0)
    })
  }
})

/* ==== ALL AVAIL / ALL IS ONE OF THE PEOPLE THE ROW FOLLOWS (step 3 of the one-rule build, 12 Oct 26). His rulings:
   D750 — the puck "is one of the input's own people and is tied to no man"; D755 — whoever stands on the row, "a named
   person or ALL AVAIL / ALL, whoever put them there", is in the input; D757 — "ALL AVAIL stays when anyone leaves";
   D753 — one of them, once. The plan §4.3: `who` is the first to join STILL IN IT, `more` the rest in joined order —
   "a placeholder is one of them". Each case says which of four it is: (1) the rule survives on a rebuilt fixture;
   (2) a named ruling changed the rule; (3) old data; (4) the subject is gone. ==== */
describe('ALL AVAIL / ALL is one of the people the row follows — the same row, kept as the input changes (D750, D755, D757; the plan §4.3)', () => {
  const A = 'allavail'
  /* (1) "an input filed for three: ONE row … and the same row after a reload" — with a placeholder among the three */
  it('an input filed for two people and ALL AVAIL: ONE row, the placeholder under the name box where it joined — and the same row after a reload', async () => {
    const be = new MemoryBackend()
    await boot(be)
    file(['rocky', A, 'pike'])
    expect(ground().filter((g: any) => g && g.src === iidOf()), 'one row').toHaveLength(1)
    expect(people()).toEqual(['rocky', A, 'pike'])
    expect([rowOf().who, rowOf().more]).toEqual(['rocky', [A, 'pike']])
    const rid = rowOf().rid
    await reload(be)
    expect(people(), 'after a reload: still in the input').toEqual(['rocky', A, 'pike'])
    expect([rowOf().who, rowOf().more, rowOf().rid], 'and on the very row').toEqual(['rocky', [A, 'pike'], rid])
  })

  /* (2) the old file's "a one-man request with ALL AVAIL in its name box, made a group: its man is in the name box, ALL
     AVAIL among its extras, nothing dropped … the switches made under it are where they were" (D46, D745). D755: the
     placeholder is put IN the one-person input, by the row's door, and stands beside its man; a person added
     afterwards joins after both. What the case pinned survives: nothing is dropped, the row is the same row, and what
     the scheduler switched off under the input for the day is where it was. */
  it('a one-person request with ALL AVAIL put on its row, then a person added in its window: the SAME row holds all three, nothing dropped — the day’s OIL switches where they were; after a reload too', async () => {
    const be = new MemoryBackend()
    await boot(be)
    fileOne('bane', 'Solo check')
    const rid = rowOf('Solo check').rid, iid = iidOf('Solo check')
    expect(rowPut(`${rowKey('Solo check')}.+`, A), 'the row’s door').toBe('done')
    expect(people('Solo check'), 'IN the input, beside its man').toEqual(['bane', A])
    expect([rowOf('Solo check').who, rowOf('Solo check').more]).toEqual(['bane', [A]])
    schedWrite(SCHED_TYPES.mutate, () => { (DAYS[WED] as any).oild = { people: { [`plasma|i:${iid}`]: 'deny' } }; afterSchedMutate() })
    setPeople(['bane', A, 'pike'], 'Solo check')
    expect([rowOf('Solo check').who, rowOf('Solo check').more], 'the man added stands after both').toEqual(['bane', [A, 'pike']])
    expect(rowOf('Solo check').rid, 'the same row').toBe(rid)
    expect((DAYS[WED] as any).oild.people, 'the switch made under it is where it was').toEqual({ [`plasma|i:${iid}`]: 'deny' })
    await reload(be)
    expect([onRow('Solo check'), rowOf('Solo check').rid], 'a reload agrees').toEqual([['bane', A, 'pike'], rid])
  })

  /* (2) D745 — "comes off with the man whose place it stood on" — is set aside by D755; D757: it STAYS. And the plan's
     "the first to join leaves: the next takes the name box" holds for a placeholder as for a person: where it is the
     next to have joined, it holds the name box. */
  it('a person taken out leaves ALL AVAIL standing; the FIRST to join taken out, and ALL AVAIL — the next to have joined — holds the name box; the same row throughout', async () => {
    const be = new MemoryBackend()
    await boot(be)
    file(['bane', A, 'pike', 'split'])
    mark({ flag: true })
    const rid = rowOf().rid, at = riOf()
    expect(rowTake(keyOf('pike')), 'a person from under it').toBe('done')
    expect(onRow()).toEqual(['bane', A, 'split'])
    expect(rowTake(keyOf('bane')), 'the first to join').toBe('done')
    expect([rowOf().who, rowOf().more], 'the placeholder holds the name box').toEqual([A, ['split']])
    expect(people()).toEqual([A, 'split'])
    expect(rowTake(keyOf('split')), 'the last named person — ALL AVAIL is not the last on the row while he stands').toBe('done')
    expect(rowOf().who).toBe(A)
    expect('more' in rowOf(), 'down to one: nothing is kept under the name box').toBe(false)
    expect([rowOf().rid, riOf(), rowOf().flag], 'the same row, its red box kept').toEqual([rid, at, true])
    await reload(be)
    expect([onRow(), rowOf().rid]).toEqual([[A], rid])
  })

  /* (1) "Accept after ✕ brings the row back with everyone on it" (D114) and "back where the published version had it,
     so nothing is waiting" (D98) — everyone includes the placeholder, and the men behind it come back as they went */
  it('✕ and Accept, and Undo of a ✕: the row is back with everyone on it, ALL AVAIL among them; on a published day nothing is waiting (D98)', async () => {
    await boot(new MemoryBackend())
    file(['bane', A, 'pike'])
    off()
    expect(riOf(), '✕: the row goes').toBe(-1)
    expect(people(), 'and its people, the placeholder with them, stay in the input').toEqual(['bane', A, 'pike'])
    on()
    expect(onRow(), 'Accept').toEqual(['bane', A, 'pike'])
    const rid = rowOf().rid
    off()
    globalUndo()
    expect([onRow(), rowOf().rid], 'Undo of the ✕: the very row').toEqual([['bane', A, 'pike'], rid])
    publish(WED)
    expect(dayShownPendCount(WED)).toBe(0)
    off()
    expect(dayShownPendCount(WED), 'taken off: something is waiting').toBeGreaterThan(0)
    on()
    expect(onRow(), 'everyone on it, as published').toEqual(['bane', A, 'pike'])
    expect(dayShownPendCount(WED), 'back to what was published').toBe(0)
  })

  /* (3) OLD DATA — the plan's R6, for a row stored before the build that carries BOTH a stray and a placeholder: what is
     in the input is kept, what is not comes off. (The step-2 cases below are the same rule where the placeholder
     itself is the stray: an old row's ALL AVAIL was never in its input.) */
  it('a row stored before the build, its input holding ALL AVAIL: re-made whole — the placeholder IN the input is kept, a stray man under it comes off, and nobody stands twice', async () => {
    await boot(new MemoryBackend())
    file(['bane', 'split', A])
    asStoredBefore('bane', ['split', A, 'pike', A])        // a stray man, and the placeholder a second time (D278 let it stand twice on a row)
    expect(onRow(), 're-made: exactly the input’s people').toEqual(['bane', 'split', A])
    setPeople(['bane', 'split', A, 'pike'])
    expect(onRow(), 'the man now in the input stands once (D271)').toEqual(['bane', 'split', A, 'pike'])
    expect(onRow()).toEqual(people())
  })

  /* (1) "a saved day template takes one row for the input's row and nothing of the request" — its people are the
     request's, the placeholder among them */
  it('a day template saved from a day whose input’s row holds ALL AVAIL takes one row for it and none of its people — not the placeholder either', async () => {
    await boot(new MemoryBackend())
    file(['bane', A])
    const rows = tplFromDay(WED, 't').d.ground.filter((r: any) => r.prog === TITLE.toUpperCase())
    expect(rows).toHaveLength(1)
    expect([rows[0].who, (rows[0].more || []).filter(Boolean)]).toEqual(['', []])
    expect('src' in rows[0] || 'srcv' in rows[0], 'no link to the request').toBe(false)
  })
})

describe('a row made before the build is re-made once, whole — whoever stood on it without being in the input comes off (the plan’s R6)', () => {
  /* (3) OLD DATA, kept as a legacy case: the row is as a day STORED BEFORE the build carries it — its placeholder was
     the row's own (D46) and never in the input. A placeholder that IS in the input is kept (the block above). */
  it('ALL AVAIL in the name box of a one-person request’s row: the request’s own person is back in it, the placeholder gone — and the input holds him alone', async () => {
    const be = new MemoryBackend()
    await boot(be)
    fileOne('bane', 'Solo check')
    const rid = rowOf('Solo check').rid
    asStoredBefore('allavail', ['bane'], 'Solo check')     // the placeholder in the name box (D46), its man pushed under it
    expect(onRow('Solo check')).toEqual(['bane'])
    expect('srcg' in rowOf('Solo check')).toBe(false)
    expect(rowOf('Solo check').rid, 're-made in place: the same row').toBe(rid)
    expect(people('Solo check'), 'nothing was written to the input').toEqual(['bane'])
    await reload(be)
    expect(onRow('Solo check'), 'a reload agrees').toEqual(['bane'])
  })

  it('a scheduler’s man on another man’s request row — in its name box, or under it — comes off; put in through the door he stands on that row ONCE (D271), and Undo takes him out again', async () => {
    for (const where of ['name box', 'under it'] as const) {
      resetWorld(); const be = new MemoryBackend(); await boot(be)
      fileOne('bane', 'Solo check')
      const rid = rowOf('Solo check').rid
      if (where === 'name box') asStoredBefore('pike', [], 'Solo check'); else asStoredBefore('bane', ['pike'], 'Solo check')
      expect(onRow('Solo check'), where).toEqual(['bane'])
      expect(people('Solo check'), where).toEqual(['bane'])
      expect(rowPut(`${rowKey('Solo check')}.+`, 'pike'), 'he joins, by the door').toBe('done')
      expect(people('Solo check')).toEqual(['bane', 'pike'])
      expect(onRow('Solo check'), 'once on the row').toEqual(['bane', 'pike'])
      expect(rowOf('Solo check').rid, 'the same row — never one of his own').toBe(rid)
      expect(ground().filter((g: any) => g && g.src && [g.who, ...(g.more || [])].includes('pike')), 'and on no other row from an input').toHaveLength(1)
      globalUndo()
      expect(people('Solo check'), 'Undo').toEqual(['bane'])
      expect(onRow('Solo check'), 'and what the old row carried does not come back').toEqual(['bane'])
      expect(rowPut(`${rowKey('Solo check')}.+`, 'pike')).toBe('done')
      await reload(be)
      expect(onRow('Solo check'), 'a reload agrees').toEqual(['bane', 'pike'])
      expect(rowOf('Solo check').rid).toBe(rid)
    }
  })

  it('strays under the row of an input of several — a placeholder, a man — when one of them is put in the input’s window: the row is exactly the input’s people', async () => {
    await boot(new MemoryBackend())
    file(['bane', 'split'])
    asStoredBefore('bane', ['split', 'allavail', 'pike'])
    expect(onRow(), 're-made: the strays are off').toEqual(['bane', 'split'])
    setPeople(['bane', 'split', 'pike'])
    expect(onRow(), 'the man now in the input stands once (D271); the placeholder is not on it').toEqual(['bane', 'split', 'pike'])
    expect(onRow()).toEqual(people())
  })
})

describe('what stands around the row', () => {
  it('an armed place BELOW is put down when a row goes from above it, and when Undo puts that row back above it — the next tap on a name must not plant into another row', async () => {
    await boot(new MemoryBackend())
    file(['bane', 'pike'])
    fileOne('rocky', 'Filed after')
    view.armSlot(`${rowKey('Filed after')}.+`)
    expect(view.ARM, 'armed').toBeTruthy()
    off()                                                  // ✕ on the input's row: the row under it moves up
    expect(view.ARM, 'put down: the row above it went').toBeNull()
    view.armSlot(`${rowKey('Filed after')}.+`)
    globalUndo()                                           // the input's row is back above it
    expect(order()).toEqual([TITLE.toUpperCase(), 'FILED AFTER'])
    expect(view.ARM, 'put down: a row came back above it').toBeNull()
  })

  /* THE OTHER DOOR THAT LANDS A ROW ABOVE ANOTHER. A landing on read goes to the END of the list now (one row an input —
     until the one-rule build a man added to a shared input landed mid-list, after his entry's last row, and that was
     the case this file pinned). What still puts a row ABOVE a row that stands is a scheduler's Accept on a published
     day: the row goes back where the published version had it (D98). The armed place under it is named by position,
     so it must be put down there too — or the next tap on a name puts that person in the WRONG input. */
  it('an armed place BELOW is put down when a scheduler’s Accept puts a row back above it — a published day, the row back where the published version had it', async () => {
    await boot(new MemoryBackend())
    file(['bane', 'pike'])
    fileOne('rocky', 'Filed after')
    publish(WED)
    off()
    view.armSlot(`${rowKey('Filed after')}.+`)
    expect(view.ARM, 'armed, on the row filed after').toBeTruthy()
    on()
    expect(order(), 'the row is back above it').toEqual([TITLE.toUpperCase(), 'FILED AFTER'])
    expect(view.ARM, 'put down: the armed position is another row’s now').toBeNull()
    expect(view.placeArmed('ignite'), 'so a tap on a name plants nobody').toBe(false)
    expect(people(), 'least of all into the input whose row came back').toEqual(['bane', 'pike'])
  })

  it('an armed place stays armed when a row lands BELOW it, and when someone joins the armed row itself — it is the same row still', async () => {
    await boot(new MemoryBackend())
    file(['bane', 'pike'])
    view.armSlot(`${rowKey()}.+`)
    const armed = `${rowKey()}.+`
    fileOne('rocky', 'Filed after')
    expect(view.ARM && view.ARM.key, 'a row landed below').toBe(armed)
    setPeople(['bane', 'pike', 'split'])
    expect(view.ARM && view.ARM.key, 'someone joined the row').toBe(armed)
    expect(`${rowKey()}.+`).toBe(armed)
  })

  it('a day template saved from a day with an input’s row takes ONE row for it — and nothing of the request', async () => {
    await boot(new MemoryBackend())
    const before = tplFromDay(WED, 't').d.ground.length
    file(['bane', 'pike', 'split'])
    fileOne('rocky', 'Solo check')
    const t = tplFromDay(WED, 't').d.ground
    expect(t.length, 'one for the input of three, one for the input of one').toBe(before + 2)
    const rows = t.filter((r: any) => r.prog === TITLE.toUpperCase())
    expect(rows).toHaveLength(1)
    expect(t.some((r: any) => 'srcg' in r || 'src' in r || 'srcv' in r), 'no link to any request').toBe(false)
    expect([rows[0].who, (rows[0].more || []).filter(Boolean)], 'and none of its people').toEqual(['', []])
    expect([rows[0].str, rows[0].end], 'its shape is kept').toEqual(['11:00', '12:00'])
  })
})
