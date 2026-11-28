// @vitest-environment jsdom
/* THE NO-PERIOD SENTENCE JOINED TO THE DAY'S PUBLISH NOTE (his D2521, the slip S2 — "a sentence of its own after the
   publish note"; the words file: "Joined after another line it follows as its own sentence, as the unanswered-OIL line
   does"). Found by the fresh, blind Opus read of round 4's build (chat 170, its finding 1): behind the day's "no usable
   times" line the batched note read "…earns OIL. · No Leave War period for 2028…" — a full stop and then the dot. The
   real note batcher and the real note element, not a stand-in. */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { INPUTS, DATES } from '../engine/inputs'
import { DAYS } from '../engine/data'
import { SCHED, signOf, setDayApproved } from '../engine/publish'
import { stashClear } from '../engine/weekstash'
import { initStore as raptorInitStore, loadWeek } from '../state/store'
import { projectPeople } from './state/raptorRoster'
import { initStore as lwInitStore, setPeople } from './state/store'
import { memoryBackend } from './state/storage'
import { installAbsenceDoor, publishFlagsBids } from './sync'
import { HOOKS } from '../engine/hooks'
import { toast as realToast, toastBatch } from '../ui/toast'

const ISNAP = JSON.stringify(INPUTS)
const DSNAP = JSON.stringify(DAYS)
beforeEach(() => {
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  SCHED.pending = {}; SCHED.changes = {}; SCHED.added = {}; SCHED.als = []
  SCHED.al = 0; SCHED.dayOK = {}; SCHED.sign = {}; SCHED.orig = {}; SCHED.cur = {}
  stashClear(); raptorInitStore(); lwInitStore(memoryBackend()); setPeople(projectPeople())
})
afterEach(() => { loadWeek('13/07/2026') })
const sign = (di: number) => { const g = signOf(di); g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump' }

describe('publishing a day no leave war period covers: the sentence joined to the publish note (D2521)', () => {
  it('behind the day\'s "no usable times" line it follows as a sentence of its own — a full stop, never ". ·"', () => {
    installAbsenceDoor()
    loadWeek('07/02/2028')
    const sat = DATES.findIndex((d: any) => /Feb 12/.test(String(d)))
    ;(DAYS[sat] as any).ground = [
      { prog: 'SDO', str: '0800', end: '1800', who: 'plasma' },
      { prog: 'RUNNER', str: '0900', end: '0900', who: 'bane' },
    ]
    const shown: string[] = []
    const realHook = HOOKS.toast, realBatch = HOOKS.toastBatch
    const calls: any[] = []
    HOOKS.toast = ((m: any, k: any, p: any) => { calls.push([m, k, p]); realToast(m, k, p) }) as any
    HOOKS.toastBatch = toastBatch as any
    try {
      sign(sat)
      HOOKS.toastBatch(() => { setDayApproved(sat, true); publishFlagsBids(sat) })
    } finally { HOOKS.toast = realHook; HOOKS.toastBatch = realBatch }
    const el = document.getElementById('toastEl')
    shown.push(el ? String(el.textContent) : '(no toast element)')
    expect(calls.length, 'the publish spoke').toBeGreaterThan(0)
    expect(shown[0]).toBe('Saturday 12 Feb published and approved. The ground programme has no usable times, so nobody on it earns OIL. No Leave War period for 2028, so no OIL can be earned for this day. Create the period on the Leave War.')
  })
})
