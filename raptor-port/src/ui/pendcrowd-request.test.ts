/* THE CHANGES LIST NAMES A REQUEST ROW'S CROWD CHANGE BY ITS ROW, AND GOES TO IT (Fable's final read, F3 —
   [DB-READINESS] group A, phase 7).

   On a published day, a change in who stands behind an ALL / ALL AVAIL puck is one line of the "To go out" list: the
   row's name, who left, who joined, and a tap that takes the schedule to it (D99, D44). The line was found by the row's
   own id — and a REQUEST's row is addressed by its request (`i:<request id>`), which that lookup never resolved. So a
   request row's crowd change read "A placeholder · who it stands for": no row named, nothing to tap.

   RE-BUILT ON THE ONE RULE ([ALL-AVAIL-AS-MEMBER] step 2; owner D755, D753, D712 — the plan
   docs/superpowers/plans/2026-10-11-one-rule-plan.md §4.3, §4.7). A request's row has a crowd only where the
   placeholder is one of the INPUT's own people: an input FILED for ALL AVAIL alone, and — since step 3 of the build
   (12 Oct 26; D750, D753, D755, D757) — ALL AVAIL BESIDE a named man in his request, which is the case this file was
   first written for. Then it wrote the puck straight onto the man's row (`more: ['allavail']` — the row's own extra,
   D46); a raw write is swept by the re-make now, and the door makes one instead: it is put in the input, by the row's
   door or held in the record's list, and the row is landed from the input by the engine's own body (overlay.ts
   viewOfWeek), never written by hand. And a Personal request's row holds no placeholder at all (D755 (4): "a Personal
   input is one person's own") — phase 7's "a Personal row reaches the line too" went with that: what is pinned for it
   now is that the hand is refused, and that such a row has no crowd to change. */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from '../engine/data'
import { INPUTS, idsOf, placeholderOf } from '../engine/inputs'
import { HOOKS } from '../engine/hooks'
import { SCHED, signOf, setDayApproved, dayHasChanges } from '../engine/publish'
import { ensureRowIds } from '../engine/rowids'
import { viewOfWeek } from '../engine/overlay'
import { fillSlot, setSlotVal } from '../engine/slots'
import { writeFill } from '../state/store'
import { setSession } from '../state/auth'
import { rowPut } from './reqdoor'
import { pendListHTML } from './pendlist'

const DSNAP = JSON.stringify(DAYS)
const ISNAP = JSON.stringify(INPUTS)
const TUE = 1, TUE_ISO = '2026-07-14'
const earningDay = HOOKS.oilEarningDay, dayISO = HOOKS.oilDayISO, sentinel = HOOKS.oilSentinel, toast = HOOKS.toast
let CROWD = ['bane', 'stiff', 'plasma']

beforeEach(() => {
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
  SCHED.pending = {}; SCHED.changes = {}; SCHED.added = {}; SCHED.als = []
  SCHED.al = 0; SCHED.dayOK = {}; SCHED.sign = {}; SCHED.signBind = {}; SCHED.orig = {}; SCHED.cur = {}
  SCHED.drafts = {}; SCHED.curDraft = {}; SCHED.correcting = {}
  Object.assign(DAYS[TUE] as any, { waves: [], dutywaves: [], sims: {}, ground: [], allhands: [], oild: undefined })
  ensureRowIds(DAYS)
  CROWD = ['bane', 'stiff', 'plasma']
  HOOKS.oilEarningDay = () => false
  HOOKS.oilDayISO = (di: number) => (di === TUE ? TUE_ISO : '2026-07-15')
  HOOKS.oilSentinel = () => CROWD.slice()
})
afterEach(() => { HOOKS.oilEarningDay = earningDay; HOOKS.oilDayISO = dayISO; HOOKS.oilSentinel = sentinel; HOOKS.toast = toast; setSession(null) })

const publish = (di: number) => {
  const g = signOf(di); g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump'
  setDayApproved(di, true)
}
/* a request for the Tuesday, 09:00–17:00, its row LANDED from it — the engine's own landing, as every read of the week
   makes it (the row is a whole copy of the input: its name, its times, its people) */
const request = (over: any) => {
  INPUTS.unshift({ iid: 'rq1', by: 'stiff', at: 1, date: 'Jul 14', yr: 2026, allday: false, s: 9 * 60, e: 17 * 60, remarks: '', mod: '2026-07-01', ...over })
  viewOfWeek('13/07/2026', DAYS as any[], { loaded: true, issued: () => null })
  ensureRowIds(DAYS)
  const rows = ((DAYS[TUE] as any).ground as any[]).filter(g => g && g.src === 'rq1')
  expect(rows, 'ONE row, on its day').toHaveLength(1)
  return rows[0]
}

