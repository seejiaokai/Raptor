// @vitest-environment jsdom
/* A DELETE AND AN INPUT HE SHARES — what the delete does to an input that holds OTHER PEOPLE TOO (the break tests of the
   one-rule job's full check, 12 Oct 26: docs/handpass/parts/or-wires-3.md, wire 24; the plan
   docs/superpowers/plans/2026-10-11-one-rule-plan.md §4.6 — "a posting's trim of his dates"; owner D299: the past keeps
   its record of him, today and the future lose him; D756: an input is one record with the list of its people).

   state/person-delete.test.ts holds the three outcomes for an input that is HIS ALONE (kept / ended the day before /
   gone). For a shared one, only "from his last day on he leaves its list" was held anywhere, and only through the
   bell's notices (ui/bellnotices-scenarios.test.tsx). The third outcome — a shared input that SPANS his last day — was
   held by nothing: broken on purpose so that it ended for EVERYONE the day before, with him still in it, no test went
   red. These cases are the three outcomes for a shared input, through the real writer and the real delete.

   The clock is fixed at 15 Jul 26, as in person-delete.test.ts: the 14th is a day he was here, the 15th on are to come. */
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { storeBackend, HOOKS } from '../engine/hooks'
import { PEOPLE, indexCallsigns } from '../engine/people'
import { INPUTS, idsOf, holds } from '../engine/inputs'
import { initStore, resetSession, notify } from './store'
import { accountsLoad, signIn, sessionFor } from './accounts'
import { deletePerson, deleteCutoff } from './person-delete'
import { commitInput, draftOf } from '../ui/inputedit'

const mem: Record<string, string> = {}
let PEOPLE0 = ''
const ISNAP = JSON.stringify(INPUTS)
const toast = HOOKS.toast
let said: string[] = []
const signInAs = (name: string, pass = 'x') => { resetSession(sessionFor(signIn(name, pass))); notify() }
const HIM = 'rocky', A = 'bane', B = 'casper'        // Hex — deleted; Ranger and Outlaw stay
const WORDS = 'Exercise — off island'
/* a duty away filed by the admin for the three of them, through the input's one writer */
const file = (date: string, endDate?: string) =>
  expect(commitInput(null, draftOf({ person: HIM, type: 'OD', date, ...(endDate ? { endDate } : {}), yr: 2026, allday: true, remarks: WORDS }), [HIM, A, B]), `filed: ${said.join(' | ')}`).toBe(true)
const theirs = () => (INPUTS as any[]).filter(r => r.type === 'OD' && String(r.remarks || '').startsWith(WORDS))
const span = (r: any) => `${r.date}${r.endDate ? ' – ' + r.endDate : ''}`

beforeAll(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date(2026, 6, 15, 9, 0, 0))
  PEOPLE0 = JSON.stringify(PEOPLE)
})
afterAll(() => { vi.useRealTimers(); storeBackend.impl = null })
beforeEach(() => {
  Object.keys(mem).forEach(k => delete mem[k])
  storeBackend.impl = { getItem: (k: string) => (k in mem ? mem[k]! : null), setItem: (k: string, v: string) => { if (v === 'null') delete mem[k]; else mem[k] = v }, keys: () => Object.keys(mem) }
  const p0 = JSON.parse(PEOPLE0)
  for (const k of Object.keys(PEOPLE)) delete (PEOPLE as any)[k]
  Object.assign(PEOPLE, p0); indexCallsigns()
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
  initStore(); accountsLoad()
  said = []; HOOKS.toast = (m: any) => { said.push(String(m)) }
  signInAs('ad', 'a')
})
afterEach(() => { HOOKS.toast = toast; resetSession(null) })

describe('a delete and an input he shares with others (D299, D756; the one-rule plan §4.6)', () => {
  it('wholly before his last day: nothing of it moves — the past keeps its record of him', () => {
    file('Jul 9', 'Jul 10')
    const [r] = theirs()
    const was = JSON.stringify(r)
    expect(deleteCutoff()).toBe('2026-07-15')
    expect(deletePerson(HIM)).toBe(null)
    expect(theirs()).toHaveLength(1)
    expect(JSON.stringify(theirs()[0]), 'the same record, he still in it').toBe(was)
  })
  it('wholly from his last day on: he leaves its list; the others keep the SAME input, its days as they were', () => {
    file('Jul 20', 'Jul 22')
    const iid = theirs()[0].iid
    expect(deletePerson(HIM)).toBe(null)
    expect(theirs(), 'one input still — not deleted with him, and none made for him').toHaveLength(1)
    const r = theirs()[0]
    expect(r.iid).toBe(iid)
    expect(idsOf(r).map(String)).toEqual([A, B])
    expect(span(r)).toBe('Jul 20 – Jul 22')
  })
  it('SPANNING his last day: the others keep it WHOLE without him; his own part is an input of his own that ends the day before', () => {
    file('Jul 14', 'Jul 18')
    const iid = theirs()[0].iid
    expect(deletePerson(HIM)).toBe(null)
    const shared = theirs().find(r => r.iid === iid)
    expect(shared, 'the input the others share is still there').toBeTruthy()
    expect(idsOf(shared).map(String), 'he is out of it').toEqual([A, B])
    expect(span(shared), 'and it runs to its own last day for the two who stay — never cut short at HIS').toBe('Jul 14 – Jul 18')
    const own = theirs().filter(r => r.iid !== iid)
    expect(own, 'his part: one input of his own').toHaveLength(1)
    expect(idsOf(own[0]).map(String)).toEqual([HIM])
    expect(holds(own[0], A) || holds(own[0], B)).toBe(false)
    expect(span(own[0]), 'the day he was still here, and no further').toBe('Jul 14')
  })
})
