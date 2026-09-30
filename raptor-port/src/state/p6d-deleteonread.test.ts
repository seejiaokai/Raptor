// @vitest-environment jsdom
/* [DB-READINESS] group A, phase 6 (d) — A DELETED MAN IS TAKEN OFF HIS DAYS ON READ (plan
   `docs/superpowers/plans/2026-09-30-db-readiness-phase6-plan.md` §3 (d); data-model.md §9 rule 9, "a man deleted").

   A delete (Admin → Users, or the posting pass on its date) used to REWRITE every saved week from his cutoff on — days
   nobody holds, which the database's day lock refuses (D450). Now the delete writes his own records only (the person
   with `deletedFrom`, his requests, his account, the planning calendar, the Leave War), and every day from the cutoff
   SHOWS him gone because it is worked out when the week is read: the loaded week, a week opened later, the cross-week
   reads (crew rest), the next-week peek. The day's holder saves it without him at his next change. Days before the
   cutoff keep him (D297); issued versions keep him (D299). The clock is FIXED at 15 Jul 26, inside the demo week
   (13–19 Jul): the 13th and 14th are days he flew, the 15th on are days to come. */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { INPUTS } from '../engine/inputs'
import { PEOPLE, ID_BY_CS, indexCallsigns } from '../engine/people'
import { DAYS } from '../engine/data'
import { CURWEEK } from '../engine/waves'
import { storeBackend } from '../engine/hooks'
import { stashClear, stashGroundBySrc, setPreservedBlob, clearPreservedBlob } from '../engine/weekstash'
import { peekWeekHTML } from '../ui/peek'
import { SCHED, setSign, dayDelta, daySnapOf, dayCurVer } from '../engine/publish'
import { nextMondaySeed } from '../engine/weekctx'
import { weekBundle } from '../engine/weeks-data'
import { PLANPUCKS, DAYRMK } from './plan'
import { initStore, weekStashSnap, weekDirty, loadWeek, writeText } from './store'
import { commitSetDayApproved, schedWrite, SCHED_TYPES } from './sched-commit'
import { setSession } from './auth'
import { hydrate, wirePersist, weekId } from './persist'
import { bootStorage } from '../storage/boot'
import { settingsAdapter } from '../storage/adapters'
import { MemoryBackend } from '../storage/memory'
import { SCHEMA_VERSION } from '../storage/reset'
import type { Change as WbChange, Whiteboard } from '../storage/whiteboard'
import { _resetTimeline } from '../undo/timeline'
import { installGlobalUndo } from './undo-wire'
import { _resetDisclosure } from './disclosure'
import * as view from './view'
import { deletePerson, personKeysOnDay, stripDeletedFromDay } from './person-delete'

const ISNAP = JSON.stringify(INPUTS)
const PSNAP = JSON.stringify(PEOPLE)
const DSNAP = JSON.stringify(DAYS)
const W0 = '06/07/2026', W1 = '13/07/2026', W2 = '20/07/2026'
const HIM = 'rocky'                                   // Hex
const PAST = 0, TO_COME = 4                           // Mon 13 (flown) | Fri 17 (to come)

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
  view.WARNOFF.clear()
  stashClear()
}
let groups: WbChange[][] = []
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
  setSession({ user: 'ad', role: 'admin' })
  groups = []
  wb.subscribe(g => groups.push(g))
  return wb
}
const weekWrites = () => groups.flat().filter(c => c.collection === 'weeks').map(c => (c.value === null ? '-' : '') + c.id)
const clear = () => { groups = [] }
const weekRows = (wb: Whiteboard, wk: string) => { const wid = weekId(wk); const o: Record<string, string | null> = {}; for (const k of wb.keys('weeks')) if (k.startsWith(wid)) o[k] = wb.get('weeks', k); return o }
/* put him on day `di` of the loaded week — a ground row of his own (every week has a ground programme, a blank one
   included) — inside a schedule command (the save); a day is saved only by a command that changes it */
const planDuty = (di: number) => {
  schedWrite(SCHED_TYPES.mutate, () => {
    const d: any = DAYS[di]; d.ground = d.ground || []
    d.ground.push({ prog: 'P6D ' + di, str: '0900', end: '1000', who: HIM })
  })
}
const publish = (di: number) => {
  const signers = ['stiff', 'harpoon', 'razer', 'yeti']
  ;(['cur', 'sked', 'plan', 'appr'] as const).forEach((r, i) => setSign(di, r, signers[i]))
  commitSetDayApproved(di, true)
}
const onWeek = () => DAYS.map((_d: any, di: number) => personKeysOnDay(di, HIM).length)

beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(new Date(2026, 6, 15, 9, 0, 0)); resetWorld() })
afterEach(() => { _resetTimeline(); vi.useRealTimers(); resetWorld(); setSession(null); storeBackend.impl = null })

describe('phase 6 (d) — a delete writes his records, never a week; every day from his cutoff reads without him', () => {
  it('a saved week to come: its stored rows are byte for byte as they were; opened, he is on none of its days', async () => {
    const wb = await boot(new MemoryBackend())
    loadWeek(W2)
    for (const di of [0, 3]) planDuty(di)
    expect(onWeek()[0] > 0 && onWeek()[3] > 0, 'he is on Monday and Thursday of the week to come').toBe(true)
    loadWeek(W1)
    const before = weekRows(wb, W2)
    clear()
    expect(deletePerson(HIM)).toBe(null)
    expect(weekWrites().filter(w => w.startsWith(weekId(W2))), 'the delete writes no row of that week').toEqual([])
    expect(weekRows(wb, W2)).toEqual(before)
    loadWeek(W2)
    expect(onWeek(), 'worked out on read: gone from every day of it').toEqual([0, 0, 0, 0, 0, 0, 0])
  })

  it('a saved week BEFORE the cutoff keeps him — the days he flew (D297)', async () => {
    await boot(new MemoryBackend())
    loadWeek(W0)
    planDuty(2)
    loadWeek(W1)
    expect(deletePerson(HIM)).toBe(null)
    loadWeek(W0)
    expect(personKeysOnDay(2, HIM).length, 'a day he flew').toBeGreaterThan(0)
  })

  it('the week on screen: gone from the days to come at once, kept on the days he flew; the delete writes none of its rows', async () => {
    const wb = await boot(new MemoryBackend())
    planDuty(PAST); planDuty(TO_COME)
    const before = weekRows(wb, W1)
    clear()
    expect(deletePerson(HIM)).toBe(null)
    expect(personKeysOnDay(TO_COME, HIM), 'a day to come').toEqual([])
    expect(personKeysOnDay(PAST, HIM).length, 'a day he flew').toBeGreaterThan(0)
    expect(weekWrites(), 'no week row written by the delete').toEqual([])
    expect(weekRows(wb, W1)).toEqual(before)
  })

  it('a reload shows the same: every day to come without him, the days he flew with him', async () => {
    const be = new MemoryBackend()
    await boot(be)
    planDuty(PAST); planDuty(TO_COME)
    expect(deletePerson(HIM)).toBe(null)
    await vi.advanceTimersByTimeAsync(1000)
    resetWorld()
    await boot(be)
    expect(PEOPLE[HIM].deleted, 'the person, read back, is deleted').toBeTruthy()
    expect(personKeysOnDay(TO_COME, HIM), 'a day to come, after a reload').toEqual([])
    expect(personKeysOnDay(PAST, HIM).length, 'a day he flew, after a reload').toBeGreaterThan(0)
  })

  it('the holder\'s next change to a day to come saves it without him — and only that day', async () => {
    const wb = await boot(new MemoryBackend())
    planDuty(TO_COME); planDuty(5)
    expect(deletePerson(HIM)).toBe(null)
    clear()
    writeText(`dn:${TO_COME}.0`, 'NEXT CHANGE')
    expect(weekWrites()).toEqual([`${weekId(W1)}#${TO_COME}`])
    expect(wb.get('weeks', `${weekId(W1)}#${TO_COME}`), 'saved without him').not.toContain(`"${HIM}"`)
    expect(wb.get('weeks', `${weekId(W1)}#5`), 'another day he was on, not changed, is not rewritten').toContain(`"${HIM}"`)
  })

  it('a published day to come reads pending, before and after a reload; its issued version still holds him', async () => {
    const be = new MemoryBackend()
    const wb = await boot(be)
    planDuty(TO_COME)
    publish(TO_COME)
    const ver = dayCurVer(TO_COME)
    const issued = wb.get('weeks', `${weekId(W1)}:is:${ver}~0`)
    expect(issued).toContain(`"${HIM}"`)
    expect(deletePerson(HIM)).toBe(null)
    expect(dayDelta(TO_COME).length, 'pending at once').toBeGreaterThan(0)
    expect(JSON.stringify(daySnapOf(TO_COME, ver))).toContain(`"${HIM}"`)
    await vi.advanceTimersByTimeAsync(1000)
    resetWorld()
    await boot(be)
    expect(dayDelta(TO_COME).length, 'still pending after a reload').toBeGreaterThan(0)
    expect(wb.get('weeks', `${weekId(W1)}:is:${ver}~0`), 'the issued version is a record — never rewritten').toBe(issued)
  })

  it('the cross-week read (next Monday, for crew rest) and the next-week peek read him gone', async () => {
    await boot(new MemoryBackend())
    loadWeek(W2)
    planDuty(0)                                          // Mon 20 Jul, a day to come
    loadWeek(W1)
    expect(JSON.stringify(nextMondaySeed(W1)), 'before the delete, next Monday holds him').toContain(HIM)
    expect(deletePerson(HIM)).toBe(null)
    expect(JSON.stringify(nextMondaySeed(W1)), 'after it, next Monday is read without him').not.toContain(HIM)
  })

  it('a week NEVER saved (the seed) is read without a deleted man too — next Monday for crew rest', async () => {
    await boot(new MemoryBackend())
    /* someone on next Monday's seed day (a desk or a flying seat) — the seed is never stored, so nothing but the read can
       take him off it */
    const mon: any = weekBundle(W2).days[0]
    const onMon: string[] = []
    ;(mon.dutywaves || []).forEach((w: any) => (w.rows || []).forEach((r: any) => { if (r && r.id && PEOPLE[r.id] && !PEOPLE[r.id].special) onMon.push(r.id) }))
    ;(mon.waves || []).forEach((w: any) => (w.formations || []).forEach((f: any) => (f.aircraft || []).forEach((a: any) => { for (const s of ['p', 'w']) if (a[s] && PEOPLE[a[s]] && !PEOPLE[a[s]].special) onMon.push(a[s]) })))
    const who = onMon.find(id => id !== 'ad' && !(PEOPLE as any)[id].admin) || onMon[0]
    expect(who, 'the seed puts someone on next Monday').toBeTruthy()
    expect(JSON.stringify(nextMondaySeed(W1)), 'before the delete').toContain(`"${who}"`)
    expect(deletePerson(who)).toBe(null)
    expect(JSON.stringify(nextMondaySeed(W1)), 'after it: the seed read without him').not.toContain(`"${who}"`)
  })

  /* FABLE'S ROUND-2 READ OF THE PHASE-6 PLAN, F1 (step 2): the version-load belt took a deleted man's landed row by the
     NAME the version's row carried — a request handed to another man since, then its former holder deleted, lost its new
     holder's row at the load door, though every read keeps it (the current-holder rule, engine/overlay.ts hisLanded) */
  it('the version-load belt decides a landed row by the request\'s CURRENT holder: handed on, then the old holder deleted — the row stays', async () => {
    await boot(new MemoryBackend())
    INPUTS.unshift({ iid: 'p6dL', person: 'stiff', date: 'Jul 17', yr: 2026, allday: true, type: 'Meeting', mod: 'now' } as any)
    Object.assign((PEOPLE as any).pike, { deleted: true, deletedFrom: '2026-07-15' })
    const nd: any = JSON.parse(JSON.stringify(DAYS[TO_COME]))
    nd.ground = [{ prog: 'MEETING', who: 'pike', src: 'p6dL', str: '', end: '' }, { prog: 'HIS', who: 'pike', src: 'gone-p6d', str: '', end: '' }]
    stripDeletedFromDay(TO_COME, nd)
    expect(nd.ground.map((r: any) => r.src), 'Stiff\'s request keeps its row; the gone request of the deleted man leaves').toEqual(['p6dL'])
  })

  it('a saved plan parked on a day to come of a week opened later is read without him', async () => {
    await boot(new MemoryBackend())
    loadWeek(W2)
    const d = JSON.parse(JSON.stringify(DAYS[2])); d.ground = [{ prog: 'PLAN', who: HIM, str: '0900', end: '1000' }]
    schedWrite(SCHED_TYPES.mutate, () => {
      SCHED.drafts = SCHED.drafts || {}
      ;(SCHED.drafts as any)[2] = [{ id: 'pq', name: 'Plan Q', d, sign: { cur: HIM, sked: '', plan: '', appr: '' }, signBind: {} }]
      ;(DAYS[2] as any).notes.push({ t: 'P6D PLAN' })
    })
    loadWeek(W1)
    expect(deletePerson(HIM)).toBe(null)
    loadWeek(W2)
    const t = (SCHED.drafts as any)[2][0]
    expect(JSON.stringify(t.d), 'the plan\'s day').not.toContain(`"${HIM}"`)
    expect(t.sign.cur, 'the plan\'s sign-off').toBe('')
  })

  /* THE FULL CHECK'S BREAK TESTS (30 Sep 26, bug-check order §8.4): four doors of the overlay could be broken on purpose
     with every test above still green — so they had no test, by proof. Each test below goes red with its door broken. */
  it('a reload with NO week ever saved (the boot reads the seed) shows the week without him from his cutoff', async () => {
    const be = new MemoryBackend()
    const wb = await boot(be)
    expect(personKeysOnDay(2, HIM).length, 'the seed has him flying Wednesday').toBeGreaterThan(0)
    expect(deletePerson(HIM)).toBe(null)
    await vi.advanceTimersByTimeAsync(1000)
    expect(wb.keys('weeks').filter(k => k.startsWith(weekId(W1))), 'no row of this week was ever written').toEqual([])
    resetWorld()
    await boot(be)
    expect(PEOPLE[HIM].deleted, 'read back deleted').toBeTruthy()
    expect([personKeysOnDay(2, HIM), personKeysOnDay(3, HIM)], 'Wednesday and Thursday — days to come, from the seed').toEqual([[], []])
    expect(personKeysOnDay(1, HIM).length, 'Tuesday — a day he flew').toBeGreaterThan(0)
  })

  it('the next-week peek of a week NEVER saved, drawn before the delete, is drawn again without him after it', async () => {
    await boot(new MemoryBackend())
    Object.defineProperty(window, 'innerWidth', { value: 1440, configurable: true, writable: true })
    const cs = String((PEOPLE as any)[HIM].cs)
    const puckOf = (html: string) => new RegExp(`>${cs}<`).test(html)
    const before = peekWeekHTML()
    expect(puckOf(before), 'next Monday (the seed) has him flying — the peek draws his puck').toBe(true)
    expect(deletePerson(HIM)).toBe(null)
    expect(puckOf(peekWeekHTML()), 'after the delete — the warmed peek is not served again, and the seed is read without him').toBe(false)
  })

  it('the row finder, read before the delete, reads a saved week again without him after it (an extra on another man\'s row)', async () => {
    await boot(new MemoryBackend())
    INPUTS.unshift({ iid: 'p6dX', person: 'stiff', date: 'Jul 22', yr: 2026, allday: true, type: 'Meeting', mod: 'now' } as any)
    loadWeek(W2)                                         // the week's load lands Saber's meeting on Wednesday
    schedWrite(SCHED_TYPES.mutate, () => {
      const r: any = ((DAYS[2] as any).ground || []).find((g: any) => g && g.src === 'p6dX')
      r.more = [HIM]                                     // the scheduler puts Hex on it as an extra (D18)
    })
    loadWeek(W1)
    const warm = stashGroundBySrc(W2)
    expect(warm && warm.get('p6dX')!.row.more, 'before: he is an extra on Saber\'s meeting row').toContain(HIM)
    expect(deletePerson(HIM)).toBe(null)
    const after = stashGroundBySrc(W2)
    expect(after && after.get('p6dX'), 'Saber\'s row stays').toBeTruthy()
    expect(after!.get('p6dX')!.row.more || [], 'after: he is gone from it — the memo was not served again').not.toContain(HIM)
  })

  /* FABLE'S FINAL READ, F1 (30 Sep 26): the week ON SCREEN held read-only (a saved book this build cannot edit) — the delete
     was made there and the overlay took him off the screen, while a reload showed him again (a read-only week is shown as
     saved). The same week off screen refuses the delete. One rule now: refused whichever week is on screen. */
  it('the week on screen held read-only, him on a day to come: the delete is refused, as it is for that week off screen', async () => {
    await boot(new MemoryBackend())
    planDuty(TO_COME)
    setPreservedBlob(W1, JSON.stringify({ d: DAYS }))
    try {
      expect(deletePerson(HIM), 'refused in the week\'s words').toBe(`The week of ${W1} can't be changed — the delete was not made`)
      expect(PEOPLE[HIM].deleted, 'not deleted').toBeFalsy()
      expect(personKeysOnDay(TO_COME, HIM).length, 'still on the day to come').toBeGreaterThan(0)
    } finally { clearPreservedBlob(W1) }
  })

  it("a saved week's own sign-off box naming him on a day to come is read empty when the week is opened", async () => {
    await boot(new MemoryBackend())
    loadWeek(W2)
    schedWrite(SCHED_TYPES.mutate, () => { setSign(1, 'cur', HIM); (DAYS[1] as any).notes.push({ t: 'P6D SIGN' }) })
    loadWeek(W1)
    expect(deletePerson(HIM)).toBe(null)
    loadWeek(W2)
    expect(SCHED.sign[1].cur, 'read without him').toBe('')
  })
})