describe('a request row\'s crowd change is named by its row and can be tapped (Fable F3)', () => {
  /* the input filed for ALL AVAIL alone, in the shape the list holds it since the build (`people`) and in the shape a
     record stored before it has (`person`) — one row, one crowd, one line either way. Then the day is published, and
     one man is no longer free — for a reason that is NOT an input (so the line is the crowd's own, never folded into a
     leave's) */
  it.each([
    ['its list of people', { people: [{ p: 'allavail', by: 'stiff', at: 1 }] }],
    ['one person (a record stored before the build)', { person: 'allavail' }],
  ])('a Training request FILED for ALL AVAIL — held as %s', (_shape, who) => {
    const row = request({ type: 'Training', ...who })
    expect([row.prog, row.who, row.more], 'the placeholder stands in the row\'s name box').toEqual(['TRAINING', 'allavail', undefined])
    publish(TUE)
    expect(dayHasChanges(TUE), 'published clean').toBe(false)
    CROWD = ['bane', 'stiff']
    expect(dayHasChanges(TUE), 'the crowd changed: the day reads pending').toBe(true)
    const html = pendListHTML(TUE)
    expect(html).toContain('TRAINING · who it stands for')
    expect(html, 'never the nameless line').not.toContain('A placeholder')
    expect(html, 'and it is a line you can tap to go there').toMatch(/<button class="pl-item" data-plix="\d+"/)
  })

  /* ALL AVAIL UNDER A NAMED MAN'S REQUEST — the case this file began with ("a Training request's row", `who: 'ignite',
     more: ['allavail']`, written by hand). A NAMED RULING CHANGED THE RULE (2): then the puck was the row's own extra
     (D46) and its crowd was filed under the man's request; D755 makes it one of the INPUT's people ("a named person or
     ALL AVAIL / ALL, whoever put them there"), D750 ties it to no man. What the case pinned survives: the crowd's
     change is named by the row and can be tapped. Made the two ways the app makes it — held in the record's list (an
     input filed for a man and ALL AVAIL), and put on the man's row through its door. */
  it.each([
    ['filed for him and ALL AVAIL together', (): void => { request({ type: 'Training', people: [{ p: 'ignite', by: 'stiff', at: 1 }, { p: 'allavail', by: 'stiff', at: 1 }] }) }],
    ['ALL AVAIL put on his row through the row\'s door', (): void => {
      const row = request({ type: 'Training', people: [{ p: 'ignite', by: 'stiff', at: 1 }] })
      expect([row.who, row.more], 'as he filed it: his row, him alone').toEqual(['ignite', undefined])
      setSession({ user: 'ad', role: 'admin', name: 'ad' })
      expect(rowPut(`g:${TUE}.${((DAYS[TUE] as any).ground as any[]).indexOf(row)}.+`, 'allavail'), 'the row\'s door').toBe('done')
      viewOfWeek('13/07/2026', DAYS as any[], { loaded: true, issued: () => null })
      ensureRowIds(DAYS)
    }],
  ])('a NAMED man\'s Training request with ALL AVAIL beside him — %s (D755, D750)', (_how, make) => {
    HOOKS.toast = () => {}
    make()
    const rows = ((DAYS[TUE] as any).ground as any[]).filter(g => g && g.src === 'rq1')
    expect(rows, 'ONE row').toHaveLength(1)
    expect(idsOf(INPUTS.find((r: any) => r.iid === 'rq1')).map(String), 'it is IN the input').toEqual(['ignite', 'allavail'])
    expect([rows[0].prog, rows[0].who, rows[0].more], 'the man in the name box, the placeholder under him').toEqual(['TRAINING', 'ignite', ['allavail']])
    publish(TUE)
    expect(dayHasChanges(TUE), 'published clean').toBe(false)
    CROWD = ['bane', 'stiff']
    expect(dayHasChanges(TUE), 'the crowd changed: the day reads pending').toBe(true)
    const html = pendListHTML(TUE)
    expect(html).toContain('TRAINING · who it stands for')
    expect(html, 'never the nameless line').not.toContain('A placeholder')
    expect(html, 'and it is a line you can tap to go there').toMatch(/<button class="pl-item" data-plix="\d+"/)
  })

  /* …and the man NAMED in the input is never one of the men behind its ALL AVAIL (the plan §4.7: the crowd written
     down never holds a named person) — so whether he reads "free" or not is no change to who the puck stands for:
     nothing is waiting, and no line is drawn for it. */
  it('the man named beside ALL AVAIL is not behind it: his own coming and going from "who is free" is nothing waiting on the published day', () => {
    CROWD = ['ignite', 'bane', 'stiff', 'plasma']
    request({ type: 'Training', people: [{ p: 'ignite', by: 'stiff', at: 1 }, { p: 'allavail', by: 'stiff', at: 1 }] })
    publish(TUE)
    expect(dayHasChanges(TUE), 'published clean').toBe(false)
    CROWD = ['bane', 'stiff', 'plasma']
    expect(dayHasChanges(TUE), 'he was never one of them').toBe(false)
    expect(pendListHTML(TUE)).not.toContain('who it stands for')
    CROWD = ['bane', 'stiff']
    expect(dayHasChanges(TUE), 'THE CONTROL: a man who IS behind it going is a change').toBe(true)
    expect(pendListHTML(TUE)).toContain('TRAINING · who it stands for')
  })

  /* A PERSONAL REQUEST'S ROW — the subject phase 7 added here ("a Personal row reaches it too") cannot exist: ALL AVAIL
     put on it is refused at the store's writer, at the row's door and at the engine's belt, so the row has no crowd,
     and a change in who is free is nothing waiting on its published day — no line, named or nameless. (The drop
     itself, and the row's missing count chip, are ui/oilpersonalcrowd.test.tsx.) THE REFUSAL'S WORDS CHANGED WITH STEP 3
     (2): "ALL AVAIL can be filed only for Training, Meeting, Appointment, Duty, Event or Other" was the sentence of an
     input FILED for the placeholder; now that it is one of an input's people the six kinds are said as the plan's
     table says them (§4.4; D753 reading 3, D755 (4)) — one sentence at every door, each hand saying it once. */
  it('a Personal request\'s row holds no placeholder (D755 (4)): ALL AVAIL put on it is refused, so it has no crowd change to name', () => {
    const row = request({ type: 'Personal', person: 'ignite' })
    const ri = ((DAYS[TUE] as any).ground as any[]).indexOf(row), add = `g:${TUE}.${ri}.+`
    const was = JSON.stringify([INPUTS, row])
    const said: string[] = []
    HOOKS.toast = (m: any) => { said.push(String(m)) }
    setSession({ user: 'ad', role: 'admin', name: 'ad' })
    writeFill(add, 'allavail')
    expect(rowPut(add, 'allavail'), 'the row\'s door').toBe('refused')
    expect(fillSlot(add, 'allavail'), 'the engine\'s belt: a raw write to its "+ add"').toBe(false)
    expect(setSlotVal(`g:${TUE}.${ri}`, 'allavail'), '…and to its name box').toBe(false)
    const WHY = 'ALL AVAIL is for Training, Meeting, Appointment, Duty, Event and Other'
    expect(said, 'refused with its reason — once by the store\'s writer, once by the door; the belt is silent').toEqual([WHY, WHY])
    expect(JSON.stringify([INPUTS, row]), 'nothing changed').toBe(was)
    expect(idsOf(INPUTS[0]).map(String)).toEqual(['ignite'])
    expect(placeholderOf(INPUTS[0]), 'no placeholder in the input').toBeFalsy()
    expect([row.who, row.more], 'nor on its row').toEqual(['ignite', undefined])
    publish(TUE)
    CROWD = ['bane', 'stiff']
    expect(dayHasChanges(TUE), 'who is free changed, and nothing on this day stands for them: nothing is waiting').toBe(false)
    const html = pendListHTML(TUE)
    expect(html).not.toContain('who it stands for')
    expect(html).not.toContain('A placeholder')
  })

  it('THE CONTROL: a hand-built row reads as it always did', () => {
    ;(DAYS[TUE] as any).ground = [{ prog: 'OPS BRIEF', str: '0900', end: '1700', who: 'allavail' }]
    ensureRowIds(DAYS)
    publish(TUE)
    CROWD = ['bane', 'stiff']
    const html = pendListHTML(TUE)
    expect(html).toContain('OPS BRIEF · who it stands for')
    expect(html).toMatch(/<button class="pl-item" data-plix="\d+"/)
  })
})
