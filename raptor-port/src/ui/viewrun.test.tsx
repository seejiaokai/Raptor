/* [CRP-FLAG] Item 2 (owner 16 Sep 26). A 7-day run that busts on a DRAFT day
   because of a PUBLISHED neighbour must still flag on the VIEW-ONLY schedule —
   an unpublished working-copy fix (removing the man from a published day's live
   copy) must NOT hide the breach the issued schedule still carries. The edit
   week stays working-driven (the scheduler's live preview of that fix).

   Scenario: Warden on the programme all 7 days; Mon+Tue PUBLISHED with Warden;
   then Warden removed from Monday's WORKING copy. The published truth (Mon+Tue
   issued + Wed–Sun draft) runs 7 straight and busts SUNDAY. The working copy
   (Monday cleared) tops out at 6 — no breach. */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { initStore, loadWeek } from '../state/store'
import { DAYS } from '../engine/data'
import { validate } from '../engine/validate'
import { SCHED, signOf, setDayApproved } from '../engine/publish'
import { dayHTML, viewDayHTML } from './html'
import { DWOPEN } from '../state/view'

/* @vitest-environment jsdom */

const WARDEN = 'nact'
const sign = (di: number) => { const g = signOf(di); g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump' }
const RUN = /days in a row/
function resetSched() {
  SCHED.pending = {}; SCHED.changes = {}; SCHED.added = {}; SCHED.als = []
  ;(SCHED as any).al = 0; SCHED.dayOK = {}; SCHED.sign = {}; SCHED.orig = {}; SCHED.cur = {}
  SCHED.drafts = {}; (SCHED as any).curDraft = {}
}

function setup() {
  for (let i = 0; i < 7; i++) {
    ;(DAYS[i] as any).allhands = (DAYS[i] as any).allhands || []
    ;(DAYS[i] as any).allhands.push({ prog: 'SODB', str: '07:45', end: '17:00', who: WARDEN })
  }
  validate()
  sign(0); setDayApproved(0, true); sign(1); setDayApproved(1, true)   // publish Mon+Tue WITH Warden
  ;(DAYS[0] as any).allhands = (DAYS[0] as any).allhands.filter((x: any) => x.who !== WARDEN)  // remove from Monday working
  validate()
}

beforeEach(() => { initStore(); loadWeek('13/07/2026'); resetSched(); DWOPEN.add(6) })
afterEach(() => { DWOPEN.clear(); resetSched(); loadWeek('13/07/2026') })

describe('view-only shows a published-truth run breach on a draft day', () => {
  it('the view render of the draft Sunday carries the 7-day breach', () => {
    setup()
    expect(viewDayHTML(6), 'view-only Sunday flags the published breach').toMatch(RUN)
  })

  it('the working (edit) render of the draft Sunday does NOT — the pending fix clears it there', () => {
    setup()
    expect(dayHTML(6, true, true), 'edit Sunday reflects the live working fix').not.toMatch(RUN)
  })

  /* the fix is NOT run-specific: withOfficialWarn swaps the WHOLE warning bundle,
     so every cross-day rule on a view-only draft day is judged in the published
     world. Crew rest across a published→draft boundary is the same shape. */
  it('generalises to crew rest: a published Monday late duty busts a draft Tuesday on view-only; the working fix clears edit', () => {
    ;(DAYS[0] as any).dutywaves = [{ label: 'Duty', rows: [{ role: 'SDO', id: WARDEN, str: '15:00', end: '23:00' }] }]   // Monday late duty
    ;(DAYS[1] as any).waves = [{ kind: 'fly', formations: [{ to: '06:00', ld: '07:25', br: '', aircraft: [{ p: '', w: WARDEN }] }] }]  // Tuesday early report → breach off Monday 23:00 (clear 11:00)
    validate()
    sign(0); setDayApproved(0, true)          // publish Monday WITH the late duty
    ;(DAYS[0] as any).dutywaves = []          // working fix: remove the duty from Monday
    validate()
    DWOPEN.add(1)
    expect(viewDayHTML(1), 'view-only Tuesday still flags crew rest off the published Monday').toMatch(/crew rest/i)
    expect(dayHTML(1, true, true), 'edit Tuesday is clear — the working fix removed the duty').not.toMatch(/crew rest/i)
  })

  it('with nothing published/diverging, the view render is unchanged (aliased no-op)', () => {
    // Warden on all 7, nothing signed → OFFICIAL aliases WORKING; the breach is genuine on Sunday
    for (let i = 0; i < 7; i++) {
      ;(DAYS[i] as any).allhands = (DAYS[i] as any).allhands || []
      ;(DAYS[i] as any).allhands.push({ prog: 'SODB', str: '07:45', end: '17:00', who: WARDEN })
    }
    validate()
    expect(viewDayHTML(6)).toBe(dayHTML(6, false))   // no divergence → identical to the plain working render
  })
})
