/* A CHANGE MADE FROM THE SCHEDULE NEVER MAKES AN ON-TIME INPUT READ LATE — his D741 and D742 (10 Oct 26):
   "for all types of input if the scheduler changes the input on the schedule the input will change too? But it will
   not show as late if the input initially was on time and the change was done inside the late window" — yes to both.

   The plan: docs/superpowers/plans/2026-10-10-group-input-one-row-plan.md §4.6. The mark reads the record's `mod`
   (engine/inputs.ts isLateInput) and every save stamped it — so a scheduler typing a time or a remark on an input's row
   under Personal Inputs or on the Unavailable list (ui/inputedit.tsx setInpField), or dropping a different man on an
   Unavailable row (reassignInput), turned a leave filed in good time LATE. Those are the doors reached only from a row
   on the schedule; they leave `mod` alone now, for someone who may edit the schedule. The input's own window still
   stamps it, whoever saves and wherever it was opened from (D742 reading 3); an input already LATE stays LATE (D741
   reading 2); who changed it and when is still recorded (D739).

   ON THE ONE RECORD (the one-rule build, D756): the input a man is IN is found through the one reader of who is in an
   input (engine/inputs.ts holds, idsOf) — never a record's `person`; and the late mark of one man of several is read on
   his LINE of it (inputLines), which carries his own late date where he has one.

   Runs in the Leave War project (a hostile time zone), with both stores wired, as `whoplaced.test.ts` does: ONE clock,
   set by day.
   Behaviour register: GI2, GI3. */
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { storeBackend, HOOKS } from '../engine/hooks'
import { PEOPLE, indexCallsigns } from '../engine/people'
import { INPUTS, entryOf, holds, idsOf, inputLines, isLateInput, inputOwnDueISO } from '../engine/inputs'
import { elogClear } from '../engine/editlog'
import { initStore as raptorInitStore, notify as raptorNotify, resetSession } from '../state/store'
import { accountsLoad, signIn, sessionFor } from '../state/accounts'
import { installGlobalUndo } from '../state/undo-wire'
import { _resetTimeline } from '../undo/timeline'
import { commitInput, commitNewInput, commitInputEdit, draftOf, setInpField, reassignInput } from '../ui/inputedit'
import { initStore as lwInitStore, lwHistInit, setPeople } from './state/store'
import { memoryBackend } from './state/storage'
import { projectPeople } from './state/raptorRoster'
import { wireLeaveWarSync } from './sync'

const mem: Record<string, string> = {}
let PEOPLE0 = ''
const ISNAP = JSON.stringify(INPUTS)
const toast = HOOKS.toast

/* the clock, by calendar day (09:00) — returns the moment a stamp made now must carry */
const on = (iso: string): number => { const [y, m, d] = iso.split('-').map(Number); const t = new Date(y!, m! - 1, d!, 9, 0, 0); vi.setSystemTime(t); return t.getTime() }
const signInAs = (name: string, pass = 'x') => { resetSession(sessionFor(signIn(name, pass))); raptorNotify() }
const saber = () => signInAs('ad', 'a')        // the admin — person `stiff`
const ranger = () => signInAs('us', 'us')      // a member — person `bane`

/* the inputs under test sit in the week of Mon 14 Sep 26: filed in July they are in good time, and a change on the
   Thursday of that week is after any cut-off */
const DAY = '2026-09-16'
const EARLY = '2026-07-15'
const AFTER = '2026-09-17'
const add = (person: string, type: string, extra: Record<string, any> = {}) => commitNewInput({
  person, type, allday: true, half: '', start: DAY, end: '', sTime: '06:00', eTime: '18:00', remarks: '', sans: null, docIds: [], ...extra,
})
const one = (p: string, type: string) => { const l = INPUTS.filter((r: any) => holds(r, p) && r.type === type && String(r.date).startsWith('Sep')); expect(l, `${p} has one ${type}`).toHaveLength(1); return l[0] }

beforeAll(() => { vi.useFakeTimers({ toFake: ['Date'] }); PEOPLE0 = JSON.stringify(PEOPLE) })
afterAll(() => { vi.useRealTimers(); storeBackend.impl = null })
beforeEach(() => {
  on(EARLY)
  Object.keys(mem).forEach(k => delete mem[k])
  storeBackend.impl = { getItem: (k: string) => (k in mem ? mem[k]! : null), setItem: (k: string, v: string) => { mem[k] = v } }
  const p0 = JSON.parse(PEOPLE0)
  for (const k of Object.keys(PEOPLE)) delete (PEOPLE as any)[k]
  Object.assign(PEOPLE, p0); indexCallsigns()
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
  lwInitStore(memoryBackend())
  raptorInitStore()
  accountsLoad()
  setPeople(projectPeople())
  wireLeaveWarSync()
  _resetTimeline(); lwHistInit(); installGlobalUndo(); elogClear()
  HOOKS.toast = () => {}
  saber()
})
afterEach(() => { HOOKS.toast = toast; _resetTimeline(); resetSession(null) })

