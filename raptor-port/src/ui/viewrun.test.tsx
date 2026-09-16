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
import { validate, withOfficialWarn } from '../engine/validate'
import { SCHED, signOf, setDayApproved } from '../engine/publish'
import { dayHTML, viewDayHTML, dayInfoHTML } from './html'
import { DWOPEN, WFOCUS, VWORK, PFOCUS, SELID, displayedByDay, dayDisplaysOfficial, focusWarn, selectPerson, setPage } from '../state/view'

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

  /* CRP-I2-001 (Codex): the CLICK/FOCUS accessor must resolve against the SAME world
     the day renders, or an official-only warning's severity-sorted index lands on an
     unrelated WORKING warning at that index. */
  it('displayedByDay mirrors viewDayHTML: the view-page draft Sunday resolves the OFFICIAL run breach, and focus lands on Warden', () => {
    setup()
    setPage('viewsched')
    try {
      const g = displayedByDay(6)
      const ix = (g.warns as any[]).findIndex((w: any) => w.code === 'DAYS_RUN' && (w.who || []).includes(WARDEN))
      expect(ix, 'the view-page draft Sunday resolves the OFFICIAL run breach').toBeGreaterThanOrEqual(0)
      focusWarn(6, ix)
      expect(WFOCUS && (WFOCUS as any).ids.includes(WARDEN), 'focus lands on Warden, not a working-index collision').toBe(true)
    } finally { setPage('editsched') }
  })

  it('on the EDIT page the same draft Sunday resolves WORKING (no run breach) — the pending fix', () => {
    setup()
    setPage('editsched')
    const g = displayedByDay(6)
    expect((g.warns as any[]).some((w: any) => w.code === 'DAYS_RUN' && (w.who || []).includes(WARDEN)), 'edit resolves the working world').toBe(false)
  })

  /* CRP-I2-002 (Codex): the day-details modal (dayInfoHTML) must resolve warnings in the
     displayed world, or the view-page draft Sunday's details say "clean" while the week
     flags the breach. The modal calls: dayDisplaysOfficial(di) ? withOfficialWarn(...) : ... */
  const modalBody = (di: number) => dayDisplaysOfficial(di) ? withOfficialWarn(() => dayInfoHTML(di)) : dayInfoHTML(di)
  it('the day-details panel for the view-page draft Sunday shows the breach, not "clean"', () => {
    setup()
    setPage('viewsched')
    try {
      expect(modalBody(6), 'details show the official run breach').toMatch(RUN)
      expect(modalBody(6), 'not the clean line').not.toContain('this day is clean')
    } finally { setPage('editsched') }
  })
  it('on the EDIT page the same details panel reads WORKING (clean — the pending fix)', () => {
    setup()
    setPage('editsched')
    expect(modalBody(6), 'edit details reflect the working fix').not.toMatch(RUN)
  })

  /* CRP-I2-R2-001 (Codex re-inspect): VWORK is an approved-day affordance; a DRAFT day
     renders OFFICIAL regardless of VWORK (a stale entry can outlive an undo past
     publication). dayDisplaysOfficial must mirror viewDayHTML, not reject VWORK wholesale. */
  it('a stale VWORK entry on a DRAFT day stays OFFICIAL — displayedByDay mirrors viewDayHTML', () => {
    setup()
    setPage('viewsched')
    try {
      VWORK.add(6)
      expect(dayDisplaysOfficial(6), 'a draft day ignores VWORK, stays official').toBe(true)
      expect(viewDayHTML(6), 'viewDayHTML agrees — still the breach').toMatch(RUN)
      expect((displayedByDay(6).warns as any[]).some((w: any) => w.code === 'DAYS_RUN' && (w.who || []).includes(WARDEN)), 'click resolves official too').toBe(true)
    } finally { VWORK.delete(6); setPage('editsched') }
  })

  /* ITEM 3 (R3-004): clicking the PUCK to select the person must light his warning days
     in the DISPLAYED world too. On the view page selecting Warden should light Sunday (the
     official run breach) — the working world (which the edit page shows) has no breach there. */
  it('selecting the man on the VIEW page lights his OFFICIAL breach day (Sunday)', () => {
    setup()
    setPage('viewsched')
    try {
      if (SELID === WARDEN) selectPerson(WARDEN, true)   // ensure deselected
      selectPerson(WARDEN, true)
      expect(PFOCUS && (PFOCUS as any).days.includes(6), 'the official run breach day is lit').toBe(true)
    } finally { if (SELID === WARDEN) selectPerson(WARDEN, true); setPage('editsched') }
  })

  it('selecting the man on the EDIT page does NOT light Sunday — working has no breach (the pending fix)', () => {
    setup()
    setPage('editsched')
    try {
      if (SELID === WARDEN) selectPerson(WARDEN, true)
      selectPerson(WARDEN, true)
      expect(PFOCUS && (PFOCUS as any).days.includes(6), 'edit resolves working — Sunday not lit').toBe(false)
    } finally { if (SELID === WARDEN) selectPerson(WARDEN, true) }
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
