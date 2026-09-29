// @vitest-environment jsdom
/* [AMEND-SMALL-SEEN] 1 (28 Sep 26) — ONE PRESS, ONE MESSAGE. The toast is a single element whose text is replaced, so a
   weekend publish that then raised the OIL check's warning showed only the warning: "Published AL1 · 14 items on Sat
   only" was never seen (the amendment re-test's walker W1). The publish command now says both, in one line
   (ui/toast.ts toastBatch through HOOKS.toastBatch, state/sched-commit.ts commitPublish). Scoped: every other toast keeps
   "the last one wins" — a rolled-back save must never read "… removed · That did not save" (Astra 03). */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { toast, toastBatch, clearToast } from './toast'
import { HOOKS } from '../engine/hooks'
import { INPUTS } from '../engine/inputs'
import { DAYS } from '../engine/data'
import { SCHED, signOf } from '../engine/publish'
import { stashClear } from '../engine/weekstash'
import { initStore } from '../state/store'
import { setSession } from '../state/auth'
import { commitSetDayApproved } from '../state/sched-commit'
import { setPublishGate } from '../state/inputgate-hook'

const face = () => (document.getElementById('toastEl') as HTMLElement | null)
const text = () => face()?.textContent || ''
const tint = () => face()?.style.color || ''

describe('toastBatch — the toast module', () => {
  afterEach(() => clearToast())
  it('joins every message said inside it, in order, into ONE line, when it returns', () => {
    toastBatch(() => { toast('Published AL1 · 3 items on Sat only', undefined); toast('the SXO desk has no usable times', 'warn') })
    expect(text()).toBe('Published AL1 · 3 items on Sat only · the SXO desk has no usable times')
  })
  it('says a repeat once, and keeps the strongest colour any message asked for', () => {
    toastBatch(() => { toast('A', undefined); toast('B', 'warn'); toast('A', undefined) })
    expect(text()).toBe('A · B')
    expect(tint(), 'amber, because one of them was a warning').toBe('var(--adv)')
    toastBatch(() => { toast('C', 'warn'); toast('D', 'hard') })
    expect(tint(), 'red beats amber').toBe('var(--hard)')
  })
  it('a throw inside drops what was said (the command rolled back — none of it is true) and the error goes on', () => {
    toast('before', undefined)
    expect(() => toastBatch(() => { toast('Published AL1', undefined); throw new Error('rolled back') })).toThrow('rolled back')
    expect(text(), 'the rolled-back publish never speaks').toBe('before')
  })
  it('OUTSIDE a batch nothing changes: the last message still wins', () => {
    toast('first', undefined); toast('second', 'warn')
    expect(text()).toBe('second')
  })
  it('a batch inside a batch is the outer one\'s', () => {
    toastBatch(() => { toast('outer', undefined); toastBatch(() => toast('inner', undefined)); toast('after', undefined) })
    expect(text()).toBe('outer · inner · after')
  })
  it('a batch with nothing said leaves the toast alone', () => {
    toast('earlier', undefined)
    toastBatch(() => 1)
    expect(text()).toBe('earlier')
  })
})

describe('the publish says what it published AND what the OIL check found — one line', () => {
  const ISNAP = JSON.stringify(INPUTS), DSNAP = JSON.stringify(DAYS)
  const keep = { toast: HOOKS.toast, batch: HOOKS.toastBatch }
  beforeEach(() => {
    INPUTS.length = 0; JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
    DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
    SCHED.pending = {}; SCHED.changes = {}; SCHED.added = {}; SCHED.als = []
    SCHED.al = 0; SCHED.dayOK = {}; SCHED.sign = {}; SCHED.orig = {}; SCHED.cur = {}
    stashClear()
    setSession({ user: 'ad', role: 'admin' })
    initStore()
    HOOKS.toast = toast; HOOKS.toastBatch = toastBatch   // as main.tsx wires them
  })
  afterEach(() => { setPublishGate(null); HOOKS.toast = keep.toast; HOOKS.toastBatch = keep.batch; clearToast() })
  const sign = (di: number) => { const g = signOf(di); g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump' }

  it('Publish day on Saturday, with the check raising a warning: both facts are on the screen', () => {
    setPublishGate(() => HOOKS.toast('Saturday 18 Jul: the SXO desk has no usable times, so nobody on it earns OIL', 'warn'))
    sign(5)
    commitSetDayApproved(5, true)
    expect(SCHED.dayOK[5], 'the day was published').toBeTruthy()
    const t = text()
    expect(t, 'the publish is still said').toMatch(/Saturday|Sat/)
    expect(t, 'what it published').not.toBe('Saturday 18 Jul: the SXO desk has no usable times, so nobody on it earns OIL')
    expect(t, 'and the warning beside it').toContain('nobody on it earns OIL')
    expect(tint(), 'in the warning\'s colour').toBe('var(--adv)')
  })
  it('with nothing for the check to say, the publish reads as it always did', () => {
    setPublishGate(() => {})
    sign(5)
    commitSetDayApproved(5, true)
    expect(text()).not.toContain(' · nobody')
    expect(text().length).toBeGreaterThan(0)
  })
})
