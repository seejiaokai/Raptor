// @vitest-environment jsdom
/* [HUMAN-RETEST] the amendment system (24 Sep 26) — the gaps the re-test found, each
   pinned through the production functions the screens call. The rules they enforce are
   lines of raptor-port/docs/superpowers/specs/2026-09-24-amendment-behaviour-register.md
   (the AM ids); the walk that found them is raptor-port/docs/handpass/2026-09-24-amendment.md.

   · AM24 — "Not yet signed" shows on the WORKING copy of a published day with unpublished
     changes, never on the issued face. The week's day head drew it; the scheduler board —
     the other working-copy surface of the same day — did not (roll-call R4, walk S5;
     Fable 5-5, Astra F1).
   · AM23 — every count of a day's unpublished changes agrees. The day head counts the
     real difference from the issued version; the ⓘ day panel and the plan-switch message
     counted raw marks, so an OIL-only change read "nothing pending" there while "Publish
     AL1" was offered, and a mark left behind by a round trip read as an edit that is not
     there (walk S3; Fable 5-2, Astra F2).
   · "Discard marks" only ever clears marks on days never published (F-01, Phase 2): it
     was enabled — and said "Pending marks cleared" — when every mark sat on a published
     day and nothing could be cleared (walk S2; Fable 5-1, Astra F3).
   · RESTARM / UNPUBARM are one-shot confirms that "any navigation clears": a page change
     (and so the admin's View-as-member flip, which changes page) left them armed, so the
     second tap after coming back skipped the warning (walk S13; Fable 5-8, Astra rank 33). */
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { DAYS } from '../engine/data'
import { INPUTS } from '../engine/inputs'
import { SCHED, signOf, setDayApproved, dayDelta, dayPendCount } from '../engine/publish'
import { acceptInput, unacceptInput } from '../engine/slots'
import { ensureRowIds } from '../engine/rowids'
import { validate } from '../engine/validate'
import { HOOKS } from '../engine/hooks'
import { initStore, notify, writeText } from '../state/store'
import { setSession } from '../state/auth'
import {
  setPage, DPREV, VWORK, setUnpubArm, unpubArmed, setRestArm, restArmed,
} from '../state/view'
import { dayHTML, dayInfoHTML, viewDayHTML } from './html'
import { boardSignHTML, switchDraft } from './board'
import { draftDup, dayDrafts } from '../engine/drafts'
import { setOilBlanket } from './oilmode'
import { ALPanel } from './ALPanel'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