describe('a change made from a row on the schedule does not move the late date (D741, D742)', () => {
  it('THE SETUP HOLDS — filed in July it is on time, and the Thursday of its week is past its deadline', () => {
    expect(add('bane', 'LL')).toBe(true)
    const r = one('bane', 'LL')
    expect(inputOwnDueISO(r) < AFTER, 'the deadline is before the day the scheduler types').toBe(true)
    expect(isLateInput(r)).toBe(false)
  })

  for (const [type, extra, field, text] of [
    ['LL', {}, 'rmks', 'back by lunch'],                                              // leave, on the Unavailable list
    ['OD', {}, 'rmks', 'det to the north'],                                           // an overseas duty, on the Unavailable list
    ['Training', { allday: false, sTime: '11:00', eTime: '12:00' }, 'str', '1015'],   // a request, under Personal Inputs
  ] as const) {
    it(`${type}: a ${field === 'rmks' ? 'remark' : 'time'} typed on its row after the cut-off leaves it on time — and says who changed it`, () => {
      expect(add('bane', type, extra)).toBe(true)
      const r = one('bane', type)
      const filed = r.mod
      const t = on(AFTER)
      expect(setInpField(r, field, text)).toBe(true)
      expect(field === 'rmks' ? r.remarks : r.s, 'the input itself changed (D742)').toBe(field === 'rmks' ? text : 10 * 60 + 15)
      expect(r.mod, 'the late date is as it was').toBe(filed)
      expect(isLateInput(r), 'so it does not read LATE').toBe(false)
      expect({ modBy: r.modBy, modAt: r.modAt }, 'the scheduler is named, at the moment he did it (D739)').toEqual({ modBy: 'stiff', modAt: t })
    })
  }

  it('THE CONTROL — the same change in the input’s own window after the cut-off reads LATE, as today (D742 reading 3)', () => {
    expect(add('bane', 'LL')).toBe(true)
    const r = one('bane', 'LL')
    on(AFTER)
    expect(commitInputEdit(r, { ...draftOf(r), remarks: 'back by lunch' })).toBe(true)
    expect(isLateInput(r)).toBe(true)
  })

  it('an input that already reads LATE stays LATE (D741 reading 2)', () => {
    on(AFTER)
    expect(add('bane', 'LL')).toBe(true)
    const r = one('bane', 'LL')
    expect(isLateInput(r), 'filed late').toBe(true)
    on('2026-09-18')
    expect(setInpField(r, 'rmks', 'back by lunch')).toBe(true)
    expect(r.mod, 'still the day it was filed').toBe(AFTER)
    expect(isLateInput(r)).toBe(true)
  })

  it('a different man dropped on an Unavailable row after the cut-off: the input is his, and still on time (D742 reading 3)', () => {
    expect(add('bane', 'LL')).toBe(true)
    const r = one('bane', 'LL')
    const filed = r.mod
    on(AFTER)
    expect(reassignInput(r.iid, 'rocky')).toBe(true)
    expect(idsOf(r), 'the one record, re-pointed').toEqual(['rocky'])
    expect(r.mod).toBe(filed)
    expect(isLateInput(r)).toBe(false)
  })

  /* THE SAME RULE FOR WHO IS IN IT (the one-rule build — owner D756; the plan 2026-10-11-one-rule-plan.md §4.1, §4.4:
     "only the person added can be late", his own date riding his entry of the input's list — and "a person added from
     the schedule … never reads late", D741). An input is ONE record now, so a man put on its row is put IN the input:
     done from the schedule after the cut-off, nobody reads late — not him, not the others, not the input. THE CONTROL:
     the same add in the input's own window marks him, and him alone. */
  it('a man put into an input from its row on the schedule after the cut-off is not late — nor is anyone in it; in the input’s own window he alone would be (D741)', () => {
    expect(commitInput(null, { type: 'Training', allday: false, half: '', start: DAY, end: '', sTime: '11:00', eTime: '12:00', remarks: '', sans: null, docIds: [] }, ['bane', 'rocky'])).toBe(true)
    const r = one('bane', 'Training')
    const filed = r.mod
    const late = () => Object.fromEntries(inputLines([one('bane', 'Training')]).map((l: any) => [l.person, isLateInput(l)]))
    const t = on(AFTER)
    expect(commitInput(r, draftOf(r), ['bane', 'rocky', 'casper'], { sched: true }), 'the scheduler drops Outlaw on its row').toBe(true)
    expect(idsOf(one('bane', 'Training')), 'one record, the three in it').toEqual(['bane', 'rocky', 'casper'])
    expect(late()).toEqual({ bane: false, rocky: false, casper: false })
    expect(entryOf(one('bane', 'Training'), 'casper'), 'put in by the scheduler, at that moment — with no late date of his own').toEqual({ p: 'casper', by: 'stiff', at: t, h: 1 })
    expect(one('bane', 'Training').mod, 'the input’s late date is as it was').toBe(filed)
    expect(isLateInput(one('bane', 'Training'))).toBe(false)
    const r2 = one('bane', 'Training')
    expect(commitInput(r2, draftOf(r2), ['bane', 'rocky', 'casper', 'harpoon']), 'the control: the same add in its own window').toBe(true)
    expect(late()).toEqual({ bane: false, rocky: false, casper: false, harpoon: true })
    expect(entryOf(one('bane', 'Training'), 'harpoon').mod).toBe(AFTER)
    expect(one('bane', 'Training').mod, 'and still not the input’s').toBe(filed)
  })

  it('ONLY for someone who may edit the schedule — a member’s own call to the same door is an ordinary save, and stamps', () => {
    ranger()
    expect(add('bane', 'LL')).toBe(true)
    const r = one('bane', 'LL')
    on(AFTER)
    expect(setInpField(r, 'rmks', 'changed my mind')).toBe(true)
    expect(r.mod).toBe(AFTER)
    expect(isLateInput(r), 'his own late change is late').toBe(true)
  })
})
