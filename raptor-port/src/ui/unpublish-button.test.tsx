// @vitest-environment jsdom
/* [GLOBAL-UNDO] §6.4 — the Unpublish BUTTON's visibility gate + its §6.6 confirm
   face. The forward command itself is covered in state/unpublish-commit.test.ts;
   this pins the day-header rendering: the button shows only on the edit surface of a
   published day that is not being previewed, and wears the amber confirm face while
   armed. */
import { beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from '../engine/data'
import { INPUTS } from '../engine/inputs'
import { SCHED, signOf, dayApproved, dayCurVer } from '../engine/publish'
import { initStore } from '../state/store'
import { commitSetDayApproved } from '../state/sched-commit'
import { setSession } from '../state/auth'
import * as view from '../state/view'
import { _resetDisclosure } from '../state/disclosure'
import { dayStatHTML } from './html'

const DSNAP = JSON.stringify(DAYS)
const ISNAP = JSON.stringify(INPUTS)
const sign = (di: number) => { const g = signOf(di); g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump' }

beforeEach(() => {
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((i: any) => INPUTS.push(i))
  SCHED.pending = {}; SCHED.changes = {}; SCHED.added = {}; SCHED.als = []
  SCHED.al = 0; SCHED.dayOK = {}; SCHED.sign = {}; SCHED.orig = {}; SCHED.cur = {}
  SCHED.signBind = {}; SCHED.drafts = {}; SCHED.curDraft = {}; SCHED.retired = {}; SCHED.correcting = {}
  setSession({ user: 'ad', role: 'admin' })
  view.selDrop(); view.armDrop(); view.setUnpubArm(null)
  view.DPREV.clear()
  initStore()
  _resetDisclosure()
})

describe('the Unpublish button visibility gate (§6.4 / C10) (AM37c)', () => {
  it('appears on the edit surface of a published day (AM32)', () => {
    sign(0); commitSetDayApproved(0, true)
    expect(dayApproved(0)).toBe(true)
    expect(dayStatHTML(0, true)).toContain('data-unpub="0"')
  })

  it('is absent on a still-draft day', () => {
    expect(dayApproved(1)).toBe(false)
    expect(dayStatHTML(1, true)).not.toContain('data-unpub')
  })

  it('is absent on the read-only (view) surface of a published day', () => {
    sign(0); commitSetDayApproved(0, true)
    expect(dayStatHTML(0, false)).not.toContain('data-unpub')
  })

  it('is hidden while previewing an older version of a published day', () => {
    sign(0); commitSetDayApproved(0, true)
    view.setDayPreview(0, dayCurVer(0))          // a preview is up on day 0
    expect(dayStatHTML(0, true)).not.toContain('data-unpub')
  })
})

describe('the §6.6 confirm face', () => {
  it('reads "Unpublish" at rest and "Withdraw — confirm" while armed', () => {
    sign(0); commitSetDayApproved(0, true)
    expect(dayStatHTML(0, true)).toContain('>Unpublish<')

    view.setUnpubArm(0)
    const armed = dayStatHTML(0, true)
    expect(armed).toContain('dunpub warn')
    expect(armed).toContain('Withdraw — confirm')
  })
})
