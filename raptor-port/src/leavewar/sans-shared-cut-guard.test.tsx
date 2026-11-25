/* A SHARED SANS OFFER MOVED EARLIER IS REFUSED WHOLE, NEVER TRIMMED (his D2394 Q10, as built in round 7): "Take him out of
   this offer to add earlier days." The cut at a man's SANS date (D2388) trims only a one-man filing of his own; a record that
   holds several is never cut by it. The input window sends such a record through the shared door (commitInput), whose
   up-front refusal stops it first — but the one-record door (commitInputEdit) leans on the cut's own guard in
   ui/inputedit.tsx sansCut ("idsOf(except).length > 1"), and chat 174's break tests (25 Nov 26) found no test held that
   guard: with it removed, the one-record door trimmed the shared offer and every other test stayed green. This pins both
   doors. The fixture is sans-words-156.test.tsx's: the demo week of Mon 13 Jul 26, today Wed 15 Jul; `rocky` is Hex,
   `bane` is Ranger; Saber the admin ("ad"). */
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import { HOOKS, storeBackend } from '../engine/hooks'
import { PEOPLE, indexCallsigns } from '../engine/people'
import { initStore as raptorInitStore, notify as raptorNotify, resetSession } from '../state/store'
import { accountsLoad, signIn, sessionFor } from '../state/accounts'
import { INPUTS, idsOf } from '../engine/inputs'
import { DAYS } from '../engine/data'
import { SCHED } from '../engine/publish'
import { stashClear } from '../engine/weekstash'
import { NOTICES } from '../state/notices'
import { commitInput, commitInputEdit, draftOf } from '../ui/inputedit'
import { setInpEdit } from '../ui/pops'
import { _resetFloatWins } from '../ui/winorder'
import { installGlobalUndo } from '../state/undo-wire'
import { _resetTimeline } from '../undo/timeline'
import { initStore as lwInitStore, setPeople } from './state/store'
import { memoryBackend } from './state/storage'
import { projectPeople } from './state/raptorRoster'
import { postOut, wireLeaveWarSync } from './sync'

const mem: Record<string, string> = {}
let PEOPLE0 = '', DAYS0 = '', INPUTS0 = ''
const signInAs = (name: string, pass = 'x') => { resetSession(sessionFor(signIn(name, pass))); raptorNotify() }
const FRI = '2026-07-17', THU23 = '2026-07-23', FRI24 = '2026-07-24', SAT25 = '2026-07-25'
const draft = (start: string, end?: string, person = 'rocky') => ({ _new: true, person, type: 'SANS Availability', start, ...(end ? { end } : {}), allday: true, s: 360, e: 1080, sans: { f: true } })
const shared = () => INPUTS.find((r: any) => r.type === 'SANS Availability' && idsOf(r).map(String).includes('rocky') && idsOf(r).map(String).includes('bane')) as any
const realToast = HOOKS.toast

beforeAll(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  PEOPLE0 = JSON.stringify(PEOPLE); DAYS0 = JSON.stringify(DAYS); INPUTS0 = JSON.stringify(INPUTS)
})
afterAll(() => { vi.useRealTimers(); storeBackend.impl = null })
beforeEach(() => {
  vi.setSystemTime(new Date(2026, 6, 15, 9, 0, 0))
  Object.keys(mem).forEach(k => delete mem[k])
  storeBackend.impl = { getItem: (k: string) => (k in mem ? mem[k]! : null), setItem: (k: string, v: string) => { mem[k] = v }, keys: () => Object.keys(mem) }
  const p0 = JSON.parse(PEOPLE0)
  for (const k of Object.keys(PEOPLE)) delete (PEOPLE as any)[k]
  Object.assign(PEOPLE, p0); indexCallsigns()
  DAYS.length = 0; JSON.parse(DAYS0).forEach((d: any) => DAYS.push(d))
  INPUTS.length = 0; JSON.parse(INPUTS0).forEach((i: any) => INPUTS.push(i))
  NOTICES.length = 0
  SCHED.pending = {}; SCHED.changes = {}; SCHED.added = {}; SCHED.als = []
  SCHED.al = 0; SCHED.dayOK = {}; SCHED.sign = {}; SCHED.orig = {}; SCHED.cur = {}
  SCHED.signBind = {}; SCHED.drafts = {}; SCHED.curDraft = {}; SCHED.retired = {}; SCHED.correcting = {}
  stashClear()
  lwInitStore(memoryBackend())
  raptorInitStore()
  accountsLoad()
  setPeople(projectPeople())
  wireLeaveWarSync()
  _resetTimeline(); installGlobalUndo()
  signInAs('ad', 'a')
  setInpEdit(null)
  HOOKS.toast = () => {}
})
afterEach(() => { cleanup(); _resetFloatWins(); setInpEdit(null); HOOKS.toast = realToast; resetSession(null); vi.restoreAllMocks() })

/* Hex SANS from Fri 24 Jul, Ranger from Fri 17; Saber files one offer for both, Fri 24 – Sat 25; then its start is moved to
   Thu 23, a day before Hex's SANS date. Refused whole by either door: nothing saved, the offer still from Fri 24. */
const setUp = () => {
  expect(postOut('rocky', FRI24, 'sans')).toBe(true)
  expect(postOut('bane', FRI, 'sans')).toBe(true); raptorNotify()
  expect(commitInput(null, draft(FRI24, SAT25), ['rocky', 'bane'])).toBe(true)
  const rec = shared(); expect(rec).toBeTruthy(); expect(rec.date).toBe('Jul 24')
  return rec
}
describe('a shared SANS offer moved before one man\'s SANS date is refused, never trimmed (D2394 Q10)', () => {
  it('the shared door — the input window\'s path for a record of several', () => {
    const rec = setUp()
    expect(commitInput(rec, { ...draftOf(rec), start: THU23 }, ['rocky', 'bane'])).toBe(false)
    expect(rec.date).toBe('Jul 24')
    expect(idsOf(rec).map(String).sort()).toEqual(['bane', 'rocky'])
  })
  it('the one-record door — held by the cut\'s own "never a record of several" guard', () => {
    const rec = setUp()
    expect(commitInputEdit(rec, { ...draftOf(rec), start: THU23 })).toBe(false)
    expect(rec.date).toBe('Jul 24')
    expect(idsOf(rec).map(String).sort()).toEqual(['bane', 'rocky'])
  })
})