const MON = 0, SAT = 5, SAT_ISO = '2026-07-18'
let pristine: any[], inputs0: string
const sign = (di: number) => { const g = signOf(di); g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump' }
const publishDay = (di: number) => { sign(di); setDayApproved(di, true) }
const el = (html: string) => { const d = document.createElement('div'); d.innerHTML = html; return d }
const weekEdit = (di: number) => { setPage('editsched'); return el(dayHTML(di, true, true)) }
const boardStrip = (di: number) => { setPage('editsched'); return el(boardSignHTML(di)) }
const weekView = (di: number) => { setPage('viewsched'); try { return el(viewDayHTML(di)) } finally { setPage('editsched') } }
/* the ⓘ panel's own "N unpublished edit(s)" chip — the number a scheduler reads there */
const infoCount = (di: number) => {
  const t = el(dayInfoHTML(di)).querySelector('.dip-pend')?.textContent || ''
  return t ? parseInt(t, 10) : 0
}
/* the day head's own "N pending" chip */
const headCount = (di: number) => {
  const t = weekEdit(di).querySelector('.dpend')?.textContent || ''
  return t ? parseInt(t, 10) : 0
}
const withToasts = (fn: () => void) => {
  const said: string[] = []
  const real = HOOKS.toast
  HOOKS.toast = (m: any) => { said.push(String(m)) }
  try { fn() } finally { HOOKS.toast = real }
  return said
}

beforeAll(() => {
  initStore()
  setSession({ user: 'ad', role: 'admin' } as any)
  pristine = JSON.parse(JSON.stringify(DAYS))
  inputs0 = JSON.stringify(INPUTS)
})
beforeEach(() => {
  DAYS.length = 0; JSON.parse(JSON.stringify(pristine)).forEach((d: any) => DAYS.push(d))
  INPUTS.length = 0; JSON.parse(inputs0).forEach((i: any) => INPUTS.push(i))
  SCHED.pending = {}; SCHED.changes = {}; SCHED.added = {}; SCHED.als = []
  SCHED.al = 0; SCHED.dayOK = {}; SCHED.sign = {}; SCHED.signBind = {}; SCHED.orig = {}; SCHED.cur = {}
  SCHED.drafts = {}; SCHED.curDraft = {}; SCHED.retired = {}; SCHED.correcting = {}
  DPREV.clear(); VWORK.clear()
  setUnpubArm(null); setRestArm(null, null)
  setPage('editsched')
  validate()
})

describe('AM24 — "Not yet signed" is drawn on EVERY working-copy surface of a published day (walk S5)', () => {
  it('the scheduler board carries it whenever the week head does', () => {
    publishDay(MON)
    expect(weekEdit(MON).querySelector('.nysmark'), 'no unpublished change yet → no marker').toBeNull()
    expect(boardStrip(MON).querySelector('.nysmark')).toBeNull()
    writeText(`dn:${MON}.0`, 'A CHANGE AFTER PUBLISHING')
    expect(weekEdit(MON).querySelector('.nysmark'), 'the week head shows it').toBeTruthy()
    expect(boardStrip(MON).querySelector('.nysmark'), 'and so must the board — the same working copy').toBeTruthy()
  })
  it('never on the issued face the squadron sees, and never under a preview of an older version', () => {
    publishDay(MON)
    writeText(`dn:${MON}.0`, 'A CHANGE AFTER PUBLISHING')
    expect(weekView(MON).querySelector('.nysmark'), 'the view page defaults to the issued face').toBeNull()
    VWORK.add(MON)
    expect(weekView(MON).querySelector('.nysmark'), 'the viewer\'s own Working-draft peek does show it').toBeTruthy()
    VWORK.clear()
    /* under a preview the board passes pv (SchedBoard.tsx) and draws no publish strip;
       the week draws the previewed version through withDaySnap, where PV is set */
    DPREV.set(MON, SCHED.orig[MON].id)
    try {
      expect(el(boardSignHTML(MON, true)).querySelector('.nysmark'), 'the board, as SchedBoard calls it under a preview').toBeNull()
    } finally { DPREV.clear() }
  })
})

describe('AM23 — every count of a day\'s unpublished changes agrees with the day head (walk S3)', () => {
  let saved: any
  beforeEach(() => {
    saved = { day: HOOKS.oilEarningDay, iso: HOOKS.oilDayISO }
    HOOKS.oilEarningDay = (di: number) => di === SAT
    HOOKS.oilDayISO = (di: number) => (di === SAT ? SAT_ISO : '')
  })
  afterEach(() => { HOOKS.oilEarningDay = saved.day; HOOKS.oilDayISO = saved.iso })

  it('an OIL-only change: the ⓘ panel counts it, as the head and "Publish AL1" do', () => {
    ;(DAYS[SAT] as any).ground = [{ prog: 'FAMILY DAY', str: '09:00', end: '17:00', who: 'bane' }]
    ensureRowIds(DAYS)
    publishDay(SAT)
    setOilBlanket(SAT, true)                       // the ONLY change: nothing on this day earns
    expect(dayDelta(SAT).length, 'a real difference from the issued version').toBe(1)
    expect(headCount(SAT)).toBe(1)
    expect(infoCount(SAT), 'the ⓘ panel must not say there is nothing unpublished').toBe(1)
  })

  it('a filing round trip that nets to nothing: the ⓘ panel does not count the leftover mark', () => {
    const inp = INPUTS.find((x: any) => x.type === 'Meeting' && x.date === 'Jul 13')!
    /* park it before publishing: the demo's boot lands activity inputs on the programme, so
       it may already be accepted ('g'); either way it ends parked ('r') */
    if (!inp.acc) expect(acceptInput(MON, inp, 'u')).toBe(true)
    expect(unacceptInput(MON, inp)).toBe(true)
    expect(inp.acc).toBe('r')
    publishDay(MON)                                 // the issued version froze the parked state
    expect(acceptInput(MON, inp, 'u')).toBe(true)   // the round trip, after publishing
    expect(unacceptInput(MON, inp)).toBe(true)
    expect(dayDelta(MON).length, 'nothing differs from what was issued').toBe(0)
    expect(dayPendCount(MON), 'a raw mark is left behind (inert, by design)').toBeGreaterThan(0)
    expect(headCount(MON)).toBe(0)
    expect(infoCount(MON), 'so the ⓘ panel must not report an unpublished edit').toBe(0)
  })

  it('switching plans on a published day reports the same number the day head shows', () => {
    ;(DAYS[SAT] as any).ground = [{ prog: 'FAMILY DAY', str: '09:00', end: '17:00', who: 'bane' }]
    ensureRowIds(DAYS)
    publishDay(SAT)
    draftDup(SAT)                                   // Plan A (= the issued day) stowed, Plan B live
    setOilBlanket(SAT, true)                        // Plan B differs ONLY in what the day earns
    const [a] = dayDrafts(SAT)
    const toA = withToasts(() => { switchDraft(SAT, a.id) })
    expect(toA.join(' '), 'back on Plan A: it matches the issued Original').toMatch(/matches ORIG|matches Original|nothing pending/i)
    const b = dayDrafts(SAT).find((t: any) => t.id !== a.id)!
    const toB = withToasts(() => { switchDraft(SAT, b.id) })
    expect(headCount(SAT), 'Plan B carries one real difference').toBe(1)
    expect(toB.join(' '), 'and the switch message must say so, not "nothing pending"').not.toMatch(/nothing pending/i)
    expect(toB.join(' ')).toMatch(/1 difference/)
  })
})

describe('"Discard marks" offers only what it can clear (walk S2)', () => {
  let host: HTMLDivElement, root: Root
  beforeAll(() => { host = document.createElement('div'); document.body.appendChild(host); root = createRoot(host) })
  afterAll(() => { act(() => root.unmount()); host.remove() })
  const render = () => act(() => { root.render(<ALPanel />); notify() })
  const btn = () => host.querySelector('#alDrop') as HTMLButtonElement

  it('is disabled when every mark sits on a published day — it cannot clear those', async () => {
    publishDay(MON)
    writeText(`dn:${MON}.0`, 'A CHANGE AFTER PUBLISHING')
    await render()
    expect(btn().disabled, 'nothing here is discardable: the change is ahead of an issued day').toBe(true)
    expect(host.querySelector('.al-pend')!.textContent).not.toMatch(/unpublished days/i)
  })
  it('clears only the draft day\'s marks when both kinds exist, and says how many', async () => {
    publishDay(MON)
    writeText(`dn:${MON}.0`, 'A CHANGE AFTER PUBLISHING')
    writeText(`dn:2.0`, 'DRAFT WORK ON WEDNESDAY')   // Wednesday was never published
    await render()
    expect(btn().disabled).toBe(false)
    const said = withToasts(() => act(() => { btn().click() }))
    expect(Object.keys(SCHED.pending).some(k => k.startsWith('dn:2.')), 'the draft mark is gone').toBe(false)
    expect(Object.keys(SCHED.pending).some(k => k.startsWith(`dn:${MON}.`)), 'the published day keeps its change').toBe(true)
    expect(said.join(' ')).toMatch(/1\b/)
  })
})

describe('the one-shot confirms clear on any navigation (walk S13)', () => {
  it('a page change drops an armed Unpublish and an armed Load', () => {
    setPage('editsched')
    setUnpubArm(SAT)
    setRestArm(MON, 'x')
    setPage('viewsched')                            // the View-as-member flip lands here too
    setPage('editsched')
    expect(unpubArmed(SAT), 'coming back must ask again before withdrawing OIL').toBe(false)
    expect(restArmed(MON, 'x')).toBe(false)
  })
  it('re-rendering the same page does not drop them (a stay is not a navigation)', () => {
    setPage('editsched')
    setUnpubArm(SAT)
    setPage('editsched')
    expect(unpubArmed(SAT)).toBe(true)
  })
})
